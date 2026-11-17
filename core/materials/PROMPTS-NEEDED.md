# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 77 prompts** (+1 for the eastern highlands' combed beech, section 62 (44 on claude/objective-gagarin-623fb5), 2026-11-17; +6 for the Rift line, section 57, +10 for the Tungang kit, section 58, +9 for the Kimr, section 59, +2 for the Qiblai kit, section 60, and +2 for the Labyrinth's flora, section 61, at wave 2 (numbered 53-57 on claude/integration-4), merged with main 2026-11-17; +1 for the pancake domes, section 56 (43 on its branch); +3 for Opal Valley, section 53, +4 for the Cliff Lungs, section 54, and +3 for the Siphon Pits, section 55, at the merge of 2026-11-16 (numbered 46, 44 and 46 on their branches); +6 for the Arch, section 52, and +3 for the Rift battery, section 51, at Integration 3, 2026-11-11; +3 for the Tiers, section 50; 19 fenced blocks, counted by their fences, and the Ancient Transit's three table rows at the second integration merge, 2026-11-11: sections 43-49 added since, the Ancient Transit, Firebliss, the NE outer wall and the Great Chasm among them; before that, 2026-11-10, after -22 delivered from sections 37, 40, 41 and 42: `PLAN.md`, "Delivered 2026-11-10"; the hand count before was 36, and two blocks had lost their closing fence; 2026-11-09: +11 for Erewhon's citadel, section 41; +2 for the Tents kit's army and Eternian cloths, section 42; +3 for the southern highlands' upper stations, section 37; +15 for the hyperjungle's lands and the savannah rims, section 40, 2026-11-08; counted 2026-11-04 before them).

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

The banded plateau by Korona (`biomes/paintedhighlands/PLAN.md` section 10, which lists the library sets it reuses). **Built
2026-11-11** (its branch): the bloom's flowers are `card.flower.bloom.highland` (its nine cells are the plan's nine Earth models: lupin,
penstemon, globe mallow, paintbrush, blazing star, desert dandelion, evening primrose, Namaqualand daisy, pata de guanaco), so no flower
card is owed. Still owed, one set; until it comes the beds are KSTRATA's colours under `rock.sandstone.bedded.red` and
`ground.clay.popcorn` as grey detail (`biomes/paintedhighlands/KNOWN_ISSUES.md`, "The banded rock's own grain"):

`rock.badland.bedded` (greyscale, tinted by the strata field in the shader; the preferred, cheaper option of the plan): the base
template, then: "Weathered bentonite clay badland slope seen straight on: thin horizontal beds 2 to 20 cm thick running edge to edge,
alternating smooth soft clay layers and slightly harder ledges that stand a few millimetres proud, a crumbly popcorn-textured crust
of swollen clay on the soft layers, fine vertical rills where rain has run down, a few thin dark partings. Render it in neutral
greyscale only (no colour at all), even mid-grey, so the shader can tint each bed: the beds differ in texture, not colour. The beds
must stay horizontal and continue across the left and right edges."

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

`rock.megabreccia` (the crater wall's rock: a grain map for KGROUND's `clast` blocks and KSTRATA's megabreccia on station 1's crag steps and pillars):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a polished-looking but natural weathered rock face of impact megabreccia, angular clasts of many different rocks from fist size to a metre packed together at every angle in a fine grey crushed matrix: black basalt, rusty red basalt, banded pale grey gneiss, cream tuff, brick-red sandstone and pale grey limestone, a few clasts themselves made of smaller clasts, thin black glassy veins (pseudotachylite) cutting across several clasts, scattered tiny bottle-green and black glass flecks in the matrix, light grey-green lichen patches on a few clasts; every rock type clearly different in colour.
```

## 38. The Ring Sea isles' lagoon station (`biomes/ringisles --station lagoon`, 2026-11-03)

Numbered 32 until 2026-11-08 (three branches each took 32; a stale second copy of section 32 was dropped then). `ground.coral.rubble` is in the library
(the owner's 2026-11-03 batch, `tools/textures/batches/owner-2026-11-03.json`, which cites it as "section 32 on claude/..."): prune this section once its build wires it.

The motu's storm ridges and the reef flat's back edge are coral rubble thrown up by the swells; the station paints them as the beach's sand
(`ground.coast_sand_01`, the paint's beach weight) until this set comes. Wire it as a `ground.rubble` slot in `biomes/ringisles/materials.json` and a layer in
`src/84-host-ground.js` (the station's storm ridge as its mask) at the next turn; with it the ground reads 17 units, so it must replace `shingle`, not join it.

`ground.coral.rubble`:
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no Subject: a storm ridge of coral rubble on a tropical atoll islet: broken branching-coral sticks, finger and staghorn fragments 2-15 cm long, worn smooth and bleached to bone white, cream and pale grey, with a few rounded brain-coral cobbles and pink-grey pieces of coralline crust, packed loosely so dark gaps show between them, a little coarse white coral sand in the hollows; no shells larger than a thumbnail, no seaweed, no plants, no water. Even scale across the frame (about 1.5 m across the image).
```

## 39. High Rift (`biomes/highrift`, 2026-11-03)

Numbered 32 until 2026-11-08 (three branches each took 32; a stale second copy of section 32 was dropped then). `rock.hematite.mirror` is in the library
(the owner's 2026-11-03 batch, `tools/textures/batches/owner-2026-11-03.json`, which cites it as "section 32 on claude/..."): prune this section once its build wires it.

The Mirror Graben's fault mirror (`biomes/highrift/PLAN.md` sections 2 and 11): until it comes, station `mirror`'s fault face draws
`rock.basalt.oxidised` at a low roughness. Full colour, 2 m a tile, roughness low (the sheen is the point).

`rock.hematite.mirror`:
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a polished fault plane (slickenside) coated in specular hematite, steel-grey to blue-black (#3a3c42, #23252b) with a faint metallic grain, long straight parallel grooves and fine striations all running top to bottom, a few low steps across the grooves, patches where the coating has worn through to red-brown earthy hematite (#7a3a26) and rust stains (#9a5a32) bleeding down the grooves, hairline cracks across them. Full colour: not tinted.
```

## 37. The southern highlands' upper stations (`biomes/shighlands --station conifers` and `--station fellfield`, 2026-11-09)

Stations 2 and 3 (`biomes/shighlands/PLAN-STATIONS.md`, "Built") are wired on library sets that already exist (`bark.twisted.red`, `bark.whorled`,
`bark.juniper`, `card.pine`, `card.spruce`, `card.juniper`, `ground.needles`, `ground.snow.drift`, `ground.lichen.crust`, `rock.rubble.sturzstrom`,
`surface.cushion`, `ice.glacier`; the spiral cones are geometry, not a card). One surface is still the kit's stand-in (the fines and the snail
rosettes' leaf arrived 2026-11-10: `ground.fellfield.fines`, `card.rosette.snail`, in the library and not yet wired: `PLAN.md`, "Delivered 2026-11-10"):

`card.heath.whorl` (station 2's dwarf whorl-heath on the forest floor and the crest, drawn now as the kit's plain shrub lobes: `dwarf` in
`stations/conifers/62-biome-shigh-conifers.js`; a sheet of nine sprigs on the clump, `"sheet": "geometry"`):
```
Square, 2048x2048. Orthographic view looking straight down on nine separate sprigs in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: sprigs of a dwarf alpine heath, each a short woody shoot densely clothed in tiny needle-like leaves set in tight whorls of four up the stem so the leaves spiral round it, dark green leaves with paler tips, three of the sprigs carrying a few small nodding pink bell flowers, seen from above. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

## 40. The hyperjungle's lands and the savannah rims (`biomes/hyperjungle` stations `savage` and `north`, `biomes/abyssal-savannah` stations `serim`, `erim` and `north`; J2-J6, 2026-11-08)

`biomes/hyperjungle/PLAN-LANDS.md` section 10's list, for the species built on 2026-11-08 with a stand-in each (named in the build's
KNOWN_ISSUES.md, "J2-J6"). The library sets already wired are not listed (bark.strangler, organic.pod.honeycomb, wood.silver,
bark.bamboo.jade, card.bamboo.giant, earth.termite and the rest). Wire each into the named build's `materials.json` when it comes (the rims' sets into `biomes/abyssal-savannah/materials.json`, on the rim stations' families: `build.py` `RIM_PACK`; the rims were built as `biomes/savannarim` and folded in there on 2026-11-08). **2026-11-10:** seven of the fifteen arrived (`bark.palm.spined`, `bark.tualang`,
`card.ghostpipe`, `card.grass.elephant`, `card.grass.themeda`, `ground.ironstone`, `card.leaf.miombo`: `PLAN.md`, "Delivered 2026-11-10"); the two grasses are wired,
the other five are in the library for the builds' next turn.

### The savage land (J2)

`organic.comb.bee` (the giant bees' combs; now organic.pod.honeycomb, a stand-in):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the open face of a wild giant-bee honeycomb seen straight on: hexagonal wax cells 1 to 1.5 cm across in slightly irregular rows, some capped with pale cream wax, many open and filled with glossy amber-gold honey, darker brown old cells in patches, a few dark empty cells; the wall edges thin and pale. Full colour: not tinted.
```

`card.arum.carrion` (the carrion arum's spathe; now a modelled vertex-coloured spathe):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a giant corpse flower (Amorphophallus titanum) seen from the side: a tall pale yellow-cream spadix spire rising from the centre of a single frilled spathe that wraps round it like a ruffled cup, deep maroon-red with a velvety sheen inside and pale green flecked with maroon outside, the rim frilled and turned back. Full colour: not tinted.
```

### The north, Screamer wood (J3)

`bark.watcher` (the watcher's eye-scarred bark; now a canvas painted in `src/57`):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the pale bark of an aspen (Populus tremuloides) grown huge: smooth chalky grey-white with a faint green-grey cast, covered in dark almond-shaped branch scars like eyes, each a black lens 5 to 15 cm long with a raised grey rim and darker lids, more of them lower down, thin black horizontal lenticel lines, a few rough dark patches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`bark.bloodwood` (the bloodwood's bark; now a canvas painted in `src/57`):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the bark of a kiaat tree (Pterocarpus angolensis): dark grey-brown, coarsely fissured into rough vertical plates, with thick blood-red sap welling from wounds and running down the fissures in glossy streaks that dry dark red-brown, older runs crusted almost black. Full colour: not tinted.
```

`bark.bamboo.bored` (the howl bamboo's culms; now bark.bamboo.jade and BIO.bamboo's coarse stains):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the surface of a giant bamboo culm, olive-grey to dull jade green, faint vertical fibres, a dark node ring with a pale waxy band across the top of the image, the internode bored through by beetles in a row of round fist-sized holes with frayed edges and dark insides, pale grey-white stains running straight down from each hole. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`card.bamboo.leaf` (the howl bamboo's sprays; now card.bamboo.giant, the Cut's sheet):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a hanging spray of giant bamboo leaves on fine twigs, seen from the side: long lanceolate leaves 20 to 30 cm, bright to mid green, drooping from thin pale twigs in fans of five to nine, a few yellowing leaf tips, nothing touching the frame. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`card.flower.hand` (the hand-flower; now a modelled vertex-coloured flower):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: one flower of the devil's hand tree (Chiranthodendron pentadactylon) seen from above at an angle: five long curved crimson stamens joined at the base like a clawed hand held palm up, their tips hooked, rising from a cup of five leathery brown-red sepals, a felted grey-green leaf behind it. Full colour: not tinted.
```

`card.pod.skull` (the skull-pod's seed pods; now modelled pods):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a cluster of dry snapdragon seed pods (Antirrhinum) grown to the size of fists, each a pale bone-coloured papery capsule with two dark round openings and a small dark slit below them, so each looks like a tiny skull, on brittle brown stalks. Full colour: not tinted.
```

### The savannah's base (`biomes/abyssal-savannah` rim stations, `blind` and `grass`, J4)

### The se rim (`biomes/abyssal-savannah` station `serim`, J6)

## 41. Erewhon's citadel: the Pleasure Domes and the Moorish and Mughal palaces (`kits/xanadu`, `settlements/xanadu/citadel`, 2026-11-09)

The owner's references (`settlements/xanadu/citadel/refs/`) and brief: the Pleasure Domes in black and white (the citadel's dome black over white, the Dome of the Bay white over black); the rest of the citadel Moorish and Mughal, psychedelic in its own way. **Reuse, so no prompt:** `metal.gold` (gilt trim, joints, rails), `rock.sandstone.red` (Mughal red sandstone), `plaster.white_stucco_02`, `rock.marble.white` where the marble is plain. The stripes, checkers and chevrons of the domes are geometry, not images. **2026-11-10:** ten of the eleven arrived and are wired in both
`materials.json` (`PLAN.md`, "Delivered 2026-11-10"), and `wood.cedar.moorish` (section 42, now pruned) with them, in the library for the kit to take up; the
jali card below is the one still owed.

`patterns/xanadu/jali` (pierced marble window screens (keyed card)):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a rectangular pierced white marble jali screen seen straight on, 1:1, filling the frame: a dense geometric lattice of interlaced hexagons and six-pointed stars cut right through the stone, so every opening shows the magenta background; the stone's edges crisp, a thin plain border round the screen.
```

## 43. The gypsum maze under Cube's plateau (`biomes/rift --station maze`, 2026-11-09)

`biomes/rift/PLAN-STATIONS.md` section 11; `biomes/KARST-SITES-5.1.md` site 3. The library has no bedded gypsum, the maze's whole rock (its
walls, roofs and the scarp's face), so the Hearths' pack stands in, read in place: `crystal.selenite` (`stone.alabaster`, massive gypsum: it
reads as veined marble up close) for the gypsum, `ground.gypsum` (`ground.gypsum.crust`) on the floors, `rock.limestone`
(`rock.limestone.karst`) on the stromatolite beds. Wire the new set as a `rock.gypsum` family in `biomes/rift/materials.json`, run
`python3 tools/textures/pack.py biomes/rift`, add `rock.gypsum` to `stations/maze/station.json` `own`, and point the base layer of
`stations/maze/84-host-rock.js` at it in place of `crystal.selenite`. Full colour (the colour is the point). Reuse: any gypsum or evaporite
wall (the Hearth hold's upper storey, Korona's gypsum rims, KARST-SITES site 7).

`rock.gypsum.bedded` (2 m; up is the bedding's up):

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a dry cave wall cut in bedded gypsum rock, the
beds running straight across the image from left to right: sugary
fine-grained white to pale grey gypsum (#d8d4cc, #c9c4ba) in beds 10 to 40
cm thick, thin darker grey-green marl partings between some beds (#8f948a),
a few beds of larger interlocking clear-grey gypsum crystals with a faint
glitter, short hairline cracks across the beds, small shallow solution
pockets and smooth scalloped hollows, a light dusting of buff clay in the
lowest hollows; matte, dry.
```

## 44. The Hearth field's warm ground (`biomes/riftrim --station hearths`, 2026-11-09)

`biomes/riftrim/PLAN.md`, "Station 7, the Hearth field". Inside each disc the snow never lies and the library has no warm bare soil, so the
ground there is the kit's paint (black-brown, 4 m texels: soft up close). Wire the set as a `ground.warmsoil` family in
`biomes/riftrim/materials.json`, run `python3 tools/textures/pack.py biomes/riftrim`, add it to `GLW` in `src/45-host-stage.js` on the mask
`smooth(.06,.2,F.geo)*smooth(.6,.45,F.geo)` (the disc, not the sinter apron) and name it in the station's `groundLayers` in place of `lenswort`
(the station has four layers: the bare-snow mask holds the fifth unit). Full colour. Reuse: the Cold Hearths (oidong), Godstep's hearth, any
geothermal ground off the sinter (the Throne's vent country's warm flats).

`ground.warmsoil` (3 m):

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: warm geothermal ground on a cold plateau: damp
fine black-brown volcanic soil (#2a2420, #1e1a17) with a low dark fleshy
turf in irregular cushions over a third of it (#23211f, #34302a), scattered
pale grey-white sinter crumbs and flakes (#c8c2b4), a few small rust and
dull sulphur-yellow stains (#8a5a34, #b8a046), fine cracks; no snow, no
grass, no leaves; matte, slightly moist.
```

## 45. Raw clay (`kits/islanders`, the clay pit, 2026-11-09)

`kits/islanders/KNOWN_ISSUES.md`, "The clay pit": the clay diggers' pit (`ie-claypit`, `src/69-ie-hamlet.js`) draws its cut
blocks, its heap and its pit floor with the library's `clay` set, which is fired clay, tinted grey (`IE_RAWCLAY`). Lands as
`earth.clay.raw` in `core/materials/library/`, then the family `rawclay` in `kits/islanders/materials.json`.

#### `earth.clay.raw`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: freshly dug wet potter's clay, a cut face of dense smooth grey-ochre clay #9a9284 and #b0a48e with darker damp patches #7e786c, spade cuts and finger smears across it, a few small grey pebbles and root threads, a faint sheen of moisture; no grass, no stones larger than a fingernail, no text
```
## 46. The Ancient Transit kit (`kits/ancient-transit`, 2026-11-08)

The Ancients' transport infrastructure in ruin (the valley's highway, cargo and passenger lines, street furniture). Stand-ins until these
land: `ground.asphalt` for the decks and roads (the lane paint is geometry), `ground.gravel042` for the ballast, `metal.rust.heavy` for the
rails and every ruined metal. **3 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|
| `ground.asphalt.lanes` | Worn dark asphalt road surface with faded lane paint: fine aggregate showing through the bitumen (#4a4846, #585450), a patched crack running across, and one broken white lane dash (#d8d4c8, worn to 60%) along one edge of the tile and a faded yellow edge line (#c8a040) along the other, so the tile repeats as a lane. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `ground.ballast.rail` | Railway track ballast: angular grey granite stones 3 to 6 cm (#7e7a74, #8a8680, #6a6660), packed, dusty with rust-brown fines between them (#6a4a36), two faint darker bands across the tile where sleepers lay. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `metal.rail.rusted` | The head and web of a steel rail a thousand years idle: flaking orange-brown rust (#8a4a2c, #a65a36) over pitted dark steel (#4a4644), the running surface a dull grey band along the tile's middle with rust creeping over it, scale lifting at the edges. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |

## 47. The Firebliss Range (`biomes/firebliss`, 2026-11-10)

The four stations are wired on library sets that already exist (`ground.ash`, `ground.ash.soil`, `ground.cinder`, `ground.sinter`, `ground.mat.thermal`,
`ground.sulphur`, `ground.grass.lush`, `ground.snow011`, `ice.glacier`, `rock.basalt.flowbanded`, `rock.basalt.vesicular`, `stone.pumice`,
`stone.obsidian`, `cloth.hide.canopy`, `bone.horn`, `card.fireweed`, `card.ichu`, `card.reed`...). One surface is the kit's stand-in:

`ground.snow.ash` (station 4, Firebliss Mons, and the plume's track on the range's south-east snow: the snow under the plume, drawn now as
`ground.snow` greyed by the plume's ash-fall mask in the paint, `aAshfall` in `84-host-ground.js`; a family under the snow layer where the deposit is high):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: old wind-packed snow on a volcano's flank dusted and streaked with fine dark basaltic-andesite ash: grey-white snow with a sugary grain, the ash lying in soft dark grey wind streaks and patches, thicker in the small hollows of the snow's surface, a few scattered black lapilli grains, thin grey-brown sun-cupped edges where the ash has warmed the snow, no footprints, no plants. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

## 48. The NE outer wall (`biomes/neouterwall`, station 1 Vitreous Hollow, 2026-11-10)

The Glass-Skarn Bastion (`biomes/neouterwall/PLAN.md` sections 2 and 8). Station 1 stands on stand-ins until these come: the cauldron's
wall is `rock.megabreccia` (the impact rim's host rock, under KSTRATA's megabreccia blocks) where it should be banded skarn, and the
pseudotachylite mirrors are not drawn (station 4's slump faces need them most). Reused: `ground.sinter`, `ground.mat.thermal`,
`ground.grass.lush`, `ground.moss001`, `ground.gravel019`, `ground.tundra`, `rock.basalt.polygonal` (the dikes), `card.treefern`,
`card.reed`, `bark.mossy`; the contact marble is `rock.marble.white` until a closer set is wanted. Full colour (the bands are the rock's own).

`rock.skarn.banded` (the cauldrons' walls and the Epidote Badlands' ribs: KGROUND's rock layer on the steep, read from the side):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a weathered rock face of contact-metamorphic skarn, seen square-on: irregular lensing bands from a finger to a forearm thick that pinch and swell and bend round each other, never flat beds: apple-to-olive green epidote (#7a8a3a, #5e7030), red-brown grossular garnet in granular sugary masses with a few clear dodecahedral crystals (#7a3a2a, #8e4a32), black metallic magnetite seams with a faint blue-grey sheen (#1e2024), and white to pale grey coarse-crystalline marble (#e8e4dc, #c8c4bc); thin rusty orange iron stains bleeding down from the magnetite, a few hairline fractures filled with white calcite; sharp contacts between the bands; dry rock, no lichen, no moss.
```

`rock.pseudotachylite.mirror` (the slump faults' glassy faces: station 4's mirror scarp, and the rim's inner face at station 1 when it is drawn; a KGROUND rock layer, roughness low):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a natural fault surface of black pseudotachylite friction-melt glass, polished to a dull mirror by the fault's slip: smooth, very dark glassy black-brown (#14110f, #221c18), long straight parallel slickenside grooves and fine striations all running the same way across the whole image, a few thin pale grey host-rock gneiss slivers (#8a8780) and small angular clasts dragged out into streaks along the grooves, thin black glass veins branching into the grey host rock at one or two places, faint iridescent oily blue-green and bronze tints on the smoothest patches, a few small chips where the glass has spalled off showing grey rock under it; no lichen, no dirt.

## 49. The Great Chasm (`biomes/greatchasm`, 2026-11-11)

The Deep's floor (`biomes/greatchasm/PLAN.md` sections 2 and 7: the code's paint is "dark komatiite and obsidian on the floor"). Until it
comes, the Deep's ground draws `ground.sand.black` with `ground.obsidian` in patches (`biomes/greatchasm/materials.json`, `ground.black`
and `ground.obsidian`): a named stand-in. Full colour, 2 m a tile; it replaces `ground.black` in the Deep's four layers (the slot keeps its
name).

`ground.komatiite.pavement`:
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a hot desert pavement on an ancient ultramafic lava floor: closely packed angular to sub-rounded pebbles and small cobbles of dark green-black komatiite (#24261f, #2e3128, #3a3c31) with a few with a faint bladed spinifex texture of crossed needle-like crystals on their faces, a dull desert varnish sheen on the stones' tops (#4a4232, #3e3628), scattered chips of black glassy obsidian (#121214, #1c1a1e), a fine grey-brown dust (#6a6254, #7a7062) in the gaps between the stones, and here and there a pale white salt crust (#d8d2c4) in the lowest gaps. No plants. Full colour.
```

## 50. The Tiers (`biomes/tiers`, planned 2026-11-10)

The Tiers' plan (`biomes/tiers/PLAN.md` sections 4 and 11): the flora's rule is that everything grows in tiers. Until these
come, the kit draws `card.broadleaf.dry`, `bark.smooth` and `rock.lichen.circles`, tinted (its `KNOWN_ISSUES.md` will say so).

`card.shelfoak` (the shelf oak's tier plates: a sheet of nine, one cell a plate, wired as a family with `"cell"`; near-colourless, the
kit's palette tints it):
```
Square, 2048x2048. Orthographic view looking straight down on nine separate flat leaf sprays in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: the level, plate-like branch tiers of a "wedding-cake" tree seen from above, each one a roughly oval fan of fine twigs radiating from a short stub at the bottom of its cell, covered in small, leathery, rounded leaves held flat and overlapping like shingles, dense in the middle and breaking into separate sprays toward the rim with magenta showing between them; all nine about the same size, a little different in outline. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`bark.tiered` (the shelf oak's bole; near-colourless, 1.5 m a tile):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: smooth, thin, pale grey tree bark with fine horizontal lenticels in short dashes, broken every so often by a raised horizontal ring of wrinkled bark where a whorl of branches grew (two or three rings across the tile, running left to right), faint vertical stress cracks between the rings, a few small round branch scars, patches of thin crust lichen. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`rock.lichen.ledges` (the band lichen on a riser; full colour, 2 m a tile, the bands running left to right as the beds do):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a weathered pale buff sandstone cliff face (#c9b48e, #a8946e) in thin horizontal beds running left to right, each bed a slightly different tone, crossed by level bands of crust lichen that follow the bedding: a band of bright orange lichen (#d9822b) along a ledge, a band of grey-green foliose lichen (#8a9a78) above it, thin black streaks of tar lichen (#2a2a26) where water runs over the lip of a bed, the bare rock between the bands; small dark pits and a few hairline vertical joints. Full colour: not tinted.
```
## 51. The Rift battery (`biomes/galvanic`, 2026-11-11)

The strand of the Rift's eastern terminal sea, where metal-rich sulfide mud oxidises into its own acid (`biomes/galvanic/PLAN.md`
section 15). Stand-ins until these land, each named in `biomes/galvanic/KNOWN_ISSUES.md`: `ground.brown_mud_02` tinted for the
strand, `mineral.crust.ferromanganese` for the reefs, `rock.gossan` for the cut ore. **3 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|
| `ground.sulfide.oxidised` | Oxidising sulfide mud on a dry lake strand, seen from above: dense grey-black mud (#3a3836, #4a4642) glittering faintly with fine brassy pyrite grains, its top centimetre rusted orange-brown (#8a4a26, #a65e2e) in patches, cracked into shallow polygons 10 to 20 cm across whose rims curl, a white efflorescence of zinc salts (#e8e6de) and a few pale blue copper-salt specks (#9ac4d0) along the cracks, a little yellow sulfur (#d8c040) in one corner. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `organic.reef.galvanic` | The skin of a mineral reef grown by microbes in acid water: knobbly black iron-oxide crust (#1e1c1c, #2e2826) studded with small brassy pyrite knobs (#b89a4a), a thin-film peacock tarnish over the knobs (iridescent blue, violet and gold, #3a4a8a, #6a3a7a, #c8a040, kept faint), wet sheen in the hollows, orange ochre (#a65a2a) caught in the crevices. Macro, even light. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `rock.sphalerite` | A broken face of massive sulfide ore: resinous dark brown-black sphalerite (#2a1e16, #3e2c1e) with honey-yellow translucent grains (#b8862e) where it is thin, brassy chalcopyrite veinlets (#c0a040) and pale pyrite cubes (#c8b878) through it, rust staining (#8a4a26) along the fractures. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
## 52. The Arch (`biomes/arch`, 2026-11-11)

Krator's bare mantle (`biomes/arch/PLAN.md` sections 6 and 15). Stand-ins until these land, each listed in the kit's `KNOWN_ISSUES.md`:
`rock.schist.emerald` darkened for the serpentinite, `ground.olivine` for the peridotite's rind, `mineral.crust.brucite` and
`ground.travertine.white` for the brucite travertine, `rock.basalt.vesicular` for the pillows, `rock.palagonite` for the hyaloclastite, and a
procedural two-face material for the curtains. **6 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|
| `rock.serpentinite` | A slickensided serpentinite outcrop: glossy green-black rock (#1e2a22, #2c3a2e, #3e5040) broken into scaly, lens-shaped shear flakes 2 to 10 cm long with a waxy sheen, pale apple-green patches (#7a9a6a) where the flakes are polished, a few thin white veins of magnesite and calcite (#e8e6dc) crossing at angles, one fine fibrous vein of pale gold chrysotile. Full colour: not tinted. |
| `rock.peridotite.rind` | Weathered peridotite (harzburgite): a rough buff-orange to tan weathering rind (#b8864e, #a07040, #c89a62) with a sandpaper grain, small knobbly crystals of pyroxene standing proud in relief, and two chipped patches where the fresh dark olive-green rock shows through (#4a5a32, #3a4628). Full colour: not tinted. |
| `mineral.travertine.brucite` | A fresh hyperalkaline travertine crust from a serpentinite spring: bright chalk-white and bluish-white carbonate and brucite (#f2f4f2, #dfe8ec, #c8d8e0), finely rippled in shallow rimstone ridges, with thin translucent calcite rafts like ice skins in the low parts and a faint pale-turquoise wet sheen in the hollows. Full colour: not tinted. |
| `rock.basalt.pillow` | Seen from above, a field of basalt pillow lavas: rounded black-grey pillows 40 to 90 cm across (#2a2a2c, #3a3836), each with a glassy darker rind cracked in radial joints and a thin brown palagonite skin (#6a4a2c) in the seams between pillows, small white barnacle and shell crusts in a few seams. Full colour: not tinted. |
| `rock.hyaloclastite` | Hyaloclastite breccia: angular shards of black volcanic glass 1 to 6 cm (#1c1c1e, #2a2826) cemented in an ochre-yellow to brown palagonite matrix (#a07a3a, #8a6430, #b88e48), a few vesicular grey clasts, granular and crumbly. Full colour: not tinted. |
| `mineral.curtain` | A thin mineral membrane seen face-on, as from a chemical garden: a glossy black-green film of iron-nickel sulphide and green rust (#141c16, #22302a, #3a5240) with fine vertical ribs and wavy growth lines, small blistered bubbles, and a few rust-orange spots (#9a5a2a) where it has oxidised; the upper edge of the tile pale green (#9ab88a) and fleshy, as a living hem. Full colour: not tinted. |

## 53. Opal Valley (`biomes/opalvalley`, 2026-11-11)

Numbered 46 on its branch, renumbered 53 at the merge into main (2026-11-16), as the Cliff Lungs' 44 became 54 and the Siphon Pits' 46 became 55. Three sets the kit's surfaces want (`biomes/opalvalley/PLAN.md` section 11); until each comes the kit draws the
stand-in its `KNOWN_ISSUES.md` names. Full colour: the colour is the point (do not tint them).

`ground.sinter.opaline` (the middle bed's dams and aprons; 2 m a tile; today `ground.sinter` under the kit's procedural sheen):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: freshly precipitated opaline silica sinter on the floor of a terraced hot-spring apron: a hard, finely laminated white-to-pale-grey crust (#e6e2d8, #d8d6d0) in thin overlapping shelves and scalloped micro-rimstone ridges a few centimetres high, beaded geyserite knobs along the ridges, small shallow pools between them dried to a satin film, and here and there flecks and thin veinlets of precious opal showing play-of-colour (small sharp patches of electric blue #3a8ad8, green #3ac88a, violet #8a5ad8 and orange-red #e8602a, each a few millimetres, like broken pinfire opal) set in the white; faint orange and green mat stains in the lowest channels. Full colour: not tinted.
```

`rock.opal.matrix` (the risers' opal seams and the adits' faces; 1 m a tile; today the strata's thin seams and the sheen):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: boulder opal matrix: a broken face of brown ironstone and pale grey-buff rhyolite (#7a4a2a, #8a5634, #b6a490, #c2b19c), cut by thin wavy veins and lenses of precious opal 2-10 mm thick that fill cracks and cavities; the opal shows strong play-of-colour in patches (electric blue #2a6ad8, emerald #2ab878, violet #7a4ad8, flame orange #e8602a and red #d83a2a) against a dark potch backing in places, with milky white common-opal potch (#d0d6de) lining other veins; the rock between is rough and slightly porous. Full colour: not tinted.
```

`card.leaf.photonic` (the opal-bark tree's and the kit's own leaf sprays; a card: cut-out on green, as the library's leaf cards):
```
Leaf spray cut-out on a fully transparent background, PNG with alpha, square, 2048x2048: three short sprays of glossy oval leaves, each 4-7 cm, thick and waxy with a faint fine grain of silica, seen from above in soft even light. The leaves are a deep jade green (#2f8a76, #3a9a84) at their bases, and their surface carries a structural, view-dependent sheen: toward the tips and edges it shifts through peacock teal (#2aa8a8) to violet (#7a4ab8) and rose (#c86a8a), like a beetle's wing or a soap film, never a glow and never a flat pigment. No flowers, no stems longer than the leaves, nothing else on the card.
```

## 54. The Cliff Lungs (`biomes/clivobredos`, 2026-11-11)

The living flues on the southern Inner Wall (`biomes/clivobredos/PLAN.md` section 15, moved here on the kit's build). The kit runs on reused sets
until these land (its `materials.json` and `KNOWN_ISSUES.md` name each stand-in). **4 prompts**, paste-ready:

**`organic.lung.ring`**: the ring's sun-side skin, ribbed in a shallow helix; tintable (the pressure band is the tint). Stand-in: `organic.pleat.skin`.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: the living skin of a huge fleshy tube, taut and
slightly glossy, crossed by broad shallow ribs running diagonally at about
twenty degrees from vertical, each rib a smooth rounded ridge a hand wide
with a fine crease along its crest, the skin between the ribs finely
pebbled with small pores and faint branching veins just under the surface.
Keep colours natural but slightly muted and even, so the texture can be
tinted to different palettes without looking stained.
```

**`organic.comb.throat`**: the throat comb, wet black; full colour. Stand-in: `organic.tendril.banded`.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a wet black organic comb, thousands of short
soft black filaments (#141210) packed in dense parallel rows like a baleen
plate or a gill, beaded with clear water droplets, the rows wavering
slightly, with a few pale grey-green specks of trapped dust and pollen
(#9aa58a) caught between the filaments. Full colour: not tinted.
```

**`organic.husk.dry`**: a dead ring's papery split skin; tintable. Stand-in: `organic.lichen.plates`.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: the dried dead skin of a huge fleshy tube, thin,
papery and brittle, split along shallow diagonal ribs into curling flakes,
the surface crazed with fine cracks, dusty, with darker fibrous layers
showing where the outer skin has flaked off. Keep colours natural but
slightly muted and even, so the texture can be tinted to different
palettes without looking stained.
```

**`card.fallout.lawn`**: the fall-out lawn's jungle seedlings, a cut-out on magenta. Stand-in: a canvas card drawn in `src/72-biome-lung.js` (KNOWN_ISSUES.md says so).

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: ten
separate clumps of young tropical seedlings as a lawn, each clump a crowd of
big soft cotyledons and first leaves in several shapes (round, heart-shaped,
palmate, strap-like), bright fresh green (#5fae3c to #8fd05a), a few clumps
yellowing and browning at the edges, no flowers, no soil. No text, no border,
no watermark.
```

## 55. The Siphon Pits (`biomes/siphon-pits`, 2026-11-11)

Numbered 46 to keep clear of the sections other branches opened the same week (43-45 may be taken at merge). The kit draws library stand-ins until
these come (`biomes/siphon-pits/KNOWN_ISSUES.md`, `materials.json`): `wool.fleece` for the pelt, `cloth.felt` for the felt, `wax.tallow` for the wax.
Deliver each under its id, then point the slot at it in `biomes/siphon-pits/materials.json` (`fleece`, `felt` and `cloth.felt`, `gall`), run
`python3 tools/textures/pack.py biomes/siphon-pits` and delete this section.

`surface.fleece.machinewax` (the woolly siphon's pelt, slot `fleece`; full colour, 0.6 m a tile):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the shaggy pelt of an alien chimney tree, seen close up: long matted locks of a waxy hydrocarbon fleece about 15 cm long hanging in overlapping tiers, each lock a twisted rope of fibres glued together with amber machine-wax, darker brown and sooty at the roots, golden amber and translucent at the drip-tips where the wax has run and set in beads, a few locks fused into flat waxy plates, dark gaps between the locks. Colours amber #c8964a, tawny brown #8a5c2a, soot #3a2a18, pale wax beads #e8c078. Full colour, do not mute.
```

`ground.feltturf.siphon` (the siphon felt, the pit floors' groundcover; slot `cloth.felt` on the ground and `felt` on its patches; full colour, 1.6 m a tile):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a spongy alien turf seen from above: a dense felt of fine hollow olive-green threads matted into soft cushioned mats a few centimetres thick, the mats split by narrow dark damp cracks into irregular pads, some pads browned and dry at their edges, beads of condensed water on the fibres, a few amber wax flecks fallen on it. Colours olive #6e7e44, moss #5e6e3a, dry tan #9a8a5a, damp dark cracks #2e3420. Full colour.
```

`wax.machine` (machine-wax: the suture galls' wax bulbs and the ropers' rendered ingots, slot `gall`; full colour, 0.25 m a tile):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: translucent amber hydrocarbon wax, seen close up: a smooth, slightly glossy surface of poured and set wax with subsurface glow, faint flow lines and drip ridges, small trapped air bubbles, darker honey-brown where it is thick and pale gold where thin, a few embedded dark fibres from the fleece it was rendered from. Colours amber #d8a050, honey #b07a30, pale gold #ecc078, fibre flecks #3a2a18. Full colour.
```
## 56. The Firebliss Range's and Korona's pancake domes (`biomes/firebliss`, `biomes/korona`, 2026-11-12)

The pancake domes' walls: flow-banded rhyolite and obsidian (`biomes/firebliss/PLAN.md` section 11c, `biomes/korona/PLAN.md`
"Amendment 2026-11-12"; scale model 5.1 edit 8). Stand-in until it lands: `stone.obsidian`. **1 prompt.** It takes the base template, then:

| id | Material line |
|---|---|
| `rock.rhyolite.flowbanded` | A cliff face of flow-banded rhyolite lava: thin wavy bands of black glassy obsidian (#141416, #22222a) alternating with dull pink-grey and ash-grey devitrified rhyolite (#8a7a78, #a09490, #6e6a6c), the bands folded and stretched as a stiff lava flowed, with small white spherulites (#d8d4cc) strung along a few grey bands and conchoidal fracture surfaces catching a faint sheen on the black ones. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |

## 57. The Rift line (`biomes/line`, the owner's go-ahead 2026-11-11)

The Line's four-track gallery, its guideways and the Tungangs' kept trains (`biomes/line/PLAN.md` section 13; the owner
answered "write the prompts" on 2026-11-11). Until they come, `concrete.ancient` stands in for the lining, `concrete.slab`
for the guideway and `metal.rust.plate` for the kept plate. Reuse notes: the lining serves every Ancient bore and the
subway (`kits/ancient-transit`); the riveted painted plate serves any salvaged vehicle or kept Ancient machine.

`concrete.lining.segment` (the gallery's and every bore's precast lining, seen face-on; about 4 m across the image, so a 2 m
ring and its joints repeat twice):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the inside face of a precast concrete tunnel lining, very old: smooth pale warm-grey concrete (#a8a49a to #8f8b82) cast in curved segments 2 m long and about 1.5 m wide, laid in rings so the joints form a regular grid, the ring joints straight across, the long joints staggered from ring to ring like brickwork; each joint a narrow dark groove with a black rubber gasket line; four round bolt pockets 12 cm across near the corners of each segment, filled flush with darker grout; a small grout port in the middle of each segment; faint stencilled ring numbers in faded black at the same spot on every ring; long pale calcite drip stains and darker damp streaks running down from the joints, a few rust blooms from the bolts, a light film of grey dust and soot. Full colour: not tinted.
```

`concrete.guideway` (the guideway beam's running surface, along the beam; about 3 m across the image):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the running surface of a concrete guideway beam for a train, running vertically through the frame: dense smooth trowelled concrete, mid-grey (#8a8984) with a faint warm cast, worn into two broad polished running bands of darker smoother concrete (#6f6e6a) where wheels have rolled for centuries, between them a straight central guide slot 30 cm wide with worn steel lips along both edges, dark rust-brown inside, a dull grey metal power strip at its bottom; fine transverse expansion joints every 1.5 m filled with black sealant; oil and rust streaks along the slot, chips and spalls along the beam's outer edges, grey dust in the hollows. The slot and the bands run exactly vertical and continue off the top and bottom edges. Full colour: not tinted.
```

`metal.plate.riveted.painted` (salvaged plate riveted over the Ancients' white panel: the kept cars and kept stations; about 2 m across the image):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a patchwork of salvaged steel plates riveted over old smooth white metal panel: rectangular plates of different sizes overlapping at their edges, each fixed with neat rows of round domed rivets 2 cm across every 10 cm; the plates painted long ago in faded railway colours, dull bottle green (#3f5a43), cream (#d8cfb0) and red oxide (#8a3e2a), the paint worn through at the edges and around the rivets to brown rust and bare grey steel, chalky and faded, a few brush-painted repairs in slightly different shades; in two or three gaps between plates the original seamed white panel (#e6e5df) shows, scuffed and yellowed; soot and grime darkest at the plate edges. Full colour: not tinted.
```

**Added 2026-11-11 with the stations hotdoor, breach, fault and portal** (the owner: "write prompts for all textures"). The portal's
turf needs no prompt: `ground.turf.native` (in the library) is the wet tableland's grass; wire it as the portal's `turf` family. Reuse notes:
the spalled lining serves every ruined bore and the subway's cracked sections; the blast door serves any Ancient bulkhead, vault or hangar door;
the smoky quartz serves any crystal cleft, geode or druse (KSPELEO's owed smoky-quartz preset takes its colours from it).

`concrete.lining.spalled` (the hot section's vault where rockbursts broke the lining: about 3 m across the image):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: an old precast concrete tunnel lining (#a8a49a to #8f8b82) badly spalled by rock pressure and heat: large shallow craters where the face has burst off in slabs 20 to 60 cm across, their broken surfaces rough, coarse and paler (#b8b2a6) with grey aggregate showing; in the deepest craters rusted steel reinforcing bars (#7a4630, flaking orange-brown) crossing in a 15 cm grid; between the craters the original smooth face with its dark joint grooves and a few fine branching cracks; fine grey dust and small fragments in the hollows, a faint heat-darkened tan cast. Full colour: not tinted.
```

`metal.door.blast` (the hot doors' train leaves, the walkway hatches, the breach's bulkhead: about 2.5 m across the image):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the face of a massive Ancient blast door: heavy dark grey steel plate (#5e6264, #4e5254) in large flush panels joined by deep recessed seams, horizontal stiffening ribs every 1.2 m raised 4 cm with rounded edges, rows of countersunk bolts along each seam, a narrow inset band of dull bronze (#8a6a3c) along one horizontal rib; the paint mostly gone to bare blued steel, a few chips of old cream enamel (#d8cfb0) left at the edges, worn bright where hands and tools have touched it, dark grime and dried water streaks below each rib, a little rust in the seams. Full colour: not tinted.
```

`mineral.quartz.smoky` (the crystal cleft shrine's points and any quartz-lined pocket: about 30 cm across the image):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a dense crust of smoky quartz crystals seen from above, a close-packed druse of six-sided pointed crystals 1 to 6 cm across pointing toward the viewer at varied angles, translucent smoky brown to dark grey-brown (#6e665c, #4a443e) with clearer pale tips (#d8d6cc) and bright internal planes, a few milky white quartz crystals (#e6e4dc) among them, fine brown iron-oxide dust and tiny chlorite flecks (#4a5a42) in the gaps between the crystals. Full colour: not tinted.
```

## 58. The Tungang kit (`kits/tungang`, 2026-11-11)

`kits/tungang/PLAN.md` section 7, agreed by the owner on 2026-11-11 ("agree with your suggestions"). The Line's biome
(`biomes/line`) wants the lining segment and the hewn rock too. Wire them into `kits/tungang/materials.json` (and the
Line's) when they come. Numbered 43 because sections 41 and 42 are owed on `claude/rift-hearths-cavern-b8baf6`.

`rock.hewn.drillmarked` (the hand-cut galleries of the Line and the holds):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a hand-hewn tunnel wall in hard grey gneiss with limestone bands: parallel rows of half-barrel drill holes running diagonally across the rock, pick and chisel scars between them, sharp angular facets, fine grey dust in the hollows, faint dark soot staining in patches and a smoother, slightly polished worn area across the middle as if many shoulders had brushed it. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`concrete.lining.segment` (the precast lining of the Line's gallery and bores; the ring house's walls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the face of a precast concrete tunnel lining segment seen straight on: smooth dense grey concrete with faint formwork marks, two rows of square bolt pockets each holding a rusted steel bolt head and washer, a narrow rubber gasket groove running along the joints at the tile's edges so neighbouring tiles read as segments of a ring, pale calcite streaks and brown water stains running down from the joints, a faded rectangular patch of old paint where a ring number once was. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`organic.fungus.leather` (the Tungangs' pressed and tanned fungus hide: bags, aprons, seat covers):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: leather made from pressed and tanned mushroom mycelium: a felted, suede-like fibrous surface with faint wavy growth layers, soft creases and scuffs, panels joined by rows of coarse hand stitching in pale thread, slightly irregular edges at the seams. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`patterns/tungang/loj-banner` (a loj's banner, carried at meetings and funerals; a single panel, not tiling):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: one whole banner, not tiling. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no watermark, no readable words. Panel: a hand-painted guild banner on heavy crimson silk, made by an underground people in honour of their ancestors, the crews of a vanished high-technology transit line: a gold scroll across the top and another across the bottom with worn lettering-shapes that cannot be read; a large central oval painting of pale, hooded tunnel crews raising their hands together at a meeting, dressed in close-fitting padded work suits with high collars, smooth rounded helmet shells under their hoods, small red lamps built into the helmets and chests, tool harnesses across the body, the suits patched with salvaged panels; behind them the smooth curved wall of a perfectly round, machine-bored tunnel lined with glowing strip lights; beneath the oval an emblem of a wheel and a lamp; gold and cream scrollwork in the four corners, a gold fringe along the bottom edge; a thousand years of mending: patched cloth, faded and flaking paint, darned tears, smoke darkening toward the edges. The people and machines in the painting belong to a far-future technology, not to any historical period: no steam, no smoke from machines, no coal, no picks or oil lamps, no nineteenth-century or Victorian clothing, no coats, waistcoats, caps or top hats. Full colour: crimson #7a1a17, gold #c9a24a, cream #f3dfa6.
```

`patterns/tungang/loj-banner.b` (a second banner):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: one whole banner, not tiling. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no watermark, no readable words. Panel: a hand-painted guild banner on heavy deep green silk, made by an underground people in honour of the crews of a vanished high-technology transit line: gold scrolls at top and bottom with worn lettering-shapes that cannot be read; a central oval painting of a long train of sleek white cars gliding out of a perfectly round, machine-bored tunnel mouth ringed with lights: smooth rounded white bodies of seamed panels banded with bronze hoops, a rounded sealed cab at the front, one continuous ribbon of lit blue windows with thin bronze mullions, glowing cyan strips along the sill and the roof, running low on a single raised concrete guideway beam, its wheels hidden under the body; hooded crew figures in close-fitting padded work suits and smooth helmets with built-in lamps standing beside the guideway; cream and gold ornament round the oval, a fringe along the bottom; centuries of mending: patches, faded paint, darns, soot. Far-future technology, not any historical period: no steam locomotive, no chimney, no smoke, no rails on wooden sleepers, no overhead wires, no nineteenth-century or Victorian clothing, no coats, caps or top hats. Full colour: green #2f5a3a, gold #c9a24a, cream #f3dfa6, the train's lamps #e8b24a.
```

`patterns/tungang/loj-banner.c` (a third banner):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: one whole banner, not tiling. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no watermark, no readable words. Panel: a hand-painted guild banner on heavy dark blue silk, made by an underground people in honour of the crews of a vanished high-technology transit line: gold scrolls at top and bottom with worn lettering-shapes that cannot be read; a central oval painting of a column of hooded crew figures in close-fitting padded work suits and smooth helmets with built-in lamps, carrying long slender cutting tools and cable reels, walking down into a perfectly round, light-ringed tunnel mouth, while a red sky burns above the mountains behind them and the tall slender white towers of a gleaming city break and fall on the horizon; two clasped gloved hands in a gold medallion beneath the oval, cream and gold corner scrolls, a fringe along the bottom; centuries of mending: patches, faded paint, darns, soot. Far-future technology, not any historical period: no steam, no smoke from machines, no picks or oil lamps, no nineteenth-century or Victorian clothing, no coats, caps or top hats. Full colour: blue #1f2a4a, gold #c9a24a, cream #f3dfa6, red sky #a8382c.
```

`patterns/tungang/enamel-signs` (a 4 x 4 atlas of the Line's enamel signs; read as holy marks):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: a 4 by 4 grid of sixteen separate enamel signs, each in its own equal cell on a plain dark grey ground. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no border, no watermark, no words. Signs: vitreous enamel signs on steel from a high-technology transit line, rectangular, round and diamond, with clean modern pictogram design in red on cream, cream on red, cream on green and white on blue; each carries only a large numeral, an arrow, a lamp symbol, a bell symbol, a downward chevron, a simple pictogram of a person in a rounded helmet, or a side view of a sleek rounded train car with one ribbon of windows on a single raised guideway beam (no chimney, no smoke, no rails), never words; every sign chipped at its edges and corners down to black iron, with small rust blooms, screw holes at the corners, and the enamel faded unevenly. Full colour: red #a8382c, cream #e2d8bc, green #2f6a4a, blue #2a4a7a, iron #2a2826.
```

`patterns/tungang/crew-mosaic` (the platform's landmark wall; a single panel):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: one whole mural, not tiling. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no border, no watermark, no words. Panel: a worn monumental mosaic mural in a heroic civic style with bold, simplified shapes, showing the crews of a vanished high-technology transit line: three tall stylised figures in close-fitting sealed work suits with high collars, smooth rounded helmets with glowing lamp visors and tool harnesses, holding light-wands and long slender cutting tools; behind them a sleek white train with a rounded sealed cab, bronze hoops and one continuous ribbon of lit windows glides out of a perfectly round, light-ringed tunnel mouth on a single raised guideway beam, its wheels hidden under the body; rays fanning out from a great lamp above; far-future technology, not any historical period: no steam locomotive, no chimney, no smoke, no rails, no coats, caps, overalls or nineteenth-century clothing; small tesserae of ceramic, coloured glass and bits of scrap metal; many tiles missing in patches showing grey mortar beneath, cracks running through, grime and soot darkening the upper part. Full colour, muted by age: brick red #8a3a2c, ochre #b8893a, deep green #3a5a44, gold glass #c9a24a, grey mortar #8a867c.
```

`patterns/fellgang/daub` (a 2 x 2 atlas of the Fellgangs' daubed marks on plate; the slogans' letters are the kit's own decals):
```
Square, 2048x2048. A flat, front-on decorative panel filling the whole frame edge to edge: a 2 by 2 grid of four separate squares, each a sheet of rusty steel plate. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no border, no watermark, no letters or words. Panels: crude marks daubed and sprayed in thick paint on rusted, dented steel plate, with runs and drips: (1) a bold wheel symbol in white, scraped and repainted; (2) a charging aurochs with great horns in red; (3) rows of handprints and tally marks in black and white; (4) a large X and jagged stripes in red over older faded paint; paint flaking where the rust has pushed through. Full colour: rust #7a4a32, white #e8e2d4, red #a8302a, black #1c1a18.
```

`patterns/glazier/cholet-front` (the painted band on the Glaziers' carved fronts; tiles horizontally):
```
Seamless tileable texture, 2048x512 (a horizontal band). Orthographic view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: a painted decorative band on whitewashed plaster, in the bright flat colours of Andean cholet facades combined with Tibetan and Persian ornament: a row of stepped lozenges and zigzags, a running band of small eight-spoked wheels, thin gilt lines edging each band, colours rose, teal, saffron and white on the whitewash, the paint slightly worn. Full colour: rose #c8607a, teal #2a8a88, saffron #e0a030, white #f2eee4, gilt #c9a24a.

## 59. The Kimr (`biomes/labyrinth/KIMR.md`, planned 2026-11-11)

The Labyrinth's people (`LORE.md` section 6.24): their pueblos, masks, armour and the Hall of Heroes' funerary dressing. No Kimr kit is
built yet; these land with the first one (`kits/kimr`, or the Labyrinth's pueblo station), and the two surfaces marked *fauna* are
wanted by `kits/fauna`'s megafauna too. Everything else the Kimr need is already in the library (`KIMR.md` section 4's table: horn,
ivory, skull, ossuary, adobe, ochre plaster, buckskin, fur, rawhide, terracotta). Palette hexes are `KIMR.md` section 2's.

`hide.pachyderm` (near-colourless; tusker-hide armour, drums and litters; *fauna*: every pachyderm's skin):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: thick elephant or mammoth hide, a deep net of crossing wrinkles and creases dividing the skin into small irregular polygons, each slightly domed with a fine pebbled grain, deeper folds running in long roughly parallel lines, a few sparse coarse bristles, dried mud caught in the deepest creases, one or two old healed scratches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`shell.glyptodont` (near-colourless; round-room roofs, cisterns, scale armour, shields; *fauna*: the glyptodont's carapace):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the bony carapace of a giant fossil armadillo (glyptodont), a tight mosaic of thick hexagonal and pentagonal bone plates about the size of a palm, fitted edge to edge with narrow dark seams, each plate carrying a raised rosette: a central round boss ringed by six smaller bosses, the bone surface finely pitted and porous, weathered matte, a few plates chipped at the rim. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`earth.dung.stack` (near-colourless; the dung-cake walls at the foot of every pueblo's rock):
```
Seamless tileable texture, square, 2048x2048. Orthographic front view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a wall of dried dung fuel cakes stacked flat in rough courses, each cake a round flattened disc about 30 cm across seen edge-on and slightly overlapping, with straw and coarse grass fibres showing in the cracked dry surface, hand-pressed finger marks on some, crumbs and dust between the courses. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`patterns/kimr/handprints` (full colour; the Hall's niches and the houses' walls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a rough wall of white clay wash (#ece5d3) over earth plaster, covered with prehistoric hand-prints in red ochre (#9c3b23): about twenty adult and a few child hand-prints, fingers spread, some solid prints and some stencilled outlines with the ochre sprayed round the hand, at slightly different angles, overlapping in places, the older ones faded to pink, the plaster a little cracked. The pattern repeats in both directions. Full colour.
```

`patterns/kimr/bowl-band` (full colour; black-on-white bowls and ollas):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a painted pottery band in the Mimbres black-on-white style, flat matte kaolin white slip (#ece5d3) with fine hand-painted black (#221c18) lines: two thin framing lines top and bottom, between them a row of stepped terraces alternating with fine zigzag hatching, and a narrow lower band of small walking animals (shaggy cattle, mammoths, elk) all facing right, each a few strokes. The pattern repeats horizontally. Hand-painted, slightly uneven line weight, faint brush marks, no glaze shine.
```

`patterns/kimr/kilt-band` (full colour; woven kilt and sash borders, mantle edges):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a hand-woven border band of coarse undyed wool (#e8dfca) with a visible plain weave, carrying a pattern woven in black (#221c18) and red ochre (#9c3b23): a central row of large black stepped pyramids (terraces) each with a red stepped core, small red diamonds between them, and thin black and red stripes above and below. The pattern repeats horizontally. Slightly uneven dye and weave, a few slubs.
```

`patterns/kimr/shield` (full colour; one centred figure: shields and hide screens):
```
Square, 2048x2048. Orthographic front view of a flat, front-on decorative panel, flat even shadowless lighting, as if scanned: no highlights, no vignette, no perspective, no text, no border, no watermark. A single centred figure with a clear margin of plain ground all round: a round painted rawhide shield face seen flat, filling about 80 % of the frame, the ground natural tan rawhide (#8b6a48) with faint hair follicles and stretch marks; painted in flat red ochre (#9c3b23), yellow ochre (#d0a03c), charcoal black (#221c18) and white (#ece5d3): two concentric rings near the rim, short black rays between them, and in the centre a frontal bull's head with great horns raised into a lyre. Hand-painted with mineral pigments, edges slightly uneven, worn at the rim.
```

`patterns/kimr/mural` (full colour; the round rooms' murals):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a wall mural on matte clay plaster in the style of Pueblo kiva murals: a procession of four stiff frontal masked dancers on a pale ground (#e7d6b5), each with a tall cylindrical white mask with black eye bars and a different crown (great bull horns, ivory tusks, an elk antler, a big cat's fangs), red ochre (#9c3b23) and yellow ochre (#d0a03c) kilts and sashes, black (#221c18) outlines, one small touch of turquoise (#3a9e94) on the first mask's brow; under them a narrow band of small walking animals in black. Flat colour, no shading, plaster cracks and a few flaked patches. The pattern repeats horizontally.
```

`patterns/kimr/labyrinth` (full colour; one centred figure: the emblem on banners, hatches and rock art):
```
Square, 2048x2048. Orthographic front view of a flat, front-on decorative panel, flat even shadowless lighting, as if scanned: no highlights, no vignette, no perspective, no text, no border, no watermark. A single centred figure with a clear margin of plain ground all round: the classical seven-circuit labyrinth, its paths drawn as thick red ochre (#9c3b23) lines on a flat kaolin white (#ece5d3) ground, square-cornered as in Hopi rock art, with its one entrance at the bottom; above it, touching its top, a frontal bull's head in charcoal black (#221c18) with great horns curving up into a lyre. Painted with mineral pigment, edges slightly uneven, the white ground with a faint plaster grain.
```

## 60. The Qiblai kit (`kits/qiblai`, 2026-11-11)

The holy city of the Decree (`kits/qiblai/PLAN.md` section 9, item 2; the owner, 2026-11-11: "sure new textures"). Its dressed
stone reuses `stone.sandstone.ashlar` (wired: `kits/qiblai/materials.json`, `qAshlar`). Two are owed. They land as families in
`kits/qiblai/materials.json` (`qGoldSheet` for the gilt roofs, crowns and finials, now the plain `xGold`; `qMantra` for the prayer
wheels' drums, under the Song in the real Xanadui script that the kit draws over it, `src/89q0y-qb-script.js`), then `python3 tools/textures/pack.py kits/qiblai` and a rebuild. **2 prompts**, both full colour.

| id | Prompt |
|---|---|
| `metal.gold.sheet.beaten` | Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a Tibetan temple's gilt roof sheet: hand-beaten copper sheets fire-gilded with gold, laid in overlapping rectangular panels about 60 by 40 cm with narrow raised seams between them, every panel covered in small overlapping hammer facets, the gold rich and warm (#d8a838, #c8902a, #e8c060) and worn thin on the facets' edges so the coppery red beneath shows through (#a8583a), a little dark grime in the seams (#5a4024). Full colour: keep the gold and copper as they are, do not tint. |
| `metal.copper.mantra` | Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no letters, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the hammered copper skin of a great prayer wheel's drum: six plain horizontal bands of smooth beaten copper, each between two raised beaded ridges, the copper reddish-brown (#a8603a, #8a4a2c) with fine hammer facets, the beads rubbed bright by hands (#d89058), green-blue verdigris (#4a8a78) and dark tarnish (#3a2a20) gathered along the ridges. The bands stay blank: the script is drawn over them in the game. Full colour: keep the copper and verdigris as they are, do not tint. |

## 61. The Labyrinth's flora (`biomes/labyrinth` src/50-70, 2026-11-12)

The mammoth steppe's own kit (`biomes/labyrinth/README.md`, "The flora"). Everything else it draws is already in the library. Two are
owed. **`card.birch.silver`** replaces the stand-in on the silver birch's crowns (the slot `birchleaf` draws the summer row of
`card.birch.dwarf` today: dwarf birch's round leaves on a tree birch); it lands in `biomes/labyrinth/materials.json` `birchleaf` (run
`python3 tools/textures/check_cells.py biomes/labyrinth` for its stems). **`surface.melon.rind`** is the wild melon's skin (the slot
`melon`, today plain colour on `M.solid`): add a `melon` family and give the item a `BIO.solidMat` of its own in `src/50`. Then
`python3 tools/textures/pack.py biomes/labyrinth` and a rebuild of the four stations. **2 prompts**, both near-colourless.

`card.birch.silver` (near-colourless; the silver birch's leaf sprays, Betula pendula):
```
Square, 2048x2048. Orthographic view looking straight down on nine separate sprigs in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: hanging twig sprays of silver birch (Betula pendula), each a thin dark brown twig with a fine fork, carrying eight to twelve small triangular-ovate leaves with doubly serrated edges and pointed tips on slender stalks, the leaves alternate along the twig and drooping slightly, two sprays with a small green catkin; all nine the same size, the twig's base at the top of its cell and the spray hanging down from it. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`surface.melon.rind` (near-colourless; the wild melon's skin: a giant gourd to a metre across):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the rind of a giant wild gourd, smooth and slightly waxy, with broad irregular lengthwise stripes of lighter and darker skin running top to bottom across the tile, a fine net of pale corky lines over part of the surface like a cantaloupe's, a few small scars and sun-bleached blotches, faint shallow grooves between the stripes. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
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

## 62. The eastern highlands' combed beech (`biomes/ehighlands`, stations 5 and 6, 2026-11-15)

The combed beech (a southern beech of the cool rainforest: small, stiff, toothed leaves in flat sprays) draws `card.broadleaf`, a
jungle broadleaf rosette of big monstera-like leaves: drawn whole since 2026-11-15 (it was cut into ninths), but not a beech. The slot
is `beech` in `biomes/ehighlands/materials.json` (tint keep 0: the species' green); the crowns are clumps of flat tiers, so a sheet of
nine sprays held by their stems (`"stems"`, measured into `card-bases.json`) fits the fir's way:

`card.beech.southern`:
```
Square, 2048x2048. Orthographic view looking straight down on nine separate leafy sprays in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: flat sprays of a southern beech (Nothofagus) of a cold cloud forest, each a thin dark twig branching in one plane like a fishbone, densely set with small, stiff, oval leaves a centimetre or two long with finely toothed edges, overlapping in neat rows along the twigs, the twig's cut end at the top of each cell and the spray fanning down and out from it. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```
