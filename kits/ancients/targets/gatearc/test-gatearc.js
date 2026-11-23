// node kits/ancients/targets/gatearc/test-gatearc.js — the Hall of Heroes' and its stacks' plans in node (no browser): [G data].
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','core/terrain/37-core-stacks.js','kits/ancients/targets/gatearc/8av0-gatearc-plan.js','kits/ancients/targets/gatearc/8av2-gatestacks-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.GATEARC=typeof GATEARC!=="undefined"?GATEARC:this.GATEARC;this.GATESTACKS=typeof GATESTACKS!=="undefined"?GATESTACKS:this.GATESTACKS;',ctx,{filename:f});
const A=ctx.GATEARC,ST=ctx.GATESTACKS,KS=ctx.KSTACKS;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=A.plan(),R=A.ruin(P),K=A.kimr(P,R),SP=ST.plan({hall:P}),SR=ST.ruin(SP);
console.log(JSON.stringify({hall:P.stats,ruin:R.stats,kimr:K.stats,stacks:SP.stats}));
ok(JSON.stringify(P)===JSON.stringify(A.plan())&&JSON.stringify(SP)===JSON.stringify(ST.plan({hall:A.plan()})),'the plans are deterministic');
// Soleri's numbers
ok(P.stats.width>400&&P.stats.width<460,'over 400 m wide ('+P.stats.width+' m across the corners)');
ok(P.stats.height>=395&&P.stats.height<=420,'about 400 m high ('+P.stats.height+' m)');
ok(P.cols.length===6&&P.cols.every(c=>c.r===50),'six columns 100 m across');
ok(P.slabs.length===2&&P.slabs.every(s=>s.y1-s.y0>=60),'two thick topographies ('+P.slabs.map(s=>s.y0+'-'+s.y1).join(', ')+' m)');
// the columns sit inside both slabs' outlines, outside the well
ok(P.cols.every(c=>P.slabs.every(s=>Math.hypot(c.x,c.z)+c.r<=A.hexR(Math.atan2(c.z,c.x),s.ro)+.01&&Math.hypot(c.x,c.z)-c.r>s.ri)),'the columns stand inside the slabs and clear of the skylight well');
const ids=new Set();let dup=0;for(const x of [].concat(P.cols,P.caps,P.cells,P.piers,P.halls,P.ribs,P.causeways))(ids.has(x.id)?dup++:ids.add(x.id));
ok(!dup,'unique ids ('+ids.size+')');
// every row of cells spans its face exactly
const rows={};for(const c of P.cells){const k=c.slab+c.face+'.'+c.row;rows[k]=rows[k]||[];rows[k].push(c);}
ok(Object.values(rows).every(r=>Math.abs(r[r.length-1].t1-1)<1e-9&&r.every((c,i)=>i===0?c.t0===0:Math.abs(c.t0-r[i-1].t1)<1e-9)),'every row of cells runs corner to corner without gaps ('+Object.keys(rows).length+' rows)');
ok(P.cells.every(c=>c.w>=5.99&&c.w<=9*2),'cells 6-9 m wide (the last of a row up to twice)');
// the causeways reach the bank and the piers stand in the pond
ok(P.causeways.every(c=>!A.inPond(c.to[0],c.to[2])&&A.inPond(c.from[0],c.from[2])),'the causeways run from the plinths to the banks');
ok(P.piers.every(p=>A.inPond(p.x,p.z)),'the service piers stand in the pond');
// the ruin
ok(R.cellsGone.length>P.cells.length*.18&&R.cellsGone.length<P.cells.length*.45,'a quarter to two-fifths of the skin is gone ('+R.cellsGone.length+' of '+P.cells.length+')');
ok(R.fallen.every(f=>A.inPond(f.x,f.z))&&R.fallen.every(f=>Math.hypot(f.x-P.cols[3].x,f.z-P.cols[3].z)>P.dim.PLINTH.r+f.r*.6),'the fallen cap lies in the pond, clear of its plinth');
// the necropolis
ok(K.niches.length>150,'burial niches in the broken lower cells ('+K.niches.length+')');
ok(K.niches.every(n=>R.cellsGone.indexOf(n.cell)>=0),'every niche is in a broken cell');
ok(K.poles.length>=20&&K.poles.every(p=>p.tags.culture==='kimr'),'skull poles along the funeral road ('+K.poles.length+')');
ok(A.kimr(P,null).niches.length===0,'the intact Hall has no tombs');
// the stacks
ok(SP.stacks.length===5,'five stacks');
const pondClear=SP.stacks.every(S=>{const r=KS.ring(S,S.y0+1,48);return r&&r.every(p=>!A.inPond(p[0],p[1],10));});
ok(pondClear,'every stack stands on the bank, 10 m clear of the pond');
const tops=SP.stacks.map(S=>Math.round(S.top-S.y0));
ok(tops[0]>=315&&tops[2]>=375&&tops[4]<=145,'heights as planned ('+tops.join(', ')+' m)');
// no two stacks overlap; none stands inside the arcology's reach
ok(SP.stacks.every((S,i)=>SP.stacks.every((T,j)=>i>=j||Math.hypot(S.x-T.x,S.z-T.z)>S.R+T.R*0.5)),'the stacks stand apart');
ok(SP.bridges.length===6,'six bridges ('+SP.bridges.map(b=>b.key+' '+Math.round(b.span)+' m').join(', ')+')');
ok(SP.bridges.every(b=>b.span>=100&&b.span<=420),'spans of 100-420 m');
// a bridge's open span clears every stack it does not land on (sampled every 4 m, at the deck and under it)
let hits=[];
for(const b of SP.bridges){const n=Math.ceil(b.span/4);
 for(let i=2;i<n-1;i++){const t=i/n,x=b.a.face[0]+(b.b.face[0]-b.a.face[0])*t,z=b.a.face[1]+(b.b.face[1]-b.a.face[1])*t;
  for(const S of SP.stacks){if(S.key===b.a.stack||S.key===b.b.stack)continue;for(const dy of [0,-6])if(KS.topAt([S],x,z)>b.y+dy){hits.push(b.key+' x '+S.key);break;}}
  // and the Hall: inside a slab's outline at a slab's level, for a stack-to-stack bridge
  if(!b.a.slab&&!b.b.slab)for(const s of P.slabs)if(b.y>s.y0&&b.y<s.y1&&Math.hypot(x,z)<A.hexR(Math.atan2(z,x),s.ro)+8)hits.push(b.key+' x the Hall');}}
ok(!hits.length,'the bridges clear the stacks and the Hall'+(hits.length?' ('+[...new Set(hits)].join('; ')+')':''));
// the stack ends: the deck's end is inside the rock, its face end on the outline
ok(SP.bridges.every(b=>[b.a,b.b].every(e=>!e.stack||KS.topAt(SP.stacks.filter(S=>S.key===e.stack),e.x,e.z)>=b.y)),'every stack end of a deck is embedded in its rock');
ok(SP.bridges.filter(b=>b.span>180).every(b=>b.piers.length>=1),'spans over 180 m stand on piers');
ok(SP.falls.length===1&&SP.falls[0].y0-SP.falls[0].y1>250,'the Garden Stack\'s fall drops '+Math.round(SP.falls[0].y0-SP.falls[0].y1)+' m');
ok(SP.fittings.filter(f=>f.kind==='terrace').length>=3,'the Garden Stack is terraced');
ok(SP.fittings.filter(f=>f.kind==='saucer').length===3,'three saucer decks');
ok(SR.broken.length===1&&SR.rope.length===1,'the ruin breaks one span and slings one rope bridge');
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
