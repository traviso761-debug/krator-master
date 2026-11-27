# openworld/xanadu-lake-shore: the Lake Shore of Erewhon's lake

The sixth region of the open world (the owner, 2026-11-16: *"One region per province. Can go ahead and cut region"*;
`settlements/xanadu/BUILD-OUT.md`). It holds the Xanadu Sultanate's Lake Shore province (p1, Lēk-Shor, seat Erehwon;
`core/region/data/xan-tune.js` `T.provinces`, `T.lake`): Erehwon, its farming ring, the thirteen p1 shore towns and the
three small isles, on the lake's south and west shore. The north shore (p7) is `openworld/xanadu-north-shore`; the two
regions share the lake, not their sites' squares.

On map 5.1 with edit 7 re-run (5f659c054), at 1:1 on `core/world`:

- **The cut** (`openworld/SITES.json`, region `xanadu-lake-shore`; `tools/scale-model/cut_site.py`): box px 798-890 by
  1482-1542 (origin px 844,1512), 500 m cells (upsample 4).
  - Erehwon's square (30 km, its row in SITES.json, which xanadu-oidong-highrift also lists): px 826-856 by 1502-1532.
  - The thirteen shore towns, Ālph-Hēḍ (876,1503) round the south and west shore to Siṭāq (812,1495): 6 km squares
    joined in order by 10 km corridors along the shore; Erehwon joined to its two nearest, Gārḍan and Boṭ-Yārḍ.
  - The three small isles, Wesṭ-Āil (831,1499), Lāiṭ-Hāus (864,1503) and Bē-Āil (844.1,1511.5): 3 km squares.
  - The long isle (Grēṭ-Āil, 845,1504) is not a site here (its page is `settlements/azure-dream`), but Erehwon's square
    reaches its south half, so its ground is in the cut.
- **The flora:** the Xanadu kit on the `xanadu` overlay (1,396 of the cut's px). Its pass table and the overlay's
  greening are read in place from `openworld/xanadu-oidong-highrift/src` (49 and 43).
- **The landforms:** the Pleasure Dome's isle by Erehwon, stamped by `core/world/41l-world-landforms.js` from
  `region.json`'s `landforms` (Phēr's records and the west stack are in the box, outside the cut).
- **The sites** (`src/48-world-site.js`, baked by `core/world/bake_sites.py` to `plan/sites.json`):
  - Erehwon's ring: five farming villages and a ranch on core/hamlet's `xanadu` row, drawn with the Xanadu kit (XAK).
    The spec is xanadu-oidong-highrift's, copied (not moved), planned with that region's world seed.
  - The shore towns: sites with no hamlets; their towns' own ground is `settlements/xanadu-lake`'s (`SITES.json`'s `towns`,
    `core/world/bake_towns.py`), Hoṭ-Bāṭh among them since 2026-11-23.
  - The isles: Wesṭ-Āil, Lāiṭ-Hāus and Bē-Āil, each two fishing villages at its two ends (core/hamlet, the fishers' row).
  - **The countryside sample** (`core/world/48v-world-sample.js`, `88r-world-sample.js`; `WORLD_SAMPLE` in `src/48-world-site.js`;
    settlements/xanadu/HAMLETS-PLAN.md section 3, step H2): the province's bulk villages laid at load near nothing named, one at
    most to a 6 km cell kept with the chance of its farmland, refused on the places, the roads and the water; drawn and checked
    by 88s as the plan's own; never counted by the sim (`window._sample`; verify "the countryside sample").

## Build and verify

```
python3 tools/scale-model/cut_site.py xanadu-lake-shore      # data/ and source/ (after a model edit)
python3 core/world/bake_sites.py xanadu-lake-shore           # plan/sites.json
python3 core/world/bake_sites.py xanadu-lake-shore --resources
python3 tools/build.py openworld/xanadu-lake-shore
cd openworld/xanadu-lake-shore; $env:KRATOR_GL='gpu'; python3 verify.py dist/xanadu-lake-shore.html --assert
```

The verify's checks:
- the world's own (`core/world/91-world-probe.js`);
- the region: Erehwon where the cut put it, on dry land, the kit growing there;
- the shore towns and isles: each in the cut, on dry land or at the shore within 1 km;
- the landforms in the cut stand over the lake;
- the sites (`core/world/88s-world-sites.js`);
- the resources (`core/world/verify_world.py`).
