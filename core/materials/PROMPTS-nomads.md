# Ready-to-paste prompts: the nomad kits (2026-10-07)

Owed by `kits/desert-nomads` and `kits/ash-nomads`. Each block is a complete prompt: paste it as it is, one image per prompt,
and save the file under its `id` (slashes become folders). "Near-colourless" rows are tinted by the kit's palette, so the
image must stay grey; "Full colour" rows keep their colours.

Both ids are already wired into their kit's `materials.json` as `optional` families, so a delivery needs only a batch row
(`tools/textures/batches/nomads-2026-10.json` is the model), `python3 tools/textures/pack.py kits/<kit>` and a rebuild.

**Merge note:** this file is separate because `PROMPTS-ready.md` was pruned on `claude/texturepalooza` (not yet on main). When
that branch lands, move the open blocks into its "Open prompts", the delivered line into its "Delivered and removed", and
delete this file.

## Open prompts

**`cloth.tent.brown`** (Full colour. The desert's square tents, the khaimas, the smithy, the supply tent and the awning; drawn
as canvas dyed brown meanwhile. Reuse: any desert or steppe tent: Shade's nomads, Verge's caravans, Xanadu's herders.)
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Hand-woven Bedouin and Berber tent cloth of goat and camel hair, a coarse dense weave in long strips about 60 cm wide sewn edge to edge, running left to right; warm mid brown (#6a4a32) with a few narrow cream (#e8dcc4) and dark brown (#3e2c20) stripes along each strip, slightly felted and fuzzy, sun-faded in places, a darned patch. Full colour: keep these colours, not tinted.
```

**`patterns/ashnomad/medallion-giant`** (Full colour, a single panel, not tiled. The Ash Nomads' emblem, in place of the sun: on
the assembly's frame and every banner. Drawn as geometry meanwhile, a banded disc with a tilted ring and four moons.)
```
A single flat, front-on circular emblem centred in a square 2048x2048 frame, filling it edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no perspective, no text, no border, no watermark. Emblem: a nomad tribe's emblem in appliquéd and embroidered felt: a ringed gas giant seen from slightly above, its body banded in ochre (#c08a22), vermilion (#a8281c), saffron (#e0b02a), rust (#8e3e1e) and deep madder (#6a1a12) with a swirling storm-eye, a broad tilted ring in saffron and cream crossing in front of it and passing behind it, four small bone-white moons round it, all on black felt (#24221f), framed by a ring of stepped Dunmer key-frets in red and yellow and a thin gold rim; bold, ornate, symmetrical about the planet, hand-sewn stitching visible. Full colour: keep these colours, not tinted.
```

## Delivered and removed (2026-10-07, batch `nomads-2026-10.json`)

`cloth.tent.ash`, `ground.ash`, `patterns/nomad/sadu-band`, `patterns/nomad/lining-muted`, `patterns/ashnomad/fret-band`,
`patterns/ashnomad/nazca-panel`, `patterns/ashnomad/lining-ember`, `patterns/ashnomad/medallion-sun` (now the chieftain's
dais: the owner moved the emblem to a gas giant). Extras the owner added: `patterns/nomad/sadu-band.green` (the sheikh's tent),
`patterns/nomad/lining-muted.green` (the sheikh's guest pavilion, the hookah tent), `patterns/ashnomad/lining-crawlers`
(millipedes, lizards and mushrooms: the chieftain's lining, the shaman's floor), and two moon-face medallions,
`patterns/common/medallion-moonface` and `.b`, in the library unwired (fit for the Ring Sea Islanders, whose sign is the white
island moon, or a Scyvoi shaman).
