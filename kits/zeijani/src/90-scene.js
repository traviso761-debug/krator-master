// ================================================================= SCENE: renderer, the standard Krator sky, ground, layout, (re)building the world
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.autoClear=false;document.body.appendChild(renderer.domElement);
TEXANISO=Math.max(1,Math.min(8,renderer.capabilities.getMaxAnisotropy()||1));for(const k in ZJ_LIBTEX)for(const t of Object.values(ZJ_LIBTEX[k]))if(t)t.anisotropy=TEXANISO;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xd8c4a4,.0011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.15,9000);
/* the standard Krator sky (81-sky.js, vendored from Iziz) lives in its own scene drawn about the origin, so core/atmos's
   skylight can capture it into the environment map every standard material reflects (core/atmos/README.md) */
const skyScene=new THREE.Scene(),skyCam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,9000);
KratorSky.attach(skyScene,4200);
const SKY={hour:10.5,day:200,dens:1.6,night:false};
const qs=new URLSearchParams(location.search);if(qs.get('hour'))SKY.hour=+qs.get('hour');
const hemi=new THREE.HemisphereLight(0xffe6c8,0x7a5a3e,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-60;c.right=60;c.top=60;c.bottom=-60;c.near=10;c.far=700;}sun.shadow.bias=-.0005;sun.shadow.normalBias=.3;
const LIGHTDIR=new THREE.Vector3(.4,.7,.3).normalize();
function skyApply(){KratorSky.update(new THREE.Vector3(),SKY.hour,SKY.day,SKY.dens);const L=KratorSky.lighting();
 LIGHTDIR.copy(L.sunDir.y>.02?L.sunDir:new THREE.Vector3(.3,.6,-.4).normalize());sun.color.copy(L.sunColor||new THREE.Color(1,.95,.86));
 sun.intensity=L.sunDir.y>.02?L.sunIntensity*1.05:.05;hemi.intensity=.28+L.ambient*.75;scene.fog.color.copy(L.fog);}
skyApply();
// the ground: the library's packed earth, tiled in world metres (a flat placeholder for the kipuka, the lava, a well's floor)
const GROUND_SIZE=1600;
const groundMat=new THREE.MeshStandardMaterial({color:0x9a8a74,roughness:1});
{const L=KMAT.mode==='lib'?KMAT.packed('zeijani','earth'):null;
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});for(const t of [T.map,T.normalMap,T.roughnessMap])if(t)t.repeat.set(GROUND_SIZE/L.scale[0],GROUND_SIZE/L.scale[1]);
  groundMat.map=T.map;groundMat.normalMap=T.normalMap;groundMat.roughnessMap=T.roughnessMap;matHook(groundMat,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 else groundMat.color.setHex(0xa8916a);}
/* the cut-away opens the sheet's ground too, over every carved def (its plan runs below the ground), on the camera's side:
   uCutSites holds each one's footprint [cx, cz, half width, half depth] (filled after the layout, below) */
const ZJ_CUTSITES={value:[]};for(let i=0;i<16;i++)ZJ_CUTSITES.value.push(new THREE.Vector4(0,0,0,0));
/* every mass's footprint [x0, x1, z0, z1]: the ground is never drawn under a block of rock (a carved floor at y 0 would fight it) */
const ZJ_MASSES={value:[]};for(let i=0;i<32;i++)ZJ_MASSES.value.push(new THREE.Vector4(0,0,0,0));
matHook(groundMat,'cutGround',sh=>{sh.uniforms.uCut=ANIMU.uCut;sh.uniforms.uCam=ANIMU.uCam;sh.uniforms.uCutSites=ZJ_CUTSITES;sh.uniforms.uMasses=ZJ_MASSES;
 sh.vertexShader='varying vec3 vGW;\n'+sh.vertexShader.replace('#include <project_vertex>','vGW=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');
 sh.fragmentShader='uniform float uCut;uniform vec3 uCam;uniform vec4 uCutSites[16];uniform vec4 uMasses[32];varying vec3 vGW;\n'+sh.fragmentShader.replace('void main() {',
  'void main() {\nfor(int i=0;i<32;i++){vec4 m=uMasses[i];if(m.y<=m.x)continue;if(vGW.x>m.x&&vGW.x<m.y&&vGW.z>m.z&&vGW.z<m.w)discard;}\nif(uCut>.5){for(int i=0;i<16;i++){vec4 q=uCutSites[i];if(q.z<=0.)continue;vec2 d=vGW.xz-q.xy;if(abs(d.x)<q.z&&abs(d.y)<q.w&&dot(d,uCam.xz-q.xy)>0.)discard;}}');});
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SIZE,GROUND_SIZE),groundMat);groundM.rotation.x=-PI/2;groundM.receiveShadow=true;groundM.userData.isGround=true;scene.add(groundM);
// ---------------------------------------------------------------- layout: rows by family, fronts (+z) toward the camera
const SITES=[],ROWS=[];
const ONLY=qs.get('only');const ONLYSET=ONLY?new Set(ONLY.split(',')):null;   // ?only=key,key builds just those defs
const SITEKEY=k=>typeof k==='string'?{key:k,o:{v:0}}:{key:k.key,o:Object.assign({v:0},k.o||{})};
(function layout(){let z=0;const GAP=7;for(const F of FAMILIES){const keys=F.keys.map(SITEKEY).filter(k=>DEFS[k.key]&&(!ONLYSET||ONLYSET.has(k.key)));
 if(!keys.length)continue;const ws=keys.map(k=>DEFS[k.key].w+GAP),total=ws.reduce((a,c)=>a+c,0),dmax=Math.max(...keys.map(k=>DEFS[k.key].d)),hmax=Math.max(...keys.map(k=>DEFS[k.key].h));
 z-=dmax/2;let x=-total/2;keys.forEach((k,i)=>{const D=DEFS[k.key],off=D.originFront?D.d/2:0;SITES.push({key:k.key,x:x+ws[i]/2,z:z+off,ry:0,o:k.o});x+=ws[i];});   /* a carved def's origin is its front's foot */
 ROWS.push({family:F.name,z,d:dmax,w:total,h:hmax,keys:keys.map(k=>k.key)});z-=dmax/2+Math.max(16,hmax*.8)+6;}})();   // rows run north (-z) from the first
{let n=0;for(const S of SITES){const D=DEFS[S.key];if(!D.originFront||n>=16)continue;ZJ_CUTSITES.value[n++].set(S.x,S.z-D.d/2,D.w/2,D.d/2);}}
// ---------------------------------------------------------------- (re)build the world
let WORLD=null;
function buildWorld(){if(WORLD){scene.remove(WORLD);WORLD.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 WORLD=new THREE.Group();scene.add(WORLD);GB={};GTARGET=GB;REG.length=0;ZJ_LIFE.length=0;halosReset();SMOKES=[];GSTAT.tris=0;SBS.length=0;SB=null;resetCM();if(!ZJTAGS)zjTagsReset();   /* 91f-furnish.js wraps this and starts the registry */
 KWALK.clear();cvNew();CULT.cur=CULT.packs.zeijani||CULT.cur;   /* the walk registry and the cavern start empty: the carved defs' plans fill them as they are placed */
 const t0=performance.now();
 for(const S of SITES)place(S.key,S.x,S.z,S.ry||0,S.o);
 flushBuckets(GB,WORLD,true);
 cvFinish(WORLD);cvGroundWalk(-GROUND_SIZE/2,GROUND_SIZE/2,-GROUND_SIZE/2,GROUND_SIZE/2);
 window._build={ms:Math.round(performance.now()-t0),tris:Math.round(GSTAT.tris),sites:SITES.length,records:REG.length,halos:HALOS.length,life:ZJ_LIFE.length,cavern:CV_STATS,walk:{floors:KWALK.floors.length,blocks:KWALK.blocks.length}};return WORLD;}
// views: an opening, an overview, a shot per row, an eye-level shot per site, and for each tent a look inside (cut-away)
function autoViews(){const V={};const R=ROWS;if(!R.length)return {Origin:[0,30,60,0,0,0]};const last=R[R.length-1];
 V['Opening']=[R[0].w*.18,14,R[0].z+R[0].d*.5+30,0,3,R[0].z];
 V['Overview']=[-140,120,R[0].z+120,0,0,(R[0].z+last.z)/2];
 for(const r of R){const dist=Math.max(36,Math.min(r.w*.55,170),(r.h||0)*1.8);V[r.family]=[r.w*.1,Math.max(14,dist*.42),r.z+r.d/2+dist,0,Math.min(2+(r.h||0)*.3,12),r.z];}
 for(const S of SITES){const D=DEFS[S.key];const nm=D.name+(S.o.v?' (variant '+S.o.v+')':'');const dist=Math.max(7,Math.max(D.w,D.h)*.8+D.d*.35);
  const fz=S.z+(D.originFront?0:D.d/2);V[nm+' - eye level']=[S.x+D.w*.18,1.7,fz+dist*.6,S.x,Math.min(D.h,10)*.32,fz-(D.originFront?2:D.d/2)];
  if(D.cut)V[nm+' - inside (cut-away)']=[S.x+D.w*.12,Math.max(3.5,D.h*.75),S.z+D.d*.62+2,S.x,.6,S.z];}
 return V;}
/* the sky's light on the library materials: core/atmos's skylight captures skyScene into scene.environment */
const ATMOS_HOOKS=[];function atmosFrame(dt){for(const f of ATMOS_HOOKS)f(dt);}
ATMOS.init({THREE,scene,camera,hour:()=>SKY.hour,onFrame:fn=>ATMOS_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:4401,err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const ATMOS_GROUND=new THREE.Color();
ATMOS.skylight({renderer,sky:skyScene,scene,ground:()=>ATMOS_GROUND.copy(hemi.groundColor).multiplyScalar(hemi.intensity),key:()=>SKY.night?'n':'d'});
