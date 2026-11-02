# swlowlands: the great river gorge (plan, 2026-10-23)

The kit draws the Mediterranean and humid oak country (Csa 64%, Cfa 25% of its 209,000 km²) well. What it does not draw
is the water 4.21 gave the lowlands: **the great river** that leaves the SW lowlands' lake for the Ring Sea down a gorge
(about 5,700 m³/s, 200 km, cut up to 627 m deep: `tools/scale-model/README.md`, `OUTLETS`) and **the Lake of Shim** on
its course. One station; the page as built stays station 1.

**Status: plan, awaiting the owner.**

## Station 2: the gorge

The river in its gorge: a broad, fast, green river between walls up to 600 m, oak and cork woods on the rims, riparian
forest (plane trees, alders, willows, the kit's crown-flowering trees) on the benches, rapids and a gorge mouth opening on
the Ring Sea's coast. It is also the ground for **Shim** (`settlements/shim/PLAN.md`), whose lake lies on the river's
course: the station's site is chosen so Shim's build can read it.

## Station 3: the delta and the floodplain (asked for by the owner, 2026-11-02)

The great river's last 25 km on scale model 5.1 (`klir Rivrh`, r000, Vothic "clear river": 205 km, 5,744 m3/s at its mouth,
a 630,000 km2 catchment, 340 m wide and 9 m deep). Surveyed 2026-11-02:

| Reach | 5.1 px | Height | Class, rain | What it is |
|---|---|---|---|---|
| **The floodplain bench** | ~692,1042 to 695,1041 (6 km of nearly level valley) | -16 to -27 m | Aw/Cfa/Csa, 830-1,050 mm | the one flat reach of the whole gorge, where the river slows before its last fall; **Wing** (ruined arcology, px 699,1042) stands on it |
| **The last descent** | 695,1039 to 699,1025 | -95 m to -782 m in 14 km | Aw to Am, 1,050-1,400 mm | the gorge's lower cataracts, the swbay kit's "stepped cataracts" habit |
| **The mouth** (`to: Ring Sea, at_px 700.6,1023`) | the Ring Sea's southern arm 12 km north-east, water at -1,326 m (XA) | the coast falls -782 to -1,500 m in about 15 km | | a **fan delta** (a Gilbert-type delta into a steep-sided basin, the Rhone's into Lake Geneva): a steep-fronted fan of the gorge's gravel and the lowlands' silt built out into the sea's arm, its top at the sea's level, channels braiding across it, the drop-off beyond |

- **The delta**: braided distributaries across a fan 5-10 km wide at the sea's level, gravel bars, backswamps and oxbow
  lakes on the fan's wings, riparian forest (the kit's crown-flowering trees, planes, alders, willows) on the levees, reed
  and papyrus-like beds (`eastabyss`'s mat reed read in place) in the backswamps, a sand spit and a lagoon where the sea's
  swell meets the river; the hyperjungle's shore (XA, read in place) closing in on both sides at 1.9 atm.
- **The floodplain** (Wing's bench): a 6 km reach of level valley at -20 m under the gorge walls, flooded each winter when
  the lowlands' frontal rains come (`climate.json`: winter frontal rain x1.6 in the west): a **seasonal flood pulse** on the
  world clock (the hyperjungle lake station's 8 m pulse is the precedent; here the pulse is the river's, a few metres over
  the bench), high water in winter, low in summer with the bench cracked and green; oxbows, point bars, flood forest on
  the levees, the swbay kit's river cataracts upstream and downstream. **Wing**'s ruin stands in the flood forest, its
  footings drowned each winter (the Vothic destroyed arcology, `LORE.md` 6.2; its own settlement plan dresses it; this
  station carves its ground and publishes its site).
- **People**: the Vothic Kingdom's (Voth 87 km, Torus 28 km); fisheries and reed-cutting on the delta; the gorge's road
  down to the coast.
- **Core**: `WATER.flow` with a seasonal level (the hyperjungle lake station's seasonal still, `biomes/hyperjungle/PLAN-STATIONS.md`
  "Core adoption", on a flow), `WATER.fall` for the last cataracts, the open sea with its shore grid (`biomes/ringisles`'s
  pattern), `KRELIEF.river` and `meander`, `KRELIEF.wadi`'s fan form turned to a delta (*proposed*: a `delta` kind: a fan
  with distributaries, levees and backswamps as records), `KGROUND` a `silt` layer, the season bound.
- **Where it sits**: the floodplain and the gorge are the swlowlands' river; the fan is in the `SW Bay` polygon. One
  station of this kit reading `biomes/swbay` in place (its cataracts, its hyper-mangrove when wired, its bay), or two half
  stations: the owner's call. The hyperjungle's seasonal floodplain (its lake station) stays the jungle's; this is the
  great river's.

## Order

W0 site (with Shim's plan); W1 the station; verified and baselined. **W2** (2026-11-02): station 3's site on the bench at
Wing and the fan at the mouth; the `delta` relief kind if approved; the seasonal flow level; Wing's site published;
verified and baselined.
