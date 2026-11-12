# kits/ancient-transit: known issues

`verify.py --assert` passes on the GPU lane (2026-11-08; the numbers are in `README.md`). What is open:

- [ ] **The overgrowth's plants are stand-in domes** (`KTRANSIT.draw.growth`: a plain green material, no map): the kit has no flora of its own
  (flora belongs to the biome kits). The records are the point: `span.growth.plants` has a world position, a radius and a height for each,
  so the valley plants its feral forest's species there (`plants: false` on the draw keeps the soil and the creepers). The soil is a sweep on
  the deck's top in the rubble set's map; a soil set with roots and litter would read better.
- [ ] **The subway is seen from its pits**: the preset views look down into the fallen-in station, a stair pit and a sinkhole; the "the ground"
  layer (the panel) hides the ground to look along the tunnels. No preset view stands inside the hall (the harness's eye check raycasts from the
  camera, and an interior eye would read as inside geometry): a cut-away (`core/host`'s `99-host-cutaway.js`) is the right way in, with the FULL host.
- [ ] **The sinkhole's bottom is dark**: the bowl goes 0.4 m under the tunnel floor, so the floor slab and rubble mound show, but the lining's
  lower half is drawn one-sided (the host's pit walls stand in for its outside) and the hall is lit by the hemisphere light alone.
- [ ] **The craters, the fault and the cuttings are the host's ground**: the kit gives `craterH` (a bowl with a continuous rim), `quakeH` (the
  scarp and the buckles) and `lineH` (a graded line's cutting), and the demo refines its mesh (1.8 m) round each crater, along the fault and along
  every graded line (`47-host-land.js`; 0.7 M of the page's triangles are that ground); a host with a coarser ground sees them only as far as its
  mesh allows (the valley's KGROUND is 2 m cells: fine). The scorch rings and the road's bands follow the ground at 3 m. The owner saw the
  coarse ground lapping over a cut road before the lines were refined (2026-11-09): a host must refine its ground along a cutting too.
- [ ] **A junction of arms under 30 degrees is a paved gore, not a widened junction**: the kerb-line corner between two such arms would lie
  `(w1 cos + w2) / sin` along each (40 m and more), so it is capped at twice the two widths plus 8 m and the kerbs end there on a slanted edge
  across a paved gore (`corner.sliver`). The road tools widen such a junction or refuse the angle; a host may rather turn one road. The demo's
  shallowest is 53 degrees.
- [ ] **The war's craters may lie in a junction** (its pieces, barricades and positions keep off one): the junction's patch dips into a crater
  as a road does, but the crater's rim rubble and the crosswalk paint are drawn over each other there.
- [ ] **The vehicles kit's textures arrive as LFS pointers in a fresh worktree** (`kits/motor-vehicles/tex/`): `tools/build.py` refuses the
  build until `git lfs checkout -- kits/motor-vehicles/tex` (or `git lfs pull --include="kits/motor-vehicles/tex/*"`). The blockades' wrecks
  come from that kit's `ancient` culture (merged here from the vehicles session's branch, 2026-11-09); without its bundle the draw puts burnt hulks.
- [ ] **The fault breaks a road as a sheared S-bend, not a torn edge**: the strike-slip is a smooth shift over the scarp's width, so a road or a
  rail bends through it in one piece (buckled rails, a kinked kerb); a true tear (two cut ends offset, a gap) wants the surface cut at the fault.
- [ ] **The military kinds are plain**: sandbags are rows of rounded boxes in the rubble set's map (a burlap set would read better), the wire
  a tube helix, the watchtower boxes and rods. The positions' layout is three recipes; a host wanting more (bunkers, trench lines, a gun pit)
  adds a kind and a recipe in `44b-tr-war.js`.
- [ ] **The decks, platforms and stair towers are not walk floors** (`core/walk`): F walks the ground under them. A `KWALK` registry of
  the spans' tops (and the ramps', graded) is the next step; the records have everything it needs (a span's two ends and width).
- [ ] **A cracked span's broken edge is straight**: the deck is narrowed on the cracked side by `crack.depth` and its barrier is gone, but
  the edge is a clean line, with no rubble below it. A jagged edge (a few frames with KRAND jitter) and chunks under it want a pass.
- [ ] **The rubble under a collapsed span is boxes** (one instanced mesh of jittered boxes): `KRUBBLE` (core/terrain's heaps, on the
  metropolis branch, not on `main` yet) is the right thing; the records are heaps' worth of chunk records already.
- [ ] **A gone span's deck is nowhere**: its piers stand bare and nothing lies below. Half of them should lie as a collapsed span does; the
  share is one line in `spansOf` when the owner says which.
- [ ] **A joined road's trim and carry are measured without the quake's shift**: `KTRANSIT.join` finds the first road a landing road crosses and
  the road its end lies beside on the unshifted line, while the network's roads carry the shift; where the fault's slip is large (the demo's
  west, under 5 m) the T may land a few metres off the kerb-line centre. A landing road that lands clear of every road (over 12 m from any
  centre line) stays a free end, as before.
- [ ] **Lamps on a cracked span stand on both sides**: only the cracked side's are dropped; a lamp standing at a cracked edge should lean out.
- [ ] **The rails are a sweep every 6 m with a six-point profile**, the sleepers one instanced mesh of six triangles each: the cargo line is
  49 k triangles over 3.4 km, half of it sleepers. A line of 10 km wants the sleepers dropped past a few hundred metres (a LOD), and the
  builder's 400 m chunks (`B.finish`) already let a view cull the far stretches.
- [ ] **The furniture bundle builds each piece from the catalog frame** (about 1-2 ms a piece): a valley's thousands of pieces take seconds
  at the boot. The draw caches by (kind, state, variant, seed) but every `pick` gives its own seed; a host that wants speed passes
  `o.kinds` weights that favour fewer kinds, or buckets seeds (`seed % 8`) before `dress`.
- [ ] **No shells or impostors**: every mesh is drawn at full detail wherever the view holds it; a view culls by the builder's 400 m chunks
  and the ground's tiles, so a street-level view draws 0.3 to 0.7 M triangles and the air view everything (about 1.3 M). The metropolis's
  `KSHELL` would carry a station or a span at range when a world needs it; the war's heaps and strewn pieces (160 k on the avenue) are the
  first thing to shell or thin by distance.
- [ ] **The level crossing's panel is a box across the bed**, not cut into the ballast; the gates' arms are boxes. The warning lights glow
  while the crossing is `intact`.
- [ ] **The trains' bogies do not come off**: a derailed car keeps its wheels under it. The cars are one merged mesh a family, so a host
  cannot spin a wheel; they are wrecks, not vehicles (the running ones are `kits/motor-vehicles`' `anc_tram`).
- [ ] **No catenary on the elevated line**, no third rail: the guideway carries its rails on plinths and nothing else.
- [ ] **Textures owed** (`core/materials/PROMPTS-NEEDED.md` section 42): worn asphalt with faded lane paint (the lane paint is geometry
  for now, `line` quads), rail ballast with sleeper shadows (`ground.gravel042` stands in), a rusted rail head (`metal.rust.heavy`).
- [ ] **The pavements read bright from the air** (`concrete.slab` at mean 0.62 under the kerb's vertex colour): the valley will tint them
  with its rust and grime as it does the towers (`avRust`); the kit leaves the colours plain.

## Numbers (the GPU verify, 2026-11-09)

The per-view calls and triangles are in `README.md` "Numbers". The owner (2026-11-09): "this is mostly just a dang road, there must be a way
to optimize it". What was done: the demo's ground refines only where a line cuts it (not along every road: 835 k to 365 k) and is drawn in
64 tiles with their own bounds, so a view culls the rest; the builder finishes a family of 3000 triangles or more in 400 m chunks, so a 3 km
road's far stretches are culled too; a road's rows adapt (12 m where straight and flat, 3 m where the heading or the surface bends); one
pavement band instead of three; sleepers of six triangles; a six-point rail; the war's heaps a seven-sided mound (a 250-triangle dome
before) and fewer of them. A street-level view went from about 2 M triangles to 0.3-0.7 M.
