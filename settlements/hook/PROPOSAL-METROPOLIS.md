# Hook as the living third of a drowned Ancient city: a reblueprint proposal

*Proposal, 2026-11-24; **the owner's answers are in section 8** (the city is Huka; lagoon and scarp; salvagers, stilt
villages and pods; a gradient of wildness; two pages; M1 starts now). Nothing here is built. The owner asked for "a proposal for rebuilding /
reblueprinting the settlement using the Ancient Transit and metropolis kit (as well as current Ancient kit material) to
make Hook a port settlement making up about 1/3 of [a] larger ruined city overgrown with jungle". Paths are from the repo
root; "today" means `claude/unruffled-greider-5cf58d` at the port onto the integration line.*

## 0. The short version

Hook today is one living town on a +5 m spit (`world/landforms.json`), the Ancient Port kit's waterfront on its north
shore, about 3.8 km² of lots behind it. The 5.1 scale model gives the rest of the city its ground already: south of the
spit lies a **drowned flat** (-10 to +5 m, some 25 km², one body with the Ring Sea) and east of it the **plateau's
scarp** (0 to 400 m in 2 km). The proposal reads those two as the other two thirds of one Ancient city:

| Third | Ground | What stands there | Kits |
|---|---|---|---|
| **The port** (living, today's Hook) | the spit, +5 m | the waterfront, the town of six cultures and Marr, the hosts | `kits/port`, `core/city`, the culture kits, `kits/ancients` hosts |
| **The Sunk City** (drowned) | the lagoon, -5 to 0 m | the Ancient lower city, sunk in the Cataclysm: towers standing in shallow water, stumps and fallen hulks, mangrove and swamp jungle, a viaduct line broken across it | `kits/metropolis` (wild ruins), `kits/ancient-transit` (elevated rail, collapsed spans), KRUBBLE, swbay flora |
| **The Scarp City** (upper) | the plateau's north and west faces, 0 to 400 m | the Ancient upper city stepping up the scarp: terraced midrises, an arcology block like the Pile, the funicular stump, the highway climbing out of the city, all under rainforest canopy | `kits/metropolis` (terraces, Soleri farms), `kits/ancients` (arcology, skyscrapers), `kits/ancient-transit` (highway, funicular), hyperjungle/swbay flora |

The story the ground tells: the spit is the Ancient city's raised harbour embankment, the one part that stayed above the
water when the lower city sank; the living port grew on it, and the jungle took the rest. It needs **no scale-model edit**
beyond the spit already written up (the lagoon stays wet, the scarp stays as it is).

## 1. What changes in the lore (the owner's word needed)

`LORE.md` (line 318) has Hook as "the Ancient port city" and nothing of a larger city; the plan's Ancient town is 110 m
blocks three rows deep behind the quays. This proposal makes Hook's town the surviving **harbour quarter of a city about
three times its size**. To decide:

- **Its name.** The Ancients' city needs one (the Hukoa call the port *Huka*; the drowned and upper cities may have names
  in Hikau, Izani and Vothic).
- **How it sank.** A Cataclysm subsidence of the coastal plain, so the lower city stands in 1 to 5 m of water; the
  harbour embankment (the spit) and the scarp stayed up. This matches the 5.1 ground as it is.
- **Who goes there.** Salvagers (the Salvagers' Guild already has a bridgehead in the Stacks), Hukoa fishers among the
  stumps, Hykkousoi pods on towers that still stand, Izani patrols at the edge; the upper city's canopy is wilder
  (the Crag Men's border is up that slope, PLAN.md section 1).
- **How wild.** Near the port: salvaged, picked clean, paths through it. Far from it: untouched, jungle to the crowns.

## 2. The site at 1:1

From the 5.1 cut (`world/`, 500 m cells) and the frame's report:

- **The port third** stays where it is: the peninsula (4.7 x 1.9 km), the waterfront on its north shore (bearing -0.3 deg,
  22 m of water 250 m out). Kit frame: x along the coast, +z the sea (north).
- **The Sunk City**: the lagoon south of the spit, about x -3 to +1.5 km, z +1.3 to +6 km (world, from the pin): ~15 km²
  of -10 to 0 m water and a few dry '.' patches. Use about 4 km² of it (three times the port's footprint, with the scarp
  third).
- **The Scarp City**: the plateau's west face (x +1.5 to +2.5 km, z +1 to +6 km) and north face (z +1 to +2 km, x +2 to
  +6 km): steep (15-25 %), so the city is terraces and towers on pads, not a grid of lots.
- **The hook's shank** (the spit's west arm, `lf_hook_shank`) closes the lagoon's west side: the old city's sea wall.

## 3. The plan of the dead city

One Ancient grid over all three thirds, continued from the port's (`site/hook-site.json` `grid`: 110 m blocks, 20 m
streets, aligned to the waterfront), so the living town's streets visibly run on into the ruin:

- **The pier's axis** (the Hook's avenue, the port's main street) runs on south across the lagoon as the Sunk City's
  spine: a causeway with gaps, then the avenue's line under water, marked by tower rows.
- **The three Ancient roads out of Hook** (`openworld/net51-gemini.json`: to Pylon 208 km, to Torus 199 km, the Izani
  highway to Spirladunon 196 km; each starts with a causeway): their first kilometres are the city's own arteries, two
  across the lagoon on causeways and viaducts, one climbing the scarp in cuts and a tunnel mouth.
- **An elevated rail line** on a viaduct across the lagoon from the port's eastern quays to the scarp, its spans
  intact near the port, cracked mid-lagoon, collapsed into the water at the far end (`KTRANSIT.rail` elevated,
  `KTRANSIT.RUIN` shares by distance).
- **The funicular** the plan already wants (PLAN.md section 3; KNOWN_ISSUES "The funicular is not placed"), as a
  stump up the scarp from the port's east end to the upper city.
- **Ruin state by a field**: distance from the living port and from the transit lines sets each block's state (picked
  clean and lived-in at the edge, `broken`/`stump`/`skeleton`/`fallen` and `.wild` further out), as `AV.plan`'s ruin
  shares do in the Ancient's Valley (`biomes/ancientsvalley/src/41-av-field.js`).

The plan is **records first** (`[G data]`, every block, tower, span and heap with a stable id in `core/tags` before
anything draws; `KRAND` seeded by cell), so the same city can be drawn on Hook's page, in the open world and in Godot.

## 4. What each kit gives

**`kits/metropolis`** (`README.md`, `API.md`): sixteen designs (S1-S8 skyscrapers, M1-M8 midrises, every one with audited
interiors), thirteen `kits/ancients` builders run as heroes, the yards and eight Soleri farm families; seven ruin looks
(`intact gutted crown broken stump skeleton fallen`, `MP.ruin`, `MP.ruinDesign`), debris on KRUBBLE (`MP.debris`),
overgrowth (`MP.overgrow`, the `.wild` looks, `MP.sockets` / `MP.plant` handing sockets to a biome planter), and
KSHELL baked shells for the middle distance. It has **no placer**: the host places.
- The Sunk City: S5 Reed, S7 Stalk, S2 Organ as tall stumps and skeletons standing in the water; M4 Long Curve and M6
  Arcades as half-drowned crescents and colonnades; `fallen` towers as reefs.
- The Scarp City: M2 Terrace, M5 Terrarium, M8 Spiral on the slope, the Soleri farm families as overgrown terraces, an
  S1 Spindle or S6 Telescope on the crest as the city's landmark seen from the harbour.

**`kits/ancient-transit`** (`README.md`, `API.md`): `rail` (elevated), `highway`, `subway`, `line`, `network`, with span,
pier, rail, station and car ruin states and `overgrow` (0-2) writing plant records for the host's flora. The viaduct across
the lagoon, the highway up the scarp, a sunk subway station as a flooded pit, derailed and fallen cars in the water.
**It has no causeway form** (the network's causeways exist only as `core/world/42-world-roads.js` roads over water): the
lagoon causeways need one added to the kit.

**`kits/ancients`** (`README.md`, "Decay semantics"): the arcology and skyscraper builders at decays 1, 2 and 5 (worn,
with moss and vine traces), the five host types Hook already uses, the Pile's mega-block pattern (`targets/arcpile`) for
one great ruin on the scarp.

**The jungle**: `biomes/swbay` (the "hyper" zone to temple height; Hook's overlay is SW Bay) for the lagoon's swamp and
mangrove and the scarp's lower slopes, `biomes/hyperjungle` (Iziz's) for the canopy; the Ancient's Valley's feral
trees (`46-av-feral.js`), creepers (`71-host-creepers.js`) and roof trees are the worked example of a ruined city under
jungle at this climate. Flora kept off the living third by a mask, off cliffs (the no-trees-on-cliffs rule) and off the
water except mangrove.

**Rubble and ruins**: KRUBBLE heaps for fallen towers and the drowned blocks' rubble islands; **every ruin watched by
`core/ruins`** (`KRUINS.watch`, CLAUDE.md), which no metropolis host takes yet.

## 5. Drawing it: budgets and streaming

The port page today is 5.96 MB plus ~65 MB of texture sidecars, at the Port's 900-call showcase ceiling (this pass brought
the Heights view back under it by merging the town by material). A city three times larger cannot be one more layer on
that page. Proposed:

- **Range tiers** as the metropolis test bed defines them (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13):
  heroes within 300 m (about ten), KSHELL shells to 1 km, impostors (`BIO.impostor`) to 3 km, district bakes beyond.
  **District bakes and the visibility bake are not built**; the stopgap is the valley's "city below" prisms
  (`stations/terraces`, `70t`) for the far ruin.
- **Two pages, one record set**: the port page keeps today's scope and draws the ruin from the port (shells and impostors
  over the lagoon and up the scarp, heroes only at its edge); a second target, `targets/sunk-city` (or stations, as the
  Throne and the valley do), draws the ruin up close with the port as far shells. Both read the same `HOOK_RUIN` records.
- **Budgets**: a `BUDGETS.json` for Hook at the valley's level (1,200 calls, ~12 M triangles on the RTX/Arc lanes) for the
  ruin page; the port page stays at 900. The flora and the atlases count against the 16 MB page cap: the flora packs as
  sidecars, as the town's textures are.

## 6. Core adoption, and what does not exist yet

| Need | Today | Proposed |
|---|---|---|
| An Ancient city grid over all three thirds | `AV.plan` (the valley's, not shared), Hook's own `grid`, `KCITY.grid` | lift `AV.plan`'s lattice and ruin field into a shared step (core/city's Ancient-grid step, or a placer in `kits/metropolis`) and run it here; the owner's call where it lives |
| Placing metropolis heroes | no placer in the kit | a host fragment of Hook's, on `core/tags` records, as the valley's `88-host-build.js` |
| Shells | KSHELL inside `kits/metropolis` | take it from the kit; `core/shell` when it is lifted |
| Causeways | only core/world's roads over water | a `causeway` form in `kits/ancient-transit` |
| The network's records | `core/network` (KNET) approved, not built | lay Hook's three routes' first kilometres from `net51` directly, as data; move to KNET when it exists |
| District bakes | not built | the valley's far prisms as a stopgap |
| `KRUINS.watch` on metropolis ruins | no metropolis host takes it | Hook's ruin host takes it from the start |

## 7. Phases

| Phase | What | Done when |
|---|---|---|
| **M0** | The owner's answers to section 1 and section 8; the city's name in LORE.md | the questions closed |
| **M1** (done 2026-11-24: `src/77-hook-ruin.js`, `tests/test-hook-ruin.js`; README.md "Huka's ruin") | `HOOK_RUIN`: the Ancient grid over the lagoon and the scarp, the avenues continued, the ruin-state field, every block and tower a `core/tags` record; node test with negatives | records stable by id, the same in any order |
| **M2** | The Sunk City drawn: metropolis wild ruins standing in the water, fallen towers, KRUBBLE islands, `KRUINS.watch` | verify: nothing floats, every wreck seated, towers' feet under the water line |
| **M3** | The Scarp City: terraces and towers on pads, the crest landmark, the funicular stump | verify on the GPU; the scarp's pads within their batter |
| **M4** | The transit: the viaduct across the lagoon (ruin shares by distance), the highway up the scarp, the causeways (the kit's new form), cars in the water | the three routes' first kilometres laid; spans' states as planned |
| **M5** | The jungle: swbay swamp and mangrove, hyperjungle canopy, `MP.overgrow`/`MP.plant`, creepers; masked off the living third and off cliffs | the probe's no-trees-on-cliffs check; budgets met |
| **M6** | Tiers and pages: shells and impostors from the port, the ruin page, budgets, shots from the harbour, the lagoon and the crest | GPU verify on both pages; the owner's review |

Each phase is a session of its own; M1 first, since everything else reads its records.

## 8. The owner's answers (2026-11-24)

1. **Yes: Hook is the harbour third of the Ancient city, and the whole city is *Huka*** (the Hukoa's name for the port
   stands for all of it; the port is Huka's harbour). LORE.md's Hook entry to say so.
2. **The lagoon and the scarp**, as proposed: the Sunk City in the lagoon south of the spit, the Scarp City up the
   plateau's faces. No scale-model edit beyond the spit.
3. **The ruin's people: salvagers' camps, Hukoa stilt villages among the drowned stumps, and Hykkousoi pods on the
   towers that still stand.** Not shunned. (The Izani patrol its edge; the far ruin is the jungle's.)
4. **A gradient**: picked clean with paths near the port, wilder with distance, jungle to the crowns in the far lagoon
   and up the scarp.
5. **Two pages, one record set**: the port page draws Huka's ruin from afar (shells, impostors); a ruin page draws it up
   close with the port far.
6. **Built from Hook's plan**: the causeway form in `kits/ancient-transit`, the tower placer and `KRUINS.watch` for
   `kits/metropolis`, and the Ancient grid lifted out of the valley are made by Hook's phases, following each kit's
   rules (rebuild and verify what each change reaches).
7. **Start now, M1 only**: the ruin's records (no drawing) in a session of its own on the integration line, merged
   after Stage 8.

## 9. The layout redone: Alexandria in gross form (the owner, 2026-11-24, later the same day)

After M1's first layout (section 3: a Sunk City in the lagoon, a Scarp City up the plateau's faces) and a look at the
spit from above (three rectangles: blocky), the owner gave the plan of ancient Alexandria (Mahmud-Bey's, Wagner & Debes)
as the city's gross form:

1. **Names.** The whole city is still glossed as **Hook** (*Huka* is the Hukoa's word for it); the living town is
   **Port Hook**. It stands where Alexandria's **Island of Pharos and the Eunostos harbour** are: the spit and its harbour.
2. **The old city**, ruined and gone to jungle, is where **Bruchium and Rhakotis** are: on the mainland behind the
   harbours, one grid.
3. **A sunken peninsula** trails off from the intact part to the east and north-east: it once closed the **Great Harbour**
   into a lagoon. The islets the scale model already has off the spit's east end lie along it.
4. **A second sunken quarter** roughly where the **Nekropolis** is: south-west of the old city's western quarter, in the
   lagoon behind the spit.
5. **The land is reshaped to fit**, more than the spit (the owner: "we might need to do some more extensive land
   reshaping"). The answers to this session's questions:
   - **A raised coastal plain** for the old city: a low plain 2 to 3 km deep, 5 to 20 m over the sea, between the
     harbours and the plateau, the scarp pushed back; the plateau the city's hill behind it.
   - **Pharos an island**, cut off from the plateau at its east end and joined to the mainland by a built Ancient
     causeway (the Heptastadium); the Great Harbour and the lagoon meet through its arches.
   - **As Hook's own landform records** (core/world 41l benches with an outline: the spit's natural outline, 2026-11-24),
     so the page and the ruin's records build on them now; the same records go to the scale model's edit queue.
   - **M1 committed as the base**, its extents and quarters redone for this layout in the next change.

A sketch of this reading on the ground as it was: `shots/hook-alexandria-reading.png` (gitignored; made by this session's
scratch map). Sections 2 to 4 above stand where they do not contradict this one; the phases (section 7) keep their order.

## 10. The owner's own site plan (2026-11-24, later still): the redo

The owner sent a rough site plan of their own and said much of the above may be redone from scratch. **The proposal for it
is `plan/hook-site-plan.html`** (published to the owner as an Artifact, "Hook Site Plan"): the plan read back, the Ancient
city beside today's on two maps, a zone-by-zone comparison, thirteen hamlets, camps and posts in the environs, the plan
fitted onto the 5.1 ground (two placements, measured), what carries over, phases S0 to S6 and seven questions.

The plan in brief: **Port Hook** (the waterfront) was the port district of an Ancient city about 10 km across; the
**downtown** stood close to it, ringed by an **elevated freeway**; half the downtown **sank** (towers in shallow water,
mangroves); height and density **fade with distance from the downtown**; the freeway's standing south arc is the **one
clear approach** from the south; a **city wall** runs from the harbour to the freeway and closes the peninsula (the port,
its hamlets, ground cleared or reclaimed, ruin half decaying) off from the mainland; a **Hykkousoi fishing village in a
drowned tower** is the coast's smuggling haven.

Recommended placement: **B**, the plan turned 34 degrees so its waterfront lies on today's quays (Port Hook kept as built;
the wall on the spit's east end; the drowned downtown on today's lagoon). Open: the placement, the north ridge (it runs into
water 130 to 150 m deep), who built the wall, whether the freeway's west arc stands, the Drowned Spire's tower, the bay as
the harbour, the names. **Nothing is built for it yet**; the Alexandria landforms of section 9 (plain, strait, shelf) are
to be dropped when the redo starts, and M1's records redone on its field.
