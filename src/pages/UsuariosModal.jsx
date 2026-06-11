import { useState, useEffect } from "react";
import { sb, crearClienteTemporal, DOMINIO_USUARIO } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { PLANES } from "../lib/constants.js";

export function UsuariosModal({userId,perfil,tractoras,onClose}) {
  const[empleados,setEmpleados]=useState([]);
  const[nuevoEmp,setNuevoEmp]=useState({nombre:"",usuario:"",password:"",rol:"chofer",truck_id:""});
  const[empMsg,setEmpMsg]=useState("");
  const[creandoEmp,setCreandoEmp]=useState(false);
  const[resetEmp,setResetEmp]=useState(null);
  const[resetPass,setResetPass]=useState("");
  const[resetMsg,setResetMsg]=useState("");
  const[reseteando,setReseteando]=useState(false);
  const[resetOtpSent,setResetOtpSent]=useState(false);
  const[resetOtp,setResetOtp]=useState("");

  const plan=PLANES.find(p=>p.id===perfil.plan)||PLANES[0];
  const limiteChofer=plan.maxTractoras;
  const limiteTrafico=limiteChofer===Infinity?Infinity:Math.ceil(limiteChofer/2);
  const limite=limiteChofer===Infinity?Infinity:limiteChofer+limiteTrafico;
  const numTrafico=empleados.filter(e=>e.rol==="trafico").length;
  const numChofer=empleados.length-numTrafico;
  const limiteAlcanzado=empleados.length>=limite;

  const cargarEmpleados=async()=>{
    const{data}=await sb.from("perfiles").select("id,nombre,rol,truck_id,email").eq("empresa_id",perfil.empresa_id).neq("id",userId);
    setEmpleados(data||[]);
  };
  useEffect(()=>{if(perfil.empresa_id)cargarEmpleados();},[]);

  const crearEmpleado=async()=>{
    setEmpMsg("");
    if(limiteAlcanzado){setEmpMsg(`Tu plan ${plan.nombre} permite hasta ${limite===Infinity?"∞":limite} usuario${limite===1?"":"s"}. Cambia de plan para añadir más.`);return;}
    if(nuevoEmp.rol==="chofer"&&numChofer>=limiteChofer){setEmpMsg(`Tu plan ${plan.nombre} permite hasta ${limiteChofer===Infinity?"∞":limiteChofer} chófer${limiteChofer===1?"":"es"}. Cambia de plan para añadir más.`);return;}
    if(nuevoEmp.rol==="trafico"&&numTrafico>=limiteTrafico){setEmpMsg(`Tu plan ${plan.nombre} permite hasta ${limiteTrafico===Infinity?"∞":limiteTrafico} usuario${limiteTrafico===1?"":"s"} de tráfico. Cambia de plan para añadir más.`);return;}
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
      await temp.from("perfiles").upsert({id:newId,nombre:nuevoEmp.nombre,rol:nuevoEmp.rol,empresa_id:perfil.empresa_id,truck_id:nuevoEmp.rol==="chofer"?(nuevoEmp.truck_id||null):null,email});
      const{data:emp}=await sb.from("empresas").select("miembros").eq("id",perfil.empresa_id).single();
      const miembros=[...(emp?.miembros||[]),newId];
      await sb.from("empresas").update({miembros}).eq("id",perfil.empresa_id);
      setEmpMsg("✅ Empleado creado correctamente");
      setNuevoEmp({nombre:"",usuario:"",password:"",rol:"chofer",truck_id:""});
      cargarEmpleados();
    }catch(e){setEmpMsg("Error: "+e.message);}
    setCreandoEmp(false);
  };

  const actualizarEmpleado=async(id,patch)=>{
    await sb.from("perfiles").update(patch).eq("id",id);
    setEmpleados(emps=>emps.map(e=>e.id===id?{...e,...patch}:e));
  };

  const enviarOtpReset=async()=>{
    setResetMsg("");
    if(resetPass.length<6){setResetMsg("Mínimo 6 caracteres");return;}
    if(!perfil.email){setResetMsg("Tu cuenta no tiene un email asociado");return;}
    setReseteando(true);
    const{error}=await sb.auth.signInWithOtp({email:perfil.email,options:{shouldCreateUser:false}});
    setReseteando(false);
    if(error){setResetMsg("Error al enviar el código: "+error.message);return;}
    setResetOtpSent(true);
    setResetMsg(`✅ Código enviado a ${perfil.email}`);
  };
  const resetearPassword=async()=>{
    if(resetOtp.length<6){setResetMsg("Introduce el código de 6 dígitos");return;}
    setReseteando(true);
    const{error:errOtp}=await sb.auth.verifyOtp({email:perfil.email,token:resetOtp,type:"email"});
    if(errOtp){setReseteando(false);setResetMsg("Código incorrecto o caducado");return;}
    const{data,error}=await sb.functions.invoke("admin-reset-password",{body:{requesterId:userId,targetUserId:resetEmp.id,newPassword:resetPass}});
    setReseteando(false);
    if(error||data?.error){setResetMsg("Error: "+(data?.error||error.message));return;}
    setResetMsg("✅ Contraseña actualizada");
    setResetPass("");setResetOtp("");setResetOtpSent(false);
    setTimeout(()=>{setResetEmp(null);setResetMsg("");},1200);
  };

  return(
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxHeight:"92vh",overflowY:"auto"}}>
        <div className="mdrag"/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.25rem"}}>
          <div className="mtitle" style={{margin:0}}>Usuarios</div>
          <button className="btn bg bsm" onClick={onClose} style={{padding:"0.35rem 0.6rem",width:"auto"}}>✕</button>
        </div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
            <span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Usuarios del equipo</span>
            <span style={{fontSize:"0.75rem",fontWeight:700,color:limiteAlcanzado?"var(--red)":"var(--text)"}}>{empleados.length} / {limite===Infinity?"∞":limite}</span>
          </div>
          <div style={{height:4,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min((empleados.length/Math.max(limite===Infinity?empleados.length||1:limite,1))*100,100)}%`,background:limiteAlcanzado?"var(--red)":"var(--a1)",borderRadius:2,transition:"width 0.3s"}}/>
          </div>
          <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:"0.25rem"}}>Plan {plan.nombre} · {limite===Infinity?"usuarios ilimitados":`hasta ${limiteChofer} chófer${limiteChofer===1?"":"es"} y ${limiteTrafico} de tráfico (${limite} en total)`}</div>
        </div>
        <div className="card">
          <div className="chd">👤 Chóferes y tráfico</div>
          {empleados.length>0?<div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
            {empleados.map(e=>{
              const t=(tractoras||[]).find(x=>x.id===e.truck_id);
              return(
              <div key={e.id} style={{display:"flex",flexDirection:"column",gap:"0.4rem",padding:"0.6rem",background:"var(--s3)",borderRadius:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:"0.88rem"}}>{e.nombre}</div>
                    <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{e.rol==="chofer"?`🚛 ${t?.matricula||"sin tractora"}`:"📋 Tráfico (ve todos los viajes)"}</div>
                    {e.email&&<div style={{fontSize:"0.68rem",color:"var(--muted)",marginTop:1}}>👤 {e.email.split("@")[0]}</div>}
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
                {resetEmp?.id===e.id?<div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginTop:"0.2rem"}}>
                  <input className="inp" type="text" style={{fontSize:"0.75rem"}} placeholder="Nueva contraseña (mín. 6 caracteres)" value={resetPass} onChange={ev=>setResetPass(ev.target.value)} disabled={resetOtpSent}/>
                  {resetOtpSent&&<input className="inp" type="text" style={{fontSize:"0.75rem"}} placeholder="Código de 6 dígitos recibido por email" value={resetOtp} onChange={ev=>setResetOtp(ev.target.value)}/>}
                  {resetMsg&&<div style={{fontSize:"0.7rem",color:resetMsg.startsWith("✅")?"var(--green)":"var(--red)"}}>{resetMsg}</div>}
                  <div style={{display:"flex",gap:"0.4rem"}}>
                    {!resetOtpSent?
                      <button className="btn bp bsm" style={{flex:1}} onClick={enviarOtpReset} disabled={reseteando}>{reseteando?<span className="spinner"/>:"Enviar código"}</button>
                      :<button className="btn bp bsm" style={{flex:1}} onClick={resetearPassword} disabled={reseteando}>{reseteando?<span className="spinner"/>:"Confirmar"}</button>}
                    <button className="btn bg bsm" style={{flex:1}} onClick={()=>{setResetEmp(null);setResetPass("");setResetOtp("");setResetOtpSent(false);setResetMsg("");}}>Cancelar</button>
                  </div>
                </div>:<button className="btn bg bsm" style={{fontSize:"0.72rem",alignSelf:"flex-start"}} onClick={()=>{setResetEmp(e);setResetPass("");setResetOtp("");setResetOtpSent(false);setResetMsg("");}}>🔑 Restablecer contraseña</button>}
              </div>
            );})}
          </div>:<p style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Aún no has creado ningún usuario.</p>}
          <div style={{height:1,background:"var(--border)",marginBottom:"0.75rem"}}/>
          <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:"0.5rem"}}>➕ Crear nuevo usuario</div>
          {limiteAlcanzado&&<div className="alert ay" style={{marginBottom:"0.5rem"}}><Icon d={I.lock} size={14} color="var(--yellow)"/><span style={{fontSize:"0.8rem"}}>Tu plan {plan.nombre} permite hasta {limite} usuario{limite===1?"":"s"}. Cambia de plan para añadir más.</span></div>}
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
            <button className="btn bp" onClick={crearEmpleado} disabled={creandoEmp||limiteAlcanzado}>{creandoEmp?"Creando...":"Crear usuario"}</button>
          </div>
        </div>
        <button className="btn bg" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
