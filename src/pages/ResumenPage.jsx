import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { MESES_ES, MESES_SHORT } from "../lib/constants.js";
import { nowMes, nowAno, euros, calcGastosFijosMes, gastoProrrateadoEnMes, calcConsumoHistorico } from "../lib/helpers.js";

export function ResumenPage({userId,tractoras,semis}) {
  const[viajes,setViajes]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[gastosFijos,setGastosFijos]=useState([]);
  const[filtro,setFiltro]=useState("all");
  const[modalExport,setModalExport]=useState(false);
  const[expTipo,setExpTipo]=useState("todo");
  const[expPeriodo,setExpPeriodo]=useState(nowMes());

  useEffect(()=>{
    Promise.all([sb.from("viajes").select("*").order("fecha",{ascending:false}),sb.from("gastos").select("*").order("fecha",{ascending:false}),sb.from("gastos_fijos").select("*").eq("user_id",userId)]).then(([{data:v},{data:g},{data:gf}])=>{setViajes(v||[]);setGastos(g||[]);setGastosFijos(gf||[]);});
  },[]);

  const exportarExcel=()=>{
    const esAno=expPeriodo.length===4;
    const vFilt=viajes.filter(v=>esAno?v.fecha?.startsWith(expPeriodo):v.fecha?.startsWith(expPeriodo));
    const gFilt=gastos.filter(g=>esAno?g.ano===expPeriodo:g.mes===expPeriodo);
    const sep=";"; // punto y coma para Excel español
    const eur=n=>n?(parseFloat(n)||0).toFixed(2).replace(".",",")+"€":"0,00€";
    const fec=d=>d?d.split("-").reverse().join("/"):"";
    let csv="\uFEFF"; // BOM para Excel
    if(expTipo==="viajes"||expTipo==="todo"){
      csv+=`VIAJES${sep}${sep}${sep}${sep}${sep}${sep}${sep}${sep}\n`;
      csv+=`Fecha${sep}Origen${sep}Destino${sep}Cliente${sep}Km${sep}Precio cobrado${sep}IVA${sep}Peajes${sep}Tractora${sep}Semirremolque\n`;
      vFilt.forEach(v=>{
        const t=tractoras.find(x=>x.id===v.truck_id);
        const s=semis.find(x=>x.id===v.semi_id);
        csv+=`${fec(v.fecha)}${sep}${v.origen||""}${sep}${v.destino||""}${sep}${v.cliente||""}${sep}${v.km||0}${sep}${eur(v.precio)}${sep}${eur(v.iva_amount)}${sep}${eur(v.peaje)}${sep}${t?.matricula||""}${sep}${s?.matricula||""}\n`;
      });
      csv+=`${sep}${sep}${sep}TOTAL${sep}${vFilt.reduce((s,v)=>s+(parseFloat(v.km)||0),0)}${sep}${eur(vFilt.reduce((s,v)=>s+(parseFloat(v.precio)||0),0))}${sep}${eur(vFilt.reduce((s,v)=>s+(parseFloat(v.iva_amount)||0),0))}${sep}${eur(vFilt.reduce((s,v)=>s+(parseFloat(v.peaje)||0),0))}\n`;
    }
    if(expTipo==="todo") csv+="\n";
    if(expTipo==="gastos"||expTipo==="todo"){
      csv+=`GASTOS VARIABLES${sep}${sep}${sep}${sep}\n`;
      csv+=`Fecha${sep}Tipo${sep}Importe${sep}Vehículo${sep}Litros${sep}€/Litro${sep}Nota\n`;
      gFilt.forEach(g=>{
        const veh=[...tractoras,...semis].find(x=>x.id===g.vehicle_id);
        csv+=`${fec(g.fecha)}${sep}${g.tipo||""}${sep}${eur(g.importe)}${sep}${veh?.matricula||"Sin asignar"}${sep}${g.litros||""}${sep}${g.precio_litro?eur(g.precio_litro):""}${sep}${g.nota||""}\n`;
      });
      csv+=`${sep}${sep}TOTAL${sep}${eur(gFilt.reduce((s,g)=>s+(parseFloat(g.importe)||0),0))}\n`;
    }
    const periodo=esAno?expPeriodo:MESES_ES[parseInt(expPeriodo.split("-")[1])-1]+"_"+expPeriodo.split("-")[0];
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`FlotaRentable_${expTipo}_${periodo}.csv`;a.click();
    setModalExport(false);
  };

  const totalFijosMes=calcGastosFijosMes(gastosFijos,tractoras,semis);

  const fV=filtro==="all"?viajes:filtro.startsWith("T_")||tractoras.find(t=>t.id===filtro)?viajes.filter(v=>v.truck_id===filtro):viajes.filter(v=>v.semi_id===filtro);

  const now=new Date();
  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const mv=fV.filter(v=>v.fecha?.startsWith(key));
    const ingresos=mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastosVar=gastos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,key),0);
    const ivaTotal=mv.filter(v=>v.tiene_iva).reduce((s,v)=>s+(parseFloat(v.iva_amount)||0),0);
    const beneficio=ingresos-gastosVar-totalFijosMes;
    months.push({label:`${MESES_SHORT[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,fullLabel:MESES_ES[d.getMonth()]+" "+d.getFullYear(),ingresos,gastosVar,beneficio,numViajes:mv.length,iva:ivaTotal,key});
  }

  const totalIng=months.reduce((s,m)=>s+m.ingresos,0);
  const totalBen=months.reduce((s,m)=>s+m.beneficio,0);
  const totalIVA=months.reduce((s,m)=>s+m.iva,0);
  const maxIng=Math.max(...months.map(m=>m.ingresos),1);

  const conjuntos=tractoras.map(t=>{
    const tV=viajes.filter(v=>v.truck_id===t.id);
    const semi=semis.find(s=>s.id===t.semi_habitual_id);
    const ingresos=tV.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastosT=gastos.filter(g=>g.vehicle_id===t.id).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const gastosS=semi?gastos.filter(g=>g.vehicle_id===semi.id).reduce((s,g)=>s+(parseFloat(g.importe)||0),0):0;
    const totalKm=tV.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    const consumoHist=calcConsumoHistorico(gastos,t.id);
    const rentables=tV.filter(v=>parseFloat(v.precio)>0).length;
    return{t,semi,ingresos,gastosT,gastosS,beneficio:ingresos-gastosT-gastosS,numViajes:tV.length,totalKm,consumo:consumoHist||(parseFloat(t.consumo_estimado)||null),rentables};
  });

  return(
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Resumen</div>
        <button className="btn bg bsm" onClick={()=>setModalExport(true)}><Icon d={I.arrow} size={14}/> Exportar</button>
      </div>
      <div style={{display:"flex",gap:"0.375rem",overflowX:"auto",paddingBottom:"0.25rem"}}>
        <button className={`btn bsm ${filtro==="all"?"bp":"bg"}`} onClick={()=>setFiltro("all")} style={{whiteSpace:"nowrap"}}>Toda la flota</button>
        {tractoras.map(t=><button key={t.id} className={`btn bsm ${filtro===t.id?"bp":"bg"}`} onClick={()=>setFiltro(t.id)} style={{whiteSpace:"nowrap"}}>🚛 {t.matricula||"Tractora"}</button>)}
        {semis.map(s=><button key={s.id} className={`btn bsm ${filtro===s.id?"bp":"bg"}`} onClick={()=>setFiltro(s.id)} style={{whiteSpace:"nowrap"}}>🔧 {s.matricula||"Semi"}</button>)}
      </div>

      <div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos 6m</div><div className="sval g">{euros(totalIng)}</div></div>
        <div className="stat"><div className="slbl">Beneficio 6m</div><div className={`sval ${totalBen>=0?"g":"r"}`}>{euros(totalBen)}</div></div>
      </div>

      {totalIVA>0&&<div style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.875rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontWeight:700,fontSize:"0.85rem"}}>IVA repercutido 6 meses</div><div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:2}}>Para tu declaración — consulta con tu gestor</div></div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.4rem",color:"var(--yellow)"}}>{euros(totalIVA)}</div>
      </div>}

      <div className="card">
        <div className="chd">Ingresos por mes</div>
        <div className="mchart-wrap">
          <div className="mchart">
            {months.map((m,i)=><div key={i} className="mbar" title={`${m.fullLabel}: ${euros(m.ingresos)}`} style={{height:`${Math.max((m.ingresos/maxIng)*56,3)}px`,background:m.beneficio>=0?"linear-gradient(180deg,#FF3D5A,#FF3D5A55)":"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>{months.map((m,i)=><span key={i} style={{fontSize:"0.58rem",color:"var(--muted)",flex:1,textAlign:"center"}}>{m.label}</span>)}</div>
        </div>
      </div>

      <div className="card">
        <div className="chd">Detalle mensual</div>
        <table className="mtable">
          <thead><tr><th>Mes</th><th>Ingresos</th><th>Beneficio</th><th>IVA</th></tr></thead>
          <tbody>{months.map((m,i)=><tr key={i}><td>{m.label}</td><td style={{color:"var(--green)",fontWeight:600}}>{euros(m.ingresos)}</td><td style={{color:m.beneficio>=0?"var(--green)":"var(--red)",fontWeight:600}}>{euros(m.beneficio)}</td><td style={{color:"var(--yellow)"}}>{m.iva>0?euros(m.iva):"—"}</td></tr>)}</tbody>
        </table>
      </div>

      {filtro==="all"&&conjuntos.length>0&&<div className="card">
        <div className="chd">Por vehículo</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {conjuntos.map((c,i)=>(
            <div key={i} style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",fontWeight:700,fontSize:"0.9rem"}}>
                <span>🚛 {c.t.matricula||"Sin mat."}</span>
                {c.semi&&<><span style={{color:"var(--muted)"}}>+</span><span>🔧 {c.semi.matricula}</span></>}
                {c.t.apodo&&<span style={{fontSize:"0.72rem",color:"var(--a2)"}}>"{c.t.apodo}"</span>}
              </div>
              <div className="sgrid" style={{gap:"0.375rem"}}>
                <div className="stat" style={{padding:"0.625rem"}}><div className="slbl">Ingresos</div><div className="sval g" style={{fontSize:"1.2rem"}}>{euros(c.ingresos)}</div></div>
                <div className="stat" style={{padding:"0.625rem"}}><div className="slbl">Beneficio</div><div className={`sval ${c.beneficio>=0?"g":"r"}`} style={{fontSize:"1.2rem"}}>{euros(c.beneficio)}</div></div>
              </div>
              <div style={{display:"flex",gap:"0.75rem",fontSize:"0.73rem",color:"var(--muted)",flexWrap:"wrap"}}>
                <span>{c.numViajes} viajes · {c.totalKm.toLocaleString("es-ES")} km</span>
                {c.consumo&&<span>Consumo: {c.consumo.toFixed(1)}L/100km</span>}
                <span>Gastos variables: {euros(c.gastosT+c.gastosS)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {modalExport&&<div className="ov" onClick={()=>setModalExport(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mdrag"/>
          <div className="mtitle">Exportar a Excel</div>
          <div className="fld"><label className="lbl">¿Qué quieres exportar?</label>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginTop:"0.25rem"}}>
              {[["todo","Viajes + Gastos (todo)"],["viajes","Solo viajes"],["gastos","Solo gastos"]].map(([v,l])=>(
                <div key={v} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:expTipo===v?"#ffffff15":"var(--s2)",border:`1px solid ${expTipo===v?"var(--a1)":"var(--border2)"}`,borderRadius:"var(--r2)",cursor:"pointer"}} onClick={()=>setExpTipo(v)}>
                  <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${expTipo===v?"var(--a1)":"var(--muted)"}`,background:expTipo===v?"var(--a1)":"transparent",flexShrink:0}}/>
                  <span style={{fontSize:"0.875rem",fontWeight:500}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="fld"><label className="lbl">De que periodo?</label>
            <select className="inp sel" value={expPeriodo} onChange={e=>setExpPeriodo(e.target.value)}>
              <optgroup label="Por mes">
                {Array.from({length:12},(_,i)=>{const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;return<option key={k} value={k}>{MESES_ES[d.getMonth()]} {d.getFullYear()}</option>;}).filter(Boolean)}
              </optgroup>
              <optgroup label="Por ano">
                {[nowAno(),String(parseInt(nowAno())-1)].map(a=><option key={a} value={a}>{a} (ano completo)</option>)}
              </optgroup>
            </select>
          </div>
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModalExport(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={exportarExcel}>Descargar Excel</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── INICIO PAGE ───────────────────────────────────────────────────────────────
