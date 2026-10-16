/* ------------------------------------------------------------------ inspector, path viz, hooks */
var FLY_STATE_LABEL = { perch:'perched', walk:'just landed on the perch beam', turn:'just landed', flip:'just landed', prep:'being readied', tolip:'walking out along the perch beam', crouch:'about to launch' };
function flyDescribe(a){
  if(!a) return 'Flying beast';
  var s = FLY_LABEL[a.sp];
  if(a.state === 'fly'){
    s += a.ridden ? ' and rider' : ' (wild)';
    s += a.pop === 'arr' ? ' - inbound to the ' + a.dest : a.pop === 'dep' ? ' - outbound from the ' + a.dest : a.pop === 'circuit' ? ' - ' + a.dest.toLowerCase() : ' - passing over';
    if(a.note) s += ', ' + a.note;
  } else s += ' - ' + (a.resident ? 'court-side resident, ' : '') + (FLY_STATE_LABEL[a.state] || a.state) + ', ' + a.dest;
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
PATHVIZ.push({ key:'flyDepartures', label:'Flyers: live roost departures, sorties + circuit joins', color:PAL.pathviz[2], paths:function(){
  var out = flyPathsOf(function(a){ return a.pop === 'dep'; }, 6); flyList.forEach(function(a){ if(a.depPath) out.push(flyPolyOf(a.depPath, 6)); }); return out; } });
PATHVIZ.push({ key:'flyCircuits', label:'Flyers: tower circuits, brook run, patrols, night hunt', color:PAL.pathviz[4], paths:function(){ return flyCircuits.map(function(p){ return flyPolyOf(p, 4); }); } });

window._legs = (window._legs || []).concat(flyLegs);

function flyPlatOf(name){ if(!name) return null; for(var i=0;i<PLATS.length;i++) if(PLATS[i].name.toLowerCase().indexOf(String(name).toLowerCase()) >= 0) return PLATS[i]; return null; }
function flyById(id){ for(var i=0;i<flyList.length;i++) if(flyList[i].id === id) return flyList[i]; return null; }
function flySpOf(sp){ return sp === undefined || sp === null ? null : (typeof sp === 'string' ? FLY_KEY.indexOf(sp) : sp); }
function flyRate(ev){ var n = 0, w = Math.min(300, Math.max(1, flySimT)); for(var i=0;i<ev.length;i++) if(ev[i] >= flySimT-w) n++; return Math.round(n/(w/60)*100)/100; }
function flyTrisNow(){ var t = 0; for(var i=0;i<5;i++) t += flyMesh[i].count*flyTris[i]; return t + flyWingMesh.count*flyWingTris; }
/* where is everyone, right now? counts of animals in places they must never be */
var flyAud = { samples:0, inTower:0, inBlockCruise:0, bridge:0, ground:0, trunk:0, crown:0, postClip:0, minGround:1e9, worst:[] };
function flyAuditNow(){
  var A = flyAud, i, j, a;
  for(i=0;i<flyList.length;i++){ a = flyList[i];
    var B = a.bay, S = FLY_SPEC[a.sp], bad = '';
    if(B && (a.state === 'fly' || a.state === 'walk' || a.state === 'tolip' || a.state === 'crouch')){      /* wingtips against the stall's front posts */
      var e = (a.x-B.px)*B.ox+(a.z-B.pz)*B.oz, q = -(a.x-B.px)*B.oz+(a.z-B.pz)*B.ox;
      if(e < 1.2 && e > -9 && Math.abs(q) < B.w && Math.abs(a.y-B.y-3) < 5 && Math.abs(q) + S.halfSpan*a.size*(1-0.78*a.fold)*Math.abs(Math.cos(a.roll)) > B.w*0.5-0.2) bad = 'postClip';
    }
    if(a.state === 'fly'){
      A.samples++;
      var g = a.y-terrainH(a.x, a.z); if(g < A.minGround) A.minGround = g;
      if(g < 4) bad = 'ground';
      var near = B && Math.hypot(a.x-B.px, a.z-B.pz) < 50;
      for(j=0;j<TOWERS.length;j++){ var W = TOWERS[j];
        if(Math.abs(a.x-W.x) < FLY_TWBOX && Math.abs(a.z-W.z) < FLY_TWBOX && a.y < W.top+FLY_TWCAP){
          if(!(near && B.tower === W && flyBayClear(B, a.x, a.y, a.z))) bad = 'inTower'; } }
      if(!bad && !B && Math.abs(a.x) < FLY_BLOCK && Math.abs(a.z) < FLY_BLOCK && a.y < flyTwTop) bad = 'inBlockCruise';
      if(!bad){ var h = flyHit(a.x, a.y, a.z, 0, -1000, 2.2, null, false); if(h === 3) bad = 'bridge'; else if(h === 1) bad = 'trunk'; else if(h === 4) bad = 'crown'; }
    }
    if(bad){ A[bad]++; if(A.worst.length < 12) A.worst.push([bad, FLY_KEY[a.sp], a.pop, a.state, Math.round(a.x), Math.round(a.y), Math.round(a.z), a.note || a.dest]); }
  }
}
var flyHooks = {
  list:function(){ return flyList.map(function(a){ return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, x:Math.round(a.x), y:Math.round(a.y), z:Math.round(a.z), dest:a.dest }; }); },
  find:function(state, sp, pop){ var out = []; flyList.forEach(function(a){ if((!state || a.state === state) && (sp === undefined || sp === null || FLY_KEY[a.sp] === sp || a.sp === sp) && (!pop || a.pop === pop)) out.push(a.id); }); return out; },
  info:function(id){ var a = flyById(id); if(!a) return null; return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, riderMode:a.riderMode, x:a.x, y:a.y, z:a.z, yaw:a.yaw, pitch:a.pitch, roll:a.roll, yawRate:a.yawRate, v:a.v,
    fold:a.fold, flare:a.flare, amp:a.amp, rem:a.path && a.state === 'fly' ? a.path.len-a.s : null, bayY:a.bay ? a.bay.y : null, bayKind:a.bay ? a.bay.kind : null, dest:a.dest, label:flyDescribe(a) }; },
  forceArrival:function(platName, sp, back){ var a = flySpawnArrival(flyPlatOf(platName), flySpOf(sp), back === undefined ? 60 : back, skyHour(), null); return a ? a.id : null; },
  forceDeparture:function(platName, sp, mode){ var a = flyStartDeparture(flyPlatOf(platName), flySpOf(sp), true, skyHour(), mode || 'far'); return a ? a.id : null; },
  forcePeel:function(){ var n = 0; flyList.forEach(function(a){ if(a.pop === 'circuit'){ a.lapMax = 0; n++; } }); return n; },
  focus:function(id, dist, ang, up){ var a = typeof id === 'number' ? (flyById(id) || flyList[id]) : null; flyFollow = a || null; flyFollowD = dist || 30; flyFollowA = ang === undefined ? 0.9 : ang; flyFollowUp = up === undefined ? 0.22 : up; return a ? flyDescribe(a) : null; },
  /* advance the simulation (no rendering). hour: clock to pretend (default: the sky's); audit: check every animal every 0.5 s */
  skip:function(sec, hour, audit){ var h = hour === undefined || hour === null ? skyHour() : hour, n = Math.ceil(sec/0.5); for(var i=0;i<n;i++){ flySim(sec/n, h); if(audit) flyAuditNow(); } flyRender(0); return flySimT; },
  audit:function(){ flyAuditNow(); return flyAud; },
  auditReset:function(){ flyAud.samples = flyAud.inTower = flyAud.inBlockCruise = flyAud.bridge = flyAud.ground = flyAud.trunk = flyAud.crown = flyAud.postClip = 0; flyAud.minGround = 1e9; flyAud.worst = []; },
  routeTest:function(n, arr){ var out = []; for(var i=0;i<flyBays.length && out.length<n;i+=5){ var B = flyBays[i]; if(!B.ok) continue; flyLastHit = null; var p = flyRoute(B, FLY_A, !!arr, 1, true, null); out.push(p ? 'ok' : flyLastHit); } return out; },
  bayKinds:function(){ var o = { outer:0, slot:0, court:0, blocked:0 }; flyBays.forEach(function(B){ if(!B.ok && B.kind !== 'court') o.blocked++; else o[B.kind]++; }); return o; },
  circuitList:function(){ return flyCircuits.map(function(C){ return { label:C.label, len:Math.round(C.len), want:C.want, now:flyCircuitCount(C), nightOnly:C.nightOnly }; }); },
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
