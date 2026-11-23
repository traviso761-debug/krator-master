// node settlements/gihon/test-gh-town.js — Gihon (src/41-gh-town.js) on core/city with its forbidden city, its ring and the
// Alph's hamlets (src/42-gh-ring.js) on core/hamlet, and the Landing on its piers (src/43-gh-landing.js), with the Xanadu kit's
// boxes (test-gh-load.js reads them from its defs): no two buildings overlap, none stands on a street or in the water but the
// harbour's and the river's own, the town holds PLAN.md's 8,500, the forbidden city stands walled on its terrace inside the
// town with its pieces inside its own wall (the fort asset's rules kept), the landmarks stand, the bridge spans the Opal
// River, the ring's and the Alph's villages are the tune's and lay out dry, the Landing holds 2,500 on both banks with a pier
// each side of the mouth, and the layout reruns the same. Each check with a negative (tools/ktest.js).
'use strict';
const path=require('path');
const {ROOT,dims}=require('./test-gh-load.js');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
const t0=Date.now(),K=GH_TOWN.make({dims}),ms=Date.now()-t0;
console.log('the town in '+ms+' ms: '+JSON.stringify(K.census.byCls)+'; '+K.census.buildings+' buildings, '+K.census.people+' people (the forbidden city '+K.census.fc+'); '+K.ways.length+' ways');
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return {c:[L.x,L.z],u:[c,-s],v:[s,c],hw:(L.fw||L.w)/2,hd:(L.fd||L.d)/2};};
const pen=(A,B)=>{let m=1e9;for(const ax of [A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const RUNS=new Set(['quay','mole','wall','bridge','gardenwall','pier']);
const ON_MOLE=(a,b)=>a.kind==='lighthouse'&&(b.kind==='mole'||b.kind==='pier');
const overlaps=X=>{const all=X.lots.concat(X.extra),B=all.map(box),out=[];
 for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])>90)continue;
  if(RUNS.has(all[i].kind)&&all[i].kind===all[j].kind)continue;
  if(ON_MOLE(all[i],all[j])||ON_MOLE(all[j],all[i]))continue;if(pen(B[i],B[j])>.3)out.push(all[i].id+'|'+all[j].id);}return out;};
const onStreet=X=>{const out=[];for(const L of X.lots.concat(X.extra.filter(r=>r.fc))){if(L.cls==='landmark')continue;const B=box(L);
 for(const w of X.ways){if(!!w.fc!==!!L.fc)continue;const m=w.w/2-.6;if(w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1];return Math.abs(dx*B.u[0]+dz*B.u[1])<B.hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<B.hd+m;})){out.push(L.id+'@'+w.id);break;}}}return out;};
const WATERY=new Set(['quay','mole','lighthouse','boat','boatshed','bridge','slip']);
const inWater=X=>X.lots.concat(X.extra).filter(L=>!WATERY.has(L.kind)&&(GH_GROUND.h(L.x,L.z)<.8||GH_GROUND.riverAt(L.x,L.z)[0]<GH_GROUND.river.width/2)).map(L=>L.id);
{const o=overlaps(K);T.ok('no two buildings overlap (the lots, the harbour, the river front, the forbidden city, the gardens)',!o.length,o.length+' pairs'+(o.length?': '+o.slice(0,5).join(', '):''));
 T.neg('a building set on another is caught',X=>!overlaps(X).length,Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'copy'})])}),K);}
{const s=onStreet(K);T.ok('no building stands on a street (the town\'s, or the forbidden city\'s inside it)',!s.length,s.length+' on a street'+(s.length?': '+s.slice(0,4).join(', '):''));
 const w=K.ways.find(w=>w.cls==='avenue'),p=w.pts[Math.floor(w.pts.length/2)];
 T.neg('a house on an avenue is caught',X=>!onStreet(X).length,Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots.find(l=>l.cls!=='landmark'),{id:'on-street',x:p[0],z:p[1]})])}),K);}
{const l=inWater(K);T.ok('nothing but the harbour\'s and the river front\'s pieces stands in the lake or the Opal River',!l.length,l.length+' wet'+(l.length?': '+l.slice(0,4).join(', '):''));
 T.neg('a house in the lake is caught',X=>!inWater(X).length,Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'afloat',x:0,z:-1400})])}),K);}
/* PLAN.md section 2: 8,500 (the town, the forbidden city, the houses), within 15 %; the forbidden city's 1,000 and the Tears' 160 */
const peopleOk=X=>Math.abs(X.census.people-8500)<=8500*.15&&X.census.fc>=1000;
T.ok('the town holds PLAN.md\'s 8,500 (within 15 %), the forbidden city at least its 1,000 and the Golden Tears\' head house',peopleOk(K),K.census.people+' people, '+K.census.fc+' in the forbidden city');
T.neg('a town of half the people is caught',peopleOk,Object.assign({},K,{census:Object.assign({},K.census,{people:4250})}),K);
/* the forbidden city: inside the town's wall, on its level terrace, every piece of it inside its own wall (KCITY.grid.inside),
   no outer street across it, the fort asset's rules kept (XFORT.check), its two gates on its axis, its moat */
const fcCheck=X=>{const F=X.fc,bad=[],G0=GH_TOWN.fcGrid(),GR=GH_TOWN.grid();if(!F||!F.ward)return['no forbidden city'];
 for(const id of F.pieces){const r=X.extra.find(q=>q.id===id);if(!r){bad.push(id+' missing');continue;}const B=box(r);
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const x=B.c[0]+a*B.hw*B.u[0]+b*B.hd*B.v[0],z=B.c[1]+a*B.hw*B.u[1]+b*B.hd*B.v[1];if(!KCITY.grid.inside(G0,x,z)){bad.push(id+' over its wall');break;}}
  if(Math.abs(r.y-F.terrace.y)>.01)bad.push(id+' off the terrace');}
 for(const c of G0.corners)if(!KCITY.grid.inside(GR,c.x,c.z))bad.push('its corner '+c.id+' outside the town');
 for(const w of X.ways){if(w.fc)continue;for(const p of w.pts)if(KCITY.grid.inside(G0,p[0],p[1])){bad.push(w.id+' crosses it');break;}}
 if((F.ward.plan.faults||[]).length)bad.push('the fort asset\'s rules: '+F.ward.plan.faults[0]);
 const gs=F.ward.plan.gates.map(g=>g.id).sort().join(',');if(gs!=='gate.n,gate.s')bad.push('gates '+gs);
 if(!F.moat)bad.push('no moat');return bad;};
{const b=fcCheck(K);T.ok('the forbidden city: walled on its terrace inside the town, its pieces inside its own wall, no town street across it, the fort asset\'s rules kept, its north and south gates, its moat',!b.length,
  b.slice(0,4).join('; ')||(K.fc.pieces.length+' pieces at '+K.fc.terrace.y+' m, '+K.fc.ward.plan.curtains.length+' curtains, '+K.fc.ward.plan.towers.length+' towers'));
 T.neg('a piece set over the forbidden city\'s wall is caught',X=>!fcCheck(X).length,Object.assign({},K,{extra:K.extra.map(r=>r.id==='gh.fc.mint'?Object.assign({},r,{x:r.x-140}):r)}),K);}
/* the landmarks (PLAN.md section 3) */
const LM=['gh.temple','gh.white','gh.violet','gh.generator','gh.serai','gh.extra.customs','gh.extra.lighthouse','gh.fc.mint','gh.fc.assessors','gh.fc.treasury','gh.fc.tears'];
const lmOk=X=>{const ids=new Set(X.lots.concat(X.extra).map(r=>r.id));return LM.filter(id=>!ids.has(id));};
{const m=lmOk(K);T.ok('the landmarks stand: the gold-and-opal temple, the White and the Violet houses, the generator, the serai, the customs house, the lighthouse, the Mint, the assessors, the treasury, the Tears\' head house',!m.length,m.length?'missing: '+m.join(', '):LM.length+' landmarks');
 T.neg('a town without its Mint is caught',X=>!lmOk(X).length,Object.assign({},K,{extra:K.extra.filter(r=>r.id!=='gh.fc.mint')}),K);}
/* the bridge over the Opal River: its ends on the banks, the river under its middle, the deck over the water */
const bridgeOk=X=>{const B=X.bridge,G=GH_GROUND,mid=[(B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2];return B.deck>G.riverAt(...mid)[1]+3&&G.riverAt(...mid)[0]<G.river.width/2&&G.riverAt(...B.a)[0]>G.river.width/2&&G.riverAt(...B.b)[0]>G.river.width/2;};
T.ok('the bridge spans the Opal River: its ends on the banks, the river under its middle, the deck over the water',bridgeOk(K),'deck '+K.bridge.deck.toFixed(1)+' m, '+K.riverQuays+' river quays');
T.neg('a bridge set beside the river is caught',bridgeOk,Object.assign({},K,{bridge:Object.assign({},K.bridge,{a:[K.bridge.a[0]-400,K.bridge.a[1]],b:[K.bridge.a[0]-300,K.bridge.a[1]]})}),K);
/* the walls: four named gates, four bastions; the town's moat and the forbidden city's */
const wallOk=X=>!!X.wall&&X.wall.nodes.filter(n=>n.kind==='gate'&&n.named).length===4&&X.wall.corners.length===4&&!!X.moat;
T.ok('the town wall: four named gates, four corner bastions, the moat',wallOk(K),K.wall?K.wall.nodes.filter(n=>n.kind==='gate').map(n=>n.name).join(', '):'no wall');
T.neg('a wall with a gate lost is caught',wallOk,Object.assign({},K,{wall:Object.assign({},K.wall,{nodes:K.wall.nodes.filter((n,i)=>!(n.kind==='gate'&&i===K.wall.nodes.findIndex(q=>q.kind==='gate')))})}),K);
/* reruns the same */
{const K2=GH_TOWN.make({dims}),sig=X=>X.lots.length+':'+X.lots.slice(0,40).map(l=>l.key+Math.round(l.x)+Math.round(l.z)).join(',');
 T.ok('the layout reruns the same (core/rand streams)',sig(K2)===sig(K),K2.lots.length+' lots both times');
 const K3=GH_TOWN.make({dims,seed:777});T.neg('a layout from another seed differs',X=>sig(X)===sig(K),K3,K2);}
/* ---- the ring and the Alph's hamlets: the tune's (ids, places, people), every village laid dry */
const XT=require(path.join(ROOT,'core','region','data','xan-tune.js'));
const near=(a,b)=>Math.abs(a-b)<1e-6;
const sameLists=R=>R.ring.length===XT.ghRing.length&&R.ring.every((r,i)=>{const q=XT.ghRing[i];return r[0]===q[0]&&near(r[2],q[2])&&near(r[3],q[3])&&r[5]===q[5];})&&
 R.alph.length===XT.alph.length&&R.alph.every((r,i)=>{const q=XT.alph[i];return r[0]===q[0]&&near(r[2],q[2])&&near(r[3],q[3])&&r[5]===q[5]&&r[4]===q[4];});
T.ok('the ring\'s and the Alph\'s villages are the economy\'s (XAN_TUNE.ghRing and alph: ids, places, people, foci)',sameLists(GH_RING),GH_RING.ring.length+' in the ring, '+GH_RING.alph.length+' on the Alph');
T.neg('a ring village moved off the tune\'s place is caught',sameLists,Object.assign({},GH_RING,{ring:GH_RING.ring.map((r,i)=>i?r:[r[0],r[1],r[2]+1,r[3],r[4],r[5]])}),GH_RING);
const V=GH_RING.make({dims});
const laid=Vs=>{const bad=[];for(const v of Vs){if(v.error||!v.records||v.records.length<20){bad.push(v.id+': '+(v.error||(v.records||[]).length+' records'));continue;}
 const h=v.ground==='page'?GH_GROUND.h:GH_GROUND.model;for(const r of v.records)if(h(r.x,r.z)<2){bad.push(v.id+': '+r.id+' wet');break;}}return bad;};
{const b=laid(V);T.ok('every village lays out on core/hamlet (the Xanadu row by name): the ring on the page\'s ground, the Alph\'s on the model\'s, every building dry',!b.length,
  V.map(v=>v.id.replace(/^gh\.ring\.|^alph\./,'')+' '+(v.records||[]).length).join(', ')+(b.length?'; '+b.join('; '):''));
 T.neg('a village whose house stands in the lake is caught',Vs=>!laid(Vs).length,V.map((v,i)=>i?v:Object.assign({},v,{records:v.records.map((r,j)=>j?r:Object.assign({},r,{x:0,z:-3000}))})),V);}
{const foci=Vs=>['orchard','tea'].every(f=>Vs.some(v=>v.focus===f&&(v.records||[]).some(r=>/fermentary|tea_factory|apiary/.test(r.key))));
 T.ok('the Alph\'s orchard and tea hamlets lay their works (the row\'s orchard and tea foci)',foci(V),V.filter(v=>v.kind==='alph').map(v=>v.focus).join(', '));
 T.neg('a tea hamlet without its tea factory is caught',foci,V.map(v=>v.focus==='tea'?Object.assign({},v,{records:v.records.filter(r=>!/tea_factory/.test(r.key))}):v),V);}
/* ---- G3: the Landing, 2,500 on both banks, a pier into the lake either side of the mouth, its buildings dry and apart */
const Ld=GH_LANDING.make({dims});
const ldCheck=X=>{const bad=[];if(Math.abs(X.census.people-2500)>2500*.2)bad.push(X.census.people+' people');
 if(!(X.census.byBank.north>50&&X.census.byBank.south>50))bad.push('a bank empty');
 if(X.piers.length!==2)bad.push(X.piers.length+' piers');
 for(const P of X.piers){const head=P.b;if(!(X.h(head[0],head[1])<0))bad.push(P.id+' does not reach the lake');}
 if(X.piers.length===2){const s=X.piers.map(P=>GH_LANDING.uvOf(P.a)[1]);if(!(s[0]*s[1]<0))bad.push('the piers on one side');}
 for(const r of X.lots)if(X.h(r.x,r.z)<1){bad.push(r.id+' wet');break;}
 const o=overlaps({lots:X.lots,extra:X.extra.filter(r=>r.kind!=='boat')});if(o.length)bad.push(o.length+' overlaps: '+o[0]);
 return bad;};
{const b=ldCheck(Ld);T.ok('the Landing: 2,500 (within 20 %) on both banks of the outlet, a pier into the lake either side of the mouth, every building dry and apart',!b.length,
  b.join('; ')||(Ld.census.people+' people, '+JSON.stringify(Ld.census.byBank)+' lots, '+Ld.piers.length+' piers'));
 T.neg('a Landing with one pier is caught',X=>!ldCheck(X).length,Object.assign({},Ld,{piers:Ld.piers.slice(0,1)}),Ld);}
T.done();
