# Handoff: getting clothes to lie right (for the clipping-pass session)

2026-10-19. Written for the session iterating on `claude/beautiful-bardeen-i0th9m` (read at 35d9a65eb), from a web
survey of tools, MCPs and pipelines, and from a Godot spike run today on a branch cut from yours
(`claude/godot-springbone-spike-55e015`, commit 110cef59a, `godot/krator/character/REPORT.md`). Nothing here is
merged into your branch; take what helps. Section 1 is the argument, 2 to 4 are the concrete recipes, 5 is what to
leave alone.

## 1. The pattern in the branch, and the one change of approach

The last two weeks of commits fix rest fit at runtime: the push went from a 4 cm shell to a 1.5 cm band, PAD_TOP
1.2 to 2 cm, PAD_OVER 2 to 3.5 cm, the squeeze 6 to 8 mm, the seat got capsules, the thigh lost its top third,
contact weights, copied weights, collarbone chains, chains off the arms. Each fix moved another garment, and your
own pitfalls record the open one: the mantle torn at the shoulder blades because the posture pass draws the
shoulders back after every clip while the mantle's chains follow the spine.

The common cause is that every garment is fitted, weighted and given its chain rest in the raw MakeHuman A-pose,
and the runtime then has to pay for everything the A-pose got wrong: the posture offset, the arms' weights on
capes, the pads that keep cloth off the body. The skill's own rule applies: fix the stage that is wrong. The
recommendation is to **move rest fit into the pack**, so the runtime push and chains handle motion only:

1. **Fit and read chain rests in the postured pose, not the A-pose.** `data/posture.json` is a constant offset
   applied after every clip, so the true rest of every garment is the postured one. In `make_mpfb.py`, when
   reading chain rests, anchors, `encloses()` and `covered()`, pose the skeleton with `posture.json` first (the
   same FK you use for derived clips) and skin the garment to it. The mantle tear should close on its own: the
   tunic and the mantle will have been fitted to the same drawn-back shoulders. This is the cheapest test of the
   whole thesis: one pass, one survey grid, before and after.
2. **Bake the rest push per slider end.** `mpfb_build.py` already loops the slider ends and records deltas; add a
   settle step at each end that moves any garment vertex inside the body out to a fixed gap (Dress Fit does this
   at 2 mm with a nearest-surface query, Daz with a smoothing modifier colliding at a few iterations), and record the
   moved positions into `morphs.npz` like any other delta. The GPU band then only has to catch what motion adds,
   and PAD_TOP / PAD_OVER can shrink instead of grow.
3. **Check eases across items worn together at pack time** (your pitfall of the fitting order). `peoples.json`
   `outfits` says which items go together; a pack-time table of each part's ease by slot and height band, with a
   failing row where an under-item stands outside the item over it, turns a shot into a number.

## 2. Weights: two generic passes instead of per-garment rules

MakeHuman weights a garment from the nearest skin, which is the root of the headgear, cape-edge, flap and
loincloth bugs. Blender's add-on market solved this generically and the passes are small:

- **Prune distant influence.** After MPFB fits an item, drop any bone's weight on a vertex farther than k times
  that bone's mean skin distance (Weightforge's rule), renormalise. One threshold replaces `head_weights`, the
  collarbone swap and the arm exclusions, and applies to every item including the library's.
- **Transfer from a reduced source for outerwear.** For items whose `layer` is 2 or that span the shoulders
  (mantles, capes, tilmas, broad brims), transfer weights by normal raycast from a torso-only copy of the skin
  (arms, hands and head hidden), which is what Weightflow Pro calls the thick-outerwear mode. Your `make_garments.py`
  already fits mantles over the arms geometrically; this makes the weights agree with that.
- **Reference the helpers, not the legs.** MakeClothes' own docs warn that a skirt vertex referenced to the nearest
  skin picks one leg and two from the other; you already use the skirt helper below the crotch. Do the same above
  it for anything that hangs clear of the body: reference capes and mantles to the tights or torso helper, never
  to the arms.

## 3. Authoring: drape, do not loft, for the next garments

The lofted rings are why rest shapes start wrong and why KNOWN_ISSUES says "no folds beyond the hang and flare".
For new garments and for the worst current ones:

- **Panels plus a Blender cloth sim on the A-posed body**, settled a second, then written as MakeHuman clothes
  through MakeClothes as now. `bpy` can do it headless: pin the band, body as collision, 60 to 120 frames, apply.
  Simply Cloth Studio 2.0 draws the panels on the body in the viewport if you want a GUI; GarmentCode (MIT, Python)
  is a DSL for parametric sewing patterns, the same spirit as `make_garments.py` with real patterns, and worth
  reading for its component model even if you keep your own.
- **Chain weights from a sim, not rules.** Run the walk and idle through the Blender cloth sim once, export the
  cache, and let EA's Dem Bones (BSD-3, Windows CLI, reads FBX and Alembic) decompose it into your existing cloth
  bones plus weights. That replaces `cover_weights`, `CONTACT` and the hang rules with measured weights, and keeps
  the glTF and both runtimes unchanged.
- **Hide skin on the GPU.** A per-vertex zone bitmask in the skin's vertex shader (half4's zone culling; Character
  Clipping Protector finds zones by raycast as `covered()` does) would end the 64-item mask and the region
  rebuilds. Lower priority; the current regions work.

## 4. Runtime: what the Godot spike says

`SpringBoneSimulator3D` (Godot 4.4 and later; yours is 4.7.2) drives the kit's chains with no re-import, since the
cloth bones are built from `skeleton.json` at runtime. On the man in the court robe, walk, 30 Hz:

| | swing rad/frame | bones past 1.5 rad | last bone off rigid rest, mean | ms/frame |
|---|---|---|---|---|
| GDScript Verlet | 0.245 | 112 | 0.118 m | 19.6 |
| SpringBoneSimulator3D, no pad | 0.111 | 3 | 0.111 m | 1.1 |
| Same, with the Verlet's 2.2 cm pad | 0.121 | 6 | 0.148 m | 1.3 |

The fold is gone and the drape distance matches, but it is **not a drop-in**: Godot pushes a joint out of a collider
and then clamps its length, so it cannot take a pad or any rest point inside a capsule (38 of the robe's are inside
the trunk with the pad; the mantle walks off the back). It has no ring constraint, no layer rule, no
drape-over-a-raised-limb rule; drag is a fraction per frame with no substep, so tuning holds at one frame rate; and
a scaled skeleton clamps its chains to half length, so the giant needs `center_from = BONE` or the scale moved off
the Skeleton3D. Conditions before adopting it, each a day or two: capsules refitted so rest poses lie outside them;
per-chain collider sets (`set_collision_path`, exclusions) standing in for the layer rules; then the page on the same
spec through `@pixiv/three-vrm-springbone`, so both runtimes run one published model. Until then the Verlet stays
the truth. Three things from the spike are useful now:

- **Measure the drape, not only the swing.** The swing misses a mantle lifted whole, which turns a few root bones
  only; the last bone's distance from its rigid rest catches it. Add it to `kchar_test.gd` and the page's golden.
- **`kchar_shot.gd` double-steps the figure.** A figure added inside a SceneTree script's `_init` gets `_ready`
  after `_init`, which turns `_process` back on, so the engine steps it as well as the script. Turn processing off
  on the script's first frame. Every frame-driven number from a headless shot before this was wrong.
- **The published lab's pieces are two commits behind your kit.** Their chain anchors are 25 to 39 cm from the GLBs'
  cloth joints; a `pieces/` folder must match the manifest's hash before a shot is trusted.

Of your runtime passes, the pads are the ones section 1 would retire; the tuck, the squeeze, `toesFlat` and
`bodyFix` are motion corrections and stay.

## 5. What not to pick up

- **No MCP does garment fitting.** The Blender MCP connected to the desktop can run MPFB, a sim and a viewport
  render live, which suits a fit iteration better than a ten-minute headless build; the Godot and Meshy servers
  you know. Blender Copilot's `cloth_to_shape_key` and 6xvl/blender-mcp's weight tools are recipes to read, not
  servers to add. CLO's community MCP is macOS-only and alpha; Marvelous Designer's Python API is Enterprise-only
  and cannot call auto-fit.
- **The SMPL research stack** (HOOD, ContourCraft, xrtailor, UNIC) drapes on SMPL bodies with CUDA and follows no
  MakeHuman slider. xrtailor takes an animated glTF mannequin and could give offline reference drapes, nothing more.
- **Character Creator and Daz** conform tools are closed; users report weights cleared on import.
- **Generated meshes** (Tripo, Hunyuan3D, Rodin through blender-mcp) stay concept donors, as the skill says.

## Sources

MPFB mhclo fitting: github.com/makehumancommunity/mpfb2/blob/master/docs/entities/clothes/mhclo.md ·
MakeClothes delete groups and helper references: static.makehumancommunity.org/assets/creatingassets/makeclothes/makeclothes_deletegroups.html ·
Godot 4.4 release (SpringBoneSimulator3D): godotengine.org/releases/4.4 · class reference:
docs.godotengine.org/en/stable/classes/class_springbonesimulator3d.html ·
three-vrm-springbone: npmjs.com/package/@pixiv/three-vrm-springbone · Dem Bones: github.com/electronicarts/dem-bones ·
GarmentCode: github.com/maria-korosteleva/GarmentCode · Simply Cloth Studio 2.0:
cgchannel.com/2026/01/vjaceslav-tissen-releases-simply-cloth-studio-2-0-for-blender · Dress Fit: booth.pm/en/items/8930466 ·
Weightflow Pro: superhivemarket.com/products/weightflow-pro/docs · Weightforge: superhivemarket.com/products/weight-forge/docs ·
Zone culling: half4.xyz/index.php/2020/10/22/character-clothing-zone-culling · Character Clipping Protector:
github.com/unitycoder/CharacterClippingProtector · Daz smoothing and collision: daz3d.com/forums/discussion/comment/153672 ·
Blender Copilot: glama.ai/mcp/servers/dwgx/blender-copilot · 6xvl/blender-mcp: github.com/6xvl/blender-mcp ·
clo3d-mcp: glama.ai/mcp/servers/ayyu628vdt · MD Python API: cgchannel.com/2025/10/marvelous-designer-is-now-available-for-linux ·
ContourCraft: github.com/dolorousrtur/ContourCraft · xrtailor: github.com/openxrlab/xrtailor · UNIC: arxiv.org/pdf/2603.25580
