// ================================================================= HOST — the land (every station): renderer, light, ground, BIO.init
// [web] Reads the station's STAGE (45-host-stage.js): its ground, fields, zones, layers and paint. The ground is one mesh
// over 2.2 R: painted from the stage's colours on a coarse cache, the library's four layers (STAGE.layers, materials.json)
// blended over it by STAGE.weights (anti-tiled: two scales, one turned), with a fine grey detail. Then BIO.init with the
// stage's fields, the core/tags registry ('cut'), the obstacles, the LOD spine and the water's level.
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){if(o&&o.kind==='tree'&&CUT.warpDenied&&CUT.warpDenied(o.name))return;REG.push(o);BIO.record(o);}   /* a read-in tree the station does not keep is not named */
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xc6ccc4,.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,40000);
const HEMI=new THREE.HemisphereLight(0xc8d4cc,0x4a4630,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const sun=new THREE.DirectionalLight(0xfff2d4,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0cfc8,.30);fill.position.set(800,400,900);scene.add(fill);
const TERR={R:STAGE.R};
const terrainH=STAGE.ground;
const OBSTACLES=[];
const WATER_LEVEL=STAGE.water?STAGE.water.level:-1e9;
BIO.init({tags:'cut',THREE,scene,terrainH,
 mask:(x,z)=>{const d=terrainH(x,z)-WATER_LEVEL;return d<.15?0:d<.7?(d-.15)/.55:1;},
 waterH:STAGE.water?((x,z)=>WATER_LEVEL):((x,z)=>-1e9),
 obstacles:OBSTACLES,ticks:tick,seed:STAGE.seed,origin:STAGE.spine,center:[0,0],fields:STAGE.fields,err:reportErr,register:o=>REGISTER(o)});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
const GROUND=(function(){const N=420,S=TERR.R*2.2,NC=220;
 // the coarse cache of the paint and the weights (each a few field reads)
 const PC=new Float32Array(NC*NC*3),WC=new Float32Array(NC*NC*4);
 for(let j=0;j<NC;j++)for(let i=0;i<NC;i++){const x=(i/(NC-1)-.5)*S,z=(j/(NC-1)-.5)*S,k=j*NC+i,c=STAGE.paint(x,z),w=STAGE.weights(x,z);for(let q=0;q<3;q++)PC[k*3+q]=c[q];for(let q=0;q<4;q++)WC[k*4+q]=w[q]||0;}
 const at=(A,st,x,z,q)=>{const u=clamp((x/S+.5)*(NC-1),0,NC-1.001),v=clamp((z/S+.5)*(NC-1),0,NC-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,K=(a,b)=>A[((j+b)*NC+i+a)*st+q];
  return K(0,0)*(1-fu)*(1-fv)+K(1,0)*fu*(1-fv)+K(0,1)*(1-fu)*fv+K(1,1)*fu*fv;};
 const TEX=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=(y*w+x)*4,wx=(x/w-.5)*S,wz=(y/h-.5)*S,n=1+(KRAND.h3(x,y,3,STAGE.seed)-.5)*.08;
   for(let q=0;q<3;q++)d[o+q]=clamp(at(PC,3,wx,wz,q)*255*n,0,255);d[o+3]=255;}
  g.putImageData(id,0,0);});
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('cut',n):null;
 /* the fine grey detail: the library's tiling groundDetail (gravelly sand, as nwlowlands'); without the pack a flat white one */
 const DL=lib('groundDetail'),DET=DL?(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})(KMAT.textures(DL,{aniso:8}).map):BIO.canvasTex(4,4,g=>{g.fillStyle='#ececec';g.fillRect(0,0,4,4);});
 const L=STAGE.layers.map(lib),have=L.map(Boolean);
 const mat=new THREE.MeshLambertMaterial({map:TEX,color:0xa09e96});
 mat.onBeforeCompile=sh=>{sh.uniforms.uDet={value:DET};
  /* every layer tiles: a set filed as a leaf (the litter) loads clamped like a card, and a clamped map smears into stripes */
  L.forEach((l,i)=>{if(!l)return;const t=KMAT.textures(l,{aniso:8}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;sh.uniforms['uL'+i]={value:t};});
  const K=L.map(l=>l?(1/l.scale[0]).toFixed(4):'1.0');
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;varying vec4 vGL;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  let dec='uniform sampler2D uDet;varying vec4 vGL;varying vec3 vGWP;vec3 gAnti(sampler2D t,vec2 p,float k){float m=smoothstep(0.3,0.7,0.5+0.35*sin(p.x*0.0131+1.3)*sin(p.y*0.0097)+0.15*sin(p.x*0.029+p.y*0.023));vec2 q=mat2(0.799,-0.602,0.602,0.799)*p;return mix(pow(texture2D(t,p*k).rgb,vec3(2.2)),pow(texture2D(t,q*k*0.53+vec2(0.37,0.21)).rgb,vec3(2.2)),m);}';
  L.forEach((l,i)=>{if(l)dec+='uniform sampler2D uL'+i+';';});
  let body='{vec3 dt=texture2D(uDet,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDet,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);';
  /* a layer is full colour (the library's own: diffuse x it) or, STAGE.layerMul[i], a grey detail over the painted ground (paint x it) */
  ['x','y','z','w'].forEach((c,i)=>{if(L[i])body+='diffuseColor.rgb=mix(diffuseColor.rgb,'+(STAGE.layerMul&&STAGE.layerMul[i]?'diffuseColor.rgb*gAnti(uL'+i+',vGWP.xz,'+K[i]+')*1.6':'diffuse*gAnti(uL'+i+',vGWP.xz,'+K[i]+')*1.15')+',clamp(vGL.'+c+',0.0,0.92));';});
  body+='}';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+dec).replace('#include <map_fragment>','#include <map_fragment>\n'+body);};
 mat.customProgramCacheKey=()=>'cut-ground|'+have.join();
 const geo=new THREE.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,gl=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));for(let q=0;q<4;q++)gl[i*4+q]=at(WC,4,x,z,q);}
 geo.setAttribute('aGL',new THREE.BufferAttribute(gl,4));geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,mat);m.userData.probeSkip=true;m.userData.inspectLabel='ground';m.userData.host=true;scene.add(m);
 // the height of the RENDERED ground (the plane's cells, split on its diagonal): a thing set on terrainH between vertices floats or sinks
 const c=S/N;const meshH=(x,z)=>{const u=(x+S/2)/c,v=(z+S/2)/c,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,X=k=>-S/2+k*c;
  const h00=terrainH(X(i),X(j)),h10=terrainH(X(i+1),X(j)),h01=terrainH(X(i),X(j+1)),h11=terrainH(X(i+1),X(j+1));
  return fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);};
 return{mesh:m,mat,S,N,meshH,have};})();
