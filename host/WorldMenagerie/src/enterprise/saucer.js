// ---------- Galaxy class: the saucer, flown apart ----------
// Original work. The saucer lifts off the neck's latches, moves ahead and clear, and then flies on its own impulse
// engines: with hostiles about it withdraws, sixteen kilometres from the fight on the far side from them; with none
// it keeps station where it is, matching the stardrive's way. The stardrive is what the helm flies meanwhile, lighter and quicker to turn
// (flight.js reads S.agile); its own phaser strip under the engineering hull does the firing, and its hull is what
// the enemy hits. The saucer has no warp drive, so neither half goes to warp until they are one ship again.
//
// Docking the halves again is a manoeuvre. Either fly the stardrive in under the resting saucer, slowly and lined
// up with it (within a quarter of a kilometre of the latches, under 150 m/s apart, within twenty degrees), and the
// latches take it; or ask the saucer to come to you (Rejoin), and hold still while it does. At a starbase its
// approach control talks the saucer in, faster. Not under fire: the saucer would fly into the fight.
//
// Tactical panel: Separate / Rejoin (also the Events panel). W.emit('separated'), 'rejoined'. #sep separates once
// the page is up (#sep=s: and asks it back s seconds later).
export function saucer(W){
  const {THREE,ROOT,G,SAU,SYS,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  let mode='home',descend=false,vel=V(),t0=0,from=V(),settle=null,assist=false,lastNote=0;
  const note=m=>F.note(m),ease=F.ease;
  const P=()=>SAU.getWorldPosition(V()),latch=()=>G.localToWorld(V());
  const at=()=>W.stations&&W.stations.find(s=>s.place===W.herePlace());
  const nag=m=>{if(performance.now()-lastNote>3000){lastNote=performance.now();note(m);}};

  function separate(){
    if(mode!=='home')return;
    if(S.warp||W.spooling){nag('Not at warp: drop out first.');return;}
    if(W.dockPhase&&W.dockPhase()){nag('Not while we are docking or docked.');return;}
    if(S.v>2000){nag('Too fast to separate: bring us under two kilometres a second.');return;}
    mode='lift';t0=F.T();from.copy(SAU.position);
    for(const g of W.impGlows)g.userData.k=1;F.sound('shield');
    note('Saucer separation: the latches are open.');
  }
  function rejoin(){
    if(mode==='home'||mode==='lift'||mode==='settle')return;
    if(W.foes&&W.foes().length){nag('Not under fire: the saucer would fly into the fight. Win it first.');return;}
    if(mode==='come')return;
    mode='come';descend=false;assist=!!at();S.orbit=null;W.course&&W.course.clear();W.setThrottle(0);
    note(assist?at().name+' approach control: saucer section, you are cleared to the stardrive. Stardrive, hold your position.':'The saucer is coming to us. Hold her steady, helm.');
  }
  // up off the latches, then ahead; once it is clear it is its own ship (in the place's frame, not the ship's)
  function lift(t){const u=(t-t0)/5,ky=ease(u*2.2),kx=ease(u*1.3-0.3);
    SAU.position.set(from.x+260*kx,from.y+40*ky,0);
    for(const g of W.impGlows)g.scale.setScalar(40*(1+1.5*Math.sin(Math.PI*Math.min(1,u))));
    if(u<1)return;
    SYS.attach(SAU);vel.copy(S.vel||V());mode='away';S.agile=1.35;
    note('Saucer separation complete. The saucer is falling back; the stardrive is yours.');W.emit&&W.emit('separated');F.sync();}
  // a heading for the saucer: its nose along a direction, upright with the ship
  const m4=new THREE.Matrix4(),qW=new THREE.Quaternion(),qp=new THREE.Quaternion();
  function face(dir,dt,k){const up=V().set(0,1,0).applyQuaternion(ROOT.getWorldQuaternion(qp)),x=dir.clone().normalize(),z=x.clone().cross(up).normalize();
    if(z.lengthSq()<0.5)return;const y=z.clone().cross(x);m4.makeBasis(x,y,z);qW.setFromRotationMatrix(m4);turnTo(qW,dt,k);}
  function turnTo(q,dt,k){const cur=SAU.getWorldQuaternion(new THREE.Quaternion());cur.slerp(q,Math.min(1,dt*k));
    SAU.quaternion.copy(SAU.parent.getWorldQuaternion(qp).invert().multiply(cur));}
  // fly toward a point (and match a velocity), at most vmax, at the saucer's impulse
  function steer(p,target,tv,vmax,dt,gain){const want=target.clone().sub(p).multiplyScalar(gain||0.35);if(want.length()>vmax)want.setLength(vmax);if(tv)want.add(tv);
    const dv=want.sub(vel),L=dv.length(),a=420*dt;if(L>a)dv.setLength(a);vel.add(dv);}
  function move(p,dt){p.addScaledVector(vel,dt);SAU.position.copy(SAU.parent.worldToLocal(p.clone()));}

  let last=null;
  animHooks.push(now=>{const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;if(!dt)return;
    if(mode==='lift'){lift(F.T());return;}
    if(mode==='settle'){const u=Math.min(1,(F.T()-settle.t0)/2.5),k=ease(u);SAU.position.lerpVectors(settle.p,V(),k);SAU.quaternion.copy(settle.q).slerp(new THREE.Quaternion(),k);
      if(u>=1){SAU.position.set(0,0,0);SAU.quaternion.identity();mode='home';S.agile=1;F.sound('shield');
        note('Docking latches engaged. The Enterprise is one ship again.');W.emit&&W.emit('rejoined');F.sync();}return;}
    if(mode==='home')return;
    const p=P(),c=F.shipCentre(),L=latch(),sv=S.vel||V();
    if(mode==='away'){
      const foes=W.foes?W.foes():[];
      if(foes.length){const fc=V();for(const f of foes)fc.add(f.m.g.getWorldPosition(V()));fc.divideScalar(foes.length);
        const away=c.clone().sub(fc);away.y*=0.2;if(away.lengthSq()<1)away.set(0,0,1);
        steer(p,c.clone().addScaledVector(away.normalize(),16000),sv,2200,dt,0.3);}
      // quiet: it keeps station where it is, matching her way, so that she can come to it
      else{const dv=sv.clone().sub(vel),L=dv.length(),a=300*dt;if(L>a)dv.setLength(a);vel.add(dv);}
      if(vel.length()>60)face(vel,dt,0.8);
      move(p,dt);
      // flown in under it by hand: close, slow and lined up, and the latches take it
      const rel=sv.clone().sub(vel).length(),ang=SAU.getWorldQuaternion(new THREE.Quaternion()).angleTo(G.getWorldQuaternion(qp));
      if(!foes.length&&p.distanceTo(L)<250&&rel<150&&ang<0.35)dock();
      return;}
    if(mode==='come'){
      // over the latches first, then down onto them; matching the ship's own way
      // (once it has come down past the point over them it stays on the latches' line)
      const over=G.localToWorld(V().set(0,320,0));if(p.distanceTo(over)<160||p.distanceTo(L)<200)descend=true;const tgt=descend?L:over;
      steer(p,tgt,sv,assist?2600:1500,dt,tgt===L?0.6:0.35);
      if(p.distanceTo(L)<1500)turnTo(G.getWorldQuaternion(qp),dt,1.2);else if(vel.length()>60)face(vel.clone().sub(sv),dt,0.8);
      move(p,dt);
      if(p.distanceTo(L)<25)dock();}
  });
  function dock(){G.attach(SAU);settle={t0:F.T(),p:SAU.position.clone(),q:SAU.quaternion.clone()};mode='settle';vel.set(0,0,0);note('Saucer contact: the latches are closing.');}
  // through the wormhole or a jump with the saucer away (it cannot, but a test may): it comes too, astern
  W.arriveHooks.push(()=>{if(mode==='away'||mode==='come'){const c=F.shipCentre(),q=ROOT.getWorldQuaternion(new THREE.Quaternion());
    SAU.position.copy(SAU.parent.worldToLocal(c.add(V().set(-3000,600,0).applyQuaternion(q))));vel.set(0,0,0);}});

  const home=()=>mode==='home';
  W.saucer={separate,rejoin,toggle:()=>{if(mode==='home')separate();else rejoin();},home,mode:()=>mode,
    dist:()=>mode==='home'?0:P().distanceTo(latch())};
  {const h=new URLSearchParams(location.hash.slice(1)),t=+(h.get('evt')||1.5)*1000;if(h.has('sep')){setTimeout(separate,t);if(+h.get('sep'))setTimeout(rejoin,t+h.get('sep')*1000);}}
  return {act:{separate,rejoin},
    hud:()=>mode==='home'?'':mode==='lift'?'separating':mode==='settle'?'saucer docking':(mode==='come'?'saucer coming in ':'saucer away ')+(W.saucer.dist()/1000).toFixed(1)+' km',
    state:()=>({mode,d:Math.round(W.saucer.dist())})};
}
