# nhighlands: more stations (plan, 2026-10-23)

The kit draws the Inner Wall's north-western flank as **wet** old-growth forest rising to boreal. The polygon (`n
highlands`, 198,000 km² on 4.21) is mostly **dry in summer**: that forest fits only its wet face. Three stations add
what the map holds and the kit does not draw. The page as built stays station 1. Stations follow the Throne's and
Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: plan, awaiting the owner.**

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
