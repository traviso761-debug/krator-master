# Krator biome kit — notes (Sep 2026)

## What this is
One self-contained flora system per biome, written against a small engine-independent
core, so a megastructure built from the Ancients kit (or any other world) can be dropped
into a real biome without re-implementing the plants. First biome: the central
hyperjungle (Krator's NW lowland megaflora belt), at Girder / Mav's Refuge quality.

Ideal-type artifact: "Krator biome — the central hyperjungle". 3.4 km of forest on a
rolling floor with a brook, 57 hero hypertrees in four species, ~1000 far impostors, ~1000
saplings, a Girder-quality understorey, and one ruined Girder tower standing in it so the
growth-on-structures pass (soffit moss, curtains, roots, brackets, ledge plants) is
exercised in the same file. 2.5M scene triangles, 30 draw calls, all probe invariants pass.

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
Fauna (flyers, insects, herds) as a second fragment against this contract; then the
abyssal savannah, Yuni Valley, highlands and arctic biomes, each as `5x-biome-<name>.js`
on the same core; then drop the Hexahedron into the hyperjungle through `dress()`.
