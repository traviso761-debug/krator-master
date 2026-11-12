# Krator biome kits — the contract (Opal Valley edition)

`OPAL` is one biome kit on the shared biome core (`core/biome`, read by path through `CORE_BIOME` in `build.py`). Nothing in the
core or a biome fragment (`40`, `50`, `55`, `70`) names a host's engine: `build.py` greps for those and fails the build if one appears.
The pages are five stations, each a 5.2 km ideal type of one zone of the valley (`PLAN.md` section 6).

## What the host provides (`BIO.host`)

As every kit since High Rift (`BIO.init` in `src/45-host-stage.js`): `THREE`, `scene`, `terrainH(x, z)`, `waterH(x, z)` (the water's
level, `-1e9` where dry), `mask(x, z)` (0 in the water and **on the glacier's ice**), `obstacles` (the diggings, the sites), `ticks`,
`seed`, `origin` (the LOD spine), `center`, `fields`, `register`, `err`, `lod`.

The fields the kit reads (`BIO.field(name, x, z)`, all 0..1; the stage's `fieldsAt`):

| field | what |
|---|---|
| `wet` | the water's margins (the lakes' shores, the steps' pools, the streams), the falls' spray; the rest by the station's rain |
| `flow` | a stream's or a riser's banks (Xanadu's builders read it for their riparian species) |
| `upland` | 0 on the treads .. 1 up the walls (Xanadu's zones) |
| `rock` | the steeps: the walls, the risers' faces, the moraines' fronts, the gorge |
| `mist` | the falls' spray (every riser over 8 m; the cataract's most); the canyon's mist on the lower bed |
| `cold` | by height over the station's snow line |
| `ice` | 1 on the glacier's ice: nothing roots there (the mask is 0 too) |
| `slope`, `flat`, `canyon`, `geo` | the slope; the frost's flats (the glacier); the canyon's shade; the seeps' heat share (`KTHERM`, the middle bed) |

## What the kit exports (`OPAL`)

```js
OPAL.build({R:2500, quality:1, station:'middlebed', keep, water, heat, grass, lake}) -> {kin:{trees, <key>:n...}, cushions, ferns, pads, chalices, tussock}
OPAL.buildKin(R, q, o)   // the Xanadu kin (and a station's edge species): each grown by its SOURCE kit's builder (BIO.kin)
OPAL.buildOwn(R, q, o)   // the kit's own plants
OPAL.SITES               // the five stations' records [G data] (40): heights, pressures, climates, the chain of treads, the glacier, the diggings' specs
OPAL.STRATA              // the opal strata recipes, handed to KSTRATA.add by the host ([G data])
OPAL.diggings(site)      // the diggings as records [G data]: {id, kind:'placer'|'sluice'|'adit'|'dive', x, z, grade, gem, resource:{kind:'opal', grade}, spoil, tags}
OPAL.KIN, OPAL.EDGE      // the kin table: {key, from:'xanadu.<key>', name, delta, zone:{station:weight}, ground, tags}; the edge species by station
OPAL.SPECIES, OPAL.PAL, OPAL.HARVEST, OPAL.IRID, OPAL.GROUND, OPAL.KINS, OPAL.SOUND
OPAL.plantOfItem(item)   // the kit's own species of an item name (the inspector's words)
```

**The kin.** `OPAL.KIN` holds seven of Xanadu's species with a delta each (name, colours, the iridescent pair Xanadu's builder picks,
size); `OPAL.buildKin` asks the core for `BIO.kin('xanadu.<key>', delta)` and grows each tree with Xanadu's own `make` and `grow`, in
Xanadu's registry (its buckets, its materials, its iridescent barks). So a page that takes Opal Valley must read Xanadu in place
(`build.py`'s `KIN_ALL`); without it the kin are missing and `OPAL.buildKin` reports them (`missing`), nothing else breaks.

**The iridescence** is the biome core's own two hooks with this kit's tints: `BIO.iridBarkMat` (the `irid` bark kind: the cushions,
the chalices' caps and stalks) and the leaf hook's `irid` option (per-instance `c2`: the prism ferns, the lotus pads). The ground's
opal sheen is the host's ground shader (`84-host-ground.js`), not a material kind.

## Tags

Every species: `climate`, `aridity`, `abyssal`, `riparian`, `koppen`, `zone` (the stations it stands on), `harvest`
(`biomes/FRUIT.md`'s shape). The kin keep their source's tags with the delta's, and `tags.kin` names the source (`xanadu.agatetree`).
The diggings: `class: 'site'`, `kind: 'digging'`, `mining: 'opal'`, `resource: {kind: 'opal', grade}` (`kits/resources`' grade
contract), `harvest: {item: 'rough_opal', efficiency, works: 'mine'}`.

**The walk-in adit** (host, `src/85w-host-adit.js`, the middle and lower beds): the adit record nearest the page's centre gets
`walkIn: true` and is cut as a `KCAVERN` (`window._adit`: `{id, len, tris, crystals, cut, ms}`): a `tube` from the portal to a `hall`
(the vug), a `well` opening where it meets the ground as drawn (`GROUND.userData.heightAt`, the page grid's own height), its floors in
`KWALK`. The vug's opal is `KSPELEO.place` records (`mineral: 'opal'`). Two more records in `core/tags`: the adit (`kind: 'digging'`,
`hazard: {kind: 'gas'}`) and the vug, both with the digging's `resource`. `HCHK.adit` (verify) walks the tube and the vug.
