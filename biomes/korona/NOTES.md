# Korona — notes

The north-east region under the gas giant: a corona, a volcanic landform Earth does not have, making a crazy quilt of
small plateaus, depressions and microclimates (`LORE.md` 3.1 and 6.18; `biomes/WORLD.md`, "Korona"). Design notes
only: no kit yet. The scale model's biome region is 'Korona / NE' (`rmuqm3urh0mo6` in the artifact's `regions`
collection; the copy read here is `openworld/isle-demo/source/regions.json`). Map pixels below are the model's full
grid (2 km a pixel, `tools/scale-model/README.md`); heights are its 4 km cells.

## The brief (the owner, 2026-10-19)

- **The land is a corona.** Small plateaus, depressions and microclimates side by side, a kaleidoscope. Known to be home
  to bandits and ghouls.
- **Two themes.** (1) **Tepuis**: tables standing alone over their gorges. (2) **Carnivorous-plant hell**: plants that
  eat a man whole.
- **Not all hell.** The microclimates hold rare herbs and reagents, and some fertile hollows are near-idyllic.
- **People.** Tribes of humans and therian mutants live on the tepuis, apart for centuries, and speak **the Hum** between
  them (`LORE.md` 6.18): the trade tongue carried by pitch, whistled across the chasms, and carved on the tepui walls as
  **contour carvings** (one groove per syllable above or below a guide line). Their names are not yet on record.
- **Build it as stations, like the Throne** (`biomes/throne/build.py --station <name>`, `stations/<name>/station.json`):
  first **the tepui**, then **the pitcher hollow**; later maybe **a fertile basin** and **the trenches** where the
  scablands' flood channel was to spill into Korona (`WORLD.md`; see "The east lobe" below: in 4.21 it does not).
- **Design rule: carnivory follows poor soil.** A `poor` field from the core's `rock`, `wet` and `slope`: traps scale up
  where the ground is poor and wet; herbs take over where it is rich; **every trap carries a hazard tag in `core/tags`**.
- **Landforms from the core.** Overhangs by `core/terrain` carve patches (`36-core-carve.js`); ridges by `KRELIEF.range`
  (`38-core-relief.js`).
- **Neighbours as ecotone species.** nhighlands (trumpets, crag pine, beard lichen, moss) and nwlowlands (bamboo, ferns,
  glow-willows).
- **Textures already in the library** (`core/materials/library/`): `card.carnivore.plants` (nine carnivorous plants),
  `card.moss.carnivorous` (hanging moss with pitchers and sundews), `card.flower.carnivorous` (snare flowers),
  `card.giantpad`, `card.staghorn`, `ground.sphagnum` (a bog carpet with sundew rosettes). `core/materials/PLAN.md`
  lists them under the Throne; Korona reuses them (one set is never generated twice).

## What the scale model says (4.21)

Read from the live page (version 4.21) with the method of `tools/scale-model/extract_region.py` (the `DATA` rasters:
heights, water, climate class, rain, temperatures, wind) and the `regions`, `settlements`, `rivers`, `floods`, `dams`
and `basins` collections. The scripts are not kept: they read the page once and wrote these numbers.

### The region

- **Extent:** map px x 595 to 1071, y 9 to 352: a box 952 x 686 km, the polygon **432,000 km²** (108,045 px), its
  centroid at px (805, 174). Eight times the Throne's island. The volcano is 806 km to the south-west (px 575, 504).
- **The giant** hangs in the north-east sky at 25° altitude, azimuth 66° (`LORE.md` 3.1, the sky fragments of
  nhighlands and eastabyss): from the crater's middle it stands "over Korona"; from inside Korona it is the same,
  low in the north-east, and its giantshine lights the gorges at night.
- **Heights (land):** from **-2,526 m** (px 891, 196, a trench floor) to **8,182 m** (px 843, 39, the outer rim).
  Percentiles p5 -1,014, p25 239, median 2,001, p75 3,915, p95 5,066. Pressure 1.6 atm x e^(-h/8 km): p5 0.85,
  median 1.25, p95 1.82 atm; the trench floors 1.9 to 2.1 atm (the abyss cough), the ring crests 1.2 to 1.35.
- **Water:** 8,732 px (34,900 km²) of lakes, nearly all in the trenches (below).

### The corona: a bull's-eye of rings

The model's generator drew Korona as concentric rings round a central trench country at px (814, 189): **three ring
ridges** at roughly 50, 110 and 200 km from the centre, with **trenches between them** down to the format's floor
(-2,600 m), then the rise onto the high plateaus beyond 220 km. Read along the spokes (4 km steps):

| spoke | crest 1 | trench | crest 2 | trench | crest 3 |
|---|---|---|---|---|---|
| east | 20-28 km, 1,574 m | 48-100 km, water to -2,489 m | 120-140 km, 1,834 m | 148-172 km, water to -2,399 m | 220-236 km, 1,631 m |
| north | 32-44 km, 1,725 m | 52-84 km, -1,539 m | 92-116 km, 1,949 m | 124-200 km, -1,232 m | beyond 216 km the plateau: 3,000 to 4,700 m |
| west | 52-64 km, 1,675 m | 72-92 km, water to -2,215 m | 108-124 km, 1,729 m | 136-176 km, water to -1,898 m | 196-212 km, 2,031 m |
| south | 8-20 km, 1,480 m | 36-84 km, water to -2,600 m | no ring: a floor at -700 to -1,250 m (100-130 km) | 136-156 km, water to -2,038 m | 184-204 km, 2,470 m, then the Inner Wall to 4,500 m |

- **Relief:** within 12 km (a 3 x 3 cell window) the median relief is **575 m** and the 95th percentile **2,374 m**;
  82% of the cells have more than 300 m within 12 km and 48% more than 600 m. The neighbours for comparison: n highlands
  341 m median, NW lowlands 240, n semiarid 240, the hyperjungle 225. Korona is the roughest ground on the map that
  is not a mountain range.
- **The trenches:** 34,800 km² of ground and water below -1,200 m, in six troughs between the rings (bbox x 710 to 928,
  y 104 to 352). The main one, **18,100 km² with 11,800 km² of water** (px 758 to 866, 150 to 237), holds the lake at
  **-2,100 m** (9,200 km², class WX, abyssal salt lake); the others hold lakes at -2,018 m (907, 201; 3,400 km²),
  -1,890 m (846, 187), -1,300 m (739, 119), -1,290 m (899, 163), -1,780 m (744, 186), -1,618 m (802, 260). All are
  **endorheic salt lakes** (`DATA.basins`: salt lake, surplus 0), fed by Korona's own streams. Their air is 1.9 to 2.1
  atm, the annual mean 35 to 40 °C, the extremes to 48 °C: an abyss, the eastern abyss's twin, but ringed by walls
  instead of a shelf.
- **A cell cannot hold a tepui.** A tepui is 10 to 30 km across and 1 km tall: three to eight pixels. What the model
  holds is the ring ridges (crests 1,500 to 2,600 m, flat on top over 8 to 16 km, falling 2,000 to 4,300 m into the
  trench within 12 km) and the table-shaped massifs along them; the open world carves the tepuis, their vertical walls
  and the gorges between them inside those crests (`openworld/little-demo/src/41-world-fields.js` already gives Korona
  the terraced style, "terraces where the relief allows mesas").

### Three Koronas: rain and climate

Rain over the land: p5 31 mm, median **235 mm**, p75 690, p95 2,258, max 4,000 (the raster's ceiling). 72% of the land
takes under 600 mm. The wind is from the north-west, and **each ring wrings it out**: a ring's windward (west and
north-west) face takes 3,500 to 4,000 mm and its lee (east) face 200 to 300 mm, within 20 to 40 km. That is the
kaleidoscope: across the table at px (813 to 823, 192) the classes run Af, Af, Af, Cwa, Cwa, Cfa, BSh, BWh, BWh, BWh
over 40 km, the rain 4,000 to 219 mm.

1. **The wet middle (the kit's ground): 87,200 km², 22% of the land** (rain >= 800 mm; bbox x 625 to 1011, y 67 to 352,
   centroid 786, 188). Heights p5 -1,361, median 241, p95 2,576 m; rain median 1,443 (p75 2,152, p95 3,764); annual mean
   26 °C; 1.55 atm median. Its classes: **Cfa 42%** (37,000 km², median 1,329 m, 1,490 mm), **Aw 19%** (-425 m),
   **Af 17%** (-262 m, 2,384 mm), **Am 9%**, **XA 5%** (hypertropic jungle in the trenches, -1,425 m), XV 3%, **Cwa 1.4%**
   (1,200 km² at ~1,540 m with 3,900 mm: the windward faces of the inner rings, px 657 to 993, 123 to 237). By height:
   -1,500 to 0 m 32,700 km² (Aw, Af, Am, XA, mean 28 to 31 °C), 0 to 1,500 m 33,800 km² (Cfa, Af, Csa, Cwa, 21 to 26 °C),
   1,500 to 3,000 m 15,700 km² (Cfa, Cwa, Dfb, 16 to 19 °C), above 3,000 m 2,200 km² (Cfb, Cwb, 9 °C).
2. **The dry rings.** The lee faces, the ring crests and the gorges between the rings outside the wet belt: BSh (51,900
   km², median 207 m, 454 mm, 26 °C), BWh (53,200 km², 576 m, 188 mm, 24 °C), Csa (3,100 km²), and in the trenches XS
   and XW (salt steppe and desert at -1,500 m). The dry gorge floors are the eastern desert's climate at the abyss's
   pressure.
3. **The high cold north and east: 157,900 km², 40% of the land** above 3,000 m (bbox x 628 to 1071, y 9 to 341,
   centroid 836, 146): BSk 36%, Dsc 24%, BWk 18%, Dsb 12%, Dfb 3%, ET 2%; rain median **62 mm**; annual mean 5 °C,
   winter lows to -24 °C; 0.6 to 1.0 atm. This is the outer rim's flank (the model's highland shelf and arctic zones),
   not the brief's Korona: the polygon as drawn runs up onto it. **For the owner:** either the biome polygon is cut back
   to the rings and the wet middle, or that cold desert is another kit's ground (the eastern highlands' cushion
   plateau is the same climate, `biomes/ehighlands`, "to be placed on the scale model").

Temperature over all the land: annual mean p5 0, median 17, p95 32 °C; warm month 27, cold month 7; extremes 35 and
-1 median. Wind power median 203 W/m² (5.3 m/s), p95 728: the crests are windy, the gorges still.

### Water and rivers

Thirty-one courses touch the region (11 rivers, 20 dry valleys; `DATA.rivers`, provisional names after the region):

| course | flow at the mouth | from | to |
|---|---|---|---|
| Korona / NE river | 89 m³/s, 115 km | 451 m, the western ring | **the east lobe's lake** (-60 m) at px (641, 164) |
| Korona / NE river 2 | 68 m³/s, 35 km | 303 m | the same lake at px (649, 142) |
| Korona / NE river 3 | 51 m³/s, 51 km | -6 m | a through lake at -614 m (px 695, 136) in the western trench |
| The Tiers stream | 39 m³/s, 59 km | 970 m, the eastern ring | the Tiers' lake (the audit's basin at -327 m, px 969, 206) |
| Korona / NE stream | 38 m³/s, 51 km | 164 m | the east lobe's lake at px (675, 96) |
| The Tiers stream 2 | 30 m³/s | 591 m | a through lake at 104 m (px 965, 228) |
| Korona / NE stream 2 | 24 m³/s, 105 km | 1,157 m | a salt lake at -918 m (px 701, 212) |
| Korona / NE stream 4 | 21 m³/s | -1,063 m | the southern trench's through lake at -1,619 m (px 809, 268) |
| Rīfar al-Bālm | 13 m³/s, 106 km | the south-east corner | leaves Korona at px (925, 280) into Nomad Country's lake at -1,427 m |

Every river inside the rings ends in a lake of its own trench; nothing leaves Korona but the Rīfar al-Bālm (south-east,
to the eastern desert's lake country) and the Bitir Gulusu wadi (south-west, to the crater drylands). The wet west drains
**out of Korona into the east lobe's lake**. Lakes outside the trenches: **the Tiers' lake**, drawn at 379 m over 3,440
km² (px 939 to 972, 200 to 233, Af round it; the river audit's `DATA.basins` says that, left to its water, it would stand
at -327 m over 225 km²), 2,464 km² at 1,149 m (px 989, 199, a highland lake, WH), 416 km² at -917 m (px 697, 197), and a
through lake at -5 m, 128 km² (px 700 to 705, 114 to 121, Af).

### The east lobe and its flood channel

`WORLD.md` has the 4.19 reading, "the east lobe also closes (at 369 m) and spills into Korona's trenches", and the
4.20 decision that closed it. 4.21 says:

- **The east dam's breach runs west, not east** (`DATA.floods`, "east dam breach": from px (527, 114) to (479, 82), the
  bed 762 m falling to 370 m, 0 of its 200 points inside Korona). It takes the east lobe's water to the west lobe; the
  west breach takes the west lobe's to the long-lake trough and the NW lowlands. **No flood channel enters Korona.** The
  trenches hold no flood scour; they are endorheic salt basins fed by Korona's own streams (above).
- **The ridges 4.20 raised** on the east lobe's Korona side (two, at 1,120 m) show as a band of ground at 1,050 to
  1,200 m along the 'dam 2' polygon's edge inside Korona, px 623 to 641, y 81 to 85 (the other is not a single band in
  the cells). Water from the east lobe's lake would have to rise to **1,101 m** before it reached any trench lake.
- **The east lobe's lake laps into Korona.** Settled at -59 to -64 m over 14,700 km² (px 546 to 676, 84 to 164), **3,360
  km² of it lie inside the Korona polygon**, and the 'dam 2' polygon overlaps Korona by 1,524 km². Korona's western
  rivers (89, 68 and 38 m³/s) run into it. So Korona's west edge is the east lobe's eastern shore: the lake, its Aw and
  Af lowland (px 625 to 700, 90 to 180: Glint's village is on it), then the western ring (crests 2,500 to 2,600 m at
  px 657 to 680, 124 to 164) with 3,000 to 4,000 mm on its face. For the trenches station this means the drama is
  the walls and the salt lakes, not a flood's scablands; if the owner wants the surge to have reached Korona, the
  model (the 1,120 m ridges) or the lore has to change.

### Borders

Share of Korona's polygon boundary within 12 km of each neighbouring biome polygon, with the median height of the
ground on each side within 10 km of the line:

| neighbour | share of the boundary | where | Korona side | their side | the step |
|---|---|---|---|---|---|
| sedesert | 11.7% | south-east (px 797 to 957, 259 to 347) | 2,077 m, 78 mm | 430 m, 156 mm | Korona's plateau over the eastern desert, 1,600 m: **steep** |
| n highlands | 10.6% (the polygons overlap by 1,936 km²) | west (px 599 to 635, 146 to 266) | 1,568 m, 188 mm | 2,287 m, 219 mm | 700 m **up** into the highlands, both sides dry steppe |
| dam 2 + n semiarid | 6.7% + 6.4% | north-west | 830 to 860 m | 590 to 840 m | the east lobe's lake shore: gradual |
| e badlands | 5.9% | east | 4,637 m | 4,609 m | one plateau: gradual |
| crater drylands | 4.2% | south-west | 197 m, dry | 75 m | gradual |
| NW boreal | 3.4% | north | 5,055 m | 5,145 m | the rim: nothing grows |
| hyperjungle | 1.4% | south | 524 m | -884 m | a 1,400 m drop into the jungle: **steep** |
| **NW lowlands** | **0%** | | | | **not a neighbour**: its nearest polygon point is **164 km** from Korona's boundary (at Korona px 596, 194); the n highlands' northern arm and the east lobe lie between |

So the WORLD.md adjacency "nwlowlands: ... korona" and "korona: nwlowlands, nhighlands" does not hold on the model
(`WORLD.md` said it needed checking). The nwlowlands species the brief names (bamboo, ferns, glow-willows) can still
reach Korona as **waterside species** on the east lobe's lake shore and the Af/Am lake basins, the way they grow on the
NW lowlands' own lake, rather than across a border; the nhighlands ecotone is on a **dry** border (both sides under 220
mm at 1,500 to 2,300 m), so it is the crag pine, beard lichen and the trumpets' dry forms that cross, not the moss
woods. Also on the south edge: the **Inner Crater** geographic polygon overlaps Korona by 30,400 km² (px 595 to 818,
207 to 352: the Inner Wall's crest at 3,400 m, 172 mm), so Korona's southern band is the Wall.

**Political polygons inside it:** the **Painted Men** (97% of their polygon, 53,800 km², is inside Korona's: the
southern band, px 642 to 856, 214 to 347, which matches `LORE.md` 6.5, "they sit on the Inner Wall next to Korona and
have long traded and married with its tepui tribes"); **Nomad Country** (12,300 km², the south-east); the **Beast
Riders** (900 km², the south-west corner); and the owner's geographic polygon **The Tiers** (px 875 to 1009, 118 to
287; 55,300 km², wholly inside): the eastern sector of the rings, stepping from the trench at -1,039 m to the plateau at
4,089 m (relief 768 m median within 12 km), classes Cfa 17%, BSh 16%, water 12%, BWk 11%, BWh 11%, Aw 9%.

**Settlements:** **Serai**, a city, px (654, 224), inside Korona's west at 846 m on a Csa bench (800 mm, mean 21 °C,
extremes 40 and 3, 1.44 atm), the ground falling north-east to the lake lowland at 100 m and rising south-east to
1,500 m within 16 km, 39 km north of the Painted Men's polygon: not in the lore yet. **Glint**, a village, px (628,
123), 3 km outside the polygon on the east lobe's lake shore (249 m, Aw, 988 mm).

### Candidate station sites

Read as 4 km cells; each station is a 5 km piece carved inside the cell's climate, as the Throne's are.

| station | px | the ground | rain | class, mean (extremes) | air |
|---|---|---|---|---|---|
| **the tepui** (first) | **(813 to 823, 192 to 196)** | a table ~20 x 16 km standing in the **main trench**: its top 1,300 to 1,700 m (1,480 at 813,196; 1,687 at 823,192), the salt lake at -2,100 m on its west and north within 12 km (a 3,600 m wall), the dry gorge at -1,000 to -2,000 m on its east. Windward face Af/Cwa at 3,500 to 4,000 mm, the top Cfa, the lee BSh/BWh at 220 to 560 mm | 1,160 to 1,741 on top | Cfa, 19 to 20 °C (33 / 6) | 1.30 to 1.33 atm on top, 2.1 at the lake |
| tepui, alternatives | (827, 238); (663, 144) | a 1,560 m table 10 km wide on the inner ring's south, Af at its west foot (2,700 to 3,600 mm), its lee 830 mm; the western ring's crest at 2,564 m over the east lobe's lowland (Cwa 4,000 mm on its face, BWh 190 mm behind it) | 831; 1,223 | Cfa 19 °C; Cfa 15 °C (32 / -2) | 1.32; 1.16 |
| **the pitcher hollow** (second) | **(713, 212)** | a closed hollow 32 km², floor **-668 m**, spill -466 m, the inner ring's wall rising to 2,000 m within 20 km on its east, Af/Am on its floor and Aw to the west | 2,101 (3,231 on the wall) | Af, **30 °C (45 / 16)** | **1.74 atm** |
| pitcher hollow, alternative | (653, 158) | a 16 km² hollow at 484 m under the western ring's face (crests 2,500 to 2,600 m within 12 km east), the lake lowland 15 km west | **3,231** (4,000 beside it) | Cfa, 25 °C (41 / 10) | 1.51 |
| a fertile basin | (957, 228) | **the Tiers' lake**: a closed basin in the eastern rings, its lake drawn at 379 m over 3,440 km² (the audit would settle it at -327 m over 225 km²: a lake either way), fed by the Tiers stream (39 m³/s) from the eastern ring at 970 m; Af on every shore, the beds to -650 m | 1,400 to 2,700 | Af, 28 °C (40 / 17) | 1.65 |
| fertile basin, alternative | (702, 116) | a through lake at -5 m, 128 km², Af, in the western trench, 321 m deep | 1,662 | Af, 28 °C (43 / 13) | 1.63 |
| the trenches | (784, 188) | a ring ridge at 1,600 to 1,700 m between two arms of the salt lake at -2,600 m (12 km west of the crest, 24 km east): 4,200 m of wall on each side; the crest straddles the rain line (3,607 mm at px 782, 925 at 784, 282 at 786), Cfa on the crest and BSh on the lee shoulder, the abyssal salt lake (WX, 40 °C) below | 925 on the crest | Cfa, 19 °C (32 / 6) on the crest; 40 °C at the lake | 1.30 on the crest, 2.1 at the lake |

## Building it

**Built 2026-10-19 (the owner's overnight brief): four stations.** `src/` is station 1, the tepui (`dist/korona.html`);
`stations/hollow`, `stations/basin` and `stations/trench` are the pitcher hollow, the fertile basin (the Tiers' lake) and the
trenches (`dist/korona-<name>.html`). The contract is `BIOME-API.md`, the open items `KNOWN_ISSUES.md`. The rest of this
section is the plan as written before the build; where it and the build differ, the build is the record.

### Stations, like the Throne

One kit, one `src/`, each station its own page: `python3 build.py` builds station 1 (the tepui) from `src/` as it
is; `python3 build.py --station <name>` takes `stations/<name>/station.json` (`out`, extra `core` files, other kits'
fragments and `packs`, `atmos`) and that station's own host fragments over `src/`'s of the same name, as
`biomes/throne/build.py` does. Order: **the tepui**, then **the pitcher hollow**, later **a fertile basin** (the Tiers'
lake) and **the trenches** (the ridge between the salt lake's arms). The kit starts on the shared core (`CORE_BIOME` in
`build.py`, `core/biome/`), on `core/host` for its shell, with `core/atmos` for the air and the lakes' wave field.

### The ground

- **The stage is carved, not sampled.** A station's 5 km is three pixels of the model: the model gives the setting (the
  table's height, the trench's floor, which way the wind and the rain come), and the kit's land fragment builds the
  landform inside it as the Throne's stations do (`47-host-land.js`): the table's top and its walls, the gorge, the
  hollow's rim. `KRELIEF.range` (`core/terrain/38-core-relief.js`) for the ring ridges on the horizon and the gorge's
  walls; **carve patches** (`core/terrain/36-core-carve.js`, `CORE_TERRAIN` in `build.py`) for the overhangs: the
  undercut under a tepui's rim where the carvings are, alcoves in the gorge walls, the lip over a pitcher hollow.
- **A tepui is a heightfield with overhangs**, not a mesh: a flat top (a pavement of bare rock with bogs in its hollows),
  walls near vertical over most of their height (the heightfield can hold a 1:4 slope; the carve patches put the rock
  back over the recesses), a talus apron into the gorge. Every tribe's tepui is one record (its outline, top, seed) so
  the open world can place many from the model's ring crests.
- **Height bands of the first station:** the top at ~1,500 m (Cfa, 1.3 atm, 1,200 to 1,700 mm, the cloud sitting on
  it most mornings), the walls 1,500 to 0 m, the gorge floor at -500 to -1,000 m (Af, 1.7 to 1.8 atm, 2,000 to 4,000 mm),
  the salt lake out of reach at -2,100 m on the horizon. The wet face and the dry lee of the same table are both in
  the station: the kit's `wet` field is the model's rain made local (windward 1, lee 0.1 over 5 km), not a constant.

### The fields and the rule

- **`poor` is a field the kit derives**, as nhighlands derives `cold` and `rock` (`biomes/nhighlands/BIOME-API.md`):
  `poor = clamp(rock * a + wet * b + slope * c - rich)`, where `rock` is bare pavement and talus, `wet` is standing
  water and seepage (the tepui's bogs, the hollow's floor: leached, acid, no nitrogen), `slope` the walls, and `rich`
  the alluvium of the gorge bottoms, the lake basins' silt and the hollows' deltas. Thresholds are the kit's data
  (`[G data]`), tuned on the first two stations.
- **Carnivory follows `poor`.** The trap species are placed by `poor` x `wet`: sundews and butterworts on the thin
  side; pitchers waist-high where poor and wet meet; the man-eaters (a pitcher a man falls into, the snare flower,
  the trap pad on the pools) only where both are near 1 and the ground is warm (the gorge floor and the hollow).
  Where `poor` is low the herbs and reagents take over: each microclimate its own herb, drawn with `kits/crops`
  (`CROPS.at` on warmth, air pressure and aridity; the reagent, spice, herb and dye buckets) so a hollow's plant list
  follows its climate and not a hand list.
- **Every trap carries a hazard tag** in `core/tags` before it is drawn: a record with the species, its size class and
  what it does (holds, digests, poisons, snares), so the inspector, the fauna kit and later the game read danger from
  the records and not from the mesh. `KTAGS.VOCAB` has no hazard key yet (`core/tags/52-core-tags-vocab.js`): the kit
  proposes one (`core/tags/PROPOSAL.md`'s procedure), and the Throne's CO2 hollows, the mat and the natives' punji
  pits take the same key when it exists.

### The life

- **The tepui top:** bare dark pavement, pools and sphagnum bogs (`ground.sphagnum`), sundew lawns, bromeliad tanks on
  the rock, stunted trees in the cracks, the cloud forest's moss where the mist sits (the Throne's elfin woods are the
  nearest built species). Herbs and reagents in the sheltered hollows (the rare side of the brief).
- **The walls:** staghorn ferns and the carnivorous moss curtains (`card.staghorn`, `card.moss.carnivorous`) on the wet
  face, bare on the lee; the tribes' contour carvings along the guide lines (a record kind of its own, culture the
  tepui's tribe, read by the inspector as the Hum it carries); the undercut's ledges where they live.
- **The gorge floor and the hollow (the hell):** the giant pitchers, the snare flowers (`card.flower.carnivorous`), the
  trap pads on the black pools (`card.giantpad`), the nine carnivores of `card.carnivore.plants` at every size; a
  rainforest above them (Af at 1.7 atm: the hyperjungle's shorter cousins, as the Throne's windward jungle is); fungi
  and glow where it is dim (the trenches get the giant's light at night and little sun by day under their walls).
- **The lee:** the dry rings' steppe and desert: the eastern desert's Socotran palette (`biomes/sedesert`) is the right
  neighbour for it, and the sedesert border is Korona's longest.
- **The ecotones:** the nhighlands' crag pine, beard lichen and the trumpets on the western crest (dry, 1,500 to 2,600
  m); bamboo, ferns and glow-willows on the lake shores and the fertile basins (the nwlowlands kit's shore and bamboo
  zones, read in place as the kipuka station reads the hyperjungle).
- **People and fauna:** the tepui tribes (human and therian; `core/charactermodels` peoples when they are named), the
  Painted Men's trails on the southern rings, Serai in the west. Flyers between the tables; whatever the man-eaters
  eat. Fauna goes to `kits/fauna` (`biomes/README.md`).

### Textures

Six sets are in the library (the brief). Gaps to ask the owner for when the kit starts (`core/materials/PLAN.md`,
"Prompts for generated sources"; add them to `core/materials/PROMPTS-NEEDED.md` then, not now): the tepui's rock (dark wet sandstone
pavement and its streaked walls), a giant pitcher card (the man-eater, open and closed), a sundew lawn ground, the
gorge's black pool surface. Do not paper over them with procedural stand-ins without saying so.

### Air and sky

The pressure preset of `core/atmos` takes the station's height: 1.3 atm on the table (near Earth-like light), 1.7 to
2.1 in the gorges and trenches (the dense-air look: yellow sun, blue fill, haze, mirage over the salt). The giant in
the north-east at 25°, as nhighlands and eastabyss draw it; night in the gorges is giantshine.

### For Godot

Plain data rules: `poor` and the trap thresholds as functions of the core's fields on records; placement seeded by
cell from `core/rand` (`KRAND.hash` of world, cell, index, salt); every trap and every carving a tagged record; the
tepuis as records the open world places on the model's ring crests. The model's `extract_region.py` cut for Korona
(the region is already inside 'little demo' and 'big demo') is what the open world will read.
