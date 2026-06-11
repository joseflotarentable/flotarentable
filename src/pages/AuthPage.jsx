import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { genCode } from "../lib/helpers.js";
import { PLANES } from "../lib/constants.js";
import { DOMINIO_USUARIO } from "../lib/supabase.js";

export function AuthPage({onAuth,accent,initialMode,onBack}) {
  const[mode,setMode]=useState(initialMode||"welcome");
  const[step,setStep]=useState(1);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[showPass,setShowPass]=useState(false);
  const[showSentModal,setShowSentModal]=useState(false);
  const[form,setForm]=useState({nombre:"",empresa:"",email:"",telefono:"",rol:"gerente",codigoEmpresa:"",plan:"",password:"",confirmPass:""});
  const passStep=form.rol==="gerente"?4:3;
  const totalSteps=form.rol==="gerente"?4:3;

  const feats=[
    {icon:I.trend,col:"#FF3D5A",bg:"#FF3D5A15",t:"Rentabilidad real por km",s:"Fijos + variables calculados"},
    {icon:I.truck,col:"#06D6A0",bg:"#06D6A015",t:"Gestión de flota completa",s:"Tractoras, semis y conjuntos"},
    {icon:I.coin,col:"#06D6A0",bg:"#06D6A015",t:"Gastos variables",s:"Combustible, peajes, ITV..."},
    {icon:I.chart,col:"#FFD166",bg:"#FFD16615",t:"Resumen mensual y anual",s:"Con IVA para tu gestor"},
  ];

  const doSignup=async()=>{
    if(!form.password){setErr("Introduce una contraseña");return;}
    if(form.password!==form.confirmPass){setErr("Las contraseñas no coinciden");return;}
    if(form.password.length<6){setErr("Mínimo 6 caracteres");return;}
    setLoading(true);
    try{
      const{data,error}=await sb.auth.signUp({email:form.email,password:form.password,options:{data:{nombre:form.nombre,empresa:form.empresa,rol:form.rol}}});
      if(error){setErr(error.message);setLoading(false);return;}
      if(data.user&&data.user.identities&&data.user.identities.length===0){setErr("Ese email ya está registrado. Inicia sesión.");setLoading(false);return;}
      let empresaId=null;
      if(form.rol==="gerente"){
        const{data:emp}=await sb.from("empresas").insert({nombre:form.empresa||form.nombre,codigo:genCode(),gerente_id:data.user.id,miembros:[data.user.id]}).select().single();
        empresaId=emp?.id;
      }else if(form.codigoEmpresa){
        const{data:empId}=await sb.rpc("unirse_empresa_por_codigo",{p_codigo:form.codigoEmpresa.toUpperCase()});
        empresaId=empId;
      }
      await sb.from("perfiles").upsert({id:data.user.id,nombre:form.nombre,empresa:form.empresa,email:form.email,telefono:form.telefono,rol:form.rol,accent_idx:0,trial_start:new Date().toISOString(),empresa_id:empresaId,plan:form.rol==="gerente"?form.plan:null});
      const{data:p}=await sb.from("perfiles").select("*").eq("id",data.user.id).single();
      onAuth(data.user,p||{});
    }catch(e){setErr(e.message);}
    setLoading(false);
  };

  const handleRegister=async()=>{
    if(step===1){if(!form.nombre||!form.email){setErr("Nombre y email son obligatorios");return;}setErr("");setStep(2);return;}
    if(step===2){
      if(form.rol==="chofer"&&!form.codigoEmpresa){setErr("El codigo de empresa es obligatorio para choferes");return;}
      if(form.rol==="chofer"){
        const{data:emp}=await sb.rpc("empresa_por_codigo",{p_codigo:form.codigoEmpresa.toUpperCase()});
        if(!emp||emp.length===0){setErr("Codigo incorrecto. Pidele el codigo FR-XXXX a tu gerente.");return;}
      }
      setErr("");setStep(3);return;
    }
    if(step===3&&form.rol==="gerente"){
      if(!form.plan){setErr("Elige un plan para continuar");return;}
      setErr("");setStep(4);return;
    }
    if(step===passStep){await doSignup();return;}
  };

  const handleLogin=async()=>{
    if(!form.email||!form.password){setErr("Usuario/email y contraseña obligatorios");return;}
    setLoading(true);
    const emailReal=form.email.includes("@")?form.email:`${form.email.trim().toLowerCase()}@${DOMINIO_USUARIO}`;
    const{data,error}=await sb.auth.signInWithPassword({email:emailReal,password:form.password});
    if(error){setErr("Email o contraseña incorrectos");setLoading(false);return;}
    const{data:p}=await sb.from("perfiles").select("*").eq("id",data.user.id).single();
    onAuth(data.user,p||{});setLoading(false);
  };

  const handleForgot=async()=>{
    if(!form.email){setErr("Introduce tu email o usuario");return;}
    setLoading(true);
    if(!form.email.includes("@")){
      // Usuario interno (chofer/trafico) sin email real: avisamos al gerente por email.
      const emailReal=`${form.email.trim().toLowerCase()}@${DOMINIO_USUARIO}`;
      const{error}=await sb.functions.invoke("notify-password-reset",{body:{email:emailReal}});
      setLoading(false);
      if(error){setErr("No se pudo avisar a tu gerente. Pidele que te restablezca la contraseña desde Ajustes.");return;}
      setErr("");setMode("forgotSentGerente");return;
    }
    const{error}=await sb.auth.resetPasswordForEmail(form.email,{redirectTo:"https://kmrentable.vercel.app"});
    setLoading(false);
    if(error){setErr("Error al enviar el email. Verifica la dirección.");return;}
    setErr("");setMode("login");setShowSentModal(true);
  };

  const handleForgotUser=async()=>{
    if(!form.email||!form.email.includes("@")){setErr("Introduce tu email");return;}
    setLoading(true);
    await sb.functions.invoke("recuperar-usuarios",{body:{email:form.email}});
    setLoading(false);
    setErr("");setMode("forgotUserSent");
  };

  if(mode==="forgotSentGerente")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:"3rem"}}>📨</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Aviso enviado a tu gerente</div>
        <p style={{fontSize:"0.88rem",color:"var(--muted)",lineHeight:1.6}}>Hemos avisado a tu gerente para que te asigne una nueva contraseña. En cuanto lo haga, podrás iniciar sesión con ella.</p>
        <button className="btn bp" style={{width:"100%",marginTop:"0.5rem"}} onClick={()=>setMode("login")}>Volver al inicio de sesión</button>
      </div>
    </div>
  );

  if(mode==="forgotUserSent")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:"3rem"}}>📧</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Revisa tu correo</div>
        <p style={{fontSize:"0.88rem",color:"var(--muted)",lineHeight:1.6}}>Si ese email pertenece a una cuenta de gerente, te hemos enviado la lista de usuarios de tu equipo a <strong style={{color:"var(--text)"}}>{form.email}</strong>.</p>
        <button className="btn bp" style={{width:"100%",marginTop:"0.5rem"}} onClick={()=>setMode("login")}>Volver al inicio de sesión</button>
      </div>
    </div>
  );

  if(mode==="forgotUser")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>setMode("login")}><Icon d={I.back} size={14}/> Volver</button>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"2rem",letterSpacing:"0.04em"}}>Recuperar usuario</div>
        <p style={{fontSize:"0.85rem",color:"var(--muted)",lineHeight:1.5}}>Si eres gerente, introduce tu email y te enviaremos los nombres de usuario de tu equipo (chóferes y tráfico).</p>
        <div className="fld"><label className="lbl">Tu email de gerente</label><input className="inp" type="email" placeholder="tu@email.com" autoFocus value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleForgotUser()}/></div>
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleForgotUser} disabled={loading}>{loading?<span className="spinner"/>:"Enviar"}</button>
      </div>
    </div>
  );

  if(mode==="forgot")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>setMode("login")}><Icon d={I.back} size={14}/> Volver</button>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"2rem",letterSpacing:"0.04em"}}>Recuperar contraseña</div>
        <p style={{fontSize:"0.85rem",color:"var(--muted)",lineHeight:1.5}}>Si tienes email propio, te enviaremos un enlace para restablecer tu contraseña. Si eres chófer o tráfico y entras con un usuario (sin @), avisaremos a tu gerente para que te asigne una nueva.</p>
        <div className="fld"><label className="lbl">Email o usuario</label><input className="inp" type="text" placeholder="tu@email.com o usuario" autoFocus value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleForgot()}/></div>
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleForgot} disabled={loading}>{loading?<span className="spinner"/>:"Enviar"}</button>
        <p style={{textAlign:"center",fontSize:"0.73rem",color:"var(--muted)"}}>¿Eres gerente y olvidaste el usuario de tu equipo? <span style={{color:"var(--a1)",cursor:"pointer"}} onClick={()=>{setErr("");setMode("forgotUser");}}>Recupéralo aquí</span></p>
      </div>
    </div>
  );

  if(mode==="welcome")return(
    <div className="auth-wrap fu">
      <div style={{position:"relative",padding:"3rem 1.75rem 2rem",textAlign:"center",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",gap:"1.25rem"}}>
        <div className="auth-glow"/>
        {onBack&&<button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start",position:"relative",zIndex:1}} onClick={onBack}><Icon d={I.back} size={14}/> Volver a la web</button>}
        <div className="auth-logo"><svg width="38" height="38" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
        <div><div className="auth-wordmark">Flota<br/>Rentable</div><p style={{position:"relative",zIndex:1,fontSize:"0.9rem",color:"var(--muted)",lineHeight:1.65,maxWidth:270}}>Tu negocio de transporte en el bolsillo.</p></div>
      </div>
      <div style={{padding:"0 1.5rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {feats.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"0.875rem",background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"0.875rem 1rem"}}><div style={{width:34,height:34,borderRadius:10,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={f.icon} size={16} color={f.col}/></div><div><div style={{fontSize:"0.875rem",fontWeight:600}}>{f.t}</div><div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:1}}>{f.s}</div></div></div>)}
      </div>
      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        <div style={{background:"var(--s2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"2.8rem",letterSpacing:"0.04em",lineHeight:1,background:`linear-gradient(135deg,${accent.a1},#FFD166)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>7</div>
          <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>días completamente gratis</div><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:2}}>Después desde 14,99€/mes · Sin permanencia</div></div>
        </div>
        <button className="btn bp" onClick={()=>setMode("register")}>Empezar gratis <Icon d={I.arrow} size={15} color="#fff"/></button>
        <button className="btn bg" onClick={()=>setMode("login")}>Ya tengo cuenta</button>
      </div>
    </div>
  );

  if(mode==="login")return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>onBack?onBack():setMode("welcome")}><Icon d={I.back} size={14}/> Volver</button>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"2rem",letterSpacing:"0.04em"}}>Iniciar sesión</div>
        <div className="fld"><label className="lbl">Email o usuario</label><input className="inp" type="text" placeholder="tu@email.com o usuario" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="fld"><label className="lbl">Contraseña</label><div className="pass-wrap"><input className="inp" type={showPass?"text":"password"} placeholder="••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/><button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button></div></div>
        <p style={{fontSize:"0.78rem",color:"var(--a1)",textAlign:"right",cursor:"pointer",margin:"-0.25rem 0"}} onClick={()=>setMode("forgot")}>¿Olvidaste tu contraseña?</p>
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleLogin} disabled={loading}>{loading?<span className="spinner"/>:"Entrar"}</button>
      </div>
      {showSentModal&&(
        <div style={{position:"fixed",inset:0,background:"#000000a0",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1.5rem"}} onClick={()=>setShowSentModal(false)}>
          <div className="card fu" style={{maxWidth:360,width:"100%",textAlign:"center",display:"flex",flexDirection:"column",gap:"1rem",alignItems:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:"2.5rem"}}>📧</div>
            <p style={{fontSize:"0.9rem",lineHeight:1.6}}>Se ha enviado un correo electrónico para recuperar tu contraseña.</p>
            <button className="btn bp" style={{width:"100%"}} onClick={()=>setShowSentModal(false)}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );

  return(
    <div className="auth-wrap fu">
      <div style={{padding:"3rem 1.5rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <button className="btn bg bsm" style={{width:"auto",alignSelf:"flex-start"}} onClick={()=>step>1?setStep(step-1):(onBack?onBack():setMode("welcome"))}><Icon d={I.back} size={14}/> {step>1?"Atrás":"Volver"}</button>
        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center"}}>{Array.from({length:totalSteps},(_,i)=>i+1).map(n=><div key={n} className={`step-dot ${step===n?"on":""}`}/>)}</div>
        {step===1&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tus datos</div>
          <div className="fld"><label className="lbl">Nombre *</label><input className="inp" placeholder="Juan García" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Empresa (opcional)</label><input className="inp" placeholder="Transportes García S.L." value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Email *</label><input className="inp" type="email" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Teléfono</label><input className="inp" type="tel" placeholder="600 000 000" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div></>}
        {step===2&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tu rol</div>
          {[["gerente","👔 Gerente / Propietario","Acceso completo — configura y ve todo"],["chofer","🚛 Chófer","Solo registro de viajes y gastos"]].map(([rol,title,sub])=>(
            <div key={rol} className={`role-card ${form.rol===rol?"sel":""}`} onClick={()=>setForm({...form,rol})}>
              <div style={{width:40,height:40,borderRadius:10,background:form.rol===rol?`${accent.a1}20`:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={rol==="gerente"?I.user:I.truck} size={20} color={form.rol===rol?accent.a1:"var(--muted)"}/></div>
              <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>{title}</div><div style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:2}}>{sub}</div></div>
            </div>
          ))}
          {form.rol==="chofer"&&<>
            <div style={{background:"#FFD16612",border:"1px solid #FFD16630",borderRadius:"var(--r2)",padding:"0.875rem",fontSize:"0.82rem",color:"var(--yellow)"}}>
              Pide el codigo FR-XXXX a tu gerente antes de continuar
            </div>
            <div className="fld">
              <label className="lbl">Codigo de empresa *</label>
              <input className="inp" placeholder="FR-XXXX" value={form.codigoEmpresa} onChange={e=>setForm({...form,codigoEmpresa:e.target.value.toUpperCase()})} style={{letterSpacing:"0.1em",fontWeight:700,fontSize:"1rem"}}/>
            </div>
          </>}</>}
        {step===3&&form.rol==="gerente"&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Tu plan</div>
          <p style={{fontSize:"0.8rem",color:"var(--muted)",marginTop:"-0.5rem"}}>Durante los 7 días de prueba podrás dar de alta hasta el límite de tractoras de tu plan. Los semirremolques son siempre ilimitados.</p>
          {PLANES.map(pl=>(
            <div key={pl.id} className={`role-card ${form.plan===pl.id?"sel":""}`} onClick={()=>setForm({...form,plan:pl.id})}>
              <div style={{width:40,height:40,borderRadius:10,background:form.plan===pl.id?`${accent.a1}20`:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={I.truck} size={20} color={form.plan===pl.id?accent.a1:"var(--muted)"}/></div>
              <div><div style={{fontWeight:700,fontSize:"0.9rem"}}>{pl.nombre} — {pl.rango}</div><div style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:2}}><strong style={{color:"var(--text)"}}>0€ durante 7 días</strong>, después {pl.precio}</div></div>
            </div>
          ))}</>}
        {step===passStep&&<><div style={{fontFamily:"'Bebas Neue'",fontSize:"1.8rem",letterSpacing:"0.04em"}}>Contraseña</div>
          <div style={{background:`${accent.a1}12`,border:`1px solid ${accent.a1}30`,borderRadius:"var(--r2)",padding:"0.875rem",fontSize:"0.82rem"}}>🎁 <strong>7 días gratis</strong> — Sin tarjeta para empezar</div>
          <div className="fld"><label className="lbl">Contraseña</label><div className="pass-wrap"><input className="inp" type={showPass?"text":"password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="pass-eye" onClick={()=>setShowPass(!showPass)}><Icon d={showPass?I.eyeoff:I.eye} size={16}/></button></div></div>
          <div className="fld"><label className="lbl">Confirmar contraseña</label><input className="inp" type="password" placeholder="Repite la contraseña" value={form.confirmPass} onChange={e=>setForm({...form,confirmPass:e.target.value})}/></div></>}
        {err&&<p style={{fontSize:"0.8rem",color:"var(--red)"}}>{err}</p>}
        <button className="btn bp" onClick={handleRegister} disabled={loading}>{loading?<span className="spinner"/>:step<passStep?"Continuar →":"Crear cuenta gratis"}</button>
        {step===1&&<p style={{textAlign:"center",fontSize:"0.73rem",color:"var(--muted)"}}>¿Ya tienes cuenta? <span style={{color:"var(--a1)",cursor:"pointer"}} onClick={()=>setMode("login")}>Inicia sesión</span></p>}
      </div>
    </div>
  );
}

// ── FLOTA PAGE ────────────────────────────────────────────────────────────────
