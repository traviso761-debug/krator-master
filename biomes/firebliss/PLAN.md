# The Firebliss Range: the plan (seed, 2026-11-09)

The Firebliss Range (`rmw8hj62nmugn`) is a volcanic arc on the Labyrinth's northern rim, in the far south-west of map 5.1.
Along its spine stand five volcanoes; under it lie four warm valleys, each with its own tarn. Nobody lives there. Fellgang
hunters and Kimr hunters from the Labyrinth come and go by season. Its dangers are the land itself: gas, heat, ash, ice and
thin air. A player who reaches one of its oases has found a good place for an outpost (section 6).

This is a seed from the owner's brief (2026-11-09) and the map. Nothing is built; it is a kit for the rebuild's queue, after
the frozen integration pass, and a neighbour of `biomes/labyrinth/PLAN.md`.

## 1. What the map carves (Gemini, map 5.1)

The carving is `tools/scale-model/build_425_master.py` section 9E; the region is in `smodel/nw_expansion.py` (no note yet).
The numbers were read from the model (`smodel.page`, 2026-11-09, at `gemini/scale-model-5.1-r3`).

- **Size:** 28,006 height cells of 2 km, about 112,000 km², between 5.1 px x 38-320 and y 1237-1403.
- **The arc:** a glaciovolcanic cordillera runs WNW to ESE along the Labyrinth's upwind northern border. Its spine falls from
  about 5,250 m in the west to 3,950 m in the east. The map's western edge is the airless barrier (x under 62, over 8.8 km,
  class O).
- **Heights:** p5/p25/p50/p75/p95 = 2,927 / 4,373 / 4,722 / 5,126 / 6,061 m. Most of the range (22,927 cells, 82%) lies
  between 3,500 and 5,500 m: high, cold ground. Only 833 cells, 3%, are under 2,500 m, and those are the valleys.
- **The five volcanoes** (`model/data/vents.json`, all stratovolcanoes). Each crater is breached to the south-east (130-140°),
  toward the Labyrinth:

  | Volcano | 5.1 px | Peak | Crater floor |
  |---|---|---|---|
  | Mount Pyre | 104,1304 | 6,650 m | 5,820 m |
  | Cinder-Crown | 148,1292 | 5,940 m | 5,320 m |
  | **Firebliss Mons** | 206,1284 | 6,380 m | 5,480 m |
  | Brimstone Spire | 254,1288 | 5,780 m | 5,180 m |
  | Copper-Fissure Vent | 298,1286 | 5,360 m | 4,680 m |

- **The four valleys** (the oases): each is a sheltered geothermal basin under the spine. Each holds a warm tarn (class WH)
  in a crater moat or ribbon, with sinter steps round its shore. The valley floors are temperate (Cfa, Cfb, Csb), an island
  of warmth in ice and ash.

  | Valley | 5.1 px | Tarn | Walls within 8 km | Outflow |
  |---|---|---|---|---|
  | West Bliss Cauldron | 126,1344 | 2,639 m | to 4,016 m | **Yan Warra** (`r_fb_west`), into the Labyrinth's northern branch |
  | **Great Firebliss Vale** | 184,1318 | 2,279 m | to 3,502 m | **Tlahn Warra** (`r_fb_central`), on through Solfatara Glen to the Labyrinth's graben lake at 1,979 m |
  | Solfatara Glen | 238,1322 | 2,119 m | to 2,407 m | Tlahn Warra |
  | East Bliss Vale | 284,1318 | 1,960 m | to 2,558 m | **Weyt Warra** (`r_fb_east`), into the Labyrinth's lake at 1,720 m |

  The rivers are named in the Tungang tongue (`river-names-5.1.md`): Yan, "first"; Tlahn, "iron-clan"; Weyt, "white-water";
  and Warra, "river". Their gorges are the only easy ways in from the Labyrinth.
- **The plume:** the five vents breathe a persistent plume to the south-east (about 135°). It carries water vapour, sulphate
  and dark basaltic-andesite ash over the Labyrinth, and adds 180-360 mm a year to its rain. The range makes its neighbour
  green.
- **Neighbours:** the Labyrinth to the south; Copper Glacier to the north-east, past the Copper-Fissure Vent; the fells and the
  Fellgangs to the north and east.

## 2. Air and climate

- **Air:** at Copper Glacier's figures (1.19 atm at 2,380 m, 0.71 atm at 6,500 m), the valleys are at about 1.15-1.2 atm,
  the range's median ground (4.7 km) at about 0.9 atm, and the summits at 0.7-0.75 atm. Thin air is a hazard over the
  valleys' rims (`KHAZ.provide('pressure')`).
- **Climate:** the valleys are temperate, the arc is tundra and ice (ET, EF, HF, HT), and the summits are ice. Read each
  station's mean temperature and rain from the model's `tm` and `p` fields when the kit starts, as Copper Glacier's plan did.
  The plume shades the range's south-east side and drops ash on its snow.

## 3. Who comes here

- **Nobody lives here.** No settlement or polity polygon lies in the range, and the plan keeps it that way: it is a frontier.
- **Fellgang hunters** come over the fells from the north and east. The Fellgangs descend in part from the Tungangs who fled
  the tunnel wars up onto the fells (`LORE.md`, "The tunnel wars"). That is why the range's rivers carry Tungang names.
- **Kimr hunters** come up the Warras' gorges from the Labyrinth, following the megafauna that stray up in summer (the
  Labyrinth's natives: `biomes/labyrinth/PLAN.md` section 5).
- **What they leave** (drawn by the kit, all temporary):
  - hunting camps in the valleys: hide shelters, drying racks, hearths, cached gear (`core/camp`, `KCAMP`);
  - cairns and marked trails along the gorges;
  - butchery sites;
  - each people's own marks: Kimr Aurochs-horn markers, Fellgang stone signs.

  Two peoples share the same hunting grounds and avoid each other, so a camp may be abandoned, raided or contested.
- **What they hunt and gather:**
  - megafauna that stray up from the Labyrinth (mammoth, woolly rhino, giant elk; `biomes/labyrinth/PLAN.md` section 4);
  - the range's own animals (section 4);
  - sulphur, obsidian and pumice;
  - the valleys' hot-spring minerals.

## 4. Life

The valleys are lush pockets in a bleak arc. Most of their life is Krator's native kind, read in place from the kits that
already have it, with the Labyrinth's Earth stock straying in along the rivers.

| Zone | Life | From |
|---|---|---|
| **Valley floors** (to ~2,700 m) | warm meadow and fern, conifer groves in the lee of the walls, reeds round the tarns | the geyser kit's and the swbay kit's species; the Labyrinth's parkland trees along the Warras |
| **Tarn shores and sinter** | thermophile mats in bands of colour by temperature (white, yellow, orange, green, brown), sinter steps, hot-spring grasses | the geyser kit (`biomes/geyser`) |
| **Fumaroles** (Solfatara Glen) | sulphur crusts, acid-tolerant mosses, almost nothing else | the Throne's vent flora |
| **The ash slopes** (2,700-4,500 m) | sparse cushions, ash-desert plants, lichen on the lava | the Throne's ash-desert flora; Copper Glacier's cushions |
| **The ice** (over ~4,500 m) | snow algae, ice worms, frost coral at the moraines | Copper Glacier (`biomes/copperglacier`) |
| **Fumarolic ice caves** (the summit craters) | the cold lineage's mats and glow, round warm vents under the ice | the Throne's glacier station |

**Animals:**
- the Labyrinth's strays in summer, in the valleys and the gorges;
- the range's own: mountain goats and ibex on the cliffs, marmots, raptors riding the valleys' thermals, and the native
  glowing ice worms on the high ice.

The fauna kit owns them all.

## 5. The hazards (environmental)

The range's dangers come from the ground and the air, not from enemies. Each maps to a `KHAZ` kind (`core/hazard/README.md`:
heat, cold, gas, acid, poison, fall, pit, drown, sink, slip, crush, lava...) or to a weather provider.

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Gas pooling** (CO₂ and H₂S settling into hollows on still nights) | the valley floors, the craters, the caves: the warm valleys' trap | `gas`, strongest at night and in still air (an amendment: section 8) |
| **Scalding water and hot ground** | the tarns' hot margins, the springs, the geysers, Solfatara Glen | `heat` |
| **Sinter crust over boiling water** | the sinter terraces and the springs' aprons | `sink`, a crust that breaks underfoot (an amendment: section 8) |
| **Acid** | crater lakes, fumarole fields, rain under the plume | `acid`; `KHAZ.provide('rain')` and `'ph'` |
| **Ashfall and whiteout** | the plume's track (the south-east side), any time the vents puff | weather: the plume as fog and ash fall; `slip` on ash over ice |
| **Lahars and outburst floods** (glaciovolcanic: meltwater released under the ice) | the Warras' gorges | `drown` and `crush`, timed: a flood that runs the gorge (an amendment: section 8) |
| **Phreatic blasts** | geysers and steaming ground | `heat` and `crush`, timed |
| **Crevasses and cliffs** | the ice and the gorge walls | `fall` |
| **Cold and thin air** | everywhere over the valleys | `KHAZ.provide('temperature')`, `'pressure'` |
| **Lava** | the Copper-Fissure Vent's active fissure only | `lava` (`KHAZ.GROUND.lavaFlow`) |

The kit should make the hazards readable before they are deadly. Every one has a sign:
- dead birds and bare ground for gas;
- colour for heat;
- a hollow sound and steam at the crust;
- grey sky for ash;
- a rising roar for a flood.

## 6. The oases as outposts

If the player can reach one of the valleys, it is a good place for an outpost:
- it has water and warmth;
- it has ground to grow on;
- it is a resource next to sulphur, obsidian and the hunt;
- it is safe from everything but the range itself.

Each valley is a different bargain:

| Valley | For it | Against it |
|---|---|---|
| **East Bliss Vale** (1,960 m) | the lowest and warmest; nearest the Labyrinth (Weyt Warra) and the Copper Glacier pass; the hunters' usual way in, so trade | the most visited, so camps and quarrels; a lahar route |
| **Great Firebliss Vale** (2,279 m) | the largest valley and tarn; the best ground to grow on; sheltered | gas pools on its floor on still nights; the Tlahn Warra's floods |
| **Solfatara Glen** (2,119 m) | the sulphur, the range's richest resource | acid, fumes and hot ground: a works, not a home |
| **West Bliss Cauldron** (2,639 m) | the most hidden and defensible: a crater moat under Mount Pyre | the highest, coldest and most remote; a crater, so the worst gas trap |

**No spot is picked for the player** (the owner, 2026-11-09): the player sets up where they like. What the world needs is an
**outpost registry**: "outpost" is the owner's shorthand for any **player settlement**, from a camp to a town. NPC outposts
stay conceptually and mechanically distinct: they are the world's settlements and camps (`core/hamlet`, `core/camp`), not
registry records. The registry belongs to the open world, not to this kit; it is being built as core work (the owner,
2026-11-09). This kit only
supplies its candidates: the oases' benches (water, warmth, gas and flood safety) as hints the registry may read, and nothing
drawn on the ground for them.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less 272, 330). Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **Great Firebliss Vale** | 184,1318 | the tarn at 2,279 m; walls to 3.5 km | the oasis: the warm tarn and its sinter, meadow and groves under the ash slopes, a Fellgang camp; gas in the hollows at night |
| 2 **Solfatara Glen** | 238,1322 | the tarn at 2,119 m in a shallow glen | the fumarole field: sulphur chimneys, acid pools, mud pots, sulphur gatherers' tracks; the Tlahn Warra through it |
| 3 **East Bliss Vale** | 284,1318 | the tarn at 1,960 m | the way in: the Weyt Warra's gorge up from the Labyrinth, a Kimr camp, strays from the Labyrinth at the water, the lahar marks in the gorge |
| 4 **Firebliss Mons** | 206,1284 | the crater floor at 5,480 m, the rim at 6,380 m | fire and ice: the glaciated cone, the steaming crater breached south-east, fumarolic ice caves, the plume overhead, thin air |

Station 1 comes first: it holds the oasis, the hazards and the hunters all at once. A fifth station could be West Bliss
Cauldron, or the Copper-Fissure Vent's lava, if the owner wants either.

## 8. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| volcanoes | `KRELIEF.volcano`, `KRELIEF.range` (38) | the cones, the breached craters, the spine |
| the valleys | `KRELIEF` landforms (`38c`: `maar`, `stepcut`, `terraces`), `KRELIEF.waters` | the moats, benches and the sinter steps' ground |
| lava and tuff | `KLAVA`, `KSTRATA` recipes (tibasalt, tuff) | the flows on the slopes, the walls' bedded ash |
| glacier and frost | `KGLACIER` (44g), `KFROST` (42) | the summit ice and its caves, patterned ground on the slopes |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | the ash, the sinter, the mats as documented masks, relief on every station; the far cones, and the plume as far sprites (`KFAR.sprites`) |
| water | `core/water` (`WATER.open`, `flow`, `spring`, `geyser`, `terraces`) | the warm tarns, the Warras, the springs, the sinter terraces |
| flora | `core/biome` | the native species read in place from the geyser, swbay, Throne and Copper Glacier kits; the Labyrinth's trees along the rivers |
| sky, weather | `core/atmos` | the standard sky; the plume's fog and ash fall; the dust season's machinery (`fx/89-atmos-fx-dustseason.js`) for ash |
| hazards | `core/hazard` (`KHAZ`) | section 5 |
| camps | `core/camp` (`KCAMP`) | the hunters' temporary camps |
| fauna | `kits/fauna` | strays and the range's own animals, as `BIO.record` records |
| resources | `kits/resources` (`KRES`) | sulphur, obsidian, copper at the Copper-Fissure; read the geology when the kit starts |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no: nobody lives here. Outposts go in the open world's registry (section 6) |

**Core amendments the range needs** (no new module; most are shared with the region plans reviewed 2026-11-09):
1. **Geothermal surfaces:** mud pots, the fumarole kind with steam and runoff, sinter and mat decals. Already owed in
   core/water's README, and wanted by godshearth, twins, greatchasm and seouterwall.
2. **Hazard kinds:**
   - a crust that breaks underfoot (twins and opalvalley want it too);
   - gas that pools at night and in still air (a timed `gas`, with the cold-air pool the region plans want);
   - a flood that runs a gorge on a cycle (lahar or outburst).
3. **A volcanic plume:** fog, ash fall and its shade along an azimuth from the vents, as a weather source in `core/atmos`. It
   would serve the Godthrone and the Throne's vents as well.
4. **The outpost registry** (open world, not this kit): every outpost as a record, with this kit's oases offered as candidate
   sites (section 6).

## 9. For the owner

- **An old outpost?** Should one valley hold a ruined hunters' lodge a player could take over, registered as an abandoned
  outpost?
- **The volcanoes' activity:** which vents are live (steaming, puffing ash, lava) and which are quiet? The plan takes all
  five as degassing and only the Copper-Fissure Vent as flowing.
- **The two peoples:** do the Fellgangs and the Kimr have a truce here, a border, or a feud?
- **Names:** the valleys and volcanoes keep Gemini's English names. Do they want Tungang or Kimr names too?
- **Order:** after the Labyrinth, since station 3 and its strays lean on the Labyrinth's fauna. The four core amendments can
  go first: the open world and the other region kits want them too.

## Sources

- the owner's brief, 2026-11-09;
- `tools/scale-model/build_425_master.py` section 9E (the arc, the volcanoes, the valleys, the rivers, the plume);
- `smodel/nw_expansion.py` (the region);
- `model/data/vents.json`, `rivers.json`;
- `river-names-5.1.md` (Yan, Tlahn and Weyt Warra);
- the model's data at 260b90d44, read with `smodel.page`;
- `LORE.md` (the tunnel wars, the Fellgangs);
- `core/hazard/README.md`;
- `biomes/labyrinth/PLAN.md`;
- `biomes/copperglacier/PLAN.md`.
