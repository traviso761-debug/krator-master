// ================================================================= HOST — stage: the rim slope (station 1)
// The ideal-type host for the ABYSSAL SAVANNAH (PLAN.md): renderer, lights, the rim slope's terrain and terrainH(), the
// climate fields the kits ask for (wet / salt / upland / flow / rock), the painted ground, the far country, the tick list,
// the error panel. A real world replaces this section with its own; the kits read it only through BIO.host.
//
// THE MAP (PLAN.md section 7; x east, up the slope; z south; y 0 is -600 m on the scale model): the eastern abyss's gentle
// east rim at px ~1026,350 (map 5.1; it was 1021 on 4.22), from the jungle's last terrace at the foot (west) up two risers and a caprock rim to the bench:
//   x < -2100      the FOOT (Am): the last of the jungle, y 0..40
//   x ~ -1500      the first RISER (70-135 m)
//   -1200 .. 300   the PARKLAND tread (Aw), y ~160-200, kopjes on it
//   x ~ 400 .. 900 the RIM: the caprock escarpment, ~265 m
//   x > 1100       the BENCH (BSh steppe), y ~460-500, a shallow PAN at (2350, 250)
//   three GULLIES from the bench to the foot, a seasonal stream in the middle one
// The model's 4 km cells give the grade (about 7%: the floor at -1,673 m, the bench at -46 m 18 km east); the risers,
// gullies and kopjes are the page's own detail on it (PLAN.md section 12, Q3). The terrain is KRAND's noise (core/rand),
// baked once to a 12.5 m grid that terrainH reads; nothing here draws from a random stream.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
// the eastern abyss's lake hue (its kit, read in place for the jungle at the foot, reads it before its species load):
// 0, the red of Locus's lake (PLAN.md section 12, Q9). The Vain fronds stay purple whatever it is.
var EASTABYSS_LAKE={hue:0.0};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too
// the station on the scale model (PLAN.md section 1): its pixel, the model's height of y 0, and the air there. MAP 5.1 (biomes/STATIONS-MAP-5.1.md,
// re-surveyed 2026-11-03): at px 1021 the climb had moved ~5 px east (-179 -> -1,062 m, Aw -> XV), so the site is px 1026 (-638 m, Aw, 1,239 mm,
// +30 degC on 5.1). The px is on the old canvas (1549 x 1393), as every kit's and the sky's frame are; the 5.1 canvas adds (272, 330)
const SITE={px:1026,py:350,y0abs:-600,model:'Krator Scale Model 5.1'};
const atmAt=y=>1.6*Math.exp(-(y+SITE.y0abs)/8000);   /* the model's pressure (atm0 1.6, scale 8 km) */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd2cdb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
const HEMI=new THREE.HemisphereLight(0xd4d8cc,0x5a4a36,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const sun=new THREE.DirectionalLight(0xfff0d0,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0a8,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the rim slope as functions (data: [G data] arithmetic on KRAND)
const SEED=10213503;                       /* the world seed of this station (named for px 1021, row 350 on 4.22: kept, so nothing placed moves) */
const KF=(x,z,o,salt)=>KRAND.fbm(x,z,0,o,SEED+salt);   /* [0,1] */
const TERR={X:3200,Z:2500,cell:12.5};
const CENTER=[0,0];
// the scarps run north-south and wander in plan: one warp of the across-slope coordinate by z
const warpZ=z=>230*(KF(z*.00072,3.1,2,11)-.5)*2+55*(KF(z*.0031,7.7,2,12)-.5)*2;
// the profile up the slope (metres above y 0) at the warped coordinate xs; the risers' shares sharpen into faces
function profile(xs){
 return 26*smooth(-3300,-2000,xs)
  +135*(.35*smooth(-1850,-1150,xs)+.65*smooth(-1620,-1360,xs))
  +22*smooth(-1200,600,xs)
  +265*(.30*smooth(250,1100,xs)+.70*smooth(560,770,xs))
  +30*smooth(1000,3200,xs)
  +170*smooth(3200,9500,xs)
  -460*(smooth(-3600,-10000,xs)+smooth(-10000,-22000,xs)+smooth(-22000,-30000,xs));}   /* the floor falling away west on 5.1's grade (the far country: -1,062 m
     10 km west at px 1021, -1,523 at px 1015, the lake shore near -1,980 m some 30 km west); 0 on the map (xs > -3,500), so nothing placed moves */
const RIM={face:[560,770],lip:770};       /* the caprock's face in xs; its lip */
// the GULLIES: z = zc(x) along the slope from their heads on the bench to the foot; depth and width grow where the slope is steep
const GULLY=[
 {name:'The north gully',z0:-1020,A:[170,60],k:[.00105,.0041],ph:[.4,2.2],D:20,W:46,head:1650,stream:false},
 {name:'The stream gully',z0:280,A:[210,70],k:[.00092,.0037],ph:[1.7,.3],D:30,W:62,head:2050,stream:true},
 {name:'The south gully',z0:1700,A:[150,55],k:[.0012,.0045],ph:[2.9,4.1],D:18,W:42,head:1450,stream:false}];
GULLY.forEach(G=>{G.zc=x=>G.z0+G.A[0]*Math.sin(x*G.k[0]+G.ph[0])+G.A[1]*Math.sin(x*G.k[1]+G.ph[1]);});
// the slope's steepness at xs (the profile's derivative over the bench's mean grade), 0 on the treads .. ~1 on the rim's face
const steepAt=xs=>clamp(Math.abs(profile(xs+20)-profile(xs-20))/40/.9,0,1);
function gullyCut(x,z,xs){let cut=0,near=1e9,which=-1;
 for(let i=0;i<GULLY.length;i++){const G=GULLY[i];if(x>G.head+200)continue;const d=Math.abs(z-G.zc(x));
  const st=steepAt(xs),fade=smooth(G.head+200,G.head-500,x),W=G.W*(.55+.9*st)*(.6+.4*fade),D=G.D*(.30+1.1*st)*fade;
  if(d<W){const t=1-d/W,c=D*(t*t*(3-2*t));if(c>cut){cut=c;}}
  if(d<near){near=d;which=i;}}
 return{cut,near,which};}
// the PAN: the bench's hollow (the model's at px 1029), a flat floor 14 m down
const PAN={c:[2350,250],r:560,floor:150};
const panK=(x,z)=>smooth(PAN.r,PAN.floor,Math.hypot(x-PAN.c[0],(z-PAN.c[1])*1.25));
// the KOPJES: granite tors on the treads, each a hill under its boulder pile (the pile is the kit's: ABSAV.build({kopjes}))
const KOPJES=(function(){const out=[],S=KRAND.stream(KRAND.hash(SEED,0x4b0f));
 for(let i=0;i<220&&out.length<30;i++){const x=S.range(-TERR.X+300,TERR.X-300),z=S.range(-TERR.Z+250,TERR.Z-250),r=S.range(26,46),h=S.range(7,22);
  const xs=x+warpZ(z);if(steepAt(xs)>.18)continue;                                   /* treads only */
  if(xs<-2000&&S.next()<.7)continue;                                                 /* few on the foot */
  if(Math.hypot(x-PAN.c[0],z-PAN.c[1])<PAN.r+80)continue;
  if(GULLY.some(G=>x<G.head+250&&Math.abs(z-G.zc(x))<G.W*2.2+r))continue;
  if(out.some(k=>Math.hypot(k.x-x,k.z-z)<k.r+r+120))continue;
  out.push({id:'kopje-'+out.length,x,z,r,h,seed:S.u32()});}
 return out;})();
const KOP_S=KSPACE.create({cell:100});KOPJES.forEach(k=>KOP_S.insert(k,k.x,k.z,k.r));
// the height, as arithmetic (the bake below samples it once)
function heightFn(x,z){const xs=x+warpZ(z);let h=profile(xs);
 const st=steepAt(xs),tread=1-st;
 h+=9*(KF(x*.0021,z*.0021,3,21)-.5)*2*tread+4*(KF(x*.0068,z*.0068,2,22)-.5)*2+1.4*(KF(x*.021,z*.021,2,23)-.5)*2;
 h+=14*st*(KF(x*.009,z*.004,2,24)-.5)*2;                                              /* the faces broken into buttresses and bays */
 h-=gullyCut(x,z,xs).cut;
 h-=14*panK(x,z);
 KOP_S.some(x,z,0,k=>{const d=Math.hypot(x-k.x,z-k.z);if(d<k.r)h+=k.h*Math.pow(1-d/k.r,1.35);return false;});
 return h;}
// ---------------------------------------------------------------- the bake: heights on a 12.5 m grid, the fields on 25 m
const HG=(function(){const c=TERR.cell,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,a=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=heightFn(-TERR.X+i*c,-TERR.Z+j*c);
 return{c,nx,nz,a};})();
function gridH(x,z){const u=clamp((x+TERR.X)/HG.c,0,HG.nx-1.0001),v=clamp((z+TERR.Z)/HG.c,0,HG.nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=HG.a,n=HG.nx;
 return a[j*n+i]*(1-fu)*(1-fv)+a[j*n+i+1]*fu*(1-fv)+a[(j+1)*n+i]*(1-fu)*fv+a[(j+1)*n+i+1]*fu*fv;}
const inMap=(x,z)=>Math.abs(x)<=TERR.X&&Math.abs(z)<=TERR.Z;
function terrainH(x,z){return inMap(x,z)?gridH(x,z):heightFn(x,z);}
// slope (rise over run) from the grid
function slopeAt(x,z){const e=TERR.cell;return Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);}
// the fields (PLAN.md section 4), cached on a 25 m grid: upland, wet, flow, rock, salt
const FC=(function(){const c=25,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,N=nx*nz;
 const a={up:new Float32Array(N),wet:new Float32Array(N),flow:new Float32Array(N),rock:new Float32Array(N),salt:new Float32Array(N),gd:new Float32Array(N)};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-TERR.X+i*c,z=-TERR.Z+j*c,k=j*nx+i,xs=x+warpZ(z),g=gullyCut(x,z,xs);
  const up=clamp(profile(xs)/480,0,1),fl=g.which>=0?smooth(GULLY[g.which].W*1.6,6,g.near)*smooth(GULLY[g.which].head+150,GULLY[g.which].head-350,x):0;
  const s=slopeAt(x,z),kop=KOP_S.some(x,z,0,K=>Math.hypot(x-K.x,z-K.z)<K.r*.8);
  a.up[k]=up;a.flow[k]=fl;a.gd[k]=g.near;
  a.wet[k]=clamp(mix(.88,.22,smooth(-2700,1300,xs))+.42*fl+.25*panK(x,z),0,1);   /* the rain wrung out at the foot (Am), 450-600 mm on the bench (BSh) */
  a.rock[k]=clamp(Math.max(smooth(.42,.85,s),kop?.85:0,smooth(RIM.face[0]+60,RIM.lip,xs)*smooth(RIM.lip+90,RIM.lip,xs)*.7),0,1);
  a.salt[k]=clamp(smooth(PAN.r*.9,PAN.floor,Math.hypot(x-PAN.c[0],(z-PAN.c[1])*1.25)),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x+TERR.X)/c,0,nx-1.0001),v=clamp((z+TERR.Z)/c,0,nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*nx+i]*(1-fu)*(1-fv)+arr[j*nx+i+1]*fu*(1-fv)+arr[(j+1)*nx+i]*(1-fu)*fv+arr[(j+1)*nx+i+1]*fu*fv;};
 return{c,nx,nz,a,at};})();
const FIELD={
 upland:(x,z)=>inMap(x,z)?FC.at(FC.a.up,x,z):clamp(profile(x+warpZ(z))/480,0,1),
 wet:(x,z)=>inMap(x,z)?FC.at(FC.a.wet,x,z):.4,
 flow:(x,z)=>inMap(x,z)?FC.at(FC.a.flow,x,z):0,
 rock:(x,z)=>inMap(x,z)?FC.at(FC.a.rock,x,z):0,
 salt:(x,z)=>inMap(x,z)?FC.at(FC.a.salt,x,z):0};
// ---------------------------------------------------------------- the water's levels (core/water draws them: 89w-host-water.js)
// the stream: the stream gully's line from its head down to the foot, at its bed (the lowest ground across the channel) plus
// a hand, never climbing downstream (a running minimum from the head); its pools at the foot; the pan's seasonal sheet
const STREAM=(function(){const G=GULLY.find(g=>g.stream),pts=[];let yc=1e9;
 for(let x=G.head-350;x>=-TERR.X+60;x-=12){const zc=G.zc(x);let lo=1e9;for(let o=-14;o<=14;o+=3.5)lo=Math.min(lo,terrainH(x,zc+o));
  yc=Math.min(yc,lo+.22);pts.push([x,zc,yc]);}
 return{gully:G,pts};})();
const POOLS=[{name:'The stream foot pools',x:-2780,z:STREAM.gully.zc(-2780),r:34},{name:'The stream foot pools',x:-2470,z:STREAM.gully.zc(-2470)+18,r:22}];
POOLS.forEach(P=>{let lo=1e9;for(let a=0;a<12;a++)lo=Math.min(lo,terrainH(P.x+Math.cos(a/12*TAU)*P.r*.6,P.z+Math.sin(a/12*TAU)*P.r*.6));P.level=lo+.15;});
const PAN_WATER={name:'The pan',x:PAN.c[0],z:PAN.c[1],r:240,level:terrainH(PAN.c[0],PAN.c[1])+.18};
function waterH(x,z){let w=-1e9;
 for(const P of POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r)w=Math.max(w,P.level);
 if(Math.hypot(x-PAN_WATER.x,(z-PAN_WATER.z)*1.25)<PAN_WATER.r)w=Math.max(w,PAN_WATER.level);
 const G=STREAM.gully;if(x<G.head-340&&x>-TERR.X&&Math.abs(z-G.zc(x))<4.5){const i=clamp(Math.round((G.head-350-x)/12),0,STREAM.pts.length-1);w=Math.max(w,STREAM.pts[i][2]);}
 return w;}
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: up the slope through the map's middle, and out along the rim and the bench
const SPINE=[[-2800,0],[-2100,0],[-1400,0],[-700,100],[0,150],[700,0],[1400,0],[2100,200],[2800,0],[600,-1300],[600,1350]];
BIO.init({tags:'abyssal-savannah',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{const d=terrainH(x,z)-waterH(x,z);return d<.15?0:d<.6?(d-.15)/.45:1;},   // nothing roots under water
 obstacles:OBSTACLES,ticks:tick,seed:21,
 origin:SPINE,center:CENTER,lod:{hero:900,mid:1700,far:3200,floor:[480,1200]},
 fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],register:REGISTER,err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh on the 12.5 m grid (its vertices are the grid's, so a plant on terrainH stands on the drawn ground), painted by
// zone and burn age from the fields, with the library's soil and rock detail multiplied in (materials.json groundDetail,
// groundRock; procedural greys without the pack). Built by 80-host-ground.js once the kit is on the page (the paint reads ABSAV.burn).
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('abyssal-savannah',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,y/9,0,2,77)-.5)*40+(KRAND.h3(x,y,9,78)-.5)*22;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the ground's colour by zone; the burn mosaic is the kit's (ABSAV.burn, 55): read here when the kit is on the page
const GROUND={foot:0x4a3424,footG:0x4e4a2a,gold:0xb39552,gold2:0x9c8048,green:0x6e7a3a,char:0x2a241e,ash:0x8c8478,bench:0xb8a06a,bench2:0xa48e5c,
 rock:0x8a6a56,rock2:0x6e5446,salt:0xd8ccb0,saltO:0xc0a070,gully:0x5a4630,soil:0x9c6a54};
// THE CAPROCK'S BEDS (core/terrain 35, KSTRATA; BACKPORT.md's row, "strata on the bench's edge"): the rim's bedded red sandstone as KSTRATA's canyon
// column over the rim's 300 m, dipping gently east and warped, its colour taken into the ground's paint on the steep faces of the caprock band only
// (on the CPU, per vertex: no texture unit, the same beds Godot reads). ?strata=0 for the old paint
const STRATA=typeof KSTRATA!=='undefined'&&new URLSearchParams(location.search).get('strata')!=='0'?KSTRATA.create({seed:KRAND.hash(SEED,0x57a7),recipe:'canyon',range:[60,560],dip:[1,0,.004],warp:[7,2.2]}):null;
const strataK=(x,z,xs)=>smooth(RIM.face[0]-90,RIM.face[0]+10,xs)*smooth(RIM.lip+60,RIM.lip-10,xs);   /* the caprock band, in the warped coordinate */
function groundColour(x,z,c,t){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),sa=FIELD.salt(x,z);
 const n=KF(x*.011,z*.011,2,31)-.5,age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8;
 c.set(GROUND.gold).lerp(t.set(GROUND.gold2),clamp(.5+n*1.6,0,1));
 c.lerp(t.set(GROUND.green),age<=3?(age<=0?0:mix(.75,.25,(age-1)/2)):0);
 c.lerp(t.set(GROUND.bench).lerp(new THREE.Color(GROUND.bench2),clamp(.5+n*1.5,0,1)),smooth(.62,.82,up));
 c.lerp(t.set(GROUND.foot).lerp(new THREE.Color(GROUND.footG),clamp(.5+n*1.5,0,1)),smooth(.12,.03,up)*smooth(.55,.8,wet));
 if(age<=0)c.lerp(t.set(GROUND.char).lerp(new THREE.Color(GROUND.ash),clamp(.3+n*2,0,1)*.5),.85*(1-rk));
 c.lerp(t.set(GROUND.gully),fl*.65);
 c.lerp(t.set(GROUND.rock).lerp(new THREE.Color(GROUND.rock2),clamp(.5-n*1.8,0,1)),rk*.85);
 if(STRATA){const xs=x+warpZ(z),k=strataK(x,z,xs)*smooth(.25,.6,rk);if(k>0){const B=STRATA.at(x,terrainH(x,z),z),q=B.colour;c.lerp(t.setRGB(q[0],q[1],q[2]),k*.8);}}
 c.lerp(t.set(GROUND.saltO).lerp(new THREE.Color(GROUND.salt),smooth(.4,.95,sa)),sa*.9);
 return c;}
// THE LIBRARY LAYERS ON KGROUND (43-core-ground.js; BACKPORT.md's ground row, the final rebuild 2026-11-03): four surfaces hex-tiled, scaled with
// distance and blended by height over the paint, each on its documented mask (the review's first line), per vertex in aGL:
//   soil    aGL.x  the red soil: the gullies' beds (flow), the foot's wet trampled ground (wet over .6 below upland .15), off rock
//   burn    aGL.y  this year's burns (ABSAV.burn 0: the char and ash), off rock and the gallery (which does not burn)
//   salt    aGL.z  the pan (the salt field)
//   gravel  aGL.w  the bench's stony steppe (upland over .65, a macro patch ~400 m) and the talus apron under the caprock's lip
//   wet     aWet   the water's wet band: WATER.fieldAt's shore distance from the water the eye sees (89z), darkening the ground to the edge
// Standard under KGROUND (roughness high, as dry ground is) so the rain's gloss shows; ?kground=0 for the old floor (Lambert, the old mix)
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
function groundMasks(x,z,o){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),sa=FIELD.salt(x,z),xs=x+warpZ(z);
 const age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8,off=1-smooth(.35,.7,rk),pat=KF(x*.0025,z*.0025,2,51);
 o[0]=clamp(Math.max(smooth(.35,.75,fl),smooth(.55,.85,wet)*smooth(.16,.06,up)*smooth(.4,.62,pat)),0,1)*off;
 o[1]=(age<=0?1:0)*off*(1-smooth(.3,.6,fl));
 o[2]=smooth(.3,.85,sa);
 o[3]=clamp(Math.max(smooth(.65,.85,up)*smooth(.42,.62,pat)*(1-o[2]),smooth(RIM.lip+10,RIM.lip+40,xs)*smooth(RIM.lip+220,RIM.lip+120,xs)*.8),0,1)*(1-o[1]);
 return o;}
let GROUND_MESH=null,MAT_GROUND=null;
function buildGround(){const S=[2*TERR.X,2*TERR.Z],g=new THREE.PlaneGeometry(S[0],S[1],HG.nx-1,HG.nz-1);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),gl=new Float32Array(p.count*4),c=new THREE.Color(),t=new THREE.Color(),o=[0,0,0,0];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));groundColour(x,z,c,t);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  groundMasks(x,z,o);gl[i*4]=o[0];gl[i*4+1]=o[1];gl[i*4+2]=o[2];gl[i*4+3]=o[3];}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(p.count),1));   /* aWet: 89z fills it from the water's fields */
 g.computeVertexNormals();
 const m=USE_KG?new THREE.MeshStandardMaterial({vertexColors:true,color:0xb0aaa0,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({vertexColors:true,color:0xb0aaa0});
 m.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uRock={value:hostGroundLib('groundRock',TEX_DETAIL)};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRock;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;')
   .replace('#include <color_fragment>','#include <color_fragment>\n'+(USE_KG?'/*KGROUND*/\n':'')+'{vec3 dt=texture2D(uDetail,vGWP.xz*0.16).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'
    +'float st=smoothstep(0.86,0.62,abs(vGWN.y));vec2 ru=abs(vGWN.x)>abs(vGWN.z)?vGWP.zy:vGWP.xy;vec3 rk=texture2D(uRock,ru*0.11).rgb;'
    +'vec3 d=mix(dt*dt2*1.12,rk*1.05,st);diffuseColor.rgb*=mix(vec3(1.0),d,0.85*(1.0-0.55*max(max(vGL.x,vGL.y),max(vGL.z,vGL.w))));'
    +'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
 if(USE_KG)KGROUND.hook(m,{key:'absav-ground',at:'/*KGROUND*/',layers:[
  KGROUND.layer('abyssal-savannah','ground.soil',{w:'vGL.x',amt:.55,gain:1.1,tint:'diffuse',name:'red soil'}),
  KGROUND.layer('abyssal-savannah','ground.burn',{w:'vGL.y',amt:.75,gain:1.0,name:'this year\'s burn'}),
  KGROUND.layer('abyssal-savannah','ground.salt',{w:'vGL.z',amt:.7,gain:1.1,name:'the pan\'s salt'}),
  KGROUND.layer('abyssal-savannah','ground.gravel',{w:'vGL.w',amt:.5,gain:1.05,tint:'diffuse',name:'bench gravel'})]});
 MAT_GROUND=m;
 GROUND_MESH=new THREE.Mesh(g,m);GROUND_MESH.receiveShadow=true;GROUND_MESH.userData.probeSkip=true;GROUND_MESH.userData.inspectLabel='The rim slope';scene.add(GROUND_MESH);}
// ---------------------------------------------------------------- the far country (its config; the mesh is KFAR's: 80-host-ground.js)
// The country past the map, out to 36 km: the floor falling away west on 5.1's grade to the abyss's savanna belt (XV) and its lake (the level -2,331 m:
// 1.73 km under y 0; the water is core/water's), the rim running on north and south, the bench and the plateau rising east. Host-only.
const FAR={x0:-36000,x1:22000,z0:-30000,z1:30000,out:36000,lake:{level:-2331-SITE.y0abs,x:-36000,w:5200}};
function farH(x,z){let h=heightFn(x,z);
 const xs=x+warpZ(z);h+=28*(KF(x*.0005,z*.0005,3,41)-.5)*2*smooth(-4000,-9000,xs);   /* the floor's hummocks */
 h-=400*smooth(-29500,-31500,xs);                                                       /* the lake's bed, under its level (FAR.lake) */
 return h;}
