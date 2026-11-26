// ================================================================= KGUILIN — nwbay's species read in place: its registry opens
// biomes/nwbay's species (50), trees (55) and variants (56) follow this fragment (build.py KITS: 48n1..48n3), read in place (the
// owner, 2026-10-26), so k-guilin's borrowed species move when nwbay's do. nwbay's own page never opens a registry; here it gets
// its own (core/biome 20-core-kit.js: BIO.kit), so its item and bucket names (trunk2, fungus, bark5...) do not meet this kit's,
// and its exports run in it (48n9: BIO.kitEnd(NWBAY)). Its canopy ceiling and the bay's hue are nwbay's defaults (110 m, .47).
BIO.kit('nwbay');
