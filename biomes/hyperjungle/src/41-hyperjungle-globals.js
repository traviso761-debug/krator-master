// ================================================================= HYPERJUNGLE — the core's helpers as globals
// The hyperjungle is the core's origin and was written when the core declared rng, clamp,
// TAU... at top level. The shared core (core/biome) keeps them local and hands them out as
// BIO.fn, so this kit, and its host, take them as globals here, exactly the functions they
// called before: the same PRNG stream, the same noise. A world that loads this kit beside
// others gets these names too (biomes/WORLD.md); the other kits read BIO.fn in their closures.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
