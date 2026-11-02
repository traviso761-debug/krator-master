# kits/fauna: the Meshy upgrade pass (review and plan, 2026-11-01)

Branch `claude/fauna-meshy`, forked from `claude/biome-rebuild` at e8c5cf937. No credits have been spent. The gate of section 4 is
built (`tests/test-models.js`), and two faults in the shipped models are fixed: the dragonfly's wings (F14) and the lost anchors
(F9). The numbers come from the 19 packed models; `node kits/fauna/tests/test-models.js --report` prints them.

## 1. The short version

**The owner's read holds, and the numbers show why.** Rigid parts are the true model of an exoskeleton and a false one of
skin. An arthropod's joints are hard overlaps, so a part that turns stays nested in its neighbour. Anything with skin across a
join, a bat's wing or a cow's neck, is cut through that skin, and some pose opens the cut.

- **Arthropods go first, on this pipeline.** The dragonfly and the millipede are 2 of only 3 models that stay shut in every clip.
- **The membrane flyers stay out of this pass.** Re-running the bat, quetzal or archaeopteryx here repeats the failure. They
  need skinning, a different project.
- **Insect wings are never cut from the Meshy body.** The dragonfly's body stays shut because its wings were thrown away and
  replaced by flat cards on their own pivots. That is the rule for every winged insect.
- **A new model has no waiver.** It clears every limit, or it does not ship. The 19 old models are held at what they measure now
  and may only improve.

## 2. What was measured

The closure render (C4) draws every clip from 14 sides and looks for the inside of a body: a back face of a trunk part, seen from
outside. The score is the largest such patch at the worst frame, as a share of the body's broadest view.

| Model | Closure | Worst clip | Where it opens |
|---|---|---|---|
| `draught-millipede` | **0.2%** | walk | slits between the leg roots, under the body |
| `giant-dragonfly` | **0.9%** | walk | shut |
| `hen` | **0.9%** | walk | shut |
| *limit* | *1.5%* | | |
| `water-buffalo` | 1.7% | walk | |
| `pig`, `sheep`, `goat` | 2.1 to 2.6% | graze | the neck, when the head drops |
| `giant-archaeopteryx` | 2.6% | flap | the shoulder |
| `dog`, `duck`, `cow` | 3.0% | graze | the neck |
| `yak` | 3.6% | graze | the neck |
| `giant-bat` | 3.9% | walk | the shoulders |
| `bison`, `cat`, `dalab-lizard` | 4.0 to 4.2% | graze, walk | the neck; the leg roots |
| `ox`, `horse` | 5.0 to 6.0% | walk | the belly and the leg roots |
| `quetzalcoatlus` | **8.9%** | flap | the shoulder |

**At rest every model reads under the limit.** That is why each fix looked sound when it was made. It is also why no one saw that
the quadrupeds share the flyers' fault: the head-down graze and the walk open them too, less badly. An earlier version of this
review measured open edges and could not explain the cow; the render did, so that measure was dropped.

Other figures from the same 19 models:

| Measure | Result |
|---|---|
| Triangles | 7.3k to 12.2k; the kit's budget is 9k, raised to 14k for these models. The flyers and millipede are all 12k, the dragonfly 8.5k |
| Size | 0.5 to 1.4 MB each |
| Draw calls | one per part, so 52 a millipede and 20 a dragonfly, doubled by shadows |
| Texture sharpness | 91 to 105 px/m on the millipede, archaeopteryx and bat; 1,300+ on the hen, duck and cat. The largest animals, the ones ridden, are the blurriest |
| Foot slide | 0 to 3%, but **16.5% on the millipede** (accepted; its README says 18%) |
| Broken limbs | **19 of the millipede's 34 legs are more than one piece**, 3 of them split badly (a second piece over 15% of the leg). 7 other models have 1 or 2 split limb parts |
| Thin legs | the yak's smallest leg part is 14 triangles, the hen's 26, the bison's 28 |
| Metalness | near 0 everywhere, so no plastic shine from that |

**The look, from the sheet at idle.** The Meshy millipede and bat are far richer than their procedural versions in surface and
form, and with its wings fixed the dragonfly is too. The surface gain is real, which is why the pass is worth doing.

## 3. Failure modes

| # | Failure | Evidence | Prevented by |
|---|---|---|---|
| F1 | **Wings do not articulate** (owner). Rigid wing parts cannot gather, so folding is faked by shortening the wing | `fold_scale`, `fold_chord` in `fbuild.py`; `KNOWN_ISSUES.md` | scope (section 1), C4 |
| F2 | **Bodies open up after fixes** (owner). Each patch was judged in one pose and traded one hole for another | section 2; the bat alone carries `back_squash`, `back_prune`, `torso_trim`, `shelf`, `head_spikes`; the quetzal has `midsheet` and `sheet_cap` | C4, C5 |
| F3 | **Every cut is by hand.** Part boundaries are per-model coordinates tuned by eye, so each new animal is new work and each fix is a new flag | `fcfg.py`, `CFG` in `qmodel.py`, the 17 hand-typed `SEGZ` in `milli_build.py` | C3, C6 |
| F4 | **The generator gets anatomy wrong.** The dragonfly came with three wing pairs, some fused, cut away by angle | `dragonfly_parts.py` step 1 | C2 |
| F5 | **Decimation breaks thin limbs.** Insects are mostly thin limbs | section 2 | C2, C3, smart topology (section 5) |
| F6 | **Foot slide waived for one animal** with no limit written down | millipede, section 2 | C7 |
| F7 | **The checks do not run.** `rig/verify_*.py` are in no CI step and need GLBs that no longer exist. `verify.py` counts only parts and legs on a model | `tools/test_all.py`; `verify.py:45` | C1, C10 |
| F8 | **Nothing can be regenerated.** The raw GLBs, prompts, task ids and reference art were not kept, and the scripts carry one session's paths. The Meshy account now lists no text-to-3D tasks and only eight image tasks, none of them fauna | `rig/README.md`; `meshy_list_tasks` | C1 |
| F9 | **A model variant loses what the kit promises.** **Anchors fixed** (`rig/fit_anchors.js`: each fitted to the model's own body, with `userData.anchorOn` for tack that rides a moving part). Still open: breeds and `pose: 'fly'` are ignored; one model is one colour | `krator-fauna-runtime.js` | C8 |
| F10 | **Too heavy to herd.** Fine for one, wrong for ants | section 2; `KNOWN_ISSUES.md` | scope by size (section 5), C9 |
| F11 | **Maps lose quality and match no one.** The 19 shipped normal maps are JPEG at 84, against the kit-wide lossless rule (`models_pack.py` now writes lossless WebP, but these cannot be repacked: F8). Baked maps are not library sets and do not take the kit's tint | `models_pack.py` | C9, C11 |
| F12 | **Left and right disagree** between rigs and the kit, handled by a rename and `--truthful-sides` | `models_pack.py` | C8 |
| F13 | **Godot never sees them.** No Godot code reads `models/` | search of `godot/` | C10 records it; the port is its own work |
| F14 | **The pack dropped materials. Fixed.** `dragonfly_rig.py` made a see-through wing material, but `models_pack.py` kept `materials[0]` only, so the wing cards drew the whole body atlas, opaque, as near-black planks. It shipped that way from the first commit, and no check or note caught it. The pack now keeps every material, the runtime builds them (`M.mats`), and `rig/patch_models.py` restored the dragonfly's wing from `wing.dragonfly` | wing UV area 4.17 against about 0.5 elsewhere; seen on the sheet | C8, C11 |
| F16 | **A model variant's fallback was never tested.** In a bundle without models a variant draws its procedural build. The bison's variant 3 was all NaN there (its size table stopped at 3 entries), so it vanished. Fixed; the kit's verify always runs with models, so only the new test sees this | `krator-fauna-farm.js` | C8 |
| F15 | **Shape drifts from the animal.** The Meshy millipede is broad and flat, closer to a trilobite or woodlouse than the procedural millipedes, and has 34 legs where the entry says 26. It looks far better, but it is a different animal | the sheet; `modelData` overrides `legs` | spec and C2, C11 |

## 4. The checks

`tests/test-models.js` runs on every push, like every `kits/*/tests/test-*.js`, in about 20 seconds. It reads the packed JSON, so it
needs no source GLB, and `tests/models-lib.js` poses and rasterizes in plain JavaScript, so it needs no GPU or browser. Every check
has a negative on a damaged copy of the dragonfly, and the three flyers must read over the C4 limit.

**Shipped models** are held by `tests/models-waivers.json`. A waived number may only improve, by more than rounding, and a waiver
no longer needed fails until it is removed, so the list can only shrink. `--write-waivers` regenerates it: run that only on purpose.
**A new model gets no row.** `--png <dir>` draws each model's worst view, magenta where you look inside; `--report` prints the table.

| Check | State | What it asserts | Limit |
|---|---|---|---|
| C1 Source record | **built**, in `models_pack.py` and the test | `rig/sources/<key>/source.json` names the prompt, Meshy task ids, model, credits and raw GLB. The pack refuses without it and stores the GLB's hash | required |
| C2 Anatomy intake | **not built** | leg tips, wing pairs and segments of the raw GLB equal the animal's spec; left and right mirror; limbs clear of each other. Needs a raw GLB to test on, so it comes with the pilot, before any refine is paid for | exact counts |
| C3 Cut sanity | **built** | every limb part is one piece; L and R partners match | 0 split parts; 1.5 times |
| C4 Stays shut | **built** | the closure render of section 2: every clip, 7 frames, 14 views, at 240 px | 1.5% |
| C5 Fix discipline | **built in** | a change to a cut flag re-runs C4 on every clip; it cannot judge one pose | |
| C6 Joints nest | **built** | each child part's pivot sits on its parent | 6% of the longest side |
| C7 Motion | **built** | foot slide and floor depth over the walk. Not yet: each foot lifts in swing, no limb through the body | 3%; 0.5% of height |
| C8 Contract | **built** | legs, clips and budget against the entry; **every anchor of the procedural build present and on the body**; no part filling the atlas (a lost material); L on +x; the procedural fallback has no NaN | exact; 5% of the longest side |
| C9 Cost | **built** | file size, parts, lossless normals, texture density | 1.5 MB; 25 parts; 150 px/m |
| C10 CI | **built** | in `test_all.py`'s node tests, on every push. Godot still reads no model (F13) | fails the build |
| C11 Look | **by hand** | a sheet beside the procedural animal at 3, 15 and 60 m, by day and night. The owner signs off | owner |

## 5. How the process should change

- **Spec first.** Each animal gets a short spec (legs, wing pairs, segments, length, a neutral pose with limbs apart, abdomen
  clear) before any credit is spent, and C2 tests the result against it.
- **Try smart topology.** Meshy now offers `meshy-t2`, which targets a face count directly and separates parts. That could
  retire the one-pass decimation behind F5 and much of F3. Untested here; the pilot decides.
- **Wings as cards,** from the library (`wing.dragonfly` exists; the moth, butterfly and hornet need sets, to be listed in
  `core/materials/PROMPTS-NEEDED.md`).
- **Scope by size.**

| Body length | Treatment |
|---|---|
| over 1 m, seen alone or ridden | Meshy model, per this plan |
| 0.1 to 1 m, in numbers | one Meshy model baked to an instanced mesh with a shader wing or leg cycle, not a part tree |
| under 0.1 m, or clouds | no model: the existing instanced or sprite swarms (`BIO.animMat`, `ATMOS.fireflies`) |

- **Keep the procedural animal.** Models stay opt-in variants, so a bundle without them still draws the animal.
- **Budget.** The account holds 4,506 credits, so credits are no longer the limit (6 at the last pass). A model costs 15 to 30
  credits plus 3 to 12 for a reference image.

## 6. Insectoids in the kit

**21 animals**: 17 insects, 2 arachnids, 1 myriapod and 1 crustacean. Triangles are the procedural build's first variant.
Only two have Meshy models. In the fit column, "wings" means a body model plus cards.

| Key | Animal | Length m | Tris | Biomes | Ridden or worked | Meshy fit |
|---|---|---|---|---|---|---|
| `silt-strider` | Silt strider (Voth's **elephant bug**) | 25 | 7,552 | swbay | ridden, draught | high: a hero, seen close |
| `giant-beetle` | Giant beetle | 3.6 | 6,012 | swbay | draught | high: best first case |
| `staghorn-beetle` | Staghorn beetle | 2.6 | 7,004 | swbay, crater-drylands, hyperjungle | ridden, draught | high: best first case |
| `lattice-mantis` | Lattice mantis | 1.6 | 4,324 | hyperjungle | | high; thin limbs |
| `harvester-ant` | Harvester ant | 1.5 | 2,856 | hyperjungle | | high; instanced once it herds |
| `stilt-walkingstick` | Stilt walkingstick | 2.0 | 2,224 | hyperjungle | | medium: all thin limbs (F5) |
| `horned-scarab` | Horned scarab | 1.2 | 3,332 | hyperjungle | | high |
| `leaf-katydid` | Leaf katydid | 1.7 | 2,576 | hyperjungle | | medium: wings as leaves |
| `giant-caterpillar` | Giant caterpillar | 1.7 | 5,064 | hyperjungle | | high: soft, but segmented |
| `emperor-hornet` | Emperor hornet | 1.4 | 3,501 | hyperjungle | | high, wings |
| `giant-honeybee` | Giant honeybee | 1.0 | 3,136 | hyperjungle, swlowlands | kept | high, wings |
| `atlas-moth` | Atlas moth | 1.0 | 3,564 | hyperjungle | | wings are nearly all of it: cards, furred body only |
| `jungle-butterfly` | Jungle butterfly | 0.45 | 6,540 | hyperjungle | | low: cards; instanced in the biome |
| `cap-moth` | Cap moth | 0.42 | 2,822 | swbay | | low: instanced in the biome |
| `lantern-fly` | Lantern-fly | 0.33 | 2,250 | hyperjungle | | low: instanced |
| `bloom-glint` | Bloom glint | 0.05 | 1,104 | swbay, nwbay | | none: Points in the biomes |
| `giant-dragonfly` | Giant dragonfly | 6.9 | 1,734 | hyperjungle | ridden | **has a model.** Texture density 128 px/m, under the floor |
| `giant-spider` | Giant riding spider | 6.6 | 5,636 | hyperjungle | ridden | high: thin legs, hero |
| `gilded-orb-spider` | Gilded orb spider | 1.4 | 3,052 | hyperjungle | | high |
| `draught-millipede` | Draught millipede | 7.3 | 6,476 | hyperjungle, crater-drylands | ridden, draught | **has a model.** Redo the legs and the walk (F5, F6) |
| `giant-brine-crab` | Giant brine crab (arthropod, not insectoid) | 1.8 | 2,352 | eastabyss | | high |

**Not counted, on the owner's ruling of 2026-10-13.** The six-limbed beasts on `faWdHex`'s `amb` anatomy are not insects
(dune runner, scytheback, burden beast, the gliders and the rest), and neither is the ash runner (scales). Four keep chitin
yield notes that contradict that ruling: `dune-runner` ("a long-legged beetle's plates"), `cinder-crawler`, `scytheback`,
`barbed-ravager`.

## 7. Insectoids proposed by biomes, not built

Checked against the rebuild branch, Gemini's `gemini-loom-chasms` and `claude/biome-plans`. "Fit" uses section 5's sizes;
none of these have a stated size unless given.

| Animal | Biome and source | State | Fit |
|---|---|---|---|
| **Bowl mantis** | sedesert, `PLAN-BOWL.md` section 6, `KNOWN_ISSUES.md`; `LORE.md` 6.2: the region's large predator, an ambush hunter coloured like salt scrub | named, the town is named for it | **model; top of the list** |
| Salt beetles | sedesert, `PLAN-BOWL.md` section 6 | named, on the crust | instanced |
| Brine flies | sedesert `PLAN-BOWL.md`, catch `KNOWN_ISSUES.md` | named, clouds at the shore | swarm |
| Char beetles | crater-drylands `KNOWN_ISSUES.md`: "breed in fresh char" | named | instanced |
| Glass-tower moth and its larva | ehighlands `NOTES.md`, `KNOWN_ISSUES.md`; hyperjungle `PLAN-LANDS.md` (the same moth on the glass wand): the source of pallidine and wormwick | named; matters to the economy | instanced, or swarm |
| Tower bees | ehighlands `NOTES.md`: the mad-honey bees | comb drawn (`60-biome-ehigh-floor.js`), no bee | swarm |
| Roaches | throne `NOTES.md`, `KNOWN_ISSUES.md`: everywhere, with rats | named | instanced |
| Clay ants | abyssal-savannah `PLAN.md`: builders of the spire mounds | named; planned station | swarm; reuse `harvester-ant`? |
| Termites | hyperjungle, nwlowlands, crater-drylands, swbay, rift, ringisles | mounds drawn, no insects anywhere | swarm, or none |
| Boring beetles | hyperjungle `PLAN-LANDS.md`: they bore the screaming hyperbamboo | named | instanced, or holes only |
| Miombo caterpillars | hyperjungle `PLAN-LANDS.md` (`rustmiombo`, `savannarim`), shared with Godstep: a food record | proposed | instanced, or a record only |
| Fog moths, glow flies | outlands `PLAN.md` section 7: "a native small layer" | named | swarm |
| Unnamed insect of the bead cone | swhighlands `PLAN.md`: gold eggs, "an insect's nursery" | eggs drawn, adult unnamed | owner to name |
| Insects over the lakes | riftrim `PLAN.md` | unnamed | swarm |

**Spider Lake** (`biomes/spiderlake/PLAN.md`) is the largest single source. It exists only on `gemini-loom-chasms` and is a
plan, with no kit yet.

| Animal | Note | Fit |
|---|---|---|
| Krator Silk-Weaver, matriarch caste | large, deep-amber abdomen, stays in the brood-pavilion | model |
| Silk-Weaver, riggers and span-workers | long-legged outer-sheet spiders | model, baked to instanced: colonies of 20,000 to 250,000 |
| Silk-Weaver, packers and nurses | smaller, swarm prey in groups of 30 to 100 | instanced |
| Ballooning spiderlings | drift on gossamer | swarm |
| Giant lake-flies, giant burrowing mayflies | prey of the colonies | model or instanced, wings |
| Lake midges (the "lake-smoke") | pillars 300 m high at dawn and dusk | swarm: a shader effect |
| Caddisflies | with the midges | swarm |
| Trapdoor spiders, funnel-web spiders | solitary, on the upland bluffs | instanced, or one model |

**Lore, not a biome plan:** horse-sized centipedes in the hyperjungle (`LORE.md`, the central crater). No kit entry, and a
natural predator partner for the millipede. The kit's own note on the Rift stalker also names "moth-things" as its prey.

**Already covered, so not gaps:** the comb tree's giant bees (`giant-honeybee`), the hyperjungle lands' staghorns,
longcrawlers, spiders, dragonflies and mantis, the necanyons pitchers' prey, and necanyons' fireflies (`ATMOS.fireflies`).

**Mentioned only, no animal needed:** the scale insects behind tamarisk manna (Bowl, Catch), Xanadu's midges and the bees and
moths in harvest notes.

**Ruled out:** Siphon Pits' fauna (the owner's brief: "NOT insects"), and the outlands' `plaingrazer` (`amb`).

## 8. Open questions for the owner

- **`nurser`** (outlands `PLAN.md`): it tends egg chambers in pod towers, and the towers give "grub-bread". Hexapod rulings
  say not an insect, but the plan never says so for this one.
- **Termites:** do the mounds need visible insects at all?
- **Spider Lake** is a plan on Gemini's branch: model for it now, or wait for the kit?

## 9. Order of work

1. ~~Build the gate and the negatives; calibrate C4.~~ Done: the cow's reading was real.
2. ~~Fix the wing material (F14) and the anchors (F9).~~ Done, with the bison's fallback (F16).
3. Pilot three, each testing something different: **staghorn beetle** (hard shell, ridden), **harvester ant** (thin legs and
   the waist), **Bowl mantis** (a new animal, thin limbs), through smart topology and Meshy 7.1 for comparison. About 150
   credits. Build C2 on their raw GLBs, write `rig/sources/` for each, and add the raw GLBs to LFS in `.gitattributes`. The owner
   judges them at C11.
4. If they pass, the rest of the large list in section 6, then the new species.
5. Instanced bake for ants, roaches and the Silk-Weaver workers, as a separate step.
6. The quadrupeds' necks and leg roots (C4) are now measured. Their joints can be deepened by a rig pass only with the source GLBs,
   which are gone (F8), so fixing them means regenerating: a separate decision, not part of this pass.
