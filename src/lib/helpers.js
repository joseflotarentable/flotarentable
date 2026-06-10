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
const ORS_KEY = (typeof import.meta!=="undefined" && import.meta.env && import.meta.env.VITE_ORS_KEY) || "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIzMzhhNjdiOGZiZDQzZGRhZmJkYmEwYWI3OWRjMzI3IiwiaCI6Im11cm11cjY0In0=";

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
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1`,{headers:{"Accept-Language":"es","User-Agent":"FlotaRentable/1.0"}});
    const data = await r.json();
    const res = data
      .filter(x=>["city","town","village","municipality","hamlet","administrative"].includes(x.type)||["city","town","village","municipality","hamlet"].includes(x.addresstype))
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

// Coste fijo + gastos variables (sin combustible, que ya se calcula aparte por viaje) repartido por km de la empresa.
// Sirve para estimar un "beneficio neto" por viaje sumando esta parte a los costes de gasoil/peajes ya calculados.
export function calcCosteFijoKm(tractoras, gastosFijos, gastosVar, viajes, mesFiltro) {
  mesFiltro=mesFiltro||nowMes();
  const flota=(tractoras||[]).filter(t=>t.activa!==false);
  // Base del reparto, en este orden de preferencia para cada tractora:
  // 1) Si el mes ya ha terminado (no es el mes actual), se usa lo REAL de ese mes (cierre).
  // 2) Si es el mes en curso: media de km reales de meses anteriores ya completados (cuantos más
  //    meses de histórico haya, más precisa); si no hay histórico, los "km mensuales" estimados
  //    configurados en Flota; si tampoco hay eso, lo acumulado en lo que va de mes actual.
  const kmDelMes=(t,mes)=>viajes.filter(v=>v.truck_id===t.id&&v.fecha?.startsWith(mes)).reduce((a,v)=>a+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0)+(parseFloat(v.km_vacio)||0),0);
  const esMesActual=mesFiltro===nowMes();
  const kmTotal=flota.reduce((s,t)=>{
    const kmT=kmDelMes(t,mesFiltro);
    if(!esMesActual)return s+(kmT||parseFloat(t.km_mensuales)||0); // mes cerrado: usar lo real
    // mes en curso: media de meses anteriores completados con datos
    const mesesPrevios=[...new Set(viajes.filter(v=>v.truck_id===t.id&&v.fecha&&v.fecha.slice(0,7)<mesFiltro).map(v=>v.fecha.slice(0,7)))];
    if(mesesPrevios.length>0){
      const media=mesesPrevios.reduce((a,m)=>a+kmDelMes(t,m),0)/mesesPrevios.length;
      return s+(media||kmT||parseFloat(t.km_mensuales)||0);
    }
    return s+(parseFloat(t.km_mensuales)||kmT||0);
  },0);
  if(!kmTotal)return 0;
  const totalFijos=gastosFijos.reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0);
  const totalVar=gastosVar.filter(g=>g.tipo!=="Combustible").reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesFiltro),0);
  return (totalFijos+totalVar)/kmTotal;
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

// --- Lectura automática de tickets/facturas (OCR 100% en el navegador, gratis, sin backend) ---
// Usa Tesseract.js (librería open-source) cargada bajo demanda desde CDN.
let _tesseractLoading=null;
function cargarTesseract(){
  if(window.Tesseract)return Promise.resolve(window.Tesseract);
  if(_tesseractLoading)return _tesseractLoading;
  _tesseractLoading=new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload=()=>resolve(window.Tesseract);
    s.onerror=reject;
    document.head.appendChild(s);
  });
  return _tesseractLoading;
}

// Analiza el texto reconocido y extrae los campos típicos de un ticket/factura español
function parsearTextoFactura(texto){
  const t=texto.replace(/,/g,".");
  const out={};
  // Importe total: busca todas las apariciones de TOTAL/IMPORTE seguidas de un número
  // y nos quedamos con la ÚLTIMA (suele ser el "TOTAL A PAGAR" final, después de subtotales/IVA)
  const totalMatches=[...t.matchAll(/(?:TOTAL|IMPORTE)[^\n\d€]{0,15}(\d{1,4}(?:\.\d{1,2})?)\s*€?/gi)];
  if(totalMatches.length>0)out.importe=parseFloat(totalMatches[totalMatches.length-1][1]);
  // Litros (combustible)
  let l=t.match(/(\d{1,3}[.,]?\d{0,3})\s*(?:litros|litro|l\.?\b|lts)/i);
  if(l)out.litros=parseFloat(l[1]);
  // Precio por litro
  let pl=t.match(/(\d[.,]\d{2,3})\s*(?:€\s*\/\s*l|€\/litro|eur\/l|\/l\b)/i);
  if(pl)out.precio_litro=parseFloat(pl[1]);
  // Fecha dd/mm/aaaa o dd-mm-aaaa (acepta separador / - .)
  let f=t.match(/(\d{2})[\/\-.](\d{2})[\/\-.](\d{4}|\d{2})/);
  if(f){const anio=f[3].length===2?`20${f[3]}`:f[3];out.fecha=`${anio}-${f[2]}-${f[1]}`;}
  // Si hay litros y precio pero no importe (o el importe parece poco fiable), lo calculamos
  if(out.litros&&out.precio_litro){
    const calculado=Math.round(out.litros*out.precio_litro*100)/100;
    if(!out.importe||Math.abs(out.importe-calculado)>5)out.importe=calculado;
  }
  // Último recurso: si no hay importe, usar el número con € más grande del ticket
  if(!out.importe){
    const euros=[...t.matchAll(/(\d{1,4}[.,]\d{2})\s*€/g)].map(x=>parseFloat(x[1].replace(",",".")));
    if(euros.length>0)out.importe=Math.max(...euros);
  }
  return out;
}

// Reduce y mejora el contraste de la foto antes del OCR: acelera el reconocimiento
// y mejora mucho la precisión en fotos de móvil grandes/oscuras.
function preprocesarImagen(dataUrl){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const maxW=1600;
      const escala=img.width>maxW?maxW/img.width:1;
      const w=Math.round(img.width*escala),h=Math.round(img.height*escala);
      const canvas=document.createElement("canvas");
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext("2d");
      ctx.drawImage(img,0,0,w,h);
      const imgData=ctx.getImageData(0,0,w,h);
      const d=imgData.data;
      for(let i=0;i<d.length;i+=4){
        // escala de grises + aumento de contraste
        const gris=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
        const contraste=Math.min(255,Math.max(0,(gris-128)*1.5+128));
        d[i]=d[i+1]=d[i+2]=contraste;
      }
      ctx.putImageData(imgData,0,0);
      resolve(canvas.toDataURL("image/jpeg",0.92));
    };
    img.onerror=()=>resolve(dataUrl);
    img.src=dataUrl;
  });
}

// Devuelve {importe, litros, precio_litro, fecha, raw} a partir de una imagen en base64 (dataURL)
export async function extraerDatosFactura(dataUrl, onProgress){
  const Tesseract=await cargarTesseract();
  const imagenLista=await preprocesarImagen(dataUrl);
  const{data}=await Tesseract.recognize(imagenLista,"spa",{
    logger:m=>{if(onProgress&&m.status==="recognizing text")onProgress(Math.round((m.progress||0)*100));}
  });
  const campos=parsearTextoFactura(data.text||"");
  return{...campos,raw:data.text};
}
