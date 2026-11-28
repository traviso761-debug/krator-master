// node core/hazard/test-hazard-tsunami.js
// Tests core/hazard/24-core-hazard-tsunami.js ([G data]) on tools/ktest.js across both 20 + 24 and 20 + 21 + 22 + 23 + 24,
// verifying non-interference with existing hazard records, height-aware safe_refuge above trimlineM, tremor & drawdown
// warnings, bore_impact, inundated, backwash_scour, and directional surge/backwash drift.
'use strict';
const fs=require('fs'),path=require('path');
const T=require('../../tools/ktest.js')(__filename);
const C=p=>path.join(__dirname,'..',p);

require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));
require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
require(C('clock/20-core-clock.js'));
eval(fs.readFileSync(C('water/ext/64-core-water-tsunami.js'),'utf8'));

const SRC={
  20:fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'),
  21:fs.readFileSync(path.join(__dirname,'21-core-hazard-flow.js'),'utf8'),
  22:fs.readFileSync(path.join(__dirname,'22-core-hazard-env.js'),'utf8'),
  23:fs.readFileSync(path.join(__dirname,'23-core-hazard-tide.js'),'utf8'),
  24:fs.readFileSync(path.join(__dirname,'24-core-hazard-tsunami.js'),'utf8')
};
const load=n=>{eval(SRC[n]);return globalThis.KHAZ;};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-9:e);

{
  const keep=globalThis.KHAZ;
  delete globalThis.KHAZ;
  T.neg('without 20-core-hazard.js loaded, 24 throws naming 20-core-hazard.js',
    withBase=>{
      if(withBase)load(20);
      eval(SRC[24]);
      return !!globalThis.KHAZ.TSUNAMI;
    },false,true);
  globalThis.KHAZ=keep;
}

function baseRegistry(tag){
  const R=KT.create({build:'ts-base-'+tag});
  R.add({'class':'feature',kind:'vent',name:'Steam Vent',at:[-30,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear'}}});
  R.add({'class':'feature',kind:'sump',name:'Mud Sump',at:[45,0,0],r:6,h:3,tags:{hazard:{kind:'grab',move:{speed:0.4,pull:1.5}}}});
  return R;
}

function snap(H,R){
  return JSON.stringify([
    H.at(-30,0,10,1,R).map(e=>[e.id,e.dose,e.state.k]),
    H.here(45,0.5,0,10,R),
    H.export(R),
    H.zones(R)
  ]);
}

function runSuite(H,tag,withAll){
  const R=KT.create({build:'ts-suite-'+tag});
  const TS=globalThis.WATER.tsunami({
    key:'cove-'+tag,
    regime:'seamount',
    dir:[1,0],
    shoreOrigin:[0,0],
    drawdownM:7.0,
    boreHeightM:14.0,
    runupMaxM:28.0,
    startS:-650,
    inlandReachM:950,
    frontWidthM:28
  });

  H.bindTsunami(TS.key,TS);

  const zObj=H.TSUNAMI.zone({w:2200,d:1200,h:60},{
    key:TS.key,
    fullDepth:1.4,
    fluxLethal:18.0
  });
  T.ok(tag+': KHAZ.TSUNAMI.zone returns a validated KHAZ.make object with tsunami fields',
    zObj.kind==='drown'&&zObj.stateFn==='KHAZ.tsunami'&&
    zObj.tsunami.key===TS.key&&zObj.tsunami.trimlineM===28.0&&
    zObj.tsunami.fullDepth===1.4&&zObj.tsunami.fluxLethal===18.0);

  const zone=R.add({
    'class':'feature',
    kind:'coast',
    name:'Arch Cove Tsunami Zone',
    at:[0,0,0],
    tags:{hazard:zObj}
  });

  /* 1. Calm */
  TS.setMode('calm');
  const sCalm=H.state(zone,0,null,10,0,0.5);
  T.ok(tag+': calm phase gives state calm, k = 0, on = false, dose = 0, drift pull = 0',
    sCalm.state==='calm'&&sCalm.k===0&&sCalm.on===false&&
    H.dose(zone,10,0,0,0.5)===0&&near(H.drift(10,0,0,0.5,R).pull[0],0)&&H.drift(10,0,0,0.5,R).speed===1);

  /* 2. Tremor warning */
  TS.setMode('tremor');
  const sTrem=H.state(zone,0,null,25,0,1.0);
  T.ok(tag+': seamount tremor gives state tremor_warn with warn = true and k = 0',
    sTrem.state==='tremor_warn'&&sTrem.warn===true&&sTrem.k===0&&sTrem.on===false&&H.dose(zone,25,0,0,1.0)===0);

  /* 3. Drawdown warning */
  TS.setMode('drawdown');
  const sDraw=H.state(zone,0,null,15,0,0.6);
  T.ok(tag+': ocean drawdown gives state drawdown_warn with warn = true and k = 0 on dry quay',
    sDraw.state==='drawdown_warn'&&sDraw.warn===true&&sDraw.k===0&&sDraw.level<=-6.9);

  /* 4. Bore impact vs ahead-of-bore warning vs elevated safe_refuge */
  TS.setMode('bore');
  const sBoreHit=H.state(zone,0,null,0,0,0.2);
  const sAhead=H.state(zone,0,null,140,0,5.0);
  const sTower=H.state(zone,0,null,0,0,30.0);
  const dBore=H.drift(0,0,0,0.2,R);
  T.ok(tag+': bore front triggers bore_impact (k = 1, inland +x drift pull > 8 m/s) while s > boreS warns and y >= 28 m is safe_refuge',
    sBoreHit.state==='bore_impact'&&near(sBoreHit.k,1)&&sBoreHit.on===true&&near(H.dose(zone,0,0,0,0.2),0.85)&&
    dBore.pull[0]>8&&dBore.speed<0.5&&
    sAhead.state==='drawdown_warn'&&sAhead.warn===true&&sAhead.k===0&&
    sTower.state==='safe_refuge'&&sTower.above===true&&sTower.trimlineM===28.0&&sTower.k===0&&H.dose(zone,0,0,0,30.0)===0);

  /* 5. Peak Run-Up: inundated below trimline, above on high balcony, safe_refuge on high ground */
  TS.setMode('runup');
  const sInun=H.state(zone,0,null,200,0,8.0);
  const sBalcony=H.state(zone,0,null,200,0,26.8);
  const sHighGround=H.state(zone,0,null,850,0);
  T.ok(tag+': runup inundates flooded town (state inundated, k = 1), spares +26.8 m balcony above wave, and marks inland >= 28 m safe_refuge',
    sInun.state==='inundated'&&near(sInun.k,1)&&H.at(200,0,0,8.0,R).some(h=>h.id===zone.id&&h.state.state==='inundated')&&
    sBalcony.k===0&&sBalcony.on===false&&
    sHighGround.state==='safe_refuge'&&sHighGround.k===0);

  /* 6. Backwash scour & seaward pull reversal */
  TS.setMode('backwash');
  const sBack=H.state(zone,0,null,200,0,7.2);
  const dBack=H.drift(200,0,0,7.2,R);
  T.ok(tag+': backwash triggers backwash_scour boosted by momentumFlux and reverses drift pull seaward (-x < -6 m/s)',
    sBack.state==='backwash_scour'&&sBack.on===true&&sBack.k>0.9&&
    dBack.pull[0]<-6&&dBack.slip>=0.4);

  /* 7. Custom function binding via TS.hazardFn() */
  H.bindTsunami('fn-'+tag,TS.hazardFn());
  const fnRec=R.add({
    'class':'feature',
    kind:'quay',
    name:'Quay',
    at:[60,2.5,0],
    r:20,
    h:30,
    tags:{hazard:H.TSUNAMI.zone(20,{key:'fn-'+tag,kind:'crush',effect:'bleed'})}
  });
  const sFn=H.state(fnRec,0,null,60,0,2.5);
  T.ok(tag+': bindTsunami works identically with TS.hazardFn() and existing crush/bleed vocabulary',
    sFn.state==='backwash_scour'&&sFn.k>0.9&&H.doses(fnRec,60,0,0,2.5).bleed>0.7);

  /* 8. Coexistence with 21 (flow pull) and 23 (tidal race) when loaded */
  if(withAll){
    const sump=R.add({'class':'feature',kind:'throat',name:'Gills Throat',at:[0,0,900],r:8,h:6,
      tags:{hazard:{kind:'grab',falloff:'none',move:{speed:0.5,pull:2.0,still:0.1}}}});
    H.bindTide('narrows-'+tag,()=>({y:3.0,vy:0.004,vRace:4.5,drawdown:false}));
    const race=R.add({'class':'feature',kind:'race',name:'Tidal Race',at:[0,0,-900],
      tags:{hazard:H.TIDE.race(12,{basin:'narrows-'+tag,axis:[0,1],vMax:4.5,slackV:0.3,falloff:'none'})}});
    const dSump=H.drift(4,900,0,0.5,R);
    const dRace=H.drift(0,-900,0,-1,R);
    T.ok(tag+': 21 move.pull and 23 KHAZ.race continue working unchanged alongside 24',
      dSump.pull[0]<-1.9&&dSump.by.includes(sump.id)&&
      near(dRace.pull[2],4.5)&&dRace.by.includes(race.id));
  }

  /* 9. Export & paired negatives */
  const X=H.export(R);
  T.ok(tag+': KHAZ.export carries filled tsunami metadata',
    X.records.some(r=>r.id===zone.id&&r.hazard.tsunami&&r.hazard.tsunami.key===TS.key&&r.hazard.tsunami.trimlineM===28));

  T.neg(tag+': unbound tsunami key throws naming bindTsunami',
    key=>{
      const RT=KT.create({build:'bad-ub-'+tag+'-'+key});
      const rec=RT.add({'class':'feature',kind:'x',name:'x',at:[0,0,0],r:5,h:10,tags:{hazard:H.TSUNAMI.zone(5,{key})}});
      return H.state(rec,0)!=null;
    },'unbound-key',TS.key);

  T.neg(tag+': non-positive trimlineM is rejected',
    trimlineM=>!!H.TSUNAMI.zone(10,{key:TS.key,trimlineM}),0,24);
  T.neg(tag+': non-positive fluxLethal is rejected',
    fluxLethal=>!!H.TSUNAMI.zone(10,{key:TS.key,fluxLethal}),-2,15);
  T.neg(tag+': stateFn KHAZ.tsunami without tsunami block is rejected',
    hasBlock=>!!H.make(hasBlock?{kind:'drown',stateFn:'KHAZ.tsunami',tsunami:{key:TS.key}}:{kind:'drown',stateFn:'KHAZ.tsunami'}),
    false,true);

  TS.setMode('calm');
}

/* Suite A: 20 + 24 */
{
  delete globalThis.KHAZ;
  const H=load(20);
  const R0=baseRegistry('a'),s0=snap(H,R0);
  load(24);
  T.ok('loading 24 onto 20 leaves non-tsunami records byte-identical',snap(H,R0)===s0);
  runSuite(H,'20+24',false);
}

/* Suite B: 20 + 21 + 22 + 23 + 24 */
{
  delete globalThis.KHAZ;
  const H=load(20);
  load(21);
  load(22);
  load(23);
  const R0=baseRegistry('b'),s0=snap(H,R0);
  load(24);
  T.ok('loading 24 onto 20+21+22+23 leaves non-tsunami records byte-identical',snap(H,R0)===s0);
  runSuite(H,'20+21+22+23+24',true);
}

T.done();
