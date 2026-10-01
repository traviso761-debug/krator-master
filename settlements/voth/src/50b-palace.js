/* ======================= PALACE: THE GILT REDESIGN =======================
   Owner, verbatim, after rejecting several colour-only mockups: "maybe do a
   version where you add a lot of flying butresses between tiers, a lot of
   fancy skylights and atria, with a lot of gold and a teeny bit of porphyry
   and black trim. you know, really get architectural with it."

   Everything below is ADDITIVE on monoCanton()'s existing massing. The tier
   heights, radii, cornices, CANTON_TOPS (y/hw/spring/entryY/entryHw/
   tierRings) and CANTON_FACES records are untouched, because landing()'s
   bridge stairs, lifeGroundY()/cantonEdgeY() (78-life.js) and the canton-
   door pass all read them. Nothing here is generated: there is not one
   rr()/rnd()/pick()/chance() call in this whole section, so it cannot shift
   the shared fragment-50 PRNG stream and move every canton, district and
   placement built after the Palace (the bug the guild-canton relayout hit).

   ---- FLYING BUTTRESSES, inside an axis-aligned primitive set -------------
   Every primitive here is axis-aligned with a single Y rotation, so a true
   raking arch is not directly expressible. Each buttress is therefore built
   as THREE separate pieces, all of them axis-aligned, which together read as
   one flying buttress from any normal viewing distance:

     1. the PIER — a free-standing battered FR8 block standing out on the
        terrace, on a black basalt plinth, banded with a porphyry course,
        capped with a black abacus and a gilt fillet, and finished with its
        own FR3 pinnacle and gold cone. This part is genuinely axis-aligned
        architecture and needs no approximation at all.
     2. the FLYER — the raking arch. Approximated as a run of N short BOX
        segments marching radially inward and upward from the pier's shoulder
        to the tier wall above. Each segment's TOP follows a straight rake
        (the extrados) and each segment's BASE follows
             soffit(t) = lerp(impostPier, impostWall, t) + archRise*sin(PI*t)
        — a sine hump between the two springing points, i.e. a real arch
        soffit, so the member is thin at the crown and deepens into a haunch
        where it meets the wall, which is the actual profile of a flying
        buttress. The open air UNDER that curve is the thing that makes it
        read as flying rather than as a ramp: at the largest setback the void
        is ~14 units clear of the terrace over a ~19-unit span. Segment depth
        is 1.34x the step so consecutive boxes overlap and the staircase
        reads as a continuous raking member, not as steps.
     3. a gilt COPING — a second, thinner box riding the top of every
        segment, in gold. This is what actually sells it: a continuous bright
        line climbing the rake is read by the eye as an edge, and edges read
        as geometry. Without it the stone segments blend into the tier.
   Plus a black corbel at the landing point. The landing radius is computed
   from the real battered face (faceHwAt on the tier's own recorded geometry)
   at the height the arch actually arrives, so the flyer meets stone rather
   than hanging off a 50-degree slope.

   ---- ATRIA AND SKYLIGHTS ------------------------------------------------
   An atrium here is a corner court pavilion standing ON a terrace: four wall
   segments forming a hollow square ring, a gilt stringcourse, a black
   cornice, an inner colonnade of gold shafts, and — the whole point — an
   ambulatory roof built as FOUR SEPARATE PER-SIDE SLABS that stop well short
   of the middle, so the centre stays a genuine open well straight down onto
   a porphyry floor laid on the terrace deck. That is houseOfHealing()'s
   hard-won rule (65-facade.js): a full-footprint slab whose top face sits
   above floor level silently becomes the floor and buries what is under it.
   The rim of the well is a black oculus ring; the little gold cupolas and
   lantern drums sit on the per-side roof slabs, where they are genuinely
   over the ambulatory rather than over the open court. The two upper, and
   much narrower, terraces get open gold-columned lantern kiosks at their
   corners instead, and every terrace carries a run of gilt lantern drums
   between the buttresses.

   ---- COLOUR -------------------------------------------------------------
   Gold-dominant: every coping, fillet, stringcourse, roof slab, cupola,
   drum, colonnade shaft, dome and spire cap. Black trim is PAL.stone.basalt
   (plinths, abaci, cornices, oculus rims, mullions). Porphyry is the "teeny
   bit": one course per pier, the atrium floors, the drum's window panels and
   one collar per spire. PORPHYRY IS NOT IN THE PALETTE — PAL has no
   red-purple at all, so PALACE_PORPHYRY below is a local literal and the
   planner is asked to promote it to PAL.stone.porphyry.

   This overrides the older "Palace roof and spires will be silver" decision
   (see the comment further down in monoCanton, kept in place): the owner's
   new brief asks for gold. Palace's gold is kept distinct from the Temple's
   own — Temple is a matte ochre gilt (0xc9a227, 'dome'/'roof' families) over
   blood red, Palace is a brighter, glossier gilt on the 'metal' family
   (rough 0.45, so it actually catches the sun) over pale ashlar with black
   basalt trim and no red anywhere.

   ---- DRAW CALLS ---------------------------------------------------------
   One new bucket, dome|metal (65 -> 66 of 72). box|metal and cyl|metal are
   already spent elsewhere in the build (this file's clock faces, 71-industry
   rail furniture, 65-facade's ironwork), so every gilt band, coping, roof
   slab and lantern drum here is free. dome|metal is the one genuinely new
   look the brief demands and nothing else can fake: a matte 'dome'-family
   gold reads as painted stone, which is exactly what the rejected colour-only
   mockups looked like. cone|metal and fr8|metal were considered and dropped —
   the gold cones are small enough that the 'roof' family carries them.
------------------------------------------------------------------------- */
var PALACE_GOLD     = 0xd0a53c;   /* polished gilt — brighter and cleaner than the Temple's ochre,
                                     pulled back from a first-pass 0xd8b34c that read as flat
                                     yellow on the big sunlit faces */
var PALACE_GOLD_DK  = 0x9d7a28;   /* the same gilt in shadow, for undersides and deep bands */
/* imperial porphyry — deep red-purple. Was a local literal here while this
   pass ran, with a note asking for promotion; it now lives in the palette as
   PAL.stone.porphyry, so this is just the alias. The value was pulled down
   from a first-pass 0x6b2334, which read as a pink stripe rather than a
   stone inlay at city distance. */
var PALACE_PORPHYRY = PORPHYRYC[0];

/* one flying buttress at bearing `ang`, `lat` units sideways along that
   face. Every number it needs is precomputed once per setback in
   palaceButtressRing() and handed over in B, so this only draws. */
function palaceButtress(c, ang, lat, B){
  var p = loc(c.x, c.z, lat, B.rP, ang);
  BOX(p[0], B.terrY-1.2,          p[1], B.wP*1.30, 1.6,        B.dP*1.26, ang, BASALTC[0]);          /* plinth */
  FR8(p[0], B.terrY-0.2,          p[1], B.wP,      B.hP+0.2,   B.dP,      ang, B.stone);             /* pier shaft */
  BOX(p[0], B.terrY+B.hP*0.34,    p[1], B.wP*1.05, 0.9,        B.dP*1.04, ang, PALACE_PORPHYRY);     /* porphyry course */
  BOX(p[0], B.terrY+B.hP,         p[1], B.wP*1.18, 1.5,        B.dP*1.16, ang, BASALTC[0]);          /* abacus */
  BOX(p[0], B.terrY+B.hP+1.5,     p[1], B.wP*0.92, 0.8,        B.dP*0.90, ang, PALACE_GOLD, 'metal');/* gilt fillet */
  FR3(p[0], B.terrY+B.hP+2.3,     p[1], B.wP*0.62, B.hP*0.46,  B.dP*0.62, ang, shade(B.stone,0.05)); /* pinnacle */
  CONE(p[0], B.terrY+B.hP+2.3+B.hP*0.46, p[1], B.wP*0.20, B.hP*0.38, ang, PALACE_GOLD);

  /* the rake, segment by segment. nSeg is chosen so the RISE PER STEP is
     smaller than the gilt coping is thick — the first version's steps were
     1.3 units of rise under a 0.85-unit coping, which left a visible gap at
     every joint and read as a gold staircase, not a raking member. */
  var rS = B.rP - B.dP*0.42, rW = B.rWall, run = rS - rW;
  if(run < 4) return;
  var segD = run/B.nSeg*1.45, copeH = Math.max(1.5, (B.yLand-B.springY)/B.nSeg*2.2);
  for(var i=0;i<B.nSeg;i++){
    var t   = (i+0.5)/B.nSeg;
    var r   = rS + (rW - rS)*t;
    var top = B.springY + (B.yLand - B.springY)*t;                                   /* extrados: a straight rake */
    var sof = B.impostY + (B.soffitWall - B.impostY)*t + B.archRise*Math.sin(Math.PI*t);
    var q   = loc(c.x, c.z, lat, r, ang);
    BOX(q[0], sof, q[1], B.wFly,      Math.max(1.2, top-sof), segD, ang, B.stone);
    BOX(q[0], top, q[1], B.wFly*1.12, copeH,                  segD, ang, PALACE_GOLD, 'metal');
  }
  var w = loc(c.x, c.z, lat, rW + 1.2, ang);
  BOX(w[0], B.soffitWall-3.2, w[1], B.wFly*1.6, 3.4, 4.2, ang, BASALTC[0]);          /* wall corbel */

  /* the WALL BUTTRESS the flyer actually braces: a pilaster carried down the
     tier face from the corbel to the terrace. The face is a 50-degree batter,
     so a single vertical box cannot lie on it — this is the same stepped
     approximation the flyer uses, turned on its side, each block set at the
     real face radius for its own height (faceHwAt on the recorded tier
     geometry). Without it the flyer's thrust arrives at a blank wall and the
     whole assembly reads as decoration stuck on a pyramid. */
  var nPil = Math.max(8, Math.round(B.pilH/0.9)), pStep = B.pilH/nPil;
  for(var j=0;j<nPil;j++){
    var py = B.pilTop - (j+1)*pStep;
    var pr = faceHwAt(B.up, py + pStep*0.5) + 1.6;
    var pq = loc(c.x, c.z, lat, pr, ang);
    BOX(pq[0], py, pq[1], B.wFly*1.5, pStep*1.55, 3.6, ang, shade(B.stone, 0.03));
  }
  var cap = loc(c.x, c.z, lat, faceHwAt(B.up, B.pilTop) + 1.8, ang);
  BOX(cap[0], B.pilTop, cap[1], B.wFly*1.8, 1.1, 4.2, ang, PALACE_GOLD, 'metal');
}

/* a corner atrium: a hollow square court on a terrace, open to the sky. */
function palaceAtrium(c, qx, qz, terrY, aHW){
  var ax = c.x + qx, az = c.z + qz;
  var wT = aHW*0.21, wallH = aHW*0.80;
  var stone = shade(c.tone, 0.14);
  var roofIn = aHW - wT - aHW*0.34, roofOut = aHW + 0.6;
  var roofY = terrY + wallH + 0.9;

  BOX(ax, terrY+0.05, az, roofIn*1.86, 0.55, roofIn*1.86, 0, PALACE_PORPHYRY);          /* porphyry court floor */
  CYL(ax, terrY+0.60, az, roofIn*0.34, 0.40, 0, PALACE_GOLD, 'metal');                  /* gilt rosette */
  for(var s=0;s<4;s++){
    var rot = s*Math.PI/2;
    var wp = loc(ax, az, 0, aHW-wT*0.5, rot);
    BOX(wp[0], terrY-0.8, wp[1], aHW*2, wallH+0.8, wT, rot, stone);
    BOX(wp[0], terrY+wallH*0.58, wp[1], aHW*2*1.02, 0.85, wT*1.14, rot, PALACE_GOLD, 'metal');  /* stringcourse */
    BOX(wp[0], terrY+wallH-0.7,  wp[1], aHW*2*1.09, 1.5,  wT*1.62, rot, BASALTC[0]);            /* cornice */
    /* ambulatory roof — ONE SLAB PER SIDE, stopping short of the court, so
       the centre stays a real open well (houseOfHealing()'s rule). */
    var rp = loc(ax, az, 0, (roofIn+roofOut)*0.5, rot);
    BOX(rp[0], roofY, rp[1], aHW*2*1.02, 1.1, roofOut-roofIn, rot, PALACE_GOLD, 'metal');
    var ep = loc(ax, az, 0, roofOut+0.2, rot);
    BOX(ep[0], roofY+1.1, ep[1], aHW*2*1.04, 0.7, 1.4, rot, BASALTC[0]);                        /* eaves line */
    var op = loc(ax, az, 0, roofIn+0.6, rot);
    BOX(op[0], roofY+1.1, op[1], roofIn*2*1.02, 0.9, 1.3, rot, BASALTC[0]);                     /* oculus rim */
    /* the ambulatory floor, ONE STRIP PER SIDE (never a slab across the
       middle — same rule as the roof above it), raised 1.1 above the terrace
       so the court itself is genuinely sunk below the walk around it. That
       step is what makes it read as a well rather than a fenced square: a
       tier here is one solid FR8 block and cannot be perforated, so the
       atrium is built UP from the terrace rather than cut DOWN into the
       tier, and the sunken court is how that difference is disguised. */
    var fp = loc(ax, az, 0, (roofIn + aHW - wT*0.5)*0.5, rot);
    BOX(fp[0], terrY, fp[1], aHW*2*0.99, 1.1, (aHW - wT*0.5) - roofIn, rot, shade(stone,-0.10));
    for(var k=0;k<3;k++){                                                                        /* inner colonnade */
      var cp = loc(ax, az, (k-1)*aHW*0.60, aHW-wT-1.6, rot);
      CYL(cp[0], terrY+1.1, cp[1], aHW*0.058, wallH*0.82, 0, PALACE_GOLD, 'metal');
      DOME(cp[0], terrY+1.1+wallH*0.82, cp[1], aHW*0.085, aHW*0.070, 0, PALACE_GOLD, 'metal');
    }
    for(var g=-1; g<=1; g+=2){                                                                   /* skylight cupolas */
      var lp = loc(ax, az, g*aHW*0.52, (roofIn+roofOut)*0.5, rot);
      CYL(lp[0], roofY+1.1, lp[1], aHW*0.105, aHW*0.30, 0, PALACE_GOLD_DK, 'metal');
      BOX(lp[0], roofY+1.1+aHW*0.30, lp[1], aHW*0.27, 0.5, aHW*0.27, 0, BASALTC[0]);
      DOME(lp[0], roofY+1.6+aHW*0.30, lp[1], aHW*0.130, aHW*0.115, 0, PALACE_GOLD, 'metal');
      CONE(lp[0], roofY+1.6+aHW*0.415, lp[1], aHW*0.032, aHW*0.13, 0, PALACE_GOLD);
    }
  }
  for(var cf=0; cf<4; cf++){                                                                     /* corner posts */
    var ca = cf*Math.PI/2, e = aHW - wT*0.35;
    var pp = loc(ax, az, e, e, ca);
    FR8(pp[0], terrY-0.8, pp[1], wT*1.9, wallH+3.6, wT*1.9, 0, stone);
    BOX(pp[0], terrY+wallH+2.8, pp[1], wT*2.2, 1.1, wT*2.2, 0, BASALTC[0]);
    CONE(pp[0], terrY+wallH+3.9, pp[1], wT*0.62, wT*1.9, 0, PALACE_GOLD);
  }
  inspectClaim(ax, az, aHW, aHW, 0, 'palaceAtrium', 'Palace atrium');
}

/* an open lantern kiosk — the narrow upper terraces' corner marker, and the
   skylight motif in its smallest form. */
function palaceKiosk(c, qx, qz, terrY, kHW){
  var kx = c.x + qx, kz = c.z + qz, colH = kHW*1.15;
  BOX(kx, terrY-0.4, kz, kHW*1.86, 1.1, kHW*1.86, 0, BASALTC[0]);
  BOX(kx, terrY+0.7, kz, kHW*1.52, 0.5, kHW*1.52, 0, PALACE_PORPHYRY);
  for(var k=0;k<4;k++){
    var ka = Math.PI/4 + k*Math.PI/2;
    CYL(kx + Math.cos(ka)*kHW*0.80, terrY+0.7, kz + Math.sin(ka)*kHW*0.80,
        kHW*0.13, colH, 0, PALACE_GOLD, 'metal');
  }
  BOX(kx, terrY+0.7+colH, kz, kHW*1.72, 1.2, kHW*1.72, 0, BASALTC[0]);
  DOME(kx, terrY+1.9+colH, kz, kHW*0.86, kHW*0.66, 0, PALACE_GOLD, 'metal');
  CONE(kx, terrY+1.9+colH+kHW*0.66, kz, kHW*0.16, kHW*0.62, 0, PALACE_GOLD);
}

/* ================= PALACE: BRIDGE ARRIVALS AND FACE GARDENS ===============
   Owner, after the gilt redesign ("for the palace, I love it"): three
   targeted things — the Foreign bridge "runs into the architecture"; the
   Ancestry and Granary bridges "clip into the architecture ... redo the model
   so there are some pointed arches here the bridges can intersect"; and "the
   new model has a somewhat empty space on the midpoints of all 4 sides where
   the gold trim does not run", traced on the south face as
   [[-342.5,802.9],[-369.1,904.6],[-287.2,904.1],[-309.9,802.3]], to be
   gardened on all four faces.

   ---- WHAT ACTUALLY CLIPPED, measured before anything was moved ------------
   Every number below came out of a headless pass over the built scene's own
   InstancedMesh matrices (the same primitives BUCKET pushed), re-expressed in
   each span's own radial/lateral frame about the Palace centre. Not estimated:

     Ancestry (bearing -179.0 deg, deck w=14.0) and Granary (85.9 deg, w=16.6)
       both land within the parapet gap at their face midpoint and are clear of
       every pier, drum and atrium — but both drive straight through TIER 0's
       FACE SPIRE, the 80.4-wide, 44.2-tall cone monoCanton() roots at
       r=204.9 on each face (base y=42.1, apex y=86.3). The deck rides y=52.5
       to 55.5 with parapets to 57.9, i.e. through the fattest part of it.
       That one cone is the whole complaint; nothing else on those two
       bearings is touched.
     Foreign (122.3 deg, w=12.3) is NOT on a face midpoint: it arrives 102.9
       units sideways along the south face, and its deck passes through the
       flying-buttress PIER at lateral 115.7 (shaft 8.5x11.5 from y=55.5 up
       17.3, on an 11.0x14.4 plinth) and across the terrace parapet run.
       Worse, landing()'s own stair foot is placed at RADIUS entryHw=160.7
       along the bearing, and this canton is a SQUARE: at 122.3 deg that point
       is 135.9 from the centre in square terms, i.e. 24.8 units INSIDE tier
       1's solid flank. The stair did not land on a surface at all.
     Temple (-44.5 deg, w=13.3) is the fourth span and the owner did not
       mention it. Reported rather than silently changed: it arrives 135.0
       units sideways along the +x face, which is past the outer pier and into
       the CORNER ATRIUM, and its deck clips that atrium's wall slabs
       (33.6x3.5, y=54.9 up 14.2), its corner post and three of its gold
       colonnade shafts. Its stair foot is 114.7 in square terms — 46 units
       inside tier 1. Fixing it means moving it the same way Foreign moves;
       left alone here because it was not asked for and the swing is large.

   ---- THE RULE FOR WHERE A SPAN MAY LAND ----------------------------------
   The Palace face is divided by its own buttresses, and those divisions are
   what decide this rather than taste. On each face, going out from the
   middle: an open bay at lateral 0 (half-width innerHw*0.24 = 38.6 — the gap
   the terrace parapet already carries, and the owner's garden bay), then a
   pier at 0.30, a clear bay at 0.51, a pier at 0.72, then the run out to the
   corner atrium. So there are exactly TWO places a bridge belongs: the
   midpoint bay, and the 0.51 bay between the two piers. A landing already in
   the midpoint bay is left byte-for-byte alone (Ancestry, Granary); anything
   else still on the face is snapped to the 0.51 bay's own centre (Foreign,
   Temple). The bound is the parapet run's own outer end, innerHw*0.98 = 157.5
   — past that you are in the corner quadrant, where the atrium stands; nothing
   currently lands there.

   SECOND PASS, owner: "fix temple bridge too". That span was left alone the
   first time because at lateral 135.0 it was past the outer pier and read as a
   corner arrival — but it is the worst of the four, measured driving its deck
   through the corner atrium's own corner post (a 6.7x17 FR8), two of its
   33.6 x 14.2 x 3.5 wall slabs, three of its gold colonnade shafts and two
   gilt eaves lines, with its stair foot 46.0 units inside tier 1's solid
   flank. The bound moves from 0.76 to 0.98 of innerHw and it snaps into the
   0.51 bay like any other.

   Why it cannot instead be sent to the midpoint gate on that face, since that
   is the obvious question: Temple sits almost exactly on the Palace's +x/-z
   diagonal — the face snap picks +x by 2.5 units of nothing — so its deck
   leaves whichever face it is given at a steep angle: 55.7 degrees off the
   normal in the 0.51 bay, 61.4 if it were put on the midpoint. Across a
   17-deep gate a 61-degree deck drifts 31 sideways, and with its own 21-unit
   lateral half-footprint it needs about 73 units of clear opening against the
   44 the gate has. It would go in one side and out through the other. The 0.51
   bay is open sky rather than an arch, which is the only thing a diagonal
   arrival fits — and is the whole reason that bay is in this rule. */
var PAL_BAYS = null;
function palaceBays(c, innerHw){
  if(PAL_BAYS && PAL_BAYS.canton === c.n) return PAL_BAYS;
  var idx = CANTONS.indexOf(c), out = [];
  var gapHw = innerHw*0.24, bayLat = innerHw*0.51, faceEnd = innerHw*0.98;
  /* footR is entryHw, which IS tier 1's own base half-width — monoCanton sets
     entryHw = hw*0.80 at the end of tier 0 and that is exactly this innerHw.
     Taken from the argument rather than from CANTON_TOPS so this can be called
     from inside the tier loop, before that record exists (the face gates need
     it there). */
  var rL = c.r*0.94, footR = innerHw;
  SPANS.forEach(function(sp){
    var other = (sp.a===idx) ? CANTONS[sp.b] : (sp.b===idx) ? CANTONS[sp.a] : null;
    if(!other) return;
    var dx = other.x-c.x, dz = other.z-c.z, L = Math.hypot(dx,dz) || 1;
    var rx = c.x + dx/L*rL, rz = c.z + dz/L*rL;          /* what the SPANS loop would use */
    var ox = rx-c.x, oz = rz-c.z;
    var nx, nz;                                           /* the flat face it belongs to */
    if(Math.abs(ox) > Math.abs(oz)){ nx = ox>0?1:-1; nz = 0; } else { nx = 0; nz = oz>0?1:-1; }
    var tx = -nz, tz = nx;                                /* that face's own sideways axis */
    var lat = ox*tx + oz*tz, tgt = lat, moved = false;
    if(Math.abs(lat) > gapHw && Math.abs(lat) <= faceEnd){
      tgt = (lat<0?-1:1)*bayLat; moved = true;
    }
    var ax = moved ? c.x + nx*rL + tx*tgt : rx;
    var az = moved ? c.z + nz*rL + tz*tgt : rz;
    /* the deck's own direction out of this landing — NOT the face normal. A
       bridge that leaves at an angle drifts sideways as it crosses the parapet
       band, and the terrace has to be opened where the deck actually is rather
       than symmetrically about the landing. The far end is where the SPANS
       loop puts it, off the unshifted centre line, so this is the real deck
       bearing and not an approximation of it. */
    var obx = other.x - dx/L*other.r*0.94, obz = other.z - dz/L*other.r*0.94;
    var vx = obx-ax, vz = obz-az, vl = Math.hypot(vx,vz) || 1;
    out.push({ other:other.n, nx:nx, nz:nz, tx:tx, tz:tz, lat:tgt, rawLat:lat, moved:moved,
               rawX:rx, rawZ:rz, x:ax, z:az, vx:vx/vl, vz:vz/vl,
               footX: c.x + nx*footR + tx*tgt,
               footZ: c.z + nz*footR + tz*tgt });
  });
  out.canton = c.n;
  PAL_BAYS = out;
  window._palaceBays = out.map(function(b){
    return { from:b.other, lat:Math.round(b.lat), wasLat:Math.round(b.rawLat), moved:b.moved,
             x:Math.round(b.x), z:Math.round(b.z),
             obliqueDeg:Math.round(Math.acos(Math.min(1,Math.abs(b.vx*b.nx+b.vz*b.nz)))*180/Math.PI) };
  });
  return out;
}
/* the SPANS loop's hook. Returns null for every canton but the Palace and for
   every Palace arrival that is staying exactly where it was, so the geometry
   and — more to the point — the PRNG draw sequence of every other span is
   untouched. `foot` is the stair's real landing on tier 1's FLAT face, which
   is what landing()'s own radius-based guess cannot give on a square. */
function palaceLandingShift(c, ax, az){
  if(c.n !== 'Palace' || !PAL_BAYS) return null;
  for(var i=0;i<PAL_BAYS.length;i++){
    var b = PAL_BAYS[i];
    if(Math.abs(b.rawX-ax) < 0.5 && Math.abs(b.rawZ-az) < 0.5)
      return b.moved ? { x:b.x, z:b.z, foot:[b.footX, b.footZ] } : null;
  }
  return null;
}

/* ---- A POINTED ARCH, inside an axis-aligned primitive set ----------------
   Owner: "redo the model so there are some pointed arches here the bridges
   can intersect". This replaces tier 0's face-spire CONE — the thing the
   Ancestry and Granary decks were measured driving through — with a gate
   pierced by a pointed arch, standing on the spire's own FR8 podium, which is
   kept exactly as it was. Built on all four faces, because the parapet gap,
   the garden bay and the tier-0 spire are all already symmetric and a gate on
   two faces only would read as damage.

   Approximation, and why this shape and not the other one:
     - The half-dome-over-a-lintel trick the chapel and monastery gates use is
       a ROUND arch and cannot be made to read as pointed; sized against an
       opening this wide it has also twice ballooned into a mushroom cap. Not
       used here.
     - What IS expressible is the flying buttresses' own lesson from the gilt
       pass: a stepped run of axis-aligned boxes reads as a curve as soon as a
       continuous bright EDGE follows it. So the arch head is a ring of N
       stacked voussoir boxes whose inner face follows a real two-centred
       arch intrados, struck from a centre set eFr*halfSpan OUTBOARD of the
       opposite impost —
           e = eFr*halfSpan,  R = halfSpan + e,  rise = halfSpan*sqrt(1+2*eFr)
           x(dy) = sqrt(R*R - dy*dy) - e          (dy measured up from the impost)
       — which is the classical drop-arch construction, and the outboard
       centre is exactly what makes the two arcs CROSS at a point instead of
       meeting tangentially in a crown. Each course carries a black soffit
       liner on its inner edge (so the opening reads as a shadow, not a stone
       slot) and a gilt line on its outer edge; those two converging lines,
       meeting at a porphyry keystone, are what say "pointed", and the stone
       behind them can step as coarsely as it likes.
     - eFr = 0.68: rise 1.54 halfSpans, rise:span 0.77 (an equilateral arch is
       0.87, a semicircle 0.50) and a 132-degree crown. Screenshot-driven — see
       the note in the function itself for what the first, much flatter, cut
       actually looked like.

   SIZED OFF THE REAL BRIDGE, NOT OFF THE WALL, and the first cut of this got
   it wrong in a way worth recording: a 38-wide opening centred on the face
   midpoint looked generous until the built scene was re-measured, and the
   Granary deck was found clipping 4.1 units into the right jamb. The bridge
   does not arrive down the middle — that landing sits 13.9 sideways of the
   midpoint and the deck drifts a further 0.9 outward over the gate's own
   depth, so the widest deck-plus-parapets in the city (w=16.56, half-span
   8.25) actually occupies lateral +6.6 to +23.1, not +-8.25. And the widest
   thing to pass through is not the deck at all but landing()'s own cap
   PLATFORM under it (w*2.05 by w*2.6 = 33.9 x 43.0), which spans lateral -4.5
   to +32.4 and reaches out to r=214.9, i.e. all the way to the tier-0 cornice
   edge where the gate has to stand. So:
     - the opening is half-width 22.0 (44 clear), against that 36.9-wide cap;
     - the gate SLIDES sideways to follow the bridge it serves, by that
       landing's own lateral offset (south 13.9, west -3.3 — Ancestry lands
       almost dead centre; north and east not at all), clamped to 0.42 of the
       parapet gap so it stays recognisably a midpoint gate. That leaves 3.5
       clear either side of the cap, 8.1 clear of the widest parapet, and the
       outer of landing()'s two flanking pinnacles inside the arch head with
       4.5 to spare at its own tip height.
   The south gate's flank then runs 4.9 past the end of the parapet run beside
   it; that is deliberate and left alone — a low 1.9-unit terrace parapet
   dying into a gate pier is what should happen, and the pier and the gate
   never meet (the flying-buttress piers sit at r=178.7-190.1, the gate at
   r=196.4-213.4).

   The springing at ySill+0.78*halfSpan = 59.2 is chosen to READ — level with
   the deck parapets so the arch looks as if it springs off the roadway — not
   to clear them: the parapets run at lateral +-8.25 and the jambs start at 22,
   and at lateral 8.25 the arch soffit is already at y=88.0, so nothing can
   touch whatever the springing height is. Apex y=93.0, against the 86.3 of the
   cone it replaces; the crown cornice tops out at 97.4 and the gilt finial at
   103.2. The cone was 80.4 wide and this gate is 59.0, so the face midpoint
   reads taller and narrower than it did, which is the one deliberate change
   the pointed arch forces on a silhouette the owner already liked. */
/* how far this face's gate slides to stay over the bridge that passes through
   it: that arrival's own lateral offset, clamped so the gate block still stops
   inside the parapet gap. Only a MIDPOINT arrival counts — a span that had to
   be moved out to the 0.51 bay, or one that arrives at a corner, is not coming
   through this gate and must not drag it sideways. `a` is the spire loop's own
   face angle, whose outward direction is (cos a, sin a). The sideways axis
   must be loc()'s OWN — (sin a, -cos a) for the gry = PI/2 - a that palaceGate
   builds in — not palaceBays()'s canonical (-nz, nx), which is its negative:
   the first cut used the canonical one and slid the south gate 8.2 units the
   wrong way, putting its right jamb straight through the Granary deck. */
function palaceGateShift(c, a, innerHw, jOut){
  var bays = palaceBays(c, innerHw), gapHw = innerHw*0.24, lim = gapHw*0.42;
  var nx = Math.cos(a), nz = Math.sin(a), tx = Math.sin(a), tz = -Math.cos(a), best = 0;
  for(var i=0;i<bays.length;i++){
    var b = bays[i];
    if(b.moved) continue;
    if(Math.abs(b.nx-nx) > 1e-6 || Math.abs(b.nz-nz) > 1e-6) continue;
    if(Math.abs(b.rawLat) > gapHw) continue;                  /* a corner arrival, not this gate's */
    var l = (b.x-c.x)*tx + (b.z-c.z)*tz;
    if(Math.abs(l) > Math.abs(best)) best = l;
  }
  return Math.max(-lim, Math.min(lim, best));
}
/* the gates are raised inside monoCanton's own tier loop, which runs BEFORE
   palaceArchitecture() and therefore outside its BUCKET-diff bracket, so they
   keep their own tally rather than being left out of the reported cost. */
var PAL_GATE_I = 0;
function palaceGate(c, a, rG, ySill, oHW, dG, tone, shift){
  var gi0 = bucketTotal();
  var gry  = Math.PI/2 - a;                      /* loc()'s radial axis == this face's normal */
  var jOut = oHW*1.34;                           /* the gate block's own half-width */
  var ySpr = ySill + oHW*0.78;                   /* the impost line, above every deck parapet */
  /* the two-centred construction. eFr is the ONE number that decides whether
     this reads as pointed: each arc is struck from a centre set eFr*halfSpan
     OUTBOARD of the opposite impost, so the two arcs cross at the crown at
     2*atan(...) instead of meeting tangentially. At eFr=0 it is a semicircle;
     at eFr=1 an equilateral arch. 0.68 gives a 132-degree crown and a rise of
     1.54 halfSpans — the first cut of this pass derived the rise directly
     (rise = 1.20*halfSpan, eFr 0.22 implied) to keep the apex near the 86.3 of
     the cone it replaces, and the screenshot showed exactly what that number
     means: a 159-degree crown, i.e. a flat-topped hole. Height had to give. */
  var eFr  = 0.68;
  var e    = oHW*eFr, R = oHW*(1+eFr), hA = oHW*Math.sqrt(1+2*eFr);
  var vD   = oHW*0.34;                           /* voussoir depth */
  var N    = 24;
  var st   = shade(tone, 0.13);
  var S    = shift || 0;
  function at(l){ return loc(c.x, c.z, S+l, rG, gry); }
  function xi(dy){ return Math.sqrt(Math.max(0, R*R - dy*dy)) - e; }

  BOX(at(0)[0], ySill-2.4, at(0)[1], jOut*2*1.10, 2.4, dG*1.10, gry, BASALTC[0]);   /* corbel course */
  /* jambs, with a porphyry course and a black impost block */
  [-1,1].forEach(function(s){
    var p = at(s*(oHW+jOut)*0.5);
    BOX(p[0], ySill,              p[1], jOut-oHW,        ySpr-ySill, dG,      gry, st);
    BOX(p[0], ySill+(ySpr-ySill)*0.46, p[1], (jOut-oHW)*1.04, 1.0,   dG*1.03, gry, PALACE_PORPHYRY);
    BOX(p[0], ySpr-1.6,           p[1], (jOut-oHW)*1.12, 1.6,        dG*1.08, gry, BASALTC[0]);
    var q = at(s*(oHW+0.7));
    BOX(q[0], ySill, q[1], 1.4, ySpr-ySill, dG*1.02, gry, BASALTC[2]);   /* jamb soffit liner */
  });
  /* THE ARCH HEAD. Each course spans one height band and starts at that band's
     INNERMOST soffit radius, so consecutive voussoirs overlap and the ring is
     continuous — the little tread it leaves poking into the opening is the
     stepping, and it points inward where nothing passes rather than outward
     where it would break the line. Every member's width carries that band's
     own lateral step, which is what keeps the black soffit line and the gilt
     extrados line UNBROKEN right up to the crown: near the apex the arch
     advances 3.6 sideways per 1.9 of rise, and a fixed 1.6-wide gilt bar there
     leaves a 2-unit hole at every joint. Same lesson as the flying buttresses'
     coping, one axis over. */
  for(var k=0;k<N;k++){
    var y0 = ySpr + hA*k/N, y1 = ySpr + hA*(k+1)/N;
    var x0 = xi(hA*k/N), x1 = xi(hA*(k+1)/N), step = Math.max(0, x0-x1);
    var hk = (y1-y0)*1.15, wv = vD + step;
    var wl = Math.max(1.4, step*0.95), wg = Math.max(1.6, step*0.95);
    [-1,1].forEach(function(s){
      var p = at(s*(x1 + wv*0.5));
      BOX(p[0], y0, p[1], wv, hk, dG, gry, st);                          /* voussoir */
      var q = at(s*(x1 + wl*0.5));
      BOX(q[0], y0, q[1], wl, hk, dG*1.02, gry, BASALTC[2]);             /* soffit shadow line */
      var g = at(s*(x1 + wv + wg*0.5));
      BOX(g[0], y0, g[1], wg, hk, dG*1.06, gry, PALACE_GOLD, 'metal');   /* the gilt extrados line */
      var sw = jOut - (x1 + wv + wg);
      if(sw > 0.9){
        var sp = at(s*(jOut - sw*0.5));
        BOX(sp[0], y0, sp[1], sw, hk, dG, gry, st);                      /* spandrel */
      }
    });
  }
  var ap = at(0), yA = ySpr + hA;
  BOX(ap[0], yA-2.0, ap[1], vD*1.15, 4.4, dG*1.04, gry, PALACE_PORPHYRY);/* keystone, on the point */
  BOX(ap[0], yA+2.4, ap[1], jOut*2*1.12, 2.0, dG*1.14, gry, BASALTC[0]); /* cornice */
  BOX(ap[0], yA+4.4, ap[1], jOut*2*0.98, 0.9, dG*1.02, gry, PALACE_GOLD, 'metal');
  FR3(ap[0], yA+5.3, ap[1], oHW*0.44, oHW*0.17, dG*0.44, gry, st);
  CONE(ap[0], yA+5.3+oHW*0.17, ap[1], oHW*0.16, oHW*0.22, gry, PALACE_GOLD);
  [-1,1].forEach(function(s){                                            /* flanking pinnacles */
    var p = at(s*jOut*0.84);
    FR3(p[0], yA+4.4, p[1], oHW*0.24, oHW*0.26, dG*0.28, gry, st);
    CONE(p[0], yA+4.4+oHW*0.26, p[1], oHW*0.09, oHW*0.22, gry, PALACE_GOLD);
  });
  inspectClaim(ap[0], ap[1], jOut, dG*0.5, gry, 'palaceGate', 'Palace bridge gate');
  PAL_GATE_I += bucketTotal() - gi0;
}

/* ---- THE FOUR FACE GARDENS ----------------------------------------------
   The owner's traced polygon is the parapet gap, seen from above: the terrace
   parapets carry a gap of innerHw*0.24 at lateral 0 on every face and every
   terrace, so the gaps stack into one radial strip per face running from
   r~102 out to the edge — which is exactly the 102-to-205 extent the owner
   traced, i.e. the bays on terraces 0, 1 and 2. All four faces get the same
   garden, laid in the canton's own face frame, so they mirror by construction.

   Formal, not scattered: a sunk gravel parterre with a gilt kerb, a 2x3 grid
   of porphyry-rimmed beds, clipped planting walked around each bed's own
   perimeter at an even step, a specimen at each bed's centre and a gilt
   basin on the bay's axis. The idiom is 70-veg.js's GARDENS section (an
   arranged perimeter walk, alternating two forms, one specimen at a recorded
   centre) rather than its wild scatter, and the species are that file's own
   builders — treeFern / giantGroundselV / birch / monkeyPuzzle / shrubCushion
   / succRosette / succBarrel — called, never reimplemented.

   TWO THINGS THIS HAS TO GET RIGHT
   1. It shares two of its twelve bays with a bridge. The Granary landing sits
      at lateral +13.9 of the south bay and the Ancestry landing at -3.3 of the
      west bay, each with a stair running inboard from it, and tier 1's own
      face spire stands in the middle of the north bay (it survives there
      because north is the one face with no bridge and so no approach door).
      So every piece is tested against a reservation list built from those
      real positions before it is drawn, and the planting closes around them
      instead of being placed on top: the bridge arrives through its gate and
      over the paving, with the beds either side of it.
   2. It must not consume a random number. Those builders are full of
      rr()/pick()/ri(), and this runs inside 50-cantons.js's canton loop where
      a single extra draw would move every canton, district and placement
      generated afterwards. The PRNG seed is therefore saved, set to a value
      derived from the bay's own face and terrace index, and restored — so the
      planting varies bay to bay, is identical run to run, and the stream the
      rest of this fragment sees is byte-for-byte what it was. */
/* Reserved ground on terrace 0 — the two bridge landings with their stairs,
   and tier 1's own face spire. Rectangles in each face's own lateral/radial
   frame rather than circles: a circle big enough to cover a 34x44 pylon cap
   also swallows half the bay, and the whole point is that the garden closes
   tightly around what is actually there. The pylon is sized at the widest a
   span can be (rr(12,17) -> 17), because the real w is drawn later, in the
   SPANS loop, and reading it here would mean consuming that draw early. */
var PAL_RESERVE = [];
function palFree(x,z,rad,ti){ return palFreeRect(x,z,rad,rad,0,ti); }
/* the rectangular form, for the beds and paving cells: a bed is 14.8 by 12.7
   and testing it as a disc of its own half-diagonal rejected two cells on the
   south face that clear the Granary landing's cap by 3.9 in reality. `ang` is
   ignored when hl === hr, so the point form above just calls through. */
function palFreeRect(x,z,hl,hr,ang,ti){
  for(var i=0;i<PAL_RESERVE.length;i++){
    var o = PAL_RESERVE[i];
    if(o.ti !== ti) continue;
    var dx = x-o.x, dz = z-o.z;
    var la = dx*Math.cos(o.a) - dz*Math.sin(o.a);
    var rd = dx*Math.sin(o.a) + dz*Math.cos(o.a);
    if(Math.abs(la) < o.hl+hl && Math.abs(rd) < o.hr+hr) return false;
  }
  return true;
}
function palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, ti, fi){
  var rIn = innerHw + 1.8, rOut = outerHw - 4.2, latHw = gapHw - 2.2;
  var depth = rOut - rIn;
  if(depth < 12 || latHw < 12) return 0;
  var rMid = (rIn+rOut)*0.5, planted = 0;
  var nU = 2, nV = 4;
  /* the gilt kerb round the bay, in segments rather than four long boxes, so
     the reservation test can drop the ones a bridge crosses. The first cut ran
     the outer kerb as one 72.7-unit bar and it came out lying across the
     Granary deck at y=56.2, between its parapets — caught by re-measuring the
     built scene, not by eye. */
  [-1,1].forEach(function(s){
    for(var i=0;i<nU;i++){
      var lz = -depth*0.5 + (i+0.5)*depth/nU;
      var p = loc(c.x, c.z, s*latHw, rMid+lz, ang);
      if(palFree(p[0], p[1], 1.6, ti))
        BOX(p[0], terrY+0.5, p[1], 1.4, 0.7, depth/nU, ang, PALACE_GOLD, 'metal');
    }
    for(var j=0;j<nV;j++){
      var lx = -latHw + (j+0.5)*(latHw*2)/nV;
      var q = loc(c.x, c.z, lx, rMid + s*depth*0.5, ang);
      if(palFree(q[0], q[1], 1.6, ti))
        BOX(q[0], terrY+0.5, q[1], (latHw*2)/nV, 0.7, 1.4, ang, PALACE_GOLD, 'metal');
    }
  });

  var cW = (latHw*2)/nV, cD = depth/nU, bW = cW-3.4, bD = cD-3.4;
  /* the species builders all call 70-veg.js's floraSample(), whose FLORA_SAMPLE
     table is a `var` in that fragment — declared (hoisted into BUILD's one
     scope) but not yet assigned this early in file order. Given a value here so
     the call works; 70-veg.js re-initialises it to {} when it runs, which is
     right — that table is only a screenshot aid and the Palace's planting is
     not part of the wild-flora sample set. */
  if(!FLORA_SAMPLE) FLORA_SAMPLE = {};
  var seed0 = seed;                       /* --- PRNG fenced off from here --- */
  reseed(940000 + fi*97 + ti*13);
  for(var u=0;u<nU;u++) for(var v=0;v<nV;v++){
    var lv = -latHw + (v+0.5)*cW, lu = rIn + (u+0.5)*cD;
    var bc = loc(c.x, c.z, lv, lu, ang);
    var gy = terrY + 1.7, ring = 6, slot = [];
    for(var i=0;i<ring;i++){                     /* an even walk round the bed, two forms */
      var t = (i/ring)*4, sd = Math.floor(t), q2 = (t-sd)*2-1;
      var lx = sd===0 ? q2*bW*0.40 : sd===1 ? bW*0.40 : sd===2 ? -q2*bW*0.40 : -bW*0.40;
      var lz = sd===0 ? -bD*0.40 : sd===1 ? q2*bD*0.40 : sd===2 ? bD*0.40 : -bD*0.40;
      var p = loc(bc[0], bc[1], lx, lz, ang);
      slot.push(palFree(p[0], p[1], 2.4, ti) ? p : null);
    }
    var nFree = slot.filter(function(p){ return !!p; }).length;
    /* the paving is laid whatever else happens — a bay with a bridge in it wants
       a forecourt where you step off the deck, not a half-empty planter. The bed
       itself only goes in where enough of its own border survives to read as
       planting rather than as an abandoned trough. */
    if(palFreeRect(bc[0], bc[1], cW*0.5-0.3, cD*0.5-0.3, ang, ti))
      BOX(bc[0], terrY,   bc[1], cW-0.6, 0.5, cD-0.6, ang, shade(c.tone,-0.16));  /* gravel */
    if(!palFreeRect(bc[0], bc[1], bW*0.5+0.85, bD*0.5+0.85, ang, ti) || nFree < 4) continue;
    BOX(bc[0], terrY+0.5, bc[1], bW+1.7, 0.8, bD+1.7, ang, PALACE_PORPHYRY);      /* bed rim */
    BOX(bc[0], terrY+1.3, bc[1], bW,     0.4, bD,     ang, shade(c.tone,-0.34));  /* bed soil */
    for(var i2=0;i2<ring;i2++){
      var p2 = slot[i2]; if(!p2) continue;
      if(i2%2===0) succRosette(p2[0], gy, p2[1], 1.30); else shrubCushion(p2[0], gy, p2[1], 1.40);
      planted++;
    }
    if(palFree(bc[0], bc[1], 5.0, ti)){
      var k = (u*nV + v + ti + fi) % 3;
      if(k===0)      treeFern(bc[0], gy, bc[1], 0.85);
      else if(k===1) giantGroundselV(bc[0], gy, bc[1], 0.78);
      else           succBarrel(bc[0], gy, bc[1], 1.90);
      planted++;
    }
  }
  /* a clipped hedge walked round the bay's own border at an even step — the
     same perimeter-walk idiom as 70-veg.js's compound and cloister gardens.
     This is what keeps a bay legible as a garden even where a bridge landing
     or tier 1's face spire has taken most of the middle of it. */
  var hedge = 16;
  for(var hh=0; hh<hedge; hh++){
    var t2 = (hh/hedge)*4, s2 = Math.floor(t2), q3 = (t2-s2)*2-1;
    var hx = s2===0 ? q3*(latHw-2.6) : s2===1 ? (latHw-2.6) : s2===2 ? -q3*(latHw-2.6) : -(latHw-2.6);
    var hz = s2===0 ? -(depth*0.5-2.6) : s2===1 ? q3*(depth*0.5-2.6)
                    : s2===2 ? (depth*0.5-2.6) : -(depth*0.5-2.6);
    var hp = loc(c.x, c.z, hx, rMid+hz, ang);
    if(!palFree(hp[0], hp[1], 2.2, ti)) continue;
    if(hh%2===0) shrubCushion(hp[0], terrY+0.5, hp[1], 1.25);
    else         succRosette(hp[0], terrY+0.5, hp[1], 1.15);
    planted++;
  }
  /* the axis: a gilt-rimmed porphyry basin where the bay is clear, and on the
     broad lowest terrace a pair of dark specimen trees at the inner corners */
  var bx = loc(c.x, c.z, 0, rIn + depth*0.5, ang);
  if(palFree(bx[0], bx[1], 7.0, ti)){
    CYL(bx[0], terrY+0.5, bx[1], latHw*0.20, 1.3, 0, PALACE_PORPHYRY);
    CYL(bx[0], terrY+1.8, bx[1], latHw*0.17, 0.5, 0, PALACE_GOLD, 'metal');
    CONE(bx[0], terrY+2.3, bx[1], latHw*0.05, latHw*0.22, 0, PALACE_GOLD);
  }
  if(ti === 0){
    [-1,1].forEach(function(s){
      var p = loc(c.x, c.z, s*latHw*0.76, rIn + depth*0.18, ang);
      if(!palFree(p[0], p[1], 8.0, ti)) return;
      if(fi % 2 === 0) monkeyPuzzle(p[0], terrY+0.5, p[1], 0.80);
      else             birch(p[0], terrY+0.5, p[1], 1.30);
      planted++;
    });
  }
  seed = seed0;                           /* --- PRNG restored, nothing consumed --- */
  var mid = loc(c.x, c.z, 0, rMid, ang);
  inspectClaim(mid[0], mid[1], latHw, depth*0.5, ang, 'palaceGarden', 'Palace face garden');
  return planted;
}

/* the whole additive programme, driven off the tier geometry monoCanton()
   has already recorded. Called once, after the tier loop. */
function palaceArchitecture(c, tierGeom, tierRings, topY){
  /* 4 per face, not the 6 the first pass tried: at 6 the piers were small
     enough that the terraces read as crowded with gold knick-knacks rather
     than as braced architecture. Fewer and much bigger is the whole
     difference between "a lot of flying buttresses" and clutter. */
  var NB = [4,4,4,4], LAT = { 4:[0.30,0.72] };
  var nButt = 0, nSky = 0, nAtria = 0;
  /* measured, not estimated: BUCKET (45-kit.js) is the one place every
     primitive lands, so summing its lists either side of this function gives
     an exact instance count for the redesign — reported rather than inferred
     from the budget delta, which concurrent passes in other fragments would
     otherwise contaminate. */
  var inst0 = 0, bk, pre = {}; for(bk in BUCKET){ pre[bk] = BUCKET[bk].list.length; inst0 += pre[bk]; }

  /* ---- where the bridges actually arrive, and what that reserves ---------
     Resolved once, here, off SPANS and the tier geometry — so the parapet
     runs, the terrace lanterns, the gardens and the SPANS loop's own landing
     all read ONE answer instead of three guesses. See palaceBays()'s comment
     for the rule and for the measured clips it exists to clear. */
  var bays = palaceBays(c, tierGeom[1].hwb), nGarden = 0, nBay = 0;
  PAL_RESERVE = [];
  var wMax = 17, rLand = c.r*0.94, footR = CANTON_TOPS[c.n].entryHw;
  bays.forEach(function(b){
    var ba = Math.atan2(b.nx, b.nz);
    PAL_RESERVE.push({ x:b.x, z:b.z, a:ba, hl:wMax*1.03+1.2, hr:wMax*1.32+1.2, ti:0 });
    PAL_RESERVE.push({ x:(b.x+b.footX)*0.5, z:(b.z+b.footZ)*0.5, a:ba,
                       hl:wMax*0.45+1.2, hr:(rLand-footR)*0.5+1.2, ti:0 });
  });
  /* tier 1's own face spire stands on terrace 0 at lateral 0 of whichever
     face carries no bridge approach (monoCanton skips it on the others so the
     approach door has a wall) — the same doorFace test, re-derived here from
     cantonApproachFaces() rather than passed in, so this cannot drift out of
     step with the loop that builds them. */
  var dFace = {};
  cantonApproachFaces(c).forEach(function(a2){
    var sx = Math.sin(a2), sz = Math.cos(a2);
    dFace[(Math.abs(sx) > Math.abs(sz)) ? (sx>0?0:2) : (sz>0?1:3)] = true;
  });
  var sHw = tierGeom[1].hwb;
  for(var sf=0; sf<4; sf++){
    if(dFace[sf]) continue;
    var sa = sf*Math.PI/2;
    PAL_RESERVE.push({ x:c.x + Math.cos(sa)*sHw*1.02, z:c.z + Math.sin(sa)*sHw*1.02,
                       a:Math.PI/2 - sa, hl:sHw*0.17+1.6, hr:sHw*0.17+1.6, ti:0 });
  }

  /* gilt stringcourse + porphyry hairline on every tier, recessed INSIDE the
     cornice overhang (hw*1.035 against the cornice's own hw*1.07) so nothing
     is added above the cornice top face — cantonFacesRecord()'s capTopOff of
     1.2 and the walkable ring deck both stay exactly where they were. */
  tierGeom.forEach(function(t){
    BOX(c.x, t.yb+t.th-3.0, c.z, t.hwb*2*1.035, 1.0, t.hwb*2*1.035, 0, PALACE_GOLD, 'metal');
    BOX(c.x, t.yb+t.th-4.2, c.z, t.hwb*2*1.014, 0.55, t.hwb*2*1.014, 0, PALACE_PORPHYRY);
  });

  for(var i=0; i<tierGeom.length-1; i++){
    var lo = tierGeom[i], up = tierGeom[i+1];
    var innerHw = up.hwb, outerHw = lo.hwb*0.99, wid = outerHw - innerHw;
    var terrY = tierRings[i].y + 2.6;              /* the ring deck's own top face */
    if(wid < 8) continue;

    var B = {};
    B.terrY  = terrY;
    B.stone  = shade(c.tone, 0.12);
    /* The pier stands well OUT on the terrace (0.62 of its width) and is
       slender rather than bulky, and the flyer springs from barely half way
       up it, leaving the pier's upper third, abacus and pinnacle standing
       free above the arch. That is the proportion that makes the thing read
       as a flying buttress instead of a ramp: at the first pass the pier
       was short, fat and close in, and the flyer was a small gold slope
       tucked behind it. Springing low is also what buys the RISE — the
       upper tier is only 27 units tall over a 38-unit terrace, so a flyer
       that springs from the pier's top has almost nothing left to climb. */
    B.dP     = Math.max(6, Math.min(wid*0.30, 13));
    B.wP     = Math.max(5.0, B.dP*0.74);
    B.rP     = innerHw + wid*0.62;
    B.hP     = Math.max(7, up.th*0.62);
    B.springY    = terrY + B.hP*0.55;              /* extrados springs mid-pier */
    B.impostY    = terrY + B.hP*0.34;              /* soffit springs off the pier's shoulder */
    B.yLand      = up.yb + up.th*0.90;             /* lands just under the tier cornice */
    B.soffitWall = B.impostY + (B.yLand - B.springY)*0.50;
    B.rWall      = faceHwAt(up, B.soffitWall);
    B.archRise   = (B.yLand - B.springY)*0.28 + 1.2;
    B.wFly       = B.wP*0.62;
    /* The stepping is intrinsic and cannot be designed away: the boxes
       advance by `spacing` and climb by `spacing*tan(rake)`, so the exposed
       tread is ALWAYS one spacing wide no matter how much consecutive
       segments overlap in depth (overlapping more just buries the far end of
       each tread, never the near end — worked through rather than guessed).
       The only real lever is making the spacing small enough to disappear,
       so nSeg is set from the run at ~0.95 units per step: about 4px at the
       distance these are actually looked at, and still only ~15px nose to
       the stone. Costs ~3,300 boxes across all 64 buttresses, which this
       budget has room for. */
    B.nSeg       = Math.max(8, Math.round(((B.rP - B.dP*0.42) - B.rWall)/0.95));
    B.up         = up;
    B.pilTop     = up.yb + up.th - 1.4;            /* just under the tier's own cornice */
    B.pilH       = B.pilTop - terrY;

    var nb = NB[i], lats = LAT[nb];
    for(var f=0; f<4; f++){
      var ang = f*Math.PI/2;
      lats.forEach(function(fr){
        [-1,1].forEach(function(sg){
          palaceButtress(c, ang, sg*fr*innerHw, B); nButt++;
        });
      });
      /* terrace parapet: two runs per face with a gap at the middle, where
         monoCanton's own face spire already stands (tier 1's spire is rooted
         on this very terrace at lateral 0 — checked, not assumed). */
      var gapHw = innerHw*0.24, runL = (innerHw*0.98 - gapHw);
      /* a span that had to be moved out to the 0.51 bay (palaceBays()) needs
         that bay OPEN too, or the deck arrives across a parapet. So on terrace
         0 the run is cut where such a bridge crosses it, and the two cut ends
         are finished as gate piers rather than left as a hole — the same
         "a bay a bridge lands in is deliberately open" reading the midpoint
         gap already has. Faces with no moved span keep the original two-run
         code untouched, so their geometry is byte-identical to before. */
      var cut = [];
      if(i === 0) bays.forEach(function(b){
        if(!b.moved) return;
        if(Math.abs(b.nx - Math.sin(ang)) > 1e-6 || Math.abs(b.nz - Math.cos(ang)) > 1e-6) return;
        /* Cut where the deck ACTUALLY crosses the parapet band, not a symmetric
           window about the landing. The first pass used a flat +-26 because the
           only moved span then (Foreign) leaves its face at 23 degrees and it
           made no difference; Temple leaves at 56, drifting 1.47 sideways per
           unit of radius and presenting a 17.8-unit lateral half-footprint
           where a square arrival presents 9.5 — and a symmetric window put a
           gate pier 3.0 units inside its deck. So: take the deck's own line
           across the band the parapet and its piers occupy, widen it by the
           deck's lateral half-extent at this obliquity (W/|dr|: the slab is W
           half-wide PERPENDICULAR to itself, which is W/|dr| measured along the
           face), and add the pier and a margin. For a square arrival this
           collapses to very nearly the old +-26. */
        var bl  = (b.x-c.x)*Math.cos(ang) - (b.z-c.z)*Math.sin(ang);
        var br  = (b.x-c.x)*Math.sin(ang) + (b.z-c.z)*Math.cos(ang);
        var dvr = b.vx*Math.sin(ang) + b.vz*Math.cos(ang);
        var dvl = b.vx*Math.cos(ang) - b.vz*Math.sin(ang);
        var kk  = dvl / (Math.abs(dvr) < 0.05 ? (dvr<0?-0.05:0.05) : dvr);
        var half = (wMax*0.5+1.5)/Math.max(0.30, Math.abs(dvr)) + 3.7 + 4.0;
        var la = bl + ((outerHw-5.6) - br)*kk, lb = bl + ((outerHw+1.4) - br)*kk;
        cut.push([Math.min(la,lb) - half, Math.max(la,lb) + half]);
        nBay++;
      });
      if(!cut.length){
        [-1,1].forEach(function(sg2){
          var pr = loc(c.x, c.z, sg2*(gapHw + runL*0.5), outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], runL, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], runL*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
      }else{
        var segs = [[-innerHw*0.98, -gapHw], [gapHw, innerHw*0.98]];
        cut.forEach(function(w2){
          var next = [];
          segs.forEach(function(sg4){
            if(w2[1] <= sg4[0] || w2[0] >= sg4[1]){ next.push(sg4); return; }
            if(sg4[0] < w2[0]) next.push([sg4[0], w2[0]]);
            if(w2[1] < sg4[1]) next.push([w2[1], sg4[1]]);
          });
          segs = next;
        });
        segs.forEach(function(sg4){
          var L2 = sg4[1]-sg4[0]; if(L2 < 2) return;
          var pr = loc(c.x, c.z, (sg4[0]+sg4[1])*0.5, outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], L2, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], L2*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
        cut.forEach(function(w2){                                   /* gate piers on the cut ends */
          [w2[0], w2[1]].forEach(function(lp){
            /* an oblique arrival can push a cut end out onto a flying buttress,
               whose own plinth and pinnacle already mark that point; a second
               pier on top of it reads as a stack. Dropped there, and the
               parapet simply ends against the buttress instead. */
            var onPier = false;
            lats.forEach(function(fr){ [-1,1].forEach(function(sg5){
              if(Math.abs(lp - sg5*fr*innerHw) < 11.5) onPier = true; }); });
            if(onPier) return;
            var pp = loc(c.x, c.z, lp, outerHw-1.6, ang);
            BOX (pp[0], terrY-0.8, pp[1], 7.4, 1.6, 7.4, ang, BASALTC[0]);
            FR8 (pp[0], terrY+0.8, pp[1], 6.0, 8.6, 6.0, ang, shade(c.tone,0.12));
            BOX (pp[0], terrY+4.0, pp[1], 6.2, 0.9, 6.2, ang, PALACE_PORPHYRY);
            BOX (pp[0], terrY+9.4, pp[1], 7.0, 1.3, 7.0, ang, BASALTC[0]);
            BOX (pp[0], terrY+10.7,pp[1], 6.0, 0.8, 6.0, ang, PALACE_GOLD, 'metal');
            CONE(pp[0], terrY+11.5,pp[1], 2.4, 5.2, ang, PALACE_GOLD);
          });
        });
      }
      /* gilt lantern drums along the terrace, in the bays BETWEEN the piers —
         glazed roof-lights over the tier below, not ornaments. Two per half
         face; the first pass put ten small ones per face and they read as
         speckle. */
      var lr = innerHw + (B.rP - B.dP*0.5 - innerHw)*0.45;   /* inboard, against the tier above */
      [0.51, 0.93].forEach(function(lf){
        [-1,1].forEach(function(sg3){
          var dl = sg3*lf*innerHw;
          /* the 0.51 drum is at the exact centre of the inter-pier bay, so it
             is also exactly where a moved bridge lands and where its stair
             runs. Dropped on that one bay only — one drum of 64. */
          for(var cb=0; cb<cut.length; cb++) if(dl > cut[cb][0] && dl < cut[cb][1]) return;
          var sp = loc(c.x, c.z, dl, lr, ang);
          BOX (sp[0], terrY-0.3,            sp[1], wid*0.22,  1.1,       wid*0.22, ang, BASALTC[0]);
          CYL (sp[0], terrY+0.8,            sp[1], wid*0.075, wid*0.20,  0,        PALACE_GOLD_DK, 'metal');
          BOX (sp[0], terrY+0.8+wid*0.20,   sp[1], wid*0.20,  0.8,       wid*0.20, ang, BASALTC[0]);
          DOME(sp[0], terrY+1.6+wid*0.20,   sp[1], wid*0.095, wid*0.085, 0,        PALACE_GOLD, 'metal');
          CONE(sp[0], terrY+1.6+wid*0.285,  sp[1], wid*0.024, wid*0.09,  0,        PALACE_GOLD);
          nSky++;
        });
      });
      /* THE FACE GARDEN, in the parapet gap at lateral 0. Terraces 0, 1 and 2
         only: their three gaps stack into exactly the r=102-to-205 strip the
         owner traced on the south face, and terrace 3's own gap is inboard of
         that and too narrow for a bed anyone could see. */
      if(i <= 2) nGarden += palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, i, f);
    }
    /* corners: full atria on the two broad lower terraces, open lantern
       kiosks on the two narrow upper ones (there is simply not the terrace
       width up there for a court anyone could stand in — said plainly
       rather than shipping a 6-unit "atrium"). */
    var cQ = (innerHw + outerHw)*0.5;
    for(var q=0; q<4; q++){
      var qa = Math.PI/4 + q*Math.PI/2;
      var qx = Math.cos(qa)*cQ*Math.SQRT2, qz = Math.sin(qa)*cQ*Math.SQRT2;
      if(i < 2){ palaceAtrium(c, qx, qz, terrY, wid*0.5*0.88); nAtria++; nSky += 8; }
      else     { palaceKiosk (c, qx, qz, terrY, wid*0.5*0.80); nSky++; }
    }
  }

  /* ---- the crown: a gilt clerestory drum, a stepped gold dome and a glazed
     oculus lantern, ringed by eight cupolas. The drum's tall windows are the
     "fancy skylight" at the scale of the whole silhouette — they are what
     lights the hall under the dome. */
  var dr = c.dome, y = topY;
  CYL(c.x, y+0.2,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum base ring */
  CYL(c.x, y+7.4,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum head ring */
  for(var w=0; w<16; w++){
    var wa = w*Math.PI/8;
    var wx = c.x + Math.cos(wa)*dr*1.34, wz = c.z + Math.sin(wa)*dr*1.34;
    BOX(wx, y+1.9, wz, 4.6, 5.4, 1.3, -wa, BASALTC[2]);                     /* dark glazing */
    var ma = wa + Math.PI/16;
    BOX(c.x + Math.cos(ma)*dr*1.35, y+1.7, c.z + Math.sin(ma)*dr*1.35, 1.5, 5.9, 1.6, -ma,
        PALACE_GOLD, 'metal');                                              /* gilt mullion */
  }
  for(var k2=0; k2<8; k2++){                                            /* cupola ring on the cornice */
    var ka2 = Math.PI/8 + k2*Math.PI/4;
    var cx2 = c.x + Math.cos(ka2)*dr*1.20, cz2 = c.z + Math.sin(ka2)*dr*1.20;
    BOX(cx2, y+10.8, cz2, 6.2, 1.0, 6.2, -ka2, BASALTC[0]);
    CYL(cx2, y+11.8, cz2, 2.5, 3.4, 0, PALACE_GOLD_DK, 'metal');
    DOME(cx2, y+15.2, cz2, 3.0, 2.5, 0, PALACE_GOLD, 'metal');
    nSky++;
  }
  CYL(c.x, y+10.8, c.z, dr*1.05, 2.2, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 1 */
  CYL(c.x, y+13.0, c.z, dr*0.99, 1.8, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 2 */
  var lanY = y+14.8 + dr*0.88;
  CYL(c.x, lanY,            c.z, dr*0.20, dr*0.24, 0, PALACE_GOLD_DK, 'metal');   /* oculus lantern drum */
  for(var lw=0; lw<8; lw++){
    var la = lw*Math.PI/4;
    BOX(c.x + Math.cos(la)*dr*0.20, lanY+dr*0.02, c.z + Math.sin(la)*dr*0.20, 1.1, dr*0.20, 1.1, -la, BASALTC[0]);
  }
  BOX(c.x, lanY+dr*0.24, c.z, dr*0.50, 0.9, dr*0.50, Math.PI/4, BASALTC[0]);
  DOME(c.x, lanY+dr*0.24+0.9, c.z, dr*0.21, dr*0.17, 0, PALACE_GOLD, 'metal');
  CONE(c.x, lanY+dr*0.24+0.9+dr*0.17, c.z, dr*0.055, dr*0.34, 0, PALACE_GOLD);
  nSky++;

  /* per-shape tri counts straight off SHAPES (45-kit.js): box/fr8/fr3 are 12
     (6 quads), cyl is a 10-gon (40), cone a 6-gon (12), dome a 16x8
     hemisphere (240). Tallied per bucket so the redesign's own triangle cost
     is a measured number rather than a share of a budget delta that
     concurrent passes in other fragments are also moving. */
  var TRI = { box:12, fr8:12, fr6:12, fr3:12, cyl:40, cone:12, dome:240, blob:60, stk:24 };
  var inst1 = 0, tri = 0;
  for(bk in BUCKET){
    var d = BUCKET[bk].list.length - (pre[bk] || 0);
    inst1 += BUCKET[bk].list.length;
    tri += d * (TRI[BUCKET[bk].shape] || 12);
  }
  window._palace = { buttresses:nButt, atria:nAtria, kiosks:8, skylights:nSky,
                     gates:4, gateInstances:PAL_GATE_I, gardenBays:12,
                     gardenPlants:nGarden, movedBays:nBay,
                     instances:inst1-inst0, triangles:tri,
                     porphyry:'PAL.stone.porphyry (promoted from the local literal this pass asked about)' };
}

