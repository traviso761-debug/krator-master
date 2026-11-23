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
| **cutout** (after XS0) | `xy6` | `oct8` + `mipVariance` | **yes** | **never** | no | no |
| **card** | none | none | (n/a) | **never** | no | no |

What each holds:

As corrected after XS0 (section 10):

| Build | glazed | relief | flat | cutout | card |
|---|---|---|---|---|---|
| `kits/xanadu`, `settlements/xanadu` (48 each, identical) | `xZel` `xHaft` `xMuqT` `xBTile` `xPietra` `xMarW` `xMarK` **`xTiles`** (8) | `brick` `stone` `rubbleK` `xRubble` `xSandR` `xRock` `xYes` `xEarth` `paving` `shingle` `thatch` `timber` `wood` (13) | `plaster` `xWash` `concrete` `concreteR` `cloth` `clothR` `tarp` `corrugate` `verdigris` `white` `whiteWorn` `icefloor` `icewall` `woodV` `xOpArt` `xPenbey` `xMarble` `xMarbleB` `xMarbleW` `xMosC` `xMosD` `xBandC` `xBandR` `xGiltC` (24) | `xSun` `xValance` | `xJaliC` |
| `kits/qiblai` (10) | `qGilt` (an exception) `qLacq` | `qAshlar` `qCobble` `qDirt` `qFlag` `qGrass` `qMarble` `qPlank` | `qRug` | | |
| `settlements/flashing-eye` (14) | the Qiblai kit's, alike | the Qiblai kit's, and `feAsh` `feCinder` `feColumnar` `feScoria` | `qRug` | | |
| `settlements/kirstabal` (8) | | all eight (the ground sets, the slate `xSlate` `xSlateD`) | | | |
| `settlements/thalaba` (4) | | all four (ground sets) | | | |
| `kits/tungang` (39; Lightwall draws its Glazier set) | `celadon` `gilt` | `carved` `ground` `hewn` `pole` `potch` `rockface` `stone` `turf` `wood` | the other 28 (washes, cloth, metals, bone, `ice`, the nine `f_*` furniture detail maps) | | |

Phēr, Strongwall, Viridian, the Azure Dream and Qiblai's city pack nothing of their own: they draw the Xanadu kit's pack
(through Xanadu's page) and the Qiblai kit's (`packFrom`). Lightwall draws the Qiblai kit's and Tungang's Glazier set.

**The stack's rule against the classes, as XS1 first read it** (on the library record's roughness after `roughLift`; section
10 judges it on the packed map instead and supersedes these two lists):
- *Glazed by name* (the rule misses them; the plan names them): `xMosC`, `xMosD` (0.35, on the line), `xBandC` (0.4),
  `xBandR` (0.8), `xGiltC` (0.6), `xTiles` (0.375); `qGilt` (0.415 after its lift), `qLacq` (0.46); Tungang's `gilt` (0.35).
- *Taken by the rule, left flat*: `icewall` and Tungang's `ice` (`ice.clear`, 0.28): not on the plan's list. XS1 said only the
  scrap target and the Fellgang set draw them; XS0's GPU run found `icewall` drawn on Erewhon, the kit sheet and Blakhed, and
  Tungang's `ice` on Blakhed. They stay flat by the owner's choice (section 10).

**Where this differs from `STACK-PLAN.md` section 5:**
- **`xTiles` is glazed.** Section 5 keeps it a courtyard material, but it is also the tile of Erewhon's domes, bulbs and
  drums (`kits/xanadu/src/71-xa-mat.js`: `xDomeT`, `xBulbT`, `xDrumT`): the curved glazed case M1 exists for, until
  `tile.dome.bannai` (owed, section 60) replaces it there. It costs 30 KB.
- **The three polished marbles packed `mapOnly`** (`xMarble`, `xMarbleB`, `xMarbleW`) are flat. They carry no normal map
  to promote; the check refuses `glazed` on a family with no lit normal. If they are ever lit, they become glazed.
- **Not yet in any Xanadu `materials.json`**, so not classed: `stone.marble.ashlar`, `wall.rubble.limewash` and
  `tile.dome.bannai` (owed). Each takes the class its values give when a family wires it; the test fails until it has one.
  `roof.tile.celadon`, `tile.hex.ceramic`, `wood.lacquer.crimson` and `glass.moonglass` are dropped from the Xanadu lists
  after XS0 (section 10): no Xanadu pack carries them.

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

After XS0 (section 10) one more line is owed: the `cutout` class (and `card`) has `height: "never"`, but the stack's
`process()` writes a Poisson height into the colour map's alpha of **every** lit family under packFormat 2, and `xSun` and
`xValance` are drawn with `alphaTest`, which reads that alpha. So `process()` must take `alphaMode 'none'` when
`S['height'] == 'never'` (no `h_arr`). `m1_class_gates.py` now fails Gate 1 on them at the stack's ref until it does.

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
node core/materials/classes/test-page-pack.js
python3 tools/textures/mclass.py --measure          # after a re-pack: the packed roughness the classes are derived from
node settlements/xanadu/tests/test-xs1-stack.js
python3 tools/textures/mclass.py --prove
python3 tools/textures/mclass.py --prove --ref origin/claude/vertical-stack
python3 tools/textures/m1_class_gates.py --ref origin/claude/vertical-stack kits/xanadu kits/qiblai settlements/flashing-eye settlements/kirstabal settlements/thalaba kits/tungang
```

## 10. Fixes after XS0 (2026-11-23)

XS0 (`claude/xs0-measure`, `XS0-MEASURE.md` section 5) measured what the pages draw and found the class table disagreeing
with the stack's measurable rules. Fixed here, still data only: no page, pack or look changes (proof at the end).

### The rule, judged on what the pages draw

The glazed rule (`specular >= 0.45`, roughness `< 0.35`) is now judged on the **mean of the family's packed roughness map**
(`core/materials/classes/m1-measured.json`, written by `mclass.py --measure` from the committed `tex/`), not on the library
record. The two differ most on the pattern sheets and on `qLacq` (record 0.46 after its lift, packed 0.313). Every family's
class is now **derived** from its values (`10-mat-class.js` `derive()`): a library card is `card`; a family the kits draw with
`alphaTest` is `cutout`; the rule's hits are `glazed`; the rest `relief` or `flat` (the values do not separate those two, so
either passes), a `patterns/` sheet `flat`. `test-class.js` fails on any disagreement that `m1-classes.json` does not declare
as an exception, on an exception the values have come to agree with, on a measured row older than `tex/pack.json` (its
roughness source sha1 and `roughLift`), and on a `"cutout"` flag that does not match the kits' `MAT` definitions.

### What changed

| Family | Build | Old class | New class | Why |
|---|---|---|---|---|
| `xMosC` | `kits/xanadu`, `settlements/xanadu` | glazed | flat | packed roughness 0.381: fails the rule; a `patterns/` sheet |
| `xMosD` | the same | glazed | flat | 0.354: fails (on the line) |
| `xBandC` | the same | glazed | flat | 0.423 |
| `xGiltC` | the same | glazed | flat | 0.558 |
| `xBandR` | the same | glazed | flat | 0.809 |
| `xSun` | `kits/xanadu`, `settlements/xanadu` | flat | **cutout** (new class), `"cutout": true` | drawn with `alphaTest: .5` (`kits/xanadu/src/71-xa-mat.js`): its map's alpha must never carry a height (Gate 1) |
| `xValance` | the same | flat | **cutout**, `"cutout": true` | the same (alpha from the map's luminance, then `alphaTest`) |

No roughness was changed: their looks wait for Stage 8.

**Kept by the owner's choice** (2026-11-23, "keep 3 choices"), declared in `m1-classes.json` `exceptions`, which the drift test
passes: `xTiles` stays **glazed** (its packed roughness map measures **0.876**, where XS1 read the record's 0.375; the domes',
bulbs' and drums' tile); `qGilt` stays **glazed** (0.411: `metal.gold` with a 0.1 lift; XS1's call, kept: STACK-PLAN section 5
had the metals flat, XS1 classed the gilts glazed, and that stands; Tungang's `gilt`, the same set unlifted at 0.345, is glazed
by the rule); `icewall` and Tungang's `ice`
stay **flat** though the rule takes them (0.272 and 0.192). The S4 set is unchanged (courtyard paving and alpine in, the paddy
and red soil held).

**Already right, confirmed on the packed maps:** Tungang's `celadon` (0.233, specular 0.6) and `gilt` (0.345, specular 0.8) are
glazed; `qLacq` (0.313) is glazed, now by the rule rather than by name.

**Packs a Xanadu page draws that had no class** (XS0's GPU run): classed now by the same rule, so Stage 8's `pack.py` will not
refuse them, and in the drift test: Dalab's (49: 19 relief, 29 flat, the banner a card; its patterns flat, earth, masonry, roofs
and timber relief, and the names it shares with Xanadu's pack as Xanadu classes them), the Ancient Transit's (10: asphalt,
ballast, slab paving and rubble relief, the metals, paint and board concrete flat), the catalog's furniture detail maps (63, all
`mapOnly`: flat) and Oidong's (24: ten leaf and bloom cards, the fourteen `mapOnly` barks and grounds flat). None is a rule hit.
**Nulab's and Blakhed's own ground sets** are on the integration line, not on this branch: `test-class.js` lists both and
demands every family classed and agreeing the moment their `materials.json` is here (`mclass.py --measure` takes them too).

**Dropped from the Xanadu class lists** (`STACK-PLAN.md` section 5, section 1 here), as no Xanadu pack carries them:
`roof.tile.celadon` (the Eternian kit's pack), `tile.hex.ceramic` (Pylon's), `wood.lacquer.crimson` (the desert and ash
nomads', Islanders', Scyvoi's, tents', Lizardmen's and Longsong's) and the Glaziers' moonglass (drawn procedurally on
Lāiṭwāl; no library family). None was moved into another pack's class list: those builds carry no classes yet.

**The new class, `cutout`**: lit like flat (`xy6` on the web, `oct8` + `mipVariance` in Godot, Gate 1 `flat`), height
**never**. Stage 8 owes one line for it (section 4): the stack's `process()` writes a Poisson height into every lit family's
alpha. `m1_class_gates.py` now fails Gate 1 on any `height: never` class packed with a height, so at the stack's ref it
reports `xSun` and `xValance` (4 failures: web and Godot each) until Stage 8 adds it.

### Owner question

**The five that fail the rule: keep them non-glazed, or lower their roughness at Stage 8 so they qualify?** `xMosC` (0.381),
`xMosD` (0.354), `xBandC` (0.423), `xGiltC` (0.558), `xBandR` (0.809). The pattern sheets carry the grout and
the painted ground in the same roughness map as the glaze, so the mean sits above 0.35 though the tiles read glossy. Lowering
them (a negative `roughLift`, which `pack.py` does not use anywhere yet, or the sheets' roughness re-made) would make them glazed and add their
8-bit normals (+119 to +198 KB each, XS0 section 5); keeping them saves that and leaves their looks as they are.

### Per-page packs (opt-in)

Every page built on Xanadu's page shipped the whole Xanadu pack (47 families packed: `xanadu.tex.xanadu.js` 13.86 MiB +
`-2.js` 5.16 MiB) and, **inline**, the whole Vale biome pack (`xanadu-bio`, 41 families, 5.11 MiB of the page), whatever it drew.

- **The data**: `settlements/xanadu/page-packs.json`, keyed by the page's path: per pack key the families the page keeps, and
  the run they were derived from (`record`: the families decoded and drawn, the views, the renderer). Recorded by
  `tools/textures/page_pack.py record <page> --queries ?interiors=1` on the Arc lane: the page as shipped and with its walk-in
  interiors, after `renderer.compile` of the whole scene and through every preset view. A family is kept if the page created
  its image at all (bound to a material, composited or read), not only if it was in view.
- **The switch**: `settlements/xanadu/build.py --page-packs` (through `tools/build.py <build> --page-packs`). Off, the build
  reads neither `page-packs.json` nor `page_pack.py` and calls `matlib_pack.fragment` with `exclude=()`, as before. On, each
  page's Xanadu pack, kit pack and biome pack leave out what its row does not keep, and its sidecars are named after the page
  (`thalaba.tex.xanadu.js`), since two pages of one `dist/` may now differ. A page without a row carries whole packs.
- **The check** (at build time, on): the build stops if the page's pack would lack a family its recorded run decoded or drew,
  a family its own fragments name (`MAT.<f>`, `MAT['<f>']`, `kput('<f>'`, `KMAT.packed('<key>', '<f>')` in its kit's `src/`
  and its target), or if a row names a family the pack does not have, or has no run behind it. `test-page-pack.js` holds the
  faults and fixes, checks each recorded row against today's packs, and that the switch is off by default.
- **`pack.py --page <page> --out <dir>`** packs only the families one page keeps (into a folder of its own: `tex/` is every
  page's).
- **Stage 8** switches it on (TODO.md, "Ride along with the next all-builds rebuild"): re-record after the re-pack, make
  `--page-packs` the default, rebuild and publish the renamed sidecars.

What the four near-cap pages keep: the Xanadu pack **28 of 47** (the same 28 on all four: the families whose `MAT` keys the
shared Xanadu src defines), the Vale biome pack **0 of 41** (none of the four creates a single one of its images), and every
family of their own kit packs (Thalaba 4 of 4 and the Dalab 6, Kirstabal 8 of 8, the Flashing Eye's Qiblai 14 of 14, the
Azure Dream's Qiblai 10 of 10).

**Measured** (scratch builds on this machine, not committed; MiB against the 16 MiB cap):

| Page | Page before | Page after | Sidecars before | Sidecars after | Download before | after |
|---|---|---|---|---|---|---|
| Thalaba (`thalaba.html`) | 13.60 (85.0 %) | **8.48 (53.0 %)** | 19.02 | 11.82 | 32.62 | **20.31** (-37.7 %) |
| Kirstabal | 13.25 (82.8 %) | **8.14 (50.9 %)** | 19.02 | 11.82 | 32.28 | **19.97** (-38.1 %) |
| The Flashing Eye | 12.75 (79.7 %) | **7.64 (47.8 %)** | 26.49 | 19.29 | 39.24 | **26.93** (-31.4 %) |
| The Azure Dream (`azure-dream.html`, the isle) | 12.58 (78.6 %) | **7.47 (46.7 %)** | 24.02 | 16.82 | 36.60 | **24.29** (-33.6 %) |

Each page loses 5,359,203 to 5,359,214 bytes (the inline biome pack) and 7.20 MiB of sidecar (the Xanadu pack falls from two
parts to one of 11.82 MiB, 74 % of the cap). Thalaba's pieces sheet and the Azure Dream's other four pages have no row yet, so
they carry whole packs; Stage 8 records them.

**GPU verify (Thalaba, the Arc lane, `KRATOR_GL=gpu`, all 13 views and `--assert`):** the whole-pack page and the per-page
page both pass every assert (the town's six: `thalaba-laid`, `on-the-model`, `people`, `water-on-core`, `people-walk`,
`expedition-season`; and the harness's: `textures-decoded` 115 of 115, `shader-programs`, `gpu-renderer` on the Arc, samplers 6,
every view's eye clear). **The views are the same in all that the pack decides:** a second run of the whole-pack page against
the first differs by as much (0.08 to 22.8 % of a view's pixels) as the per-page page does against either (0.07 to 23.3 %), and
the overlays show only the townsfolk and the swaying palms, which the simulation moves differently each run. So screenshots
cannot be byte-identical on this page; the texture side was checked directly instead: `page_pack.py record` on the per-page
page (as shipped and `?interiors=1`, 27 views) finds **the same families decoded (Xanadu 28, Dalab 6, Thalaba 4) and the same
drawn (Xanadu 21, Dalab 4) as on the whole-pack page**, from the same `tex/` bytes: every material binds the same images.

**Blakhed and Nulab** are not on this branch, so they are not in this proof. XS0's run says what they would gain: Nulab draws
none of the Xanadu glazed families and the Flashing Eye none either, yet both download the whole Xanadu pack; Blakhed's largest
sidecar is Tungang's pack (`blakhed.tex.tungang.js`, 14.14 MiB, 88 %). Record both (`page_pack.py record`) once this lands on
the integration line; Blakhed's Tungang pack is subset by the same `exclude` once its row lists the `tungang` key (its build
must then pass `_ex` to that pack's `fragment` call too, if it is not one of the three this build makes).

**Stage 8 item, not changed now: Blakhed's samplers.** XS0's GPU run: Blakhed's ground program links 12 samplers as shipped,
13 with a shadow and 15 with KHORIZON (the harness's warning line; ANGLE on the Arc fails at 16). Its ground (eight layers,
`tTurf` to `tShin`, three masks) takes the `v3_arrays_three_maps` runtime assembly at Stage 8, whatever its classes.
Kirstabal, Nulab and the Flashing Eye (9, 10 with a shadow, 12 with KHORIZON) are the next to move if the array is built.

**Byte-neutral now:**
- *The classes* (`materials.json` in `kits/xanadu`, `settlements/xanadu`, `kits/qiblai`, `settlements/flashing-eye`): no build
  opens a `materials.json` (none is in any `build-inputs.json`: builds read `tex/pack.json`), and `mclass.py --prove` shows
  `pack.py` reads neither `class` nor `cutout` (today's and the stack's).
- *The switch* (`settlements/xanadu/build.py`, `pack.py`): off, the code paths are the ones before (`exclude=()`, the old
  sidecar name, no new file read). Rebuilt before and after on this machine with the switch off: **Thalaba, Kirstabal, the
  Flashing Eye and the Azure Dream, 19 of 19 pages and sidecars identical** (the Azure Dream with XS0's local `kit.json` patch,
  not committed). The other Xanadu pages read the same lines, which the switch leaves alone.
