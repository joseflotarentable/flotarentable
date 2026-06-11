import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { PLANES } from "../lib/constants.js";

export function PaywallPage({ userId, perfil, updatePerfil, esGerente, onLogout, onClose, expired }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoCodigo, setPromoCodigo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [aplicandoPromo, setAplicandoPromo] = useState(false);

  const plan = PLANES.find(p => p.id === perfil?.plan) || PLANES[0];

  const suscribirse = async () => {
    setError(""); setLoading(true);
    const { data, error } = await sb.functions.invoke("create-checkout-session", { body: { userId, plan: plan.id } });
    setLoading(false);
    if (error || !data?.url) { setError("No se ha podido iniciar el pago. Intentalo de nuevo."); return; }
    window.location.href = data.url;
  };

  const canjearPromo = async () => {
    setPromoMsg("");
    if (!promoCodigo.trim()) { setPromoMsg("Introduce un codigo"); return; }
    setAplicandoPromo(true);
    const { data, error } = await sb.rpc("canjear_codigo_promo", { p_codigo: promoCodigo.trim().toUpperCase() });
    setAplicandoPromo(false);
    const res = Array.isArray(data) ? data[0] : data;
    if (error || !res?.ok) { setPromoMsg(res?.mensaje || "No se pudo aplicar el codigo"); return; }
    setPromoMsg(`✅ ${res.mensaje}: ${res.meses} mes${res.meses === 1 ? "" : "es"} gratis`);
    if (updatePerfil) updatePerfil({ acceso_hasta: new Date(Date.now() + res.meses * 30 * 24 * 60 * 60 * 1000).toISOString() });
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="page fu" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"1.5rem"}}>
      <div className="card" style={{maxWidth:420,width:"100%"}}>
        <div className="chd">{expired ? "Tu periodo de prueba ha terminado" : "Continua con FlotaRentable"}</div>
        {esGerente ? (<>
          <p style={{fontSize:"0.85rem",color:"var(--muted)",marginBottom:"1rem"}}>
            {expired
              ? "Para seguir usando FlotaRentable, activa tu plan y continua sin interrupciones."
              : "Te quedan pocos dias de prueba. Activa tu plan para no perder acceso a tus datos."}
          </p>
          {error && <p style={{fontSize:"0.78rem",color:"var(--red)",marginBottom:"0.5rem"}}>{error}</p>}
          <div style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"1rem",marginBottom:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:"0.95rem"}}>Plan {plan.nombre} — {plan.rango}</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,marginTop:"0.25rem"}}>{plan.precio}</div>
          </div>
          <button className="btn bp" onClick={suscribirse} disabled={loading}>
            {loading?<span className="spinner"/>:"Suscribirme"}
          </button>
          <div style={{height:1,background:"var(--border)",margin:"1rem 0"}}/>
          <div style={{fontSize:"0.8rem",fontWeight:700,marginBottom:"0.4rem"}}>¿Tienes un codigo promocional?</div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <input className="inp" placeholder="Codigo" value={promoCodigo} onChange={e=>setPromoCodigo(e.target.value)} style={{flex:1}}/>
            <button className="btn bg" style={{width:"auto"}} onClick={canjearPromo} disabled={aplicandoPromo}>{aplicandoPromo?<span className="spinner"/>:"Canjear"}</button>
          </div>
          {promoMsg && <p style={{fontSize:"0.78rem",color:promoMsg.startsWith("✅")?"var(--green)":"var(--red)",marginTop:"0.5rem"}}>{promoMsg}</p>}
        </>) : (
          <p style={{fontSize:"0.85rem",color:"var(--muted)",marginBottom:"1rem"}}>
            El periodo de prueba de tu empresa ha terminado. Pide a tu gerente que active un plan para poder seguir usando FlotaRentable.
          </p>
        )}
        {!expired && onClose && <button className="btn bg" style={{marginTop:"0.6rem"}} onClick={onClose}>Seguir con la prueba</button>}
        <button className="btn bg" style={{marginTop:"0.6rem"}} onClick={onLogout}><Icon d={I.logout} size={14}/> Cerrar sesion</button>
      </div>
    </div>
  );
}
