// ================================================================= ISLE DEMO — the towns planned here (M7): Kautoa and Valapo on the world's ground
// [G data] settlements/isle-demo/PLAN.md, M7. The two towns are planned on this page exactly as the city page plans them
// (settlements/isle-demo/src 20-50: ISLE.siteGround, ISLE.city, ISLE.census, ISLE.checks, read in place by build.py),
// from the same site file (SITE_INIT) and the same kits' boxes (ISLE_DIMS, ISLE_VDIMS), on the same ground: the city
// page decodes the region's rasters itself, this page has them already (WORLD.init ran before the LATE modules). Each
// town keeps its own registry in its own frame (core/tags, build 'isle-demo:<town>'), so its records, ids and the sim's
// places are the city page's; the frame {x, z, sea} puts it in the world.
// Then the world's land takes each town's ground (WORLD.landHook, chained after the coast's and the geysers'): inside the
// town's square its grid (the owner's ground edits and the landmarks' terraces in it) over the town's sea, easing back to
// the world's own land over BAND metres at the square's edge. The grid was sampled from the world's land before the hook
// was set, so outside the edits the two agree. Then both towns are declared on core/simulation (ISLE.simDeclare, as the
// city page declares them). 88t-world-towns.js draws them; it decides nothing.
//   ISLE_TOWNS_W.lay()            plan both, set the land hook, declare the sim (once; the LATE module below calls it)
//   ISLE_TOWNS_W.plans            [{town, G, R, census, checks, tags, ms}] in ISLE.TOWNS order
//   ISLE_TOWNS_W.at(x, z)         the plan whose square holds the world point, or null
//   ISLE_TOWNS_W.local(P, x, z)   a world point in P's frame: [x, z]
//   ISLE_TOWNS_W.ground(x, z)     the towns' ground at a world point and its weight: {h, w} (w 0 outside every square)
//   ISLE_TOWNS_W.select(town)     the town the export reads (ISLE.cur, KTAGS.page): the city page's drawn town
//   ISLE_TOWNS_W.seaPath(a, b)    the sea route between two world points (the canoe line's, below); along(P, f, back)
//   ISLE_TOWNS_W.stats            {ms, errors, sim, simError}
var ISLE_TOWNS_W=(function(){
const BAND=150,S={ms:{},errors:[],sim:null,simError:null},plans=[];
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function plan(town){const Si=ISLE.townSite(SITE_INIT,town),P=ISLE.PROG[town];
 if(!Si)throw new Error('the site file has no '+town);
 const G=ISLE.siteGround(Si,P),tags=KTAGS.create({build:'isle-demo:'+town});
 const R=ISLE.city(town,{site:Si,ground:G,tags,dims:k=>ISLE_DIMS[k]==null?null:ISLE_DIMS[k],vdims:k=>ISLE_VDIMS[k]==null?null:ISLE_VDIMS[k]});
 return{town,G,R,census:ISLE.census(R),checks:ISLE.checks(R,G),tags,ms:{plan:R.log.ms}};}
const local=(P,x,z)=>{const F=P.G.frame;return[x-F.x,z-F.z];};
function at(x,z){for(const P of plans){const L=local(P,x,z);if(Math.abs(L[0])<P.G.half&&Math.abs(L[1])<P.G.half)return P;}return null;}
const GW={h:0,w:0};
function ground(x,z){GW.w=0;GW.h=0;
 for(const P of plans){const L=local(P,x,z),half=P.G.half,a=Math.max(Math.abs(L[0]),Math.abs(L[1]));if(a>=half)continue;
  GW.w=smooth((half-a)/BAND);GW.h=P.G.h(L[0],L[1])+P.G.frame.sea;return GW;}
 return GW;}
function select(town){const P=plans.find(p=>p.town===town);if(!P)return null;ISLE.cur=P;KTAGS.page=P.tags;return P;}
function lay(){if(plans.length)return plans;ISLE.worldReady=true;   /* WORLD.init ran (98-world-start.js): no WORLD_RAW on this page */
 for(const town of ISLE.TOWNS){try{plans.push(plan(town));}catch(e){S.errors.push(town+': '+(e&&e.stack?e.stack:e));}}
 const prev=WORLD.landHook;
 WORLD.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);const g=ground(x,z);return g.w>0?h+(g.h-h)*g.w:h;};
 try{S.sim=ISLE.simDeclare(plans.map(P=>({R:P.R,G:P.G})));}catch(e){S.simError=String(e&&e.stack?e.stack:e);}
 if(plans.length)select(plans[0].town);
 return plans;}
/* ---------------------------------------------------------------- the sea route between two points (the canoe line's) */
/* A* over cells of SEA.cell m in the box round both points (SEA.margin beyond them), 8 ways: a cell is open water where
   the water stands over SEA.deep m above the ground (WORLD.H at the cell's wave length), shoal water (over SEA.shoal m:
   the reef's passes, the harbours) costs SEA.shoalCost times as much, the rest is land. The two ends' own cells are
   always open (a canoe stop lies in its harbour's shallows). Then pulled taut: a straight run is kept while every
   SEA.look m of it is water over SEA.shoal. Cells are read as the search reaches them, ties broken by the cell's index,
   so the route is a function of the world alone.
     seaPath([x, z], [x, z]) -> {pts: [[x, z]], cum: [m], len, cells (read), ok} (memoized)
     along(path, f, back)    -> {x, z, h (heading along (sin, cos))} at the fraction f of its length, from its end if back */
const SEA={cell:500,margin:20000,deep:2,shoal:.3,shoalCost:4,look:100},seaMemo={};
function seaPath(a,b){const key=a.join(',')+'>'+b.join(',');if(seaMemo[key])return seaMemo[key];
 const c=SEA.cell,x0=Math.min(a[0],b[0])-SEA.margin,z0=Math.min(a[1],b[1])-SEA.margin;
 const nx=Math.ceil((Math.max(a[0],b[0])+SEA.margin-x0)/c)+1,nz=Math.ceil((Math.max(a[1],b[1])+SEA.margin-z0)/c)+1,N=nx*nz;
 const depth=(x,z)=>WORLD.lakeWater(x,z)-WORLD.H(x,z,c);
 const cellOf=p=>Math.min(nz-1,Math.max(0,Math.round((p[1]-z0)/c)))*nx+Math.min(nx-1,Math.max(0,Math.round((p[0]-x0)/c)));
 const s0=cellOf(a),g0=cellOf(b),cost=new Float32Array(N).fill(-1);let read=0;
 const costAt=k=>{if(cost[k]<0){read++;const d=depth(x0+(k%nx)*c,z0+Math.floor(k/nx)*c);cost[k]=k===s0||k===g0?SEA.shoalCost:d>SEA.deep?1:d>SEA.shoal?SEA.shoalCost:0;}return cost[k];};
 const gx=g0%nx,gz=Math.floor(g0/nx),hEst=k=>Math.hypot(k%nx-gx,Math.floor(k/nx)-gz);
 const G=new Float64Array(N).fill(Infinity),from=new Int32Array(N).fill(-1),shut=new Uint8Array(N),heap=[];
 const less=(p,q)=>p[0]<q[0]||(p[0]===q[0]&&p[1]<q[1]);
 const push=e=>{heap.push(e);let i=heap.length-1;while(i>0){const j=(i-1)>>1;if(!less(heap[i],heap[j]))break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;
   if(l<heap.length&&less(heap[l],heap[m]))m=l;if(r<heap.length&&less(heap[r],heap[m]))m=r;if(m===i)break;[heap[i],heap[m]]=[heap[m],heap[i]];i=m;}}return top;};
 G[s0]=0;push([hEst(s0),s0]);
 while(heap.length){const k=pop()[1];if(shut[k])continue;shut[k]=1;if(k===g0)break;const kx=k%nx,kz=Math.floor(k/nx);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const ix=kx+dx,iz=kz+dz;if(ix<0||iz<0||ix>=nx||iz>=nz)continue;
   const n=iz*nx+ix;if(shut[n])continue;const w=costAt(n);if(!w)continue;const g=G[k]+w*Math.hypot(dx,dz);
   if(g<G[n]){G[n]=g;from[n]=k;push([g+hEst(n),n]);}}}
 const ok=from[g0]>=0||g0===s0,cells=[];if(ok)for(let k=g0;k>=0;k=k===s0?-1:from[k])cells.push([x0+(k%nx)*c,z0+Math.floor(k/nx)*c]);
 cells.reverse();const raw=ok?[a].concat(cells.slice(1,-1),[b]):[a,b];
 /* pulled taut: from each kept point, the farthest later point it sees over water */
 const sees=(p,q)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.ceil(L/SEA.look);for(let i=1;i<n;i++){const t=i/n;if(depth(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t)<=SEA.shoal)return false;}return true;};
 const pts=[raw[0]];for(let i=0;i<raw.length-1;){let j=raw.length-1;while(j>i+1&&!sees(raw[i],raw[j]))j--;pts.push(raw[j]);i=j;}
 const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 return(seaMemo[key]={pts,cum,len:cum[cum.length-1],cells:read,ok});}
function along(P,f,back){const L=P.len,d=Math.min(L,Math.max(0,(back?1-f:f)*L));let i=1;while(i<P.cum.length-1&&P.cum[i]<d)i++;
 const p=P.pts[i-1],q=P.pts[i],seg=P.cum[i]-P.cum[i-1]||1,t=(d-P.cum[i-1])/seg,dx=(q[0]-p[0])*(back?-1:1),dz=(q[1]-p[1])*(back?-1:1);
 return{x:p[0]+(q[0]-p[0])*t,z:p[1]+(q[1]-p[1])*t,h:Math.atan2(dx,dz)};}
if(typeof LATE!=='undefined')LATE.push(()=>{try{lay();}catch(e){S.errors.push(String(e&&e.stack?e.stack:e));}});   /* before the terrain's module: the land is laid with the towns in it */
return{lay,plans,at,local,ground,select,seaPath,along,stats:S,BAND,SEA};})();
