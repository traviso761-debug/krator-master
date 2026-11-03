# nwlowlands: the tropical lake margins (plan, 2026-10-26)

The kit draws the lowlands' sequence: a brief rainforest strip at the water, a long humid-subtropical tract, and
Mediterranean toward the hills. On the model the low ground round the lakes, under 500 m in dense, hot air, is a
**tropical savanna** country of its own, larger than the strip the kit gives it. One station adds it. The page as built
stays station 1. Stations follow the Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: station 2 built (the final rebuild, 2026-11-02; `dist/nwlowlands-margins.html`, on map 5.1, which moved this ground under 15 m).** It's an ideal type of the plan: see "As built".

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`)

`NW lowlands`: 212,016 km² (165,928 land, 46,088 water). Heights p5 / median / p95: 209 / 866 / 1,779 m.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px | Drawn today? |
|---|---|---|---|---|---|---|---|
| Csa | 107k | ~935 m | 1.42 | ~850 mm | +21 (29/13) | (211,392) | yes: the hills |
| Cfa | 28k | ~945 m | 1.42 | ~1,500 mm | +21 (29/13) | (277,365) | yes: the humid tract |
| **Aw** | **14.7k** | **~320 m** | **1.54** | **~770 mm** | **+24 (30/18)** | **(191,364)** | **no** |
| Af | 6.8k | ~290 m | 1.54 | ~2,000 mm | +25 (30/19) | (250,342) | a strip at the water |
| **Am** | **5.3k** | **~290 m** | **1.54** | **~1,650 mm** | **+24 (30/18)** | **(201,399)** | **no** |
| Dsb | 2.1k | ~3.3 km | 1.07 | ~830 mm | +8 (21/-4) | (168,514) | no |

Under 500 m: 31,352 km², ~1,330 mm, +24 °C, Aw 41%, Af 18%, Csa 16%, Am 15%, Cfa 10%.

## Station 2: the lake margins (`--station margins`)

**Earth basis:** the Pantanal and the Llanos (seasonal floodplain savanna), the Okavango's edges, the Tonle Sap's shores.

- **A seasonal floodplain savanna (Aw):** tall grass on the flats, palm groves and termite-mound islands, gallery forest
  along the channels into the lakes. The lakes' level rises in the wet season and floods the flats (`core/water`'s
  seasonal level, the várzea mechanism of the hyperjungle plan).
- **Monsoon forest (Am)** on the slightly higher, wetter ground near (201,399): semi-deciduous, bare in the dry season.
- **The rainforest strip (Af)** stays at the water where the kit already draws it, now as the gallery's wettest end.
- **The flora:** the lowlands' own species, kept and pushed toward the tropics. The kit's ghost gums and the sky bamboo
  (`BIO.bamboo`) reach in from the humid tract. A few new floodplain species: a palm, a flood-tolerant fig, floating
  meadows (`core/water`'s weed kind).
- **Fire** on the dry flats (`KFIRE`), and termite-like mounds (`KSTACKS` mound kind).

**The core:** seasons (`core/clock`: leaf drop, the flood level, grass colour), `KFIRE`, mounds, water ext (weed, the
seasonal level), reach and kin (the flora exchanges). The universal set as in `BACKPORT.md`.

**Not a station:** the 2,068 km² of Dsb at (168,514) is the Inner Wall's foot. It belongs to nhighlands' or nsemiarid's
high-country stations, read in place if a world needs it here.

## As built (2026-11-02)

`stations/margins/`: `44z` (the map and fields, read by `45` as `MG`), `85` (no tower), `87` (its life). The flood is `89w`'s, the burn `86`'s.
Built: the floodplain, gallery, Af strip, a monsoon rise, 339-odd termite mounds, a `KFIRE` burn mosaic, the seasonal flood (-.35 to +.95 m, 60 days behind the rains), tall grass, floating meadows.
The plan's two floodplain trees are cousins of this kit's own: the flood palm (`mistpalm`) and the flood fig (`kauri`). Weed in the shallows stayed out: `W.weed` lays along a flow line, and the flats are still water.
The kit's sea pens and aroids stand in the grass by the floor pass's `med` and `shore` planters: the owner's call at the look pass.

## Order

After the hyperjungle's várzea (its lake station), so the seasonal water level is written once.
