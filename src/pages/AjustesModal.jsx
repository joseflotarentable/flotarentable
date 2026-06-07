import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { ACCENTS } from "../lib/constants.js";
import { genCode } from "../lib/helpers.js";
import { InputGuardado, PhotoUpload } from "../components/ui.jsx";

export function AjustesModal({userId,perfil,updatePerfil,onClose,onLogout,tractoras,theme,setTheme}) {
  const[codigo,setCodigo]=useState("");
  const[copied,setCopied]=useState(false);
  const[passForm,setPassForm]=useState({nueva:"",confirmar:""});
  const[passMsg,setPassMsg]=useState("");
  const[numMiembros,setNumMiembros]=useState(1);
  const[empresaGerente,setEmpresaGerente]=useState(null);
  const planLimite=perfil.plan==="empresa"?999:perfil.plan==="flota"?11:4;
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
  const cambiarPass=async()=>{
    if(passForm.nueva.length<6){setPassMsg("Mínimo 6 caracteres");return;}
    if(passForm.nueva!==passForm.confirmar){setPassMsg("Las contraseñas no coinciden");return;}
    const{error}=await sb.auth.updateUser({password:passForm.nueva});
    if(error){setPassMsg("Error al cambiar la contraseña");return;}
    setPassMsg("✅ Contraseña cambiada correctamente. Supabase enviará un email de confirmación.");
    setPassForm({nueva:"",confirmar:""});
  };

  return(
    <div className="ov" onClick={onClose}>
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
                <span style={{fontSize:"0.78rem",fontWeight:700,color:tractorasActivas>=(planLimite-1)?"var(--red)":"var(--text)"}}>{tractorasActivas} / {planLimite===999?"∞":planLimite-1}</span>
              </div>
              <div style={{height:4,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((tractorasActivas/Math.max(planLimite===999?tractorasActivas||1:planLimite-1,1))*100,100)}%`,background:tractorasActivas>=(planLimite-1)?"var(--red)":"var(--a1)",borderRadius:2,transition:"width 0.3s"}}/>
              </div>
              <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>Plan {planLimite<=4?"Starter":planLimite<=11?"Flota":"Empresa"} · {planLimite===999?"Tractoras ilimitadas":`${planLimite-1} tractora${planLimite-1!==1?"s":""} incluidas`}</div>
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
          {codigo&&<div style={{marginTop:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
              <span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Choferes activos</span>
              <span style={{fontSize:"0.75rem",fontWeight:700,color:(numMiembros-1)>=(planLimite-1)?"var(--red)":"var(--text)"}}>{Math.max(numMiembros-1,0)} / {planLimite-1}</span>
            </div>
            <div style={{height:4,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min((Math.max(numMiembros-1,0)/Math.max(planLimite-1,1))*100,100)}%`,background:(numMiembros-1)>=(planLimite-1)?"var(--red)":"var(--a1)",borderRadius:2,transition:"width 0.3s"}}/>
            </div>
            <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:"0.25rem"}}>Plan {planLimite<=4?"Starter":planLimite<=11?"Flota":"Empresa"} · {planLimite-1} chófer{planLimite-1!==1?"es":""} incluidos</div>
          </div>}
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
        <div className="card">
          <div className="chd">Cambiar contrasena</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            <input className="inp" type="password" placeholder="Nueva contrasena" value={passForm.nueva} onChange={e=>setPassForm({...passForm,nueva:e.target.value})}/>
            <input className="inp" type="password" placeholder="Confirmar contrasena" value={passForm.confirmar} onChange={e=>setPassForm({...passForm,confirmar:e.target.value})}/>
            {passMsg&&<p style={{fontSize:"0.78rem",color:passMsg.includes("correcta")?"var(--green)":"var(--red)"}}>{passMsg}</p>}
            <button className="btn bg" onClick={cambiarPass}>Cambiar contrasena</button>
          </div>
        </div>
        <button className="btn bd" onClick={onLogout}><Icon d={I.logout} size={15}/>Cerrar sesion</button>
        <button className="btn bg" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
