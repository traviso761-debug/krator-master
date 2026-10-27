# biomes/swhighlands: notes

## Station 1, the ring folds (2026-10-26)

Built on the owner's go-ahead for station 1, from `PLAN.md`'s proposals as written (the open questions are in `KNOWN_ISSUES.md`).
The first of the planned biomes on the final rebuild's core: started from `biomes/nhighlands` (the full adoption) and
`biomes/abyssal-savannah`; `PLAN.md` "Core adoption" lists every module taken and why the rest are not.

- **The ground** is records first (`KRELIEF.range` x4, `KRELIEF.gap` for the water gap, the arch's wind gap and the gorge's four
  steps, a `KCARVE` alcove for the cave's mouth, `KRELIEF.river` for the three courses' levels, `KRELIEF.fields` for the farm), baked
  once into a `KFIELD` heightfield (6 m, a 2 m inset over the gorge and the cave). The ground mesh is a 6 m grid holed under the inset,
  the inset's rim on the base grid's lines (no crack).
- **The beds**: one `KSTRATA` `ringfold` stack, folded about axes along the crest (wl 1.7 km, amp 150 m, sharp .85), the chevron's
  crest on the cave's mouth; drawn on the ground's steep faces, the rock bodies and the cave's hood; the inspector names the bed.
- **Placement** is all `KRAND`: one candidate a cell from `KRAND.hash(world, i, j, salt)`, each tree's form from
  `KRAND.stream(its seed)`; no `BIO.grid` (its draws are a stream) and nothing from `BIO.fn`'s sin hash. Keep-clear on `KSPACE`.
- **The look pass so far** (the owner's notes, 2026-10-26): the cave stream meets the river as one water through core/water's new
  `WATER.join` (moved into core on the owner's word: cut at the tuck line, levels raised, drawn after the river), and every channel
  near a point is carved with the lowest kept (no channel or bank across the other's water, no tip); the arch's and the bridges' upper corners worn
  round and their faces roughened; the bite, the gaps, the gorge and the sink given irregular edges (`rough`, KRAND radius noise).
- **Later look notes, same day**: the tributary's end fades into the river (`drawFlow` `endFade`, new in core/water: its foam stops,
  it takes the river's colour over the river's bank foam, then fades out); the lattice oak's cup-pads textured (`organic.funnel.trumpet`
  from above, a veined fallback); the pads and caps on an opaque material (the bead cone's cap showed what stood behind it on the
  foliage hook); the river cave moved to the ridge's foot (a ~22 m face; no bite cut deeper than 28 m under the natural ground; a
  smaller mouth): it had been a pit under a ~100 m wall. The owner's reference photos match `refs/26`, `28`/`29` and `31`.
- **Measured**: `PERF.md` (before these late notes; the cave and the pads change the counts little).
