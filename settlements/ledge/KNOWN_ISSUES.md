# Ledge: known issues (2026-11-22)

What the first page does not do yet, and what it owes. `PLAN.md` section 9 is the plan; 9.11 the owner's open questions.

## Owed by other builds

- **Loj Fower's buildings are stand-ins.** The `tg` set (`tg_lift_head`, `tg_loj_hall`, `tg_dark_beds`, `tg_wax_house`, `tg_signal_box`,
  `tg_cistern`) is on `claude/loj-twenny-059a5e`, not merged. The winding house is a rust block with two headframes; the loj's
  buildings inside their decks are tagged records, not drawn. Swap them for `TG.tg.draw` when the set reaches `main`.
- **No flora.** The W rim's dress (riftrim's mist frills, lobe larches, the borrowed bay laurel and cork oak) is not on this page; the
  head's turf and the terraces are bare, and the Dalab set's orchards have no trees (`dnTree` returns nothing: `src/69f-host-dalab.js`).
  The dress belongs to `biomes/riftrim` reading Ledge's ground (`PLAN.md` 9.10).
- **riftrim's station 1 still draws its own benched stand-in cliff** where Ledge's dressed face stands (`PLAN.md` 9.10, the hand-over).

## The shared module (2026-11-22)

The shell, the ground, the towns, the wreck and the sheets are the kit's `kits/ancients/cliff` (`KCLIFF`), lifted from this build when Shelf
took the same form; Ledge was proved unchanged (its layout, area and census identical; all 160 meshes on its page hashed the same).
The one change since: the near ground grid now always meets the far ring's edge (a 20 m sliver of sky at the seam is closed).

## This build's own gaps

- **The shafts, the station's platforms and the gene bank's vault are inside the rock and not drawn** beyond the station's mouth on the
  face and the lift halls; `KCARVE` / `KCAVERN` (and `KKARST` for the cliff springs) come with the interiors.
- **The Line's helix is a record**, checked for its grade and its length (64 km), not drawn.
- **The road drapes over the ground** (`KCLIFF.road`): its switchbacks hold 9 % across the escarpment's fall line, but the escarpment's
  bumps (40 m of noise at a 90 m scale) give it local grades to ~50 % over 40 m. A cut under it (the ground lowered along the road's record)
  is owed.
- **No interiors**; the Dalab set's buildings have no night lights of their own.

## Done (2026-11-22, the known-issues pass)

- **The shell's look**: hung pods under the exposed soffits (lit on lived decks) and raking struts where a layer juts 8 m or more past the
  one below (`KCLIFF.drawShell`).
- **The Ancients' cut face** no longer reads flat grey: courses of 12 m blocks, staggered joints, rain streaks and a quarter of the strata's
  banding (`KCLIFF.rock`).
- **Night** on the host's clock (`KCLIFF.night`): the lit windows glow warm, Loj Fower's lamps brighten, the soffits' painted daylight goes
  out, the kit's `NIGHT` follows.
- **The harbour**: a landing stage 1.5 m over the water along the mole, three stairs down the mole's face, six lake boats moored
  (`src/8ld-host-harbour.js`).
- **Dalab's road** drawn down the escarpment to the west gate (`KCLIFF.road`).
## Baselined on purpose (2026-11-17)

- `tools/check_assembly_baseline.json`: `CLASH KMAT`, `_materials`, `_texPending`, `onerror` on `dist/ledge.html`. The first, third and
  fourth are the sealed Tungang bundle's `window.X =` lines, which its `window` proxy already keeps off the host's globals (the host's KMAT
  stays, `onerror` is swallowed, the first `_texPending` reset is ignored: `kits/tungang/tungang_bundle.py`); `_materials` is the Ancients'
  and Dalab's two library bindings, as on Span's page.
- `tools/check_source_baseline.json`: `RAWTEX` x4 in `src/45-host-stage.js` (2026-11-17): the grain of four grey detail maps read as luminance. The shader moved to `kits/ancients/cliff/30-cliff-ground.js` on 2026-11-22; the key is now stale and shrinks at the next `--write-baseline`.
