// ---------- the rooms: a floor plan with no edge, built a piece at a time ----------
// The place is a grid of cells 2.4 m square, and every wall stands on a line of that grid. Ten cells by ten
// make a chunk, and the only thing a chunk knows is its own coordinates and the seed: from those it lays out
// its rooms, the same way every time, so a chunk dropped behind you and built again when you come back is the
// same chunk. Nothing is remembered, so there is nothing to run out of.
//
// A chunk is laid out by splitting it, like a building's floor plate: cut it in two with a wall, cut each half
// again, and stop when the pieces are room-sized - or sooner, at random, which is where the big rooms come
// from. Every wall that cuts a region in two gets at least one way through it, so everything inside a chunk
// can be reached. The chunk's west and south edges are its own too, with at least one way through each, and its
// east and north edges belong to its neighbours, who do the same - so the whole plan is one connected place,
// however far it goes. Then the rules are broken on purpose: some cuts get no wall at all (two rooms that are
// one room, with columns down where the wall would have been), some walls stop short, some doorways are the
// whole width of the cell and some are one door wide, and some rooms have a lower ceiling than the rest.
//
// The light is the fluorescent panels, and there are hundreds of them in view, so no lamp here is a real
// light. Each surface is cut into a grid and every vertex is lit when the chunk is built: how much of each
// panel within seven metres it can see, round the walls between them, by a two-dimensional walk along the
// grid lines. What comes out is the soft, flat, slightly too bright light the place is known for, with
// shadow where a wall stands between you and the lamp, and it costs nothing a frame.
import {mkRng,makeNoise} from '../core/rng.js';

export const C=2.4,N=10,CH=C*N;            // cell, cells per chunk side, chunk size (m)
const T=0.14;                               // wall thickness
const OPEN=0,WALL=1,DOOR=2;
const LR=7.2,LR2=LR*LR;                     // how far a panel's light reaches

// ---- the levels ----
// Each is the same generator with different numbers. Level 0 is small rooms and narrow halls; Level 1 is a
// car park with the cars taken away, big and pillared and cold; the Poolrooms are tiled, high and wet.
export const LEVELS={
  0:{id:0,name:'Level 0',sub:'the lobby',
    minRoom:1,maxLeaf:5,stop:0.22,pMerge:0.15,pPartial:0.22,pDoor:0.55,pBoundWall:0.6,
    ceil:[[0.66,2.6],[0.24,2.35],[0.10,3.05]],narrowLow:0.45,doorH:2.1,doorW:1.0,
    light:[[0.40,'full'],[0.36,'alt'],[0.18,'dim'],[0.06,'dark']],pDead:0.05,pFlick:0.03,pillar:0.2,colonnade:0.55,
    lamp:[1.0,0.95,0.78],I:1.0,amb:0.1,kd:1.9,ki:0.85,fog:[0x6a5c26,2,30],clear:0x2c250e,
    tex:{wall:[1.2,3.0],floor:[1.2,1.2],ceil:[1.2,0.6],stain:[0.55,0.9,0.36]},pools:0},
  1:{id:1,name:'Level 1',sub:'the habitable zone',
    minRoom:2,maxLeaf:7,stop:0.3,pMerge:0.4,pPartial:0.3,pDoor:0.3,pBoundWall:0.4,
    ceil:[[0.7,3.6],[0.3,3.1]],narrowLow:0.2,doorH:2.4,doorW:1.6,
    light:[[0.35,'full'],[0.35,'alt'],[0.22,'dim'],[0.08,'dark']],pDead:0.1,pFlick:0.06,pillar:0.55,colonnade:0.8,
    lamp:[0.86,0.94,1.0],I:1.9,amb:0.07,kd:1.7,ki:0.8,fog:[0x2c3034,1,30],clear:0x0c0d0f,
    tex:{wall:[1.2,4.0],floor:[2.4,2.4],ceil:[1.2,0.6],stain:[0.5,0.75,0.5]},pools:0,puddles:true},
  37:{id:37,name:'Level 37',sub:'the poolrooms',
    minRoom:2,maxLeaf:6,stop:0.3,pMerge:0.35,pPartial:0.3,pDoor:0.15,pBoundWall:0.45,
    ceil:[[0.5,3.4],[0.3,4.2],[0.2,2.7]],narrowLow:0.5,doorH:2.4,doorW:1.4,
    light:[[0.5,'full'],[0.4,'alt'],[0.1,'dim']],pDead:0.01,pFlick:0.0,pillar:0.3,colonnade:0.6,
    lamp:[0.95,1.0,1.0],I:1.25,amb:0.22,kd:1.2,ki:0.75,fog:[0xb4c8c8,2,34],clear:0x9fb4b6,
    tex:{wall:[0.6,0.6],floor:[0.6,0.6],ceil:[0.6,0.6],stain:[0,0,0]},pools:0.55},
};
export const ORDER=[0,1,37];

// ---- hashing: everything is a pure function of the seed and where it is ----
function hi(a,b,c,d){let h=Math.imul((a|0)^0x9e3779b9,0x85ebca6b)^Math.imul(b|0,0x27d4eb2d)^Math.imul(c|0,0x165667b1)^Math.imul(d|0,0xc2b2ae35);
  h=Math.imul(h^(h>>>15),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);return (h^(h>>>16))>>>0;}
const hf=(a,b,c,d)=>hi(a,b,c,d)/4294967296;
const pickW=(list,u)=>{let s=0;for(const [w,v] of list){s+=w;if(u<s)return v;}return list[list.length-1][1];};
const fl=Math.floor;

// ---- the plan of one chunk ----
// V[i*N+j]: the edge on the line x = i (local) beside cell row j; H[j*N+i]: the edge on the line z = j beside
// cell column i. Lines 0 are this chunk's west and south boundaries; lines N are the neighbours' lines 0.
function plan(L,seed,cx,cz){
  const r=mkRng(hi(seed,cx,cz,L.id*7+1));
  const V=new Uint8Array(N*N),H=new Uint8Array(N*N);
  const ceil=new Float32Array(N*N),floor=new Float32Array(N*N),pool=new Uint8Array(N*N);
  const pillars=new Set(),panels=[];
  // the boundaries: a wall or not edge by edge, with one opening forced so the neighbours always connect
  const bound=(gx,gz,dir)=>{const u=hf(seed,gx*3+dir,gz,L.id*7+2);
    return u<L.pBoundWall?WALL:(u<L.pBoundWall+(1-L.pBoundWall)*L.pDoor?DOOR:OPEN);};
  for(let j=0;j<N;j++){V[j]=bound(cx*N,cz*N+j,0);H[j]=bound(cx*N+j,cz*N,1);}
  {const a=fl(hf(seed,cx,cz,L.id*7+3)*N),b=fl(hf(seed,cx,cz,L.id*7+4)*N);
   if(V[a]===WALL)V[a]=DOOR;if(H[b]===WALL)H[b]=OPEN;}
  const set=(vert,k,t,v)=>{if(vert)V[k*N+t]=v;else H[k*N+t]=v;};
  function wallLine(vert,k,a,b){
    const n=b-a,u=r();
    if(u<L.pMerge){                         // no wall: the two sides are one room, with columns where it was
      if(r()<L.colonnade)for(let t=a+1;t<b;t+=(n>4?2:1))pillars.add(vert?k*(N+1)+t:t*(N+1)+k);
      return;}
    let s=a,e=b;
    if(u<L.pMerge+L.pPartial&&n>=2){const len=1+fl(r()*(n-1));if(r()<0.5)e=a+len;else s=b-len;}
    for(let t=s;t<e;t++)set(vert,k,t,WALL);
    if(s===a&&e===b){const nd=1+(n>3&&r()<0.55?1:0)+(n>6&&r()<0.4?1:0);
      for(let q=0;q<nd;q++)set(vert,k,a+fl(r()*n),r()<L.pDoor?DOOR:OPEN);}
  }
  function leaf(x0,z0,x1,z1){
    const w=x1-x0,d=z1-z0;
    let h=pickW(L.ceil,r());if((w===1||d===1)&&r()<L.narrowLow)h=Math.min(...L.ceil.map(c=>c[1]));
    const lm=pickW(L.light,r());
    const isPool=L.pools&&w>=3&&d>=3&&r()<L.pools;
    const cols=w>=3&&d>=3&&r()<L.pillar,step=r()<0.5?1:2;
    let flickOne=lm==='dark';
    for(let i=x0;i<x1;i++)for(let j=z0;j<z1;j++){
      const c=i*N+j;ceil[c]=h;
      if(isPool&&i>x0&&i<x1-1&&j>z0&&j<z1-1){pool[c]=1;floor[c]=-1.3;}
      let lit=lm==='full'||(lm==='alt'&&(i+j+cx+cz)%2===0)||(lm==='dim'&&r()<0.35);
      if(flickOne&&r()<0.3){lit=true;}
      if(!lit)continue;
      let st=r()<L.pDead?1:(r()<L.pFlick?2:0);
      if(lm==='dark'){st=flickOne?2:1;flickOne=false;}
      if(lm==='dim'&&r()<0.25)st=1;
      panels.push({i,j,x:(cx*N+i)*C+C/2,z:(cz*N+j)*C+C/2,y:h-0.012,st,ph:r()});
    }
    if(cols)for(let i=x0+1;i<x1;i+=step)for(let j=z0+1;j<z1;j+=step)pillars.add(i*(N+1)+j);
  }
  function split(x0,z0,x1,z1,depth){
    const w=x1-x0,d=z1-z0;
    if((w<=L.minRoom&&d<=L.minRoom)||(Math.max(w,d)<=L.maxLeaf&&depth>0&&r()<L.stop)||(w<2&&d<2)){leaf(x0,z0,x1,z1);return;}
    let vert=w>d?true:d>w?false:r()<0.5;
    if(w<2)vert=false;if(d<2)vert=true;
    if(vert){const k=x0+1+fl(r()*(w-1));wallLine(true,k,z0,z1);split(x0,z0,k,z1,depth+1);split(k,z0,x1,z1,depth+1);}
    else{const k=z0+1+fl(r()*(d-1));wallLine(false,k,x0,x1);split(x0,z0,x1,k,depth+1);split(x0,k,x1,z1,depth+1);}
  }
  split(0,0,N,N,0);
  return {V,H,ceil,floor,pool,pillars,panels};
}

// ---- the world: plans on demand, geometry near you ----
export function createWorld({THREE,scene,level,seed,textures,uT}){
  const L=LEVELS[level];
  const noise=makeNoise(mkRng(hi(seed,L.id,5,5)));
  const plans=new Map();
  let lastX=NaN,lastZ=NaN,lastP=null;       // the edge lookups ask the same chunk thousands of times in a row
  function planAt(cx,cz){if(cx===lastX&&cz===lastZ)return lastP;lastX=cx;lastZ=cz;lastP=planAt2(cx,cz);return lastP;}
  function planAt2(cx,cz){const k=cx+','+cz;let p=plans.get(k);
    if(!p){p=plan(L,seed,cx,cz);plans.set(k,p);
      if(plans.size>600){const first=plans.keys().next().value;plans.delete(first);}}
    return p;}
  // global lookups, in cell coordinates
  const edgeV=(gx,gz)=>{const cx=fl(gx/N),cz=fl(gz/N);return planAt(cx,cz).V[(gx-cx*N)*N+(gz-cz*N)];};
  const edgeH=(gx,gz)=>{const cx=fl(gx/N),cz=fl(gz/N);return planAt(cx,cz).H[(gz-cz*N)*N+(gx-cx*N)];};
  const cellCeil=(gx,gz)=>{const cx=fl(gx/N),cz=fl(gz/N);return planAt(cx,cz).ceil[(gx-cx*N)*N+(gz-cz*N)];};
  const cellFloor=(gx,gz)=>{const cx=fl(gx/N),cz=fl(gz/N);return planAt(cx,cz).floor[(gx-cx*N)*N+(gz-cz*N)];};
  const pillarAt=(vx,vz)=>{const cx=fl(vx/N),cz=fl(vz/N),i=vx-cx*N,j=vz-cz*N;if(i===0||j===0)return false;
    return planAt(cx,cz).pillars.has(i*(N+1)+j);};
  // where along its edge a doorway's gap sits (the gap's centre, in metres from the edge's start)
  const gapV=(gx,gz)=>C/2+(hf(seed,gx,gz,91)-0.5)*(C-L.doorW-0.5);
  const gapH=(gx,gz)=>C/2+(hf(seed,gx,gz,92)-0.5)*(C-L.doorW-0.5);
  const solidV=e=>e===WALL||e===DOOR;

  // Can a point at (x0,z0) see a panel at (x1,z1)? Walk every grid line between them and ask the edge the
  // ray crosses. A doorway lets it through if it passes through the gap; the header over the gap is ignored,
  // which lets a little too much light through a door, and that is not a thing anyone has noticed.
  function vis(x0,z0,x1,z1){
    const ax=Math.min(x0,x1),bx=Math.max(x0,x1);
    for(let k=Math.ceil(ax/C);k*C<bx;k++){const X=k*C;if(X<=ax)continue;
      const z=z0+(z1-z0)*(X-x0)/(x1-x0),gz=fl(z/C),e=edgeV(k,gz);
      if(e===WALL)return false;
      if(e===DOOR){const o=z-gz*C,g=gapV(k,gz);if(Math.abs(o-g)>L.doorW/2)return false;}}
    const az=Math.min(z0,z1),bz=Math.max(z0,z1);
    for(let k=Math.ceil(az/C);k*C<bz;k++){const Z=k*C;if(Z<=az)continue;
      const x=x0+(x1-x0)*(Z-z0)/(z1-z0),gx=fl(x/C),e=edgeH(gx,k);
      if(e===WALL)return false;
      if(e===DOOR){const o=x-gx*C,g=gapH(gx,k);if(Math.abs(o-g)>L.doorW/2)return false;}}
    return true;
  }
  // the panels near a place, bucketed by cell
  // Every vertex asks only the cells within reach, so the panels round a chunk go into a grid of cells first:
  // three chunks by three, one slot a cell, since a cell never has more than one lamp.
  const G=3*N,grid=new Array(G*G);let gOx=0,gOz=0;
  function panelsAround(cx,cz){grid.fill(null);gOx=(cx-1)*N;gOz=(cz-1)*N;
    for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const p of planAt(a,b).panels)
      grid[(a*N+p.i-gOx)*G+(b*N+p.j-gOz)]=p;}

  // ---- materials ----
  const fogU=()=>THREE.UniformsUtils.clone(THREE.UniformsLib.fog);
  const tx=textures[L.id];
  function surfaceMat(map){
    return new THREE.ShaderMaterial({fog:true,uniforms:Object.assign(fogU(),{map:{value:map},uT}),
      vertexShader:`attribute vec3 aL;attribute vec2 aF;varying vec2 vUv;varying vec3 vL;varying vec2 vF;
#include <fog_pars_vertex>
void main(){vUv=uv;vL=aL;vF=aF;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform sampler2D map;uniform float uT;varying vec2 vUv;varying vec3 vL;varying vec2 vF;
#include <fog_pars_fragment>
${FLICK}
void main(){vec3 c=texture2D(map,vUv).rgb;float f=1.0;if(vF.x>0.001)f=1.0-vF.x*(1.0-flick(vF.y));
gl_FragColor=vec4(c*vL*f,1.0);
#include <fog_fragment>
}`});
  }
  const mats={wall:surfaceMat(tx.wall),floor:surfaceMat(tx.floor),ceil:surfaceMat(tx.ceil)};
  mats.top=new THREE.MeshBasicMaterial({color:new THREE.Color(L.clear).multiplyScalar(0.6)});mats.top.visible=false;
  const lamp=new THREE.Vector3(...L.lamp);
  mats.panel=new THREE.ShaderMaterial({fog:true,uniforms:Object.assign(fogU(),{map:{value:tx.panel},uT,uLamp:{value:lamp}}),
    vertexShader:`attribute vec2 aP;varying vec2 vUv;varying vec2 vP;
#include <fog_pars_vertex>
void main(){vUv=uv;vP=aP;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform sampler2D map;uniform float uT;uniform vec3 uLamp;varying vec2 vUv;varying vec2 vP;
#include <fog_pars_fragment>
${FLICK}
void main(){vec3 c=texture2D(map,vUv).rgb;float on=vP.x<0.5?1.0:(vP.x<1.5?0.0:flick(vP.y));
gl_FragColor=vec4(c*mix(vec3(0.34,0.33,0.3),uLamp*1.12,on),1.0);
#include <fog_fragment>
}`});
  mats.water=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,uniforms:Object.assign(fogU(),{uT}),
    vertexShader:`varying vec3 vW;
#include <fog_pars_vertex>
void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform float uT;varying vec3 vW;
#include <fog_pars_fragment>
void main(){vec2 p=vW.xz;
 float a=sin(p.x*3.1+uT*0.9+sin(p.y*2.3+uT*0.7))*sin(p.y*2.7-uT*0.8+sin(p.x*1.9));
 float b=sin((p.x+p.y)*4.3-uT*1.3)*0.5;
 float caust=pow(abs(a+b)*0.6,3.0);
 vec3 c=mix(vec3(0.42,0.74,0.78),vec3(0.86,0.98,1.0),caust);
 gl_FragColor=vec4(c,0.62+caust*0.2);
#include <fog_fragment>
}`});

  // ---- lighting one vertex ----
  function light(x,y,z,nx,ny,nz,out){
    const sx=x+nx*0.05,sy=y+ny*0.05,sz=z+nz*0.05;
    let dir=0,ind=0,fl2=0,flPh=0,flBest=0;
    const qx=fl(sx/C)-gOx,qz=fl(sz/C)-gOz,rc=Math.ceil(LR/C);
    for(let u=Math.max(0,qx-rc);u<=Math.min(G-1,qx+rc);u++)for(let v=Math.max(0,qz-rc);v<=Math.min(G-1,qz+rc);v++){
      const p=grid[u*G+v];if(!p||p.st===1)continue;
      const dx=p.x-sx,dy=p.y-sy,dz=p.z-sz,d2=dx*dx+dy*dy+dz*dz;if(d2>LR2)continue;
      if(!vis(sx,sz,p.x,p.z))continue;
      const d=Math.sqrt(d2)+1e-4,w=(1-d2/LR2)*(1-d2/LR2);
      const ce=Math.max(0,dy/d),cr=Math.max(0,(nx*dx+ny*dy+nz*dz)/d);
      const a=L.I*ce*(0.25+0.75*cr)*w/(d2+0.9),b=L.I*w/(d2+3.5);
      dir+=a;ind+=b;
      if(p.st===2){const c=L.kd*a+L.ki*b;fl2+=c;if(c>flBest){flBest=c;flPh=p.ph;}}}
    const tot=L.amb+L.kd*dir+L.ki*ind;
    out[0]=Math.min(1.7,tot);out[1]=tot>0?Math.min(1,fl2/tot):0;out[2]=flPh;
  }
  // the dirt: stains on the carpet, damp up the walls, puddles on concrete, all from noise over the world
  function dirt(x,y,z,kind){
    const s=L.tex.stain;if(!s[0]&&!L.puddles)return 1;
    const n=noise.fbm(x*0.23+11,z*0.23-7);
    if(kind==='floor'){let v=1-s[2]*Math.max(0,Math.min(1,(n-s[0])/(s[1]-s[0])));
      if(L.puddles)v*=1-0.45*Math.max(0,Math.min(1,(noise.fbm(x*0.12,z*0.12)-0.55)*8));return v;}
    if(kind==='wall'){const m=noise.fbm((x+z)*0.3,y*0.2+3);return 1-0.28*Math.max(0,Math.min(1,(m-0.5)*4))*Math.max(0,1-y/1.4);}
    return 1;
  }

  // ---- a surface, cut into a grid and lit ----
  // p0 is the corner at (u=0,v=0), eu and ev the two edge vectors, n the facing, and uvf maps a point to its
  // texture coordinate. nu x nv quads.
  const L3=[0,0,0];
  function patch(B,p0,eu,ev,n,nu,nv,uvf,kind){
    const base=B.pos.length/3;
    for(let b=0;b<=nv;b++)for(let a=0;a<=nu;a++){
      const u=a/nu,v=b/nv,x=p0[0]+eu[0]*u+ev[0]*v,y=p0[1]+eu[1]*u+ev[1]*v,z=p0[2]+eu[2]*u+ev[2]*v;
      B.pos.push(x,y,z);const t=uvf(x,y,z);B.uv.push(t[0],t[1]);
      light(x,y,z,n[0],n[1],n[2],L3);const dd=dirt(x,y,z,kind),l=L3[0]*dd;
      const tint=dd<1?(1-dd):0;           // stains go brown, not grey
      B.aL.push(l*L.lamp[0],l*L.lamp[1]*(1-tint*0.12),l*L.lamp[2]*(1-tint*0.3));B.aF.push(L3[1],L3[2]);}
    // wind so the face points along n
    const cr=[eu[1]*ev[2]-eu[2]*ev[1],eu[2]*ev[0]-eu[0]*ev[2],eu[0]*ev[1]-eu[1]*ev[0]];
    const flip=cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0;
    for(let b=0;b<nv;b++)for(let a=0;a<nu;a++){const i0=base+b*(nu+1)+a,i1=i0+1,i2=i0+nu+1,i3=i2+1;
      if(flip)B.idx.push(i0,i2,i1,i1,i2,i3);else B.idx.push(i0,i1,i2,i1,i3,i2);}
  }
  const mkB=()=>({pos:[],uv:[],aL:[],aF:[],idx:[]});
  const wU=L.tex.wall[0],wV=L.tex.wall[1],fU=L.tex.floor[0],cU=L.tex.ceil[0],cV=L.tex.ceil[1];
  const uvWallX=(x,y)=>[x/wU,y/wV],uvWallZ=(x,y,z)=>[z/wU,y/wV];
  const uvFloor=(x,y,z)=>[x/fU,z/fU],uvCeil=(x,y,z)=>[(x-0.6)/cU,(z-0.3-(cV<1?0:0))/cV];
  const seg=len=>Math.max(1,Math.round(len/0.6));

  // a slab of wall on the line x = X from z = a to z = b (or z = X, x from a to b), y from y0 to y1, with caps
  function wallSlab(B,alongZ,X,a,b,y0,y1,capA,capB){
    const h=y1-y0;if(h<=0.001||b-a<=0.001)return;
    const nu=seg(b-a),nv=Math.max(1,Math.round(h/0.7));
    if(alongZ){
      patch(B,[X+T/2,y0,a],[0,0,b-a],[0,h,0],[1,0,0],nu,nv,uvWallZ,'wall');
      patch(B,[X-T/2,y0,a],[0,0,b-a],[0,h,0],[-1,0,0],nu,nv,uvWallZ,'wall');
      if(capA)patch(B,[X-T/2,y0,a],[T,0,0],[0,h,0],[0,0,-1],1,nv,uvWallX,'wall');
      if(capB)patch(B,[X-T/2,y0,b],[T,0,0],[0,h,0],[0,0,1],1,nv,uvWallX,'wall');
    }else{
      patch(B,[a,y0,X+T/2],[b-a,0,0],[0,h,0],[0,0,1],nu,nv,uvWallX,'wall');
      patch(B,[a,y0,X-T/2],[b-a,0,0],[0,h,0],[0,0,-1],nu,nv,uvWallX,'wall');
      if(capA)patch(B,[a,y0,X-T/2],[0,0,T],[0,h,0],[-1,0,0],1,nv,uvWallZ,'wall');
      if(capB)patch(B,[b,y0,X-T/2],[0,0,T],[0,h,0],[1,0,0],1,nv,uvWallZ,'wall');
    }
  }
  // the underside of a header or soffit
  function under(B,alongZ,X,a,b,y){
    if(alongZ)patch(B,[X-T/2,y,a],[T,0,0],[0,0,b-a],[0,-1,0],1,seg(b-a),uvCeil,'ceil');
    else patch(B,[a,y,X-T/2],[b-a,0,0],[0,0,T],[0,-1,0],seg(b-a),1,uvCeil,'ceil');
  }

  // ---- building one chunk ----
  function build(cx,cz){
    const P=planAt(cx,cz);panelsAround(cx,cz);
    const Bw=mkB(),Bh=mkB(),Bf=mkB(),Bc=mkB(),Bp={pos:[],uv:[],aP:[],idx:[]},Bwater=[],Btop=[];
    const gx0=cx*N,gz0=cz*N;
    // floors and ceilings, cell by cell, so each cell's edge is lit from its own side of any wall
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const gx=gx0+i,gz=gz0+j,x=gx*C,z=gz*C,c=i*N+j,fy=P.floor[c],cy=P.ceil[c];
      patch(Bf,[x,fy,z],[C,0,0],[0,0,C],[0,1,0],4,4,uvFloor,'floor');
      patch(Bc,[x,cy,z],[C,0,0],[0,0,C],[0,-1,0],2,4,uvCeil,'ceil');
      if(P.pool[c])Bwater.push(x,z);
    }
    // the panels
    for(const p of P.panels){const b=Bp.pos.length/3,y=p.y,x0=p.x-0.6,x1=p.x+0.6,z0=p.z-0.3,z1=p.z+0.3;
      Bp.pos.push(x0,y,z0,x1,y,z0,x0,y,z1,x1,y,z1);Bp.uv.push(0,0,1,0,0,1,1,1);
      for(let k=0;k<4;k++)Bp.aP.push(p.st,p.ph);Bp.idx.push(b,b+1,b+2,b+1,b+3,b+2);}
    // the walls this chunk owns: lines 0..N-1 in both directions
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      for(const vert of [true,false]){
        const gx=gx0+(vert?i:j),gz=gz0+(vert?j:i);           // vert: line x=gx, cell gz; else line z=gz, cell gx
        const e=vert?edgeV(gx,gz):edgeH(gx,gz);
        // the two cells either side
        const [ax,az,bx,bz]=vert?[gx-1,gz,gx,gz]:[gx,gz-1,gx,gz];
        const ca=cellCeil(ax,az),cb=cellCeil(bx,bz),fa=cellFloor(ax,az),fb=cellFloor(bx,bz);
        const top=Math.max(ca,cb),bot=Math.min(fa,fb),X=(vert?gx:gz)*C,a=(vert?gz:gx)*C,b=a+C;
        if(e===OPEN){
          // a soffit where the ceilings differ, and a step where the floors do
          if(Math.abs(ca-cb)>0.01){wallSlab(Bh,vert,X,a,b,Math.min(ca,cb),top,false,false);under(Bh,vert,X,a,b,Math.min(ca,cb));}
          if(Math.abs(fa-fb)>0.01)wallSlab(Bw,vert,X,a,b,bot,Math.max(fa,fb),false,false);
          continue;}
        // the ends of the wall: carry on into a collinear wall, stop into a perpendicular one or a column,
        // or get a cap
        const endInfo=(t)=>{   // t: the vertex index along the line (gz or gz+1 for vert)
          const coll=vert?edgeV(gx,t===gz?gz-1:gz+1):edgeH(t===gx?gx-1:gx+1,gz);
          if(solidV(coll))return 'cont';
          const px=vert?gx:t,pz=vert?t:gz;
          const perp=vert?(solidV(edgeH(gx-1,t))||solidV(edgeH(gx,t))):(solidV(edgeV(t,gz-1))||solidV(edgeV(t,gz)));
          if(perp||pillarAt(px,pz))return 'ext';return 'cap';};
        const s0=endInfo(vert?gz:gx),s1=endInfo(vert?gz+1:gx+1);
        const A=a-(s0==='ext'?T/2:0),Bn=b+(s1==='ext'?T/2:0);
        if(e===WALL){wallSlab(Bw,vert,X,A,Bn,bot,top,s0==='cap',s1==='cap');Btop.push(vert,X,A,Bn,top);continue;}
        // a doorway: two pieces of wall, jambs, and a header over the gap
        const g=a+(vert?gapV(gx,gz):gapH(gx,gz)),g0=g-L.doorW/2,g1=g+L.doorW/2;
        const dh=Math.min(L.doorH,Math.min(ca,cb)-0.12);
        wallSlab(Bw,vert,X,A,g0,bot,top,s0==='cap',true);
        wallSlab(Bw,vert,X,g1,Bn,bot,top,true,s1==='cap');
        Btop.push(vert,X,A,g0,top,vert,X,g1,Bn,top);
        wallSlab(Bh,vert,X,g0,g1,dh,top,false,false);under(Bh,vert,X,g0,g1,dh);
      }
    }
    // columns: 0.6 m square, floor to ceiling
    for(const key of P.pillars){const i=fl(key/(N+1)),j=key%(N+1),x=(gx0+i)*C,z=(gz0+j)*C,s=0.3;
      let top=0,bot=0;for(const [p,q] of [[-1,-1],[0,-1],[-1,0],[0,0]]){top=Math.max(top,cellCeil(gx0+i+p,gz0+j+q));bot=Math.min(bot,cellFloor(gx0+i+p,gz0+j+q));}
      const h=top-bot,nv=Math.max(1,Math.round(h/0.7));
      patch(Bw,[x-s,bot,z+s],[2*s,0,0],[0,h,0],[0,0,1],1,nv,uvWallX,'wall');
      patch(Bw,[x-s,bot,z-s],[2*s,0,0],[0,h,0],[0,0,-1],1,nv,uvWallX,'wall');
      patch(Bw,[x+s,bot,z-s],[0,0,2*s],[0,h,0],[1,0,0],1,nv,uvWallZ,'wall');
      patch(Bw,[x-s,bot,z-s],[0,0,2*s],[0,h,0],[-1,0,0],1,nv,uvWallZ,'wall');}
    for(const key of P.pillars){const i=fl(key/(N+1)),j=key%(N+1);let top=0;
      for(const [p,q] of [[-1,-1],[0,-1],[-1,0],[0,0]])top=Math.max(top,cellCeil(gx0+i+p,gz0+j+q));
      Btop.push(2,(gx0+i)*C,(gz0+j)*C,0,top);}
    // into meshes
    const grp=new THREE.Group();grp.name='chunk '+cx+','+cz;
    const mk=(B,mat,cat,upper)=>{if(!B.idx.length)return;const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));
      if(B.aL)g.setAttribute('aL',new THREE.Float32BufferAttribute(B.aL,3));
      if(B.aF)g.setAttribute('aF',new THREE.Float32BufferAttribute(B.aF,2));
      if(B.aP)g.setAttribute('aP',new THREE.Float32BufferAttribute(B.aP,2));
      g.setIndex(B.idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.wireCat=cat;m.matrixAutoUpdate=false;if(upper){m.userData.upper=true;m.visible=!upperHidden;}grp.add(m);};
    // Bh is what hangs from the ceiling rather than standing on the floor - the headers over the doors and the
    // soffits where the ceiling steps - kept apart so the god's-eye view can leave it off with the ceiling
    mk(Bw,mats.wall,'building');mk(Bh,mats.wall,'building',true);mk(Bf,mats.floor,'ground');mk(Bc,mats.ceil,'structure');mk(Bp,mats.panel,'light');
    if(Bwater.length){const pos=[],idx=[];for(let k=0;k<Bwater.length;k+=2){const x=Bwater[k],z=Bwater[k+1],b=pos.length/3,y=-0.22;
        pos.push(x,y,z,x+C,y,z,x,y,z+C,x+C,y,z+C);idx.push(b,b+2,b+1,b+1,b+2,b+3);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
      const m=new THREE.Mesh(g,mats.water);m.userData.wireCat='water';m.renderOrder=2;grp.add(m);}
    // The tops of the walls, which nobody standing in these rooms ever sees: drawn only for the god's-eye view,
    // where the ceiling has been taken off and a wall seen from straight above is otherwise a line of nothing.
    // Solid in a dark tone, as a plan draws what the section cuts through; the doorways are left open.
    if(Btop.length){const pos=[],idx=[];
      const quad=(x0,z0,x1,z1,y)=>{const b=pos.length/3;pos.push(x0,y,z0,x1,y,z0,x0,y,z1,x1,y,z1);idx.push(b,b+2,b+1,b+1,b+2,b+3);};
      for(let k=0;k<Btop.length;k+=5){const v=Btop[k],X=Btop[k+1],a=Btop[k+2],b=Btop[k+3],y=Btop[k+4]+0.01;
        if(v===2)quad(X-0.3,a-0.3,X+0.3,a+0.3,y);else if(v)quad(X-T/2,a,X+T/2,b,y);else quad(a,X-T/2,b,X+T/2,y);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeBoundingSphere();
      const m=new THREE.Mesh(g,mats.top);m.userData.wireCat='structure';m.matrixAutoUpdate=false;grp.add(m);}
    grp.matrixAutoUpdate=false;
    return grp;
  }

  // ---- keeping the chunks round you ----
  // R is how many chunks out from the one you are in are kept; the god's-eye view sees further and asks for more
  let R=2;const live=new Map();let queue=[];
  let upperHidden=false;
  function hideUpper(h){upperHidden=!!h;for(const c of live.values())c.g.traverse(o=>{if(o.userData.upper)o.visible=!upperHidden;});}
  function update(px,pz,budgetMs,r){
    if(r)R=r;
    const ccx=fl(px/CH),ccz=fl(pz/CH),t0=performance.now();let added=0;
    for(const [k,c] of live)if(Math.max(Math.abs(c.cx-ccx),Math.abs(c.cz-ccz))>R+1){scene.remove(c.g);
      c.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});live.delete(k);}
    queue=[];for(let a=ccx-R;a<=ccx+R;a++)for(let b=ccz-R;b<=ccz+R;b++)if(!live.has(a+','+b))queue.push([a,b]);
    queue.sort((p,q)=>Math.hypot(p[0]-ccx,p[1]-ccz)-Math.hypot(q[0]-ccx,q[1]-ccz));
    for(const [a,b] of queue){const g=build(a,b);scene.add(g);live.set(a+','+b,{cx:a,cz:b,g});added++;
      if(performance.now()-t0>budgetMs)break;}
    return added;
  }

  // ---- walking into things ----
  // The walls are thin boxes on the grid lines, a doorway is two of them with a gap, and a column is a
  // square. The walker is a circle, pushed out of whatever it has got into; twice, for corners.
  function boxesNear(x,z){const out=[],gx=fl(x/C),gz=fl(z/C);
    for(let a=gx-1;a<=gx+2;a++)for(let b=gz-1;b<=gz+1;b++){
      const e=edgeV(a,b),X=a*C,z0=b*C;
      if(e===WALL)out.push([X-T/2,z0-T/2,X+T/2,z0+C+T/2]);
      else if(e===DOOR){const g=z0+gapV(a,b);out.push([X-T/2,z0-T/2,X+T/2,g-L.doorW/2],[X-T/2,g+L.doorW/2,X+T/2,z0+C+T/2]);}}
    for(let a=gx-1;a<=gx+1;a++)for(let b=gz-1;b<=gz+2;b++){
      const e=edgeH(a,b),Z=b*C,x0=a*C;
      if(e===WALL)out.push([x0-T/2,Z-T/2,x0+C+T/2,Z+T/2]);
      else if(e===DOOR){const g=x0+gapH(a,b);out.push([x0-T/2,Z-T/2,g-L.doorW/2,Z+T/2],[g+L.doorW/2,Z-T/2,x0+C+T/2,Z+T/2]);}}
    for(let a=gx-1;a<=gx+2;a++)for(let b=gz-1;b<=gz+2;b++)if(pillarAt(a,b))out.push([a*C-0.3,b*C-0.3,a*C+0.3,b*C+0.3]);
    return out;}
  function collide(p,rad){
    for(let it=0;it<3;it++){let moved=false;
      for(const [x0,z0,x1,z1] of boxesNear(p.x,p.z)){
        const qx=Math.max(x0,Math.min(p.x,x1)),qz=Math.max(z0,Math.min(p.z,z1)),dx=p.x-qx,dz=p.z-qz,d2=dx*dx+dz*dz;
        if(d2>=rad*rad)continue;
        if(d2>1e-8){const d=Math.sqrt(d2);p.x=qx+dx/d*rad;p.z=qz+dz/d*rad;}
        else{const l=p.x-x0,r=x1-p.x,u=p.z-z0,w=z1-p.z,m=Math.min(l,r,u,w);
          if(m===l)p.x=x0-rad;else if(m===r)p.x=x1+rad;else if(m===u)p.z=z0-rad;else p.z=z1+rad;}
        moved=true;}
      if(!moved)break;}
  }
  const floorAt=(x,z)=>cellFloor(fl(x/C),fl(z/C));
  const ceilAt=(x,z)=>cellCeil(fl(x/C),fl(z/C));

  // the way the walker faces when they arrive: down the longest clear run from the cell they start in
  function openHeading(gx,gz){let best=0,bestLen=-1;
    const dirs=[[0,-1,Math.PI*0],[1,0,-Math.PI/2],[0,1,Math.PI],[-1,0,Math.PI/2]];
    for(const [dx,dz,yaw] of dirs){let n=0,x=gx,z=gz;
      for(;n<30;n++){const e=dx>0?edgeV(x+1,z):dx<0?edgeV(x,z):dz>0?edgeH(x,z+1):edgeH(x,z);if(e===WALL||e===DOOR)break;x+=dx;z+=dz;}
      if(n>bestLen){bestLen=n;best=yaw;}}
    return best;}

  function dispose(){for(const c of live.values()){scene.remove(c.g);c.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    live.clear();for(const m of Object.values(mats))m.dispose();}

  return {L,update,collide,floorAt,ceilAt,openHeading,dispose,live,mats,hideUpper,get pending(){return queue.length;}};
}

// A panel that is going: mostly on, then every few seconds a burst of stutter, each panel on its own clock.
const FLICK=`float flick(float ph){float s=fract(uT*0.21+ph*7.0);float b=step(0.84,s);
 float v=step(0.42,fract(sin(floor(uT*13.0+ph*97.0))*43758.5453));return mix(1.0,0.12+0.88*v,b);}`;
