// node core/hazard/test-hazard-tide.js — macrotidal submergence, drawdown warning & reversing tidal races
// (23-core-hazard-tide.js), each check paired with a negative; run on 20 + 23 and again on 20 + 21 + 22 + 23.
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
require(C('clock/20-core-clock.js'));

const SRC={
  20:fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'),
  21:fs.readFileSync(path.join(__dirname,'21-core-hazard-flow.js'),'utf8'),
  22:fs.readFileSync(path.join(__dirname,'22-core-hazard-env.js'),'utf8'),
  23:fs.readFileSync(path.join(__dirname,'23-core-hazard-tide.js'),'utf8')
};
const load=n=>{eval(SRC[n]);return globalThis.KHAZ;};
let bad=0;
const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=(f,re)=>{try{f();return false;}catch(e){return re?re.test(e.message):true;}};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-9:e);

{const keep=globalThis.KHAZ;delete globalThis.KHAZ;
  ok('without 20 loaded 23 throws, naming 20-core-hazard.js',throws(()=>eval(SRC[23]),/20-core-hazard\.js/),false);
  globalThis.KHAZ=keep;}

function baseRegistry(tag){
  const T=KT.create({build:'tide-base-'+tag});
  T.add({'class':'feature',kind:'vent',name:'Vent',at:[-20,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear'}}});
  T.add({'class':'feature',kind:'mud',name:'Mud',at:[40,0,0],r:6,h:2,tags:{hazard:{kind:'sink',move:{speed:.4,sink:.05}}}});
  return T;}

function snap(H,T){
  return JSON.stringify([
    H.at(-20,0,10,1,T).map(e=>[e.id,e.dose,e.state.k]),
    H.here(40,0.5,0,10,T),
    H.export(T),
    H.zones(T)
  ]);}

function runSuite(H,tag,withFlow){
  console.log('-- '+tag);
  const T=KT.create({build:'tide-'+tag});

  let mode='normal';
  H.bindTide('sound',function(t){
    if(mode==='drawdown')return {y:-7.5,vy:-0.008,vRace:-4.2,drawdown:true};
    if(mode==='surge')return {y:8.2,vy:0.015,vRace:5.4,drawdown:false};
    const w=2*Math.PI/86400;
    const y=5.4*Math.sin(w*t);
    const vy=5.4*w*Math.cos(w*t);
    return {y:y,vy:vy,vRace:4.8*Math.cos(w*t),drawdown:false};
  });

  const bench=T.add({'class':'feature',kind:'slipway',name:'Careening Ghat',at:[0,1.0,0],r:12,h:16,
    tags:{hazard:H.TIDE.bench(12,{basin:'sound',full:1.4,drawdownY:-6.8})}});

  const sEbb=H.state(bench,64800,null,0,0,1.2);
  ok('at low ebb (-5.4 m) a walker on the +1.2 m ghat is dry (k 0, dose 0)',
    sEbb.state==='dry'&&sEbb.k===0&&sEbb.above===true&&H.dose(bench,0,0,64800,1.2)===0,
    H.dose(bench,0,0,64800,1.2)>0);

  const sInc=H.state(bench,2500,null,0,0,1.05);
  ok('rising flood approaching feet sets state incoming with warn true while k is still 0',
    sInc.state==='incoming'&&sInc.warn===true&&sInc.k===0,
    sInc.k>0);

  const sHigh=H.state(bench,21600,null,0,0,1.2);
  ok('at high spring flood (+5.4 m) the +1.2 m ghat is submerged at full dose (k 1)',
    sHigh.state==='submerged'&&sHigh.k===1&&near(H.dose(bench,0,0,21600,1.2),0.6),
    H.dose(bench,0,0,21600,1.2)<0.5);

  mode='surge';
  ok('during +8.2 m Ghost-Surge a walker at +3 m drowns (k 1) while +12 m stays dry (k 0)',
    H.dose(bench,0,0,0,3.0)===0.6&&H.dose(bench,0,0,0,12.0)===0,
    H.dose(bench,0,0,0,12.0)>0);

  mode='drawdown';
  const sDraw=H.state(bench,0,null,0,0,1.2);
  ok('Ghost-Tsunami drawdown (-3.6 m) triggers state drawdown & warn true with k 0',
    sDraw.state==='drawdown'&&sDraw.warn===true&&sDraw.k===0,
    sDraw.warn!==true);
  mode='normal';

  const race=T.add({'class':'feature',kind:'narrows',name:'West Sector Lock Race',at:[100,0,0],
    tags:{hazard:H.TIDE.race({w:30,d:20,h:24},{basin:'sound',axis:[1,0],vMax:4.8,slackV:0.35,falloff:'none'})}});

  const rFlood=H.state(race,0,null,100,0,-2);
  ok('peak flood drives flood-race (k 1, v +4.8 m/s)',
    rFlood.state==='flood-race'&&near(rFlood.k,1)&&near(rFlood.v,4.8),
    rFlood.state!=='flood-race');

  const rSlack=H.state(race,21600,null,100,0,-2);
  ok('slack water opens a safe transit window (state slack, k 0, dose 0)',
    rSlack.state==='slack'&&rSlack.k===0&&H.dose(race,100,0,21600,-2)===0,
    H.dose(race,100,0,21600,-2)>0);

  const rEbb=H.state(race,43200,null,100,0,-2);
  ok('peak ebb reverses to ebb-race (k 1, v -4.8 m/s)',
    rEbb.state==='ebb-race'&&near(rEbb.k,1)&&near(rEbb.v,-4.8),
    rEbb.v>=0);

  ok('walker on +10 m suspension span above race is safe (state above, k 0)',
    H.state(race,0,null,100,0,10).state==='above'&&H.dose(race,100,0,0,10)===0,
    H.dose(race,100,0,0,10)>0);

  if(withFlow){
    const dFlood=H.drift(100,0,0,-2,T),dSlack=H.drift(100,0,21600,-2,T),dEbb=H.drift(100,0,43200,-2,T);
    ok('21-core-hazard-flow drift pulls +x (+4.8) on flood, 0 at slack, and -x (-4.8) on ebb',
      near(dFlood.pull[0],4.8)&&near(dSlack.pull[0],0)&&near(dEbb.pull[0],-4.8),
      dFlood.pull[0]*dEbb.pull[0]>=0);
  }

  const X=H.export(T);
  ok('export carries filled tide & race fields',
    X.records.some(r=>r.hazard.tide&&r.hazard.tide.basin==='sound')&&X.records.some(r=>r.hazard.race&&r.hazard.race.axis[0]===1),
    false);
  ok('unbound basin, zero axis, and bad vMax <= slackV throw clear errors',
    throws(()=>{const TB=KT.create({build:'bad1-'+tag});const u=TB.add({'class':'feature',kind:'x',name:'x',at:[0,0,0],r:2,h:2,tags:{hazard:H.TIDE.bench(2,{basin:'missing'})}});H.state(u,0);},/bindTide/)&&
    throws(()=>H.make(H.TIDE.race(4,{axis:[0,0]})),/axis/)&&
    throws(()=>H.make(H.TIDE.race(4,{vMax:0.2,slackV:0.5})),/vMax/),
    false);
}

{delete globalThis.KHAZ;const H=load(20);const T0=baseRegistry('a'),s0=snap(H,T0);
  load(23);
  ok('loading 23 on 20 leaves non-tidal records byte-identical',snap(H,T0)===s0,snap(H,T0)!==s0);
  runSuite(H,'20 + 23',false);}

{delete globalThis.KHAZ;const H=load(20);load(21);load(22);const T0=baseRegistry('b'),s0=snap(H,T0);
  load(23);
  ok('loading 23 on 20 + 21 + 22 leaves non-tidal records byte-identical',snap(H,T0)===s0,snap(H,T0)!==s0);
  runSuite(H,'20 + 21 + 22 + 23',true);}

if(bad){console.error(bad+' test(s) failed');process.exit(1);}
console.log('all passed');
