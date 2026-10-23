# riftrim: the plan (draft, 2026-10-23)

**The rift rim**: the high country round the Rift, south of the crater across the Outer Wall. Wild and untamed: the
walls of the Rift's trough and the highland at its western head, a staircase of lakes from a 2.5 km-deep lake at 1.3 km
to tarns at 5.8 km, forest, tundra and ice. **Its flora is as strange as the Rift's, but temperate**: the Rift's own forms
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
| Pages | four stations (section 9) |
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
| **The great lake** (Ledge's) | 146-201 by 1001-1058 (W) | **8,768** | 1,312 m | **~2.5 km** (bed to ~-1,150 m) | Csa, ~1,100 mm, **+15 °C**; a 25-36% cliff on the north shore | a Baikal: the rim's heart and its warmest, wettest ground |
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

The rim is a **staircase of lakes** from 1.3 km to 5.8 km: each step a different water, by height, rain and rock (section 3).

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
- **Natives**: open (section 6).

## 3. The flora: the Rift's forms, gone temperate

Where an Earth plant is the model, it is named. The palette stays the Rift's (teal, violet, iridescent purple, hot pink
in the flowers), cooled toward silver and blue-green with height.

### Zones (by height, rain and the lakes)

| Zone | Where | What grows |
|---|---|---|
| `shore` | the great lake's shores and the trough's lower edge (Csa, Csb, under ~2 km) | the Rift's Mediterranean crest read in place: barrel frills, fan trees, Rift stone pines, silver scrub, garrigue; vines and figs on the warm cliffs |
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
| Deep lake | the great lake | dark blue-black in the middle, glass-clear at the shore over pale cobbles, the cliff's reflection |
| Glacial | the S rim's higher lakes, the W tarns | milky turquoise from rock flour |
| Algal | N rim lakes in the montane forest | the Rift's algal mats gone cold: teal and violet mats on the shallows, stromatolite-like domes |
| Peat | the montane's lower lakes | tea-dark water edged with bog |
| Frozen | the 4,477 m lake, the tarns | ice most of the year, blue under the snow, melting at the edge in summer |

## 4. Landforms

The trough's walls in the strata module's `canyon` recipe (formations stacked up the rim); cirques and their tarns;
moraines damming the lakes; hanging valleys with falls into the trough; the great lake's north cliff; felsenmeer and
patterned ground in the alpine; glaciers and nunataks; the Outer Wall standing over the west.

## 5. The arcology (Ledge, placeholder)

- **The marker is in the lake**: Ledge's point (px 160,1007) is a water cell on 4.21 (the -917 m it reads is the lake
  bed, 2.2 km under the surface). Proposed new point: **px 165,1000**, on the north cliff where the road comes down:
  1,638 m, ~330 m over the water, ~1,200 mm, +14 °C (25/2), Csa. **A ledge over a 2.5 km-deep lake** is what the name
  says.
- **Theme** (proposed): an Ancient **gene bank and highland research arcology**: seed vaults cut into the cliff, cold
  stores, greenhouses and field gardens on its terraces, which is why Dalab troubles to hold it at all. The genepriests
  sample the rim's flora and fauna and grow cuttings in the old gardens.
- **Name** (proposed): Dalab's low tongue fuses *the* on as *da-*, so the priests' "the vault" is **Davolt** to the
  porters; or keep the Ancient name if the owner gives it one.

## 6. Natives (open: three options)

1. **The Strays** (recommended): descendants of an earlier Dalab colony at the arcology, modded for cold and altitude
   further than Dalab's own people, which broke with the lab a century or more ago and went wild in the high valleys.
   Green-skinned like Dalab (the photosynthesis mod), darker for the high sun, thickset and big-lunged. Not standard
   humans, not Lizardmen, and they do not want Dalab back: one more reason the hold is tenuous, and the genepriests
   want their genes too.
2. **An Ancient work caste**: a people the Ancients engineered to keep the tunnels and the arcology, left behind when the
   Ancients fell: long-limbed, sealed-lunged, quiet, still tending the tunnels after a thousand years. Dalab uses the road
   they keep without understanding them.
3. **No natives**: the rim empty but for its fauna, the wildness the point, Dalab alone with the ruins.

## 7. Crops (`kits/crops`)

A `riftrim` entry (`atm: 1`): zones `shore` (warmth [2, 3], arid [2, 3]), `montane` (warmth [1, 1], arid [1, 3]),
`alpine` (warmth [0, 0], arid [1, 2], atm 0), `lake` (wet). **The three**: **starberry** (fruit), **bell fir seed**
(the staple, a nut-grain gathered from the closed bells in winter), **rimroot** (the medicine). Dalab's own crops grow in
the arcology's gardens (`kits/crops` records with `home: ['dalab']` that fit the `shore` zone).

## 8. Fauna

As strange as the Rift's, but temperate: to `kits/fauna` later, the rim's own big animals among them (the owner's to
name). The page's first stations carry birds, insects over the lakes and grazing herds at distance.

## 9. Stations

1. **The great lake** (`dist/riftrim.html`): the north cliff and the arcology on its ledge, the road coming down the
   cliff's switchbacks, the Mediterranean shore below, the lake 2.5 km deep and about 100 km across, the montane forest climbing
   the far side.
2. **The lakes of the north rim** (`-lakes`): the 1,120 km² lake at 3,271 m (px 261,1060) in frost-frill and bell-fir
   forest, algal shallows, a chain of smaller lakes stepping down to it, a hanging valley's fall into the trough.
3. **The cold lake** (`-ice`): the S rim's lake at 4,477 m (px 433,1314), frozen most of the year, the alpine with
   lantern lobelias and cushion anemones, glaciers above, the Rift's floor far below.
4. **The crossing** (`-pass`): the Outer Wall's crest on Dalab's road, a tunnel mouth and the waystation before it, the
   road winding over the high tundra under a near-airless sky.

## 10. Textures

In the library: `ground.tundra`, `ground.turf.polygon`, `ground.snow011`, `ground.snow015`, `ice.glacier`, `ice.clear`,
`ground.lichen.crust`, `ground.sphagnum`, the Rift kit's own sets. To source or generate (prompts first): bark and fin
cards for the frost frill, needle bells for the bell fir, lobe larch leaves (summer and autumn), the lantern lobelia, the
cushion anemone, prism heath (three seasons), starberries, rimroot; red and violet snow algae on snow; the algal lake
shallows.

## 11. Order of work

- **R0.** The owner answers section 12; texture prompts; the station sites from the model.
- **R1.** The kit on the biome core: the fields (height, rain, the lakes from the model's water, aspect), the zones.
- **R2.** Station 1: the great lake, its cliff and the arcology's site (the arcology's own build is a settlement's work).
- **R3.** The new species; the Rift's read in place.
- **R4.** The lakes' colours and kinds; stations 2 and 3.
- **R5.** Station 4, the crossing (the tunnel mouth as a carve patch).
- **R6.** The crops; `verify.py --assert`; `PORT.md`; the gallery; the Rift kit's highland switched to read this kit.

## 12. Questions for the owner

1. **Natives**: the Strays, an Ancient work caste, or none (section 6)?
2. **The arcology**: its name and theme (the gene bank is a proposal), and moving its point out of the lake to px
   165,1000 on the north cliff.
3. **The tunnels**: what the Ancients built them for (a service way for the arcology, a transit line under the Wall,
   something else), which sets what the crossing station shows.
