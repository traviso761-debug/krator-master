# Xanadu — notes

## Round 1 (Sep 28 2026) — the kit

Brief from Travis: a new building kit, **Xanadu**, for the remote southern Sultanate — Tibetan forms and massing
with Indian bay windows, Turkish ornament and overhanging storeys, Persian mosaics and baths; more colourful;
gold on the wealthy, religious and civic; hilly terrain (buildings must read on an incline); space at a premium
(tenements and manors). Twenty-eight reference images in the upload (Tibetan/Bhutanese dzongs and temple fronts,
prayer-wheel rows, Hawa Mahal, Persian mosaic courts, a blue-and-gold hill city, Andean "cholet" colour).

Decisions:
* New repo `xanadu/` on the Ancients fragment contract, vendoring the Ancients core and the Iziz Vernacular
  helpers byte-identical from `../highlands/src` (which vendors them from `../ancients` and `../iziz`): one placer
  (`VERN.place`), one inspector, one label atlas and one set of blocks serve every kit, and a settlement target can
  reuse Iziz's city machinery.
* `XA.def` wraps `VERN.def` with `family` and the **slope footing**: any def placed with `o.drop` grows a battered
  rubble footing under its plot before it builds (`xnFooting`), so hillside siting is a placer option, not a
  per-building feature. The **Hillside quarter** def stands six kit houses astride four terrace edges through
  `xnSub(..., {drop})` as the proof.
* The batter is real geometry: four battered wedges (`xBat*96/92/86/80`) picked from a block's proportions, and a
  fifth wedge battered across its thickness only (`xWall*`) for curtain walls, so long segments meet at the top.
* Two colour-carrying mosaics, a frieze band and a sun-and-moon roundel are painted once (`70-xa-tex.js`); every
  other map is near-grey and tinted per instance, so one tile map serves turquoise, lapis and white domes.
* The showcase lays rows out from the registry (`xaLayout`) and generates its views (`xaAutoViews`); a target file
  is three lines.
* `verify.py` / `jscheck.py` accept `PW_CHROME` (an already-installed Chromium) because the sandbox's playwright
  and its browser build did not match.

### Round 1 result
Nine packages, **39 defs**, one target (`dist/xanadu.html`): housing 3 × 3 tiers, bazaar / workshop / scrap
smithy, terraced fields / farmstead / granary / asbad windmill / watermill, temple / monastery / Grand Temple,
Sultan's Palace / Pleasure Dome with baths and gardens, five guilds + generator, barracks / wall / gate / fortress
/ city watch / mustering ground, arena / amphitheatre / baths / public garden, the hillside quarter. Whole kit
≈ 0.62 M scene triangles, 109 draw calls, 31 k instances; every registered volume non-empty; heaviest the Grand
Temple at 78 k. Verify clean. Row cameras were standing inside the next row on short rows — the layout now widens
every gap by the previous row's camera distance.

Next: the settlement target (the capital on its hillsides with Iziz's terrain/painted-ground/occupancy
machinery), the Krator sky, reclaimed variants if wanted, and a second variant (`o.v`) pass on the housing.

## Round 2 (Sep 28 2026) — inverted roofs, closed courts, the variant pass

Travis: inverted polygons on the roofs of the sacred, guild, fortress, gate, mustering-ground, palace and manor
buildings; a variant phase; courtyard fences to run all the way round; a z conflict on the tenement.

* Every listed building carries a gilt roof, and `MAT.xGold` was FrontSide on the vernacular wedge geometry, whose
  winding faces inward — the roofs showed their backs. Gold is double-sided now (`71-xa-mat.js`).
* Courts close: the courtyard house's wall runs behind the house, the manor's court walls reach the house with
  short returns, the konak's garden wall runs back to the house.
* Tenement: the shop arcade sat inside the battered ground face and the storeys above started at the full plan,
  past the block's top; the arcade is on the face and the storeys start on the block's top (`W*.96`), windows and
  cumbas on the real storey faces.
* Variants: `xV(o)` gives every builder its variant index (0–2; the seed already moves every pick). Structural
  switches on it in the housing (storeys, cumba side, jharokha caps, pavilion vs dome, tiled hip vs gilt flat roof,
  lean-to side), the bazaar (four shops, a rooftop pavilion) and the temple (ochre sanctum, wider portico). A
  second target, `dist/xanadu-variants.html`, places every def at v1 and v2 side by side (`XA_VARIANTS` in its
  rows file); 156 volumes, 1.24 M tris, verify clean.

## Round 3 (Sep 28 2026) — five variants for the town, distinct civic variants

Travis: another variant run ×2 on the residential and other non-civic buildings; make the civic variants more
distinct.

* `xV(o)` is the raw variant index now and every def carries `nv` (5 for residential and non-civic defs, 3 for
  civic); the variants target (`XA_VARIANTS=true`) places each def at v = 1 … nv-1. Whole variants page: 224
  volumes, 1.6 M tris, 116 draw calls, verify clean.
* v3/v4 on the town: stone ground storey + shrine / mirrored stair + byre (earth block); all-low or all-tall
  tenement row; earth gable roof / stilts (shack); two storeys + jharokha / four storeys (town house); a side wing /
  a gate tower (courtyard house); four storeys / plain ground floor with doors (tenement); a loggia / a fourth
  storey with twin gilt roofs (manor); gilt roof instead of the dome tower / the plan mirrored (hillside manor);
  a cumba on three sides / a corner dome (konak); five shops / an arcaded loggia (bazaar); storeys and kiln size
  (workshop); tiled roof, flat roof, a second forge (smithy); flat valley fields, two tall terraces, low steps
  (fields); three storeys, a pole hay barn, stone walls, the house mirrored (farmstead); round, twin, tall,
  timber-topped (granary); low, tall, stone, twin rotors (asbad); earth, two storeys, stone, tiled gable
  (watermill); the hillside's houses rotate through their own variants.
* Civic v1/v2 are structural now: temple (gold dome crown / three storeys, drums on the flanks); monastery (one
  cell block + great shrine / dome crown + open arcade gate); Grand Temple (ochre with turquoise domes / four
  storeys, big gilt roofs, no dome); palace (white with twin domes / three gilt roofs and square gilt-roofed
  towers); Pleasure Dome (gold dome, tall turrets / mosaic dome over one great pool); every guild (storeys, wall
  kind, gold corners; taller headframe, more tubs; taller strong room or a gold dome; taller tower or tiled dome;
  finished gilded hall; twin chimneys or a flat roof); barracks (three storeys / a second wing); wall (a tower /
  an earth wall); gate (square gilt towers / taller towers under a dome); fortress (dome crown / taller tower and
  square towers); watch (taller tower on the other corner / a bell cote); mustering ground (tiled stand / a
  colonnaded stand and barrack sheds); arena (smaller single-tier / four mosaic gates); amphitheatre (five or nine
  tiers, gilt stage roof); baths (gold lesser domes / three tiled domes); garden (long pool / chhatri).

## Round 4 (Sep 29 2026) — the Palopó paint

Travis: variants of the shops, residences, bathhouse and neighbourhood temple painted like Santa Catarina Palopó
(four reference photos: turquoise and cobalt houses, orange/yellow trim, huipil motifs across the walls).

`88-xa-dress.js`: twelve twins `<key>_palopo` in the row "Palopó paint", running the same builder and seed under
a paint filter on `kput` — every wall item takes the building's base colour (turquoise / cobalt / royal / teal /
sky), painted trim goes orange or yellow (black surrounds stay black), valances take a second trim — and every big
wall instance is recorded so that, after the building, each face gets a lozenge-chain or zigzag band under its
top (and above its foot), and the tall faces a motif: pink quetzal, sky quetzal, green deer, hooked X star (four
alpha-cut colour maps, world-tiled bands). Battered blocks get the planes leaned with the wall. Base colour, trim
and motif order rotate with `o.v`. Verify clean: 95 volumes, 0.75 M tris.

### Round 4b — mural fitting
Travis: relocate murals that overlap windows so both stay clear. The paint filter now records every opening
(window panes, door and jali recesses) and the fitting pass projects them — and anything standing in front of a
face (a cumba, a jharokha, a portico) — into the face frame; each motif is placed at the clear spot nearest its
preferred position, shrinking through five sizes, or left off. `window._palopo` counts faces / wanted / placed.

## Round 5 (Sep 29 2026) — the Turkish note, the lane of lights

Travis: one temple variant straight from the Ortaköy mosque; a couple of house and shop variants more directly
Turkish (with Palopó twins); hanging basket and umbrella lights to go between buildings. Mid-round: no minarets —
large prayer wheels in the corners instead; the corner-bay struts pointed the wrong way; more colour on the temple.

`83-xa-turk.js` (seeds 32000–32199), six new defs as rows of their own rather than v-switches:
* **Temple after Ortaköy** (Sacred, civic): the square baroque hall with a great arch on every face holding a tall
  window between two lesser ones, ochre pilasters with gilt capitals, mosaic spandrels, a tile band, a second tier
  of arches, four corner turrets under gold bulbs, the drum and the dome (turquoise / gold / lapis by variant), the
  pavilion wing, the quay with water in front, pennants. Four great prayer wheels — maroon drums banded in gold on
  gold axles under tiled kiosks — at the hall's corners, a rail of small wheels along the front terrace.
* **Konak** (middle) and **Timber corner house** (rich): the Ottoman house — stone / brick ground storey with
  arched windows, timber bays with arched heads and tile-panel aprons (`xnXTBay`), tile bands between storeys,
  iron balconies with flower boxes (`xnXTBalcony`), the red-tiled hip on wide eaves with rafter ends
  (`xnXTRoof`), and on the corner house an octagonal bay on struts over the street corner.
* **Turkish shop row** and **Corner café** (Trade): arched stone shopfronts with awnings and café tables,
  timber bays above, the corner café's octagonal bay, umbrella tables and a basket line to a pole.
* **Lane of lights** (Street, nv 3): the shop row, the konak and the café facing across a paved lane with
  `xnBasketLights(a,b,n)` (wicker baskets on a sagging wire, a bulb in each) and `xnUmbrellaLights(a,b,n)`
  (open umbrellas hung canopy-up) strung between them; both helpers take local endpoints and are meant for
  the settlement placer to string between any two buildings. The def carries `eye:[dx,dz,tdx,tdz]` so its
  eye-level view stands in the lane looking down it (`xaAutoViews` honours `D.eye`).
* The four Turkish houses and shops have Palopó twins; the paint filter now also takes big timber and stone boxes
  (≥ 6 × 2.6 × 6) as walls so the board and brick storeys paint.

Kit: 110 volumes, 0.89 M tris, 121 draw calls; variants page 332 volumes, 2.5 M tris. Verify clean on both.

## Round 6 (Sep 29 2026) — the Grand Baths

Travis: a colonnaded, mostly open Grand Baths with stained-glass windows and gardens, after five pictures (the
Nasir al-Mulk mosque's mosaic iwan and stained-glass hall, a bold tiled pavilion with a copper sun and a long
tiled pool, a tall mosaic-banded colonnade over an emerald pool, the Fin garden's iwan over a rill down a cypress
avenue).

`84-xa-grandbath.js` (seeds 32200–32299), one def `xa_grand_bath` in the Public row: a mosaic iwan with twin
turrets on a paved forecourt with a rill and pool; behind it the great hall — a ring of sixteen tall pale piers
with a mosaic strip up each face and gilt neckings, a stained-glass screen in a pointed arch between every pair
above an open walk (the front bays open), a ring roof with a mosaic soffit and gilt cornice round a centre open to
the sky over a lobed emerald lake on a turquoise glazed-tile floor; at the back a long pool in red-purple-orange
tile running out to a tiled cube pavilion with a green-tiled roof and a copper sun on the ridge, between cypress
avenues and parterres. New maps: `xGlass` (stained glass, unlit so it glows), `xBTile` (the lobed bath tile);
`xEmerald*` water. v1: tiled domes over alternate piers and arabesque strips; v2: taller piers, a rounder lake
with a fountain. The def carries `eye` so its view stands inside the hall. Kit 113 volumes, 0.91 M tris.

### Round 6b — the hollow iwan, the bath tile, the water modules
Travis: make the iwan an actual hollow portal rather than a blind archway; the pavilion's tile to match the
picture; the baths' channels as modules that tile and cap off with pools or fountains.
* `xnIwanOpen` (72-xa-helpers): the pointed-arch frame geometry extruded to the full depth makes the tunnel, its
  cheeks and vault clad in mosaic panels (a fan of six panels a side following the arch curve), a mosaic face, a
  wash pishtaq round it, a turquoise-tiled floor through, mosaic niches in the cheeks, lamps; `through` leaves the
  back open into the court, else a back wall with a door. The Grand Baths' portal is one, and its eye-level view
  now stands on the forecourt looking through it into the hall; `D.eyes` adds further named stances (garden,
  pavilion, hall) to the auto views.
* The bath tile is the picture's: on each tile a half circle off the left edge and one off the right, so across
  the joints the circles close, red and purple in a checker, and the orange left between reads as pointed lenses;
  world-tiled at ~0.45 m. The pavilion's sun is a copper disc with sixteen rays on a stem.
* `85-xa-water.js` (seeds 32300–32399): `xnRill(x,y,z,ry,L,{w,c,curb,cap})` and `xnRillCross`; five module defs
  in a Water row on a common 8 m plot with the rill on the plot's centre line running out to the edge, so pieces
  placed on the 8 m grid join flush — straight, bend, cross, pool cap, fountain cap (`snap:8`; v1 tiled curbs,
  v2 a wider rill) — and the **Rill garden** as the proof, nine modules tiled through `xnSub`. The Grand Baths'
  own channels are rill modules now.
* **A shader-program bug, fixed:** three.js keys a material's compiled program on `onBeforeCompile.toString()`.
  The closures `vWorldUV` (vendored) and the old `xWorldUV` built print the same source whatever their K, so every
  world-UV material in the kit was drawn with the first compiled program's scale — stone at the wash's K, the
  bath tile at the frieze's (which is why its circles came out as ellipses and no K change moved them). `xUVKey`
  in 71-xa-mat.js now builds each hook with `Function()` so its K is in the source, and re-hooks every vernacular
  material after load. Stone, rubble and rock read at their intended (coarser) scales from this round on. The same
  bug is live in highlands and iziz. (2026-10-01: fixed upstream. `vWorldUV` is now one shared copy in
  `core/materials/opt/69a-world-uv.js` with a per-K program, taking an optional Kv; `xUVKey` and `xWorldUV` are gone.)

### Round 6c — slope modules, a waterfall, the buried pools
Travis: slanted versions of the water modules, with a waterfall, for uneven ground; the pool in the bend and
cross was not rendering.
* The pools were buried, not z-fighting: the basins were drawn as a solid curb slab with the water box inside it,
  and the slab's top stood above the water. `xnRillBasin` draws a tiled bed, the water, and a curb *ring*; the
  pool cap, the bend and the cross use it.
* Four slope pieces on the same 8 m plot, each with `rise` on its def (the rill enters at the +z edge `rise`
  metres above where it leaves at −z): **step** (1.5 m: a terrace with three cascade basins down its face),
  **ramp** (1.5 m: the whole plot tilted, the rill sliding down it), **cascade** (3 m: a chadar stair of six
  treads, water over every one), **waterfall** (4 m: the rill over a rock ledge, a lip, a sheet hanging clear of
  the batter into a plunge basin, spray, boulders). Row "Water — slopes", nv 3 (tiled curbs, wider rill).
* **Rill hill** as the proof: fountain and rill on the height, the waterfall, a cross with a pool and a bend to a
  ramp, the cascade, the step, a pool at the foot; the ground is stepped earth terraces whose tops sit just under
  the modules' paving (a placer on real terrain would give each module a `drop` footing instead). The water comes
  down toward the viewer; a second stance stands at the plunge pool.
* A bend's arms are +z and +x; ry π turns them to −z,−x and ry π/2 to +x,−z (the garden's bends were wrong).
  `xnPave` takes a y. Extra stances may carry a camera height (`eyes:[[name,dx,dz,tdx,tdz,dy]]`).

## Round 7 (Sep 29 2026) — the Grand Vizier's palace, the slope masses

Travis: the ramp's and cascade's stone was rendering weird and hiding the water; a smaller Grand Vizier's palace
after three pictures (the Eram garden pavilion, the Majorelle house, a Qajar brick pavilion with two-storey
arcaded loggias).

* The ramp's fill was two level boxes the tilted slab cut through, and the cascade's batter mass sat on the wrong
  side of its steps, with the top paving floating over nothing; the terrace pieces' paving overhung their batter.
  The ramp is one tilted rubble slab now, the cascade's treads are solid to the ground with a block under the top,
  and the step and waterfall stand on straight-sided blocks. The slope pieces' eye-level views stand at the low
  end looking up the water (a def's `eye` takes a camera height as a fifth element). Def names lost their commas
  (verify.py splits view lists on them).
* `86-xa-vizier.js` (seeds 32400–32499), `xa_vizier` in "The Sultan" row: a two-storey house of two arcaded
  loggia wings (open pointed arcades on slender columns, a rail on the upper floor, doors and mosaic panels on
  the wall behind) either side of a taller centre with a hollow two-storey iwan, octagonal bays with little tiled
  roofs on the outer corners, wide timber eaves on painted brackets, a dome or gilt roof on the centre. In front:
  a long turquoise pool between marigold beds, cypress and palm avenues, a fountain basin at its head, hedged
  walks, a garden wall with an open gate between bulb-topped piers. Three dresses by variant: Majorelle cobalt with
  turquoise arches and lemon shutters; Qajar brick with cream arches and mosaic; Eram cream with tile spandrels.
  New helpers: `xnXMPalm`, `xnXMBed`, `xnXMLoggia`; `xnIwanOpen` takes `faceC`.
* Travis: the arches should be open galleries or have real windows. The loggias are galleries now: a thin back
  wall behind a stone gallery floor and end walls, real arched windows (lit) in every bay with a door in the
  middle one, the rail on the upper floor, tile strips beside the windows on the mosaic dresses.

## Round 8 (Sep 29 2026) — the Spicers' Guild and its market

Travis: a luxurious Spicers' Guild after two pictures (a carved timber house with a grand arched porch, balustraded
stairs and octagonal corner bays under tiered spires; the Hawa Mahal's saffron tiers of cream jharokhas under
cupolas), with a spice market attached.

`87-xa-spicer.js` (seeds 32500–32599), `xa_guild_spicer` in the Guilds row: a saffron house of five stepped-in
tiers (four on v2), a cream-trimmed jharokha under its own white cupola in every bay of every face, a gilt roof
(v1 a gold dome) with chhatris on the top; a carved timber porch of two storeys on gilt-capped columns under a deep
tiled gable with frieze barge boards and a carved tympanum, lantern-lit, a balustraded timber flight with saffron
bulb finials on the newels; two-tier octagonal timber bays on the front corners with carved bands under three-
tier tiled spires. Along the right flank the spice market: a saffron store with a drying rack and sacks on its
roof, a long shed on timber posts with a frieze and chilli strings between the posts, six stalls beneath (a table
of spice cones on trays, a shelf of jars, a striped awning, sacks and a basket, a trader), barrels, crates and
spice heaps in the yard. Views: eye level, porch, market. Kit 148 volumes, 1.11 M tris; the variants page is at
2.96 M of its 3 M budget and will need splitting (or a lower default `nv`) before the next row.

## Round 9 (Sep 29 2026) — Erewhon, Pearl of Xanadu

Travis: three Andean residences (the cholets of El Alto and the blue shop-houses of Palopó), then the city: an
enclosed mountain lake, the town up the mountain's side from Travis's MS-paint map (water / flat / steep / ridge /
unbuildable / cliff as slope classes; purple highway, pink avenues, red walls, blue stream), 20 000 souls, walls and
three distinct gates, the palace precinct on a plateau above the light-grey cliff, the garden district under it on a
rill grid with two public baths, the Grand Baths and a teahouse, wealth climbing with height, poor and industry by the
water, the prison in a cliff, terrace farms outside the walls, mines east, the Pleasure Dome of the Bay on the island
with its barge, a lighthouse with a turning beacon, Palopó paint round the markets, hanging lights on the avenues,
the Vale of Xanadu biome's plants in every garden; 25 M triangles; LOD if needed. Poem for vibes.

**The kit** (backported first, all in rows on the kit page):
* `87b-xa-andean.js` — Palopó shop-house (poor), Cholet (middle), Cholet palace (rich): stepped three-colour frames
  round glazed bays (`xnXOFrame`), lozenge zigzags, chakanas, chrome-and-colour rails, the chalet on the roof.
* `85b-xa-garden.js` — fourteen garden tiles from the garden agent's brief over all twenty-one photographs (not only
  Majorelle: Fin, Shazdeh, Dowlatabad, Le Jardin Secret, Jnan Sbil, the Barcelona gardens, a Sicilian shrine pool):
  T-junction, jet allée, weir terrace (1 m), star basin court, tiled plunge pool, lily pond, cactus court, pergola
  walk, brick court, kiosk, painted-vault pavilion, bath pool, gate waterfall (4 m), parterre; five tile maps
  (checker, Fin, leaf tile, chevron, herringbone brick).
* `87c-xa-erewhon.js` — the Sultan's pleasure barge, quay, boat shed, warehouse, the lighthouse (an octagonal stone
  tower; its beacon is a real mesh turned by a frame hook, the only moving part in the kit), the teahouse on a
  double rill plot, the prison in the cliff, the mouth of the Caves of Ice, the palace gate, and the **Pleasure Dome
  of the Bay** — the biome host's ruined test dome on the island made whole and clad in the Xanadu manner (twenty
  gilt-capped columns, a mosaic-windowed drum, a turquoise dome, the caves of ice glazed inside) with its dock and
  the barge. The kit's dome is renamed the Garden Pleasure Dome.
* **The Vale of Xanadu biome**, vendored from the published artifact (its source recovered into
  `../../biomes/xanadu/`): `86-bio-*` in the kit, one additive export (`XANADU.treeAt`, a single hero of a named species
  at a point), and `86b-xa-plants.js`, the `xaPlant` shim through which `xnTree`, `xnCypress`, the palms, the pots
  and the cacti plant the biome's species (flame cypress, cloud pine, ginkgo, whorl olive, Persian ironwood, haze
  blossom, strawberry tree, cacao, bottle and fan palms, prickly pear, pitaya, desert rose, barrel frill, silver
  scrub). The kit page bakes the biome after the kit (`BIO.bake`).
* The variants page's budget is 6 M now (it carries every def three to five times).

**The city** (`targets/erewhon/`, `dist/erewhon.html`):
* `tools/erewhon-map.py` classifies the map, fills the label text from its surroundings, solves the heights as an
  eikonal climb from the water at each class's slope (flat 7°, steep 26°, ridge 9°, unbuildable 48°, cliff 68°),
  lifts the **palace plateau** by hand (a polygon raised 90 m, falling off over 150 px through ground reachable
  without crossing a cliff pixel, so the light-grey line carries the whole drop and the slums stay low), compresses
  the mountain above the town, smooths, weathers by class, cuts the stream, thins the coloured lines to polylines and
  writes `83-er-data.js` (heights at 8 m, classes at 4 m, both base64).
* `84-er-geo` decodes it (`terrainH` bilinear + levelled pads), `85-er-paint` paints albedo / mask / class canvases
  from the classes, `86-bio-46-er-init` binds the biome (fields from class, height, the stream), `87-er-layout` reads
  the districts off the map's labels, paints the highway and avenues, finds the gates where the highway crosses the
  wall lines (west / east) and the palace gate at the loop's crown, lays **contour streets** (marching squares over
  the height field every 3 m of height inside the town polygon, less the garden rectangle, thinned so the streets
  stay ~26 m apart on the ground whatever the slope — Travis: a fixed height interval packed them too close on the
  steep central slopes for a plot between them) with **stairs** down the
  fall line every 75 m, and a ring road round the garden; every street inside the town **benches** the ground a
  lot's depth (10 m + 4 m blend) either side of itself to its own grade (Travis: the plots between contour streets
  were hillside, and stood empty), so the town is terraces stepping down the mountain; `88-er-place` is the occupancy and the PLAN (every building
  described first, built later chunk by chunk); `90a-er-world` the terrain mesh, the lake, the stream ribbon, the
  Krator sky, the walls (battered curtain segments stepping with the ground, drum towers every four); `90b-er-build`
  the landmarks on levelled pads, the **garden district** as a 26 × 14 tile grid on a 1.5 m-quantised stepped
  surface (no neighbour more than a cascade apart; three rill axes, three cross rills, courts and parterres between,
  two public baths and the teahouse on reserved blocks, the Grand Baths at the head, a wall with openings at the
  axes), the frontage walker (buildings face every street, zoned by district wealth and kind, wealth climbing with
  height, Palopó twins round the markets, a narrow fallback def when the plot fails), the farms and mines outside,
  the hanging lights (basket and umbrella strings wherever two fronts face across a lit avenue), then the terrain,
  the biome, and **one bake per 480 m chunk** — the runtime LOD: a chunk is drawn while it is in the view and within
  1.7 km (landmarks always), the biome's own chunk LOD ticks beside it.

Erewhon as published: 1 927 plots planned, 1 086 street buildings, 336 garden tiles, 97 farms, 59 light strings,
589 k kit instances + 87 k biome instances, 13.1 M scene triangles of the 25 M budget at the overview, 1 046 draw
calls; a chunk-culled walk keeps most views under 8 M. Verify clean.

### Round 9b — Travis's seven
1. Street buildings keep inside Travis's bounds polygon (`CITY_POLY`, world metres from the Polygon tool); only
   landmarks, farms and mines stand outside it.
2. Slope-parallel streets thinned to ~34 m, runs cut only within .6 of that so the network stays whole; alleys and
   stairs down the fall line every ~40 m, blocked in the mask so they run open between the houses; an **infill pass**
   after the frontage walker seeds the ground the walker missed with a house facing its nearest street (the plot is
   set back along the road's outward normal, so the door addresses the street). A **Doors** overlay draws an arrow
   out of every door for judging orientation from overhead.
3. The garden district has one explicit stepped ground (`GARDEN_G`: cell levels quantised to 1.5 m, no neighbour
   more than a cascade apart, a slope cell standing at its LOW level) out to the ring road, retaining walls on
   every stepped edge, and the water pieces stand with their origin at the low level and their high end uphill
   (they had been placed a rise too high and facing downhill, and every tile flattened its own overlapping disc:
   the floating tiles and the canyon under the ring road).
4. The stream's head runs into the mouth of the Caves of Ice at the cave's floor and drops into its channel after.
5. A third of residences and shops carry the Palopó paint (six in ten round the markets): the twin is drawn after
   the def, not weighted in the pools.
6. The quays and the boat shed open to the lake.
7. The lake sits at −0.5 m with a polygon offset, off the shore's flat zone at 0.

## The variants page folded into the kit page (Sep 30 2026)

`dist/xanadu.html` now shows every def at every variant side by side, v0 first (`XA_VARIANTS` in the xanadu
target; `xaVs` returns 0 … nv-1). The separate `variants` target and `dist/xanadu-variants.html` are gone.
