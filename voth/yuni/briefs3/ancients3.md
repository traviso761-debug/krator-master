# Round 3: THE ANCIENTS   (agent "ancients")
You own `src/61-ancients.js` (generated) + `tools/`. Your copy has been refreshed with the merged world again —
every other family's fragment, the updated API.md, and the planner's pass 2 changes to the terrain, the river, the
new irrigation canal and the Grand Vault. Your own files are untouched. Use `shoot_sheet.py` for close-ups.

Three items, all from the user, verbatim where it matters.

## 1. "in general, the worn structures don't look worn enough. rust should be more prominent than moss."
This is the big one, and it is a judgement about the WHOLE worn state, not one asset. Right now a worn structure is
a clean white building with a faint grey wash and some green on its ledges; it reads as new. It should read as a
thousand-year-old metal building that nobody has repainted — still recognisably white metal, still gleaming in
places, but streaked and bled and blotched with rust.

What to change, in rough order of how much it will buy you:
- **Rust-coloured staining, not grey.** The kit's `TEX.stain` is a grey multiply streak. Make a second, rust-tinted
  stain (or tint the stain instances toward `PAL.rust` / `PAL.rustStain`) and run it from EVERY ledge, cornice,
  window sill, ring and fastener row, not just the sampled ledges — long, narrow, overlapping streaks, heaviest
  under horizontal edges and at the foot of vertical seams. Use many more of them than you do now.
- **Rust bleeding out of the panel grid.** The white panel texture already has recessed seams and corner fasteners.
  Add a rust wash keyed to them so the seams read as bleeding lines and the fasteners as small rust haloes; the
  simplest route is a third albedo texture — "tarnished white metal with rust bleed" — used as the worn skin
  instead of plain `MAT.white`, with the seams and bolt rings dirtied and a low-frequency blotch of rust over it.
- **Patches of exposed substrate.** Scattered irregular areas where the white skin has gone entirely and the rusted
  steel beneath shows: a handful of `MAT.rust` panels laid flush on the worn shell, concentrated on the weather
  side, at the tops of towers and under every overhang.
- **Streaked verticals on tall things.** The towers are where this reads at distance: long rust runs the full height.
- **Cut the moss right back** — roughly a third of what you place now, and only in the damp places (north faces, the
  foot of walls, inside parapets). Vines likewise. The user's instruction is explicit that rust should dominate.
- Keep the tint reading as white metal underneath. "The original white sheen is still visible, if a bit tarnished"
  is still the brief — this is a dirty white building, not a rust-coloured one. If you find yourself at the same
  value as the ruin variant, you have gone too far.
Then look at a worn tower, the worn lab and the worn factory at distance AND at eye level, and be honest about
whether they now read as ancient.

## 2. "make a version of the satellite dish that's reclaimed but with the dish intact"
`ancient_dish` ("the Ear"). The user wants a state where the structure is reclaimed — patched, inhabited, lived in —
but the dish reflector itself is WHOLE: not holed, not fallen, no dropped panel on the ground. Narratively this is
the Order maintaining the one Ancient instrument they can still point at the sky, so it is worth making it look
cared for: the reflector clean and complete, the feed horn and its struts intact, the mount and trunnions whole,
and the inhabitation dressing (lean-tos, awnings, lit windows, ladders) around the base and on the mount rather
than over the dish. Add it as its own variant — so `ancient_dish` becomes four: worn · reclaimed, dish intact ·
patched & inhabited · ruin — and name it so the difference is obvious in the inspector.

## 3. "give the hospital 4 cylinders rather than 3"
`ancient_hospital` ("the Cloister"). It has three cylindrical towers; make it four. Keep the plan legible — four
reads best as a square or as a cross about the court rather than an arc of four — and keep the footprint honest
(re-measure `w`/`d`/`h` afterwards; it is 80 x 60 x 33 today and may need to grow). All variants.

## Also
- Your round-2 list is still open: the robotics works takes almost no dressing (the wall sampler bins by angular
  sector, which under-serves long rectangular buildings), the quad is squat at 30 m on a 124 x 104 plot, and the
  worn factory is 61k triangles. Fix what you can cheaply; say what you left.
- Budgets are relaxed; do not strip detail to hit a number.
