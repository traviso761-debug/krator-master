# Ledge: known issues (2026-11-17)

What the first page does not do yet, and what it owes. `PLAN.md` section 9 is the plan; 9.11 the owner's open questions.

## Owed by other builds

- **Loj Fower's buildings are stand-ins.** The `tg` set (`tg_lift_head`, `tg_loj_hall`, `tg_dark_beds`, `tg_wax_house`, `tg_signal_box`,
  `tg_cistern`) is on `claude/loj-twenny-059a5e`, not merged. The winding house is a rust block with two headframes; the loj's
  buildings inside their decks are tagged records, not drawn. Swap them for `TG.tg.draw` when the set reaches `main`.
- **No flora.** The W rim's dress (riftrim's mist frills, lobe larches, the borrowed bay laurel and cork oak) is not on this page; the
  head's turf and the terraces are bare, and the Dalab set's orchards have no trees (`dnTree` returns nothing: `src/69f-host-dalab.js`).
  The dress belongs to `biomes/riftrim` reading Ledge's ground (`PLAN.md` 9.10).
- **riftrim's station 1 still draws its own benched stand-in cliff** where Ledge's dressed face stands (`PLAN.md` 9.10, the hand-over).

## This build's own gaps

- **The shell's look is a first pass**: the decks are slabs, rooms, window strips and mullions in the Ancients' panel; no pods on the
  soffits, no struts under the prow-side wings, no interiors. The window strips use the kit's plain `winIntact` / `winDead` colours.
- **The harbour mole stands 15 m over the water** (the apron's height). A stepped landing stage and the boats to Nulab are owed.
- **The shafts, the station's platforms and the gene bank's vault are inside the rock and not drawn** beyond the station's mouth on the
  face and the lift halls; `KCARVE` / `KCAVERN` (and `KKARST` for the cliff springs) come with the interiors.
- **The Line's helix is a record**, checked for its grade and its length (64 km), not drawn.
- **No night**: the lit windows and Loj Fower's green and red lamps are day colours; `NIGHT` is fixed false.
- **The size** (6.27 million m2 at the Ancients' peak) waits on the owner (`PLAN.md` 9.11, question A).

## Baselined on purpose (2026-11-17)

- `tools/check_assembly_baseline.json`: `CLASH KMAT`, `_materials`, `_texPending`, `onerror` on `dist/ledge.html`. The first, third and
  fourth are the sealed Tungang bundle's `window.X =` lines, which its `window` proxy already keeps off the host's globals (the host's KMAT
  stays, `onerror` is swallowed, the first `_texPending` reset is ignored: `kits/tungang/tungang_bundle.py`); `_materials` is the Ancients'
  and Dalab's two library bindings, as on Span's page.
- `tools/check_source_baseline.json`: `RAWTEX` x4 in `src/45-host-stage.js`: the four library maps are grey detail maps (`materials.json`,
  keep 0) read as luminance against their sRGB mean (.47), the grain Span's ground uses; nothing is shaded as a colour from them.
