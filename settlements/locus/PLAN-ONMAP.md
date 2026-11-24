# Locus on its real site (W7, 2026-11-24)

The owner (2026-11-24): "go on to Locus; can we do a proper on-map rebuild while we're at it", scoped to **the page on its
real site**: Locus keeps its own town ground; round it, the scale model's real ground (the abyss wall, the lake, the far
shore) and the horizon cast from the model; the page on the shared sky at its site (W7, STAGE-8/G-weather.md). No open-world
region yet (the east-rim region, openworld/PLAN-SETTLEMENTS.md section 9, comes later). "Real terrain only" (the owner, on
Girder): nothing painted stands in for the map.

## 1. What the page does today

- Its own frame: WORLD 9000 (+-4.5 km), the water plane y = 0, the hilltop refinery at the origin, the salt lake W (shore
  x ~ -1,000), a delta SW, a river in from the E edge, an east rise of +124 m by 4.3 km (`src/10-core.js:101-150`, `:217`).
- A painted dome (`20-stage.js:124-172`): a hazy far rim at 1.7-3.1 deg, **the shelf** at ~11-13 deg E with strata, a dark
  far shore over the lake, jungle at the wall's foot, 22 painted cumulus; a silhouette mask and `skyFront` redraw the shelf
  over the sun, giant and ring (`21-sky.js:248-262`). Leftovers: Voth's volcano in the header, an eruption cycle that swaps a
  texture for itself, two moon sprites, latitude -46 and 1.8 atm in its own sky (`21-sky.js:38, 62, 71`).
- No weather binding (`STAGE-8/G-weather.md:13` is wrong to list Locus as bound).
- **Mungo reads Locus's `21-sky.js`, `82-daynight.js`, `90-atmos-host.js` and `98-start.js` by name** (its own `20-stage.js`);
  any new Locus fragment reaches it too (`settlements/mungo/build.py:6-9`).

## 2. What the model has (5.1, px 1267, 1043)

- The floor at -2,403 m, at **the lake's SE corner**: the lake runs ~20 km W and N at -2,400 m (`openworld/PLAN-SETTLEMENTS.md:200-218`).
- **The wall within 2 km E and S**: -2,402, then -1,601 m, ~-650 m at 10-20 km, the rim ~+700 m at 22-26 km. Seen from
  the town: 12.7 deg at azimuth 60, **20-38 deg from E round to S**, 0.6-1.3 deg W over the lake (a sample by far.py's method).
- XA climate, 3,827 mm, 32 C (26-38), **2.16 atm** (`settlements/ALL-BUILDS-REBUILD-PLAN.md:531`).
- No river within 20 km. The Bigga (r019) falls -1,524 -> -2,599 m into the lake ~60 km NNE; the Waita Riba (r077, "near
  Locus") ends at -793 m over the lake ~53 km SW, a 1.6 km drop the model does not draw. The scarp-foot stream
  `r_locus_delta` (ALL-BUILDS:29, :532) is proposed, not in the data.

## 3. The plan

1. **The frame on the site.** `region/far.py` (Girder's pattern) reads the model round the pin: the site record (base, air),
   the grid (2 km cells, +-60 km) and its water cells, and ridge bands from 60 to 450 km. Page y = model height + 2,400 m
   (the lake's level is the page's water plane). **Decision 1** below: where the town's ground hands over to the wall.
2. **The wall and the far shore as ground, not sky** (eastabyss's recipe, `biomes/eastabyss/src/83-host-far.js`): KFAR from
   the page's edge out to 60 km on the model's grid, blended into the page's edge height; the wall's faces coloured by slope
   (rock and strata on the steep, jungle on the benches), the lake's far water as a plane at y = 0 where the model is wet;
   KHORIZON shading the basin, so **the shelf hides the low eastern sun and the giant's lower limb** (LORE.md:73) for real.
   The ridge bands past 60 km for the far rim.
3. **The shared sky** (Girder's port): `21-sky.js` keeps the clock and `SKY_STATE`; `82-daynight.js` keeps the lamps' night
   factor and the ambient; `20-stage.js` drops the dome, the eruption cycle, the sprites, `skyFront` and the scene's
   background; `90s-host-sky.js` draws `ATMOS.sky` at the site (2.16 atm, humid), the host clock mirrors the page's, the
   lake's skylight capture moves to the shared sky's scene, and the night fill as Girder's. The page opens at 06:00.
4. **Weather** (W5): `bindWeather({climate:{wet:true}, cells:{biome:'eastabyss'}})`: the moving cells over the basin, rain
   cover, splashes (`core/atmos/README.md:509-516`). Volumes (W6) only if the draw calls allow (184 of 190 today).
5. **The air of the basin** (eastabyss's own, `src/89a-host-atmos.js:20-30`): dawn mist on the lake and the delta, the fog
   belt on the wall's foot with the wind off the lake, night drainage wind off the wall (`ATMOS.slopeWind`).
6. **The refinery in the air** (lore: the guyed flare and the heater stack, `kits/locus/NOTES.md:47-54`): the flare's and the
   stack's plumes bent downwind (`ATMOS.plumes`), heat shimmer over the stills, a glow under low cloud from the flare and the
   electric town at night (LORE.md:181: one of the two fully electrified cities).
7. **Mungo** (**decision 2**).
8. **Verify and judge**: Locus's `verify.py --assert`; before-and-after at 10:00 and 21:00 at its views plus a look E at the
   wall and W over the lake; KNOWN_ISSUES lists what the real-terrain rule removed (the painted shelf, rim, shore, clouds).

## 4. Decisions for the owner

1. **Where the town meets the wall.** The model's wall stands 2 km E and S of the pin, inside the page's flat 4.5 km.
   (a) Shift the page's frame on the map, a few km NW onto the floor, so the wall rises just past the page's edge (the
   page's ground unchanged; a frame offset in `far.py`, no model edit); (b) keep the pin and lift the page's east and south
   ground into the wall's foot (the eastRise steepened; the town's E edge changes); (c) a model edit that pushes the wall's
   foot back (an `edit_5xx`).
2. **Mungo.** (a) Move it onto the shared sky with Locus, at its own pin (1322, 828), its own cast; (b) give Mungo copies of
   the old fragments for now, a fork until its own turn.
3. **The rivers as landmarks.** The Bigga's fall (60 km NNE) is in the model; the page's own river off the wall and the
   Waita Riba's drop are model questions (a new river record, an edit). Draw only what the model has (the Bigga), or settle
   the model first?

## 5. Risks

- Draw calls: 6 to spare; the far field is 1, the shafts 1, splashes 1, volumes 4.
- The near wall at 20-38 deg is a big change to every view looking E or S: judged on the pairs.
- The life layer cannot read `weatherAt` (the boats and fishers ignore storms): a follow-up.

## 6. The owner's answers (2026-11-24)

1. **Where the town meets the wall: lift the page's edge.** The pin stays; the page's east and south ground climbs into the
   wall's foot toward its edge (the model's heights blended in over the outer band), so the town's ground meets the far field
   with no seam. The town's east edge changes; the town itself (the hill, the delta, the lake) does not.
2. **Mungo moves onto the shared sky with Locus**, at its own pin (1322, 828), with its own cast.
3. **This pass takes every addition**: the weather and the basin's air (item 4, 5), the refinery in the air (6), the Bigga's
   cataract as a landmark (the one fall the model has; the page's own river off the wall stays a model question), and the
   volumetric clouds if the draw calls allow.

**Order**: the cast (`region/far.py`, Locus and Mungo); the lifted edge; the far field; the shared sky (both pages); the
weather and the air; the refinery; the cataract; the volumes; verify and the pairs. A commit at each step.
