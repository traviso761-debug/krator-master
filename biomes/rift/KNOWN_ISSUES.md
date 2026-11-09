# Krator biome kit — the Rift: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The Rift is to be rebuilt as four stations** (the owner, 2026-10-27): the savannah, the jungle, the cloud forest on its
      sky islands and Cube's plateau. `PLAN-STATIONS.md` is the plan, answered by the owner (the gallery question left); the single-page rebuild is parked on
      `claude/rift-single-page-experiment` (its parts now taken into the stations). Until the stations land, the items below are the old page's.

- [ ] **Station 1, the savannah** (`python3 build.py --station savannah`, `dist/rift-savannah.html`; 2026-10-27, a first cut): the model's
      px 369,1166, the apron and the plain, tors, washes, a dry salt pan; the apron thinned (`STATION_PAGE.thin`); the abyssal savannah's
      thatch grass, ember lilies and burn mosaic read in place (`stations/savannah/read.json`, `87-host-cousins.js`).
      2026-10-27, the known issues of the first cut, done: **the burns in the ground paint** (`burnGround`: the paint's canvas,
      painted over after the abyssal savannah's fragments load, char on a fresh burn and the green flush on a young one, smoothed,
      never read back) and **in the Rift's own floor** (`RIFT.burnAt`: its savannah grass gone on a fresh burn, green on a young one);
      **the floor's near and mid bands over the whole page** (`RIFT.wholePage`: they were boxed to the old page's spine, so most of the
      station had only the far band); **the far country drawn from the model** (`89f-host-far.js` on core/terrain's KFAR, the heights
      baked by `stations/bake_far.py`: the central island rising +3.5 km 26 km west, the terminal sea north-east as flat water, to
      50 km). The rough edges, 2026-10-27, done: **the island's shape** (ridged spurs and gullies between the model's cells, deeper with
      height, none on the floor, and KFAR's crest pass); **the sky at the seam** (a gully running off the page looked up under the far
      field: the seam now takes the lowest ground along the edge, so every cut opens onto far ground); **the far country's colour** (the
      shared sky's fog colours a pixel with the sky toward it over its own distance, which KFAR.fogThin cannot thin: it turned the
      island the gold of the horizon haze; the far field now carries its haze in its vertex colours, fog off); **sharper burns** (a 9 m
      burn grid). `verify.py --assert --all-views` passes on the GPU (Intel Arc 140T; its own export box, the densest cell of trees;
      the blade pear's pads named as food not drawn as fruit): 10 views, 10-237 calls, 0.5-6.9 M triangles drawn, 22.3 M held.
      Still open: the far field ignores the weather's fog (it stays clear in a fog or a storm) until the shared fog can be thinned
      per material; the ground paint is 4.6 m a pixel, so a burn's edge is a few metres soft.
- [ ] **Station 2, the jungle** (`python3 build.py --station jungle`, `dist/rift-jungle.html`; 2026-10-27, a first cut): the model's
      px 418,1251, the Lizardmen river 3's mouth on the terminal sea (y 0 at the sea's -2,600 m): the shallow yellow sea, a coastal
      lowland, a two-step escarpment (the `rift` strata on its faces), the jungle plain rising toward Cube's plateau; the river across
      the plain, over the cliffs in two falls (158 m and 87 m, into plunge pools), across the lowland with a delta channel
      (`stations/jungle/89w-host-water.js`); the old page's Girder tower on the plain; the far country from the model (`89f-host-far.js`,
      now shared in src/). New shared hooks: `MAP_WATERH` and `MAP_DRY` (a map's own water level and dry-ground mask: nothing
      roots in the river or the pools, the kit's shore logic sees the river's level). Open: the views are worked out from the map
      and some want a look (the jungle's crowns hide much at 40 m); the delta channel is one;
      The falls (2026-10-27, with the water session's core/water fixes, branch claude/rift-falls-water merged): each lip at its cliff's
      edge (found from the ground), the curtain down the face (154 m and 90 m) into a pool at the cliff's toe, a basin carved under its
      water (45m POOLS); the river in a channel with banks (its ribbon's edges buried, where the old carve left them floating as slabs),
      its bed never rising toward the sea (it cuts down through the plain's rolls instead of damming a pool behind each); the delta on
      the river's bed. Measured: of the ribbon's edge points, plain 0 / 988 over the ground, bench 1 / 38, lowland 5 / 96, delta 14 / 76
      (at the fork, where its ribbon crosses the river's channel); each pool's rim open only where the river runs in and out.
      GPU verify OK at 35.7 M held (ceiling 40 M), 197 calls (Arc 140T); the old page (`dist/rift.html`, still built by plain `build.py`) retires when
      the gallery switches to the stations (the owner's call on the publish).
- [ ] **Station 4, Cube's plateau** (`python3 build.py --station plateau`, `dist/rift-plateau.html`; 2026-10-27, a first cut): the
      east island at px 448,1237, the page round the ruin (the plateau's scarp and the floor below it are 12-25 km off on the model:
      the far field's, not the page's). y 0 is the model's -507 m, the ruin's plinth at y 300 (-207 m: the shared planting mask takes
      ground under y 0 for the sea). A ridge north-west to south-east through Cube, falling north-east and south-west, two streams
      in shallow valleys (89w). THE RUIN is now THE PILE (the owner, 2026-10-27: "the 4th station will now use the Pile rather than
      arccube, and must be able to cover its lower decks in wild vegetation"): kits/ancients' target arcpile (built on
      claude/upbeat-yalow-7b38ae, not yet on this branch: `stations/bake_ruin.py --page <its dist/arcpile.html>`), its ruined site
      baked as massing (vertex clustering on an 8 m grid: 46.6 k triangles, 604 KB) with its roofs (`RUIN_ROOFS`, `overgrow` on the
      base's), drawn on a 1.4 km plinth. THE DECKS OVERGROWN (87 `plantDecks`): the base's 64 roofs (37-219 m up, ~507,000 m2 open
      to the sky) painted moss and litter, dressed dense (moss, ledge plants and tree-ferns, curtains off every edge: 65's new opt-in
      `keep` refuses the parts under the tier above), 2,128 trees and shrubs rooted on them (ribbon fern, gold lantern, vine beard, the
      jungle's curly shrub, prism bush, croton and lobe tree); the base's walls hung with vines and its undersides with roots and
      curtains; the crown's farmed roofs left to its people. THE FLORA round it: the east island's forms by `BIO.kin` with their
      habits (open bell, plate frill, rim cushion, copper pine; plateau parasol, ribbon fern, gold lantern, vine beard), over the
      jungle's upper fringe. Held about 31 M (trees 23.4 M, dress 3.0 M, floor 4.7 M; ceiling 40 M), an 18 s build (Arc 140T).
      Open: the walls (37 m storeys) carry less growth than the decks (curtains to ~22 m); the vine beard's vines and the plate
      frill's broad opaque fin card are builder work; the people in the crown (the Tungangs' Loj Nahn) are the settlement work's;
      the 8 m clustering leaves the mass faceted close to.
- [ ] **Station 3, the cloud forest** (`python3 build.py --station highland`, `dist/rift-highland.html`; 2026-10-27, a first cut): the central
      island at px 356,1164 (y 0 at 1,000 m): the wet west face benched in three treads and cut by four ravines, the crest at 2,057 m,
      the dry lee; the cloud as the height fog's band at 1.42-1.95 km; the families as `BIO.kin` cousins of the sketch's species with
      the island's colours and sizes (`87-host-families.js`: mantle palm, drip lobe; comb frill; crown barrel; table pine, blade fan),
      planted by band; the sketch's species they replace, and the savannah's and the rims', thinned out (`STATION_PAGE.thin`); the
      old stock (cloud parasol, beard tree, tree-fern, lantern tree) under them.
      The quality and diversity pass (2026-10-27): band A (the cloud foot) fell through every zone, so it drew the valley's savannah
      gold and no understory; the cloud's base now reaches it (`cloudK`), so it is cloud forest, litter and moss, the old stock at a .3
      share under the mantle palms. The floor's own species are off the island (trumpet, pagoda, curly shrub, prism bush, thornwhip),
      the giant groundsel at .4, the lantern tree at .6. The hoodlet (a kin of the cloud bell palm) stands in the face's gullies;
      the lee's pines are denser and its ground is summer-dry grass and earth (`MAP_PAINT`, a new opt-in station hook in the shared
      paint). The LOD origins sit ahead of the views' cameras (their foregrounds were stand-ins and impostors). Held about 33 M
      (trees 24.7 M, floor 6.2 M, far 1.1 M; ceilings 40 M and 30 M a pass); 76 k trees, 2.35 M instances, a 33 s build on the Arc 140T.
      The families' forms (2026-10-27, habit fields the builders read, opt-in: 55-trees over B[0]; the sketch's species draw as
      before): the mantle palm's fans closed up toward a hood (`bellK`, `bellTilt`), the comb frill's fins held level and long
      (`finLevel`, `finK`: measured 3-10 degrees off level), the crown barrel's fins fused into a cushion (`fused`).
      Open: the fins' translucent fringe (a new fin material), the night rosette, the glass pole, fog thread and crest heath are
      builder work still to do (the hoodlet is a kin stand-in); the ravines carry streams (89w: a WATER.flow line each, ~950 m down the face, on a bed that never rises
      downstream in a .9 m channel; white water by slope, no free-falling curtains: the risers are 31-41 degrees), their floors
      painted dark wet stone and moss; the
      ravine walls show the Rift floor's red beds (KSTRATA `rift`), where the island's own rock is still to be chosen; the west and
      east islands' records. GPU verify OK (Arc 140T): 32.1 M held, its export box in the cloud core.
- [x] **The croton drew its whole sheet on every card** (the owner, 2026-10-27: "stuck as a group of 3"): `card.leaf.redvein` is three
      different leaves 3 across at uneven widths, which `tools/textures/check_cells.py` read as one plant (its grid test is for even
      grids). Now one leaf a quad, each quad its own leaf's box and proportions (core `BIO.geo.cells({rects})`, new, opt-in, tested in
      `test-leafset.js`); `check_cells.py` reads uneven sheets too. With every library card pulled, it finds one more uneven sheet
      drawn whole: `card.frond.coconut` in the Throne and the crops kit (theirs to fix at their turn).

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the far salt lakes east and west (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Rift's two walls, the far rim down the
      valley and the far shore's canopy (ridges, in front of the giant as the old overlay dome kept them); the far salt
      lakes east and west, the walls' notches and talus are not drawn. Draw calls at the default camera (verify.py --assert,
      GPU): 523 before, 521 after.

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/rift.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. Held vs drawn (the runtime LOD, Oct 2026; the probe, now 99-host-take): ceilings of 27M triangles
      HELD (in memory, the hero trees' stand-ins included), 17M DRAWN at any one camera and 700 draw
      calls; 19M per pass. Before the runtime LOD the scene held 24.1M and drew all of it from every
      camera in ~64 calls. Now it holds 25.7M (+1.6M: the stand-ins, the small species' far blobs,
      the spine's far floor band; trees 17.1M, impostors 2.6M as their own pass `rift/far`, floor
      5.6M, dress 0.3M) and draws, at the presets, 14.8M / 577 calls (the frill trees), 13.9M / 473
      (the cloud forest), 11.6M / 432 (down to the savannah), 3.5M / 340 (from afar); over all fifteen
      presets 3.5–16.0M in 217–577 calls (the peak, looking down both faces of the ridge, is the
      heaviest). The build takes ~10 s longer (the bake splits 58 meshes into 1737).
      verify.py reports the drawn ceiling and the calls at its camera (soft, like every budget).
      The first build measured 27.5M: a 340-tri helix put three to six times per curl plant, 9 m
      brain domes, and a 28-tri capped beam item under every tiered tree. `RIFT.build({quality:.6})`
      and `BIO.LOD.scale` are the knobs. The heaviest items now: the far bucket, stems (rods), the
      frill fins, pinecone succulents (96 tris each), pods, rosettes (72 tris).
- [ ] The runtime LOD gains little near the spine: a chunk is 1.2 km on a side, so from a camera in
      the jungle the six chunks round it are all within range and every hero in them is drawn (a
      shorter range for the small species was tried: no fewer triangles at the jungle views, +60
      calls). It costs draw calls (one mesh per item per chunk and range): on weak hardware lower
      `BIO.LOD.scale` or raise `BIO.LOD.chunk`. Chunks switch whole: at 1.2 km and more a chunk of
      heroes becomes stand-ins at once, a pop the thin haze (FogExp2 .0002) does not hide.
      Stays open 2026-10-26: a core change. The chunking and the range test are core/biome's (BIO.LOD, BIO._lodKey, BIO.lodTick); a finer
      hero chunk only for the near range (say 400 m sub-chunks merged into the 1.2 km chunk past it) or a dithered cross-fade over the last
      15% of the range in the shared leaf and bark shaders would answer both halves; neither belongs in the kit.
      2026-10-27: answered on every page by the core's graphic-load scheme, now taken (45s: `BIO.LOD.merge`, `minTris`, the dithered
      cross-fade `BIO.LOD.fade` .15 (no pop at the switch) and the per-instance cull `BIO.LOD.cull` (an instance stops at its own
      range, not its chunk's)); the stations' LOD origins are a lattice, not a spine. To close when station 1's GPU numbers are in PERF.md.
- [x] The highlands (cloud forest, ridgetop) are planted from this kit's fields and could still
      become their own kit; the ridgetop has four species of its own and a garrigue floor.
      Stays open 2026-10-26: a design call for the owner (a new kit), not a defect of this page.
      2026-10-27, decided (the owner): the rims are `biomes/riftrim`'s; the Rift's highlands are its sky islands, station 3 below
      riftrim's bands, with families that are riftrim's cousins (`PLAN-STATIONS.md` sections 4 and 5).
- [ ] The zone weights (RIFT.zones) are thresholds on the five fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
      Stays open 2026-10-26: a note for a host with other fields, not a defect here; retuning the bands would move every tree on this page.
- [ ] The far shore of the lake (the jungle south of it) and the Rift's walls are
      painted on the sky; a world that already draws its horizon as geometry does not
      need the overlay dome (a second 4096x2048 canvas, ~16 MB of texture).
      Stays open 2026-10-26: the sky fragments are being moved to core/atmos (the shared sky rollout); left alone.
      2026-10-27: the painted dome is gone (the shared sky); the stations draw their own far country from the scale model
      (KFAR, station 1 first). The old page keeps the sky's ridges until it retires with station 2.
- [ ] The streams have no cataracts and do not climb the ridge: they rise at its south
      foot. The savannah's dry wash is a shallow gravel bed with no bank flora of its own.
      Stays open 2026-10-25: a design task (the ground has no drop for a WATER.fall; none invented).
      2026-10-26 (part done, `src/89w-host-water.js`): there IS a drop: each channel starts at a canyon head 420 m south of the crest, a wall
      from the ridge (east ~131 m, west ~94 m) straight down to the bed (.55 m). A spring now leaves the ridge top there as a WATER.fall
      (8 m lip on the last ground-mesh row still on the ridge, thrown at 3.5 m/s so the curtain clears the wall the 15.3 m mesh cell leans out),
      and each stream's WATER.flow runs the whole channel .45 m over its bed (never rising), meeting the lake's level where the bed dips under
      it: water from the head to the lake, where before the channel was dry until 430 m from the shore. +4 draw calls where the springs are in
      view, ~3k triangles. terrainH and BIO.waterH unchanged. A look call for the owner.
      Stays open 2026-10-26: the streams still do not climb the ridge (that is a carve of terrainH up the south face, which moves every
      placement near it and the open world's ground), the channel's grade is flat (~.1%, so no rapids), and the wash has no bank flora.
- [ ] The water's ripples are shader-only, so the scum mats (at the local water level +.04)
      never bob. Fine at any distance; wrong if a world animates its water mesh.
      2026-10-20: the water is core/water's now (lake: WATER.open, a swell of centimetres; streams: WATER.flow), so it does move, and the mats and
      pads still sit at `BIO.waterH` + .04: they do not ride `WATER.heightAt` (an amplitude of a few cm, under the mats' own height). Still open.
      Stays open 2026-10-25: the mats are the floor's baked dress (60), which would need a per-frame ride on the water; not an hour's fix, out of budget.
      Stays open 2026-10-26: needs core/water: a vertex chunk that evaluates the surface's swell in GLSL (say `WATER.rideGLSL(surface)`, the same
      sum of waves `WATER.heightAt` evaluates) that a kit's instanced floaters (BIO.leafMat's vertex hook) could add to their y.
- [x] The scale-moss (`clubmoss`, an iridescent tuft) still uses world-up as its iridescence
      normal; the curls and rosettes now carry one (`aN`), so their `softC2` (the second colour
      pulled back toward the base for want of a normal) could be relaxed.
      2026-10-26: the scale-moss carries `aN` too (`M.clubmoss` aN, def attrs; 60 `tuft()` and 65's dress give `leanN(yaw, .35)`
      from the yaw they already drew, so no placement moved), and softC2 is relaxed: scale-moss .5 -> .35, curls .35 -> .2, the trees'
      rosettes .6 -> .45, the floor's .3 -> .2. A look call for the owner (the small plants turn further toward their second colour).
- [ ] The stand-ins' blobs are 20-triangle icosahedra: faceted when a hero chunk switches at
      1.2-2 km; the trees built far are 80-triangle blobs. From afar the jungle's stand-ins read
      bluer and more magenta than the heroes they replace (cyan columns, magenta caps: the far
      impostors' look, which the view already had in its foreground); the lobe trees' and bell
      palms' yellow-green is lost in the blobs.
      2026-10-26 (part done, 55 buildFar): a stand-in's underside is its leaves' shade (L[2]) instead of the iridescent colour, and it turns
      less (IRID_LITE .25 against IRID_FAR .4); the far trees keep their look. The shift is small (about 1.6% of the From afar shot's pixels
      moved, a little less blue). Stays open: the faceting. 80-triangle blobs for the 38,611 stand-ins would add ~2.3-2.8M HELD triangles,
      over the 27M ceiling (25.7M now); a cheaper round blob (or a normal-bent 20-triangle one) is the next try.
      2026-10-27: the tall species' far trees and stand-ins are octahedral impostors now (core/biome 34: one quad each, baked from the
      tree), not blobs; the small species keep their 20-triangle blobs. Open for the owner's eye: the impostors' light
      (`BIO.impostorLook` gain 3.6, nhighlands' value, not yet measured on this kit; `?impgain=` to try others).
- [x] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's tower still passes one list. 2026-10-20: the host tower hands three shells ({geos, share}: floor plates 1, iron .6, core walls and rubble .4), so the plates no longer take the moss; one test tower is all the host builds (Girder itself is not changed).
- [ ] No fauna yet.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), done 2026-10-06: every species carries a harvest tag
      (`RIFT.HARVEST`; the ball vine in `RIFT.PLANTS`), the four fruit name their catalog keys (`RIFT.FRUIT_KEYS`), the inspector
      shows the tag, and the probe checks it ("fruit tagged, catalogued and drawn", with two negatives). Split ballmelons: a few
      near-band vines (14%, from the spot's hash) end in a melon split in two, rind cup and yellow flesh face
      (`melonhalf` / `melonflesh`, 48 tris a melon; about 180 on the stage). 2026-10-20: the stone pine's nuts
      (`generic_fruit_parasol_pine`), the acacia pods (`generic_fruit_acacia_pod`), the monkey-puzzle seeds (`generic_fruit_puzzle_seed`) and the baobab's
      pale pods (`generic_fruit_pale_baobab`) are catalogued and tagged; none is drawn on the stage. `FRUIT_NOT_DRAWN` is down to the cycad's
      starch and the cloud fern's fiddleheads.

## Done

- [x] **2026-11-09: the attach audit's floating crowns and blooms, held** (`src/55`, `src/65`, `src/50`). The GPU verify failed the core
      attach audit on four pages (jungle 3.43%, plateau 1.72%, savannah 15.55%, the main page 6.80%; highland passed at 0.47%). Causes:
      the parasol and violet dome canopies jittered round their spots (the dome's lift took them up to 11 m off the boughs), the
      dragon tree's and croton's urchins and the monkey-puzzle's blooms set above their tips, the trumpet's cup blooms drawn 1.5 m
      over the cup's floor, the dress's curtain flowers hung far down the ribbons, the scum mats on the water not `free`. Fixed: each
      hero is built in a span log (`logged()`: tubes, beams, every lathe's axis through `latheL`, the instanced trunks and lobes
      through `putT`/`putL`), and `clumpAt` and the blooms (`holdP`) are brought to within reach of the nearest span (`BIO.snapSeg`,
      `BIO.holdTo`; `.2*size+.3` a stem card, `.55*size` a centred one, plus the span's radius); the trumpet's blooms sit on the cup
      floor (`cupY`); the curtain flowers are held to the curtain's head; `pad` is `{free:true}`. Positions only: no draw added or
      moved, the same instance counts. After, `verify.py --assert` passes on the GPU (Intel Arc 140T) on all five pages: jungle
      0.03% (4 of 14,576), plateau 0.06% (10 of 16,930), savannah 0.11% (6 of 5,600), the main page 0.14% (19 of 13,357), highland 0.02% (2 of 12,245). Caps with capWhy raised for the counts measured: pleat 600,000 (505,369 on the plateau), claw 450,000 (353,886 on the savannah).
      The look moved: the violet dome's canopy sits lower and flatter, on its boughs. Readers rebuilt: riftrim (6), ringisles (3), xanadu floor.

- [x] Runtime LOD (Oct 2026, xanadu's port): every hero tree drawn within `RIFT.LOD.tree` (1.2 km)
      of its chunk and as a stand-in impostor past it; the far trees per chunk against the view;
      the floor's bands, logs and dress by range, with a far band standing in for the spine's
      near and mid bands; `BIO.lodTick` (a view subscriber in 99-host-take since core/host); the probe's budget as held / drawn / calls.
- [x] The small species become far impostors (`buildFarSmall`, a 20-triangle blob shaped by habit)
      instead of stopping at ~1.3 km from the spine, and stand in for their heroes; the curls,
      pinecones and silver scrub (under a pixel there) do not. The frill and carrot frill
      impostors carry a few fin triangles.
- [x] The impostors keep the iridescence (`RIFT.farMat`: a second colour packed in each vertex's
      uv, the leaves' rule or the iridescent bark's): the frill column goes teal to violet at any
      range. The curls and rosettes carry a real per-instance normal (`aN`, `RIFT.leanN`) for
      their iridescence; the fins and fans already did.

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the zones' shore height, the
      keep-out above the water, the scum mats, the shallows' reeds and the water band of the floor. With
      this host's level of 0 the geometry is the same bit for bit (mesh fingerprints).

- [x] The Rift's two walls painted twice (dome + overlay in front of the giant), with the
      far lakes east and west and the far jungle / savannah lines by azimuth.
- [x] The ridge's south face benched (two treads), mesas and saddles on the crest, the
      mask zero on cliffs so the faces stay bare rock.
- [x] Thirty-four species built and zoned from five fields; iridescence as the rule.
- [x] The spire cactus replaced by the Rift croton; fan fronds twice the size in a light purple.
- [x] The brain-coral tree replaced by the trumpet tree; a wide-canopy
      parasol tree; the savannah's purple (Vain fronds, heath, pinecone succulents).
- [x] Every bole lathe ends in a dome ring (inherited lesson, kept).

- [x] **Frill-tree fins: use the owner's fractal frond** (`card.frond.fractal`) next pass, for the frill tree, carrot frill,
      cloud frill and barrel frill (`biomes/README.md`, "To do: frill-tree fins"; the Throne's frill tree is the example).
      2026-10-26: the `frill` slot is `card.frond.fractal` (materials.json: the middle frond, cell [.34,.18,.66,.82], 1024, grey at the
      old mean so each species' fin colour and its iridescence stay), drawn on a whole-length fin card (`G.finquad`, 50: the old frond
      strip's arch, half as wide as long, 6 triangles as before) when the pack has it; the procedural page keeps the frond strip. All four
      frill species share the item, so all four changed. Same triangles and calls; the page grows 340 KB (the 1024 card).
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (phase 3 of putting every biome's water on core/water): `water` is in the profile. The algal lake is `WATER.open` (a mask of the lake side of the shore, lakeIn < 24 m; a bed baked from terrainH, clamped at 1.4 m to keep the surf bands off a still lake) and the two streams' last reach are `WATER.flow` ribbons (a hand above the lake, y = .1), all in `src/89w-host-water.js`; the 300x300 plane (180k triangles) and its ShaderMaterial are gone. `BIO.waterH` and `terrainH` are unchanged (the water is still y = 0). EXPORT_BOX moved to [760, 1700, 1060, 2000], the east stream's mouth, so the box holds a surface (it was [300, 0, 600, 300], on the savannah's edge: no water). Budgets: the Algal shore camera drew 521 calls / 13.74M triangles before and 522 / 13.59M after (the ceiling 27M held / 17M drawn / 700 calls, all held). What changed in the look: the lake's pale algal shoals and scum patches (a vertex colour) are gone from the water itself, the streams are a ribbon with white banks, the sky in the water is the page's captured sky. Gaps: core/water/README.md, "Open gaps (phase 3, rift/eastabyss)". The water has no raycast (the plane was `probeSkip` already): the inspector names the ground under it.

2026-10-25 (the last workarounds off the lake and streams, `src/89w-host-water.js`): the lake bakes the TRUE bed and has `surf: false` (the 1.4 m clamp is gone); the streams are drawn AT the level (y = 0) with `drawFlow({depthBias: 2})` in place of the .1 m lift; the pale algal shoals, scum mats, pale rim and the streams' fresh colour at their mouths are a `tint` field on the one lake surface (cell 12 m, from the old `waterColorAt`: the same shoal and scum fbm fields and thresholds), with `ramp: [.5, 8.5]` (the old plane reached deep at 8.5 m). The "gone from the water" line above is struck by this.
