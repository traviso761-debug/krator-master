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
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,42000);   /* near 1 m (was .6; Gemini's review, Q2): the 24-bit depth's step at 2 km from 0.4 m to 0.24 m, under a creeper's 0.35 m offset */
const HEMI=new THREE.HemisphereLight(0xc8d0d8,0x4a4438,.62);scene.add(HEMI);
const SUN_POS=[-1100,900,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0c4cc,.28);fill.position.set(800,400,-900);scene.add(fill);
const TERR={R:STAGE.R};
const terrainH=STAGE.ground;
/* what the kits stand on and read their mask by: GROUND.meshH once the drawn ground is built below (exact on every coarse or refined triangle) */
let kitH=STAGE.groundFast||terrainH;
const OBSTACLES=[];
const WATER_LEVEL=STAGE.water.level;
const waterH=(x,z)=>WATER_LEVEL;
BIO.init({tags:'ancientsvalley',THREE,scene,terrainH:(x,z)=>kitH(x,z),
 mask:(x,z)=>{const d=kitH(x,z)-WATER_LEVEL;return d<.15?0:d<.7?(d-.15)/.55:1;},
 waterH,obstacles:OBSTACLES,ticks:tick,seed:STAGE.seed,origin:STAGE.spine,center:[0,0],fields:STAGE.fields,err:reportErr,register:o=>REGISTER(o)});
BIO.setSun(SUN_POS);
BIO.INDEX_ITEMS=AVQ_ON('index');BIO.LOD.chunk=1600;BIO.LOD.merge=AVQ_ON('lodmerge');BIO.LOD.minTris=15000;BIO.LOD.fade=BIO.LOD.merge?.15:0;BIO.LOD.cull=AVQ_ON('lodcull');
// ---------------------------------------------------------------- the ground (A0.2: refined along carvings in 8 x 8 frustum-culled tiles; exact meshH)
const GROUND=(function(){const N=440,S=TERR.R*2.2,c=S/N,K=6,TN=8,NC=240,NL=STAGE.layers.length;
 const PC=new Float32Array(NC*NC*3),WC=new Float32Array(NC*NC*NL);
 for(let j=0;j<NC;j++)for(let i=0;i<NC;i++){const x=(i/(NC-1)-.5)*S,z=(j/(NC-1)-.5)*S,k=j*NC+i,col=STAGE.paint(x,z),w=STAGE.weights(x,z);for(let q=0;q<3;q++)PC[k*3+q]=col[q];for(let q=0;q<NL;q++)WC[k*NL+q]=w[q]==null?0:w[q];}
 const at=(A,st,x,z,q)=>{const u=clamp((x/S+.5)*(NC-1),0,NC-1.001),v=clamp((z/S+.5)*(NC-1),0,NC-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,K0=(a,b)=>A[((j+b)*NC+i+a)*st+q];
  return K0(0,0)*(1-fu)*(1-fv)+K0(1,0)*fu*(1-fv)+K0(0,1)*(1-fu)*fv+K0(1,1)*fu*fv;};
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
 /* each layer is tinted by the PAINT under it (diffuseColor at the marker: the page's map times its detail), not the flat material colour */
 if(GL_ON){const W=['vGL.x','vGL.y','vGL.z','vGL.w','vGL2.x','vGL2.y','vGL2.z'],AMT=[.8,.85,.7,.95,.6,.6,.7],GAIN=[1.0,1.0,1.0,.9,1.0,1.0,.85],TINT=['mix(diffuse,diffuseColor.rgb*1.9,0.45)','mix(diffuse,diffuseColor.rgb*1.9,0.45)','mix(diffuse,diffuseColor.rgb*1.9,0.6)','diffuse','diffuseColor.rgb*2.1','diffuseColor.rgb*2.1','diffuseColor.rgb*1.9'];
  const LY=STAGE.layers.map((slot,i)=>{const l=KGROUND.layer('ancientsvalley',slot,{w:W[i],amt:AMT[i],gain:GAIN[i],tint:TINT[i],name:slot});have.push(!!l);return l;});
  KGROUND.hook(mat,{layers:LY.filter(Boolean),key:'ancientsvalley-ground'});}
 /* carvings that refine 14 m cells into K x K = 2.3 m sub-quads: blast craters, street war craters, subway sinkholes/voids/pits, and rail cuttings */
 const feats=[];(STAGE.craters||[]).forEach(cr=>feats.push({x:cr.x,z:cr.z,r:cr.r*1.45+4}));
 if(STAGE.transit){(STAGE.transit.wars||[]).forEach(W=>(W.craters||[]).forEach(cr=>feats.push({x:cr.x,z:cr.z,r:cr.r*1.6+4})));
  const sw=STAGE.transit.subway;if(sw){(sw.sinkholes||[]).forEach(s=>feats.push({x:s.x,z:s.z,r:s.r+4}));(sw.voids||[]).forEach(v=>feats.push({x:v.x,z:v.z,r:Math.hypot(v.w/2,v.len/2)+v.ramp*1.5+4}));(sw.pits||[]).forEach(p=>feats.push({x:p.x,z:p.z,r:Math.hypot(p.w/2,p.run+.6)+4}));}}
 const featB=AV.bucket(feats,f=>f.r,128),fine=new Uint8Array(N*N),hasCargo=!!(STAGE.transit&&STAGE.transit.cargo&&STAGE.railD&&typeof KTRANSIT!=='undefined');
 let fineCells=0;
 if(AVQ_ON('refine')){for(let i=0;i<N;i++)for(let j=0;j<N;j++){const cx=-S/2+(i+.5)*c,cz=-S/2+(j+.5)*c,ix=featB(cx,cz);let hit=false;
   for(let q=0;q<ix.length;q++){const f=feats[ix[q]];if(Math.abs(f.x-cx)<f.r+c*.55&&Math.abs(f.z-cz)<f.r+c*.55){hit=true;break;}}
   if(!hit&&hasCargo&&STAGE.railD(cx,cz)<22&&Math.abs(KTRANSIT.lineH(STAGE.transit.cargo,cx,cz,{form:.45}))>.2)hit=true;
   if(hit){fine[i*N+j]=1;fineCells++;}}}
 const isFine=(i,j)=>i>=0&&j>=0&&i<N&&j<N&&fine[i*N+j]===1;
 const Wsub=N*K+1,vMap=new Int32Array(Wsub*Wsub);vMap.fill(-1);
 const pos=[],uvs=[],gl=[],gl2=[],I=[];
 const putV=(gi,gj,x,y,z)=>{const k=gi*Wsub+gj;let vi=vMap[k];if(vi>=0)return vi;vi=pos.length/3;vMap[k]=vi;pos.push(x,y,z);uvs.push(x/S+.5,.5-z/S);
  for(let q=0;q<4;q++){gl.push(at(WC,NL,x,z,q));gl2.push(q+4<NL?at(WC,NL,x,z,q+4):0);}return vi;};
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x0=-S/2+i*c,z0=-S/2+j*c,x1=x0+c,z1=z0+c;
  if(!isFine(i,j)){const a=putV(i*K,j*K,x0,terrainH(x0,z0),z0),b=putV((i+1)*K,j*K,x1,terrainH(x1,z0),z0),cc=putV((i+1)*K,(j+1)*K,x1,terrainH(x1,z1),z1),d=putV(i*K,(j+1)*K,x0,terrainH(x0,z1),z1);
   I.push(a,d,b,b,d,cc);continue;}
  const y00=terrainH(x0,z0),y10=terrainH(x1,z0),y11=terrainH(x1,z1),y01=terrainH(x0,z1),pinW=!isFine(i-1,j),pinE=!isFine(i+1,j),pinS=!isFine(i,j-1),pinN=!isFine(i,j+1),grid=[];
  for(let a=0;a<=K;a++){const row=[];for(let b=0;b<=K;b++){const x=x0+c*a/K,z=z0+c*b/K;let y;
    if(a===0&&b===0)y=y00;else if(a===K&&b===0)y=y10;else if(a===K&&b===K)y=y11;else if(a===0&&b===K)y=y01;
    else if(a===0&&pinW)y=y00+(y01-y00)*b/K;else if(a===K&&pinE)y=y10+(y11-y10)*b/K;else if(b===0&&pinS)y=y00+(y10-y00)*a/K;else if(b===K&&pinN)y=y01+(y11-y01)*a/K;else y=terrainH(x,z);
    row.push(putV(i*K+a,j*K+b,x,y,z));}grid.push(row);}
  for(let a=0;a<K;a++)for(let b=0;b<K;b++){const p0=grid[a][b],q0=grid[a+1][b],r0=grid[a+1][b+1],s0=grid[a][b+1];I.push(p0,s0,q0,q0,s0,r0);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geo.setAttribute('aGL',new THREE.Float32BufferAttribute(gl,4));geo.setAttribute('aGL2',new THREE.Float32BufferAttribute(gl2,4));geo.setIndex(I);geo.computeVertexNormals();
 const PArr=geo.attributes.position.array,TW=S/TN,tileIdx=[];for(let t=0;t<TN*TN;t++)tileIdx.push([]);
 for(let t=0;t<I.length;t+=3){const i0=I[t]*3,i1=I[t+1]*3,i2=I[t+2]*3,mx=(PArr[i0]+PArr[i1]+PArr[i2])/3,mz=(PArr[i0+2]+PArr[i1+2]+PArr[i2+2])/3;
  const tx=Math.max(0,Math.min(TN-1,Math.floor((mx+S/2)/TW))),tz=Math.max(0,Math.min(TN-1,Math.floor((mz+S/2)/TW)));tileIdx[tx*TN+tz].push(I[t],I[t+1],I[t+2]);}
 const grp=new THREE.Group();grp.name='ground';grp.userData.probeSkip=true;grp.userData.inspectLabel='ground';grp.userData.host=true;
 const tiles=[];
 tileIdx.forEach((ti,t)=>{if(!ti.length)return;const tg=new THREE.BufferGeometry();tg.setAttribute('position',geo.attributes.position);tg.setAttribute('normal',geo.attributes.normal);
  tg.setAttribute('uv',geo.attributes.uv);tg.setAttribute('aGL',geo.attributes.aGL);tg.setAttribute('aGL2',geo.attributes.aGL2);tg.setIndex(ti);
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(let q=0;q<ti.length;q++){const v=ti[q]*3,vx=PArr[v],vy=PArr[v+1],vz=PArr[v+2];if(vx<x0)x0=vx;if(vx>x1)x1=vx;if(vy<y0)y0=vy;if(vy>y1)y1=vy;if(vz<z0)z0=vz;if(vz>z1)z1=vz;}
  tg.boundingBox=new THREE.Box3(new THREE.Vector3(x0,y0,z0),new THREE.Vector3(x1,y1,z1));tg.boundingSphere=tg.boundingBox.getBoundingSphere(new THREE.Sphere());
  const tm=new THREE.Mesh(tg,mat);tm.frustumCulled=true;tm.userData.probeSkip=true;tm.userData.ground=true;tm.userData.inspectLabel='ground';tm.userData.host=true;tm.userData.tile=t;tm.userData.tris=ti.length/3;tm.name='ground';grp.add(tm);tiles.push(tm);});
 scene.add(grp);
 const yAt=(gi,gj)=>{const vi=vMap[gi*Wsub+gj];return vi>=0?PArr[vi*3+1]:terrainH(-S/2+gi*(c/K),-S/2+gj*(c/K));};
 const triH=(h00,h10,h01,h11,fu,fv)=>fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);
 const meshH=(x,z)=>{const u=(x+S/2)/c,v=(z+S/2)/c;if(!(u>=0&&v>=0&&u<N&&v<N))return terrainH(x,z);
  const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  if(!isFine(i,j))return triH(yAt(i*K,j*K),yAt((i+1)*K,j*K),yAt(i*K,(j+1)*K),yAt((i+1)*K,(j+1)*K),fu,fv);
  const su=fu*K,sv=fv*K,sa=Math.min(K-1,Math.floor(su)),sb=Math.min(K-1,Math.floor(sv));
  return triH(yAt(i*K+sa,j*K+sb),yAt(i*K+sa+1,j*K+sb),yAt(i*K+sa,j*K+sb+1),yAt(i*K+sa+1,j*K+sb+1),su-sa,sv-sb);};
 return{mesh:grp,tiles,mat,S,N,K,fineCells,tris:I.length/3,meshH,have};})();
kitH=GROUND.meshH;
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
// the sun's shadows (core/shadow, A2.1): one box that follows the view; on by default (?shadow=0 opts out)
{const gls=renderer.getContext(),dbi=gls&&gls.getExtension('WEBGL_debug_renderer_info'),sw=!!(dbi&&/SwiftShader|llvmpipe/i.test(gls.getParameter(dbi.UNMASKED_RENDERER_WEBGL)||''));
 MP.shadow=AVQ_ON('shadow')&&typeof KSHADOW!=='undefined'?KSHADOW.attach({renderer,scene,camera,sun,on:true,size:sw?1024:2048,soft:!sw,ground:GROUND.meshH}):null;}
if(MP.shadow)GROUND.tiles.forEach(t=>{t.receiveShadow=true;});
;
