import { useState } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { euros, eurosKm, pct, fmtDate, calcConsumoHistorico, precioGasoilDe, calcKmBetween } from "../lib/helpers.js";
import { CityInput, ConfirmModal, Toast } from "../components/ui.jsx";

export function ViajesPage({userId,tractoras,semis,esGerente,gastosTodos,viajesTodos,setViajesTodos}) {
  const[viajes,setViajes]=useState(viajesTodos||[]);
  const[modal,setModal]=useState(false);
  const[editando,setEditando]=useState(null);
  const[vuelta,setVuelta]=useState(false);
  const[toast,setToast]=useState("");
  const[confirm,setConfirm]=useState(null);
  const[oCoords,setOCoords]=useState(null);
  const[dCoords,setDCoords]=useState(null);
  const defaultT=tractoras[0];

  const getAutoSemi=tid=>{const t=tractoras.find(x=>x.id===tid);return t?.conjunto_fijo&&t?.semi_habitual_id?t.semi_habitual_id:"";};
  const emptyForm={fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",pais:"España",km:"",km_vuelta:"",peaje:"",precio:"",tiene_iva:false,tipo_iva:"21",truck_id:defaultT?.id||"",semi_id:getAutoSemi(defaultT?.id||"")};

  const handleO=(val,coords)=>{setOCoords(coords);if(coords&&dCoords){setModal(f=>({...f,origen:val,km:String(calcKmBetween(coords.lat,coords.lon,dCoords.lat,dCoords.lon))}));}else setModal(f=>({...f,origen:val}));};
  const handleD=(val,coords)=>{setDCoords(coords);if(coords&&oCoords){setModal(f=>({...f,destino:val,km:String(calcKmBetween(oCoords.lat,oCoords.lon,coords.lat,coords.lon))}));}else setModal(f=>({...f,destino:val}));};

  const calcIVA=()=>{const p=parseFloat(modal.precio)||0;const t=(parseFloat(modal.tipo_iva)||21)/100;const base=p/(1+t);return{base:base.toFixed(2),iva:(p-base).toFixed(2)};};

  const calcV=v=>{
    const t=tractoras.find(x=>x.id===v.truck_id);
    const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0);
    const precio=parseFloat(v.precio)||0;
    const peaje=parseFloat(v.peaje)||0;
    const consumo=t?calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32):32;
    const precioG=t?precioGasoilDe(t,gastosTodos):null;
    const costeG=precioG?km*(consumo/100)*precioG:0;
    const coste=costeG+peaje;
    return{coste,ben:precio-coste,margen:precio>0?((precio-coste)/precio)*100:0};
  };

  const openEdit=v=>{setEditando(v);setVuelta(!!v.km_vuelta);setOCoords(null);setDCoords(null);setModal({...emptyForm,...v,tiene_iva:v.tiene_iva||false,tipo_iva:v.tipo_iva||"21"});};
  const openNew=()=>{setEditando(null);setVuelta(false);setOCoords(null);setDCoords(null);setModal({...emptyForm,semi_id:getAutoSemi(defaultT?.id||"")});};

  const saveViaje=async()=>{
    if(!modal.truck_id){setToast("⚠️ Selecciona una tractora");return;}
    if(!modal.km||parseFloat(modal.km)<=0){setToast("⚠️ Introduce los km");return;}
    if(!modal.km&&(!modal.origen||!modal.destino)){setToast("⚠️ Introduce origen y destino o los km");return;}
    if(!modal.origen){setToast("⚠️ Introduce el origen");return;}
    if(!modal.destino){setToast("⚠️ Introduce el destino");return;}
    if(esGerente&&(!modal.precio||parseFloat(modal.precio)<=0)){setToast("⚠️ Introduce el precio");return;}
    const{base,iva}=calcIVA();
    const payload={fecha:modal.fecha,cliente:modal.cliente||"",origen:modal.origen||"",destino:modal.destino||"",pais:modal.pais||"España",km:parseFloat(modal.km)||0,km_vuelta:vuelta?(parseFloat(modal.km_vuelta)||0):null,peaje:parseFloat(modal.peaje)||0,precio:parseFloat(modal.precio)||0,tiene_iva:modal.tiene_iva||false,tipo_iva:modal.tipo_iva||"21",base_imponible:modal.tiene_iva?parseFloat(base):null,iva_amount:modal.tiene_iva?parseFloat(iva):null,truck_id:modal.truck_id||null,semi_id:modal.semi_id||null,user_id:String(userId)};
    if(editando?.id){
      const{error}=await sb.from("viajes").update(payload).eq("id",editando.id);
      if(error){setToast("❌ "+error.message);return;}
      const updated=viajes.map(v=>v.id===editando.id?{...v,...payload,id:editando.id}:v);
      setViajes(updated);
      if(setViajesTodos)setViajesTodos(viajesTodos.map(v=>v.id===editando.id?{...v,...payload,id:editando.id}:v));
      setToast("✅ Viaje actualizado");
    }else{
      const{data,error}=await sb.from("viajes").insert(payload).select();
      if(error){setToast("❌ "+error.message);return;}
      const nuevo=Array.isArray(data)?data[0]:data;
      if(nuevo){setViajes([nuevo,...viajes]);if(setViajesTodos)setViajesTodos([nuevo,...viajesTodos]);}
      setToast("✅ Viaje guardado");
    }
    setModal(false);setEditando(null);
  };

  const deleteViaje=async id=>{
    await sb.from("viajes").delete().eq("id",id);
    setViajes(viajes.filter(v=>v.id!==id));
    if(setViajesTodos)setViajesTodos(viajesTodos.filter(v=>v.id!==id));
    setToast("🗑️ Eliminado");
  };
  const selectedT=tractoras.find(t=>t.id===modal.truck_id);
  const conjuntoFijo=selectedT?.conjunto_fijo&&selectedT?.semi_habitual_id;

  return(<>
    {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
    {confirm&&<ConfirmModal msg="¿Eliminar este viaje?" onConfirm={()=>{deleteViaje(confirm.id);if(confirm.cerrar)setModal(false);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    <div className="page fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bp bsm" onClick={openNew}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>
      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Añade una tractora en <strong>Flota</strong> para registrar viajes.</span></div>}
      {viajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Toca el botón para añadir tu primera ruta</span></div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {viajes.map(v=>{
          const{coste,ben,margen}=calcV(v);
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          const t=tractoras.find(x=>x.id===v.truck_id);
          const s=semis.find(x=>x.id===v.semi_id);
          return(
            <div className="trip" key={v.id} onClick={()=>openEdit(v)}>
              <div className="ttop">
                <div style={{minWidth:0,flex:1}}><div className="troute" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.origen||"—"} → {v.destino||"—"}{v.pais&&v.pais!=="España"?" 🌍":""}</div><div className="tdate" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtDate(v.fecha)}{v.cliente?` · ${v.cliente}`:""}</div></div>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={e=>{e.stopPropagation();setConfirm({id:v.id,cerrar:false});}}><Icon d={I.trash} size={12}/></button>
              </div>
              <div className="trow">
                {t&&<span>🚛 {t.matricula}</span>}{s&&<span>🔧 {s.matricula}</span>}
                <span>📏 {v.km}km{v.km_vuelta?` + ${v.km_vuelta}km`:""}</span>
                {esGerente&&<span>💰 {euros(parseFloat(v.precio))}{v.tiene_iva?" (IVA)":""}</span>}
                {parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
              </div>
              {esGerente&&<div className="tfoot">
                <span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Gasoil est. + peajes: {euros(coste)} · <span style={{color:ben>=0?"var(--green)":"var(--red)"}}>{ben>=0?"+":""}{euros(ben)}</span></span>
                <span className={`badge ${ok?"bg-g":warn?"bg-y":"bg-r"}`} title="Margen sobre gasoil y peajes; no incluye gastos fijos de la flota">{bad?"🔴":warn?"🟡":"🟢"} {pct(margen)} <span style={{opacity:0.7,fontWeight:400}}>(sin fijos)</span></span>
              </div>}
            </div>
          );
        })}
      </div>}

    </div>
    {modal&&<div className="ov" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="mtitle">{editando?"Editar viaje":"Nuevo viaje"}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              {editando&&<button className="btn bd bsm" onClick={()=>setConfirm({id:editando.id,cerrar:true})}><Icon d={I.trash} size={14}/></button>}
              <button className="btn bg bsm" onClick={()=>setModal(false)}>✕</button>
            </div>
          </div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={modal.fecha} onChange={e=>setModal({...modal,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Cliente</label><input className="inp" placeholder="Nombre" value={modal.cliente} onChange={e=>setModal({...modal,cliente:e.target.value})}/></div>
          </div>
          <div className="fld"><label className="lbl">Origen <span style={{color:"var(--red)"}}>*</span></label><CityInput value={modal.origen} onChange={v=>setModal(f=>({...f,origen:v}))} onSelect={s=>handleO(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="fld"><label className="lbl">Destino <span style={{color:"var(--red)"}}>*</span></label><CityInput value={modal.destino} onChange={v=>setModal(f=>({...f,destino:v}))} onSelect={s=>handleD(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="fld"><label className="lbl">Km de ida <span style={{color:"var(--red)"}}>*</span> {oCoords&&dCoords?<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· aprox. calculado</span>:""}</label><input className="inp" type="number" placeholder="0" value={modal.km} onChange={e=>setModal({...modal,km:e.target.value})}/>
            {oCoords&&dCoords&&<div style={{fontSize:"0.68rem",color:"var(--muted)"}}>Estimación por carretera (línea recta × 1,25). Ajusta el valor si conoces el km exacto.</div>}
          </div>
          <div className="toggle-row"><span className="toggle-lbl">↩️ Vuelta sin carga</span><button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/></div>
          {vuelta&&<div className="fld"><label className="lbl">Km de vuelta</label><input className="inp" type="number" placeholder={modal.km||"0"} value={modal.km_vuelta} onChange={e=>setModal({...modal,km_vuelta:e.target.value})}/></div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes (€)</label><input className="inp" type="number" placeholder="0" value={modal.peaje} onChange={e=>setModal({...modal,peaje:e.target.value})}/></div>
            {esGerente&&<div className="fld"><label className="lbl">Precio cobrado (€) <span style={{fontSize:"0.68rem",color:"var(--muted)",fontWeight:400}}>(IVA incluido)</span></label><input className="inp" type="number" placeholder="0" value={modal.precio} onChange={e=>setModal({...modal,precio:e.target.value})}/></div>}
          </div>
          {esGerente&&(()=>{
            const km=(parseFloat(modal.km)||0)+(parseFloat(modal.km_vuelta)||0);
            const precio=parseFloat(modal.precio)||0;
            const peaje=parseFloat(modal.peaje)||0;
            const t=tractoras.find(x=>x.id===modal.truck_id);
            const consumo=parseFloat(t?.consumo_estimado)||32;
            const precioG=t?(precioGasoilDe(t,gastosTodos)||1.65):1.65;
            const costeGasoil=km*(consumo/100)*precioG;
            const costTotal=costeGasoil+peaje;
            const precioMin=costTotal*1.15;
            const kmRate=km>0?precio/km:0;
            const kmMin=km>0?precioMin/km:0;
            if(km>0&&precio>0){
              const ok=precio>=precioMin;
              return<div style={{background:ok?"#06D6A012":"#FF3D5A12",border:`1px solid ${ok?"#06D6A030":"#FF3D5A30"}`,borderRadius:"var(--r2)",padding:"0.75rem",fontSize:"0.8rem"}}>
                <div style={{fontWeight:700,color:ok?"var(--green)":"var(--red)",marginBottom:"0.25rem"}}>{ok?"Viaje rentable":"Viaje en perdida"}</div>
                <div style={{color:"var(--muted)",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
                  <span>Tu precio: {eurosKm(kmRate)} · Minimo recomendado: {eurosKm(kmMin)}</span>
                  {!ok&&<span style={{color:"var(--red)",fontWeight:600}}>Deberia cobrarse minimo {euros(precioMin)}</span>}
                </div>
              </div>;
            }
            return null;
          })()}
          {esGerente&&modal.tiene_iva&&<><div className="fld"><label className="lbl">Tipo IVA (%)</label><input className="inp" type="number" value={modal.tipo_iva} onChange={e=>setModal({...modal,tipo_iva:e.target.value})}/></div>
          {modal.precio&&<div className="iva-box"><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--muted)"}}>Base imponible</span><span>{euros(parseFloat(calcIVA().base))}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--muted)"}}>IVA ({modal.tipo_iva}%)</span><span style={{color:"var(--yellow)"}}>{euros(parseFloat(calcIVA().iva))}</span></div><div style={{display:"flex",justifyContent:"space-between",fontWeight:700}}><span>Total</span><span>{euros(parseFloat(modal.precio))}</span></div></div>}</>}
          {tractoras.length>0&&<div className="fld"><label className="lbl">Tractora</label><select className="inp sel" value={modal.truck_id} onChange={e=>setModal({...modal,truck_id:e.target.value,semi_id:getAutoSemi(e.target.value)})}>{tractoras.map(t=><option key={t.id} value={t.id}>{t.matricula||"Sin mat."}{t.apodo?` "${t.apodo}"`:"" }</option>)}</select></div>}
          {semis.length>0&&<div className="fld"><label className="lbl">Semirremolque{conjuntoFijo?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · conjunto fijo</span>:""}</label>
            <select className="inp sel" value={modal.semi_id} onChange={e=>setModal({...modal,semi_id:e.target.value})} disabled={!!conjuntoFijo}>
              <option value="">Sin semirremolque</option>{semis.map(s=><option key={s.id} value={s.id}>{s.matricula||"Sin mat."} — {s.subtipo}</option>)}
            </select></div>}
          <div className="mact"><button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={saveViaje}>{editando?"Actualizar":"Guardar"}</button></div>
        </div>
      </div>}
  </>);
}

// ── RESUMEN PAGE ──────────────────────────────────────────────────────────────
