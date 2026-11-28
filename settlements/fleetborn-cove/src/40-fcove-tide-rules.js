// ================================================================= FLEETBORN COVE — macrotidal drydock, sill, rotor & causeway rules (FCOVE_TIDE)  [G data]
// Plain data and pure functions on core/water/tide (KTIDE) for Fleetborn Cove (Scale Model 5.1 px [236, 242], slice box [226, 232, 246, 252],
// mean range 11 m -> ~7.5 m neaps to ~14.3 m greatest springs at the Double Dark and Double Full every 45.5 days; extremes ~-7.27..+7.11 m).
// Zero THREE, zero DOM, zero Math.random, zero numeric || defaults: runs identically in Node tests, browser host HUD, SIM, and Godot.
(function(root){
'use strict';
if(root.FCOVE_TIDE)return;

const DAY=86400;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

const SPEC=Object.freeze({
 id:'site:fleetborn-arcoforte',
 px:Object.freeze([236,242]),
 sliceBox:Object.freeze([226,232,246,252]),
 meanRange:11,
 syzygyPeriodD:45.5,
 doubleDarkPeriodD:91,
 daySec:DAY,
 cradles:Object.freeze({
  cradle_deep:Object.freeze({
   id:'cradle_deep',
   name:'Deep Spring Graving Cradle',
   pitFloor:-3.6,
   blocks:-3.0,
   sill:0.0,
   draftMin:5.2,
   draftMax:6.2,
   designDraft:5.2,
   clearance:0.4,
   caisson:'jammed-open'
  }),
  cradle_great:Object.freeze({
   id:'cradle_great',
   name:'Great Careening Inner Pit',
   pitFloor:-0.6,
   blocks:0.0,
   sill:0.0,
   draftMin:5.8,
   draftMax:6.2,
   designDraft:6.2,
   clearance:0.4,
   caisson:'jammed-open'
  }),
  cradle_shallow:Object.freeze({
   id:'cradle_shallow',
   name:'Shallow Slip and Tender Cradle',
   pitFloor:-1.5,
   blocks:-1.0,
   sill:-1.0,
   draftMin:0.8,
   draftMax:2.2,
   designDraft:2.2,
   clearance:0.4,
   caisson:'jammed-open'
  })
 }),
 vessels:Object.freeze({
  ark_catamaran:Object.freeze({id:'ark_catamaran',kit:'89c',name:'Great Moon-Pool Ark-Catamaran',draft:5.2,deepHull:true,cradle:'cradle_deep'}),
  ark_ward:Object.freeze({id:'ark_ward',kit:'89g',name:'Coupled 3-Hull Chained Ark-Ward',draft:5.8,deepHull:true,cradle:'cradle_deep'}),
  smelt_barge:Object.freeze({id:'smelt_barge',kit:'89d',name:'Heavy Paktong Smelt-Barge',draft:6.2,deepHull:true,cradle:'cradle_great'}),
  dive_tender:Object.freeze({id:'dive_tender',kit:'89e',name:'Deep-Trench Vent-Harvester Tender',draft:1.9,deepHull:false,cradle:'cradle_shallow'}),
  scout_trimaran:Object.freeze({id:'scout_trimaran',kit:'89f',name:'Fast Crab-Claw Scout Trimaran',draft:1.3,deepHull:false,cradle:'cradle_shallow'}),
  hk_whaler:Object.freeze({id:'hk_whaler',kit:'89h',name:'Hueru-Kuran Whalebone Baidarka Whaler',draft:1.5,deepHull:false,cradle:'cradle_shallow'}),
  shorekin_skiff:Object.freeze({id:'shorekin_skiff',kit:'port_skiff',name:'Shore-kin Work Skiff',draft:0.8,deepHull:false,cradle:'cradle_shallow'})
 }),
 sill:Object.freeze({
  vMax:5.2,
  slackMaxMps:0.65,
  sillDepth:-11.0
 }),
 rotors:Object.freeze({
  nRotors:4,
  pCapMW:2.4,
  kMW:0.022,
  campaignMinMWh:11.0
 }),
 mill:Object.freeze({
  basinAreaM2:18500,
  sillFloor:-6.5,
  minWorkHeadM:1.8,
  ropeWalkMinHeadM:6.0,
  heavyStampMinHeadM:10.8,
  refHeadM:14.35
 }),
 causeway:Object.freeze({
  exposeLevel:-6.0,
  crestY:-6.0,
  byssusBedY:-6.2
 })
});

function bisectRoot(fn,a,b,fa){
 let lo=a,hi=b,flo=fa;
 for(let k=0;k<36;k++){
  const m=0.5*(lo+hi),fm=fn(m);
  if(fm===0)return m;
  if((flo>0&&fm>0)||(flo<0&&fm<0)){lo=m;flo=fm;}else{hi=m;}
 }
 return 0.5*(lo+hi);
}

/* Exact sub-intervals of [t0, t1] where fn(t) >= 0, seeded with exact extremum knots so grazing peaks are never missed. */
function intervalsNonNeg(fn,t0,t1,knots,nSteps){
 const N=nSteps==null?720:nSteps;
 const pts=[t0];
 for(let i=1;i<N;i++)pts.push(t0+(t1-t0)*(i/N));
 pts.push(t1);
 if(knots){
  for(let i=0;i<knots.length;i++){
   const q=knots[i];
   if(q>t0&&q<t1)pts.push(q);
  }
 }
 pts.sort((a,b)=>a-b);
 const uniq=[pts[0]];
 for(let i=1;i<pts.length;i++){
  if(pts[i]-uniq[uniq.length-1]>1e-4)uniq.push(pts[i]);
 }
 const wins=[];
 let curStart=uniq[0],inside=fn(uniq[0])>=0,prevT=uniq[0],prevV=fn(uniq[0]);
 for(let i=1;i<uniq.length;i++){
  const t=uniq[i],v=fn(t);
  if(inside){
   if(v<0){
    const rc=prevV===0?prevT:bisectRoot(fn,prevT,t,prevV);
    if(rc>curStart+1e-3)wins.push([+rc.toFixed(2),+curStart.toFixed(2)]);
    inside=false;
   }
  }else if(v>=0){
   curStart=v===0?t:bisectRoot(fn,prevT,t,prevV);
   inside=true;
  }
  prevT=t;prevV=v;
 }
 if(inside&&prevT>curStart+1e-3){
  wins.push([+prevT.toFixed(2),+curStart.toFixed(2)]);
 }
 /* Normalize [tOpen, tClose] ordering */
 for(let i=0;i<wins.length;i++){
  const b=wins[i][0],a=wins[i][1];
  wins[i]=Object.freeze([a,b]);
 }
 return Object.freeze(wins);
}

function cradleThresholds(c,opt){
 const o=opt||{};
 const draft=o.draft==null?c.designDraft:o.draft;
 const clearance=o.clearance==null?c.clearance:o.clearance;
 if(!isFinite(draft)||draft<=0)throw new Error('FCOVE_TIDE: draft must be > 0');
 if(!isFinite(clearance)||clearance<0)throw new Error('FCOVE_TIDE: clearance must be >= 0');
 const floatLevel=c.blocks+draft+clearance;
 const gateLevel=Math.max(c.blocks,c.sill)+draft+clearance;
 return{draft:draft,clearance:clearance,floatLevel:floatLevel,gateLevel:gateLevel};
}

function resolveSite(siteOrData,opt){
 const o=opt||{};
 if(siteOrData&&typeof siteOrData.level==='function'&&typeof siteOrData.rate==='function'&&typeof siteOrData.day==='function'){
  return siteOrData;
 }
 const kt=o.ktide||(typeof root.KTIDE!=='undefined'?root.KTIDE:null);
 if(!kt||typeof kt.load!=='function')throw new Error('FCOVE_TIDE.create: needs a KTIDE site or {ktide: KTIDE} with tides data');
 if(!siteOrData||siteOrData.kind!=='krator-tides')throw new Error('FCOVE_TIDE.create: invalid tides data record');
 const px=o.px||SPEC.px;
 const rng=o.meanRange==null?SPEC.meanRange:o.meanRange;
 if(!isFinite(rng)||rng<=0)throw new Error('FCOVE_TIDE.create: meanRange must be > 0');
 const T=kt.load(siteOrData,{origin:px});
 const S=T.site({px:px[0],py:px[1]},{range:rng,springs:o.springs});
 if(!S)throw new Error('FCOVE_TIDE.create: no wet tide cell near px '+px.join(','));
 return S;
}

function computeMaxRate(site){
 let mr=0;
 const tStart=-DAY,tEnd=91*DAY;
 for(let t=tStart;t<=tEnd;t+=240){
  const r=Math.abs(site.rate(t));
  if(r>mr)mr=r;
 }
 if(!(mr>0))throw new Error('FCOVE_TIDE.create: site has zero tidal rate');
 return mr;
}

function mergeGroup(def,ov){
 if(!ov)return def;
 const out={};
 const keys=Object.keys(def);
 for(let i=0;i<keys.length;i++){
  const k=keys[i];
  out[k]=ov[k]==null?def[k]:ov[k];
 }
 return Object.freeze(out);
}

function create(siteOrData,opt){
 const o=opt||{};
 const site=resolveSite(siteOrData,o);
 const sill=mergeGroup(SPEC.sill,o.sill);
 const rotors=mergeGroup(SPEC.rotors,o.rotors);
 const mill=mergeGroup(SPEC.mill,o.mill);
 const causeway=mergeGroup(SPEC.causeway,o.causeway);
 if(!(sill.vMax>0)||!(sill.slackMaxMps>0)||sill.slackMaxMps>=sill.vMax){
  throw new Error('FCOVE_TIDE.create: sill requires 0 < slackMaxMps < vMax');
 }
 if(!(rotors.pCapMW>0)||!(rotors.kMW>0)||!(rotors.campaignMinMWh>0)){
  throw new Error('FCOVE_TIDE.create: rotors require positive pCapMW, kMW, campaignMinMWh');
 }
 if(!isFinite(causeway.exposeLevel)){
  throw new Error('FCOVE_TIDE.create: causeway.exposeLevel must be finite');
 }
 const cradles={};
 const cKeys=Object.keys(SPEC.cradles);
 for(let i=0;i<cKeys.length;i++){
  const k=cKeys[i];
  const ovC=o.cradles&&o.cradles[k]?o.cradles[k]:null;
  const c=mergeGroup(SPEC.cradles[k],ovC);
  if(!isFinite(c.blocks)||!isFinite(c.sill)||!(c.designDraft>0)||c.clearance<0){
   throw new Error('FCOVE_TIDE.create: invalid cradle spec '+k);
  }
  cradles[k]=c;
 }
 Object.freeze(cradles);

 const maxRate=o.maxRate==null?computeMaxRate(site):o.maxRate;
 if(!(maxRate>0))throw new Error('FCOVE_TIDE.create: maxRate must be > 0');

 const dayCache=new Map();
 function dayEx(d){
  const di=Math.floor(d);
  let x=dayCache.get(di);
  if(!x){x=site.day(di);dayCache.set(di,x);}
  return x;
 }

 function getCradle(id){
  const c=cradles[id];
  if(!c)throw new Error('FCOVE_TIDE: unknown cradle '+id);
  return c;
 }

 /* 1. Graving Cradles: exact daily gate windows [tOpen, tClose], hours open, and careened hull vertical pose */
 function cradleAt(id,t,cOpt){
  const c=getCradle(id),th=cradleThresholds(c,cOpt),lv=site.level(t);
  const hullY=Math.max(c.blocks,lv-(th.draft+th.clearance))+th.draft;
  return{
   id:c.id,
   level:+lv.toFixed(3),
   blocks:c.blocks,
   sill:c.sill,
   draft:th.draft,
   floatLevel:+th.floatLevel.toFixed(3),
   gateLevel:+th.gateLevel.toFixed(3),
   afloatInPit:lv>=th.floatLevel,
   gateOpen:lv>=th.gateLevel,
   keelY:+Math.max(c.blocks,lv-(th.draft+th.clearance)).toFixed(3),
   waterlineY:+hullY.toFixed(3)
  };
 }

 function cradleDay(id,d,cOpt){
  const di=Math.floor(d),c=getCradle(id),th=cradleThresholds(c,cOpt);
  const t0=di*DAY,t1=(di+1)*DAY,x=dayEx(di);
  const wins=x.highest>=th.gateLevel-1e-4?intervalsNonNeg(t=>site.level(t)-th.gateLevel,t0,t1,x.high,720):Object.freeze([]);
  const pitWins=x.highest>=th.floatLevel-1e-4?intervalsNonNeg(t=>site.level(t)-th.floatLevel,t0,t1,x.high,720):Object.freeze([]);
  let sec=0,pitSec=0;
  for(let i=0;i<wins.length;i++)sec+=wins[i][1]-wins[i][0];
  for(let i=0;i<pitWins.length;i++)pitSec+=pitWins[i][1]-pitWins[i][0];
  return Object.freeze({
   id:c.id,
   day:di,
   open:wins.length>0,
   blocks:c.blocks,
   sill:c.sill,
   draft:th.draft,
   floatLevel:+th.floatLevel.toFixed(3),
   gateLevel:+th.gateLevel.toFixed(3),
   maxLevel:+x.highest.toFixed(3),
   margin:+(x.highest-th.gateLevel).toFixed(3),
   windows:wins,
   tOpen:wins.length?wins[0][0]:null,
   tClose:wins.length?wins[wins.length-1][1]:null,
   hours:+(sec/3600).toFixed(4),
   hoursAfloatInPit:+(pitSec/3600).toFixed(4)
  });
 }

 function hullWaterlineY(level,cradleId,draftOpt){
  const c=getCradle(cradleId==null?'cradle_deep':cradleId);
  const th=cradleThresholds(c,draftOpt);
  /* Ringsea hulls have local y=0 at design waterline and keel resting at local y = -(draft + clearance) relative to float threshold:
     below floatLevel (+2.6 m for cradle_deep), the vessel stays fixed at floatLevel; above floatLevel, it rises 1:1 with sea level. */
  return Math.max(th.floatLevel,level);
 }

 /* 2. Sill Gate: reversible race velocity v(t) = vMax * rate(t) / maxRate; slack transit |v(t)| <= 0.65 m/s */
 function sillVelocity(t){
  return clamp(sill.vMax*site.rate(t)/maxRate,-sill.vMax,sill.vMax);
 }

 function sillAt(t,vesselId){
  const v=sillVelocity(t),av=Math.abs(v),lv=site.level(t);
  const V=vesselId?SPEC.vessels[vesselId]:null;
  const deep=V?V.deepHull:true;
  const slack=av<=sill.slackMaxMps;
  const depthClear=(lv-sill.sillDepth)>=(V?V.draft+0.6:5.8);
  return{
   v:+v.toFixed(3),
   speed:+av.toFixed(3),
   state:slack?'slack':v>0?'flood':'ebb',
   slack:slack,
   deepTransit:deep?(slack&&depthClear):depthClear,
   sillWaterDepth:+(lv-sill.sillDepth).toFixed(2)
  };
 }

 function sillDay(d){
  const di=Math.floor(d),t0=di*DAY,t1=(di+1)*DAY,x=dayEx(di);
  const knots=x.high.concat(x.low);
  const wins=intervalsNonNeg(t=>sill.slackMaxMps-Math.abs(sillVelocity(t)),t0,t1,knots,720);
  let sec=0,pk=0;
  for(let i=0;i<wins.length;i++)sec+=wins[i][1]-wins[i][0];
  for(let t=t0;t<=t1;t+=180){
   const av=Math.abs(sillVelocity(t));
   if(av>pk)pk=av;
  }
  return Object.freeze({
   day:di,
   windows:wins,
   slackHours:+(sec/3600).toFixed(4),
   slackMinutes:+(sec/60).toFixed(2),
   meanWindowMinutes:wins.length?+((sec/60)/wins.length).toFixed(2):0,
   peakSpeedMps:+pk.toFixed(3)
  });
 }

 /* 3. Tidal Race Rotors (|v|^3) & Paktong Reverberatory Smelt-Hearth */
 function rotorPowerMW(t){
  const av=Math.abs(sillVelocity(t));
  return Math.min(rotors.pCapMW,rotors.kMW*av*av*av);
 }

 function rotorDay(d){
  const di=Math.floor(d),t0=di*DAY,N=1440,dt=DAY/N;
  let sumMW=0.5*(rotorPowerMW(t0)+rotorPowerMW(t0+DAY)),pk=0;
  for(let i=1;i<N;i++){
   const p=rotorPowerMW(t0+i*dt);
   sumMW+=p;
   if(p>pk)pk=p;
  }
  const mwh=sumMW*(dt/3600);
  const active=mwh>=rotors.campaignMinMWh;
  return Object.freeze({
   day:di,
   mwh:+mwh.toFixed(4),
   meanMW:+(mwh/24).toFixed(4),
   peakMW:+pk.toFixed(4),
   duty:+(mwh/(24*rotors.pCapMW)).toFixed(4),
   campaignMinMWh:rotors.campaignMinMWh,
   smeltActive:active,
   hearthState:active?'campaign':'banked'
  });
 }

 function rotorMWh(d){
  return rotorDay(d).mwh;
 }

 /* 4. Impounding Basin & Tide Mill: fills at dayHighest through flap-gates, drains on ebb with hydraulic head H = dayRange */
 function millHead(d){
  const x=dayEx(Math.floor(d));
  return +x.range.toFixed(4);
 }

 function millDuty(d){
  const di=Math.floor(d),x=dayEx(di),H=x.range;
  /* Potential energy of two semidiurnal basin prism fillings: E ~ 2 * 0.5 * rho * g * A * dH^2 (converted to MWh) */
  const prismHead=Math.max(0,H-mill.minWorkHeadM),refPrism=Math.max(0.1,mill.refHeadM-mill.minWorkHeadM);
  const mwh=2*0.5*1025*9.81*mill.basinAreaM2*prismHead*prismHead*0.42/3.6e9;
  const duty=clamp((prismHead*prismHead)/(refPrism*refPrism),0,1);
  return Object.freeze({
   day:di,
   headM:+H.toFixed(4),
   fillLevel:+x.highest.toFixed(3),
   drainLevel:+x.lowest.toFixed(3),
   duty:+duty.toFixed(4),
   mwh:+mwh.toFixed(4),
   ropeWalkActive:H>=mill.ropeWalkMinHeadM,
   heavyStampsActive:H>=mill.heavyStampMinHeadM,
   millState:H>=mill.heavyStampMinHeadM?'full-stamps':H>=mill.ropeWalkMinHeadM?'rope-and-light-stamps':'idle'
  });
 }

 function millAt(t){
  const di=Math.floor(t/DAY),x=dayEx(di),lv=site.level(t),rt=site.rate(t);
  const headNow=Math.max(0,x.highest-lv);
  const milling=rt<=0&&headNow>=mill.minWorkHeadM;
  const state=rt>0&&lv>=x.highest-0.8?'filling':milling?'milling':rt<0?'building-head':'holding';
  return{
   level:+lv.toFixed(3),
   basinTop:+x.highest.toFixed(3),
   instantHeadM:+headNow.toFixed(3),
   dayHeadM:+x.range.toFixed(3),
   milling:milling,
   state:state
  };
 }

 /* 5. Low-Water White Stacks Causeway & Sea-Byssus Beds: exposed dry/wadable ONLY when level(t) <= -6.0 m */
 function causewayAt(t){
  const lv=site.level(t),exp=lv<=causeway.exposeLevel;
  return{
   level:+lv.toFixed(3),
   exposeLevel:causeway.exposeLevel,
   exposed:exp,
   byssusGatherable:exp,
   depthOverCrest:+Math.max(0,lv-causeway.exposeLevel).toFixed(3),
   dryClearance:+Math.max(0,causeway.exposeLevel-lv).toFixed(3)
  };
 }

 function causewayDay(d){
  const di=Math.floor(d),t0=di*DAY,t1=(di+1)*DAY,x=dayEx(di);
  const wins=x.lowest<=causeway.exposeLevel+1e-4?intervalsNonNeg(t=>causeway.exposeLevel-site.level(t),t0,t1,x.low,720):Object.freeze([]);
  let sec=0;
  for(let i=0;i<wins.length;i++)sec+=wins[i][1]-wins[i][0];
  return Object.freeze({
   day:di,
   exposed:wins.length>0,
   byssusGatherable:wins.length>0,
   exposeLevel:causeway.exposeLevel,
   minLevel:+x.lowest.toFixed(3),
   windows:wins,
   tOpen:wins.length?wins[0][0]:null,
   tClose:wins.length?wins[wins.length-1][1]:null,
   hours:+(sec/3600).toFixed(4)
  });
 }

 /* 6. Integrated daily summary & live snapshot */
 function extremeTime(times,wantHigh){
  if(!times||!times.length)return null;
  let bestT=times[0],bestV=site.level(times[0]);
  for(let i=1;i<times.length;i++){
   const v=site.level(times[i]);
   if(wantHigh?(v>bestV):(v<bestV)){bestV=v;bestT=times[i];}
  }
  return bestT;
 }

 function daySummary(d){
  const di=Math.floor(d),x=dayEx(di);
  let spMax=0,spMin=1e9,spSum=0;
  for(let k=0;k<=24;k++){
   const sp=site.spring((di+k/24)*DAY);
   if(sp>spMax)spMax=sp;
   if(sp<spMin)spMin=sp;
   spSum+=sp;
  }
  const spMean=spSum/25;
  const cDeep=cradleDay('cradle_deep',di);
  const cGreat=cradleDay('cradle_great',di);
  const cShal=cradleDay('cradle_shallow',di);
  const sDay=sillDay(di);
  const rDay=rotorDay(di);
  const mDay=millDuty(di);
  const cwDay=causewayDay(di);
  return Object.freeze({
   day:di,
   range:+x.range.toFixed(3),
   highest:+x.highest.toFixed(3),
   lowest:+x.lowest.toFixed(3),
   greatFloodT:extremeTime(x.high,true),
   greatEbbT:extremeTime(x.low,false),
   springMean:+spMean.toFixed(4),
   springMin:+spMin.toFixed(4),
   springMax:+spMax.toFixed(4),
   phase:spMean>=1.15?'spring':spMean<=0.88?'neap':'mid',
   isSpringDockDay:cDeep.open,
   isGreatCareening:cGreat.open,
   cradles:Object.freeze({cradle_deep:cDeep,cradle_great:cGreat,cradle_shallow:cShal}),
   sill:sDay,
   rotors:rDay,
   mill:mDay,
   causeway:cwDay
  });
 }

 function snapshot(t){
  const ts=t==null?0:t,di=Math.floor(ts/DAY),x=dayEx(di),lv=site.level(ts),sp=site.spring(ts);
  const rDay=rotorDay(di),mDay=millDuty(di),pMW=rotorPowerMW(ts);
  return{
   t:ts,
   day:di,
   level:+lv.toFixed(3),
   rate:+site.rate(ts).toFixed(6),
   spring:+sp.toFixed(3),
   dayRange:+x.range.toFixed(2),
   dayHighest:+x.highest.toFixed(2),
   dayLowest:+x.lowest.toFixed(2),
   sill:sillAt(ts),
   cradles:{
    cradle_deep:cradleAt('cradle_deep',ts),
    cradle_great:cradleAt('cradle_great',ts),
    cradle_shallow:cradleAt('cradle_shallow',ts)
   },
   cradleDays:{
    cradle_deep:cradleDay('cradle_deep',di),
    cradle_great:cradleDay('cradle_great',di),
    cradle_shallow:cradleDay('cradle_shallow',di)
   },
   rotors:{
    powerMW:+pMW.toFixed(3),
    dayMWh:rDay.mwh,
    smeltActive:rDay.smeltActive,
    hearthState:rDay.hearthState
   },
   mill:Object.assign({},millAt(ts),{dayDuty:mDay.duty,heavyStampsActive:mDay.heavyStampsActive,ropeWalkActive:mDay.ropeWalkActive}),
   causeway:causewayAt(ts),
   careenedHullY:+hullWaterlineY(lv,'cradle_deep').toFixed(3)
  };
 }

 function cycleSummary(d0,nDays){
  const start=d0==null?0:Math.floor(d0),n=nDays==null?92:Math.floor(nDays);
  if(!(n>0))throw new Error('FCOVE_TIDE.cycleSummary: nDays must be > 0');
  const days=[];
  for(let i=0;i<n;i++)days.push(daySummary(start+i));
  return Object.freeze(days);
 }

 return Object.freeze({
  site:site,
  maxRate:maxRate,
  cradles:cradles,
  vessels:SPEC.vessels,
  sill:sill,
  rotors:rotors,
  mill:mill,
  causeway:causeway,
  cradleAt:cradleAt,
  cradleDay:cradleDay,
  hullWaterlineY:hullWaterlineY,
  sillVelocity:sillVelocity,
  sillAt:sillAt,
  sillDay:sillDay,
  rotorPowerMW:rotorPowerMW,
  rotorDay:rotorDay,
  rotorMWh:rotorMWh,
  millHead:millHead,
  millDuty:millDuty,
  millAt:millAt,
  causewayAt:causewayAt,
  causewayDay:causewayDay,
  daySummary:daySummary,
  snapshot:snapshot,
  cycleSummary:cycleSummary
 });
}

root.FCOVE_TIDE=Object.freeze({SPEC:SPEC,create:create});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_TIDE;
})(typeof window!=='undefined'?window:globalThis);
