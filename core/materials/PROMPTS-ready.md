# Ready-to-paste ChatGPT prompts: what is still owed

Every block is a complete prompt: paste it as it is, one image per prompt. Name the saved file after the `id` (slashes become
folders). "Near-colourless" rows are tinted by a build's palette, so the image must stay grey; "Full colour" rows keep their colours.
Cut-outs (cards, wings) are always on solid flat bright magenta (#ff00ff), never grey or white; a transparent PNG is fine too.

**Keep this file current:** when a delivery is processed, delete its blocks here and add a line to "Delivered and removed" below
(core/materials/PLAN.md, "Rules, from now"). Last pruned 2026-10-06 against core/materials/library, patterns/ and every local worktree.

## Open prompts

New gaps go here as they are found; prune them as they arrive.

### The geyser basin (`biomes/geyser`, 2026-10-07)

For the shared geyser kit (`biomes/geyser`; `core/materials/PLAN.md`, "The geyser basin", has what each is for). Until
they arrive the kit draws these procedurally or with a stand-in.

**`ground.travertine.white`** (full colour: the Stair's terraces; `stone.travertine.tufa` stands in)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Travertine terraces seen from directly above, like Pamukkale: bright white calcite (#f2f0ea) laid down by flowing spring water in scalloped rimstone dams, each dam a smooth rounded lip a hand wide curving in lobes, its outer face draped with fine vertical drip ridges and small stalactite fringes; between the dams shallow pools of pale milky turquoise water (#9ad8d8) over a smooth white floor; faint cream (#e8dcc0) and pale orange-brown (#c8905a) stains where the water slows. Full colour.
```

**`stone.geyserite`** (tintable: the geysers' cones; `ground.clay.popcorn` stands in)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Geyserite (siliceous sinter) on a geyser's cone seen close up: grey-white silica (#dedad0) built up in knobbly beaded crusts like cauliflower and popcorn, rounded beads from a few millimetres to a few centimetres clustered in ridges, a faint pearly sheen on the beads, small dark pits between them, faint buff (#cbbd9e) and salmon (#d8a890) stains in streaks. Near-colourless: keep the stains faint so the image reads as grey-white.
```

**`card.streamer`** (full colour: the flame streamers in the run-off)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of long silky streamers of thermophile filaments, the kind that grow in warm runoff from hot springs, combed out straight and parallel by flowing water, rooted together at the bottom of the cell and streaming up to the top, wet and glossy, bright orange (#e0782a) shading to golden (#f0a040) at the tips, a few strands olive-green (#7a8a34); vary the width and the length of the nine clumps. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

**`card.clubmoss`** (full colour: the nodding clubmoss on the warm crust)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a small clump of nodding clubmoss (Lycopodiella cernua): three to six upright stems like miniature pine trees, each densely clothed in tiny needle-like leaves, yellow-green (#7aa038) with paler new growth, a small pale yellow cone nodding at each branch tip, rooted at the bottom of the cell; vary the heights and the counts between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

**`card.steamcomb`** (full colour: the steam combs' fans, which comb water out of a fumarole's steam)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a fan of very fine, almost hair-thin pale grey-white filaments (#e4e8e0) radiating in a half circle from a small hub at the bottom middle of the cell, like a sea fan or a fine comb, the filaments a little translucent and beaded all over with tiny clear water droplets that catch the light; vary the width and the fullness of the nine fans. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

**`card.strap.pandan`** (full colour: the stilt pandans' strap leaves; one leaf per cell)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a single long strap leaf of a screwpine (Pandanus), standing upright from its base at the bottom of the cell to its tip near the top, the last third drooping a little to one side, narrow and keeled down the middle, its edges finely toothed, glossy green (#4e7432) shading to yellow-green (#8aa040) toward the base; vary the curve and the width between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

## Delivered and removed (2026-10-06)

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
