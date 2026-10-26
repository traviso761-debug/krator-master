# Pitfalls, by area

Each line is a symptom the user saw (or a test caught), its cause, and the fix that held. Read the section for the
area you are about to change.

## Contents
1. Rig, skeleton and retarget
2. Morphs and sliders
3. Clothing fit and clipping
4. Materials, alpha and textures
5. Cloth chains
6. Animation clips and per-frame passes
7. Posture
8. Props and hands
9. Body mods, giants and extra arms
10. Godot twin
11. Publishing the pages
12. Tooling and the shell

## 1. Rig, skeleton and retarget

- **MPFB skeleton scrambled** (the woman's Head below her Neck) → build with `detailed_helpers=True`; the rig only
  lands right on the helper geometry.
- **Bone names arrive as `mixamorigHips`** through GLTFLoader → strip the prefix when indexing bones.
- **Godot binds are in breadth-first order**, not the GLB's → rebind by name, never by index.
- **Morph joint deltas in the wrong order** → use the skeleton.json joint order everywhere, not the GLB node order.
- **Clips retargeted onto MakeHuman's curved spine straighten it**: the figure leans back with its chest pushed out.
  Not fixed in the retarget; offset by a posture pass after every clip (section 7).
- **Idles bent the whole body** → the source rig was misidentified; detect the rig family from the raw bone names
  before retargeting.
- **Turning the spine to correct a pose tilts the head** → spine joints are corrected alone; the neck and head stay
  rigid from the neck, or take back part of the correction deliberately.
- **Rest rotations do not follow morphs**: joints move with a slider, their rest rotations stay the base body's. Big
  build changes can push a hand into a hip in a clip made for a slight body. Known and accepted.
- **Finger joints skipped by a name filter** (`endswith('2')` caught `Index2` as well as the second arm) → name the
  extra limb distinctly (`Left2...`) and match exact names.

## 2. Morphs and sliders

- **Short and tall bodies: hair off the head, shirts off the torso, holes at the joints**, neutral fine → the morph
  data the page loaded was stale or missing (see section 11). Check the slider ends before blaming the fit.
- **Short/tall figures floating or sinking over time** → the hips' morph delta accumulated every frame on clips with
  no hips position track. Reset the hips to the rest translation before the mixer runs, in both runtimes.
- **Target name matching**: `ear-scale` matched `ear-scale-vert` → exact match first, then prefix.
- **Ancestry base weights summed to 0.99** → normalise.
- **Height overshoot at the slider ends** → limit the reach (0.5 of MakeHuman's range here).
- **Delete groups not matching the morphed body** → evaluate mesh positions with shape keys applied.
- **Morphs are linear** on the page; MakeHuman's macros are piecewise, so the extremes differ slightly. Accepted.

## 3. Clothing fit and clipping

- **Skin through a garment that has no delete group** → cast rays out and in from the skin (`covered()`) to derive
  one; for tops with a partial group, union the ray result in (shoulders and chest came through T-shirts).
- **Knees and the crotch seam through loose library trousers** (cargo trousers in a crouch, a lunge, a roll) → tint the
  skin red and shoot: red is skin left drawn, not torn cloth. The legs stood off the knee up to 3.3 cm and the rays reach
  2.5, and rays along the normal from the crotch and the buttocks' cleft go between the legs. Longer rays (5 cm) plus a
  closure test (rays along +z and -z both meet the garment) hide them; `make_mpfb.py hides` redoes it from the GLBs.
  Garments settled to the body are not exempt: the made cultures' trousers showed the same knees in a crouch, so every
  legged item takes the cover (`legged_trousers`). Diff the red shots before and after on a magenta background: red
  gone is the fix, new magenta would be a hole the wider cover opened.
- **A nipple through a T-shirt** (the man's, in the idles) → the base's nipples are a primitive of their own
  (`Human.nipple`), drawn over the skin: no hide reaches them. Hide such a part when an item hides all the skin under it
  (`hide_parts`). Draw the garments hidden and the hide on (A-pose, front and back) to see every such leftover at once.
- **A waistband through a T-shirt's back in a forward bend** (a heavy push, a swim) → the tuck drew the band in level
  toward a vertical axis; measure the way in from the trunk's axis (hips to Spine1) and the height as the greater of the
  trunk's and the world's (the trunk's alone untucked the back of the band in a crouch). Give a new per-frame pass its
  own scratch vectors: borrowing 50-figure.js's shared `cV` in `legCaps` put a skirt chain point inside a thigh in
  verify.py's walk (another pass reads it across frames).
- **Skin through a garment at one body size only** → test every body; seat ease and hem width that suit the neutral
  body under-fit the heavy one.
- **Trousers through tunics** (patches at the hip) → the under-layer's ease must be smaller than the outer's, widening
  toward the cuff; squeeze trousers under long loose tops.
- **Skirts parting like trousers in a walk** → skirt weights blended across both thighs, wider hem flares, then
  cloth chains.
- **Long robes tearing at the back when idle** (the buttocks push through) → back columns hang from just below the
  crotch, not from the waist.
- **Knees through skirts when sitting** → keep the knees inside; layered tiers for long outer sheets.
- **Hair through hats** → hats that cover hair carry a COVERS_HAIR flag and hide the hair; tall hats clear the crown
  (height at least the highest hit on the scalp plus 1.5 cm).
- **Hood open over the crown** → narrow the face opening above the brow.
- **Toes through boots, a disc at the heel** → a shaft plus a capped foot tube, the heel found by ray.
- **Sleeves ballooning** (a straight shoulder-to-hand line leaves a bent arm) → loft along an elbow path; test against
  a torso-only collision set so the A-posed arms don't catch.
- **Chest shelf and armpit gaps on a wrap top** → torso-only collision, per-column hang, convex rows.
- **An over-garment tearing through the one under it** (himation through chiton) → hang it from the waist, raise the band.
- **Inverted faces as black seams** on horns and wings → orient normals per part by majority vote, not face by face.
- **Garment holes leave loose vertices** → delete loose vertices after cutting and record what was removed.
- **More than 64 items overflowed a 64-bit hide mask** → name skin regions by the list of items that cover them.
- **A random NPC wearing another culture's clothes** → tag every item with its culture and filter the wardrobe.
- **Fitted cloth crumpling at rest under the GPU push** (a loincloth's flaps winged out, a kilt's seat torn down the
  middle, a robe's back jagged) → before tuning, switch the push off and shoot: if rest is clean, the push is wrong,
  not the mesh. Two causes: a soft shell *outside* the capsule (everything within 4 cm moved out up to 3 cm) → a thin
  band either side of the surface (monotonic, so tiers keep order); and a thigh capsule on the femur, which sits toward
  the outside of the thigh, so a radius covering the flesh within swallows the buttock and crotch → no push in the
  thigh's top third (knees are what come through).
- **Legs thin under a long robe** → a "draw in toward the capsules" pass that loops over every capsule pulls each
  vertex toward all of them (a shin's into a ball at the knee, the inside of one leg toward the other) → draw to the
  nearest capsule only.
- **Breeches swinging as a sheet** → a name test for legged garments ("trousers") missed breeches and braccae; they
  were marked loose and their weights pooled below the crotch like a skirt's.
- **Boot cuffs through a long robe's hem** → squeeze the feet too under a loose long top, whatever the legs wear.
- **Change one variable per shot, and shoot the A-pose too** → toggling the push, the cloth sim (rigid) and the posture
  pass one at a time, A-pose against idle, told push, weights, chains and posture apart in a few shots; tuning blind
  cost whole pipeline runs.
- **A mantle torn at the shoulder blades** → colour the parts (vertex colours by `_vidx` range) before theorising:
  the trader's mantle back had sunk into the body over the whole upper back, held rigid by the chest while the spine
  bent in the clip and the posture. Weight tricks (contact, copied weights, chains on the collarbones) and reading the
  chain rest in the postured bind pose alone did not close it. What did: a chain's rest follows the garment's own body
  weights in the current pose (kit `bw`), whole for chains above the hip joint, by the top point for chains below
  (point by point there a robe's skirt followed the thighs), never the legs' weights.
- **Removing hidden triangles from a garment breaks Godot** → its glTF importer drops vertices no triangle uses, and the
  morph data no longer lines up. Keep every vertex referenced.
- **A cape's edge as a long spike at the idle** → a chain colliding with the arm (an elbow hangs at the waist) moves one
  column alone; chains do not collide with arms, the per-vertex push keeps cloth out of them.
- **A knee through a robe's front in a run, though the push covers it** → the robe's front lagged almost onto the
  thigh's axis (1-3 cm from the bone), and "out along the line from the bone" is noise there: neighbouring vertices went
  out left and right and the cloth split open round the knee. Blend the way out toward the leg's outward side the deeper
  the vertex lies (`(1 - d/r)^2`). Find this kind of fault with a CPU replay of the shader on `boneTransform` positions
  and a ray from each skin vertex out of its limb; pushing along the cloth's own normal measured worse.
- **Blue-grey patches on a shirt or robe in a stride, trousers seeming to show through** → the cloth folded over itself
  and its back faces lay at the front faces' depth (DoubleSide). Check by drawing the material FrontSide: clean means
  it is this. Draw back faces a centimetre further from the eye (fragment depth from the view position); widening the
  push or squeezing the trousers changed nothing.
- **A sheet over the arms hung from the waist shows the tunic under it at the back** → its back falls inside the seat.
  Hung from under the seat as robes are, it showed the tunic all over its back; cut the under-layer short instead (the
  grand boubou's to the waist: no more of it is seen). Check the A-pose first: a fault there is the cut, not the motion.
- **"Hang it from the waist as the monk's robe" is not for every robe** → it helped the skirts and the Yuni gown, but the
  Izani court robe's woven tabard tore across the hips; shoot each one.
- **Tall bodies tear a robe the default one wears well** → measure before blaming the capsules: the skin's distance from
  each capsule's axis (median and 90th percentile, by morph) against the push radius. Here they matched within
  millimetres; the thigh was 29% longer, and the robe's cut had no cloth for its stride.
- **A skirt split down the side of a leg swung back** → pushing out "away from the body's axis" sends a skirt's front
  out the back of a trailing leg; take the side the cloth faces (its skinned normal).
- **Belts round the hips flaring into fins** → they took the thighs' skin weights from the body; weight them to the
  hips alone (`.cloth.json` `hips`, `mods.pin_hips`).
- **A flap that poofs out in a stride** → the per-vertex push sends cloth between the thighs out sideways; a garment of
  flaps only is not pushed, its chains keep it off the legs.
- **Fitting order between items** → each garment is fitted alone, so an under-item's flap 3 cm off the body stood
  outside a shirt at 1.4 cm; check eases across items that are worn together.
- **Long thin streamers from a hat** → part of a head item hung below the "above the neck → Head joint" cut and took
  the shoulders' weights; give whole pieces (welded by position) that end above the neck joint to the Head.
- **A hat across the eyes** → the head bone runs from the neck to the crown, so fraction 0.5 is eye level: a brow band or a
  turban's first row sits at about 0.62.
- **A paint band painting a whole narrow part** → `B(where, a, b, ...)` takes metres, not fractions: a 0.15 band on a
  ribbon a few centimetres wide covers all of it.
- **Colours reading pale in the renders, and lemon in a world** → `make_garments.py`'s palette is LINEAR, written into
  an sRGB texture: (0.80, 0.32, 0.03) shows as a pale orange (0.91, 0.60, 0.19), and a world's ACES tone mapping lifts
  a bright orange further to yellow. Pick the colour on screen and convert it (sRGB^2.2): the Order's saffron is
  (0.60, 0.12, 0.005), its maroon (0.18, 0.025, 0.03). Deepening by eye in the palette's numbers barely moves it.
- **A people's strangers in another people's hair** → `styles` are only preferred (three in four); `style_share: 1` in
  peoples.json keeps them to their styles (the Order: cropped men, women to a bob).

## 4. Materials, alpha and textures

- **Patchy or red skin**: Blender's glTF exporter marks every material BLEND → set opaque or cut-out (MASK) per material.
- **Silver brows and hair**: a black image was filed as the normal map → drop normal maps that are not normal-like;
  cut-out alpha leaking to a transparent canvas → force output alpha to 1.
- **Beards drawing darker than the hair** → not the normals: the clear texels were black and darkened the mips. Fill
  clear texels with the texture's mean grey.
- **Soft beards invisible** → a lower alpha cutoff (0.12) for soft hair textures.
- **One eye untinted** → the iris mask took a black transparent corner disc for the pupil; alpha-test the mask.
- **Tint looked wrong** → make skin, hair and iris textures neutral grey and multiply the colour in at runtime.
- **Blender's Python has no PIL** → write images with `bpy.data.images` and `pixels.foreach_set`.
- **A corrupt PNG CRC in a downloaded pack** → fall back to ImageMagick.
- **Some library and community assets are broken** (404, corrupt, wrong texture names) → keep a SKIP list and a
  fix-up step; record CC-BY assets in CREDITS.
- **Fur shells hovered in a ring above the hat, level while the head stooped** → they were drawn in the bind pose:
  three r128 skins only a material made with `skinning: true` (the glTF materials carry it; a new
  `MeshStandardMaterial` does not). Set it on every material a SkinnedMesh draws with.
- **A garment's fur came out through what is worn over it** (trousers' pile through the boots' shafts and a deel's
  skirt in a stride) → shells stand off the cloth by the pile, so anything lying within the pile under another layer
  shows. Trim the under-item's fur by rest height (the boots' top, the top's hem: `furShells` kfF) rather than shortening
  the pile everywhere.
- **Which texels are fur is not in a baked garment** (one texture atlas per garment, a strip per part) → record it at
  build time (`fur_of`: the rows per part and band, with the metres per unit of u and v); for pieces already built,
  map strips to parts in source order and use the paint colours only to place band edges: by colour alone the
  ushanka's umber crown band read as fur.
- **A coat read as sand, not fur** → the skin showed between the strands and the tips were too bright: give a full
  coat an undercoat (its first shell whole where the cover is dense) and soften the tip and per-strand contrast. Not for
  sparse body hair: there the undercoat painted solid patches.
- **Fur hung over the eyes and down the nose sides** → a bare face found by the normal alone keeps the eye sockets and
  the nose's sides; mark it as an ellipse on the head's front, sized from the head's extents at rest (the base has no
  face weights: everything above the neck rides Head).
- **A furred face had no eyes** (the coyote coat over the whole head) → leave the eyes and the mouth bare as small ellipses
  in the face ellipse's own measure; first guesses sat a fifth of a face too high and too low, so check them on a shot.
- **Sparse body hair read as dirt** → draw it in a colour partway from the skin's toward the hair's (`ink`), comb it flat
  and keep the comb per layer under a strand's width (more layers), or the streaks step like stairs.

## 5. Cloth chains

- **Cloth that lies on the body must not hang on chains.** A cloak hung plumb from the shoulder blades stands 4-6 cm
  off the small of the back; on chains held by the chest it swung into the back whenever the spine bent (holes with
  blocky edges, which look like texture alpha but are geometry: check the material is opaque before chasing alpha).
  Bind cloth within ~4 cm of the skin to the body's own weights, fading to the chains by ~9 cm, except over the legs
  (a skirt on a thigh must leave it as the leg swings).
- **The seat is in no limb's capsule.** A thigh capsule runs down the femur and the trunk's up the spine; the buttocks
  sit between, and every robe's back tore there in an idle. Give the chains and the per-vertex push a seat capsule
  per side, its ends rest points carried by the Hips joint.
- **A capsule needs a radius per end.** One radius per limb (a median of the surface) let the calf and the top of the
  thigh through long garments; measure the 90th percentile near each end, inside the limb (past its ends lie the foot,
  the hand, the trunk), and interpolate along the capsule in the shader.
- **The push and the trouser squeeze share a margin.** Drawing trousers in less put them out through the robe's knee;
  pushing the robe further out makes spiky folds. Keep the squeeze tight (8 mm) and the loose top's pad ~2 cm.
- **Layer order spans garments.** Chain layers were per garment, so a breechcloth flap (layer 1) and a shirt's skirt
  (layer 1) crossed; rank by slot first (legs under torso under head).
- Spring-bone chains on hanging garments (not trousers): roots pinned, collision against capsules on the legs and body.
- **Collisions undone** → the final length-keeping pass must run before collision, not after.
- **Robes crumpled onto the lap by a capsule lever** → reverted; simple capsules.
- **A parent-side rule flipped a chain 137° in Godot's walk** → limit it to near-level limbs.
- **Measuring swing in a test**: an angle metric saturates near π; measure frame-to-frame motion instead.
- **Robe chains Z-fold at their tops (bones past 1.5 rad)** → chain roots lie inside the body's capsules, and a push
  out to the full radius throws the next point sideways. Push no further out than the point's own rest lies from the
  capsule; on legs, floor that at the bare limb radius (a hips-following rest goes inside a thigh swung forward).
- **"Away from the body's axis" flips are for legs only** → on trunk capsules a forward-leaning chest sends a mantle's
  neck points through the body; on a leg, skip it for a point whose rest is on the thigh's inner side (a skirt's back
  centre goes out through the thigh).
- **Long chains rigid on spine joints** → clips pitch the spine hard and the hem's rest lands 0.7 m off; turn the chain's
  bind shape by the Hips' frame from its root instead, and give the root all its weights.
- **Finding which rule throws a point**: trace one chain's pushes per capsule (name, radius, before/after, rest) in
  Godot headless; switching collision, ring and layering off one at a time names the stage first.
- **Measure before baking fit into the pack** → a settle per slider end (the handoff's 1.2) would have moved almost
  nothing: MPFB's refit already keeps garments at their rest depth across every end. The clipping was between items
  worn together; `tools/ease.py` (height above the skin, under-item against over-item at the same spot) names the pairs.
- **Garments built apart meet where they are worn together** (a tunic at 1.4 cm over trousers' seat at 1.6) → settle at
  build time: under-layers first, each garment pushed out to a gap past every lower layer worn with it over the same
  skin spot, the push spread over the part's grid (`settle` in make_garments.py). Measured 16 failing pairs of 58 to
  edge vertices only. An item that lies between another's parts (pteruges between a tunic skirt and a cloak) needs
  part layers and the other built twice.
- **Robe panels flung out like wings at idle** → measure before toggling: per-chain drift from rest named a back panel
  whose rest sat inside the buttocks (its shape carried whole from a chest root leaning 10 cm ahead, turned with the
  tilted pelvis), and the layering pass threw it out through the body. Place hanging cloth by the hips with their
  heading only, fading the top point's offset out to the hip joint. Shots alone misled: a variant that "looked" fixed
  in one frame was just a calmer moment.
- **Hanging cloth must hang** → a chain's rest that rotates with the pelvis or the chest (rigid, or point by point by
  body weights) tilts with the clip's lean: a back panel sank into the buttocks, a cloak's front stood out like a shelf.
  Below the hips: placed by the hips, heading only. Above them, loose cloth: its fitted shape from its top point,
  heading only; stiff mantles that lie on the body keep following it.
- **A pauldron (an arc round the arm) on the wrong side of one arm** → a frame chosen from the arm's direction is not
  mirror-symmetric; centre the arc on the side facing up.
- **Painted round things in a stretched cell** (buttons in a 3 x 7 cm cell) come out oval: draw them round in metres.
- **Page shots of a walk were not repeatable** (the page's loop advanced the figure in real time between the script's
  steps, and each clip faded in from the last shot's) → `tools/shots.py` holds the loop (`_kchar.still`), resets the
  chains, starts the clip from a stop and steps it at 30 Hz: pixel-identical in any order. Use it for before/after.

## 6. Animation clips and per-frame passes

- **Every frame starts from the clip.** three.js's mixer writes a bone only when its value changes, so on a still
  frame (paused, scrubbed, a held pose) passes that turn bones after the clip (posture, two-hand solve, push) turn
  last frame's already-turned bone again: the figure creeps or jitters. Restore the clip pose each frame, then apply
  the passes once.
- **Z jitter on drive-cart, repair and die clips** → the hips' position track fought the mixer; apply it outside the
  mixer, after restoring the clip pose.
- **Libraries lack work and weapon clips** (hoe, anvil hammer, pickaxe, a straight thrust) → derive them: a source
  clip's legs and body (the standing idle, the combat stance) plus arms posed by forward kinematics and a two-bone
  solve per arm, the hand turned to hold its prop. Say in the docs which clips are made, not captured.
- **Loops drift**: take the drift over a cycle out (the loop plays in place) and keep it as a root speed for the game.
- **A looped one-handed swing used as a dig** put the left arm across the chest (the user saw the arm through the
  chest) → a made two-handed dig.
- **Thrust aiming up instead of forward** (the library's 'Thrust Slash' stabbed overhand) → a made thrust: hand
  drawn to the ribs and driven straight forward at chest height, the shoulder turned into it; the spear version
  underhand, right hand at the butt, left forward on the shaft (the library one clipped arms, spear and body).
- **Spear held behind the back** in the library's spear walk → keep its legs and body (fetched as a source only) and
  put the arms at the made thrust's guard.
- Check the whole clip in shots at several times, not one key frame: clipping usually lives mid-swing.
- **Elbows bent backwards** after the retarget (a source rig's arm rest maps the forearm past straight) → limit the
  bend at bake time about a hinge fixed in the upper arm (across it and the figure's forward at rest), and leave
  readings far past straight alone: an upper arm turned on its own axis (overhead) makes a fixed hinge misread a deep
  bend as a backward one, and "fixing" it swings the forearm 120 degrees.
- **A hand that only gestures** (scratching the air over the head, a sleeper's hands up) → re-pose the arm at bake
  time onto a target measured from the base mesh (a skull ball, the body's front at a spine joint), weighted by how
  near the clip brings the hand, so the rest of the clip is untouched.
- **Limbs through limbs**: test segments with radii (closest points of two segments), not joint points: the old pass
  tested the wrist and elbow points with no limb radius, so a hand sank 3 cm into a thigh before it moved. Test the
  hand to the knuckles too. A knee in a shoulder cannot be cleared by the arm (the shoulder is fixed): swing the
  thigh out, always the same way (a min-of-two-sides choice flips between frames and between runtimes), and cap it.
- **Round trunk capsules on the spine joints miss the chest**: the spine lies near the back, the man's pecs stood 5 cm
  outside. Use per-joint elliptical sections offset forward (measured from the base mesh). Exempt the shoulder's
  end of the upper arm from the trunk test, or every arm raised in front of the chest gets shoved (a hand at the
  forehead lifted off it, a two-handed pistol grip spread apart).
- **An arm push that solves afresh each frame teleports** (the owner, frame by frame: the arm snapped round a thigh
  or knee): which obstacle is deepest, and which side of it the limb lies, change between frames. Keep each bone's
  push turn from the frame before, ease it back to the clip's by the clip's own time (the lab's frame steps set the
  time and update by 0, so a dt-based easing never relaxes there), push on from it, and limit how fast a push turns.
  A leg push of "the least move that clears" jumps when the knee lies inside the shoulder; use depth over how far
  the gap already points the push's way (with a floor), which fades to nothing as it clears.
- **A floor on the elbow angle makes arms rigid**: most frames of a gently moving idle sat under it, so the elbow
  stopped moving. Offset the whole arm's bend by what brings its least bend to a relaxed angle, fading with bend.
- **A clip's hand put on the head needs its orientation set, not only its fingertips**: rotating the clip's hand to
  aim the fingers left a claw with the wrist bent back. Set the palm toward the scalp, fingers back along it, and
  the wrist forward of the palm so the forearm arrives naturally.
- **Measure a stateful pass by playing, not by jumping to times**: with kept turns, sampling a clip at scattered
  times reports large differences that are only path dependence; compare poses played from the clip's start.
- **Do not turn knees out of the belly**: a sprint's raised knee and a crouch's thighs overlap a trunk capsule while
  the body is fine; only the owner's actual cases (knee in shoulder) warranted the leg push.
- **Joints a body carries unused** (the lower arms on a two-armed body) must be skipped by every pass that moves
  other limbs: here they pushed legs aside, and only the JS-to-Godot joint comparison showed it.
- Measure a pass's reach before calling it done: the joints of every clip at a few times on all six bodies, before and
  after (regressions showed in clips nobody flagged: idle 2, the pistol stances).
- **Baking a crowd's still poses** (`src/60-crowd.js`, 2026-10-20). A figure's pieces are SkinnedMeshes on r128
  materials with `skinning: true`, so they cannot simply be drawn as InstancedMeshes: bake each vertex through its
  bones (`SkinnedMesh.boneTransform`, after `skeleton.update()`) into a plain geometry, and give it vertex colours (its
  map sampled at the uv, times the material colour, which carries the skin tone, hair colour and dyes) so one Lambert
  material draws every look. Three traps: `fig.play()` cross-fades 0.25 s from the clip before, so a bake taken right
  after a play is a blend of two clips (stop the mixer and clear `fig.action` first); `traverseVisible` from a hidden
  group visits nothing (keep the baking figure visible, just off the scene); and a figure's `update(dt)` advances the
  clip by `dt * cadence`, so a frame at clip time t is `update(t / cadence)`.

## 7. Posture

- After retargeting, all figures leaned back at the mid-thoracic spine with their chests out, and the shoulders hunched.
- A spine pull-back made it worse (lordosis). What helped: bend the spine **forward** (about 22° in total on the
  woman, 30° on the man: Spine −6, Spine1 −8 to −12, Spine2 −8 to −12), let the neck take back about half so the head
  stays level, drop the shoulders about 9° and draw them back 10°, and keep the upper arms' world direction so aims
  still land.
- Apply the angles in the figure's frame (world X axis through the figure's orientation), not each bone's local axis.
- Five rounds of guessing angles from screenshots ended when the user got a Posture panel with Copy/Apply JSON. Build
  that kind of control first next time; keep the values in `data/posture.json`.
- **One posture for every clip is not enough**: the angles that make the idles right lift the chin in a walk (the
  clip already leans forward) and over-hunch a crouch. Give each clip a change of its own on top of the body's angles,
  kept as a difference so a later change to the body's angles still reaches it, blended through cross-fades.
- **Large pitches about the figure's axis kink a twisted torso sideways** (the man's ribs in idles 5, 13, 14, at
  Spine1 -40): pitch each joint about its parent's side axis as the clip turned it from rest. On an upright torso that
  is the same axis, so tuned numbers survive the change.
- **Not every chest fault is posture**: switch the pass off before blaming it. The man's nipple through the T-shirt
  showed with posture off too (a shirt-fit fault), only worse with a big shoulder drop.
- **A build.py reading text without `encoding='utf-8'`** decodes UTF-8 as cp1252 on Windows: the page's non-ASCII
  labels garble and every hash moves. Read bytes for hashes with `\r\n` made `\n` (a core.autocrlf checkout).

- **A clip that stands on the ball of a foot pitches the toes into the ground**, and a sandal's flat sole with them
  (it looked like a garment bug). After the clip, turn each toe joint up until a point ~6 cm ahead stays on the ground.

## 8. Props and hands

- Measure each body's hand frame at rest (palm normal, finger direction) and define grips in it.
- Two-handed holds are solved (a two-bone solve for the support hand), scaled by the body's size: constants in metres
  missed on the giant until multiplied by its scale.
- **Wrong hand** (lantern) → the hold names a hand per clip; check `hold` in the clip data before touching the prop.
- **Shield facing backward** → flip the prop's model, and check a low-hand variant separately.
- **A bucket or a lantern follows the forearm** (it is modelled hanging along the fingers) → give the prop the axis that
  should point down (`hang`) and turn it about the grip every frame so that axis points down; a bowl the same, up.
- **Bow loosing at different times on different bodies, and the arrow coming back after the shot** → the string and
  arrow were guessed from where the hand was (behind the bow, within a zone): long arms leave the zone early, and a
  hand passing behind the bow on the way down draws again. Take when the arrow is on the string from the clip, as
  spans of clip seconds read off the clip (hand speed and draw length over time), so all bodies loose at once.
- **Draw to the chin, cup to the lips, bite to the mouth** → one pass: a hand's point (grip frame) moved onto a point of
  the face (head-joint frame, turned with the head) by the arm's two-bone solve, the hand keeping its turn. Weight it
  by time spans, not by how near the clip brings the hand: Bow shot's draw is 20 cm above the head, and the reach to the
  quiver passes the face. Hold the weight to the loose and ease out after it, or the hand drifts off before the shot.
- **A symmetric prop's "upright" chosen one way only flipped it 140 degrees** (the bow held top limb down) → take the
  nearer of either end up.
- **A keep-out pass that starts afresh each frame flips sides**: Block 2's sword, pushed out of the head by turning the
  wrist, jumped across it between two frames (tip 40 m/s against the clip's 3). Start each frame from last frame's
  correction, easing back to the clip's: the push stays on the side it went round. Check by tip speed against the
  page before the change, over every clip that holds the prop.
- **A head keep-out that is only the skull misses**: the blade went through the neck and out of the upper back. Use the
  skull (with the hair), a taper down to the neck joint and the trunk's capsules, each widened by half the blade's width.
- **Two-handed parry's wrists crossed** because the left hand was put below the right on a sword whose clip holds the
  left above (toward the blade) → per clip `lead_left`: the prop slides up through the right hand, the left holds above.
- **One arrow for every body leaves its head behind the bow on long arms**: a full draw is about 1.5 times the arm
  (shoulder to wrist) on every body, so size the arrow to the arm (1.65 arms) and cap the draw a few centimetres short.
- **A two-hand grip that re-chooses its thumb side every frame flips** half a turn round the handle when the clip's hand
  passes square to it (Two-handed parry, 0.47 to 0.83 s on the man only): choose it at the hold's first frame, keep it
  for the clip. Test a hand's turn per frame, not only whether it reaches.
- **A bowl on a hanging arm goes through the forearm**: turning the palm up is not enough when the clip holds the arm
  down or back; put the wrist in front of the belly with the two-bone solve first. A cup held by the left grip frame
  can come out upside down: keep its mouth up with the wrist, except while it is at the lips.
- **Capsule keep-outs miss loose clothes**: the bow's limb cleared the leg capsules but went 5 cm into cargo trousers.
  Measure against the drawn mesh once (skin it with `boneTransform`), then widen the capsules by what it shows.
- **Bound a clip test to the clip**: a one-shot that ends goes back to the last loop, which may lack the clip's data
  (spans), so a check that runs past the end fails on the other clip.
- **Check the twin by numbers**: the Godot figure can run with no clothes from a scratch folder (skeleton/kit json, the
  data json, `anims.glb` and the props decoded from the published `.txt` pieces) and print the same measures as a page
  probe (grips and head relative to the hips, the pass weights) at the same clip times; they agreed to the millimetre.
- **Shots are minutes, not seconds, under SwiftShader**: headless Chromium renders on the GPU with `--use-angle=d3d11
  --ignore-gpu-blocklist --enable-gpu` (`tools/lab_shots.py --gpu`).

- **Headgear gets the shoulders' weights.** MakeHuman weights a garment from the nearest skin, so a broad brim, a wing
  or an ear flap reaching down beside the neck bends with the arms (a third of one headdress's weight was on them).
  Weight everything of a head item above the neck to the Head joint; leave a hood's cowl below it alone.

## 9. Body mods, giants and extra arms

- Extra arms as joints every skeleton carries, invisible and unweighted until a mod or a four-armed torso uses them.
  Better than swapping skeletons: clips, props and garments keep working.
- **Lower arms coming out at the waist** → root them on the lower ribs on any torso.
- **Rib gills sticking out as blades** → rays hit the A-posed arms; cast only against torso triangles.
- **Cyber arm gaps at the joints** → a dome at the joint sized to the farthest edge (1.03×), not a collar ring.
- **Lower sleeves on cybernetic arms** look wrong → leave them off; sleeve pieces keep only their own vertices.
- **Four-armed tops built before the lower ranges existed had no lower vertices** → regenerate after changing the rig.
- **Giant roots and ledges** → shrink-wrap to the body, hang at rest, blend by distance from the open edge.

## 10. Godot twin

- `Vector3` is float32: compare with 1e-6 tolerance.
- Animation track paths need the skeleton path plus the bone name.
- RELATIVE blend shapes are offsets: write deltas, not positions (the figure came out 10× too big).
- Building blend shapes in GDScript loops is too slow → precompute in Python (a binary per GLB).
- The headless dummy renderer has no blend shapes to read back → keep the base arrays yourself; use Xvfb when a test
  needs real rendering.
- Packed arrays are shared by reference: `duplicate(true)` before mutating (tangent arrays grew 200×).
- Type-inference parse errors make a script hang without quitting → explicit types.
- `get_shader_rid` is not exposed to scripts → write the garment shader as a resource.
- Tests that read the pose must step frames after changing a prop (arms settle over a few steps).
- **Port every runtime change to Godot the same day** and run its test; drift accumulates fast.
- **Compare the twins joint by joint**: a SceneTree script can `load_body` a figure from a data folder holding only
  the skeleton, kit and `pieces/<body>/anims.glb` (no meshes), set `_caps = KChar.colliders(...)`, step `_process`
  at 30 Hz, and write the joints relative to the hips; the page does the same with `f.update(1/30)` on a hidden
  figure. Within 0.2 mm on 28 clip/body cases is what a faithful port gives; anything larger is a real difference.
- **A variable name already used earlier in a GDScript function** (`tr`, `ru`) is a parse error that makes the whole
  class unresolvable ("Could not resolve class"), so every script using it fails: load the script alone to see why.

## 11. Publishing the pages

- A page over 16 MB will not publish → load pieces beside the page as files.
- `.glb` is not a served type → base64 text (gzipped) with a `.txt` extension.
- A page's file limit (512) → pack thumbnails into one atlas per body.
- **Never delete a published file an older loader still reads.** Deleting the separate `.morph.txt` files broke the
  short and tall bodies for the user (no morph data). Republish in the new format first, then remove the old files.
- Publish in batches under about 55 MB; diff the build manifest against the last published commit to send only
  changed pieces.
- A page-only change republishes just the page.
- **A version holds at most 256 MiB** (the Cosmetic Lab hit it at about 245 MB, 2026-10-19). New clothes then go in a lab
  of their own: the built page with `KCHAR_DATA`'s kit cut to the new peoples' items and the hair and beards they draw,
  the bodies, clips and props copied on the server from the main lab (`files: {path: {artifact, path}}`), the new
  pieces sent. Plan the split by people or body before that.
- **A fresh machine has none of the pieces** (gitignored), so a few new garments go through the partial path:
  `make_garments.py --only`, `mpfb_build.py --only`, `make_mpfb.py --merge` (the kit's other entries stay; the Godot
  base cover regions are not remade). The published thumbnail atlases can be cut back into cells, the new ones drawn
  (`thumbs.mjs` draws only what is here) and the atlas repacked. A local test of the page needs `base`, `anims` and
  the hair it draws fetched from the published lab; the default figure's other pieces 404 and the page carries on, but
  `window._kchar.ready` then never settles, so wait on `window._kchar` and a fixed time instead.

## 12. Tooling and the shell

- `pkill -f <pattern>` matches its own shell and kills it (exit 144) → kill by pid.
- Background render jobs get killed at the time limit → run in the foreground with `timeout`.
- `/usr/bin/time` may be missing → don't wrap Blender in it.
- A `sed` edit on a long line broke the code → use a Python replace with an `assert old in s`.
- Index and audit scripts can rewrite unrelated files → revert what you didn't mean to change before committing.
- A JSON file reformatted by a load-and-dump → insert the entry textually instead.
- A screenshot helper clicking a button that doesn't exist fails silently → check selectors first.
- Tests that race a page re-dressing → wait for the loading overlay to hide.
- **A pipeline reads each script when its step starts**, not when the run starts: an edit made mid-run may or may not
  be in it. Check the output for the change (the colliders in skeleton.json, a weight table) before judging shots.
- **Survey, don't spot-check.** One script that dresses every culture's outfits on the same body, holds the same clip
  moment after letting the cloth settle (~2 s), and shoots back and front into one grid found more than the reports
  did, and shows at a glance whether a shared fix helped everywhere.
- **The port lint warns on numeric defaults written with `||`** in `[G data]` fragments (`it.arms || 2`: a 0 passed
  becomes the default) → write `x == null ? N : x`; regenerate the golden and confirm it is unchanged.
