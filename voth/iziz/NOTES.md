# Iziz — notes

## Round 1 (Sep 23 2026) — the Vernacular set

Brief from Travis: re-do Iziz; first make the new **Iziz Vernacular** style
(wood, reclaimed metal, stone for the wealthy; inspired by the old Iziz set,
cribbing from the Beast Rider set; only rich and civic get electric light) and
show it before the city layout. Deliverable: `dist/iziz-vernacular.html`,
published as the artifact "Iziz Vernacular Set".

Decisions:
* New repo `iziz/` on the Ancients kit contract (vendored core, `VENDOR.json`),
  because the finished city needs the Ancients builders, the biome core and
  KratorSky in one instanced page and this is the only contract all of those
  already speak. See DESIGN.md.
* `VERN` registry with the project's tags on every def and every inspector
  volume; `vLit()` enforces the lighting canon at the helper level (a door only
  gets a lamp if the def is tagged lit).
* `vWorldUV`: per-instance, per-face world-unit UVs in the vertex shader. Before
  it every box stretched one texture tile over its face — a 14 m stone wall
  showed four blocks. This is the single biggest quality fix of the round and
  applies to every textured material, including the vendored Ancient ones.
* Colours: near-grey textures + `vC()` (sRGB→linear once) instance tints, the
  biome kit's lesson.
* Openings use an unlit `MAT.void` so a doorway is dark in daylight; lit
  windows are `MAT.warmPane` (unlit warm cream).

Set: poor ×3 (stilt hut, corrugate shack, panel house), middle ×3 (plaster
townhouse, setback house — two households, long house), rich ×2 (stone manor,
domed house), shop row, tavern (deco long hall), carpenter's and potter's
workshops, scrap smithy, market canopy, warehouse, school, hospital, barracks +
drill yard, alchemist's compound, grain silos, storage tank, electric generator.
24 registered volumes, 5.6 k instances, 140 k scene triangles, ~95 draw calls.

Verified: build rules green, `--assert` all pass (occupancy, NaN, budgets, tag
audit), inspector returns name/cls/tags by hover, polygon tool returns
coordinates. Screenshots read at overview and eye level; fixes made from them:
material-order bug (vernacular fragments must load after `69-mat-salvage.js`),
tarp call signature, scrap heap floating/oversized, market skirt roofs replaced
by one hip, workshop enclosure position, posts' wood grain turned upright
(`TEX.woodV`), labels shrunk and depth-tested, ground tile density.


## Round 3 — the city (Sep 23 2026)

Brief items landed: wall in the old style with four gates and bridges; three
mesa hills (palace citadel with Ancient curtain wall, two barracks blocks and
the triumphal statue; temple hill with the transplant temple, chapterhouse,
alchemist and a district on top; arena hill with the transplant arena and its
own district, the rust-coloured Ancient amphitheatre at its foot, parks, the
ruined observation tower); ring roads, thoroughfares, gate roads; the ancient
lattice in clusters (half reclaimed near the hills, half ruined further out),
kit plinths trimmed so buildings pack; guilds, embassy, forge, caravanserais,
schools/hospitals/markets/generators/tanks/silos/warehouses; the vernacular
fill along every street wealthy→poor, infill behind the frontages, farms in
what is left; eight ruined bunkers across the moat; the ruined spaceport on
the NW causeway; the hyperjungle outside the moat (hypertrees held 130 m off
the wall), undergrowth in the parks and creeping into the ruins; KratorSky
with an hour slider; inspector, polygon tool, Paths overlay.

Travis's mid-round rulings: hill tops carry districts (like the hills of Rome)
except the palace top, which is citadel only; generators near the three tops;
citadel/arena/temple + civic + guilds electrified, rich and reclaimed-Ancient
50/50 and only on the hills; barracks are real buildings with doors to the
court and windows; shrink the kit plinths.

Numbers this seed: ~3.4 M scene triangles, ~600 draw calls, ~85k instances,
13 ancient clusters / 41 ancient buildings (+ 26 transplant lots), ~330
vernacular buildings, 26 hill-top lots, 28 farm plots, 62 hypertrees. Build
~2.7 s in Chrome, ~40 s in SwiftShader.

Deferred: life layer (Voth's pathing/collision to be ported when it starts);
`HYPERJUNGLE.dress` on the ruins; the KNOWN_ISSUES city section.

### Round 3b — Travis's review fixes (same day)
Rogue tower at the centre = nested useGroupXF bug (fixed in 69c); kit centring
moved off KOFF; skyscrapers on 1x1 lots with the new square plinth (four to a
block); observation tower onto the arena hill; pentagon block cut properly
(cylinder prisms subdivided in wreck); vines hang off cut walls; chapterhouse /
alchemist / generators placed with collision sweeps (temple top widened to r0
94); parks search for level ground (never up a hill side); citadel concrete
tinted to the palace's sandstone; orb-bearer statue; the palace refined — tier
3 built round a hollow HALL (the converted hangar) with columns, lamps, great
door, great orange awning on stone poles, garden terrace with balustrade,
planters, hedges, benches and lamps, roof garden on tier 1, crenellations, banner
poles and lamp columns along the base; floating labels for every registered
volume as one atlas mesh (src/93-labels.js), toggled by the Labels button —
part of the standard new-world package with the inspector and polygon tool.

### Round 3c — Travis's second review (Sep 24 2026)
Transplant rehab roofs (big buildings get a corrugated cap on poles), no ladders
or scaffold on tall transplant blocks, pentagon/heptagon only in the transplant
version, Salvagers' Guild whole in rust (shacks kept), observation tower roof
dome, amphitheatre struts clear of the seating; kit aprons no longer float
(flat-ground build + levelled plots, terrain meshed last); repairPass inside the
transform (no more debris at the origin); kit shells keep their texture tiling;
skyscraper podiums cut down to the square plinth; Skyscrapers A-C join the
ancient pool; **The Project** (Skyscraper A, reclaimed, orange, extra salvage,
lit) placed in the slum farthest from the hills; one Skyscraper B toppled on a
lot where its fall misses every main road, plaza, park and building; gate
highways run to the nearest map edge.

### Round 3d — Travis's third review (Sep 24 2026)
See KNOWN_ISSUES "Round 3d": city fill restored (settler detours), per-type
office/apartment/house groups (rows and quads), rooftop canopies, D in rust,
the Tripod market (repaired C), toppled F toward the given point with a grid
plinth, bunkers facing out, Salvagers' dome whole, palace windows and terrace
pavilions, bigger labels.
