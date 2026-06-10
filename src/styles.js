export const makeCSS = accent => `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#08080F;--s1:#0F0F1A;--s2:#15151F;--s3:#1C1C28;--border:#ffffff0D;--border2:#ffffff18;--border3:#ffffff28;--a1:${accent.a1};--a2:${accent.a2};--green:#06D6A0;--red:#FF3D5A;--yellow:#FFD166;--text:#EEEDF5;--muted:#8A8AA2;--muted2:#5A5A72;--r:16px;--r2:12px;}
[data-theme="light"]{--bg:#F4F5FA;--s1:#FFFFFF;--s2:#F0F1F7;--s3:#E6E8F0;--border:#00000012;--border2:#0000001E;--border3:#00000030;--text:#15151F;--muted:#6B6B80;--muted2:#9494A6;}
body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;transition:background 0.2s,color 0.2s}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
@media (min-width:700px) and (max-width:899px){
  body{display:flex;justify-content:center;align-items:flex-start;background:radial-gradient(circle at 50% 0%,#15151f 0%,#08080F 60%);}
  [data-theme="light"] body{background:radial-gradient(circle at 50% 0%,#ffffff 0%,#dde1ec 60%);}
  .app{max-width:430px;width:430px;min-height:100vh;box-shadow:0 0 0 1px var(--border),0 30px 80px -20px rgba(0,0,0,0.6);background:var(--bg);}
  .nav,.modal{max-width:430px;}
}
@media (min-width:900px){
  body{background:radial-gradient(circle at 50% 0%,#15151f 0%,#08080F 60%);}
  [data-theme="light"] body{background:radial-gradient(circle at 50% 0%,#ffffff 0%,#dde1ec 60%);}
  .app{max-width:1300px;width:100%;margin:0 auto;flex-direction:row;min-height:100vh;align-items:stretch}
  .main{flex:1;display:flex;flex-direction:column;min-width:0}
  .nav{position:sticky;top:0;left:0;flex-direction:column;justify-content:flex-start;align-items:stretch;width:220px;flex-shrink:0;height:100vh;max-width:none;transform:none;grid-template-columns:none;border-top:none;border-right:1px solid var(--border);background:var(--s1);padding:1.5rem 0.75rem;gap:0.25rem;backdrop-filter:none}
  .nb{flex-direction:row;justify-content:flex-start;gap:0.875rem;padding:0.7rem 0.875rem;font-size:0.85rem;border-radius:10px}
  .nb.on{background:var(--s2)}
  .nb.on::after{display:none}
  .page{padding:1.5rem 2.5rem;padding-bottom:2.5rem;max-width:1080px;margin:0 auto;width:100%}
  .modal{max-width:480px;margin:2rem auto;border-radius:var(--r);padding-bottom:2rem;flex:none;max-height:calc(100vh - 4rem);overflow-y:auto}
  .ov{align-items:flex-start;justify-content:center;background:#000a}
  .sgrid{grid-template-columns:repeat(2,1fr)}
  .page{max-width:760px}
}

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
@keyframes toast-in{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.25s ease both}
`;
