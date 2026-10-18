# The Pylon kit: the design plan

Pylon is a vassal city of Iziz: a former arcology city built round the ruined **Monolith**, with Ancient ruins all
round it. Its later buildings, put up after the Cataclysm, imitate the Ancients: vaguely modernist, blocky, clean
geometric shapes, white and orange. It is a major scrap and salvage hub and should feel industrial. Iziz Vernacular
buildings will stand among Pylon's own. (Owner's brief, 2026-10-17.)

Read `settlements/iziz/VASSAL-KITS.md` first: the shared engine, the rules that keep this kit from clashing with the
Vernacular, and the governor's palace programme both vassal cities share.

## 1. The reference board

The owner's pictures, copied into `refs/` (the `ancient*`, `pylon*`, `honeycomb*`, `fortress`,
`govpalace` and `1b13731c…` pictures; 35 in all). It is not one style. It falls into four layers, and the kit keeps
them apart:

| Layer | What it is | Pictures |
|---|---|---|
| **Ancient** | the originals: monumental (10+ storeys), seamless white shell with fine panel joints, curves only in profile, saffron fins and buttress legs that are part of the structure, glazing that glows amber, a dark lit slot up the middle | `ancient`, `ancient 2`, `ancient temple`, `fortress`, `honeycomb arch`, `honeycomb complex`, `ancient office`, `honeycomb` |
| **Neo-Ancient** | the post-Cataclysm civic and rich tier: the Ancient forms made in what Pylon can build (board-formed concrete, white render), 3-6 storeys, flat roofs; orange becomes paint inside niches and under canopies; stadium ("pill") windows and fins, barrel vaults, parabolic arches, porthole bezels, nested-frame portals | `pylon3`, `pylon 5`, `pylon - market`, `pylon (2)`, `pylon (3)`, `pylon (4)`, `pylon (5)`, `pylon (7)`, `pylon7`, `pylon fortress` |
| **Folk** | the middle-class imitation: white render boxes with thick orange cornice bands at every floor, corner parapet piers, stepped multifoil arches, diamond and disc insets | `pylon`, `pylon 2` |
| **Salvage** | the poor tier and the industry: capsule tanks on ring decks, riveted hatches, pipes, stacked cube pods cantilevered off older masses, Ancient white rings and arches reused as doorways, awnings, standpipes | `ancient 3`, `pylon8`, `pylon7`, `honeycomb 2` |

Form only, wrong material (use the shape, not the colour): `ancient massing` (grey stone and teal: the hexagon-gem
shrine), `ancient massing (3)` (black: the chevron portal), `pylon (6)` (teal glass: pointed-hex towers), `pylon 4`
(teak and teal: the keyhole arch), `pylon6` (timber: frustum pods joined by bridges), `pylon - temple` (sandstone and
gold: the pyramid-gabled pylon gate with obelisks), `govpalace` (bamboo: the palace plan).

Interiors: `pylon int` (lounge: board-formed walls, orange-lined pill niches, an orange fireplace block, built-in
orange banquettes, coffered skylights, herringbone brick floor), `pylon int 2` (civic atrium: a mosaic pier with a
cantilevered stair round it, galleries with white relief balustrades), `pylon int 3` (bedroom: concrete with an
orange S-band in relief, timber slat ceiling, walnut platform bed, grey stone floor with a red inlay line).

## 2. The rules the generator follows

- **The profiles.** Three outlines carry the whole style: the **tombstone** (a rectangle under a semicircle or
  parabola: slabs, windows, portals, fins), the **stadium** (a rounded rectangle: pill windows, fins, niches), and the
  **pointed hexagon** (gables, gem windows, portals). Neo-Ancient and folk work uses the first two as flat frames on a
  box; Ancient work uses them as the building's own section.
- **Ancient massing.** Towers 1:4 to 1:6, tapering 10-30% or parabolic, splayed at the base by saffron buttress legs,
  ending in a blunt rounded cap or a staggered broken crown, never a flat cornice. Clusters of 3-7 graded slabs,
  symmetric round the tallest. Portals span three or four storeys, deep, with three to five nested rims. Panel module
  1.5-3 m; storeys 4-5 m.
- **Portholes** 1-4 m, a raised bezel about 15% of the diameter, dark glass or a radial or hex grille, in graded
  clusters (big low, small high), plus scattered small round pocks over the panels.
- **Hexagons** everywhere small: grilles, paving, the hex-cell apartment stack, hex-lattice domes.
- **Orange by layer.** Ancient: saffron (`#E3A02E`) as structure (fins, legs), amber glow behind glass. Neo-Ancient and
  folk: Iziz orange (`VPAL.orange`) as paint: niche linings, canopies, cornice bands, door reveals. Salvage: rust.
- **Imitation is cruder.** Neo-Ancient white is render or concrete with formwork lines and weathering, curves only as
  extruded rounded rectangles and barrel vaults; right angles dominate. Folk work is flat banding and insets.
- **Industrial dress on everything below rich.** Pipes and conduit on the walls, junction boxes, standpipes, tanks on
  roofs, awnings on poles, crates and drums in the yard.

Palette (from the pictures): Ancient white `#EEEBE5`, cream `#E3D9C8`, saffron `#E3A02E`, Iziz orange `VPAL.orange`,
glow amber `#FF8A24` (emissive, Ancient only), rust `#B8652A`, formwork grey `#8E8B86`, dark slot `#2A2B30`, gunmetal
`#4A5058`; inside, walnut `#6E3A22`. No red adobe walls (owner, 2026-10-17; the colouring is white and orange): from `pylon8` only the forms;
its salvage town is white render and rust.

## 3. Living beside the Vernacular

The general rules are in `VASSAL-KITS.md` section 2. For Pylon in particular:

- The **salvage tier is the bridge**: it is built of the Vernacular's own poor materials (corrugate, Ancient panel,
  timber posts, tarps), with Pylon's forms (tanks, pods, rings). A Vernacular stilt hut beside a tank house reads as
  the same poor quarter.
- **Roofs.** Pylon roofs are flat, barrel-vaulted or domed; the Vernacular's are pitched with deep eaves. Pylon's folk
  and neo-Ancient houses keep their parapets near the Vernacular's wall tops (about 3.7 m for one storey and 6.7 m for
  two: `buildVernMidA` is a 0.4 m plinth, 3.3 m and 3.0 m storeys) so a street's skyline steps, not jumps.
- **Climate.** Pylon stands on a savannah mini-plateau (owner, 2026-10-17), drier than Iziz's hyperjungle. The
  Vernacular's deep rain eaves read there as the Izani settlers' own way of building, which is the lore; nothing
  changes in their builders. Flora comes from the biome core's savannah zone (dry upland on the climate fields), not
  the hyperjungle's.
- **Proposed culture mix** for `core/city` zones: the Izani quarter by the palace 60% Vernacular; the neo-Ancient
  centre 15%; the salvage quarters and the yards 25% (Izani taverns, smithies, warehouses among the yards).

## 4. What the kit holds (about 40 defs)

Styles in the `style` tag: `ancient`, `neo`, `folk`, `salvage`.

**Dwellings**

| Key | Tier | What |
|---|---|---|
| `pyl_tank_house` | poor | a capsule tank on legs with a ring deck, a riveted hatch door, a lean-to of corrugate (`ancient 3`) |
| `pyl_pod_stack` | poor | cube pods of panel and corrugate stacked and cantilevered off a fragment of Ancient wall (`pylon7`) |
| `pyl_ring_house` | poor | a small render house whose door is a reused Ancient ring segment, awning, standpipe (`pylon8`) |
| `pyl_hex_cells` | poor (multi) | a honeycomb of hex pods, three to five high, open fronts, ladders (`honeycomb 2`) |
| `pyl_folk_house` | middle | two storeys, white render, orange cornice bands, corner parapet piers, diamond and disc insets, curved balcony (`pylon`) |
| `pyl_folk_villa` | middle | three storeys, stepped multifoil arches over the porch, orange round columns, rooftop pavilion (`pylon 2`) |
| `pyl_vault_house` | middle | two or three barrel-vault wings of graded height on a plinth, arched glazed ends, portholes (`pylon (4)`, `pylon (7)`) |
| `pyl_terrace` | middle (multi) | stacked boxes stepping back, round-arch openings with steel grid glazing, roof gardens (`pylon (2)`, `pylon (3)`) |
| `pyl_block` | middle (multi) | five-storey concrete block, full-height orange-lined pill niches, cantilevered orange slab over a recessed ground floor (`pylon 5`, `pylon3`) |
| `pyl_neo_villa` | rich | concrete and white render, pill fins, a nested-frame tombstone portal, reflecting pool, walled court |
| `pyl_hex_villa` | rich | a courtyard house behind a porthole wall with hex grilles, a pointed-hex gem window, flat roofs at two heights (`pylon (5)`) |

**From the Post-Apoc set** (owner, 2026-10-17: it "may also be able to supply some buildings ... with
modification"). `kits/post-apoc` is built from reclaimed cores (containers, silos, tanks, buses, and the Ancients' white
**bulkheads**) with scrap additions and culture sockets, and ships as one closure (`apoc_bundle.bundle(defs)` ->
`KratorPostApoc.build(sites, {culture})`; Screamers already takes it). Pylon's salvage tier takes it in two ways:

- **As it is, through a `pylon` culture pack** in `core/sockets/80-cultures.js` (white and Iziz orange; the gantry
  crane and the Monolith as the mark), placed beside the VERN defs: `dw-tank` (tank pod), `lg-tanktower` (the
  tank-tower tenement: `ancient 3`'s look), `lg-bulkhead` (an Ancient white slab with a round hatch: the most Pylon
  thing in the set), `lg-stack` (container stack), `dw-silo`, `lg-twinsilo`, the five shops (the bazaar lanes),
  `smithy`, `warehouse`, `gen-wind`, `gen-fuel`, `watchtower`, `compound`, and `arena` (a salvage town's Thunderdome).
- **Modified, as Pylon defs** where the brief needs more: `pyl_tank_house` and `pyl_pod_stack` start from `dw-tank`
  and `lg-stack` with Ancient panel and ring-portal doors; the scrap yard, breakers' floor and tank farm reuse its
  cores (tanks, containers, lying tanks) as props. A modification is a new def that calls the set's cores and
  additions, never an edit to its builders (Screamers and the set's own sheet must stay byte-identical).
- Left out: `dw-tire`, `dw-bottle`, `dw-bus`, `dw-stilt`, `farm`, `cages`, `dock` (wrong look or no use on a dry
  plateau), unless the owner wants them in the poorest edge.

The bundle has its own engine (its own `MAT`, `rng`, registry), so a Pylon page loads it next to the IZV closure, as
Screamers does; its records come back through `KratorPostApoc.REG()` with front doors and colliders, which the city
placer reads like any other.

**Salvage and industry** (the city's trade)

| Key | What |
|---|---|
| `pyl_scrap_yard` | a fenced yard of sorted heaps (panel, plate, pipe, wire) under a travelling gantry crane on two rails |
| `pyl_breakers_floor` | the cutting floor where Ancient panels are broken: a derrick, a slab table, sparks (emissive), stacked cut panel |
| `pyl_smelter` | a neo-Ancient shed with two stacks, a crucible gantry, slag heap, ingot racks |
| `pyl_sorting_shed` | a long barrel-vault shed with bays by material |
| `pyl_scrap_exchange` | the market: a long three-storey arcade of vaulted bays, a stall in each, a balcony rail on each storey (`pylon - market`) |
| `pyl_bazaar_lane` | a row of stalls under awnings between pipe standpipes and junction boxes (`pylon8`); takes `o.len` |
| `pyl_tank_farm` | three to five tanks on ring gantries joined by pipe |
| `pyl_crawler_depot` | a high bay for the Motor Vehicles kit's crawlers and caravan trucks, a fuel tank, a ramp |
| `pyl_workshop` | a neo-Ancient box with an orange cantilevered canopy over an open shop front |
| `pyl_cable_crane` | a mast and a cable run to lower salvage down the Monolith's face; its far end set at placement |
| `pyl_conveyor` | one segment of trestle conveyor between yard and smelter; takes `o.len` |

**Civic**

| Key | What |
|---|---|
| `pyl_salvagers_guild` | the city's real power: a neo-Ancient guild hall with a parabolic arcade and a porthole wall (`ancient office`), a vault for the finds |
| `pyl_assay_office` | where salvage is weighed and the Emperor's tithe taken; Izani-run |
| `pyl_watch` | the city watch: slab towers on saffron legs gripping a tall round-headed gate arch (`fortress`) |
| `pyl_cult_shrine` | the post-Cataclysm cult of the Ancients: a pyramid-gabled pylon gate, obelisk lamps (`pylon - temple`) |
| `pyl_school`, `pyl_clinic` | neo-Ancient, pill windows, a court |
| `pyl_governor_palace` | section 6 |

**The Ancients** (landmarks and the ruin field; each in `intact`, `ruin` and `rehab` states, as `77z-iziz-style.js`
does for its families)

| Key | What |
|---|---|
| (the Monolith) | not a def of this kit: `buildMonolith` from `kits/ancients`, read in place at decay 1 (section 5) |
| `anc_temple` | Pylon's temple, an Ancient building reclaimed, on the grid's repaired side (owner, 2026-10-17): four or five rounded towers with domes, parabolic arches glazed in amber, a beehive dome pocked with windows, a ribbed podium (`ancient temple`, `ancient`) |
| `anc_pyl_fort` | the fortress block: rounded slab towers with battlements, saffron legs and an arch band over a tunnel gate (`fortress`, at the Ancients' scale; replaced the blade cluster, owner 2026-10-18) |
| `anc_pyl_slab` | the arch slab: the Monolith at a city block's scale, through-arch, three oculi, cladding, a carved flank (replaced the spindle row, owner 2026-10-18) |
| `anc_frustum_pods` | truncated cones with oculus skylights joined by bridges (`pylon6`, re-skinned white with orange rims) |
| `anc_vault_chapel` | graded nested half-vaults, white rims (`ancient apt`) |
| `anc_hex_shrine` | the triple pointed-hex gable with gem windows (`ancient massing`) |
| `anc_ring_gate` | a standing or fallen ring portal; fragments as debris (`honeycomb complex`, `pylon8`) |

## 5. The site: the Monolith and its grid

**Where.** Pylon is on the scale model (`openworld/*/source/settlements.json`, id `sxoqgjn7y0`, type `arcology`) at
map pixel (597, 672); Iziz is at (691, 655). At 2 km a pixel that puts Pylon about 190 km west of Iziz, on a savannah
mini-plateau (owner, 2026-10-17). It is just west of the little demo's region (x from 623), so the open world does not
reach it yet.

**The Monolith exists:** `buildMonolith(scene,gx,gz,d)` in `kits/ancients/src/89g-monolith.js` (the Ancients gallery's
"The Monolith", target `kits/ancients/targets/monolith`). A slab 1,100 m tall, 380 m wide at the foot tapering to 340,
148 m deep tapering to 120; a round-headed through-arch 160 m wide and 250 m high with a road through it, off-centre to
the west; three through-oculi (168, 92 and 60 m); orange and ochre cladding panels over a white carved city that shows
down the west flank. Decay 1 is the ruin: skin stripped from most of the broad face, the crown broken, the great
oculus rim broken through, the upper corner fallen as a rubble field to the east.
- **Its size already matches the Hexahedron's:** `68-hexahedron.js` builds to `YT=1100` over a 1,000 m span, and the
  Monolith's `H=1100`. No resize is needed. (The Ancients kit sheet shows it at its own row's scale; the city places
  it 1:1.)
- Pylon takes it **at decay 1**, read in place from `kits/ancients/src` (not copied), with its known weakness (the
  fallen fragments are clean boxes) fixed upstream if the ruin field is in view.
- **Lived in at the foot:** the arch's avenue is Pylon's main street; salvage pods, walkways and the Salvagers' Guild's
  yards fill the arch's jambs and the foot of the carved west flank. The interior is a delve, out of scope here.

**The grid** (owner, 2026-10-17). The Monolith stands at the centre of a **rectangular grid of Ancient buildings**,
repaired and ruined, the arch's avenue as one axis:
- **The repaired side** (more repaired than ruined) holds the temple and the city's civic and rich core: Ancient
  buildings at the kit's repaired state (decay 3, `API.md` in `settlements/iziz`), reoccupied, with neo-Ancient and
  folk infill on the lots between.
- **The ruined side** (more ruined than repaired) is stripped shells (decays 1-2) with the scrap district nearby:
  the yards, breakers' floors, smelters and the salvage housing at the edge of the ruin field, where the material is.
- The grid's blocks come from the kit's own Ancient builders first (`kits/ancients`, placed the way Iziz's city
  places them: `placeKit`, `measureKit`, `trimPlinths`), then from the new families in section 4. Its streets and lots
  go on `core/city` (CLAUDE.md: a city's placement goes there): the grid is the saved site's steps 0-5, the Ancient
  blocks are precincts the infill stops at.
- **The sides** (owner, 2026-10-17): repaired on the east (towards Iziz and its road, so a traveller from the capital
  arrives through the living city), ruined on the west, with the scrap district on the plateau's west edge, downwind.

Open: whether the new Ancient families (section 4) belong upstream in `kits/ancients` (other ruin sites may want them;
recommended once they are judged) or stay in this kit.

## 6. The governor's palace in Pylon's style

The programme is `VASSAL-KITS.md` section 3. Pylon builds the `govpalace` massing like this:

- The **terrace** is an Ancient podium (a fallen tower's plinth, white panel with pocks): the undercroft is Ancient
  fabric, and the hidden way out is its old service passage towards the Monolith.
- The **hall block**: white render over concrete, two storeys of tombstone-arched arcades on a 4 m bay with
  orange-lined reveals, a deep gallery behind each; flat roofs with a thin orange cornice band.
- The **great dome**: a white drum ringed by tall lancet windows glowing amber; a shallow dome of hex lattice (the
  Ancient grille, white ribs over dark glass) with a saffron oculus ring; the signal lantern on top.
- The **seven pavilions**: round drums with a stadium-window arcade and a small hex-lattice or truncated-cone cap;
  short orange-framed bridges join the outer ones to the block.
- The **outside stair**: a solid white flight with a saffron stringer wall, landing on a cantilevered box at the
  gallery. Saffron buttress legs at the block's four corners; a nested-frame tombstone portal on the axis.
- **Interiors** (decor 2-4): board-formed concrete with orange-lined pill niches, coffered skylights, mosaic piers
  with cantilevered stairs (`pylon int 2`) for the hall's galleries, walnut and orange leather, herringbone brick and
  grey stone floors with an orange inlay line; Ancient white panel with amber light where the podium shows.

## 7. Interiors and furniture

- A `pylon` culture file in `kits/catalog` (`krator-master-furniture-pylon.js`) through `FK.set()`: built-in
  banquettes, platform beds, walnut desks, orange-surround hearth blocks, niche planters, mosaic-topped tables, salvage
  lamps; the poor tier takes the catalog's `scrap` set.
- Room kinds for `kits/interiors`: the lounge (`pylon int`), the galleried atrium (`pylon int 2`), the tall bedroom
  (`pylon int 3`), the vaulted stall bay (`pylon - market`), the workshop floor.

## 8. Textures (to add to `core/materials/PROMPTS-NEEDED.md` once the owner agrees)

Reuse first: `concrete.*`, `metal.rust.*`, the Ancient panel family and the Vernacular's corrugate and timber. Likely
gaps: **Ancient white shell panel** with fine joints and small round pocks (if the library's Ancient white is too
plain); **board-formed concrete** with formwork lines; **hex tile** (amber and black, `1b13731c`); **hex grille**
(cut-out on magenta); **orange painted render** with wear. The prompts are written when the owner agrees the list.

## 9. Phases

| Phase | What | Done when |
|---|---|---|
| P0 | `kits/pylon` scaffold: `build.py` (the port lint, then `settlements/iziz/build.py --kit`: the kit on the Vernacular's page, nothing copied), `verify.py` (Iziz's, on `tools/harness.py`), the kit sheet target with the mixed street, `INDEX.md`, `PORT.md`; `materials.json` waits for P1's texture list, and the shared IZV list (`VASSAL-KITS.md` §1) for the city page, where it is needed (the sheet does not use the closure) | **done 2026-10-18**: the sheet builds with the first building (`pyl_folk_house`); Iziz's own pages rebuild byte-identical |
| P1 | materials and kit items (`py*`), the profile helpers (tombstone, stadium, pointed hex, nested frames, portholes, hex lattice) | **kit items and profiles done 2026-10-18** (README, "The profiles"); the hex lattice (domes) comes with the civic set; `materials.json` waits for the texture list |
| P2 | dwellings, all tiers, and the mixed-street row | **built 2026-10-18**: 11 dwellings (4 poor, 5 middle, 2 rich) and four mixed-street rows; awaiting the owner's eye-level review |
| P3 | salvage and industry, civic | **built 2026-10-18**: 11 salvage, industry and trade buildings and 6 civic, in three more mixed-street rows; the post-apoc pack (section 4) still to wire |
| P4 | the Ancient families in three states, the temple, the Monolith read in place, the grid as a saved `core/city` site (section 5) | **built 2026-10-18** except the grid: six families in four states (Pylon's `repaired` added beside Iziz's `rehab`), the temple, the Monolith in place; the grid is the city page's job |
| P5 | the governor's palace: blueprint sheets after the forks (`VASSAL-KITS.md` §3.4), then the building | |
| P6 | the catalog culture file, interiors | |
| P7 | the Godot export check, the gallery | `tools/test_all.py` passes |

## 10. Open questions for the owner

Settled 2026-10-17: Pylon is on a savannah mini-plateau west of Iziz (on the scale model); the Monolith is the
Ancients kit's, already at the Hexahedron's height; it stands in a grid of Ancient buildings, repaired on one side with
the temple, ruined on the other with the scrap district near; the palace forks take the recommendations; the
reference pictures are in `refs/` (plain Git, like Zeijani's). Then: the repaired side is the east (towards Iziz), the
ruined side and the scrap district the west; no red adobe walls anywhere.

None open.
