// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('rift',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for THE RIFT: everything a world provides that a biome
// does not. Renderer, lights, fog, the Rift-floor terrain with terrainH(), the
// climate fields the biome asks for (wet / salt / upland / flow / mist), the
// water (one plane at y=0 for the algal lake and the last reach of the two
// streams), the painted ground, the tick list, the error panel. A real world
// replaces this whole section with its own; the biome fragments never read
// anything from it except through BIO.host (see 88-host-build.js).
//
// THE MAP (x east, z SOUTH, origin at the ridge's south foot, R 3200):
//   z > ~1900       the ALGAL SALT LAKE: a long E-W trough, its shore wobbling
//   600 .. 1900     the ABYSSAL JUNGLE north of the lake, two streams through it
//  -800 .. 600      the RIDGE: a 250-450 m massif, steep and benched on its
//                   south face (the cloud forest), narrow mesas and saddles on
//                   the crest (the Mediterranean peak), a gentler north slope
//   z < -800        the ABYSSAL SAVANNAH, up to the Rift's north wall (sky)
// East and west the valley runs on; the sky carries the far lakes and walls.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE LAKE COLOUR. One hue (0 red .. .15 yellow .. .33 green .. .66 blue), set
// by the host before the biome loads: the water, the algal crust, the shore
// accents, the scum mats and the complementary blooms / iridescence all derive
// from it. Yellow here: the lake is tinged by its algae.
var RIFT_LAKE={hue:0.15};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc6cbb4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc6d2c6,0x4a4630,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the lake, the ridge, the streams
const TERR={R:3200};
// the ridge's crest line (z of the crest at x): the massif wanders a little
function zr(x){return -60+170*Math.sin(x*.00071+1.3)+55*Math.sin(x*.0021-.6);}
// the lake's north shore: z of the shore at x; bays and points from fbm
function shoreZ(x){return 1900+120*Math.sin(x*.0009)+60*Math.sin(x*.0027)+160*(fbm(x*.0019+3,5,53,2)-.5);}
// signed distance-ish to the shore in metres: negative inside the lake
function lakeIn(x,z){return shoreZ(x)-z;}
// two streams down the jungle to the lake (x of the stream at z), one dry wash on the savannah
function xsE(z){return 780+90*Math.sin(z*.0041)+40*Math.sin(z*.011+2);}
function xsW(z){return -1150+110*Math.sin(z*.0037+1)+40*Math.sin(z*.013);}
function xwN(z){return -300+140*Math.sin(z*.0029)+50*Math.sin(z*.009);}
function streamD(x,z){const d=z-zr(x);if(d<420)return 1e9;return Math.min(Math.abs(x-xsE(z)),Math.abs(x-xsW(z)));}
function washD(x,z){const d=z-zr(x);if(d>-700)return 1e9;return Math.abs(x-xwN(z));}
// the ridge: a crest 210..370 m, steep and BENCHED to the south (the cloud
// forest sits on the benches), a long gentle pediment to the north; narrow
// flat-topped mesas and saddles along the crest
function ridgeH(x,z){const d=z-zr(x);
 const crest=290+80*(fbm(x*.0008+2,1,61,2)-.5)*2;
 // the south face: a 300 m climb over 640 m of run, cut into a stair of three
 // treads (a sinusoid subtracted from the ramp; at amplitude 1/(2pi*3) the
 // treads come out level and the risers about twice the mean slope)
 let fS=smooth(700,60,d);fS=fS-.053*Math.sin(fS*TAU*3);
 const core=fS*smooth(-820,-180,d);
 // narrow mesas and saddles along the crest, and notches cut across it
 const mesa=smooth(.52,.57,fbm(x*.0024+5,z*.0024-3,62,2)),gap=smooth(.40,.34,fbm(x*.0028-1,z*.0028+4,63,2)),notch=smooth(.56,.61,fbm(x*.005+2,z*.005+7,67,2));
 const rough=(24*(fbm(x*.0025,z*.0025,64,3)-.5)+8*(fbm(x*.008,z*.008,65,2)-.5))*smooth(.05,.3,core);
 const pediment=26*fbm(x*.0015+9,z*.0015-2,66,2)*smooth(-1300,-750,d)*smooth(-250,-750,d);   // dissected hills at the north foot
 return crest*core+110*mesa*core*core-60*gap*core*core-50*notch*core*core+rough+pediment;}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 const lk=lakeIn(x,z),sd=streamD(x,z),wd=washD(x,z);
 const sw=fbm(x*.0008+3,z*.0008-1,17,3)-.5,ro=fbm(x*.0045-2,z*.0045+5,29,2)-.5;
 let h=2.2+sw*2.6+ro*1.0;                       // the valley floor: two metres above the plane, never under it
 h+=ridgeH(x,z);
 // the streams: a shallow channel; water only in the last reach before the lake
 const reach=smooth(520,140,lk);
 h=mix(h,mix(.55,-.9,reach)+ro*.3,smooth(26,8,sd));
 h=mix(h,h-1.2,smooth(30,10,wd));               // the dry wash: a shallow gravel bed
 const inL=smooth(25,-15,lk),bed=-.5-1.4*smooth(0,-260,lk)-7*smooth(-260,-900,lk)+1.5*(fbm(x*.0018+5,z*.0018+9,77,2)-.5)*smooth(-40,-200,lk);
 return mix(h,Math.min(bed,-.3),inL);}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// the climate fields the biome asks for
function southK(x,z){return smooth(-120,120,z-zr(x));}   // 1 on the lake side of the crest
function mistK(x,z){const up=clamp(ridgeH(x,z)/400,0,1);
 return clamp(smooth(-40,140,z-zr(x))*smooth(.06,.18,up)*smooth(.95,.76,up)*(.65+.45*fbm(x*.002,z*.002,88,2)),0,1);}
const FIELD_RAW={
 wet:(x,z)=>{const s=southK(x,z),m=mistK(x,z),up=clamp(ridgeH(x,z)/400,0,1),lk=lakeIn(x,z);
  let w=mix(.30,.90,s);w=mix(w,.88,m);
  w=mix(w,.22,smooth(.55,.75,up)*(1-m));                         // the peak is dry
  w=Math.max(w,.95*smooth(90,15,streamD(x,z)),.45*smooth(90,15,washD(x,z)),.80*smooth(140,10,lk));
  return clamp(w,0,1);},
 salt:(x,z)=>{const lk=lakeIn(x,z);return clamp(.9*smooth(90,4,lk)*smooth(-10,40,lk)+.35*smooth(220,80,lk),0,1);},
 upland:(x,z)=>clamp(ridgeH(x,z)/400,0,1),
 flow:(x,z)=>clamp(Math.max(smooth(130,25,streamD(x,z)),.6*smooth(110,25,washD(x,z))),0,1),
 mist:mistK};
// ---------------------------------------------------------------- the field cache
// The analytic fields cost a dozen fbm calls each and the biome asks for them
// on every grid cell (a million times a build), so they are sampled once on an
// 18 m lattice and read back bilinearly: the zones are hundreds of metres
// across and never notice. terrainH stays exact (the shore, the stream beds).
const FC=(function(){const N=384,S=TERR.R*2.2,a={wet:new Float32Array(N*N),salt:new Float32Array(N*N),up:new Float32Array(N*N),mist:new Float32Array(N*N),flow:new Float32Array(N*N),lk:new Float32Array(N*N),slope:new Float32Array(N*N),south:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD_RAW.wet(x,z);a.salt[k]=FIELD_RAW.salt(x,z);a.up[k]=FIELD_RAW.upland(x,z);a.mist[k]=FIELD_RAW.mist(x,z);a.flow[k]=FIELD_RAW.flow(x,z);a.lk[k]=lakeIn(x,z);a.slope[k]=slopeAt(x,z);a.south[k]=southK(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>FC.at(FC.a.salt,x,z),upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z);if(h<.12)return 0;const w=h<.6?(h-.12)/.48:1;return w*smooth(1.6,.85,FC.at(FC.a.slope,x,z));},   // nothing rooted under water or on a cliff
 obstacles:OBSTACLES,ticks:tick,seed:11,
 // the LOD spine: a row of origins along x=0 from the savannah over the ridge to the shore
 origin:[[0,-2900],[0,-2200],[0,-1500],[0,-800],[0,-200],[0,400],[0,1000],[0,1600],[0,2100]],center:[0,0],
 fields:FIELD,err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh. Painted by zone from the field cache, with a tiled detail texture
// multiplied in for the grain and the salt cracks up close.
const LAKECOL=new THREE.Color().setHSL(RIFT_LAKE.hue,.7,.45);

const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const LIT=new THREE.Color(0x3e3040),LIT2=new THREE.Color(0x30263a),LMOSS=new THREE.Color(0x4e6030),
  CRUST=new THREE.Color(0xe6e0b8),ALGA=new THREE.Color(0xb4b048),MUD=new THREE.Color(0x5e5a3c),BED=new THREE.Color(0x7a7448),
  SAV=new THREE.Color(0xc0a458),SAV2=new THREE.Color(0xa08c48),SAVG=new THREE.Color(0x7c8a40),EARTH=new THREE.Color(0x8a5a3a),
  ROCK=new THREE.Color(0x8a7c68),ROCK2=new THREE.Color(0x6a6052),ROCK3=new THREE.Color(0xa09480),HUMUS=new THREE.Color(0x2c3826),PEAK=new THREE.Color(0xa89c80),PEAKG=new THREE.Color(0x6a7a48),
  SILT=new THREE.Color(0x8a8a60),GRAVEL=new THREE.Color(0xb0a088);
 const crustT=CRUST.clone().lerp(LAKECOL,.12),algaT=ALGA.clone().lerp(LAKECOL,.3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),n3=fbm(x/90,y/90,4.1,2)-.5;
  const salt=FC.at(FC.a.salt,wx,wz),wet=FC.at(FC.a.wet,wx,wz),up=FC.at(FC.a.up,wx,wz),mist=FC.at(FC.a.mist,wx,wz),flow=FC.at(FC.a.flow,wx,wz),lk=FC.at(FC.a.lk,wx,wz),sl=FC.at(FC.a.slope,wx,wz),south=FC.at(FC.a.south,wx,wz);
  const floor=smooth(.30,.10,up);
  // the valley floor: jungle litter south of the crest, dry grass north of it
  t.copy(LIT).lerp(LIT2,clamp(.5+n*1.8,0,1)).lerp(LMOSS,smooth(.3,.7,n3+wet*.3)*.5);
  c.copy(SAV).lerp(SAV2,clamp(.5+n*1.7,0,1)).lerp(SAVG,smooth(.45,.7,fbm(x/60,y/60,7,2))*.55).lerp(EARTH,smooth(.62,.78,fbm(x/40,y/40,8,2))*.5);
  c.lerp(t,south*floor);
  // the ridge: rock where it is steep, humus under the cloud forest, pale stony scrub on the peak
  t.copy(ROCK).lerp(ROCK2,clamp(.5+n*2.0,0,1)).lerp(ROCK3,smooth(.4,.6,fbm(x/12,y/70,9,2)));   // strata run with x
  const cloud=mist,peak=smooth(.55,.75,up)*(1-mist);
  const rockK=smooth(.55,1.05,sl)*smooth(.06,.16,up);
  c.lerp(HUMUS,cloud*.85*smooth(.12,.3,up));
  c.lerp(PEAK.clone().lerp(PEAKG,smooth(.4,.7,fbm(x/30,y/30,10,2))*.6),peak*.9);
  c.lerp(t,rockK);
  // the shore: crust, then the algal mat right at the water
  c.lerp(crustT,salt*smooth(160,20,lk)*.9);c.lerp(algaT,smooth(40,6,lk)*smooth(-20,10,lk)*.8);
  c.lerp(BED,smooth(0,-30,lk));
  // the streams and the wash
  c.lerp(SILT,smooth(.5,.9,flow)*south*.7);c.lerp(GRAVEL,smooth(.4,.8,flow)*(1-south)*.8);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m; salt-pan cracks weighted per
// vertex by the salt field (aCrack), so the savannah and the ridge show none
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<16;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack);}');};
(function(){const N=460,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,ck=new Float32Array(p.count);for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));ck[i]=smooth(.3,.8,FC.at(FC.a.salt,p.getX(i),p.getZ(i)));}
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Rift floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// One plane at y=0 carries the lake and the streams' last reach; its vertex
// colour is the water's own colour by depth (the algal lake colour in the
// salt, a clearer green in the streams). The lake colour is RIFT_LAKE
// (50-species): swap the hue there and everything follows.
const WATER_SHALLOW=new THREE.Color().setHSL(RIFT_LAKE.hue,.62,.50),WATER_MID=new THREE.Color().setHSL(RIFT_LAKE.hue-.01,.58,.32),WATER_DEEP=new THREE.Color().setHSL(RIFT_LAKE.hue-.02,.45,.13),WATER_PALE=new THREE.Color().setHSL(RIFT_LAKE.hue+.02,.55,.72);
const RIVER_COL=new THREE.Color().setHSL((RIFT_LAKE.hue+.28)%1,.35,.30);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1200,900,-600).normalize()},uSky:{value:new THREE.Color(0xd8e0d0)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',   // ripples fade with range or they alias into a moire
  ' vec3 n=normalize(vec3(rk*(0.03*sin(vWP.x*0.31+uT*1.1)+0.018*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.03*cos(vWP.z*0.27+uT*0.9)+0.018*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.06+fr*0.55);',   // a scummy lake reflects less than clear water
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.55*vec3(1.0,0.96,0.86);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,-h),lk=lakeIn(x,z),fresh=smooth(120,30,streamD(x,z))*(1-smooth(-60,-240,lk));
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2),scum=fbm(x*.0071-3,z*.0071+6,506,2);
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.47,.66,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.7,smooth(.58,.7,scum)*smooth(3,.5,d)*.8)).lerp(WATER_MID,smooth(1.2,3.6,d)).lerp(WATER_DEEP,smooth(4,8.5,d));   // pale algal shoals in the shallows, scum mats near the shore
 out.lerp(RIVER_COL,fresh);return out;}
(function(){const N=300,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){waterColorAt(p.getX(i),p.getZ(i),c);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The algal lake';m.renderOrder=1;scene.add(m);})();
