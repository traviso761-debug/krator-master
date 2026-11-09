// ================================================================= HOST — stage (STATION 2, THE WINDING LAKES: the map below is the station's; the rest as src/45)
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('eastabyss',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for the EASTERN ABYSS: everything a world provides that
// a biome does not. Renderer, lights, fog, the zoned basin terrain with
// terrainH(), the climate fields the biome asks for (wet / salt / upland /
// flow), the water (one plane at y=0 for the lake, the marsh pools and the
// basin reaches of both rivers, plus a ribbon for each river where it climbs
// the slope), the painted ground, the tick list, the error panel. A real
// world replaces this whole section with its own; the biome fragments never
// read anything from it except through BIO.host (see 88-host-build.js).
//
// THE MAP (x east, z south, origin at the lake's centre, R 3400):
//   x < -900        the SALT FLATS: bare crust; the west river crosses them
//   |x| < ~850      the SALT LAKE, elongated N-S, shallow shelves bright
//   900 .. 2250     the MARSH: lush, knee-trees, pools; the rain picks up eastward
//   2050 .. 3050    the slope rises: HYPERTROPIC JUNGLE
//   2900 .. 3400    the SAVANNAH on the shelf foot
// Both rivers reach the lake through a delta. Zone edges wobble with z.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE LAKE COLOUR. One hue (0 red .. .33 green .. .66 blue), set by the host
// before the biome loads: the water, the salt crust, the marsh accents, the
// lily pads, the moss tinge and the complementary blooms all derive from it.
var EASTABYSS_LAKE={hue:0.0};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc3cbc0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc4d2cc,0x4a4230,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- STATION 2, THE WINDING LAKES (PLAN-STATIONS.md, 2026-10-27)
// The abyss floor as the scale model has had it since 4.21 (tools/scale-model/edit_rivers.py ABYSS_LAKES): long, snaky lakes in
// the pits between sills, desert strips between them that the lakes' own rain greens at their shores. The site is the lake at
// px 1041,493 (one of ABYSS_LAKES' merged pair, 2 km a pixel: 60 km north-east of station 1); the shore, the sills and the old
// beds here are an ideal type of that ground, not the model's cells (PLAN-STATIONS.md A0: the survey on the live model is owed).
// THE MAP (x east, z south, R 3400): one lake winding north-south through the square, 0.5-1.1 km wide, its centre swinging
// ~700 m either side; from its shore, mat-reed shallows and marsh pools, the coal-swamp jungle on a band ~1.5 km wide, salt steppe,
// then the abyssal desert on the sills (~70 m over the water, 2.5-3.5 km back) with pale flats where an old arm of the lake dried.
// The kit reads only the four fields and terrainH, as at station 1: the gradient is the fields'. Noise from core/rand.
const TERR={R:3400};
const STATION_FAR={wall:false,lake:true};
// the budget: the spine runs down the lake through the jungle on both shores, so the heroes' radii are held to .45 of station 1's
// (the trees pass built 15.1 M triangles at 1: over its 8.2 M ceiling); read by 55 when it builds
var EASTABYSS_HEROK=.45;   /* 83-host-far.js: no abyss wall here (the nearest is 25 km off), the lake on in the far field */
const KN=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
const xc=z=>520*Math.sin(z*.00105+.4)+210*Math.sin(z*.0027+1.3);                 // the lake's centreline
const hw=z=>420+170*Math.sin(z*.0019+2)+60*Math.sin(z*.0051);                     // its half width
// signed distance-ish to the shore, metres: negative in the lake
function lakeIn(x,z){return Math.abs(x-xc(z))-hw(z)-60*KN(x,z,.004,301,2)*2;}
// the old beds: an arm of the lake west of it that dried, and a cut-off bend east, pale flats a metre over the water
const xo=z=>xc(z)-1650+320*Math.sin(z*.0013+.8),xo2=z=>xc(z)+1900+260*Math.sin(z*.0011+2.4);
function oldBed(x,z){return Math.max(smooth(300,90,Math.abs(x-xo(z))+40*KN(x,z,.006,302,2)*2)*smooth(3600,1800,Math.abs(z+400)),
 smooth(220,70,Math.abs(x-xo2(z))+40*KN(x,z,.006,303,2)*2)*smooth(1400,500,Math.abs(z-1300)));}
// no rivers: the lake fills from its ends (beyond the map) and the rain; the station keeps the names the shared host reads
function zE(x){return 1e9;}function zW(x){return 1e9;}
const MOUTH_E=[1e9,1e9],MOUTH_W=[1e9,1e9];
function riverD(x,z){return 1e9;}
function deltaK(x,z){return 0;}
// the climb from the shore to the sills (the far field's basin too)
function riseAt(x,z){const d=Math.max(0,lakeIn(x,z));return 72*smooth(700,3300,d)+10*KN(x,z,.0016,304,3)*2*smooth(500,1500,d);}
// zone weights (0..1 each) for the painter: the lake, the marsh, the jungle band, the steppe and desert (flat), no savannah
function zoneW(x,z){const lk=lakeIn(x,z),d=Math.max(0,lk),dry=smooth(-20,60,lk),ob=oldBed(x,z);
 return{lake:1-dry,flat:dry*Math.max(smooth(1100,2500,d),ob),marshW:0,marshE:dry*smooth(650,250,d)*(1-ob),
  jung:dry*smooth(150,450,d)*smooth(1600,1000,d)*(1-ob),sav:0,lk:lk};}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 const lk=lakeIn(x,z),d=Math.max(0,lk),ob=oldBed(x,z);
 let h=1.4+2.0*KN(x,z,.0008,305,3)*2+.8*KN(x,z,.0045,306,2)*2+riseAt(x,z);
 h+=5*KN(x,z,.0035,307,3)*2*smooth(1800,3000,d);                                        // dunes and swells on the sills
 const pool=KRAND.fbm(x*.0062,.5,z*.0062,2,308);h-=3.0*smooth(.40,.26,pool)*smooth(700,250,d)*(1-ob);   // the marsh pools by the shore
 h=mix(h,.7+.3*KN(x,z,.01,309,2),ob*smooth(0,400,d));                                 // an old bed: a flat pan a little over the water
 const inL=smooth(25,-15,lk),bed=-.5-1.4*smooth(0,-120,lk)-12*smooth(-120,-420,lk);
 return mix(h,Math.min(bed,-.3),inL);}
// the climate fields the biome asks for: the lake's rain greens the shore and dies out over ~2.5 km (the PLAN's ~1,500 mm
// beside the water to ~300 mm on the sills); the salt rises with the distance and is whole on the old beds
const FIELD={
 wet:(x,z)=>{const lk=lakeIn(x,z),d=Math.max(0,lk),ob=oldBed(x,z);let w=.96*smooth(2600,150,d)*(1-.7*ob);
  w=Math.max(w,.42*smooth(130,10,lk));if(lk<0)w=.9;return clamp(w,0,1);},
 salt:(x,z)=>{const lk=lakeIn(x,z),d=Math.max(0,lk);return clamp(Math.max(.08+.82*smooth(700,2800,d),.95*oldBed(x,z)),0,1);},
 upland:(x,z)=>{const d=Math.max(0,lakeIn(x,z));return clamp(.02+.16*smooth(0,250,d)*smooth(2000,800,d)*(1-oldBed(x,z)),0,1);},
 flow:(x,z)=>0};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:'eastabyss',THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z);return h<.12?0:h<.6?(h-.12)/.48:1;},   // nothing rooted under water
 obstacles:OBSTACLES,ticks:tick,seed:7,
 // the LOD spine: a row of origins along z=0 from the west marsh to the shelf
 origin:[-3200,-2400,-1600,-800,0,800,1600,2400,3200].map(z=>[xc(z),z]),center:[0,0],   /* the LOD spine down the lake */
 fields:FIELD,err:reportErr,
 register:REGISTER,eye:()=>[camera.position.x,camera.position.y,camera.position.z]});   // the fauna (75) registers its flocks and reads the viewer
BIO.setSun([-1200,900,-600]);
// THE GRAPHICS SET (2026-10-27, the final rebuild; core/biome README "Adopting it", nhighlands the worked example): the items'
// geometry welded and drawn by index (?index=0 the soup); one LOD mesh per chunk, small meshes merged to 1500 triangles, a dithered
// cross-fade over the last 15% of each range (?lodmerge=0, ?lodfade=0) and the per-instance range cull (?lodcull=0)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
// ---------------------------------------------------------------- the ground
// One mesh. Painted by zone from a coarse cache of the fields (the fields cost
// fbm calls; the 1536² canvas would otherwise take seconds), with a tiled
// detail texture multiplied in for the salt cracks and grain up close.
const LAKECOL=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.85,.45);
const FC=(function(){const N=384,S=TERR.R*2.2,a={wet:new Float32Array(N*N),salt:new Float32Array(N*N),up:new Float32Array(N*N),rd:new Float32Array(N*N),lk:new Float32Array(N*N),z:[]};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD.wet(x,z);a.salt[k]=FIELD.salt(x,z);a.up[k]=FIELD.upland(x,z);a.rd[k]=riverD(x,z);a.lk[k]=lakeIn(x,z);const W=zoneW(x,z);a.z.push([W.flat,Math.max(W.marshW,W.marshE),W.jung,W.sav]);}
 const at=(arr,x,z)=>{const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at,zone:(x,z)=>{const u=clamp(Math.round((x/S+.5)*(N-1)),0,N-1),v=clamp(Math.round((z/S+.5)*(N-1)),0,N-1);return a.z[v*N+u];}};})();
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const FLAT=new THREE.Color(0xe2ddd2),CRUST=new THREE.Color(0xf1ede6),MUD=new THREE.Color(0x3d3526),ALGA=new THREE.Color(0x4c5c36),LIT=new THREE.Color(0x3a3022),LITR=new THREE.Color(0x4a3628),
  SAV=new THREE.Color(0x8d7a48),SAV2=new THREE.Color(0x6c6a44),SAVG=new THREE.Color(0x5e6e3a),SILT=new THREE.Color(0x9a8c74),DELTA=new THREE.Color(0x574836),BED=new THREE.Color(0x8a6a5a);
 const crustT=CRUST.clone().lerp(LAKECOL,.10),flatT=FLAT.clone().lerp(LAKECOL,.05);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  const Z=FC.zone(wx,wz),salt=FC.at(FC.a.salt,wx,wz),wet=FC.at(FC.a.wet,wx,wz),rd=FC.at(FC.a.rd,wx,wz),lk=FC.at(FC.a.lk,wx,wz);
  // the basin colour by zone
  c.copy(MUD).lerp(ALGA,clamp(.5+n*1.6,0,1));                                   // marsh default
  c.lerp(flatT,Z[0]);                                                          // flats
  t.copy(LIT).lerp(LITR,clamp(.5+n*1.8,0,1));c.lerp(t,Z[2]);                  // jungle litter
  t.copy(SAV).lerp(SAV2,clamp(.5+n*1.7,0,1)).lerp(SAVG,smooth(.85,.6,FC.at(FC.a.up,wx,wz))*.6);c.lerp(t,Z[3]);   // savannah, greener where it meets the jungle
  c.lerp(crustT,salt*smooth(90,8,lk)*.9);                                      // the crust rim round the lake
  c.lerp(SILT,smooth(60,14,rd)*(1-wet*.5));c.lerp(DELTA,smooth(60,14,rd)*wet*.8);   // river banks: silt in the dry, dark mud in the wet
  c.lerp(BED,smooth(0,-30,lk));
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m; salt-pan cracks weighted per
// vertex by the salt field (aCrack), so the marsh mud and the savannah show none
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<16;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
const GLIB=(function(){if(typeof KGROUND==='undefined'||new URLSearchParams(location.search).get('kground')==='0')return null;
 const D=KGROUND.layer('eastabyss','groundDetail',{w:'1.0',amt:.85,gain:1.12,tint:'diffuseColor.rgb',lin:false}),K=KGROUND.layer('eastabyss','groundCrack',{w:'vCrack',amt:1,gain:1,tint:'diffuseColor.rgb',lin:false});
 return D&&K?[D,K]:null;})();
/* THE GROUND'S LIGHT PER PIXEL (2026-11-04, the ground catch-up; core/terrain/GROUND.md): on KGROUND the floor is MeshStandard, so the
   relief's bump and cavities reach the light (r128's Lambert lights per vertex, here on 19 m cells); ?kground=0 keeps the Lambert;
   ?kgrelief=0 drops the relief (the before-and-after on this page) */
const KG_RELIEF=!!GLIB&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const MAT_GROUND=GLIB?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x9a9890,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;')
  .replace('#include <map_fragment>',GLIB?'#include <map_fragment>\n/*KGROUND*/':'#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack);}');};
// THE GROUND'S LAYERS ON core/terrain's ground shader (KGROUND, 43-core-ground.js; 2026-10-27, the final rebuild): the library's
// grain (groundDetail) and the salt pan's cracks (groundCrack, weighted per vertex by the salt field) hex-tiled, scaled with
// distance and blended by height, multiplied over the paint with the strengths the page's own mix had (tint: the paint under
// it). Without the pack (or with ?kground=0) the page's own mix above, as before
if(typeof KGROUND!=="undefined")KGROUND.hook(MAT_GROUND,{key:'eastabyss-ground',layers:GLIB||[],
 relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: the floor is flat */
(function(){const N=400,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,ck=new Float32Array(p.count);for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));ck[i]=smooth(.3,.8,FC.at(FC.a.salt,p.getX(i),p.getZ(i)));}
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='The basin floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// The lake, the marsh pools and the rivers are core/water's (89w-host-water.js, from 2026-10-20; before, one plane at y=0 with a vertex colour by
// depth and salinity, and a ribbon for the east river's climb). The lake colour is EASTABYSS_LAKE (50-species): swap the hue there and everything follows.
const WATER_SHALLOW=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.80,.47),WATER_MID=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.82,.33),WATER_DEEP=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.70,.13),WATER_PALE=new THREE.Color().setHSL(EASTABYSS_LAKE.hue+.02,.50,.70);
const RIVER_COL=new THREE.Color().setHSL((EASTABYSS_LAKE.hue+.5)%1,.42,.30),POOL_COL=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.55,.30).lerp(new THREE.Color(0x4a4a30),.35);
// The water itself is core/water's now (89w-host-water.js: WATER.open for the lake and the marsh pools, WATER.flow for the rivers); this file keeps the
// colours (WATER_*, RIVER_COL, POOL_COL), which that fragment hands to the water, and the geometry (lakeIn, zE, zW, riverD, zoneW) above.
