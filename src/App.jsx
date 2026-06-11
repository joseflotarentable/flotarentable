import { useState, useEffect } from "react";
import { sb } from "./lib/supabase.js";
import { Icon, I } from "./lib/icons.jsx";
import { ACCENTS } from "./lib/constants.js";
import { getDaysLeft } from "./lib/helpers.js";
import { makeCSS } from "./styles.js";

import { AuthPage } from "./pages/AuthPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { AjustesModal } from "./pages/AjustesModal.jsx";
import { InicioPage } from "./pages/InicioPage.jsx";
import { FlotaPage } from "./pages/FlotaPage.jsx";
import { ViajesPage } from "./pages/ViajesPage.jsx";
import { GastosPage } from "./pages/GastosPage.jsx";
import { AnalizarPage } from "./pages/AnalizarPage.jsx";
import { PaywallPage } from "./pages/PaywallPage.jsx";
import { BlogPage, BlogPostPage } from "./pages/BlogPage.jsx";
import { HelpWidget } from "./components/HelpWidget.jsx";

export default function App() {
  const[user,setUser]=useState(null);
  const[perfil,setPerfil]=useState({});
  const[logoGerente,setLogoGerente]=useState(null);
  const[tractoras,setTractoras]=useState([]);
  const[semis,setSemis]=useState([]);
  const[gastosTodos,setGastosTodos]=useState([]);
  const[gastosFijos,setGastosFijos]=useState([]);
  const[clientesTodos,setClientesTodos]=useState([]);
  const[viajesTodos,setViajesTodos]=useState([]);
  const[tab,setTab]=useState("inicio");
  const[loading,setLoading]=useState(true);
  const[trialStart,setTrialStart]=useState(null);
  const[subStatus,setSubStatus]=useState("trial");
  const[showPaywall,setShowPaywall]=useState(false);
  const[theme,setTheme]=useState(()=>localStorage.getItem("fr-theme")||"dark");
  const[showAuth,setShowAuth]=useState(false);
  const[authMode,setAuthMode]=useState("welcome");
  const[path,setPath]=useState(()=>window.location.pathname);

  useEffect(()=>{
    const onPop=()=>setPath(window.location.pathname);
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);
  const navigate=to=>{window.history.pushState({},"",to);setPath(to);window.scrollTo(0,0);};

  useEffect(()=>{
    localStorage.setItem("fr-theme",theme);
    document.body.setAttribute("data-theme",theme);
  },[theme]);

  useEffect(()=>{
    if(new URLSearchParams(window.location.search).get("checkout")==="success"){
      window.history.replaceState({},"","/");
      let intentos=0;
      const poll=setInterval(async()=>{
        intentos++;
        const{data:{session}}=await sb.auth.getSession();
        if(session?.user){
          const{data:p}=await sb.from("perfiles").select("subscription_status").eq("id",session.user.id).single();
          if(p?.subscription_status==="active"){setSubStatus("active");clearInterval(poll);}
        }
        if(intentos>=10)clearInterval(poll);
      },2000);
    }
  },[]);

  useEffect(()=>{
    sb.auth.getSession().then(async({data:{session}})=>{
      if(session?.user){
        setUser(session.user);
        const{data:p}=await sb.from("perfiles").select("*").eq("id",session.user.id).single();
        setPerfil(p||{});
        let tractorUserId=session.user.id;
        let ts=p?.trial_start||null;
        let ss=p?.subscription_status||"trial";
        if((p?.rol==="chofer"||p?.rol==="trafico")&&p?.empresa_id){
          const{data:emp}=await sb.from("empresas").select("gerente_id").eq("id",p.empresa_id).single();
          if(emp?.gerente_id){
            tractorUserId=emp.gerente_id;
            const{data:gp}=await sb.from("perfiles").select("trial_start,subscription_status,logo,empresa").eq("id",emp.gerente_id).single();
            if(gp?.trial_start)ts=gp.trial_start;
            if(gp?.subscription_status)ss=gp.subscription_status;
            if(gp?.logo)setLogoGerente(gp.logo);
          }
        }
        setTrialStart(ts);
        setSubStatus(ss);
        let userIds=[session.user.id];
        if(p?.rol!=="chofer"&&p?.empresa_id){
          const{data:emp}=await sb.from("empresas").select("miembros").eq("id",p.empresa_id).single();
          if(emp?.miembros&&emp.miembros.length>0)userIds=emp.miembros;
        }
        const[{data:t},{data:s},{data:g},{data:gf},{data:v},{data:cl}]=await Promise.all([
          sb.from("tractoras").select("*").eq("user_id",tractorUserId),
          sb.from("semirremolques").select("*").eq("user_id",tractorUserId),
          sb.from("gastos").select("*").order("fecha",{ascending:false}),
          sb.from("gastos_fijos").select("*").eq("user_id",tractorUserId),
          sb.from("viajes").select("*").order("fecha",{ascending:false}).order("id",{ascending:false}),
          sb.from("clientes").select("*").order("nombre",{ascending:true}),
        ]);
        setTractoras(t||[]);setSemis(s||[]);setGastosTodos(g||[]);setGastosFijos(gf||[]);setViajesTodos(v||[]);setClientesTodos(cl||[]);
      }
      setLoading(false);
    });
  },[]);

  const handleAuth=async(u,p)=>{
    setUser(u);setPerfil(p);
    let tractorUserId=u.id;
    let ts=p?.trial_start||null;
    let ss=p?.subscription_status||"trial";
    if((p.rol==="chofer"||p.rol==="trafico")&&p.empresa_id){
      const{data:emp}=await sb.from("empresas").select("gerente_id").eq("id",p.empresa_id).single();
      if(emp?.gerente_id){
        tractorUserId=emp.gerente_id;
        const{data:gp}=await sb.from("perfiles").select("trial_start,subscription_status,logo").eq("id",emp.gerente_id).single();
        if(gp?.trial_start)ts=gp.trial_start;
        if(gp?.subscription_status)ss=gp.subscription_status;
        if(gp?.logo)setLogoGerente(gp.logo);
      }
    }
    setTrialStart(ts);
    setSubStatus(ss);
    let userIds=[u.id];
    if(p.rol!=="chofer"&&p.empresa_id){
      const{data:emp}=await sb.from("empresas").select("miembros").eq("id",p.empresa_id).single();
      if(emp?.miembros&&emp.miembros.length>0)userIds=emp.miembros;
    }
    const[{data:t},{data:s},{data:g},{data:gf},{data:v},{data:cl}]=await Promise.all([
      sb.from("tractoras").select("*").eq("user_id",tractorUserId),
      sb.from("semirremolques").select("*").eq("user_id",tractorUserId),
      sb.from("gastos").select("*").order("fecha",{ascending:false}),
      sb.from("gastos_fijos").select("*").eq("user_id",tractorUserId),
      sb.from("viajes").select("*").order("fecha",{ascending:false}).order("id",{ascending:false}),
      sb.from("clientes").select("*").order("nombre",{ascending:true}),
    ]);
    setTractoras(t||[]);setSemis(s||[]);setGastosTodos(g||[]);setGastosFijos(gf||[]);setViajesTodos(v||[]);setClientesTodos(cl||[]);
  };
  const handleLogout=async()=>{await sb.auth.signOut();setUser(null);setPerfil({});setTractoras([]);setSemis([]);setViajesTodos([]);setGastosTodos([]);setGastosFijos([]);};
  const updatePerfil=patch=>setPerfil(p=>({...p,...patch}));
  const[showAjustes,setShowAjustes]=useState(false);
  const[loadingPortal,setLoadingPortal]=useState(false);
  const abrirPortalCliente=async()=>{
    setLoadingPortal(true);
    const{data,error}=await sb.functions.invoke("create-portal-session",{body:{userId:user.id}});
    setLoadingPortal(false);
    if(error||!data?.url)return;
    window.location.href=data.url;
  };

  const accent=ACCENTS[perfil.accent_idx||0];
  const esGerente=perfil.rol==="gerente";
  const esTrafico=perfil.rol==="trafico";
  const days=getDaysLeft(trialStart||perfil.trial_start);

  if(path==="/blog")return(<BlogPage accent={accent} onHome={()=>navigate("/")} onLogin={()=>{setAuthMode("login");setShowAuth(true);navigate("/");}} onRegister={()=>{setAuthMode("register");setShowAuth(true);navigate("/");}} onOpenPost={slug=>navigate(`/blog/${slug}`)}/>);
  if(path.startsWith("/blog/"))return(<BlogPostPage slug={path.slice(6)} accent={accent} onHome={()=>navigate("/")} onLogin={()=>{setAuthMode("login");setShowAuth(true);navigate("/");}} onRegister={()=>{setAuthMode("register");setShowAuth(true);navigate("/");}} onBack={()=>navigate("/blog")} onOpenPost={slug=>navigate(`/blog/${slug}`)}/>);

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#08080F"}}><div className="spinner" style={{width:32,height:32,borderColor:"rgba(255,61,90,0.3)",borderTopColor:"#FF3D5A"}}/></div>);
  if(!user&&!showAuth)return(<LandingPage accent={accent} onLogin={()=>{setAuthMode("login");setShowAuth(true);}} onRegister={()=>{setAuthMode("register");setShowAuth(true);}} onBlog={()=>navigate("/blog")} onOpenPost={slug=>navigate(`/blog/${slug}`)}/>);
  if(!user)return(<><style>{makeCSS(accent)}</style><div className="app"><AuthPage onAuth={handleAuth} accent={accent} initialMode={authMode} onBack={()=>setShowAuth(false)}/></div></>);
  if(user&&!perfil.rol)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#08080F"}}><div className="spinner" style={{width:32,height:32,borderColor:"rgba(255,61,90,0.3)",borderTopColor:"#FF3D5A"}}/></div>);

  const accesoExtendido=perfil.acceso_hasta&&new Date(perfil.acceso_hasta)>new Date();
  const cuentaIlimitada=user?.email==="jimenezaguilera96@gmail.com";
  const suscrito=subStatus==="active"||accesoExtendido||cuentaIlimitada;
  if((days<=0&&!suscrito)||showPaywall)return(<><style>{makeCSS(accent)}</style><div className="app"><PaywallPage userId={esGerente?user.id:null} perfil={perfil} updatePerfil={updatePerfil} esGerente={esGerente} expired={days<=0&&!suscrito} onLogout={handleLogout} onClose={days>0?()=>setShowPaywall(false):null}/></div></>);

  const tabs=[{id:"inicio",lbl:"Inicio",icon:I.dash},...(esGerente?[{id:"flota",lbl:"Vehículos",icon:I.truck}]:[]),{id:"viajes",lbl:"Viajes",icon:I.trend},{id:"gastos",lbl:"Gastos",icon:I.coin},...(esGerente?[{id:"analizar",lbl:"Analizar",icon:I.analyze}]:[])];
  // El chofer solo ve su tractora asignada (perfil.truck_id); gerente y trafico ven toda la flota.
  const esChofer=perfil.rol==="chofer";
  const tractorasActivas=(esChofer?tractoras.filter(t=>t.id===perfil.truck_id):tractoras).filter(t=>t.activa!==false);
  const semisActivas=semis.filter(s=>s.activa!==false);
  const viajesVisibles=esChofer?viajesTodos.filter(v=>v.truck_id===perfil.truck_id):viajesTodos;
  const gastosVisibles=esChofer?gastosTodos.filter(g=>tractorasActivas.some(t=>t.id===g.vehicle_id)||semisActivas.some(s=>s.id===g.vehicle_id)):gastosTodos;
  const rolLabel=perfil.rol==="gerente"?"Gerente":perfil.rol==="trafico"?"Tráfico":"Chófer";

  return(
    <><style>{makeCSS(accent)}</style>
    <div className="app">
      <nav className="nav">{tabs.map(t=><button key={t.id} className={`nb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}><Icon d={t.icon} size={17}/>{t.lbl}</button>)}</nav>
      <div className="main">
      <div className="hdr">
        <div className="hdr-left">
          {(()=>{const logo=esGerente?perfil.logo:logoGerente||perfil.logo;return logo?<img src={logo} alt="" className="hdr-logo"/>:<div className="hdr-logo-ph"><svg width="20" height="20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>;})()}
          <div><div className="hdr-brand">{perfil.empresa||"FlotaRentable"}</div><div className="hdr-sub">{rolLabel} · {tractorasActivas.length} tractora{tractorasActivas.length!==1?"s":""}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          {esGerente&&subStatus!=="active"&&<button className="btn bp bsm" style={{padding:"0.3rem 0.6rem",width:"auto",fontSize:"0.72rem"}} onClick={()=>setShowPaywall(true)}>Activar plan</button>}
          {!suscrito&&<div className="trial-chip"><Icon d={I.clock} size={10} color="var(--muted)"/><span className="chip-d">{days}d</span></div>}
          {esGerente&&subStatus==="active"&&<button className="btn bg bsm" style={{padding:"0.3rem 0.6rem",width:"auto",fontSize:"0.72rem"}} onClick={abrirPortalCliente} disabled={loadingPortal}>{loadingPortal?<span className="spinner"/>:"Gestionar cuenta"}</button>}
          <button className="btn bg bsm" style={{padding:"0.35rem 0.5rem",width:"auto"}} onClick={()=>setShowAjustes(true)}><Icon d={I.settings} size={15}/></button>
        </div>
      </div>

      {showAjustes&&<AjustesModal userId={user.id} perfil={perfil} updatePerfil={updatePerfil} onClose={()=>setShowAjustes(false)} onLogout={handleLogout} tractoras={tractoras} theme={theme} setTheme={setTheme} clientesTodos={clientesTodos} setClientesTodos={setClientesTodos}/>}

      <HelpWidget/>

      {tab==="inicio"&&<InicioPage key={`inicio-${tractorasActivas.length}-${semisActivas.length}`} userId={user.id} tractoras={tractorasActivas} semis={semisActivas} perfil={perfil} esGerente={esGerente} gastosTodos={gastosVisibles} viajesTodos={viajesVisibles} setViajesTodos={setViajesTodos} gastosFijos={gastosFijos} setTab={setTab}/>}
      {tab==="flota"&&<FlotaPage userId={user.id} perfil={perfil} updatePerfil={updatePerfil} tractoras={tractoras} semis={semis} setTractoras={setTractoras} setSemis={setSemis}/>}
      {tab==="viajes"&&<ViajesPage key={`viajes-${tractorasActivas.length}-${semisActivas.length}`} userId={user.id} tractoras={tractorasActivas} semis={semisActivas} esGerente={esGerente} esTrafico={esTrafico} gastosTodos={gastosVisibles} gastosFijos={gastosFijos} viajesTodos={viajesVisibles} setViajesTodos={setViajesTodos} clientesTodos={clientesTodos} setClientesTodos={setClientesTodos}/>}
      {tab==="gastos"&&<GastosPage key={`gastos-${tractorasActivas.length}-${semisActivas.length}`} userId={user.id} tractoras={tractorasActivas} semis={semisActivas} esGerente={esGerente} accentIdx={perfil.accent_idx||0} gastosFijos={gastosFijos} setGastosFijos={setGastosFijos} gastosTodos={gastosVisibles} setGastosTodos={setGastosTodos}/>}
      {tab==="analizar"&&esGerente&&<AnalizarPage key={`analizar-${tractoras.length}-${semis.length}`} userId={user.id} tractoras={tractoras} semis={semis} gastosTodos={gastosTodos} viajesTodos={viajesTodos} gastosFijos={gastosFijos}/>}
      {tab==="analizar"&&!esGerente&&<div className="page"><div className="alert ay"><Icon d={I.lock} size={14} color="var(--yellow)"/><span>Esta seccion solo esta disponible para el gerente.</span></div></div>}
      </div>
    </div></>
  );
}
