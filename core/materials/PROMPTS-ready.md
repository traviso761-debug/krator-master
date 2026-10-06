# Ready-to-paste ChatGPT prompts: what is still owed

Every block is a complete prompt: paste it as it is, one image per prompt. Name the saved file after the `id` (slashes become
folders). "Near-colourless" rows are tinted by a build's palette, so the image must stay grey; "Full colour" rows keep their colours.
Cut-outs (cards, wings) are always on solid flat bright magenta (#ff00ff), never grey or white; a transparent PNG is fine too.

**Keep this file current:** when a delivery is processed, delete its blocks here and add a line to "Delivered and removed" below
(core/materials/PLAN.md, "Rules, from now"). Last pruned 2026-10-06 against core/materials/library, patterns/ and every local worktree.

## 1. Buildings

From core/materials/PLAN.md, "Buildings, vehicles and biomes audit". `reed.living` is not here: `card.reed` covers it.

**`cloth.canvas.striped`** (for: Iziz, Highlands, Dalab, Reed Lake, Xanadu, Ys, Verge awnings, rugs, bolsters)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Striped woven canvas for awnings, rugs and bolsters: six broad vertical stripes per tile alternating a mid-grey dyed stripe with off-white, each dyed stripe edged by a thin darker line, fine woven canvas grain, slight fading and a few soft creases. The pattern repeats horizontally. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`wood.log.carved`** (for: Highlands, Dalab, Reed Lake, Ys log walls)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Wall of round horizontal logs seen straight on, six log courses filling the frame top to bottom, each log's rounded crown catching the light and curving away above and below, dark clay and moss chinking between the courses, drying checks and a few knots along each log. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`concrete.ancient`** (for: the whole Ancients lineage (54-mat-concrete.js))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Board-formed concrete of an ancient megastructure: three horizontal board marks per tile, each pour a slightly different shade, a dark groove with a lit lip at every board joint, a regular grid of round recessed form-tie holes with a rust weep streak below each, damp streaks running down from the joints, fine aggregate speckle. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`earth.rammed`** (for: Dalab (earth.rammed.dalab) and Xanadu (stone.rammed): one set for both)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Rammed earth wall seen straight on: six horizontal lifts per tile, each lift with a thin dark shadow line at its top and a slightly lighter band just below, compacted earth with fine grit and rain pitting, a few form-board end marks and small crumbled patches. No pebbles. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`metal.container`** (for: Port, Ys, post-apoc container walls)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Corrugated steel shipping-container side seen straight on: wide trapezoidal vertical ribs, eight per tile, painted metal with rust streaks running down from the top and rust blotches at the rib bends, dents, scratches and dark specks. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`reed.bundle`** (for: Reed Lake bundle walls and boats, reed furniture (37 catalog pieces))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Tightly bound bundles of dried reed seen straight on, stalks running vertically, bundles side by side with dark gaps between them, darker nodes along the stalks, two rope lashings across every bundle at the same heights. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`reed.layers`** (for: Reed Lake island sides)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Side of a floating reed island seen straight on: five horizontal courses of packed dry reed stalks per tile, ragged stalk ends, darker and damper toward the bottom edge of every course. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`ground.reedbed`** (for: Reed Lake island tops, Mungo)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Top of a floating reed island seen from above: a dense mat of short dry reed straws lying in every direction, a few darker damp patches and a few small sprouting tufts. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`metal.worn`** (for: Ancients white panels, tarnished)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Ancient white metal cladding: a grid of flat rectangular panels, two across and four down, separated by narrow recessed seams, the off-white paint (#e6e2da) washed with orange-brown tarnish (#b07054) bleeding from the seams and round fasteners in downward runs, patchy and streaked. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/port/hazard`** (for: Port, Ys)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Industrial hazard striping: bold diagonal stripes at 45 degrees alternating safety yellow (#d9a12c) and near-black iron (#2c2e32), each stripe about equal width, painted on steel, slightly chipped and scuffed at the stripe edges with a few specks of rust (#7a4630) and faint grey dirt, flat paint with a faint roller texture. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/port/primer`** (for: Port, Ys hulls in primer)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Unfinished steel hull plating in primer: overlapping patchy coats of red-oxide primer (#9a5c3e) and grey shop primer (#8d918f), visible roller and spray edges, bare dark-grey steel (#55534e) in scratches, vertical weld seams and rows of round rivets, a few orange rust blooms (#7a4630), matte finish. The pattern repeats in both directions. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`plate.hex`** (for: Ring Sea hex plating)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Bevelled hexagonal armour plates in a honeycomb, each plate lighter at its centre and darker toward its bevelled edges, a dark outline between plates, a small round boss at every centre, light scuffs. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`concrete.slab`** (for: post-apoc yards and floors)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Pale poured concrete slab seen from above: saw-cut joint lines dividing the tile into two by two slabs, a small bolt plate at each joint crossing, a few vertical damp stains and hairline cracks, fine trowel texture. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`organic.fungus.stalk`** (for: Voth and Locus giant-mushroom stalks (the cap is organic.fungus.cap))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Stalk of a giant mushroom seen straight on: pale fibrous flesh with long vertical striations, a few shallow ring scars, fine pores and soft bruise-coloured blotches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`stone.rendered.ruined`** (for: Highlands ruins)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Cream lime render on a wall, flaking away in large patches to show the brick and rubble beneath, hairline cracks across the render, damp streaks darkening the lower part. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`patterns/dalab/banner`** (for: Dalab banners (patterns/common/banner-hung is the plain stand-in))
```
A single flat, front-on decorative panel, square, 2048x2048, the design centred and filling the frame with a narrow even margin. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient. No perspective, no text, no border, no watermark. Design: A hanging cloth banner, taller than wide: a pale ring like an eye at its upper middle with short rays around it, two horizontal bars below, a fringed foot, plain-woven grey cloth, faded and creased. Keep colours natural but slightly muted and even, so the banner can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`patterns/dalab/mosaic`** (for: Dalab mosaic floors and dados)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Glazed tile mosaic: blue (#2a6ab0) and cream (#efe4cc) diamonds in a checker, each diamond with a small ochre (#c88a3a) square at its centre, thin dark grout lines (#3a3028). The pattern repeats in both directions. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/dalab/mural-god-hero`** (for: Dalab mural variant 0)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A painted frieze on cream lime wash (#e6d8b8) between thin red ochre (#a8382a) stripes and black (#2a2420) stepped-fret bands: a seated god avatar with a rayed headdress beside a striding hero holding a red shield and a spear, in gold (#d8a838), turquoise (#2f9a8a), red and black, hand-painted and slightly worn. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/dalab/mural-lizards`** (for: Dalab mural variant 3)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A painted frieze on cream lime wash (#e6d8b8) between thin red ochre (#a8382a) stripes and black (#2a2420) stepped-fret bands: two turquoise (#2f9a8a) lizards with gold (#d8a838) stripes facing each other either side of a gold maize sheaf, hand-painted and slightly worn. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/reedlake/band`** (for: Reed Lake woven bands)
```
Seamless tileable texture, four times as wide as tall, 2048x512. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A woven band: madder red field (#a8352a), black selvedges (#221c18) along top and bottom, thin ochre lines (#d19a3a), four stepped diamonds in black, white (#efe4cc) and indigo (#2f4a7a) along the middle, white zigzags above and below them, visible weave. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/reedlake/awayo`** (for: Reed Lake awayo cloth)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Andean awayo carrying cloth: horizontal stripes in red, ochre, black, white, indigo, green (#3f7a5a) and plum (#6a2a4a), with black-edged bands of stepped diamonds and zigzags, visible warp-faced weave. The pattern repeats in both directions. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`band.xanadu.twig`** (for: Xanadu penbey twig bands)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A band of bundled tamarisk twigs seen straight on: thin vertical twigs packed side by side, bound by stitched cord joints across the band at two even heights. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`patterns/xanadu/sun-emblem`** (for: Xanadu sun-and-moon roundel (medallion-sun-amber stands in))
```
A single flat, front-on decorative panel, square, 2048x2048, the design centred and filling the frame with a narrow even margin. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient. No perspective, no text, no border, no watermark. Design: A sun-and-moon roundel: a gold (#e0b040) disc inside a maroon (#6e2a2a) ring, a twelve-point gold star, a cream (#f4efe4) centre holding a maroon crescent moon, painted glazed tile. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/nacre/shell-inlay`** (for: Ys, the nacre culture)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Shell inlay: pieces of cut calcareous shell in cream and ivory (#f3ece0, #e6dccb, #f1e9d8) set into a pale warm-stone ground (#d9cfbc), arranged as a frieze of overlapping scallop and spiral forms with fine hairline joints, subtle concentric growth rings and tiny pits, a few coral-pink (#e8a08c) and sea-teal (#3e9c96) pieces as accents. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/nacre/pearl-mosaic`** (for: Ys, the nacre culture)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Pearl mosaic: staggered rows of small fish-scale tiles, each a rounded scale with a thin dark seam around its edge and a lighter top, in pale pearl white (#f4f0ea, #eae8ee, #f0eef4) with a faint pink and lavender sheen, a scattering of sea-teal (#57b2ab) and sea-green (#6aa892) tiles and a few coral-pink (#f0b5a2) ones. The pattern repeats in both directions. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`patterns/nacre/banded-trim`** (for: Ys, the nacre culture)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Nacre-banded trim: a horizontal frieze of three parallel bands of polished mother-of-pearl in pearl white (#f6f2ec) shading to pale pink (#f0b5a2) and sea-teal (#7fcfc6), separated by thin ivory-bone strips (#e9e0cc), a dark tideline-black edge line (#2a2622) at the bottom, fine wavy growth lines along each band, soft pearly depth. The pattern repeats horizontally. Full colour: keep the colours exactly as described; this texture is not tinted.
```

## 2. Biomes

`card.palm` and `card.lotus` came back as surfaces (`leaf.palm.thatch`, `ground.lilypond`); the cards are still wanted.

**`card.palm`** (for: sedesert, eastabyss, rift, nw/swlowlands, xanadu palms)
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Five pinnate date-palm fronds laid diagonally and four pleated fan-palm (palmetto) fans, each a single frond with its stalk. Draw the plant material in a light, slightly muted neutral grey-green with natural variation in value only, so it can be tinted to different species without looking stained.
```

**`card.lotus`** (for: xanadu and nwbay ponds (ground.lilypond is the pond surface))
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Nine floating lily pads seen from above, round with one notch, five of them carrying an open lotus flower; petals pale cream. Draw the plant material in a light, slightly muted neutral grey-green with natural variation in value only, so it can be tinted to different species without looking stained.
```

**`card.lichen`** (for: sedesert, ebadlands, crater rocks)
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Nine ragged lichen patches seen from above, crustose and leafy rosettes of different shapes, in orange, grey-green and yellow. Full colour: keep the colours exactly as described; this texture is not tinted.
```

**`bark.dragon`** (for: sedesert dragon tree and quiver tree (the bark.desert row))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Dragon-tree bark seen straight on: smooth grey-brown skin banded by horizontal rings of old leaf scars, fine vertical cracks between the bands. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`bark.mesquite`** (for: sedesert and ebadlands mesquite (the bark.desert row))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Mesquite bark seen straight on: dark, deeply furrowed bark in long twisting ridges, stringy fibres peeling at the ridge edges. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`bark.boojum`** (for: sedesert bottle tree and boojum (the bark.desert row))
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Bottle-tree bark seen straight on: smooth pale trunk skin with thin papery flakes peeling in places, small scattered short spines. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`bark.strangler`** (for: nwbay strangler figs)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Strangler-fig trunk seen straight on: smooth grey aerial roots fused into a net of thick and thin strands running mostly vertically, dark gaps between them, a few branching joins. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`card.samphire`** (for: eastabyss salt flats, rift)
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Nine sprigs of samphire (glasswort): jointed fleshy succulent stems branching like tiny cacti, each standing from the bottom of its cell. Draw the plant material in a light, slightly muted neutral grey-green with natural variation in value only, so it can be tinted to different species without looking stained.
```

**`card.ginkgo`** (for: nwlowlands, xanadu)
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Nine ginkgo twigs, each with five to eight fan-shaped two-lobed leaves on short spurs. Draw the plant material in a light, slightly muted neutral grey-green with natural variation in value only, so it can be tinted to different species without looking stained.
```

**`card.heath`** (for: nhighlands heath and bilberry)
```
A single sheet of nine separate cut-outs on a solid flat bright magenta (#ff00ff) background, square, 2048x2048, in a three-by-three grid, each fully visible and well separated with magenta all round it, no overlap. No magenta, pink or purple anywhere in the subject. Viewed straight on, flat even shadowless lighting, no cast shadow, no ground under them, no grey or white background. Subject: Nine low clumps of heather and bilberry: fine needle leaves and tiny round leaves on woody stems, a few clumps with small bell flowers, each standing from the bottom of its cell. Draw the plant material in a light, slightly muted neutral grey-green with natural variation in value only, so it can be tinted to different species without looking stained.
```

**`ground.shingle`** (for: xanadu shores; any pebble beach)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Beach shingle seen from above: rounded flat pebbles of two to six centimetres packed together, a few shell fragments between them. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`skin.marine`** (for: nw/swbay swimmers; any whale or dolphin)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth marine-animal hide like a dolphin's: fine stretch wrinkles, faint pale scars, soft blotchy countershading. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`wood.petrified`** (for: xanadu agate bark kind)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Polished petrified wood: agate bands of red, orange, cream and grey following old growth rings, a few glassy crystal flecks. Full colour: keep the colours exactly as described; this texture is not tinted.
```

## 3. Fauna (hyperjungle: Girder, Iziz)

**`hide.fuzz.pterosaur`**
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short dense pycnofibre fuzz of a pterosaur body: soft hair-like filaments lying one way, pale sand (#c8b48a) with darker tips (#8a5a3a), a few lighter strands. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`skin.sky-ray`**
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Underside skin of a broad-winged sky ray: smooth pale grey (#62666a) with faint darker vein-like marbling, a slightly leathery texture, fine ridges along the leading edge. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

**`wing.butterfly`**
```
Cut-out on a solid flat bright magenta (#ff00ff) background (no magenta anywhere in the subject), square, 2048x2048, viewed straight from above, flat even shadowless lighting, no cast shadow, no stem or branch beyond the cluster, the subject filling the middle 70% of the frame, every piece fully visible and well separated. Subject: One butterfly wing of a hyperjungle butterfly, a single wing, the body root at the middle of the left edge and the wing opening to the right,: a dark rim, veins in a lighter tone, two or three eye-spots, a soft dusting of scales, drawn in neutral grey (no hue) so it can be tinted per instance.
```

## Delivered and removed (2026-10-06)

Delivered under the same id (44): `stone.cut`, `plaster`, `brick`, `metal.corrugated`, `roof.tile`, `metal.iron`, `metal.bronze`, `metal.gold`, `patterns/iziz/gilt`, `patterns/iziz/banner`, `wood.mahogany`, `wood.lamppost`, `metal.iron.pitted`, `bone.skull`, `bone.horn`, `bone.antler`, `hide.pelt.cat`, `fibre.net`, `cloth.silk`, `wax.tallow`, `organic.gourd`, `earth.floor.packed`, `bark.mahogany`, `bark.ironbark`, `bark.baobab`, `card.mahogany`, `card.vine`, `card.screwpine`, `card.bromeliad`, `card.moss`, `card.crop`, `card.flower.bloom`, `fruit.skin.orange`, `fruit.skin.amber`, `fruit.husk`, `fruit.capsule`, `membrane.pterosaur`, `membrane.bat`, `fur.bat`, `wing.dragonfly`, `chitin.spider`, `chitin.millipede`, `fur.sloth`, `hide.strider`.

Delivered under another id: `hide.rawhide` as `patterns/common/rawhide`, `fibre.basket.coiled` as `patterns/common/basket-coil`, `fibre.mat.floor` as `library/fibre.reedmat`, `lantern.horn` as `patterns/common/lantern-horn`, `lantern.paper` as `patterns/common/lantern-paper`, `bone-inlay` as `patterns/beast-riders/bone-inlay`, `claw-tapestry` as `patterns/beast-riders/claw-tapestry`, `emblem` as `patterns/beast-riders/emblem`, `totem` as `patterns/beast-riders/totem`, `pennant` as `patterns/beast-riders/pennant`, `plaque` as `patterns/beast-riders/plaque`, `rider.saddle` as `patterns/beast-riders/saddle`, `feather.archae` as `library/card.feather.archae`, `feather.quetzal-crest` as `library/card.feather.crest`, `skin.scale.archae` as `library/organic.scale.terracotta`, `chitin.dragonfly` as `library/organic.chitin.iridescent`.

Delivered on a branch not yet merged: `wood.lash` (library/wood.lash on branch claude/hexahedron-materials (not merged yet)).
