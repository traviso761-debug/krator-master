# kits/fauna: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

- [ ] Every animal is here (48 species, 2026-10-06), but the builds still draw their own copies (each entry's `source` says
      where): point the biome kits and settlements at the bundle, one build at a time, and check each still reads the same.
- [ ] Wings are rigid: a perched bird's wing is turned back, shortened and rolled down the flank (`flap.sweep`, `foldScale`,
      `roll`), which reads as folded for the kite, swift and dart; the gull's built-in dihedral fights the roll, so it keeps a plain
      sweep. The giant flyers, the flamingo and the canopy darter fold in their shape and fly as a `'fly'` pose build. A wrist
      joint (a `hand` sub-part per wing) would fold every bird the same way.
- [ ] Parts turn rigidly: no skinning, so knees do not move (legs turn at the hip, the bend is built in), and a rigid neck stops
      a horse's or grazer's muzzle about 0.4 m above the ground. The octopod and hexapod walks swing whole legs, so feet slide
      (Mav's spiders plant theirs by IK). A Godot port takes each part as a bone; a skinned version could follow kits/mechs.
- [ ] `A.tube` turns its section's 'up' from +y to +z where a curve passes near vertical, which can pinch a leg at a bend; the
      species files build legs from straight segments with joint knobs (`faFmChain`, `faAbLimb`). Its end caps faced inward
      until 2026-10-06 (fixed in the core; some species files close their ends themselves).
- [ ] Hens and ducks walk as bipeds and never flap; a frilled lizard's open frill is a variant, not an animation; no couched
      (kneeling) dromedary pose; a grounded giant bat walks as a biped (its planted wrists do not step).
- [ ] Every bird's plumage is the `feather` family with no map yet: smooth white hens and ducks read as plastic until the
      `feather.plumage` and `feather.flight` sets arrive (`core/materials/PLAN.md`, "The Fauna kit", lists every set still wanted).
- [ ] The goat's long hair is strips and a skirt, not cards with alpha: up close the locks read as ribbons.
- [ ] The salamander's markings are vertex colours on 16-sided rings: the blotches are blocky at close range. A painted skin
      sheet (`patterns/scyvoi/salamander-ember`, `-dun`) would be finer.
- [ ] Yields, masses and life figures: the goat's and the farm animals' are plausible real-animal figures; those of the invented
      species are the porting agents' judgement (the sources carry none). The owner may want to set them. The hyperjungle sky
      ray is drawn at the biome's rendered size (span about 19 m), about twice LORE.md's "6-12 m soarers".
- [ ] No ash-plain biome exists yet: the Ash Nomads' staghorn beetle and ash runner are tagged with the nearest keys,
      `swbay` (the volcano) and `crater-drylands` (burnt steppe); the millipede adds `crater-drylands` for its ash herd. Retag
      them when the biome exists. The Zeijani of Dhelv ride the staghorn beetle too, but are not a catalog culture yet, so
      only `ashnomad` is in its `herdedBy` (a note in its `source` names them).
