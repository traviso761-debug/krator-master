  // ---- WASD fly: W/S forward-back along the view heading, A/D strafe, Q/E or R/F down/up, arrows orbit, Shift = fast ----
  const keys=new Set();
  const isTyping=e=>{ const t=e.target; return t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable); };
  addEventListener('keydown',e=>{ if(isTyping(e)) return; const k=e.key.toLowerCase(); if(k==='shift'){ keys.add('shift'); return; } if('wasdqerf'.includes(k)||k.startsWith('arrow')){ keys.add(k); if(k.startsWith('arrow')) e.preventDefault(); } });
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>keys.clear());
  function stepKeys(dt){
    if(!keys.size) return;
    const fast=keys.has('shift')?3:1, s=dist*0.55*dt*fast;
    const right=new THREE.Vector3(Math.cos(theta),0,-Math.sin(theta)), fwd=new THREE.Vector3(-Math.sin(theta),0,-Math.cos(theta));
    let moved=false;
    if(keys.has('w')){ target.addScaledVector(fwd, s); moved=true; }
    if(keys.has('s')){ target.addScaledVector(fwd,-s); moved=true; }
    if(keys.has('a')){ target.addScaledVector(right,-s); moved=true; }
    if(keys.has('d')){ target.addScaledVector(right, s); moved=true; }
    if(keys.has('e')||keys.has('r')){ dist=Math.max(140,dist*Math.exp(-1.2*dt*fast)); moved=true; }
    if(keys.has('q')||keys.has('f')){ dist=Math.min(9000,dist*Math.exp( 1.2*dt*fast)); moved=true; }
    if(!topdown){
      if(keys.has('arrowleft')){ theta+=1.4*dt; moved=true; }
      if(keys.has('arrowright')){ theta-=1.4*dt; moved=true; }
      if(keys.has('arrowup')){ phi=Math.max(0.08,phi-0.9*dt); moved=true; }
      if(keys.has('arrowdown')){ phi=Math.min(1.5,phi+0.9*dt); moved=true; }
    }
    target.x=Math.min(Wkm*0.6,Math.max(-Wkm*0.6,target.x)); target.z=Math.min(Hkm*0.6,Math.max(-Hkm*0.6,target.z));
    if(moved) updateCam();
  }

