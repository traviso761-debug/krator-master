// ================================================================= HOST — stage: the scarp on KFIELD, the fields, the lungs' layout, BIO.init
// Everything a world provides that a biome does not: the renderer, the light, the terrain (terrainH), the local water (waterH: the wells), the
// climate fields the leaves read, the tick list, the error panel. A real world replaces this whole section; the kits read it only through BIO.host.
//
// THE LAND (PLAN.md section 6): the kit's own scarp is core/terrain's KRELIEF.scarp (SCARP.md: benches, ravines cut back into the rim, buttresses
// between, a talus foot, a rim lip), laid on the plateau's swells, and baked into a KFIELD with an inset on the face (8 m, against 16 m on the rest
// of the map), so the ground the page plants on is the ground an engine draws. STN (44-host-station.js) gives the numbers; y is the altitude.
//   THE PLATEAU      the paramo behind the lip, rising gently south, with two bog hollows
//   THE FACE         the Wall falling north from the lip through the cloud forest to the cloud sea (the deck at STN.deckY hides the floor)
//   THE LUNGS        LUNG.layout on the scarp's ravines and buttresses (41-biome-lung-data.js): their mouths on the lip, their wells dug as
//                    dishes beside them (the condensate's pool: core/water's karst spring, 89w), their lines kept clear of the trees (KSPACE)
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
/* a shader that fails to compile is only a console error in three.js: the panel shows it, so verify.py fails on it */
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   /* BIO.record: the volume as a core/tags record too */
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8d2d6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xb4c8e0,0x8a8a6a,.86));
const sun=new THREE.DirectionalLight(0xfff0dc,1.28);sun.position.set(-1000,900,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdce4ec,.26);fill.position.set(200,-120,-1000);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:STN.R};
const CLOUD_Y=STN.deckY;
const CLIP_Y=STN.clipY==null?CLOUD_Y:STN.clipY;   /* below this nothing is drawn (station 1: the deck hides the floor; the Bells: none) */
const rimZ=x=>{let z=STN.rim.z;for(const w of STN.rim.wander)z+=w[1]*Math.sin(x*w[0]+w[2]);return z;};
const RIMPTS=[];for(let x=-9600;x<=9600;x+=400)RIMPTS.push([x,rimZ(x)]);
const SCARP=(function(){const o=JSON.parse(JSON.stringify(STN.scarp)),L=19200;
 if(o.ravines&&o.ravines.every){o.ravines.n=Math.round(L/o.ravines.every);delete o.ravines.every;}
 return KRELIEF.scarp(Object.assign(o,{pts:RIMPTS,side:1,drop:true}));})();
const PL=STN.plateau;
function bogAt(x,z){let b=0;for(const B of PL.bogs){const d=Math.hypot(x-B.x,z-B.z)/(B.r*(1+.25*(KRAND.fbm(x*.004+B.x*.01,.5,z*.004,2,77)-.5)));b=Math.max(b,smooth(1,.35,d));}return b;}
function plateauH(x,z){return STN.rim.y+PL.rise*smooth(rimZ(x),rimZ(x)+2400,z)+PL.swell*2*(KRAND.fbm(x*.0011,.5,z*.0011,3,0x51)-.5)+8*(KRAND.fbm(x*.004,.5,z*.004,2,0x52)-.5)-9*bogAt(x,z);}
function landH(x,z){return KRELIEF.shape(SCARP,x,z,plateauH(x,z));}
// THE LUNGS' LAYOUT, on the land before the wells are dug (the wells are dug where the layout puts them)
const LUNG_L=LUNG.layout({scarp:SCARP,ground:landH,world:STN.lungs.world,n:STN.lungs.n,deckY:CLIP_Y,wind:STN.wind,clip:TERR.R-60,step:STN.lungs.step,yTop:STN.lungs.yTop,offMap:STN.rim.z>TERR.R*.9});
// THE WELLS: each mouth's pool dug as a dish (its level the lowest point of its rim less .2 m, the floor .8 m under it)
const WELLS=LUNG_L.mouths.map(M=>{const W=M.well;let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(W.x+Math.cos(a)*W.r*1.2,W.z+Math.sin(a)*W.r*1.2));}
 return {id:M.id,x:W.x,z:W.z,r:W.r,l:lo-.2,live:M.live,mouth:M};});
function terrainH0(x,z){let h=landH(x,z);
 for(let i=0;i<WELLS.length;i++){const P=WELLS[i],dx=x-P.x,dz=z-P.z;if(Math.abs(dx)>P.r*2.2||Math.abs(dz)>P.r*2.2)continue;const q=Math.hypot(dx,dz)/P.r;
  if(q<2.2)h=Math.min(h,q<1?P.l-.8*(1-q*q):P.l+.3*(q-1)*P.r);}
 return h;}
const S0=TERR.R*1.1;
const FIELDK=(function(){const zs=[];for(let x=-S0;x<=S0;x+=200)zs.push(rimZ(x));const z0=Math.min(...zs)-STN.scarp.run-260,z1=Math.max(...zs)+220;
 return KFIELD.bake(terrainH0,[-S0,-S0,S0,S0],16,{name:'clifflung '+STN.key,insets:[{box:[-S0,Math.max(-S0,z0),S0,Math.min(S0,z1)],step:8,name:'the face'}]});})();
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=FIELDK.h(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){for(let i=0;i<WELLS.length;i++){const P=WELLS[i];if(Math.abs(x-P.x)<P.r*1.1&&Math.abs(z-P.z)<P.r*1.1&&Math.hypot(x-P.x,z-P.z)<P.r*1.08)return P.l;}return -1e9;}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md), baked on one lattice and sampled through KFIELD
// wet, flow, rock, slope, cold, upland, oasis (the bogs), canyon (the ravines), rim, and the southern highlands' own:
//   fog    how often the ground stands in cloud, 0..1: ~1 on the face at the deck, falling with height above it, carried up the ravines
//   lawn   the breath's warmth on the ground downwind of a live mouth (the fall-out lawns): 1 in the lawn, 0 past its edge
//   lung   1 on a lung's line (the keep-clear; the lungs are the one thing that roots on the face)
const FOG_BAND=[2050,700];
function lawnAt(x,z){let k=0;for(const W of LUNG_L.lawns){const dx=x-W.x,dz=z-W.z,a=(dx*W.ax+dz*W.az)/(W.len*.5),b=(-dx*W.az+dz*W.ax)/(W.w*.5),q=Math.hypot(a,b);if(q<1.3)k=Math.max(k,smooth(1.15,.6,q));}return k;}
const LSP=KSPACE.create({cell:40});
LUNG_L.lungs.forEach(l=>l.pts.forEach(p=>LSP.insert({l,p},p[0],p[2],l.r+9)));
LUNG_L.mouths.forEach(M=>LSP.insert({m:M,p:[M.x,M.y,M.z]},M.x,M.z,M.collar+4));
LUNG_L.bells.forEach(B=>LSP.insert({b:B,p:[B.x,B.y,B.z]},B.x,B.z,B.r+4));
function lungNear(x,z,pad){return LSP.some(x,z,pad==null?0:pad,it=>{const r=it.l?it.l.r+9:it.m?it.m.collar+4:it.b.r+4;return Math.hypot(x-it.p[0],z-it.p[2])<r+(pad||0);});}
const SLOPEK=1.0;
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','lawn','lung'];
const FG=(function(){const N=400,S=TERR.R*2.2,st=S/(N-1),x0=-S/2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*st,z=x0+j*st,k=j*N+i,h=terrainH(x,z),nm=FIELDK.normal(x,z),slope=clamp(Math.hypot(nm[0],nm[2])/Math.max(.05,nm[1])*SLOPEK,0,1);
  const at=KRELIEF.at(SCARP,x,z),part=at?at.part:null,rav=part==='ravine'?1:0,bog=bogAt(x,z),face=at&&at.d>0&&at.d<SCARP.run?1:0;
  const above=h-CLOUD_Y,fog=clamp(smooth(FOG_BAND[0],FOG_BAND[1],above)*.95+rav*.45*smooth(FOG_BAND[0]+300,FOG_BAND[1]+300,above)+bog*.12+.08*(KRAND.fbm(x*.002,.5,z*.002,2,141)-.5),0,1);
  const rock=clamp(Math.max(KRELIEF.scarpRock(SCARP,x,z)*smooth(.5,.85,slope),smooth(.7,.95,slope)*.8),0,1),lw=lawnAt(x,z);
  const stream=rav*smooth(1,.2,at?at.share:1)*.8;
  a.wet[k]=clamp(.6+.3*fog+.3*bog+.25*lw+.06*(KRAND.fbm(x*.0015,.5,z*.0015,2,131)-.5)+.2*stream-.12*smooth(400,2400,z-rimZ(x)),0,1);
  a.flow[k]=Math.max(stream,bog*.6);a.upland[k]=clamp((h-1200)/2400,0,1);a.canyon[k]=rav;a.rim[k]=part==='rim'?1:0;a.rock[k]=rock;a.oasis[k]=bog;a.slope[k]=slope;
  a.cold[k]=clamp(.35+(h-1400)/3000-.25*lw,0,1);a.fog[k]=fog;a.lawn[k]=lw;a.lung[k]=lungNear(x,z)?1:0;a.barren[k]=face*smooth(.85,1,slope)*.5;}
 const G={};FNAMES.forEach(n=>{G[n]=KFIELD.create({x0,z0:x0,step:st,nx:N,nz:N,heights:a[n],name:n});});return G;})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FG[n].h(x,z));

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
/* the LOD spine: along the lip, down each lung, across the plateau */
const SPINE=[];
for(let x=-2200;x<=2200;x+=700)SPINE.push([x,rimZ(x)+60]);
LUNG_L.lungs.forEach(l=>{for(let i=0;i<l.pts.length;i+=30)SPINE.push([l.pts[i][0],l.pts[i][2]]);});
LUNG_L.lawns.forEach(W=>SPINE.push([W.x,W.z]));
PL.bogs.forEach(B=>SPINE.push([B.x,B.z]));
for(let x=-1800;x<=1800;x+=900)SPINE.push([x,rimZ(x)+1300]);
/* the mask: nothing roots in the water, under the cloud deck, on a lung's line, in a collar; the lawns' cores are the fall-out's own */
function rootMask(x,z){const h=terrainH(x,z);if(h<CLIP_Y-12)return 0;if(STN.rootRock!=null&&FIELD.rock(x,z)>STN.rootRock)return 0;
 /* THE CLIFF WEIGHT (the southern highlands' rule, PLAN.md section 7): nothing roots on a sheer face but a lung (the same weight SHIGH.zones computes) */
 if(smooth(.8,.95,FIELD.slope(x,z))*smooth(.3,.6,FIELD.rock(x,z))>.5)return 0;const d=h-waterH(x,z);if(d<.15)return 0;
 if(lungNear(x,z))return 0;const lw=FIELD.lawn(x,z);return (d<.7?(d-.15)/.55:1)*(1-.85*smooth(.4,.85,lw));}
BIO.init({tags:'clifflung',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:0x1A6,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]}});
/* the graphics set, as shighlands takes it: indexed items, merged LOD chunks with a dithered cross-fade, per-instance range culling */
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun([-1000,900,-700]);
