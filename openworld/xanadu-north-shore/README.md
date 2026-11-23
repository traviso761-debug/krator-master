# openworld/xanadu-north-shore: the north shore of Erewhon's lake

The fifth region of the open world (the owner, 2026-11-16, `settlements/pher/PLAN.md` section 7: *"a new one north of
the erewhon that also contains thalaba"*, *"have it reach east but don't take the long isle"*). It is step P2 of the Phēr
plan: the ground Phēr's town (step P3, `settlements/pher`) will stand on, its farming ring and the road to Thalaba.

On map 5.1 with edit 7 re-run (5f659c054) and Phēr's polish (`tools/scale-model/edit_517_pher.py`, `edit_517_pher_rim.py`), at 1:1 on `core/world`:

- **The cut** (`openworld/SITES.json`, region `xanadu-north-shore`; `tools/scale-model/cut_site.py`): px 808-884 by 1446-1514,
  500 m cells.
  - Phēr's square (16 km) stops a row short of the long isle.
  - Māuṭh, Ōlḍ-Thalaba and Ḍāiyar are small squares joined by corridors along the shore, east to Ḍāiyar.
  - The Thalaba road's two halts, the Qol ford and the Qol head, carry its corridors up the Qol Siṭrīm's valley to Thalaba.
  - The long isle (Grēṭ-Āil) is outside every polygon.
- **The flora:** the Xanadu kit on the `xanadu` overlay (5,258 of the cut's px). Its pass table and the overlay's greening
  are read in place from `openworld/xanadu-oidong-highrift/src` (49 and 43).
- **The landforms:** Phēr's headland (two `island` records) and the cove's east point (an `islet`), stamped by
  `core/world/41l-world-landforms.js` from `region.json`'s `landforms`.
- **The rivers:** the Qol Siṭrīm and the Swīṭ Siṭrīm (Phēr's stream, `r_pher_swit`), named rivers of the model.
- **The towns' own ground** (`openworld/SITES.json`'s `towns`, `core/world/bake_towns.py`): Phēr's (`settlements/pher`, step P7)
  and Māuṭh's (`settlements/xanadu-lake`, step L0) inside their footprints, the band easing back to the region's.
- **The sites** (`src/48-world-site.js`, baked by `core/world/bake_sites.py` to `plan/sites.json`):
  - Phēr's ring: six farming villages on the rim plain, on core/hamlet's `xanadu` row, drawn with the Xanadu kit (XAK).
  - The Thalaba road up the Qol valley: 104.8 km, with a han every 25 km, bridged where it crosses a named river.

## Build and verify

```
python3 tools/scale-model/cut_site.py xanadu-north-shore      # data/ and source/ (after a model edit)
python3 core/world/bake_sites.py xanadu-north-shore           # plan/sites.json
python3 core/world/bake_sites.py xanadu-north-shore --resources
python3 tools/build.py openworld/xanadu-north-shore
python3 openworld/xanadu-north-shore/verify.py openworld/xanadu-north-shore/dist/xanadu-north-shore.html --assert
```

The verify's checks:
- the world's own (`core/world/91-world-probe.js`);
- the region: each site where the cut put it, on dry land, the kit growing at Phēr;
- the landforms: Phēr's headland and point stand over the lake, the stamp's negative reads the land without them;
- the sites (`core/world/88s-world-sites.js`);
- the resources (`core/world/verify_world.py`).
