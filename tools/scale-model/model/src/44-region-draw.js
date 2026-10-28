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
  async function copyJSONWithFallback(j, filename, setMsg, label){
    let copied = false;
    try{
      const ta = document.createElement('textarea');
      ta.value = j;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.focus(); ta.select(); ta.setSelectionRange(0, j.length);
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    }catch(e){}
    if(!copied && navigator.clipboard && navigator.clipboard.writeText){
      try{ await navigator.clipboard.writeText(j); copied = true; }catch(e){}
    }
    if(copied){
      setMsg('copied '+label+' as JSON');
      return;
    }
    try{
      const blob = new Blob([j], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
      setMsg('clipboard blocked — downloaded '+filename+' ('+label+')');
    }catch(e){
      setMsg('clipboard blocked — see JSON box');
    }
  }
  $('bCopy').onclick=()=>copyJSONWithFallback(JSON.stringify([...regions.values()].map(r=>({...r,kind:kindOf(r)})),null,1), 'regions.json', setStatus, regions.size+' regions');


