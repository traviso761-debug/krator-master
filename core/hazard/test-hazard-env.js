// node core/hazard/test-hazard-env.js — crusts that break, air that pools at night, fronts that travel
// (22-core-hazard-env.js), each check with a negative; on 20 + 22 and again on 20 + 21 + 22.
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
require(C('clock/20-core-clock.js'));
const SRC={20:fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'),21:fs.readFileSync(path.join(__dirname,'21-core-hazard-flow.js'),'utf8'),
  22:fs.readFileSync(path.join(__dirname,'22-core-hazard-env.js'),'utf8')};
const load=n=>{eval(SRC[n]);return globalThis.KHAZ;};
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=(f,re)=>{try{f();return false;}catch(e){return re?re.test(e.message):true;}};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-9:e);

// ---- loading: 20 first, or a clear error
{const keep=globalThis.KHAZ;delete globalThis.KHAZ;
  ok('without 20 loaded it throws, naming 20',throws(()=>eval(SRC[22]),/20-core-hazard\.js/),false);globalThis.KHAZ=keep;}

// ---- the same registry before and after 22 loads: nothing without the new fields may move
function baseRegistry(tag){const T=KT.create({build:'env-base-'+tag});
  T.add({'class':'feature',kind:'vent',name:'A fumarole',at:[-20,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear',cycle:{period:60,warn:5,ramp:2,on:10,after:6}}}});
  T.add({'class':'feature',kind:'mud',name:'Mud',at:[40,0,0],r:6,h:2,tags:{hazard:{kind:'sink',move:{speed:.4,sink:.05}}}});
  T.add({'class':'feature',kind:'sump',name:'A sump',at:[0,2,60],tags:{hazard:{kind:'gas',danger:1,dose:2,falloff:'none',shape:{type:'cyl',r:10,h:4,pool:2}}}});
  T.add({'class':'feature',kind:'lake',name:'Lava',at:[0,0,-40],r:6,h:2,tags:{hazard:{kind:'lava',shape:{type:'cyl',r:6,h:4,y0:-1},cycle:{period:300,warn:10,ramp:5,on:20,after:30,afterK:.85,base:.7}}}});
  T.add({'class':'feature',kind:'plate',name:'A plate',at:[20,0,20],r:1,h:1,tags:{hazard:{kind:'trap'}}});
  T.add({'class':'feature',kind:'field',name:'Slow',at:[-40,0,40],r:5,h:4,tags:{hazard:{kind:'time',time:{scale:.01}}}});
  return T;}
const P=[[-20,0,1],[-18,0,2],[40,1,0],[0,60,2.2],[0,60,3],[0,-40,0],[5,-40,1],[13,-40,1],[20,20,0],[-40,40,1]],TS=[0,4,20,50,70,140];
function snap(H,T){const E=H.exposure(T);return JSON.stringify([P.map(([x,z,y])=>TS.map(t=>{const a=H.at(x,z,t,y,T).map(e=>[e.id,e.dose,e.state.state,e.state.k]),q=H.here(x,y,z,t,T);
    return [a,Object.keys(q.doses).sort().map(k=>[k,q.doses[k]]),q.time,H.timeScale(x,z,t,y,T),H.at(x,z,t,undefined,T).map(e=>e.dose),E.step(x,z,t,.5,y).map(e=>e.dose)];})),
  H.list(T).map(r=>[H.state(r,33),H.state(r,33,null,r.at[0],r.at[2]),H.dose(r,r.at[0],r.at[2],33,r.at[1]+.5),H.doses(r,r.at[0],r.at[2],33),JSON.stringify(H.of(r))]),
  H.export(T),H.zones(T)]);}

// ---- every check of the new behaviour, run on a KHAZ (20 + 22, or 20 + 21 + 22)
function run(H,tag,flow){
  console.log('-- '+tag);
  const T=KT.create({build:'env-'+tag}),TB=KT.create({build:'env-bad-'+tag});  /* TB: records that must throw, kept out of T's export */

  // 1. the crust
  const B=H.ENV.crust(4,{mass:60,below:'heat',under:{danger:.9,dose:3}});
  const crust=T.add({'class':'feature',kind:'crust',name:'Sinter',at:[0,0,0],r:4,h:1,tags:{hazard:B.crust}});
  B.below.under.crust=crust.id;
  const water=T.add({'class':'feature',kind:'spring',name:'Boiling water',at:[0,0,0],r:4,h:1,tags:{hazard:B.below}});
  const s0=H.state(crust,10);
  ok('an intact crust is harmless (k 0, its tell shows) and its water does nothing',s0.state==='intact'&&s0.k===0&&s0.warn===true&&H.dose(water,0,0,10,0)===0&&H.state(water,10).state==='held'&&H.dose(crust,0,0,10,0)===0,H.dose(water,0,0,10,0)>0);
  const lt=H.load(crust,59.9,20);
  ok('a load under its mass does not break it',lt===false&&H.state(crust,21).state==='intact',lt===true);
  const l60=H.load(crust,60,20);
  ok('a load of its mass breaks it (true), at that t',l60===true&&H.state(crust,20).state==='broken'&&H.state(crust,19).state==='intact',l60!==true);
  ok('a broken crust stays broken (heal null) and a second load is not a break',H.state(crust,1e6).state==='broken'&&H.state(crust,1e6).k===1&&H.load(crust,500,30)===false&&H.state(crust,1e6).left===undefined,H.state(crust,1e6).state!=='broken');
  const ws=H.state(water,25);
  ok('the harm below follows its crust: its own state (steady), its full dose, crust broken',ws.state==='steady'&&ws.k===1&&ws.crust==='broken'&&near(H.dose(water,0,0,25,0),3)&&H.at(0,0,25,0,T)[0].id===water.id,H.dose(water,0,0,25,0)===0);
  ok('KHAZ.here sums the water once it is through',near(H.here(0,0,0,25,T).doses.burn,3),false);
  /* a healing crust over a mud pot whose own cycle runs under it */
  const B2=H.ENV.crust([[-3,-3],[3,-3],[3,3],[-3,3]],{mass:80,heal:100,below:'sink',under:{cycle:{period:20,on:10,offset:0}}});
  const c2=T.add({'class':'feature',kind:'crust',name:'Opal crust',at:[50,0,0],r:3,h:1,tags:{hazard:B2.crust}});B2.below.under.crust=c2.id;
  const m2=T.add({'class':'feature',kind:'pot',name:'Mud pot',at:[50,0,0],r:3,h:1,tags:{hazard:B2.below}});
  ok('KHAZ.trip with the mass breaks it, as load does; without a mass on a weight trigger it throws',throws(()=>H.trip(c2,0),/mass/)&&H.trip(c2,0,70)===false&&H.trip(c2,0,80)===true,H.trip(c2,0,80)===true);
  const h50=H.state(c2,50);
  ok('it heals after heal s (left counts down), then holds again and can break again',h50.state==='broken'&&near(h50.left,50)&&H.state(c2,100).state==='intact'&&H.state(m2,100).state==='held'&&H.load(c2,80,150)===true&&H.state(c2,151).state==='broken',H.state(c2,100).state==='broken');
  ok('the harm below runs its own cycle once through (on, then idle)',H.state(m2,162).state==='on'&&H.state(m2,162).k===1&&H.state(m2,175).k===0&&H.state(m2,175).crust==='broken',H.state(m2,175).k===1);
  /* a trap (no crust): trip as before */
  const plate=T.add({'class':'feature',kind:'plate',name:'Plate',at:[90,0,0],r:1,h:1,tags:{hazard:{kind:'trap'}}});
  ok('trip on a record without a crust is 20\'s trip (true, then resetting; the mass ignored)',H.trip(plate,5,1)===true&&H.state(plate,6).state==='resetting'&&H.trip(plate,7)===false,H.state(plate,6).state!=='resetting');
  // save and load of the broken state
  const S=JSON.parse(JSON.stringify(H.saveCrusts()));
  ok('saveCrusts is plain data by id ({t, heal})',S.format==='krator-hazard-crusts'&&S.broken[crust.id].t===20&&S.broken[crust.id].heal===null&&S.broken[c2.id].heal===100&&Object.keys(S.broken).length===2,!S.broken[crust.id]);
  H.mend(crust);
  ok('mend makes it whole (the water held again)',H.state(crust,50).state==='intact'&&H.dose(water,0,0,50,0)===0,H.state(crust,50).state==='broken');
  H.loadCrusts(S);
  ok('loadCrusts brings the broken crusts back as they were',H.state(crust,50).state==='broken'&&H.state(c2,151).state==='broken'&&near(H.dose(water,0,0,50,0),3),H.state(crust,50).state==='intact');
  ok('loadCrusts refuses a wrong shape, and a bad t',throws(()=>H.loadCrusts({broken:{}}))&&throws(()=>H.loadCrusts({format:'krator-hazard-crusts',version:1,broken:{a:{t:'x'}}})),throws(()=>H.loadCrusts(S)));
  H.rearm(crust);ok('rearm mends a crust too',H.state(crust,50).state==='intact',H.state(crust,50).state==='broken');
  H.mend(c2.id);ok('mend takes an id',H.state(c2,151).state==='intact',false);

  // 2. night
  const G=H.ENV.nightGas(6,{dose:2,danger:1,falloff:'none'});
  const gas=T.add({'class':'feature',kind:'hollow',name:'A CO2 hollow',at:[0,0,200],r:6,h:3,tags:{hazard:G}});
  H.bindClock(null);H.bindWind(null);
  ok('a night record with no hour bound throws, naming KHAZ.bindClock',throws(()=>H.state(gas,0),/bindClock/)&&throws(()=>H.dose(gas,0,200,0,0),/bindClock/),!throws(()=>H.state(gas,0)));
  const clk=KCLOCK.make({hour:2});H.bindClock(clk);
  const kAt=h=>{clk.set(h);return H.state(gas,0,null,0,200).k;};
  ok('at 02:00 it has pooled (k 1, the full dose) and at 12:00 it is clear (k base 0)',kAt(2)===1&&near(H.dose(gas,0,200,0,0),2)&&kAt(12)===0&&H.state(gas,0).state==='clear'&&H.dose(gas,0,200,0,0)===0,kAt(12)>0);
  ok('it builds over the ramp after from (19: 0, 20: .5, 21: 1) and drains after to (7: 1, 8: .5, 9: 0)',kAt(19)===0&&near(kAt(20),.5)&&kAt(21)===1&&kAt(7)===1&&near(kAt(8),.5)&&kAt(9)===0&&kAt(23.9)===1,near(kAt(20),1));
  clk.set(2);H.bindClock(t=>(t/3600)%24);
  ok('a bound fn(t) -> hour gives the hour from t',H.state(gas,2*3600).k===1&&H.state(gas,12*3600).k===0&&H.state(gas,2*3600).hour===2,H.state(gas,12*3600).k===1);
  H.bindClock(clk);
  H.bindWind(5);const wCalm=H.state(gas,0,null,0,200).k;H.bindWind(.5);const wStill=H.state(gas,0,null,0,200).k;
  H.bindWind((x,z)=>z>100?[1.5,2]:[9,0]);const wMid=H.state(gas,0,null,0,200);
  ok('wind: still (.5 m/s) pools fully, past calm (5 m/s) nothing, 2.5 m/s half (a fn(x, z, t) -> [vx, vz], read at the point)',wStill===1&&wCalm===0&&near(wMid.k,.5)&&near(wMid.wind,2.5),wCalm>0);
  H.bindWind(null);
  ok('bindClock and bindWind refuse what is not a clock or a wind',throws(()=>H.bindClock(5))&&throws(()=>H.bindWind(-1))&&throws(()=>H.bindWind('x')),throws(()=>H.bindWind(3)));H.bindWind(null);
  const day=T.add({'class':'feature',kind:'hollow',name:'Base',at:[30,0,200],r:4,h:3,tags:{hazard:H.ENV.nightGas(4,{base:.2,pool:null})}});
  const cyc=T.add({'class':'feature',kind:'vent',name:'Puffs',at:[60,0,200],r:4,h:3,tags:{hazard:H.ENV.nightGas(4,{pool:null,cycle:{period:100,on:50,offset:0}})}});
  clk.set(12);const kb=H.state(day,0).k;clk.set(2);
  ok('base is the k by day; a cycle multiplies (02:00: on 1, off 0)',near(kb,.2)&&H.state(day,0).k===1&&H.state(cyc,10).k===1&&H.state(cyc,70).k===0,!near(kb,.2));
  const CP=H.ENV.coldPool([[-20,-20],[20,-20],[20,20],[-20,20]],{});
  ok('the cold-air pool is a cold record on KHAZ.night with shape.pool',CP.kind==='cold'&&CP.stateFn==='KHAZ.night'&&CP.shape.pool===6&&CP.night.from===18&&!!H.make(CP).night,CP.kind!=='cold');
  if(flow){
    ok('with 21: the night gas kills on its floor at 02:00 and is nothing 1.5 m up',near(H.dose(gas,0,200,0,0),2)&&H.dose(gas,0,200,0,1.5)===0&&H.dose(gas,0,200,0,.75)>0,H.dose(gas,0,200,0,1.5)>0);
    const cold=T.add({'class':'feature',kind:'floor',name:'Valley floor',at:[0,0,300],r:20,h:8,tags:{hazard:CP}});
    clk.set(12);const noon=H.dose(cold,0,300,0,1);clk.set(2);
    ok('with 21: the cold pool at 02:00 on the floor, not by day, not 6 m up',H.dose(cold,0,300,0,1)>0&&noon===0&&H.dose(cold,0,300,0,6.5)===0,noon>0);
  }
  ok('bad night fields throw at first read: an hour past 24, an unknown field, a ramp longer than the day',
    throws(()=>H.state(TB.add({'class':'feature',kind:'x',at:[0,0,900],r:1,h:1,tags:{hazard:{kind:'gas',stateFn:'KHAZ.night',night:{from:25}}}}),0),/night\.from/)&&
    throws(()=>H.state(TB.add({'class':'feature',kind:'x',at:[0,0,901],r:1,h:1,tags:{hazard:{kind:'gas',stateFn:'KHAZ.night',night:{wind:3}}}}),0),/unknown field night\.wind/)&&
    throws(()=>H.make({kind:'gas',stateFn:'KHAZ.night',night:{ramp:20}}),/ramp/),
    throws(()=>H.make(H.ENV.nightGas(3,{}))));

  // 3. the flood: a gorge 200 m long, its bed falling from 10 to 0
  const FL=H.ENV.flood([[0,10,0],[100,5,0],[200,0,0]],{w:5,speed:2,rise:10,hold:20,fall:30,depth:3,period:500});
  const fl=T.add({'class':'feature',kind:'gorge',name:'The gorge',at:FL.at,r:1,h:1,tags:{hazard:FL.hazard}});
  const fa=(x,t)=>H.frontAt(fl,x,0,t);
  ok('the water reaches 20 m down at 10 s and 150 m down at 75 s: downstream floods later',fa(20,15).k>0&&fa(150,15).k===0&&fa(150,80).k>0&&fa(20,9.9).k===0,fa(150,15).k>0);
  ok('at its peak the level is bed + base + depth (20 m: 9 + 0 + 3 = 12)',near(H.floodLevel(fl,20,0,25),12)&&near(fa(20,25).bed,9)&&fa(20,25).k===1&&near(fa(20,25).s,20),!near(H.floodLevel(fl,20,0,25),12));
  ok('it recedes after rise + hold + fall (20 m: dry from 70 s, the level the bed again)',fa(20,69).k>0&&fa(20,71).k===0&&near(H.floodLevel(fl,20,0,71),9)&&H.state(fl,71,null,20,0).state==='dry',fa(20,71).k>0);
  ok('it repeats each period',fa(20,525).k===1&&near(H.floodLevel(fl,20,0,525),12)&&near(fa(150,580).k,fa(150,80).k)&&fa(20,515).k===fa(20,15).k,fa(20,525).k!==1);
  ok('the phases: rising, high, falling',H.state(fl,15,null,20,0).state==='rising'&&H.state(fl,25,null,20,0).state==='high'&&H.state(fl,50,null,20,0).state==='falling',false);
  const dIn=H.dose(fl,20,0,25,10),dAbove=H.dose(fl,20,0,25,12.01),dSkin=H.dose(fl,20,0,25,11.85),dPlan=H.dose(fl,20,0,15);
  ok('a walker in the water takes the full dose, one above its surface nothing, the top .3 m smoothly',near(dIn,.3)&&dAbove===0&&dSkin>0&&dSkin<.3&&near(dPlan,.3*fa(20,15).k),dAbove>0);
  const atA=H.at(20,0,25,12.5,T),atI=H.at(20,0,25,10,T);
  ok('KHAZ.at and KHAZ.here: above the surface its dose is 0 (state above), in it the full dose',atA.length===1&&atA[0].dose===0&&atA[0].state.above===true&&near(atI[0].dose,.3)&&!H.here(20,12.5,0,25,T).doses.drown&&near(H.here(20,10,0,25,T).doses.drown,.3),!!H.here(20,12.5,0,25,T).doses.drown);
  ok('exposure().step, doses and state\'s sixth argument take the height too',H.exposure(T).step(20,0,25,.1,12.5)[0].dose===0&&H.doses(fl,20,0,25,12.5).drown===0&&near(H.doses(fl,20,0,25,10).drown,.3)&&H.state(fl,25,null,20,0,12.5).k===0&&H.state(fl,25,null,20,0,10).k===1,H.state(fl,25,null,20,0,12.5).k>0);
  ok('off the path (q > w) nothing: k 0, floodLevel null',fa(20,25).inside===true&&H.frontAt(fl,20,6,25).inside===false&&H.frontAt(fl,20,6,25).k===0&&H.floodLevel(fl,20,6,25)===null&&H.dose(fl,20,6,25,10)===0,H.floodLevel(fl,20,6,25)!==null);
  ok('with no point: the worst anywhere on the path now',H.state(fl,25).state==='flooding'&&H.state(fl,25).k===1&&H.state(fl,200).k===0&&H.state(fl,200).state==='dry',H.state(fl,200).k>0);
  const FB=H.ENV.flood([[0,0,400],[100,0,400]],{w:5,speed:2,rise:10,hold:20,fall:30,depth:3,base:1});
  const fb=T.add({'class':'feature',kind:'gorge',name:'Standing water',at:FB.at,r:1,h:1,tags:{hazard:FB.hazard}});
  ok('standing water (base 1): 1 under the base level when the flood is not there, nothing above it',H.state(fb,500,null,50,400,.2).k===1&&H.state(fb,500,null,50,400,1.5).k===0&&H.state(fb,500,null,50,400).state==='standing'&&near(H.floodLevel(fb,50,400,500),1),H.state(fb,500,null,50,400,.2).k<1);
  ok('the flood\'s band holds the water\'s height (in 20\'s shape test) and the export carries the front',(()=>{const X=H.export(T).records.find(r=>r.id===fl.id);return X&&X.hazard.front.path.length===3&&X.hazard.front.depth===3&&X.hazard.front.period===500&&X.shape.y1>=12;})(),false);

  // the charge: a band 30 m long at 10 m/s down a 300 m run, every 100 s
  const ST=H.ENV.stampede([[0,0,100],[300,0,100]],{fauna:'twosnout',speed:10,len:30,edge:2,period:100,w:6});
  const st=T.add({'class':'feature',kind:'run',name:'The run',at:ST.at,r:1,h:1,tags:{hazard:ST.hazard}});
  let passes=0,prev=0,covered=true,onAt=[];
  for(let t=0;t<200;t+=.25){const k=H.frontAt(st,150,100,t).k;if(k>0&&prev===0){passes++;onAt.push(t);}prev=k;
    const u=t%100,head=10*u;if(k>0&&!(150>=head-30-2&&150<=head+2))covered=false;}
  ok('the band passes a point once a period ('+passes+' in 2), only while it covers it',passes===2&&covered&&onAt[1]-onAt[0]===100,passes!==2);
  ok('its middle is k 1; before it comes (left = the s to the head / speed) and after it passed, 0',H.frontAt(st,150,100,16.5).k===1&&H.state(st,10,null,150,100).state==='coming'&&near(H.state(st,10,null,150,100).left,5)&&H.state(st,25,null,150,100).state==='passed'&&H.state(st,16.5,null,150,100).state==='charging',H.frontAt(st,150,100,25).k>0);
  ok('a charge is dangerous: its dose in the band, nothing out of it; no level',near(H.dose(st,150,100,16.5,0),10)&&H.dose(st,150,100,25,0)===0&&throws(()=>H.floodLevel(st,150,100,16.5),/charge/),H.dose(st,150,100,25,0)>0);
  H.bindHerd(st,t=>[{x:50,z:100,r:5}]);
  ok('bindHerd replaces the law: inside a disc k 1 whenever, the band\'s place nothing',H.frontAt(st,50,100,0).k===1&&H.frontAt(st,50,100,0).herd===true&&H.frontAt(st,150,100,16.5).k===0&&H.state(st,16.5).state==='charging'&&near(H.dose(st,52,100,0,0),10),H.frontAt(st,150,100,16.5).k>0);
  H.bindHerd(st,()=>[]);ok('a herd with no animals: quiet',H.state(st,16.5).state==='quiet'&&H.state(st,16.5).k===0,false);
  H.bindHerd(st,null);ok('unbound, the law is back',H.frontAt(st,150,100,16.5).k===1&&H.frontAt(st,50,100,0).k===0,false);
  ok('bindHerd refuses a flood and a herd that is not discs',throws(()=>H.bindHerd(fl,()=>[]),/flood/)&&(H.bindHerd(st,()=>[{x:1}]),throws(()=>H.frontAt(st,0,100,0),/disc/)),false);H.bindHerd(st,null);
  const RD=H.ENV.rockDrop(3,{fauna:['twosnout']});
  ok('rockDrop: a crush on a near trigger, bound to the dropper\'s fauna',RD.kind==='crush'&&RD.trigger.by==='near'&&RD.charge.fauna[0]==='twosnout'&&H.make(RD).charge.fauna.length===1&&!RD.front,RD.trigger.by!=='near');
  const rd=T.add({'class':'feature',kind:'ledge',name:'Under the ledge',at:[0,0,600],r:3,h:4,tags:{hazard:RD}});
  ok('a rock drop trips as a trap does (true, then resetting)',H.trip(rd,1)===true&&H.state(rd,2).state==='resetting',false);

  // builders and validation
  const bodies=[B.crust,B.below,G,CP,FL.hazard,ST.hazard,RD,B2.crust,B2.below];
  ok('every builder gives a valid KHAZ.make record that carries its field',bodies.every(b=>!throws(()=>H.make(b)))&&H.make(FL.hazard).front.depth===3&&H.make(B.crust).crust.mass===60&&H.make(B.below).under.crust===crust.id&&H.make(ST.hazard).front.len===30,false);
  ok('KHAZ.of carries the fields too; a record without them is unchanged',H.of(fl).front.w===5&&H.of(crust).crust.heal===null&&H.of(plate).front===undefined&&H.of(plate).crust===undefined,false);
  const X=H.export(T),xr=id=>X.records.find(r=>r.id===id);
  ok('the export carries crust, under, night, front and charge',xr(crust.id).hazard.crust.mass===60&&xr(water.id).hazard.under.crust===crust.id&&xr(gas.id).hazard.night.from===19&&xr(st.id).hazard.charge.fauna[0]==='twosnout'&&xr(st.id).hazard.front.len===30&&xr(plate.id).hazard.crust===undefined,false);
  const mk=h=>()=>H.make(h);
  ok('invalid fields throw: a one-point path, an unknown front field, a flood with a len, a flood with no depth',
    throws(mk({kind:'drown',stateFn:'KHAZ.front',front:{path:[[0,0,0]],w:1,speed:1,depth:1,rise:1}}),/path/)&&
    throws(mk({kind:'drown',stateFn:'KHAZ.front',front:{path:[[0,0,0],[1,0,0]],w:1,speed:1,depth:1,rise:1,level:2}}),/unknown field front\.level/)&&
    throws(mk({kind:'drown',stateFn:'KHAZ.front',front:{path:[[0,0,0],[1,0,0]],w:1,speed:1,depth:1,rise:1,len:5}}),/charge/)&&
    throws(mk({kind:'drown',stateFn:'KHAZ.front',front:{path:[[0,0,0],[1,0,0]],w:1,speed:1,rise:1}}),/depth/),
    throws(mk(FL.hazard)));
  ok('and: a crust of mass 0, an unknown crust field, a weight trigger that disagrees, a field without its stateFn, a stateFn without its field',
    throws(mk({kind:'fall',stateFn:'KHAZ.crust',crust:{mass:0}}),/crust\.mass/)&&throws(mk({kind:'fall',stateFn:'KHAZ.crust',crust:{thick:1}}),/unknown field crust\.thick/)&&
    throws(mk({kind:'fall',stateFn:'KHAZ.crust',crust:{mass:60},trigger:{by:'weight',mass:80}}),/disagree/)&&
    throws(mk({kind:'drown',front:FL.hazard.front}),/needs stateFn/)&&throws(mk({kind:'fall',stateFn:'KHAZ.under'}),/needs its under/)&&
    throws(mk({kind:'crush',charge:{fauna:[3]}}),/charge\.fauna/),
    throws(mk(B.crust)));
  const orphan=TB.add({'class':'feature',kind:'x',at:[0,0,700],r:1,h:1,tags:{hazard:H.ENV.crust(2,{}).below}});
  ok('a below with no crust id throws at first read, naming the record',throws(()=>H.state(orphan,0),new RegExp(orphan.id+'.*under\\.crust')),false);
  /* 20's trips are page state by record id, and ids repeat across registries: clear this run's before the old registry is read again */
  H.rearm(plate);H.rearm(rd);H.bindClock(null);
  return T;
}

// ---- 20 + 22
let H=load(20);
const T1=baseRegistry('a'),b1=snap(H,T1);
H=load(22);
ok('20 + 22: it loads onto KHAZ (KHAZ.ENV) and a registry without the new fields answers bit for bit as before',typeof H.ENV==='object'&&snap(H,T1)===b1,snap(H,T1)!==b1);
run(H,'20 + 22',false);
ok('20 + 22: after all of it, the old registry still answers as before',snap(H,T1)===b1,false);
const dz=H.dose(H.list(T1)[0],-18,0,4,2);load(22);
ok('loading it twice does not wrap twice',H.dose(H.list(T1)[0],-18,0,4,2)===dz&&globalThis.KHAZ===H,false);

// ---- 20 + 21 + 22
H=load(20);load(21);
const T2=baseRegistry('b'),b2=snap(H,T2);
H=load(22);
ok('20 + 21 + 22: a registry without the new fields (the pooled sump too) answers bit for bit as before',H.FLOW===true&&snap(H,T2)===b2,snap(H,T2)!==b2);
run(H,'20 + 21 + 22',true);
ok('20 + 21 + 22: moveAt and drift still answer (wrapped for the height)',typeof H.moveAt==='function'&&H.drift(40,1,0,1,T2).by.length===1,false);

// ---- broken variants of 22: each law's check must fail on its mutant (and pass on the real file)
console.log('-- broken variants');
function probe(src){eval(SRC[20]);eval(src);const K=globalThis.KHAZ,T=KT.create({build:'env-mut'});
  const FL=K.ENV.flood([[0,10,0],[100,5,0],[200,0,0]],{w:5,speed:2,rise:10,hold:20,fall:30,depth:3,period:500}),fl=T.add({'class':'feature',kind:'g',at:FL.at,r:1,h:1,tags:{hazard:FL.hazard}});
  const B=K.ENV.crust(4,{}),c=T.add({'class':'feature',kind:'c',at:[0,0,50],r:4,h:1,tags:{hazard:B.crust}});K.load(c,60,0);
  const g=T.add({'class':'feature',kind:'h',at:[0,0,90],r:4,h:3,tags:{hazard:K.ENV.nightGas(4,{pool:null})}});K.bindClock(()=>20);
  return {downstream:K.frontAt(fl,20,0,15).k>0&&K.frontAt(fl,150,0,15).k===0,above:K.dose(fl,20,0,25,12.5)===0&&K.dose(fl,20,0,25,10)>0,
    stays:K.state(c,1e6).state==='broken',ramp:Math.abs(K.state(g,0).k-.5)<1e-9};}
const mutate=(a,b)=>{if(SRC[22].indexOf(a)<0)throw new Error('the mutant\'s text is gone from 22: '+a);return SRC[22].replace(a,b);};
const real=probe(SRC[22]);
const mFlood=probe(mutate('var v=u-n.s/sp.speed,','var v=u,')),mSurf=probe(mutate('sm(0,SURF,A.level-CUR_Y)','A.k')),
  mWrap=probe(mutate('CUR_Y=y==null?null:y;','CUR_Y=null;')),mHeal=probe(mutate('if(b.heal!=null&&t>=b.t+b.heal)','if(t>=b.t+b.heal)')),mRamp=probe(mutate('if(a<span)return r>0?sm(0,r,a):1;','if(a<span)return 1;'));
ok('the flood law: downstream later on 22, not when v ignores s',real.downstream,mFlood.downstream);
ok('the surface: nothing above the water on 22, not when the height is ignored',real.above,mSurf.above);
ok('the wrapped queries carry the height: not when they drop it',real.above,mWrap.above);
ok('a crust with heal null stays broken: not when heal null heals at once',real.stays,mHeal.stays);
ok('the night ramp is half at 20:00: not when the ramp is a step',real.ramp,mRamp.ramp);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
