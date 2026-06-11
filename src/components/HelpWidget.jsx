import { useState } from "react";
import { Icon, I } from "../lib/icons.jsx";

const FAQS = [
  {
    keywords: ["vehiculo","camion","tractora","semirremolque","remolque","anadir vehiculo","alta vehiculo","nuevo camion"],
    pregunta: "¿Cómo añado un vehículo (tractora o semirremolque)?",
    respuesta: "Ve a la pestaña Flota y pulsa el botón de añadir (+). Elige si es una tractora o un semirremolque, rellena matrícula, ITV y seguro, y guarda. Si tu plan tiene un límite de vehículos alcanzado, te avisará para cambiar de plan desde Ajustes > Gestionar cuenta.",
  },
  {
    keywords: ["gasto","gastos","ticket","factura","combustible","peaje","mantenimiento"],
    pregunta: "¿Cómo registro un gasto?",
    respuesta: "Desde la pestaña de gastos, pulsa en añadir gasto, elige el vehículo, el tipo (combustible, peaje, mantenimiento, etc.), el importe y la fecha. Puedes adjuntar una foto del ticket o factura.",
  },
  {
    keywords: ["viaje","porte","ruta","ingreso","rentabilidad","beneficio"],
    pregunta: "¿Cómo registro un viaje y veo si es rentable?",
    respuesta: "En la pestaña de viajes, añade un nuevo viaje indicando vehículo, kilómetros e ingreso. La app calcula automáticamente la rentabilidad teniendo en cuenta el combustible, los peajes y los gastos fijos prorrateados de ese vehículo.",
  },
  {
    keywords: ["usuario","chofer","conductor","trafico","empleado","equipo","crear usuario","anadir usuario"],
    pregunta: "¿Cómo doy de alta a un chófer o a una persona de tráfico?",
    respuesta: "Ve a Ajustes > Usuarios. Allí puedes crear un usuario, elegir si es Chófer (ve solo su tractora) o Tráfico (ve todos los viajes), y asignarle un nombre de usuario y contraseña para que entre desde su móvil. El número de usuarios depende de tu plan.",
  },
  {
    keywords: ["plan","precio","tarifa","contratar","activar plan","suscripcion","pago","pagar"],
    pregunta: "¿Cómo activo o cambio de plan?",
    respuesta: "Pulsa en 'Activar plan' (arriba, junto a tu empresa) para ver los planes disponibles y suscribirte. Si ya tienes un plan activo, ese botón se convierte en 'Gestionar cuenta', desde donde puedes cambiar de plan o darte de baja para el siguiente pago.",
  },
  {
    keywords: ["cancelar","baja","darme de baja","dar de baja","cancelar suscripcion"],
    pregunta: "¿Cómo cancelo mi suscripción?",
    respuesta: "Pulsa en 'Gestionar cuenta' (arriba, junto a tu empresa). Se abrirá el portal seguro de Stripe, donde puedes cancelar tu suscripción o cambiar de plan. La baja se aplicará al final del periodo ya pagado.",
  },
  {
    keywords: ["limite","maximo","cuantos vehiculos","cuantos usuarios","cuantas tractoras"],
    pregunta: "¿Cuántos vehículos y usuarios puedo tener con mi plan?",
    respuesta: "Cada plan tiene un límite de tractoras, y el número de usuarios de tráfico permitidos es la mitad de ese límite (redondeando hacia arriba), además de un usuario por chófer. Puedes ver tu uso actual en Ajustes. Si necesitas más, cambia de plan desde 'Gestionar cuenta'.",
  },
  {
    keywords: ["itv","seguro","caducidad","caducado","aviso","alerta","vencimiento"],
    pregunta: "¿Cómo me avisa la app de la ITV o el seguro de un vehículo?",
    respuesta: "Al editar un vehículo en Flota, indica las fechas de ITV y seguro. La app te mostrará un aviso cuando se acerque la fecha de vencimiento, para que puedas renovarlos a tiempo.",
  },
  {
    keywords: ["contraseña","password","recuperar","olvide","acceso","entrar","iniciar sesion"],
    pregunta: "He olvidado mi contraseña, ¿qué hago?",
    respuesta: "En la pantalla de inicio de sesión, pulsa 'He olvidado mi contraseña' e introduce tu email. Te enviaremos un correo para restablecerla. Si eres chófer o tráfico y no tienes email asociado, pide a tu gerente que te restablezca la contraseña desde Ajustes > Usuarios.",
  },
  {
    keywords: ["gestoria","exportar","descargar","resumen mensual","informe"],
    pregunta: "¿Cómo saco el resumen para mi gestoría?",
    respuesta: "En la pestaña de Análisis puedes consultar y exportar el resumen de gastos e ingresos por vehículo y por periodo, listo para enviar a tu gestoría.",
  },
];

function normalizar(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const ASUNTO = encodeURIComponent("Ayuda con FlotaRentable");

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [abierta, setAbierta] = useState(null);

  const buscar = normalizar(query.trim());
  const resultados = buscar.length < 2 ? [] : FAQS.filter(f =>
    f.keywords.some(k => normalizar(k).includes(buscar) || buscar.includes(normalizar(k)))
    || normalizar(f.pregunta).includes(buscar)
  );

  return (
    <>
      <button
        className="btn bp"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: "1.25rem", bottom: "1.25rem", zIndex: 60,
          width: 48, height: 48, borderRadius: "50%", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
        }}
        aria-label="Ayuda"
      >
        <Icon d={I.help} size={22} />
      </button>

      {open && (
        <div className="ov" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div className="mdrag" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div className="mtitle" style={{ margin: 0 }}>¿En qué podemos ayudarte?</div>
              <button className="btn bg bsm" onClick={() => setOpen(false)} style={{ padding: "0.35rem 0.6rem", width: "auto" }}>✕</button>
            </div>
            <input
              className="inp"
              placeholder="Escribe tu duda, ej: cómo añado un vehículo"
              value={query}
              onChange={e => { setQuery(e.target.value); setAbierta(null); }}
              autoFocus
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
              {buscar.length >= 2 && resultados.length === 0 && (
                <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>No hemos encontrado nada sobre eso.</p>
              )}
              {(buscar.length < 2 ? FAQS : resultados).map((f, i) => (
                <div key={i} className="card" style={{ padding: "0.75rem" }}>
                  <div
                    style={{ fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                    onClick={() => setAbierta(abierta === i ? null : i)}
                  >
                    {f.pregunta}
                  </div>
                  {abierta === i && (
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", marginBottom: 0, lineHeight: 1.6 }}>
                      {f.respuesta}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
              ¿No has encontrado lo que buscabas? Escríbenos y te ayudamos.
            </p>
            <a className="btn bg" href={`mailto:contacto@flotarentable.com?subject=${ASUNTO}`}>
              <Icon d={I.help} size={14} /> Escribir a contacto@flotarentable.com
            </a>
          </div>
        </div>
      )}
    </>
  );
}
