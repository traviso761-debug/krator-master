/* ============================== PINNACLE ROCK — the flyers' starting population and circuits ==============================
   In place of Girder's 84c "initial population" (its loops round the four-tower block and along the brook): every bay
   proved to have a clean approach and a clean way out, about half of them with a beast perched (the Wings' own: the
   Quetzal's fins hold quetzals first, the Nightwing's bats), and the loops this rock wants: the Wings' circuit round the
   rim over the fins, the high circuit over the Garden's spires, the run along the dry gorge, the canopy patrol, the
   high patrol and the bats' night hunt round the Garden. Then Girder's own: transients, arrivals in flight, departures. */
var flyLegs = [], flyUsable = 0;
/* the high sorties: north toward the Inner Wall, and toward the gas giant (the sky's) */
FLY_SORTIES = [ { name:'the Inner Wall', x:0, z:-1 }, (function(){ var x = typeof giantDir !== 'undefined' ? giantDir.x : .7, z = typeof giantDir !== 'undefined' ? giantDir.z : -.7, l = Math.hypot(x, z) || 1; return { name:'the gas giant', x:x/l, z:z/l }; })() ];
/* EACH WING'S BEASTS IN ITS OWN STALLS (owner, 2026-10-19): the Quetzal's fins hold quetzalcoatlus, the Wingclaw's
   archaeopteryx, the Nightwing's bats; the Garden's roosts the three. No dragonflies on the roosts: the Dragonfly tribe's
   beasts live by water and camp on the floor (PLAN.md section 1); they fly the circuits and pass over. Girder's
   flyFreeBays and flySpawnArrival (84b) are wrapped here so arrivals and peel-offs keep to it: a bay takes only its own */
var FLY_ALLOW = { quetzal:[FLY_Q], wingclaw:[FLY_A], nightwing:[FLY_B], garden:[FLY_Q, FLY_A, FLY_B] };
flyBays.forEach(function(B){ B.allow = FLY_ALLOW[B.plat.wing] || FLY_ALLOW.garden; });
var _flyFreeBaysGirder = flyFreeBays;
flyFreeBays = function(plat, sp){ return _flyFreeBaysGirder(plat, sp).filter(function(B){ return sp == null || B.allow.indexOf(sp) >= 0; }); };
/* an arrival: a free bay first, then one of the beasts it takes, weighted by the hour as Girder's flyPickSp weights them */
flySpawnArrival = function(plat, spForce, startBack, hour, sortie){
  var forced = !(spForce === undefined || spForce === null), free = flyFreeBays(plat, forced ? spForce : null); if(!free.length) return null;
  for(var tr=0; tr<(startBack !== null ? 12 : 4); tr++){
    var B = free[Math.floor(Math.random()*free.length)], sp = spForce;
    if(!forced){ var L = B.allow.filter(function(s){ return !(sortie && s === FLY_B); }); if(!L.length) continue;
      var w = L.map(function(s){ return flyHourW(s, hour, true)*(s === FLY_Q ? 2.2 : 1); }), t = Math.random()*w.reduce(function(a, b){ return a+b; }, 0);
      sp = L[L.length-1]; for(var i=0;i<L.length;i++){ t -= w[i]; if(t <= 0){ sp = L[i]; break; } } }
    var path = flyRoute(B, sp, true, 4, startBack !== null && startBack < 200, sortie); if(!path) continue;
    var a = flyNew(sp, sortie ? true : sp === FLY_B ? Math.random() < 0.3 : Math.random() < 0.75); if(!a) return null;
    a.pop = 'arr'; a.bay = B; B.reserved = true; a.path = path; a.dest = B.plat.name; a.note = sortie ? 'back from a sortie toward ' + sortie.name : '';
    a.s = startBack !== null ? Math.max(0, path.straight-startBack) : 0; flyPlaceOnPath(a); flySnapHeading(a);
    return a;
  }
  return null;
};
(function(){
  var okBays = [];
  flyBays.forEach(function(B){
    if(!B.ok) return;
    var sp0 = B.allow[0], p = flyRoute(B, sp0, true, 10, false, null), d = p && flyRoute(B, sp0, false, 10, false, null);
    if(!p || !d){ B.ok = false; flyPathStats.blockedBays++; return; }
    okBays.push(B); B.testCurve = p.curve; B.testDep = d.curve;
  });
  flyUsable = flyPathStats.usableBays = okBays.length;
  var stride = Math.max(1, Math.floor(okBays.length/30));
  okBays.forEach(function(B, i){
    if(i%stride === 0 && flyLegs.length < 60){ flyLegs.push({ name:'arr '+B.plat.name+' #'+B.id, curve:B.testCurve }); flyLegs.push({ name:'dep '+B.plat.name+' #'+B.id, curve:B.testDep }); }
    B.testCurve = B.testDep = null;
  });
  /* about half the bays with one of their own beasts perched */
  var rslots = 0;
  flyBays.forEach(function(B){
    if(!B.ok || flyRand() > 0.55) return;
    var sp = B.allow[Math.floor(flyRand()*B.allow.length)];
    var a = flyNew(sp, false); if(!a) return;
    flyPerchNow(a, B);
    a.saddled = flyRand() < 0.45 && rslots < FLY_RCAP-50; if(a.saddled) rslots++;
    if(a.saddled && flyRand() < 0.25){ a.riderMode = 2; a.riderT = 20+flyRand()*200; a.lance = flyRand() < 0.4; }
    a.hyT = 5+flyRand()*60;
  });
  var top = MESA_B.top, gtop = GARDEN_B ? GARDEN_B.top : top+55, spire = 0;
  ROCK.forEach(function(S){ if(/^garden-/.test(S.id)) spire = Math.max(spire, S.top); });
  flyAddCircuit(flyMakeCircuit(0, 0, 690, 780, top+55, top+90, 10, 0.32, 18), 3, [FLY_Q, FLY_A, FLY_Q], 'Rim circuit (over the fins)', { lap:[150, 400] });
  flyAddCircuit(flyMakeCircuit(0, 10, 180, 260, spire+25, spire+60, 9, 0.15, 16), 3, [FLY_A, FLY_D, FLY_A], 'Garden circuit (over the spires)', { lap:[150, 400] });
  flyAddCircuit(flyGorgeLoop(), 3, [FLY_D, FLY_A, FLY_D], 'Gorge run', { lap:[200, 500] });
  flyAddCircuit(flyMakeCircuit(0, 0, 1000, 1300, flyTopY+30, flyTopY+70, 10, 0.4, 24), 3, [FLY_Q], 'Canopy patrol', { wing:true, lap:[260, 600] });
  flyAddCircuit(flyMakeCircuit(0, 0, 1400, 1700, spire+80, spire+140, 10, 0.5, 30), 3, [FLY_A], 'High patrol', { wing:true, lap:[300, 700] });
  flyAddCircuit(flyMakeCircuit(0, 10, 255, 320, gtop+80, gtop+130, 9, 0.12, 20), 4, [FLY_B], 'Night hunt', { nightOnly:true, lap:[90, 300] });
})();
/* along the gorge 50-90 m over its floor (over the remnant trees), a teardrop turn at each end, back along the other side a little higher
   (Girder's brook loop, flyMakeBrookLoop, on the gorge's line) */
function flyGorgeLoop(){
  var sA = 250, sB = RIVER_LEN-250;
  for(var tr=0; tr<24; tr++){
    var offEnd = 40-tr*1.2, off0 = 9+flyRand()*5, h0 = 52+flyRand()*14, h1 = h0+12+flyRand()*10, step = 80, pts = [], side, i, n = Math.floor((sB-sA)/step);
    for(side=0; side<2; side++) for(i=0;i<=n;i++){
      var ii = side ? n-i : i, ss = sA+ii*step, p0 = riverAt(ss), p1 = riverAt(Math.min(RIVER_LEN, ss+10)), tx = p1.x-p0.x, tz = p1.z-p0.z, tl = Math.hypot(tx, tz) || 1;
      var endK = Math.max(smooth(3, 0, ii), smooth(n-3, n, ii)), off = mix(off0, offEnd, endK)*(side ? -1 : 1);
      pts.push(new THREE.Vector3(p0.x-tz/tl*off, riverLevel(ss)+(side ? h1 : h0)+(flyRand()-0.5)*4, p0.z+tx/tl*off)); }
    var path = flyLoopFromCurve(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 7, 18, 14);
    if(path) return path;
  }
  return null;
}
flyRand = Math.random;
(function(){
  var h0 = skyHour();
  for(var i=0;i<FLY_TRANSIENTS;i++) flySpawnTransient(true, h0);
  for(i=0;i<6;i++){ var a = flySpawnArrival(null, null, null, h0, null); if(a){ a.s = Math.random()*Math.max(0, a.path.len-450); a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a); } }
  for(i=0;i<3;i++) flyStartDeparture(null, null, true, h0, 'far');
})();
