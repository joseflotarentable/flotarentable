import { useState, useEffect } from "react";
import { sb } from "../lib/supabase.js";
import { Icon, I } from "../lib/icons.jsx";
import { ACCENTS, CONCEPTOS_EMPRESA, CONCEPTOS_VEHICULO, MESES_ES, PAISES, TIPOS_GASTO_VAR } from "../lib/constants.js";
import { nowMes, nowAno, euros, fmtDate, calcGastosFijosMes, gastoProrrateadoEnMes, extraerDatosFactura } from "../lib/helpers.js";
import { ConfirmModal, Toast, PhotoUpload } from "../components/ui.jsx";
import { CustomConceptoRow } from "./FlotaPage.jsx";

export function GastosPage({userId,tractoras,semis,esGerente,accentIdx,gastosFijos,setGastosFijos,gastosTodos,setGastosTodos}) {
  const accent=ACCENTS[accentIdx||0];
  const[modal,setModal]=useState(false);
  const[editGasto,setEditGasto]=useState(null);
  const[toast,setToast]=useState("");
  const[confirm,setConfirm]=useState(null);
  const[openSections,setOpenSections]=useState({empresa:true});
  const[nombres,setNombres]=useState({});
  const[escaneando,setEscaneando]=useState(0);
  const escanearFactura=async(dataUrl)=>{
    setModal(f=>({...f,foto_factura:dataUrl}));
    setEscaneando(1);
    try{
      const d=await extraerDatosFactura(dataUrl,p=>setEscaneando(Math.max(p,1)));
      setModal(f=>{
        const next={...f,foto_factura:dataUrl};
        if(d.importe)next.importe=String(d.importe);
        if(d.fecha)next.fecha=d.fecha;
        if(f.tipo==="Combustible"){
          if(d.litros)next.litros=String(d.litros);
          if(d.precio_litro)next.precio_litro=String(d.precio_litro);
        }
        return next;
      });
      const encontrados=[d.importe&&"importe",d.litros&&"litros",d.precio_litro&&"€/litro",d.fecha&&"fecha"].filter(Boolean);
      setToast(encontrados.length?`📷 Detectado: ${encontrados.join(", ")}. Revisa que sea correcto.`:"📷 No se ha podido leer el ticket, rellena los datos a mano");
    }catch{
      setToast("⚠️ No se ha podido leer la foto. Rellena los datos manualmente.");
    }
    setEscaneando(0);
  };
  useEffect(()=>{if(esGerente)sb.from("perfiles").select("id,nombre").then(({data})=>{const m={};(data||[]).forEach(p=>m[p.id]=p.nombre);setNombres(m);});},[esGerente]);
  const mesFiltro=nowMes();
  const anoActual=nowAno();

  const gastos=gastosTodos.filter(g=>g.mes===mesFiltro||
    (g.tipo==="Impuesto"&&g.imp_ano&&g.imp_mes_ini&&g.imp_mes_fin&&
      parseInt(g.imp_ano)===parseInt(mesFiltro.split("-")[0])&&
      parseInt(mesFiltro.split("-")[1])>=parseInt(g.imp_mes_ini)&&
      parseInt(mesFiltro.split("-")[1])<=parseInt(g.imp_mes_fin))||
    (g.tipo==="ITV"&&g.itv_meses&&g.fecha&&(()=>{
      const fechaG=new Date(g.fecha+"T12:00:00");
      for(let i=0;i<parseInt(g.itv_meses||1);i++){
        const d=new Date(fechaG);d.setMonth(d.getMonth()+i);
        if(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`===mesFiltro)return true;
      }
      return false;
    })()));

  const conceptosExtra=(entidadId,base)=>{const custom=gastosFijos.filter(g=>g.entidad_id===entidadId&&!base.includes(g.concepto)).map(g=>g.concepto);return[...base,...custom];};
  const vehiculos=[{id:"empresa",label:"🏢 Empresa",icon:I.building,conceptos:conceptosExtra("empresa",CONCEPTOS_EMPRESA)},...tractoras.map(t=>({id:t.id,label:`🚛 ${t.matricula||"Sin mat."}${t.apodo?` "${t.apodo}"`:""}`,icon:I.truck,conceptos:conceptosExtra(t.id,CONCEPTOS_VEHICULO)})),...semis.map(s=>({id:s.id,label:`🚛 ${s.matricula||"Sin mat."}`,icon:I.truck,conceptos:conceptosExtra(s.id,["Seguro anual","ITV","Neumáticos","Mantenimiento","Otros"])}))];

  const getFijo=(entidadId,concepto)=>gastosFijos.find(g=>g.entidad_id===entidadId&&g.concepto===concepto);

  const saveFijo=async(entidadId,concepto,importe,periodo)=>{
    const existing=getFijo(entidadId,concepto);
    if(existing){
      await sb.from("gastos_fijos").update({importe,periodo}).eq("id",existing.id);
      setGastosFijos(gastosFijos.map(g=>g.id===existing.id?{...g,importe,periodo}:g));
    }else{
      const{data}=await sb.from("gastos_fijos").insert({user_id:userId,entidad_id:entidadId,concepto,importe,periodo,ano:anoActual}).select().single();
      if(data)setGastosFijos([...gastosFijos,data]);
    }
  };

  const emptyForm={fecha:new Date().toISOString().slice(0,10),tipo:"Combustible",titulo:"",importe:"",litros:"",precio_litro:"",odometro:"",pais:"España",vehicle_id:tractoras[0]?.id||"",vehicle_tipo:"tractora",nota:"",mes:mesFiltro,ano:anoActual,imp_ano:anoActual,imp_mes_ini:"1",imp_mes_fin:"12",itv_meses:"12",foto_factura:""};

  const openNew=()=>{setEditGasto(null);setModal({...emptyForm});};
  const openEdit=g=>{setEditGasto(g);setModal({...g});};

  const saveGasto=async()=>{
    if(!modal.importe||modal.importe===""||isNaN(parseFloat(modal.importe))){setToast("⚠️ Introduce un importe válido");return;}
    if(modal.tipo!=="Impuesto"&&parseFloat(modal.importe)<0){setToast("⚠️ El importe no puede ser negativo");return;}
    if(modal.tipo!=="Impuesto"&&!modal.vehicle_id){setToast("⚠️ Selecciona un vehículo");return;}
    if(modal.tipo==="Impuesto"&&parseInt(modal.imp_mes_ini||1)>parseInt(modal.imp_mes_fin||12)){setToast("⚠️ El mes de inicio no puede ser posterior al mes de fin");return;}
    const fechaGasto=modal.fecha||new Date().toISOString().slice(0,10);
    const mesReal=fechaGasto.slice(0,7);
    const anoReal=fechaGasto.slice(0,4);
    const payload={fecha:modal.fecha,tipo:modal.tipo,titulo:modal.titulo||"",importe:parseFloat(modal.importe),litros:modal.litros?parseFloat(modal.litros):null,precio_litro:modal.precio_litro?parseFloat(modal.precio_litro):null,odometro:modal.odometro?parseFloat(modal.odometro):null,pais:modal.pais||"España",vehicle_id:modal.tipo==="Impuesto"?"empresa":modal.vehicle_id||null,vehicle_tipo:modal.tipo==="Impuesto"?"empresa":modal.vehicle_tipo||"tractora",nota:modal.nota||"",mes:mesReal,ano:anoReal,imp_ano:modal.tipo==="Impuesto"?modal.imp_ano||anoActual:null,imp_mes_ini:modal.tipo==="Impuesto"?parseInt(modal.imp_mes_ini)||1:null,imp_mes_fin:modal.tipo==="Impuesto"?parseInt(modal.imp_mes_fin)||12:null,itv_meses:modal.tipo==="ITV"?parseInt(modal.itv_meses)||12:null,foto_factura:modal.foto_factura||null,user_id:String(userId)};
    const veh=[...tractoras,...semis].find(v=>v.id===payload.vehicle_id);
    const resumen=`${payload.tipo}${veh?` · ${veh.matricula}`:""} · ${euros(payload.importe)}`;
    if(editGasto?.id){
      await sb.from("gastos").update(payload).eq("id",editGasto.id);
      setGastosTodos(gastosTodos.map(g=>g.id===editGasto.id?{...g,...payload,id:editGasto.id}:g));
      setToast(`✅ Actualizado: ${resumen}`);
    }else{
      const{data,error}=await sb.from("gastos").insert(payload).select();
      if(error){setToast("❌ "+error.message);return;}
      const nuevo=Array.isArray(data)?data[0]:data;
      if(nuevo)setGastosTodos([nuevo,...gastosTodos]);
      setToast(`✅ Guardado: ${resumen}`);
    }
    setModal(false);setEditGasto(null);
  };

  const deleteGasto=async id=>{
    await sb.from("gastos").delete().eq("id",id);
    setGastosTodos(gastosTodos.filter(g=>g.id!==id));
    setToast("🗑️ Eliminado");
  };

  const handleLitros=(l,p)=>{const imp=(parseFloat(l)||0)*(parseFloat(p)||0);setModal(f=>({...f,litros:l,precio_litro:p,importe:imp>0?imp.toFixed(2):f.importe}));};

  const totalVar=gastos.reduce((s,g)=>s+gastoProrrateadoEnMes(g,mesFiltro),0);
  const totalFijosMes=calcGastosFijosMes(gastosFijos,tractoras,semis);
  const mesLabel=MESES_ES[parseInt(mesFiltro.split("-")[1])-1]+" "+mesFiltro.split("-")[0];

  const toggleSection=id=>setOpenSections(s=>({...s,[id]:!s[id]}));

  return(<>
    {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
    {confirm&&<ConfirmModal msg="¿Eliminar este gasto?" onConfirm={()=>{deleteGasto(confirm.id);if(confirm.cerrar)setModal(false);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    <div className="page fu">
      <div className="phead" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="ptitle">Gastos</div>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          <div className="mes-badge">{mesLabel}</div>
          <button className="btn bp bsm" onClick={openNew}><Icon d={I.plus} size={14}/> Añadir</button>
        </div>
      </div>

      {esGerente&&<div className="sgrid">
        <div className="stat"><div className="slbl">Variables mes</div><div className="sval r">{euros(totalVar)}</div></div>
        <div className="stat"><div className="slbl">Fijos mes</div><div className="sval y">{euros(totalFijosMes)}</div></div>
      </div>}

      {gastos.length===0?<div className="empty"><div className="ei"><Icon d={I.coin} size={20} color="var(--muted)"/></div><div><strong style={{display:"block",marginBottom:3}}>Sin gastos este mes</strong><span style={{fontSize:"0.8rem"}}>Aquí solo se muestran los gastos del mes seleccionado; el resto sigue guardado y disponible en Analizar</span></div><button className="btn bp bsm" style={{marginTop:"0.75rem"}} onClick={openNew}><Icon d={I.plus} size={13}/> Añadir un gasto</button></div>
      :<div className="gastos-var">
      <p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Gastos variables — {mesLabel}</p>
      <div className="trip-list" style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {gastos.map(g=>{
          const veh=[...tractoras,...semis].find(v=>v.id===g.vehicle_id);
          return(
            <div className="trip" key={g.id} onClick={()=>openEdit(g)}>
              <div className="ttop">
                <div><div className="troute">{g.tipo}{g.pais&&g.pais!=="España"?` · ${g.pais}`:""}{g.foto_factura?" 📄":""}</div><div className="tdate">{fmtDate(g.fecha)}{veh?` · ${veh.matricula}`:""}{g.nota?` · ${g.nota}`:""}{esGerente&&g.user_id&&nombres[g.user_id]?` · añadido por ${nombres[g.user_id]}`:""}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:"1.1rem",color:"var(--red)",letterSpacing:"0.02em"}}>{euros(parseFloat(g.importe))}</span>
                  <button className="btn bd bsm" style={{padding:"0.3rem 0.4rem"}} onClick={e=>{e.stopPropagation();setConfirm({id:g.id,cerrar:false});}}><Icon d={I.trash} size={12}/></button>
                </div>
              </div>
              {g.litros&&<div className="trow"><span>⛽ {g.litros}L{g.precio_litro?` · ${g.precio_litro}€/L`:""}</span>{g.odometro&&<span>📍 {parseInt(g.odometro).toLocaleString("es-ES")} km</span>}</div>}
            </div>
          );
        })}
      </div></div>}

      {esGerente&&<div className="gastos-fijos" style={{marginTop:"0.5rem"}}>
        <p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.625rem"}}>Gastos fijos mensuales</p>
        <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
          {vehiculos.map(v=>(
            <div key={v.id} className="gfijo-section">
              <div className="gfijo-header" onClick={()=>toggleSection(v.id)}>
                <div className="gfijo-title"><Icon d={v.icon} size={16} color="var(--a1)"/>{v.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  {esGerente&&<span style={{fontSize:"0.75rem",color:"var(--muted)"}}>
                    {euros(gastosFijos.filter(g=>g.entidad_id===v.id).reduce((s,g)=>{const imp=parseFloat(g.importe)||0;return s+(g.periodo==="anual"?imp/12:imp);},0))}/mes
                  </span>}
                  <Icon d={I.chevron} size={14} color="var(--muted)"/>
                </div>
              </div>
              {openSections[v.id]&&<div className="gfijo-body">
                {v.conceptos.map(concepto=>{
                  const fijo=getFijo(v.id,concepto);
                  const esAnual=fijo?.periodo==="anual"||(concepto.includes("anual")||concepto==="ITV");
                  return(
                    <div key={concepto} className="gfijo-row">
                      <span className="gfijo-lbl">{concepto}</span>
                      <input className="gfijo-inp" type="number" placeholder="0" defaultValue={fijo?.importe||""} key={fijo?.id||concepto} onBlur={e=>{const val=e.target.value;if(val&&val!==String(fijo?.importe||""))saveFijo(v.id,concepto,parseFloat(val),esAnual?"anual":"mensual");}}/>
                      <span className="gfijo-periodo">{esAnual?"€/año":"€/mes"}</span>
                      {esAnual&&fijo?.importe&&<span className="nota-anual">{euros((parseFloat(fijo.importe)||0)/12)}/m</span>}
                    </div>
                  );
                })}
                <CustomConceptoRow entidadId={v.id} saveFijo={saveFijo}/>
              </div>}
            </div>
          ))}
        </div>
      </div>}

    </div>
    {modal&&<div className="ov">
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="mtitle">{editGasto?"Editar gasto":"Nuevo gasto variable"}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              {editGasto&&<button className="btn bd bsm" onClick={()=>setConfirm({id:editGasto.id,cerrar:true})}><Icon d={I.trash} size={14}/></button>}
              <button className="btn bg bsm" onClick={()=>setModal(false)}>✕</button>
            </div>
          </div>
          <div className="g2">
            <div className="fld"><label className="lbl">Fecha</label><input type="date" className="inp" value={modal.fecha} onChange={e=>setModal({...modal,fecha:e.target.value})}/></div>
            <div className="fld"><label className="lbl">Tipo</label><select className="inp sel" value={modal.tipo} onChange={e=>setModal({...modal,tipo:e.target.value,vehicle_id:e.target.value==="Impuesto"?"empresa":modal.vehicle_id,vehicle_tipo:e.target.value==="Impuesto"?"empresa":modal.vehicle_tipo})}>{(esGerente?TIPOS_GASTO_VAR:TIPOS_GASTO_VAR.filter(t=>t!=="Impuesto")).map(t=><option key={t}>{t}</option>)}</select></div>
            {modal.tipo==="Impuesto"&&<div className="fld"><label className="lbl">Título del impuesto</label><input className="inp" placeholder="ej. Liquidación IVA T1, IRPF anual..." value={modal.titulo||""} onChange={e=>setModal({...modal,titulo:e.target.value})}/></div>}
            {modal.tipo==="Impuesto"&&<div className="fld"><label className="lbl">Año del periodo</label><input className="inp" type="number" placeholder={anoActual} value={modal.imp_ano||anoActual} onChange={e=>setModal({...modal,imp_ano:e.target.value})}/></div>}
            {modal.tipo==="Impuesto"&&<div style={{display:"flex",gap:"0.5rem"}}><div className="fld" style={{flex:1}}><label className="lbl">Mes inicio</label><select className="inp sel" value={modal.imp_mes_ini||"1"} onChange={e=>setModal({...modal,imp_mes_ini:e.target.value})}>{MESES_ES.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}</select></div><div className="fld" style={{flex:1}}><label className="lbl">Mes fin</label><select className="inp sel" value={modal.imp_mes_fin||"12"} onChange={e=>setModal({...modal,imp_mes_fin:e.target.value})}>{MESES_ES.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}</select></div></div>}
            {modal.tipo==="ITV"&&<div className="fld"><label className="lbl">¿Cada cuántos meses pasa ITV?</label><select className="inp sel" value={modal.itv_meses||"12"} onChange={e=>setModal({...modal,itv_meses:e.target.value})}><option value="6">Cada 6 meses</option><option value="12">Cada 12 meses (1 año)</option><option value="24">Cada 24 meses (2 años)</option><option value="36">Cada 36 meses (3 años)</option></select><div style={{fontSize:"0.75rem",color:"var(--muted)",marginTop:"0.3rem"}}>El coste se repartirá entre esos meses automáticamente</div></div>}
          </div>
          {modal.tipo!=="Impuesto"&&<div className="fld">
            <PhotoUpload value={modal.foto_factura} onChange={escanearFactura} label="📷 Foto del ticket/factura — autocompleta los datos" height={90}/>
            {escaneando>0&&<div style={{fontSize:"0.72rem",color:"var(--a2)",marginTop:4,display:"flex",alignItems:"center",gap:6}}><div className="spinner" style={{width:13,height:13}}/> Leyendo factura... {escaneando}%</div>}
          </div>}
          {modal.tipo==="Combustible"&&<>
            <div className="g2">
              <div className="fld"><label className="lbl">Litros</label><input className="inp" type="number" placeholder="0" value={modal.litros} onChange={e=>handleLitros(e.target.value,modal.precio_litro)}/></div>
              <div className="fld"><label className="lbl">€/litro</label><input className="inp" type="number" placeholder="0,00" value={modal.precio_litro} onChange={e=>handleLitros(modal.litros,e.target.value)}/></div>
            </div>
            <div className="fld"><label className="lbl">Km odómetro <span style={{color:"var(--a2)",fontSize:"0.68rem"}}>(mejora el cálculo de consumo)</span></label><input className="inp" type="number" placeholder="ej. 125430" value={modal.odometro} onChange={e=>setModal({...modal,odometro:e.target.value})}/></div>
            <div className="fld"><label className="lbl">País</label><select className="inp sel" value={modal.pais} onChange={e=>setModal({...modal,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>
          </>}
          <div className="fld"><label className="lbl">Importe (€) <span style={{color:"var(--red)"}}>*</span>{modal.tipo==="Impuesto"?<span style={{color:"var(--muted)",fontSize:"0.68rem"}}> · negativo si es devolución</span>:modal.tipo==="Combustible"&&modal.litros?<span style={{color:"var(--green)",fontSize:"0.68rem"}}> · calculado auto</span>:""}</label><input className="inp" type="number" step="0.01" placeholder="0,00" value={modal.importe} onChange={e=>setModal({...modal,importe:e.target.value})}/></div>
          {modal.tipo!=="Impuesto"&&<div className="fld"><label className="lbl">Vehículo</label>
            <select className="inp sel" value={modal.vehicle_id} onChange={e=>{setModal({...modal,vehicle_id:e.target.value,vehicle_tipo:tractoras.find(t=>t.id===e.target.value)?"tractora":"semi"});}}>
              <option value="">Sin asignar</option>
              {tractoras.map(t=><option key={t.id} value={t.id}>🚛 {t.matricula||"Sin mat."}</option>)}
              {semis.map(s=><option key={s.id} value={s.id}>🔧 {s.matricula||"Sin mat."}</option>)}
            </select></div>}
          <div className="fld"><label className="lbl">Nota</label><input className="inp" placeholder="opcional" value={modal.nota} onChange={e=>setModal({...modal,nota:e.target.value})}/></div>
          <div className="mact"><button className="btn bg" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" style={{flex:2}} onClick={saveGasto}>{editGasto?"Actualizar":"Guardar"}</button></div>
        </div>
      </div>}
  </>);
}

// ── VIAJES PAGE ───────────────────────────────────────────────────────────────
