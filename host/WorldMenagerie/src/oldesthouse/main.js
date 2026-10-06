// ---------- the Oldest House: entry point for oldesthouse.html ----------
// Fan work after Remedy Entertainment's Control (2019) and its expansions; nothing of theirs is used. Every
// surface is painted on a canvas when the page opens (mats.js) and every shape is built here from the kit (kit.js)
// by the sector modules, laid out from data/cities/oldesthouse.json.
//
// The Federal Bureau of Control's headquarters: a windowless brutalist tower in Manhattan that nobody notices,
// and inside it far more building than the outside could hold - a Place of Power. So the page is the inside,
// sector by sector, each an enclosed world of concrete in the dark, joined by long transit corridors:
//
//   Executive (executive.js)       the lobby, the Central Executive and its hanging black pyramid, the Director's
//                                  office, the Hotline, the Board Room, Dead Letters, the mail room, the
//                                  communications floor, the cafeteria; the corridors out; the tower on its street
//   Research (research.js)         the Central Research atrium with its redwoods, the labs, the Hedron Chamber;
//                                  the Ashtray Maze
//   Maintenance (maintenance.js)   the NSC power plant, the Black Rock Quarry, the Furnace, the pipeworks
//   Containment (containment.js)   the Panopticon, the Turntable, the cells, the archives
//   Further (further.js)           the Foundation's caves and the Nail; the Investigations Sector and the
//                                  Oceanview Motel; the Astral Plane
//
// Every sector module is a function of K (below): it builds static fabric into the shared Builder, registers its
// light fittings for the bake, adds moving things to K.dyn, and registers its places, views, cards, fog zones and
// events. The cutaway (X) lifts every ceiling, so from above the sectors read like the Bureau's own blueprints.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {createRenderer,trackResize,installContextLoss,mkBtn as mkBtn0,runHooks,runLoop,finishLoading,boot} from '../core/shell.js';
import {readHash,writeHash as mergeHash} from '../core/hash.js';
import {BIND,FAST,ORBIT_RATE,trackKeys,trackPointers} from '../core/input.js';
import {mkRng} from '../core/rng.js';
import {sceneRows} from '../core/layout.js';
import {makeTextures} from './mats.js';
import {Builder,createLights,bake,toMeshes,furnish} from './kit.js';
import {buildExecutive} from './executive.js';
import {buildResearch} from './research.js';
import {buildMaintenance} from './maintenance.js';
import {buildContainment} from './containment.js';
import {buildFurther} from './further.js';

installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Fan work. Control is Remedy Entertainment\'s; nothing of theirs is used here.',
    'The Oldest House: headquarters of the Federal Bureau of Control. Nobody looks at it twice.',
    'A Place of Power. There is more of it inside than there is outside.',
    'Brutalist concrete, red carpet, walnut, and fluorescent light. The building does not like to stay still.',
    'X lifts the ceilings. The sectors are laid out the way the Bureau\'s blueprints draw them.',
    'Welcome to the Oldest House. Please keep to the approved corridors.',
  ],
  prefix:'the elevator is coming… ',labels:{config:'reading the blueprints',textures:'pouring the concrete',sectors:'building the sectors',light:'switching on the lights',ui:'opening the doors'}});

const ctx=window._iz={};
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const len=m=>{const a=Math.abs(m);return a<10?m.toFixed(1)+' m':a<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km';};

async function build(){
  if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
  const THREE=window.THREE,V3=THREE.Vector3;
  await stage('config');
  const C=await getJSON('data/cities/oldesthouse.json');
  const Q=new URLSearchParams(location.search),HASH=readHash();
  if(+Q.get('seed'))C.seed=+Q.get('seed');

  // ---- the renderer and the air ----
  const FOG=new THREE.Color(C.fog.color);
  const renderer=createRenderer(THREE,{pixelCap:1.6,clear:FOG});
  installContextLoss(renderer);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(FOG.getHex(),C.fog.density);
  // the light is baked into the surfaces (kit.js); a little ambient for the moving things, which are not baked
  scene.add(new THREE.HemisphereLight(0xd8d4cc,0x302a26,0.55));
  const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,6000);
  const animHooks=[];

  await stage('textures');
  const T=makeTextures(THREE,mkRng(C.seed*7+1),renderer.capabilities.getMaxAnisotropy());
  const B=new Builder(5),lights=createLights(),F=furnish(B,lights);
  const fabric=new THREE.Group();fabric.name='fabric';scene.add(fabric);
  const dyn=new THREE.Group();dyn.name='moving';scene.add(dyn);

  // ---- the sectors ----
  await stage('sectors');
  const K={THREE,C,B,F,lights,T,dyn,scene,camera,hooks:[],places:[],views:[],cards:Object.assign({},C.cards),zones:[],events:[],anchors:{},
    rnd:null,O:null,sector:null};
  const SECTORS=[['executive',buildExecutive],['research',buildResearch],['maintenance',buildMaintenance],['containment',buildContainment],['further',buildFurther]];
  const built={},sverts={};
  const vcount=()=>{let n=0;for(const m in B.g)n+=B.g[m].p.length/3;return n;};
  for(const [name,fn] of SECTORS){K.sector=name;K.O=C.sectors[name]?C.sectors[name].at:[0,0,0];K.rnd=mkRng(C.seed*131+name.length*977+name.charCodeAt(0));
    const v0=vcount(),e0=K.events.length;section(name,()=>{fn(K);built[name]=true;});sverts[name]=Math.round(vcount()-v0);
    /* an event key one sector already took would be shadowed silently: say so */
    for(const E of K.events.slice(e0))if(K.events.findIndex(x=>x.key===E.key)<K.events.indexOf(E))report(name,new Error('event key "'+E.key+'" is already taken'));}

  await stage('light');
  section('bake',()=>bake(B,lights,C.ambient||[0.16,0.16,0.17]));
  const meshes=toMeshes(THREE,B,T,fabric);
  const ceilings=meshes.filter(m=>m.userData.ceiling);
  // the fingerprint the tests check: the fabric, before anything moves
  ctx.lotList=sceneRows(THREE,fabric);
  let verts=0;for(const m of meshes)verts+=m.geometry.attributes.position.count;
  ctx.details=Object.assign({seed:C.seed,meshes:meshes.length,ceilings:ceilings.length,lights:lights.list.length,vertices:verts,views:K.views.length,events:K.events.length},
    Object.fromEntries(SECTORS.map(([n])=>[n,!!built[n]])),Object.fromEntries(SECTORS.map(([n])=>['verts_'+n,sverts[n]])));

  // ---- the camera: a point you look at, how far away, and from which way ----
  const S={fly:false,flySpeed:10,cut:false};
  const ctl={t:new V3(),d:40,yaw:0,pitch:0.2,dmin:0.4,dmax:4000};
  const offs=(s,out)=>{const cp=Math.cos(s.pitch);return out.set(s.d*cp*Math.sin(s.yaw),s.d*Math.sin(s.pitch),s.d*cp*Math.cos(s.yaw));};
  const ov3=new V3();
  function place(c,s){c.position.copy(s.t).add(offs(s,ov3));c.lookAt(s.t);}
  // the views: the overview first, then each sector's, grouped by sector
  const VIEWS=[{name:'The blueprints',group:'The Oldest House',t:[0,-60,40],d:820,yaw:0.55,pitch:0.95,card:'house',cut:true}   /* below the Astral Plane, which hangs at 800 m and up */,...K.views];
  let anim=null;
  const snap=s=>({t:s.t.clone(),d:s.d,yaw:s.yaw,pitch:s.pitch});
  function setState(s,v){s.t.set(v.t[0],v.t[1],v.t[2]);s.d=v.d;s.yaw=v.yaw;s.pitch=v.pitch;}
  function go(v,Tt){anim=null;const from=snap(ctl),dl=Math.abs(Math.log(v.d/ctl.d)),dt=ctl.t.distanceTo(new V3(...v.t));
    if(Tt===undefined)Tt=clamp(1.1+0.3*dl+0.35*Math.log(1+dt/Math.max(v.d,ctl.d)),1.1,5);anim={from,to:v,t0:performance.now(),T:Tt*1000};
    setCut(!!v.cut);}   /* a view that does not ask for the cutaway puts the ceilings back */
  function step(now){const a=anim,s=ctl,u=clamp((now-a.t0)/a.T,0,1),e=u*u*(3-2*u);
    s.d=Math.exp(Math.log(a.from.d)+(Math.log(a.to.d)-Math.log(a.from.d))*e);
    s.t.set(a.from.t.x+(a.to.t[0]-a.from.t.x)*e,a.from.t.y+(a.to.t[1]-a.from.t.y)*e,a.from.t.z+(a.to.t[2]-a.from.t.z)*e);
    let dy=a.to.yaw-a.from.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));s.yaw=a.from.yaw+dy*e;s.pitch=a.from.pitch+(a.to.pitch-a.from.pitch)*e;if(u>=1)anim=null;}
  function setCut(on){S.cut=on;for(const m of ceilings)m.visible=!on;syncUI&&syncUI();}

  // ---- the input: drag to orbit, right or Shift-drag to pan, the wheel to zoom; F flies; X the cutaway ----
  const el=renderer.domElement,rv=new V3(),uv=new V3();
  function pan(dx,dy){const s=ctl,k=2*s.d*Math.tan(camera.fov*Math.PI/360)/innerHeight;rv.setFromMatrixColumn(camera.matrix,0);uv.setFromMatrixColumn(camera.matrix,1);s.t.addScaledVector(rv,-dx*k).addScaledVector(uv,dy*k);}
  trackPointers(el,{down:()=>{anim=null;},
    drag:(dx,dy,{pan:p})=>{const s=ctl;if(p)pan(dx,dy);
      else if(S.fly){const P0=s.t.clone().add(offs(s,ov3));s.yaw-=dx*0.004;s.pitch=clamp(s.pitch+dy*0.004,-1.52,1.52);s.t.copy(P0).sub(offs(s,ov3));}
      else{s.yaw-=dx*ORBIT_RATE;s.pitch=clamp(s.pitch+dy*ORBIT_RATE,-1.52,1.52);}},
    pinch:(ratio,dx,dy)=>{ctl.d=clamp(ctl.d*ratio,ctl.dmin,ctl.dmax);pan(dx,dy);},
    wheel:(dy)=>{anim=null;if(S.fly){S.flySpeed=clamp(S.flySpeed*Math.exp(-dy*0.0015),0.5,600);return;}ctl.d=clamp(ctl.d*Math.exp(dy*0.0014),ctl.dmin,ctl.dmax);}});
  const keys=trackKeys({onKey:(k,e,held)=>{if(held){anim=null;return;}
    if(k===BIND.fly){S.fly=!S.fly;syncUI();return;}
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
  function showCard(k){const c=k&&K.cards[k];if(!c){cardEl.classList.remove('on');return;}
    cardEl.innerHTML='';const h=document.createElement('h2');h.textContent=c.h;const p=document.createElement('p');p.textContent=c.p;
    const s=document.createElement('p');s.className='sub';s.textContent=c.sub||'';cardEl.append(h,p,s);cardEl.classList.add('on');
    clearTimeout(cardTimer);cardTimer=setTimeout(()=>cardEl.classList.remove('on'),16000);}
  cardEl.addEventListener('click',()=>cardEl.classList.remove('on'));
  const groups=[];for(const v of VIEWS){let g=groups.find(x=>x[0]===v.group);if(!g)groups.push(g=[v.group,[]]);g[1].push(v);}
  for(const [name,list] of groups){const h=document.createElement('div');h.className='sub';h.textContent=name;views.appendChild(h);
    for(const v of list)mkBtn(v.name,views,()=>{go(v);showCard(v.card);views.classList.remove('open');vb.setAttribute('aria-expanded','false');});}
  // the events: each sector's, in one panel
  const eb=mkBtn('Events',ui,()=>{const o=!evp.classList.contains('open');evp.classList.toggle('open',o);views.classList.remove('open');});
  const running=[];
  function fire(key){const E=K.events.find(e=>e.key===key);if(!E)return;evp.classList.remove('open');
    const r=E.start({go,showCard,setCut,camera,ctl});if(r&&r.update)running.push(r);if(E.card)showCard(E.card);
    if(E.view)go(E.view);}
  for(const E of K.events)mkBtn(E.label,evp,()=>fire(E.key));
  const cutB=mkBtn('Cutaway',ui,()=>setCut(!S.cut));cutB.title='Lift the ceilings (X): the sectors from above, as the blueprints draw them';
  const flyB=mkBtn('Fly',ui,()=>{S.fly=!S.fly;syncUI();});flyB.title='Fly (F): drag to look, WASD along where you look, Q/E down and up, the wheel for speed';
  function syncUI(){flyB.setAttribute('aria-pressed',String(S.fly));cutB.setAttribute('aria-pressed',String(S.cut));}
  const wire=createWire({THREE,scene,animHooks});
  installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
  installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));
  const hud=document.createElement('div');hud.id='timebar';document.getElementById('side').appendChild(hud);

  // ---- the address ----
  function writeHash(){const s=ctl;mergeHash({at:[s.t.x.toFixed(1),s.t.y.toFixed(1),s.t.z.toFixed(1),s.d.toPrecision(4),s.yaw.toFixed(3),s.pitch.toFixed(3)].join(','),
      cut:S.cut?true:null,view:null,event:null},['at']);}
  {const at=(HASH.get('at')||'').split(',').map(Number);setState(ctl,VIEWS[0]);setCut(!!VIEWS[0].cut);
   if(at.length===6&&at.every(Number.isFinite)){setState(ctl,{t:at.slice(0,3),d:at[3],yaw:at[4],pitch:at[5]});setCut(HASH.has('cut'));}
   const vn=HASH.get('view');if(vn!=null){const v=VIEWS.find(x=>x.name===vn)||VIEWS[+vn];if(v){setState(ctl,v);setCut(!!v.cut);showCard(v.card);}}
   if(HASH.has('fly'))S.fly=true;
   if(HASH.has('event'))setTimeout(()=>fire(HASH.get('event')),900);}
  syncUI();
  trackResize(renderer,camera);
  finishLoading({hintMs:16000,canvas:el});

  // ---- the air: each zone's fog, eased ----
  const fogT=new THREE.Color(),fogC=FOG.clone();let fogD=C.fog.density;
  let hashAt=0;
  let fpsN=0,fpsT=0;
  runLoop((now,dt)=>{
    /* frames per second, over the last second or so, for the HUD's tests (tools/probe.py reads ctx.fps) */
    fpsN++;fpsT+=dt;if(fpsT>1){ctx.fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0;}
    if(anim)step(now);
    else if(keys.size&&S.fly){const s=ctl,sp=S.flySpeed*(keys.has(BIND.fast)?FAST:1)*dt,f3=offs(s,ov3).normalize().negate(),rx=-f3.z,rz=f3.x,rl=Math.hypot(rx,rz)||1;
      if(keys.has('w'))s.t.addScaledVector(f3,sp);if(keys.has('s'))s.t.addScaledVector(f3,-sp);
      if(keys.has('d')){s.t.x+=rx/rl*sp;s.t.z+=rz/rl*sp;}if(keys.has('a')){s.t.x-=rx/rl*sp;s.t.z-=rz/rl*sp;}if(keys.has('e'))s.t.y+=sp;if(keys.has('q'))s.t.y-=sp;}
    else if(keys.size){const s=ctl,sp=s.d*0.7*(keys.has(BIND.fast)?FAST:1)*dt,fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw);
      if(keys.has('w')){s.t.x+=fx*sp;s.t.z+=fz*sp;}if(keys.has('s')){s.t.x-=fx*sp;s.t.z-=fz*sp;}
      if(keys.has('a')){s.t.x+=fz*sp;s.t.z-=fx*sp;}if(keys.has('d')){s.t.x-=fz*sp;s.t.z+=fx*sp;}if(keys.has('e'))s.t.y+=sp;if(keys.has('q'))s.t.y-=sp;}
    if(!S.camLocked)place(camera,ctl);
    camera.updateMatrixWorld();
    const p=camera.position;
    fogT.copy(FOG);let tgt=C.fog.density;
    // in the cutaway, looking down from outside, the air is clear
    if(!S.cut)for(const z of K.zones){const k=clamp(1.5-p.distanceTo(new V3(...z.c))/z.r,0,1);if(k>0){fogT.lerp(new THREE.Color(z.color),k);tgt+=(z.density-tgt)*k;}}
    else tgt=C.fog.density*0.15;
    const k=1-Math.exp(-dt*3);fogC.lerp(fogT,k);fogD+=(tgt-fogD)*k;scene.fog.color.copy(fogC);scene.fog.density=fogD;renderer.setClearColor(fogC);
    for(const h of K.hooks)h(now/1000,dt,camera);
    for(let i=running.length-1;i>=0;i--)if(running[i].update(now/1000,dt,camera)===false)running.splice(i,1);
    runHooks(animHooks,now);
    renderer.render(scene,camera);
    let where=null;for(const [n,c,r] of K.places)if(p.distanceTo(new V3(...c))<r){where=n;break;}
    hud.textContent=(S.fly?'FLYING '+len(S.flySpeed*(keys.has(BIND.fast)?FAST:1))+'/s · ':'')+(where||(S.cut?'above the blueprints':'in the dark between the sectors')).toUpperCase()+(S.cut?' · CUTAWAY':'');
    if(now-hashAt>1200){hashAt=now;writeHash();}
  });
  ctx.ctl=ctl;ctx.K=K;ctx.fire=fire;
}

boot(build);
