/* ============================== 0. PALETTE — FROZEN ==============================
   The single source of colour, atmosphere and material truth for Voth.

   OWNED BY THE PLANNER. Subagents may READ everything here and MUST NOT edit it.
   If a pass needs a colour that does not exist, it asks the planner to add one
   here rather than inventing a local constant. Every local `var XXXC = [0x..]`
   elsewhere in src/ is a bug: it is how five separately-reasonable agents end up
   with five separately-reasonable greys that do not sit together.

   Ashen Vvardenfell daylight: warm volcanic grey, low saturation, sun high in
   the south-east, everything dusted towards the haze colour with distance.
================================================================================ */

var PAL = {

  /* --- atmosphere ------------------------------------------------------- */
  haze      : 0xb9b0a0,     /* fog + sky background + far-shore wash          */
  fogDensity: 0.00019,      /* FogExp2; raise to hide the map edge, not to     */
                            /* hide bad geometry                              */
  sunColor  : 0xfff2d8,
  sunIntensity : 1.30,
  hemiSky   : 0xb9c6db,
  hemiGround: 0x4f4738,
  hemiIntensity : 0.34,
  ambient   : 0x7c8088,
  ambientIntensity : 0.13,

  /* --- built fabric ----------------------------------------------------- */
  stone : {
    /* gray-brown, per the owner: primary colour for cantons, the buildings
       standing on them, bridges and causeways. Was a warmer tan/yellow-grey
       (0xb3a68a etc.) — desaturated and cooled here so mottling reads as
       stone instead of a flat yellow plane from a distance; TONES_POOR
       (slums) is a separate social-class palette, untouched.
       Expanded 7 -> 24 shades in the same family: the owner's later report
       ("up close they look fine, but zoomed out it's clear how repetitive
       they are") isn't the procedural mottling texture at all — at typical
       city-wide viewing distance a texture that small on screen is already
       past several GPU mip levels, which blends ANY high-frequency canvas
       noise down toward its own flat average; no amount of texture-canvas
       tuning survives that, by construction. What DOES survive at distance
       is each building's own flat per-instance colour (vertex colour,
       never mip-mapped) — and with only 7 of those shared across every
       stone building in the city, a wide shot was always going to show a
       repeating 7-colour pattern regardless of texture quality. More,
       finer-grained shades directly fixes the thing that's actually
       visible at range; texture-canvas work (already 4 passes deep this
       session) was the wrong lever for THIS specific complaint. */
    common : [0x8c8579,0x7f7a6d,0x958e80,0x746d60,0x87816f,0x97907f,0x6f6a5c,
              0x827c6e,0x9a9384,0x6a6558,0x8f8873,0x7b7669,0xa19a8a,0x646050,
              0x8a8272,0x767162,0x928c7c,0x716b5e,0x9d9686,0x7d7868,0x888070,
              0x6d685b,0x968f7f,0x837d6f],
    poor   : [0x8b8069,0x7e7460,0x968b73,0x726851,0x877d66,0x9d9076],
    marble : [0xe8e1d2,0xdfd7c5,0xf1ebdd],    /* pale, for the funerary temple */
    /* funerary temple trim: cool neutral grey and a dark jade/verdigris —
       checked, nothing else in PAL reads either way. TONES/TONES_POOR and
       PAL.dome's "greys" are all warm tan-grey (kept that way on purpose,
       for the ashen daylight), so they read as more marble than accent when
       set beside pale marble; these two are deliberately cooler and darker
       so the inlay bands the necropolis temple wants actually contrast.
       Same 'stone' family bucket as everything else here — no new draw call. */
    grey   : [0x8c8f8a,0x7e827c,0x969992],
    jade   : [0x3f6b56,0x35594a,0x4a7d64],
    /* requested by the gate-modeling pass: near-black volcanic basalt (for
       the Harbor/Spirit gates' piers and the basalt wall variant) and a
       deep lapis blue (Harbor Gate's nautical inlay accent). Same 'stone'
       bucket, no new draw call. */
    basalt : [0x2b2a28,0x322f2b,0x242220],
    lapis  : [0x1f3f6e,0x2a4d80,0x17335c],
    /* deep red-purple imperial stone, for inlay courses and precious floors —
       the owner asked the Palace redesign for "a teeny bit of porphyry" and
       PAL had no red-purple at all (the nearest thing was PAL.banner's cloth
       reds, which are fabric tones and read as cloth on stone). Promoted from
       a local literal in 50-cantons.js on that pass's request. Deliberately
       dark: a first attempt at 0x6b2334 read as a pink stripe rather than a
       stone inlay at city viewing distance. */
    porphyry : [0x5e1e2d,0x6a2434,0x521826]
  },
  /* Spanish-style terracotta, for non-flat roofs (CONE spires, shed gables —
     the 'roof' family; hlaalu's flat parapet tops stay 'stone' and are
     unaffected). 3 reds + 1 each of green/purple/orange over a uniform
     pick() gives the owner's requested 50% red / rest split. Kept a shade
     dustier than a saturated showroom terracotta so it still sits in the
     ashen Vvardenfell palette rather than fighting it. */
  roof  : [0xb35a3a,0xa04f32,0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f],
  dome  : [0xb08d3c,0xa0843f,0x8f7a44,0xb0a682,0x9d9379,0xa8a08a,0x93886d],

  /* --- water agriculture ------------------------------------------------ */
  mud   : [0x6b5c46,0x5f523e,0x76664d,0x564b3a,0x6f6149],
  crop  : [0x5c6b3a,0x4e5c32,0x68753f,0x556140,0x707a46,0x8a8a4a,0x7b7d3e,0x9a8f4c],
  reed  : [0x7d7a4e,0x8b8556,0x6f6c45],
  willow: [0x6f7c46,0x7d8a4e,0x66743f,0x8a9358],
  fruit : [0x6f7d42,0x7b8a4c,0x8a9556,0x66743e,0x9a9a5a],   /* terrace orchards */

  /* --- vegetation ------------------------------------------------------- */
  leaf  : [0x4e5a34,0x43502e,0x5b6740,0x49523a,0x616a41,0x3c4628,0x6a6c46],
  fungus: [0x8d6a5e,0x7c5a58,0x9a7a5c,0x6e5a5e,0xa08464,0x7a6660,0x8a7a52],
  stalk : [0xbdb49c,0xaca38c,0xc8bfa6],
  trunk : [0x5d5140,0x6a5c48,0x4e4536],
  /* --- species the general trunk/leaf tones cannot cover, promoted from the
     wild-flora pass at its request. Each is here because PAL genuinely had
     no reach to it, not for convenience:
     birch/birchFleck — PAL.trunk is three dark browns and nothing is within
       reach of a near-white bole. That pale bark IS the species, and the dark
       lenticel bands are what make it read as birch rather than a dead stick.
     succulent — PAL.leaf/willow/fruit/crop are all olive-khaki; none reads
       grey-blue, and glaucous blue-green is the whole cue that a succulent is
       a different kind of plant from everything else growing here.
     deadLeaf — the dry marcescent skirt hanging under a giant groundsel's
       rosette. Close to PAL.reed but warmer and lighter; reed reads olive. */
  birch      : [0xe3ded0,0xd5cfbe,0xece7da],
  birchFleck : [0x4a463c,0x565044],
  succulent  : [0x7e9a8a,0x8fa898,0x6b8879],
  deadLeaf   : [0x9a8a63,0x877856],
  sail  : [0xcfc2a3,0xc0b190,0xb8a880,0xa89878],   /* ship canvas, cloth family */
  banner: [0x7a2028,0x8a2f2a,0x5c4028,0x4a3220,    /* deep reds and browns, */
           0xe8d9a0,0xc9b8d6,0xb8d0b0,0xb0c8d8,0xcbb08e,0xe8c090],  /* pastel yellow/purple/green/blue/brown/orange */
  bloom : [0xf3d6de,0xecc3cf,0xf7e6ea,0xe8b3c2],   /* cherry blossom, kept soft */
  /* water-taxi accent hues (wreath/trim/canopy) — one distinct colour per
     boat, 8 boats; see 78-life.js's own comment on why a single per-
     instance tint (not independent per-part colour) is what InstancedMesh
     actually allows here. */
  taxi  : [0xd0402c,0xd8b23a,0x3f8f6e,0x3a6fb0,0x8a4fc9,0xc9578a,0xe08a2a,0x4fb0a8],

  /* --- light, not surface -------------------------------------------------
     The colour a FLAME CASTS, for the night-illumination pass (45-kit.js's
     light map and 82-daynight.js's lit windows). Deliberately the only
     entry here in LINEAR space, not a hex: it is multiplied into
     reflectedLight before the sRGB encode, so a hex would be wrong by a
     gamma. ~#ffc480 once encoded. Promoted here from a local literal at the
     night-lighting pass's own request — per this file's rule, a colour used
     in two places belongs in PAL, and this is the one definition of what
     firelight looks like in Voth.

     `green` joins it at the Fortress pass's request — the sorcerous flame
     burning on the Ordinator fortress's four ornamental towers. Same LINEAR
     space and same role as `warm` (it is the wash the flame casts on the
     stone around it, 45-kit.js's NL_GREEN analytic lamps).

     `greenSprite` is NOT a third colour, it is the same flame seen head-on:
     the flame BILLBOARD is one shared instanced mesh whose material is
     already tinted `warm`, so a green instance has to be expressed as the
     per-instance factor that turns warm into green. Hence the >1 green
     component — (1.00,0.702,0.278) * this lands at (0.22,1.83,0.21), which
     is deliberately over-bright so the sprite blooms the way the temple
     braziers do. Change `green` and this needs re-deriving, not copying. */
  flame : { warm       : [1.00, 0.55, 0.21],
            green      : [0.14, 1.00, 0.22],
            greenSprite: [0.22, 2.60, 0.75] },

  /* --- smoke, by what is burning ------------------------------------------
     Promoted from local literals at the shared smoke-particle rig's request
     (65-facade.js, registerSmokeEmitter). Each trade gets a body tone and a
     hotter/darker tone for the first fraction of a puff's life at the flue
     mouth; all of them wash out toward PAL.haze as they dissipate, so the
     dissipation target needs no entry of its own.
     The domestic hearth tone is deliberately darker than the 0x9a958c the
     retired static blobs used — the pale version popped as white against the
     warren's dark roofs. */
  smoke : {
    forge   : { body:0x4d463f, hot:0x3f2a1c },
    kiln    : { body:0x8a8278, hot:0x5a4e42 },
    furnace : { body:0x9e968a, hot:0x6b5340 },
    hearth  : { body:0x8d8880 }
  },

  /* --- the Ordinators' coast guard ----------------------------------------
     The one black hull in the city — the Fortress canton's patrol junk
     (78-life.js). Promoted at that pass's request, and two of the six had
     the strongest case a colour can have: `sailGreen` and `sailGold` were
     ALREADY the same hexes typed out in two files each — the green is what
     ordinatorFortress() and the north dock's signal flag fly (65-facade.js),
     the gold is lifeOrdHullParts' helm and shield. The vessel wears its
     crew's colours, so they must not be free to drift apart.

     `hull` keeps a trace of brown on purpose: a pure black hull reads as a
     hole cut in the scene rather than tarred timber, and `trim` (the gold
     rubbing strake down the sheer and the collar at the bowsprit root) is
     what stops the silhouette going featureless at distance.

     sRGB hexes, like every other entry here — 78-life.js runs them through
     convertSRGBToLinear() at the call site, which it must, because the
     dock's own green flag ten metres away is converted and an unconverted
     sail renders visibly paler than the flag on the same structure. */
  cguard : { hull:0x14100d, trim:0xb08432,
             sailGreen:0x2f6b3a, sailGold:0xc9a227,
             battenGreen:0x1d4726, battenGold:0x8a6b1a },

  /* --- the Krator sky ------------------------------------------------------
     Promoted from 21-sky.js at that pass's request. This world is a tidally
     locked moon of a gas giant at 40°S: the giant hangs fixed in the northern
     sky and never moves, the sun and stars turn around it, and nights on this
     side are never fully dark. That premise is why these live in PAL rather
     than in one shader — the giant's colours are also LIGHT the city is lit
     BY, so `giant.zone` and `shine` have to stay recognisably the same hue or
     the planetshine stops looking like it comes from the thing in the sky.

     `sky` is a pressure ramp, not a single palette: Krator's air runs 0.8 atm
     on a plateau to 2.0 in the abyss, and thicker air scatters more, so the
     zenith and horizon each have a deep (thin air) and hazy (thick air) end
     that `pressureAtm` mixes between. A city sited elsewhere on the moon
     changes one number and gets its own sky.

     `eclRim` is the odd one and the most important: during an eclipse the
     giant is NEW by construction, so reflected planetshine is ~zero and the
     only thing lighting the city is sunlight REFRACTED through the giant's
     limb. It is therefore warm where `shine` is cool, and it is a separate
     entry precisely so nobody "simplifies" it back into the planetshine
     colour and reintroduces a total blackout at noon.

     sRGB hexes like everything else here; 21-sky.js runs them through
     convertSRGBToLinear() at the call site. */
  sky : {
    zenDeep : 0x35619c, zenHazy : 0x93a6bb,   /* zenith  at 0.8 / 2.0 atm */
    horDeep : 0xa9b3bd, horHazy : 0xdcd6c6,   /* horizon at 0.8 / 2.0 atm */
    sunset  : 0xc8703a, twilight: 0x35304a,   /* low-sun afterglow; eclipse dome */
    nightZen: 0x121a2e, nightHor: 0x24293c,
    star    : 0xdfe7ff,
    sunCore : 0xfff6e2, sunGlare: 0xffe0a4, sunLow: 0xff9d55,
    shine   : 0x86b6c6,   /* planetshine key — reflected, cool              */
    eclRim  : 0xc98a6a,   /* eclipse key — refracted, warm. NOT the same.   */
    soil    : 0x8c4a31    /* Krator's red soils, the hemisphere ground half */
  },
  giant : {
    zone : 0x3c7e91,   /* muted teal-blue zones — also PAL.sky.shine's source */
    belt : 0xd6c9a8,   /* cream belts                                        */
    storm: 0xb98a63,
    rim  : 0x9fd4ea,   /* atmospheric limb glow                              */
    night: 0x4b6f86,   /* the 3% night side, lit by this moon's own reflection */
    ring : 0xbcb09a
  },

  /* --- ground paint ----------------------------------------------------- */
  road  : { quay:'#c6bb9f', boulevard:'#a69b86', ring:'#988e7e', minor:'#8d8474', track:'#7a6c52', highway:'#b8a97e' },
  field : ['#8f8a4e','#7d8a45','#a09257','#6f7d3f','#a89a5a','#86905a']   /* painted farm plots */
};

/* ---- material families -------------------------------------------------
   One InstancedMesh is emitted per (shape, family) pair, so a family is also
   a draw-call bucket. `tex` is the procedural texture generator's slot: it is
   null until the texturing pass fills it, and the texturing subagent owns
   THIS TABLE ONLY — it does not touch geometry or placement.
   `scale` is the world-unit tiling size for the UV vertex hook.
------------------------------------------------------------------------- */
var FAMMAT = {
  stone  : { color:0xffffff, rough:1.00, tex:null, scale:[5.5,5.5] },
  plaster: { color:0xffffff, rough:0.95, tex:null, scale:[6.0,6.0] },
  roof   : { color:0xffffff, rough:0.90, tex:null, scale:[2.2,2.2] },
  wood   : { color:0xffffff, rough:1.00, tex:null, scale:[3.0,3.0] },
  dome   : { color:0xffffff, rough:0.70, tex:null, scale:[5.0,5.0] },
  leaf   : { color:0xffffff, rough:1.00, tex:null, scale:[1.5,1.5] },
  trunk  : { color:0xffffff, rough:1.00, tex:null, scale:[1.2,3.0] },
  fungus : { color:0xffffff, rough:0.85, tex:null, scale:[2.0,2.0] },
  metal  : { color:0xffffff, rough:0.45, tex:null, scale:[2.0,2.0] },
  /* banners, sails — anything hung from a fixed edge that should sway in the
     breeze. 45-kit.js gives this family a wind-sway vertex shader keyed off
     B.fam==='cloth', not a texture hook; tex stays null until a texturing
     pass wants to give it one (the sway code composes with worldUV fine if
     it ever does). */
  cloth  : { color:0xffffff, rough:0.95, tex:null, scale:[2.0,2.0] }
};

/* ============================== BUDGET ==============================
   Handed to every subagent as a hard ceiling, because each pass is
   individually reasonable and collectively fatal. `verify.py --budget`
   fails the build when a number here is exceeded.

   Measured at pass 4: 22 calls, 2.30M tris, 65k instances.
   Headroom below is deliberately thin — spend it on facades, not on
   another 4,000 trees.
==================================================================== */
var BUDGET = {
  /* 30 is the static bake's own ceiling (one per shape,family bucket +
     terrain/water/sky) — still true, still tight. +10 on top of it for the
     life layer (src/78-life.js): the static bake and moving entities are
     necessarily separate draw calls (BUCKET is instanced and immutable
     once built; a moving vehicle's matrix changes every frame), so this
     is a real, minimum-possible floor for the tier-1 vehicles landing per
     voth-life-layer-brief.md, not slack to spend elsewhere. The quay/pier
     decks and bollards these all dock at are genuinely static though, so
     those go through the ordinary box|wood/cyl|wood BUCKET combos and
     cost none of this. */
  drawCalls   : 84,          /* Krator sky brief: 72 -> 84, with the build at 69/72.
     The brief's own architecture requires a SECOND SCENE rendered before the
     city (background camera at the origin, autoClear off), and every object in
     it is a draw call the city's buckets can never absorb: the star points, the
     gas giant's sphere, its rings, the sun disc and its glare. A background
     scene is also the cheapest kind of headroom to grant — a handful of very
     large, very low-poly objects with no instancing and no overdraw against the
     city's own fabric. This raise is for those objects only; the city's own
     geometry still has to earn its buckets the usual way. Previous note kept.
     owner: "ok to raise draw calls" — 60 -> 72, with the
     build sitting at 59/60 and the arena combat system, a bespoke silt-strider
     model and the palace redesign all still to come, each likely wanting its own
     new (shape,family) bucket. Previous note kept below.
     owner: "what happens if we increase the draw call a little bit more?
                                 it's running fine on my pc still" — bumped 53->60, real headroom
                                 (not just budging the ceiling to paper over an overrun) for the still-
                                 queued tavern model and a real bespoke silt-strider mesh instead of
                                 the reused/rescaled caravan template. was 44 (30 static bake + 14 life
                                 layer: canoe x2, junk-hull+sails x1,
                                 galleon-hull+sails x1, ship-crew x1, ferry x2, river-barge x1,
                                 pleasure-barge x2, barge-people x1, pedestrians x1, ordinators x1,
                                 clergy x1 — that count was already missing the caravans mesh added in
                                 an earlier session, so this was always a slight undercount). +2 for
                                 82-daynight.js: one InstancedMesh for every brazier/torch/lantern post
                                 in the city (shared material, opacity-only animation — see that file's
                                 own comment), one mesh for the lighthouse beacon; both always in the
                                 draw list regardless of hour. +1 during daylight hours: the sun sprite
                                 (sunSprite) hides below the horizon at night, so the true ceiling is
                                 the daytime count, not night's 46. +1 for 83-weather.js's rain
                                 InstancedMesh (present at all times, opacity 0 when clear). +1 for
                                 78-life.js's penitents (5 groups of 3, one shared InstancedMesh — a
                                 second population sharing this same draw call was considered and
                                 rejected: an InstancedMesh's geometry is one buffer for every instance,
                                 so 3 genuinely distinct role silhouettes in 1 draw call isn't possible
                                 without per-instance shape selection this kit doesn't have; see that
                                 population's own comment for the setColorAt compromise used instead).
                                 +1 for 83-weather.js's ash-storm particle mesh (tumbling flecks with
                                 gale drift, separate from rain since the geometry/colour/motion all
                                 differ — present at all times, opacity 0 outside ash-storm weather).
                                 NOTE: a concurrent pass in this same session (61-monastery.js) landed
                                 its own draw call(s) separately and this number may need reconciling
                                 against that — not accounted for here, out of this edit's scope. */
  /* 52 — was 50: +2 for 78-life.js's water taxis (owner's own ask — 8 Thai-
     long-tail-inspired shuttle boats with no fixed route, zipping between
     ferry docks). Same "hull + people, 2 draw calls" floor every other
     boat population (canoes, ferries, ships, barges) already pays for the
     same structural reason: an InstancedMesh's matrix updates every frame,
     so a moving population can't share a draw call with the static bake,
     and a genuinely different hull silhouette can't share one with another
     moving population's own hull geometry either. */
  /* 53 — was 52: +1 for 78-life.js's guild workers (owner's own ask — the
     rebuilt Guild canton's 4 halls each need "a visible outdoor daytime
     activity," specifically smiths working a forge, warriors sparring,
     and an alchemist tending a rooftop herb garden — real moving/working
     NPCs, not static props). Folding these posts into an EXISTING posted
     population (ordinators/clergy, both already "array of fixed posts +
     one shared InstancedMesh" and both with zero spare instance capacity
     to grow into for free) was the first option tried and rejected: it
     would put a sword-and-shield or a mitre-and-robe on a hammering smith
     and mislabel the inspector for every one of them. One new, honestly-
     labelled, undecorated shared body that colour alone turns into smith/
     warrior/tender (guildWorkers' own comment, 78-life.js, has the full
     reasoning) is one draw call for a dozen+ NPCs across all 4 halls
     combined — not one per hall, which is the actual risk this budget
     line exists to head off. */
  triangles   : 5200000,     /* owner: "ok to raise things still run well" -- 4.0M -> 5.2M,
     headroom for a many-legged strider creature across 20 convoys, full-perimeter
     arena seating and the palace redesign. Previous note kept below.
     owner: "loosen the triangle budget to 4000000" --
     raised from 3.2M once several concurrent detail passes (taverns, new
     guild halls, ambient wildlife, plaster-building facade variety) made
     the old ceiling a real bottleneck; desktop target, mobile is roughly
     a third                                                              */
  instances   : 130000,     /* owner: "ok to raise things still run well" -- 100k -> 130k
     with the build sitting at 96.4k and three passes (arena combat, monastery
     monks + clan-compound workers, the bespoke silt strider) all drawing on the
     same pool at once, plus the palace redesign and canton-door work still to
     come. Previous note kept below.
     owner: "sure how much do you think you need?" -- raised
     from 95000 for the remaining queue (arena, quarries+housing, fishing
     boats, strider route 3, bespoke strider model, palace redesign) */
  /* per-subsystem instance allowances, so one pass cannot eat the lot */
  perPass : {
    facades   : 18000,       /* doors, windows, cornices, awnings, signage       */
    texture   : 0,           /* materials only — must add NO instances           */
    vegetation: 6000,        /* on top of the ~4,500 orchard + existing veg      */
    islets    : 1500,
    chinampa  : 2000         /* on top of the ~3,600 beds already placed         */
  }
};

/* ---- compatibility aliases: the rest of src/ reads these names ---------- */
var TONES      = PAL.stone.common;
var TONES_POOR = PAL.stone.poor;
var ROOFS      = PAL.roof;
var DOMEC      = PAL.dome;
var MUDC       = PAL.mud;
var CROPC      = PAL.crop;
var REEDC      = PAL.reed;
var WILLOWC    = PAL.willow;
var SAILC      = PAL.sail;
var BANNERC    = PAL.banner;
var BLOOMC     = PAL.bloom;
var TAXIC      = PAL.taxi;
var MARBLEC    = PAL.stone.marble;
var GREYC      = PAL.stone.grey;
var JADEC      = PAL.stone.jade;
var BASALTC    = PAL.stone.basalt;
var LAPISC     = PAL.stone.lapis;
var PORPHYRYC  = PAL.stone.porphyry;
var LEAFC      = PAL.leaf;
var FUNGC      = PAL.fungus;
var STALKC     = PAL.stalk;
var TRUNKC     = PAL.trunk;
var BIRCHC     = PAL.birch;
var BIRCHFLECKC = PAL.birchFleck;
var SUCCC      = PAL.succulent;
var DEADLEAFC  = PAL.deadLeaf;
var FRUITC     = PAL.fruit;
var ROADCOL    = PAL.road;
var FIELDC     = PAL.field;

/* ---- devtool line colours (87-pathviz.js) ------------------------------
   Not world colours — these never touch a material in the shipped scene;
   they are the path visualiser's own per-type line hues, and its
   auto-discovery ramp for populations that register no colour of their
   own. They live here because this file is where colour ARRAYS live, full
   stop (build.py enforces it), and because being able to read the whole
   legend in one place is the point of a colour-coded devtool. */
var PATHVIZ_STRIDER_COLS = [0x8a6a3c, 0x4a8a6c, 0x6a5a9a, 0xb06a8a, 0x3a8ab0];
var PATHVIZ_AUTO_COLS    = [0x46c8e6, 0xd76f9c, 0x86d24a, 0xd8a0ff, 0xffb347, 0x7fe0c0, 0xc2b280, 0xff7f7f];
