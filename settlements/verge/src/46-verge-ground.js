// ================================================================= VERGE — the ground ([draw])
// The ground is cut into TILES so each part of a 30 km map gets the detail it needs and the camera culls the rest:
// 512 m tiles over the near map (x -6144..4096, z -2048..2048), each at 2, 4, 8, 16 or 32 m cells by what is on it
// (the switchback at 2 m; the cities and the gorge at 4 m; the canyon and the escarpment at 8 m), and 2048 m tiles at 64 m beyond,
// out to the salt lakes. Neighbours of different detail meet over a skirt hung from every edge. Each tile's heights
// come from one sampling of terrainH (with an apron for the normals), its colours from the fields and the city's paint
// (VERGE_PAINT, the placement pass 70), its rock weight (the strata shader) from its slope.
// buildGround() runs from the build order (88), after the placement pass, so the streets are painted.
const GROUND={tiles:[],tris:0,ms:0,group:null};
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(BIO.fn.fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.strokeStyle='rgba(70,60,50,.55)';g.lineCap='round';
 const R=KRAND.stream(KRAND.child(VG.SEED,'cracks')),P=[];for(let i=0;i<16;i++)P.push([R.next()*w,R.next()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4||R.next()<.45)continue;
  g.lineWidth=R.range(1.2,2.6);const mx=(a[0]+b[0])/2+R.range(-18,18),mz=(a[1]+b[1])/2+R.range(-18,18);
  for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo(mx+k*w,mz+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// the bedded rock (35-core-strata), shared with the cliffs, the gorge and anything carved: a column of 260 m of beds
const STRATA=BIO.strata({seed:9137,columnM:260,cap:[VG.E.PLAT-26,VG.E.PLAT-6],foot:VG.E.FLOOR});
const ROCK_DETAIL='vec3 triDetail(sampler2D t,vec3 p,vec3 n,float s,float o){vec3 w=pow(abs(normalize(n)),vec3(4.0));w/=w.x+w.y+w.z;'+
 'return texture2D(t,p.zy*s+o).rgb*w.x+texture2D(t,p.xz*s+o).rgb*w.y+texture2D(t,p.xy*s+o).rgb*w.z;}';
const MAT_GROUND=new THREE.MeshLambertMaterial({vertexColors:true,color:0xffffff});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uCrack={value:TEX_CRACK};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;varying float vCrack;varying float vRock;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;varying float vRock;\n'+ROCK_DETAIL)
  .replace('#include <color_fragment>','#include <color_fragment>\n{float dc=length(cameraPosition-vGWP);float fine=1.0-smoothstep(300.0,1400.0,dc);'+
  'vec3 dt=triDetail(uDetail,vGWP,vSWN,0.165,0.0);vec3 dt2=triDetail(uDetail,vGWP,vSWN,0.021,0.37);vec3 ck=texture2D(uCrack,vGWP.xz*0.11).rgb;'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.92);'+
  'diffuseColor.rgb*=mix(vec3(1.0),mix(vec3(1.0),dt,fine)*dt2*1.12,0.8)*mix(vec3(1.0),ck,vCrack*fine);}');};
MAT_GROUND.customProgramCacheKey=()=>'verge-ground';
// the paint: what colour the ground is at (x,z), given its height and slope (sRGB hex mixing in THREE.Color)
const GP=(function(){const C=h=>new THREE.Color(h);return{
 red1:C(0xa85a42),red2:C(0x884834),pale:C(0xc99a72),scrub:C(0x9e6a4c),dune:C(0xd6a476),
 silt:C(0xb49a78),silt2:C(0x9a8466),damp:C(0x5a5040),alga:C(0x6a7a48),grass:C(0x7b7c48),
 talus:C(0xa06848),talus2:C(0x8a5840),
 sand:C(0xc6aa88),sand2:C(0xb09272),salt:C(0xe6e0d4),crust:C(0xf1ede6),mud:C(0x6a5a48),rip:C(0x7c7e52),
 trail:C(0xcfae88),streetU:C(0x8c664c),streetL:C(0x9c8264),plazaU:C(0x9a7c64),plazaL:C(0xcfc2a6),yard:C(0xa98e72),field:C(0x7a7442)};})();
const _gc=new THREE.Color(),_gt=new THREE.Color();
function groundColour(x,z,h,slope,out){
 const L=VG.lipX(z),up=x<L,n1=VG.vn(x*.05,z*.05,11)-.5,n2=VG.vn(x*.009,z*.009,12)-.5;
 if(up){const can=fieldAt('canyon',x,z),wet=fieldAt('wet',x,z),flow=fieldAt('flow',x,z),dune=fieldAt('dune',x,z);
  out.copy(GP.red1).lerp(GP.red2,clamp(.5+n2*1.8,0,1)).lerp(GP.pale,clamp(n1*.6+.25,0,1)*.35).lerp(GP.dune,dune*.6);
  out.lerp(GP.scrub,clamp(.35*smooth(.15,.45,wet),0,1));
  _gt.copy(GP.silt).lerp(GP.silt2,smooth(.55,.9,wet)).lerp(GP.grass,smooth(.6,.92,wet)*.55);out.lerp(_gt,smooth(.3,.85,can));
  out.lerp(GP.damp,smooth(.55,.95,flow)*.7);out.lerp(GP.alga,smooth(.85,1,flow)*.3);}
 else{const u=(x-L)/VG.escW(z,x);
  if(u<1){out.copy(GP.talus).lerp(GP.talus2,clamp(.5+n2*1.6,0,1)).lerp(GP.pale,clamp(n1*.5+.2,0,1)*.25);}
  else{const wet=fieldAt('wet',x,z),flow=fieldAt('flow',x,z),salt=fieldAt('salt',x,z);
   out.copy(GP.sand).lerp(GP.sand2,clamp(.5+n2*1.6,0,1)).lerp(GP.pale,clamp(n1*.5+.2,0,1)*.2);
   out.lerp(GP.rip,smooth(.5,.9,wet)*.6);out.lerp(GP.mud,smooth(.7,1,flow)*.55);
   _gt.copy(GP.salt).lerp(GP.crust,clamp(.5+n1*1.5,0,1));out.lerp(_gt,smooth(.25,.8,salt));}}
 // the city's paint: streets, plazas, yards, fields (VERGE_PAINT from the placement pass)
 // (averaged over this vertex's cell, GROUND_R: a street fades in by how much of the cell it covers)
 if(typeof VERGE_PAINT!=='undefined'&&VERGE_PAINT.cover){const p=VERGE_PAINT.cover(x,z,GROUND_R);if(p){
  out.lerp(GP.yard,p.yard*.55*.85);out.lerp(up?GP.plazaU:GP.plazaL,p.plaza*.85);out.lerp(up?GP.streetU:GP.streetL,p.street*.85);}}
 const tn=VG.trailNear(x,z);if(tn&&tn.d<VG.TRAIL.half+2.5)out.lerp(GP.trail,smooth(VG.TRAIL.half+2.5,VG.TRAIL.half,tn.d)*.85);
 const pd=VG.padAt(x,z);if(pd)out.lerp(GP.trail,pd.k*.6);
 if(x<-2700&&x>-3700){const rp=VG.rampNear(x,z);if(rp)out.lerp(GP.trail,smooth(rp.R.half+2,rp.R.half,rp.d)*.75);}
 const k=1+n1*.12;out.r=clamp(out.r*k,0,1);out.g=clamp(out.g*k,0,1);out.b=clamp(out.b*k,0,1);
 return out;}
// the cell size a tile needs, from what stands on it
function tileCell(x0,z0,S){
 const hit=(b)=>!(b[1]<x0||b[0]>x0+S||b[3]<z0||b[2]>z0+S);
 const U=VG.CITY.upper.box,Lw=VG.CITY.lower.box;
 if(hit([VG.E.LIP_X-30,40,-170,150]))return 2;      // the switchback: a 4.4 m trail on a carved bench needs 2 m cells
 if(hit(U)||hit(Lw)||hit([VG.GORGE.x0-10,VG.POOL.x+VG.POOL.r+30,-300,-150]))return 4;
 let esc=false,can=false;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){const x=x0+S*i/4,z=z0+S*j/4,L=VG.lipX(z);
  if(x>L-80&&x<L+VG.escW(z,x)+60)esc=true;if(x<L&&Math.abs(z-VG.canZ(x))<VG.canHW(x)+VG.CAN_WALL+60)can=true;}
 if(esc||can)return 8;
 const cx=x0+S/2,cz=z0+S/2;if(Math.abs(cz)<1600&&cx>-5000&&cx<3600)return 16;return 32;}
let GROUND_R=2;   // half the cell of the tile being built: the footprint groundColour averages the city's paint over
function makeTile(x0,z0,S,cell){GROUND_R=cell/2;
 const N=Math.round(S/cell),M=N+3,Hh=new Float32Array(M*M);       // heights with a one-cell apron
 for(let j=0;j<M;j++)for(let i=0;i<M;i++)Hh[j*M+i]=terrainH(x0+(i-1)*cell,z0+(j-1)*cell);
 const nv=(N+1)*(N+1),sk=4*(N+1),pos=new Float32Array((nv+sk)*3),nor=new Float32Array((nv+sk)*3),col=new Float32Array((nv+sk)*3),rk=new Float32Array(nv+sk),ck=new Float32Array(nv+sk);
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const v=j*(N+1)+i,x=x0+i*cell,z=z0+j*cell,h=Hh[(j+1)*M+i+1];
  const hx=Hh[(j+1)*M+i+2]-Hh[(j+1)*M+i],hz=Hh[(j+2)*M+i+1]-Hh[j*M+i+1];
  let nx=-hx,ny=2*cell,nz=-hz;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
  pos[v*3]=x;pos[v*3+1]=h;pos[v*3+2]=z;nor[v*3]=nx;nor[v*3+1]=ny;nor[v*3+2]=nz;
  const slope=clamp(Math.hypot(hx,hz)/(2*cell)*1.6,0,1);
  groundColour(x,z,h,slope,_gc);_gc.convertSRGBToLinear();col[v*3]=_gc.r;col[v*3+1]=_gc.g;col[v*3+2]=_gc.b;
  // rock where it is steep; on the spur, outcrops of the beds between the scree (never on the trail or a pad)
  let r=smooth(.42,.78,1-ny);const ks=VG.kSpur(z,x);
  if(ks>.01&&x>VG.lipX(z)&&x<VG.lipX(z)+VG.escW(z,x)){const tn=VG.trailNear(x,z),clear=tn?smooth(VG.TRAIL.half+1,VG.TRAIL.half+5,tn.d):1;
   r=Math.max(r,ks*clear*smooth(.38,.62,VG.fbm(x*.011,z*.011,3,77)+.6*smooth(.1,.3,1-ny)-.15)*(VG.padAt(x,z)?0:1));}
  rk[v]=r;ck[v]=x>VG.lipX(z)+VG.escW(z,x)?fieldAt('crack',x,z):0;}
 const idx=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;idx.push(a,c,b,b,c,d);}
 // the skirts: each edge's vertices copied down by a few cells, the strip facing out
 const depth=cell*3+4;let v=nv;const edge=[];
 for(let i=0;i<=N;i++)edge.push([i,0]);for(let j=0;j<=N;j++)edge.push([N,j]);for(let i=N;i>=0;i--)edge.push([i,N]);for(let j=N;j>=0;j--)edge.push([0,j]);
 const base=[];
 for(let e=0;e<4;e++){const row=[];for(let k=0;k<=N;k++){const q=edge[e*(N+1)+k],s=q[1]*(N+1)+q[0];
   pos[v*3]=pos[s*3];pos[v*3+1]=pos[s*3+1]-depth;pos[v*3+2]=pos[s*3+2];for(let c=0;c<3;c++){nor[v*3+c]=nor[s*3+c];col[v*3+c]=col[s*3+c];}rk[v]=rk[s];ck[v]=0;row.push([s,v]);v++;}
  for(let k=0;k<N;k++){const a=row[k],b=row[k+1];idx.push(a[0],b[0],a[1],b[0],b[1],a[1]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 g.setIndex(idx.length>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));g.computeBoundingSphere();
 const m=new THREE.Mesh(g,MAT_GROUND);m.name='ground';m.userData.probeSkip=true;m.userData.inspectLabel='The ground';m.userData.tile={x0,z0,S,cell};
 GROUND.tris+=idx.length/3;return m;}
function buildGround(){const t0=performance.now(),G=new THREE.Group();G.name='ground';
 for(let x0=-6144;x0<4096;x0+=512)for(let z0=-2048;z0<2048;z0+=512){const c=tileCell(x0,z0,512),m=makeTile(x0,z0,512,c);G.add(m);GROUND.tiles.push({x0,z0,S:512,cell:c});}
 for(let x0=-10240;x0<20480;x0+=2048)for(let z0=-10240;z0<10240;z0+=2048){if(x0>=-6144&&x0<4096&&z0>=-2048&&z0<2048)continue;
  const m=makeTile(x0,z0,2048,64);G.add(m);GROUND.tiles.push({x0,z0,S:2048,cell:64});}
 scene.add(G);GROUND.group=G;GROUND.ms=Math.round(performance.now()-t0);
 window._ground={tiles:GROUND.tiles.length,tris:GROUND.tris,ms:GROUND.ms,cells:GROUND.tiles.reduce((a,t)=>(a[t.cell]=(a[t.cell]||0)+1,a),{})};
 return G;}
