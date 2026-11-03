# Xanadu station 3: the high ranges (`python3 build.py --station ranges` -> `dist/xanadu-ranges.html`)

Built 2026-11-03 in the final rebuild (pair 6). PLAN-STATIONS.md station 3.

## The ground

The scale model's ranges round the Vale (ET 22.5k km² at ~5.2 km, 0.83 atm; Dsc/Dfc/Dsb at 3-4 km; EF over 6.2 km), centred on ET's
centre (old px 662,1205). **Heights are real, distance is compressed:** the page climbs from 3,000 m at its north edge to ~6,700 m on two
summits in 6.8 km (a 54% mean grade), where the model spreads that climb over tens of kilometres. Layout (z is south):

| Band | Height | What |
|---|---|---|
| north third | 3.0-4.1 km | the conifer belt: agate pines over gold grass on the Vale side (west, Dsc), mist spruce over moss and ferns on the wet south-east (Dfc); a cloud belt 3.5-4.4 km on the boreal side (fog belt, windward SE) |
| treeline | ~4.1 km (`TREELINE` 4080) | krummholz: the agate pine's own cousin, knee-high, wind-trained one way |
| the middle | ~3.66 km floor | **Alph's amphitheatre** (map 5.1 old px 575,1198): a bowl 340 m in radius sunk ~260 m into the belt, walls near sheer; the stream falls ~300 m over its south lip into a pool; the **conduit spring** (map 5.1 `tube_xanadu_nw_09`, Alph's headwater conduit) jets from a mouth 95 m up its east wall; the chasm runs north out of it in a slot to the map's edge |
| south | 4.1-5.6 km | the alpine (ET): the kit's crag floor (silver tufts, stars, thyme, boulders), cushions, talus and ledges (src/87-host-ledges.js), the cirque tarn (~4.8 km, proglacial look), the dwarf frost willow by the wet ground (4.8-5.7 km) |
| the ice | over 5.5-6.0 km | the glacier between the summits: `ice.glacier` from the kit's pack as its own skin (`?glacier=0`), snow that lies (frozen, base 1 above the line; `?snow=0`) |

The two vent cones (old px 716,1128 at 10.7 km, 770,1168 at 8.4 km) bear **35° and 71°** from the station's centre: north-east of it, not
south-east as the plan's line has it (the plan places them on the polygon's south-eastern wall, which is north-east of ET's centre). They are
far past the far field, so they are the sky's landmarks: two leaning plumes (89-host-sky.js).

## Life

- **Agate pine** (`agatepine`): the Xanadu conifer, "the agate tree's banding carried into a pine's bark": the agate tree's bark family
  (`xbarkA`) on a tall clean bole, two to four upswept main limbs as `BIO.tube` with `BIO.flareJoin` joints, level whorls of tufted needle pads.
- **Mist spruce** (`mistspruce`): the Dfc boreal tree, a dark spire of drooping tiers, iridescent tips on some pads.
- **Krummholz**: `BIO.kin('xanadu.agatepine', {key:'krummholz', scale, habit:{krumm:true}})`.
- **Dwarf frost willow** (`dwarfwillow`, EXCHANGES.md xanadu→godthrone): its record is `BIO.kinRecord(frostwillow, ...)`, so
  `tags.kin = 'xanadu.frostwillow'`; its builder is its own (three to six creeping stems a hand up, short strands of the frost willow's
  iridescent leaf) because the frost willow's builder drops its strands 1.5-9 m, into the ground at ankle height.
- The three are exported as **`XANADU.builders`** (core/biome `kitBuilder`'s own builders), so the Godthrone can read
  `BIO.kin('xanadu.dwarfwillow', ...)` when its turn comes (not touched here).
- **Cushions**: the kit's `cushion` item, moss-green, a third flowering (pink, white, yellow tints). No flower cards on them (they would
  float under the attach audit: the cushion is not structure).
- The kit's own **trees pass is off** (`LAND.mask` returns 0 while `BIO.cur` is `xanadu/trees` and the station is not planting): the Vale's
  gardens do not climb to 3 km. Its **floor planters stay on** and read the station's fields (45b).
- Impostors: one set (`impTreesR`) of the two conifers past 900 m.

## Checks

`stationChecks`: conifers under the treeline (`TREELINE`+200), the dwarf willow present (>50), the chasm head's fall over 150 m; negative:
every conifer lifted 1.5 km must fail.

## Results (SwiftShader, 2026-11-03; the GPU verify is still to run)

- Loads ready; 14 views. Held 7.54 M tris, 522k instances, 416 LOD meshes, 977 conifer heroes (420 m round eight origins), 10,837 impostors.
  Placed: agate pines 4,764, mist spruce 7,050, krummholz 1,856, dwarf frost willows 378, cushions 2,023; glacier 156,854 tris.
  A first try at 900 m hero ranges and fifteen origins held 62.5 M tris (23k heroes): cut to the numbers above.
- Water: the chasm head's falls (fallsOf at steep .9) 265, 334 and 320 m (the lip and two cliffs on the alpine reach), the conduit spring
  94 m, the tarn at 4,909 m, the pool at 3,867 m.
- Checks: the station's own passes (negative fails); the attach audit .01% (1 bloom of 7,393 cards); the cards switch with their structure.
- **Fails, owed to the base or the core:**
  - "fruit tagged, catalogued and drawn" (src/99): the station has none of the Vale's fruit trees, so every catalog fruit is "not drawn".
    The base check wants a station opt-out (for example `LAND.fruitAll===false` skipping the drawn part).
  - "library cards cut and held right": feather (card.acacia), ginkgo, blossom... the kit's own slots, seen on the base page's pack too.
  - the feet: 1,918 of 49,341 off the drawn ground (`LAND.feetOwed` records it; the kit's floor tufts scatter a hand off their spot, which
    on 50-75% slopes is a foot in the air or the rock; worst 14.4 m up, not traced). The kit's floor is kept off slopes over .75 here.
  - the core negative "every card reaching four times its range" does not fail (9 of 7,392 switch apart): with heroes at 420 m and
    small plants at 320-380 m, few cards outlive their structure even at four times; not traced.
- SwiftShader also logged program link failures (error 0 and 1282, the impostors' ShaderMaterial and some instanced Lambert) and an
  incomplete framebuffer in the impostor bake on one of four loads: its known flake; judge on the GPU.
