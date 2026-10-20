# core/charactermodels: known issues

- **The Cosmetic Lab is full.** A published version holds at most 256 MiB and the lab is at about 245; the Order of
  Historians' and Xanadu's clothes (`order_`, `xan_`, 2026-10-19) went into a lab of their own (README, Publishing the
  labs); since 2026-10-20 the main lab carries them too (its stale `.morph.txt` files removed), and the Order's own lab
  keeps the older page. The fix is to split the lab by people or by body (one page per body, sharing the code) before more clothes come.
- **Trousers under a mid-calf hem look thin.** Under a loose top that reaches below the knees (kit item `long`) the
  figure draws trousers in to 8 mm outside the legs' collision capsules (`50-figure.js` SQUEEZE, and the twin's shader),
  which are slimmer than the calves; under an ankle-length robe that is hidden, but below a hem at mid-calf the shins
  show thin (the owner, 2026-10-19, on Xanadu's jama, now cut to the ankle). A shorter top's squeeze already stops at
  its hem (kit item `hem`); a long one's could too, if the boots' squeeze (`kcSF`) followed it.
- **Merged garments hide no skin in Godot yet** (the Izani court robe and the grand boubous were merged on 2026-10-20). `make_mpfb.py --merge` (the Order's and Xanadu's clothes) packs the new
  items' own blend shapes but does not remake the base's cover regions (`base.gshapes.bin`): in the Godot twin the skin
  under them is still drawn (it is hidden on the page, which reads `hide` from kit.json). The next whole build
  (`mpfb_build.py` and `make_mpfb.py` on every item) fixes it.
- **The Godot twin blends normals linearly.** Its blend shapes carry each target's normals (NORMALIZED mode), so a
  reshaped body's normals turn, but as a weighted sum of the targets' turns, where the page re-sums them from the
  morphed faces: close, not exact, when many targets stack. Its skin is one surface of cover regions (the triangles the
  same items cover); the skin shader drops the regions worn items cover (`kchar_skin.gdshader`), one draw call. A
  region is all or nothing, as on the page. `godot/data/characters/pieces/` is about 700 MB of copies
  (`sync_core.py`, the shapes whole with their normals), gitignored.
- **Morphs blend linearly.** MakeHuman's macros are piecewise (its age, weight and height targets switch between
  combinations), and its race targets interact with them; a sum of deltas measured one at a time is close, not exact.
  Height's full ends overshoot (2.4 m and 1.3 m), so its slider reaches half way (`REACH` in make_mpfb.py).
- **Bone rotations do not follow the morph.** Joints move; their rest rotations stay the base's. The rest pose is
  exact; in motion a heavily reshaped limb bends about the base's axes.
- **Clips are retargeted** from Styv, Meshy's library and Quaternius's libraries: big build changes can push a hand
  into a hip in motion, and a clip made for a slight body can clip through a heavy one.
- **The work clips and the thrusts are made, not captured.** Neither library has hoeing, hammering at an anvil, a
  pickaxe or a straight thrust (Meshy's library checked again 2026-10-14: its one thrust stabs overhand; 'Spear Walk'
  holds the spear behind the back). Dig, Hammer at anvil, Thrust / stab and Spear thrust are procedural on one frame of
  the idle or the combat stance: the legs and hips hold still (no lunge, no step into the blow), the arms move by a
  two-bone solve (the elbows go where the solve puts them), and the beat is even. Dig swings a hoe overhead like a
  pick, not chopped short, with both hands before the face at the top of the lift. Confused Scratch and Sleep are
  Meshy's clips with a hand put where it gestures (`derive: hands`): the scratch's fingertips are placed on the skull
  ball, the fingers keep the clip's curl (they do not move to scratch), and Sleep's palms lie still on the belly and
  chest (the clip's breathing no longer moves them). Spear advance is Meshy's walk with the arms re-posed frame by frame, so its shoulders and
  spine still sway as the walk had them for the old grip. A crossbow shot still borrows the long-gun shot. Mixamo has
  most of these, but its clips can only be fetched by hand with an Adobe account.
- **The Izani court robe's orange front panel** still pokes through the robe or flares out in a walk (the robe chains'
  fold itself is fixed: 0 segments past 1.5 rad in the page and 0 bones in kchar_test.gd's walk). After the build-time
  settle (README, "Clothing fit."), the Voth noble robe's back hem band still breaks up over the skirt in places, and
  a few light-blue specks of the Hykkousoi tunic skirt show through the pteruges.
- **The posture fix is set by hand.** The spine is bent forward and the shoulders dropped and drawn back by angles per
  body, with changes per clip where one needs it (`data/posture.json`, set in the Animation Lab's Posture panel; README,
  Posture), the upper arms keeping the clip's direction. A clip with no change of its own takes the body's angles, so a
  clip that already stoops stoops further until it is given one. The cause, the retarget straightening MakeHuman's
  spinal curve (far more on the man than the woman), is not fixed in the retarget itself.
- **The man's left nipple shows through the plain T-shirt** in most idles (owner's review, 2026-10-20). It does so with
  the posture pass off too, so it is the shirt's fit, not posture; the man's 30 degree shoulder drop makes it worse.
- **Limbs are kept apart by capsules, not by the skin** (`bodyFix`, README). A limb is a segment with one radius
  (the upper arm's takes no account of the deltoid), so a forearm can still graze a thigh's side by a centimetre or
  two, and two thighs, a thigh and the belly, or a hand and the head are not tested at all. A knee clears an upper
  arm only by swinging out at the hip, by at most 20 degrees: where a clip drives the knee deep into the shoulder (the
  climb up a ledge at 0.25 s on the tall man, the crouching throw near 5 s) the arm still meets the thigh, and the
  swung leg reads wide from the front. The pushes move hands that rested where the clip put them: the hammer hand
  at the anvil sits a little further out on the short, broad woman.
- **The elbow limit is a fixed hinge.** `make_pieces.elbow_limit` reads the elbow's bend about an axis fixed in the
  upper arm at rest; an upper arm turned far on its own axis (an overhead wind-up) reads as a bend backwards, so
  readings past 45 degrees backwards are left alone, and the runtime passes (two-hand solve, `bodyFix`) can still
  open an elbow a few degrees past straight.
- **Props are simple, and the two-handed hold is solved, not animated.** Props are built from primitives, flat
  shaded. The left hand's grip on a two-handed prop comes from a two-bone solve over clips made for other weapons (or
  none): the arm reaches the handle, but the shoulder and torso stay where the clip has them, so a chop made for one
  hand can look cramped, and when the left arm falls short the right hand is pulled in (up to 45 cm), which narrows
  the clip's swing. The elbow keeps the clip's side, which is not always the natural one. The bow turns about its handle to
  face the drawing hand rather than the bow hand turning; the drawing hand's pinch is one fixed pose, and the arrow
  only shows while the string is pulled (there is no nocking motion). The supporting hand always closes in a fist.
- **The Voth clothing is generated, not tailored.** Each garment is lofted round the A-posed body and painted by
  script (`tools/make_garments.py`): no folds beyond the hang and flare, strips of texture with the library's fabric
  grain multiplied in (colour only: no normal or roughness map, so a weave does not catch the light), and the
  court outfits share one cut per body. Its hanging parts swing on spring-bone chains (README, Cloth), which are not
  cloth: no wrinkles, no self-collision, and layers are kept apart only at the chain points (a cape over a hem over
  a skirt, README). Between chains the cloth is interpolated; the GPU push (README, Clipping) keeps the legs and arms
  inside a loose garment, but it works on capsules, so a heavy thigh's front can still graze a tight skirt's top and
  a shoulder (no capsule) can show through a mantle in a full overhead reach. A chain point inside a limb leaves on
  the side of the point above it, so a seated lap or a raised arm is draped, but only points collide: a 20 cm segment
  whose two ends are clear can still cut through a knee's corner. In a deep crouch or on a seat, a long robe's layers
  can still show one through another for a frame or two where the chains swing. In a run, a long robe (the Order's,
  the court robes, the kimono) has its back pierced by the shin as the trailing leg kicks up, and for a frame a patch at
  the back of that hip can show: the push skips the back of a thigh's top third (the seat covers it at rest), and the
  seat capsules do not swing with the thigh. A narrow ankle-length skirt (the Order novice's wrap) cannot cover a thigh
  raised as high as a run's: at the top of the stride the leading thigh comes out of its side, cloth or no cloth (its
  fitted shape is a tube; the chains and the push move it, they do not make more of it).
- **Tall bodies tear long robes in a run.** The monk's robe (and the skirts now cut as it) holds in a run up to about
  +0.7 height (the owner, 2026-10-20); taller, the thigh is up to 29% longer (44 to 57 cm) and its raised knee goes out
  through the robe's side, and at +1 the walk and idle open small tears at the back of the thigh too. The push's capsules
  are not the cause (their radii stay within a few millimetres of the skin's at every height: tools/shots.py with
  `morph`); a 6 cm pad closes the run at +1 but tears the robe at the hips at height 0. A cut with more cloth for long
  legs, or a pad that grows with the leg's length, is the likely fix.
  The headgear (a wrap, a quetzal headdress) is rigid: the headdress's fan swings, its band does not.
- **The Izani clothing is generated too** (as the Voth, above): the hood is a stiff shell (no chains), the sun halo
  and the shoulder plate are rigid, pouches are simple solids, the boots are tubes (a toe shows a seam), and the hex
  of the Ancient plate is painted, not modelled. Each class has one cut per body.
- **The Beast Rider and Hykkousoi clothing is generated too.** Horns, quills, the Khalkha wings, the helmet's crest,
  the petasos brim and the shell collar are rigid (no chains); trophies and beads are small solids that ride the body;
  the deel's overlap is painted, not cut; the exomis bares the right shoulder but the rib-gills are not modelled. A
  wide brim or a tall crest can pass through a raised arm or a held prop.
- **The Dalab and Yuni clothing is generated too.** The mitre, its halo and the eye, the hyperboloid hat, the cone hat
  and the gele are rigid; the grand boubou is one stiff sheet over the arms (it swings at the hem but has no folds and
  does not part when an arm is raised); the mosaic and the mud-cloth are painted. A tall hat passes through anything
  held overhead.
- **The lower arms (the arm mods) are copies driven by rule, not animated.** The flesh pair is the upper pair's skin
  and joints copied lower (`tools/mods.py`), so its deltoids are the upper's; where the copy blends into the ribs a
  close look finds a soft crease, and an arm swung far back can show the blend. No clip was made for four arms: the
  lower pair keeps a guard and takes a share of the upper arms' motion (README, Body mods), so it never does anything
  of its own (it does not block with the shield it holds, take a two-handed grip, or reach for something). The scale
  slows a giant's clips to a giant's pace, but the clips are still a man's: a giant's weight does not show in them
  beyond that.
- **Replacement arms wear the top's own sleeves.** A library or culture top's sleeves are part of it, so on a body
  with replacement cybernetic arms they are drawn over the machine (the loader's bulk shows through them); only a
  four-armed top's lower sleeves come off (`bare`). The dome over each shoulder is a ball on the joint, wide enough to
  cover the edge of the hidden skin: a big round pauldron, which a sleeve or a high collar can cut into.
- **Four-armed tops exist only for the giants.** A man or a woman with an arm mod has no top that fits (`KCHAR.fits`)
  and goes bare-chested; the library's and the cultures' tops are two-armed. A four-armed top's lower sleeves are
  weighted to the lower arms, but their shape under the body sliders follows the skin MakeHuman fitted them to (the
  side of the ribs and the upper arm), so a very muscular or heavy giant's lower sleeves fit looser or tighter than
  his lower arms. A cybernetic pair leaves a four-armed top's lower sleeves off (the bare arms come out
  of the openings), so no cloth hides or clips them; a cybernetic body cannot wear lower sleeves.
- **The cybernetic arms are hard-surface parts on rigid bones, flat-shaded and untextured.** Each part is a
  prism, a box or a ball on one bone; the joint balls are wide enough that a bend shows ball, not a gap, but a
  bend past about 120 degrees can push a plate's corner through the next one. A ram runs along its own segment (it
  does not span the joint it would drive). The colours are flat until the textures in `core/materials/PLAN.md`
  ("Characters: cybernetic arms and the giants' metal") are delivered.
- **Rib gills are painted slits on a lip, not openings.** They are lit as skin, do not move with breath, and a top
  hides them.
- **A people's clothes are tagged with its culture** (`culture` in the kit, by prefix: Voth `chichani`, Izani `izani`, Beast Riders, Hykkousoi, Dalab, Yuni): a random
  stranger of another people never draws them. The Cosmetic Lab's pickers show one wardrobe at a time (a people's, the
  library's, or all), but nothing stops a Voth body in Yuni clothes: that is the editor's freedom, not a rule.
- **Skin shows through where an item's cover is approximate.** Items with no MakeHuman delete group (polo, fisherman
  sweater, cargo trousers, tiered skirt, flats) hide skin by a ray test; a skirt's cover is deliberately small, so
  the thighs under it show from below, and arms raised high pull a sweater's front off bare skin. The waistband tuck
  works above the hips only: a short tee over jeans in a deep crouch can still show denim at its hem.
- **Download size.** Pieces are served gzipped as base64 text (the page unzips them with the browser's
  DecompressionStream), one file per item (its GLB and its morph deltas), fetched per item as needed. A published
  artifact holds at most 512 files: both bodies' items now take about 230 of them, so there is room for the remaining
  peoples but not for a third body without bundling further. The two densest shoes (flats, pirate boots) are cut to a
  tenth of their triangles (`tools/decimate.py`); the heaviest pieces left are the braided and dreadlocked hair and
  the full beards, whose strand cards a decimation would tear.
- **The peoples are mostly proposals.** Only the Chichani and the Beast Riders come from the owner; the others
  follow LORE.md's real-world references.
- **Ancestry is MakeHuman's three reference sets** (African, Asian, Caucasian). It moves face and build only; the
  skin tone is its own setting, so a people can pair any face with any tone (the Chichani, the Dalabites' green).
