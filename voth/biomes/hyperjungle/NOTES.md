# Krator biome kit — notes (Sep 2026)

## What this is
One self-contained flora system per biome, written against a small engine-independent
core, so a megastructure built from the Ancients kit (or any other world) can be dropped
into a real biome without re-implementing the plants. First biome: the central
hyperjungle (Krator's NW lowland megaflora belt), at Girder / Mav's Refuge quality.

Ideal-type artifact: "Krator biome — the central hyperjungle". 3.4 km of forest on a
rolling floor with a brook, ~100 hero hypertrees in six species inside a 2 km hero disc,
~840 far impostors, ~1800 saplings, a Girder-quality understorey, the belt's fauna, and
one ruined Girder tower standing in it so the growth-on-structures pass (soffit moss,
curtains, roots, brackets, ledge plants) is exercised in the same file. ~3.9M scene
triangles, ~42 draw calls, all probe invariants pass (budget raised to 11M, see below).

## The second pass (Sep 2026): more species, fauna
- Two more hypertrees. The KRATOR MAHOGANY (245-305 m, the tallest thing in the belt):
  a straight, deep-red, plank-buttressed bole with nothing below 60 %, a high umbrella
  crown of dark pinnate leaves with a bronze flush, woody seed capsules in twos and
  threes. The CRIMSON KAPOK (185-230 m, the widest spread): grey-green thorn-studded
  bark on the biggest buttresses of the six, level pagoda whorls, sparse digitate leaves,
  scarlet cup flowers on the bare twig ends and the odd burst silk pod. Both barks are
  painted near-grey and tinted from SPECIES.bark (the eastern abyss lesson); the older
  four are still pre-coloured. Each species has its own sapling habit and impostor crown.
- The stand split is now measured: the stand field is sampled over the disc at build
  time and cut at the quantiles for `SHARE` (22/17/22/11/17/11 %). `standSp` no longer
  carries hand-measured thresholds, which closes that known issue.
- Understorey: giant tree ferns (4-11 m, dead-frond skirts), stilt-rooted screwpines in
  the damp, heliconia / ginger clumps with hanging bract inflorescences (a new alpha
  texture, 'bract' item), and EPIPHYTE GARDENS -- bromeliad rosettes with coloured
  hearts, moss and hanging strands on the bough perches the tree pass now exports, and
  bromeliads up the bole flanks to 60 m. Near ring out to 650 m, mid ring to 1800 m.
- Fauna, as a fragment on the same contract (58) with one core extension (35-core-anim):
  sky rays (flocks of 6-12 m soarers wheeling above the canopy), canopy darts (groups
  flitting through the openings under it), butterflies (hyperjungle-sized, painted
  wings), spore motes (additive billboards drifting in the damp and along the brook),
  strider herds (long-legged grazers walked on the CPU between waypoints, legs swung in
  the shader) and bough sloths hanging under the big limbs. ~110k triangles in all; the
  flyers cost nothing per frame (paths live in the vertex shader off the wind clock).
- Host: heroR 1500 -> 2000 (the 'The hyperjungle' preset used to stand in the impostor
  ring), five new presets (A mahogany, A kapok, Mahogany buttresses, A herd, Sky rays)
  found from the built forest, budget 5M -> 11M scene / 6.5M per pass, 140 draw calls.

## Why the old skeleton was replaced
`krator-asset-engine.js` / `krator-master-plants.js` is a catalogue sheet: every primitive
a separate `THREE.Mesh` (no instancing), sphere-blob foliage on Standard materials,
hypertrees re-described at 30–45 m "browsable" scale, no placement, wind, LOD or fauna.
It cannot render a forest. Girder's actual jungle is welded to Girder (RIVER, PALISADE,
GATES, TREES, BUCKET/MBK), which is why every port so far became a rewrite. The biome kit
takes Girder's *techniques* (tube boles, alpha leaf cards with per-clump normals,
Lambert two-sided foliage, iridescence, impostor far forest, jittered-grid floor) into a
contract of eight host-provided things.

## The contract (BIOME-API.md has the full text)
Host gives `BIO.init({THREE, scene, terrainH, mask, obstacles, ticks, seed, origin})`.
Biome gives `HYPERJUNGLE.build(opts)`, `HYPERJUNGLE.dress(geometries, opts)`,
`HYPERJUNGLE.canopyH(x,z)`, `HYPERJUNGLE.SPECIES` (tagged). Host calls `BIO.bake()` once.
`build.py` refuses any biome fragment that names a world kit's identifiers.

## Files (src/)
10–40 core · 45 host binding (ideal type; a world writes its own BIO.init before 50) ·
50 species data + textures + materials + kit items · 55 trees (heroes, saplings, impostors) ·
60 floor · 65 dress · 70 facade · 82 sky (Hexahedron's) · 85 test tower · 88 build order ·
90 camera/inspector · 91 probe. `verify.py` is the Ancients kit's, unchanged.

## Lessons this build cost
- The world's own PRNG must never be shared with a biome; the core has its own stream.
- Colours: sRGB in, linear out, converted once at the write. r128 does not convert
  instance/vertex colours.
- fbm is bell-shaped: never split its raw value into species bands (1/27/53/20 %).
- Pre-coloured bark canvases fight per-species tints; paint them near-grey and tint.
- Lambert for every card and bole. Standard's 4% specular goes white at grazing angles.
- Republish the artifact after every pass; diff live HTML against dist/ before debugging
  a render.

## Next
Predators and canopy climbers (the herds have nothing to run from); flyers that land;
then the abyssal savannah, Yuni Valley, highlands and arctic biomes, each as
`5x-biome-<name>.js` on the same core; then drop the Hexahedron into the hyperjungle
through `dress()`.
