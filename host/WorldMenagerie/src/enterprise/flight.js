// ---------- Galaxy class: flying it ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used.
//
// The page is a turntable round one object at the origin. To fly, the ship (ROOT) moves through a world that is
// split three ways:
//
//   - SKY: the stars and nebulae. They are at infinity, so they ride with the camera and only turn.
//   - SYS: the planet and its moon, and the target rock. These are things you can fly towards (the planet is
//     about 470 km off, three minutes at full impulse) and they stay where they are.
//   - FX:  phaser beams, torpedoes, the shuttle: anything let loose in the world.
//
// Two re-basings keep the numbers small and the turntable working. Past 20 km from the origin everything is moved
// back by the ship's position (a floating origin), so a long flight never runs into the precision of a float.
// And when you stop flying, the ship is put back at the origin, level, by moving and turning the world round it the
// other way: the sun, the planet and the stars all keep where they are relative to the ship, the turntable's views
// all work again, and the camera is handed back exactly where the chase camera had it.
//
// At warp the system goes with you (no amount of warp gets you nearer that planet: it would be gone in a blink),
// and when you drop out it is somewhere else: the sky and the system are turned to a new heading round you.
const FULL=2500,WARPV=150000;

export function flight(W){
  const {THREE,scene,camera,renderer,ROOT,animHooks,C}=W;
  // the page made its lights first (key, fill, the camera lamp) and then the sky, in this order
  const lights=scene.children.filter(o=>o.isDirectionalLight),[key,fill,lamp]=lights;
  const stars=scene.children.find(o=>o.isPoints),i0=scene.children.indexOf(stars);
  const nN=((C.space&&C.space.nebulae)||[]).length,nB=((C.space&&C.space.bodies)||[]).length;
  const SKY=new THREE.Group(),SYS=new THREE.Group(),FX=new THREE.Group();
  const skyObjs=scene.children.slice(i0,i0+1+nN),bodyObjs=scene.children.slice(i0+1+nN,i0+1+nN+nB);
  for(const o of skyObjs)SKY.add(o);for(const o of bodyObjs)SYS.add(o);
  scene.add(SKY,SYS,FX);
  const sun=key.position.clone().normalize(),fillDir=fill.position.clone().normalize();
  for(const L of [fill,lamp]){if(!L.target.parent)scene.add(L.target);}
  W.SKY=SKY;W.SYS=SYS;W.FX=FX;W.sun=sun;
  // the planet's radius, from how wide it was set to look from the origin
  const B0=(C.space&&C.space.bodies||[])[0],PR=B0?(B0.dist||0.5)*(C.space.far||900000)*Math.tan((B0.deg||6)*Math.PI/180):0;

  const S={on:false,imp:0,warp:0,v:0,rate:new THREE.Vector3(),cy:0,cp:0.25,cd:1100,camRel:new THREE.Vector3(),up:new THREE.Vector3(0,1,0),
    spool:0,shake:0};
  W.flight=S;
  const keys=new Set(),pad=new Set();
  const typing=e=>e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA');
  addEventListener('keydown',e=>{if(!S.on||typing(e))return;const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);
    if(k==='w')setImpulse(S.imp+0.25);if(k==='s')setImpulse(S.imp-0.25);if(k==='x'){setImpulse(0);if(S.warp)W.dropOut();}
    if(k>='1'&&k<='9')W.engage(+k);if(k==='0')W.dropOut();
    if(k===' '){W.fire&&W.fire('phasers');e.preventDefault();}if(k==='t')W.fire&&W.fire('torpedo');
    if(k.startsWith('Arrow'))e.preventDefault();});
  addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k);});
  addEventListener('blur',()=>keys.clear());
  function setImpulse(f){S.imp=Math.max(0,Math.min(1,Math.round(f*4)/4));}
  W.setImpulse=setImpulse;

  // the chase camera's own drag and wheel: while flying the page's turntable is told to keep its hands off
  {const el=renderer.domElement;let d=null;
   el.addEventListener('pointerdown',e=>{if(S.on)d={x:e.clientX,y:e.clientY};});
   addEventListener('pointermove',e=>{if(!S.on||!d)return;S.cy-=(e.clientX-d.x)*0.005;S.cp=Math.max(-1.35,Math.min(1.35,S.cp+(e.clientY-d.y)*0.004));d={x:e.clientX,y:e.clientY};});
   addEventListener('pointerup',()=>{d=null;});
   el.addEventListener('wheel',e=>{if(!S.on)return;S.cd=Math.max(140,Math.min(9000,S.cd*Math.exp(e.deltaY*0.0011)));},{passive:true});}

  // ---- the dust and the warp streaks ----
  // Out here nothing near you shows that you are moving, so a thin field of dust is kept round the camera (each
  // grain wrapped back into a box three kilometres across as you pass it); at warp it becomes streaks.
  const DN=1400,DL=3000,SN=500,SL=24000;
  const dpos=new Float32Array(DN*3),spos=new Float32Array(SN*6),seed=[];
  let rs=1701;const rnd=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296;};
  for(let i=0;i<DN*3;i++)dpos[i]=(rnd()-0.5)*DL;
  for(let i=0;i<SN;i++)seed.push([(rnd()-0.5)*SL,(rnd()-0.5)*SL,(rnd()-0.5)*SL]);
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0x9fb0c8,size:2.2,sizeAttenuation:true,transparent:true,opacity:0.55,depthWrite:false,toneMapped:false}));
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(spos,3));
  const streaks=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xbfd8ff,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  for(const o of [dust,streaks]){o.frustumCulled=false;o.userData.noWire=true;o.visible=false;scene.add(o);}
  const wrap=(a,L)=>a-L*Math.floor(a/L+0.5);

  const fwd=new THREE.Vector3(),tmp=new THREE.Vector3(),r1=new THREE.Vector3(),r2=new THREE.Vector3(),qd=new THREE.Quaternion(),ax=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
  let last=null;
  animHooks.push(now=>{
    const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;
    if(S.on){
      // the helm: turn rates ease towards what the keys ask, a few degrees a second, as a ship this size would
      const has=k=>keys.has(k)||pad.has(k);
      const yaw=(has('a')||has('ArrowLeft')?1:0)-(has('d')||has('ArrowRight')?1:0);
      const pitch=(has('ArrowUp')||has('r')?1:0)-(has('ArrowDown')||has('f')?1:0);
      const roll=(has('e')?1:0)-(has('q')?1:0);
      const k=1-Math.exp(-dt*1.8);
      S.rate.x+=(roll*0.35-S.rate.x)*k;S.rate.y+=(yaw*0.13-S.rate.y)*k;S.rate.z+=(pitch*0.10-S.rate.z)*k;
      for(let i=0;i<3;i++){const r=S.rate.getComponent(i);if(r){qd.setFromAxisAngle(ax[i],r*dt);ROOT.quaternion.multiply(qd);}}
      ROOT.quaternion.normalize();
      const tv=S.warp?WARPV*S.warp:S.imp*FULL;
      S.v+=(tv-S.v)*(1-Math.exp(-dt*(S.warp||S.v>FULL*1.5?2.5:0.35)));
      fwd.set(1,0,0).applyQuaternion(ROOT.quaternion);
      ROOT.position.addScaledVector(fwd,S.v*dt);
      if(S.v>FULL*2)SYS.position.addScaledVector(fwd,S.v*dt);
      // the floating origin
      if(ROOT.position.lengthSq()>4e8){const off=ROOT.position.clone();for(const o of [ROOT,SYS,FX])o.position.sub(off);
        for(let i=0;i<DN;i++){dpos[i*3]-=off.x;dpos[i*3+1]-=off.y;dpos[i*3+2]-=off.z;}}
    }
    // the lights follow the ship wherever it is, from the directions the sun and the planet are in
    key.position.copy(ROOT.position).addScaledVector(sun,1e4);key.target.position.copy(ROOT.position);
    fill.position.copy(ROOT.position).addScaledVector(fillDir,1e4);fill.target.position.copy(ROOT.position);
    lamp.target.position.copy(ROOT.position);
    for(const L of lights)L.target.updateMatrixWorld();
  });

  // the chase camera, when flying (the page's turntable otherwise)
  const camFrame=now=>{
    SKY.position.copy(camera.position);
    if(!S.on)return false;
    const q=ROOT.quaternion,c=ROOT.position;
    tmp.set(-Math.cos(S.cp)*Math.cos(S.cy),Math.sin(S.cp),Math.cos(S.cp)*Math.sin(S.cy)).multiplyScalar(S.cd).applyQuaternion(q);
    S.camRel.lerp(tmp,0.12);
    const upW=new THREE.Vector3(0,1,0).applyQuaternion(q);S.up.lerp(upW,0.12).normalize();
    camera.position.copy(c).add(S.camRel);
    if(S.shake>0){S.shake*=0.9;camera.position.x+=(Math.random()-0.5)*S.shake;camera.position.y+=(Math.random()-0.5)*S.shake;}
    camera.up.copy(S.up);
    fwd.set(1,0,0).applyQuaternion(q);
    camera.lookAt(tmp.copy(c).addScaledVector(fwd,S.cd*0.12));
    lamp.position.copy(camera.position);
    SKY.position.copy(camera.position);
    // the dust round the camera, or the streaks at warp
    const warp=S.v>FULL*3;dust.visible=!warp&&S.v>1;streaks.visible=warp;
    const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
    if(dust.visible){for(let i=0;i<DN;i++){const j=i*3;dpos[j]=cx+wrap(dpos[j]-cx,DL);dpos[j+1]=cy+wrap(dpos[j+1]-cy,DL);dpos[j+2]=cz+wrap(dpos[j+2]-cz,DL);}
      dg.attributes.position.needsUpdate=true;}
    if(warp){const len=Math.min(5000,S.v*0.025),t=now*0.001*S.v*0.08;
      r1.set(0,1,0).applyQuaternion(q);r2.set(0,0,1).applyQuaternion(q);
      for(let i=0;i<SN;i++){const s=seed[i];
        // each streak slides back past the ship along its own line, wrapping round
        const along=wrap(s[0]-t,SL),a=s[1]*0.5,b=s[2]*0.5;
        const x=cx+fwd.x*along+r1.x*a+r2.x*b,y=cy+fwd.y*along+r1.y*a+r2.y*b,z=cz+fwd.z*along+r1.z*a+r2.z*b;
        const j=i*6;spos[j]=x;spos[j+1]=y;spos[j+2]=z;spos[j+3]=x-fwd.x*len;spos[j+4]=y-fwd.y*len;spos[j+5]=z-fwd.z*len;}
      sg.attributes.position.needsUpdate=true;}
    return true;
  };

  // ---- taking the helm, and handing it back ----
  function start(){
    if(S.on)return;S.on=true;
    const qi=ROOT.quaternion.clone().invert();
    S.camRel.copy(camera.position).sub(ROOT.position);
    const L=S.camRel.clone().applyQuaternion(qi);S.cd=Math.max(140,L.length());S.cp=Math.asin(Math.max(-1,Math.min(1,L.y/S.cd)));S.cy=Math.atan2(L.z,-L.x);
    S.up.copy(camera.up);
    if(!S.imp&&!S.warp)setImpulse(0.25);
    help.style.display=padEl.style.display='';
  }
  function stop(){
    if(!S.on)return;
    if(S.warp)W.dropOut(true);
    S.on=false;S.v=0;S.imp=0;S.rate.set(0,0,0);dust.visible=streaks.visible=false;
    help.style.display=padEl.style.display='none';
    // put the ship back at the origin, level, by moving the world round it the other way
    const p=ROOT.position.clone(),qi=ROOT.quaternion.clone().invert();
    for(const o of [SYS,FX]){o.position.sub(p).applyQuaternion(qi);o.quaternion.premultiply(qi);}
    SKY.quaternion.premultiply(qi);sun.applyQuaternion(qi);fillDir.applyQuaternion(qi);
    const rel=S.camRel.clone().applyQuaternion(qi),d=rel.length();
    ROOT.position.set(0,0,0);ROOT.quaternion.identity();
    W.api.view({az:Math.atan2(rel.z,rel.x),el:Math.asin(Math.max(-1,Math.min(1,rel.y/d))),d,tx:0,ty:0,tz:0});
  }
  // a new system round you: the sky, the planet and its sun turned to a new heading
  function relocate(){
    const r=new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random()-0.5)*0.6,Math.random()*Math.PI*2,(Math.random()-0.5)*0.4));
    SYS.position.copy(ROOT.position);SYS.quaternion.premultiply(r);SKY.quaternion.premultiply(r);sun.applyQuaternion(r);fillDir.applyQuaternion(r);
    if(W.placeTarget)W.placeTarget();
  }
  W.relocate=relocate;

  // ---- the help and the touch helm ----
  // (styled here: only this page has them; the colours are the Chicago shell's, which this page wears)
  {const st=document.createElement('style');st.textContent=`
#ent-help{position:fixed;left:14px;bottom:calc(var(--barh,56px) + 8px);max-width:min(340px,calc(100% - 28px));font:12px/1.55 Helvetica,Arial,sans-serif;color:#dfe8f0;background:rgba(8,20,34,.82);border:1px solid #3f5a74;padding:8px 10px;z-index:5;pointer-events:none}
#ent-help b{letter-spacing:.12em;text-transform:uppercase;font-size:11px;color:#9fb4c8}
#ent-pad{position:fixed;right:14px;bottom:calc(var(--barh,56px) + 8px);display:grid;grid-template-columns:repeat(3,48px);gap:5px;z-index:5;touch-action:none}
#ent-pad button{height:44px;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #7fa6c8;font:18px Helvetica,Arial,sans-serif;border-radius:3px;cursor:pointer;user-select:none;-webkit-user-select:none}
#ent-pad button:active{background:#7fa6c8;color:#08131f}
#pitpanel{background:rgba(8,20,34,.94);border-color:#3f5a74}
#pitpanel button{background:rgba(10,24,40,.8);color:#dfe8f0;border-color:#3f5a74;font-family:Helvetica,Arial,sans-serif}
#pitpanel .sub{color:#9fb4c8;font-family:Helvetica,Arial,sans-serif}
#pitpanel button[aria-pressed="true"]{background:#7fa6c8;color:#08131f}
@media (pointer:fine){#ent-pad{display:none!important}}
@media (max-width:600px){#ent-help{display:none!important}}
body.bare #ent-help,body.bare #ent-pad{display:none!important}`;document.head.appendChild(st);}
  const help=document.createElement('div');help.id='ent-help';help.style.display='none';
  help.innerHTML='<b>At the helm</b><br>W / S impulse up and down · X all stop<br>A / D turn · ↑ / ↓ (or R / F) pitch · Q / E roll<br>1–9 warp · 0 drop out<br>Space phasers · T torpedo<br>Drag to look round, scroll to stand off';
  const padEl=document.createElement('div');padEl.id='ent-pad';padEl.style.display='none';
  const names={q:'Roll left',ArrowUp:'Nose up',e:'Roll right',a:'Turn left',ArrowDown:'Nose down',d:'Turn right',s1:'Slower',x1:'All stop',w1:'Faster'};
  for(const [lab,k] of [['⟲','q'],['▲','ArrowUp'],['⟳','e'],['◀','a'],['▼','ArrowDown'],['▶','d'],['−','s1'],['■','x1'],['+','w1']]){
    const b=document.createElement('button');b.type='button';b.textContent=lab;b.setAttribute('aria-label',names[k]);
    if(k.endsWith('1'))b.onclick=()=>{if(k==='w1')setImpulse(S.imp+0.25);if(k==='s1')setImpulse(S.imp-0.25);if(k==='x1'){setImpulse(0);if(S.warp)W.dropOut();}};
    else{const on=e=>{pad.add(k);e.preventDefault();},off=()=>pad.delete(k);
      b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);}
    padEl.appendChild(b);}
  document.body.append(help,padEl);

  // the helm's line in the readout: speed, and the heading and mark the way the bridge would say them
  const hud=()=>{
    if(!S.on)return '';
    fwd.set(1,0,0).applyQuaternion(ROOT.quaternion).applyQuaternion(SKY.quaternion.clone().invert());
    const hd=((Math.round(Math.atan2(-fwd.z,fwd.x)*180/Math.PI)%360)+360)%360,mk=Math.round(Math.asin(Math.max(-1,Math.min(1,fwd.y)))*180/Math.PI);
    const sp=S.warp?'warp '+S.warp:S.imp===0?(S.v>5?'coasting':'all stop'):S.imp===1?'full impulse':(S.imp*4)+'/4 impulse';
    let pl='';const b=bodyObjs[0];if(b){b.getWorldPosition(tmp);pl=' · planet '+Math.round(Math.max(0,tmp.distanceTo(ROOT.position)-PR)/1000)+' km';}
    return sp+' · '+(S.v>=1000?(S.v/1000).toFixed(S.v>1e5?0:1)+' km/s':Math.round(S.v)+' m/s')+' · heading '+String(hd).padStart(3,'0')+' mark '+mk+pl;
  };
  return {start,stop,camFrame,hud,FULL,WARPV};
}
