// ================================================================= VERGE — stage ([web])
// Renderer, scene, camera, the error panel, the tick list and the inspector's registry; the climate fields the two
// biome kits zone themselves by, each read through the kit that is asking (BIO.kitName); the flora mask; BIO.init.
// The ground is 46, the water 47. Positions all come from 41-verge-layout (VG).
var SEDESERT_WATER={hue:0.47};          // the upper river's jade; the canyon reeds' accents follow it
var EASTABYSS_LAKE={hue:0.52};          // the salt lakes' turquoise; the abyss kit's accents and blooms follow it
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
const ERR=reportErr;                    // the Yuni-engine kit (YKIT) reports through ERR
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const FAST=!!navigator.webdriver||/[?&]fast/.test(location.search);   // the YKIT kit's shadows; headless runs skip them
const QS=new URLSearchParams(location.search);
const TICKS=[];
function tick(fn){TICKS.push(fn);}
// the inspector's registry: {name,cls,x,z,y,r,h,tags,rec}; cls: flora, fauna, building, place, water, terrain, life, path
const REG=[];function REGISTER(o){REG.push(o);return o;}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}
// the world clock (core/clock): motion time t and world time hour; the frame loop steps it
const CLOCK=KCLOCK.make({hour:QS.has('hour')?+QS.get('hour'):15.5,running:QS.get('time')==='run'});

const renderer=new THREE.WebGLRenderer({antialias:!FAST});renderer.setPixelRatio(Math.min(devicePixelRatio,FAST?1:1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const HAZE=new THREE.Color(0xd8c4a8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000082);   // thin enough to see the salt lakes 10 km east from the lip
scene.background=HAZE.clone();
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,1.0,60000);
const hemiLight=new THREE.HemisphereLight(0xc8d4e4,0x6a4030,.58);scene.add(hemiLight);
const ambLight=new THREE.AmbientLight(0x6a5a4a,.0);scene.add(ambLight);
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xd8b8a0,.22);fill.position.set(900,300,900);scene.add(fill);
const SUNV=[-1000,1150,-560];

// ---------------------------------------------------------------- the climate fields
// Two kits read the same field names with different meanings (biomes/WORLD.md: a steep border), so every field is
// asked through the kit that is asking. The upper kit (sedesert) owns the plateau and the canyon; the lower kit
// (eastabyss) owns the abyss floor and the foot of the spur; the cliffs between are rock.
const {clamp,mix,smooth}=VG;
const {TAU,rng,rr,fbm}=BIO.fn;   // the vendored sky (82) paints with the biome core's stream and noise
function upperFields(x,z,h,slope){
 const L=VG.lipX(z),east=x>L-4,dz=Math.abs(z-VG.canZ(x)),hw=VG.canHW(x);
 const canyon=east?0:dz<=hw?1:dz>=hw+VG.CAN_WALL?0:1-smooth(0,1,(dz-hw)/VG.CAN_WALL);
 const rim=east?0:smooth(hw+VG.CAN_WALL,hw+VG.CAN_WALL+6,dz)*(1-smooth(hw+VG.CAN_WALL+30,hw+VG.CAN_WALL+60,dz));
 const dR=Math.abs(z-VG.rivUZ(x));
 const flow=east?0:clamp(smooth(20,6,dR),0,1)*(h-VG.WLU(x)<3.5?1:.4);
 // the linear oasis: the canyon floor is green for ~80 m either side of the river, thinning to scrub at the walls
 let wet=Math.max(.06,canyon*.42,.95*smooth(90,10,dR)*canyon);wet*=1-.3*slope;
 const bad=smooth(.6,.72,VG.fbm(x*.0011+9,z*.0011+4,2,51))*(1-canyon)*smooth(60,160,dz-hw);
 const mesa=clamp((VG.mesaH(x,z)-12)/30,0,1);
 const rock=clamp(Math.max(bad,smooth(.32,.62,slope)*.9),0,1);
 const dune=smooth(.66,.8,VG.fbm(x*.0007-3,z*.0007+8,2,77))*(1-canyon)*(1-mesa);
 return{wet:clamp(wet,0,1),flow,upland:mesa*.55,canyon,rim,rock,dune,oasis:0,slope,abyss:east?1:0,mtn:0,
  strata:smooth(.15,.6,rock),crack:0,salt:0,mist:0,cold:0};}
function lowerFields(x,z,h,slope){
 const L=VG.lipX(z),onFloor=x>L+VG.escW(z,x)-40,dp=Math.hypot(x-VG.POOL.x,z-VG.POOL.z);
 const n=VG.rivLNear(x,z),rd=n?n.d:1e4;
 const flow=Math.max(smooth(150,30,rd),smooth(140,50,dp)*.9);
 // the slope's own climb above the floor: the abyss kit's savannah on the spur's lower reach, nothing up the cliffs
 const upland=onFloor?clamp((h-6)/90,0,.25):clamp((h-6)/320,0,1);
 let wet=Math.max(.22,.96*smooth(95,22,rd),.94*smooth(180,50,dp));wet*=1-.35*slope;
 const ld=VG.lakeD(x,z);
 let salt=Math.max(smooth(2600,6200,x)*.8,smooth(1600,100,ld))*smooth(12,60,rd)*smooth(40,120,dp);
 salt=Math.max(salt,.35*smooth(.62,.75,VG.fbm(x*.0013,z*.0013,2,91))*smooth(400,900,rd));
 return{wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland,salt:clamp(salt,0,1),mist:0,cold:0,rock:smooth(.45,.7,slope),
  canyon:0,rim:0,dune:0,oasis:0,slope,abyss:0,mtn:0,strata:smooth(.35,.7,slope),crack:smooth(.3,.8,salt)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','mtn','strata','crack','salt','mist','cold'];
// a field cache over a box, at a fixed cell: the grids ask millions of times
function fieldCache(box,cell,fn){const nx=Math.round((box[1]-box[0])/cell)+1,nz=Math.round((box[3]-box[2])/cell)+1,a={};
 FNAMES.forEach(n=>a[n]=new Float32Array(nx*nz));const H=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=terrainH(box[0]+i*cell,box[2]+j*cell);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=box[0]+i*cell,z=box[2]+j*cell;
  const hx=H[j*nx+Math.min(nx-1,i+1)]-H[j*nx+Math.max(0,i-1)],hz=H[Math.min(nz-1,j+1)*nx+i]-H[Math.max(0,j-1)*nx+i];
  const slope=clamp(Math.hypot(hx,hz)/(2*cell)*1.6,0,1),F=fn(x,z,H[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const at=(arr,x,z)=>{const u=clamp((x-box[0])/cell,0,nx-1.001),v=clamp((z-box[2])/cell,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+nx]*(1-fu)*fv+arr[k+nx+1]*fu*fv;};
 const inside=(x,z)=>x>=box[0]&&x<=box[1]&&z>=box[2]&&z<=box[3];
 return{box,cell,nx,nz,a,H,at,inside};}
const FC_UP=fieldCache([-6400,-1200,-2000,2000],8,upperFields);
const FC_LO=fieldCache([-1500,6500,-2600,2600],10,lowerFields);
// a field as the kit asking for it reads it (and the paint, which asks by position: up = west of the lip)
const FIELD={};
// outside its cache a field is computed on the spot (the far ground's paint; no kit grows out there)
const _fOut={x:NaN,z:NaN,up:null,F:null};
function fieldFar(n,x,z,up){if(x!==_fOut.x||z!==_fOut.z||up!==_fOut.up){_fOut.x=x;_fOut.z=z;_fOut.up=up;_fOut.F=(up?upperFields:lowerFields)(x,z,terrainH(x,z),0);}return _fOut.F[n];}
FNAMES.forEach(n=>FIELD[n]=(x,z)=>{const up=BIO.kitName==='sedesert'||(BIO.kitName!=='eastabyss'&&x<VG.lipX(z)),C=up?FC_UP:FC_LO;
 return C.inside(x,z)?C.at(C.a[n],x,z):fieldFar(n,x,z,up);});
function fieldAt(n,x,z){const up=x<VG.lipX(z),C=up?FC_UP:FC_LO;return C.inside(x,z)?C.at(C.a[n],x,z):fieldFar(n,x,z,up);}

// ---------------------------------------------------------------- the flora mask (reserve before you build)
// 0 where nothing may root: under water, on the trail and its banks, on the cliffs (rock, not ground), and every
// reserved footprint: the cities' streets and plots, the rest stops, the funicular (VERGE_RESERVE, filled by the
// placement pass 70 before the biomes grow in 88). The upper kit grows west of the lip only, the lower kit east of the
// spur's foot and on the spur's lower reach.
const VERGE_RESERVE={grids:[]};          // the placement pass adds its occupancy grids here: {x0,z0,cell,nx,nz,occ (Uint8)}
function reserved(x,z){for(const g of VERGE_RESERVE.grids){const i=Math.floor((x-g.x0)/g.cell),j=Math.floor((z-g.z0)/g.cell);
 if(i>=0&&j>=0&&i<g.nx&&j<g.nz&&g.occ[j*g.nx+i])return true;}return false;}
function floraMask(x,z){
 const kit=BIO.kitName,L=VG.lipX(z);
 if(kit==='sedesert'&&x>L-3)return 0;
 if(kit==='eastabyss'){if(x<L+20)return 0;const u=(x-L)/VG.escW(z,x);if(u<.55)return 0;}
 const h=terrainH(x,z),d=h-waterH(x,z);if(d<.15)return 0;let w=d<.7?(d-.15)/.55:1;
 const C=x<L?FC_UP:FC_LO;if(C.inside(x,z)&&C.at(C.a.slope,x,z)>.88)return 0;
 const tn=VG.trailNear(x,z);if(tn&&tn.d<VG.TRAIL.bank+1.5)return 0;
 if(x<-2700&&x>-3700){const rp=VG.rampNear(x,z);if(rp&&rp.d<rp.R.bank)return 0;}
 if(VG.padAt(x,z))return 0;
 if(reserved(x,z))return 0;
 return w;}

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the canyon's river, the trail, the pool and the lower river
const SPINE=(function(){const S=[];for(let x=-5600;x<=-1450;x+=300)S.push([x,VG.rivUZ(x)]);for(let s=0;s<VG.TRAIL.len;s+=600){const p=VG.trailAt(s);S.push([p[0],p[1]]);}
 S.push([VG.POOL.x,VG.POOL.z]);for(let i=0;i<VG.RIVL.pts.length;i+=24){const p=VG.RIVL.pts[i];if(p[0]<4200)S.push([p[0],p[1]]);}return S;})();
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:floraMask,
 obstacles:OBSTACLES,ticks:tick,seed:73,origin:SPINE,center:[-2900,-120],fields:FIELD,
 register:o=>REGISTER(Object.assign({cls:'flora'},o)),err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],clock:()=>CLOCK.t,
 lod:{hero:650,mid:1300,far:2100,floor:[420,1000]},
 windows:{water:[-6400,-700,-1300,300]}});
BIO.setSun(SUNV);
// each kit grows over its own disc and its own water window (88 switches them before each kit's build)
const BIOME_ZONES={
 sedesert:{center:[-3000,-120],R:2300,windows:{water:[-6400,-700,-1300,300]}},
 eastabyss:{center:[1500,-120],R:2700,windows:{water:[-1000,-900,4600,700]}}};
