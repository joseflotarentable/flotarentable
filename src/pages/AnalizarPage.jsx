import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { MESES_ES, MESES_SHORT } from "../lib/constants.js";
import { nowMes, nowAno, euros, eurosKm, pct, gastoProrrateadoEnMes, calcConsumoHistorico, precioGasoilDe } from "../lib/helpers.js";

export function AnalizarPage({userId,tractoras,semis,gastosTodos,viajesTodos,gastosFijos}) {
  const[simKm,setSimKm]=useState("");
  const[simPrecio,setSimPrecio]=useState("");
  const[simTractora,setSimTractora]=useState(tractoras[0]?.id||"");
  const[simPeaje,setSimPeaje]=useState("");
  const[subtab,setSubtab]=useState("resumen");
  const[viajes,setViajes]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[gastosFijosRes,setGastosFijosRes]=useState([]);
  const[modalExport,setModalExport]=useState(false);
  const[expTipo,setExpTipo]=useState("todo");
  const[expPeriodo,setExpPeriodo]=useState(nowMes());

  useEffect(()=>{
    Promise.all([
      sb.from("viajes").select("*").order("fecha",{ascending:false}),
      sb.from("gastos").select("*").order("fecha",{ascending:false}),
      sb.from("gastos_fijos").select("*").eq("user_id",userId),
    ]).then(([{data:v},{data:g},{data:gf}])=>{setViajes(v||[]);setGastos(g||[]);setGastosFijosRes(gf||[]);});
  },[]);

  const exportarExcel=()=>{
    const esAno=expPeriodo.length===4;
    const vFilt=viajes.filter(v=>esAno?v.fecha?.startsWith(expPeriodo):v.fecha?.startsWith(expPeriodo));
    const gFilt=gastos.filter(g=>esAno?g.ano===expPeriodo:g.mes===expPeriodo);
    const sep=";";
    const eur=n=>n?(parseFloat(n)||0).toFixed(2).replace(".",",")+"€":"0,00€";
    const fec=d=>d?d.split("-").reverse().join("/"):"";
    let csv="\uFEFF";
    if(expTipo==="viajes"||expTipo==="todo"){
      csv+=`VIAJES${sep}${sep}${sep}${sep}${sep}${sep}${sep}${sep}\n`;
      csv+=`Fecha${sep}Origen${sep}Destino${sep}Cliente${sep}Km${sep}Precio cobrado${sep}Peajes${sep}Tractora${sep}Semirremolque\n`;
      vFilt.forEach(v=>{
        const t=tractoras.find(x=>x.id===v.truck_id);
        const s=semis.find(x=>x.id===v.semi_id);
        csv+=`${fec(v.fecha)}${sep}${v.origen||""}${sep}${v.destino||""}${sep}${v.cliente||""}${sep}${v.km||0}${sep}${eur(v.precio)}${sep}${eur(v.peaje)}${sep}${t?.matricula||""}${sep}${s?.matricula||""}\n`;
      });
      csv+=`${sep}${sep}${sep}TOTAL${sep}${vFilt.reduce((s,v)=>s+(parseFloat(v.km)||0),0)}${sep}${eur(vFilt.reduce((s,v)=>s+(parseFloat(v.precio)||0),0))}\n`;
    }
    if(expTipo==="todo")csv+="\n";
    if(expTipo==="gastos"||expTipo==="todo"){
      csv+=`GASTOS VARIABLES${sep}${sep}${sep}${sep}\n`;
      csv+=`Fecha${sep}Tipo${sep}Importe${sep}Vehiculo${sep}Litros${sep}E/Litro${sep}Nota\n`;
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

  // Precio medio gasoil global
  const precioGasoilGlobal=()=>{
    const repos=gastosTodos.filter(g=>g.tipo==="Combustible"&&g.precio_litro);
    if(!repos.length)return 1.65;
    return repos.reduce((s,g)=>s+(parseFloat(g.precio_litro)||0),0)/repos.length;
  };

  // Simulador
  const simResult=()=>{
    const km=parseFloat(simKm)||0;
    const precio=parseFloat(simPrecio)||0;
    const peaje=parseFloat(simPeaje)||0;
    if(!km||!precio)return null;
    const t=tractoras.find(x=>x.id===simTractora);
    const consumo=parseFloat(t?.consumo_estimado)||32;
    const precioG=t?precioGasoilDe(t,gastosTodos)||precioGasoilGlobal():precioGasoilGlobal();
    const costeGasoil=km*(consumo/100)*precioG;
    const fijosT=gastosFijos.filter(g=>g.entidad_id===t?.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
    const fijosE=gastosFijos.filter(g=>g.entidad_id==="empresa").reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
    // Si la tractora no tiene km mensuales configurados, usamos los km reales del mes actual
    // o un valor por defecto razonable (8000 km) — NUNCA los km del propio viaje simulado,
    // porque eso cargaría todos los gastos fijos del mes sobre un único viaje.
    const mesFiltroSim=nowMes();
    const kmRealesMes=t?viajesTodos.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltroSim)).reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0):0;
    const kmMes=parseFloat(t?.km_mensuales)||kmRealesMes||8000;
    const fijosKm=(fijosT+fijosE/Math.max(tractoras.filter(x=>x.activa!==false).length,1))/kmMes;
    const costeFijos=fijosKm*km;
    const fijosAviso=!t?.km_mensuales&&!kmRealesMes;
    const costeTotal=costeGasoil+peaje+costeFijos;
    const ben=precio-costeTotal;
    const margen=precio>0?(ben/precio)*100:0;
    const precioMin=costeTotal*1.15;
    const kmRate=precio/km;
    const kmMin=precioMin/km;
    return{km,precio,peaje,costeGasoil,costeFijos,costeTotal,ben,margen,precioMin,kmRate,kmMin,ok:ben>0,fijosAviso,kmMes};
  };

  // Ranking clientes
  const rankingClientes=()=>{
    const cMap={};
    viajesTodos.forEach(v=>{
      const c=v.cliente||"Sin nombre";
      if(!cMap[c])cMap[c]={ing:0,cost:0,viajes:0};
      const t=tractoras.find(x=>x.id===v.truck_id);
      const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0)+(parseFloat(v.km_vacio)||0);
      const consumo=t?calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32):32;
      const precioG=t?precioGasoilDe(t,gastosTodos)||precioGasoilGlobal():precioGasoilGlobal();
      const coste=km*(consumo/100)*precioG+(parseFloat(v.peaje)||0);
      cMap[c].ing+=parseFloat(v.precio)||0;
      cMap[c].cost+=coste;
      cMap[c].viajes++;
    });
    return Object.entries(cMap).map(([n,d])=>({n,margen:d.ing>0?((d.ing-d.cost)/d.ing)*100:0,ing:d.ing,viajes:d.viajes})).sort((a,b)=>b.margen-a.margen);
  };

  // Tendencia coste km 6 meses
  const tendenciaKm=()=>{
    const now=new Date();
    return Array.from({length:6},(_,i)=>{
      const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const vMes=viajesTodos.filter(v=>v.fecha?.startsWith(key));
      const gMes=gastosTodos.filter(g=>g.mes===key);
      const kmTotal=vMes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
      const varTotal=gastosTodos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,key),0);
      const fijosTotal=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
      const costeKm=kmTotal>0?(varTotal+fijosTotal)/kmTotal:0;
      return{label:MESES_SHORT[d.getMonth()],key,kmTotal,costeKm};
    });
  };

  const sr=simResult();
  const clientes=rankingClientes();
  const tendencia=tendenciaKm();
  const maxCoste=Math.max(...tendencia.map(t=>t.costeKm),0.01);

  const generarPDF=async(tractora,mes)=>{
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script);
    await new Promise(r=>script.onload=r);
    const{jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const W=210;const M=14;const CW=W-M*2;
    const eur=n=>(parseFloat(n)||0).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
    const mesLabel=`${MESES_ES[parseInt(mes.split("-")[1])-1]} ${mes.split("-")[0]}`;
    const vMes=viajesTodos.filter(v=>v.fecha?.startsWith(mes)&&v.truck_id===tractora.id);
    const gVar=gastosTodos.filter(g=>g.mes===mes&&(g.vehicle_id===tractora.id||g.vehicle_tipo==="tractora"&&g.vehicle_id===tractora.id));
    const gFijosT=gastosFijos.filter(g=>g.entidad_id===tractora.id);
    const gFijosE=gastosFijos.filter(g=>g.entidad_id==="empresa");
    const totalFijosT=gFijosT.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
    const totalFijosE=gFijosE.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0)/Math.max(tractoras.filter(x=>x.activa!==false).length,1);
    const totalFijos=totalFijosT+totalFijosE;
    const totalVar=gVar.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const totalIngresos=vMes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const totalKm=vMes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    const totalPeajes=vMes.reduce((s,v)=>s+(parseFloat(v.peaje)||0),0);
    const beneficio=totalIngresos-totalVar-totalFijos;
    let y=14;
    // Header
    doc.setFillColor(8,8,15);doc.rect(0,0,W,28,"F");
    doc.setTextColor(232,73,15);doc.setFontSize(18);doc.setFont("helvetica","bold");
    doc.text("FLOTARENTABLE",M,10);
    doc.setTextColor(200,200,200);doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.text("Informe mensual de tractora",M,16);
    doc.setTextColor(245,200,66);doc.setFontSize(11);doc.setFont("helvetica","bold");
    doc.text(`${tractora.matricula||"Sin matrícula"}${tractora.apodo?` · "${tractora.apodo}"`:""}`,M,23);
    doc.setTextColor(200,200,200);doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.text(mesLabel,W-M,23,"right");
    y=36;
    // Resumen
    const cols=[[`${eur(totalIngresos)}`,"Ingresos"],[`${eur(totalVar)}`,"Gastos var."],[`${eur(totalFijos)}`,"Gastos fijos"],[`${eur(beneficio)}`,"Beneficio"]];
    const cw=CW/4;
    cols.forEach(([val,lbl],i)=>{
      const x=M+i*cw;const ok=i===3?beneficio>=0:true;
      doc.setFillColor(20,20,30);doc.roundedRect(x,y,cw-2,18,2,2,"F");
      doc.setTextColor(ok?(i===3?beneficio>=0?40:220:232):220,ok?(i===3?beneficio>=0?200:73:73):73,ok?(i===3?beneficio>=0?40:15:15):15);
      doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(val,x+cw/2-1,y+8,"center");
      doc.setTextColor(140,140,160);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(lbl,x+cw/2-1,y+14,"center");
    });
    y+=24;
    // Stats fila
    doc.setFillColor(20,20,30);doc.roundedRect(M,y,CW,10,2,2,"F");
    doc.setTextColor(180,180,200);doc.setFontSize(8);
    [`${totalKm.toLocaleString("es-ES")} km`,`${vMes.length} viaje${vMes.length!==1?"s":""}`,`${eur(totalPeajes)} peajes`,totalKm>0?`${eur(beneficio/totalKm)}/km`:"— €/km"].forEach((t,i)=>{
      doc.text(t,M+CW/8+i*(CW/4),y+6.5,"center");
    });
    y+=16;
    // Viajes
    doc.setTextColor(232,73,15);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("VIAJES",M,y);y+=5;
    doc.setDrawColor(232,73,15);doc.setLineWidth(0.3);doc.line(M,y,M+CW,y);y+=4;
    doc.setTextColor(120,120,140);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
    ["Fecha","Origen → Destino","Cliente","Km","Precio","Peaje"].forEach((h,i)=>{
      const xs=[0,18,90,118,138,158];doc.text(h,M+xs[i],y);
    });y+=4;
    doc.setDrawColor(40,40,55);doc.setLineWidth(0.2);doc.line(M,y,M+CW,y);y+=3;
    vMes.forEach(v=>{
      if(y>270){doc.addPage();y=14;}
      doc.setTextColor(220,220,235);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
      const xs=[0,18,90,118,138,158];
      const vals=[v.fecha?v.fecha.split("-").reverse().join("/"):"",`${v.origen||""}${v.destino?` → ${v.destino}`:""}`,v.cliente||"",`${((parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0)).toLocaleString("es-ES")}`,eur(v.precio),eur(v.peaje)];
      vals.forEach((val,i)=>{doc.text(String(val).substring(0,i===1?30:14),M+xs[i],y);});
      y+=5;
    });
    if(vMes.length===0){doc.setTextColor(100,100,120);doc.setFontSize(8);doc.text("Sin viajes este mes",M,y);y+=6;}
    y+=4;
    // Gastos variables
    if(y>250){doc.addPage();y=14;}
    doc.setTextColor(232,73,15);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("GASTOS VARIABLES",M,y);y+=5;
    doc.setDrawColor(232,73,15);doc.line(M,y,M+CW,y);y+=4;
    doc.setTextColor(120,120,140);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
    ["Fecha","Tipo","Nota","Importe"].forEach((h,i)=>{doc.text(h,M+[0,18,60,152][i],y);});y+=4;
    doc.setDrawColor(40,40,55);doc.line(M,y,M+CW,y);y+=3;
    gVar.forEach(g=>{
      if(y>270){doc.addPage();y=14;}
      doc.setTextColor(220,220,235);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
      const vals=[g.fecha?g.fecha.split("-").reverse().join("/"):"",g.tipo||"",g.nota||g.titulo||"",eur(g.importe)];
      [0,18,60,152].forEach((x,i)=>{doc.text(String(vals[i]).substring(0,i===2?40:16),M+x,y);});
      y+=5;
    });
    if(gVar.length===0){doc.setTextColor(100,100,120);doc.setFontSize(8);doc.text("Sin gastos este mes",M,y);y+=6;}
    y+=4;
    // Gastos fijos
    if(y>240){doc.addPage();y=14;}
    doc.setTextColor(232,73,15);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("GASTOS FIJOS PRORRATEADOS",M,y);y+=5;
    doc.setDrawColor(232,73,15);doc.line(M,y,M+CW,y);y+=4;
    doc.setTextColor(120,120,140);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
    ["Concepto","Periodo","Importe mensual"].forEach((h,i)=>{doc.text(h,M+[0,100,152][i],y);});y+=4;
    doc.setDrawColor(40,40,55);doc.line(M,y,M+CW,y);y+=3;
    [...gFijosT,...gFijosE.map(g=>({...g,concepto:g.concepto+" (empresa)"}))].forEach(g=>{
      if(y>270){doc.addPage();y=14;}
      const imp=parseFloat(g.importe)||0;
      const mensual=g.periodo==="anual"?imp/12:imp;
      const mensualReal=g.entidad_id==="empresa"?mensual/Math.max(tractoras.filter(x=>x.activa!==false).length,1):mensual;
      doc.setTextColor(220,220,235);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
      doc.text(String(g.concepto||"").substring(0,40),M,y);
      doc.text(g.periodo==="anual"?"Anual":"Mensual",M+100,y);
      doc.text(eur(mensualReal),M+152,y);
      y+=5;
    });
    if(gastosFijos.length===0){doc.setTextColor(100,100,120);doc.setFontSize(8);doc.text("Sin gastos fijos configurados",M,y);y+=6;}
    y+=6;
    // Total final
    if(y>265){doc.addPage();y=14;}
    doc.setFillColor(232,73,15);doc.roundedRect(M,y,CW,12,2,2,"F");
    doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont("helvetica","bold");
    doc.text("BENEFICIO NETO",M+4,y+7.5);
    doc.text(eur(beneficio),M+CW-4,y+7.5,"right");
    y+=18;
    // Footer
    doc.setTextColor(80,80,100);doc.setFontSize(7);doc.setFont("helvetica","normal");
    doc.text(`Generado por FlotaRentable · ${new Date().toLocaleDateString("es-ES")}`,W/2,290,"center");
    doc.save(`FlotaRentable_${tractora.matricula||"tractora"}_${mes}.pdf`);
  };

  return(
    <div className="page fu">
      <div className="ptitle">Analizar</div>
      <div className="tab-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
        {[["resumen","Resumen"],["rentabilidad","Rentabilidad"],["simular","Simular"],["informes","Informes"]].map(([id,lbl])=>(
          <div key={id} className={`tab-btn ${subtab===id?"on":""}`} onClick={()=>setSubtab(id)}>{lbl}</div>
        ))}
      </div>

      {subtab==="resumen"&&<>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Este mes</div>
        {/* Coste €/km por tractora este mes */}
        <div className="card">
          <div className="chd">Coste €/km por tractora — {MESES_ES[parseInt(nowMes().split("-")[1])-1]}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
            {tractoras.map(t=>{
              const mesFiltro=nowMes();
              const vT=viajesTodos.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro));
              const kmReales=vT.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
              const km=kmReales||parseFloat(t.km_mensuales)||0;
              const fijosT=gastosFijos.filter(g=>g.entidad_id===t.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
              const varT=gastosTodos.filter(g=>g.vehicle_id===t.id&&g.mes===mesFiltro).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
              const consumo=calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32);
              const precioG=precioGasoilDe(t,gastosTodos)||1.65;
              const combustKm=(consumo/100)*precioG;
              const costeTotal=km>0?(fijosT+varT)/km+combustKm:combustKm;
              const ingresos=vT.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
              const margen=ingresos>0&&km>0?((ingresos/km)-costeTotal)/(ingresos/km)*100:null;
              const semi=semis.find(s=>s.id===t.semi_habitual_id);
              return(
                <div key={t.id} style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.875rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.875rem"}}>{t.matricula||"Sin mat."}{t.apodo?` "${t.apodo}"`:""}  {semi&&<span style={{fontSize:"0.68rem",color:"var(--muted)"}}>+ {semi.matricula}</span>}</div>
                      <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{kmReales>0?`${kmReales.toLocaleString("es-ES")} km reales`:`${km.toLocaleString("es-ES")} km estimados`}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.4rem",color:"var(--a1)",lineHeight:1}}>{costeTotal.toFixed(3).replace(".",",")} €/km</div>
                      {margen!==null&&<div style={{fontSize:"0.68rem",fontWeight:600,color:margen>=15?"var(--green)":margen>=0?"var(--yellow)":"var(--red)"}}>{margen>=0?"+":""}{Math.round(margen)}% margen</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",fontSize:"0.68rem",color:"var(--muted)"}}>
                    <span>⛽ {combustKm.toFixed(3).replace(".",",")} €/km combustible</span>
                    {fijosT>0&&km>0&&<span>📋 {(fijosT/km).toFixed(3).replace(".",",")} €/km fijos</span>}
                    {varT>0&&km>0&&<span>🔧 {(varT/km).toFixed(3).replace(".",",")} €/km variables</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Resumen mes actual */}
        {(()=>{
          const mesFiltro=nowMes();
          const vMes=viajesTodos.filter(v=>v.fecha?.startsWith(mesFiltro));
          const gMes=gastosTodos.filter(g=>g.mes===mesFiltro);
          const ingresos=vMes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
          const gastosVar=gMes.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
          const fijosMes=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
          const beneficio=ingresos-gastosVar-fijosMes;
          if(!ingresos&&!gastosVar)return null;
          return(
            <div className="sgrid">
              <div className="stat"><div className="slbl">Ingresos {MESES_ES[parseInt(mesFiltro.split("-")[1])-1]}</div><div className="sval g">{euros(ingresos)}</div></div>
              <div className="stat"><div className="slbl">Beneficio {MESES_ES[parseInt(mesFiltro.split("-")[1])-1]}</div><div className={`sval ${beneficio>=0?"g":"r"}`}>{euros(beneficio)}</div></div>
            </div>
          );
        })()}

        {/* Predicción simple de cierre de mes */}
        {(()=>{
          const mesFiltro=nowMes();
          const hoy=new Date();
          const diaActual=hoy.getDate();
          const diasMes=new Date(hoy.getFullYear(),hoy.getMonth()+1,0).getDate();
          if(diaActual<3)return null;
          const vMes=viajesTodos.filter(v=>v.fecha?.startsWith(mesFiltro));
          const ingresos=vMes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
          if(!ingresos)return null;
          const gMes=gastosTodos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesFiltro),0);
          const fijosMes=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
          const benHasta=ingresos-gMes-fijosMes;
          const ratio=diasMes/diaActual;
          const benProyectado=benHasta*ratio;
          return(
            <div className="card">
              <div className="chd">📈 Predicción de cierre — {MESES_ES[parseInt(mesFiltro.split("-")[1])-1]}</div>
              <div style={{fontSize:"0.85rem"}}>A este ritmo (día {diaActual} de {diasMes}), este mes podrías cerrar con un beneficio de aproximadamente <span style={{fontWeight:700,color:benProyectado>=0?"var(--green)":"var(--red)"}}>{euros(benProyectado)}</span>.</div>
              <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:4}}>Estimación lineal basada en lo registrado hasta ahora. Cuantos más datos metas, más precisa será.</div>
            </div>
          );
        })()}

        {/* Alertas de anomalías de consumo */}
        {(()=>{
          const mesFiltro=nowMes();
          const mesAnt=(()=>{const[a,m]=mesFiltro.split("-").map(Number);const d=new Date(a,m-2,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;})();
          const anomalias=[];
          tractoras.forEach(t=>{
            const cActual=calcConsumoHistorico(gastosTodos.filter(g=>g.mes===mesFiltro),t.id);
            const cAnt=calcConsumoHistorico(gastosTodos.filter(g=>g.mes===mesAnt),t.id);
            if(cActual&&cAnt){
              const delta=((cActual-cAnt)/cAnt)*100;
              if(Math.abs(delta)>=12)anomalias.push({matricula:t.matricula||"Tractora",delta});
            }
          });
          if(anomalias.length===0)return null;
          return(
            <div className="card">
              <div className="chd">⚠️ Anomalías detectadas</div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                {anomalias.map((a,i)=>(
                  <div key={i} style={{fontSize:"0.82rem"}}>Este mes el consumo de la <span style={{fontWeight:700}}>{a.matricula}</span> ha {a.delta>0?"subido":"bajado"} un <span style={{fontWeight:700,color:a.delta>0?"var(--red)":"var(--green)"}}>{Math.abs(a.delta).toFixed(0)}%</span> respecto al mes anterior.</div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Ranking de tractoras por rentabilidad */}
        {(()=>{
          if(tractoras.length<2)return null;
          const mesFiltro=nowMes();
          const ranking=tractoras.map(t=>{
            const vT=viajesTodos.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro));
            const ingresos=vT.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
            const km=vT.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
            const consumo=calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32);
            const precioG=precioGasoilDe(t,gastosTodos)||1.65;
            const coste=km*(consumo/100)*precioG+vT.reduce((s,v)=>s+(parseFloat(v.peaje)||0),0);
            const margen=ingresos>0?((ingresos-coste)/ingresos)*100:null;
            return{matricula:t.matricula||"Sin mat.",apodo:t.apodo,margen,ingresos,viajes:vT.length};
          }).filter(r=>r.margen!==null).sort((a,b)=>b.margen-a.margen);
          if(ranking.length===0)return null;
          return(
            <div className="card">
              <div className="chd">🏆 Ranking de tractoras — {MESES_ES[parseInt(mesFiltro.split("-")[1])-1]}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                {ranking.map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.7rem 0.875rem"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.83rem"}}>{i===0?"🥇 ":i===1?"🥈 ":i===2?"🥉 ":""}{r.matricula}{r.apodo?` "${r.apodo}"`:""}</div>
                      <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{r.viajes} viaje{r.viajes!==1?"s":""} · {euros(r.ingresos)} facturado</div>
                    </div>
                    <span className={`badge ${r.margen>=20?"bg-g":r.margen>=0?"bg-y":"bg-r"}`}>{pct(r.margen)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </>}

      {subtab==="simular"&&<>
        <div className="card">
          <div className="chd">Simula un viaje antes de aceptarlo</div>
          {tractoras.length>1&&<div className="fld" style={{marginBottom:"0.625rem"}}><label className="lbl">Tractora</label>
            <select className="inp sel" value={simTractora} onChange={e=>setSimTractora(e.target.value)}>
              {tractoras.map(t=><option key={t.id} value={t.id}>{t.matricula}{t.apodo?` "${t.apodo}"`:"" }</option>)}
            </select>
          </div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Km totales</label><input className="inp" type="number" placeholder="850" value={simKm} onChange={e=>setSimKm(e.target.value)}/></div>
            <div className="fld"><label className="lbl">Precio a cobrar</label><input className="inp" type="number" placeholder="1200" value={simPrecio} onChange={e=>setSimPrecio(e.target.value)}/></div>
          </div>
          <div className="fld" style={{marginTop:"0.5rem"}}><label className="lbl">Peajes estimados (€)</label><input className="inp" type="number" placeholder="0" value={simPeaje} onChange={e=>setSimPeaje(e.target.value)}/></div>
        </div>

        {sr&&<div style={{background:sr.ok?"#06D6A008":"#FF3D5A08",border:`1px solid ${sr.ok?"#06D6A025":"#FF3D5A25"}`,borderRadius:"var(--r)",padding:"1.125rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.6rem",color:sr.ok?"var(--green)":"var(--red)"}}>{sr.ok?"RENTABLE":"EN PERDIDA"}</div>
            <span className={`badge ${sr.ok?"bg-g":sr.margen>=-10?"bg-y":"bg-r"}`}>{pct(sr.margen)}</span>
          </div>
          <div className="sgrid" style={{gap:"0.5rem"}}>
            <div className="stat" style={{padding:"0.625rem"}}><div className="slbl">Beneficio</div><div className={`sval ${sr.ok?"g":"r"}`} style={{fontSize:"1.3rem"}}>{euros(sr.ben)}</div></div>
            <div className="stat" style={{padding:"0.625rem"}}><div className="slbl">Tu precio/km</div><div className="sval a" style={{fontSize:"1.1rem"}}>{eurosKm(sr.kmRate)}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",fontSize:"0.78rem",color:"var(--muted)"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Gasoil estimado</span><span style={{color:"var(--text)"}}>{euros(sr.costeGasoil)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Peajes</span><span style={{color:"var(--text)"}}>{euros(sr.peaje)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Gastos fijos proporcionales {sr.fijosAviso&&<span style={{color:"var(--yellow)"}}>· estimado sobre {sr.kmMes.toLocaleString("es-ES")} km/mes</span>}</span><span style={{color:"var(--text)"}}>{euros(sr.costeFijos)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid var(--border)",paddingTop:"0.3rem",marginTop:"0.1rem",fontWeight:700}}><span>Coste total</span><span style={{color:"var(--text)"}}>{euros(sr.costeTotal)}</span></div>
          </div>
          {sr.fijosAviso&&<div style={{fontSize:"0.72rem",color:"var(--muted)"}}>💡 Esta tractora no tiene "Km mensuales" configurados ni viajes este mes, así que el reparto de gastos fijos es una estimación sobre {sr.kmMes.toLocaleString("es-ES")} km/mes. Indica los km mensuales reales en Flota para un cálculo más preciso.</div>}
          {!sr.ok&&<div style={{background:"#FF3D5A15",borderRadius:"var(--r2)",padding:"0.75rem",fontSize:"0.82rem",color:"var(--red)",fontWeight:600}}>
            Precio minimo recomendado: {euros(sr.precioMin)} ({eurosKm(sr.kmMin)})
          </div>}
        </div>}

        {!sr&&<div className="empty"><div className="ei"><Icon d={I.trend} size={20} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Introduce los km y el precio para simular</span></div>}
      </>}

      {subtab==="rentabilidad"&&<>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Ranking de clientes</div>
        {clientes.length===0?<div className="empty"><div className="ei"><Icon d={I.user} size={20} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin viajes registrados aun</span></div>
        :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
          {clientes.map((c,i)=>{
            const noRentable=c.margen<10;
            const muyRentable=c.margen>=20;
            const col=noRentable?"var(--red)":muyRentable?"var(--green)":"var(--yellow)";
            const bg=noRentable?"#FF3D5A":muyRentable?"#06D6A0":"#FFD166";
            const lbl=noRentable?"NO RENTABLE":muyRentable?"MUY RENTABLE":"RENTABLE";
            return(
              <div key={i} style={{background:"var(--s2)",border:`1px solid ${bg}25`,borderRadius:"var(--r2)",padding:"0.875rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{minWidth:0,flex:1,overflow:"hidden"}}>
                  <div style={{fontWeight:700,fontSize:"0.875rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</span>
                    <span style={{fontSize:"0.65rem",fontWeight:600,padding:"0.15rem 0.5rem",borderRadius:999,background:`${bg}20`,color:col}}>
                      {lbl}
                    </span>
                  </div>
                  <div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:2}}>{c.viajes} viaje{c.viajes!==1?"s":""} · {euros(c.ing)} facturado</div>
                </div>
                <span className={`badge ${c.margen>=20?"bg-g":c.margen>=0?"bg-y":"bg-r"}`}>{pct(c.margen)}</span>
              </div>
            );
          })}
        </div>}
      </>}

      {subtab==="rentabilidad"&&<>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:"0.5rem"}}>Tendencia de costes</div>
        <div className="card">
          <div className="chd">Coste €/km ultimos 6 meses</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,marginBottom:"0.5rem"}}>
            {tendencia.map((m,i)=>{
              const h=maxCoste>0?Math.max((m.costeKm/maxCoste)*68,3):3;
              const prev=i>0?tendencia[i-1].costeKm:m.costeKm;
              const color=m.costeKm<=prev?"var(--green)":"var(--red)";
              return<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:"0.6rem",color:"var(--muted)"}}>{m.costeKm>0?eurosKm(m.costeKm):""}</div>
                <div style={{width:"100%",height:h,background:color,borderRadius:"4px 4px 0 0",opacity:0.85}}/>
                <div style={{fontSize:"0.58rem",color:"var(--muted)"}}>{m.label}</div>
              </div>;
            })}
          </div>
          <div style={{fontSize:"0.72rem",color:"var(--muted)",textAlign:"center"}}>Verde = bajando (bueno) · Rojo = subiendo (atencion)</div>
        </div>
        <div className="card">
          <div className="chd">Detalle</div>
          {tendencia.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:i<5?"1px solid var(--border)":"none"}}>
              <span style={{fontSize:"0.83rem"}}>{m.label}</span>
              <div style={{display:"flex",gap:"1rem",fontSize:"0.78rem"}}>
                <span style={{color:"var(--muted)"}}>{m.kmTotal.toLocaleString("es-ES")} km</span>
                <span style={{fontWeight:600,color:m.costeKm>0?"var(--text)":"var(--muted)"}}>{m.costeKm>0?eurosKm(m.costeKm):"sin datos"}</span>
              </div>
            </div>
          ))}
        </div>
      </>}

      {subtab==="resumen"&&<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Ultimos 6 meses</div>
          <button className="btn bg bsm" onClick={()=>setModalExport(true)}><Icon d={I.arrow} size={14}/> Exportar</button>
        </div>
        {(()=>{
          const now=new Date();
          const totalFijosMes=gastosFijosRes.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
          const months=Array.from({length:6},(_,i)=>{
            const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
            const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
            const mv=viajes.filter(v=>v.fecha?.startsWith(key));
            const ingresos=mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
            const gastosVar=gastos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,key),0);
            const beneficio=ingresos-gastosVar-totalFijosMes;
            return{label:`${MESES_SHORT[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,ingresos,gastosVar,beneficio,numViajes:mv.length};
          });
          const totalIng=months.reduce((s,m)=>s+m.ingresos,0);
          const totalBen=months.reduce((s,m)=>s+m.beneficio,0);
          const maxIng=Math.max(...months.map(m=>m.ingresos),1);
          return<>
            <div className="sgrid">
              <div className="stat"><div className="slbl">Ingresos 6m</div><div className="sval g">{euros(totalIng)}</div></div>
              <div className="stat"><div className="slbl">Beneficio 6m</div><div className={`sval ${totalBen>=0?"g":"r"}`}>{euros(totalBen)}</div></div>
            </div>
            <div className="card">
              <div className="chd">Ingresos por mes</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60}}>
                {months.map((m,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",height:Math.max((m.ingresos/maxIng)*52,3),background:m.beneficio>=0?"var(--green)":"var(--red)",borderRadius:"4px 4px 0 0",opacity:0.7}}/>
                  <span style={{fontSize:"0.58rem",color:"var(--muted)"}}>{m.label}</span>
                </div>)}
              </div>
            </div>
            <div className="card">
              <div className="chd">Detalle mensual</div>
              <table className="mtable">
                <thead><tr><th>Mes</th><th>Ingresos</th><th>Beneficio</th><th>Viajes</th></tr></thead>
                <tbody>{months.map((m,i)=><tr key={i}><td>{m.label}</td><td style={{color:"var(--green)",fontWeight:600}}>{euros(m.ingresos)}</td><td style={{color:m.beneficio>=0?"var(--green)":"var(--red)",fontWeight:600}}>{euros(m.beneficio)}</td><td style={{color:"var(--muted)"}}>{m.numViajes}</td></tr>)}</tbody>
              </table>
            </div>
          </>;
        })()}
        {modalExport&&<div className="ov" onClick={()=>setModalExport(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mdrag"/>
            <div className="mtitle">Exportar a Excel</div>
            <div className="fld"><label className="lbl">Que quieres exportar?</label>
              <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginTop:"0.25rem"}}>
                {[["todo","Viajes + Gastos"],["viajes","Solo viajes"],["gastos","Solo gastos"]].map(([v,l])=>(
                  <div key={v} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem",background:expTipo===v?"#ffffff10":"var(--s2)",border:`1px solid ${expTipo===v?"var(--a1)":"var(--border2)"}`,borderRadius:"var(--r2)",cursor:"pointer"}} onClick={()=>setExpTipo(v)}>
                    <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${expTipo===v?"var(--a1)":"var(--muted)"}`,background:expTipo===v?"var(--a1)":"transparent",flexShrink:0}}/>
                    <span style={{fontSize:"0.875rem",fontWeight:500}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fld"><label className="lbl">De que periodo?</label>
              <select className="inp sel" value={expPeriodo} onChange={e=>setExpPeriodo(e.target.value)}>
                <optgroup label="Por mes">
                  {Array.from({length:12},(_,i)=>{const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;return<option key={k} value={k}>{MESES_ES[d.getMonth()]} {d.getFullYear()}</option>;})}
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
      </>}

      {subtab==="informes"&&<>
        <div className="card">
          <div className="chd">Informe PDF mensual por tractora</div>
          <p style={{fontSize:"0.82rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Descarga un PDF con viajes, gastos variables, gastos fijos prorrateados y beneficio neto.</p>
          {tractoras.length===0&&<div style={{fontSize:"0.85rem",color:"var(--muted)"}}>Sin tractoras activas</div>}
          {tractoras.filter(t=>t.activa!==false).map(t=>(
            <div key={t.id} style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
              <div style={{fontWeight:700,fontSize:"0.9rem"}}>{t.matricula||"Sin matrícula"}{t.apodo?` · "${t.apodo}"`:"" }</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                {Array.from({length:6},(_,i)=>{
                  const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);
                  const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
                  const label=`${MESES_SHORT[d.getMonth()]} ${d.getFullYear()}`;
                  return(
                    <button key={key} className="btn bg bsm" style={{fontSize:"0.75rem"}} onClick={()=>generarPDF(t,key)}>
                      📄 {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}
