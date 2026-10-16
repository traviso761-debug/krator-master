// node core/space/test-space.js — KSPACE's contract (20-core-space.js), each check with a negative that must fail.
// The index must answer exactly what a linear scan of its items answers, in insertion order: on random sets, with
// wide items and odd numbers, and with items inserted after earlier queries.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'20-core-space.js'),'utf8'));
let bad=0;
// pass: the check holds; neg: its negative (a broken variant, or the thing the check guards against) is seen to fail
const ok=(name,pass,neg,detail)=>{const r=pass&&neg;if(!r)bad++;
 console.log((r?'PASS  ':'FAIL  ')+name+(detail?'  ('+detail+')':'')+(pass&&!neg?'  [its negative did not fail]':''));};
// the test's own generator (not KSPACE's or BIO's: the sets must not depend on the code under test)
const mul=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
let R=mul(20261012);const U=(a,b)=>a+(b-a)*R(),pick=a=>a[Math.floor(R()*a.length)];
// the reference: a scan of every item with the documented test, in insertion order
const scan=(L,x,z,pad)=>{pad=pad==null?0:+pad;return L.filter(o=>{const e=o.r+pad;return Math.abs(x-o.x)<=e&&Math.abs(z-o.z)<=e;});};
const same=(a,b)=>a.length===b.length&&a.every((o,i)=>o===b[i]);
function item(k){const u=R();
 const r=u<.02?U(80,400):u<.05?U(-5,0):u<.08?0:u<.09?pick([NaN,Infinity,1e9]):U(0,15);
 const o={k,x:U(-800,800),z:U(-800,800),r};if(R()<.004)o.x=pick([NaN,Infinity,-Infinity]);return o;}
const PADS=[0,.5,3,8,24,40,-2,-30,null,undefined,NaN,1e4,Infinity];
const qry=()=>({x:U(-900,900),z:U(-900,900),pad:pick(PADS)});
const fill=(S,L,n)=>{for(let i=0;i<n;i++){const o=item(L.length);L.push(o);S.insert(o,o.x,o.z,o.r);}};

// 1. random sets: the same items in the same order as the scan
let diff=0,nonEmpty=0,reordered=0,total=0;
for(const cell of [24,6,100]){const S=KSPACE.create({cell}),L=[];fill(S,L,1500);
 for(let q=0;q<3000;q++){const Q=qry(),a=S.query(Q.x,Q.z,Q.pad),b=scan(L,Q.x,Q.z,Q.pad);total++;
  if(!same(a,b))diff++;if(b.length)nonEmpty++;
  // the negative's raw material: would cell-major order (row by row through the grid) differ from insertion order?
  const cm=b.slice().sort((p,o)=>(Math.floor(p.x/cell)-Math.floor(o.x/cell))||(Math.floor(p.z/cell)-Math.floor(o.z/cell))||0);
  if(!same(cm,b))reordered++;}}
ok('query equals a linear scan, in insertion order, on random sets (cells 24, 6, 100 m)',diff===0&&nonEmpty>2000,reordered>0,
 diff+' of '+total+' differ; '+nonEmpty+' non-empty');
// the edges and the pad: the documented test is inclusive and grows by the pad; a scan without the pad, or with a
// strict test, answers differently (so check 1 would have caught either mistake)
{const S=KSPACE.create({cell:24}),L=[];fill(S,L,800);let np=0,st=0;
 for(let q=0;q<3000;q++){const Q=qry(),p=Q.pad==null?0:+Q.pad,a=S.query(Q.x,Q.z,Q.pad);
  if(!same(a,scan(L,Q.x,Q.z,0)))np++;
  if(!same(a,L.filter(o=>{const e=o.r+p;return Math.abs(Q.x-o.x)<e&&Math.abs(Q.z-o.z)<e;})))st++;}
 const grid=[];for(let i=0;i<40;i++)for(let j=0;j<40;j++)grid.push({x:i*24,z:j*24,r:0});
 const G=KSPACE.create({cell:24});grid.forEach(o=>G.insert(o,o.x,o.z,o.r));
 const edge=G.query(48,48,24),strictEdge=grid.filter(o=>Math.abs(48-o.x)<24&&Math.abs(48-o.z)<24);
 ok('the square test is inclusive at its edge (points exactly pad away, on the cell corners, are returned)',
  edge.length===9&&same(edge,scan(grid,48,48,24)),strictEdge.length===1&&np>0&&st>0,
  edge.length+' of 9; a strict test keeps '+strictEdge.length+'; on random queries a scan without the pad differs on '+np+', a strict one on '+st);}

// 2. items inserted after earlier queries: every query answers for the items so far
{const S=KSPACE.create({cell:24}),L=[];let d=0,stale=0,n=0,snap=null;
 for(let round=0;round<30;round++){fill(S,L,60);if(round===0)snap=L.slice();
  for(let q=0;q<150;q++){const Q=qry(),a=S.query(Q.x,Q.z,Q.pad);n++;if(!same(a,scan(L,Q.x,Q.z,Q.pad)))d++;
   if(round>0&&!same(a,scan(snap,Q.x,Q.z,Q.pad)))stale++;}}
 ok('items inserted between queries are found (interleaved: 30 rounds of 60 inserts and 150 queries)',d===0,stale>0,
  d+' of '+n+' differ; a stale snapshot would differ on '+stale);}

// 3. the disc test on top: what the biome core asks (hypot < r+pad) gives the scan's answer on every query
{const S=KSPACE.create({cell:24}),L=[];fill(S,L,1200);let d=0,miss=0,hits=0;
 const disc=(A,Q)=>{const p=Q.pad==null?0:+Q.pad;return A.filter(o=>Math.hypot(Q.x-o.x,Q.z-o.z)<o.r+p);};
 for(let q=0;q<4000;q++){const Q=qry();const a=disc(S.query(Q.x,Q.z,Q.pad),Q),b=disc(L,Q);if(!same(a,b))d++;if(b.length)hits++;
  const p=Q.pad==null?0:+Q.pad;if(p>0&&p<1e3&&!same(disc(S.query(Q.x,Q.z,0),Q),b))miss++;}
 ok('a disc test on the query equals the disc test on every item, in order',d===0&&hits>500,miss>0,
  d+' differ, '+hits+' with a hit; a query that ignored the pad would miss on '+miss);}

// 4. wide items and huge pads: a disc 400 m across is found from its far side; a pad of 1e4 returns everything
{const S=KSPACE.create({cell:10}),L=[];const big={x:0,z:0,r:400};L.push(big);S.insert(big,0,0,400);fill(S,L,200);
 const far=S.query(395,-395,0),all=S.query(0,0,1e4);
 ok('a wide item (more cells than the grid files) is found anywhere under it',far[0]===big&&same(far,scan(L,395,-395,0)),S.query(405,0,0)[0]!==big,
  far.length+' at the far corner');
 ok('a pad wider than the grid reads everything, in order',all.length>150&&same(all,scan(L,0,0,1e4)),!same(all,S.query(0,0,100)),
  all.length+' of '+L.length+' (an item with a NaN coordinate or r is never returned)');}

// 5. out is emptied and refilled; some() calls in order and stops at the first true
{const S=KSPACE.create({cell:24}),L=[];fill(S,L,500);const out=[1,2,3];let Q=qry();while(scan(L,Q.x,Q.z,30).length<3)Q=qry();
 const r=S.query(Q.x,Q.z,30,out),want=scan(L,Q.x,Q.z,30);
 ok('query(…, out) empties out and returns it filled',r===out&&same(out,want),!same([1,2,3],want),out.length+' items');
 const mid=want[want.length>>1],seen=[];const any=S.some(Q.x,Q.z,30,o=>{seen.push(o);return o===mid;});
 const none=S.some(Q.x,Q.z,30,o=>false);
 ok('some() visits in insertion order and stops at the first true',any===true&&same(seen,want.slice(0,(want.length>>1)+1)),none===false,seen.length+' visited');}

// 6. the grid refuses a cell it cannot use
{let threw=0;for(const c of [undefined,0,-5,NaN,Infinity,'24'])try{KSPACE.create({cell:c});}catch(e){threw++;}
 let fine=true;try{KSPACE.create({cell:.25});}catch(e){fine=false;}
 ok('create() needs a positive finite cell (no silent default)',threw===6,fine,threw+' of 6 refused');}

// 7. clear() and size()
{const S=KSPACE.create({cell:24}),L=[];fill(S,L,50);const n=S.size();S.clear();
 ok('clear() empties the index',S.size()===0&&S.query(0,0,1e4).length===0,n===50,n+' before');}

// 8. coordinates far out (beyond 2^20 cells) are scanned, not mis-keyed
{const S=KSPACE.create({cell:1}),L=[];for(let i=0;i<300;i++){const o={x:U(-3e6,3e6),z:U(-3e6,3e6),r:U(0,5)};L.push(o);S.insert(o,o.x,o.z,o.r);}
 const P={x:2.5e6,z:-2.5e6,r:2};L.push(P);S.insert(P,P.x,P.z,P.r);let d=0;
 for(let q=0;q<500;q++){const x=U(-3e6,3e6),z=U(-3e6,3e6);if(!same(S.query(x,z,1e5),scan(L,x,z,1e5)))d++;}
 ok('coordinates beyond the grid\'s keys answer like the scan',d===0&&S.query(2.5e6+1,-2.5e6,0)[0]===P,S.query(2.5e6+4,-2.5e6,0).length===0,d+' of 500 differ');}

console.log(bad?bad+' check(s) FAILED':'all checks passed');
process.exit(bad?1:0);
