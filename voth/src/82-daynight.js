/* ============================== DAY/NIGHT CYCLE ==============================
   Purely visual — sun/moon arc across the sky, sun intensity and sky/fog tint
   shift toward night, and a shared pool of night-light props (braziers,
   torches, lantern posts, a revolving lighthouse beacon) fade in after dusk.
   Deliberately NOT wired to citizen behaviour (the owner's own instruction —
   LIFE_HOUR_BEHAVIOR in 78-life.js stays null; nothing here reads or writes
   it). 5 real seconds = 1 game hour, so a full day is 120 seconds. */
reseed(820001);

/* THE CLOCK NOW LIVES IN 21-sky.js. This file does not keep a second one:
   hour, dayOfYear and timeScale are all read off SKY/skyHour() there, and
   dayNightHour() — which the arena crowd, the ordinator drills, the monks,
   the shopkeepers and the lit-window schedule all call — simply delegates.
   That is the brief's "one clock drives everything"; two clocks would drift
   apart the moment timeScale left 1x. Advanced once per frame by
   skyAdvance(dt) in 80-camera.js's frame(). */
var DAYNIGHT_SEC_PER_HOUR = SKY.secPerHour;
function dayNightHour(){ return skyHour(); }
function setDayNightPaused(p){
  SKY.paused = !!p;
  var btn = document.getElementById('dnPause');
  if(btn) btn.textContent = SKY.paused ? 'Resume' : 'Pause';
}
(function(){
  var btn = document.getElementById('dnPause');
  /* SKY.paused, not the old DAYNIGHT_PAUSED: that var went with the second
     clock when 21-sky.js took ownership, and this line was left reading it.
     Nothing caught it because a ReferenceError here only fires on CLICK —
     the page loads clean, verify.py passes, and the Pause button is simply
     dead the first time anyone presses it. setDayNightPaused() writes
     SKY.paused, so that is the one piece of state to toggle against. */
  if(btn) btn.onclick = function(){ setDayNightPaused(!SKY.paused); };
})();

/* The old hand-rolled sun/moon arc (SUN_AZ0/bodyDir) is gone: the sun's
   position is now real horizontal-coordinate astronomy for latitude -40,
   computed once per frame in 21-sky.js and handed over in SKY_STATE. The two
   small moons this world already had keep a simple arc of their own, since
   nothing in the brief describes them; they are now depth-tested behind the
   giant. */
var MOON_AZ0 = Math.atan2(MOONDIR.x, MOONDIR.z);
var MOON_ELEV_MAX = Math.asin(MOONDIR.y) * 1.15;      /* a bit higher arc so it clears the skyline at its own "noon" (midnight) */

function bodyDir(hour, az0, elevMax){
  var phase = (hour/24)*Math.PI*2 - Math.PI/2;         /* h=6 -> 0 (rise), h=12 -> pi/2 (peak), h=18 -> pi (set) */
  var elev = Math.sin(phase) * elevMax;
  var az = az0 + (hour-12)/24*Math.PI*2;
  return new THREE.Vector3(Math.cos(elev)*Math.sin(az), Math.sin(elev), Math.cos(elev)*Math.cos(az)).normalize();
}

var SUN_BASE_I = PAL.sunIntensity, HEMI_BASE_I = PAL.hemiIntensity, AMB_BASE_I = PAL.ambientIntensity;
/* the owner: "it's too dark in there" — raised from the original 0.055/0.045
   floor to a level that reads as a lit, cozy night rather than near-black. */
var HEMI_NIGHT_I = 0.16, AMB_NIGHT_I = 0.11;
var HAZE_DAY = new THREE.Color(PAL.haze);
var HAZE_NIGHT = new THREE.Color(0x1c2436);
var SKY_TINT_DAY = new THREE.Color(0xffffff);
var SKY_TINT_NIGHT = new THREE.Color(0x475374);
var WATER_SKY_DAY = new THREE.Color(0xc6c8c2);      /* waterUni's own original default */
var WATER_SKY_NIGHT = new THREE.Color(0x232c42);
var _dnFog = new THREE.Color(), _dnSky = new THREE.Color(), _dnWaterSky = new THREE.Color();

function smoothstep(lo,hi,x){ var t=Math.max(0,Math.min(1,(x-lo)/(hi-lo))); return t*t*(3-2*t); }

/* planetshine is what makes a Krator night READABLE rather than black, so
   the night floors below are the ones the owner already asked for ("it's
   too dark in there"), lifted a little further under a full giant and used
   as the twilight floor during an eclipse too. */
var DN_SHINE_HEMI = 0.13, DN_SHINE_AMB = 0.07;
/* how much the full giant suppresses the city's own night lighting. Under a
   few hundred lux of planetshine the lamps and lit windows are still on but
   are no longer the only light in the scene, so they read a notch softer —
   the "windows lit against a bright twilight" failure this guards against. */
var DN_SHINE_NL_CUT = 0.28;
var DN_SKY_SAMPLE = 0.45, DN_SOIL_SAMPLE = 0.40;

function updateDayNight(){
  var S = SKY_STATE;
  var hour = S.hour;
  var moonDir = bodyDir((hour+12)%24, MOON_AZ0, MOON_ELEV_MAX);
  SUNDIR.copy(S.sunDir); MOONDIR.copy(moonDir);
  moonSprite.userData.dir.copy(moonDir);

  /* daylight is now EFFECTIVE daylight (S.dayK = sunUp * (1 - eclipse)), not
     just "is the sun above the horizon". That single substitution is what
     makes a noon eclipse read as dusk everywhere at once — fog, hemisphere,
     water, night lights and the window schedule all hang off it. */
  var daylight = S.dayK;
  var moonUp = smoothstep(-0.05, 0.10, moonDir.y);
  var shine = S.lit*(1 - daylight);          /* planetshine strength, 0..1 */

  /* one key light: sun by day, giant by night and through an eclipse. Its
     direction is set in 80-camera.js from S.keyDir (which is where the
     shadow target lives); colour and intensity here. */
  sun.color.copy(S.keyCol);
  sun.intensity = SUN_BASE_I * S.keyI;
  hemiLight.intensity = HEMI_NIGHT_I + DN_SHINE_HEMI*shine + (HEMI_BASE_I-HEMI_NIGHT_I) * daylight;
  ambLight.intensity  = AMB_NIGHT_I  + DN_SHINE_AMB*shine  + (AMB_BASE_I-AMB_NIGHT_I) * daylight + 0.02*moonUp;
  /* thick air scatters: a milky, low-contrast key at 2 atm, a hard one at
     0.8. r128's PCFSoftShadowMap ignores shadow.radius, so shadow SOFTNESS
     is delivered as shadow CONTRAST, which is what the eye actually reads. */
  sun.intensity *= 1.16 - 0.30*S.shadowSoft;
  hemiLight.intensity *= 0.80 + 0.42*S.shadowSoft;
  ambLight.intensity  *= 0.80 + 0.42*S.shadowSoft;
  /* sky ambient: the hemisphere's sky half is SAMPLED from the dome's own
     zenith colour (so pressure, sunset and eclipse reach the ground bounce)
     and its ground half leans to Krator's red soils. Blended with, not
     substituted for, PAL.hemiSky/hemiGround: those are tuned values and the
     whole city was lit against them. */
  hemiLight.color.setHex(PAL.hemiSky).lerp(S.hemiSky, DN_SKY_SAMPLE);
  hemiLight.groundColor.setHex(PAL.hemiGround).lerp(S.hemiGround, DN_SOIL_SAMPLE);

  _dnFog.copy(HAZE_NIGHT).lerp(HAZE_DAY, daylight);
  scene.fog.color.copy(_dnFog);
  skyScene.background.copy(_dnFog);
  scene.fog.density = PAL.fogDensity * S.fogScale;     /* fog thickens with pressureAtm */
  _dnSky.copy(SKY_TINT_NIGHT).lerp(SKY_TINT_DAY, daylight);
  skyMesh.material.color.copy(_dnSky);

  /* the water shader's own uSun/uFogCol/uSky uniforms were only ever set
     once at creation (75-terrain.js) and never updated again — so before
     this the water kept reflecting the original fixed daytime sun and sky
     forever, regardless of the actual hour. Sync them here every frame. */
  waterUni.uSun.value.copy(SKY_STATE.keyDir);
  waterUni.uFogCol.value.copy(_dnFog);
  waterUni.uFogDen.value = scene.fog.density;
  _dnWaterSky.copy(WATER_SKY_NIGHT).lerp(WATER_SKY_DAY, daylight);
  waterUni.uSky.value.copy(_dnWaterSky);

  /* sunSprite/sunDisc visibility is 21-sky.js's business now (it has the
     eclipse test); only the two small moons are still driven from here. */
  moonSprite.material.opacity = (0.15 + 0.55*moonUp) * (1 - daylight*0.85);
  moon2.material.opacity = (0.10 + 0.30*moonUp) * (1 - daylight*0.7);

  /* read by the night-light props below and the beacon. Two changes against
     the old `1 - daylight`: an eclipse now turns them ON (daylight is
     effective daylight), and a full giant turns them DOWN, because the city
     is not fighting total darkness on this side of the moon. */
  DAYNIGHT_NIGHT_K = (1 - daylight) * (1 - DN_SHINE_NL_CUT*S.lit);
}
var DAYNIGHT_NIGHT_K = 0;

/* ============================== night-light props =========================
   One shared InstancedMesh (one draw call) for every brazier/torch/lantern
   post in the city — a small flame-shaped billboard-ish blob, additively
   blended, warm ember colour. Positions are set once at load; only the
   shared material's opacity animates per frame (every instance fades
   in/out together, since they all read the same time-of-day), so this
   costs nothing beyond the one draw call itself. Placed per the owner's
   list: central district, causeways, cantons, shrines/temples (braziers),
   and the main ring road + bridges (torches). Ship lanterns and ordinators'
   own night lanterns are NOT covered here — both would need per-frame
   position tracking into 78-life.js's moving instances, out of scope for
   this pass. */
var NIGHT_LIGHTS = [];
function addNightLight(x, z, y){
  NIGHT_LIGHTS.push([x, (y!=null?y:lifeGroundY(x,z))+2.6, z]);
}
/* central district: Palace + Temple canton edges */
['Palace','Temple'].forEach(function(nm){
  var c = CIDX[nm]; if(!c) return;
  var ey = cantonEdgeY(nm);
  for(var i=0;i<4;i++){
    var a = (i/4)*Math.PI*2 + 0.4;
    addNightLight(c.x+Math.cos(a)*c.r*0.9, c.z+Math.sin(a)*c.r*0.9, ey);
  }
});
/* every canton's own edge, one brazier flanking its main causeway/pier side */
CANTONS.forEach(function(c){
  var ey = cantonEdgeY(c.n); if(ey==null) return;
  addNightLight(c.x + c.r*0.92, c.z, ey);
  addNightLight(c.x - c.r*0.92, c.z, ey);
});
/* causeways: canton end and shore end */
CAUSEWAYS.forEach(function(cw){
  var c = cw.c; if(!c) return;
  var land = shoreIn(cw.s, 26);
  var dx=land[0]-c.x, dz=land[1]-c.z, L=Math.hypot(dx,dz); if(L<1) return;
  var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
  var deckY = cw.solid ? cantonEdgeY(c.n) : CWAY;
  addNightLight(ax, az, deckY);
  addNightLight(land[0], land[1], Math.max(CWAY-6, terrainH(land[0],land[1])+2.5));
});
/* shrines + temple altar */
if(typeof LIFE_SHRINE_STOPS !== 'undefined') LIFE_SHRINE_STOPS.forEach(function(s){ addNightLight(s.x, s.z); });
if(typeof TEMPLE_ALTAR !== 'undefined' && TEMPLE_ALTAR) addNightLight(TEMPLE_ALTAR.x, TEMPLE_ALTAR.z, TEMPLE_ALTAR.y);
/* the 4 temple-corner braziers (65-facade.js, window.TEMPLE_BRAZIERS) —
   owner: "at high noon every day, he will do an animal sacrifice... and
   light large golden braziers on all 4 temple corners, which will burn
   brightly until the sunrise the next morning." These need their OWN
   timer (noon-to-sunrise), not the shared dusk-to-dawn one every other
   night light reads off nlMat's uniform opacity — so their indices are
   recorded here (TEMPLE_BRAZIER_IDX) and driven per-instance by COLOR in
   the tick loop below (nlMat is additive-blended, so an instance colour
   of black is indistinguishable from "off" regardless of the shared
   opacity, and a bright >1 colour reads as genuinely brighter than an
   ordinary torch — both exploited below), while every other night light
   keeps using the shared material colour unmodified (instance colour
   white). This reuses the existing one-draw-call nlMesh entirely — no
   new InstancedMesh, budget-neutral. */
var TEMPLE_BRAZIER_IDX = [];
(window.TEMPLE_BRAZIERS||[]).forEach(function(b){
  TEMPLE_BRAZIER_IDX.push(NIGHT_LIGHTS.length);
  addNightLight(b.x, b.z, b.y);
});
/* bridges now get a real post at EACH end (72-lanterns.js's own STATIC_
   LANTERNS, folded in below) instead of one flat midpoint torch — the
   owner's later, more specific ask ("at both ends of bridges and
   causeways") supersedes the single-torch placement this block used to do. */
/* the main ring road, sampled sparsely so this doesn't turn into hundreds
   of posts — every ~9th resampled node of every 'ring'-class road. */
if(typeof ROADS !== 'undefined') ROADS.forEach(function(rd){
  if(rd.cls !== 'ring') return;
  for(var i=0;i<rd.pts.length;i+=9) addNightLight(rd.pts[i][0], rd.pts[i][1]);
});
/* everything from 72-lanterns.js: clan compound entrances, silt strider
   and ferry stations, intact gates/towers, both ends of every bridge, and
   both ends of every large harbor pier — each already paired with its own
   physical post/bracket fixture there (that file's own header explains
   why it has to build the fixture geometry before this one runs). y is
   already resolved per-position there, so pass it straight through. */
if(typeof STATIC_LANTERNS !== 'undefined') STATIC_LANTERNS.forEach(function(p){ addNightLight(p.x, p.z, p.y); });

/* ---- feed every STATIC flame into the illumination pool (45-kit.js) -----
   Everything in NIGHT_LIGHTS up to this point is fixed in place: canton
   edges, causeway ends, shrines, the temple altar, the 4 temple braziers,
   the ring-road torches and all 131 STATIC_LANTERNS. The reserved
   moving-vehicle slots start immediately below (LANTERN_ORD_BASE) and are
   deliberately excluded — the light map is baked once and a lantern that
   travels cannot be baked into it (a boat's own lantern still reads as a
   flame on the water via nlMesh, it just doesn't wash the quay).
   The 4 temple braziers are the "large golden braziers" of the owner's
   earlier ask and already render at 2.6x an ordinary torch here; they pool
   light at 3x amplitude over 2x the radius, which is the "proportional to
   size" half of this pass. The "number of lights in a close area" half
   needs no code at all: the splats in nlmBake() SUM. */
NIGHT_LIGHTS.forEach(function(p, i){
  var big = TEMPLE_BRAZIER_IDX.indexOf(i) !== -1;
  nlLampAdd(p[0], p[1], p[2], big ? 3.0 : 1.0, big ? 34 : 17);
});

/* ---- the Fortress's four ornamental tower flames, burning green ----------
   owner: "give those 4 ornamental towers bright green flames at night."
   The four are ordinatorFortress()'s corner watchtowers (65-facade.js),
   which publish their own coping-cap tops as window.FORT_TOWER_FLAMES the
   same way the temple publishes TEMPLE_BRAZIERS — so the height here is the
   builder's own number (measured: y=135.9, 36.4 up the tower from the keep
   deck at 99.5), never an offset guessed off the canton.

   Registered AFTER the warm-lamp feed above on purpose: these four must NOT
   splat a warm pool into the baked map. They pool green instead, through
   45-kit.js's nlGreenAdd() — four analytic sources in the shader rather
   than a second map (see that function's own comment). amp 2.6/radius 46 is
   a deliberately generous pool: the flame stands 36 units above the deck it
   is meant to wash, and the map's own height e-fold (0.05/unit) costs ~84%
   of the intensity over that drop.

   Visually they are ordinary nlMesh instances — no new mesh, no new draw
   call — carrying a green instance colour and a bigger scale, exactly the
   two per-instance levers the temple braziers already use. */
var FORT_FLAME_IDX = [];
(window.FORT_TOWER_FLAMES||[]).forEach(function(f){
  FORT_FLAME_IDX.push(NIGHT_LIGHTS.length);
  NIGHT_LIGHTS.push([f.x, f.y + 1.1, f.z]);
  nlGreenAdd(f.x, f.y + 1.1, f.z, 2.6, 46);
});
/* the green itself. nlMat is additive with a warm base colour
   (0xffb347 = 1.000, 0.702, 0.278) and instance colour MULTIPLIES it, so
   this triple is written as the factor that lands on that base:
   (0.22, 2.60, 0.75) * base = (0.22, 1.83, 0.21) — deliberately over 1.0 in
   green (nothing clamps before the additive composite, same trick
   TEMPLE_BRAZIER_LIT_COL uses) so these read as hot green fire rather than
   a green-tinted torch. As a flat colour that is about 0x38ff35.
   Promoted to PAL.flame.greenSprite, which is where the derivation of that
   factor from PAL.flame.green is written down — the two are one flame, and
   changing the green wash without re-deriving this would silently split
   the cast light from the flame casting it. */
var FORT_FLAME_COL = new THREE.Color().fromArray(PAL.flame.greenSprite);

/* ============================== moving-vehicle lanterns ====================
   owner: "All boats, carts, and silt striders have a lantern. Ordinators
   also carry lanterns." Same shared nlMesh, same dusk-to-dawn opacity
   uniform — these reserved trailing instances just get their POSITION
   updated every frame (from each population's own per-frame update
   function, or in the boats' case, centrally below) instead of once at
   load, tracking the vehicle the way NIGHT_LIGHTS' static entries never
   need to. See nlTrack()/the tick loop below for how they're driven. */
var LANTERN_ORD_BASE = NIGHT_LIGHTS.length;
(function(){ for(var i=0;i<LIFE_ORD_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_CARAVAN_BASE = NIGHT_LIGHTS.length;   /* real caravans only — LIFE_STRIDER_CAR_BASE (90) of them; the 60 reserved strider-car slots (all three routes) are tracked separately, below */
(function(){ for(var i=0;i<LIFE_STRIDER_CAR_BASE;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_TAXI_BASE = NIGHT_LIGHTS.length;
(function(){ for(var i=0;i<LIFE_TAXI_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();
/* canoes + ferries + ships + the pleasure barge + river barges, in one
   block — LIFE_AVOID_X/Z (78-life.js) already tracks every one of these
   every frame for local collision avoidance, so this reuses that existing
   live position array instead of adding a tracking line to 5 separate
   update functions. LIFE_AVOID_OBST0 is where that array's own moving-
   vehicle range ends (BRIDGE_SUPPORTS obstacles start there — static,
   never worth a lantern). */
var LANTERN_BOAT_BASE = NIGHT_LIGHTS.length;
var LANTERN_BOAT_N = LIFE_AVOID_OBST0;
(function(){ for(var i=0;i<LANTERN_BOAT_N;i++) NIGHT_LIGHTS.push([0,0,0]); })();
var LANTERN_STRIDER_BASE = NIGHT_LIGHTS.length;   /* 79-striders.js's own reserved car slots — LIFE_STRIDER_CAR_SLOTS of them, 1:1 */
(function(){ for(var i=0;i<LIFE_STRIDER_CAR_SLOTS;i++) NIGHT_LIGHTS.push([0,0,0]); })();

var nlGeo = lifeMergeGeoms ? lifeMergeGeoms([
  { geo: new THREE.ConeGeometry(0.5, 1.6, 5).translate(0,0.8,0), color: 0xffb347 },
  { geo: new THREE.ConeGeometry(0.28, 0.9, 5).translate(0,1.15,0), color: 0xfff0c0 }
]) : new THREE.ConeGeometry(0.5,1.6,5);
var nlMat = new THREE.MeshBasicMaterial({ color:0xffb347, transparent:true, opacity:0,
  blending:THREE.AdditiveBlending, depthWrite:false, fog:false });
var nlMesh = new THREE.InstancedMesh(nlGeo, nlMat, Math.max(1, NIGHT_LIGHTS.length));
nlMesh.frustumCulled = false;
/* real invariant failure, found live via verify.py --assert after adding
   moving-vehicle lantern tracking: river-channel-clear flagged 7 nlMesh
   instances sitting in the channel at boat height (SEA+3.2 — exactly the
   consolidated boat-lantern pass's own y, below) as "unexplained solid
   geometry in the channel." They are not solid and not unexplained — boats
   legitimately travel the channel, and their lanterns travel with them,
   same as every other life-layer population; that check already exempts
   `userData.life` meshes for exactly this reason (its own comment:
   "moving life-layer vehicles legitimately use the channel"). nlMesh now
   carries real moving content alongside its static torches, so it earns
   the same tag every other moving population's InstancedMesh already has. */
nlMesh.userData.life = true;
(function(){
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1,1,1);
  var s0 = new THREE.Vector3(0,0,0);
  var sBig = new THREE.Vector3(2.6,2.6,2.6);   /* "large" braziers — 2.6x an ordinary torch flame */
  var sFort = new THREE.Vector3(3.4,3.4,3.4);  /* the Fortress tower flames: read from the bay, 136 up and 400+ units out */
  var white = new THREE.Color(0xffffff);
  NIGHT_LIGHTS.forEach(function(p, i){
    var big = TEMPLE_BRAZIER_IDX.indexOf(i) !== -1;
    var grn = FORT_FLAME_IDX.indexOf(i) !== -1;
    /* every reserved moving-vehicle slot (LANTERN_ORD_BASE and up) starts
       hidden (scale 0) — real positions land on the first frame each
       population's own update function runs, but the page can render a
       frame before that, and a stray glowing torch at the world origin is
       worse than one that briefly doesn't exist yet. */
    var scaleV = (i >= LANTERN_ORD_BASE) ? s0 : (grn ? sFort : (big ? sBig : s1));
    m.compose(new THREE.Vector3(p[0],p[1],p[2]), q, scaleV);
    nlMesh.setMatrixAt(i, m);
    /* the four tower flames are green for good — unlike the temple braziers
       they have no separate on/off window of their own, they simply burn
       whenever the shared dusk-to-dawn opacity says the city's lights are
       lit, so the colour is set once here and never touched again. */
    nlMesh.setColorAt(i, grn ? FORT_FLAME_COL : white);
  });
  nlMesh.instanceColor.needsUpdate = true;
})();
scene.add(nlMesh);

/* shared setter every moving population's own update function (or the
   consolidated boat pass below) calls to keep its reserved lantern
   instance following it — position only; colour/opacity stay the shared
   dusk-to-dawn uniform every other night light already uses. `visible:
   false` parks it off-scene (scale 0) for a currently-inactive slot (an
   empty strider-car reservation, mid-respawn). */
var _nlTrackM = new THREE.Matrix4(), _nlTrackQ = new THREE.Quaternion();
var _nlTrackS1 = new THREE.Vector3(1,1,1), _nlTrackS0 = new THREE.Vector3(0,0,0), _nlTrackP = new THREE.Vector3();
function nlTrack(idx, x, y, z, visible){
  _nlTrackP.set(x,y,z);
  _nlTrackM.compose(_nlTrackP, _nlTrackQ, (visible===false) ? _nlTrackS0 : _nlTrackS1);
  nlMesh.setMatrixAt(idx, _nlTrackM);
}
/* readiness flag for every OTHER fragment's own call site: nlTrack itself
   is a `function` declaration, fully hoisted across the whole concatenated
   script regardless of fragment order, so `typeof nlTrack==='function'` is
   ALWAYS true — even on 80-camera.js's own first, SYNCHRONOUS frame() call
   (real bug, found live: 80-camera.js renders an initial frame directly
   during BUILD()'s own execution, before 82-daynight.js's `var`s below it
   in file order have actually run — updateWaterTaxis (78-life.js) called
   nlTrack on that very first synchronous frame and hit `_nlTrackP.set`
   while `_nlTrackP` was still the hoisted-but-unassigned `undefined` every
   `var` starts as). A `var`, unlike a `function`, only hoists the BINDING,
   so `typeof LANTERN_TRACK_READY` genuinely reads 'undefined' right up
   until this exact line executes — every call site below checks THIS, not
   nlTrack's own existence. */
var LANTERN_TRACK_READY = true;
/* brazier on/off colours for the tick loop below — "off" is pure black,
   which an additive-blended material renders as zero contribution
   regardless of the shared nlMat.opacity, giving these 4 instances a
   genuinely independent on/off state; "lit" deliberately exceeds 1.0 per
   channel (THREE.Color doesn't clamp on construction, and additive
   blending doesn't clamp before compositing) so they read as a brighter,
   hotter flame than an ordinary torch, not just a same-brightness one at
   2.6x the size. */
var TEMPLE_BRAZIER_LIT = false;
var TEMPLE_BRAZIER_OFF_COL = new THREE.Color(0,0,0);
var TEMPLE_BRAZIER_LIT_COL = new THREE.Color(1.9,1.5,0.85);

/* lighthouse beacons: the harbor tower (Port canton — the working harbor,
   piers and ships all dock there) gets a rotating 2-beam beacon, and every
   "lesser" island lighthouse (ISLES entries tagged 'light' in 10-core.js,
   each an actual built tower — FR6/CYL/DOME/CONE — not just a name) gets a
   single rotating beam of its own. One shared InstancedMesh for every beam
   on every tower — this REPLACES the single non-instanced Mesh an earlier
   pass built, so it's still exactly one draw call, not a new one. Always
   spinning (a lighthouse turns by day too, it just isn't the thing you
   notice) but only bright enough to read once it's dark.

   Owner correction: this used to read CIDX['Lighthouse'], which was really
   the FORTRESS canton (renamed to 'Fortress' in 30-layout.js — a military
   tower, not a lighthouse; the owner caught the beam still circling over
   it after the rename and asked for the beacon itself to move). The real
   harbor beacon now anchors to Port instead. */
var LH_BEACONS = [];
(function(){
  var c = CIDX['Port'];
  var top = CANTON_TOPS['Port'];
  if(c && top){
    /* Port already carries a real lighthouse tower at its own centre
       (portDeckV2, 65-facade.js) — same formula that function uses for
       its own height (lh = hw*0.95), so the beam anchors at the real lamp
       room/dome band instead of a flat offset guessed for a different
       canton's silhouette (the fortress, ~46 above deck — nowhere near
       this tower's true ~85-90). +4 lands it just above the lamp-room
       CYL, at the dome, matching the islet lighthouses' own "just above
       the finial" convention. */
    var lh = top.hw*0.95;
    LH_BEACONS.push({ x:c.x, z:c.z, y:top.y + lh + 4, beams:2, spin:0.6 });
  }
  ISLES.forEach(function(I){
    if(I[4] !== 'light') return;
    /* matches 60-land.js's own islet-lighthouse build exactly: base y+1.8,
       tower to +43.8, lamp room to +50.8, dome to +55.2+4.4, finial cone
       on top of that — the beam sits just above the finial, at the lamp
       room's own height band, not at the very tip. */
    LH_BEACONS.push({ x:I[0], z:I[1], y:terrainH(I[0],I[1]) + 47.5, beams:1, spin:rr(0.45,0.75) });
  });
})();
var LH_BEAM_N = 0;
LH_BEACONS.forEach(function(b){ b.slot0 = LH_BEAM_N; LH_BEAM_N += b.beams; });
var lhBeamMesh = null;
if(LH_BEAM_N > 0){
  /* owner: "strange beam of light that shoots out" — a flat plane at
     uniform opacity across its whole length reads as a hard-edged glowing
     bar/line, not a light beam. Real beacon light widens and fades with
     distance from the source; faked cheaply here with a small canvas
     gradient (opaque near the source, fading to nothing at the tip) as
     the plane's own alpha map, instead of a flat colour, plus a widening
     taper baked into the geometry so it reads as a spreading cone. */
  var beamTex = (function(){
    var c = document.createElement('canvas'); c.width = 8; c.height = 128;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0,0,0,128);
    grad.addColorStop(0.00, 'rgba(255,242,200,0.85)');
    grad.addColorStop(0.12, 'rgba(255,242,200,0.55)');
    grad.addColorStop(0.55, 'rgba(255,242,200,0.16)');
    grad.addColorStop(1.00, 'rgba(255,242,200,0)');
    g.fillStyle = grad; g.fillRect(0,0,8,128);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();
  var beamGeo = new THREE.PlaneGeometry(3, 620, 1, 24);
  (function(){
    var pos = beamGeo.attributes.position;
    for(var vi=0; vi<pos.count; vi++){
      var ly = pos.getY(vi);                  /* -310..310 before the translate below */
      var tt = (ly+310)/620;                   /* 0 at source, 1 at tip */
      pos.setX(vi, pos.getX(vi)*(1+tt*2.2));
    }
    pos.needsUpdate = true;
    beamGeo.translate(0, 310, 0);              /* pivot at the tower, beam reaches outward */
    beamGeo.rotateX(Math.PI/2);                /* lie flat — baked in, so instances only need a Y spin */
  })();
  var beamMat = new THREE.MeshBasicMaterial({ color:0xfff2c8, map:beamTex, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, fog:false });
  lhBeamMesh = new THREE.InstancedMesh(beamGeo, beamMat, LH_BEAM_N);
  lhBeamMesh.frustumCulled = false;
  scene.add(lhBeamMesh);
}
var LH_SPIN_T = 0;
var _lhM = new THREE.Matrix4(), _lhQ = new THREE.Quaternion(), _lhS = new THREE.Vector3(1,1,1), _lhP = new THREE.Vector3();

/* ============================== the Guild canton's clock ===================
   THIRD PASS (owner: "the clockmaker guild probably just needs an animated
   clock" — see 50-cantons.js's guildHallsDeck() for why it's mounted on
   the alchemist's tower rather than a dedicated hall; GUILD_CLOCK is that
   file's own hand-off, {x,z,y,ry,r}, the face's own centre pivot/facing/
   size). "Animated" means the hands actually turn, read live off
   dayNightHour() — the same "read the game clock, drive a rotation" idiom
   this file's own lighthouse beacons (LH_BEACONS/lhBeamMesh, just above)
   already use, not a fixed face.

   Genuinely new geometry (a thin bar), so it gets its own tiny
   InstancedMesh — 2 instances per clock, hour + minute hand — rather than
   being folded into lifeGuildMesh (78-life.js): that mesh's geometry is a
   fixed humanoid hull (torso+head+tool) with only per-instance colour and
   a uniform (1,1,1) scale ever applied to it; a clock hand needs its OWN
   non-uniform per-instance scale (long and thin, scaled by hand length)
   to reach from the pivot to the rim, which would corrupt every guild
   worker sharing that mesh if done there. One new draw call
   (BUDGET.drawCalls 53->54, 05-palette.js — see that constant's own
   comment; still 6 under the 60 ceiling), the same size cost 78-life.js's
   own guild-worker population paid for the identical "wrong shape to
   share" reason.

   FOURTH PASS (owner: "make the clockmaker's/artificer's guild" — a real
   hall this time, 50-cantons.js's guildHallsDeck(), with its own clock
   face): GUILD_CLOCK (the alchemist tower's single face) generalized to
   GUILD_CLOCKS, a list — the alchemist's own clock is still index 0 (that
   IIFE pushes the same object into both), the artificer hall's is index
   1. Rather than a second InstancedMesh (a second draw call this budget
   doesn't have room for — see BUDGET.drawCalls's own comment, already at
   the ceiling), this ONE mesh is just sized to 2*GUILD_CLOCKS.length and
   updateGuildClock() below loops over every entry, writing 2 instances
   each — the exact "do not duplicate a second clock-hand InstancedMesh,
   reuse the one that exists" the owner's own brief for this pass asked
   for.

   The geometry kit here (BOX/CYL/... in 45-kit.js) only yaws around the
   vertical axis — fine for the FACE (a flush wall plaque, same idiom the
   warrior guild's own shield plaques use), but a hand has to sweep in the
   WALL's own vertical plane, an axis this kit has no notion of. Built
   directly with a real THREE.Quaternion instead: the wall's outward
   normal is (cos ry, 0, -sin ry) and its own "along the wall" tangent is
   (sin ry, 0, cos ry) — loc()'s own derivation (45-kit.js) rearranged for
   just these two directions — so a hand pointing at angle theta clockwise
   off 12 o'clock (theta=0 is straight up) is cos(theta)*up +
   sin(theta)*tangent; verified clockwise-from-outside by the same
   right-hand check loc()'s own comment trail uses elsewhere (screen-right,
   for someone standing outside the wall looking in, is +tangent). */
var guildClockMesh = null;
if(typeof GUILD_CLOCKS !== 'undefined' && GUILD_CLOCKS && GUILD_CLOCKS.length){
  /* unit bar: base at the local origin (the pivot), tip at local y=1 —
     per-instance scale (below) stretches it to each hand's own length and
     thickness, exactly like lifeGuildTmpScale1 elsewhere just always
     (1,1,1) there; here it varies every instance on purpose. */
  var guildClockHandGeo = new THREE.BoxGeometry(1,1,1).translate(0, 0.5, 0);
  guildClockMesh = new THREE.InstancedMesh(guildClockHandGeo,
    new THREE.MeshLambertMaterial({ color:0x2a2018 }), GUILD_CLOCKS.length*2);
  guildClockMesh.userData.inspectLabel = 'Guild clock';
  guildClockMesh.frustumCulled = false;
  scene.add(guildClockMesh);
}
var _gcM = new THREE.Matrix4(), _gcQ = new THREE.Quaternion(), _gcS = new THREE.Vector3(1,1,1), _gcP = new THREE.Vector3();
var _gcUp = new THREE.Vector3(0,1,0), _gcTangent = new THREE.Vector3(), _gcDir = new THREE.Vector3();
function updateGuildClock(){
  if(!guildClockMesh) return;
  var hour = dayNightHour();
  GUILD_CLOCKS.forEach(function(clk, ci){
    var ry = clk.ry || 0;
    /* screen-right for a viewer standing outside the wall looking in (i.e.
       forward = -normal, up = world up) is right = cross(forward,up) =
       (-sin ry, 0, -cos ry) — the NEGATIVE of loc()'s own local-+z tangent
       (sin ry, 0, cos ry). Caught by screenshot: with the un-negated
       tangent the hands swept counter-clockwise (mirror-image) instead of
       the clockwise sweep a real clock face reads. */
    _gcTangent.set(-Math.sin(ry), 0, -Math.cos(ry));
    /* pivot sits a hair proud of the face (0.16 along the wall's own
       outward normal) so the hands don't z-fight the stone dial behind it */
    _gcP.set(clk.x + Math.cos(ry)*0.16, clk.y, clk.z - Math.sin(ry)*0.16);
    /* hour hand: one full turn per 12h, short/thick. Minute hand: one full
       turn per game-HOUR (dayNightHour()'s own fractional part) since this
       world has no separate minutes counter — reads exactly like a real
       minute hand sweeping smoothly rather than ticking. */
    var hands = [ { theta:(hour%12)/12*Math.PI*2, len:clk.r*0.58, w:0.16 },
                  { theta:(hour%1)*Math.PI*2,      len:clk.r*0.88, w:0.10 } ];
    hands.forEach(function(hd, i){
      _gcDir.copy(_gcUp).multiplyScalar(Math.cos(hd.theta)).addScaledVector(_gcTangent, Math.sin(hd.theta));
      _gcQ.setFromUnitVectors(_gcUp, _gcDir);
      _gcS.set(hd.w, hd.len, hd.w);
      _gcM.compose(_gcP, _gcQ, _gcS);
      guildClockMesh.setMatrixAt(ci*2+i, _gcM);
    });
  });
  guildClockMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== NIGHT ILLUMINATION DRIVER =================
   Two halves of one system, both described in full in 45-kit.js.

   A. THE SURROUND POOL. Every static flame registered above (plus every
   street brazier, which registers itself inside brazierPlain/Ornate in
   65-facade.js) has been splatted into one 1024x1024 RGBA light map. Baking
   happens HERE, not in 45-kit.js, because this is the first point at which
   every fragment that can place a lamp has run. From here on the shader
   side is two uniforms a frame.

   B. LIT WINDOWS. Every window in the city registered itself through
   WINBOX() (45-kit.js) — that is the chokepoint that makes this true for
   buildings nobody has written yet. This block gives them a physical glow:
   ONE additive InstancedMesh, one draw call for every window in the city,
   per-instance colour black = unlit. Same one-mesh-for-a-whole-population
   pattern as nlMesh above; nothing here is a fourth rendering idiom.

   The schedule is the owner's, literally: windows come on across the sunset
   band, most are out by midnight, and a 1-in-20 minority (NLM_ALLNIGHT_FRAC)
   burn until dawn. WHICH windows are in that minority comes from a hash of
   the window's own world position, never rnd() — so the same windows keep
   the same habits across a rebuild, and an unrelated edit upstream cannot
   reshuffle them (SUBAGENT.md section 6). */
var nlmStats = nlmBake();

var NWIN_ON0 = 17.2, NWIN_ONS = 4.0;                      /* first lamps ~17:12, last ~21:12 */
var NWIN_OFF0 = 20.8, NWIN_OFFS = 4.2, NWIN_OFFP = 1.6;   /* out 20:48..01:00, weighted early so "mostly by midnight" holds */
var NWIN_DAWN = 30.0;                                     /* 06:00 next day: the all-nighters finally blow out */
/* the night runs across the midnight wrap, so work on a 12..36 timeline
   instead of 0..24 — same trick the temple braziers' noon-to-sunrise window
   needs above, done once here rather than per comparison. */
function nlWinT(hour){ return hour >= 12 ? hour : hour + 24; }
function nlWinLit(t, hA, hB, allNight){
  var on = NWIN_ON0 + NWIN_ONS*hA;
  var off = allNight ? NWIN_DAWN : (NWIN_OFF0 + NWIN_OFFS*Math.pow(hB, NWIN_OFFP));
  if(off < on + 0.4) off = on + 0.4;    /* nobody lights a lamp and blows it out in the same breath */
  return t >= on && t < off;
}

var nwMesh = null;
if(NL_WINDOWS.length){
  /* a soft radial pane rather than a flat rectangle: a hard-edged bright
     box reads as a decal stuck on the wall, this reads as light coming
     through an opening and bleeding round the reveal. */
  var nwTex = (function(){
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(16,16,0, 16,16,16);
    gr.addColorStop(0.00, 'rgba(255,255,255,1.00)');
    gr.addColorStop(0.40, 'rgba(255,250,236,0.80)');
    gr.addColorStop(0.74, 'rgba(255,232,192,0.28)');
    gr.addColorStop(1.00, 'rgba(255,222,172,0)');
    g.fillStyle = gr; g.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(c);
  })();
  var nwMat = new THREE.MeshBasicMaterial({ map:nwTex, color:0xffffff, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false, fog:false });
  nwMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), nwMat, NL_WINDOWS.length);
  nwMesh.frustumCulled = false;
  nwMesh.userData.inspectLabel = 'Lit window';
  (function(){
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    var up = new THREE.Vector3(0,1,0), black = new THREE.Color(0,0,0);
    NL_WINDOWS.forEach(function(W, i){
      p.set(W[0], W[1], W[2]);
      q.setFromAxisAngle(up, W[3]);
      /* W[4..6] are the window BOX's own local extents. Whichever of the
         two horizontal ones is the thin one IS the wall normal, so the glow
         needs no facing argument: inflate the two in-plane extents and give
         the thin axis a fixed 1.35 so the box pokes ~0.55 proud of the wall
         on the outside (and the same on the inside, which costs nothing and
         means a window seen from a courtyard behind still glows). */
      s.set(W[4] < 0.6 ? 1.9 : W[4]*1.75, W[5]*1.8, W[6] < 0.6 ? 1.9 : W[6]*1.75);
      m.compose(p,q,s);
      nwMesh.setMatrixAt(i,m);
      /* seeded on EVERY slot before the first frame — SUBAGENT.md section 6
         traps 1 and 2: an instanceColor first written at frame time gets a
         program compiled without the instance-colour path and renders pure
         white forever, and a partially-written buffer blacks out the rest. */
      nwMesh.setColorAt(i, black);
    });
    nwMesh.instanceColor.needsUpdate = true;
  })();
  scene.add(nwMesh);
}

var NW_LIT_N = 0, NW_LAST_KEY = -1;
var _nwCol = new THREE.Color();
/* An eclipse is a two-hour dusk in the middle of the day, so the clock-based
   habit schedule above cannot answer it: at hour 12 nothing is lit and the
   city would sit dark through its own twilight. WHICH windows light early is
   the window's own position hash (W[7]), never rnd(), so it is stable across
   rebuilds and across repeated eclipses — the same houses light their lamps
   first every time. */
function nlEclipseLit(ecl, hA){ return ecl > 0.42 && hA < (ecl - 0.42)*1.45; }
function nlUpdateWindows(hour, ecl){
  if(!nwMesh) return;
  ecl = ecl || 0;
  var key = Math.floor(hour*40) + 100000*Math.round(ecl*12);   /* re-roll 40x a game hour, and on any eclipse step */
  if(key === NW_LAST_KEY) return;
  NW_LAST_KEY = key;
  var t = nlWinT(hour), n = 0, N = NL_WINDOWS.length;
  for(var i=0;i<N;i++){
    var W = NL_WINDOWS[i];
    if(nlWinLit(t, W[7], W[8], W[9]) || nlEclipseLit(ecl, W[7])){
      /* per-window flame strength from the window's OWN hash — a street of
         identically bright rectangles is the giveaway that this is a decal.
         Written as raw linear RGB, not a palette hex: SUBAGENT.md section 6
         trap 3 (emitBuckets converts sRGB->linear, a runtime tint does not,
         so a hex handed straight to setColorAt renders washed out). */
      var b = 0.85 + 0.70*W[7];
      _nwCol.setRGB(1.00*b, 0.58*b, 0.24*b);
      n++;
    }else{
      _nwCol.setRGB(0,0,0);                /* additive: black is genuinely off */
    }
    nwMesh.setColorAt(i, _nwCol);
  }
  nwMesh.instanceColor.needsUpdate = true;
  NW_LIT_N = n;
  /* the light map's window channel was baked with every window lit, so the
     wash those windows throw on the street scales by how many are actually
     burning right now. One uniform, whole city. */
  NLM_U.uNlWin.value = n / N;
}

window._nightGlow = {
  lamps: nlmStats.lamps, windows: nlmStats.windows, res: nlmStats.res,
  peakLampPool: nlmStats.peakLampPool, peakWinPool: nlmStats.peakWinPool,
  /* the coloured (green) lamps: count, and the exact uniform payload the
     shader is reading, so the Fortress tower flames' pool can be probed
     headlessly the same way the warm one can */
  green: nlmStats.green,
  greenList: function(){ return NL_GREEN; },
  greenUniform: function(){ return NLM_U.uNlG.value.map(function(v){ return [v.x,v.y,v.z,v.w]; }); },
  greenAmp: function(){ return NLM_U.uNlGAmp.value.slice(); },
  fortFlames: function(){ return FORT_FLAME_IDX.slice(); },
  allNightFrac: (function(){ var n=0; NL_WINDOWS.forEach(function(W){ if(W[9]) n++; });
                             return NL_WINDOWS.length ? n/NL_WINDOWS.length : 0; })(),
  litNow: function(){ return NW_LIT_N; },
  /* raw registries, for headless probing (everything in this build lives
     inside BUILD()'s own scope, so a Playwright evaluate() cannot reach
     NL_LAMPS/NL_WINDOWS without a handle like this) */
  lampList: function(){ return NL_LAMPS; },
  winList: function(){ return NL_WINDOWS; },
  /* diagnostic: the lit fraction at an arbitrary hour without moving the
     clock, so the curve can be MEASURED rather than asserted */
  litFrac: function(h){
    var t = nlWinT(h), n = 0;
    for(var i=0;i<NL_WINDOWS.length;i++){ var W = NL_WINDOWS[i]; if(nlWinLit(t,W[7],W[8],W[9])) n++; }
    return NL_WINDOWS.length ? n/NL_WINDOWS.length : 0;
  }
};

/* time-of-day slider: drives the one clock in 21-sky.js directly while the
   owner drags it (skySetHour, same call window._dayNight.setHour makes), and
   otherwise the slider
   + readout just track the live clock every frame so it reads as "the
   current time," not a control that goes stale the moment you let go. */
var dnSlider = document.getElementById('dnSlider'), dnHourOut = document.getElementById('dnHourOut');
var dnDragging = false;
if(dnSlider){
  dnSlider.addEventListener('pointerdown', function(){ dnDragging = true; });
  ['pointerup','pointercancel'].forEach(function(ev){
    dnSlider.addEventListener(ev, function(){ dnDragging = false; });
  });
  dnSlider.addEventListener('input', function(){ skySetHour(parseFloat(dnSlider.value)); });
}
function dnFormatHour(h){
  var hh = Math.floor(h), mm = Math.floor((h-hh)*60);
  return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
}

(function dayNightLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateDayNight();
    if(typeof updateWeather === 'function') updateWeather(dt);   /* 83-weather.js — storm dimming/rain/lightning layered on top */
    nlMat.opacity = 0.15 + 0.85*DAYNIGHT_NIGHT_K;
    /* the illumination pool and the lit windows, both gated on the same
       dusk-to-dawn factor every other night light already reads, so none of
       this can leak into daylight: at noon uNlNight is 0 and the shader's
       whole block is branched over. */
    NLM_U.uNlNight.value = DAYNIGHT_NIGHT_K;
    nlUpdateWindows(SKY_STATE.hour, SKY_STATE.ecl);
    if(nwMesh) nwMesh.material.opacity = Math.min(1, DAYNIGHT_NIGHT_K*1.5);
    /* boats: canoes/ferries/ships/pleasure barge/river barges, read
       straight off LIFE_AVOID_X/Z (78-life.js's own live per-frame
       position array for collision avoidance) — see LANTERN_BOAT_BASE's
       own comment above for why this needs no edit to any of those 5
       update functions. Ordinators/caravans/water taxis/silt striders
       track their own reserved slot directly, inside their own update
       function (78-life.js/79-striders.js), via this same nlTrack(). */
    for(var _lbi=0; _lbi<LANTERN_BOAT_N; _lbi++){
      nlTrack(LANTERN_BOAT_BASE+_lbi, LIFE_AVOID_X[_lbi], SEA+3.2, LIFE_AVOID_Z[_lbi]);
    }
    nlMesh.instanceMatrix.needsUpdate = true;
    /* temple braziers: lit from noon (h=12) until the following sunrise
       (h=6) — a window that WRAPS past midnight, unlike the shared
       dusk-to-dawn night-light timer above, so it needs its own check
       rather than reading DAYNIGHT_NIGHT_K. Only rewrites instance colour
       on an actual on/off transition, not every frame. */
    if(TEMPLE_BRAZIER_IDX.length){
      var _tbHour = dayNightHour();
      var _tbLit = (_tbHour >= 12 || _tbHour < 6);
      if(_tbLit !== TEMPLE_BRAZIER_LIT){
        TEMPLE_BRAZIER_LIT = _tbLit;
        var _tbCol = _tbLit ? TEMPLE_BRAZIER_LIT_COL : TEMPLE_BRAZIER_OFF_COL;
        TEMPLE_BRAZIER_IDX.forEach(function(idx){ nlMesh.setColorAt(idx, _tbCol); });
        nlMesh.instanceColor.needsUpdate = true;
      }
    }
    if(lhBeamMesh){
      LH_SPIN_T += dt;
      lhBeamMesh.material.opacity = 0.22*DAYNIGHT_NIGHT_K;
      _lhP.set(0,0,0);
      LH_BEACONS.forEach(function(b){
        _lhP.set(b.x, b.y, b.z);
        for(var k=0;k<b.beams;k++){
          var ang = LH_SPIN_T*b.spin + k*(Math.PI*2/b.beams);
          _lhQ.setFromAxisAngle(LIFE_UP || new THREE.Vector3(0,1,0), ang);
          _lhM.compose(_lhP, _lhQ, _lhS);
          lhBeamMesh.setMatrixAt(b.slot0+k, _lhM);
        }
      });
      lhBeamMesh.instanceMatrix.needsUpdate = true;
    }
    updateGuildClock();
    if(dnSlider && !dnDragging){
      var h = dayNightHour();
      dnSlider.value = h;
      if(dnHourOut) dnHourOut.textContent = dnFormatHour(h);
    }else if(dnHourOut && dnSlider){
      dnHourOut.textContent = dnFormatHour(parseFloat(dnSlider.value));
    }
  }
  requestAnimationFrame(tick);
})();

window._dayNight = { hour: dayNightHour, nightLights: NIGHT_LIGHTS.length, secPerHour: DAYNIGHT_SEC_PER_HOUR,
  paused: function(){ return SKY.paused; }, setPaused: setDayNightPaused,
  brazierLit: function(){ return TEMPLE_BRAZIER_LIT; },
  dayOfYear: skyDayOfYear, setDay: skySetDayOfYear,
  /* the night-light gate, so the sky/night-lighting reconciliation can be
     MEASURED headlessly rather than argued from pixels */
  nightK: function(){ return DAYNIGHT_NIGHT_K; },
  litWindows: function(){ return NW_LIT_N; },
  keyLight: function(){ return { i:+sun.intensity.toFixed(4),
                                 dir:[+SKY_STATE.keyDir.x.toFixed(3), +SKY_STATE.keyDir.y.toFixed(3), +SKY_STATE.keyDir.z.toFixed(3)],
                                 col:'#'+sun.color.getHexString(),
                                 hemi:+hemiLight.intensity.toFixed(4), amb:+ambLight.intensity.toFixed(4) }; },
  setHour: skySetHour };   /* diagnostic: jump the clock for headless verification */
