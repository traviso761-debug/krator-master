// ---------- weather: the sky over a real place, changing on its own or set by hand ----------
// A city with a `weather` block in its file gets it (the engine runs this after the page's extras, 06f-extras.js):
//   climate   which weather the place has and how often: a name from CLIMATES (`weights` overrides any of them)
//   cloudH    the cloud base, in metres on the map's own heights (over its datum): low cloud and fog bring it down
//   start     the state it opens in (clear); `first` s before it first changes, then each state lasts `change`
//             [min, max] s, and `ease` s to go from one to the next
//   labels    names for a state on this page (Atitlán's thunderstorm is the afternoon's aguacero)
// The states (ST) are sets of numbers that are eased between: how far in the fog is and how far you see in it, the
// light taken away, the cloud cover and how low it is, rain, snow, wind and lightning. They draw as:
//   the air      the engine's fog handle (api.fogEffect, 01-scene.js): one owner of the fog, so an event's haar and
//                the weather's never compound; the sky dome greys with it
//   the cloud    a deck of soft billboards (one instanced draw) wrapped round the camera, so it never ends; `cover`
//                shows more of them, lower and greyer; it is drawn in the water's mirror (waves.js)
//   rain, snow   streaks and flakes in a box round the camera, slanted by the wind; none over the cloud base
//   lightning    in a storm, a bolt to the ground a few km off and the light flickering up with it
//   wind         api.ctx.weather.wind: the lake's waves and boats (lake.js, waves.js) take the stronger of it and their own
// Control: the Weather button (every state this climate has, and "on its own"), or `weather=<state>` in the address,
// which holds it there. Nothing here is in the layout fingerprint, and a page opens clear, so the goldens do not move.
import {hash3} from './rng.js';

const ST={
  clear:  {label:'Clear',fog:0,vis:20000,dim:0,cover:0.12,low:0,rain:0,snow:0,wind:0.1,bolt:0,shade:0.75,colour:'#b8c4cc'},
  fair:   {label:'Fair, some cloud',fog:0,vis:20000,dim:0,cover:0.45,low:0,rain:0,snow:0,wind:0.2,bolt:0,shade:0.7,colour:'#b8c4cc'},
  haze:   {label:'Haze',fog:1,vis:5000,dim:0.18,cover:0.15,low:0,rain:0,snow:0,wind:0.05,bolt:0,shade:0.7,colour:'#c4b8a4'},
  cloud:  {label:'Overcast',fog:1,vis:9000,dim:0.5,cover:1,low:0.3,rain:0,snow:0,wind:0.3,bolt:0,shade:0.62,colour:'#9aa2aa'},
  drizzle:{label:'Drizzle',fog:1,vis:2600,dim:0.55,cover:1,low:0.6,rain:0.3,snow:0,wind:0.3,bolt:0,shade:0.58,colour:'#8e979e'},
  rain:   {label:'Rain',fog:1,vis:1800,dim:0.6,cover:1,low:0.5,rain:0.8,snow:0,wind:0.55,bolt:0,shade:0.5,colour:'#7e878e'},
  storm:  {label:'Thunderstorm',fog:1,vis:1100,dim:0.72,cover:1,low:0.4,rain:1,snow:0,wind:1,bolt:1,shade:0.32,colour:'#5e666e'},
  fog:    {label:'Fog',fog:1,vis:350,dim:0.35,cover:0.6,low:1,rain:0,snow:0,wind:0,bolt:0,shade:0.75,colour:'#c8ccd0'},
  mist:   {label:'Mist',fog:1,vis:1000,dim:0.18,cover:0.3,low:0.8,rain:0,snow:0,wind:0,bolt:0,shade:0.8,colour:'#d0d4d8'},
  snow:   {label:'Snow',fog:1,vis:900,dim:0.5,cover:1,low:0.6,rain:0,snow:1,wind:0.3,bolt:0,shade:0.65,colour:'#c8ced6'},
};
const NUM=['fog','vis','dim','cover','low','rain','snow','wind','bolt','shade'];
// how often each state comes round, by climate
export const CLIMATES={
  maritime:     {clear:1,fair:2,cloud:3,drizzle:3,rain:2,fog:2,storm:0.3},          // Edinburgh, Portland, the Olympic coast, Yachats
  continental:  {clear:3,fair:3,cloud:2,rain:2,storm:1,snow:1,fog:0.5},             // Chicago, New York
  subtropical:  {clear:3,fair:3,cloud:2,rain:2,storm:2,haze:1},                     // Fort Worth, Tokyo
  monsoon:      {clear:1,fair:2,haze:2,cloud:2,rain:2,storm:1.5},                   // Kowloon
  mediterranean:{clear:5,fair:3,haze:1,cloud:1,rain:1,storm:0.5},                   // Rome
  lagoon:       {clear:3,fair:2,cloud:2,rain:1,fog:2,mist:1,storm:0.5},             // Venice's nebbia
  basin:        {clear:2,fair:2,cloud:2,rain:1,fog:1.5,haze:1,snow:1},              // Sarajevo, under its inversions
  highland:     {clear:3,fair:3,cloud:1.5,rain:2,storm:1,haze:1,mist:1},            // Antigua, Atitlán: dry season and rains
  alpine:       {clear:4,fair:3,cloud:1.5,rain:1,storm:1,fog:1,snow:1},             // Crater Lake, Yellowstone
};

export function weather(api){
  const {THREE,C,scene,camera,animHooks,HASH0}=api;const K=C.weather;if(!K)return;
  const W=Object.assign({},CLIMATES[K.climate]||CLIMATES.maritime,K.weights||{}),NAMES=Object.keys(ST).filter(k=>W[k]>0);
  if(!NAMES.includes('clear'))NAMES.unshift('clear');
  const label=k=>(K.labels&&K.labels[k])||ST[k].label,BASE=K.cloudH==null?1300:K.cloudH;
  const hm=/(?:^|&)weather=([a-z]+)/.exec(HASH0||''),forced=hm&&ST[hm[1]]?hm[1]:null;
  let state=forced||(ST[K.start]?K.start:'clear'),auto=!forced&&K.auto!==false,nextAt=0,picks=0,t=0,last=performance.now();
  const cur={},col=new THREE.Color(ST[state].colour),tcol=new THREE.Color();for(const k of NUM)cur[k]=ST[state][k];
  const pick=()=>{let tot=0;for(const k of NAMES)if(k!==state)tot+=W[k];let r=hash3(picks++,71,(K.seed==null?5:K.seed))*tot;
    for(const k of NAMES){if(k===state)continue;r-=W[k];if(r<=0)return k;}return 'clear';};
  const span=()=>{const [a,b]=K.change||[240,600];return a+hash3(picks,72,6)*(b-a);};
  nextAt=K.first==null?90:K.first;
  const tag=o=>{o.userData.noFingerprint=true;o.userData.noShadow=true;o.userData.noWire=true;o.frustumCulled=false;scene.add(o);return o;};

  // ---- the cloud deck ----
  const N=K.clouds||110,BOX=K.box||18000,pl=new THREE.PlaneGeometry(1,1),cg=new THREE.InstancedBufferGeometry();
  cg.index=pl.index;cg.setAttribute('position',pl.attributes.position);cg.setAttribute('uv',pl.attributes.uv);cg.instanceCount=N;
  {const off=new Float32Array(N*3),sz=new Float32Array(N),rk=new Float32Array(N);
    for(let i=0;i<N;i++){off[i*3]=hash3(i,1,73);off[i*3+1]=(hash3(i,2,73)-0.3)*260;off[i*3+2]=hash3(i,3,73);sz[i]=900+hash3(i,4,73)*1700;rk[i]=hash3(i,5,73);}
    cg.setAttribute('aOff',new THREE.InstancedBufferAttribute(off,3));cg.setAttribute('aSz',new THREE.InstancedBufferAttribute(sz,1));cg.setAttribute('aRank',new THREE.InstancedBufferAttribute(rk,1));}
  const CU={uCam:{value:new THREE.Vector3()},uDrift:{value:new THREE.Vector2()},uBox:{value:BOX},uBase:{value:BASE},uLow:{value:0},uCover:{value:0},uCol:{value:new THREE.Color()},uDark:{value:new THREE.Color()},uFlash:{value:0}};
  const cloudM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),CU),
    vertexShader:`attribute vec3 aOff;attribute float aSz,aRank;uniform vec3 uCam;uniform vec2 uDrift;uniform float uBox,uBase,uLow,uCover;varying vec2 vU;varying float vA,vR;
#include <fog_pars_vertex>
void main(){vU=uv;vR=aRank;vec2 rel=mod(aOff.xz*uBox+uDrift-uCam.xz,uBox)-uBox*0.5;
  vec3 c=vec3(uCam.x+rel.x,uBase*(1.0-0.4*uLow)+aOff.y*(1.0-0.6*uLow),uCam.z+rel.y);
  vA=(1.0-smoothstep(uBox*0.3,uBox*0.5,length(rel)))*smoothstep(aRank-0.12,aRank,uCover);   // fades out before the box's edge, where it wraps
  float s=aSz*(0.65+0.6*uCover)*(1.0+0.6*uLow);vec4 mvPosition=viewMatrix*vec4(c,1.0);mvPosition.xy+=position.xy*vec2(s,s*0.5);
  gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform vec3 uCol,uDark;uniform float uFlash;varying vec2 vU;varying float vA,vR;
#include <common>
#include <fog_pars_fragment>
void main(){vec2 p=vU-0.5;float ph=vR*31.0,n=sin(p.x*11.0+ph)*0.5+sin(p.y*15.0-p.x*7.0+ph*1.7)*0.35+sin((p.x+p.y)*27.0+ph*2.3)*0.15;
  float r=length(p*vec2(1.0,1.15))+n*0.07,a=smoothstep(0.5,0.12,r)*vA;if(a<0.01)discard;
  gl_FragColor=vec4(mix(uDark,uCol,smoothstep(0.05,0.85,vU.y+n*0.1))+uFlash,a*0.92);
#include <fog_fragment>
}`});
  const clouds=tag(new THREE.Mesh(cg,cloudM));clouds.name='clouds';clouds.renderOrder=1;clouds.layers.enable(1);   // layer 1: drawn in the water's mirror

  // ---- rain: short slanted streaks; snow: flakes ----
  const NR=5000,rp=new Float32Array(NR*6),rs=new Float32Array(NR*3),rg=new THREE.BufferGeometry();for(let i=0;i<NR*3;i++)rs[i]=hash3(i,7,74);
  rg.setAttribute('position',new THREE.BufferAttribute(rp,3));
  const rainM=new THREE.LineBasicMaterial({color:0xaab4bc,transparent:true,opacity:0,depthWrite:false}),rain=tag(new THREE.LineSegments(rg,rainM));rain.visible=false;
  const NS=4000,sp=new Float32Array(NS*3),ss=new Float32Array(NS*3),sg=new THREE.BufferGeometry();for(let i=0;i<NS*3;i++)ss[i]=hash3(i,8,75);
  sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const flake=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=32;const c=cv.getContext('2d'),g=c.createRadialGradient(16,16,1,16,16,15);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32);return new THREE.CanvasTexture(cv);})();
  const snowM=new THREE.PointsMaterial({size:0.34,map:flake,transparent:true,depthWrite:false,opacity:0}),snow=tag(new THREE.Points(sg,snowM));snow.visible=false;

  // ---- lightning ----
  const bp=new Float32Array(16*3),bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
  const bolt=tag(new THREE.Line(bg,new THREE.LineBasicMaterial({color:0xf4f6ff,fog:false})));bolt.visible=false;
  let boltAt=0,nextBolt=0,strikes=0;
  const strike=now=>{const a=hash3(strikes,1,76)*6.283,d=1500+hash3(strikes,2,76)*4500,x=camera.position.x+Math.cos(a)*d,z=camera.position.z+Math.sin(a)*d,
      g=api.groundH?api.groundH(x,z):0,top=CU.uBase.value*(1-0.4*cur.low);
    for(let i=0;i<16;i++){const f=i/15,j=i&&i<15?1:0;bp.set([x+(hash3(strikes,i,77)-0.5)*90*j,top+(g-top)*f,z+(hash3(strikes,i,78)-0.5)*90*j],i*3);}
    bg.attributes.position.needsUpdate=true;bg.computeBoundingSphere();boltAt=now;strikes++;};
  const flash=now=>{const e=(now-boltAt)/1000;return e<0.06?1:e<0.11?0.2:e<0.2?0.85:e<0.45?0.85*(1-(e-0.2)/0.25):0;};

  // ---- the clock ----
  const fogC=new THREE.Color(),white=new THREE.Color(1,1,1),FL=new THREE.Color('#c8d0e0');let fe=null,acc=0,accSet=0;
  const O=api.ctx.weather={get state(){return state;},get auto(){return auto;},rain:0,snow:0,wind:cur.wind,cover:cur.cover,labels:Object.fromEntries(NAMES.map(k=>[k,label(k)])),
    set(k,hold=true){if(!ST[k])return;state=k;if(hold)auto=false;else nextAt=t+span();show();},setAuto(on){auto=!!on;if(auto)nextAt=t+30;show();}};
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000)*(api.ctx.evspeed||1);last=now;t+=dt;
    if(auto&&t>nextAt){state=pick();nextAt=t+span();show();}
    const S=ST[state],k=1-Math.exp(-dt/(K.ease||14));
    for(const n of NUM)cur[n]+=(S[n]-cur[n])*(n==='vis'&&cur.fog<0.02?1:k);col.lerp(tcol.set(S.colour),k);
    // the air
    if(cur.fog>0.01){if(!fe)fe=api.fogEffect&&api.fogEffect();if(fe){fe.amount=cur.fog;fe.visibility=cur.vis;fe.colour=col;fe.dim=cur.dim;}}
    else if(fe){fe.done();fe=null;}
    // the light of the hour, for the cloud and the rain
    const h=api.hour?api.hour():12,day=Math.max(0.12,Math.min(1,Math.sin(Math.PI*(h-6)/12)*1.5+0.15));
    fogC.copy(scene.fog?scene.fog.color:white);
    CU.uCam.value.copy(camera.position);CU.uDrift.value.x+=dt*(4+cur.wind*14);CU.uDrift.value.y+=dt*(1.5+cur.wind*5);
    CU.uCover.value=cur.cover;CU.uLow.value=cur.low;CU.uCol.value.copy(white).multiplyScalar(day).lerp(fogC,0.35);CU.uDark.value.copy(CU.uCol.value).multiplyScalar(cur.shade);
    // lightning
    let f=0;if(cur.bolt>0.5){if(t>nextBolt){strike(now);nextBolt=t+4+hash3(strikes,9,79)*10;}f=flash(now);}
    bolt.visible=f>0.5;CU.uFlash.value=f*0.35;
    if(f>0){if(api.ambient)api.ambient.intensity+=0.9*f;if(api.hemi)api.hemi.intensity+=0.5*f;if(scene.fog){scene.fog.color.lerp(FL,0.35*f);api.renderer&&api.renderer.setClearColor(scene.fog.color);}}
    // rain and snow, round the camera and under the cloud
    const p=camera.position,under=p.y<CU.uBase.value*(1-0.4*cur.low)+50,wx=cur.wind*2.2,wz=cur.wind*0.8;
    const nr=under?Math.floor(NR*cur.rain):0;rain.visible=nr>0;
    if(nr){const L=1.1+cur.rain*0.8;for(let i=0;i<nr;i++){const x=p.x+(rs[i*3]-0.5)*150,z=p.z+(rs[i*3+1]-0.5)*150,y=p.y+45-((rs[i*3+2]*90+t*(9+rs[i*3]*3))%90);rp.set([x,y,z,x+wx*L*0.12,y-L,z+wz*L*0.12],i*6);}
      rg.setDrawRange(0,nr*2);rg.attributes.position.needsUpdate=true;rainM.opacity=0.35+0.25*cur.rain;rainM.color.setRGB(0.68*day+0.1,0.72*day+0.1,0.76*day+0.1);}
    const ns=under?Math.floor(NS*cur.snow):0;snow.visible=ns>0;
    if(ns){for(let i=0;i<ns;i++){const fall=(ss[i*3+2]*60+t*(0.9+ss[i*3]*0.6))%60,x=p.x+(ss[i*3]-0.5)*110+Math.sin(t*0.7+i)*0.6+wx*fall*0.3,z=p.z+(ss[i*3+1]-0.5)*110+Math.cos(t*0.5+i*1.3)*0.6,y=p.y+30-fall;sp.set([x,y,z],i*3);}
      sg.setDrawRange(0,ns);sg.attributes.position.needsUpdate=true;snowM.opacity=0.9*Math.min(1,cur.snow*1.4);snowM.color.setScalar(Math.max(0.35,day));}
    // snow lying, where the ground knows how (Crater Lake's ground.js)
    const G=api.ctx.ground;if(G&&G.winter){acc=Math.max(0,Math.min(0.8,acc+(cur.snow>0.5?dt/240:-dt/900)));if(Math.abs(acc-accSet)>0.01||(acc===0&&accSet>0)){accSet=acc;G.winter(acc);}}
    O.rain=under?cur.rain:0;O.snow=cur.snow;O.wind=cur.wind;O.cover=cur.cover;});

  // ---- the control ----
  const btns={};let head=null;
  function show(){if(head)head.textContent='Now: '+label(state)+(auto?' (changing on its own)':' (held)');for(const [k,b] of Object.entries(btns))b.setAttribute('aria-pressed',String(k===state&&!auto));
    api.ctx.details=Object.assign(api.ctx.details||{},{weather:{climate:K.climate,state,auto}});}
  api.onUI&&api.onUI(({ui,mkBtn})=>{
    const panel=document.createElement('div');
    panel.style.cssText='position:fixed;right:10px;bottom:calc(var(--barh,44px) + 14px);z-index:11;display:none;flex-direction:column;gap:4px;background:rgba(8,14,22,.86);border:1px solid #4f6a80;padding:8px;font:12px Georgia,serif;color:#dfe8ef';
    head=document.createElement('div');panel.appendChild(head);
    for(const k of NAMES)btns[k]=mkBtn(label(k),panel,()=>O.set(k));
    mkBtn('Let it change on its own',panel,()=>O.setAuto(true));
    document.body.appendChild(panel);
    const b=mkBtn('Weather',ui,()=>{const o=panel.style.display==='none';panel.style.display=o?'flex':'none';b.setAttribute('aria-expanded',String(o));});
    b.setAttribute('aria-expanded','false');b.title='The weather: '+NAMES.map(label).join(', ');show();});
  show();
}
