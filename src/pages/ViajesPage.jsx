import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { euros, eurosKm, pct, fmtDate, calcConsumoHistorico, precioGasoilDe, calcKmRutaCamion, calcCosteFijoKm } from "../lib/helpers.js";
import { CityInput, ConfirmModal, Toast, PhotoUpload } from "../components/ui.jsx";

export function ViajesPage({userId,tractoras,semis,esGerente,esTrafico,gastosTodos,gastosFijos,viajesTodos,setViajesTodos,clientesTodos}) {
  const[viajes,setViajes]=useState(viajesTodos||[]);
  const[modal,setModal]=useState(false);
  const[editando,setEditando]=useState(null);
  const[vuelta,setVuelta]=useState(false);
  const[toast,setToast]=useState("");
  const[confirm,setConfirm]=useState(null);
  const[oCoords,setOCoords]=useState(null);
  const[dCoords,setDCoords]=useState(null);
  const[lCoords,setLCoords]=useState(null);
  const defaultT=tractoras[0];
  const[nombres,setNombres]=useState({});
  useEffect(()=>{if(esGerente)sb.from("perfiles").select("id,nombre").then(({data})=>{const m={};(data||[]).forEach(p=>m[p.id]=p.nombre);setNombres(m);});},[esGerente]);

  const getAutoSemi=tid=>{const t=tractoras.find(x=>x.id===tid);return t?.conjunto_fijo&&t?.semi_habitual_id?t.semi_habitual_id:"";};
  const emptyForm={fecha:new Date().toISOString().slice(0,10),cliente:"",origen:"",destino:"",pais:"España",km:"",km_vuelta:"",peaje:"",precio:"",tiene_iva:false,tipo_iva:"21",truck_id:defaultT?.id||"",semi_id:getAutoSemi(defaultT?.id||""),cmr_foto:"",indicaciones:"",lugar_carga:"",km_vacio:"",ubicacion_maps:"",cobrado:false,fecha_cobro:"",destino2:""};

  const handleCliente=val=>{
    const cliente=(clientesTodos||[]).find(c=>c.nombre.toLowerCase()===val.trim().toLowerCase());
    setModal(f=>{
      const next={...f,cliente:val};
      if(cliente?.tarifa_km&&!f.precio&&parseFloat(f.km)>0){
        const km=(parseFloat(f.km)||0)+(parseFloat(f.km_vuelta)||0)+(parseFloat(f.km_vacio)||0);
        next.precio=(cliente.tarifa_km*km).toFixed(2);
      }
      return next;
    });
  };

  const[calculandoKm,setCalculandoKm]=useState(false);
  const[calculandoKmVacio,setCalculandoKmVacio]=useState(false);
  const aplicarRuta=async(o,d)=>{
    if(!o||!d)return;
    setCalculandoKm(true);
    const km=await calcKmRutaCamion(o.lat,o.lon,d.lat,d.lon);
    setCalculandoKm(false);
    setModal(f=>({...f,km:String(km)}));
  };
  const[d2Coords,setD2Coords]=useState(null);
  const recalcRuta=async(o,d,d2)=>{
    if(!o||!d)return;
    setCalculandoKm(true);
    let km=await calcKmRutaCamion(o.lat,o.lon,d.lat,d.lon);
    if(d2){const km2=await calcKmRutaCamion(d.lat,d.lon,d2.lat,d2.lon);km+=km2;}
    setCalculandoKm(false);
    setModal(f=>({...f,km:String(Math.round(km))}));
  };
  const handleD2=(val,coords)=>{setD2Coords(coords);setModal(f=>({...f,destino2:val}));if(coords&&oCoords&&dCoords)recalcRuta(oCoords,dCoords,coords);};
  const swapDestinos=()=>{
    const newDestino=modal.destino2.trim(),newDestino2=modal.destino;
    const newDCoords=d2Coords,newD2Coords=dCoords;
    setModal(f=>({...f,destino:newDestino,destino2:newDestino2}));
    setDCoords(newDCoords);setD2Coords(newD2Coords);
    if(oCoords&&newDCoords)recalcRuta(oCoords,newDCoords,newD2Coords);
  };
  const aplicarRutaVacio=async(o,l)=>{
    if(!o||!l)return;
    setCalculandoKmVacio(true);
    const km=await calcKmRutaCamion(o.lat,o.lon,l.lat,l.lon);
    setCalculandoKmVacio(false);
    setModal(f=>({...f,km_vacio:String(km)}));
  };
  const handleO=(val,coords)=>{setOCoords(coords);setModal(f=>({...f,origen:val}));if(coords&&dCoords)recalcRuta(coords,dCoords,d2Coords);if(coords&&lCoords)aplicarRutaVacio(coords,lCoords);};
  const handleD=(val,coords)=>{setDCoords(coords);setModal(f=>({...f,destino:val}));if(coords&&oCoords)recalcRuta(oCoords,coords,d2Coords);};
  const handleL=(val,coords)=>{setLCoords(coords);setModal(f=>({...f,lugar_carga:val}));if(coords&&oCoords)aplicarRutaVacio(oCoords,coords);};

  const calcIVA=()=>{const p=parseFloat(modal.precio)||0;const t=(parseFloat(modal.tipo_iva)||21)/100;const base=p/(1+t);return{base:base.toFixed(2),iva:(p-base).toFixed(2)};};

  const calcV=v=>{
    const t=tractoras.find(x=>x.id===v.truck_id);
    const km=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0)+(parseFloat(v.km_vacio)||0);
    const precio=parseFloat(v.precio)||0;
    const peaje=parseFloat(v.peaje)||0;
    const consumo=t?calcConsumoHistorico(gastosTodos,t.id)||(parseFloat(t.consumo_estimado)||32):32;
    const precioG=t?precioGasoilDe(t,gastosTodos):null;
    const costeG=precioG?km*(consumo/100)*precioG:0;
    const coste=costeG+peaje;
    return{coste,ben:precio-coste,margen:precio>0?((precio-coste)/precio)*100:0};
  };

  const openEdit=v=>{setEditando(v);setVuelta(!!v.km_vuelta);setOCoords(null);setDCoords(null);setLCoords(null);setModal({...emptyForm,...v,tiene_iva:v.tiene_iva||false,tipo_iva:v.tipo_iva||"21"});};
  const openNew=()=>{setEditando(null);setVuelta(false);setOCoords(null);setDCoords(null);setLCoords(null);setModal({...emptyForm,semi_id:getAutoSemi(defaultT?.id||"")});};

  const saveViaje=async()=>{
    if(!modal.truck_id){setToast("⚠️ Selecciona una tractora");return;}
    if(!modal.km||parseFloat(modal.km)<=0){setToast("⚠️ Introduce los km");return;}
    if(!modal.km&&(!modal.origen||!modal.destino)){setToast("⚠️ Introduce origen y destino o los km");return;}
    if(!modal.origen){setToast("⚠️ Introduce el origen");return;}
    if(!modal.destino){setToast("⚠️ Introduce el destino");return;}
    if(esGerente&&(!modal.precio||parseFloat(modal.precio)<=0)){setToast("⚠️ Introduce el precio");return;}
    const{base,iva}=calcIVA();
    const payload={fecha:modal.fecha,cliente:modal.cliente||"",origen:modal.origen||"",destino:modal.destino||"",pais:modal.pais||"España",km:parseFloat(modal.km)||0,km_vuelta:vuelta?(parseFloat(modal.km_vuelta)||0):null,peaje:parseFloat(modal.peaje)||0,precio:parseFloat(modal.precio)||0,tiene_iva:modal.tiene_iva||false,tipo_iva:modal.tipo_iva||"21",base_imponible:modal.tiene_iva?parseFloat(base):null,iva_amount:modal.tiene_iva?parseFloat(iva):null,truck_id:modal.truck_id||null,semi_id:modal.semi_id||null,cmr_foto:modal.cmr_foto||null,indicaciones:modal.indicaciones||null,lugar_carga:modal.lugar_carga&&modal.lugar_carga.trim()?modal.lugar_carga.trim():null,km_vacio:modal.lugar_carga&&modal.lugar_carga.trim()?(parseFloat(modal.km_vacio)||0):null,ubicacion_maps:modal.ubicacion_maps?.trim()||null,cobrado:modal.cobrado||false,fecha_cobro:modal.cobrado&&modal.fecha_cobro?modal.fecha_cobro:null,destino2:modal.destino2&&modal.destino2.trim()?modal.destino2.trim():null,user_id:String(userId)};
    const resumen=()=>{
      const ruta=`${payload.origen} → ${payload.destino}`;
      if(!esGerente)return ruta;
      const{ben}=calcV(payload);
      return `${ruta} · beneficio estimado ${euros(ben)}`;
    };
    if(editando?.id){
      const{error}=await sb.from("viajes").update(payload).eq("id",editando.id);
      if(error){setToast("❌ "+error.message);return;}
      const updated=viajes.map(v=>v.id===editando.id?{...v,...payload,id:editando.id}:v);
      setViajes(updated);
      if(setViajesTodos)setViajesTodos(viajesTodos.map(v=>v.id===editando.id?{...v,...payload,id:editando.id}:v));
      setToast(`✅ Actualizado: ${resumen()}`);
    }else{
      const{data,error}=await sb.from("viajes").insert(payload).select();
      if(error){setToast("❌ "+error.message);return;}
      const nuevo=Array.isArray(data)?data[0]:data;
      if(nuevo){setViajes([nuevo,...viajes]);if(setViajesTodos)setViajesTodos([nuevo,...viajesTodos]);}
      setToast(`✅ Guardado: ${resumen()}`);
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
      <div className="phead" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Viajes</div>
        <button className="btn bp bsm" onClick={openNew}><Icon d={I.plus} size={14}/> Añadir</button>
      </div>
      {tractoras.length===0&&<div className="alert ay"><Icon d={I.alert} size={14} color="var(--yellow)"/><span>Añade una tractora en <strong>Flota</strong> para registrar viajes.</span></div>}
      {viajes.length===0?<div className="empty"><div className="ei"><Icon d={I.truck} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin viajes</strong><span style={{fontSize:"0.8rem"}}>Registra tu primera ruta para empezar a ver tu rentabilidad</span></div><button className="btn bp bsm" style={{marginTop:"0.75rem"}} onClick={openNew}><Icon d={I.plus} size={13}/> Añadir mi primer viaje</button></div>
      :<div className="trip-list" style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {(()=>{const costeFijoKm=esGerente?calcCosteFijoKm(tractoras,gastosFijos||[],gastosTodos,viajesTodos):0;return viajes.map(v=>{
          const{coste,ben,margen}=calcV(v);
          const kmTotalV=(parseFloat(v.km)||0)+(parseFloat(v.km_vuelta)||0)+(parseFloat(v.km_vacio)||0);
          const costeFijo=costeFijoKm*kmTotalV;
          const benNeto=ben-costeFijo;
          const ok=margen>=15,warn=margen>=0&&margen<15,bad=margen<0;
          const t=tractoras.find(x=>x.id===v.truck_id);
          const s=semis.find(x=>x.id===v.semi_id);
          return(
            <div className="trip" key={v.id} onClick={()=>openEdit(v)}>
              <div className="ttop">
                <div style={{minWidth:0,flex:1}}><div className="troute" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.origen||"—"}{v.lugar_carga?` ⇢ ${v.lugar_carga}`:""} → {v.destino||"—"}{v.destino2?` → ${v.destino2}`:""}{v.pais&&v.pais!=="España"?" 🌍":""}{v.cmr_foto?" 📄":""}</div><div className="tdate" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtDate(v.fecha)}{v.cliente?` · ${v.cliente}`:""}{esGerente&&v.user_id&&nombres[v.user_id]?` · añadido por ${nombres[v.user_id]}`:""}</div></div>
                <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={e=>{e.stopPropagation();setConfirm({id:v.id,cerrar:false});}}><Icon d={I.trash} size={12}/></button>
              </div>
              <div className="trow">
                {t&&<span>🚛 {t.matricula}</span>}{s&&<span>🔧 {s.matricula}</span>}
                <span>📏 {v.km}km{v.km_vacio?` + ${v.km_vacio}km vacío`:""}{v.km_vuelta?` + ${v.km_vuelta}km vuelta`:""}</span>
                {esGerente&&<span>💰 {euros(parseFloat(v.precio))}{v.tiene_iva?" (IVA)":""}</span>}
                {esGerente&&parseFloat(v.precio)>0&&!v.cobrado&&<span style={{color:"var(--yellow)"}}>🟡 Pendiente de cobro</span>}
                {esGerente&&parseFloat(v.precio)>0&&v.cobrado&&<span style={{color:"var(--green)"}}>✅ Cobrado</span>}
                {parseFloat(v.peaje)>0&&<span>🛣️ {euros(parseFloat(v.peaje))}</span>}
                {(v.ubicacion_maps||v.destino)&&<a href={v.ubicacion_maps||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.destino)}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{color:"var(--a2)",textDecoration:"none"}}>🗺️ Maps</a>}
              </div>
              {v.indicaciones&&<div style={{fontSize:"0.73rem",color:"var(--muted)",marginTop:"0.2rem"}}>📍 {v.indicaciones}</div>}
              {esGerente&&<div className="tfoot" style={{flexDirection:"column",alignItems:"flex-start",gap:"0.2rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center"}}>
                  <span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Gasoil est. + peajes: {euros(coste)} · <span style={{color:ben>=0?"var(--green)":"var(--red)"}}>{ben>=0?"+":""}{euros(ben)}</span></span>
                  <span className={`badge ${ok?"bg-g":warn?"bg-y":"bg-r"}`} title="Margen sobre gasoil y peajes; no incluye gastos fijos de la flota">{bad?"🔴":warn?"🟡":"🟢"} {pct(margen)} <span style={{opacity:0.7,fontWeight:400}}>(sin fijos)</span></span>
                </div>
                {costeFijoKm>0&&<span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Con fijos prorrateados (-{euros(costeFijo)}): beneficio neto <span style={{fontWeight:700,color:benNeto>=0?"var(--green)":"var(--red)"}}>{benNeto>=0?"+":""}{euros(benNeto)}</span></span>}
              </div>}
            </div>
          );
        });})()}
      </div>}

    </div>
    {modal&&<div className="ov">
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
            <div className="fld"><label className="lbl">Cliente</label><input className="inp" list="clientes-list" placeholder="Nombre" value={modal.cliente} onChange={e=>handleCliente(e.target.value)}/>
              <datalist id="clientes-list">{(clientesTodos||[]).map(c=><option key={c.id} value={c.nombre}/>)}</datalist>
            </div>
          </div>
          <div className="fld"><label className="lbl">Origen (donde está el camión) <span style={{color:"var(--red)"}}>*</span></label><CityInput value={modal.origen} onChange={v=>setModal(f=>({...f,origen:v}))} onSelect={s=>handleO(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="toggle-row"><span className="toggle-lbl">📦 Recoger la carga en otro sitio</span><button className={`toggle ${modal.lugar_carga?"on":""}`} onClick={()=>setModal(f=>({...f,lugar_carga:f.lugar_carga?"":" "}))}/></div>
          {modal.lugar_carga&&<div className="fld">
            <label className="lbl">Punto de carga {calculandoKmVacio?<span style={{color:"var(--a2)",fontSize:"0.68rem"}}>· calculando km en vacío...</span>:oCoords&&lCoords?<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· ruta calculada</span>:""}</label>
            <CityInput value={modal.lugar_carga.trim()} onChange={v=>setModal(f=>({...f,lugar_carga:v}))} onSelect={s=>handleL(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo donde recoges la carga"/>
            <label className="lbl" style={{marginTop:"0.4rem"}}>Km en vacío hasta el punto de carga</label>
            <input className="inp" type="number" placeholder="0" value={modal.km_vacio} onChange={e=>setModal({...modal,km_vacio:e.target.value})}/>
          </div>}
          <div className="fld"><label className="lbl">Destino <span style={{color:"var(--red)"}}>*</span></label><CityInput value={modal.destino} onChange={v=>setModal(f=>({...f,destino:v}))} onSelect={s=>handleD(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo"/></div>
          <div className="toggle-row"><span className="toggle-lbl">📦 Descarga también en otro destino</span><button className={`toggle ${modal.destino2?"on":""}`} onClick={()=>setModal(f=>({...f,destino2:f.destino2?"":" "}))}/></div>
          {modal.destino2&&<div className="fld">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <label className="lbl">Segundo destino {calculandoKm?<span style={{color:"var(--a2)",fontSize:"0.68rem"}}>· recalculando km...</span>:""}</label>
              {modal.destino2.trim()&&<button type="button" className="btn bg bsm" style={{padding:"0.2rem 0.5rem"}} onClick={swapDestinos}><Icon d={I.swap||I.trend} size={12}/> Invertir orden</button>}
            </div>
            <CityInput value={modal.destino2.trim()} onChange={v=>setModal(f=>({...f,destino2:v}))} onSelect={s=>handleD2(s.label.split(",")[0].trim(),s)} placeholder="Ciudad o pueblo del segundo destino"/>
          </div>}
          <div className="fld"><label className="lbl">Km de ida <span style={{color:"var(--red)"}}>*</span> {calculandoKm?<span style={{color:"var(--a2)",fontSize:"0.68rem"}}>· calculando ruta...</span>:oCoords&&dCoords?<span style={{color:"var(--green)",fontSize:"0.68rem"}}>· ruta calculada</span>:""}</label><input className="inp" type="number" placeholder="0" value={modal.km} onChange={e=>setModal({...modal,km:e.target.value})}/>
            {oCoords&&dCoords&&!calculandoKm&&<div style={{fontSize:"0.68rem",color:"var(--muted)"}}>Estimación de ruta para camión (carreteras aptas para vehículos pesados). Ajusta el valor si conoces el km exacto.</div>}
          </div>
          <div className="toggle-row"><span className="toggle-lbl">↩️ Vuelta sin carga</span><button className={`toggle ${vuelta?"on":""}`} onClick={()=>setVuelta(!vuelta)}/></div>
          {vuelta&&<div className="fld"><label className="lbl">Km de vuelta</label><input className="inp" type="number" placeholder={modal.km||"0"} value={modal.km_vuelta} onChange={e=>setModal({...modal,km_vuelta:e.target.value})}/></div>}
          <div className="g2">
            <div className="fld"><label className="lbl">Peajes (€)</label><input className="inp" type="number" placeholder="0" value={modal.peaje} onChange={e=>setModal({...modal,peaje:e.target.value})}/></div>
            {esGerente&&<div className="fld"><label className="lbl">Precio cobrado (€) <span style={{fontSize:"0.68rem",color:"var(--muted)",fontWeight:400}}>(IVA incluido)</span></label><input className="inp" type="number" placeholder="0" value={modal.precio} onChange={e=>setModal({...modal,precio:e.target.value})}/></div>}
          </div>
          {esGerente&&<div className="toggle-row"><span className="toggle-lbl">💶 Pago del cliente cobrado</span><button className={`toggle ${modal.cobrado?"on":""}`} onClick={()=>setModal(f=>({...f,cobrado:!f.cobrado,fecha_cobro:!f.cobrado?(f.fecha_cobro||new Date().toISOString().slice(0,10)):f.fecha_cobro}))}/></div>}
          {esGerente&&modal.cobrado&&<div className="fld"><label className="lbl">Fecha de cobro</label><input type="date" className="inp" value={modal.fecha_cobro||""} onChange={e=>setModal({...modal,fecha_cobro:e.target.value})}/></div>}
          <div className="fld">
            <label className="lbl">📍 Indicaciones de destino (opcional)</label>
            {(esGerente||esTrafico)?
              <textarea className="inp" rows={2} placeholder="Ej: entrada por la puerta 3, preguntar por Juan..." value={modal.indicaciones||""} onChange={e=>setModal({...modal,indicaciones:e.target.value})}/>
              :<div style={{fontSize:"0.8rem",color:"var(--muted)"}}>{modal.indicaciones||"Sin indicaciones"}</div>}
          </div>
          <div className="fld">
            <label className="lbl">📌 Ubicación exacta en Google Maps (opcional)</label>
            {(esGerente||esTrafico)?<>
              <input className="inp" placeholder="Pega aquí el enlace de Google Maps del punto exacto" value={modal.ubicacion_maps||""} onChange={e=>setModal({...modal,ubicacion_maps:e.target.value})}/>
              <div style={{fontSize:"0.68rem",color:"var(--muted)",marginTop:"0.3rem"}}>En Google Maps: busca el sitio exacto, pulsa "Compartir" y copia el enlace aquí.</div>
            </>:null}
            {(modal.ubicacion_maps||modal.destino)&&<a href={modal.ubicacion_maps||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(modal.destino)}`} target="_blank" rel="noreferrer" className="btn bd bsm" style={{marginTop:"0.4rem",display:"inline-flex",width:"auto",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>🗺️ Abrir en Google Maps</a>}
          </div>
          <PhotoUpload value={modal.cmr_foto} onChange={v=>setModal({...modal,cmr_foto:v})} label="📄 CMR / albarán (opcional)" height={90}/>
          {esGerente&&(()=>{
            const km=(parseFloat(modal.km)||0)+(parseFloat(modal.km_vuelta)||0)+(modal.lugar_carga&&modal.lugar_carga.trim()?(parseFloat(modal.km_vacio)||0):0);
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
