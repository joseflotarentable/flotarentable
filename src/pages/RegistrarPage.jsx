import { useState } from "react";
import { ViajesPage } from "./ViajesPage.jsx";
import { GastosPage } from "./GastosPage.jsx";

export function RegistrarPage({userId,tractoras,semis,esGerente,gastosTodos,setGastosTodos,viajesTodos,setViajesTodos,accentIdx,gastosFijos,setGastosFijos}) {
  const[subtab,setSubtab]=useState("viajes");
  return(
    <div className="page fu">
      <div className="ptitle">Registrar</div>
      <div className="tab-row">
        <div className={`tab-btn ${subtab==="viajes"?"on":""}`} onClick={()=>setSubtab("viajes")}>Viajes</div>
        <div className={`tab-btn ${subtab==="gastos"?"on":""}`} onClick={()=>setSubtab("gastos")}>Gastos</div>
      </div>
      {subtab==="viajes"&&<ViajesPage key={`rv-${tractoras.length}-${semis.length}`} userId={userId} tractoras={tractoras} semis={semis} esGerente={esGerente} gastosTodos={gastosTodos} viajesTodos={viajesTodos} setViajesTodos={setViajesTodos}/>}
      {subtab==="gastos"&&<GastosPage key={`rg-${tractoras.length}-${semis.length}`} userId={userId} tractoras={tractoras} semis={semis} esGerente={esGerente} accentIdx={accentIdx} gastosFijos={gastosFijos} setGastosFijos={setGastosFijos} gastosTodos={gastosTodos} setGastosTodos={setGastosTodos}/>}
    </div>
  );
}

