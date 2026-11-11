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
  - **Erehwon** (`s57bkv9741`, px 800,1503): the Sultanate's city (`settlements/xanadu`). Five farming villages 4.6 to
    8 km round it and a ranching village 12 km out: 1,345 people in 249 buildings.
  - **Qiblai** (`skm4jjo2vl`, px 922,1595 since 2026-11-11, moved from 963,1566 to the cataracts of Nahr ash-Shalālāt:
    by a river, near rock salt and ore; the owner's word), with no page yet: the same ring, re-planned on the new ground.
  - **Longsong** (`sq80bzd7ep`, px 1226,1626): the History Monks' monastery (`settlements/longsong`). Its three villages
    stand where its page lays them: Shar and Nub (farming) and Dzo-ling (the herders), 585 people in 110 buildings.
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
| `src/46-world-config.js` | [G data] | the sites' markers, "Go to" (the region, each site, each village), the first view over Erehwon's villages |
| `src/47-world-kits.js` | [G data] | the kits that grow here: Xanadu on its overlay, Oidong on the valley |
| `src/48-world-site.js` | [G data] | the sites' spec (`SITE_SPEC`): each site's villages (focus, spot, population), its roads, the links between the towns |
| `src/49-world-xanadu.js` | [G data] | the Xanadu kit's pass table as data (`XANADU_WORLD`) |

## Checks (`verify.py --assert`)

Each check has a negative:
- **The world's checks**, round Qiblai's first village: order-free seeding, the land continuous, nothing in water or
  outside the cut, spacing across tiles, the rivers that carry water, the roads on the land at their grade, nothing on
  a road or a village, no NaN.
- **The region:** each site at its pixel, on dry land, in its overlay, with its kit growing there.
- **The sites:**
  - the baked plan is the plan made again in the browser;
  - every village is whole, its buildings apart and on good ground, with every road at its lane end;
  - every village is cleared of flora, tagged, and drawn with the kit's pieces.
