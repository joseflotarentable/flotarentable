import { useState, useEffect, useRef } from "react";
import { Icon, I } from "../lib/icons.jsx";
import { geocode } from "../lib/helpers.js";

export function InputGuardado({valor,placeholder,onGuardar,tipo="text"}) {
  const[local,setLocal]=useState(valor);
  useEffect(()=>setLocal(valor),[valor]);
  return<input className="inp" type={tipo} value={local} placeholder={placeholder} onChange={e=>setLocal(e.target.value)} onBlur={()=>{if(local!==valor)onGuardar(local);}}/>;
}

export function CityInput({value,onChange,onSelect,placeholder}) {
  const [sugs,setSugs]=useState([]);
  const [open,setOpen]=useState(false);
  const timer=useRef();
  const handle=e=>{
    const v=e.target.value; onChange(v);
    clearTimeout(timer.current);
    if(v.length>=3){timer.current=setTimeout(async()=>{const r=await geocode(v);setSugs(r);setOpen(r.length>0);},500);}
    else{setSugs([]);setOpen(false);}
  };
  return(
    <div style={{position:"relative"}}>
      <input className="inp" value={value} onChange={handle} placeholder={placeholder} onBlur={()=>setTimeout(()=>setOpen(false),200)}/>
      {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--s1)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",zIndex:200,maxHeight:180,overflowY:"auto",marginTop:4,boxShadow:"0 8px 24px #00000060"}}>
        {sugs.map((s,i)=><div key={i} style={{padding:"0.625rem 0.875rem",fontSize:"0.82rem",cursor:"pointer",borderBottom:"1px solid var(--border)",color:"var(--text)"}} onMouseDown={()=>{onChange(s.ciudad||s.label.split(",")[0].trim());onSelect(s);setOpen(false);}}>{s.label}</div>)}
      </div>}
    </div>
  );
}
export function PhotoUpload({value,onChange,label="Foto",height=80}) {
  const ref=useRef();
  return(
    <div className="fld">
      <label className="lbl">{label}</label>
      <div className="photo-btn" style={{height}} onClick={()=>ref.current.click()}>
        {value?<img src={value} alt="" style={{width:"100%",height:height-16,objectFit:"cover",borderRadius:8}}/>:<><Icon d={I.camera} size={18} color="var(--muted)"/><span style={{fontSize:"0.75rem",color:"var(--muted)"}}>Toca para subir foto</span></>}
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);}}/>
      </div>
    </div>
  );
}

export function ConfirmModal({msg,onConfirm,onCancel}) {
  return(
    <div className="ov" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:300}}>
        <div className="mdrag"/>
        <div style={{textAlign:"center",padding:"0.5rem 0 1.25rem"}}>
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>⚠️</div>
          <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"0.3rem"}}>{msg}</div>
          <div style={{fontSize:"0.78rem",color:"var(--muted)"}}>Esta acción no se puede deshacer</div>
        </div>
        <div className="mact">
          <button className="btn bg" style={{flex:1}} onClick={onCancel}>Cancelar</button>
          <button className="btn bd" style={{flex:1}} onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
export function Toast({msg,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,msg.length>40?4200:2500);return()=>clearTimeout(t);},[]);
  return<div className="toast" style={{whiteSpace:"normal",maxWidth:"min(92vw,380px)",textAlign:"center",lineHeight:1.4,animation:"toast-in 0.25s ease both"}}>{msg}</div>;
}

