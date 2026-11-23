// node core/host/test-probe.js -- the probe's broad phase (95-host-probe.js, regOccupancy on KSPACE) counts exactly what
// the full loop counts, on random registries and scenes: small and huge volumes, NaN and negative radii, points on the
// edges, a build's own regHas, and userData.probePoints on a group. A plain THREE stand-in: only what the probe calls.
'use strict';
const path=require('path');
const G=globalThis;
require(path.join(__dirname,'..','space','20-core-space.js'));
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
 applyMatrix4(m){this.x+=m.t[0];this.y+=m.t[1];this.z+=m.t[2];return this;}}
class M4{constructor(){this.t=[0,0,0];}decompose(p){p.set(this.t[0],this.t[1],this.t[2]);}}
class Q{}
class B3{setFromObject(o){this.min=o.bmin;this.max=o.bmax;return this;}}
G.THREE={Matrix4:M4,Vector3:V3,Quaternion:Q,Box3:B3};
require(path.join(__dirname,'95-host-probe.js'));
const K=G.KHOST;
let s=12345;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
function scene(objs){return {traverse(f){for(const o of objs)f(o);}};}
function make(nreg,nobj){
 const REG=[];for(let i=0;i<nreg;i++){const big=rnd()<.05;REG.push({name:'v'+i,type:'t',x:rnd()*2000-1000,y:rnd()*40,z:rnd()*2000-1000,
  r:i%97===3?NaN:i%89===5?-(5+rnd()*20):big?300+rnd()*2000:1+rnd()*40,h:2+rnd()*30});}
 const objs=[];
 for(let k=0;k<nobj;k++){const t=rnd();
  if(t<.5){const pts=[];const n=1+Math.floor(rnd()*400);for(let i=0;i<n;i++)pts.push([rnd()*2200-1100,rnd()*60-5,rnd()*2200-1100]);
   objs.push({isInstancedMesh:true,count:n,userData:{},getMatrixAt(i,m){m.t=pts[i];}});}
  else if(t<.9){const c=[rnd()*2200-1100,rnd()*60,rnd()*2200-1100];
   objs.push({isMesh:true,userData:{},bmin:{x:c[0]-3,y:c[1]-1,z:c[2]-3},bmax:{x:c[0]+3,y:c[1]+1,z:c[2]+3}});}
  else{const pp=[];for(let i=0;i<300;i++)pp.push(rnd()*2200-1100,rnd()*60,rnd()*2200-1100);
   const ox=rnd()*20-10;objs.push({userData:{probePoints:pp},matrixWorld:{t:[ox,0,-ox]},updateMatrixWorld(){}});}}
 // a few points exactly on volume edges
 const edge=[];for(let i=0;i<REG.length;i+=7){const r=REG[i];if(isFinite(r.r))edge.push([r.x+Math.abs(r.r),r.y,r.z],[r.x,r.y+r.h+5,r.z-Math.abs(r.r)]);}
 objs.push({isInstancedMesh:true,count:edge.length,userData:{},getMatrixAt(i,m){m.t=edge[i];}});
 return {REG,objs};}
function run(REG,objs,o){let api;
 K.setView=()=>{};K.go=()=>{};
 K.probeTake({o:Object.assign({THREE:G.THREE},o),scene:scene(objs),registry:REG,views:{},clock:{state:()=>0}});
 api=G._api;return api.regOccupancy().map(e=>e.n);}
let fails=0,cases=0,total=0;
const own=(r,x,y,z)=>{const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r*.5&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;};
for(let c=0;c<30;c++){const {REG,objs}=make(50+Math.floor(rnd()*800),20+Math.floor(rnd()*200));
 for(const o of [{},{regHas:own}]){cases++;
  const KS=G.KSPACE;const fast=run(REG,objs,o);G.KSPACE=undefined;const slow=run(REG,objs,o);G.KSPACE=KS;
  total+=fast.reduce((a,b)=>a+b,0);
  const bad=fast.findIndex((v,i)=>v!==slow[i]);if(bad>=0){fails++;console.log('case '+c+(o.regHas?' (regHas)':'')+': volume '+bad+' broad '+fast[bad]+' full '+slow[bad]);}}}
// the probePoints of a group are sampled (one volume round a single point)
{const REG=[{name:'one',x:500,y:0,z:500,r:1,h:2}];const objs=[{userData:{probePoints:[500,1,500]},matrixWorld:{t:[0,0,0]},updateMatrixWorld(){}}];
 cases++;if(run(REG,objs,{})[0]!==1){fails++;console.log('probePoints not sampled');}}
// a volume flagged ground or far is occupied with no sample; an unflagged one beside it stays empty
{const REG=[{name:'g',x:0,y:0,z:0,r:5,h:1,ground:true},{name:'f',x:900,y:0,z:900,r:50,h:9,far:true},{name:'e',x:-900,y:0,z:-900,r:5,h:1},{name:'k',kind:'landform',x:0,y:0,z:0,r:5,h:1,ground:true}];
 for(const KS of [G.KSPACE,undefined]){const keep=G.KSPACE;G.KSPACE=KS;const n=run(REG,[],{});G.KSPACE=keep;
  cases++;if(n.join()!=='1,1,0,1'){fails++;console.log('ground/far flags: '+n.join());}}
 cases++;K.probeTake({o:{THREE:G.THREE},scene:scene([]),registry:REG,views:{},clock:{state:()=>0}});if(G._api.regOccupancy()[3].type!=='landform'){fails++;console.log('type falls back to kind');}}
// the empty registry
cases++;if(run([],[],{}).length!==0){fails++;console.log('empty registry');}
console.log(fails?'FAIL':'ok','- '+cases+' cases, '+total+' samples counted, broad phase == full loop'+(fails?' except '+fails:''));
process.exit(fails?1:0);
