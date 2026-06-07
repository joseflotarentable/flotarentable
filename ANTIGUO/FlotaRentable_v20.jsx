import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ktfrzckzxnqsqfvglwfh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnJ6Y2t6eG5xc3Fmdmdsd2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY0MTQsImV4cCI6MjA5MTQxMjQxNH0.3O4ZZ53Ww6s5hLXiaPBFlpswTkYWKSS5BRMTjWt-A34";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const ACCENTS = [
  {name:"Rojo",a1:"#FF3D5A",a2:"#FF7A3D"},
  {name:"Azul",a1:"#4B8EFF",a2:"#6B5FFF"},
  {name:"Verde",a1:"#06D6A0",a2:"#00B4D8"},
  {name:"Naranja",a1:"#FF8C42",a2:"#FFD166"},
  {name:"Morado",a1:"#9B5DE5",a2:"#F15BB5"},
];
const TIPOS_T = ["Tractora","Rígido"];
const TIPOS_S = ["Tautliner","Frigorífico","Cisterna","Góndola","Portacoches","Lona","Otros"];
const PAISES = ["España","Francia","Alemania","Italia","Portugal","Reino Unido","Bélgica","Holanda","Polonia","Chequia","Austria","Suiza","Luxemburgo","Otro"];
const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const TIPOS_GASTO_VAR = ["Combustible","Peaje","Mantenimiento","Neumáticos","Avería","ITV","Lavado","Seguro","Impuesto","Otros"];
const CONCEPTOS_EMPRESA = ["Gestoría","Autónomo","Asesoría","Seguro empresa","Otros"];
const CONCEPTOS_VEHICULO = ["Parking","Leasing / Renting","Préstamo / activo","Nómina chófer","Autónomo","Seguro anual","ITV","Otros"];

const nowMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
const nowAno = () => String(new Date().getFullYear());

const Icon = ({d,size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const I = {
  truck:"M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  coin:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6v4m0 4h.01",
  dash:"M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z",
  plus:"M12 5v14M5 12h14",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  alert:"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  gear:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  arrow:"M13 7l5 5m0 0l-5 5m5-5H6",
  check:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  lock:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  trend:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  camera:"M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z",
  chart:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  back:"M19 12H5M12 5l-7 7 7 7",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  link:"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  user:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  eye:"M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  eyeoff:"M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
  logout:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  copy:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  building:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  analyze:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2zM3 12h18",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

const euros = n => isNaN(n)||n==null?"—":new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const eurosKm = n => isNaN(n)||n==null||!isFinite(n)?"—":`${Number(n).toFixed(3).replace(".",",")} €/km`;
const pct = n => isNaN(n)||!isFinite(n)?"—":`${Math.round(n)}%`;
const fmtDate = d => d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"";
const genCode = () => "FR-"+Math.random().toString(36).substring(2,6).toUpperCase();
const getDaysLeft = t => { if(!t)return 7; return Math.max(0,7-Math.floor((Date.now()-new Date(t))/86400000)); };
const alertDays = d => { if(!d)return null; return Math.floor((new Date(d)-Date.now())/86400000); };
const alertColor = (days,margin) => { if(days===null)return null; if(days<0)return"r"; if(days<=7)return"r"; if(days<=margin)return"y"; return"g"; };

function calcGastosFijosMes(gastosFijos, tractoras, semis) {
  let total = 0;
  gastosFijos.forEach(g => {
    const imp = parseFloat(g.importe)||0;
    if (g.periodo === "anual") total += imp/12;
    else total += imp;
  });
  return total;
}

function calcCosteKmTractora(t, gastosFijos) {
  const km = parseFloat(t.km_mensuales)||0;
  if (!km) return 0;
  const fijosT = gastosFijos.filter(g => g.entidad_id === t.id);
  let totalMes = 0;
  fijosT.forEach(g => {
    const imp = parseFloat(g.importe)||0;
    if (g.periodo === "anual") totalMes += imp/12;
    else totalMes += imp;
  });
  return km > 0 ? totalMes/km : 0;
}

function calcConsumoHistorico(gastos, truckId) {
  const repos = gastos.filter(g=>g.vehicle_id===truckId&&g.tipo==="Combustible"&&g.odometro&&g.litros).sort((a,b)=>parseFloat(a.odometro)-parseFloat(b.odometro));
  if (repos.length < 2) return null;
  let totalL=0, totalKm=0;
  for (let i=1;i<repos.length;i++) {
    const kmD = parseFloat(repos[i].odometro)-parseFloat(repos[i-1].odometro);
    const lit = parseFloat(repos[i].litros)||0;
    if (kmD>0&&lit>0) { totalL+=lit; totalKm+=kmD; }
  }
  return totalKm>0?(totalL/totalKm)*100:null;
}

function calcPrecioMedioGasoil(gastos, truckId) {
  const repos = gastos.filter(g=>g.vehicle_id===truckId&&g.tipo==="Combustible"&&g.precio_litro);
  if (!repos.length) return null;
  return repos.reduce((s,g)=>s+(parseFloat(g.precio_litro)||0),0)/repos.length;
}

function calcKmBetween(lat1,lon1,lat2,lon2) {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*1.25);
}

let geoCache = {};
async function geocode(q) {
  if(!q||q.length<3)return[];
  if(geoCache[q])return geoCache[q];
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&featuretype=city`,{headers:{"Accept-Language":"es","User-Agent":"FlotaRentable/1.0"}});
    const data = await r.json();
    const res = data
      .filter(x=>["city","town","village","municipality"].includes(x.type)||["city","town","village"].includes(x.addresstype))
      .slice(0,5)
      .map(x=>{
        const a=x.address;
        const ciudad=a.city||a.town||a.village||a.municipality||a.county||x.display_name.split(",")[0];
        const pais=a.country||"";
        const region=a.state||a.province||"";
        const label=region?`${ciudad}, ${region}, ${pais}`:`${ciudad}, ${pais}`;
        return{label,ciudad,lat:parseFloat(x.lat),lon:parseFloat(x.lon)};
      });
    // Si no hay resultados con filtro de tipo, intentar sin filtro
    if(res.length===0){
      const res2=data.slice(0,5).map(x=>{
        const a=x.address;
        const ciudad=a.city||a.town||a.village||a.municipality||x.display_name.split(",")[0].trim();
        const pais=a.country||"";
        return{label:`${ciudad}, ${pais}`,ciudad,lat:parseFloat(x.lat),lon:parseFloat(x.lon)};
      });
      geoCache[q]=res2;return res2;
    }
    geoCache[q]=res;return res;
  } catch { return []; }
}

// Input que guarda solo al perder el foco — evita que se coman letras
function InputGuardado({valor,placeholder,onGuardar,tipo="text"}) {
  const[local,setLocal]=useState(valor);
  useEffect(()=>setLocal(valor),[valor]);
  return<input className="inp" type={tipo} value={local} placeholder={placeholder} onChange={e=>setLocal(e.target.value)} onBlur={()=>{if(local!==valor)onGuardar(local);}}/>;
}

// Coste €/km completo por tractora
function calcCosteKmCompleto(tractora, gastosFijos, gastosVar, viajes) {
  const mesFiltro=nowMes();
  // Km reales del mes de esta tractora (de viajes registrados)
  const kmReales=viajes.filter(v=>v.truck_id===tractora.id&&v.fecha?.startsWith(mesFiltro)).reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
  // Si no hay km reales usar los estimados, si tampoco hay no calcular
  const km=kmReales||parseFloat(tractora.km_mensuales)||0;
  if(!km)return 0;
  // Fijos del vehículo
  const fijosV=gastosFijos.filter(g=>g.entidad_id===tractora.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  // Fijos empresa repartidos proporcionalmente según km de cada tractora
  const fijosEmpresa=gastosFijos.filter(g=>g.entidad_id==="empresa").reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  const kmTotalesFlota=viajes.filter(v=>v.fecha?.startsWith(mesFiltro)).reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0)||km;
  const propEmpresa=kmTotalesFlota>0?km/kmTotalesFlota:0;
  const fijosEPorTractora=fijosEmpresa*propEmpresa;
  // Variables del mes de esta tractora
  const varMes=gastosVar.filter(g=>g.vehicle_id===tractora.id&&g.mes===mesFiltro).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  // Combustible estimado por km (L/100km × precio medio gasoil)
  const consumo=parseFloat(tractora.consumo_estimado)||0;
  const precioG=calcPrecioMedioGasoil(gastosVar,tractora.id);
  const combustibleKm=consumo>0&&precioG?(consumo/100)*precioG:0;
  return (fijosV+fijosEPorTractora)/km + varMes/km + combustibleKm;
}

// Coste €/km general de toda la empresa
function calcCosteKmEmpresa(tractoras, gastosFijos, gastosVar, viajes) {
  const mesFiltro=nowMes();
  const kmTotal=viajes.filter(v=>v.fecha?.startsWith(mesFiltro)).reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
  if(!kmTotal)return 0;
  const totalFijos=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  const totalVar=gastosVar.filter(g=>g.mes===mesFiltro).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const totalCombustible=tractoras.reduce((s,t)=>{
    const kmT=viajes.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro)).reduce((a,v)=>a+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    const consumo=parseFloat(t.consumo_estimado)||0;
    const precioG=calcPrecioMedioGasoil(gastosVar,t.id);
    return s+(consumo>0&&precioG?kmT*(consumo/100)*precioG:0);
  },0);
  return (totalFijos+totalVar+totalCombustible)/kmTotal;
}

function CityInput({value,onChange,onSelect,placeholder}) {
  const [sugs,setSugs]=useState([]);
  const [open,setOpen]=useState(false);
  const timer=useRef();
  const handle=e=>{
    const v=e.target.value; onChange(v);
    clearTimeout(timer.current);
    if(v.length>=3){timer.current=setTimeout(async()=>{const r=await geocode(v);setSugs(r);setOpen(r.length>0);},500);}
    else{setSugs([]);setOpen(false);}
  };
  return(
    <div style={{position:"relative"}}>
      <input className="inp" value={value} onChange={handle} placeholder={placeholder} onBlur={()=>setTimeout(()=>setOpen(false),200)}/>
      {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--s1)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",zIndex:200,maxHeight:180,overflowY:"auto",marginTop:4,boxShadow:"0 8px 24px #00000060"}}>
        {sugs.map((s,i)=><div key={i} style={{padding:"0.625rem 0.875rem",fontSize:"0.82rem",cursor:"pointer",borderBottom:"1px solid var(--border)",color:"var(--text)"}} onMouseDown={()=>{onChange(s.ciudad||s.label.split(",")[0].trim());onSelect(s);setOpen(false);}}>{s.label}</div>)}
      </div>}
    </div>
  );
}

const makeCSS = accent => `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#08080F;--s1:#0F0F1A;--s2:#15151F;--s3:#1C1C28;--border:#ffffff0D;--border2:#ffffff18;--border3:#ffffff28;--a1:${accent.a1};--a2:${accent.a2};--green:#06D6A0;--red:#FF3D5A;--yellow:#FFD166;--text:#EEEDF5;--muted:#68687A;--muted2:#45455A;--r:16px;--r2:12px;}
body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
.btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;border:none;border-radius:var(--r2);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.875rem;transition:all 0.15s;padding:0.875rem 1.5rem;width:100%}
.bp{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff}.bp:hover{transform:translateY(-1px)}
.bg{background:var(--s2);color:var(--text);border:1px solid var(--border2)}.bg:hover{border-color:var(--border3)}
.bsm{padding:0.4rem 0.875rem;font-size:0.78rem;border-radius:8px;width:auto}
.bd{background:#FF3D5A10;color:var(--red);border:1px solid #FF3D5A20}.bd:hover{background:#FF3D5A20}
.page{flex:1;overflow-y:auto;padding:1.125rem;display:flex;flex-direction:column;gap:0.875rem;padding-bottom:5rem}
.ptitle{font-family:'Bebas Neue',sans-serif;font-size:1.75rem;letter-spacing:0.04em}
.card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:1.125rem}
.chd{font-size:0.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.875rem}
.fld{display:flex;flex-direction:column;gap:0.325rem}
.lbl{font-size:0.73rem;color:var(--muted);font-weight:600}
.inp{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9rem;padding:0.7rem 0.9rem;width:100%;outline:none;transition:border-color 0.2s}.inp:focus{border-color:var(--a1)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem}
.sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2368687A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.875rem center;padding-right:2.25rem}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--s2);border:1px solid var(--border2);border-radius:10px;padding:0.625rem 0.875rem}
.toggle-lbl{font-size:0.875rem;font-weight:500}
.toggle{width:42px;height:22px;border-radius:999px;background:var(--s3);border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}.toggle.on{background:var(--a1)}.toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform 0.2s}.toggle.on::after{transform:translateX(20px)}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.stat{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.2rem}
.slbl{font-size:0.63rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em}
.sval{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.02em;line-height:1.1}
.g{color:var(--green)}.r{color:var(--red)}.y{color:var(--yellow)}.a{color:var(--a2)}
.hcard{position:relative;overflow:hidden;background:var(--s1);border:1px solid ${accent.a1}22;border-radius:var(--r);padding:1.375rem}.hcard::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;background:radial-gradient(circle,${accent.a1}15,transparent 65%);pointer-events:none}.hcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2},transparent)}
.hlbl{font-size:0.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em}
.hval{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.02em;line-height:1.05;color:var(--a1);margin-top:0.1rem}
.hsub{font-size:0.76rem;color:var(--muted);margin-top:0.3rem}
.trip{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.45rem;cursor:pointer;transition:border-color 0.2s}.trip:hover{border-color:var(--border3)}
.ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem}
.troute{font-weight:700;font-size:0.875rem}.tdate{font-size:0.68rem;color:var(--muted);margin-top:2px}
.trow{display:flex;gap:0.75rem;font-size:0.73rem;color:var(--muted);flex-wrap:wrap}
.tfoot{display:flex;justify-content:space-between;align-items:center;padding-top:0.45rem;border-top:1px solid var(--border)}
.badge{display:inline-flex;align-items:center;padding:0.18rem 0.6rem;border-radius:999px;font-size:0.68rem;font-weight:700}
.bg-g{background:#06D6A012;color:var(--green);border:1px solid #06D6A020}
.bg-r{background:#FF3D5A12;color:var(--red);border:1px solid #FF3D5A20}
.bg-y{background:#FFD16612;color:var(--yellow);border:1px solid #FFD16620}
.alert{display:flex;align-items:flex-start;gap:0.75rem;padding:0.875rem;border-radius:var(--r2);font-size:0.82rem;line-height:1.55}
.ar{background:#FF3D5A0C;border:1px solid #FF3D5A20;color:#FFB3BC}
.ay{background:#FFD1660C;border:1px solid #FFD16620;color:#FFE9A0}
.alert-item{display:flex;align-items:center;justify-content:space-between;padding:0.7rem;background:var(--s2);border-radius:10px;border:1px solid var(--border)}
.alert-item.r{border-color:#FF3D5A25}.alert-item.y{border-color:#FFD16625}
.alert-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}.dot-r{background:var(--red)}.dot-y{background:var(--yellow)}.dot-g{background:var(--green)}
.ov{position:fixed;inset:0;background:#08080F;z-index:100;display:flex;flex-direction:column;overflow-y:auto;}
.modal{background:#08080F;width:100%;max-width:430px;margin:0 auto;padding:1.5rem;padding-bottom:6rem;display:flex;flex-direction:column;gap:0.875rem;flex:1;}
.mdrag{width:36px;height:4px;background:var(--border2);border-radius:999px;margin:0 auto -0.25rem}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:0.04em}
.mact{display:flex;gap:0.75rem;margin-top:0.25rem}
.vcard{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:0.875rem;display:flex;align-items:center;gap:0.875rem;cursor:pointer;transition:border-color 0.2s}.vcard:hover{border-color:var(--border3)}
.vcard-foto{width:42px;height:42px;border-radius:10px;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);overflow:hidden}
.photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:var(--s2);border:1.5px dashed var(--border2);border-radius:var(--r2);padding:1rem;cursor:pointer;width:100%}.photo-btn:hover{border-color:var(--a1)}
.accent-dot{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s}.accent-dot.sel{border-color:#fff;transform:scale(1.15)}
.empty{display:flex;flex-direction:column;align-items:center;gap:0.875rem;padding:2rem 1rem;color:var(--muted);text-align:center}
.ei{width:46px;height:46px;border-radius:14px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.hdr{padding:0.75rem 1.125rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(15,15,26,0.92);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}
.hdr-left{display:flex;align-items:center;gap:0.75rem}
.hdr-logo{width:34px;height:34px;border-radius:10px;object-fit:cover}
.hdr-logo-ph{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#fff}
.hdr-brand{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.07em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.hdr-sub{font-size:0.62rem;color:var(--muted);margin-top:1px}
.trial-chip{display:flex;align-items:center;gap:0.375rem;background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.275rem 0.7rem;font-size:0.7rem;color:var(--muted)}
.chip-d{color:var(--a2);font-weight:700;font-size:0.78rem}
.nav{display:grid;grid-template-columns:repeat(5,1fr);background:rgba(15,15,26,0.95);border-top:1px solid var(--border);position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:20;backdrop-filter:blur(16px)}
.nb{display:flex;flex-direction:column;align-items:center;gap:0.18rem;padding:0.625rem 0 0.5rem;border:none;background:none;color:var(--muted2);cursor:pointer;font-size:0.55rem;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;letter-spacing:0.03em;transition:color 0.15s;position:relative}
.nb.on{color:var(--a1)}.nb.on::after{content:'';position:absolute;top:0;inset-x:20%;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2});border-radius:0 0 3px 3px}
.bwrap{display:flex;flex-direction:column;gap:0.625rem}.brow{display:flex;flex-direction:column;gap:0.3rem}
.bmeta{display:flex;justify-content:space-between;font-size:0.78rem}
.btrack{height:5px;background:var(--s3);border-radius:999px;overflow:hidden}.bfill{height:100%;border-radius:999px}
.tab-row{display:flex;gap:0.375rem;margin-bottom:0.25rem}
.tab-btn{flex:1;padding:0.45rem;font-size:0.75rem;border-radius:8px;border:1px solid var(--border2);background:var(--s2);color:var(--muted);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;transition:all 0.15s;text-align:center}.tab-btn.on{background:var(--a1);color:#fff;border-color:var(--a1)}
.semi-tag{display:inline-flex;align-items:center;gap:0.25rem;background:var(--s3);border:1px solid var(--border2);border-radius:6px;padding:0.2rem 0.5rem;font-size:0.68rem;color:var(--muted)}
.code-box{background:var(--s3);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between}
.code-text{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:0.15em;color:var(--a1)}
.gfijo-section{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);overflow:hidden}
.gfijo-header{display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;cursor:pointer}
.gfijo-title{font-weight:700;font-size:0.9rem;display:flex;align-items:center;gap:0.5rem}
.gfijo-body{padding:0 1rem 1rem;display:flex;flex-direction:column;gap:0.5rem}
.gfijo-row{display:flex;align-items:center;gap:0.625rem}
.gfijo-lbl{flex:1;font-size:0.83rem;color:var(--text)}
.gfijo-inp{width:100px;background:var(--s1);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.83rem;padding:0.4rem 0.625rem;outline:none;text-align:right}.gfijo-inp:focus{border-color:var(--a1)}
.gfijo-periodo{font-size:0.68rem;color:var(--muted);width:40px;text-align:center}
.nota-anual{font-size:0.68rem;color:var(--a2)}
.mes-badge{display:inline-flex;align-items:center;background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.2rem 0.75rem;font-size:0.75rem;font-weight:600;color:var(--text)}
.auth-wrap{flex:1;display:flex;flex-direction:column;overflow-y:auto}
.auth-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:300px;height:300px;background:radial-gradient(circle,${accent.a1}18,transparent 65%);pointer-events:none}
.auth-logo{position:relative;z-index:1;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px ${accent.a1}35}
.auth-wordmark{position:relative;z-index:1;font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.06em;line-height:1;background:linear-gradient(160deg,#fff 0%,#FFD166 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.step-dot{width:8px;height:8px;border-radius:50%;background:var(--s3);transition:all 0.2s}.step-dot.on{background:var(--a1);width:24px;border-radius:4px}
.pass-wrap{position:relative}.pass-eye{position:absolute;right:0.875rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);padding:0}
.role-card{display:flex;align-items:center;gap:0.875rem;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem;cursor:pointer;transition:border-color 0.2s}.role-card.sel{border-color:var(--a1)}
.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.5rem 1.25rem;font-size:0.83rem;color:var(--text);z-index:100;white-space:nowrap}
.iva-box{background:var(--s3);border-radius:10px;padding:0.75rem;display:flex;flex-direction:column;gap:0.375rem;font-size:0.8rem}
.mchart-wrap{display:flex;flex-direction:column;gap:0.5rem}
.mchart{display:flex;align-items:flex-end;gap:4px;height:60px}
.mbar{flex:1;border-radius:4px 4px 0 0;min-width:6px;transition:height 0.5s}
.mtable{width:100%;border-collapse:collapse;font-size:0.78rem}
.mtable th{text-align:left;padding:0.35rem 0.5rem;color:var(--muted);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border)}
.mtable td{padding:0.45rem 0.5rem;border-bottom:1px solid var(--border)}.mtable tr:last-child td{border-bottom:none}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.25s ease both}
`;

function PhotoUpload({value,onChange,label="Foto",height=80}) {
  const ref=useRef();
  return(
    <div className="fld">
      <label className="lbl">{label}</label>
      <div className="photo-btn" style={{height}} onClick={()=>ref.current.click()}>
        {value?<img src={value} alt="" style={{width:"100%",height:height-16,objectFit:"cover",borderRadius:8}}/>:<><Icon d={I.camera} size={18} color="var(--muted)"/><span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Toca para subir foto</span></>}
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);}}/>
      </div>
    </div>
  );
}

function Toast({msg,onDone}) { useEffect(()=>{const t=setTimeout(onDone,2500);return()=>clearTimeout(t);},[]);return<div className="toast">{msg}</div>; }

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthPage({onAuth,accent}) {
  const[mode,setMode]=useState("welcome");
  const[step,setStep]=useState(1);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[showPass,setShowPass]=useState(false);
  const[form,setForm]=useState({nombre:"",empresa:"",email:"",telefono:"",rol:"gerente",codigoEmpresa:"",password:"",confirmPass:""});

  const feats=[
    {icon:I.trend,col:"#FF3D5A",bg:"#FF3D5A15",t:"Rentabilidad real por km",s:"Fijos + variables calculados"},
    {icon:I.truck,col:"#06D6A0",bg:"#06D6A015",t:"Gestión de flota completa",s:"Tractoras, semis y conjuntos"},
    {icon:I.camera,col:"#FF7A3D",bg:"#FF7A3D15",t:"Escaneo de tickets con IA",s:"Foto al ticket y listo"},
    {icon:I.chart,col:"#FFD166",bg:"#FFD16615",t:"Resumen mensual y anual",s:"Con IVA para tu gestor"},
  ];

  const handleRegister=async()=>{
    if(step===1){if(!form.nombre||!form.email){setErr("Nombre y email son obligatorios");return;}setErr("");setStep(2);return;}
    if(step===2){
      if(form.rol==="chofer"&&!form.codigoEmpresa){setErr("El codigo de empresa es obligatorio para choferes");return;}
      if(form.rol==="chofer"){
        const{data:emp}=await sb.from("empresas").select("id").eq("codigo",form.codigoEmpresa.toUpperCase()).single();
        if(!emp){setErr("Codigo incorrecto. Pidele el codigo FR-XXXX a tu gerente.");return;}
      }
      setErr("");setStep(3);return;
    }
    if(step===3){
      if(!form.password){setErr("Introduce una contraseña");return;}
      if(form.password!==form.confirmPass){setErr("Las contraseñas no coinciden");return;}
      if(form.password.length<6){setErr("Mínimo 6 caracteres");return;}
      setLoading(true);
      try{
        const{data,error}=await sb.auth.signUp({email:form.email,password:form.password,options:{data:{nombre:form.nombre,empresa:form.empresa,rol:form.rol}}});
        if(error){setErr(error.message);setLoading(false);return;}
        let empresaId=null;
        if(form.rol==="gerente"){
          const{data:emp}=await sb.from("empresas").insert({nombre:form.empresa||form.nombre,codigo:genCode(),gerente_id:data.user.id}).select().single();
          empresaId=emp?.id;
        }else if(form.codigoEmpresa){
          const{data:emp}=await sb.from("empresas").select("id").eq("codigo",form.codigoEmpresa.toUpperCase()).single();
          empresaId=emp?.id;
        }
        await sb.from("perfiles").upsert({id:data.user.id,nombre:form.nombre,empresa:form.empresa,email:form.email,telefono:form.telefono,rol:form.rol,accent_idx:0,trial_start:new Date().toISOString(),empresa_id:empresaId});
        const{data:p}=await sb.from("perfiles").select("*").eq("id",data.user.id).single();
        onAuth(data.user,p||{});
      }catch(e){setErr(e.message);}
      setLoading(false);
    }
  };

  const handleLogin=async()=>{
    if(!form.email||!form.password){setErr("Email y contraseña obligatorios");return;}
    setLoading(true);
    const{data,error}=await sb.auth.signInWithPassword({email:form.email,password:form.password});
    if(error){setErr("Email o contraseña incorrectos");setLoading(false);return;}
    const{data:p}=await sb.from("perfiles").select("*").eq("id",data.user.id).single();
    onAuth(data.user,p||{});setLoading(false);
  };

  if(mode==="welcome")return(
    <div className="auth-wrap fu">
      <div style={{position:"relative",padding:"3rem 1.75rem 2rem",textAlign:"center",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",gap:"1.25rem"}}>
        <div className="auth-glow"/>
        <div className="auth-logo"><svg width="38" height="38" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
        <div><div className="auth-wordmark">Flota<br/>Rentable</div><p style={{position:"relative",zIndex:1,fontSize:"0.9rem",color:"var(--muted)",lineHeight:1.65,maxWidth:270}}>Tu negocio de transporte en el bolsillo.</p></div>
      </div>
      <div style={{padding:"0 1.5rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {feats.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"0.875rem",background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.875rem 1rem"}}><div style={{width:34,height:34,borderRadius:10,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={f.icon} size={16} color={f.col}/></div><div><div style={{fontSize:"0.875rem",fontWeight:600}}>{f.t}</div><div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:1}}>{f.s}</div></div></div>)}
      </div>
      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        <div style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"2.8rem",letterSpacing:"0.04em",lineHeight:1,background:`linear-gradient(135deg,${accent.a1},#FFD166)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>7</div>
          <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>días completamente gratis</div><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:2}}>Después desde 14,99€/mes · Sin permanencia</div></div>
        </div>
        <button className="btn bp" onClick={()=>setMode("register")}>Empezar gratis <Icon d={I.arrow} size={15} color="#fff"/></button>
        <button className="btn bg" onClick={()=>setMode("login")}>Ya tengo cuenta</button>
      </div>
    </div>
  );

  if(mode==="login")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>setMode("welcome")}><Icon d={I.back} size={14}/> Volver</button>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"2rem",letterSpacing:"0.04em"}}>Iniciar sesión</div>
        <div className="fld"><label className="lbl">Email</label><input className="inp" type="email" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="fld"><label className="lbl">Contraseña</label><div className="pass-wrap"><input className="inp" type={showPass?"text":"password"} placeholder="••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button></div></div>
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleLogin} disabled={loading}>{loading?<span className="spinner"/>:"Entrar"}</button>
      </div>
    </div>
  );

  return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>step>1?setStep(step-1):setMode("welcome")}><Icon d={I.back} size={14}/> {step>1?"Atrás":"Volver"}</button>
        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center"}}>{[1,2,3].map(n=><div key={n} className={`step-dot ${step===n?"on":""}`}/>)}</div>
        {step===1&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tus datos</div>
          <div className="fld"><label className="lbl">Nombre *</label><input className="inp" placeholder="Juan García" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Empresa (opcional)</label><input className="inp" placeholder="Transportes García S.L." value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Email *</label><input className="inp" type="email" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Teléfono</label><input className="inp" type="tel" placeholder="600 000 000" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div></>}
        {step===2&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tu rol</div>
          {[["gerente","👔 Gerente / Propietario","Acceso completo — configura y ve todo"],["chofer","🚛 Chófer","Solo registro de viajes y gastos"]].map(([rol,title,sub])=>(
            <div key={rol} className={`role-card ${form.rol===rol?"sel":""}`} onClick={()=>setForm({...form,rol})}>
              <div style={{width:40,height:40,borderRadius:10,background:form.rol===rol?`${accent.a1}20`:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={rol==="gerente"?I.user:I.truck} size={20} color={form.rol===rol?accent.a1:"var(--muted)"}/></div>
              <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>{title}</div><div style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:2}}>{sub}</div></div>
            </div>
          ))}
          {form.rol==="chofer"&&<>
            <div style={{background:"#FFD16612",border:"1px solid #FFD16630",borderRadius:"var(--r2)",padding:"0.875rem",fontSize:"0.82rem",color:"var(--yellow)"}}>
              Pide el codigo KM-XXXX a tu gerente antes de continuar
            </div>
            <div className="fld">
              <label className="lbl">Codigo de empresa *</label>
              <input className="inp" placeholder="FR-XXXX" value={form.codigoEmpresa} onChange={e=>setForm({...form,codigoEmpresa:e.target.value.toUpperCase()})} style={{letterSpacing:"0.1em",fontWeight:700,fontSize:"1rem"}}/>
            </div>
          </>}</>}
        {step===3&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Contraseña</div>
          <div style={{background:`${accent.a1}12`,border:`1px solid ${accent.a1}30`,borderRadius:"var(--r2)",padding:"0.875rem",fontSize:"0.82rem"}}>🎁 <strong>7 días gratis</strong> — Sin tarjeta para empezar</div>
          <div className="fld"><label className="lbl">Contraseña</label><div className="pass-wrap"><input className="inp" type={showPass?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button></div></div>
          <div className="fld"><label className="lbl">Confirmar contraseña</label><input className="inp" type="password" placeholder="Repite la contraseña" value={form.confirmPass} onChange={e=>setForm({...form,confirmPass:e.target.value})}/></div></>}
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleRegister} disabled={loading}>{loading?<span className="spinner"/>:step<3?"Continuar →":"Crear cuenta gratis"}</button>
        {step===1&&<p style={{textAlign:"center",fontSize:"0.73rem",color:"var(--muted)"}}>¿Ya tienes cuenta? <span style={{color:"var(--a1)",cursor:"pointer"}} onClick={()=>setMode("login")}>Inicia sesión</span></p>}
      </div>
    </div>
  );
}

// ── FLOTA PAGE ────────────────────────────────────────────────────────────────
function FlotaPage({userId,perfil,updatePerfil,tractoras,semis,setTractoras,setSemis}) {
  const[editT,setEditT]=useState(null);
  const[editS,setEditS]=useState(null);

  const saveT=async t=>{const p={...t,user_id:userId};if(t.id){await sb.from("tractoras").update(p).eq("id",t.id);}else{await sb.from("tractoras").insert({...p,id:undefined});}const{data}=await sb.from("tractoras").select("*").eq("user_id",userId);setTractoras(data||[]);setEditT(null);};
  const deleteT=async id=>{await sb.from("tractoras").delete().eq("id",id);setTractoras(tractoras.filter(x=>x.id!==id));};
  const saveS=async s=>{const p={...s,user_id:userId};if(s.id){await sb.from("semirremolques").update(p).eq("id",s.id);}else{await sb.from("semirremolques").insert({...p,id:undefined});}const{data}=await sb.from("semirremolques").select("*").eq("user_id",userId);setSemis(data||[]);setEditS(null);};
  const deleteS=async id=>{await sb.from("semirremolques").delete().eq("id",id);setSemis(semis.filter(x=>x.id!==id));};

  if(editT)return<TruckForm t={editT} semis={semis} onSave={saveT} onCancel={()=>setEditT(null)} onDelete={deleteT}/>;
  if(editS)return<SemiForm s={editS} onSave={saveS} onCancel={()=>setEditS(null)} onDelete={deleteS}/>;

  return(
    <div className="page fu">
      <div className="ptitle">Flota</div>
      <div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🚛 Tractoras</span>
            <button className="btn bg bsm" onClick={()=>setEditT({subtipo:"Tractora",conjunto_fijo:false})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {tractoras.length===0&&<div className="empty" style={{padding:"1rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin tractoras</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {tractoras.map(t=>{const semi=semis.find(s=>s.id===t.semi_habitual_id);
              const consumo=parseFloat(t.consumo_estimado)||32;
              const precioG=parseFloat(t.precio_gasoil_inicial)||1.65;
              const combustibleKm=(consumo/100)*precioG;
              return(
              <div key={t.id} className="vcard" onClick={()=>setEditT(t)}>
                <div className="vcard-foto">{t.foto?<img src={t.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="var(--muted)"/>}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.875rem"}}>{t.matricula||"Sin matrícula"}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{t.subtipo||"Tractora"}</div>
                  {t.apodo&&<div style={{fontSize:"0.7rem",color:"var(--a2)",marginTop:1,fontWeight:600}}>"{t.apodo}"</div>}
                  {semi&&<div className="semi-tag" style={{marginTop:3}}><Icon d={I.link} size={10}/>{semi.matricula}{t.conjunto_fijo?" · fijo":""}</div>}
                  <div style={{fontSize:"0.7rem",color:"var(--a1)",marginTop:3,fontWeight:600}}>~{combustibleKm.toFixed(3).replace(".",",")} €/km combustible est.</div>
                </div>
                <Icon d={I.edit} size={15} color="var(--muted)"/>
              </div>
            );})}
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🔧 Semirremolques</span>
            <button className="btn bg bsm" onClick={()=>setEditS({subtipo:"Tautliner"})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {semis.length===0&&<div className="empty" style={{padding:"1rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin semirremolques</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {semis.map(s=><div key={s.id} className="vcard" onClick={()=>setEditS(s)}>
              <div className="vcard-foto">{s.foto?<img src={s.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="#06D6A0"/>}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.875rem"}}>{s.matricula||"Sin matrícula"}</div><div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{s.subtipo}</div>{s.apodo&&<div style={{fontSize:"0.7rem",color:"var(--a2)",marginTop:1,fontWeight:600}}>"{s.apodo}"</div>}</div>
              <Icon d={I.edit} size={15} color="var(--muted)"/>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function TruckForm({t,semis,onSave,onCancel,onDelete}) {
  const[form,setForm]=useState(t||{subtipo:"Tractora",conjunto_fijo:false});
  return(
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}><button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button><div className="ptitle">{form.matricula||"Nueva tractora"}</div></div>
        {form.id&&<button className="btn bd bsm" onClick={()=>{onDelete(form.id);onCancel();}}><Icon d={I.trash} size={14}/></button>}
      </div>
      <div className="card">
        <div className="chd">Datos del vehículo</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={form.matricula||""} placeholder="1234 ABC" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="El Titán" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.subtipo||"Tractora"} onChange={e=>setForm({...form,subtipo:e.target.value})}>{TIPOS_T.map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="fld"><label className="lbl">Consumo L/100km</label><input className="inp" type="number" value={form.consumo_estimado||""} placeholder="32" onChange={e=>setForm({...form,consumo_estimado:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Precio gasoil actual (€/L)</label><input className="inp" type="number" value={form.precio_gasoil_inicial||""} placeholder="1,65" onChange={e=>setForm({...form,precio_gasoil_inicial:e.target.value})}/></div>
        </div>
      </div>
      {semis.length>0&&<div className="card">
        <div className="chd">Conjunto habitual</div>
        <div className="fld" style={{marginBottom:"0.625rem"}}><label className="lbl">Semirremolque habitual</label>
          <select className="inp sel" value={form.semi_habitual_id||""} onChange={e=>setForm({...form,semi_habitual_id:e.target.value})}>
            <option value="">Sin semirremolque fijo</option>{semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
          </select></div>
        {form.semi_habitual_id&&<div className="toggle-row"><span className="toggle-lbl">Siempre va el mismo conjunto</span><button className={`toggle ${form.conjunto_fijo?"on":""}`} onClick={()=>setForm({...form,conjunto_fijo:!form.conjunto_fijo})}/></div>}
      </div>}
      <div className="card">
        <div className="chd">Alertas de mantenimiento</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {[["fecha_itv","📋 Próxima ITV"],["fecha_seguro_vto","🛡️ Vencimiento seguro"],["fecha_aceite","🔧 Próximo cambio aceite"],["fecha_tarjeta","📄 Tarjeta de transporte"]].map(([k,l])=>(
            <div className="fld" key={k}><label className="lbl">{l}</label><input className="inp" type="date" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}><button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={()=>onSave(form)}>Guardar</button></div>
    </div>
  );
}

function SemiForm({s,onSave,onCancel,onDelete}) {
  const[form,setForm]=useState(s||{subtipo:"Tautliner"});
  return(
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}><button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button><div className="ptitle">{form.matricula||"Nuevo semirremolque"}</div></div>
        {form.id&&<button className="btn bd bsm" onClick={()=>{onDelete(form.id);onCancel();}}><Icon d={I.trash} size={14}/></button>}
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={form.matricula||""} placeholder="R-1234" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="opcional" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.subtipo||"Tautliner"} onChange={e=>setForm({...form,subtipo:e.target.value})}>{TIPOS_S.map(o=><option key={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div className="card">
        <div className="chd">Alertas</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          <div className="fld"><label className="lbl">📋 Próxima ITV remolque</label><input className="inp" type="date" value={form.fecha_itv||""} onChange={e=>setForm({...form,fecha_itv:e.target.value})}/></div>
          <div className="fld"><label className="lbl">🛡️ Vencimiento seguro</label><input className="inp" type="date" value={form.fecha_seguro_vto||""} onChange={e=>setForm({...form,fecha_seguro_vto:e.target.value})}/></div>
        </div>
      </div>
      {form.subtipo==="Frigorífico"&&<div className="card">
        <div className="chd">🧊 Motor frigorífico</div>
        <div style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:"0.75rem"}}>El motor del frigo tiene su propio mantenimiento independiente del semirremolque</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          <div className="fld"><label className="lbl">🔧 Próximo cambio aceite motor frigo</label><input className="inp" type="date" value={form.frigo_fecha_aceite||""} onChange={e=>setForm({...form,frigo_fecha_aceite:e.target.value})}/></div>
          <div className="fld"><label className="lbl">⚙️ Próxima revisión motor frigo</label><input className="inp" type="date" value={form.frigo_fecha_revision||""} onChange={e=>setForm({...form,frigo_fecha_revision:e.target.value})}/></div>
          <div className="fld"><label className="lbl">🌡️ Última revisión gas refrigerante</label><input className="inp" type="date" value={form.frigo_fecha_gas||""} onChange={e=>setForm({...form,frigo_fecha_gas:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Marca motor frigo</label><input className="inp" type="text" value={form.frigo_marca||""} placeholder="Thermo King, Carrier..." onChange={e=>setForm({...form,frigo_marca:e.target.value})}/></div>
        </div>
      </div>}
      <div style={{display:"flex",gap:"0.75rem"}}><button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={()=>onSave(form)}>Guardar</button></div>
    </div>
  );
}

// ── GASTOS PAGE ───────────────────────────────────────────────────────────────
function GastosPage({userId,tractoras,semis,esGerente,accentIdx,gastosFijos,setGastosFijos}) {
  const accent=ACCENTS[accentIdx||0];
  const[gastos,setGastos]=useState([]);
  const[modal,setModal]=useState(false);
  const[editGasto,setEditGasto]=useState(null);
  const[toast,setToast]=useState("");
  const[openSections,setOpenSections]=useState({empresa:true});
  const scanRef=useRef();
  const mesFiltro=nowMes();
  const anoActual=nowAno();

  useEffect(()=>{
    sb.from("gastos").select("*").eq("user_id",userId).eq("mes",mesFiltro).order("fecha",{ascending:false}).then(({data:g})=>{setGastos(g||[]);});
  },[]);

  const vehiculos=[{id:"empresa",label:"🏢 Empresa",icon:I.building,conceptos:CONCEPTOS_EMPRESA},...tractoras.map(t=>({id:t.id,label:`🚛 ${t.matricula||"Sin mat."}${t.apodo?` "${t.apodo}"`:""}`,icon:I.truck,conceptos:CONCEPTOS_VEHICULO})),...semis.map(s=>({id:s.id,label:`🚛 ${s.matricula||"Sin mat."}`,icon:I.truck,conceptos:["Seguro anual","ITV","Neumáticos","Mantenimiento","Otros"]}))];

  const getFijo=(entidadId,concepto)=>gastosFijos.find(g=>g.entidad_id===entidadId&&g.concepto===concepto);

  const saveFijo=async(entidadId,concepto,importe,periodo)=>{
    const existing=getFijo(entidadId,concepto);
    if(existing){
      await sb.from("gastos_fijos").update({importe,periodo}).eq("id",existing.id);
      setGastosFijos(gastosFijos.map(g=>g.id===existing.id?{...g,importe,periodo}:g));
    }else{
      const{data}=await sb.from("gastos_fijos").insert({user_id:userId,entidad_id:entidadId,concepto,importe,periodo,ano:anoActual}).select().single();
      if(data)setGastosFijos([...gastosFijos,data]);
    }
  };

  const emptyForm={fecha:new Date().toISOString().slice(0,10),tipo:"Combustible",titulo:"",importe:"",litros:"",precio_litro:"",odometro:"",pais:"España",vehicle_id:tractoras[0]?.id||"",vehicle_tipo:"tractora",nota:"",mes:mesFiltro,ano:anoActual,imp_ano:anoActual,imp_mes_ini:"1",imp_mes_fin:"12"};

  const openNew=()=>{setEditGasto(null);setModal({...emptyForm});};
  const openEdit=g=>{setEditGasto(g);setModal({...g});};

  const saveGasto=async()=>{
    if(!modal.importe||modal.importe===""||isNaN(parseFloat(modal.importe))){setToast("⚠️ Introduce un importe válido");return;}
    const payload={fecha:modal.fecha,tipo:modal.tipo,titulo:modal.titulo||"",importe:parseFloat(modal.importe),litros:modal.litros?parseFloat(modal.litros):null,precio_litro:modal.precio_litro?parseFloat(modal.precio_litro):null,odometro:modal.odometro?parseFloat(modal.odometro):null,pais:modal.pais||"España",vehicle_id:modal.tipo==="Impuesto"?"empresa":modal.vehicle_id||null,vehicle_tipo:modal.tipo==="Impuesto"?"empresa":modal.vehicle_tipo||"tractora",nota:modal.nota||"",mes:mesFiltro,ano:anoActual,imp_ano:modal.tipo==="Impuesto"?modal.imp_ano||anoActual:null,imp_mes_ini:modal.tipo==="Impuesto"?parseInt(modal.imp_mes_ini)||1:null,imp_mes_fin:modal.tipo==="Impuesto"?parseInt(modal.imp_mes_fin)||12:null,user_id:String(userId)};
    if(editGasto?.id){
      await sb.from("gastos").update(payload).eq("id",editGasto.id);
      setGastos(gastos.map(g=>g.id===editGasto.id?{...g,...payload,id:editGasto.id}:g));
      setToast("✅ Gasto actualizado");
    }else{
      const{data,error}=await sb.from("gastos").insert(payload).select();
      if(error){setToast("❌ "+error.message);return;}
      const nuevo=Array.isArray(data)?data[0]:data;
      if(nuevo)setGastos([nuevo,...gastos]);
      else{const{data:fresh}=await sb.from("gastos").select("*").eq("user_id",userId).eq("mes",mesFiltro).order("fecha",{ascending:false});setGastos(fresh||[]);}
      setToast("✅ Gasto guardado");
    }
    setModal(false);setEditGasto(null);
  };

  const deleteGasto=async id=>{await sb.from("gastos").delete().eq("id",id);const{data:fresh}=await sb.from("gastos").select("*").eq("user_id",userId).eq("mes",mesFiltro).order("fecha",{ascending:false});setGastos(fresh||[]);setToast("🗑️ Eliminado");};

  const handleLitros=(l,p)=>{const imp=(parseFloat(l)||0)*(parseFloat(p)||0);setModal(f=>({...f,litros:l,precio_litro:p,importe:imp>0?imp.toFixed(2):f.importe}));};

  const totalVar=gastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const totalFijosMes=calcGastosFijosMes(gastosFijos,tractoras,semis);
  const mesLabel=MESES_ES[parseInt(mesFiltro.split("-")[1])-1]+" "+mesFiltro.split("-")[0];

  const toggleSection=id=>setOpenSections(s=>({...s,[id]:!s[id]}));

  return(<>
    {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Gastos</div>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          <div className="mes-badge">{mesLabel}</div>
          <input ref={scanRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{
            const f=e.target.files[0];if(!f)return;
            const r=new FileReader();
            r.onload=async ev=>{
              const b64=ev.target.result.split(",")[1];
              try{
                const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},{type:"text",text:`Eres un asistente que analiza tickets y facturas de transporte. Extrae los datos aunque la imagen no sea perfecta. Responde SOLO con JSON válido sin markdown ni explicaciones: {"tipo":"Combustible|Peaje|Mantenimiento|ITV|Otros","importe":0.00,"litros":null,"preciolitro":null,"fecha":"YYYY-MM-DD","nota":"descripción breve"}. Si no puedes leer un campo ponlo en null. Fecha de hoy: ${new Date().toISOString().slice(0,10)}`}]}]})});
                const data=await res.json();
                const txt=data.content?.[0]?.text||"";
                const clean=txt.replace(/```json|```/g,"").trim();
                const parsed=JSON.parse(clean);
                setModal({...emptyForm,tipo:parsed.tipo||"Combustible",importe:parsed.importe?.toString()||"",litros:parsed.litros?.toString()||"",precio_litro:parsed.preciolitro?.toString()||"",fecha:parsed.fecha||new Date().toISOString().slice(0,10),nota:parsed.nota||""});
                setToast("✅ Ticket escaneado");
              }catch{setToast("⚠️ No se pudo leer. Añade manualmente");}
            };r.readAsDataURL(f);
          }}/>
          <button className="btn bg bsm" onClick={()=>scanRef.current.click()}><Icon d={I.camera} size={14}/></button>
          <button className="btn bp bsm" onClick={openNew}><Icon d={I.plus} size={14}/> Añadir</button>
        </div>
      </div>

      {esGerente&&<div className="sgrid">
        <div className="stat"><div className="slbl">Variables mes</div><div className="sval r">{euros(totalVar)}</div></div>
        <div className="stat"><div className="slbl">Fijos mes</div><div className="sval y">{euros(totalFijosMes)}</div></div>
      </div>}

      {gastos.length===0?<div className="empty"><div className="ei"><Icon d={I.coin} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin gastos este mes</strong><span style={{fontSize:"0.8rem"}}>Los gastos se archivan automáticamente cada mes</span></div></div>
      :<><p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Gastos variables — {mesLabel}</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {gastos.map(g=>{
          const veh=[...tractoras,...semis].find(v=>v.id===g.vehicle_id);
          return(
            <div className="trip" key={g.id} onClick={()=>openEdit(g)}>
              <div className="ttop">
                <div><div className="troute">{g.tipo}{g.pais&&g.pais!=="España"?` · ${g.pais}`:""}</div><div className="tdate">{fmtDate(g.fecha)}{veh?` · ${veh.matricula}`:""}{g.nota?` · ${g.nota}`:""}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:"1.1rem",color:"var(--red)",letterSpacing:"0.02em"}}>{euros(parseFloat(g.importe))}</span>
                  <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={e=>{e.stopPropagation();deleteGasto(g.id);}}><Icon d={I.trash} size={12}/></button>
                </div>
              </div>
              {g.litros&&<div className="trow"><span>⛽ {g.litros}L{g.precio_litro?` · ${g.precio_litro}€/L`:""}</span>{g.odometro&&<span>📍 {parseInt(g.odometro).toLocaleString("es-ES")} km</span>}</div>}
            </div>
          );
        })}
      </div></>}

      <div style={{marginTop:"0.5rem"}}>
        <p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.625rem"}}>Gastos fijos mensuales</p>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {vehiculos.map(v=>(
            <div key={v.id} className="gfijo-section">
              <div className="gfijo-header" onClick={()=>toggleSection(v.id)}>
                <div className="gfijo-title"><Icon d={v.icon} size={16} color="var(--a1)"/>{v.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  {esGerente&&<span style={{fontSize:"0.75rem",color:"var(--muted)"}}>
                    {euros(gastosFijos.filter(g=>g.entidad_id===v.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0))}/mes
                  </span>}
                  <Icon d={I.chevron} size={14} color="var(--muted)"/>
                </div>
              </div>
              {openSections[v.id]&&<div className="gfijo-body">
                {v.conceptos.map(concepto=>{
                  const fijo=getFijo(v.id,concepto);
                  const esAnual=fijo?.periodo==="anual"||(concepto.includes("anual")||concepto==="ITV");
                  return(
                    <div key={concepto} className="gfijo-row">
                      <span className="gfijo-lbl">{concepto}</span>
                      <input className="gfijo-inp" type="number" placeholder="0" defaultValue={fijo?.importe||""} key={fijo?.id||concepto} onBlur={e=>{const val=e.target.value;if(val&&val!==String(fijo?.importe||""))saveFijo(v.id,concepto,parseFloat(val),esAnual?"anual":"mensual");}}/>
                      <span className="gfijo-periodo">{esAnual?"€/año":"€/mes"}</span>
                      {esAnual&&fijo?.importe&&<span className="nota-anual">{euros((parseFloat(fijo.importe)||0)/12)}/m</span>}
                    </div>
                  );
                })}
                {v.id==="empresa"&&<div className="gfijo-row" style={{marginTop:"0.25rem"}}>
                  <input className="inp" placeholder="Otro concepto" style={{fontSize:"0.8rem",padding:"0.4rem 0.625rem"}} onBlur={e=>{if(e.target.value){v.conceptos.push(e.target.value);e.target.value="";}}}/>
                </div>}
              </div>}
            </div>
          ))}
        </div>
      </div>

    </div>
    {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="mtitle">{editGasto?"Editar gasto":"Nuevo gasto variable"}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              {editGasto&&<button className="btn bd bsm" onClick={()=>{deleteGasto(editGasto.id);setModal(false);}}><Icon d={I.trash} size={14}/></button>}
              <button className="btn bg bsm" onClick={()=>setModal(false)}>✕</button>
            </div>
          </div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={modal.fecha} onChange={e=>setModal({...modal,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={modal.tipo} onChange={e=>setModal({...modal,tipo:e.target.value,vehicle_id:e.target.value==="Impuesto"?"empresa":modal.vehicle_id,vehicle_tipo:e.target.value==="Impuesto"?"empresa":modal.vehicle_tipo})}>{TIPOS_GASTO_VAR.map(t=><option key={t}>{t}</option>)}</select></div>
            {modal.tipo==="Impuesto"&&<div className="fld"><label className="lbl">Título del impuesto</label><input className="inp" placeholder="ej. Liquidación IVA T1, IRPF anual..." value={modal.titulo||""} onChange={e=>setModal({...modal,titulo:e.target.value})}/></div>}
            {modal.tipo==="Impuesto"&&<div className="fld"><label className="lbl">Año del periodo</label><input className="inp" type="number" placeholder={anoActual} value={modal.imp_ano||anoActual} onChange={e=>setModal({...modal,imp_ano:e.target.value})}/></div>}
            {modal.tipo==="Impuesto"&&<div style={{display:"flex",gap:"0.5rem"}}><div className="fld" style={{flex:1}}><label className="lbl">Mes inicio</label><select className="inp sel" value={modal.imp_mes_ini||"1"} onChange={e=>setModal({...modal,imp_mes_ini:e.target.value})}>{MESES_ES.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}</select></div><div className="fld" style={{flex:1}}><label className="lbl">Mes fin</label><select className="inp sel" value={modal.imp_mes_fin||"12"} onChange={e=>setModal({...modal,imp_mes_fin:e.target.value})}>{MESES_ES.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}</select></div></div>}
          </div>
          {modal.tipo==="Combustible"&&<>
            <div className="g2">
              <div className="fld"><label className="lbl">Litros</label><input className="inp" type="number" placeholder="0" value={modal.litros} onChange={e=>handleLitros(e.target.value,modal.precio_litro)}/></div>
              <div className="fld"><label className="lbl">€/litro</label><input className="inp" type="number" placeholder="0,00" value={modal.precio_litro} onChange={e=>handleLitros(modal.litros,e.target.value)}/></div>
            </div>
            <div className="fld"><label className="lbl">Km odómetro <span style={{color:"var(--a2)",fontSize:"0.68rem"}}>(mejora el cálculo de consumo)</span></label><input className="inp" type="number" placeholder="ej. 125430" value={modal.odometro} onChange={e=>setModal({...modal,odometro:e.target.value})}/></div>
            <div className="fld"><label className="lbl">País</label><select className="inp sel" value={modal.pais} onChange={e=>setModal({...modal,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>
          </>}
          <div className="fld"><label className="lbl">Importe (€){modal.tipo==="Impuesto"?<span style={{color:"var(--muted)",fontSize:"0.68rem"}}> · negativo si es devolución</span>:modal.tipo==="Combustible"&&modal.litros?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · calculado auto</span>:""}</label><input className="inp" type="number" step="0.01" placeholder="0,00" value={modal.importe} onChange={e=>setModal({...modal,importe:e.target.value})}/></div>
          {modal.tipo!=="Impuesto"&&<div className="fld"><label className="lbl">Vehículo</label>
            <select className="inp sel" value={modal.vehicle_id} onChange={e=>{setModal({...modal,vehicle_id:e.target.value,vehicle_tipo:tractoras.find(t=>t.id===e.target.value)?"tractora":"semi"});}}>
              <option value="">Sin asignar</option>
              {tractoras.map(t=><option key={t.id} value={t.id}>🚛 {t.matricula||"Sin mat."}</option>)}
              {semis.map(s=><option key={s.id} value={s.id}>🔧 {s.matricula||"Sin mat."}</option>)}
            </select></div>}
          <div className="fld"><label className="lbl">Nota</label><input className="inp" placeholder="opcional" value={modal.nota} onChange={e=>setModal({...modal,nota:e.target.value})}/></div>
          <div className="mact"><button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={saveGasto}>{editGasto?"Actualizar":"Guardar"}</button></div>
        </div>
      </div>}
  </>);
}

// ── VIAJES PAGE ───────────────────────────────────────────────────────────────
function ViajesPage({userId,tractoras,semis,esGerente,gastosTodos}) {
  const[viajes,setViajes]=useState([]);
  const[modal,setModal]=useState(false);
  const[editando,setEditando]=useState(null);
  const[vuelta,setVuelta]=useState(false);
  const[toast,setToast]=useState("");
  const[oCoords,setOCoords]=useState(null);
  const[dCoords,setDCoords]=useState(null);
  const defaultT=tractoras[0];

  const getAutoSemi=tid=>{const t=tractoras.find(x=>x.id===tid);return t?.conjunto_fijo&&t?.semi_habitual_id?t.semi_habitual_id:"";};
  const emptyForm={fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",pais:"España",km:"",km_vuelta:"",peaje:"",precio:"",tiene_iva:false,tipo_iva:"21",truck_id:defaultT?.id||"",semi_id:getAutoSemi(defaultT?.id||"")};

  useEffect(()=>{sb.from("viajes").select("*").eq("user_id",userId).order("fecha",{ascending:false}).then(({data})=>setViajes(data||[]));
  },[]);

  const handleO=(val,coords)=>{setOCoords(coords);if(coords&&dCoords){setModal(f=>({...f,origen:val,km:String(calcKmBetween(coords.lat,coords.lon,dCoords.lat,dCoords.lon))}));}else setModal(f=>({...f,origen:val}));};
  const handleD=(val,coords)=>{setDCoords(coords);if(coords&&oCoords){setModal(f=>({...f,destino:val,km:String(calcKmBetween(oCoords.lat,oCoords.lon,coords.lat,coords.lon))}));}else setModal(f=>({...f,destino:val}));};

  const calcIVA=()=>{const p=parseFloat(modal.precio)||0;const t=(parseFloat(modal.tipo_iva)||21)/100;const base=p/(1+t);return{base:base.toFixed(2),iva:(p-base).toFixed(2)};};

  const calcV=v=>{
    const t=tractoras.find(x=>x.id===v.truck_id);
    const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio=parseFloat(v.precio)||0;
    const peaje=parseFloat(v.peaje)||0;
    const consumo=t?calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32):32;
    const precioG=t?calcPrecioMedioGasoil(gastosTodos,t.id):null;
    const costeG=precioG?km*(consumo/100)*precioG:0;
    const kmMes=parseFloat(t?.km_mensuales)||0;
    const costeKm=kmMes>0?0:0;
    const coste=costeG+peaje;
    return{coste,ben:precio-coste,margen:precio>0?((precio-coste)/precio)*100:0};
  };

  const openEdit=v=>{setEditando(v);setVuelta(!!v.km_vuelta);setOCoords(null);setDCoords(null);setModal({...emptyForm,...v,tiene_iva:v.tiene_iva||false,tipo_iva:v.tipo_iva||"21"});};
  const openNew=()=>{setEditando(null);setVuelta(false);setOCoords(null);setDCoords(null);setModal({...emptyForm,semi_id:getAutoSemi(defaultT?.id||"")});};

  const saveViaje=async()=>{
    if(!modal.km||parseFloat(modal.km)<=0){setToast("⚠️ Introduce los km");return;}
    if(!modal.precio||parseFloat(modal.precio)<=0){setToast("⚠️ Introduce el precio");return;}
    const{base,iva}=calcIVA();
    const payload={fecha:modal.fecha,cliente:modal.cliente||"",origen:modal.origen||"",destino:modal.destino||"",pais:modal.pais||"España",km:parseFloat(modal.km)||0,km_vuelta:vuelta?parseFloat(modal.km_vuelta||modal.km)||0:null,peaje:parseFloat(modal.peaje)||0,precio:parseFloat(modal.precio)||0,tiene_iva:modal.tiene_iva||false,tipo_iva:modal.tipo_iva||"21",base_imponible:modal.tiene_iva?parseFloat(base):null,iva_amount:modal.tiene_iva?parseFloat(iva):null,truck_id:modal.truck_id||null,semi_id:modal.semi_id||null,user_id:String(userId)};
    if(editando?.id){
      const{error}=await sb.from("viajes").update(payload).eq("id",editando.id);
      if(error){setToast("❌ "+error.message);return;}
      setViajes(viajes.map(v=>v.id===editando.id?{...v,...payload,id:editando.id}:v));
      setToast("✅ Viaje actualizado");
    }else{
      const{data,error}=await sb.from("viajes").insert(payload).select();
      if(error){setToast("❌ "+error.message);return;}
      const nuevo=Array.isArray(data)?data[0]:data;
      if(nuevo)setViajes([nuevo,...viajes]);
      else{const{data:f}=await sb.from("viajes").select("*").eq("user_id",userId).order("fecha",{ascending:false});setViajes(f||[]);}
      setToast("✅ Viaje guardado");
    }
    setModal(false);setEditando(null);
  };

  const deleteViaje=async id=>{await sb.from("viajes").delete().eq("id",id);setViajes(viajes.filter(v=>v.id!==id));setToast("🗑️ Eliminado");};
  const selectedT=tractoras.find(t=>t.id===modal.truck_id);
  const conjuntoFijo=selectedT?.conjunto_fijo&&selectedT?.semi_habitual_id;

  return(<>
    {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bp bsm" onClick={openNew}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>
      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Añade una tractora en <strong>Flota</strong> para registrar viajes.</span></div>}
      {viajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Toca el botón para añadir tu primera ruta</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {viajes.map(v=>{
          const{coste,ben,margen}=calcV(v);
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          const t=tractoras.find(x=>x.id===v.truck_id);
          const s=semis.find(x=>x.id===v.semi_id);
          return(
            <div className="trip" key={v.id} onClick={()=>openEdit(v)}>
              <div className="ttop">
                <div><div className="troute">{v.origen||"—"} → {v.destino||"—"}{v.pais&&v.pais!=="España"?" 🌍":""}</div><div className="tdate">{fmtDate(v.fecha)}{v.cliente?` · ${v.cliente}`:""}</div></div>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={e=>{e.stopPropagation();deleteViaje(v.id);}}><Icon d={I.trash} size={12}/></button>
              </div>
              <div className="trow">
                {t&&<span>🚛 {t.matricula}</span>}{s&&<span>🔧 {s.matricula}</span>}
                <span>📏 {v.km}km{v.km_vuelta?` + ${v.km_vuelta}km`:""}</span>
                <span>💰 {euros(parseFloat(v.precio))}{v.tiene_iva?" (IVA)":""}</span>
                {parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
              </div>
              {esGerente&&<div className="tfoot">
                <span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Gasoil est. + peajes: {euros(coste)} · <span style={{color:ben>=0?"var(--green)":"var(--red)"}}>{ben>=0?"+":""}{euros(ben)}</span></span>
                <span className={`badge ${ok?"bg-g":warn?"bg-y":"bg-r"}`}>{bad?"🔴":warn?"🟡":"🟢"} {pct(margen)}</span>
              </div>}
            </div>
          );
        })}
      </div>}

    </div>
    {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="mtitle">{editando?"Editar viaje":"Nuevo viaje"}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              {editando&&<button className="btn bd bsm" onClick={()=>{deleteViaje(editando.id);setModal(false);}}><Icon d={I.trash} size={14}/></button>}
              <button className="btn bg bsm" onClick={()=>setModal(false)}>✕</button>
            </div>
          </div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={modal.fecha} onChange={e=>setModal({...modal,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Cliente</label><input className="inp" placeholder="Nombre" value={modal.cliente} onChange={e=>setModal({...modal,cliente:e.target.value})}/></div>
          </div>
          <div className="fld"><label className="lbl">Origen</label><CityInput value={modal.origen} onChange={v=>setModal(f=>({...f,origen:v}))} onSelect={s=>handleO(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="fld"><label className="lbl">Destino</label><CityInput value={modal.destino} onChange={v=>setModal(f=>({...f,destino:v}))} onSelect={s=>handleD(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="fld"><label className="lbl">País destino</label><select className="inp sel" value={modal.pais} onChange={e=>setModal({...modal,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label className="lbl">Km de ida {oCoords&&dCoords?<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· aprox. calculado</span>:""}</label><input className="inp" type="number" placeholder="0" value={modal.km} onChange={e=>setModal({...modal,km:e.target.value})}/></div>
          <div className="toggle-row"><span className="toggle-lbl">↩️ Vuelta sin carga</span><button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/></div>
          {vuelta&&<div className="fld"><label className="lbl">Km de vuelta</label><input className="inp" type="number" placeholder={modal.km||"0"} value={modal.km_vuelta} onChange={e=>setModal({...modal,km_vuelta:e.target.value})}/></div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes (€)</label><input className="inp" type="number" placeholder="0" value={modal.peaje} onChange={e=>setModal({...modal,peaje:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Precio cobrado (€) <span style={{fontSize:"0.68rem",color:"var(--muted)",fontWeight:400}}>(IVA incluido)</span></label><input className="inp" type="number" placeholder="0" value={modal.precio} onChange={e=>setModal({...modal,precio:e.target.value})}/></div>
          </div>
          {(()=>{
            const km=(parseFloat(modal.km)||0)+(parseFloat(modal.km_vuelta)||0);
            const precio=parseFloat(modal.precio)||0;
            const peaje=parseFloat(modal.peaje)||0;
            const t=tractoras.find(x=>x.id===modal.truck_id);
            const consumo=parseFloat(t?.consumo_estimado)||32;
            const precioG=t?calcPrecioMedioGasoil(gastosTodos,t.id)||(parseFloat(t.precio_gasoil_inicial)||1.65):1.65;
            const costeGasoil=km*(consumo/100)*precioG;
            const costTotal=costeGasoil+peaje;
            const precioMin=costTotal*1.15;
            const kmRate=km>0?precio/km:0;
            const kmMin=km>0?precioMin/km:0;
            if(km>0&&precio>0){
              const ok=precio>=precioMin;
              return<div style={{background:ok?"#06D6A012":"#FF3D5A12",border:`1px solid ${ok?"#06D6A030":"#FF3D5A30"}`,borderRadius:"var(--r2)",padding:"0.75rem",fontSize:"0.8rem"}}>
                <div style={{fontWeight:700,color:ok?"var(--green)":"var(--red)",marginBottom:"0.25rem"}}>{ok?"Viaje rentable":"Viaje en perdida"}</div>
                <div style={{color:"var(--muted)",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
                  <span>Tu precio: {eurosKm(kmRate)} · Minimo recomendado: {eurosKm(kmMin)}</span>
                  {!ok&&<span style={{color:"var(--red)",fontWeight:600}}>Deberia cobrarse minimo {euros(precioMin)}</span>}
                </div>
              </div>;
            }
            return null;
          })()}
          <div className="toggle-row"><span className="toggle-lbl">Precio incluye IVA</span><button className={`toggle ${modal.tiene_iva?"on":""}`} onClick={()=>setModal(f=>({...f,tiene_iva:!f.tiene_iva}))}/></div>
          {modal.tiene_iva&&<><div className="fld"><label className="lbl">Tipo IVA (%)</label><input className="inp" type="number" value={modal.tipo_iva} onChange={e=>setModal({...modal,tipo_iva:e.target.value})}/></div>
          {modal.precio&&<div className="iva-box"><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--muted)"}}>Base imponible</span><span>{euros(parseFloat(calcIVA().base))}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--muted)"}}>IVA ({modal.tipo_iva}%)</span><span style={{color:"var(--yellow)"}}>{euros(parseFloat(calcIVA().iva))}</span></div><div style={{display:"flex",justifyContent:"space-between",fontWeight:700}}><span>Total</span><span>{euros(parseFloat(modal.precio))}</span></div></div>}</>}
          {tractoras.length>1&&<div className="fld"><label className="lbl">Tractora</label><select className="inp sel" value={modal.truck_id} onChange={e=>setModal({...modal,truck_id:e.target.value,semi_id:getAutoSemi(e.target.value)})}>{tractoras.map(t=><option key={t.id} value={t.id}>{t.matricula||"Sin mat."}{t.apodo?` "${t.apodo}"`:"" }</option>)}</select></div>}
          {semis.length>0&&<div className="fld"><label className="lbl">Semirremolque{conjuntoFijo?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · conjunto fijo</span>:""}</label>
            <select className="inp sel" value={modal.semi_id} onChange={e=>setModal({...modal,semi_id:e.target.value})} disabled={!!conjuntoFijo}>
              <option value="">Sin semirremolque</option>{semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
            </select></div>}
          <div className="mact"><button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={saveViaje}>{editando?"Actualizar":"Guardar"}</button></div>
        </div>
      </div>}
  </>);
}

// ── RESUMEN PAGE ──────────────────────────────────────────────────────────────
function ResumenPage({userId,tractoras,semis}) {
  const[viajes,setViajes]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[gastosFijos,setGastosFijos]=useState([]);
  const[filtro,setFiltro]=useState("all");
  const[modalExport,setModalExport]=useState(false);
  const[expTipo,setExpTipo]=useState("todo");
  const[expPeriodo,setExpPeriodo]=useState(nowMes());

  useEffect(()=>{
    Promise.all([sb.from("viajes").select("*").eq("user_id",userId),sb.from("gastos").select("*").eq("user_id",userId),sb.from("gastos_fijos").select("*").eq("user_id",userId)]).then(([{data:v},{data:g},{data:gf}])=>{setViajes(v||[]);setGastos(g||[]);setGastosFijos(gf||[]);});
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
    const gv=gastos.filter(g=>g.mes===key);
    const ingresos=mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastosVar=gv.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
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
function InicioPage({userId,tractoras,semis,perfil,esGerente,gastosTodos,viajesTodos,setViajesTodos,gastosFijos}) {
  const mesFiltro=nowMes();
  const[ultRegistros,setUltRegistros]=useState([]);

  useEffect(()=>{
    sb.from("viajes").select("*").eq("user_id",userId).order("fecha",{ascending:false}).then(({data})=>setViajesTodos(data||[]));
    // Cargar ultimos registros (viajes + gastos mezclados)
    Promise.all([
      sb.from("viajes").select("*").eq("user_id",userId).order("fecha",{ascending:false}).limit(5),
      sb.from("gastos").select("*").eq("user_id",userId).order("fecha",{ascending:false}).limit(5),
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

  if(tractoras.length===0)return(
    <div className="page fu">
      <div className="card"><div className="chd">Para empezar</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {[["1.","Añade tu tractora","Ve a Flota y registra tu vehiculo"],["2.","Configura los gastos fijos","En Registrar, seccion gastos fijos"],["3.","Registra tu primer viaje","Ruta, km y precio cobrado"]].map(([n,t,s])=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",padding:"0.875rem",background:"var(--s2)",borderRadius:"var(--r2)",border:"1px solid var(--border2)"}}>
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
  const ingMes=viajesMes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const benMes=viajesMes.reduce((s,v)=>s+calcV(v).ben,0)-totalFijosMes;
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
      {esGerente&&<div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos {mesLabel}</div><div className="sval g">{euros(ingMes)}</div></div>
        <div className="stat"><div className="slbl">Beneficio {mesLabel}</div><div className={`sval ${benMes>=0?"g":"r"}`}>{euros(benMes)}</div></div>
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

// ── REGISTRAR PAGE ────────────────────────────────────────────────────────────
function RegistrarPage({userId,tractoras,semis,esGerente,gastosTodos,accentIdx,gastosFijos,setGastosFijos}) {
  const[subtab,setSubtab]=useState("viajes");
  return(
    <div className="page fu">
      <div className="ptitle">Registrar</div>
      <div className="tab-row">
        <div className={`tab-btn ${subtab==="viajes"?"on":""}`} onClick={()=>setSubtab("viajes")}>Viajes</div>
        <div className={`tab-btn ${subtab==="gastos"?"on":""}`} onClick={()=>setSubtab("gastos")}>Gastos</div>
      </div>
      {subtab==="viajes"&&<ViajesPage key={`rv-${tractoras.length}-${semis.length}`} userId={userId} tractoras={tractoras} semis={semis} esGerente={esGerente} gastosTodos={gastosTodos}/>}
      {subtab==="gastos"&&<GastosPage key={`rg-${tractoras.length}-${semis.length}`} userId={userId} tractoras={tractoras} semis={semis} esGerente={esGerente} accentIdx={accentIdx} gastosFijos={gastosFijos} setGastosFijos={setGastosFijos}/>}
    </div>
  );
}

// ── ANALIZAR PAGE ─────────────────────────────────────────────────────────────
function AnalizarPage({userId,tractoras,semis,gastosTodos,viajesTodos,gastosFijos}) {
  const[simKm,setSimKm]=useState("");
  const[simPrecio,setSimPrecio]=useState("");
  const[simTractora,setSimTractora]=useState(tractoras[0]?.id||"");
  const[simPeaje,setSimPeaje]=useState("");
  const[subtab,setSubtab]=useState("dashboard");
  const[viajes,setViajes]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[gastosFijosRes,setGastosFijosRes]=useState([]);
  const[modalExport,setModalExport]=useState(false);
  const[expTipo,setExpTipo]=useState("todo");
  const[expPeriodo,setExpPeriodo]=useState(nowMes());

  useEffect(()=>{
    Promise.all([
      sb.from("viajes").select("*").eq("user_id",userId),
      sb.from("gastos").select("*").eq("user_id",userId),
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
    const precioG=t?calcPrecioMedioGasoil(gastosTodos,t.id)||(parseFloat(t.precio_gasoil_inicial)||precioGasoilGlobal()):precioGasoilGlobal();
    const costeGasoil=km*(consumo/100)*precioG;
    const fijosT=gastosFijos.filter(g=>g.entidad_id===t?.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
    const fijosE=gastosFijos.filter(g=>g.entidad_id==="empresa").reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
    const kmMes=parseFloat(t?.km_mensuales)||km;
    const fijosKm=(fijosT+fijosE/Math.max(tractoras.length,1))/kmMes;
    const costeFijos=fijosKm*km;
    const costeTotal=costeGasoil+peaje+costeFijos;
    const ben=precio-costeTotal;
    const margen=precio>0?(ben/precio)*100:0;
    const precioMin=costeTotal*1.15;
    const kmRate=precio/km;
    const kmMin=precioMin/km;
    return{km,precio,peaje,costeGasoil,costeFijos,costeTotal,ben,margen,precioMin,kmRate,kmMin,ok:ben>0};
  };

  // Ranking clientes
  const rankingClientes=()=>{
    const cMap={};
    viajesTodos.forEach(v=>{
      const c=v.cliente||"Sin nombre";
      if(!cMap[c])cMap[c]={ing:0,cost:0,viajes:0};
      const t=tractoras.find(x=>x.id===v.truck_id);
      const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
      const consumo=parseFloat(t?.consumo_estimado)||32;
      const precioG=t?calcPrecioMedioGasoil(gastosTodos,t.id)||(parseFloat(t.precio_gasoil_inicial)||precioGasoilGlobal()):precioGasoilGlobal();
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
      const varTotal=gMes.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
      const fijosTotal=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
      const costeKm=kmTotal>0?(varTotal+fijosTotal)/kmTotal:0;
      return{label:MESES_SHORT[d.getMonth()],key,kmTotal,costeKm};
    });
  };

  const sr=simResult();
  const clientes=rankingClientes();
  const tendencia=tendenciaKm();
  const maxCoste=Math.max(...tendencia.map(t=>t.costeKm),0.01);

  return(
    <div className="page fu">
      <div className="ptitle">Analizar</div>
      <div className="tab-row" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
        {[["dashboard","Dashboard"],["sim","Simular"],["clientes","Clientes"],["tendencia","Tendencia"],["resumen","Resumen"]].map(([id,lbl])=>(
          <div key={id} className={`tab-btn ${subtab===id?"on":""}`} onClick={()=>setSubtab(id)}>{lbl}</div>
        ))}
      </div>

      {subtab==="dashboard"&&<>
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
              const precioG=calcPrecioMedioGasoil(gastosTodos,t.id)||(parseFloat(t.precio_gasoil_inicial)||1.65);
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
        {/* Precio mínimo recomendado por tractora */}
        <div className="card">
          <div className="chd">Precio mínimo recomendado (margen 15%)</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {[100,200,300,500,800,1000].map(km=>{
              const t=tractoras[0];
              if(!t)return null;
              const consumo=calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32);
              const precioG=calcPrecioMedioGasoil(gastosTodos,t.id)||(parseFloat(t.precio_gasoil_inicial)||1.65);
              const costeKm=(consumo/100)*precioG;
              const minimo=km*costeKm*1.15;
              return(
                <div key={km} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:"0.83rem",color:"var(--muted)"}}>{km} km</span>
                  <span style={{fontWeight:700,color:"var(--a1)"}}>{euros(minimo)}</span>
                </div>
              );
            })}
            <div style={{fontSize:"0.68rem",color:"var(--muted)",marginTop:"0.25rem"}}>Basado en {tractoras[0]?.matricula||"primera tractora"} · Solo combustible + margen</div>
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
      </>}

      {subtab==="sim"&&<>
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
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Gastos fijos proporcionales</span><span style={{color:"var(--text)"}}>{euros(sr.costeFijos)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid var(--border)",paddingTop:"0.3rem",marginTop:"0.1rem",fontWeight:700}}><span>Coste total</span><span style={{color:"var(--text)"}}>{euros(sr.costeTotal)}</span></div>
          </div>
          {!sr.ok&&<div style={{background:"#FF3D5A15",borderRadius:"var(--r2)",padding:"0.75rem",fontSize:"0.82rem",color:"var(--red)",fontWeight:600}}>
            Precio minimo recomendado: {euros(sr.precioMin)} ({eurosKm(sr.kmMin)})
          </div>}
        </div>}

        {!sr&&<div className="empty"><div className="ei"><Icon d={I.trend} size={20} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Introduce los km y el precio para simular</span></div>}
      </>}

      {subtab==="clientes"&&<>
        {clientes.length===0?<div className="empty"><div className="ei"><Icon d={I.user} size={20} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin viajes registrados aun</span></div>
        :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
          {clientes.map((c,i)=>{
            const toxico=c.margen<0;
            const rentable=c.margen>=20;
            return(
              <div key={i} style={{background:"var(--s2)",border:`1px solid ${toxico?"#FF3D5A25":rentable?"#06D6A025":"var(--border2)"}`,borderRadius:"var(--r2)",padding:"0.875rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.875rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                    {i===0&&!toxico?"":""}
                    {c.n}
                    <span style={{fontSize:"0.65rem",fontWeight:600,padding:"0.15rem 0.5rem",borderRadius:999,background:toxico?"#FF3D5A20":rentable?"#06D6A020":"#FFD16620",color:toxico?"var(--red)":rentable?"var(--green)":"var(--yellow)"}}>
                      {toxico?"TOXICO":rentable?"RENTABLE":"NORMAL"}
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

      {subtab==="tendencia"&&<>
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
            const gv=gastos.filter(g=>g.mes===key);
            const ingresos=mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
            const gastosVar=gv.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
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
    </div>
  );
}
function AjustesModal({userId,perfil,updatePerfil,onClose,onLogout}) {
  const[codigo,setCodigo]=useState("");
  const[copied,setCopied]=useState(false);
  const[passForm,setPassForm]=useState({nueva:"",confirmar:""});
  const[passMsg,setPassMsg]=useState("");

  useEffect(()=>{
    if(perfil.empresa_id){
      sb.from("empresas").select("codigo").eq("id",perfil.empresa_id).single().then(({data})=>setCodigo(data?.codigo||""));
    } else if(perfil.rol==="gerente"){
      const crearEmpresa=async()=>{
        const cod=genCode();
        const{data:emp}=await sb.from("empresas").insert({nombre:perfil.empresa||perfil.nombre||"Mi empresa",codigo:cod,gerente_id:userId}).select().single();
        if(emp){await sb.from("perfiles").update({empresa_id:emp.id}).eq("id",userId);setCodigo(emp.codigo);}
      };
      crearEmpresa();
    }
  },[]);

  const saveAjustes=async patch=>{await sb.from("perfiles").update(patch).eq("id",userId);updatePerfil(patch);};
  const cambiarPass=async()=>{
    if(passForm.nueva.length<6){setPassMsg("Minimo 6 caracteres");return;}
    if(passForm.nueva!==passForm.confirmar){setPassMsg("Las contrasenas no coinciden");return;}
    const{error}=await sb.auth.updateUser({password:passForm.nueva});
    if(error){setPassMsg("Error al cambiar la contrasena");return;}
    setPassMsg("Contrasena cambiada correctamente");
    setPassForm({nueva:"",confirmar:""});
  };

  return(
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxHeight:"88vh"}}>
        <div className="mdrag"/>
        <div className="mtitle">Ajustes</div>
        <div className="card">
          <div className="chd">Tu empresa</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            <div className="fld"><label className="lbl">Nombre / Empresa</label><InputGuardado valor={perfil.empresa||""} placeholder="Transportes Garcia S.L." onGuardar={v=>saveAjustes({empresa:v})}/></div>
            <div className="fld"><label className="lbl">Tu nombre</label><InputGuardado valor={perfil.nombre||""} placeholder="Jose Garcia" onGuardar={v=>saveAjustes({nombre:v})}/></div>
            <PhotoUpload value={perfil.logo} onChange={v=>saveAjustes({logo:v})} label="Logo empresa" height={80}/>
          </div>
        </div>
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">Codigo para choferes</div>
          <p style={{fontSize:"0.82rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Comparte este codigo con tus choferes:</p>
          {codigo
            ?<div className="code-box"><div className="code-text">{codigo}</div><button className="btn bg bsm" onClick={()=>{navigator.clipboard?.writeText(codigo);setCopied(true);setTimeout(()=>setCopied(false),2000);}}><Icon d={I.copy} size={14}/>{copied?"Copiado!":"Copiar"}</button></div>
            :<button className="btn bp" onClick={async()=>{const cod=genCode();const{data:emp}=await sb.from("empresas").insert({nombre:perfil.empresa||perfil.nombre||"Mi empresa",codigo:cod,gerente_id:userId}).select().single();if(emp){await sb.from("perfiles").update({empresa_id:emp.id}).eq("id",userId);setCodigo(emp.codigo);}}}>Generar codigo</button>
          }
        </div>}
        <div className="card">
          <div className="chd">Color de la app</div>
          <div style={{display:"flex",gap:"0.625rem"}}>{ACCENTS.map((a,i)=><div key={i} className={`accent-dot ${(perfil.accent_idx||0)===i?"sel":""}`} style={{background:`linear-gradient(135deg,${a.a1},${a.a2})`}} onClick={()=>saveAjustes({accent_idx:i})}/>)}</div>
        </div>
        <div className="card">
          <div className="chd">Cambiar contrasena</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            <input className="inp" type="password" placeholder="Nueva contrasena" value={passForm.nueva} onChange={e=>setPassForm({...passForm,nueva:e.target.value})}/>
            <input className="inp" type="password" placeholder="Confirmar contrasena" value={passForm.confirmar} onChange={e=>setPassForm({...passForm,confirmar:e.target.value})}/>
            {passMsg&&<p style={{fontSize:"0.78rem",color:passMsg.includes("correcta")?"var(--green)":"var(--red)"}}>{passMsg}</p>}
            <button className="btn bg" onClick={cambiarPass}>Cambiar contrasena</button>
          </div>
        </div>
        <button className="btn bd" onClick={onLogout}><Icon d={I.logout} size={15}/>Cerrar sesion</button>
        <button className="btn bg" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const[user,setUser]=useState(null);
  const[perfil,setPerfil]=useState({});
  const[tractoras,setTractoras]=useState([]);
  const[semis,setSemis]=useState([]);
  const[gastosTodos,setGastosTodos]=useState([]);
  const[gastosFijos,setGastosFijos]=useState([]);
  const[viajesTodos,setViajesTodos]=useState([]);
  const[tab,setTab]=useState("inicio");
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    sb.auth.getSession().then(async({data:{session}})=>{
      if(session?.user){
        setUser(session.user);
        const[{data:p},{data:t},{data:s},{data:g},{data:gf}]=await Promise.all([
          sb.from("perfiles").select("*").eq("id",session.user.id).single(),
          sb.from("tractoras").select("*").eq("user_id",session.user.id),
          sb.from("semirremolques").select("*").eq("user_id",session.user.id),
          sb.from("gastos").select("*").eq("user_id",session.user.id),
          sb.from("gastos_fijos").select("*").eq("user_id",session.user.id),
        ]);
        setPerfil(p||{});setTractoras(t||[]);setSemis(s||[]);setGastosTodos(g||[]);setGastosFijos(gf||[]);
      }
      setLoading(false);
    });
  },[]);

  const handleAuth=async(u,p)=>{
    setUser(u);setPerfil(p);
    const[{data:t},{data:s},{data:g},{data:gf},{data:v}]=await Promise.all([
      sb.from("tractoras").select("*").eq("user_id",u.id),
      sb.from("semirremolques").select("*").eq("user_id",u.id),
      sb.from("gastos").select("*").eq("user_id",u.id),
      sb.from("gastos_fijos").select("*").eq("user_id",u.id),
      sb.from("viajes").select("*").eq("user_id",u.id).order("fecha",{ascending:false}),
    ]);
    setTractoras(t||[]);setSemis(s||[]);setGastosTodos(g||[]);setGastosFijos(gf||[]);setViajesTodos(v||[]);
  };
  const handleLogout=async()=>{await sb.auth.signOut();setUser(null);setPerfil({});setTractoras([]);setSemis([]);setViajesTodos([]);setGastosTodos([]);setGastosFijos([]);};
  const updatePerfil=patch=>setPerfil(p=>({...p,...patch}));
  const[showAjustes,setShowAjustes]=useState(false);

  const accent=ACCENTS[perfil.accent_idx||0];
  const esGerente=perfil.rol!=="chofer";
  const days=getDaysLeft(perfil.trial_start);

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#08080F"}}><div className="spinner" style={{width:32,height:32,borderColor:"rgba(255,61,90,0.3)",borderTopColor:"#FF3D5A"}}/></div>);
  if(!user)return(<><style>{makeCSS(accent)}</style><div className="app"><AuthPage onAuth={handleAuth} accent={accent}/></div></>);

  const tabs=[{id:"inicio",lbl:"Inicio",icon:I.dash},{id:"flota",lbl:"Vehículos",icon:I.truck},{id:"viajes",lbl:"Viajes",icon:I.trend},{id:"gastos",lbl:"Gastos",icon:I.coin},{id:"analizar",lbl:"Analizar",icon:I.analyze}];

  return(
    <><style>{makeCSS(accent)}</style>
    <div className="app">
      <div className="hdr">
        <div className="hdr-left">
          {perfil.logo?<img src={perfil.logo} alt="" className="hdr-logo"/>:<div className="hdr-logo-ph"><svg width="20" height="20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>}
          <div><div className="hdr-brand">{perfil.empresa||"FlotaRentable"}</div><div className="hdr-sub">{esGerente?"Gerente":"Chofer"} · {tractoras.length} tractora{tractoras.length!==1?"s":""}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <div className="trial-chip"><Icon d={I.clock} size={10} color="var(--muted)"/><span className="chip-d">{days}d</span></div>
          <button className="btn bg bsm" style={{padding:"0.35rem 0.5rem",width:"auto"}} onClick={()=>setShowAjustes(true)}><Icon d={I.settings} size={15}/></button>
        </div>
      </div>

      {showAjustes&&<AjustesModal userId={user.id} perfil={perfil} updatePerfil={updatePerfil} onClose={()=>setShowAjustes(false)} onLogout={handleLogout}/>}

      {tab==="inicio"&&<InicioPage key={`inicio-${tractoras.length}-${semis.length}`} userId={user.id} tractoras={tractoras} semis={semis} perfil={perfil} esGerente={esGerente} gastosTodos={gastosTodos} viajesTodos={viajesTodos} setViajesTodos={setViajesTodos} gastosFijos={gastosFijos}/>}
      {tab==="flota"&&<FlotaPage userId={user.id} perfil={perfil} updatePerfil={updatePerfil} tractoras={tractoras} semis={semis} setTractoras={setTractoras} setSemis={setSemis}/>}
      {tab==="viajes"&&<ViajesPage key={`viajes-${tractoras.length}-${semis.length}`} userId={user.id} tractoras={tractoras} semis={semis} esGerente={esGerente} gastosTodos={gastosTodos}/>}
      {tab==="gastos"&&<GastosPage key={`gastos-${tractoras.length}-${semis.length}`} userId={user.id} tractoras={tractoras} semis={semis} esGerente={esGerente} accentIdx={perfil.accent_idx||0} gastosFijos={gastosFijos} setGastosFijos={setGastosFijos}/>}
      {tab==="analizar"&&esGerente&&<AnalizarPage key={`analizar-${tractoras.length}-${semis.length}`} userId={user.id} tractoras={tractoras} semis={semis} gastosTodos={gastosTodos} viajesTodos={viajesTodos} gastosFijos={gastosFijos}/>}
      {tab==="analizar"&&!esGerente&&<div className="page"><div className="alert ay"><Icon d={I.lock} size={14} color="var(--yellow)"/><span>Esta seccion solo esta disponible para el gerente.</span></div></div>}

      <nav className="nav">{tabs.map(t=><button key={t.id} className={`nb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}><Icon d={t.icon} size={17}/>{t.lbl}</button>)}</nav>
    </div></>
  );
}
