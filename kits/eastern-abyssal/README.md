# kits/eastern-abyssal: the Eastern Abyssal kit

The Eastern Abyssal culture's buildings on the Yuni engine: housing (poor, middle, rich), nine shops and the builders' yard, hospitality and civic, the temple of the altar, the Headman's palace and its plaza, Lower Verge's mayor's compound, the wall system and the fort, farming and storage, and the plants it needs (`src/65-abyss-*.js`; `65-abyss-00-core.js` holds the `ABYSS.*` helpers). Moved unchanged from `settlements/locus/src` on 2026-11-03 (MODULARITY-PLAN.md step 4), with its
notes (`NOTES.md`: the fragments, their seed blocks, the rounds of work) and `KNOWN_ISSUES.md`.

`abysskit.py` names the files (`FILES`) and their paths; `PORT.md` has their port tags (moved with them from Locus's).

**What it draws through.** The Yuni engine and the Yuni base assets, which still live in `settlements/locus/src` (`05-palette`,
`10-core`, `45-kit`, `47-texture`, `50-structure`, `53-assets`, `56`-`59c`; MODULARITY-PLAN.md step 4: their extraction is the
next item, as step 2 did for the Scyvoi engine).

**Who takes it.** `settlements/locus` (its `abyss-kit.html` is the kit's sheet; `locus.html` the town), `settlements/mungo` (a fork
of the Locus engine that reads it by name) and `settlements/verge` (its `YKIT` bundle).

**Its own sheet.** Not yet: the sheet is Locus's `abyss-kit.html`, on the Yuni engine's page shell in `settlements/locus`.
