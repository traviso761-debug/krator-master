// ================================================================= ATMOS — the browser side: the Weather selector and the export download
// [web]. Everything here touches the DOM, so it is kept out of the engine-neutral fragments (GODOT-PLAN.md Phase 1:
// the host owns the DOM). It moves to core/host/ when that exists; a game engine has its own UI and file saving.
(function(){const A=ATMOS;
 // the Weather selector, appended to any element (a host may call it later, once its own toolbar is laid out)
 A.weatherUI=el=>{const W=A.W;if(!W||!el)return null;const sel=document.createElement('select');sel.id='atmosWeather';sel.title='Weather';sel.setAttribute('aria-label','Weather');
  for(const m of W.MODES){const op=document.createElement('option');op.value=m;op.textContent=m;sel.appendChild(op);}sel.value=W.mode;sel.onchange=()=>{W.mode=sel.value;};el.appendChild(sel);return sel;};
 // ATMOS.export() saved as a JSON file
 A.download=name=>{const b=new Blob([JSON.stringify(A.export())],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(name||'atmos')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
})();
