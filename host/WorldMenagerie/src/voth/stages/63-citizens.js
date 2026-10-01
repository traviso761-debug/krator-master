/* ==== citizens: rambling pedestrians ==== */
var LIFE_CITIZEN_ID = 0;
var LIFE_HOUR_BEHAVIOR = new Array(24).fill(null);   /* reserved for day/night — do not read yet */
function lifeCitizenRace(){ return chance(0.88) ? 'dunmer' : 'human'; }

var LIFE_DOORS = [];
(function(){

  PLACED.forEach(function(o){
    if(o.tag !== 'town' && o.tag !== 'compound') return;
    var dp = loc(o.x, o.z, o.fx, 0, o.ry);
    var cat, cap;
    if(o.tag === 'compound'){ cat = 'compound'; cap = 12; }
    else if(o.poor){ cat = 'slum'; cap = 2; }
    else if(zoneAt(o.x,o.z) === 'manor'){ cat = 'manor'; cap = 6; }
    else{ cat = 'shop'; cap = 3; }
    LIFE_DOORS.push({ x:dp[0], z:dp[1], ry:o.ry, cat:cat, cap:cap, active:0, entryCount:0 });
  });

  var CANTON_CAT = { Market:'market', Arena:'arena', Temple:'temple', Ancestry:'park', Guild:'shop',
                      Port:'shop', Arsenal:'shop', Foreign:'shop', Granary:'shop' };
  (window._plinthDoors || []).forEach(function(pd){
    var best = null, bd = 1e18;
    CANTONS.forEach(function(c){ var d = Math.hypot(pd.x-c.x, pd.z-c.z); if(d<bd){ bd=d; best=c; } });
    if(!best) return;
    var cat = CANTON_CAT[best.n];
    if(!cat) return;
    LIFE_DOORS.push({ x:pd.x, z:pd.z, ry:pd.angle||0, cat:cat, cap:3, active:0, entryCount:0, canton:best.n });
  });

  DISTRICTS.forEach(function(d){
    if(d.type !== 'market' && d.type !== 'park') return;
    var c = lifePolyCentroid(d.poly);
    LIFE_DOORS.push({ x:c[0], z:c[1], ry:0, cat:d.type, cap:14, active:0, entryCount:0 });
  });

  LIFE_SHRINE_STOPS.forEach(function(s){
    LIFE_DOORS.push({ x:s.x, z:s.z, ry:s.ry, cat:'shrine', cap:8, active:0, entryCount:0 });
  });

  if(GUILD_MARKET_DOOR){
    LIFE_DOORS.push({ x:GUILD_MARKET_DOOR.x, z:GUILD_MARKET_DOOR.z, ry:GUILD_MARKET_DOOR.ry||0,
      cat:'guildmarket', cap:6, active:0, entryCount:0, canton:'Guild' });
  }

  (typeof GUILD_HALL_DOORS !== 'undefined' ? GUILD_HALL_DOORS : []).forEach(function(d){
    LIFE_DOORS.push({ x:d.x, z:d.z, ry:d.ry||0, cat:'guildhall', cap:4, active:0, entryCount:0, canton:d.canton });
  });
})();

var LIFE_DOOR_BY_STOPNAME = {};
LIFE_FERRY_STOPS.forEach(function(s){
  var d = { x:s.x, z:s.z, ry:s.ry, cat:'dock', cap:99, active:0, entryCount:0, queueCount:0 };
  LIFE_DOORS.push(d);
  LIFE_DOOR_BY_STOPNAME[s.name] = d;
});

if(typeof LIFE_STRIDER_STATIONS !== 'undefined'){
  LIFE_STRIDER_STATIONS.forEach(function(s){ LIFE_DOORS.push(s); });
}

if(typeof TAVERNS_PLACED !== 'undefined'){
  TAVERNS_PLACED.forEach(function(t){
    LIFE_DOORS.push({ x:t.doorX, z:t.doorZ, ry:t.ry, cat:'tavern', cap:6, active:0, entryCount:0 });
  });
}
window._doors = LIFE_DOORS;   /* diagnostic */

var LIFE_PED_CAT_ORDER = ['market','guildmarket','guildhall','arena','tavern','temple','park','shrine','dock','strider','shop','compound','slum'];
var LIFE_PED_NEAR_DIST = (CITY_LIM || 2280) * 2 * 0.25;

var LIFE_PED_MAX_WADE = 3;   /* consecutive wet samples tolerated — ~165 units, a canal or a shore notch, not a bay */

/* ==== the door-transit rule ==== */
var LIFE_PED_CLOSED = [];
['Palace','Temple'].forEach(function(n){
  var c = (typeof CIDX !== 'undefined') ? CIDX[n] : null;

  if(c) LIFE_PED_CLOSED.push({ n:n, x:c.x, z:c.z, r:c.r });
});
function lifePedClosedAt(x, z){
  for(var i=0; i<LIFE_PED_CLOSED.length; i++){
    var p = LIFE_PED_CLOSED[i], dx = x-p.x, dz = z-p.z;
    if(dx*dx + dz*dz < p.r*p.r) return p;
  }
  return null;
}

function lifePedClosedExempt(ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var a = lifePedClosedAt(ox, oz), b = lifePedClosedAt(dx, dz);
  return (a || b) ? [a, b] : null;
}
function lifePedClosedHit(x, z, exempt){
  var p = lifePedClosedAt(x, z);
  if(!p) return null;
  if(exempt && (exempt[0] === p || exempt[1] === p)) return null;
  return p;
}
var LIFE_PED_CLOSED_REJECTS = 0;
var LIFE_PED_CLOSED_ACCEPTS = 0;
var LIFE_PED_CLOSED_REFUSALS = 0;   /* candidate DESTINATIONS refused here, at pick time — the rule's real bite */

function lifePedWalkable(ox, oz, dx, dz){
  var len = Math.hypot(dx-ox, dz-oz);
  var steps = Math.max(2, Math.min(60, Math.ceil(len/55)));
  var run = 0;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=steps; i++){
    var t = i/steps, px = ox+(dx-ox)*t, pz = oz+(dz-oz)*t;

    if(LIFE_PED_CLOSED.length && lifePedClosedHit(px, pz, exempt)){ LIFE_PED_CLOSED_REFUSALS++; return false; }

    if(terrainH(px, pz) >= 2){ run = 0; continue; }
    if(lifeGroundY(px, pz) < 2){
      if(++run > LIFE_PED_MAX_WADE) return false;
    }else run = 0;
  }
  return true;
}
function lifePedPickDestination(ox, oz, excludeCat){
  var firstSeen = null;
  for(var ci=0; ci<LIFE_PED_CAT_ORDER.length; ci++){
    var cat = LIFE_PED_CAT_ORDER[ci];
    if(cat === excludeCat) continue;
    var pool = LIFE_DOORS.filter(function(d){ return d.cat===cat && d.active<d.cap; });
    if(!pool.length) continue;
    var near = pool.filter(function(d){ return Math.hypot(d.x-ox,d.z-oz) < LIFE_PED_NEAR_DIST; });
    var from = near.length ? near : pool;

    for(var tries=0; tries<5; tries++){
      var cand = pick(from);
      if(!firstSeen) firstSeen = cand;
      if(lifePedWalkable(ox, oz, cand.x, cand.z)) return cand;
    }
  }

  return firstSeen;
}

function lifePushToLand(x, z){
  var h = terrainH(x,z);
  if(h >= 3) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=6; r<=60; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph > bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH >= 3) break;
  }
  return best;
}

function lifePushToLowGround(x, z, maxH){
  var h = terrainH(x,z);
  if(h <= maxH) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=20; r<=300; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph < bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH <= maxH) break;
  }
  return best;
}
function lifePedBuildLeg(ax, az, bx, bz){

  var HILL_MAX = 95;
  var totalLen = Math.hypot(bx-ax, bz-az);

  var waypointN = Math.max(2, Math.min(22, Math.ceil(totalLen/300)));
  var sampleN = Math.max(80, Math.min(500, Math.round(totalLen/15)));
  var rounds = Math.max(8, Math.min(40, waypointN*3));
  var waypoints = [[ax,az]];
  for(var wi=1; wi<=waypointN; wi++){
    var seed = lifeMix([ax,az],[bx,bz], wi/(waypointN+1));
    seed = lifePushToLand.apply(null, seed);
    if(terrainH(seed[0],seed[1]) > HILL_MAX) seed = lifePushToLowGround(seed[0],seed[1], HILL_MAX);
    waypoints.push(seed);
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<rounds; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<sampleN; s++){
      var st = s/sampleN, p = curve.getPointAt(st);
      var ph = terrainH(p.x, p.z);
      if(ph < 2){ worstT = st; worstFix = lifePushToLand(p.x, p.z); break; }
      if(ph > HILL_MAX){ worstT = st; worstFix = lifePushToLowGround(p.x, p.z, HILL_MAX); break; }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

var lifePedAuditTmp = new THREE.Vector3();
function lifePedCurveClosedHit(curve, ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=40; i++){
    curve.getPointAt(i/40, lifePedAuditTmp);
    var hit = lifePedClosedHit(lifePedAuditTmp.x, lifePedAuditTmp.z, exempt);
    if(hit) return hit;
  }
  return null;
}

function lifePedRambleTarget(ox, oz, excludeCat){
  for(var attempt=0; attempt<4; attempt++){
    var dest = lifePedPickDestination(ox, oz, excludeCat);
    if(!dest) return null;
    var curve = lifePedBuildLeg(ox, oz, dest.x, dest.z);
    if(!lifePedCurveClosedHit(curve, ox, oz, dest.x, dest.z)){
      LIFE_PED_CLOSED_ACCEPTS++;
      return { dest: dest, curve: curve };
    }
    LIFE_PED_CLOSED_REJECTS++;
  }
  return null;
}

window._pedTransit = {
  closed: LIFE_PED_CLOSED,
  closedAt: lifePedClosedAt,
  walkable: lifePedWalkable,
  stats: function(){ return { accepts: LIFE_PED_CLOSED_ACCEPTS, routeRejects: LIFE_PED_CLOSED_REJECTS,
                              destRefusals: LIFE_PED_CLOSED_REFUSALS }; },
  audit: function(samples){
    var N = samples || 24, p = new THREE.Vector3();
    var out = { peds:0, inBuilding:0, transiting:0, closedBreaches:0, tags:{} };
    LIFE_PEDS.forEach(function(cz){
      if(!cz || !cz.curve || cz.state !== 'walk' || cz.shopkeeper || cz.quarryLaborer || cz.compoundWorker || cz.monk) return;
      out.peds++;
      var hits = {}, n = 0, breach = false;
      var exempt = lifePedClosedExempt(cz.curve.getPointAt(0).x, cz.curve.getPointAt(0).z, cz.destDoor.x, cz.destDoor.z);
      for(var i=0; i<=N; i++){
        cz.curve.getPointAt(i/N, p);
        if(lifePedClosedHit(p.x, p.z, exempt)) breach = true;
        var t = placedTagAt(p.x, p.z);
        if(t){ hits[t.tag] = (hits[t.tag]||0)+1; n++; }
      }
      if(breach) out.closedBreaches++;
      if(n){ out.inBuilding++; if(n >= 2) out.transiting++; }
      for(var k in hits) out.tags[k] = (out.tags[k]||0) + 1;
    });
    return out;
  }
};

if(typeof pathvizRegister === 'function'){
  pathvizRegister({ key:'pedleg', label:'Pedestrian (live legs)', color:0x9fd8e8, seg:16,
    entities: function(){
      var out = [];
      for(var i=0; i<LIFE_PEDS.length && out.length<30; i++){
        var cz = LIFE_PEDS[i];
        if(cz && cz.curve && cz.state === 'walk' && !cz.shopkeeper && !cz.quarryLaborer
           && !cz.compoundWorker && !cz.monk) out.push(cz);
      }
      return out;
    } });
}

var LIFE_SHOPKEEPER_N = (typeof MARKET_STALLS !== 'undefined') ? Math.floor(MARKET_STALLS.length/2) : 0;

var LIFE_STRIDER_RIDER_PER_CAR = 8;
var LIFE_STRIDER_RIDER_BASE = 540 + LIFE_SHOPKEEPER_N;
var LIFE_STRIDER_RIDER_SLOTS = 60 * LIFE_STRIDER_RIDER_PER_CAR;
var LIFE_PED_N = 540 + LIFE_SHOPKEEPER_N + LIFE_STRIDER_RIDER_SLOTS;

var LIFE_QUARRY_LABORER_N = (typeof QUARRY_LABORER_HOUSES !== 'undefined') ? QUARRY_LABORER_HOUSES.length * 4 : 0;
var LIFE_QUARRY_LABORER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_QUARRY_LABORER_N;

var LIFE_COMPOUND_WORKER_PER = 3;
var LIFE_COMPOUND_WORKER_N = (typeof COMPOUNDS !== 'undefined') ? COMPOUNDS.length * LIFE_COMPOUND_WORKER_PER : 0;
var LIFE_COMPOUND_WORKER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_COMPOUND_WORKER_N;

var LIFE_MONK_PER_FIELD = 5, LIFE_MONK_PER_COOP = 2;
var LIFE_MONK_N = (typeof MONASTERY_SITES !== 'undefined')
  ? MONASTERY_SITES.fields.length*LIFE_MONK_PER_FIELD + MONASTERY_SITES.coops.length*LIFE_MONK_PER_COOP : 0;
var LIFE_MONK_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_MONK_N;
var LIFE_PED_T = 0;
var lifePedMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PED_N);
lifePedMesh.userData.life = true; lifePedMesh.userData.inspectLabel = 'Pedestrian';
lifePedMesh.frustumCulled = false;
scene.add(lifePedMesh);
var lifePedTmpPos = new THREE.Vector3(), lifePedTmpDir = new THREE.Vector3();
var lifePedTmpQuat = new THREE.Quaternion(), lifePedTmpMat = new THREE.Matrix4();
var lifePedTmpScale1 = new THREE.Vector3(1,1,1), lifePedTmpScale0 = new THREE.Vector3(0,0,0);

function lifePedSpawn(){
  if(!LIFE_DOORS.length) return null;
  var origin = pick(LIFE_DOORS);

  var leg = lifePedRambleTarget(origin.x, origin.z, null);
  if(!leg) return null;
  var dest = leg.dest, curve = leg.curve;
  dest.active++;
  return {
    id: LIFE_CITIZEN_ID++, race: lifeCitizenRace(), socialClass: null, timeOfDayBehavior: null,
    destDoor: dest, curve: curve, len: curve.getLength(),
    speed: rr(2.2,3.4), dur: 0, stateT: 0, state: 'walk', hangUntil: 0, ferryRef: null
  };
}

function lifeFerryBoard(f, stopDoor){
  f.onboard = f.onboard || 0;
  var alight = Math.min(f.onboard, ri(1,3));
  f.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== f) continue;
    var newLeg = lifePedRambleTarget(stopDoor.x, stopDoor.z, 'dock');   /* door-transit rule — see lifePedRambleTarget */
    if(newLeg){
      var newDest = newLeg.dest;
      newDest.active++;
      pp.curve = newLeg.curve;
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();   /* nowhere to go — recycle the slot */
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_FERRY_PEOPLE_PER - 1 - f.onboard);
  var boarding = Math.min(3, stopDoor.queueCount, room);
  stopDoor.queueCount -= boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stopDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = f; boarded++;
  }
  f.onboard += boarded;
  f.passengers = Math.max(1, Math.min(5, f.onboard));
}

var LIFE_PEDS = [];

(function(){ for(var i=0;i<LIFE_STRIDER_RIDER_BASE;i++) LIFE_PEDS.push(lifePedSpawn()); })();

var SHOPKEEPER_SUNRISE = 6, SHOPKEEPER_SUNSET = 18;
(function(){
  if(!LIFE_SHOPKEEPER_N) return;
  var houseCats = { shop:1, slum:1, manor:1, compound:1 };
  var houseDoors = LIFE_DOORS.filter(function(d){ return houseCats[d.cat]; });
  if(!houseDoors.length) return;
  var h0 = dayNightHour();
  var atStall = (h0 >= SHOPKEEPER_SUNRISE && h0 < SHOPKEEPER_SUNSET);
  for(var i=0;i<LIFE_SHOPKEEPER_N;i++){
    var stall = MARKET_STALLS[i*2];
    var near = houseDoors.filter(function(hd){ return Math.hypot(hd.x-stall.x,hd.z-stall.z) <= 500; });
    var home = near.length ? pick(near) : pick(houseDoors);
    LIFE_PEDS[540+i] = {
      shopkeeper: true, stall: stall, home: home,
      state: atStall ? 'atStall' : 'atHome', stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
    };
  }
})();
window._peds = LIFE_PEDS;   /* diagnostic: full state, incl. each citizen's .curve */
window._shopkeepers = { n: LIFE_SHOPKEEPER_N, sunrise: SHOPKEEPER_SUNRISE, sunset: SHOPKEEPER_SUNSET };

/* ==== quarry laborers ==== */
var QUARRY_SUNRISE = SHOPKEEPER_SUNRISE, QUARRY_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_QUARRY_LABORER_N) return;
  var h0 = dayNightHour();
  var atQuarry = (h0 >= QUARRY_SUNRISE && h0 < QUARRY_SUNSET);
  var slot = 0;
  QUARRY_LABORER_HOUSES.forEach(function(house){
    for(var k=0;k<4;k++){
      LIFE_PEDS[LIFE_QUARRY_LABORER_BASE + slot] = {
        quarryLaborer: true,
        home: { x: house.doorX, z: house.doorZ, ry: house.ry },
        work: { x: house.quarryX, z: house.quarryZ },
        state: atQuarry ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
      };
      slot++;
    }
  });
  window._quarryLaborerLife = { n: LIFE_QUARRY_LABORER_N, base: LIFE_QUARRY_LABORER_BASE,
                                 sunrise: QUARRY_SUNRISE, sunset: QUARRY_SUNSET };
})();

/* ==== compound garden workers ==== */
var COMPOUND_WORKER_SUNRISE = SHOPKEEPER_SUNRISE, COMPOUND_WORKER_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_COMPOUND_WORKER_N) return;
  var h0 = dayNightHour();
  var atWork = (h0 >= COMPOUND_WORKER_SUNRISE && h0 < COMPOUND_WORKER_SUNSET);
  var slot = 0, gardens = 0;
  COMPOUNDS.forEach(function(c){
    if(!c.doorX && c.doorX !== 0) return;   /* no recorded building door: skip rather than guess */
    gardens++;
    for(var k=0;k<LIFE_COMPOUND_WORKER_PER;k++){

      var wp = loc(c.x, c.z, (k-1)*c.fx*0.34, (k===1 ? 0 : (k===0 ? -1 : 1))*c.fz*0.42, c.ry);
      LIFE_PEDS[LIFE_COMPOUND_WORKER_BASE + slot] = {
        compoundWorker: true,
        home: { x: c.doorX, z: c.doorZ, ry: c.ry },
        work: { x: wp[0], z: wp[1] },

        floorY: c.y + 0.30,
        state: atWork ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(1.8,2.6)
      };
      slot++;
    }
  });
  window._compoundWorkers = { n: slot, gardens: gardens, per: LIFE_COMPOUND_WORKER_PER,
                              base: LIFE_COMPOUND_WORKER_BASE,
                              sunrise: COMPOUND_WORKER_SUNRISE, sunset: COMPOUND_WORKER_SUNSET };
})();

/* ==== monks ==== */
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

      chapelSpot: { x: chapel.x + Math.cos(slot*0.7)*(3 + (slot%5)*1.6),
                    z: chapel.z + Math.sin(slot*0.7)*(3 + (slot%5)*1.6), ry: chapel.ry },

      floorY: MONASTERY_SITES.y + 0.30,
      state: phase0, stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(3.0,4.0)
    };
    slot++;
  }

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

(function(){
  if(!LIFE_MONK_N) return;
  var white = new THREE.Color(0xffffff), robe = new THREE.Color(GREYC[2]);
  for(var i=0;i<LIFE_PED_N;i++) lifePedMesh.setColorAt(i, white);
  for(var m=0;m<LIFE_MONK_N;m++) lifePedMesh.setColorAt(LIFE_MONK_BASE+m, robe);
  if(lifePedMesh.instanceColor) lifePedMesh.instanceColor.needsUpdate = true;
  if(window._monks){ window._monks.robe = '#'+robe.getHexString();
                     window._monks.tinted = !!lifePedMesh.instanceColor; }
})();

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

function lifeMonkPost(cz){
  return cz.state === 'chapel' ? cz.chapelSpot : (cz.state === 'work' ? cz.work : cz.dorm);
}
function updateMonk(cz, idx){
  var want = lifeMonkPhase(dayNightHour());
  if(cz.state === 'work' || cz.state === 'chapel'){
    var post = lifeMonkPost(cz);

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

  lifePedWalkLeg(cz, idx, cz.state === 'toWork' ? 'work' : (cz.state === 'toChapel' ? 'chapel' : 'dorm'));
}
function lifeMonkDepart(cz, from, want){
  var to = want === 'chapel' ? cz.chapelSpot : (want === 'work' ? cz.work : cz.dorm);
  cz.curve = lifePedBuildLeg(from.x, from.z, to.x, to.z);
  cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
  cz.state = want === 'chapel' ? 'toChapel' : (want === 'work' ? 'toWork' : 'toDorm');
  cz.stateT = 0;
}

var LIFE_LOD_FRAME = 0;
var LIFE_LOD_NEAR2 = 260*260, LIFE_LOD_MID2 = 720*720;
function lifeLodDue(x, z, idx){
  var dx = x - camera.position.x, dz = z - camera.position.z;
  var q = dx*dx + dz*dz;
  if(q < LIFE_LOD_NEAR2) return true;
  if(q < LIFE_LOD_MID2) return ((idx + LIFE_LOD_FRAME) & 3) === 0;
  return ((idx + LIFE_LOD_FRAME) & 15) === 0;
}
function lifePedDue(cz, idx){

  var d = cz.destDoor || cz.stall || cz.home || cz.post;
  if(!d) return true;
  return lifeLodDue(d.x, d.z, idx);
}
function updatePedestrians(dt){
  LIFE_PED_T += dt;
  LIFE_PEDS.forEach(function(cz, idx){
    if(!cz){ LIFE_PEDS[idx] = lifePedSpawn(); return; }
    cz.stateT += dt;

    if(cz.shopkeeper){ if(lifePedDue(cz, idx)) updateShopkeeper(cz, idx); return; }
    if(cz.quarryLaborer){ if(lifePedDue(cz, idx)) updateQuarryLaborer(cz, idx); return; }
    if(cz.compoundWorker){ if(lifePedDue(cz, idx)) updateCompoundWorker(cz, idx); return; }
    if(cz.monk){ if(lifePedDue(cz, idx)) updateMonk(cz, idx); return; }
    if(cz.state === 'boarded'){
      lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      return;
    }
    if(cz.state === 'queued'){

      if(lifePedDue(cz, idx)){
        lifePedTmpPos.set(cz.destDoor.x, Math.max(LIFE_Y, lifeGroundY(cz.destDoor.x, cz.destDoor.z) + 0.15), cz.destDoor.z);
        lifePedTmpQuat.setFromAxisAngle(LIFE_UP, cz.destDoor.ry || 0);
        lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
        lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      }
      return;
    }
    if(cz.state === 'hangout'){
      if(lifePedDue(cz, idx)){
        var wander = cz.stateT*0.6 + idx*1.7;
        var hoX = cz.destDoor.x + Math.sin(wander)*2.2, hoZ = cz.destDoor.z + Math.cos(wander*0.7)*2.2;
        lifePedTmpPos.set(hoX, Math.max(LIFE_Y, lifeGroundY(hoX, hoZ) + 0.15), hoZ);
        lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
        lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
        lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      }
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
    if(lifePedDue(cz, idx)){
      var t = raw*raw*(3-2*raw);
      cz.curve.getPointAt(t, lifePedTmpPos);
      lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
      var tTan = Math.min(0.995, Math.max(0.005, t));
      cz.curve.getTangentAt(tTan, lifePedTmpDir);
      var yaw = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
      lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    }
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
