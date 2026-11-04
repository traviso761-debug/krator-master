// ================================================================= HOST — the land (every station): renderer, light, ground, BIO.init
// [web] Reads the station's STAGE (45-host-stage.js): its ground, fields, zones, layers and paint. The ground is one mesh over 2.2 R:
// painted from the stage's colours on a coarse cache, with core/terrain's KGROUND laying the library's layers over it by the stage's
// weights (the floor's pavement and asphalt, the rubble, the scars' glass, the two lowlands' soils, the shore's mud), hex-tiled and
// blended by height, and a fine grey detail. Then BIO.init with the stage's fields, the core/tags registry ('ancientsvalley'), the
// obstacles, the LOD spine and the water's level. The sun's shadows are core/shadow's, off unless ?shadow=1 (the owner, 2026-11-03).
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){if(o&&o.kind==='tree'&&AV.feralDenied&&AV.feralDenied(o.name))return;REG.push(o);BIO.record(o);}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xc4c6c8,.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.6,42000);
const HEMI=new THREE.HemisphereLight(0xc8d0d8,0x4a4438,.62);scene.add(HEMI);
const SUN_POS=[-1100,900,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0c4cc,.28);fill.position.set(800,400,-900);scene.add(fill);
const TERR={R:STAGE.R};
const terrainH=STAGE.ground;
const OBSTACLES=[];
const WATER_LEVEL=STAGE.water.level;
const waterH=(x,z)=>WATER_LEVEL;
BIO.init({tags:'ancientsvalley',THREE,scene,terrainH,
 mask:(x,z)=>{const d=terrainH(x,z)-WATER_LEVEL;return d<.15?0:d<.7?(d-.15)/.55:1;},
 waterH,obstacles:OBSTACLES,ticks:tick,seed:STAGE.seed,origin:STAGE.spine,center:[0,0],fields:STAGE.fields,err:reportErr,register:o=>REGISTER(o)});
BIO.setSun(SUN_POS);BIO.LOD.fade=.15;   /* the shells' dither band (kits/metropolis 60: uBand) */
// ---------------------------------------------------------------- the ground
const GROUND=(function(){const N=440,S=TERR.R*2.2,NC=240,NL=STAGE.layers.length;
 const PC=new Float32Array(NC*NC*3),WC=new Float32Array(NC*NC*NL);
 for(let j=0;j<NC;j++)for(let i=0;i<NC;i++){const x=(i/(NC-1)-.5)*S,z=(j/(NC-1)-.5)*S,k=j*NC+i,c=STAGE.paint(x,z),w=STAGE.weights(x,z);for(let q=0;q<3;q++)PC[k*3+q]=c[q];for(let q=0;q<NL;q++)WC[k*NL+q]=w[q]||0;}
 const at=(A,st,x,z,q)=>{const u=clamp((x/S+.5)*(NC-1),0,NC-1.001),v=clamp((z/S+.5)*(NC-1),0,NC-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,K=(a,b)=>A[((j+b)*NC+i+a)*st+q];
  return K(0,0)*(1-fu)*(1-fv)+K(1,0)*fu*(1-fv)+K(0,1)*(1-fu)*fv+K(1,1)*fu*fv;};
 const TEX=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=(y*w+x)*4,wx=(x/w-.5)*S,wz=(y/h-.5)*S,n=1+(KRAND.h3(x,y,3,STAGE.seed)-.5)*.08;
   for(let q=0;q<3;q++)d[o+q]=clamp(at(PC,3,wx,wz,q)*255*n,0,255);d[o+3]=255;}
  g.putImageData(id,0,0);});
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ancientsvalley',n):null;
 const DL=lib('groundDetail'),DET=DL?(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})(KMAT.textures(DL,{aniso:8}).map):BIO.canvasTex(4,4,g=>{g.fillStyle='#ececec';g.fillRect(0,0,4,4);});
 const mat=new THREE.MeshLambertMaterial({map:TEX,color:0x9e9c94});
 /* the page's own hook: the detail multiply, the weights' varyings (two vec4 attributes: seven layers), the KGROUND marker */
 mat.onBeforeCompile=sh=>{sh.uniforms.uDet={value:DET};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;attribute vec4 aGL2;varying vec4 vGL;varying vec4 vGL2;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGL2=aGL2;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDet;varying vec4 vGL;varying vec4 vGL2;varying vec3 vGWP;')
   .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDet,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDet,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);\n/*KGROUND*/}');};
 mat.customProgramCacheKey=()=>'av-ground';
 const GL_ON=AVQ_ON('kground')&&typeof KGROUND!=='undefined',have=[];
 /* each layer is tinted by the PAINT under it (diffuseColor at the marker: the page's map times its detail), not the flat material colour: the paint is
    also the canopy seen from afar (the stage's paint), and a pale library set washed it out to concrete from the air. The soils take it most */
 if(GL_ON){const W=['vGL.x','vGL.y','vGL.z','vGL.w','vGL2.x','vGL2.y','vGL2.z'],AMT=[.8,.85,.7,.95,.6,.6,.7],GAIN=[1.0,1.0,1.0,.9,1.0,1.0,.85],TINT=['mix(diffuse,diffuseColor.rgb*1.9,0.45)','mix(diffuse,diffuseColor.rgb*1.9,0.45)','mix(diffuse,diffuseColor.rgb*1.9,0.6)','diffuse','diffuseColor.rgb*2.1','diffuseColor.rgb*2.1','diffuseColor.rgb*1.9'];
  const LY=STAGE.layers.map((slot,i)=>{const l=KGROUND.layer('ancientsvalley',slot,{w:W[i],amt:AMT[i],gain:GAIN[i],tint:TINT[i],name:slot});have.push(!!l);return l;});
  KGROUND.hook(mat,{layers:LY.filter(Boolean),key:'ancientsvalley-ground'});}
 const geo=new THREE.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,gl=new Float32Array(p.count*4),gl2=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));for(let q=0;q<4;q++){gl[i*4+q]=at(WC,NL,x,z,q);gl2[i*4+q]=q+4<NL?at(WC,NL,x,z,q+4):0;}}
 geo.setAttribute('aGL',new THREE.BufferAttribute(gl,4));geo.setAttribute('aGL2',new THREE.BufferAttribute(gl2,4));geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,mat);m.userData.probeSkip=true;m.userData.inspectLabel='ground';m.userData.host=true;m.name='ground';scene.add(m);
 const c=S/N;const meshH=(x,z)=>{const u=(x+S/2)/c,v=(z+S/2)/c,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,X=k=>-S/2+k*c;
  const h00=terrainH(X(i),X(j)),h10=terrainH(X(i+1),X(j)),h01=terrainH(X(i),X(j+1)),h11=terrainH(X(i+1),X(j+1));
  return fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);};
 return{mesh:m,mat,S,N,meshH,have};})();
// ---------------------------------------------------------------- the far ground (the model's country out to 24 km: the far shore, the shelf, the walls' feet)
// A skirt of the model's own heights (STAGE.modelY) from the page's edge out across the record's grid, coarse (rings growing outward), vertex-coloured
// by height and water: the lake and its inlets flat at the lake's level, the land in the valley's greens, the city's grey where the density stands.
// It sits under the page's mesh where they overlap, and under the far water. Past it the shared sky's ridges (89s-host-sky.js) carry the land beyond.
const FAR_GROUND=(function(){const R0=TERR.R*1.08,R1=23000,NA=160,NR=56,pos=[],col=[],idx=[],LY=STAGE.lakeY;
 const fp=(x,z,h)=>{if(h<LY+.5)return[.12,.20,.22];const d=STAGE.F.density(x,z),zn=STAGE.F.zone(x,z);let c=zn==='floor'?[.30,.32,.24]:zn==='shelf'?[.27,.31,.21]:[.24,.30,.20];
  c=c.map((v,i)=>v+([.40,.39,.37][i]-v)*.7*d);return c;};
 for(let r=0;r<=NR;r++){const t=r/NR,rad=R0*Math.pow(R1/R0,t);for(let a=0;a<NA;a++){const an=a/NA*TAU,x=Math.cos(an)*rad,z=Math.sin(an)*rad,H2=TERR.R*1.1,under=Math.abs(x)<H2&&Math.abs(z)<H2;
   let h=STAGE.modelY(x,z);if(h<LY)h=LY-.6;if(under)h-=3;pos.push(x,h,z);const c=fp(x,z,h);col.push(Math.pow(c[0],2.2),Math.pow(c[1],2.2),Math.pow(c[2],2.2));}}
 for(let r=0;r<NR;r++)for(let a=0;a<NA;a++){const i=r*NA+a,j=r*NA+(a+1)%NA;idx.push(i,j,i+NA,j,j+NA,i+NA);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.probeSkip=true;m.userData.inspectLabel='the far country';m.userData.host=true;m.frustumCulled=false;scene.add(m);return m;})();
// the sun's shadows (core/shadow): one box that follows the view; the towers' heroes and the near rubble cast them. Off by default
MP.shadow=AVQ.get('shadow')==='1'&&typeof KSHADOW!=='undefined'?KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH}):null;
if(MP.shadow)GROUND.mesh.receiveShadow=true;
