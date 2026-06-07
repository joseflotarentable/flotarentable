import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { TIPOS_T, TIPOS_S } from "../lib/constants.js";
import { ConfirmModal, PhotoUpload, Toast } from "../components/ui.jsx";

export function FlotaPage({userId,perfil,updatePerfil,tractoras,semis,setTractoras,setSemis}) {
  const[editT,setEditT]=useState(null);
  const[editS,setEditS]=useState(null);
  const[confirmFlota,setConfirmFlota]=useState(null);

  const saveT=async t=>{const p={...t,user_id:userId};if(t.id){await sb.from("tractoras").update(p).eq("id",t.id);}else{await sb.from("tractoras").insert({...p,id:undefined});}const{data}=await sb.from("tractoras").select("*").eq("user_id",userId);setTractoras(data||[]);setEditT(null);};
  const deleteT=async id=>{const fecha=new Date().toISOString().slice(0,10);await sb.from("tractoras").update({activa:false,fecha_baja:fecha}).eq("id",id);setTractoras(tractoras.map(x=>x.id===id?{...x,activa:false,fecha_baja:fecha}:x));};
  const saveS=async s=>{const p={...s,user_id:userId};if(s.id){await sb.from("semirremolques").update(p).eq("id",s.id);}else{await sb.from("semirremolques").insert({...p,id:undefined});}const{data}=await sb.from("semirremolques").select("*").eq("user_id",userId);setSemis(data||[]);setEditS(null);};
  const deleteS=async id=>{const fecha=new Date().toISOString().slice(0,10);await sb.from("semirremolques").update({activa:false,fecha_baja:fecha}).eq("id",id);setSemis(semis.map(x=>x.id===id?{...x,activa:false,fecha_baja:fecha}:x));};

  if(editT)return<TruckForm t={editT} semis={semis} onSave={saveT} onCancel={()=>setEditT(null)} onDelete={deleteT}/>;
  if(editS)return<SemiForm s={editS} onSave={saveS} onCancel={()=>setEditS(null)} onDelete={deleteS}/>;

  return(
    <div className="page fu">
      <div className="ptitle">Flota</div>
      <div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🚛 Tractoras</span>
            <button className="btn bg bsm" onClick={()=>setEditT({subtipo:"Tractora",conjunto_fijo:false})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {tractoras.filter(t=>t.activa!==false).length===0&&<div className="empty" style={{padding:"1rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin tractoras</span><button className="btn bp bsm" style={{marginTop:"0.5rem"}} onClick={()=>setEditT({subtipo:"Tractora",conjunto_fijo:false})}><Icon d={I.plus} size={13}/> Añadir tractora</button></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {tractoras.filter(t=>t.activa!==false).map(t=>{const semi=semis.find(s=>s.id===t.semi_habitual_id);
              const consumo=parseFloat(t.consumo_estimado)||32;
              const precioG=parseFloat(t.precio_gasoil_inicial)||1.65;
              const combustibleKm=(consumo/100)*precioG;
              return(
              <div key={t.id} className="vcard" onClick={()=>setEditT(t)}>
                <div className="vcard-foto">{t.foto?<img src={t.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="var(--muted)"/>}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.875rem"}}>{t.matricula||"Sin matrícula"}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{t.subtipo||"Tractora"}</div>
                  {t.apodo&&<div style={{fontSize:"0.7rem",color:"var(--a2)",marginTop:1,fontWeight:600}}>"{t.apodo}"</div>}
                  {semi&&<div className="semi-tag" style={{marginTop:3}}><Icon d={I.link} size={10}/>{semi.matricula}{t.conjunto_fijo?" · fijo":""}</div>}
                  <div style={{fontSize:"0.7rem",color:"var(--a1)",marginTop:3,fontWeight:600}}>~{combustibleKm.toFixed(3).replace(".",",")} €/km combustible est.</div>
                </div>
                <Icon d={I.edit} size={15} color="var(--muted)"/>
              </div>
            );})}
          </div>
          {tractoras.filter(t=>t.activa===false).length>0&&<div style={{marginTop:"1rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem"}}>Vehículos dados de baja</div>
            {confirmFlota&&<ConfirmModal msg={confirmFlota.msg} onConfirm={confirmFlota.onConfirm} onCancel={()=>setConfirmFlota(null)}/>}
            {tractoras.filter(t=>t.activa===false).map(t=>(
              <div key={t.id} className="vcard" style={{opacity:0.5}}>
                <div className="vcard-foto"><Icon d={I.truck} size={18} color="var(--muted)"/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.875rem"}}>{t.matricula||"Sin matrícula"}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>Baja: {t.fecha_baja||"—"}</div>
                </div>
                <div style={{display:"flex",gap:"0.4rem"}}>
                  <button className="btn bg bsm" onClick={async e=>{e.stopPropagation();await sb.from("tractoras").update({activa:true,fecha_baja:null}).eq("id",t.id);setTractoras(tractoras.map(x=>x.id===t.id?{...x,activa:true,fecha_baja:null}:x));}}>Reactivar</button>
                  <button className="btn bd bsm" onClick={e=>{e.stopPropagation();setConfirmFlota({msg:`¿Eliminar ${t.matricula||"esta tractora"} definitivamente?`,onConfirm:async()=>{await sb.from("tractoras").delete().eq("id",t.id);setTractoras(tractoras.filter(x=>x.id!==t.id));setConfirmFlota(null);}});}}><Icon d={I.trash} size={13}/></button>
                </div>
              </div>
            ))}
          </div>}
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🔧 Semirremolques</span>
            <button className="btn bg bsm" onClick={()=>setEditS({subtipo:"Tautliner"})}><Icon d={I.plus} size={13}/> Añadir</button>
          </div>
          {semis.length===0&&<div className="empty" style={{padding:"1rem"}}><div className="ei"><Icon d={I.truck} size={18} color="var(--muted)"/></div><span style={{fontSize:"0.8rem"}}>Sin semirremolques</span><button className="btn bp bsm" style={{marginTop:"0.5rem"}} onClick={()=>setEditS({subtipo:"Tautliner"})}><Icon d={I.plus} size={13}/> Añadir semirremolque</button></div>}
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {semis.map(s=><div key={s.id} className="vcard" onClick={()=>setEditS(s)}>
              <div className="vcard-foto">{s.foto?<img src={s.foto} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<Icon d={I.truck} size={18} color="#06D6A0"/>}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"0.875rem"}}>{s.matricula||"Sin matrícula"}</div><div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{s.subtipo}</div>{s.apodo&&<div style={{fontSize:"0.7rem",color:"var(--a2)",marginTop:1,fontWeight:600}}>"{s.apodo}"</div>}</div>
              <Icon d={I.edit} size={15} color="var(--muted)"/>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TruckForm({t,semis,onSave,onCancel,onDelete}) {
  const[form,setForm]=useState(t||{subtipo:"Tractora",conjunto_fijo:false});
  const[toast,setToast]=useState("");
  return(
    <div className="page fu">
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}><button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button><div className="ptitle">{form.matricula||"Nueva tractora"}</div></div>
        {form.id&&<button className="btn bd bsm" onClick={()=>{onDelete(form.id);onCancel();}} style={{fontSize:"0.75rem",padding:"0.35rem 0.75rem"}}>Dar de baja</button>}
      </div>
      <div className="card">
        <div className="chd">Datos del vehículo</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula <span style={{color:"var(--red)"}}>*</span></label><input className="inp" type="text" value={form.matricula||""} placeholder="1234 ABC" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="El Titán" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.subtipo||"Tractora"} onChange={e=>setForm({...form,subtipo:e.target.value})}>{TIPOS_T.map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="fld"><label className="lbl">Consumo L/100km <span style={{color:"var(--red)"}}>*</span></label><input className="inp" type="number" value={form.consumo_estimado||""} placeholder="32" onChange={e=>setForm({...form,consumo_estimado:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Precio gasoil actual (€/L) <span style={{color:"var(--red)"}}>*</span></label><input className="inp" type="number" value={form.precio_gasoil_inicial||""} placeholder="1,65" onChange={e=>setForm({...form,precio_gasoil_inicial:e.target.value})}/></div>
        </div>
        <div className="alert ay" style={{marginTop:"0.75rem"}}><Icon d={I.alert} size={14} color="var(--yellow)"/><span>El consumo y el precio del gasoil son <b>obligatorios</b>: sin ellos la app no puede calcular el coste real ni la rentabilidad de tus viajes (verías márgenes "perfectos" que en realidad no lo son).</span></div>
      </div>
      {semis.length>0&&<div className="card">
        <div className="chd">Conjunto habitual</div>
        <div className="fld" style={{marginBottom:"0.625rem"}}><label className="lbl">Semirremolque habitual</label>
          <select className="inp sel" value={form.semi_habitual_id||""} onChange={e=>setForm({...form,semi_habitual_id:e.target.value})}>
            <option value="">Sin semirremolque fijo</option>{semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
          </select></div>
        {form.semi_habitual_id&&<div className="toggle-row"><span className="toggle-lbl">Siempre va el mismo conjunto</span><button className={`toggle ${form.conjunto_fijo?"on":""}`} onClick={()=>setForm({...form,conjunto_fijo:!form.conjunto_fijo})}/></div>}
      </div>}
      <div className="card">
        <div className="chd">Alertas de mantenimiento</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {[["fecha_itv","📋 Próxima ITV"],["fecha_seguro_vto","🛡️ Vencimiento seguro"],["fecha_aceite","🔧 Próximo cambio aceite"],["fecha_tarjeta","📄 Tarjeta de transporte"]].map(([k,l])=>(
            <div className="fld" key={k}><label className="lbl">{l}</label><input className="inp" type="date" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}><button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={()=>{
        if(!form.matricula?.trim()){setToast("⚠️ La matrícula es obligatoria");return;}
        if(!form.consumo_estimado||parseFloat(form.consumo_estimado)<=0){setToast("⚠️ Indica el consumo medio (L/100km): es necesario para calcular el coste real de tus viajes.");return;}
        if(!form.precio_gasoil_inicial||parseFloat(form.precio_gasoil_inicial)<=0){setToast("⚠️ Indica el precio actual del gasoil (€/L): es necesario para calcular el coste real de tus viajes.");return;}
        onSave(form);
      }}>Guardar</button></div>
    </div>
  );
}

export function SemiForm({s,onSave,onCancel,onDelete}) {
  const[form,setForm]=useState(s||{subtipo:"Tautliner"});
  const[toast,setToast]=useState("");
  return(
    <div className="page fu">
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}><button className="btn bg bsm" style={{width:"auto",padding:"0.45rem 0.75rem"}} onClick={onCancel}><Icon d={I.back} size={14}/></button><div className="ptitle">{form.matricula||"Nuevo semirremolque"}</div></div>
        {form.id&&<button className="btn bd bsm" onClick={()=>{onDelete(form.id);onCancel();}} style={{fontSize:"0.75rem",padding:"0.35rem 0.75rem"}}>Dar de baja</button>}
      </div>
      <div className="card">
        <div className="chd">Datos</div>
        <PhotoUpload value={form.foto} onChange={v=>setForm({...form,foto:v})} label="Foto"/>
        <div className="g2" style={{marginTop:"0.75rem"}}>
          <div className="fld"><label className="lbl">Matrícula <span style={{color:"var(--red)"}}>*</span></label><input className="inp" type="text" value={form.matricula||""} placeholder="R-1234" onChange={e=>setForm({...form,matricula:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Apodo</label><input className="inp" type="text" value={form.apodo||""} placeholder="opcional" onChange={e=>setForm({...form,apodo:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={form.subtipo||"Tautliner"} onChange={e=>setForm({...form,subtipo:e.target.value})}>{TIPOS_S.map(o=><option key={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div className="card">
        <div className="chd">Alertas</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          <div className="fld"><label className="lbl">📋 Próxima ITV remolque</label><input className="inp" type="date" value={form.fecha_itv||""} onChange={e=>setForm({...form,fecha_itv:e.target.value})}/></div>
          <div className="fld"><label className="lbl">🛡️ Vencimiento seguro</label><input className="inp" type="date" value={form.fecha_seguro_vto||""} onChange={e=>setForm({...form,fecha_seguro_vto:e.target.value})}/></div>
        </div>
      </div>
      {form.subtipo==="Frigorífico"&&<div className="card">
        <div className="chd">🧊 Motor frigorífico</div>
        <div style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:"0.75rem"}}>El motor del frigo tiene su propio mantenimiento independiente del semirremolque</div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          <div className="fld"><label className="lbl">🔧 Próximo cambio aceite motor frigo</label><input className="inp" type="date" value={form.frigo_fecha_aceite||""} onChange={e=>setForm({...form,frigo_fecha_aceite:e.target.value})}/></div>
          <div className="fld"><label className="lbl">⚙️ Próxima revisión motor frigo</label><input className="inp" type="date" value={form.frigo_fecha_revision||""} onChange={e=>setForm({...form,frigo_fecha_revision:e.target.value})}/></div>
          <div className="fld"><label className="lbl">🌡️ Última revisión gas refrigerante</label><input className="inp" type="date" value={form.frigo_fecha_gas||""} onChange={e=>setForm({...form,frigo_fecha_gas:e.target.value})}/></div>
          <div className="fld"><label className="lbl">Marca motor frigo</label><input className="inp" type="text" value={form.frigo_marca||""} placeholder="Thermo King, Carrier..." onChange={e=>setForm({...form,frigo_marca:e.target.value})}/></div>
        </div>
      </div>}
      <div style={{display:"flex",gap:"0.75rem"}}><button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={()=>{if(!form.matricula?.trim()){setToast("⚠️ La matrícula es obligatoria");return;}onSave(form);}}>Guardar</button></div>
    </div>
  );
}

// ── GASTOS PAGE ───────────────────────────────────────────────────────────────
export function CustomConceptoRow({entidadId, saveFijo}) {
  const[nombre,setNombre]=useState("");
  const[importe,setImporte]=useState("");
  const[guardado,setGuardado]=useState(false);
  const guardar=()=>{
    const n=nombre.trim();
    const imp=parseFloat(importe);
    if(!n||!imp)return;
    saveFijo(entidadId,n,imp,"mensual");
    setNombre("");setImporte("");setGuardado(true);
    setTimeout(()=>setGuardado(false),2000);
  };
  return(
    <div style={{marginTop:"0.5rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
      <div style={{fontSize:"0.72rem",color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Añadir concepto personalizado</div>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
        <input className="inp" placeholder="Nombre del concepto" value={nombre} onChange={e=>setNombre(e.target.value)} onKeyDown={e=>e.key==="Enter"&&importe&&guardar()} style={{flex:2,fontSize:"0.82rem",padding:"0.4rem 0.625rem"}}/>
        <input className="inp" type="number" placeholder="€/mes" value={importe} onChange={e=>setImporte(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nombre&&guardar()} style={{flex:1,fontSize:"0.82rem",padding:"0.4rem 0.625rem"}}/>
        <button className="btn bp bsm" onClick={guardar} style={{padding:"0.4rem 0.75rem",fontSize:"0.8rem",whiteSpace:"nowrap"}}>{guardado?"✓ Guardado":"Añadir"}</button>
      </div>
    </div>
  );
}

