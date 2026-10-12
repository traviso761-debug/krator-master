# kits/characters: known issues

- **The Godot twin draws normals from the base.** Its blend shapes move positions only (Godot's relative shapes
  keep the base normals), where the page re-sums normals after each morph: a heavily reshaped body lights a little
  flatter in Godot. Its skin is split into 32-37 cover regions (one draw call each); merging the small ones is the
  next saving there. `godot/data/characters/pieces/` is about 200 MB of copies (`sync_core.py`), gitignored.
- **Morphs blend linearly.** MakeHuman's macros are piecewise (its age, weight and height targets switch between
  combinations), and its race targets interact with them; a sum of deltas measured one at a time is close, not exact.
  Height's full ends overshoot (2.4 m and 1.3 m), so its slider reaches half way (`REACH` in make_mpfb.py).
- **Bone rotations do not follow the morph.** Joints move; their rest rotations stay the base's. The rest pose is
  exact; in motion a heavily reshaped limb bends about the base's axes.
- **Clips are retargeted** from Styv, Meshy's library and Quaternius's libraries: big build changes can push a hand
  into a hip in motion, and a clip made for a slight body can clip through a heavy one.
- **No clip for hoeing, hammering at an anvil or swinging a pickaxe.** Neither library has one; the work group's
  chop loop, the overhead axe chop and the heavy blunt swing stand in. A spear thrust, a dagger stab and a crossbow
  shot borrow the sword thrust and the long-gun shot. Mixamo has most of these, but its clips can only be fetched
  by hand with an Adobe account; Meshy's library may add them.
- **Props are simple, and the two-handed hold is solved, not animated.** Props are built from primitives, flat
  shaded. The left hand's grip on a two-handed prop comes from a two-bone solve over clips made for other weapons (or
  none): the arm reaches the handle, but the shoulder and torso stay where the clip has them, so a chop made for one
  hand can look cramped, and when the left arm falls short the right hand is pulled in (up to 45 cm), which narrows
  the clip's swing. The elbow keeps the clip's side, which is not always the natural one. A spear thrust at full
  extension still leaves the left hand short for a moment (it eases off and back). The bow turns about its handle to
  face the drawing hand rather than the bow hand turning; the draw has no pinch pose (the right hand keeps the clip's
  fingers), and the arrow only shows while the string is pulled (there is no nocking motion). The supporting hand
  always closes in a fist.
- **The Voth clothing is generated, not tailored.** Each garment is lofted round the A-posed body and painted by
  script (`tools/make_garments.py`): no cloth simulation, no folds beyond the hang and flare, flat-shaded strips of
  texture. In motion it bends with the skin it was matched to. MakeHuman's skirt helper follows each thigh, which
  parts a skirt like trousers in a stride, so below the crotch `make_mpfb.py skirt_weights` pools most of the legs'
  pull (shared by both thighs and the hips): the long skirts flare wide at the hem, and a full stride still opens
  them a little at the front. Nothing billows, and a raised arm can push through a mantle's hem. Sleeves
  start inside the shoulder, under the tunic. There is no headgear yet (a noble's feathered headdress, a Dunmer hat),
  and the court outfits share one cut per body; more garments are more entries in `GARMENTS`.
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
