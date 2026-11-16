// ================================================================= OPEN WORLD — relief: the small streams (P3)
// [G data] Plain functions on typed arrays: no THREE, no DOM, no canvas, no Math.random. core/world/PLAN-RELIEF.md, R6 and
// S5: the streams below the model's 2 km cutoff, which the cut's drainage (a channel from CHANNEL_MIN, about 500 km2 of
// rain) leaves out. They are traced on the page's own land form (41's WORLD.flowAt: the model, its cliffs, its hills and
// ridges, less the channels' cut), not on the cut's 500 m grid, which has none of the hills: a stream traced there runs
// straight over them. So the trace is a bake (core/world/bake_streams.py, in node, after the cut), and region.json keeps
// its result (`streams`), which a page decodes and carves (41: WORLD.streams) and Godot reads as data.
//
//   WSTREAMS.trace(o)    the network on a grid: o {nx, ny, cell (m), x0, z0 (the world point of cell 0, 0), E (the flow
//                        surface, m), K (Uint8: 0 land, 1 a lake or the sea, 2 a channel or a river, 3 outside the
//                        region), RW (each cell's rain weight: max(rain, floor) x its area, in the cut's CHANNEL_MIN
//                        units), RM (rain, mm), amin (the weight a stream starts at), chanMin (a channel's), wetMM (the
//                        mean rain over its catchment a stream runs wet from), minLen (m: a shorter stream nobody joins is
//                        left out, converge (2): how much more than its lateral neighbours a cell must gather to start
//                        a stream, pit (1.5 m): a depression's least depth, incise {k, sigma, iters}: see below; it
//                        needs WSMOOTH, 40-world-smooth.js)}.
//                        Returns {lines (encoded, as region.json keeps them), cells, heads, kept}
//   WSTREAMS.decode(L, S) one encoded line as vertices [[x, z, s, bed]...] (s: 0 at amin, 1 at a channel's flow; bed m,
//                        never rising), with S the region's `streams` record (cell, x0, z0)
//   WSTREAMS.rebed(L, B) set line L's bed from B (m, one a vertex), never rising: the bake's beds, from the ground along
//                        the curve the page draws (the trace's own, the fill of its cells, lies off that curve: a cell is
//                        250 m, and the curve is relaxed and wanders between them)
//   WSTREAMS.check(lines) the problems of decoded lines ([] when none): a bed that rises, a line under two vertices
//
// The trace: priority-flood with an epsilon (Barnes, Lehman and Mulla 2014: every pit filled to its spill, flats given a
// fall of 1 mm a cell toward their outlet), D8 on the filled surface (the steepest fall, ties to the first neighbour in
// N8's order), the weight accumulated from the highest cell down, then every head (a stream cell no stream cell drains
// into) followed down, highest first, until it reaches a lake, a channel, the region's edge, or a line traced before it
// (a junction). The heap breaks ties on the cell's index, so a port pops cells in the same order.
// Encoded line: {h: [i, j] the head's cell, d: one character per step ('0'..'7', N8's index), b: the head's bed (dm),
// db: each step's fall (dm, never negative; comma-separated), s: one character per vertex ('a' .. 'z': strength 0 .. 1), w: 1 wet,
// e: how it ends ('j' a junction, 'w' a lake, 'c' a channel or river, 'p' a depression, 'x' the region's edge)}. The last vertex is the
// mouth: the cell it drains into.
var WSTREAMS=(function(){'use strict';
const T={version:1};
const N8=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];   /* [di, dj]: the direction a step's character names */
const D8=N8.map(d=>Math.sqrt(d[0]*d[0]+d[1]*d[1]));
const EPS=1e-3;   /* m a cell: the fall given across a filled pit or a flat */

// a binary min-heap of cells on (key, index), so equal keys pop in index order
function Heap(n){const K=new Float64Array(n),V=new Int32Array(n);let m=0;
 const less=(a,b)=>K[a]<K[b]||(K[a]===K[b]&&V[a]<V[b]);
 const sw=(a,b)=>{const k=K[a];K[a]=K[b];K[b]=k;const v=V[a];V[a]=V[b];V[b]=v;};
 return{size:()=>m,
  push(k,v){let i=m++;K[i]=k;V[i]=v;while(i>0){const p=(i-1)>>1;if(!less(i,p))break;sw(i,p);i=p;}},
  pop(){const v=V[0];m--;if(m>0){K[0]=K[m];V[0]=V[m];let i=0;for(;;){const l=2*i+1,r=l+1;let s=i;if(l<m&&less(l,s))s=l;if(r<m&&less(r,s))s=r;if(s===i)break;sw(i,s);i=s;}}return v;}};}

// one routing of surface E: the fill (F), the order cells were done in, D8 (rec, dir) and the accumulations
function route(E,K,nx,ny,RW,RM){const n=nx*ny;
 // priority-flood: the outlets (lakes, channels, outside, the grid's border) first, then every cell from its lowest
 // neighbour already done, raised to that neighbour plus the epsilon where it lies lower
 const F=new Float64Array(n),done=new Uint8Array(n),order=new Int32Array(n),hp=Heap(n);let no=0;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i;F[c]=E[c];
  if(K[c]||i===0||j===0||i===nx-1||j===ny-1){done[c]=1;hp.push(F[c],c);}}
 while(hp.size()){const c=hp.pop(),i=c%nx,j=(c-i)/nx;order[no++]=c;
  for(let k=0;k<8;k++){const a=i+N8[k][0],b=j+N8[k][1];if(a<0||b<0||a>=nx||b>=ny)continue;const q=b*nx+a;if(done[q])continue;
   done[q]=1;const f=F[c]+EPS*D8[k];if(F[q]<f)F[q]=f;hp.push(F[q],q);}}
 // D8 on the filled surface: the outlets drain nowhere
 const rec=new Int32Array(n).fill(-1),dir=new Int8Array(n).fill(-1);
 for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const c=j*nx+i;if(K[c])continue;let best=0,bq=-1,bk=-1;
  for(let k=0;k<8;k++){const q=(j+N8[k][1])*nx+i+N8[k][0],s=(F[c]-F[q])/D8[k];if(s>best){best=s;bq=q;bk=k;}}
  rec[c]=bq;dir[c]=bk;}
 // accumulation from the highest cell down: the rain weight (the stream's size) and rain x area (its mean rain)
 const A=new Float64Array(n),RA=new Float32Array(n),AA=new Float32Array(n);
 for(let c=0;c<n;c++){A[c]=K[c]?0:RW[c];RA[c]=K[c]?0:RM[c];AA[c]=K[c]?0:1;}
 for(let t=no-1;t>=0;t--){const c=order[t],r=rec[c];if(r>=0){A[r]+=A[c];RA[r]+=RA[c];AA[r]+=AA[c];}}
 return{F,order,rec,dir,A,RA,AA};}

T.trace=function(o){const nx=o.nx,ny=o.ny,n=nx*ny,E=o.E,K=o.K,cell=o.cell;
 const amin=o.amin,chanMin=o.chanMin==null?amin*30:o.chanMin,wetMM=o.wetMM==null?450:o.wetMM,minLen=o.minLen==null?1000:o.minLen;
 let R=route(E,K,nx,ny,o.RW,o.RM);const F0=R.F;
 // the incision (o.incise {k m, sigma cells, iters}): the surface lowered by k x log10(1 + flow / amin), blurred, and
 // routed again. On a long even slope D8 runs every column down in parallel, ruler-straight; lowered where the flow
 // gathers, the neighbours turn into it, as a valley captures its side slopes, and the streams branch
 const inc=o.incise;
 if(inc&&inc.k>0)for(let it=0;it<(inc.iters==null?2:inc.iters);it++){const L=new Float64Array(n);
  for(let c=0;c<n;c++)L[c]=K[c]?0:Math.log(1+R.A[c]/amin)/Math.LN10;
  const G=WSMOOTH.gauss(L,nx,ny,inc.sigma==null?1.5:inc.sigma),E2=new Float64Array(n);for(let c=0;c<n;c++)E2[c]=E[c]-inc.k*G[c];
  R=route(E2,K,nx,ny,o.RW,o.RM);}
 const rec=R.rec,dir=R.dir,A=R.A,RA=R.RA,AA=R.AA,F=R.F;
 // the stream cells and their heads
 // A stream starts only where the flow gathers: a cell over amin whose flow is at least o.converge (2) times any of its
 // lateral neighbours' (those it neither drains into nor takes from). On an even slope every column carries the same
 // flow and none starts, where D8 alone ran a stream down each; then every cell below a start is stream
 // A depression (a cell the fill raised more than o.pit, 1.5 m: a pond or a swamp the land holds) is no stream's: across
 // its filled flat D8 runs straight to the spill, so a stream ends where it enters one ('p') and starts again at its
 // outlet (a cell over amin a depression drains into starts a stream, gathering or not)
 const isS=new Uint8Array(n),donors=new Int32Array(n),cv=o.converge==null?2:o.converge,pitD=o.pit==null?1.5:o.pit,PT=new Uint8Array(n);let cells=0;
 for(let c=0;c<n;c++)if(!K[c]&&F0[c]-E[c]>pitD)PT[c]=1;
 for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const c=j*nx+i;if(K[c]||PT[c]||rec[c]<0||A[c]<amin||isS[c])continue;let lat=0,out=false;
  for(let k=0;k<8;k++){const q=(j+N8[k][1])*nx+i+N8[k][0];if(rec[q]===c&&PT[q])out=true;if(q===rec[c]||rec[q]===c)continue;if(A[q]>lat)lat=A[q];}
  if(!out&&cv>0&&A[c]<cv*lat)continue;
  for(let q=c;q>=0&&!K[q]&&!PT[q]&&rec[q]>=0&&!isS[q];q=rec[q]){isS[q]=1;cells++;}}
 for(let c=0;c<n;c++)if(isS[c]&&isS[rec[c]])donors[rec[c]]++;
 const heads=[];for(let c=0;c<n;c++)if(isS[c]&&!donors[c])heads.push(c);
 heads.sort((a,b)=>F[b]-F[a]||a-b);
 const lg=Math.log(chanMin/amin),sOf=c=>{const s=Math.log(Math.max(A[c],amin)/amin)/lg;return s>1?1:s;};
 const owner=new Int32Array(n).fill(-1),raw=[];
 for(const h of heads){const L={cells:[h],end:'x',to:-1,len:0,id:raw.length};let c=h;owner[c]=L.id;
  for(;;){const r=rec[c];L.len+=D8[dir[c]]*cell;L.cells.push(r);
   if(K[r]===1){L.end='w';break;}if(K[r]===2){L.end='c';break;}if(PT[r]){L.end='p';break;}
   if(K[r]===3||!isS[r]){L.end='x';break;}   /* outside, or the grid's border (a land cell's receiver is a stream cell otherwise: it carries at least its weight) */
   if(owner[r]>=0){L.end='j';L.to=owner[r];break;}
   owner[r]=L.id;c=r;}
  raw.push(L);}
 // the short ones nobody joins are left out; a line only joins one traced before it, so from the last back
 const joined=new Int32Array(raw.length),keep=new Uint8Array(raw.length);
 for(let t=raw.length-1;t>=0;t--){const L=raw[t];if(L.len<minLen&&!joined[t])continue;keep[t]=1;if(L.to>=0)joined[L.to]++;}
 const lines=[];
 for(let t=0;t<raw.length;t++){if(!keep[t])continue;const L=raw[t],C=L.cells,h=C[0];
  let d='',s='',b0=Math.round(F0[h]*10),q=b0;const db=[];   /* the bed: the land's own fill (not the incised surface's), never rising */
  for(let k=0;k<C.length;k++){const c=C[k];s+=String.fromCharCode(97+Math.round(sOf(k<C.length-1?c:C[k-1])*25));
   if(k){d+=dir[C[k-1]];const v=Math.min(q,Math.round(F0[c]*10));db.push(q-v);q=v;}}
  const m=C[C.length-2];
  lines.push({h:[h%nx,(h-h%nx)/nx],d,b:b0,db:db.join(','),s,w:RA[m]/AA[m]>=wetMM?1:0,e:L.end});}
 return{lines,cells,heads:heads.length,kept:lines.length,pits:PT.reduce((a,v)=>a+v,0),F,A};};

// a line's bed set again from B (m, one per vertex: the bake's, from the ground along the page's own curve), never rising
T.rebed=function(L,B){let q=Math.round(B[0]*10);const db=[];L.b=q;
 for(let k=1;k<B.length;k++){const v=Math.min(q,Math.round(B[k]*10));db.push(q-v);q=v;}
 L.db=db.join(',');return L;};

T.decode=function(L,S){const cell=S.cell,P=[],db=L.db.split(',');let i=L.h[0],j=L.h[1],b=L.b;
 for(let k=0;k<L.s.length;k++){if(k){const g=N8[+L.d[k-1]];i+=g[0];j+=g[1];b-=+db[k-1];}
  P.push([S.x0+i*cell,S.z0+j*cell,(L.s.charCodeAt(k)-97)/25,b/10]);}
 return P;};

T.check=function(lines){const out=[];
 lines.forEach((P,n)=>{if(P.length<2){out.push('stream '+n+': under two vertices');return;}
  for(let k=1;k<P.length;k++)if(P[k][3]>P[k-1][3]+1e-6){out.push('stream '+n+': its bed rises at vertex '+k+' ('+P[k-1][3]+' to '+P[k][3]+' m)');break;}});
 return out;};

return T;})();
if(typeof module!=='undefined')module.exports=WSTREAMS;
