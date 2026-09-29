/* ============================== monks ======================================
   Owner: "add monks (dressed in grey robes) who go out to monastery fields
   during the day, stop at chapel in the evening, and go to dorms to sleep at
   night. 5 per field, 2 per chicken coop."

   A genuine THREE-phase day, so not the shopkeeper/quarry two-state commute:
   this is the penitents' idea (walk to a stop, idle-wander there, move on to
   the next stop) driven by the CLOCK instead of by a dwell timer, which is
   the one thing the penitents do that the two-state commuters cannot. Phase
   boundaries all come from dayNightHour() (82-daynight.js's shared clock —
   the same source the shopkeepers, quarry laborers and high priest read), not
   a private timer, so dragging the time-of-day slider moves the monks:

     06:00 -> 18:00   'work'    out at their own field / chicken coop
     18:00 -> 22:00   'chapel'  gathered at the chapel door (evening office)
     22:00 -> 06:00   'dorm'    inside a dormitory, hidden (asleep)

   18:00 is SHOPKEEPER_SUNSET, i.e. this world's own sunset, so the evening
   office starts exactly when the rest of the city knocks off; 22:00 is a
   plausible compline, comfortably inside night without being midnight.

   A limitation worth stating rather than hiding: the world clock runs at 5
   real seconds per hour (DAYNIGHT_SEC_PER_HOUR, 82-daynight.js), so a whole
   day is two minutes and the evening office is 20 real seconds long, while
   an unhurried walk across the compound takes longer than that. Monks are
   therefore given the fastest speed in the citizen range (they are crossing
   one precinct, not the city, and are late for the office), and the evening
   window is 4 hours rather than the 2-3 a compline would really run, to make
   the chapel phase genuinely reachable. This is the same characteristic the
   shopkeeper and quarry-laborer commutes already have � over 500+ units they
   cannot finish a leg inside a 60-second half-day either � and the intended
   way to inspect any of it is the time-of-day slider, which pins an hour and
   lets the population converge on it.

   Grey robes: the shared lifePersonGeo/lifePedMesh, retinted per instance
   with setColorAt (GREYC, the same stone-grey family LIFE_PEN_ROBE picks the
   penitents' robes from) — NOT a new humanoid mesh, which would cost a draw
   call this build has no reason to spend. One real caveat, stated rather
   than hidden: the tint is a MULTIPLY over the geometry's baked vertex
   colours, so a monk's head and hands go grey along with the robe. The
   alternative (the penitents' own trick of baking the robe colour into a
   dedicated geometry) is exactly the extra mesh + draw call being avoided. */
var MONK_WORK_START = 6, MONK_CHAPEL_START = 18, MONK_DORM_START = 22;
function lifeMonkPhase(hr){
  if(hr >= MONK_CHAPEL_START && hr < MONK_DORM_START) return 'chapel';
  if(hr >= MONK_WORK_START && hr < MONK_CHAPEL_START) return 'work';
  return 'dorm';
}
(function(){
  if(!LIFE_MONK_N) return;
  var phase0 = lifeMonkPhase(dayNightHour());
  var slot = 0, dorms = MONASTERY_SITES.dorms;
  var chapel = MONASTERY_SITES.chapelDoor;
  if(!chapel || !dorms.length) return;
  function addMonk(work){
    var d = dorms[slot % dorms.length];
    LIFE_PEDS[LIFE_MONK_BASE + slot] = {
      monk: true,
      work: work, dorm: { x:d.x, z:d.z, ry:d.ry },
      /* each monk's own standing spot at the chapel: a shallow arc in front
         of the door rather than one shared point, so the evening office
         reads as a congregation */
      chapelSpot: { x: chapel.x + Math.cos(slot*0.7)*(3 + (slot%5)*1.6),
                    z: chapel.z + Math.sin(slot*0.7)*(3 + (slot%5)*1.6), ry: chapel.ry },
      /* same plinth problem as the compound workers above: the abbey is
         built on one flat yb across a footprint whose real terrain spans
         ~12 units, and its field slabs sit 0.30 above that. */
      floorY: MONASTERY_SITES.y + 0.30,
      state: phase0, stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(3.0,4.0)
    };
    slot++;
  }
  /* 5 per field, laid out across the plot's own rectangle (its recorded
     half-extents and the compound's ry), so a field really does read as
     five monks working it rather than five stacked on its centre. */
  MONASTERY_SITES.fields.forEach(function(f){
    for(var k=0;k<LIFE_MONK_PER_FIELD;k++){
      var u = (k - (LIFE_MONK_PER_FIELD-1)/2) / Math.max(1, LIFE_MONK_PER_FIELD-1) * 1.5;
      var v = (k%2 ? 0.45 : -0.45);
      var p = loc(f.x, f.z, u*f.hw, v*f.hz, f.ry);
      addMonk({ x:p[0], z:p[1] });
    }
  });
  /* 2 per chicken coop, either side of the run's own tending corner */
  MONASTERY_SITES.coops.forEach(function(c){
    for(var k=0;k<LIFE_MONK_PER_COOP;k++){
      var p = loc(c.x, c.z, (k?1.8:-1.8), (k?1.2:-1.2), c.ry);
      addMonk({ x:p[0], z:p[1] });
    }
  });
  window._monks = { n: slot, base: LIFE_MONK_BASE,
                    fields: MONASTERY_SITES.fields.length, perField: LIFE_MONK_PER_FIELD,
                    coops: MONASTERY_SITES.coops.length, perCoop: LIFE_MONK_PER_COOP,
                    dorms: dorms.length,
                    hours: { work: MONK_WORK_START, chapel: MONK_CHAPEL_START, dorm: MONK_DORM_START } };
})();

/* per-instance colour on the shared pedestrian mesh. setColorAt allocates
   instanceColor ZERO-filled the first time it is called (checked directly in
   this build's own three.min.js, not assumed), so every ordinary pedestrian —
   and the trailing strider-rider slots 79-striders.js drives directly — must
   be set to white first or they would all render black. Done once, at init,
   before the first frame, so the material still compiles with
   USE_INSTANCING_COLOR present. No new mesh, no new draw call. */
(function(){
  if(!LIFE_MONK_N) return;
  var white = new THREE.Color(0xffffff), robe = new THREE.Color(GREYC[2]);
  for(var i=0;i<LIFE_PED_N;i++) lifePedMesh.setColorAt(i, white);
  for(var m=0;m<LIFE_MONK_N;m++) lifePedMesh.setColorAt(LIFE_MONK_BASE+m, robe);
  if(lifePedMesh.instanceColor) lifePedMesh.instanceColor.needsUpdate = true;
  if(window._monks){ window._monks.robe = '#'+robe.getHexString();
                     window._monks.tinted = !!lifePedMesh.instanceColor; }
})();

/* a shopkeeper's own 4-state commute — separate from the rambling-
   pedestrian branch below since it's keyed to the clock, not a
   destination-pool pick. 'atHome': idle indoors (hidden, scale0 — same
   convention 'boarded' below uses for "not on scene"). 'atStall':
   idle-wander right behind the counter, same small-radius idea as the
   clergy/penitent idle posts. 'toStall'/'toHome': the ordinary
   lifePedBuildLeg walk, identical mechanic to 'walk' below. */
function updateShopkeeper(cz, idx){
  var hr = dayNightHour();
  var wantStall = (hr >= SHOPKEEPER_SUNRISE && hr < SHOPKEEPER_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantStall){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.stall.x, cz.stall.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toStall'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atStall'){
    var wander = idx*1.3 + cz.stateT*0.5;
    var hx = cz.stall.x + Math.sin(wander)*1.0, hz = cz.stall.z + Math.cos(wander*0.7)*1.0;
    lifePedTmpPos.set(hx, Math.max(LIFE_Y, lifeGroundY(hx,hz)+0.15), hz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, cz.stall.ry||0);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantStall){
      cz.curve = lifePedBuildLeg(cz.stall.x, cz.stall.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  /* 'toStall' / 'toHome' */
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw = Math.min(1, cz.stateT/cz.dur);
  var t = raw*raw*(3-2*raw);
  cz.curve.getPointAt(t, lifePedTmpPos);
  lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
  var tTan = Math.min(0.995, Math.max(0.005, t));
  cz.curve.getTangentAt(tTan, lifePedTmpDir);
  var yaw = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw >= 1){ cz.state = (cz.state === 'toStall') ? 'atStall' : 'atHome'; cz.stateT = 0; cz.dur = 0; }
}
/* a quarry laborer's own 4-state commute — verbatim the same shape as
   updateShopkeeper() just above (home <-> work site instead of
   home <-> stall), not a new mechanism: 'atHome' idle indoors,
   'atWork' idle-wander at the quarry site itself (same small-radius
   idea), 'toWork'/'toHome' the ordinary lifePedBuildLeg walk. */
function updateQuarryLaborer(cz, idx){
  var hr = dayNightHour();
  var wantWork = (hr >= QUARRY_SUNRISE && hr < QUARRY_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantWork){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.work.x, cz.work.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toWork'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atWork'){
    var wander = idx*1.3 + cz.stateT*0.5;
    var hx = cz.work.x + Math.sin(wander)*2.2, hz = cz.work.z + Math.cos(wander*0.7)*2.2;
    lifePedTmpPos.set(hx, Math.max(LIFE_Y, lifeGroundY(hx,hz)+0.15), hz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantWork){
      cz.curve = lifePedBuildLeg(cz.work.x, cz.work.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  /* 'toWork' / 'toHome' */
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw2 = Math.min(1, cz.stateT/cz.dur);
  var t2 = raw2*raw2*(3-2*raw2);
  cz.curve.getPointAt(t2, lifePedTmpPos);
  lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
  var tTan2 = Math.min(0.995, Math.max(0.005, t2));
  cz.curve.getTangentAt(tTan2, lifePedTmpDir);
  var yaw2 = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw2);
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw2 >= 1){ cz.state = (cz.state === 'toWork') ? 'atWork' : 'atHome'; cz.stateT = 0; cz.dur = 0; }
}
/* a compound garden worker: literally updateQuarryLaborer's own shape with
   'atHome' pointed at the compound building's front step and 'atWork' at
   that worker's own spot in the garden. Kept as its own function rather than
   a flag on the quarry one only because the two populations' hour pairs are
   independent constants — the behaviour is deliberately identical. */
function updateCompoundWorker(cz, idx){
  var hr = dayNightHour();
  var wantWork = (hr >= COMPOUND_WORKER_SUNRISE && hr < COMPOUND_WORKER_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantWork){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.work.x, cz.work.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toWork'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atWork'){
    /* tending: a tight stoop-and-shuffle round the bed, a much smaller
       radius than the quarry's, since a garden bed is a small thing */
    var wander = idx*1.3 + cz.stateT*0.45;
    var gx = cz.work.x + Math.sin(wander)*1.1, gz = cz.work.z + Math.cos(wander*0.7)*1.1;
    lifePedTmpPos.set(gx, lifePedFloorY(cz, gx, gz), gz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantWork){
      cz.curve = lifePedBuildLeg(cz.work.x, cz.work.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  lifePedWalkLeg(cz, idx, (cz.state === 'toWork') ? 'atWork' : 'atHome');
}

/* the shared "advance along cz.curve, face the tangent, arrive" body the
   walking half of every clock-driven commuter above runs. Factored out here
   (rather than copied a fourth time) when the monks needed a THREE-way
   arrival — 'toField'/'toChapel'/'toDorm' cannot be expressed by the
   two-way ternary the shopkeeper/quarry versions end with. */
/* ground height for a figure standing on a built precinct's own floor:
   lifeGroundY() handles causeways, bridges, canton decks and piers, but a
   walled compound's plinth is none of those, so anyone inside one needs the
   plinth level as a floor under the terrain answer. cz.floorY is set only by
   the two populations that live inside such a precinct; everyone else is
   unaffected. */
function lifePedFloorY(cz, x, z){
  var g = lifeGroundY(x, z) + 0.15;
  return Math.max(LIFE_Y, cz.floorY ? Math.max(g, cz.floorY) : g);
}
function lifePedWalkLeg(cz, idx, arriveState){
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw = Math.min(1, cz.stateT/cz.dur);
  var t = raw*raw*(3-2*raw);
  cz.curve.getPointAt(t, lifePedTmpPos);
  lifePedTmpPos.y = lifePedFloorY(cz, lifePedTmpPos.x, lifePedTmpPos.z);
  var tTan = Math.min(0.995, Math.max(0.005, t));
  cz.curve.getTangentAt(tTan, lifePedTmpDir);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z));
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw >= 1){ cz.state = arriveState; cz.stateT = 0; cz.dur = 0; }
}

/* a monk's own day: three CLOCK-driven posts (field or coop / chapel door /
   dormitory) with a walk between each, rather than the two-state commute
   the shopkeepers and quarry laborers run. The posted states are the
   penitents' own idle-wander primitive; the transitions are driven by
   lifeMonkPhase(dayNightHour()) so the time-of-day slider moves them.
   'dorm' hides the instance (scale0), the same "not on scene" convention
   'atHome'/'boarded' already use — monks are asleep indoors at night. */
function lifeMonkPost(cz){
  return cz.state === 'chapel' ? cz.chapelSpot : (cz.state === 'work' ? cz.work : cz.dorm);
}
function updateMonk(cz, idx){
  var want = lifeMonkPhase(dayNightHour());
  if(cz.state === 'work' || cz.state === 'chapel'){
    var post = lifeMonkPost(cz);
    /* at the chapel they stand near-still on a fixed heading derived from
       the chapel's own ry (the same shorthand updateShopkeeper's 'atStall'
       uses � loc()'s ry and the walk's atan2(dir.x,dir.z) yaw are different
       conventions, so this is a consistent crowd facing, not a door-accurate
       one); in the fields they work a small patch, so only the field post
       actually wanders. */
    var atChapel = (cz.state === 'chapel');
    var wander = idx*1.3 + cz.stateT*(atChapel ? 0.12 : 0.5);
    var r = atChapel ? 0.35 : 1.5;
    var mx = post.x + Math.sin(wander)*r, mz = post.z + Math.cos(wander*0.7)*r;
    lifePedTmpPos.set(mx, lifePedFloorY(cz, mx, mz), mz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, atChapel ? (post.ry||0) + Math.PI : wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(want !== cz.state) lifeMonkDepart(cz, post, want);
    return;
  }
  if(cz.state === 'dorm'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(want !== 'dorm') lifeMonkDepart(cz, cz.dorm, want);
    return;
  }
  /* 'toWork' / 'toChapel' / 'toDorm' */
  lifePedWalkLeg(cz, idx, cz.state === 'toWork' ? 'work' : (cz.state === 'toChapel' ? 'chapel' : 'dorm'));
}
function lifeMonkDepart(cz, from, want){
  var to = want === 'chapel' ? cz.chapelSpot : (want === 'work' ? cz.work : cz.dorm);
  cz.curve = lifePedBuildLeg(from.x, from.z, to.x, to.z);
  cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
  cz.state = want === 'chapel' ? 'toChapel' : (want === 'work' ? 'toWork' : 'toDorm');
  cz.stateT = 0;
}
function updatePedestrians(dt){
  LIFE_PED_T += dt;
  LIFE_PEDS.forEach(function(cz, idx){
    if(!cz){ LIFE_PEDS[idx] = lifePedSpawn(); return; }
    cz.stateT += dt;
    if(cz.shopkeeper){ updateShopkeeper(cz, idx); return; }
    if(cz.quarryLaborer){ updateQuarryLaborer(cz, idx); return; }
    if(cz.compoundWorker){ updateCompoundWorker(cz, idx); return; }
    if(cz.monk){ updateMonk(cz, idx); return; }
    if(cz.state === 'boarded'){
      lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      return;
    }
    if(cz.state === 'queued'){
      /* stand and wait at the dock — visible, not moving; lifeFerryBoard
         (above) is what promotes this to 'boarded' when a ferry actually
         has room. */
      lifePedTmpPos.set(cz.destDoor.x, Math.max(LIFE_Y, lifeGroundY(cz.destDoor.x, cz.destDoor.z) + 0.15), cz.destDoor.z);
      lifePedTmpQuat.setFromAxisAngle(LIFE_UP, cz.destDoor.ry || 0);
      lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      return;
    }
    if(cz.state === 'hangout'){
      var wander = cz.stateT*0.6 + idx*1.7;
      var hoX = cz.destDoor.x + Math.sin(wander)*2.2, hoZ = cz.destDoor.z + Math.cos(wander*0.7)*2.2;
      lifePedTmpPos.set(hoX, Math.max(LIFE_Y, lifeGroundY(hoX, hoZ) + 0.15), hoZ);
      lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
      lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      if(LIFE_PED_T >= cz.hangUntil){
        var wasCat = cz.destDoor.cat;
        cz.destDoor.active--;
        var nextLeg = lifePedRambleTarget(cz.destDoor.x, cz.destDoor.z, wasCat);   /* door-transit rule — see lifePedRambleTarget */
        if(nextLeg){
          var next = nextLeg.dest;
          next.active++;
          cz.curve = nextLeg.curve;
          cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
          cz.destDoor = next; cz.state = 'walk'; cz.stateT = 0;
        }else{
          LIFE_PEDS[idx] = lifePedSpawn();
        }
      }
      return;
    }
    /* 'walk' */
    if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
    var raw = Math.min(1, cz.stateT/cz.dur);
    var t = raw*raw*(3-2*raw);
    cz.curve.getPointAt(t, lifePedTmpPos);
    lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cz.curve.getTangentAt(tTan, lifePedTmpDir);
    var yaw = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(raw >= 1){
      var dest = cz.destDoor;
      dest.entryCount++;
      if(dest.cat === 'market' || dest.cat === 'park' || dest.cat === 'shrine'){
        cz.state = 'hangout'; cz.stateT = 0; cz.hangUntil = LIFE_PED_T + rr(8,20);
      }else if(dest.cat === 'dock' || dest.cat === 'strider'){
        dest.queueCount = (dest.queueCount||0) + 1;
        cz.state = 'queued'; cz.stateT = 0;
      }else{
        dest.active--;
        LIFE_PEDS[idx] = lifePedSpawn();
      }
    }
  });
  lifePedMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== citizens: penitents =========================
   5 groups of 3 — a flagellant, a banner-bearer, one reading a book of
   scripture — walking a CLOSED loop between the Temple and every shrine
   (the two original island ones plus the 3 new standalone ones just added
   to LIFE_SHRINE_STOPS in 65-facade.js) and nowhere else: never a market,
   park, dock or shop like the rambling pedestrians above. Grey robes.
   Reuses lifePedBuildLeg (land height + canton/causeway-aware ground,
   already correct) for the walk, and a walk/pray state machine that's the
   clergy's own idle-post idea (LIFE_CLERGY_POSTS/updateClergy above)
   applied to a MOVING post instead of a fixed one: walk to a stop, stand
   and idle-wander there a while ("pray"), pick a new stop, repeat.

   Group, not individuals: all 3 members of a group share ONE curve/timing
   and just carry a fixed lateral offset (loc()'s own local x/z convention,
   same as everywhere else in this file), so they read as a small
   procession rather than 3 unrelated wanderers who happen to overlap.

   ONE shared InstancedMesh/draw call for all 15 — a real Three.js
   constraint, not an oversight: an InstancedMesh's geometry is ONE buffer
   shared by every instance, so only the per-instance 4x4 transform (and,
   via setColorAt below, a per-instance colour multiply — the exact
   mechanism 45-kit.js's own emitBuckets() already uses for the entire
   static bake) can vary per instance; the SHAPE cannot. Three fully
   distinct silhouettes would need three separate meshes/draw calls, which
   this session's already-tight BUDGET.drawCalls (05-palette.js) can't
   absorb for a 15-strong population. Splits the difference: the held
   item is baked pure white on the shared geometry, then setColorAt tints
   it MARBLEC[2] (the same pale marble alias the funerary temple uses) for
   the banner role only, so that role gets a real, distinct pale banner;
   the flagellant and book-reader keep the plain white item and read
   identically to each other. Documented simplification, not a miss — the
   same trade already made twice in this file (the ordinator officer's
   plume, the clergy priest/templar split), both real geometry, no spare
   draw call to tell every role apart. `role` is still real per-instance
   DATA either way, same "data now" pattern as those two. */
var LIFE_PEN_ROBE = pick(GREYC);
var lifePenitentHullParts = [
  { geo: new THREE.CylinderGeometry(0.28*LIFE_PEOPLE_SCALE, 0.44*LIFE_PEOPLE_SCALE, 1.2*LIFE_PEOPLE_SCALE, 7), color: LIFE_PEN_ROBE },
  { geo: new THREE.BoxGeometry(0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE).translate(0, 0.80*LIFE_PEOPLE_SCALE, 0), color: LIFE_SKIN },
  { geo: new THREE.ConeGeometry(0.24*LIFE_PEOPLE_SCALE, 0.30*LIFE_PEOPLE_SCALE, 6).translate(0, 1.00*LIFE_PEOPLE_SCALE, 0), color: shade(LIFE_PEN_ROBE,-0.22) },
  /* the held item — book / furled banner / flail, all baked white so the
     per-instance colour above can turn just the banner role's copy pale */
  { geo: new THREE.BoxGeometry(0.05*LIFE_PEOPLE_SCALE, 0.5*LIFE_PEOPLE_SCALE, 0.34*LIFE_PEOPLE_SCALE).translate(0.30*LIFE_PEOPLE_SCALE, 0.62*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifePenitentGeo = lifeMergeGeoms(lifePenitentHullParts);
var LIFE_PEN_GROUPS = 5, LIFE_PEN_PER = 3, LIFE_PEN_N = LIFE_PEN_GROUPS*LIFE_PEN_PER;
var LIFE_PEN_ROLES = ['flagellant','banner','book'];
var LIFE_PEN_SIDE = [-1.15, 0, 1.15];   /* flagellant left, banner centre, book right of the group's own line of travel */
var lifePenitentMesh = new THREE.InstancedMesh(lifePenitentGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PEN_N);
lifePenitentMesh.userData.life = true; lifePenitentMesh.userData.inspectLabel = 'Penitent pilgrim';
lifePenitentMesh.frustumCulled = false;
scene.add(lifePenitentMesh);

/* the closed stop pool: the Temple canton's own door(s) (LIFE_DOORS' own
   'temple' category, built above from window._plinthDoors) plus every
   shrine, old and new — LIFE_SHRINE_STOPS already carries all 5 by this
   point in file order (65-facade.js runs before this file, and the 3
   standalone ones are appended there before this file ever reads the
   array). Falls back to the high priest's own Temple rest point
   (LIFE_HIGHPRIEST_REST is defined just above, in the clergy section) if
   LIFE_DOORS somehow has no 'temple' entry, so this can never end up with
   too few stops to form a loop. Falls back to the Temple canton's own
   CPIERS entry directly (NOT LIFE_HIGHPRIEST_REST — that's defined further
   down, in the clergy section below this one, so referencing it here would
   be a forward reference to an undefined var at this point in file order;
   CPIERS is real layout data from 30-layout.js, long since loaded). */
var LIFE_PEN_STOPS = LIFE_DOORS.filter(function(d){ return d.cat === 'temple'; })
  .map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; })
  .concat(LIFE_SHRINE_STOPS.map(function(s){ return { x:s.x, z:s.z, ry:s.ry }; }));
if(!LIFE_PEN_STOPS.length){
  var lifePenTempleFallback = CPIERS.filter(function(p){ return p.canton === 'Temple'; })[0];
  if(lifePenTempleFallback) LIFE_PEN_STOPS.push({ x:lifePenTempleFallback.x1, z:lifePenTempleFallback.z1, ry:lifePenTempleFallback.ry });
}
function lifePenPickStop(exclude){
  var pool = LIFE_PEN_STOPS.filter(function(s){ return s !== exclude; });
  return pick(pool.length ? pool : LIFE_PEN_STOPS);
}

var LIFE_PEN_GROUPS_ARR = [];
(function(){
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    var origin = pick(LIFE_PEN_STOPS);
    var dest = lifePenPickStop(origin);
    var curve = lifePedBuildLeg(origin.x, origin.z, dest.x, dest.z);
    var grp = {
      curve: curve, len: curve.getLength(), dur: 0,
      speed: rr(1.7, 2.3), state: 'walk', stateT: 0,
      destStop: dest, prayFor: rr(8, 16)
    };
    grp.dur = Math.max(4, grp.len/grp.speed);
    grp.stateT = rr(0, grp.dur);   /* stagger the 5 groups so they don't all set off together */
    LIFE_PEN_GROUPS_ARR.push(grp);
  }
})();
window._penitents = { groups: LIFE_PEN_GROUPS_ARR.length, total: LIFE_PEN_N, stops: LIFE_PEN_STOPS.length };   /* diagnostic */

/* per-instance colour: identity (white) for flagellant/book, MARBLEC[2]
   (pale marble) for the banner role — set once at init, same setColorAt
   mechanism 45-kit.js's own emitBuckets() already exercises for the whole
   static bake, so it's proven to combine correctly with vertexColors. */
(function(){
  var white = new THREE.Color(0xffffff), pale = new THREE.Color(MARBLEC[2]);
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    for(var r=0; r<LIFE_PEN_PER; r++){
      lifePenitentMesh.setColorAt(g*LIFE_PEN_PER+r, LIFE_PEN_ROLES[r]==='banner' ? pale : white);
    }
  }
  if(lifePenitentMesh.instanceColor) lifePenitentMesh.instanceColor.needsUpdate = true;
})();

var lifePenTmpPos = new THREE.Vector3(), lifePenTmpDir = new THREE.Vector3();
var lifePenTmpQuat = new THREE.Quaternion(), lifePenTmpMat = new THREE.Matrix4();
var lifePenTmpScale1 = new THREE.Vector3(1,1,1), lifePenTmpPos2 = new THREE.Vector3();
function updatePenitents(dt){
  LIFE_PEN_GROUPS_ARR.forEach(function(grp, gi){
    grp.stateT += dt;
    var px, pz, yaw;
    if(grp.state === 'pray'){
      /* idle-wander in place — the same primitive the rambling
         pedestrians' own 'hangout' state and the clergy's own posted
         idle-wander both already use, just centred on this group's
         current stop instead of a fixed post. */
      var wander = grp.stateT*0.5 + gi*2.1;
      px = grp.destStop.x + Math.sin(wander)*1.4;
      pz = grp.destStop.z + Math.cos(wander*0.7)*1.4;
      yaw = wander;
      if(grp.stateT >= grp.prayFor){
        var next = lifePenPickStop(grp.destStop);
        grp.curve = lifePedBuildLeg(grp.destStop.x, grp.destStop.z, next.x, next.z);
        grp.len = grp.curve.getLength(); grp.dur = Math.max(4, grp.len/grp.speed);
        grp.destStop = next; grp.state = 'walk'; grp.stateT = 0;
      }
    }else{
      if(grp.dur === 0) grp.dur = Math.max(4, grp.len/grp.speed);
      var raw = Math.min(1, grp.stateT/grp.dur);
      var t = raw*raw*(3-2*raw);
      grp.curve.getPointAt(t, lifePenTmpPos);
      px = lifePenTmpPos.x; pz = lifePenTmpPos.z;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      grp.curve.getTangentAt(tTan, lifePenTmpDir);
      yaw = Math.atan2(lifePenTmpDir.x, lifePenTmpDir.z);
      if(raw >= 1){ grp.state = 'pray'; grp.stateT = 0; grp.prayFor = rr(8,16); }
    }
    for(var r=0; r<LIFE_PEN_PER; r++){
      var off = loc(px, pz, LIFE_PEN_SIDE[r], 0, yaw);
      var gy = Math.max(LIFE_Y, lifeGroundY(off[0], off[1]) + 0.15);
      lifePenTmpPos2.set(off[0], gy, off[1]);
      lifePenTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifePenTmpMat.compose(lifePenTmpPos2, lifePenTmpQuat, lifePenTmpScale1);
      lifePenitentMesh.setMatrixAt(gi*LIFE_PEN_PER+r, lifePenTmpMat);
    }
  });
  lifePenitentMesh.instanceMatrix.needsUpdate = true;
}

