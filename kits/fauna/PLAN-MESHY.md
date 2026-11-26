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
| C2 Anatomy intake | **built** (`rig/intake.js`, by hand, not in CI) | feet on the ground against the spec, how far the body mirrors itself, loose pieces, on any generator's GLB. `rig/sheet.py` draws the views a person judges: the numbers miss what the eye catches (see section 10) | feet exact; mirror under 1% |
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
| `staghorn-beetle` | Staghorn beetle | 2.6 | 7,004 | swbay, crater-drylands, hyperjungle | ridden, draught | **has a model** (#4) |
| `lattice-mantis` | Lattice mantis | 1.6 | 4,324 | hyperjungle | | high; thin limbs |
| `harvester-ant` | Harvester ant | 1.5 | 2,856 | hyperjungle | | **has a model** (#3); instanced once it herds |
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
| ~~Bowl mantis~~ | sedesert, `PLAN-BOWL.md` section 6, `KNOWN_ISSUES.md`; `LORE.md` 6.2: the region's large predator, an ambush hunter coloured like salt scrub | **built 2026-11-02**, `bowl-mantis`, procedural and Meshy; the sedesert page does not bundle it yet | done |
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
3. ~~Pilot the staghorn beetle, harvester ant and Bowl mantis.~~ Done: Meshy 7.1, in the kit (section 10). The owner judges them at C11.
4. If they pass, the rest of the large list in section 6, then the new species.
5. Instanced bake for ants, roaches and the Silk-Weaver workers, as a separate step.
6. The quadrupeds' necks and leg roots (C4) are now measured. Their joints can be deepened by a rig pass only with the source GLBs,
   which are gone (F8), so fixing them means regenerating: a separate decision, not part of this pass.

## 10. The generator test (2026-11-01)

Three animals (`harvester-ant`, `staghorn-beetle`, `bowl-mantis`), one set of front, left and back views from Meshy's multi-view image step, cleaned by
`rig/prep_refs.py`. Sources, raw GLBs and a sheet per animal are in `rig/sources/<key>/`. Geometry and texture only: nothing here has been cut, rigged or
put through `tests/test-models.js`. Meshy 7.1 and Hunyuan, Rodin and TRELLIS took all three views; Meshy T2 takes one (`left.png`). T2.5 was not tried:
the connector does not offer it. Tripo was not tried: it needs its own key.

| Generator | Each model | Triangles | Ant | Beetle | Mantis | Verdict |
|---|---|---|---|---|---|---|
| **Meshy 7.1** | 30 credits | 547k to 713k | right | right, branched antlers | right, wing veins | best surface and shape on all three; must come down to 12k, the step that broke thin limbs before (F5) |
| **Rodin** (fal) | $0.40 | 35k to 37k | right, a pale smear on the head | right, the glossiest shell | right, clean, true colour | close second, with far less to reduce; 5 of 6 beetle feet at the ground line |
| **Hunyuan** (fal) | $0.48 | 40k | right, washed out | blunt, flat colour | colour wrong (grey), white flecks at the tail | shape fair, texture weakest of the three good ones; no normal or roughness map |
| **Meshy T2** | 15 credits | 13k | **cleanest**: 22 separate parts | antlers lost their branches, body too long | **failed**: legs missing, forelegs a wire frame | one view is not enough; the ant shows what part separation could do |
| **TRELLIS** (fal) | $0.02 | 6k to 14k | **failed**: a flat plate through the body | blobby legs, stubby antlers | **failed**: four antennae, broken forelegs | not good enough, even at this price |

Spent: 171 Meshy credits (36 on four reference sets, one redone; 135 on six models) and about $2.70 on fal, by its list prices.

**What the numbers missed.** `rig/intake.js` gave T2's ant 22 pieces and 81% "debris": that is its best feature here, separate parts for a rigid rig. It gave TRELLIS's mantis
4 of 4 feet and a good mirror score, with four antennae. Feet and mirror catch a lost leg (T2's mantis, 2 of 4) and little else, so the sheet stays part of the gate.

**Reference views decide the result.** Meshy's multi-view step gave the beetle two identical top-down views on the first try, and the left view of an animal shows only one side of it. A
reference set is checked by eye before anything is spent on 3D.

**Through the gate: the ant, 2026-11-01.** Both candidates went through `rig/arthro.py`, `models_pack.py` and `rig/fit_anchors.js` to `node tests/test-models.js --candidate`, and **both pass every limit with no
waiver**, the first models to do so (`rig/sources/harvester-ant/sheet-rigged.png`). They are candidates: `pack-*.json` sit in `rig/sources/`, not in `models/`, and no entry names them.

| | Meshy 7.1 | Rodin |
|---|---|---|
| Triangles, parts, size | 8,840, 21, 1.05 MB | 8,964, 21, 0.69 MB |
| Closure (limit 1.5%) | 0.05% | 0% |
| Foot slide (limit 3%) | 0.09% | 0.07% |
| Texture density (floor 150 px/m) | 561 px/m | 399 px/m |
| Metal map, share over 0.5 | 0% | 2% |
| By eye | natural chitin, eye and mandibles hold up at the reduced count | clean shape, silvery patches on head and abdomen |

Why it worked where the old rigs did not: the cut comes from the shape (F3), legs keep their own triangle budget (F5), and capped cuts leave no hole for a pose to open (F2). The 577k Meshy mesh lost nothing a leg needed. Two
faults the gate caught on the way: reduced normals sampled from the original looked faceted, and cap fans stretched across the whole atlas (the corrected "parts filling the atlas" check found it).

**The harder two, 2026-11-02.** Meshy 7.1 only, on the same script. All three now pass every limit with no waiver (`rig/sources/<key>/sheet-rigged.png`).

| | Ant | Beetle | Mantis |
|---|---|---|---|
| Triangles, parts, size | 8,812, 21, 1.05 MB | 8,892, 21, 1.19 MB | 8,612, 17, 1.46 MB |
| Closure (limit 1.5%) | 0.04% | 0% | 0.08% |
| Foot slide (limit 3%) | 0.09% | 1.2% | 0.8% |
| Texture density (floor 150 px/m) | 566 px/m | 185 px/m | 258 px/m |
| Length used | 1.5 m body | 4.0 m with antlers | 2.4 m, **chosen here** |

What the hard cases cost the script, and what they say about it:

- **It is not free of per-animal settings.** The ant and beetle needed none beyond the spec's counts. The mantis needed two by hand in its spec: `strip`, how wide the midline must be to clear its chest, and a `budget` that moves triangles to the forelegs. The cliff in `arthro.py` picked a width that left chest in the arms. Expect a hand setting per unusual body plan, not per animal.
- **Thin limbs still fail on a small budget.** At about 240 triangles a segment the mantis's spines became black shards. At 1,350 a foreleg they read. The rule is budget by what makes the animal, and a spec should say so.
- **A mantis's forelegs are one rigid part each,** so it cannot strike yet: there is no clip and no joint. Its walk is on four legs with the forelegs still. A strike needs those joints back, and the spines kept across the cut.
- **Necks are measured along the trunk's own axis,** about each station's middle, because a beetle stands nose up and a mantis curves. A straight fit cut the wing cases in two.
- **Legs may hang from the abdomen,** so it holds still in the walk: its sway slid the beetle's feet 14%.

Still rough, by eye: thin white flecks at the mantis's neck and chest where a cap shows through; the foreleg spines and tarsus chains are coarser than the raw model's; the beetle's texture is the softest of the three, 185 px/m at its 4 m length, close to the floor.

**In the kit, 2026-11-02.** All three are model variants: `harvester-ant` #3, `staghorn-beetle` #4 and the new `bowl-mantis` #1, whose procedural form is the lattice mantis's builder at 1.4 times its size. Beside their procedural versions on the kit's own page (`rig/sources/sheet-kit.png`) the gain is plain. The audit's two gaps are closed: `tests/test-models.js` builds every model through `KratorFauna.build()`, and `models_pack.py` refuses a mesh of two primitives (`tools/tests/test_models_pack.py`). The mantis was scaled from 3.4 m tall to 2.4 m.

Not yet checked: the owner's sign-off (C11); C7's foot-lift and limb-through-body checks are not built; the Rodin ant predates the last script changes; no saddle has been tried on the staghorn; the pages that bundle the kit are not rebuilt (`TODO.md`).

**Lessons for the next run.** Python's `urllib` cannot verify fal's file host here: `rig/fal_gen.py` downloads with `curl`, and a run whose file did not arrive is fetched again by request id,
unpaid. The harness's `--use-gl=swiftshader` lost its WebGL context in `rig/sheet.py`; `--use-angle=d3d11` works on this machine.

## 11. Families: one file of parts, many species (2026-11-02)

The owner's proposal: a recolourable model with swappable parts. It works, and it is the cheapest way to more species. `rig/family.py <family>` merges rigged models into
`models/<family>.json` from `rig/families/<family>.json`; a species is a named pick of a body (thorax, legs, clips), the swapped parts, eyes, three tints and a scale. A catalog
variant names it `spider#gilded`, and `KF.pickModel` turns a pick into an ordinary model, so the gate tests every pick by itself (`share` divides the file's size among them).

| Family | Sources | Species | File | Each |
|---|---|---|---|---|
| spider | queen (long legs), tarantula (stout legs), orb and marked (abdomen and jaws only) | 9 | 2.9 MB | 0.32 MB |
| beetle | horned scarab, ground beetle | 10 | 1.55 MB | 0.16 MB |

A lone model costs about 1.2 MB. New entries: `silk-weaver` (three castes), `trapdoor-spider`, `funnel-web-spider`, `salt-beetle`, `char-beetle`, `boring-beetle`; model variants on
`gilded-orb-spider`, `giant-spider`, `giant-beetle` and `horned-scarab`. Each has a procedural fallback for a bundle without the models. Spider Lake's are tagged `spiderlake`, a biome that
exists only on `gemini-loom-chasms`.

**What swapping asked of the rig.** All of it was found by eye or by the gate, and none of it is optional:

- **Joints at the middle of the cut, on the midline.** The closest pair of points can lie to one side, and the owner saw another spider's jaws sit off centre.
- **Every leg hangs from the chest,** never the abdomen, or changing the abdomen moves the leg.
- **A spider's waist is the section-area valley between abdomen and chest,** on the line from the hips to the abdomen's tip. A slice along the body fails: the abdomen sits up over the back.
- **Which end is the head:** a spider's is the end its legs come from, not the end nearest what rises highest.
- **A rear leg that starts under the belly gets the femur of the leg in front,** fitted from chest to true knee, and the scraps of its own go. The first tries (stretching the femur, and taking
  the loose stub back) showed as a seam at that joint and as shards.
- **Tints are sRGB:** `convertSRGBToLinear`, or every colour reads pale.
- **Fur modelled as spikes** turns to shards when decimated: spec `defur` smooths it out before cutting. The tarantula body still breaks up seen close, so it serves only the small species, and
  the riding spider is on the long body (Mav's Refuge's is thin-legged anyway).

**The reference step is where a leg count is lost.** The orb and stout spiders came back with six legs because their views already showed six: "exactly eight" in a prompt is not obeyed. The
queen's view from above held eight. Image-to-image from the queen's own three views kept all eight in the tarantula, for 57 credits. Check a reference's leg count before paying for 3D. The
roach's references came back as a pinned specimen's top, belly and side views, so that model does not stand and is parked: 39 credits, nothing to show. Say "standing on the ground, seen from
the side" and look at the views first.

`rig/showcase.py` builds a page of chosen models through the real `KratorFauna.build()`, with a spider mixer.

## 12. The skinned trial: a bat (2026-11-02)

The question was whether a body rigid parts cannot do works on another road. A new Meshy 7.1 bat, generated for it with its wings spread (39 credits), went through `rig/skin_bat.py` in Blender 4.5:
29 bones placed from the reference's proportions, weights from distance to the bones. The kit has no skinned path yet, so this is a page test (`rig/showcase.py --skin`), not a catalog animal, and
`tests/test-models.js` does not see it.

**The answer is yes for the wing.** Glide, a full flap and a fold all hold together: the membrane stretches and folds as one sheet, with none of the cut-joint failure of the old bat. 13,366
triangles, 1.8 MB. The alternate routes: Tripo's creature rigging needs a Tripo key, and has not been tried; fal's rigging is humanoid only; Meshy's is humanoid only.

**The trouble was decimation, not skinning.** Meshy's membrane is a watertight shell a hair thick, and reducing it tears it. Tried, in order:

| Membrane | Result |
|---|---|
| Decimate whole, 14,000 tris | torn even at rest, worse in a flap |
| Decimate whole, 60,000 tris | a few slits, which open in a flap; too heavy |
| Inflate along normals, decimate, deflate | no better, and the fur turned to pimples |
| Delete the back faces where thin | lace |
| **Take the flat wing off; build one even sheet; colour it from a straight-on projection; cut its edge with alpha** | **no tears in any clip, 2,366 tris** |

The sheet's rule for the next membrane flyer: never decimate a membrane. The same reasoning as insect wings as cards, with bones in the card.

**Not solved.**

- **The body shows dark cracks** where the reduced mesh crosses the fragmented atlas. Matte fur, one colour for bridging triangles and bleeding the gutters did not clear it. It needs the raw model baked onto
  the reduced body.
- **The wing is rubber.** 1% of edges stretch over 2.2 times in a flap and 3.8 in the fold. The longest edges stretch far more, along the seam where the sheet meets the arm. Weights are distance only.
- **The fold is a first pass:** it folds, but not the way a bat stows a wing.
- **Only the front of the wing is projected,** so the back shows the same picture.
- **Nothing is wired:** a skinned path in `models_pack.py` and the runtime, the Godot import, and a gate (closure does not apply; stretch would be the measure).


## 13. Hornet, millipede, elephant bug (2026-11-03)

Three Meshy 7.1 models, 39 credits each, the references checked before the 3D step.

**Hornet** (`hornet` family, picks golden, pale and red on `emperor-hornet` #3 to #5): generated with no wings. The rig adds four wing cards on their own hinges (`wing_card`,
spec `wings`), folded back along the abdomen at rest and beating in a new `flap` clip, drawn with the dragonfly's see-through wing material (`patch_models.py` gives it to any family with
wing meshes). 7,022 triangles, 0.9 MB for three species.

**Elephant bug** (`elephant-bug`, the renamed `silt-strider`; only the kit used the old key; Voth's handoff asked for the rename everywhere): variant #1. Scaled to about 20 m tall and
18 m long: at the procedural bug's 25 m length the generated body, a stiltier animal, would stand 25 m tall. Say if it should be longer. Its front legs hang from the head, so the head holds
still in the walk; it walks with its body carried a little lower (spec `crouch`), since legs generated nearly straight have no stride in them.

**Millipede: not shipped; the 2026-10 model stays.** A new one was generated and rigged (spec `rings`, `rig/sources/draught-millipede/pack-meshy71.json` is the candidate): the legs cut
as a comb (everything below one height comes apart into one piece per leg), one ring per groove in the back, 18 rings and 23 leg pairs (two to a ring, as on a real millipede), the legs
walking in a wave, and its 158 parts drawn as **one skinned mesh** (`models_pack.py --merge`, the runtime's `mergedGeo`; the old model is 52 draw calls). Foot slide 0, every leg one piece.
What stops it: the comb cut leaves a row of sockets under every ring, and nothing tried closed them cleanly. Cores inside the rings got the view in to 1.55% (limit 1.5%), but sized from a
box that includes the leg roots they show through the shell; belly plates and a lower cut made it worse (the lower cut left legs too short to stride). The next try: cut each leg at its
own socket, not at one height, so the rings keep their whole shells.

**What the gate learned.**

- **Stride is capped by reach.** A foot sent past where its leg can reach slides; the stride is now the smallest any leg can take (`reach` in `write_glb`).
- **A swing must leave the ground at once** (`sqrt(sin)`), or its first frame still reads as planted.
- **A head that legs hang from does not sway in the walk.**
- **Pivots are measured to the parent's surface,** not its corners: a capped cut is one wide fan with no corner near a leg's root.
- **Texture density skips faces with no texture area** (caps and cores, one colour by design).
- **An animal over 6 m** may take 2.5 MB and its density floor falls to 850/length (50 px/m at 17 m): one colour map cannot cover a 20 m animal at 150 px/m. Stated in `tests/test-models.js`.

**The mantis strike** swung its raised forelegs up and back (the owner saw it): the swing's sign was wrong. It now drops them down and forward past the face, the tibia flicked open and
snapped shut.
