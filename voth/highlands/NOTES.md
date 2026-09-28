# Highlands — notes

## Round 1 (Sep 28 2026) — the kit

Brief from Travis: a new building kit, **Highlands**, for the highland temperate regions of the Inner Wall, in
three branches (Republican, Rustic, Tribal), as the first step toward the settlement **Raketstad** (East
Highland Republican; the town itself is the next round — not started). Deliverable: `dist/highlands.html`
(and one page per branch).

Decisions:
* New repo `highlands/` on the Ancients fragment contract, vendoring the **Iziz Vernacular** materials, registry
  and building blocks (`69b`, `69c`) from `../iziz` rather than re-writing them: one placer (`VERN.place`), one
  inspector and one set of blocks serve both kits, the Iziz note in the Republican branch comes for free, and
  the Raketstad city target can reuse Iziz's city machinery (terrain, painted ground, occupancy, placers).
* `HL.def` wraps `VERN.def` with `branch` + `family`; the showcase lays rows out from the registry
  (`hlLayout`) and generates its views (`hlAutoViews`), so builders never touch a rows/views file and five
  packages could be built in parallel without conflicts.
* The carving is drawn, not painted by hand: `70-hl-tex.js` has a small formline kit (ovoid, U-form, split-U,
  trigon, eye, swoop, a symmetric crest face) from which the crest boards, totem columns, wings and frieze
  are composed. They carry their own colour (black / red / teal on cedar or white).
* Non-square world-UV tiling (`hWorldUV(mat,Ku,Kv)`) for the lace and frieze maps.
* Cliff settlements: every tribal dwelling takes `o.cliff` (cantilever beams + raking struts into rock at −z);
  `hnCliffWalk` joins houses with walkways and flights of stairs; `hnSub` places a def inside another builder.
* Travis's ruling mid-round: the carved **faces** were too creepy. The formline maps were redrawn as animals —
  `hFormA` salmon pair, `hFormW` orca over waves, `hFormT` thunderbird, new `hFormB` bear; totems stack eagle,
  bear, frog. `hlFace` is kept (unused) for specific depictions later. Package agents were told: no new faces.

### Round 1 result
Five packages built in parallel worktrees and merged (each touching only its own two fragments):
R-A Republican homes + trade (22 defs), R-B Republican civic + guilds (13), R-C Republican monuments, walls,
industry, farms, mines (15), RU Rustic (17), TR Tribal (15) — **82 defs**. Whole kit ≈ 1.4 M scene
triangles, ~170 draw calls. Heaviest: Hall of the Republic 151 k, fortress 134 k, cliff settlement 84 k.

Integration fixes: the showcase widens the gap before tall rows and keeps eye-level cameras clear of the next
row; the label atlas used a fractional column count (4096/409) and misaddressed labels — fixed in
`../iziz/src/93-labels.js` and re-vendored. Package-local helpers (`hnRA* hnRB* hnRC* hnRU* hnTR*`) that deserve
promotion to the shared vocabulary next round: `hnRCGableX` (separate ridge-end overhang, tiles wall runs),
`hnRAKryltso` (correct stair run), `hnTRWalk`/`hnTRRock` (struts aimed at the real rock), the `*Folk` variants
that stand people on raised floors, box-built animals (`hnRUBeast`, `hnRCBeast`), `hnRAEyelid`.

Next: **Raketstad** (city target) — Iziz's city machinery (terrain, painted ground, occupancy, placers),
the Ancients spaceport + launch arcologies, the NW-lowlands biome.
