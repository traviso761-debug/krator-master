// node core/hazard/test-hazard-tunnel.js — the tunnels' kinds (22-core-hazard-tunnel.js): rockburst, inrush, seal, each check
// with a negative (a second condition that must be false: a wrong record, the wrong place, the wrong time).
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'));
const H=globalThis.KHAZ;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
const V=KT.VOCAB;

// ---- a registry of every older kind, read before the tunnel file loads: nothing may move once it has
const T=KT.create({build:'tunnel'});
const vent=T.add({'class':'feature',kind:'vent',name:'A fumarole',at:[-20,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear',cycle:{period:60,warn:5,ramp:2,on:10,after:6}}}});
const sump=T.add({'class':'feature',kind:'sump',name:'A sump',at:[300,-4,0],tags:{hazard:{kind:'drown',shape:{type:'cyl',r:10,h:4}}}});
const fallen=T.add({'class':'feature',kind:'fallen',name:'A fallen stretch',at:[500,0,0],tags:{hazard:{kind:'crush',shape:{type:'box',w:40,d:30,h:14}}}});
const P=[[-18,0,2],[300,0,-3],[500,0,1],[0,0,0]],ts=[0,4,20,50];
const snap=()=>JSON.stringify(P.map(([x,z,y])=>ts.map(t=>{const q=H.here(x,y,z,t,T);return [H.at(x,z,t,y,T).map(e=>[e.id,+e.dose.toFixed(9),e.state.state]),q.doses,H.zones(T)];})));
const before=snap(),kinds0=Object.keys(V.hazardKinds).join();
eval(fs.readFileSync(path.join(__dirname,'22-core-hazard-tunnel.js'),'utf8'));
ok('every older record answers exactly as before once the file is loaded',snap()===before,snap()!==before);

/* loaded BEFORE core/tags (a build sorts 22 before 50): the rows arrive at first use, not at load */
{const vm=require('vm'),ctx={console};ctx.globalThis=ctx;vm.createContext(ctx);
 const run=f=>vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 run(C('rand/08-core-rand.js'));run(C('biome/37-core-traps.js'));run(path.join(__dirname,'20-core-hazard.js'));run(path.join(__dirname,'22-core-hazard-tunnel.js'));
 const noTags=!ctx.KTAGS;run(C('tags/50-core-tags.js'));run(C('tags/52-core-tags-vocab.js'));
 const absent=!ctx.KTAGS.VOCAB.hazardKinds.seal;let filled=null;try{filled=ctx.KHAZ.make({kind:'seal'});}catch(e){}
 ok('loaded before core/tags: no rows at load, the rows at the first call',noTags&&absent&&filled&&filled.effect==='suffocate',!absent);}

// ---- rockburst: the deep stretch, a 400 m box along x (ten 40 m cells), one burst a period
const deep=T.add({'class':'feature',kind:'deep',name:'The deep stretch',at:[0,0,1000],tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:400,d:32,h:14},
  cycle:{period:600,warn:10,ramp:.4,on:1.6,after:30,afterK:.25,offset:0}})}});
ok('the rows: rockburst, inrush, seal in VOCAB.hazardKinds, the older kinds kept in order',V.hazardKinds.rockburst&&V.hazardKinds.inrush&&V.hazardKinds.seal&&H.of(deep).kind==='rockburst'&&Object.keys(V.hazardKinds).join().indexOf(kinds0)===0,!V.hazardKinds.rockburst);
const B=H.burstAt(deep,10.5);
ok('burstAt: period 0, a cell of ten, its middle in the box ('+B.cell+' at '+B.x.toFixed(1)+')',B.n===0&&B.cells===10&&B.cell>=0&&B.cell<10&&Math.abs(B.x-(-200+(B.cell+.5)*40))<1e-9&&B.z===1000,B.cells!==10);
ok('the burst starts after the rock talk (t0 = warn)',Math.abs(B.t0-10)<1e-9,B.t0===0);
const inCell=H.state(deep,11,null,B.x,1000),far=H.state(deep,11,null,B.x+((B.cell<5)?200:-200),1000);
ok('at the burst (t 11 s) a point in its cell is hit (k 1), one 200 m down the stretch is not',inCell.k===1&&inCell.state==='on'&&far.k===0&&far.state==='far',far.k>0);
const talk=H.state(deep,5,null,B.x,1000);
ok('the rock talk warns everyone and harms no one',talk.warn===true&&talk.k===0,talk.k>0);
const aft=H.state(deep,20,null,B.x,1000),quiet=H.state(deep,300,null,B.x,1000);
ok('falling slabs after (k .25), then quiet',Math.abs(aft.k-.25)<1e-9&&aft.state==='after'&&quiet.k===0&&quiet.state==='idle',quiet.k>0);
ok('dose at the burst = the row\'s 20, damage; none in the quiet',Math.abs(H.dose(deep,B.x,1000,11,1)-20)<1e-9&&H.doses(deep,B.x,1000,11,1).damage>0&&H.dose(deep,B.x,1000,300,1)===0,H.dose(deep,B.x,1000,300,1)>0);
const throwE=H.state(deep,11,null,-200+B.cell*40-5,1000),throwF=H.state(deep,11,null,-200+B.cell*40-7,1000);
ok('it throws 6 m past its cell along the stretch, not 7',B.cell===0||(throwE.k===1&&throwF.k===0),B.cell>0&&throwF.k>0);
const cells=new Set();for(let n=0;n<40;n++)cells.add(H.burstAt(deep,n*600+11).cell);
ok('the bursts wander the stretch ('+cells.size+' cells in 40 periods), fixed by the period, not by when one asks',cells.size>=6&&H.burstAt(deep,611).cell===H.burstAt(deep,1199).cell,cells.size<3);
const S=H.spalls(deep,600*5+20,4);
ok('spalls: the last four bursts, newest first, each where its period burst',S.length===4&&S[0].n===5&&S[3].n===2&&S.every(s=>s.cell===H.burstAt(deep,s.n*600+11).cell&&s.spall>=.05&&s.spall<=.4&&Math.abs(s.side)===1),S.length!==4);
ok('a burst not yet begun is not a spall',H.spalls(deep,600*5+5,1)[0].n===4,H.spalls(deep,600*5+5,1)[0].n===5);
const deepT=deep.tags.hazard;ok('the same record on the default 30-minute clock is valid and the walker is safe most of the time',
  (()=>{const R=T.add({'class':'feature',kind:'deep',name:'Deep 2',at:[0,0,2000],tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:400,d:32,h:14}})}});let on=0;for(let t=0;t<1800;t+=1)if(H.state(R,t).k>0)on++;return on>20&&on<60;})(),false);
ok('a bad burst throws when read (cell 0, a spall range upside down)',throws(()=>H.burstAt(T.add({'class':'feature',kind:'x',name:'x',at:[0,0,3000],tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:40,d:10,h:5},burst:{cell:0}})}}),1))&&
  throws(()=>H.spalls(T.add({'class':'feature',kind:'x',name:'y',at:[0,0,3100],tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:40,d:10,h:5},burst:{spall:[.4,.1]}})}}),1)),false);
const turned=T.add({'class':'feature',kind:'deep',name:'Turned',at:[0,0,4000],ry:Math.PI/2,tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:400,d:32,h:14},cycle:{period:600,warn:10,ramp:.4,on:1.6,after:30,offset:0}})}});
const BT=H.burstAt(turned,11);
ok('a turned stretch bursts along its own axis (ry 90 degrees: along z)',Math.abs(BT.x)<1e-2&&Math.abs(BT.z-4000)<=200&&H.state(turned,11,null,BT.x,BT.z).k===1,Math.abs(BT.z-4000)<1e-6&&BT.cell!==4&&BT.cell!==5);

// ---- inrush: a low stretch, its floor at y -6, 3 m of water at the full
const low=T.add({'class':'feature',kind:'low',name:'The low point',at:[0,-6,5000],tags:{hazard:H.TUNNEL.inrush({shape:{type:'box',w:120,d:32,h:8},
  cycle:{period:3600,warn:60,ramp:200,on:600,after:400,afterK:.15,offset:0}})}});
const F0=H.flood(low,30),F1=H.flood(low,160),F2=H.flood(low,400),F3=H.flood(low,1200),F4=H.flood(low,3000);
ok('the rock sweats first (warn, dry), then the water rises over 200 s to 3 m and stays',F0.state==='warn'&&F0.level===0&&F1.state==='rising'&&Math.abs(F1.level-1.5)<1e-9&&F2.state==='on'&&Math.abs(F2.level-3)<1e-9&&Math.abs(F2.y+3)<1e-9,F0.level>0);
ok('it leaves a pool (.45 m) and then dries',F3.state==='after'&&Math.abs(F3.level-.45)<1e-9&&F4.level===0&&F4.k===0,F4.level>0);
ok('at the full, a walker on the floor drowns (k 1); one on a ledge 2.5 m up has .5 m over their feet (k .36)',Math.abs(H.at(0,5000,400,-6,T)[0].state.k-1)<1e-9&&
  Math.abs(H.at(0,5000,400,-3.5,T)[0].state.k-.5/1.4)<1e-9,H.at(0,5000,400,-3.5,T)[0].state.k>=1);
ok('one standing over the water is not in it at all (no hit)',!H.at(0,5000,400,-2.5,T).some(e=>e.id===low.id),H.at(0,5000,400,-2.5,T).some(e=>e.id===low.id&&e.state.k>0));
ok('the dose follows the water over the feet (dose, doses, here agree)',Math.abs(H.dose(low,0,5000,400,-3.5)-.5*.5/1.4)<1e-9&&Math.abs(H.doses(low,0,5000,400,-3.5).drown-.5*.5/1.4)<1e-9&&
  Math.abs(H.here(0,-3.5,5000,400,T).doses.drown-.5*.5/1.4)<1e-9,H.dose(low,0,5000,400,-3.5)===.5);
ok('no y (a plan view): the level over the floor',Math.abs(H.at(0,5000,160,null,T)[0].state.k-1)<1e-9&&H.dose(low,0,5000,30)===0,H.dose(low,0,5000,30)>0);
const once=T.add({'class':'feature',kind:'karst',name:'G3',at:[0,-6,6000],tags:{hazard:H.TUNNEL.inrush({shape:{type:'box',w:80,d:32,h:8},inrush:{depth:4,deep:1.4,at:1000}})}});
ok('once (inrush.at): dry, the warn, rising, flooded for good',H.flood(once,0).state==='dry'&&H.flood(once,950).state==='warn'&&H.flood(once,1120).state==='rising'&&H.flood(once,1e7).state==='flooded'&&H.flood(once,1e7).level===4,H.flood(once,1e7).level<4);
ok('a bad inrush throws (depth 0)',throws(()=>H.flood(T.add({'class':'feature',kind:'x',name:'z',at:[0,0,7000],tags:{hazard:H.TUNNEL.inrush({shape:{type:'box',w:8,d:8,h:4},inrush:{depth:0}})}}),1)),false);

// ---- seal: a ghost station's section behind a door to the near-airless crest
const ghost=T.add({'class':'feature',kind:'section',name:'The ghost station',at:[0,0,8000],tags:{hazard:H.TUNNEL.seal({shape:{type:'box',w:200,d:32,h:14},seal:{door:'ghost.door',inside:1,outside:.05,bleed:40,refill:900}})}});
ok('sealed: the section holds its air (1 atm, k 0)',H.pressure(ghost,100)===1&&H.state(ghost,100).k===0&&H.state(ghost,100).state==='sealed',H.state(ghost,100).k>0);
H.breach(ghost,100);
const p1=H.pressure(ghost,140),p2=H.pressure(ghost,300);
ok('breached at 100 s: one bleed later the air is .05 + .95/e ('+p1.toFixed(3)+'), and it goes on falling',Math.abs(p1-(.05+.95*Math.exp(-1)))<1e-9&&p2<p1&&H.state(ghost,140).state==='breached',p2>=p1);
ok('below .6 atm it starts to harm: k is the thin-air ramp',H.state(ghost,100).k===0&&Math.abs(H.state(ghost,200).k-(.6-H.pressure(ghost,200))/.54)<1e-9&&H.state(ghost,300).k===1,H.state(ghost,200).k===0);
H.reseal(ghost,400);
const pr=H.pressure(ghost,400),pr2=H.pressure(ghost,1300);
ok('resealed at 400 s it refills over 900 s (one refill: '+pr2.toFixed(3)+')',Math.abs(pr2-(1+(pr-1)*Math.exp(-1)))<1e-9&&H.state(ghost,1300).state==='refilling'&&H.state(ghost,1e6).k===0,pr2<=pr);
const door=T.add({'class':'feature',kind:'section',name:'Bound',at:[0,0,9000],tags:{hazard:H.TUNNEL.seal({shape:{type:'box',w:50,d:32,h:14}})}});
let open=0;H.bindDoor(door,()=>open);
H.sealStep(0,10,T);const b0=H.pressure(door,10);open=1;for(let i=0;i<40;i++)H.sealStep(10+i,1,T);const b1=H.pressure(door,50);
ok('a bound door (core/door\'s live leaf) integrates live: shut holds, open 40 s bleeds',b0===1&&Math.abs(b1-(.05+.95*Math.exp(-1)))<1e-9,b1===1);
const fail=T.add({'class':'feature',kind:'section',name:'Leaky hot door',at:[0,0,10000],tags:{hazard:H.TUNNEL.seal({shape:{type:'box',w:50,d:32,h:14},
  seal:{outside:.02,bleed:20,refill:600,fail:{period:3600,warn:30,ramp:10,on:300,after:0,offset:0}}})}});
const q0=H.state(fail,20),q1=H.state(fail,300),q2=H.state(fail,3500);
ok('a fail cycle: the warn hisses, failed open 300 s drains it (k '+q1.k.toFixed(2)+'), by the period\'s end it is back',q0.warn===true&&q1.state==='failed'&&q1.k>.9&&q2.k===0&&q2.pressure>.95,q2.k>0);
ok('the fail cycle is periodic: the same state a period later',Math.abs(H.pressure(fail,300)-H.pressure(fail,3900))<1e-9,false);
ok('a bad seal throws (outside over inside)',throws(()=>H.pressure(T.add({'class':'feature',kind:'x',name:'w',at:[0,0,11000],tags:{hazard:H.TUNNEL.seal({shape:{type:'box',w:8,d:8,h:4},seal:{inside:1,outside:1.2}})}}),1)),false);

// ---- the audit, the export
const T2=KT.create({build:'tunnel2'});
T2.add({'class':'feature',kind:'deep',name:'Good',at:[0,0,0],tags:{hazard:H.TUNNEL.rockburst({shape:{type:'box',w:80,d:32,h:14}})}});
T2.add({'class':'feature',kind:'deep',name:'Raw',at:[0,0,100],tags:{hazard:{kind:'rockburst',shape:{type:'box',w:80,d:32,h:14}}}});
T2.add({'class':'feature',kind:'low',name:'Bad',at:[0,0,200],tags:{hazard:H.TUNNEL.inrush({shape:{type:'box',w:8,d:8,h:4},inrush:{deep:-1}})}});
const A=H.tunnelAudit(T2);
ok('the audit names a raw record without its state function and a bad field, not the good one',A.length===2&&A[0].why.indexOf('no state function')>=0&&/deep/.test(A[1].why),A.some(a=>a.id===T2.query({}).find(r=>r.name==='Good').id));
const X=H.export(T);
const xr=X.records.find(r=>r.id===deep.id),xv=X.records.find(r=>r.id===vent.id);
ok('the export carries the rows and each tunnel record\'s raw fields; an older record gains nothing',X.kinds.rockburst&&xr.hazard.raw&&xr.hazard.raw.burst.cell===40&&!('raw' in xv.hazard),'raw' in xv.hazard);
ok('make() refuses nothing new: an unknown kind still throws',throws(()=>H.make({kind:'quake'}))&&!throws(()=>H.make({kind:'seal'})),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
