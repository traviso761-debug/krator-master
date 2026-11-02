// ---------- Galaxy class: the fleet going about its business ----------
// Fan work. Star Trek belongs to Paramount; every ship here is this project's own design (not any ship from any film,
// series or game) and every name and registry is made up for the page.
//
// Federation starships that nobody here is flying: they patrol round the starbases, lie docked at them, orbit the
// planets, survey the stranger places, and pass through at impulse and go to warp. Four classes, each built once from
// the shared hull pieces (src/starship/parts.js) and folded to a few meshes, then cloned:
//
//   Kestrel    a frigate of about 220 m: a saucer, a short body under its after half, nacelles slung below.
//   Meridian   a cruiser of about 410 m: saucer, neck, a long secondary hull, nacelles out level with it on outriggers.
//   Tamar      a science vessel of about 170 m: a small saucer on a deep body, one big nacelle on a fin above.
//   Halyard    a transport of about 230 m: a slab hull with cargo pods along its back and two short nacelles.
//
// Each place's ships are made the first time you arrive there (W.placeHooks) from a seed of its own, so the same
// ships are at the same place every time; they move only while you are there. Click one for its card; the chart
// (cartography.js) shows them, and the autopilot can bring the ship alongside.
//
// Two more things a ship can be doing, for comms.js and orders.js: an **escort** keeps a slot in formation off the
// Enterprise's quarter, goes to warp when she does and comes out of it beside her wherever she arrives (through the
// wormhole too), holds still while she docks, and fires on whatever she is fighting; a **wreck** drifts, tumbling
// slowly, its lights failing, venting, until someone takes its crew off.
import {discHull,tube,SECT,fold} from '../starship/parts.js';

const CLASSES={
  kestrel:{title:'Kestrel-class frigate',blurb:'A frigate: a saucer, a short body under its after half, and its nacelles slung low.'},
  meridian:{title:'Meridian-class cruiser',blurb:'An explorer of the line: saucer, neck and a long secondary hull, its nacelles out level with it on long outriggers.'},
  tamar:{title:'Tamar-class science vessel',blurb:'A survey ship: a small saucer on a deep body full of sensors, one great nacelle on a fin above.'},
  halyard:{title:'Halyard-class transport',blurb:'A fleet transport: a slab hull, cargo pods along its back, two short nacelles.'},
};
const NAMES=[['USS Arden','NCC-71802','kestrel'],['USS Callander','NCC-75530','meridian'],['USS Tamsin','NCC-68211','tamar'],['USS Halvard','NCC-59003','halyard'],
  ['USS Corvo','NCC-72940','kestrel'],['USS Ilsabet','NCC-77104','meridian'],['USS Vantor','NCC-66318','tamar'],['USS Ellery','NCC-70455','kestrel'],
  ['USS Brannoch','NCC-74822','halyard'],['USS Sorrel','NCC-69977','tamar'],['USS Aldane','NCC-73310','meridian'],['USS Wrenfield','NCC-71266','kestrel'],
  ['USS Marisol','NCC-76031','meridian'],['USS Teague','NCC-58840','halyard'],['USS Odalys','NCC-74409','tamar'],['USS Penrhyn','NCC-70918','kestrel']];

export function traffic(W){
  const {THREE,SYS,animHooks}=W,F=W.fx,V=()=>new THREE.Vector3();
  const std=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,envMap:W.env,envMapIntensity:1.1});
  const M={hull:std(0xc6cbcf,0.35,0.45),panel:std(0xaab1b8,0.35,0.5),dark:std(0x4c535b,0.4,0.6),
    lit:new THREE.MeshBasicMaterial({color:0xffe6b0,toneMapped:false}),warp:new THREE.MeshBasicMaterial({color:0x6ea6ee,toneMapped:false}),
    buss:new THREE.MeshBasicMaterial({color:0xff5a30,toneMapped:false}),imp:new THREE.MeshBasicMaterial({color:0xff3a14,toneMapped:false})};

  // ---- the pieces ----
  function design(cls){
    const parts=[],glows=[],g=new THREE.Group();
    const glow=(x,y,z,col,size,op)=>{const s=F.sprite(col,size,op);s.position.set(x,y,z);g.add(s);glows.push(s);return s;};
    const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parts.push(m);return m;};
    const saucer=(R,h,x,y)=>{const {mesh,outline}=discHull(THREE,M.hull,{R,cut:-R*0.82,seg:48,rings:8,
        top:[[0,h],[R*0.18,h*0.96],[R*0.6,h*0.55],[R,h*0.12]],bot:[[0,-h*0.8],[R*0.3,-h*0.72],[R*0.75,-h*0.38],[R,-h*0.12]]});
      mesh.position.set(x,y,0);parts.push(mesh);
      // the bridge, and a ring of windows round the rim
      box(R*0.16,h*0.5,R*0.13,M.panel,x+R*0.02,y+h*1.1,0);
      for(const o of outline)if(!o.cut&&Math.round(o.th*30)%2===0)box(1.4,1.1,1.4,M.lit,x+o.x*0.985,y+(o.yT+o.yB)/2,o.z*0.985);
      glow(x-R*0.8,y,0,0xff3a14,h*2.4,0.8);box(1,h*0.25,R*0.5,M.imp,x-R*0.82,y,0);
      glow(x,y,R*1.01,0x30ff60,5,1);glow(x,y,-R*1.01,0xff2a1a,5,1);};
    const body=(x0,L,r,y,sect)=>{parts.push(tube(THREE,[{x:x0,ry:r*0.15,rz:r*0.15,cy:y},{x:x0-L*0.06,ry:r*0.8,rz:r*0.7,cy:y},{x:x0-L*0.3,ry:r,rz:r*0.9,cy:y},
        {x:x0-L*0.8,ry:r*0.85,rz:r*0.75,cy:y},{x:x0-L,ry:r*0.45,rz:r*0.4,cy:y}],16,M.hull,true,true,sect||SECT.slabS(8)));};
    const nacelle=(x0,L,r,y,z)=>{parts.push(tube(THREE,[{x:x0,ry:r*0.5,rz:r*0.5,cy:y,cz:z},{x:x0-L*0.08,ry:r*0.85,rz:r,cy:y,cz:z},{x:x0-L*0.9,ry:r*0.8,rz:r*0.95,cy:y,cz:z},
        {x:x0-L,ry:r*0.3,rz:r*0.35,cy:y,cz:z}],12,M.panel,true,true,SECT.slabS(6)));
      const cap=new THREE.Mesh(new THREE.SphereGeometry(r*0.62,12,8),M.buss);cap.position.set(x0+r*0.05,y,z);parts.push(cap);glow(x0+r*0.4,y,z,0xff5a2a,r*4.2,0.85);
      for(const sd of [1,-1])box(L*0.7,r*0.5,0.6,M.warp,x0-L*0.5,y,z+sd*r*0.97);
      glow(x0-L*0.5,y,z,0x6ea6ee,r*5,0.4);};
    const strut=(a,b,chord,t)=>{const A=V().set(...a),B=V().set(...b),d=B.clone().sub(A),m=new THREE.Mesh(new THREE.BoxGeometry(chord,d.length(),t),M.hull);
      m.position.copy(A).add(B).multiplyScalar(0.5);m.quaternion.setFromUnitVectors(V().set(0,1,0),d.normalize());parts.push(m);};
    const defl=(x,y,r,col)=>{const d=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({color:col,toneMapped:false}));d.position.set(x,y,0);d.rotation.y=Math.PI/2;parts.push(d);glow(x+2,y,0,col,r*5,0.6);};
    if(cls==='kestrel'){saucer(62,10,20,0);body(-10,90,12,-14);defl(-8,-14,6,0xffa040);
      for(const sd of [1,-1]){nacelle(-40,120,7,-26,sd*46);strut([-50,-14,sd*8],[-80,-26,sd*44],26,3);}}
    else if(cls==='meridian'){saucer(115,16,60,0);box(60,46,18,M.hull,-10,-30,0);body(0,260,22,-58);defl(-2,-58,13,0x9fd0ff);
      // the nacelles level with the secondary hull, out on long flat outriggers swept back from its flanks
      for(const sd of [1,-1]){nacelle(-95,220,12,-62,sd*96);strut([-130,-60,sd*14],[-175,-62,sd*90],46,5);}}
    else if(cls==='tamar'){saucer(48,9,25,0);body(15,125,15,-17);defl(13,-17,8,0xffa040);
      const pod=new THREE.Mesh(new THREE.SphereGeometry(7,14,10),M.dark);pod.position.set(-10,-31,0);pod.scale.set(1.8,1,1);parts.push(pod);
      nacelle(-28,115,9,24,0);strut([-60,-6,0],[-78,20,0],44,4);}
    else{body(70,170,15,0,SECT.slab);box(18,7,20,M.panel,55,14,0);box(0.6,2,16,M.lit,64.4,14,0);
      for(let i=0;i<4;i++)box(26,12,22,i%2?M.dark:M.panel,25-i*32,17,0);
      for(const sd of [1,-1]){nacelle(-45,80,6,-6,sd*27);strut([-70,-2,sd*12],[-80,-6,sd*24],22,3);}}
    fold(THREE,g,parts);
    for(const c of g.children)if(c.isMesh){c.castShadow=false;c.receiveShadow=false;}
    g.traverse(o=>{o.userData.noWire=true;});
    return g;
  }
  const proto={};
  const make=cls=>{if(!proto[cls])proto[cls]=design(cls);return proto[cls].clone();};

  // ---- who is where ----
  const all=[];let nameAt=0;
  const nextName=pick=>{for(let k=0;k<NAMES.length;k++){const n=NAMES[(nameAt+k)%NAMES.length];if(!pick||n[2]===pick){nameAt=(nameAt+k+1)%NAMES.length;return n;}}return NAMES[nameAt++%NAMES.length];};
  function ship(pl,cls,task,named){
    const [name,reg,c]=named||nextName(cls),g=make(c),info={name:name+' ('+reg+')',info:''};
    g.userData.info=info;pl.group.add(g);W.pickable(g);
    const t={name,reg,cls:c,g,info,task,pl,heading:V().set(1,0,0),stretch:1,hidden:false};
    setInfo(t);all.push(t);return t;
  }
  const setInfo=t=>{t.info.info=CLASSES[t.cls].title+', of this page\'s own design. '+CLASSES[t.cls].blurb+' '+t.task.say;};
  function plan(pl){
    if(pl.P.id==='deep')return;
    let s=[...pl.P.id].reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
    const sts=W.stations.filter(r=>r.place===pl),bodies=pl.solids.filter(x=>x.orbit);
    const loop=(c,r,v,say,tilt)=>({kind:'loop',c,r,w:v/r*(rnd()<0.5?1:-1),a:rnd()*6.28,n:V().set(Math.sin(tilt||0),1,Math.cos(rnd()*6.28)*(tilt||0)).normalize(),say});
    sts.forEach((st,i)=>{
      ship(pl,i?null:'kestrel',loop(()=>st.g.position,3200+rnd()*2400,180+rnd()*160,'On patrol round '+st.name+'.',0.25));
      if(i===0){const off=V().set(1050,-520,-330);ship(pl,'halyard',{kind:'park',st,off,say:'Docked at '+st.name+', taking on stores.'});}});
    if(bodies[0]){const b=bodies[0];ship(pl,'meridian',loop(()=>b.c,b.r*1.22,2600,'In orbit over '+b.name+'.',0.35));}
    if(!sts.length&&!bodies.length){const c=V().set(22000+rnd()*14000,(rnd()-0.5)*4000,(rnd()-0.5)*20000);
      ship(pl,'tamar',loop(()=>c,6000+rnd()*5000,260,'Surveying '+pl.P.name.replace(/^An? /,'the ').toLowerCase()+'.',0.2));}
    ship(pl,null,{kind:'transit',rnd,say:'Passing through at impulse.'});
  }
  W.placeHooks.push(plan);plan(W.homePlace);

  // ---- moving them ----
  const e1=V(),e2=V(),q=new THREE.Quaternion(),mx=new THREE.Matrix4(),up=V(),tmp=V();
  const face=(t,h,u)=>{t.heading.copy(h).normalize();const x=t.heading,z=tmp.copy(x).cross(u).normalize(),y=V().crossVectors(z,x);mx.makeBasis(x,y,z);q.setFromRotationMatrix(mx);t.g.quaternion.copy(q);};
  const world=p=>SYS.localToWorld(p.clone());
  function warpFx(t,out){
    const p=world(t.g.position);F.flash(F.toFX(p),0xcfe4ff,t.cls==='meridian'?900:600,0.8);
    if(p.distanceTo(W.ROOT.position)<40000)F.sound('warp');
    t.fx={out,t0:0};
  }
  function transit(t,dt){
    const T=t.task,r=T.rnd;
    if(T.wait>0){T.wait-=dt;if(T.wait>0){t.g.visible=false;return;}
      // in from warp somewhere out ahead, on a line that passes a few kilometres from the middle of things
      const a=r()*6.28,el=(r()-0.5)*0.3,D=45000+r()*25000;T.p=V().set(Math.cos(a)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(a)*Math.cos(el)*D);
      const aim=V().set((r()-0.5)*16000,(r()-0.5)*3000,(r()-0.5)*16000);T.v=aim.sub(T.p).normalize().multiplyScalar(3000+r()*5000);T.left=(D*2)/T.v.length();
      t.g.position.copy(T.p);face(t,T.v,up.set(0,1,0));t.g.visible=true;warpFx(t,false);}
    if(T.p===undefined){T.wait=0.001+r()*4;t.g.visible=false;return;}
    T.left-=dt;t.g.position.addScaledVector(T.v,dt);
    if(T.left<=0&&!t.fx){warpFx(t,true);}
  }
  // ---- escorts and wrecks ----
  // slots off the Enterprise's quarters and above, in her own frame (+x ahead, +y up, +z to starboard)
  const SLOTS=[[-700,140,-900],[-700,140,900],[-1300,320,0]];
  const escorts=()=>all.filter(t=>t.task.kind==='escort');
  const slotWorld=(t,o)=>W.ROOT.localToWorld(o.set(...SLOTS[t.task.slot]));
  function setTask(t,task){t.task=task;setInfo(t);if(task.kind!=='transit')t.g.visible=true;}
  function escort(t){
    const used=escorts().map(e=>e.task.slot),slot=[0,1,2].find(i=>!used.includes(i));if(slot==null)return false;
    setTask(t,{kind:'escort',slot,say:'In formation with the Enterprise.',fireT:0,rnd:t.task.rnd||Math.random});return true;}
  // let go: it circles where it is (a loop with the normal straight up starts at +z of its centre)
  function release(t,say){const r=1800+Math.random()*1500,c=t.g.position.clone().add(V().set(0,0,-r));
    setTask(t,{kind:'loop',c:()=>c,r,w:220/r,a:0,n:V().set(0,1,0),say:say||'Holding station here.'});}
  // where an escort is when its formation is (re)joined: the slot itself, out of warp
  function toSlot(t,pl){if(t.pl!==pl){t.pl.group.remove(t.g);pl.group.add(t.g);t.pl=pl;}
    t.g.position.copy(pl.group.worldToLocal(slotWorld(t,V())));face(t,V().set(1,0,0).applyQuaternion(W.ROOT.quaternion).applyQuaternion(pl.group.getWorldQuaternion(new THREE.Quaternion()).invert()),up.set(0,1,0));}
  W.arriveHooks.push(pl=>{for(const t of escorts()){toSlot(t,pl);t.g.visible=true;warpFx(t,false);}});
  // a beam from an escort to what it is firing at, for half a second
  const beamM=new THREE.MeshBasicMaterial({color:0xff9a50,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  const beamG=new THREE.CylinderGeometry(1.6,1.6,1,6,1,true);
  function fire(t,foe){const a=t.g.getWorldPosition(V()),b=foe.m.g.getWorldPosition(V()),m=new THREE.Mesh(beamG,beamM);m.userData.noWire=true;m.frustumCulled=false;W.FX.add(m);
    const t0=F.T();F.sound('phaser');
    F.run(tt=>{const u=(tt-t0)/0.6;if(u>=1||foe.gone){W.FX.remove(m);return false;}
      const A=F.toFX(t.g.getWorldPosition(V())),B=F.toFX(foe.m.g.getWorldPosition(V())),d=B.clone().sub(A);
      m.position.copy(A).addScaledVector(d,0.5);m.quaternion.setFromUnitVectors(V().set(0,1,0),d.clone().normalize());m.scale.set(1,d.length(),1);m.material.opacity=0.9*(1-u);});
    setTimeout(()=>{if(!foe.gone&&W.HO)W.HO.hit(foe,7);},250);}
  // a wreck: venting, its lights going
  function wreck(pl,cls,at,name){
    const t=ship(pl,cls,{kind:'wreck',say:'Disabled: no power to the engines, life support failing, a hull breach amidships.'},name);
    t.g.position.copy(at);t.g.rotation.set(0.2,Math.random()*6,0.3);
    const vent=F.sprite(0xdfeaff,90,0.6);vent.position.set(-10,0,12);t.g.add(vent);t.vent=vent;
    // its own lights (the clone shares its class's materials)
    t.g.traverse(o=>{if(o.isSprite&&o!==vent){o.material=o.material.clone();o.userData.flick=Math.random()*9;}});return t;}
  let last=null;
  animHooks.push(now=>{const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;
    const pl=W.herePlace();if(!pl||!pl.group.visible)return;
    for(const t of all){if(t.pl!==pl)continue;const T=t.task;
      if(T.kind==='loop'){T.a+=T.w*dt;const c=T.c();e1.set(1,0,0).cross(T.n).normalize();if(e1.lengthSq()<0.5)e1.set(0,0,1);e2.crossVectors(T.n,e1);
        t.g.position.copy(c).addScaledVector(e1,Math.cos(T.a)*T.r).addScaledVector(e2,Math.sin(T.a)*T.r);
        face(t,tmp.copy(e1).multiplyScalar(-Math.sin(T.a)*Math.sign(T.w)).addScaledVector(e2,Math.cos(T.a)*Math.sign(T.w)).clone(),T.n);}
      else if(T.kind==='park'){const st=T.st;t.g.position.copy(T.off).applyQuaternion(st.g.quaternion).add(st.g.position);
        face(t,V().set(-1,0,0).applyQuaternion(st.g.quaternion),up.set(0,1,0).applyQuaternion(st.g.quaternion));}
      else if(T.kind==='escort'){
        // still while she docks; otherwise in its slot, swaying a little, facing the way she faces
        if(!(W.dockTarget&&W.dockTarget())){const w=slotWorld(t,V());w.y+=Math.sin(now*0.0004+T.slot)*25;t.g.position.copy(pl.group.worldToLocal(w));
          face(t,V().set(1,0,0).applyQuaternion(W.ROOT.quaternion).applyQuaternion(pl.group.getWorldQuaternion(new THREE.Quaternion()).invert()),up.set(0,1,0));}
        const foe=W.enemy;if(foe&&now*0.001>T.fireT&&foe.m.g.getWorldPosition(V()).distanceTo(t.g.getWorldPosition(V()))<9000){T.fireT=now*0.001+2.6+Math.random()*1.4;fire(t,foe);}}
      else if(T.kind==='wreck'){t.g.rotation.x+=dt*0.01;t.g.rotation.z+=dt*0.006;
        t.g.traverse(o=>{if(o.userData.flick!=null)o.material.opacity=Math.sin(now*0.003+o.userData.flick)>0.7||Math.sin(now*0.017+o.userData.flick*3)>0.96?0.9:0.05;});
        if(t.vent)t.vent.material.opacity=0.35+0.25*Math.sin(now*0.011);}
      else transit(t,dt);
      // going to warp: stretched along its heading to a streak and gone; coming out of it, the other way
      if(t.fx){t.fx.t0+=dt;const u=Math.min(1,t.fx.t0/0.45);t.g.scale.set(t.fx.out?1+40*u*u:1+40*(1-u)*(1-u),1,1);
        if(t.fx.out)t.g.position.addScaledVector(t.heading,dt*u*90000);
        if(u>=1){if(t.fx.out){t.g.visible=false;if(T.kind==='transit'){T.p=undefined;T.wait=20+T.rnd()*40;}}t.g.scale.set(1,1,1);t.fx=null;}}}});

  // escorts go to warp when she does
  let wasWarp=false;
  animHooks.push(()=>{const w=!!W.flight.warp;if(w&&!wasWarp)for(const t of escorts())if(t.g.visible){warpFx(t,true);t.task.inWarp=true;}wasWarp=w;});
  W.traffic={here:()=>all.filter(t=>t.pl===W.herePlace()&&t.g.visible),all,escort,release,escorts,wreck,setTask,
    spawn:(pl,cls,task,name)=>ship(pl,cls,task,name),remove:t=>{t.pl.group.remove(t.g);all.splice(all.indexOf(t),1);const i=W.pick.indexOf(t.g);if(i>=0)W.pick.splice(i,1);}};
  return {state:()=>({ships:all.length,here:W.traffic.here().map(t=>t.name+':'+t.task.kind)})};
}
