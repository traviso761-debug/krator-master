# Xanadu, Oidong and the High Rift: the second region at 1:1

The second region of sites cut off the scale model into the open world (`openworld/PLAN-SITES.md`; the owner,
2026-11-10).

- **The cut:** three model regions on map 5.1, one box, cut by `tools/scale-model/cut_site.py xanadu-oidong-highrift`:
  - the Xanadu Sultanate (political);
  - the Oidong Valley and the High Rift (biomes);
  - each site's square.

  The box is 1,780 x 582 km (891 x 291 px) at 1 km cells, with 19 named rivers. The frame's origin is px 1191,1569.
  The overlays inside the region:

  | Overlay | Inside the region (px) |
  |---|---|
  | xanadu | 31,114 |
  | High Rift | 21,261 |
  | Oidong Valley | 17,607 |
  | twins | 1,424 |
  | opal valley | 1,377 |
  | godthrone | 608 |
  | rift rim S and N | 259 |
- **The sites** (`openworld/SITES.json`). Each town stays its own page's; each site plans its countryside on the world's
  ground with core/hamlet's `xanadu` row, drawn with the Xanadu building kit (`XAK`):
  - **Erehwon** (`s57bkv9741`, px 805,1516 since 2026-11-11, on the south shore of its caldera lake, scale-model edit
    5.1-512): the Sultanate's city (`settlements/xanadu`). Five farming villages along the shore and up the slopes
    south, and a ranching village 14 km out on the uplands. The city's page stands with its centre on the pin, unturned
    (its `ER_WORLD`); its island, the Pleasure Dome's, is stamped here (`src/44-world-landforms.js`).
  - **Qiblai** (`skm4jjo2vl`, px 922,1595 since 2026-11-11, moved from 963,1566 to the cataracts of Nahr ash-Shalālāt:
    by a river, near rock salt and ore; the owner's word), with no page yet: the same ring, re-planned on the new ground.
  - **Longsong** (`sq80bzd7ep`, px 1226,1626): the History Monks' monastery (`settlements/longsong`). Its three villages
    stand where its page lays them: Shar and Nub (farming) and Dzo-ling (the herders), 585 people in 110 buildings.
    Recut 2026-11-16 at its 2026-11-11 pin (1228.88,1621.23), so its three villages now stand round the moved monastery.
  - **Thalaba** (`shvo49k0y2`, px 840,1463 since 2026-11-16, scale model 5.1e12: the bench at the mouth of Godshearth's
    spillway gorge; the owner: "cut it into whichever polygon the new pin falls into", the Xanadu Sultanate), reach 22 km;
    the town is its own page (`settlements/thalaba`). Its ring is the site plan's outworks (`settlements/thalaba/PLAN.md`):
    Briḍj, the bridge ward at the gorge's mouth (ranch: the road warden's watch, the expeditions' muster corrals), 10 km
    north; Salphar, the diggers' hamlet on the town's small sulfur deposit at the cataract's foot (mine), 20 km north; the
    near and far Bēnch farms, 11 and 22 km east. Salphar is a village of its own row (`xanadu-sulfur`, in
    `src/48-world-site.js`): adits, calcaroni (the kit has none yet: pending boxes) and a sorting shed.
- **Bridges** (core/world 42b and 88b, since 2026-11-16): every road and link the region lays is bridged where it crosses a
  named river, in the Xanadu kit's stone (`SITE_SPEC.bridges`): Thalaba's north road over the Solṭ Siṭrīm, a Qiblai village
  road and the Qiblai-Longsong link.
  - **Lāiṭwāl** (`slaitwal0001`, px 1028,1653, added 2026-11-16: `settlements/lightwall`, its step L5): the Light Wall on the
    north shore of Opal Valley's great lake, under the north boundary fault. Its id is `model: false` in `SITES.json` until
    the scale model lists it (the pin is queued with the scale-model edits). Three farming villages on the shore's bench,
    east and west, and a ranch at its western end. Opal Valley grows no kit yet, so they stand on bare ground. Its square was
    added to the cut by hand from a re-cut (the site's row, its polygon, its added area, its mask square); the re-cut's other
    changes (the model's drift since this region's cut: Longsong's move, the rivers) were left for the region's own re-cut.
- **The roads:**
  - **Village roads:** each village's lane end has a road to its town (`core/world` `ROADS`, the grade held to 8 %).
    They join the roads already laid where those are nearer than the town, so they share a trunk.
  - **Town links:** Erehwon–Qiblai (415 km) and Qiblai–Longsong (568 km) are in the plan as records but not laid on the
    ground (`KNOWN_ISSUES.md`).
- **The plan:**
  - `core/world/48s-world-sites.js` (`KSITES`) plans on the world's land.
  - `core/world/bake_sites.py xanadu-oidong-highrift` bakes it in node to `plan/sites.json`.
  - The page draws the bake (`core/world/88s-world-sites.js`):
    - a village within 4 km is drawn in the kit's own pieces, merged by material, with its lanes;
    - out to 30 km, massing boxes.
  - Verify plans again in the browser and compares the hash.
- **The flora:** the Xanadu kit on its overlay (its pass table as data: `src/49-world-xanadu.js`), and the Oidong kit on
  the valley (its own `OIDONG.PASSES`). The other overlays grow nothing yet.
- **The lava tubes** (2026-11-16, step W3 of `PLAN-TWINS-CROSSING.md`; core/world `42k`, `88k`, its README "Caverns"): Route A
  of the Twins crossing, the Dark-Tube Road, under the ground: A1 from the Vale's portal at the Alph's chasm (938,1496) to the
  First Skylight Break, A2, A3 with the Hall of the Tally-Marks and its roof crack, A4 to the 18 m arch, and the south feeder
  (`tube_xanadu_se_10`'s lower galleries, the Strongbow branch, 1010,1517 > 1028,1506): 244 km at the plan's pixels, 10 portals,
  17 skylights, 14 chokes of 3.5 m. All of it lies inside the present box; only A1's first ~15 km are inside the cut's polygons.
  The spec is `src/48k-world-tubes.js`; the floors lie at a depth under the ground, so they follow the Twins' sculpt when it lands.
  "Go to" has each portal from outside, a walk inside each tube and the Hall.
- **Built output:** `dist/xanadu-oidong-highrift.html` (about 7.6 MB, the rasters as PNGs), with its texture sidecars.

```
python3 tools/scale-model/cut_site.py xanadu-oidong-highrift     # the cut (data/, source/): about 40 s
python3 core/world/bake_sites.py xanadu-oidong-highrift          # the plan (plan/sites.json); --check fails on a stale bake
python3 build.py                                                 # dist/xanadu-oidong-highrift.html
python3 verify.py dist/xanadu-oidong-highrift.html --assert --views 1,3,4
```

On the GPU: `KRATOR_GL=gpu` and `python3 ../../tools/harness.py lock --lane auto -- python3 verify.py ...`.

## Fragments

| Fragment | Tag | What |
|---|---|---|
| `src/43-world-xoh.js` | [G data] | the fields the kits read that the world does not make: the Oidong kit's `flat` (0 everywhere until its pale flats are mapped) |
| `src/44-world-landforms.js` | [G data] | the lake's small islands at 1:1: the scale model's landform records inside the cut (`tools/scale-model/model/data/landforms.json`, copied into `WORLD_DATA.landforms` by `build.py`) stamped into the land, chained on `WORLD.landHook`: the Pleasure Dome's isle (the Erewhon page's island, 14 m over the lake) and the west stack (42 m) |
| `src/46-world-config.js` | [G data] | the sites' markers, "Go to" (the region, each site, each village, each island), the first view over Erehwon's villages |
| `src/47-world-kits.js` | [G data] | the kits that grow here: Xanadu on its overlay, Oidong on the valley |
| `src/48-world-site.js` | [G data] | the sites' spec (`SITE_SPEC`): each site's villages (focus, spot, population), its roads, the links between the towns |
| `src/48k-world-tubes.js` | [G data] | the lava tubes' spec (`SITE_SPEC.tubes`): Route A's four tubes and the south feeder, their widths, depths, portals, the Hall, chokes and skylights by cell (core/world 42k plans them, 88k draws them) |
| `src/49-world-xanadu.js` | [G data] | the Xanadu kit's pass table as data (`XANADU_WORLD`) |

## Checks (`verify.py --assert`)

Each check has a negative:
- **The world's checks**, round Qiblai's first village: order-free seeding, the land continuous, nothing in water or
  outside the cut, spacing across tiles, the rivers that carry water, the roads on the land at their grade, nothing on
  a road or a village, no NaN.
- **The region:** each site at its pixel, on dry land, in its overlay, with its kit growing there.
- **The islands:** each landform over its lake at its centre, with the lake round it, and the Pleasure Dome's isle on the
  Erewhon page's island (the negative reads the land without the stamp).
- **The sites:**
  - Lāiṭwāl on its bench (dry, the lake within 8 km south, the wall over 1,500 m higher within 9 km north); a negative
    reads it 14 km out in the lake;
  - the baked plan is the plan made again in the browser;
  - every village is whole, its buildings apart and on good ground, with every road at its lane end;
  - every village is cleared of flora, tagged, and drawn with the kit's pieces.
- **The caverns** (`verify.py --tubes` runs them alone; `node core/world/test-tubes.js` is the data's test):
  - the plan's checks on the drawn ground: every tube meets the surface, each opening where the spec puts it, the floor and the
    roof under the ground (4 m of rock) everywhere but at the openings, the grade (negatives: a tube with no opening, a floor
    raised over the ground mid-tube);
  - the ground opens at each portal and only there (a ray down at each portal's ramp meets the tube; over each tube between the
    openings it meets the ground; every terrain chunk opened is on a hole; each probe's negative is the other kind of place);
  - the walker (G) enters the south feeder at its portal, walks its 42 km on the floor and comes out at the other portal, the
    drawn floor under its feet and the rock over its head every 3 km; steered into the wall it is stopped (the negative: along
    the tube it goes);
  - underground the pick meets the rock and the inspector names the tube (the negative: on the ground by the portal);
  - shots of the feeder's portals, inside it and the Hall, with the frame time at each.
