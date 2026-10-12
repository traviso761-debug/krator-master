// ---------- the termite mound: entry point for termites.html ----------
// A Macrotermes mound on the Namibian savanna at the scale of the termites that built it: a worker (about 6 mm) is
// as long as a person is tall, so three metres of mound is 900 m of red clay spire, the grass round it stands like
// towers and the nearest acacia is two kilometres high. Inside, the nest of fungus gardens and the royal cell, the
// chimney and the conduits the mound breathes through, the foraging tunnels out under the savanna and the cellar
// below. Everything is built when the page opens, from data/cities/termites.json and a seed:
//
//   mound.js   the skin, the hollows inside it (chambers, galleries, the chimney, connectives and conduits, the
//              foraging tunnels, the cellar), the fungus combs, the savanna, and the cutaway's face
//   life.js    the workers and soldiers, the gardeners and nurses, the queen and the king, the air, the events
//
// X cuts the near half of the mound and the ground away, down to the cellar, and shows the cut face like a
// textbook section: the clay, the soil in its layers, and every hollow the cut passes through.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {createRenderer,trackResize,installContextLoss,mkBtn as mkBtn0,runHooks,runLoop,finishLoading,boot} from '../core/shell.js';
import {readHash,writeHash as mergeHash} from '../core/hash.js';
import {BIND,FAST,ORBIT_RATE,trackKeys,trackPointers} from '../core/input.js';
import {mkRng} from '../core/rng.js';
import {sceneRows} from '../core/layout.js';
import {buildMound} from './mound.js';
import {buildLife} from './life.js';

installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'A worker termite is about six millimetres long. Here, it is as long as you are tall.',
    'Three metres of mound is nine hundred metres of clay. The grass is taller than most buildings.',
    'The termites do not eat the grass. They feed it to a fungus, and eat the fungus.',
    'The mound is not a house. It is a lung: it breathes once a day, in by night and out by day.',
    'The queen can lay twenty thousand eggs a day. She cannot leave her cell; she is far too big for the door.',
    'X cuts the mound in half, down to the cellar where the colony mines water.',
  ],
  prefix:'digging… ',labels:{config:'reading the survey',textures:'mixing the clay',mound:'raising the mound',colony:'hatching the colony',ui:'opening the galleries'}});

const ctx=window._iz={};
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const len=m=>{const a=Math.abs(m);return a<10?m.toFixed(1)+' m':a<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km';};

// the surfaces, painted when the page opens
function canvasTex(THREE,S,paint,aniso){const c=document.createElement('canvas');c.width=c.height=S;paint(c.getContext('2d'),S);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=aniso;return t;}
function makeTextures(THREE,R,aniso){
  // the clay of the skin: soil pellets the workers laid one at a time, cemented with saliva
  const clay=canvasTex(THREE,256,(g,S)=>{g.fillStyle='#b8693f';g.fillRect(0,0,S,S);
    for(let i=0;i<2600;i++){const x=R()*S,y=R()*S,r=1.5+R()*4,k=R();g.fillStyle=k<0.5?`rgba(90,40,20,${0.12+R()*0.18})`:`rgba(240,180,130,${0.08+R()*0.14})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    for(let i=0;i<70;i++){g.strokeStyle='rgba(60,25,12,0.25)';g.lineWidth=1;g.beginPath();let x=R()*S,y=R()*S;g.moveTo(x,y);for(let k=0;k<4;k++){x+=R()*30-15;y+=R()*22;g.lineTo(x,y);}g.stroke();}},aniso);
  const sand=canvasTex(THREE,256,(g,S)=>{g.fillStyle='#c27a4c';g.fillRect(0,0,S,S);
    for(let i=0;i<5000;i++){const k=R();g.fillStyle=k<0.4?'rgba(120,60,30,0.25)':k<0.8?'rgba(235,170,120,0.22)':'rgba(60,40,30,0.3)';g.fillRect(R()*S,R()*S,1+R()*2,1+R()*2);}},aniso);
  const dot=canvasTex(THREE,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);},aniso);
  clay.repeat.set(1,1);sand.repeat.set(C_SAND_REPEAT,C_SAND_REPEAT);
  return {clay,sand,dot};}
const C_SAND_REPEAT=900;

async function build(){
  if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
  const THREE=window.THREE,V3=THREE.Vector3;
  await stage('config');
  const C=await getJSON('data/cities/termites.json');
  const Q=new URLSearchParams(location.search),HASH=readHash();
  if(+Q.get('seed'))C.seed=+Q.get('seed');

  // ---- the renderer, the sky, the sun ----
  const renderer=createRenderer(THREE,{pixelCap:1.6,clear:new THREE.Color(C.sky.day[1])});
  renderer.localClippingEnabled=true;installContextLoss(renderer);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(new THREE.Color(C.sky.day[1]).getHex(),C.fog.density);
  const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,0.3,30000);scene.add(camera);
  const hemi=new THREE.HemisphereLight(0xe8eef8,0x6a3a22,0.6);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff0d8,1.0);scene.add(sun,sun.target);
  const lantern=new THREE.PointLight(0xffd8a8,1.3,110,1.2);camera.add(lantern);   // inside the mound it is dark: you carry a light
  const skyC=document.createElement('canvas');skyC.width=4;skyC.height=256;const skyG=skyC.getContext('2d'),skyT=new THREE.CanvasTexture(skyC);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(20000,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,depthWrite:false}));sky.userData.noClip=true;sky.userData.noFingerprint=true;sky.renderOrder=-1;scene.add(sky);
  // the stars: a fixed field on the sky sphere, faded in as the light goes
  let stars=null;{const N=1800,p=new Float32Array(N*3),r=mkRng(911);for(let i=0;i<N;i++){const u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u);p[i*3]=Math.cos(a)*s*18000;p[i*3+1]=Math.abs(u)*18000;p[i*3+2]=Math.sin(a)*s*18000;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xf0f2ff,size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));
    stars.userData.noClip=true;stars.userData.noFingerprint=true;sky.add(stars);}
  const animHooks=[];

  await stage('textures');
  const R=mkRng(C.seed*7+1),R2=mkRng(C.seed*13+5);
  const aniso=renderer.capabilities.getMaxAnisotropy(),T=makeTextures(THREE,R,aniso);
  const L=(o)=>new THREE.MeshLambertMaterial(o);
  const mats={clay:L({map:T.clay,color:0xe8c8b0}),hollow:L({vertexColors:true,side:THREE.BackSide}),mouth:L({color:0x24150c,side:THREE.DoubleSide}),comb:L({vertexColors:true}),
    nodule:L({color:0xf6f2e6}),sand:L({map:T.sand}),grass:L({vertexColors:true,side:THREE.DoubleSide}),pebble:L({color:0x9c7a62,flatShading:true}),bark:L({color:0x4a3a2c}),canopy:L({color:0x5a6a34,flatShading:true}),
    egg:L({color:0xf4efe2}),load:L({color:0xb9a650}),trail:L({color:0x9c5c38}),water:new THREE.MeshPhongMaterial({color:0x3a4850,shininess:90,specular:0x8899aa}),clayOld:L({map:T.clay,color:0xc8ad98}),queen:L({color:0xe4d6bc}),tergite:L({color:0xb59a7c}),queenLeg:L({color:0x8a5a30})};
  const fabric=new THREE.Group();fabric.name='fabric';scene.add(fabric);
  const dyn=new THREE.Group();dyn.name='moving';scene.add(dyn);
  const S={fly:false,flySpeed:20,cut:false,hour:C.hour};
  const isDay=()=>S.hour>6.5&&S.hour<18.5;
  S.storm=0;S.wet=0;
  const K={THREE,C,R,R2,scene,fabric,dyn,mats,T,aniso,isDay};

  await stage('mound');
  let M=null;section('mound',()=>{M=buildMound(K);});
  await stage('colony');
  let LIFE={hooks:[],events:[]};section('colony',()=>{LIFE=buildLife(K,M);});
  // the fingerprint the tests check: the fabric, before anything moves
  ctx.lotList=sceneRows(THREE,fabric);
  let verts=0;fabric.traverse(o=>{if(o.geometry&&o.geometry.attributes.position)verts+=o.geometry.attributes.position.count;});
  ctx.details={seed:C.seed,scale:C.scale,vertices:verts,chambers:M?M.chambers.length:0,tunnels:M?M.paths.length:0,events:LIFE.events.length,workers:C.life.workers};

  // ---- the cut: four planes; a fragment goes only if it is inside all four (the trench beside the mound) ----
  const CUT=C.cut,PLANES=[new THREE.Plane(new V3(-1,0,0),0),new THREE.Plane(new V3(1,0,0),1e7),new THREE.Plane(new V3(0,0,1),-CUT.half),new THREE.Plane(new V3(0,0,-1),-CUT.half)];
  scene.traverse(o=>{if(!o.material||o.userData.noClip)return;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.clippingPlanes=PLANES;m.clipIntersection=true;}});
  function setCut(on){S.cut=on;PLANES[1].constant=on?-CUT.length:1e7;if(M)M.cutGroup.visible=on;syncUI&&syncUI();}

  // ---- the hour: the sky, the sun, the fog ----
  const col=c=>new THREE.Color(c),FOGC=new THREE.Color(),tc=new THREE.Color(),tz=new THREE.Color();
  function setHour(h){S.hour=((h%24)+24)%24;const e=Math.sin((S.hour-6)/12*Math.PI),day=clamp(e*2.2+0.25,0,1),dusk=clamp(1-Math.abs(e)*3.5,0,1);
    tz.copy(col(C.sky.night[0])).lerp(col(C.sky.day[0]),day).lerp(col(C.sky.dusk[0]),dusk*0.6);tc.copy(col(C.sky.night[1])).lerp(col(C.sky.day[1]),day).lerp(col(C.sky.dusk[1]),dusk*0.8);
    if(S.storm>0){const g=day*0.55+0.08;tz.lerp(new THREE.Color(g*0.8,g*0.84,g*0.9),S.storm);tc.lerp(new THREE.Color(g,g*1.02,g*1.05),S.storm*0.9);}
    if(stars)stars.material.opacity=clamp(1-day*1.6,0,1)*(1-S.storm);
    const gr=skyG.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#'+tz.getHexString());gr.addColorStop(0.55,'#'+tc.getHexString());gr.addColorStop(1,'#'+tc.getHexString());skyG.fillStyle=gr;skyG.fillRect(0,0,4,256);skyT.needsUpdate=true;
    FOGC.copy(tc);scene.fog.color.copy(FOGC);renderer.setClearColor(FOGC);
    // the sun crosses to the north here: Namibia is in the southern hemisphere
    const az=(S.hour-6)/12*Math.PI;sun.position.set(Math.cos(az)*1000,Math.max(-200,e*1000),-Math.sin(az)*400);sun.target.position.set(0,0,0);
    sunI=(0.08+0.95*Math.max(0,e))*(1-0.75*S.storm);sun.color.copy(col('#fff0d8')).lerp(col('#ffb070'),dusk);hemiI=0.22+0.45*Math.max(0,e);sun.intensity=sunI;hemi.intensity=hemiI;}
  let sunI=1,hemiI=0.6;
  function setStorm(k){S.storm=clamp(k,0,1);setHour(S.hour);}
  const DRY={clay:mats.clay.color.clone(),clayOld:mats.clayOld.color.clone(),sand:mats.sand.color.clone()},WET=new THREE.Color(0x7a5848);
  function setWet(k){S.wet=clamp(k,0,1);for(const n in DRY)mats[n].color.copy(DRY[n]).lerp(WET,S.wet*0.55);}

  // ---- the camera: a point you look at, how far away, and from which way ----
  const ctl={t:new V3(),d:600,yaw:0.6,pitch:0.2,dmin:1.2,dmax:12000};
  const offs=(s,out)=>{const cp=Math.cos(s.pitch);return out.set(s.d*cp*Math.sin(s.yaw),s.d*Math.sin(s.pitch),s.d*cp*Math.cos(s.yaw));};
  const ov3=new V3();
  function place(c,s){c.position.copy(s.t).add(offs(s,ov3));c.lookAt(s.t);}
  // a view anchored to something built (the chimney) takes its point from the geometry
  const VIEWS=C.views.map(v=>{if(v.anchor==='chimney'&&M){const P=M.chimney,p=P.pts.reduce((b,q)=>Math.abs(q.y-v.t[1])<Math.abs(b.y-v.t[1])?q:b);return {...v,t:[p.x,p.y,p.z]};}
    if(v.anchor==='forage'&&LIFE.anchors&&LIFE.anchors.forage){const h=LIFE.anchors.forage;return {...v,t:[h.x,v.t[1],h.z],yaw:Math.atan2(h.x,h.z)+v.yaw};}return v;});
  let anim=null;
  const running=[];
  function release(){for(let i=running.length-1;i>=0;i--)if(running[i].camera){running[i].stop&&running[i].stop();running.splice(i,1);}}
  const snap=s=>({t:s.t.clone(),d:s.d,yaw:s.yaw,pitch:s.pitch});
  function setState(s,v){s.t.set(v.t[0],v.t[1],v.t[2]);s.d=v.d;s.yaw=v.yaw;s.pitch=v.pitch;}
  function go(v,Tt){anim=null;release();const from=snap(ctl),dl=Math.abs(Math.log(v.d/ctl.d)),dt=ctl.t.distanceTo(new V3(...v.t));
    if(Tt===undefined)Tt=clamp(1.1+0.3*dl+0.35*Math.log(1+dt/Math.max(v.d,ctl.d)),1.1,5);anim={from,to:v,t0:performance.now(),T:Tt*1000};setCut(!!v.cut);}
  function step(now){const a=anim,s=ctl,u=clamp((now-a.t0)/a.T,0,1),e=u*u*(3-2*u);
    s.d=Math.exp(Math.log(a.from.d)+(Math.log(a.to.d)-Math.log(a.from.d))*e);
    s.t.set(a.from.t.x+(a.to.t[0]-a.from.t.x)*e,a.from.t.y+(a.to.t[1]-a.from.t.y)*e,a.from.t.z+(a.to.t[2]-a.from.t.z)*e);
    let dy=a.to.yaw-a.from.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));s.yaw=a.from.yaw+dy*e;s.pitch=a.from.pitch+(a.to.pitch-a.from.pitch)*e;if(u>=1)anim=null;}

  // ---- the input: drag to orbit, right or Shift-drag to pan, the wheel to zoom; F flies; X the cutaway ----
  const el=renderer.domElement,rv=new V3(),uv=new V3();
  function pan(dx,dy){const s=ctl,k=2*s.d*Math.tan(camera.fov*Math.PI/360)/innerHeight;rv.setFromMatrixColumn(camera.matrix,0);uv.setFromMatrixColumn(camera.matrix,1);s.t.addScaledVector(rv,-dx*k).addScaledVector(uv,dy*k);}
  trackPointers(el,{down:()=>{anim=null;release();},
    drag:(dx,dy,{pan:p})=>{const s=ctl;if(p)pan(dx,dy);
      else if(S.fly){const P0=s.t.clone().add(offs(s,ov3));s.yaw-=dx*0.004;s.pitch=clamp(s.pitch+dy*0.004,-1.52,1.52);s.t.copy(P0).sub(offs(s,ov3));}
      else{s.yaw-=dx*ORBIT_RATE;s.pitch=clamp(s.pitch+dy*ORBIT_RATE,-1.52,1.52);}},
    pinch:(ratio,dx,dy)=>{ctl.d=clamp(ctl.d*ratio,ctl.dmin,ctl.dmax);pan(dx,dy);},
    wheel:(dy)=>{anim=null;release();if(S.fly){S.flySpeed=clamp(S.flySpeed*Math.exp(-dy*0.0015),0.5,2000);return;}ctl.d=clamp(ctl.d*Math.exp(dy*0.0014),ctl.dmin,ctl.dmax);}});
  const keys=trackKeys({onKey:(k,e,held)=>{if(held){anim=null;release();return;}
    if(k===BIND.cut){setCut(!S.cut);return;}
    if(k===BIND.close){views.classList.remove('open');vb.setAttribute('aria-expanded','false');evp.classList.remove('open');}}});

  // ---- the panels ----
  await stage('ui');
  const ui=document.getElementById('ui'),views=document.getElementById('views'),cardEl=document.getElementById('card'),evp=document.getElementById('events');
  const mkBtn=(label,parent,fn)=>mkBtn0(label,parent,()=>fn(),{stop:true});
  const vb=mkBtn('Views',ui,()=>{const o=!views.classList.contains('open');views.classList.toggle('open',o);vb.setAttribute('aria-expanded',String(o));evp.classList.remove('open');
    const m=document.getElementById('menagerie');if(o&&m)m.classList.remove('open');});
  vb.setAttribute('aria-expanded','false');
  let cardTimer=0;
  function showCard(k){const c=k&&C.cards[k];if(!c){cardEl.classList.remove('on');return;}
    cardEl.innerHTML='';const h=document.createElement('h2');h.textContent=c.h;const p=document.createElement('p');p.textContent=c.p;
    const s=document.createElement('p');s.className='sub';s.textContent=c.sub||'';cardEl.append(h,p,s);cardEl.classList.add('on');
    clearTimeout(cardTimer);cardTimer=setTimeout(()=>cardEl.classList.remove('on'),16000);}
  cardEl.addEventListener('click',()=>cardEl.classList.remove('on'));
  const groups=[];for(const v of VIEWS){let g=groups.find(x=>x[0]===v.group);if(!g)groups.push(g=[v.group,[]]);g[1].push(v);}
  for(const [name,list] of groups){const h=document.createElement('div');h.className='sub';h.textContent=name;views.appendChild(h);
    for(const v of list)mkBtn(v.name,views,()=>{go(v);showCard(v.card);views.classList.remove('open');vb.setAttribute('aria-expanded','false');});}
  mkBtn('Events',ui,()=>{const o=!evp.classList.contains('open');evp.classList.toggle('open',o);views.classList.remove('open');});
  function fire(key){const E=LIFE.events.find(e=>e.key===key);if(!E)return;evp.classList.remove('open');release();
    const r=E.start({go,showCard,setCut,setHour,getHour:()=>S.hour,setStorm,setWet,camera,ctl});if(r&&r.update)running.push(r);if(E.card)showCard(E.card);
    if(E.view)go(E.view);}
  for(const E of LIFE.events)mkBtn(E.label,evp,()=>fire(E.key));
  const cutB=mkBtn('Cutaway',ui,()=>setCut(!S.cut));cutB.title='Cut the mound in half (X): the nest, the chimney and the tunnels in section';
  const dayB=mkBtn('Night',ui,()=>{setHour(isDay()?22:10);syncUI();});dayB.title='Day or night: the air in the mound turns round';
  const flyB=document.createElement('button');   // fly mode is not offered in the fictional scenes: no button, no key
  function syncUI(){flyB.setAttribute('aria-pressed',String(S.fly));cutB.setAttribute('aria-pressed',String(S.cut));dayB.textContent=isDay()?'Night':'Day';}
  const wire=createWire({THREE,scene,animHooks});
  installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
  installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));
  const hud=document.createElement('div');hud.id='timebar';document.getElementById('side').appendChild(hud);

  // ---- the address ----
  function writeHash(){const s=ctl;mergeHash({at:[s.t.x.toFixed(1),s.t.y.toFixed(1),s.t.z.toFixed(1),s.d.toPrecision(4),s.yaw.toFixed(3),s.pitch.toFixed(3)].join(','),
      cut:S.cut?true:null,t:S.hour.toFixed(2),view:null,event:null},['at']);}
  {setHour(+HASH.get('t')||C.hour);const at=(HASH.get('at')||'').split(',').map(Number);setState(ctl,VIEWS[0]);setCut(!!VIEWS[0].cut);
   if(at.length===6&&at.every(Number.isFinite)){setState(ctl,{t:at.slice(0,3),d:at[3],yaw:at[4],pitch:at[5]});setCut(HASH.has('cut'));}
   const vn=HASH.get('view');if(vn!=null){const v=VIEWS.find(x=>x.name===vn)||VIEWS[+vn];if(v){setState(ctl,v);setCut(!!v.cut);showCard(v.card);}}
   // (#fly no longer turns fly mode on)
   if(HASH.has('event'))setTimeout(()=>fire(HASH.get('event')),900);}
  syncUI();
  trackResize(renderer,camera);
  finishLoading({hintMs:16000,canvas:el});

  let hashAt=0,fpsN=0,fpsT=0,dayK=1;
  runLoop((now,dt)=>{
    fpsN++;fpsT+=dt;if(fpsT>1){ctx.fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0;}
    if(anim)step(now);
    else if(keys.size&&S.fly){const s=ctl,sp=S.flySpeed*(keys.has(BIND.fast)?FAST:1)*dt,f3=offs(s,ov3).normalize().negate(),rx=-f3.z,rz=f3.x,rl=Math.hypot(rx,rz)||1;
      if(keys.has('w'))s.t.addScaledVector(f3,sp);if(keys.has('s'))s.t.addScaledVector(f3,-sp);
      if(keys.has('d')){s.t.x+=rx/rl*sp;s.t.z+=rz/rl*sp;}if(keys.has('a')){s.t.x-=rx/rl*sp;s.t.z-=rz/rl*sp;}if(keys.has('e'))s.t.y+=sp;if(keys.has('q'))s.t.y-=sp;}
    else if(keys.size){const s=ctl,sp=s.d*0.7*(keys.has(BIND.fast)?FAST:1)*dt,fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw);
      if(keys.has('w')){s.t.x+=fx*sp;s.t.z+=fz*sp;}if(keys.has('s')){s.t.x-=fx*sp;s.t.z-=fz*sp;}
      if(keys.has('a')){s.t.x+=fz*sp;s.t.z-=fx*sp;}if(keys.has('d')){s.t.x-=fz*sp;s.t.z+=fx*sp;}if(keys.has('e'))s.t.y+=sp;if(keys.has('q'))s.t.y-=sp;}
    place(camera,ctl);camera.updateMatrixWorld();sky.position.copy(camera.position);
    // inside the earth the sun does not reach: when the camera is underground or inside the mound (and nothing is
    // cut away), the daylight fades and only the light you carry is left
    {const p=camera.position,inside=!S.cut&&M&&(p.y<-1||(p.y<C.mound.height&&Math.hypot(p.x-M.axis(p.y)[0],p.z-M.axis(p.y)[1])<M.radius(p.y,Math.atan2(p.z-M.axis(p.y)[1],p.x-M.axis(p.y)[0]))-2));
     const k=1-Math.exp(-dt*4);dayK+=((inside?0.06:1)-dayK)*k;sun.intensity=sunI*dayK;hemi.intensity=hemiI*dayK;}
    const t=now/1000;for(const h of LIFE.hooks)h(t,dt);
    for(let i=running.length-1;i>=0;i--)if(running[i].update(t,dt,camera)===false){running.splice(i,1);syncUI();}
    runHooks(animHooks,now);
    renderer.render(scene,camera);
    const p=camera.position;let where=null;for(const pl of C.places)if(p.distanceTo(new V3(...pl.at))<pl.r){where=pl.name;break;}
    const hh=Math.floor(S.hour),mm=Math.floor((S.hour-hh)*60);
    hud.textContent=(S.fly?'FLYING '+len(S.flySpeed*(keys.has(BIND.fast)?FAST:1))+'/s · ':'')+(where||(p.y<0?'underground':'on the savanna')).toUpperCase()+' · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+(S.cut?' · CUTAWAY':'');
    if(now-hashAt>1500){hashAt=now;writeHash();}
  });
  ctx.ctl=ctl;ctx.fire=fire;ctx.setCut=setCut;ctx.setHour=setHour;
}

boot(build);
