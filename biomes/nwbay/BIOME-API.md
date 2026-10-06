# Krator biome kits — the contract (north-west bay edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core is the southwest bay kit's core, **byte-identical** (which is the eastern abyss
kit's core: origin lists, climate fields, `BIO.grid` boxes / `noMask`). A world that has
already vendored the swbay or eastabyss core (Iziz, the Ancients kit) needs no second copy;
a swbay, eastabyss or hyperjungle fragment runs on it as is.

This kit is the biome of **Ys** (`settlements/ys/DESIGN.md` §8): a fork of the southwest
bay re-keyed for a Krabi-like karst coast with an igneous shore, a river in travertine
terraces and a semi-aquatic fringe.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space. Water is wherever it is < 0.
                                //   ON A KARST STACK it returns the top of the stack (the forest roots there)
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, footprints, cliff faces)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside (buildings; NOT the stacks)
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind and the fauna
  seed:     11,
  origin:   [[x,z],...],        // LOD spine (or one [x,z])
  center:   [x,z],              // the grids' disc
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   0 dry (lava, crust, the upper slopes) .. 1 the jungle floor round the bay
    salt:   (x,z)=>0..1,        //   1 at the waterline, 0 by ~250 m inland; spray on the headlands
    upland: (x,z)=>0..1,        //   0 the shore .. 1 the top of the slope toward the Inner Wall
    flow:   (x,z)=>0..1,        //   0 still / dry .. 1 a river bank
    karst:  (x,z)=>0..1,        //   1 on a stack's top, 0 off the rock; .03..9 is the cliff face (the rim band)
    tsingy: (x,z)=>0..1,        //   the tsingy massif (knife-edged limestone): 1 in its heart, 0 off it (optional)
    hollow: (x,z)=>0..1 },      //   1 on a sinkhole's floor (a tiankeng, a cenote's dry bed), 0 elsewhere (optional)
  eye:      ()=>[x,y,z],        // optional: where the viewer is; the fauna leaves what is far alone
  err, stat });
```

**The karst contract.** `karst` is a mask on the rock, not a height: 1 inside a stack's
footprint (by ~5 m), 0 outside (by ~6 m), and the thin band between is the face. The
biome reads it three ways: the stack TOPS (`karst > .95`) carry the cliff figs, tree
ferns, fan-crowns and the karst floor; the cliff figs find the rim by marching the field
outward (`NWBAY.karstEdge(x,z)` → distance, direction, the ground level at the foot of
the face, which is the waterline when the stack stands in the sea) and hang their root
curtains down the face to it; and the host's `mask` must be **zero on the rim band and the
faces** (the probe's `nothing-on-a-cliff-face` invariant checks that no tree roots where
`karst` is between .03 and .9). The faces themselves are the host's geometry: hand them to
`NWBAY.dress(geos, {karst:true, ...})` and the biome grows the hanging gardens, root
curtains, lianas, ferns and curtain figs on them (88-host-build shows the counts).

**The tsingy and the dolines.** `tsingy` says where the knife-edged limestone stands; the blades
themselves are the host's geometry (fins, instanced), and the host's `mask` must be **zero inside
a blade's footprint**, so a pass there plants only the fissures and the canyons between them (the
probe's `nothing-in-a-blade`). `hollow` is a sinkhole's floor: the biome grows a rainforest there
whatever the upland says (traveller's fans, tree ferns, fan-crowns, the odd ironbark), and the
`mask` must be zero on the wall band (`nothing-on-a-sinkhole-wall`). A world without either field
reads 0 and gets the bay as before. The walls go to `NWBAY.dress(geos,{karst:true})` like a
stack's faces (they face the axis, so their front is the inside).

How the biome zones itself from the fields (55-trees, `NWBAY.zones`):

| zone   | reads                                                   | flora                                                                 |
|--------|---------------------------------------------------------|-----------------------------------------------------------------------|
| hyper  | upland<.30, wet>.55, on land, off the rock              | prism gums and ironbarks (to the ceiling), fan-crowns, baobabs at the edge, tree ferns, splay shrubs; ferns, mushroom troops, moss, logs |
| rain   | upland .08..64, wet>.35                                 | fan-crowns, ironbarks, baobabs, tree ferns, splay shrubs; ferns, fewer mushrooms |
| ridge  | upland>.42 (not on a floor; thinned in the tsingy)       | baobabs in stands, dragon trees, umbrella thorns; dry grass, rosettes, puffballs, boulders |
| low    | upland<.36, wet .2..78, salt<.45, on land               | FLAME-CROWNS (the farm, lowland and street tree), baobabs, umbrella thorns; grass, shrubs, blooms |
| shore  | terrainH<2.4, upland<.14, wet>.5, off the rock          | pandans, splay shrubs, flame-crowns; reeds in the bay's colour, sedge, sea-grape, salt scrub, driftwood |
| tidal  | salt>.3, wet>.45, terrainH -2.2..1.4                    | MANGROVES in the shallows (past the host mask), pandans, pipe reeds, mat-reed beds; pneumatophores, salt scrub, sea-grape |
| cinder | wet<.5 & salt>.08 (the lava), or upland .1..3 & salt>.25 (the headlands) | CINDER PINES, dragon trees; black lava boulders, cinder scrub, dry grass |
| top    | karst>.95                                               | CLIFF FIGS (at the rim), tree ferns, fan-crowns, splay shrubs; ferns, moss, rosettes, limestone boulders |
| bank   | flow>.45, upland<.35, on land                           | lotus trumpets, flame-crowns, pipe reeds; ferns, giant ferns, lotus flowers, reeds |
| water  | terrainH<0, flow .08..95 (the river's fresh water)      | lily pads and lotus flowers on the lagoons and the lowland reach; mat-reed beds on the still margins |
| tsingy | tsingy>.15, on land, not on a floor                     | SPINEWANDS, ROCK BOTTLES, avenue baobabs at the edge; succulent rosettes, wiry grass, limestone rubble, the odd bloom |
| hollow | hollow>.2 (a sinkhole's floor)                          | TRAVELLER'S FANS, tree ferns, fan-crowns, splay shrubs, the odd ironbark; the rainforest floor |

A `semiarid`-tagged species reads the ridge and cinder weights; a `humid` one never does.
The river's banks and the delta are lush because `wet` and `flow` are both high there.

## The species

| # | key | name | height (m) | where | source |
|---|-----|------|-----------|-------|--------|
| 0 | `prismgum` | Prism gum | 84–110 (× ceiling/110) | bay jungle: the emergent | swbay |
| 1 | `baobab` | Gate baobab | 46–76 (×) | jungle edge, lowland, ridge stands | swbay |
| 2 | `fancrown` | Fan-crown | 36–66 (×) | bay jungle, rainforest, karst tops | swbay |
| 3 | `ironbark` | Ironbark | 70–102 (×) | bay jungle, rainforest (stands with the gums) | swbay |
| 4 | `treefern` | Crown fern | 10–26 | rainforest, river, karst tops | swbay |
| 5 | `splay` | Splay shrub | 2.5–7 | understorey, shore, karst tops | swbay |
| 6 | `dragon` | Dragon tree | 7–18 | ridge, headlands | swbay |
| 7 | `thorn` | Umbrella thorn | 6–15 | ridge, lowland | swbay |
| 8 | `clifffig` | **Cliff fig** | 30–55 | the karst stacks, at the rim: crown over the edge, root curtains to the waterline, plate buttresses | **new** |
| 9 | `flamecrown` | **Flame-crown** | 15–28 | lowland terraces, the valley, the jungle edge, the banks: flat umbrella, fern leaves, scarlet patches | **new** |
| 10 | `cinderpine` | **Cinder pine** | 10–25 | lava fields, headlands: wind-sheared, black-barked, leaning inland | **new** |
| 11 | `mangrove` | Lantern mangrove | 9–16 | tidal shallows (−1.7..+.6 m) and lagoons | swlowlands (recoloured) |
| 12 | `pandan` | Stilt pandan | 4–10 | shore, tidal rim | new (screwpine) |
| 13 | `lotustrumpet` | Lotus trumpet | 11–20 | the banks of the travertine reach and the delta | xanadu |
| 14 | `pipereed` | Pipe reed | 9–22 | river banks, lagoon margins, in beds | eastabyss |
| 15 | `matreed` | Mat reed | 2.8–5.2 | still shallow water, in pure beds (`NWBAY.REEDBEDS`) | eastabyss |
| 16 | `spinewand` | **Spinewand** | 8–16 | the tsingy, the dry slope: grey-green spiny wands from one foot, tiny leaves pressed along them, cream tufts (Alluaudia, Didierea) | **new** (Madagascar) |
| 17 | `rockbottle` | **Rock bottle** | 2.5–7 | the tsingy's cracks, the lava, the dry slope: a swollen silver bottle, stubby arms, strap rosettes, yellow flowers (Pachypodium) | **new** (Madagascar) |
| 18 | `avenuebaobab` | **Avenue baobab** | 24–38 | the lowland in stands, the dry slope, the tsingy's edge: a smooth red-grey column, a flat crown of short boughs (A. grandidieri) | **new** (Madagascar) |
| 19 | `travellerfan` | **Traveller's fan** | 8–18 | the dolines' floors, the rainforest, the banks: a ringed stem, one flat fan of long-stalked paddles, blue arils (Ravenala) | **new** (Madagascar) |

**The height ceiling.** Eastern-abyss sized, nothing Girder-sized: canopy trees 40–80 m,
emergents to ~110 m. The probe's `height-ceiling` invariant fails if any tree exceeds
`NWBAY.TEMPLE_H`.

## The two knobs

- `NWBAY_TEMPLE_H` (host, before fragment 50; default 110 m): the canopy ceiling. The
  heights of the four megaflora species scale with it; the prism gum's top band IS it.
- `NWBAY_BAY={hue}` (host, before fragment 50; or `NWBAY.setBay(hue)` / `NWBAY.build({bayHue})`):
  the water (host side, `WATER_*`), the shore reeds' accent, the mosses' tinge and the
  mangrove's blue-green derive from it (.47, turquoise, here). The epiphytes stay red and purple (canon).

## What the biome exports

```js
NWBAY.build({R:2400, quality:1, bayHue:.47, fauna:true}) -> {trees, heroes, far, bySpecies, figsOnEdge, beds, stems, under, fauna, tris}
NWBAY.dress(geometries, opt)     // growth on a structure; opt.karst:true for a cliff face (root curtains, lianas, curtain figs, ferns)
NWBAY.canopyH(x,z)               // approximate canopy top
NWBAY.SPECIES                    // the 20 species (tagged; `zone` and `source` say where and whence), NWBAY.PAL the palettes
NWBAY.make(sp,x,y,z,{wet})       // one tree's record, its foot on ground y (reseed first for a repeatable variant)
NWBAY.grow(T,lv)                 // build that one tree alone into the kit's stores: lv 0 the impostor, 1/2 the hero
NWBAY.VARIANTS, NWBAY.PROTOS     // 6; after build, the grown prototypes by 'sp|variant|level' (see "Trees as variants")
NWBAY.zones(x,z)                 // the zone weights a world can reuse for its own placement
NWBAY.karstEdge(x,z)             // {d, out:[x,z], footY} for a point on a stack top, or null
NWBAY.REEDBEDS                   // after build: the mat-reed beds [{x,z,r,n,depth,h}] -- a resource a world can harvest
NWBAY.TREES                      // after build: every placed tree {x,z,y0,sp,H,crownR,lv,variant,...} (the figs carry out/edgeD/footY)
NWBAY.FAUNA.species              // the 4 animal kinds (tagged, + diet); .pods the swimmers' loops
```

Then `BIO.bake()` once. Draw calls: one per instanced item + one per merged family (~55),
one per variant part (~140: the bark of each hero variant is an instanced item), three for the
fauna, plus the host's far country, stacks, tsingy fins, sinkholes, crust and plume (~210 in all).

## Trees as variants

The tree pass places every tree (where, which species, how tall, its wet, its LOD level) and then
hands the list to `NWBAY.plantTrees` (56-variants): the impostors (lv 0) are built one by one as
before, but no hero is built where it stands. For each species the kit grows **six variants**
once, alone at the origin on a flat neutral stage, at each level it draws (2 and 1), spread over
the species' height band and over the wet quantiles of where the pass put it; what each grow
wrote is captured out of the stores (its bark buckets become one instanced item per material,
its leaves and blooms a list of instances). Each placed tree is then a variant, turned, scaled to
its height (within 15 % of the variant's, never past the species' band) and set on its foot: one
bark instance per part, its items re-put through the tree's transform. A cliff fig is turned so
its crown leans out over its rim and a cinder pine so its lee runs down the salt gradient; a
fig's ROOT CURTAINS are the one per-site part (the variant keeps where they hang from; each
placed fig drops its own to its own stack's waterline). Mangroves keep the water level.
An open world grows the same variants with `NWBAY.make` / `NWBAY.grow` (the hyperjungle's
contract) and instances them itself.

The fauna needs `ticks` and `scene` at build time (it adds its own meshes and updates them
every frame); a host without `ticks` gets frozen animals, one without `eye` animates
everything whatever the range.

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
A plant is never part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ origin list, fields), stats   (byte-identical to swbay's)
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets               (byte-identical)
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook, wind                  (byte-identical)
40-core-place.js    stands, jittered grids (+ box, noMask), keep-clear, face sampling       (byte-identical)
50-biome-nwbay-species.js   palettes, the ceiling, 20 species, textures (leaves, 8 bark kinds incl. the strangler lattice and the cinder pine's cracked plates), geometries, materials, items (data only)
55-biome-nwbay-trees.js     zones from the fields; one builder per species; the karst edge; epiphytes and lianas; the reed beds; impostors
56-biome-nwbay-variants.js  trees as variants: NWBAY.make / grow, the nursery (grow alone, capture), plantTrees (stamp each hero)
60-biome-nwbay-floor.js     the floor by zone; the tidal mud; lily pads on still water; logs
65-biome-nwbay-dress.js     growth on structures (soffits, ledges, walls); the cliff treatment (opt.karst)
70-biome-nwbay.js           NWBAY.build / dress / canopyH
75-biome-nwbay-fauna.js     soarers, darters, swimmers, glints: animated InstancedMeshes / Points ticked by the biome
45-host-stage.js (ideal type only): renderer, the bay-and-slope terrain, the karst stacks (meshes + terrainH + karst field),
                                    the tsingy massif (fins in rows along the joints, canyons, tsingy field, the blades in the mask),
                                    the sinkholes (a tiankeng and two cenotes: walls, floors, lips, pools; groundH, hollow field),
                                    the seven fields, the water plane + the terraced river + rimstone lips + shelf pools + foam,
                                    the painted ground (travertine, lava, black sand, basalt), the basalt columns, BIO.init,
                                    the far country (the volcano SE, the Inner Wall N and W, the outer water, the plume)
80+ host (ideal type only): sky (dome + gas giant), one Girder tower and a ruined jetty (both dressed), build order
                            (the stacks dressed with karst:true), camera + inspector, probe (+ the biome's own invariants)
```

## To bind it in Ys

Copy 10–70 (and 75 for the fauna), write `BIO.init({...})` after the terrain exists and
before fragment 50 loads (fragment number is load-bearing), and provide:

1. `terrainH` that returns the stack tops inside the karst footprints (the city's caves
   and stair-houses sit in the faces; the forest sits on top).
2. the five fields (and `tsingy` / `hollow` if the city has blades or dolines); `karst(x,z)` 1 on the tops, 0 off the rock, the thin band between is
   the face. Ys's `wet` should be low on the lava and the basalt and on the city's paving;
   `salt` 1 at the tideline (the drowned grid is all tidal), `flow` on the river and the
   canals, `upland` rising toward the Inner Wall.
3. a `mask` that is 0 under water, on the cliff faces, in the river's channel, inside
   building footprints and on the streets (the Ancients bind, `kits/ancients/src/75-biome-45-bind.js`,
   shows the clearing list pattern);
4. `obstacles` for the buildings (so no bough enters a tower), **not** for the stacks;
5. the stack faces as `BufferGeometry[]` to `NWBAY.dress(geos,{karst:true,...})`, and the
   building shells to `NWBAY.dress(geos,{...})`;
6. `NWBAY_TEMPLE_H` (110 stands) and `NWBAY_BAY.hue` before fragment 50; `ticks`; `eye`.

Then `NWBAY.build({R, quality})`, the dress calls, `BIO.bake()`. The flame-crown is the street
tree: a world places them itself with `NWBAY.BUILDERS[9](T,st,2)` after filling a `T` record
(`{x,z,y0,sp:9,H,rb,crownR,seed,wet}`) if it wants them on a grid rather than by zone.
Read KNOWN_ISSUES.md first.
