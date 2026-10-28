  function localSave(){ try{ localStorage.setItem('krator.regions',JSON.stringify([...regions.values()])); }catch(e){} }
  function localLoad(){ try{ const j=JSON.parse(localStorage.getItem('krator.regions')||'[]'); j.forEach(r=>{ if(r&&r.id&&Array.isArray(r.points)) regions.set(r.id,r); }); }catch(e){} }
  async function save(r){
    localSave(); if(!db||!dbWritable) return;
    try{ await db.collection('regions').doc(r.id).set({name:r.name,color:r.color,points:r.points,notes:r.notes||'',kind:kindOf(r),createdAt:r.createdAt||new Date().toISOString()}); setStatus('saved · '+regions.size+' regions in shared store'); }
    catch(e){ if(e&&e.code==='invalid_argument'){ dbWritable=false; setStatus('shared store is read-only for you — edits stay in this browser'); } else setStatus('save failed: '+(e&&e.code||e)); }
  }
  localLoad(); renderList(); paintOverlay();
  (async()=>{
    try{ db=await (window.claude&&window.claude.use?window.claude.use('db'):Promise.resolve(null)); }catch(e){ db=null; }
    if(!db){ setStatus('shared store unavailable — regions kept in this browser only'); return; }
    db.collection('regions').onSnapshot(snap=>{
      snap.docChanges().forEach(ch=>{ if(ch.type==='removed') regions.delete(ch.doc.id); else { const d=ch.doc.data(); regions.set(ch.doc.id,{id:ch.doc.id,name:d.name||'Region',color:d.color||PAL[0],points:d.points||[],notes:d.notes||'',kind:d.kind,createdAt:d.createdAt}); } });
      if(sel && !regions.has(sel.id)) select(null); else if(sel) sel=regions.get(sel.id);
      renderList(); paintOverlay(); placeHandles(); localSave();
      if(!snap.metadata.fromCache) setStatus(regions.size+' region'+(regions.size===1?'':'s')+' in shared store');
    }, err=>setStatus('shared store: '+err.code));
  })();

