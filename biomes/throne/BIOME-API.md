# Krator biome kits — the contract (the Throne edition)

The Throne kit (`THRONE`) is built on the shared biome core exactly as `biomes/crater-drylands` is
(`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`, `lod`, `windows`). This
file says what is different and what the kit exports. The design is `NOTES.md`.

## The region

The scale model's 'Throne/Volcano' biome region: the volcano at the crater's centre, 10.9 km high, the Ring Sea round it.
This first station is its south-east shoulder at ~1.9 km, about 95 km from the vent, where the plume's south-western
edge crosses (Koppen BSk, Csa, BSh, Csb: `THRONE.KOPPEN`, read off the scale model's rasters, `NOTES.md`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `plume` | how far under the plume, 0..1 | **the turn**: the shoulder's species (Earth's descendants, the crater's standbys) give way to Krator's own |
| `vent` | near a fumarole | steaming ground: bone bells, brain caps, vent coral, the mat; its edge (`halo`) the spice trees |
| `acid` | the acid lake's and hot pools' shores | sulphur rosettes, vent coral, drizzle trumpets |
| `cinder` | a cinder cone's loose flanks | sparse: star aloes and ash pines on the shoulder, rope-trees and soot cups under the plume |
| `skylight` | the floor and walls of a skylight into a lava tube | ferns, scale cones, glow mushrooms, lamp caps, trumpet trees |
| `ash` | the ash's depth | read, not yet used for zoning (the ground paints it) |
| `barren` | ground nothing has rooted in yet (a cone a few decades old) | zeroes every zone |
| `flow` | channels (the gullies) | stilt parasols, trumpet trees, ferns, scale cones |
| `rock`, `slope` | bare rock, gradient | `cliff` (a flow's front, a crater wall) zeroes every zone |
| `wet`, `cold` | rain, temperature | read, not yet used |
| `humid` | the climate: 1 windward, 0 on the shoulder | `wetW` / `dryW`: the wet species or the dry |
| `owned`, `kedge`, `knear` | the kipuka (station 2) | the hyperjungle's ground; its rim (great ruffs, frill trees); the young lava outside it |
| `field`, `clear`, `coast`, `edge` | the frontier (station 3) | plantations, clearings, the shore's strip, the poison gardens |
| `grove` | the geyser isle (station 4): the warm ground round its basin | **wild spice that bears** (the isles' geyser ground: `NOTES.md`), tree ferns, arch palms |
| `iwood` | the isle's own forest | a closed forest of lehua over tree ferns, a few palm frill trees (an island's: smaller) |
| `beach` | the strip behind the isle's sand | coconut palms and palm frill trees, leaning out to the sea (downhill) |
| `mangal` | the lagoon's shallows and mud flats | the hyper-mangroves (the shallows pass, off the mask: they stand in water) |
| `wrack` | the high-water line on the sand | the wrack (seaweed cast up flat) |
| `savanna`, `capwood`, `braid`, `burn` | the south-flank savanna (station 6): the tall grass, the gill-parasol woods, the lahar fan's bars and channel margins, a fresh burn | star aloes, frill-trees and trumpet trees in the grass; gill-parasols in the woods; stilt parasols along the channels; fewer on the burn. Where they are, the open stages stand down (the station zones all its ground) |
| `cave`, `hot`, `pile`, `intube` | the lava tube (station 11): a tube's dark floor, the hot reach, a breakdown pile, inside a tube | the cave pass (`THRONE.buildCave`, only where `cave` exists, on its own seed): glow mushrooms, pale fungi, scale cones, the mat, lichen, stones on the dark floor; the station also sets `skylight` under its holes (the kit's skylight zone: siphon trees, lamp caps, ferns) and `flow` on the holes' rims (the gully zone) |
| `deathzone` | the caldera rim (station 10): the summit's death zone (1 everywhere there) | no trees; the cold pass (on `cbelt` present) plants only lichen on the rocks (`tundra`) and moss and the mat on the warm ground (`warm`) |
| `rivbank` | the glacier (station 9): the river's banks, both sides | the gill-coral trees crowd them (the conifers keep back) |
| `cbelt`, `tundra`, `warm`, `snow` | the glacier (station 9): the cold belt's woods, the moraines' bare ground, the warm ground round the fumaroles, how much snow lies | the conifers on `cbelt`, the gill-coral trees (sp 24, `cold:true`, riparian) on `rivbank`, the glass willows (sp 25, `cold:true`) at the treeline (`tundra`) (the conifers dusted by `snow`), and, only where `cbelt` exists and on its own seed (`THRONE.buildCold`), teal cushions, fallen caps, lichen, moss, the mat and glow mushrooms on the warm ground; the station sets `owned` 1 everywhere so the kit's shoulder and plume woods stand down |
| `sulph` | vent country (station 8): sulphurous ground (the marsh and its banks, the vents' crusts, the steam valley's floor) | the **sulphur life**: brimstone candelabras (sp 23, `vents:true`, in up to ~0.6 m of water: a pass's `opt.depth` plants off the mask), and, only where the field exists and on its own seed (`THRONE.buildSulphur`), brimstone reeds, acid pads on the open water, gas bladders |
| `ashdeep` | the ash desert (station 7): where the ash lies deep | the rope-trees and drizzle trumpets thin out on it (0 elsewhere: no other station changes) |
| `cforest` | the cloud forest (station 5): its elfin woods | elfin trees (two stands: a sparse one everywhere, a dense one within 90 m of the cameras), tree ferns, veil trees, gnarled lehua; its understory's green ferns |

**The flow age is the kit's own.** `THRONE.flowHistory(o)` lays the lava over the host's land (46). A host calls it once,
before it binds its terrain, and adds `FLOWS.thickAt` to its ground; an open world would run it over its region once or
bind an age field of its own: the kit reads only `THRONE.ageAt(x,z)` and `THRONE.flowAt(x,z)`.

## The flow model (`46-biome-throne-flows.js`, [G data])

```js
THRONE.flowHistory({R, cell:8, baseH(x,z), old:8000,
                    flows:[{key, name, x, z, age /* years */, len, w:[w0,w1], th:[t0,t1], veer, wander, seed}]})
  -> FLOWS {R, cs, N, x0, z0, thick, age, id, old, flows /* each with its path */, ageAt(x,z), thickAt(x,z), idAt(x,z), shares()}
THRONE.ageAt(x,z) / flowAt(x,z)                  // the current history
THRONE.stages(age) -> {fresh, young, mature, old} // the mosaic's stages as weights
THRONE.OLD                                        // 8000: the age of ground no recorded flow reached
```

Each flow runs downhill from its vent over the ground as it stands (the land and the older flows on it), its direction
the fall line turned by `veer` and a noise `wander`, widening from `w0` to `w1` in lobes; it lays a flat-topped sheet
`th` thick with steep, ragged margins. Flows run oldest first, so the young lie on the old.

## The zones (`THRONE.zones(x,z)`)

`vent`, `halo`, `marsh`, `sky`, `cinder`, `gully`, `cliff`, and the open ground by its stage (`fresh`, `young`, `mature`,
`old`); `alien` (the plume, a little ragged) and `seam` (its middle). Every zone is multiplied by `1 - cliff` and
`1 - barren`. The passes share each stage between the shoulder (`1 - alien`) and the plume (`alien`).

## The species (`THRONE.SPECIES`, tagged)

| # | key | name | H (m) | origin | lives |
|---|---|---|---|---|---|
| 0 | spice | Spice tree | 8-15 | earth | seam (its resin is the spice: `NOTES.md`) |
| 1 | trumpet | Trumpet tree | 9-18 | krator | shoulder |
| 2 | frill | Frill-tree | 5-10 | krator | shoulder |
| 3 | gillparasol | Gill-parasol | 10-22 | native | seam |
| 4 | stilt | Stilt parasol | 12-26 | native | seam |
| 5 | staraloe | Star aloe | 4-9 | krator | shoulder |
| 6 | pagoda | Pagoda cap | 8-20 | native | plume |
| 7 | drizzle | Drizzle trumpet | 5-13 | native | plume |
| 8 | bonebell | Bone bell | 9-24 | native | vent |
| 9 | ropepuff | Puffball rope-tree | 6-14 | native | plume |
| 10 | lampcap | Lamp cap | 1.6-4.5 | native | plume |
| 11 | ashpine | Ash pine | 14-28 | earth | shoulder |
| 12 | greatruff | Great ruff | 100-165 | krator | windward |
| 13 | siphon | Siphon tree | 14-30 | native | windward |
| 14 | lehua | Lehua | 6-20 | earth | windward |
| 15 | treefern | Tree fern | 3-9 | earth | windward |
| 16 | archpalm | Arch palm | 8-18 | krator | windward |
| 17 | frilltree | Frill tree | 70-125 | krator | windward |
| 18 | palmfrill | Palm frill tree | 12-26 | krator | windward (the isle's shores: a palm's trunk, very wide fractal fins) |
| 19 | mangrove | Hyper-mangrove | 18-34 | earth | windward (the isle's lagoon, on prop roots) |
| 20 | coconut | Coconut palm | 12-24 | earth | windward (its fruit is the catalog's `generic_fruit_coconut`: `biomes/FRUIT.md`) |
| 21 | elfin | Elfin tree | 3-9 | earth | windward (the cloud forest; no far impostor: the ground's canopy layer stands in) |
| 22 | veil | Veil tree | 8-16 | native | windward (the cloud forest; its veils glow at night) |

`isle:true` and `cloud:true` mark the species only one station plants (the other stations' probes skip them).

Tags: the project's (`climate`, `aridity`, `abyssal`, `riparian`, `koppen`, `harvest`) plus `origin` (earth: Earth's
descendants; krator: the crater's long-settled flora, the other kits' standbys; native: Krator's own life) and `plume`
(where it lives). `THRONE.PLANTS` tags the floor's plants the same way.

## The glow

`THRONE.setNight(k)` (0 day .. 1 night) raises the emissive of everything that glows: the lamp caps, the lantern
brackets, the mat and its vent cones, the drizzle trumpets' pitchers, the library's glowing cards, the pagoda's molten
bark. The host's `setLightMode('night')` calls it. The ground's glow (the new flow's veins, the glow carpet, the
mycelium) is the host's (84).

## The library

With the pack (`materials.json`, `tex/`; the owner's textures, `core/materials/PLAN.md`, The Throne) the kit takes six
barks (the spice tree's honeycomb, the rope-tree's twisted strands among them), the bone bells' sulphur flesh, the needles and the broom from the library, and places the library's card plants (glowing shelf
fungi, glow mushrooms, glow tufts, snare flowers, sixteen plume fungi, dripping fungi, tendril creepers, lava-leaf,
withered and succulent leaves). `THRONE.LIB.cardsOf(key)` lists what the pack carries; without it (an open world,
`?mat=proc`) the kit is procedural throughout and those plants are simply not placed.

**The maps are sidecars (2026-10-07).** The pages do not carry the pack's maps. Every station loads them from shared
files beside it in `dist/`, through plain `<script src>` tags ahead of its code (`tools/textures/matlib_pack.py`):
- `throne.tex.throne.js` (about 14 MB);
- `throne.tex.hyperjungle.js`, for the kipuka and the spice frontier.

A page is about 0.4 MB of code, and works opened from disk. Publish and copy the sidecars with the pages
(`gallery/build_throne.py` does). Without them a page says so on the console and runs on its procedural maps.
`python3 build.py --inline-packs` builds one self-contained page, as before.

## What the kit exports

```js
THRONE.build({R:2450, quality:1, shallows, understory}) -> {trees, heroes, far, bySpecies, flows, shares, under, fruit, shallows, understory, tris, ...}
THRONE.buildShallows(R,q)    // the isle: kelp 3-15 m down, wrack on the 'wrack' field, hyper-mangroves on the 'mangal' field (off the mask)
THRONE.buildUnderstory(R,q)  // the isle: a second, denser floor of ferns and moss on 'iwood', 'grove', 'beach', near the cameras
THRONE.SPECIES / byKey / PAL / TAGS / KOPPEN / HARVEST / PLANTS / plantOfItem(item) / LIB
THRONE.zones(x,z) / PASSES / make(sp,x,y,z) / grow(T,lv) / nearestTree(sp,x,z,minH) / setNight(k)
THRONE.buildFloor(R,q) / floorWeights(Z) / FLOOR_ZONES / canopyH(x,z) / COUNTS
```

No fauna (the owner's plan: one fauna kit for every biome, `biomes/README.md`).

## Stations

Each station of the Throne is its own showcase page from the same kit (`python3 build.py --station <name>`):
`stations/<name>/` holds the host fragments it replaces and `station.json` (the page's name, extra core files, and other
kits' fragments read in place). Station 2, the kipuka, reads the hyperjungle kit from `biomes/hyperjungle/src` under slots
41 and 48a-48f, so both kits sit on one page; its build plants the Throne first, makes the Throne's big trees obstacles,
then plants the hyperjungle with the 'owned' mask. Station 3, the frontier, adds 'atmos' to station.json (core/atmos files,
the sea's wave field) and reads 'field', 'clear', 'coast', 'edge' (zones and floor planters of the same names); its host
plants the plantation rows itself through THRONE.make/grow with T.planted (a thin, yellowing spice tree with no resin). The kit's zones read 'humid' (the climate: 1 windward, 0 on the
shoulder) to choose the wet or the dry species, and 'owned', 'kedge', 'knear' for the kipuka. Station 4, the geyser isle,
is the Throne kit alone (no hyperjungle: an island's forest is its own, smaller) with `shallows` and `understory`; it
reads 'grove', 'iwood', 'beach', 'mangal', 'wrack', and taps the spice trees its camp stands among after the build
(`ISLE.tap`). Its passes come last in `THRONE.PASSES`: every pass draws from the PRNG in every cell, so a pass added before
the others would reshuffle every other station's trees. Station 5, the cloud forest, is the Throne kit alone with
`understory`; it reads 'cforest' (and 'humid' for the heath in the ridge's lee), and binds the shared atmosphere's weather
(`core/atmos` 0-core, 0p-presets, 3-particles, 4-weather, 9-host): the fog's density and a veil over the sky dome follow it.

## File layout

```
00-head.html                       page shell
45-host-stage.js      (host)       renderer, light, the land before the lava (flank, rift, cones, pit, fissure, gullies), the plume
46-biome-throne-flows.js           the flow model and the mosaic's stages [G data]
47-host-land.js       (host)       the showcase's flows; the pit, the tube's skylights, the hot pools, the fumaroles; fields; BIO.init
50-biome-throne-species.js         palettes, 12 species and 23 floor plants (tagged), textures, geometries, the glow, the library, items
55-biome-throne-trees.js           zones; builders; impostors; PASSES; make/grow
60-biome-throne-floor.js           the floor by zone, stage and plume; the wall brackets; spatter and boulders
70-biome-throne.js                 build / canopyH; BIO.kitEnd
82-host-sky.js        (host)       the dome: the Throne's flank to the NNW, the plume over the east; the giant; day and night
84-host-ground.js     (host)       the ground (painted, and the library's eleven layers); the acid lake and hot pools; the steam
88-host-build.js      (host)       build order and bake
90-host-camera.js     (host)       presets found from the data; the inspector (tags, the flow under a point, the plume)
91-host-probe.js      (host)       window._api: budgets and the host checks with their negatives
93-host-polytool.js   (host)       polygon and path tool (from nhighlands, through the crater drylands)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`.
