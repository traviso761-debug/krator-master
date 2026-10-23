# sedesert: the Bowl (detailed plan, 2026-10-23)

**The Bowl** is the south-eastern desert's abyssal end: a salt basin under dense air, the hottest ground in the east,
with one great salt lake fed by four rivers that never reach the sea. The owner (2026-10-23): the Bowl is a redraw or
overlay over the south-eastern desert, as it is more abyssal than most; a detailed plan was asked for. It is **station 2
of the sedesert kit** (`PLAN-STATIONS.md`), not a kit of its own: the kit's species, ground and fauna carry over, changed
by the air, the heat and the salt. Its Earth model is **the Dasht-e Lut**: the hottest surface on Earth, its salt lake
basin, its yardangs (*kaluts*) and its dunes.

**Status: plan, awaiting the owner.**

## 0. What it is

| | |
|---|---|
| Page | `dist/sedesert-bowl.html`, `python3 build.py --station bowl` (stations in `stations/bowl/`, as the Throne's) |
| Polygon | the biome polygon `the bowl` (122,000 km², px 641-983 by 712-863); smaller than `sedesert`, so it wins the overlap in the open world (`extract_region.py`) |
| Shares | the kit's species, builders, fauna, ground painter and fields; the strata module (`core/terrain/STRATA-PLAN.md`) on the rim's walls |
| New | the lake and its salt rings, the deltas, the halophytes (section 4), the yardangs and dense-air forms of the kit's trees, the heat shimmer |

## 1. The ground (4.21, surveyed 2026-10-23)

| Band | km² | Air | Rain (p10-p90) | Mean (warm/cold) | Extremes | Climate |
|---|---|---|---|---|---|---|
| Floor, under -1,000 m | 15.7k | 1.83 atm | 235 mm (156-407) | +29 (37/20) | **47 / 10 °C** | BWh 74%, BSh 12%, XW 11% |
| -1,000 to -500 m | 50.3k | 1.79 | 219 (156-517) | +28 (35/20) | 46 / 9 | BWh 78%, BSh 16% |
| -500 to +500 m | 17.3k | 1.61 | 266 (141-1,237) | +24 (33/15) | 44 / 4 | BWh 48%, BSh 34%, Cfa 15% |
| +500 to +1,500 m | 16.5k | 1.42 | 235 | +19 (29/9) | 39 / -3 | BWh 41%, BSh 36%, Cfa 12% |
| The rim, over 1,500 m | 12.4k | 1.24 | 172 | +13 (24/2) | 35 / -11 | BSk, BWk, BSh, BWh |

- **63% is the model's salt-basin zone** (72,000 km² of it dry land).
- **The lake**: one great salt lake, **9,600 km²** (px 762-948 by 783-846, about 370 by 125 km), its surface about -990 m
  over a bed of -1,000 to -1,230 m; three small salt pans of 32-64 km² round it. 4.21 grew and joined the Bowl's old lakes
  into it and painted it in the Bowl's own look (`tools/scale-model/README.md`, `LAKE_STYLE`): **an ochre salt rim** about
  10 km wide inside the shore, **a teal core**, and **a pale salt flat** reaching 16-28 km outside the shore.
- **The rivers**, all endorheic: **The Bowl river** (111 m³/s, in from the east), **The Bowl river 2** (78 m³/s, from the
  south), two streams of 30 and 27 m³/s from the south-east, and **Istrim Bidar** (10 m³/s, from the north-west into its
  own pan). Each makes a **delta** across the salt flat: the only green on the floor.
- **Settlements**: **Mantis** (village, px 831,816) and **Arcbeam** (arcology, px 744,728, 2,133 m, on the north-western
  rim, +12 °C, ~850 mm: above the heat). **Mantis is under water on 4.21**: its point is inside the lake (-1,231 m, a
  water cell; the nearest dry shore is 2 km west, px 830,816, at -1,143 m). See section 8.
- **Neighbours**: the sedesert proper to the west and north (4,700 km² of shared border), the eastern badlands on the
  east, godstep valley and the eastern Inner Wall on the north.

## 2. Air, heat and scale

The floor's 1.8 atm is abyssal air, as the hyperjungle's: plants in it run large and squat, and the light is thick and
hazy. The extremes reach **47 °C**: the hottest ground in the east. Heat shimmer over the flats, mirages over the salt
(the far shore floating), a white-hot sky by noon; a cool, clear dawn. Dust devils on the reg.

## 3. Zones (by distance from the shore, salt and height)

| Zone | Where | Ground | What grows |
|---|---|---|---|
| `lake` | the open water | teal hypersaline water; brine-red shallows where the algae bloom | brine algae; nothing rooted |
| `rim` | 0-10 km inside the shore | the ochre salt rim: iron-stained crust, salt ridges | nothing |
| `flat` | 0-28 km outside the shore | the pale salt flat: polygonal crust (`ground.salt`), efflorescence, salt pans, mud cracks at the edge | nothing on the crust; glasswort carpets in the damp hollows |
| `delta` | where each river crosses the flat | silt fans, braided channels, reed beds | salt reed, tamarisk, wadi palms, the kit's mesquite: green fingers across the white |
| `halo` | the flat's outer edge | saline sand and silt | the halophyte belt: saltbush, saxaul woods, tamarisk, glasswort |
| `reg` | the floor beyond, to -500 m | gravel desert, sand sheets, dune fields, **yardangs** | the kit's Socotran flora in its dense-air forms, sparse; the river lines with gallery trees |
| `slope` | -500 to +1,500 m | the kit's own desert | the kit's flora as on station 1 |
| `rimwall` | over 1,500 m | the strata walls (the `canyon` recipe), cold desert | the kit's mountain agave, puyas, Joshua trees |

## 4. The flora

**The kit's species in their dense-air forms** (a habit variant, `abyssal:true`, as the hyperjungle's scaling by air):
the **dragon tree** squatter, its umbrella wider and flatter; the **bottle tree** swollen to baobab size; the **desert
rose** with a caudex like a boulder; the **giant candelabra** and **cardon** shorter and thicker-armed; the **quiver tree**
and **boojum** rarer (they want the slopes). The **wadi palm** and **mesquite** line the rivers.

**New, for the salt** (Earth models named):

| Key | Name | Model | Zone | Harvest |
|---|---|---|---|---|
| `saxaul` | Saxaul | *Haloxylon* of the Central Asian salt deserts: twisted, nearly leafless small trees in open woods | `halo` | the densest firewood there is; charcoal |
| `saltbush` | Saltbush | *Atriplex*: silver-grey mounded shrubs | `halo` | grazing; the leaves as salty greens |
| `glasswort` | Glasswort | *Salicornia*: jointed succulent carpets, green in spring, **crimson** by autumn | `flat` (hollows), `halo` | **the vegetable** (sea asparagus) and **an oil seed** (as *Salicornia bigelovii*) |
| `tamarisk` | Tamarisk | *Tamarix*: feathery grey-green trees with plumes of flowers; salt crystals on the leaves | `delta`, `halo` | **manna**: the sweet secretion the scale insects leave on its twigs, the Bible's manna (a sweetener); timber |
| `saltreed` | Salt reed | *Phragmites* in brackish water | `delta` | thatch, mats |
| `brinelamp` | Brine lamp (Krator's) | a succulent whose salt glands crust its leaves in crystal, so a stand glitters at low sun | `halo` | **the medicine**: the crystal-crusted leaf, steeped, is a salt-and-bitters remedy for heat sickness |

`kits/crops`: `sedesert` gains `salt` (warmth [4, 5], arid [0, 1], salt, atm 2), `delta` (wet) and `halo` zones; records
for glasswort, tamarisk manna, saxaul (fuel) and brine lamp. **The Bowl's salt** itself is a trade good: Mantis is the
place for `core/hamlet`'s salt village (`KHAMLET.village`, the salt kind).

## 5. Landforms

- **The lake and its rings** (section 3), the shore's beach ridges where the lake stood higher.
- **Yardangs** (the Lut's *kaluts*): long, wind-carved ridges of old lake-bed silt, tens of metres high, aligned with the
  wind, in fields on the floor north and west of the lake. Their soft beds take the strata module's pale `badland`
  recipe. A `core/terrain` relief stamp, oriented by the wind.
- **Dune fields** downwind of the flats, the deltas' silt fans, salt polygons and pressure ridges on the crust.
- **The rim's walls** in the `canyon` recipe, formations stacked up to the Inner Wall.

## 6. Fauna

The kit's six kinds where they fit (the floor is too hot for the deer). Added, for `kits/fauna` later: brine flies in
clouds at the shore, a long-legged wading bird on the brine (feeding on the brine shrimp), salt beetles on the crust.

## 7. Textures

In the library: `ground.salt`, `ground.efflorescence`, `ground.playa.red`, `ground.clay.popcorn`,
`rock.sandstone.bedded.red`, the kit's own sets. To source or generate (prompts into `core/materials/PROMPTS-NEEDED.md`):
the ochre salt rim (a top-down tile), the brine-red shallows (a water tint, not a texture), cards for saxaul, saltbush,
glasswort (green and crimson), tamarisk in flower, brine lamp; a yardang-silt rock tile, or the strata module's recipe.

## 8. Questions for the owner

1. **Mantis is under the lake.** Move its point 2 km west onto the shore (px 830,816, -1,143 m),
   or keep it where it is as a **stilt village** standing in the shallows, salt-workers over the brine?
2. **The brine colour**: the shallows red-pink with algae (as Lake Hillier and the Lut's pans), or kept to the 4.21
   look's teal and ochre?

## 9. Order of work

- **B0.** The owner answers section 8; the site chosen (proposed: the south shore at the Bowl river 2's delta, about px
  866,826 (-1,082 m, 4 km from the water), showing the delta, the salt flat, the lake and the far rim; Mantis on the shore beside it); texture prompts.
- **B1.** The station's ground: the lake, the rim, the salt flat, the delta from the river's record, the halo.
- **B2.** The halophytes and the dense-air forms of the kit's trees.
- **B3.** Yardangs and dunes; the heat shimmer and mirages; the light.
- **B4.** Mantis (the salt village, by `core/hamlet` if the owner keeps it a village), the crops wiring.
- **B5.** `verify.py --assert` for the station, `PORT.md`, the gallery (a fix to one kit republishes only its files).
