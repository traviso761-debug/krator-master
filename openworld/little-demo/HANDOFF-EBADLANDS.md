# Handoff: the eastern badlands biome kit (`biomes/ebadlands`), built to slot into the open world

Paste the prompt below into a new session. It assumes nothing from this one.

---

**Prompt:**

Build a new biome kit, `biomes/ebadlands`, for the eastern badlands of Krator, so it slots into the open world at
`openworld/little-demo` (the scale model's eastern desert at 1:1) with no changes there beyond one registry entry.

Read first, in this order: `CLAUDE.md`, `README.md` (the tagging rules), `biomes/README.md` and `biomes/WORLD.md` (one
core for every kit, the open-world contract), `core/README.md` (how a kit lists the shared core), `openworld/little-demo/README.md`
(how the world places a kit's flora), and the `painting-to-3d-world` skill's `SKILL.md`. Use **`biomes/sedesert`** as the
template: it is the nearest kit (arid, bedded rock, strata) and the cleanest example of the contract. Read its
`BIOME-API.md`, then its fragments through `INDEX.md` (never a fragment over 30 KB whole).

**The region.** The 'e badlands' overlay of the Krator Scale Model (https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q,
version 4.19): about 345,000 km² east of the abyss, from the abyss's gentle east rim up to the airless outer rim. Height
300 m to 9.8 km (median 4.5 km); rain 0 to 1,240 mm a year (median 330); mean temperature -32 to +25 °C (median +2).
Its Köppen classes: Cfa 22 %, ET 16 %, Dfc 14 %, EF 9 %, Dfb 8 %, O (airless) 7 %, BSk 7 %, BSh 7 %, HF 4 %. So the kit
is a cold gradient as much as a dry one: warm humid badland slopes and gullies low down, steppe and boreal scrub higher,
tundra, then ice; nothing grows on airless ground. The terrain style there is already 'badland' (banded strata, rills,
30 m terraces: `openworld/little-demo/src/41-world-fields.js`, `STYLES`). Settlements in it: Yuni (its valley opens
north-west to the abyss) and the ruin of Veladiga (a canyon 6 km south of its marker).

**The contract (what the world reads; match sedesert's shape exactly):**

1. Fragments `50-biome-ebadlands-species.js` ... `70-biome-ebadlands.js` on the shared core (`CORE_BIOME` in your
   `build.py`, as sedesert lists it; `35-core-strata.js` from sedesert if you want bedded rock). The first calls
   `BIO.kit('ebadlands')` and defines `var EBADLANDS={}`; the last calls `BIO.kitEnd(EBADLANDS)`. No host names (the
   build's FORBID list), no `Math.random`, nothing that reads `window`/`document` at build time except texture painters.
2. `EBADLANDS.SPECIES`: each with `key`, `name`, `H`, `rb`, `crownR` ranges (metres), `far` (an impostor recipe, or
   none), and `tags:{climate, aridity, abyssal:false, riparian, koppen:[...]}` (README.md's tagging; add the Köppen
   classes each species grows in, from the list above).
3. `EBADLANDS.zones(x,z)`: zone weights from the fields the world binds, read with `BIO.field(name,x,z)`. The world gives
   every kit: `wet` 0..1 (rain, channels, water), `flow` (a channel's banks), `upland` 0..1 (height and relief), `canyon`
   and `rim` (a carved channel deeper than 18 m and the band outside its lip), `rock` (slope and bare-rock style), `dune`,
   `salt`, `cold` 0..1 (from the mean temperature: 1 at -10 °C), `slope` 0..1, `oasis`/`abyss`/`mist` (0 here). A field
   the kit should read its own way goes in the world's registry (below), not in the kit.
4. `EBADLANDS.PASSES` as data, in the order your `buildTrees` runs them:
   `[{sp, cell, accept:(Z,x,z)=>0..1, opt:{pad, patch, patchScale, lodK, small, size(T,Z)?, water?}}]`
   (eastabyss's `PASSES` and sedesert's are both examples). `buildTrees` iterates this table.
5. `EBADLANDS.make(sp,x,y,z)` (the pass's record: H, rb, crownR, seed from the kit's stream) and `EBADLANDS.grow(T,lv)`:
   build that one tree at level 2 (hero), 1 (mid) or 0 (the far impostor; `null` when the species has none), into the
   kit's buckets and items and nothing else (no keep-clear, no TREES record). Copy sedesert's two functions at the end
   of `55-biome-sedesert-trees.js`.
6. `EBADLANDS.buildFloor(R,q)`: the small plants, rocks and litter through `BIO.grid` (the world clips it to 32 m patches
   and grows each zone's patch under a fixed field profile), reseeding itself at the top as sedesert's does.
7. A showcase host (`45-host-stage.js` ... `91-host-probe.js`) like sedesert's, with `verify.py --assert` passing, so the
   kit is reviewable on its own; tag the fragments in `PORT.md` (`python3 tools/audit_port.py biomes/ebadlands`).

**Slotting it into the open world** (do this last, then rebuild and verify there):

- `openworld/little-demo/build.py`: add `'ebadlands': [its fragments in order]` to `KITS`.
- `openworld/little-demo/src/47-world-kits.js`: one entry, as sedesert's:
  `{name:'ebadlands', global:'EBADLANDS', overlay:'e badlands', lod:{hero:[...],mid:[...],far:[...]},
    floor:{profiles:{<zone>:{<fields that give that zone>},...}, pick:(x,z)=>{const Z=EBADLANDS.zones(x,z);return{<zone>:weight,...};}}}`
- `python3 build.py && python3 verify.py dist/little-demo.html --assert --views 5,6` (Yuni, Veladiga: `--list` prints the
  views); every check and every negative control must pass. Then republish the artifact (README.md there).

Do not change `41-world-fields.js`, the terrain or the other kits. If the kit needs a field the world does not give, ask:
it belongs in `WORLD.at` for every kit, not in this one. If a surface has no good texture, say so and ask the owner
(`CLAUDE.md`, "Textures").

---

*The same steps add any kit to the world: `openworld/little-demo/README.md`, "Adding a kit".*
