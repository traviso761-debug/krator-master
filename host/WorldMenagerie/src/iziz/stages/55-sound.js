// ---------- sound: synthesised in the browser (no files); off until the Sound button is pressed ----------
const SND={ctx:null,on:false,vol:0.7,beds:{},t:0,crowd:0,crowdT:0,prevC:null,prevH:null,lastPeal:-1};
const sndBtn=document.createElement('button');sndBtn.textContent='Sound';sndBtn.setAttribute('aria-pressed','false');sndBtn.title='Wind, rain, water, crowds, bells and thunder';ui.appendChild(sndBtn);
function sndBuild(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  const ctx=SND.ctx=new AC(),R=mkRng(97);
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(ctx.destination);
  const master=SND.master=ctx.createGain();master.gain.value=0;master.connect(comp);
  // loopable noise: white, pink and brown, with the seam crossfaded away
  const noise=(kind,sec)=>{const f=Math.floor(ctx.sampleRate*0.08),n=Math.floor(ctx.sampleRate*sec)+f,raw=new Float32Array(n),rr2=mkRng(kind.length*31+7);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
    for(let i=0;i<n;i++){const w=rr2()*2-1;
      if(kind==='white')raw[i]=w*0.5;
      else if(kind==='pink'){b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.969*b2+w*0.153852;b3=0.8665*b3+w*0.3104856;b4=0.55*b4+w*0.5329522;b5=-0.7616*b5-w*0.016898;raw[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.09;b6=w*0.115926;}
      else{last=(last+0.02*w)/1.02;raw[i]=last*3.2;}}
    const m=n-f,b=ctx.createBuffer(1,m,ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<m;i++)d[i]=raw[i];for(let i=0;i<f;i++){const a=i/f;d[i]=raw[m+i]*(1-a)+raw[i]*a;}return b;};
  const NB=SND.noise={white:noise('white',5),pink:noise('pink',7),brown:noise('brown',9)};
  const biq=(type,f,Q)=>{const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;if(Q!==undefined)b.Q.value=Q;return b;};
  SND.biq=biq;
  // a looping bed: noise through filters into its own gain and panner
  const bed=(name,buf,chain)=>{const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;let node=src;for(const f of chain){node.connect(f);node=f;}
    const g=ctx.createGain();g.gain.value=0;const pn=ctx.createStereoPanner();node.connect(g);g.connect(pn);pn.connect(master);src.start(0,R()*buf.duration*0.9);
    return SND.beds[name]={g,pn,chain};};
  const lfo=(rate,depth,param,type)=>{const o=ctx.createOscillator();o.type=type||'sine';o.frequency.value=rate;const d=ctx.createGain();d.gain.value=depth;o.connect(d);d.connect(param);o.start();return o;};
  bed('wind',NB.pink,[biq('bandpass',420,0.6),biq('lowpass',1800)]);
  bed('rain',NB.white,[biq('highpass',700),biq('lowpass',7000)]);
  {const b=bed('drips',NB.white,[biq('bandpass',3200,1.5)]);const am=ctx.createGain();am.gain.value=0.5;b.g.disconnect();b.g.connect(am);am.connect(b.pn);lfo(7.3,0.5,am.gain,'square');}
  bed('falls',NB.brown,[biq('lowpass',1100),biq('peaking',260,0.8)]);SND.beds.falls.chain[1].gain.value=6;
  bed('fallsHi',NB.white,[biq('bandpass',2400,0.7)]);
  {const b=bed('sewer',NB.white,[biq('bandpass',2900,2.2)]);const am=ctx.createGain();am.gain.value=0.6;b.g.disconnect();b.g.connect(am);am.connect(b.pn);lfo(5.1,0.4,am.gain);lfo(1.3,0.2,am.gain);}
  for(const [k,f] of [['crowdA',480],['crowdB',1150],['crowdC',2350]])bed(k,NB.pink,[biq('bandpass',f,2.4)]);
  {const b=bed('march',NB.pink,[biq('bandpass',900,1.2)]);const am=ctx.createGain();am.gain.value=0.5;b.g.disconnect();b.g.connect(am);am.connect(b.pn);lfo(2.1,0.5,am.gain,'square');}
  {const b=bed('insects',NB.white,[biq('bandpass',5200,9)]);const am=ctx.createGain();am.gain.value=0.5;b.g.disconnect();b.g.connect(am);am.connect(b.pn);lfo(19,0.5,am.gain);lfo(0.23,0.3,am.gain);}
  {bed('gate',NB.brown,[biq('lowpass',140)]);const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=38;const lp=biq('lowpass',95);o.connect(lp);lp.connect(SND.beds.gate.g);o.start();}
  // fixed places that make sound
  SND.gates=GATES.map(g=>{const R=wallR(g);return [R*Math.cos(g),PLATEAU+6,R*Math.sin(g)];}).concat(PGATES.map(pg=>{const R=62+3*Math.sin(5*pg),x=PALACE.x+R*Math.cos(pg),z=PALACE.z+R*Math.sin(pg);return [x,terrainH(x,z)+4,z];}));
  const TS=ctx.templeStair;SND.temple=[TEMPLE.x,(TS?TS.y0+TS.top[1]:terrainH(TEMPLE.x,TEMPLE.z)+50)+8,TEMPLE.z];
  document.addEventListener('visibilitychange',()=>{if(!SND.ctx)return;if(document.hidden)SND.ctx.suspend();else if(SND.on)SND.ctx.resume();});
  ctx.onStrike=(x,y,z)=>{if(SND.on)thunder(x,y,z);};
  ctx.onFirework=(x,y,z)=>{if(SND.on)boom(x,y,z);};
  ctx.onClink=(x,y,z)=>{if(!SND.on)return;const s=sndAt(x,y,z,14);if(s.g<0.02)return;const ctx=SND.ctx,t=ctx.currentTime,pn=ctx.createStereoPanner();pn.pan.value=s.pan;pn.connect(SND.master);
    for(const [f,a] of [[1850,0.3],[2710,0.18],[4120,0.1]]){const o=ctx.createOscillator(),e=ctx.createGain();o.frequency.value=f*(0.98+Math.random()*0.04);e.gain.setValueAtTime(a*s.g,t);e.gain.exponentialRampToValueAtTime(0.0001,t+0.5);o.connect(e);e.connect(pn);o.start(t);o.stop(t+0.55);}};
  return true;}
function sndPan(x,z){const e=camera.matrixWorld.elements,rx=e[0],rz=e[2],dx=x-camera.position.x,dz=z-camera.position.z,d=Math.hypot(dx,dz)||1;return clamp((dx*rx+dz*rz)/(d*Math.hypot(rx,rz)||1),-1,1)*0.8;}
function sndAt(x,y,z,ref){const d=Math.hypot(x-camera.position.x,y-camera.position.y,z-camera.position.z);return {g:ref*ref/(ref*ref+d*d),pan:sndPan(x,z),d};}
function sndSet(name,level,pan){const b=SND.beds[name];if(!b)return;const t=SND.ctx.currentTime;b.g.gain.setTargetAtTime(Math.max(0,level),t,0.18);if(pan!==undefined)b.pn.pan.setTargetAtTime(pan,t,0.2);}
function thunder(x,y,z){const ctx=SND.ctx,R=Math.random;const s=sndAt(x,y,z,1),d=s.d,t=ctx.currentTime+Math.min(6,d/343);
  const pn=ctx.createStereoPanner();pn.pan.value=s.pan*0.6;pn.connect(SND.master);
  const peak=0.9*clamp(1100/d,0.35,1);
  const src=ctx.createBufferSource();src.buffer=SND.noise.brown;const lp=SND.biq('lowpass',900);lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(90,t+3);
  const e=ctx.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(peak,t+0.07);e.gain.setTargetAtTime(peak*0.55,t+0.12,0.35);e.gain.setTargetAtTime(0,t+1.4,1.3);
  src.connect(lp);lp.connect(e);e.connect(pn);src.start(t,R()*5);src.stop(t+8);
  const cr=ctx.createBufferSource();cr.buffer=SND.noise.white;const hp=SND.biq('highpass',1400);const ce=ctx.createGain();ce.gain.setValueAtTime(0,t);ce.gain.linearRampToValueAtTime(peak*0.35*clamp(700/d,0.2,1),t+0.02);ce.gain.exponentialRampToValueAtTime(0.0001,t+0.45);
  cr.connect(hp);hp.connect(ce);ce.connect(pn);cr.start(t,R()*4);cr.stop(t+0.6);}
function boom(x,y,z){const ctx=SND.ctx,s=sndAt(x,y,z,120),t=ctx.currentTime+Math.min(3,s.d/343),pn=ctx.createStereoPanner();pn.pan.value=s.pan;pn.connect(SND.master);
  const src=ctx.createBufferSource();src.buffer=SND.noise.brown;const lp=SND.biq('lowpass',260);const e=ctx.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(0.9*s.g+0.05,t+0.02);e.gain.exponentialRampToValueAtTime(0.0001,t+1.2);
  src.connect(lp);lp.connect(e);e.connect(pn);src.start(t,Math.random()*5);src.stop(t+1.3);
  const cr=ctx.createBufferSource();cr.buffer=SND.noise.white;const hp=SND.biq('highpass',2500);const ce=ctx.createGain();ce.gain.setValueAtTime(0,t+0.3);
  for(let k=0;k<12;k++){const tk=t+0.3+k*0.09+Math.random()*0.05;ce.gain.setValueAtTime(0.25*s.g,tk);ce.gain.setTargetAtTime(0,tk+0.01,0.02);}
  cr.connect(hp);hp.connect(ce);ce.connect(pn);cr.start(t,Math.random()*4);cr.stop(t+1.8);}
function bell(t,g,pan){const ctx=SND.ctx,pn=ctx.createStereoPanner();pn.pan.value=pan;pn.connect(SND.master);
  for(const [r,a,dec] of [[1,1,4.5],[2.0,0.5,3.2],[2.76,0.42,2.4],[4.07,0.24,1.6],[5.4,0.16,1.1]]){const o=ctx.createOscillator(),e=ctx.createGain();o.frequency.value=196*r;
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(a*g*0.3,t+0.008);e.gain.exponentialRampToValueAtTime(0.0001,t+dec);o.connect(e);e.connect(pn);o.start(t);o.stop(t+dec+0.1);}}
function chirp(g,pan){const ctx=SND.ctx,t=ctx.currentTime,R=Math.random,o=ctx.createOscillator(),e=ctx.createGain(),pn=ctx.createStereoPanner();const f=2400+R()*1800;
  o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(R()<0.5?1.35:0.75),t+0.09);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(0.1*g,t+0.01);e.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
  pn.pan.value=pan;o.connect(e);e.connect(pn);pn.connect(SND.master);o.start(t);o.stop(t+0.15);}
function sndToggle(force){const want=force===undefined?!SND.on:force;
  if(want&&!SND.ctx&&!sndBuild()){sndBtn.textContent='No sound here';return;}
  SND.on=want;sndBtn.setAttribute('aria-pressed',String(want));if(ctx.sndRefresh)ctx.sndRefresh();
  if(!SND.ctx)return;if(want&&SND.ctx.state!=='running')SND.ctx.resume();
  SND.master.gain.setTargetAtTime(want?SND.vol:0,SND.ctx.currentTime,0.25);}
sndBtn.onclick=()=>sndToggle();
ctx.snd=SND;ctx.sndToggle=sndToggle;
animHooks.push(now=>{if(!SND.on||!SND.ctx||now-SND.t<66)return;SND.t=now;
  const h=ctx.hour||0,rain=ENV.izRain.value,nf=nightF(h),cam=camera.position,T=now/1000;
  // wind: stronger up high and in the rain, in slow gusts
  const gust=0.65+0.35*Math.sin(T*0.37)*Math.sin(T*0.13+1);
  sndSet('wind',(0.08+0.22*clamp(cam.y/250,0,1)+0.12*rain+0.1*(ENV.izGust.value-1))*gust*(0.7+0.3*ENV.izGust.value),Math.sin(T*0.05)*0.3);SND.beds.wind.chain[0].frequency.setTargetAtTime(300+350*gust,SND.ctx.currentTime,0.4);
  sndSet('rain',0.42*rain);sndSet('drips',0.12*rain*clamp(1-cam.y/120,0,1));
  // water
  if(SEWER.riverFoot){const f=sndAt(...SEWER.riverFoot,55),l=sndAt(...SEWER.riverLip,40);sndSet('falls',0.9*f.g+0.3*l.g,f.pan);sndSet('fallsHi',0.35*f.g,f.pan);}
  if(SEWER.foot){const f=sndAt(...SEWER.foot,22);sndSet('sewer',0.5*f.g,f.pan);}
  // the crowd: how many townspeople are near the listener, murmuring in syllable-sized swells
  if(now-SND.crowdT>500){SND.crowdT=now;let sum=0,px=0,wsum=0;for(const a of (ctx.agents||[])){const d=Math.hypot(a.x-cam.x,(a.yo||meshH(a.x,a.z))-cam.y,a.z-cam.z);if(d>120)continue;const w=1/(1+(d/22)**2);sum+=w;px+=w*sndPan(a.x,a.z);wsum+=w;}
    SND.crowd=Math.min(1,sum/5)*(1-0.55*nf);SND.crowdPan=wsum?px/wsum:0;}
  for(const k of ['crowdA','crowdB','crowdC'])sndSet(k,SND.crowd*(0.18+0.22*Math.random())*(k==='crowdC'?0.6:1),SND.crowdPan);
  // marching feet: the nearest squad on the move
  {let best=null;for(const sq of ((ctx.patrol||{}).squads||[])){if(sq.guard&&!sq.active)continue;if(sq.wait>0||!sq.path)continue;const s=sndAt(sq.x,meshH(sq.x,sq.z)+1,sq.z,24);if(!best||s.g>best.g)best=s;}
   sndSet('march',best?0.45*best.g:0,best?best.pan:0);}
  // insects at night, loudest out over the jungle and near the ground
  {const pp=polar(cam.x,cam.z),out=smooth(0.7,1.15,pp.r/wallR(pp.t));sndSet('insects',0.2*nf*(1-rain)*(0.25+0.75*out)*(1-clamp((cam.y-40)/260,0,1)));}
  // gate doors while they move
  {const c=ctx.closedF?ctx.closedF(h):0,moving=SND.prevC!==null&&Math.abs(c-SND.prevC)>1e-4;SND.prevC=c;let best=null;for(const q of (SND.gates||[])){const s=sndAt(q[0],q[1],q[2],60);if(!best||s.g>best.g)best=s;}
   sndSet('gate',moving&&best?1.0*best.g:0,best?best.pan:0);}
  // temple bells: a peal of three at 06, 12, 18 and 00; a single stroke on other hours when days are long
  {const ph=SND.prevH;SND.prevH=h;if(ph!==null){const H=Math.floor(h);if(Math.floor(ph)!==H&&(h-ph+24)%24<1){const b=sndAt(...SND.temple,260),t0=SND.ctx.currentTime+0.05;
     if(H%6===0)for(let k=0;k<3;k++)bell(t0+k*1.5,b.g,b.pan);else if(DAY>=720)bell(t0,b.g*0.8,b.pan);}}}
  // birds by day near the flocks
  if(nf<0.4&&ctx.birds){for(const f of [...new Set(ctx.birds.map(b=>b.f))]){const s=sndAt(f.c[0],f.c[1],f.c[2],70);if(Math.random()<0.35*s.g)chirp(Math.min(1,s.g*2),s.pan);}}
});svName.addEventListener('keydown',e=>{if(e.key==='Enter')saveView();});
renderSaved();
// the Display panel
function group(label,opts,get,set,note){const g=document.createElement('div');g.className='grp';const l=document.createElement('div');l.className='lbl';l.textContent=label;const o=document.createElement('div');o.className='opts';o.setAttribute('role','group');o.setAttribute('aria-label',label);
  const btns=opts.map(([val,txt])=>{const bt=document.createElement('button');bt.textContent=txt;bt.onclick=()=>{set(val);refreshDisplay();};bt.dataset.val=val;o.appendChild(bt);return bt;});
  g.append(l,o);if(note){const n=document.createElement('div');n.className='note';n.textContent=note;g.appendChild(n);}dispEl.appendChild(g);
  return ()=>{for(const bt of btns)bt.setAttribute('aria-pressed',String(get()===bt.dataset.val));return btns;};}
const refreshers=[];
refreshers.push(group('Wireframe',[['off','Off'],['edges','Edges'],['triangles','Triangles']],()=>DISPLAY.wire,v=>{DISPLAY.wire=v;applyDisplay();}));
const underRefresh=group('Beneath the lines',[['solid','Solid'],['hidden','Hidden lines'],['xray','X-ray']],()=>DISPLAY.under,v=>{DISPLAY.under=v;applyDisplay();},'Hidden lines hides whatever is behind a surface; X-ray shows every line.');
refreshers.push(()=>{for(const bt of underRefresh())bt.disabled=DISPLAY.wire==='off';});
refreshers.push(group('Colour',[['textured','Textured'],['clay','Clay'],['districts','Districts']],()=>DISPLAY.colour,v=>{DISPLAY.colour=v;applyDisplay();}));
refreshers.push(group('Weather',[['auto','Auto'],['clear','Clear'],['rain','Rain'],['fog','Fog'],['dust','Dust'],['windy','Windy']],()=>WEATHER.mode,v=>{WEATHER.mode=v;}));
{const g=document.createElement('div');g.className='grp';const l=document.createElement('div');l.className='lbl';l.textContent='Show';const o=document.createElement('div');o.className='opts';
 const gb=document.createElement('button');gb.textContent='Grid';gb.onclick=()=>{if(ctx.gridBtn)ctx.gridBtn.onclick();refreshDisplay();};
 const lb=document.createElement('button');lb.textContent='Hide people and craft';lb.onclick=()=>{DISPLAY.life=!DISPLAY.life;applyDisplay();refreshDisplay();};
 const hb=document.createElement('button');hb.textContent='Hide interface (H)';hb.onclick=()=>toggleBare();
 const fb=document.createElement('button');fb.textContent='Festival tonight';fb.onclick=()=>{const F=ctx.fest,tot=ctx.totalHours||15,d=Math.floor(tot/24),h=tot-d*24,day=h<3?d-1:d;F.forceDay=F.forceDay===day?null:day;refreshDisplay();};
 o.append(gb,lb,fb,hb);g.append(l,o);dispEl.appendChild(g);
 refreshers.push(()=>{gb.setAttribute('aria-pressed',ctx.gridBtn?ctx.gridBtn.getAttribute('aria-pressed'):'false');lb.setAttribute('aria-pressed',String(!DISPLAY.life));const F=ctx.fest,tot=ctx.totalHours||15,d=Math.floor(tot/24),h=tot-d*24;fb.setAttribute('aria-pressed',String(F.forceDay===(h<3?d-1:d)));});}
const ST_KEY='iziz.settings';let settingsReady=false;
function saveSettings(){if(!settingsReady)return;try{localStorage.setItem(ST_KEY,JSON.stringify({wire:DISPLAY.wire,under:DISPLAY.under,colour:DISPLAY.colour,life:DISPLAY.life,weather:WEATHER.mode,day:DAY,vol:ctx.snd?ctx.snd.vol:0.7}));}catch(e){}}
function refreshDisplay(){saveSettings();for(const f of refreshers)f();const on=DISPLAY.wire!=='off'||DISPLAY.colour!=='textured'||!DISPLAY.life;dbtn.textContent=on?'Display •':'Display';}
{const g=document.createElement('div');g.className='grp';const l=document.createElement('div');l.className='lbl';l.textContent='Sound';const o=document.createElement('div');o.className='opts';
 const sb=document.createElement('button');sb.textContent='Sound';sb.onclick=()=>ctx.sndToggle();
 const vol=document.createElement('input');vol.type='range';vol.min='0';vol.max='1';vol.step='0.05';vol.value='0.7';vol.setAttribute('aria-label','Sound volume');vol.style.accentColor='#e07a2a';
 vol.addEventListener('input',()=>{const S=ctx.snd;S.vol=+vol.value;saveSettings();if(S.ctx&&S.on)S.master.gain.setTargetAtTime(S.vol,S.ctx.currentTime,0.1);});
 o.append(sb,vol);g.append(l,o);dispEl.appendChild(g);
 ctx.sndRefresh=()=>sb.setAttribute('aria-pressed',String(!!(ctx.snd&&ctx.snd.on)));refreshers.push(ctx.sndRefresh);}
refreshDisplay();
// district legend
{const lg=document.getElementById('legend');for(const k in DISTRICTS){const row=document.createElement('div');const sw=document.createElement('span');sw.style.background='#'+DISTRICTS[k][1].toString(16).padStart(6,'0');row.append(sw,DISTRICTS[k][0]);lg.appendChild(row);}
 const other=document.createElement('div');const sw=document.createElement('span');sw.style.background='#9d978e';other.append(sw,'Walls, landmarks, everything else');lg.appendChild(other);}
// hide the interface entirely (H); on touch screens a faint button brings it back
function toggleBare(){const bare=document.body.classList.toggle('bare');if(bare)closePanels();else dbtn.focus();}
document.getElementById('showui').onclick=()=>toggleBare();
el.addEventListener('pointerdown',()=>markView(''));el.addEventListener('wheel',()=>markView(''),{passive:true});addEventListener('keydown',e=>{if(!typingIn(e.target)&&'wasdqe'.includes(e.key.toLowerCase())&&e.key.length===1)markView('');});
setView(...VIEWS['Painting view'],true);markView('Painting view');applyDisplay();
// settings from the last visit (a link's own settings, read next, take precedence)
ctx.saveSettings=saveSettings;
try{const st=JSON.parse(localStorage.getItem(ST_KEY)||'null');if(st){for(const k of ['wire','under','colour'])if(HASH_OK[k].includes(st[k]))DISPLAY[k]=st[k];if(st.life===false)DISPLAY.life=false;
  if(HASH_OK.weather.includes(st.weather))WEATHER.mode=st.weather;if(HASH_OK.day.includes(String(st.day)))ctx.setDayLen(st.day);
  if(typeof st.vol==='number'&&st.vol>=0&&st.vol<=1){ctx.snd.vol=st.vol;const vi=dispEl.querySelector('input[type=range]');if(vi)vi.value=String(st.vol);}
  applyDisplay();}}catch(e){}
settingsReady=true;refreshDisplay();
if(readHash())markView('');
addEventListener('hashchange',()=>{if(location.hash!==lastHash&&readHash())markView('');});   // an edited or pasted address applies straight away
// the hint steps aside after a while, or as soon as someone starts moving around
{const hint=document.getElementById('hint');const hide=()=>hint.classList.add('gone');setTimeout(hide,12000);el.addEventListener('pointerdown',hide,{once:true});el.addEventListener('wheel',hide,{once:true,passive:true});addEventListener('keydown',hide,{once:true});}

installContextLoss(renderer);trackResize(renderer,camera,updatePx);   // the page shell (src/core/shell.js)
await stage('wire');
section('wire',()=>{if(!WIRE.built)buildWire();});   // the wireframe overlay is built now rather than on the first toggle
await stage('shaders');
section('shaders',()=>{   // every program compiles now, behind the loading text, instead of in the first visible frame; display-mode materials are warmed the same way
  const warm=new THREE.Group();warm.visible=false;const proto={side:THREE.FrontSide};
  for(const [kind,col] of [['clay',false],['clay',true],['gray',false],['gray',true],['dist',true]]){const m=clayFor(proto,kind,col);const im=new THREE.InstancedMesh(boxG,m,1);if(col)im.setColorAt(0,new THREE.Color(1,1,1));warm.add(im,new THREE.Mesh(boxG,m));}
  scene.add(warm);renderer.compile(scene,camera);renderer.render(scene,camera);scene.remove(warm);});
stage('done');ctx.timings=LOAD.times;ctx.loadMs=Math.round(performance.now()-LOAD.t0);if(/debug/.test(location.search))console.table(LOAD.times);
document.getElementById('loading').remove();
// shadow map: redraw only when the sun is up, and then when the view target moves or every other frame (casters that move are few and slow)
renderer.shadowMap.autoUpdate=false;const shadowAt=new THREE.Vector3(1e9,0,0);let shadowTick=0;
function shadowsDue(){if(sun.intensity<=0)return false;if(ctl.target.distanceToSquared(shadowAt)>0.25){shadowAt.copy(ctl.target);return true;}return (++shadowTick%3)===0;}
const DEBUG_HUD=/debug/.test(location.search);let fpsN=0,fpsT=performance.now();
// adaptive resolution (src/core/shell.js): drop the pixel ratio when frames run slow, creep back up when there is headroom
const RES=createAdaptiveRes(renderer,{cap:1.5,after:updatePx}),adaptRes=RES.tick;
ctx.res=RES;
runLoop(now=>{adaptRes(now);fpsN++;if(now-fpsT>1000){ctx.fps=fpsN;fpsN=0;fpsT=now;}runHooks(animHooks,now);stepFly(now);applyKeys();updateCam();if(shadowsDue())renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);});
