import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { MESES_ES } from "../lib/constants.js";
import { nowMes, euros, eurosKm, fmtDate, alertDays, alertColor, calcGastosFijosMes, gastoProrrateadoEnMes, calcConsumoHistorico, calcPrecioMedioGasoil, calcCosteKmEmpresa } from "../lib/helpers.js";

export function InicioPage({userId,tractoras,semis,perfil,esGerente,gastosTodos,viajesTodos,setViajesTodos,gastosFijos}) {
  const mesFiltro=nowMes();
  const[ultRegistros,setUltRegistros]=useState([]);

  useEffect(()=>{
    sb.from("viajes").select("*").order("fecha",{ascending:false}).then(({data})=>setViajesTodos(data||[]));
    Promise.all([
      sb.from("viajes").select("*").order("fecha",{ascending:false}).limit(5),
      sb.from("gastos").select("*").order("fecha",{ascending:false}).limit(5),
    ]).then(([{data:v},{data:g}])=>{
      const vItems=(v||[]).map(x=>({...x,_tipo:"viaje",_fecha:x.fecha}));
      const gItems=(g||[]).map(x=>({...x,_tipo:"gasto",_fecha:x.fecha}));
      const todos=[...vItems,...gItems].sort((a,b)=>new Date(b._fecha)-new Date(a._fecha)).slice(0,5);
      setUltRegistros(todos);
    });
  },[]);

  const tiempoRelativo=f=>{
    if(!f)return"";
    const diff=Math.floor((Date.now()-new Date(f+"T12:00:00"))/86400000);
    if(diff===0)return"Hoy";
    if(diff===1)return"Ayer";
    if(diff<7)return`Hace ${diff} dias`;
    return fmtDate(f);
  };

  if(tractoras.length===0&&esGerente)return(
    <div className="page fu">
      <div className="card"><div className="chd">Para empezar</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {[["1.","Añade tu tractora","Ve a Vehículos y registra tu vehículo"],["2.","Configura los gastos fijos","En Gastos, sección gastos fijos"],["3.","Registra tu primer viaje","Ruta, km y precio cobrado"]].map(([n,t,s])=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",padding:"0.875rem",background:"var(--s2)",borderRadius:"var(--r2)",border:"1px solid var(--border2)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.5rem",color:"var(--a1)",lineHeight:1,flexShrink:0}}>{n}</div>
              <div><div style={{fontWeight:600,fontSize:"0.875rem"}}>{t}</div><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:2}}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if(!esGerente&&viajesTodos.length===0&&gastosTodos.length===0)return(
    <div className="page fu">
      <div className="card" style={{background:"var(--s2)",border:"1px solid var(--border2)"}}>
        <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.25rem"}}>Hola, {perfil.nombre||"Chófer"} 👋</div>
        <div style={{fontSize:"0.82rem",color:"var(--muted)",marginBottom:"1rem"}}>Aún no tienes registros. Empieza añadiendo un viaje o un gasto.</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {[["1.","Registra un viaje","Ve a Viajes y añade tu ruta del día"],["2.","Añade tus gastos","Combustible, peajes, averías..."]].map(([n,t,s])=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",padding:"0.875rem",background:"var(--s1)",borderRadius:"var(--r2)",border:"1px solid var(--border2)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.5rem",color:"var(--a1)",lineHeight:1,flexShrink:0}}>{n}</div>
              <div><div style={{fontWeight:600,fontSize:"0.875rem"}}>{t}</div><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:2}}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const calcV=v=>{
    const t=tractoras.find(x=>x.id===v.truck_id);
    const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio=parseFloat(v.precio)||0;
    const peaje=parseFloat(v.peaje)||0;
    const consumo=t?calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32):32;
    const precioG=t?calcPrecioMedioGasoil(gastosTodos,t.id):null;
    const costeG=precioG?km*(consumo/100)*precioG:0;
    return{coste:costeG+peaje,ben:precio-costeG-peaje,margen:precio>0?((precio-costeG-peaje)/precio)*100:0};
  };

  const viajesMes=viajesTodos.filter(v=>v.fecha?.startsWith(mesFiltro));
  const totalFijosMes=calcGastosFijosMes(gastosFijos,tractoras,semis);
  const totalVarMes=gastosTodos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesFiltro),0);
  const ingMes=viajesMes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const benMes=ingMes-totalFijosMes-totalVarMes;

  // Comparativa con el mes anterior (para mostrar tendencia ▲▼)
  const mesAnteriorKey=(()=>{const[a,m]=mesFiltro.split("-").map(Number);const d=new Date(a,m-2,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;})();
  const viajesMesAnt=viajesTodos.filter(v=>v.fecha?.startsWith(mesAnteriorKey));
  const ingMesAnt=viajesMesAnt.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const totalVarMesAnt=gastosTodos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesAnteriorKey),0);
  const gastosMesAnt=totalFijosMes+totalVarMesAnt;
  const benMesAnt=ingMesAnt-gastosMesAnt;
  const tendenciaPct=(actual,anterior)=>{
    if(!anterior)return null;
    return((actual-anterior)/Math.abs(anterior))*100;
  };
  const Tendencia=({actual,anterior,bueno="up"})=>{
    const t=tendenciaPct(actual,anterior);
    if(t===null||Math.abs(t)<0.5)return null;
    const sube=t>0;
    const esBueno=bueno==="up"?sube:!sube;
    return<span style={{fontSize:"0.68rem",fontWeight:700,color:esBueno?"var(--green)":"var(--red)",marginLeft:6}}>{sube?"▲":"▼"} {Math.abs(t).toFixed(0)}%</span>;
  };
  const costeEmpresa=calcCosteKmEmpresa(tractoras,gastosFijos,gastosTodos,viajesTodos);
  const mesLabel=MESES_ES[parseInt(mesFiltro.split("-")[1])-1];

  const alertas=[];
  tractoras.forEach(t=>{[["fecha_itv","ITV",45],["fecha_seguro_vto","Seguro",30],["fecha_aceite","Aceite",15],["fecha_tarjeta","Tarjeta transp.",45]].forEach(([k,l,m])=>{const days=alertDays(t[k]);const col=alertColor(days,m);if(col==="r"||col==="y")alertas.push({label:`${l} — ${t.matricula||"Tractora"}`,days,col,fecha:t[k]});});});
  semis.forEach(s=>{
    const checks=[["fecha_itv","ITV remolque",45],["fecha_seguro_vto","Seguro remolque",30]];
    if(s.subtipo==="Frigorífico"){
      checks.push(["frigo_fecha_aceite","Aceite motor frigo",15]);
      checks.push(["frigo_fecha_revision","Revisión motor frigo",30]);
      checks.push(["frigo_fecha_gas","Gas refrigerante",60]);
    }
    checks.forEach(([k,l,m])=>{const days=alertDays(s[k]);const col=alertColor(days,m);if(col==="r"||col==="y")alertas.push({label:`${l} — ${s.matricula||"Semi"}`,days,col,fecha:s[k]});});
  });

  return(
    <div className="page fu">
      {!esGerente&&<div className="card" style={{background:"var(--s2)",border:"1px solid var(--border2)"}}>
        <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.25rem"}}>Hola, {perfil.nombre||"Chófer"} 👋</div>
        <div style={{fontSize:"0.82rem",color:"var(--muted)"}}>Registra tus viajes y gastos desde las pestañas de abajo.</div>
      </div>}
      {esGerente&&<div className="g3">
        <div className="stat"><div className="slbl">Ingresos {mesLabel}</div><div className="sval g">{euros(ingMes)}<Tendencia actual={ingMes} anterior={ingMesAnt} bueno="up"/></div></div>
        <div className="stat"><div className="slbl">Gastos {mesLabel}</div><div className="sval r">{euros(totalFijosMes+totalVarMes)}<Tendencia actual={totalFijosMes+totalVarMes} anterior={gastosMesAnt} bueno="down"/></div></div>
        <div className="stat"><div className="slbl">Beneficio {mesLabel}</div><div className={`sval ${benMes>=0?"g":"r"}`}>{euros(benMes)}<Tendencia actual={benMes} anterior={benMesAnt} bueno="up"/></div></div>
      </div>}

      {esGerente&&costeEmpresa>0&&<div className="hcard">
        <div className="hlbl">Coste €/km empresa — {mesLabel}</div>
        <div className="hval">{eurosKm(costeEmpresa)}</div>
        <div className="hsub">Fijos + variables + combustible · toda la flota</div>
      </div>}

      {alertas.length>0&&<div className="card"><div className="chd">Avisos urgentes</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
          {alertas.map((a,i)=>(
            <div key={i} className={`alert-item ${a.col}`}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <div className={`alert-dot dot-${a.col}`}/>
                <div><div style={{fontWeight:600,fontSize:"0.83rem"}}>{a.label}</div><div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{a.days<0?"Vencido hace":"Vence en"} {Math.abs(a.days)} dias · {fmtDate(a.fecha)}</div></div>
              </div>
              <span className={`badge ${a.col==="r"?"bg-r":"bg-y"}`}>{a.days<0?"Vencido":`${Math.abs(a.days)}d`}</span>
            </div>
          ))}
        </div>
      </div>}

      <div className="card">
        <div className="chd">Ultimos registros</div>
        {ultRegistros.length===0?<div style={{color:"var(--muted)",fontSize:"0.83rem",textAlign:"center",padding:"1rem 0"}}>Sin registros aun</div>
        :<div style={{display:"flex",flexDirection:"column",gap:"0"}}>
          {ultRegistros.map((r,i)=>{
            const esViaje=r._tipo==="viaje";
            const t=tractoras.find(x=>x.id===(esViaje?r.truck_id:r.vehicle_id));
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.625rem 0",borderBottom:i<ultRegistros.length-1?"1px solid var(--border)":"none"}}>
                <div style={{width:32,height:32,borderRadius:8,background:esViaje?"#4B8EFF15":"#FFD16615",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon d={esViaje?I.trend:I.coin} size={14} color={esViaje?"var(--a1)":"var(--yellow)"}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:"0.83rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {esViaje?`${r.origen||"?"} → ${r.destino||"?"}`:`${r.tipo||"Gasto"}`}
                  </div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>
                    {t?t.matricula:"Sin asignar"} · {tiempoRelativo(r._fecha)}
                  </div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:"1rem",color:esViaje?"var(--green)":"var(--red)",letterSpacing:"0.02em",flexShrink:0}}>
                  {esViaje?euros(parseFloat(r.precio)):`-${euros(parseFloat(r.importe))}`}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

