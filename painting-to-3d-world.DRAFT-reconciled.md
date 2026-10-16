# Reconciled draft: painting-to-3d-world skill updates (2026-10-16)

Merged into `painting-to-3d-world.skill` on `main` and into the installed copy (`~/.claude/skills/painting-to-3d-world`).
This file is the record of what went in and from where; the zip is the source of truth.

## Sources

| Source | Where it was | What went in |
|---|---|---|
| Iziz mechs session (10-05/06) | `painting-to-3d-world.DRAFT-mechs.md` (local) | SKILL 5k; 1b bullets (merged) |
| Throne stations 8-11 and the geyser kit (10-07/10) | `SKILL-DRAFT-geyser-throne.md` (local) | SKILL 5l; 1b bullets (merged); a threejs-pitfalls block |
| Voth city plan (10-08/09) | `painting-to-3d-world.DRAFT-cityplan.md` (local) | SKILL 5m; 1b bullets; 5j, step 12 and section 7 additions |
| Fauna kit (10-06/16) | `kits/fauna/SKILL-LESSONS.md` on `origin/ccr-05259b8d-kuy4pm` (cloud) | SKILL 5n (drafted as 5j) |
| Ancients kit interiors | the zip on `origin/claude/busy-maxwell-8uvk60` (cloud) | SKILL 5o (drafted as 5k) |
| Zeijani kit and Dhelv | the uncommitted zip in `../krator-zeijani` | borrowed-lessons "From the Zeijani kit and Dhelv"; vertical-settings section 7; the Resources line |
| Code-only game remake | `origin/claude/loving-allen-khim02` (10-05) | nothing: its 5f is already on main |
| Isle demo | main (ab98d369) | already in; kept |

## Reconciled overlaps

- "Tools that regenerate indexes rewrite other builds' files" was in both the mechs and geyser drafts: one bullet.
- "Replace a block by its whole extent" (geyser) and "scripted edits assert their own match" (fauna): one bullet,
  worded as an addition to the existing "Assert every text edit applied".
- "Commit from your own worktree" (mechs) and "committing from a stale, shared checkout" (city plan): one bullet.
- The two gallery-publish notes (mechs, city plan): one bullet.
- The stale-baseline notes (city plan, fauna): one bullet.
- Dropped as already in the skill: "Python in a bash heredoc loses backslashes" (threejs-pitfalls, Mungo block).
- Section letters: the drafts all claimed 5j or 5k; they are now 5k-5o in date order of the sessions.

---

# Text added to SKILL.md

## Section 1b (appended)

- **A tool that regenerates every build's index rewrites other people's files.** `make_index.py` and `audit_port.py` refreshed stale `INDEX.md`/`PORT.md` in five other builds from local build output; in a shared checkout those are someone else's diffs. Run them, then `git checkout --` everything outside your build and commit only your lines; on a merge conflict in a generated file take main's copy and regenerate rather than hand-merge.
- **A scripted edit must match exactly once, over the whole block** (beyond `assert old in s`). A replace matched the first line of a two-line branch and left the second dangling (a syntax error the panel never shows); a regex meant for the lore note rewrote the yield note on eight animals. Replace a block by its whole extent (find its end marker, or replace by line range), `assert s.count(old) == 1`, anchor on the next field, reread the region after the edit, and `git checkout` to redo. `pkill -f` matched its own shell (exit 144): anchor the pattern (`pgrep -f "^bash ..."`).
- **A rename across builds is three different edits.** (1) Prose, labels and docs: a case-preserving phrase replace ("Silt strider" to "Elephant bug"). (2) Code identifiers and data ids that code matches on (`'strider'` kinds and layers, file names): leave them, or the builds break. (3) The owner's quoted words: leave as said. Dry-run the script first, back up any untracked folder it touches, then fix the articles ("a elephant"). **Ask the scope** when it reaches shared code (a catalog every build bundles), the lore, or another kit's similarly named creature (the hyperjungle's striders were a different animal).
- **Commit from your own worktree, based on the remote's main, and rebuild there.** The local checkout was days behind and the motor-vehicles core the mechs build on had changed on `main`. Carry your tracked edits over as a patch (`git diff <your base> -- <your files>`, then `git apply -3`), never as copied files (upstream had changed the same Voth fragments); resolve a conflict by taking upstream where it already has your fix; regenerate built pages, manifests and INDEX/PORT tables rather than patching them; and rebuild and verify **every** page there (upstream had added a helper, `vothPatCol`, to a function one page lifts by hand, and only that page broke).
- **When the hash baseline is already stale** (106 of 115 pages differed), update only the entries for the pages you rebuilt on purpose; do not rewrite the file. A page not in `PORT-BASELINE.json` reads NEW, not changed: leave the baseline alone for it.
- **A failing verify you did not cause:** run the same verify on upstream's own page before believing it. The interiors' shader error and missing-node failures happened on `origin/main`'s page too.
- **A killed verify run can leave headless Chromium running.** Four orphans held the CPU for 20 minutes and every later run timed out. Stop them by path (`ms-playwright`), never by name (the owner's Chrome).
- **Name the clock and the probe in every preset that shows motion.** A view of a geyser sets it off before the shot (`VERUPT`), and a view of night switches the light (`VMODE`); a preset that relies on the moment you happen to load shows a resting geyser half the time.
- **A generated pattern sheet may not be periodic.** The Iziz sun banner's half-drop rows repeated every 462 px, which does not divide 1254, so the pipeline's crop-and-blend left a seam row. Measure the period by self-similarity (the shift that minimises the mean difference of the image with itself), crop to whole periods before processing, and if it still seams, map a window from one tile's middle with clamping. Or ask the owner for a periodic redo (they did).
- **The gallery is published from several sessions.** A shared live artifact may refuse a publish because a newer version is live: fetch the live `index.html` (`Artifact read` with `path`), replace only your own card's entry in `ENTRIES`, publish that with your page, and log the version in `gallery/README.md` as the others do ("the live index (version N) was kept"). If it still refuses, prepare the index and pages in a scratch folder, record the pending publish in the gallery README, and ask the owner.

## Section 2, step 12 (appended)

A vehicle's route can be right and its pose still wrong: check a walker's height where its path meets a structure (deck, quay, span), not only its 2D path.

## Section 5j, probing (appended)

When hiding the overlay panels for a shot, never hide the canvas's ancestor (add `!e.contains(renderer.domElement)`). Split a shot script's steps on `@@`, not `||`. Wait on a background job with an until-loop in the background, not a chain of sleeps.

## Section 7 (appended)

- **A plan editor in the page** (Voth): place a kit building aligned to the nearest street; paint a street; delete a generated building. Saved as edits applied at fixed points of the layout.

## New sections 5k-5o

### 5k. Animated machines as a kit: a skinned rig, planted feet, attack clips (the Iziz mechs, Oct 2026)

Eleven walkers (`kits/mechs`, bundled as `KratorMechs`), each 4-6 m, biped, digitigrade or four-legged, built from
reference images in two days. The owner asked for "fully animated: a plodding walk, an idle and an attack". What it took:

- **Draw each part in its bone's frame, then skin it rigidly.** `R.bone(name, parent, x, y, z, rest turn)`; `R.on(bone)`
  sends the next primitives into that bone's frame. The runtime merges every bone's meshes into a few SkinnedMeshes
  (one per surface bucket: plate, livery, metal, bronze, cloth, hair, glass, glow) on one Skeleton, weight 1 on the bone:
  8-12 draw calls per machine. Things that run BETWEEN two bones (ballista strings, hoses, pistons) are drawn in rest
  space and weighted from one bone to the other along their length, so they stretch as the joint moves. r128: every
  material on a SkinnedMesh needs `skinning: true`.
- **Draw legs hanging straight down from the hip (the bind pose) and let IK pose them.** Two-bone IK with a knee sign
  (+1 a man's knee, -1 a bird's); a splayed leg (crab, spider) yaws toward its foot first, a sagittal one rolls toward it.
  Set the ankle from the knee's world quaternion inverted times the goal, so the foot stays level whatever the body does.
- **Plant feet in the WORLD, not in the group's frame.** On landing a foot records its world point and stays there; a swing
  goes from lift-off to a predicted landing (rest point + host velocity x (swing left + half a stance)). Then the host
  moves the group at `stride / (duty x period)` and nothing slides, through turns and speed changes. Measure the host's
  velocity from the group's world position; do not ask the host for it.
- **Three stepping rules besides the phase:** standing, step back any foot that strayed from its rest point; walking,
  step at once any foot left more than a stride behind (the host outran the gait); on starting to walk, a leg already in
  the swing part of its cycle steps now, or it waits a whole stance and over-reaches. An out-of-phase step starts its
  swing at 0: a negative swing fraction made `Math.pow(sin(...), 0.7)` NaN and froze the legs.
- **Re-plant on the first update after a build, and on any jump further than it could walk in a frame.** The sheet built
  at the origin and then moved each mech into its lane: the feet stayed 40 m away (IK reach 31 x the leg).
- **Attacks are data: offsets from rest per bone, an ease per segment, events at named points** (`fire`, `impact`,
  `call`, plus `step` from the feet). Hosts fly the projectile from the event's position and direction. A muzzle point on
  a SPINNING bone (a rotary drum) fires each bolt from whichever barrel is on top.
- **Dangles are spring pendulums**: hanging (feathers, banners, a crane hook) or whip (poles, aerials, radiator vanes).
  Start a hanging one at its equilibrium or it swings into place on the first frames. Banner cloth fluttered on the CPU
  needs its edge weights clamped to [0, 1]: `pow(-1e-17, 1.3)` is NaN at the pinned edge.
- **Verify the skin on the CPU**, as the GPU does (bone.matrixWorld x boneInverse x bindMatrix per vertex), for "feet on
  the ground" and the declared box. Gait invariants: every leg steps, a planted foot moves < 3 cm, IK reach stays under
  0.995 of the leg; then march every lane 25 s with U-turns and assert the reach again (that caught the two bugs above).
  Attack invariant: the clip gives every event it declares and ends standing.

**The bug no screenshot explained:** three attacks looked wrong in different ways (an auger raised overhead, a pile driver
punching upward, a rivet gun aimed backward). Printing each weapon bone's world direction at each key's time showed every
pose was about twice its keyed angle: the attack layer took the union of channel names from two neighbouring keys, so
a bone keyed in both was added twice. Measure directions numerically before re-keying anything by eye. And when keying a
held weapon, add up the chain: the weapon's pitch is shoulder + elbow + wrist, so to hold it level the wrist must cancel
the other two (the first cleaver chop ended blade-up because the wrist did not).

**Z-fighting is an audit, not a hunt.** The owner's note "x/y fighting in dark areas" led to `KratorMechs.audit`: every
rest-pose triangle, then pairs from different meshes that are coplanar (normals within 1 degree, planes within 4 mm) and
overlap by more than 4 mm (2D separating axes), skipping pairs of one colour. It found about 2,000 triangles across ten
mechs; it is now a `verify.py --assert` invariant (40 per mech). The causes, nearly all in shared parts, so fix them there:
- a joint drum drawn exactly as wide as the limb round it (the dark-area fights): the drum now stands 16 mm proud;
- hub caps, lamp lenses and bezels within 3 mm of the surface behind them;
- rails as long as the groove they flank (their end faces coincide);
- a trim stripe as tall as the plate it lies on, or two plates of one height side by side;
- stripes of an awning overlapping by 5 mm (abut them instead);
- hexagonal rods along the edge of a thin panel (the rod's flat side lands within the panel's half-thickness);
- two coaxial parts each tilted about its own centre (a canister and its band).
The audit does not see parts passing THROUGH each other: a deck ballista on a turntable swept through its awning's valance.
Check a pivoting weapon at its idle swing and at the attack's extremes against its neighbours.

**Livery that reads as paint over metal:** route painted plate in a saturated colour into its own bucket with a chipped
paint map, and let the shader show bare steel where the map is dark (`mix(steel, vColor, smoothstep(lo, hi, detail))`).
Keep bump low on fine scratched metal: a derivative bump on a 1 m tile sparkles at distance. A brief of "metal shades with
orange livery" means a colour budget: structure in steel and gunmetal, orange on the armour plates. The first pass was
mostly orange and the owner noticed.

**Working order that held up:** a parts library (joints, pistons, cages, feet, a torsion ballista with its own bones, a
seated pilot) and a culture dressing file (sun, phalerae, crests, feathers, vexillum, sashimono) first; ONE machine through
build, rig, verify and screenshots; then the rest one file each. Review many at once with a contact sheet per machine (two
views, a walking frame, three attack frames) instead of single shots.

### 5l. Thermal ground, water that reads, and a kit other worlds can load (the Throne's vents, glacier, caldera and tube; the geyser basin, Oct 2026)

Four Throne stations (a rift's vents and sulphur marsh, a glacier with ice caves, a caldera rim with its lava lake, a
lava tube) and a shared geyser kit (geysers on cycles, prismatic springs, travertine terraces, a dead forest; its
showcase a basin in the Steampits). What they taught:

**Lay the special ground out as data before the terrain exists.** The geyser kit's first fragment is pure maths: the
host hands `GEYSER.lay(spec)` its features and its ground *before* the thermal relief, and gets back records (geysers
and their cycles, springs, run-off, terrace pools), `relief(x,z,b)` for its terrain, `at(x,z)` for heat, sinter,
film, flow direction and the rest, and `waterAt` for its water. The host's terrain is then `ground + relief`, exactly,
because every spring's level is measured on that sum. That split is what lets another world (the open world, an isle)
load the kit from its own data or from one scale-model point (`GEYSER.cluster`), and what ports to Godot as is.
- Trace what flows (run-off, a creek) on the ground *before* the relief, and grade it: a bed is the running minimum
  of the ground under it, so it cuts its own ravine and never climbs. Water that ran uphill was the owner's first
  complaint at the vents.
- Scale a traced channel's length by its source. Every channel ran to the 500 m cap and the basin read as a road map;
  a small pool's run-off is tens of metres.
- A spring on a slope floats: its disc is level, its rim is not. Level the ground under the rim to the spring's own
  height (a sinter shield is flat-topped anyway), then cut the bowl.
- Many helpers on one kit object get wrapped by the kit registry (`BIO.kitEnd`), and terrainH calls the thermal
  functions a million times. Mark the pure ones as already wrapped (`f._kit='-'`) so they skip the registry switch.

**Life follows the heat, and the probe proves it.** Nothing roots over ~70 degC, in a spring, in the run-off's
sheet or on the sinter flats (they are nearly bare: multiply every living zone by `1 - smooth(.3,.7,sinter)`, or
kanuka will carpet them). The mats are Yellowstone's bands, drawn in the ground's shader by the water's temperature
and streaked along the flow. Check a tree's whole crown, not its foot: a crown over scalding ground failed the
"nothing on the scalding ground" check twice. Every such rule got a host check and a broken input that must fail it.

**Make water read: where it comes from, where it goes, and what it is.** The owner's two notes on the terraces were
"not clear where the water is coming from" and "nor does the bottom interface with the shore". Fixes: a source that
looks like one (a milky travertine spring on its own mound at the head, its channels visibly flowing); a thin flowing
sheet down every run-off channel, not only a wet stain; the last pools perched above the sea behind a wall standing
on the beach, with outfalls running across the sand into the surf. Ground cells "below the sea" are treated as the
sea (their ground left alone) so the flight ends instead of fading.

**Natural forms come from the owner's photographs, not from a formula that looks plausible.** Terraces built as bands
across the slope (quantised height, scalloped by `|sin|`) read as chevrons, then as dunes, whatever the tuning. Eight
reference photos (Pamukkale, Mammoth, Badab-e Surt) changed the model, not the numbers: pools as cells of a power
diagram (a third of the seeds dropped so sizes vary), each with its own level drawn hard toward tiers ~2.6 m apart
(tall walls between tiers, low rims within one), pools of nearly one level joined, the higher pool's rim bulging
into the lower one so every rim is a convex arc downhill, a quarter of the pools dry, uneven floors so the shallows
show pale. Rims and curtains are sized in metres (crest ~0.5, curtain ~2.2), never as a fraction of a step, or a
gentle reach grows wide rims instead of wide pools. Ask for references as soon as a natural form looks "off" twice.

**Draw shallow water in the ground's shader when it has many levels.** Each terrace vertex carries its pool's level
and the level squared; a triangle spanning two pools has a spread (`L2 - L*L > 0`) and draws no water, every other
fragment under its level is water. No water mesh, no slivers on the walls. It costs a faceted look close up on a
0.8 m grid; a deep pool would still want a mesh.

**Make anything that moves on a clock stateless.** An eruption is a Points cloud whose every drop is thrown again
and again: its age within its flight, launched at `now - age`, as hard as the geyser's cycle says it played at that
launch. The cycle is one function, in JS and the same in GLSL, so the column stands at once wherever the clock is
set: "Erupt" just moves the geyser's clock, a preset view can set one off eight seconds before its screenshot, and
Godot runs the same maths. Keep far drops at a minimum pixel size with their alpha scaled down, or a 50 m column
vanishes across the basin.

**Two kits on one page share a scope.** The hyperjungle (read in place from its folder, in its own registry) walls the
basin in, with the host's mask swapped per kit. Its globals fragment declares `TAU`, `clamp`, `fbm` at top level, so
the host must not declare them again ("Identifier has already been declared" kills the page silently: read the
console first), and two host fragments both named their uniforms `GU`. Prefix host names by fragment.

**Check the look on the GPU, prove it headless.** The app's browser pane builds the basin in ~8 s against 20-40
minutes a run under SwiftShader. Iterate there (a static server in `.claude/launch.json`, `javascript_tool` to set
views and run `hostChecks()`), and keep `verify.py --assert` for the end. A rebuild during a headless run invalidates
it: kill the run and start again. Engine traps from these stations are in `references/threejs-pitfalls.md`.

### 5m. A city plan on a saved site: the street method as a module (Voth, Oct 2026)

Voth was laid out again from scratch on a site the owner drew in an editor: about 8,000 buildings on 5.5 km2 of dry
land, with no footprint overlapping, nothing on a street, nothing in water. The method was first worked out on a toy
(a featureless plain) and then promoted to `core/city`. What held up:

- **Split the site from the method.** The world's steps 0-5 (ground, landmarks, wall, districts, avenues, highways)
  come from the owner's saved polygons and polylines (a site editor that saves JSON), not from code. The method's steps
  6-12 (civic, avenue lots, main streets, lots, side streets, lots and alley entrances, alleys and infill) are one
  shared module. Every record carries `born` and lots `died`, so a step slider shows the city as it stood after any
  step. That is how the owner reviews a rule change.
- **Every owner rule is a TUNE value, a log line and a verify assert.** "Nothing along the highways", "the wall is
  intact", "at least 7 clan compounds", "river quays square to the current" each became a number in `TUNE`, a sentence
  in the step's log ("12 elephant bug stations off their roads, each with a lay-by") and a named failure in
  `verify.py --assert`. The owner then iterates on the rules, not on the code.
- **A toy that proves a method should become a module, not a second build.** Move the shared fragments into
  `core/<name>/`; write the contract into its README (what the world provides, the records, the steps); add a porting
  table of every settlement ("not yet") and the module's debts to the repo's rules (its own PRNG, noise and grid instead
  of `KRAND` and `core/mask`); retire the toy (git history keeps it).
- **Socket fixtures as the street is laid; settle what they are once the city stands.** Lamp posts were recorded on
  each way by a wrapper on `SL.addWay` (one every 26-40 m by class, sides alternating); their kind (electric mast, fancy
  lantern, lantern, torch) depends on wealth and the district, known only at the end. A socket that a later street
  crossed or a building took **slides along its street** (+-4, 8, 12 m) before it is dropped: 2,388 junction drops
  became 1,122, for 4,973 posts in all.
- **Lighting is a class rule on records.** Electric light reaches the industry district, guilds, and clan compounds
  and rich houses within 650 m of a power house; everything else is lantern or torch. Each lot carries `light`, shown in
  the inspector; the night glow reads it. When a new building type joins (power houses), staff it in the census, or the
  workforce/jobs balance the owner asked for drifts (0.4% to 1.4%).
- **A biome kit on a city.** The mask is a grid rasterised once from the plan: zero on streets, lots, fields, the wall,
  works districts, lamps and furniture; inside the wall only parks are open; never a canvas. The zones come from the
  climate fields the city hands the kit (parks get wet lowland, jungle; the environs dry upland, savannah), with no kit
  edits. "Small hypertrees": lower the kit's canopy ceiling knob and scale the canopy species' crowns and boles in the
  host once (the kit scales heights only). The LOD spine must cover where the viewer goes: with spine points only inside
  the city the environs were impostors and no grass, so add a coarse lattice over the open country. Build into one
  group, so the step slider and a layer toggle hide it whole while the kit's own LOD runs under it.
- **The late passes are a dependency chain:** lamps, then furniture, then flora. Each one's footprints are holes in the
  next one's mask.
- **A gate on a slope.** A builder that sets a gate at its footprint's lowest corner buries the uphill pier (8 m at the
  River Gate). Cut and fill a level pad at the road's height, blended to the natural ground at a maximum slope
  (`clamp(now, y - d*s, y + d*s)`), **then refresh every cached copy of the ground**: the edit grid, the 10 m height
  cache, anything a later pass reads.
- **Two "parallel to X" rules can force a clash.** Barges lie parallel to the current; quays stand square to it; a
  barge "alongside" then lies across its pier. Moor it off the pier head instead, place it only where all four corners
  float, register its hull with the boats' navigation, and audit hull against pier.
- **Walkers and bridges.** A creature drawn at `terrainH` on a river bridge wades through the river bed under the deck:
  use the world's deck function (Voth's `lifeBridgeY`). In the nav grid, close the water beside each deck and under
  every span, so a bridge is entered only from its ends. Audit: sample every path every 2 m, none in the closed water,
  every deck point at deck height.
- **One clock for the page.** Take `core/clock`; the sun comes from the world's own sun function (lifted by name) and
  its palette (day, sunset, night, and planetshine, so night is never black). Lamps are `core/atmos` glows with per-lamp
  on/off hours: electric all at once, lanterns lit one by one over an hour of the evening, torches out before dawn.
  Speed buttons set the clock's `scale`; vehicles run on its motion time, so they speed up too.
- **A building picker with pictures.** Build each kit piece once off screen, render it into a small render target on
  the page's own renderer and read the pixels back (the target is bottom-up and linear: flip and gamma-correct it).
  Draw two a frame from when the editor opens, move whatever the search shows to the front of the queue, and use a cool
  mid-grey background, since pale stone vanishes on cream.

### 5n. A fauna kit: animals as data on shared builders (Oct 2026)

Every animal of Krator moved into one kit (`kits/fauna`), the way furniture moved into the catalog: an `ANIMAL({...})` entry
is data first (tags by biome, koppen, aridity and climate; yields; traits; the life layer's numbers), then a build that draws
the animal as named parts a host can move (body, head, tail, legs, wings). `fauna_bundle.bundle(groups)` ships the groups a
world asks for as ONE closure exposing `KratorFauna`. About 190 animals later:

**Plan before drawing.**
- **Plan by biome, in a table, before any animal is drawn.** Each biome gets at least two grazers, one predator, one flyer
  and one water creature. Give the owner the table with the proposed names first: they will redirect it (a giant sea lion
  for the Ring Sea, domestic stock, "make some sea and lake fauna"). Where biomes overlap (the Throne's ten sub-biomes) share
  creatures instead of inventing ten sets. Start with the biome that has the fewest animals, then go in waves, one commit each.
- **Pin a name the owner uses that the repo lacks.** "Plumelands" was nowhere in the repo. Take the nearest reading (the ash
  plain under the volcano's plume), tag it as a new biome, write the assumption into the plan, say so in the reply. The owner
  confirmed it; only then retag existing animals, because a tag edit changes the group and every kit that bundles the group
  must be rebuilt (only the Ash Nomads bundled `ash`).

**Builders, not one-off code.**
- **A dozen shared builders, a five-line entry per animal.** Quadruped, fish, serpent, crab, ray, squid, jelly, octopus,
  bee, six-limbed, glider: each takes a `spec`; an animal is dims, mass, yields, a lore note, speeds and colour variants.
  New capability goes into the builder as an option (`stock`, `limbWeb`, `glowTips`, `lure`) so the next animal gets it for
  free. The entry helper fills default tags and derives the rest (a centaur gait adds `climbs` to locomotion).
- **Scale by spec, not by new code.** The Rift's four gliders run from a raccoon-sized one (1.2 m span) to a
  quetzalcoatlus-scale one (10.8 m span) on one builder. The big one needed its own triangle budget and a shorter tail,
  or its length beat its span.

**Declared size is a contract.**
- **Verify asserts the contract** (12 checks): the built box within 10% of the declared `dim`, the animal on y = 0, triangles
  under budget, tags and yields in the vocabulary, every mode (idle, graze, walk, rest, fly, swim) keeping the animal in
  its box, a deterministic build, detail maps decoded. Do not paste a measured size over a bad build: look at the animal first.
- **Fit `dim` by script.** Build, assert, raise only the failing keys' `dim`, repeat (one to three passes). If it never
  converges the failure is not box-related: read the FAIL lines. A flyer declares its FULL wingspan (the animation check
  fails an animal that "grows" past 1.6 times its width). Webbed gliders pass the default 9,000-triangle budget: give the
  entry `data.budget` (11,000 to 12,000) rather than raising the default for everyone.
- **Run the assertion pass alone.** Screenshots taken at the same time starve it and both time out.

**Anatomy that reads right.**
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

**Gaits and gliders.**
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

**Process.**
- **Rebuild what the change reaches.** A runtime or core change: rebuild every consumer (Scyvoi, Desert Nomads, Ash Nomads)
  and run its own `verify.py --assert`. A group's tag change: only the kits that list the group.
- **The plan and README are the log.** Each commit adds its line (what, why, the count) to the kit's plan and README, so a
  fresh session knows which biomes are done. Commit and push every step; open no pull request and republish no gallery
  unless asked.
- **Know what procedural cannot do.** Invented anatomy, insects, fish and gliders work; real animals with feathers or humps
  (goose, turkey, camel, small birds) stay weak. Plan generated models for those (Meshy: preview 20 credits, refine 10;
  rig through `rig/qmodel.py`), and when the credits run out (a 402) defer rather than fake it. Never write an API key into a
  file; a key pasted into chat should be rotated.

### 5o. Rooms inside a kit someone else drew (the Ancients kit, Oct 2026)

The Ancients kit's 33 builders draw shells (lathes, hex casemates, crescents) at five decay levels, and the owner asked
for rooms inside them: sized to the real interior, furnished only when intact, partitions broken in the ruins (a little
differently in every placed copy), and a socket so any culture's furniture can go in later. What held up:

- **The plan is data in the builder's frame; a pass after the builder draws it.** No builder learns rooms exist: the
  scene loop calls `interiorBegin` before a builder (it marks every kit instance list) and `interiorPass` after it,
  beside the existing repair dressing. Keep the plans engine-neutral in their own kit, so a world can take them without
  the kit page, and keep room and wall ids the same at every decay level: then a ruin is the intact plan with breaks,
  and anything keyed by room id survives the state change.
- **A few plate generators cover a whole kit.** A ring plate (core, corridor ring, rooms cut radially to the skin), a
  bar plate along any path (straight wing, arc, crescent: corridor, rooms one or both sides, end rooms), an open grid of
  bays along aisles, and a single hall. A 14,000 m2 vault is bays with walking aisles, never one room: the placer finds
  nothing to do in it. On a symmetric shell, make the room count a multiple of the symmetry (6 on a hex) so like rooms
  repeat.
- **Read what the builder already put inside before drawing over it.** Intact shells hid SOLID dark kit boxes where the
  rooms go, and ruins carried fake interiors (floor discs, machinery silhouettes, conduit) at other heights. Clear both
  by position from the instances pushed since the mark, and only those, then draw. List the solid masses in the plan
  (`hollow`), so it is data, not a guess in the pass.
- **Break a ruin by hash, then jitter by placement.** A partition breaks when a hash of (type, wall id) is under the
  ruin's share; the site's own seed moves each wall's chance by up to +-0.15, so placed copies share most breaks but not
  all, and repeat exactly. The builder's own collapses (a missing sector, a pancaked arm) open rooms outright and never
  move. No `rng()` in the pass, so no other structure's randomness shifts.
- **Test the culture's furniture before you trust it.** With the seven harvested Ancient pieces, an "intact Ancient"
  police station was furnished 78% from pirate salvage through the culture chain. The remedy was 19 new pieces of the
  right era and a culture-FILTERED adapter for the intact state, so an empty slot stays empty instead of filling from
  another culture. Before writing pieces, check every source the owner may mean (here Yuni's Ancient furniture: the
  same seven), and add new pieces rather than retagging old ones: a retag silently moves furniture in worlds already
  built.
- **The socket is just this.** Rooms carry culture-neutral kinds; furnishing takes `{ culture }` and a filtered
  adapter. A reoccupied ruin is `furnishPlan(plan, catalog, { culture, all: true })`, the same plan and the same rooms.
- **Furniture is data first, drawn on opening.** Records for every intact building are made at load (through the
  shared placement pass, tagged); a building's batch is built the first time it is cut open. TEMPLATE rooms by
  shape: centroid at the origin, turned so the door faces +z, rounded to 5 cm. A 625-room server hall then needs 8
  placer calls. Two traps: put the template's seed ON THE ROOM, not in the furnish options, or the audit's re-furnish
  (which uses the room's seed) reports a determinism failure; and audit a template through the same filtered adapter
  that furnished it. A big hall laid out by a recipe is checked by the recipe's audit, against the whole catalog (the
  recipe's dress is already the culture's choice).
- **A cut-away without rebuilding anything:** five clipping planes with `clipIntersection` on every material clip only
  the box above a storey inside one building's footprint. Set them once per material (one shader recompile), then move
  the constants. To close it, move the cut plane UP out of the way; moving it down clips the whole footprint. A view
  preset can carry an extra element (`{ site, storey }`) if you wrap the one `setView` every route goes through.
- **Map tag values in one place.** The plans said `industrial`, `laboratory`, `culture`; the shared vocabulary says
  `industry` and `civic`. A single map in the plan API (not edits in five authors' files) took the unknowns to zero.

**Fanning plans out to parallel agents worked** once one type was finished end to end (plan, node test, kit drawing,
furniture, cut-away, screenshot): five agents each took a group of builders with a brief file, the worked example and
two node scripts (the plan at every decay with its audit; the furnishing with its template audit), each writing only its
own file. Keep that harness IN THE REPO, not the scratchpad, or a later session cannot resume. When the user pauses
mid-fan-out, move partial files out of the build's file glob (a `wip/` folder) and say what each lacks; `git mv -k`
on an untracked file does nothing and exits 0, so check that the move happened. An interrupt can stop background
agents too: diff the tree for their half-edits before going on. And never pass a commit message with backticks to
`git commit -m` in a shell: they run as commands. Use `git commit -F -` with a quoted heredoc.

A kit build's own guards will flag generated bundles from other kits (a catalog's `buildFurn` reads as a builder
without a reseed; a one-line `const X=(function(){let a=..,b=..` reads as a top-level `b`): exempt generated and
shared-core fragments by name, as the build already exempts its biome fragments, and give one-liners their own lines.


# Text added to references/threejs-pitfalls.md

## Added from the Throne stations and the geyser kit (Oct 2026)
- **`smoothstep(a,b,x)` with `a > b` is undefined in GLSL.** JS helpers handle reversed edges and most desktop GPUs
  return the mirror image, so it looks fine until it doesn't. Write `1.0 - smoothstep(b,a,x)`, or one helper
  `float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}`. A one-pass script
  found five reversed calls in the geyser kit's shaders.
- **A screen-space effect cannot copy an antialiased default framebuffer** (`copyFramebufferToTexture` gives black in
  WebGL). Render the scene into an offscreen target with a `DepthTexture`, draw that to the screen, then the effect
  on top reading it. r128 tone-maps and sRGB-encodes into a target whose texture says sRGB, so the screen quad and the
  effect pass the values through with `toneMapped:false`, or the frame is tone-mapped twice (washed out) or grey.
- **Fresnel sky reflection washes shallow water white under a hazy sky.** With a pale sky colour in linear light,
  `0.04 + 0.5*(1-N.V)^4` at a low camera turned turquoise pools into ice. Use Schlick-like `0.02 + 0.5*(1-N.V)^5` and
  scale the sky term down; check the pool from 15 degrees, not only from above.
- **A grid of particle puffs reads as separate ghosts.** Soft points need many puffs, low alpha (~0.25) and strong
  growth with age so they merge into a plume; a few bright puffs read as cotton balls.
- **Patch a terrain with finer meshes: holes, skirts and shared normals.** A coarse map mesh with the patches' cells
  dropped, each patch skirted 1.5 m down, and every normal taken from height differences (sampling `terrainH` past a
  patch's edge) so a patch border shows no seam in the lighting.
- **A library card's cell is not its anchor.** Some cards are centre-anchored (a plant floating in its cell) and some
  base-anchored; a tuft geometry standing on the card's bottom edge needs the latter. And an unflipped card has `v=0`
  at the image's top: a frond strip with its base at `v=0` shows the frond tip-first unless its UVs are flipped.

# Zeijani additions

Taken unchanged from the krator-zeijani zip: `references/borrowed-lessons.md` ("From the Zeijani kit and Dhelv"), `references/vertical-settings.md` section 7 ("A city carved under a drawn ground"), and the vertical-settings line in Resources.
