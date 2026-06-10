import { Icon, I } from "../lib/icons.jsx";

export function LandingPage({accent,onLogin,onRegister}) {
  const feats=[
    {icon:I.trend,col:"#FF3D5A",t:"Rentabilidad real por km",s:"Calcula automáticamente cuánto te cuesta y cuánto ganas en cada viaje, incluyendo gasoil, peajes y gastos fijos prorrateados."},
    {icon:I.truck,col:"#06D6A0",t:"Gestión de flota completa",s:"Tractoras, semirremolques y conjuntos, con consumo histórico, ITV, seguros y mantenimiento al día."},
    {icon:I.coin,col:"#FFD166",t:"Gastos al día",s:"Registra combustible, peajes, dietas y reparaciones en segundos, escaneando el ticket con la cámara."},
    {icon:I.chart,col:"#5B8CFF",t:"Resumen mensual y anual",s:"Informes listos para tu gestoría, con IVA desglosado y exportación a Excel."},
    {icon:I.clock,col:"#FF3D5A",t:"Alertas inteligentes",s:"Avisa de anomalías de consumo, ITV próximas a caducar y vencimientos importantes."},
    {icon:I.user,col:"#06D6A0",t:"Equipo conectado",s:"Gerentes, tráfico y choferes ven la información que necesitan, en tiempo real, desde el móvil."},
  ];

  const reviews=[
    {n:"Antonio Ramírez",r:"Autónomo, tractora 1330MMM",t:"Llevaba años apuntando los gastos en una libreta y nunca sabía si un viaje merecía la pena. Con FlotaRentable veo el beneficio neto al momento, descontando hasta los gastos fijos.",init:"AR",col:"#FF3D5A"},
    {n:"Rocío Fernández",r:"Gerente, Transportes Fernández S.L.",t:"Tengo 6 tractoras y antes perdía media tarde cada mes haciendo el Excel para la gestoría. Ahora exporto el resumen con el IVA desglosado en dos clics.",init:"RF",col:"#06D6A0"},
    {n:"Manuel Ortega",r:"Chófer, ruta nacional",t:"Desde el móvil registro el viaje, la carga y el ticket de gasoil con la cámara. Mi jefe ve todo en tiempo real y a mí me ahorra muchísimo papeleo.",init:"MO",col:"#5B8CFF"},
    {n:"Lucía Navarro",r:"Tráfico, flota de 12 camiones",t:"Lo que más nos ha cambiado es la alerta de consumo: detectó una tractora gastando un 15% más de lo normal y resultó ser una avería que no habíamos visto.",init:"LN",col:"#FFD166"},
  ];

  const css=`
  *{box-sizing:border-box}
  body{margin:0}
  .lp{font-family:'Plus Jakarta Sans',sans-serif;background:#08080F;color:#EEEDF5;min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  .lp-nav{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;max-width:1100px;margin:0 auto}
  .lp-logo{display:flex;align-items:center;gap:0.6rem;font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:0.08em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .lp-logo-ph{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .lp-navlinks{display:flex;gap:1.75rem}
  .lp-navlinks a{color:#C7C7DA;text-decoration:none;font-size:0.85rem;font-weight:600;transition:color .15s}
  .lp-navlinks a:hover{color:#EEEDF5}
  .lp-navbtns{display:flex;gap:0.6rem}
  @media(max-width:860px){.lp-navlinks{display:none}}
  .lp-btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.85rem;border:none;border-radius:10px;padding:0.7rem 1.3rem;cursor:pointer;transition:all .15s}
  .lp-btn-ghost{background:#ffffff10;color:#EEEDF5;border:1px solid #ffffff18}
  .lp-btn-ghost:hover{border-color:#ffffff35}
  .lp-btn-pri{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff;box-shadow:0 8px 24px -8px ${accent.a1}80}
  .lp-btn-pri:hover{filter:brightness(1.08)}
  .lp-hero{position:relative;text-align:center;padding:5.5rem 1.5rem 4rem;max-width:860px;margin:0 auto;overflow:hidden}
  .lp-glow{position:absolute;top:-220px;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle,${accent.a1}40,transparent 60%);pointer-events:none;z-index:0;animation:lp-pulse 6s ease-in-out infinite}
  .lp-glow2{position:absolute;bottom:-260px;right:-120px;width:560px;height:560px;background:radial-gradient(circle,#FFD16630,transparent 65%);pointer-events:none;z-index:0}
  @keyframes lp-pulse{0%,100%{opacity:0.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
  .lp-hero>*{position:relative;z-index:1}
  .lp-hero>.lp-glow,.lp-hero>.lp-glow2{position:absolute;z-index:0}
  .lp-tag{display:inline-flex;align-items:center;gap:0.4rem;background:#ffffff0D;border:1px solid #ffffff18;border-radius:999px;padding:0.45rem 1rem;font-size:0.8rem;font-weight:600;color:#EEEDF5;margin-bottom:1.75rem;box-shadow:0 0 30px -8px ${accent.a1}80}
  .lp-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,9vw,5.6rem);line-height:1.02;letter-spacing:0.02em;text-shadow:0 0 60px ${accent.a1}30}
  .lp-h1 span{background:linear-gradient(135deg,${accent.a1},#FFD166);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .lp-sub{font-size:1.15rem;color:#C7C7DA;line-height:1.7;max-width:580px;margin:1.5rem auto 2.25rem}
  .lp-ctas{display:flex;gap:0.85rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem}
  .lp-ctas .lp-btn{padding:1.05rem 2.1rem;font-size:1rem}
  .lp-ctas .lp-btn-pri{box-shadow:0 12px 36px -10px ${accent.a1}}
  .lp-stats{display:flex;justify-content:center;gap:2.5rem;flex-wrap:wrap}
  .lp-stat-num{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.02em;background:linear-gradient(135deg,${accent.a1},#FFD166);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .lp-stat-lbl{font-size:0.75rem;color:#8A8AA2;margin-top:0.15rem}
  .lp-mock{max-width:1100px;margin:0 auto;padding:0 1.5rem 5rem;display:flex;justify-content:center;position:relative;z-index:1}
  .lp-mock-card{background:linear-gradient(160deg,#1c1c2c,#0B0B14);border:1px solid #ffffff18;border-radius:24px;padding:1.75rem;width:100%;max-width:760px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;box-shadow:0 40px 100px -30px ${accent.a1}40,0 0 0 1px #ffffff08}
  .lp-mock-stat{background:#ffffff08;border:1px solid #ffffff10;border-radius:14px;padding:1.1rem}
  .lp-mock-lbl{font-size:0.65rem;font-weight:700;color:#8A8AA2;text-transform:uppercase;letter-spacing:0.08em}
  .lp-mock-val{font-family:'Bebas Neue',sans-serif;font-size:2.1rem;letter-spacing:0.02em;margin-top:0.25rem}
  .lp-section{max-width:1100px;margin:0 auto;padding:3.5rem 1.5rem}
  .lp-section-h{text-align:center;max-width:600px;margin:0 auto 2.5rem}
  .lp-section-h h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:0.03em}
  .lp-section-h p{color:#8A8AA2;margin-top:0.6rem;font-size:0.95rem;line-height:1.6}
  .lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.1rem}
  .lp-feat{background:#15151F;border:1px solid #ffffff10;border-radius:18px;padding:1.5rem;transition:border-color .2s,transform .2s}
  .lp-feat:hover{border-color:#ffffff28;transform:translateY(-3px)}
  .lp-feat-ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}
  .lp-feat h3{font-size:1.05rem;margin-bottom:0.4rem}
  .lp-feat p{font-size:0.85rem;color:#8A8AA2;line-height:1.6}
  .lp-pricing{background:linear-gradient(160deg,#15151F,#0B0B14);border:1px solid #ffffff14;border-radius:24px;max-width:420px;margin:0 auto;padding:2.25rem 2rem;text-align:center}
  .lp-price{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;letter-spacing:0.02em;background:linear-gradient(135deg,${accent.a1},#FFD166);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .lp-price-sub{color:#8A8AA2;font-size:0.85rem;margin-bottom:1.5rem}
  .lp-pricing ul{list-style:none;padding:0;margin:1.5rem 0;text-align:left;display:flex;flex-direction:column;gap:0.7rem}
  .lp-pricing li{display:flex;align-items:flex-start;gap:0.6rem;font-size:0.88rem;color:#EEEDF5}
  .lp-rev{background:#15151F;border:1px solid #ffffff10;border-radius:18px;padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
  .lp-rev-stars{color:#FFD166;font-size:0.95rem;letter-spacing:0.15em}
  .lp-rev p{font-size:0.9rem;color:#C7C7DA;line-height:1.65}
  .lp-rev-who{display:flex;align-items:center;gap:0.7rem;margin-top:0.25rem}
  .lp-rev-av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#fff;flex-shrink:0}
  .lp-rev-name{font-size:0.85rem;font-weight:700}
  .lp-rev-role{font-size:0.72rem;color:#8A8AA2}
  .lp-foot{text-align:center;padding:2.5rem 1.5rem;color:#5A5A72;font-size:0.8rem;border-top:1px solid #ffffff0D;margin-top:1rem}
  @media(max-width:640px){.lp-navbtns .lp-btn-ghost{display:none}}
  `;

  return(
    <div className="lp">
      <style>{css}</style>
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-ph"><svg width="18" height="18" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
          FlotaRentable
        </div>
        <div className="lp-navlinks">
          <a href="#funciones">Funciones</a>
          <a href="#precios">Precios</a>
          <a href="#nosotros">Quiénes somos</a>
          <a href="#contacto">Contacto</a>
        </div>
        <div className="lp-navbtns">
          <button className="lp-btn lp-btn-ghost" onClick={onLogin}>Acceder</button>
          <button className="lp-btn lp-btn-pri" onClick={onRegister}>Empezar gratis</button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-glow"/>
        <div className="lp-glow2"/>
        <h1 className="lp-h1">Descubre exactamente<br/><span>cuánto ganas</span> en cada kilómetro</h1>
        <p className="lp-sub">FlotaRentable calcula la rentabilidad real de tu flota: combustible, peajes, gastos fijos e IVA, viaje a viaje y mes a mes. Todo desde el móvil.</p>
        <div className="lp-ctas">
          <button className="lp-btn lp-btn-pri" onClick={onRegister}>Empezar gratis 7 días <Icon d={I.arrow} size={15} color="#fff"/></button>
          <button className="lp-btn lp-btn-ghost" onClick={onLogin}>Ya tengo cuenta</button>
        </div>
        <div className="lp-stats">
          <div><div className="lp-stat-num">0,62€</div><div className="lp-stat-lbl">coste medio por km</div></div>
          <div><div className="lp-stat-num">7 días</div><div className="lp-stat-lbl">de prueba gratis</div></div>
          <div><div className="lp-stat-num">100%</div><div className="lp-stat-lbl">listo para tu gestoría</div></div>
        </div>
      </header>

      <div className="lp-mock">
        <div className="lp-mock-card">
          <div className="lp-mock-stat"><div className="lp-mock-lbl">Beneficio del mes</div><div className="lp-mock-val" style={{color:"#06D6A0"}}>+3.240€</div></div>
          <div className="lp-mock-stat"><div className="lp-mock-lbl">€/km flota</div><div className="lp-mock-val">1,17€</div></div>
          <div className="lp-mock-stat"><div className="lp-mock-lbl">Coste/km</div><div className="lp-mock-val" style={{color:"#FFD166"}}>0,62€</div></div>
          <div className="lp-mock-stat"><div className="lp-mock-lbl">Km recorridos</div><div className="lp-mock-val">9.840</div></div>
        </div>
      </div>

      <section className="lp-section" id="funciones">
        <div className="lp-section-h">
          <h2>Todo lo que necesitas para llevar tu negocio</h2>
          <p>Desde el primer viaje hasta el cierre del mes para tu gestoría, sin hojas de cálculo.</p>
        </div>
        <div className="lp-grid">
          {feats.map((f,i)=>(
            <div className="lp-feat" key={i}>
              <div className="lp-feat-ic" style={{background:`${f.col}18`}}><Icon d={f.icon} size={20} color={f.col}/></div>
              <h3>{f.t}</h3>
              <p>{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="precios">
        <div className="lp-section-h">
          <h2>Precio simple, sin sorpresas</h2>
          <p>Prueba gratis, sin tarjeta. Cancela cuando quieras.</p>
        </div>
        <div className="lp-pricing">
          <div className="lp-price">14,99€<span style={{fontSize:"1rem",color:"#8A8AA2"}}>/mes</span></div>
          <div className="lp-price-sub">Por empresa, tractoras y usuarios ilimitados</div>
          <ul>
            <li>✅ Gestión completa de flota y viajes</li>
            <li>✅ Cálculo de rentabilidad por km y por viaje</li>
            <li>✅ Control de gastos con escaneo de tickets</li>
            <li>✅ Exportación para tu gestoría con IVA</li>
            <li>✅ Acceso para chóferes y tráfico</li>
          </ul>
          <button className="lp-btn lp-btn-pri" style={{width:"100%"}} onClick={onRegister}>Empezar 7 días gratis</button>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-h">
          <h2>Lo que dicen nuestros clientes</h2>
          <p>Transportistas y empresas que ya controlan su rentabilidad con FlotaRentable.</p>
        </div>
        <div className="lp-grid">
          {reviews.map((r,i)=>(
            <div className="lp-rev" key={i}>
              <div className="lp-rev-stars">★★★★★</div>
              <p>"{r.t}"</p>
              <div className="lp-rev-who">
                <div className="lp-rev-av" style={{background:r.col}}>{r.init}</div>
                <div><div className="lp-rev-name">{r.n}</div><div className="lp-rev-role">{r.r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="nosotros">
        <div className="lp-section-h">
          <h2>Quiénes somos</h2>
          <p>FlotaRentable nace en España de la mano de gente del sector del transporte, cansada de llevar las cuentas en libretas y hojas de cálculo sueltas.</p>
        </div>
        <div className="lp-grid">
          <div className="lp-feat">
            <h3>Nuestro origen</h3>
            <p>Empezamos ayudando a un pequeño grupo de autónomos y empresas de transporte a controlar sus números reales: cuánto cuesta cada km y cuánto deja cada viaje. Vimos que nadie tenía esa información clara y decidimos construir la herramienta que a nosotros nos hubiera gustado tener.</p>
          </div>
          <div className="lp-feat">
            <h3>Nuestra misión</h3>
            <p>Que cualquier transportista, autónomo o empresa con flota propia pueda tomar decisiones con datos reales: qué clientes son rentables, qué camiones cuestan más de la cuenta y cuánto queda al final del mes después de todos los gastos.</p>
          </div>
          <div className="lp-feat">
            <h3>Cómo trabajamos</h3>
            <p>Escuchamos cada sugerencia de nuestros usuarios y mejoramos la app constantemente: nuevas funciones, ajustes de cálculo y mejoras de diseño basadas en el uso real, día a día, de gerentes, tráfico y chóferes.</p>
          </div>
        </div>
      </section>

      <section className="lp-section" id="contacto">
        <div className="lp-section-h">
          <h2>Contacto</h2>
          <p>¿Tienes dudas o quieres que te ayudemos a empezar? Escríbenos.</p>
        </div>
        <div className="lp-pricing">
          <div style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"0.5rem"}}>📧 soporte@kmrentable.com</div>
          <div style={{fontSize:"0.85rem",color:"#8A8AA2",marginBottom:"1.5rem"}}>Te respondemos en menos de 24h laborables.</div>
          <button className="lp-btn lp-btn-pri" style={{width:"100%"}} onClick={onRegister}>Empezar 7 días gratis</button>
        </div>
      </section>

      <footer className="lp-foot">
        © {new Date().getFullYear()} FlotaRentable · Hecho para el transporte por carretera en España
      </footer>
    </div>
  );
}
