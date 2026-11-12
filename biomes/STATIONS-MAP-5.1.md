# Biome stations against scale model 5.1

Checked 2026-11-01 against `gemini-loom-chasms` at cc6dd36e0, comparing the 4.23 data (the model before Gemini's edits) with 5.1.
Every px here is on the **old canvas** (1549x1393); add (272, 330) for the 5.1 canvas.

**What was checked.** 144 stations, built and planned. 83 have a px: each was sampled for elevation, climate class, rain, mean
temperature, water, 30 km relief, nearest vent and nearest lava tube. 47 of those are reliable. In the other 36 the px is a
class centre or a proposal and disagrees with the station's own stated elevation by over 300 m, so a point sample proves nothing.
Those 36 and the 61 with no px were read against Gemini's landform docstrings instead.

**Result: most stations need nothing.** Gemini sculpted from the plans, so 5.1 mostly supplies what the plans asked for. Six places
need work, and four more need small checks. Godthrone is better off.

## Needs work

| Station | Status | Old -> 5.1 | What to do |
|---|---|---|---|
| **Godstep, all stations** | planned; station 1 is next after the gallery | Head vent 4,973 -> 2,700 m, ET -> Dsc, rain 47 -> 110 mm, mean -3 -> +12 °C. The valley is now four ponded flood-lava steps (2,700, 2,000, 1,300, 600 m) | Rewrite `biomes/godstep/PLAN.md` on 5.1 before building. The cold dry head it describes is gone, so flora and hazards change with it |
| **Throne 3, the spice frontier** | built | Zey'danin's site -488 -> -1,180 m, now half harbour; Af -> XA, rain 4,000 -> 2,525 mm, +27 -> +32 °C | Re-survey: the harbour matches the station's premise, but the terraces' elevation band and the rain differ. Take it in pair 5 |
| **Abyssal savannah 1, the rim slope** | built | At px 1021,350: -179 -> -1,063 m (Aw -> XV) | Small: the same climb is about 5 px east. Move the site to about 1026,350, then check the two risers against the rim's new benches (`e abyss`, -1,600 to -1,150 and -550 to -100 m) |
| **Outlands 5, the Nursery Plateau** | planned | At px 1269,130: 3,783 -> 1,676 m, BWk -> Cfa, rain 31 -> 1,553 mm | The dry plateau is now a wet graben floor. Re-site it on remaining BWk ground in N Outlands; the other Outlands stations are within 320 m |
| **Farside: kelp coast, front, strand** | built | +262, +247, -246 m. All stay inside their plan bands, but relief at the front rises from 6.9 to 8.2 km | Check the heights, and add the tsunami's ground and Farport's plateau (below) |
| **The Rift: highland, plateau** | built | Highland -234 m, rain 2,384 -> 1,788 mm. Cube's Plateau now has 1,200-1,600 m fault cliffs (30 km relief 1,590 -> 2,090 m). River 3's mouth -1,436 -> -1,858 m | Check the far field and the horizon; the stations themselves hold (plateau -17 m). `rift/stations/bake_far.py` needs a fresh cut |

## Small checks

- **The Cut:** the pass sill is 666 m on 5.1; the plan says 700 m. Face -164 m. Correct the numbers.
- **SW highlands:** the lake agrees (2,878 m at 278,629). The tableland around Span is 2,650 m; the plan says 2,534 m. Stations 2, 3 and 5 should take the 5.1 numbers before they are built.
- **Oidong:** rain 329 -> 188 mm and a four-step floor with a 300 m headwall. Re-survey before `passes`, and take the rain figure in pair 6.
- **ehighlands:** the divide moved west, and the east side is now a puna tableland. Re-survey before the wet face (station 2).

## No change needed, or better than before

- **Pair 4 (swlowlands, nwlowlands):** page and margins within 15 m. Nothing blocks it.
- **Godthrone:** 5.1 puts the model back on the plan. Flank 10,709 -> 11,080 m now matches the station, Pluton returns to about 9,650 m, and the closed lake returns to 6,419 m.
- **Followed the plans:** Catch (erg, yardangs, Red Canyon), Xanadu (cataract, Alph's chasm), Painted Highlands (canyon, playas), hyperjungle lands, crater drylands' salt pan (-1,285 m against a planned -1,290 m), k-guilin.
- **Within about 100 m, class unchanged:** Korona's stations, hyperjungle lake and N and savage lands, the Rift's savannah and jungle, Ring Isles, Bowl, Mantis, steppe, geyser's Steampits, cut floor. nwouterwall's taiga is +127 m, and two nwouterwall stations change class only at a boundary.

## New features

**Lava tubes** (15 in `tubes.json`). None forces a change. They give existing stations real routes:

| Tube | Use |
|---|---|
| `tube_hot_05` (Station 11 SE Plume-Edge Hot Tube) | Already names Throne's tube station: record the id |
| `tube_dhelv_01`, `_surpu_02`, `_qarnu_03`, `_nuru_04` | The Zeijani's tubes round Throne, beside the kipuka (station 2) and Dhelv |
| `tube_god_07` | The route for Godstep's `rille` |
| `tube_god_nw_11`, `_n_12`, `_se_13`, `_ssw_14` | Godthrone's pyroducts; `_nw_11` reaches the Span wall and `_n_12` the Talia saddle |
| `tube_xanadu_se_10` | Geyser's `ice` station stands on it, and it feeds the Catch oasis |
| `tube_xanadu_nw_09` | Alph's headwater conduit, for Xanadu's `ranges` |
| `tube_lesser_06` | The buried archive under Lesser Throne, for Longsong's lore |
| `tube_rift_08` | A possible new Rift station: 140 km, Zeijani and scavengers |
| `tube_ozarks_15` | Expansion territory: no action |

**Tsunami coast.** It touches Farside only among built biomes: see below.

**Rivers.** 852 of 871 rivers have new names. Stations and plans that quote a river name need `tools/scale-model/river-names-5.1.md`.

**Throne's coast.** Noa's Regret drops from -339 to -1,492 m, now 8 m above the Ring Sea. Dhelv is unchanged at -68 m. Throne's
summit stands to 10,916 m and its caldera floor rises about 440 m: check `caldera` in pair 5.

## Regions needing a re-cut

`rift/stations/bake_far.py`, `biomes/nwouterwall/region/far.py`, `kits/resources` (geology), `openworld/little-demo`,
`openworld/isle-demo`, `openworld/north-basin`, `settlements/isle-demo`, `settlements/longsong`, `settlements/pinnacle-rock`.
Do these after 5.1 is frozen.

## Farside, the tsunami and Farport

**The tsunami reaches Farside** (the owner, 2026-11-01). The kelp coast takes the scour bench, chevron ridges, backwash chutes and a saline
lagoon where its ground allows; `LORE.md` §6.19 has the line, and the date is open. The ceiling used below is about **100 m**: 5.1's bench
tops out near 65 m and its chevrons near 38 m. Gemini should state the real figure.

**Upriver does not work.** Farport stands at the mouth of Līng-Mā (1,518 m³/s). The river's bed stays at 38-53 m for its last 390 km, a
long flat trench under the crest, so the valley would carry a bore inland instead of stopping it. By Earth's example (Tōhoku's bore ran
about 50 km up the Kitakami) a safe site is 60-80 km upriver or more, deep in the Wall's gorge. That is no longer an ocean port, and the
river also stands 29 m above the sea at its mouth, so ships could not reach it.

**The plateau works, and is next door.** 184 km² of ground at about 212 m (5.1 canvas px 294,588; old canvas 22,258), 6 km from the sea
and 11 km from the present pin, slope about 3.6%, all above the ceiling. **The old city and important buildings go there.** **The harbour
stays at the water, in the wave's reach**: quays, dockyard and the traders' factory quarter (`kits/eternian`).

**Done on the map (203d69d58):** Farport stands on the plateau at 5.1 px 294,588, 212 m and 4 km from the sea, Līng-Mā grades to 0 m at its mouth, and `DATA.tsunami_farside` gives a 50 m crest and a 100 m run-up ceiling. The Farside page and the later settlement build follow.

**Rechecked on 3e35e605f (Round 2, merged):** Gemini restored the accidental moves: nwouterwall's yeti station is back at 5,647 m and Farside's front at 2,179 m. Farside's kelp coast is 725 m (548 m at review). Farport's river is now named Hōng-Mā (`r002`); this document's earlier name is Līng-Mā, because the names moved again in Round 2.

## Rechecked on Round 3 (68b6aa22b, merged)

River names are frozen (`smodel/frozen_river_names.json`), and Farport's river is Līng-Mā again. The seven valley basins read as basins, four of them dry, round a 17.4 m lake. **The southern Inner Wall scarp is on the model, and it moves shighlands:** its cloud forest page's site goes from -183 to 550 m, and ground near px 838,1036 moved up to 4.7 km. Re-survey shighlands' stations in its turn (pair 12). Up to 408 m moved near px 501,1064 in SW lowlands: unexplained in the README, and swlowlands' turn was built on Round 2.

## New kits and priorities (the owner, 2026-11-01)

**New kits needed:**

| Kit | Region | Area | Ground | Note |
|---|---|---|---|---|
| Copper Glacier | `rmvcopperglacier` | 217,000 km² | 2.4-11.2 km, median 6.2 km | The one kit in the Crook that counts as near-term |
| Siphon Pits | `rmvra9zogfm9t` | 176,000 km² | 2.0-5.3 km, median 4.4 km | `PLAN.md`, `PLAN-STATIONS.md` and 4 station records exist; no kit |
| Loom-Chasms | `rmvraoas90co7` (Region 99) | 307,000 km² | 0.3-8.2 km, median 1.8 km | `PLAN.md` and 4 station records exist; the page is a showcase, not a kit |
| The Slabfields (was Mid Basin) | `rmvmidbasin101` | 169,000 km² | 1.5-4.4 km, median 2.2 km | The transition between Siphon Pits and Loom-Chasms: Io-style tilted slabs south of the stress hinge (`biomes/slabfields/PLAN.md`) |
| High Rift | `rmvhighrift100` | 86,000 km² | 2.9-11.4 km, median 4.0 km | Five zones: no plan yet |
| NE outer wall | `ne outer wall` | | | On the map, with `biomes/neouterwall/PLAN.md`. Overlaps `arachnoid canyons` |
| Outland Gate | `outland gate` | | | Added by the owner, 2026-11-02; `biomes/outlandgate/PLAN.md` on Gemini's branch |

Elevations are the 5th to 95th percentile. These kits start from the nearest finished kit, on core, each with a `Core adoption`
section in its `PLAN.md`. Loom-Chasms' and Siphon Pits' plans use old-canvas px; Spider Lake's uses the new one.

**Lowest priority, until the old area of the map is feature-complete:** the new northern and western territory, except Copper
Glacier. Gemini may do map work there, but no biome kits and no open world are expected there for some time. That is the expansion-pack
ground, and who lives there is undecided: the Arch, the Crook, Ria Valley, the Double Delta,
Silent Vales, the Tsunami Coast, Steaming Seamounts, Arachnoid Canyons, Tharn Uplands, Neo-Ozarks, Sasquatch Tribes and Spider Lake
(`biomes/spiderlake/PLAN.md` is parked).
