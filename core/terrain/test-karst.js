// node core/terrain/test-karst.js — a solution cave's plan and the land over it (39c-core-karst.js, KKARST), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of['../rand/08-core-rand.js','35-core-strata.js','38-core-relief.js','39-core-cavern.js'])eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const kinds0=KRELIEF.kinds().join(),hadKarst=!!KSTRATA.RECIPES.karst;
eval(fs.readFileSync(path.join(__dirname,'39c-core-karst.js'),'utf8'));
const K=KKARST;
// a limestone plateau at 100 m falling to a valley along its south edge at 40 m
const ground=(x,z)=>40+60*Math.min(1,Math.max(0,(700-z)/400))+2*Math.sin(x/70);
const box=[0,0,800,800],o={box,ground,world:3,level:45,table:47,joints:{angle:.3,sp:40}};
const N=K.network(o),M={};N.nodes.forEach(n=>M[n.id]=n);
ok('a branch cave: nodes, passages, sinks, a spring ('+N.nodes.length+' nodes, '+N.passages.length+' passages, '+N.sinks.length+' sinks)',N.passages.length>20&&N.sinks.length>3&&N.spring&&N.spring.z>700,N.passages.length===0);
ok('the same box and world, the same cave; another world, another',JSON.stringify(K.network(o))===JSON.stringify(N)&&JSON.stringify(K.network(Object.assign({},o,{world:4})))!==JSON.stringify(N),false);
// branchwork: a tree draining to the spring, the floor rising upstream
const adj={};N.passages.forEach(p=>{(adj[p.a]=adj[p.a]||[]).push(p.b);(adj[p.b]=adj[p.b]||[]).push(p.a);});
const seen={},q=[N.spring.node];seen[N.spring.node]=1;while(q.length){const c=q.shift();(adj[c]||[]).forEach(m=>{if(!seen[m]){seen[m]=1;q.push(m);}});}
ok('every passage drains to the spring (one piece)',N.nodes.every(n=>seen[n.id]),false);
ok('a branchwork is a tree (passages = nodes - 1)',N.passages.length===N.nodes.length-1,false);
ok('the spring is the lowest floor; every other floor rises from it',N.nodes.every(n=>n.y>=N.spring.y-1e-9)&&N.nodes.some(n=>n.y>N.spring.y+1),false);
ok('every sink is a shaft from its passage up through the ground, under a doline',N.sinks.every(s=>{const S=N.shafts.find(h=>h.sink===s.id),D=N.dolines.find(d=>d.over===s.id);return S&&D&&S.y1>ground(s.x,s.z)&&S.y0===M[s.node].y&&D.form==='bowl';}),false);
const secs={};N.passages.forEach(p=>secs[p.section]=(secs[p.section]||0)+1);
ok('over the water table a stream passage is a keyhole with a canyon; under it, flooded ('+JSON.stringify(secs)+')',N.passages.every(p=>p.section!=='keyhole'||p.canyon>=1)&&N.passages.filter(p=>p.section==='keyhole').length>0&&N.passages.filter(p=>p.section==='sump'||p.section==='phreatic').every(p=>Math.min(M[p.a].y,M[p.b].y)<N.table||!p.stream),false);
const Fl=K.network(Object.assign({},o,{table:52})),Fm={};Fl.nodes.forEach(n=>Fm[n.id]=n);
ok('under a higher water table the low passages are sumps, the water module has them ('+Fl.passages.filter(p=>p.section==='sump').length+')',Fl.passages.some(p=>p.section==='sump')&&Fl.passages.filter(p=>p.section==='sump').every(p=>Math.max(Fm[p.a].y,Fm[p.b].y)+p.h<52)&&K.water(Fl).sumps.length>0,false);
ok('chambers stand where three passages meet',N.chambers.length>0&&N.chambers.every(c=>M[c.node].deg>=3),N.chambers.some(c=>M[c.node].deg<3));
// a maze with an older level above it
const Z=K.network(Object.assign({},o,{kind:'maze',p:.6,levels:[{y:70,kind:'maze',p:.45}]}));
const lv0=Z.passages.filter(p=>p.level===0),n0=Z.nodes.filter(n=>n.level===0);
ok('a maze has loops (passages >= nodes on its level: '+lv0.length+' / '+n0.length+')',lv0.length>=n0.length,lv0.length===n0.length-1);
ok('the upper level is dry and joined to the lower by a shaft',Z.passages.filter(p=>p.level===1).length>0&&Z.passages.filter(p=>p.level===1).every(p=>p.section==='phreatic'&&!p.stream)&&Z.shafts.some(s=>s.kind==='level'&&s.y1>s.y0+20),false);
// into KCAVERN
const C=KCAVERN.create({ground,cell:1,chunk:16,seed:4}),Bd=K.build(C,N);C.build();
const clear=p=>{const x=(M[p.a].x+M[p.b].x)/2,z=(M[p.a].z+M[p.b].z)/2;return ground(x,z)-((M[p.a].y+M[p.b].y)/2+p.h)>10&&N.chambers.every(c=>Math.hypot(c.c[0]-x,c.c[2]-z)>c.rx+c.rz+10)&&N.shafts.every(s=>Math.hypot(s.c[0]-x,s.c[1]-z)>15);};
const P=N.passages.find(p=>p.section==='keyhole'&&clear(p)),a=M[P.a],b=M[P.b],mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,my=(a.y+b.y)/2;
ok('a passage is open air underground, rock over its roof',C.sdf(mx,my+P.h*.45,mz)>0&&C.inRock(mx,my+P.h+2,mz)&&my+P.h+2<ground(mx,mz),!C.inRock(mx,my+P.h+2,mz));
ok('its canyon is open under the tube\'s floor',C.sdf(mx,my-P.canyon*.5,mz)>0,false);
const sk=N.shafts.find(s=>s.kind==='sink');ok('a sink\'s shaft is open from the passage to the sky',C.sdf(sk.c[0],sk.y0+1,sk.c[1])>0&&C.sdf(sk.c[0],(sk.y0+ground(sk.c[0],sk.c[1]))/2,sk.c[1])>0,false);
ok('build refuses what is not a cave or a network',throws(()=>K.build({},N))&&throws(()=>K.build(KCAVERN.create({ground}),{})),false);
// water, hazards, relief, strata
const Wt=K.water(N);
ok('water: a stream in every keyhole\'s canyon, the spring\'s mouth facing out',Wt.streams.length===secs.keyhole&&Wt.streams.every(s=>s.pts.length===2&&s.w>0)&&Wt.spring.dir[1]>.5,Wt.streams.length===0);
const Hz=K.hazards(N);ok('hazards: a fall down every shaft, drowning over sumps and flooded chambers',Hz.filter(h=>h.tags.hazard.kind==='fall').length===N.shafts.length&&Hz.every(h=>h.tags.hazard.shape&&h.at.length===3),false);
const Dl=K.relief(N),bowl=Dl.find(d=>d.form==='bowl'),g0=ground(bowl.x,bowl.z);
ok('KRELIEF takes the dolines: a bowl sinks the ground by its depth at its centre',KRELIEF.kinds().join()===kinds0+',doline'&&Math.abs(KRELIEF.shape(bowl,bowl.x,bowl.z,g0)-(g0-bowl.depth))<1e-9&&KRELIEF.shape(bowl,bowl.x+bowl.r+1,bowl.z,g0)===g0,false);
const ce={kind:'doline',form:'cenote',x:0,z:0,r:20,depth:30,floor:50};ok('a cenote drops near sheer to its floor',KRELIEF.shape(ce,0,0,80)===50&&KRELIEF.shape(ce,15,0,80)===50&&KRELIEF.shape(ce,19.5,0,80)>70&&KRELIEF.at(ce,19.5,0,80).part==='wall',false);
ok('a karst recipe for KSTRATA',!hadKarst&&KSTRATA.RECIPES.karst&&KSTRATA.create({recipe:'karst',seed:1}).at(0,10,0).recipe==='karst',false);
ok('a bad box, kind, level or ground throws',throws(()=>K.network({box:[0,0,0,0],ground,level:0}))&&throws(()=>K.network(Object.assign({},o,{kind:'sponge'})))&&throws(()=>K.network(Object.assign({},o,{level:null})))&&throws(()=>K.network({box,level:0})),throws(()=>K.network(o)));
// ---- the old kinds are byte-identical to the module before 'hypogene' (2026-11-03): network, water, hazards, relief and build
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16);};
const dig=c=>{const D=K.network(c),Cd=KCAVERN.create({ground,cell:2,chunk:16,seed:4});return fnv(JSON.stringify([D,K.water(D),K.hazards(D),K.relief(D),K.build(Cd,D)]));};
const old={branch:dig(o),branchHigh:dig(Object.assign({},o,{table:52})),maze:dig(Object.assign({},o,{kind:'maze',p:.6,levels:[{y:70,kind:'maze',p:.45}]}))};
ok('branch and maze unchanged by the hypogene kind ('+JSON.stringify(old)+')',old.branch==='fa943e21'&&old.branchHigh==='84833da7'&&old.maze==='86f39f1f',old.branch==='0');
// ---- 'hypogene': rising hot water, two storeys (the active one at the table, an older one above it at an older table)
const ho={box,ground,world:3,kind:'hypogene',level:0,table:4,temp:52,levels:[{y:22}],joints:{angle:.3,sp:40},feeders:{cell:250,p:.7,depth:150},chamber:{r:[15,40],h:[6,14]}};
const H=K.network(ho),HM={};H.nodes.forEach(n=>HM[n.id]=n);
ok('a hypogene cave: feeders, chambers, two storeys ('+H.feeders.length+' feeders, '+H.chambers.length+' chambers, '+H.passages.length+' passages)',H.kind==='hypogene'&&H.feeders.length>0&&H.chambers.length>H.feeders.length&&H.storeys.length===2&&H.passages.some(p=>p.level===1),H.passages.length===0);
ok('the same box and world, the same cave; another world, another',JSON.stringify(K.network(ho))===JSON.stringify(H)&&JSON.stringify(K.network(Object.assign({},ho,{world:4})))!==JSON.stringify(H),false);
ok('no sinks and no dolines: the water comes from below',H.sinks.length===0&&H.dolines.length===0&&H.shafts.every(s=>s.kind!=='sink'),H.sinks.length>0);
ok('every feeder rises from depth to a storey-0 node, through a feeder shaft',H.feeders.every(f=>{const S=H.shafts.find(s=>s.feeder===f.id&&s.kind==='feeder');return S&&S.y0===f.y0&&f.y0<ho.level-100&&S.y1>ho.level-1;}),false);
ok('feeders climbing on are joined storey to storey by shafts',H.feeders.filter(f=>f.top>=1).every(f=>H.shafts.some(s=>s.feeder===f.id&&s.kind==='level'&&s.y1>s.y0+15))&&H.feeders.some(f=>f.top>=1),false);
ok('the passages are level (no gradient: dissolved sideways at the table)',H.passages.every(p=>p.id.indexOf('outlet')>=0||Math.abs(HM[p.a].y-HM[p.b].y)<1.3),H.passages.every(p=>Math.abs(HM[p.a].y-HM[p.b].y)<1e-9));
const ch0=H.chambers.filter(c=>c.storey===0),big=ch0.filter(c=>c.feeder),small=H.chambers.filter(c=>!c.feeder);
ok('the big chambers stand over the feeders, wider than the others ('+big.length+' over feeders)',big.length>0&&small.every(c=>c.rx<=27.5+1e-9)&&big.every(c=>c.rx>=27.5-1e-9),big.length===0);
ok('the active storey\'s chambers stand in the hot water, the old storey\'s are dry',ch0.every(c=>c.flooded===c.c[1]<4)&&ch0.some(c=>c.flooded)&&H.chambers.filter(c=>c.storey===1).every(c=>!c.flooded),false);
const hadj={};H.passages.forEach(p=>{(hadj[p.a]=hadj[p.a]||[]).push(p.b);(hadj[p.b]=hadj[p.b]||[]).push(p.a);});
const hs={},hq=H.chambers.filter(c=>c.feeder).map(c=>c.node);hq.forEach(id=>hs[id]=1);while(hq.length){const c=hq.shift();(hadj[c]||[]).forEach(m=>{if(!hs[m]){hs[m]=1;hq.push(m);}});}
ok('every node is reached from a feeder (the spring by its conduit if need be)',H.nodes.every(n=>hs[n.id]),false);
ok('cupolas rise from the chambers\' crowns',H.cupolas.length>0&&H.cupolas.every(u=>{const c=H.chambers.find(x=>x.id===u.chamber);return u.c[1]>c.c[1]+c.h*.8&&u.r>0&&u.h>0;}),false);
ok('gypsum crust on the active storey, replacement and blocks on the old one, each for KSPELEO\'s HYPOGENE dress',
  H.crusts.length>0&&H.crusts.every(c=>c.speleo==='HYPOGENE'&&c.y1>c.y0&&c.kind===(H.chambers.find(x=>x.id===c.on).storey===0?'gypsum':'replacement'))&&H.crusts.some(c=>c.kind==='replacement')&&
  H.blocks.length>0&&H.blocks.every(b=>H.chambers.find(x=>x.id===b.on).storey===1)&&H.chambers.every(c=>c.dress.speleo==='HYPOGENE'),false);
ok('the crust band sits round the table it formed at',H.crusts.filter(c=>c.kind==='gypsum').every(c=>c.y0>=4-1-1e-9&&c.y1<=4+6+1e-9)&&H.crusts.filter(c=>c.kind==='replacement').every(c=>c.y0>=24-1-1e-9),false);
ok('the outlets: a warm spring (and vents where a cupola broke the surface)',H.outlets[0].kind==='spring'&&H.outlets[0].temp===52&&H.spring.sulphur&&H.outlets.slice(1).every(v=>v.kind==='vent'&&ground(v.x,v.z)-v.y<10),false);
const HW=K.water(H),HZ=K.hazards(H),hk=k=>HZ.filter(h=>h.tags.hazard.kind===k);
ok('water: hot sulphurous pools in the flooded chambers, the spring and the vents',HW.pools.length>0&&HW.pools.every(p=>p.temp===52&&p.sulphur)&&HW.spring.temp===52&&Array.isArray(HW.vents),HW.pools.length===0);
ok('hazards: scalding pools, pooled bad air over every active chamber, the acid\'s drips ('+['heat','gas','acid','fall','drown'].map(k=>k+' '+hk(k).length).join(', ')+')',
  hk('heat').length===HW.pools.length&&hk('gas').length===ch0.length&&hk('gas').every(h=>h.tags.hazard.shape.pool===2&&h.tags.hazard.effects.length===2)&&hk('acid').length===H.crusts.filter(c=>c.kind==='gypsum').length,hk('gas').length===0);
ok('a shaft is a fall only above the water ('+hk('fall').length+' falls)',hk('fall').length>0&&hk('fall').every(h=>h.at[1]>=4),false);
ok('a cooler cave has no scalding pools',K.hazards(K.network(Object.assign({},ho,{temp:30}))).every(h=>h.tags.hazard.kind!=='heat'),false);
// faults, sponge, build, bad arguments
const fl=[[0,400,800,420]],HF=K.network(Object.assign({},ho,{feeders:{cell:200,p:.9,depth:150,faults:fl}}));
ok('feeders on a fault lie on it',HF.feeders.length>0&&HF.feeders.every(f=>Math.abs(f.z-(400+20*f.x/800))<1e-6),false);
const HS=K.network(Object.assign({},ho,{form:'sponge',levels:[]})),Hm=K.network(Object.assign({},ho,{levels:[]}));
ok('spongework is denser and narrower than a rising maze ('+HS.passages.length+' / '+Hm.passages.length+' passages)',HS.passages.length>Hm.passages.length*1.5&&Math.max(...HS.passages.map(p=>p.w))<Math.max(...Hm.passages.map(p=>p.w)),false);
const HC=KCAVERN.create({ground,cell:1,chunk:16,seed:4});K.build(HC,H);HC.build();
const bc=big[0],cu=H.cupolas[0];
ok('in KCAVERN a big chamber is open air, and a cupola opens above its crown',HC.sdf(bc.c[0],bc.c[1]+bc.h*.5,bc.c[2])>0&&HC.sdf(cu.c[0],cu.c[1]+cu.h*.5,cu.c[2])>0,!(HC.sdf(bc.c[0],bc.c[1]+bc.h*.5,bc.c[2])>0));
ok('a bad hypogene form or feeder cell throws',throws(()=>K.network(Object.assign({},ho,{form:'vadose'})))&&throws(()=>K.network(Object.assign({},ho,{feeders:{cell:0}}))),throws(()=>K.network(ho)));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
