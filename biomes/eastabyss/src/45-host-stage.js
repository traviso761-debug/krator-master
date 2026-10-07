// ================================================================= HOST — stage
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
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc3cbc0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc4d2cc,0x4a4230,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the lake, the rivers, the zones
const TERR={R:3400};
const LAKE={a:850,b:1900,scale:760};
// signed distance-ish to the lake shore in metres: negative inside
function lakeIn(x,z){const ux=x/LAKE.a,uz=z/LAKE.b,r=Math.hypot(ux,uz),ang=Math.atan2(uz,ux);
 const edge=1+.16*(fbm(Math.cos(ang)*2.3+7,Math.sin(ang)*2.3-4,51,2)-.5)*2;return(r-edge)*LAKE.scale;}
// the two rivers: east river from the wall through the marsh, west river across the flats
function zE(x){return 280+170*Math.sin(x*.0031+1)+70*Math.sin(x*.0093);}
function zW(x){return -520+150*Math.sin(x*.0027)+60*Math.sin(x*.008);}
const MOUTH_E=[820,zE(820)],MOUTH_W=[-820,zW(-820)];
function riverD(x,z){let d=1e9;
 if(x>600){d=Math.abs(z-zE(x));if(x<1250){const f=(1250-x)/430;d=Math.min(d,Math.abs(z-(zE(x)+f*150)),Math.abs(z-(zE(x)-f*130)));}}   // delta channels fan toward the mouth
 if(x<-600){d=Math.min(d,Math.abs(z-zW(x)));if(x>-1250){const f=(x+1250)/430;d=Math.min(d,Math.abs(z-(zW(x)+f*140)),Math.abs(z-(zW(x)-f*120)));}}
 return d;}
function deltaK(x,z){return Math.max(smooth(520,60,Math.hypot(x-MOUTH_E[0],z-MOUTH_E[1])),smooth(520,60,Math.hypot(x-MOUTH_W[0],z-MOUTH_W[1])));}
function riseAt(x,z){const xe=x+120*Math.sin(z*.0011)+40*Math.sin(z*.0037);
 return 70*smooth(2100,3000,xe)+120*smooth(2900,3400,xe)+(40*(fbm(x*.0022,z*.0022,44,3)-.5)+12*(fbm(x*.007,z*.007,45,2)-.5))*smooth(2100,2500,xe);}   // hills on the slope
// zone weights (0..1 each) — a few overlap on purpose so the edges are soft
function zoneW(x,z){const xe=x+120*Math.sin(z*.0011)+40*Math.sin(z*.0037),lk=lakeIn(x,z),dry=smooth(-20,60,lk),east=smooth(-150,150,x);
 return{lake:1-dry,
  flat:dry*(1-east),                                   // WEST of the lake: the salt flats
  marshW:0,
  marshE:dry*east*smooth(2300,2080,xe),                // EAST of the lake: the marsh, up to where the slope begins
  jung:smooth(2080,2300,xe)*smooth(3150,2900,xe),
  sav:smooth(2900,3150,xe),lk:lk};}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 const W=zoneW(x,z),lk=W.lk,rd=riverD(x,z);
 const sw=fbm(x*.0008+3,z*.0008-1,17,3)-.5,ro=fbm(x*.0045-2,z*.0045+5,29,2)-.5;
 const marsh=Math.max(W.marshW,W.marshE);
 let h=1.4+sw*2.2*(1-W.flat*.7)+ro*(1.0-W.flat*.8);
 h=mix(h,.9+ro*.5,marsh*.45);                                                          // the marsh lies low and flat
 const pool=fbm(x*.0062+11,z*.0062-7,313,2);h-=marsh*3.0*smooth(.40,.26,pool);       // marsh pools: standing water, a few tens of metres across
 h=mix(h,-2.0+ro*.4,smooth(30,9,rd)*(1-.55*smooth(2000,2400,x)));                        // the river channels (narrower up the slope)
 h+=riseAt(x,z);
 const inL=smooth(25,-15,lk),bed=-.5-1.4*smooth(0,-260,lk)-8*smooth(-260,-900,lk)+2.0*(fbm(x*.0018+5,z*.0018+9,77,2)-.5)*smooth(-40,-200,lk);   // wide bright shallows, the deep only in the middle
 return mix(h,Math.min(bed,-.3),inL);}
// the climate fields the biome asks for
const FIELD={
 wet:(x,z)=>{const W=zoneW(x,z),rd=riverD(x,z);
  let w=W.marshE*.94+W.flat*.05+W.jung*.92+W.sav*.28+W.lake*.9;
  w=Math.max(w,.96*smooth(95,22,rd)*(1-W.sav*.5)*(1-W.flat*.4),deltaK(x,z),.42*smooth(130,10,W.lk));return clamp(w,0,1);},   // the flats' river is damp, not marsh
 salt:(x,z)=>{const W=zoneW(x,z),rd=riverD(x,z);
  let s=W.flat*.95+Math.max(W.marshW,W.marshE)*.22+.9*smooth(70,4,W.lk)*smooth(-10,40,W.lk);
  s*=mix(smooth(12,60,rd),1,W.flat*.85);return clamp(s,0,1);},   // the crust runs right to the bank on the flats
 upland:(x,z)=>clamp(riseAt(x,z)/190,0,1),
 flow:(x,z)=>clamp(smooth(150,30,riverD(x,z)),0,1)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z);return h<.12?0:h<.6?(h-.12)/.48:1;},   // nothing rooted under water
 obstacles:OBSTACLES,ticks:tick,seed:7,
 // the LOD spine: a row of origins along z=0 from the west marsh to the shelf
 origin:[[-2900,0],[-2000,0],[-1100,0],[-200,0],[700,0],[1500,0],[2200,0],[2800,0],[3300,0]],center:[0,0],
 fields:FIELD,err:reportErr,
 register:REGISTER,eye:()=>[camera.position.x,camera.position.y,camera.position.z]});   // the fauna (75) registers its flocks and reads the viewer
BIO.setSun([-1200,900,-600]);
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
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack);}');};
(function(){const N=400,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,ck=new Float32Array(p.count);for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));ck[i]=smooth(.3,.8,FC.at(FC.a.salt,p.getX(i),p.getZ(i)));}
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The basin floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// One plane at y=0 carries the lake, the marsh pools and the basin reaches of
// both rivers; its vertex colour is the water's own colour by depth and
// salinity (lake colour in the salt, river colour in the fresh). The rivers'
// climb up the slope is a ribbon in the same material. The lake colour is
// EASTABYSS_LAKE (50-species): swap the hue there and everything follows.
const WATER_SHALLOW=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.80,.47),WATER_MID=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.82,.33),WATER_DEEP=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.70,.13),WATER_PALE=new THREE.Color().setHSL(EASTABYSS_LAKE.hue+.02,.50,.70);
const RIVER_COL=new THREE.Color().setHSL((EASTABYSS_LAKE.hue+.5)%1,.42,.30),POOL_COL=new THREE.Color().setHSL(EASTABYSS_LAKE.hue,.55,.30).lerp(new THREE.Color(0x4a4a30),.35);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1200,900,-600).normalize()},uSky:{value:new THREE.Color(0xd8e2dc)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',   // ripples fade with range or they alias into a moire
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.08+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.75*vec3(1.0,0.96,0.86);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,-h),lk=lakeIn(x,z),fresh=smooth(160,40,riverD(x,z))*(1-smooth(-80,-300,lk));
 const W=zoneW(x,z),marsh=Math.max(W.marshW,W.marshE)*smooth(-40,60,lk);
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2);
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.47,.66,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.7)).lerp(WATER_MID,smooth(1.2,3.6,d)).lerp(WATER_DEEP,smooth(4,8.5,d));   // pale salt shoals in the shallows, a pale rim at the shore
 out.lerp(POOL_COL,marsh*.85);out.lerp(RIVER_COL,fresh);return out;}
(function(){const N=300,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){waterColorAt(p.getX(i),p.getZ(i),c);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The salt lake';m.renderOrder=1;scene.add(m);
 // the east river up the slope: a ribbon at bed+0.5 from x=2000 to the edge — the west river stays in the basin
 const pos=[],cc=[],rc=RIVER_COL.clone().convertSRGBToLinear();
 for(let x=1990;x<TERR.R+100;x+=30){const z0=zE(x),z1=zE(x+30),w=13-4*smooth(2000,3400,x);
  const ya=terrainH(x,z0)+.5,yb=terrainH(x+30,z1)+.5;
  pos.push(x,ya,z0-w, x+30,yb,z1-w, x+30,yb,z1+w,  x,ya,z0-w, x+30,yb,z1+w, x,ya,z0+w);for(let k=0;k<6;k++)cc.push(rc.r,rc.g,rc.b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));geo.computeVertexNormals();
 const rm=new THREE.Mesh(geo,MAT_WATER);rm.userData.probeSkip=true;rm.userData.inspectLabel='The east river';scene.add(rm);})();
