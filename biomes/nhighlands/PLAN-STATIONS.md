# nhighlands: more stations (plan, 2026-10-23)

The kit draws the Inner Wall's north-western flank as **wet** old-growth forest rising to boreal. The polygon (`n
highlands`, 198,000 km² on 4.21) is mostly **dry in summer**: that forest fits only its wet face. Three stations add
what the map holds and the kit does not draw. The page as built stays station 1. Stations follow the Throne's and
Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status (2026-11-09):** all four stations are built: 5 (the bog country, `--station bogs`, pair 7) and 2-4 (`--station montane`, `foothills`, `alpine`). "Core adoption (pair 7)" at the end says what station 1 took; each station's "as built" section what it is.

## The ground (surveyed 2026-10-23)

| Climate | km² | Height | Rain | Mean (warm/cold) | Drawn today? |
|---|---|---|---|---|---|
| Cfa | 22k | ~2.3 km | ~2,400 mm | +15 (25/5) | yes: the old growth |
| Dfb | 19k | ~3.0 km | ~1,000 mm | +11 (24/-2) | yes: the boreal rise |
| **Dsb** | **49k** | ~3.4 km | ~500 mm | +8 (20/-4) | no |
| **Csb** | **20k** | ~3.3 km | ~800 mm | +9 (19/-2) | no |
| **Csa** | **16k** | ~1.9 km | ~690 mm | +16 (26/6) | no |
| Dsc | 26k | ~4.7 km | ~330 mm | 0 (13/-13) | krummholz only |
| ET | 20k | ~5.6 km | ~330 mm | -5 (7/-18) | no |

## Station 2: the dry-summer montane forest (Dsb, Csb)

The Sierra Nevada's west slope and the Cascades' east side: **open forest of big pines and firs over a grassy floor**,
fire-kept and park-like; giant red-barked trees in the moister draws (the sequoia's role, Krator's own), black oaks and
meadows with corn lilies; granite domes and slabs. A fire mosaic would suit (crater-drylands has a fire model to read).
The kit's trumpet trees and lantern pods appear thinned, as the wet forest's reach.

## Station 3: the Mediterranean foothills (Csa)

Oak woodland and savanna on golden summer grass, chaparral on the steep south-facing slopes (northern aspect here is
the sunny one: Krator is near 40°S), a creek lined with sycamore and alder. `biomes/swlowlands`' sprawl oaks and
cork grove read in place for the oaks; the chaparral is this kit's own.

## Station 4: the alpine (Dsc, ET)

Whitebark- and bristlecone-like pines at the tree line (ebadlands' bristlecones read in place, or the kit's own),
then fell-field, talus, snowbeds and a tarn under the summit ridges.

## Station 5: the bog country (asked for by the owner, 2026-11-02)

Krator has bogs as corners of stations (the eastern highlands' cushion bog, the southern highlands' paramo bogs) and no
bog country. The model's flattest wet cold ground in this polygon (scale model 5.1, surveyed 2026-11-02: cold classes, over
500 mm, slope under 2.5%) is one plateau: **9,700 km2 round px 543,780** at 3,300 m, 1.06 atm, 894 mm, +8 degC (20/-4),
Dsb with Cfb and Dfb corners, 42 km from the ruin of **Footfall** (px 560,767), behind the Inner Wall's wet face. No lake
on the model there (its 2 km cells hold none under 4 km2), which is right for a mire: the water is in the ground.

- **What it is**: a high **fen and raised-bog country** on the plateau's flats, fed less by its rain (a dry-summer class)
  than by the snowmelt and seepage off the crest above and the old growth's wet face below, as the Sierra's and the
  Altai's high meadows are: sphagnum and sedge lawns, raised bogs with their domed centres and pool-and-ridge patterns
  (`KFROST`'s polygons as the pattern's form, the pools `WATER.still`), string bogs on the gentle slopes, black peat
  faces where the streams cut them, dwarf birch and krummholz on the hummocks, the kit's great trumpets standing alone in
  the fen with their held water, bell-bulbs glowing over the pools at night; cottongrass (`card.cottongrass`), cloudberry
  (`card.cloudberry`) and sphagnum (`ground.sphagnum`) are in the library already.
- **Hazard and reward**: the mire itself (`core/hazard` `sink`, by `move`: a walker slows and sinks off the hummocks;
  quaking ground over the pools, `trigger: weight`), the fog (height fog pooling on the flats at dawn), the cold at night;
  **peat** as the Republic's and the Clansmen's fuel and the bog's preserved things (*proposed*: bog finds, Ancient and
  older, as the peat's salvage, with the Catch's dry salvage and the Deeps' dead water as its cousins), bog iron for the
  Clansmen's smiths (`kits/resources` `iron` is already highest on basin margins), the kit's trumpet water.
- **People**: the Iron Republic's north and the Rustic Clansmen's country meet here (`LORE.md` 6.3, 6.4); Footfall's ruin
  on its edge; a peat-cutters' camp as a published site.
- **Core**: `WATER.still` for the pools and `WATER.wet` for the lawns, `KFROST` for the pattern, `KGROUND` a `peat` layer
  (`ground.peat.black` is in the library), the season (the pools frozen in winter: the `ice` kind of `ext/54`), the kit's
  own species in their wet habit; nothing new.

## Order

N0 sites chosen from the model, texture prompts; N1 station 2 (the largest gap); N2 station 3; N3 station 4; each
verified and baselined. **N4** (2026-11-02): station 5, the bog country, on the Footfall plateau; its `peat` layer and
`sink` hazard; verified and baselined. Note: Roketstad reads this kit with the new flora gated off; stations do not change
station 1.

## Station 5, as built (pair 7, 2026-11-03): `python3 build.py --station bogs` -> `dist/nhighlands-bogs.html`

`stations/bogs/`: its own stage (`45`), plants and passes (`62`), ground hooks (`83`), build (`88`), sky (`89`), water (`89w`) and views and checks
(`98`); `station.json` drops station 1's tower, pillars and the Cut's natives and adds `core/water` ext/53-53b (`WATER.drawPools`) and `core/hazard`.
- **The land** (4.8 km square, the kit's page scale: the bench at ~800 m as station 1's boreal band, the crest's rise past the SE edge and the wet face's
  fall past the NW meeting station 1's ramp at s = +-4900 for the far country): three raised bogs (Ingram domes 4.4-6.2 m over 1-1.5 km), string fen on
  the SE rise (peat strings along the contours, flarks between), four mineral knolls where the wood stands, a peat stream cut 1.8-3 m into the peat with
  black hags, no falls, and about 390 pools: concentric pool-and-ridge rows on the domes' flanks, flarks in the string fen, the dubh lochan on the big
  dome's crown. Every form is a plain record seeded from `KRAND` by index (`DOMES`, `KNOLLS`, `BOG_POOLS`).
- **The geology**: the bake (`kits/resources/data/geology.json`) puts the plateau on sedimentary ground, not the wall's impact province, so it has no
  megabreccia (`STATION_BRECCIA=false`); the steep is cut peat.
- **The forest** (`NHL.STATION_PASSES`, a hook the kit's pass offers; station 1 sets none): the kit's own species. Spruce, fir, larch and birch close on
  the knolls; birch and larch in the lagg; on the open mire stunted spruce (at most 6.5 m), tamarack-like larch (7.5 m), knee-high dwarf birch and a few
  krummholz spruce on the domes' crowns; the great trumpets alone in the fen. A field `bog` (1 on the open mire) drives it.
- **The floor** (`NHL.STATION_PLANT`, the same kind of hook in the floor's pass): sphagnum hummocks (the moss cushion in sphagnum's red, ochre and green)
  with heath and lichen on their tops, cotton-grass lawns, cloudberry, sedge, corn lilies in the lagg; the kit's montane and boreal floors on the knolls.
  New items `cotton`, `cloudberry`, `cornlily` on the library's `card.cottongrass`, `card.cloudberry` and `card.cornlily` (packed into this page only:
  `station.json` "families").
- **The ground**: `ground.sphagnum` on the open mire, `ground.peat.black` on the hags and the pools' lips, the kit's meadow in the lagg (three KGROUND
  layers, as station 1 has), a sphagnum paint over the kit's (`STATION_PAINT`).
- **The water**: the pools as one mesh (`WATER.drawPools`: each at its own level, 0.15-0.4 m under the peat round it, peat-black), the peat stream a slow
  tea-black ribbon, its head pool; the reflections switch on the dubh lochan.
- **The hazards** (core/hazard records on core/tags, registered before the bake): each raised bog `sink` (danger .35, slows a walker, by weight), each
  pool over 9 m a quaking `sink` edge (danger .6), the dubh lochan `drown`.
- **Not done here** (the plan's list): `KFROST`'s polygons as the pool pattern (the pools are their own records), the season's ice on the pools (`ext/54`),
  peat-cutters' camp, bog finds, bog iron. The look is the owner's to judge.

## Core adoption (pair 7, 2026-11-03)

`BACKPORT.md` section 1 and nhighlands' row, as taken by station 1 (the page as built) and, where it has the feature, station 5:
- **Build**: `build.py` on the shared lists (oidong's shape): `--station`, `station.json` ("drop", "core", "families"), every page written with `newline='\n'`.
- **Limb joints**: `BIO.flareJoin` (`31j`) in `limb()` and the crag pine's limbs; stems from the ground (`join:false`) keep their plain foot. No random draw.
- **The crater wall's rock** (`kits/resources/ROCK-PROPOSAL.md`, "Where the biomes must change" 1): the geology bake puts this flank in the `impact`
  province, so the crag pillars draw KSTRATA's `megabreccia` recipe (swhighlands' `crest`; `86-host-pillars.js`, `35` and `35z` in `build.py`) and the
  ground's steep faces KGROUND's `clast` kind in the same rocks (`84-host-ground.js`: no texture unit, where the strata shader's five would not fit with
  the shadows). `?strata=0` gives the old granite on both.
- **Shadows**: `KSHADOW` (`89zz-host-shadow.js`), decided by the ground's texture units (11 used under SwiftShader: room on the Arc's 16). Cost not
  measured here (no GPU in this session): `KNOWN_ISSUES.md`. `?shadow=0` off.
- **Reflections**: `WATER.mirrorSwitch` on the tarn (station 5: the dubh lochan), off at load. The tarn is a `drawStill`, so the "no breakers on still
  water" rule has nothing to change.
- **The water as fields**: `WATER.fields` baked at 8 m before the first tree (`88`); the trees keep off the drawn water by its own shore (`NHL.SHORE`,
  tested before any draw), and the host check `WATER.edgeAudit` reads the same field. The ground's wet band is the paint's banks and R9's rain, not a
  water field, so its rules are not run (`KNOWN_ISSUES.md`).
- **Cards**: `check_cells.py --fix` (14 faults the old pack hid: beard, drape, spray `base: top`; fern, lady `base: bottom`; fin; the clump crowns' stems),
  then `pack.py`.
- **Held foliage** (the attach audit): beard lichen from the arm's drawn rod, not its tip; the arms' rods to 80% of an arm over 4 m and on arms from 1.4 m;
  the candelabra's and the curtains' sprays on their rods; birch rods at mid range; the willow's, gnarl's and serpentwood's mid-range leaves on the rods
  drawn; the great trumpet's bulbs hung from the funnel's underside.
- **Instance caps**: `needle` (700k) and `frond` (650k) declared with their reasons (the 32 M budget the owner set).
- **Kept as it was**: KGROUND (three library layers), KHORIZON, KFAR, the shared sky, height fog, the rain cover, R9, the impostors (`BIO.impostorLook`
  gain 3.6), `BIO.INDEX_ITEMS`, the LOD merge, fade and cull. **Dropped**: `KHOOK.warp` (nothing here bends), a fog belt on the crest band (the height
  fog's cloud band at 1950-2100 m already is one), seasons (no deciduous drop is drawn yet: a later pass), ice on the tarn in frozen weather (`ext/54`,
  a later pass).
- **The new flora stays off for Roketstad**: `NHL.build` passes `{flora:true}` itself; `NHL.buildTrees` called by a world still places none of it.

## Stations 2-4, as built (2026-11-09)

**One land for three** (`stations/montane/45-host-stage.js`): station 1's contract (the s/t axes, scarps, stream and its falls, tarn, the kit's fields) built
from a `SITE` record in each station's `44z-host-site.js`: the ramp and the far country past the map (`STATION_FAR_RAMP`, a hook in `82-host-sky.js`), relief,
domes, knolls, scarps, the stream and the tarn, the climate in the kit's terms (`cold`, `wet`, `rock`, `mist`) and the station's own fields, the LOD spine,
the sky's place. Stations 3 and 4 name `montane` as their `base` (station.json; `build.py` takes a base's fragments and settings first) and replace its
`44z`, `62-biome-nhighlands-station.js`, `83-host-station-ground.js` and `98-host-station-take.js` with their own. Each places its own forest and floor through
the kit's hooks (`NHL.STATION_PASSES`, `NHL.STATION_PLANT`) and paints its own ground (`STATION_PAINT`, `STATION_GL`, three or four KGROUND layers from the
library, packed into its page only). Sites from scale model 5.1's climate raster (the densest ground of each class near the plateau) and the geology bake.

| Station | Site (5.1 px) | Rock (geology bake) | Built |
|---|---|---|---|
| 2 `montane` (Dsb, Csb) | 610,710, a few km from Roketstad | sedimentary | open park of **copper pines** and **white firs** over golden bunchgrass, **ember giants** (the sequoia's role) in the moist draws, **black oaks** low and at the meadows' edges, meadows of corn lilies, old burns (snags, fireweed), sandstone domes and a step the creek falls over, a meadow pond; the kit's trumpets thinned into the draws |
| 3 `foothills` (Csa) | 590,630 | sedimentary | golden annual grass under **swlowlands' oaks read in place** (sprawl oak on the savanna, coast oak on the shaded slopes, a cork grove), chaparral of **manzanita** and **madrone** (swlowlands') and the kit's dark shrubs on the steep sunny slopes, a creek of **sycamore** (swlowlands') and the kit's alder and willow, a stock pond |
| 4 `alpine` (Dsc, ET) | 610,810 | impact (the crater wall) | a cirque tarn under a **megabreccia** headwall (KGROUND `clast` with `rock.megabreccia`), a lower step the outflow falls over, **whitebark** and **foxtail pines** at the tree line, larch and frost fir below it, krummholz above, fell-field, talus under the steps, snowbeds in the shaded hollows |

**New species** (appended to `NHL.SPECIES`, 31-36, every key and index before them kept; `S.station` names the station that places each, station 1's
every-species check leaves them out): `copperpine`, `embergiant`, `whitefir`, `blackoak` (station 2: **the trees nsemiarid's station `high` takes kin of**, its
PLAN-STATIONS.md), `whitebark`, `foxtail` (station 4). All on the kit's existing builders (conifer, broad, pine) and barks.

**Decisions for the owner:** the plan's granite domes are **sandstone** on the 5.1 geology (station 2 is sedimentary); station 3's oaks are swlowlands' own
species, grown in place, not cousins; no `KFIRE` (the plan's fire mosaic: the burns are a field of snags and fireweed, not a fire model); station 4's
bristlecone role is the kit's own foxtail pine, not ebadlands' bristlecone read in place.
