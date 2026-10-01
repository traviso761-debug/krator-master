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
