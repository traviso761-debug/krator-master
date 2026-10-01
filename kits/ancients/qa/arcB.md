# QA pass — group arcB

Types: hexahedron (+ Mav's hypertree), arcoindian, arcoindian2, dalab, veladiga,
canyon (the Span), spire (Vashtir), theodiga (the dam). Fragments edited:
`61-spire 63-canyon 64-dalab 65-veladiga 68-hexahedron 70-hypertree 77-dam
89b-arcoindian 89c-arcoindian2`; target files `hexahedron/91z-views.js`,
`veladiga/89z-rows.js`, `dalab/91z-views.js`. No shared fragment touched, no
reseed changed. Every target: build + jscheck + `verify --assert`, error panel
clean, all correctness invariants PASS. Shots: `shots/qa_<type>_r1..r3`.
The kit target was built and jscheck'd (my fragments' top-level code runs in it:
two canvas textures, a few kdefs/materials); its outputs were not committed.

Triangles are scene triangles per type/decay, measured by `verify --assert`.
"before" is this session's baseline run where one exists, otherwise the last
logged number in the repo's `log_*.txt` (marked *log*).

---------------------------------------------------------------------------
## Hexahedron (`68-hexahedron.js`, `70-hypertree.js`, target views)

hex/0 536 724 -> 548 664 · hex/2 381 634 -> 385 634 · mav/0 169 020 -> 168 252
(`biome/0` 1 550 085 OVER is the hexlush row's hyperjungle, pre-existing, not
this type's builder.)

Items:
- **"`RUINS` greens the ground under `+r.s`..."** — FIXED where it was wrong in
  my targets, and the item is mostly a misdiagnosis: greening marks RUINS, and
  in every target that builds decay 1, `+s` IS the ruin. It is only wrong where
  DECAYS omits 1: hexahedron (already fixed) and **veladiga** (DECAYS [0,2]),
  now fixed in `targets/veladiga/89z-rows.js`. canyon/spire/theodiga/dalab are
  correct as they stand. Other agents' targets were not checked.
- **"The terrace cells are still boxes on a ring... bridges only cantilever"** —
  PARTLY FIXED. Three level sky bridges now cross ~100 m of open air from the
  fifth-level promenade to lift towers standing on the lower city's exposed
  point (solved: the lower-plan point furthest from the upper plan, then the
  nearest promenade edge). The outward pods got raking struts back to the riser
  (from below they had read as brown discs floating 48 m off the face). The
  cells themselves are still boxes on a ring.
- **"No interiors behind the promenade bands, and the cultural centre ... a
  single block"** — FIXED. The riser behind every promenade is now an arcade (a
  9 x 14 m arch every third bay, a lamp in each, one pane row above); the summit
  cultural centre is a ribbed parabolic vault hall on a plinth, closed ends with
  portals, slotted crown (was seven boxes).
- **"The imported hypertree is one species..."** — NOT FIXED: porting the other
  three species and their structural branches is an import job, not QA. Fixed
  instead: its `apron()` disc read as a paper disc on the plain in every preset
  (d=0 lays pale rock); removed — the buttress flare and roots are the contact.
- **"The collapsed flank tears the soffit ... does not sag"** — NOT CHANGED;
  the item itself notes the nanomaterial spine may make it correct.
- **"Camera presets hard-code targets..."** — FIXED. The builder exports
  `HEX_SITE[d]` (union centre, COM, crater, apex tip, summit, shear point and
  normal); the views read it with measured fallbacks. It caught the crater
  shots aimed 40 m off the hole. 'Crater soffit' re-aimed to stand out on the
  failed flank's bearing and look up (it used to see only shafts); 'The shear'
  aims at the tear itself.
- Found by looking: the lower city's 16 stepped soffits and the 1 km great
  soffit rendered BROWN from every up-looking preset. They are on a painted
  soffit material now (emissive through the concrete map, dimmed at night via
  `NIGHT`, same approach as the Ledge).

Remaining: cells still boxes; hypertree species; flank sag; the promenade pods
are still small at hero distance.

---------------------------------------------------------------------------
## Arcoindian I (`89b-arcoindian.js`)

arcoindian/0 314 236 -> 300 094 · /1 309 590 -> 290 912 (the kit dodecahedron
rubble (36 tris) replaced by a 12-tri block; see below). ~400k headroom left.

Items:
- **"The massif reads as a rectangular loaf..."** — IMPROVED. Four
  amphitheatre bays eaten into the scarp west of the cavern (faded out by
  x=-640 so the city, shelf and lift towers measure off the same face; bays
  only cut IN so the viaduct stays clear; fixed constants, no PRNG) and the
  west taper now comes down in three benches instead of one ramp. Plus the
  rock itself (next item). The flat master-joint cut is by design (the section).
- **"The vault light-well collars read as objects..."** — IMPROVED, not gone.
  Applied Arcoindian II's finding: no rim or lit ring below the vault; the bore
  is seated at the LOWEST roof point round its rim (it hung a 4 m, 28 m-wide
  drum below the vault); the lower bore is a near-black in the ceiling's own
  hue (`MAT.aiBore`) — void-black read blue-grey through the fog. It now reads
  as a dark recess, but still as a shape, from 'A light well'.
- **"Plateau is thin... roof fall angular but uniform..."** — PARTLY FIXED. New
  plateau material (`TEX.aiTopTx`: weathered caprock, faint broken crack
  network, scrub specks) instead of the bedded face map, which showed as
  contour stripes / paving; 16 tors of angular blocks (hashed, no PRNG). Roof
  fall is now a fan thrown out toward the mouth with power-law sizes, seated on
  the bare shelf past the last terrace, nothing left hanging off the shelf edge.
  Pods and trees unchanged.
- **"A `roofY()`/shell disagreement nearly shipped"** — already fixed in code
  before this pass (both call `roofN()`); tick it.
- Found by looking: (1) ALL rock (this type and Arcoindian II) was textured with
  `TEX.concrete` — board-formed concrete with form-tie holes — the root of both
  "plywood" and "smeared mud". New `TEX.aiRockTx`: bedded sandstone, 11 courses
  of uneven thickness broken into jointed blocks, lichen/varnish patches,
  periodic lattice noise so the ~74 m tile has no seam. (A first cut with 19
  thin courses read as WOOD GRAIN on the vault — keep courses thick.)
  (2) The cavern's top edge on the section cut was an 8 m staircase (quad
  dropping); the main face now leaves a band open and a conformal strip whose
  lower edge IS the roof curve laps over it, UVs matched to the face.
  (3) Rubble was pale regular dodecahedra ("eggs"); now `aiBlock`, an irregular
  jittered hexahedron, untextured (on the bedded map they read as crates).

---------------------------------------------------------------------------
## Arcoindian II (`89c-arcoindian2.js`)

arcoindian2/0 328 222 *(KNOWN_ISSUES)* -> 318 442 · /1 337 000 -> 283 814
(ruin lost the west flank of the lens; see below).

Items:
- **"A plan view ... geometrically impossible"** — NOT FIXABLE, inherent to an
  overhang (as logged).
- **"The cliff face reads as smeared mud at close range"** — FIXED by the rock
  texture (shared with Arcoindian I, above). The relief terms are unchanged.
- **"The lens's flanks are blank over ~150 m; ... shaft blank; gardens a hedge
  row; sun court floor and scar coarse; rim plateau thin"** — PARTLY FIXED.
  Flanks: six rows of windows set into the upper shell parallel to the
  outline, each on a dark reveal, facing the shell normal solved from `lth()`'s
  gradient (hashed). Rim plateau: the caprock material + (shared) blocks. Also
  nose galleries no longer poke through the sun court's cheek walls. Shaft,
  gardens, court floor and scar untouched.
- **"The ruin is 'intact with an overgrowth pass' at distance"** — FIXED. The
  lens's cantilevered WEST FLANK has sheared off along a ragged line (x≈-96):
  one predicate `lG()` drives every surface and placement on the lens; the
  break is closed by a fracture face open between the plates (storeys show in
  the tear) with a dark face behind; curved shell pieces cut from the lens's
  own top/belly lie on the shelf and two on the talus 340 m below, with
  wreckage; the residential rosette went with it.
- **"`RIVZ`, `inLens` and `NLU/NLV` are dead locals"** — FIXED: `inLens`
  removed; `RIVZ` was already gone; `NLU/NLV` are used (lens grid size).
- **"360 000 triangles of headroom"** — partly spent (flank windows, fracture,
  fallen pieces); ~380k remains per decay.
- Also: the escarpment west of the hollow got the same bays and benches as
  Arcoindian I; the hollow's edge on the joint plane got the same conformal
  strip; wells seated at the rim-minimum and lined in `aiBore`.

Remaining: the three ceiling well mouths still read as dark shapes in
'Coronal section'/'Head-on'; the access shaft; the gardens fan; plan view.

---------------------------------------------------------------------------
## Dalab (`64-dalab.js`, target views)

dalab/1 657 278 (r1) -> see r3 log (floor-plate annuli: triangle-neutral).

Items:
- **"The great dome's size is a guess"** — NOT FIXABLE here: needs the Voth
  palace's dimensions. (The builder already rescaled it against the kit, K=4.105,
  390 m; still a guess against the brief's reference.)
- **"Room fit-out ... small — wants a closer preset or larger fittings"** — NOT
  FIXED. Tried a preset standing IN a ward storey: with 4.6 m storeys it is a
  slit of floor and soffit and the beds are specks; reverted. Fittings are real
  size on purpose (FH is not a scale factor). The real fix is trimming the
  plates back to the room ring inside the bite so the rooms sit on the section
  face; that needs finer plate grids (~35-80k tris) against ~43k headroom.
- **"Only the domes exist..."** — scope, not QA.
- Found by looking: three presets had their cameras INSIDE geometry after the
  K rescale: 'Inside the breach' (between two plates), 'A passageway' (inside
  the tube), 'The chamber' (outside the opaque dome, and the chamber itself had
  the 4.6 m floor plate through its 6.4 m cabinets). The first three plates are
  now annuli over the axis (a 17 m hall, radius 0.34 DR, via new optional
  `hallR/hallY` args to `sectionInterior`) and the three presets were re-sited.

---------------------------------------------------------------------------
## Veladiga (`65-veladiga.js`, `targets/veladiga/89z-rows.js`)

veladiga/0 194 804 · /2 192 164 (r1) -> see r3 log (breached park grid 54x42 ->
96x76, ~+10k on /2 only).

Items:
- **"The breach tear ... widens with height but does not undercut"** — FIXED.
  `scal(y)` adds two lobes of width BELOW the crest and none at it, so the crest
  band overhangs the notch on both sides; the floor-plate stubs use the same
  function so they stay on the real edge.
- **"The scour plume ... Gaussian ... does not braid or deposit a bar, ignores
  the terrace steps"** — FIXED. Braided channels (bars between them), a
  distal fan where it spreads and drops its load, and the terrace steps are
  planed off inside the channel (`scourK`). Also found: the old trough never
  showed at all — 30 m of scour in a park 4-12 m high hit the 0.8 m floor clamp
  and came out as one flat sheet; scour is now scaled into the park's height.
- RUINS greening fixed (see Hexahedron, first item).

---------------------------------------------------------------------------
## The Span (`63-canyon.js`)

canyon/0 89 260 · /1 104 220 · /2 115 232 (r1; old *log*: 89 260 / 132 808 /
123 160) -> see r3 log (+4 end caps).

Items:
- **"The three fallen payloads are small ... heavier debris fields and more
  broken-open interiors"** — FIXED (debris): each fallen payload throws a
  debris field along one bearing — 26 torn skin plates and dark interior
  fittings, 150 rubble pieces, elongated downrange. Interiors unchanged (a
  higher hole density dissolves the shells entirely: holeFn at d*0.8 > 2).
- **"Payload sway in the rusted variant is a fixed tilt..."** — FIXED. Hang
  angle now derived from the cables: a crept cable (dL) turns the head through
  atan(dL/2a); on the rusted prison one cable has PARTED and it swings about the
  surviving anchor until its centre of mass is under it, atan(a/c); cable
  beams are drawn to where the head's anchors actually went, the parted one
  dangles. (Correctly small — ~4 deg — which is why the guys exist.)
- Found by looking: the gorge walls were three sheets per side — the top plate
  overhung the inner face by up to 140 m as a floating brown ceiling, and both
  ends were open (painted card from down the gorge). Top now starts on the
  inner face's crest; each wall capped at both ends.

---------------------------------------------------------------------------
## Vashtir (`61-spire.js`)

spire/0 125 438 · /1 85 574 — unchanged.

- **"Radial symmetry visible overhead"** — FIXED: kerb blocks, causeways and
  portal stairs jittered by a HASH of their index (the PRNG stream, and
  everything after it, is untouched).
- **"Intact contrast is low"** — IMPROVED: the skin carries a vertex colour —
  1 on every arris, 0.5 in the valleys, darker at the foot of each shelf band —
  merged by a local `spMerge()` because `meshMerged()` drops colour attributes.
  Reads, but white-on-white remains at the hero distance.

---------------------------------------------------------------------------
## Theodiga (`77-dam.js`) — no open items; looked at every view

dam/0 115 772 · /1 130 844 *(log)* -> 172 424 / 182 686 (+ leaf-card trees).

- The park's 60 trees were a trunk box + 'moss' blob: 60 green lollipops in
  every preset. Now `VEG.tree`.
- The ruin was "intact with patches" at distance (the brief's words). The crest
  has failed: a ragged notch 120-28 m wide, 128 m deep, at x≈-221 clear of the
  fin cruciform; face, upstream face, crest deck, guts, tunnels and crest
  blocks all ask `notch()`; cheeks and floor close it, floor plates stand out
  of the cheeks every 8 m; debris at the toe.

---------------------------------------------------------------------------
## Requests for shared code (not done: not mine)
- `meshMerged()` should carry a `color` attribute when every input has one
  (Vashtir needed a private copy, `spMerge`).
- `apron()` at d=0 lays pale rock; under anything organic it reads as a paper
  disc. A `mat` override argument would help.
- The kit 'rubble' (regular dodecahedron, untextured white) reads as pale eggs
  at any size over ~10 m; `aiBlock` in 89b (12 tris) is a drop-in candidate.

---------------------------------------------------------------------------
## Session 2 (resumed after the recovery)

### Step 1: the recovered patch, re-verified
The worktree was first cut from the wrong base (main, without the recovery);
reset onto `ancients-resume`. Then every target rebuilt from the recovered
source: the builds are byte-identical to the committed dist (git clean after
build), all eight parse (jscheck PARSES OK), and `verify --assert`:

| target | error panel | invariants | tris per decay |
|---|---|---|---|
| arcoindian | clean | all PASS | /0 300 094 · /1 290 912 |
| arcoindian2 | clean | all PASS | /0 318 442 · /1 283 814 |
| canyon | clean | all PASS | /0 91 180 · /1 106 140 · /2 117 152 |
| dalab | clean | all PASS | /1 657 078 (exit 1 only from a 600 s screenshot timeout on 'The breach' under load ~50) |
| hexahedron | clean | PASS but `biome/0` OVER (pre-existing hyperjungle row) | hex/0 548 664 · hex/2 385 634 · mav/0 168 252 |
| spire | clean | all PASS | /0 125 438 · /1 85 574 |
| theodiga | clean | all PASS | dam/0 172 424 · dam/1 181 916 |
| veladiga | clean | all PASS | /0 194 804 · /2 202 220 |

KNOWN_ISSUES.md ticked for what the recovered patch closed (Veladiga x2,
Hexahedron x3, Span x2, Vashtir symmetry, Arcoindian I roofY, Arcoindian II
mud/ruin/dead locals).

Hero shots of every decay looked at (`Arcoindian I`/`Ruined`/`The roof fall`,
`Arcoindian II`/`Ruined`, `The Span`/`Rusted span`/`Fallen`, `The compound`/
`The chamber`, `Hexahedron`/`Sheared`/`Tree and arcology`, `Vashtir`/
`Vashtir ruined`, `Theodiga`/`Theodiga ruin`, `Veladiga`/`Breached`/
`Breached park`). Nothing in the recovered patch was broken. Found by looking:
Dalab's chamber hall carpeted with moss; Vashtir's ruined fans floating as
grey plates (both fixed below).

### Step 3: continuing down the lists
- **Arcoindian II, "the gardens are a hedge row rather than the fan"** — FIXED.
  The hedges were each turned to a random bearing; now each is laid along the
  ray from the walks' focus (FX,FZ) through it, ±3.4 deg, so the beds radiate
  with the paths. The rng() draw is still taken (and used for the ruin's
  bearing), so nothing downstream moves. Tri-neutral.
- **Arcoindian II, "the access shaft is a blank pale column"** — FIXED. Slot
  windows on dark reveals at every other landing on its two open faces, only
  where it stands free in the hollow (skips the lens band and anything above
  the vault). Hashed. arcoindian2/0 318 442 -> 318 904 · /1 283 814 -> 284 276.
- **Hexahedron, "the terrace cells are still boxes on a ring"** — IMPROVED.
  The front row of cells (the one every preset sees) gets a glazed band under
  a dark lintel per 4.4 m storey on its outward face, hashed off (k,j), ~14%
  left blank; intact only (d!==2). Same rng draws in the same order (width and
  depth captured into locals). Cells are still boxes; they now read as houses.
- **Dalab, found by looking** — `scatterMoss` started at r=0 and laid 13 m moss
  blobs on the chamber hall floor INSIDE the great dome ('The chamber'). Now
  from DR*1.02 outward; same draw count.
- **Vashtir ruin, found by looking** — the torn parasol fans were cut with a
  flat fbm threshold, which left islands anywhere across each fan, and the
  outer ones hung as grey plates in mid-air off the ruin. The threshold now
  rises with v (.30 + .60v), so what survives is a ragged collar still
  attached to its tier.
- **Veladiga breached park, found by looking** (custom high cam over the
  washout): the recovered braids/bars/fan ARE in the geometry, but relief of a
  few metres in one mud material with no shadows read as a flat sand sheet
  from any height. Shallow water threads now lie in the braid troughs
  (`brd()` factored out of `scour()`; same fbm, no PRNG), so the braiding
  shows from above, splitting and rejoining below the notch.
  veladiga/2 202 220 -> 206 956; /0 unchanged.

Verified after these changes (build, jscheck PARSES OK, `verify --assert`,
error panel clean, invariants PASS; shots looked at):
arcoindian2/0 318 904 · /1 284 276 · hex/0 587 448 (hexlush/0 592 616) ·
hex/2 385 634 · dalab/1 657 078 · spire/0 125 438 · spire/1 85 574 -> 86 410 ·
veladiga/2 206 956.

### Still open, and why
- **Arcoindian I**: the massif is improved but still a loaf in plan; the
  light-well mouths still read as dark shapes (the engine cannot shadow);
  pods acceptable; the kit's default trees.
- **Arcoindian II**: plan view impossible (inherent); the sun court floor and
  the roof-fall scar are coarse (the vault is a 20-step grid, so a rockfall
  relief needs a finer local patch); ceiling well mouths read as shapes in
  'Coronal section'/'Head-on'; small pale passage portals on the back wall
  have no ledge under them ('The gardens' view).
- **Hexahedron**: (all three closed in Round 3, below) cells were boxes; the hypertree
  is one species (an import job); the flank sag (may be correct in-world).
- **Dalab**: the dome size needs the Voth palace's dimensions; room fit-out
  needs the plates trimmed to the room ring inside the bite (~35-80k tris
  against ~43k headroom); mounds, streets and so on are scope.
- **Vashtir**: still white on white at hero distance (nothing casts shadows).
- **The Span**: fallen-payload interiors (more holes dissolve the shells).
- **Theodiga**: none open.

### Kit fragments changed this session (for re-vendoring)
`src/64-dalab.js` (vendored by `settlements/dalab`) and `src/68-hexahedron.js`
(the hexahedron code vendored by `settlements/screamers`), plus
`61-spire`, `65-veladiga`, `89c-arcoindian2`. The recovered patch before this
session also changed `63-canyon`, `70-hypertree`, `77-dam`, `89b-arcoindian`.
Neither settlement was touched.

---------------------------------------------------------------------------
## Round 3: Hexahedron

Fragments: `src/68-hexahedron.js`, `src/70-hypertree.js`; target files
`targets/hexahedron/89z-rows.js` (hexlush dressing densities) and
`91z-views.js` (three close presets). No shared fragment touched, no reseed
changed. Every step: build, jscheck PARSES OK, `verify --assert`, error panel
clean. Shots `shots/hx3_base`, `hx3_r2`..`hx3_r5`.

| type/decay | before | after |
|---|---|---|
| hex/0 | 587 448 | 682 746 |
| hex/2 | 385 634 | 492 344 |
| hexlush/0 | 592 616 | 687 914 |
| hexlush/2 | 428 298 | 535 008 |
| mav/0 | 168 252 | 175 510 (four trees, was one) |
| biome/0 | 1 550 085 **OVER** | 647 454 (PASS) |

Every invariant PASSES, including the per-type budget for the first time in
this target. Draw calls: worst sampled view 90 (was 68): seven cell kdefs and
the grove's ten.

- **Cells are architecture, not crates.** Five storey-sized modules, one kdef
  each, built once as vertex-coloured BufferGeometry (`hxGeo`): `hxLog` loggia
  (party-wall fins, spandrel, a recess 0.38 of the cell deep with a shaded
  soffit and near-black glazing, planter on the lip; 28 tris), `hxPun` punched
  window (reveals, hood; 30), `hxVlt` Soleri apse (half-barrel open to the
  view, arch ring, glazing under it; 42), `hxEave` oversailing roof with pale
  soffit (10; turned over, the underside of a hung cell), `hxPlnt` planter.
  `cell()` stacks ~4.4 m storeys in one of four hashed types: loggias,
  terraced (each storey set back 26% with a planter on the terrace it leaves),
  loggias under an apse, closed. Roof planters on half. Per-cell pour tint
  (white / ochre / grey); ruin darkens through the instance colour, so one kdef
  serves both decays. Applied to the front row of EVERY upper tier and the
  outer row of every hung lower tier (stacked down from the soffit, closed by a
  turned eave). The rows behind are `hxBlk`: glazed band plus a roof garden in
  a parapet. The round-2 band/lintel boxes are gone. Nothing casts shadows
  here, so depth is carried by vertex colour. All hashed (k,j): the old rr()
  draws are still taken in order, so nothing placed after a cell moved.
- **Night.** `hxGlow` (a plane on MAT.dot, pushed into FIREKIT by the builder
  because FIREKIT is declared in a later fragment) lights ~72% of loggia and
  punched glazing and half the blocks' bands, lamp-warm and varied.
- **The flank sags** (d=2). Decided it reads better: a cantilever that lost
  its props should droop even if the spine holds. Shells (SH/SOF/DK) and the
  kit items placed before the shafts (snapshot KIT0..KIT1) drop by 34 m x an
  angular weight (zero beyond .95 rad of FAILA, where shafts stand) x a radial
  ramp from the COM. Shafts, ground and rubble untouched. No PRNG. Subtle at
  hero range; side-on (`hx3_r4/cam0` intact vs `cam1` ruin, same relative
  camera) the failed lower point visibly dips.
- **Hypertree: four species.** `hyTree()` is the old builder generalised by a
  species table: Mav's Refuge sizes, biomes/hyperjungle habits (its LOWER
  tiers, secUp/secCurve, buttress amplitude) and Mav's bottle trunkR for the
  baobab. Bark = `HYPERJUNGLE.BARKTEX[sp]`, leaves = `BIO.geo.clump()` cards on
  `HYPERJUNGLE.LEAFTEX[sp]` (Lambert, alphaTest), ghostwood racemes and baobab
  pods: all kit kdefs made at build time (the biome loads after fragment 70),
  so they count against mav/0, not biome/0. Falls back to timber and
  icosahedron fronds when HYPERJUNGLE is absent (a vendor without the biome).
  The Ironbark takes the identical draw sequence, so it is the same tree, now
  cheaper (cards are 6 tris against 20), which paid for the grove. Ghostwood,
  Prism gum and Gate baobab stand behind it, crowns touching.
- **biome/0 brought under.** It was the hexlush dressing: 1.34M of the 1.55M.
  Walls cut hardest (each bracket is 2-4 fungus half-spheres of 81 tris):
  moss 9000->5000, plants 5200->2000, edges 3200->1300, walls 4000->700. The
  soffits pass was given `mats/curtains` keys it never reads; now `n:400`,
  which is what it always did.
- **Views.** 'Terrace cells' (190 m off the +x+z leg), 'Terrace cells at
  night', 'Hung cells' (the lower city from outside, the grove behind). The
  builder exports `HEX_SITE[d].LOWQ/LOWN` for the last.

Still open: the lower city's inner hung row is plain boxes; cell spacing along
a tread is the old layout's (sparse at close range); 'Crater soffit' looks up
the shafts more than into the hole; hex/0 and hexlush/0 are within 13-17k of
their 700k budget, so further cell detail needs savings elsewhere.

Fragments changed, for re-vendoring into `settlements/screamers`:
`src/68-hexahedron.js`, `src/70-hypertree.js` (screamers not touched).
