// ---------- Deep Sky: the ways a star ends ----------
// Original work. Six real objects, one at a time, each at the middle of the starship page's turntable
// (src/starship/page.js). The Objects panel (or #object=) switches between them, flying out to a scale of distances
// and back in to the next:
//   blackhole   M87*, the first black hole imaged (blackhole.js): light traced along its bent paths in a shader
//   sgra        Sagittarius A*, the Milky Way's own (blackhole.js again, with sgra.js's S-stars on their orbits)
//   pulsar      the Crab Pulsar and, far out and drawn far smaller than it is, the Crab Nebula (pulsar.js)
//   supernova   a red supergiant's core collapse, from the cut-away star to the remnant, on a loop (supernova.js)
//   whitedwarf  the Sun's kind of ending: a white dwarf in its planetary nebula, the Ring Nebula (whitedwarf.js)
//   merger      two neutron stars' last orbits, the gravitational waves and the kilonova: GW170817 (merger.js)
// Each module returns {group, view, ownSky, pick, active(on), hud(now), buttons, rows()}. The kit here: a soft
// round texture, labels that stay on top, a caption line at the foot of the screen, a chart panel at the top right,
// and the sound (audio.js). An object's buttons show only while it is the one on screen.
import {blackHole} from './blackhole.js';
import {sgrA} from './sgra.js';
import {pulsar} from './pulsar.js';
import {supernova} from './supernova.js';
import {whiteDwarf} from './whitedwarf.js';
import {merger} from './merger.js';
import {makeAudio} from './audio.js';

function makeKit(THREE){
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const glow=(col,s,op=1)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(s);sp.userData.noWire=true;return sp;};
  // a label: a dark plate with a gold edge, the same size on the screen however far off, drawn over everything; as
  // wide as its words (a tenth of the screen's height high per 640 canvas pixels of plate)
  function label(t){const c=document.createElement('canvas');c.height=64;let g=c.getContext('2d');g.font='26px Georgia, serif';
    const w=Math.min(640,Math.ceil(g.measureText(t).width)+32);c.width=w;g=c.getContext('2d');g.fillStyle='rgba(10,12,18,0.84)';g.fillRect(0,0,w,64);
    g.fillStyle='#d8b030';g.fillRect(0,0,6,64);g.fillStyle='#eeeadc';g.font='26px Georgia, serif';g.textBaseline='middle';g.fillText(t,18,33,w-24);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,sizeAttenuation:false}));s.scale.set(0.3*w/640,0.03,1);s.center.set(0,0.5);s.renderOrder=10;s.userData.noWire=true;return s;}
  // the caption line: captions([[from, to, text], ...]) gives a function of time that shows the one due
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);width:max-content;max-width:min(680px,calc(100vw - 32px));box-sizing:border-box;padding:9px 14px;background:rgba(10,12,18,.86);color:#eeeadc;font:14px/1.45 Georgia,serif;border-left:3px solid #d8b030;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';cap.textContent='';};
  // the chart panel: one canvas, top right, under the readout; an object draws into it each frame while it shows
  const chartBox=document.createElement('div');
  chartBox.style.cssText='position:fixed;right:12px;top:52px;width:min(320px,calc(100vw - 32px));padding:8px 10px 6px;box-sizing:border-box;background:rgba(10,12,18,.86);border-left:3px solid #d8b030;color:#eeeadc;font:12px/1.4 Georgia,serif;display:none;z-index:7;pointer-events:none';
  const chartTitle=document.createElement('div'),chartCv=document.createElement('canvas'),chartNote=document.createElement('div');
  chartCv.width=600;chartCv.height=220;chartCv.style.cssText='width:100%;height:auto;display:block;margin:4px 0';chartNote.style.color='#b8b4a4';
  chartBox.append(chartTitle,chartCv,chartNote);document.body.appendChild(chartBox);
  const chart={g:chartCv.getContext('2d'),w:600,h:220,
    show(title,note){chartTitle.textContent=title;chartNote.textContent=note||'';chartBox.style.display='block';},
    note(t){if(chartNote.textContent!==t)chartNote.textContent=t;},
    hide(){chartBox.style.display='none';},
    // axes and a frame; returns the plot's box
    frame(xl,yl){const g=this.g,W=this.w,H=this.h;g.clearRect(0,0,W,H);g.strokeStyle='rgba(238,234,220,0.35)';g.lineWidth=2;g.beginPath();g.moveTo(40,8);g.lineTo(40,H-30);g.lineTo(W-6,H-30);g.stroke();
      g.fillStyle='#b8b4a4';g.font='20px Georgia, serif';g.fillText(xl,46,H-6);g.save();g.translate(24,H-34);g.rotate(-Math.PI/2);g.fillText(yl,0,0);g.restore();return {x0:40,x1:W-6,y0:H-30,y1:8};}};
  return {soft,glow,label,captions,hideCap,chart,audio:makeAudio()};
}

const ORDER=['blackhole','sgra','pulsar','supernova','whitedwarf','merger'];

export function model(api){
  const {THREE,C,scene,camera,animHooks}=api;
  const skyObjs=[...scene.children].filter(o=>o.isPoints||o.isGroup||o.isMesh);   // the page's star field and backdrop
  const kit=makeKit(THREE);
  const make={blackhole:()=>blackHole(api,kit,C.blackhole||{}),sgra:()=>sgrA(api,kit,C.sgra||{}),pulsar:()=>pulsar(api,kit,C.pulsar||{}),
    supernova:()=>supernova(api,kit,C.supernova||{}),whitedwarf:()=>whiteDwarf(api,kit,C.whitedwarf||{}),merger:()=>merger(api,kit,C.merger||{})};
  const O={};for(const k of ORDER){O[k]=make[k]();scene.add(O[k].group);}
  const meta=k=>(C.objects&&C.objects[k])||{name:k,distance:''};
  let cur=null;

  // ---- which buttons belong to whom ----
  const owner={};for(const k of ORDER)for(const b of Object.keys(O[k].buttons||{}))owner[b]=k;
  let btnEls=null;
  function syncButtons(){if(!btnEls){const all=[...document.querySelectorAll('#ui button')];if(!all.length)return;btnEls=[];
      for(const b of all)if(owner[b.textContent])btnEls.push([b,owner[b.textContent]]);}
    for(const [b,k] of btnEls)b.style.display=k===cur?'':'none';}

  function show(k){if(!O[k])k='blackhole';if(cur===k)return;cur=k;kit.hideCap();kit.chart.hide();
    for(const [n,o] of Object.entries(O)){o.group.visible=n===k;o.active(n===k);}
    for(const s of skyObjs)s.visible=!O[k].ownSky;
    syncButtons();markPanel();
    api.ctx.details=Object.assign(api.ctx.details||{},{object:k});}

  // ---- the Objects panel: styled as the Views panel is (deepsky.html) ----
  const panel=document.createElement('div');panel.id='objects';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Objects');document.body.appendChild(panel);
  {const h=document.createElement('div');h.className='sub';h.textContent='Objects, nearest first';h.style.gridColumn='1/-1';panel.appendChild(h);}
  const pbtn={};
  for(const k of [...ORDER].sort((a,b)=>(meta(a).ly||0)-(meta(b).ly||0))){const b=document.createElement('button');b.type='button';
    const m=meta(k);const t=document.createElement('div');t.textContent=m.name;const s=document.createElement('div');s.textContent=m.distance;s.style.cssText='font-size:12px;opacity:.75';b.append(t,s);
    b.onclick=()=>{panel.classList.remove('open');fly(k);};panel.appendChild(b);pbtn[k]=b;}
  function markPanel(){for(const [k,b] of Object.entries(pbtn))b.setAttribute('aria-current',String(k===cur));}

  // ---- flying between them ----
  // Out from where the camera is to sixty times as far, fading to black over a scale of distances from the Earth
  // (light years, each tenfold the same width), and in to the next object's own view.
  const veil=document.createElement('div');
  veil.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#eeeadc;font:15px Georgia,serif';
  const vName=document.createElement('div'),vDist=document.createElement('div'),vBar=document.createElement('canvas');
  vName.style.cssText='font-size:26px;letter-spacing:.06em;margin-bottom:6px';vDist.style.cssText='color:#d8b030;margin-bottom:14px';
  vBar.width=1200;vBar.height=150;vBar.style.cssText='width:min(720px,calc(100vw - 32px));height:auto';veil.append(vName,vDist,vBar);document.body.appendChild(veil);
  function drawBar(k){const g=vBar.getContext('2d'),W=1200,lo=1,hi=9.5,X=ly=>40+(Math.log10(ly)-lo)/(hi-lo)*(W-80);g.clearRect(0,0,W,150);
    g.strokeStyle='rgba(238,234,220,.5)';g.lineWidth=2;g.beginPath();g.moveTo(40,60);g.lineTo(W-40,60);g.stroke();g.font='20px Georgia, serif';g.fillStyle='#b8b4a4';g.textAlign='center';
    for(let e=1;e<=9;e++){const x=X(Math.pow(10,e));g.beginPath();g.moveTo(x,54);g.lineTo(x,66);g.stroke();g.fillText(e<3?Math.pow(10,e)+' ly':e<6?Math.pow(10,e-3)+' thousand':e<9?Math.pow(10,e-6)+' million':'1 billion',x,94);}
    for(const q of ORDER){const m=meta(q);if(!m.ly)continue;const x=X(m.ly),on=q===k;g.fillStyle=on?'#d8b030':'rgba(238,234,220,.6)';g.beginPath();g.arc(x,60,on?10:6,0,7);g.fill();
      if(on){g.font='22px Georgia, serif';g.fillText(m.short||m.name,x,32);}}
    g.fillStyle='#b8b4a4';g.textAlign='left';g.font='18px Georgia, serif';g.fillText('Earth',40,130);g.textAlign='right';g.fillText('light years from the Earth, each step ten times the last',W-40,130);}
  let tr=null;
  const ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  function fly(k){if(!O[k])return;if(k===cur){api.view(O[k].view);return;}
    const p=camera.position,d=p.length()||1;tr={t0:performance.now(),k,from:{az:Math.atan2(p.z,p.x),el:Math.asin(Math.max(-1,Math.min(1,p.y/d))),d},swapped:false};
    const m=meta(k);vName.textContent=m.name;vDist.textContent=m.distance;drawBar(k);}
  animHooks.push(now=>{if(!tr)return;const u=(now-tr.t0)/(C.flySecs||3.2)/1000;let fade;
    if(u<0.4){const e=ease(u/0.4);api.view({az:tr.from.az,el:tr.from.el,d:tr.from.d*Math.pow(60,e)});fade=e;}
    else{if(!tr.swapped){tr.swapped=true;show(tr.k);}const v=O[tr.k].view,e=ease((u-0.6)/0.4);api.view(Object.assign({},v,{d:v.d*Math.pow(60,1-e)}));fade=u<0.6?1:1-e;}
    veil.style.opacity=String(fade);if(u>=1){tr=null;veil.style.opacity='0';}});

  // ---- start ----
  const m=/(^|[#&])object=([a-z]+)/.exec(location.hash);
  show(m&&O[m[2]]?m[2]:(C.start||'blackhole'));
  // the page opens at view0: make that the object's own view, unless the address has a camera of its own
  if(m&&!/(^|[#&])(v|view)=/.test(location.hash))C.view0=O[cur].view;
  // first in the list, so it finds the buttons by their first labels before an object relabels one
  animHooks.unshift(()=>{if(!btnEls)syncButtons();});
  // #flyto=<object> flies there a second after the page opens (the tests use it to see the scale of distances)
  {const f=/(^|[#&])flyto=([a-z]+)/.exec(location.hash);if(f&&O[f[2]])setTimeout(()=>fly(f[2]),1000);}

  const buttons={'Objects':()=>{const o=!panel.classList.contains('open');panel.classList.toggle('open',o);
    const vp=document.getElementById('views');if(vp&&o)vp.classList.remove('open');}};
  for(const k of ORDER)Object.assign(buttons,O[k].buttons||{});
  return {radius:C.radius||1000,minD:C.minD||8,
    get pick(){return O[cur].pick||[];},
    buttons,
    onView:(name,v)=>{panel.classList.remove('open');if(v&&v.object)show(v.object);},
    hashExtra:()=>'object='+cur,
    // every object's numbers, whichever is showing, so a change to any of them moves the golden
    fingerprintRows:()=>{const rows=[];ORDER.forEach((k,i)=>{for(const r of (O[k].rows?O[k].rows():[]))rows.push(Object.assign({kind:k},r,{h:(r.h||0)+i*1e6}));});return rows;},
    hudOnly:now=>{const m=meta(cur);return (O[cur].hud?O[cur].hud(now):m.name)+(m.distance?' · '+m.distance:'');}};
}
