# core/charactermodels

The character editor and the data a city needs to populate itself: two MakeHuman bodies (a man and a woman), and the
Giant made from the man's (Giants, below), whose face, build and ancestry morph, with library clothes, hair and beards that follow the morphs, a skin tone and a hair
colour, and **peoples** (`data/peoples.json`) that keep a culture's strangers within its range (Chichani: ashen-brown
skin and dark hair; Beast Riders: Asiatic or Amerindian, blond to brown hair). One record per citizen; no separate
model per person. Body mods (a second pair of arms, flesh or cybernetic; rib gills) go on any of them. Two pages are
built over the same pieces:

- **Cosmetic Lab** (`dist/cosmetic-lab.html`): one figure and every cosmetic choice (people, face, hair and colour, beard,
  skin, eyes, build, clothes and dye), with the idle, walk and run to see clothes move. It is the start of the player
  character editor. Its Record tab draws **strangers in bulk** for NPCs (`KCHAR.crowd`): a people, a count and a seed
  give the same crowd every time, and each record keeps the seed that redraws it. The same draw runs outside the
  browser: `node tools/npcs.js --people chichani --count 200 --seed 1 > npcs.json` (`--list` names the peoples).
- **Animation Lab** (`dist/animation-lab.html`): each body three ways (neutral; short and broad; tall and lanky: `CAST`
  and `BUILD` in `src/92-animlab.js`), all six in the same plain clothes, side by side. A clip from the ledger plays on
  all six in step with the props it holds; pause, slow down, scrub, step a frame, swap the prop, show one body or
  both, orbit or close in on one figure; the Giants filter shows three giants instead (flesh arms, cybernetic arms,
  two arms), with menus for the mods everyone wears and what the lower hands hold. One-shots repeat. Each clip gets a review mark (good, needs work, broken),
  the bodies it looks wrong on and a note. The published lab keeps them in its shared store (collection `reviews`, one
  document per clip, which Claude reads); run locally it keeps them in the browser.

```
cd core/charactermodels
blender -b --python tools/make_garments.py -- male [--render <dir>] # the Voth clothing, into MPFB's user data
blender -b --python tools/mpfb_build.py -- male <export dir>      # Blender 4.5 + MPFB2 + the asset packs (below)
python3 tools/make_mpfb.py male <export dir>                       # -> pieces/mpfb_male/, data/mpfb_male/
python3 tools/make_mpfb.py giant <the man's export dir>            # -> pieces/mpfb_giant/, data/mpfb_giant/ (tools/giant.py)
# a few new garments without the whole library (a fresh machine, or the clothes alone): make them, export the base and
# them alone, and add them to the kit as it stands (base, skeleton, mods and the other items untouched)
blender -b --python tools/make_garments.py -- male --only <ids> [--render <dir>]
blender -b --python tools/mpfb_build.py -- male <export dir> --only <ids>
python3 tools/make_mpfb.py male <export dir> --merge                # -> pieces/mpfb_male/<id>.*, new entries in kit.json
tools/rebuild.sh [--only <male ids> <female ids>]                  # all of the above in order, both bodies at once, then the pages
python3 build.py [--thumbs]                                        # dist/cosmetic-lab.html, dist/animation-lab.html (+ .artifact.html); runs tests/test-rig.js
python3 build.py --pages-only                                      # the pages alone where pieces/ is missing (the manifest keeps the pieces' hashes)
python3 verify.py dist/cosmetic-lab.html --assert [--out shots/]
python3 verify.py dist/animation-lab.html --assert
python3 tools/shots.py <dir> tools/shots-clipping.json               # close-ups of the open clipping issues, the same every run
python3 tools/lab_shots.py <dir> <spec.json> --page <lab copy> --gpu   # Animation Lab clips per body, side by side (pieces beside the page)
python3 tools/ease.py /path/to/export male                           # under-items outside the item over them, per outfit
node tests/make-golden.js && python3 ../../godot/tools/sync_core.py     # after a change to 10-rig.js, data/ or the pieces
godot --headless --path ../../godot --script res://tests/character/kchar_test.gd
```

**Publishing the labs.** Each page fetches `pieces/<body>/<piece>.txt` beside it: the GLB, and on a second line the
piece's morph deltas. A piece published before the two lines were one file still has its deltas in a
`<piece>.morph.txt` of its own, and the pages fall back to it. Never remove a `.morph.txt` from a published lab
without sending its piece's `.txt` again in the same publish: the piece would lose its morphs, and every body but
the neutral one would show it at the neutral size (hair off the head, shirts off the torso, holes at the joints).
A version holds at most 511 files, so send the changed pieces (compare `build-manifest.json` with the last published
commit's) rather than all of them. A version also holds at most 256 MiB, and the Cosmetic Lab is at about 245: the Order of Historians' and Xanadu's
clothes (2026-10-19, 14 MB) are published in a lab of their own, "Cosmetic Lab: the Order and Xanadu"
(https://claude.ai/artifact/8nSqU3MxD2GCCyzJTHT2t7: the page with the kit cut to those two peoples, the bodies, clips,
hair and beards copied from the main lab on the server), until the main lab is split (KNOWN_ISSUES.md). `build.py`
builds the page with whatever pieces this checkout has (`pieces/` is gitignored) and keeps the other pieces' hashes in
`build-manifest.json`.

**Clothing fit.** Measured on the exports (2026-10-20), before acting on HANDOFF-CLOTHING.md 1.2 and 1.3:
- *Across slider ends* MPFB's refit already keeps every garment where the rest has it: over all 85 ends, a few dozen
  vertices per item go 0.3 to 2 cm deeper into the body than at rest (boot soles at full height, hat rims at the pointed
  ears), and the generated garments almost none. So 1.2 (a settle per slider end) is not built.
- *At rest* garments lie outside the skin but for soles (by design), the four-armed giant tunics' armpits (up to 5 cm)
  and two to eight vertices of a robe or tunic.
- *Across items worn together* is where the fit fails: `python3 tools/ease.py <export dir> male|female` lists, for every
  outfit in `data/peoples.json`, the under-items standing outside the item over them. 16 of 58 pairs on the man and
  15 of 52 on the woman; the worst are the Hykkousoi pteruges outside the lorica (most of their vertices, 7 to 9 cm),
  the Izani commoner's trousers outside the tunic (about 700 vertices, 1 to 1.5 cm), the Chichani noble's skirt outside
  the robe (up to 5 cm) and trader's xicolli outside the head wrap (7 cm). These are the open clipping issues' causes,
  fixed at build time: `make_garments.py` settles each garment over what is worn under it (`settle`: out along the
  skin's normal to 6 mm past any lower layer of an item worn with it in an outfit, `tools/layers.py`; under-layers are
  built first, and each garment leaves `<gid>.layers.npz` for the ones over it). After it, 1 to 21 edge vertices per
  pair (the Chichani noble's skirt the worst, 1.8 cm). `--objs <MPFB clothes dir>` reads the generator's own output,
  so a garment change is checked in minutes. An item can lie over a higher slot's under-layers: the Hykkousoi pteruges
  (`layers.OVER`, kit item `over: 'torso'`) hang over the lorica's tunic skirt (layer 0) and under its cloak (2).

## A core module: where it goes next

This was `kits/characters` until 2026-10-16. It moved to `core/` because it is meant to be shared: the bodies, the
records, the peoples and the clips are what every settlement's citizens will be drawn from. It is still a build of its
own (`build.py`, `src/`, `dist/`: the two labs), which `tools/make_index.py` and `tools/audit_port.py` list through
`CORE_BUILDS`. The first settlement to take it is Longsong (2026-10-19: `settlements/longsong/build.py` reads `10-rig.js`
and `50-figure.js` in place, a kit cut to its two peoples, and the pieces as sidecars; its `69-ls-figures.js` draws the
nearest people as figures in their own records).

**Lessons learned** are kept in the `character-modeling` skill (`.claude/skills/character-modeling/`, zipped as
`character-modeling.skill` at the repo root): read it before working here, and add to it when a fix teaches something
(the root `README.md`, "Skills", says how to keep the two copies in step).

**The plan** (GODOT-PLAN.md Phase 5, "Bodies for the citizens"):

1. **Replace the citizen stand-ins.** A settlement's life layer draws each citizen's record from its people
   (`KCHAR.stranger` / `KCHAR.crowd` with the citizen's id as seed, so the same citizen always looks the same), dressed
   by class (peasant, trade, court) from `data/peoples.json`. The figure (`50-figure.js`) and its pieces replace the
   stand-in mesh; the simulation keeps deciding where a citizen is and what it does (`core/simulation`), the figure
   only shows it. Crowds need a cost plan first: instancing or impostors past a few dozen figures, LOD (a lighter
   body and fewer cloth chains far off), and the pieces' download budget. The first of it is in (2026-10-20,
   `src/60-crowd.js`, `KCharCrowd`): a figure baked still at a clip's frame into one vertex-coloured mesh (its pieces
   skinned through their bones, each vertex its texture's colour times its tint) and drawn instanced, so a page draws
   the nearest few dozen as figures and a crowd past them in a handful of looks and poses, one draw each (Longsong's
   `69-ls-figures.js`: 16 looks, standing, two strides, sitting). Not yet: faces of their own at that range, the cloth
   chains' sway, a Godot twin.
2. **Line up the work tasks with clips.** Map each activity (`core/simulation/ROADMAP.md` §26, the portable
   primitives, plus a build's own: FETCH_WATER, HERD, SMITH, TRADE, SLEEP...) to a clip, a prop and a loop or one-shot
   in a table beside `data/clips.json`, and list the activities with no clip. Fill the gaps from the libraries
   already used (Meshy's animation library, Quaternius UAL), Mixamo clips the owner supplies, or made clips
   (`derive`, as the hammer, dig and thrusts are).
3. **A quality pass, before citizens use it at scale:** clothing (skin and under-layers through garments at the
   slider ends, sleeves, hems in motion, the generated garments' tailoring), posture (the retarget's straightened
   spine is offset after the clip, not fixed in the retarget: `KNOWN_ISSUES.md`; the Animation Lab's Posture panel
   writes `data/posture.json`), and animation (hands through hips on heavy builds, made clips that read as made,
   the review marks in the Animation Lab).

## How it works

| Step | Where | What |
|---|---|---|
| 1. Blender | `tools/mpfb_build.py` | Builds an MPFB human (Mixamo rig, `detailed_helpers` so the rig lands right), loads the brows, lashes, eyes and every library item in `ITEMS` (clothes per slot, hair, beards: MakeHuman fits each to the body and interpolates its weights from it), exports the base and each item as a GLB on the same rig, with a `_VIDX` attribute (each vertex's Blender index) and each item's delete group. Then, per slider end (macros: age, muscle, weight, height, proportions, and bust and firmness on the woman; the three ancestry shares; 35 face targets), it sets the target, lets MPFB refit the rig and every item, and records how far each vertex of every mesh and each joint moved: `morphs.npz`. |
| 2. Pack | `tools/make_mpfb.py` | Per GLB: shrinks the textures, makes the skin, hair and iris textures neutral (the page multiplies the colours in: `kit.tint`; the irises' mask rides in the eye texture's alpha), drops alpha channels that hold nothing, stores hair as grey + alpha, sets cut-out or opaque alpha (Blender's exporter marks everything BLEND), drops normal maps that are colour images; the few items far denser than they look (`DECIMATE`: the flats and the pirate boots, twice the body's triangles a pair) keep a tenth of their triangles (`tools/decimate.py`: quadric collapse onto their own vertices, so UVs, weights and the morph deltas still match; borders and seams held). Delete groups become a bitset over the skin's triangles; an item with none gets one from rays cast out and in from the skin (`covered()`), and a top with one gets those rays' triangles too (its delete group stops short of the shoulders and chest in places, where the skin came through). Trousers (`legged_trousers`: the library's with no delete group, the cargo trousers, and the cultures' made trousers, breeches and braccae) take longer rays and a front-and-back closure (`TROUSERS_COVER`: out 5 cm, in 3 cm, closed within 35 cm along the body's front-back axis): at the default reach the knees, the crotch and the cleft of the buttocks were left drawn and came through in a crouch, a lunge or a roll. The base's small parts drawn over the skin (the nipples, `Human.nipple`) are never in a hide; an item that hides all the skin under one names it in `hide_parts` (`parts_under()`), and both runtimes leave it out (`KCHAR.hiddenParts`). `python3 tools/make_mpfb.py hides <body> <dir of GLBs>` rederives those two from the pieces alone, with no Blender (`refresh_hides`; the Godot twin's skin regions follow at the next whole build). Hair and beard textures are made neutral with their clear texels filled at the mean grey (left black, they darkened the mips and the thin beards drew darker than the hair). For the Godot twin it also writes `<id>.gshapes.bin` (GSH1: per surface and target the shape whole as float32, its positions and its normals turned as the target turns the faces, which Godot blends NORMALIZED, the linear blend the page gets by re-summing normals; the skin's cover regions, by the items that cover each, which Godot joins into one surface and hides by region; the ground). The deltas become one `KMR1` file per GLB (`<id>.morph.bin`: per mesh, per target, the vertices that move, int16 at 0.1 mm); the joint deltas, sliders and ancestry go into `data/mpfb_<body>/kit.json`. Clips are retargeted onto the rig (`make_pieces.write_anims`). |
| 3. Record | `src/10-rig.js` | `KCHAR.morphWeights(record)`: one weight per target (a slider at v < 0 weighs its minus end by -v, at v > 0 its plus end by v, times its reach; ancestry weighs each race by its share minus the base's). `KCHAR.morphJoints`: each joint's rest moves by the weighted sum of its deltas. `KCHAR.stranger(seed, kit, people)`: a record drawn from a people's ranges with `KRAND`. |
| 4. Figure | `src/50-figure.js` | Blends each live mesh's deltas on the CPU (`_vidx` maps a glTF vertex to its Blender vertex; a seam's halves move together), re-sums normals over source vertices, moves each bone's rest and its inverse bind by the joint delta (`IBM * T(-d)`, so the skinned rest is exactly the morphed mesh), keeps the feet on the ground, hides the skin under worn items, and tints skin, brows, hair and beard. |
| 4b. Crowd | `src/60-crowd.js` | `KCharCrowd.bake(fig, clip, t)`: a dressed figure at a clip's frame baked into one still mesh (every visible piece through its bones, vertex colours from its map at each uv times its material colour); `KCharCrowd.set(geo, n)`: an InstancedMesh of it to place a crowd with, one draw per look and pose |
| 5. Pages | `src/90-editor.js`, `src/92-animlab.js` | The Cosmetic Lab: Gear (clothes, dye), Head (people, skin tone, hair, hair colour, beard, eye colour), Body (ancestry, build), Face (35 sliders), Record (the record as text, roll a stranger, strangers in bulk). The Animation Lab: six figures, the clips, review marks. |

**The record**: `{ body:'mpfb_male', armour:{head, torso, legs, feet}, hair, beard, skin:'#rrggbb', hair_color:'#rrggbb', eye_color:'#rrggbb',
morph:{ <slider>: -1..1 }, ancestry:{african, asian, caucasian}, people, dye:{slot: '#rrggbb'} }`. Colours are albedo.

**Clips** (`data/clips.json`, about 140 in each body's `anims.glb`): walk, run and the idles, plus actions grouped
as move, melee, ranged, block and dodge, hit and fall, swim, ladder, daily life and work. Two sources, both retargeted
onto the rig by `make_pieces.write_anims` (bone directions matched, hips motion scaled by height):
Meshy's animation library (`meshy` ids, fetched on the scout donor's rig with `tools/meshy.py anims`, 3 credits each:
`donors/anims/actions*.glb`) and Quaternius's Universal Animation Library 1 and 2 (`ual`, CC0:
`donors/anims/UAL*.glb`, an Unreal-style skeleton mapped by `NAME_MAP`). `loop: false` clips play once and go back
to the last loop. Loops play in place: their drift over a cycle is taken out and kept as `root_speed` (m/s, in
`skeleton.json`'s clip list) for a game to move the character by; one-shots (rolls, knockdowns) keep their motion.
Neither library has hoeing, hammering, a pickaxe or a straight thrust, so some clips are made (`derive` in
`data/clips.json`, `make_pieces.derived_clips`, posed with `_Rig`: forward kinematics on the canonical skeleton, a
two-bone solve per arm, the hand turned to hold its prop a given way). **Hammer at anvil**, on the standing idle: the
spine leans into each blow, the right hand lifts the hammer over the shoulder and brings it down onto an anvil just
below the hips in front (the handle forward and the face down as it lands), and the left hand rests on the work.
**Dig (hoe, pickaxe)**, on the standing idle: both hands on the handle, lifted before and above the right shoulder
and brought down in front as the spine bends into it (it was the one-handed heavy swing looped, its left arm across
the chest; then the lift's top sat over the shoulder, and the left hand reached behind the head for the handle, its
arm round the neck). **Thrust / stab** (dagger, sword), from the combat stance: the hand drawn back to the ribs and
driven straight forward at chest height, the point leading, the right shoulder turned into it (Meshy's 'Thrust Slash'
stabbed overhand, the point up). **Spear thrust**: the same underhand, the right hand at the hip on the butt end and the
left forward on the shaft. **Spear advance** keeps Meshy's 'Spear Walk' legs and body (fetched as `spear_walk@src`, a
source only) with the arms at the spear thrust's guard (it held the spear with the right hand behind the back).
A clip whose hands only gesture at a place has them put there (`derive: {hands: {R|L: head | belly | chest}, from}`,
`make_pieces.hands_clip`; the made clip takes its source's place in the list): **Confused Scratch** lays the right palm
on the crown, fingers back along the scalp and the forearm up over the head from in front, wherever the clip lifts that
hand near it (it scratched the air 10 cm over the crown, then held the hand up like a claw, the wrist bent back), and **Sleep** lays the right palm on the belly and the left on the lower chest (both hands were held up
in the air). The skull ball and the body's front come from the base mesh. Every retargeted clip also has its elbows
kept from bending backwards (`elbow_limit`): the hinge is fixed in the upper arm, across it and the figure's forward
at rest. An arm whose least bend in the clip is under 3 degrees has its forearm turned forward about the hinge by
enough to bring that least bend to 12 (a relaxed arm), at most 25, the turn fading out over 80 degrees of further
bend, so the clip's own elbow motion stays; a frame still under 3 after that (a slash) is turned up to 3 (idles 7 and
12 and the backward walk opened 13 to 17 degrees past straight; a floor at 3 alone held idle 12's arms straight and
rigid; a reading past 45 degrees backwards is a deep bend with the upper arm turned on its axis, which the fixed hinge
misreads, and is left alone).
**Props** (`tools/make_props.py` -> `pieces/props/*.glb`, `data/props.json`): 20 hand-held things built from
primitives (sword, dagger, axe, mace, war hammer, spear, shield, bow, crossbow, rifle, pistol, pickaxe, hoe, hammer,
bucket, cup, lantern, torch, bowl, bread) and an arrow, each modelled in the grip frame: +Y along the handle out past the index
finger, +Z the way the fingers point, +X out of the palm. `make_mpfb.py hands()` measures that frame on each body's rest
hand (skeleton.json `hands`: the grip in the hand bone's space, the arm's three bones, and per grip style, per finger
joint, the rotation that closes the hand: `fist` round a handle, `trigger` with the index finger along a gun, `wide`
round a cup; a prop's `grip` picks one). A clip's `hold` in `data/clips.json` names the props each hand may take,
default first; `fig.hold({R, L, both})` hangs the GLBs under the hand bones and curls those fingers after every frame
of the clip; the Animation Lab's Holding picker swaps the right hand's prop among the clip's choices. The shield is
held by its centre grip with the board out past the back of the hand (made the other way, every clip faced its boss
into the body); in a lower hand a prop with `low_turn` turns about its handle so the shield stands up, board out.
A prop with `hang` (its axis that points down) turns about the grip so that axis points down whatever the hand's turn:
the bucket and the lantern hang plumb from their bails (they followed the forearm). A prop with `upright` (its axis
that should point up) turns the wrist to keep it up, as far as the hand is not at the face (`standUp`, `_stand_up`): the
cup stands upright in the hand and tips only to drink (the left hand held it upside down); the bowl, held in an open
hand (`grip: 'flat'`: the clip's own fingers), turns the palm up under it. A prop with `carry` (the bowl) is first held
in front of the belly: the wrist goes to that point (metres from the lower spine joint: out to the hand's side, up,
forward) by the arm's two-bone solve (Eat swung the arm back and down, through the bowl).
A weapon's `blade` (its striking part along the handle) keeps out of the head, the neck and the trunk (`bladeClear`,
`_blade_clear`): the wrist turns until the blade passes the skull's sphere (with the hair), a taper down to the neck
joint and the trunk's capsules, each widened by half a blade's width; the turn carries over from frame to frame and
eases back to the clip's over 0.3 s, so the blade stays on the side it went round (starting afresh each frame flipped
it across the head in Block 2). `fig.bladeNeed` (`blade_need`) says how deep it still was.

*To the face.* A clip's `face` in `data/clips.json` brings a hand to the face (`toFace`, `_to_face`): the hand's point
(`point`, in its grip frame: a cup's rim, a bite of bread, the bow string's place in the hand) goes onto one of the
face's points by the arm's two-bone solve, the hand keeping its turn. The points (`data/clips.json faces`, per body,
metres from the head joint in the figure's frame at rest, turned with the head; a giant's are the man's times its
scale): `mouth`, `sip` (a cup's or a bite's middle at the lips), `anchor` (a drawn bow's string hand, under the side of
the jaw) and `head` (the skull's middle and radius, for `blade`). With `when` (spans of clip seconds) it does so in
those spans, easing in over `ease` and out over it after a span's end (a span at a loop's start or end runs on round
the loop); without, as near as the clip brings the hand (full within `near[0]`, none beyond `near[1]`). Drink holds the
cup in the left hand (the clip drinks with it) and brings its rim to the lips from 2.4 to 5.2 s; Eat (`ual_consume`:
the library's clip only reaches out at face height) holds bread in the left hand and a bowl in the right and puts the
bread to the mouth from 0.3 to 1.1 s; the four bow clips draw to the anchor in their full-draw spans, with `level`:
the arrow, string hand to bow hand, points up at most 6 degrees (the bow arm comes down to it). `fig.faceW`
(`face_w`) is how far it went.

*Two hands.* A clip's `two_hands` names the props the left hand also holds in it (the spear, the rifle and crossbow,
the hoe, the axe, the war hammer and the mace in the clips made for them, and the two-handed parry). A prop's
`support` is a segment of its handle; each frame the left hand goes to the point of it nearest where the clip has the
hand (within the arm's reach, a hand's width from the right hand), turned round the handle so its fingers point away
from the shoulder, and a two-bone solve (upper arm, forearm; the elbow kept on the side the clip bends it) brings the
arm there. When the left arm cannot reach, the right brings the prop toward the left shoulder by the shortfall (up to
45 cm) and both reach; if the hands are still too far apart the arms ease back to the clip's own pose
(`fig.reach` says how far short the hand fell). The hand's thumb side along the handle is the clip's at the hold's
first frame and kept while the clip plays (chosen every frame, the left hand flipped half a turn round the hilt in
Two-handed parry as the clip's hand passed square to it). The pistol's support is one point, so in Pistol stance and Pistol
aim the left hand cups the right hand's fingers. A clip with `lead_left` (Two-handed parry: its left hand is above the
right, toward the blade) takes a prop with a one-point support the other way round: the prop slides half the support's
offset up through the right hand and the left holds above it, so the forearms do not cross (they went through each
other).
*The bow* has no modelled string: the figure draws it between the limb tips (`string`), through the right hand while
that hand is behind the bow, turns the bow about its handle to face the drawing hand, and lays the arrow from the
string hand to the bow hand (`fig.drawn`). The arrow is `arrow_arm` (1.65) times the bow arm's length, shoulder to
wrist, on each body: a full draw is about 1.5 arms, so a 78 cm arrow ended behind the bow on the tall bodies and stood
far out on the short ones; and while it is nocked the string hand draws at most 5 cm short of it (the right arm reaches
in). When the arrow is on the string comes from the clip: `nock` in
`data/clips.json`, spans of clip seconds from nocking to the loose, so every body looses together (the hand leaving a
zone round the bow loosed the long-armed bodies early) and a hand passing behind the bow later draws nothing (the arrow
came back at 7.69 s in Draw from quiver). A bow clip without spans guesses from the hand's place (behind the bow and
near its middle; the arrow once the string is pulled 20 cm). The bow is canted about the arrow's line (so the string
stays in the hand): at full draw (`faceW`) toward upright but for 15 degrees of the clip's lean (Draw from quiver held it
40 degrees over, a limb at the hip), and then by the least of 10-degree steps that keeps its limbs (sampled every 12 cm) out of
the legs' capsules widened by 4.5 cm for the trousers and the limb (Bow aim and scan put the lower limb through the left
leg; the bare capsules let it through the cargo trousers by up to 5 cm); `fig.bowState()` (`bow_state()`) gives the
turn, the cant, how deep the limbs still are in the legs, whether the arrow shows and how far its head is in front of
the bow (`ahead`).

**Voth clothing** (`tools/make_garments.py`, Blender + MPFB): the Chichani's own clothes in three classes per body,
made here as MakeHuman clothes (so MPFB fits, weights and morphs them like the library's): peasants in undyed maguey
and cotton (a field cloak and loincloth; a plain huipil and wrap skirt; maguey sandals), tradesfolk in dyed cotton with
banded hems and step frets (a sashed xicolli over a wrap kilt under a shoulder mantle; a banded huipil over an ankle
skirt; heeled sandals laced up the shin), and the court in Voth's purple and ash-white with crimson, gold and quetzal
green (a robe with bell sleeves, a feathered mantle, a gold collar and a cloak over a long skirt and apron; a huipil
under a pointed quechquemitl cape over a two-tier skirt; gilded sandals and greaves). Aztec cut, Dunmer layering.
Headgear is its own slot (`head`): tradesfolk wear a wrapped head cloth with a hanging tail (it hides the hair: kit
item `covers_hair`), the court a gold band with a quetzal-feather fan that sways. Headgear only comes with a people's
outfit; a random stranger never draws it. Every Voth item carries `culture: 'chichani'` in the kit, so only Chichani
strangers draw them (`KCHAR.stranger`).
**Fabrics.** Every part is painted (colours, bands, motifs) and then takes a material-library set's grain, multiplied
into its colours at a clothing tile size (`FABRIC`, 12 to 30 cm a tile): the set comes from the paint's base colour
(`FABRIC_OF`: maguey burlap, linen, coarse cotton, the Republic's wool and quilting, velvet, silk, bazin, leather,
buckskin, fur, felt, nacre, the metals; a plain weave otherwise) or `P(fabric=)`, and boots and sandals take leather.
Named per garment: plaited straw for the petasos and the Fulani cone, astrakhan for both papakhas, brass braid for the
Hall's festive epaulettes and the Free Giants' torc, glass beads for the Dalab bead cap and the Beast Riders' bead
belt (and the `beads` motif), oiled cloth for the Izani rain hood.
**Fur.** A garment's fur (the parts whose fabric is `fur.*`, but a sole; and a `feather` or `solid` band in the fur
colours, a cape's edge) stands off the cloth as shells. `make_garments.py` `fur_of` writes its rows of the texture into
the `.cloth.json` (`[v0, v1, kind, mu, mv]`: glTF v, the kind from the fabric, the metres a unit of u and of v spans),
`make_mpfb.py` carries them into the kit item's `fur`, and `tools/fur.py` derived them from the published pieces for the
garments built before (2026-10-26: the ushankas, the papakhas, the Beast Riders' hat, horned cap, pauldron, boot cuffs and
riding trousers, the festive cap's band and the gown's cape edge). The figure (`50-figure.js` `furShells`; Godot
`kchar_fur.gdshader` chained by `_fur`) draws `layers` copies of the fur rows' triangles, each a little further out along
the skinned normal after the push, combed down, keeping only the texels a strand passes through; they share the
garment's attributes and skeleton, so the morphs, the clips, the push and the dye carry over. A legs item's fur lies
between the top of the boots and the lowest hem of the top (tucked in, it came out through the shafts and a deel's
skirt). The look per kind (`short`, `astrakhan`: pile, strand spacing and width, comb, clump, root shade, tip, vary) and a
per-item pile factor (0: none) are `data/fur.json`; the crowd's baked looks leave the shells out.
**Therian heads** (2026-10-26; `tools/heads.py`): a body mod (slot `mods`, group `head`) that replaces the MakeHuman head
with an animal's, so far the **coyote head** the Coyote Men's strangers wear (`data/peoples.json` mods). It is made without
Blender from the body's own base: a signed distance field (cranium, muzzle, jaw, cheeks, nose pad, ears, a plug into the
neck, the eye sockets cut out) placed from the base's head at rest, meshed by surface nets on a 4 mm grid; vertex colours
for the coat's pattern (a darker saddle, pale cheeks and throat, a dark nose, lip line and eye rims) that the kit's `coat`
tint (the hair colour over the head's base shade) multiplies; a UV round the muzzle's axis; its fur cover and metres per
UV in the second UV, which the figure's fur shells read (`furShells` `uv2`, Godot `_fur` mode 2; the nose, lips and eye
rims bare); amber eyes of its own. Each vertex takes the morphs of the nearest skull vertex (`_VIDX`; not the face's, so
the face sliders leave the muzzle alone), weighted to the Head and into the Neck at the cut. The item hides the head's
skin, the brows, lashes, eyes, lips and ears (`hide_parts`, which `KCHAR.hiddenParts` now takes from mods too), the hair
and beard (`covers_hair` on a mod), and is `furred`, so a coat runs on up the neck under it. `make_mpfb.py` makes it with
the other mods (its morphs, the Godot shapes and the skin regions from the export); `python3 tools/heads.py <body> <base>`
makes it alone (the morph file the base skin's own entry under the head's materials, the Godot shapes empty).

**Coats** (2026-10-26): a furred body, a record's `coat` (an id in `data/fur.json` `coats`; a record without one has
no `coat` field). Four so far: a shaggy pelt (the Khaayken; 5 cm), a coyote's brush (the Coyote Men; 2 cm, agouti, its
face furred but for the eyes and mouth), a short coat (sleek, an animal's) and body hair (sparse, on the chest, arms and
legs, its colour taken partway from the skin's toward the hair's: `ink`). A people with a `coat` in `data/peoples.json`
gives it to every stranger (`KCHAR.stranger`, no draw of its own): the **Khaayken** and the **Coyote Men** (the owner,
2026-10-26: both furred), drawn on the human body until the Khaayken's 1.15 scale (Y5) and the Coyote Men's coyote head and
digitigrade legs (a body of their own) are built. Each vertex of the
skin's own primitive gets a cover, its joints' covers (`cover`, by joint name without its side; `fingers`, `*`) summed
by its skin weights, less the parts left bare (`bare`), found in the rest pose: the face (an ellipse on the head's front,
chin to brow; or within it only the eyes and the mouth, for a furred face), the palms (the hands' undersides) and the soles. The shells (`50-figure.js` `coatShells`, Godot
`_coat`) take the skin that the clothes leave and fade in over three rings from what is hidden, so a coat stops short of
every garment's edge; their strands run on the skin's UV map scaled to metres per vertex, in the hair's colour; a kind
with `undercoat` has its first layer whole where the cover is dense, and a coat hides the skin parts it lists
(`hide_parts`: the nipples). The Cosmetic Lab's Head page has a Coat picker.
The cross-stitch, Saxon rosette, bogolan and feather motifs take their stitches from the pattern sheets
(`SHEETS`), recoloured in each garment's own two colours. The sets and their sources: `prompt-clothes.md`.
Each garment is built on the body from lofted parts: rings cast out from an axis (the spine, an arm through its
elbow, a foot) to the skin and set off it; below a hang line a ring only grows (cloth falls straight from the chest
or the hips instead of hugging the waist) and spans hollows (its convex hull: between the breasts, round both legs);
tunics are fitted to the skin without the arms, so the arms pass through armholes the sleeves cover; mantles and
capes are fitted over the arms. Rows below the crotch match MakeHuman's skirt helper, and `make_mpfb.py` pools the
legs' skin weights below the crotch (`skirt_weights`), so a skirt or a robe's hem swings as one piece instead of
parting round each thigh.
The textures are painted in the same script (woven grain, hem bands, step frets, zigzags, the diamond of Voth,
feather scales). `--render <dir>` loads the garments back through MPFB and renders each class front, side and back.
`data/peoples.json` gives the Chichani `outfits` per class (torso, legs, feet and, above the peasants, head) and `tiers` (60 % peasants, 30 % tradesfolk, 10 % court):
their strangers and crowds are dressed by class (`record.tier`), and the Cosmetic Lab's Gear tab puts any of the six
outfits on with one chip. Its Wardrobe row narrows the clothing pickers to one people's clothes (the kit item's
`culture`), MakeHuman's library (no culture) or all of them; picking a people on the Head tab opens its wardrobe.

**Izani clothing** (the same tool, `iziz_*`): Iziz's people, science fantasy without the machines (a thousand years
in the Ancients' ruins, in a rain jungle; LORE.md 6.2, `settlements/iziz/DESIGN.md`). Commoners in undyed oat and moss:
a wrap tunic with a sash and its hanging end, bark-brown field trousers, shoes with cloth wound up the shin, and a rain
hood with a cowl (it hides the hair). The guilds (salvagers, hunters, the Watch) in sand under saddle leather: a tunic
under a long open-fronted coat with a standing collar, a belt with pouches, a plate of salvaged Ancient hex armour on
the left shoulder, slate trousers tucked into tall boots. The court in verdigris and cream with copper: a long robe with
bell sleeves, a high collar, the sun of Iziz woven down the front as a tabard and a sun-orange cape (a gown with a
floor-length train over a cream skirt for women), soft court boots, and a sun crown: a gold circlet with the palace's
orb at the brow and a rigid sun halo of copper rays behind the head. The parts the Voth set lacked are in the tool:
`trousers` (a seat and two legs through the knees), `boots` (sole, shaft and a foot closed past the toes, roomy at the
top so trousers tuck in), `hood`, `blob` (pouches, the orb), `pauldron`, and paint `panels` (a column of motif down a
tube: the woven tabard). Made clothes that hang (tunics, coats, robes, skirts, not trousers: `make_mpfb.hangs`) pool
their leg weights, are pushed out of the legs and hide no skin below half height; `culture` comes from the prefix.
`data/peoples.json` dresses Izani strangers by class: 55 % commoners, 32 % guild, 13 % court.

**Beast Rider and Hykkousoi clothing** (`beast_*`, `hykk_*`). The Beast Riders are Mongol and Apache:
- **Tribesfolk:** a fringed buckskin shirt with a bead yoke, leggings and a breechcloth, knee moccasins, a headband
  with a tail.
- **Riders:** the deel (the wrap coat, its closure off to the right), a sash under a stack of animal belts (tiger,
  snake, teeth, claw) with trophies hanging, a bandolier of teeth, a fur pauldron, riding boots, a fur-brimmed hat
  with a spike and two quills.
- **Chiefs:** the tribes' green deel with a quetzal mantle and outsized bone pauldrons (men), under bone horns on a
  fur cap (men) or the Khalkha winged headdress hung with beads (women).

The Hykkousoi are Greek and Roman, of the sea:
- **Sailors:** the exomis, pinned over the left shoulder so the right and its gills are bare (a short chiton for
  women), a rope belt, sea sandals, a broad petasos.
- **Marines:** a cuirass of nacre ribs (pink and green by turns) over a tunic, nacre pauldrons, a short cloak, a
  strip skirt, laced sandals with bronze greaves, a bronze helmet with a sea-blue crest.
- **The Archon's court:** a long sea-linen chiton, a nacre shell collar, the himation across from the left shoulder,
  a cloak, gilded sandals, and a diadem with the wave-sun as a scallop behind the head.

**Dalab and Yuni clothing** (`dalab_*`, `yuni_*`). Dalab is Cahokian earth and Tiwanaku stone, and its people are
green (the photosynthesis mod):
- **Commoners** dress for the sun, the skin bare to it: a kilt or wrap skirt with the step fret, a sash from the left
  shoulder, bead armbands, and a breast band for women.
- **Traders:** a sleeveless terracotta tabard with a turquoise step panel, a belt with pouches, calf trousers, laced
  sandals, a bead cap.
- **Genepriests:** white with the holy red, The God's eye woven down the front, a gold pectoral of rays, bell sleeves,
  a red train for women, and the mitre of the Eye (a tall gold mitre with the one great eye on its face before a halo
  of rays).

Yuni is Sahelian, with Gaudi and Burmecia for the families:
- **Commoners** in bogolan mud-cloth: a boubou or blouse, loose trousers or an indigo wrapper, a Fulani cone hat or a
  head wrap.
- **Merchants:** the grand boubou (one great sheet over the arms from the shoulders to the shins, its chest worked in
  yellow), under-trousers, babouches, a kufi or a towering gele.
- **The families:** a gown banded in trencadis mosaic, a scalloped mosaic collar, bell sleeves, silk babouches, and the
  hyperboloid of Yuni as a hat.

**Iron Republic clothing** (`rep_*`, `iron_republic`). The Republic was born of a legion's mutiny (LORE.md 6.3) and is
austere and military: its citizens dress as a citizen army, in field grey, drab and iron black wool cut like uniforms,
the Republic's red only as piping and collar tabs, brass only on buttons and buckles, no folk ornament:
- **Citizens:** a grey wool tunic with a standing collar piped red, a button placket and a belt, grey trousers, tall
  black boots, a cloth cap with a red band; for women a plain dark wool dress to mid-calf with a high collar, a belt,
  a drab apron and a plain headscarf.
- **Guildsfolk** (Salvagers, Smiths, Mechanics, Rocketeers), men and women alike: a quilted drab jacket with iron
  salvage plates on the shoulders, a leather apron, a belt with pouches, breeches or a work skirt, work boots, an
  ushanka.
- **The Hall of the Republic:** a double-breasted iron-black greatcoat with two rows of brass buttons, red piping,
  the triskelion of sword-arms small on the collar, plain epaulettes, a leather cross-belt, breeches or a black skirt,
  riding boots and a grey papakha with a red crown.
**Its festive dress** (`rep_*_fest_*`, tiers `*_fest`, about one stranger in ten; an alternative set beside the
austere one, for feast days, weddings and the Hall's ceremonies): the Republic's folk side, Russian and Transylvanian
Saxon. Citizens in a linen kosovorotka worked in red cross-stitch with a red sash, grey-blue trousers, felt boots and
a felt cap with a fur band; women in a red sarafan over a linen blouse, a black apron with a rosette border, a red
headscarf. Guildsfolk in the ochre quilted jacket and brown breeches; women in the long belted Saxon coat in red, a
black skirt with a rosette band and the Borten (the tall black velvet cylinder with ribbons behind). The Hall in
state: a red greatcoat frogged in ochre with a row of triskelions at the hem and cuffs, epaulettes, a cream sash,
cream breeches, a black papakha with a red crown; women in a red velvet gown, a lace collar, a fur-edged cape and
the kokoshnik.
Motifs added for them: `buttons`, `buttons2`, `quilt`, `triskele`, `frog`, `cross` (Slavic cross-stitch), `rose`
(a Saxon rosette). The caps, headscarves, ushankas and papakhas cover the hair (`COVERS_HAIR`); the Borten and the
kokoshnik leave it showing. The textures these clothes (and every culture's) want are in `prompt-clothes.md`: the
library sets they can use as they are, and prompts for the gaps.

Shapes added for them: `tower_hat` (a hat that rises from a band fitted to the head with any profile: the mitre, the
hyperboloid), `eye_disc`, `armbands`; motifs `trencadis`, `bogolan`, `eye`.

All these sets follow the look LORE.md section 5 sets for every culture, Moebius and Jodorowsky's Dune: one big shape per
figure, flat calm colour fields with one accent, organic ornament. The tool's shapes for it: `band` (a tilted band:
bandoliers, the exomis strap, the himation), `horn`, `wing`, `brim`, `collar_disc`, `crest`, `pendants`,
`animal_belts`.

**Body mods** (`tools/mods.py`, `tools/arms2.py`): what a genetic or cybernetic mod adds to a body, worn like an
item (kit items in slot `mods`, the Cosmetic Lab's *Body mods* chips, `rec.mods`). Every body's skeleton carries a
second pair of arms' joints (`Left2Shoulder`, `Left2Arm` ... `Right2HandThumb3`), whether a mod uses them or not. The
copy hangs lower than the upper pair (out of the lower ribs on any torso: `arms2.drop`, 25 cm on the man and the
giant, 20 cm on the woman's shorter torso) and nearer the axis, from Spine2 (`arms2.fwd`: 1.5 cm ahead of the upper
pair on the woman, 1.5 cm behind it on the man's deeper chest), and 30 degrees steeper (`HANG`, near its
usual pose); the joints get their sources' morph deltas (`morph_kit`), capsules (cloth, push) and grips (`hands.L2`,
`hands.R2`). So the clips, the grips and the lower-arm controller are the same on every body, and nothing is drawn on
the joints until a mod is worn:
- `mod_arms_flesh`, the genetic pair: each arm's skin and nails copied onto the lower joints. Its root is
  shrink-wrapped onto the ribs and takes the torso's weights, fading over 9 cm from its open edge, so the arm grows out
  of the side of the ribs and bends with them.
- The cybernetic pairs, one builder (`cyber_arms`) and three designs (`CYBER`): jointed limbs, each part rigid on its
  bone, on a mount plate on the ribs, sized to the body's own arm (`ARM_REF`, the man's), so they fit the woman too.
  `mod_arms_cyber` bronze plates with steel joints and five fingers; `mod_arms_loader` heavy steel with hazard-yellow
  bands, hydraulic rams along each segment and three-fingered claws; `mod_arms_surgical` slim white ceramic with teal
  bands, a cable bundle from the mount into the shoulder and fine fingers. Each joint is a ball wider than the plate
  ends that run into it, so a bend shows ball rather than a gap. A new design is a `CYBER` entry and a `MODS` row.
  Their textures are prompts in `core/materials/PLAN.md` (Characters: cybernetic arms and the giants' metal). The Animation Lab's Body mods menu puts any of them on the whole cast.
- The replacement pairs (`mod_arms_cyber_up`, `mod_arms_loader_up`, `mod_arms_surgical_up`, group `arms_up`): the
  same three designs in place of the body's own arms, on its own arm joints, with a dome on each shoulder over the
  edge of the skin they replace. The item's `hide` is that skin (`arm_skin`: every triangle weighted at least half to
  the arm below the shoulder), which `KCHAR.hidden` (and Godot's) leaves out like a worn item's; the fingers are thick
  enough to hold the body's own nails inside. They wear with any lower pair (`Four bronze arms` in the Animation Lab).
- `mod_gills`, rib gills: four slits a side over the ribs (from the lower ribs up toward the armpit), a lip of skin over a dark slit, ray-cast onto the body. The
  Hykkousoi have them (`peoples.json` `mods`: all their strangers); anyone else can wear them.

A mod's vertices name the MakeHuman vertex whose deltas move them (`_VIDX`), so the sliders reshape them with the body;
the flesh arms and the gills take the skin tint. A mod says what it grants (`grants.arms` 4, `grants.gills`) and its
group (one pair of arms at a time). `KCHAR.arms(rec, kit)` is 4 when a worn mod grants it. No clip moves the lower
arms: the figure drives them from the upper pair after each clip (`arms2` in `50-figure.js`, `_arms2` in
`kchar_figure.gd`), only when the body has four. In most clips they keep a guard of their own (forearms forward, hands
loosely closed before the belly) and take a share of the upper arms' motion by clip group (`SHARE`: a walk or a block
half of it, a blow or a shot little); in climbing, swimming and falling they copy the upper arms whole. They follow
with a lag of 0.09 s, and `bodyFix` keeps them out of the body, the thighs and the upper arms. `hold({ R2, L2 })` puts
props in the lower hands.

*Why not hidden arms baked into every body?* Invisible geometry costs every figure its vertices and morph deltas, and
one fixed pair could not be both flesh and machine. The joints are cheap (some 40 bones that nothing weights until a
mod does), so they are always there; the geometry comes with the mod.

*Four-armed clothing.* Torso items carry an arm count (kit item `arms`, 2 when absent). A four-armed body wears only
four-armed tops, a two-armed body never (`KCHAR.fits`: the wardrobe hides the rest, a stranger is not drawn in them, a
torso that stops fitting when a mod goes on comes off). In `make_garments.py`, `four_armed` opens a top where each
lower arm comes out of the ribs (its holes' vertices dropped, listed in `.cloth.json` `gone` so the cloth chains still
find theirs; straps, belts and jewellery are never opened), `sleeves2` and `armbands2` fit sleeves and bands to
where the lower pair hangs, and `make_mpfb.py` (`mods.fit_four`) gives the lower sleeves the flesh arms' weights,
then splits them into a piece of their own (`mods.split_lower`, kit item `sleeves2`): `KCHAR.parts` draws it over
flesh arms and leaves it off a cybernetic pair (a mod with `bare`). The two-armed library and culture tops have no
four-armed version: only the giants' clothes do, since giants are the four-armed people a city meets.

**Giants** (`tools/giant.py`, `make_mpfb.py giant`): LORE.md's engineered giants, green and about 3.6 m (3.4 to 4.1
with the sliders). A giant is the man's MakeHuman body, built again from his export, with two changes:
- **Big and slow.** `kit.scale` (2.0) scales the whole figure, and its clips play at 1 / sqrt(scale) of their speed (a
  pendulum's pace, `fig.cadence`): a giant walks as something heavy does. A game moving one by a clip's `root_speed`
  multiplies it by sqrt(scale).
- **The man's clips** (`kit.anims`: no anims.glb of its own).

Its four arms are the flesh mod. NPC giants are of two peoples (`data/peoples.json`):
- **Giants of Dalab** (`giants`): street patrols (70 %, two-armed, the Dalab kilt, sash and sandals) and the priests'
  temple guards (30 %, the flesh pair; the god's harness: a gold pectoral of rays, red straps crossing to a gold belt,
  gold bands on all four arms, `giant_dalab_m_harness4`).
- **Free Giants** (`free_giants`), who rebelled and left for Giant Country, dressed as Gauls (weld-yellow and woad
  wool in madder checks, `tartan` and `knot` motifs): clansmen in a belted long-sleeved tunic, checked braccae and
  wrapped boots (55 %); four-armed clansmen (15 %, the tunic with four sleeves); warriors (22 %, four-armed: a hide
  jerkin, a baldric, bronze bands on all four arms, the horned bronze helmet); chiefs (8 %, four-armed: a woad tunic
  in black checks, a madder sagum pinned with a bronze brooch, a gold torc). The four-armed among them are temple
  guards who escaped.
The giants' own clothes (`giant_*`, made on the man's body) are worn only by the giant; of the man's items the giant
wears a few (the Dalab kilt and sandals, the Voth loincloth, the bead cap, the sun sash, some hair and beards: kit
culture `giants`).

**Cloth** (spring-bone chains): the Voth garments' hanging parts swing. `make_garments.py` picks chains on each
garment as it builds it (every ~7.5 cm round a skirt or robe hem, ~10 cm across a cape, flap or apron; a bone per
~12 cm, shorter near the top), from the row where the cloth starts to hang down to the hem (a robe or dress that
reaches below the crotch hangs at the back from just under the seat, not from the chest or waist, so the buttocks
never push through it), each chain hanging from
the spine joint above it, and writes them beside the garment (`<id>.cloth.json`). `make_mpfb.py cloth_bones` turns
them into joints of the garment's GLB ('cloth:<item>:<chain>:<bone>', inverse bind T(-p) at an anchor vertex) and
weights the cloth below each chain's top to the two chains either side and the bone of its stretch, except cloth that
lies on the body: within 4 cm of the skin it keeps the body's own weights, fading to the chains' by 9 cm (`CONTACT`),
so a tilma lying on the back, a mantle over the shoulders and a skirt's band over the hips move with them (on chains
held by the chest a cloak swung into the small of the back as the idle leaned forward); never over the legs, where a
skirt lying on a thigh must leave it as the leg swings, nor for a legs item at all (a loincloth's back flap took each
buttock's weights and pinched to a strip as the legs stood). A mantle or a cape (layer 2) lies on the garment's own
layers under it as on the skin (over a tunic's shoulders or a bone plate it stood more than 4 cm off the skin, went to
chains held by the spine, and the shoulders came out through it as the arms came down from the A-pose), and where it
hangs clear of both it takes none of the arm's weight, the collarbone's instead (a cape's side edge took the A-posed
upper arm's and swung out as the arm came down); within 1 cm of that cloth it takes its weights outright, fading out by
5 cm, so the two move as one. Only cloth that does not hang counts (a tunic above its chains, a plate, a collar): a cape
counted as lying on a robe's swinging back took the hips' and thighs' weights and the robe swung through it; nor does
the skin of an arm (a cape's flared side near the A-posed forearm took its weights). `kit.json` keeps
per chain its parent joint and anchor vertices, and `skeleton.json colliders` the body's capsules (thighs, shins,
pelvis, chest, arms: a base radius and its change per morph target, `KCHAR.colliders`; for the push a radius at each
end, `ra` and `rb`, since a limb tapers; and the seat, a pair of upright capsules behind the hip joints that cover the
buttocks, whose ends are rest points carried by the Hips joint, `pa` and `pb`). The figure (`50-figure.js`
cloth section; `kchar_figure.gd _cloth_*`) reads each chain's rest off the morphed garment. **The rest follows the
body, not the A-pose** (`HANDOFF-CLOTHING.md`, 1): `kit.json` keeps per chain point the garment's own body weights
from before the chains took the cloth (`bw`, `make_mpfb.py cloth_bones`), and while a clip plays a chain wholly above
the hip joint rests where those weights (not the legs') put each of its points in the current pose, and one reaching
below the hips keeps the shape it was fitted in, placed by the hips and turned with their heading only (cloth below
them hangs, whatever the pelvis' tilt), its top point where its weights put it and that point's offset fading out down
to the hip joint (`rigidTargets`, `_rigid`; the chain's root joint is placed there each frame). Turned with the whole
pelvis and carried whole from its top point, a court robe's back panel hanging 1 m from the chest sank into the
buttocks in an idle (the chest leans 10 cm ahead of the hips, the pelvis tilts back), and the layering threw it out
in front, through the body, wide as a wing (the court robes, the chief's apron: half a metre off rest). A loose chain wholly above the hips (stiffness 0.1 and under; a blend up to 0.3, past which a mantle lying on the
shoulders follows the body as above) hangs too: its fitted shape from its top point, turned with the heading only.
Followed point by point, the Chichani tilma's front tilted out 45 degrees with the idle's forward lean and stood off
like a shelf (its fitted shape hangs within 5). Held rigid by the chest, a mantle's back stayed where
it was fitted while the spine under it bent in the clip and the posture pass drew the shoulders back, and the tunic it
covers came out through it over the whole upper back; followed point by point below the hips, a robe's skirt bunched
at the legs and its cape went round to the front in a stride. In the A-pose (no clip, no posture) the chains rest as
fitted (`posedRests` also reads the postured bind rest, `placeChains`). So a broad or tall body's
skirt hangs from its own hips, then runs every chain point as a Verlet particle at 60 Hz: pulled to its rest
by the part's stiffness (mantles stiff, capes loose), under Krator's gravity (7.4 m/s²) and the drag of Voth's dense
air, with the wind of a walk or run played in place (its `root_speed`), kept to its length, near its neighbours round
a skirt, out of the capsules (not the arms': an elbow hanging at the waist pushed one chain of a cape's edge out and
the cloth below it swung away alone as a spike; the push keeps vertices out of the arms) and above the floor; each bone then turns to the next point. A point inside a limb
that lies across the cloth's fall (a seated thigh, a raised arm) leaves on the side of the point above it, so the
chain drapes over the limb; along an upright leg it leaves on the side away from the body's axis, so cloth never
ends up behind a leg in a stride (the legs only: on the trunk, the chest leaning forward in a clip, that threw a mantle's
points through the body; and not for a point whose rest lies on the thigh's inner side, between the legs, which it threw
out through the thigh). A point is pushed no further out of a capsule than its own rest lies (a robe's chain roots sit
inside the trunk's capsules, and a full push threw the point below each sideways: a Z at every chain's top, the fold),
but out of a leg at least to the bare limb (a skirt's rest follows the hips, and a thigh swung forward over it would take
the cloth in). The seat's two capsules count as one across the buttocks for the chains. `verify.py` measures the fold
on the court robe and skirt (chain segments past 1.5 rad of their rest, idle and walk: 0) and `kchar_test.gd` the same
in Godot. `fig.cloth = false` hangs
them rigid (the Animation Lab's Cloth button). Each part has a `layer` (0 a skirt, 1 a robe's hem, a flap or a
skirt's over-tier, 2 a cape, a mantle or headgear), within its item's slot (legs under torso under head: the figure
adds 3 x the slot's rank, so a breechcloth's flap stays under a shirt's skirt): a chain point stays 3 cm outside the
lower layers' chains near it,
measured out from the body's axis (`layered`). Inside one garment a skirt under an over-tier or apron goes further:
`make_mpfb.py cover_weights` gives each covered vertex the weights of the outer part's nearest vertex, so where the
two overlap they move as one and cannot cross. The same goes for a part that does not hang under one that hangs over
the arms (layer 2: the grand boubou's under-tunic under its sheet, a robe's body under its mantle or cape): each of its
vertices with the outer part within 8 cm straight outward of it takes that part's weights (in full within 5 cm), so a
seated or crouching body cannot carry it out through the sheet the chains hold. Sleeves (weighted to the arms) and
what lies outside the outer part (a belt across an open coat's gap) keep their own.

**Clipping** (both runtimes, every frame after the clip): a garment marked `loose` in the kit (the Voth tunics, robes
and skirts, the kimono, the long skirts) has every vertex pushed out of the thighs, shins and feet on the GPU after
skinning (`pushOut` / `kchar_push.gdshader`, which in Godot also carries the garment's own look: albedo, alpha
cutoff, normal map), so a knee cannot come through between two chains, and out of the seat, so a robe's back covers
the buttocks. Each capsule's radius runs from `ra` to `rb` along it (the thigh from about 12 cm at the hip to 8 cm
at the knee, the shin from 8.6 cm at the calf to 5.3 at the ankle on the man): at one radius the calves and the tops
of the thighs came through the robes. The upper arms and forearms keep one radius (tapered, they drew a tunic's
sleeve and the mantle over it into the same shell, and the mantle broke up jagged). They are hard
capsules in the same pass (only what is inside them moves), so a raised arm lifts a mantle's or a cape's hem. The push is a soft
band, not a projection (a vertex d from the bone within r + 1.5 cm lands at r - 1.5 cm + d x 3 cm / (r + 1.5 cm)), so
two tiers keep their order and cloth that already lies right barely moves (a 4 cm shell outside r moved everything
within 4 cm of a capsule out by up to 3 cm, and a loincloth's flaps, a kilt's seat and a robe's back crumpled at
rest); a thigh pushes nothing behind it in its top third (its capsule runs down the femur, toward the outside of the thigh,
and at the radius that covers the flesh within it took in the buttock: the seat covers that), though in front it
does (else a kimono showed wide harem pants at the hips); a garment of a band and flaps alone (`make_mpfb.py FLAPS`:
the loincloth) is not pushed at all, its chains keep it off the legs (pushed, a flap between the thighs in a stride
went out of each sideways and its corners stood out like wings); a vertex inside a leg leaves on the side away from the body's axis, never behind the knee, and the deeper it lies the more
it goes straight out that side (near the bone the way out from it is noise: a robe's front, left inside a raised thigh in a
run, split left and right round the knee and showed it), and the side is the one the cloth faces (its skinned normal:
a leg swung back has the body's axis in front of it, and a skirt's front sent out the back left the leg bare); a skirt
is pushed 2 cm wider as a robe is (`PAD_SKIRT`: at none a run's knee came through the novice's wrap skirt), and a robe
over one by that more; and a
torso garment's shell is 2 cm wider (at 1.2 cm a bent knee's thigh came through a gown's front), so a robe's hem
lies over the skirt under it, and 3.5 cm wider again over
trousers (at 2 cm a stride's knee came through a deel's front; trousers stand further out of the capsules than a skirt's chains). The chains collide the same way,
and still do with cloth off (no swing then: each frame starts from the rigid rest). A top that closes round the waist
(kit item `tucks`, `make_mpfb.py encloses()`: rays out from the hips meet it all round; an open cloak or a cropped top
does not) has the trousers or skirt under it tucked: their band above the hips drawn in toward the trunk's axis by up
to 2.5 cm, so a waistband stays under the top in any pose (the axis runs from the Hips joint along the way to Spine1,
turned from its rest way: `kcU`; a vertex's height above the hips is the greater of the world's and the trunk's. Drawn in
level, the band at the small of the back came out through a T-shirt in a forward bend, a heavy push or a swim; measured
up the trunk alone, the back of the band sat low in a crouch and stood out of the hem). Under a loose top trousers below the hips are drawn in
to within 8 mm of the legs' capsules, all the way down under one that reaches below the knees (kit item `long`: a robe,
the kimono), else down to its hem (kit item `hem`, `make_mpfb.py hem_depth`: a fraction of the hip-to-ankle length,
measured down the leg, so a raised thigh keeps it; `kcSH`), below which they are as wide as they are (their
tapered radii; each vertex to its nearest capsule only: drawn to all six, a shin's was pulled into a ball round the
knee and the inside of each leg toward the other, and the court's legs came out thin), so wide ones (harem pants)
stay under it (`kcS`): at one radius per capsule they sank into the calves
and the court's legs read thin, and drawn in less (2.5 cm) they came out through the robes' knees. Boots under such a
top are drawn in to within 1.4 cm (`kcSF`; Godot sets `kcS` on the feet part), whatever the legs wear: the hero boots'
cuffs came through the kimono's hem at the shins. Breeches and braccae have legs, so like trousers they are not
`loose` and their weights do not pool below the crotch (`make_mpfb.py hangs`): marked as skirts, the Republic's
breeches and the giants' braccae were pushed off the thighs and swung as one sheet.
**A garment's back faces** are drawn 1 cm further from the eye than they are (`BACK_DEPTH`, the fragment's depth; the
twin's shader too): where the push or a chain folds the cloth over itself its inside lay at the outside's depth and
showed through it in blue-grey patches (a shirt over the hips in a walk, the court robe's back); an inside nothing
covers (in a sleeve, under a hem) still shows. **Belts round the hips** and what hangs from them (`make_garments.py`
parts named `_belt`, `_trophy`; the `.cloth.json`'s `hips`) are weighted to the hips alone (`mods.pin_hips`): from
the body they took the thighs' weights, and the chief's stack of four sheared into fins in a stride.
**Headgear** moves with the head: `make_mpfb.py head_weights` gives every vertex of a head item above the neck the
Head joint's weight alone (MakeHuman weights a garment from the skin nearest it, so a broad brim, a wing or an ear
flap took the shoulders' and arms' weights and bent as they moved), and so does every piece of it that reaches no
lower than the neck joint (the chieftess's wing tips and the bead strands under them hung below the cut and trailed
out to the shoulders as long streamers); a hood's cowl and a headband's tails, lower, keep following the neck.
**The feet roll on their balls**: `toesFlat` (`_toes_flat`) turns each toe joint up after the clip until a point 6
cm ahead of it (scaled with the figure) is no lower than the ground, so a clip that stands on the ball of a foot does
not push the toes, and a sandal's sole with them, down into it.
`bodyFix` (`_body_fix`) keeps limbs out of each other after the clip (a heavy body in a clip made for a slight one,
or a clip made for no body in particular). Each limb is a segment with its capsule's radius (`skeleton.json
colliders`, the legs' tapered `ra` to `rb`), kept 8 mm clear. A leg in the top of an upper arm (a knee raised to the
shoulder in a climb or a crouching throw, which no turn of the arm clears) swings out to its side at the hip, by at
most 20 degrees (always out, so the push never jumps sides between frames); two thighs that overlap turn apart. Then
each upper arm turns at the shoulder and each forearm, with the hand to the knuckles at the wrist's radius, at the
elbow, out of the pelvis, the trunk and both legs' thighs and shins, the deepest point first, twice over (hands
through the thighs in the sits, an arm into the knee in sit down). Above the pelvis the trunk is the chain through
`skeleton.json trunk` (`make_mpfb.trunk`: per spine joint the body's cross-section, an ellipse of half width `w` and
half depth `d` whose middle lies `f` forward of the joint, which is near the back; scaled as the chest capsule's
radius under the morph): the round capsule on the spine left the man's chest 5 cm outside it, and an arm hanging in
front of it went in (the injured walk). Against the trunk only the elbow's end of the upper arm counts, and not the
top of the chest: the shoulder and deltoid sit against it, and an arm raised before the chest is held there. A knee
in front of the belly is left be (a sprint's raised knee and a crouch's thighs meet the trunk's capsule without
going through the body). The upper arm from 0.4 of its length also keeps out of the skull (`data/clips.json` faces
head; idle 14 swung it through the head); the forearm and hand may come to it (a scratch, a palm on the brow, a
guard at the chin). The unused lower-arm joints of a two-armed body take no part. The pushes are continuous in time:
each bone's turn is kept from the frame before and eases back to the clip's as the clip moves on (over 0.25 s of
clip time, by the clip's own time, so the lab's frame steps behave as playing does), and a push turns a bone at most
2.5 radians a clip second; pushing on from the kept turn keeps a limb on the side it went round, where solving
afresh each frame threw an arm across a thigh in one frame (sit down, the stool, the throw, the ledge climb; up to
85 cm in a frame, now about 10 at most). A kept turn is held to 20 degrees on a thigh and 1.2 radians on an arm. The
capsules are in the skeleton's units, scaled by its world scale (a giant's).

**Posture** (both runtimes, first after the clip): the clips, retargeted onto MakeHuman's curved spine, stand with
the chest pushed forward and the upper body leaning back, so the spine is bent forward, the neck takes much of it back
so the head does not drop, and the shoulders are dropped and drawn back. The owner set the angles by eye in the
Animation Lab (2026-10-20): the woman needs little (Spine, Spine1, Spine2 -6, -8, -8, neck 11, shoulders 9 down and 10
back); the man much more (lumbar 21.5 back, Spine1 40 and Spine2 21.5 forward, neck 40 back, shoulders 30 down). The
upper arms keep the way the clip points them, so a thrust or a held spear still aims where the clip aims it. The
numbers are in `data/posture.json`, which both runtimes read:
- `bodies`: degrees per joint for `mpfb_male` and `mpfb_female` (the giant takes the man's); each figure's live copy is
  `fig.posture`.
- `clips`: per clip key and body, degrees **added** to the body's values while that clip plays (walk and run lift the
  man's chin, sprint and crouch hunch him, so they take less neck or less chest); blended by the playing clips' weights
  through a cross-fade on the page, eased over the same 0.25 s in Godot. Kept under the body whose values a body takes
  (the giant's under `mpfb_male`). Live copy: `fig.postureClips`.
- `frame`: `joint` pitches each spine joint about its parent's side axis as the clip has turned that parent from rest,
  so a twisted or side-leaning torso (idles 5, 13, 14) bends forward along its own facing; about the figure's axis
  (`figure`, before 2026-10-20) the man's large angles kinked his ribs sideways. On an upright torso the two agree. The
  shoulders' drop and draw-back stay in the figure's frame.

**The Animation Lab's Posture panel** (under the review marks) sets them by hand: a slider per joint for the body
chosen, every figure of that body changing at once. **Every clip** edits `bodies`; **This clip** edits the clip playing:
its sliders show the sum, the file keeps the difference, its tuned rows are marked, Clear this clip drops it, and the
ledger marks clips with a posture of their own. Copy JSON gives the whole object (`frame`, `bodies`, `clips`) back to
paste into `posture.json`; Apply JSON takes it, or a `bodies` object alone. The panel keeps its numbers in the browser
until Reset, or until `posture.json` itself changes under them.
**Every frame starts from the clip** (`50-figure.js update`): three's mixer writes a bone only when its value changes,
so on a still frame (paused, scrubbed, a held pose) the passes after the clip turned last frame's already-turned bone
again; each bone is put back to the mixer's own output before the mixer runs. The hips' position track is taken out
of the clips and applied by `hipsTrack` from the rest by each playing clip's weight: left to the mixer, a still or slow
one (driving, kneeling to repair, lying dead) was written on some frames and not others and the figure shook between
the clip and standing. Godot's player writes every track each frame and needs neither.

**Peoples** (`data/peoples.json`): per culture, ancestry ranges, skin colour stops (a stranger falls anywhere along
them), hair and eye colours, the age at which hair greys, beard odds, slider ranges that override the default spread, and
preferred hairstyles per body. The Chichani and Beast Rider entries follow the owner's notes; the rest are proposals
from LORE.md's references, there to be changed.

**Setting up the Blender half** (nothing of it is in the repo, and `pieces/` is gitignored, so a fresh machine
rebuilds the pieces from here). Blender 4.5 LTS from download.blender.org/release (the Linux tarball runs headless
as is); MPFB from extensions.blender.org/add-ons/mpfb, installed with
`blender -b --python-expr "import bpy; bpy.ops.extensions.package_install_files(filepath='mpfb.zip', repo='user_default')"`;
the packs below from static.makehumancommunity.org/assets/assetpacks, and `python3 tools/mpfb_repo.py` for the hair
and beards that come from the community asset repository instead (it applies the texture-name fixes some need), and
`make_garments.py` per body for the Voth clothing. Then per body: `mpfb_build.py` (about 10
minutes: it refits every item once per slider end), `make_mpfb.py`, `build.py`.

**Asset packs** (load them into MPFB once: `bpy.ops.mpfb.load_pack(filepath=...)`): makehuman_system_assets, hair01,
eyebrows01, shirts01, pants01, skirts01, dress01, shoes01, suits01 (CC0); bodyparts05 (beards, CC0); hair02, hair03,
bodyparts06 (CC-BY: `CREDITS.md`).

## Files

| File | What | Port tag |
|---|---|---|
| `src/00-head.html` | the Cosmetic Lab's shell and styles | [web] |
| `src/01-animlab.html` | the Animation Lab's shell and styles | [web] |
| `src/10-rig.js` | `KCHAR`: records, morph weights and joints, strangers, pose (the Meshy kit's sliders), parts, hidden skin. No three.js, no DOM | [G data], twin `godot/krator/character/kchar.gd` (held to it by `tests/golden-mpfb.json`) |
| `src/50-figure.js` | `KCharFigure`: bones from `skeleton.json`, pieces bound to them, CPU morphs, tint, clips | [draw], twin `kchar_figure.gd` (blend shapes from `<piece>.gshapes.bin`) |
| `src/90-editor.js` | the Cosmetic Lab: stage, camera, panel, strangers in bulk; `window._kchar` for `verify.py` and `tools/shots.py` (`_kchar.still` holds the figure) | [web] |
| `src/92-animlab.js` | the Animation Lab: the cast of six, the clip ledger, playback, review marks; `window._lab` for `verify.py` | [web] |
| `data/peoples.json` | the peoples (hand-written) | [G data] |
| `data/clips.json` | the action clips: source (Meshy id or UAL clip), label, group, loop, hold, two_hands (hand-written) | [G data] |
| `data/props.json`, `tools/make_props.py` | the hand-held props (grip style, two-handed support, bow string) and the script that builds them | [G data] |
| `data/fur.json`, `tools/fur.py` | the fur shells' look per kind and per item; the tool that derives a built garment's fur rows from its GLB (`make_garments.py` writes them for new ones) | [G data] |
| `data/posture.json` | the posture pass's angles per body (spine, neck, head, shoulder drop and back); the Animation Lab's Posture panel writes its JSON | [G data] |
| `donors/anims/` | the clip sources: Meshy batches (`idles*`, `actions*`, with their request records) and the UAL libraries (CC0, `UAL_License.txt`) | |
| `data/mpfb_<body>/` | `kit.json` (items, hide bitsets, morph sliders and joint deltas, tint) and `skeleton.json` (made by `make_mpfb.py`) | [G data] |
| `pieces/mpfb_<body>/` | `base.glb`, one GLB per item, `anims.glb`, and a `.morph.bin` per GLB (gitignored: rebuilt from the Blender export) | |
| `tools/mpfb_build.py`, `tools/make_mpfb.py` | the two halves of the pipeline | |
| `tools/giant.py` | the Giants: scale, cadence and what they wear (`make_mpfb.py giant`) | |
| `tools/mods.py`, `tools/arms2.py` | the body mods (flesh and cybernetic arms, rib gills), the lower-arm joints every body has, four-armed garments' weights | |
| `tools/decimate.py` | fewer triangles for a dense item, on a subset of its own vertices (`make_mpfb.py DECIMATE`) | |
| `tools/make_garments.py` | the Voth, Izani, Beast Rider, Hykkousoi, Dalab, Yuni, Iron Republic and Giants' clothing: lofted garments, their textures, written as MakeHuman clothes (run before `mpfb_build.py`) | |
| `tools/layers.py` | what lies over what: slot ranks, the outfits of `data/peoples.json`, items worn over a higher slot (`OVER`); for `make_garments.py`'s settle, `make_mpfb.py`'s kit and `ease.py` | |
| `tools/ease.py` | under-items standing outside the item over them, per outfit (`--objs`: from the generator's output) | |
| `tools/shots.py` | close-ups of the Cosmetic Lab, the same every run (`tools/shots-clipping.json`: the open clipping issues) | |
| `tools/lab_shots.py` | shots of the Animation Lab: a clip at a time on each body framed close and put side by side, the same every run (`--gpu`: the machine's GPU, not SwiftShader) | |
| `tools/thumbs.mjs` | the chip pictures (`dist/thumbs/`) | |
| `tools/npcs.js` | strangers in bulk from the command line (`KCHAR.crowd`) | |
| `tests/test-rig.js` | node test of `KCHAR` (build.py runs it) | |
| `tests/make-golden.js` | writes `golden-mpfb.json` (morphs, strangers, parts), which `godot/tests/character/kchar_test.gd` checks Godot against | |
| `CREDITS.md` | the CC-BY items | |

## The earlier Meshy kit

Before MakeHuman, characters were Meshy outfits fitted onto one skeleton and cut into slots (`tools/meshy.py`,
`make_pieces.py`, `make_kit.py`, `data/male`, `data/female`, `data/sliders.json`). Fitting garments made for another
body never got loose clothing right; MakeHuman fits each garment to the body it is worn on. That code still builds
(`python3 build.py --meshy` packs those bodies too), and `make_pieces.py`'s retargeting and `make_kit.py`'s ray test
are used by the MakeHuman pipeline.
