// ================================================================= HOST — the biome core's helpers for the host fragments (BIO.fn)
// One line, in its own fragment, so a station that reads the hyperjungle kit in place (stations/bells) drops it: that kit declares the same
// names as globals from the same BIO.fn (biomes/hyperjungle/src/41-hyperjungle-globals.js), and a name cannot be declared twice.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
