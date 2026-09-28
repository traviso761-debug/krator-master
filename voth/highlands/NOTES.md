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

## Round 2 (Sep 28 2026) — motifs, pillars, signs, half-timber

Travis: keep the formline murals for the Tribes; give Rustic and Republican a wider repertoire in the same palette —
Celtic cats, knots, tree of life, triskelions, Norse hammers, wolves, grain, rockets, moths, warriors, sun, moon,
star, gas giant (greenish, as it hangs in the skybox); every shop a sign with a relevant symbol; Republican civic
buildings carry the Republic's emblem (three arms, swords held at 90° to the forearm); no totems outside the tribal
set — carved pillars instead, added where architecturally sensible; more elaborate half-timbering (Alemannic /
Franconian and Tudor references).

* `71b-hl-motif.js` — Celtic drawing kit (`hlPlait` billiard-strand knotwork with alternating over/under,
  `hlBraidRing`, `hlSpiral`, `hlCrescent`), the motifs, the emblem, 26 sign symbols (`HSIGN`), and the kit items
  `hM_w_* hM_g_* hM_t_* hM_d_* hM_sign_* hM_p_0..3` (carved pillar boxes) `hM_b_republic` (banner). Pick lists in `HMOTIF`.
* `73-hl-carve.js` — branch rules: `hnForm` swaps Rustic/Republican crests for a same-shape pick from `HMOTIF`
  (formline animals stay in the pool; rockets Republican only; the first wide crest on a Republican civic building
  is the emblem); `hnTotem`/`hnTotemPost` become `hnPillar` outside the tribes (free-standing ones carry a painted
  roundel finial); `vnBannerPole` flies the Republic's banner on civic buildings; `hnSign`, `hnSignBoard`,
  `hnEmblem`; `HTRADE` maps each trade def to its sign symbol.
* `72-hl-helpers.js` — `hnFachFace`/`hnFachBox` rewritten: a style per building (`alemannic franconian tudor
  saxon`), bay patterns mirrored about the façade (Mann, curved/ogee crosses, lozenge, star, close studding,
  herringbone, quatrefoil), patterned window aprons, gilded rosettes on the sill; carved corner consoles on jetties.
  Every half-timbered building picks this up through the shared helpers.
* `88-hl-dress.js` — a post-build pass: signposts for trade/guild defs that had no sign; carved two-pillar portals
  round the main door of nine buildings (door found by recording `vnDoor` calls).

## Round 3 (Sep 28 2026) — reclaimed variants

Travis: a variant of the residential, shop, farm, smithy, warehouse and tavern buildings with more reclaimed metal;
then: no metal walls (they did not suit the houses), keep the lean-tos, roofs FULLY metal, wealthy buildings get no
metal roofing; and the town wall, wall tower and gate get a reclaimed-roof variant too. Travis also caught the
bargeboard lace hanging upside-down on one rake of every gable (fixed in `hnBarge`).

`88-hl-dress.js`: every qualifying def gets a twin `<key>_reclaimed` in the same family row, running the SAME builder
and seed under a salvage filter on `kput`: any item skinned in a roof material (scale, shingle, thatch, turf) — slab,
gable, hip, keel, tent, eyelid — is re-issued as a metal twin of the same geometry (corrugate or rusted plate, one
per building), with sheets patched over the big slabs; walls are untouched; some posts become rusted pipe. Then a
corrugate lean-to with a stove and a scrap pile (not on the wall pieces). Rich defs keep their roofs. ~55 twins.

## Round 4 (Sep 28 2026) — fitting pass, orrery

Travis: murals over entrances cut into the architecture (Saxon buildings worst); the orrery should be the sun, the
gas giant orbiting it and Krator + two moons orbiting the giant; dougong lines ran across windows (Hall of the Republic).

`73-hl-carve.js` records every instance a builder places (local frame), and `VERN.place` now calls `hlFlush()` after
the build: bracket rows (`hnBracketRow`) keep their sets only between windows and break their wall-plate at each
opening; Rustic/Republican murals (`hnForm`) are tested (oriented-box SAT) against everything crossing a thin slab in
front of the wall and shrink/slide (down off jetties and lintels, or sideways) until clear, else are left out
(`window._muralStats`: 159 placed, 13 dropped kit-wide). A crowded Republic emblem passes to the building's next
crest. Orrery (`77-rep-guild.js`): gilt sun; banded green gas giant with its own ring on the great ring; Krator (blue
with green land) and two lesser moons on small rings round the giant, all on brass arms.

## Round 5 (Sep 28 2026) — Astronomers, Scavengers, the Mechanics' clock tower

Travis: the orrery clipped through the belvedere posts; give it to a new Astronomers' Guild; the Mechanics' Guild gets
a clock tower after the clocktower reference instead; add a Scavengers' Guild.

* `76-rep-civic.js`: the town hall's timber bell-and-clock tower is now `hnRBClockTower(TX,TZ,o)` (o.bigGear = a
  great clockwork wheel and gear trains on every face), used by the town hall and the Mechanics' Guild.
* `77b-rep-guild2.js` (seeds 21101–21129): `hl_rep_guild_astro` — hall painted with the heavens, copper observatory
  dome with slit and brass telescope, and the orrery tower (belvedere posts at r 4.9; the orrery reaches 3.9 —
  `hnRBOrrery`), sundial and armillary sphere; `hl_rep_guild_scav` — rubble-and-log hall under a salvaged metal roof
  with Ancient panels on the gables, a gate of two Ancient tank sections, a plate-fenced yard of sorted heaps, a pipe
  gantry crane, a weighbridge. `hnMural(item,…)` places a chosen motif through the fitting pass. New sign symbols
  `star` and `salvage`.

### Round 5b
* Scavengers' Guild keeps its metal roof (Travis). Its yard heaps now rest on scrap mounds (items were floating).
  **Raketstad placement: the Scavengers' Guild goes by the ruined spaceport.**
* The orrery turns: built from real meshes in nested groups (`hnRBOrrery`), the turning groups listed in `HLANIM`
  and driven by `94-hl-anim.js` (giant ~40 s a circuit, moons faster, sun and giant spin).
* Clocks keep time: every `hClock`/`hRBClock` face records its world pose (`HLCLOCKS`, 88); `94-hl-anim.js` adds
  hour and minute hands (two instanced meshes, updated each second) showing `window.HL_HOUR` if a sky/day-night
  system sets it, else the viewer's local time. The painted hands were removed from the clock-face texture.
* Mural fitting keeps symmetry: a big centred board if it fits, else a mirrored PAIR flanking the axis (either side
  of a door lintel), else a small centred one — never a lone off-centre board.
