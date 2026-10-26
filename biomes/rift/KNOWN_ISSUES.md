# Krator biome kit — the Rift: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/rift.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. Held vs drawn (the runtime LOD, Oct 2026; the probe, now 99-host-take): ceilings of 27M triangles
      HELD (in memory, the hero trees' stand-ins included), 17M DRAWN at any one camera and 700 draw
      calls; 19M per pass. Before the runtime LOD the scene held 24.1M and drew all of it from every
      camera in ~64 calls. Now it holds 25.7M (+1.6M: the stand-ins, the small species' far blobs,
      the spine's far floor band; trees 17.1M, impostors 2.6M as their own pass `rift/far`, floor
      5.6M, dress 0.3M) and draws, at the presets, 14.8M / 577 calls (the frill trees), 13.9M / 473
      (the cloud forest), 11.6M / 432 (down to the savannah), 3.5M / 340 (from afar); over all fifteen
      presets 3.5–16.0M in 217–577 calls (the peak, looking down both faces of the ridge, is the
      heaviest). The build takes ~10 s longer (the bake splits 58 meshes into 1737).
      verify.py reports the drawn ceiling and the calls at its camera (soft, like every budget).
      The first build measured 27.5M: a 340-tri helix put three to six times per curl plant, 9 m
      brain domes, and a 28-tri capped beam item under every tiered tree. `RIFT.build({quality:.6})`
      and `BIO.LOD.scale` are the knobs. The heaviest items now: the far bucket, stems (rods), the
      frill fins, pinecone succulents (96 tris each), pods, rosettes (72 tris).
- [ ] The runtime LOD gains little near the spine: a chunk is 1.2 km on a side, so from a camera in
      the jungle the six chunks round it are all within range and every hero in them is drawn (a
      shorter range for the small species was tried: no fewer triangles at the jungle views, +60
      calls). It costs draw calls (one mesh per item per chunk and range): on weak hardware lower
      `BIO.LOD.scale` or raise `BIO.LOD.chunk`. Chunks switch whole: at 1.2 km and more a chunk of
      heroes becomes stand-ins at once, a pop the thin haze (FogExp2 .0002) does not hide.
- [ ] The highlands (cloud forest, ridgetop) are planted from this kit's fields and could still
      become their own kit; the ridgetop has four species of its own and a garrigue floor.
- [ ] The zone weights (RIFT.zones) are thresholds on the five fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] The far shore of the lake (the jungle south of it) and the Rift's walls are
      painted on the sky; a world that already draws its horizon as geometry does not
      need the overlay dome (a second 4096x2048 canvas, ~16 MB of texture).
- [ ] The streams have no cataracts and do not climb the ridge: they rise at its south
      foot. The savannah's dry wash is a shallow gravel bed with no bank flora of its own.
- [ ] The water's ripples are shader-only, so the scum mats (at the local water level +.04)
      never bob. Fine at any distance; wrong if a world animates its water mesh.
      2026-10-20: the water is core/water's now (lake: WATER.open, a swell of centimetres; streams: WATER.flow), so it does move, and the mats and
      pads still sit at `BIO.waterH` + .04: they do not ride `WATER.heightAt` (an amplitude of a few cm, under the mats' own height). Still open.
- [ ] The scale-moss (`clubmoss`, an iridescent tuft) still uses world-up as its iridescence
      normal; the curls and rosettes now carry one (`aN`), so their `softC2` (the second colour
      pulled back toward the base for want of a normal) could be relaxed.
- [ ] The stand-ins' blobs are 20-triangle icosahedra: faceted when a hero chunk switches at
      1.2-2 km; the trees built far are 80-triangle blobs. From afar the jungle's stand-ins read
      bluer and more magenta than the heroes they replace (cyan columns, magenta caps: the far
      impostors' look, which the view already had in its foreground); the lobe trees' and bell
      palms' yellow-green is lost in the blobs.
- [x] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's tower still passes one list. 2026-10-20: the host tower hands three shells ({geos, share}: floor plates 1, iron .6, core walls and rubble .4), so the plates no longer take the moss; one test tower is all the host builds (Girder itself is not changed).
- [ ] No fauna yet.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), done 2026-10-06: every species carries a harvest tag
      (`RIFT.HARVEST`; the ball vine in `RIFT.PLANTS`), the four fruit name their catalog keys (`RIFT.FRUIT_KEYS`), the inspector
      shows the tag, and the probe checks it ("fruit tagged, catalogued and drawn", with two negatives). Split ballmelons: a few
      near-band vines (14%, from the spot's hash) end in a melon split in two, rind cup and yellow flesh face
      (`melonhalf` / `melonflesh`, 48 tris a melon; about 180 on the stage). 2026-10-20: the stone pine's nuts
      (`generic_fruit_parasol_pine`), the acacia pods (`generic_fruit_acacia_pod`), the monkey-puzzle seeds (`generic_fruit_puzzle_seed`) and the baobab's
      pale pods (`generic_fruit_pale_baobab`) are catalogued and tagged; none is drawn on the stage. `FRUIT_NOT_DRAWN` is down to the cycad's
      starch and the cloud fern's fiddleheads.

## Done

- [x] Runtime LOD (Oct 2026, xanadu's port): every hero tree drawn within `RIFT.LOD.tree` (1.2 km)
      of its chunk and as a stand-in impostor past it; the far trees per chunk against the view;
      the floor's bands, logs and dress by range, with a far band standing in for the spine's
      near and mid bands; `BIO.lodTick` (a view subscriber in 99-host-take since core/host); the probe's budget as held / drawn / calls.
- [x] The small species become far impostors (`buildFarSmall`, a 20-triangle blob shaped by habit)
      instead of stopping at ~1.3 km from the spine, and stand in for their heroes; the curls,
      pinecones and silver scrub (under a pixel there) do not. The frill and carrot frill
      impostors carry a few fin triangles.
- [x] The impostors keep the iridescence (`RIFT.farMat`: a second colour packed in each vertex's
      uv, the leaves' rule or the iridescent bark's): the frill column goes teal to violet at any
      range. The curls and rosettes carry a real per-instance normal (`aN`, `RIFT.leanN`) for
      their iridescence; the fins and fans already did.

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the zones' shore height, the
      keep-out above the water, the scum mats, the shallows' reeds and the water band of the floor. With
      this host's level of 0 the geometry is the same bit for bit (mesh fingerprints).

- [x] The Rift's two walls painted twice (dome + overlay in front of the giant), with the
      far lakes east and west and the far jungle / savannah lines by azimuth.
- [x] The ridge's south face benched (two treads), mesas and saddles on the crest, the
      mask zero on cliffs so the faces stay bare rock.
- [x] Thirty-four species built and zoned from five fields; iridescence as the rule.
- [x] The spire cactus replaced by the Rift croton; fan fronds twice the size in a light purple.
- [x] The brain-coral tree replaced by the trumpet tree; a wide-canopy
      parasol tree; the savannah's purple (Vain fronds, heath, pinecone succulents).
- [x] Every bole lathe ends in a dome ring (inherited lesson, kept).

- [ ] **Frill-tree fins: use the owner's fractal frond** (`card.frond.fractal`) next pass, for the frill tree, carrot frill,
      cloud frill and barrel frill (`biomes/README.md`, "To do: frill-tree fins"; the Throne's frill tree is the example).
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (phase 3 of putting every biome's water on core/water): `water` is in the profile. The algal lake is `WATER.open` (a mask of the lake side of the shore, lakeIn < 24 m; a bed baked from terrainH, clamped at 1.4 m to keep the surf bands off a still lake) and the two streams' last reach are `WATER.flow` ribbons (a hand above the lake, y = .1), all in `src/89w-host-water.js`; the 300x300 plane (180k triangles) and its ShaderMaterial are gone. `BIO.waterH` and `terrainH` are unchanged (the water is still y = 0). EXPORT_BOX moved to [760, 1700, 1060, 2000], the east stream's mouth, so the box holds a surface (it was [300, 0, 600, 300], on the savannah's edge: no water). Budgets: the Algal shore camera drew 521 calls / 13.74M triangles before and 522 / 13.59M after (the ceiling 27M held / 17M drawn / 700 calls, all held). What changed in the look: the lake's pale algal shoals and scum patches (a vertex colour) are gone from the water itself, the streams are a ribbon with white banks, the sky in the water is the page's captured sky. Gaps: core/water/README.md, "Open gaps (phase 3, rift/eastabyss)". The water has no raycast (the plane was `probeSkip` already): the inspector names the ground under it.
