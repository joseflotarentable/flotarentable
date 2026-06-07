export const nowMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
export const nowAno = () => String(new Date().getFullYear());

export function gastoProrrateadoEnMes(g, mes) {
  const [anoMes, mesMes] = mes.split("-").map(Number);
  if (g.tipo === "Impuesto" && g.imp_mes_ini && g.imp_mes_fin && g.imp_ano) {
    const anoG = parseInt(g.imp_ano);
    const ini = parseInt(g.imp_mes_ini);
    const fin = parseInt(g.imp_mes_fin);
    const numMeses = fin - ini + 1;
    if (numMeses <= 0) return 0;
    if (anoG === anoMes && mesMes >= ini && mesMes <= fin) return (parseFloat(g.importe)||0) / numMeses;
    return 0;
  }
  if (g.tipo === "ITV" && g.itv_meses && g.fecha) {
    const fechaG = new Date(g.fecha + "T12:00:00");
    const numMeses = parseInt(g.itv_meses) || 1;
    for (let i = 0; i < numMeses; i++) {
      const d = new Date(fechaG);
      d.setMonth(d.getMonth() + i);
      const m = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if (m === mes) return (parseFloat(g.importe)||0) / numMeses;
    }
    return 0;
  }
  if (g.mes === mes) return parseFloat(g.importe) || 0;
  return 0;
}
export const euros = n => isNaN(n)||n==null?"—":new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
export const eurosKm = n => isNaN(n)||n==null||!isFinite(n)?"—":`${Number(n).toFixed(3).replace(".",",")} €/km`;
export const pct = n => isNaN(n)||!isFinite(n)?"—":`${Math.round(n)}%`;
export const fmtDate = d => d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"";
export const genCode = () => "FR-"+Math.random().toString(36).substring(2,6).toUpperCase();
export const getDaysLeft = t => { if(!t)return 7; return Math.max(0,7-Math.floor((Date.now()-new Date(t))/86400000)); };
export const alertDays = d => { if(!d)return null; return Math.floor((new Date(d)-Date.now())/86400000); };
export const alertColor = (days,margin) => { if(days===null)return null; if(days<0)return"r"; if(days<=7)return"r"; if(days<=margin)return"y"; return"g"; };

export function calcGastosFijosMes(gastosFijos, tractoras, semis) {
  let total = 0;
  gastosFijos.forEach(g => {
    const imp = parseFloat(g.importe)||0;
    if (g.periodo === "anual") total += imp/12;
    else total += imp;
  });
  return total;
}

export function calcCosteKmTractora(t, gastosFijos) {
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

export function calcConsumoHistorico(gastos, truckId) {
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

export function calcPrecioMedioGasoil(gastos, truckId) {
  const repos = gastos.filter(g=>g.vehicle_id===truckId&&g.tipo==="Combustible"&&g.precio_litro);
  if (!repos.length) return null;
  return repos.reduce((s,g)=>s+(parseFloat(g.precio_litro)||0),0)/repos.length;
}

// Cálculo en línea recta × 1.25 — se usa como respaldo si la API de rutas falla o no hay clave configurada.
export function calcKmBetween(lat1,lon1,lat2,lon2) {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*1.25);
}

// Clave de OpenRouteService (gratuita, hasta 2.000 peticiones/día).
// Consíguela en https://openrouteservice.org/dev/#/signup y pégala aquí o en una variable de entorno VITE_ORS_KEY.
const ORS_KEY = (typeof import.meta!=="undefined" && import.meta.env && import.meta.env.VITE_ORS_KEY) || "";

const routeCache = {};
// Calcula los km de ruta REAL para un camión (perfil driving-hgv) entre dos puntos.
// Si no hay clave API o la petición falla, recurre al cálculo en línea recta × 1.25.
export async function calcKmRutaCamion(lat1, lon1, lat2, lon2) {
  const fallback = () => calcKmBetween(lat1, lon1, lat2, lon2);
  if (!ORS_KEY) return fallback();
  const key = `${lat1},${lon1}|${lat2},${lon2}`;
  if (routeCache[key] != null) return routeCache[key];
  try {
    const r = await fetch("https://api.openrouteservice.org/v2/directions/driving-hgv", {
      method: "POST",
      headers: { "Authorization": ORS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: [[lon1, lat1],[lon2, lat2]] }),
    });
    if (!r.ok) return fallback();
    const data = await r.json();
    const metros = data?.routes?.[0]?.summary?.distance;
    if (!metros) return fallback();
    const km = Math.round(metros / 1000);
    routeCache[key] = km;
    return km;
  } catch {
    return fallback();
  }
}

export let geoCache = {};
export async function geocode(q) {
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

// Coste €/km completo por tractora
// Precio de gasoil a usar para una tractora: media histórica de sus repostajes,
// y si no hay datos suficientes, el precio inicial que el usuario indicó al darla de alta.
export function precioGasoilDe(tractora, gastosVar) {
  if(!tractora)return null;
  return calcPrecioMedioGasoil(gastosVar,tractora.id) || (parseFloat(tractora.precio_gasoil_inicial)||null);
}

export function calcCosteKmCompleto(tractora, gastosFijos, gastosVar, viajes, tractoras) {
  const mesFiltro=nowMes();
  const flota=(tractoras||[tractora]).filter(t=>t.activa!==false);
  // Km reales del mes de esta tractora (de viajes registrados)
  const kmReales=viajes.filter(v=>v.truck_id===tractora.id&&v.fecha?.startsWith(mesFiltro)).reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
  // Si no hay km reales usar los estimados, si tampoco hay no calcular
  const km=kmReales||parseFloat(tractora.km_mensuales)||0;
  if(!km)return 0;
  // Km totales de la flota activa (para repartir proporcionalmente los fijos de empresa)
  const kmTotalesFlota=flota.reduce((s,t)=>{
    const kmT=viajes.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro)).reduce((a,v)=>a+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    return s+(kmT||parseFloat(t.km_mensuales)||0);
  },0);
  // Fijos del vehículo
  const fijosV=gastosFijos.filter(g=>g.entidad_id===tractora.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  // Fijos empresa repartidos proporcionalmente según km de cada tractora
  const fijosEmpresa=gastosFijos.filter(g=>g.entidad_id==="empresa").reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  const propEmpresa=kmTotalesFlota>0?km/kmTotalesFlota:0;
  const fijosEPorTractora=fijosEmpresa*propEmpresa;
  // Variables del mes de esta tractora
  const varMes=gastosVar.filter(g=>g.vehicle_id===tractora.id&&g.mes===mesFiltro).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  // Combustible estimado por km (L/100km × precio medio gasoil)
  const consumo=parseFloat(tractora.consumo_estimado)||0;
  const precioG=precioGasoilDe(tractora,gastosVar);
  const combustibleKm=consumo>0&&precioG?(consumo/100)*precioG:0;
  return (fijosV+fijosEPorTractora)/km + varMes/km + combustibleKm;
}

// Coste €/km general de toda la empresa
export function calcCosteKmEmpresa(tractoras, gastosFijos, gastosVar, viajes) {
  const mesFiltro=nowMes();
  const flota=(tractoras||[]).filter(t=>t.activa!==false);
  const kmTotal=flota.reduce((s,t)=>{
    const kmT=viajes.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro)).reduce((a,v)=>a+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    return s+(kmT||parseFloat(t.km_mensuales)||0);
  },0);
  if(!kmTotal)return 0;
  const totalFijos=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  const totalVar=gastosVar.reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesFiltro),0);
  const totalCombustible=flota.reduce((s,t)=>{
    const kmT=viajes.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mesFiltro)).reduce((a,v)=>a+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    const consumo=parseFloat(t.consumo_estimado)||0;
    const precioG=precioGasoilDe(t,gastosVar);
    return s+((kmT||parseFloat(t.km_mensuales)||0)*(consumo>0&&precioG?(consumo/100)*precioG:0));
  },0);
  return (totalFijos+totalVar+totalCombustible)/kmTotal;
}

// Bug #13: aviso de salto de odómetro poco realista entre repostajes (>2000km/día implícito)
export function consumoHistoricoConAviso(gastos, truckId) {
  const repos = gastos.filter(g=>g.vehicle_id===truckId&&g.tipo==="Combustible"&&g.odometro&&g.litros).sort((a,b)=>parseFloat(a.odometro)-parseFloat(b.odometro));
  let aviso=null;
  for(let i=1;i<repos.length;i++){
    const kmD=parseFloat(repos[i].odometro)-parseFloat(repos[i-1].odometro);
    const dias=Math.max(1,Math.abs((new Date(repos[i].fecha)-new Date(repos[i-1].fecha))/86400000));
    if(kmD>0 && kmD/dias>2000){ aviso="Hay un salto de kilometraje entre dos repostajes que parece poco realista (revisa el odómetro introducido)."; break; }
  }
  return { valor: calcConsumoHistorico(gastos,truckId), aviso };
}
