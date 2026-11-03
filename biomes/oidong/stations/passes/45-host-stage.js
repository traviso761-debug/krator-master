// ================================================================= HOST — stage: STATION 2, THE HIGH PASSES (PLAN-STATIONS.md; 2026-11-03)
// The ideal-type host for the cold desert over the Oidong Valley: the valley's own stage (src/45-host-stage.js) with this land in place of the floor.
// The kit's fragments read it only through BIO.host, as they read the valley's.
//
// THE SITE (scale model 5.1, surveyed 2026-11-03): px 1212,1637 (old canvas 940,1307), the shelf on the valley's south wall 6 km south of Longsong and
// 3 km above it: 5,091 m, ET, 141 mm a year, mean -8 degC (warmest month +6, coldest -20, night low -30), 0.85 atm (1.6 atm x e^(-h/8 km)), 30 km relief
// 2.4 km; the wall falls north to the valley and rises south to 5.7-6.7 km. The pilgrims' road climbs from Longsong to it.
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600):
//   THE SHELF        a broad gravel plain at ~5,050 m, swelling and dipping, crossed west to east by the pilgrims' road
//   THE SADDLE       two knobs of shattered granite either side of the road (west and east); the pass between them, with its cairns
//   THE EDGE         the north: the shelf breaks and falls toward the valley, 3 km down and off the map
//   THE HEIGHTS      the south: scree and rock rising to the ranges, snow from ~6 km
//   THE TARN         a small meltwater pond in a hollow north of the road: the damp ground the sky poppies keep to
//   THE HOLLOWS      shallow frost hollows across the shelf: wetter, patterned ground (sorted stone polygons)
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THE PASSES: 0.85 atm and very dry, so a deep blue zenith, a hard white sun and sharp shadows; the haze thin and cold
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd6dde8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xcadcf0,0xa8a49c,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-1000,1100,-500);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const STATION_REGION='The high passes over the Oidong Valley (station 2, ideal type)';
const STATION_SKIP_KIT=true;   /* above the last tree: the valley's tree and floor passes do not run here (89z); OIDONG.buildHigh does (stations/passes/88-...) */
// the road: west to east across the shelf, through the saddle at x ~120
function roadZ(x){return 120+90*Math.sin(x*.0011+.4)+30*Math.sin(x*.0037+1.3);}
const KNOBS=[{x:-380,z:roadZ(-380)-520,r:430,h:190},{x:640,z:roadZ(640)+560,r:470,h:230}];   /* north-west and south-east of the road: it runs between them */
const TARN={x:260,z:roadZ(260)-430,r:52,name:'The tarn (meltwater)'};
const HOLLOWS=[{x:-1500,z:-200,r:260},{x:-300,z:-700,r:220},{x:1400,z:-450,r:300},{x:-1100,z:600,r:200},{x:300,z:-430,r:180}];
// the base: the shelf's plain, so the far field's colours and the probe read heights over it
function floor0(x){return 4300;}
const SNOW_LINE=[5150,5700];   /* snow that lies (89a): thin on the shelf in a snowfall, deeper up the heights */
function landH(x,z){
 let h=5050+38*(fbm(x*.0007+3,z*.0007-1,17,3)-.5)+9*(fbm(x*.004,z*.004+5,19,2)-.5);
 // the edge: the shelf breaks north of z -1300 and falls toward the valley (off the map, the far field carries it 3 km down)
 const zn=Math.max(0,-z-1250-180*(fbm(x*.0015,3.3,23,2)-.5));h-=1100*Math.pow(zn/1500,1.45)+40*Math.min(1,zn/200)*(fbm(x*.01,z*.01,29,2)-.5);
 // the heights: rising south of z 1100 in scree and rock toward the ranges
 const zs=Math.max(0,z-1050-200*(fbm(x*.0013,7.1,31,2)-.5)),zk=Math.min(1,zs/400);h+=1250*Math.pow(zs/1500,1.3)+220*zk*(fbm(x*.003,z*.003,37,3)-.5)
  +zk*(60*Math.abs(Math.sin(x*.012+3*fbm(x*.004,z*.004,39,2)))+30*(fbm(x*.02,z*.01,47,2)-.5));   /* the heights' spurs and gullies, so the face is not one sheet */
 // the saddle's knobs: shattered granite domes either side of the road
 for(const K of KNOBS){const d=Math.hypot(x-K.x,z-K.z)/(K.r*(1+.15*(fbm(x*.004+K.x,z*.004,41,2)-.5)));if(d<1.6)h+=K.h*Math.pow(smooth(1.5,0,d),1.6)+14*smooth(1.4,.3,d)*(fbm(x*.03,z*.03,43,2)-.5);}
 // the frost hollows: shallow dishes a few metres deep
 for(const H of HOLLOWS){const d=Math.hypot(x-H.x,z-H.z)/H.r;if(d<1.3)h-=4.5*smooth(1.25,.2,d);}
 // the road: a worn track, a hand deep
 h-=.25*smooth(4,1,Math.abs(z-roadZ(x)));
 return h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);const d=Math.hypot(x-TARN.x,z-TARN.z);if(d<TARN.r*1.6)h-=3.5*smooth(TARN.r*1.5,TARN.r*.3,d);return h;}
{let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH0(TARN.x+Math.cos(a)*TARN.r*1.12,TARN.z+Math.sin(a)*TARN.r*1.12));}TARN.l=lo-.3;}
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.45)return TARN.l;return -1e9;}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    the cold, 0..1 over the station's own range (the shelf .7, the heights 1)
//   wet     the frost hollows and the tarn's margin (meltwater lies there), the lee under the heights' snow; the rest of the shelf dry
//   rock    the knobs' shattered granite, the steeps, the edge's break
//   flat    the patterned ground (sorted stone polygons) in the frost hollows' floors
function fieldsAt(x,z,h,slope){
 let hol=0;for(const H of HOLLOWS)hol=Math.max(hol,smooth(1.1,.3,Math.hypot(x-H.x,z-H.z)/H.r));
 const dt=Math.hypot(x-TARN.x,z-TARN.z)-TARN.r,tarn=smooth(60,0,dt);
 let knob=0;for(const K of KNOBS)knob=Math.max(knob,smooth(1.0,.45,Math.hypot(x-K.x,z-K.z)/K.r));
 const lee=smooth(1000,1400,z)*smooth(1900,1500,z);
 const rock=clamp(Math.max(smooth(.55,.85,slope),knob*.75,smooth(.4,.7,slope)*.5),0,1);
 const wet=clamp(.22+.45*hol+.55*tarn+.2*lee-.25*rock+.06*(fbm(x*.002,z*.002,131,2)-.5),0,1);
 return{wet,flow:0,upland:1,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.55+(h-4800)/1600,0,1),geo:0,barren:0,fog:0,mist:0,flat:hol*(1-rock)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
// the road's marks: cairns at the saddle and along the road, two prayer-stone walls the road parts round (the pilgrims keep them on their right)
const CAIRNS=[[110,roadZ(110)-6,2.2],[150,roadZ(150)+7,1.7],[90,roadZ(90)+9,1.4],[-1350,roadZ(-1350)+5,1.5],[1600,roadZ(1600)-6,1.6],[-2100,roadZ(-2100)+5,1.3],[2150,roadZ(2150)-5,1.4]];
const WALLS=[[[-420,roadZ(-420)+8],[-300,roadZ(-300)+8]],[[420,roadZ(420)-8],[560,roadZ(560)-8]]];
const OBSTACLES=CAIRNS.map(c=>({x:c[0],z:c[1],r:2})).concat(WALLS.map(w=>({x:(w[0][0]+w[1][0])/2,z:(w[0][1]+w[1][1])/2,r:Math.hypot(w[1][0]-w[0][0],w[1][1]-w[0][1])/2+2})));
const SPINE=[];
for(let x=-2300;x<=2300;x+=400)SPINE.push([x,roadZ(x)]);
SPINE.push([TARN.x,TARN.z],[KNOBS[0].x,KNOBS[0].z],[KNOBS[1].x,KNOBS[1].z]);HOLLOWS.forEach(H=>SPINE.push([H.x,H.z]));
// nothing roots in the tarn nor on the road
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;const m=d<.7?(d-.15)/.55:1;return m*smooth(1.2,2.6,Math.abs(z-roadZ(x)));}
const WBOX=[TARN.x-TARN.r*1.5,TARN.z-TARN.r*1.5,TARN.x+TARN.r*1.5,TARN.z+TARN.r*1.5];
BIO.init({tags:'oidong',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:23,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-1000,1100,-500]);
