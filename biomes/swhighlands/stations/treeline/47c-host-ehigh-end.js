// ================================================================= HOST — the eastern highlands kit, read in place: its registry closed
// 47a and 47b are biomes/ehighlands/src/50 (species, items, buckets, its library slots) and 55 (zones, builders, the one-plant API
// EHIGH.make / grow); on its own page its 70 ends the kit. Here only those two load (for the glass tower: PLAN.md section 3), so
// this closes its registry: grow then runs in its own (BIO.kitWrap), and the SW highlands' kit (50) opens its own.
BIO.kitEnd(EHIGH);
