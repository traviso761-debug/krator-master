// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('tiers',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for THE TIERS (the Great Chasm's, 2026-11-11, taken as the start; riftrim's before it): everything a world provides that a biome does not. Renderer, lights, haze,
// the climate fields the kit asks for (cached from the land's), the water, the painted ground, the tick list, the error
// panel. THE LAND (the ground, its features and its fields) is a station's own (stations/<name>/44w-host-land.js, PLAN.md section 9),
// built by 44v's tiersLand() on the scale model's heights (44f). A real world (openworld/little-demo) replaces
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
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4c8b8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1.5,260000);   /* the far field runs 120 km out (83: the walls of the trench) */
scene.add(new THREE.HemisphereLight(0xc4d2e6,0x6a5040,.6));
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8c0a8,.22);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the climate fields, cached (the land's fieldsAt: these are a grid of them)
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','hot','geo','barren','strata','crack','snow','pave','polyg','talus','wash','char','fog','farm','ice','road','seep','ledge','tread'];
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
// (the Tiers read no geothermal field: no vent, tube or volcano inside the polygon, PLAN.md section 1: the placid country)

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// THE MASK: the core's default (nothing rooted where the water is over the ground, a ramp over the first .7 m: a host's own mask replaces it, so it is
// written out here) and nothing on a rock body (KSTACKS: a dome, a tor) or within a metre and a half of its foot
const ROCK_MASK=(x,z)=>{const d=terrainH(x,z)-waterH(x,z),w=d<.15?0:d<.7?(d-.15)/.55:1;if(w<=0||!ROCK.length)return w;const f=KSTACKS.foot(ROCK,x,z);return f&&f.d<1.5?0:w;};
BIO.init({tags:'tiers',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:ROCK_MASK,
 obstacles:OBSTACLES,ticks:tick,seed:6120,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);

// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache: the lake tread's Csa ground (tawny dry grass on red-brown soil, greener where the rain and
// the seep reach), the shore's wet band and reeds, the terraced fields' tilled brown, the riser's bedded basalt (KSTRATA's own colours where
// the strata field shows them, FC.SF), the talus, the roads' pale wear. The library layers (KGROUND, below) carry the near detail; this is the
// colour under them and the whole ground at range.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 /* THE LAKE TREAD'S GROUND (Csa: a dry summer's grass between greener swales): large patches of golden and tawny grass, olive and green where
    the rain and the seep collect (wet, and the hollows of a slow noise at ~300 m), red soil scars on the steeper slopes, pale stony ground on
    the rises; the owner, 2026-11-16: "a bit too brown, more varied" */
 const P={gold:K(0xc4aa68),tawny:K(0xa8905a),olive:K(0x7e8a4c),green:K(0x5c7638),red:K(0x9a5e40),red2:K(0x84503a),stony:K(0xa8a290),stony2:K(0x8e8a7c),rock:K(0x34312e),rock2:K(0x4a3e36)};
 const SHORE=K(0x6a6a48),MUD=K(0x5a5440),FIELD=K(0x7a5a3e),FIELD2=K(0x8a7448),ROAD=K(0xb4a07e),TUFA=K(0xd8d2c0),bed=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),m1=fbm(x/90,y/90,7.1,3),m2=fbm(x/34,y/34,3.3,2),m3=fbm(x/60,y/60,11.7,3);
  const A=k=>FC.at(FC.a[k],wx,wz),rock=A('rock'),wet=A('wet'),str=A('strata'),tal=A('talus'),road=A('road'),farm=A('farm'),seep=A('seep'),flow=A('flow'),sl=A('slope');
  c.copy(P.tawny).lerp(P.gold,clamp(.5+(m2-.5)*2.4,0,1));
  t.copy(P.olive).lerp(P.green,clamp(.5+n*2,0,1));c.lerp(t,clamp(smooth(.5,.68,m1)*.8+smooth(.45,.62,wet)*.6,0,.9));
  t.copy(P.red).lerp(P.red2,clamp(.5+n2*1.4,0,1));c.lerp(t,smooth(.6,.74,m3)*(.35+.65*smooth(.08,.3,sl))*.8);
  t.copy(P.stony).lerp(P.stony2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.3,.2,m1)*.55);
  t.copy(FIELD).lerp(FIELD2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.2,.7,farm)*.75);
  t.copy(P.rock).lerp(P.rock2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.35,.75,rock)*.85);
  if(FC.SF){bed.setRGB(FC.at(FC.SF.r,wx,wz),FC.at(FC.SF.g,wx,wz),FC.at(FC.SF.b,wx,wz));c.lerp(bed,smooth(.2,.6,str)*.75);}
  t.copy(P.rock2).lerp(P.stony2,clamp(.5+n2*1.2,0,1));c.lerp(t,tal*.55);
  t.copy(TUFA).lerp(P.green,clamp(.4+n*1.5,0,1));c.lerp(t,smooth(.3,.8,seep)*.7);
  t.copy(MUD).lerp(SHORE,clamp(.5+n*2,0,1));c.lerp(t,flow*.8);
  c.lerp(ROAD,smooth(.2,.8,road)*.55);
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
// THE LIBRARY GROUND LAYERS (materials.json ground.*) ON KGROUND (43-core-ground.js): hex-tiled, scaled with distance and blended by height over
// the painted ground; their weights are zone masks (GLW below, one vertex attribute each, normalised), each layer as it was mixed: a keep-0 layer
// is the painted colour times its relief, a keep-1 layer its own colour. ?kground=0: the old plain mix. Without the pack (?mat=proc, or no tex/)
// the ground is the paint.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
/* KGROUND's relief (core/terrain/GROUND.md): the bump from the layers' height (no texture unit) and the ground mesh's hollows (KGROUND.cavityMesh),
   on the MeshStandard ground; ?kgrelief=0 the before-and-after */
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const GLW=(function(){
 // each layer on a documented mask: the fields of 44v (wet, flow, rock, strata, farm, seep, road, slope); a station names the four it shows
 // (LAND.groundLayers)
 const open=F=>(1-F.rock)*(1-F.road*.8),flatK=F=>smooth(.45,.15,F.slope);
 /* the meadow's share: the wet ground (the rain line, the water's band once 89z binds it, the seep) and the swales of a slow patch noise (~300 m) */
 /* THE BAND LICHEN'S BANDS (PLAN.md section 4: crusts in level bands along the beds): every 7.5 m of height a band, its edge wandering a little, the
    basalt bare between them */
 const lichenBand=F=>{const f=F.y/7.5+.35*(fbm(F.x*.01,F.z*.01,3.7,2)-.5),u=f-Math.floor(f);return .15+.85*smooth(.5,.62,u)*smooth(.95,.83,u);};
 /* the hot floor under the stair (over ~25 degC mean: Korona's country): leaf litter, not the treads' grass; 0 on stations 1 and 2 */
 const hotK=F=>smooth(.3,.6,F.hot);
 const meadowK=F=>clamp(Math.max(smooth(.5,.68,F.wet),F.seep,F.flow*.9,smooth(.52,.68,fbm(F.x*.0028,F.z*.0028,7.1,3))*.85),0,1);
 return[['reed',F=>Math.max(F.flow*.85,smooth(.6,.85,F.wet)*flatK(F))*(1-F.farm)*(1-F.rock*.8)],    /* the shore's reed bed and the lake's shallows */
  ['meadow',F=>meadowK(F)*open(F)*(1-F.farm)*(1-hotK(F))],                                                         /* green grass in the swales, by the water and the seep (ground.leafy_grass) */
  ['steppe',F=>(1-meadowK(F))*open(F)*(1-F.farm)*(1-F.flow)*(1-hotK(F))],                                          /* the lake tread's summer-dry grass (ground.withered_grass) */
  ['terrace',F=>smooth(.15,.6,F.farm)*(1-F.flow)],                                                     /* the terraced fields */
  ['lichen',F=>F.rock*smooth(.2,.6,F.strata)*(1-F.flow)*lichenBand(F)],                               /* the band lichen in level bands along the riser's beds (stand-in: rock.lichen.circles) */
  ['tufa',F=>smooth(.35,.8,F.seep)*(1-F.flow)],                                                        /* the step moss's tufa round the seep's pools */
  ['gravel',F=>F.talus*(1-F.flow)],                                                                    /* the talus's gravel */
  ['litter',F=>hotK(F)*open(F)*(1-F.flow)]];})();                                                     /* the hot floor's leaf litter under the rainforest (station 3's floor: Korona's country) */

/* A FRAGMENT SHADER HAS 16 TEXTURE UNITS (WebGL's floor), AND ANGLE ON THE ARC LINKS 15 AT MOST (riftrim's and ebadlands' measure): the ground's paint
   and grain (2), the strata (5), the horizon (2), the rain's cover map (1) and KGROUND's noise (1) leave 5, so a land names the FOUR it shows
   (LAND.groundLayers: 15 counted on the linked program, 99's check; the shadow map, off at load, is the 16th when core/shadow's button turns it on).
   The Tiers' lake tread takes no wet-ground maps (LAND.wet false: 4 layers, not 2). */
const GL_USE=(LAND.groundLayers||['meadow','steppe','terrace','lichen']);
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;
 const P=n=>KMAT.packed('tiers','ground.'+n);if(GLW.some(l=>!P(l[0])))return null;
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
  .replace('#include <map_fragment>','#include <map_fragment>\n{float vGLs=clamp(dot(vGL0,vec4(1.0))+dot(vGL1,vec4(1.0))+dot(vGL2,vec4(1.0)),0.0,1.0)*'+(GL?'1.0':'0.0')+';vec3 dt=(pow(texture2D(uDetail,vGWP.xz*0.165).rgb,vec3(2.2))*1.12);vec3 dt2=(pow(texture2D(uDetail,vGWP.xz*0.021+0.37).rgb,vec3(2.2))*1.12);'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.88);vec3 _gP=diffuseColor.rgb;'+lay+'\n/*KGROUND*/\n'+
  // the procedural grain and cracks give way where a library layer carries its own; the water's wet band darkens the ground (aGM.z: 89z, WATER.fieldAt's shore)
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85*(1.0-0.7*vGLs))*(1.0-0.18*vCrack*(1.0-vGLs));diffuseColor.rgb*=mix(vec3(1.0),vec3(0.6,0.58,0.55),vGM.z);diffuseColor.rgb*=vAO;}');};   /* vAO: the ground's own cavity (below) */
// THE LAYERS ON KGROUND, each with its old weight and strength; the row's KINDS on documented masks (THE GROUND'S MASKS, below): DESERT PAVEMENT
// (`clast`, the Outlands' recipe: small varnished stones packed on the dry slopes, ?pave=0) and the TALUS's basalt scree (`clast` in 3D cells,
// blocks a hand to a metre across) under the Black Step
const KG_Q=GQ,KG_PAVE=KG_Q.get('pave')!=='0',KG_POLY=KG_Q.get('polygon')==='1';   /* no playa on the lake tread: the mud polygons only on ?polygon=1 */
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'tiers-ground'+(KG_PAVE?'p':'')+(KG_POLY?'g':''),at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:(GL?GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2),w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
  return KGROUND.layer('tiers','ground.'+l.name,{w,amt:1,gain:1,tint:'mix(_gP*'+(1/m).toFixed(4)+',vec3(1.0),'+l.keep.toFixed(2)+')',name:l.name});}):[]).concat([
 KG_PAVE?{kind:'clast',w:'vGM.x*(1.0-vRock)',amt:.72,proj:'xz',size:.06,matrix:.24,matrixColor:0x9a7a5a,sub:0,fleck:0,jitter:.95,vary:.3,
  palette:[0x2a1e18,0x3e2a20,0x553828,0x1e1814,0x4a3226,0x6a4a34],seed:311,name:'pavement'}:null,
 KG_POLY?{kind:'polygon',w:'vGM.y*(1.0-vRock)',amt:.85,size:3.2,width:.05,edgeTint:'vec3(0.62,0.56,0.5)',warp:.14,seed:312,name:'mud polygons'}:null,
 {kind:'clast',w:'vGM.w',amt:.8,proj:'tri',size:.7,matrix:.12,matrixColor:LAND.talusMatrix==null?0x8a6650:LAND.talusMatrix,sub:.2,fleck:0,jitter:.9,vary:.35,palette:LAND.talusPalette||[0x2e2c2a,0x3a3633,0x5a3c30,0x46423e,0x6a4a3a],seed:313,name:'talus'}])});
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
  if(GL){const wl=waterH(x,z);F.under=wl>-1e8&&y<wl?1:0;F.depth=F.under?wl-y:0;F.x=x;F.z=z;F.y=y;
   let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1)*(1-F.char);s+=v;return v;}),k1=s>1?1/s:1;   /* a burn (a station's char field) keeps its paint: no litter or turf over the ash */
   for(let q=0;q<4;q++){g0[k*4+q]=w[q]*k1;g1[k*4+q]=(w[q+4]||0)*k1;g2[k*4+q]=(w[q+8]||0)*k1;}}}
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
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
 /* the ground as drawn (core/drawn, item 28): its strip cells, for the eye and the audits */
 if(typeof KDRAWN!=='undefined'){const hh=new Float32Array(nx*nx);for(let k=0;k<nx*nx;k++)hh[k]=pos[k*3+1];KDRAWN.add(KDRAWN.grid({x0:-S/2,z0:-S/2,dx:cs,dz:cs,nx:N,nz:N,h:hh}));}
 const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel=LAND.name.replace(' (ideal type)','');scene.add(m);return m;})();
function ST_GROUND_N(){return LAND.groundN==null?560:LAND.groundN;}

const ROCK_MESHES=[];
// ---------------------------------------------------------------- the rock bodies (KSTACKS, 44w: the Black Step's spires and fins on the shore)
// Two meshes: the bedded bodies (mesa, butte, spire, fin) in the strata's own beds (the land's KSTRATA stack: the flood basalt, the chaos's ochre
// caps), shaded by the mesh's occlusion and the detail map; the rounded ones (dome, tor) in basalt grey. One registered volume per body; the flora
// keeps off them (BIO.init's mask, above). The dikes' fins are the harder rock the benches weathered out of (PLAN.md section 2)
(function(){if(!ROCK.length)return;
 const acc={bed:{pos:[],col:[],idx:[]},tor:{pos:[],col:[],idx:[]}},c=new THREE.Color(),GR=[0x4e4a48,0x5a5552,0x46423f];
 const NAME={mesa:'A chaos mesa',butte:'A butte',spire:'A spire',fin:'A dike fin',balanced:'A balanced rock',dome:'A knob',tor:'A basalt tor'};
 ROCK.forEach(B=>{const bedded=B.kind!=='dome'&&B.kind!=='tor',m=KSTACKS.mesh(B,{step:bedded?(B.kind==='fin'?2:5):2}),A=acc[bedded?'bed':'tor'],n0=A.pos.length/3;
  for(let v=0;v<m.part.length;v++){A.pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);c.setHex(GR[KRAND.hash(B.seed,m.bed[v],77)%GR.length]).multiplyScalar(.62+.38*m.occ[v]);A.col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)A.idx.push(n0+m.idx[i]);
  REGISTER({name:B.name||NAME[B.kind]||'A rock body',key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:B.R,h:B.top-B.y0});});
 const mk=(A,bedded)=>{if(!A.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(A.col,3));g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,color:bedded?0xffffff:0xb0aaa2});
  if(bedded)mat.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;')
    .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 dt=(pow(texture2D(uDetail,vSWP.xz*0.12+vSWP.y*0.07).rgb,vec3(2.2))*1.12);diffuseColor.rgb=strataColor(vSWP,vSWN)*(0.6+0.4*vColor.r/0.36)*(0.86+0.28*dt.r);}');};
  mat.customProgramCacheKey=()=>'tiers-rock-'+(bedded?1:0);
  const me=new THREE.Mesh(g,mat);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel=bedded?'Bedded basalt (the Black Step\'s outliers)':'A basalt knob';scene.add(me);return me;};
 ROCK_MESHES.push(mk(acc.bed,true),mk(acc.tor,false));
 /* an invisible anchor at each body's middle: the probe's registered-volume check finds something inside each one */
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),ROCK.length),M4=new THREE.Matrix4();
  ROCK.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}})();

// ---------------------------------------------------------------- the water
// core/water records (drawn in 89w-host-water.js): an OPEN lake (the upper lake: LAND's lake with open:true) is a WATER.open over the ground's
// bed, made in 89w on core/atmos's wave field; a small closed water (a cistern, a pool) a WATER.still over its outline; the river a WATER.flow
// from the land's RIVER_SPEC, each fall a WATER.fall. BIO.waterH is the land's waterH.
const RIVER=RIVER_SPEC?WATER.flow({name:RIVER_SPEC.name||'The river',pts:RIVER_SPEC.pts,width:RIVER_SPEC.width,speed:RIVER_SPEC.speed}):null;
const LAKE_STILLS=LAKES.map(L=>L.open?null:WATER.still({name:L.name,level:L.level,poly:L.poly}));
const FALL_RECS=FALLS.map(f=>WATER.fall(Object.assign({fit:true,spread:6,face:terrainH,faceLift:.8,faceN:48},f)));
// the largest lake: the mirror's (99: the reflections switch, off at page load)
const BIG_LAKE=LAKES.length?LAKES.reduce((a,b)=>(b.area==null?1:b.area)>(a.area==null?1:a.area)?b:a,LAKES[0]):null;
(function(){LAKES.forEach(L=>{if(!L.poly){L.cx=0;L.cz=0;L.r=TERR.R;return;}let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;L.poly.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 const cx=clamp((x0+x1)/2,-TERR.R,TERR.R),cz=clamp((z0+z1)/2,-TERR.R,TERR.R),r=Math.min(TERR.R,Math.max(x1-x0,z1-z0)/2);L.cx=cx;L.cz=cz;L.r=r;
 if(r<TERR.R*.7)REGISTER({name:L.name,x:cx,z:cz,y:L.level-12,r:r*1.15,h:60});});})();   /* a lake within the page: its basin and shore (a lake larger than the page names itself: the water's inspector label) */
