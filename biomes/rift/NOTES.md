# Krator biome kit — the Rift (Sep 2026)

## What this is
The third biome on the biome-core contract (BIOME-API.md): THE RIFT south of the main
crater — an algal salt lake, an abyssal jungle, a ridge of narrow mesas wearing a cloud
forest and a Mediterranean crest, and an abyssal savannah — as one ideal-type artifact,
"Krator biome — the Rift". Same core as the eastern abyss kit (one additive extension,
see the API), same host conventions (Girder-quality flora, one ruined Girder tower in the
jungle for scale and for the growth-on-structures pass).

## The map (host, 45-host-stage.js)
6.4 km across, origin at the ridge's south foot, x east, z SOUTH. The lake is a long
east-west trough at the south edge, its north shore at z≈1900 with bays and points; the
water is a metre or two below the valley floor and yellow with algae. North of the shore
the jungle strip, two streams through it (damp channels, water only in their last reach).
Then the ridge: a crest 210–370 m with narrow flat-topped mesas (+95 m) and saddles, the
south face steep and benched (two benches: the cloud forest), the north a long dissected
pediment. Then the savannah, with a dry wash, to the map's edge. The sky carries the
rest: the Rift's north wall over the savannah (12°), the south wall beyond the lake and a
far shore of jungle (9°), and down the valley to east and west the next salt lakes, each
with its own tinge (pink west, blue-green east). Sun WNW, gas giant NE as canon.

Everything the biome knows about the map arrives through five climate fields (wet /
salt / upland / flow / mist) plus terrainH. A world that binds those fields gets the same
zoning without touching the biome.

## The lake colour
One hue (`RIFT_LAKE.hue`, yellow here) drives the water, the crust's tinge, the glasswort,
the scum mats, every bloom (the complement, blue-violet) and the second colour of every
iridescent leaf. That is the point of a yellow lake: its complement is the purple the
valley's foliage turns away from the sun.

## The flora (50/55/60)
Thirty-four tree species. The jungle: the frill tree (a tapering ribbed column 95–140 m,
a little under a Girder tower, a fin on every rib on every row, a splay of long fins and
a pale bud at the summit, teal-to-violet bark; the "frill tree" reference), the bell palm
(a pale trunk, dichotomous forks, an inverted bell of pleated fans at every tip, green
to purple), the lobe tree (a stringy plum bole, pads of lobed leaves in yellow-green shot
with purple, pods), the trumpet tree (a slim ribbed stalk flaring into a wide ribbed funnel, light green, blooms in
the cup),
the pagoda tree (tiers of level whorls, a terrestrial green), the curl succulent (the
"curly" reference: spiralling teal tendrils, a helix geometry), the prism bush (sprays
that go green to orange and magenta), the candle stalk, the carrot frill (the frill tree's smaller cousin: half the height, its fins longest low on
the column and shrinking to a point, a head of hot-pink flowers at the tip; both frills also stand in the understorey as saplings, the
same builders at a tenth to a third of their size), the violet dome tree (a second wide canopy, domed, in iridescent purple), the parasol tree (the jungle's
wide canopy, teal: boughs radiating level from one point under a flat dome of broad leaves) and
the anemone stalk (a dark sinuous stalk with a red anemone spray at each tip, from the
coral reference). The savannah: baobabs (a
lathe bottle trunk), monkey-puzzles ("abyssal sav 8"), Rift acacias, dragon trees, tree
aloes with red spikes, the purple fan shrub (sweet-potato purple, canon), candle stalks,
the Rift croton (broad veined leaves, green and yellow-green lit magenta and purple along the veins) and the pinecone succulent (a
cone of fat lavender-blue leaves tipped pink).
The cloud forest: the jungle's forms again at highland size in light greens with flowers of
every colour (cloud frill, cloud bell palm, cloud lobe tree, cloud parasol), the beard tree
(gnarled, draped in beard moss, moss and epiphyte rosettes), the cloud tree-fern and the
lantern tree (drooping boughs hung with bright pods). The ridgetop (the Mediterranean crest and the dry flanks): the barrel frill (a fat,
shrub-sized frill tree with short dense fins and a crown of blooms), the fan tree (a forking
trunk with a head of big violet-grey fans on every tip), the Rift stone pine (a flat umbrella
of dark needles) and the silver scrub with purple bloom heads, over a garrigue floor of silver
and olive tufts, purple heath and thyme-like blooms. The cloud forest carries teal in its
light greens. The highland: giant groundsels (Afroalpine, in the cloud forest), Rift cycads, peak pines.
The floor by zone: the jungle's iridescent rosettes, zebra bromeliads (a chevron-skinned
rosette), prism ferns, tongue succulents, curls, honeycomb barrels, ball vines, scale-moss,
big red anemones and pompoms, urchin and anemone blooms, fallen frill trees; the shore's glasswort, algal
mats, stromatolite domes and scum on the water; the savannah's dry grass, Vain frond patches (canon purple), purple and orange heath,
purple fans, pinecone succulents, candles, termite spires; the cloud forest's ferns and moss; the peak's spikes and scrub.
Fauna deferred, as before.

## The highland is a sketch
The ridge is designed (the mesas, the benches, the fields) and its flora is placed, but
the cloud forest and the Mediterranean peak have a handful of species each and no
species of their own beyond the groundsel and the pine. It is meant to become its own
kit (the highlands) on the same fields.

## The runtime LOD and the far canopy (Oct 2026)
The core's runtime LOD (xanadu's; `BIO.range`, `BIO.lodTick`) on this kit. Build time still
decides the detail by distance from the spine (`lv`), and now the camera decides what is drawn:
- **Trees** (55, the build loop): a hero tree is built with `BIO.owner` at its foot and
  `BIO.range=RIFT.LOD.tree`, so it is drawn while the camera is within 1.2 km of its chunk; then
  its stand-in impostor (`buildFar(...,lite)`: 20-triangle blobs, a four-sided bole of two rings, fewer fins)
  with `BIO.minRange=RIFT.LOD.tree`, drawn only past that. A far tree is only ever its impostor
  (range 1e9: always in range, culled per chunk against the view). The impostors are charged to
  their own pass, `rift/far`.
- **Small species** get a 20-triangle blob shaped by habit (`buildFarSmall`, the lowlands'
  technique: a mound, a squat barrel, a pale spire, a head on a stem, a crown, a finned column for
  the frill saplings), both as their far form past the mid radius and as their heroes' stand-in.
  The far ones keep nothing clear and their colours come from the tree's seed, so the passes after
  them and every hero build exactly as before. The curls, pinecone succulents and silver scrub
  (under 4.5 m) have none: under a pixel at that range.
- **The floor** (60): the near (7 m) band within `floor`, the mid (14 m) band within `midFloor`,
  the far band within `farFloor`; and a far band over the spine too, planted last, drawn only
  past the near and mid bands' ranges (`minRange`), so the floor thins with distance instead of
  stopping at a chunk's edge. Logs and the dressing within 1.2 km.
- **The far canopy keeps the iridescence.** The 'far' bucket's material (`RIFT.farMat`) shifts a
  vertex toward a second colour with the view; the uv carries it (8 bits a channel packed into
  one float, decoded in the vertex shader so it interpolates) and the rule (the leaves' or the
  iridescent bark's). The frill tree's impostor column goes teal to violet as its hero's does
  (`RIFT.IRIDBARK`, shared with the bark materials), the irid species' blobs turn to their second
  colour away from the sun and at grazing angles, but only part way (`IRID_FAR`, 40%: a blob is a
  solid crown facing every way at once, and turned fully it reads as paint), and the frill and
  carrot frill carry a few fin triangles (13 and 8; 6 and 3 in a stand-in). The stand-ins are a
  little darker than the far trees (×.8): they replace heroes whose crowns are cards, gaps and shade.
- **Curls and rosettes** carry a per-instance normal (`aN`, `RIFT.leanN`: the plant's up axis
  leaning out toward the side a clump would light) that steers only their iridescence;
  `RIFT.iridOnlyN` keeps their lighting on the geometry's own normals.

## Lessons this build cost
- A helix as an instanced item is cheap (34 segments × 5 sides = 340 tris) and reads as a
  plant from any distance; a helix as a merged tube per plant would not have been.
- The iridescence hook's second colour must be passed per instance (BIO.put's `extra.c2`);
  an item defined with `aC2` and put without one silently copies the first colour, which
  is how a species goes flat without an error.
- A ribbed lathe needs at least three segments per rib (36 for 12 ribs) or the ribs alias
  into a five-pointed star.
- The bench stair on the ridge's face is a sinusoid subtracted from the ramp; the
  amplitude has to be 1/(2π·n) exactly for the treads to come out level.
- The mask must go to zero on cliffs, or the mesa faces sprout grass sideways.
- A ridge face that climbs 390 m in 370 m has 40 m treads between 68-degree risers: nothing
  roots and the painter shows rock. The cloud forest needed the climb spread over 640 m.
- The brain-coral dome never read (a blobby polyhedron at any tessellation) and was replaced
  by the trumpet tree, a lathe: silhouettes beat displaced spheres at this scale.
- The fields are read a million times per build; sampling them once on an 18 m lattice
  (the same cache the ground painter uses) took the build from a minute to under thirty seconds.
- Iridescent items with no normal of their own (curls, rosettes, tufts) show the second
  colour at every horizontal view angle: pull it part way back toward the base (softC2),
  and give the fins and fans a real per-instance normal instead.
- The runtime LOD's chunks are 1.2 km on a side, so it saves little within a kilometre of the
  camera (the jungle views still draw ~14M of the 24.7M the scene drew everywhere before): its
  savings are the far half of the map. A shorter range for the small species culled nothing more
  there and cost 60 draw calls.
- A packed second colour in the uv must be decoded in the vertex shader: the GPU interpolates
  varyings, and a packed float interpolated between two vertices is noise.
- The page builds inside its own script, so "load" fires only after the build; on a shared box
  that was over five minutes. verify.py waits for the document to commit, then for `_ready`
  (VERIFY_TIMEOUT seconds).
- verify.py takes PW_CHROMIUM: a cloud box pins one Chromium build for every Playwright
  version, and the one pip installs will not find it on its own.
- (inherited) Every bole lathe ends in a dome ring; bark colours are written a stop dark;
  a painted sky dome cannot stand in front of real geometry (the wall is painted twice).

## Next
Fauna against this contract; the highlands as their own kit (cloud forest species, the
Mediterranean scrub); the far shore's jungle as geometry rather than a painted line;
Yuni Valley, arctic; drop an Ancients kit megastructure into the jungle through `dress()`.
