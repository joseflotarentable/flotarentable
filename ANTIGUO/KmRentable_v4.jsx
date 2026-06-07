import { useState, useEffect, useCallback, useRef } from "react";

const SK = "kmrentable_v4";
const ACCENTS = [
  { name:"Rojo",    a1:"#FF3D5A", a2:"#FF7A3D" },
  { name:"Azul",    a1:"#4B8EFF", a2:"#6B5FFF" },
  { name:"Verde",   a1:"#06D6A0", a2:"#00B4D8" },
  { name:"Naranja", a1:"#FF8C42", a2:"#FFD166" },
  { name:"Morado",  a1:"#9B5DE5", a2:"#F15BB5" },
];

const TIPOS_TRACTORA = ["Tractora","Rígido"];
const TIPOS_SEMI = ["Tautliner","Frigorífico","Cisterna","Góndola","Portacoches","Lona","Otros"];

const newTractora = () => ({
  id: "T_"+Date.now(),
  tipo:"tractora",
  matricula:"", subtipo:"Tractora", apodo:"", foto:"",
  kmMensuales:"",
  seguro:"", autonomo:"", leasing:"", impuestos:"", gestoria:"", parking:"", peajesMensuales:"",
  itv:"", seguroVto:"", aceite:"", tarjetaTransp:"",
  semiHabitual:"", conjuntoFijo:false,
});

const newSemi = () => ({
  id: "S_"+Date.now(),
  tipo:"semi",
  matricula:"", subtipo:"Tautliner", apodo:"", foto:"",
  seguro:"", itv:"",
});

const initialState = {
  onboarded:false, empresa:"", logo:"", accentIdx:0,
  tractoras:[], semis:[],
  activeTruckId:null,
  gastos:[], viajes:[],
  trialStart:null,
};

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SK));
    if (!d) return initialState;
    if (!d.tractoras) d.tractoras = [];
    if (!d.semis) d.semis = [];
    return {...initialState,...d};
  } catch { return initialState; }
}
function save(s) { localStorage.setItem(SK, JSON.stringify(s)); }

const Icon = ({d,size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const I = {
  truck:  "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  coin:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6v4m0 4h.01",
  dash:   "M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z",
  plus:   "M12 5v14M5 12h14",
  trash:  "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  alert:  "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  gear:   "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  arrow:  "M13 7l5 5m0 0l-5 5m5-5H6",
  check:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  lock:   "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  trend:  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  star:   "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  clock:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bell:   "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  camera: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z",
  chart:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  back:   "M19 12H5M12 5l-7 7 7 7",
  edit:   "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  link:   "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
};

const euros = n => isNaN(n)||n==null ? "—" : new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const eurosKm = n => isNaN(n)||n==null||!isFinite(n) ? "—" : `${Number(n).toFixed(3).replace(".",",")} €/km`;
const pct = n => isNaN(n)||!isFinite(n) ? "—" : `${Math.round(n)}%`;

function calcTractora(t) {
  const km = parseFloat(t.kmMensuales)||0;
  const fijos = ["seguro","autonomo","leasing","impuestos","gestoria","parking","peajesMensuales"]
    .reduce((s,k)=>s+(parseFloat(t[k])||0),0);
  return { fijos, costeFijoKm: km>0?fijos/km:0, km };
}

function alertDays(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr)-Date.now())/86400000);
}
function alertColor(days, margin) {
  if (days===null) return null;
  if (days<0) return "r";
  if (days<=7) return "r";
  if (days<=margin) return "y";
  return "g";
}

// ── CITIES ────────────────────────────────────────────────────────────────────
const CITIES = {
  // España
  "madrid":[40.4168,-3.7038],"barcelona":[41.3851,2.1734],"valencia":[39.4699,-0.3763],
  "sevilla":[37.3891,-5.9845],"zaragoza":[41.6488,-0.8891],"malaga":[36.7213,-4.4214],
  "murcia":[37.9922,-1.1307],"palma":[39.5696,2.6502],"granada":[37.1773,-3.5986],
  "bilbao":[43.2630,-2.9350],"alicante":[38.3452,-0.4810],"valladolid":[41.6523,-4.7245],
  "cordoba":[37.8882,-4.7794],"vigo":[42.2314,-8.7124],"gijon":[43.5453,-5.6615],
  "vitoria":[42.8467,-2.6726],"coruña":[43.3623,-8.4115],"pamplona":[42.8125,-1.6458],
  "santander":[43.4623,-3.8099],"almeria":[36.8340,-2.4637],"burgos":[42.3440,-3.6970],
  "salamanca":[40.9701,-5.6635],"huelva":[37.2614,-6.9447],"badajoz":[38.8794,-6.9706],
  "logroño":[42.4650,-2.4456],"cadiz":[36.5271,-6.2886],"tarragona":[41.1189,1.2445],
  "lleida":[41.6175,0.6200],"albacete":[38.9942,-1.8564],"jaen":[37.7796,-3.7849],
  "toledo":[39.8628,-4.0273],"caceres":[39.4753,-6.3723],"teruel":[40.3440,-1.1065],
  "cuenca":[40.0704,-2.1374],"guadalajara":[40.6328,-3.1671],"soria":[41.7640,-2.4686],
  "segovia":[40.9429,-4.1088],"avila":[40.6564,-4.6816],"zamora":[41.5036,-5.7444],
  "leon":[42.5987,-5.5671],"palencia":[42.0097,-4.5290],"oviedo":[43.3614,-5.8497],
  "lugo":[43.0097,-7.5567],"ourense":[42.3364,-7.8641],"pontevedra":[42.4338,-8.6444],
  "huesca":[42.1401,-0.4089],"gerona":[41.9794,2.8214],"lerida":[41.6175,0.6200],
  "castellon":[39.9864,-0.0513],"alicante":[38.3452,-0.4810],"murcia":[37.9922,-1.1307],
  "irun":[43.3378,-1.7886],"algeciras":[36.1274,-5.4536],"cartagena":[37.6257,-0.9966],
  // Francia
  "paris":[48.8566,2.3522],"lyon":[45.7640,4.8357],"marsella":[43.2965,5.3698],
  "toulouse":[43.6047,1.4442],"burdeos":[44.8378,-0.5792],"nantes":[47.2184,-1.5536],
  "lille":[50.6292,3.0573],"estrasburgo":[48.5734,7.7521],"niza":[43.7102,7.2620],
  "rennes":[48.1173,-1.6778],"reims":[49.2583,4.0317],"le havre":[49.4944,0.1079],
  "montpellier":[43.6119,3.8772],"grenoble":[45.1885,5.7245],"dijon":[47.3220,5.0415],
  "calais":[50.9513,1.8587],"perpignan":[42.6887,2.8948],"metz":[49.1193,6.1757],
  // Alemania
  "frankfurt":[50.1109,8.6821],"munich":[48.1351,11.5820],"berlin":[52.5200,13.4050],
  "hamburgo":[53.5753,10.0153],"colonia":[50.9333,6.9500],"stuttgart":[48.7758,9.1829],
  "dusseldorf":[51.2217,6.7762],"dortmund":[51.5136,7.4653],"essen":[51.4508,7.0131],
  "bremen":[53.0793,8.8017],"hannover":[52.3759,9.7320],"leipzig":[51.3397,12.3731],
  "nuremberg":[49.4521,11.0767],"mannheim":[49.4875,8.4660],
  // Italia
  "milan":[45.4654,9.1859],"roma":[41.9028,12.4964],"turin":[45.0703,7.6869],
  "napoles":[40.8518,14.2681],"bologna":[44.4949,11.3426],"florencia":[43.7696,11.2558],
  "venecia":[45.4408,12.3155],"genova":[44.4056,8.9463],"palermo":[38.1157,13.3615],
  "verona":[45.4384,10.9916],"bari":[41.1171,16.8719],"trieste":[45.6495,13.7768],
  // Portugal
  "lisboa":[38.7223,-9.1393],"oporto":[41.1579,-8.6291],"faro":[37.0194,-7.9322],
  "braga":[41.5454,-8.4265],"coimbra":[40.2033,-8.4103],"setubal":[38.5244,-8.8882],
  // Reino Unido
  "londres":[51.5074,-0.1278],"birmingham":[52.4862,-1.8904],"manchester":[53.4808,-2.2426],
  "glasgow":[55.8642,-4.2518],"liverpool":[53.4084,-2.9916],"bristol":[51.4545,-2.5879],
  "leeds":[53.8008,-1.5491],"sheffield":[53.3811,-1.4701],"edimburgo":[55.9533,-3.1883],
  // Bélgica
  "bruselas":[50.8503,4.3517],"amberes":[51.2194,4.4025],"lieja":[50.6292,5.5797],"gante":[51.0543,3.7174],
  // Holanda
  "amsterdam":[52.3676,4.9041],"rotterdam":[51.9225,4.4792],"utrecht":[52.0907,5.1214],"eindhoven":[51.4416,5.4697],
  // Polonia
  "varsovia":[52.2297,21.0122],"cracovia":[50.0647,19.9450],"gdansk":[54.3520,18.6466],"wroclaw":[51.1079,17.0385],
  // República Checa
  "praga":[50.0755,14.4378],"brno":[49.1951,16.6068],
  // Austria
  "viena":[48.2082,16.3738],"salzburgo":[47.8095,13.0550],"graz":[47.0707,15.4395],
  // Suiza
  "ginebra":[46.2044,6.1432],"zurich":[47.3769,8.5417],"basilea":[47.5596,7.5886],"berna":[46.9480,7.4474],
  // Luxemburgo
  "luxemburgo":[49.6117,6.1319],
  // España puertos
  "barcelona puerto":[41.3505,2.1635],"bilbao puerto":[43.3500,-3.0200],"algeciras":[36.1274,-5.4536],
  "vigo puerto":[42.2400,-8.7300],"valencia puerto":[39.4500,-0.3200],
};

function calcKmBetween(origen, destino) {
  const o = CITIES[origen.toLowerCase().trim()];
  const d = CITIES[destino.toLowerCase().trim()];
  if (!o || !d) return null;
  const R = 6371;
  const dLat = (d[0]-o[0])*Math.PI/180;
  const dLon = (d[1]-o[1])*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(o[0]*Math.PI/180)*Math.cos(d[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*1.25);
}

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const PAISES = ["España","Francia","Alemania","Italia","Portugal","Reino Unido","Bélgica","Holanda","Polonia","Chequia","Austria","Suiza","Luxemburgo","Otro"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const makeCSS = (accent) => `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08080F;--s1:#0F0F1A;--s2:#15151F;--s3:#1C1C28;
  --border:#ffffff0D;--border2:#ffffff18;--border3:#ffffff28;
  --a1:${accent.a1};--a2:${accent.a2};
  --green:#06D6A0;--red:#FF3D5A;--yellow:#FFD166;
  --text:#EEEDF5;--muted:#68687A;--muted2:#45455A;--r:16px;--r2:12px;
}
body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
.ob{flex:1;display:flex;flex-direction:column;overflow-y:auto}
.ob-hero{position:relative;padding:3rem 1.75rem 2rem;text-align:center;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:1.25rem}
.ob-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:300px;height:300px;background:radial-gradient(circle,${accent.a1}18,transparent 65%);pointer-events:none}
.ob-logo{position:relative;z-index:1;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px ${accent.a1}35}
.ob-wordmark{position:relative;z-index:1;font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.06em;line-height:1;background:linear-gradient(160deg,#fff 0%,#FFD166 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ob-tagline{position:relative;z-index:1;font-size:0.9rem;color:var(--muted);line-height:1.65;max-width:270px}
.ob-feats{padding:0 1.5rem;display:flex;flex-direction:column;gap:0.5rem}
.ob-feat{display:flex;align-items:center;gap:0.875rem;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:0.875rem 1rem}
.ob-fi{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ob-ft{font-size:0.85rem;font-weight:600}.ob-fs{font-size:0.72rem;color:var(--muted);margin-top:1px}
.ob-bottom{padding:1.25rem;display:flex;flex-direction:column;gap:0.875rem}
.trial-strip{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem}
.trial-num{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.04em;line-height:1;background:linear-gradient(135deg,${accent.a1},#FFD166);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.trial-info{flex:1}.trial-title{font-weight:700;font-size:0.9rem}
.trial-desc{font-size:0.75rem;color:var(--muted);margin-top:2px;line-height:1.4}
.checks{display:grid;grid-template-columns:1fr 1fr;gap:0.375rem}
.chk{display:flex;align-items:center;gap:0.375rem;font-size:0.75rem;color:var(--muted)}
.pay{flex:1;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;overflow-y:auto}
.pay-back{background:none;border:none;color:var(--muted);cursor:pointer;font-family:inherit;font-size:0.83rem;display:flex;align-items:center;gap:0.375rem;padding:0}
.pay-h{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.04em;line-height:1.1}
.pay-sub{font-size:0.83rem;color:var(--muted);line-height:1.55;margin-top:0.25rem}
.plan-box{background:var(--s2);border:1px solid ${accent.a1}33;border-radius:var(--r);padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center}
.plan-name{font-weight:700;font-size:0.9rem}.plan-free{font-size:0.73rem;color:var(--green);margin-top:3px}
.plan-price{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:0.04em;color:var(--a1);text-align:right}
.plan-period{font-size:0.68rem;color:var(--muted);text-align:right}
.cf{display:flex;flex-direction:column;gap:0.35rem}
.cl{font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;font-weight:600}
.ci{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;padding:0.7rem 1rem;width:100%;outline:none;transition:border-color 0.2s}
.ci:focus{border-color:var(--a1)}
.cr{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
.sec-note{display:flex;align-items:center;justify-content:center;gap:0.375rem;font-size:0.73rem;color:var(--muted2)}
.btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;border:none;border-radius:var(--r2);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.875rem;transition:all 0.15s;padding:0.875rem 1.5rem;width:100%;letter-spacing:0.01em}
.bp{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff;box-shadow:0 6px 20px ${accent.a1}28}
.bp:hover{transform:translateY(-2px);box-shadow:0 10px 28px ${accent.a1}40}
.bg{background:var(--s2);color:var(--text);border:1px solid var(--border2)}
.bg:hover{border-color:var(--border3)}
.bsm{padding:0.4rem 0.875rem;font-size:0.78rem;border-radius:8px;width:auto}
.bd{background:#FF3D5A10;color:var(--red);border:1px solid #FF3D5A20}
.bd:hover{background:#FF3D5A20}
.hdr{padding:0.75rem 1.125rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(15,15,26,0.92);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}
.hdr-left{display:flex;align-items:center;gap:0.75rem}
.hdr-logo{width:34px;height:34px;border-radius:10px;object-fit:cover;border:1px solid var(--border2)}
.hdr-logo-ph{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#fff}
.hdr-brand{font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:0.07em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.hdr-sub{font-size:0.62rem;color:var(--muted);margin-top:1px}
.trial-chip{display:flex;align-items:center;gap:0.375rem;background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.275rem 0.7rem;font-size:0.7rem;color:var(--muted)}
.chip-d{color:var(--a2);font-weight:700;font-size:0.78rem}
.nav{display:grid;grid-template-columns:repeat(5,1fr);background:rgba(15,15,26,0.95);border-top:1px solid var(--border);position:sticky;bottom:0;z-index:20;backdrop-filter:blur(16px)}
.nb{display:flex;flex-direction:column;align-items:center;gap:0.18rem;padding:0.625rem 0 0.5rem;border:none;background:none;color:var(--muted2);cursor:pointer;font-size:0.55rem;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;letter-spacing:0.03em;transition:color 0.15s;position:relative}
.nb.on{color:var(--a1)}
.nb.on::after{content:'';position:absolute;top:0;inset-x:20%;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2});border-radius:0 0 3px 3px}
.nb:hover:not(.on){color:var(--text)}
.page{flex:1;overflow-y:auto;padding:1.125rem;display:flex;flex-direction:column;gap:0.875rem;padding-bottom:2rem}
.ptitle{font-family:'Bebas Neue',sans-serif;font-size:1.75rem;letter-spacing:0.04em}
.card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:1.125rem}
.chd{font-size:0.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.875rem}
.fld{display:flex;flex-direction:column;gap:0.325rem}
.lbl{font-size:0.73rem;color:var(--muted);font-weight:600}
.inp{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.85rem;padding:0.625rem 0.875rem;width:100%;outline:none;transition:border-color 0.2s}
.inp:focus{border-color:var(--a1)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem}
.sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2368687A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.875rem center;padding-right:2.25rem}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--s2);border:1px solid var(--border2);border-radius:10px;padding:0.625rem 0.875rem}
.toggle-lbl{font-size:0.85rem;font-weight:500}
.toggle{width:42px;height:22px;border-radius:999px;background:var(--s3);border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
.toggle.on{background:var(--a1)}
.toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform 0.2s}
.toggle.on::after{transform:translateX(20px)}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.stat{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.2rem}
.slbl{font-size:0.63rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em}
.sval{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.02em;line-height:1.1}
.g{color:var(--green)}.r{color:var(--red)}.y{color:var(--yellow)}.a{color:var(--a2)}
.hcard{position:relative;overflow:hidden;background:var(--s1);border:1px solid ${accent.a1}22;border-radius:var(--r);padding:1.375rem}
.hcard::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;background:radial-gradient(circle,${accent.a1}15,transparent 65%);pointer-events:none}
.hcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2},transparent)}
.hlbl{font-size:0.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em}
.hval{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.02em;line-height:1.05;color:var(--a1);margin-top:0.1rem}
.hsub{font-size:0.76rem;color:var(--muted);margin-top:0.3rem}
.greet{padding:0.125rem 0}
.greet-name{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:0.04em;line-height:1.1}
.greet-sub{font-size:0.83rem;color:var(--muted);margin-top:0.25rem}
.bwrap{display:flex;flex-direction:column;gap:0.625rem}
.brow{display:flex;flex-direction:column;gap:0.3rem}
.bmeta{display:flex;justify-content:space-between;font-size:0.78rem}
.btrack{height:5px;background:var(--s3);border-radius:999px;overflow:hidden}
.bfill{height:100%;border-radius:999px;transition:width 0.7s cubic-bezier(.4,0,.2,1)}
.trip{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.45rem}
.ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem}
.troute{font-weight:700;font-size:0.875rem}
.tdate{font-size:0.68rem;color:var(--muted);margin-top:2px}
.trow{display:flex;gap:0.75rem;font-size:0.73rem;color:var(--muted);flex-wrap:wrap}
.tfoot{display:flex;justify-content:space-between;align-items:center;padding-top:0.45rem;border-top:1px solid var(--border)}
.tvuelta{background:var(--s3);border-radius:8px;padding:0.3rem 0.625rem;font-size:0.7rem;color:var(--muted)}
.badge{display:inline-flex;align-items:center;padding:0.18rem 0.6rem;border-radius:999px;font-size:0.68rem;font-weight:700}
.bg-g{background:#06D6A012;color:var(--green);border:1px solid #06D6A020}
.bg-r{background:#FF3D5A12;color:var(--red);border:1px solid #FF3D5A20}
.bg-y{background:#FFD16612;color:var(--yellow);border:1px solid #FFD16620}
.alert{display:flex;align-items:flex-start;gap:0.75rem;padding:0.875rem;border-radius:var(--r2);font-size:0.82rem;line-height:1.55}
.ar{background:#FF3D5A0C;border:1px solid #FF3D5A20;color:#FFB3BC}
.ay{background:#FFD1660C;border:1px solid #FFD16620;color:#FFE9A0}
.ag{background:#06D6A00C;border:1px solid #06D6A020;color:#7FECCE}
.alert-item{display:flex;align-items:center;justify-content:space-between;padding:0.7rem;background:var(--s2);border-radius:10px;border:1px solid var(--border)}
.alert-item.r{border-color:#FF3D5A25}.alert-item.y{border-color:#FFD16625}
.alert-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-r{background:var(--red)}.dot-y{background:var(--yellow)}.dot-g{background:var(--green)}
.ov{position:fixed;inset:0;background:#000000CC;z-index:50;display:flex;align-items:flex-end;justify-content:center}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:22px 22px 0 0;width:100%;max-width:430px;max-height:92vh;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:0.875rem}
.mdrag{width:36px;height:4px;background:var(--border2);border-radius:999px;margin:0 auto -0.25rem}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:0.04em}
.mact{display:flex;gap:0.75rem;margin-top:0.25rem}
.vcard{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:0.875rem;display:flex;align-items:center;gap:0.875rem;cursor:pointer;transition:border-color 0.2s}
.vcard.active{border-color:var(--a1)}.vcard:hover{border-color:var(--border3)}
.vcard-foto{width:42px;height:42px;border-radius:10px;object-fit:cover;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);overflow:hidden}
.vcard-info{flex:1}
.vcard-mat{font-weight:700;font-size:0.875rem}
.vcard-tipo{font-size:0.7rem;color:var(--muted);margin-top:1px}
.vcard-apodo{font-size:0.7rem;color:var(--a2);margin-top:1px;font-weight:600}
.semi-tag{display:inline-flex;align-items:center;gap:0.25rem;background:var(--s3);border:1px solid var(--border2);border-radius:6px;padding:0.2rem 0.5rem;font-size:0.68rem;color:var(--muted)}
.mchart{display:flex;align-items:flex-end;gap:3px;height:52px}
.mbar{flex:1;border-radius:4px 4px 0 0;min-width:5px;transition:height 0.5s cubic-bezier(.4,0,.2,1)}
.mtable{width:100%;border-collapse:collapse;font-size:0.78rem}
.mtable th{text-align:left;padding:0.35rem 0.5rem;color:var(--muted);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border)}
.mtable td{padding:0.45rem 0.5rem;border-bottom:1px solid var(--border)}
.mtable tr:last-child td{border-bottom:none}
.photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:var(--s2);border:1.5px dashed var(--border2);border-radius:var(--r2);padding:1rem;cursor:pointer;transition:border-color 0.2s;width:100%}
.photo-btn:hover{border-color:var(--a1)}
.accent-grid{display:flex;gap:0.625rem;flex-wrap:wrap}
.accent-dot{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:border-color 0.15s,transform 0.15s}
.accent-dot.sel{border-color:#fff;transform:scale(1.15)}
.empty{display:flex;flex-direction:column;align-items:center;gap:0.875rem;padding:2rem 1rem;color:var(--muted);text-align:center}
.ei{width:46px;height:46px;border-radius:14px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.conjunto-card{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem;display:flex;flex-direction:column;gap:0.5rem}
.conjunto-header{display:flex;align-items:center;gap:0.5rem;font-weight:700;font-size:0.9rem}
.tabs-row{display:flex;gap:0.375rem;margin-bottom:0.25rem}
.tab-btn{flex:1;padding:0.45rem;font-size:0.75rem;border-radius:8px;border:1px solid var(--border2);background:var(--s2);color:var(--muted);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;transition:all 0.15s;text-align:center}
.tab-btn.on{background:var(--a1);color:#fff;border-color:var(--a1)}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.25s ease both}
`;

// ── PHOTO UPLOAD ──────────────────────────────────────────────────────────────
function PhotoUpload({ value, onChange, label="Foto", height=80 }) {
  const ref = useRef();
  const handle = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="fld">
      <label className="lbl">{label}</label>
      <div className="photo-btn" style={{height}} onClick={()=>ref.current.click()}>
        {value ? <img src={value} alt="" style={{width:"100%",height:height-16,objectFit:"cover",borderRadius:8}}/> :
          <><Icon d={I.camera} size={18} color="var(--muted)"/><span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Toca para subir foto</span></>}
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
      </div>
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ name:"", num:"", exp:"", cvc:"" });
  const feats = [
    { icon:I.trend, col:"#FF3D5A", bg:"#FF3D5A15", t:"Rentabilidad real por km",  s:"Fijos + variables automáticos" },
    { icon:I.truck, col:"#06D6A0", bg:"#06D6A015", t:"Gestión de flota completa",  s:"Tractoras, semirremolques y conjuntos" },
    { icon:I.bell,  col:"#FFD166", bg:"#FFD16615", t:"Alertas de vencimientos",    s:"ITV, seguro, aceite y tarjeta" },
    { icon:I.chart, col:"#FF7A3D", bg:"#FF7A3D15", t:"Resumen mensual y anual",    s:"Por vehículo, conjunto o toda la flota" },
  ];
  if (step===0) return (
    <div className="ob fu">
      <div className="ob-hero">
        <div className="ob-glow"/>
        <div className="ob-logo"><Icon d={I.truck} size={34} color="#fff"/></div>
        <div>
          <div className="ob-wordmark">Km<br/>Rentable</div>
          <p className="ob-tagline">Tu negocio de transporte en el bolsillo. Sabe exactamente si ganas dinero.</p>
        </div>
      </div>
      <div className="ob-feats">
        {feats.map((f,i)=>(
          <div className="ob-feat" key={i}>
            <div className="ob-fi" style={{background:f.bg}}><Icon d={f.icon} size={16} color={f.col}/></div>
            <div><div className="ob-ft">{f.t}</div><div className="ob-fs">{f.s}</div></div>
          </div>
        ))}
      </div>
      <div className="ob-bottom">
        <div className="trial-strip">
          <div className="trial-num">30</div>
          <div className="trial-info">
            <div className="trial-title">días completamente gratis</div>
            <div className="trial-desc">Después 14,99€/mes · Sin permanencia · Cancela cuando quieras</div>
          </div>
        </div>
        <div className="checks">
          {["Sin permanencia","Cancela en 1 clic","Datos seguros","Soporte incluido"].map(t=>(
            <div className="chk" key={t}><Icon d={I.check} size={12} color="var(--green)"/><span>{t}</span></div>
          ))}
        </div>
        <button className="btn bp" onClick={()=>setStep(1)}>Empezar gratis <Icon d={I.arrow} size={15} color="#fff"/></button>
        <p style={{textAlign:"center",fontSize:"0.72rem",color:"var(--muted)"}}>Se solicita método de pago para activar la prueba</p>
      </div>
    </div>
  );
  return (
    <div className="pay fu">
      <button className="pay-back" onClick={()=>setStep(0)}><Icon d={I.back} size={14}/> Volver</button>
      <div><div className="pay-h">Método de pago</div><p className="pay-sub">No se cobra nada hoy. Primer cargo el día 31.</p></div>
      <div className="plan-box">
        <div><div className="plan-name">KmRentable Pro</div><div className="plan-free">✦ 30 días gratis incluidos</div></div>
        <div><div className="plan-price">14,99€</div><div className="plan-period">al mes tras la prueba</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        <div className="cf"><label className="cl">Nombre en la tarjeta</label><input className="ci" placeholder="Juan García" value={card.name} onChange={e=>setCard({...card,name:e.target.value})}/></div>
        <div className="cf"><label className="cl">Número de tarjeta</label><input className="ci" placeholder="1234  5678  9012  3456" value={card.num} onChange={e=>setCard({...card,num:e.target.value})}/></div>
        <div className="cr">
          <div className="cf"><label className="cl">Caducidad</label><input className="ci" placeholder="MM/AA" value={card.exp} onChange={e=>setCard({...card,exp:e.target.value})}/></div>
          <div className="cf"><label className="cl">CVC</label><input className="ci" placeholder="•••" value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value})}/></div>
        </div>
      </div>
      <button className="btn bp" onClick={onComplete}><Icon d={I.lock} size={15} color="#fff"/> Activar prueba gratuita</button>
      <div className="sec-note"><Icon d={I.lock} size={12} color="var(--muted2)"/><span>Pago seguro SSL · Powered by Stripe</span></div>
    </div>
  );
}

// ── FLOTA PAGE ────────────────────────────────────────────────────────────────
function FlotaPage({ state, update }) {
  const [tab, setTab] = useState("flota");
  const [editT, setEditT] = useState(null);
  const [editS, setEditS] = useState(null);

  const tractoras = state.tractoras||[];
  const semis = state.semis||[];

  const saveTractora = (t) => {
    const exists = tractoras.find(x=>x.id===t.id);
    update({ tractoras: exists ? tractoras.map(x=>x.id===t.id?t:x) : [...tractoras,t] });
    setEditT(null);
  };
  const deleteTractora = (id) => { update({ tractoras: tractoras.filter(x=>x.id!==id) }); };
  const saveSemi = (s) => {
    const exists = semis.find(x=>x.id===s.id);
    update({ semis: exists ? semis.map(x=>x.id===s.id?s:x) : [...semis,s] });
    setEditS(null);
  };
  const deleteSemi = (id) => { update({ semis: semis.filter(x=>x.id!==id) }); };

  if (editT) return <TruckForm tractora={editT} semis={semis} onSave={saveTractora} onCancel={()=>setEditT(null)}/>;
  if (editS) return <SemiForm semi={editS} onSave={saveSemi} onCancel={()=>setEditS(null)}/>;

  return (
    <div className="page fu">
      <div className="ptitle">Flota</div>
      <div className="tabs-row">
        {[["flota","Mi flota"],["empresa","Empresa"]].map(([id,lbl])=>(
          <div key={id} className={`tab-btn ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</div>
        ))}
      </div>

      {tab==="flota" && <>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🚛 Tractoras</span>
            <button className="btn bg bsm" onClick={()=>setEditT(newTractora())}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {tractoras.length===0 && <div className="empty" style={{padding:"1.25rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin tractoras — añade la primera</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {tractoras.map(t=>{
              const semi = semis.find(s=>s.id===t.semiHabitual);
              return (
                <div key={t.id} className="vcard" onClick={()=>setEditT(t)}>
                  <div className="vcard-foto">{t.foto?<img src={t.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="var(--muted)"/>}</div>
                  <div className="vcard-info">
                    <div className="vcard-mat">{t.matricula||"Sin matrícula"}</div>
                    <div className="vcard-tipo">{t.subtipo||"Tractora"}</div>
                    {t.apodo&&<div className="vcard-apodo">"{t.apodo}"</div>}
                    {semi&&<div className="semi-tag" style={{marginTop:3}}><Icon d={I.link} size={10}/>{semi.matricula} {t.conjuntoFijo?"(conjunto fijo)":""}</div>}
                  </div>
                  <Icon d={I.edit} size={15} color="var(--muted)"/>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{marginTop:"0.25rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🔧 Semirremolques</span>
            <button className="btn bg bsm" onClick={()=>setEditS(newSemi())}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {semis.length===0 && <div className="empty" style={{padding:"1.25rem"}}><div className="ei"><Icon d={I.gear} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin semirremolques registrados</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {semis.map(s=>(
              <div key={s.id} className="vcard" onClick={()=>setEditS(s)}>
                <div className="vcard-foto">{s.foto?<img src={s.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.gear} size={18} color="var(--muted)"/>}</div>
                <div className="vcard-info">
                  <div className="vcard-mat">{s.matricula||"Sin matrícula"}</div>
                  <div className="vcard-tipo">{s.subtipo||"Semirremolque"}</div>
                  {s.apodo&&<div className="vcard-apodo">"{s.apodo}"</div>}
                </div>
                <Icon d={I.edit} size={15} color="var(--muted)"/>
              </div>
            ))}
          </div>
        </div>
      </>}

      {tab==="empresa" && (
        <>
          <div className="card">
            <div className="chd">Tu empresa</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              <div className="fld"><label className="lbl">Nombre / Empresa</label>
                <input className="inp" type="text" value={state.empresa||""} placeholder="Transportes García S.L." onChange={e=>update({empresa:e.target.value})}/></div>
              <PhotoUpload value={state.logo} onChange={v=>update({logo:v})} label="Logo de empresa" height={90}/>
            </div>
          </div>
          <div className="card">
            <div className="chd">Color de la app</div>
            <div className="accent-grid">
              {ACCENTS.map((a,i)=>(
                <div key={i} className={`accent-dot ${state.accentIdx===i?"sel":""}`}
                  style={{background:`linear-gradient(135deg,${a.a1},${a.a2})`}}
                  onClick={()=>update({accentIdx:i})}/>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TruckForm({ tractora, semis, onSave, onCancel }) {
  const [t, setT] = useState(tractora);
  const f = (k,ph="0",type="number") => <input className="inp" type={type} value={t[k]||""} placeholder={ph} onChange={e=>setT({...t,[k]:e.target.value})}/>;
  const calc = calcTractora(t);
  return (
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button>
        <div className="ptitle">{t.matricula||"Nueva tractora"}</div>
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={t.foto} onChange={v=>setT({...t,foto:v})} label="Foto del vehículo"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={t.matricula||""} placeholder="1234 ABC" onChange={e=>setT({...t,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={t.apodo||""} placeholder="El Titán" onChange={e=>setT({...t,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label>
            <select className="inp sel" value={t.subtipo||""} onChange={e=>setT({...t,subtipo:e.target.value})}>
              {TIPOS_TRACTORA.map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="fld"><label className="lbl">Km/mes estimados</label>{f("kmMensuales")}</div>
        </div>
      </div>

      {semis.length>0&&<div className="card">
        <div className="chd">Conjunto</div>
        <div className="fld" style={{marginBottom:"0.625rem"}}>
          <label className="lbl">Semirremolque habitual</label>
          <select className="inp sel" value={t.semiHabitual||""} onChange={e=>setT({...t,semiHabitual:e.target.value})}>
            <option value="">Sin semirremolque fijo</option>
            {semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin matrícula"} — {s.subtipo}</option>)}
          </select>
        </div>
        {t.semiHabitual&&<div className="toggle-row">
          <span className="toggle-lbl">Siempre va el mismo conjunto</span>
          <button className={`toggle ${t.conjuntoFijo?"on":""}`} onClick={()=>setT({...t,conjuntoFijo:!t.conjuntoFijo})}/>
        </div>}
      </div>}

      <div className="card">
        <div className="chd">Costes fijos mensuales</div>
        <div className="g2">
          {[["seguro","Seguro"],["autonomo","Autónomo / Nóminas"],["leasing","Leasing / Renting"],["impuestos","Impuestos *"],["gestoria","Gestoría"],["parking","Parking / Base"],["peajesMensuales","Peajes fijos/mes"]].map(([k,l])=>(
            <div className="fld" key={k}><label className="lbl">{l}</label>{f(k)}</div>
          ))}
        </div>
        <p style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:"0.5rem"}}>* Consulta con tu gestor según tu régimen fiscal</p>
      </div>

      <div className="card">
        <div className="chd">Alertas</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {[["itv","📋 Próxima ITV"],["seguroVto","🛡️ Vencimiento seguro"],["aceite","🔧 Próximo cambio aceite"],["tarjetaTransp","📄 Tarjeta de transporte"]].map(([k,l])=>(
            <div className="fld" key={k}><label className="lbl">{l}</label>
              <input className="inp" type="date" value={t[k]||""} onChange={e=>setT({...t,[k]:e.target.value})}/></div>
          ))}
        </div>
      </div>

      {calc.fijos>0&&<div className="hcard">
        <div className="hlbl">Coste fijo por km</div>
        <div className="hval">{eurosKm(calc.costeFijoKm)}</div>
        <div className="hsub">Total mensual: {euros(calc.fijos)}</div>
      </div>}

      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button>
        <button className="btn bp" style={{flex:2}} onClick={()=>onSave(t)}>Guardar</button>
      </div>
    </div>
  );
}

function SemiForm({ semi, onSave, onCancel }) {
  const [s, setS] = useState(semi);
  return (
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button>
        <div className="ptitle">{s.matricula||"Nuevo semirremolque"}</div>
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={s.foto} onChange={v=>setS({...s,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={s.matricula||""} placeholder="R-1234" onChange={e=>setS({...s,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={s.apodo||""} placeholder="opcional" onChange={e=>setS({...s,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label>
            <select className="inp sel" value={s.subtipo||""} onChange={e=>setS({...s,subtipo:e.target.value})}>
              {TIPOS_SEMI.map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="fld"><label className="lbl">Seguro</label><input className="inp" type="number" value={s.seguro||""} placeholder="0" onChange={e=>setS({...s,seguro:e.target.value})}/></div>
        </div>
      </div>
      <div className="card">
        <div className="chd">Alertas</div>
        <div className="fld"><label className="lbl">📋 Próxima ITV remolque</label>
          <input className="inp" type="date" value={s.itv||""} onChange={e=>setS({...s,itv:e.target.value})}/></div>
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button>
        <button className="btn bp" style={{flex:2}} onClick={()=>onSave(s)}>Guardar</button>
      </div>
    </div>
  );
}

// ── GASTOS PAGE ───────────────────────────────────────────────────────────────
function GastosPage({ state, update }) {
  const [modal, setModal] = useState(false);
  const gastos = state.gastos||[];
  const tractoras = state.tractoras||[];
  const semis = state.semis||[];
  const defaultVId = tractoras[0]?.id||"";
  const [form, setForm] = useState({ fecha:new Date().toISOString().slice(0,10), tipo:"Combustible", importe:"", litros:"", preciolitro:"", pais:"España", vehicleId:defaultVId, vehicleTipo:"tractora", nota:"" });

  const tipos = ["Combustible","Peaje","Mantenimiento","Neumáticos","Avería","ITV","Lavado","Seguro","Otros"];
  const total = gastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const byTipo = tipos.map(t=>({t,v:gastos.filter(g=>g.tipo===t).reduce((s,g)=>s+(parseFloat(g.importe)||0),0)})).filter(x=>x.v>0);
  const maxV = Math.max(...byTipo.map(x=>x.v),1);

  const handleLitros = (litros, precio) => {
    const imp = (parseFloat(litros)||0)*(parseFloat(precio)||0);
    setForm(f=>({...f,litros,preciolitro:precio,importe:imp>0?imp.toFixed(2):""}));
  };

  return (
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Gastos</div>
        <button className="btn bg bsm" onClick={()=>setModal(true)}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>

      <div className="sgrid">
        <div className="stat"><div className="slbl">Total gastos</div><div className="sval r">{euros(total)}</div></div>
        <div className="stat"><div className="slbl">Registros</div><div className="sval">{gastos.length}</div></div>
      </div>

      {byTipo.length>0&&<div className="card">
        <div className="chd">Por categoría</div>
        <div className="bwrap">
          {byTipo.sort((a,b)=>b.v-a.v).map(({t,v})=>(
            <div className="brow" key={t}>
              <div className="bmeta"><span>{t}</span><span style={{color:"var(--muted)"}}>{euros(v)}</span></div>
              <div className="btrack"><div className="bfill" style={{width:`${(v/maxV)*100}%`,background:`linear-gradient(90deg,${ACCENTS[state.accentIdx||0].a1},${ACCENTS[state.accentIdx||0].a2})`}}/></div>
            </div>
          ))}
        </div>
      </div>}

      {gastos.length===0?<div className="empty"><div className="ei"><Icon d={I.coin} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin gastos</strong><span style={{fontSize:"0.8rem"}}>Registra combustible, peajes, ITV...</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {[...gastos].reverse().map((g,ri)=>{
          const i=gastos.length-1-ri;
          const veh = [...tractoras,...semis].find(v=>v.id===g.vehicleId);
          return <div className="trip" key={i}>
            <div className="ttop">
              <div>
                <div className="troute">{g.tipo}{g.pais&&g.pais!=="España"?` · ${g.pais}`:""}</div>
                <div className="tdate">{g.fecha}{veh?` · ${veh.matricula}`:""}{g.nota?` · ${g.nota}`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:"1.1rem",color:"var(--red)",letterSpacing:"0.02em"}}>{euros(parseFloat(g.importe))}</span>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={()=>update({gastos:gastos.filter((_,idx)=>idx!==i)})}><Icon d={I.trash} size={12}/></button>
              </div>
            </div>
            {g.litros&&<div className="trow"><span>⛽ {g.litros}L · {g.preciolitro}€/L</span></div>}
          </div>;
        })}
      </div>}

      {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mdrag"/><div className="mtitle">Nuevo gasto</div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>{tipos.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          {form.tipo==="Combustible"&&<div className="g2">
            <div className="fld"><label className="lbl">Litros</label><input className="inp" type="number" placeholder="0" value={form.litros} onChange={e=>handleLitros(e.target.value,form.preciolitro)}/></div>
            <div className="fld"><label className="lbl">€/litro</label><input className="inp" type="number" placeholder="0,00" value={form.preciolitro} onChange={e=>handleLitros(form.litros,e.target.value)}/></div>
          </div>}
          <div className="fld"><label className="lbl">Importe total (€) {form.tipo==="Combustible"&&<span style={{color:"var(--green)",fontSize:"0.7rem"}}>· calculado auto</span>}</label>
            <input className="inp" type="number" placeholder="0,00" value={form.importe} onChange={e=>setForm({...form,importe:e.target.value})}/></div>
          {form.tipo==="Combustible"&&<div className="fld"><label className="lbl">País</label>
            <select className="inp sel" value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Asignar a</label>
              <select className="inp sel" value={form.vehicleTipo} onChange={e=>setForm({...form,vehicleTipo:e.target.value,vehicleId:e.target.value==="tractora"?tractoras[0]?.id||"":semis[0]?.id||""})}>
                <option value="tractora">Tractora</option>
                {semis.length>0&&<option value="semi">Semirremolque</option>}
              </select></div>
            <div className="fld"><label className="lbl">Matrícula</label>
              <select className="inp sel" value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})}>
                {(form.vehicleTipo==="tractora"?tractoras:semis).map(v=><option key={v.id} value={v.id}>{v.matricula||"Sin mat."}</option>)}
              </select></div>
          </div>
          <div className="fld"><label className="lbl">Nota</label><input className="inp" placeholder="opcional" value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})}/></div>
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={()=>{
              if(!form.importe)return;
              update({gastos:[...(state.gastos||[]),{...form}]});
              setForm({fecha:new Date().toISOString().slice(0,10),tipo:"Combustible",importe:"",litros:"",preciolitro:"",pais:"España",vehicleId:tractoras[0]?.id||"",vehicleTipo:"tractora",nota:""});
              setModal(false);
            }}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── VIAJES PAGE ───────────────────────────────────────────────────────────────
function ViajesPage({ state, update }) {
  const [modal, setModal] = useState(false);
  const [vuelta, setVuelta] = useState(false);
  const tractoras = state.tractoras||[];
  const semis = state.semis||[];
  const viajes = state.viajes||[];
  const defaultT = tractoras[0];

  const getAutoSemi = (truckId) => {
    const t = tractoras.find(x=>x.id===truckId);
    if (t?.conjuntoFijo && t?.semiHabitual) return t.semiHabitual;
    return "";
  };

  const [form, setForm] = useState({
    fecha:new Date().toISOString().slice(0,10), cliente:"", origen:"", destino:"", pais:"España",
    km:"", kmAuto:false, kmVuelta:"", peaje:"", precio:"",
    truckId:defaultT?.id||"", semiId:getAutoSemi(defaultT?.id||""),
  });

  const handleOD = (field, val) => {
    const nf = {...form,[field]:val};
    const km = calcKmBetween(nf.origen, nf.destino);
    if (km) { nf.km=String(km); nf.kmAuto=true; } else { nf.kmAuto=false; }
    setForm(nf);
  };

  const handleTruck = (truckId) => {
    setForm(f=>({...f, truckId, semiId:getAutoSemi(truckId)}));
  };

  const truck = tractoras.find(t=>t.id===form.truckId)||defaultT;
  const calc = truck ? calcTractora(truck) : {costeFijoKm:0};

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truckId);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    const coste = km*c.costeFijoKm+peaje;
    return { coste, ben:precio-coste, margen:precio>0?((precio-coste)/precio)*100:0 };
  };

  const selectedTruck = tractoras.find(t=>t.id===form.truckId);
  const conjuntoFijo = selectedTruck?.conjuntoFijo && selectedTruck?.semiHabitual;
  const availableSemis = conjuntoFijo ? semis.filter(s=>s.id===selectedTruck.semiHabitual) : semis;

  return (
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bg bsm" onClick={()=>setModal(true)}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>

      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Añade una tractora en <strong>Flota</strong> para registrar viajes.</span></div>}

      {viajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Añade tu primera ruta</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {[...viajes].reverse().map((v,ri)=>{
          const i=viajes.length-1-ri;
          const {coste,ben,margen}=calcV(v);
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          const t=tractoras.find(x=>x.id===v.truckId);
          const s=semis.find(x=>x.id===v.semiId);
          return <div className="trip" key={i}>
            <div className="ttop">
              <div>
                <div className="troute">{v.origen||"—"} → {v.destino||"—"}{v.pais&&v.pais!=="España"?` 🌍`:""}</div>
                <div className="tdate">{v.fecha}{v.cliente?` · ${v.cliente}`:""}</div>
              </div>
              <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={()=>update({viajes:viajes.filter((_,idx)=>idx!==i)})}><Icon d={I.trash} size={12}/></button>
            </div>
            <div className="trow">
              {t&&<span>🚛 {t.matricula}</span>}
              {s&&<span>🔧 {s.matricula}</span>}
              <span>📏 {v.km}km ida</span>
              {v.kmVuelta&&<span>↩️ {v.kmVuelta}km</span>}
              <span>💰 {euros(parseFloat(v.precio))}</span>
              {v.peaje&&parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
            </div>
            {calc.costeFijoKm>0&&<div className="tfoot">
              <span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Coste {euros(coste)} · <span style={{color:ben>=0?"var(--green)":"var(--red)"}}>{ben>=0?"+":""}{euros(ben)}</span></span>
              <span className={`badge ${ok?"bg-g":warn?"bg-y":"bg-r"}`}>{bad?"🔴":warn?"🟡":"🟢"} {pct(margen)}</span>
            </div>}
          </div>;
        })}
      </div>}

      {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mdrag"/><div className="mtitle">Nuevo viaje</div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Cliente</label><input className="inp" placeholder="Nombre" value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Origen</label><input className="inp" placeholder="Ciudad" value={form.origen} onChange={e=>handleOD("origen",e.target.value)}/></div>
            <div className="fld"><label className="lbl">Destino</label><input className="inp" placeholder="Ciudad" value={form.destino} onChange={e=>handleOD("destino",e.target.value)}/></div>
          </div>
          <div className="fld"><label className="lbl">País destino</label>
            <select className="inp sel" value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="fld">
            <label className="lbl">Km de ida {form.kmAuto&&<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· calculado aprox.</span>}</label>
            <input className="inp" type="number" placeholder="0" value={form.km} onChange={e=>setForm({...form,km:e.target.value,kmAuto:false})}/>
          </div>
          <div className="toggle-row">
            <span className="toggle-lbl">↩️ Vuelta sin carga</span>
            <button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/>
          </div>
          {vuelta&&<div className="fld">
            <label className="lbl">Km de vuelta {form.km&&<span style={{color:"var(--muted)",fontSize:"0.68rem"}}>· aprox. {form.km} km</span>}</label>
            <input className="inp" type="number" placeholder={form.km||"0"} value={form.kmVuelta} onChange={e=>setForm({...form,kmVuelta:e.target.value})}/>
          </div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes (€)</label><input className="inp" type="number" placeholder="0" value={form.peaje} onChange={e=>setForm({...form,peaje:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Precio cobrado (€)</label><input className="inp" type="number" placeholder="0" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></div>
          </div>
          {tractoras.length>0&&<div className="fld"><label className="lbl">Tractora</label>
            <select className="inp sel" value={form.truckId} onChange={e=>handleTruck(e.target.value)}>
              {tractoras.map(t=><option key={t.id} value={t.id}>{t.matricula||"Sin mat."}{t.apodo?` "${t.apodo}"`:"" }</option>)}
            </select></div>}
          {semis.length>0&&<div className="fld">
            <label className="lbl">Semirremolque {conjuntoFijo&&<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· conjunto fijo</span>}</label>
            <select className="inp sel" value={form.semiId} onChange={e=>setForm({...form,semiId:e.target.value})} disabled={conjuntoFijo}>
              <option value="">Sin semirremolque</option>
              {(conjuntoFijo?availableSemis:semis).map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
            </select></div>}
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={()=>{
              if(!form.km||!form.precio)return;
              update({viajes:[...(state.viajes||[]),{...form,kmVuelta:vuelta?(form.kmVuelta||form.km):""}]});
              setForm({fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",pais:"España",km:"",kmAuto:false,kmVuelta:"",peaje:"",precio:"",truckId:defaultT?.id||"",semiId:getAutoSemi(defaultT?.id||"")});
              setVuelta(false);setModal(false);
            }}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── RESUMEN PAGE ──────────────────────────────────────────────────────────────
function ResumenPage({ state }) {
  const [filtro, setFiltro] = useState("all");
  const tractoras = state.tractoras||[];
  const semis = state.semis||[];
  const viajes = state.viajes||[];
  const gastos = state.gastos||[];

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truckId);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    return { coste:km*c.costeFijoKm+peaje, ingreso:precio };
  };

  const fViajes = filtro==="all" ? viajes : filtro.startsWith("T_") ? viajes.filter(v=>v.truckId===filtro) : viajes.filter(v=>v.semiId===filtro);
  const fGastos = filtro==="all" ? gastos : filtro.startsWith("T_") ? gastos.filter(g=>g.vehicleId===filtro) : gastos.filter(g=>g.vehicleId===filtro);

  const now = new Date();
  const months = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(),now.getMonth()-i,1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const mv = fViajes.filter(v=>v.fecha?.startsWith(key));
    const mg = fGastos.filter(g=>g.fecha?.startsWith(key));
    const ingresos = mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastoVar = mg.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const costeViajes = mv.reduce((s,v)=>s+calcV(v).coste,0);
    const beneficio = ingresos-costeViajes;
    months.push({key,label:`${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,ingresos,gastoVar,costeViajes,beneficio,numViajes:mv.length});
  }

  // Conjuntos
  const conjuntos = tractoras.map(t=>{
    const tViajes = viajes.filter(v=>v.truckId===t.id);
    const tGastos = gastos.filter(g=>g.vehicleId===t.id);
    const semiId = t.semiHabitual;
    const semi = semis.find(s=>s.id===semiId);
    const semiGastos = semiId ? gastos.filter(g=>g.vehicleId===semiId) : [];
    const ingresos = tViajes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastosT = tGastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const gastosS = semiGastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const coste = tViajes.reduce((s,v)=>s+calcV(v).coste,0);
    const beneficio = ingresos-coste;
    const totalKm = tViajes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0),0);
    return {t,semi,ingresos,gastosT,gastosS,beneficio,numViajes:tViajes.length,totalKm};
  });

  const totalIng = months.reduce((s,m)=>s+m.ingresos,0);
  const totalBen = months.reduce((s,m)=>s+m.beneficio,0);
  const maxIng = Math.max(...months.map(m=>m.ingresos),1);
  const accent = ACCENTS[state.accentIdx||0];

  return (
    <div className="page fu">
      <div className="ptitle">Resumen</div>

      <div style={{display:"flex",gap:"0.375rem",overflowX:"auto",paddingBottom:"0.25rem"}}>
        <button className={`btn bsm ${filtro==="all"?"bp":"bg"}`} onClick={()=>setFiltro("all")} style={{whiteSpace:"nowrap"}}>Toda la flota</button>
        {tractoras.map(t=>(
          <button key={t.id} className={`btn bsm ${filtro===t.id?"bp":"bg"}`} onClick={()=>setFiltro(t.id)} style={{whiteSpace:"nowrap"}}>🚛 {t.matricula||"Tractora"}</button>
        ))}
        {semis.map(s=>(
          <button key={s.id} className={`btn bsm ${filtro===s.id?"bp":"bg"}`} onClick={()=>setFiltro(s.id)} style={{whiteSpace:"nowrap"}}>🔧 {s.matricula||"Semi"}</button>
        ))}
      </div>

      <div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos 6m</div><div className="sval g">{euros(totalIng)}</div></div>
        <div className="stat"><div className="slbl">Beneficio 6m</div><div className={`sval ${totalBen>=0?"g":"r"}`}>{euros(totalBen)}</div></div>
      </div>

      <div className="card">
        <div className="chd">Ingresos por mes</div>
        <div className="mchart">
          {months.map((m,i)=>(
            <div key={i} title={`${m.label}: ${euros(m.ingresos)}`} className="mbar"
              style={{height:`${Math.max((m.ingresos/maxIng)*48,3)}px`,
                background:m.beneficio>=0?`linear-gradient(180deg,${accent.a1},${accent.a1}55)`:"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.25rem"}}>
          {months.map((m,i)=><span key={i} style={{fontSize:"0.58rem",color:"var(--muted)",flex:1,textAlign:"center"}}>{m.label}</span>)}
        </div>
      </div>

      <div className="card">
        <div className="chd">Detalle mensual</div>
        <table className="mtable">
          <thead><tr><th>Mes</th><th>Ingresos</th><th>Beneficio</th><th>Viajes</th></tr></thead>
          <tbody>
            {months.map((m,i)=>(
              <tr key={i}>
                <td>{m.label}</td>
                <td style={{color:"var(--green)",fontWeight:600}}>{euros(m.ingresos)}</td>
                <td style={{color:m.beneficio>=0?"var(--green)":"var(--red)",fontWeight:600}}>{euros(m.beneficio)}</td>
                <td style={{color:"var(--muted)"}}>{m.numViajes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtro==="all"&&conjuntos.length>0&&<div className="card">
        <div className="chd">Por conjunto</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {conjuntos.map((c,i)=>(
            <div key={i} className="conjunto-card">
              <div className="conjunto-header">
                <span>🚛 {c.t.matricula||"Sin mat."}</span>
                {c.semi&&<><span style={{color:"var(--muted)"}}>+</span><span>🔧 {c.semi.matricula}</span></>}
                {c.t.apodo&&<span style={{fontSize:"0.72rem",color:"var(--a2)"}}>"{c.t.apodo}"</span>}
              </div>
              <div className="sgrid" style={{gap:"0.375rem"}}>
                <div className="stat" style={{padding:"0.625rem"}}>
                  <div className="slbl">Ingresos</div>
                  <div className="sval g" style={{fontSize:"1.2rem"}}>{euros(c.ingresos)}</div>
                </div>
                <div className="stat" style={{padding:"0.625rem"}}>
                  <div className="slbl">Beneficio</div>
                  <div className={`sval ${c.beneficio>=0?"g":"r"}`} style={{fontSize:"1.2rem"}}>{euros(c.beneficio)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.75rem",fontSize:"0.73rem",color:"var(--muted)"}}>
                <span>{c.numViajes} viajes</span>
                <span>{c.totalKm.toLocaleString("es-ES")} km</span>
                <span>Gasto tractora: {euros(c.gastosT)}</span>
                {c.semi&&<span>Gasto semi: {euros(c.gastosS)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ── INICIO (DASHBOARD) ────────────────────────────────────────────────────────
function InicioPage({ state }) {
  const tractoras = state.tractoras||[];
  const semis = state.semis||[];
  const viajes = state.viajes||[];
  const gastos = state.gastos||[];
  const accent = ACCENTS[state.accentIdx||0];

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truckId);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    const coste = km*c.costeFijoKm+peaje;
    return { coste, ben:precio-coste, margen:precio>0?((precio-coste)/precio)*100:0 };
  };

  const totalCobrado = viajes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const totalKm = viajes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0),0);
  const beneficio = viajes.reduce((s,v)=>s+calcV(v).ben,0);
  const perdida = viajes.filter(v=>calcV(v).ben<0).length;

  // Coste km medio de todas las tractoras
  const cktMedia = tractoras.length>0 ? tractoras.reduce((s,t)=>s+calcTractora(t).costeFijoKm,0)/tractoras.length : 0;

  // Alertas de todas las tractoras y semis
  const alertas = [];
  tractoras.forEach(t=>{
    [["itv","ITV",45],["seguroVto","Seguro",30],["aceite","Aceite",15],["tarjetaTransp","Tarjeta transp.",45]].forEach(([k,l,m])=>{
      const days = alertDays(t[k]);
      const col = alertColor(days,m);
      if(col==="r"||col==="y") alertas.push({label:`${l} — ${t.matricula||"Tractora"}`,days,col,fecha:t[k]});
    });
  });
  semis.forEach(s=>{
    const days = alertDays(s.itv);
    const col = alertColor(days,45);
    if(col==="r"||col==="y") alertas.push({label:`ITV remolque — ${s.matricula||"Semi"}`,days,col,fecha:s.itv});
  });

  const chartData = viajes.slice(-8).map(v=>({lbl:v.destino||"Ruta",ben:calcV(v).ben}));
  const maxBen = Math.max(...chartData.map(d=>Math.abs(d.ben)),1);

  const cMap = {};
  viajes.forEach(v=>{
    const c=v.cliente||"Sin nombre";
    if(!cMap[c])cMap[c]={ing:0,cost:0};
    cMap[c].ing+=parseFloat(v.precio)||0;
    cMap[c].cost+=calcV(v).coste;
  });
  const clientes = Object.entries(cMap).map(([n,d])=>({n,margen:d.ing>0?((d.ing-d.cost)/d.ing)*100:0})).sort((a,b)=>b.margen-a.margen);

  const hora = new Date().getHours();
  const nombre = state.empresa||(tractoras[0]?.apodo?"");

  return (
    <div className="page fu">
      <div className="greet">
        <div className="greet-name">{hora<12?"Buenos días ☀️":hora<18?"Buenas tardes 🌤️":"Buenas noches 🌙"}{nombre?`, ${nombre.split(" ")[0]}`:""}</div>
        <div className="greet-sub">
          {tractoras.length>0?`${tractoras.length} tractora${tractoras.length>1?"s":""} · ${semis.length} semirremolque${semis.length!==1?"s":""}`:"Añade tu flota en la pestaña Flota"}
        </div>
      </div>

      {alertas.length>0&&<div className="card">
        <div className="chd">⚠️ Avisos pendientes</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
          {alertas.map((a,i)=>(
            <div key={i} className={`alert-item ${a.col}`}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <div className={`alert-dot dot-${a.col}`}/>
                <div>
                  <div style={{fontWeight:600,fontSize:"0.83rem"}}>{a.label}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{a.days<0?"Vencido hace":"Vence en"} {Math.abs(a.days)} días · {a.fecha}</div>
                </div>
              </div>
              <span className={`badge ${a.col==="r"?"bg-r":"bg-y"}`}>{a.days<0?"Vencido":`${Math.abs(a.days)}d`}</span>
            </div>
          ))}
        </div>
      </div>}

      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Ve a <strong>Flota</strong> y añade tu primera tractora para activar el dashboard.</span></div>}

      {cktMedia>0&&<div className="hcard">
        <div className="hlbl">Coste fijo medio por km</div>
        <div className="hval">{eurosKm(cktMedia)}</div>
        <div className="hsub">{tractoras.length} tractora{tractoras.length!==1?"s":""} · solo costes fijos</div>
      </div>}

      <div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos</div><div className="sval g">{euros(totalCobrado)}</div></div>
        <div className="stat"><div className="slbl">Beneficio est.</div><div className={`sval ${beneficio>=0?"g":"r"}`}>{euros(beneficio)}</div></div>
        <div className="stat"><div className="slbl">Km totales</div><div className="sval a">{totalKm.toLocaleString("es-ES")}</div></div>
        <div className="stat"><div className="slbl">Viajes</div><div className="sval">{viajes.length}</div></div>
      </div>

      {perdida>0&&<div className="alert ar"><Icon d={I.alert} size={14} color="var(--red)"/><span><strong>{perdida} viaje{perdida>1?"s":""} en pérdida.</strong> Revisa precios o costes.</span></div>}

      {chartData.length>0&&<div className="card">
        <div className="chd">Beneficio últimos viajes</div>
        <div className="mchart">
          {chartData.map((d,i)=>(
            <div key={i} title={`${d.lbl}: ${euros(d.ben)}`} className="mbar"
              style={{height:`${Math.max((Math.abs(d.ben)/maxBen)*48,3)}px`,
                background:d.ben>=0?`linear-gradient(180deg,${accent.a1},${accent.a1}55)`:"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:"1rem",marginTop:"0.375rem"}}>
          {[["var(--green)","Beneficio"],["var(--red)","Pérdida"]].map(([c,l])=>(
            <span key={l} style={{display:"flex",alignItems:"center",gap:"0.25rem",fontSize:"0.68rem",color:"var(--muted)"}}>
              <span style={{width:6,height:6,borderRadius:2,background:c,display:"inline-block"}}/>{l}
            </span>
          ))}
        </div>
      </div>}

      {clientes.length>0&&<div className="card">
        <div className="chd">Clientes</div>
        {clientes.map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.45rem 0",borderBottom:i<clientes.length-1?"1px solid var(--border)":"none"}}>
            <span style={{fontSize:"0.85rem"}}>{i===0?"🏆 ":i===clientes.length-1&&clientes.length>1?"⚠️ ":""}{c.n}</span>
            <span className={`badge ${c.margen>=15?"bg-g":c.margen>=0?"bg-y":"bg-r"}`}>{pct(c.margen)}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(load);
  const [tab, setTab] = useState("inicio");
  useEffect(()=>{save(state);},[state]);
  const update = useCallback(patch=>setState(s=>({...s,...patch})),[]);
  const accent = ACCENTS[state.accentIdx||0];

  if (!state.onboarded) return (
    <><style>{makeCSS(accent)}</style>
    <div className="app"><Onboarding onComplete={()=>update({onboarded:true,trialStart:new Date().toISOString()})}/></div></>
  );

  const days = getDaysLeft(state.trialStart);
  const tractoras = state.tractoras||[];
  const empresa = state.empresa||"KmRentable";
  const tabs = [
    {id:"inicio",lbl:"Inicio",icon:I.dash},
    {id:"flota",lbl:"Flota",icon:I.truck},
    {id:"gastos",lbl:"Gastos",icon:I.coin},
    {id:"viajes",lbl:"Viajes",icon:I.trend},
    {id:"resumen",lbl:"Resumen",icon:I.chart},
  ];

  return (
    <><style>{makeCSS(accent)}</style>
    <div className="app">
      <div className="hdr">
        <div className="hdr-left">
          {state.logo?<img src={state.logo} alt="" className="hdr-logo"/>:<div className="hdr-logo-ph">{empresa.charAt(0).toUpperCase()}</div>}
          <div>
            <div className="hdr-brand">{empresa}</div>
            <div className="hdr-sub">{tractoras.length>0?`${tractoras.length} tractora${tractoras.length!==1?"s":""}`:""}</div>
          </div>
        </div>
        <div className="trial-chip">
          <Icon d={I.clock} size={10} color="var(--muted)"/>
          <span className="chip-d">{days}d</span>
          <span>gratis</span>
        </div>
      </div>

      {tab==="inicio"  &&<InicioPage state={state}/>}
      {tab==="flota"   &&<FlotaPage state={state} update={update}/>}
      {tab==="gastos"  &&<GastosPage state={state} update={update}/>}
      {tab==="viajes"  &&<ViajesPage state={state} update={update}/>}
      {tab==="resumen" &&<ResumenPage state={state}/>}

      <nav className="nav">
        {tabs.map(t=>(
          <button key={t.id} className={`nb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
            <Icon d={t.icon} size={17}/>{t.lbl}
          </button>
        ))}
      </nav>
    </div></>
  );
}
