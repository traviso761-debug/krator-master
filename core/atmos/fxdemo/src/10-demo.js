// ================================================================= the effects demo (core/atmos/fxdemo): the valley's next stations' effects
// One scene a load (#scene=): each places its records first (core/anomaly's zones registered in core/tags, the hazards on
// core/hazard), then draws them through the shared pieces. biomes/ancientsvalley/PLAN-ANOMALIES.md 14 and PLAN.md 15.
// The props are demo stand-ins (boxes, cones), not any kit's.
(function(){const T=THREE,A=ATMOS,N=KANOM,$=id=>document.getElementById(id);
 const Q=new URLSearchParams(location.search.slice(1)+'&'+location.hash.slice(1));   /* ?scene= (the verify) or #scene= */
 // ---- the page
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
 renderer.outputEncoding=T.sRGBEncoding;document.body.appendChild(renderer.domElement);window.renderer=renderer;
 const scene=new T.Scene();const sky=new T.Color(0x8d9aa3);scene.background=sky;scene.fog=new T.FogExp2(sky,.0018);
 const camera=new T.PerspectiveCamera(60,innerWidth/innerHeight,.2,6000);
 const sun=new T.DirectionalLight(0xfff1dc,1.1);sun.position.set(300,500,200);scene.add(sun);const hemi=new T.HemisphereLight(0xbfd0e0,0x4a4236,.65);scene.add(hemi);
 const mat=c=>new T.MeshLambertMaterial({color:c});
 const ground=new T.Mesh(new T.PlaneGeometry(4000,4000,1,1),mat(0x55513f));ground.rotation.x=-Math.PI/2;scene.add(ground);
 const grid=new T.GridHelper(1200,60,0x4d4a3c,0x5d5a4a);grid.position.y=.02;scene.add(grid);
 const put=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);scene.add(o);return o;};
 const ring=(x,z,r,col,op)=>{const g=new T.RingGeometry(r-1.2,r,96);g.rotateX(-Math.PI/2);const o=new T.Mesh(g,new T.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false}));o.position.set(x,.08,z);scene.add(o);return o;};
 // ---- the modules: atmos on the page's loop; the registry every record goes into before it is drawn
 const hooks=[];let hour=15;
 A.init({THREE:T,scene,camera,hour:()=>hour,onFrame:fn=>hooks.push(fn),ground:()=>0,seed:1,err:m=>{$('errs').textContent+=m+'\n';},viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const TG=KTAGS.create({build:'fxdemo'});N.reset({seed:1});N.register(TG);
 const C=KHOST.camera({THREE:T,camera,renderer,scene,ground:()=>0,eye:1.7});
 const Wk=N.bindWalker(C);
 const fx=[],fxB=[];   /* localFx handles (the frozen check reads them); the other effects' handles */
 // ---- the scenes
 const SCENES={
  stilled:{name:'The Stilled Ground',about:'A time zone of core/anomaly (rate 1e-4 at the core, ring 140 m, rim 70 m): rain, dust, steam, a waterfall, an Ancient machine mid-explosion and birds hang where time stops; the same things run outside it (east). The birds circling the zone never cross it.',
   build(){const Z=N.add({kind:'time',shape:{type:'circle',at:[0,0],r:140},rim:70,time:1e-4});
    ring(0,0,140,0xb080ff,.55);ring(0,0,70,0xb080ff,.3);
    const rate=(x,y,z)=>N.at(x,y,z).time;
    put(new T.BoxGeometry(30,32,14),mat(0x5f5a50),-40,16,22);put(new T.BoxGeometry(30,32,14),mat(0x5f5a50),300,16,22);   /* the cliffs the falls leave */
    put(new T.BoxGeometry(8,6,10),mat(0x4a4e52),25,3,-35);put(new T.BoxGeometry(8,6,10),mat(0x4a4e52),330,3,-35);   /* the machines */
    fx.push(A.localFx([
     {kind:'drops',at:[0,0,0],r:150,h:40,n:5000},{kind:'drops',at:[300,0,0],r:70,h:40,n:1800},
     {kind:'motes',at:[0,0,0],r:120,h:8,n:700},{kind:'motes',at:[300,0,0],r:60,h:8,n:300},
     {kind:'steam',at:[30,0,30],n:70},{kind:'steam',at:[-20,0,-50],n:70},{kind:'steam',at:[330,0,30],n:70},
     {kind:'curtain',lip:[[-52,29.5,31.5],[-28,29.5,31.5]],dir:[0,1],speed:2.2,drop:31.5,n:3500},{kind:'curtain',lip:[[288,29.5,31.5],[312,29.5,31.5]],dir:[0,1],speed:2.2,drop:31.5,n:3500},
     {kind:'burst',at:[25,6,-35],r:16,period:5,phase:.12,n:360},{kind:'burst',at:[330,6,-35],r:16,period:5,phase:.12,n:360},
     {kind:'birds',at:[0,24,10],r:40,n:14},{kind:'birds',at:[0,34,0],r:200,n:12,speed:11},{kind:'birds',at:[300,26,0],r:35,n:10}],{rate,seed:11}));
    return {zones:[Z],views:[
     {name:'Overview',v:[130,45,170,0,10,0]},{name:'The core (walking)',walk:[12,58,-.6]},{name:'The held explosion',v:[46,9,-14,25,5,-35]},
     {name:'The stopped fall',v:[-25,6,78,-40,15,32]},{name:'Outside: the same, running',v:[315,6,78,300,15,32]}],
     still:{core:3,run:4}};}},
  press:{name:'The Press',about:'A gravity zone of core/anomaly (3 g at the core, ring 140 m, rim 60 m): trees stunted and spread, boulders sunk in their own craters, a tower pancaked to a third of its storeys, a fall that hits hard and short, the dust lying flat; outside (east) the same at 1 g. Walk in (F) and the walk slows and the eye drops.',
   build(){const Z=N.add({kind:'gravity',shape:{type:'circle',at:[0,0],r:140},rim:60,g:3});
    ring(0,0,140,0x8a7a66,.6);ring(0,0,80,0x8a7a66,.3);
    const gAt=(x,y,z)=>N.at(x,y,z).g,trunk=mat(0x4b3a2a),crown=mat(0x3f5a33),rock=mat(0x77736a),slab=mat(0x8a8780);
    for(let x=-120;x<=420;x+=40)for(let z=-120;z<=120;z+=40){if(Math.abs(x-300)<30&&Math.abs(z)<30||Math.abs(x)<30&&Math.abs(z)<30)continue;
     const u=KRAND.unit(KRAND.hash(3,x,z,1)),jx=x+(u-.5)*16,jz=z+(KRAND.unit(KRAND.hash(3,x,z,2))-.5)*16,S=N.squash(N.at(jx,0,jz)),h=(9+6*u)*S.sy,w=(2.6+u)*S.sxz;
     put(new T.CylinderGeometry(.25*S.sxz,.35*S.sxz,h*.45,8),trunk,jx,h*.45/2-h*S.sink*.5,jz);put(new T.ConeGeometry(w,h*.7,10),crown,jx,h*.45+h*.35-h*S.sink*.5,jz);
     if(u>.6){const r=1.2+u;put(new T.SphereGeometry(r,14,10),rock,jx+5,r*(1-2*S.sink*1.5),jz+4);}}
    const tower=(x,z)=>{const S=N.squash(N.at(x,0,z)),n=10,kept=Math.max(1,Math.round(n*S.floors)),fl=3.6;
     for(let i=0;i<n-kept;i++)put(new T.BoxGeometry(14,.5,14),slab,x,.25+i*.52,z);   /* the storeys that came down, flat on each other */
     const base=(n-kept)*.52;for(let i=0;i<kept;i++){put(new T.BoxGeometry(14,.5,14),slab,x,base+(i+1)*fl,z);for(const c of [[-6,-6],[6,-6],[-6,6],[6,6]])put(new T.BoxGeometry(.6,fl,.6),slab,x+c[0],base+i*fl+fl/2,z+c[1]);}
     return kept;};
    const keptIn=tower(0,0),keptOut=tower(300,0);
    put(new T.BoxGeometry(30,32,14),mat(0x5f5a50),-40,16,60);put(new T.BoxGeometry(30,32,14),mat(0x5f5a50),300,16,60);
    fx.push(A.localFx([
     {kind:'pall',at:[0,0,0],r:140,h:1.4,n:160},{kind:'motes',at:[0,0,0],r:140,h:8,n:900},{kind:'motes',at:[300,0,0],r:70,h:8,n:400},
     {kind:'curtain',lip:[[-52,67.5,31.5],[-28,67.5,31.5]],dir:[0,1],speed:4,drop:31.5,n:3000},{kind:'curtain',lip:[[288,67.5,31.5],[312,67.5,31.5]],dir:[0,1],speed:4,drop:31.5,n:3000}],{g:gAt,seed:12}));
    return {zones:[Z],kept:[keptIn,keptOut],views:[
     {name:'Overview',v:[200,110,300,120,5,0]},{name:'The pancaked tower',v:[40,12,48,0,6,0]},{name:'Stunted and sunk',v:[-90,9,-150,-40,4,-60]},
     {name:'The short fall',v:[-10,8,120,-40,12,70]},{name:'Outside: the long fall',v:[330,8,120,300,12,70]},{name:'The core (walking)',walk:[-20,-30,2.4]}]};}},
  yards:{name:'The Yards',about:'The industrial district\'s effects (PLAN.md 15): stacks trailing soot downwind, cooling towers billowing (one on a duty cycle), a flare, a vent from a broken main, toxic pools with foam and sheen and their low fume, oil spills on the ground with crusted rims, a slag heap glowing at its pour, sparks from dead machines, an arc off a gantry.',
   build(){const steel=mat(0x6a6660),conc=mat(0x8a857c);
    for(const s of [[-60,-80,62],[-40,-90,70],[-20,-80,55]]){put(new T.CylinderGeometry(2.2,3,s[2],16),conc,s[0],s[2]/2,s[1]);}
    const tower=(x,z)=>{const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new T.Vector2(34-14*Math.sin(t*Math.PI*.8)+6*t,t*90));}const m=new T.Mesh(new T.LatheGeometry(pts,40),new T.MeshLambertMaterial({color:0x9c978e,side:T.DoubleSide}));m.position.set(x,0,z);scene.add(m);};
    tower(90,-120);tower(170,-110);
    put(new T.CylinderGeometry(.6,.8,26,10),steel,30,13,-30);put(new T.CylinderGeometry(.5,.5,8,10),steel,-80,4,30);
    const heap=new T.Mesh(new T.ConeGeometry(26,18,48,6),new T.MeshLambertMaterial({color:0x3a302a}));heap.position.set(-110,9,-10);scene.add(heap);
    const machines=[[40,20],[60,35],[-10,60]];machines.forEach(m=>put(new T.BoxGeometry(7,5,9),steel,m[0],2.5,m[1]));
    put(new T.BoxGeometry(2,24,2),steel,110,12,40);put(new T.BoxGeometry(30,2,2),steel,96,24,40);
    const plumes=A.plumes([{at:[-60,62,-80],kind:'stack'},{at:[-40,70,-90],kind:'stack'},{at:[-20,55,-80],kind:'stack',duty:.6,period:240},
     {at:[90,90,-120],kind:'cooling'},{at:[170,90,-110],kind:'cooling',duty:.7,period:300},{at:[30,26,-30],kind:'flare',r:.7},{at:[-80,8,30],kind:'vent'}],{seed:21});
    const pools=A.sludgePools([{at:[0,.05,40],r:14},{at:[-40,.05,70],r:9},{at:[25,.05,80],r:7,toxic:.6}],{seed:21});
    const pr=pools.recs.map(R=>TG.add({class:'feature',kind:'pool',key:'sludge.pool',name:R.id,at:R.at,r:R.r,h:1,tags:{hazard:KHAZ.make(A.poolHazard(R))}}));
    const spills=A.spillOn(ground.material,[{at:[-30,20],r:22},{at:[60,60],r:16,k:.8},{at:[-70,60],r:12},{at:[120,0],r:10,kind:'wet'}],{seed:21});
    const slag=A.slagRec({at:[-110,14,2],r:12,heat:1,base:.15,cell:1.1},1,21),slagU=A.slagOn(heap.material,slag);
    const sparks=A.sparks(machines.map((m,i)=>({at:[m[0]+3.6,3.5,m[1]],dir:[1,.6,0],period:3+i,burst:.8})),{seed:21});
    const arcs=A.arcs([{a:[96,24,40],b:[100,0,48],period:4,on:.6}],{seed:21});
    arcs.recs.forEach(R=>TG.add({class:'feature',kind:'arc',key:'sparks.arc',name:R.id,at:R.b,r:3,h:4,tags:{hazard:KHAZ.make(A.arcHazard(R))}}));
    fx.push(A.localFx(pools.recs.map(R=>({kind:'fume',at:R.at,r:R.r*.8,h:2.5,n:Math.round(R.r*3)})),{seed:22}));
    fxB.push(plumes,pools,sparks,arcs);
    return {plumes:plumes.recs,pools:pools.recs,spills:spills.recs,slag,slagU,arcs:arcs.recs,views:[
     {name:'Overview',v:[260,90,260,0,30,-40]},{name:'The stacks and towers',v:[60,20,140,20,60,-100]},{name:'The pools and spills',v:[10,14,110,0,0,40]},
     {name:'The slag heap at night',v:[-70,10,40,-110,10,-5],hour:22},{name:'Sparks and the arc at night',v:[70,9,75,92,8,40],hour:22}]};}},
  terraces:{name:'The Terraces',about:'The farm belt\'s effects (PLAN.md 15): the crop rows bending and paling as gust fronts roll across them, chaff lifted on the fronts, a broken aqueduct pouring from its open span and from a breach in its wall, with drips from its cracks and a wet stain below, and a pylon line arcing where a pylon leans and a wire hangs.',
   build(){const stone=mat(0x9a8f7c),steel=mat(0x5d5a55);
    const card=new T.PlaneGeometry(.22,1.1);card.translate(0,.55,0);const cmat=new T.MeshLambertMaterial({color:0x9a944e,side:T.DoubleSide});
    const N2=24000,crops=new T.InstancedMesh(card,cmat,N2),M4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler();let n=0;
    for(let r=0;r<120&&n<N2;r++)for(let j=0;j<200&&n<N2;j++){const x=-120+j*1.2+(KRAND.unit(KRAND.hash(5,r,j,1))-.5)*.5,z=10+r*.9,h=.7+.6*KRAND.unit(KRAND.hash(5,r,j,2));
     e.set(0,KRAND.unit(KRAND.hash(5,r,j,3))*3.14,0);q.setFromEuler(e);M4.compose(new T.Vector3(x,0,z),q,new T.Vector3(1,h,1));crops.setMatrixAt(n++,M4);}
    crops.count=n;scene.add(crops);A.gustOn(cmat,{sway:.3,height:1.1,sheen:.45});
    for(let i=0;i<9;i++){const x=-110+i*28;put(new T.CylinderGeometry(.3,.4,3,8),mat(0x4b3a2a),x,1.5,135);put(new T.SphereGeometry(3,10,8),mat(0x52663a),x,5,135);}
    const deckY=18,deck=[[-200,-40,deckY],[200,-40,deckY]];
    for(let x=-196;x<=196;x+=16){if(Math.abs(x-20)<14)continue;put(new T.BoxGeometry(3,deckY,3),stone,x,deckY/2,-40);}
    put(new T.BoxGeometry(206,2.4,4),stone,-97,deckY+1.2,-40);put(new T.BoxGeometry(170,2.4,4),stone,115,deckY+1.2,-40);
    const span=A.aqueductSpill({deck,at:206,width:2.4,depth:.7,kind:'span',ground:()=>0,seed:31}),breach=A.aqueductSpill({deck,at:330,width:2.4,depth:.7,kind:'breach',side:1,breach:3,ground:()=>0,seed:32});
    const s1=A.spill(span,{seed:31}),s2=A.spill(breach,{seed:32});fx.push(s1.fx,s2.fx);fxB.push(s1,s2);
    A.spillOn(ground.material,[span.wet,breach.wet],{seed:31});
    const wires=[],pyl=[];for(let i=0;i<5;i++){const x=-160+i*80,lean=i===3?.35:0,g=new T.Group();g.position.set(x,0,-110);g.rotation.z=lean;
     const p=new T.Mesh(new T.BoxGeometry(1.2,30,1.2),steel);p.position.y=15;g.add(p);const arm=new T.Mesh(new T.BoxGeometry(10,.6,.6),steel);arm.position.y=29;g.add(arm);scene.add(g);g.updateMatrixWorld();
     pyl.push([-4.5,4.5].map(dx=>new T.Vector3(dx,29,0).applyMatrix4(g.matrixWorld)));}
    const wm=new T.LineBasicMaterial({color:0x222222});
    for(let i=0;i<4;i++)for(let s=0;s<2;s++){if(i===3&&s===1)continue;const a=pyl[i][s],b=pyl[i+1][s],pts=[];for(let k=0;k<=16;k++){const t=k/16;pts.push(new T.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-6*Math.sin(Math.PI*t),a.z+(b.z-a.z)*t));}
     scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),wm));}
    const hang=pyl[3][1],pts=[hang.clone(),new T.Vector3(hang.x+6,8,hang.z+2),new T.Vector3(hang.x+9,1.5,hang.z+3)];scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),wm));
    const arcs=A.arcs([{a:[hang.x+9,1.5,hang.z+3],b:[hang.x+12,0,hang.z+3],period:3,on:.7,jag:.6,segs:10},{a:pyl[3][0].toArray(),b:pyl[3][1].toArray(),period:7,on:.4,jag:1.2}],{seed:33});
    arcs.recs.forEach(R=>TG.add({class:'feature',kind:'arc',key:'sparks.arc',name:R.id,at:R.b,r:3,h:4,tags:{hazard:KHAZ.make(A.arcHazard(R))}}));
    fx.push(A.localFx([{kind:'chaff',at:[0,0,60],r:110,h:4,drift:9,n:1500}],{seed:34}));fxB.push(arcs);
    return {spills:[span,breach],arcs:arcs.recs,crops:n,views:[
     {name:'Overview',v:[220,70,240,0,10,0]},{name:'The crop rows in the wind',v:[-40,6,180,20,0,40]},{name:'The broken span',v:[60,10,10,20,12,-40]},
     {name:'The breach and the drips',v:[160,8,10,130,10,-40]},{name:'The pylon line arcing',v:[110,10,-60,85,8,-110]}]};}}};
 const key=SCENES[Q.get('scene')]?Q.get('scene'):'stilled',S=SCENES[key],built=S.build();
 // ---- the panel
 for(const k in SCENES){const o=document.createElement('option');o.value=k;o.textContent=SCENES[k].name;$('scene').appendChild(o);}
 $('scene').value=key;$('scene').onchange=e=>{location.hash='scene='+e.target.value;location.reload();};$('about').textContent=S.about;
 const sky0=sky.clone(),night=new T.Color(0x0c1018);
 const setHour=h=>{hour=h;const n=A.night?A.night(h):0;sun.intensity=1.1*(1-.92*n);hemi.intensity=.65*(1-.8*n);sky.copy(sky0).lerp(night,n);scene.fog.color.copy(sky);};
 const setView=i=>{const v=built.views[i];if(!v)return;setHour(v.hour==null?15:v.hour);if(v.walk){C.setView(v.walk[0]+5,10,v.walk[1]+5,v.walk[0],0,v.walk[1]);C.walk(true,true);
   C.ctl.target.set(v.walk[0],1.7,v.walk[1]);C.walkAt=null;C.ctl.theta=v.walk[2];C.ctl.phi=Math.PI/2-.05;}
  else C.setView(...v.v);};
 built.views.forEach((v,i)=>{const b=document.createElement('button');b.textContent=v.name;b.onclick=()=>setView(i);$('views').appendChild(b);});
 setView(Q.get('view')==null?0:+Q.get('view'));
 // ---- the loop
 let last=performance.now(),frames=0;
 const info=()=>{const s=Wk.state,p=C.ctl.target,at=N.at(p.x,0,p.z),hz=KHAZ.at(p.x,p.z,A.clock.t,p.y,TG).map(h=>h.kind);
  $('info').textContent='at '+p.x.toFixed(0)+', '+p.z.toFixed(0)+(C.ctl.walk?' (walking)':'')+'\ngravity '+at.g.toFixed(2)+' g, time x'+at.time.toPrecision(2)+
   '\nwalk speed x'+s.walk.speed.toFixed(2)+', eye x'+s.walk.eye.toFixed(2)+'\nhazards: '+(hz.join(', ')||'none')+(s.owed?'\nthe world moved on '+(s.owed/3600).toFixed(2)+' h':'');};
 function frame(now){const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;   /* rAF's stamp can precede the start */
  for(const f of hooks)f(dt);C.move(dt);C.apply();renderer.render(scene,camera);if(++frames%10===0)info();
  if(frames===3)window._ready=true;requestAnimationFrame(frame);}
 window._api={sceneKey:key,scene,camera,scenes:Object.keys(SCENES),built,C,Wk,fx,fxB,tags:TG,setHour,records:()=>A.fx.map(r=>r.type),anom:N,hooks,setView,views:built.views.map(v=>v.name),
  // the GPU checks: walk to (x, z), let the hooks step, read the walker's state
  walkAt(x,z){C.walk(true,true);C.ctl.target.set(x,1.7,z);C.walkAt=null;for(let i=0;i<3;i++){for(const f of hooks)f(1/60);C.apply();}
   return {inside:Wk.state.inside,speed:Wk.state.walk.speed,ctlSpeed:C.ctl.speed,eye:C.ctl.eye,g:Wk.state.at.g,time:Wk.state.at.time};},
  // the frozen particles (rate under 1e-3) on the CPU twin: the most any of them moves in 10 s
  /* the core's particles (rate 1e-4); a loop's wrap (a hanging drop at rate 1e-4 restarts at the top once in ~12 h) is a jump, counted apart from the motion */
  frozenMove(){let m=0,n=0,jumps=0;for(const H of fx){const D=H.data;for(let i=0;i<D.n;i++){if(D.pp[4*i+3]>1.0001e-4)continue;n++;const p=A.localFxAt(D,i,0),q=A.localFxAt(D,i,10),d=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(d>2)jumps++;else m=Math.max(m,d);}}return {n,m,jumps};},
  order:()=>({zonesRegistered:TG.query({kind:'anomaly'}).length,zones:N.list().length,fxRecords:A.fx.filter(r=>r.type==='localfx').length})};
 requestAnimationFrame(frame);
})();
