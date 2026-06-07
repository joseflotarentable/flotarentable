import { useState, useEffect, useCallback, useRef } from "react";

const SK = "kmrentable_v3";
const ACCENTS = [
  { name:"Rojo",    a1:"#FF3D5A", a2:"#FF7A3D" },
  { name:"Azul",    a1:"#4B8EFF", a2:"#6B5FFF" },
  { name:"Verde",   a1:"#06D6A0", a2:"#00B4D8" },
  { name:"Naranja", a1:"#FF8C42", a2:"#FFD166" },
  { name:"Morado",  a1:"#9B5DE5", a2:"#F15BB5" },
];

const newVehicle = () => ({
  id: Date.now().toString(),
  matricula:"", tipo:"", apodo:"", foto:"",
  kmMensuales:"", diasTrabajo:"", precioGasoleo:"", consumo:"",
  seguro:"", autonomo:"", leasing:"", impuestos:"", gestoria:"", parking:"",
  peajesMensuales:"",
  itv:"", seguroVto:"", aceite:"", tarjetaTransp:"",
});

const initialState = {
  onboarded: false,
  empresa:"", logo:"", accentIdx:0,
  vehicles: [newVehicle()],
  activeVehicleId: null,
  gastos: [], viajes: [],
  trialStart: null,
};

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SK));
    if (!d) return initialState;
    if (!d.vehicles || d.vehicles.length === 0) d.vehicles = [newVehicle()];
    if (!d.activeVehicleId) d.activeVehicleId = d.vehicles[0].id;
    return { ...initialState, ...d };
  } catch { return initialState; }
}
function save(s) { localStorage.setItem(SK, JSON.stringify(s)); }

const Icon = ({ d, size=20, color="currentColor" }) => (
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
  euro:   "M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z",
  star:   "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  clock:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bell:   "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  camera: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  chart:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  back:   "M19 12H5M12 5l-7 7 7 7",
  edit:   "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

const euros = n => isNaN(n)||n==null ? "—" : new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const eurosKm = n => isNaN(n)||n==null||!isFinite(n) ? "—" : `${Number(n).toFixed(3).replace(".",",")} €/km`;
const pct = n => isNaN(n)||!isFinite(n) ? "—" : `${Math.round(n)}%`;

function calcConfig(v) {
  const km = parseFloat(v.kmMensuales)||0;
  const comb = (km*(parseFloat(v.consumo)||0)/100)*(parseFloat(v.precioGasoleo)||0);
  const fijos = ["seguro","autonomo","leasing","impuestos","gestoria","parking","peajesMensuales"]
    .reduce((s,k)=>s+(parseFloat(v[k])||0),0);
  const total = fijos + comb;
  return { comb, fijos, total, costeFijoKm: km>0?total/km:0, km };
}

function getDaysLeft(t) { if(!t)return 30; return Math.max(0,30-Math.floor((Date.now()-new Date(t))/86400000)); }

function alertDays(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((new Date(dateStr)-Date.now())/86400000);
  return diff;
}

function alertColor(days, margin) {
  if (days === null) return null;
  if (days < 0) return "r";
  if (days <= 7) return "r";
  if (days <= margin) return "y";
  return "g";
}

// City coordinates (Spain + main EU cities)
const CITIES = {
  "madrid":       [40.4168,-3.7038], "barcelona":  [41.3851,2.1734],
  "valencia":     [39.4699,-0.3763], "sevilla":    [37.3891,-5.9845],
  "zaragoza":     [41.6488,-0.8891], "malaga":     [36.7213,-4.4214],
  "murcia":       [37.9922,-1.1307], "palma":      [39.5696,2.6502],
  "granada":      [37.1773,-3.5986], "bilbao":     [43.2630,-2.9350],
  "alicante":     [38.3452,-0.4810], "valladolid": [41.6523,-4.7245],
  "cordoba":      [37.8882,-4.7794], "vigo":       [42.2314,-8.7124],
  "gijon":        [43.5453,-5.6615], "hospitalet": [41.3597,2.1000],
  "vitoria":      [42.8467,-2.6726], "coruña":     [43.3623,-8.4115],
  "granada":      [37.1773,-3.5986], "pamplona":   [42.8125,-1.6458],
  "santander":    [43.4623,-3.8099], "almeria":    [36.8340,-2.4637],
  "burgos":       [42.3440,-3.6970], "salamanca":  [40.9701,-5.6635],
  "huelva":       [37.2614,-6.9447], "badajoz":    [38.8794,-6.9706],
  "logroño":      [42.4650,-2.4456], "cadiz":      [36.5271,-6.2886],
  "tarragona":    [41.1189,1.2445],  "lleida":     [41.6175,0.6200],
  "albacete":     [38.9942,-1.8564], "jaen":       [37.7796,-3.7849],
  "paris":        [48.8566,2.3522],  "london":     [51.5074,-0.1278],
  "berlin":       [52.5200,13.4050], "lisboa":     [38.7223,-9.1393],
  "roma":         [41.9028,12.4964], "amsterdam":  [52.3676,4.9041],
  "bruselas":     [50.8503,4.3517],  "lyon":       [45.7640,4.8357],
  "marsella":     [43.2965,5.3698],  "burdeos":    [44.8378,-0.5792],
  "toulouse":     [43.6047,1.4442],  "milan":      [45.4654,9.1859],
  "frankfurt":    [50.1109,8.6821],  "munich":     [48.1351,11.5820],
};

function calcKmBetween(origen, destino) {
  const o = CITIES[origen.toLowerCase().trim()];
  const d = CITIES[destino.toLowerCase().trim()];
  if (!o || !d) return null;
  const R = 6371;
  const dLat = (d[0]-o[0])*Math.PI/180;
  const dLon = (d[1]-o[1])*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(o[0]*Math.PI/180)*Math.cos(d[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  const dist = R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return Math.round(dist * 1.25);
}

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── CSS ──────────────────────────────────────────────────────────────────────
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

/* ONBOARD */
.ob{flex:1;display:flex;flex-direction:column;overflow-y:auto}
.ob-hero{position:relative;padding:3.5rem 1.75rem 2rem;text-align:center;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:1.25rem}
.ob-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:320px;height:320px;background:radial-gradient(circle,${accent.a1}18,transparent 65%);pointer-events:none}
.ob-logo{position:relative;z-index:1;width:76px;height:76px;border-radius:22px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px ${accent.a1}35,0 16px 40px ${accent.a1}25}
.ob-wordmark{position:relative;z-index:1;font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:0.06em;line-height:1;background:linear-gradient(160deg,#fff 0%,#FFD166 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ob-tagline{position:relative;z-index:1;font-size:0.95rem;color:var(--muted);line-height:1.65;max-width:270px}
.ob-feats{padding:0 1.5rem;display:flex;flex-direction:column;gap:0.5rem}
.ob-feat{display:flex;align-items:center;gap:0.875rem;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:0.875rem 1.125rem}
.ob-fi{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ob-ft{font-size:0.875rem;font-weight:600}
.ob-fs{font-size:0.73rem;color:var(--muted);margin-top:1px}
.ob-bottom{padding:1.25rem;display:flex;flex-direction:column;gap:0.875rem}
.trial-strip{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem}
.trial-num{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:0.04em;line-height:1;background:linear-gradient(135deg,${accent.a1},#FFD166);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.trial-info{flex:1}
.trial-title{font-weight:700;font-size:0.95rem}
.trial-desc{font-size:0.75rem;color:var(--muted);margin-top:2px;line-height:1.4}
.checks{display:grid;grid-template-columns:1fr 1fr;gap:0.375rem}
.chk{display:flex;align-items:center;gap:0.375rem;font-size:0.75rem;color:var(--muted)}

/* PAYMENT */
.pay{flex:1;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;overflow-y:auto}
.pay-back{background:none;border:none;color:var(--muted);cursor:pointer;font-family:inherit;font-size:0.83rem;display:flex;align-items:center;gap:0.375rem;padding:0;transition:color 0.15s}
.pay-back:hover{color:var(--text)}
.pay-h{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:0.04em;line-height:1.1}
.pay-sub{font-size:0.85rem;color:var(--muted);line-height:1.55;margin-top:0.25rem}
.plan-box{background:var(--s2);border:1px solid ${accent.a1}33;border-radius:var(--r);padding:1.125rem 1.25rem;display:flex;justify-content:space-between;align-items:center}
.plan-name{font-weight:700;font-size:0.95rem}
.plan-free{font-size:0.75rem;color:var(--green);margin-top:3px}
.plan-price{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.04em;color:var(--a1);text-align:right}
.plan-period{font-size:0.7rem;color:var(--muted);text-align:right}
.cf{display:flex;flex-direction:column;gap:0.375rem}
.cl{font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;font-weight:600}
.ci{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9rem;padding:0.75rem 1rem;width:100%;outline:none;transition:border-color 0.2s}
.ci:focus{border-color:var(--a1)}
.cr{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
.sec{display:flex;align-items:center;justify-content:center;gap:0.375rem;font-size:0.75rem;color:var(--muted2)}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;border:none;border-radius:var(--r2);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.9rem;transition:all 0.15s;padding:0.875rem 1.5rem;width:100%;letter-spacing:0.01em}
.bp{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff;box-shadow:0 6px 24px ${accent.a1}30}
.bp:hover{transform:translateY(-2px);box-shadow:0 10px 32px ${accent.a1}45}
.bg{background:var(--s2);color:var(--text);border:1px solid var(--border2)}
.bg:hover{border-color:var(--border3)}
.bsm{padding:0.45rem 0.875rem;font-size:0.8rem;border-radius:8px;width:auto}
.bd{background:#FF3D5A12;color:var(--red);border:1px solid #FF3D5A20}
.bd:hover{background:#FF3D5A22}

/* HEADER */
.hdr{padding:0.75rem 1.125rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(15,15,26,0.92);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}
.hdr-left{display:flex;align-items:center;gap:0.75rem}
.hdr-logo{width:36px;height:36px;border-radius:10px;object-fit:cover;border:1px solid var(--border2)}
.hdr-logo-placeholder{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#fff}
.hdr-brand{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:0.07em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.hdr-sub{font-size:0.65rem;color:var(--muted);margin-top:1px}
.trial-chip{display:flex;align-items:center;gap:0.375rem;background:var(--s3);border:1px solid var(--border2);border-radius:999px;padding:0.3rem 0.75rem;font-size:0.72rem;color:var(--muted)}
.chip-d{color:var(--a2);font-weight:700;font-size:0.8rem}

/* NAV */
.nav{display:grid;grid-template-columns:repeat(5,1fr);background:rgba(15,15,26,0.95);border-top:1px solid var(--border);position:sticky;bottom:0;z-index:20;backdrop-filter:blur(16px)}
.nb{display:flex;flex-direction:column;align-items:center;gap:0.2rem;padding:0.65rem 0 0.55rem;border:none;background:none;color:var(--muted2);cursor:pointer;font-size:0.55rem;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;letter-spacing:0.03em;transition:color 0.15s;position:relative}
.nb.on{color:var(--a1)}
.nb.on::after{content:'';position:absolute;top:0;inset-x:20%;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2});border-radius:0 0 3px 3px}
.nb:hover:not(.on){color:var(--text)}

/* PAGE */
.page{flex:1;overflow-y:auto;padding:1.125rem;display:flex;flex-direction:column;gap:0.875rem;padding-bottom:2rem}
.ptitle{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:0.04em}

/* CARD */
.card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:1.125rem}
.chd{font-size:0.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.875rem}

/* FORM */
.fld{display:flex;flex-direction:column;gap:0.35rem}
.lbl{font-size:0.75rem;color:var(--muted);font-weight:600}
.inp{background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;padding:0.65rem 0.875rem;width:100%;outline:none;transition:border-color 0.2s}
.inp:focus{border-color:var(--a1)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.625rem}
.sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2368687A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.875rem center;padding-right:2.25rem}

/* TOGGLE */
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--s2);border:1px solid var(--border2);border-radius:10px;padding:0.65rem 0.875rem}
.toggle-lbl{font-size:0.875rem;font-weight:500}
.toggle{width:44px;height:24px;border-radius:999px;background:var(--s3);border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
.toggle.on{background:var(--a1)}
.toggle::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s}
.toggle.on::after{transform:translateX(20px)}

/* STATS */
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:0.625rem}
.stat{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.2rem}
.slbl{font-size:0.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em}
.sval{font-family:'Bebas Neue',sans-serif;font-size:1.55rem;letter-spacing:0.02em;line-height:1.1}
.g{color:var(--green)}.r{color:var(--red)}.y{color:var(--yellow)}.a{color:var(--a2)}

/* HERO CARD */
.hcard{position:relative;overflow:hidden;background:var(--s1);border:1px solid ${accent.a1}22;border-radius:var(--r);padding:1.5rem}
.hcard::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,${accent.a1}15,transparent 65%);pointer-events:none}
.hcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${accent.a1},${accent.a2},transparent)}
.hlbl{font-size:0.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em}
.hval{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:0.02em;line-height:1.05;color:var(--a1);margin-top:0.125rem}
.hsub{font-size:0.78rem;color:var(--muted);margin-top:0.375rem}

/* GREETING */
.greet{padding:0.25rem 0}
.greet-name{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.04em;line-height:1.1}
.greet-sub{font-size:0.85rem;color:var(--muted);margin-top:0.25rem}

/* BARS */
.bwrap{display:flex;flex-direction:column;gap:0.625rem}
.brow{display:flex;flex-direction:column;gap:0.3rem}
.bmeta{display:flex;justify-content:space-between;font-size:0.78rem}
.btrack{height:5px;background:var(--s3);border-radius:999px;overflow:hidden}
.bfill{height:100%;border-radius:999px;transition:width 0.7s cubic-bezier(.4,0,.2,1)}

/* TRIPS */
.trip{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:0.875rem;display:flex;flex-direction:column;gap:0.5rem;transition:border-color 0.2s}
.trip:hover{border-color:var(--border3)}
.ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem}
.troute{font-weight:700;font-size:0.875rem}
.tdate{font-size:0.7rem;color:var(--muted);margin-top:2px}
.trow{display:flex;gap:0.875rem;font-size:0.75rem;color:var(--muted);flex-wrap:wrap}
.tfoot{display:flex;justify-content:space-between;align-items:center;padding-top:0.5rem;border-top:1px solid var(--border)}
.tvuelta{background:var(--s3);border-radius:8px;padding:0.375rem 0.625rem;font-size:0.73rem;color:var(--muted);display:flex;align-items:center;gap:0.375rem}

/* BADGE */
.badge{display:inline-flex;align-items:center;padding:0.2rem 0.625rem;border-radius:999px;font-size:0.7rem;font-weight:700}
.bg-g{background:#06D6A012;color:var(--green);border:1px solid #06D6A020}
.bg-r{background:#FF3D5A12;color:var(--red);border:1px solid #FF3D5A20}
.bg-y{background:#FFD16612;color:var(--yellow);border:1px solid #FFD16620}

/* ALERT */
.alert{display:flex;align-items:flex-start;gap:0.75rem;padding:0.875rem;border-radius:var(--r2);font-size:0.83rem;line-height:1.55}
.ar{background:#FF3D5A0C;border:1px solid #FF3D5A20;color:#FFB3BC}
.ay{background:#FFD1660C;border:1px solid #FFD16620;color:#FFE9A0}
.ag{background:#06D6A00C;border:1px solid #06D6A020;color:#7FECCE}

/* ALERT ITEM */
.alert-item{display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--s2);border-radius:10px;border:1px solid var(--border)}
.alert-item.r{border-color:#FF3D5A25}
.alert-item.y{border-color:#FFD16625}
.alert-item.g{border-color:#06D6A020}
.alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.dot-r{background:var(--red)}
.dot-y{background:var(--yellow)}
.dot-g{background:var(--green)}

/* MODAL */
.ov{position:fixed;inset:0;background:#000000CC;z-index:50;display:flex;align-items:flex-end;justify-content:center}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:22px 22px 0 0;width:100%;max-width:430px;max-height:92vh;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:0.875rem}
.mdrag{width:36px;height:4px;background:var(--border2);border-radius:999px;margin:0 auto -0.25rem}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.04em}
.mact{display:flex;gap:0.75rem;margin-top:0.25rem}

/* VEHICLE CARD */
.vcard{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:1rem;display:flex;align-items:center;gap:0.875rem;cursor:pointer;transition:border-color 0.2s}
.vcard.active{border-color:var(--a1)}
.vcard:hover{border-color:var(--border3)}
.vcard-foto{width:44px;height:44px;border-radius:10px;object-fit:cover;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border)}
.vcard-info{flex:1}
.vcard-mat{font-weight:700;font-size:0.9rem}
.vcard-tipo{font-size:0.73rem;color:var(--muted);margin-top:1px}
.vcard-apodo{font-size:0.73rem;color:var(--a2);margin-top:1px;font-weight:600}

/* MINI CHART */
.mchart{display:flex;align-items:flex-end;gap:3px;height:56px}
.mbar{flex:1;border-radius:4px 4px 0 0;min-width:6px;transition:height 0.5s cubic-bezier(.4,0,.2,1)}

/* MONTH TABLE */
.mtable{width:100%;border-collapse:collapse;font-size:0.8rem}
.mtable th{text-align:left;padding:0.375rem 0.5rem;color:var(--muted);font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border)}
.mtable td{padding:0.5rem 0.5rem;border-bottom:1px solid var(--border)}
.mtable tr:last-child td{border-bottom:none}

/* PHOTO UPLOAD */
.photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:var(--s2);border:1.5px dashed var(--border2);border-radius:var(--r2);padding:1.25rem;cursor:pointer;transition:border-color 0.2s;width:100%}
.photo-btn:hover{border-color:var(--a1)}
.photo-preview{width:100%;height:100px;object-fit:cover;border-radius:10px}

/* ACCENT PICKER */
.accent-grid{display:flex;gap:0.625rem}
.accent-dot{width:32px;height:32px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:border-color 0.15s,transform 0.15s}
.accent-dot.sel{border-color:#fff;transform:scale(1.15)}

/* EMPTY */
.empty{display:flex;flex-direction:column;align-items:center;gap:0.875rem;padding:2rem 1rem;color:var(--muted);text-align:center}
.ei{width:48px;height:48px;border-radius:14px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}

/* SECTION TITLE */
.sec-title{font-size:0.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.5rem}

@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.25s ease both}
`;

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ name:"", num:"", exp:"", cvc:"" });
  const acc = ACCENTS[0];
  const feats = [
    { icon:I.euro,  col:"#FF3D5A", bg:"#FF3D5A15", t:"Coste real por km",       s:"Fijos + variables automáticos" },
    { icon:I.trend, col:"#06D6A0", bg:"#06D6A015", t:"Rentabilidad por viaje",   s:"¿Esta ruta te da dinero?" },
    { icon:I.bell,  col:"#FFD166", bg:"#FFD16615", t:"Alertas de vencimientos",  s:"ITV, seguro, aceite y más" },
    { icon:I.truck, col:"#FF7A3D", bg:"#FF7A3D15", t:"Gestión de flota",         s:"Varios vehículos, un solo lugar" },
  ];
  if (step === 0) return (
    <div className="ob fu">
      <div className="ob-hero">
        <div className="ob-glow"/>
        <div className="ob-logo"><Icon d={I.truck} size={36} color="#fff"/></div>
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
        <p style={{textAlign:"center",fontSize:"0.73rem",color:"var(--muted)"}}>Se solicita método de pago para activar la prueba</p>
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
      <div className="sec"><Icon d={I.lock} size={12} color="var(--muted2)"/><span>Pago seguro SSL · Powered by Stripe</span></div>
    </div>
  );
}

// ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────────
function PhotoUpload({ value, onChange, label="Foto", height=80 }) {
  const ref = useRef();
  const handle = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="fld">
      <label className="lbl">{label}</label>
      <div className="photo-btn" style={{height}} onClick={()=>ref.current.click()}>
        {value ? <img src={value} alt="" className="photo-preview" style={{height:height-20}}/> :
          <><Icon d={I.camera} size={20} color="var(--muted)"/><span style={{fontSize:"0.78rem",color:"var(--muted)"}}>Toca para subir foto</span></>}
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
      </div>
    </div>
  );
}

// ─── CONFIG PAGE ──────────────────────────────────────────────────────────────
function ConfigPage({ state, update }) {
  const [vTab, setVTab] = useState("fleet"); // fleet | vehicle | empresa
  const vehicles = state.vehicles;
  const activeV = vehicles.find(v=>v.id===state.activeVehicleId) || vehicles[0];

  const updateVehicle = (patch) => {
    update({ vehicles: vehicles.map(v => v.id===activeV.id ? {...v,...patch} : v) });
  };
  const addVehicle = () => {
    const nv = newVehicle();
    update({ vehicles:[...vehicles, nv], activeVehicleId: nv.id });
  };
  const deleteVehicle = (id) => {
    const nvs = vehicles.filter(v=>v.id!==id);
    if (nvs.length===0) return;
    update({ vehicles: nvs, activeVehicleId: nvs[0].id });
  };

  const inp = (k,ph="0",t="number") => (
    <input className="inp" type={t} value={activeV[k]||""} placeholder={ph}
      onChange={e=>updateVehicle({[k]:e.target.value})}/>
  );
  const calc = calcConfig(activeV);

  return (
    <div className="page fu">
      <div className="ptitle">Configuración</div>

      {/* Tabs */}
      <div style={{display:"flex",gap:"0.5rem"}}>
        {[["fleet","Mi flota"],["vehicle","Vehículo"],["empresa","Empresa"]].map(([id,lbl])=>(
          <button key={id} className={`btn bsm ${vTab===id?"bp":"bg"}`} style={{flex:1,padding:"0.5rem"}} onClick={()=>setVTab(id)}>{lbl}</button>
        ))}
      </div>

      {vTab==="fleet" && (
        <>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {vehicles.map(v=>(
              <div key={v.id} className={`vcard ${v.id===state.activeVehicleId?"active":""}`}
                onClick={()=>{update({activeVehicleId:v.id});setVTab("vehicle");}}>
                <div className="vcard-foto">
                  {v.foto ? <img src={v.foto} alt="" style={{width:44,height:44,borderRadius:10,objectFit:"cover"}}/> :
                    <Icon d={I.truck} size={20} color="var(--muted)"/>}
                </div>
                <div className="vcard-info">
                  <div className="vcard-mat">{v.matricula||"Sin matrícula"}</div>
                  <div className="vcard-tipo">{v.tipo||"Sin tipo"}</div>
                  {v.apodo&&<div className="vcard-apodo">"{v.apodo}"</div>}
                </div>
                {vehicles.length>1&&<button className="btn bd bsm" style={{padding:"0.35rem 0.45rem"}}
                  onClick={e=>{e.stopPropagation();deleteVehicle(v.id);}}>
                  <Icon d={I.trash} size={12}/>
                </button>}
              </div>
            ))}
          </div>
          <button className="btn bg" onClick={addVehicle}><Icon d={I.plus} size={16}/> Añadir vehículo</button>
        </>
      )}

      {vTab==="vehicle" && (
        <>
          <div className="card">
            <div className="chd">Datos del vehículo</div>
            <PhotoUpload value={activeV.foto} onChange={v=>updateVehicle({foto:v})} label="Foto del camión"/>
            <div className="g2" style={{marginTop:"0.75rem"}}>
              <div className="fld"><label className="lbl">Matrícula</label>
                <input className="inp" value={activeV.matricula||""} placeholder="1234 ABC" type="text" onChange={e=>updateVehicle({matricula:e.target.value})}/></div>
              <div className="fld"><label className="lbl">Apodo</label>
                <input className="inp" value={activeV.apodo||""} placeholder="El Titán" type="text" onChange={e=>updateVehicle({apodo:e.target.value})}/></div>
              <div className="fld"><label className="lbl">Tipo</label>
                <select className="inp sel" value={activeV.tipo||""} onChange={e=>updateVehicle({tipo:e.target.value})}>
                  <option value="">Seleccionar</option>
                  {["Camión rígido","Tráiler","Furgoneta","Vehículo ligero","Cisterna","Góndola"].map(o=><option key={o}>{o}</option>)}
                </select></div>
              <div className="fld"><label className="lbl">Km/mes estimados</label>{inp("kmMensuales")}</div>
              <div className="fld"><label className="lbl">Días trabajo/mes</label>{inp("diasTrabajo")}</div>
            </div>
          </div>

          <div className="card">
            <div className="chd">Combustible</div>
            <div className="g2">
              <div className="fld"><label className="lbl">Precio gasóleo (€/L)</label>{inp("precioGasoleo")}</div>
              <div className="fld"><label className="lbl">Consumo (L/100km)</label>{inp("consumo")}</div>
            </div>
            {calc.comb>0&&<div className="alert ay" style={{marginTop:"0.75rem"}}><Icon d={I.coin} size={14} color="var(--yellow)"/><span>Combustible mensual estimado: <strong>{euros(calc.comb)}</strong></span></div>}
          </div>

          <div className="card">
            <div className="chd">Costes fijos mensuales</div>
            <div className="g2">
              {[["seguro","Seguro"],["autonomo","Autónomo / Nóminas"],["leasing","Leasing / Renting"],["impuestos","Impuestos *"],["gestoria","Gestoría"],["parking","Parking / Base"],["peajesMensuales","Peajes fijos/mes"],["autonomo","Sueldos empleados"]].slice(0,8).map(([k,l])=>(
                <div className="fld" key={k+l}><label className="lbl">{l}</label>
                  <input className="inp" type="number" value={activeV[k]||""} placeholder="0" onChange={e=>updateVehicle({[k]:e.target.value})}/></div>
              ))}
            </div>
            <p style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:"0.625rem"}}>* Impuestos: consulta con tu gestor (varía según régimen fiscal)</p>
          </div>

          <div className="card">
            <div className="chd">Alertas de mantenimiento</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
              {[
                ["itv","📋 Próxima ITV"],
                ["seguroVto","🛡️ Vencimiento seguro"],
                ["aceite","🔧 Próximo cambio aceite"],
                ["tarjetaTransp","📄 Renovación tarjeta transporte"],
              ].map(([k,l])=>(
                <div className="fld" key={k}>
                  <label className="lbl">{l}</label>
                  <input className="inp" type="date" value={activeV[k]||""} onChange={e=>updateVehicle({[k]:e.target.value})}/>
                </div>
              ))}
            </div>
          </div>

          {calc.total>0&&(
            <div className="hcard">
              <div className="hlbl">Coste fijo por km</div>
              <div className="hval">{eurosKm(calc.costeFijoKm)}</div>
              <div className="hsub">Total mensual fijo: {euros(calc.total)}</div>
            </div>
          )}
        </>
      )}

      {vTab==="empresa" && (
        <>
          <div className="card">
            <div className="chd">Tu empresa</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              <div className="fld"><label className="lbl">Nombre / Empresa</label>
                <input className="inp" type="text" value={state.empresa||""} placeholder="Transportes García S.L." onChange={e=>update({empresa:e.target.value})}/></div>
              <PhotoUpload value={state.logo} onChange={v=>update({logo:v})} label="Logo de empresa" height={100}/>
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
            <p style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:"0.625rem"}}>El color se aplica en toda la app</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── GASTOS PAGE ──────────────────────────────────────────────────────────────
function GastosPage({ gastos, state, onAdd, onDelete }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha:new Date().toISOString().slice(0,10), tipo:"Combustible", importe:"", km:"", nota:"", vehicleId: state.activeVehicleId });
  const tipos = ["Combustible","Peaje","Mantenimiento","Neumáticos","Avería","ITV","Lavado","Seguro","Otros"];

  const activeVId = state.activeVehicleId;
  const myGastos = gastos.filter(g=>!g.vehicleId||g.vehicleId===activeVId);
  const total = myGastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const kmMes = parseFloat((state.vehicles.find(v=>v.id===activeVId)||{}).kmMensuales)||1;
  const byTipo = tipos.map(t=>({t,v:myGastos.filter(g=>g.tipo===t).reduce((s,g)=>s+(parseFloat(g.importe)||0),0)})).filter(x=>x.v>0);
  const maxV = Math.max(...byTipo.map(x=>x.v),1);

  return (
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Gastos</div>
        <button className="btn bg bsm" onClick={()=>{setForm({...form,vehicleId:activeVId});setModal(true);}}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>

      {total>0&&<div className="sgrid">
        <div className="stat"><div className="slbl">Total gastos</div><div className="sval r">{euros(total)}</div></div>
        <div className="stat"><div className="slbl">Gasto/km</div><div className="sval y">{eurosKm(total/kmMes)}</div></div>
      </div>}

      {byTipo.length>0&&<div className="card">
        <div className="chd">Por categoría</div>
        <div className="bwrap">
          {byTipo.sort((a,b)=>b.v-a.v).map(({t,v})=>(
            <div className="brow" key={t}>
              <div className="bmeta"><span>{t}</span><span style={{color:"var(--muted)"}}>{euros(v)}</span></div>
              <div className="btrack"><div className="bfill" style={{width:`${(v/maxV)*100}%`,background:`linear-gradient(90deg,${ACCENTS[state.accentIdx].a1},${ACCENTS[state.accentIdx].a2})`}}/></div>
            </div>
          ))}
        </div>
      </div>}

      {myGastos.length===0?<div className="empty"><div className="ei"><Icon d={I.coin} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin gastos</strong><span style={{fontSize:"0.8rem"}}>Registra combustible, peajes, ITV...</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {[...myGastos].reverse().map((g,ri)=>{
          const i=myGastos.length-1-ri;
          return <div className="trip" key={i}>
            <div className="ttop">
              <div><div className="troute">{g.tipo}</div><div className="tdate">{g.fecha}{g.nota?` · ${g.nota}`:""}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:"1.1rem",color:"var(--red)",letterSpacing:"0.02em"}}>{euros(parseFloat(g.importe))}</span>
                <button className="btn bd bsm" style={{padding:"0.35rem 0.45rem"}} onClick={()=>onDelete(gastos.indexOf(g))}><Icon d={I.trash} size={12}/></button>
              </div>
            </div>
            {g.km&&<div className="trow"><span>📍 {g.km} km (odómetro)</span></div>}
          </div>;
        })}
      </div>}

      {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mdrag"/><div className="mtitle">Nuevo gasto</div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>{tipos.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="fld"><label className="lbl">Importe (€)</label><input className="inp" type="number" placeholder="0,00" value={form.importe} onChange={e=>setForm({...form,importe:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Km odómetro</label><input className="inp" type="number" placeholder="opcional" value={form.km} onChange={e=>setForm({...form,km:e.target.value})}/></div>
          </div>
          <div className="fld"><label className="lbl">Nota</label><input className="inp" placeholder="ej. cambio aceite" value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})}/></div>
          {state.vehicles.length>1&&<div className="fld"><label className="lbl">Vehículo</label>
            <select className="inp sel" value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})}>
              {state.vehicles.map(v=><option key={v.id} value={v.id}>{v.matricula||"Sin matrícula"} {v.apodo?`"${v.apodo}"`:"" }</option>)}
            </select></div>}
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={()=>{if(!form.importe)return;onAdd({...form});setForm({fecha:new Date().toISOString().slice(0,10),tipo:"Combustible",importe:"",km:"",nota:"",vehicleId:state.activeVehicleId});setModal(false);}}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─── VIAJES PAGE ──────────────────────────────────────────────────────────────
function ViajesPage({ viajes, state, onAdd, onDelete }) {
  const [modal, setModal] = useState(false);
  const [vuelta, setVuelta] = useState(false);
  const [form, setForm] = useState({ fecha:new Date().toISOString().slice(0,10), cliente:"", origen:"", destino:"", km:"", peaje:"", precio:"", vehicleId:state.activeVehicleId, kmVuelta:"", kmAuto:false });

  const activeVId = state.activeVehicleId;
  const activeV = state.vehicles.find(v=>v.id===activeVId)||state.vehicles[0];
  const calc = calcConfig(activeV);
  const myViajes = viajes.filter(v=>!v.vehicleId||v.vehicleId===activeVId);

  const calcKmAuto = (o,d) => {
    const km = calcKmBetween(o,d);
    return km;
  };

  const handleOrigenDestino = (field, val) => {
    const newForm = {...form, [field]:val};
    const km = calcKmAuto(newForm.origen, newForm.destino);
    if (km) { newForm.km = String(km); newForm.kmAuto = true; }
    else { newForm.kmAuto = false; }
    setForm(newForm);
  };

  const calcV = v => {
    const km = (parseFloat(v.km)||0) + (parseFloat(v.kmVuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    const coste = km * calc.costeFijoKm + peaje;
    const ben = precio - coste;
    return { coste, ben, margen: precio>0?(ben/precio)*100:0, kmTotal:km };
  };

  return (
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bg bsm" onClick={()=>setModal(true)}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>

      {calc.costeFijoKm===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Configura costes en <strong>Config</strong> para ver la rentabilidad real.</span></div>}

      {myViajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Añade tu primera ruta</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {[...myViajes].reverse().map((v,ri)=>{
          const i=myViajes.length-1-ri;
          const {coste,ben,margen,kmTotal}=calcV(v);
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          return <div className="trip" key={i}>
            <div className="ttop">
              <div><div className="troute">{v.origen||"—"} → {v.destino||"—"}</div>
              <div className="tdate">{v.fecha}{v.cliente?` · ${v.cliente}`:""}</div></div>
              <button className="btn bd bsm" style={{padding:"0.35rem 0.45rem"}} onClick={()=>onDelete(viajes.indexOf(v))}><Icon d={I.trash} size={12}/></button>
            </div>
            <div className="trow">
              <span>📏 {v.km} km ida</span>
              {v.kmVuelta&&<span>↩️ {v.kmVuelta} km vuelta</span>}
              <span>💰 {euros(parseFloat(v.precio))}</span>
              {v.peaje&&parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
            </div>
            {v.kmVuelta&&<div className="tvuelta"><span>↩️ Vuelta sin carga incluida · {kmTotal} km totales</span></div>}
            {calc.costeFijoKm>0&&<div className="tfoot">
              <span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Coste {euros(coste)} · <span style={{color:ben>=0?"var(--green)":"var(--red)"}}>{ben>=0?"+":""}{euros(ben)}</span></span>
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
            <div className="fld"><label className="lbl">Origen</label><input className="inp" placeholder="Ciudad" value={form.origen} onChange={e=>handleOrigenDestino("origen",e.target.value)}/></div>
            <div className="fld"><label className="lbl">Destino</label><input className="inp" placeholder="Ciudad" value={form.destino} onChange={e=>handleOrigenDestino("destino",e.target.value)}/></div>
          </div>
          <div className="fld">
            <label className="lbl">Km de ida {form.kmAuto&&<span style={{color:"var(--green)",fontSize:"0.7rem"}}>· calculado aprox.</span>}</label>
            <input className="inp" type="number" placeholder="0" value={form.km} onChange={e=>setForm({...form,km:e.target.value,kmAuto:false})}/>
          </div>
          <div className="toggle-row">
            <span className="toggle-lbl">↩️ Vuelta sin carga</span>
            <button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/>
          </div>
          {vuelta&&<div className="fld">
            <label className="lbl">Km de vuelta {form.km&&<span style={{color:"var(--muted)",fontSize:"0.7rem"}}>· aprox. {form.km} km</span>}</label>
            <input className="inp" type="number" placeholder={form.km||"0"} value={form.kmVuelta} onChange={e=>setForm({...form,kmVuelta:e.target.value})}/>
          </div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes del viaje (€)</label><input className="inp" type="number" placeholder="0" value={form.peaje} onChange={e=>setForm({...form,peaje:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Precio cobrado (€)</label><input className="inp" type="number" placeholder="0" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></div>
          </div>
          {state.vehicles.length>1&&<div className="fld"><label className="lbl">Vehículo</label>
            <select className="inp sel" value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})}>
              {state.vehicles.map(v=><option key={v.id} value={v.id}>{v.matricula||"Sin matrícula"}</option>)}
            </select></div>}
          <div className="mact">
            <button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn bp" style={{flex:2}} onClick={()=>{
              if(!form.km||!form.precio)return;
              onAdd({...form,kmVuelta:vuelta?(form.kmVuelta||form.km):"",vehicleId:form.vehicleId||activeVId});
              setForm({fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",km:"",peaje:"",precio:"",vehicleId:state.activeVehicleId,kmVuelta:"",kmAuto:false});
              setVuelta(false);setModal(false);
            }}>Guardar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─── RESUMEN PAGE ─────────────────────────────────────────────────────────────
function ResumenPage({ state, gastos, viajes }) {
  const [filtroV, setFiltroV] = useState("all");
  const [vista, setVista] = useState("mensual");

  const activeV = state.vehicles.find(v=>v.id===state.activeVehicleId)||state.vehicles[0];
  const calc = calcConfig(activeV);

  const fViajes = filtroV==="all" ? viajes : viajes.filter(v=>v.vehicleId===filtroV);
  const fGastos = filtroV==="all" ? gastos : gastos.filter(g=>g.vehicleId===filtroV);

  const calcV = v => {
    const veh = state.vehicles.find(x=>x.id===v.vehicleId)||activeV;
    const c = calcConfig(veh);
    const km = (parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0);
    const precio = parseFloat(v.precio)||0;
    const peaje = parseFloat(v.peaje)||0;
    return { coste: km*c.costeFijoKm+peaje, ingreso: precio };
  };

  // Group by month
  const now = new Date();
  const months = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const mv = fViajes.filter(v=>v.fecha&&v.fecha.startsWith(key));
    const mg = fGastos.filter(g=>g.fecha&&g.fecha.startsWith(key));
    const ingresos = mv.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
    const gastoVar = mg.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
    const costeViajes = mv.reduce((s,v)=>s+calcV(v).coste,0);
    const beneficio = ingresos - costeViajes - calc.total;
    months.push({ key, label, ingresos, gastoVar, costeViajes, beneficio, numViajes:mv.length });
  }

  const totalIng = months.reduce((s,m)=>s+m.ingresos,0);
  const totalBen = months.reduce((s,m)=>s+m.beneficio,0);
  const maxIng = Math.max(...months.map(m=>Math.abs(m.ingresos)),1);

  return (
    <div className="page fu">
      <div className="ptitle">Resumen</div>

      {state.vehicles.length>1&&(
        <div style={{display:"flex",gap:"0.375rem",overflowX:"auto",paddingBottom:"0.25rem"}}>
          <button className={`btn bsm ${filtroV==="all"?"bp":"bg"}`} onClick={()=>setFiltroV("all")}>Toda la flota</button>
          {state.vehicles.map(v=>(
            <button key={v.id} className={`btn bsm ${filtroV===v.id?"bp":"bg"}`} onClick={()=>setFiltroV(v.id)} style={{whiteSpace:"nowrap"}}>
              {v.matricula||"Sin mat."} {v.apodo?`"${v.apodo}"`:""}
            </button>
          ))}
        </div>
      )}

      <div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos 6m</div><div className="sval g">{euros(totalIng)}</div></div>
        <div className="stat"><div className="slbl">Beneficio 6m</div><div className={`sval ${totalBen>=0?"g":"r"}`}>{euros(totalBen)}</div></div>
      </div>

      <div className="card">
        <div className="chd">Ingresos por mes</div>
        <div className="mchart">
          {months.map((m,i)=>(
            <div key={i} title={`${m.label}: ${euros(m.ingresos)}`} className="mbar"
              style={{height:`${Math.max((m.ingresos/maxIng)*52,3)}px`,
                background:m.beneficio>=0?`linear-gradient(180deg,${ACCENTS[state.accentIdx].a1},${ACCENTS[state.accentIdx].a1}55)`:"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.375rem"}}>
          {months.map((m,i)=><span key={i} style={{fontSize:"0.6rem",color:"var(--muted)",flex:1,textAlign:"center"}}>{m.label.slice(0,3)}</span>)}
        </div>
      </div>

      <div className="card">
        <div className="chd">Detalle mensual</div>
        <table className="mtable">
          <thead><tr><th>Mes</th><th>Ingresos</th><th>Beneficio</th><th>Viajes</th></tr></thead>
          <tbody>
            {months.map((m,i)=>(
              <tr key={i}>
                <td style={{fontSize:"0.78rem"}}>{m.label}</td>
                <td style={{color:"var(--green)",fontWeight:600,fontSize:"0.78rem"}}>{euros(m.ingresos)}</td>
                <td style={{color:m.beneficio>=0?"var(--green)":"var(--red)",fontWeight:600,fontSize:"0.78rem"}}>{euros(m.beneficio)}</td>
                <td style={{color:"var(--muted)",fontSize:"0.78rem"}}>{m.numViajes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ state, gastos, viajes }) {
  const activeV = state.vehicles.find(v=>v.id===state.activeVehicleId)||state.vehicles[0];
  const calc = calcConfig(activeV);

  const myViajes = viajes.filter(v=>!v.vehicleId||v.vehicleId===activeV.id);
  const myGastos = gastos.filter(g=>!g.vehicleId||g.vehicleId===activeV.id);

  const totalGastos = myGastos.reduce((s,g)=>s+(parseFloat(g.importe)||0),0);
  const totalKm = myViajes.reduce((s,v)=>s+(parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0),0);
  const totalCobrado = myViajes.reduce((s,v)=>s+(parseFloat(v.precio)||0),0);
  const costeKmVar = totalKm>0?totalGastos/totalKm:0;
  const ckt = calc.costeFijoKm+costeKmVar;

  const calcV = v => {
    const km=(parseFloat(v.km)||0)+(parseFloat(v.kmVuelta)||0);
    const precio=parseFloat(v.precio)||0;
    const peaje=parseFloat(v.peaje)||0;
    const coste=km*ckt+peaje;
    const ben=precio-coste;
    return { coste, ben, margen:precio>0?(ben/precio)*100:0 };
  };

  const costeEst = myViajes.reduce((s,v)=>s+calcV(v).coste,0);
  const beneficio = totalCobrado-costeEst;
  const perdida = myViajes.filter(v=>calcV(v).ben<0).length;

  const cMap = {};
  myViajes.forEach(v=>{
    const c=v.cliente||"Sin nombre";
    if(!cMap[c])cMap[c]={ing:0,cost:0};
    cMap[c].ing+=parseFloat(v.precio)||0;
    cMap[c].cost+=calcV(v).coste;
  });
  const clientes = Object.entries(cMap).map(([n,d])=>({n,margen:d.ing>0?((d.ing-d.cost)/d.ing)*100:0})).sort((a,b)=>b.margen-a.margen);

  const chartData = myViajes.slice(-8).map(v=>({lbl:v.destino||"Ruta",ben:calcV(v).ben}));
  const maxBen = Math.max(...chartData.map(d=>Math.abs(d.ben)),1);

  // Alerts
  const alertas = [
    { label:"ITV", fecha:activeV.itv, margin:45 },
    { label:"Seguro", fecha:activeV.seguroVto, margin:30 },
    { label:"Cambio aceite", fecha:activeV.aceite, margin:15 },
    { label:"Tarjeta transporte", fecha:activeV.tarjetaTransp, margin:45 },
  ].filter(a=>a.fecha).map(a=>{
    const days = alertDays(a.fecha);
    const col = alertColor(days, a.margin);
    return {...a, days, col};
  }).filter(a=>a.col==="r"||a.col==="y");

  const hora = new Date().getHours();
  const saludo = hora<12?"Buenos días":"hora<18?Buenas tardes":"Buenas noches";
  const nombre = state.empresa || (activeV.matricula?"":"");

  return (
    <div className="page fu">
      <div className="greet">
        <div className="greet-name">{hora<12?"Buenos días ☀️":hora<18?"Buenas tardes 🌤️":"Buenas noches 🌙"}{nombre?`, ${nombre.split(" ")[0]}`:""}</div>
        <div className="greet-sub">{activeV.apodo?`${activeV.apodo} · `:""}{activeV.matricula||"Configura tu vehículo para empezar"}</div>
      </div>

      {alertas.length>0&&(
        <div className="card">
          <div className="chd">⚠️ Avisos pendientes</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {alertas.map((a,i)=>(
              <div key={i} className={`alert-item ${a.col}`}>
                <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                  <div className={`alert-dot dot-${a.col}`}/>
                  <div>
                    <div style={{fontWeight:600,fontSize:"0.85rem"}}>{a.label}</div>
                    <div style={{fontSize:"0.72rem",color:"var(--muted)"}}>{a.days<0?"Vencido":"Vence en"} {Math.abs(a.days)} días · {a.fecha}</div>
                  </div>
                </div>
                <span className={`badge ${a.col==="r"?"bg-r":"bg-y"}`}>{a.days<0?"Vencido":`${Math.abs(a.days)}d`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!calc.total&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Ve a <strong>Config</strong> e introduce tus costes para activar el dashboard.</span></div>}

      <div className="hcard">
        <div className="hlbl">Coste total por kilómetro</div>
        <div className="hval">{ckt>0?eurosKm(ckt):"—"}</div>
        <div className="hsub">Fijos {eurosKm(calc.costeFijoKm)} · Variables {eurosKm(costeKmVar)}</div>
      </div>

      <div className="sgrid">
        <div className="stat"><div className="slbl">Ingresos</div><div className="sval g">{euros(totalCobrado)}</div></div>
        <div className="stat"><div className="slbl">Beneficio est.</div><div className={`sval ${beneficio>=0?"g":"r"}`}>{euros(beneficio)}</div></div>
        <div className="stat"><div className="slbl">Km totales</div><div className="sval a">{totalKm.toLocaleString("es-ES")}</div></div>
        <div className="stat"><div className="slbl">Viajes</div><div className="sval">{myViajes.length}</div></div>
      </div>

      {perdida>0&&<div className="alert ar"><Icon d={I.alert} size={14} color="var(--red)"/><span><strong>{perdida} viaje{perdida>1?"s":""} en pérdida.</strong> Revisa precios o costes.</span></div>}

      {chartData.length>0&&ckt>0&&<div className="card">
        <div className="chd">Beneficio últimos viajes</div>
        <div className="mchart">
          {chartData.map((d,i)=>(
            <div key={i} title={`${d.lbl}: ${euros(d.ben)}`} className="mbar"
              style={{height:`${Math.max((Math.abs(d.ben)/maxBen)*52,3)}px`,
                background:d.ben>=0?`linear-gradient(180deg,${ACCENTS[state.accentIdx].a1},${ACCENTS[state.accentIdx].a1}55)`:"linear-gradient(180deg,#FF3D5A,#FF3D5A55)"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:"1rem",marginTop:"0.5rem"}}>
          {[["var(--green)","Beneficio"],["var(--red)","Pérdida"]].map(([c,l])=>(
            <span key={l} style={{display:"flex",alignItems:"center",gap:"0.25rem",fontSize:"0.7rem",color:"var(--muted)"}}>
              <span style={{width:7,height:7,borderRadius:2,background:c,display:"inline-block"}}/>{l}
            </span>
          ))}
        </div>
      </div>}

      {clientes.length>0&&<div className="card">
        <div className="chd">Clientes</div>
        {clientes.map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 0",borderBottom:i<clientes.length-1?"1px solid var(--border)":"none"}}>
            <span style={{fontSize:"0.875rem"}}>{i===0?"🏆 ":i===clientes.length-1&&clientes.length>1?"⚠️ ":""}{c.n}</span>
            <span className={`badge ${c.margen>=15?"bg-g":c.margen>=0?"bg-y":"bg-r"}`}>{pct(c.margen)}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(load);
  const [tab, setTab] = useState("dash");
  useEffect(()=>{save(state);},[state]);
  const update = useCallback(patch=>setState(s=>({...s,...patch})),[]);

  const accent = ACCENTS[state.accentIdx||0];

  if (!state.onboarded) return (
    <><style>{makeCSS(accent)}</style>
    <div className="app"><Onboarding onComplete={()=>update({onboarded:true,trialStart:new Date().toISOString(),activeVehicleId:state.vehicles[0]?.id})}/></div></>
  );

  const days = getDaysLeft(state.trialStart);
  const activeV = state.vehicles.find(v=>v.id===state.activeVehicleId)||state.vehicles[0];
  const tabs = [
    {id:"dash",lbl:"Inicio",icon:I.dash},
    {id:"config",lbl:"Config",icon:I.gear},
    {id:"gastos",lbl:"Gastos",icon:I.coin},
    {id:"viajes",lbl:"Viajes",icon:I.truck},
    {id:"resumen",lbl:"Resumen",icon:I.chart},
  ];

  return (
    <><style>{makeCSS(accent)}</style>
    <div className="app">
      <div className="hdr">
        <div className="hdr-left">
          {state.logo
            ? <img src={state.logo} alt="" className="hdr-logo"/>
            : <div className="hdr-logo-placeholder">{(state.empresa||"K").charAt(0).toUpperCase()}</div>}
          <div>
            <div className="hdr-brand">{state.empresa||"KmRentable"}</div>
            <div className="hdr-sub">{activeV?.apodo?`"${activeV.apodo}" · `:""}{activeV?.matricula||"Sin vehículo"}</div>
          </div>
        </div>
        <div className="trial-chip">
          <Icon d={I.clock} size={11} color="var(--muted)"/>
          <span className="chip-d">{days}d</span>
          <span>gratis</span>
        </div>
      </div>

      {tab==="dash"   &&<DashboardPage state={state} gastos={state.gastos} viajes={state.viajes}/>}
      {tab==="config" &&<ConfigPage state={state} update={update}/>}
      {tab==="gastos" &&<GastosPage gastos={state.gastos} state={state} onAdd={g=>update({gastos:[...state.gastos,g]})} onDelete={i=>update({gastos:state.gastos.filter((_,idx)=>idx!==i)})}/>}
      {tab==="viajes" &&<ViajesPage viajes={state.viajes} state={state} onAdd={v=>update({viajes:[...state.viajes,v]})} onDelete={i=>update({viajes:state.viajes.filter((_,idx)=>idx!==i)})}/>}
      {tab==="resumen"&&<ResumenPage state={state} gastos={state.gastos} viajes={state.viajes}/>}

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
