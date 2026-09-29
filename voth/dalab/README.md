# Dalab

The building kit for Dalab — the mound-builders of the south-western lowlands,
descendants of the staff, patients and test subjects of the Ancient genetic
laboratory whose domes stand at the centre of their settlement. This repo holds
the **buildings**; the settlement itself (the lab, the mounds and their outlying
towns, the highway circuit, the farms, the life layer) is the next phase and is
laid out from these.

```
python build.py                                     # every target: dist/dalab-set.html (the kit), dist/dalab.html (the settlement)
python build.py --target city                       # the settlement only
python jscheck.py .syntax-set.js .syntax-city.js    # do they PARSE? (headless Chromium, ~5 s)
python verify.py dist/dalab-set.html --assert --views "Opening,Noble houses,Temple — eye level" --out shots
python verify.py dist/dalab.html --assert --views "Overview,Main plaza,Ashfold — overview" --out shots   # ~12 s build, ~1 min a shot in SwiftShader
python build.py --vendor-check                      # are the vendored fragments still identical upstream?
```

* **`DESIGN.md`** — the brief: materials, castes, motifs, the lighting rule, the mounds.
* **`API.md`** — the contract: registry, kit items, helpers, how to add a building, the lighting package.
* **`KNOWN_ISSUES.md`** — what is broken or unfinished. `build.py` prints the open ones.
* **`NOTES.md`** — round by round.

Built on the Ancients kit's fragment contract, exactly as Iziz is: `src/` is
concatenated in filename order into one `<script>`, every top-level name is
shared, `build.py` enforces seed discipline and name uniqueness. The core
fragments are vendored byte-identical from `../ancients/src`, the Vernacular
helpers, sky, scene, probe, camera and labels from `../iziz/src`, and the
south-western lowlands biome (for the palace gardens; the settlement later)
from `../biomes/swlowlands/src` as `86-bio-*.js` (`VENDOR.json` has the
sha1s). `three.min.js` is the pinned r128 copy that
`verify.py` serves in place of the CDN.

## The set (rounds 1–2, Sep 28 2026; the town types round 10)

| family | keys |
|---|---|
| dwellings | `dalab_hut_a` round earth hut · `dalab_hut_b` scrap hut · `dalab_hut_c` post house · `dalab_compound` family compound · `dalab_noble_a` stone hall · `dalab_noble_b` great roundhouse · `dalab_noble_c` earth-walled manor |
| trade / industry | `dalab_tavern` · `dalab_market_small` · `dalab_market_large` (3×) · `dalab_shops` shop row · `dalab_granaries` · `dalab_warehouse` · `dalab_smithy` scrap smithy · `dalab_workshop` · `dalab_potter` · `dalab_weaver` · `dalab_dyer` · `dalab_windmill` |
| civic | `dalab_barracks` guard's barracks (giants) · `dalab_healers` healers' hall · `dalab_embassy_iziz` · `dalab_embassy_voth` · `dalab_embassy_yuni` · `dalab_embassy_republic` (a Peles villa from the Highlands kit's Republican set, vendored) · `dalab_chapterhouse` (Historians', ported from the Yuni set) · `dalab_halls` Halls of Reformation (r 68: gatehouse, the great hall — r 18, sixteen piers, clerestory, ribbed panel dome, portico and apses — four wings, cell blocks, archive, vats, two pylons) |
| farm | `dalab_ranch` (120 m: house, barn, paddocks, monster pen; stock from the `DFAUNA` registry — lizards) · `dalab_orchard` orchard plot |
| town types (round 10, `71c-dalab-town.js`) | `dalab_rowhouse` terrace row (three cells, one thatch) · `dalab_tenement` stacked house (two storeys, outside stair, gallery) · `dalab_well` well court · `dalab_bathhouse` bath house (domed hot room, pool court; lit) · `dalab_scribes` scribes' hall (lit) · `dalab_inn` travellers' inn (lizard stalls, stacked lodge) · `dalab_earthyard` earth yard (block stacks, mixing pit, ramming shed) · `dalab_watchtower` watch tower (lookout, a giant at the foot) |
| sacred | `dalab_temple` priests' temple · `dalab_priest_house` · `dalab_priest_compound` priests' compound (ground level: ring wall, three houses, chapel, stele court) · `dalab_shrine` · `dalab_mound` ceremonial mound (temple + house on top, stair, plaza) · `dalab_palace_mound` High Priest's palace mound (three stone terraces built into the slope, each with its landing and flights, terraced gardens on the flanks, palace hall and wings on top) · `dalab_high_mound` High Priest's mound (terrace, greater temple, ring earthwork with one entrance) |

Every def is placed through `VERN.place(scene,key,x,z,ry,o)` (69c), builds in a
local frame with +z the front, registers inspector volumes with the project's
tags (`culture:'dalab'`, type, wealth, lit) and pushes every door into `DOORS`
for the pathing layer.

## Lighting

`94-dalab-light.js` is the standard lighting package from the Iziz city
(KratorSky sun/hemi/fog by hour, an hour slider, a seventh element on a VIEWS
preset) plus the Ancients kit's night flip (whole InstancedMeshes toggled by
visibility). The God's light is cold teal-white and belongs to priest, noble and
civic buildings only; hearth fires and yard fires burn in peasant houses at
night. `N` toggles night while flying.

## The settlement — `targets/city/` → `dist/dalab.html`

| fragment | what |
|---|---|
| `63-anc-dalab.js` | the Ancient lab, vendored from `../ancients/src/64-dalab.js`, placed at scale .4 (a 180 m dome, a 480 m compound) |
| `84-city-geo.js` | `CITY` constants, the six outlying settlements + the main one (`SETTLE`), the river and the irrigation `CHANNELS`, `terrainH` (flat lowland ~2 m up, the river cut 3.5 m, the channels 1.4 m), `WATER_Y` |
| `85-city-paint.js` | the painted ground (albedo / buildable mask / class canvases), `road disc field water footprint precinct`, samplers |
| `87-city-layout.js` | per settlement: the mound disc, the plaza in front of it, radial streets, ring street(s), the lane behind the mound; the highway circuit through the outlying plazas with four spurs off the map; the main settlement's links; the live-oak `AVENUE` lab → main plaza; the High Priest's mound outside the lab gate; farm wedges and farm lanes; the connectivity pass (one network, `_roadComponents`); bridges |
| `88-city-place.js` | occupancy (rotated footprints), `groundOK` against the mask (no building on a street, plaza, field or water), street alignment (`faceRoadRy`), `placeDef placeNear frontage`, the lab wrapper |
| `90a-city-world.js` | terrain mesh with the albedo, the water strips, the lab, the High Priest's mound, every settlement's mound |
| `90b-city-build.js` | per settlement: market on the plaza, the civic set round its rim, nobles, the frontage walker (15–20 houses; 3× in the main settlement); the main settlement's Halls, ranch, embassies, chapterhouse, healers, priests' compounds, windmills; bridges; the audit (`_audit`: on-road / overlaps); the biome (clearing mask, residual stands, the forest edge, the avenue oaks, a cork grove, river willows); `kbake` |
| `93-city-ui.js` | Paths overlay, Trees toggle, budgets, `window._api.city` |
| `95-city-life.js` | the life layer: townsfolk on the road graph (Dijkstra), farm workers in the fields, priests climbing to the ceremony by the hour, the High Priest between his mound, the lab gate and the Halls, giant patrols in threes |
| `91z-views.js` | presets, day and night |

Lighting is the same package (`94-dalab-light.js`): KratorSky by hour, the night flip, The God's light on priest / noble / civic.
