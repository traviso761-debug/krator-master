# Handoff: garments, for the next session (2026-11-02)

For a fresh session (Gemini) taking over the garment clipping work. Read this first, then `HANDOFF-GARMENT-DEFECTS.md`
rounds 4 and 3 (the history, with the reasons each rule exists), then the `pushOut` and `clothStep` comments in
`src/50-figure.js`. The owner judges by eye on textured shots, not by counts: a fix is done when the shots look right.

## Where the work is

- **Worktree** `C:\Users\travi\Documents\krator-garments`, branch `claude/garment-defects` (branched from local
  `claude/biome-rebuild`), not pushed. `b0477373b` is round 3 (bone fix, slits out); `644bea198` is rounds 4 and 5
  (`src/50-figure.js`, `tools/garment_audit.py`, `tools/shots.py`, `tools/make_mpfb.py`, the Godot twin in
  `godot/krator/character/`, `tests/garment-audit.json`, the docs, this handoff). `pieces/mpfb_male|female/mindfront_kimono.glb`
  were reweighted in place (gitignored, so only in this worktree; originals in `C:\Users\travi\Tools\rb\kimono-before`; the
  built `dist/pieces/*/mindfront_kimono.txt` carry them). Do not push, merge or publish without the owner's word.
- **The live labs are not this branch.** Cosmetic Lab https://claude.ai/artifact/VaNLVcaDZaYHAHpEgxKsSw (v75) and Animation
  Lab https://claude.ai/artifact/WStXx16aNHT63stCoz331x (v55) carry the owner's posture work (review round 3), which this
  branch lacks, so poses differ from `dist/`. They are updated by patching the diff of `src/50-figure.js` onto them, never
  by publishing `dist/`. Copies are in `.garment-live/` (untracked; do not commit): `base/` is v74/v54 (before round 4),
  `patched/` is base plus the current working source. `python .garment-live/scripts/patchwork.py` re-patches from the working
  `src/50-figure.js` and copies `patched/cosmetic-live.html` to `dist/`, so `tools/shots.py ... --page dist/cosmetic-live.html`
  shows what the owner sees. v75/v55 have round 4; round 5 (below) is not published.

## How it works now (both runtimes)

1. **Chains**: Verlet chains drive cloth bones (`clothStep`, `collide`, `layered`); feet are colliders too (`footEnds`).
2. **Capsule push** in the vertex shader (`pushOut`, `kc_push`): vertices out of the leg and arm capsules; the legs' part
   fades out as the stride grows (`1 - kcM`).
3. **The hull** (round 4): twelve leg points (`kcE`) set how far out from the body's vertical axis the cloth must reach at
   their bearing (rows below hang from them, rows above ramp to the waist). Smooth cube-root maximum with the rest radius
   going in, so tiers keep their order. Every loose layer uses the lowest hem worn (`kcHm`); points within 12 cm of the
   ground are ignored; a top over a skirt stands 6 cm further.
4. **Chainless loose pieces** (the Kimono, `mindfront_kimono`, the man's default outfit): skinned to the hips alone
   (`make_mpfb.py skirt_weights(rigid=True)`), hull at rest too (`kcEO`), and below the crotch turned by `kcTl`.
5. **Trousers under a long top** are drawn in toward the legs (`kcS`), boots likewise (`kcSF`, wider, so boots stay outside).

## Round 5 (uncommitted, unpublished): the owner's last report

- *"kimono seems to turn too much with body and underlying legs clip thru during idle pose"*; the owner's screenshot was
  from behind in a wide-stance idle, the back hem lifted and swung aside, both shins and boots out. Cause: the kimono hangs
  rigid from the hips, and `kcTl` only undid a tilt read from a vector (hips joint to between the hip joints), missing the
  pelvis's roll and twist. Now: standing, `kcTl` undoes the hips' whole rotation from rest and re-turns to where the feet
  face, capped at 0.35 rad (`TILT_MAX`); in a stride it eases back to the vector tilt, gated by how far apart the two
  thighs are fore and aft (not `kcM`: a wide stance's thighs set that). Full undo in a run folded the cloth over itself or
  drew the front off the leading knee. The idle (`idle` at 2.5 s) is covered in shots; one run frame has a thin sliver.
- *"note also how the boots seem to clip thru the overlying pants"*: the squeeze reach was 15 cm, so a harem pants' bulge
  was left while the boot top was drawn in to its own (wider) radius. Reach is now 30 cm (`sb < 0.3` / `best < 0.3`). **Not
  confirmed by a shot**: the frame the owner saw is not reproduced on the current build (`01_kimono_side_in_a_run.jpg` shows legs covered).
- Not swept, not verified by `verify.py`, and Godot gives its one known failure (the giant on the ladder) with no shader errors.

## What is broken now (shots in `handoff-shots/`, current working build, live page copy)

`00_sheet.jpg` has all twelve. Each name says the fault; numbers match the files.
- **02** Kimono in a run: a thin sliver of trousers at the side seam.
- **03** Kimono: its pale inner front panel shows through the outer one (two panels of one mesh, z-order).
- **04** Chichani woman (`voth_f_noble_gown` over `voth_f_noble_skirt`): flecks of the crimson underskirt through the purple at the back.
- **05** Izani court robe (`iziz_m_noble_robe`): the teal robe through the orange cape at the back. Its rest shape is not cleanly outside the robe.
- **06** Republic festive coat over a skirt: dark skirt patches through the coat, and coats stand wide in a stride.
- **07** Tall body (`height` 0.75, `weight` -0.8) in a crouch: layers through each other; tall crouch is the one clip that got worse in round 4.
- **08** Yuni grand boubou: the slipper at the back in a run, near the hem.
- **09** Grand boubou: white patches at the shoulders (a layer under the boubou; the hull does not reach that high).
- **10** Order novice skirt: a small tear in a run.
- **11** Long robes bell out wide in a walk; the price of the hull. The owner may find it too much.
- **12** Chichani man's court cape (`voth_m_noble_robe_cloak`): its diamond border smears; not yet worked on.

## Tools

- `python tools/shots.py <outdir> <spec.json> --page dist/<page>.html`: spec `[{name, body, armour, clip, t, yaw, pitch, dist, at, morph?}]`.
  **Keep `t` inside the clip's length.** Round 4 fixed a bug where cloth and pose came from different moments; every count
  and shot before it is suspect.
- `tools/garment_audit.py`: flat-colour fault counts over all 66 outfits (`--shards 3 --shard i`, `AUDIT_GL=d3d11`,
  `--morph '{"height":1}'`, `--page`); `--report`, `--check` against `tests/garment-audit.json`. It takes the GPU lock
  `C:\Users\travi\AppData\Local\Temp\claude\krator-verify-gpu.lock` (a directory; mkdir to take, remove to release; other
  sessions use it). `.garment-live/scripts/cmpf.py <dir> <sweepA> <sweepB>` compares two sweeps by clip and class.
- `python verify.py dist/cosmetic-lab.html --assert`; the Animation Lab page times out there (it waits on a hook it has not got): load it instead.
- Godot: `python godot/tools/sync_core.py`, then `C:\Users\travi\Downloads\Godot_v4.7.2-stable_win64_console.exe --path godot --gpu-index 1 --script res://tests/character/kchar_test.gd` (not headless: headless does not compile shaders). Godot's picture has never been compared with the page.
- Library pieces cannot be re-exported with `tools/rebuild.sh --only` (`merged 0 items`); a whole rebuild takes about 75 minutes with Blender at `C:\Users\travi\Tools\blender-4.5`.

## Rules that bit

- Every change to the push goes into both `src/50-figure.js` and `kchar_push.gdshaderinc` / `kchar_figure.gd`.
- Fragments pack many statements a line: no trailing `//` comments inside shader strings.
- `make_mpfb.py` writes CRLF kit.json on Windows: normalise before committing.
- Sweep both height ends and shoot before trusting a rule; a partial sweep looks better than a whole one.
- The owner prefers PowerShell for commands given to them.
