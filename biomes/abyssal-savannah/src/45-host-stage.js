// ================================================================= HOST — stage: the rim slope (station 1)
// The ideal-type host for the ABYSSAL SAVANNAH (PLAN.md): renderer, lights, the rim slope's terrain and terrainH(), the
// climate fields the kits ask for (wet / salt / upland / flow / rock), the painted ground, the far country, the tick list,
// the error panel. A real world replaces this section with its own; the kits read it only through BIO.host.
//
// THE MAP (PLAN.md section 7; x east, up the slope; z south; y 0 is -600 m on the scale model): the eastern abyss's gentle
// east rim at px ~1021,350, from the jungle's last terrace at the foot (west) up two risers and a caprock rim to the bench:
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
// the station on the scale model (PLAN.md section 1): its pixel, the model's height of y 0, and the air there
const SITE={px:1021,py:350,y0abs:-600,model:'Krator Scale Model 4.22'};
const atmAt=y=>1.6*Math.exp(-(y+SITE.y0abs)/8000);   /* the model's pressure (atm0 1.6, scale 8 km) */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd2cdb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
const HEMI=new THREE.HemisphereLight(0xd4d8cc,0x5a4a36,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const sun=new THREE.DirectionalLight(0xfff0d0,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0a8,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the rim slope as functions (data: [G data] arithmetic on KRAND)
const SEED=10213503;                       /* the world seed of this station (px 1021, row 350) */
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
  -1150*smooth(-3600,-9000,xs);}          /* the floor falling away west (the far country: the XV belt and the lake, 1.7 km down) */
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
// groundRock; procedural greys without the pack).
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('abyssal-savannah',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,y/9,0,2,77)-.5)*40+(KRAND.h3(x,y,9,78)-.5)*22;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the ground's colour by zone; the burn mosaic is the kit's (ABSAV.burn, 55): read here when the kit is on the page
const GROUND={foot:0x4a3424,footG:0x4e4a2a,gold:0xb39552,gold2:0x9c8048,green:0x6e7a3a,char:0x2a241e,ash:0x8c8478,bench:0xb8a06a,bench2:0xa48e5c,
 rock:0x8a6a56,rock2:0x6e5446,salt:0xd8ccb0,saltO:0xc0a070,gully:0x5a4630,soil:0x9c6a54};
function groundColour(x,z,c,t){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),sa=FIELD.salt(x,z);
 const n=KF(x*.011,z*.011,2,31)-.5,age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8;
 c.set(GROUND.gold).lerp(t.set(GROUND.gold2),clamp(.5+n*1.6,0,1));
 c.lerp(t.set(GROUND.green),age<=3?(age<=0?0:mix(.75,.25,(age-1)/2)):0);
 c.lerp(t.set(GROUND.bench).lerp(new THREE.Color(GROUND.bench2),clamp(.5+n*1.5,0,1)),smooth(.62,.82,up));
 c.lerp(t.set(GROUND.foot).lerp(new THREE.Color(GROUND.footG),clamp(.5+n*1.5,0,1)),smooth(.12,.03,up)*smooth(.55,.8,wet));
 if(age<=0)c.lerp(t.set(GROUND.char).lerp(new THREE.Color(GROUND.ash),clamp(.3+n*2,0,1)*.5),.85*(1-rk));
 c.lerp(t.set(GROUND.gully),fl*.65);
 c.lerp(t.set(GROUND.rock).lerp(new THREE.Color(GROUND.rock2),clamp(.5-n*1.8,0,1)),rk*.85);
 c.lerp(t.set(GROUND.saltO).lerp(new THREE.Color(GROUND.salt),smooth(.4,.95,sa)),sa*.9);
 return c;}
let GROUND_MESH=null;
function buildGround(){const S=[2*TERR.X,2*TERR.Z],g=new THREE.PlaneGeometry(S[0],S[1],HG.nx-1,HG.nz-1);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color(),t=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));groundColour(x,z,c,t);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const m=new THREE.MeshLambertMaterial({vertexColors:true,color:0xb0aaa0});
 m.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uRock={value:hostGroundLib('groundRock',TEX_DETAIL)};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRock;varying vec3 vGWP;varying vec3 vGWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.16).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'
    +'float st=smoothstep(0.86,0.62,abs(vGWN.y));vec2 ru=abs(vGWN.x)>abs(vGWN.z)?vGWP.zy:vGWP.xy;vec3 rk=texture2D(uRock,ru*0.11).rgb;'
    +'vec3 d=mix(dt*dt2*1.12,rk*1.05,st);diffuseColor.rgb*=mix(vec3(1.0),d,0.85);}');};
 GROUND_MESH=new THREE.Mesh(g,m);GROUND_MESH.userData.probeSkip=true;GROUND_MESH.userData.inspectLabel='The rim slope';scene.add(GROUND_MESH);}
// ---------------------------------------------------------------- the far country
// A coarse second terrain, 30 km across (100 m cells), carrying what the map's edge would cut off: the floor falling away
// west to the abyss's savanna belt and its lake (the level -2,331 m: 1.73 km under y 0; the water is core/water's), the
// rim running on north and south, the bench and the plateau rising east. Inside the map it is the fine mesh's ground,
// a few metres down, so the fine mesh always wins. Host-only.
const FAR={x0:-17000,x1:13000,z0:-15000,z1:15000,lake:{level:-2331-SITE.y0abs,x:-15500,w:5200}};
function farH(x,z){let h=heightFn(x,z);
 const xs=x+warpZ(z);h+=28*(KF(x*.0005,z*.0005,3,41)-.5)*2*smooth(-4000,-9000,xs);   /* the floor's hummocks */
 h-=680*smooth(-11800,-14500,xs);                                                       /* the lake's bed, under its level (FAR.lake) */
 return h;}
function buildFar(){const N=300,g=new THREE.PlaneGeometry(FAR.x1-FAR.x0,FAR.z1-FAR.z0,N,N);g.rotateX(-Math.PI/2);g.translate((FAR.x0+FAR.x1)/2,0,(FAR.z0+FAR.z1)/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color(),t=new THREE.Color();
 const JUN=new THREE.Color(0x24402a),JUN2=new THREE.Color(0x30502e),SAV=new THREE.Color(0x8e7c4a),SALT=new THREE.Color(0xc8bea8),STEP=new THREE.Color(0xa89464),PLAT=new THREE.Color(0x8a7656);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),inside=Math.abs(x)<TERR.X-30&&Math.abs(z)<TERR.Z-30;let y;
  if(inside){let lo=terrainH(x,z);const cs=100;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)lo=Math.min(lo,terrainH(x+a*cs*.5,z+b*cs*.5));y=lo-3;}else y=farH(x,z);p.setY(i,y);
  const xs=x+warpZ(z),n=KF(x*.0011,z*.0011,2,42)-.5;
  // the floor: jungle at the slope's foot and round the lake, the savanna belt between, salt patches; the rim's grass; the plateau
  c.copy(SAV).lerp(STEP,smooth(500,2500,xs)).lerp(PLAT,smooth(3500,9000,xs));
  c.lerp(JUN.clone().lerp(JUN2,clamp(.5+n*2,0,1)),smooth(-2000,-3400,xs)*smooth(-6200,-4600,xs));   /* the foot's jungle */
  c.lerp(SALT,smooth(.62,.7,KF(x*.0004,z*.0004,2,43))*smooth(-6500,-8000,xs)*smooth(-11500,-10000,xs)*.7);
  c.lerp(JUN.clone().lerp(JUN2,clamp(.5-n*2,0,1)),smooth(-10500,-12500,xs));          /* the lake's jungle */
  c.multiplyScalar(1+n*.14).convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const fm=new THREE.MeshLambertMaterial({vertexColors:true,color:0xa8a49c});
 const m=new THREE.Mesh(g,fm);m.userData.probeSkip=true;m.userData.inspectLabel='The far country (the abyss floor, the rim, the plateau)';scene.add(m);}
