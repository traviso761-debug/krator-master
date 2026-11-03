// node core/hazard/test-hazard-flow.js — a hazard's move (the in-breath's pull) and pooled gas (21-core-hazard-flow.js), each
// check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'));
const H=globalThis.KHAZ;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// the same registry read before and after the fragment loads: nothing without the new fields may move
const T=KT.create({build:'flow'});
const vent=T.add({'class':'feature',kind:'vent',name:'A fumarole',at:[-20,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear',cycle:{period:60,warn:5,ramp:2,on:10,after:6}}}});
const mud=T.add({'class':'feature',kind:'mud',name:'Mud',at:[40,0,0],r:6,h:2,tags:{hazard:{kind:'sink',move:{speed:.4,sink:.05}}}});
/* a throat on the in-breath: a grab pulling toward its mouth 3 m down, on a cycle (rising, on, falling) */
const throat=T.add({'class':'feature',kind:'throat',name:'A throat',at:[0,10,0],r:8,h:12,tags:{hazard:{kind:'grab',danger:.7,falloff:'linear',
  shape:{type:'cyl',r:8,h:12,y0:-3},move:{speed:.5,pull:1.2,to:[0,-3,0]},cycle:{period:100,ramp:5,on:40,offset:0}}}});
/* a sump: CO2 two metres deep on the floor at y 2 */
const sump=T.add({'class':'feature',kind:'sump',name:'A sump',at:[0,2,60],tags:{hazard:{kind:'gas',danger:1,dose:2,falloff:'none',shape:{type:'cyl',r:10,h:4,pool:2}}}});
const P=[[-20,0,1],[-18,0,2],[40,1,0],[0,10,3],[0,60,2.2],[0,60,3],[0,60,5],[3,62,2.5]],ts=[0,4,20,50,70];
const snap=()=>P.map(([x,z,y])=>ts.map(t=>{const a=H.at(x,z,t,y,T).map(e=>[e.id,+e.dose.toFixed(9),e.state.state]),q=H.here(x,y,z,t,T);return [a,Object.keys(q.doses).sort().map(k=>[k,+q.doses[k].toFixed(9)])];}));
const before=snap(),dv0=H.dose(vent,-18,0,4,2);
eval(fs.readFileSync(path.join(__dirname,'21-core-hazard-flow.js'),'utf8'));
ok('it loads onto KHAZ and marks it',H.FLOW===true&&typeof H.moveAt==='function'&&typeof H.drift==='function',false);
const after=snap(),strip=s=>JSON.stringify(s.map((p,i)=>i>=4&&i<=7?null:p));
ok('every record without pool or pull answers as before (the vent, the mud, the throat\'s dose)',strip(before)===strip(after)&&H.dose(vent,-18,0,4,2)===dv0,strip(before)!==strip(after));

// ---- the pull
const m=H.moveAt(throat,4,0,20,10);
ok('the in-breath pulls toward the throat\'s mouth ('+m.pull.map(v=>v.toFixed(3))+')',m.pull[0]<0&&m.pull[1]<0&&Math.abs(m.pull[2])<1e-12,m.pull[0]>=0);
const near=H.moveAt(throat,1,0,20,10),core=H.moveAt(throat,0,0,20,7);
ok('it is strongest near the core and gone at the edge (linear falloff)',Math.hypot(...near.pull)>Math.hypot(...m.pull)&&H.moveAt(throat,7.99,0,20,10).k<.01,Math.hypot(...near.pull)<=Math.hypot(...m.pull));
ok('it eases out at the mouth itself (move.still), with no jitter',Math.hypot(...core.pull)<1e-9,false);
const off=H.moveAt(throat,4,0,80,10);
ok('the throat off (its idle) pulls nothing and slows nothing',off&&off.k===0&&off.pull.every(v=>v===0)&&off.speed===1,m.k===0);
ok('the pace is move.speed at the core, 1 at the edge',Math.abs(H.moveAt(throat,0,0,20,10).speed-.5)<1e-9&&H.moveAt(throat,7.99,0,20,10).speed>.99,false);
ok('outside the shape there is no move; a record with no move gives null',H.moveAt(throat,9,0,20,10)===null&&H.moveAt(vent,-20,0,4,1)===null,H.moveAt(throat,4,0,20,10)===null);
const pullTo=T.add({'class':'feature',kind:'x',at:[100,0,0],r:5,h:3,tags:{hazard:{kind:'grab',move:{pull:1}}}}),pd=H.moveAt(pullTo,103,0,0,1);
ok('without move.to it pulls toward the core at the band\'s floor',pd.pull[0]<0&&pd.pull[1]<0,pd.pull[0]>=0);

// ---- drift: every move at a point
const dr=H.drift(4,0,20,10,T),dm=H.drift(40,1,0,1,T);
/* the mud: linear falloff, 1 m from the centre of its 6 m disc: k = 5/6 */
ok('drift sums the pulls and multiplies the paces',dr.by.join()===throat.id&&Math.abs(dr.pull[0]-m.pull[0])<1e-12&&Math.abs(dm.speed-(1-.6*5/6))<1e-9&&Math.abs(dm.sink-.05*5/6)<1e-12,dr.by.length!==1);
ok('nothing moves where no hazard does',H.drift(500,500,0,0,T).by.length===0&&H.drift(500,500,0,0,T).speed===1,false);

// ---- the pool
ok('the sump kills on its floor and is nothing 2 m up',Math.abs(H.dose(sump,0,60,0,2)-2)<1e-9&&H.dose(sump,0,60,0,4)===0&&H.dose(sump,0,60,0,5.5)===0,H.dose(sump,0,60,0,2)<2);
const mid=H.dose(sump,0,60,0,3);ok('half way up it is half ('+mid.toFixed(3)+'), smoothly',Math.abs(mid-1)<1e-9&&H.dose(sump,0,60,0,2.5)>mid,mid===2);
ok('KHAZ.at drops the sump above its pool and scales it in it',H.at(0,60,0,5,T).length===0&&Math.abs(H.at(0,60,0,3,T)[0].dose-1)<1e-9&&H.at(0,60,0,3,T)[0].pool===.5,H.at(0,60,0,2.2,T).length===0);
ok('KHAZ.here sums the pooled dose',Math.abs(H.here(0,3,60,0,T).doses.suffocate-1)<1e-9,H.here(0,3,60,0,T).doses.suffocate===2);
ok('with no y the pool is not applied (a plan view)',Math.abs(H.dose(sump,0,60,0)-2)<1e-9,false);
const E=H.exposure(T);ok('exposure().step takes it too',Math.abs(E.step(0,60,0,.1,3)[0].dose-1)<1e-9,false);
ok('poolK is 1 on a record without a pool',H.poolK(vent,100)===1&&H.poolK(sump,2)===1&&H.poolK(sump,4)===0,H.poolK(sump,4)===1);

// ---- the export carries both, and bad values throw
const X=H.export(T),xt=X.records.find(r=>r.id===throat.id),xs=X.records.find(r=>r.id===sump.id);
ok('the export carries move.pull, move.to and shape.pool for the port',xt.hazard.move.pull===1.2&&xt.hazard.move.to[1]===-3&&xs.hazard.shape.pool===2,false);
const badM=T.add({'class':'feature',kind:'x',at:[200,0,0],r:5,h:3,tags:{hazard:{kind:'grab',move:{pull:-1}}}}),badP=T.add({'class':'feature',kind:'x',at:[300,0,0],r:5,h:3,tags:{hazard:{kind:'gas',shape:{type:'cyl',r:5,h:3,pool:0}}}});
ok('a negative pull, a bad move.to and a pool of 0 throw',throws(()=>H.moveAt(badM,200,0,0,1))&&throws(()=>H.poolK(badP,1))&&throws(()=>H.moveAt(T.add({'class':'feature',kind:'x',at:[400,0,0],r:5,h:3,tags:{hazard:{kind:'grab',move:{pull:1,to:[1,2]}}}}),400,0,0,1)),throws(()=>H.moveAt(throat,4,0,20,10)));
eval(fs.readFileSync(path.join(__dirname,'21-core-hazard-flow.js'),'utf8'));
ok('loading it twice does not wrap twice',Math.abs(H.dose(sump,0,60,0,3)-1)<1e-9,false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
