// ---------- Deep Sky: three ways a star ends ----------
// Original work. Three real objects, one at a time, each at the middle of the starship page's turntable
// (src/starship/page.js); the buttons (or #object=) switch between them and fly to each one's view:
//   blackhole  M87*, the black hole at the centre of the galaxy M87, the first ever imaged (blackhole.js): light
//              traced along its bent paths in a shader, so the disk shows over and under the shadow, the photon
//              ring, the beaming that makes one side brighter, the jet, and the stars behind it lensed
//   pulsar     the Crab Pulsar (pulsar.js): a neutron star 20 km across turning 30 times a second, its magnetic
//              field tilted to its spin, its two beams sweeping; round it, far out and drawn far smaller than it
//              is, the Crab Nebula it powers
//   supernova  a core-collapse supernova (supernova.js): a red supergiant cut away to its shells, the iron core's
//              collapse, the bounce and the shock, the breakout, the ejecta going out into a remnant, on a loop
// Each module returns {group, view, ownSky, pick, active(on), hud(now)} and runs its own animation hooks while it is
// active. The kit here: a soft round texture, labels that stay on top, and a caption line at the foot of the screen.
import {blackHole} from './blackhole.js';
import {pulsar} from './pulsar.js';
import {supernova} from './supernova.js';

function makeKit(THREE){
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const glow=(col,s,op=1)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(s);sp.userData.noWire=true;return sp;};
  // a label: a dark plate with a gold edge, the same size on the screen however far off, drawn over everything
  function label(t){const c=document.createElement('canvas');c.width=640;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(10,12,18,0.84)';g.fillRect(0,0,640,64);
    g.fillStyle='#d8b030';g.fillRect(0,0,6,64);g.fillStyle='#eeeadc';g.font='26px Georgia, serif';g.textBaseline='middle';g.fillText(t,18,33,610);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,sizeAttenuation:false}));s.scale.set(0.3,0.03,1);s.center.set(0,0.5);s.renderOrder=10;s.userData.noWire=true;return s;}
  // the caption line: captions([[from, to, text], ...]) gives a function of time that shows the one due
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(680px,calc(100vw - 32px));padding:9px 14px;background:rgba(10,12,18,.86);color:#eeeadc;font:14px/1.45 Georgia,serif;border-left:3px solid #d8b030;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';cap.textContent='';};
  return {soft,glow,label,captions,hideCap};
}

export function model(api){
  const {THREE,C,scene}=api;
  const skyObjs=[...scene.children].filter(o=>o.isPoints||o.isGroup||o.isMesh);   // the page's star field and backdrop
  const kit=makeKit(THREE);
  const O={blackhole:blackHole(api,kit,C.blackhole||{}),pulsar:pulsar(api,kit,C.pulsar||{}),supernova:supernova(api,kit,C.supernova||{})};
  for(const o of Object.values(O))scene.add(o.group);
  let cur=null;
  function show(k,fly){if(!O[k])k='blackhole';if(cur===k&&!fly)return;cur=k;kit.hideCap();
    for(const [n,o] of Object.entries(O)){o.group.visible=n===k;o.active(n===k);}
    for(const s of skyObjs)s.visible=!O[k].ownSky;
    if(fly&&api.view)api.view(O[k].view);
    api.ctx.details=Object.assign(api.ctx.details||{},{object:k});}
  const m=/(^|[#&])object=([a-z]+)/.exec(location.hash);
  show(m?m[2]:(C.start||'blackhole'),false);
  // the page opens at view0: make that the object's own view, unless the address has a camera of its own
  if(m&&!/(^|[#&])(v|view)=/.test(location.hash))C.view0=O[cur].view;
  const buttons={'Black hole':()=>show('blackhole',true),'Pulsar':()=>show('pulsar',true),'Supernova':()=>show('supernova',true)};
  for(const o of Object.values(O))Object.assign(buttons,o.buttons||{});
  return {radius:C.radius||1000,minD:C.minD||8,
    get pick(){return O[cur].pick||[];},
    buttons,
    onView:(name,v)=>{if(v&&v.object)show(v.object,false);},
    hashExtra:()=>'object='+cur,
    hud:now=>O[cur].hud?O[cur].hud(now):''};
}
