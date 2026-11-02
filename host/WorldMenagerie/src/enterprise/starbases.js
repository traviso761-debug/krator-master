// ---------- Galaxy class: the starbases ----------
// Fan work. Star Trek belongs to Paramount; the starbases here are this project's own design, not any station from
// any film or series, and their numbers are made up for the page.
//
// One design, built as many times as there are stations: a spindle with a habitat ring on four spokes (two rings
// on the bigger ones), radiators, beacons, lit windows, a docking arm with a berth beside it, and small craft coming
// and going round it. Starbase 1 is the yard the page opens beside, ten kilometres off the starboard bow; the others
// are in orbit over the planets of the places on the chart (STATIONS), a little above the air on the side you
// arrive from, so the planet is behind them as you come in.
//
// K (or "Dock", or a starbase on the chart or its marker) docks at the nearest one in the place you are at. From
// far off the ship goes there first under the impulse autopilot (cartography.js), to a point out beyond the end of
// the arm; then approach control takes the helm: a smooth curve to a point astern of the berth, already lined up,
// then in along the arm at a walking pace, slowing to nothing at the clamps. Any touch on the helm cancels. K
// again, or the helm, casts off.
// where they are: `pos` in the place's own frame, or over `body` (an index into the place's planets) at `alt`
// planetary radii above it, `turn` radians round the planet from the point under the place's origin, `lift` up
export const STATIONS=[
  {n:1,place:'home',pos:[9000,350,4800],ry:-0.5,note:'The yard the ship is based at, ten kilometres off the starboard bow of where she lies.'},
  {n:2,place:'home',body:0,alt:0.06,turn:0.45,lift:0.12,rings:2,note:'In a high orbit over the home world: the sector\'s fleet anchorage.'},
  {n:12,place:'giant',body:0,alt:0.08,turn:-0.4,lift:0.1,rings:2,note:'Over the gas giant\'s cloud tops, inside its rings: a fuel depot and a refinery for the hydrogen the tankers skim.'},
  {n:23,place:'ice',body:0,alt:0.1,turn:0.35,lift:-0.08,note:'Over the ice world\'s day side, where the red dwarf never sets: a research station and a relay.'},
  {n:47,place:'ocean',body:0,alt:0.07,turn:-0.3,lift:0.15,rings:2,note:'Above the water world\'s weather, between it and its rings: a colony\'s port and shipyard.'},
  {n:74,place:'lava',body:0,alt:0.22,turn:0.5,lift:0.1,note:'Well clear of the lava world\'s heat, on its night side\'s edge: a geological survey post.'},
  {n:9,place:'belt',pos:[26000,1800,-9000],ry:0.8,note:'A mining station in the belt, where the ore haulers bring the rock.'},
];
export const stationName=s=>'Starbase '+s.n;
// the starbases at a place on the chart, by its id
export const stationsAt=id=>STATIONS.filter(s=>s.place===id);

export function starbases(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const M={
    light:new THREE.MeshStandardMaterial({color:0xb8bec4,metalness:0.45,roughness:0.42,envMap:W.env,envMapIntensity:1.2}),
    mid:new THREE.MeshStandardMaterial({color:0x8a9097,metalness:0.5,roughness:0.5,envMap:W.env}),
    dark:new THREE.MeshStandardMaterial({color:0x40464e,metalness:0.4,roughness:0.6,envMap:W.env}),
    win:new THREE.MeshBasicMaterial({color:0xffe2b0,toneMapped:false}),
    craft:new THREE.MeshStandardMaterial({color:0xc0c4c8,metalness:0.3,roughness:0.5,envMap:W.env})};
  const geo={};   // the shapes every station shares
  const once=(k,f)=>geo[k]||(geo[k]=f());

  // ---- one station ----
  function build(o){
    const SB=new THREE.Group();
    const add=(g,mat,x,y,z)=>{const m=new THREE.Mesh(g,mat);m.position.set(x||0,y||0,z||0);m.castShadow=m.receiveShadow=true;SB.add(m);return m;};
    // the spindle: a lathe, stacked decks swelling to a hub at the ring's level
    add(once('spindle',()=>new THREE.LatheGeometry([[0,-760],[60,-740],[95,-640],[110,-520],[90,-470],[120,-380],[120,-160],[190,-80],[230,0],[190,80],[120,160],[120,380],[95,460],[70,560],[40,660],[8,720],[0,724]].map(([r,y])=>new THREE.Vector2(r,y)),64)),M.light);
    for(const y of [-420,-300,-200,240,340])add(once('deck',()=>new THREE.CylinderGeometry(126,126,14,64)),M.mid,0,y,0);
    // the habitat rings, and their windows in two rows, inside and out
    const rings=o.rings===2?[[0,900],[300,620]]:[[0,900]];
    for(const [y,R] of rings){
      add(once('ring'+R,()=>new THREE.TorusGeometry(R,62,24,Math.round(R/5))),M.light,0,y,0).rotation.x=Math.PI/2;
      const band=add(once('band'+R,()=>new THREE.TorusGeometry(R,64,6,Math.round(R/5))),M.dark,0,y,0);band.scale.set(1,1,0.12);band.rotation.x=Math.PI/2;
      const n=Math.round(R*1.55),im=new THREE.InstancedMesh(once('win',()=>new THREE.BoxGeometry(1,1,1)),M.win,n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
      for(let i=0;i<n;i++){const h=n>>1,a=(i%h)/h*Math.PI*2,row=i<h?1:-1,r=R+row*63.5,lit=Math.sin(i*12.9898+o.n)*43758.5453%1;
        e.set(0,-a,0);q.setFromEuler(e);m.compose(V().set(Math.cos(a)*r,y+(Math.abs(lit)>0.5?14:-14),Math.sin(a)*r),q,V().set(2,4,3.2));im.setMatrixAt(i,m);}
      SB.add(im);
      // four spokes out to it
      for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4+(y?Math.PI/4:0),s=add(once('spoke'+R,()=>new THREE.CylinderGeometry(22,22,R-240,12)),M.mid,Math.cos(a)*(R+240)/2,y,Math.sin(a)*(R+240)/2);
        s.rotation.z=Math.PI/2;s.rotation.y=-a;}
    }
    // the radiators off the spindle's top
    for(let k=0;k<3;k++){const a=k*Math.PI*2/3,p=add(once('rad',()=>new THREE.BoxGeometry(420,6,110)),M.dark,Math.cos(a)*300,520,Math.sin(a)*300);p.rotation.y=-a;}
    // the docking arm: a truss out below the ring, lit along its length, the berth beside its end
    add(once('arm',()=>new THREE.BoxGeometry(1500,26,26)),M.mid,860,-520,0);
    for(let x=180;x<=1600;x+=70){const l=F.sprite(0xffe2b0,14,0.9);l.position.set(x,-505,13);SB.add(l);}
    add(once('clamp',()=>new THREE.BoxGeometry(60,60,60)),M.dark,1620,-520,0);
    // beacons, blinking
    const beacons=[];for(const [x,y,z,c] of [[0,730,0,0xff3020],[0,-768,0,0xff3020],[960,0,0,0x30ff60],[-960,0,0,0xff3020],[1650,-520,0,0xffffff]]){const s=F.sprite(c,40,1);s.position.set(x,y,z);SB.add(s);beacons.push(s);}
    // floodlights on the hub's flanks
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,s=F.sprite(0xfff4d8,140,0.35);s.position.set(Math.cos(a)*235,0,Math.sin(a)*235);SB.add(s);}
    // small craft round it, each on a tilted loop of its own
    const craft=[];
    for(let i=0;i<5;i++){const g=new THREE.Group(),b=new THREE.Mesh(once('craft',()=>new THREE.BoxGeometry(14,5,7)),M.craft);g.add(b);
      const e=F.sprite(0x9fc8ff,12,0.9);e.position.x=-8;g.add(e);const l=F.sprite(i%2?0xff3020:0x30ff60,6,1);l.position.set(2,3,0);g.add(l);
      g.userData={a:i*1.3+o.n,r:1300+i*230,w:(i%2?1:-1)*(0.04+i*0.008),tilt:(i-2)*0.25};SB.add(g);craft.push(g);}
    SB.traverse(x=>{x.userData.noWire=true;});
    return {g:SB,beacons,craft};
  }

  // ---- where they go ----
  const live=[];W.stations=live;
  function place(pl){
    for(const s of stationsAt(pl.P.id)){
      const b=build(s),g=b.g;
      if(s.pos){g.position.set(...s.pos);g.rotation.y=s.ry||0;}
      else{const P=pl.solids.filter(x=>x.orbit)[s.body||0];if(!P)continue;
        // out from the planet towards where you arrive, turned round it and lifted a little
        const d=P.c.clone().negate().normalize().applyAxisAngle(V().set(0,1,0),s.turn||0);d.y+=s.lift||0;d.normalize();
        g.position.copy(P.c).addScaledVector(d,P.r*(1+(s.alt||0.08)));
        // the arm points along the orbit, so the berth is in plain view as you come in
        g.rotation.y=Math.atan2(d.x,d.z);}
      const rec={n:s.n,name:stationName(s),note:s.note,place:pl,g,beacons:b.beacons,craft:b.craft};
      g.userData.info={name:rec.name,info:s.note+' K at the helm docks; from far off the ship flies there first.'};
      pl.group.add(g);pl.solids.push({name:rec.name,c:g.position.clone(),r:560,station:true});
      W.pickable(g);live.push(rec);}
  }
  place(W.homePlace);
  W.placeHooks.push(place);
  const here=()=>live.filter(r=>r.place===W.herePlace()&&r.place.group.visible);
  let tt=0;
  animHooks.push(()=>{tt+=0.016;
    for(const r of here()){
      for(const [i,b] of r.beacons.entries())b.material.opacity=((tt*0.8+i*0.37)%1)<0.12?1:0.12;
      for(const g of r.craft){const u=g.userData;u.a+=u.w*0.016;const x=Math.cos(u.a)*u.r,z=Math.sin(u.a)*u.r;g.position.set(x,Math.sin(u.a*2)*120+z*Math.sin(u.tilt),z*Math.cos(u.tilt));
        g.rotation.y=-u.a-(u.w>0?Math.PI/2:-Math.PI/2);}}});

  // ---- docking ----
  const BERTH=new THREE.Vector3(1050,-520,330),AFT=new THREE.Vector3(2600,-520,330),OUT=new THREE.Vector3(6500,-520,330);
  const dock={phase:null,st:null};
  const toW=(st,v)=>st.g.localToWorld(v.clone());
  const qOf=st=>st.g.getWorldQuaternion(new THREE.Quaternion());
  const armDir=st=>V().set(1,0,0).applyQuaternion(qOf(st));
  const ease=u=>u<0?0:u>1?1:u*u*(3-2*u),bez=(a,b,c,d,t)=>{const s=1-t;return a.clone().multiplyScalar(s*s*s).addScaledVector(b,3*s*s*t).addScaledVector(c,3*s*t*t).addScaledVector(d,t*t*t);};
  const nearest=()=>{let b=null,bd=Infinity;for(const r of here()){const d=toW(r,BERTH).distanceTo(ROOT.position);if(d<bd){bd=d;b=r;}}return b;};
  // the curve in from here, in the station's frame, so that it holds if the floating origin moves
  function approach(st){
    const p0=st.g.worldToLocal(ROOT.position.clone()),f=V().set(1,0,0).applyQuaternion(ROOT.quaternion).applyQuaternion(qOf(st).invert());
    const L=p0.distanceTo(AFT);
    dock.path=[p0,p0.clone().addScaledVector(f,L*0.3),AFT.clone().add(V().set(Math.max(3000,L*0.6),0,0)),AFT.clone()];
    dock.T1=Math.max(25,L/350);dock.t0=F.T();dock.phase='approach';
    W.setThrottle(0);F.note('Approach control, '+st.name+': cleared to dock, berth one. We have the helm.');
  }
  function doDock(st){
    if(dock.phase==='docked'){dock.phase=null;W.setThrottle(0.15);F.note('Cast off from '+dock.st.name+'.');return;}
    if(dock.phase&&!st){W.cancelAuto();return;}
    st=st&&st.g?st:nearest();
    if(!st){F.note('There is no starbase here. The chart (P) shows where they are.');return;}
    if(S.warp){F.note('Drop out of warp first.');return;}
    if(!S.on)W.startFlight();
    W.cancelAuto(true);S.orbit=null;W.course&&W.course.clear();dock.st=st;
    const d=toW(st,BERTH).distanceTo(ROOT.position);
    if(d<12000){approach(st);return;}
    // from far off: the impulse autopilot to a point out beyond the arm's end, then approach control
    dock.phase='transit';
    W.goto({name:st.name,pos:()=>toW(st,OUT),stop:0,quiet:true,done:()=>{if(dock.phase==='transit'&&dock.st===st)approach(st);}});
    F.note('Laying in a course for '+st.name+', '+Math.round(d/1000).toLocaleString('en')+' km, at full impulse.');
  }
  W.dock=doDock;W.dockTarget=()=>dock.phase?dock.st:null;
  {const prev=W.cancelAuto;W.cancelAuto=quiet=>{if(dock.phase&&!quiet)F.note(dock.phase==='docked'?'Cast off.':'Docking cancelled.');dock.phase=null;prev&&prev(quiet);};}
  const qLook=(st,dir)=>{const m=new THREE.Matrix4(),up=V().set(0,1,0).applyQuaternion(qOf(st)),x=dir.clone().normalize(),z=x.clone().cross(up).normalize(),y=z.clone().cross(x);
    m.makeBasis(x,y,z);return new THREE.Quaternion().setFromRotationMatrix(m);};
  const T2=40;
  animHooks.push(()=>{if(!dock.phase)return;const st=dock.st;
    // gone to warp, or the helm left, or somewhere else: approach control lets go
    if(!S.on||S.warp||W.spooling||W.herePlace()!==st.place){dock.phase=null;return;}
    if(dock.phase==='transit'){dock.d=toW(st,BERTH).distanceTo(ROOT.position);dock.v=S.v;return;}
    S.vel.set(0,0,0);S.rate.set(0,0,0);W.setThrottle(0);
    const u=F.T()-dock.t0;let p,dir,spd;
    if(dock.phase==='approach'){const s=ease(u/dock.T1),s2=ease((u+0.05)/dock.T1),P=dock.path;
      p=toW(st,bez(...P,s));const p2=toW(st,bez(...P,Math.min(1,s2+1e-4)));dir=p2.clone().sub(p);spd=dir.length()/0.05;
      if(dir.lengthSq()<1e-6)dir=armDir(st).negate();
      if(u>=dock.T1){dock.phase='final';dock.t0=F.T();F.note('On the approach. Thrusters only.');}}
    else if(dock.phase==='final'){const s=ease(u/T2);p=toW(st,AFT.clone().lerp(BERTH,s));dir=armDir(st).negate();spd=(AFT.x-BERTH.x)*(ease((u+0.05)/T2)-s)/0.05;
      if(u>=T2){dock.phase='docked';F.note('Docking clamps engaged. Welcome to '+st.name+'.');F.sound('shield');}}
    else{p=toW(st,BERTH);dir=armDir(st).negate();spd=0;}
    ROOT.position.copy(p);ROOT.quaternion.slerp(qLook(st,dir),dock.phase==='docked'?0.05:0.08);dock.v=spd;dock.d=p.distanceTo(toW(st,BERTH));});

  // K docks from the turntable too (the helm's own K is in flight.js)
  addEventListener('keydown',e=>{if(S.on||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA/.test(e.target.tagName||''))return;
    if(e.key==='k'||e.key==='K')doDock();});

  const hud=()=>{const n=dock.st?dock.st.name:'the starbase';
    return dock.phase==='docked'?'docked at '+n:dock.phase==='transit'?'for '+n+', '+Math.round((dock.d||0)/1000).toLocaleString('en')+' km':
      dock.phase?'docking: '+dock.phase+', '+Math.round(dock.d||0)+' m to the berth, '+Math.round(dock.v||0)+' m/s':'';};
  return {hud,dock:doDock,here,
    act:{dock:()=>doDock()},
    buttons:[['Dock at the nearest starbase',()=>doDock()]],
    state:()=>({dock:dock.phase,st:dock.st&&dock.st.n,u:+(F.T()-(dock.t0||0)).toFixed(1),T1:dock.T1,d:Math.round(dock.d||0)})};
}
