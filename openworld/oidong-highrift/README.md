# The Oidong Valley and the High Rift: Longsong's world at 1:1

The fourth region of sites cut off the scale model into the open world (`openworld/PLAN-SITES.md`; the owner, 2026-11-11:
"Longsong moves onto the open world's ground"). `PLAN.md` says what it takes and why; `core/simulation/
PROPOSAL-LONGSONG-PINNACLE.md` holds the economy it is planned for.

- **The cut:** two model regions on map 5.1, cut by `tools/scale-model/cut_site.py oidong-highrift`.
  - the Oidong Valley (17,257 px inside the cut);
  - the High Rift (21,261 px);
  - four sites' squares.

  The box is 1,302 x 322 km (651 x 161 px) at 500 m cells, with Verdigris Beck, Brant-Fell Gill and the valley's rivers.
  The frame's origin is px 1311,1634. Three sites are not on the model's list yet (`"model": false` in
  `openworld/SITES.json`: their own pixel).
- **The sites** (`openworld/SITES.json`), on core/hamlet's `xanadu` row (the valley folk, the work camps) and `order` row
  (the History Monks' houses), drawn with the Xanadu building kit (`XAK`):

  | Site | Px | What is planned | People |
  |---|---|---|---|
  | **Strongbow** (`sfgtxw10kr`) | 1001,1596 | the Ancients' cliff arcology in the scarp between the valley and Xanadu, 3 km north of the cataract: its top on the lip (about 1,400 m), its elevator down about 3,100 m to the Xanadu floor (moved 2026-11-11); a road's end only so far | - |
  | **Longsong** (`sq80bzd7ep`) | 1228.88,1621.23 (on the Bīruk al-Ghaym, moved 2026-11-11) | the ring of 15 villages: Shar, Nub and Dzo-ling where its page lays them, ten more farming villages 4 to 8.5 km out, Drok-ri's high pastures, Dar-ling's silk and paper | 3,279 (the house itself is `settlements/longsong`'s, 1,344) |
  | **The Singing Gjár** (`ssinggjar01`) | 1572,1643 | the Order's house (350), the Beck Fields (180), the Vein Camp (50: 22 miners, 12 sorters, 6 smiths; a work camp, 90 % at work) | 580 |
  | **The Mirror Grange** (`smirrorgrange01`) | 1430,1644 | the Order's grange (260), its growers (200), the graben's herders (145) | 605 |
  | **The Caldron House** (`scaldronhouse01`) | 1366,1668 | the Order's hospice at the staircase foot (260), its shelf village (180) | 440 |

- **Staffing** (the owner, 2026-11-11: "make hamlets and monasteries be at least 70% fully staffed, increase pop if
  needed"): every village's and house's ceiling lets `KHAMLET.census` fill at least 70 % of the focus jobs its kind wants
  (a farming village 90, a house of the Order 260). The Beck Fields and the Caldron shelf village rose to 180 (66 of 90),
  the Mirror Grange and the Caldron House to 260 (187 of 260); every other place was already at 90 % or more.

- **The roads:**
  - **Village roads:** each village's lane end has a road to its site, the grade held to 8 %; they join the roads
    already laid, so they share a trunk. A house that is its site's heart lays none (`road: false`).
  - **The Order's road:** Longsong to the Caldron House (306 km, up the valley and the beck's staircase: `guide`), the
    Mirror Grange (137 km) and the Singing Gjár (284 km), with an Order rest house or a teahouse every 12.5 km.
  - **The Sultanate's road:** Longsong down the valley to Strongbow's top on the lip above Xanadu (473 km on the valley
    floor, under 2,700 m: `guide`), with a han every 25 km. It is the only way along the valley: the Rift line does not run in it
    (the owner, 2026-11-11).
  - **Bridges** (core/world 42b, 88b; `SITE_SPEC.bridges`): every link is laid on the ground and bridged where it
    crosses a named river. That is 14 bridges and 127 piers, so the rivers run on under them.
- **The flora:**
  - the Oidong kit on the valley (its own `OIDONG.PASSES`);
  - the High Rift kit's floor on the rift (`src/49-world-highrift.js`): tussock, steam heath, opal cane, bead caps and
    Verdigris wort, by four ground profiles (cold, graben, warm and hot round the vents).
- **The resources:** the census and panel (`core/world` 49r, 89r; `plan/resources.json`), and the propose-a-site tool
  (93).
- **Longsong's page reads the plan:** `settlements/longsong/build.py` writes `LS.RING` from `plan/sites.json`. The
  house's provision check counts the ring's tithe against its 1,344.
- **Built output:** `dist/oidong-highrift.html` (about 9 MB, the rasters as PNGs), with its texture sidecars.

```
python3 tools/scale-model/cut_site.py oidong-highrift     # the cut (data/, source/): about 30 s
python3 core/world/bake_sites.py oidong-highrift          # the plan (plan/sites.json); --check fails on a stale bake
python3 core/world/bake_sites.py oidong-highrift --resources
python3 build.py                                          # dist/oidong-highrift.html
python3 verify.py dist/oidong-highrift.html --assert --views 1,3,6
```

On the GPU, set `KRATOR_GL=gpu`; a verify takes a harness lane itself. A fresh worktree needs the packs from LFS:
`git lfs pull --include="biomes/highrift/tex/*,biomes/oidong/tex/*,settlements/xanadu/tex/*"`.

**Godot's one-world case (GODOT-PLAN.md M7; the owner, 2026-11-16).** The page carries core/export and core/world 94, and
two tools write `godot/data/world-oidong-highrift`, which `godot/tests/export/oidong_world_test.gd` reads:

```
KRATOR_GL=gpu python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py   # index.json, chunks/ (46), places/ (5): ~10 min
node openworld/oidong-highrift/tools/export-sim.js                                       # sim.json, golden.json: the valley's week
godot --headless --path godot --script res://tests/export/oidong_world_test.gd           # the stream, the places, the roads, the books
```

The places are each a 1.6 km square round a site's pin. Longsong's villages are in full (about 40 MB of glb, in LFS)
and the Order's houses' in massing: the page draws a village in full within 4 km of the camera and its flora within
2.5 km, and the High Rift's houses grow none round them. Rebake, rebuild and re-export after the plan moves.

Each case is written about its own origin (the box's centre: a floating origin, core/export README "origin"), so a
building 600 km out keeps its millimetres in Godot; the stream moves its own origin with the camera. The flora's plants
carry uids (each pool a core/tags item set in the `flora` part). The export needs the GPU (`KRATOR_GL=gpu`): under
SwiftShader the page's start fails on a shader.

**Strongbow's arcology** (the owner, 2026-11-16: "far detail"): `godot_case.py --only arcology` exports `kits/ancients`'
`strongbow-today` page from `settlements/strongbow`'s branch's worktree (`KRATOR_STRONGBOW`, default the sibling
`keen-swanson-68a311`, built) through `tools/strongbow-export.js` (injected: `tools/harness.py export --root --inject`):
what the page draws from 3.5 km, written about its anchor (the lip at the bay's centre). Strongbow's place in `index.json`
gains `arcology` (its case, branch, commit, `at` and `ry`); `KratorWorldStream.open_place` seats it under the place, turned
to face west. Owed: the region's ground carved to the page's 900 m face (here the model falls only ~60 m in 700 m).

## Fragments

| Fragment | Tag | What |
|---|---|---|
| `src/43-world-ohr.js` | [G data] | the fields the kits read that the world does not make: the Oidong kit's `flat`, the High Rift floor's `hrheat`, `hracid`, `hrgrass` |
| `src/46-world-config.js` | [G data] | the sites' markers, "Go to" (the region, each site, each village and house), the first view over Longsong's ring |
| `src/47-world-kits.js` | [G data] | the kits that grow here: Oidong on the valley, the High Rift's floor on the rift (its four ground profiles) |
| `src/48-world-site.js` | [G data] | the sites' spec (`SITE_SPEC`): each site's villages and houses (focus, spot, ceiling), its roads, the Order's road and the Xanadu road with their stops, the bridges asked for |
| `src/49-world-highrift.js` | [G data] | the High Rift kit's world adapter (`HRIFT_WORLD`): no trees; its floor through `HRIFT.buildRift`, the profiles picked by the vents' distance and the world's warmth |

## Checks (`verify.py --assert`)

Each check has a negative:
- **The world's checks**, round Longsong's village Lho.
- **The region:** each site at its pixel, on dry land, in its overlay, with its kit growing there.
- **The sites:** the baked plan is the plan made again in the browser; every village and house whole, its buildings
  apart and on good ground, with every road at its lane end; every village cleared of flora, tagged and drawn with the
  kit's pieces.
- **The bridges** (`_bridges.checks`): every span a bridge, every deck clear of its water, the grade held, the piers on
  the ground; the rivers running on under the decks; each drawn and tagged.
- **The resources and the propose tool** (`core/world/verify_world.py`).
