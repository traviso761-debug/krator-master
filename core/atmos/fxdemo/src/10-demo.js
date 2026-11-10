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
 const sun=new T.DirectionalLight(0xfff1dc,1.1);sun.position.set(300,500,200);scene.add(sun);scene.add(new T.HemisphereLight(0xbfd0e0,0x4a4236,.65));
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
 const fx=[];
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
     {name:'The short fall',v:[-10,8,120,-40,12,70]},{name:'Outside: the long fall',v:[330,8,120,300,12,70]},{name:'The core (walking)',walk:[-20,-30,2.4]}]};}}};
 const key=SCENES[Q.get('scene')]?Q.get('scene'):'stilled',S=SCENES[key],built=S.build();
 // ---- the panel
 for(const k in SCENES){const o=document.createElement('option');o.value=k;o.textContent=SCENES[k].name;$('scene').appendChild(o);}
 $('scene').value=key;$('scene').onchange=e=>{location.hash='scene='+e.target.value;location.reload();};$('about').textContent=S.about;
 const setView=i=>{const v=built.views[i];if(!v)return;if(v.walk){C.setView(v.walk[0]+5,10,v.walk[1]+5,v.walk[0],0,v.walk[1]);C.walk(true,true);
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
 window._api={sceneKey:key,scene,camera,scenes:Object.keys(SCENES),built,C,Wk,fx,tags:TG,anom:N,hooks,setView,views:built.views.map(v=>v.name),
  // the GPU checks: walk to (x, z), let the hooks step, read the walker's state
  walkAt(x,z){C.walk(true,true);C.ctl.target.set(x,1.7,z);C.walkAt=null;for(let i=0;i<3;i++){for(const f of hooks)f(1/60);C.apply();}
   return {inside:Wk.state.inside,speed:Wk.state.walk.speed,ctlSpeed:C.ctl.speed,eye:C.ctl.eye,g:Wk.state.at.g,time:Wk.state.at.time};},
  // the frozen particles (rate under 1e-3) on the CPU twin: the most any of them moves in 10 s
  /* the core's particles (rate 1e-4); a loop's wrap (a hanging drop at rate 1e-4 restarts at the top once in ~12 h) is a jump, counted apart from the motion */
  frozenMove(){let m=0,n=0,jumps=0;for(const H of fx){const D=H.data;for(let i=0;i<D.n;i++){if(D.pp[4*i+3]>1.0001e-4)continue;n++;const p=A.localFxAt(D,i,0),q=A.localFxAt(D,i,10),d=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(d>2)jumps++;else m=Math.max(m,d);}}return {n,m,jumps};},
  order:()=>({zonesRegistered:TG.query({kind:'anomaly'}).length,zones:N.list().length,fxRecords:A.fx.filter(r=>r.type==='localfx').length})};
 requestAnimationFrame(frame);
})();
