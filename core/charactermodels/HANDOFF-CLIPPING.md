# Handoff: the clipping pass, where it stands (2026-10-20)

For the next session on the character clothing. The work ran on `claude/beautiful-bardeen-i0th9m` and is merged into
`main`. Read `.claude/skills/character-modeling/SKILL.md` and `references/pitfalls.md` first (sections 3 and 5 hold
this pass's lessons), then this, then `KNOWN_ISSUES.md`. `HANDOFF-CLOTHING.md` is the earlier survey-based handoff
(2026-10-19); its 1.3 (the ease table, `tools/ease.py`, and the settle in `make_garments.py`) is done, its 1.2
(per-slider rest push) was measured and dropped, its 1.1 (fit in the postured pose) and sections 2 to 4 are not done.

## The labs

- Cosmetic Lab: https://claude.ai/artifact/VaNLVcaDZaYHAHpEgxKsSw (v67)
- Animation Lab: https://claude.ai/artifact/WStXx16aNHT63stCoz331x (v42)
- "Cosmetic Lab: the Order and Xanadu" (https://claude.ai/artifact/8nSqU3MxD2GCCyzJTHT2t7) is stale: an older page from
  another session. The main lab now carries the Order's and Xanadu's clothes; that lab can be retired or republished.

Both labs hold every piece. Publish with `root` = `core/charactermodels/dist`, the page as `file_path`, and only the
pieces that changed in `files`: diff `build-manifest.json` against the last published commit (the commit this file
lands in). One publish takes at most 64 MB, so split larger sets; a version holds at most 256 MiB, and the lab is
near it. The Animation Lab refuses a publish that touches files you have not listed this session: list its files first.

## How to work

- **Shots, not guesses.** `tools/shots.py <outdir> <spec.json>` (README) gives the same frame every run; spec fields
  include `clip`, `t`, `yaw`, `cloth: false` (the rigid rest), `pre` (JavaScript on the figure, e.g. a material's
  `side`, a pad's value) and `morph` (body sliders, e.g. `{"height": 1}`). Shoot before and after every change and
  compare 20-30 shots (`tools/shots-clipping.json` plus the run frames t = 0.1, 0.25, 0.4, 0.55) for regressions:
  half the "fixes" tried this pass moved a different garment.
- **Test the page first.** Most fixes this pass were in the GPU push (`src/50-figure.js` `pushOut`, mirrored in
  `godot/krator/character/kchar_push.gdshader`). Try a variant by string-replacing the built `dist/cosmetic-lab.html`
  into `dist/<name>.html` and passing `--page`; delete it after. Rebuild the page (`python3 build.py`, one minute)
  only for the change you keep.
- **Generator changes need a rebuild.** `tools/rebuild.sh` runs the whole pipeline (about 75 min; run it in the
  background) or `--only <male ids> <female ids>` for a few garments (about 15 min, merged into the kits; the Godot
  twin's skin cover regions then wait for a whole build). Do not edit `make_garments.py` while it runs: Blender has
  already read it.
- **Checks before a commit**: `python3 verify.py dist/cosmetic-lab.html --assert` and the Animation Lab's,
  `node tests/make-golden.js`, `python3 ../../godot/tools/sync_core.py`, the Godot test
  (`godot --headless --path godot --script res://tests/character/kchar_test.gd`), then `tools/audit_port.py`,
  `tools/make_index.py` (and `git checkout settlements/ biomes/ kits/` for its churn), and rezip the skill.
- **Diagnose before fixing.** The useful probes this pass: draw the garment `FrontSide` only (clean means the patches
  are its own back faces); `cloth: false` and the A-pose (a fault there is the cut, not the motion); a CPU replay of the
  push on `boneTransform` positions with a ray from each skin vertex outward (pitfalls, "A knee through a robe's front");
  and the skin's distance from each capsule against the push radius by height (pitfalls, "Tall bodies").

## Done this pass (all in the labs)

- The push: a deep vertex goes straight out (no more splits round the knee), out the side the cloth faces (skinned
  normal), skirts padded as robes (2 cm), a robe over a skirt by the skirt's pad more; trousers squeezed to a short
  top's hem (kit item `hem`).
- Garments' back faces are drawn 1 cm deeper (`BACK_DEPTH`): folds no longer show their inside as blue-grey patches.
- Belts and trophies pinned to the hips, shoulder bands below the waist (`.cloth.json` `hips`, `mods.pin_hips`).
- Skirts hang from the waist as the monk's robe does; the novice's skirt is cut as it; the Yuni gown too.
- The boubou falls from the waist; the grand boubou's under-tunic stops at the waist; the breechcloth hangs over the
  shirt; the exomis crosses the chest diagonally.

## The plain clothes (the Animation Lab review, 2026-10-20)

The cast's cargo trousers and plain tee: knees, the crotch seam and the buttocks' cleft were skin left drawn under the
trousers (the pack's ray cover, now `TROUSERS_COVER`); the man's nipple was the base's `Human.nipple` part, which no
hide reached (now `hide_parts`); the trousers' band came through the tee's back in the push and the swim (the tuck,
now in the trunk's frame). `python3 tools/make_mpfb.py hides <body> <dir of GLBs>` refreshes kit.json's hides without
Blender (decode the published pieces' first line: base64 of a gzipped GLB). The ladder's "gap" is open (KNOWN_ISSUES).
Godot's skin regions for the trousers wait for the next whole build.

## Open, by priority

1. **Tall bodies (height above about +0.7) tear long robes in a run**, and at +1 open small tears in the walk and idle
   (KNOWN_ISSUES). The capsules fit; the thigh is up to 29% longer. Try a pad that grows with the leg's length (the run
   at +1 closed at 6 cm, but 6 cm tears the robe at the hips at height 0), or more cloth in the cut for long legs.
2. **The run's extremes.** The leading thigh at the top of the stride comes out of a narrow skirt's side (the novice,
   the monk at height); the trailing shin comes out of a robe's back. Both are the cut: a tube holds no cloth for a
   stride. A side slit, or more flare below the knee, is the likely fix; ask the owner which.
3. **Grand boubou**: white sleeves still show through the over-arm sheet at the shoulders and back in the idle
   (old item #57, "boubou through arms").
4. **Izani court robe**: its orange cape shows through the front in the walk and run. Hanging the robe from the waist
   made its tabard tear, so leave it hung from the chest; look at the cape's layer and its pad instead.
5. **Beast Rider chief** (no trousers): the deel opens down the front round the leading leg in the walk; his shoulder
   plates come through the mantle (#48).
6. Older reports not yet re-shot since this pass's changes (several may be fixed by the back-face and push changes):
   the Chichani trade mantle's shoulders (#49); the Chichani noble's back layers (#50); the Izani commoner's tunic
   through the thighs (#52); the Yuni hat low from behind, its brim bending, the gown's legs (#57); the giant's
   loincloth back flap see-through and sandals pointing down (#59); the Chichani tilma's hem gathering over the belly;
   the exomis's cut edge stepping by a centimetre.
7. A whole rebuild (`tools/rebuild.sh`) to give the Godot twin skin cover for the merged court robe and grand boubous.

## Owner's notes from this pass

- The owner judges by eye in the Cosmetic Lab and sends screenshots; "works tolerably" was the monk's robe up to
  +0.69 height, and the ask was to copy it "as much as possible". It did not suit the court robe: shoot each garment.
- Report a regression found while fixing something else as plainly as the fix.
- The Meshy API key lives only in the scratchpad (never in the repo); check `git diff --cached` for `msy_` before
  each commit.
