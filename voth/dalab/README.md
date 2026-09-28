# Dalab

The building kit for Dalab — the mound-builders of the south-western lowlands,
descendants of the staff, patients and test subjects of the Ancient genetic
laboratory whose domes stand at the centre of their settlement. This repo holds
the **buildings**; the settlement itself (the lab, the mounds and their outlying
towns, the highway circuit, the farms, the life layer) is the next phase and is
laid out from these.

```
python build.py                                     # src/ + targets/set -> dist/dalab-set.html
python jscheck.py .syntax-set.js                    # does it PARSE? (headless Chromium, ~5 s)
python verify.py dist/dalab-set.html --assert --views "Opening,Noble houses,Temple — eye level" --out shots
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

## The set (rounds 1–2, Sep 28 2026)

| family | keys |
|---|---|
| dwellings | `dalab_hut_a` round earth hut · `dalab_hut_b` scrap hut · `dalab_hut_c` post house · `dalab_compound` family compound · `dalab_noble_a` stone hall · `dalab_noble_b` great roundhouse · `dalab_noble_c` earth-walled manor |
| trade / industry | `dalab_tavern` · `dalab_market_small` · `dalab_market_large` (3×) · `dalab_shops` shop row · `dalab_granaries` · `dalab_warehouse` · `dalab_smithy` scrap smithy · `dalab_workshop` · `dalab_potter` · `dalab_weaver` · `dalab_dyer` · `dalab_windmill` |
| civic | `dalab_barracks` guard's barracks (giants) · `dalab_healers` healers' hall · `dalab_embassy_iziz` · `dalab_embassy_voth` · `dalab_embassy_yuni` · `dalab_embassy_republic` (placeholder) · `dalab_chapterhouse` (Historians', ported from the Yuni set) · `dalab_halls` Halls of Reformation (r 68: gatehouse, the great hall — r 18, sixteen piers, clerestory, ribbed panel dome, portico and apses — four wings, cell blocks, archive, vats, two pylons) |
| farm | `dalab_ranch` (120 m: house, barn, paddocks, monster pen; stock from the `DFAUNA` registry — lizards) |
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

## Not in this repo

The Ancient lab itself is `../ancients/src/64-dalab.js` (target `dalab` there:
a 450 m dome with seven satellites inside a 1.2 km ruined wall). The settlement
pass vendors it the way Iziz vendored the Ancients builders, together with the
`swlowlands` biome kit.
