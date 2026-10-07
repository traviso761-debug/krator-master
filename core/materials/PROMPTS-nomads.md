# Ready-to-paste prompts: the nomad kits (2026-10-07)

Owed by `kits/desert-nomads` and `kits/ash-nomads`. Each block is a complete prompt: paste it as it is, one image per prompt,
and save the file under its `id` (slashes become folders). "Near-colourless" rows are tinted by the kit's palette, so the
image must stay grey; "Full colour" rows keep their colours.

Every id is already wired into its kit's `materials.json` as an `optional` family, so a delivery needs only
`tools/textures/process.py` (or a batch), `python3 tools/textures/pack.py kits/<kit>` and a rebuild. Until then each kit draws a
stand-in, set in its `26k-kit.js` (`KIT_FALLBACK`): the brown hair cloth as tinted canvas, the sadu band and both linings as the
star kilim, the ash cloth as tinted felt, the Ash Nomads' frets and Nazca figures as geometry, and their sun disc as the amber sun.

**Merge note:** this file is separate because `PROMPTS-ready.md` was pruned on `claude/texturepalooza` (not yet on main). When
that branch lands, move these blocks into its "Open prompts" and delete this file.

Who else can use them (reuse, so nothing is generated twice): the brown hair cloth fits any desert or steppe tent (Shade's
nomads, Verge's caravans, Xanadu's herders); the sadu band any Arab-influenced weaving (eastabyss, Yuni's nomad pieces); the
ash cloth any dark felt (a Scyvoi black ger, the Zeijani); the ash ground any volcanic plain (Dhelv's surface, the Throne).

## Desert Nomads (`kits/desert-nomads`)

**`cloth.tent.brown`** (Full colour. The square tents, the khaimas, the smithy, the supply tent and the awning.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Hand-woven Bedouin and Berber tent cloth of goat and camel hair, a coarse dense weave in long strips about 60 cm wide sewn edge to edge, running left to right; warm mid brown (#6a4a32) with a few narrow cream (#e8dcc4) and dark brown (#3e2c20) stripes along each strip, slightly felted and fuzzy, sun-faded in places, a darned patch. Full colour: keep these colours, not tinted.
```

**`patterns/nomad/sadu-band`** (Full colour. The black tents' valance and their qata divider, the camel saddle cloths, the litter.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: Bedouin sadu weaving, coarse hand-spun wool on a ground loom, horizontal bands of small geometric motifs: rows of triangles, stepped diamonds, checkerboard and narrow stripes, in rust red (#8e3a24), black (#1c1a18), cream (#e8dcc4) and ochre (#b08a3a) with a little indigo (#2c3448); the weave visible, the dye slightly uneven and muted by sun; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

**`patterns/nomad/lining-muted`** (Full colour. The inside of the caidal tents, the pavilion, the hookah tent and the hair-cloth tents.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: the printed cotton lining of a Moroccan caidal tent, a repeating row of tall pointed keyhole arches with eight-pointed stars and small lozenges between them, in muted rust (#8e3a24), ochre (#b08a3a), indigo (#2c3448) and cream (#e8dcc4) on a deep madder-brown ground (#5a2a20); faded and soft, not bright; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

## Ash Nomads (`kits/ash-nomads`)

**`cloth.tent.ash`** (Near-colourless. Every tent cover, from black to ash-grey by the palette.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Heavy felted wool tent cloth, dense and matted, with a faint woven grid under the felt, long seams of coarse stitching, a little volcanic ash and soot worked into the fibres, a few small burn holes darned over. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`patterns/ashnomad/fret-band`** (Full colour. The band of figures round every tent wall; drawn as geometry until it comes.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: an appliqué felt band for a nomad tent, a cross of Nazca line figures and Morrowind Dunmer ornament: stepped key-frets alternating with small Nazca figures (a hummingbird, a spiral, a stag beetle), drawn as bold single lines in saffron yellow (#e0b02a) and vermilion red (#a8281c) on black felt (#24221f), between yellow edge stripes; hand-sewn, slightly uneven; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

**`patterns/ashnomad/nazca-panel`** (Full colour. The great panels on the chieftain's tent and the assembly.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: large Nazca geoglyph figures, a hummingbird, a monkey with a spiral tail, a spider and a stag beetle with forked mandibles, each drawn as one continuous line in saffron yellow (#e0b02a) and vermilion (#c8401e) on black felt (#24221f), framed above and below by a band of stepped Dunmer key-frets in red (#a8281c); appliqué and embroidery, bold and ornate; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

**`patterns/ashnomad/lining-ember`** (Full colour. The inside of every Ash Nomad tent.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Panel: a warm tent lining of printed felt, a dense all-over pattern of stepped diamonds, small spirals and zigzag bands in ochre (#c08a22), saffron (#e0b02a), vermilion (#c8401e) and madder (#6a1a12) on a dark red-brown ground (#3a1a12); glowing and rich but not bright, the print slightly worn. Full colour: keep these colours, not tinted.
```

**`patterns/ashnomad/medallion-sun`** (Full colour, a single panel, not tiled. The sun disc raised over the assembly.)
```
A single flat, front-on circular emblem centred in a square 2048x2048 frame, filling it edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no perspective, no text, no border, no watermark. Emblem: a nomad tribe's sun disc in painted and appliquéd felt: a black centre (#24221f) with a stylised Nazca sun-face, a ring of stepped Dunmer frets around it, then twenty-four alternating saffron (#e0b02a) and vermilion (#a8281c) rays, a thin gold rim; bold, ornate, symmetrical. Full colour: keep these colours, not tinted.
```

**`ground.ash`** (Near-colourless. The kit sheet's ground, until a world places it on a biome; `kits/ash-nomads/materials.json` `ground` uses `ground.burn` darkened meanwhile, which reads too pale and salty.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A plain of fine volcanic ash, soft and powdery with faint wind ripples, scattered small black cinders and grey pumice pebbles, a few dry grass stems half buried. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```
