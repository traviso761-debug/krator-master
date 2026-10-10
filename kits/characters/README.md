# kits/characters

Characters built from Meshy outfits: each outfit is fitted onto one skeleton and cut into five equipment slots, so a
head from one outfit, a torso from another and boots from a third make one figure. Body and face sliders, and a dye per
slot, work on any combination. The editor page is `dist/characters.html`; the Godot side is
`godot/krator/character/` and reads the same records and data.

```
cd kits/characters
python3 tools/make_pieces.py       # donors -> pieces/*.glb, data/skeleton.json, data/outfits.json (deterministic)
python3 build.py                   # dist/characters.html (+ .artifact.html for the artifact host); runs tests/test-rig.js
python3 verify.py dist/characters.html --assert [--out shots/]
node tests/make-golden.js && python3 ../../godot/tools/sync_core.py    # after a change to 10-rig.js or data/
godot --headless --path ../../godot --script res://tests/character/kchar_test.gd
```

## How it works

| Step | Where | What |
|---|---|---|
| 1. Donors | `tools/meshy.py`, `donors/` | A donor is one rigged humanoid GLB. `meshy.py donor <id> "<outfit>"` makes one on Meshy (text-to-3d preview and refine, then auto-rigging, ~35 credits) from a fixed prompt: same build, A-pose, bare head, arms, hands and legs covered, no cape or weapon. It shrinks the textures to 2K/1K (`tools/compact_glb.py`). Styv and Phil (`settlements/girder/hero/`) are donors too. The list is `data/donors.json`. |
| 2. Fit | `tools/make_pieces.py` `fit()` | Every donor is moved onto the canonical skeleton (Styv's). Each limb bone gets an affine map: the donor's height onto Styv's, a stretch to the bone's length, a turn onto its direction. The spine only moves (turning it leans the donor); neck and head move as one from the neck (a rig's Head joint can sit anywhere in the skull); end and marker joints follow their parent. Vertices go through the weighted blend of those maps, so the weights carry straight over. Normals are recomputed smooth (Meshy's remeshed exports are flat). |
| 3. Face | `face_landmarks()`, `face_weights()` | Ten face joints under Head (nose, mouth, chin, jaw, eyes, brows, cheeks), placed from the nose tip found on each head's front profile, with falloff weights taken from Head. Their rest place differs per head, so it is stored per outfit (`outfits.json` `face`) and set when that head is worn. |
| 3b. Seams | `neck_ring()`, `SEAMS`, `conform()` | Rigs put the spine at different depths in the body (Meshy's web rig sits 6-10 cm further back than its API rig), so each donor's upper body is first moved front-to-back until its neck ring is on the median one. Then at each of the six cuts (neck, waist, wrists, ankles) every donor's ring is measured as radius and height round the bone, in 32 angle bins, and the surface within 5-8 cm of it (along the surface, both pieces) is morphed onto the median ring of all donors. Any two pieces then meet. |
| 4. Cut | `cut()` | Each triangle goes to the slot that holds most of its weight (`SLOT_OF`). Beside each cut, a band of the neighbour's triangles is kept as its own mesh, `<slot>~<other>`, measured along the surface (`BAND`): the outer piece reaches 3-7 cm over the cut, stood off 4 mm, and the inner one 2-3 cm under. The page shows a band only when the slot across the cut holds a different outfit. |
| 5. Write | `pieces/<id>.glb`, `pieces/anims.glb` | One GLB per outfit: the canonical skeleton (rest = bind), one skin, a mesh node per slot and band, one material (1024 px colour, 512 px normal and metal-roughness). `anims.glb` is the skeleton with the clips (`CLIPS`: Styv's walk, run and stretch, Phil's idle). |

**Sliders** (`data/sliders.json`) are data: each is a list of ops on named joints (`scale`, `girth`, `len`, `grow`,
`move`, `root`). `KCHAR.pose` (`src/10-rig.js`) turns slider values into a rest offset and a skin scale per joint,
plus the hips' lift that keeps the feet on the ground. The skin scale is folded into the joint's inverse bind matrix
(`boneInverses[i] = S * IBM[i]` in three.js, `Skin.set_bind_pose` in Godot), so it scales only that joint's own
vertices, in its own frame, and is not inherited: no shear down the arm. Add a slider by adding a row.

**The record** is the character: `{ slots: {head, torso, hands, legs, feet}, sliders: {id: -1..1}, dye: {slot: '#rrggbb'} }`.
The editor's Record tab shows it; `KCHAR.random(seed)` rolls one from `KRAND`.

## Files

| File | What | Port tag |
|---|---|---|
| `src/00-head.html` | the page shell and styles | [web] |
| `src/10-rig.js` | `KCHAR`: pose, visible pieces, random and blank records. No three.js, no DOM | [G data], twin `godot/krator/character/kchar.gd` |
| `src/50-figure.js` | `KCharFigure`: bones from `skeleton.json`, pieces bound to them, clips | [draw], twin `kchar_figure.gd` |
| `src/90-editor.js` | the stage, camera and panel; `window._kchar` for `verify.py` | [web] |
| `data/` | `donors.json` (hand-written), `sliders.json` (hand-written), `skeleton.json` and `outfits.json` (made by `make_pieces.py`) | [G data] |
| `tests/test-rig.js` | node test of `KCHAR` (build.py runs it) | |
| `tests/make-golden.js` | writes `golden-pose.json`, which `kchar_test.gd` checks Godot against | |
| `tools/vendor/GLTFLoader.r128.js` | three r128's loader, for `verify.py` offline (the page loads it from the CDN) | |

## Adding an outfit

```
MESHY_API_KEY=... python3 tools/meshy.py donor <id> "<what he wears: chest, arms, hands, legs, boots>"
```
then add `{ "id", "name", "glb": "donors/<id>.glb" }` to `data/donors.json`, run `make_pieces.py`, `build.py`,
`verify.py --assert`, and look at it. Words that describe a creature ("insect carapace") can give a creature; name
materials and garments instead. A donor with a skirt, coat tails or a cape crosses the cuts: it works, but the hem
goes to the legs slot.
