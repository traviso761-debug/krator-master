# The north basin: n semiarid and its two overlays (plan, 2026-10-20)

Three builds and one change to how the open world lays biomes:

| build | what | owns ground? |
|---|---|---|
| `biomes/nsemiarid` | the biome kit of the scale model's "n semiarid" region: **the walking steppe** (section 7) | yes |
| `biomes/dambasins` | an overlay: the drained dam lakes' beds, their old shorelines, rusted docks and grounded ships (section 5) | no |
| `biomes/scablands` | an overlay: the breach channels and the flood lake the surge filled (section 6) | no |

`biomes/nwlowlands` exists; it takes the overlays where they reach it (section 8). The owner's calls (2026-10-20): the
walking steppe, with plants that travel and lots of large wind-blown seeds (giant dandelions and the like); the rock is
igneous and sedimentary both; the water went somewhere (section 2 finds where); the dam-basin overlay covers the east
bed inside Korona too.

## 1. What the scale model says (4.21, read 2026-10-20)

Read from the live page and its `regions` collection (`openworld/little-demo/source/regions.json` is older and lacks the
`dam`, `dam 2` and `floodzone` regions). Heights are of land; classes are shares of land.

| | NW lowlands | n semiarid |
|---|---|---|
| area | 212,016 km² (46,192 water) | 183,144 km² (25,968 water) |
| bbox, centroid (map px) | 80,156 to 514,570; (228, 372) | 272,47 to 640,259; (439, 135) |
| heights p5 / median / p95 | 212 / 865 / 1,790 m | 258 / 941 / 3,607 m |
| pressure (1.6 atm x e^(-h/8 km)) | 1.44 atm at the median | 1.42 atm at the median |
| rain p5 / median / p95 | 565 / 973 / 1,992 mm | 204 / 408 / 1,804 mm |
| annual mean, median | 22 °C | 23 °C |
| wind power, median | 153 W/m² | 228 W/m² (NW boreal's is 241) |
| classes | Csa 64.5, Cfa 16.7, Aw 8.9, Af 4.1, Am 3.2, Dsb 1.2 | BSh 46.6, Csa 15.9, Cfa 11.9, BWh 7.8, Dsb 5.0, Aw 4.1, Af 2.2, Csb 2.0, BSk 1.3, Dfb 1.2, Cfb 0.9, Am 0.8 |

Inside n semiarid:

| sub-area | km² | classes |
|---|---|---|
| the old dam-lake beds | 62,948 | BSh 48, Csa 18, BWh 12, Aw 10, Af 5 |
| off the beds, under 1,100 m | 37,572 | BSh 74, Csa 17 |
| the plateau, 1,100 to 2,500 m | 35,292 | BSh 43, Cfa 31 (the rainy uplands at 1.2 to 1.6 km, ~1,400 mm), Csa 12, BWh 10 |
| over 2,500 m (median 3.5 km) | 21,364 | Dsb 37, Csb 15, Cfa 14, Csa 12, Dfb 9, Cfb 7 |

BWh lies mostly on the east bed (round px 555,84); the tropical classes (Af, Am, Aw) lie on the low beds beside today's
lakes, at or under sea level in dense, hot air.

The two regions touch along a seam from x 293 to 508, y 156 to 260. The owner's `floodzone` region straddles it
(25,556 km² in n semiarid, 32,456 km² in NW lowlands).

## 2. Where the water went

The dams' lakes (`DATA.palaeolakes`, `DATA.dams`, `DATA.floods`) drained in two ways. Above each breach's **sill**
(the floor of the cut pass) the water left in the flood; below it, it was trapped in its basin. Measured on the model's
heights (half-resolution grid, dams removed; within a few per cent):

| | full level | sill | volume above the sill (the flood) | volume below (trapped) | today |
|---|---|---|---|---|---|
| west lake (`dam`) | 900 m | 700 m | 7,941 km³ | 7,758 km³ | a lake at -81 m, 4,107 km² |
| east lake (`dam 2`) | 1,050 m | 850 m | 11,530 km³ | 32,297 km³ | a lake at -60 m, 14,744 km² |

The east surge ran into the west basin, and both lakes' flood water (**19,471 km³**) went down the west breach into the
long-lake trough. **Nothing could leave the north basin:** the trough, the west basin and the east basin together have
no way out under ~1,100 m (the lowest is over the two ridges 4.20 raised on Korona's side). So the surge pooled.
Taking the trough at today's level (430 m) when it came, it rose to **about 834 m**, joined with the west basin, a
**flood lake of ~80,000 km²** (32,600 km² of it in NW lowlands, 43,600 km² in n semiarid), 16 m short of backing up
into the east basin.

Since then all of it has evaporated: the flood lake back to 430 m, the trapped water in each dam basin down to today's
remnant lakes. That is about 55,000 km³ in all; at ~1.5 m a year off ~60,000 km² of water, about six centuries. So the
lakes were near today's levels a few centuries ago, and are still shrinking slowly or have just reached balance
(`hydro.py` settles them at balance today). The steam went somewhere too: the centuries after the flood were wetter
downwind, which the land does not have to show but a story can use.

**What follows for the overlays:** every old water body has three bands by height, and each band looks different.

| band | west bed | east bed | flood lake | how it drained | what it shows |
|---|---|---|---|---|---|
| the full-pool line | 900 m | 1,050 m | ~834 m | the line held for decades (the dams) or days (the flood lake) | dams: a wave-cut notch, a beach ridge, the bathtub ring under them. Flood lake: one sharp high-water line with rafted wreckage on it |
| the fast drain | 900 to 700 m | 1,050 to 850 m | none | in days to weeks | no strandlines; slumps and landslides (rapid drawdown fails wet slopes), gullied bare silt; the docks and moored ships stranded here |
| the slow recession | under 700 m | under 850 m | 834 to 430 m | over centuries, by evaporation | a staircase of strandlines, salt rising downward, ships grounded one by one, the youngest beside today's water |

Two places to note. **Boatmurder** (px 494,74), a bandit camp in a pile of boats (the owner: no more lore than that),
stands at 769 m in the west basin's fast-drain band, beside the east breach's mouth, where the surge would have piled
boats anyway. **Jimjam** needs no move for its red brick (the owner offered one): the city stands where LORE.md's
distances put it (226 km north of Dilihan: px ~470,222), at the mouth of the river the model calls *Jimjam river 2*
(110 m³/s) on the trough lake's east shore, in Cfa at ~1,240 mm. Its ground is the flood lake's slackwater silt (the
flood lake reached 834 m there): fine, fresh-water laid, and washed off scoured basalt, so rich in iron, which is what
fires red. LORE.md's "about 50 m above the ocean" is corrected to about 50 m above its lake (~480 m, ~1.5 atm).

## 3. The layers: biomes own ground, overlays own none

The open world gives each map pixel to one biome kit, blended over ~3 km (`WORLD.kitW`; `extract_region.py`'s
`biome.png`, where overlapping regions go to the smaller). That stays as it is for the **biomes**: nsemiarid, nwlowlands,
korona. An **overlay** is a second layer that owns no ground and can lie over any number of biomes:

- **It shapes the land** after the biome's own detail (`WORLD.landHook`, which exists and is null today).
- **It writes fields** the kits read: the existing `rock`, `salt`, `wet`, `canyon`, and new ones: `bed` (0..1, old
  lake floor), `strand` (metres above or below the nearest old waterline), `silt` (lake or slackwater sediment),
  `scour` (bare channel rock), `bar` (flood gravel), `band` (which drainage band, section 2).
- **It places its own objects** (docks, hulks, erratics, pothole pools) as records in `core/tags`, cell-seeded.
- **It tints the ground** over the biome's palette: pale silt, salt white, the ring's calcite, scoured basalt.

**The plants follow the fields, not the overlay.** Scoured basalt raises `rock`; NW lowlands answers with its rock
flora and n semiarid with its own, and neither kit names the scablands. Each base kit's one duty is to read `rock`,
`salt`, `bed`, `silt` and `scour` (0 where nothing binds them). Only plants that mean nothing without the overlay are
the overlay's own (hulk gardens, pothole-pool plants).

**An overlay's weight comes from physics, not a painted region:** a dam bed is ground under its old level inside its
basin, so its shoreline is a contour and needs no blur; the scablands are ground under the flood's water surface along
`DATA.floods`; the flood lake is ground under ~834 m round the trough. The `floodzone` region is the outer limit only.
**Order:** the basins first, the scour over them (the flood stripped the bed where it ran).

The code is `[G data]` in `core/terrain`, beside `KRELIEF`, with node tests: **`KBASIN`** (any old water body: its
levels, sill, bands, strandlines, the ring) and **`KSCOUR`** (a flood channel's landforms). In the open world a
`WORLD_OVERLAYS` table sits beside `WORLD_KITS` (`openworld/little-demo/src/47-world-kits.js`), and nothing else
names an overlay. The extractor needs a second layer: overlays out of `biome.png`, their own masks, and
`DATA.palaeolakes`, `DATA.dams`, `DATA.floods` and the flood lake's level in `region.json`.

## 4. The rock

Igneous and sedimentary both (the owner). The Columbia River's scablands have exactly that mix, so the strata are a
table both modules read:

- **On the beds:** lake sediments, silt and clay, marl, pale diatomite; evaporites (gypsum, salt) in the lows.
- **Under them and on the plains:** flood basalt in flows 15 to 50 m thick, columnar, each flow's top a red weathered
  bed (a palaeosol interbed) that recesses in a cliff. Coulee walls are stacked tiers of columns; the dry falls are in
  basalt.
- **Basement:** sandstone and limestone under the basalt, seen where the cuts are deepest (the two notches, 460 and 485
  m) and on the rainier Cfa uplands. Below the west notch the channel widens where it reaches the sandstone.

The open world's ground already has a bedded-rock weight (the strata shader, `41-world-fields.js`).

## 5. Overlay: the dam basins (`biomes/dambasins`)

The west bed (41,408 km², all in n semiarid) and the east bed (47,792 km²: 23,168 in n semiarid, 24,564 in Korona).
Old shorelines ~1,630 km (west) and ~1,530 km (east).

- **The full-pool line:** a wave-cut notch and a beach ridge at 900 / 1,050 m; under them the bathtub ring, a band of
  bleached calcite stain as deep as the reservoir's yearly drawdown: 30 m (the owner).
- **The fast-drain band:** slumped and gullied silt slopes, landslide scars, no strandlines.
- **The slow recession:** strandlines in a staircase (spacing seeded, closer near today's water), shell banks,
  salt crusts and pans growing downward, mud cracks; yardangs (wind-cut ridges in the lake silt) aligned on the wind,
  lunette dunes on the pans' downwind shores; salt flats at the bottom, the golden poplar forests (section 7) on the
  remnant lakes' shores.
- **Rusted docks:** the Ancient Port kit (`settlements/port`, its `CONTRACT.md`) lays its segments along a coastline;
  give it the full-pool contour as the coast and a derelict dress (no water, rust, missing deck plates, the port's
  salvage pass). The docks stand high on their piles over the falling slope; ferry ramps run down into dust; a
  lighthouse stands on a knoll that was an island.
- **Hulks**, from the port kit's vessels, in three populations by where the falling water left them:
  1. *moored*: grounded and heeled at the docks' foot, in the fast-drain band;
  2. *under way*: drawn by the outflow toward the breach and piled in the notch approach, the graveyard (Boatmurder's
     pile at the east breach's mouth is one);
  3. *trapped below the sill*: afloat on the shrinking lake and grounded one by one on the strandlines, so rust and
     burial grow with height above today's water (the Aral pattern).
  Heel from the slope, burial from `silt`, stripped more near camps; sockets (`core/sockets`) for the bandit camps,
  which are a later build.
- **Dress:** pre-dam villages and the stumps of the forest the lake drowned, exposed with silt lines on them.
- **Its own flora: hulk gardens.** Iron is locked up in alkaline lake-bed soil and metal condenses dew at night, so vines
  that root in rust make each hulk a green island on the white flat.
- **Stations** (the Throne's and Korona's `--station` pattern): 1, the ship graveyard at the west notch; 2, an old port
  on the 900 m line, the ring and the fast-drain band below it; 3 (later), the east bed inside Korona.

## 6. Overlay: the flood (`biomes/scablands`)

**The channels** (n semiarid only): the east breach, 122 km from 762 to 370 m, into the west basin; the west breach,
216 km from 624 to 207 m, into the trough. Steeper than Washington's, so cataracts and coulees more than braided plains:

- coulees (steep basalt walls), dry falls (horseshoe cliffs) with plunge-pool lakes, butte-and-basin scabland, potholes
  (kolks) with their pool plants (the overlay's own flora);
- giant current ripples (crests across the flow, spaced and sized by the flood's depth), pendant bars behind obstacles,
  expansion bars where a channel widens;
- streamlined loess islands, teardrops pointing downstream, keeping the base biome's untouched flora;
- erratics of dam debris: concrete blocks with rebar, carried kilometres;
- where the west channel met the flood lake, a giant expansion bar and fan.

**The flood lake** (round the trough: ~43,600 km² in n semiarid, ~32,600 km² in NW lowlands at its height), the
north basin's Lake Lewis: it rose in days to ~834 m and fell over centuries. One sharp high-water line with wreckage
rafted through the west notch stranded on it (hulks and Ancient flotsam, now in the lowlands' forest), slackwater silt
in stacked flood beds below it (rhythmites: Jimjam's brick), strandlines down to 430 m. Its dry bed today is 40,500 km²
(14,300 in NW lowlands, 26,000 in n semiarid). This is the part that lies over both biomes.

**Stations:** 1, a coulee and dry falls on the west breach (over n semiarid); 2, the fan and the flood lake's high line
in the lowlands (over nwlowlands).

## 7. The kit: n semiarid, the walking steppe

**Earth basis:** Central Asia (the Aral Sea, Turkestan, Iran, Anatolia, the Tian Shan): steppe, desert, Mediterranean
and the upland fruit forests, which no kit has used. Its classes match the region's almost exactly.

**The rule: everything here travels.** Whole plants walk or roll; their seeds fly. Why:

- **Seeds fly further.** A seed's fall speed goes as √(m·g / ρ·A), so at 1.42 atm and 0.75 g a parachute carries about 1.9
  times the mass of an Earth seed at the same fall speed. With a median wind half as strong again as the NW lowlands', big wind-blown seeds pay.
- **The wind pushes harder.** At a given speed it carries 40% more force (ρ), so tumbling and creeping pay too.
- **The land kept drying.** For centuries the shores retreated (section 2), and what won was what could follow water and
  take new bed. A walker's heading points to the nearest water or downwind, and the fliers took the beds.

Every traveller's placement record carries its heading and trail, seeded by cell.

| zone (class) | share | plants |
|---|---|---|
| steppe and desert (BSh, BWh) | ~55% | **tumblers** (globes 1 to 3 m that break off and roll, piling in drifts on the windward side of anything standing: hulks, docks, erratics, walls); **crawlers** (prostrate stems after the creeping devil: a green head, 10 to 30 m of grey dead trail behind, all aligned; best on the salt flats); **crescent saxaul** (leafless, jointed, gnarled; a stand roots its downwind limbs and dies behind, so groves are crescents migrating with the dunes); **giant dandelions** (seed clocks 1 to 3 m across on 4 to 6 m stalks, balding from the downwind side); drill grass (feather grass whose awns twist themselves into the soil; a long sway); resurrection balls on the pans; pistachio parkland over tulip carpets |
| Mediterranean (Csa) | 16% | plane trees at the springs (the Silk Road's spring tree); Judas trees flowering magenta from the trunk; almond and pomegranate thickets; **foxtail spires** (flower spikes 5 to 8 m); **glider gourds** (a climber whose winged seeds glide down in spirals, after *Alsomitra*, ~1 m across); **balloon pods** (after *Calotropis*: inflated fruit bursting into silk) |
| rainy uplands (Cfa) | 12% | **the feral fruit forest**: wild apple, walnut, apricot and pear, the Ancients' lakeside orchards gone wild; **samara trees** whose seeds come down as half-metre helicopters |
| the tropical lake margins (Af, Am, Aw) | ~7% | **golden poplar forest** (after the Euphrates poplar's riverside forests on dried terminal lakes): gold in its season, dead grey trunks standing out on the bed behind it, and cotton shed in drifts like snow; reeds |
| highland spurs (over 2.5 km) | 12% | `nhighlands` and `ebadlands` read in place (as `necanyons` reads the hyperjungle), not a fifth flora |

**Krator's own** (the owner, 2026-10-20: alien plants too, a dandelion frill and a helicopter trumpet, wind-blown). Each
is a steppe branch of a lineage the other kits already grow, its dispersal turned over to the wind:

- **The dandelion frill** (the frill-tree line: the Rift's, the drylands' fire-bursting one). The ribbed bottle column with
  fins in rows up every rib, 12 to 20 m; here each fin is a seed on a plume. Green, the fins are the frill's
  iridescent teal-to-violet (the owner's fractal frond, `card.frond.fractal`, as `biomes/README.md` asks of every frill);
  ripe, they turn silk-white and the crown pod opens into a seed clock 4 to 6 m across. The wind strips it fin by fin,
  downwind side first; a stripped tree stands with bare ribs pricked with sockets, and the new fins grow back from the
  foot, so how high they reach says how long since it last shed. Stages as variants: green, ripe clock, half shed, bare.
- **The helicopter trumpet** (the trumpet-tree line: the Rift's slim ribbed stalk flaring into a funnel). Its funnel
  is fluted with angled vanes on a living ring joint at the stalk's top, so it turns in the wind like an anemometer,
  faster as the wind rises (spin from `ATMOS.windAt`; in Godot from `atm_wind`), and flings its seeds out over the rim:
  spiral-winged seeds ~40 cm long that autorotate down and away. A stand of them is the wind made visible, every
  funnel turning, the slow ones in the lee. Dense air makes a rotor work: the same speed of wind turns it with 40% more
  force.
- **The drift lantern** (the bell-bulb line: nhighlands' bulbs that glow at night). Its bulbs fill with gas as they
  ripen and lift away at dusk, glowing, each carrying a seed under it: on a calm evening a slow drift of lights crosses
  the steppe downwind. Buoyancy against weight goes with the air's density alone, so a bulb lifts 40% more than it
  would on Earth.

**The small and weird** (the owner's reference board, 2026-10-20: an alien cactus garden and a table of alien-flora
miniatures). Plants from 0.3 to 3 m in saturated accents (orange, coral pink, lime, cobalt, fire red) against the steppe's
sage, ochre and rust. They gather in **dew gardens**: anything standing up (a boulder, an erratic, a hulk, a dock pile)
condenses dew at night, so mixed clumps of them ring the rocks, as on the board's rock pads. Every one of them travels or
throws its seed:

| plant | from the board | how it travels |
|---|---|---|
| **striders** | the barrel and the ribbed blue column on stilt roots; the orange body on fleshy feet | the true walkers: a new root on the side toward water, the far one dies, so it leans and steps a metre a decade, leaving dead root stubs as a trail |
| **mace heads** | the knobbed globe on a stalk | the ripe head snaps off and rolls like a tumbler, rooting where it stops |
| **bead chains** | the beaded stems with knob tips | wind snaps the chains at their joints and each bead roots: lines of beads strung out downwind |
| **sail candelabra** | the knobbed column with yellow blade leaves | its blades come away with seed on them and kite off downwind |
| **star drifters** | the pale star of fronds on a thin stalk | the whole crown is the parachute; the stalks stand bare behind |
| **censer caps** | the orange sponge-capped stalks | pores full of seed that the wind shakes out, as a poppy's capsule does |
| **horn pipes** | the paired yellow horn tubes | the wind pumps seed out of them, and they hum: a field sings in a gale |
| **roll-eggs** | the blue honeycomb egg in yellow leaves | a 1 m fruit that drops and rolls across the flats, shedding seed from its cells: a line of seedlings behind each |
| **furlers** | the red-orange sunburst on a green bulb | open in calm, shut in a gust: a gust front (`ATMOS.windAt`) crosses a field as a wave of closing flowers |
| **hitchers** | the pink and green spiked spheres | hooked burrs that ride on animals and riders |
| **step cones** | the orange terraced cones | grow a tier each wet year, so on the old beds their height reads how long the ground has been dry: short by today's water, tall on the high strandlines (`strand`, section 5) |
| **windows** | the lime bubble stubs | the plant lives underground behind translucent tips that glow when the sun is low behind them; on the pans |
| **salt fingers** | the green finger clumps | jointed salt-tolerant succulent fingers (after glasswort) that break off and root in the salt crust |

Urchins, corals, anemones and honeycombs appear in other kits (the Rift, the Throne, the Ring Sea isles); these differ in
what they do, not only in shape. They are cheap as variants: each a handful of parts, placed in the floor pass.

**The seed weather.** In the seed season a layer of drifting seeds rides the world's wind (`core/atmos`), and seed and
cotton pile in the lee of whatever stands up, as the tumblers do; the overlays' records are its obstacles. In Godot,
particles on `atm_wind`.

**From the start** the kit is open-world ready: a pass table as data, trees as variants (`KIT.make`, `KIT.grow`),
placement seeded by cell (`core/rand`), records before drawing, tags and Köppen classes on every species.
**Crops:** pomegranate, apple and apricot are in `kits/crops`, walnut and pear in the catalog's fruit; pistachio and
almond are not yet.

## 8. NW lowlands' part

`biomes/nwlowlands` has no `rock` field and no zone for bare rock, and no pass table or variant trees (it is not
open-world ready). It needs: a zone on `rock` (its crag pines, tussock and saltbush on scoured ground), a response to
`bed` and `silt` (young forest on the flood lake's silt, the rafted hulks among the trees), and the pass table and
variants. Korona, later, needs the same `bed` and `salt` response for its share of the east bed.

## 9. Order of work

1. **Data.** *Done 2026-10-20:* the live collections in `openworld/north-basin/source/` (little-demo's copy stays its
   frozen 4.19 input); the extractor's overlay layer (`overlay.png`) and the old waters (`palaeo.png`, `region.json`
   `palaeo`: each dam lake, the flood lake at 834 m, the dams and floods); the north basin cut into
   `openworld/north-basin/data/` (its README).
2. **`KBASIN` and `KSCOUR`** in `core/terrain`, `[G data]`, with node tests (a tile alone and in a full build give the
   same records).
3. **`biomes/nsemiarid`**, the kit and its showcase.
4. **`biomes/dambasins`** and **`biomes/scablands`**, their stations reading the base kits in place.
5. **`biomes/nwlowlands`**: the rock zone, the bed response, the pass table and variants.
6. **A north-basin open world** (`openworld/<name>`) with `WORLD_OVERLAYS`: where one overlay over two biomes is
   actually tested.

## 10. Questions

None open. Settled 2026-10-20 (the owner): the trough stood at 430 m before the flood; Boatmurder is only a bandit camp in
a pile of boats; Jimjam may move if its brick needs it (it does not: section 2); the bathtub ring is 30 m deep.

**The west bed's second lake** (px 325,120), drawn at exactly 0 m: a closed hollow of its own (its floor at -435 m), not
joined to the west remnant at any level up to 200 m; it split off as the trapped water fell. `SETTLE` had levelled only
the three named lakes and left it as drawn, so it was settled the same way on the 4.21 page (the owner asked, 2026-10-20):
it balances at **+1 m over 2,615 km²** (drawn: 0 m, 2,534 km²), fed by ~26 m³/s. The drawn level was right by chance and
the model is left as it is. The overlay treats it as the west bed's second remnant lake.
