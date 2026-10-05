// ================================================================= OPEN WORLD — the terrain: a quadtree of chunks, streamed by distance
// [G native] Godot's terrain (a clipmap or chunked LOD) replaces this; what crosses over is WORLD.H and the ground's
// colour function, which are data. The square root (2^21 m) covers the region's box; a node splits while the camera is
// nearer than SPLIT (1.05) times its size, down to 128 m chunks (2 m between vertices). Each chunk is a 64 x 64 grid with a
// skirt (no cracks where a fine chunk meets a coarse one), its own origin (its vertices are local, so a world a
// million metres across draws without float jitter), and its own height grid, which the floor and the water read.
// A chunk asks WORLD.H for no detail finer than 1.5 of its vertex spacings (minWave): far chunks are cheap and do not
// alias. A node draws until all four of its children are built, so the land never has holes while it streams.
var TERRAIN;LATE.push(()=>{TERRAIN=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera;
const ROOT=2097152,MAXL=14,NSEG=64,SPLIT=1.05,BOX=WORLD.box();
const S={chunks:0,built:0,drawn:0,ms:0,queue:0};
// ---------------------------------------------------------------- the ground material: vertex colour, strata on rock, detail
const STRATA=BIO.strata({seed:4711,columnM:220});
const DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data,N=KRELIEF.noise(77);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  // tileable: the noise is sampled on a torus (two periodic coordinates)
  const a=x/w*Math.PI*2,b=y/h*Math.PI*2,v=N.fbm(Math.cos(a)*6+20,Math.sin(a)*6+Math.cos(b)*6,4)*.7+N.vn(Math.sin(b)*9+40,Math.cos(a)*9)*.3;
  const c=clamp255(200+(v-.5)*150);d[i]=d[i+1]=d[i+2]=c;d[i+3]=255;}
 g.putImageData(id,0,0);});
function clamp255(v){return v<0?0:v>255?255:v;}
DETAIL.wrapS=DETAIL.wrapT=THREE.RepeatWrapping;DETAIL.anisotropy=4;
const MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});   // both sides: the skirts face either way
// the map overlays (the camera's "overlay" switch): each vertex carries the Köppen class's colour and the biome
// overlay's colour of its map pixel; uOverlay picks one (0 none, 1 Köppen, 2 biome) and tints the lit ground with it
const OVERLAY={value:0};
MAT.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:DETAIL};sh.uniforms.uOverlay=OVERLAY;sh.uniforms.uRoad={value:new THREE.Color(0xa49a8a).convertSRGBToLinear()};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aRock;attribute vec2 aDUV;attribute vec3 aOvK;attribute vec3 aOvB;attribute float aRoad;varying float vRoad;varying float vRock;varying vec2 vDUV;varying float vDist;varying vec3 vOvK;varying vec3 vOvB;')
  .replace('#include <project_vertex>','#include <project_vertex>\nvRock=aRock;vRoad=aRoad;vDUV=aDUV;vDist=-mvPosition.z;vOvK=aOvK;vOvB=aOvB;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform float uOverlay;uniform vec3 uRoad;varying float vRoad;varying float vRock;varying vec2 vDUV;varying float vDist;varying vec3 vOvK;varying vec3 vOvB;')
  .replace('#include <map_fragment>',['#include <map_fragment>',
   '{vec3 bc=strataColor(vSWP,vSWN);',
   ' float fd=smoothstep(60.0,900.0,vDist),ff=smoothstep(900.0,9000.0,vDist);',
   ' vec3 d1=texture2D(uDetail,vDUV*0.31).rgb,d2=texture2D(uDetail,vDUV*0.043+0.37).rgb,d3=texture2D(uDetail,vDUV*0.0061+0.71).rgb,d4=texture2D(uDetail,vDUV*0.00083+0.13).rgb;',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*d2.r),vRock*0.85*(1.0-ff*0.6));',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,uRoad*(0.82+0.36*d1.g),vRoad);',   // a highway's packed gravel
   ' vec3 near=d1*d2*1.16,mid=d2*d3*1.12,far=d3*d4*1.1;',
   ' diffuseColor.rgb*=mix(mix(near,mid,fd),far,ff);',
   ' if(uOverlay>0.5){vec3 oc=uOverlay<1.5?vOvK:vOvB;diffuseColor.rgb=mix(diffuseColor.rgb,oc*(0.8+0.25*d3.r),0.82);}}'].join('\n'));};
MAT.customProgramCacheKey=()=>'world-ground';

// ---------------------------------------------------------------- nodes
function Node(cx,cz,s,l,parent){this.cx=cx;this.cz=cz;this.s=s;this.l=l;this.parent=parent;this.kids=null;this.chunk=null;this.queued=false;
 this.inBox=!(cx+s/2<BOX[0]||cx-s/2>BOX[2]||cz+s/2<BOX[1]||cz-s/2>BOX[3]);this.y0=-3000;this.y1=14000;this.used=0;}
const root=new Node(0,0,ROOT,0,null);
const ALL=new Set();
function kidsOf(n){if(!n.kids){const q=n.s/4,h=n.s/2;n.kids=[new Node(n.cx-q,n.cz-q,h,n.l+1,n),new Node(n.cx+q,n.cz-q,h,n.l+1,n),new Node(n.cx-q,n.cz+q,h,n.l+1,n),new Node(n.cx+q,n.cz+q,h,n.l+1,n)];}return n.kids;}
function distTo(n,P){const dx=Math.max(0,Math.abs(P.x-n.cx)-n.s/2),dz=Math.max(0,Math.abs(P.z-n.cz)-n.s/2),dy=Math.max(0,n.y0-P.y,P.y-n.y1);return Math.hypot(dx,dy,dz);}

// ---------------------------------------------------------------- building a chunk
const G=NSEG+3;   // the height grid with a one-vertex border for the normals
const _P={},_F={},_C=[0,0,0,0];
const PK=WORLD.PARTS,NPK=PK.length;
const HB=new Float32Array(G*G),PB=new Float32Array(G*G*NPK);
function buildChunk(n){const t0=performance.now();
 const s=n.s,ds=s/NSEG,x0=n.cx-s/2,z0=n.cz-s/2,mw=ds*1.5;
 for(let j=0;j<G;j++)for(let i=0;i<G;i++){const x=x0+(i-1)*ds,z=z0+(j-1)*ds,k=j*G+i;
  HB[k]=WORLD.Hp(x,z,mw,_P);for(let p=0;p<NPK;p++)PB[k*NPK+p]=_P[PK[p]];}
 const V=(NSEG+1)*(NSEG+1),SK=4*NSEG,NV=V+SK+4;
 const pos=new Float32Array(NV*3),nor=new Float32Array(NV*3),col=new Float32Array(NV*3),rock=new Float32Array(NV),road=new Float32Array(NV),duv=new Float32Array(NV*2),ovk=new Float32Array(NV*3),ovb=new Float32Array(NV*3);
 const grid=new Float32Array(V);let y0=1e9,y1=-1e9,wet=false,anyWater=false;
 const ox=Math.floor(x0/4096)*4096,oz=Math.floor(z0/4096)*4096;
 for(let j=0;j<=NSEG;j++)for(let i=0;i<=NSEG;i++){const k=(j+1)*G+(i+1),v=j*(NSEG+1)+i,x=x0+i*ds,z=z0+j*ds,h=HB[k];
  const hx=(HB[k+1]-HB[k-1])/(2*ds),hz=(HB[k+G]-HB[k-G])/(2*ds),nl=Math.hypot(hx,1,hz);
  pos[v*3]=i*ds;pos[v*3+1]=h;pos[v*3+2]=j*ds;nor[v*3]=-hx/nl;nor[v*3+1]=1/nl;nor[v*3+2]=-hz/nl;
  for(let p=0;p<NPK;p++)_P[PK[p]]=PB[k*NPK+p];
  const F=WORLD.fieldsFrom(x,z,h,Math.hypot(hx,hz),_P,_F);WORLD.ground(x,z,F,_C);
  col[v*3]=_C[0];col[v*3+1]=_C[1];col[v*3+2]=_C[2];rock[v]=_C[3];road[v]=WORLD.roadCover(x,z,ds);duv[v*2]=x-ox;duv[v*2+1]=z-oz;
  const ck=WORLD.classColour(x,z),cb=WORLD.biomeColour(x,z);for(let q=0;q<3;q++){ovk[v*3+q]=ck[q];ovb[v*3+q]=cb[q];}
  grid[v]=h;if(h<y0)y0=h;if(h>y1)y1=h;if(F.water>-1e8){anyWater=true;if(F.water>h-.5)wet=true;}}
 // the skirt: every edge vertex again, hung below
 const skD=4+s*.02;let sv=V;const edge=[];
 for(let i=0;i<NSEG;i++)edge.push(i);for(let j=0;j<NSEG;j++)edge.push(j*(NSEG+1)+NSEG);
 for(let i=NSEG;i>0;i--)edge.push(NSEG*(NSEG+1)+i);for(let j=NSEG;j>0;j--)edge.push(j*(NSEG+1));
 const skirtOf=[];
 for(const v of edge){pos[sv*3]=pos[v*3];pos[sv*3+1]=pos[v*3+1]-skD;pos[sv*3+2]=pos[v*3+2];
  nor[sv*3]=nor[v*3];nor[sv*3+1]=nor[v*3+1];nor[sv*3+2]=nor[v*3+2];col[sv*3]=col[v*3];col[sv*3+1]=col[v*3+1];col[sv*3+2]=col[v*3+2];
  rock[sv]=rock[v];road[sv]=road[v];duv[sv*2]=duv[v*2];duv[sv*2+1]=duv[v*2+1];for(let q=0;q<3;q++){ovk[sv*3+q]=ovk[v*3+q];ovb[sv*3+q]=ovb[v*3+q];}skirtOf.push(sv);sv++;}
 const idx=[];
 for(let j=0;j<NSEG;j++)for(let i=0;i<NSEG;i++){const a=j*(NSEG+1)+i,b=a+NSEG+1,c=b+1,d=a+1;idx.push(a,b,d,b,c,d);}
 for(let e=0;e<edge.length;e++){const a=edge[e],b=edge[(e+1)%edge.length],sa=skirtOf[e],sb=skirtOf[(e+1)%edge.length];idx.push(a,sa,b,b,sa,sb);}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos.subarray(0,sv*3),3));g.setAttribute('normal',new THREE.BufferAttribute(nor.subarray(0,sv*3),3));
 g.setAttribute('color',new THREE.BufferAttribute(col.subarray(0,sv*3),3));g.setAttribute('aRock',new THREE.BufferAttribute(rock.subarray(0,sv),1));g.setAttribute('aRoad',new THREE.BufferAttribute(road.subarray(0,sv),1));
 g.setAttribute('aDUV',new THREE.BufferAttribute(duv.subarray(0,sv*2),2));g.setIndex(idx);
 g.setAttribute('aOvK',new THREE.BufferAttribute(ovk.subarray(0,sv*3),3));g.setAttribute('aOvB',new THREE.BufferAttribute(ovb.subarray(0,sv*3),3));
 g.boundingSphere=new THREE.Sphere(new THREE.Vector3(s/2,(y0+y1)/2,s/2),Math.hypot(s*.71,(y1-y0)/2+skD));
 const m=new THREE.Mesh(g,MAT);m.position.set(x0,0,z0);m.matrixAutoUpdate=false;m.updateMatrix();m.visible=false;m.userData.terrain=n;
 m.userData.inspectLabel='ground';scene.add(m);
 n.chunk={mesh:m,grid,x0,z0,ds,y0,y1,water:null,floor:null,anyWater,wet};n.y0=y0-skD;n.y1=y1;
 ALL.add(n);S.chunks=ALL.size;S.built++;S.ms+=performance.now()-t0;
 if(wet&&typeof WATER!=='undefined')WATER.forChunk(n);
 if(typeof FLOOR!=='undefined')FLOOR.forChunk(n);
 return n.chunk;}
function freeChunk(n){const c=n.chunk;if(!c)return;scene.remove(c.mesh);c.mesh.geometry.dispose();
 if(c.water){scene.remove(c.water);c.water.geometry.dispose();}
 if(c.floor&&typeof FLOOR!=='undefined')FLOOR.free(n);
 n.chunk=null;ALL.delete(n);S.chunks=ALL.size;}
// the height the chunk DRAWS at (x,z) (bilinear on its grid, as its triangles are split): what the floor stands on
function chunkH(c,x,z){const u=(x-c.x0)/c.ds,v=(z-c.z0)/c.ds,i=Math.max(0,Math.min(NSEG-1,Math.floor(u))),j=Math.max(0,Math.min(NSEG-1,Math.floor(v))),fu=u-i,fv=v-j,N1=NSEG+1;
 const h00=c.grid[j*N1+i],h10=c.grid[j*N1+i+1],h01=c.grid[(j+1)*N1+i],h11=c.grid[(j+1)*N1+i+1];
 // the index splits each cell on its (i,j+1)-(i+1,j) diagonal
 return fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);}

// ---------------------------------------------------------------- the frame: choose what to draw, queue what is missing
let frame=0;const want=[];
function select(n,P,draw){n.used=frame;
 const split=n.l<MAXL&&distTo(n,P)<SPLIT*n.s;
 if(split){const K=kidsOf(n).filter(k=>k.inBox);let ready=true;
  for(const k of K)if(!k.chunk){ready=false;want.push(k);}
  if(ready&&K.length){for(const k of K)select(k,P,draw);return;}}
 if(n.chunk)draw.push(n);else{want.push(n);if(n.parent&&n.parent.chunk)draw.push(n.parent);}}
let drawn=[];
function vis(n,on){const c=n.chunk;c.mesh.visible=on;if(c.water)c.water.visible=on;if(c.floor&&typeof FLOOR!=='undefined')FLOOR.show(n,on);}
function update(budgetMs){frame++;const P=camera.position;want.length=0;const draw=[];
 select(root,P,draw);
 for(const n of drawn)if(n.chunk)n.chunk.mesh.visible=false;
 for(const n of draw)n.chunk.mesh.visible=true;
 for(const n of drawn)if(n.chunk&&!n.chunk.mesh.visible)vis(n,false);
 for(const n of draw)vis(n,true);
 drawn=draw;S.drawn=draw.length;
 // build the missing: coarse first (the land must exist before it is refined), then the nearest
 want.sort((a,b)=>a.l-b.l||distTo(a,P)-distTo(b,P));S.queue=want.length;
 const t0=performance.now();for(const n of want){if(n.chunk)continue;buildChunk(n);if(performance.now()-t0>budgetMs)break;}
 // free what has not been needed for a while
 if(ALL.size>700&&frame%30===0){const old=[...ALL].filter(n=>frame-n.used>240).sort((a,b)=>a.used-b.used);
  for(const n of old.slice(0,ALL.size-600))if(n.l>3)freeChunk(n);}}
// the drawn chunk under (x,z): the leaf the frame draws there, for anything that must sit on the drawn surface
function drawnAt(x,z){for(const n of drawn){const c=n.chunk;if(x>=c.x0&&z>=c.z0&&x<=c.x0+n.s&&z<=c.z0+n.s)return n;}return null;}
function heightDrawn(x,z){const n=drawnAt(x,z);return n?chunkH(n.chunk,x,z):WORLD.H(x,z);}
return{OVERLAY,stats:S,update,chunkH,drawnAt,heightDrawn,MAT,STRATA,meshes:()=>drawn.map(n=>n.chunk.mesh),pending:()=>want.length,NSEG,MAXL,ROOT};})();});
