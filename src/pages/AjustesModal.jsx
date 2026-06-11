import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { ACCENTS, PLANES } from "../lib/constants.js";
import { genCode } from "../lib/helpers.js";
import { InputGuardado, PhotoUpload } from "../components/ui.jsx";
import { UsuariosModal } from "./UsuariosModal.jsx";

export function AjustesModal({userId,perfil,updatePerfil,onClose,onLogout,tractoras,theme,setTheme,clientesTodos,setClientesTodos}) {
  const[nuevoCliente,setNuevoCliente]=useState({nombre:"",cif:"",contacto:"",tarifa_km:""});
  const[clienteMsg,setClienteMsg]=useState("");
  const[codigo,setCodigo]=useState("");
  const[copied,setCopied]=useState(false);
  const[passMsg,setPassMsg]=useState("");
  const[enviandoOtp,setEnviandoOtp]=useState(false);
  const[numMiembros,setNumMiembros]=useState(1);
  const[empresaGerente,setEmpresaGerente]=useState(null);
  const[abriendoPortal,setAbriendoPortal]=useState(false);
  const[portalMsg,setPortalMsg]=useState("");
  const[showUsuarios,setShowUsuarios]=useState(false);

  const plan=PLANES.find(p=>p.id===perfil.plan)||PLANES[0];
  const planLimite=plan.id==="flota"?(perfil.tractoras_contratadas||10):plan.maxTractoras;
  const tractorasActivas=(tractoras||[]).filter(t=>t.activa!==false).length;

  useEffect(()=>{
    if(perfil.rol==="chofer"&&perfil.empresa_id){
      // Cargar datos de la empresa del gerente para el chofer
      sb.from("empresas").select("gerente_id,codigo,miembros").eq("id",perfil.empresa_id).single().then(async({data:emp})=>{
        if(emp?.gerente_id){
          const{data:gp}=await sb.from("perfiles").select("nombre,empresa,logo").eq("id",emp.gerente_id).single();
          if(gp)setEmpresaGerente(gp);
        }
      });
    } else if(perfil.empresa_id){
      sb.from("empresas").select("codigo,miembros").eq("id",perfil.empresa_id).single().then(({data})=>{
        if(data?.codigo)setCodigo(data.codigo);
        if(data?.miembros)setNumMiembros(data.miembros.length);
      });
    } else {
      sb.from("empresas").select("id,codigo,miembros").eq("gerente_id",userId).single().then(async({data:emp})=>{
        if(emp){
          await sb.from("perfiles").update({empresa_id:emp.id}).eq("id",userId);
          updatePerfil({empresa_id:emp.id});
          setCodigo(emp.codigo);
          if(emp.miembros)setNumMiembros(emp.miembros.length);
        }
      });
    }
  },[]);

  const saveAjustes=async patch=>{await sb.from("perfiles").update(patch).eq("id",userId);updatePerfil(patch);};
  const pedirCambioPass=async()=>{
    setPassMsg("");
    if(!perfil.email){setPassMsg("Tu cuenta no tiene un email asociado");return;}
    setEnviandoOtp(true);
    const{error}=await sb.auth.resetPasswordForEmail(perfil.email);
    setEnviandoOtp(false);
    if(error){setPassMsg("Error al enviar el correo: "+error.message);return;}
    setPassMsg(`✅ Te hemos enviado un correo a ${perfil.email} con un enlace para cambiar tu contraseña.`);
  };

  const crearCliente=async()=>{
    if(!nuevoCliente.nombre.trim()){setClienteMsg("Pon un nombre para el cliente");return;}
    const payload={nombre:nuevoCliente.nombre.trim(),cif:nuevoCliente.cif.trim()||null,contacto:nuevoCliente.contacto.trim()||null,tarifa_km:nuevoCliente.tarifa_km?parseFloat(nuevoCliente.tarifa_km):null,user_id:String(userId)};
    const{data,error}=await sb.from("clientes").insert(payload).select();
    if(error){setClienteMsg("Error: "+error.message);return;}
    const nuevo=Array.isArray(data)?data[0]:data;
    if(nuevo&&setClientesTodos)setClientesTodos(cs=>[...cs,nuevo].sort((a,b)=>a.nombre.localeCompare(b.nombre)));
    setNuevoCliente({nombre:"",cif:"",contacto:"",tarifa_km:""});
    setClienteMsg("✅ Cliente añadido");
  };
  const eliminarCliente=async id=>{
    await sb.from("clientes").delete().eq("id",id);
    if(setClientesTodos)setClientesTodos(cs=>cs.filter(c=>c.id!==id));
  };

  return(
    <div className="ov">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxHeight:"92vh",overflowY:"auto"}}>
        <div className="mdrag"/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.25rem"}}>
          <div className="mtitle" style={{margin:0}}>Ajustes</div>
          <button className="btn bg bsm" onClick={onClose} style={{padding:"0.35rem 0.6rem",width:"auto"}}>✕</button>
        </div>
        {perfil.rol==="chofer"?(
          <div className="card">
            <div className="chd">Mi empresa</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              {empresaGerente?.logo&&<img src={empresaGerente.logo} alt="Logo" style={{height:56,objectFit:"contain",borderRadius:8,background:"var(--s3)",padding:"0.4rem"}}/>}
              <div style={{fontWeight:700,fontSize:"1rem"}}>{empresaGerente?.empresa||empresaGerente?.nombre||"—"}</div>
              <div style={{fontSize:"0.75rem",color:"var(--muted)"}}>Gestionada por {empresaGerente?.nombre||"el gerente"}</div>
              <div style={{height:1,background:"var(--border)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.78rem",color:"var(--muted)"}}>Tractoras activas</span>
                <span style={{fontSize:"0.78rem",fontWeight:700}}>{tractorasActivas}</span>
              </div>
            </div>
          </div>
        ):(
          <div className="card">
            <div className="chd">Tu empresa</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              <div className="fld"><label className="lbl">Nombre / Empresa</label><InputGuardado valor={perfil.empresa||""} placeholder="Transportes Garcia S.L." onGuardar={v=>saveAjustes({empresa:v})}/></div>
              <div className="fld"><label className="lbl">Tu nombre</label><InputGuardado valor={perfil.nombre||""} placeholder="Jose Garcia" onGuardar={v=>saveAjustes({nombre:v})}/></div>
              <PhotoUpload value={perfil.logo} onChange={v=>saveAjustes({logo:v})} label="Logo empresa" height={80}/>
              <div style={{height:1,background:"var(--border)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.78rem",color:"var(--muted)"}}>Tractoras activas</span>
                <span style={{fontSize:"0.78rem",fontWeight:700,color:tractorasActivas>=planLimite?"var(--red)":"var(--text)"}}>{tractorasActivas} / {planLimite===Infinity?"∞":planLimite}</span>
              </div>
              <div style={{height:4,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((tractorasActivas/Math.max(planLimite===Infinity?tractorasActivas||1:planLimite,1))*100,100)}%`,background:tractorasActivas>=planLimite?"var(--red)":"var(--a1)",borderRadius:2,transition:"width 0.3s"}}/>
              </div>
              <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>Plan {plan.nombre} · {planLimite===Infinity?"tractoras ilimitadas":`hasta ${planLimite} tractora${planLimite!==1?"s":""}`}</div>
            </div>
          </div>
        )}
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">Codigo para choferes</div>
          <p style={{fontSize:"0.82rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Comparte este codigo con tus choferes:</p>
          {codigo
            ?<div className="code-box"><div className="code-text">{codigo}</div><button className="btn bg bsm" onClick={()=>{navigator.clipboard?.writeText(codigo);setCopied(true);setTimeout(()=>setCopied(false),2000);}}><Icon d={I.copy} size={14}/>{copied?"Copiado!":"Copiar"}</button></div>
            :<button className="btn bp" onClick={async()=>{
              const{data:existing}=await sb.from("empresas").select("id,codigo,miembros").eq("gerente_id",userId).single();
              if(existing){await sb.from("perfiles").update({empresa_id:existing.id}).eq("id",userId);updatePerfil({empresa_id:existing.id});setCodigo(existing.codigo);setNumMiembros((existing.miembros||[]).length);return;}
              const cod=genCode();
              const{data:emp}=await sb.from("empresas").insert({nombre:perfil.empresa||perfil.nombre||"Mi empresa",codigo:cod,gerente_id:userId,miembros:[userId]}).select().single();
              if(emp){await sb.from("perfiles").update({empresa_id:emp.id}).eq("id",userId);updatePerfil({empresa_id:emp.id});setCodigo(emp.codigo);setNumMiembros(1);}
            }}>Generar codigo</button>
          }
        </div>}
        {perfil.rol==="gerente"&&perfil.subscription_status==="active"&&<div className="card">
          <div className="chd">Suscripcion</div>
          {portalMsg&&<p style={{fontSize:"0.78rem",color:"var(--red)",marginBottom:"0.5rem"}}>{portalMsg}</p>}
          <button className="btn bg" onClick={async()=>{
            setPortalMsg("");setAbriendoPortal(true);
            const{data,error}=await sb.functions.invoke("create-portal-session",{body:{userId}});
            setAbriendoPortal(false);
            if(error||!data?.url){setPortalMsg("No se ha podido abrir el panel de suscripcion. Intentalo de nuevo.");return;}
            window.location.href=data.url;
          }} disabled={abriendoPortal}>{abriendoPortal?<span className="spinner"/>:"Gestionar suscripcion"}</button>
        </div>}
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">👤 Usuarios (chóferes y tráfico)</div>
          <p style={{fontSize:"0.82rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Gestiona los usuarios de tu equipo: crea cuentas, asigna tractoras y restablece contraseñas.</p>
          <button className="btn bp" onClick={()=>setShowUsuarios(true)}><Icon d={I.user} size={15}/> Gestionar usuarios</button>
        </div>}
        {showUsuarios&&<UsuariosModal userId={userId} perfil={perfil} tractoras={tractoras} onClose={()=>setShowUsuarios(false)}/>}
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">🧾 Clientes</div>
          {(clientesTodos||[]).length>0?<div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
            {(clientesTodos||[]).map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem",background:"var(--s3)",borderRadius:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.88rem"}}>{c.nombre}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{c.cif?`${c.cif} · `:""}{c.contacto?`${c.contacto} · `:""}{c.tarifa_km?`tarifa ${c.tarifa_km}€/km`:"sin tarifa"}</div>
                </div>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem",width:"auto"}} onClick={()=>eliminarCliente(c.id)}><Icon d={I.trash} size={12}/></button>
              </div>
            ))}
          </div>:<p style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Aún no has añadido ningún cliente.</p>}
          <div style={{height:1,background:"var(--border)",marginBottom:"0.75rem"}}/>
          <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:"0.5rem"}}>➕ Añadir cliente</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            <div className="fld"><label className="lbl">Nombre</label><input className="inp" placeholder="Ej: Transportes García S.L." value={nuevoCliente.nombre} onChange={e=>setNuevoCliente({...nuevoCliente,nombre:e.target.value})}/></div>
            <div className="g2">
              <div className="fld"><label className="lbl">CIF (opcional)</label><input className="inp" placeholder="B12345678" value={nuevoCliente.cif} onChange={e=>setNuevoCliente({...nuevoCliente,cif:e.target.value})}/></div>
              <div className="fld"><label className="lbl">Contacto (opcional)</label><input className="inp" placeholder="Email o teléfono" value={nuevoCliente.contacto} onChange={e=>setNuevoCliente({...nuevoCliente,contacto:e.target.value})}/></div>
            </div>
            <div className="fld"><label className="lbl">Tarifa pactada (€/km, opcional)</label><input className="inp" type="number" placeholder="Ej: 1.20" value={nuevoCliente.tarifa_km} onChange={e=>setNuevoCliente({...nuevoCliente,tarifa_km:e.target.value})}/>
              <div style={{fontSize:"0.68rem",color:"var(--muted)",marginTop:"0.25rem"}}>Si la pones, al elegir este cliente en un viaje se sugerirá el precio automáticamente.</div>
            </div>
            {clienteMsg&&<p style={{fontSize:"0.78rem",color:clienteMsg.includes("✅")?"var(--green)":"var(--red)"}}>{clienteMsg}</p>}
            <button className="btn bp" onClick={crearCliente}>Añadir cliente</button>
          </div>
        </div>}
        <div className="card">
          <div className="chd">Apariencia</div>
          <div className="toggle-row">
            <span className="toggle-lbl">Modo claro</span>
            <button className={`toggle ${theme==="light"?"on":""}`} onClick={()=>setTheme(theme==="light"?"dark":"light")}/>
          </div>
        </div>
        <div className="card">
          <div className="chd">Color de la app</div>
          <div style={{display:"flex",gap:"0.625rem"}}>{ACCENTS.map((a,i)=><div key={i} className={`accent-dot ${(perfil.accent_idx||0)===i?"sel":""}`} style={{background:`linear-gradient(135deg,${a.a1},${a.a2})`}} onClick={()=>saveAjustes({accent_idx:i})}/>)}</div>
        </div>
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">Cambiar contrasena</div>
          <p style={{fontSize:"0.8rem",color:"var(--muted)",marginBottom:"0.5rem"}}>Por seguridad, la contraseña del gerente solo puede cambiarse a través de un enlace que te enviaremos por email.</p>
          {passMsg&&<p style={{fontSize:"0.78rem",color:passMsg.startsWith("✅")?"var(--green)":"var(--red)",marginBottom:"0.5rem"}}>{passMsg}</p>}
          <button className="btn bg" onClick={pedirCambioPass} disabled={enviandoOtp}>{enviandoOtp?<span className="spinner"/>:"Enviarme enlace para cambiar contraseña"}</button>
        </div>}
        {(perfil.rol==="chofer"||perfil.rol==="trafico")&&<div className="card">
          <div className="chd">Contrasena</div>
          <p style={{fontSize:"0.8rem",color:"var(--muted)"}}>Si necesitas cambiar tu contrasena, pidesela a tu gerente desde la pantalla de inicio de sesion ("¿Olvidaste tu contraseña?") o directamente.</p>
        </div>}
        <button className="btn bd" onClick={onLogout}><Icon d={I.logout} size={15}/>Cerrar sesion</button>
        <button className="btn bg" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
