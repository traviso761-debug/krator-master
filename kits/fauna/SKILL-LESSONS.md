<!-- DRAFT for painting-to-3d-world/SKILL.md: a new section 5j, after 5i ("One volcano as eleven stations"). It is NOT merged into
     painting-to-3d-world.skill (a zip): say so and it goes in. Facts are from the fauna-kit sessions of 2026-10-06 to 2026-10-16. -->

## 5j. A fauna kit: animals as data on shared builders (Oct 2026)

Every animal of Krator moved into one kit (`kits/fauna`), the way furniture moved into the catalog: an `ANIMAL({...})` entry
is data first (tags by biome, koppen, aridity and climate; yields; traits; the life layer's numbers), then a build that draws
the animal as named parts a host can move (body, head, tail, legs, wings). `fauna_bundle.bundle(groups)` ships the groups a
world asks for as ONE closure exposing `KratorFauna`. About 190 animals later:

**Plan before drawing**
- **Plan by biome, in a table, before any animal is drawn.** Each biome gets at least two grazers, one predator, one flyer
  and one water creature. Give the owner the table with the proposed names first: they will redirect it (a giant sea lion
  for the Ring Sea, domestic stock, "make some sea and lake fauna"). Where biomes overlap (the Throne's ten sub-biomes) share
  creatures instead of inventing ten sets. Start with the biome that has the fewest animals, then go in waves, one commit each.
- **Pin a name the owner uses that the repo lacks.** "Plumelands" was nowhere in the repo. Take the nearest reading (the ash
  plain under the volcano's plume), tag it as a new biome, write the assumption into the plan, say so in the reply. The owner
  confirmed it; only then retag existing animals, because a tag edit changes the group and every kit that bundles the group
  must be rebuilt (only the Ash Nomads bundled `ash`).

**Builders, not one-off code**
- **A dozen shared builders, a five-line entry per animal.** Quadruped, fish, serpent, crab, ray, squid, jelly, octopus,
  bee, six-limbed, glider: each takes a `spec`; an animal is dims, mass, yields, a lore note, speeds and colour variants.
  New capability goes into the builder as an option (`stock`, `limbWeb`, `glowTips`, `lure`) so the next animal gets it for
  free. The entry helper fills default tags and derives the rest (a centaur gait adds `climbs` to locomotion).
- **Scale by spec, not by new code.** The Rift's four gliders run from a raccoon-sized one (1.2 m span) to a
  quetzalcoatlus-scale one (10.8 m span) on one builder. The big one needed its own triangle budget and a shorter tail,
  or its length beat its span.

**Declared size is a contract**
- **Verify asserts the contract** (12 checks): the built box within 10% of the declared `dim`, the animal on y = 0, triangles
  under budget, tags and yields in the vocabulary, every mode (idle, graze, walk, rest, fly, swim) keeping the animal in
  its box, a deterministic build, detail maps decoded. Do not paste a measured size over a bad build: look at the animal first.
- **Fit `dim` by script.** Build, assert, raise only the failing keys' `dim`, repeat (one to three passes). If it never
  converges the failure is not box-related: read the FAIL lines. A flyer declares its FULL wingspan (the animation check
  fails an animal that "grows" past 1.6 times its width). Webbed gliders pass the default 9,000-triangle budget: give the
  entry `data.budget` (11,000 to 12,000) rather than raising the default for everyone.
- **Run the assertion pass alone.** Screenshots taken at the same time starve it and both time out.

**Anatomy that reads right**
- **Ask what the beast should NOT read as.** The first six-limbed animals came out insectoid; the owner wanted them
  ambiguous. What fixed it: a shoulder or hip bulge so each limb grows out of the body, a heavy thigh, a knee, a tapering
  shank, a padded foot with blunt toes, a seamless torso lofted in rows with belly and back shading, a muzzle with nostrils
  and a mouth line. A `stock` option (body and limbs times k, legs divided by k) cures spindliness in one number.
- **Options that suit a pony break a raccoon.** The ash racer's `hindBig` thighs stood up through its back and its swept
  crest read as a flat slab; both came out and the limbs got thicker instead.
- **Clamp whatever hangs.** Feet, whiskers and hanging tails dipped below the ground until they went through `Math.max`
  and the feet got a floor. The on-the-ground assertion found them; the eye did not.
- **A colour function can return nothing.** A `pat(x, y, z)` that returned null turned a fish white: end with
  `p || mix(...)`. A mix helper given arrays of colours also returned white until it accepted them.
- **Judge each animal in the pose it is used in, at the distance it is seen.** A contact sheet of rest poses from far away
  hid the membranes and made every glider look spidery. Shoot per pose (walk from the front three-quarter and side, fly from
  above); `?only=key&mode=fly` plus `_sheet.view(i, 'top')` does it. `verify.py --views` takes names (`front34`, `side`,
  `top`), not numbers.

**Gaits and gliders**
- **A gait is the owner's call, scoped by habitat.** The `centaur` gait: front limbs always arms, middle limbs arms at a walk
  and legs at a run (blended by speed), hind limbs legs. It is for arboreal animals in biomes with hypertrees (the
  hyperjungle, the NW bay, the Throne's windward side), NOT every six-limbed beast; lowland gliders use it too. Its animals
  must climb: a `climb` mode pitches the body up the trunk, and `gait.walk` lets a flyer walk on the centaur gait while its
  type stays `flyer`.
- **Glider membranes go between the limbs, like a bat's, not on the back like wings.** A web from limb to limb as ruled
  surfaces (front to middle, middle to hind, hind to tail) with a scalloped free edge and a sag. In a glide the limbs go
  level (spread anchors); folded, the web is a small flap. The fanged ambush glider gets the full bat panel set (a
  propatagium, fanned membranes between finger struts, a membrane to the hip, one from hind leg to tail). A plain
  "reptilian" glider is reptilian only: no fangs unless the brief says so.
- **An alien biome gets an emissive vocabulary.** The Rift's gliders carry glowing limb tips, a row of lamps down the back and
  a lure on a stalk, all drawn from the kit's `glow` family, over dark bodies and coloured veils.

**Process**
- **Rebuild what the change reaches.** A runtime or core change: rebuild every consumer (Scyvoi, Desert Nomads, Ash Nomads)
  and run its own `verify.py --assert`. A group's tag change: only the kits that list the group. A page not in
  `PORT-BASELINE.json` reads NEW, not changed: leave the baseline alone.
- **Scripted edits assert their own match.** A regex meant for the lore note rewrote the yield note on eight animals. Replace
  with `assert s.count(old) == 1`, anchor on the next field, and `git checkout` to redo. `pkill -f` matched its own shell
  (exit 144): anchor `pgrep -f "^bash ..."`.
- **The plan and README are the log.** Each commit adds its line (what, why, the count) to the kit's plan and README, so a
  fresh session knows which biomes are done. Commit and push every step; open no pull request and republish no gallery
  unless asked.
- **Know what procedural cannot do.** Invented anatomy, insects, fish and gliders work; real animals with feathers or humps
  (goose, turkey, camel, small birds) stay weak. Plan generated models for those (Meshy: preview 20 credits, refine 10;
  rig through `rig/qmodel.py`), and when the credits run out (a 402) defer rather than fake it. Never write an API key into a
  file; a key pasted into chat should be rotated.
