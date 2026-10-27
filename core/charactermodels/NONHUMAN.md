# Non-human bodies: the spike, and what full peoples would need

A spike (2026-10-23) for the Lizardmen (LORE 6.20) and Korona's therian tribes (LORE 6.18): can the MakeHuman bodies
carry a tail and an animal head, in both runtimes, without changing how any people looks? They can. This file says what
was built, how it was checked, and what full Lizardmen and therian peoples would still need.

## What is built

**A tail** (`tools/tail.py`, `tools/mods.py tail_piece`, kit item `mod_tail`):
- Eight joints `Tail1`..`Tail8` under Hips, on every body's skeleton (`data/mpfb_*/skeleton.json`), appended after every
  other joint so no index moves, as the lower-arm joints are: nothing is drawn on them until the mod is worn. The root
  lies 3.5 cm under the skin of the lower back, over the sacrum (found by a ray through the base's skin), and the chain
  runs back and down in the body's middle plane, about a metre on the man (`LENGTH` x the hip joint's height), each
  segment 0.9 of the one before, at the angles `ANGLES`: down at first, then trailing near level, a counterbalance.
- The piece: a tapering tube (8 cm radius at the root on the man, 8 mm at the tip, a little taller than wide), its first
  5 cm sunk in the body, each ring weighted to the two joints it lies between and its first 9 cm to the hips too.
- Its morphs: the tail moves with the skin over the sacrum and grows with the legs (scaled about its root by the hip
  joint's height change), the joints (kit.json `morph_joints`) and the piece's vertices by the same rule.
- **Its motion** (no clip moves it): each frame a spring chain at 60 Hz (`tail` in `50-figure.js`, `_tail` in
  `kchar_figure.gd`), one point per joint and one at the tip, pulled toward its rest carried by the hips (stiff at the
  root, loose at the tip: what is left is the lag), with a slow sway about the hips' up axis while a clip plays, a little
  gravity and damping; segment lengths kept; every point kept out of the thighs' and shins' capsules (the colliders
  bodyFix and the cloth use) by its own radius plus 1 cm, and above the floor; then the joints turn to the points. All
  of it is data in the kit item (`tail`: stiffness per point, gravity, damping, sway, pad).
- Over trousers it comes out through the waistband's back; through a shirt, a robe or a cape it comes through the cloth
  (KNOWN_ISSUES.md).

**An animal head** (`tools/mods.py lizard_head`, `tools/reptile.py`, kit item `mod_head_lizard`): a Komodo dragon's
head with an iguana's crest (the owner's photographs, 2026-10-27; its first form, a lofted snout with slit-pupilled
eyes, was replaced):
- Two signed distance fields meshed as the therian heads are (`tools/heads.py`: surface nets on a 3 mm grid, projected,
  smoothed). The upper head, rigid on Head: a loft (`UPPER`: per station half width, top and mouth line, scaled to each
  body's head) with the temples swelling behind the eyes, brow ridges hooding them, the nostrils' bosses near the tip,
  the skull carried back over the jaw's hinge and down the nape. The lower jaw on `face_jaw`: a loft (`LOWER`) a
  little narrower, so the upper lip's scales overhang it, heavy jowls, the throat in loose folds.
- Painted per vertex (the skin tint multiplies it): a dark mottle, paler lip scales, a pale ring round each eye, a
  lighter throat. The skin is the library's `organic.scale` (its albedo made near-colourless, and its normal map), on
  the tail too; without the images checked out, the procedural stand-in (`scale_texture`). The body's skin and the
  nipples (the skin has holes under them) wear the same scales under the head: kit item `skin_detail`, the head's maps
  repeated across the skin's UVs to the head's scale size (`skin_repeat`; `skinDetail` in `50-figure.js`, the skin
  shader's `detail_repeat` in Godot), so the collar meets scales, not human skin.
- Both lips tuck in toward the mouth's line, and near it the jaw is never wider than nine tenths of the upper lip: the
  lip overhangs, and no ledge stands out at the corner.
- Eyes: a round black pupil in a dark amber iris. **Lower lids** rise to shut them: a `blink` morph target on the
  piece's second mesh, which the figures' blinks drive (as the coyote's upper lids).
- The crest: flat blades down the midline from the crown over the nape and down the back of the neck (`crest`,
  `blade`), short on the crown, tallest on the neck, standing up and back; the neck's on the nearest base vertex's
  weights and deltas, on a material of their own (kit item `crest_neck`: the skin triangles under their roots), left
  out under a worn item that covers that skin. Teeth inside the closed mouth, seen when it opens.
- It replaces the human head: the item's `hide` is the base skin weighted at least half to Head (the human head's
  skin, as a worn item hides skin), its `hide_parts` the lips, ears, brows, lashes and eyes, and `replaces_head` drops
  hair, beard and headgear (`KCHAR.replacesHead`, `KChar.replaces_head`).
- A collar from the neck, below the edge of the hidden skin, up into the head covers the seam. Its vertices take the
  nearest neck vertex's weights and morph deltas, fading to the head's above that edge, so it follows the neck under
  every slider. The head's rigid parts move with the Head joint's morph delta (the face sliders do nothing to it).
- **The jaw** (no clip moves it either): opened about its hinge by up to 6 degrees for a third of every 5 seconds, a
  breath with the mouth a little open (`jaw` / `_jaw`; kit item `jaw`). `fig.jawOpen` (`jaw_open` in Godot) holds it.

**A frog's head** (`tools/mods.py frog_head`, `tools/amphibian.py`, kit item `mod_head_frog`; the owner's reference
paintings, 2026-10-27), made as the lizard's is, its collar shared (`_head_collar`):
- Broad, flat and rounded, sitting low with hardly a neck; the mouth a wide line from the blunt snout back under the
  eardrum; the jaw meets the upper lip flush; a full throat's pouch under it (on `face_jaw`, opened as the lizard's).
- Big eyes standing proud of turrets high on the head: gold, a horizontal pupil, a fine mesh at the pole where the pupil
  is. A wide lower lid lies down in the turret and rises over the front of the eye to blink (`blink`; it turns 95
  degrees: a morph moves each point straight, so further and the lid passes through the ball halfway).
- The eardrums dished in behind the eyes under the dorsolateral folds; small nostrils on top of the snout.
- Painted: dark blotches over the back, a pale lip stripe, a dark mask from the nostril through the eye to the
  eardrum, the eardrum dark in a pale ring, the throat and underside paler. Its skin is the library's `skin.smooth`,
  moist and glossier, which the body wears under it (`skin_detail`).
- A test record as the Lizardman is: the Cosmetic Lab's "Frogman" chip (or `?frog`), the Animation Lab's Body mods menu
  ("Frogman (test: head)").

**Making them.** `python3 tools/nonhuman.py` puts both on the bodies as they stand, from the published pieces, with no
Blender (they are made from the base GLB; their deltas from `base.morph.bin` and kit.json's joint rows). A whole rebuild
(`make_mpfb.py`) makes the same pieces from Blender's export (`mods.make_all` -> `mods.nonhuman`; the deltas from
`morphs.npz` through each piece's recipe, `mods.Recipe`; the tail joints into skeleton.json after `skeleton_nodes`):
`make_all` on the published base gives the same bytes as the spike. That path has not been run with Blender.
`python3 tools/make_mpfb.py gshapes <body>` remakes the Godot twin's shapes for every piece from the pieces alone, so
the Godot figure checks can run on a machine with only the published pieces.

**The test record.** Not a people, so no stranger is ever drawn with them (`tests/test-rig.js` checks every people).
The Cosmetic Lab's Body mods section has a "Lizardman" chip (the tail, the head, olive skin, amber eyes, no hair, bare
above the trousers), and `?lizard` in the page's address starts each body with it; the two mods are also chips of
their own, marked test. The Animation Lab's Body mods menu has "Lizardman (test: tail, head)" and "Tail (test)" for the
whole cast. Godot: `kchar_shot.gd -- --lizard`.

## How it was checked

- `verify.py --assert` on both labs (new: the head leaves out the hair and the head's skin; the tail's skin keeps to
  its joints under the morphs; in the idle, a walk and a crouch the tail stays out of the legs and above the floor and
  lags behind the hips; the jaw opens). `tests/test-rig.js` (the joints, the morph rows, the head's parts, no people
  draws them). The golden: only the eight new joints' rows are new; every stranger and part list is byte for byte as
  before. `kchar_test.gd` (Godot 4.7.2, with pieces this time: the same checks, and the bodies' own; its one failure, the
  giant's lower arms on the ladder, fails on main's own scripts and data the same way).
- No people's look changes: the new joints come after every other joint, no other piece was touched, and a record
  without the two mods draws exactly what it drew.
- Shots: the six bodies of the Animation Lab (short, neutral and tall man and woman) in the idle, a walk and a crouch,
  from behind and in front, and the Godot cast (in the session's notes folder, `nonhuman-shots/`).

## What full peoples would need

### The Lizardmen (LORE 6.20)

| Need | How | Size |
|---|---|---|
| **Six castes by size** (1.22 m Tenders to 3.80 m Bulwarks, each 1.25 x the one below) | a record-level scale (today `kit.scale` is per body: the giant), read by both runtimes and the golden, the clips slowed by 1/sqrt(scale) as the giant's; caste builds from the macro sliders (Bulwarks heavy, Interpreters lanky) | 1 session |
| **A reptile body skin** | the five textures in `core/materials/PROMPTS-NEEDED.md` section 21 (scales, belly scutes, head plates; slit and spiral eyes), laid as tiling detail maps over the neutral skin so the tint still colours them; a per-people skin set (`peoples.json`), new in both runtimes | 1 session after delivery |
| **Heads per caste** | the profile generator takes per-caste tables (snout length, crest, horns, frills; spiral pupils for the Interpreters); or sculpted heads (Meshy, after asking: it costs credits; or hand-made) fitted to the Head joint the same way | 1 to 2 sessions |
| **Hands and feet** | claws: a mod of rigid claw tips over the nails, as the cybernetic fingers; three-toed feet would replace the foot skin like the replacement arms | 1 session |
| **What they wear** (no clothing: jewellery, ornaments, headdresses, armour) | a culture set in `make_garments.py` (Blender) fitted to the scaled body: harnesses, collars, armour with an opening for the tail, headdresses fitted to the reptile head, not the human one (a new fitting target) | 2 sessions |
| **The tail against cloth and props** | the tail as capsules for the cloth chains (a cape drapes over it) and an opening in the torso items that cover it | 1 session |
| **Their motion** | the hiss: the jaw keyed per clip (`clips.json`); a tail swipe or a tail-braced stance needs tail tracks, which the retarget does not make: made clips (`derive`) or a per-clip pose for the chain's rest | 1 session |
| **A people entry** | `peoples.json` `lizardmen` with castes as tiers (scale, build, head, ornaments, mods) | part of the above |

About **8 to 10 sessions** and the five textures, for plantigrade Lizardmen.

**Digitigrade legs** (walking on the toes, the heel high) are the one thing that needs a new skeleton, and the lore does
not ask for them. Three ways, cheapest first:
1. **Keep them plantigrade** (a human leg under a reptile's skin, as most games' lizardfolk): no cost.
2. **A digitigrade stance from the same skeleton**: a pass after the clip that lifts each heel and bends the knee more,
   keeping the foot planted by a two-bone solve (the figure already rolls the feet onto their balls, `toesFlat`). The
   leg's mesh stays human; reads as digitigrade from a distance. About 2 sessions, both runtimes.
3. **A true digitigrade leg**: an extra joint between the shin and the foot (a long metatarsus), a leg mesh of its own
   (a mod replacing the leg skin), and clips retargeted onto that chain from a digitigrade source (the Meshy library and
   Quaternius have none: new clips, or made ones). It touches the retarget, the capsules, bodyFix, the grips and every
   lower-body garment. 6 or more sessions, with risk.

### Korona's therian tribes (LORE 6.18)

The lore names kinds, not yet tribes: a beaked people, a muzzled people, a throat-sac people. Each tribe is a head, a
tail (or none) and a skin:
- **Heads**: the head generator is a profile and its parts; a beak (horn material, no teeth, a nostril on top), a muzzle
  with animal ears (the ears on Head, or on one or two spring joints like the tail's), a throat sac (a mesh on the neck
  that the figure swells on a call). 1 session each.
- **Tails**: the same joints and spring chain; a mammal's is shorter, livelier (lower stiffness, more sway) and maybe
  bushy (hair cards along it). Hours each.
- **Skins**: scales and bare skin are textures (as the Lizardmen's). **Fur and feathers** are the expensive part: over a
  whole body they want a shell or card layer that follows the morphs and the cloth (a new shader in both runtimes), or a
  short-fur texture only (cheap, reads as velvet). 2 to 3 sessions for the shell layer.
- **Paws and hooves**: hand and foot replacements as the replacement arms (hide the skin, rigid or skinned parts). 1
  session each; hooves want the digitigrade stance above.
- Textures: listed as a gap in `PROMPTS-NEEDED.md` until the tribes are written.

Roughly **1 to 2 sessions a tribe** once fur is settled, plus textures from the owner.
