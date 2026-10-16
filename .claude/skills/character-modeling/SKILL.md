---
name: character-modeling
description: Lessons and workflow for building customizable, animated 3D game characters with Claude — MakeHuman/MPFB2 bodies in headless Blender, Meshy text-to-3D and rigging, generated clothing that fits every body shape, morph sliders (face, build, ancestry), hair/beards/skin tint, retargeted animation clips, hand-held props, cloth chains, body mods (extra arms, cybernetics), and a three.js page plus a Godot twin that must agree. Use this whenever the user wants a character editor or creator, NPC crowds with varied looks, armour or clothes that fit different bodies, a new outfit set or culture's clothing, animation fixes (clipping, jitter, posture, wrong hand, aim), or anything touching kits/characters in Krator — even if they only say "the guy's arm clips through his chest" or "make clothes for the Republic".
---

# Character modeling

This skill comes from a long build of Krator's character kit (`kits/characters`): two MakeHuman bodies and a giant,
about 140 animation clips, hundreds of garments across eight cultures, body mods, a Cosmetic Lab and an Animation Lab
in the browser, and a Godot twin held to the same numbers. Most of what is here was learned by getting it wrong first.

Read the reference that fits the task before starting:

- `references/pitfalls.md`: the bug catalogue by area (rig and retarget, morphs, clothing and clipping, materials and
  alpha, cloth, animation, props, Godot, publishing, tooling). **Read the section for your area before changing it**:
  most bugs you are about to hit are in there with their fix.
- `references/setup.md`: installing Blender 4.5 + MPFB2, the asset packs, Meshy's API, Godot 4.5 and its MCP server.
- `references/krator.md`: where everything is in this repo, the build and verify commands, and the commit checklist.

## Choosing the pipeline

**Generated meshes (Meshy and the like) do not make a customizable character.** The first attempt here took Meshy
outfit models (each a whole rigged figure), cut them into slots on one skeleton and conformed their seams. It never
stopped fighting: every donor had its own body under the clothes, its own weights, and a different neck and waist,
so a mix of slots showed cracks, faces smeared, and the clothing could not follow a slider. Meshy makes one fixed
body per model.

**Use a parametric body whose clothes are fitted by the body's own tool.** MakeHuman through MPFB2 (Blender add-on)
gives a body with macro sliders (age, weight, muscle, height, proportions), ancestry and face targets, and fits each
clothing item to the body with interpolated weights and a delete group (the skin it hides). Record, in Blender, how
far every vertex of every mesh and every joint moves per slider end; the page then only sums deltas. Clothes then
follow every slider for free, which is the thing a Kenshi-style "armour fits anyone" system needs.

Keep Meshy for what it is good at: its animation library (fetched onto a rigged donor and retargeted), quick concept
donors, and retextures. Its auto-rig is fine for a single hero; it is not a kit.

## The shape of a character kit

1. **One skeleton for everything.** Bodies, clothes, hair, props and clips all bind to the same named joints. A
   giant or a four-armed body is the same skeleton scaled and extended, not a new one: extra arms are extra joints
   that every body carries (`Left2Shoulder`, `Left2Arm`... down to the fingers), unused until a mod or a four-armed torso turns them on. Ask before
   inventing a second rig.
2. **Data, not code, for everything tunable.** Slider ranges, peoples (a culture's ancestry, skin stops, hair, beard
   odds, outfits per class), clip lists, prop grips, posture angles: JSON files both runtimes read. When the user
   tunes something by eye, it should be a number in a file, not a constant in two languages.
3. **Two runtimes, one truth.** The three.js page and the Godot twin read the same exports and are held together by
   a golden file (records and strangers drawn from fixed seeds, compared on both sides) and a Godot test. Every
   change to the figure's math goes into both, the same day.
4. **Deterministic builds.** Seeded draws, sorted lists, no timestamps: a rebuild with nothing changed must give the
   same bytes, so a hash comparison proves a refactor moved nothing.

## How to work a change

- **Reproduce with a shot before touching code.** Render the exact clip, body, outfit, frame and camera the user
  described (a Playwright script that drives the page: pick clip, prop, figure, yaw, times). Most reports are about
  one body size (short and tall break where neutral looks fine) or one frame of a clip.
- **Find the stage that is wrong.** Is it in the asset (Blender output: render it there), the pack (the GLB and its
  morph deltas), the figure's per-frame passes (posture, two-hand solve, cloth, push), or the published files?
  Fixing a symptom in a later stage than its cause is how fixes stack up and fight.
- **Check every body, not just the one in the screenshot.** Man, woman, giant, short and tall ends of each.
  A clothing fix that helps the neutral man often breaks the short woman.
- **One screenshot per meaningful change**, compared with the one before. Crop to the area in question.
- **Run the checks** (`verify.py --assert` on both pages, the golden test, the Godot test) before committing. They
  catch the things a shot misses: rest-pose drift, feet through the floor, figures floating, hidden skin wrong.

## Working with the user's eye

The user judges by looking; you judge by numbers. Bridge it:

- **When a subjective value needs a second round of "still not right", give the user a control.** Posture here took
  five rounds of "still bent back" before the user asked for sliders; a panel with a slider per joint, live on every
  figure, and Copy/Apply JSON for the result, ended it in one. Build the knob early, keep its values in a data file,
  and paste the user's JSON in when they send it.
- **Translate their words to the joint.** "Lordotic", "bent back at the mid T-spine", "chest jut", "hunched": map
  each to bones (lumbar = Spine, lower thoracic = Spine1, upper = Spine2) and a sign, and say which you changed and
  by how much.
- **Screenshots from the user are ground truth** even when your own render looks fine: they may be on another body
  size, another clip frame, or an older published file (see the publishing pitfalls).
- **Ask for textures instead of faking them.** When a garment needs a fabric the library lacks, write the gap and a
  generation prompt into a prompts file (`prompt-clothes.md` here) and say so; a procedural stand-in left unmentioned
  reads as finished work. When images arrive, process them into the library format and wire them in.
- **Culture briefs are design input, keep them.** "Austere and military", "Mongol and Apache with animal belts",
  "Greek and Roman with a Moebius flair": record the brief beside the garment code, and offer an alternative set
  rather than overwriting when the user asks for a variant (the Republic has an austere set and a festive one).

## Secrets

API keys (Meshy's start with "msy" and an underscore) go in a file outside the repo, read through an environment variable naming the file;
scripts never print or write them. Before every commit run `git diff --cached | grep -cE "ms[y]_[A-Za-z0-9]{8,}"` and expect 0. If the
user pastes a key into chat, move it into that file and never repeat it in commits, docs or summaries.
