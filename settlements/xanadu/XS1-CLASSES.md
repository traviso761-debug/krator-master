# XS1: the material classes, the Xanadu S4 set and the route's stops (2026-11-23)

Session XS1 of `STACK-PLAN.md` (section 9). Data only, under the owner's "data now, looks after": nothing is packed,
exported or tuned here. Stage 8 reads all three.

| What | Where | Read by (at Stage 8 or XP1) | Checked by |
|---|---|---|---|
| The class of every family | a `"class"` field in each Xanadu `materials.json` (and Tungang's, whose Glazier set Lightwall draws) | `tools/textures/pack.py` through `tools/textures/mclass.py` | `node core/materials/classes/test-class.js` |
| The class table | `core/materials/classes/m1-classes.json` (what each class packs, the stack's glazed rule) | `mclass.py` (Python), `10-mat-class.js` (`KMAT_CLASS`, `[G data]`) | the same test |
| Gates 1 and 3 on the classes | `tools/textures/m1_class_gates.py` (the stack's own `process()`, in memory) | | run it, below |
| Xanadu's S4 set | `godot/tools/ground_layer_sets/xanadu.json` | `godot/tools/pack_ground_layers.py`, `godot/krator/kground_layers.gd` | `node settlements/xanadu/tests/test-xs1-stack.js` |
| The `xanadu` route | `tools/route_tracks/xanadu.json` | `tools/route_harness.py`, `godot/tests/perf/route_harness.gd` | the same test |

The class module sits in `core/materials/classes/`, not `core/materials/record/`: builds list `record/` whole (Tungang,
Dhelv and Noah's Regret through `CORE_DIRS`), so a new `.js` there lands in their pages. The first try put it there,
and Tungang's page changed; in its own folder no build reads it.

## 1. The classes

Four classes (`m1-classes.json`). What Stage 8 does with each:

| Class | Web normal | Godot | Gate 1 `flat` | Height in alpha | M3 POM | M4 cavity |
|---|---|---|---|---|---|---|
| **glazed** | `xy8` (the only 8-bit class: owner answer 4) | `oct8` + `mipVariance` | no | yes | no | yes |
| **relief** | `xy6` (today's) | `oct8` + `mipVariance` | no | yes | where hero | yes |
| **flat** | `xy6` | `oct8` + `mipVariance` | **yes** | optional | no | no |
| **card** | none | none | (n/a) | **never** | no | no |

What each holds:

| Build | glazed | relief | flat | card |
|---|---|---|---|---|
| `kits/xanadu`, `settlements/xanadu` (48 each, identical) | `xMosC` `xMosD` `xZel` `xHaft` `xMuqT` `xBTile` `xBandC` `xBandR` `xGiltC` `xPietra` `xMarW` `xMarK` **`xTiles`** (13) | `brick` `stone` `rubbleK` `xRubble` `xSandR` `xRock` `xYes` `xEarth` `paving` `shingle` `thatch` `timber` `wood` (13) | `plaster` `xWash` `concrete` `concreteR` `cloth` `clothR` `tarp` `corrugate` `verdigris` `white` `whiteWorn` `icefloor` `icewall` `woodV` `xSun` `xValance` `xOpArt` `xPenbey` `xMarble` `xMarbleB` `xMarbleW` (21) | `xJaliC` |
| `kits/qiblai` (10) | `qGilt` `qLacq` | `qAshlar` `qCobble` `qDirt` `qFlag` `qGrass` `qMarble` `qPlank` | `qRug` | |
| `settlements/flashing-eye` (14) | the Qiblai kit's, alike | the Qiblai kit's, and `feAsh` `feCinder` `feColumnar` `feScoria` | `qRug` | |
| `settlements/kirstabal` (8) | | all eight (the ground sets, the slate `xSlate` `xSlateD`) | | |
| `settlements/thalaba` (4) | | all four (ground sets) | | |
| `kits/tungang` (39; Lightwall draws its Glazier set) | `celadon` `gilt` | `carved` `ground` `hewn` `pole` `potch` `rockface` `stone` `turf` `wood` | the other 28 (washes, cloth, metals, bone, ice, the nine `f_*` furniture detail maps) | |

Phēr, Strongwall, Viridian, the Azure Dream and Qiblai's city pack nothing of their own: they draw the Xanadu kit's pack
(through Xanadu's page) and the Qiblai kit's (`packFrom`). Lightwall draws the Qiblai kit's and Tungang's Glazier set.

**The stack's rule against the classes** (`specular >= 0.45`, roughness after `roughLift` `< 0.35`), pinned by name in the test:
- *Glazed by name* (the rule misses them; the plan names them): `xMosC`, `xMosD` (0.35, on the line), `xBandC` (0.4),
  `xBandR` (0.8), `xGiltC` (0.6), `xTiles` (0.375); `qGilt` (0.415 after its lift), `qLacq` (0.46); Tungang's `gilt` (0.35).
- *Taken by the rule, left flat*: `icewall` and Tungang's `ice` (`ice.clear`, 0.28): not on the plan's list, and only the
  scrap target and the Fellgang set draw them. Promoting them is the owner's call; it costs about 0.2 MB each.

**Where this differs from `STACK-PLAN.md` section 5:**
- **`xTiles` is glazed.** Section 5 keeps it a courtyard material, but it is also the tile of Erewhon's domes, bulbs and
  drums (`kits/xanadu/src/71-xa-mat.js`: `xDomeT`, `xBulbT`, `xDrumT`): the curved glazed case M1 exists for, until
  `tile.dome.bannai` (owed, section 60) replaces it there. It costs 30 KB.
- **The three polished marbles packed `mapOnly`** (`xMarble`, `xMarbleB`, `xMarbleW`) are flat. They carry no normal map
  to promote; the check refuses `glazed` on a family with no lit normal. If they are ever lit, they become glazed.
- **Not yet in any Xanadu `materials.json`**, so not classed: `roof.tile.celadon`, `tile.hex.ceramic`,
  `wood.lacquer.crimson`, `glass.moonglass` (Lightwall's moonglass is drawn procedurally today), `stone.marble.ashlar`,
  `wall.rubble.limewash` and `tile.dome.bannai` (owed). Each takes section 5's class when a family wires it. The test
  then fails until the family has a class.

## 2. Byte-neutral now: the proof

1. **By code.** `python3 tools/textures/mclass.py --prove` walks `pack.py`'s syntax tree for every key it reads from a
   family's entry or the build's config. Today's `pack.py` reads `base, breakup, build, cell, families, height, lib,
   mapOnly, metal, normalScale, optional, own, rise, roughLift, scale, sheet, size, specular, stems, tint`, never `class`.
   The stack's `pack.py` (`--ref origin/claude/vertical-stack`) reads those plus `flat, normalEncoding, packFormat`,
   never `class` either. So Stage 8 has to wire it in (section 4). The test runs the proof, with three negatives: a packer
   that reads `class`, one that walks the whole entry, and a loop over named keys that includes `class`.
2. **By packing.** Each of the seven `materials.json` packed twice with today's `pack.py` into scratch folders, once
   without the field and once with it: **identical `tex/` every time** (135 + 135 + 31 + 43 + 25 + 13 + 118 files, 42 MB).
   They match the committed `tex/` byte for byte, except two files in Xanadu's two packs, which are already behind:
   the jali card set (`patterns/xanadu/jali`, delivered 2026-11-12) is in the library now, so any pack adds `xJaliC`
   (170 KB) and its `pack.json` entry. Stage 8's pack carries that.
3. **By rebuilding.** Every page that takes these packs, rebuilt before the change and after it on this machine
   (`kits/xanadu`, `kits/qiblai`, `kits/tungang`, `settlements/xanadu` (Erewhon, the sheet, scrap), Phēr, Lightwall,
   Strongwall, Viridian (both), the Flashing Eye, Kirstabal, Thalaba (both), Qiblai): **55 of 55 pages and sidecars
   identical**. The Azure Dream's build fails on this branch before and after alike (`external fragment 20-core-walk.js
   clashes`), so its committed pages stand. `tools/port_baseline.py` cannot add a signal here: its baseline is behind every
   Xanadu page already (Erewhon 6.48 MB there, 9.01 MB built from this branch with or without this change).
   The rebuilt pages were not committed: nothing in them is this change's.

## 3. Gates 1 and 3 on the classes

`python3 tools/textures/m1_class_gates.py --ref origin/claude/vertical-stack <the seven builds>` packs every family in memory
with the stack's own `process()` (packFormat 2) under its class, twice: the web's encoding and Godot's `oct8`. It writes
nothing.

- **Gate 1** (`assert_pack_physics`, with the class's `flat`): **171 families, 0 failures.** The card packs `cutout` (no
  height in its alpha). Mean normal error on the web: glazed families at `xy8` 0.00-0.11 degrees, the rest at `xy6` about
  0.74. In Godot (`oct8`) 0.17-0.22.
- **Gate 3** (handedness): a synthetic dome through `xy6`, `xy8` and `oct8` leans outward and its Poisson height peaks; the
  DirectX green (the negative) is caught in all three. Per family, the height `pack.py` rebuilds from the class-encoded
  normal correlates 0.998-1.000 with the one rebuilt from the unquantised normal, on **161 families with a lit normal, 0
  failures**. None of these library sets has a height map of its own, so Stage 8 derives every height this way
  (`heightSource: normalPoisson`). The sign of that height is what Gate 3 has to hold.

## 4. What Stage 8 changes in `pack.py` (on the stack's version)

```python
import mclass                                     # tools/textures/mclass.py
S = mclass.settings(fc)                           # raises on a family with no class or an unknown one
fc = dict(fc, flat=fc.get('flat') or S['flat'])   # Gate 1: a flat family demands no height range
enc = S['web']['normal'] or nenc                  # web: xy8 for glazed, xy6 for the rest; Godot's export: S['godot']
e, files = process(fam, fc, size, pack_format=pfmt, normal_enc=enc)
```

The web keeps packFormat 1 (three maps) for inline pages (`STAGE-5-REPORT.md` 4). There, the glazed class is the only
change: the normal map at 8 bits instead of 6 (`webp(..., bits=8)`).

## 5. The caps (owner answer 4), measured; XS0 to reconcile

Each glazed family's normal at 8 bits against today's 6, lossless WebP at 512 px, on this machine. The 6-bit sizes
reproduce the committed files byte for byte. The cost in base64:

| Pack | Families | Adds | Its carriers now | After |
|---|---|---|---|---|
| Xanadu (`xanadu.tex.xanadu.js` + `-2.js`, beside every page on Xanadu's page) | 13 glazed: `xHaft` 277 KB, `xMuqT` 270, `xGiltC` 263, `xZel` 234, `xBTile` 215, `xBandR` 214, `xMosD` 212, `xMosC` 199, `xPietra` 188, `xMarW` 187, `xBandC` 158, `xMarK` 121, `xTiles` 30 | **2.57 MB** | 14.53 + 5.41 = 19.95 MB in two parts | 22.52 MB, still two parts: `matlib_pack.py` splits by family at 15,000,000 bytes, under the 16 MiB cap and its 90 % warning |
| Qiblai (`xanadu.tex.qiblai.js`: the kit, Qiblai, Viridian, the Azure Dream, Lightwall) | `qGilt` 297 KB, `qLacq` 275 | **0.57 MB** | 5.24 MB (the Flashing Eye's own 7.83) | 5.81 (8.40) |
| Tungang's Glazier set (`lightwall.tex.tungang.js`) | `gilt` 297 KB, `celadon` 190 | **0.49 MB** | 7.74 MB | 8.23 |

**No page's HTML moves:** every glazed family travels in a sidecar, none inline. Every carrier stays under its cap. What
grows is download: a page on Xanadu's page fetches 2.57 MB more. Section 5 *proposed* promoting "only where drawn within
hero distance". A kit's pack is shared by every page that takes it, so promotion is per pack, not per page. A per-page
choice would mean a second Xanadu pack. The default here is to promote in the pack; the owner can cut the list instead.
`xanadu-oidong-highrift.tex.xanadu.js` (8.5 MB; an LFS pointer in this checkout) grows by at most 2.57 MB if it carries
every XAK family, still one part.

**XS0** (`claude/xs0-measure`, `XS0-MEASURE.md`) had not pushed when this was written. When it lands, reconcile: (a) its
per-page glazed families against this table's carriers; (b) its sampler counts, which classes do not move (a class
changes bits, not maps); (c) any page it finds within 3 of 16 samplers, which takes the runtime array assembly at Stage 8
whatever its classes.

## 6. Xanadu's S4 set

Six layers in the six roles `godot/shaders/terrain.gdshader` gives the layer indices (on the stack: base, wet-and-hollow,
altitude, the pave zone's green and talus, rock, the pave zone's red). The set therefore drops into the shader's selectors
as data, and the sampler count does not move (two arrays). Keyed by the `xanadu` overlay. On the stack, `core/world`
maps it to style `vale` and palette `xanadu`, and every Xanadu region's `data/region.json` names that overlay.

| # | Role | Layer | Library set | Tile | Ground (the `xanadu` palette's slots) |
|---|---|---|---|---|---|
| 0 | base | valley floor | `ground.grass.lush` (the global layer 0) | 1.65 m | the Vale's meadows, orchards' floors, the rim plain (`a`, `b`, `scrub`) |
| 1 | wet | lake shore | `ground.shingle` (made for Xanadu's shores) | 1.5 m | the pebble beaches and wet margins, the lake's edge first (`sand`, `sand2`, `damp`) |
| 2 | high | alpine | `ground.tundra` | 2.2 m | the caldera rim's high pastures, above the treeline (`mtn`) |
| 3 | gravel | terraces | `ground.terrace.field` | 4 m | the lake towns' terraces, tea gardens, the Vale's fields, painted per place as Longsong paints its ward terraces here (`silt`, `pale`) |
| 4 | rock | caldera rock | `rock.tuff` | 3 m | the caldera wall, the cones, the Spillway gorge (`rock`) |
| 5 | pave | courtyard paving | `paving.tiles144` (the set `xTiles` takes) | 2 m | Erehwon's and the towns' courts and the Golden Way, where Godot's pave zone paints them (`pale`) |

Held (no slot of six): `ground.paddy.wet` (owed, section 60; stand-in `ground.brown_mud_02`): the Vale's paddies take the
wet slot in a region with paddies and no lake shore. `ground.redsoil`: the base or terrace slot of a drier region.
`rock.basalt.vesicular`: the cones' rock. Plume card: `card.grass.thatch` (section 11's default).

**Where this differs from section 6:** the order follows the shader's roles, not section 6's list. Courtyard paving *is* a
layer: Godot's pave zone selects slot 5, so a set without paving would put meadow under Erehwon's courts. It takes the
same set as the kit's court tiles, so the two read as one. Alpine replaces red soil and the paddy, as the XS1 brief asked.
**No new texture gap:** every layer's set is in the library, and the paddy and `stone.ghat.wet` were already owed
(sections 59 and 60).

**XP1's part (looks, after Stage 8):** `terrain.gdshader` hard-codes each layer's mean colour and tile
(`layer_mean_lin`, `layer_tile_scale`): read them from the set's `layers.json` instead. Set the high selector's band for
Xanadu (it is Oidong's 2850-3350 m). Split talus from the painted terraces in slot 3.

## 7. The route

Four stops, the stack's three hours (12:00, 16:20, 22:00), `tools/route_tracks/xanadu.json`:

| Stop | Web | Godot | Fallback |
|---|---|---|---|
| `city_block` | Erewhon's page, its view "Citadel — the Golden Way" | the Erehwon place, the same view | |
| `water_ground` | the lake-shore region, on Phish-Mārkiṭ's shore (`sxanlkfish01`) toward the isle Wesṭ-Āil, east across the lake to the caldera wall | `world-xanadu-lake-shore` | Māuṭh (`sxanmouth01`, north shore), due south across the lake, until Phish-Mārkiṭ is built |
| `forest_edge` | the lake-shore region, 45 m inland (south) of Gārḍan (`sxanlkgarden01`), looking at its orchards | the same | Phēr's view "The fair ground" (its rim plain), until Gārḍan is built |
| `door_transition` | Erewhon's page, block `xa_cit_vizier`: from the pool garden 6.5 m before the garden face's middle arch, through it into the loggia | the Erehwon place, the same block | `door`: `cit.vizier.d.loggia.garden.1`, the arch's portal in XS2's room graph (`claude/citadel-room-graph`: the outdoor garden to the loggia, open, 6 m) |

Stops are keyed to what survives Stage 8's re-bake: site ids, the pages' named views and the kit's blocks, never
coordinates. XP1 adds the two new stop kinds to the harnesses: `page_block` and `openworld_site_shore` (`openworld_site` is
`openworld_hamlet` by a site id).

## 8. Found on the way (not this session's to fix)

- The Azure Dream's build fails on this branch: `external fragment 20-core-walk.js clashes with a fragment already in the order`.
- `kits/xanadu/tex/` and `settlements/xanadu/tex/` are a pack behind (`xJaliC`, section 2). Stage 8 re-packs.
- Strongwall's and Thalaba's builds need `scipy` (`ground_fragment`). The Flashing Eye's build leaves an untracked
  `gen/39fe-world-data.js`.
- `PORT-BASELINE.json` is behind every Xanadu page on this branch (section 2).

## 9. Run

```
node core/materials/classes/test-class.js
node settlements/xanadu/tests/test-xs1-stack.js
python3 tools/textures/mclass.py --prove
python3 tools/textures/mclass.py --prove --ref origin/claude/vertical-stack
python3 tools/textures/m1_class_gates.py --ref origin/claude/vertical-stack kits/xanadu kits/qiblai settlements/flashing-eye settlements/kirstabal settlements/thalaba kits/tungang
```
