import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { PLANES } from "../lib/constants.js";

export function PaywallPage({ userId, perfil, esGerente, onLogout, onClose, expired }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [planId, setPlanId] = useState(perfil?.plan || PLANES[0].id);
  const plan = PLANES.find(p => p.id === planId) || PLANES[0];

  const suscribirse = async () => {
    setError(""); setLoading(true);
    const { data, error } = await sb.functions.invoke("create-checkout-session", { body: { userId, plan: plan.id } });
    setLoading(false);
    if (error || !data?.url) { setError("No se ha podido iniciar el pago. Intentalo de nuevo."); return; }
    window.location.href = data.url;
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
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"0.75rem"}}>
            {PLANES.map(p => (
              <div
                key={p.id}
                onClick={() => setPlanId(p.id)}
                style={{
                  background:"var(--s2)",
                  border: p.id===planId ? "2px solid var(--accent)" : "1px solid var(--border2)",
                  borderRadius:"var(--r2)",
                  padding:"1rem",
                  cursor:"pointer",
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center"
                }}
              >
                <div>
                  <div style={{fontWeight:700,fontSize:"0.95rem"}}>{p.nombre} — {p.rango}</div>
                  <div style={{fontSize:"1.2rem",fontWeight:700,marginTop:"0.25rem"}}>{p.precio}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn bp" onClick={suscribirse} disabled={loading}>
            {loading?<span className="spinner"/>:"Suscribirme"}
          </button>
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
