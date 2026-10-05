// ================================================================= OPEN WORLD — roads: routing the highways between settlements
// [G data] Plain maths over WORLD (no THREE, no DOM): run once by bake.py in a headless page, which writes the result to
// data/roads.json; the page then reads it as WORLD_DATA.roads (41-world-fields.js shapes the ground to it, the terrain
// draws it). Nothing here runs when the page starts.
//
// A highway is routed in two passes over the land WITHOUT roads (WORLD.Hbare):
//  1. coarse: least cost on a 2 km grid over the whole region (16 neighbours): a step costs its length times
//     1 + (g/G)^2 + (g/G)^4/8 for its grade g (G = 8 %), so the route finds the gentle ways down a scarp (the Yuni valley's
//     mouth, the gentle east rim) and keeps off cliffs; water costs 40 times its length (a causeway, a ford);
//  2. fine: the same on a 200 m grid inside a 6 km corridor round the coarse route, the grade's cost rising steeply over
//     G, so on a slope steeper than the road may climb the route zigzags across it (switchbacks).
// The fine route is smoothed (Chaikin), cut where it enters each settlement's ground (its radius), resampled every 20 m
// and given a finished height: the land smoothed along the road (~150 m), then held to the grade G both ways, so the
// road cuts through rises and fills hollows.
//
//   ROADS.route(a, b, opts)   a, b: {name, x, z, r} (r: the settlement's radius, where its own streets take over)
//                             -> {from, to, hw, pts: [[x, z, e], ...], length_m, climb_m, maxGrade, cells}
//   ROADS.routeAll(pairs, places, opts)  every pair once (A-B and B-A are one road); places: name -> {x, z, r}
var ROADS=(function(){'use strict';
const G=.08,HW=4;                 // the ruling grade and the half-width of the carriageway (8 m)
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
// a binary heap of (cost, id)
function Heap(){this.k=[];this.v=[];}
Heap.prototype.push=function(c,id){const k=this.k,v=this.v;let i=k.length;k.push(c);v.push(id);
 while(i>0){const p=(i-1)>>1;if(k[p]<=c)break;k[i]=k[p];v[i]=v[p];i=p;}k[i]=c;v[i]=id;};
Heap.prototype.pop=function(){const k=this.k,v=this.v,top=v[0],tc=k[0],lc=k.pop(),lv=v.pop(),n=k.length;
 if(n){let i=0;for(;;){let a=2*i+1;if(a>=n)break;if(a+1<n&&k[a+1]<k[a])a++;if(k[a]>=lc)break;k[i]=k[a];v[i]=v[a];i=a;}k[i]=lc;v[i]=lv;}
 this.c=tc;return top;};
Object.defineProperty(Heap.prototype,'size',{get(){return this.k.length;}});
const NB16=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
// the step's cost per metre for grade g; steep: the fine pass's sharper rise over G (switchbacks)
const gradeCost=(g,steep)=>{const r=g/G;return steep?1+.6*r*r+(r>1?Math.pow(r-1,2)*40:0):1+r*r+r*r*r*r/8;};

// a least-cost search over cells: cellXZ(id) -> [x,z], heightOf(id), wetOf(id), neighbours via (i,j); A* with the
// straight distance (every step costs at least its length)
function search(nx,ny,cs,x0,z0,ok,hOf,wOf,a,b,steep){
 const id=(i,j)=>j*nx+i,sx=Math.round((a.x-x0)/cs),sz=Math.round((a.z-z0)/cs),tx=Math.round((b.x-x0)/cs),tz=Math.round((b.z-z0)/cs);
 const S=id(clamp(sx,0,nx-1),clamp(sz,0,ny-1)),T=id(clamp(tx,0,nx-1),clamp(tz,0,ny-1));
 const dist=new Map(),prev=new Map(),done=new Set(),H=new Heap();
 const hz=(c)=>{const i=c%nx,j=(c-i)/nx;return Math.hypot((i-tx)*cs,(j-tz)*cs);};
 dist.set(S,0);H.push(hz(S),S);let n=0;
 while(H.size){const u=H.pop();if(u===T)break;if(done.has(u))continue;done.add(u);n++;
  const du=dist.get(u),ui=u%nx,uj=(u-ui)/nx,hu=hOf(u);
  for(const [di,dj] of NB16){const vi=ui+di,vj=uj+dj;if(vi<0||vj<0||vi>=nx||vj>=ny)continue;const v=id(vi,vj);if(!ok(v)||done.has(v))continue;
   const L=Math.hypot(di,dj)*cs,g=Math.abs(hOf(v)-hu)/L;
   const c=du+L*(gradeCost(g,steep)+(wOf(v)&&v!==T?40:0));
   if(c<(dist.has(v)?dist.get(v):Infinity)){dist.set(v,c);prev.set(v,u);H.push(c+hz(v),v);}}}
 if(!prev.has(T)&&S!==T)return null;
 const P=[T];while(P[P.length-1]!==S)P.push(prev.get(P[P.length-1]));P.reverse();
 return {cells:P.map(c=>{const i=c%nx,j=(c-i)/nx;return[x0+i*cs,z0+j*cs];}),expanded:n};}

// the coarse grid's heights and water, once for every road
let CO=null;
function coarseGrid(){if(CO)return CO;const B=WORLD.box(),cs=2000,nx=Math.ceil((B[2]-B[0])/cs)+1,ny=Math.ceil((B[3]-B[1])/cs)+1;
 const h=new Float32Array(nx*ny),w=new Uint8Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=B[0]+i*cs,z=B[1]+j*cs,k=j*nx+i;h[k]=WORLD.Hbare(x,z,4000);w[k]=WORLD.water(x,z)>h[k]+1?1:0;}
 CO={B,cs,nx,ny,h,w};return CO;}

function chaikin(P,n){for(let it=0;it<n;it++){if(P.length<3)break;const Q=[P[0]];
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}
  Q.push(P[P.length-1]);P=Q;}return P;}
function resample(P,step){const out=[P[0].slice()];let carry=0;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);let t=step-carry;
  while(t<=L){out.push([a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L]);t+=step;}carry=L-(t-step);}
 const l=P[P.length-1];if(Math.hypot(l[0]-out[out.length-1][0],l[1]-out[out.length-1][1])>step*.3)out.push(l.slice());return out;}
// keep the part of a line outside the circles round its two ends (where the settlements' own streets take over)
function trim(P,a,b){let s=0,e=P.length-1;while(s<e&&Math.hypot(P[s][0]-a.x,P[s][1]-a.z)<a.r)s++;while(e>s&&Math.hypot(P[e][0]-b.x,P[e][1]-b.z)<b.r)e--;return P.slice(Math.max(0,s-1),e+2);}

function route(a,b,opts){opts=opts||{};const t0=Date.now();
 // 1. coarse
 const C=coarseGrid();
 const c1=search(C.nx,C.ny,C.cs,C.B[0],C.B[1],()=>true,k=>C.h[k],k=>C.w[k],a,b,false);
 if(!c1)return {from:a.name,to:b.name,error:'no coarse route'};
 // 2. fine: a 200 m grid over the coarse route's box (+6 km), only cells within 6 km of it
 const cs=200,R=6000,P1=c1.cells;let bx0=1e18,bz0=1e18,bx1=-1e18,bz1=-1e18;
 for(const p of P1){bx0=Math.min(bx0,p[0]);bz0=Math.min(bz0,p[1]);bx1=Math.max(bx1,p[0]);bz1=Math.max(bz1,p[1]);}
 bx0-=R;bz0-=R;bx1+=R;bz1+=R;const nx=Math.ceil((bx1-bx0)/cs)+1,ny=Math.ceil((bz1-bz0)/cs)+1;
 const ok=new Uint8Array(nx*ny),rr=Math.ceil(R/cs);
 const dense=resample(P1,1000);
 for(const p of dense){const ci=Math.round((p[0]-bx0)/cs),cj=Math.round((p[1]-bz0)/cs);
  for(let dj=-rr;dj<=rr;dj++)for(let di=-rr;di<=rr;di++){if(di*di+dj*dj>rr*rr)continue;const i=ci+di,j=cj+dj;if(i>=0&&j>=0&&i<nx&&j<ny)ok[j*nx+i]=1;}}
 const hC=new Map(),wC=new Map();
 const hOf=k=>{let v=hC.get(k);if(v===undefined){const i=k%nx,j=(k-i)/nx,x=bx0+i*cs,z=bz0+j*cs;v=WORLD.Hbare(x,z,300);hC.set(k,v);wC.set(k,WORLD.water(x,z)>v+.5?1:0);}return v;};
 const wOf=k=>{hOf(k);return wC.get(k);};
 const c2=search(nx,ny,cs,bx0,bz0,k=>ok[k]===1,hOf,wOf,a,b,true);
 if(!c2)return {from:a.name,to:b.name,error:'no fine route'};
 // 3. the line: the cells smoothed, trimmed at the settlements, every 20 m
 let L=chaikin(c2.cells,4);L=trim(L,a,b);L=resample(L,20);
 // 4. the finished height: the land smoothed along the road (Gaussian, sigma 150 m), then held to the grade both ways
 const n=L.length,raw=new Float64Array(n),e=new Float64Array(n);
 for(let i=0;i<n;i++)raw[i]=WORLD.Hbare(L[i][0],L[i][1],60);
 const sg=7.5,K=Math.ceil(sg*3);
 for(let i=0;i<n;i++){let s=0,w=0;for(let k=-K;k<=K;k++){const j=clamp(i+k,0,n-1),q=Math.exp(-k*k/(2*sg*sg));s+=raw[j]*q;w+=q;}e[i]=s/w;}
 const dmax=G*20;
 for(let it=0;it<60;it++){let ch=0;
  for(let i=1;i<n;i++){const lo=e[i-1]-dmax,hi=e[i-1]+dmax;if(e[i]<lo){e[i]=lo;ch++;}else if(e[i]>hi){e[i]=hi;ch++;}}
  for(let i=n-2;i>=0;i--){const lo=e[i+1]-dmax,hi=e[i+1]+dmax;if(e[i]<lo){e[i]=lo;ch++;}else if(e[i]>hi){e[i]=hi;ch++;}}
  if(!ch)break;}
 // the road never runs under standing water: over a lake or a river it rides 2 m above the surface (a causeway)
 let climb=0,mg=0,cutMax=0,fillMax=0;
 for(let i=0;i<n;i++){const wl=WORLD.water(L[i][0],L[i][1]);if(wl>-1e8&&e[i]<wl+2)e[i]=wl+2;
  if(i){const d=e[i]-e[i-1];if(d>0)climb+=d;mg=Math.max(mg,Math.abs(d)/20);}
  cutMax=Math.max(cutMax,raw[i]-e[i]);fillMax=Math.max(fillMax,e[i]-raw[i]);}
 return {from:a.name,to:b.name,hw:HW,pts:L.map((p,i)=>[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10,Math.round(e[i]*100)/100]),
  length_m:Math.round((n-1)*20),climb_m:Math.round(climb),maxGrade:Math.round(mg*1000)/1000,cutMax_m:Math.round(cutMax),fillMax_m:Math.round(fillMax),
  cells:{coarse:c1.cells.length,fine:c2.cells.length,expanded:c2.expanded},ms:Date.now()-t0};}

function routeAll(pairs,places,opts){const seen=new Set(),out=[],errors=[];
 for(const [a,b] of pairs){const k=[a,b].sort().join('|');if(seen.has(k))continue;seen.add(k);
  if(!places[a]||!places[b]){errors.push('no place: '+(places[a]?b:a));continue;}
  const r=route(Object.assign({name:a},places[a]),Object.assign({name:b},places[b]),opts);
  if(r.error)errors.push(a+' - '+b+': '+r.error);else out.push(r);}
 return {format:'krator-openworld-roads',version:1,grade:G,roads:out,errors};}
return {route,routeAll,G,HW};})();
