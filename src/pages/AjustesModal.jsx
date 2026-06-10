import { useState, useEffect } from "react";
import { sb, crearClienteTemporal, DOMINIO_USUARIO } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { ACCENTS } from "../lib/constants.js";
import { genCode } from "../lib/helpers.js";
import { InputGuardado, PhotoUpload } from "../components/ui.jsx";

export function AjustesModal({userId,perfil,updatePerfil,onClose,onLogout,tractoras,theme,setTheme,clientesTodos,setClientesTodos}) {
  const[nuevoCliente,setNuevoCliente]=useState({nombre:"",cif:"",contacto:"",tarifa_km:""});
  const[clienteMsg,setClienteMsg]=useState("");
  const[codigo,setCodigo]=useState("");
  const[copied,setCopied]=useState(false);
  const[passForm,setPassForm]=useState({nueva:"",confirmar:""});
  const[passMsg,setPassMsg]=useState("");
  const[numMiembros,setNumMiembros]=useState(1);
  const[empresaGerente,setEmpresaGerente]=useState(null);
  const[empleados,setEmpleados]=useState([]);
  const[nuevoEmp,setNuevoEmp]=useState({nombre:"",usuario:"",password:"",rol:"chofer",truck_id:""});
  const[empMsg,setEmpMsg]=useState("");
  const[creandoEmp,setCreandoEmp]=useState(false);

  const cargarEmpleados=async(empresaId)=>{
    const{data}=await sb.from("perfiles").select("id,nombre,rol,truck_id").eq("empresa_id",empresaId).neq("id",userId);
    setEmpleados(data||[]);
  };
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
      cargarEmpleados(perfil.empresa_id);
    } else {
      sb.from("empresas").select("id,codigo,miembros").eq("gerente_id",userId).single().then(async({data:emp})=>{
        if(emp){
          await sb.from("perfiles").update({empresa_id:emp.id}).eq("id",userId);
          updatePerfil({empresa_id:emp.id});
          setCodigo(emp.codigo);
          if(emp.miembros)setNumMiembros(emp.miembros.length);
          cargarEmpleados(emp.id);
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

  const crearEmpleado=async()=>{
    setEmpMsg("");
    if(!nuevoEmp.nombre||!nuevoEmp.usuario||!nuevoEmp.password){setEmpMsg("Rellena nombre, usuario y contraseña");return;}
    if(nuevoEmp.password.length<6){setEmpMsg("La contraseña debe tener al menos 6 caracteres");return;}
    setCreandoEmp(true);
    try{
      const email=`${nuevoEmp.usuario.trim().toLowerCase()}@${DOMINIO_USUARIO}`;
      const temp=crearClienteTemporal();
      const{data,error}=await temp.auth.signUp({email,password:nuevoEmp.password});
      if(error){setEmpMsg(error.message.includes("registered")?"Ese usuario ya existe":"Error: "+error.message);setCreandoEmp(false);return;}
      const newId=data.user?.id;
      if(!newId){setEmpMsg("No se pudo crear el usuario");setCreandoEmp(false);return;}
      await temp.from("perfiles").upsert({id:newId,nombre:nuevoEmp.nombre,rol:nuevoEmp.rol,empresa_id:perfil.empresa_id,truck_id:nuevoEmp.rol==="chofer"?(nuevoEmp.truck_id||null):null});
      const{data:emp}=await sb.from("empresas").select("miembros").eq("id",perfil.empresa_id).single();
      const miembros=[...(emp?.miembros||[]),newId];
      await sb.from("empresas").update({miembros}).eq("id",perfil.empresa_id);
      setNumMiembros(miembros.length);
      setEmpMsg("✅ Empleado creado correctamente");
      setNuevoEmp({nombre:"",usuario:"",password:"",rol:"chofer",truck_id:""});
      cargarEmpleados(perfil.empresa_id);
    }catch(e){setEmpMsg("Error: "+e.message);}
    setCreandoEmp(false);
  };

  const actualizarEmpleado=async(id,patch)=>{
    await sb.from("perfiles").update(patch).eq("id",id);
    setEmpleados(emps=>emps.map(e=>e.id===id?{...e,...patch}:e));
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
        {perfil.rol==="gerente"&&<div className="card">
          <div className="chd">👤 Usuarios (chóferes y tráfico)</div>
          {empleados.length>0?<div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
            {empleados.map(e=>{
              const t=(tractoras||[]).find(x=>x.id===e.truck_id);
              return(
              <div key={e.id} style={{display:"flex",flexDirection:"column",gap:"0.4rem",padding:"0.6rem",background:"var(--s3)",borderRadius:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:"0.88rem"}}>{e.nombre}</div>
                    <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{e.rol==="chofer"?`🚛 ${t?.matricula||"sin tractora"}`:"📋 Tráfico (ve todos los viajes)"}</div>
                  </div>
                  <select className="inp" style={{width:"auto",padding:"0.25rem 0.5rem",fontSize:"0.75rem"}} value={e.rol} onChange={ev=>actualizarEmpleado(e.id,{rol:ev.target.value,...(ev.target.value!=="chofer"?{truck_id:null}:{})})}>
                    <option value="chofer">Chófer</option>
                    <option value="trafico">Tráfico</option>
                  </select>
                </div>
                {e.rol==="chofer"&&<select className="inp" style={{fontSize:"0.75rem"}} value={e.truck_id||""} onChange={ev=>actualizarEmpleado(e.id,{truck_id:ev.target.value||null})}>
                  <option value="">Sin tractora asignada</option>
                  {(tractoras||[]).map(t=><option key={t.id} value={t.id}>{t.matricula}</option>)}
                </select>}
              </div>
            );})}
          </div>:<p style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Aún no has creado ningún usuario.</p>}
          <div style={{height:1,background:"var(--border)",marginBottom:"0.75rem"}}/>
          <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:"0.5rem"}}>➕ Crear nuevo usuario</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            <div className="fld"><label className="lbl">Nombre</label><input className="inp" placeholder="Ej: Juan Pérez" value={nuevoEmp.nombre} onChange={e=>setNuevoEmp({...nuevoEmp,nombre:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Tipo</label>
              <select className="inp" value={nuevoEmp.rol} onChange={e=>setNuevoEmp({...nuevoEmp,rol:e.target.value})}>
                <option value="chofer">Chófer (ve solo su tractora)</option>
                <option value="trafico">Tráfico (ve todos los viajes)</option>
              </select>
            </div>
            {nuevoEmp.rol==="chofer"&&<div className="fld"><label className="lbl">Tractora asignada</label>
              <select className="inp" value={nuevoEmp.truck_id} onChange={e=>setNuevoEmp({...nuevoEmp,truck_id:e.target.value})}>
                <option value="">Sin asignar</option>
                {(tractoras||[]).map(t=><option key={t.id} value={t.id}>{t.matricula}</option>)}
              </select>
            </div>}
            <div className="fld"><label className="lbl">Usuario para iniciar sesión</label><input className="inp" placeholder="Ej: 1111MMM (la matrícula es fácil de recordar)" value={nuevoEmp.usuario} onChange={e=>setNuevoEmp({...nuevoEmp,usuario:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Contraseña</label><input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={nuevoEmp.password} onChange={e=>setNuevoEmp({...nuevoEmp,password:e.target.value})}/></div>
            {empMsg&&<p style={{fontSize:"0.78rem",color:empMsg.includes("✅")?"var(--green)":"var(--red)"}}>{empMsg}</p>}
            <button className="btn bp" onClick={crearEmpleado} disabled={creandoEmp}>{creandoEmp?"Creando...":"Crear usuario"}</button>
          </div>
        </div>}
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
