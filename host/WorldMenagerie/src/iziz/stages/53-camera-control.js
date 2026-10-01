// ---------- camera control: orbit + pinch + pan + keys ----------
const ctl={target:new THREE.Vector3(),theta:0,phi:1.2,radius:400};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let fly=null;   // an eased move between viewpoints; any user input cancels it
function setView(pxx,py,pz,tx,ty,tz,instant,dur){if(WALK.on&&ctx.exitWalk)ctx.exitWalk(true);const o=new THREE.Vector3(pxx-tx,py-ty,pz-tz),r=o.length();
  const to={target:new THREE.Vector3(tx,ty,tz),radius:r,theta:Math.atan2(o.x,o.z),phi:Math.acos(clamp(o.y/r,-1,1))};
  if(instant||reduceMotion){ctl.target.copy(to.target);ctl.radius=to.radius;ctl.theta=to.theta;ctl.phi=to.phi;fly=null;return;}
  let dt=to.theta-ctl.theta;while(dt>Math.PI)dt-=2*Math.PI;while(dt<-Math.PI)dt+=2*Math.PI;
  const dist=ctl.target.clone().sub(to.target).length();
  fly={t0:performance.now(),dur:dur||clamp(600+dist*1.2,700,1600),from:{target:ctl.target.clone(),radius:ctl.radius,theta:ctl.theta,phi:ctl.phi},to,dTheta:dt};}
function stepFly(now){if(!fly||WALK.on)return;const u=clamp((now-fly.t0)/fly.dur,0,1),e=u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,f=fly.from,t=fly.to;
  ctl.target.lerpVectors(f.target,t.target,e);ctl.radius=Math.exp(Math.log(f.radius)+(Math.log(t.radius)-Math.log(f.radius))*e);
  ctl.theta=f.theta+fly.dTheta*e;ctl.phi=f.phi+(t.phi-f.phi)*e;if(u>=1)fly=null;}
// walk mode: eye height on open ground, looking where you drag
const WALK={on:false,x:0,z:0,y:0,yaw:0,pitch:0,bob:0,last:0};
function walkOpen(x,z){return ctx.walkBlocked?!ctx.walkBlocked(x,z):true;}
function stepWalk(now){const dt=Math.min(0.05,(now-(WALK.last||now))/1000);WALK.last=now;
  const K=(k,ar)=>keys.has(k)||keys.has(ar),f=(K('w','arrowup')?1:0)-(K('s','arrowdown')?1:0)+(WALK.hold||0),st=(K('d','arrowright')?1:0)-(K('a','arrowleft')?1:0);if(!f&&!st)return;
  const sp=(keys.has('shift')?12:5.5)*dt,sy=Math.sin(WALK.yaw),cy=Math.cos(WALK.yaw),len=Math.hypot(f,st)||1;
  const dx=(sy*f-cy*st)/len*sp,dz=(cy*f+sy*st)/len*sp;
  if(walkOpen(WALK.x+dx,WALK.z+dz)){WALK.x+=dx;WALK.z+=dz;}else if(walkOpen(WALK.x+dx,WALK.z)){WALK.x+=dx;}else if(walkOpen(WALK.x,WALK.z+dz)){WALK.z+=dz;}
  WALK.bob+=sp*1.6;}
function updateCam(){
  if(WALK.on){const gy=ctx.walkerGround?ctx.walkerGround(WALK.x,WALK.z):terrainH(WALK.x,WALK.z);WALK.y=WALK.y===undefined||Math.abs(gy-WALK.y)>6?gy:WALK.y+(gy-WALK.y)*0.25;const ey=WALK.y+1.65+Math.sin(WALK.bob)*0.05;   // eye height eases over each step
    camera.position.set(WALK.x,ey,WALK.z);ctl.target.set(WALK.x+Math.sin(WALK.yaw)*Math.cos(WALK.pitch)*4,ey+Math.sin(WALK.pitch)*4,WALK.z+Math.cos(WALK.yaw)*Math.cos(WALK.pitch)*4);}
  else{
  const r=ctl.radius,p=ctl.phi,t=ctl.theta;
  camera.position.set(ctl.target.x+r*Math.sin(p)*Math.sin(t),ctl.target.y+r*Math.cos(p),ctl.target.z+r*Math.sin(p)*Math.cos(t));
  const gy=terrainH(camera.position.x,camera.position.z)+2.5;if(camera.position.y<gy)camera.position.y=gy;}
  camera.lookAt(ctl.target);
  sky.position.copy(camera.position);
  moonSprite.position.copy(camera.position).addScaledVector(moonDir,2300);
  {const tot=ctx.totalHours||15,days=tot/24,pa=(days/8+0.35)%1,pb=(days/3+0.1)%1;MOONS.draw(MOONS.a,pa);MOONS.draw(MOONS.b,pb);MOONS.pa=pa;MOONS.pb=pb;
   const ang=tot*2*Math.PI/20,el=0.55*Math.sin(ang),az=ang*0.5+1.2;MOONS.dir2=MOONS.dir2||new THREE.Vector3();MOONS.dir2.set(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el));
   moon2.position.copy(camera.position).addScaledVector(MOONS.dir2,2250);const dayF=smooth(0,0.25,Math.max(0,sunDir.y));moon2.visible=el>-0.04&&ctx.skyAllowed!==false;moon2.material.opacity=(1-0.7*dayF)*(1-ENV.izRain.value*0.8)*(1-ENV.izFog.value*0.7);
   moonSprite.material.opacity=(1-0.55*dayF)*(1-ENV.izRain.value*0.7)*(1-ENV.izFog.value*0.6);}
  // sun and lighting for the current hour
  {const now=performance.now();const tt=clockPaused?pausedAt:now-clockOffset;const h=hourNow(tt);ctx.totalHours=HOUR0+(tt/1000)/(DAY/24);const d=sunAt(h);const up=Math.max(0,d.y);
   sunDir.copy(d);sunSprite.position.copy(camera.position).addScaledVector(d,2300);sunSprite.visible=d.y>-0.06&&ctx.skyAllowed!==false;
   sun.position.copy(ctl.target).addScaledVector(d,400);sun.target.position.copy(ctl.target);sun.target.updateMatrixWorld();
   const day=smooth(0,0.25,up);                                             // 0 at night, 1 once the sun is well up
   const rain=ENV.izRain.value;
   const fogV=ENV.izFog.value,dust=ENV.izDust.value,warm=up>0?1-smooth(0.04,0.4,up):0,dawn=h<12?warm:warm*0.7;
   sun.intensity=(0.95*Math.min(1,up/0.42)+0.28*dawn)*(1-0.65*rain)*(1-0.35*dust)*(1-0.4*fogV);   // low sun: a warm glow on the walls, strongest at sunrise
   sun.color.setHSL(0.045-0.03*warm,0.55+0.35*warm,0.62+0.1*day-0.06*warm);
   const fl=ENV.izFlash.value;const full=ctx.moons&&ctx.moons.pa!==undefined?1-Math.abs(ctx.moons.pa-0.5)*2:0.5;   // the green moon lights the night more when it is full
   ambient.intensity=0.46+0.39*day-0.06*rain*day+0.8*fl;hemi.intensity=0.3+0.18*day+0.4*fl;moonLight.intensity=(0.5*(1-day)*(0.6+0.4*full)+0.05)*(1-0.5*rain);
   const sb=0.52+0.48*day,low=1-smooth(0,0.35,Math.abs(d.y+0.02)),g0=0.34*sb;
   let fr=0.165*sb+0.09*low,fg=0.157*sb+0.03*low,fb=0.47*sb+0.08*(1-day)-0.04*low;
   fr+=(g0-fr)*0.6*rain;fg+=(g0-fg)*0.6*rain;fb+=(g0*1.1-fb)*0.6*rain;
   {const fc=[0.14+0.52*day,0.15+0.53*day,0.2+0.5*day];fr+=(fc[0]-fr)*0.75*fogV;fg+=(fc[1]-fg)*0.75*fogV;fb+=(fc[2]-fb)*0.75*fogV;
    const dc=[0.64*sb,0.5*sb,0.33*sb];fr+=(dc[0]-fr)*0.7*dust;fg+=(dc[1]-fg)*0.7*dust;fb+=(dc[2]-fb)*0.7*dust;}
   scene.fog.color.setRGB(fr,fg,fb);scene.fog.density=0.00105*(1+0.9*rain)*(1+3.2*fogV)*(1+1.8*dust);
   ENV.izHour.value=h;ENV.izDay.value=day;ENV.izNight.value=nightF(h);ENV.izSunDir.value.copy(d);ENV.izLight.value=(0.42+0.58*day)*(1-0.3*rain);
   ctx.hour=h;}
}
// the site's controls (src/core/input.js): drag to orbit (walking: to look), right, middle or Shift-drag to pan,
// the wheel or a pinch to zoom
const el=renderer.domElement;
const PTR=trackPointers(el,{
  down:()=>{if(ctx.stopTour)ctx.stopTour();fly=null;closePanels();},
  drag:(dx,dy,{pan:p})=>{
    if(WALK.on){WALK.yaw-=dx*0.0045;WALK.pitch=clamp(WALK.pitch-dy*0.0045,-1.2,1.2);return;}
    if(p)pan(dx,dy);else{ctl.theta-=dx*ORBIT_RATE;ctl.phi=clamp(ctl.phi-dy*ORBIT_RATE,0.05,2.6);}},
  pinch:(ratio,dx,dy)=>{if(WALK.on)return;ctl.radius=clamp(ctl.radius*ratio,4,1800);pan(dx,dy);},
  wheel:(dy0,e)=>{if(ctx.stopTour)ctx.stopTour();if(WALK.on)return;fly=null;const px=e.deltaMode===1?dy0*16:e.deltaMode===2?dy0*innerHeight:dy0;   // proportional: a mouse notch is ~15%, a trackpad glides
    ctl.radius=clamp(ctl.radius*Math.exp(clamp(px*(e.ctrlKey?4:1),-240,240)*0.0015),4,1800);}});
function pan(dx,dy){if(ctx.stopFollow)ctx.stopFollow();const k=2*ctl.radius*Math.tan(camera.fov*Math.PI/360)/innerHeight;const fwd=new THREE.Vector3(Math.sin(ctl.theta),0,Math.cos(ctl.theta));const right=new THREE.Vector3(-fwd.z,0,fwd.x);ctl.target.addScaledVector(right,-dx*k).addScaledVector(fwd,dy*k);}
// the keys: W A S D (walking, the arrows too) and Q E, Shift five times as fast (walking: to run), H hides the
// interface, Esc closes whatever is open
const keys=trackKeys({arrows:true,onKey:(k,e,held)=>{
  if(held){if(WALK.on&&k.startsWith('arrow'))e.preventDefault();if(!k.startsWith('arrow')){if(ctx.stopTour)ctx.stopTour();fly=null;}return;}
  if(k==='escape'){closePanels();if(ctx.closeCard)ctx.closeCard();if(ctx.stopTour)ctx.stopTour();if(WALK.on&&ctx.exitWalk)ctx.exitWalk();return;}
  if(k==='h'&&!e.repeat){toggleBare();return;}}});
// per second, not per frame: see the note in the engine's 07-ui.js
let keyT=performance.now();
function applyKeys(){const tNow=performance.now(),dt=Math.min(0.05,(tNow-keyT)/1000);keyT=tNow;
  if(WALK.on)return stepWalk(performance.now());if(['w','a','s','d','q','e'].some(x=>keys.has(x))&&ctx.stopFollow)ctx.stopFollow();const k=(ctl.radius*0.012+0.4)*60*dt*(keys.has('shift')?FAST:1);const fwd=new THREE.Vector3(Math.sin(ctl.theta),0,Math.cos(ctl.theta));const right=new THREE.Vector3(-fwd.z,0,fwd.x);
  if(keys.has('w'))ctl.target.addScaledVector(fwd,-k);if(keys.has('s'))ctl.target.addScaledVector(fwd,k);
  if(keys.has('a'))ctl.target.addScaledVector(right,k);if(keys.has('d'))ctl.target.addScaledVector(right,-k);
  if(keys.has('q'))ctl.target.y-=k;if(keys.has('e'))ctl.target.y+=k;ctl.target.y=Math.max(ctl.target.y,CHASM);}

// preset views (step 4: the painting view is the sanity check)
const VIEWS=(()=>{const scope={...CITY,...DATA_FN,ground:terrainH},out={};for(const k in DATA.city.views)out[k]=dataValue(DATA.city.views[k],scope);return out;})();
if(SEWER.view)VIEWS['Sewer outfall']=SEWER.view;
if(SEWER.riverView)VIEWS['River falls']=SEWER.riverView;
if(SEWER.bridgeView)VIEWS['Rope bridge']=SEWER.bridgeView;
if(SEWER.lakeView)VIEWS['The lake']=SEWER.lakeView;
if(SEWER.docksView)VIEWS['The docks']=SEWER.docksView;
if(SEWER.innView)VIEWS['Dock road']=SEWER.innView;
if(ctx.artPrints&&ctx.artPrints.length){const a=ctx.artPrints[0];VIEWS['Painting print']=[a.x+a.nx*5,a.y+0.6,a.z+a.nz*5,a.x,a.y,a.z];}
const ui=document.getElementById('ui'),viewsEl=document.getElementById('views'),dispEl=document.getElementById('display');
// panels, tips and the legend sit just above the button bar, however many rows it wraps to
{const setBar=()=>document.documentElement.style.setProperty('--barh',Math.ceil(ui.getBoundingClientRect().height)+'px');setBar();if(window.ResizeObserver)new ResizeObserver(setBar).observe(ui);else addEventListener('resize',setBar);}
// the way out of this city and into the others (src/core/menagerie.js); it adds nothing unless the server
// answers with a scene list, so the page opened straight off the disk is unchanged
installMenagerie({ui}).then(m=>{if(m)ctx.details=Object.assign(ctx.details||{},{menagerie:m.scenes.length+' scenes'});}).catch(e=>report('menagerie',e));
const vbtn=document.createElement('button');vbtn.textContent='Views';vbtn.setAttribute('aria-haspopup','dialog');vbtn.setAttribute('aria-expanded','false');vbtn.setAttribute('aria-controls','views');ui.prepend(vbtn);
const dbtn=document.createElement('button');dbtn.textContent='Display';dbtn.setAttribute('aria-haspopup','dialog');dbtn.setAttribute('aria-expanded','false');dbtn.setAttribute('aria-controls','display');vbtn.after(dbtn);
const lexEl=document.getElementById('lexicon');const PANELS=[[viewsEl,vbtn],[dispEl,dbtn],[lexEl,vbtn]];
function closePanels(){document.body.classList.remove('panel-open');for(const [p,bt] of PANELS)if(p.classList.contains('open')){p.classList.remove('open');bt.setAttribute('aria-expanded','false');}}
function closeViews(){closePanels();}
function openPanel(p,bt,focusSel){closePanels();document.getElementById('hint').classList.add('gone');p.classList.add('open');document.body.classList.add('panel-open');bt.setAttribute('aria-expanded','true');(p.querySelector(focusSel)||p.querySelector('button')).focus();}
vbtn.onclick=()=>viewsEl.classList.contains('open')?closePanels():openPanel(viewsEl,vbtn,'[aria-current="true"]');
dbtn.onclick=()=>dispEl.classList.contains('open')?closePanels():openPanel(dispEl,dbtn,'[aria-pressed="true"]');
let curView='';
function markView(name){curView=name;for(const bt of viewsEl.querySelectorAll('button[data-view]'))bt.setAttribute('aria-current',String(bt.dataset.view===name));vbtn.textContent=name?'View: '+name:'Views';}
const viewBtn=(name,v)=>{const bt=document.createElement('button');bt.textContent=name;bt.dataset.view=name;bt.onclick=()=>{if(ctx.stopFollow)ctx.stopFollow();if(ctx.stopTour)ctx.stopTour();setView(...v);markView(name);closePanels();vbtn.focus();};return bt;};
for(const k in VIEWS)viewsEl.appendChild(viewBtn(k,VIEWS[k]));
// saved views: kept in this browser, and copyable as a line for the VIEWS table
const SV_KEY='iziz.savedViews';let savedViews=[];try{savedViews=JSON.parse(localStorage.getItem(SV_KEY)||'[]').filter(x=>x&&typeof x.name==='string'&&Array.isArray(x.v)&&x.v.length===6);}catch(e){savedViews=[];}
const svHead=document.createElement('div');svHead.className='sub';svHead.textContent='Saved views';
const svList=document.createElement('div');svList.style.display='contents';
const svRow=document.createElement('div');svRow.className='row';
const svName=document.createElement('input');svName.type='text';svName.placeholder='Name this view';svName.maxLength=40;svName.setAttribute('aria-label','Name for the saved view');
const svBtn=document.createElement('button');svBtn.textContent='Save this view';svRow.append(svName,svBtn);
const svStatus=document.createElement('div');svStatus.className='status';svStatus.setAttribute('aria-live','polite');
const lkRow=document.createElement('div');lkRow.className='row';const lkBtn=document.createElement('button');lkBtn.textContent='Copy a link to exactly this';lkRow.append(lkBtn);
const moreHead=document.createElement('div');moreHead.className='sub';moreHead.textContent='Explore';
const moreRow=document.createElement('div');moreRow.className='row';
const walkBtn=document.createElement('button');walkBtn.textContent='Walk the streets';
const tourBtn=document.createElement('button');tourBtn.textContent='Tour the views';
const izBtn=document.createElement('button');izBtn.textContent='The Izani tongue';moreRow.append(walkBtn,tourBtn,izBtn);
const cityRow=document.createElement('div');cityRow.className='row';
const newCityBtn=document.createElement('button');newCityBtn.textContent='Build a different city';cityRow.append(newCityBtn);
const cityURL=n=>{const base=location.href.split(/[?#]/)[0],q=[];if(CITY_ID!=='iziz')q.push('city='+CITY_ID);if(n)q.push('seed='+n);if(/debug/.test(location.search))q.push('debug');return base+(q.length?'?'+q.join('&'):'');};
if(SEED0!==SEED_DEFAULT){const back=document.createElement('button');back.textContent='The original '+(DATA.city.name||'Iziz');back.onclick=()=>{ctx.leaving=true;location.href=cityURL(0);};cityRow.append(back);}
if(SEED0!==SEED_DEFAULT||CITY_ID!=='iziz')document.getElementById('seedtag').textContent=(CITY_ID!=='iziz'?(DATA.city.name||CITY_ID)+' · ':'')+'city '+SEED0;
viewsEl.append(svHead,svList,svRow,lkRow,moreHead,moreRow,cityRow,svStatus);
function persistViews(){try{localStorage.setItem(SV_KEY,JSON.stringify(savedViews));return true;}catch(e){return false;}}
function codeLine(sv){return JSON.stringify(sv.name)+':['+sv.v.join(',')+'],';}
function copyText(txt,okMsg){const fallback=()=>{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();return ok;};
  const show=ok=>{svStatus.innerHTML='';if(ok)svStatus.textContent=okMsg||'Copied. Paste it into the VIEWS table to make it permanent.';else{svStatus.textContent='Copy was blocked here. The line is: ';const c=document.createElement('code');c.textContent=txt;svStatus.appendChild(c);}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>show(true),()=>show(fallback()));else show(fallback());}
function renderSaved(){svList.innerHTML='';svHead.style.display=savedViews.length?'':'none';
  savedViews.forEach((sv,i)=>{const row=document.createElement('div');row.className='row';const go=viewBtn(sv.name,sv.v);
    const cp=document.createElement('button');cp.textContent='Copy';cp.setAttribute('aria-label','Copy '+sv.name+' as code');cp.onclick=()=>copyText(codeLine(sv));
    const rm=document.createElement('button');rm.textContent='Remove';rm.setAttribute('aria-label','Remove '+sv.name);rm.onclick=()=>{savedViews.splice(i,1);persistViews();renderSaved();svStatus.textContent='Removed '+sv.name+'.';svName.focus();};
    row.append(go,cp,rm);svList.appendChild(row);});
  markView(curView);}
function saveView(){let name=svName.value.trim()||('View '+(savedViews.length+1));if(VIEWS[name])name+=' (saved)';
  const r1=x=>Math.round(x*10)/10,v=[r1(camera.position.x),r1(camera.position.y),r1(camera.position.z),r1(ctl.target.x),r1(ctl.target.y),r1(ctl.target.z)];
  const i=savedViews.findIndex(x=>x.name===name);if(i>=0)savedViews[i].v=v;else savedViews.push({name,v});
  const ok=persistViews();svName.value='';renderSaved();markView(name);svStatus.textContent=ok?'Saved '+name+'.':'Saved '+name+' for this visit (this browser is not keeping storage).';}
svBtn.onclick=saveView;
// the address keeps the view, the hour, the display and the weather, so a link reopens exactly this
const HASH_OK={wire:['off','edges','triangles'],under:['solid','hidden','xray'],colour:['textured','clay','districts'],weather:['auto','clear','rain','fog','dust','windy'],day:['120','360','720','1440']};
// Merged into the address (src/core/hash.js): a key at its default is taken out, anything else a visitor or
// another page left there is kept.
const HASH_ORDER=['seed','v','t','paused','wire','under','colour','life','weather','day'];
function hashState(){const r1=x=>Math.round(x*10)/10,p=camera.position,t=ctl.target,h=hourNow(clockPaused?pausedAt:performance.now()-clockOffset),wire=DISPLAY.wire!=='off';
  return {seed:SEED0!==SEED_DEFAULT?SEED0:null,v:[p.x,p.y,p.z,t.x,t.y,t.z].map(r1).join(','),t:Math.round(h*20)/20,paused:clockPaused,
    wire:wire?DISPLAY.wire:null,under:wire?DISPLAY.under:null,colour:DISPLAY.colour!=='textured'?DISPLAY.colour:null,life:DISPLAY.life?null:'0',
    weather:WEATHER.mode!=='auto'?WEATHER.mode:null,day:DAY!==120?DAY:null,view:null};}
// The display, the weather and the day length apply whenever they are in the address; true only when it also
// gives a view or an hour (the caller then leaves the camera alone).
function readHash(){let q;try{q=new URLSearchParams(location.hash.slice(1));}catch(e){return false;}
  let any=false;
  if(HASH_OK.day.includes(q.get('day'))){ctx.setDayLen(+q.get('day'));any=true;}
  for(const k of ['wire','under','colour'])if(HASH_OK[k].includes(q.get(k))){DISPLAY[k]=q.get(k);any=true;}
  if(q.get('life')==='0'){DISPLAY.life=false;any=true;}
  if(HASH_OK.weather.includes(q.get('weather'))){WEATHER.mode=q.get('weather');any=true;}
  if(any){applyDisplay();refreshDisplay();}
  if(!q.has('v')&&!q.has('t'))return false;
  const v=(q.get('v')||'').split(',').map(Number);if(v.length===6&&v.every(Number.isFinite))setView(...v,true);
  const tt=parseFloat(q.get('t'));if(Number.isFinite(tt))window.setHour(((tt%24)+24)%24);
  if(q.has('paused')&&!clockPaused&&ctx.pauseBtn)ctx.pauseBtn.click();
  return true;}
let lastHash='',hashT=0;
animHooks.push(now=>{if(ctx.leaving||now-hashT<1500||fly||PTR.active()||WALK.on||(ctx.touring&&ctx.touring()))return;hashT=now;lastHash=writeHash(hashState(),HASH_ORDER);});
lkBtn.onclick=()=>{const h=writeHash(hashState(),HASH_ORDER);lastHash=h;copyText(location.href.split('#')[0]+h,'Link copied. Opening it brings back this view, hour and display.');};
// ---- walking ----
const modebar=document.getElementById('modebar');
function holdBtn(label,v){const b=document.createElement('button');b.textContent=label;const on=e=>{e.preventDefault();WALK.hold=v;},off=()=>{WALK.hold=0;};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);return b;}
function enterWalk(){let x=ctl.target.x,z=ctl.target.z;
  if(!walkOpen(x,z)){let found=false;for(let r=1;r<=60&&!found;r+=1)for(let a=0;a<16&&!found;a++){const t=a/16*Math.PI*2,qx=x+Math.cos(t)*r,qz=z+Math.sin(t)*r;if(walkOpen(qx,qz)&&walkOpen(qx+0.8,qz)&&walkOpen(qx-0.8,qz)&&walkOpen(qx,qz+0.8)&&walkOpen(qx,qz-0.8)){x=qx;z=qz;found=true;}}}
  if(ctx.stopTour)ctx.stopTour();if(ctx.stopFollow)ctx.stopFollow();closePanels();fly=null;
  WALK.on=true;WALK.x=x;WALK.z=z;WALK.y=undefined;WALK.yaw=ctl.theta+Math.PI;WALK.pitch=0;WALK.hold=0;WALK.last=0;markView('');
  modebar.innerHTML='';const t=document.createElement('span');t.textContent=matchMedia('(hover:none)').matches?'Walking · drag to look':'Walking · drag to look, W A S D or arrows to move, Shift to run';
  const ex=document.createElement('button');ex.textContent='Stop walking';ex.onclick=()=>exitWalk();
  modebar.append(t,holdBtn('Forward',1),holdBtn('Back',-1),ex);modebar.classList.add('on');}
function exitWalk(quiet){if(!WALK.on)return;WALK.on=false;WALK.hold=0;modebar.classList.remove('on');
  const fx=Math.sin(WALK.yaw),fz=Math.cos(WALK.yaw);ctl.target.set(WALK.x+fx*10,WALK.y+2,WALK.z+fz*10);ctl.radius=34;ctl.theta=WALK.yaw+Math.PI;ctl.phi=1.25;if(!quiet)walkBtn.focus();}
ctx.exitWalk=exitWalk;ctx.walk=WALK;
walkBtn.onclick=()=>enterWalk();
// ---- touring ----
const TOUR={on:false,i:0,until:0};
function tourList(){return Object.keys(VIEWS).map(k=>[k,VIEWS[k]]).concat(savedViews.map(v=>[v.name,v.v]));}
function tourNext(){const L=tourList();const [name,v]=L[TOUR.i%L.length];TOUR.i++;setView(...v,false,reduceMotion?0:6000);markView(name);TOUR.name=name;TOUR.until=performance.now()+(reduceMotion?9000:6000+8000);
  modebar.firstChild.textContent='Touring · '+name;}
function startTour(){if(WALK.on)exitWalk(true);if(ctx.stopFollow)ctx.stopFollow();closePanels();TOUR.on=true;
  modebar.innerHTML='';const t=document.createElement('span');const st=document.createElement('button');st.textContent='Stop the tour';st.onclick=()=>stopTour();modebar.append(t,st);modebar.classList.add('on');tourNext();}
function stopTour(){if(!TOUR.on)return;TOUR.on=false;modebar.classList.remove('on');}
ctx.stopTour=stopTour;ctx.touring=()=>TOUR.on;
tourBtn.onclick=()=>startTour();
let tourLast=performance.now();
animHooks.push(now=>{const dt=Math.min(0.1,(now-tourLast)/1000);tourLast=now;if(!TOUR.on)return;
  if(!fly&&!reduceMotion)ctl.theta+=dt*0.035;   // a slow drift while it lingers
  if(now>TOUR.until)tourNext();});
// ---- the Izani tongue: what the walls say, the lore behind them, and the words coined for the city ----
const LEX_WORDS=DATA.lex.words.map(w=>[w.w,w.pos,w.gloss,w.build]);
const LORE=DATA.lex.lore;
const CANON=DATA.lex.canon;
function renderLex(){const E=ctx.izE||{},I=ctx.izani||{placed:{},info:[]};const esc2=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let h=`<p>The speech of the Izan, from your friends\u2019 <em>The Izani Tongue</em>. Every inscription and sign below is written in the Izani alphabet somewhere in the city. <strong>Show me</strong> flies you to one.</p><h3>Words on the walls</h3>`;
  for(const key of Object.keys(E)){const where=I.placed[key];if(!where||!where.length)continue;const e=E[key],inf=I.info[where[0]];
    h+=`<div class="entry"><img src="${IZ.thumb(key,46)}" alt="${esc2(e.lines.join(' / '))}"><div><span class="say">${esc2(e.lines.join(' · '))}</span>: ${esc2(e.means)}<br><span class="sub">${esc2(e.parts)} · ${esc2(inf.where)}${where.length>1?' (and '+(where.length-1)+' more)':''}</span></div><button data-show="${where[0]}">Show me</button></div>`;}
  h+=`<h3>Settled</h3>`+CANON.map(p=>`<p>${esc2(p)}</p>`).join('');
  h+=`<h3>Lore (draft)</h3><p class="sub">A placeholder until the geography, history and star maps of Iziz are settled.</p>`+LORE.map(p=>`<p>${esc2(p)}</p>`).join('');
  h+=`<h3>New words, built by the tongue\u2019s own rules</h3><p class="sub">Roots keep to (C)V(C) and the fifteen consonants and six vowels; everything else comes from the affixes -an, -eth, -ir, -i, -ak, -is, -or, -ren, doubling and compounding.</p><table><tr><th>Word</th><th></th><th>Meaning</th><th>Built from</th></tr>`+
    LEX_WORDS.map(w=>`<tr><td class="w">${esc2(w[0])}</td><td class="sub">${esc2(w[1])}</td><td>${esc2(w[2])}</td><td class="sub">${esc2(w[3])}</td></tr>`).join('')+`</table><p><button data-close="1">Close</button></p>`;
  lexEl.innerHTML=h;
  lexEl.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{const inf=I.info[+b.dataset.show];if(ctx.stopTour)ctx.stopTour();if(ctx.stopFollow)ctx.stopFollow();closePanels();setView(...inf.view);markView('');if(ctx.izCard)setTimeout(()=>{},0);});
  lexEl.querySelector('[data-close]').onclick=()=>{closePanels();izBtn.focus();};}
izBtn.onclick=()=>{renderLex();closePanels();openPanel(lexEl,vbtn,'button');};
// ---- a different city ----
newCityBtn.onclick=()=>{const n=1+Math.floor(Math.random()*2147483000);ctx.leaving=true;newCityBtn.textContent='Building…';location.href=cityURL(n);};
// photo: render a fresh frame and save it as a PNG
const phb=document.createElement('button');phb.textContent='Photo';phb.title='Save this view as a PNG';
phb.onclick=()=>{try{renderer.render(scene,camera);renderer.domElement.toBlob(bl=>{if(!bl)return;const a=document.createElement('a');const h=ctx.hour||0;
  a.href=URL.createObjectURL(bl);a.download=`iziz-${String(Math.floor(h)).padStart(2,'0')}${String(Math.floor(h%1*60)).padStart(2,'0')}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);},'image/png');}catch(e){report('photo',e);}};
ui.appendChild(phb);
