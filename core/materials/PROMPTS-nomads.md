# Ready-to-paste prompts: the nomad kits (2026-10-07)

Owed by `kits/desert-nomads` and `kits/ash-nomads`. Each block is a complete prompt: paste it as it is, one image per prompt,
and save the file under its `id` (slashes become folders). "Near-colourless" rows are tinted by the kit's palette, so the
image must stay grey; "Full colour" rows keep their colours.

The id is already wired into their kit's `materials.json` as `optional` families, so a delivery needs only a batch row
(`tools/textures/batches/nomads-2026-10.json` is the model), `python3 tools/textures/pack.py kits/<kit>` and a rebuild.

**Merge note:** this file is separate because `PROMPTS-ready.md` was pruned on `claude/texturepalooza` (not yet on main). When
that branch lands, move the open blocks into its "Open prompts", the delivered line into its "Delivered and removed", and
delete this file.

## Open prompts

**`patterns/ashnomad/medallion-giant`** (Full colour, a single panel, not tiled. The Ash Nomads' emblem, in place of the sun: on
the assembly's frame and every banner. The planet is in the colours the Krator sky gives the gas giant (`81-sky.js`: slate blue
and pale cream bands, an ivory ring), the frame in the Ash Nomads' red, yellow and black. Drawn as geometry meanwhile.)
```
A single flat, front-on circular emblem centred in a square 2048x2048 frame, filling it edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no perspective, no text, no border, no watermark. Emblem: a nomad tribe's emblem in appliquéd and embroidered felt: a ringed gas giant like Neptune crossed with Saturn, seen from slightly above, its body in soft horizontal bands alternating cool slate blue (#6f80a6, #7d8fb0, #8a98b8) and pale warm grey-cream (#c7c2b6, #d8cfbb, #dcd4c2), the bands gently wavy at their edges; a broad, slightly tilted ring of pale ivory-grey (#d9d1c7) made of many fine concentric ringlets, crossing in front of the planet's lower half and passing behind its upper half; four small bone-white moons around it; all on black felt (#24221f), framed by a ring of stepped Dunmer key-frets in vermilion (#a8281c) and saffron (#e0b02a) and a thin gold rim; bold, ornate, symmetrical about the planet, hand-sewn stitching visible. Full colour: keep these colours, not tinted.
```

## Delivered and removed (2026-10-07, batch `nomads-2026-10.json`)

`cloth.tent.ash`, `ground.ash`, `patterns/nomad/sadu-band`, `patterns/nomad/lining-muted`, `patterns/ashnomad/fret-band`,
`patterns/ashnomad/nazca-panel`, `patterns/ashnomad/lining-ember`, `cloth.tent.brown` (the same day, later), `patterns/ashnomad/medallion-sun` (now the chieftain's
dais: the owner moved the emblem to a gas giant). Extras the owner added: `patterns/nomad/sadu-band.green` (the sheikh's tent),
`patterns/nomad/lining-muted.green` (the sheikh's guest pavilion, the hookah tent), `patterns/ashnomad/lining-crawlers`
(millipedes, lizards and mushrooms: the chieftain's lining, the shaman's floor), and two moon-face medallions,
`patterns/common/medallion-moonface` and `.b`, in the library unwired (fit for the Ring Sea Islanders, whose sign is the white
island moon, or a Scyvoi shaman).
