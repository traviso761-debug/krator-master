# riftrim: the plan (draft, 2026-10-23)

**The rift rim**: the high country round the Rift, south of the crater across the Outer Wall. Wild and untamed: the
walls of the Rift's trough and the highland at its western head, a staircase of lakes from a great lake in a sheltered basin at
~300 m to tarns at 5.8 km, forest, tundra and ice. **Its flora is as strange as the Rift's, but temperate**: the Rift's own forms
(frills, bells, lobes, the teal-and-violet palette) carried up into the cold.

Owner's brief (2026-10-23): the region is wild and untamed; too high for the Lizardmen to venture comfortably, and too
far, with too many Lizardmen in the way, for Xanadu to exert an influence. In practice **the only real power is Dalab**,
whose genepriests can mod for cold and altitude, letting its people cross the Outer Wall by a road built partly through
**Ancient underground tunnels**. Dalab has occupied an abandoned arcology (the name and theme are placeholders) and
studies the flora and fauna for useful genes, but **its hold is tenuous**, given the distance and the difficulty of the
road. Natives are undecided: not Lizardmen, perhaps not standard humans. Earlier (2026-10-23): the rim splits N, S and
W, and **the highland lakes are the most interesting feature**.

It is also the kit the Rift kit's own notes ask for: "The highland is a sketch… It is meant to become its own kit (the
highlands) on the same fields" (`biomes/rift/NOTES.md`).

**Status: plan, awaiting the owner.**

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/riftrim/` (the usual kit layout, with `stations/`) |
| Polygons | `rift rim` (the N and S rims, split by the Rift's axis) and `w rift highland` (the western head, which supersedes the rim there): 267,000 km² together |
| Pages | five stations (section 9) |
| Core | the biome core, `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, the strata module's `canyon` recipe on the trough's walls), `core/water`, the shared sky |
| Read in place | `biomes/rift`: its cloud forest, Mediterranean crest and highland species (the groundsel, the peak pine, the barrel frill, the fan tree, the Rift stone pine, the beard tree); nothing copied. The Rift kit's own highland can then read this kit back |
| Object | `RRIM` on the `BIOME-API.md` contract |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (4.21, surveyed 2026-10-23)

| Part | km² | 3-4.5 km | 4.5-6 km | Over 6 km | Rain | Lakes |
|---|---|---|---|---|---|---|
| **W highland** (`w rift highland`) | 121k | 37k: Dsb 55%, Dsc 44%, ~850 mm, mean +3 (16/-10), ~1.0 atm | 37k: ET 83%, ~560 mm, -6 | 34k: EF 64%, ET, ~300 mm, -14 | the wettest | the great deep lake; two tarns over 5.5 km |
| **N rim** | 43k | 18k: Dsc 86%, ~740 mm, 0 (13/-13) | 18k: ET 87%, ~440 mm, -7 | 3k: EF, ET | middle | five lakes, 1.9-3.4 km |
| **S rim** | 103k | 31k: Dsc 81%, ~570 mm, 0 | 39k: ET 96%, ~300 mm, -7 | 25k: EF 83%, ~160 mm, -15 | the driest | seven lakes, 2.1-4.5 km |

Under 3 km there is little (the rims drop fast into the trough): ~3,500 km² of Csa, Csb and Dsb on each part's lower
edge, ~700-1,000 mm, +9 to +16 °C. Nothing on the rim is airless.

### The lakes (the feature)

Every lake stands under its own shore (checked: level against the lower quartile of the shore), so the levels hold.

| Lake | Where (px) | km² | Surface | Depth | Shore | What it is |
|---|---|---|---|---|---|---|
| **The great lake** (Ledge's), **after 4.22** | the basin px 146-201 by 1001-1058 (W); the lake in its north-west | **~2,000-2,500** (8,768 on 4.21) | **~+300 m** (1,312 on 4.21) | ~600 m (3.3 km on 4.21) | the basin plain round it: Csa, Cfa, ~+16-22 °C; the 25-36% north cliff over the water | the rim's heart: a lake under a cliff in a warm basin, its outlet a gorge to the Rift |
| N rim | 261,1060 | 1,120 | 3,271 m | ~1.1 km | ~860 mm, +3 | the largest of the N rim's chain |
| N rim | 295,1072 | 624 | 1,887 | ~550 m | ~1,110 mm, +11 | |
| N rim | 247,1039 | 544 | 3,427 | | ~815 mm, +2 | |
| N rim | 397,1128; 348,1098 | 400; 352 | 2,383; 2,728 | | ~700-800 mm, +7-9 | |
| S rim | 431,1290 | 1,004 | 3,847 | ~850 m | ~500 mm, 0 | |
| S rim | 302,1252 | 848 | 2,734 | | ~600 mm, +6 | |
| S rim | 486,1320; 379,1277 | 768; 768 | 3,531; 2,219 | | ~370-520 mm | |
| S rim | **433,1314** | 688 | **4,477** | ~500 m | ~300 mm, **-4 °C** | the coldest lake: frozen most of the year |
| S rim | 229,1223; 196,1199 | 624; 608 | 2,074; 3,569 | | ~610-630 mm | |
| W tarns | 62,944; 51,909 | 336; 240 | **5,568; 5,810** | shallow | ~330-890 mm, -8 to -10 | ice-bound tarns under the Outer Wall, 0.8 atm |

The rim is a **staircase of lakes** from ~300 m to 5.8 km: each step a different water, by height, rain and rock (section 3).

### The great lake's basin (4.22)

On 4.21 the great lake is a hollow 3.3 km deep (floor -2,028 m) that the river audit filled to its spill at 1,312 m:
8,768 km², the deepest lake on the map, falling 1.3 km straight into the Rift through a notch at px 194,1059. The water
books agree (its evaporation never exceeds ~150 m³/s at any level, against ~800 m³/s coming in), but the hollow does not
hold up: a pit at the Rift's shallow head, behind a thin ridge a river that size would have cut through long ago. The
owner (2026-10-23): no deeper than the Rift beside it, shallower, and a gorge that frees land between the Rift's floor and
the rim. **4.22** (`tools/scale-model/README.md`):

- **The basin plain**: the hollow refilled as a plain rising from a shore at ~+300 m to ~+1,000-1,300 m at the walls'
  foot, **~6,000 km² of new land**: higher than the Rift's floor (-1,600 to -1,850 m nearby), far lower than the rim
  (3-6 km). Sheltered on three sides by the highland, a mean of about +16-22 °C, ~1,000-1,300 mm: **the warmest, most
  farmable ground on the rim**, where Dalab's hold could grow its food.
- **The lake**: ~2,000-2,500 km², ~600 m at its deepest (to ~-300 m), in the basin's north-west under the north cliff.
- **The gorge**: the outlet river crosses the plain south-east to the old notch, and the gorge cuts through the ridge,
  1.2-2 km deep under its shoulders, past **Chimes** (ruined arcology, px 196,1062, at the gorge's foot) to the Rift's
  trough: ~60 km of rapids and falls, ~800 m³/s.

### Dalab's road (the model's heights)

From Dalab (px 192,782, 606 m) the easiest way to the great lake runs **about 510 km** south over the Outer Wall: up to
~5 km by y ~850, ~7.8 km by y ~882, a crest of ~9.4-9.7 km at about px 209,902, down past ~7 km by y ~930, and onto the
lake's north shore at about px 166,1000. About **150 km lies over 6.5 km** (under 0.7 atm, hard going even modded), and
about **20 km over 9 km: the airless crest**, where nothing breathes. **The Ancient tunnels run under the crest**: at
least the 20 km under the airless stretch, more likely 60-70 km under everything over 8 km. That is why the road exists
at all, and why it is fragile.

## 2. Who holds it (the lore, with proposals)

- **Dalab, tenuously**: the arcology on the great lake (section 5), the road and its waystations, field stations at a
  few lakes; supply trains of modded porters and Dalab lizards (the cold-modded strain is a proposal) a few times a year.
- **Nobody else**: the Lizardmen keep to the Rift's floor and lower walls; Xanadu is beyond them.
- **Natives**: an Ancient worker caste gone feral (the owner, 2026-10-23); who they are, section 6.

## 3. The flora: the Rift's forms, gone temperate

Where an Earth plant is the model, it is named. The palette stays the Rift's (teal, violet, iridescent purple, hot pink
in the flowers), cooled toward silver and blue-green with height.

### Zones (by height, rain and the lakes)

| Zone | Where | What grows |
|---|---|---|
| `shore` | the great lake's basin plain and shores, and the trough's lower edge (Csa, Cfa, Csb, under ~2 km) | the Rift's Mediterranean crest read in place: barrel frills, fan trees, Rift stone pines, silver scrub, garrigue; vines and figs on the warm cliffs |
| `montane` | 2-4.5 km (Dsb, Dsc), the largest zone | **the new forest** (below): frost frills, bell firs, lobe larches, the Rift's beard trees read in place, meadows of prism heath |
| `alpine` | 4.5-6 km (ET) | the Rift's giant groundsels and the new lantern lobelias, cushion anemones, iridescent lichen fields, felsenmeer |
| `ice` | over 6 km (EF) | glaciers, snowfields red and violet with snow algae, nunataks |
| `lake` | every lake and tarn | each lake its own colour (below) |

### New species

| Key | Name | Model | What it is | Harvest |
|---|---|---|---|---|
| `frostfrill` | Frost frill | the Rift's frill tree, as a subalpine conifer | a ribbed teal column 25-40 m with short stiff fins in whorls instead of branches, the fins shedding snow; a violet bud at the tip in summer | the resin (a varnish); the fins as tinder |
| `bellfir` | Bell fir | the Rift's bell palm crossed with a fir | a pale trunk forking twice or three times, each tip an inverted bell of pleated blue-green needles that closes in winter | the closed bells' winter seed: **the staple** (section 7) |
| `lobelarch` | Lobe larch | the Rift's lobe tree, deciduous | a stringy plum bole with pads of lobed leaves that turn violet and gold in autumn and fall | the bark fibre (cordage) |
| `lanternlobelia` | Lantern lobelia | the Afroalpine giant lobelias (*Lobelia telekii*) | a 3-5 m spike of hairy bracts, glowing faintly blue from inside on cold nights (the Rift's lantern tree's light) | none (the alpine's beacons) |
| `cushionanemone` | Cushion anemone | the Rift's anemone stalk as a cushion plant | dense domes of short dark stalks each tipped with a red anemone spray, closing at night | none |
| `prismheath` | Prism heath | heather (*Calluna*) with the Rift's prism bush's colour | low mats that go green to orange to magenta across a slope through the season | honey (the bees' heath) |
| `starberry` | Starberry | a lingonberry-like shrub (*Vaccinium*) | star-shaped teal berries that ripen violet | **the fruit** |
| `rimroot` | Rimroot | a rhubarb-like alpine (*Rheum*), the Rift's croton's veined leaves | huge veined leaves lit magenta along the veins over a thick root | **the medicine**: the root, dried, a purgative and a fever remedy (as rhubarb root) |

### The lakes' colours

| Kind | Where | Colour |
|---|---|---|
| Deep lake | the great lake | dark blue under the cliff, green-blue over the plain's shallows, the cliff's reflection |
| Glacial | the S rim's higher lakes, the W tarns | milky turquoise from rock flour |
| Algal | N rim lakes in the montane forest | the Rift's algal mats gone cold: teal and violet mats on the shallows, stromatolite-like domes |
| Peat | the montane's lower lakes | tea-dark water edged with bog |
| Frozen | the 4,477 m lake, the tarns | ice most of the year, blue under the snow, melting at the edge in summer |

## 4. Landforms

The trough's walls in the strata module's `canyon` recipe (formations stacked up the rim); cirques and their tarns;
moraines damming the lakes; hanging valleys with falls into the trough; the great lake's north cliff; felsenmeer and
patterned ground in the alpine; glaciers and nunataks; the Outer Wall standing over the west.

## 5. Ledge: the hub and the bridge (settled 2026-10-23 unless marked)

- **Ledge is the Ancient arcology**, and the settlement takes its name. It was **the southern hub of the Ancients' Rift
  line** (`LORE.md` §4): the tunnels under the Outer Wall came out above it, and lines ran on to the Ancients' Rift
  settlements, less extensive than those up north but substantial (*proposed*: Chimes at the gorge's foot, Cthonos, Cube,
  The Tubes; Pluton on the airless crest as a second crossing's portal).
- **It is a bridge between two levels**: the highland where Dalab's road comes out of the tunnels (the cliff top, ~1.6-2.5
  km) and the basin and lake ~1.3 km below it (after 4.22). Holding it means working both: the road's terminus, stores
  and stables above; the fields, the harbour and the way to the gorge below; the arcology between them, built into the
  cliff, its lifts, inclines and stairs the only way up and down.
- *Proposed*: the Ancient lifts are why Dalab's hold depends on others. The genepriests can mod a porter for the cold
  and the air, but they cannot run the cliff's machinery alone (section 6).
- **The point**: Ledge's marker (px 160,1007) is a water cell on 4.21. Proposed: **px 165,1000**, the cliff where the road
  comes down (1,638 m, ~1,300 m over the lake after 4.22, +14 °C, Csa): the upper level; the arcology runs down the cliff
  from it to the shore.
- **Theme** (*proposed*): a transit hub first (terminus halls, the lift shafts, sidings cut into the rock), with the gene
  bank as a second story: Dalab came for the line's road and stayed for what the arcology's gardens and vaults hold.

## 6. Natives: an Ancient worker caste gone feral

The owner (2026-10-23): an Ancient worker caste gone feral; who they are is open. *Proposed*: **the line's crews.**

- **Who they were.** The caste the Ancients engineered to run the Rift line: the tunnels under the airless crest, the
  lifts on Ledge's cliff, the stations in the Rift. Bred for **long shifts in thin air and the dark**: barrel-chested and
  big-lunged, with blood that holds oxygen at altitude; large eyes with eyeshine for the tunnels; compact, strong hands
  for the machinery; grey, near-hairless skin that has never needed the sun; tolerant of cold.
- **What they are now.** When the Ancients fell the crews stayed on the line. A thousand years later they still **walk
  it**: they keep stretches of the tunnels clear, tend the lifts they can still run, and live in the side galleries, the
  stations and the high valleys round them. The work became their religion: **the timetable is scripture**, the old
  signal codes are their speech's second voice (lamps in the dark, and **bells: perhaps why Chimes is called Chimes**).
- **How they are organised** (*proposed*): **clans by shift** (Day, Night, Third, and the Relief), each with a foreman;
  they call themselves **the Shift**. Their English is the crews' English, with the line's jargon fossilised in it.
- **They and Dalab.** Dalab's road runs through tunnels the Shift keeps, and Ledge's lifts answer to them, so Dalab's
  hold rests on an uneasy bargain: trade, medicine, a truce at the lifts, and raids when it breaks. The genepriests want
  the Shift's genes above all (*proposed*: **Dalab's cold and altitude mods were learned from them**, which is how a
  lowland lab can send its people over the Wall at all), and the Shift remembers being taken.
- **Not standard humans, not Lizardmen**: engineered people, as the Giants are Dalab's (`LORE.md` §6.1), but older.

Other candidates for "who", if the crews do not suit: **the arcology's own staff caste** (the gene bank's keepers,
feral gardeners of the vaults' descendants) or **the Rift settlements' builders** (a hauling and quarrying caste, huge
and slow).

## 7. Crops (`kits/crops`)

A `riftrim` entry (`atm: 1`): zones `shore` (warmth [2, 3], arid [2, 3]), `montane` (warmth [1, 1], arid [1, 3]),
`alpine` (warmth [0, 0], arid [1, 2], atm 0), `lake` (wet). **The three**: **starberry** (fruit), **bell fir seed**
(the staple, a nut-grain gathered from the closed bells in winter), **rimroot** (the medicine). Dalab's own crops grow in
the arcology's gardens (`kits/crops` records with `home: ['dalab']` that fit the `shore` zone).

## 8. Fauna

As strange as the Rift's, but temperate: to `kits/fauna` later, the rim's own big animals among them (the owner's to
name). The page's first stations carry birds, insects over the lakes and grazing herds at distance.

## 9. Stations

1. **Ledge and the great lake** (`dist/riftrim.html`): the arcology on both levels, the cliff top where the road comes out
   of the tunnels and the lifts and inclines down the cliff, the lake under the cliff, the basin plain beyond it with Dalab's fields, the gorge's head at the
   far side, the montane forest climbing the walls round it.
2. **The lakes of the north rim** (`-lakes`): the 1,120 km² lake at 3,271 m (px 261,1060) in frost-frill and bell-fir
   forest, algal shallows, a chain of smaller lakes stepping down to it, a hanging valley's fall into the trough.
3. **The cold lake** (`-ice`): the S rim's lake at 4,477 m (px 433,1314), frozen most of the year, the alpine with
   lantern lobelias and cushion anemones, glaciers above, the Rift's floor far below.
4. **The gorge** (`-gorge`, optional): the outlet through the ridge, rapids and falls, Chimes' ruin at its foot, the
   Shift's bells in the dusk.
5. **The crossing** (`-pass`): the Outer Wall's crest on Dalab's road, the Ancient tunnel's portal and the waystation
   before it, the Shift's signal lamps in the tunnel's mouth, the road winding over the high tundra under a near-airless
   sky.

## 10. Textures

In the library: `ground.tundra`, `ground.turf.polygon`, `ground.snow011`, `ground.snow015`, `ice.glacier`, `ice.clear`,
`ground.lichen.crust`, `ground.sphagnum`, the Rift kit's own sets. To source or generate (prompts first): bark and fin
cards for the frost frill, needle bells for the bell fir, lobe larch leaves (summer and autumn), the lantern lobelia, the
cushion anemone, prism heath (three seasons), starberries, rimroot; red and violet snow algae on snow; the algal lake
shallows.

## 11. Order of work

- **R0.** The owner answers section 12; texture prompts; the station sites from the model.
- **R1.** The kit on the biome core: the fields (height, rain, the lakes from the model's water, aspect), the zones.
- **R2.** Station 1 (after the model's 4.22 basin and gorge): the great lake, its cliff, the basin plain and the arcology's
  site (the arcology's own build is a settlement's work).
- **R3.** The new species; the Rift's read in place.
- **R4.** The lakes' colours and kinds; stations 2 and 3.
- **R5.** Stations 4 and 5, the gorge and the crossing (the tunnel mouth as a carve patch).
- **R6.** The crops; `verify.py --assert`; `PORT.md`; the gallery; the Rift kit's highland switched to read this kit.

## 12. Questions for the owner

1. **Who the feral caste are**: the line's crews ("the Shift", section 6), or another of the candidates.
2. **Ledge's point**: move it now out of the lake to the cliff (px 165,1000), or with the model's 4.22 basin.
3. **The Rift's ruins** (Chimes, Cthonos, Cube, The Tubes, Pluton) as the line's settlements and stations: confirm, and
   whether Pluton is a second crossing.
4. **Ledge's own build** (the arcology on both levels, Dalab's quarter, the Shift at the lifts) is a settlement plan of its
   own (`settlements/ledge/`), after this kit's station 1.
