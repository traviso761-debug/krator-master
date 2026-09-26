/* ============================== 15b. FACADES ==============================
   Detail pass over the town: doors, windows, cornice/roof clutter and
   canopy-awnings on `tag:'town'` buildings; gate awnings, corner finials,
   clan banners and a dressed interior garden on `COMPOUNDS`; a plain door on
   the odd `velothi-out` outbuilding that has none. Buildings are not moved
   or resized — this only adds surface detail on top of the footprints
   `60-land.js` already claimed.

   Reads PLACED / COMPOUNDS (read-only). Emits through the kit only, and only
   ever with (shape, family) pairs already drawn elsewhere in the build, so
   this pass adds zero draw calls: box|stone, box|wood, fr8|stone, fr8|roof,
   cyl|stone, cyl|wood, cone|roof, dome|dome, blob|leaf, stk|trunk.          */
reseed(650001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */

/* ---- tuning -------------------------------------------------------------- */
var FACADE = {
  /* windows — bumped across the board per the owner's "canton buildings, in
     general, could use more windows" pass; see also addWindows() below,
     which covers the courtyard/arena-rim buildings that got no window
     treatment at all before this round. */
  poorFrontWinChance : 0.68,   /* chance of a SECOND front window on a hovel  */
  winChanceUpper     : 0.55,   /* domed only: a second-row window higher up  */
  winChanceSide      : 0.70,
  poorSideWinChance  : 0.45,
  /* roofline */
  chimneyChance      : 0.35,
  /* awnings */
  awningChance       : 0.55,   /* on 'grand' non-poor buildings              */
  grandHeight        : 17,
  /* poor buildings: a bolted-on upper-floor loft/storage addition, roughly
     half of them */
  slumAdditionChance : 0.5,
  /* plaster-town pass (owner: "ALL of them get at least 4 windows and 1
     chimney... 50% ... cloth canopy... 1 in 10 ... a 2nd storey... about
     25% ... smoke"). Windows and the chimney are unconditional (not tuned
     here); these three are the probabilistic extras, each selected by a
     deterministic per-building position hash (plasterHash below) rather
     than chance()/the shared rnd() stream, per the brief's own ask for
     "stable across rebuilds" selection. */
  plasterCanopyChance      : 0.66,   /* owner: "make 66% of non-domed plaster buildings have one" (was 0.50) */
  plasterSecondStoreyChance: 0.10,
  plasterSmokeChance       : 0.25,
  /* compounds: must mirror compound()'s own garden offset in 60-land.js —
     the COMPOUNDS record's centre sits 0.42*wallFx forward (local +x, i.e.
     towards the gate) of the wall's true centre O */
  gateOffFrac        : 0.42
};

function bucketTotal(){ var n=0; for(var k in BUCKET) n += BUCKET[k].list.length; return n; }
var _facadeStart = bucketTotal();
var FJ = { town:0, other:0, compound:0 };
/* per-feature counters for the plaster-town pass, published on window._*
   per this project's own instrumentation convention (API.md ss8) so the
   planner can check windows/chimney/canopy/2nd-storey/smoke rates without
   reading the code. */
var PLASTER_STAT = { buildings:0, canopy:0, secondStorey:0, smoking:0 };

/* Deterministic per-building selector, hashed from world position (same
   sin/dot-hash idiom applyWorldUV() and the cloth-sway phase already use
   elsewhere in this build) rather than the shared rnd() stream: the same
   building gets the same canopy/2nd-storey/smoke verdict on every rebuild
   regardless of how many rnd() draws happen elsewhere first or how many
   candidates get rejected ahead of it in PLACED. `salt` decorrelates the
   three independent draws made off the same (x,z). Returns [0,1). */
function plasterHash(x,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + salt*37.719) * 43758.5453;
  return v - Math.floor(v);
}

/* ========================= SMOKE PARTICLE SYSTEM ===========================
   Replaces the "static baked BLOB puff" stand-in that the blacksmith forge
   (50-cantons.js), the potter's kiln, the glassmaker's furnace, the tavern
   chimney (below) and ~160 plaster-house chimneys (townFacade, below) all
   used, with one real particle system: puffs that rise, lean off with the
   wind, swell as they cool, wobble, wash out toward the haze colour and
   recycle at the top of the plume.

   SHAPE: modelled directly on this same file's MILL_CLUSTERS /
   registerMillCluster() rig (further down) — one shared InstancedMesh for
   EVERY chimney, forge, kiln and furnace in the city, built lazily behind a
   dirty flag by this section's own requestAnimationFrame loop, so it costs
   exactly ONE draw call however many emitters register, and literally
   nothing at all while none has. Static kit geometry is merged and immutable
   (see SUBAGENT.md), so anything that moves needs its own small
   InstancedMesh; this is that, shared.

   STATELESS SIMULATION. There is no per-particle velocity to integrate and
   nothing to "respawn": a puff's whole life is a pure function of its
   normalised age u, and u is just frac(t/life + phase). Recycling is the
   modulo. That means the rig is exactly restartable, costs no bookkeeping,
   and an emitter that goes unsimulated for a while (e.g. if a future pass
   adds distance culling) resumes correct on the next frame it is touched.

   FADING WITHOUT ALPHA. Per-instance opacity is not available on a shared
   MeshLambertMaterial, and a transparent material would fight the water's
   own transparent ShaderMaterial at renderOrder 2. So a puff dies by
   shrinking to zero scale while its per-instance colour walks toward
   PAL.haze — the same wash the fog applies with distance, applied with age.

   INSTANCE-COLOUR TRAPS (SUBAGENT.md s6), all three handled:
     1. blackening — every slot is white-seeded in smokeRebuild() and then
        re-coloured every frame, so no slot is ever left in the lazily
        allocated zero-filled state;
     2. whitening  — that white seed happens at mesh construction, i.e.
        before the mesh's first render, so the program is compiled WITH the
        instance-colour path;
     3. washed-out — the per-emitter colour ramp is baked through
        convertSRGBToLinear() at rebuild time (one 16-step LUT per emitter),
        matching emitBuckets()'s own conversion, so a palette hex reads the
        same here as it does on a baked wall.

   DETERMINISM. registerSmokeEmitter() draws NOTHING from the global LCG —
   every per-particle constant is hashed off the emitter's own world
   position through plasterHash() above. That is what lets 50-cantons.js
   register the forge, kiln and furnace mid-fragment without shifting the
   cantons/districts generated after them.                                  */

/* ---- tuning: the shared shape of a plume. Per-emitter flavour (rate, size,
   colour, drift) is the opt bag registerSmokeEmitter() takes; these are the
   curves every plume has in common. NOT read at registration time — only at
   rebuild/frame time — because 50-cantons.js calls registerSmokeEmitter()
   before this fragment's own top level has run (function declarations hoist
   across the shared BUILD() scope; var initialisers do not). ---- */
var SMOKE = {
  steps     : 16,      /* colour-ramp LUT resolution per emitter            */
  windX     : 0.62,    /* the city's prevailing drift, per unit of lean     */
  windZ     : -0.38,
  riseEase  : 1.7,     /* >1: leaves the flue fast, bunches up as it cools  */
  growPow   : 0.5,     /* sqrt: swells quickly, then holds                  */
  birthRamp : 0.035,   /* fraction of life spent popping in at the flue —
                          kept short so the plume starts AT the flue mouth
                          and not a few units above it, which reads as a
                          detached cloud rather than as smoke coming out    */
  fadeStart : 0.64,    /* fraction of life after which it dissipates        */
  squash    : 0.82,    /* puffs are wider than they are tall                */
  tumble    : 0.22,    /* rad/sec of slow roll, so the facets never sit still */
  /* the two knobs that stop a plume reading as a regular string of beads —
     the first draft did, and it was the one thing that gave the effect
     away. bloom flares each puff's birth offset outward as it ages, so the
     column widens into a cone instead of staying a single file; rateVar
     gives every puff its own slightly different life length, so they drift
     relative to each other and clump and gap the way real smoke does
     instead of holding a fixed spacing forever. */
  bloom     : 2.10,
  rateVar   : 0.34,    /* +/- fraction on an individual puff's climb rate   */
  /* defaults = a domestic house chimney; a forge overrides upward          */
  n:5, life:5.2, rise:9.0, r0:0.45, r1:1.9, spread:0.42, sway:0.45,
  swirl:0.9, lean:0.5, hotEnd:0, col:0x9a958c
};

/* lazy-init against the var hoist: 50-cantons.js registers the forge, the
   kiln and the furnace BEFORE this line has executed, so the array has to be
   created by the first registerSmokeEmitter() call and merely adopted here. */
var SMOKE_EMITTERS = SMOKE_EMITTERS || [];
var SMOKE_BASE = [], SMOKE_TOTAL = 0, SMOKE_DIRTY = false, SMOKE_T = 0;
/* per-particle constants, hashed at rebuild: phase, birth scatter, size
   variation, wobble phase, and a fixed tumble axis */
var SMK_PH=null, SMK_CX=null, SMK_CZ=null, SMK_SZ=null, SMK_WB=null,
    SMK_RX=null, SMK_RY=null, SMK_RZ=null, SMK_SP=null;

/* registerSmokeEmitter(x, y, z, opt) — x,y,z is the mouth of the flue (the
   point puffs are born at). opt overrides any SMOKE default above:
     n      pool size, i.e. puffs in flight at once
     life   seconds for one puff to climb the whole plume and dissipate
     rise   how far it climbs, world units
     r0/r1  puff radius at birth / at full swell
     spread how far off the flue axis puffs are born
     sway   lateral wobble amplitude;  swirl  its rate
     lean   how hard the prevailing wind bends the plume over
     col    the body colour of the smoke
     colHot a hotter/darker tone for the first hotEnd of its life (a forge)
     colTop what it washes out toward (default PAL.haze)
     phase  offsets the whole plume so neighbouring chimneys aren't in step
   Returns the emitter record. Marks the rig dirty; the next animation frame
   rebuilds the single shared mesh to include it. */
function registerSmokeEmitter(x, y, z, opt){
  var e = { x:x, y:y, z:z, o: opt || {} };
  if(!SMOKE_EMITTERS) SMOKE_EMITTERS = [];
  SMOKE_EMITTERS.push(e);
  SMOKE_DIRTY = true;
  return e;
}

var smokeGeo = null, smokeMat = null, smokeMesh = null;
var _smkM = new THREE.Matrix4(), _smkQ = new THREE.Quaternion();
var _smkP = new THREE.Vector3(), _smkS = new THREE.Vector3();
var _smkE = new THREE.Euler(), _smkCol = new THREE.Color();
var _smkA = new THREE.Color(), _smkB = new THREE.Color();

function smkOpt(o,k,d){ return (o[k] === undefined) ? d : o[k]; }

/* one emitter's age->colour ramp, baked to LINEAR space (trap 3). Below
   hotEnd it runs colHot -> col (the glow at a forge mouth); above it runs
   col -> colTop, which is the dissipation. */
function smokeRamp(e){
  var N = SMOKE.steps, lut = new Float32Array(N*3);
  for(var s=0;s<N;s++){
    var u = s/(N-1), t;
    if(e.hotEnd > 0 && u < e.hotEnd){ _smkA.set(e.colHot); _smkB.set(e.col); t = u/e.hotEnd; }
    else { _smkA.set(e.col); _smkB.set(e.colTop); t = (u-e.hotEnd)/(1-e.hotEnd); }
    _smkA.lerp(_smkB, t).convertSRGBToLinear();
    lut[s*3] = _smkA.r; lut[s*3+1] = _smkA.g; lut[s*3+2] = _smkA.b;
  }
  return lut;
}

function smokeRebuild(){
  SMOKE_DIRTY = false;
  if(smokeMesh){ scene.remove(smokeMesh); smokeMesh = null; }   /* geo/mat are shared — never disposed */
  SMOKE_BASE = []; SMOKE_TOTAL = 0;
  SMOKE_EMITTERS.forEach(function(e){
    var o = e.o;
    e.n      = Math.max(1, Math.round(smkOpt(o,'n',      SMOKE.n)));
    e.life   = Math.max(0.2,  smkOpt(o,'life',   SMOKE.life));
    e.rise   = smkOpt(o,'rise',   SMOKE.rise);
    e.r0     = smkOpt(o,'r0',     SMOKE.r0);
    e.r1     = smkOpt(o,'r1',     SMOKE.r1);
    e.spread = smkOpt(o,'spread', SMOKE.spread);
    e.sway   = smkOpt(o,'sway',   SMOKE.sway);
    e.swirl  = smkOpt(o,'swirl',  SMOKE.swirl);
    e.lean   = smkOpt(o,'lean',   SMOKE.lean);
    e.hotEnd = smkOpt(o,'hotEnd', SMOKE.hotEnd);
    e.col    = smkOpt(o,'col',    SMOKE.col);
    e.colHot = smkOpt(o,'colHot', e.col);
    e.colTop = smkOpt(o,'colTop', PAL.haze);
    e.phase  = smkOpt(o,'phase',  0);
    e.lut    = smokeRamp(e);
    SMOKE_BASE.push(SMOKE_TOTAL); SMOKE_TOTAL += e.n;
  });
  if(SMOKE_TOTAL === 0) return;
  SMK_PH = new Float32Array(SMOKE_TOTAL); SMK_CX = new Float32Array(SMOKE_TOTAL);
  SMK_CZ = new Float32Array(SMOKE_TOTAL); SMK_SZ = new Float32Array(SMOKE_TOTAL);
  SMK_WB = new Float32Array(SMOKE_TOTAL); SMK_RX = new Float32Array(SMOKE_TOTAL);
  SMK_RY = new Float32Array(SMOKE_TOTAL); SMK_RZ = new Float32Array(SMOKE_TOTAL);
  SMK_SP = new Float32Array(SMOKE_TOTAL);
  SMOKE_EMITTERS.forEach(function(e, ei){
    var base = SMOKE_BASE[ei];
    for(var i=0;i<e.n;i++){
      var k = base+i;
      /* an even spacing along the plume plus a hashed nudge, so the puffs
         are not a perfectly regular string of beads */
      SMK_PH[k] = (i/e.n + e.phase/(Math.PI*2) + plasterHash(e.x,e.z,i*1.7+3.1)*0.5/e.n) % 1;
      SMK_CX[k] = plasterHash(e.x,e.z,i*2.3+11.7)*2-1;
      SMK_CZ[k] = plasterHash(e.x,e.z,i*2.9+23.3)*2-1;
      SMK_SZ[k] = 0.78 + plasterHash(e.x,e.z,i*3.7+31.1)*0.48;
      SMK_WB[k] = plasterHash(e.x,e.z,i*4.1+41.9)*Math.PI*2;
      SMK_RX[k] = plasterHash(e.x,e.z,i*4.7+53.7)*Math.PI*2;
      SMK_RY[k] = plasterHash(e.x,e.z,i*5.3+61.3)*Math.PI*2;
      SMK_RZ[k] = plasterHash(e.x,e.z,i*5.9+73.1)*Math.PI*2;
      SMK_SP[k] = 1 + (plasterHash(e.x,e.z,i*6.7+83.9)*2-1)*SMOKE.rateVar;
    }
  });
  /* 80 triangles a puff: a smooth-shaded icosphere reads as a soft volume at
     the sizes these run at, where a 20-triangle detail-0 hull reads as a
     crystal. Unit radius, so the instance scale IS the puff radius. */
  if(!smokeGeo) smokeGeo = new THREE.IcosahedronGeometry(1, 1);
  if(!smokeMat) smokeMat = new THREE.MeshLambertMaterial({ color:0xffffff });
  smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, SMOKE_TOTAL);
  smokeMesh.userData.inspectLabel = 'Smoke';
  smokeMesh.frustumCulled = false;      /* one mesh spanning the whole city */
  /* white-seed every slot before the mesh is ever rendered — traps 1 and 2 */
  _smkCol.setRGB(1,1,1);
  for(var s=0;s<SMOKE_TOTAL;s++) smokeMesh.setColorAt(s, _smkCol);
  scene.add(smokeMesh);
  _smokeStat.emitters = SMOKE_EMITTERS.length;
  _smokeStat.particles = SMOKE_TOTAL;
  _smokeStat.triangles = SMOKE_TOTAL*80;
  _smokeStat.drawCalls = 1;
  _smokeStat.byKind = {};
  SMOKE_EMITTERS.forEach(function(e){
    var kd = smkOpt(e.o,'kind','?');
    var b = _smokeStat.byKind[kd] || (_smokeStat.byKind[kd] = {n:0, puffs:0});
    b.n++; b.puffs += e.n;
  });
}

function updateSmoke(dt){
  SMOKE_T += dt;
  if(SMOKE_DIRTY) smokeRebuild();
  if(!smokeMesh) return;      /* dormant no-op while nothing has registered */
  var N1 = SMOKE.steps - 1;
  for(var ei=0; ei<SMOKE_EMITTERS.length; ei++){
    var e = SMOKE_EMITTERS[ei], base = SMOKE_BASE[ei], lut = e.lut, inv = 1/e.life;
    for(var i=0;i<e.n;i++){
      var k = base+i;
      var u = (SMOKE_T*inv*SMK_SP[k] + SMK_PH[k]) % 1;       /* age, 0..1; the modulo IS the recycle */
      var hh = e.rise * (1 - Math.pow(1-u, SMOKE.riseEase)); /* buoyant off the flue, slowing as it cools */
      var lean = u*u*e.rise*e.lean;                          /* the plume bends over as it drifts */
      var wob = Math.sin(SMOKE_T*e.swirl + SMK_WB[k]) * e.sway * u;
      var flare = e.spread*(1 + u*SMOKE.bloom);              /* the column widens into a cone as it cools */
      _smkP.set(e.x + SMK_CX[k]*flare + SMOKE.windX*lean + wob,
                e.y + hh,
                e.z + SMK_CZ[k]*flare + SMOKE.windZ*lean + wob*0.7);
      var rad = (e.r0 + (e.r1-e.r0)*Math.pow(u, SMOKE.growPow)) * SMK_SZ[k];
      var env = u < SMOKE.birthRamp ? u/SMOKE.birthRamp
              : (u > SMOKE.fadeStart ? 1-(u-SMOKE.fadeStart)/(1-SMOKE.fadeStart) : 1);
      rad *= env*env*(3-2*env);          /* smoothstepped in and out -> shrinks to nothing */
      _smkE.set(SMK_RX[k], SMK_RY[k] + SMOKE_T*SMOKE.tumble, SMK_RZ[k]);
      _smkQ.setFromEuler(_smkE);
      _smkS.set(rad, rad*SMOKE.squash, rad);
      _smkM.compose(_smkP, _smkQ, _smkS);
      smokeMesh.setMatrixAt(k, _smkM);
      var li = (u*N1)|0; if(li>N1) li = N1; li *= 3;
      smokeMesh.setColorAt(k, _smkCol.setRGB(lut[li], lut[li+1], lut[li+2]));
    }
  }
  smokeMesh.instanceMatrix.needsUpdate = true;
  if(smokeMesh.instanceColor) smokeMesh.instanceColor.needsUpdate = true;
}

/* this section's own clock — same self-contained idiom as millLoop below,
   84-fauna.js's faunaLoop and 82-daynight.js's dayNightLoop. Free to run
   while SMOKE_EMITTERS is empty: updateSmoke() returns immediately. */
(function smokeLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateSmoke(dt);
  }
  requestAnimationFrame(tick);
})();

/* plain numbers, not getters, so they show up in verify.py's counter dump
   and in the baseline delta (API.md s8). Refreshed by smokeRebuild(). */
var _smokeStat = { emitters:0, particles:0, triangles:0, drawCalls:0, byKind:{} };
window._smoke = _smokeStat;

/* place a wall window, clear of the door, clamped to fit inside the face;
   returns true if it fit. sign is which side of the door to try. */
function wallWindow(x,z,ry,fx0,fz0,y,doorHalfW,winCol,sign,wMin,wMax,hMin,hMax){
  var ww = Math.min(rr(wMin,wMax), fz0*0.42);
  var minLat = doorHalfW + ww*0.5 + rr(0.35,1.0);
  var maxLat = fz0 - ww*0.5 - 0.25;
  if(maxLat < minLat) return false;
  var lat = sign*mix(minLat,maxLat,rr(0.15,0.85));
  var wp = loc(x,z, fx0+0.05, lat, ry);
  /* WINBOX, not BOX: same geometry, plus the night-lighting registration
     (45-kit.js). This is the single busiest window emitter in the build. */
  WINBOX(wp[0], y, wp[1], 0.4, rr(hMin,hMax), ww, ry, winCol);
  return true;
}

/* a stepped, descending, outward-cascading canopy over a door — several
   thin roof-family slabs, each further out and lower than the last and a
   little narrower, so the silhouette reads as a sloped fabric awning with a
   scalloped edge rather than one flat shelf. On corner posts. */
function doorAwning(x,z,ry,fx0,dw,dh,yb,doorCol){
  var steps = 3, outStep = 0.62, drop = 0.46, wLoss = 0.85;
  var outBase = fx0 + 0.85, topY = yb + dh - 0.10, wBase = dw + 1.9;
  var lastOutX = outBase, lastY = topY, lastW = wBase;
  for(var i=0;i<steps;i++){
    var outX = outBase + i*outStep;
    var yy = topY - i*drop;
    var ww = Math.max(0.9, wBase - i*wLoss);
    var p = loc(x,z, outX, 0, ry);
    FR8(p[0], yy, p[1], outStep+0.20, 0.28, ww, ry, pick(ROOFS), 'roof');
    lastOutX=outX; lastY=yy; lastW=ww;
    FJ.town++;
  }
  [-1,1].forEach(function(s){
    var pp = loc(x,z, lastOutX+0.35, s*lastW*0.42, ry);
    CYL(pp[0], yb, pp[1], 0.16, lastY-yb, 0, shade(doorCol,-0.1), 'wood');
    FJ.town++;
  });
}

/* a bolted-on upper-floor addition for poor buildings — not a sun-shade over
   the door but covered/enclosed extra space jutting off an upper part of a
   SIDE wall (leaves the door/window front face alone), roughly attic scale,
   on visible struts, roofed in a fabric-toned (BANNERC) lean-to panel. */
function slumAddition(p){
  var x=p.x, z=p.z, ry=p.ry, fx0=p.fx0, fz0=p.fz0, yb=p.yb, h=p.h, col=p.col;
  var side = chance(0.5) ? 1 : -1;
  var extend = Math.min(rr(2.0,3.4), fx0*0.9);            /* how far it juts out */
  var lenX = Math.min(fx0*1.8, fx0*rr(1.0,1.6));           /* fraction of the wall it covers */
  var loY = yb + h*rr(0.40,0.54);
  var boxH = Math.min(h*rr(0.30,0.42), (yb+h*0.94) - loY);
  if(boxH < 1.2) return;                                   /* too small a building to bother */
  var hiY = loY + boxH;
  var mid = loc(x,z, rr(-0.10,0.10)*fx0, side*(fz0+extend*0.5), ry);
  /* the enclosed loft/storage box itself — same stone family as the house */
  BOX(mid[0], loY, mid[1], lenX, boxH, extend, ry, shade(col,-0.05));
  FJ.town++;
  /* two struts holding the outer edge, so it reads as attached, not floating.
     box|wood, not cyl|wood — same already-spent bucket the rest of the file
     uses for posts, but a box is 12 triangles against a 10-segment cylinder's
     40; this pass adds a chimney+4-windows to every one of ~680 plaster
     buildings against a triangle budget with very little headroom left, so
     every unnecessary triangle in the branch that feeds them (this one)
     gets traded down. */
  var outerZ = side*(fz0+extend);
  [-1,1].forEach(function(sg){
    var sp = loc(x,z, sg*lenX*0.38, outerZ, ry);
    BOX(sp[0], yb, sp[1], 0.14, loY-yb, 0.14, 0, shade(col,-0.3), 'wood');
    FJ.town++;
  });
  /* a lean-to fabric-toned roof off the wall, biased to BANNERC rather than
     the house's own colour — one slab, not the original's two-step cascade
     (same triangle-budget reason as the struts above; the box underneath
     already reads as the volume, this is just enough roof to keep it from
     looking flat-topped). */
  var roofCol = pick(BANNERC);
  var rp = loc(x,z, rr(-0.06,0.06)*fx0, side*(extend*0.5), ry);
  FR8(rp[0], hiY, rp[1], lenX*1.05, boxH*0.22, extend+0.35, ry, roofCol, 'roof');
  FJ.town++;
}

/* ============================== town buildings ============================== */
function townFacade(p){
  var x=p.x, z=p.z, ry=p.ry, fx0=p.fx0, fz0=p.fz0, yb=p.yb, h=p.h, kind=p.kind, col=p.col, poor=p.poor;
  var doorCol = shade(pick(ROOFS), rr(-0.06,0.06));
  var winCol  = shade(col, -0.55);

  /* --- door, always, centred on the street-facing (local +x) face --- */
  var dw = poor ? rr(1.5,2.0) : rr(1.8,2.4);
  var dh = poor ? rr(2.6,3.2) : rr(3.0,3.9);
  dw = Math.min(dw, fz0*0.9); dh = Math.min(dh, h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], yb, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  FJ.town++;

  if(poor){
    PLASTER_STAT.buildings++;
    /* owner: "ALL of them get at least 4 windows and 1 chimney" — plaster
       town buildings (poor === true; the stone/wealthy branch below is
       untouched). Unconditional, not chance()-gated, and sized by formula
       (not wallWindow's own clamp-and-maybe-fail) so all 4 are a real
       guarantee down to the smallest hovel footprint: 2 on the front face
       flanking the door, sized as a fraction of the space actually left
       past the door so they mathematically cannot fail to fit, and 2 on
       the blank rear (local -x) face, which never has a door to dodge. */
    var winYp = yb + rr(1.3,2.1);
    var avail = Math.max(0.6, fz0 - dw*0.5);        /* clear space beside the door, one side */
    var fww = Math.min(0.8, avail*0.55);             /* front window width — always < avail */
    var flat = dw*0.5 + fww*0.5 + Math.min(0.3, avail*0.2);
    [-1,1].forEach(function(s){
      var fp = loc(x,z, fx0+0.05, s*flat, ry);
      WINBOX(fp[0], winYp, fp[1], 0.4, rr(0.8,1.15), fww, ry, winCol);
      FJ.town++;
    });
    var winYr = yb + rr(1.3,2.1);
    var rww = Math.min(0.75, fz0*0.45);
    var rlat = fz0 - rww*0.5 - Math.min(0.25, fz0*0.15);
    [-1,1].forEach(function(s){
      var rp = loc(x,z, -fx0-0.05, s*rlat, ry);
      WINBOX(rp[0], winYr, rp[1], 0.4, rr(0.75,1.1), rww, ry, winCol);
      FJ.town++;
    });

    /* 1-in-10: a genuine 2nd storey, stepped in slightly (echoes the
       hlaalu step-back), with its own 4 windows (same front+rear pattern,
       no door to dodge up here so both pairs always fit). Computed before
       the chimney below so the chimney can sit on the true roofline when
       one is added. */
    var topY = yb + h, topFx = fx0, topFz = fz0, floorH = h, floorBaseY = yb;
    if(plasterHash(x,z,9.13) < FACADE.plasterSecondStoreyChance){
      PLASTER_STAT.secondStorey++;
      var h2 = rr(3.2,5.5);
      var fx2 = fx0*rr(0.82,0.94), fz2 = fz0*rr(0.82,0.94);
      var y2 = yb + h;
      BOX(x, y2, z, fx2*2, h2, fz2*2, ry, shade(col,-0.04), 'plaster');
      BOX(x, y2+h2-0.6, z, fx2*2*1.05, 1.4, fz2*2*1.05, ry, shade(col,-0.15), 'plaster');
      FJ.town += 2;
      /* its own 4 windows, guaranteed-fit by formula (no door up here to
         dodge, so front and rear are the same placement) — mirrors the
         base storey's own guarantee above */
      var winY2 = y2 + rr(1.1,1.8);
      var ww2 = Math.min(0.75, fz2*0.45);
      var lat2 = fz2 - ww2*0.5 - Math.min(0.25, fz2*0.15);
      [1,-1].forEach(function(fx2sign){
        [-1,1].forEach(function(s){
          var wp2 = loc(x,z, fx2sign*(fx2+0.05), s*lat2, ry);
          WINBOX(wp2[0], winY2, wp2[1], 0.4, 0.8, ww2, ry, winCol);
          FJ.town++;
        });
      });
      topY = y2 + h2 + 1.4; topFx = fx2; topFz = fz2; floorH = h2; floorBaseY = y2;
    }

    /* the chimney — fr3|stone, an already-spent bucket (see the blacksmith
       forge in 50-cantons.js) and, at 12 triangles against a 10-segment
       cylinder's 40, the cheap option: 677 plaster buildings each getting
       one unconditionally is real money against this build's own triangle
       ceiling. Set back toward a rear corner so it clears the door/window
       front. ~25% smoke: these are now REAL particles on the shared smoke
       rig at the top of this file — the same one the blacksmith's forge
       uses — not the single static BLOB that used to sit here. Sharing one
       InstancedMesh is what makes converting the whole town affordable:
       160 chimneys x 5 puffs is 800 more instances on a mesh that was
       already being drawn for the forge, so the town's smoke costs zero
       extra draw calls. Selection is still the position hash (not
       chance()) per the brief's own "at any one time" — the same ~25%
       smoke on every rebuild rather than reshuffling whenever an unrelated
       rnd() draw shifts elsewhere in the build. */
    var chimSide = chance(0.5) ? 1 : -1;
    var cp = loc(x,z, -topFx*0.55, topFz*0.55*chimSide, ry);
    var chimW = Math.max(0.7, fx0*0.13), chimH = rr(2.2,3.8);
    FR3(cp[0], topY, cp[1], chimW, chimH, chimW, ry, shade(col,-0.32));
    FJ.town++;
    if(plasterHash(x,z,17.61) < FACADE.plasterSmokeChance){
      PLASTER_STAT.smoking++;
      /* real particles now (registerSmokeEmitter, above) instead of the one
         static BLOB that used to sit here — all ~160 smoking chimneys share
         the forge's single citywide InstancedMesh, so converting the town
         costs no draw call on top of the forge's one. A domestic hearth is
         the quiet end of the range: a 4-puff pool, a short climb and a pale
         warm grey, against the forge's 15 puffs of near-black soot.
         The 7 rr() draws the retired BLOB line made are made here in the
         same order and over the same ranges — but genuinely USED now, as
         this chimney's own variation — so this pass leaves the fragment's
         PRNG stream, and everything townFacade() emits after it,
         bit-identical. */
      var smJx = rr(-0.3,0.3), smLift = rr(1.4,2.6), smJz = rr(-0.3,0.3);
      var smR0 = rr(1.5,2.1), smR1 = rr(1.9,2.7), smPh = rr(0,Math.PI*2), smPale = rr(0.35,0.55);
      registerSmokeEmitter(cp[0]+smJx, topY + chimH + 0.35, cp[1]+smJz, {
        kind:'chimney', n:5, life:5.0 + smLift*0.9, rise:6.0 + smLift*1.3,
        r0:smR0*0.30, r1:smR1*0.86, spread:0.34, sway:0.40, swirl:0.75,
        /* a touch darker than the retired blob's own tone: these read
           against dark warren roofs and packed brown ground, and a pale
           puff there popped as white rather than as smoke */
        lean:0.55, phase:smPh, col:shade(PAL.smoke.hearth.body, smPale*0.30 - 0.12)
      });
    }

    /* owner: "the building-top canopies are misaligned... rotated 90
       degrees... you made umbrella canopies. i wanted more a middle
       eastern style square cloth shade... they should look pretty
       similar to the market stalls." Real redesign, not just an axis
       fix: the old shape was a vertical BOX hung flush against the wall
       (fixed top edge, swaying free edge, like a flag/banner) — that's
       what read as a stiff panel sticking up off the roofline ("umbrella"
       reads as: thin flat panel at a jaunty angle, not a flat horizontal
       shade). Replaced with the exact marketDeck() stall-canopy idiom
       (50-cantons.js: a shallow FR8 sitting flat on top of the stall,
       wider than the stall itself) — here sitting flat on top of the
       building's own roofline instead, wide enough to overhang all 4
       walls a little, same 'cloth'/BANNERC bucket (already spent by the
       market stalls/banners elsewhere), zero new draw calls. Also now
       skips domed buildings per the owner's follow-up ("exclude buildings
       with domes from having roof canopies") — a flat square cloth
       sitting on a dome would clip straight through the curve.

       owner's 2nd follow-up: "in most cases the new canopy shade is
       flush with the roof. They should be about 1.5 citizens high - make
       poles to hold them up if not there already." Real bug: topY+0.15
       sat the cloth almost directly on the roofline, reading as flush
       rather than a raised shade structure, and there were no poles at
       all (the market-stall version doesn't need poles because the
       stall's own BOX body IS the support; a building's flat roof has
       nothing playing that role). A standing citizen's own merged
       geometry is 2.576 world units tall (LIFE_PEOPLE_SCALE=2.8's real
       measured extent — see lifePersonGeo's own bounding-box comment,
       78-life.js, around the boat-canopy clearance bug) — "1.5 citizens"
       is therefore a real clearance of ~3.86 units between the roofline
       and the underside of the cloth, not a guess. 4 corner poles
       (cyl|wood, already a spent bucket) now actually lift it there.
       Also widened the cloth itself: topFx*1.9/topFz*1.9 as FULL FR8
       width/depth args against topFx/topFz being HALF-extents worked out
       to a canopy slightly NARROWER than the building itself (topFx*1.9
       < topFx*2) — backwards from "wider than the stall, real overhang".
       Fixed to topFx*2*1.15/topFz*2*1.15 (a real ~15% overhang past the
       walls on every side, full-extent-correct this time).
       Chance raised 50% -> 66% per the owner's "make 66% of non-domed
       plaster buildings have one" (FACADE.plasterCanopyChance, below). */
    if(kind !== 'domed' && plasterHash(x,z,3.77) < FACADE.plasterCanopyChance){
      PLASTER_STAT.canopy++;
      var poleClear = 2.576*1.5;
      var canopyY = topY + poleClear;
      var poleInX = topFx*0.80, poleInZ = topFz*0.80;
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cs){
        var pp = loc(x,z, cs[0]*poleInX, cs[1]*poleInZ, ry);
        CYL(pp[0], topY, pp[1], 0.14, poleClear, 0, shade(pick(BANNERC),-0.35), 'wood');
        FJ.town++;
      });
      FR8(x, canopyY, z, topFx*2*1.15, 0.7, topFz*2*1.15, ry, pick(BANNERC), 'cloth');
      FJ.town++;
    }

    if(chance(FACADE.slumAdditionChance)) slumAddition(p);
    return;
  }

  /* --- non-poor: two flanking windows on the front face --- */
  var winY = yb + Math.min(h*0.32, rr(2.4,3.4));
  [-1,1].forEach(function(s){
    if(wallWindow(x,z,ry,fx0,fz0,winY,dw*0.5,winCol, s, 1.1,1.7, 1.3,1.9)) FJ.town++;
  });

  /* second-row window, centred above the door — domed only: hlaalu and
     velothi step/taper each level with an unrecoverable random jog, so
     fx0/fz0 is only exact at ground level for them; domed keeps its
     footprint all the way to the roofline. */
  if(kind === 'domed' && h > 10 && chance(FACADE.winChanceUpper)){
    var up = loc(x,z, fx0+0.05, 0, ry);
    WINBOX(up[0], yb+Math.min(h*0.6, rr(6,9)), up[1], 0.4, rr(1.1,1.5), Math.min(rr(1.3,1.9),fz0*0.7), ry, winCol);
    FJ.town++;
  }

  /* a window round the side, on buildings deep enough to have one */
  if(fx0 > 8 && chance(FACADE.winChanceSide)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.3,0.3)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(1.1,1.6), fx0*0.5), rr(1.2,1.8), 0.4, ry, winCol);
    FJ.town++;
  }

  /* chimney / roof clutter — kept off domed roofs, and placed near the
     footprint rather than trusting the (unrecoverable) upper-level offsets */
  if(kind !== 'domed' && chance(FACADE.chimneyChance)){
    var cx = x + rr(-fx0*0.35,fx0*0.35), cz = z + rr(-fz0*0.35,fz0*0.35);
    CYL(cx, yb+h*0.82, cz, rr(0.5,0.9), rr(2.5,5), 0, shade(col,-0.22));
    FJ.town++;
  }

  /* a proper sloped canopy-awning over the door on the grander houses */
  var grand = kind==='domed' || kind==='velothi' || h > FACADE.grandHeight;
  if(grand && chance(FACADE.awningChance)) doorAwning(x,z,ry,fx0,dw,dh,yb,doorCol);
}

PLACED.forEach(function(p){
  if(p.tag === 'town') townFacade(p);
});
window._plasterFacade = PLASTER_STAT;

/* ============================== other footprints ==============================
   Everything shed()-built (shed/warehouse/barn/rshed) already carries its own
   loading door. Only the small velothi outbuildings round the lesser
   compounds have none, so that is the only other tag worth a facade here. */
PLACED.forEach(function(p){
  if(p.tag !== 'velothi-out') return;
  var halfX = Math.max(1.5, p.fx - 2.5), halfZ = Math.max(1.5, p.fz - 2.5);
  var yb = terrainH(p.x, p.z);
  var dw = Math.min(rr(1.3,1.8), halfZ*0.9), dh = rr(2.4,3.0);
  var dp = loc(p.x, p.z, halfX+0.05, 0, p.ry);
  BOX(dp[0], yb, dp[1], 0.4, dh, dw, p.ry, shade(pick(ROOFS),-0.05), 'wood');
  FJ.other++;
});

/* ============================== compounds ============================== */
function compoundFacade(c){
  var ry=c.ry, wallFx=c.wallFx, wallFz=c.wallFz, wallH=c.wallH, wallCol=c.wallCol;

  /* the true wall centre O sits gateOffFrac*wallFx behind the COMPOUNDS
     record (c is the garden patch, already offset toward the gate); the
     gate itself sits roughly (1-gateOffFrac)*wallFx ahead of c */
  var O = loc(c.x, c.z, -FACADE.gateOffFrac*wallFx, 0, ry);
  var gateLX = wallFx*(1-FACADE.gateOffFrac);

  /* gate awning: the same stepped, sloping canopy as the town doors, sized
     up, straddling the gate opening on posts */
  var steps=3, outStep=wallFz*0.10, drop=0.9, wLoss=wallFz*0.16;
  var outBase = gateLX - 0.4, topY = c.y + wallH*1.5 + 2.0, wBase = wallFz*0.78;
  var lastOutX=outBase, lastY=topY, lastW=wBase;
  for(var i=0;i<steps;i++){
    var outX = outBase + i*outStep, yy = topY - i*drop, ww = Math.max(wallFz*0.18, wBase - i*wLoss);
    var gp2 = loc(c.x,c.z, outX, 0, ry);
    FR8(gp2[0], yy, gp2[1], outStep+0.6, 0.9, ww, ry, pick(ROOFS), 'roof');
    lastOutX=outX; lastY=yy; lastW=ww;
    FJ.compound++;
  }
  [-1,1].forEach(function(s){
    var pp = loc(c.x,c.z, lastOutX+0.8, s*lastW*0.46, ry);
    CYL(pp[0], c.y, pp[1], 0.28, lastY - c.y, 0, shade(wallCol,-0.1), 'wood');
    FJ.compound++;
  });

  /* corner finials on the four wall towers */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(O[0], O[1], cc[0]*(wallFx-1.6), cc[1]*(wallFz-1.6), ry);
    CONE(p[0], c.y+wallH*1.35+1.45, p[1], 1.5, rr(3,5), 0, shade(wallCol,-0.15));
    FJ.compound++;
  });

  /* a pair of lantern posts, tucked in just behind the gate — offset well
     clear of the gate arch's own solid box (compound() builds it ~4.4 units
     deep on the inner side of gateLX; anything closer than that sits
     embedded inside it and never renders) */
  [-1,1].forEach(function(s){
    var lp = loc(c.x,c.z, gateLX-6.0, s*wallFz*0.40, ry);
    CYL(lp[0], c.y, lp[1], 0.20, rr(2.4,3.2), 0, shade(wallCol,-0.2), 'wood');
    FJ.compound++;
  });

  /* clan banners: pole + hanging cloth panel, flanking the gate opening.
     Long — reaching almost to the ground from a mount point high on the
     pole — and wide, each banner picking its own BANNERC colour so the two
     flanking a gate can differ and different compounds read as different
     clans. 'cloth' family per API.md's convention: the BOX's y argument
     (base) is the free edge that sways, its height reaches up to the
     mount point (fixed, anchored) — no extra work needed for the sway.
     Offset well clear of the gate arch's own solid box on the outer side
     (~1.8 units past gateLX) so a panel reaching down to the ground doesn't
     end up embedded inside it and invisible. */
  [-1,1].forEach(function(s){
    var bp = loc(c.x,c.z, gateLX+4.0, s*wallFz*0.34, ry);
    var poleH = wallH*1.9;
    CYL(bp[0], c.y, bp[1], 0.14, poleH, 0, shade(wallCol,-0.3), 'wood');
    var mountY = c.y + poleH*0.86;                 /* fixed edge: near the pole top */
    var baseY  = c.y + rr(0.3,0.8);                /* free edge: almost touching the ground */
    var panelH = Math.max(2.5, mountY - baseY);
    var panelW = rr(2.0,2.8);
    BOX(bp[0], baseY, bp[1], 0.16, panelH, panelW, ry, pick(BANNERC), 'cloth');
    FJ.compound += 2;
  });

  /* --- the interior garden: now a genuinely clear rectangle (c.x,c.z is
     its own centre, c.fx/c.fz its own half-extents) — dressed as a proper
     garden: a walk in from the gate side, a small paved patio, a well, and
     considerably more planting than a courtyard that might still hold a
     building would have allowed */
  /* stone paving (not plaster) so it reads as a distinct hard surface against
     the plaster lawn patch compound() already laid down underneath it */
  var pLen = c.fx*1.1, pMidLX = c.fx*0.85 - pLen*0.5;
  var pMid = loc(c.x,c.z, pMidLX, 0, ry);
  BOX(pMid[0], c.y+0.05, pMid[1], pLen, 0.12, Math.max(1.6,c.fz*0.14), ry, shade(wallCol,0.10));
  FJ.compound++;

  var patioSign = chance(0.5)?1:-1;
  var patioSize = Math.min(c.fx*0.9, c.fz*0.5)*rr(0.75,1.0);
  var patioP = loc(c.x,c.z, rr(-0.15,0.15)*c.fx, patioSign*c.fz*0.55, ry);
  BOX(patioP[0], c.y+0.05, patioP[1], patioSize, 0.14, patioSize, ry+rr(-0.1,0.1), shade(wallCol,0.16));
  FJ.compound++;

  var wx = c.x + rr(-c.fx*0.55, -c.fx*0.15), wz = c.z + rr(-c.fz*0.5, c.fz*0.5);
  if(claim(wx, wz, 1.6, 1.6, 0, 'facade-well')){
    CYL(wx, c.y, wz, 1.3, 1.1, 0, shade(wallCol,-0.05));
    DOME(wx, c.y+1.1, wz, 0.9, 0.7, 0, shade(wallCol,0.1), 'dome');
    FJ.compound += 2;
  }
  var nPlant = ri(6,10);
  for(var i=0;i<nPlant;i++){
    var px = c.x + rr(-c.fx*0.85, c.fx*0.85), pz = c.z + rr(-c.fz*0.85, c.fz*0.85);
    if(chance(0.40)){
      var th = rr(2.6,4.4);
      STK(px, c.y, pz, rr(0.3,0.5), th, 0, 0x5a4b3a, 'trunk');
      BLOB(px, c.y+th*0.75, pz, rr(1.6,2.6), rr(1.8,2.8), rnd()*3, pick(WILLOWC), 'leaf');
      FJ.compound += 2;
    }else{
      var br = rr(1.0,2.0);
      BLOB(px, c.y-0.2, pz, br, br*0.8, rnd()*3, pick(LEAFC), 'leaf');
      FJ.compound++;
    }
  }
}

COMPOUNDS.forEach(compoundFacade);

window._facade = { instances: bucketTotal() - _facadeStart, town:FJ.town, other:FJ.other, compound:FJ.compound };

/* ============================== reusable props ==============================
   For a LATER placement pass — the planner calls these, this fragment does
   not. Plain function declarations, so they cost nothing here: no rnd() runs
   and no instances are pushed until something actually calls one. Each
   follows structure()/shed()'s own convention — (x, y, z, ry, col, opt) with
   y the base/ground reference — so they drop into a future loop the same way
   structure() and shed() already do. `opt` carries size overrides with
   sensible defaults; `col` may be left falsy to let the function pick its
   own tone. Existing families only (stone default, plus wood/roof/dome/
   metal/cloth as named) — metal and cloth are both otherwise-idle or
   lightly-used buckets, and using them here does not spend anything until
   a future round actually places one of these. ============================== */

/* a small wayside shrine to the Three: a triptych of niches on a shared
   plinth, the centre one taller, rather than one generic box-and-spire */
function shrineTriptych(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 8, d = opt.d || 3.2;
  var c = col || 0x9d9278;
  BOX(x, y, z, w, 0.7, d, ry, shade(c,-0.1));
  var y0 = y+0.7;
  [-1,0,1].forEach(function(n){
    var p = loc(x,z, n*w*0.30, 0, ry);
    var tall = (n===0);
    var nh = tall ? rr(3.4,4.2) : rr(2.3,3.0);
    BOX(p[0], y0, p[1], w*0.24, nh, d*0.7, ry, shade(c, tall?0.06:-0.02));
    FR3(p[0], y0+nh, p[1], w*0.18, tall?rr(2.6,3.6):rr(1.6,2.4), d*0.55, ry, shade(c,0.1));
  });
}

/* an abstract/stylised statue: pedestal plus a suggested robed, heroic
   silhouette — no rigged figures exist in this generator, so the form is
   built from tapered frustums rather than anything articulated */
function statue(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || 5.5, w = opt.w || 1.8;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.6, 0.9, w*1.6, ry, shade(c,-0.2));
  BOX(x, y+0.9, z, w*1.1, 0.5, w*1.1, ry, shade(c,-0.1));
  var by = y+1.4;
  FR6(x, by, z, w*0.85, h*0.62, w*0.85, ry, shade(c,0.04));             /* robed body */
  CYL(x, by+h*0.62, z, w*0.30, h*0.14, 0, shade(c,0.08));                /* neck block */
  DOME(x, by+h*0.62+h*0.14, z, w*0.22, w*0.26, 0, shade(c,0.12), 'dome');/* abstracted head */
  [-1,1].forEach(function(s){                                            /* suggested arms */
    var p = loc(x,z, s*w*0.42, 0, ry);
    FR8(p[0], by+h*0.20, p[1], w*0.22, h*0.34, w*0.22, ry, shade(c,-0.02));
  });
}

/* a tall tapering obelisk on a plinth — simpler and smaller than the
   Lighthouse canton's tower */
function obelisk(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 4, h = opt.h || 16;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.3, 1.0, w*1.3, ry, shade(c,-0.15));
  BOX(x, y+1.0, z, w, 0.8, w, ry, shade(c,-0.05));
  FR3(x, y+1.8, z, w*0.62, h, w*0.62, ry, c);
  CONE(x, y+1.8+h, z, w*0.12, w*0.4, ry, shade(c,0.1));
}

/* a street bench — plain and ornate variants */
function benchPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.2, d = opt.d || 0.9, h = opt.h || 0.9;
  var c = col || shade(pick(TONES),-0.1);
  BOX(x, y+h*0.45, z, w, h*0.55, d, ry, c, 'wood');
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.42, 0, ry);
    BOX(p[0], y, p[1], 0.25, h*0.45, d*0.9, ry, shade(c,-0.25));
  });
}
function benchOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.4, d = opt.d || 1.0, h = opt.h || 1.0;
  var c = col || pick(TONES);
  BOX(x, y+h*0.4, z, w, h*0.5, d, ry, c);
  BOX(x, y+h*0.9, z, w*1.04, 0.18, d*1.1, ry, shade(c,0.12));
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.46, 0, ry);
    BOX(p[0], y, p[1], 0.32, h*0.45, d*1.05, ry, shade(c,-0.22));
    FR3(p[0], y+h*0.9, p[1], 0.5, 0.7, 0.5, ry, shade(c,0.05));
  });
  var backP = loc(x,z, 0, -d*0.42, ry);
  BOX(backP[0], y+h*0.9, backP[1], w*0.96, 1.1, 0.18, ry, shade(c,-0.05));
}

/* a street-lighting brazier — plain and ornate variants; no particle/light
   system exists, so the flame is geometry (a warm-toned cone + blob) on a
   metal-family bowl/stand */
function brazierPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.55, h = opt.h || 1.0;
  var mCol = col || 0x6b6258;
  CYL(x, y, z, r*0.22, h*0.8, 0, shade(mCol,-0.2), 'wood');
  CYL(x, y+h*0.8, z, r, h*0.35, 0, mCol, 'metal');
  CONE(x, y+h*0.8+0.1, z, r*0.7, r*1.3, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.8+r*0.5, z, r*0.5, r*0.7, rnd()*3, 0xe89a3c);
  /* the owner's "streetlights": 68-props.js scatters these along the road
     graph and 69-district-content.js drops more into the districts, and
     NONE of them are in 82-daynight.js's NIGHT_LIGHTS (that list is built
     from layout arrays, not from prop placements). Registering the light
     pool HERE, in the object itself rather than at any call site, is what
     makes every brazier ever placed by anyone light its own stretch of
     street. Radius/amplitude scale with the bowl's own r/h, so the ornate
     variant below genuinely pools wider. */
  nlLampAdd(x, y+h*0.8+r*0.5, z, 0.85*(r/0.55), 15*Math.sqrt(r/0.55));
}
function brazierOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.65, h = opt.h || 1.3;
  var mCol = col || 0x7a6f5c;
  CYL(x, y, z, r*0.20, h*0.85, 0, shade(mCol,-0.25), 'metal');
  CYL(x, y+h*0.3, z, r*0.55, 0.15, 0, shade(mCol,0.1), 'metal');
  CYL(x, y+h*0.85, z, r*1.05, h*0.3, 0, mCol, 'metal');
  FR3(x, y+h*0.85+h*0.3, z, r*1.3, r*0.6, r*1.3, rnd()*3, shade(mCol,-0.1));
  CONE(x, y+h*0.85+0.1, z, r*0.8, r*1.5, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.85+r*0.6, z, r*0.6, r*0.8, rnd()*3, 0xe89a3c);
  nlLampAdd(x, y+h*0.85+r*0.6, z, 1.15*(r/0.65), 18*Math.sqrt(r/0.65));   /* see brazierPlain above */
}

/* a silt strider boarding station: a raised platform on posts, a stepped
   approach, low rails and a small roofed shelter — meant to read as transit
   infrastructure, not a generic shed */
function siltStriderStation(x,y,z,ry,col,opt){
  opt = opt || {};
  var pw = opt.w || 16, pd = opt.d || 22, ph = opt.h || 3.4;
  var deckCol = col || pick(TONES_POOR);
  var postCol = shade(deckCol,-0.3);
  [[-0.8,-0.8],[-0.8,0.8],[0.8,-0.8],[0.8,0.8],[0,-0.8],[0,0.8]].forEach(function(c2){
    var p = loc(x,z, c2[0]*pw*0.5, c2[1]*pd*0.5, ry);
    CYL(p[0], y-ph, p[1], 0.5, ph, 0, postCol, 'wood');
  });
  BOX(x, y-0.3, z, pw, 0.6, pd, ry, deckCol, 'wood');
  var railH = 1.1;
  [-1,1].forEach(function(s2){
    var p2 = loc(x,z, 0, s2*(pd*0.5-0.15), ry);
    BOX(p2[0], y, p2[1], pw*0.94, railH, 0.3, ry, postCol, 'wood');
  });
  var railP = loc(x,z, pw*0.5-0.15, 0, ry);
  BOX(railP[0], y, railP[1], 0.3, railH, pd*0.94, ry, postCol, 'wood');
  /* a short stepped approach on the open (-x) side, echoing seaStair() */
  var nSteps = 4, rampLen = opt.rampLen || 9, stepLen = rampLen/nSteps;
  for(var i=0;i<nSteps;i++){
    var t = (i+0.5)/nSteps;
    var sx = -pw*0.5 - rampLen*t;
    var sp = loc(x,z, sx, 0, ry);
    BOX(sp[0], y-ph, sp[1], stepLen*1.3, ph*(1-t)+0.4, pw*0.5, ry, deckCol, 'wood');
  }
  /* a small roofed shelter over the back half of the platform */
  var shC = loc(x,z, pw*0.18, 0, ry);
  FR8(shC[0], y+railH+2.4, shC[1], pw*0.68, 1.5, pd*0.68, ry, pick(ROOFS), 'roof');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c3){
    var p3 = loc(x,z, pw*0.18+c3[0]*pw*0.27, c3[1]*pd*0.27, ry);
    CYL(p3[0], y+railH, p3[1], 0.22, 2.4, 0, postCol, 'wood');
  });
}

/* a small canoe, optionally with a little cloth sail */
function canoe(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 5.5, beam = opt.beam || 1.3;
  var hullCol = col || 0x6b5942;
  var nseg = 4;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = len*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.8));
    var bw = beam*(0.25+0.75*taper);
    var p = loc(x,z, 0, lz, ry);
    FR6(p[0], y, p[1], bw, 0.6, len/nseg*1.15, ry, hullCol, 'wood');
  }
  if(opt.sail){
    var mp = loc(x,z, 0, 0, ry);
    var sailH = opt.sailH || 2.6;
    CYL(mp[0], y+0.5, mp[1], 0.08, sailH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+0.6, mp[1], 0.05, sailH-0.6, beam*0.7, ry, pick(SAILC), 'cloth');
  }
}

/* a ferry: mid-size, flat-bottomed, more substantial than the canoe —
   BARGES in 60-land.js is the scale reference this follows */
function ferry(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 16, beam = opt.beam || 6;
  var hullCol = col || 0x5e4d3a;
  BOX(x, y-1.6, z, beam, 2.6, len, ry, hullCol, 'wood');
  BOX(x, y+0.6, z, beam*0.92, 0.5, len*0.96, ry, shade(hullCol,-0.15), 'wood');
  var cab = loc(x,z, 0, -len*0.22, ry);
  BOX(cab[0], y+1.1, cab[1], beam*0.6, 2.2, len*0.28, ry, shade(hullCol,0.08), 'wood');
  if(opt.mast !== false){
    var mp = loc(x,z, 0, len*0.18, ry);
    var mastH = opt.mastH || 7;
    CYL(mp[0], y+1.1, mp[1], 0.18, mastH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+1.6, mp[1], 0.06, mastH-1, beam*0.55, ry, pick(SAILC), 'cloth');
  }
  for(var k=0;k<(opt.cargo||2);k++){
    var q = loc(x,z, rr(-1,1), len*(0.30+k*0.14), ry);
    BOX(q[0], y+1.1, q[1], rr(1.6,2.4), rr(1.2,2.0), rr(1.6,2.4), ry+rr(-0.3,0.3), pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
  }
}

/* tallShip() — the old European-galleon-silhouette static prop — removed
   per the owner's own request ("this european galleon type vessel
   doesn't really fit dark elves"). Its replacement, a dark-elven junk
   (dark wood hull, sharp bow, lavender battened sails), lives entirely
   in the life layer now (src/78-life.js) — both the ships that sail and
   the ones that just sit at dock use that one model, so there is no
   static prop version to keep in parallel. */

/* ============================== more reusable props: trees & funerary ======
   Round 4 — same deal as the props above: parameterised (x, y, z, ry, col,
   opt) functions, NOT called anywhere in this fragment. No rnd() and no
   BUCKET pushes happen until a future placement pass calls one of these, so
   this section costs nothing this round. Existing families only.

   Two of the seven — cherryBlossom's bloom and funeraryTemple's marble —
   need a colour this palette does not have yet (checked PAL.leaf and every
   neighbouring array, and PAL.stone/PAL.dome, per the brief). Rather than
   approximate with something that doesn't really fit, both take `col` as a
   REQUIRED argument (no internal default) and are documented below with the
   exact PAL addition being asked for. Everything else picks sensible
   defaults from the existing palette exactly like the round-3 props did. */

/* ---- trees, each deliberately NOT a reskin of 70-veg.js's tiered
   STK+CONE ashland tree or its BLOB scrub — read that file first for the
   contrast this is meant to strike. -------------------------------------- */

/* baobab — the opposite silhouette of the generic tree: a hugely swollen,
   tapering trunk carries almost the whole height, with only a small, sparse
   crown of a few thin, spreading branches right at the top. */
function baobab(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(14,22);
  var trunkR = opt.trunkR || h*rr(0.16,0.22);
  var trunkCol = col || pick(TRUNKC);
  /* the swollen mass: a fat squat base tapering into a narrower upper
     trunk — trunk-dominant, not canopy-dominant */
  FR6(x, y, z, trunkR*2.3, h*0.50, trunkR*2.3, ry, trunkCol, 'trunk');
  FR6(x, y+h*0.50, z, trunkR*1.35, h*0.32, trunkR*1.35, ry, shade(trunkCol,0.04), 'trunk');
  var topY = y + h*0.82;
  CYL(x, topY, z, trunkR*0.62, h*0.06, 0, shade(trunkCol,-0.05), 'trunk');
  topY += h*0.06;
  /* a handful of thin, spreading branches with a modest tuft each — never
     a full canopy */
  var nb = opt.branches || ri(4,6);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.3,0.3);
    var reach = trunkR*rr(1.4,2.2);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.10,0.16);
    STK(bx, topY, bz, trunkR*0.12, blen, 0, shade(trunkCol,-0.08), 'trunk');
    BLOB(bx, topY+blen*0.85, bz, rr(1.3,2.1), rr(1.0,1.6), rnd()*3, pick(LEAFC), 'leaf');
  }
}

/* dragon tree (Dracaena-style) — a single trunk forks partway up into
   several upward branches, each capped with a dense, flat-topped rosette:
   tiered and architectural rather than one rounded crown. */
function dragonTree(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(9,15);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = col || pick(TRUNKC);
  var forkY = y + h*rr(0.42,0.55);
  CYL(x, y, z, trunkR, forkY-y, 0, trunkCol, 'trunk');
  var nb = opt.branches || ri(3,5);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.25,0.25);
    var reach = trunkR*rr(1.3,2.0);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.30,0.46);
    var br = trunkR*rr(0.45,0.65);
    CYL(bx, forkY, bz, br, blen, 0, shade(trunkCol,-0.04), 'trunk');
    var topY = forkY+blen;
    var r1 = rr(2.6,4.2);
    /* a dense, flat-topped rosette — a squashed mound, not a rounded tuft */
    BLOB(bx, topY-0.30, bz, r1, r1*0.32, rnd()*3, pick(LEAFC), 'leaf');
    BLOB(bx, topY+r1*0.10, bz, r1*0.78, r1*0.24, rnd()*3, shade(pick(LEAFC),0.05), 'leaf');
  }
}

/* cherry blossom — slender trunk, wide airy canopy of many small soft
   blobs. NEEDS A NEW PALETTE COLOUR: nothing in PAL reads as blossom pink
   or white (PAL.leaf/fruit/willow are all greens; PAL.banner's pastels are
   yellow/purple/green/blue/brown/orange, no pink). `col` is REQUIRED — pass
   a tone from the requested PAL addition once it exists, e.g.:
     PAL.bloom = [0xf3d6de, 0xecc3cf, 0xf7e6ea, 0xe8b3c2];  // soft pink range
     var BLOOMC = PAL.bloom;
   (proposed in the round-4 report; not added here — palette is read-only). */
function cherryBlossom(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(8,13);
  var trunkR = opt.trunkR || rr(0.28,0.42);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyY = y + h*0.55, canopyR = opt.canopyR || h*rr(0.62,0.85);
  var nb = opt.blobs || ri(10,16);
  for(var i=0;i<nb;i++){
    var a = rnd()*Math.PI*2, rdist = Math.sqrt(rnd())*canopyR;
    var bx = x+Math.cos(a)*rdist, bz = z+Math.sin(a)*rdist;
    var by = canopyY + rr(-0.10,0.10)*h + (1-rdist/canopyR)*h*0.12;
    var br = rr(1.1,2.0);
    BLOB(bx, by, bz, br, br*rr(0.55,0.85), rnd()*3, col, 'leaf');
  }
}

/* emperor mushroom — a landmark fungus, not the small decorative mushrooms
   70-veg.js scatters (those top out around an 11-unit stalk and a ~7-13
   unit cap even at the widest far-terrain scale factor). This is roughly
   double that in every dimension, with a distinct gilled underside rim and
   an optional brood of ordinary-scale mushrooms at its foot for contrast. */
function emperorMushroom(x,y,z,ry,col,opt){
  opt = opt || {};
  var stalkH = opt.h || rr(24,36);
  var stalkR = opt.r || rr(2.4,3.8);
  var stalkCol = col || pick(STALKC);
  var capCol = opt.capCol || pick(FUNGC);
  FR6(x, y, z, stalkR*2, stalkH, stalkR*1.5, ry, stalkCol, 'fungus');
  var capR = opt.capR || rr(14,20);
  var capH = capR*rr(0.34,0.46);
  BLOB(x, y+stalkH-capH*0.35, z, capR, capH, rnd()*3, capCol, 'fungus');
  CYL(x, y+stalkH-capH*0.55, z, capR*0.82, capH*0.16, 0, shade(capCol,-0.18), 'fungus');    /* gilled rim */
  if(opt.brood !== false){
    var n = ri(2,4);
    for(var i=0;i<n;i++){
      var a = rnd()*Math.PI*2, dist = stalkR*rr(2.2,4.0);
      var bx = x+Math.cos(a)*dist, bz = z+Math.sin(a)*dist;
      var sh = rr(2.5,4.5), sr = rr(0.4,0.7);
      STK(bx, y, bz, sr, sh, 0, stalkCol, 'fungus');
      var cr = sr*rr(2.6,3.6);
      BLOB(bx, y+sh-0.4, bz, cr, cr*0.55, rnd()*3, capCol, 'fungus');
    }
  }
}

/* ============================== more trees & wild flora ====================
   Round 6 — same deal as the props above: parameterised (x, y, z, ry, col,
   opt) functions, NOT called anywhere in this fragment. No rnd() runs and no
   BUCKET pushes happen until a future placement pass calls one of these, so
   this section costs nothing this round. Existing families/colours only —
   no new PAL entries needed (checked PAL.leaf/willow/fungus/stalk/trunk and
   PAL.bloom first).

   The kit only ever rotates an instance about Y (`_dm.rotation.set(0, r[6],
   0)` in emitBuckets()) — nothing in SHAPES tilts off vertical. Every
   "branch"/"root"/"frond" below is built the way baobab()/dragonTree()/
   doorAwning() already do it: a vertical primitive offset sideways by loc(),
   often chained in a few outward-and-down (or outward-and-up) steps so the
   silhouette reads as reaching/drooping/arching even though each individual
   piece is a plain vertical stub. Not a new trick, just applied to new
   shapes. */

/* ---- wild flora: alien ashland undergrowth, distinct from 70-veg.js's
   scrub BLOBs and tiered STK+CONE tree, and from this file's own baobab/
   dragonTree/cherryBlossom/emperorMushroom — four more silhouettes so a
   patch of undergrowth doesn't read as four copies of the same bush. ------- */

/* bulb pod — a squat leaf rosette at the base with several thin stalks
   carrying oversized, swollen ovoid pods (fungal-adjacent, not a flower and
   not a mushroom cap): the classic Morrowind "alien pod plant" silhouette. */
function bulbPod(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var podCol = col || pick(FUNGC);
  var nb = opt.baseLeaves || ri(2,4);
  for(var i=0;i<nb;i++){
    var a0 = rnd()*Math.PI*2, r0 = rr(0.3,1.1);
    var br = rr(1.1,2.0);
    BLOB(x+Math.cos(a0)*r0, y-0.2, z+Math.sin(a0)*r0, br, br*rr(0.35,0.55), rnd()*3, pick(LEAFC), 'leaf');
  }
  for(var k=0;k<n;k++){
    var a = rnd()*Math.PI*2, reach = rr(0.6,2.2);
    var sx = x+Math.cos(a)*reach, sz = z+Math.sin(a)*reach;
    var sh = rr(1.6,3.6);
    STK(sx, y, sz, rr(0.12,0.20), sh, 0, pick(STALKC), 'trunk');
    var podR = rr(0.7,1.3), podH = podR*rr(1.5,2.1);          /* ovoid, not a cap */
    BLOB(sx, y+sh-0.15, sz, podR, podH, rnd()*3, podCol, 'fungus');
    BLOB(sx, y+sh+podH*0.75, sz, podR*0.36, podR*0.30, rnd()*3, shade(podCol,-0.2), 'fungus');  /* nub tip */
  }
}

/* spine rosette — a ground-hugging burst of thick, barbed, spike-tipped
   leaves (an alien aloe/agave), with a rare tall central bloom spike so a
   patch of them isn't perfectly uniform. */
function spineRosette(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(8,14);
  var leafCol = col || pick(LEAFC);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.18,0.18);
    var reach = rr(0.4,1.1);
    var lx = x+Math.cos(a)*reach, lz = z+Math.sin(a)*reach;
    var lh = rr(1.6,3.4), lr = rr(0.22,0.42);
    CONE(lx, y, lz, lr, lh, a, shade(leafCol, rr(-0.08,0.10)), 'leaf');
  }
  if(opt.bloom !== false && chance(0.30)){
    var bh = rr(6,11);
    STK(x, y, z, 0.16, bh, 0, pick(STALKC), 'trunk');
    var nb = ri(4,7);
    for(var k=0;k<nb;k++){
      var t = (k+1)/nb;
      var by = y + bh*t;
      var bo = loc(x,z, rr(-0.5,0.5), rr(-0.5,0.5), rnd()*6.28);
      BLOB(bo[0], by, bo[1], rr(0.35,0.6), rr(0.4,0.7), rnd()*3, pick(BLOOMC), 'leaf');
    }
  }
}

/* coral shrub — a branching, antler/coral-like alien bush: thin tapering
   limbs forking off a short central stub at a few different heights, each
   tip capped with a small bulbous nub, rather than any kind of canopy. */
function coralShrub(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(2.0,4.5);
  var trunkCol = col || pick(TRUNKC);
  var tipCol = opt.tipCol || pick(FUNGC);
  CYL(x, y, z, rr(0.22,0.34), h*0.4, 0, trunkCol, 'trunk');
  var n = opt.branches || ri(5,9);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.3,0.3);
    var stubY = y + h*0.4*rr(0.3,1.0);
    var reach1 = rr(0.8,1.6), len1 = h*rr(0.35,0.55);
    var p1 = loc(x,z, Math.cos(a)*reach1, Math.sin(a)*reach1, 0);
    CYL(p1[0], stubY, p1[1], rr(0.10,0.16), len1, 0, shade(trunkCol,-0.05), 'trunk');
    /* a sub-fork off the first limb's tip, so it doesn't read as a single
       stiff spike */
    var reach2 = reach1 + rr(0.5,1.0);
    var p2 = loc(x,z, Math.cos(a+rr(-0.5,0.5))*reach2, Math.sin(a+rr(-0.5,0.5))*reach2, 0);
    var len2 = len1*rr(0.4,0.7);
    CYL(p2[0], stubY+len1*0.7, p2[1], rr(0.07,0.11), len2, 0, shade(trunkCol,0.03), 'trunk');
    BLOB(p2[0], stubY+len1*0.7+len2-0.1, p2[1], rr(0.30,0.55), rr(0.30,0.55), rnd()*3, tipCol, 'fungus');
  }
}

/* arching bladder plant — a few stalks that arch up off a low central crown
   and back down to hanging, pear-shaped bladder pods near the ground: a
   drooping, outward silhouette distinct from bulbPod's upright cluster. */
function archingBladder(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var bladderCol = col || pick(FUNGC);
  BLOB(x, y-0.15, z, rr(0.7,1.1), rr(0.35,0.5), rnd()*3, pick(LEAFC), 'leaf');   /* low crown */
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.25,0.25);
    var steps = 3, rise = rr(1.4,2.2), reach = rr(2.2,3.6);
    var lastX=x, lastZ=z, lastY=y;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;
      /* rises for the first half of the arch, then descends back toward
         the ground for the second half — same cascade idea as
         doorAwning(), just up-then-down instead of only down */
      var yy = y + rise*Math.sin(Math.PI*t);
      var rr2 = reach*t;
      var px = x+Math.cos(a)*rr2, pz = z+Math.sin(a)*rr2;
      var segH = Math.max(0.3, Math.abs(yy-lastY)) + 0.4;
      var baseY = Math.min(yy,lastY);
      CYL((lastX+px)/2, baseY, (lastZ+pz)/2, 0.09, segH, 0, pick(TRUNKC), 'trunk');
      lastX=px; lastZ=pz; lastY=yy;
    }
    var podR = rr(0.5,0.9);
    BLOB(lastX, Math.max(y,lastY-podR*0.3), lastZ, podR, podR*rr(1.3,1.7), rnd()*3, bladderCol, 'fungus');
  }
}

/* ---- named species: weeping willow, mangrove, giant fern, giant groundsel.
   Recognisable real-world forms, not generic trees with a different colour.
   Distinct names from 55-chinampa.js's own willow(x,z,y) (a small, cheap
   mature-chinampa-bed tree, different signature, do not touch it). --------- */

/* weeping willow — a mounded canopy with many thin trailing branches
   cascading out and down from the canopy edge almost to the ground, using
   the same outward+down stepping idea as doorAwning() above. A landmark
   riverside/canal tree — tall enough, and with branches reaching low
   enough, to read from the water. */
function weepingWillow(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(11,17);
  var trunkR = opt.trunkR || rr(0.5,0.8);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(WILLOWC);
  var canopyY = y + h*0.62;
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyR = opt.canopyR || h*rr(0.34,0.44);
  BLOB(x, canopyY, z, canopyR, canopyR*0.6, rnd()*3, leafCol, 'leaf');
  var nb = opt.branches || ri(9,15);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.2,0.2);
    var steps = 4, outStep = canopyR*rr(0.22,0.34), drop = (canopyY-y)*rr(0.20,0.27);
    var curR = canopyR*rr(0.75,0.98), curY = canopyY + canopyR*0.15;
    for(var s=0;s<steps;s++){
      var nextR = curR + outStep, nextY = Math.max(y+0.2, curY - drop*(0.7+0.3*s));
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      CYL(mx, nextY, mz, Math.max(0.04, 0.16 - s*0.03), segH, 0, shade(trunkCol,-0.1), 'trunk');
      if(chance(0.7)){
        var tuftR = Math.max(0.4, 1.3 - s*0.25);
        BLOB(x+Math.cos(a)*nextR, nextY+segH*0.5, z+Math.sin(a)*nextR, tuftR, tuftR*0.7, rnd()*3, shade(leafCol, rr(-0.1,0.08)), 'leaf');
      }
      curR = nextR; curY = nextY;
    }
  }
}

/* mangrove — a tangle of prop roots (stilt legs stepping outward and down
   from an elevated trunk base to the waterline/mud) under a compact canopy.
   Meant to be planted with `y` at or near the waterline: the roots reach UP
   from y to the trunk and their outer ends land back at y, so the tangle
   reads as emerging from the water regardless of how the placement pass
   handles the actual submerged geometry. */
function mangrove(x,y,z,ry,col,opt){
  opt = opt || {};
  var baseLift = opt.rootH || rr(2.6,4.2);           /* trunk sits above the water on its roots */
  var h = opt.h || rr(7,11);
  var trunkR = opt.trunkR || rr(0.35,0.55);
  var rootCol = opt.rootCol || shade(pick(TRUNKC),-0.08);
  var leafCol = col || pick(LEAFC);
  var trunkTop = y + baseLift;
  var nr = opt.roots || ri(5,8);
  for(var i=0;i<nr;i++){
    var a = (i/nr)*Math.PI*2 + rr(-0.2,0.2);
    var reach = rr(1.8,3.4);
    var steps = 3;
    var curR = 0.2, curY = trunkTop - baseLift*0.1;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;
      var nextR = reach*t, nextY = trunkTop - baseLift*t*t;    /* arcs down faster near the water */
      if(s === steps-1) nextY = y;                             /* the outer leg always meets the waterline */
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      var segR = trunkR*(1-t*0.55);
      CYL(mx, nextY, mz, Math.max(0.08,segR), segH, 0, rootCol, 'trunk');
      curR = nextR; curY = nextY;
    }
  }
  CYL(x, trunkTop-baseLift*0.15, z, trunkR, h, 0, opt.trunkCol || pick(TRUNKC), 'trunk');
  var canopyY = trunkTop-baseLift*0.15 + h*0.85;
  var nCan = opt.canopyBlobs || ri(3,5);
  for(var k=0;k<nCan;k++){
    var co = loc(x,z, rr(-1.4,1.4), rr(-1.4,1.4), 0);
    var cr = rr(1.6,2.6);
    BLOB(co[0], canopyY+rr(-0.4,0.5), co[1], cr, cr*rr(0.55,0.8), rnd()*3, leafCol, 'leaf');
  }
}

/* giant fern — a dense burst of large fronds fanning up and outward from a
   short ground-level rhizome, each frond built from two cascading segments
   (a thicker base rising, a thinner tip arching further out) so it reads as
   a curved blade rather than a stiff cone. Large fanning frond clusters, not
   a tree — deliberately no tall trunk. */
function giantFern(x,y,z,ry,col,opt){
  opt = opt || {};
  var leafCol = col || pick(LEAFC);
  CYL(x, y, z, rr(0.5,0.8), rr(0.6,1.1), 0, pick(TRUNKC), 'trunk');   /* rhizome stub */
  var n = opt.fronds || ri(9,15);
  var reach = opt.reach || rr(5,8);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.15,0.15);
    var baseH = rr(2.5,4.0), baseR1 = reach*0.35;
    var p1 = loc(x,z, Math.cos(a)*baseR1, Math.sin(a)*baseR1, 0);
    CONE(p1[0], y+0.6, p1[1], rr(0.35,0.5), baseH, a, shade(leafCol,-0.05), 'leaf');
    var tipH = rr(2.0,3.2), tipR2 = reach*rr(0.8,1.0);
    var p2 = loc(x,z, Math.cos(a)*tipR2, Math.sin(a)*tipR2, 0);
    CONE(p2[0], y+0.6+baseH*0.65, p2[1], rr(0.18,0.28), tipH, a, shade(leafCol,rr(0.0,0.12)), 'leaf');
  }
}

/* giant groundsel — a thick single trunk (with a marcescent dead-leaf skirt
   partway up, characteristic of the real Dendrosenecio) topped by a dense
   rosette of large paddle-shaped leaves radiating from the crown: an
   Afroalpine silhouette, not a generic palm/tree. */
function giantGroundsel(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(5,9);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(LEAFC);
  FR6(x, y, z, trunkR*2, h, trunkR*2, ry, trunkCol, 'trunk');
  if(opt.skirt !== false){
    var bands = ri(1,2);
    for(var b=0;b<bands;b++){
      var by = y + h*rr(0.30,0.62);
      var nd = ri(6,9);
      for(var d=0;d<nd;d++){
        var da = (d/nd)*Math.PI*2 + rr(-0.2,0.2);
        var dl = rr(0.6,1.1);
        var dp = loc(x,z, Math.cos(da)*trunkR*1.1, Math.sin(da)*trunkR*1.1, 0);
        BOX(dp[0], by+rr(-0.2,0.2), dp[1], dl, 0.14, 0.4, da, shade(trunkCol,-0.22), 'trunk');
      }
    }
  }
  var topY = y + h;
  var n = opt.leaves || ri(12,18);
  var leafLen = opt.leafLen || rr(2.4,3.6);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.12,0.12);
    var ll = leafLen*rr(0.85,1.15);
    var lp = loc(x,z, ll*0.5, 0, a);
    BOX(lp[0], topY+rr(-0.35,0.45), lp[1], ll, 0.16, ll*rr(0.30,0.42), a, shade(leafCol, rr(-0.1,0.1)), 'leaf');
  }
  BLOB(x, topY+0.1, z, trunkR*0.9, trunkR*0.7, rnd()*3, shade(leafCol,0.06), 'leaf');   /* closed inner bud */
}

/* ---- funerary objects, small to large ---------------------------------- */

/* a small grave: either a low earthen mound or a plain headstone-on-footing
   — modest footprint, meant to be scattered in numbers */
function grave(x,y,z,ry,col,opt){
  opt = opt || {};
  var c = col || pick(TONES_POOR);
  if(opt.mound){
    var r = opt.r || rr(1.4,2.0);
    BLOB(x, y, z, r, r*0.5, ry, shade(c,-0.1));
  }else{
    var w = opt.w || rr(0.8,1.1), hh = opt.h || rr(1.2,1.8), th = opt.th || 0.25;
    BOX(x, y, z, th, hh, w, ry, shade(c,-0.05));
    BOX(x, y-0.1, z, th*3.0, 0.2, w*1.6, ry, shade(c,-0.15));
  }
}

/* a family tomb: an enclosed vault sized for a clan rather than one person
   — bigger than a grave, smaller than a building — with a (false) door and
   a domed or peaked cap */
function familyTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(5,7), d = opt.d || rr(5,7), h = opt.h || rr(4,6);
  var c = col || pick(TONES);
  BOX(x, y, z, w, h, d, ry, c);
  BOX(x, y+h, z, w*1.06, 0.6, d*1.06, ry, shade(c,-0.12));
  var dp = loc(x,z, w*0.5+0.03, 0, ry);
  BOX(dp[0], y+0.2, dp[1], 0.3, h*0.55, w*0.34, ry, shade(c,-0.4), 'wood');
  if(opt.roof === 'dome' || (opt.roof === undefined && chance(0.5))){
    DOME(x, y+h+0.6, z, Math.min(w,d)*0.42, Math.min(w,d)*0.34, ry, pick(DOMEC), 'dome');
  }else{
    FR3(x, y+h+0.6, z, Math.min(w,d)*0.7, h*0.5, Math.min(w,d)*0.7, ry, shade(c,0.05));
  }
}

/* a large white marble funerary temple: the necropolis centrepiece. `col`
   is the marble tone — pass one from PAL.stone.marble (MARBLEC). Grey and
   jade/dark-green accent trim (PAL.stone.grey/GREYC, PAL.stone.jade/JADEC —
   both added alongside marble; checked first, nothing else in PAL reads
   either cool enough to read as inlay against pale marble) mark every
   course break: a grey socle underfoot, jade stringcourses between the
   plinth tiers, a jade dado round the cella foot, jade pilaster strips
   flanking the doorway, grey capitals on the colonnade, a jade tympanum
   inlay in the pediment, and a grey drum / jade fillet / jade finial
   stacking up to the dome — so the building reads, at any distance, as
   pale stone banded in dark accent rather than a single-tone recolour of
   an ordinary kind.
   Bigger than a standard compound, short of canton scale: a stepped
   stereobate, a colonnade ring, a projecting portico with its own
   pediment, and a crowning dome — deliberately not a variation on
   structure()'s hlaalu/velothi/domed/hovel kinds (flat parapets, one
   storey stack, one roof cap) but a tiered, porticoed mausoleum massing
   none of those touch. All 'stone'/'dome' family — no new draw call. */
function funeraryTemple(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 46, d = opt.d || 64, h = opt.h || 34;
  var mCol = col;
  var greyCol = opt.greyCol || pick(GREYC);
  var jadeCol = opt.jadeCol || pick(JADEC);
  var accum = y;

  /* grey socle: a single low, slightly oversized course the whole building
     sits on — the first accent band, readable from the approach track
     before anything else on the temple is */
  var socleW = w*1.22, socleD = d*1.16, socleH = h*0.035;
  BOX(x, accum, z, socleW, socleH, socleD, ry, greyCol);
  accum += socleH;

  var tiers = opt.plinthTiers || 3;
  var pw = w*1.14, pd = d*1.10, ph = h*0.05;
  for(var t=0;t<tiers;t++){
    BOX(x, accum, z, pw, ph, pd, ry, shade(mCol,-0.05+t*0.02));
    accum += ph;
    /* jade stringcourse between plinth tiers — offset up 0.05 so it never
       shares a face with the tier top it sits on (coplanar = z-fight) */
    if(t<tiers-1){
      BOX(x, accum+0.05, z, pw*0.985, ph*0.28, pd*0.985, ry, jadeCol);
    }
    pw *= 0.965; pd *= 0.965;
  }
  var deckY = accum;
  var cellaH = h*0.5;
  BOX(x, deckY, z, w*0.62, cellaH, d*0.72, ry, mCol);
  /* jade dado band round the cella base — a dark inlay course, not just a
     darker marble */
  BOX(x, deckY+0.05, z, w*0.635, cellaH*0.09, d*0.735, ry, jadeCol);
  /* jade pilaster strips flanking the doorway face (local +x, the portico
     side), a paired dark accent either side of the entrance */
  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.31, s*d*0.18, ry);
    BOX(pp[0], deckY, pp[1], w*0.03, cellaH*0.9, d*0.05, ry, jadeCol);
  });
  BOX(x, deckY+cellaH, z, w*0.66, h*0.04, d*0.76, ry, greyCol);
  var nCols = opt.columns || 18;
  var colR = Math.min(w,d)*0.018+0.5, colH = cellaH*0.94;
  for(var i=0;i<nCols;i++){
    var t2 = i/nCols;
    var ex = Math.cos(t2*Math.PI*2), ez = Math.sin(t2*Math.PI*2);
    var cx = x + ex*w*0.54, cz = z + ez*d*0.47;
    CYL(cx, deckY, cz, colR, colH, 0, shade(mCol,0.03));
    BOX(cx, deckY+colH, cz, colR*2.6, colH*0.05, colR*2.6, 0, greyCol);
  }
  /* portico offset: half the cella's own local-x extent (w*0.31) plus half
     the portico box's own local-x extent (pW/2 = w*0.25), minus a slight
     overlap so the two volumes actually share a face instead of floating
     a gap apart — the old w*0.68 offset (0.12w past a flush fit) was the
     "front portion doesn't fully connect to the rest of the building" gap
     the owner flagged. */
  var porticoX = w*0.31 + w*0.25 - w*0.03;
  var portico = loc(x,z, porticoX, 0, ry);
  var pW = w*0.5, pD = d*0.20;
  BOX(portico[0], deckY, portico[1], pW, cellaH*0.92, pD, ry, shade(mCol,0.02));
  var pedY = deckY+cellaH*0.92;
  FR3(portico[0], pedY, portico[1], pW*1.04, h*0.12, pD*1.04, ry, shade(mCol,0.05));
  /* jade tympanum inlay set into the pediment face, facing the approach */
  var tymp = loc(x,z, porticoX+pD*0.52+0.05, 0, ry);
  BOX(tymp[0], pedY+0.1, tymp[1], pW*0.34, h*0.05, pD*0.12, ry, jadeCol);
  [-1,1].forEach(function(s){
    var cp = loc(x,z, porticoX+pD*0.5-0.6, s*pW*0.36, ry);
    CYL(cp[0], deckY, cp[1], colR*1.15, cellaH*0.90, 0, shade(mCol,0.04));
    BOX(cp[0], deckY+cellaH*0.90, cp[1], colR*1.15*2.6, colH*0.05, colR*1.15*2.6, 0, greyCol);
  });
  /* owner: "funerary temple needs a proper door". There was none anywhere on
     the building — the jade pilasters above are described in their own
     comment as "flanking the doorway face", but the face between them was
     blank marble, and that face is in any case buried: the portico is a
     solid block occupying local x from porticoX-pW/2 to porticoX+pW/2
     (w*0.28 .. w*0.78), which completely encloses the cella's own front.
     A door on the cella therefore cannot be seen at all — tried, screenshotted,
     invisible. The real entrance face is the PORTICO's outward face, so the
     door goes there, which is also where anyone climbing the temple steps
     actually arrives. Recessed dark reveal, twin leaves, grey lintel and the
     half-dome arch cap the chapel and monastery openings already use, plus a
     threshold slab. All already-spent buckets — no new draw call. */
  var fdFrontX = porticoX + pW*0.5;
  var fdW = pD*0.70, fdH = cellaH*0.52;
  var fdP = loc(x,z, fdFrontX+0.05, 0, ry);
  BOX(fdP[0], deckY, fdP[1], 0.60, fdH, fdW, ry, shade(jadeCol,-0.45));
  [-1,1].forEach(function(s){
    var lp = loc(x,z, fdFrontX+0.26, s*fdW*0.26, ry);
    BOX(lp[0], deckY, lp[1], 0.38, fdH*0.97, fdW*0.46, ry, shade(TRUNKC[0],-0.30), 'wood');
  });
  var fdL = loc(x,z, fdFrontX+0.12, 0, ry);
  BOX(fdL[0], deckY+fdH, fdL[1], 0.85, cellaH*0.05, fdW*1.25, ry, greyCol);
  /* a flat jade tympanum panel over the lintel, NOT a half-dome. The dome
     cap used elsewhere (chapel, monastery gates) is sized against a narrow
     opening; at this door's width it rendered as a huge green blob
     swallowing the entrance — the same "reads as a giant mushroom cap"
     failure the abbey gate's own crown hit and whose comment warns about
     sizing a cap off the gap rather than off the trim. A panel also matches
     this building's own vocabulary: it already sets a jade tympanum into
     the pediment face above. */
  BOX(fdL[0], deckY+fdH+cellaH*0.05, fdL[1], 0.5, cellaH*0.10, fdW*0.86, ry, jadeCol);
  var fdS = loc(x,z, fdFrontX+1.1, 0, ry);
  BOX(fdS[0], deckY-0.35, fdS[1], 2.2, 0.7, fdW*1.35, ry, shade(mCol,-0.06));
  var domeR = Math.min(w,d)*0.30;
  /* grey drum, jade fillet, marble dome, jade finial — dark accents stack
     right to the top rather than stopping at the cornice line */
  CYL(x, deckY+cellaH+h*0.04, z, domeR*1.05, h*0.06, 0, greyCol);
  CYL(x, deckY+cellaH+h*0.10, z, domeR*1.01, h*0.02, 0, jadeCol);
  DOME(x, deckY+cellaH+h*0.12, z, domeR, domeR*0.85, 0, mCol, 'dome');
  CONE(x, deckY+cellaH+h*0.12+domeR*0.85, z, domeR*0.08, h*0.05, 0, jadeCol);
}

/* ---- the Temple canton's own sacrifice platform — the owner: "the
   Temple canton has a high priest... that comes out and does a
   sacrifice every so often (we may need to rework the architecture of
   the temple canton, but for now add a hanging platform and door to one
   of the topmost tiers, with an altar)." A real rework is future work;
   this is exactly that minimal addition — a platform projecting out from
   the topmost tier (CANTON_TOPS['Temple'], 50-cantons.js, already fully
   populated by the time this file's own top-level code runs), a door
   where it meets the tier, and a small altar/brazier at the outer end.
   Faces away from the canton's own centre, roughly outward toward open
   water — visible from the bay rather than hidden against the tier
   behind it. TEMPLE_ALTAR is exported as a plain global (this file runs
   before 78-life.js) so the life layer's high priest has somewhere real
   to walk to. */
/* owner, revised design: "underneath [the raised dome] will be the
   sacrificial altar. the top platform will have a stairway the high
   priest can spawn in and out of." Replaces the old off-centre "hanging
   platform projecting out from the tier" (screenshot-tuned for the
   pre-pillar dome) with the altar centred under the new 8-pillar dome
   (TEMPLE_PILLAR_RING_R, set by templeCanton() just above, in the same
   window-global pattern CANTON_TOPS itself uses) and a real staircase at
   the platform's outward edge standing in for the old door — the high
   priest's own spawn/despawn point (TEMPLE_ALTAR.doorX/doorZ) sits at
   the staircase's base landing, same geometric spot the old door occupied
   (c.x+dirX*top.hw), so 78-life.js's routing needs no changes at all. */
var TEMPLE_ALTAR = null;
window.TEMPLE_BRAZIERS = [];
(function(){
  var c = CIDX['Temple']; if(!c) return;
  var top = CANTON_TOPS['Temple']; if(!top) return;
  var angle = Math.atan2(-c.z, -c.x);
  var dirX = Math.cos(angle), dirZ = Math.sin(angle);
  var ry = Math.atan2(dirX, dirZ);

  /* the altar, centred under the dome, inside the pillar ring */
  var altarX = c.x, altarZ = c.z, altarY = top.y + 0.3;
  BOX(altarX, altarY, altarZ, 6.0, 2.4, 4.0, ry, shade(c.tone,0.08));
  CYL(altarX, altarY+2.4, altarZ, 0.4, 1.4, 0, 0x6b1f1f);

  /* a real staircase at the platform's outward edge, descending toward
     the tier below — the high priest's own visible spawn/despawn point,
     not just an abstract door-in-a-wall anymore. 7 steps, ~0.5 units of
     rise each, landing on the platform itself. */
  var stepN = 7, stepW = 6.0, stepD = 1.15, stepH = 0.5;
  var doorX = c.x + dirX*top.hw, doorZ = c.z + dirZ*top.hw;
  for(var st=0; st<stepN; st++){
    var stY = top.y - st*stepH;
    var stX = doorX + dirX*(st*stepD), stZ = doorZ + dirZ*(st*stepD);
    BOX(stX, stY, stZ, stepW, 0.5, stepD*1.05, ry, shade(c.tone, st%2 ? 0.02 : -0.06));
  }
  [-1,1].forEach(function(side){
    var sx = doorX + (-dirZ)*side*stepW*0.5, sz = doorZ + (dirX)*side*stepW*0.5;
    var ex = sx + dirX*(stepN*stepD*0.5), ez = sz + dirZ*(stepN*stepD*0.5);
    BOX(ex, top.y - (stepN*stepH*0.5) + 0.5, ez, 0.6, stepN*stepH+1.0, stepN*stepD, ry, shade(c.tone,-0.18));
  });
  TEMPLE_ALTAR = { x:altarX, z:altarZ, y:altarY+2.4, doorX:doorX, doorZ:doorZ, ry: ry+Math.PI };

  /* owner: "at high noon every day, he will... light large golden braziers
     on all 4 temple corners" — then, once the pillared dome was built,
     caught they weren't actually visible and clarified: "they should be
     on the same level/platform as the altar." Real bug in the first
     version: positioned at top.hw*0.80, the EXACT SAME (x,z) the four tall
     corner spires (templeCanton()'s own "four corner spires" loop) use for
     their own FR3 shaft base — a shaft with a 5-unit half-width entirely
     swallows a ~2-unit-radius brazier bowl at the same centre, so they
     were rendering but completely entombed inside the spires, invisible.
     Now at the 4 diagonal corners of the ALTAR itself, radius comfortably
     inside the pillar ring (TEMPLE_PILLAR_RING_R) so they sit in the open
     colonnade on the platform floor, nowhere near the spires. Static
     bowl/stand geometry (always visible, cheap — reuses the existing box/
     cyl 'stone'/'wood' buckets); the actual noon-to-sunrise GLOW is a
     separate, animated effect that needs a mesh already in the per-frame
     render loop, not this static bake — src/82-daynight.js reads
     window.TEMPLE_BRAZIERS (populated below) and folds these 4 points
     into its existing night-light InstancedMesh, driving them on their
     own timer instead of the shared dusk/dawn one. */
  var brazierR = Math.min(window.TEMPLE_PILLAR_RING_R*0.55, 9.0);
  for(var bz=0; bz<4; bz++){
    var ba = Math.PI/4 + bz*Math.PI/2;
    var bx = altarX + Math.cos(ba)*brazierR, bzz = altarZ + Math.sin(ba)*brazierR;
    var bowlY = top.y;
    CYL(bx, bowlY, bzz, 1.1, 3.0, 0, shade(c.tone,-0.05), 'wood');
    CYL(bx, bowlY+3.0, bzz, 2.0, 1.4, 0, 0xc9a227);
    CYL(bx, bowlY+3.6, bzz, 1.5, 0.6, 0, shade(0xc9a227,-0.15));
    window.TEMPLE_BRAZIERS.push({ x:bx, y:bowlY+4.4, z:bzz });
  }
})();

/* ============================== canton-scale structures ====================
   Round 5 — two more object definitions, NOT placed/dispatched in this
   fragment. Both are built to reuse 50-cantons.js's own global helpers
   (CANTON_TOPS, DECK, tierWeights(), bedAt(), seaStair()) rather than
   reinventing tier-stepping math — 50-cantons.js itself is read-only here. */

/* ---- templeCanton(c, y, hw) -------------------------------------------
   A drop-in replacement for monoCanton(c)'s body, built for the Temple
   canton specifically: same tier-stepping (tierWeights/FR8 tier stack) and
   the same CANTON_TOPS/seaStair contract, so a one-line dispatch at the top
   of monoCanton() — `if(c.n==='Temple') return templeCanton(c);` — is all
   the planner needs to wire it in. `y`/`hw` are optional overrides of the
   usual starting plinthTop(7)/half-width(c.r*0.98), for flexibility if the
   planner ever wants to dispatch from partway through monoCanton() instead
   of at the top; omit them and it behaves as a standalone drop-in.

   What reads as "more Vivec-temple-like" than the generic mono treatment:
     - a gilded step-edge and a gilded stringcourse under every tier cornice
       (monoCanton has one flat cornice colour throughout)
     - corner shrine-spires run every tier instead of just the bottom two
     - the golden dome is ~55% bigger than c.dome, sits on a wider gilded
       drum, carries eight radial ribs and a second nested cap-dome with a
       tall gilt finial spike, instead of one plain dome + small cone
     - four tall gilt-capped corner spires instead of the generic ones
     - flanking guard statues (reusing this file's own statue()) and a
       wayside shrineTriptych at the base, which monoCanton has none of
     - a pair of tall gilt cloth banners on posts flanking the base, in the
       canton's own `accent` tone — the same hanging-BOX 'cloth' convention
       the compound gate banners use, so they sway once the cloth shader
       is fixed (see the round-3 report: a pre-existing bug in 45-kit.js's
       applyClothSway, not mine to fix here, currently makes ALL cloth
       instances invisible — geometry is correct regardless) */
function templeCanton(c, y, hw){
  /* owner, final version after a few iterations: tier roofs alternate
     bright and dark shades of blood red (was crimson/porphyry-purple for a
     couple of messages — superseded); the dome and spire TIPS are gold
     (was briefly silver — the owner moved silver onto the Palace instead
     and put gold back on the Temple, so the two monumental cantons read as
     a distinct gold/silver pair). One-off hexes, not new PAL entries —
     this dome/spire-cap treatment is the only thing in the city that reads
     as gilt/blood-red ritual colour rather than ordinary gilt stone.
     Declared LOCAL to this function, not as outer top-level vars: this
     function is called from 50-cantons.js's CANTONS.forEach (fragment 50,
     runs before this fragment's own top-level code), so an outer `var`
     here would still be undefined at call time — hoisted as a binding,
     never actually assigned yet. Real bug, found by screenshot earlier
     this session: the dome rendered solid orange/white until this moved
     inside the function body. */
  var TEMPLE_RED_BRIGHT = 0xa8241c, TEMPLE_RED_DARK = 0x4a0e0a;
  var TEMPLE_GOLD = 0xc9a227;
  var bed = bedAt(c.x,c.z), plinthTop = (y===undefined) ? 7 : y;
  FR8(c.x, bed, c.z, c.r*2.20, plinthTop-bed, c.r*2.20, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.6, c.z, c.r*2.30, 3.0, c.r*2.30, 0, shade(c.tone,-0.38));
  BOX(c.x, plinthTop-0.3, c.z, c.r*2.26, 1.4, c.r*2.26, 0, shade(c.accent,-0.10));   /* gilded step edge */

  var y0 = plinthTop, rem = c.top - y0, W = tierWeights(c.tiers);
  var hw0 = (hw===undefined) ? c.r*0.98 : hw;
  /* 4th pass on this door — see the planner's matching rewrite in
     monoCanton() for the full story: DECK (54, every bridge's height)
     lands at y=57.80 here (tier 1's own base, tierWeights()-derived by
     hand and cross-checked — 3.8 off DECK, same "tier 1 is the real
     entrance" story as Palace's 0.9-off match). Every earlier pass put
     the door on the TOPMOST tier, which nobody arriving by bridge would
     ever reach. Doors now build at entryY/entryHw (tier 1's own
     base/radius, captured below), not the final y0/hw0. */
  var doorFace = {};
  cantonApproachFaces(c).forEach(function(ang){
    var dx=Math.sin(ang), dz=Math.cos(ang), f;
    if(Math.abs(dx) > Math.abs(dz)) f = dx>0 ? 0 : 2; else f = dz>0 ? 1 : 3;
    doorFace[f] = true;
  });
  var entryY, entryHw;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    FR8(c.x, y0, c.z, hw0*2, th, hw0*2, 0, shade(c.tone, i%2 ? 0.05 : -0.02));
    BOX(c.x, y0+th-1.0, c.z, hw0*2*1.07, 2.2, hw0*2*1.07, 0, shade(c.tone,-0.16));
    BOX(c.x, y0+th-2.6, c.z, hw0*2*1.03, 0.7, hw0*2*1.03, 0, shade(c.accent,0.02));  /* gilded stringcourse */
    y0 += th + 0.12;
    var nhw = hw0*0.80;
    if(i < c.tiers-1){
      var ring = hw0*2*0.99, t2 = nhw*2;
      [[0,(ring+t2)/4],[0,-(ring+t2)/4],[(ring+t2)/4,0],[-(ring+t2)/4,0]].forEach(function(o){
        var sw = Math.abs(o[0])>0 ? (ring-t2)/2 : ring;
        var sd = Math.abs(o[0])>0 ? ring : (ring-t2)/2;
        BOX(c.x+o[0], y0, c.z+o[1], sw*0.98, 2.6, sd*0.98, 0, shade(c.tone,-0.20));
      });
    }
    /* corner shrine-spires run every tier, not just the bottom two —
       except tier 1 at a door-bearing face (the real entrance level now,
       not the top), same collision class fixed once already this
       session. */
    /* owner: "the temple roofs will alternate bright and dark shades of
       blood red" — the corner-spire cap on each tier is the one roof-like
       element repeated per floor, so it carries the alternation. The spire
       shaft itself stays in the canton's own tone, unaffected. */
    var tierRoofCol = (i % 2 === 0) ? TEMPLE_RED_BRIGHT : TEMPLE_RED_DARK;
    for(var f=0; f<4; f++){
      if(i === 1 && doorFace[f]) continue;
      var a = f*Math.PI/2;
      var px = c.x + Math.cos(a)*hw0*1.02, pz = c.z + Math.sin(a)*hw0*1.02;
      FR8(px, y0-th*0.86, pz, hw0*0.34, th*0.62, hw0*0.34, -a, shade(c.tone,0.08));
      CONE(px, y0-th*0.24, pz, hw0*0.20, hw0*0.24, -a, tierRoofCol);
    }
    hw0 = nhw;
    if(i === 0){ entryY = y0; entryHw = hw0; }
  }
  CANTON_TOPS[c.n] = { y:y0, hw:hw0, spring:plinthTop, entryY:entryY, entryHw:entryHw };

  /* owner: "the dome will be raised off the top platform by 8 pillars that
     are 3 pedestrians height tall. underneath will be the sacrificial
     altar." A pedestrian's own merged geometry measures 4.046 world units
     top-to-bottom (checked directly against lifePersonGeo's bounding box,
     not guessed) — 3x that is 12.14. Owner's follow-up: "make temple
     platform pillars 2.5x higher" — 12.14*2.5 = 30.35, TEMPLE_PILLAR_H
     below. The pillars stand on the platform (y0/hw0, already the tier
     stack's own top surface) in a ring comfortably inside its edge, and
     the whole gilt dome assembly that used to sit directly on y0 now sits
     on TOP of the pillars instead — domeY0 replaces every bare y0
     reference the dome block below used to read. The altar itself is
     built separately, after this function returns (see the TEMPLE_ALTAR
     IIFE further down this file, which already runs once
     CANTON_TOPS['Temple'] is populated) — it needs the pillar ring's own
     radius, so TEMPLE_PILLAR_RING_R is exported as a plain global for it
     to read, same pattern CANTON_TOPS itself already uses. */
  var TEMPLE_PILLAR_H = 30.35;
  var dr = c.dome*1.55;
  window.TEMPLE_PILLAR_RING_R = hw0*0.70;
  for(var pl=0; pl<8; pl++){
    var pa = pl*Math.PI/4;
    var px2 = c.x + Math.cos(pa)*window.TEMPLE_PILLAR_RING_R, pz2 = c.z + Math.sin(pa)*window.TEMPLE_PILLAR_RING_R;
    CYL(px2, y0, pz2, Math.max(2.0, dr*0.045), TEMPLE_PILLAR_H, 0, shade(c.tone,0.10));
    CYL(px2, y0+TEMPLE_PILLAR_H-0.6, pz2, Math.max(2.6, dr*0.06), 1.2, 0, shade(c.tone,-0.10));   /* capital */
    CYL(px2, y0, pz2, Math.max(2.6, dr*0.06), 0.8, 0, shade(c.tone,-0.10));                        /* base */
  }
  var domeY0 = y0 + TEMPLE_PILLAR_H;

  /* the gold dome: bigger, ribbed, double-crowned. Colour only, no family
     override — an explicit 'metal' family would open a brand-new
     shape+family bucket (a new draw call each for dome/cone/cyl) against a
     budget already sitting at 50/50; every shape here keeps its existing
     default family (dome/roof/stone, already-built buckets) and gets the
     gold tone through color alone. The CYL collar doubles as the
     entablature the 8 pillars actually appear to carry. */
  CYL(c.x, domeY0, c.z, dr*1.42, 11, 0, shade(TEMPLE_GOLD,-0.05));
  BOX(c.x, domeY0+11, c.z, dr*3.05, 2.0, dr*3.05, Math.PI/4, shade(c.tone,-0.12));
  DOME(c.x, domeY0+13.0, c.z, dr, dr*0.92, 0, TEMPLE_GOLD, 'dome');
  for(var rib=0; rib<8; rib++){
    var ra = rib*Math.PI/4;
    CONE(c.x+Math.cos(ra)*dr*0.55, domeY0+13.0, c.z+Math.sin(ra)*dr*0.55, dr*0.05, dr*0.85, ra, shade(TEMPLE_GOLD,-0.10));
  }
  var crownY = domeY0+13.0+dr*0.92*0.55;
  DOME(c.x, crownY, c.z, dr*0.5, dr*0.4, 0, shade(TEMPLE_GOLD,0.08), 'dome');
  CONE(c.x, domeY0+13.0+dr*0.92, c.z, dr*0.12, dr*0.7, 0, shade(TEMPLE_GOLD,-0.15));
  CYL(c.x, domeY0+13.0+dr*0.92+dr*0.7, c.z, dr*0.04, dr*0.3, 0, shade(TEMPLE_GOLD,0.12));

  /* four corner spires, taller, with gold tips (owner: "the dome and spire
     tips will be gold") — the shaft itself stays in the canton's own tone. */
  for(var s=0;s<4;s++){
    var sa = Math.PI/4 + s*Math.PI/2;
    var sx = c.x + Math.cos(sa)*hw0*0.80, sz = c.z + Math.sin(sa)*hw0*0.80;
    FR3(sx, y0, sz, 10, dr*1.7, 10, sa, shade(c.tone,0.03));
    CONE(sx, y0+dr*1.7, sz, 3.8, 9, sa, shade(TEMPLE_GOLD,0.12));
  }

  /* ceremonial approach: one stair + door per real bridge (see the
     planner's cantonApproachFaces() — a hub gets a stair on every face a
     bridge actually lands on, not a fixed +x/-x pair), guard statues
     flanking the PRIMARY approach (the first span found, deterministic —
     not randomised), a wayside shrine at the corner offset from it. This
     is the same data-driven fix the planner applied to the generic
     monoCanton() body (Palace); Temple's own two bridges happen to have
     snapped close to the old hardcoded +x/-x anyway, but this is now
     principled rather than a coincidence, and won't silently break if a
     future canton edit changes which cantons Temple bridges to. */
  var approaches = cantonApproachFaces(c), primary = approaches[0];
  approaches.forEach(function(ang){
    var sp = loc(c.x, c.z, 0, c.r*1.06, ang);
    seaStair(sp[0], sp[1], ang, c.r*0.68, plinthTop, -2);
  });
  /* the real entrance is tier 1 (entryY/entryHw), where linkStair() (in
     50-cantons.js's landing()) actually lands a bridge-borne pedestrian —
     see the planner's matching fix in monoCanton() and this function's own
     comment above the tier loop for the DECK/tierWeights() numbers behind
     this. */
  approaches.forEach(function(ang){
    plinthDoor(c.x, c.z, ang, entryY, entryHw, c.tone);
  });
  [-1,1].forEach(function(s2){
    var gp = loc(c.x, c.z, c.r*1.02, s2*c.r*0.22, primary);
    statue(gp[0], plinthTop, gp[1], primary-Math.PI/2, shade(c.tone,0.10), { h:7, w:2.2 });
  });
  var shp = loc(c.x, c.z, c.r*0.70, -c.r*1.05, primary);
  shrineTriptych(shp[0], terrainH(shp[0],shp[1]), shp[1], primary+Math.PI/2, shade(c.tone,0.05), { w:11, d:4 });

  /* a pair of tall gilt cloth banners on posts, flanking the base */
  var baseHw = (hw===undefined) ? c.r*0.98 : hw;
  [-1,1].forEach(function(s3){
    var bp = loc(c.x, c.z, baseHw, s3*c.r*0.55, 0);
    var poleH = 26;
    CYL(bp[0], plinthTop, bp[1], 0.22, poleH, 0, shade(c.tone,-0.2), 'wood');
    BOX(bp[0], plinthTop+0.6, bp[1], 0.22, poleH*0.78, 4.0, 0, shade(c.accent,0.06), 'cloth');
  });
  /* one ferry pier + matching ground-floor door at the bottom tier, per
     the owner's canton-design notes — same mechanism as the planner's
     matching addition in monoCanton(). */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(baseHw, ferryPier.ry), c.tone);
  }
}

/* alternating merlon blocks round a square (hw-half-extent) perimeter —
   the crenellated parapet ordinatorFortress uses instead of an ornamental
   cornice, wherever a canton would normally get one. Tuned Asiatic: slender,
   closely-spaced merlons — narrow along the wall run and tall for their
   width, rather than the chunky near-cubic, near-evenly-split Western
   block/gap the first pass used. merlonD (depth into the wall run, i.e.
   across the coping) defaults a bit deeper than merlonW is wide, so each
   merlon still seats solidly on the wall rather than reading as a thin
   floating fin; only the face you actually walk past reads as slim. */
function crenellate(cx, cz, hw, yTop, ry, col, merlonW, merlonH, merlonD){
  merlonW = merlonW || Math.max(0.7, hw*0.040);
  merlonH = merlonH || merlonW*2.3;
  merlonD = merlonD || merlonW*1.4;
  var gap = merlonW*0.7, per = merlonW+gap;
  var n = Math.max(3, Math.floor((hw*2)/per));
  [['x',hw],['x',-hw],['z',hw],['z',-hw]].forEach(function(e){
    var along = e[0], fixed = e[1];
    for(var k=0;k<n;k++){
      var t = (k+0.5)/n*(hw*2) - hw;
      var lx = along==='x' ? t : fixed;
      var lz = along==='x' ? fixed : t;
      var p = loc(cx,cz, lx, lz, ry);
      var w = along==='x' ? merlonW : merlonD;   /* slim face along the run */
      var d = along==='x' ? merlonD : merlonW;   /* deeper across the coping */
      BOX(p[0], yTop, p[1], w, merlonH, d, ry, col);
    }
  });
}

/* ---- ordinatorFortress(c, y, hw, opt) ------------------------------------
   Third pass: adapted from a standalone (x,y,z,ry,col,opt) prop into a real
   platCanton() dispatch target, wired for the Lighthouse canton (r:150,
   tiers:3, top:44) which the owner is redesignating from lighthouseDeck()
   to this. Same calling contract as arenaDeckSquare(c,y,hw)/marketDeck/
   gardenDeck — NOT dispatched here, 50-cantons.js is read-only to me; the
   planner adds the one-line `if(c.fortress) return ordinatorFortress(c, y,
   hw);` swap in platCanton() itself alongside its `light` check.

   `(c,y,hw)` here mean exactly what they mean for every other plat-canton
   dispatch target: platCanton() has already built the generic tiered
   plinth (bed, tier stack shrinking hw by 0.86 per level, corner walls,
   sea stairs) by the time it calls this, and (y,hw) is that stack's own
   TOP surface — the real half-width a Lighthouse-scale canton (r:150)
   actually hands over here is ~92.5, not the fixed 120 the standalone prop
   used to assume (checked against platCanton()'s own tier loop, not
   guessed: hw = c.r*0.97*0.86^tiers). x/z/ry are read off `c` (ry is
   always 0 for a plat canton, same as every other FR8/BOX call in
   platCanton() itself); `col` is gone from the signature — wall tone now
   derives from the canton's own `c.tone`, shaded down, rather than a
   random TONES_POOR pick, so Lighthouse's own palette entry actually
   drives it. `opt` still carries the same tuning overrides as before
   (tiers, h, towerH, keepH, ry, col) for whichever future canton might
   want a second fortress with different proportions.

   Below this line the fortress rises FROM that platform top (yb = y),
   using the platform's own hw as its footprint (rad = hw, scaled 0.98 in
   exactly the same proportion the old fixed-rad version used) rather than
   floating in raw world space — same resize-not-redesign brief as every
   other number changed here. It is still the star-fort/Hagia-Sophia cross
   already built and catalogued in `new-buildings/`, not a new design:

     - STAR FORT footprint: the tiered curtain from the first pass stays,
       but its once-plain square perimeter now breaks at six points — four
       angular corner bastions (small crenellated platforms nested
       diagonally past each corner of tier 0, same wall-batter as the
       curtain itself) plus two true pointed diamond bastions on the
       flanking (z) faces, each rotated 45° off the main wall so its own
       corner is the outward point and its own crenellation runs at that
       same angle. The +x face is left a plain curtain run for the
       gatehouse, so nothing here fights it. Together this is the trace
       italienne signature — angular projections at intervals eliminating
       dead ground along any one straight run — not a plain square.
     - HAGIA SOPHIA massing in place of the first pass's small blocky keep:
       a stepped plinth, a genuinely wide drum, a big ribbed central dome,
       and two lower flanking domes fore/aft on their own short drums — the
       stepped-massing/half-dome impression of the real building's
       silhouette — plus a small nested crown dome and an iron finial mast.
       Coloured in the wall's own stone/iron tones (never DOMEC's gilt),
       sparse arrow slits round the drum, and a crenellated gallery at its
       base, so it still reads as a martial keep wearing a huge dome, not a
       temple.
     - four corner watchtowers restyled (owner round 3) off compound()'s own
       corner towers in 60-land.js rather than a slender minaret: a squat
       square FR8 shaft under a flat overhanging coping cap, with a slim
       Asiatic-style crenellated gallery riding just under that cap — reads
       as the Ordinators' own blocky lookouts, not a clan tower or a mosque
       minaret.
     - one grim ironbound gatehouse breaking the wall, unchanged — still
       the only other place this asset uses the metal family, alongside
       the drum's iron signal mast. */
function ordinatorFortress(c, y, hw, opt){
  opt = opt || {};
  var x = c.x, z = c.z, ry = opt.ry || 0;
  var platformY = y, platformHw = hw;      /* the real platform surface platCanton() already built and already recorded in CANTON_TOPS — reused verbatim below, not the fortress's own (much higher) deck/dome height */
  var rad = platformHw;                    /* fit the canton's real top-tier half-width instead of a fixed default */
  var tiers = opt.tiers || 3;
  var totalH = opt.h || rad*0.583;         /* same H/rad ratio the old fixed 70/120 pair used */
  /* owner, after reviewing the mockup ("i like the new fortress model,
     implement it"): the Ordinator fortress is basalt, not the canton's own
     sandy tone — the same BASALTC palette the curtain wall and the abbey
     already use, so the ordinators' seat reads as one material family with
     the city's defences. Trim is deliberately TWO greys rather than one
     darker shade of the wall: a light coping band over dark crenellation,
     which is what makes the ornament read at all against a near-black
     body. Banners are the order's green and gold. */
  var wallCol = opt.col || shade(BASALTC[1 % BASALTC.length], 0.02);
  var fortTrimDark = shade(GREYC[0], -0.30);
  var fortTrimLight = shade(GREYC[GREYC.length-1], 0.20);
  var fortBannerGreen = 0x2f6b3a, fortBannerGold = 0xc9a227;
  /* the platform below this keep is built by platCanton()'s own tier loop,
     which has already laid down c.tiers bands before we start. Continuing
     its parity here is what makes the banding read as one stack from the
     waterline up, instead of resetting at the keep's foot. */
  var FORT_BAND_PHASE = (c.tiers || 0) % 2;
  var yb = platformY;                      /* build up FROM the platform top, not raw ground */

  var hw = rad*0.98, y0 = yb;
  var tierH = totalH/tiers;
  var hw0 = hw, tierH0 = tierH;      /* tier-0 dimensions, kept for the star bastions below */
  for(var i=0;i<tiers;i++){
    /* owner: "make the dark/light alternation on the ordinator canton extend
       to all levels". The old +-0.03/-0.09 spread was tuned against the
       canton's original sandy tone; on near-black basalt a 0.06 shade delta
       is invisible, so the keep read as one flat mass. Widened to a real
       light/dark banding (+0.16 / -0.10) that survives the dark base colour,
       and phase-matched to the platform tiers below so the alternation runs
       continuously from the waterline to the crest rather than restarting at
       the keep. */
    FR8(x, y0, z, hw*2, tierH, hw*2, ry, shade(wallCol, (i+FORT_BAND_PHASE)%2 ? 0.16 : -0.10));
    var topY = y0+tierH;
    BOX(x, topY-0.6, z, hw*2*1.03, 1.2, hw*2*1.03, ry, fortTrimLight);
    crenellate(x, z, hw, topY, ry, fortTrimDark);
    /* green-and-gold banners hung from each tier's parapet, one per face,
       alternating colour by tier so both show from any approach.
       box|cloth is already a spent bucket (market awnings, clan banners),
       so this costs no draw call. */
    for(var bf=0; bf<4; bf++){
      var ba = ry + bf*Math.PI/2;
      var bp = loc(x, z, hw*1.02, 0, ba);
      var bcol = ((bf + i) % 2) ? fortBannerGreen : fortBannerGold;
      BOX(bp[0], topY-tierH*0.72, bp[1], 0.4, tierH*0.62, hw*0.42, ba, bcol, 'cloth');
      BOX(bp[0], topY-tierH*0.72+tierH*0.62, bp[1], 0.7, 0.7, hw*0.46, ba, fortTrimLight);
    }
    var nSlits = 4 + i*2;
    for(var s=0;s<nSlits;s++){
      var side = Math.floor(rnd()*4), a = side*Math.PI/2 + rr(-0.9,0.9);
      var sx = x+Math.cos(a)*hw*1.01, sz = z+Math.sin(a)*hw*1.01;
      BOX(sx, y0+tierH*rr(0.3,0.6), sz, 0.3, rr(1.6,2.4), 0.5, -a, shade(wallCol,-0.5));
    }
    if(i < tiers-1) hw *= 0.80;
    y0 = topY + 0.4;
  }
  var deckY = y0, deckHW = hw;

  /* ---- star-fort bastions, ground level, breaking the tier-0 perimeter:
     four angular corner platforms (axis-aligned nubs nested diagonally past
     each corner, same batter as the curtain) plus two true diamond points
     on the flanking (z) faces, each rotated 45° off the main wall so its
     own corner is the outward point. The +x face stays a plain curtain run
     for the gatehouse below. */
  var bH = tierH0*0.92, bTop = yb+bH;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cc){
    var bw = Math.max(9, hw0*0.20);
    var p = loc(x,z, cc[0]*hw0, cc[1]*hw0, ry);
    FR8(p[0], yb, p[1], bw, bH, bw, ry, shade(wallCol,-0.05));
    crenellate(p[0], p[1], bw*0.48, bTop, ry, shade(wallCol,-0.30), bw*0.075, bw*0.17);
  });
  [1,-1].forEach(function(s){
    var pw = Math.max(16, hw0*0.30);
    var a2 = ry + s*Math.PI/2, ryB = a2 - Math.PI/4;
    var p = loc(x,z, 0, s*hw0, ry);
    FR8(p[0], yb, p[1], pw, bH*0.96, pw, ryB, shade(wallCol,-0.02));
    crenellate(p[0], p[1], pw*0.44, bTop-0.3, ryB, shade(wallCol,-0.30), pw*0.07, pw*0.16);
    var tip = loc(x,z, 0, s*(hw0+pw*0.62), ry);
    BOX(tip[0], yb+bH*rr(0.30,0.55), tip[1], 0.5, rr(1.8,2.6), 0.3, -a2, shade(wallCol,-0.5));
  });

  /* ---- four corner watchtowers, restyled off compound()'s own corner
     towers (60-land.js, the FR8 shaft + wider flat coping cap on every
     compound) rather than the first pass's slender minaret: a squat,
     square-plan FR8 shaft — same gentle batter as the curtain tiers — under
     a flat, overhanging coping slab (compound()'s own roof treatment,
     scaled up: there it's a 7-wide shaft under an 8.2-wide cap, here the
     same ~1.17x overhang ratio), with a slim Asiatic-style crenellated
     gallery riding just under the cap so these still read as a fortress's
     own lookouts and not a plain clan tower. */
  var twr = Math.max(14, deckHW*0.16);              /* shaft full width/depth */
  var towerH = opt.towerH || twr*2.6;                /* stout, compound-tower proportions, not a soaring minaret */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(x,z, cc[0]*deckHW*0.92, cc[1]*deckHW*0.92, ry);
    inspectClaim(p[0], p[1], twr*0.5, twr*0.5, ry, 'tower', 'Fortress watchtower');
    FR8(p[0], deckY, p[1], twr, towerH, twr, ry, shade(wallCol,-0.05));
    var galY = deckY + towerH - twr*0.22;
    crenellate(p[0], p[1], twr*0.5, galY, ry, shade(wallCol,-0.30), twr*0.045, twr*0.11);
    BOX(p[0], galY+twr*0.11, p[1], twr*1.17, twr*0.11, twr*1.17, ry, shade(wallCol,-0.20));  /* flat overhanging coping cap, compound-style */
    var slit = loc(p[0],p[1], twr*0.52, 0, ry);
    BOX(slit[0], deckY+towerH*0.35, slit[1], 0.3, 2.0, 0.5, ry, shade(wallCol,-0.5));
    /* owner: "give those 4 ornamental towers bright green flames at night."
       These four ARE the ornamental towers — the only set of four on the
       build (the four star-fort corner bastions above are ground-level
       platforms, not towers, and the keep's domes are one central mass).
       Published the same way window.TEMPLE_BRAZIERS is, for 82-daynight.js
       to hang a night light on: the fire basin sits on the coping cap's own
       top face, which is galY + twr*0.11 (cap base) + twr*0.11 (cap
       thickness) = deckY + towerH exactly. No geometry is added here — the
       flame itself is an instance of the existing shared nlMesh. */
    window.FORT_TOWER_FLAMES = window.FORT_TOWER_FLAMES || [];
    window.FORT_TOWER_FLAMES.push({ x:p[0], z:p[1], y: deckY + towerH, w: twr });
  });

  /* ---- the central rise: Hagia-Sophia-scaled massing standing in for the
     first pass's single small keep — a stepped plinth, a wide drum, two
     lower flanking domes fore/aft (the stepped half-dome impression), and
     the main dome itself ribbed and double-crowned. All in the wall's own
     stone/iron tones, never DOMEC's gilt, so it reads as a fortress keep
     wearing a huge dome rather than a temple. */
  var plinthR = deckHW*0.66, plinthH = totalH*0.12;
  /* inspector footprints (inspectClaim(), 86-inspect.js — inspect-only, not
     claim()): the keep itself, and the four corner watchtowers registered
     just below, so hovering the fortress reports the part under the cursor
     instead of only "Fortress canton". */
  inspectClaim(x, z, plinthR, plinthR, ry, 'keep', 'Ordinator keep');
  FR8(x, deckY, z, plinthR*2, plinthH, plinthR*2, ry, shade(wallCol,-0.02));
  crenellate(x, z, plinthR*0.97, deckY+plinthH, ry, shade(wallCol,-0.30), plinthR*0.055, plinthR*0.125);

  var drumY = deckY+plinthH+0.3, drumR = deckHW*0.56, drumH = opt.keepH || totalH*0.30;
  CYL(x, drumY, z, drumR, drumH, 0, shade(wallCol,0.02));
  var nSlit2 = 8;
  for(var d2=0; d2<nSlit2; d2++){
    var a3 = (d2/nSlit2)*Math.PI*2;
    var dx = x+Math.cos(a3)*drumR*1.01, dz = z+Math.sin(a3)*drumR*1.01;
    BOX(dx, drumY+drumH*rr(0.35,0.70), dz, 0.3, rr(2.2,3.2), 0.6, -a3, shade(wallCol,-0.55));
  }

  [1,-1].forEach(function(s){                          /* lower flanking domes, fore/aft */
    var fr = drumR*0.52;
    var fp = loc(x,z, s*(drumR+fr*0.75), 0, ry);
    var fy = drumY + drumH*0.18;
    CYL(fp[0], fy, fp[1], fr, drumH*0.55, 0, shade(wallCol,-0.04));
    DOME(fp[0], fy+drumH*0.55, fp[1], fr*0.96, fr*0.80, 0, shade(wallCol,-0.08), 'dome');
  });

  var domeY = drumY+drumH, domeR = drumR*0.98;
  CYL(x, domeY-1.0, z, domeR*1.05, 1.4, 0, shade(wallCol,-0.20));
  DOME(x, domeY, z, domeR, domeR*0.86, 0, shade(wallCol,0.04), 'dome');
  for(var rib=0; rib<10; rib++){
    var ra = rib*Math.PI/5;
    CONE(x+Math.cos(ra)*domeR*0.5, domeY, z+Math.sin(ra)*domeR*0.5, domeR*0.045, domeR*0.78, ra, shade(wallCol,-0.10));
  }
  var crownY = domeY + domeR*0.86*0.55;
  DOME(x, crownY, z, domeR*0.30, domeR*0.24, 0, shade(wallCol,-0.06), 'dome');               /* small nested crown dome */
  BOX(x, domeY+domeR*0.86+0.4, z, domeR*0.14, 1.2, domeR*0.14, ry, shade(wallCol,-0.40));    /* flat dark iron finial base, not a spire */
  CYL(x, domeY+domeR*0.86+1.6, z, domeR*0.045, domeR*0.45, 0, shade(wallCol,-0.35), 'metal'); /* iron signal mast */

  /* one grim, ironbound gatehouse breaking the wall (+x face, clear of
     every bastion above) */
  var gp = loc(x,z, rad*0.98, 0, ry);
  BOX(gp[0], yb, gp[1], 6, totalH*0.5, 14, ry, shade(wallCol,-0.45), 'metal');

  /* CANTON_TOPS, the same way templeCanton() does — a bridge/causeway
     pedestrian still arrives on the platform platCanton() itself already
     built (platformY/platformHw), not the top of the fortress's own dome,
     so this intentionally matches the values platCanton() already wrote
     before calling us; set explicitly here anyway so this function is
     self-contained and consistent with the rest of the canton system,
     which reads CANTON_TOPS generically. */
  CANTON_TOPS[c.n] = { y:platformY, hw:platformHw, spring:platformY };
}

/* ============================== round 6: port & arena reworks ==============
   Both are drop-in replacements for the matching dispatch in platCanton()
   (same signature, same calling contract — `platCanton()` has already built
   the quay platform/trim/bollard ring before c.port's dispatch would call
   portDeckV2, same as it does for portDeck today). NOT dispatched here —
   50-cantons.js is read-only to me; the planner wires the one-line swap. */

/* a small, formal administrative building — the customs/excise checkpoint,
   distinct from the sheds by its regular massing, portico and cupola.
   Combos: box|stone(default), fr8|roof, cyl|stone(default), box|wood,
   fr3|stone(default) — all already live elsewhere in the build. */
function customsHouse(x,y,z,ry,w,d,col){
  var h = 11;
  BOX(x, y, z, w, h, d, ry, col);
  BOX(x, y+h, z, w*1.06, 1.0, d*1.06, ry, shade(col,-0.15));
  BOX(x, y+h-2.4, z, w*1.02, 0.5, d*1.02, ry, shade(col,0.06));       /* formal stringcourse */
  var fp = loc(x,z, w*0.5+1.8, 0, ry);
  FR8(fp[0], y+h*0.70, fp[1], 3.6, 1.1, d*0.55, ry, pick(ROOFS), 'roof');  /* portico canopy */
  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.5+1.8, s*d*0.20, ry);
    CYL(pp[0], y, pp[1], 0.34, h*0.70, 0, shade(col,0.05));
  });
  var dp = loc(x,z, w*0.5+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.4, h*0.42, d*0.20, ry, shade(col,-0.4), 'wood');
  CYL(x, y+h+1.0, z, w*0.16, 2.2, 0, shade(col,0.08));                 /* cupola drum */
  FR3(x, y+h+3.2, z, w*0.12, 3.0, w*0.12, 0, shade(col,0.12));         /* spire/finial: the "official building" marker */
}

/* a second, standalone customs-and-excise office — the owner marked its
   lot directly with the polygon devtool:
   [[1004.6,-926.1],[982.3,-988.7],[899.4,-950.1],[944.7,-898.3]]. Hand-
   marked corners are rarely a clean rectangle (here AB=66.5/CD=68.8 but
   BC=91.4/DA=66.0), so fit an oriented box instead of trusting the raw
   quad: centroid, then project all 4 corners onto the AB edge direction
   and its perpendicular and take each axis's own (max-min) as that
   axis's extent. Built at 55% of the fitted 72.6 x 91.1 lot so the
   building sits centred with a yard margin rather than wall-to-wall,
   rotated to the long (perpendicular) axis to match customsHouse()'s own
   proportions (front-to-back deeper than its facade is wide — see its
   existing port-canton call). Reuses customsHouse() itself unmodified;
   this is a placement, not a redesign. Land here is confirmed real,
   walled city core (zoneAt: 'core', insideWall: true, terrainH ~3.9). */
(function(){
  reseed(5553);
  var cx = 951.58, cz = -939.26, ry = 0.341;
  var w = 50, d = 40;
  var col = pick(TONES);
  var yb = plinth(cx, cz, w*0.5, d*0.5, ry, col) + 0.2;
  claim(cx, cz, w*0.5, d*0.5, ry, 'customs');
  customsHouse(cx, yb, cz, ry, w, d, col);
})();

/* ============================== ferry stop piers ============================
   Moved here (unmodified) from src/78-life.js — see that file's own note
   at the top of its "water taxis / ferries" section for why: these calls
   are real static BOX/CYL pier geometry, and 78-life.js's contract says
   it must never touch BUCKET/emitBuckets(), but more concretely, that
   file runs at file order 78 — AFTER 75-terrain.js's `emitBuckets()` has
   already drained BUCKET into InstancedMeshes — so any BOX/CYL called
   from there is silently a no-op. This file (65) runs before 75, with
   CIDX/CPIERS/RPIERS/CAUSEWAYS/ISLES already populated by 30-layout.js,
   so it is the right place for this to actually emit geometry.
   78-life.js reads the LIFE_BAY_CENTER/LIFE_FERRY_STOPS/LIFE_SHRINE_STOPS/
   LIFE_SHRINE_ROUTE globals this block leaves behind, same as it already
   reads CPIERS/CIDX themselves. */
var LIFE_BAY_CENTER = {
  x: (CIDX['Palace'].x + CIDX['Temple'].x + CIDX['Ancestry'].x) / 3,
  z: (CIDX['Palace'].z + CIDX['Temple'].z + CIDX['Ancestry'].z) / 3
};
/* the true distance from a square canton's own centre to its cap's edge
   along a bearing — same real-bug fix as CPIERS' own (30-layout.js) and
   the canoes' lifeCantonApproach (78-life.js) above: a flat radius only
   clears a face, not a corner. */
function lifeCantonEdge(c, dirX, dirZ){
  var capHw = c.r*1.07;
  var ang = Math.atan2(dirZ, dirX);
  var clearR = capHw / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang)));
  return [c.x + dirX*clearR, c.z + dirZ*clearR];
}
/* every pier this file builds beyond the original layout's own PIERS/
   CPIERS/RPIERS (30-layout.js) — the ferry stops below, plus the Port
   quay decks 78-life.js builds itself. 78-life.js's nav grid only ever
   checked against the 30-layout.js lists, so a ferry rerouting live could
   cut straight through one of these newer decks; it never knew they were
   there. Read by lifeNavBlocked (78-life.js, runs after this file). */
var LIFE_EXTRA_PIERS = [];
/* a small ferry pier: deck + piling pairs, box|wood/cyl|wood (already
   live everywhere), returns the outer tip (where the ferry actually
   docks) and the facing angle back toward the root. */
function lifeBuildFerryPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);
  BOX(midX, SEA+1.0, midZ, 5.5, 1.1, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=11){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*2.9, pz = rootZ+dirZ*k + (dirX)*sg*2.9;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 0.6, SEA+1.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: tipX, z1: tipZ, w: 5.5 });
  return { x: tipX, z: tipZ, ry: Math.atan2(-dirX, -dirZ) };
}

var LIFE_FERRY_STOPS = [];
var LIFE_SHRINE_STOPS = [];
(function(){
  /* the 4 cantons that already have a ferry pier (CPIERS, 30-layout.js) */
  ['Palace','Temple','Ancestry','Arena'].forEach(function(nm){
    var p = CPIERS.filter(function(pp){ return pp.canton === nm; })[0];
    if(p) LIFE_FERRY_STOPS.push({ x:p.x1, z:p.z1, ry:p.ry, name:nm });
  });
  /* a new pier at every OTHER canton, facing the bay's own centre —
     except Port (handled separately below, it has room of its own) and
     Guild (its own exception, handled below too, for siting reasons
     unrelated to what the canton is built as — see that block's own
     comment). 'Fortress'
     was 'Lighthouse' in an earlier session (30-layout.js: `{ n:
     'Lighthouse', ..., fortress:true }` — only the RENDERED building had
     swapped to ordinatorFortress(), the canton itself was never renamed
     until the owner caught it and asked for the real rename + the beacon
     moved to Port) — real gap found the same way the western-market one
     was reported: it simply wasn't in this list, so it never got a stop
     at all, on the circuit or off it. */
  ['Arsenal','Foreign','Granary','Market','Fortress'].forEach(function(nm){
    var c = CIDX[nm]; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 40);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:nm });
  });
  /* Port: the owner: "port canton ferry pier does not stick out into the
     water all the way and is causing some pathing issues" — the 34-unit
     length here was a deliberate guess that Port's own quay ring
     (LIFE_QUAYS, 78-life.js) would cover the rest, but that ring itself
     was later measured (fixing the ships' own dock-in-canton bug) to need
     a full 85 units past the bare canton edge before it's actually clear
     of Port's real structure — 34 just falls well short of open water,
     so a ferry routing to this stop's tip could still be fouled by
     whatever's sitting between there and true clearance. Same 85 used
     there, applied here too rather than a fresh guess. */
  (function(){
    var c = CIDX['Port']; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 85);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Port' });
  })();
  /* Guild exception: a pier by its OWN causeway's mainland landing, near
     Market F, instead of an inward pier on the canton itself — a siting
     choice, unrelated to what the canton is built as (Guild is its own
     four-craft-hall district now, not the garden this comment used to
     call it; see 30-layout.js's CIDX['Guild'].guild). */
  (function(){
    var cw = CAUSEWAYS.filter(function(c){ return c.c.n === 'Guild'; })[0];
    if(!cw) return;
    /* real bug found via screenshot: built at cw.s exactly, this pier
       ran almost perfectly parallel to, and overlapping, the causeway
       itself (both anchored to the same shore point, both oriented off
       the same shoreNorm) — not missing, just visually fused into the
       wider causeway deck and unreadable as its own structure. Offset
       35 units of shore arc-length to the side so it lands near, not on
       top of, the causeway. */
    var pierS = cw.s + 35;
    var landing = shoreIn(pierS, 26), n = shoreNorm(pierS);
    var pier = lifeBuildFerryPier(landing[0]-n[0]*4, landing[1]-n[1]*4, -n[0], -n[1], 36);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Guild-causeway' });
  })();
  /* river docks: reuse an existing RPIERS entry (30-layout.js) outright —
     no new geometry needed, it is already a real dock. */
  (function(){
    var rp = RPIERS[1];
    if(rp) LIFE_FERRY_STOPS.push({ x:rp.x1, z:rp.z1, ry:rp.ry, name:'RiverDocks' });
  })();
  /* the main harbour: a new pier by the mainland customs office (this
     file's own standalone placement just above — see its own comment
     for the exact siting). */
  (function(){
    var cx = 951.58, cz = -939.26;
    var s = shoreS(cx,cz), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Customs' });
  })();
  /* the promontory point (same shoreS(-545,-317) anchor the camera preset
     and prop placement already use). */
  (function(){
    var s = shoreS(-545,-317), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Promontory' });
  })();
  /* island shrines — their own small piers, not on the main circular
     route (the dedicated temple<->shrines ferry below uses these). */
  var templeC = CIDX['Temple'];
  ISLES.filter(function(i){ return i[4] === 'shrine'; }).forEach(function(isle, si){
    var sx = isle[0], sz = isle[1], srad = isle[3];
    var dx = sx-templeC.x, dz = sz-templeC.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    /* the owner: the southernmost shrine's (si===0, isle at [60,1800] —
       the only one south of Temple, per its own +z) pier "is on the
       south side, would work better on north side." South-side is what
       the plain "away from Temple" formula below gives every shrine —
       reasonable for the other one (north of Temple, so "away" already
       means further north, the open-water side), wrong for this one
       specifically because its own south side faces open lake while its
       north side faces back toward Temple/the mainland, the direction
       ferries and foot traffic actually arrive from. Flip only this one
       rather than the shared formula, so the other shrine (unreported,
       presumably fine) is untouched. */
    if(si === 0){ dx = -dx; dz = -dz; }
    var rootX = sx+dx*srad*0.9, rootZ = sz+dz*srad*0.9;
    var pier = lifeBuildFerryPier(rootX, rootZ, dx, dz, 22);
    LIFE_SHRINE_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Shrine'+si });
  });
  /* the owner also asked for "a small footbridge on the south side to
     the mainland" for that same southernmost shrine — measured first,
     not guessed: the island's own true south edge (its centre + its own
     radius, straight +z) sits only ~10 units from the nearest shore
     point (shoreS/shoreAt), an easy hand-built footbridge, unlike the
     OTHER shrine's south side (~364 units of open water — nowhere near
     "small", not attempted). Narrower than lifeBuildFerryPier's own
     5.5-unit ferry deck (3.0) since this is foot traffic only. */
  (function(){
    var isle0 = ISLES.filter(function(i){ return i[4] === 'shrine'; })[0];
    if(!isle0) return;
    var sx = isle0[0], sz = isle0[1], srad = isle0[3];
    var southX = sx, southZ = sz+srad;
    var s = shoreS(southX, southZ);
    var shorePt = shoreAt(s);
    var ddx = shorePt[0]-southX, ddz = shorePt[1]-southZ, dd = Math.hypot(ddx,ddz) || 1;
    ddx/=dd; ddz/=dd;
    var len = dd + 4;   /* a few units past the shoreline, onto solid ground */
    var bry = Math.atan2(ddx, ddz);
    var midX = southX+ddx*len*0.5, midZ = southZ+ddz*len*0.5;
    BOX(midX, SEA+0.9, midZ, 3.0, 0.7, len*1.03, bry, 0x8a7659, 'wood');
    for(var k=4; k<len; k+=8){
      [-1,1].forEach(function(sg){
        var px = southX+ddx*k + (-ddz)*sg*1.5, pz = southZ+ddz*k + (ddx)*sg*1.5;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.35, SEA+1.1-bh, 0, 0x6b5942, 'wood');
      });
    }
  })();
})();
/* order the main circle by angle round the bay centre — a pragmatic
   stand-in for real water-channel routing (same honest caveat as the
   canoes' own heuristic in 78-life.js): geographically reasonable
   without needing to model the actual channels between every stop. */
LIFE_FERRY_STOPS.forEach(function(s){ s.angle = Math.atan2(s.z-LIFE_BAY_CENTER.z, s.x-LIFE_BAY_CENTER.x); });
LIFE_FERRY_STOPS.sort(function(a,b){ return a.angle-b.angle; });
/* the shrine circuit: Temple plus its 4 shrines, ordered by angle round
   Temple itself (there's no separate "centre" for a 5-stop circuit). */
var LIFE_SHRINE_ROUTE = [{ x: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].x1,
                            z: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].z1,
                            ry: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].ry, name:'Temple' }]
  .concat(LIFE_SHRINE_STOPS);
(function(){
  var hubX = LIFE_SHRINE_ROUTE[0].x, hubZ = LIFE_SHRINE_ROUTE[0].z;
  LIFE_SHRINE_ROUTE.forEach(function(s){ s.angle = Math.atan2(s.z-hubZ, s.x-hubX); });
  var head = LIFE_SHRINE_ROUTE[0];
  var rest = LIFE_SHRINE_ROUTE.slice(1).sort(function(a,b){ return a.angle-b.angle; });
  LIFE_SHRINE_ROUTE = [head].concat(rest);
})();

/* ============================== fisherman's docks (new) ======================
   Owner's ask: dedicated small piers for fishing dhows in 4 hand-marked cove
   polygons, packed with "as many docks as will fit" via claim() (30-layout.js) —
   real collision, not a guessed count — and sized "intermediate" between the
   harbour's own long finger piers (60-land.js PIERS: deck w 11-17 i.e. ~14, deck
   h 1.7, piling r 1.05) and the small ferry-stop piers just above
   (lifeBuildFerryPier: deck w 5.5, deck h 1.1, piling r 0.6). Width/height/piling
   radius below are the true numeric midpoint of those two pairs. LENGTH is NOT
   interpolated the same way — every existing pier constructor in this codebase
   already varies its length by what its own site can hold (ferry piers alone
   span 22-85 depending on call site), and these 4 cove polygons cap out around
   130-160 units deep from the shore chord to the polygon's far edge, nowhere
   near a harbour pier's 120-215 — so length lands near the top of the ferry
   piers' own range instead, the same site-driven choice this file always makes.

   Shore attachment, checked live against window._api.shoreS/terrainH, not
   assumed: 3 of the 4 polygons have their first two vertices sitting within
   ~30 units of the real procedural shoreline (15-shore.js) and in that exact
   order, so that first edge is the shore chord every pier in the zone roots
   along, normal-out toward the polygon's own centroid.

   The 4th polygon ([985.7,-1424.4]…, 'ShoalBank') has no shore chord, and an
   earlier pass here left its 3 piers standing in open water as a freestanding
   pile platform, on a measurement ("400-530 units from any real shore on every
   vertex") that turns out to be an artifact of the tool used, not the terrain:
   landDist()/shoreS() answer against the MAIN traced shoreline only, and both
   nearer things in this bay are invisible to them — terrainH() puts real land
   (the ISLES 'rock' islet at 760,-1620, r 52) 110-260 units off the polygon,
   and the Port canton is nearer still. Cantons are platforms standing over
   open water, so terrainH under one reads as sea floor and landDist can't see
   one at all; measured against the canton's own cap square instead
   (c.r*1.07, the same constant lifeCantonEdge uses), Port's south cap edge is
   just 29.7 units from this polygon's own [1033.7,-1476.5] corner, and the
   polygon's whole east lobe sits directly under that edge. So the honest
   answer for this zone is not a freestanding platform and not a 200-unit
   causeway to a bare rock: it is a jetty off the Port canton — the harbour
   canton, ~30 units away — with the piers hanging off that, which is what
   buildFishDockJetty() below builds. Water here is a flat 16-18 deep, so the
   trestle's own pilings are ordinary; the Port canton already runs 95-unit
   quay decks over the same depth on its other three faces (78-life.js,
   LIFE_QUAYS), which is the precedent this follows. */
var LIFE_FISHDOCK_W = 9.5;        /* deck full width — mid(11-17 harbour, 5.5 ferry) */
var LIFE_FISHDOCK_H = 1.4;        /* deck thickness  — mid(1.7 harbour, 1.1 ferry) */
var LIFE_FISHDOCK_PILE_R = 0.8;   /* piling radius   — mid(1.05 harbour, 0.6 ferry) */
var LIFE_FISHDOCK_LEN = 38;       /* into the water  — capped by these small coves, see note above */
/* how wide a berthed dhow's own footprint is, measured off the pier's
   centreline: 78-life.js moors each boat at pier.w*0.5 + BEAM*0.5 + 1.2 to one
   side, and the hull is BEAM wide, so its outboard edge sits
   LIFE_FISHDOCK_W*0.5 + BEAM + 1.2 = 4.75 + 4.05 + 1.2 = 10.0 out. Written as
   a literal rather than read from LIFE_DHOW_BEAM because that constant is
   declared later in this same BUILD() scope (78-life.js) — hoisted, so the
   name exists here, but still undefined when this file runs. 78-life.js's own
   dhow section carries the matching note; if the hull is rescaled again, both
   move together. */
var LIFE_FISHDOCK_MOOR_HALF = LIFE_FISHDOCK_W*0.5 + 4.05 + 1.2;
/* is the water at this point on a pier's axis good enough to berth against —
   not just under the deck's own centreline, but across the whole band the
   three moored dhows occupy, and 2 units aft of it (a slot-0 hull's sternmost
   point lands 0.25*38 - 0.51*16.2 = +1.2 SEAWARD of the datum, so 2 units of
   aft margin covers it with slack). This is the test the "13 of 45 mooring
   slots sit over beach" defect actually needed: a chord marked inland has its
   centreline sample go wet several units before a laterally-offset stern
   does, because these shorelines run oblique to the marked chords. */
function fishDockBerthWet(x, z, nx, nz){
  var px = -nz, pz = nx, a, L;
  for(a = -2; a <= 0.001; a += 2){
    for(L = -LIFE_FISHDOCK_MOOR_HALF; L <= LIFE_FISHDOCK_MOOR_HALF+0.001; L += LIFE_FISHDOCK_MOOR_HALF*0.5){
      if(terrainH(x + nx*a + px*L, z + nz*a + pz*L) > SEA) return false;
    }
  }
  return true;
}
var LIFE_FISH_PIERS = [];
function buildFishDockPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);
  /* real claim() collision, same shared machinery (30-layout.js) every other
     footprint in the city is packed against — this is what actually limits
     how many piers a zone gets, not a hand-picked count. */
  var rec = claim(midX, midZ, LIFE_FISHDOCK_W*0.5+1.2, len*0.5+1.2, ry, 'fishdock');
  if(!rec) return null;
  BOX(midX, SEA+LIFE_FISHDOCK_H*0.7, midZ, LIFE_FISHDOCK_W, LIFE_FISHDOCK_H, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=10){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*(LIFE_FISHDOCK_W*0.5-1.1), pz = rootZ+dirZ*k + (dirX)*sg*(LIFE_FISHDOCK_W*0.5-1.1);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;
  /* registered in LIFE_EXTRA_PIERS too, same as every other pier this file
     builds beyond 30-layout.js's own PIERS/CPIERS/RPIERS — so ferries/ships/
     the pleasure barge (lifeNavBlocked/lifePierOrBridgeBlocked) and the
     fishing dhows themselves (78-life.js) all route around these decks. */
  LIFE_EXTRA_PIERS.push({ x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W });
  /* `len` is the pier's REAL length: it is no longer always LIFE_FISHDOCK_LEN
     (a shore pier grows landward to reach dry ground, see buildFishDockZone),
     and 78-life.js measures each dhow's mooring slot along it. */
  return { x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W, len:len,
           dirX:dirX, dirZ:dirZ, tipX:tipX, tipZ:tipZ };
}
/* one dock zone: roots piers along poly[i0]->poly[i1] (the shore chord, or the
   longest edge for the one zone with no real shore), normal-out toward the
   polygon's own centroid, scanning every 4 units and letting claim() reject
   whatever doesn't fit — "as many as will fit", not a fixed count per zone. */
function buildFishDockZone(zoneName, poly, i0, i1){
  var A = poly[i0], B = poly[i1];
  var tx = B[0]-A[0], tz = B[1]-A[1], spineLen = Math.hypot(tx,tz) || 1;
  tx /= spineLen; tz /= spineLen;
  var nx = -tz, nz = tx;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;
  var midX = (A[0]+B[0])*0.5, midZ = (A[1]+B[1])*0.5;
  if((cx-midX)*nx + (cz-midZ)*nz < 0){ nx = -nx; nz = -nz; }   /* normal must point INTO the polygon */
  var margin = LIFE_FISHDOCK_W*0.5 + 2, step = 4;
  for(var u = margin; u <= spineLen-margin; u += step){
    var markX = A[0]+tx*u, markZ = A[1]+tz*u;
    /* The owner's chord is hand-marked, so it runs OFF the real waterline in
       both directions, and the two errors need opposite corrections:

       (a) marked OFFSHORE — the original case here: 3 of CoveFortress's piers
           rooted ~10 units short of dry land, a pier beginning in open water.
       (b) marked INLAND — CoveWest's whole chord and CoveEast's first pier.
           Probed live against terrainH, those roots sit 4 to 32 units up the
           beach (CoveWest: 16/24/26/28/32), so the seaward LIFE_FISHDOCK_LEN
           that 78-life.js measures its mooring slots along was partly dry
           ground, and 13 of the 45 dhow slots had a hull footprint over sand.
           The previous pass tried to fix that in 78-life.js by walking each
           SLOT seaward; that failed because these shorelines run oblique to
           the chords (a laterally-offset stern is still on land well after
           the centreline is wet) and it crushed same-flank slot spacing from
           25.1 to 7.1. It is fixed here instead, where a root can move.

       So the pier is sited in two steps rather than one:

       1. THE MOORING DATUM. Walk SEAWARD from the marked point to the first
          place whose whole berth band is genuinely water (fishDockBerthWet:
          the full 10-unit half-width a moored dhow occupies, plus 2 units of
          stern margin — not just the centreline, which goes wet first on an
          oblique shore). A chord already marked offshore is berth-wet at
          step 0 and does not move at all, so case (a) behaves exactly as
          before. Cap 40 units: past that the chord is not a shore chord in
          any useful sense, so the pier stays where it was marked and the
          audit reports its beached slots loudly instead of this growing a
          freak 200-unit pier — the same fail-loud rule the landward walk
          below already follows.
       2. THE DECK. From that datum, walk LANDWARD to the first sample above
          the waterline (cap 24) and lengthen the deck by exactly that much,
          so the deck still physically lands on the beach while the datum —
          which is what 78-life.js measures the mooring slots back from, via
          (pier.len - LIFE_FISHDOCK_LEN) — stays on the waterline. That is
          why the slot layout [0.25,0.58,0.91]/[1,-1,1] survives this change
          untouched: every slot is positioned relative to the datum, and the
          datum is now the waterline in all four zones instead of in two. */
    var out = 0;
    while(out < 40 && !fishDockBerthWet(markX + nx*out, markZ + nz*out, nx, nz)) out += 2;
    if(out >= 40) out = 0;                                   /* no berthable water within 40: leave it marked, fail loud */
    var rootX = markX + nx*out, rootZ = markZ + nz*out;
    var back = 0, len = LIFE_FISHDOCK_LEN;
    while(back < 24 && terrainH(rootX - nx*back, rootZ - nz*back) <= SEA) back += 2;
    if(back > 0 && back < 24){ rootX -= nx*back; rootZ -= nz*back; len += back; }
    var pier = buildFishDockPier(rootX, rootZ, nx, nz, len);
    if(pier){ pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length; pier.attach = 'shore';
              pier.seaward = out; pier.onshore = (len - LIFE_FISHDOCK_LEN);   /* diagnostics: how far the two walks moved it */
              LIFE_FISH_PIERS.push(pier); }
  }
}
/* the trestle walkway itself: a narrower deck than a pier (this is the thing
   fishermen WALK, not the thing a dhow ties to), same box|wood + cyl|wood
   combos already live, so zero new draw calls. Deliberately NOT claim()ed —
   claim()'s collision test is circle-vs-circle on each footprint's
   circumscribing radius, so a 115-long deck claims a ~58-unit circle and
   would reject every pier that tries to root ON it, which is the whole point
   of a jetty. That matches what every other water deck in this codebase
   already does: lifeBuildFerryPier and the Port/harbour quays (78-life.js)
   don't claim() either, they only register in LIFE_EXTRA_PIERS so the nav
   layer routes boats around them. */
var LIFE_FISHDOCK_WALK_W = 6.0;
function buildFishDockWalk(ax, az, bx, bz){
  var dx = bx-ax, dz = bz-az, L = Math.hypot(dx,dz) || 1;
  dx /= L; dz /= L;
  var ry = Math.atan2(dx, dz);
  BOX(ax+dx*L*0.5, SEA+LIFE_FISHDOCK_H*0.7, az+dz*L*0.5, LIFE_FISHDOCK_WALK_W, LIFE_FISHDOCK_H, L*1.02, ry, 0x8a7659, 'wood');
  for(var k=4; k<L; k+=11){
    [-1,1].forEach(function(sg){
      var px = ax+dx*k + (-dz)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var pz = az+dz*k + ( dx)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  LIFE_EXTRA_PIERS.push({ x0:ax, z0:az, x1:bx, z1:bz, w:LIFE_FISHDOCK_WALK_W });
  return { x0:ax, z0:az, x1:bx, z1:bz, dirX:dx, dirZ:dz, len:L, w:LIFE_FISHDOCK_WALK_W };
}
/* a zone with no shore chord but a canton within reach: run one trestle from
   that canton's own cap edge out along the polygon's long axis, and hang the
   piers off BOTH sides of it (a jetty has berths either side — and it is what
   lets 3 piers fit in a lobe too small for 3 shore-rooted ones). Same
   claim()-decides-the-count rule as buildFishDockZone; roots sit on the
   walkway's own edge, pointing away, so no pier ever overlaps the deck it
   grows out of. */
function buildFishDockJetty(zoneName, poly, cantonName, spineLen){
  var c = CIDX[cantonName]; if(!c) return;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;
  /* anchor: the point on the canton's own cap square nearest the polygon's
     centroid, clamped 10 units in from the corner so the trestle meets a
     face, not a corner point. capHw is lifeCantonEdge()'s own constant. */
  var capHw = c.r*1.07;
  var ax, az;
  if(Math.abs(cx-c.x) > Math.abs(cz-c.z)){
    ax = c.x + (cx<c.x ? -capHw : capHw);
    az = Math.max(c.z-capHw+10, Math.min(c.z+capHw-10, cz));
  }else{
    az = c.z + (cz<c.z ? -capHw : capHw);
    ax = Math.max(c.x-capHw+10, Math.min(c.x+capHw-10, cx));
  }
  var tx = cx-ax, tz = cz-az, tL = Math.hypot(tx,tz) || 1;
  tx /= tL; tz /= tL;
  var bx = ax+tx*spineLen, bz = az+tz*spineLen;
  var walk = buildFishDockWalk(ax, az, bx, bz);
  var nx = -tz, nz = tx;
  var margin = LIFE_FISHDOCK_W*0.5 + 4, step = 4;
  var side = 1;
  for(var u = margin; u <= spineLen-margin; u += step){
    var sx = ax+tx*u, sz = az+tz*u;
    var dirX = nx*side, dirZ = nz*side;
    var rootX = sx + dirX*(LIFE_FISHDOCK_WALK_W*0.5), rootZ = sz + dirZ*(LIFE_FISHDOCK_WALK_W*0.5);
    var pier = buildFishDockPier(rootX, rootZ, dirX, dirZ, LIFE_FISHDOCK_LEN);
    if(pier){
      /* claim() alone is not enough HERE, and the audit caught it: its test
         is circle-vs-circle, and two 38-long piers rooted on OPPOSITE sides
         of the trestle a few units apart along it have centres ~38 apart —
         just inside two 21.5 radii, so claim() passes them, while their
         9.5-wide decks really do overlap back-to-back across the walkway.
         Stepping the spine on by a full deck width after each success is the
         real constraint (opposite-side neighbours end up ~13 units apart
         along the trestle, a ~4-unit gap between deck edges). */
      u += LIFE_FISHDOCK_W + 4 - step;
      pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length;
      pier.attach = 'canton:'+cantonName; pier.walk = walk;
      LIFE_FISH_PIERS.push(pier);
      side = -side;   /* next one off the other side, so the jetty berths both flanks */
    }
  }
}
var LIFE_FISH_ZONES = [
  { name:'CoveEast',     poly:[[742.1,-466.2],[720.3,-395.8],[597.5,-431.8],[611.0,-497.2]],           i0:0, i1:1 },
  { name:'CoveFortress', poly:[[2011.9,-1209.6],[2139.5,-1324.8],[2018.2,-1416.3],[1910.6,-1337.3]],   i0:0, i1:1 },
  { name:'CoveWest',     poly:[[-1510.1,-926.5],[-1699.2,-1053.7],[-1627.2,-1177.6],[-1416.1,-1059.3]],i0:0, i1:1 },
  { name:'ShoalBank',    poly:[[985.7,-1424.4],[898.0,-1425.9],[896.1,-1537.3],[999.2,-1526.0],[1029.4,-1519.9],[1033.7,-1476.5],[1001.8,-1462.9]], canton:'Port', spine:112 }
];
LIFE_FISH_ZONES.forEach(function(z){
  if(z.canton) buildFishDockJetty(z.name, z.poly, z.canton, z.spine);
  else buildFishDockZone(z.name, z.poly, z.i0, z.i1);
});
window._fishDocks = { piers: LIFE_FISH_PIERS.length, list: LIFE_FISH_PIERS,
  perZone: LIFE_FISH_ZONES.map(function(z){ return { name:z.name, n: LIFE_FISH_PIERS.filter(function(p){ return p.zone===z.name; }).length }; }) };   /* diagnostic */

/* ---- cart landings: where a MERCHANT CARAVAN actually collects the catch ----
   Owner: "fishing docks ... should be caravan destinations." A cart cannot
   drive onto a pier deck (9.5 wide, over open water, reached by a walkway),
   so the pier itself is the wrong point to hand 78-life.js — exactly the bug
   LIFE_CARAVAN_HARBOR already documents for PIERS (it used to route carts to
   the water-side TIP and they swam). One LANDWARD point per dock instead,
   filled here (where the pier's own root/axis/attachment are known) and
   consumed wholesale by 78-life.js's caravan pools — the same cross-file
   hand-off shape as LIFE_RBARGE_DOCKS/LIFE_STRIDER_STATIONS.

   Two real cases, because this file builds two kinds of fish dock:
   - a SHORE pier roots on the waterline, so the landing walks back up its own
     axis (-dir) in 4-unit steps to the first genuinely dry sample, capped at
     40 — the same walk-the-root-back-to-dry-ground idiom buildFishDockZone
     already uses when it roots the pier in the first place.
   - a JETTY pier (ShoalBank) hangs off a trestle out in 17 units of water;
     there is no landward shore at all, and its only dry end is the Port
     canton the trestle is anchored to. All the piers on one trestle share
     that single anchor, so they register ONE landing between them (deduped
     on the walkway) rather than five copies of the same point, which would
     otherwise make ShoalBank five times likelier to be picked than a cove.
     That landing is NOT the anchor itself: the anchor sits on the canton's
     CAP square (half-width c.r*1.07) but outside its radius c.r, and both
     78-life.js's lifeGroundY and the road graph stop at c.r — measured, a
     cart parked on the anchor reads its height as open water (-15.7) and
     its nearest road node is 293 units off, past that file's own 260-unit
     snap limit, so it would be rejected outright. The landing therefore
     walks in along the trestle's own bearing to the first point genuinely
     INSIDE the canton (0.80*c.r, on the deck by construction) — the quay
     the jetty lands on, which is where a cart would load anyway.
   ry follows LIFE_CARAVAN_HARBOR's own convention (atan2 of the seaward
   direction) so a parked cart faces its pier, not away from it. */
var LIFE_FISH_CART_STOPS = [];
(function(){
  var seenWalk = [];
  LIFE_FISH_PIERS.forEach(function(p){
    var sx, sz;
    if(p.walk){
      if(seenWalk.indexOf(p.walk) >= 0) return;
      seenWalk.push(p.walk);
      var cn = (p.attach||'').indexOf('canton:') === 0 ? CIDX[p.attach.slice(7)] : null;
      if(!cn) return;   /* a trestle with no canton has no landward end at all */
      var dxc = cn.x - p.walk.x0, dzc = cn.z - p.walk.z0, Lc = Math.hypot(dxc,dzc) || 1;
      var inward = Math.max(0, Lc - cn.r*0.80);
      sx = p.walk.x0 + dxc/Lc*inward; sz = p.walk.z0 + dzc/Lc*inward;
      LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.walk.dirX, p.walk.dirZ),
                                  zone:p.zone, attach:p.attach, inward:Math.round(inward) });
      return;
    }
    var back = 0;
    while(back < 40 && terrainH(p.x0 - p.dirX*back, p.z0 - p.dirZ*back) <= SEA+2.5) back += 4;
    sx = p.x0 - p.dirX*back; sz = p.z0 - p.dirZ*back;
    /* no dry ground within 40 units behind the root: register nothing rather
       than hand 78-life.js a point in the water (claim()-style reject) */
    if(terrainH(sx,sz) <= SEA+2.5) return;
    LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.dirX, p.dirZ),
                                zone:p.zone, attach:p.attach, setback:back });
  });
})();
window._fishCartStops = LIFE_FISH_CART_STOPS;   /* diagnostic */

/* live audit, the owner's own two questions ("attached to shore or nearby
   canton" / "not overlapping anything") asked of the built world rather than
   of the source: a closure so it can read the things that never escape
   BUILD()'s scope (PLACED, chinHit, LIFE_EXTRA_PIERS, CANTON_TOPS, CAUSEWAYS).
   Debug-only, called from a headless probe — nothing in the build calls it,
   it allocates nothing at build time and costs no draw calls. Every fix in
   this section was driven by its output, so it stays here as the check that
   can be re-run after any later edit moves a shoreline or a canton. */
/* signed distance to the nearest canton BASE platform square (<0 = on it).
   The half-width here is c.r*1.07 — the plinth cap, the same constant
   lifeCantonEdge() uses and the one every pier in this file already roots
   against. Deliberately NOT CANTON_TOPS[n].hw: that records the TOPMOST
   TIER's half-width (50-cantons.js writes it at the end of the tier loop),
   which for Port is ~66 against a base cap of 147.7 — using it made this
   audit read a jetty rooted exactly on the canton's own edge as "82 units
   off the canton", a measurement bug in the check, not in the dock. */
function fishDockCantonEdge(x, z){
  var bn=null, bd=1e9;
  for(var i=0;i<CANTONS.length;i++){
    var c = CANTONS[i];
    var hw = c.r*1.07;
    var dx = Math.abs(x-c.x)-hw, dz = Math.abs(z-c.z)-hw;
    var d = (dx>0 || dz>0) ? Math.hypot(Math.max(dx,0), Math.max(dz,0)) : Math.max(dx,dz);
    if(d < bd){ bd = d; bn = c.n; }
  }
  return { canton:bn, d:bd };
}
window._fishDocks.audit = function(){
  function segD(px,pz,ax,az,bx,bz){
    var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz;
    var t = L ? ((px-ax)*dx+(pz-az)*dz)/L : 0; t = Math.max(0,Math.min(1,t));
    return Math.hypot(px-ax-t*dx, pz-az-t*dz);
  }
  function segSegD(a,b,c,d){
    var m = 1e9, i, t, x, z;
    for(i=0;i<=24;i++){ t=i/24; x=a[0]+(b[0]-a[0])*t; z=a[1]+(b[1]-a[1])*t; m=Math.min(m, segD(x,z,c[0],c[1],d[0],d[1])); }
    for(i=0;i<=24;i++){ t=i/24; x=c[0]+(d[0]-c[0])*t; z=c[1]+(d[1]-c[1])*t; m=Math.min(m, segD(x,z,a[0],a[1],b[0],b[1])); }
    return m;
  }
  var others = [];
  PIERS.forEach(function(p,i){ others.push({ tag:'PIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||14) }); });
  CPIERS.forEach(function(p,i){ others.push({ tag:'CPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||8) }); });
  RPIERS.forEach(function(p,i){ others.push({ tag:'RPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||10) }); });
  LIFE_EXTRA_PIERS.forEach(function(p,i){ others.push({ tag:'EXTRA['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||6) }); });
  return LIFE_FISH_PIERS.map(function(p, idx){
    var r = { i:idx, zone:p.zone, root:[Math.round(p.x0), Math.round(p.z0)], tip:[Math.round(p.tipX), Math.round(p.tipZ)] };
    /* attachment: walk the pier's OWN axis landward from the root */
    var land = null, d;
    for(d=0; d>=-260; d-=2){
      if(terrainH(p.x0+p.dirX*d, p.z0+p.dirZ*d) > SEA){ land = -d; break; }
    }
    r.landBehind = land;
    var ce = fishDockCantonEdge(p.x0, p.z0);
    r.canton = ce.canton; r.cantonD = Math.round(ce.d*10)/10;
    if(p.walk){
      /* a jetty pier: its own axis heads out to open water by design — what
         has to reach land is the WALKWAY it stands on. Measured, not assumed:
         the walkway's landward end against the canton's own cap square. */
      var we = fishDockCantonEdge(p.walk.x0, p.walk.z0);
      r.walkRootCantonD = Math.round(we.d*10)/10;
      r.attach = (we.d <= 2) ? ('jetty->canton:'+we.canton)
               : ('JETTY ROOT '+Math.round(we.d)+' OFF '+we.canton);
    }else{
      r.attach = (land !== null && land <= 8) ? 'shore'
               : (ce.d <= 10) ? ('canton:'+ce.canton)
               : (land !== null && land <= 40) ? ('shore+'+Math.round(land))
               : 'NOT ATTACHED';
    }
    /* overlaps */
    var hits = [];
    others.forEach(function(o){
      if(Math.hypot(o.a[0]-p.x0, o.a[1]-p.z0) < 0.01 && Math.hypot(o.b[0]-p.tipX, o.b[1]-p.tipZ) < 0.01) return;  /* itself */
      /* the walkway this pier deliberately grows out of: a root sitting on the
         trestle's own edge is the attachment, not a collision */
      if(p.walk && Math.hypot(o.a[0]-p.walk.x0, o.a[1]-p.walk.z0) < 0.01 && Math.hypot(o.b[0]-p.walk.x1, o.b[1]-p.walk.z1) < 0.01) return;
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], o.a, o.b);
      if(dd < p.w*0.5 + o.w*0.5) hits.push(o.tag+' '+(Math.round(dd*10)/10));
    });
    LIFE_RBARGE_DOCKS.forEach(function(dk,di){
      var dd = segD(dk.x, dk.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < p.w*0.5 + 14) hits.push('rbargeDock'+di+' '+(Math.round(dd*10)/10));
    });
    PLACED.forEach(function(o){
      if(o.tag === 'fishdock') return;
      var dd = segD(o.x, o.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < o.rad + p.w*0.5) hits.push('PLACED:'+o.tag+' '+(Math.round(dd*10)/10));
    });
    var t2, x2, z2;
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(typeof chinHit !== 'undefined' && chinHit(x2,z2, p.w*0.5+2)){ hits.push('chinampa'); break; }
    }
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(inRiver(x2,z2, 12)){ hits.push('river-channel'); break; }
    }
    CAUSEWAYS.forEach(function(cw,ci){
      var lp = shoreIn(cw.s, 26);
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [cw.c.x,cw.c.z], [lp[0],lp[1]]);
      if(dd < p.w*0.5 + CWAY*0.5 + 4) hits.push('causeway'+ci+' '+(Math.round(dd*10)/10));
    });
    SPANS.forEach(function(sp,si){
      var A2 = CANTONS[sp.a], B2 = CANTONS[sp.b];
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [A2.x,A2.z], [B2.x,B2.z]);
      if(dd < p.w*0.5 + DECK*0.5 + 4) hits.push('span'+si+' '+(Math.round(dd*10)/10));
    });
    r.overlaps = hits;
    /* ---- the mooring slots themselves ----------------------------------
       The thing the shore-mooring pass is actually judged on, checkable
       afterwards instead of taken on trust: for each dhow berthed on this
       pier (78-life.js's LIFE_FISH_BOATS — a var in this same BUILD() scope,
       so hoisted and populated by the time anything calls this), sample the
       hull's REAL footprint (stern -0.51*LEN to prow tip +0.67*LEN, beam
       full width) against terrainH and report whether any of it is over
       beach. `dry` on a boat means exactly the defect: a hull sitting on
       sand rather than floating. */
    if(typeof LIFE_FISH_BOATS !== 'undefined' && LIFE_FISH_BOATS.length){
      r.moor = [];
      LIFE_FISH_BOATS.forEach(function(b){
        if(b.pier !== p) return;
        var fx = Math.sin(b.home.ry), fz = Math.cos(b.home.ry);
        var sx2 = fz, sz2 = -fx, landN = 0, tot = 0, maxH = -1e9, a, c, hh;
        for(a = -0.51; a <= 0.671; a += 0.1174){
          for(c = -0.5; c <= 0.501; c += 0.25){
            hh = terrainH(b.home.x + fx*a*LIFE_DHOW_LEN + sx2*c*LIFE_DHOW_BEAM,
                          b.home.z + fz*a*LIFE_DHOW_LEN + sz2*c*LIFE_DHOW_BEAM);
            tot++; if(hh > SEA) landN++;
            if(hh > maxH) maxH = hh;
          }
        }
        r.moor.push({ side:b.moorSide, x:Math.round(b.home.x), z:Math.round(b.home.z),
                      land:landN, of:tot, maxH:Math.round(maxH*100)/100, dry:landN>0 });
      });
      r.moorDry = r.moor.filter(function(m){ return m.dry; }).length;
    }
    return r;
  });
};
/* the headline the mooring pass reports: how many of the fleet's berths have
   a hull footprint over beach, and where. Re-runnable after any later pass
   that moves a shoreline, a pier or the hull's own scale. */
window._fishDocks.moorReport = function(){
  var rows = window._fishDocks.audit(), dry = 0, total = 0, perZone = {};
  rows.forEach(function(r){
    (r.moor||[]).forEach(function(m){
      total++;
      perZone[r.zone] = perZone[r.zone] || { slots:0, dry:0 };
      perZone[r.zone].slots++;
      if(m.dry){ dry++; perZone[r.zone].dry++; }
    });
  });
  return { dry:dry, total:total, perZone:perZone,
           beached: rows.filter(function(r){ return r.moorDry; })
                        .map(function(r){ return { pier:r.i, zone:r.zone, dry:r.moorDry,
                                                   worst:Math.max.apply(null, r.moor.map(function(m){ return m.land; })) }; }) };
};

/* ============================== standalone shrines (new) ====================
   Three more shrines, not tied to any canton or island: one on the eastern
   hill, one in the central district near Palace/Temple, one near the
   western market. Anchor points came from probing terrainH/zoneAt/openAt
   directly against a built voth.html, not guessed:
     east    ~(2450,-360)  h~264 — the RIDGES hill (10-core.js's own
                                    [1820,520,...] range extended east)
                                    past the walled city, clear of the
                                    Funerary district ([1800,100]-[2100,400])
     central ~(1005, 95)  h~11  — core-zoned mainland, the nearest open
                                    land to the Palace/Temple/Ancestry bay
                                    centre (Palace/Temple are canton
                                    platforms over open water, so "near"
                                    here means the closest real ground, not
                                    the water between them)
     west   ~(-1360, 661)  h~4  — the shorehut band right at Market F's
                                    own anchor point (shoreS(-1370,681),
                                    the same point that district's own poly
                                    is built from, a few lines above)
   Real bug found placing these: a fixed, hand-picked coordinate for the
   central site collided with claim()'s own gridHit twice in a row across
   two separate rebuilds, from OTHER passes in this same shared session
   (61-monastery.js, a gate-modelling pass) landing new buildings nearby
   between one build and the next — a static coordinate baked in from an
   earlier probe goes stale the moment anything upstream of this file
   changes. lifeFindShrineSite (below) fixes that at the source: it
   searches outward from the anchor in real rings, actually calling
   claim() at each candidate against whatever the REAL PLACED state is at
   THIS build, so it self-heals instead of silently dropping a site.

   Physical form: a hand-built twin of the ISLES i[4]==='shrine' island
   shrine's own silhouette (60-land.js's ISLETS pass: plinth, cella, dome,
   4 corner spires), not shrineTriptych (that is the small roadside form
   68-props.js places elsewhere) — the owner wants these read as the SAME
   kind of shrine as the two water ones. That pass lives in 60-land.js,
   off limits this session, so this reproduces the same shape through the
   ordinary BOX/DOME/FR3 kit rather than editing it. TONES (PAL.stone.common)
   for the stone, DOMEC for the dome — the same aliases every other
   building in this file already reads. */
reseed(655001);
function lifeStandaloneShrine(x, z, ry, rad){
  var y = terrainH(x, z);
  var col = pick(TONES);
  BOX(x, y, z, rad*0.86, 2.0, rad*0.86, ry, shade(col,-0.14));
  BOX(x, y+1.8, z, rad*0.52, 5, rad*0.52, ry+0.4, col);
  DOME(x, y+6.8, z, rad*0.24, rad*0.20, 0, pick(DOMEC), 'dome');
  for(var s=0; s<4; s++){
    var sa = ry + Math.PI/4 + s*Math.PI/2;
    FR3(x+Math.cos(sa)*rad*0.36, y+1.8, z+Math.sin(sa)*rad*0.36, 3.4, rr(11,17), 3.4, sa, col);
  }
  return { x:x, z:z, y:y, ry:ry };
}
/* searches outward from (anchorX,anchorZ) in rings (centre first, then
   10 points per ring at a growing radius) for a spot that is on land in
   the right height band, off the road mask, clear of the river, gently
   sloped, AND that claim() itself accepts — the only real test for "does
   this collide with a building", since gridHit isn't exposed on its own.
   Same spiral-search shape as lifeNavNearestOpen (78-life.js), applied to
   claim() instead of a nav-grid cell. */
function lifeFindShrineSite(anchorX, anchorZ, opt){
  opt = opt || {};
  var minH = (opt.minH != null) ? opt.minH : -1e9;
  var maxH = (opt.maxH != null) ? opt.maxH : 1e9;
  var maxSlope = (opt.maxSlope != null) ? opt.maxSlope : 9;
  var footprint = (opt.footprint != null) ? opt.footprint : 22;
  for(var ring=0; ring<28; ring++){
    var r = ring*20, tries = ring===0 ? 1 : 10;
    for(var t=0; t<tries; t++){
      var ang = (t/tries)*Math.PI*2 + ring*0.37;
      var x = anchorX + Math.cos(ang)*r, z = anchorZ + Math.sin(ang)*r;
      var h = terrainH(x,z);
      if(h < minH || h > maxH) continue;
      if(opt.requireCore && zoneAt(x,z) !== 'core') continue;
      if(inRiver(x,z,20)) continue;
      if(openAt(x,z)) continue;
      /* openAt() rejecting "open" ground is deliberate here (a shrine site
         wants to be tucked off the street front, not sitting in the
         middle of open buildable land) — but that "closed" ground also
         includes a ring/highway's own paved corridor, and nothing here
         ever told the two apart. ShrineCentral landed 7 units short of
         clearing the ring road next to Temple (found by a citywide
         ring/highway obstruction audit); this keeps the "off the open
         street front" search intact while still ruling out the corridor
         itself. */
      var nrh = nearestStreet(x, z, {ring:true, highway:true});
      /* footprint is already the HALF-extent on both axes (claim() above
         gets called with it as both fx and fz), so the worst-case corner
         reach from centre is Math.hypot(footprint,footprint), not a
         fraction of it — using 0.75*footprint here first still left
         ShrineCentral's actual built position 5 units short of clearing
         the ring road (audit re-check after the first fix landed). */
      if(nrh && nrh.dist < nrh.width*0.5 + Math.hypot(footprint,footprint)) continue;
      var hs = [terrainH(x+18,z), terrainH(x-18,z), terrainH(x,z+18), terrainH(x,z-18)];
      var slope = Math.max(Math.abs(hs[0]-h), Math.abs(hs[1]-h), Math.abs(hs[2]-h), Math.abs(hs[3]-h));
      if(slope > maxSlope) continue;
      var claimed = claim(x, z, footprint, footprint, opt.ry || 0, 'shrine');
      if(claimed) return { x:x, z:z };
    }
  }
  return null;
}
(function(){
  var sites = [
    { anchor:[2450,-360],  name:'ShrineEast',    face:[0,0],
      opt:{ minH:150, maxH:320, maxSlope:8 } },
    { anchor:[1005, 95],   name:'ShrineCentral', face:[CIDX['Temple'].x, CIDX['Temple'].z],
      opt:{ minH:5, maxH:40, maxSlope:6, requireCore:true, footprint:18 } },
    { anchor:[-1360, 661], name:'ShrineWest',    face:[-1370, 681],
      opt:{ minH:2, maxH:40, maxSlope:6 } }
  ];
  window._standaloneShrineDebug = [];
  sites.forEach(function(st){
    var ry = Math.atan2(st.face[0]-st.anchor[0], st.face[1]-st.anchor[1]);
    st.opt.ry = ry;
    var found = lifeFindShrineSite(st.anchor[0], st.anchor[1], st.opt);
    if(!found){ window._standaloneShrineDebug.push({name:st.name, ok:false}); return; }
    window._standaloneShrineDebug.push({name:st.name, ok:true, x:found.x, z:found.z});
    lifeStandaloneShrine(found.x, found.z, ry, (st.opt.footprint||22)*2.1);
    /* pushed to LIFE_SHRINE_STOPS only AFTER LIFE_SHRINE_ROUTE (just above)
       has already been computed from it — deliberate ordering, not an
       oversight: LIFE_SHRINE_ROUTE feeds the dedicated temple<->shrines
       FERRY (78-life.js), a boat that sails between stops, and these three
       are dry land — one of them a hilltop ~260 units above the lake —
       with no channel a boat could ever reach. Appending here instead
       means every OTHER consumer of LIFE_SHRINE_STOPS (LIFE_DOORS' shrine
       category, LIFE_CLERGY_POSTS' priest/templar posts, and
       82-daynight.js's night-light pass over LIFE_SHRINE_STOPS — all of
       which read the array fresh, well after this file finishes) picks
       these three up automatically and for free, while LIFE_SHRINE_ROUTE
       (already a fixed array by this point in file order) never sees them
       and the ferry keeps sailing to the original two island shrines only. */
    LIFE_SHRINE_STOPS.push({ x:found.x, z:found.z, ry:ry, name:st.name });
  });
})();

/* ============================== river-barge docks ===========================
   The owner: 7 river barges (up from 2), 1-2 docked and 5-6 in transit at
   any time, "give each one its own reserved dock to simplify things" — no
   more shared-quay contention logic (lifePickBargeDeparture/lifeShipOpenMobileDock,
   the ships' own pattern), each barge just cycles between ITS OWN dock and
   the far upstream limit independently. Built here (65, before 75's
   emitBuckets) for the same reason every other new pier in this file is:
   78-life.js runs after the static bake is already drained.
   Dock 0 reuses the real, existing RPIERS[0] (30-layout.js) outright — no
   new geometry. Docks 1-6 are new: 4 spread between the city and the
   owner's own upstream quad, then 2 sampled to land actually inside that
   quad ("spawn a couple more upstream... so we have enough") — real
   mooring points (a pair of bollards each), not a full jetty; the one
   place a real jetty belongs (the city's own river frontage) already has
   one in dock 0. */
var LIFE_RBARGE_QUAD = [[1785.2,1394.4],[1743.3,1447.7],[2116.9,1668.9],[2177.4,1593.6]];
var LIFE_RBARGE_DOCKS = [];
(function(){
  var total = RIVER_CUM[RIVER_CUM.length-1];
  var dockU0 = RIVER_HEAD + 30;   /* exactly RPIERS[0]'s own u */
  var qcx=0, qcz=0;
  LIFE_RBARGE_QUAD.forEach(function(p){ qcx+=p[0]; qcz+=p[1]; });
  qcx/=4; qcz/=4;
  var quadU = polyNear(qcx, qcz, RIVER, RIVER_CUM).t * total;
  /* the owner: "the river piers are also rending now, but perpendicular
     to how they ought to face" — real collision, not a broken formula:
     docks 1-4 below were spaced starting at dockU0 itself, the exact same
     u the 4 pre-existing RPIERS finger piers (30-layout.js, q=0..3 at
     dockU0, +58, +116, +174) occupy — dock 1 landed almost on top of
     RPIERS q=3, so its own quay wall (built along the BANK, correctly)
     visually crossed RPIERS' finger pier (built perpendicular, INTO the
     channel, also correctly) at a right angle, reading as one broken,
     wrongly-rotated structure. Starts the new docks' own u-range past
     RPIERS' full span (174) plus a clearance margin instead. */
  var clearU0 = dockU0 + 220;
  var us = [dockU0];
  for(var di=1; di<=4; di++) us.push(clearU0 + (quadU-clearU0)*di/6);
  var qMinX=Math.min(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMaxX=Math.max(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMinZ=Math.min(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  var qMaxZ=Math.max(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  for(var k=0; k<2; k++){
    var picked = null;
    for(var t2=0; t2<200; t2++){
      var x = rr(qMinX,qMaxX), z = rr(qMinZ,qMaxZ);
      if(pointInPoly(x, z, LIFE_RBARGE_QUAD)){ picked = [x,z]; break; }
    }
    if(!picked) picked = [qcx,qcz];
    us.push(polyNear(picked[0], picked[1], RIVER, RIVER_CUM).t * total);
  }
  us.forEach(function(u, di){
    var p = riverAt(u);
    var ry = Math.atan2(p.tx, p.tz);
    if(di === 0){
      LIFE_RBARGE_DOCKS.push({ x: RPIERS[0].bx, z: RPIERS[0].bz, ry: RPIERS[0].ry, u: u });
      return;
    }
    /* the owner: "new river docks appear to be sunk in the river" (first
       pass: r=0.7, top at SEA+2.0 — too small/subtle against a 50-unit
       barge) then, still, "river barge docks also seem to be sunk in the
       middle of the river" after thickening them. That second report is
       the real bug: `p` (riverAt(u)) is the river's own CENTRELINE, and
       this used to plant the whole dock — bollards AND the barge's own
       berth point — right on it, offset a token 8 units along the
       cross-channel normal. The channel here is 80-170+ units wide
       (riverHalf(), 30-layout.js), so 8 units off-centre is still
       stranded in open water, nowhere near either bank; nothing was
       "sunk", it just was never actually AT a dock site. Pushed out to
       riverHalf()'s own true city-bank edge (p.nx/p.nz — "the normal that
       points at the CITY side", riverAt's own doc comment) instead, with
       the two bollards spaced along the BANK (the tangent, p.tx/p.tz) to
       flank a moored barge's length, not across the current. */
    /* the owner, after the RPIERS-collision fix above: "the river piers
       are also rending now, but perpendicular to how they ought to face"
       — STILL true at the new u, but for a different reason: this never
       checked the chosen bank spot against anything already built there
       (a town building can stand anywhere the 60-land.js pass allowed,
       with no idea this loop would later want the same patch of bank) —
       what read as a second "wrong angle" pier was actually a building's
       own walls, diagonal in a top-down shot, sitting right on top of the
       new dock. Walks forward along the bank in u until claim() (the
       same clash test every other placement in the game already trusts)
       actually succeeds for the deck's own footprint. */
    var half, bx, bz, uTry = u, claimed = false;
    for(var uAttempt=0; uAttempt<24; uAttempt++){
      var p2 = riverAt(uTry);
      half = riverHalf(p2.x, p2.z);
      bx = p2.x + p2.nx*half; bz = p2.z + p2.nz*half;
      var ry2 = Math.atan2(p2.tx, p2.tz);
      /* claim() itself IS the "is this clear" test (it only mutates
         PLACED/the grid on success) — using it directly, rather than a
         separate read-only check, also permanently reserves the spot so
         nothing placed later can land on this dock either. */
      claimed = claim(bx, bz, 22, 6, ry2, 'rdock');
      if(claimed){ p = p2; break; }
      uTry = u + (uAttempt+1)*15;
    }
    ry = Math.atan2(p.tx, p.tz);
    /* the owner: "the river docks are missing piers... make sure they
       exist or render" — the bollards+crossbeam above were always real
       (mooring posts), but unlike the harbor/Port quays there was never
       an actual PLANK DECK here, just posts standing in open water with
       nothing connecting them to the bank — the same gap the north-Port
       "ghost galleon" dock had, fixed with a real deck there. Same fix
       here: a quay wall running ALONG the bank (ry — the same tangent
       direction the dock's own heading and the bollard spacing already
       use), not a finger pier poking into the channel, since a river
       barge moors alongside the bank, parallel to the current. Also
       registered in LIFE_EXTRA_PIERS so the nav-grid and every vehicle's
       own real-time avoidance actually know it's there. */
    BOX(bx, SEA+1.2, bz, 10, 1.4, 40, ry, 0x8a7659, 'wood');
    LIFE_EXTRA_PIERS.push({ x0: bx-p.tx*20, z0: bz-p.tz*20, x1: bx+p.tx*20, z1: bz+p.tz*20, w: 10 });
    [-1,1].forEach(function(sg){
      var px = bx + p.tx*sg*17, pz = bz + p.tz*sg*17;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 1.1, SEA+4.0-bh, 0, 0x6b5942, 'wood');
    });
    BOX(bx, SEA+3.6, bz, 1.0, 0.6, 34, ry, 0x5b4b38, 'wood');
    /* uTry, not u — the barge's own route (lifeRiverCurve(b.home.u,...))
       has to aim for wherever the clearance search above actually landed,
       not the original (possibly building-blocked) candidate u. */
    LIFE_RBARGE_DOCKS.push({ x: bx, z: bz, ry: ry, u: uTry });
  });
})();

/* ============================== the Fortress coast-guard dock ==============
   owner: "Add a dock on the north side to it in preparation for a coast
   guard vessel." The vessel does not exist yet — this is the dock only, plus
   the mooring record a future hull will read (LIFE_CGUARD_BERTHS below,
   the same builder-fills/consumer-reads hand-off LIFE_RBARGE_DOCKS and
   LIFE_FISH_CART_STOPS already use).

   NORTH is -z. Not assumed: the ships' inlet at z=-5128 is this world's
   fixed compass reference (the arena pass established it), so the dock roots
   on the Fortress canton's -z cap edge, which is also the one face with no
   causeway (the mole leaves to the west-south-west, land at -1255,-36), no
   ferry pier (the Fortress stop is at -264,-580, on the bay-centre side) and
   no chinampas (55-chinampa.js excludes beds north-west of this canton
   outright). Water there runs 26-31 deep on the dock's own footprint,
   measured, so the pile trestle is ordinary.

   SIZE. Deliberately between the two ends of the range this file already
   has, on every dimension that has both:
                      fishing pier   THIS dock   harbour finger pier
       deck width          9.5         12.5         11-17  (~14)
       deck thickness      1.4          1.55         1.7
       piling radius       0.8          0.95         1.05
       deck top (y)        SEA+2.38     SEA+3.55     SEA+4.7
       length into water  38           74 + a 46-wide berthing head   120-215
   i.e. a patrol vessel's dock: far more than a dhow's finger pier, well
   short of the working harbour's own quays.

   COSTS NOTHING IN THE BUDGET: box|wood, cyl|wood, box|cloth and fr8|roof
   are all already-spent buckets (the ferry/fishing piers, the market
   awnings, customsHouse's portico). */
var LIFE_CGUARD_BERTHS = [];      /* {x,z,ry,len,beam} — where a coast-guard hull ties up; builder fills, a future vessel reads */
var LIFE_CGUARD_DOCK = null;      /* {rootX,rootZ,tipX,tipZ,deckY,w,headHalf} — the dock itself, for anything that needs its geometry */
(function(){
  var c = CIDX['Fortress']; if(!c) return;
  var W = 12.5, TH = 1.55, PR = 0.95;             /* deck width / thickness / piling radius */
  var DECKY = SEA + 2.0;                          /* deck BOX base; its walkable top is DECKY+TH = SEA+3.55 */
  var LEN = 74;                                   /* trestle run into the bay */
  var HEADL = 46, HEADD = 14;                     /* the berthing head, across the trestle */
  var WOOD = 0x8a7659, PILE = 0x6b5942, TRIM = 0x5b4b38;
  var GREEN = 0x2f6b3a;                           /* the order's banner green, same scalar ordinatorFortress() flies */
  var rootX = c.x, rootZ = c.z - (c.r*1.07 - 3);  /* just inside the plinth apron's own lip, so the deck meets stone */
  var tipZ = rootZ - LEN;
  /* ---- the trestle */
  BOX(rootX, DECKY, (rootZ+tipZ)*0.5, W, TH, LEN*1.02, 0, WOOD, 'wood');
  for(var k=8; k<LEN; k+=12){
    for(var sg=-1; sg<=1; sg+=2){
      var px = rootX + sg*(W*0.5-1.2), pz = rootZ - k;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, PR, DECKY+TH-bh, 0, PILE, 'wood');
    }
  }
  /* rails down the trestle only — the head stays clear for handling lines */
  for(var sg2=-1; sg2<=1; sg2+=2){
    BOX(rootX + sg2*(W*0.5-0.5), DECKY+TH, (rootZ+tipZ)*0.5 + 4, 0.5, 1.2, LEN-10, 0, TRIM, 'wood');
  }
  /* ---- the berthing head, laid across the trestle's tip */
  BOX(rootX, DECKY, tipZ, HEADL, TH, HEADD, 0, WOOD, 'wood');
  for(var hx=-1; hx<=1; hx+=1){
    for(var hz=-1; hz<=1; hz+=2){
      var qx = rootX + hx*(HEADL*0.5-2.0), qz = tipZ + hz*(HEADD*0.5-1.6);
      var bh2 = bedAt(qx,qz);
      CYL(qx, bh2, qz, PR, DECKY+TH-bh2, 0, PILE, 'wood');
    }
  }
  /* bollards along the outboard face, and a fender rubbing strake */
  for(var b=-2; b<=2; b++){
    CYL(rootX + b*10.0, DECKY+TH, tipZ - HEADD*0.5 + 1.0, 0.75, 1.7, 0, PILE, 'wood');
  }
  BOX(rootX, DECKY+TH-0.9, tipZ - HEADD*0.5 - 0.3, HEADL, 0.8, 0.8, 0, TRIM, 'wood');
  /* the harbour-watch store at the head's west end, and a signal mast
     flying the order's green over the berth */
  var hutX = rootX - HEADL*0.5 + 6.0;
  BOX(hutX, DECKY+TH, tipZ + 1.0, 9.0, 4.6, 6.4, 0, TRIM, 'wood');
  /* ROOFS[1], not pick(ROOFS): a rnd() here would advance this fragment's
     shared PRNG stream and move every placement generated after it in
     65-facade.js and in every later fragment. Nothing in this whole block
     draws from the stream, by design. */
  FR8(hutX, DECKY+TH+4.6, tipZ + 1.0, 10.2, 1.5, 7.4, 0, ROOFS[1 % ROOFS.length], 'roof');
  var mastX = rootX + HEADL*0.5 - 5.0;
  CYL(mastX, DECKY+TH, tipZ + 1.0, 0.45, 15.0, 0, PILE, 'wood');
  BOX(mastX + 0.6, DECKY+TH+9.0, tipZ + 1.0, 0.3, 4.2, 5.0, 0, GREEN, 'cloth');
  /* ---- a short flight up to the canton's own plinth apron (its surface is
     at 6.0, the deck at SEA+3.55 — a 2.5-unit step this closes in three) */
  for(var s=0;s<3;s++){
    BOX(rootX, DECKY+TH + s*0.82, rootZ + 1.2 + s*1.5, W*0.62, 0.82, 1.6, 0, WOOD, 'wood');
  }
  /* ---- registrations. LIFE_EXTRA_PIERS is what makes every existing boat
     route around this deck (lifeNavBlocked/lifePierOrBridgeBlocked,
     78-life.js) — the same registration the ferry piers and the fisherman's
     docks make, two segments because the dock is a T. */
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: rootX, z1: tipZ, w: W });
  LIFE_EXTRA_PIERS.push({ x0: rootX - HEADL*0.5, z0: tipZ, x1: rootX + HEADL*0.5, z1: tipZ, w: HEADD });
  inspectClaim(rootX, (rootZ+tipZ)*0.5, W*0.5, LEN*0.5, 0, 'dock', 'Coast-guard dock');
  inspectClaim(rootX, tipZ, HEADL*0.5, HEADD*0.5, 0, 'dock', 'Coast-guard berth');
  /* the mooring points themselves: a patrol hull lies alongside the head's
     outboard (north) face bow-east, with a second berth off its west end.
     len/beam are the hull envelope each berth was sized for — between a
     fishing dhow (16.2 x 8.1) and a harbour merchantman (50-68 x 12-16). */
  LIFE_CGUARD_BERTHS.push({ x: rootX, z: tipZ - HEADD*0.5 - 6.5, ry: Math.PI*0.5, len: 44, beam: 11, face:'north' });
  LIFE_CGUARD_BERTHS.push({ x: rootX - HEADL*0.5 - 6.5, z: tipZ, ry: 0, len: 36, beam: 10, face:'west' });
  LIFE_CGUARD_DOCK = { rootX:rootX, rootZ:rootZ, tipX:rootX, tipZ:tipZ, deckY: DECKY+TH,
                       w: W, headHalf: HEADL*0.5, headDepth: HEADD };
  window._cguardDock = { dock: LIFE_CGUARD_DOCK, berths: LIFE_CGUARD_BERTHS };   /* diagnostic */
})();

/* threads a staircase down the OUTSIDE face of the real, individual tiers
   platCanton() built (reconstructed here the same way gardenDeck() does,
   with tierWeights()/the 5-unit plinth constant it also relies on) instead
   of one straight run at a fixed outer radius. Each flight sits at its own
   tier's true half-width and only spans that tier's own height; a short
   landing bridges the outward jog to the next (wider) tier down, so the
   whole run visibly lands on every step instead of floating past all of
   them outside the silhouette. Combo: box|stone(default), only what
   seaStair() itself already uses. */
function threadedPortStair(c, y, hw, qy, ex, ez, ry){
  var PLINTH = 5, W = tierWeights(c.tiers), rem = c.top - PLINTH;
  var tY0=[], tY1=[], tHw=[], yy=PLINTH, hh=c.r*0.97;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    tY0[i]=yy; tY1[i]=yy+th; tHw[i]=hh;
    yy += th+0.12; hh *= 0.86;
  }
  for(var t=c.tiers-1; t>=0; t--){
    var topY = (t===c.tiers-1) ? y : tY1[t];      /* topmost flight uses the exact (y,hw) portDeckV2 was called with */
    var rHw  = (t===c.tiers-1) ? hw : tHw[t];
    var botY = tY0[t];
    seaStair(c.x+ex*rHw, c.z+ez*rHw, ry, 16, topY, botY);
    if(t>0){
      var rNext = tHw[t-1];
      var mx = c.x+ex*(rHw+rNext)*0.5, mz = c.z+ez*(rHw+rNext)*0.5;
      BOX(mx, botY-0.3, mz, Math.abs(rNext-rHw)+16, 1.0, 16, ry, 0xa79b82);   /* landing bridging the outward jog */
    }
  }
  seaStair(c.x+ex*tHw[0], c.z+ez*tHw[0], ry, 16, tY0[0], qy);   /* final flight, tier 0's own base down to the quay */
}

/* the harbour canton, reworked: (a) stairs now thread the real tiers via
   threadedPortStair() instead of one misaligned straight run; (b) the top
   platform's warehouse grid goes from a sparse 3x4/12%-skip to a packed
   5x7/5%-skip, and the quay level gets a third, smaller shed slotted
   between the existing pair on every qualifying face; (c) a customs house
   marks the shore-side approach — the one face piers/warehouses skip,
   which is exactly where cargo/carts would actually check in. Everything
   not called out above (sheds/cargo loop shape, harbourmaster's tower, the
   pier+crane loop) is unchanged from portDeck(). */
function portDeckV2(c, y, hw, qy, qhw){
  var lp = shoreIn(c.s, 26), sl = Math.hypot(lp[0]-c.x, lp[1]-c.z);
  var sdx = (lp[0]-c.x)/sl, sdz = (lp[1]-c.z)/sl;
  /* Navigator's Guild hall centre, computed up front (before the warehouse
     grid below) so that grid can carve out its own clearance the same way
     it already does for the lighthouse — see navClear below and this
     hall's own construction further down this function. */
  var navHX = c.x + sdx*hw*0.33, navHZ = c.z + sdz*hw*0.33;
  for(var f0=0; f0<4; f0++){
    var a0 = f0*Math.PI/2, ex = Math.cos(a0), ez = Math.sin(a0);
    if(ex*sdx + ez*sdz > 0.5) continue;
    for(var q=-1; q<=1; q++){
      var scale = (q===0) ? 0.60 : 1.0;
      var sx = c.x + ex*(qhw-14) + (-ez)*q*qhw*0.55, sz = c.z + ez*(qhw-14) + (ex)*q*qhw*0.55;
      shed(sx, qy, sz, 24*scale, 12*scale, rr(6,9)*(q===0?0.9:1), -a0+Math.PI/2, pick(TONES_POOR));
    }
    for(var g=0; g<6; g++){
      var gx = c.x + ex*(qhw-rr(6,28)) + (-ez)*rr(-qhw*0.9,qhw*0.9), gz = c.z + ez*(qhw-rr(6,28)) + (ex)*rr(-qhw*0.9,qhw*0.9);
      BOX(gx, qy, gz, rr(2.2,4), rr(2,3.6), rr(2.2,4), rnd()*3, pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
    }
    threadedPortStair(c, y, hw, qy, ex, ez, -a0+Math.PI);
  }
  /* the lighthouse, relocated here per the owner's redesignation — the
     old standalone Lighthouse canton becomes the Fortress canton
     (ordinatorFortress) instead, and the actual lighthouse tower moves
     to the centre of the harbour it was always meant to watch over.
     Replaces the old off-centre harbourmaster's tower (a smaller stand-in
     for the same role) rather than sitting alongside it. Same tower
     geometry lighthouseDeck() (50-cantons.js) builds, scaled off this
     canton's own hw instead of a dedicated canton's. */
  var lbR = hw*0.15, lmR = hw*0.08, ltR = 6.5, lh = hw*0.95;
  inspectClaim(c.x, c.z, lbR, lbR, 0, 'lighthouse', 'Lighthouse');
  FR6(c.x, y, c.z, lbR*2, lh*0.62, lbR*2, 0, shade(c.tone,0.03));
  FR3(c.x, y+lh*0.62, c.z, lmR*2, lh*0.38, lmR*2, 0, shade(c.tone,0.06));
  BOX(c.x, y+lh-1.2, c.z, ltR*2.6, 2.2, ltR*2.6, Math.PI/4, shade(c.tone,-0.14));
  CYL(c.x, y+lh, c.z, ltR, 10, 0, shade(c.accent,0.10));
  DOME(c.x, y+lh+10, c.z, ltR*0.86, ltR*0.72, 0, c.accent, 'dome');
  CONE(c.x, y+lh+10+ltR*0.72, c.z, 1.6, 6, 0, shade(c.accent,-0.2));
  for(var ls=0; ls<4; ls++){
    var lsa = ls*Math.PI/2 + Math.PI/4;
    CYL(c.x+Math.cos(lsa)*ltR*1.25, y+lh+0.4, c.z+Math.sin(lsa)*ltR*1.25, 0.45, 6.2, 0, shade(c.tone,-0.10));
  }
  /* dense warehouse packing around it: ~2:1 length:width per the owner's
     spec, tiled edge-to-edge with only a cart's-width gap (set below)
     between neighbours and at the platform's own rim — "do not be afraid
     of filling up the cantons... as long as there is a cart's width of
     space along the outer edge". Cleared of the lighthouse's own
     footprint (lbR, the widest tier of it) by skipping any cell whose
     centre falls within lbR*1.7 of centre — generous enough that a
     shed's own half-length never clips the tower even at the closest
     ring. */
  var cart = 5.5;
  var whW = hw*0.19, whL = whW*2.05;
  var stepX = whW + cart, stepZ = whL + cart;
  var lightClear = lbR*1.7 + whL*0.5;
  /* FOURTH PASS: the same per-cell clearance trick, reused for the new
     Navigator's Guild hall (navHX/navHZ, computed at the top of this
     function) instead of a second special-cased exclusion shape — a
     warehouse CELL CENTRE within this radius of the hall is skipped, and
     since the radius already includes the warehouse's own half-length
     (whL*0.5, same margin the lighthouse clearance uses), no warehouse's
     own edge can reach the hall either, even one just outside the ring. */
  var navClear = hw*0.11 + whL*0.5 + cart;   /* hw*0.11 ~= the hall's own half-diagonal (w=hw*0.17,d=hw*0.14 below) */
  for(var wx = -hw+cart+whW*0.5; wx <= hw-cart-whW*0.5; wx += stepX){
    for(var wz = -hw+cart+whL*0.5; wz <= hw-cart-whL*0.5; wz += stepZ){
      if(Math.hypot(wx,wz) < lightClear) continue;
      if(Math.hypot(c.x+wx-navHX, c.z+wz-navHZ) < navClear) continue;
      if(chance(0.04)) continue;
      inspectClaim(c.x+wx, c.z+wz, whW*0.46, whL*0.46, 0, 'warehouse', 'Port warehouse');
      shed(c.x+wx, y, c.z+wz, whW*0.92, whL*0.92, rr(9,14), 0, pick(TONES_POOR));
    }
  }
  for(var f=0; f<4; f++){
    var a = f*Math.PI/2;
    if(Math.cos(a)*sdx + Math.sin(a)*sdz > 0.5) continue;
    for(var i=0;i<3;i++){
      var off = (i-1)*hw*0.52;
      var dir = [Math.cos(a), Math.sin(a)];
      var base = [c.x + dir[0]*qhw + (-dir[1])*off, c.z + dir[1]*qhw + dir[0]*off];
      var len = rr(70,120);
      for(var j=0;j<Math.round(len/15);j++){
        var xx = base[0] + dir[0]*(j+0.5)*15, zz = base[1] + dir[1]*(j+0.5)*15;
        BOX(xx, qy-0.6, zz, 13, 1.7, 15*1.06, -a+Math.PI/2, 0x8a7659, 'wood');
        [-1,1].forEach(function(sg){
          var q2 = [xx - dir[1]*sg*5.5, zz + dir[0]*sg*5.5];
          CYL(q2[0], bedAt(q2[0],q2[1]), q2[1], 1.0, qy-0.6-bedAt(q2[0],q2[1]), 0, 0x6b5942, 'wood');
        });
      }
      if(i===1){
        CYL(base[0], qy, base[1], 1.4, 16, 0, 0x5b4b38, 'wood');
        BOX(base[0]+dir[0]*7, qy+14.5, base[1]+dir[1]*7, 2, 1.6, 16, -a+Math.PI/2, 0x5b4b38, 'wood');
        /* the crane pier's own outer reach used to berth a static
           tallShip() prop here — removed per the owner's own request
           (a European-galleon silhouette "doesn't fit dark elves"; the
           replacement junk-style vessel lives entirely in the life
           layer now, src/78-life.js, both the ones that sail and the
           ones that just sit — see LIFE_SHIPS' `stationary` ships).
           The crane itself (CYL/BOX above) still stands; the berth
           space is just open water now, same as any other unclaimed
           stretch of quay. */
      }
      else if(chance(0.8)){
        /* a moored ferry alongside the plank run — the center (i===1)
           pier stays clear for the crane's own berth above, the other
           two get everyday cargo traffic. The occasional tallShip()
           here was removed for the same reason as the crane berth
           above — junks are a life-layer model now, not a static prop. */
        var st = rr(0.42, 0.82), sside = chance(0.5) ? 1 : -1;
        var sx = base[0] + dir[0]*len*st + (-dir[1])*sside*19;
        var sz = base[1] + dir[1]*len*st + ( dir[0])*sside*19;
        var shipRy = Math.atan2(dir[0], dir[1]);
        ferry(sx, SEA-0.2, sz, shipRy, pick([0x5e4d3a,0x6b5942,0x4f4030,0x6a5842]),
              { len:rr(20,34), beam:rr(7.5,10.5), cargo: ri(1,3) });
        window._portShips = window._portShips || [];
        window._portShips.push([Math.round(sx),Math.round(sz)]);
      }
    }
  }
  /* the customs house, facing the shore approach — the one face the loop
     above always skips, so it is the natural checkpoint spot */
  var chRy = Math.atan2(-sdz, sdx);
  var chp = loc(c.x, c.z, hw*0.86, 0, Math.atan2(sdx,sdz));
  customsHouse(chp[0], y, chp[1], chRy, hw*0.34, hw*0.22, shade(c.tone,0.08));

  /* ---- Navigator's Guild (owner: "Navigator's guild will go on the
     harbor canton" — this canton is actually named 'Port' in CANTONS,
     30-layout.js; there is no separate 'Harbor' canton, checked directly
     before writing anything here). Sits just past the lighthouse's own
     lightClear carve-out, on the shore-approach side (same sdx/sdz
     direction the customs house uses, just much closer in than that
     building's own hw*0.86). The warehouse GRID's per-cell exclusion
     only guarantees a cell CENTRE stays clear of the lighthouse — a
     warehouse just outside that ring could still reach in with its own
     half-length, which is exactly what a first pass here clipped into
     (caught by screenshot). Fixed at the grid loop above (navHX/navHZ +
     navClear, computed before that loop runs) instead of here, the same
     per-cell exclusion trick the lighthouse already uses, so this hall
     can never be clipped by a warehouse regardless of its own size below.
     Styled like this canton's own sheds/customs house (TONES_POOR,
     wood-heavy) rather than the Guild canton's ashlar-stone idiom, per
     the owner's own "match the harbor's idiom" instruction. box|wood,
     cyl|wood, box|stone(default), box|metal — all already-spent buckets,
     zero new draw calls. ---- */
  (function(){
    var hx = navHX, hz = navHZ;
    var ry = faceToward(hx, hz, c.x, c.z);
    var w = hw*0.17, d = hw*0.14, h = hw*0.17;
    var col = pick(TONES_POOR);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the mast/compass/chart table
       which all sit out past fx0 nearer the front corner). See
       guildHallWindows3()'s own header just above addWindows() above. */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* a small mast + rigging beside the door — a real ship's mast
       re-purposed as the guild's own signal post */
    var mp = loc(hx, hz, w*0.5+3.4, -d*0.30, ry);
    var mastH = h*1.15;
    CYL(mp[0], y, mp[1], 0.30, mastH, 0, shade(TRUNKC[0],-0.1), 'wood');
    CYL(mp[0], y+mastH*0.55, mp[1], 1.6, 0.14, 0, shade(TRUNKC[0],-0.2), 'wood');   /* yardarm-ish disc */
    [-1,1].forEach(function(s){
      var rp = loc(mp[0], mp[1], s*2.4, s*1.6, 0);
      BOX((mp[0]+rp[0])/2, y+mastH*0.72, (mp[1]+rp[1])/2, 0.10, mastH*0.62, 0.10,
          Math.atan2(rp[0]-mp[0], rp[1]-mp[1]), shade(TRUNKC[0],0.05), 'wood');
    });
    /* a compass rose, set into the ground out front — a flat stone disc
       with 8 dark metal spoke points */
    var crp = loc(hx, hz, w*0.5+2.0, d*0.40, ry);
    CYL(crp[0], y+0.05, crp[1], 2.0, 0.10, 0, pick(STALKC));
    for(var pi=0; pi<8; pi++){
      var pa = pi*(Math.PI*2/8);
      var pr = loc(crp[0], crp[1], Math.cos(pa)*1.0, Math.sin(pa)*1.0, 0);
      BOX(pr[0], y+0.16, pr[1], 0.16, 0.10, 1.6, -pa, shade(ROOFS[5],-0.15), 'metal');
    }
    /* a chart table under the eave, opposite the mast */
    var ctp = loc(hx, hz, w*0.5+2.2, -d*0.42, ry);
    BOX(ctp[0], y, ctp[1], 2.4, 1.0, 1.6, ry, shade(TRUNKC[0],-0.1), 'wood');
    BOX(ctp[0], y+1.0, ctp[1], 2.0, 0.06, 1.3, ry, shade(PAL.sail[0],-0.04), 'cloth');
    var navDoor = loc(hx,hz,w*0.5+1.2,0,ry);
    GUILD_HALL_DOORS.push({ x:navDoor[0], z:navDoor[1], ry:ry, canton:'Port', name:'Navigator' });
    /* inspector footprint, same registry the Guild canton's own ten halls
       use (inspectClaim(), 86-inspect.js) — so this one reports "Navigator's
       guild hall" too rather than "Port canton". */
    inspectClaim(hx, hz, w*0.5, d*0.5, ry, 'guildhall', "Navigator's guild hall");
  })();
}

/* ---- addDoor(x, y, z, ry, w, d, h, col) ---------------------------------
   A door only, for buildings built by calling structure() directly instead
   of through townBuilding()/compound() — platCanton()'s generic courtyard
   lots and arenaDeckSquare()'s own rim buildings (below) both do this, so
   they never pass through townFacade() above and end up with blank walls.
   Mirrors townFacade()'s own door block (same box|wood sizing/inset logic,
   zero new draw calls) but is parameterised directly on structure()'s own
   call signature — (x, yb, z, w, d, h, ry, col) — so it drops in right
   after a structure() call using the exact same locals, no PLACED record
   needed. w/d are FULL extents, structure()'s own convention (townFacade
   works off PLACED's fx0/fz0 half-extents instead); halved here to match.
   Door sits centred on the local +x face — structure()'s own front, per
   the same ry/loc()/faceStreet() convention used everywhere else.

   IMPORTANT: arenaDeckSquare() calls this from inside platCanton(), which
   runs during 50-cantons.js's OWN turn — before this fragment's top-level
   code (reseed, FJ init, FACADE block) has executed. So this function must
   not read or write FJ/FACADE or anything else this fragment initialises
   at its own top level; it only touches `window`, which exists regardless
   of fragment execution order. */
function addDoor(x, y, z, ry, w, d, h, col){
  var fx0 = w*0.5, fz0 = d*0.5;
  var doorCol = col ? shade(col, rr(-0.42,-0.34)) : shade(pick(ROOFS), rr(-0.06,0.06));
  var dw = Math.min(rr(1.6,2.2), fz0*0.9);
  var dh = Math.min(rr(2.8,3.6), h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  window._facadeExtraDoors = (window._facadeExtraDoors||0) + 1;
}

/* ---- addWindows(x, y, z, ry, w, d, h, col, doorHalfW) -------------------
   A window-only sibling to addDoor(), for the exact same structure()-direct
   call sites — platCanton()'s generic courtyard lots and arenaDeckSquare()'s
   rim buildings — which today call addDoor() and nothing else, so every one
   of them reads as a blank-walled box apart from its door. This is the
   round-2 "canton buildings, in general, could use more windows" fix for
   that half of the brief (the other half was tuning townFacade()'s own
   FACADE.win* chances up, see the tuning block above).

   Reuses wallWindow() (this file's own helper, already used throughout
   townFacade()) rather than inventing new placement math: 1 guaranteed
   front window flanking the door, a fair chance of a second on the door's
   other side, and — on deep-enough buildings — a chance of one more round
   the side wall. Same box|stone(default) combo wallWindow() already
   spends, so this is zero new draw calls. Call right after addDoor() using
   the same locals; doorHalfW is half the door width addDoor() itself just
   picked (addDoor() doesn't return it, so callers pass their own dw*0.5 —
   see structure()'s call sites for the exact value used there — this just
   needs SOME reasonable clearance figure, not the door's true rendered
   width, since wallWindow() already keeps a margin past it).

   w/d are FULL extents (structure()'s own convention, halved here to match
   wallWindow()'s half-extent signature) — same as addDoor().

   IMPORTANT: same execution-order caveat as addDoor() — arenaDeckSquare()
   and platCanton() call this from inside 50-cantons.js's OWN top-level
   CANTONS.forEach(), which runs before this fragment's top-level code
   (reseed, FJ init, the FACADE tuning block) has executed. So — like
   addDoor() — this must not read FJ or FACADE, only call wallWindow()
   (itself safe: every value it needs is passed as an argument) and touch
   `window`, which exists regardless of fragment execution order. */
function addWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;
  var s0 = chance(0.5) ? 1 : -1;
  if(wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, s0, 0.9,1.4, 1.0,1.6)) n++;
  if(chance(0.60) && wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, -s0, 0.9,1.4, 1.0,1.6)) n++;
  if(fx0 > 7 && chance(0.45)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.25,0.25)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(0.9,1.3), fx0*0.45), rr(1.0,1.5), 0.4, ry, winCol);
    n++;
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ---- guildHallWindows3 ----------------------------------------------------
   Owner ask: "make sure all of [the top-of-canton buildings] have an
   APPROPRIATE number of windows, at least 3 per floor." addWindows() above
   is chance()-gated (a fair-coin second front window, a 45% side window) —
   worst case it places just 1, which does not reliably clear that bar. This
   is the guaranteed alternative for the 5 new single-storey guild halls
   (Carpenter/Merchant/Weaver/Artificer in 50-cantons.js's guildHallsDeck(),
   Navigator in this file's portDeckV2()): unconditional, not chance()-gated,
   sized by formula so it mathematically cannot fail to fit — same idiom
   townFacade()'s own poor-plaster guarantee uses above (2 flanking the
   door on the front face) — plus a 3rd window on a SIDE wall so the count
   doesn't just double up the same face. Replaces the addWindows() call at
   each of those 5 sites outright (not stacked on top of it) so there is no
   chance of a random addWindows() pick landing on the same stretch of wall
   as one of these three and clipping through it.

   sideSign (-1|1) / sideFxFrac (0..1, 0=door-corner end of the wall, 1=back
   corner) are caller-picked per hall so the 3rd window can be steered clear
   of that hall's own front-of-door decorations (lumber rack, ledger table,
   loom, workbench, mast, etc — every one of which sits out past fx0 on the
   front face, never flush on a side wall, but still worth aiming the 3rd
   window at the back half of the side wall on general principle). Same
   box|stone(default) bucket wallWindow()/addWindows() already spend —
   zero new draw calls. w/d/h are FULL extents (structure()'s convention),
   same as addWindows()'s own signature. */
function guildHallWindows3(x, y, z, ry, w, d, h, col, doorHalfW, sideSign, sideFxFrac){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;
  /* 2 on the front face, flanking the door — sized off the space actually
     left past doorHalfW so they mathematically cannot fail to fit */
  var avail = Math.max(0.6, fz0 - doorHalfW);
  var fww = Math.min(1.3, avail*0.5);
  var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
  [-1,1].forEach(function(s){
    var fp = loc(x,z, fx0+0.05, s*flat, ry);
    WINBOX(fp[0], winY, fp[1], 0.4, rr(1.0,1.5), fww, ry, winCol);
    n++;
  });
  /* 1 more on a side wall, at a caller-steered offset along its length */
  var sww = Math.min(1.1, fz0*0.5);
  var margin = sww*0.5 + 0.6;
  var slat = mix(-fx0+margin, fx0-margin, sideFxFrac);
  var sp = loc(x,z, slat, sideSign*(fz0+0.05), ry);
  WINBOX(sp[0], winY, sp[1], sww, rr(1.0,1.5), 0.4, ry, winCol);
  n++;
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ---- cantonHallWindows ----------------------------------------------------
   Owner: "make sure the recently placed great hall buildings have an
   appropriate number of windows [at least 3 per floor]." platCanton()'s own
   great hall (idx===0 on every discrete-lot canton — Arsenal, Foreign,
   Granary, Market) is a single tall box (structure()'s 'domed' kind, h
   44-60, no intermediate cornice lines) that used to call the same
   addWindows() every ordinary canton building gets — chance()-gated, worst
   case exactly one window (see guildHallWindows3's own note above, which
   fixed the identical problem for the guild canton's halls). A hall this
   tall reads as several real storeys even though structure() draws it as
   one plain box, so "at least 3 per floor" means a guaranteed band
   repeated up the height, not one guaranteed row.

   floors is a window-spacing convenience only (this hall has no real
   cornice lines to key off) — ~13 units/floor, the same spacing
   structure()'s own hlaalu kind uses for its real stacked storeys, so the
   bands read as a plausible storey height. Ground floor keeps clear of the
   door (guildHallWindows3's own sized-to-fit flanking formula, so it
   mathematically cannot fail); floors above it have no door to dodge, so
   they get a fuller spread across the front face plus one on each side —
   a hall this size wants more than the bare minimum, and it stands alone
   on the deck so every approach should read as glazed, not just the front.
   Same box|stone(default) bucket every other window in the city already
   spends via WINBOX — zero new draw calls. w/d/h are FULL extents,
   doorHalfW half the door's actual width — structure()'s own convention,
   matching addWindows()/guildHallWindows3(). */
function cantonHallWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var floors = Math.max(3, Math.round(h/13));
  var floorH = h/floors;
  var n = 0;
  for(var fl=0; fl<floors; fl++){
    var winY = y + fl*floorH + Math.min(floorH*0.42, rr(2.0,3.2));
    var winH = Math.min(1.5, floorH*0.5);
    if(fl === 0){
      /* 2 flanking the door, sized off the space actually left past
         doorHalfW — same formula guildHallWindows3 uses, so it cannot fail
         to fit — plus a 3rd on a side wall so the ground floor alone
         already clears "at least 3". */
      var avail = Math.max(0.6, fz0 - doorHalfW);
      var fww = Math.min(1.3, avail*0.5);
      var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
      [-1,1].forEach(function(s){
        var fp = loc(x,z, fx0+0.05, s*flat, ry);
        WINBOX(fp[0], winY, fp[1], 0.4, winH, fww, ry, winCol);
        n++;
      });
      var sww0 = Math.min(1.1, fz0*0.5);
      var sp0 = loc(x,z, 0, -(fz0+0.05), ry);
      WINBOX(sp0[0], winY, sp0[1], sww0, winH, 0.4, ry, winCol);
      n++;
    }else{
      /* upper floors: 3 evenly spread across the front face (no door to
         clear) plus one on each side wall, alternating which half per
         floor so the glazing doesn't stack in a single vertical column. */
      var fww2 = Math.min(1.2, fx0*0.25);
      [-1,0,1].forEach(function(t){
        var fp2 = loc(x,z, fx0+0.05, t*fz0*0.55, ry);
        WINBOX(fp2[0], winY, fp2[1], 0.4, winH, fww2, ry, winCol);
        n++;
      });
      var sww = Math.min(1.0, fz0*0.42);
      [-1,1].forEach(function(sgn){
        var sp = loc(x,z, (fl%2?1:-1)*fx0*0.3, sgn*(fz0+0.05), ry);
        WINBOX(sp[0], winY, sp[1], sww, winH, 0.4, ry, winCol);
        n++;
      });
    }
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* a square arena bowl in place of the oval ring: four straight raked
   seating banks, mitred at the corners (each bank spans the ring's own
   OUTER dimension so opposite pairs meet exactly, no gap/no overlap logic
   needed), each successive ring's outer edge picking up exactly where the
   ring below's inner edge left off so the tiers nest with no gap. Combos:
   box|stone(default) for the field/banks, plus whatever structure() itself
   already uses (box/fr8/fr6/cyl/dome/cone × stone/dome/roof) for the rim
   buildings — all pre-existing, structure() is the core building function
   used everywhere else in the build.

   2nd pass, fixing two real bugs the owner caught by eye (not the shape
   itself, which was already square and correct):
   (a) height was tied to the loop index the WRONG way — `yy = y +
       i*stepH*0.55` with i=0 at the OUTER (largest halfW/halfD) ring meant
       the outer ring sat lowest and the inner ring (closest to the field)
       sat highest: a stepped MOUND rising toward the centre, not a bowl.
       Fixed by indexing off (steps-1-i) instead, so the outer rim is now
       the tall one and the innermost ring lands exactly at field height y.
   (b) fieldW/fieldD (1.15hw / 0.86hw) were bigger than the bowl's own
       OUTER half-extents (0.95hw / 0.72hw) — the field floor overflowed
       past the seating and past the platform edge itself. Fixed by sizing
       the field off the innermost ring's actual extent instead of an
       independent (and wrong) constant, and by pulling the bowl's own
       outer extent in from 0.95/0.72 to 0.72/0.56 so there is real,
       verified clearance out to hw for the rim buildings — the old
       0.90hw building row was INSIDE the old 0.95hw outer bowl edge on
       the east/west sides, i.e. clipping straight through the seating,
       which is the other half of what the owner saw. */
function arenaDeckSquare(c, y, hw){
  /* 4th pass, per the owner's follow-up: the 3rd pass's bowl read flat
     (only 2 steps, each just 4.4*0.55=2.4 tall, on a canton hundreds of
     units across — invisible from any normal viewing distance) and its
     outerHalf (0.975hw) sat right on top of hw, the exact radius
     landing()/stairs approach at — the rim was clipping the bridge
     stairs. Fix: pull outerHalf in to leave real clearance for the
     stairs, then re-derive the field from THAT (not the raw platform
     hw) so it still reads as "about 80% of the upper tier" while
     actually fitting inside outerHalf with room for banking; and scale
     the bowl's total rise off hw (steps*stepH) instead of a fixed
     constant, across more steps, so the "inverted pyramid" terracing is
     visible at any canton size. */
  var outerHalf = hw * 0.84;
  var fieldHalf = outerHalf * Math.sqrt(0.8);
  var steps = 4;
  var totalRise = Math.max(16, hw*0.11);
  var stepH = totalRise/steps, bank = (outerHalf - fieldHalf) / steps;
  var halfW = outerHalf, halfD = outerHalf;
  for(var i=0;i<steps;i++){
    var yy = y + (steps-1-i)*stepH;
    var col = shade(c.tone, i%2 ? 0.03 : -0.05);
    var ow = halfW*2, od = halfD*2;
    BOX(c.x, yy, c.z - halfD + bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x, yy, c.z + halfD - bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x - halfW + bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    BOX(c.x + halfW - bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    halfW -= bank; halfD -= bank;
  }
  inspectClaim(c.x, c.z, outerHalf, outerHalf, 0, 'arena', 'Arena terracing');
  inspectClaim(c.x, c.z, fieldHalf, fieldHalf, 0, 'arenafloor', 'Arena floor');
  BOX(c.x, y-0.4, c.z, fieldHalf*2, 0.5, fieldHalf*2, 0, 0x9a8f74);

  /* pillars: one ring just inside the rim's own outer edge (tracks
     outerHalf now, not hw, so they stay attached to the built bowl
     instead of floating out past it into the stair-clearance margin).
     Combo: cyl|stone(default) — already live everywhere. */
  var pillarFixed = outerHalf*0.99, pillarSpan = outerHalf*0.90, pillarR = hw*0.022;
  var pillarH = totalRise + 15;
  var perSide = 5;
  function alongSide(k){ return ((k+0.5)/perSide - 0.5) * pillarSpan * 2; }
  var pillarPos = { ns:[], ew:[] };
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide;k++) pillarPos.ns.push([c.x + alongSide(k), c.z + sz*pillarFixed, sz]);
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide;k++) pillarPos.ew.push([c.x + sx*pillarFixed, c.z + alongSide(k), sx]);
  });
  pillarPos.ns.concat(pillarPos.ew).forEach(function(p){
    CYL(p[0], y, p[1], pillarR, pillarH, 0, shade(c.tone,-0.12));
    BOX(p[0], y+pillarH, p[1], pillarR*2.6, 1.2, pillarR*2.6, 0, shade(c.tone,-0.22));  /* capital */
  });
  /* a banner hanging in each gap between adjacent pillars on the same
     side, from up near the pillar tops. */
  function hangBanner(ax,az, bx,bz){
    var mx=(ax+bx)/2, mz=(az+bz)/2, dh = pillarH*0.62;
    BOX(mx, y+pillarH*0.88-dh, mz, 0.14, dh, 3.4, Math.atan2(bx-ax,bz-az), pick(BANNERC), 'cloth');
  }
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+alongSide(k), c.z+sz*pillarFixed, c.x+alongSide(k+1), c.z+sz*pillarFixed);
    }
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+sx*pillarFixed, c.z+alongSide(k), c.x+sx*pillarFixed, c.z+alongSide(k+1));
    }
  });

  /* one ferry pier + matching ground-floor door at the bottom tier, per
     the owner's canton-design notes — same mechanism as monoCanton()'s. */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, 5.5, squareEdgeHw(c.r*0.97, ferryPier.ry), c.tone);
  }

  /* ---- ARENA GLADIATOR COMBAT SYSTEM, built half ------------------------
     Spectator benches, the barred pit entrance and the VIP box on top of
     it: arenaCombatDeck(), at the foot of this file. Called from HERE
     rather than from a top-level statement so it lands in the arena's own
     local frame with the exact y/outerHalf/fieldHalf/steps/stepH/bank this
     function just derived — re-deriving them at file scope would silently
     drift the moment anyone retunes the bowl again (which has already
     happened four times, see this function's own header). pillarPos/
     pillarR are handed over for the same reason: the bench rings share
     the terrace with the existing colonnade, and the only honest way to
     keep benches out of a pillar is to test against the real pillar list
     instead of re-deriving perSide/pillarSpan from constants that live
     here. Nothing about the bowl itself is modified. */
  arenaCombatDeck(c, y, outerHalf, fieldHalf, steps, stepH, bank, pillarPos, pillarR);
}

/* ============================== unplaced showcase models ===================
   Four standalone, parameterised (x, y, z, ry, col, opt) models, per the
   owner's request relayed by the planner. NOT called/dispatched anywhere in
   this fragment — the owner will hand each one coordinates later. Same
   convention every reusable prop in this file already follows: `y` is the
   base/ground reference, `col` may be left falsy for a sensible internal
   default, `opt` carries size/tuning overrides. No rnd()/BUCKET traffic
   happens until a future placement pass actually calls one of these.

   Existing families only: stone (default), wood, metal, dome, leaf — no new
   draw-call bucket.

   PALETTE GAP — checked PAL.stone/dome/banner/bloom/grey/jade: nothing in
   the palette reads as basalt (a near-black volcanic stone) or lapis (a
   deep saturated blue accent), and both are asked for by name in the brief.
   Rather than invent a local colour (banned — colours live in 05-palette.js
   only), every function below that needs one takes it as `col`/`opt.xCol`
   with a fallback built from the closest thing that already exists,
   PAL.stone.grey (GREYC) — the only cool-toned stone in the palette — via
   shade(). Flagged here once rather than repeated at every call site:
     PAL.stone.basalt : near-black cool stone, e.g. [0x2b2a28,0x322f2b,0x242220]
     PAL.stone.lapis  : deep blue accent,       e.g. [0x1f3f6e,0x2a4d80,0x17335c]
   Swap the `shade(pick(GREYC), ...)` placeholders below for the real PAL
   entries once the planner adds them; nothing else in these functions needs
   to change. */

/* ---- shared micro-helpers for the four models below -----------------------
   The kit only ever rotates an instance about Y (45-kit.js's emitBuckets),
   so a diagonal line has to be faked out of vertical/flat primitives — the
   same trick weepingWillow/mangrove/archingBladder already use (an
   outward-and-down cascade of short segments). Reused here for anchor
   flukes, a rope swag, and — face-on rather than edge-on — a coiled-rope
   roundel. */

/* a short outward-and-down stepped cascade of thin vertical posts, mounted
   flush (or slightly proud, via depthOut) against a wall face. */
function reliefLimb(x,z,ry, depthOut, y0, lateralSign, steps, outStep, dropStep, r, col, fam){
  var lastD=0, lastY=y0;
  for(var i=0;i<steps;i++){
    var nd = lateralSign*(i+1)*outStep, ny = y0 - (i+1)*dropStep;
    var midD = (lastD+nd)/2, midY = Math.min(lastY,ny);
    var p = loc(x,z, depthOut, midD, ry);
    CYL(p[0], midY, p[1], r, Math.abs(ny-lastY)+0.10, 0, col, fam||'metal');
    lastD=nd; lastY=ny;
  }
}
/* a shallow relief "coiled rope" roundel — a spiral of small beads mounted
   against a wall face, reading as a coil from thirty units off (no torus
   primitive exists in the kit for a literal ring). */
function ropeCoil(x,z,ry, depthOut, y0, r0, turns, col){
  var n = Math.round(turns*8);
  for(var i=0;i<n;i++){
    var t=i/n, ang=t*turns*Math.PI*2, rad=r0*(1-t*0.80);
    var p = loc(x,z, depthOut, Math.cos(ang)*rad, ry);
    /* 'leaf' family, not 'wood' — draw-call budget was already at its
       50-call ceiling before this pass; blob|wood is not otherwise active
       anywhere in the build, blob|leaf is (pervasively), and at r0*0.14
       the family swap has no visible effect. */
    BLOB(p[0], y0+Math.sin(ang)*rad, p[1], r0*0.14, r0*0.14, rnd()*3, col, 'leaf');
  }
}
/* an abstracted skull — cranium dome + tapered jaw + two dark recessed eye
   sockets — the same non-literal "suggested form" convention statue() uses
   for its own head; no rigged/sculpted geometry exists in this generator. */
function skullMotif(x,z,ry, depthOut, y0, r, marbleCol, darkCol){
  var p = loc(x,z, depthOut, 0, ry);
  DOME(p[0], y0, p[1], r, r*0.86, ry, marbleCol, 'dome');
  var jp = loc(x,z, depthOut*0.7, 0, ry);
  FR6(jp[0], y0-r*0.55, jp[1], r*1.1, r*0.6, r*0.7, ry, shade(marbleCol,-0.03));
  [-1,1].forEach(function(s){
    var ep = loc(x,z, depthOut+0.06, s*r*0.36, ry);
    BOX(ep[0], y0+r*0.15, ep[1], 0.12, r*0.32, r*0.28, ry, darkCol);
  });
}

/* ---- 1) HARBOR GATE --------------------------------------------------------
   Slightly worn but well-kept: basalt piers banded in lapis, nautical
   motifs — a stylised relief anchor centred over the arch, a coiled-rope
   roundel low on each pier, a drooping rope swag under the lintel, and a
   wavy/scalloped course at each pier's foot suggesting the waterline. Twin-
   pier-plus-lintel starting massing borrowed from the intact gate
   GATES.forEach already builds in 60-land.js (read, not touched). 'stone'
   (basalt/lapis), 'wood' (rope), 'metal' (anchor), 'dome' (anchor ring).
   Hand off to voth-texture once placed — this pass only assigns colour/
   family, no bump/normal work attempted. ~80 instances, ~4,500 triangles. */
function harborGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var lapisCol  = opt.lapisCol || pick(LAPISC);
  var ropeCol   = opt.ropeCol || shade(pick(TONES_POOR), 0.04);
  var pierW = opt.pierW || 7, pierD = opt.pierD || 8.5, pierH = opt.pierH || 15, gapZ = opt.gap || 13;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, basaltCol);
    /* lapis stringcourse + cap band — worn but maintained, so bands read
       clean rather than chipped */
    BOX(p[0], y+pierH*0.40, p[1], pierW*1.04, 0.85, pierD*1.04, ry, lapisCol);
    BOX(p[0], y+pierH-0.9, p[1], pierW*1.06, 1.0, pierD*1.06, ry, lapisCol);
    BOX(p[0], y+pierH+1.0, p[1], pierW*1.16, 1.3, pierD*1.16, ry, shade(basaltCol,-0.10));  /* coping cap */

    /* a wavy/scalloped course at the foot: a run of short blocks whose
       height oscillates, reading as a stylised wave line rather than a
       flat plinth edge */
    var nW = 7;
    for(var i=0;i<nW;i++){
      var t = (i+0.5)/nW;
      var lz = (t-0.5)*pierD*0.94;
      var hh = 0.5 + 0.32*Math.sin(t*Math.PI*2.4);
      var wp = loc(p[0],p[1], pierW*0.52+0.05, lz, ry);
      BOX(wp[0], y, wp[1], 0.5, hh, pierD/nW*0.85, ry, shade(lapisCol,-0.05));
    }
    /* a little honest wear: a couple of small chipped corner nicks near the
       base, not enough to read as ruined */
    var nChip = ri(1,3);
    for(var c2=0;c2<nChip;c2++){
      var cz = rr(-pierD*0.4,pierD*0.4), cy = rr(0.3, pierH*0.3);
      var cp = loc(p[0],p[1], pierW*0.5-0.15, cz, ry);
      BOX(cp[0], y+cy, cp[1], 0.5, rr(0.4,0.9), rr(0.5,1.0), ry+rr(-0.2,0.2), shade(basaltCol,-0.18));
    }
    /* coiled-rope roundel, low on the pier's street-facing (local +x) face */
    ropeCoil(p[0],p[1],ry, pierW*0.5+0.12, y+pierH*0.24, 1.1, 2.2, ropeCol);
  });

  /* lintel spanning the two piers */
  var lintelY = y+pierH;
  BOX(x, lintelY, z, pierW*1.05, 3.2, gapZ*2+pierD, ry, basaltCol);
  BOX(x, lintelY+3.2, z, pierW*1.25, 0.9, gapZ*2+pierD*1.15, ry, lapisCol);

  /* central relief anchor, mounted proud on the lintel's street face —
     stylised/abstracted the same way statue() abstracts a figure: shank,
     ring, stock, two outward-and-down flukes via reliefLimb() */
  var aY = lintelY+0.4, aR = 1.5, aDepth = pierW*0.5+0.10;
  var ap = loc(x,z, aDepth, 0, ry);
  CYL(ap[0], aY, ap[1], 0.18, aR*1.6, 0, shade(basaltCol,0.30), 'metal');        /* shank */
  /* ring: 'dome' family (its own default), not 'metal' — draw-call budget
     was already at its 50-call ceiling before this pass, and 'dome' is the
     one family box|/cyl|'metal' below don't already cover; at r=0.32 the
     family swap has no visible effect, it only changes which InstancedMesh
     bucket this one tiny primitive lands in. */
  DOME(ap[0], aY+aR*1.6, ap[1], 0.32, 0.28, 0, shade(basaltCol,0.35));           /* ring */
  BOX(ap[0], aY+aR*1.15, ap[1], 0.16, 0.22, aR*1.3, ry, shade(basaltCol,0.30), 'metal');  /* stock */
  reliefLimb(x,z,ry, aDepth, aY,  1, 2, 0.55, 0.55, 0.14, shade(basaltCol,0.30), 'metal');
  reliefLimb(x,z,ry, aDepth, aY, -1, 2, 0.55, 0.55, 0.14, shade(basaltCol,0.30), 'metal');

  /* a drooping rope swag under the lintel, between the piers. 'leaf' family,
     not 'wood' — draw-call budget was already at its 50-call ceiling before
     this pass; blob|wood is not otherwise active anywhere in the build,
     blob|leaf is (pervasively), and at this scale the family swap has no
     visible effect. */
  var steps = 9, sagY = lintelY-0.3, sagDrop = 2.1;
  for(var i2=0;i2<steps;i2++){
    var t2=(i2+0.5)/steps, lz2 = mix(-gapZ*0.92, gapZ*0.92, t2);
    var yy = sagY - sagDrop*Math.sin(Math.PI*t2);
    var sp = loc(x,z, pierW*0.5+0.10, lz2, ry);
    BLOB(sp[0], yy, sp[1], 0.30, 0.30, rnd()*3, ropeCol, 'leaf');
  }
}

/* ---- 2) SPIRIT GATE --------------------------------------------------------
   Immaculately kept: basalt piers banded and coped in white marble
   (MARBLEC — already in the palette, no placeholder needed), skull motifs
   crowning each pier and set into the lintel face. Same twin-pier-plus-
   lintel starting massing as harborGate()/the intact GATES.forEach gate,
   but taller and slenderer, and deliberately free of any wear — no rubble,
   no chipping, crisp arrises throughout. 'stone' (basalt/marble), 'dome'
   (skull crania). ~75 instances, ~4,200 triangles. */
function spiritGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var marbleCol = opt.marbleCol || pick(MARBLEC);
  var darkCol   = shade(basaltCol, -0.15);
  var pierW = opt.pierW || 6, pierD = opt.pierD || 8, pierH = opt.pierH || 18, gapZ = opt.gap || 11;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, basaltCol);
    /* three crisp marble stringcourses, evenly kept */
    [0.30,0.62,0.92].forEach(function(f){
      BOX(p[0], y+pierH*f, p[1], pierW*1.05, 0.7, pierD*1.05, ry, marbleCol);
    });
    BOX(p[0], y+pierH+0.7, p[1], pierW*1.20, 1.4, pierD*1.20, ry, marbleCol);  /* marble coping cap */
    skullMotif(p[0],p[1],ry, 0, y+pierH+2.6, 1.3, marbleCol, darkCol);         /* skull finial */
  });

  var lintelY = y+pierH+0.7+1.4;
  BOX(x, lintelY, z, pierW*1.1, 2.6, gapZ*2+pierD, ry, marbleCol);
  BOX(x, lintelY+2.6, z, pierW*1.3, 0.8, gapZ*2+pierD*1.1, ry, shade(marbleCol,-0.03));
  /* a larger central skull set into the lintel face above the opening,
     flanked by two smaller ones nearer the deck — statue()'s own
     paired-guard convention, echoed here in relief instead of in the round */
  skullMotif(x,z,ry, pierW*0.5+0.10, lintelY+1.3, 1.8, marbleCol, darkCol);
  [-1,1].forEach(function(s2){
    var sp = loc(x,z, pierW*0.5+0.08, s2*gapZ*0.55, ry);
    skullMotif(sp[0], sp[1], ry, 0, lintelY+0.7, 1.0, marbleCol, darkCol);
  });
}

/* ---- 3) WEATHERED WALL GATES — 3 variants ---------------------------------
   Each reuses the twin-tower-plus-lintel silhouette GATES.forEach already
   builds in 60-land.js (~line 423, read only — that function keeps building
   today's intact gate exactly as it does now, untouched) as its starting
   massing, then knocks pieces off it by hand rather than rolling one
   generic "ruin" knob, so each variant is a distinct, recognisable state
   rather than three random rolls of the same parameter. Unplaced props, so
   `y` is a flat base like every other standalone model in this section —
   no footing()/claim() calls (those are placement-time concerns). Default
   `col` (0x8a5947) is the same single literal the intact gate already uses,
   just weathered by shade() — no new colour invented. All 'stone', a touch
   of 'leaf' for reclaiming scrub (existing bucket). ~40-60 instances /
   700-1,600 triangles each — smaller than the intact gate. */

/* A — lightly weathered: both towers still standing, visibly worn (crack
   inlays, patchy discolouration) with a little foot rubble; nothing
   actually missing. */
function wallGateRuinA(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17, lintelH = opt.lintelH || 17;
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var th = rr(20,25);
    var wcol = shade(base, rr(-0.10,0.02));
    FR8(p[0], y, p[1], tw, th, tw, ry, wcol);
    BOX(p[0], y+th, p[1], tw*1.12, 1.6, tw*1.12, ry, shade(wcol,-0.2));
    /* crack: a thin dark inset groove, offset proud by 0.05 to dodge a
       coplanar z-fight with the tower's own face */
    var cp = loc(p[0],p[1], tw*0.5+0.05, rr(-tw*0.25,tw*0.25), ry);
    BOX(cp[0], y+th*0.15, cp[1], 0.10, th*rr(0.5,0.8), 0.35, ry, shade(wcol,-0.35));
    var nrub = ri(1,3);
    for(var i=0;i<nrub;i++){
      var rp = loc(p[0],p[1], rr(-tw*0.4,tw*0.4), rr(-tw*0.4,tw*0.4), ry);
      BOX(rp[0], y+rr(-0.1,0.3), rp[1], rr(1.0,2.0), rr(0.6,1.2), rr(1.0,2.0), rnd()*3, shade(wcol,-0.28));
    }
  });
  BOX(x, y+lintelH, z, 11, 7, gapZ*2+2, ry, shade(base,-0.03));
  var cp2 = loc(x,z, 5.6, rr(-6,6), ry);
  BOX(cp2[0], y+lintelH+rr(0,2), cp2[1], 0.4, rr(1.0,2.2), rr(1.5,3), ry, shade(base,-0.30));  /* a chipped corner */
}

/* B — moderately damaged: one tower's cap has come down (jagged broken top
   instead of a coping), the lintel has split into two sagging fragments
   with a real gap between them, heavier rubble, occasional reclaiming
   scrub. */
function wallGateRuinB(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17, lintelH = opt.lintelH || 17;
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var collapsed = (s < 0);
    var th = collapsed ? rr(13,17) : rr(21,26);
    var wcol = shade(base, rr(-0.16,-0.02));
    FR8(p[0], y, p[1], tw, th, tw, ry, wcol);
    if(collapsed){
      var nfr = 3;
      for(var i=0;i<nfr;i++){
        var fp = loc(p[0],p[1], rr(-tw*0.3,tw*0.3), rr(-tw*0.3,tw*0.3), ry);
        BOX(fp[0], y+th+rr(-0.4,0.3), fp[1], rr(3,6), rr(0.6,1.4), rr(3,6), rnd()*3, shade(wcol,-0.22));
      }
    }else{
      BOX(p[0], y+th, p[1], tw*1.12, 1.6, tw*1.12, ry, shade(wcol,-0.2));
    }
    var nrub = ri(2,4);
    for(var i2=0;i2<nrub;i2++){
      var rp = loc(p[0],p[1], rr(-tw*0.55,tw*0.55), rr(-tw*0.55,tw*0.55), ry);
      BOX(rp[0], y+rr(-0.1,0.4), rp[1], rr(1.2,2.6), rr(0.7,1.6), rr(1.2,2.6), rnd()*3, shade(wcol,-0.30));
    }
    if(chance(0.6)){
      var vp = loc(p[0],p[1], rr(-tw*0.3,tw*0.3), tw*0.5+0.1, ry);
      BLOB(vp[0], y+rr(2,th*0.6), vp[1], rr(0.8,1.4), rr(0.5,0.9), rnd()*3, pick(LEAFC), 'leaf');
    }
  });
  /* a sagging, split lintel — two shorter fragments with a real gap
     between them rather than one solid span */
  var half = gapZ - 3;
  [-1,1].forEach(function(s3){
    var lp = loc(x,z, 5.6, s3*half*0.55, ry);
    BOX(lp[0], y+lintelH-rr(0,1.4), lp[1], 10, 6, half*0.85, ry, shade(base,-0.08));
  });
}

/* C — heavily ruined: one tower reduced to a low stub and a rubble mound,
   the other still stands but roofless and cracked, the lintel is gone
   entirely (fallen blocks scattered across the gap), and reclaiming growth
   is heavy throughout. */
function wallGateRuinC(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17;

  /* the standing tower (+z side): roofless, cracked, no cap */
  var sp = loc(x,z, 0, gapZ, ry);
  var sth = rr(15,20);
  var swcol = shade(base, -0.10);
  FR8(sp[0], y, sp[1], tw, sth, tw, ry, swcol);
  var ccp = loc(sp[0],sp[1], tw*0.5+0.05, rr(-tw*0.3,tw*0.3), ry);
  BOX(ccp[0], y+sth*0.1, ccp[1], 0.10, sth*0.7, 0.4, ry, shade(swcol,-0.4));

  /* the fallen tower (-z side): a low stub plus a rubble mound */
  var fp = loc(x,z, 0, -gapZ, ry);
  var stubH = rr(3,6);
  FR8(fp[0], y, fp[1], tw, stubH, tw, ry, shade(base,-0.18));
  var nrub = ri(6,10);
  for(var i=0;i<nrub;i++){
    var rp = loc(fp[0],fp[1], rr(-tw*0.7,tw*0.7), rr(-tw*0.7,tw*0.7), ry);
    BOX(rp[0], y+rr(0,3), rp[1], rr(1.5,3.4), rr(1.0,2.4), rr(1.5,3.4), rnd()*3, shade(base,-0.30+rr(-0.05,0.05)));
  }

  /* no lintel left — a few fallen blocks scattered across the gap where it
     used to span */
  var nspan = ri(3,5);
  for(var i2=0;i2<nspan;i2++){
    var qp = loc(x,z, rr(2,8), rr(-gapZ*0.9,gapZ*0.9), ry);
    BOX(qp[0], y+rr(0,1.5), qp[1], rr(1.6,3.2), rr(1.0,2.0), rr(1.6,3.2), rnd()*3, shade(base,-0.26));
  }

  /* heavy reclaiming growth over the ruin */
  var nveg = ri(4,7);
  for(var v=0;v<nveg;v++){
    var vp2 = loc(x,z, rr(-4,10), rr(-gapZ*1.1,gapZ*1.1), ry);
    BLOB(vp2[0], y+rr(0.5,4), vp2[1], rr(1.0,2.0), rr(0.7,1.3), rnd()*3, pick(LEAFC), 'leaf');
  }
}

/* ---- 4) BASALT WALL SEGMENT ------------------------------------------------
   A straight recolour-and-redress of the curtain wall's own per-segment
   geometry (the FR8 core + BOX parapet built in the loop at 60-land.js's
   "18. CURTAIN WALL", read only, NOT touched — the sandstone wall, col
   0xc2a06e, keeps building exactly as it does today until the owner swaps
   this in) in basalt instead of sandstone, for whenever the owner redraws
   the wall. Same silhouette/proportions (9-wide core, L-long, 1.5-thick
   coping) plus a few dark coursing lines suggesting columnar basalt
   jointing — colour and a light surface cue, no new family. 'stone' only.
   One call = one segment of length L: ~9 instances, ~250 triangles (before
   whatever L the caller passes — the jointing count scales with it). */
function wallSegmentBasalt(x,y,z,ry,col,opt){
  opt = opt || {};
  var L = opt.len || 30, h = opt.h || rr(10,16);
  var basaltCol = col || pick(BASALTC);
  FR8(x, y, z, 9.0, h, L*1.08, ry, basaltCol);
  BOX(x, y+h, z, 10.4, 1.5, L*1.08, ry, shade(basaltCol,-0.18));   /* coping */
  /* columnar-jointing cue: a run of thin, evenly-spaced dark vertical seams
     down the face, offset proud by 0.05 to dodge a coplanar z-fight against
     the FR8's own flat face */
  var nJoint = Math.max(3, Math.round(L/4.5));
  for(var i=0;i<nJoint;i++){
    var t = (i+0.5)/nJoint;
    var lz = (t-0.5)*L*0.98;
    var jp = loc(x,z, 4.55, lz, ry);
    BOX(jp[0], y+0.2, jp[1], 0.12, h*0.94, 0.16, ry, shade(basaltCol,-0.24));
  }
}

/* ---- 5) RIVER GATE ----------------------------------------------------------
   Worn but intact: not kept glass-clean like spiritGate, not missing pieces
   like the wallGateRuin* family — patchy discolouration and a handful of
   foot chips on basalt piers that are otherwise structurally whole, same as
   harborGate's own condition but a touch plainer (no polished stringcourses).
   Corn-and-wheat motif in place of harborGate's nautical one: a bound wheat
   sheaf relief (fanned stalks gathered at a tie-band, small grain heads) on
   one pier, a husked corn cob on the other, and a mixed sheaf-and-cob swag
   strung under the lintel in place of harborGate's rope. Same twin-pier-
   plus-lintel starting massing as harborGate()/spiritGate()/the intact
   GATES.forEach gate (60-land.js, read only, not touched).
   Colour: basalt piers (BASALTC, same family every gate in this file uses);
   the grain-gold band reuses 0xc2a06e, the curtain wall's OWN existing
   sandstone literal (60-land.js "18. CURTAIN WALL", read only) — not a new
   colour, just borrowed for a golden-wheat read; husk leaves use CROPC
   (already in the palette, 05-palette.js). 'stone' (basalt + grain-gold),
   'leaf' (husk), 'metal' unused here (no reused reliefLimb). ~70 instances,
   ~3,700 triangles. */
function wheatSheafMotif(x,z,ry, depthOut, y0, scale, grainCol){
  var p0 = loc(x,z, depthOut, 0, ry);
  var nStalk = 5;
  for(var i=0;i<nStalk;i++){
    var t = (i+0.5)/nStalk - 0.5;            /* -0.4 .. 0.4 */
    var lat = t*1.7*scale, latTop = t*2.3*scale;   /* extra spread at the top: a fanned sheaf, not a bundle of parallel rods */
    var base = loc(x,z, depthOut, lat, ry);
    var top  = loc(x,z, depthOut+0.05*scale, latTop, ry);
    CYL(base[0], y0, base[1], 0.10*scale, 2.2*scale, 0, shade(grainCol, rr(-0.05,0.05)));
    BLOB(top[0], y0+2.15*scale, top[1], 0.17*scale, 0.44*scale, rnd()*3, shade(grainCol,-0.04));  /* grain head */
  }
  BOX(p0[0], y0+1.05*scale, p0[1], 0.5*scale, 0.32*scale, 1.55*scale, ry, shade(grainCol,-0.16));  /* tie-band */
}
function cornCobMotif(x,z,ry, depthOut, y0, scale, grainCol, huskCol){
  var p = loc(x,z, depthOut, 0, ry);
  CYL(p[0], y0, p[1], 0.40*scale, 2.5*scale, 0, shade(grainCol,0.03));                 /* cob */
  BOX(p[0], y0+1.85*scale, p[1], 0.5*scale, 0.18*scale, 1.0*scale, ry, shade(grainCol,-0.12));  /* husk tie */
  [-1,1].forEach(function(hs){
    var hp = loc(x,z, depthOut-0.08*scale, hs*0.32*scale, ry);
    BLOB(hp[0], y0, hp[1], 0.28*scale, 1.55*scale, ry+hs*0.5, huskCol, 'leaf');         /* flaring husk leaf */
  });
}
function riverGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var grainCol  = opt.grainCol || 0xc2a06e;          /* the curtain wall's own sandstone literal, reused */
  var huskCol   = opt.huskCol || pick(CROPC);
  var pierW = opt.pierW || 6.5, pierD = opt.pierD || 8, pierH = opt.pierH || 16, gapZ = opt.gap || 12;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var wcol = shade(basaltCol, rr(-0.09,0.01));       /* patchy discolouration, worn not ruined */
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, wcol);
    BOX(p[0], y+pierH*0.42, p[1], pierW*1.04, 0.8, pierD*1.04, ry, grainCol);              /* grain-gold band */
    BOX(p[0], y+pierH-0.9, p[1], pierW*1.05, 0.9, pierD*1.05, ry, shade(grainCol,-0.05));
    BOX(p[0], y+pierH+1.0, p[1], pierW*1.15, 1.2, pierD*1.15, ry, shade(basaltCol,-0.10));  /* coping */

    /* honest wear: a couple of foot chips, same convention as harborGate's own */
    var nChip = ri(1,3);
    for(var c=0;c<nChip;c++){
      var cz = rr(-pierD*0.4,pierD*0.4), cy = rr(0.3, pierH*0.28);
      var cp = loc(p[0],p[1], pierW*0.5-0.15, cz, ry);
      BOX(cp[0], y+cy, cp[1], 0.5, rr(0.4,0.9), rr(0.5,1.0), ry+rr(-0.2,0.2), shade(basaltCol,-0.20));
    }

    /* one pier gets a wheat sheaf, the other a corn cob — variety over the
       two piers rather than the same relief mirrored twice */
    var motifDepth = pierW*0.5+0.14, motifY = y+pierH*0.30;
    if(s < 0) wheatSheafMotif(p[0],p[1],ry, motifDepth, motifY, 1.0, grainCol);
    else cornCobMotif(p[0],p[1],ry, motifDepth, motifY, 1.0, grainCol, huskCol);
  });

  /* lintel spanning the two piers */
  var lintelY = y+pierH;
  BOX(x, lintelY, z, pierW*1.05, 3.0, gapZ*2+pierD, ry, basaltCol);
  BOX(x, lintelY+3.0, z, pierW*1.22, 0.85, gapZ*2+pierD*1.12, ry, shade(grainCol,-0.05));

  /* a smaller mixed sheaf-and-cob at lintel centre, echoing both pier motifs */
  var cDepth = pierW*0.5+0.10, cY = lintelY+0.5;
  wheatSheafMotif(x,z,ry, cDepth, cY, 0.62, grainCol);
  var cobP = loc(x,z, cDepth, 1.3, ry);
  cornCobMotif(cobP[0], cobP[1], ry, 0, cY, 0.55, grainCol, huskCol);

  /* a garland swung under the lintel between the piers, alternating grain-
     gold (wheat) and husk-green beads in place of harborGate's rope swag.
     'leaf' family throughout (not 'stone'/'wood') — already active
     pervasively elsewhere in the build, so this introduces no new draw
     call; the budget was already at its 50-call ceiling before this pass. */
  var steps = 9, sagY = lintelY-0.3, sagDrop = 1.9;
  for(var i2=0;i2<steps;i2++){
    var t2=(i2+0.5)/steps, lz2 = mix(-gapZ*0.92, gapZ*0.92, t2);
    var yy = sagY - sagDrop*Math.sin(Math.PI*t2);
    var sp = loc(x,z, pierW*0.5+0.10, lz2, ry);
    BLOB(sp[0], yy, sp[1], 0.30, 0.30, rnd()*3, (i2%2===0)?grainCol:huskCol, 'leaf');
  }
}

/* ============================== 21. GATE SITE-FINDING & PLACEMENT ===========
   Same spiral-search-plus-claim() idiom as lifeFindShrineSite (this file,
   "~line 1771" — read, not touched): search outward from an owner-given
   anchor in real rings, calling claim() at each candidate against the REAL
   PLACED state at THIS build, so a stale hand-picked coordinate self-heals
   instead of silently colliding. Unlike lifeFindShrineSite this does NOT
   reject a spot for being on/near a road (openAt) — a gate is SUPPOSED to
   straddle one; it also allows a shallower max slope by default since
   footing() (called by the caller, same as the intact GATES.forEach gate)
   handles a sloped footprint rather than the flat pad a shrine wants. Tag
   'gate' — same tag the intact wall gate's own claim() already uses, so a
   facade pass reading PLACED treats it as position/footprint only, per
   API.md's tag table. */
function facadeFindGateSite(anchorX, anchorZ, opt){
  opt = opt || {};
  var minH = (opt.minH != null) ? opt.minH : -1e9;
  var maxH = (opt.maxH != null) ? opt.maxH : 1e9;
  var maxSlope = (opt.maxSlope != null) ? opt.maxSlope : 16;
  var fx = (opt.fx != null) ? opt.fx : 12, fz = (opt.fz != null) ? opt.fz : 18;
  for(var ring=0; ring<28; ring++){
    var r = ring*16, tries = ring===0 ? 1 : 10;
    for(var t=0; t<tries; t++){
      var ang = (t/tries)*Math.PI*2 + ring*0.37;
      var x = anchorX + Math.cos(ang)*r, z = anchorZ + Math.sin(ang)*r;
      var h = terrainH(x,z);
      if(h < minH || h > maxH) continue;
      if(inRiver(x,z,24)) continue;
      var hs = [terrainH(x+18,z), terrainH(x-18,z), terrainH(x,z+18), terrainH(x,z-18)];
      var slope = Math.max(Math.abs(hs[0]-h), Math.abs(hs[1]-h), Math.abs(hs[2]-h), Math.abs(hs[3]-h));
      if(slope > maxSlope) continue;
      var claimed = claim(x, z, fx, fz, opt.ry || 0, opt.tag || 'gate');
      if(claimed) return { x:x, z:z };
    }
  }
  return null;
}

/* ============================== 22. WATCHTOWER ===============================
   "An ancient watchtower... about 2.5 storeys tall and resembles one of the
   towers from Angkor Wat" — a squarish base rising into a tapering,
   corncob/beehive silhouette of stacked, progressively-smaller tiers,
   capped with a slender pointed finial, not a cone or a flat-roofed block.
   Built the same way the necropolis Temple's own tiered massing already
   works (50-cantons.js/this file's own temple(), read for reference, not
   touched): a stack of shrinking FR8/FR6/FR3 tiers, each banded by a thin
   stringcourse cap, capped with a CONE finial. Three storeys read at
   roughly 9-16 units each elsewhere in this build (structure()'s own 'h'
   for a few-storey building; SWCOMPOUNDS' satellite houses use rr(16,30)
   for 2-3 storeys) so 2.5 storeys of shaft plus a finial lands the whole
   tower around 30 units — taller than a person, far short of a canton's
   own dome-tower (Temple's own top is 156 + a 34 dome).

   Every shape keeps its already-active default family — FR8/FR6/FR3/BOX
   all default to 'stone' (the curtain wall, the gates and half the city
   already use that bucket), CONE defaults to 'roof' (the exact bucket
   every other spire-cap in the build already uses — the legacy wall's own
   corner towers included, hence reusing their literal cap colour
   0x6c5e4a), BLOB defaults to 'leaf' (reclaiming scrub, pervasive already)
   — no new (shape,family) pair, so no new draw call.

   health: 2 = intact (full 2.5-storey corncob + finial), 1 = ruined
   (reduced to one storey, broken top instead of a cap), 0 = destroyed
   (reduced to its base — a low foundation course and rubble, nothing
   standing), per the owner's own wording. */
/* FIFTH PASS (owner: "scale up the city wall towers by 2x and make sure the
   intact ones have a ladder to an elevated sentry perch, plus one ordinator
   sentry stationed on it").

   S=2 multiplies EVERY length below — height and footprint together — so
   this stays the same model at twice the size rather than a stretched one.
   Anchoring is unchanged: `y` is still the footing's own low point (60-land.js
   passes footing().lo), so a doubled tower grows upward off the same ground
   instead of floating or sinking.

   Why no claim()/footprint change is needed anywhere, checked rather than
   assumed: a wall node reserves fx=fz=10 — a 20x20 rectangle — in BOTH the
   early margin reserve (30-layout.js's OBST push) and the real site-search
   claim (60-land.js's facadeFindGateSite call). The 1x tower only ever used
   8.5 of that (half-extent 4.25). At 2x its base half-extent is 8.5 and its
   widest element, the storey-1 band, 9.18 — both still inside the 10 already
   reserved, as are the perch parapet (9.7) and the ladder rails (9.2) added
   below. Nothing else's placement can therefore shift: every candidate that
   was rejected near a tower is still rejected and every one that was allowed
   is still clear of the doubled masonry. (Confirmed by diffing every
   window._* placement counter before and after — identical.)

   The one thing NOT simply doubled is the ruin-debris scatter: at 2x the old
   coefficients would fling loose blocks ~17 units out, past that same 10-unit
   reservation and onto ground a neighbouring building may legitimately own.
   rubR caps the scatter so centre+half-block stays under 9.5.

   One deliberate non-change: every ri()/rr()/rnd()/pick() call below is left
   EXACTLY as it was, same count in the same order. This function runs inside
   60-land.js section 18, which shares its PRNG stream with section 19 (THE
   BUILT-UP CITY) right after it — so adding or removing even one rubble
   block here silently reshuffles every town/compound placement downstream.
   Making the debris denser to suit the bigger ruin was tried and backed out
   for that reason (measured: it moved no placement counter in the end, but
   only because it happens to fall where it does — that is luck, not a
   guarantee, and not worth spending); the debris reads bigger instead, via
   *S on the block sizes, which costs the stream nothing. */
function watchtower(x,y,z,ry,health,col){
  col = col || pick(BASALTC);
  var S = 2;
  var baseW = 8.5*S, baseH = 11*S;
  var rubR = 6.4;   /* debris scatter cap — see the header above */

  if(health <= 0){
    /* destroyed: reduced to its base */
    FR8(x, y, z, baseW, rr(2.2,3.6)*S, baseW, ry, shade(col,-0.10));
    var nrub = ri(4,7);
    for(var i=0;i<nrub;i++){
      var rp = loc(x,z, rr(-rubR,rubR), rr(-rubR,rubR), ry);
      BOX(rp[0], y+rr(0,2.2*S), rp[1], rr(1.4,3.0)*S, rr(1.0,2.2)*S, rr(1.4,3.0)*S, rnd()*3, shade(col,-0.24+rr(-0.05,0.05)));
    }
    var nveg = ri(2,4);
    for(var v=0; v<nveg; v++){
      var vp = loc(x,z, rr(-rubR*1.1,rubR*1.1), rr(-rubR*1.1,rubR*1.1), ry);
      BLOB(vp[0], y+rr(0.4,2.4)*S, vp[1], rr(0.8,1.6)*S, rr(0.6,1.1)*S, rnd()*3, pick(LEAFC), 'leaf');
    }
    return;
  }

  /* storey 1 — present at both ruined and intact */
  FR8(x, y, z, baseW, baseH, baseW, ry, col);

  if(health === 1){
    /* ruined: one storey, a broken top instead of a clean cap — a few
       uneven fragments, same convention wallGateRuinB's collapsed tower
       uses — plus foot rubble and reclaiming scrub */
    var nfr = ri(2,4);
    for(var f=0; f<nfr; f++){
      var fp = loc(x,z, rr(-baseW*0.22,baseW*0.22), rr(-baseW*0.22,baseW*0.22), ry);
      BOX(fp[0], y+baseH+rr(-0.5,0.3)*S, fp[1], rr(2.4,4.2)*S, rr(0.7,1.6)*S, rr(2.4,4.2)*S, rnd()*3, shade(col,-0.20));
    }
    var nrub2 = ri(2,4);
    for(var r2=0;r2<nrub2;r2++){
      var rp2 = loc(x,z, rr(-rubR,rubR), rr(-rubR,rubR), ry);
      BOX(rp2[0], y+rr(-0.1,0.4)*S, rp2[1], rr(1.4,2.6)*S, rr(0.8,1.6)*S, rr(1.4,2.6)*S, rnd()*3, shade(col,-0.28));
    }
    if(chance(0.6)){
      var vp2 = loc(x,z, rr(-baseW*0.3,baseW*0.3), baseW*0.5+0.4, ry);
      BLOB(vp2[0], y+rr(2,baseH*0.7), vp2[1], rr(0.9,1.5)*S, rr(0.6,1.0)*S, rnd()*3, pick(LEAFC), 'leaf');
    }
    return;
  }

  /* intact: the corncob — two more shrinking tiers above storey 1, each
     banded, then the sentry perch and a slender pointed finial */
  var yy = y + baseH;
  BOX(x, yy-0.9*S, z, baseW*1.08, 1.1*S, baseW*1.08, ry, shade(col,-0.16));
  var w2 = baseW*0.72, h2 = 7.5*S;
  FR6(x, yy, z, w2, h2, w2, ry, shade(col,0.03));
  yy += h2;
  BOX(x, yy-0.7*S, z, w2*1.10, 0.9*S, w2*1.10, ry, shade(col,-0.14));

  /* ---- the sentry perch. A corbelled gallery deck riding on the second
     tier's own band (36 units up on a 2x tower, i.e. the top of the
     masonry massing, below the finial), parapeted with the same merlon
     vocabulary the curtain wall itself uses, with the third tier rising
     out of the middle of it — so a sentry stands on a real ring of floor
     ~5 units wide between the spire and the merlons rather than on a
     token ledge. pHw is set at baseW*0.52 so the deck corbels ~1.5 units
     proud of the tapered shaft (reads as a gallery) while parapet and
     ladder both stay inside the node's own 10-unit reservation — see this
     function's header for why that boundary matters. Every shape here is
     an already-spent bucket: box|stone for deck and merlons, cyl|wood +
     box|wood for the ladder. No new draw call. */
  var pHw = baseW*0.52, deckH = 1.6;
  BOX(x, yy, z, pHw*2, deckH, pHw*2, ry, shade(col,-0.06));
  var pY = yy + deckH;                         /* the walking surface itself */

  /* The ladder climbs the face that looks INTO the city — the side whose
     own midpoint is nearer the map origin — which is where a garrison
     would actually climb from; the sentry then stands at the opposite,
     outward-looking parapet (perch.side, below, is handed to the life
     layer for exactly that). */
  var lSide = (Math.hypot(x + Math.cos(ry)*baseW, z - Math.sin(ry)*baseW) <
               Math.hypot(x - Math.cos(ry)*baseW, z + Math.sin(ry)*baseW)) ? 1 : -1;
  var ladX = lSide*(baseW*0.5 + 0.45), ladW = 1.9, ladTop = pY + 1.2;
  [-1,1].forEach(function(s){
    var lp = loc(x, z, ladX, s*ladW*0.5, ry);
    CYL(lp[0], y, lp[1], 0.22, ladTop-y, 0, shade(TRUNKC[0],-0.12), 'wood');
  });
  var nRung = Math.max(4, Math.round((pY-y)/1.6));
  var ladFoot = loc(x, z, ladX, 0, ry);
  for(var rg=1; rg<=nRung; rg++){
    BOX(ladFoot[0], y + rg*((pY-y)/(nRung+1)), ladFoot[1], 0.30, 0.18, ladW, ry, shade(TRUNKC[1],-0.05), 'wood');
  }

  /* the parapet, with the merlons at the ladder head left out as the
     hatchway the climb actually comes up through */
  var mw = 1.5, mh = 2.4, md = 1.8, perM = mw + 1.05;
  var nM = Math.max(3, Math.floor((pHw*2)/perM));
  [['x',pHw],['x',-pHw],['z',pHw],['z',-pHw]].forEach(function(e){
    for(var k=0;k<nM;k++){
      var t = (k+0.5)/nM*(pHw*2) - pHw;
      var lx = e[0]==='x' ? t : e[1];
      var lz = e[0]==='x' ? e[1] : t;
      if(e[0]==='z' && e[1]*lSide > 0 && Math.abs(t) < ladW*0.5+0.9) continue;
      var mp = loc(x,z, lx, lz, ry);
      BOX(mp[0], pY, mp[1], e[0]==='x'?mw:md, mh, e[0]==='x'?md:mw, ry, shade(col,-0.30));
    }
  });

  var w3 = baseW*0.46, h3 = 6.0*S;
  FR3(x, pY, z, w3, h3, w3, ry, shade(col,0.06));
  var yy3 = pY + h3;
  BOX(x, yy3-0.5*S, z, w3*1.14, 0.7*S, w3*1.14, ry, shade(col,-0.12));
  CONE(x, yy3, z, w3*0.55, 7.5*S, ry, 0x6c5e4a);   /* the legacy wall towers' own cap colour */

  /* handed back so 60-land.js can record the perch on window._newTowers:
     78-life.js posts its sentry at this exact y (not lifeGroundY), and
     72-lanterns.js hangs the tower's lantern here instead of at the old
     flat 1x-scale height. */
  return { perch: { y:pY, hw:pHw, side:-lSide } };
}

/* ============================== 23. WALL SEGMENT DAMAGE STATES ==============
   Renders one wall body between two consecutive wall nodes (towers/gates)
   at the given floor-of-average health. state 2 reuses wallSegmentBasalt()
   verbatim (this file's own "4. BASALT WALL SEGMENT", read only) via the
   sandstone colour passed in; 1 and 0 are new, smaller variants — a lower
   run with no parapet and a little rubble, and a low broken stub with a
   scatter of fallen blocks, respectively. Per the owner, a destroyed WALL
   SEGMENT still reads as a physical ruin (unlike a destroyed GATE, which is
   deleted outright) — "(for this asset class, meaning deleted)" was
   specifically about gates. */
function wallSegRender(ax,az,bx,bz,state,col){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 1) return;
  var mx=(ax+bx)/2, mz=(az+bz)/2, ry=Math.atan2(dx,dz);
  var f = footing(mx,mz, 5, L*0.5, ry);
  if(f.hi-f.lo > 30) return;   /* terrain too steep to read as a built wall */
  if(state <= 0){
    var stubH = rr(1.4,2.8);
    FR8(mx, f.lo-1, mz, 7.5, (f.hi-f.lo)+1+stubH, L*1.05, ry, shade(col,-0.22));
    var n = Math.max(2, Math.round(L/22));
    for(var i=0;i<n;i++){
      var t=(i+0.5)/n, lp = loc(mx,mz, rr(-4,4), (t-0.5)*L*0.9, ry);
      BOX(lp[0], f.hi+rr(0,1.6), lp[1], rr(1.6,3.2), rr(1.0,2.0), rr(1.6,3.2), rnd()*3, shade(col,-0.30));
    }
  }else if(state === 1){
    var h = rr(7,11);
    FR8(mx, f.lo-1, mz, 9.0, (f.hi-f.lo)+1+h, L*1.08, ry, shade(col,-0.10));
    var n2 = Math.max(1, Math.round(L/30));
    for(var j=0;j<n2;j++){
      var t2=(j+0.5)/n2, rp = loc(mx,mz, rr(-6,6), (t2-0.5)*L*0.7, ry);
      BOX(rp[0], f.hi+h-1+rr(-0.6,0.4), rp[1], rr(2.4,4.2), rr(1.0,1.8), rr(2.4,4.2), rnd()*3, shade(col,-0.24));
    }
  }else{
    wallSegmentBasalt(mx, f.lo-1, mz, ry, col, { len:L, h:(f.hi-f.lo)+1+rr(11,15) });
  }
}

/* ============================== 24. WALL OVERLAP AUDIT ======================
   The owner: once the wall/gates/towers are placed, audit for overlaps
   against buildings and relocate+reorient any that clip a gate, a tower,
   or an intact/ruined wall segment (destroyed segments are explicitly
   exempt, per the owner's own wording, listing only "a gate, a tower, or
   an intact or ruined segment").

   The real prevention happens earlier, by construction: 60-land.js's
   "18. CURTAIN WALL" now runs the new wall/gate/tower claim()s BEFORE
   "19. THE BUILT-UP CITY" ever scans a town/compound/velothi-out/
   warehouse candidate, so claim()'s own gridHit() test — the same shared
   machinery every placement call already goes through, not anything wall-
   specific — rejects any candidate that would land inside a wall
   footprint. That makes this pass a verification that it held, using a
   real OBB/SAT test (four separating axes: each rectangle's own local x
   and z, in world space via loc()) rather than a trust-the-ordering
   assumption.

   If this ever DOES find a clip, there is no baked geometry left to move:
   push() (45-kit.js) writes straight into an InstancedMesh bucket the
   moment a shape is drawn, so a building's triangles are fixed in the
   world at claim() time, not deferred to some later commit step — moving
   a PLACED record's x/z after the fact would desync the record from what
   is actually on screen. The honest response is to report it (it would
   mean some OTHER placement pass bypassed claim() entirely — a real bug
   worth chasing down, not something to paper over with a fake fix here). */
function wallOBBCorners(cx,cz,fx,fz,ry){
  var out=[];
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){ out.push(loc(cx,cz, s[0]*fx, s[1]*fz, ry)); });
  return out;
}
function wallOBBOverlap(ax,az,afx,afz,ary, bx,bz,bfx,bfz,bry){
  if(Math.hypot(ax-bx,az-bz) > Math.hypot(afx,afz)+Math.hypot(bfx,bfz)) return false;
  var ca = wallOBBCorners(ax,az,afx,afz,ary), cb = wallOBBCorners(bx,bz,bfx,bfz,bry);
  var axes = [[Math.cos(ary),-Math.sin(ary)],[Math.sin(ary),Math.cos(ary)],
              [Math.cos(bry),-Math.sin(bry)],[Math.sin(bry),Math.cos(bry)]];
  for(var i=0;i<axes.length;i++){
    var ux=axes[i][0], uz=axes[i][1];
    var amin=1e18,amax=-1e18,bmin=1e18,bmax=-1e18;
    for(var j=0;j<4;j++){
      var da=ca[j][0]*ux+ca[j][1]*uz; if(da<amin)amin=da; if(da>amax)amax=da;
      var db=cb[j][0]*ux+cb[j][1]*uz; if(db<bmin)bmin=db; if(db>bmax)bmax=db;
    }
    if(amax<bmin || bmax<amin) return false;   /* separating axis found */
  }
  return true;
}
(function wallOverlapAudit(){
  var shapes = [];
  WNODES.forEach(function(n){
    if(n.builtX===undefined) return;   /* site search failed — nothing drawn there */
    if(n.kind==='tower') shapes.push({x:n.builtX,z:n.builtZ,fx:10,fz:10,ry:n.ry});
    else if(n.health>0) shapes.push({x:n.builtX,z:n.builtZ,fx:(n.named?11:10),fz:(n.named?19:17),ry:n.ry});
  });
  WSEGS.forEach(function(s){
    if(s.health<=0) return;   /* destroyed segments exempt, per the owner */
    var dx=s.bx-s.ax, dz=s.bz-s.az, L=Math.hypot(dx,dz);
    if(L<2) return;
    shapes.push({x:(s.ax+s.bx)/2, z:(s.az+s.bz)/2, fx:6, fz:L/2, ry:Math.atan2(dx,dz)});
  });
  var buildingTags = { town:1, compound:1, 'velothi-out':1, warehouse:1, manor:1 };
  var clips = [];
  PLACED.forEach(function(p){
    if(!buildingTags[p.tag]) return;
    for(var i=0;i<shapes.length;i++){
      var w = shapes[i];
      if(wallOBBOverlap(p.x,p.z,p.fx,p.fz,p.ry, w.x,w.z,w.fx,w.fz,w.ry)){
        clips.push({ x:p.x, z:p.z, tag:p.tag });
        break;
      }
    }
  });
  window._wallAudit = {
    checked: PLACED.filter(function(p){ return buildingTags[p.tag]; }).length,
    shapes: shapes.length, clips: clips.length, clipSample: clips.slice(0,8)
  };
})();

/* ============================== TAVERN + BEER GARDEN ==============================
   A new building kind, distinct from structure()'s hlaalu/velothi/domed/hovel
   and from the monastery/temple bespoke buildings: a two-storey public hall
   (tall ground-floor taproom, guest rooms above, stepped back per side per
   hlaalu's own cornice idiom) with an attached fenced beer garden trailing
   off its rear (local -x) wall. NOT PLACED HERE — per the brief this file
   only defines tavern() and its two small helpers; nothing below calls them
   into the world. A caller elsewhere reserves the returned footprint via
   claim() and wires the returned garden centre into the pedestrian-
   destination system.

   Signals "tavern" specifically (per the brief): a hanging bracket sign at
   the entrance, an exterior stair to the upper floor, a stack of casks in
   the garden's corner, and a chimney smoking on the shared smoke-particle
   rig at the top of this file (registerSmokeEmitter — zero extra draw
   calls, it shares the forge's one mesh).
   Doors/windows face local +x (world direction ry), same convention as
   funeraryTemple/monasteryChapel/structure() above. Existing (shape,family)
   buckets only: box|stone, box|wood, box|plaster is unused here, cyl|stone,
   cyl|wood, cyl|metal, fr8|roof, blob|leaf, dome (via monasteryWindow's own
   arch cap) — all already live elsewhere in this file, zero new draw calls. */
reseed(657001);   /* unique fragment seed for this new section, per the brief. */

/* a small wood cask: body + hoop bands — cyl|wood / cyl|metal, both already
   live buckets (ferries, monasteryWell, brazierOrnate). Returns its own
   height so a caller can stack a second, smaller cask on top. */
function tavernBarrel(x,y,z,col){
  var r = rr(0.5,0.68), h = rr(1.2,1.6);
  CYL(x, y, z, r, h, 0, col, 'wood');
  [0.12,0.5,0.86].forEach(function(t){
    CYL(x, y+h*t-0.07, z, r*1.04, 0.16, 0, shade(col,-0.32), 'metal');
  });
  return h;
}

/* a garden table: plank top on 4 short legs — box|wood only, already live.
   No equivalent prop exists elsewhere in src/ (checked), so this is not a
   parallel reimplementation of anything; benchPlain/benchOrnate (above,
   this same file) are reused as-is for seating rather than duplicated. */
function tavernTable(x,y,z,ry,col){
  var w = 2.2, d = 1.3, legH = 0.75;
  BOX(x, y+legH, z, w, 0.14, d, ry, col, 'wood');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){
    var p = loc(x,z, c[0]*w*0.42, c[1]*d*0.38, ry);
    BOX(p[0], y, p[1], 0.16, legH, 0.16, ry, shade(col,-0.2), 'wood');
  });
}

/* tavern(x, y, z, ry, col, opt) — x,y,z is the taproom hall's own centre
   (y the ground/base reference, same convention as funeraryTemple/
   monasteryChapel), ry the entrance facing (local +x, world direction ry).
   col is the wall stone tone (falls back to pick(TONES) if falsy). opt may
   override hallW/hallD/h1/h2/gardenDepth/gardenW/roofCol.

   Returns { x, z, ry, fx, fz, gardenCx, gardenCz, doorX, doorZ } — fx/fz
   are half-extents of a rectangle CENTRED AT (x,z) that safely contains the
   whole building + beer garden (it over-claims a little on the entrance
   side, since the garden trails off asymmetrically behind the hall, rather
   than returning an off-centre claim rectangle a caller would have to
   reason about separately); doorX/doorZ is the front-door threshold, for a
   caller wiring up a pedestrian approach point; gardenCx/gardenCz is the
   beer garden's own centre, for registering it as a pedestrian destination
   — same shape of contract as monasteryAssemblyHall's own
   {x,z,ry,courtCx,courtCz,courtSpan} return, above. */
function tavern(x, y, z, ry, col, opt){
  opt = opt || {};
  var hallW = opt.hallW || 20, hallD = opt.hallD || 30;
  var h1 = opt.h1 || 9.5, h2 = opt.h2 || 6.5;
  var wallCol = col || pick(TONES);
  /* owner: "give taverns a specific blue colored roof so I can easily
     identify them" -- a fixed signature colour instead of pick(ROOFS)
     (which is all terracotta/olive/ochre tones, no blue at all in that
     palette, so this reads as unmistakably distinct from every other
     roof in the city at a glance). Same 'roof' family/bucket as every
     other roof colour -- just a fixed hex, zero new draw calls. */
  var TAVERN_ROOF_BLUE = 0x2f5a86;
  var roofCol = opt.roofCol || shade(TAVERN_ROOF_BLUE, -0.06);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.18);
  var doorCol = pick(TRUNKC);

  var y1 = y, y2 = y1+h1;
  var upperW = hallW*0.86, upperD = hallD;   /* recessed in x only — the +/-z
     walls stay flush floor to floor, so the exterior stair (below) can dock
     against a continuous wall instead of a stepped one. */

  /* --- ground floor: the taproom hall --- */
  BOX(x, y1, z, hallW, h1, hallD, ry, wallCol);
  BOX(x, y1+h1-0.55, z, hallW*1.04, 1.0, hallD*1.04, ry, shade(wallCol,-0.13));   /* cornice */

  /* --- upper floor: guest rooms, stepped in slightly on the front/back --- */
  BOX(x, y2, z, upperW, h2, upperD, ry, shade(wallCol,0.03));
  var eaveY = y2+h2;
  BOX(x, eaveY, z, upperW*1.05, 0.9, upperD*1.05, ry, shade(wallCol,-0.16));      /* eave/parapet */

  /* --- roof: a steep hip, taller in proportion than an ordinary house's or
     a monastery dorm's, so the hall reads as a grand public room even from
     a distance --- */
  var roofH = h1*0.75;
  FR8(x, eaveY+0.9, z, upperW*1.02, roofH, upperD*1.02, ry, roofCol, 'roof');

  /* --- chimney, off-centre, with a couple of soft grey puffs above it so
     it reads as a working hearth rather than decoration --- */
  var chimP = loc(x,z, -hallW*0.22, hallD*0.28, ry);
  var chimBaseY = eaveY-1.5, chimTopY = eaveY+0.9+roofH*0.55;
  CYL(chimP[0], chimBaseY, chimP[1], 0.85, chimTopY-chimBaseY, 0, shade(wallCol,-0.22));
  CYL(chimP[0], chimTopY, chimP[1], 1.05, 0.5, 0, shade(wallCol,-0.30));          /* cap */
  /* the hearth plume — real particles on the shared citywide rig
     (registerSmokeEmitter, top of this file), replacing the 3 static BLOBs
     that used to sit here. A taproom hearth is bigger than a house chimney
     but nothing like a forge: a 6-puff pool, a soft pale plume.
     DETERMINISM: the retired loop's 12 draws (2 rr + 1 rnd + 1 pick per
     puff, 3 puffs) are made here in the same order over the same ranges,
     four of them genuinely used, so this fragment's stream is unchanged. */
  var tvJx=0, tvJz=0, tvPh=0, tvCol=0;
  for(var pf=0; pf<3; pf++){
    var jx = rr(-0.5,0.5)*pf, jz = rr(-0.5,0.5)*pf, sp = rnd()*3, gc = pick(GREYC);
    if(pf === 1){ tvJx = jx; tvJz = jz; tvPh = sp*2; tvCol = shade(gc, 0.10); }
  }
  registerSmokeEmitter(chimP[0]+tvJx*0.5, chimTopY+0.6, chimP[1]+tvJz*0.5, {
    kind:'tavern', n:8, life:6.0, rise:9.5, r0:0.40, r1:1.95,
    spread:0.34, sway:0.50, swirl:0.70, lean:0.60, phase:tvPh, col:tvCol
  });

  /* --- hanging tavern sign: post + bracket arm + suspended board, on the
     entrance (+x) face --- */
  var signZ = hallD*0.30;
  var postP = loc(x,z, hallW*0.5, signZ, ry);
  CYL(postP[0], y1, postP[1], 0.18, h1*0.62, 0, shade(doorCol,-0.2), 'wood');
  var armY = y1+h1*0.60;
  var armP = loc(x,z, hallW*0.5+0.8, signZ, ry);
  BOX(armP[0], armY, armP[1], 1.6, 0.14, 0.14, ry, shade(doorCol,-0.15), 'wood');
  var hangP = loc(x,z, hallW*0.5+1.55, signZ, ry);
  CYL(hangP[0], armY-1.1, hangP[1], 0.05, 1.1, 0, shade(doorCol,-0.3), 'metal');
  BOX(hangP[0], armY-1.7, hangP[1], 0.12, 1.1, 1.5, ry, shade(pick(ROOFS),-0.05), 'wood');

  /* --- exterior stair to the upper floor, along the +z flank, ending at a
     balcony door on the upper storey --- */
  var stairSteps = 7, stepDepth = 1.3;
  var stairX0 = -hallW*0.06, stairX1 = hallW*0.30;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, h1*st);
    var sz = hallD*0.5 + stepDepth*0.5 + 0.15;
    var sp2 = loc(x,z, sx, sz, ry);
    BOX(sp2[0], y1, sp2[1], (stairX1-stairX0)/stairSteps*1.25, stepH, stepDepth, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorUpP = loc(x,z, stairX1, hallD*0.5+0.05, ry);
  BOX(doorUpP[0], y1+h1*0.90, doorUpP[1], 1.4, 2.4, 0.4, ry, doorCol, 'wood');

  /* --- doors: a grand double door at the entrance, a second door on the
     rear (-x) wall straight into the beer garden --- */
  var dw = 1.5, dh = 3.4;
  [-1,1].forEach(function(s){
    var dp = loc(x,z, hallW*0.5+0.05, s*dw*0.52, ry);
    BOX(dp[0], y1, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  });
  var lintelP = loc(x,z, hallW*0.5+0.08, 0, ry);
  BOX(lintelP[0], y1+dh, lintelP[1], 0.5, 0.5, dw*2.2, ry, frameCol);
  var gardenDoorP = loc(x,z, -hallW*0.5-0.05, 0, ry);
  BOX(gardenDoorP[0], y1, gardenDoorP[1], 0.5, 3.0, 1.8, ry, doorCol, 'wood');

  /* --- windows: generous, both floors, every face (this session's own
     standard — see monasteryOpenings/monasteryDorm above) --- */
  var winY1 = y1+h1*0.30;
  [-1,1].forEach(function(s){
    var wp = loc(x,z, hallW*0.5+0.05, s*hallD*0.30, ry);
    monasteryWindow(wp[0], wp[1], winY1, ry, 1.5, 2.4, true, frameCol, paneCol);
  });
  [-1,1].forEach(function(s){
    [-0.30, 0.12].forEach(function(t3){
      var wp2 = loc(x,z, hallW*t3, s*(hallD*0.5+0.05), ry);
      monasteryWindow(wp2[0], wp2[1], winY1, ry, 1.3, 2.1, false, frameCol, paneCol);
    });
  });
  var winY2 = y2+h2*0.30, nUpFront = 3;
  for(var i2=0;i2<nUpFront;i2++){
    var t4 = (i2-(nUpFront-1)/2)*(upperD*0.28);
    var wp3 = loc(x,z, upperW*0.5+0.05, t4, ry);
    monasteryWindow(wp3[0], wp3[1], winY2, ry, 1.2, 1.9, true, frameCol, paneCol);
  }
  [-1,1].forEach(function(s){
    var wp4 = loc(x,z, 0, s*(upperD*0.5+0.05), ry);
    monasteryWindow(wp4[0], wp4[1], winY2, ry, 1.2, 1.8, false, frameCol, paneCol);
  });

  /* ==================== attached beer garden (local -x, behind the hall) ===
     Fenced on 3 sides, open on the 4th where it meets the hall's own rear
     door — tables + benches (reusing benchPlain, above, not a parallel
     prop), a post-and-beam trellis with FRUITC vines, a stack of casks in
     the far corner, and a few potted shrubs along the fence. */
  var gardenDepth = opt.gardenDepth || 17, gardenW = opt.gardenW || hallD*1.05;
  var gcp = loc(x,z, -hallW*0.5-gardenDepth*0.5, 0, ry);
  var gardenCx = gcp[0], gardenCz = gcp[1];
  var half = gardenDepth*0.5;
  var fenceH = 1.1, fenceCol = shade(doorCol,-0.1);

  [-1,1].forEach(function(s){
    var p = loc(gardenCx,gardenCz, 0, s*gardenW*0.5, ry);
    BOX(p[0], y1, p[1], gardenDepth, fenceH, 0.25, ry, fenceCol, 'wood');
  });
  var farP = loc(gardenCx,gardenCz, -half, 0, ry);
  BOX(farP[0], y1, farP[1], 0.25, fenceH, gardenW, ry, fenceCol, 'wood');

  /* trellis: trellisN post-and-beam frames straddling the garden's depth,
     spread across its width, with a few hanging FRUITC vine blobs */
  var trellisN = 4, postH = 2.6, beamY = y1+postH;
  for(var tp2=0; tp2<trellisN; tp2++){
    var tz = (tp2-(trellisN-1)/2)*(gardenW*0.20);
    [-1,1].forEach(function(sgn){
      var pp2 = loc(gardenCx,gardenCz, sgn*gardenDepth*0.28, tz, ry);
      CYL(pp2[0], y1, pp2[1], 0.16, postH, 0, fenceCol, 'wood');
    });
    var bp2 = loc(gardenCx,gardenCz, 0, tz, ry);
    BOX(bp2[0], beamY, bp2[1], gardenDepth*0.62, 0.14, 0.14, ry, fenceCol, 'wood');
  }
  for(var v=0; v<8; v++){
    var vx = gardenCx + rr(-gardenDepth*0.30, gardenDepth*0.30);
    var vz = gardenCz + rr(-gardenW*0.42, gardenW*0.42);
    BLOB(vx, beamY-0.3, vz, rr(0.4,0.8), rr(0.3,0.5), rnd()*3, pick(FRUITC), 'leaf');
  }

  /* tables + benches under the trellis */
  var nTables = 3;
  for(var tt=0; tt<nTables; tt++){
    var ttz = (tt-(nTables-1)/2)*(gardenW*0.26);
    var ttp = loc(gardenCx,gardenCz, 0, ttz, ry);
    tavernTable(ttp[0], y1, ttp[1], ry, shade(doorCol,-0.05));
    [-1,1].forEach(function(s){
      var bpP = loc(gardenCx,gardenCz, 0, ttz + s*1.1, ry);
      benchPlain(bpP[0], y1, bpP[1], ry, shade(doorCol,-0.1), {w:2.0});
    });
  }

  /* casks stacked in the garden's far corner — the clearest "tavern" signal
     outside the hanging sign itself */
  var barrelCol = shade(TRUNKC[0], -0.05);
  var bc1 = loc(gardenCx,gardenCz, -gardenDepth*0.36, gardenW*0.40, ry);
  var h0 = tavernBarrel(bc1[0], y1, bc1[1], barrelCol);
  tavernBarrel(bc1[0], y1+h0*0.92, bc1[1], barrelCol);
  var bc2 = loc(gardenCx,gardenCz, -gardenDepth*0.28, gardenW*0.32, ry);
  tavernBarrel(bc2[0], y1, bc2[1], barrelCol);

  /* potted shrubs along the near (hall-facing) fence line */
  for(var pl=0; pl<4; pl++){
    var plz = (pl-1.5)*(gardenW*0.22);
    var plP = loc(gardenCx,gardenCz, gardenDepth*0.46, plz, ry);
    BLOB(plP[0], y1+0.2, plP[1], rr(0.7,1.1), rr(0.7,1.0), rnd()*3, pick(FRUITC), 'leaf');
  }

  var doorThreshold = loc(x,z, hallW*0.5+0.3, 0, ry);
  return {
    x:x, z:z, ry:ry,
    fx: hallW*0.5+gardenDepth+1, fz: Math.max(hallD,gardenW)*0.5+2,
    gardenCx:gardenCx, gardenCz:gardenCz,
    doorX:doorThreshold[0], doorZ:doorThreshold[1]
  };
}

/* ============================== HOUSE OF HEALING ==============================
   The owner: "This looks like a canton but is about 1/4 the footprint. There
   is a square inner atrium looking out on an inner garden; the atrium is
   lined with cloisters. Has entrances on all 4 sides." Read monoCanton() /
   platCanton() / templeCanton() (50-cantons.js, this same file) first — the
   vocabulary borrowed here is theirs: an FR8 battered foundation skirt, a
   tiered stack with cornice bands, corner turret-and-cap finials, doors set
   at the real entrance level. The smallest real plat canton (Granary,
   30-layout.js: r:122) is the footprint reference — "about 1/4 the
   footprint" is 1/4 the AREA, i.e. half the linear radius: this building's
   own outerHW default (56) is Granary's r halved (61) rounded down a touch
   for a tidier number, giving a (112/244)^2 = 0.21 footprint ratio, "about
   1/4". It is NOT a solid tapering block like a real canton, though — the
   centre has to stay open sky above the garden, so the canton silhouette is
   built as a hollow SQUARE RING per tier (four wall segments meeting at
   corners, not one solid FR8 body), with a separate cloister arcade ring
   (the exact pier/arch idiom from this session's own monasteryAssemblyHall,
   61-monastery.js — open bays, box piers, dome arch caps) one layer further
   in, bordering the open garden at the very centre.

   The real bug monasteryAssemblyHall found and fixed (a single full-square
   roof slab silently roofing over the garden underneath it) is guarded
   against the same way here: the ambulatory roof between the outer wall and
   the cloister pier line is built as 4 separate per-side slabs that stop
   well short of the garden's own half-width, never one slab spanning the
   whole footprint. Confirmed by a straight-down screenshot (see the report),
   not assumed.

   Entrances are REAL walk-through gaps (jambs flank a genuine opening, the
   idiom used everywhere else this session — monasteryCompound's gates,
   tavern()'s own doors above) on all 4 sides, unlike monoCanton's own
   plinthDoor() (a decorative inset on a solid wall, fine for a canton
   nobody actually walks into, wrong for a building whose whole point is a
   walkable atrium).

   Existing (shape,family) buckets only: box|stone(default), fr8|stone
   (default), fr8|roof, dome|dome, blob|leaf — all already live elsewhere in
   this file (monoCanton/templeCanton/monasteryAssemblyHall). Zero new draw
   calls. */
reseed(658001);   /* unique fragment seed for this new section, per the brief. */

/* houseOfHealing(x, y, z, ry, col, opt) — x,y,z is the WHOLE building's own
   centre (the atrium/garden's centre too — unlike tavern()'s off-centre
   garden, this one is the structure's middle), y the ground/base reference.
   ry is the facing used for side indexing only (the building is square with
   an entrance on every side, so no one face is more "the front" than
   another) — kept for contract consistency with every other builder in this
   file. col is the wall stone tone (falls back to pick(TONES)).

   Returns { x, z, ry, fx, fz, gardenCx, gardenCz } — fx/fz are half-extents
   of a square centred at (x,z) that contains the whole building (for
   claim()); gardenCx/gardenCz is the atrium garden's own centre, which here
   is just (x,z) again, returned explicitly for contract parity with
   tavern()'s gardenCx/gardenCz and monasteryAssemblyHall's courtCx/courtCz. */
function houseOfHealing(x, y, z, ry, col, opt){
  opt = opt || {};
  var outerHW = opt.hw || 56;           /* ~1/4 the footprint of the smallest real plat canton */
  var wallT = opt.wallT || 4.2;
  var wallCol = col || pick(TONES);
  /* owner: "fix 2nd floor house of healing so its floor uses a dark stone
     tile rather than the current green" — this ring, the ambulatory roof
     between the outer wall and the cloister pier line, is what reads from
     above as the upper storey's floor. pick(ROOFS) was drawing it from the
     ordinary roof palette, whose olive entry (0x6b7a4a) is what came up
     here and made the whole ring read as lawn — actively confusing next to
     the real lawn in the courtyard below it. Pinned to a dark stone tone
     instead, so the garden is the only green in the building. */
  var roofCol = opt.roofCol || shade(GREYC[1], -0.18);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(roofCol, 0.15);
  var plinthTop = opt.plinthTop || 6, tier0H = opt.tier0H || 13, tier1H = opt.tier1H || 9.5;
  var gateGapFrac = opt.gateGapFrac || 0.30;

  var cloisterHW = outerHW*0.62;            /* the arcade pier line — bounds the atrium */
  var gardenHW = cloisterHW*0.66;           /* the open lawn inside the pier line */

  /* --- foundation: a solid battered skirt under the WHOLE footprint, same
     as every canton's own bed/plinthTop — safe to be solid because it sits
     entirely below y1 (the real ground/atrium floor), not near the roofline
     where the assembly-hall bug actually lived. */
  FR8(x, y, z, outerHW*2*1.06, plinthTop, outerHW*2*1.06, ry, shade(wallCol,-0.24));
  BOX(x, y+plinthTop-1.2, z, outerHW*2*1.11, 2.2, outerHW*2*1.11, ry, shade(wallCol,-0.34));

  var y1 = y + plinthTop;                   /* atrium/garden/door floor level */
  var sideLen = outerHW*2;
  var gap = sideLen*gateGapFrac, segL = (sideLen-gap)*0.5, segCenterT = gap*0.5 + segL*0.5;

  /* --- outer ring, tier 0: 4 sides, each two battered wall segments
     flanking a real gated entrance, a pilaster pair, a small arch cap on
     the cornice, and a short entry stair. Uses its own per-side rotation
     (ry + f*90deg) so every side is built with the same loc()-relative code
     the rest of this file uses — not a fixed world-axis scheme like
     monoCanton's own (cantons never rotate; this building can). */
  for(var f=0; f<4; f++){
    var sideRy = ry + f*Math.PI/2;
    [-1,1].forEach(function(s){
      var o = loc(x,z, outerHW, s*segCenterT, sideRy);
      FR8(o[0], y1, o[1], wallT, tier0H, segL, sideRy, wallCol);
    });
    /* cornice band, doubling as the lintel bridging the gate opening below it */
    var cb = loc(x,z, outerHW, 0, sideRy);
    BOX(cb[0], y1+tier0H-0.6, cb[1], wallT*1.3, 1.3, sideLen*1.02, sideRy, shade(wallCol,-0.16));
    /* small arch flourish over the gate, on top of the cornice/lintel */
    var gp = loc(x,z, outerHW, 0, sideRy);
    DOME(gp[0], y1+tier0H+0.7, gp[1], gap*0.28, gap*0.15, sideRy, shade(wallCol,-0.08));
    /* pilasters flanking the real opening */
    [-1,1].forEach(function(s){
      var pp = loc(x,z, outerHW+0.4, s*(gap*0.5+1.0), sideRy);
      BOX(pp[0], y1, pp[1], wallT*0.5, tier0H*0.80, 1.6, sideRy, shade(wallCol,0.06));
    });
    /* a short entry stair, stacked boxes of increasing height nearest the
       door — same idiom as tavern()'s own exterior stair, above */
    var nSteps = 3;
    for(var si=0; si<nSteps; si++){
      var t = (si+1)/nSteps;
      var stepOut = outerHW + (nSteps-si)*1.4;
      var sp = loc(x,z, stepOut, 0, sideRy);
      BOX(sp[0], y, sp[1], 1.4, Math.max(0.5,plinthTop*t), gap*0.62, sideRy, shade(wallCol,-0.05));
    }

    /* --- tier 1: one continuous recessed wall per side (no gate needed up
       here), windows looking both outward (street) and inward (the atrium/
       garden — "the atrium looking out on an inner garden" reads both ways:
       the gallery above the cloister looks down into it too), a cornice,
       and a corner turret-and-dome finial. */
    var y2 = y1 + tier0H + 1.0;
    var tier1HW = outerHW*0.94;
    var t1p = loc(x,z, tier1HW, 0, sideRy);
    FR8(t1p[0], y2, t1p[1], wallT*0.9, tier1H, sideLen*0.96, sideRy, shade(wallCol,0.03));
    var nWin = 4;
    for(var wi=0; wi<nWin; wi++){
      var wt_ = (wi-(nWin-1)/2)*(sideLen*0.19);
      var wpOut = loc(x,z, tier1HW+0.05, wt_, sideRy);
      monasteryWindow(wpOut[0], wpOut[1], y2+tier1H*0.30, sideRy, 1.3, 2.0, true, frameCol, paneCol);
      var wpIn = loc(x,z, tier1HW-wallT*0.9-0.05, wt_, sideRy);
      monasteryWindow(wpIn[0], wpIn[1], y2+tier1H*0.30, sideRy, 1.2, 1.9, true, frameCol, paneCol);
    }
    var y3 = y2 + tier1H;
    var cb2 = loc(x,z, tier1HW, 0, sideRy);
    BOX(cb2[0], y3-0.5, cb2[1], wallT*1.3, 1.0, sideLen*0.98, sideRy, shade(wallCol,-0.18));

    /* --- ambulatory roof, ONE PER SIDE, stopping short of the pier line —
       never a single slab spanning the whole footprint (that is exactly
       the bug monasteryAssemblyHall's own comment warns against: it would
       silently roof over the garden underneath). */
    var roofInner = cloisterHW + wallT*0.6, roofOuter = outerHW - wallT*0.5;
    var roofSpan = roofOuter - roofInner;
    if(roofSpan > 1){
      var roofMidT = (roofInner+roofOuter)*0.5;
      var rp = loc(x,z, roofMidT, 0, sideRy);
      FR8(rp[0], y1+tier0H-0.2, rp[1], roofSpan+1.0, 1.3, sideLen*0.96, sideRy, roofCol, 'roof');
    }
  }

  /* corner turret-and-dome finials, above tier 1's own roofline, well clear
     of the garden at the centre */
  for(var cf=0; cf<4; cf++){
    var cAng = ry + cf*Math.PI/2;
    var cp = loc(x,z, outerHW-1, outerHW-1, cAng);
    FR8(cp[0], y1+tier0H+1.0, cp[1], 5.0, tier1H+3.0, 5.0, cAng, shade(wallCol,0.05));
    DOME(cp[0], y1+tier0H+1.0+tier1H+3.0, cp[1], 3.2, 2.6, cAng, pick(DOMEC), 'dome');
  }

  /* --- the cloister arcade: the exact pier/open-bay/arch idiom from
     monasteryAssemblyHall's own courtyard (61-monastery.js), one ring,
     centred here rather than offset. Real open gaps between piers — a
     genuine walk-through colonnade — each bay capped with a shallow arch. */
  var courtSpan = cloisterHW*2;
  var archW = courtSpan/5, pierW = archW*0.22, archH = tier0H*0.82;
  var cloisterCol = shade(wallCol,0.02);
  [ {lx:0, lz:-courtSpan*0.5, along:'x'}, {lx:0, lz:courtSpan*0.5, along:'x'},
    {lx:-courtSpan*0.5, lz:0, along:'z'}, {lx:courtSpan*0.5, lz:0, along:'z'} ].forEach(function(side){
    var nBay = 5;
    for(var b=0;b<nBay;b++){
      var bt = (b-(nBay-1)/2) * archW;
      var pp = side.along==='x' ? loc(x,z, bt-archW*0.5+pierW*0.5, side.lz, ry)
                                 : loc(x,z, side.lx, bt-archW*0.5+pierW*0.5, ry);
      var pierRy = side.along==='x' ? ry : ry+Math.PI/2;
      BOX(pp[0], y1, pp[1], pierW, archH, wallT*0.75, pierRy, cloisterCol);
      var archP = side.along==='x' ? loc(x,z, bt, side.lz, ry) : loc(x,z, side.lx, bt, ry);
      DOME(archP[0], y1+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, cloisterCol);
    }
  });

  /* --- the inner garden: open to the sky (verified by screenshot, not
     assumed) — a lawn patch, a scatter of herb/shrub plantings (FRUITC,
     this session's own "planting helper" per the tavern brief), a central
     well reused outright from monasteryWell() (61-monastery.js) rather than
     a parallel fountain prop, and a couple of benches. */
  var gardenCx = x, gardenCz = z;
  /* owner: "the house of healing surfaces seem switched, put the garden in
     the center and paved surface on the outer cloisters, not vice versa."
     Real bug: the only floor finish in here was one green slab covering
     just gardenHW (0.66 of the cloister radius), with NOTHING paving the
     ambulatory ring — so the bare foundation skirt's own dark stone read
     through everywhere the green didn't reach, and from above the green
     band looked like it belonged to the outer ring while the middle read
     as paving. Fixed both ways round: the lawn now covers the FULL atrium
     interior out to the pier line, and the ambulatory between the pier
     line and the outer wall gets real paving of its own. Paving is laid
     as 4 per-side slabs, never one footprint-spanning slab — same
     discipline the ambulatory roof above already follows, so nothing can
     accidentally cover the garden.
     Second real bug, found by instance probe after the first attempt still
     looked wrong: the plinth cornice band on line ~3786 is a FULL-footprint
     box (outerHW*2*1.11 wide, 2.2 tall) based at y1-1.2, so its top face
     lands at y1+1.0 — ABOVE both floor finishes, which were sitting at
     y1-0.05 with 0.30 of height (top y1+0.25). That dark cap, not the
     lawn, was what actually read as "the courtyard floor" from above, and
     it buried the garden slab entirely. Everything at floor level is now
     referenced off floorY (just clear of that cap) instead of y1. */
  var floorY = y1 + 1.05;
  var paveInner = cloisterHW + wallT*0.35, paveOuter = outerHW - wallT*0.5;
  var paveSpan = paveOuter - paveInner;
  if(paveSpan > 1){
    var paveCol = shade(wallCol,-0.10);
    for(var pv=0; pv<4; pv++){
      var pvRy = ry + pv*Math.PI/2;
      var pvp = loc(x,z, (paveInner+paveOuter)*0.5, 0, pvRy);
      BOX(pvp[0], floorY-0.30, pvp[1], paveSpan, 0.30, paveOuter*2*0.99, pvRy, paveCol);
    }
  }
  /* brighter than the 0x4f6b3a first used here: the atrium is enclosed by
     a 13-unit wall ring and a full arcade, so it sits in its own shadow
     most of the day and the darker green read as near-black paving from
     above — measured, not guessed (a live instance probe confirmed the
     slab was centred and correctly sized, so colour was the only thing
     left that could make it read wrong). */
  BOX(gardenCx, floorY-0.28, gardenCz, cloisterHW*2*0.99, 0.30, cloisterHW*2*0.99, ry, 0x7da24e, 'plaster');
  for(var g=0; g<12; g++){
    var ga = g*(Math.PI*2/12), gr = cloisterHW*0.74;   /* spread over the full lawn, not the old smaller patch */
    var gpp = loc(gardenCx,gardenCz, Math.cos(ga)*gr, Math.sin(ga)*gr, ry);
    BLOB(gpp[0], floorY+0.10, gpp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, pick(FRUITC), 'leaf');
  }
  monasteryWell(gardenCx, floorY, gardenCz, Math.min(2.4, gardenHW*0.12), ry);
  [-1,1].forEach(function(s){
    var bp = loc(gardenCx,gardenCz, 0, s*gardenHW*0.42, ry+Math.PI/2);
    benchPlain(bp[0], floorY+0.02, bp[1], ry+Math.PI/2, shade(wallCol,-0.1), {});
  });

  return { x:x, z:z, ry:ry, fx:outerHW+4, fz:outerHW+4, gardenCx:gardenCx, gardenCz:gardenCz };
}

/* ============================== GRANARY / MILLS / BEETLE RANCH ==============
   Owner, verbatim: "make a granary building model but do not place. make
   wind and water mill models with working animation but do not place. make
   a beetle ranch model but do not place. screenshot all these to myshots
   when done." Four new model FUNCTIONS only — nothing below is called into
   the live build. Same contract as tavern()/houseOfHealing() above: a
   caller elsewhere places one by calling it directly with real world
   coordinates, then reserves the returned footprint via claim()/reserve().
   None of these self-claim. */

/* ------------------------------ GRANARY -------------------------------
   This world already has a canton literally named 'Granary' (30-layout.js)
   so this reads as real grain storage, not a generic barn: a raised floor
   on staddle-stone posts (keeps grain off the wet ground — real staddle-
   barn practice), a tall, almost windowless storage mass (a few high
   louvre vents instead of ordinary windows), a big hoist-served loading
   door under a jutting hoist beam + pulley, an external stair up to the
   raised floor's own entrance, and a steep pyramidal roof (fr6, a
   noticeably stronger taper than an ordinary hlaalu parapet or tavern hip).

   granary(x, y, z, ry, col, opt) — x,y,z is the ground-level centre (y the
   true ground reference, same convention as every builder in this file);
   ry is the entrance facing, local +x, world ry. col is the wall stone
   tone (falls back to pick(TONES)). opt may override w/d/staddleH/wallH/
   roofH/roofCol.

   Returns { x, z, ry, fx, fz, doorX, doorZ } — fx/fz are half-extents of a
   rectangle centred at (x,z) that safely contains the whole building
   (deck overhang included); doorX/doorZ is the ground-level threshold at
   the foot of the external stair, for a caller's pedestrian approach
   point.

   Existing (shape,family) buckets only: box|stone(default), box|wood,
   cyl|stone(default), cyl|wood, cyl|metal, fr6|roof — all already live
   elsewhere in this file. Zero new draw calls. */
reseed(659001);   /* unique fragment seed for this new section, per the brief. */

function granary(x, y, z, ry, col, opt){
  opt = opt || {};
  var granW = opt.w || 13, granD = opt.d || 10.5;
  var staddleH = opt.staddleH || 2.6, wallH = opt.wallH || 10.5, roofH = opt.roofH || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.10);
  var ventCol = shade(TRUNKC[0], -0.35);

  /* --- staddle stones: a grid of short mushroom-capped posts holding the
     floor clear of the ground (post + a wider flat cap disc). ---------- */
  var nPx = 4, nPz = 3, postR = 0.42, postH = staddleH*0.74, capH = staddleH*0.22;
  for(var pi=0; pi<nPx; pi++){
    for(var pj=0; pj<nPz; pj++){
      var plx = (pi/(nPx-1)-0.5) * (granW*0.78);
      var plz = (pj/(nPz-1)-0.5) * (granD*0.72);
      var pp = loc(x,z, plx, plz, ry);
      CYL(pp[0], y, pp[1], postR, postH, 0, shade(wallCol,-0.10));
      CYL(pp[0], y+postH, pp[1], postR*2.0, capH, 0, shade(wallCol,-0.02));
    }
  }

  /* --- raised floor deck: overhangs the walls slightly all round (also
     sheds rain clear of the staddles). ---------------------------------- */
  var yDeck = y + staddleH;
  BOX(x, yDeck, z, granW, 0.7, granD, ry, woodCol, 'wood');
  var y2 = yDeck + 0.7;

  /* --- storage mass: tall, almost windowless. ------------------------- */
  BOX(x, y2, z, granW*0.92, wallH, granD*0.92, ry, wallCol);
  BOX(x, y2+wallH-0.6, z, granW*0.96, 1.1, granD*0.96, ry, shade(wallCol,-0.14));   // cornice

  /* --- high louvre vents, both long faces and both gables — never a real
     window, just slatted airflow slits near the top of the mass. ------- */
  [ {lx: granW*0.46+0.05}, {lx:-granW*0.46-0.05} ].forEach(function(f){
    for(var vi=0; vi<3; vi++){
      var vt = (vi-1)*(granD*0.26);
      var vp = loc(x,z, f.lx, vt, ry);
      BOX(vp[0], y2+wallH*0.74, vp[1], 0.30, 1.5, 1.1, ry, ventCol, 'wood');
    }
  });
  [ {lz: granD*0.46+0.05}, {lz:-granD*0.46-0.05} ].forEach(function(f){
    for(var vi2=0; vi2<2; vi2++){
      var vt2 = (vi2-0.5)*(granW*0.32);
      var vp2 = loc(x,z, vt2, f.lz, ry);
      BOX(vp2[0], y2+wallH*0.74, vp2[1], 1.1, 1.5, 0.30, ry, ventCol, 'wood');
    }
  });

  /* --- steep pyramidal roof — strong taper (fr6). --------------------- */
  var eaveY = y2+wallH;
  FR6(x, eaveY, z, granW*1.02, roofH, granD*1.02, ry, roofCol, 'roof');

  /* --- upper hoist door + jutting hoist beam: the clearest "granary"
     signal after the staddle stones — sacks are hauled straight up into
     the loft rather than carried through the ground-level door. ------- */
  var hoistY = y2 + wallH*0.62, doorH = 3.2;
  var hoistDp = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(hoistDp[0], hoistY, hoistDp[1], 0.5, doorH, 2.0, ry, shade(woodCol,-0.15), 'wood');
  var beamLen = 3.4, beamY = hoistY + doorH + 1.0;
  var beamP = loc(x,z, granW*0.46+beamLen*0.5, 0, ry);
  BOX(beamP[0], beamY, beamP[1], beamLen, 0.45, 0.45, ry, woodCol, 'wood');
  var pulleyP = loc(x,z, granW*0.46+beamLen-0.3, 0, ry);
  CYL(pulleyP[0], beamY-0.9, pulleyP[1], 0.22, 0.5, 0, shade(ventCol,0.15), 'metal');
  CYL(pulleyP[0], y2, pulleyP[1], 0.05, (beamY-0.9)-y2, 0, shade(ventCol,0.25), 'metal');   // rope down to loading level

  /* --- main entrance at deck level, reached by an external stair along
     the +z flank (same stacked-box idiom tavern()'s own stair uses). --- */
  var doorP = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(doorP[0], yDeck, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var stairSteps = 6, stairX0 = granW*0.02, stairX1 = granW*0.40;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, staddleH*st);
    var sz = granD*0.5 + 0.65 + 0.15;
    var sp = loc(x,z, sx, sz, ry);
    BOX(sp[0], y, sp[1], (stairX1-stairX0)/stairSteps*1.3, stepH, 1.3, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorThreshold = loc(x,z, stairX1+1.0, granD*0.5+1.3, ry);

  return {
    x:x, z:z, ry:ry,
    fx: granW*0.5+1.0, fz: granD*0.5+2.2,
    doorX: doorThreshold[0], doorZ: doorThreshold[1]
  };
}

/* ============================== MILL ANIMATION RIG ==========================
   windmill()/watermill() (below) are DEFINED but NOT PLACED this pass. A
   future caller places one by calling windmill(x,y,z,ry,col,opt) or
   watermill(x,y,z,ry,col,opt) with real world coordinates — each call
   internally registers its own moving parts (sail blades / wheel paddles)
   into MILL_CLUSTERS via registerMillCluster(), below, which just marks
   this rig dirty. This file's own self-contained requestAnimationFrame
   loop (millLoop, bottom of this section — the same independent "own
   clock, own tick()" idiom 84-fauna.js's faunaLoop and 82-daynight.js's
   dayNightLoop already use, since this file may not touch either of
   those) notices the dirty flag and (re)builds ONE shared InstancedMesh
   sized to the exact current blade/paddle count. Consequences:
     - right now, nothing has ever called windmill()/watermill(), so
       MILL_CLUSTERS stays empty forever -> the mesh is never created ->
       zero added draw calls, zero added instances, zero added triangles
       (checked live — see the report for this pass).
     - a future caller placing even one windmill or watermill, from ANY
       fragment (this is one shared global scope), causes the very next
       animation frame to build the mesh and start it spinning — no other
       file needs editing, and nothing needs to run in a specific order.

   One shared unit-bar geometry (pivot at the base, tip at local y=1 —
   the exact same "long thin box hung/rotated from one fixed edge" trick
   82-daynight.js's own guild-clock hands use, right down to the
   setFromUnitVectors(localY, liveDirection) math) is reused for BOTH a
   sail blade (pivot at the hub, radiating out to the tip) and a water-
   wheel paddle (same pivot-to-tip radiating bar, just short and offset
   out near the rim instead of starting at the hub) — one InstancedMesh,
   one draw call total for every sail and every water wheel ever placed
   in the city, however many that turns out to be. Per-instance colour
   (setColorAt, the exact pattern emitBuckets() and 82-daynight's nlMesh
   already use) lets sails and paddles carry their own wood tone without
   a second mesh. */
var MILL_CLUSTERS = [];      // { x,y,z, ry(axis), n, len, w, t, spin, phase, innerR, col }
var MILL_BLADE_BASE = [];    // parallel to MILL_CLUSTERS: each cluster's first instance slot
var MILL_TOTAL = 0, MILL_DIRTY = false, MILL_T = 0;

/* registers one rotating cluster (a windmill's 4 sails, or a water
   wheel's ring of paddles) and marks the shared rig dirty so the next
   animation frame rebuilds millMesh to include it. x,y,z is the hub/axle
   centre; axisRy is the facing whose "wall normal" convention (cos ry,0,
   -sin ry) IS the true rotation axis (see updateMills()'s own comment for
   the derivation) — for a windmill that's the sail hub's own ry, for a
   water wheel it's the flank wall's ry+90deg. n is blade/paddle count,
   len/w/t its scale (radial length, and the two cross-section
   dimensions), spin is radians/sec, innerR offsets the bar's start point
   out from the hub (0 for sails radiating from the hub itself; a
   fraction of the wheel radius for paddles that only occupy the rim). */
function registerMillCluster(x, y, z, axisRy, n, len, w, t, spin, innerR, col){
  MILL_CLUSTERS.push({ x:x, y:y, z:z, ry:axisRy, n:n, len:len, w:w, t:t,
                        spin:spin, phase:rr(0, Math.PI*2), innerR:innerR||0,
                        col: col || 0xffffff });
  MILL_DIRTY = true;
}

var millBarGeo = new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);   // pivot at base, tip at local y=1
var millMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
var millMesh = null;

function millRebuild(){
  if(millMesh) scene.remove(millMesh);   // millBarGeo/millMat are shared — never disposed here
  MILL_TOTAL = 0; MILL_BLADE_BASE = [];
  MILL_CLUSTERS.forEach(function(c){ MILL_BLADE_BASE.push(MILL_TOTAL); MILL_TOTAL += c.n; });
  MILL_DIRTY = false;
  if(MILL_TOTAL === 0){ millMesh = null; return; }
  millMesh = new THREE.InstancedMesh(millBarGeo, millMat, MILL_TOTAL);
  millMesh.userData.inspectLabel = 'Mill rotor';
  millMesh.frustumCulled = false;
  scene.add(millMesh);
}

var _milM = new THREE.Matrix4(), _milQ = new THREE.Quaternion(), _milS = new THREE.Vector3(1,1,1);
var _milP = new THREE.Vector3(), _milUp = new THREE.Vector3(0,1,0), _milTangent = new THREE.Vector3();
var _milDir = new THREE.Vector3(), _milCol = new THREE.Color();
function updateMills(dt){
  MILL_T += dt;
  if(MILL_DIRTY) millRebuild();
  if(!millMesh) return;   // dormant/no-op: nothing has ever registered
  MILL_CLUSTERS.forEach(function(c, ci){
    var base = MILL_BLADE_BASE[ci];
    /* "along the wall" tangent for ry — loc()'s own convention, the same
       derivation 82-daynight's updateGuildClock() uses for its hands; the
       rotation plane (up, tangent) is exactly perpendicular to the wall's
       own outward normal (cos ry,0,-sin ry), which is what makes that
       normal the real physical rotation axis here too. */
    _milTangent.set(Math.sin(c.ry), 0, Math.cos(c.ry));
    _milCol.set(c.col);
    for(var i=0;i<c.n;i++){
      var theta = c.phase + MILL_T*c.spin + i*(Math.PI*2/c.n);
      _milDir.copy(_milUp).multiplyScalar(Math.cos(theta)).addScaledVector(_milTangent, Math.sin(theta));
      _milQ.setFromUnitVectors(_milUp, _milDir);
      _milP.set(c.x + _milDir.x*c.innerR, c.y + _milDir.y*c.innerR, c.z + _milDir.z*c.innerR);
      _milS.set(c.w, c.len, c.t);
      _milM.compose(_milP, _milQ, _milS);
      millMesh.setMatrixAt(base+i, _milM);
      millMesh.setColorAt(base+i, _milCol);
    }
  });
  millMesh.instanceMatrix.needsUpdate = true;
  if(millMesh.instanceColor) millMesh.instanceColor.needsUpdate = true;
}

/* this file's own tiny render loop — same shape as 84-fauna.js's
   faunaLoop/82-daynight.js's dayNightLoop (own performance.now() delta,
   own requestAnimationFrame chain) — genuinely free to run every frame
   while MILL_CLUSTERS is empty: updateMills() returns immediately after
   the dt accumulation, no THREE work happens. */
(function millLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateMills(dt);
  }
  requestAnimationFrame(tick);
})();

window._mills = { clusters: function(){ return MILL_CLUSTERS.length; },
                   instances: function(){ return MILL_TOTAL; },
                   built: function(){ return !!millMesh; } };

/* ------------------------------ WINDMILL -------------------------------
   windmill(x, y, z, ry, col, opt) — x,y,z is ground level at the tower's
   own centre; ry is the entrance/sail facing, local +x, world ry. col is
   the tower stone tone (falls back to pick(TONES)). opt may override
   r/h/spin.

   Returns { x, z, ry, fx, fz, doorX, doorZ }.

   A future caller "turns on" the animation simply by calling this
   function with real coordinates — the sail hub it builds registers
   itself into MILL_CLUSTERS internally (see registerMillCluster() call
   below); nothing else is required.

   Existing (shape,family) buckets only for the static tower/cap/door/
   windows: cyl|stone(default), cyl|wood, box|wood, cone|roof, plus
   monasteryWindow's own box/dome — all already live elsewhere in this
   file. The 4 sails themselves are NOT built here at all — they are
   100% the shared animated rig above. Zero new static draw calls; the
   ONE animated draw call is shared with watermill(), below. */
function windmill(x, y, z, ry, col, opt){
  opt = opt || {};
  var baseR = opt.r || 5.2, towerH = opt.h || 17;
  var wallCol = col || pick(TONES);
  var capCol = opt.capCol || shade(TRUNKC[0], -0.05);
  var woodCol = shade(TRUNKC[0], -0.05);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  /* --- tapered stone tower, stacked round segments narrowing toward the
     cap (the round counterpart of structure()'s own 'velothi' segmented-
     taper idiom, cyl instead of fr8 so it reads as a mill, not a spire). */
  var segN = 4, segH = towerH/segN, ySeg = y, rSeg = baseR;
  for(var s=0; s<segN; s++){
    CYL(x, ySeg, z, rSeg, segH*1.03, ry, shade(wallCol, -0.04*s));
    ySeg += segH;
    CYL(x, ySeg-0.35, z, rSeg*1.06, 0.6, ry, shade(wallCol,-0.15));   // string-course ring
    rSeg *= 0.83;
  }
  var towerTopY = ySeg;

  /* --- cap: a squat cone, static — only the sails move. --------------- */
  var capR = rSeg*1.18, capH = capR*1.35;
  CONE(x, towerTopY, z, capR, capH, ry, capCol, 'roof');

  /* --- sail hub: a stub boss on the cap's front face. The 4 sail blades
     pivot here — registered into the shared animated rig, not built as
     static geometry. --------------------------------------------------- */
  var hubY = towerTopY + capH*0.38;
  var hubP = loc(x,z, capR*0.95, 0, ry);
  CYL(hubP[0], hubY-0.5, hubP[1], 0.55, 1.0, 0, shade(woodCol,-0.2), 'wood');

  var bladeLen = towerH*0.60, bladeW = bladeLen*0.15, bladeT = 0.22;
  registerMillCluster(hubP[0], hubY, hubP[1], ry, 4, bladeLen, bladeW, bladeT,
                       opt.spin || 0.55, 0, shade(woodCol, 0.10));

  /* --- door + a couple of storey windows up the tower ------------------ */
  var doorP = loc(x,z, baseR*0.98, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.7, ry, shade(woodCol,-0.15), 'wood');
  for(var wi=0; wi<2; wi++){
    var wy = y + towerH*(0.32+wi*0.28);
    var wr = baseR*(1-0.17*wi)*0.90;
    var wp = loc(x,z, wr, 0, ry);
    monasteryWindow(wp[0], wp[1], wy, ry, 1.1, 1.6, true, frameCol, paneCol);
  }

  return {
    x:x, z:z, ry:ry,
    fx: baseR+2, fz: baseR+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ------------------------------ WATERMILL -------------------------------
   watermill(x, y, z, ry, col, opt) — x,y,z is ground level at the mill
   building's own centre; ry is the entrance facing, local +x, world ry
   (same convention as every builder here). The water wheel is mounted on
   the local +z flank (world facing ry+90deg), the exact per-side loc()-
   relative convention houseOfHealing's own 4-sided loop, above, already
   uses. col is the wall stone tone (falls back to pick(TONES)). opt may
   override w/d/h/wheelR/wheelThick/spin.

   Returns { x, z, ry, fx, fz, doorX, doorZ }.

   Same activation contract as windmill(): calling this with real
   coordinates registers the wheel's paddles into the shared animated
   rig automatically — nothing else to wire up.

   Existing (shape,family) buckets only: box|stone (via structure()'s own
   'hlaalu' kind, reused outright rather than a parallel building shape),
   box|wood, cyl|wood, monasteryWindow's own box/dome. The paddles
   themselves are NOT built here — 100% the shared animated rig, the same
   one draw call windmill()'s sails share. */
function watermill(x, y, z, ry, col, opt){
  opt = opt || {};
  var millW = opt.w || 12, millD = opt.d || 9, wallH = opt.h || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.08);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  /* --- mill building: structure()'s own 'hlaalu' massing, reused
     outright rather than a parallel building shape. --------------------- */
  structure(x, y, z, millW, millD, wallH, ry, 'hlaalu', wallCol, { roof: roofCol });
  var doorP = loc(x,z, millW*0.5+0.05, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var winP = loc(x,z, 0, millD*0.5+0.05, ry);
  monasteryWindow(winP[0], winP[1], y+wallH*0.4, ry+Math.PI/2, 1.3, 2.0, true, frameCol, paneCol);

  /* --- the wheel flank: local +z side, its own outward facing is
     ry+90deg — everything below is built against THAT facing,
     loc()-relative, same convention as houseOfHealing's own per-side
     ry+f*90deg loop. ------------------------------------------------- */
  var wheelRy = ry + Math.PI/2;
  var wheelR = opt.wheelR || 4.0, wheelThick = opt.wheelThick || 1.8;
  var flankMid = loc(x,z, millD*0.5, 0, wheelRy);
  var hubOut = wheelR*0.85;   // stands proud of the wall so the disc reads as a true wheel, not a flush rosette
  var hubP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  var hubY = y + wheelR*0.80;   // most of the wheel dips low, toward the race (undershot)

  /* static axle + hub disks — the paddles themselves are 100% the shared
     animated rig, registered below. */
  CYL(hubP[0], hubY-wheelThick*0.5, hubP[1], 0.35, wheelThick, wheelRy, shade(woodCol,-0.2), 'wood');
  [-1,1].forEach(function(s){
    var dp = loc(hubP[0],hubP[1], s*wheelThick*0.5, 0, wheelRy);
    CYL(dp[0], hubY-0.9, dp[1], wheelR*0.22, 1.8, 0, shade(woodCol,-0.15), 'wood');
  });
  var postP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  BOX(postP[0], y, postP[1], 0.5, hubY-y, 0.5, wheelRy, shade(woodCol,-0.25), 'wood');

  /* the animated paddles: short radial slats occupying just the rim (n
     around the wheel), offset out from the hub by innerR — 100% of the
     moving geometry, see the MILL ANIMATION RIG above. */
  registerMillCluster(hubP[0], hubY, hubP[1], wheelRy, 10, wheelR*0.34, wheelThick*0.85, 0.28,
                       opt.spin || 0.42, wheelR*0.68, shade(woodCol, -0.10));

  /* --- mill race / sluice: a short stone-lined channel the wheel dips
     into, with a wooden sluice gate — "the suggestion of a mill race"
     per the brief, without a literal animated water plane. ------------ */
  var raceLen = wheelR*2.6, raceGap = wheelThick*1.8;
  [-1,1].forEach(function(s){
    var rp = loc(hubP[0], hubP[1], s*raceGap*0.5, 0, wheelRy);
    BOX(rp[0], y, rp[1], 0.4, 1.3, raceLen, wheelRy, shade(GREYC[0],-0.1));
  });
  var gateMid = loc(hubP[0], hubP[1], 0, raceLen*0.42, wheelRy);
  BOX(gateMid[0], y+0.2, gateMid[1], raceGap*0.85, 1.8, 0.3, wheelRy, shade(woodCol,-0.2), 'wood');

  return {
    x:x, z:z, ry:ry,
    fx: Math.max(millW*0.5, raceLen*0.5)+2,
    fz: millD*0.5 + hubOut + wheelR*1.15 + 1.5,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ============================== BEETLE RANCH ==============================
   "This is a Morrowind-flavoured Dunmer world; giant beetles are livestock
   here." No beetle/insect geometry exists anywhere else in src/ (grepped
   the whole tree for beetle/carapace/chitin/shell — nothing; the silt-
   strider creature itself is a separate, still-pending bespoke model per
   the coordinator's brief, out of scope here), so this is a new small
   creature builder, not a duplicate of anything. A fenced corral with a
   byre (structure()'s own 'hovel' kind, reused outright rather than a
   parallel shed shape), feed troughs, a loading chute facing the street,
   and a scatter of static giant beetles built from the kit. No animation
   here — only the two mills, above, need that, per the brief.

   beetleModel(x, y, z, ry, col, opt) — one giant beetle, standing, static
   pose; ry is which way it's facing (random per instance is fine — it
   isn't a building, faceStreet() doesn't apply). col overrides the shell
   tone (falls back to a dark trunk/leaf tone). opt.scale (default 1.0)
   jitters size; returns { x, z, ry, r } (r a rough footprint radius, for
   a caller doing its own fine-grained clearance rather than claim()).

   beetleRanch(x, y, z, ry, col, opt) — x,y,z the pen's own centre (ground
   reference), ry the chute/entrance facing (local +x, world ry, same
   convention as every builder here). opt may override w/d/beetleCount.

   Returns { x, z, ry, fx, fz, doorX, doorZ } — fx/fz half-extents of the
   whole fenced footprint; doorX/doorZ is the chute's street-facing
   threshold.

   Existing (shape,family) buckets only: box|wood, cyl|wood, box|stone/
   fr8|stone/cone|roof/dome|dome (via structure()'s own 'hovel' kind),
   dome|dome (beetle shells), cyl|trunk, box|trunk (beetle legs/
   antennae/carapace shading — 'trunk' is a FAMILY applied to ordinary
   box/cyl/dome shapes exactly like everywhere else in this file, not a
   new shape). Zero new draw calls. */
reseed(659201);   /* unique fragment seed for this new section, per the brief. */

function beetleModel(x, y, z, ry, col, opt){
  opt = opt || {};
  var scl = opt.scale || 1.0;
  var bodyLen = 4.6*scl, abdR = 1.5*scl, thoraxR = 1.0*scl, headR = 0.55*scl;
  var shellCol = col || shade(pick(chance(0.5) ? TRUNKC : LEAFC), -0.22);
  var legCol = shade(shellCol, -0.24);
  var legH = abdR*0.95;
  var baseY = y + legH;   // body sits up on its own legs

  var abdP  = loc(x,z, -bodyLen*0.30, 0, ry);
  var thxP  = loc(x,z,  bodyLen*0.06, 0, ry);
  var headP = loc(x,z,  bodyLen*0.40, 0, ry);

  DOME(abdP[0],  baseY, abdP[1],  abdR,     abdR*0.88,    ry, shellCol, 'dome');
  DOME(thxP[0],  baseY, thxP[1],  thoraxR,  thoraxR*0.94, ry, shade(shellCol,0.05), 'dome');
  DOME(headP[0], baseY+thoraxR*0.15, headP[1], headR, headR*0.86, ry, shade(shellCol,-0.05), 'dome');

  /* two thin antennae, centred a touch forward of the head so they read
     as sticking out rather than buried in it. The kit's BOX only yaws
     (see 45-kit.js), so these point forward-and-out rather than
     tilting up — a small, deliberate simplification, not worth a
     bespoke rig for a static prop (only the two mills spend that). */
  [-1,1].forEach(function(s){
    var antRy = ry - s*0.4;
    var ap = loc(headP[0], headP[1], headR*0.9, s*headR*0.35, antRy);
    BOX(ap[0], baseY+thoraxR*0.7, ap[1], headR*1.6, 0.09*scl, 0.09*scl, antRy, legCol, 'trunk');
  });

  /* 6 short legs, 3 pairs along the body, straight down to the ground —
     same "vertical stub" simplification this file's own tavernTable/
     benchPlain legs already use (the kit has no tilt to give them). */
  [ {lx:bodyLen*0.06, lr:thoraxR*0.85}, {lx:-bodyLen*0.20, lr:abdR*0.80}, {lx:-bodyLen*0.44, lr:abdR*0.55} ]
    .forEach(function(lp){
      [-1,1].forEach(function(s){
        var lpz = loc(x,z, lp.lx, s*lp.lr, ry);
        CYL(lpz[0], y, lpz[1], 0.16*scl, legH, 0, legCol, 'trunk');
      });
    });

  return { x:x, z:z, ry:ry, r: Math.max(abdR, bodyLen*0.5) };
}

function beetleRanch(x, y, z, ry, col, opt){
  opt = opt || {};
  var penW = opt.w || 26, penD = opt.d || 20;
  var fenceCol = shade(TRUNKC[0], -0.10);
  var fenceH = 1.7, postR = 0.16;
  var halfW = penW*0.5, halfD = penD*0.5;
  var chuteHalf = 2.6;

  /* --- perimeter post-and-rail fence: left/right + back full runs, a
     gapped front run flanking the loading chute (same two-segment-
     flanking-a-real-gap idiom houseOfHealing's own gated sides use). -- */
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*halfD, ry);
    BOX(p[0], y+fenceH*0.55, p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
    BOX(p[0], y+fenceH*1.0,  p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
  });
  var backP = loc(x,z, -halfW, 0, ry);
  BOX(backP[0], y+fenceH*0.55, backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  BOX(backP[0], y+fenceH*1.0,  backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  var segLen = (penD-chuteHalf*2)*0.5;
  [-1,1].forEach(function(s){
    var segCenterZ = s*(chuteHalf+segLen*0.5);
    var fp = loc(x,z, halfW, segCenterZ, ry);
    BOX(fp[0], y+fenceH*0.55, fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
    BOX(fp[0], y+fenceH*1.0,  fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
  });

  /* fence posts: 4 corners, the two gate posts flanking the chute, and a
     few mid-span posts along the long left/right rails. */
  [[halfW,halfD],[halfW,-halfD],[-halfW,halfD],[-halfW,-halfD]].forEach(function(c){
    var cp = loc(x,z, c[0], c[1], ry);
    CYL(cp[0], y, cp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
  });
  [-1,1].forEach(function(s){
    var gp = loc(x,z, halfW, s*chuteHalf, ry);
    CYL(gp[0], y, gp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
    for(var pn=1; pn<4; pn++){
      var pt = (pn/4-0.5)*penW;
      var pp2 = loc(x,z, pt, s*halfD, ry);
      CYL(pp2[0], y, pp2[1], postR, fenceH, 0, fenceCol, 'wood');
    }
  });

  /* --- byre/shelter, back corner of the pen: structure()'s own 'hovel'
     kind, reused outright. ---------------------------------------------- */
  var byreW = Math.min(9, penW*0.34), byreD = Math.min(7, penD*0.55), byreH = 4.2;
  var byreP = loc(x,z, -halfW+byreW*0.5+0.6, 0, ry);
  structure(byreP[0], y, byreP[1], byreW, byreD, byreH, ry, 'hovel', shade(pick(TONES_POOR),-0.05), { roof: pick(ROOFS) });
  /* structure()'s 'hovel' emits walls and no openings at all, so this was
     the ONE defined-but-unplaced asset (granary's louvre vents are
     deliberately not windows; windmill/watermill/tavern/houseOfHealing all
     route through monasteryWindow) with no window emitter of its own — and
     therefore the one that would NOT have inherited the night-lit windows
     the moment someone finally places a beetle ranch. Routed through
     addWindows() so it does. Costs nothing today: beetleRanch() is never
     called, so this emits no instances until it is. */
  addWindows(byreP[0], y, byreP[1], ry, byreW, byreD, byreH, shade(pick(TONES_POOR),-0.05), 0.9);

  /* --- feed troughs along one long fence line. -------------------------- */
  var troughCol = shade(TRUNKC[0], -0.05);
  [-1,1].forEach(function(s){
    var tp = loc(x,z, halfW*0.15, s*(halfD-1.2), ry);
    BOX(tp[0], y, tp[1], penW*0.34, 0.5, 0.9, ry, troughCol, 'wood');
    BOX(tp[0], y+0.5, tp[1], penW*0.34*0.88, 0.25, 0.62, ry, shade(troughCol,-0.3), 'wood');
  });

  /* --- loading chute: a short ramp out through the front gate gap,
     flanked by rails, toward the street. --------------------------------- */
  var chuteLen = 5.5, chuteW = chuteHalf*1.7;
  var chuteMid = loc(x,z, halfW+chuteLen*0.5, 0, ry);
  BOX(chuteMid[0], y, chuteMid[1], chuteLen, 0.35, chuteW, ry, shade(troughCol,-0.1), 'wood');
  [-1,1].forEach(function(s){
    var rp = loc(x,z, halfW+chuteLen*0.5, s*chuteW*0.5, ry);
    BOX(rp[0], y+0.55, rp[1], chuteLen, 0.9, 0.14, ry, fenceCol, 'wood');
  });
  var doorP = loc(x,z, halfW+chuteLen, 0, ry);

  /* --- the beetles themselves, scattered inside the pen (kept clear of
     the byre corner). ----------------------------------------------------- */
  var beetleCount = opt.beetleCount || 5;
  for(var bi=0; bi<beetleCount; bi++){
    var bx = rr(-halfW*0.55, halfW*0.30), bz = rr(-halfD*0.65, halfD*0.65);
    var bp = loc(x,z, bx, bz, ry);
    beetleModel(bp[0], y, bp[1], rr(0, Math.PI*2), null, { scale: rr(0.85,1.15) });
  }

  return {
    x:x, z:z, ry:ry,
    fx: halfW+chuteLen+2, fz: halfD+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ============================== ARENA COMBAT: THE BUILT HALF ===============
   Everything the gladiator system needs that does NOT move: raised
   spectator benches around the full inner perimeter, a barred "pit
   entrance" built into the arena's north wall, and the VIP box on top of
   it. The moving half — the fighters, the beasts, the corpse-drag — is
   78-life.js's own arena section, which reads the ARENA_SITE record this
   function publishes.

   NO PRNG. Every other generative block in this project opens with a
   reseed() so an edit here cannot shift what a later fragment generates.
   This block cannot do that: it is CALLED from arenaDeckSquare(), which
   runs inside 50-cantons.js's canton loop at file order 50, long before
   any top-level statement in this file executes — a reseed() placed here
   would fire far too late to protect anything, and every rnd() spent here
   would shift the Arena canton's own downstream stream (every canton,
   district, farm and citizen generated after it) sideways. So this whole
   section is deterministic: variety comes from arenaHash(), a plain
   positional hash, never from rnd()/rr()/pick()/chance(). That is also why
   it needs no seed of its own.

   DRAW CALLS: zero new. Every combo used here is already live in the build
   (checked against the running scene's own instanced meshes, not assumed):
   box|stone, box|wood, box|cloth, box|metal, cyl|stone, cyl|metal,
   fr8|roof, fr6|stone, dome|dome. The only new draw calls this whole
   system spends are the FOUR moving InstancedMeshes in 78-life.js
   (fighters, quadruped beasts, beetles — and, since the crowd pass, the
   spectators, who used to be baked here and are now registered to that
   file's own shared crowd mesh by arenaSpectator() below).

   NORTH is -z in this world — the one fixed compass reference the build
   already agrees on is the ships' open-water inlet, which sits at
   z ~ -5100 (updateShips(), 78-life.js). So the pit entrance's back wall
   lies on the field's own -z perimeter line and the building projects
   SOUTH into the field from it: its north wall is contiguous with the
   inner arena perimeter, i.e. it is part of the arena wall rather than a
   shed standing near it. ------------------------------------------------ */

/* Published by arenaCombatDeck() for 78-life.js. Declared, never assigned,
   at file scope: `var ARENA_SITE;` hoists the binding to the top of
   BUILD() so arenaDeckSquare() can fill it in during 50-cantons.js's own
   canton loop, while a `= {...}` initialiser here would run at file order
   65 and wipe the record that loop already wrote. Same execution-order
   hazard addDoor()/inspectClaim() document at the top of this file. */
var ARENA_SITE;

/* positional hash — the deterministic stand-in for rnd() in this section
   (see the header). Same fract(sin(x)*k) form the kit's own per-instance
   UV offset uses in its vertex shader, kept on the JS side here. */
function arenaHash2(i,j){ var s = Math.sin(i*39.3468 + j*11.1352) * 24634.6345; return s - Math.floor(s); }

/* one seated spectator. This USED to be two static kit instances (tunic
   cylinder + head block) pushed straight into BUCKET, on the argument that
   "a seated crowd never moves" — which the owner rightly read as the one
   real simplification in the arena: 258 people on the benches frozen solid,
   and present at three in the morning as well. The static bake is merged and
   immutable (SUBAGENT.md), so nothing in it can be animated at all; a figure
   that moves has to live on an InstancedMesh someone updates per frame.

   So arenaSpectator() no longer BUILDS anything. It REGISTERS a seat — world
   position, facing, tunic colour — into ARENA_SEATS, exactly the way
   registerSmokeEmitter()/registerMillCluster() at the top of this file hand a
   site to a shared moving rig. 78-life.js's arena section owns the other end:
   one shared InstancedMesh for the whole crowd (the arena's own three dynamic
   meshes are already there, so the crowd belongs with them rather than in a
   fourth rig here), with stateless per-seat idle motion hashed off the seat's
   own position — see arenaCrowd* in that file.

   Lazy-init against the var hoist, same as SMOKE_EMITTERS: this function runs
   during 50-cantons.js's canton loop, long before this fragment's own top
   level executes, so the array has to be created on first use.

   LIFE_SKIN (78-life.js) is not readable here (file order 78 > 65 for VALUES,
   unlike hoisted functions), so the same dunmer grey is spelled out once
   below; the crowd mesh reads ARENA_SKIN back out of here. */
var ARENA_SKIN = 0x8c8394;
var ARENA_SEATS;
function arenaSpectator(x, y, z, ry, tunicCol){
  if(!ARENA_SEATS) ARENA_SEATS = [];
  ARENA_SEATS.push({ x:x, y:y, z:z, ry:ry, col:tunicCol });
}

/* exact instance accounting for the session report: BUCKET (45-kit.js) is
   the one authoritative count of what the static bake holds, and it is in
   scope here, so "how many instances did the arena cost" is measured
   rather than estimated. */
function arenaBucketTotal(){ var n=0; for(var k in BUCKET) n += BUCKET[k].list.length; return n; }

function arenaCombatDeck(c, y, outerHalf, fieldHalf, steps, stepH, bank, pillarPos, pillarR){
  var instBefore = arenaBucketTotal();
  var stoneCol = shade(c.tone, -0.10);
  var darkCol  = shade(c.tone, -0.34);
  var ironCol  = shade(GREYC[0], -0.30);
  var plankCol = shade(TRUNKC[0], -0.06);
  var sandCol  = 0x9a8f74;                       /* the field floor's own colour, reused verbatim */
  var TUNIC = TONES_POOR, BANNERS = BANNERC;

  /* the pit entrance's own dimensions, needed by the bench loop below (it
     has to skip the stretch of stand the building stands in front of). */
  var pitHalfW = 24, pitWallT = 2.0, pitDepth = 15, pitH = 16.5;
  var benchSkipNorth = pitHalfW + pitWallT + 3.5;

  /* ---- 1. raised spectator benches, full inner perimeter ----------------
     One bench run along the top face of every terrace step EXCEPT the
     outermost. That top step is the colonnade rim: it carries the existing
     pillar ring and the banners hung between them and is the walkway the
     stands are reached by — seating it would bury the colonnade. Rings
     1..steps-1 are the actual stands, which is still the full inner
     perimeter on all four sides.

     Each step's top face is at y + (steps-i)*stepH and spans radius
     [outerHalf-(i+1)*bank, outerHalf-i*bank] — read straight off the loop
     in arenaDeckSquare() rather than re-derived, so a fifth pass at that
     bowl carries the benches along with it. */
  var segTarget = 9.0, benchN = 0, crowdN = 0;

  function pillarClash(px, pz, halfLen){
    var q, p;
    for(q=0;q<pillarPos.ns.length;q++){
      p = pillarPos.ns[q];
      if(Math.abs(pz-p[1]) < pillarR+1.4 && Math.abs(px-p[0]) < pillarR+halfLen) return true;
    }
    for(q=0;q<pillarPos.ew.length;q++){
      p = pillarPos.ew[q];
      if(Math.abs(px-p[0]) < pillarR+1.4 && Math.abs(pz-p[1]) < pillarR+halfLen) return true;
    }
    return false;
  }

  for(var i=1;i<steps;i++){
    var rMid = outerHalf - i*bank - bank*0.5;
    var yTop = y + (steps-i)*stepH;
    var seatD = bank*0.80, riserD = bank*0.55;
    /* N/S runs span the full width; E/W runs are shortened by one bank at
       each end so the four runs mitre at the corners instead of
       overlapping — the same corner problem the terracing solves the other
       way (it overlaps on purpose to close the mitre; overlapping benches
       would double up planks). */
    for(var sz=-1; sz<=1; sz+=2){
      var L = rMid*2, n = Math.max(4, Math.round(L/segTarget)), segL = L/n;
      for(var k=0;k<n;k++){
        var bx = c.x - L*0.5 + (k+0.5)*segL, bz = c.z + sz*rMid;
        if(sz < 0 && Math.abs(bx-c.x) < benchSkipNorth) continue;
        if(pillarClash(bx, bz, segL*0.5)) continue;
        BOX(bx, yTop, bz, segL*0.96, 0.52, riserD, 0, darkCol);
        BOX(bx, yTop+0.52, bz, segL*0.96, 0.34, seatD, 0, plankCol, 'wood');
        benchN += 2;
        /* the crowd on this segment: up to 3 seated figures, gated by a
           positional hash so the stands read as filled-but-not-solid and
           the pattern is stable across rebuilds. */
        for(var s2=0;s2<3;s2++){
          var hh = arenaHash2(bx*0.37 + s2*7.13, bz*0.41 + i*3.7);
          if(hh > 0.62) continue;
          arenaSpectator(bx + (s2-1)*segL*0.30, yTop+0.86, bz + (sz<0 ? 0.30 : -0.30),
                         sz<0 ? 0 : Math.PI, TUNIC[Math.floor(hh*997) % TUNIC.length]);
          crowdN++;
        }
      }
    }
    for(var sx2=-1; sx2<=1; sx2+=2){
      var L2 = rMid*2 - bank*2, n2 = Math.max(4, Math.round(L2/segTarget)), segL2 = L2/n2;
      for(var k2=0;k2<n2;k2++){
        var bz2 = c.z - L2*0.5 + (k2+0.5)*segL2, bx2 = c.x + sx2*rMid;
        if(pillarClash(bx2, bz2, segL2*0.5)) continue;
        BOX(bx2, yTop, bz2, riserD, 0.52, segL2*0.96, 0, darkCol);
        BOX(bx2, yTop+0.52, bz2, seatD, 0.34, segL2*0.96, 0, plankCol, 'wood');
        benchN += 2;
        for(var s3=0;s3<3;s3++){
          var hh2 = arenaHash2(bx2*0.43 + i*5.1, bz2*0.31 + s3*9.7);
          if(hh2 > 0.62) continue;
          arenaSpectator(bx2 + (sx2<0 ? 0.30 : -0.30), yTop+0.86, bz2 + (s3-1)*segL2*0.30,
                         sx2<0 ? Math.PI*0.5 : -Math.PI*0.5,
                         TUNIC[Math.floor(hh2*997) % TUNIC.length]);
          crowdN++;
        }
      }
    }
  }

  /* ---- 2. the pit entrance, built into the north arena wall -------------
     backZ IS the inner perimeter line. The back wall is set 0.3 further
     north than flush so it keys INTO the innermost terrace step rather
     than merely kissing it; everything else projects south into the
     field. */
  var backZ = c.z - fieldHalf;
  var frontZ = backZ + pitDepth;
  var midZ = (backZ + frontZ) * 0.5;

  BOX(c.x, y, backZ - 0.3 + pitWallT*0.5, (pitHalfW+pitWallT)*2, pitH, pitWallT, 0, stoneCol);
  for(var ws=-1; ws<=1; ws+=2){
    BOX(c.x + ws*(pitHalfW+pitWallT*0.5), y, midZ, pitWallT, pitH, pitDepth, 0, stoneCol);
  }
  /* the pit itself: a slab of near-black set a little way behind the
     grating, so what reads through the bars is depth and darkness rather
     than a hole straight through to the terracing beyond. */
  BOX(c.x, y, frontZ - 4.2, pitHalfW*2, pitH-2.6, 1.6, 0, shade(BASALTC[0], -0.25));

  /* the barred gate: two stone jambs, a lintel across them, a run of iron
     uprights between, banded three times. cyl|metal and box|metal are both
     already-live buckets, so the grating costs no draw call. */
  var jambW = 5.0, gateHalf = pitHalfW - jambW, gateH = pitH - 3.2;
  for(var js=-1; js<=1; js+=2){
    BOX(c.x + js*(pitHalfW - jambW*0.5), y, frontZ - 0.7, jambW, gateH, pitWallT*1.5, 0, shade(stoneCol,-0.08));
  }
  BOX(c.x, y + gateH, frontZ - 0.7, (pitHalfW+pitWallT)*2, pitH-gateH, pitWallT*1.7, 0, shade(stoneCol,-0.16));
  var nBars = 17;
  for(var b=0;b<nBars;b++){
    CYL(c.x + ((b+0.5)/nBars - 0.5) * gateHalf*2, y, frontZ - 0.7, 0.30, gateH, 0, ironCol, 'metal');
  }
  [0.10, 0.50, 0.90].forEach(function(f){
    BOX(c.x, y + gateH*f, frontZ - 0.7, gateHalf*2, 0.36, 0.52, 0, shade(ironCol,0.08), 'metal');
  });
  /* three skull bosses along the lintel and one on each gate pier.
     NOT skullMotif(): that helper is a cranium dome sitting on a TAPERED
     jaw, and at this size, proud of a flat wall, the silhouette read as a
     mushroom cap on a stalk in the first screenshot pass - the wrong
     reading entirely for a gladiator pit. This is the same idea rebuilt
     for a wall boss: a flattened cranium, a jaw block the SAME width as
     the cranium (no stalk), and dark recessed sockets and a mouth slot.
     Same already-live buckets either way (dome|dome + box|stone). */
  function arenaSkullBoss(sx, sz, y0, r){
    var bone = shade(MARBLEC[0], -0.30), hole = shade(BASALTC[0], -0.28);
    DOME(sx, y0, sz + 0.30, r, r*0.62, 0, bone, 'dome');
    BOX(sx, y0 - r*0.62, sz + 0.30, r*1.55, r*0.62, r*0.72, 0, bone);
    /* the sockets sit on the dome's OWN front surface, not on a guessed
       offset: the cranium is SphereGeometry(1) scaled (r, 0.62r, r), so at
       eye height its front face is still ~0.9r out from the boss centre -
       0.62r (the vertical radius) would have buried them inside the skull. */
    [-1,1].forEach(function(e){
      BOX(sx + e*r*0.40, y0 + r*0.06, sz + 0.30 + r*0.88, r*0.34, r*0.30, 0.16, 0, hole);
    });
    BOX(sx, y0 - r*0.52, sz + 0.30 + r*0.40, r*0.70, r*0.22, 0.16, 0, hole);
  }
  [-1,0,1].forEach(function(s){
    arenaSkullBoss(c.x + s*pitHalfW*0.52, frontZ - 0.7 + pitWallT*0.85, y + gateH + 1.5, 0.95);
  });
  [-1,1].forEach(function(s){
    arenaSkullBoss(c.x + s*(pitHalfW - jambW*0.5), frontZ - 0.7 + pitWallT*0.75, y + gateH*0.62, 1.15);
  });
  /* a raked sand apron in front of the gate: where the fighters come out,
     and where the corpses get dragged back to. */
  BOX(c.x, y-0.30, frontZ + 3.4, gateHalf*2 + 6, 0.42, 7.5, 0, shade(sandCol,-0.06));

  /* roof slab — also the VIP box's floor */
  var roofY = y + pitH;
  BOX(c.x, roofY, midZ - 0.15, (pitHalfW+pitWallT)*2 + 2.4, 1.35, pitDepth + 2.4, 0, shade(stoneCol,-0.20));

  /* ---- 3. the VIP box on top of the pit entrance ------------------------ */
  var vipY = roofY + 1.35;
  var vipHalfW = pitHalfW + pitWallT + 1.2, vipHalfD = (pitDepth + 2.4)*0.5;
  var vipCz = midZ - 0.15;
  var vipFrontZ = vipCz + vipHalfD;
  BOX(c.x, vipY, vipFrontZ - 0.55, vipHalfW*2, 1.25, 1.1, 0, shade(stoneCol,0.05));                  /* front parapet */
  for(var ps=-1; ps<=1; ps+=2){
    BOX(c.x + ps*(vipHalfW-0.55), vipY, vipCz, 1.1, 1.25, vipHalfD*2, 0, shade(stoneCol,0.05));      /* side parapets */
  }
  var vipColH = 7.2;
  for(var vc=0; vc<6; vc++){
    var vx = c.x + ((vc+0.5)/6 - 0.5) * (vipHalfW*2 - 3.0);
    CYL(vx, vipY, vipFrontZ - 1.6, 0.80, vipColH, 0, MARBLEC[0]);
    CYL(vx, vipY, vipCz - vipHalfD*0.55, 0.80, vipColH, 0, MARBLEC[0]);
  }
  BOX(c.x, vipY+vipColH, vipCz, vipHalfW*2, 1.1, vipHalfD*2, 0, shade(stoneCol,-0.06));              /* entablature */
  FR8(c.x, vipY+vipColH+1.1, vipCz, vipHalfW*2*0.99, 2.8, vipHalfD*2*0.99, 0, ROOFS[0], 'roof');     /* canopy */
  /* banners along the box's own parapet — the arena's existing colonnade
     banners already spend box|cloth, so these ride the same bucket. */
  for(var vb=0; vb<6; vb++){
    BOX(c.x + ((vb+0.5)/6 - 0.5) * (vipHalfW*2 - 2.0), vipY - 5.4, vipFrontZ - 0.05,
        4.2, 5.6, 0.14, 0, BANNERS[vb % BANNERS.length], 'cloth');
  }
  /* two seats of honour with their occupants, and four attendants standing
     at the rail. The thrones and the dais are static kit; the six figures go
     through arenaSpectator() like everyone on the benches, so they ride the
     same live crowd mesh and shift and lean with the rest of the house —
     these are the most-looked-at people in the arena, so they are the last
     six that should be frozen. */
  for(var ts=-1; ts<=1; ts+=2){
    BOX(c.x + ts*5.0, vipY, vipCz - vipHalfD*0.20, 2.8, 1.1, 2.4, 0, shade(TRUNKC[0],-0.12), 'wood');
    BOX(c.x + ts*5.0, vipY+1.1, vipCz - vipHalfD*0.20 - 1.0, 2.8, 2.6, 0.5, 0, shade(TRUNKC[0],-0.22), 'wood');
    arenaSpectator(c.x + ts*5.0, vipY+1.1, vipCz - vipHalfD*0.20, 0, BANNERS[ts>0?0:1]);
  }
  /* the four standing attendants get a low dais: at the rail, behind a
     parapet, a figure whose origin is the box floor shows only the top of
     its head. Raising them is what makes the box read as OCCUPIED from
     down on the sand, which is the whole point of putting it there. */
  BOX(c.x, vipY, vipCz - vipHalfD*0.62, vipHalfW*2 - 3.0, 0.75, 3.2, 0, shade(stoneCol,-0.04));
  for(var va=0; va<4; va++){
    var vax = c.x + (va<2 ? -1 : 1) * (10.0 + (va%2)*7.0);
    arenaSpectator(vax, vipY + 0.75, vipCz - vipHalfD*0.62, 0, shade(GREYC[0],-0.10));
  }

  inspectClaim(c.x, midZ, pitHalfW+pitWallT, pitDepth*0.5, 0, 'arenapit', 'Arena pit entrance');
  inspectClaim(c.x, vipCz, vipHalfW, vipHalfD, 0, 'arenavip', 'Arena VIP box');

  /* ---- 4. the hand-off record 78-life.js reads -------------------------- */
  ARENA_SITE = {
    x: c.x, z: c.z, y: y, tone: c.tone,
    fieldHalf: fieldHalf, outerHalf: outerHalf,
    fieldY: y - 0.15,                        /* top of arenaDeckSquare()'s own field slab */
    gateX: c.x, gateZ: frontZ + 2.6,         /* mouth of the barred gate, out on the sand apron */
    pitHalfW: pitHalfW, pitDepth: pitDepth, pitH: pitH,
    vipY: vipY,
    benchInstances: benchN, crowdInstances: crowdN
  };
  window._arenaBuilt = { benches: benchN, crowd: crowdN,
                         seats: ARENA_SEATS ? ARENA_SEATS.length : 0,  /* bench crowd + the 6 in the VIP box; all live, none baked */
                         pitH: pitH, vipY: vipY,
                         staticInstances: arenaBucketTotal() - instBefore,
                         pit: [Math.round(c.x), Math.round(midZ)],
                         gate: [Math.round(c.x), Math.round(frontZ + 2.6)] };   /* diagnostic */
}
