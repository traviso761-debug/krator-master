# Voth — Market, park and funerary districts

Hand-marked districts that override the default build: four market areas, four
parks, one funerary district, plus two canton conversions.

---

## 0. Districts are marked polygons, not a zone function

`zoneAt()` is analytic — it derives everything from shore parameter and land
distance. These districts are hand-placed and don't fit an analytic form. Add a
separate layer:

```js
var DISTRICTS = [ { type:'market'|'park'|'funerary', poly:[[x,z],...] }, ... ];
function districtAt(x,z)   // → type or null, point-in-polygon over DISTRICTS
```

**Ordering is load-bearing.** Per `references/placement.md`, precincts are
painted *after* roads so they override, and the mask is read once after all
painting. So:

1. Roads painted
2. District polygons painted into the visible canvas and the class canvas
3. District footprints reserved (`reserve()`) and props pushed to `OBST`
4. Mask read
5. Building passes run

Districts declared after the building pass will put houses in the park. The
compound pass (`src/60-land.js:2009`) and the town pass both grid-scan against
`openAt()`, so the mask has to know about districts before either runs.

**Every district is also an attractor.** Each writes to `ATTRACTORS` per the
life brief §6 — markets and parks with high weight, funerary low. Crowd density
in the ambient tier keys off these, so the record has to exist even though life
lands later.

---

## 1. Coordinates — estimated, must be confirmed

Derived by pixel measurement from the overview screenshot, solving the affine
map against the two monumental cantons: Palace at `(-330, 700)` and Temple at
`(210, 170)`. That gives roughly **4.4 world units per pixel**.

**These are starting points, not specifications.** The HUD already prints world
coordinates on click ("Click the world to print its coordinates"). Probe each
region's corners and replace these numbers before building anything. Expect my
estimates to be off by 50–150 units, and possibly more if I misidentified which
square is Palace.

| Region | Est. centre | Notes |
|---|---|---|
| Market A | `(1270, -510)` | north-east shore, inside the wall |
| Market B — **canton** | `(-1120, 700)` | west rim canton — identify by name |
| Market C | `(1380, 620)` | east shore, inside the wall |
| Market D | `(550, 1770)` | south shore, elongated, angled |
| Park A | `(-1380, -360)` | large, north-west shore |
| Park B | `(1230, -200)` | small, north-east, in the city |
| Park C — **canton** | `(640, 450)` | identify by name |
| Park D | `(165, 1940)` | small, south shore |
| Funerary | `(2390, -85)` | east hillside, above the city |

**Two things to check before starting.**

The funerary district estimate sits at roughly x 2270–3170, but `CITY_EXT` is
2400 (the ground texture and mask end there) and `CITY_LIM` is 2280 (nothing is
built beyond it). If the probe confirms it, either pull the district inside the
limit or extend both — and extending them means re-baking the ground canvas at
a larger extent, which is not a small change. Resolve this first; it may
invalidate the rest of the funerary section.

The two canton conversions need to be identified **by name**, not coordinate.
`CANTONS` (`src/30-layout.js:660`) has ten entries; the rim ones resolve their
positions from a shore parameter and are then moved by a relaxation pass, so
their final coordinates aren't in the source. Log `CANTONS.map(c => [c.n, c.x|0,
c.z|0])` and match against the probe. Note there is already a canton named
`Market` — if that's the purple one, this is a re-spec rather than a conversion,
and if it isn't, two cantons will need distinguishing names.

---

## 2. Market districts

**Ground districts (A, C, D).** Stalls and awnings through the middle, small
shops around the edges.

- **Stall rows align to the bounding street.** Take the district's longest
  bounding street segment from the graph, run rows perpendicular to it. Stalls
  are small (4–8 units), awnings overhang by 2–3 and want a fabric palette
  distinct from the roof tones already in use.
- **Edge shops** are ordinary `structure()` calls with `kind:'hlaalu'`,
  constrained to a band along the district boundary and facing inward.
- **Leave circulation.** Aisles at least 8 wide between stall rows, and one
  clear lane from each bounding street into the interior — the ambient crowd
  paths through here and a sealed market reads as a blockage.
- **Reserve every stall** before the building pass. Street furniture that isn't
  reserved gets built over; this is the most repeated lesson in the placement
  reference.

**Market canton (B).** Follow the existing variant pattern exactly: `c.port`
and `c.arena` each set a flag on the `CANTONS` record and dispatch from
`platCanton()` to `portDeck()` / `arenaDeck()` (`src/50-cantons.js:1479`,
`:1487`). Add `c.market` → `marketDeck(c, y, hw)`. Same shape, no new
machinery.

`marketDeck` replaces the default courtyard-of-buildings with a stall grid on
the top tier plus a covered hall or two, keeping the tier profile intact.

**Piers for small craft.** The existing `PIERS` are harbour-only, generated
along the harbour arc (`src/30-layout.js:938`) and sized `rr(11,17)`. Small-boat
piers need a new, shorter, lower type off the canton flank — call it `CPIERS` —
at causeway level (`CWAY = 17`) rather than harbour level, three or four of
them, 5–8 wide. They must be stroked into the mask like the others
(`src/40-ground.js:1178`) and, once the street graph exists, registered as graph
nodes so the ferry network can call here. This canton becoming a ferry stop is
the point of the piers.

---

## 3. Parks

**Ground parks (A, B, D).** Heavy vegetation plus small monuments.

**Four new species, park-only.** `plant()` (`src/70-veg.js:2376`) currently
picks from fungoid / scrub / ashland tree / reeds. Add a parallel `plantExotic()`
selecting from:

- **Emperor mushroom** — the existing tall capped mushroom at much larger scale;
  a landmark-sized cap, one or two per park, not scattered.
- **Baobab** — fat tapered trunk (`FR6` or a heavily tapered `STK`), sparse
  crown, wide and low.
- **Dragon tree** — short thick trunk splitting into several upward branches,
  each capped with a tight spiky rosette.
- **Cherry blossom** — slender trunk, broad soft canopy. **This needs a new
  colour family**; `LEAFC` is all olive-greens and there is no pink anywhere in
  the palette. Add `BLOSSOMC` and keep it desaturated — saturated pink against
  the ash-and-plaster palette will read as a bug.

Engine constraint from `references/threejs-pitfalls.md`: one InstancedMesh per
material. Four new species with new palettes means new families in `BUCKET` —
check the draw-call count after, and skip any family that ends up with zero
instances.

**Exclusivity.** These species appear nowhere else on the map. Gate them on
`districtAt(x,z) === 'park'` inside the exotic planter, and make sure the main
vegetation scatter *skips* park polygons entirely rather than layering ordinary
scrub underneath — the main loop already has the pattern for this (`if(zn ===
'orchard') continue;`).

**Monuments.** Small statues, obelisks and benches scattered through. All are
props with footprints: decide them before the building pass, `reserve()` each,
and give obelisks an oriented rectangle rather than a mask disc.

**Hanging garden canton (C).** `c.garden` → `gardenDeck(c, y, hw)`, same
dispatch pattern as above.

- Tiers of greenery: the canton already builds `c.tiers` stepped frustums with a
  cornice each. Plant the cornice ring of every tier and let foliage overhang
  the edge. Use the exotic species here too.
- **Waterfalls are the one genuinely new rendering problem in this brief.**
  There is no falling-water geometry anywhere in the source, and the animated
  water is a single shader on a plane (`src/75-terrain.js`). Simplest workable
  version: thin vertical translucent sheets from each tier cornice to the one
  below, scrolling a procedural texture off the existing `uTime` uniform, with a
  small additive spray blob at each impact point. Do this as its own pass and
  screenshot it in isolation before integrating — transparent geometry interacts
  badly with the instancing path and is excluded from the verify sweep.

---

## 4. Funerary district

East hillside above the city, low density. Read the `CITY_LIM` warning in §1
first.

- **Graves and family tombs**, sparse — target a fraction of the town pass's
  density, with wide gaps. Graves are small markers (stelae, low slabs); family
  tombs are squat one-room structures, a new `kind` in `structure()` or a
  standalone builder.
- **Dirt paths** back to the main road. These are a new road class — `'track'`,
  width 4–6, in a browner tone than `ROADCOL.minor`. They must be created
  through `road()` so they enter `ROADS`, and once the graph exists they need to
  be graph edges joining the main road, or nothing can path to the temple.
- **Funerary temple**, white marble clad, sited close to the main road at the
  district's downhill edge. This is a hand-built landmark from primitives with
  position from a named constant — not procedural infill. White marble means a
  near-white tone that doesn't currently exist in `TONES`; check it against the
  fog and the terrain so it doesn't blow out at distance.
- **Thematic link**: there is already an `Ancestry` canton in `CANTONS`. Worth
  deciding whether the funerary district relates to it — a road or a ferry stop
  connecting the two is nearly free and makes both legible.

---

## 5. Acceptance

- `districtAt()` returns correctly for probe points inside and outside each
  polygon.
- Zero buildings from the compound or town pass inside any district polygon
  (count and expose as `window._districtIntrusions`).
- Exotic species count is nonzero per park and **zero** outside parks — expose
  `window._exotic` as a per-species map.
- Every stall, statue, obelisk, bench and grave is in `OBST` before the building
  pass; residual overlap count unchanged from before this work.
- `CPIERS` stroked into the mask; no building within their footprint.
- Draw-call count after the new vegetation families is within budget — log
  before and after.
- Screenshots: add presets for each of the nine regions. Per the skill, shoot
  every preset every round, not just the ones you think changed.
