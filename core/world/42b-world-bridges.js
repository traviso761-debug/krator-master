// ================================================================= OPEN WORLD — bridges: where a road crosses a river
// [G data] (the owner, 2026-11-11: "add a bridge module"). A road laid on the world's ground is cut and filled to its
// grade (41-world-fields.js shapes the ground between its banks), so where it crosses a carved river channel its fill
// buries the river (the probe's "the named rivers carry water" fails, and the links between the towns could not be
// laid: openworld/xanadu-oidong-highrift's KNOWN_ISSUES.md). This module finds those crossings on a road's centre line
// and turns each into a BRIDGE: the stretch over the water (and an approach each side) is a SPAN, which the ground is
// not shaped under (41 skips a span's segments for its banks, its paint and its road mask), and the road's height over
// it is a deck that clears the water. Plain maths over WORLD (no THREE, no DOM): the plan's records, which 88b draws
// and Godot reads. Opt-in: a region asks for it (SITE_SPEC.bridges, core/world 48s); nothing else changes.
//
//   BRIDGES.plan(road, o) -> {road (its pts' heights lifted where a deck must clear the water, the grade re-held to its
//                             approaches), spans: [[i0, i1]] (point indices: segments i0..i1-1 are on the deck),
//                             bridges: [BRIDGE], errors}
//     o: {clear (m from the water to the deck's underside: 4), deck (its thickness: 1.2), approach (m of span past the
//         water each side: 10), grade (the ruling grade the approaches are held to: 0.08), step (m between the samples
//         across the carriageway: 2), maxDeck (m a deck may stand over the bed before the crossing is a viaduct of piers:
//         any), culture (the bridge's builders: 'xanadu', 'order', 'iziz' ...: the drawing's style), pierEvery (m: 24)}
//   BRIDGE {id: '<road>/bridge/<k>', road, i0, i1, s0, s1 (m along the road), len, kind: 'slab' (up to 12 m) | 'arch'
//           (up to 40 m, one arch) | 'arches' (a row of arches, piers every pierEvery) | 'viaduct' (taller than 25 m over
//           the bed, piers every pierEvery), culture, water (the river's highest water under it), bed (its lowest
//           bed), clearance (the deck's underside over the water), hw (the carriageway's half-width), deck: [[x, z, y]]
//           (the deck's top along the road), piers: [{x, z, yTop, yBase}], abutments: [{x, z, y}, {x, z, y}]}
//   BRIDGES.wetAt(x, z, hw, nx, nz, step) -> the river's water under the carriageway there (-1e9 when dry): the highest
//                             water across it (WORLD.riverWater: the named rivers' carved channels only; lakes keep the
//                             router's causeway)
//   BRIDGES.check(roads, bridges) -> {ok, problems, counts}: every span has its bridge, every bridge's deck clears the
//                             water by `clear` less 5 cm, the road's grade is held over the deck and its approaches,
//                             every pier stands on the ground (its base within 0.5 m of WORLD.Hbare)
// Deterministic: no draws.
var BRIDGES=(function(){'use strict';
const D={clear:4,deck:1.2,approach:10,grade:.08,step:2,pierEvery:24,culture:null};
const r2=v=>Math.round(v*100)/100;
function wetAt(x,z,hw,nx,nz,step){const RW=WORLD.riverWater;if(!RW)return -1e9;let w=-1e9;
 for(let s=-hw;s<=hw+1e-6;s+=step){const y=RW(x+nx*s,z+nz*s);if(y>w)w=y;}return w;}
function kindOf(len,tall,o){if(tall>25)return'viaduct';if(len<=12)return'slab';if(len<=40)return'arch';return'arches';}
function plan(road,o){o=Object.assign({},D,o||{});const P=road.pts.map(p=>p.slice()),n=P.length,hw=road.hw==null?4:road.hw,errors=[];
 if(n<2)return{road:Object.assign({},road,{pts:P}),spans:[],bridges:[],errors};
 const cum=[0];for(let i=1;i<n;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 /* the water under each point (the carriageway's width across the line's normal there) */
 const W=new Array(n);for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
  W[i]=wetAt(P[i][0],P[i][1],hw+1.5,-(b[1]-a[1])/L,(b[0]-a[0])/L,o.step);}
 /* the crossings: runs of wet points, each widened by the approach on either side (two that then touch are one) */
 const runs=[];for(let i=0;i<n;i++){if(!(W[i]>-1e8))continue;let j=i;while(j+1<n&&W[j+1]>-1e8)j++;runs.push([i,j]);i=j;}
 const spans=[];for(const R of runs){let a=R[0],b=R[1];while(a>0&&cum[R[0]]-cum[a]<o.approach)a--;while(b<n-1&&cum[b]-cum[R[1]]<o.approach)b++;
  if(a===b){if(b<n-1)b++;else if(a>0)a--;}
  const L=spans[spans.length-1];if(L&&a<=L[1])L[1]=Math.max(L[1],b);else spans.push([a,b]);}
 const HB=(x,z)=>WORLD.Hbare?WORLD.Hbare(x,z):WORLD.H(x,z),E0=P.map(p=>p[2]),G=o.grade;
 /* each deck: the line between its abutments' heights, lifted to clear the water; then the approaches re-held to the
    grade (only ever raised: a lifted deck needs a ramp up to it). An abutment stands far enough from the water that the
    ground's bank off the road before it (41: BANK 0.8 m a metre past the shoulder) cannot reach down into the channel:
    a span grows outward until (abutment - bed) <= (distance to the water - hw - 1.5) x 0.8, and the deck is laid again */
 const need=new Array(n).fill(-1e9);
 for(const S of spans){const [a,b]=S;for(let i=a;i<=b;i++)if(W[i]>-1e8)need[i]=Math.max(need[i],W[i]+o.clear+o.deck);}
 const lay=()=>{for(let i=0;i<n;i++)P[i][2]=E0[i];
  for(const S of spans){const [a,b]=S,ya=P[a][2],yb=P[b][2],La=cum[b]-cum[a]||1;let lift=0;
   for(let i=a;i<=b;i++){const t=(cum[i]-cum[a])/La,y=ya+(yb-ya)*t;if(need[i]>y)lift=Math.max(lift,need[i]-y);}
   for(let i=a;i<=b;i++){const t=(cum[i]-cum[a])/La;P[i][2]=ya+(yb-ya)*t+lift;}}
  /* the grade both ways, raising only (a deck's lift spreads up its approaches), never lowering a deck */
  for(let pass=0;pass<4;pass++){for(let i=1;i<n;i++){const m=P[i-1][2]-G*(cum[i]-cum[i-1]);if(P[i][2]<m)P[i][2]=m;}
   for(let i=n-2;i>=0;i--){const m=P[i+1][2]-G*(cum[i+1]-cum[i]);if(P[i][2]<m)P[i][2]=m;}}};
 for(let round=0;round<6;round++){lay();let grew=false;
  for(const S of spans){let w0=-1,w1=-1,bed=1e9;for(let i=S[0];i<=S[1];i++)if(W[i]>-1e8){if(w0<0)w0=i;w1=i;bed=Math.min(bed,HB(P[i][0],P[i][1]));}if(w0<0)continue;
   const reach=y=>hw+1.5+Math.max(0,y-bed)/.8+2;
   while(S[0]>0&&cum[w0]-cum[S[0]]<reach(P[S[0]][2])){S[0]--;grew=true;}
   while(S[1]<n-1&&cum[S[1]]-cum[w1]<reach(P[S[1]][2])){S[1]++;grew=true;}}
  /* spans that grew into each other are one */
  for(let k=spans.length-1;k>0;k--)if(spans[k][0]<=spans[k-1][1]){spans[k-1][1]=Math.max(spans[k-1][1],spans[k][1]);spans.splice(k,1);}
  if(!grew)break;}
 lay();   /* the decks on the spans as they finally stand */
 const bridges=spans.map((S,k)=>{const [a,b]=S,len=cum[b]-cum[a];let water=-1e9,bed=1e9,clr=1e9,tall=0;
  for(let i=a;i<=b;i++){const g=HB(P[i][0],P[i][1]);if(W[i]>-1e8){water=Math.max(water,W[i]);clr=Math.min(clr,P[i][2]-o.deck-W[i]);}bed=Math.min(bed,g);tall=Math.max(tall,P[i][2]-g);}
  const kind=kindOf(len,tall,o),piers=[];
  if(kind==='arches'||kind==='viaduct'){const np=Math.max(1,Math.round(len/o.pierEvery)-1);
   for(let q=1;q<=np;q++){const s=cum[a]+len*q/(np+1);let i=a;while(i<b&&cum[i+1]<s)i++;const t=(s-cum[i])/((cum[i+1]-cum[i])||1);
    const x=P[i][0]+(P[i+1][0]-P[i][0])*t,z=P[i][1]+(P[i+1][1]-P[i][1])*t,y=P[i][2]+(P[i+1][2]-P[i][2])*t;
    piers.push({x:r2(x),z:r2(z),yTop:r2(y-o.deck),yBase:r2(HB(x,z))});}}
  return{id:road.id+'/bridge/'+k,road:road.id,i0:a,i1:b,s0:r2(cum[a]),s1:r2(cum[b]),len:r2(len),kind,culture:o.culture,
   water:r2(water),bed:r2(bed),clearance:r2(clr),hw,deck:P.slice(a,b+1).map(p=>[r2(p[0]),r2(p[1]),r2(p[2])]),piers,
   abutments:[{x:r2(P[a][0]),z:r2(P[a][1]),y:r2(P[a][2])},{x:r2(P[b][0]),z:r2(P[b][1]),y:r2(P[b][2])}]};});
 return{road:Object.assign({},road,{pts:P.map(p=>[r2(p[0]),r2(p[1]),r2(p[2])]),spans:spans.map(s=>s.slice())}),spans,bridges,errors};}
function check(roads,bridges,o){o=Object.assign({},D,o||{});const problems=[],counts={roads:0,spans:0,bridges:bridges.length,piers:0};
 const byRoad={};bridges.forEach(B=>(byRoad[B.road]||(byRoad[B.road]=[])).push(B));
 for(const r of roads){counts.roads++;const P=r.pts,cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  for(const S of r.spans||[]){counts.spans++;const B=(byRoad[r.id]||[]).find(b=>b.i0===S[0]&&b.i1===S[1]);if(!B){problems.push(r.id+': a span '+S+' with no bridge');continue;}
   if(B.water>-1e8&&B.clearance<o.clear-.05)problems.push(B.id+': clears the water by '+B.clearance+' m');
   for(let i=Math.max(1,S[0]-30);i<=Math.min(P.length-1,S[1]+30);i++){const L=cum[i]-cum[i-1];if(L>.5&&Math.abs(P[i][2]-P[i-1][2])/L>o.grade+.005){problems.push(B.id+': steeper than the grade at point '+i);break;}}
   for(const q of B.piers){counts.piers++;const g=WORLD.Hbare?WORLD.Hbare(q.x,q.z):WORLD.H(q.x,q.z);if(Math.abs(g-q.yBase)>.5)problems.push(B.id+': a pier off the ground by '+(g-q.yBase).toFixed(2)+' m');}}}
 return{ok:!problems.length,problems,counts};}
return{plan,check,wetAt,DEFAULTS:D};})();
