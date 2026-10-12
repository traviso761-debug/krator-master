# kits/characters: known issues

- **The Godot twin is behind.** `godot/krator/character/` reads the Meshy kit format. It needs the MakeHuman kit
  (items, hide bitsets), the `KMR1` morphs (blend on the CPU or as blend shapes), the joint and inverse-bind deltas,
  the tint, and `KCHAR.stranger`. `kchar_test.gd` and `tests/make-golden.js` still check the Meshy body.
- **Morphs blend linearly.** MakeHuman's macros are piecewise (its age, weight and height targets switch between
  combinations), and its race targets interact with them; a sum of deltas measured one at a time is close, not exact.
  Height's full ends overshoot (2.4 m and 1.3 m), so its slider reaches half way (`REACH` in make_mpfb.py).
- **Bone rotations do not follow the morph.** Joints move; their rest rotations stay the base's. The rest pose is
  exact; in motion a heavily reshaped limb bends about the base's axes.
- **Clips are Styv's and Meshy's**, retargeted: big build changes can push a hand into a hip in motion.
- **Skin shows through where an item's cover is approximate.** Items with no MakeHuman delete group (polo, fisherman
  sweater, cargo trousers, tiered skirt, flats) hide skin by a ray test; a skirt's cover is deliberately small, so
  the thighs under it show from below.
- **Download size.** About 50 MB of pieces as served (both bodies, every item and its deltas, gzipped; the page
  unzips them with the browser's DecompressionStream), fetched per item as needed. Dense shoes (flats, pirate boots)
  are still the heaviest geometry; decimating them in Blender before the morph capture is the next saving.
- **The peoples are mostly proposals.** Only the Chichani and the Beast Riders come from the owner; the others
  follow LORE.md's real-world references.
- **Ancestry is MakeHuman's three reference sets** (African, Asian, Caucasian). It moves face and build only; the
  skin tone is its own setting, so a people can pair any face with any tone (the Chichani, the Dalabites' green).
