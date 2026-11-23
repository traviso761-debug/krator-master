# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 8 prompts** (2026-11-22: +2, Xanadu on the vertical stack, `ground.paddy.wet`, `tile.dome.bannai`, section 60. 2026-11-22: +3, Xanadu's lake towns and mines, `stone.ghat.wet`, `ground.sherds`, `ground.tailings.ore`, section 59. 2026-11-17: +2, the Xanadu kit's works pieces' `ground.dyeworks` and `ground.sulfur.crust`, section 58 (the second). 2026-11-17: +1, Kirstabal's `wall.slate.coursed`, section 57 (the second). 2026-11-17: 25 delivered, the first sections 57 and 58 and the Tungang section 43, the archive has them: 12 easter eggs for Erewhon's walls (the Ancient Mariner, Samuel Butler, Caves of Qud, Kenshi), 10 hangings for Erewhon's citadel (Kubla Khan and the suzani), and the Tungang kit's `patterns/tungang/loj-banner`, `loj-banner.b` and `enamel-signs`. The
owner's Codex batches delivered the rest: 22 new sets on 2026-11-16 (`PLAN.md`, "Delivered 2026-11-16"), and, merged here the same day
("keep the installed 2026-11-12 takes, merge them here"), the 2026-11-12 batch's 63 sets from `claude/textures-2026-11-12`, whose
entries are in `PROMPTS-archived.md`; every entry whose set is now in the library was taken off this list. None is wired yet: each
build wires its slot when its branch merges. `rock.megabreccia` keeps its 2026-10-26 set. Sections left without a prompt keep their
notes. Before that: 57 prompts, +3 for Opal Valley, section 55, merged from the Theodiga branch 2026-11-16; +11 for the Tungang kit's section 43 and glass.moonglass, merged from the Lightwall branch 2026-11-16; +3 for Grēṭ-Āil's Hall of Dreaming, section 56, 2026-11-16; +3 for the Xanadui fort, section 54, 2026-11-16; +3 for the mined goods' resource nodes, section 53, 2026-11-16; +6 for the Arch, section 52, and +3 for the Rift battery, section 51, at Integration 3, 2026-11-11; +3 for the Tiers, section 50; 19 fenced blocks, counted by their fences, and the Ancient Transit's three table rows at the second integration merge, 2026-11-11: sections 43-49 added since, the Ancient Transit, Firebliss, the NE outer wall and the Great Chasm among them; before that, 2026-11-10, after -22 delivered from sections 37, 40, 41 and 42: `PLAN.md`, "Delivered 2026-11-10"; the hand count before was 36, and two blocks had lost their closing fence; 2026-11-09: +11 for Erewhon's citadel, section 41; +2 for the Tents kit's army and Eternian cloths, section 42; +3 for the southern highlands' upper stations, section 37; +15 for the hyperjungle's lands and the savannah rims, section 40, 2026-11-08; counted 2026-11-04 before them). (+7 for the Qiblai kit, section 43: its gilt sheet and mantra drum, 2026-11-11, and the walk-in rooms' mural, coffer and temple rug, 2026-11-15; merged 2026-11-15)

**Delivered 2026-11-10:** 22 of sections 37, 40, 41 and 42 (Erewhon's citadel but the jali, the Tents kit's two cloths and the cedar, the
fellfield's two, seven of the hyperjungle's and the savannah rims'), `PLAN.md` "Delivered 2026-11-10": the citadel's, the tents' and the two grasses
wired and packed, the other eight in the library for their builds' next turn.

**Delivered 2026-11-03:** section 31's five (the Gills: `rock.lamina.pipe`, `mineral.crust.ferromanganese`, `mineral.crust.brucite`,
`card.breathfringe`, `card.turf.limed`) and ten owed on unmerged branches (High Rift, nwbay, nhighlands, ringisles, the rift rim, Copper Glacier),
`PLAN.md` "Delivered 2026-11-03": the ten are wired at their merge, and their entries are deleted on their branches then. Still owed from that
day: `rock.megabreccia` (nhighlands' branch) and `card.umbrella.plate` (the abyssal savannah).

**Delivered 2026-11-10** (`PLAN.md` "Delivered 2026-11-10"): `mineral.selenite` and `rock.limestone.ironstained` (section 36, the Cave
of Crystals), `rock.megabreccia.polished` (section 33, the Cut's face), `ground.bench` (section 14, Farside's scour bench) and
`card.umbrella.plate` (section 24, the abyssal savannah): installed and wired, their entries deleted here. Also `metal.scorched`, whose
entry lives only on the Ancient's Valley branches (`claude/ancient-vehicles-935f93`, `claude/ancientsvalley-7f521c`, their section 36):
in the library, not wired (the Motor Vehicles kit's `scorched` slot is on those branches); **delete that entry and wire the slot at
their merge**. Still owed: `rock.megabreccia` (section 32, nhighlands' crater wall: the polished slab is not it).

Open prompt files elsewhere in this folder (`PROMPTS-ready.md`, `PROMPTS-nomads.md`, `PROMPTS-iziz-beast-riders.md`) are older history; their open rows were copied here.

## How to deliver

- **Name each image after its id** (slashes become folders: `patterns/islander/gable-west.png`). Square 2048 px unless
  the entry says otherwise. A scan that matches is as good as a generated image.
- **Process.** Surfaces and pattern sheets: write a batch file in `tools/textures/batches/` (the exact prompt goes in
  `_source.prompt`, `"pattern": true` for a pattern sheet so it is cropped to its period) and run
  `python3 tools/textures/process.py --batch tools/textures/batches/<delivery>.json "<folder of images>"`. Cut-out
  sheets on magenta go through `tools/textures/cards.py` (its chroma key). Check every set on a contact sheet:
  `python3 tools/textures/preview.py <scratch>/sheet.jpg <set dirs>`.
- **Where sets land:** `core/materials/library/<id>/` or `core/materials/patterns/<culture>/<name>/` (`albedo.jpg`,
  `normal.jpg`, `roughness.png`, `meta.json`). Never commit an original or anything over 1024 px; `meta.json` records the
  source's sha1 and the prompt.
- **Wire it:** add the family to the build's `materials.json`, run `python3 tools/textures/pack.py <build>` (writes
  `<build>/tex/`, commit it), rebuild the build and verify it.
- **Then prune:** delete the entry here, add a line to a "Delivered" log in `PLAN.md`, and close the build's
  `KNOWN_ISSUES.md` item.

Conventions (`PLAN.md`, "Prompts for generated sources" and "Rules, from now"): every block starts with the base
template. **Near-colourless** (tintable) blocks end with the muting sentence and carry no tint hexes: the build's palette
colours them. **Full colour** blocks keep their hexes. Pattern sheets put "a flat, front-on decorative panel" in place of
"perfectly flat surface". Cut-outs are always on solid flat bright magenta (#ff00ff), never grey or white.

---

## 0. Redo: needs another take

Each is the original prompt with a correction at the end. The first take stays installed until the redo arrives.
**2026-10-15:** five of the six redos arrived (all but `patterns/tribal/formline`) and are in the library, **not wired**: each says which build to re-pack. Do those re-packs before the Godot export (`GODOT-PLAN.md`, "Before an export: textures delivered but not wired").

**2026-10-26:** Korona's two sets came off their prompts (`biomes/korona/KNOWN_ISSUES.md`, "Two textures came off their
prompts"); both are usable as installed, so the redos are the owner's call. Re-pack `biomes/korona` when they land.

## 1. Beast Riders (optional)

### The Beast Riders kit's tents (`kits/beast-riders`, 2026-10-19)

`kits/beast-riders/KNOWN_ISSUES.md`, "The thorn hedge has no texture of its own": the cut-thorn barrier
(`br_hedge_thorn`, `src/75-br-tents-bounds.js`) is thin branches of geometry with `bark.ironbark` on them as a detail
map. Lands as the family `thorn` in `kits/beast-riders/materials.json` (tinted: the branches keep their two palette
browns); `70-br-tent-kit.js` `BRT_THORN` then reads `'thorn/bark'`.

## 2. Northern Highlands

### The Northern Highlands (`biomes/nhighlands`): the new flora (2026-10-18)

Painted in code today (`biomes/nhighlands/KNOWN_ISSUES.md`, the new flora). The fan-leaf, the moss sleeves, the table
cedar, the serpentwood and the banyan have library candidates already (`card.ginkgo`, `ground.moss001`-`003`,
`card.spruce`, `bark.mossy`, `bark.smooth`): wiring them is the owner's call, no prompt needed.

## 6. necanyons (`biomes/necanyons`, 2026-10-19)

The north-eastern canyons, the hyperjungle's transition to Korona (`biomes/necanyons/PLAN.md` section 6, which lists the
library sets it reuses). The five required images were delivered on 2026-10-19 (see "Delivered 2026-10-19, necanyons"
below); `rock.sandstone.bedded.red` was delivered on 2026-10-18 for Pinnacle Rock and serves here too. The three optional sheets were delivered on 2026-10-25 (card.palm.fan, card.flametip,
card.treelily: PLAN.md, "Delivered 2026-10-25").

## 8. NW outer wall (`biomes/nwouterwall`, planned 2026-10-23)

The Yeti Kingdom's high country (`biomes/nwouterwall/PLAN.md` section 8, which lists the library sets it reuses:
`ground.tundra`, `ground.turf.polygon`, `ground.sphagnum`, `ground.lichen.crust`, the snows and ices, `card.lichen`,
`card.moss.hanging` and `card.beard` for the larch beard, `card.pine`, `card.spruce`, `card.stipa` for the plumegrass,
`card.heath`, `surface.cushion` for the cushions, the birch barks). Needed before the kit's N2.

**Built 2026-10-26** (`biomes/nwouterwall`, its own branch): everything section 8 asked for was delivered and is wired. Five plants
still draw a procedural stand-in (`biomes/nwouterwall/KNOWN_ISSUES.md`, "Procedural plants"); their cards:

## 9. Painted highlands (`biomes/paintedhighlands`, planned 2026-10-23)

The banded plateau by Korona (`biomes/paintedhighlands/PLAN.md` section 5, which lists the library sets it reuses). One
greyscale bedded tile tinted by the strata field (cheaper, preferred), and the bloom's flowers.

## 10. The Cut (`biomes/cut`, planned 2026-10-23)

The eigenweapon's bowl and its warped flora (`biomes/cut/PLAN.md`). Reuse: `bark.bamboo.jade` for the hyperbamboo's
culms (scaled up), `ground.salt` and `ground.efflorescence` on the flats, the NW lowlands' sets for the floor's forest.

## 11. The Bowl (`biomes/sedesert`, `PLAN-BOWL.md`, planned 2026-10-23)

The abyssal salt lake in the eastern desert. Reuse: `ground.salt`, `ground.efflorescence`, `ground.playa.red`,
`ground.clay.popcorn`, `card.tamarisk`, `bark.saxaul`, `card.samphire` for the glasswort (green; tint its crimson), the
kit's own sets. The banded shallows are water tints, not a texture.

## 12. The Catch (`biomes/catch`, planned 2026-10-23)

The sealed basin, its sand sea, its five oases and its salt (`biomes/catch/PLAN.md`). Reuse: `rock.yardang.silt` (above)
for the lake beds, `card.tamarisk`, `card.reed`, `ground.gravel019` and `ground.gravel042` for the reg, `card.saltbush`
(above) on the fans.

## 13. The rift rim (`biomes/riftrim`, planned 2026-10-23)

The three rims (`biomes/riftrim/PLAN.md` section 3 and 10). Reuse: `card.rheumleaf` for the rimroot, `card.fin.membrane`
for the sailwort (tinted rust), `card.moss.hanging` and `card.beard` for the veil thread (tinted copper), `card.heath` for
the prism heath (the kit tints it by season), `ground.sphagnum` for the moor sponge, `card.groundsel`, `ground.tundra`,
`ground.lichen.crust`, the snows and ices, and the Rift's, the SW lowlands' and the S highlands' own sets for the borrowed
species.

## 15. Crop and garden cards: the Ring Sea isles and Guilin (2026-10-26)

`biomes/ringisles/KNOWN_ISSUES.md` (rice and cane blades procedural; greens and sweet potato on a wrong `card.paddle` cell)
and `biomes/guilin/KNOWN_ISSUES.md`, "No cards of its own" and "The plain's grass". Each card stands upright on the bottom
of its cell (the clump quads draw v up). Reuse, so no prompt: the banana's leaves are `card.paddle` turned upright in code
(`libCell(..., rot)`, as the crater drylands do); Guilin's bamboo leaves take `card.bamboo.giant` (in the library since
2026-10-26); its lotus pads `card.lotus` and `ground.lilypond`; its osmanthus `card.osmanthus` (section 30); its ferns and moss
`card.fern.green`, `card.fern`, `card.moss`.

## 16. Catalog hangings: the Screamers (the Eastern Abyss reuses a set) (2026-10-26)

`PLAN.md`, catalog audit, "No pattern sheet at all". Style read of `kits/catalog/krator-master-furniture-screamer.js`:
the tapestry kind is `figure` ("Painted hide hanging"), motif `dots`, the court's `skull`, cloth family `hide`; palette
feather red #c8342a, yellow #e0b030, blue #2a6aa0, hide tan #9a7a52, black #2a2622, bone #e6dcc6. Lands as
`patterns/screamers/hide-figure` (a `tapestry` row in the Screamers' and the catalog's `materials.json`).
**Eastern Abyss, reuse, so no prompt:** its hanging is `grid` with the `lozenge` motif in indigo, saffron, madder, white
and turquoise (`krator-master-furniture-eastabyss.js`), which is `patterns/common/kilim-star` (a stepped-diamond kilim in
madder, saffron, teal, indigo and cream); its mosaic panel takes `patterns/common/mosaic-star-lapis` or `zellige-blue`.
(Nomad has `patterns/nomad/` and the Lizardmen `patterns/lizardmen/`: both delivered.)

## 17. The shared detail sets (`detail.*`, for the record's `detail` field) (2026-10-26)

`PLAN.md`, "From spiderbench": a tiling micro-relief normal blended over the base normal at close range, one shared set
per surface kind for every culture. The field is not built yet (`TODO.md`), so these are the lowest priority: deliver them
before it is. They are relief only: near-uniform, with no feature that would show when a tile repeats every 25 cm.
**Metal brush, reuse, so no prompt:** `metal.steel.brushed` (its normal, at a finer tile).

## 18. The Eternian kit (`kits/eternian`, list agreed by the owner 2026-10-26)

`kits/eternian/PLAN.md` section 10. Only the surfaces with no set get a prompt. **Reuse, so no prompt** (most already in
`kits/eternian/materials.json`): the celadon glazed tile is `roof.tile.celadon` (roofs) and `ceramic.celadon.crackle`
(ware, glaze); the alabaster is `stone.alabaster` (a colour map only: no separate thickness map exists, so the
translucency reads from its albedo); the pattern block is `concrete.block.relief` and its takes `.b`-`.e`; the verdigris
copper sheet is `metal.bronze.verdigris`; the culture pattern sheet is `patterns/eternian/circuit-maze` (`.b`, `.c`;
tinted gold on black or white on black); the fish-scale roofs are `metal.scale` and `roof.scale.gilt`; the bronze is
`metal.bronze.cast`; the glazed scale look `patterns/highlands/tile-*`; the Ancient white panels `metal.ancient.white`; the
tracery's grid is `patterns/eternian/screen-pierced` (`.b`), a keyed, tiling pierced cast-bronze screen on magenta. Not
covered: the brick (the kit tints the plain `brick` set today) and the tracery's three window heads.

## 24. The abyssal savannah (`biomes/abyssal-savannah`, 2026-10-26)

`biomes/abyssal-savannah/PLAN.md` section 10. **Reuse, so no prompt:** `card.grass.dry`, `card.ichu` and `card.rankgrass`
for the grasses, `card.saltbush`, `card.flower.bloom.highland`, `card.firelily`, `card.charred`, `card.acacia` (the
umbrella tree), `card.heartleaf` (the tongue tree), `card.broadleaf` (the kopje fig), `card.fern`, `card.palm` (the Vain
fronds), `bark.cork`, `bark.lepido`, `bark.armored`, `bark.smooth`, `rock.granite.tor`, `rock.sandstone.bedded.red`,
`ground.redsoil`. Two gaps: the ground under the tall grass and the tall grass itself (its stand-ins: `ground.redsoil`,
and `card.grass.dry`'s knee-high bunchgrass drawn three metres tall).

## 27. The southern highlands' last canvases (`biomes/shighlands`, 2026-10-26)

The known-issues pass wired the library over most of the kit's own canvases (the ferns, straps, daisies, the paramo's
bunchgrass, the trumpet's and the frill tree's ribbing, the volute's rind, the tree fern's scars: `biomes/shighlands/materials.json`).
Two have no set: the banded bark of the ruffle-crown and the corkscrew cereus (`SHIGH.barkTex(5)`, bucket `bark5`), and the
escargot begonia's leaf (`TX.shell`, full colour). Each lands as a family in `biomes/shighlands/materials.json`: `bark.banded.ring`
in `LIBBARK[5]` of `50-biome-shigh-species.js` (grey detail, `keep` 0), the begonia sheet as `begonia` through `libCell`
on `M.shell` (full colour, `keep` 1: the instance colour is near-white).

## Gaps resolved without a prompt (2026-10-26)

Each was on the old "Gaps with no prompt yet" list or in a build's notes; an existing set covers it, so the work left is
wiring (a `materials.json` row and code), not an image.

- **The Iziz Vernacular's trade surfaces** (`settlements/iziz/KNOWN_ISSUES.md`, the trades round): the dyed cloth lengths
  take `cloth.weave.plain` (or `cloth.plain`) tinted per dye, in place of the tinted tarp; the crags of the mine and the
  quarry take `rock.rock_face` on world UVs (the city's `cityRock` family already maps it); the mill race and the moat
  landings want `core/water`'s shader, not a map (`kits/catalog` notes water "wants the shader, not a map").
- **The Throne's drawn details** (`PLAN.md`, The Throne): the star aloe's head and the trumpet tree's funnels were
  delivered on 2026-10-06 (`card.flower.staraloe`, `organic.funnel.trumpet`; `meta.json` says in use); the mat's veins
  take `organic.flesh.cells` (cells parted by pale veins) as a grey detail map, the veins tinted by the instance colour,
  over `ground.mycelium.crimson`; the lamp caps' dishes take `organic.fungus.gill` (radial gills, mapped from above) as a
  grey detail under the glow; the frill pods are only the no-pack fallback of the ruff (`55-biome-throne-trees.js`
  `ruffAt`: with the pack it draws `card.frond.frill`).
- **Dhelv's spur walls** (`settlements/dhelv/KNOWN_ISSUES.md`, "a jointed basalt colonnade would suit"): `rock.columnar`
  or `rock.basalt.polygonal`.
- **Ys's Ancient tower panels** (`settlements/ys/KNOWN_ISSUES.md`, "no prompt for them yet"): `concrete.ancient`,
  `concrete.ancient.b`, `metal.ancient.white` and `concrete.rust.streaked`.
- **The crops kit's fibre cards** (`kits/crops/FIBRE.md` section 5: cotton, flax, nettle): delivered as
  `card.crop.cotton`, `card.crop.flax` and `card.crop.nettle`.
- **The mechs' feathers** (`kits/mechs/KNOWN_ISSUES.md`): `card.feather.archae` and `card.feather.crest` exist; the gap is
  UVs on the feather triangles, not an image.

## 20. The Godthrone and the airless rim (`biomes/godthrone`, planned 2026-10-26)

The titanium shield volcano, its glass halo, the orange belt, the bloodfalls and the airless crest
(`biomes/godthrone/PLAN.md` section 8). Reused from the library: `ground.lava.aa`, `ground.lava.crust`,
`ground.lava.veins`, `ground.obsidian`, `ground.sand.black`, `ground.scoria`, `ground.cinder`, the `rock.basalt.*` sets
(tinted near-black with a cool sheen for the titanium basalt), `rock.columnar` (the escarpment's colonnades),
`stone.pumice`, `ice.glacier`, `ice.clear`, `ground.snow011`, `ground.travertine.white` (under the rust terraces' tint).
Needed before the kit's G1.

**Station 1 built (2026-10-26):** the plan's own sets are all in the library now (`ground.beads.orange`, `rock.palagonite`,
`card.pele.hair`, `rock.megabreccia`, `rock.tafoni`, `ice.debris`, `ice.rust`, `ground.rust.terrace`, `ground.riverweed.red`);
the page wires `ground.beads.orange`, `ground.sand.black`, `ground.obsidian`, `ground.scoria`, `ground.cinder`,
`ground.lava.crust`, `card.pele.hair` and `concrete.ancient` (`biomes/godthrone/materials.json`). **One stand-in**: the
titanium basalt's grain is `rock.basalt.flowbanded` grey under KSTRATA's colours (the plan allows a tint). The optional
`rock.basalt.titanium` (the ilmenite sheen in the map) was delivered 2026-10-27 (`PLAN.md`, "Delivered 2026-10-27"): not wired yet.

## 22. The SW highlands (`biomes/swhighlands`, planned 2026-10-26)

Native fungoid life on the Inner Wall's south-west sector (`biomes/swhighlands/PLAN.md` section 8). Reused from the
library, so not asked for: `organic.cap.porous` (the bead cone), `organic.flesh.cells` (the cell lamp, tinted yellow),
`organic.fungus.bracket` and `organic.fungus.gill` (the shelf coral, tinted orange), `organic.lattice.cage` (the lattice
oak's gaps), `bark.whorled` (the whorl column), `bark.boojum` (the bottle brush), `bark.twisted.red` and `bark.mangrove`
(the stilt pod tree's stilts), `skin.alien.banded` (the banded coral), `card.alienflora.glow` and `card.mushroom.glow` (the
glow tubes), `card.fungus.drip` (the drip cap), `card.beads.bell` (the bead cone's eggs), `card.vine.hanging.*` and
`card.streamer` (the weeping wisp), `card.tendril` (the fishing bridge's vines), `card.carnivore.*` and
`card.pitcher.trumpet` (the bulb trumpets), `card.flowerspike` and `card.firelily` (the torch spike),
`rock.limestone.karst`, `rock.sandstone.navajo`, `ground.moss001`-`003`, `ground.sphagnum` (the hanging swamps); the glass
tower is `biomes/ehighlands`' own. Needed before the kit's H1.

Station 1 was built 2026-10-26 on the delivered sets (`biomes/swhighlands/materials.json`). Its two stand-ins' own sets,
`card.turf.native` and `ground.turf.native`, were delivered 2026-10-27 (`PLAN.md`, "Delivered 2026-10-27"): not wired yet (today
`card.moss` tinted pale and `ground.grass_ground`, an Earth grass).

## 23. Godstep valley (`biomes/godstep`, planned 2026-10-26)

The titanium lava staircase (`biomes/godstep/PLAN.md` section 7). Reused: `ground.lava.aa`, `ground.lava.crust`,
`ground.sand.black` (the black dunes), `ground.scoria` (tinted red for the flank vent's crater), `ground.cinder`,
`rock.basalt.*`, `rock.columnar` (the colonnades), `ground.redsoil` (the redlands' soil), `ground.playa.red` (the
lava-dammed playas, tinted pale), `rock.palagonite` (section 20). Needed before the kit's D1.

## 25. The Yeti kit (`kits/yeti`, 2026-10-25)

## 26. The Outlands (`biomes/outlands`, planned 2026-10-26)

The walled basin beyond the Gate (`biomes/outlands/PLAN.md` section 11): a native fungoid flora (violet, teal, rust, copper
green; no leaves, no flowers), cold steppe and desert, a salt lake, copper-stained gem hills, the fog woods. **13 prompts**
(this section raises the count above by 13). Reused: `ground.steppe`, `ground.puna`, the gravel scans, `ground.salt`,
`ground.efflorescence`, `rock.malachite`, `rock.gossan`, the basalt sets, `ice.clear`, `ground.turf.polygon`,
`ground.lichen.crust`, the fungoid `organic.cap.*`, `organic.fungus.bracket`, `ground.mycelium.gold`, `card.fungus.drip`,
`card.shelf.glow`, `card.palm`. Also needed here and owed above: `rock.badland.bedded` (section 9), `ground.salt.ochre` and
`ground.soda.crust` (sections 11, 12), `organic.pod.honeycomb` and `organic.lichen.plates` (section 17). Needed before the
kit's O2.

## 29. The Throne's plume flora, the last procedural parts (`biomes/throne`, 2026-10-26)

`biomes/throne/KNOWN_ISSUES.md`: the chalice's skirt, the braid cap's vines, the geode pods, ember burrs, wire stalks, gold
pins, blood chalices and the snare rafts' runners. Only the geode's crystal lining has no near set. **Reuse, so no
prompt** (each tinted by its species colour): the chalice parasol's fluted skirt `bark.frill.ribbed` (fluted, ringed);
the braid cap's strangling vines `bark.twisted.red` (twisted fibrous strands, as the rope-tree's); the geode shells
`stone.pumice` or `rock.basalt.vesicular` (cracked grey stone); the blood chalices' flared trumpets
`organic.funnel.trumpet` tinted crimson; the wire stalks and the rafts' runners `organic.tendril.banded`; the gold pins
`card.mushroom.glow` cells if they become cards (as tiny geometry they want no map). The ember burrs have no UVs
(`G.burr` writes 0,0): a map needs UVs first, and their glow is the look.

## 30. Guilin's osmanthus (`biomes/guilin`, 2026-10-26)

`biomes/guilin/KNOWN_ISSUES.md`: the osmanthus shares `card.broadleaf` tinted, and `card.osmanthus` is owed (its flowers
are the point; `card.croptree.glossy` has the leaves but no flowers).

## 32. The northern highlands' bog country and the crater wall (`biomes/nhighlands`, station 5 and station 1's crags, 2026-11-03)

Pair 7's turn (`biomes/nhighlands/PLAN-STATIONS.md`, "Core adoption (pair 7)"). The 2026-11-03 delivery brought the bog's three (`ground.peat.hag`, `card.dwarfbirch`, `card.sedge.fen`: `core/materials/PLAN.md`, "Delivered 2026-11-03"); the crater wall's
rock is still owed. Until it comes the megabreccia is KSTRATA's and KGROUND's procedural blocks (`clast`, no grain map).

## 38. The Ring Sea isles' lagoon station (`biomes/ringisles --station lagoon`, 2026-11-03)

Numbered 32 until 2026-11-08 (three branches each took 32; a stale second copy of section 32 was dropped then). `ground.coral.rubble` is in the library
(the owner's 2026-11-03 batch, `tools/textures/batches/owner-2026-11-03.json`, which cites it as "section 32 on claude/..."): prune this section once its build wires it.

The motu's storm ridges and the reef flat's back edge are coral rubble thrown up by the swells; the station paints them as the beach's sand
(`ground.coast_sand_01`, the paint's beach weight) until this set comes. Wire it as a `ground.rubble` slot in `biomes/ringisles/materials.json` and a layer in
`src/84-host-ground.js` (the station's storm ridge as its mask) at the next turn; with it the ground reads 17 units, so it must replace `shingle`, not join it.

## 39. High Rift (`biomes/highrift`, 2026-11-03)

Numbered 32 until 2026-11-08 (three branches each took 32; a stale second copy of section 32 was dropped then). `rock.hematite.mirror` is in the library
(the owner's 2026-11-03 batch, `tools/textures/batches/owner-2026-11-03.json`, which cites it as "section 32 on claude/..."): prune this section once its build wires it.

The Mirror Graben's fault mirror (`biomes/highrift/PLAN.md` sections 2 and 11): until it comes, station `mirror`'s fault face draws
`rock.basalt.oxidised` at a low roughness. Full colour, 2 m a tile, roughness low (the sheen is the point).

## 37. The southern highlands' upper stations (`biomes/shighlands --station conifers` and `--station fellfield`, 2026-11-09)

Stations 2 and 3 (`biomes/shighlands/PLAN-STATIONS.md`, "Built") are wired on library sets that already exist (`bark.twisted.red`, `bark.whorled`,
`bark.juniper`, `card.pine`, `card.spruce`, `card.juniper`, `ground.needles`, `ground.snow.drift`, `ground.lichen.crust`, `rock.rubble.sturzstrom`,
`surface.cushion`, `ice.glacier`; the spiral cones are geometry, not a card). One surface is still the kit's stand-in (the fines and the snail
rosettes' leaf arrived 2026-11-10: `ground.fellfield.fines`, `card.rosette.snail`, in the library and not yet wired: `PLAN.md`, "Delivered 2026-11-10"):

## 40. The hyperjungle's lands and the savannah rims (`biomes/hyperjungle` stations `savage` and `north`, `biomes/abyssal-savannah` stations `serim`, `erim` and `north`; J2-J6, 2026-11-08)

`biomes/hyperjungle/PLAN-LANDS.md` section 10's list, for the species built on 2026-11-08 with a stand-in each (named in the build's
KNOWN_ISSUES.md, "J2-J6"). The library sets already wired are not listed (bark.strangler, organic.pod.honeycomb, wood.silver,
bark.bamboo.jade, card.bamboo.giant, earth.termite and the rest). Wire each into the named build's `materials.json` when it comes (the rims' sets into `biomes/abyssal-savannah/materials.json`, on the rim stations' families: `build.py` `RIM_PACK`; the rims were built as `biomes/savannarim` and folded in there on 2026-11-08). **2026-11-10:** seven of the fifteen arrived (`bark.palm.spined`, `bark.tualang`,
`card.ghostpipe`, `card.grass.elephant`, `card.grass.themeda`, `ground.ironstone`, `card.leaf.miombo`: `PLAN.md`, "Delivered 2026-11-10"); the two grasses are wired,
the other five are in the library for the builds' next turn.

### The savage land (J2)

### The north, Screamer wood (J3)

### The savannah's base (`biomes/abyssal-savannah` rim stations, `blind` and `grass`, J4)

### The se rim (`biomes/abyssal-savannah` station `serim`, J6)

## 41. Erewhon's citadel: the Pleasure Domes and the Moorish and Mughal palaces (`kits/xanadu`, `settlements/xanadu/citadel`, 2026-11-09)

The owner's references (`settlements/xanadu/citadel/refs/`) and brief: the Pleasure Domes in black and white (the citadel's dome black over white, the Dome of the Bay white over black); the rest of the citadel Moorish and Mughal, psychedelic in its own way. **Reuse, so no prompt:** `metal.gold` (gilt trim, joints, rails), `rock.sandstone.red` (Mughal red sandstone), `plaster.white_stucco_02`, `rock.marble.white` where the marble is plain. The stripes, checkers and chevrons of the domes are geometry, not images. **2026-11-10:** ten of the eleven arrived and are wired in both
`materials.json` (`PLAN.md`, "Delivered 2026-11-10"), and `wood.cedar.moorish` (section 42, now pruned) with them, in the library for the kit to take up; the
jali card below is the one still owed.

## 43. The gypsum maze under Cube's plateau (`biomes/rift --station maze`, 2026-11-09)

`biomes/rift/PLAN-STATIONS.md` section 11; `biomes/KARST-SITES-5.1.md` site 3. The library has no bedded gypsum, the maze's whole rock (its
walls, roofs and the scarp's face), so the Hearths' pack stands in, read in place: `crystal.selenite` (`stone.alabaster`, massive gypsum: it
reads as veined marble up close) for the gypsum, `ground.gypsum` (`ground.gypsum.crust`) on the floors, `rock.limestone`
(`rock.limestone.karst`) on the stromatolite beds. Wire the new set as a `rock.gypsum` family in `biomes/rift/materials.json`, run
`python3 tools/textures/pack.py biomes/rift`, add `rock.gypsum` to `stations/maze/station.json` `own`, and point the base layer of
`stations/maze/84-host-rock.js` at it in place of `crystal.selenite`. Full colour (the colour is the point). Reuse: any gypsum or evaporite
wall (the Hearth hold's upper storey, Korona's gypsum rims, KARST-SITES site 7).

## 44. The Hearth field's warm ground (`biomes/riftrim --station hearths`, 2026-11-09)

`biomes/riftrim/PLAN.md`, "Station 7, the Hearth field". Inside each disc the snow never lies and the library has no warm bare soil, so the
ground there is the kit's paint (black-brown, 4 m texels: soft up close). Wire the set as a `ground.warmsoil` family in
`biomes/riftrim/materials.json`, run `python3 tools/textures/pack.py biomes/riftrim`, add it to `GLW` in `src/45-host-stage.js` on the mask
`smooth(.06,.2,F.geo)*smooth(.6,.45,F.geo)` (the disc, not the sinter apron) and name it in the station's `groundLayers` in place of `lenswort`
(the station has four layers: the bare-snow mask holds the fifth unit). Full colour. Reuse: the Cold Hearths (oidong), Godstep's hearth, any
geothermal ground off the sinter (the Throne's vent country's warm flats).

## 45. Raw clay (`kits/islanders`, the clay pit, 2026-11-09)

`kits/islanders/KNOWN_ISSUES.md`, "The clay pit": the clay diggers' pit (`ie-claypit`, `src/69-ie-hamlet.js`) draws its cut
blocks, its heap and its pit floor with the library's `clay` set, which is fired clay, tinted grey (`IE_RAWCLAY`). Lands as
`earth.clay.raw` in `core/materials/library/`, then the family `rawclay` in `kits/islanders/materials.json`.

## 46. The Ancient Transit kit (`kits/ancient-transit`, 2026-11-08)

The Ancients' transport infrastructure in ruin (the valley's highway, cargo and passenger lines, street furniture). Stand-ins until these
land: `ground.asphalt` for the decks and roads (the lane paint is geometry), `ground.gravel042` for the ballast, `metal.rust.heavy` for the
rails and every ruined metal. **3 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|

## 47. The Firebliss Range (`biomes/firebliss`, 2026-11-10)

The four stations are wired on library sets that already exist (`ground.ash`, `ground.ash.soil`, `ground.cinder`, `ground.sinter`, `ground.mat.thermal`,
`ground.sulphur`, `ground.grass.lush`, `ground.snow011`, `ice.glacier`, `rock.basalt.flowbanded`, `rock.basalt.vesicular`, `stone.pumice`,
`stone.obsidian`, `cloth.hide.canopy`, `bone.horn`, `card.fireweed`, `card.ichu`, `card.reed`...). One surface is the kit's stand-in:

## 48. The NE outer wall (`biomes/neouterwall`, station 1 Vitreous Hollow, 2026-11-10)

The Glass-Skarn Bastion (`biomes/neouterwall/PLAN.md` sections 2 and 8). Station 1 stands on stand-ins until these come: the cauldron's
wall is `rock.megabreccia` (the impact rim's host rock, under KSTRATA's megabreccia blocks) where it should be banded skarn, and the
pseudotachylite mirrors are not drawn (station 4's slump faces need them most). Reused: `ground.sinter`, `ground.mat.thermal`,
`ground.grass.lush`, `ground.moss001`, `ground.gravel019`, `ground.tundra`, `rock.basalt.polygonal` (the dikes), `card.treefern`,
`card.reed`, `bark.mossy`; the contact marble is `rock.marble.white` until a closer set is wanted. Full colour (the bands are the rock's own).

## 49. The Great Chasm (`biomes/greatchasm`, 2026-11-11)

The Deep's floor (`biomes/greatchasm/PLAN.md` sections 2 and 7: the code's paint is "dark komatiite and obsidian on the floor"). Until it
comes, the Deep's ground draws `ground.sand.black` with `ground.obsidian` in patches (`biomes/greatchasm/materials.json`, `ground.black`
and `ground.obsidian`): a named stand-in. Full colour, 2 m a tile; it replaces `ground.black` in the Deep's four layers (the slot keeps its
name).

## 50. The Tiers (`biomes/tiers`, planned 2026-11-10)

The Tiers' plan (`biomes/tiers/PLAN.md` sections 4 and 11): the flora's rule is that everything grows in tiers. Until these
come, the kit draws `card.broadleaf.dry`, `bark.smooth` and `rock.lichen.circles`, tinted (its `KNOWN_ISSUES.md` will say so).

## 51. The Rift battery (`biomes/galvanic`, 2026-11-11)

The strand of the Rift's eastern terminal sea, where metal-rich sulfide mud oxidises into its own acid (`biomes/galvanic/PLAN.md`
section 15). Stand-ins until these land, each named in `biomes/galvanic/KNOWN_ISSUES.md`: `ground.brown_mud_02` tinted for the
strand, `mineral.crust.ferromanganese` for the reefs, `rock.gossan` for the cut ore. **3 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|
## 52. The Arch (`biomes/arch`, 2026-11-11)

Krator's bare mantle (`biomes/arch/PLAN.md` sections 6 and 15). Stand-ins until these land, each listed in the kit's `KNOWN_ISSUES.md`:
`rock.schist.emerald` darkened for the serpentinite, `ground.olivine` for the peridotite's rind, `mineral.crust.brucite` and
`ground.travertine.white` for the brucite travertine, `rock.basalt.vesicular` for the pillows, `rock.palagonite` for the hyaloclastite, and a
procedural two-face material for the curtains. **6 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|

## 43. The Qiblai kit (`kits/qiblai`, 2026-11-11)

The holy city of the Decree (`kits/qiblai/PLAN.md` section 9, item 2; the owner, 2026-11-11: "sure new textures"). Its dressed
stone reuses `stone.sandstone.ashlar` (wired: `kits/qiblai/materials.json`, `qAshlar`). Two are owed. They land as families in
`kits/qiblai/materials.json` (`qGoldSheet` for the gilt roofs, crowns and finials, now the plain `xGold`; `qMantra` for the prayer
wheels' drums, under the Song in the real Xanadui script that the kit draws over it, `src/89q0y-qb-script.js`), then `python3 tools/textures/pack.py kits/qiblai` and a rebuild.

The walk-in rooms (2026-11-15, the owner: "feel free to ask for new textures if needed to make things fancy"; `src/89q5-qb-interiors.js`,
settlements/qiblai `90t-qc-interiors.js`) take library sets today: the sanctum's floor `paving.marble_mosaic_tiles` (`qMarble`), the halls'
`wood.old_wooden_floor_02` (`qPlank`), the gilt `metal.gold` (`qGilt`), the columns and ceilings `wood.lacquer` (`qLacq`), the council's runner
`cloth.rug.wool` (`qRug`), the walls the Xanadu wash. Three more would make them a Qiblai temple's: the painted walls, the painted
ceiling and the temple rug. They land as families `qMural` (the rooms' walls above a dado: `qnIxShell`), `qCoffer` (the ceilings) and
`qTempleRug` (the council's runner, the monks' rows' cushions), each in place of the stand-in named. **5 prompts**, all full colour.

| id | Prompt |
|---|---|

## 55. Opal Valley (`biomes/opalvalley`, 2026-11-11)

Numbered 46 on its branch, 54 since the merge of 2026-11-16 (main's 46 is the Ancient Transit kit's; 41 is the Line's; the painted highlands, the cliff lungs and the siphon pits
are being built beside it). Three sets the kit's surfaces want (`biomes/opalvalley/PLAN.md` section 11); until each comes the kit draws the
stand-in its `KNOWN_ISSUES.md` names. Full colour: the colour is the point (do not tint them).

## 53. The mined goods' resource nodes (`kits/resources`, 2026-11-16)

The nodes for the mined goods of Gemini's trade model (`kits/resources/src/44s`-`44u`). Until these come the nodes draw vertex
colours (`kits/resources/KNOWN_ISSUES.md`). Two sets owed elsewhere are wanted here too, so each serves both when it lands:
`rock.opal.matrix` (section 46: the opal node's outcrop) and
`rock.serpentinite` (section 52: the jade node's host rock). Wire each into `kits/resources/materials.json` as well as its first
build. Full colour, 1 m a tile: the colour is the point (do not tint them). **3 prompts.**

## 54. The Xanadui fort (`kits/xanadu`, the fort asset of `settlements/strongwall/PLAN.md` section 5, 2026-11-16)

The owner, 2026-11-16: "I'm open to new texture proposals". These are for the fort asset that Strongwall, the Marches' watch
forts and the gate works will share. Until each set arrives, the fort draws the stand-in named in its row. Each set lands as a
family in `kits/xanadu/materials.json`, wired when the fort is built (the plan's step F2), followed by `python3 tools/textures/pack.py kits/xanadu`.
**3 prompts.**

## 56. Grēṭ-Āil, the Azure Dream's Hall of Dreaming (`settlements/azure-dream`, 2026-11-16)

The head monastery of the Order of the Azure Dream (`settlements/azure-dream/PLAN.md` section 9; the owner, 2026-11-16:
"yes new textures"). Numbered 56 to keep clear of the other branches of 2026-11-16 (53 is taken twice). Felt and reed
matting come from the library already (`cloth.felt`, `fibre.reedmat`, `reed.mat.woven`). Three sets are owed, for the
Hall of Dreaming. They land as families in `settlements/azure-dream/materials.json` (`adNight` for the cot bays' painted
ceiling, `adMural` for the Hall's and the Waking Gallery's walls above the dado, `adBlanket` for the 256 dream cots'
blankets), then `python3 tools/textures/pack.py settlements/azure-dream`. Until then the page draws `wood.lacquer` in the
Order's blue, the Xanadu wash and `cloth.wool`. **3 prompts**, all full colour.

| id | Prompt |
|---|---|

## 57. Erewhon's citadel: the hangings of Kubla Khan (`kits/catalog` culture `xanadu`, 2026-11-16)

**Delivered 2026-11-17** (the owner's Codex batch; `tools/textures/batches/citadel-hangings-2026-11-17.json`; `PLAN.md`, "Delivered 2026-11-17"); the prompts are in `PROMPTS-archived.md`. All ten in the library (`patterns/xanadu/hanging-*`, `tapestry-*`, `patterns/common/suzani-roundels`, `.b`; a second take of the pleasure-dome tapestry as `tapestry-pleasure-dome.b`) and wired: packed as `KMAT.pack('xanadu-pics')` (`settlements/xanadu/citadel/materials.json`), painted on the hangings by `xanPicPaint`.

## 58. Easter eggs for Erewhon's walls: the Ancient Mariner, Samuel Butler, Caves of Qud, Kenshi (2026-11-17)

**Delivered 2026-11-17** (the owner's Codex batch; `tools/textures/batches/citadel-hangings-2026-11-17.json`; `PLAN.md`, "Delivered 2026-11-17"); the prompts are in `PROMPTS-archived.md`. Eleven of the twelve in the Mughal style, in the library (`patterns/easter/*`) and wired (the envoy's hangings); `skeleton-scholars` dropped (the owner: it "does not fit this current setting"), and in its place the owner's own Kenshi panel (`patterns/easter/desert-ruins`, 16:9, the envoy's tapestry). The first, non-Mughal takes of nine of them are in the library too (`patterns/easter/*.classic`), not wired, kept for a later use (Talia's art museum). With them, five portraits of turbaned sultans (`patterns/xanadu/portrait-sultan-*`, the owner's own requests), wired (the sultan's portrait).

## 43. The Tungang kit (`kits/tungang`, 2026-11-11)

**Delivered 2026-11-17** (the owner's Codex batch; `tools/textures/batches/citadel-hangings-2026-11-17.json`; `PLAN.md`, "Delivered 2026-11-17"); the prompts are in `PROMPTS-archived.md`. `patterns/tungang/loj-banner`, `loj-banner.b` and `enamel-signs` are in the library, **not wired**: `kits/tungang` wires them (its `materials.json`) at its next turn.

## 57. Kirstabal's slate town wall (`settlements/kirstabal`, the Xanadu kit's opt-in wall `kits/xanadu/src/87k2-xa-slate-wall.js`, 2026-11-17)

The owner, 2026-11-17: "a wall made of slate similar to the thin brick wall of chiang mai". No library set is a wall of thin
slate courses; the wall draws `brick.dark` tinted slate grey (families `xSlate`, `xSlateD` in `settlements/kirstabal/materials.json`)
until this lands. It lands as `wall.slate.coursed` in the library, the two families repointed to it, then
`python3 tools/textures/pack.py settlements/kirstabal`. **1 prompt.**

`wall.slate.coursed` (the curtain, the gate pillars, the bastions and buttresses; 2 m a tile; near-colourless so the families'
colour can tint it lighter or darker):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on wall filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: an old town wall built of thin split slate laid flat in long narrow courses like Chiang Mai's thin bricks, each slab 3 to 6 cm thick and 20 to 60 cm long, the courses straight but each slab's edge slightly ragged and chipped, laid with thin grey lime mortar joints set back a little so every course casts a fine dark line; a few slabs a shade darker or lighter, faint rust-brown iron staining in streaks, pale lime bloom in the joints, a little dark weathering grime and specks of grey-green lichen. Blue-grey and charcoal slate only, low saturation, so it can be tinted.
```

## 58. The Xanadu kit's works pieces (`kits/xanadu/extra/88g-xa-works.js`, the build-out's wave 0.1, 2026-11-17)

The lake towns' work pieces draw on the kit's procedural textures with tinted stand-ins. Three of the four gaps are already in
the library, to wire when the pieces move into `src/`: the mat shed's reed thatch is `roof.thatch.reed`, the hot spring's apron
`ground.sinter` (or `ground.travertine.white`), the fishponds' walls and the weed line `rock.wet.dark`. Two are not. They land
in the library and the kit's `materials.json` takes them at the all-builds rebuild. **2 prompts.**

`ground.dyeworks` (the yard under the dye works' vats and drying lines, Ḍāiyar and Wībhar; 4 m a tile):
```
Seamless tileable texture, square, 2048x2048. Top-down orthographic view of flat ground filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the packed earth and worn flagstone yard of an old dye works, pale dusty earth with a few broken flat stones set in it, soaked over years with spilled dye: broad irregular stains and drip trails of deep indigo blue, madder red and saffron yellow, the colours bled into the earth and faded at their edges, darker where wet, a few puddle rings and splash marks, fine grit and scattered straw. Muted, earthy, not bright.
```

`ground.sulfur.crust` (the crust beds and the spring's edge at the sulfur works, Hoṭ-Bāṭh; 4 m a tile):
```
Seamless tileable texture, square, 2048x2048. Top-down orthographic view of flat ground filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the crusted ground round a volcanic hot spring where native sulfur is scraped: a brittle lemon-yellow sulfur crust in thin cracked plates and needle crystals over pale grey-white mineral mud, patches scraped back to the grey mud with rake marks, small orange and ochre stains, a few white salt efflorescences, hairline cracks and tiny vent holes. Natural, slightly dusty, not glossy.
```

## 59. Xanadu's lake towns and mines (`settlements/xanadu-lake`, `settlements/xanadu/WORKS-PLAN.md`, 2026-11-22)

The twenty lake towns of the shared target and the two mines' camps (plans only; `settlements/xanadu/BUILD-PLAN.md`). Most
of what they draw is in the library (`roof.thatch.reed`, `ground.reedbed`, `rock.wet.dark`, `rock.hewn.drillmarked`,
`ground.tundra`, `rock.opal.matrix`); `ground.dyeworks` and `ground.sulfur.crust` are owed in section 58. Three are not.
They land in the library; the lake-town target's and `kits/xanadu`'s `materials.json` take them when the pieces that use
them are built. Until then the stand-in each row names is drawn and said in the build's `KNOWN_ISSUES.md`. **3 prompts.**

`stone.ghat.wet` (the landing stairs into the lake at every lake town, and the quays' lower courses; 2 m a tile; the stand-in
is `stone.cut` darkened):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on stone surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the worn grey-brown volcanic stone blocks of an old lake-shore landing stair, the blocks laid in rough courses with wide weathered joints, their edges rounded by centuries of feet and water; the stone dark and damp, with a band of slick green-black algae and pale lime scale in the joints, a few tiny snail shells and grit, small chips and pits in the surfaces. Muted dark greys, olive green and black, not glossy.
```

`ground.sherds` (Pāṭari's kiln yards and the potters' lanes, paved and strewn with broken pots; 4 m a tile; the stand-in is
`ceramic.terracotta` on `ground.ash.soil`):
```
Seamless tileable texture, square, 2048x2048. Top-down orthographic view of flat ground filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects standing up, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the trodden yard of an old potters' kiln works, packed reddish-brown earth thickly strewn and half buried with broken pottery sherds of every size, unglazed red and buff terracotta, a few pieces of dark smoked pot and pale cream slip, flat curved fragments and broken rims lying every which way, grey wood ash in patches near where the kilns would be, fine red clay dust. Earthy, warm, matte.
```

`ground.tailings.ore` (the spoil and tailings heaps of Kōlḍ-Lōḍ's gold mines and the opal diggings; 4 m a tile; the stand-in
is `ground.fellfield.fines` tinted):
```
Seamless tileable texture, square, 2048x2048. Top-down orthographic view of flat ground filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: mine tailings and crushed waste rock dumped from a hard-rock mine, angular grey and blue-grey broken rock from fist-sized lumps down to coarse sand and fine grey powder, streaked with rusty orange and ochre iron staining and a few pale quartz fragments, small patches of fine wet grey silt where water has run, no plants. Neutral greys with rust streaks, matte, dusty.
```

## 60. Xanadu on the vertical stack (`settlements/xanadu/STACK-PLAN.md`, 2026-11-22)

Xanadu's own S4 ground-layer set for Godot (the owner, 2026-11-22: "Xanadu's own layer set") and the stack's glazed-surface
case (M1-M2). The rest of the set is in the library (`ground.grass.lush`, `ground.terrace.field`, `ground.redsoil`,
`ground.shingle`, `rock.tuff`) or owed in section 59 (`stone.ghat.wet`). They land in the library in today's packing;
`godot/tools/pack_ground_layers.py`'s `xanadu` set and `kits/xanadu/materials.json` take them. **2 prompts.**

`ground.paddy.wet` (S4 layer 3: the Vale's rice paddies and the lake's flooded margins; 4 m a tile; the stand-in is
`ground.brown_mud_02`):
```
Seamless tileable texture, square, 2048x2048. Top-down orthographic view of flat ground filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no reflections of sky or objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the soft wet grey-brown mud of a flooded rice paddy after the harvest, a few centimetres of muddy water standing in shallow puddles between low smooth mud ridges, rows of short cut rice stubble poking up in loose lines, scattered straw, faint footprints and the pocked marks of rain, small patches of green algae scum. Muted earthy browns and olive greys, damp but not glossy.
```

`tile.dome.bannai` (the domes' and drums' glazed brick, laid in banna'i pattern: the Pleasure Dome, the temples' drums; 2 m a
tile; full colour; the glazed class, so its normals are packed at 8 bits on the web):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on wall filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a Persian banna'i wall of small fired bricks laid in running bond with thin pale mortar joints, about a third of the bricks glazed in deep turquoise and cobalt blue and the rest left plain warm buff, the glazed bricks set to form a repeating angular geometric pattern of interlocking squares and stepped diamonds; the glaze slightly uneven with fine crazing and a few chipped corners showing the buff body beneath, the plain bricks a little rough and sandy. Full colour: turquoise #2aa3a0, cobalt #1f3f8a, buff brick #c9a77a, mortar #d8cdb8.
```

## Gaps with no prompt yet

Owed, but a prompt waits on something first; listed so they are not lost.

- **Bare concrete block** (the World Menagerie's Lake AtitlÃ¡n and Sarajevo, 2026-10-28): the grey cinder block of an unfinished house (obra gris), laid in running bond with grey mortar, some cells broken. No library set has it; AtitlÃ¡n's unfinished houses are plaster tinted grey. Needs a read of the block size and the tile before the prompt.
- **Korona's therian tribes' skins** (`core/charactermodels/NONHUMAN.md`): fur (short, tintable), feathers, beak keratin and
  throat-sac skin, once LORE 6.18 names the tribes and what each is like; written then, one set per kind of hide.
- **The Yeti kit's lintel band** (`kits/yeti/PLAN.md` section 2): the clan's name in the Khaayken cut script on a
  stone lintel. The chart exists (`lore/tongues-of-krator.html`, the Khaayken section and its cut-letter script: straight-stroke
  Latin capitals, a vowel as one wedge turned four ways, holed for the front vowels), with every sign's exact path data. A
  generator will not keep those letterforms, so the band is a bake from the chart's paths (a PNG or a `TEX.def`, not a
  generated image), cut into the lintel's stone (`stone.soapstone` or `stone.corbel.slab`, already in the library). No
  clan's name is fixed in the kit yet; the bake needs the names.
