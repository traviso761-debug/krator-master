# Ready-to-paste ChatGPT prompts: what is still owed

Every block is a complete prompt: paste it as it is, one image per prompt. Name the saved file after the `id` (slashes become
folders). "Near-colourless" rows are tinted by a build's palette, so the image must stay grey; "Full colour" rows keep their colours.
Cut-outs (cards, wings) are always on solid flat bright magenta (#ff00ff), never grey or white; a transparent PNG is fine too.

**Keep this file current:** when a delivery is processed, delete its blocks here and add a line to "Delivered and removed" below
(core/materials/PLAN.md, "Rules, from now"). Last pruned 2026-10-06 against core/materials/library, patterns/ and every local worktree.

## Open prompts

New gaps go here as they are found; prune them as they arrive.

### The Zeijani (`kits/zeijani`, 2026-10-07)

These are for the Zeijani kit and their capital, Dhelv. `kits/zeijani/PLAN.md` section 10 has what each is for, its
tile size, the proposed palette, and the existing sets reused instead of new prompts.

The three tuff rows assume the owner's "tufa" means volcanic tuff. If it means spring limestone, skip them:
`stone.travertine.tufa` exists. The two basalt rock rows follow the owner's Raufarhólshellir photographs.

**`rock.tuff`** (tintable: the raw face of the carving rock)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The natural weathered face of welded volcanic tuff (ignimbrite), the soft rock of Cappadocia's fairy chimneys: fine-grained pale cream to rose-buff stone (#d9c8a6, #c9a28c) full of small darker grey-brown pumice lapilli and angular rock fragments 2 to 15 mm across, faint wavy horizontal layering, shallow pits where lapilli have weathered out, a few hairline cracks, a little grey-green lichen in patches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`stone.tuff.hewn`** (tintable: the walls of poor carved rooms and passages)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A wall hewn by hand into soft pale volcanic tuff (#d9c8a6), as in the rock-cut houses of Cappadocia: the whole surface covered in short shallow pick and adze scoops, each 3 to 6 cm long, laid in overlapping rows and gently curving fans that change direction every 40 to 60 cm, fine grey pumice specks in the stone, a faint soot darkening in some scoops, no plaster. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`stone.tuff.polished`** (tintable: wealthy and civic tuff)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Polished soft volcanic tuff (#d9c8a6, #c9a28c), the burnished walls of a rich rock-cut house: a satin-smooth surface with soft cloudy veining and faint banding, tiny pale and grey pumice flecks sealed flush into the polish, a few fine hairline cracks, slight wear in patches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`stone.basalt.polished`** (tintable: polished basalt in the tubes and the great hall)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Honed and polished dense basalt (#3a3e44, #2b2e34), a near-black volcanic stone ground smooth: a fine even crystalline grain with tiny pale feldspar glints, a scatter of small round gas holes filled flush with pale grey mineral, faint darker cloudy patches, a few fine scratches from use. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`rock.basalt.flowbanded`** (tintable: the glazed linings of lava-tube walls, after Raufarhólshellir)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The glazed inner lining of a lava tube's wall: dense blue-grey basalt (#5c6672, #2b2e34) built of many thin horizontal flow bands, like the edges of stacked slate, each band 1 to 4 cm thick with a silvery glassy lip (#aab4c0) and a dark groove beneath, the bands gently wavering, pinching out and splitting, a few small drips and pulled-out stretch marks, faint iron-red stains in some grooves. The bands run horizontally across the whole image. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`rock.basalt.oxidised`** (full colour: lava-tube breakdown ceilings and fallen blocks, after Raufarhólshellir)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The broken ceiling of an old lava tube cave, like Iceland's Raufarhólshellir: a mosaic of angular jointed basalt blocks and spalled slabs 10 to 40 cm across with sharp fractured edges, their faces stained by iron oxidation in deep oxide red (#9a3a3c), rose pink (#c06a74), rust orange (#b4602e) and mauve (#9a6a86), with smaller patches of magenta-purple (#74406e), blue-violet (#4a4e8a) and teal (#4a9490), a few specks of sulphur yellow (#d6c25a), thin white mineral crusts (#dcd8d0) along some cracks, and dark blue-grey basalt (#3a3e48) in the joints between the blocks. Full colour: not tinted.
```

**`bone.ossuary`** (tintable: the catacombs' ossuary walls)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The wall of an old ossuary packed solid with bones: long bones stacked in tight horizontal courses with their knobbed ends facing out, every fourth or fifth course a row of skulls set face-out, the bone ivory to pale brown (#e8e0cc, #b8a888), darker dust in the gaps, a little grey-green mould, nothing of the wall showing behind. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`patterns/zeijani/labyrinth-relief`** (near-greyscale relief: the council chamber and civic fronts, after ref 066f9f…)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: Carved relief in pale volcanic tuff covering a whole wall in one continuous labyrinth: swirling maze paths and square spiral whorls cut 2 to 4 cm deep, the spirals turning in alternate directions in a loose grid of cells, every path joining its neighbours so the surface reads as one unbroken maze, small drilled dots at some turns. Raised faces are light cream-grey (#d4c8b2) with a lit top edge, and recesses are darker grey-brown (#8a7e6c). The surface is slightly pitted and worn. Near-greyscale, no other colour. The pattern repeats in both directions.
```

**`patterns/zeijani/frieze-spirits`** (near-greyscale relief band: wealthy fronts, the temple's base)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: A carved relief frieze band in pale volcanic tuff: a procession of masked spirit dancers seen from the front, each with a tall stepped headdress like a terraced tablet, a round mask with rectangular eyes and a straight mouth, a ruff of mushroom gills at the neck, a kilt and sash, one hand holding a rattle and the other a staff; between the dancers, stepped cloud terraces, zigzag lightning and falling rain lines; a band of square meander along the top and bottom. Invented figures, not copies of any real sacred figures. Raised faces are light cream-grey (#d4c8b2) with a lit top edge, and recesses are darker grey-brown (#8a7e6c). Near-greyscale, no other colour. The pattern repeats horizontally.
```

**`patterns/zeijani/kiva-mural`** (full colour: kiva and shrine walls)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: A painted mural on smooth lime plaster (#e6dcc6), as on the walls of a sunken round shrine: a row of masked spirit figures seen from the front with tall stepped headdresses, painted flat in earth and fungus pigments, oxide red (#a23a2a), ochre yellow (#c49a4a), alecap purple (#5e3470), turquoise (#3f8f88), soot black (#221e1c) and bone white (#e8e0cc); between them stepped cloud terraces, rain lines, spirals, and purple mushrooms with pale stems growing from the ground line; a black base band with a thin red line along the bottom. The paint is worn and flaked in places, showing the plaster. Invented figures, not copies of any real sacred figures. Full colour. The pattern repeats horizontally.
```

**`patterns/zeijani/textile`** (full colour: blankets, awnings, banners, cushions)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: A hand-woven wool blanket with a bold geometric pattern of stepped diamonds, stepped terraces and zigzag bands, crossed by narrow bands of angular interlocking knots, woven in alecap purple (#5e3470), ochre (#c49a4a), cinnabar red (#a23a2a), soot black (#221e1c) and bone white (#e8e0cc), visible weave, slightly uneven dye, a few loose fibres. Full colour. The pattern repeats in both directions.
```

**`patterns/zeijani/glazed-frieze`** (full colour: the capital portal's rim, the temple's processional way)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: A wall of glazed moulded bricks like an ancient processional gate: a deep turquoise glaze ground (#2f7f86) with, in low relief, a striding crested salamander with a long tail and clawed feet, glazed ochre (#c49a4a) and bone white (#e8e0cc) with alecap purple (#5e3470) details, between bands of white and ochre rosettes along the top and bottom; thin pale mortar lines between the bricks; the glaze slightly crazed and worn on the raised edges. Full colour. The pattern repeats horizontally.
```

**`patterns/zeijani/jali`** (cut-out on magenta: the temple's pierced dome and screens)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: A pierced stone lattice screen cut from pale volcanic tuff (#d4c8b2): an interlaced geometric pattern of eight-pointed stars and hexagons, the stone bars 3 to 5 cm wide with finely carved edges and small drilled rosettes where they cross; the holes are about half the area, and through every hole shows solid flat bright magenta (#ff00ff), pure and even, with hard clean edges against the stone and no fringe of other colours. Full colour. The pattern repeats in both directions.
```

**`card.mushroom.alecap`** (cut-out: the alecap, in farm beds and wild)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of three to nine alecap mushrooms growing from one small mound of dark compost: stout pale lilac-white stems (#d8cce0), broad domed caps of deep purple (#5e3470) shading to lilac (#9a78ac) at the rim, a satin sheen, faint radial streaks and a few pale speckles, pale grey gills just visible under the rims; vary the heights, the count and the cap sizes between the nine, and give one or two clumps young button caps. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

**`card.crop.yam`** (cut-out, optional: try `card.vine` and `card.crop` first)
```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a young yam plant twining up a short wooden stake: thin green stems (#4a7a3a) with glossy heart-shaped leaves (#3f6f30 to #6a9a48) in alternate pairs, a few purple-tinged leaf stalks, the top of the stake showing above the leaves, a small mound of dark soil at its foot; vary the height and leafiness between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours.
```

## Delivered and removed (2026-10-06)

Delivered under the same id (44): `stone.cut`, `plaster`, `brick`, `metal.corrugated`, `roof.tile`, `metal.iron`, `metal.bronze`, `metal.gold`, `patterns/iziz/gilt`, `patterns/iziz/banner`, `wood.mahogany`, `wood.lamppost`, `metal.iron.pitted`, `bone.skull`, `bone.horn`, `bone.antler`, `hide.pelt.cat`, `fibre.net`, `cloth.silk`, `wax.tallow`, `organic.gourd`, `earth.floor.packed`, `bark.mahogany`, `bark.ironbark`, `bark.baobab`, `card.mahogany`, `card.vine`, `card.screwpine`, `card.bromeliad`, `card.moss`, `card.crop`, `card.flower.bloom`, `fruit.skin.orange`, `fruit.skin.amber`, `fruit.husk`, `fruit.capsule`, `membrane.pterosaur`, `membrane.bat`, `fur.bat`, `wing.dragonfly`, `chitin.spider`, `chitin.millipede`, `fur.sloth`, `hide.strider`.

Delivered under another id: `hide.rawhide` as `patterns/common/rawhide`, `fibre.basket.coiled` as `patterns/common/basket-coil`, `fibre.mat.floor` as `library/fibre.reedmat`, `lantern.horn` as `patterns/common/lantern-horn`, `lantern.paper` as `patterns/common/lantern-paper`, `bone-inlay` as `patterns/beast-riders/bone-inlay`, `claw-tapestry` as `patterns/beast-riders/claw-tapestry`, `emblem` as `patterns/beast-riders/emblem`, `totem` as `patterns/beast-riders/totem`, `pennant` as `patterns/beast-riders/pennant`, `plaque` as `patterns/beast-riders/plaque`, `rider.saddle` as `patterns/beast-riders/saddle`, `feather.archae` as `library/card.feather.archae`, `feather.quetzal-crest` as `library/card.feather.crest`, `skin.scale.archae` as `library/organic.scale.terracotta`, `chitin.dragonfly` as `library/organic.chitin.iridescent`.

Delivered later the same day: `wing.butterfly` (in Iziz's pack), `skin.sky-ray` (in Iziz's pack), `hide.fuzz.pterosaur` (Girder's quetzal), `cloth.canvas.striped`, `concrete.ancient` (plus `concrete.ancient.b`), `wood.log.carved`; then `patterns/reedlake/band`, `ground.reedbed`, `reed.layers`, `reed.bundle`, `metal.worn`, `patterns/port/hazard`, `plate.hex`, `patterns/port/primer`, `concrete.slab`, `organic.fungus.stalk`, `stone.rendered.ruined`, `patterns/dalab/banner`, `patterns/dalab/mural-god-hero`, `patterns/dalab/mosaic`; then `patterns/dalab/mural-lizards`, `card.lichen`, `card.lotus`, `card.samphire`, `bark.mesquite`, `bark.boojum`, `skin.marine`, `bark.strangler`; then `patterns/nacre/banded-trim`, `bark.dragon`, `ground.shingle`, `metal.container`, `card.heath`, `card.ginkgo`, `card.palm` (and `skin.marine.b`, an extra).

Delivered on a branch not yet merged: `wood.lash` (library/wood.lash on branch claude/hexahedron-materials (not merged yet)).

Delivered 2026-10-06, late (Downloads; batches `chatgpt-2026-10r-owed.json` and `-cards.json`): `earth.rammed`, `patterns/reedlake/awayo`, `band.xanadu.twig`, `patterns/xanadu/sun-emblem`, `patterns/nacre/shell-inlay`, `patterns/nacre/pearl-mosaic`, `wood.petrified`, `roof.turf`, `tile.bath.lens`, `panel.solar`, `card.pods`, `card.litter`, `card.reef`, `bark.paperbark`, `bark.whorled`, `organic.fungus.gill`, `skin.alien.banded`, `metal.rust.fine`, `metal.corrugated.rusty`. `metal.rust.fine` came out as an even pale-grey grain (the prompt's near-colourless rule), which is what the stretched Ancients beams need.
Delivered 2026-10-06, late (pasted): `fruit.seeds`, `fruit.flesh`, `fruit.scale` (batch `chatgpt-2026-10u-fruit.json`). `fruit.jelly` followed (batch `chatgpt-2026-10v-jelly.json`).
Delivered on main (the eastern highlands, 2026-10-06): `ground.puna`, `ground.turf.polygon`, `surface.cushion`, `surface.fleece`,
`bark.ragbark`, `rock.basalt.vesicular`, `ground.sinter`, `card.ichu`, `card.ragleaf`, `card.rheumleaf`.
