  // ---- minimal orbit controls ----
  const target=new THREE.Vector3(0,0,0);
  let theta=-0.6, phi=0.95, dist=2600, topdown=false;
  function updateCam(){
    if(topdown){ camera.position.set(target.x,dist,target.z+0.001); camera.up.set(0,0,-1); }
    else { camera.position.set(target.x+dist*Math.sin(phi)*Math.sin(theta), target.y+dist*Math.cos(phi), target.z+dist*Math.sin(phi)*Math.cos(theta)); camera.up.set(0,1,0); }
    // never let the eye sink under the ground
    const gu=(camera.position.x+Wkm/2)/Wkm, gv=(camera.position.z+Hkm/2)/Hkm;
    if(gu>0&&gu<1&&gv>0&&gv<1){ const gi=Math.round(gv*(VH-1))*VW+Math.round(gu*(VW-1)); const floor=base[gi]*vex+4*vex; if(camera.position.y<floor) camera.position.y=floor; }
    camera.lookAt(target);
    if(handles.children.length) placeHandles();
  }
  const el=renderer.domElement; let drag=null, dragHandle=null;
  el.addEventListener('pointerdown',e=>{
    if(e.button===0 && editVerts && sel){ const h=pickHandle(e); if(h){ dragHandle=h; el.setPointerCapture(e.pointerId); return; } }
    drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button,moved:false}; el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointerup',e=>{
    if(dragHandle){ dragHandle=null; commitSel(); return; }
    if(drag && !drag.moved && drag.b===0 && placing){ const p=pickMap(e);
      if(p){ settAddAt(p[0],p[1]); placing=false; bSettAdd.setAttribute('aria-pressed',false); bSettAdd.textContent='Add settlement'; }
      drag=null; return; }
    if(drag && !drag.moved && drag.b===0 && measuring){ const p=pickMap(e); if(p) measAdd(p); drag=null; return; }
    if(drag && !drag.moved && drag.b===0 && drawing){ const p=pickMap(e); if(p) addPoint(p); }
    drag=null;
  });
  el.addEventListener('dblclick',e=>{ if(drawing) finishDraw(); });
  el.addEventListener('contextmenu',e=>e.preventDefault());
  el.addEventListener('pointermove',e=>{
    if(dragHandle){ const p=pickMap(e); if(p){ sel.points[dragHandle.userData.i]=p; paintOverlay(); placeHandles(); } return; }
    if(drag){
      const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY;
      if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>4) drag.moved=true;
      if(drag.b===2 || e.shiftKey){
        const s=dist*0.0016; const right=new THREE.Vector3(Math.cos(theta),0,-Math.sin(theta)); const fwd=new THREE.Vector3(-Math.sin(theta),0,-Math.cos(theta));
        target.addScaledVector(right,-dx*s).addScaledVector(fwd,-dy*s);
      } else if(!topdown){ theta-=dx*0.005; phi=Math.min(1.5,Math.max(0.08,phi-dy*0.005)); }
      else { target.x-=dx*dist*0.0016; target.z-=dy*dist*0.0016; }
      updateCam();
    }
    hover(e);
    if(window.__settReady) hoverSett(e);
    if(drawing){ const p=pickMap(e); cursorPt=p; paintOverlay(); }
    if(measuring && meas.length){ measCursor=pickMap(e); paintOverlay(); measReadout(); }
  },{passive:true});
  el.addEventListener('wheel',e=>{e.preventDefault(); dist=Math.min(9000,Math.max(140,dist*Math.exp(e.deltaY*0.0012))); updateCam();},{passive:false});
  // touch pinch
  let pinch=null;
  el.addEventListener('touchmove',e=>{ if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); if(pinch) {dist=Math.min(9000,Math.max(140,dist*pinch/d)); updateCam();} pinch=d; e.preventDefault();} },{passive:false});
  el.addEventListener('touchend',()=>pinch=null);
