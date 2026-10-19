# Ready-to-paste ChatGPT prompts: what is still owed

Every block is a complete prompt: paste it as it is, one image per prompt. Name the saved file after the `id` (slashes become
folders). "Near-colourless" rows are tinted by a build's palette, so the image must stay grey; "Full colour" rows keep their colours.
Cut-outs (cards, wings) are always on solid flat bright magenta (#ff00ff), never grey or white; a transparent PNG is fine too.

**Keep this file current:** when a delivery is processed, delete its blocks here and add a line to "Delivered and removed" below
(core/materials/PLAN.md, "Rules, from now"). Last pruned 2026-10-15 against core/materials/library, patterns/ and every local worktree
(the geyser basin's six rows landed in `../krator-isle`).

## Open prompts

New gaps go here as they are found; prune them as they arrive.

### The Voth canton walls and floors (2026-10-15)

The owner: "the cantons probably need better wall and floor textures as well except the palace which is ok". Until these arrive,
`settlements/voth/materials.json` stands in with generic library sets: `int_ashlar` (`stone.sandstone.ashlar`), `int_flag`
(`paving.flagstone`), `int_paving` (`paving.pavement_01`), `int_wood` (`wood.old_wooden_floor_02`), `int_stucco`
(`plaster.white_stucco_02`), `int_tuff` (`stone.tuff.polished`), `int_basalt` (`stone.basalt.polished`), `int_oldwall`
(`rock.old_stone_wall`), `int_earth` (`earth.floor.packed`). They are clean scans, not Voth: no ash, no fret, no volcanic dark. Each
block below replaces one of them (the family named in brackets). The first seven are near-colourless (the canton's look tints them);
the last is full colour.

`library/plaster.voth.ochre` (near-colourless; replaces `int_ashlar` and `int_stucco` on the common cantons' and the Foreign canton's walls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: an
interior wall of thick hand-trowelled lime plaster over stone, broad soft trowel sweeps, faint hairline cracks, a few shallow chips
showing coarse plaster beneath, a light bloom of grey volcanic ash settled in the hollows. Keep colours natural but slightly muted and
even, a pale warm grey with no strong hue, so the texture can be tinted to different palettes without looking stained.
```

`library/stone.ashlar.tuff` (near-colourless; replaces `int_ashlar` where a canton's walls are bare stone: the Granary, the Arsenal, the Port):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a wall
of coursed ashlar in porous volcanic tuff, rectangular blocks about 60 by 30 cm in level courses with staggered joints, thin pale lime
mortar joints, fine diagonal chisel tooling on each face, small dark pores and pumice inclusions, soot darkening a few blocks. Keep
colours natural but slightly muted and even, mid grey, so the texture can be tinted to different palettes without looking stained.
```

`library/stone.flag.basalt` (near-colourless; replaces `int_flag` and `int_paving` on the common cantons' floors and halls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: an
indoor floor of large irregular basalt flagstones, each 50 to 90 cm across, fitted closely with narrow joints packed with grey ash
dust, the stones worn smooth and slightly polished by feet, a few fine cracks and small vesicle pits. Keep colours natural but slightly
muted and even, dark to mid grey, so the texture can be tinted to different palettes without looking stained.
```

`library/wood.plank.smoked` (near-colourless; replaces `int_wood` in the rooms where people live and write):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a
floor of wide old hardwood planks, each about 25 cm wide, running vertically in the frame with staggered butt joints, darkened by years
of lamp smoke, the grain worn into soft ridges along a walking path, square iron nail heads, a few dark knots. Keep colours natural but
slightly muted and even, a mid grey-brown, so the texture can be tinted to different palettes without looking stained.
```

`library/stucco.voth.fret` (near-colourless; replaces `int_stucco` on the Temple's walls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a
temple wall of fine smooth stucco carved in a shallow all-over relief of interlocking stepped-fret spirals (Mesoamerican greca), the
relief about 1 cm deep, the motif repeating four times across and four times down, crisp carved edges a little softened by age, smoke
grime gathered in the recesses. Keep colours natural but slightly muted and even, a pale bone grey, so the texture can be tinted to
different palettes without looking stained.
```

`library/stone.fortress.block` (near-colourless; replaces `int_blocks` and `int_basalt` in the Fortress):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a
fortress wall of massive rough-dressed black basalt blocks about 1.2 by 0.6 m, laid in heavy courses with deep dark joints, pitted
faces with coarse punch-tool marks, an occasional iron cramp set into a joint with a rust stain below it. Keep colours natural but
slightly muted and even, dark grey, so the texture can be tinted to different palettes without looking stained.
```

`library/stone.ancestor.niches` (near-colourless; replaces `int_oldwall` on the Ancestry canton's walls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: an old
wall of fitted grey stone with a regular grid of small shallow arched niches cut into it, four across and four down, each niche about
the size of a hand and holding a smooth rounded stone urn shape, worn ash-dust in the niche floors, wax drips below a few of them. Keep
colours natural but slightly muted and even, mid grey, so the texture can be tinted to different palettes without looking stained.
```

`patterns/voth/tile-ash-terracotta` (full colour; replaces `int_tuff` on the Temple's floors and `int_mosaic` in the Foreign halls):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge.
Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no
objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a
floor of unglazed terracotta tiles, elongated hexagons about 30 cm long in warm red-ochre, set with small square insets of black
ash-glazed tile where four hexagons meet, thin dark grout lines, the terracotta worn paler along a walking line and slightly mottled
from the kiln.
```

## Delivered and removed (2026-10-06)

Delivered 2026-10-15 (`Downloads/vothtex.zip`; batch `voth-interiors-2026-10-15.json`): all sixteen of "The Voth interiors":
`patterns/voth/stucco-green-relief`, `tile-green-glazed`, `tapestry-tzintzun`, `tapestry-procession`, `carpet-palace`, `inlay-jade-gold`,
`chandelier-drum`, `tapestry-temple`, `relief-ancestors`, `icon-sanctuary`, `banner-glyph-blue`, `column-carved-inlaid`, `screen-lattice`,
`awning-stall`, `mural-shrine` and `library/cloth.hide.canopy`; and eleven extras the owner added for variety and the myth of the three
brothers (the Chichani, the Zeijani and the Andaru): `patterns/voth/fresco-three-brothers`, `fresco-brothers-ascent`, `damask-purple-gold`,
`mosaic-ringed-giant`, `filigree-crimson`, `filigree-purple`, `tapestry-masks`, `banner-glyph-rust`, `banner-glyph-lavender`,
`patterns/common/mudcloth`, `patterns/common/kilim-banded-brown`. All wired in `settlements/voth/materials.json`. The same zip carried
five of `PROMPTS-NEEDED.md` section 0's redos (batch `redos-2026-10-15.json`): in the library, not wired (that file says what to re-pack).

Delivered 2026-10-15 (in `../krator-isle`, `biomes/geyser`): `ground.travertine.white`, `stone.geyserite`, `card.streamer`, `card.clubmoss`, `card.steamcomb`, `card.strap.pandan`: the geyser basin is complete.

Delivered 2026-10-16 (pasted): the Lizardmen ornament, `patterns/lizardmen/leiwen` (and `leiwen-b`, a busier taotie take), `patterns/lizardmen/glyph-band` (and `glyph-band-b`), `patterns/lizardmen/spiral-eye` (on magenta), and `library/rock.basalt.polygonal` (the capital's cyclopean masonry). All wired in `kits/lizardmen` (`materials.json`: `leiwenS`, `leiwenS2`, `glyphS`, `glyphS2`, `eyeS`, `cyclo`). Nothing of the Lizardmen is owed.

Delivered 2026-10-07 (`Downloads/zeijani.zip`; batches `zeijani-2026-10.json`, `zeijani-cards-2026-10.json`): `rock.tuff`, `stone.tuff.polished`,
`stone.basalt.polished`, `rock.basalt.flowbanded`, `rock.basalt.oxidised`, `bone.ossuary`, `patterns/zeijani/labyrinth-relief`,
`patterns/zeijani/frieze-spirits`, `patterns/zeijani/kiva-mural`, `patterns/zeijani/textile`, `patterns/zeijani/glazed-frieze`,
`patterns/zeijani/jali`, `card.mushroom.alecap`, `card.crop.yam`; and eight extras: `frieze-spirits-b`, `-c`, `frieze-skeletons`,
`kiva-mural-b`, `-c`, `textile-b`, `glazed-frieze-dragonfly`, `glazed-frieze-beetle` (all `patterns/zeijani/`). Then, pasted the same day:
`stone.tuff.hewn` (in the same batch). Nothing of the Zeijani is owed.

Delivered under the same id (44): `stone.cut`, `plaster`, `brick`, `metal.corrugated`, `roof.tile`, `metal.iron`, `metal.bronze`, `metal.gold`, `patterns/iziz/gilt`, `patterns/iziz/banner`, `wood.mahogany`, `wood.lamppost`, `metal.iron.pitted`, `bone.skull`, `bone.horn`, `bone.antler`, `hide.pelt.cat`, `fibre.net`, `cloth.silk`, `wax.tallow`, `organic.gourd`, `earth.floor.packed`, `bark.mahogany`, `bark.ironbark`, `bark.baobab`, `card.mahogany`, `card.vine`, `card.screwpine`, `card.bromeliad`, `card.moss`, `card.crop`, `card.flower.bloom`, `fruit.skin.orange`, `fruit.skin.amber`, `fruit.husk`, `fruit.capsule`, `membrane.pterosaur`, `membrane.bat`, `fur.bat`, `wing.dragonfly`, `chitin.spider`, `chitin.millipede`, `fur.sloth`, `hide.strider`.

Delivered under another id: `hide.rawhide` as `patterns/common/rawhide`, `fibre.basket.coiled` as `patterns/common/basket-coil`, `fibre.mat.floor` as `library/fibre.reedmat`, `lantern.horn` as `patterns/common/lantern-horn`, `lantern.paper` as `patterns/common/lantern-paper`, `bone-inlay` as `patterns/beast-riders/bone-inlay`, `claw-tapestry` as `patterns/beast-riders/claw-tapestry`, `emblem` as `patterns/beast-riders/emblem`, `totem` as `patterns/beast-riders/totem`, `pennant` as `patterns/beast-riders/pennant`, `plaque` as `patterns/beast-riders/plaque`, `rider.saddle` as `patterns/beast-riders/saddle`, `feather.archae` as `library/card.feather.archae`, `feather.quetzal-crest` as `library/card.feather.crest`, `skin.scale.archae` as `library/organic.scale.terracotta`, `chitin.dragonfly` as `library/organic.chitin.iridescent`.

Delivered later the same day: `wing.butterfly` (in Iziz's pack), `skin.sky-ray` (in Iziz's pack), `hide.fuzz.pterosaur` (Girder's quetzal), `cloth.canvas.striped`, `concrete.ancient` (plus `concrete.ancient.b`), `wood.log.carved`; then `patterns/reedlake/band`, `ground.reedbed`, `reed.layers`, `reed.bundle`, `metal.worn`, `patterns/port/hazard`, `plate.hex`, `patterns/port/primer`, `concrete.slab`, `organic.fungus.stalk`, `stone.rendered.ruined`, `patterns/dalab/banner`, `patterns/dalab/mural-god-hero`, `patterns/dalab/mosaic`; then `patterns/dalab/mural-lizards`, `card.lichen`, `card.lotus`, `card.samphire`, `bark.mesquite`, `bark.boojum`, `skin.marine`, `bark.strangler`; then `patterns/nacre/banded-trim`, `bark.dragon`, `ground.shingle`, `metal.container`, `card.heath`, `card.ginkgo`, `card.palm` (and `skin.marine.b`, an extra).

Delivered on a branch not yet merged: `wood.lash` (library/wood.lash on branch claude/hexahedron-materials (not merged yet)).

Delivered 2026-10-06, late (Downloads; batches `chatgpt-2026-10r-owed.json` and `-cards.json`): `earth.rammed`, `patterns/reedlake/awayo`, `band.xanadu.twig`, `patterns/xanadu/sun-emblem`, `patterns/nacre/shell-inlay`, `patterns/nacre/pearl-mosaic`, `wood.petrified`, `roof.turf`, `tile.bath.lens`, `panel.solar`, `card.pods`, `card.litter`, `card.reef`, `bark.paperbark`, `bark.whorled`, `organic.fungus.gill`, `skin.alien.banded`, `metal.rust.fine`, `metal.corrugated.rusty`. `metal.rust.fine` came out as an even pale-grey grain (the prompt's near-colourless rule), which is what the stretched Ancients beams need.
Delivered 2026-10-06, late (pasted): `fruit.seeds`, `fruit.flesh`, `fruit.scale` (batch `chatgpt-2026-10u-fruit.json`). `fruit.jelly` followed (batch `chatgpt-2026-10v-jelly.json`).
Delivered on main (the eastern highlands, 2026-10-06): `ground.puna`, `ground.turf.polygon`, `surface.cushion`, `surface.fleece`,
`bark.ragbark`, `rock.basalt.vesicular`, `ground.sinter`, `card.ichu`, `card.ragleaf`, `card.rheumleaf`.
