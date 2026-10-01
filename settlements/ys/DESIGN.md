# Ys — design brief (the half-drowned capital of the Hykkousoi)

*Planning document, Oct 2026. No code yet. `PLAN.md` says how this gets built and in what order;
this file says what it is. Read both before touching `src/`.*

Ys is one city that has partway sunk into the Ring Sea. The Ancients laid it out on a grid at the head
of the north-west bay; the sea came up (or the land went down) and the south-east half of the grid now
stands in tidewater, its towers rising out of the bay. The Hykkousoi found it with "tides in the streets,
waves crashing against the skyscrapers" and saw potential: they grew their city onto the ruins. The
landward half is a working city of their own buildings, post-apoc dwellings and reclaimed Ancient
structures; the drowned half is the capital proper, reached by bridge and by boat, with the Amphitriton
at its heart on an island of its own.

**The build lives or dies on one thing: the Hykkousoi architecture must read as grown, not built.**
Shells, barnacles, coral, bone-ribs, nacre. Every other decision in this document is downstream of that.

## 1. Lore (canon, from Travis)

> The Hykkousoi's enemies disparage them as fish-men, but in truth, they are more man than fish. This slur
> comes from their most well-known quality as a people however: the rib-gills most trueborn Hykkousoi have on
> their back and chest. A bare-chested Hykkousoi sailor has no fear of drowning, and indeed their most sacred
> sites are said to lie on the bottom of the Ring Sea. They are still men, not fish, though, and prefer the
> land - they prefer fire-cooked food and unrusted metal the same as others. But their half-drowned capital of
> Ys is notoriously hard for outlanders to navigate, with its half-drowned streets, and the Amphitriton, the
> great assembly hall and refuge of their people, is surrounded by water on all sides and virtually unassailable.
>
> The Hykkousoi are also notable in their close friendship to molluscs; Hykkousoi pearldivers and
> mother-of-pearl workers are the finest in the world, and even their buildings seem more grown than built.
> Ys, that half-drowned city, resembles nothing so much as a collection of reefs and barnacles growing around
> the still-standing towers of an Ancient city whose name is long-lost.
>
> The Hykkousoi are also the finest sailors in the world. Children may ask, why does a man who breathes water
> need a ship? You may as well ask why a man who has legs needs a horse. Swimming across the Ring Sea would be
> a fool's errand, particularly given the monsters that lurk in the depths. But the sailors - and pirates - of
> this nation are well known throughout all the Ring Isles.
>
> The Hykkousoi tend to get painful, and ultimately fatal gill-wither if they tarry too long in dry
> environments; hence they hug the northwest coast. Inland, in the rain shadow of the Inner Wall, their long
> time enemies, the nomadic Scyvoi dwell. The Vothic conquests to the south have put them both next in line in
> their march up the coast. For this, they have sought and obtained an alliance with Iziz. There is tension,
> however, as the Hykkousoi must always make clear they intend alliance, not fealty, much as the Empire would
> like it otherwise, particularly as it would re-unite them with the landlocked loyalist city of Dilihan. But
> the Hykkousoi are proud and intend to stay independent.
>
> The Hykkousoi indeed have a reputation for headstrong, even fractious. The major settlements - Ys, Tethys,
> Trigon - have their own proud histories and maintain separate armies, navies and outposts, and jockey for
> position amongst themselves. Disputes are settled at the Amphitriton, where their leader the Archon presides.
> The Archon, who is elected by a complicated tradition involving both elections and the casting of lots, is
> often an inoffensive compromise candidate, but the newly elected Archon, Jathrocles, is young, vigorous, and
> has his people ready to resist any Vothic invasion.

What the lore fixes for the build: water is a street, not a barrier (every drowned building has a
water-level door); fire-cooked food and unrusted metal mean smithies, kitchens and lamps on land; nacre is
the national art (the Pearlmonger's Guild is the most ornate building after the civic four); the
Amphitriton is a refuge (one drawbridge, no other land link, military harbour beside it); Iziz is the
ally (an Iziz ship at the foreign quay, the Iziz buildings nearest the market); Voth is the threat
(ballistas face the sea to the south; the Voth compound is tolerated, not favoured).

## 2. The map

Units metres, a person 1.75 m. **x east, z south, north is −z**, y up. Sea level **y = 0**.
Map 3200 × 3200 (±1600); the city core about 1.3 km across, the drowned grid reaching ~700 m offshore.
Numbers below are the first-pass targets; the massing pass measures and corrects them (`PLAN.md` P1/P3).

Compass as briefed: the coast runs from the **south-middle edge to the north-east corner**, so the sea
is the south-east triangle and the land the north-west. The coast is a bay, not a ruled line: concave,
Krabi-like, karst stacks standing in it and on the shore. The **volcano** is far to the SE across the water
(a far-country mesh, as the SW bay biome does it); the **Inner Wall** is a high ridge on the N and W horizon.

| feature | where | note |
|---|---|---|
| Main market | the shore, where the three highways meet | the city's hinge: docks on its sea side, foreign quarter on its north side |
| Highways | NE (along the coast), NW (inland, toward the Inner Wall / Scyvoi), S (along the southern shore) | all three run through the main market and connect to the street network (project rule) |
| The old grid | **one continuous square lattice** (pitch ~180–220 m, streets 12–16 m, rotated ~12°): it starts on the land quarter and runs straight on under the water to about 700 m beyond the shoreline; the shore crosses it diagonally, so the same street is dry, then awash, then a canal, then open water between towers | the land quarter's streets follow it loosely (the Hykkousoi bend it); the drowned quarter's hosts stand exactly on it. One block holds one Ancient host (tower or mid-rise) at full storey height; the Hykkousoi fill the rest |
| The sink | the old city plane tilts ~1.5° to the SE plus a step | shore streets awash (±1 m), 200 m out canals 4–6 m deep, 500 m out open water 12–18 m deep between towers |
| Amphitriton island | centre of the drowned quarter, ~450 m offshore | its own island/plinth; drawbridge to the land, rib bridges to the neighbours |
| Military harbour | between the Amphitriton and the shore, west side | ship sheds, hexareme berth, boom chain |
| Civilian harbour | shore, SW of the main market | pearl baghlah, corbita; the Navigator's and Pearlmonger's guilds on the quay |
| Fishing docks | the far end of the civilian harbour | fishmongers behind them |
| Grown raised plaza | drowned quarter, a lily-pad plaza grown off the Amphitriton's neighbours | the second market |
| Temple of the Tides (B) | drowned quarter, on the shore side of the Amphitriton | water enters the hall |
| Temple of the Winds (D) | drowned quarter, the seaward edge, on a karst stack or tower stump | tallest spires after the Amphitriton; wider and airier than the reference |
| Archon's Citadel (E) | a karst stack at the drowned quarter's southern flank | terraced, arena-like, bridges to the Amphitriton; the **Treasury** stands inside its precinct |
| The Pharos | the seaward edge of the drowned grid, the last block before open water | a full-height Ancient tower kept standing, its top grown into a nacre lantern room with a **beacon** (a turning beam at night); the first thing a ship sees |
| Library of Ys | drowned quarter, beside the Temple of the Tides at the grown plaza | a conch of scroll-cells at L1, charts and tide-tables; Hykkousoi, not the Order's |
| The Wet Cells (prison) | a cut-down tower on the far side of the military harbour, no bridge | boat-only; the flooded lower floors are the cells, the dry floors the warders' |
| Foreign quarter | north of the main market | Iziz nearest the market, then Republic, Voth furthest; the Historians' chapterhouse on its own square |
| Industry | between the market and the river mouth, and along the NE highway | warehouses, smithies, shipwright, granary, windmill, generator |
| Neighbourhoods | land: three (NW, N, S); drowned: rings of blocks round the Amphitriton | each with a shrine and the two small markets split between them |
| Barracks, ballistas, mustering ground | on the southern headland, facing the sea | ballistas also on three drowned tower tops and the sea wall |
| Farms and farmhouses | outlying, up the river valley on the travertine terraces and along the NW highway | |
| Aquaculture pens | the shoreline NE of the city, away from the harbours | |
| River | enters from the NW, descends in travertine terraces (Semuc Champey), reaches the bay west of the civilian harbour | the city's fresh water; the windmill and generator stand on it |

**Wealth gradient** (brief): poorer further from the Amphitriton, in both halves. Drowned quarter: 75 %
partly-ruined Ancient structures with grown-on additions, 25 % home-grown. Land: the reverse.

## 3. Datums and the multi-level walk grid

Mav's Refuge's lesson: in a stacked setting the 2-D mask stops being the truth; a layout fragment owns
positions and a walk GRAPH with heights replaces the walkable mask. Ys has five datums:

| datum | y | what walks there |
|---|---|---|
| water | 0 | boats on lanes; swimmers (life layer, later) |
| wet landing | +1.0 | the water-level door of every drowned building: a lily-pad landing on a stalk, steps into the water |
| quay / ground | +2.5 … +4 on the shore, rising inland | the land city; quays are the port kit's deck |
| bridge L1 | +12 | the promenade datum of the drowned quarter: rib bridges between blocks, every drowned building's bridge-level door, the grown plaza |
| bridge L2 | +28 | the high spans between the big towers (tower-bridges.jpg); landings on tower faces |

**The land–sea model, taken from Voth now so the life layer finds it waiting** (Voth `10-core.js`,
`15-shore.js`, `78b-life-nav.js`):
- `landDist(x,z)`: signed distance to the waterline, > 0 inland, < 0 under water; `waterDepth(x,z)`.
  Voth's warning applies doubly here: it cannot see a deck over water. Every quay, pier, landing, plaza
  and span REGISTERs its footprint as it is built (`NAV_EXTRA`, Voth's `LIFE_EXTRA_PIERS`), and the
  "anything to stand on" test asks those too.
- The shore addressed by arc length (`SHORE`, `shoreAt(s)`, `shoreNorm`, `shoreIn`, `shoreS`, `shoreRY`),
  but as a LIST of loops: the mainland coast plus every karst stack and the Amphitriton island, since the
  harbours, the aquaculture pens and the shore huts square themselves to whichever loop is nearest.
- A surface class per point, `surfAt(x,z)` → `land | shallows (awash, wadeable, depth < 1.2) | canal |
  open | quay | deck(level) | lane | cliff`, computed once into a coarse cached lattice (Voth's 26 m
  cells; 12 m here, the canals are narrower than Voth's bay).
- Two nav grids classified ONCE from the real obstacle queries, then A* with line-of-sight smoothing
  (Voth's `lifeNavBuildGrid / lifeNavAStar / lifeNavSimplify`): **FOOT**, one layer per datum (ground,
  quay, L1, L2) linked by stair and ladder cells, and **BOAT**, water cells with depth ≥ the vessel's
  draught and span clearance ≥ its air draught (both read from the Ring Sea vessel defs). A third mode,
  **SWIM**, is the BOAT grid at zero draught: the Hykkousoi walk into the water.

`NAV`: nodes `{x,y,z,level,tag}`, edges tagged `ground quay stair bridge ladder lane(boat) swim`, a height
function per arched span. Invariants: every land door reaches the main market on foot; every wet door
reaches the civilian harbour by boat lane; the Amphitriton's only foot link to land is the drawbridge;
no boat lane crosses a cell the FOOT grid calls deck at the water datum.

## 4. The Hykkousoi vocabulary (the part that matters)

What the references say, in order of weight (sheets in `refs/`):
1. **Grown, not assembled.** Pods, domes and spires are continuous surfaces with growth rings, never boxes
   with roofs. Nothing is square; nothing meets the ground or its host without a fillet.
2. **Shell forms.** Conch and nautilus (log-spiral bodies, a lip that opens into the door, a stair in the lip);
   barnacle clusters (fluted truncated cones, oblique rimmed apertures, colonies of graded sizes that overlap);
   urchin spines (tall fluted twisted spires); scallop fans (the Temple of the Winds' vaults).
3. **Porous skins.** Round and oval openings of graded sizes with raised lips and dark reveals (the sponge /
   coral references). Windows are holes in a shell with a lip, never panes on a wall.
4. **Bone-ribs.** Parabolic and catenary ribs with knuckles, thick at the springing, the shell stretched
   between them (Gaudí, the civic references). Bridges are ribs with a deck grown over them.
5. **Nacre.** Mother-of-pearl inlay on the rich and civic: an iridescent, view-dependent sheen on door
   surrounds, lips, dome crowns, the whole Pearlmonger's Guild. Poor buildings are chalky and grey-barnacled.
6. **Lens domes.** Clay/shell domes set with round glass lenses (the hammam-roof reference): the poor and
   middle roof, lit from inside at night where the lighting rule allows.
7. **Accretion.** Grown-on buildings root into their host with a flared skirt, drips below, a crust band on
   the host, a ladder or spiral stair down the host's face, a landing at a datum. They cluster at the host's
   corners and ledges the way barnacles take the sheltered side of a rock.

Palette: white, cream and ivory shell in the sun; sea-teal in the glass, the pools and the nacre's
shadow; coral pink and sea-green at rich; grey at poor. Weed-green and tide-crust black at the waterline
on everything. The Ancients keep their white metal, rust and concrete; the foreign quarter keeps its
cultures' colours through the socket packs.

Lighting rule (canon): rich and civic are lit. Lamps are glow-pearls in nacre sconces (warm) and
bioluminescent jars (cool blue-green) at shrines and wet landings. Every light is registered (§7).

**The gate.** Before any building agent starts, a mockup sheet of one poor barnacle cluster, one middle
pod house, one rich conch, one grown-on cluster on a decay-1 Ancient tower face with a rib bridge and a wet
landing, shot at eye level and from the water, goes to Travis. "Organic enough" is his call with the
picture in front of him, and nothing else in the kit starts until it passes.

## 5. The drowned treatment of the Ancients

The Ancients kit's structure types are the substrate of the drowned quarter and a quarter of the land one.
- Decay **1** (ruined, standing, holes) for the drowned quarter; **3** (reclaimed, with the shared
  `repairPass` salvage dressing) for the land quarter's reclaimed Ancients: that dressing IS the
  "post-apoc style dwellings" of the brief, so it costs nothing new.
- **Storeys stay human.** These hosts take interiors later, so an Ancient host is never uniform-scaled
  below 0.85 (the Iziz city's `KITCAT smin/smax` shrink to 0.3 is exactly what not to do: its storeys end
  up 1.2 m). Height variety comes from the kit's own cut: `bodyGroup` already builds a body cut at `cutY`
  (today only at the toppled decay); Ys adapts its vendored copy so decay 1 takes a per-site cut, snapped
  to the builder's storey pitch, with the ragged strut ring at the cut and no fallen body, or with the
  fallen upper body laid in the water beside it as a reef. So the drowned quarter is 80–200 m stumps with
  full-size floors, three to five towers at full height (the Pharos among them), and the mid-rise types
  (apartments, offices, hotel, hospital, library, government, flatiron; 40–140 m across at scale 1)
  filling the blocks. The grid pitch follows from this (§2).
- Every drowned host gets the **tideline dressing**: a black crust band at y 0 ± 1.2, weed ribbons under
  it, barnacle rings, foam at the waterline, the lowest floors flooded (floor slabs under water, visible
  through it). Materials under the water plane take the port kit's underwater fade.
- Then **accretion** (§4.7): a scheduler chooses pods per host by wealth ring and host size, at datums
  L1 and L2 and at the wet landing, and the biome's `dress()` grows curtains and moss off the ledges.

## 6. Building list

Counts are the brief's. `I` independent (free-standing, home-grown), `G` grown-on (accreted on a host).
Tags per the project rule (`culture:'hykkousoi'`, `type`, `wealth`, `lit`; a plant is never part of a building).

| family | builders |
|---|---|
| Housing | poor ×3 I + 2 G; middle ×3 I + 2 G; rich ×3 I + 2 G (15) |
| Stores | armour, weapon, alchemy, food, general, **chandler & netmaker, pearl & shell-inlay, salt & spice, cloth & dye (murex purple), potter & glass**: each I + G (20). Fishmongers at the fishing docks (1) |
| Industry | warehouse large, small; scrap smithy large, small; shipwright (slipway + shed); granary; windmill; generator (8) |
| Harbour | quay, pier, wet landing, boat shed, boom chain, military ship shed, hexareme berth (7); Navigator's Guild; Pearlmonger's Guild (nacre-inlaid conch, near the docks) (2); aquaculture pens (1) |
| Markets | main (docks), grown raised plaza (drowned), neighbourhood ×2 (4) |
| Religious | shrine to the tides, shrine to the sea-gods: each I + G (4) |
| Military | barracks, ballista emplacement, mustering ground (3) |
| Hospitality | tavern ×3 (2 of them G), inn, caravanserai (near the main market) (5) |
| Civic landmarks | Amphitriton (A), Temple of the Tides (B), Temple of the Winds (D, wider and airier), Archon's Citadel (E) (4) |
| Civic, minor | Library of Ys, Treasury, the Wet Cells (prison): all three in the Hykkousoi vocabulary (3) |
| Infrastructure | the Pharos crown: the beacon lantern room grown onto a full-height host, with its turning beam (1) |
| Agriculture | farm field, farmhouse ×2 (3) |
| Spans | rib bridge L1, rib bridge L2, drawbridge, spiral stair on a host, ladder, lily-pad landing, grown walkway (7) |

About 90 Hykkousoi builders: Yuni-kit scale. The five "other" stores are a proposal; swap freely.

**Foreign quarter** (existing sets, vendored; "flag extra buildings to swap in later" = slots tagged
`foreign:iziz|republic|voth` with a swap list): Iziz Vernacular (`vern_*`), the Republic
(`hl_rep_*` townhouses, log houses, tavern, shop row), Voth (the ported Voth Embassy compound and its
three townhouse kinds), the Historians' chapterhouse (the Yuni `civic_chapter_house` as ported in
`76-port-chapterhouse.js`).

**Ships** (Ring Sea kit): trireme and siege hexareme at the military harbour, pearl baghlah and amphora
corbita at the civilian, an Iziz dhoni at the foreign quay. Three Hykkousoi and one Iziz, as briefed.

## 7. Marks for the interior build-out and the Godot conversion

Every opening and every light source is data, not just geometry. The helpers that draw them also record them:
`hykDoor(…,{level:'ground'|'quay'|'wet'|'L1'|'L2', kind})`, `hykWin(…,{shape, lit})`,
`hykLight(…,{kind:'pearl'|'jar'|'brazier', warm})` push `{bld, key, kind, x,y,z, nx,nz, w,h, level}` in
world space into `MARKS`; `_api.marks()` returns it as JSON and `verify.py --marks` writes
`dist/ys-marks.json`. A "Marks" overlay in the page shows them. Invariants: every building has a door;
every drowned building has a wet door and a bridge-level door; every lit building has a light.
The foreign sets already push `DOORS` (the Iziz vern helpers); the Ancients hosts get door marks at their
accreted landings only (a known gap, recorded).

## 8. The biome: `biomes/nwbay`

The north-west bay of the Ring Sea, as its own kit on the shared biome core, forked from `biomes/swbay`
(bay, volcano far-country, stepped river, reeds, fauna), then re-keyed:
- **Karst** (Krabi, Railay): limestone stacks with vertical faces, notched at the waterline, forest on top,
  curtain figs and hanging gardens off the ledges (the dress pass). A `karst(x,z)` field: the mask is zero
  on the cliffs; the city builds caves and stair-houses into the stacks it meets.
- **Igneous flavour**: columnar basalt on the shore, black-sand coves, lava boulders, the volcano SE.
- **Travertine** (Semuc Champey, Pamukkale, Havasu): the river's stepped bed becomes terraced pools with
  rimstone lips, turquoise water tinted by depth, cream crust, cascade foam; shelf pools on the shore too.
- **Semi-aquatic flora** (new zone from the `salt` and `wet` fields): lantern mangrove (recoloured, from
  the SW lowlands), mat reed and pipe reed beds (eastern abyss), stilt pandan / screwpine, lotus trumpet in
  the pools (Xanadu), sea-grape and salt scrub, lily pads; more hanging plants: lianas, epiphyte chains,
  curtain figs. Keep prism gum, ironbark, baobab (scaled to the swbay ceiling), fan-crown, tree ferns.
- **Height ceiling: eastern-abyss sized, nothing Girder-sized.** Canopy trees 40–80 m, emergents to
  ~120 m (the abyss's sky scale-tree is 100–124 m; Girder's hypertrees are 150–270 m and do not belong
  here). The swbay fork's 110 m ceiling already fits; the scaled prism gum and ironbark stay under it.
- **New land species for regional diversity** (the first two are required, the third if budget allows):
  - *Cliff fig* (30–55 m): a strangler fig rooted on the karst, the crown spilling over the cliff edge,
    aerial-root curtains down the rock face to the waterline, plate buttresses; the stacks' signature tree.
  - *Flame-crown* (15–28 m): a wide flat umbrella crown on a short bole, fine fern leaves, a scarlet bloom
    flush in patches; the lowland and farm tree, and the street tree of the land quarter.
  - *Cinder pine* (10–25 m): wind-sheared, gnarled, black-barked, on the lava fields and headlands; the
    igneous note on land.
- Fauna from swbay (soarers, swimmers) to start.

## 9. Dev tools (project rule) and the compass

Inspector (hover: name · class · tags), polygon tool, walk mode (F), labels, night (n), the port kit's
footprint bounds (b), the Paths and Marks overlays, the hour slider, and a **Compass** toggle: a rose in
the corner that turns with the camera yaw and a ground gizmo (N E S W) at the orbit target. The compass
goes into the standard `92-camera.js` pack so later builds inherit it.

## 10. Later

Life layer (Voth's pathing and collision as the model; `NAV` is built now so it has something to walk);
an animated tide (±1.2 m, the tideline band is painted for it already); interiors behind the marks.
