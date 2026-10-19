# Core adoption checklist (settlements)

*Audit of 2026-10-19, from each settlement's `build.py` (modules listed) plus signals in its `src/`. Nothing was rebuilt or run.
"Appropriate" is a judgment of what fits each world. Tick a box when the build takes the module and `python3 tools/test_all.py` passes;
rewrite the hash baseline only for pages changed on purpose. Rules: `CLAUDE.md` "Working rules", `core/README.md`, `ROADMAP.md` section 10.*

Legend: `[x]` taken, `[ ]` appropriate and missing, `n/a` not appropriate (reason given).

## Tier 1: most integrated

### iziz
- [x] atmos, biome, clock, export, furnish, lod, mask, materials, minimap, rand, space, tags, walk
- [ ] core/city (streets are bespoke; `core/city/README.md` "Porting a settlement")
- [ ] terrain field (`30-core-field.js`; a "city on sampled ground" family, ROADMAP 11 item 3)
- [ ] core/simulation
- [ ] core/water

### voth
- [x] city, sim, walk, tags, space, clock, minimap, atmos, biome
- n/a lod, core/materials (own `PAL`/`FAMMAT` system, recorded as incompatible)
- [ ] core/furnish (interiors work is on `claude/voth-interiors`)
- [ ] getImageData in src (2 files): check it is not placement; Math.sin hash (2 files)

### locus
- [x] atmos, biome, clock, furnish, lod, mask, materials, minimap, rand, space, tags, walk, water
- [ ] core/city
- [ ] terrain field
- [ ] core/simulation

### verge
- [x] city, sim (own `SIM`), walk, furnish, mask, sched, clock, space, tags, rand, materials
- [ ] move own `SIM` onto core/simulation (ROADMAP 11 item 5)
- [ ] lod
- [ ] minimap
- [ ] atmos

### isle-demo (early in its plan; the economy test case)
- [x] city, export, terrain, space, tags, rand, materials
- [ ] atmos
- [ ] lod
- [ ] minimap
- [ ] clock
- [ ] water
- [ ] walk
- [ ] core/simulation (P7)
- [ ] getImageData in src (1 file): check

## Tier 2: partial

### ys
- [x] atmos, biome, city, clock, materials, minimap, rand, space, tags, water
- [ ] lod
- [ ] furnish
- [ ] walk (1 src hit only)
- [ ] getImageData (3 files), Math.sin hash (2 files), own PRNG (2 files)

### xanadu
- [x] atmos, clock, lod, mask, materials, minimap, rand, space, tags, water
- [ ] city
- [ ] walk
- [ ] furnish
- [ ] getImageData (3 files), Math.sin hash (2 files), own PRNG (2 files)

### reedlake
- [x] atmos, clock, lod, materials, minimap, rand, space, tags, water
- [ ] walk
- [ ] furnish
- [ ] city
- [ ] getImageData (1), Math.sin hash (1), own PRNG (1)

### noahs-regret
- [x] atmos, clock, furnish, materials, minimap, rand, space, tags, water
- [ ] lod
- [ ] walk (1 src hit only)
- [ ] Math.sin hash (2 files), own PRNG (1)

### highlands
- [x] biome, furnish, lod, mask, materials, rand, space, tags, walk
- [ ] clock
- [ ] minimap
- [ ] atmos
- [ ] water
- [ ] city
- [ ] getImageData (1), Math.sin hash (1), own PRNG (1)

### girder
- [x] atmos, furnish, lod, materials, minimap, ports, rand, space, tags, walk
- [ ] clock
- [ ] city
- [ ] water
- [ ] getImageData (2), own PRNG (1)

### mungo
- [x] atmos, biome, furnish, lod, materials, minimap, simulation, space, tags, walk, water
- [ ] rand
- [ ] clock
- [ ] city
- [ ] getImageData (1)

### dalab (drift from core is deliberate; see its `KNOWN_ISSUES.md`)
- [x] biome, clock, lod, mask, materials, minimap, rand, space, tags
- [ ] atmos
- [ ] furnish
- [ ] walk
- [ ] water
- [ ] city
- [ ] getImageData (5 files), Math.sin hash (2), own PRNG (2)

### yuni
- [x] biome, clock, export, lod, materials, minimap, rand, space, tags
- [ ] furnish (exports fixtures without `core/furnish`)
- [ ] walk
- [ ] atmos
- [ ] water
- [ ] city
- [ ] getImageData (1), Math.sin hash (1), own PRNG (1)

### shade
- [x] biome, carve (terrain), clock, materials, rand, sched, simulation, tags
- [ ] atmos
- [ ] lod
- [ ] minimap
- [ ] space
- [ ] walk
- [ ] getImageData (2), Math.sin hash (1), own PRNG (1)

### jimjam
- [x] clock, lod, materials, minimap, rand, sockets, space, tags
- [ ] atmos
- [ ] walk
- [ ] furnish
- [ ] water
- [ ] city
- [ ] Math.sin hash (1), own PRNG (1)

### screamers
- [x] clock, lod, materials, minimap, rand, space, tags
- [ ] atmos
- [ ] water
- [ ] walk
- [ ] furnish
- [ ] city
- [ ] getImageData (5 files), Math.sin hash (3), own PRNG (2)

## Tier 3: most lacking

### mavs-refuge
- [x] furnish, lod, materials, minimap, ports, rand, space, tags
- [ ] walk (furnished interiors with no `core/walk`)
- [ ] clock
- [ ] atmos
- [ ] getImageData (4 files)

### dhelv
- [x] atmos, biome, space, tags, rand, terrain, walk, clock
- [ ] materials
- [ ] lod
- [ ] minimap
- [ ] Math.sin hash (1)

### hook (at P2 of its plan; some gaps expected)
- [x] atmos, lod, materials, water
- [ ] rand
- [ ] tags
- [ ] space
- [ ] clock
- [ ] minimap
- [ ] export
- [ ] terrain field (`claude/silly-hawking-929a87` is moving it onto the scale model via KLAND)

### port (a kit, not a settlement)
- [x] atmos, lod, materials, water
- [ ] rand
- [ ] tags
- [ ] space
- [ ] Math.sin hash (1), own PRNG (1)

## Across all builds

- [ ] **core/charactermodels**: no settlement draws its citizens from it.
- [ ] **core/hamlet**: no taker yet (for small settlements).
- [ ] **terrain field** (`30-core-field.js`): no settlement takes it; only `biomes/sedesert` does.
- [ ] **core/city**: only voth, verge, ys and isle-demo. CLAUDE.md: every settlement should eventually be ported.
- [ ] **core/export**: only iziz, yuni and isle-demo; the rest are preview-only until they meet an export profile.
- [ ] **Placement reads canvas pixels** (`getImageData`): triage each hit as texture painter (allowed) or placement (move to `core/mask`).
  Hits: dalab 5, screamers 5, mavs-refuge 4, xanadu 3, ys 3, girder 2, shade 2, voth 2, and 1 each in highlands, isle-demo, locus, mungo, reedlake, yuni.
- [ ] **`Math.sin` hash / own PRNG** in placement: move to `core/rand`. Hits in about a dozen builds (counts above).

## Not built yet (no `build.py`)

almua, ardent, dilihan, drum, longsong, pinnacle-rock, shim, torus, zeydanin. Plans only: start each on the modules above.

## Caveats

- Girder, locus, mavs-refuge and yuni have a `build.py` but no `dist/` in the audited checkout; they were audited from source.
- Module detection is by text match on `build.py` and `src/`; confirm with the build's `PORT.md` before acting on a single box.

---

# Biomes (audit of 2026-10-19)

*Same method: lists in each `biomes/<name>/build.py` plus `src/` text matches. Nothing was rebuilt or run. The 18 biomes with a `build.py`
share one base: core/biome, core/space, core/tags (with core/rand), core/export and core/clock, so those are not repeated per biome.
The per-biome boxes are the optional modules. Whether a biome "needs" water or atmos is my judgment from its name and notes; confirm
against its `README.md`. "Water" here means `core/water` (the CDLOD mesh), not `BIO.waterH`, which every biome has.*

## Taken by every biome with a build.py

- [x] core/biome, core/space, core/tags, core/rand, core/clock (ringisles lacks clock, throne lacks export; see below)
- [x] core/export in all but throne

## Per-biome

### sedesert (the reference: takes everything optional)
- [x] terrain field + carve, water, atmos, export

### geyser
- [x] atmos, water, materials
- [ ] terrain carve (terraces want another pass; carve could shape them)

### ringisles
- [x] atmos, water, materials
- [ ] clock (the only biome without it)

### shighlands
- [x] atmos, materials
- [ ] water (check for lakes/rivers in its README)

### oidong
- [x] atmos, materials
- [ ] water

### throne (eleven stations; owner-textured)
- [x] materials
- [ ] core/export (the only biome that does not call the exporter)
- [ ] atmos
- [ ] water (vents, lava, ice tarn)
- [ ] getImageData/Math.sin hash: 1 src hit for the sin hash; check

### crater-drylands, ebadlands, ehighlands
- [x] materials
- [ ] atmos
- [ ] terrain field/carve (cliffs and craters)
- [ ] ehighlands, crater-drylands: Math.sin hash in 1 src file each

### swbay, nwbay (bays)
- [ ] water
- [ ] atmos
- [ ] materials
- [ ] getImageData in 1 src file each (placement or texture? check)

### swlowlands, nwlowlands
- [ ] water (lowlands rivers)
- [ ] atmos
- [ ] materials
- [ ] getImageData in 2 src files each

### hyperjungle
- [ ] water
- [ ] atmos
- [ ] materials
- [ ] getImageData in 2 src files

### nhighlands
- [ ] atmos
- [ ] materials
- [ ] terrain carve
- [ ] getImageData in 3 src files (most of any biome)
- [ ] new flora is gated off for Roketstad until the open world

### eastabyss, rift, xanadu (biome)
- [ ] atmos
- [ ] materials
- [ ] terrain field/carve (rift: a rift wants it most)
- [ ] getImageData: eastabyss 1, rift 1

## Across all biomes

- [ ] **Terrain field**: only sedesert takes `30-core-field.js` (also ROADMAP 11 item 3: one export per terrain family). Every other biome keeps its own `terrainH`.
- [ ] **core/water**: only geyser, ringisles and sedesert. Others call `BIO.waterH` on their own ground.
- [ ] **core/atmos**: geyser, oidong, ringisles, sedesert, shighlands only.
- [ ] **core/materials library**: about half (crater-drylands, ebadlands, ehighlands, geyser, oidong, ringisles, shighlands, throne).
- [ ] **`getImageData`** hits (triage placement vs texture painter; placement goes to `core/mask`): nhighlands 3, hyperjungle 2, nwlowlands 2, swlowlands 2, and 1 each in eastabyss, nwbay, oidong, rift, swbay.
- [ ] **Math.sin hash** (move to `core/rand`): crater-drylands, ehighlands, throne.
- [ ] **korona** has no `build.py` (built by stations, `biomes/korona/NOTES.md`): audit separately.
