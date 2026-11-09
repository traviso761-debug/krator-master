# kits/locus: the Locus kit

The abyssal-desert town's buildings on the Yuni engine: the Geomancers' chapterhouse, dwellings and tents, the salt-rice farm, the petroleum works (Locus's pumpjacks), power and fuel, the warehouse and the fishing dock, crops and marsh-edge plants (`src/64-locus-*.js`; `64-locus-core.js` holds the shared helpers). Moved unchanged from `settlements/locus/src` on 2026-11-03 (MODULARITY-PLAN.md step 4), with its
notes (`NOTES.md`: the fragments, their seed blocks, the rounds of work) and `KNOWN_ISSUES.md`.

`locuskit.py` names the files (`FILES`) and their paths; `PORT.md` has their port tags (moved with them from Locus's).

**What it draws through.** The Yuni engine and the Yuni base assets, which still live in `settlements/locus/src` (`05-palette`,
`10-core`, `45-kit`, `47-texture`, `50-structure`, `53-assets`, `56`-`59c`; MODULARITY-PLAN.md step 4: their extraction is the
next item, as step 2 did for the Scyvoi engine).

**Who takes it.** `settlements/locus` (its `locus-kit.html` is the kit's sheet; `locus.html` the town), `settlements/mungo` (a fork
of the Locus engine that reads it by name) and `settlements/verge` (its `YKIT` bundle).

**Its own sheet.** Not yet: the sheet is Locus's `locus-kit.html`, on the Yuni engine's page shell in `settlements/locus`.
