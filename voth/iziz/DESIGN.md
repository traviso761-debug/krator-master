# Iziz — design doc

Iziz is rebuilt as its own repo (`voth/iziz/`) on the Ancients kit's fragment
contract (see `API.md`), because the finished city has to hold four
vocabularies at once — the outer wall / palace / spaceport of the original Iziz
render, the Ancients kit in ruined and reclaimed states, the hyperjungle biome
kit, and a new **Iziz Vernacular** set — and the concatenated-fragment,
`kdef/kput` instancing contract is the only one of the existing systems that
can carry a city of several thousand buildings in one page.

Phase 1 (this round) is the Vernacular set alone, as a showcase target, for
Travis to judge before the city layout begins.

## The Iziz Vernacular — brief

What the Izani build *today*: an early-modern people, a thousand years into
living in and around the Ancients' ruins, in a hyperjungle, in a declining
empire that has lost most of the technology it was founded on.

**Inspired by the old Iziz set** (the painting's own architecture): battered,
blocky masses that taper toward the top; Mayan stepped cornices; deco vertical
window strips; tiered/setback houses; domes, barrel vaults, tent and pyramid
houses; pueblo stacks with vigas and ladders; walled compounds; timber gable
halls with porches (the tavern); striped awnings, banners, planters.

**Expressed in:**

| material | who uses it | how it reads |
|---|---|---|
| **timber** — posts, beams, board walls, shingles, lashed joints | everyone; the structural default | warm, sawn boards; poor = grey driftwood, rich = oiled dark hardwood |
| **reclaimed metal** — corrugated sheet, cut Ancient panels (ghost-white or rusted), pipe, plate | poor and middle walls/roofs, every workshop, all infrastructure | visibly salvaged: mismatched, patched, proud of the wall, never square |
| **plaster / adobe** over timber frame | middle class | the old Iziz sand palette (PAL), dirt at the foot, crack lines |
| **stone** — orange-sand ashlar, lighter stone bands | rich dwellings, civic | battered walls, stepped cornices, fluted strips; the only material that carries the deco strips properly |
| **copper (verdigris)** roofs and finials | rich + civic only | reads instantly as wealth from a distance |
| **thatch** (palm-frond) | poor roofs, market/rural sheds, silos | thick, steep, ragged eaves |

**Cribbed from the Beast-Rider set:** generous eaves (roofs overhang the wall
line 0.8–1.5 m — this is a rain climate), floors raised on stilts or a plinth,
verandas, shutters and woven blinds, drying racks, water butts, hanging gourds
and lanterns, lashed joints shown as rope collars.

**Lighting rule (canon):** only **rich and civic** buildings get electric
light — warm-white bulbs on brackets, glazed windows that glow at night. Poor
and middle-class buildings have no lights at all in the set (firelight is a
life-layer job later).

**Wealth tiers:**

* **poor** — timber frame on stilts, board + corrugate + salvaged-panel walls,
  thatch or patched corrugate roof, ladder or plank stair, tarp awning, water
  butt, 5–7 m footprint, one storey (+ loft).
* **middle** — timber frame, plaster infill, two storeys, wooden stepped
  cornice, deco shutter strips, veranda on posts, salvaged-panel or corrugate
  gable roof, striped awning, planters. 8–10 m footprint.
* **rich** — battered stone ground storey with stepped cornice and fluted deco
  strips, timber or stone upper storey, copper roof / dome / pyramid cap,
  walled courtyard with gate, electric lamps, glazed lit windows. 14–18 m.

## Registry and tags (project rule)

Every building is registered through `VERN.def({key,name,family,tags,w,d,h,build})`
and every placed instance registers an inspector volume carrying
`cls:'building'` and its tags, so the inspector can show *name · classification
· tags* on hover. Tags:

```
culture: 'iziz-vernacular'
type:    one or more of  civic | market/shop | tavern/inn | industry | farm |
         single-family dwelling | multi-family dwelling | infrastructure |
         religious | funerary | military
wealth:  poor | middle | rich | civic
lit:     true only for rich + civic (electric)
```

Flora is never part of a building (planters are furniture-scale timber boxes
with a moss blob; real plants come from the biome kit at placement time).

## Repo layout

```
iziz/
  build.py            concat src/ + targets/<t>/ -> dist/<t>.html, rules as in the Ancients kit
  verify.py jscheck.py run.sh three.min.js   the Ancients harness, unchanged
  src/
    1x–3x, 50, 54, 68, 69   VENDORED from ../ancients/src (byte-identical; VENDOR.json has sha1s)
    69b-vern-mat.js         vernacular textures, materials, kit items (all names v*/V*)
    69c-vern-helpers.js     VERN registry + building-block helpers (vn*)
    70-vern-dwellings.js   poor ×3, middle ×3, rich ×2
    71-vern-trade.js       shop row, tavern, workshop ×2, scrap smithy, market canopy, warehouse
    72-vern-civic.js       school, hospital, barracks + drillyard, alchemist's compound
    73-vern-infra.js       grain silos, storage tank, electric generator
    90-scene.js 91-probe.js 92-camera.js 99-tail.html   Iziz's own scene/probe/UI (inspector w/ tags, polygon tool, walk mode)
  targets/vernacular/     89z-rows.js (SITES), 91z-views.js (VIEWS)
```

Later phases add `targets/city/` and vendor the Ancients builders + the biome
core + KratorSky the same way.
