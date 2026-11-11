// ================================================================= SAVANNARIM — the kit's surface (BIOME-API.md)
// The species (50), the builders (55: SAVRIM.<key>.make/grow, SAVRIM.builders), the grass passes (60: SAVRIM.grass, SAVRIM.blindGrass)
// and, from J5 and J6, the rims' own (52, 53). No build of its own: a host's 87 places the land (the stations' 44l say which land), as
// the hyperjungle's stations do. SAVRIM.speciesOfItem names a species from an item (the inspector, core/tags).
SAVRIM.speciesOfItem=item=>{const d=BIO.defs[item];return d&&d.kind?SAVRIM.byKey[d.kind]||null:null;};
BIO.kitEnd(SAVRIM);   // its exports run in its registry; the default kit is current again
