// ================================================================= HOST — the eastern abyss kit, read in place: its registry closed
// 47a and 47b are biomes/eastabyss/src/50 (species, items, buckets, its library pack's slots) and 55 (zones, builders, the one-tree
// API: EASTABYSS.make / grow). On its own page its fauna fragment (75) ends the kit; here only those two load, so this closes it:
// make and grow then run in its own registry (BIO.kitWrap), and the abyssal savannah's kit (50) opens its own.
BIO.kitEnd(EASTABYSS);
