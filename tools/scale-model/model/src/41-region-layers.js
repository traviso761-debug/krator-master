  // ---- region layers: every region is political, geographic or biome ----
  const KINDS=[{k:'political',label:'Political',btn:'bRegPol'},{k:'geographic',label:'Geographic',btn:'bRegGeo'},{k:'biome',label:'Biomes',btn:'bRegBio'}];
  const KIND_BY=Object.fromEntries(KINDS.map(x=>[x.k,x]));
  // regions saved before layers existed carry no kind: place them by name until someone moves them
  const GEO_RE=/\b(valley|vale|isles?|islands?|ocean|sea|bay|gulf|lake|rift|crater|cut|bowl|tiers|catch|pits|steampits|farside|ruins|plateau|mesa|range|mountains?|wall|desert|basin|coast|region \d+)\b/i;
  function kindOf(r){ return KIND_BY[r.kind]?r.kind:(GEO_RE.test(r.name||'')?'geographic':'political'); }
  const layerOn={political:true,geographic:false,biome:false,rivers:true};
  let tab='political';
  try{ const j=JSON.parse(localStorage.getItem('krator.regionLayers')||'null'); if(j){ Object.keys(layerOn).forEach(k=>{ if(typeof j.on?.[k]==='boolean') layerOn[k]=j.on[k]; }); if(KIND_BY[j.tab]) tab=j.tab; } }catch(e){}
  function layersSave(){ try{ localStorage.setItem('krator.regionLayers',JSON.stringify({on:layerOn,tab})); }catch(e){} }
  const anyLayer=()=>layerOn.political||layerOn.geographic||layerOn.biome||layerOn.rivers;
  function setLayer(k,on){ layerOn[k]=on; const b=document.getElementById(KIND_BY[k].btn); if(b) b.setAttribute('aria-pressed',on);
    overlay.visible=anyLayer()||measuring||drawing; layersSave(); paintOverlay(); }
  const bRivers=document.getElementById('bRivers');
  if(bRivers){
    bRivers.setAttribute('aria-pressed',layerOn.rivers);
    bRivers.onclick=()=>{
      layerOn.rivers=!layerOn.rivers;
      bRivers.setAttribute('aria-pressed',layerOn.rivers);
      overlay.visible=anyLayer()||measuring||drawing;
      layersSave();
      paintOverlay();
    };
  }
  KINDS.forEach(x=>{ const b=document.getElementById(x.btn); b.setAttribute('aria-pressed',layerOn[x.k]); b.onclick=()=>setLayer(x.k,!layerOn[x.k]); });
  overlay.visible=anyLayer();
  const rTabs=document.getElementById('rTabs');
  function renderTabs(){
    rTabs.innerHTML='';
    KINDS.forEach(x=>{ const b=document.createElement('button'); b.setAttribute('role','tab'); b.setAttribute('aria-selected',tab===x.k);
      const n=[...regions.values()].filter(r=>kindOf(r)===x.k).length;
      b.innerHTML=x.label+'<b>'+n+'</b>'; b.onclick=()=>{ tab=x.k; if(!layerOn[x.k]) setLayer(x.k,true); layersSave(); renderList(); }; rTabs.appendChild(b); });
  }
  const eKind=document.getElementById('eKind');
  KINDS.forEach(x=>{ const b=document.createElement('button'); b.textContent=x.label; b.dataset.k=x.k; b.title='Move this region to the '+x.label.toLowerCase()+' layer';
    b.onclick=()=>{ if(!sel||kindOf(sel)===x.k) return; sel.kind=x.k; tab=x.k; if(!layerOn[x.k]) setLayer(x.k,true); layersSave(); commitSel(); }; eKind.appendChild(b); });
  function syncKind(){ [...eKind.children].forEach(b=>b.setAttribute('aria-pressed',!!sel&&kindOf(sel)===b.dataset.k)); }

