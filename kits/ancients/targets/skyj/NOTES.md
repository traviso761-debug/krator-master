# Skyscraper J — the Whorl — hand-back notes

`src/89l-sky-j.js` · `buildSkyJ(scene,gx,gz,d)` · seed `reseed(9770+d)` (claims
9770-9774) · target `skyj` (`dist/skyj.html`) · ROWS key `skyJ` · prefix `sj`/`SJ`
(`SJ_SITE`, `SJ_PT`, `SJ_PM`, `sjGrid`, `sjSweep`, `sjPlate`, `sjGlowOn`,
`sjStoneTex`, `sjWinTex`, `TEX.sj*`, `MAT.sj*`; views: `SJDEF SJS SJI SJR SJT
SJH SJV SJHERO SJF sjFP SJFP`). No new kdefs. Row for the kit:
`skyJ:{z:?,s:300,r:280,t:1200}` + `EXTRA_BUILDERS.skyJ=buildSkyJ`.

## The form
Reference 15.jpg's language (stacked undulating plates, twisting; diagonal
ribs binding them with oval voids; broad balconied base the ribs root on; open
ribbed spire; warm pale timber/stone), not the object.

| | |
|---|---|
| base block | 5 storeys x 6.4 m to a roof garden at 32 m; plan `74(1+.13cos2θ+.05cos(3θ+1))` (63-87 m); every slab a thick lipped balcony plate with its own rolling balcony depth (0.8-7 m); glazed storeys; ground-floor loggia (glazing set back 9 m, 72 columns) |
| tower | 64 plates at 4.6 m, 38 → 328 m. Mean radius `Et(y)`: trunk flare off the roof (~47), belly, waist, cap flare under the roof plate (~35). Every third plate a deep terrace plate (lobes ±20%, 1.1 m upturned lip, rolling edge ±1 m); the others thinner (±13%). Outlines turn 0.1 rad a plate (one turn up the tower) |
| ribs | 8 swept rounded-rectangle bands (6-11 m wide, 3-4 m deep), one full turn up the body, each wobbling against its neighbours in antiphase so they kiss and part (the oval voids). Below 112 m they flare out over the roof like a trunk; the 4 even ribs sweep on over the roof edge to the plaza as buttress roots (feet ~Rb+30); the odd 4 root on the roof |
| plates meet ribs | each plate's outline swells locally to reach any rib its lobe falls short of, so every rib is carried by the plates it crosses |
| glazing | one opaque window-wall skin at 0.66 Et, one row per storey, texture of 8 bays x 4 storeys with ~1/3 warm-lit rooms (emissive map = the same cells, so night lights them) |
| crown | cap flare, roof plate, glazed lantern, three hoops, 8 ribs closing to a point at 424 m, needle to 436 m |
| plaza | paved disc r 122, apron to 142, trees, figures on the plaza and the roof garden |
| night | warm line under every terrace lip (`MAT.sjGlow`, emissive only when `NIGHT`, via onBeforeRender — nothing rebuilt) + lit rooms |

Materials: `MAT.sjStone` (ivory laminated stone, grain runs along each sweep),
`sjStoneR` (weathered, streaked, lichen), `sjWin`/`sjWinR`, `sjCore` (dark
board-formed core), `sjPave`/`sjPaveR`, `sjGlow`.

## Decay
* **1 ruined**: per-rib ruin plan — root feet sheared (ends hang above the
  plaza), lengths knocked out, ribs snapped at 120-285 m with the piece above
  splayed outward 0.4-0.8 rad or gone, jagged tops ±40 m round the roof;
  plates missing 16% at the foot rising to ~66% at the top (+40% in the top
  40 m), bitten edges; glazing rows die with their plates (and 50-70% of the
  rest); the dark service core stands bare above the last floors; spire,
  hoops, lantern gone; fallen rib lengths and the needle on the plaza; moss,
  vines, rubble talus, trees.
* **2 toppled**: breaks at 150 m (jagged ±7 m plates, ±9 m ribs). The stump
  stands; the upper body (150 → 335 m) is laid on the plain toward +x
  (±0.3 rad), axis tilted by its own taper so both ends rest on the ground;
  the spire snaps off at the cap and lies beyond it, dropped with
  `dropFragment`; rubble along the body. Own topple, not `toppledUpper`,
  because a tapering body on `toppledUpper`'s fixed 0.94 tilt floats its
  spire ~60 m off the ground. Same `d!==2` standing test as `bodyGroup`.
* **3 rehabilitated**: level-1 fabric at `HOLES=.55` (plate loss/bites/glazing
  holes all scale with `HO=dd*HOLES`), full height, ribs and spire whole; no
  snapping (that is level-1 only). repairPass dresses it.

## Numbers (final `verify.py --assert --all-views`, 14 views, all PASS, error panel clean)

| decay | triangles | instances | meshes |
|---|---|---|---|
| skyJ/0 intact | 175 520 | 377 | 9 |
| skyJ/1 ruined | 114 292 | 1 475 | 9 |
| skyJ/2 toppled | 133 290 | 1 636 | 12 |
| skyJ/3 rehab | 173 834 | 2 091 (+repairPass) | 9 |

Whole-scene worst draw calls 61 (row view / fallen body). 12 registered volumes
(tower, base block, spire or fallen upper body per decay). The spire is its own
mesh so its registered volume holds a probe point. Kit target builds and parses
with the fragment (`build.py --target kit` + `jscheck.py`), outputs restored.

## Views (14)
Skyscraper J (row) · The Whorl · Ruined · Rehabilitated · Toppled · The lattice ·
The ruined lattice · The crown · The broken crown · The base (people scale) ·
Looking up · The fallen body · Night · The terraces at night. Derived from
`SJ_SITE` (the fallen body's angle/length come from the builder).

## Weaknesses
* The rib lattice reads as a dense helix more than as the reference's big
  oval voids; the ovals are there (antiphase wobble) but narrow at 8 ribs.
* Ribs are separate tubes; where they kiss they interpenetrate rather than
  fuse, and root/roof junctions are intersections, not blends.
* The fallen body reads as a cage of vertical discs; its plates are whole
  (they did not crush on impact). Its spire fragment lies close to the body's
  end and is hard to see from the "Toppled" preset.
* Ruin plate bites are sector cuts through the whole profile; cut faces are
  open (no section fill), acceptable at distance.
* The night lip glow tone-maps to a pale cream rather than a warm amber.
* "Looking up" is taken from the plaza, so the base block hides the first
  plates; the tower soffits read brown-orange from the ground bounce light.
* Five canvas textures are generated at load in every target (~0.8 M px).

## Design pass (2026-10-01): junctions and crown
* **Junctions.** Every meeting of ribs is now a made thing in the same stone,
  derived from the ribs' own paths (no rng): a lens-shaped CLASP with a boss
  wherever two neighbours kiss (found as the local minima of their centre
  distance where the bands overlap); a COLLAR (the rib drawn fatter for 4 m)
  at every terrace plate it passes, at the base roof's lip for the roots and at
  each hoop of the spire; a flared SHOE where a rib roots on the roof or the
  plaza. A ruin keeps exactly the junctions on the pieces it keeps (a clasp
  needs both ribs standing unsplayed there, a collar needs its plate).
  `ribGeo` gained an optional `sx(t)` scale for this.
* **Crown** (`crown()`, used standing and for the fallen spire): a lipped
  coronet where the ribs leave the roof plate; four hoops (13/29/47/66 m), each
  clasping every rib it crosses; a glazed lantern 57 m tall, banded every two
  storeys (lit at night by sjWin's emissive); a stone spindle to the knot at
  424 m; an ovoid boss on the knot; a banded needle to 457 m. Registered
  heights follow (+20 m).
* **Toppled.** The fallen spire was the bare ribs and one hoop; it is now the
  whole crown, broken (hoops sectored, lantern glass mostly gone).
* Weaknesses struck: "rib junctions intersect", "spire fragment is small".
  Still: the fallen spire lies near the body's line, so the 'Toppled' preset
  sees it end-on; 'The fallen body' shows it well.
* The lighthouse (89n) has its own copy of the body code and calls only the
  shared helpers, which are unchanged; it builds and looks as before.
