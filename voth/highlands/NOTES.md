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

## Round 6 (Sep 28 2026) — Roketstad, the town (target `roketstad`)
The first town built from the kit: `python build.py --target roketstad` → `dist/roketstad.html`. Everything lives in
`targets/roketstad/`; the kit's `src/` is unchanged. Machinery adapted from the Iziz city target (painted canvases for
albedo / buildable mask / class, the road list and its spatial hash, OBB occupancy, `cityFlat` levelling, the biome host).

- **Place** (`84-rk-geo.js`, `RK`). A 3.4 km square of hilly shelf rising east to the Inner Wall. The town is a walled dome
  hill (R ≈ 350 m, a lumpy wall with gatehouses N, S and E). The spaceport is a level table 1.3 km east. The far ranges are
  a shader curtain at 7, 10 and 14 km to the E/NE/SE (`90a`), with rock below a snow line and their own haze.
- **Layout** (`87`, `88`). Three squares: main (town hall, barracks, mustering ground, watch, Mercenary Guild, inn), market
  and temple. Main roads join them, and highways run square → gate → country (N, S) or the port (E). A pomerium runs
  inside the wall. The civic and forge-district plots are reserved first. Then the side streets grow toward unserved
  ground in long, slightly bent runs until every point is within ~23 m of a street (blocks ≈ 45 m deep).
- **Rows** (`90b`, Travis: "align walls and rooflines like an organically grown medieval city"). Each street is simplified
  into straight runs, and each side of a run is built as one row:
  - front walls on one line 1.1 m behind the kerb, every building square to the street;
  - party-wall gaps of .2–.7 m, and runs of 2–5 of one house type so eaves and ridges carry through;
  - where a house will not fit, the smallest houses are tried on the same spot before the row breaks.
  - Each square gets a closed polygonal ring of shops, taverns and the best houses facing in.
  - A back-row pass puts a narrower building behind each street front on the same heading (sometimes a third), so
    blocks read built-through.
  - Open ground left inside the wall becomes fenced kitchen gardens and orchards.
- **Reclaimed** (Travis: "predominately reclaimed"). `kitKey()` takes a def's `_reclaimed` twin 78% of the time where
  the kit has one. Wealthy houses never do (no metal roofs).
- **Outside the gates.** A straggle along each highway: an inn, shops, workshops and poor houses. The port road is longer
  and has up to six scrap smithies.
- **Spaceport.** A pentagon of five Launch Arcology sites at scale .17 (Ancients `buildLaunch`, vendored as
  `82c-anc-launch.js`). Four are empty pads; vertex 0 (east, against the mountains) is the arcology that never flew,
  ruined. The Starport (.3) stands in the middle and the fuel centres (.55) in the outer gaps. Also custom tank farms,
  painted helipads, fenced scrapyards with small scrap smithies, and the Scavengers' Guild where the town road enters.
  Each Ancient site keeps one label; its parts are `cls:'part'`.
- **Country.** Farmsteads (farmhouse or farm, pens, granary, the odd windmill) on lanes off the N and S highways, with
  patchwork fields. A quarry and a mine sit on the eastern hills. The NW-lowlands biome (humid-subtropical fields)
  forests everything else, at 2.2× the showcase stocking. To pay for that density, tree detail is traded away:
  hero LOD applies only within ~650 m of the town or the port (`RK.FOREST`, `RK.FOREST_LOD`).
- **Budget.** ~13 M triangles, ~300 draw calls. Travis allowed up to 15 M. The biggest costs are the forest (~2.5 M), the
  houses, and the farmsteads. Houses cost ~8–11 k each, which is what caps the density of the blocks.
- **UI.** An hour slider drives the Krator sky, and through `window.HL_HOUR` every clock in town. There is a Paths overlay
  (walkable classes) and a Forest toggle. `window._api.town` exposes the statistics (including why frontage placements
  failed).

## Round 7 (Sep 28 2026) — the East Highland frame; the Izmailovo temple
- **Frame replaces the half-timbering** (`src/73b-hl-frame.js`, Republican only; `HL_WALLS='fach'` restores the old
  look). The builders still call `hnFachBox` / `hnFachFace`, `vnWin`, `hnNal` and `hnRAShutters`, which are re-pointed.
  The storeys become a post-and-beam frame:
  - posts in red lacquer with teal-and-white capitals (the dougong's colours);
  - caihua architraves in the mural palette (middle, rich and civic);
  - plank, lattice curtain-wall (geshan) or mixed infill;
  - lattice windows (grid, step-fret or lantern);
  - on some upper storeys, a front gallery on carved cantilevers, with fret balustrade, carved posts and its own pent roof.
- **The roof interface** (Travis: brackets clipped the roof slopes; on the gable sides it wasn't clear what they met).
  - A gable or hip roof laid on a frame storey is lifted by the bracket band: height + reach × pitch. A plank frieze
    closes the band.
  - Everything the builder then lays above the storey top inside the roof's footprint rides up with it (a kput wrapper):
    bargeboards, dormers, chimneys, finials, gable murals.
  - Bracket sets are placed after the building (`hlFrameFlush`): in the band on eave faces; none on a plain gable's end
    faces; small sets inside the storey top when a storey sits above.
  - Some gables become **Dutch gables** (hip plus small top gable; rich 50%, middle 33%, poor 10%), with eaves and
    brackets on all four sides.
- **Temple of the Pantheon** rebuilt after the Izmailovo kremlin's wooden terem:
  - three stepped log tiers, each ringed by a gallery on bracketed posts (alternately carved) under a flared shingle skirt;
  - steep gabled pavilions with lace bargeboards and painted pediments on every tier;
  - a grand covered stair (30 steps, three stepped gable canopies) to the first terrace, and two bochka porches;
  - four corner turrets with red/white and green harlequin tents;
  - the great oval dome in green/lime harlequin (`hDomeHG`) with a clock lantern (live hands) and two emblem spires.

## Round 7c (Sep 29 2026) — roof fit, railings, the cushion dome, salvage-built buildings
- **Roof fit.** A storey is matched to its roof by footprint (the hospital's wing roofs sit 2 m off their storeys).
  - Each eave face gets an eave beam across its bracket tips; the lift is sized so the roof comes down onto it.
  - The lift raises only what lies inside the roof's footprint and height band. Towers and clock towers are exempt
    (the Peles villa's loggia had been torn off its shaft).
  - Bargeboards ride the lift whole (piece by piece they splayed off the rakes).
  - On a Dutch gable, pieces the builder put on the gable wall (loft doors, hoists, murals) move up onto the small top
    gable, at .55 scale.
- **Railings.** Gallery balustrades are now baluster panels: a great ring with a triskelion between small rings.
  Painted (teal, red, ochre) on the better houses, carved in pale wood on the rest.
- **Temple dome.** The long cushion of Izmailovo: a rounded-rectangle plan on a flat-shouldered profile (`hDomeHG2`),
  with gilt cresting along its ridge.
- **Salvage-built** (`src/79b-rep-salvage.js`, born reclaimed, so no `_reclaimed` twin):
  - Tank house: a spent fuel tank on concrete cradles, with a frame storey straddling it on stilts, a wind charger and
    a cistern.
  - Hull-plate tower house: two frame storeys on a shattered block of Ancient concrete with rebar, hull-plate walls, a
    rocket-bell chimney and an antenna mast.
  - Powder works: three plank sheds between earth blast berms, a tank boiler with a guyed pipe stack, a powder rail and
    a watch post.
  - Hull-breaker's yard: a furnace hall with a ridge ventilator and brick stacks; a bracketed gantry lifting a hull
    section; heaps, a pipe rack, a spent engine bell, an office, a plate fence.
- The kit showcase budget is raised to 4.5 M triangles / 450 calls (it grew by the frame and four buildings).

## Round 8 (Sep 29 2026) — the scrap quarter; Roketstad on the new kit
- **Ten salvage-built buildings** (`src/79c-rep-apoc.js`, born reclaimed). The wreck is the shell (painted containers,
  corrugated silos, tanks, a crawler's hull, a rocket-hull panel); the Republic supplies the frame storeys, Alpine
  gables, lattice, balustrades and signs.
  - Hull-vault warehouse: a ribbed curved hull panel on bracketed posts.
  - Scrap Kontor: containers, a frame storey, a lookout, a weighbridge, a strongroom and the emblem flag.
  - Container stack.
  - Silo house (wrap porch, annex).
  - Tank-cluster row (bridges between tanks).
  - Crawler house.
  - Salvage garage (jib crane, carport).
  - Container shops.
  - Lantern stall.
  - Radome tower house (lattice mast, radome).
- **Fixes.**
  - The reclaimed-twin filter's `continue` had been commented out in 7c, so every Republican def got a twin.
  - Tank bodies now use a centred cylinder (`hTankC`; `vTankR` stands on its base).
- **Temple of the Pantheon**, squatter, wider and in stone:
  - ashlar tiers of 32×24, 24×17 and 16×11 m, with quoins and string courses;
  - ashlar pavilions and turrets, a stone stair from the forecourt;
  - a wider, lower cushion dome;
  - the galleries, gables and stair canopies stay timber.
- **Roketstad** is rebuilt on the kit as it now stands: the frame, Dutch gables, triskelion balustrades, the stone temple.
  - About 1 in 5 frontage buildings in the poorer streets comes from the salvage kit; some forge-district lots too.
  - **The scrap town** (`SAT` in 87, `satelliteTown` in 90b): a plaza on the port table's west rim by the road and the
    Scavengers' Guild, with the Scrap Kontor on it and eight wandering lanes of salvage houses and shops. The hull-vault
    warehouse, hull-breaker's yard and powder works stand at its edge.
  - **Bunkers**: Ancient redoubts (vendored `buildBunker` and `aaBattery`) round the table's rim, in the reclaimed
    state with the repair pass (shacks, patches, lines).
  - The unlaunched arcology now stands on the pad nearest the town.
  - **LOD** (`93b-rk-lod.js`): screen-size culling of the kit's instances. An instance draws only while
    size/distance > 1/300; each InstancedMesh is rewritten near-first and its count cut as the camera moves. It keeps
    about a quarter to three fifths of 520 k instances depending on the view; rendered triangles fall from ~12.8 M to
    5–9 M. The probe sees the full lists. There is a LOD button to compare.

## Round 9 (Sep 29 2026) — Roketstad, capital of the Iron Republic
- **The town doubled.** An oval wall (`RK.TOWN` in 84: semi-axes 640×395 m, lumps damped toward the east) now runs from
  the old hill town in the west to the port table's rim in the east, taking in the scrap town. There are four gates:
  N, S, E (port road) and a new **W gate**.
- **The east half is the scrap and industrial district** (`inForge`: x > −120 inside the wall).
  - It has darker earth, its own square (Scrap Kontor, wreck market) and denser works.
  - The row builder picks from salvage and industrial pools there (`IND_TRADE`/`IND_HOMES`).
- **Five more salvage-built buildings** (`src/79d-rep-scrap2.js`):
  - Stage tenement: rocket stages stood on end as flats.
  - Smelter.
  - Wreck market: stalls under a hull.
  - Press works (sawtooth roofs).
  - Gasholder tenement.
- **The Fallen Arcology** (`src/79e-rep-arco.js`).
  - Two half-pyramids of Ancient stone in a DFS-maze relief lean apart, with a broken slab fallen behind.
  - A crowd of frame towers fills the cleft; terraces with huts and zig-zag stairs are cut into the faces.
  - A cave mouth has lanterns; houses and a stall stand at the mouth of the cleft.
  - It stands in the north of the industrial half.
- **The capital's institutions** (`src/76c-rep-capital.js`):
  - Arsenal of the Republic: a drill court, a gate tower and a turf magazine.
  - Mint and Treasury: rusticated stone, a gilded cupola and a strongroom.
  - Rocketeers' Guild: a guildhall and a bracketed test tower holding a rocket.
  - The Hall of the Republic, Mint and Rocketeers' Guild face a new **Republic square**. Every earlier civic building
    and guild is placed too.
- **Open-air markets**: rings of striped stalls (`hnStall`) on the main, market, temple, Republic and scrap squares.
- **The N and S highways** get runs of 1–2 buildings with jittered setback and a mixed pick (`HW_TRADE`) instead of
  unbroken rows. Suburbs sit outside the N, S and W gates; farms (steads, strip fields, mills) lie along the W road.
- Bunkers inside the new wall are skipped. The scene is ~19.6 M triangles; LOD draws 6–11 M.

## Round 10 (Sep 29 2026) — one kit page, Rustic and Tribal salvage, fixes
- **The kit is one page.** `dist/highlands.html` shows all three branches, with the Republican branch in the East
  Asian frame (`HL_WALLS='frame'`). The single-branch targets (republican, rustic, tribal) are retired to
  `_OLD_TARGETS`. The ground plane now grows with the rows.
- **Rustic salvage** (`src/81b-rus-salvage.js`, seeds 25000–25099). All are born reclaimed (`tags.salvage`):
  - Tank stue: a turf gable with dragon heads built over a spent tank.
  - Container chalet: falu-red containers under an Alpine log storey with a stone-weighted shingle gable.
  - Hull naust: a boathouse under a curved hull panel, with a longboat.
  - Silo stabbur: a log loft oversailing a corrugated silo.
  - Scrap-iron market: a turf hall with container-door gable ends.
- **Tribal salvage** (`src/85b-tri-salvage.js`, seeds 26000–26099):
  - Tank roundhouse: an upright tank on a stilted deck under a thatch cone.
  - Container longhouse.
  - Hull meeting house: on totem posts.
  - Silo drum-house.
  - Scrap forge.
- **Reclaimed twins** (88) already covered Rustic and Tribal dwellings, shops, taverns, farms and smithies.
- **Temple of the Pantheon**: Zsolnay-style glazed polychrome fish-scale tile (`hlTile`) on the dome, the corner tents
  and the lantern spires.
- **The Fallen Arcology is now a crashed ship.** It is a plated hull broken in two:
  - Nose: ploughed into a berm.
  - Stern: engine bells, a thrust plate and fins, one snapped into the earth.
  - Superstructure: a dorsal block, antennae, a dish and flank tanks.
  - The break: exposed decks with dangling conduit and torn plates.
  - The town in the cleft and on the flanks is kept.
- **Roketstad wall**: each gatehouse is turned to the oval wall's tangent, and the runs end exactly at its stubs.
- **Sky**: the giant's quad is sized so the rings (2.2 disc radii) fit inside it. The near half of the ring now
  crosses in front of the disc (the `front` term tested the wrong radius).
- **Known issues**:
  - `hnKryltso` takes its stair's real run.
  - The dougong issue is closed (the frame's roof lift).
  - Re-vendoring from `../ancients/src` is still open.

## Round 10b (Sep 29 2026) — the guild at the port gate, the apron's ruins, tiled wall spires, views, main
- **Scavengers' Guild** (`77b`, seed 21111, now 72×48): a compound. The guildhall (rubble ground storey, frame upper
  storey, a salvaged metal gable faced with Ancient panels, the salvage roundel over the door) bridged to a spent rocket
  stage stood on end as a lookout tower (window rings, frame lookout, spire); a hull-vault depot behind; east of it the
  fenced sorting yard entered through a gate of stacked tank sections: six sorted heaps with painted boards, a gantry
  crane with a hull section on its chains, five container stores, a furnace and stack, the weighbridge and booth, carts;
  the salvage market of stalls along the road front. In Roketstad it is placed from the spaceport builder (the ground
  past the east gate is port apron, which the town placer rejects): the nearest valid footprint to the gate, turned to
  the port road.
- **Spaceport apron**: 17 scrap yards (was 5), each with 8–12 heaps, a container store or two and a derrick; 6 ruined
  Ancient **silo batteries** (bins sheared at different heights, some fallen and lying broken, a head-house with its
  snapped conveyor) and 6 ruined Ancient **factory halls** (column grid, the surviving roof bays with north-lights,
  slabs fallen in, a broken back wall, a chimney, rubble). The placers retry until they reach their counts.
- **Fallen Arcology**: the plot's `faceAt`/`faceOff` turns the ship's stern (local +x, the engines) to the Starport.
- **Z-fighting**: level plots flatten the terrain to 6 cm above the building origin; the Mustering ground's dirt and the
  Hall's parterre and paving beds were thinner than that. They are now 14–22 cm thick.
- **Wall towers and gate towers**: glazed tile spires and pinnacles (`MAT.hTileW`, oxblood and bottle green in
  chevrons with an ochre line; the temple's six-colour tile read as confetti at spire size). The tile survives the
  reclaimed twin (it is not a roof material in `HSALV`). Wall hoardings are roofed in corrugated sheet.
- **Views**: the opening and east-gate shots had drifted inside the never-flown arcology's scaffold; the street shot now
  stands in a street and looks down it; the two launch-pad views had the ruined and empty pads swapped. New: the guild
  (and its yard at eye level), scrap yards, silos, a factory, the Hall of the Republic, the Mustering ground, the ship
  from its engines and broadside.
- **Main**: merged; the five vendored Ancients fragments re-vendored verbatim from `../ancients/src`.

## Round 10c (Sep 29 2026) — the Salvagers; the shipbreakers
- The Scavengers' Guild is now the **Salvagers' Guild** (display names only; the key stays `hl_rep_guild_scav`).
- **Shipbreakers' yards** (`79f`, seeds 22401 freighter / 22411 lander, two defs over one body): a ship that came down
  short of the port and the Salvagers taking it apart — plated fore hull under scaffolding, midships stripped to ribs and
  stringers with the decks showing, a gantry straddling the cut lifting a plate, sheerlegs over the nose, a ring section
  cut free on cribbing, the engine bells on timber sledges, the thrust plate on edge, sorted plate stacks, and a camp of
  corrugated sheds, a forge fire and a winch hauling on the hull. The freighter lies nearly level; the lander is nose-down.
  In Roketstad both are reserved off the port table's north-east rim (north is -z), outside the walls, each nose-on to
  the port; three new views.
