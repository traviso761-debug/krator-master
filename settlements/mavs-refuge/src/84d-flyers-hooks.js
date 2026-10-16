/* ------------------------------------------------------------------ inspector, path viz, hooks */
var FLY_STATE_LABEL = { perch:'perched', walk:'just landed on the lip', turn:'just landed', flip:'just landed', prep:'being readied', tolip:'walking out onto the lip', crouch:'about to launch' };
function flyDescribe(a){
  if(!a) return 'Flying beast';
  var s = FLY_LABEL[a.sp];
  if(a.state === 'fly'){
    s += a.ridden ? ' and rider' : ' (wild)';
    s += a.pop === 'arr' ? ' - inbound to ' + a.dest : a.pop === 'dep' ? ' - outbound from ' + a.dest : a.pop === 'circuit' ? ' - ' + a.dest : ' - passing over';
    if(a.note) s += ', ' + a.note;
  } else s += ' - ' + (FLY_STATE_LABEL[a.state] || a.state) + ', ' + a.dest;
  return s;
}
for(flyI=0; flyI<4; flyI++) (function(sp){ flyMesh[sp].userData.inspectFn = function(i){ return flyDescribe(flySlotOwner[sp][i]); }; flyMesh[sp].userData.flyers = FLY_KEY[sp]; })(flyI);
flyWingMesh.userData.inspectFn = flyMesh[FLY_D].userData.inspectFn; flyWingMesh.userData.flyers = 'dragonflyWings';
flyMesh[FLY_R].userData.inspectFn = function(i){ var a = flySlotOwner[FLY_R][i]; return a ? (a.riderMode === 0 ? 'Saddle and tack (' : 'Beast-rider (') + FLY_LABEL[a.sp].toLowerCase() + ')' : 'Beast-rider'; };
flyMesh[FLY_R].userData.flyers = 'riders'; flyGlints.userData.flyers = 'glints';

function flyPolyOf(path, stride){
  var out = [], n = path.n; for(var i=0;i<n;i+=stride) out.push([path.p[i*3], path.p[i*3+1], path.p[i*3+2]]);
  if((n-1)%stride) out.push([path.p[(n-1)*3], path.p[(n-1)*3+1], path.p[(n-1)*3+2]]);
  return out;
}
function flyPathsOf(test, stride){ var seen = [], out = []; flyList.forEach(function(a){ if(a.state === 'fly' && a.path && test(a) && seen.indexOf(a.path) < 0){ seen.push(a.path); out.push(flyPolyOf(a.path, stride)); } }); return out; }
PATHVIZ.push({ key:'flyTransients', label:'Flyers: passing over (straight lines)', color:PAL.pathviz[0], paths:function(){ return flyPathsOf(function(a){ return a.pop === 'transient'; }, 1); } });
PATHVIZ.push({ key:'flyArrivals', label:'Flyers: live roost arrivals (incl. peel-offs from circuits)', color:PAL.pathviz[1], paths:function(){ return flyPathsOf(function(a){ return a.pop === 'arr'; }, 6); } });
PATHVIZ.push({ key:'flyDepartures', label:'Flyers: live roost departures + circuit joins', color:PAL.pathviz[2], paths:function(){
  var out = flyPathsOf(function(a){ return a.pop === 'dep'; }, 6); flyList.forEach(function(a){ if(a.depPath) out.push(flyPolyOf(a.depPath, 6)); }); return out; } });
PATHVIZ.push({ key:'flyCircuits', label:'Flyers: Rookery circuits + city patrols', color:PAL.pathviz[4], paths:function(){ return flyCircuits.map(function(p){ return flyPolyOf(p, 4); }); } });

window._legs = (window._legs || []).concat(flyLegs);

function flyPlatOf(name){ if(!name) return null; if(PIDX[name]) return PIDX[name]; for(var i=0;i<PLATS.length;i++) if(PLATS[i].name.toLowerCase().indexOf(String(name).toLowerCase()) >= 0) return PLATS[i]; return null; }
function flyById(id){ for(var i=0;i<flyList.length;i++) if(flyList[i].id === id) return flyList[i]; return null; }
function flyRate(ev){ var n = 0, w = Math.min(300, Math.max(1, flySimT)); for(var i=0;i<ev.length;i++) if(ev[i] >= flySimT-w) n++; return Math.round(n/(w/60)*100)/100; }
function flyTrisNow(){ var t = 0; for(var i=0;i<5;i++) t += flyMesh[i].count*flyTris[i]; return t + flyWingMesh.count*flyWingTris; }
var flyHooks = {
  list:function(){ return flyList.map(function(a){ return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, x:Math.round(a.x), y:Math.round(a.y), z:Math.round(a.z), dest:a.dest }; }); },
  find:function(state, sp, pop){ var out = []; flyList.forEach(function(a){ if((!state || a.state === state) && (sp === undefined || sp === null || FLY_KEY[a.sp] === sp || a.sp === sp) && (!pop || a.pop === pop)) out.push(a.id); }); return out; },
  info:function(id){ var a = flyById(id); if(!a) return null; return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, riderMode:a.riderMode, x:a.x, y:a.y, z:a.z, yaw:a.yaw, pitch:a.pitch, roll:a.roll, yawRate:a.yawRate, v:a.v,
    fold:a.fold, flare:a.flare, amp:a.amp, rem:a.path && a.state === 'fly' ? a.path.len-a.s : null, bayY:a.bay ? a.bay.y : null, bayH:a.bay ? a.bay.H : null, dest:a.dest, label:flyDescribe(a) }; },
  forceArrival:function(platName, sp, back){ var a = flySpawnArrival(flyPlatOf(platName), sp === undefined ? null : (typeof sp === 'string' ? FLY_KEY.indexOf(sp) : sp), back === undefined ? 60 : back, skyHour()); return a ? a.id : null; },
  forceDeparture:function(platName, sp, mode){ var a = flyStartDeparture(flyPlatOf(platName), sp === undefined ? null : (typeof sp === 'string' ? FLY_KEY.indexOf(sp) : sp), true, skyHour(), mode || 'far'); return a ? a.id : null; },
  forcePeel:function(){ var n = 0; flyList.forEach(function(a){ if(a.pop === 'circuit'){ a.lapMax = 0; n++; } }); return n; },
  circuitList:function(){ return flyCircuits.map(function(C){ return { label:C.label, len:Math.round(C.len), want:C.want, now:flyCircuitCount(C) }; }); },
  focus:function(id, dist, ang, up){ var a = typeof id === 'number' ? (flyById(id) || flyList[id]) : null; flyFollow = a || null; flyFollowD = dist || 30; flyFollowA = ang === undefined ? 0.9 : ang; flyFollowUp = up === undefined ? 0.22 : up; return a ? flyDescribe(a) : null; },
  /* advance the simulation (no rendering). hour: clock to pretend (default: the sky's) */
  skip:function(sec, hour){ var h = hour === undefined || hour === null ? skyHour() : hour, n = Math.ceil(sec/2); for(var i=0;i<n;i++) flySim(sec/n, h); return flySimT; },
  routeTest:function(n, arr){ var out = []; for(var i=0;i<flyBays.length && out.length<n;i+=7){ var B = flyBays[i]; if(!B.ok) continue; flyLastHit = null; var p = flyRoute(B, FLY_A, !!arr, 1, true); out.push(p ? 'ok' : flyLastHit); } return out; },
  foliageObstacles:flyPathStatsFol, pathStats:flyPathStats, totals:flyTotals, batReturnHours:flyBatHours, bays:flyBays.length, modelTris:flyTris.concat([flyWingTris]), drawCalls:7, circuits:flyCircuits.length
};
Object.defineProperties(flyHooks, {
  timeScale:{ get:function(){ return flyTimeScale; }, set:function(v){ flyTimeScale = Math.max(0, +v || 0); }, enumerable:true },
  aloft:{ get:function(){ flyCount(); return flyCnt.aloft; }, enumerable:true },
  perched:{ get:function(){ flyCount(); return flyCnt.perched; }, enumerable:true },
  onCircuits:{ get:function(){ flyCount(); return flyCnt.circuit; }, enumerable:true },
  batsOut:{ get:function(){ return flyBatDue.length; }, enumerable:true },
  occupancy:{ get:function(){ return Math.round(flyOcc()*1000)/1000; }, enumerable:true },
  usableBays:{ get:function(){ return flyUsable; }, enumerable:true },
  arrivalsPerMin:{ get:function(){ return flyRate(flyEvents.arr); }, enumerable:true },
  departuresPerMin:{ get:function(){ return flyRate(flyEvents.dep); }, enumerable:true },
  bySpecies:{ get:function(){ flyCount(); var o = {}; for(var i=0;i<4;i++) o[FLY_KEY[i]] = { total:flyCnt.bySp[i], aloft:flyCnt.aloftSp[i] }; return o; }, enumerable:true },
  riders:{ get:function(){ var n = 0; for(var i=0;i<FLY_RCAP;i++) n += flyUsed[FLY_R][i]; return n; }, enumerable:true },
  glints:{ get:function(){ return flyNGl; }, enumerable:true },
  tris:{ get:flyTrisNow, enumerable:true },
  cpuMs:{ get:function(){ return Math.round(flyCpu*100)/100; }, enumerable:true },
  simT:{ get:function(){ return Math.round(flySimT); }, enumerable:true }
});
window._flyers = flyHooks;

})();
