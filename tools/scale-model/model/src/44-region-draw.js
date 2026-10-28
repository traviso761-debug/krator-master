  // drawing
  const drawbar=$('drawbar'), drawMsg=$('drawMsg');
  function startDraw(){ if(measuring) measStop(); if(!layerOn[tab]) setLayer(tab,true); drawing=true; overlay.visible=true; draft=[]; select(null); document.body.classList.add('drawing'); drawbar.hidden=false; drawMsg.textContent='Click the terrain to add points · double-click or Finish to close'; $('bDraw').setAttribute('aria-pressed',true); paintOverlay(); }
  function addPoint(p){ draft.push(p); drawMsg.textContent=draft.length+' point'+(draft.length>1?'s':'')+(draft.length>2?' · '+fmtArea(areaKm2(draft)):''); paintOverlay(); }
  function cancelDraw(){ drawing=false; overlay.visible=anyLayer()||measuring; draft=[]; cursorPt=null; document.body.classList.remove('drawing'); drawbar.hidden=true; $('bDraw').setAttribute('aria-pressed',false); paintOverlay(); }
  async function finishDraw(){
    if(draft.length<3){ drawMsg.textContent='Need at least 3 points'; return; }
    const id='r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    const r={id, name:'Region '+(regions.size+1), color:PAL[regions.size%PAL.length], points:draft.slice(), notes:'', kind:tab, createdAt:new Date().toISOString()};
    regions.set(id,r); cancelDraw(); select(id); eName.focus(); eName.select(); localSave(); await save(r);
  }
  $('bDraw').onclick=()=>drawing?cancelDraw():startDraw();
  $('dUndo').onclick=()=>{ draft.pop(); paintOverlay(); drawMsg.textContent=draft.length+' points'; };
  $('dFinish').onclick=finishDraw; $('dCancel').onclick=cancelDraw;
  addEventListener('keydown',e=>{ if(!drawing) return; if(e.key==='Escape') cancelDraw(); else if(e.key==='Enter') finishDraw(); else if(e.key==='Backspace'){ draft.pop(); paintOverlay(); } });
  $('bCopy').onclick=async()=>{ const j=JSON.stringify([...regions.values()].map(r=>({...r,kind:kindOf(r)})),null,1); try{ await navigator.clipboard.writeText(j); setStatus('copied '+regions.size+' regions as JSON'); }catch(e){ setStatus('clipboard blocked — regions are in the shared store'); } };

