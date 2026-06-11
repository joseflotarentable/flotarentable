import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";

export function PaywallPage({ userId, esGerente, onLogout, onClose, expired }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const elegir = async (plan) => {
    setError(""); setLoading(plan);
    const { data, error } = await sb.functions.invoke("create-checkout-session", { body: { userId, plan } });
    setLoading(null);
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
              ? "Para seguir usando FlotaRentable, elige un plan y continua sin interrupciones."
              : "Te quedan pocos dias de prueba. Elige un plan para no perder acceso a tus datos."}
          </p>
          {error && <p style={{fontSize:"0.78rem",color:"var(--red)",marginBottom:"0.5rem"}}>{error}</p>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
            <button className="btn bp" onClick={()=>elegir("mensual")} disabled={loading!==null}>
              {loading==="mensual"?<span className="spinner"/>:"Plan mensual — 14,99€/mes"}
            </button>
            <button className="btn bg" onClick={()=>elegir("anual")} disabled={loading!==null}>
              {loading==="anual"?<span className="spinner"/>:"Plan anual — 150€/año (ahorra 2 meses)"}
            </button>
          </div>
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
