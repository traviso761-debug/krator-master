# kits/characters

The character editor and the data a city needs to populate itself: two MakeHuman bodies (a man and a woman) whose
face, build and ancestry morph, with library clothes, hair and beards that follow the morphs, a skin tone and a hair
colour, and **peoples** (`data/peoples.json`) that keep a culture's strangers within its range (Chichani: ashen-brown
skin and dark hair; Beast Riders: Asiatic or Amerindian, blond to brown hair). One record per citizen; no separate
model per person. The page is `dist/characters.html`.

```
cd kits/characters
blender -b --python tools/mpfb_build.py -- male <export dir>      # Blender 4.5 + MPFB2 + the asset packs (below)
python3 tools/make_mpfb.py male <export dir>                       # -> pieces/mpfb_male/, data/mpfb_male/
python3 build.py [--thumbs]                                        # dist/characters.html (+ .artifact.html); runs tests/test-rig.js
python3 verify.py dist/characters.html --assert [--out shots/]
node tests/make-golden.js && python3 ../../godot/tools/sync_core.py     # after a change to 10-rig.js, data/ or the pieces
godot --headless --path ../../godot --script res://tests/character/kchar_test.gd
```

## How it works

| Step | Where | What |
|---|---|---|
| 1. Blender | `tools/mpfb_build.py` | Builds an MPFB human (Mixamo rig, `detailed_helpers` so the rig lands right), loads the brows, lashes, eyes and every library item in `ITEMS` (clothes per slot, hair, beards: MakeHuman fits each to the body and interpolates its weights from it), exports the base and each item as a GLB on the same rig, with a `_VIDX` attribute (each vertex's Blender index) and each item's delete group. Then, per slider end (macros: age, muscle, weight, height, proportions, and bust and firmness on the woman; the three ancestry shares; 35 face targets), it sets the target, lets MPFB refit the rig and every item, and records how far each vertex of every mesh and each joint moved: `morphs.npz`. |
| 2. Pack | `tools/make_mpfb.py` | Per GLB: shrinks the textures, makes the skin, hair and iris textures neutral (the page multiplies the colours in: `kit.tint`; the irises' mask rides in the eye texture's alpha), drops alpha channels that hold nothing, stores hair as grey + alpha, sets cut-out or opaque alpha (Blender's exporter marks everything BLEND), drops normal maps that are colour images. Delete groups become a bitset over the skin's triangles; an item with none gets one from rays cast out and in from the skin (`covered()`). For the Godot twin it also writes `<id>.gshapes.bin` (GSH1: per surface and target the vertex offsets as float32, the skin's cover regions, the ground). The deltas become one `KMR1` file per GLB (`<id>.morph.bin`: per mesh, per target, the vertices that move, int16 at 0.1 mm); the joint deltas, sliders and ancestry go into `data/mpfb_<body>/kit.json`. Clips are retargeted onto the rig (`make_pieces.write_anims`). |
| 3. Record | `src/10-rig.js` | `KCHAR.morphWeights(record)`: one weight per target (a slider at v < 0 weighs its minus end by -v, at v > 0 its plus end by v, times its reach; ancestry weighs each race by its share minus the base's). `KCHAR.morphJoints`: each joint's rest moves by the weighted sum of its deltas. `KCHAR.stranger(seed, kit, people)`: a record drawn from a people's ranges with `KRAND`. |
| 4. Figure | `src/50-figure.js` | Blends each live mesh's deltas on the CPU (`_vidx` maps a glTF vertex to its Blender vertex; a seam's halves move together), re-sums normals over source vertices, moves each bone's rest and its inverse bind by the joint delta (`IBM * T(-d)`, so the skinned rest is exactly the morphed mesh), keeps the feet on the ground, hides the skin under worn items, and tints skin, brows, hair and beard. |
| 5. Page | `src/90-editor.js` | Gear (clothes, dye), Head (people, skin tone, hair, hair colour, beard, eye colour), Body (ancestry, build), Face (35 sliders), Record (the record as text, roll a stranger). |

**The record**: `{ body:'mpfb_male', armour:{torso, legs, feet}, hair, beard, skin:'#rrggbb', hair_color:'#rrggbb', eye_color:'#rrggbb',
morph:{ <slider>: -1..1 }, ancestry:{african, asian, caucasian}, people, dye:{slot: '#rrggbb'} }`. Colours are albedo.

**Clips** (`data/clips.json`, about 140 in each body's `anims.glb`): walk, run and the idles, plus actions grouped
as move, melee, ranged, block and dodge, hit and fall, swim, ladder, daily life and work. Two sources, both retargeted
onto the rig by `make_pieces.write_anims` (bone directions matched, hips motion scaled by height):
Meshy's animation library (`meshy` ids, fetched on the scout donor's rig with `tools/meshy.py anims`, 3 credits each:
`donors/anims/actions*.glb`) and Quaternius's Universal Animation Library 1 and 2 (`ual`, CC0:
`donors/anims/UAL*.glb`, an Unreal-style skeleton mapped by `NAME_MAP`). `loop: false` clips play once and go back
to the last loop. Loops play in place: their drift over a cycle is taken out and kept as `root_speed` (m/s, in
`skeleton.json`'s clip list) for a game to move the character by; one-shots (rolls, knockdowns) keep their motion.
**Props** (`tools/make_props.py` -> `pieces/props/*.glb`, `data/props.json`): 18 hand-held things built from
primitives (sword, dagger, axe, mace, war hammer, spear, shield, bow, crossbow, rifle, pistol, pickaxe, hoe, hammer,
bucket, cup, lantern, torch), each modelled in the grip frame: +Y along the handle out past the index finger, +Z the
way the fingers point, +X out of the palm. `make_mpfb.py hands()` measures that frame on each body's rest hand
(skeleton.json `hands`: the grip in the hand bone's space, and per finger joint the rotation that closes the hand)
and a clip's `hold` in `data/clips.json` names the props each hand may take, default first. `fig.hold({R, L})` hangs
the GLBs under the hand bones and curls those fingers after every frame of the clip; the page's Holding picker swaps
the right hand's prop among the clip's choices.

**Peoples** (`data/peoples.json`): per culture, ancestry ranges, skin colour stops (a stranger falls anywhere along
them), hair and eye colours, the age at which hair greys, beard odds, slider ranges that override the default spread, and
preferred hairstyles per body. The Chichani and Beast Rider entries follow the owner's notes; the rest are proposals
from LORE.md's references, there to be changed.

**Setting up the Blender half** (nothing of it is in the repo, and `pieces/` is gitignored, so a fresh machine
rebuilds the pieces from here). Blender 4.5 LTS from download.blender.org/release (the Linux tarball runs headless
as is); MPFB from extensions.blender.org/add-ons/mpfb, installed with
`blender -b --python-expr "import bpy; bpy.ops.extensions.package_install_files(filepath='mpfb.zip', repo='user_default')"`;
the packs below from static.makehumancommunity.org/assets/assetpacks, and `python3 tools/mpfb_repo.py` for the hair
and beards that come from the community asset repository instead (it applies the texture-name fixes some need). Then per body: `mpfb_build.py` (about 10
minutes: it refits every item once per slider end), `make_mpfb.py`, `build.py`.

**Asset packs** (load them into MPFB once: `bpy.ops.mpfb.load_pack(filepath=...)`): makehuman_system_assets, hair01,
eyebrows01, shirts01, pants01, skirts01, dress01, shoes01, suits01 (CC0); bodyparts05 (beards, CC0); hair02, hair03,
bodyparts06 (CC-BY: `CREDITS.md`).

## Files

| File | What | Port tag |
|---|---|---|
| `src/00-head.html` | the page shell and styles | [web] |
| `src/10-rig.js` | `KCHAR`: records, morph weights and joints, strangers, pose (the Meshy kit's sliders), parts, hidden skin. No three.js, no DOM | [G data], twin `godot/krator/character/kchar.gd` (held to it by `tests/golden-mpfb.json`) |
| `src/50-figure.js` | `KCharFigure`: bones from `skeleton.json`, pieces bound to them, CPU morphs, tint, clips | [draw], twin `kchar_figure.gd` (blend shapes from `<piece>.gshapes.bin`) |
| `src/90-editor.js` | the stage, camera and panel; `window._kchar` for `verify.py` | [web] |
| `data/peoples.json` | the peoples (hand-written) | [G data] |
| `data/clips.json` | the action clips: source (Meshy id or UAL clip), label, group, loop, hold (hand-written) | [G data] |
| `data/props.json`, `tools/make_props.py` | the hand-held props and the script that builds them | [G data] |
| `donors/anims/` | the clip sources: Meshy batches (`idles*`, `actions*`, with their request records) and the UAL libraries (CC0, `UAL_License.txt`) | |
| `data/mpfb_<body>/` | `kit.json` (items, hide bitsets, morph sliders and joint deltas, tint) and `skeleton.json` (made by `make_mpfb.py`) | [G data] |
| `pieces/mpfb_<body>/` | `base.glb`, one GLB per item, `anims.glb`, and a `.morph.bin` per GLB (gitignored: rebuilt from the Blender export) | |
| `tools/mpfb_build.py`, `tools/make_mpfb.py` | the two halves of the pipeline | |
| `tools/thumbs.mjs` | the chip pictures (`dist/thumbs/`) | |
| `tests/test-rig.js` | node test of `KCHAR` (build.py runs it) | |
| `tests/make-golden.js` | writes `golden-mpfb.json` (morphs, strangers, parts), which `godot/tests/character/kchar_test.gd` checks Godot against | |
| `CREDITS.md` | the CC-BY items | |

## The earlier Meshy kit

Before MakeHuman, characters were Meshy outfits fitted onto one skeleton and cut into slots (`tools/meshy.py`,
`make_pieces.py`, `make_kit.py`, `data/male`, `data/female`, `data/sliders.json`). Fitting garments made for another
body never got loose clothing right; MakeHuman fits each garment to the body it is worn on. That code still builds
(`python3 build.py --meshy` packs those bodies too), and `make_pieces.py`'s retargeting and `make_kit.py`'s ray test
are used by the MakeHuman pipeline.
