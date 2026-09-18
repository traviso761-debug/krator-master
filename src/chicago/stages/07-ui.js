// ---------- camera, views, the clock, the card, the render loop ----------
await stage('ui');
const el=renderer.domElement;
// orbit camera: drag to orbit, right/shift-drag or two fingers to pan, wheel/pinch to zoom, WASD/QE to move the target
const ctl={target:new THREE.Vector3(0,40,0),az:0.6,el:0.5,dist:1400,goal:null};
function applyCam(){const e=Math.max(0.03,Math.min(1.5,ctl.el));camera.position.set(ctl.target.x+Math.cos(ctl.az)*Math.cos(e)*ctl.dist,ctl.target.y+Math.sin(e)*ctl.dist,ctl.target.z+Math.sin(ctl.az)*Math.cos(e)*ctl.dist);camera.lookAt(ctl.target);}
function setView(px,py,pz,tx,ty,tz,fly){const t=new THREE.Vector3(tx,ty,tz),p=new THREE.Vector3(px,py,pz),d=p.clone().sub(t);const goal={target:t,az:Math.atan2(d.z,d.x),el:Math.atan2(d.y,Math.hypot(d.x,d.z)),dist:d.length()};
  if(fly===false||matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(ctl,goal);ctl.goal=null;return;}ctl.goal=Object.assign(goal,{t0:performance.now(),from:{target:ctl.target.clone(),az:ctl.az,el:ctl.el,dist:ctl.dist}});}
const ptrs=new Map();let pinch0=0,dist0=0;
el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,sh:e.shiftKey,moved:0});if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);dist0=ctl.dist;}});
el.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;p.moved+=Math.abs(dx)+Math.abs(dy);ctl.goal=null;
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];const pd=Math.hypot(a.x-b.x,a.y-b.y);ctl.dist=Math.max(8,Math.min(9000,dist0*pinch0/pd));pan(dx/2,dy/2);return;}
  if(p.b===2||p.sh)pan(dx,dy);else{ctl.az+=dx*0.005;ctl.el=Math.max(0.03,Math.min(1.5,ctl.el+dy*0.005));}});
const endPtr=e=>{const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);if(p&&p.moved<6&&e.type==='pointerup'&&p.b===0)clickAt(e.clientX,e.clientY);};
el.addEventListener('pointerup',endPtr);el.addEventListener('pointercancel',endPtr);el.addEventListener('contextmenu',e=>e.preventDefault());
function pan(dx,dy){const k=ctl.dist*0.0016;const fx=Math.cos(ctl.az),fz=Math.sin(ctl.az);ctl.target.x+=(-dx*fz+dy*fx)*k*-1;ctl.target.z+=(dx*fx+dy*fz)*k*-1;}
el.addEventListener('wheel',e=>{e.preventDefault();ctl.goal=null;ctl.dist=Math.max(8,Math.min(9000,ctl.dist*Math.exp(e.deltaY*0.0012)));},{passive:false});
// Only the six movement keys, and only unmodified: a shortcut like ctrl+shift+S belongs to the browser, not the camera.
// Keys are also dropped when the window loses focus, because a key held as focus leaves never sends its keyup and the
// camera would go on moving on its own (which is what a screenshot tool taking focus used to do).
const keys=new Set(),MOVE=new Set(['w','a','s','d','q','e']);
const typingIn=t=>!!t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);
addEventListener('keydown',e=>{if(typingIn(e.target))return;if(e.key==='Escape'){closeCard();return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(MOVE.has(k))keys.add(k);});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
function applyKeys(){if(!keys.size)return;const s=ctl.dist*0.012,fx=Math.cos(ctl.az),fz=Math.sin(ctl.az);let mx=0,mz=0;if(keys.has('w'))mx-=1;if(keys.has('s'))mx+=1;if(keys.has('a'))mz+=1;if(keys.has('d'))mz-=1;
  ctl.target.x+=(mx*fx-mz*fz)*s;ctl.target.z+=(mx*fz+mz*fx)*s;if(keys.has('q'))ctl.target.y=Math.max(0,ctl.target.y-s);if(keys.has('e'))ctl.target.y+=s;if(mx||mz||keys.has('q')||keys.has('e'))ctl.goal=null;}
function stepFly(now){const g=ctl.goal;if(!g)return;const u=Math.min(1,(now-g.t0)/1400),k=u*u*(3-2*u);ctl.target.lerpVectors(g.from.target,g.target,k);let da=g.az-g.from.az;da=Math.atan2(Math.sin(da),Math.cos(da));ctl.az=g.from.az+da*k;ctl.el=g.from.el+(g.el-g.from.el)*k;ctl.dist=g.from.dist+(g.dist-g.from.dist)*k;if(u>=1)ctl.goal=null;}
// the panels: viewpoints, the clock, a card for the landmark you click
const ui=document.getElementById('ui'),viewsEl=document.getElementById('views'),card=document.getElementById('card'),side=document.getElementById('side');
const VIEWS={};for(const k in C.views){const [f,t]=C.views[k],[fx,fz]=P(f),[tx,tz]=P(t);VIEWS[k]=[fx,f[2],fz,tx,t[2],tz];}   // [lat,lon,height] from and to
const mkBtn=(label,parent,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;parent.appendChild(b);return b;};
const viewsBtn=mkBtn('Views',ui,()=>{const open=!viewsEl.classList.contains('open');viewsEl.classList.toggle('open',open);viewsBtn.setAttribute('aria-expanded',String(open));});viewsBtn.setAttribute('aria-expanded','false');
{const h=document.createElement('div');h.className='sub';h.textContent='Viewpoints';viewsEl.appendChild(h);for(const k in VIEWS)mkBtn(k,viewsEl,()=>{setView(...VIEWS[k]);viewsEl.classList.remove('open');viewsBtn.setAttribute('aria-expanded','false');});}
const pauseBtn=mkBtn('Pause sun',ui,()=>{if(!clockPaused){clockPaused=true;pausedAt=performance.now()-clockOffset;pauseBtn.textContent='Resume sun';}else{clockPaused=false;clockOffset=performance.now()-pausedAt;pauseBtn.textContent='Pause sun';}});
const tw=document.createElement('div');tw.id='timebar';tw.innerHTML='<label for="tslider" id="tlabel">10:30</label><input id="tslider" type="range" min="0" max="24" step="0.05" value="10.5" aria-label="Time of day"><select id="daylen" aria-label="Length of a day"><option value="120">day 2 min</option><option value="240" selected>day 4 min</option><option value="720">day 12 min</option></select>';side.appendChild(tw);
const tsl=document.getElementById('tslider'),tlab=document.getElementById('tlabel'),dsel=document.getElementById('daylen');let dragging=false;
tsl.addEventListener('pointerdown',()=>{dragging=true;});addEventListener('pointerup',()=>{dragging=false;});tsl.addEventListener('input',()=>setHour(parseFloat(tsl.value)));
dsel.addEventListener('change',()=>{const h=hourCur;DAY=+dsel.value;setHour(h);});
const hud=document.createElement('pre');hud.id='hud';side.appendChild(hud);let hudT=0,tbTxt='';
animHooks.push(now=>{if(now-hudT<200)return;hudT=now;const h=hourCur,t=`${String(Math.floor(h)).padStart(2,'0')}:${String(Math.floor((h%1)*60)).padStart(2,'0')}`;if(!dragging)tsl.value=h.toFixed(2);if(t!==tbTxt){tbTxt=t;tlab.textContent=t;}
  hud.textContent=`${t}\ntarget  x ${ctl.target.x.toFixed(0)}  z ${ctl.target.z.toFixed(0)}\n${districtAt(ctl.target.x,ctl.target.z).name}`+(RES.cur<RES.max-0.01?`\nrender  ×${RES.cur.toFixed(2)}`:'')+(DETAIL.k<DETAIL.max-0.01?`\ndetail  ×${DETAIL.k.toFixed(2)}`:'');});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function clickAt(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(LANDMARKS.concat(PICK_TILES),true);if(!hits.length){closeCard();return;}const hit=hits[0];
  let o=hit.object,info=null;while(o&&!info){info=o.userData.info;o=o.parent;}if(info){showCard(info);return;}
  // an OSM building: its landmark card if it is one, otherwise its mapped name and height
  const b=buildingAt(hit),px=hit.point.x,pz=hit.point.z;
  const card=CARDS.map(c=>({c,d:Math.hypot(c.x-(b?b.cx:px),c.z-(b?b.cz:pz))})).sort((p,q)=>p.d-q.d)[0];
  if(card&&card.d<(b?70:35)){showCard(card.c.L);return;}
  if(b){showCard({name:b.name,info:`${Math.round(b.h)} m tall (OpenStreetMap).`});return;}
  const h=roofAt(px,pz);if(h)showCard({name:'Building',info:`About ${Math.round(h)} m tall. ${districtAt(px,pz).name}.`});else closeCard();}
function showCard(L){card.innerHTML='';const h=document.createElement('h2');h.textContent=L.name;const p=document.createElement('p');p.textContent=L.info||'';const b=document.createElement('button');b.type='button';b.textContent='Close';b.onclick=closeCard;card.append(h,p,b);card.classList.add('open');card.style.display='block';b.focus();}
function closeCard(){card.classList.remove('open');card.style.display='';}
// the address keeps the view and the hour, like the Iziz page: #v=px,py,pz,tx,ty,tz&t=hour
function stateToHash(){const r1=x=>Math.round(x*10)/10,p=camera.position,t=ctl.target;return '#'+(SEED0!==SEED_DEFAULT?'seed='+SEED0+'&':'')+'v='+[p.x,p.y,p.z,t.x,t.y,t.z].map(r1).join(',')+'&t='+(Math.round(hourCur*20)/20)+(clockPaused?'&paused':'');}
function readHash(){let q;try{q=new URLSearchParams(location.hash.slice(1));}catch(e){return false;}if(!q.has('v'))return false;const v=(q.get('v')||'').split(',').map(Number);if(v.length===6&&v.every(Number.isFinite))setView(...v,false);
  const t=parseFloat(q.get('t'));if(Number.isFinite(t))setHour(((t%24)+24)%24);if(q.has('paused')&&!clockPaused)pauseBtn.click();return true;}
let lastHash='',hashT=0;animHooks.push(now=>{if(now-hashT<1500||ctl.goal||ptrs.size)return;hashT=now;const h=stateToHash();if(h!==lastHash){lastHash=h;try{history.replaceState(null,'',h);}catch(e){}}});
if(!readHash())setView(...(VIEWS[C.defaultView]||VIEWS['Skyline from the lake']||Object.values(VIEWS)[0]),false);
{const at=document.createElement('div');at.id='attribution';at.innerHTML=C.attribution||('Map data \u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'+(TER?' \u00b7 elevation: AWS Terrain Tiles (SRTM/NED)':''));   // an invented city credits its generator instead
 document.body.appendChild(at);}
{const hint=document.getElementById('hint');const hide=()=>hint.classList.add('gone');setTimeout(hide,12000);el.addEventListener('pointerdown',hide,{once:true});el.addEventListener('wheel',hide,{once:true,passive:true});}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);updatePx();});
if(SEED0!==SEED_DEFAULT)document.getElementById('seedtag').textContent='seed '+SEED0;
// shadows follow the target; compile everything behind the loading text
await stage('shaders');
section('shaders',()=>{applyCam();sun.target.position.copy(ctl.target);renderer.compile(scene,camera);renderer.render(scene,camera);});
stage('done');ctx.timings=LOAD.times;ctx.loadMs=Math.round(performance.now()-LOAD.t0);if(/debug/.test(location.search))console.table(LOAD.times);
document.getElementById('loading').remove();
renderer.shadowMap.autoUpdate=false;const shadowAt=new THREE.Vector3(1e9,0,0);let shadowTick=0;
const shadowSun=new THREE.Vector3(0,1,0);
// Redraw the shadow map when the view or the sun has actually moved, not on a frame counter. Nothing that moves
// casts any more, so between those two events the map is still correct and the pass can be skipped entirely.
function shadowsDue(){if(sun.intensity<=0.02)return false;
  const moved=ctl.target.distanceToSquared(shadowAt)>4,turned=ENV.izSunDir.value.dot(shadowSun)<0.99996;
  if(moved||turned){shadowAt.copy(ctl.target);shadowSun.copy(ENV.izSunDir.value);
    sun.target.position.copy(ctl.target);sun.position.copy(ENV.izSunDir.value).multiplyScalar(2500).add(ctl.target);return true;}
  return (++shadowTick%30)===0;}
// adaptive resolution, as on the Iziz page
const RES={max:Math.min(devicePixelRatio,1.5),cur:Math.min(devicePixelRatio,1.5),min:0.6,acc:0,n:0,good:0,bad:0,prev:performance.now()};
function adaptRes(now){const dt=(now-RES.prev)/1000;RES.prev=now;if(dt>0.5||document.hidden)return;RES.acc+=dt;RES.n++;if(RES.acc<1)return;const fps=RES.n/RES.acc;RES.acc=0;RES.n=0;
  if(fps<45){RES.bad++;RES.good=0;}else if(fps>56){RES.good++;RES.bad=0;}let next=RES.cur;
  // give up distant detail before giving up pixels: clutter a kilometre off is barely visible, a soft image is not
  if(RES.bad>=2&&DETAIL.k>DETAIL.min){DETAIL.k=Math.max(DETAIL.min,DETAIL.k-0.12);RES.bad=0;}
  else if(RES.bad>=2){next=Math.max(RES.min,RES.cur-0.15);RES.bad=0;}
  else if(RES.good>=8){if(RES.cur<RES.max)next=Math.min(RES.max,RES.cur+0.1);else if(DETAIL.k<DETAIL.max)DETAIL.k=Math.min(DETAIL.max,DETAIL.k+0.06);RES.good=0;}
  if(Math.abs(next-RES.cur)>1e-3){RES.cur=+next.toFixed(2);renderer.setPixelRatio(RES.cur);renderer.setSize(innerWidth,innerHeight);updatePx();}}
ctx.res=RES;let fpsN=0,fpsT=performance.now(),renderErr=false;
(function animate(){requestAnimationFrame(animate);try{const now=performance.now();adaptRes(now);fpsN++;if(now-fpsT>1000){ctx.fps=fpsN;fpsN=0;fpsT=now;}
  for(const f of animHooks){try{f(now);}catch(e){if(!f._failed){f._failed=true;report('update',e);}}}stepFly(now);applyKeys();applyCam();if(shadowsDue())renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;report('render',e);}}})();
