# Ready-to-paste prompts: the nomad kits (2026-10-07)

Owed by `kits/desert-nomads` and `kits/ash-nomads`. Each block is a complete prompt: paste it as it is, one image per prompt,
and save the file under its `id` (slashes become folders). "Near-colourless" rows are tinted by the kit's palette, so the
image must stay grey; "Full colour" rows keep their colours.

The deliveries are processed by `tools/textures/batches/nomads-2026-10.json`.

**Merge note:** this file is separate because `PROMPTS-ready.md` was pruned on `claude/texturepalooza` (not yet on main). When
that branch lands, move the open blocks into its "Open prompts", the delivered line into its "Delivered and removed", and
delete this file.

## Open prompts

The Ash Nomads' outside turned blue-led on 2026-10-07 (blue the primary, red the trim; the yellow stays). The two sheets worn
outside need blue versions. Until they come the kit draws INTERIM recolours of the red ones (a hue shift: the reds moved to
slate blue), stored under these same ids; a delivery simply replaces them (`nomads-2026-10.json`, then repack).

**`patterns/ashnomad/fret-band.blue`** (Full colour. The band round every Ash Nomad tent wall, outside. Same layout as the red
`fret-band`: a 2:1 band that repeats left to right.)
```
Seamless tileable texture, 2048x1024, twice as wide as it is tall. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: an appliqué felt band for a nomad tent, a cross of Nazca line figures and Morrowind Dunmer ornament: a stepped key-fret zigzag in deep slate blue (#3e5c9a) with a second in saffron yellow (#e0b02a), and in the diamonds between them small Nazca figures, a hummingbird and a stag beetle in saffron and a spiral in slate blue, small saffron stepped triangles above and below; edged top and bottom by stripes of saffron and slate blue with a thin vermilion (#a8281c) line; all on black felt (#24221f); hand-sewn, visible running stitches, slightly uneven; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

**`patterns/ashnomad/nazca-panel.blue`** (Full colour. The great panel round the assembly's wall and the chieftain's tent,
outside. Same layout as the red `nazca-panel`.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Panel: large Nazca geoglyph figures in rows, hummingbirds with spread wings, a monkey with a spiral tail beside a great spiral, a spider and a stag beetle with forked mandibles, each drawn as one continuous corded line, alternating deep slate blue (#3e5c9a) and saffron yellow (#e0b02a), on black felt (#24221f); framed above and below by a band of stepped Dunmer key-frets in slate blue with small saffron squares, and a thin vermilion (#a8281c) line along each edge; appliqué and couched cord, bold and ornate; the pattern repeats horizontally. Full colour: keep these colours, not tinted.
```

## Delivered and removed (2026-10-07, batch `nomads-2026-10.json`)

`cloth.tent.ash`, `ground.ash`, `patterns/nomad/sadu-band`, `patterns/nomad/lining-muted`, `patterns/ashnomad/fret-band`,
`patterns/ashnomad/nazca-panel`, `patterns/ashnomad/lining-ember`, `cloth.tent.brown` and `patterns/ashnomad/medallion-giant` (the same day, later; the emblem in the sky's giant colours), `patterns/ashnomad/medallion-sun` (now the chieftain's
dais: the owner moved the emblem to a gas giant). Extras the owner added: `patterns/nomad/sadu-band.green` (the sheikh's tent),
`patterns/nomad/lining-muted.green` (the sheikh's guest pavilion, the hookah tent), `patterns/ashnomad/lining-crawlers`
(millipedes, lizards and mushrooms: the chieftain's lining, the shaman's floor), and two moon-face medallions,
`patterns/common/medallion-moonface` and `.b`, in the library unwired (fit for the Ring Sea Islanders, whose sign is the white
island moon, or a Scyvoi shaman).
