/* ============================== GUILD: FOUR CRAFT HALLS + LOCAL MARKET ====
   Guild's own dedicated dispatch, replacing the borrowed gardenDeck() —
   per the owner's explicit follow-up: "the current garden canton was the
   old Guild canton i thought. please reset this to being the guild canton
   in all deep and top level aspects", plus the design brief given earlier
   in the same conversation, applied to the canton actually named 'Guild'
   (not the separate 'Market' canton, which is its own thing and untouched
   here): "the blacksmith's, alchemist's, mason's, and a new warrior's
   guild halls in the center in its 4 quadrants and a small market in the
   center."

   Guild (r:120, tiers:3, top:38) is noticeably smaller than the dedicated
   Market canton (r:134) — hw arrives here already narrowed by platCanton()'s
   own tier loop (three rounds of *0.86 off c.r*0.97), so everything below
   is scaled off THAT hw directly rather than off c.r, and kept modest on
   purpose: four working guild halls in their own quadrants, not four more
   market plazas, plus a handful of stalls at the centre, not a second
   bazaar.

   Each hall is a real structure()-built mass (hlaalu for the three blocky
   trade halls, velothi for the alchemist's leaning tower) facing the
   centre (faceToward(), 69-district-content.js — a hoisted function
   declaration, safe to call here despite loading later in file-
   concatenation order, same as gardenDeck() already called
   cherryBlossom()/baobab()/dragonTree() from 65-facade.js), each finished
   with addDoor()/addWindows() (65-facade.js) so none of the four reads as
   a blank wall, plus its own small signature dressing so the four are
   visually distinct rather than four recolours of one building.

   Combos used below, every one already a live (shape,family) bucket in
   the actual built scene (checked directly against scene.traverse() over
   every InstancedMesh, not assumed from source — box|metal and cyl|metal
   in particular are already spent by ordinatorFortress()'s iron mast/
   gatehouse and the ship-anchor prop, contrary to this being a fresh
   bucket): box|stone(default), box|plaster, box|wood, box|cloth,
   box|metal, fr3|stone(default), fr6|stone, fr8|stone, fr8|cloth,
   cyl|stone(default), cyl|wood, cyl|metal, cone|roof(default),
   dome|dome, blob|leaf. Zero new draw calls against a budget already at
   50/50. No new palette arrays either (PAL is frozen) — colour is entirely
   pick()/shade() off existing PAL arrays (TONES, JADEC, STALKC, TRUNKC,
   BANNERC, ROOFS), plus two reused literals already live elsewhere in
   this exact file for the exact same meaning (0x8fb8c4 the "water" tint
   ancestryCanton()'s own channels use, for the quench trough).

   SECOND PASS (owner: "see if you can fit all the current guild houses
   onto the guild canton. make them a little more distnmguishable too...
   each guildhouse should have a visible outdoor activity they do during
   the day"). Fit was checked live (headless probe against CANTON_TOPS
   ['Guild']/CIDX['Guild'], then a top-down screenshot) before anything
   else — the 4 halls + market already sit inside the top tier's square
   deck with generous clearance on every side, tier-edge pillars included
   (those sit only at the 4 cardinal faces, 50-cantons.js's platCanton()
   loop just above; the halls sit on the diagonals, nowhere near them), so
   nothing needed resizing or moving.

   Distinguishing detail + the owner's own 4 example activities, added
   below in-place in each hall's own IIFE: the blacksmith gets a glowing/
   smoking forge (static bright accent colour for the glow, a static blob
   cluster for the smoke — both cheap, no new bucket, see that section's
   own comment) plus a lean-to forge-shed roof for a distinct low silhouette,
   the mason gets a statue garden (statue(), 65-facade.js, already spent
   buckets), the warrior's guild gets a fenced sparring yard, and the
   alchemist gets an attached second-mass annex with a rooftop herb
   garden — all still zero new draw calls (box|stone default,
   box|plaster, box|wood, cyl|stone, blob|leaf, plus statue()'s own
   fr6|stone/dome|dome — no bucket here is new).

   The one genuinely new cost is the working NPCs themselves (multiple
   smiths, sparring warriors, the tending alchemist) — GUILD_WORK_POSTS
   (declared at the top of this file) collects every post as each hall
   below builds it; 78-life.js's updateGuildWorkers() consumes the array
   and drives one new shared InstancedMesh (BUDGET.drawCalls 52->53,
   05-palette.js — see that constant's own comment, and the guild-workers
   section of 78-life.js, for why a new draw call here rather than folding
   into an existing posted population). */

/* THIRD PASS (owner: "add an outdoor activity to all the guild houses?
   guildsmen sawing wood for carpenters, merchants having a very high
   priority market tend outside people visit with exotic goods, the
   clockmaker guild probably just needs an animated clock... extrapolate
   for the remaining guilds").

   Checked first, before writing anything: this canton has exactly the
   four halls the second pass built (blacksmith/alchemist/mason/warrior),
   all four already with their own outdoor activity, plus the small local
   market at the centre. There is no carpenters' hall, no merchants' hall,
   no clockmaker's hall — the owner's brief names guild TRADES, not guild
   HALLS that already exist here, and the canton's own layout has no spare
   quadrant for new full halls (all four diagonals are spoken for, "kept
   modest on purpose... four working guild halls... not four more market
   plazas" per the second pass's own header above). Rather than bolt three
   more full structure()-built halls onto a canton explicitly sized and
   laid out for exactly four, each new trade gets a real outdoor activity
   sized and placed the same way the existing ones were (a yard/annex, not
   a whole building), same standard: working NPCs actually posed at the
   activity, not static dressing.
     - carpenters: a freestanding sawyer's yard, its own spot (not grafted
       onto an existing hall) at the canton's south cardinal gap (between
       the blacksmith and the warrior — the two other "rough trade" halls,
       a fitting neighbourhood) — see the section below, after the four
       halls.
     - merchants: no spare hall, but this canton already HAS a merchant
       space — the small local market at the centre (below). Extended in
       place with a modest cloister-idiom arcade annex (monasteryAssemblyHall's
       ground-floor-cloister vocabulary, 61-monastery.js, read-only
       reference — arcade piers + a green planted square, simplified to one
       storey and sized for this canton) carrying a pair of "exotic goods"
       stalls, at the north cardinal gap (between the alchemist and the
       mason). Wired into LIFE_PED_CAT_ORDER (78-life.js) with real
       priority via GUILD_MARKET_DOOR — the "very high priority" half of
       the ask.
     - clockmaker: no clockmaker's guild anywhere in this city, and the
       brief explicitly allows skipping rather than inventing a fifth hall
       for it. Not skipped, though — a wall clock is small, cheap, and
       harmless to graft on, so per the brief's own "add to whichever
       existing hall best fits" fallback: mounted on the alchemist's
       tower — the tallest, most visible mass in the canton (so the whole
       point of a "visible" clock is actually served) and the hall whose
       own trade (precision, measured work) is the least jarring fit of
       the four for keeping the district's time. Animated hands, driven by
       dayNightHour() every frame — 82-daynight.js, same "read the game
       clock, drive a rotation" idiom that file's lighthouse beacons
       already use, not a static face.
     - "remaining guilds": there are none left uncovered — all four
       existing halls plus the two new trades above account for every
       guild in this canton. Nothing extrapolated beyond that; noting this
       honestly rather than inventing a guild that isn't there.

   Budget: draw calls were 53/60 live before this pass. The carpenter/
   merchant NPCs reuse GUILD_WORK_POSTS/updateGuildWorkers()'s existing
   shared InstancedMesh exactly like the original four roles (zero new
   draw calls — that mesh is already sized off GUILD_WORK_POSTS.length,
   computed after every push below). The sawyer yard and market annex are
   built from combos already spent in this same file (box/cyl/fr8|stone
   default, box|wood, box|cloth, blob|leaf, dome|dome via statue()'s own
   bucket) — zero new draw calls there too. The one real new cost is the
   clock hands (82-daynight.js): a genuinely new, tiny (2-instance) shared
   InstancedMesh, because reusing lifeGuildMesh's humanoid geometry for a
   clock hand would be the same bad visual-mismatch trade this file's own
   comment above already rejected for smiths-as-ordinators — one new draw
   call (53->54), same size cost the original guild-worker population
   itself paid for the identical reason. */
/* ---- FIFTH PASS: THE GRID (owner: "change guild canton to a grid building
   layout if that lets you fit the remaining guild halls in").

   It does. The FOURTH PASS above concluded, correctly for the layout it then
   had, that Potter's and Glassmaker's would not fit: four halls on the
   diagonals, four on the cardinals, a market at dead centre, and every gap
   left over an octant sliver. That conclusion was about the RADIAL
   arrangement, not about the canton - a radial plan spends its best land on
   four diagonal bearings and wastes a square platform's entire perimeter.

   The Guild canton's top tier is a SQUARE of half-width hw (platCanton()'s
   own c.r*0.97*0.86^tiers - ~74 units here, so ~148 across). Laid out as a
   grid 5 plots wide and 2 deep with a boulevard down the middle, that is 10
   plots: exactly the 8 existing halls plus Potter's and Glassmaker's, with
   real streets between them and nothing left over.

       col         0        1        2         3        4
       z<0 row   Smith   Potter   Glass     Mason   Warrior    (fire + stone)
       ==================== THE BOULEVARD ====================
       z>0 row   Alchem  Carpntr  Artific  Merchant  Weaver

   Numbers, measured against the platform rather than eyeballed:
     - column pitch GH_COL = hw*0.385 (28.5) against a hall frontage GH_D =
       hw*0.285 (21.1) -> a 7.4-unit service street between every pair.
     - hall depth GH_W = hw*0.32 (23.7); the two rows sit GH_ROW =
       GH_BLVD+GH_W/2 (37.8) either side of centre, so the boulevard between
       the two rows of shopfronts is 51.8 wide. It carries the centre market,
       the carpenters' sawyer yard and the merchants' bazaar cloister.
     - worst-case extents: column 4's centre 57.0 + frontage 10.5 = 67.5 < hw;
       deepest back yard (the warrior's sparring ground, resized below) 69.7
       < hw. Nothing overhangs the deck edge or fouls platCanton()'s own
       parapet blocks at hw*0.99 (73.3, 3 deep).

   Every hall keeps its own building, props and outdoor activity exactly as
   the passes above built them: all of those are placed with loc() in the
   hall's own local frame, so they travel with the plot for nothing. Only
   four things actually had to move or shrink - the alchemist's rooftop annex
   (tower side -> tower back, the side is a service street now), the
   warrior's sparring yard and the mason's statue garden (both used to spill
   past where the deck now ends), and the sawyer yard / bazaar cloister,
   which stop floating in the old cardinal gaps and become the forecourts of
   the Carpenter's and Merchant's own plots, on the boulevard. ---- */
function guildHallsDeck(c, y, hw){
  var GH_COL = hw*0.385, GH_W = hw*0.32, GH_D = hw*0.285;
  var GH_BLVD = hw*0.35, GH_ROW = GH_BLVD + GH_W*0.5;
  /* ghPlot(column 0..4, row -1|+1) -> that plot's centre and orientation. ry
     is a quarter turn one way or the other so local +x - the axis
     structure()/addDoor()/every prop below measures its offsets from -
     points at the boulevard, i.e. every hall fronts the street. Same
     convention faceToward() produced for the radial layout, just resolved to
     a cardinal instead of an arbitrary bearing, which is what makes the
     buildings sit square to each other and to the platform. */
  function ghPlot(j, row){
    return { x: c.x + (j-2)*GH_COL, z: c.z + row*GH_ROW, ry: row<0 ? -Math.PI/2 : Math.PI/2 };
  }
  /* one call per hall: its front-door record (the 'guildhall' LIFE_DOORS
     category, 78-life.js, which reads this array wholesale - so the two new
     halls are wired for pedestrians by pushing here, with nothing to add
     there) plus its inspector footprint, so hovering a hall names the hall
     instead of falling back to "Guild canton". inspectClaim() (86-inspect.js)
     is an inspect-only registry, deliberately NOT claim(): see its own
     comment for why. */
  function ghHall(name, hx, hz, w, d, ry){
    var dp = loc(hx, hz, w*0.5+1.2, 0, ry);
    GUILD_HALL_DOORS.push({ x:dp[0], z:dp[1], ry:ry, canton:'Guild', name:name });
    /* The inspect footprint is the PLOT, not just the walls: +11 along the
       hall's own front-back axis and +3.5 to each side (half the service
       street). Driving the inspector at the tight wall-only version first
       showed why — the ray lands on whatever stands in front, so the
       mason's jib crane and the glassmaker's vessel rack answered "Guild
       canton" while the hall two metres behind them answered correctly.
       A guild's forge, kiln, loom, sparring yard and statue garden ARE that
       guild's premises, so the plot is the honest unit. Checked against the
       grid's own spacing: 11 stops 3.3 units short of the centre market's
       stalls and 3.5 stops 0.2 short of the neighbouring column's band, so
       no two of these rectangles ever overlap and none swallows the market. */
    inspectClaim(hx, hz, w*0.5+11, d*0.5+3.5, ry, 'guildhall', name + "'s guild hall");
  }

  /* ---- the blacksmith's guild: a low, sooty, blocky hall, forge chimney
     out back, an anvil block + quench trough by the door. ---- */
  (function(){
    var P = ghPlot(0,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.40;
    var col = shade(c.tone, -0.16);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Blacksmith', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* flue, set back at the far corner from the door */
    var fp = loc(hx, hz, -w*0.5+3, d*0.5-3, ry);
    var chimW = Math.max(3.2, w*0.10), chimH = h*1.30;
    FR3(fp[0], y, fp[1], chimW, chimH, chimW, ry, shade(col,-0.34));
    CYL(fp[0], y+chimH, fp[1], chimW*0.36, chimW*0.55, 0, shade(col,-0.5));
    /* anvil block (box|metal — an existing bucket, see header) + a bed of
       coals, and a quench trough, just outside the door */
    var ap = loc(hx, hz, w*0.5+4.2, -d*0.22, ry);
    BOX(ap[0], y, ap[1], 1.6, 1.0, 2.6, ry, shade(col,-0.45), 'metal');
    CYL(ap[0], y+1.0, ap[1], 0.7, 0.35, 0, shade(ROOFS[2], 0.15));
    /* the forge itself: a hot ember core sitting in the coal bed — a
       static, always-lit bright accent colour (per the owner's "glows"
       ask), not a real light source: cheap, no new bucket (cyl|stone
       default, already spent), reads as glowing purely off how much
       brighter/more saturated it is than everything soot-dark around it. */
    CYL(ap[0], y+1.32, ap[1], 0.40, 0.22, 0, 0xff6a2e);
    CYL(ap[0], y+1.42, ap[1], 0.20, 0.14, 0, 0xffd23c);
    /* smoke: the owner's own ask — "a true particle effect rather than a
       rendered polygon". The static blob-puff cluster that used to sit here
       is retired in favour of registerSmokeEmitter() (65-facade.js), the
       one shared citywide particle rig: real puffs rising off the flue,
       leaning with the wind, swelling, wobbling, washing out toward the
       haze and recycling. Costs no draw call here at all — the forge shares
       one InstancedMesh with every other chimney in the city.

       A forge reads hotter, darker and far more vigorous than a house
       chimney: nearly 4x the pool, 3x the climb, a near-black sooty body
       and a hot ember-lit tone at the flue mouth (colHot/hotEnd) picking up
       the 0xff6a2e/0xffd23c coal bed two lines above.

       DETERMINISM: registerSmokeEmitter() draws nothing from the shared LCG
       (it hashes off its own world position), so the 4 rr(0,2pi) draws the
       retired blob loop made are made here anyway — the first as the plume
       phase, three as ballast — keeping this fragment's stream, and every
       canton/district/placement generated after it, bit-identical.
       See SUBAGENT.md s6, "Adding geometry mid-fragment". */
    var forgePhase = rr(0, Math.PI*2); rnd(); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+chimH+chimW*0.55, fp[1], {
      kind:'forge', n:21, life:4.6, rise:24, r0:0.85, r1:4.30,
      spread:0.70, sway:1.15, swirl:1.30, lean:0.46, phase:forgePhase,
      col:PAL.smoke.forge.body, colHot:PAL.smoke.forge.hot, hotEnd:0.22
    });
    var tp = loc(hx, hz, w*0.5+4.2, d*0.26, ry);
    BOX(tp[0], y, tp[1], 3.2, 1.1, 1.6, ry, shade(TRUNKC[0],-0.2), 'wood');
    BOX(tp[0], y+1.1, tp[1], 3.0, 0.3, 1.4, ry, 0x8fb8c4);
    /* the forge shed: a low lean-to roof on posts, sheltering the anvil
       and trough — gives the blacksmith its own distinct low, sprawling-
       wing silhouette (vs. mason/warrior's single hlaalu block), independent
       of structure()'s own internal random taper (built from known w/d/h
       here, not from whatever structure() happened to step back to). */
    var shedCx = w*0.5+4.2, shedD = 7.2, shedW = d*0.85, shedH = h*0.52;
    var shedC = loc(hx, hz, shedCx, 0, ry);
    [-1,1].forEach(function(s){
      var pp0 = loc(hx, hz, shedCx+shedD*0.40, s*shedW*0.42, ry);
      CYL(pp0[0], y, pp0[1], 0.42, shedH, 0, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(shedC[0], y+shedH, shedC[1], shedD, 1.0, shedW, ry, shade(col,-0.28), 'wood');
    /* multiple smiths working the forge, flanking the anvil — see
       updateGuildWorkers() (78-life.js) for the shared population these
       posts feed. */
    [-1.7, 1.7].forEach(function(s){
      var sp = loc(hx, hz, shedCx, -d*0.22+s, ry);
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry:ry+Math.PI, role:'smith', radius:0.9 });
    });
  })();

  /* ---- the alchemist's guild: a slender, jade-tinted leaning tower with
     a domed cap and a small cluster of still-like vessels beside it. ---- */
  (function(){
    var P = ghPlot(0,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = hw*0.25, d = hw*0.22, h = hw*0.68;
    var col = shade(pick(JADEC), 0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Alchemist', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'velothi', col, {cap:'dome'});
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    var pp = loc(hx, hz, w*0.5+6.5, -d*0.35, ry);
    BOX(pp[0], y, pp[1], 5.0, 1.3, 4.0, ry, shade(col,-0.15));
    var vY = y+1.3;
    [[-1.4,-0.9,0.55,'stone'],[0.6,0.7,0.85,'stone'],[1.7,-0.4,0.42,'metal']].forEach(function(v){
      var vp = loc(pp[0], pp[1], v[0], v[1], ry);
      var vcol = v[3]==='metal' ? shade(ROOFS[5], 0.10) : shade(JADEC[1], 0.12);
      var vh = 1.6 + v[2]*1.6;
      CYL(vp[0], vY, vp[1], v[2], vh, 0, vcol, v[3]);
      if(v[2] > 0.7) CONE(vp[0], vY+vh, vp[1], v[2]*0.5, 1.0, 0, shade(vcol,-0.1));
    });
    /* an attached annex, alongside the tower rather than another tower — a
       second, lower flat-roofed mass breaks the single-block silhouette
       every hlaalu hall still reads as, and carries the rooftop herb
       garden the owner asked for. Sized so structure()'s own hlaalu level
       count (Math.round(h/11)) lands on exactly 1 — a single, untapered
       block, so the real roof top is known here (annexTopY below) instead
       of guessed past structure()'s own internal random per-level taper. */
    var annexW = hw*0.15, annexD = hw*0.20, annexH = hw*0.20;
    /* GRID PASS: the annex moves from the tower's SIDE to its BACK. On the
       radial layout its side was open canton; on the grid that side is the
       7.4-unit service street shared with the Carpenter's plot, and the plot
       depth behind the tower is the space nothing else wants. */
    var annexP = loc(hx, hz, -(w*0.5 + annexW*0.5 - 1.0), 0, ry);
    var annexCol = shade(col, -0.06);
    var annexDhw = Math.min(2.2, annexW*0.5*0.9)*0.5;
    structure(annexP[0], y, annexP[1], annexW, annexD, annexH, ry, 'hlaalu', annexCol);
    addDoor(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol);
    addWindows(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol, annexDhw);
    var annexTopY = y + annexH + 1.3;
    /* rooftop herb garden: a row of planter troughs the alchemist tends */
    [-1.4,-0.5,0.5,1.4].forEach(function(t){
      var plp = loc(annexP[0], annexP[1], 0, t*annexD*0.35, ry);
      BOX(plp[0], annexTopY, plp[1], annexW*0.55, 0.7, annexD*0.14, ry, shade(TRUNKC[0],-0.15), 'wood');
      BLOB(plp[0], annexTopY+0.7, plp[1], annexD*0.10, 1.1, rr(0,Math.PI*2), shade(pick(JADEC), rr(-0.1,0.15)));
    });
    /* the alchemist, tending the rooftop garden — see updateGuildWorkers()
       (78-life.js) for the shared population this post feeds. */
    GUILD_WORK_POSTS.push({ x:annexP[0], z:annexP[1], y:annexTopY, ry:ry, role:'tender', radius:1.6 });

    /* THIRD PASS: the canton's clock, mounted on the tower's own front
       face (same wall the door/windows sit on) — see this function's own
       header comment above ("clockmaker") for why it lands here rather
       than on a dedicated hall. Mounted mid-tower, well above
       addWindows()'s own window band (that band sits at y+min(h*0.30,
       2.0-3.2) — a couple of units above the door, nowhere near h*0.42)
       and comfortably below the dome cap. A dark bezel (metal — reuses
       the still cluster's own ROOFS[5] metal accent above) plus a pale
       stone face (STALKC — reuses the mason's own "fresh-quarried pale"
       family below), sized off this same wall's own dhw so it can never
       be wider than the windows already safely placed on it. Only the
       FACE is static geometry here; the hands are a separate tiny
       InstancedMesh built in 82-daynight.js off GUILD_CLOCK (below),
       updated every frame from dayNightHour() — see that file for the
       actual rotation. */
    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.1, dhw*1.35), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.42;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);
      /* a small dark pin at the centre where the hands pivot, so the face
         doesn't read as blank stone between them */
      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCK = { x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 };
      GUILD_CLOCKS.push(GUILD_CLOCK);
    })();
  })();

  /* ---- the mason's guild: plain undyed stone, a pile of fresh-cut
     blocks, a lashed-timber scaffold and a small jib crane. ---- */
  (function(){
    var P = ghPlot(3,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.34;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Mason', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* loose fresh-cut stone blocks (STALKC — pale, reads as new-quarried
       against the aged canton tone), back corner */
    var bp = loc(hx, hz, -w*0.5-4, -d*0.30, ry);
    for(var bi=0; bi<6; bi++){
      var bo = loc(bp[0], bp[1], rr(-3,3), rr(-3,3), ry);
      var bs = rr(1.6,2.6);
      BOX(bo[0], y, bo[1], bs, bs*rr(0.7,1.0), bs*rr(0.8,1.2), rr(0,Math.PI*2), pick(STALKC));
    }
    /* scaffold along the far flank: 3 posts, 2 lashed cross-beams */
    [-1,0,1].forEach(function(si){
      var pp2 = loc(hx, hz, -w*0.5-1.4, si*d*0.28, ry);
      CYL(pp2[0], y, pp2[1], 0.35, h*0.65, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    [0.30,0.60].forEach(function(ft){
      var bmA = loc(hx, hz, -w*0.5-1.4, -d*0.28, ry), bmB = loc(hx, hz, -w*0.5-1.4, d*0.28, ry);
      BOX((bmA[0]+bmB[0])/2, y+h*ft, (bmA[1]+bmB[1])/2, 0.3, 0.3, d*0.56, ry, shade(TRUNKC[0],-0.1), 'wood');
    });
    /* a small jib crane, opposite corner from the block pile — the same
       vertical-mast + horizontal-arm silhouette portDeckV2()'s own crane
       uses (65-facade.js), scaled down for one canton's own mason yard */
    var cp = loc(hx, hz, w*0.5+3.0, d*0.5-3.0, ry);
    var craneH = hw*0.30, armLen = craneH*0.85;
    CYL(cp[0], y, cp[1], 0.65, craneH, 0, shade(TRUNKC[0],-0.2), 'wood');
    var armMid = loc(cp[0], cp[1], armLen*0.5, 0, ry);
    BOX(armMid[0], y+craneH*0.92, armMid[1], armLen, 0.45, 0.45, ry, shade(TRUNKC[0],-0.2), 'wood');
    /* a statue garden, further out past the block pile/scaffold — the
       yard's own finished stonework on display, the owner's explicit
       "mason guild has a statue garden" ask. Reuses statue() as-is
       (65-facade.js, hoisted, already called elsewhere in the city — see
       this deck's own header comment on why that's safe to call here
       despite loading later in file order); every bucket it touches
       (fr6|stone, dome|dome, fr8|stone, box|stone, cyl|stone, all
       default families) is already spent, so this is colour-only cost. */
    var gardenCx = -w*0.5-12;   /* GRID PASS: was -18, which now reaches past the deck edge behind this plot */
    [-1.8,-0.9,0,0.9,1.8].forEach(function(t){
      var gp = loc(hx, hz, gardenCx+rr(-2,2), t*d*0.42, ry);
      statue(gp[0], y, gp[1], ry+Math.PI+rr(-0.3,0.3), pick(STALKC), { h:rr(4.2,5.4), w:rr(1.3,1.7) });
    });
  })();

  /* ---- the warrior's guild (new — no prior treatment anywhere in the
     build): a sturdy blocky hall, crimson/gold banners flanking the
     door, wall-mounted shield plaques, and a small weapon rack. Bolder
     accent per the brief; kept to PAL.banner's existing reds/golds rather
     than inventing a new colour. ---- */
  (function(){
    var P = ghPlot(4,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.46;
    var col = shade(c.tone, -0.08);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Warrior', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* banners flanking the door */
    [-1,1].forEach(function(s){
      var pp3 = loc(hx, hz, w*0.5+1.0, s*(d*0.30), ry);
      var poleH = h*0.62;
      CYL(pp3[0], y, pp3[1], 0.28, poleH, 0, shade(TRUNKC[0],-0.15), 'wood');
      BOX(pp3[0], y+poleH-6.0, pp3[1], 0.16, 6.0, 2.6, ry, vothPatCol('tapestry', pick([BANNERC[0],BANNERC[1]])), 'tapestry');
    });
    /* shield/blazon plaques, flush on the wall either side of the door */
    [-1,1].forEach(function(s){
      var sp2 = loc(hx, hz, w*0.5+0.10, s*(d*0.16), ry);
      BOX(sp2[0], y+h*0.40, sp2[1], 0.18, 1.9, 1.5, ry, pick([BANNERC[0],BANNERC[1]]));
    });
    /* a small weapon rack: standing spear shafts beside the door */
    var rp = loc(hx, hz, w*0.5+3.5, -d*0.42, ry);
    for(var wi=0; wi<4; wi++){
      var sp3 = loc(rp[0], rp[1], 0, (wi-1.5)*0.9, ry);
      var shaftH = rr(4.5,6.0);
      CYL(sp3[0], y, sp3[1], 0.14, shaftH, 0, shade(TRUNKC[0],-0.1), 'wood');
      CONE(sp3[0], y+shaftH, sp3[1], 0.30, 0.9, 0, shade(col,-0.4));
    }
    /* the sparring yard: a fenced practice ground out back, pale/packed
       against the canton's own darker tone so it reads as its own
       cleared space rather than more hall floor — the owner's explicit
       "warrior guild has a yard with warriors sparring" ask. */
    /* GRID PASS: was yardR 13 at -w*0.5-16, which put the far fence line
       ~79 units out - past the deck edge (hw=74) on this, the deepest plot
       on the grid. 9 at -w*0.5-11 keeps the whole yard on the platform
       (69.7) and still reads as a real cleared sparring ground. */
    var yardR = 9, yardC = loc(hx, hz, -w*0.5-11, 0, ry);
    BOX(yardC[0], y, yardC[1], yardR*2, 1.1, yardR*2, ry, shade(pick(STALKC), 0.32));
    for(var fi=0; fi<10; fi++){
      var fa = (fi/10)*Math.PI*2;
      var fp2 = loc(yardC[0], yardC[1], Math.cos(fa)*yardR, Math.sin(fa)*yardR, 0);
      CYL(fp2[0], y, fp2[1], 0.20, 1.4, 0, shade(TRUNKC[0],-0.2), 'wood');
    }
    /* warriors sparring, two pairs — see updateGuildWorkers() (78-life.js)
       for the shared population these posts feed; pairDx/pairDz is each
       fighter's own unit direction toward its partner, so the pair can
       lunge together and pull back along their own shared line instead of
       idle-wandering independently. */
    [[-3.2,0],[3.2,0]].forEach(function(pair, pi){
      var pc = loc(yardC[0], yardC[1], pair[0], pair[1], 0);
      var axAng = pi===0 ? 0 : Math.PI/2;
      [-1,1].forEach(function(side){
        var wp = loc(pc[0], pc[1], side*1.3*Math.cos(axAng), side*1.3*Math.sin(axAng), 0);
        GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:0, role:'warrior', radius:1.3, pairId:pi,
          pairDx: -side*Math.cos(axAng), pairDz: -side*Math.sin(axAng) });
      });
    });
  })();

  /* ---- a small local market at the centre: a well and a handful of
     stalls, not the dedicated Market canton's dozens. Reuses the exact
     stall vocabulary 69-district-content.js's DIST_MARKET pass and
     stallGoods() use (box|wood counter+posts, fr8|cloth awning,
     stallGoods() for the merchandise) rather than reinventing it.
     STALL_GOODS itself is NOT referenced — that var is assigned by
     69-district-content.js's own top-level code, which runs AFTER this
     canton's build (file order 50 before 69); an inline literal here
     gets the same 3 kinds without reading a not-yet-assigned var. */
  var marketR = hw*0.16;
  monasteryWell(c.x, y, c.z, 2.6, 0);
  var stallKinds = ['fruit','bread','cheese'];
  var nStalls = 6;
  for(var mi=0; mi<nStalls; mi++){
    var ma = (mi/nStalls)*Math.PI*2 + rr(-0.12,0.12);
    var mr = rr(marketR*0.55, marketR);
    var sx = c.x + Math.cos(ma)*mr, sz = c.z + Math.sin(ma)*mr;
    var mry = ma + Math.PI/2 + rr(-0.15,0.15);
    var sw = rr(4.2,5.4), sd = rr(4.2,5.4);
    var counterH = rr(0.9,1.1), postH = rr(2.4,2.7);
    BOX(sx, y, sz, sw, counterH, sd, mry, pick(TONES_POOR), 'wood');
    inspectClaim(sx, sz, sw*0.5, sd*0.5, mry, 'stall', 'Market stall');
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
      var p = loc(sx,sz, cc[0]*sw*0.42, cc[1]*sd*0.42, mry);
      BOX(p[0], y, p[1], 0.30, postH, 0.30, mry, pick(TRUNKC), 'wood');
    });
    FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, mry, vothPatCol('kilim', pick(BANNERC)), 'kilim');
    if(chance(0.7)) stallGoods(sx, sz, y+counterH, sw, sd, mry, pick(stallKinds));
  }

  /* ---- THIRD PASS: the carpenters' own yard — a freestanding sawyer's
     pit, not attached to any of the 4 halls (none of them is a carpenters'
     hall — see this function's own header comment above), at the south
     cardinal gap between the blacksmith and the warrior. Both already-
     built halls sit on the diagonals at qOff from centre (~0.71hw out,
     ±45° off this bearing); this yard sits at a much smaller 0.40hw
     straight out the cardinal, so it clears both with real margin without
     needing a live probe to prove it (checked with a top-down screenshot
     anyway per the process this session already established — see the
     canton's own outer pillars too, at 0.99hw on this same bearing, far
     past this yard's own ~0.10hw footprint radius). Logs/trestle are
     squared timber BOXes, not round CYLs — CYL in this kit is always
     upright (see plinthDoor()/every CYL call in this file), so a log
     lying on its side has to be a box, exactly like the mason's own
     lashed scaffold cross-beams already just above. box|wood, blob|leaf —
     both already spent. */
  (function(){
    /* GRID PASS: the yard stops floating in the old south cardinal gap and
       becomes the forecourt of the Carpenter's own plot (column 1, north
       row), out on the boulevard directly in front of its door. */
    var yardC = [c.x - GH_COL, c.z + hw*0.162];
    var yardHalf = hw*0.075;
    /* sawdust-pale cleared patch, same "own cleared space" idiom the
       warrior's yard uses just above, one shade paler for wood dust
       rather than packed dirt */
    BOX(yardC[0], y, yardC[1], yardHalf*2.4, 1.0, yardHalf*2.4, 0, shade(pick(STALKC), 0.30));
    /* a corner woodpile: squared beams stacked log-cabin style */
    var pileC = [yardC[0]-yardHalf*0.9, yardC[1]-yardHalf*0.7];
    for(var pi=0; pi<5; pi++){
      var alt = pi%2===0;
      var logCol = shade(TRUNKC[pi%TRUNKC.length], rr(-0.08,0.10));
      BOX(pileC[0], y+0.4+pi*0.62, pileC[1], alt?4.6:0.62, 0.58, alt?0.62:4.6, 0, logCol, 'wood');
    }
    /* the trestle: two X-leg sawhorses carrying one long squared timber at
       working height, the two-person pit saw's own log */
    var logLen = yardHalf*1.5, logY = y+1.35;
    /* trestle legs: straight upright posts (same table/stall-leg idiom the
       local market's own counters and the mason's scaffold posts already
       use just above/below in this file) — not a true X-frame, since this
       kit's BOX only yaws about the vertical axis (see plinthDoor()'s own
       comment on CYL for the same constraint), it can't lean a leg. */
    [-1,1].forEach(function(s){
      var lp = [yardC[0]+yardHalf*0.5, yardC[1]+s*logLen*0.32];
      [-1,1].forEach(function(k){
        BOX(lp[0]+k*0.5, y, lp[1], 0.28, logY-y, 0.28, 0, shade(TRUNKC[0],-0.1), 'wood');
      });
    });
    BOX(yardC[0]+yardHalf*0.5, logY, yardC[1], 1.05, 1.05, logLen, 0, shade(TRUNKC[1],0.05), 'wood');
    /* wood shavings/offcuts, scattered round the trestle — small pale
       blob clumps (blob|leaf, colour-only reuse, same trick the ancestry
       canton's own lawn/shrub fill above already leans on) plus a few
       loose squared offcuts */
    for(var wo=0; wo<9; wo++){
      var op = [yardC[0]+yardHalf*0.5+rr(-2.2,2.2), yardC[1]+rr(-logLen*0.6,logLen*0.6)];
      BLOB(op[0], y+0.15, op[1], rr(0.35,0.6), rr(0.18,0.30), rnd()*3, shade(0xcbb78a, rr(-0.08,0.08)), 'leaf');
    }
    for(var of=0; of<4; of++){
      var op2 = [yardC[0]+rr(-yardHalf*1.6,-yardHalf*0.3), yardC[1]+rr(-yardHalf*1.2,yardHalf*1.2)];
      BOX(op2[0], y+0.2, op2[1], rr(0.5,0.9), 0.30, rr(0.5,0.9), rr(0,Math.PI*2), shade(TRUNKC[0],rr(-0.1,0.1)), 'wood');
    }
    /* the two sawyers, one at each end of the log — a real two-person pit
       saw pulling back and forth along the log's own axis, same paired-
       lunge mechanic the warrior's sparring pairs use (updateGuildWorkers(),
       78-life.js) just tuned to a shorter, steadier stroke — "sawing," not
       "fighting." pairDx/pairDz here point along the LOG's own length
       (world z), not the diagonal axes the warrior yard's pairs use. */
    [-1,1].forEach(function(side){
      var sp = [yardC[0]+yardHalf*0.5, yardC[1]+side*logLen*0.5];
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry: side<0?0:Math.PI, role:'carpenter', radius:0.9, pairId:0,
        pairDx:0, pairDz:-side });
    });
  })();

  /* ---- THIRD PASS: the merchants' own outdoor tend — see this function's
     header comment above for why this extends the centre market instead
     of getting a dedicated hall of its own. A small, single-storey, OPEN-
     sided cloister annex — monasteryAssemblyHall's ground-floor-cloister
     vocabulary (61-monastery.js, read-only reference, not called
     directly: arcade piers around a green square), simplified to 3 sides
     (open toward the centre so pedestrians can actually walk in) and
     scaled down for this canton — at the north cardinal gap between the
     alchemist and the mason, carrying the "exotic goods" stalls the owner
     asked for. box|stone(default), dome|dome, box|plaster, blob|leaf,
     box|wood, fr8|cloth — every one already spent in this canton. */
  (function(){
    /* GRID PASS: mirrors the sawyer yard above - the cloister becomes the
       forecourt of the Merchant's own plot (column 3, north row), on the
       boulevard in front of its door, with its open side still facing the
       centre so pedestrians walk straight in off the market. Span trimmed
       0.30->0.27 hw so its closed north arcade clears that hall's own front
       ledger table with ~1.4 units to spare. */
    var bazC = [c.x + GH_COL, c.z + hw*0.162];
    var span = hw*0.27, archW = span/3, pierW = archW*0.22, archH = 8.4;
    var pierCol = shade(c.tone, -0.02);
    [ {lx:-span*0.5, lz:0, along:'z'}, {lx:span*0.5, lz:0, along:'z'},
      {lx:0, lz:span*0.5, along:'x'} ].forEach(function(side){
      for(var b=0;b<3;b++){
        var bt = (b-1)*archW;
        var pp = side.along==='x' ? [bazC[0]+bt-archW*0.5+pierW*0.5, bazC[1]+side.lz]
                                   : [bazC[0]+side.lx, bazC[1]+bt-archW*0.5+pierW*0.5];
        var pierRy = side.along==='x' ? 0 : Math.PI/2;
        BOX(pp[0], y, pp[1], pierW, archH, 0.9, pierRy, pierCol);
        var archP = side.along==='x' ? [bazC[0]+bt, bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]+bt];
        DOME(archP[0], y+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, pierCol);
      }
      /* a continuous lintel along the piers' own tops — without it, 3 evenly
         spaced dome caps read from most angles as a row of separate bollard
         "mushrooms" rather than one colonnade (found by screenshot: the
         un-lintelled first draft did exactly that). Same coping-strip idiom
         monasteryAssemblyHall's own upper-storey parapet uses (61-monastery.js,
         read-only reference) — box|stone default, zero new draw calls. */
      var lp = side.along==='x' ? [bazC[0], bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]];
      BOX(lp[0], y+archH+0.5, lp[1], side.along==='x'?span:1.0, 0.8, side.along==='x'?1.0:span, 0, shade(pierCol,-0.10));
    });
    /* the green square itself — same "contemplation garden" fill the
       cloister idiom carries in its own reference file: grass-toned
       plaster underfoot, a scatter of trimmed shrubs */
    BOX(bazC[0], y-0.05, bazC[1], span*0.82, 0.30, span*0.82, 0, 0x4f6b3a, 'plaster');
    for(var g=0; g<8; g++){
      var ga = g*(Math.PI*2/8), gr = span*0.30;
      var gp = [bazC[0]+Math.cos(ga)*gr, bazC[1]+Math.sin(ga)*gr];
      BLOB(gp[0], y+0.25, gp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, shade(0x4a7a3a, rr(-0.1,0.1)), 'leaf');
    }
    /* the exotic-goods stalls themselves: bigger, better-dressed than the
       plain fruit/bread/cheese stalls at the centre (jade awnings instead
       of banner-red, a dedicated 'exotic' stallGoods() kind — see that
       function's own new branch, 69-district-content.js) since these are
       the merchant guild's own showpiece, not a generic vendor. */
    [-1,1].forEach(function(s){
      var sx = bazC[0] + s*span*0.22, sz = bazC[1] - span*0.06;
      var sw = 5.6, sd = 4.6, counterH = 1.05, postH = 2.6;
      BOX(sx, y, sz, sw, counterH, sd, 0, pick(TONES_POOR), 'wood');
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
        BOX(sx+cc[0]*sw*0.42, y, sz+cc[1]*sd*0.42, 0.30, postH, 0.30, 0, pick(TRUNKC), 'wood');
      });
      FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, 0, pick(JADEC), 'cloth');
      stallGoods(sx, sz, y+counterH, sw, sd, 0, 'exotic');
      /* the merchant tending it, showing the goods off to whoever walks
         up — see updateGuildWorkers() (78-life.js) for the shared
         population this post feeds */
      GUILD_WORK_POSTS.push({ x:sx - s*sw*0.30, z:sz+sd*0.55, y:y, ry:Math.PI, role:'merchant', radius:1.2 });
    });
    /* the "very high priority" half of the ask: registered as its own
       LIFE_DOORS category (78-life.js), given real priority in
       LIFE_PED_CAT_ORDER rather than folded into the generic 'shop'
       category the other 3 hall doors get. */
    GUILD_MARKET_DOOR = { x:bazC[0], z:bazC[1]-span*0.55, ry:Math.PI };
  })();

  /* ---- FOURTH PASS (owner: "place the carpenter and merchant guild and
     make [...] weaver's, clockmaker's/artificer's, potter's, glassmaker's,
     and navigator's guild... other should go on the guild canton until we
     run out of space there"). Real, separate hall buildings — the THIRD
     PASS's sawyer yard and bazaar annex above only ever existed because no
     dedicated Carpenter/Merchant hall existed yet; both are kept exactly
     where they are and now sit as this hall's own forecourt.

     Space audit, done before placing anything: the 4 original halls above
     already occupy all 4 diagonal quadrants (qOff=hw*0.5 out on each
     diagonal); the carpenter yard/merchant bazaar already occupy the two
     ±z cardinal gaps between them; the local market sits at dead centre.
     The two ±x cardinal gaps were the only ones left completely open —
     verified against every existing hall's own extensions (forge shed,
     alchemist still-cluster/rooftop annex, mason scaffold/statue garden,
     warrior sparring yard) by hand before picking a spot, confirmed after
     with a top-down screenshot per this file's own established process
     (see the carpenter yard's own header comment above). No claim()/
     PLACED call is used here, same as every other structure in this
     function — this canton was never on that system; positions are plain
     canton-relative offsets, exactly like the 4 original halls and the
     THIRD PASS yard/annex above.

     Fitting the remaining two asks (Weaver, Clockmaker/Artificer) used up
     BOTH open cardinal gaps. That leaves NO clean, non-overlapping spot on
     this canton for Potter's or Glassmaker's Guild: the only space left is
     the narrow octant slivers between a diagonal hall and a cardinal hall,
     each only a few units wide once the neighbours' own yards/gardens/
     sheds are accounted for — not enough to plant a real hall without
     forcing a clip. Per the owner's own instruction ("place as many as
     cleanly fit... don't force overlaps"), Potter's and Glassmaker's
     Guilds are NOT placed on this canton. */

  /* ---- Carpenter's Guild: a plain timber-raftered hall, on-axis due
     south of centre, just beyond the existing sawyer yard (which now
     reads as this hall's own working forecourt facing the plaza). Narrow
     (half-width ~9.6) and centred exactly on the canton's own x=0 axis so
     it clears the blacksmith/warrior halls purely by x-separation
     (their footprints start at |x|>=21.5; margin ~11.5) regardless of any
     z overlap — the same separating-axis margin every hall below relies
     on instead of a live probe. ---- */
  (function(){
    var P = ghPlot(1,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = shade(pick(TONES), -0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the lumber rack/shingle which
       both sit out past fx0 nearer the front corner). See
       guildHallWindows3()'s own header (65-facade.js) for why this
       replaces addWindows() outright rather than stacking on top of it. */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* a lumber rack and a hung shingle by the door — the hall's own small
       accent, the real "sawing" activity stays down at the yard just in
       front of it. box|wood already spent (yard/scaffold/etc, above). */
    var rp = loc(hx, hz, w*0.5+2.6, -d*0.32, ry);
    for(var li=0; li<4; li++){
      BOX(rp[0], y+0.3+li*0.55, rp[1], 3.6, 0.5, 0.9, ry, shade(TRUNKC[li%TRUNKC.length],rr(-0.06,0.08)), 'wood');
    }
    var sgp = loc(hx, hz, w*0.5+0.3, d*0.28, ry);
    BOX(sgp[0], y+h*0.5, sgp[1], 0.25, 1.6, 2.4, ry, shade(TRUNKC[0],-0.2), 'wood');
    ghHall('Carpenter', hx, hz, w, d, ry);
  })();

  /* ---- Merchant's Guild: on-axis due north of centre, just beyond the
     existing exotic-goods cloister (now this hall's own showroom
     forecourt). Same narrow on-axis x=0 footprint/clearance logic as the
     carpenter hall above, mirrored to the +z side. ---- */
  (function(){
    var P = ghPlot(3,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the -z side wall, clear of the ledger table which sits out
       past fx0 nearer the front corner). See guildHallWindows3()'s own
       header (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* a ledger table and balance scale by the door — box|wood(spent),
       cyl|metal(spent) */
    var tp = loc(hx, hz, w*0.5+2.4, -d*0.30, ry);
    BOX(tp[0], y, tp[1], 2.6, 1.1, 1.5, ry, shade(TRUNKC[0],-0.15), 'wood');
    CYL(tp[0], y+1.1, tp[1], 0.10, 1.3, 0, shade(ROOFS[5],0.10), 'metal');
    CYL(tp[0], y+2.2, tp[1], 0.55, 0.06, 0, shade(ROOFS[5],0.15), 'metal');
    ghHall('Merchant', hx, hz, w, d, ry);
  })();

  /* ---- Weaver's Guild: the +x cardinal gap, the first of the two that
     were completely open. Shifted slightly to -z (off the pure x=0 axis)
     so it clears the alchemist's rooftop annex (which sits toward +z off
     the alchemist tower) with real margin, verified against every
     neighbour's own extensions the same way as the header comment above
     describes. A loom frame and hanging dyed bolts, box|cloth/fr8|cloth
     (both already spent, warrior banners/market awnings) reused for the
     dye colours instead of inventing a new material. ---- */
  (function(){
    var P = ghPlot(4,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.24;
    var col = shade(pick(TONES), 0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the loom/bolts which sit out past
       fx0 nearer the front corner). See guildHallWindows3()'s own header
       (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the loom: two upright posts + a crossbeam, beside the door */
    var lp = loc(hx, hz, w*0.5+3.6, -d*0.30, ry);
    var loomW = 3.4, loomH = 3.0;
    [-1,1].forEach(function(s){
      var pp = loc(lp[0], lp[1], 0, s*loomW*0.5, ry);
      CYL(pp[0], y, pp[1], 0.22, loomH, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    BOX(lp[0], y+loomH, lp[1], 0.8, 0.3, loomW+0.4, ry, shade(TRUNKC[0],-0.1), 'wood');
    /* dyed bolts of cloth, hung from the crossbeam — a spread of banner
       hues so it reads as dyed stock, not one flat colour */
    for(var bi=0; bi<4; bi++){
      var bt = (bi-1.5)*loomW*0.30;
      var bp = loc(lp[0], lp[1], 0.5, bt, ry);
      BOX(bp[0], y+loomH-1.9, bp[1], 0.5, 2.6, 1.0, ry, vothPatCol('tapestry', pick(BANNERC)), 'tapestry');
    }
    /* a second small display: folded/stacked bolts just outside the door */
    var fp = loc(hx, hz, w*0.5+1.6, d*0.34, ry);
    FR8(fp[0], y+0.6, fp[1], 2.2, 1.2, 1.6, ry, vothPatCol('kilim', pick(BANNERC)), 'kilim');
    /* the weaver, at the loom — falls through to updateGuildWorkers()'s
       generic tender idle-wander branch (78-life.js), same as the
       alchemist's rooftop tender: reads fine as "tending the loom"
       without a bespoke motion branch. */
    GUILD_WORK_POSTS.push({ x:lp[0], z:lp[1], y:y, ry:ry+Math.PI, role:'weaver', radius:1.1 });
    ghHall('Weaver', hx, hz, w, d, ry);
  })();

  /* ---- Clockmaker's/Artificer's Guild: the -x cardinal gap, the second
     (and last) open one. Shifted off-axis to +z, clearing the warrior's
     detached sparring yard (which reaches to within ~2 units of z=0 on
     this side) and the mason hall (whose own footprint starts at
     z=26.67) with margin on both sides — see this deck's own header
     comment. A slender 'velothi' tower (distinct silhouette from the 3
     'hlaalu' block halls) carries its own animated clock face, the SAME
     idiom the alchemist tower's face already uses (see that IIFE above)
     but its own dedicated instance: GUILD_CLOCKS (this file's own header)
     now holds both, and 82-daynight.js resizes its ONE hand InstancedMesh
     to cover every entry instead of adding a second draw call. ---- */
  (function(){
    var P = ghPlot(2,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.02);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'velothi', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side. The 2
       front windows sit at doorHalfW + fww*0.5 + margin out from centre
       (>=1.6 out on this hall's own dimensions), clear of the clock face
       built just below (rimHalf capped at ~1.1-1.375, centred on the same
       wall) with real margin. Side window on the back half of the -z wall,
       clear of the workbench which sits out past fx0 nearer the front
       corner. See guildHallWindows3()'s own header (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* the clock face — same construction as the alchemist tower's own
       (mid-wall, dark metal bezel over a pale stone dial), pushed into
       GUILD_CLOCKS instead of overwriting GUILD_CLOCK so both keep
       ticking. */
    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.0, dhw*1.25), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.40;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);
      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCKS.push({ x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 });
    })();
    /* a small workbench with gear-like discs (cyl|metal — spent) — the
       artificer's own outdoor tend, same "activity by every hall" idiom
       as the rest of this canton. */
    var wp = loc(hx, hz, w*0.5+2.6, -d*0.28, ry);
    BOX(wp[0], y, wp[1], 2.4, 1.0, 1.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    [[-0.5,0.32],[0.5,0.22]].forEach(function(g){
      var gp = loc(wp[0], wp[1], g[0], 0.9, ry);
      CYL(gp[0], y+1.0, gp[1], g[1], 0.10, 0, shade(ROOFS[5],0.08), 'metal');
    });
    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'artificer', radius:1.0 });
    ghHall('Artificer', hx, hz, w, d, ry);
  })();

  /* ---- FIFTH PASS: Potter's Guild (column 1, south row) - one of the two
     trades the FOURTH PASS had to turn away for want of a plot. A low,
     thick-walled hall with its working yard out front on the boulevard: a
     domed beehive kiln with a glowing stoke hole, a drying rack of
     greenware, a wheel, and stacks of finished urns. The kiln reuses the
     blacksmith's own two idioms verbatim rather than inventing anything -
     a static rising blob|leaf puff cluster for smoke, and a bright
     cyl|stone/box|stone core reading as heat rather than a real light -
     and every bucket it touches (box/cyl/dome/blob x stone/dome/leaf/wood)
     is already spent in this canton, so it costs no draw call. ---- */
  (function(){
    var P = ghPlot(1,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.10);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Potter', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the beehive kiln, in the forecourt beside the door */
    var kp = loc(hx, hz, w*0.5+5.6, -d*0.26, ry);
    var kilnR = 3.2, kilnH = 4.2;
    CYL(kp[0], y, kp[1], kilnR, kilnH, 0, shade(col,-0.26));
    DOME(kp[0], y+kilnH, kp[1], kilnR, kilnR*0.85, 0, shade(col,-0.32));
    CYL(kp[0], y+kilnH+kilnR*0.85, kp[1], kilnR*0.30, 1.6, 0, shade(col,-0.42));
    var stokeP = loc(kp[0], kp[1], kilnR*0.88, 0, ry);
    BOX(stokeP[0], y+0.5, stokeP[1], 0.5, 1.5, 1.7, ry, 0xff6a2e);
    BOX(stokeP[0], y+0.45, stokeP[1], 0.3, 0.8, 0.9, ry, 0xffd23c);
    /* kiln smoke: the same shared particle rig the blacksmith's forge now
       uses (registerSmokeEmitter, 65-facade.js) rather than the retired
       static blob cluster — still sharing the forge's one citywide draw
       call. A wood-fired kiln smoulders rather than roars, so this is a
       slower, paler, lazier plume than the forge's: fewer puffs, a shorter
       climb and a warm-grey body instead of near-black soot.
       DETERMINISM: the retired loop's 3 rr(0,2pi) draws are kept (first as
       the plume phase, two as ballast) so this fragment's stream is
       unchanged downstream — see the forge's own note above. */
    var kilnPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(kp[0], y+kilnH+kilnR*0.85+1.6, kp[1], {
      kind:'kiln', n:14, life:6.4, rise:17, r0:0.62, r1:3.00,
      spread:0.50, sway:0.80, swirl:0.85, lean:0.56, phase:kilnPhase,
      col:PAL.smoke.kiln.body, colHot:PAL.smoke.kiln.hot, hotEnd:0.16
    });
    /* the wheel the potter actually works at, and a drying rack of greenware */
    var wp = loc(hx, hz, w*0.5+2.2, d*0.06, ry);
    CYL(wp[0], y, wp[1], 0.36, 0.9, 0, shade(TRUNKC[0],-0.20), 'wood');
    CYL(wp[0], y+0.9, wp[1], 0.95, 0.18, 0, shade(col,-0.36));
    CYL(wp[0], y+1.08, wp[1], 0.32, 0.55, 0, shade(pick(TONES_POOR), 0.04));
    var rkp = loc(hx, hz, w*0.5+3.4, d*0.30, ry);
    [-1,1].forEach(function(s){
      var lp = loc(rkp[0], rkp[1], 0, s*1.4, ry);
      BOX(lp[0], y, lp[1], 0.3, 1.5, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(rkp[0], y+1.5, rkp[1], 1.9, 0.25, 3.1, ry, shade(TRUNKC[0],-0.15), 'wood');
    for(var pq=0; pq<5; pq++){
      var qp = loc(rkp[0], rkp[1], rr(-0.7,0.7), rr(-1.2,1.2), ry);
      CYL(qp[0], y+1.75, qp[1], rr(0.22,0.38), rr(0.5,0.9), 0, shade(pick(TONES_POOR), 0.06));
    }
    /* stacked finished urns against the hall's own front wall */
    for(var st=0; st<3; st++){
      var up = loc(hx, hz, w*0.5+1.3, -d*0.44+st*1.6, ry);
      var ur = rr(0.5,0.8);
      CYL(up[0], y, up[1], ur, ur*1.7, 0, shade(pick(TONES_POOR), -0.04));
      DOME(up[0], y+ur*1.7, up[1], ur*0.92, ur*0.7, 0, shade(pick(TONES_POOR), -0.10));
    }
    /* the potter, at the wheel - no bespoke motion branch, so this falls
       through to updateGuildWorkers()'s generic tender idle-wander
       (78-life.js), which already reads as "working at something at waist
       height", same call the weaver's own post makes. */
    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'potter', radius:1.0 });
  })();

  /* ---- FIFTH PASS: Glassmaker's Guild (column 2, south row) - the other
     turned-away trade, and the last plot the grid needed to fill. A taller
     hall over a domed glass furnace with a molten mouth, a marver bench,
     and finished vessels out on a display rack.

     On the "existing translucent/emissive material" question: there is
     none. FAMMAT (05-palette.js) is stone/plaster/roof/wood/dome/leaf/
     trunk/fungus/metal/cloth, every one opaque, and a new family would cost
     a new draw-call bucket for every shape it touched. So the glass is read
     the way this build already reads its forge embers and its lantern
     flames - by colour alone: vessels several shades paler and cooler than
     any masonry tone near them, and a gather at the furnace mouth in the
     same 0xff6a2e/0xffd23c heat pair the blacksmith's forge and the
     potter's kiln above both use. Noted as the honest limit rather than
     claimed as real glass. ---- */
  (function(){
    var P = ghPlot(2,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.33;
    var col = shade(pick(TONES), -0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    var glassCol = shade(JADEC[0], 0.42);   /* the pale, cool "glass" tone every vessel below shares */
    ghHall('Glassmaker', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* the furnace: a squat drum under a dome, with the glory hole facing
       the yard and a flue above */
    var fp = loc(hx, hz, w*0.5+5.4, d*0.24, ry);
    var furR = 2.9, furH = 3.4;
    CYL(fp[0], y, fp[1], furR, furH, 0, shade(col,-0.34));
    DOME(fp[0], y+furH, fp[1], furR*0.98, furR*0.80, 0, shade(col,-0.40));
    CYL(fp[0], y+furH+furR*0.80, fp[1], furR*0.26, 2.2, 0, shade(col,-0.48));
    var mouth = loc(fp[0], fp[1], -furR*0.86, 0, ry);
    BOX(mouth[0], y+1.5, mouth[1], 0.5, 1.3, 1.3, ry, 0xff6a2e);
    BOX(mouth[0], y+1.5, mouth[1], 0.3, 0.7, 0.7, ry, 0xffd23c);
    /* furnace smoke: shared particle rig again (registerSmokeEmitter,
       65-facade.js), not the retired static blob cluster. A glass furnace
       is kept at a continuous hard heat, so this reads between the forge
       and the kiln — quick and steady, a thin bright-hot flue plume that
       pales out fast. Same one citywide draw call.
       DETERMINISM: the retired loop's 3 rr(0,2pi) draws are kept (phase +
       2 ballast); see the forge's note above. */
    var furPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+furH+furR*0.80+2.2, fp[1], {
      kind:'furnace', n:15, life:4.0, rise:18, r0:0.52, r1:2.70,
      spread:0.44, sway:0.70, swirl:1.15, lean:0.50, phase:furPhase,
      col:PAL.smoke.furnace.body, colHot:PAL.smoke.furnace.hot, hotEnd:0.18
    });
    /* the marver bench the gather is rolled out on, with the blowpipe
       resting across it - the molten tip still glowing */
    var bp = loc(hx, hz, w*0.5+2.4, -d*0.10, ry);
    [-1,1].forEach(function(s){
      var lp2 = loc(bp[0], bp[1], 0, s*1.5, ry);
      BOX(lp2[0], y, lp2[1], 0.32, 1.05, 0.32, ry, shade(TRUNKC[0],-0.18), 'wood');
    });
    BOX(bp[0], y+1.05, bp[1], 1.5, 0.22, 3.6, ry, shade(ROOFS[5], -0.10), 'metal');
    var pipeP = loc(bp[0], bp[1], 0.2, 0, ry);
    BOX(pipeP[0], y+1.34, pipeP[1], 0.14, 0.14, 4.4, ry, shade(ROOFS[5], 0.05), 'metal');
    var tipP = loc(bp[0], bp[1], 0.2, -2.3, ry);
    CYL(tipP[0], y+1.28, tipP[1], 0.28, 0.34, 0, 0xff6a2e);
    /* the display rack: finished vessels, pale and cool against the tone */
    var dp2 = loc(hx, hz, w*0.5+1.4, d*0.38, ry);
    [-1,1].forEach(function(s){
      var lp3 = loc(dp2[0], dp2[1], 0, s*1.5, ry);
      BOX(lp3[0], y, lp3[1], 0.3, 2.4, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    [1.0, 2.4].forEach(function(sh){
      BOX(dp2[0], y+sh, dp2[1], 1.2, 0.18, 3.3, ry, shade(TRUNKC[0],-0.15), 'wood');
      for(var v=0; v<3; v++){
        var vp = loc(dp2[0], dp2[1], rr(-0.35,0.35), (v-1)*1.05 + rr(-0.2,0.2), ry);
        var vr = rr(0.24,0.40);
        CYL(vp[0], y+sh+0.18, vp[1], vr, vr*rr(1.6,2.4), 0, shade(glassCol, rr(-0.06,0.08)));
      }
    });
    DOME(dp2[0], y+2.58+0.18, dp2[1], 0.5, 0.42, 0, shade(glassCol, 0.06));
    /* the glassblower, working the gather at the bench - generic tender
       branch, same as the potter and the weaver. */
    GUILD_WORK_POSTS.push({ x:bp[0], z:bp[1], y:y, ry:ry+Math.PI, role:'glassblower', radius:1.0 });
  })();
}

