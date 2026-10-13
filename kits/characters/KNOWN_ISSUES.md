# kits/characters: known issues

- **The Godot twin blends normals linearly.** Its blend shapes carry each target's normals (NORMALIZED mode), so a
  reshaped body's normals turn, but as a weighted sum of the targets' turns, where the page re-sums them from the
  morphed faces: close, not exact, when many targets stack. Its skin is split into 32-37 cover regions (one draw call
  each); merging the small ones is the next saving there. `godot/data/characters/pieces/` is about 700 MB of copies
  (`sync_core.py`, the shapes whole with their normals), gitignored.
- **Morphs blend linearly.** MakeHuman's macros are piecewise (its age, weight and height targets switch between
  combinations), and its race targets interact with them; a sum of deltas measured one at a time is close, not exact.
  Height's full ends overshoot (2.4 m and 1.3 m), so its slider reaches half way (`REACH` in make_mpfb.py).
- **Bone rotations do not follow the morph.** Joints move; their rest rotations stay the base's. The rest pose is
  exact; in motion a heavily reshaped limb bends about the base's axes.
- **Clips are retargeted** from Styv, Meshy's library and Quaternius's libraries: big build changes can push a hand
  into a hip in motion, and a clip made for a slight body can clip through a heavy one.
- **The work clips for digging and hammering are made, not captured.** Neither library has hoeing, hammering at an
  anvil or a pickaxe (Meshy's checked again). Dig (hoe, pickaxe) is the heavy blunt swing looped, so a hoe is swung
  overhead like a pick, not chopped short. Hammer at anvil is procedural on the idle's first frame: the legs and hips
  hold still, the arms move by a two-bone solve (the elbows go where the solve puts them), and the beat is even. A
  spear thrust, a dagger stab and a crossbow shot still borrow the sword thrust and the long-gun shot. Mixamo has most
  of these, but its clips can only be fetched by hand with an Adobe account.
- **Props are simple, and the two-handed hold is solved, not animated.** Props are built from primitives, flat
  shaded. The left hand's grip on a two-handed prop comes from a two-bone solve over clips made for other weapons (or
  none): the arm reaches the handle, but the shoulder and torso stay where the clip has them, so a chop made for one
  hand can look cramped, and when the left arm falls short the right hand is pulled in (up to 45 cm), which narrows
  the clip's swing. The elbow keeps the clip's side, which is not always the natural one. A spear thrust at full
  extension still leaves the left hand short for a moment (it eases off and back). The bow turns about its handle to
  face the drawing hand rather than the bow hand turning; the drawing hand's pinch is one fixed pose, and the arrow
  only shows while the string is pulled (there is no nocking motion). The supporting hand always closes in a fist.
- **The Voth clothing is generated, not tailored.** Each garment is lofted round the A-posed body and painted by
  script (`tools/make_garments.py`): no folds beyond the hang and flare, flat-shaded strips of texture, and the
  court outfits share one cut per body. Its hanging parts swing on spring-bone chains (README, Cloth), which are not
  cloth: no wrinkles, no self-collision, and layers are kept apart only at the chain points (a cape over a hem over
  a skirt, README). Between chains the cloth is interpolated; the GPU push (README, Clipping) keeps the legs and arms
  inside a loose garment, but it works on capsules, so a heavy thigh's front can still graze a tight skirt's top and
  a shoulder (no capsule) can show through a mantle in a full overhead reach.
  The headgear (a wrap, a quetzal headdress) is rigid: the headdress's fan swings, its band does not.
- **A people's clothes are tagged with its culture** (`culture` in the kit, Voth items `chichani`): a random
  stranger of another people never draws them, but the editor's pickers still offer every item to every body.
- **Skin shows through where an item's cover is approximate.** Items with no MakeHuman delete group (polo, fisherman
  sweater, cargo trousers, tiered skirt, flats) hide skin by a ray test; a skirt's cover is deliberately small, so
  the thighs under it show from below, and arms raised high pull a sweater's front off bare skin. The waistband tuck
  works above the hips only: a short tee over jeans in a deep crouch can still show denim at its hem.
- **Download size.** About 50 MB of pieces as served (both bodies, every item and its deltas, gzipped; the page
  unzips them with the browser's DecompressionStream), fetched per item as needed. Dense shoes (flats, pirate boots)
  are still the heaviest geometry; decimating them in Blender before the morph capture is the next saving.
- **The peoples are mostly proposals.** Only the Chichani and the Beast Riders come from the owner; the others
  follow LORE.md's real-world references.
- **Ancestry is MakeHuman's three reference sets** (African, Asian, Caucasian). It moves face and build only; the
  skin tone is its own setting, so a people can pair any face with any tone (the Chichani, the Dalabites' green).
