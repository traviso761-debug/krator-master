// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('riftrim',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for THE RIFT RIM: everything a world provides that a biome does not. Renderer, lights, haze,
// the climate fields the kit asks for (cached from the land's), the water, the painted ground, the tick list, the error
// panel. THE LAND (the ground, its features and its fields) is a station's own (stations/<name>/44w-host-land.js, PLAN.md section 9),
// built by 44v's rimLand(). A real world (openworld/little-demo) replaces
// this whole section with its own; the kit's fragments never read anything from it except through BIO.host.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
/* the draw-call and vertex set (BACKPORT.md section 1; nhighlands' lines): welded items, one mesh a chunk, the cross-fade, chunks off screen dropped; ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 */
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4c8b8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xc4d2e6,0x6a5040,.6));
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8c0a8,.22);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the climate fields, cached (the land's fieldsAt: these are a grid of them)
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','strata','crack','snow','pave','polyg','talus','wash','char','fog','farm','ice'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 // the bed under each cell, as the strata shader draws it (S.surface: the wash down a gentle slope, the loose cover in the bed's colour): the painter's colour
 const SF=STRATA.surface?{r:new Float32Array(N*N),g:new Float32Array(N*N),b:new Float32Array(N*N)}:null;
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]||0);
  if(SF&&F.strata>.02){const ny=1/Math.sqrt(1+(hx*hx+hz*hz)/(4*cs*cs)),o=STRATA.surface(x,a.h[k],z,ny);SF.r[k]=o.cover[0];SF.g[k]=o.cover[1];SF.b[k]=o.cover[2];}}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at,SF};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// (the rift rim reads no sulphur field: its vents are the Hearths' stations, PLAN.md "On scale model 5.1")

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// THE MASK: the core's default (nothing rooted where the water is over the ground, a ramp over the first .7 m: a host's own mask replaces it, so it is
// written out here) and nothing on a rock body (KSTACKS: a dome, a tor) or within a metre and a half of its foot
const ROCK_MASK=(x,z)=>{const d=terrainH(x,z)-waterH(x,z),w=d<.15?0:d<.7?(d-.15)/.55:1;if(w<=0||!ROCK.length)return w;const f=KSTACKS.foot(ROCK,x,z);return f&&f.d<1.5?0:w;};
// the rim the page is (44w: RRIM.biome) is set before the kit builds; the sun the rosettes face (60) is the host's
BIO.init({tags:'riftrim',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:ROCK_MASK,
 obstacles:OBSTACLES,ticks:tick,seed:13,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);

// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache. The bedded rock (the badland mounds, the escarpment, the canyon's walls) carries the
// core's strata shader (KSTRATA, 44w); the painter takes the same beds' colours (FC.SF) where the strata field shows them.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2,RIM=LAND.rim||'n';
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 // each rim's palette: the N's dark needle floor and teal-green meadow, the S's black rock, rust scree and pale lichen, the W's copper-green moss,
 // the basin's lush green and its fields; all three share the tundra's olive, the snow and the bare rift fill (strata, by its own beds)
 const P={n:{low:K(0x5a6a3a),low2:K(0x6a7a44),for:K(0x34402c),for2:K(0x3e4a32),alp:K(0x6e7650),alp2:K(0x7e8460),rock:K(0x6e6c6a),rock2:K(0x5e5c5a)},
  s:{low:K(0x7a7458),low2:K(0x8a8062),for:K(0x4a4636),for2:K(0x564e3c),alp:K(0x4a4440),alp2:K(0x5e5048),rock:K(0x3e3a3c),rock2:K(0x56423a)},
  w:{low:K(0x5a7a34),low2:K(0x6e8a3e),for:K(0x4e5a30),for2:K(0x6a6234),alp:K(0x6a6a48),alp2:K(0x7a7052),rock:K(0x6a625a),rock2:K(0x5a524a)}}[RIM]||null;
 const SNOW=K(0xeef1f4),ICE=K(0xd0dee8),DAMP=K(0x3a3a2a),SILT=K(0x7a7660),FIELD1=K(0x9a8a44),FIELD2=K(0x6a8a3a),FIELD3=K(0x8a6a44),bed=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  const wet=FC.at(FC.a.wet,wx,wz),flow=FC.at(FC.a.flow,wx,wz),rock=FC.at(FC.a.rock,wx,wz),cold=FC.at(FC.a.cold,wx,wz),sl=FC.at(FC.a.slope,wx,wz),
   snow=FC.at(FC.a.snow,wx,wz),bar=FC.at(FC.a.barren,wx,wz),str=FC.at(FC.a.strata,wx,wz),tal=FC.at(FC.a.talus,wx,wz),fog=FC.at(FC.a.fog,wx,wz),farm=FC.at(FC.a.farm,wx,wz),ice=FC.at(FC.a.ice,wx,wz);
  // the low ground (the shore zone), the forest floor (montane), the alpine's tundra, by cold
  c.copy(P.low).lerp(P.low2,clamp(.5+n*1.8,0,1));
  t.copy(P.for).lerp(P.for2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.24,.34,cold));
  t.copy(P.alp).lerp(P.alp2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.54,.64,cold));
  // the W's cloud belt: copper-green moss where the fog sits on the flats
  if(RIM==='w'&&fog>0){t.setHex(0x6a7034).lerp(K(0x8a6a3a),clamp(.5+n*2,0,1));c.lerp(t,fog*smooth(.5,.2,sl)*.6);}
  // Dalab's fields on the basin plain: strips by the field noise
  if(farm>0){const s2=fbm(wx*.004,wz*.02,151,1);t.copy(s2<.45?FIELD1:s2<.6?FIELD2:FIELD3);c.lerp(t,farm*.85);}
  // the bare rock and the rift fill's beds (KSTRATA's own colour where the strata field shows)
  t.copy(P.rock).lerp(P.rock2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.35,.75,rock)*.85);
  if(FC.SF){bed.setRGB(FC.at(FC.SF.r,wx,wz),FC.at(FC.SF.g,wx,wz),FC.at(FC.SF.b,wx,wz));c.lerp(bed,smooth(.2,.6,str)*.75);}
  t.copy(P.rock2).lerp(SILT,clamp(.5+n2*1.2,0,1));c.lerp(t,tal*.6);
  // the water's banks damp; snow, the glacier's ice
  c.lerp(DAMP,smooth(.6,.95,flow)*.55);
  t.copy(SNOW).lerp(ICE,clamp(.5+n*2,0,1)*Math.max(bar,ice));c.lerp(t,Math.max(snow*smooth(.8,.5,sl),bar*smooth(.95,.8,sl),ice)*.95);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<18;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.38)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// THE LIBRARY GROUND LAYERS (materials.json ground.*, core/materials/PLAN.md "Eastern badlands") ON KGROUND (43-core-ground.js; BACKPORT.md's ground row,
// the final rebuild 2026-11-02): ten surfaces, hex-tiled, scaled with distance and blended by height over the painted ground; their weights are the
// same zone masks as before (GLW below, one vertex attribute each, normalised), each layer as it was mixed: a keep-0 layer is the painted colour
// times its relief (popcorn clay on the badland mounds, Navajo cross-bedding under the strata on the walls), a keep-1 layer its own colour (the
// sulphur crust, the acid pools' travertine rims). ?kground=0: the old plain mix. Without the pack (?mat=proc, or no tex/) the ground is the paint.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
/* KGROUND's relief (core/terrain/GROUND.md; the cloud kits' merge, 2026-11-04): the bump from the layers' height (no texture unit) and the ground mesh's
   hollows (KGROUND.cavityMesh), on the MeshStandard ground; ?kgrelief=0 the before-and-after */
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const GLW=(function(){
 // each layer on a documented mask (the review's first line): the zones' own cold bands, wet, fog, the farm field, rock and slope, snow
 const open=F=>(1-F.snow)*(1-F.ice),shoreK=F=>smooth(.34,.24,F.cold),monK=F=>smooth(.24,.32,F.cold)*smooth(.64,.54,F.cold),alpK=F=>smooth(.54,.62,F.cold);
 return[['grass',F=>shoreK(F)*open(F)*(1-F.farm)*(1-F.rock)*smooth(.25,.45,F.wet)],                    /* the basin plain and the warm lower edge: lush grass */
  ['field',F=>F.farm*open(F)],                                                                        /* Dalab's fields */
  ['needles',F=>monK(F)*open(F)*(1-F.rock)*(1-F.fog*.6)],                                             /* the forest floor */
  ['sphagnum',F=>Math.max(monK(F),alpK(F)*.5)*F.fog*smooth(.5,.2,F.slope)*open(F)],                   /* the moor sponge's bogs in the cloud belt */
  ['tundra',F=>alpK(F)*open(F)*(1-F.rock*.6)],                                                        /* the alpine's tundra */
  ['black',F=>Math.max(alpK(F),monK(F)*.6)*open(F)*(1-F.rock*.3)],                                   /* the black rim's dark ground (the S stations show it in place of the tundra) */
  ['lichen',F=>F.rock*open(F)*smooth(.3,.6,F.cold)],                                                 /* lichen crust on the high rock (only the rock: on the flats it washed the black rim pale) */
  ['clad',F=>alpK(F)*open(F)*smooth(.2,.05,F.slope)*smooth(.5,.62,fbm(F.x*.004,F.z*.004,441,2))],      /* reindeer lichen on the alpine flats */
  ['lenswort',F=>Math.max(monK(F),alpK(F))*open(F)*smooth(.12,.35,F.slope)*smooth(.6,.3,F.wet)*smooth(.52,.64,fbm(F.x*.005+3,F.z*.005,442,2))],   /* the N's lenswort carpets */
  ['algal',F=>F.under*smooth(.3,1.2,F.depth)*smooth(5,2.5,F.depth)],                                  /* the N lakes' algal shallows (under the water) */
  ['iris',F=>F.rock*alpK(F)*smooth(.25,.5,F.slope)],                                                  /* the S rim's iris lichen on the rock faces */
  ['snowalgae',F=>F.snow*smooth(.7,.3,F.slope)*smooth(.55,.68,fbm(F.x*.003,F.z*.003,443,2))],         /* snowblood: the summer snow red and violet */
  ['peat',F=>F.fog*F.flow*smooth(.4,.2,F.slope)]];})();                                               /* the peat at the bogs' and the tarns' edges */

/* A FRAGMENT SHADER HAS 16 TEXTURE UNITS (the Arc's and WebGL's floor): the ground's paint and grain (2), the strata (5), the horizon (2) and the rain's
   cover map (1: the lying snow reads it) leave 6, and ANGLE on the Arc links 15 at most (16 failed, measured), so a land names the five it shows
   (LAND.groundLayers; the transect drops the pools' travertine rims, the wall and bench patches (redwall and caprock, which only varied the sandstone and
   the clay), the playa (its mud polygons are KGROUND's polygon kind) and the tundra (the tundra station's)); ?kground=0 draws the same five in the old plain mix. The procedural crack canvas went
   too: the playa's mud polygons (KGROUND's polygon kind) and the sulphur crust carry what it drew. Wet ground (R9) adds two more: a land that has it
   (LAND.wet) shows fewer layers (89a) */
const GL_USE=(LAND.groundLayers||['needles','tundra','lichen']);
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;
 const P=n=>KMAT.packed('riftrim','ground.'+n);if(GLW.some(l=>!P(l[0])))return null;
 return GLW.filter(l=>GL_USE.indexOf(l[0])>=0).map(l=>{const e=P(l[0]);return{name:l[0],w:l[1],tex:KMAT.textures(e,{aniso:8}).map,scale:e.scale[0],keep:e.tint,mean:e.mean};});})();
/* Standard under KGROUND (roughness high, as dry ground is): the rain's gloss and the puddles show on it, as they cannot on Lambert; ?kground=0 for the old floor */
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xa8a29a,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa8a29a});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
 let lay='';
 // the old plain mix (?kground=0): a custom sampler is not decoded from sRGB for us (as the strata note says): pow 2.2 by hand; a keep-0 layer is
 // its relief, normalised by the pack's mean brightness so the painted colour keeps its level
 if(GL&&!USE_KG){GL.forEach((l,i)=>{sh.uniforms['uGL'+i]={value:l.tex};});
  lay='{vec3 _b=diffuseColor.rgb,_a=vec3(0.0);float _s=0.0;vec2 _p=vGWP.xz;'+GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2).toFixed(4),
    w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
   return 'if('+w+'>0.003){vec3 t=pow(texture2D(uGL'+i+',_p*'+(1/l.scale).toFixed(4)+').rgb,vec3(2.2));_a+='+w+'*mix(_b*t/'+m+',t,'+l.keep.toFixed(2)+');_s+='+w+';}';}).join('')+
   'diffuseColor.rgb=mix(_b,_a/max(_s,0.001),clamp(_s,0.0,1.0));vGLs=_s;}';}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;varying float vCrack;varying float vRock;attribute vec4 aGL0,aGL1,aGL2;varying vec4 vGL0,vGL1,vGL2;attribute vec4 aGM;varying vec4 vGM;attribute float aAO;varying float vAO;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;vGL0=aGL0;vGL1=aGL1;vGL2=aGL2;vGM=aGM;vAO=aAO;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying float vCrack;varying float vRock;varying vec4 vGL0,vGL1,vGL2;varying vec4 vGM;varying float vAO;'+
   (GL&&!USE_KG?GL.map((l,i)=>'uniform sampler2D uGL'+i+';').join(''):''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{float vGLs=clamp(dot(vGL0,vec4(1.0))+dot(vGL1,vec4(1.0))+dot(vGL2,vec4(1.0)),0.0,1.0)*'+(GL?'1.0':'0.0')+';vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.88);vec3 _gP=diffuseColor.rgb;'+lay+'\n/*KGROUND*/\n'+
  // the procedural grain and cracks give way where a library layer carries its own; the water's wet band darkens the ground (aGM.z: 89z, WATER.fieldAt's shore)
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85*(1.0-0.7*vGLs))*(1.0-0.18*vCrack*(1.0-vGLs));diffuseColor.rgb*=mix(vec3(1.0),vec3(0.6,0.58,0.55),vGM.z);diffuseColor.rgb*=vAO;}');};   /* vAO: the ground's own cavity (below) */
// THE LAYERS ON KGROUND, each with its old weight and strength; the row's KINDS on documented masks (THE GROUND'S MASKS, below): DESERT PAVEMENT
// (`clast`, the Outlands' recipe: small varnished stones packed in the reg, ?pave=0), MUD POLYGONS on the playa (`polygon`, pale cracks between
// curled plates, ?polygon=0) and the TALUS's red scree (`clast` in 3D cells, blocks a hand to a metre across)
const KG_Q=GQ,KG_PAVE=KG_Q.get('pave')!=='0',KG_POLY=KG_Q.get('polygon')!=='0';
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'riftrim-ground'+(KG_PAVE?'p':'')+(KG_POLY?'g':''),at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:(GL?GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2),w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
  return KGROUND.layer('riftrim','ground.'+l.name,{w,amt:1,gain:1,tint:'mix(_gP*'+(1/m).toFixed(4)+',vec3(1.0),'+l.keep.toFixed(2)+')',name:l.name});}):[]).concat([
 KG_PAVE?{kind:'clast',w:'vGM.x*(1.0-vRock)',amt:.72,proj:'xz',size:.06,matrix:.24,matrixColor:0xb08a6a,sub:0,fleck:0,jitter:.95,vary:.3,
  palette:[0x2a1e18,0x3e2a20,0x553828,0x1e1814,0x4a3226,0x6a4a34],seed:311,name:'pavement'}:null,
 KG_POLY?{kind:'polygon',w:'vGM.y*(1.0-vRock)',amt:.85,size:3.2,width:.05,edgeTint:'vec3(0.62,0.56,0.5)',warp:.14,seed:312,name:'mud polygons'}:null,
 {kind:'clast',w:'vGM.w',amt:.8,proj:'tri',size:.7,matrix:.12,matrixColor:LAND.talusMatrix==null?0x8a6650:LAND.talusMatrix,sub:.2,fleck:0,jitter:.9,vary:.35,palette:LAND.talusPalette||[0x9a5a44,0xb07058,0x7a4a3a,0xc08a6a,0x8a6a5a],seed:313,name:'talus'}])});
/* THE GROUND MESH: N x N cells of TERR.R*2.2/N metres on terrainH, its zone weights per vertex. THE GROUND'S MASKS (the review's first line: each layer
   on a documented mask, no layer on a bare noise): aGL0..2 the ten library layers' zone weights (GLW above: the strata field, slope, the vents' geo,
   the pools' banks, cold, wet; normalised to sum 1 at most), aCrack the paint's mud cracks, aRock the strata's share (bedded rock showing), and aGM:
   x desert pavement (the land's pave field, and the wadi's floor at .8), y mud polygons (polyg), z the water's wet band (89z: WATER.fieldAt's
   shore, filled after the water is drawn), w the talus (talus) */
const GROUND=(function(){const N=ST_GROUND_N(),S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),ck=new Float32Array(nx*nx),rk=new Float32Array(nx*nx),gm=new Float32Array(nx*nx*4);
 const g0=new Float32Array(nx*nx*4),g1=new Float32Array(nx*nx*4),g2=new Float32Array(nx*nx*4),F={};
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  FNAMES.forEach(n=>F[n]=FC.at(FC.a[n],x,z));ck[k]=F.crack;rk[k]=F.strata*(1-F.snow);
  gm[k*4]=Math.max(F.pave,F.wash*.8);gm[k*4+1]=F.polyg;gm[k*4+3]=F.talus;
  if(GL){const wl=waterH(x,z);F.under=wl>-1e8&&y<wl?1:0;F.depth=F.under?wl-y:0;F.x=x;F.z=z;
   let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1)*(1-F.char);s+=v;return v;}),k1=s>1?1/s:1;   /* a burn (a station's char field) keeps its paint: no litter or turf over the ash */
   for(let q=0;q<4;q++){g0[k*4+q]=w[q]*k1;g1[k*4+q]=w[q+4]*k1;g2[k*4+q]=(w[q+8]||0)*k1;}}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aGM',new THREE.BufferAttribute(gm,4));
 g.setAttribute('aGL0',new THREE.BufferAttribute(g0,4));g.setAttribute('aGL1',new THREE.BufferAttribute(g1,4));g.setAttribute('aGL2',new THREE.BufferAttribute(g2,4));
 /* THE GROUND'S CAVITY (aAO; the owner, 2026-11-03: the painted badlands "too uniformly bright, looks painted on"): each vertex darkened by how far
    it lies under its neighbours' mean (a gully's floor, a crease under a ledge, the foot of a rib) and lifted a little where it stands over them (a
    rib, a ridge), the bedded rock's steep faces a shade darker than its benches; from the mesh itself, so it follows what is drawn. ?cavity=0 none */
 {const ao=new Float32Array(nx*nx).fill(1);if(GQ.get('cavity')!=='0')for(let j=1;j<N;j++)for(let i=1;i<N;i++){const k=j*nx+i,y=pos[k*3+1];
   const L1=(pos[(k-1)*3+1]+pos[(k+1)*3+1]+pos[(k-nx)*3+1]+pos[(k+nx)*3+1])*.25-y,L2=(pos[(k-nx-1)*3+1]+pos[(k-nx+1)*3+1]+pos[(k+nx-1)*3+1]+pos[(k+nx+1)*3+1])*.25-y,lap=(L1*2+L2)/3;
   const sl=Math.hypot(pos[(k+1)*3+1]-pos[(k-1)*3+1],pos[(k+nx)*3+1]-pos[(k-nx)*3+1])/(2*cs),bed=rk[k];
   ao[k]=clamp(1-clamp(lap/cs*1.6,0,.42)*(.6+.4*bed)+clamp(-lap/cs*.5,0,.08)-.14*bed*smooth(.35,.85,sl),.5,1.08);}
  g.setAttribute('aAO',new THREE.BufferAttribute(ao,1));}
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel=LAND.name.replace(' (ideal type)','');scene.add(m);return m;})();
function ST_GROUND_N(){return LAND.groundN==null?560:LAND.groundN;}

// ---------------------------------------------------------------- the rock bodies (KSTACKS, 44w: the plateau's slickrock domes, the tundra's tors)
// One mesh each kind: the domes in the strata's beds (their own shader: the canyon recipe's cross-bedded sandstone), the tors in granite grey by
// the mesh's occlusion. One registered volume per body; the flora keeps off them (BIO.init's mask, above)
(function(){if(!ROCK.length)return;
 const acc={dome:{pos:[],col:[],idx:[]},tor:{pos:[],col:[],idx:[]}},c=new THREE.Color(),GR=[0x8e8a84,0x9a958e,0x7e7a76];
 ROCK.forEach(B=>{const m=KSTACKS.mesh(B,{step:B.kind==='tor'?1.2:4}),A=acc[B.kind==='dome'?'dome':'tor'],n0=A.pos.length/3;
  for(let v=0;v<m.part.length;v++){A.pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);c.setHex(GR[KRAND.hash(B.seed,m.bed[v],77)%GR.length]).multiplyScalar(.62+.38*m.occ[v]);A.col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)A.idx.push(n0+m.idx[i]);
  REGISTER({name:B.name,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:B.R,h:B.top-B.y0});});
 const mk=(A,dome)=>{if(!A.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(A.col,3));g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,color:dome?0xffffff:0xb0aaa2});
  if(dome)mat.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;')
    .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 dt=texture2D(uDetail,vSWP.xz*0.12+vSWP.y*0.07).rgb;diffuseColor.rgb=strataColor(vSWP,vSWN)*(0.6+0.4*vColor.r/0.62)*(0.86+0.28*dt.r);}');};
  mat.customProgramCacheKey=()=>'ebad-rock-'+(dome?1:0);
  const me=new THREE.Mesh(g,mat);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel=dome?'A slickrock dome':'A granite tor';scene.add(me);return me;};
 mk(acc.dome,true);mk(acc.tor,false);
 /* an invisible anchor at each body's middle: the probe's registered-volume check finds something inside each one */
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),ROCK.length),M4=new THREE.Matrix4();
  ROCK.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}})();

// ---------------------------------------------------------------- the water
// core/water records (drawn in 89w-host-water.js): every lake of the land a WATER.still at its own level over its outline (the ground under the
// level shows it), the river a WATER.flow from the land's RIVER_SPEC, each fall a WATER.fall. BIO.waterH is the land's waterH.
const RIVER=RIVER_SPEC?WATER.flow({name:RIVER_SPEC.name||'The river',pts:RIVER_SPEC.pts,width:RIVER_SPEC.width,speed:RIVER_SPEC.speed}):null;
const LAKE_STILLS=LAKES.map(L=>WATER.still({name:L.name,level:L.level,poly:L.poly}));
const FALL_RECS=FALLS.map(f=>WATER.fall(Object.assign({fit:true,spread:6,face:terrainH,faceLift:.8,faceN:48},f)));
// the largest still: the mirror's (99: the reflections switch, off at page load)
const BIG_LAKE=LAKES.length?LAKES.reduce((a,b)=>(b.area==null?1:b.area)>(a.area==null?1:a.area)?b:a,LAKES[0]):null;
(function(){LAKES.forEach(L=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;L.poly.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 const cx=clamp((x0+x1)/2,-TERR.R,TERR.R),cz=clamp((z0+z1)/2,-TERR.R,TERR.R),r=Math.min(TERR.R,Math.max(x1-x0,z1-z0)/2);L.cx=cx;L.cz=cz;L.r=r;
 if(r<TERR.R*.7)REGISTER({name:L.name,x:cx,z:cz,y:L.level-12,r:r*1.15,h:60});});})();   /* a lake within the page: its basin and shore (a lake larger than the page names itself: the water's inspector label) */
