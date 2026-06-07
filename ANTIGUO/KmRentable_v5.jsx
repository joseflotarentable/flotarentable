import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ktfrzckzxnqsqfvglwfh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnJ6Y2t6eG5xc3Fmdmdsd2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY0MTQsImV4cCI6MjA5MTQxMjQxNH0.3O4ZZ53Ww6s5hLXiaPBFlpswTkYWKSS5BRMTjWt-A34";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ACCENTS = [
  { name:"Rojo",    a1:"#FF3D5A", a2:"#FF7A3D" },
  { name:"Azul",    a1:"#4B8EFF", a2:"#6B5FFF" },
  { name:"Verde",   a1:"#06D6A0", a2:"#00B4D8" },
  { name:"Naranja", a1:"#FF8C42", a2:"#FFD166" },
  { name:"Morado",  a1:"#9B5DE5", a2:"#F15BB5" },
];

const TIPOS_TRACTORA = ["Tractora","Rígido"];
const TIPOS_SEMI = ["Tautliner","Frigorífico","Cisterna","Góndola","Portacoches","Lona","Otros"];
const PAISES = ["España","Francia","Alemania","Italia","Portugal","Reino Unido","Bélgica","Holanda","Polonia","Chequia","Austria","Suiza","Luxemburgo","Otro"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

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
  clock:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bell:   "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  camera: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z",
  chart:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  back:   "M19 12H5M12 5l-7 7 7 7",
  edit:   "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  link:   "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  user:   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  eye:    "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  eyeoff: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  pdf:    "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
};

const euros = n => isNaN(n)||n==null ? "—" : new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const eurosKm = n => isNaN(n)||n==null||!isFinite(n) ? "—" : `${Number(n).toFixed(3).replace(".",",")} €/km`;
const pct = n => isNaN(n)||!isFinite(n) ? "—" : `${Math.round(n)}%`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}) : "";

function calcTractora(t) {
  const km = parseFloat(t.km_mensuales)||0;
  const seguroMes = (parseFloat(t.seguro_anual)||0) / 12;
  const itvMes = (parseFloat(t.itv_coste)||0) / 12;
  const impMes = (parseFloat(t.impuestos_anual)||0) / 12;
  const fijos = (parseFloat(t.autonomo)||0) + (parseFloat(t.leasing)||0) +
    (parseFloat(t.gestoria)||0) + (parseFloat(t.parking)||0) +
    seguroMes + itvMes + impMes;
  return { fijos, costeFijoKm: km>0 ? fijos/km : 0, km };
}

function alertDays(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr) - Date.now()) / 86400000);
}
function alertColor(days, margin) {
  if (days === null) return null;
  if (days < 0) return "r";
  if (days <= 7) return "r";
  if (days <= margin) return "y";
  return "g";
}
function getDaysLeft(t) {
  if (!t) return 7;
  return Math.max(0, 7 - Math.floor((Date.now() - new Date(t)) / 86400000));
}

const CITIES = {
  "madrid":[40.4168,-3.7038],"barcelona":[41.3851,2.1734],"valencia":[39.4699,-0.3763],
  "sevilla":[37.3891,-5.9845],"zaragoza":[41.6488,-0.8891],"malaga":[36.7213,-4.4214],
  "granada":[37.1773,-3.5986],"bilbao":[43.2630,-2.9350],"alicante":[38.3452,-0.4810],
  "valladolid":[41.6523,-4.7245],"cordoba":[37.8882,-4.7794],"vigo":[42.2314,-8.7124],
  "gijon":[43.5453,-5.6615],"vitoria":[42.8467,-2.6726],"coruña":[43.3623,-8.4115],
  "pamplona":[42.8125,-1.6458],"santander":[43.4623,-3.8099],"almeria":[36.8340,-2.4637],
  "burgos":[42.3440,-3.6970],"salamanca":[40.9701,-5.6635],"huelva":[37.2614,-6.9447],
  "badajoz":[38.8794,-6.9706],"cadiz":[36.5271,-6.2886],"tarragona":[41.1189,1.2445],
  "lleida":[41.6175,0.6200],"albacete":[38.9942,-1.8564],"jaen":[37.7796,-3.7849],
  "toledo":[39.8628,-4.0273],"caceres":[39.4753,-6.3723],"leon":[42.5987,-5.5671],
  "oviedo":[43.3614,-5.8497],"lugo":[43.0097,-7.5567],"ourense":[42.3364,-7.8641],
  "pontevedra":[42.4338,-8.6444],"huesca":[42.1401,-0.4089],"gerona":[41.9794,2.8214],
  "castellon":[39.9864,-0.0513],"irun":[43.3378,-1.7886],"algeciras":[36.1274,-5.4536],
  "cartagena":[37.6257,-0.9966],"murcia":[37.9922,-1.1307],
  "paris":[48.8566,2.3522],"lyon":[45.7640,4.8357],"marsella":[43.2965,5.3698],
  "toulouse":[43.6047,1.4442],"burdeos":[44.8378,-0.5792],"nantes":[47.2184,-1.5536],
  "lille":[50.6292,3.0573],"estrasburgo":[48.5734,7.7521],"calais":[50.9513,1.8587],
  "frankfurt":[50.1109,8.6821],"munich":[48.1351,11.5820],"berlin":[52.5200,13.4050],
  "hamburgo":[53.5753,10.0153],"colonia":[50.9333,6.9500],"stuttgart":[48.7758,9.1829],
  "dusseldorf":[51.2217,6.7762],"bremen":[53.0793,8.8017],"hannover":[52.3759,9.7320],
  "milan":[45.4654,9.1859],"roma":[41.9028,12.4964],"turin":[45.0703,7.6869],
  "napoles":[40.8518,14.2681],"bologna":[44.4949,11.3426],"florencia":[43.7696,11.2558],
  "venecia":[45.4408,12.3155],"genova":[44.4056,8.9463],
  "lisboa":[38.7223,-9.1393],"oporto":[41.1579,-8.6291],"faro":[37.0194,-7.9322],
  "braga":[41.5454,-8.4265],"coimbra":[40.2033,-8.4103],
  "londres":[51.5074,-0.1278],"birmingham":[52.4862,-1.8904],"manchester":[53.4808,-2.2426],
  "glasgow":[55.8642,-4.2518],"liverpool":[53.4084,-2.9916],"bristol":[51.4545,-2.5879],
  "bruselas":[50.8503,4.3517],"amberes":[51.2194,4.4025],"lieja":[50.6292,5.5797],
  "amsterdam":[52.3676,4.9041],"rotterdam":[51.9225,4.4792],"utrecht":[52.0907,5.1214],
  "varsovia":[52.2297,21.0122],"cracovia":[50.0647,19.9450],"gdansk":[54.3520,18.6466],
  "praga":[50.0755,14.4378],"brno":[49.1951,16.6068],
  "viena":[48.2082,16.3738],"salzburgo":[47.8095,13.0550],"graz":[47.0707,15.4395],
  "ginebra":[46.2044,6.1432],"zurich":[47.3769,8.5417],"basilea":[47.5596,7.5886],
  "luxemburgo":[49.6117,6.1319],
};

function calcKm(o, d) {
  const a = CITIES[o?.toLowerCase().trim()];
  const b = CITIES[d?.toLowerCase().trim()];
  if (!a||!b) return null;
  const R=6371, dLat=(b[0]-a[0])*Math.PI/180, dLon=(b[1]-a[1])*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))*1.25);
}

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
.btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;border:none;border-radius:var(--r2);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.875rem;transition:all 0.15s;padding:0.875rem 1.5rem;width:100%;letter-spacing:0.01em}
.bp{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff;box-shadow:0 6px 20px ${accent.a1}28}
.bp:hover{transform:translateY(-1px)}
.bg{background:var(--s2);color:var(--text);border:1px solid var(--border2)}
.bg:hover{border-color:var(--border3)}
.bsm{padding:0.4rem 0.875rem;font-size:0.78rem;border-radius:8px;width:auto}
.bd{background:#FF3D5A10;color:var(--red);border:1px solid #FF3D5A20}
.page{flex:1;overflow-y:auto;padding:1.125rem;display:flex;flex-direction:column;gap:0.875rem;padding-bottom:5rem}
.ptitle{font-family:'Bebas Neue',sans-serif;font-size:1.75rem;letter-spacing:0.04em}
.card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:1.125rem}
.chd{font-size:0.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.875rem}
.fld{display:flex;flex-direction:column;gap:0.325rem}
.lbl{font-size:0.73rem;color:var(--muted);font-weight:600}
.inp{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9rem;padding:0.7rem 0.9rem;width:100%;outline:none;transition:border-color 0.2s}
.inp:focus{border-color:var(--a1)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2368687A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.875rem center;padding-right:2.25rem}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--s2);border:1px solid var(--border2);border-radius:10px;padding:0.625rem 0.875rem}
.toggle-lbl{font-size:0.875rem;font-weight:500}
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
.greet-name{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:0.04em;line-height:1.1}
.greet-sub{font-size:0.83rem;color:var(--muted);margin-top:0.25rem}
.trip{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.45rem}
.ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem}
.troute{font-weight:700;font-size:0.875rem}
.tdate{font-size:0.68rem;color:var(--muted);margin-top:2px}
.trow{display:flex;gap:0.75rem;font-size:0.73rem;color:var(--muted);flex-wrap:wrap}
.tfoot{display:flex;justify-content:space-between;align-items:center;padding-top:0.45rem;border-top:1px solid var(--border)}
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
.vcard:hover{border-color:var(--border3)}
.vcard-foto{width:42px;height:42px;border-radius:10px;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);overflow:hidden}
.vcard-mat{font-weight:700;font-size:0.875rem}
.vcard-tipo{font-size:0.7rem;color:var(--muted);margin-top:1px}
.vcard-apodo{font-size:0.7rem;color:var(--a2);margin-top:1px;font-weight:600}
.mchart{display:flex;align-items:flex-end;gap:3px;height:52px}
.mbar{flex:1;border-radius:4px 4px 0 0;min-width:5px}
.mtable{width:100%;border-collapse:collapse;font-size:0.78rem}
.mtable th{text-align:left;padding:0.35rem 0.5rem;color:var(--muted);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border)}
.mtable td{padding:0.45rem 0.5rem;border-bottom:1px solid var(--border)}
.mtable tr:last-child td{border-bottom:none}
.photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:var(--s2);border:1.5px dashed var(--border2);border-radius:var(--r2);padding:1rem;cursor:pointer;transition:border-color 0.2s;width:100%}
.photo-btn:hover{border-color:var(--a1)}
.accent-grid{display:flex;gap:0.625rem}
.accent-dot{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s}
.accent-dot.sel{border-color:#fff;transform:scale(1.15)}
.empty{display:flex;flex-direction:column;align-items:center;gap:0.875rem;padding:2rem 1rem;color:var(--muted);text-align:center}
.ei{width:46px;height:46px;border-radius:14px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.hdr{padding:0.75rem 1.125rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(15,15,26,0.92);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}
.hdr-left{display:flex;align-items:center;gap:0.75rem}
.hdr-logo{width:34px;height:34px;border-radius:10px;object-fit:cover}
.hdr-logo-ph{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#fff}
.hdr-brand{font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:0.07em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.hdr-sub{font-size:0.62rem;color:var(--muted);margin-top:1px}
.trial-chip{display:flex;align-items:center;gap:0.375rem;background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.275rem 0.7rem;font-size:0.7rem;color:var(--muted)}
.chip-d{color:var(--a2);font-weight:700;font-size:0.78rem}
.nav{display:grid;grid-template-columns:repeat(5,1fr);background:rgba(15,15,26,0.95);border-top:1px solid var(--border);position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:20;backdrop-filter:blur(16px)}
.nb{display:flex;flex-direction:column;align-items:center;gap:0.18rem;padding:0.625rem 0 0.5rem;border:none;background:none;color:var(--muted2);cursor:pointer;font-size:0.55rem;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;letter-spacing:0.03em;transition:color 0.15s;position:relative}
.nb.on{color:var(--a1)}
.nb.on::after{content:'';position:absolute;top:0;inset-x:20%;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2});border-radius:0 0 3px 3px}
.bwrap{display:flex;flex-direction:column;gap:0.625rem}
.brow{display:flex;flex-direction:column;gap:0.3rem}
.bmeta{display:flex;justify-content:space-between;font-size:0.78rem}
.btrack{height:5px;background:var(--s3);border-radius:999px;overflow:hidden}
.bfill{height:100%;border-radius:999px}
.tab-row{display:flex;gap:0.375rem;margin-bottom:0.25rem}
.tab-btn{flex:1;padding:0.45rem;font-size:0.75rem;border-radius:8px;border:1px solid var(--border2);background:var(--s2);color:var(--muted);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;transition:all 0.15s;text-align:center}
.tab-btn.on{background:var(--a1);color:#fff;border-color:var(--a1)}
.nota-anual{font-size:0.7rem;color:var(--a2);margin-top:0.25rem}

/* AUTH */
.auth-wrap{flex:1;display:flex;flex-direction:column;overflow-y:auto}
.auth-hero{position:relative;padding:3rem 1.75rem 2rem;text-align:center;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:1.25rem}
.auth-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:300px;height:300px;background:radial-gradient(circle,${accent.a1}18,transparent 65%);pointer-events:none}
.auth-logo{position:relative;z-index:1;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px ${accent.a1}35}
.auth-wordmark{position:relative;z-index:1;font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.06em;line-height:1;background:linear-gradient(160deg,#fff 0%,#FFD166 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.auth-sub{position:relative;z-index:1;font-size:0.9rem;color:var(--muted);line-height:1.65;max-width:270px}
.auth-body{padding:0 1.5rem 1.5rem;display:flex;flex-direction:column;gap:1rem}
.step-dots{display:flex;gap:0.5rem;justify-content:center;margin-bottom:0.5rem}
.step-dot{width:8px;height:8px;border-radius:50%;background:var(--s3);transition:all 0.2s}
.step-dot.on{background:var(--a1);width:24px;border-radius:4px}
.pass-wrap{position:relative}
.pass-eye{position:absolute;right:0.875rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);padding:0}
.role-card{display:flex;align-items:center;gap:0.875rem;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem;cursor:pointer;transition:border-color 0.2s}
.role-card.sel{border-color:var(--a1)}
.role-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.25s ease both}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.5rem 1.25rem;font-size:0.83rem;color:var(--text);z-index:100;white-space:nowrap;animation:fu 0.2s ease}
.semi-tag{display:inline-flex;align-items:center;gap:0.25rem;background:var(--s3);border:1px solid var(--border2);border-radius:6px;padding:0.2rem 0.5rem;font-size:0.68rem;color:var(--muted)}
.conjunto-card{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem;display:flex;flex-direction:column;gap:0.5rem}
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

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return ()=>clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}

// ── AI SCANNER ────────────────────────────────────────────────────────────────
async function scanTicket(base64Image) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:500,
        messages:[{
          role:"user",
          content:[
            { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:base64Image }},
            { type:"text", text:`Analiza este ticket/factura de transporte. Responde SOLO con JSON válido sin markdown:
{"tipo":"Combustible|Peaje|Mantenimiento|ITV|Otros","importe":0.00,"litros":0,"preciolitro":0.00,"fecha":"YYYY-MM-DD","nota":"descripción breve"}
Si no puedes leer un campo ponlo en null. La fecha de hoy es ${new Date().toISOString().slice(0,10)}.`}
          ]
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text||"";
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ── AUTH PAGES ────────────────────────────────────────────────────────────────
function AuthPage({ onAuth, accent }) {
  const [mode, setMode] = useState("welcome"); // welcome | register | login
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    nombre:"", empresa:"", email:"", telefono:"", rol:"gerente",
    numVehiculos:"1", password:"", confirmPass:""
  });

  const feats = [
    { icon:I.trend, col:"#FF3D5A", bg:"#FF3D5A15", t:"Rentabilidad real por km", s:"Fijos + variables calculados" },
    { icon:I.truck, col:"#06D6A0", bg:"#06D6A015", t:"Gestión de flota completa", s:"Tractoras, semis y conjuntos" },
    { icon:I.bell,  col:"#FFD166", bg:"#FFD16615", t:"Alertas de vencimientos",   s:"ITV, seguro, aceite y más" },
    { icon:I.camera,col:"#FF7A3D", bg:"#FF7A3D15", t:"Escaneo de tickets con IA", s:"Foto al ticket y listo" },
  ];

  const handleRegister = async () => {
    if (step === 1) {
      if (!form.nombre || !form.email) { setErr("Nombre y email son obligatorios"); return; }
      setErr(""); setStep(2); return;
    }
    if (step === 2) {
      setErr(""); setStep(3); return;
    }
    if (step === 3) {
      if (!form.password) { setErr("Introduce una contraseña"); return; }
      if (form.password !== form.confirmPass) { setErr("Las contraseñas no coinciden"); return; }
      if (form.password.length < 6) { setErr("Mínimo 6 caracteres"); return; }
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { nombre: form.nombre, empresa: form.empresa, telefono: form.telefono, rol: form.rol, num_vehiculos: form.numVehiculos }}
        });
        if (error) { setErr(error.message); setLoading(false); return; }
        await supabase.from("perfiles").upsert({
          id: data.user.id,
          nombre: form.nombre,
          empresa: form.empresa,
          email: form.email,
          telefono: form.telefono,
          rol: form.rol,
          accent_idx: 0,
          trial_start: new Date().toISOString(),
        });
        onAuth(data.user, { nombre:form.nombre, empresa:form.empresa, rol:form.rol, accent_idx:0, trial_start:new Date().toISOString() });
      } catch(e) { setErr(e.message); }
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setErr("Email y contraseña obligatorios"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
    if (error) { setErr("Email o contraseña incorrectos"); setLoading(false); return; }
    const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", data.user.id).single();
    onAuth(data.user, perfil||{});
    setLoading(false);
  };

  if (mode === "welcome") return (
    <div className="auth-wrap fu">
      <div className="auth-hero">
        <div className="auth-glow"/>
        <div className="auth-logo"><Icon d={I.truck} size={34} color="#fff"/></div>
        <div>
          <div className="auth-wordmark">Km<br/>Rentable</div>
          <p className="auth-sub">Tu negocio de transporte en el bolsillo.</p>
        </div>
      </div>
      <div style={{padding:"0 1.5rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {feats.map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"0.875rem",background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.875rem 1rem"}}>
            <div style={{width:34,height:34,borderRadius:10,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={f.icon} size={16} color={f.col}/></div>
            <div><div style={{fontSize:"0.875rem",fontWeight:600}}>{f.t}</div><div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:1}}>{f.s}</div></div>
          </div>
        ))}
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

  if (mode === "login") return (
    <div className="auth-wrap fu">
      <div className="auth-body" style={{paddingTop:"3rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>setMode("welcome")}><Icon d={I.back} size={14}/> Volver</button>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"2rem",letterSpacing:"0.04em"}}>Iniciar sesión</div>
        <div className="fld"><label className="lbl">Email</label><input className="inp" type="email" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="fld"><label className="lbl">Contraseña</label>
          <div className="pass-wrap">
            <input className="inp" type={showPass?"text":"password"} placeholder="••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            <button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button>
          </div></div>
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleLogin} disabled={loading}>{loading?<span className="spinner"/>:"Entrar"}</button>
      </div>
    </div>
  );

  // Register steps
  return (
    <div className="auth-wrap fu">
      <div className="auth-body" style={{paddingTop:"3rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>step>1?setStep(step-1):setMode("welcome")}><Icon d={I.back} size={14}/> {step>1?"Atrás":"Volver"}</button>
        <div className="step-dots">{[1,2,3].map(n=><div key={n} className={`step-dot ${step===n?"on":""}`}/>)}</div>

        {step===1&&<>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tus datos</div>
          <div className="fld"><label className="lbl">Nombre *</label><input className="inp" placeholder="Juan García" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Empresa (opcional)</label><input className="inp" placeholder="Transportes García S.L." value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Email *</label><input className="inp" type="email" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Teléfono</label><input className="inp" type="tel" placeholder="600 000 000" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div>
        </>}

        {step===2&&<>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tu negocio</div>
          <p style={{fontSize:"0.83rem",color:"var(--muted)"}}>¿Cuál es tu rol en la empresa?</p>
          {[["gerente","👔 Gerente / Propietario","Acceso completo a datos y configuración"],["chofer","🚛 Chófer","Solo viajes y gastos propios"]].map(([rol,title,sub])=>(
            <div key={rol} className={`role-card ${form.rol===rol?"sel":""}`} onClick={()=>setForm({...form,rol})}>
              <div className="role-icon" style={{background:form.rol===rol?`${accent.a1}20`:"var(--s3)"}}><Icon d={rol==="gerente"?I.user:I.truck} size={20} color={form.rol===rol?accent.a1:"var(--muted)"}/></div>
              <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>{title}</div><div style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:2}}>{sub}</div></div>
            </div>
          ))}
          <div className="fld"><label className="lbl">Número aproximado de vehículos</label>
            <select className="inp sel" value={form.numVehiculos} onChange={e=>setForm({...form,numVehiculos:e.target.value})}>
              <option value="1">1 vehículo</option>
              <option value="2-3">2-3 vehículos</option>
              <option value="4-10">4-10 vehículos</option>
              <option value="10+">Más de 10</option>
            </select></div>
        </>}

        {step===3&&<>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Contraseña</div>
          <div style={{background:`${accent.a1}12`,border:`1px solid ${accent.a1}30`,borderRadius:"var(--r2)",padding:"0.875rem",fontSize:"0.82rem"}}>
            🎁 <strong>7 días gratis</strong> — No se requiere tarjeta para empezar
          </div>
          <div className="fld"><label className="lbl">Contraseña</label>
            <div className="pass-wrap">
              <input className="inp" type={showPass?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
              <button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button>
            </div></div>
          <div className="fld"><label className="lbl">Confirmar contraseña</label>
            <input className="inp" type="password" placeholder="Repite la contraseña" value={form.confirmPass} onChange={e=>setForm({...form,confirmPass:e.target.value})}/></div>
          <p style={{fontSize:"0.73rem",color:"var(--muted)"}}>Al registrarte aceptas los términos de uso. Después de los 7 días gratuitos podrás suscribirte desde 14,99€/mes.</p>
        </>}

        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleRegister} disabled={loading}>
          {loading?<span className="spinner"/>:step<3?"Continuar →":"Crear cuenta gratis"}
        </button>
        {step===1&&<p style={{textAlign:"center",fontSize:"0.73rem",color:"var(--muted)"}}>¿Ya tienes cuenta? <span style={{color:"var(--a1)",cursor:"pointer"}} onClick={()=>setMode("login")}>Inicia sesión</span></p>}
      </div>
    </div>
  );
}

// ── FLOTA PAGE ────────────────────────────────────────────────────────────────
function FlotaPage({ userId, perfil, update }) {
  const [tab, setTab] = useState("flota");
  const [tractoras, setTractoras] = useState([]);
  const [semis, setSemis] = useState([]);
  const [editT, setEditT] = useState(null);
  const [editS, setEditS] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("tractoras").select("*").eq("user_id",userId),
      supabase.from("semirremolques").select("*").eq("user_id",userId),
    ]).then(([{data:t},{data:s}]) => {
      setTractoras(t||[]);
      setSemis(s||[]);
      setLoading(false);
    });
  }, []);

  const saveTractora = async (t) => {
    const payload = {...t, user_id:userId};
    if (t.id) { await supabase.from("tractoras").update(payload).eq("id",t.id); }
    else { const {data} = await supabase.from("tractoras").insert({...payload,id:undefined}).select().single(); t = data; }
    const {data} = await supabase.from("tractoras").select("*").eq("user_id",userId);
    setTractoras(data||[]); setEditT(null);
  };
  const deleteTractora = async (id) => {
    await supabase.from("tractoras").delete().eq("id",id);
    setTractoras(tractoras.filter(x=>x.id!==id));
  };
  const saveSemi = async (s) => {
    const payload = {...s, user_id:userId};
    if (s.id) { await supabase.from("semirremolques").update(payload).eq("id",s.id); }
    else { const {data} = await supabase.from("semirremolques").insert({...payload,id:undefined}).select().single(); s = data; }
    const {data} = await supabase.from("semirremolques").select("*").eq("user_id",userId);
    setSemis(data||[]); setEditS(null);
  };
  const deleteSemi = async (id) => {
    await supabase.from("semirremolques").delete().eq("id",id);
    setSemis(semis.filter(x=>x.id!==id));
  };

  const saveAjustes = async (patch) => {
    await supabase.from("perfiles").update(patch).eq("id",userId);
    update(patch);
  };

  if (editT) return <TruckForm t={editT} semis={semis} onSave={saveTractora} onCancel={()=>setEditT(null)}/>;
  if (editS) return <SemiForm s={editS} onSave={saveSemi} onCancel={()=>setEditS(null)}/>;

  return (
    <div className="page fu">
      <div className="ptitle">Flota</div>
      <div className="tab-row">
        {[["flota","Mi flota"],["ajustes","Ajustes"]].map(([id,lbl])=>(
          <div key={id} className={`tab-btn ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</div>
        ))}
      </div>

      {tab==="flota"&&<>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🚛 Tractoras</span>
            <button className="btn bg bsm" onClick={()=>setEditT({subtipo:"Tractora",conjunto_fijo:false})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {loading&&<p style={{color:"var(--muted)",fontSize:"0.83rem"}}>Cargando...</p>}
          {!loading&&tractoras.length===0&&<div className="empty" style={{padding:"1.25rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin tractoras — añade la primera</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {tractoras.map(t=>{
              const semi = semis.find(s=>s.id===t.semi_habitual_id);
              return (
                <div key={t.id} className="vcard" onClick={()=>setEditT(t)}>
                  <div className="vcard-foto">{t.foto?<img src={t.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="var(--muted)"/>}</div>
                  <div style={{flex:1}}>
                    <div className="vcard-mat">{t.matricula||"Sin matrícula"}</div>
                    <div className="vcard-tipo">{t.subtipo||"Tractora"}</div>
                    {t.apodo&&<div className="vcard-apodo">"{t.apodo}"</div>}
                    {semi&&<div className="semi-tag" style={{marginTop:3}}><Icon d={I.link} size={10}/>{semi.matricula}{t.conjunto_fijo?" · fijo":""}</div>}
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
            <button className="btn bg bsm" onClick={()=>setEditS({subtipo:"Tautliner"})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {!loading&&semis.length===0&&<div className="empty" style={{padding:"1.25rem"}}><div className="ei"><Icon d={I.gear} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin semirremolques registrados</span></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {semis.map(s=>(
              <div key={s.id} className="vcard" onClick={()=>setEditS(s)}>
                <div className="vcard-foto">{s.foto?<img src={s.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.gear} size={18} color="var(--muted)"/>}</div>
                <div style={{flex:1}}>
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

      {tab==="ajustes"&&<>
        <div className="card">
          <div className="chd">Tu empresa</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            <div className="fld"><label className="lbl">Nombre / Empresa</label>
              <input className="inp" type="text" value={perfil.empresa||""} placeholder="Transportes García S.L."
                onChange={e=>saveAjustes({empresa:e.target.value})}/></div>
            <PhotoUpload value={perfil.logo} onChange={v=>saveAjustes({logo:v})} label="Logo de empresa" height={90}/>
          </div>
        </div>
        <div className="card">
          <div className="chd">Color de la app</div>
          <div className="accent-grid">
            {ACCENTS.map((a,i)=>(
              <div key={i} className={`accent-dot ${(perfil.accent_idx||0)===i?"sel":""}`}
                style={{background:`linear-gradient(135deg,${a.a1},${a.a2})`}}
                onClick={()=>saveAjustes({accent_idx:i})}/>
            ))}
          </div>
        </div>
      </>}
    </div>
  );
}

function TruckForm({ t, semis, onSave, onCancel }) {
  const [form, setForm] = useState(t||{subtipo:"Tractora",conjunto_fijo:false});
  const calc = calcTractora(form);
  const f = (k,ph="0") => <input className="inp" type="number" value={form[k]||""} placeholder={ph} onChange={e=>setForm({...form,[k]:e.target.value})}/>;

  return (
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button>
        <div className="ptitle">{form.matricula||"Nueva tractora"}</div>
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={form.matricula||""} placeholder="1234 ABC" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="El Titán" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label>
            <select className="inp sel" value={form.subtipo||"Tractora"} onChange={e=>setForm({...form,subtipo:e.target.value})}>
              {TIPOS_TRACTORA.map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="fld"><label className="lbl">Km/mes estimados</label>{f("km_mensuales")}</div>
        </div>
      </div>

      {semis.length>0&&<div className="card">
        <div className="chd">Conjunto</div>
        <div className="fld" style={{marginBottom:"0.625rem"}}>
          <label className="lbl">Semirremolque habitual</label>
          <select className="inp sel" value={form.semi_habitual_id||""} onChange={e=>setForm({...form,semi_habitual_id:e.target.value})}>
            <option value="">Sin semirremolque fijo</option>
            {semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
          </select>
        </div>
        {form.semi_habitual_id&&<div className="toggle-row">
          <span className="toggle-lbl">Siempre va el mismo conjunto</span>
          <button className={`toggle ${form.conjunto_fijo?"on":""}`} onClick={()=>setForm({...form,conjunto_fijo:!form.conjunto_fijo})}/>
        </div>}
      </div>}

      <div className="card">
        <div className="chd">Costes fijos mensuales</div>
        <div className="g2">
          <div className="fld"><label className="lbl">Autónomo / Nóminas</label>{f("autonomo")}</div>
          <div className="fld"><label className="lbl">Leasing / Renting</label>{f("leasing")}</div>
          <div className="fld"><label className="lbl">Gestoría</label>{f("gestoria")}</div>
          <div className="fld"><label className="lbl">Parking / Base</label>{f("parking")}</div>
        </div>
        <div style={{marginTop:"0.875rem"}}>
          <div className="chd" style={{marginBottom:"0.5rem"}}>Costes anuales (se prorratean en 12 meses)</div>
          <div className="g2">
            <div className="fld"><label className="lbl">Seguro anual (€)</label>{f("seguro_anual")}<span className="nota-anual">{form.seguro_anual?`→ ${euros((parseFloat(form.seguro_anual)||0)/12)}/mes`:""}</span></div>
            <div className="fld"><label className="lbl">Impuestos anuales (€) *</label>{f("impuestos_anual")}<span className="nota-anual">{form.impuestos_anual?`→ ${euros((parseFloat(form.impuestos_anual)||0)/12)}/mes`:""}</span></div>
            <div className="fld"><label className="lbl">Coste ITV (€)</label>{f("itv_coste")}<span className="nota-anual">{form.itv_coste?`→ ${euros((parseFloat(form.itv_coste)||0)/12)}/mes`:""}</span></div>
          </div>
          <p style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:"0.5rem"}}>* Consulta con tu gestor según tu régimen fiscal</p>
        </div>
      </div>

      <div className="card">
        <div className="chd">Alertas de mantenimiento</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {[["fecha_itv","📋 Próxima ITV",45],["fecha_seguro_vto","🛡️ Vencimiento seguro",30],["fecha_aceite","🔧 Próximo cambio aceite",15],["fecha_tarjeta","📄 Tarjeta de transporte",45]].map(([k,l])=>(
            <div className="fld" key={k}><label className="lbl">{l}</label>
              <input className="inp" type="date" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
        </div>
      </div>

      {calc.fijos>0&&<div className="hcard">
        <div className="hlbl">Coste fijo por km</div>
        <div className="hval">{eurosKm(calc.costeFijoKm)}</div>
        <div className="hsub">Total mensual fijo: {euros(calc.fijos)}</div>
      </div>}

      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button>
        <button className="btn bp" style={{flex:2}} onClick={()=>onSave(form)}>Guardar</button>
      </div>
    </div>
  );
}

function SemiForm({ s, onSave, onCancel }) {
  const [form, setForm] = useState(s||{subtipo:"Tautliner"});
  return (
    <div className="page fu">
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button>
        <div className="ptitle">{form.matricula||"Nuevo semirremolque"}</div>
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula</label><input className="inp" type="text" value={form.matricula||""} placeholder="R-1234" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="opcional" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label>
            <select className="inp sel" value={form.subtipo||"Tautliner"} onChange={e=>setForm({...form,subtipo:e.target.value})}>
              {TIPOS_SEMI.map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="fld"><label className="lbl">Seguro anual (€)</label>
            <input className="inp" type="number" value={form.seguro_anual||""} placeholder="0" onChange={e=>setForm({...form,seguro_anual:e.target.value})}/></div>
        </div>
      </div>
      <div className="card">
        <div className="chd">Alertas</div>
        <div className="fld"><label className="lbl">📋 Próxima ITV remolque</label>
          <input className="inp" type="date" value={form.fecha_itv||""} onChange={e=>setForm({...form,fecha_itv:e.target.value})}/></div>
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button>
        <button className="btn bp" style={{flex:2}} onClick={()=>onSave(form)}>Guardar</button>
      </div>
    </div>
  );
}

// ── GASTOS PAGE ───────────────────────────────────────────────────────────────
function GastosPage({ userId, tractoras, semis, esGerente }) {
  const [gastos, setGastos] = useState([]);
  const [modal, setModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState("");
  const scanRef = useRef();
  const tipos = ["Combustible","Peaje","Mantenimiento","Neumáticos","Avería","ITV","Lavado","Seguro","Otros"];
  const [form, setForm] = useState({ fecha:new Date().toISOString().slice(0,10), tipo:"Combustible", importe:"", litros:"", precio_litro:"", pais:"España", vehicle_id:tractoras[0]?.id||"", vehicle_tipo:"tractora", nota:"" });

  useEffect(()=>{
    supabase.from("gastos").select("*").eq("user_id",userId).order("fecha",{ascending:false})
      .then(({data})=>setGastos(data||[]));
  },[]);

  const handleScan = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target.result.split(",")[1];
      const result = await scanTicket(base64);
      if (result) {
        setForm(f=>({...f,
          tipo: result.tipo||f.tipo,
          importe: result.importe?.toString()||f.importe,
          litros: result.litros?.toString()||f.litros,
          precio_litro: result.preciolitro?.toString()||f.precio_litro,
          fecha: result.fecha||f.fecha,
          nota: result.nota||f.nota,
        }));
        setModal(true);
        setToast("✅ Ticket escaneado correctamente");
      } else {
        setToast("⚠️ No se pudo leer el ticket");
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLitros = (litros, precio) => {
    const imp = (parseFloat(litros)||0)*(parseFloat(precio)||0);
    setForm(f=>({...f,litros,precio_litro:precio,importe:imp>0?imp.toFixed(2):""}));
  };

  const addGasto = async () => {
    if (!form.importe) return;
    const {data} = await supabase.from("gastos").insert({...form,user_id:userId}).select().single();
    setGastos([data,...gastos]);
    setForm({fecha:new Date().toISOString().slice(0,10),tipo:"Combustible",importe:"",litros:"",precio_litro:"",pais:"España",vehicle_id:tractoras[0]?.id||"",vehicle_tipo:"tractora",nota:""});
    setModal(false);
    setToast("✅ Gasto guardado");
  };

  const deleteGasto = async (id) => {
    await supabase.from("gastos").delete().eq("id",id);
    setGastos(gastos.filter(g=>g.id!==id));
  };

  const total = gastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const byTipo = tipos.map(t=>({t,v:gastos.filter(g=>g.tipo===t).reduce((s,g)=>s+(parseFloat(g.importe)||0),0)})).filter(x=>x.v>0);
  const maxV = Math.max(...byTipo.map(x=>x.v),1);

  return (
    <div className="page fu">
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Gastos</div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button className="btn bg bsm" onClick={()=>scanRef.current.click()} disabled={scanning}>
            {scanning?<span className="spinner"/>:<><Icon d={I.camera} size={14}/> Escanear</>}
          </button>
          <input ref={scanRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleScan}/>
          <button className="btn bg bsm" onClick={()=>setModal(true)}><Icon d={I.plus} size={14}/> Añadir</button>
        </div>
      </div>

      {esGerente&&<div className="sgrid">
        <div className="stat"><div className="slbl">Total gastos</div><div className="sval r">{euros(total)}</div></div>
        <div className="stat"><div className="slbl">Registros</div><div className="sval">{gastos.length}</div></div>
      </div>}

      {byTipo.length>0&&<div className="card">
        <div className="chd">Por categoría</div>
        <div className="bwrap">
          {byTipo.sort((a,b)=>b.v-a.v).map(({t,v})=>(
            <div className="brow" key={t}>
              <div className="bmeta"><span>{t}</span><span style={{color:"var(--muted)"}}>{euros(v)}</span></div>
              <div className="btrack"><div className="bfill" style={{width:`${(v/maxV)*100}%`,background:`linear-gradient(90deg,${ACCENTS[0].a1},${ACCENTS[0].a2})`}}/></div>
            </div>
          ))}
        </div>
      </div>}

      {gastos.length===0?<div className="empty"><div className="ei"><Icon d={I.coin} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin gastos</strong><span style={{fontSize:"0.8rem"}}>Añade manualmente o escanea un ticket</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {gastos.map(g=>{
          const veh=[...tractoras,...semis].find(v=>v.id===g.vehicle_id);
          return <div className="trip" key={g.id}>
            <div className="ttop">
              <div>
                <div className="troute">{g.tipo}{g.pais&&g.pais!=="España"?` · ${g.pais}`:""}</div>
                <div className="tdate">{fmtDate(g.fecha)}{veh?` · ${veh.matricula}`:""}{g.nota?` · ${g.nota}`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:"1.1rem",color:"var(--red)",letterSpacing:"0.02em"}}>{euros(parseFloat(g.importe))}</span>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={()=>deleteGasto(g.id)}><Icon d={I.trash} size={12}/></button>
              </div>
            </div>
            {g.litros&&<div className="trow"><span>⛽ {g.litros}L · {g.precio_litro}€/L</span></div>}
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
            <div className="fld"><label className="lbl">Litros</label><input className="inp" type="number" placeholder="0" value={form.litros} onChange={e=>handleLitros(e.target.value,form.precio_litro)}/></div>
            <div className="fld"><label className="lbl">€/litro</label><input className="inp" type="number" placeholder="0,00" value={form.precio_litro} onChange={e=>handleLitros(form.litros,e.target.value)}/></div>
          </div>}
          <div className="fld">
            <label className="lbl">Importe total (€){form.tipo==="Combustible"&&form.litros?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · calculado auto</span>:""}</label>
            <input className="inp" type="number" placeholder="0,00" value={form.importe} onChange={e=>setForm({...form,importe:e.target.value})}/>
          </div>
          {form.tipo==="Combustible"&&<div className="fld"><label className="lbl">País</label>
            <select className="inp sel" value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Asignar a</label>
              <select className="inp sel" value={form.vehicle_tipo} onChange={e=>setForm({...form,vehicle_tipo:e.target.value,vehicle_id:e.target.value==="tractora"?tractoras[0]?.id||"":semis[0]?.id||""})}>
                <option value="tractora">Tractora</option>
                {semis.length>0&&<option value="semi">Semirremolque</option>}
              </select></div>
            <div className="fld"><label className="lbl">Matrícula</label>
              <select className="inp sel" value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})}>
                {(form.vehicle_tipo==="tractora"?tractoras:semis).map(v=><option key={v.id} value={v.id}>{v.matricula||"Sin mat."}</option>)}
              </select></div>
          </div>
          <div className="fld"><label className="lbl">Nota</label><input className="inp" placeholder="opcional" value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})}/></div>
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={addGasto}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── VIAJES PAGE ───────────────────────────────────────────────────────────────
function ViajesPage({ userId, tractoras, semis, esGerente }) {
  const [viajes, setViajes] = useState([]);
  const [modal, setModal] = useState(false);
  const [vuelta, setVuelta] = useState(false);
  const [toast, setToast] = useState("");
  const defaultT = tractoras[0];

  const getAutoSemi = (tid) => {
    const t = tractoras.find(x=>x.id===tid);
    return t?.conjunto_fijo && t?.semi_habitual_id ? t.semi_habitual_id : "";
  };

  const [form, setForm] = useState({
    fecha:new Date().toISOString().slice(0,10), cliente:"", origen:"", destino:"", pais:"España",
    km:"", km_auto:false, km_vuelta:"", peaje:"", precio:"",
    truck_id:defaultT?.id||"", semi_id:getAutoSemi(defaultT?.id||""),
  });

  useEffect(()=>{
    supabase.from("viajes").select("*").eq("user_id",userId).order("fecha",{ascending:false})
      .then(({data})=>setViajes(data||[]));
  },[]);

  const handleOD = (field, val) => {
    const nf = {...form,[field]:val};
    const km = calcKm(nf.origen, nf.destino);
    if (km) { nf.km=String(km); nf.km_auto=true; } else { nf.km_auto=false; }
    setForm(nf);
  };

  const handleTruck = (tid) => setForm(f=>({...f,truck_id:tid,semi_id:getAutoSemi(tid)}));

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truck_id);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    const coste = km*c.costeFijoKm+peaje;
    return { coste, ben:precio-coste, margen:precio>0?((precio-coste)/precio)*100:0 };
  };

  const addViaje = async () => {
    if (!form.km||!form.precio) return;
    const payload = {...form, km_vuelta:vuelta?(form.km_vuelta||form.km):"", user_id:userId};
    const {data} = await supabase.from("viajes").insert(payload).select().single();
    setViajes([data,...viajes]);
    setForm({fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",pais:"España",km:"",km_auto:false,km_vuelta:"",peaje:"",precio:"",truck_id:defaultT?.id||"",semi_id:getAutoSemi(defaultT?.id||"")});
    setVuelta(false); setModal(false);
    setToast("✅ Viaje guardado");
  };

  const deleteViaje = async (id) => {
    await supabase.from("viajes").delete().eq("id",id);
    setViajes(viajes.filter(v=>v.id!==id));
  };

  const selectedT = tractoras.find(t=>t.id===form.truck_id);
  const conjuntoFijo = selectedT?.conjunto_fijo && selectedT?.semi_habitual_id;

  return (
    <div className="page fu">
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bg bsm" onClick={()=>setModal(true)}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>

      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Añade una tractora en <strong>Flota</strong> para registrar viajes.</span></div>}

      {viajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Añade tu primera ruta</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {viajes.map(v=>{
          const {coste,ben,margen}=calcV(v);
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          const t=tractoras.find(x=>x.id===v.truck_id);
          const s=semis.find(x=>x.id===v.semi_id);
          return <div className="trip" key={v.id}>
            <div className="ttop">
              <div>
                <div className="troute">{v.origen||"—"} → {v.destino||"—"}{v.pais&&v.pais!=="España"?" 🌍":""}</div>
                <div className="tdate">{fmtDate(v.fecha)}{v.cliente?` · ${v.cliente}`:""}</div>
              </div>
              <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={()=>deleteViaje(v.id)}><Icon d={I.trash} size={12}/></button>
            </div>
            <div className="trow">
              {t&&<span>🚛 {t.matricula}</span>}
              {s&&<span>🔧 {s.matricula}</span>}
              <span>📏 {v.km}km ida</span>
              {v.km_vuelta&&<span>↩️ {v.km_vuelta}km</span>}
              <span>💰 {euros(parseFloat(v.precio))}</span>
              {v.peaje&&parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
            </div>
            {esGerente&&tractoras.length>0&&<div className="tfoot">
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
            <label className="lbl">Km de ida{form.km_auto?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · calculado aprox.</span>:""}</label>
            <input className="inp" type="number" placeholder="0" value={form.km} onChange={e=>setForm({...form,km:e.target.value,km_auto:false})}/>
          </div>
          <div className="toggle-row">
            <span className="toggle-lbl">↩️ Vuelta sin carga</span>
            <button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/>
          </div>
          {vuelta&&<div className="fld">
            <label className="lbl">Km de vuelta{form.km?<span style={{color:"var(--muted)",fontSize:"0.68rem"}}> · aprox. {form.km} km</span>:""}</label>
            <input className="inp" type="number" placeholder={form.km||"0"} value={form.km_vuelta} onChange={e=>setForm({...form,km_vuelta:e.target.value})}/>
          </div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes (€)</label><input className="inp" type="number" placeholder="0" value={form.peaje} onChange={e=>setForm({...form,peaje:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Precio cobrado (€)</label><input className="inp" type="number" placeholder="0" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></div>
          </div>
          {tractoras.length>1&&<div className="fld"><label className="lbl">Tractora</label>
            <select className="inp sel" value={form.truck_id} onChange={e=>handleTruck(e.target.value)}>
              {tractoras.map(t=><option key={t.id} value={t.id}>{t.matricula||"Sin mat."}{t.apodo?` "${t.apodo}"`:"" }</option>)}
            </select></div>}
          {semis.length>0&&<div className="fld">
            <label className="lbl">Semirremolque{conjuntoFijo?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · conjunto fijo</span>:""}</label>
            <select className="inp sel" value={form.semi_id} onChange={e=>setForm({...form,semi_id:e.target.value})} disabled={!!conjuntoFijo}>
              <option value="">Sin semirremolque</option>
              {semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
            </select></div>}
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={addViaje}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── RESUMEN PAGE ──────────────────────────────────────────────────────────────
function ResumenPage({ userId, tractoras, semis }) {
  const [viajes, setViajes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [filtro, setFiltro] = useState("all");

  useEffect(()=>{
    Promise.all([
      supabase.from("viajes").select("*").eq("user_id",userId),
      supabase.from("gastos").select("*").eq("user_id",userId),
    ]).then(([{data:v},{data:g}])=>{ setViajes(v||[]); setGastos(g||[]); });
  },[]);

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truck_id);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    return { coste:km*c.costeFijoKm+peaje, ingreso:precio };
  };

  const fViajes = filtro==="all"?viajes:filtro.startsWith("T")?viajes.filter(v=>v.truck_id===filtro):viajes.filter(v=>v.semi_id===filtro);
  const fGastos = filtro==="all"?gastos:gastos.filter(g=>g.vehicle_id===filtro);

  const now = new Date();
  const months = [];
  for (let i=5;i>=0;i--) {
    const d = new Date(now.getFullYear(),now.getMonth()-i,1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const mv = fViajes.filter(v=>v.fecha?.startsWith(key));
    const ingresos = mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const costeViajes = mv.reduce((s,v)=>s+calcV(v).coste,0);
    months.push({label:`${MESES[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,ingresos,beneficio:ingresos-costeViajes,numViajes:mv.length});
  }

  const conjuntos = tractoras.map(t=>{
    const tV=viajes.filter(v=>v.truck_id===t.id);
    const semi=semis.find(s=>s.id===t.semi_habitual_id);
    const semiG=semi?gastos.filter(g=>g.vehicle_id===semi.id):[];
    const ingresos=tV.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const coste=tV.reduce((s,v)=>s+calcV(v).coste,0);
    const gastosT=gastos.filter(g=>g.vehicle_id===t.id).reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const gastosS=semiG.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const totalKm=tV.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
    return {t,semi,ingresos,beneficio:ingresos-coste,gastosT,gastosS,numViajes:tV.length,totalKm};
  });

  const totalIng=months.reduce((s,m)=>s+m.ingresos,0);
  const totalBen=months.reduce((s,m)=>s+m.beneficio,0);
  const maxIng=Math.max(...months.map(m=>m.ingresos),1);

  return (
    <div className="page fu">
      <div className="ptitle">Resumen</div>
      <div style={{display:"flex",gap:"0.375rem",overflowX:"auto",paddingBottom:"0.25rem"}}>
        <button className={`btn bsm ${filtro==="all"?"bp":"bg"}`} onClick={()=>setFiltro("all")} style={{whiteSpace:"nowrap"}}>Toda la flota</button>
        {tractoras.map(t=><button key={t.id} className={`btn bsm ${filtro===t.id?"bp":"bg"}`} onClick={()=>setFiltro(t.id)} style={{whiteSpace:"nowrap"}}>🚛 {t.matricula||"Tractora"}</button>)}
        {semis.map(s=><button key={s.id} className={`btn bsm ${filtro===s.id?"bp":"bg"}`} onClick={()=>setFiltro(s.id)} style={{whiteSpace:"nowrap"}}>🔧 {s.matricula||"Semi"}</button>)}
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
                background:m.beneficio>=0?"linear-gradient(180deg,#FF3D5A,#FF3D5A55)":"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>
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

// ── INICIO PAGE ───────────────────────────────────────────────────────────────
function InicioPage({ userId, tractoras, semis, perfil, esGerente }) {
  const [viajes, setViajes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const accent = ACCENTS[perfil.accent_idx||0];

  useEffect(()=>{
    Promise.all([
      supabase.from("viajes").select("*").eq("user_id",userId),
      supabase.from("gastos").select("*").eq("user_id",userId),
    ]).then(([{data:v},{data:g}])=>{ setViajes(v||[]); setGastos(g||[]); });
  },[]);

  // Bienvenida si no hay datos
  if (tractoras.length===0) return (
    <div className="page fu">
      <div>
        <div className="greet-name">{new Date().getHours()<12?"Buenos días ☀️":new Date().getHours()<18?"Buenas tardes 🌤️":"Buenas noches 🌙"}</div>
        <div className="greet-sub">Bienvenido a KmRentable</div>
      </div>
      <div className="card">
        <div className="chd">Para empezar</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {[["①","Añade tu tractora","Ve a Flota y registra tu vehículo con sus costes"],["②","Configura los costes","Leasing, seguro, gestoría... todo lo fijo mensual"],["③","Registra tu primer viaje","Ruta, km y precio cobrado — verás si ganas dinero"]].map(([n,t,s])=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:"0.875rem",padding:"0.875rem",background:"var(--s2)",borderRadius:"var(--r2)",border:"1px solid var(--border2)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.5rem",color:"var(--a1)",lineHeight:1,flexShrink:0}}>{n}</div>
              <div><div style={{fontWeight:600,fontSize:"0.875rem"}}>{t}</div><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:2}}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const calcV = (v) => {
    const t = tractoras.find(x=>x.id===v.truck_id);
    const c = t ? calcTractora(t) : {costeFijoKm:0};
    const km = (parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    const coste = km*c.costeFijoKm+peaje;
    return { coste, ben:precio-coste, margen:precio>0?((precio-coste)/precio)*100:0 };
  };

  const totalCobrado=viajes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const totalKm=viajes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0),0);
  const beneficio=viajes.reduce((s,v)=>s+calcV(v).ben,0);
  const perdida=viajes.filter(v=>calcV(v).ben<0).length;
  const cktMedia=tractoras.length>0?tractoras.reduce((s,t)=>s+calcTractora(t).costeFijoKm,0)/tractoras.length:0;

  const alertas=[];
  tractoras.forEach(t=>{
    [["fecha_itv","ITV",45],["fecha_seguro_vto","Seguro",30],["fecha_aceite","Aceite",15],["fecha_tarjeta","Tarjeta transp.",45]].forEach(([k,l,m])=>{
      const days=alertDays(t[k]); const col=alertColor(days,m);
      if(col==="r"||col==="y") alertas.push({label:`${l} — ${t.matricula||"Tractora"}`,days,col,fecha:t[k]});
    });
  });
  semis.forEach(s=>{
    const days=alertDays(s.fecha_itv); const col=alertColor(days,45);
    if(col==="r"||col==="y") alertas.push({label:`ITV remolque — ${s.matricula||"Semi"}`,days,col,fecha:s.fecha_itv});
  });

  const chartData=viajes.slice(-8).map(v=>({lbl:v.destino||"Ruta",ben:calcV(v).ben}));
  const maxBen=Math.max(...chartData.map(d=>Math.abs(d.ben)),1);

  const cMap={};
  viajes.forEach(v=>{
    const c=v.cliente||"Sin nombre";
    if(!cMap[c])cMap[c]={ing:0,cost:0};
    cMap[c].ing+=parseFloat(v.precio)||0;
    cMap[c].cost+=calcV(v).coste;
  });
  const clientes=Object.entries(cMap).map(([n,d])=>({n,margen:d.ing>0?((d.ing-d.cost)/d.ing)*100:0})).sort((a,b)=>b.margen-a.margen);

  const hora=new Date().getHours();
  const nombre=perfil.empresa||perfil.nombre||"";

  return (
    <div className="page fu">
      <div>
        <div className="greet-name">{hora<12?"Buenos días ☀️":hora<18?"Buenas tardes 🌤️":"Buenas noches 🌙"}{nombre?`, ${nombre.split(" ")[0]}`:""}</div>
        <div className="greet-sub">{tractoras.length} tractora{tractoras.length!==1?"s":""} · {semis.length} semirremolque{semis.length!==1?"s":""}</div>
      </div>

      {alertas.length>0&&<div className="card">
        <div className="chd">⚠️ Avisos pendientes</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
          {alertas.map((a,i)=>(
            <div key={i} className={`alert-item ${a.col}`}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <div className={`alert-dot dot-${a.col}`}/>
                <div><div style={{fontWeight:600,fontSize:"0.83rem"}}>{a.label}</div>
                <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{a.days<0?"Vencido hace":"Vence en"} {Math.abs(a.days)} días · {fmtDate(a.fecha)}</div></div>
              </div>
              <span className={`badge ${a.col==="r"?"bg-r":"bg-y"}`}>{a.days<0?"Vencido":`${Math.abs(a.days)}d`}</span>
            </div>
          ))}
        </div>
      </div>}

      {esGerente&&cktMedia>0&&<div className="hcard">
        <div className="hlbl">Coste fijo medio por km</div>
        <div className="hval">{eurosKm(cktMedia)}</div>
        <div className="hsub">{tractoras.length} tractora{tractoras.length!==1?"s":""} · solo costes fijos</div>
      </div>}

      {esGerente&&<div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos</div><div className="sval g">{euros(totalCobrado)}</div></div>
        <div className="stat"><div className="slbl">Beneficio est.</div><div className={`sval ${beneficio>=0?"g":"r"}`}>{euros(beneficio)}</div></div>
        <div className="stat"><div className="slbl">Km totales</div><div className="sval a">{totalKm.toLocaleString("es-ES")}</div></div>
        <div className="stat"><div className="slbl">Viajes</div><div className="sval">{viajes.length}</div></div>
      </div>}

      {esGerente&&perdida>0&&<div className="alert ar"><Icon d={I.alert} size={14} color="var(--red)"/><span><strong>{perdida} viaje{perdida>1?"s":""} en pérdida.</strong> Revisa precios o costes.</span></div>}

      {esGerente&&chartData.length>0&&<div className="card">
        <div className="chd">Beneficio últimos viajes</div>
        <div className="mchart">
          {chartData.map((d,i)=>(
            <div key={i} className="mbar" title={`${d.lbl}: ${euros(d.ben)}`}
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

      {esGerente&&clientes.length>0&&<div className="card">
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
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({});
  const [tractoras, setTractoras] = useState([]);
  const [semis, setSemis] = useState([]);
  const [tab, setTab] = useState("inicio");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if (session?.user) {
        setUser(session.user);
        const {data:p} = await supabase.from("perfiles").select("*").eq("id",session.user.id).single();
        setPerfil(p||{});
        const [{data:t},{data:s}] = await Promise.all([
          supabase.from("tractoras").select("*").eq("user_id",session.user.id),
          supabase.from("semirremolques").select("*").eq("user_id",session.user.id),
        ]);
        setTractoras(t||[]); setSemis(s||[]);
      }
      setLoading(false);
    });
  },[]);

  const handleAuth = (u, p) => { setUser(u); setPerfil(p); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setPerfil({}); };
  const updatePerfil = (patch) => setPerfil(p=>({...p,...patch}));

  const accent = ACCENTS[perfil.accent_idx||0];
  const esGerente = perfil.rol !== "chofer";
  const days = getDaysLeft(perfil.trial_start);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#08080F"}}>
      <div className="spinner" style={{width:32,height:32,borderColor:"rgba(255,61,90,0.3)",borderTopColor:"#FF3D5A"}}/>
    </div>
  );

  if (!user) return (
    <><style>{makeCSS(accent)}</style>
    <div className="app"><AuthPage onAuth={handleAuth} accent={accent}/></div></>
  );

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
          {perfil.logo?<img src={perfil.logo} alt="" className="hdr-logo"/>:<div className="hdr-logo-ph">{(perfil.empresa||perfil.nombre||"K").charAt(0).toUpperCase()}</div>}
          <div>
            <div className="hdr-brand">{perfil.empresa||"KmRentable"}</div>
            <div className="hdr-sub">{esGerente?"Gerente":"Chófer"} · {tractoras.length} tractora{tractoras.length!==1?"s":""}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <div className="trial-chip">
            <Icon d={I.clock} size={10} color="var(--muted)"/>
            <span className="chip-d">{days}d</span>
          </div>
          <button className="btn bg bsm" style={{padding:"0.35rem 0.5rem",width:"auto"}} onClick={handleLogout}><Icon d={I.logout} size={15}/></button>
        </div>
      </div>

      {tab==="inicio"  &&<InicioPage userId={user.id} tractoras={tractoras} semis={semis} perfil={perfil} esGerente={esGerente}/>}
      {tab==="flota"   &&<FlotaPage userId={user.id} perfil={perfil} update={updatePerfil}/>}
      {tab==="gastos"  &&<GastosPage userId={user.id} tractoras={tractoras} semis={semis} esGerente={esGerente}/>}
      {tab==="viajes"  &&<ViajesPage userId={user.id} tractoras={tractoras} semis={semis} esGerente={esGerente}/>}
      {tab==="resumen" &&esGerente&&<ResumenPage userId={user.id} tractoras={tractoras} semis={semis}/>}
      {tab==="resumen" &&!esGerente&&<div className="page"><div className="alert ay"><Icon d={I.lock} size={14} color="var(--yellow)"/><span>El resumen solo está disponible para el gerente.</span></div></div>}

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
