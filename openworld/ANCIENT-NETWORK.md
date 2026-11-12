# The Ancients' network: roads, lines and tunnels as one picture (assessment and proposal, 2026-11-11)

**Status: a proposal. The owner answered its questions on 2026-11-11 (section 8), and the proposed network is drawn on
5.1 (`network-proposal/`). Nothing is built yet.** The rename of Cube to the Pile is applied to `LORE.md`, the two
network files and the karst and stations maps. No other session's files are edited.

This file pulls together three things:
- `ANCIENT-ROADS.md`: the highways, with the draft router;
- `ANCIENT-TUNNELS.md`: the bores and the caves they meet;
- the Line: the Rift line as a biome and a train (`biomes/line/PLAN.md` on `claude/awesome-varahamihira-66a852`, and
  `kits/tungang/PLAN.md` on `claude/tungang-fellgang-kits-a56ece`).

It sets them against scale model 5.1 and the transit kit (`kits/ancient-transit` on `claude/ancientsvalley-7f521c`). It
then proposes one record set for the whole network, which the model, the open world, the stations and Godot all read.

The two older files stay the source for what they settled. This one does not repeat them; it says how the pieces join.

- Every px is on the **5.1 canvas** (1821 x 1723, 2 km a px) unless it is marked *old*. 5.1 = old + (272, 330).
- *Proposed* marks everything not already settled by the owner.
- Section 7 holds the numbered questions.

**Why one file and not a fourth plan beside the others.** The roads, the tunnels and the Line are one system: "one broad
way with a guideway down its middle", whose underground stretches are the Line's gallery. Each plan so far has drawn its
own piece in its own record shape. This file is the join; the pieces keep their plans.

## 1. State

### 1.1 In lore (settled)

- **Mostly above ground.** Highways join **every arcology and every ruin**, and the cities on Ancient ground (Hook, Iziz,
  Yuni, Ys, Dalab, Roketstad, Verge). They pass under the mountains only where they must (`LORE.md` §4; `ANCIENT-ROADS.md` §1).
- **The profile.** One broad 30 m way with a guideway down its middle: road and line are one. The ruling grade is about 4 %,
  with no switchbacks: cuttings, viaducts, spiral tunnels and causeways instead (`ANCIENT-ROADS.md` §2).
- **The Rift line.** It runs **Dalab to Ledge, mostly underground**, and Ledge is where it comes out of the Wall. **The
  Pile** (once called Cube or Arccube; renamed by the owner, 2026-11-11) is the Rift's hub. The line "once ran the length of the Rift" (`LORE.md` §6.20), worked by the crews who became the
  Tungangs.
  - Its tunnel is a **four-track gallery**, mostly working, cut into segments by gaps that travellers walk (the owner,
    2026-11-10).
  - The Line is a **`line` kind in `KTRANSIT`**, and its cars live in `kits/motor-vehicles` (the owner, 2026-11-10).
  - **The Travellers** porter on its branches near the surface, never deeper in (the owner, 2026-11-11).
- **The Inner Wall tunnel** runs west from the crater to the Valley of the Ancients. It is in very bad condition, and it can
  be reached by shafts from surface settlements, one of them an Iron Republic arcology (name open).
- **The Stair tunnel** (Arcbeam to Stair in the Catch) was closed by an earthquake near the Cataclysm and is sealed halfway.
  Yuni stripped its northern half; the southern half, entered from Stair, is the divers' prospect.
- **Hub 01 to Yuni.** No human has reached Hub 01 since the Cataclysm and come back.
- **Pluton** (743,1328, 9,650 m) is the key to the Ancients' own tunnels up the Godthrone. They are not public and are
  uninhabitable now.
- **Xanadu's short line ends at Strongbow**, and the network there was never extensive.
- **Trickster's House** joins the network by one route only, to Verge, through a rim tunnel. The god's road through the Gate
  is a separate thing.
- **Span** (554,1010) has two Ancient tunnels (`settlements/span/PLAN.md`):
  - the **Basin Tunnel**, intact and cleared, a broad way with its guideway, 20 to 30 km, from the SW lowlands up to the plateau;
  - the **Valley Tunnel**, ruined and held by no one, toward the Valley.
- **Upkeep** comes from who kept a stretch. The Empire of Iziz, the Eternal State and the Cut road are kept; Voth, the
  Republic and Dilihan maintain what the Empire built; the rest of the former Empire has lapsed; Xanadu and Yuni keep theirs
  in part; everywhere else is badly decayed. **The land then sets how a stretch failed**: flood-scoured, buried under jungle,
  drifted with sand, broken at rivers, deleted at the Cut, intact on the airless rim (`ANCIENT-ROADS.md` §4).
- **Smaller Ancient transit inside sites.** None of this is the intercity network, but it shares the kit:
  - Verge's funicular (`kits/ancients` `FUNICULAR`);
  - Hook's town grid and its stair and funicular stump;
  - Roketstad's spaceport table;
  - the Valley's city: a street grid, an elevated highway, elevated and cargo lines, and a subway, all built on the
    transit kit.

### 1.2 On the scale model (5.1)

**The model has no network layer.** There is no `DATA.ancient_roads`, no layer on the page and nothing in
`extract_region.py`. `tools/scale-model/README.md` has listed the layer as "left for later" since 2026-10-23.

What exists is the second draft, made on 2026-10-26 by `tools/scale-model/ancient_roads.py`. Its output is
`openworld/ancient-roads-draft.json` and `.jpg`: **54 nodes, 63 routes, ~17,200 km, 241 km of it in tunnel.** It is drawn
on the **4.22 canvas and 4.22 heights**, and its routes are keyed by node **names**, not ids.

I shifted it to 5.1 and measured it against 5.1's heights and the settlements on `claude/openworld-sites-24defd` (the
script is in this session's scratchpad: `measure.py`, `lines.py`).
- Every node except Flooded Tower is still within 3 km of its settlement.
- The faults are in section 1.4.

**The tunnel lines, profiled on 5.1** (straight lines; the bores are the earlier plans'):

| Line | Ends (5.1 px) | Straight | On 5.1 | Source |
|---|---|---|---|---|
| **The Rift line**, bored | N portal 458.2,1158.6 (3,846 m, bore km 0, line km 94 from Dalab) to S portal 439.5,1309.5 (km 304); then 42 km on the surface to Ledge 437,1330 | 439 km Dalab-Ledge | 304 km bored. Cover is over 6 km for 36 km, peaking at 6,881 m at km 124. The rock is over 60 degC from km 57 to 201 | Line plan §1 (`survey_line.py`), agreeing with `ANCIENT-TUNNELS.md` §1 within 2 km |
| **Dalab's road** over the crest | tunnel portals 488,1220 (7,969 m) and 477,1245 (8,052 m), ~60 km under the airless crest (9,645 m at 483,1236) | 528 km Dalab-Ledge by Shelf | a separate road tunnel, 59 km east of the bore | `biomes/riftrim/PLAN.md` 5.1 survey (l.73-80); the Line plan §12 agrees |
| **The Inner Wall tunnel** | Drum 673,932; E portal 623,940 (3,758 m); W portal 553,952 (2,982 m); Dorado 483,964 | 385 km | crest 6,574 m at 597,945; 142 km bored under at most ~3.1 km. **Cascade is 214 km from this line, and Span 114 km** | `ANCIENT-TUNNELS.md` §1; measured here |
| **The Stair tunnel** | Arcbeam 1016,1058 to Stair 1106,1442 | 789 km | crest 8,292 m at 1063,1260 (20 km of it over 8 km). seouterwall proposes a 180 km base tunnel and a vent shaft, Bab al-Hawa (1033,1258) | `biomes/catch/PLAN.md`; `biomes/seouterwall/PLAN.md` l.157-166 (*proposed*) |
| **Hub 01 to Yuni** | Hub 01 1344,1409 (4,351 m) to Yuni 1263,1089 | 660 km | 357 km over 8 km; peak 13,327 m at 1310,1275 | `biomes/catch/PLAN.md` l.238 |
| **The Trickster's rim tunnel** | rim crossing ~1450,749 (*old* 1178,419), under ~9.8 km | 758 km to Verge | 140 km over 8 km on the straight line | `biomes/outlands/SURVEY.md` §7 (*old* px) |
| **Pluton's tunnels** (private) | Pluton 743,1328 (9,650 m) to the Godthrone's summit **861,1272** (24,822 m) | 261 km | a climb of 15.2 km (`godthrone/PLAN.md`'s "~15 km" holds) | `ANCIENT-ROADS.md` §3; `biomes/godthrone/PLAN.md` |

### 1.3 In the open world and the kits

- **The open world has no world-scale road layer.**
  - `core/world` (on `claude/openworld-sites-24defd`) keeps roads per region, in the region's own metre frame (origin = the
    cut's centre px, 2000 m a px).
  - A road record is `{from, to, hw, pts: [[x, z, e]...], length_m, maxGrade, cutMax_m, fillMax_m, ...}`. It reshapes the
    ground through a 1024 m cell hash (`RSEG`/`RHASH`, `WORLD.H` vs `WORLD.Hland`), and it is drawn only as the terrain
    shader's `aRoad` band.
  - It has **no per-vertex kind** (viaduct, tunnel and cutting cannot be said), a fixed 8 % grade, a fixed 8 m width and
    150 m reach, and no record that leaves its region.
  - Rivers are the one linear feature carried in from the model, and they are clipped to the cut's box with no seam vertex
    (`extract_region.py` l.1236-1258).
  - Sites are keyed by the model's settlement ids (`PLAN-SITES.md` §2), and every plan id starts with one. Edits as id-keyed
    deltas (`core/edits`, `openworld/<region>/edits.json`) are planned, not wired.
- **The transit kit** (`KTRANSIT`, `[G data]` records, drawn after) is built for a city.
  - It has: the road network (nodes, segments, kerb-line junctions, four kinds from a 26 m avenue to a 5 m lane, graded at
    8 %); the elevated highway (spans, piers, ramps, interchanges, ruin and overgrowth); rail at grade and elevated, with
    stations; the subway (20 m sections in ruin states, stations, sinkholes the host carves); trains (standing, derailed,
    fallen); street furniture; the war, the blockades and the quake.
  - Ids are stable and every choice is a `KRAND` hash of id and index.
  - The `line` kind (the four-track gallery, state per track and per 20 m section, gaps and segments derived) is **planned by
    the Line session**, not written.
  - The Valley takes the kit for its grid, highway, two lines and subway (its PLAN §14).
- **The vehicles kit's `ancient` culture** (`claude/ancient-vehicles-935f93`, unmerged) has the tram (`anc_tram`, a
  guideway car) and wreck forms for every vehicle. The Line's cars are planned there.

### 1.4 Gaps and contradictions

| # | What | Where (5.1 px) | Says what | Proposed resolution |
|---|---|---|---|---|
| G1 | **The draft is on the 4.22 canvas and heights**, keyed by names | `openworld/ancient-roads-draft.json` | every px is 272, 330 short of 5.1; Godthrone, Stalker Peaks and the Catch have changed under it | rerun on 5.1, keyed by settlement id (edit M1) |
| G2 | **Draft routes on airless surface** (over 8 km, not in tunnel) on 5.1's heights | the Pile (draft: Cube)-Pluton 221 km (peak 13,182 m); Hub 01-Yuni 147 km; Hub 01-Stair 99 km; Loj Twenny-Shelf 51 km; Trickster's House-Verge 40 km; Pluton-Shelf 15 km | the router forbids it (`ancient_roads.py` l.45), but the land rose after the run | rerun; question 4 decides whether an open way may run airless at all |
| G3 | **The Rift line in the draft is a surface road**: Dalab-Shelf-Loj Twenny-Ledge, 34 km in tunnel | Loj Twenny-Shelf crosses the crest at 9,718 m | settled as a ~304 km bore | pin the Line's alignment as an authored route; the router does not route it (M2) |
| G4 | **The Rift line past Ledge** | draft: Ledge-Chimes (163 km), Chimes-Cthonos (277 km, up to 2,313 m), Cthonos-The Tubes, The Tubes-the Pile | lore: it "ran the length of the Rift"; the Line plan numbers stations from the hub (the Pile 1, Chimes 2, Nulab 3, Ledge's lifts 4) | **answered**: one route `rift`, Dalab by Ledge, Nulab, Chimes and the Pile to Strongbow (section 8) |
| G5 | **Loj numbering**: "north to south" | `riftrim/PLAN.md` l.371-410, `LORE.md` §6.1 | the Line plan proposes numbering from the Pile north (its question 2) | the network takes whichever the owner chooses: station numbers are a field |
| G6 | **Loj Twenny's cave** | 457,1269 | riftrim and the tungang plan put it "on `tube_rift_08`", but that tube is at 628,1528-594,1558, 300 km off | the Line plan's side gallery from km 218 (25 km); its question 3 |
| G7 | **The Inner Wall tunnel's surface access** | Cascade 568,841 is 214 km from the Drum-Dorado line (the doc's "~140 km" was measured on the old line) | the draft found surface passes (Cascade-Drum, 6 km of tunnel) instead of the tunnel | pin the tunnel (M2); question 5 |
| G8 | **Span's tunnels are not in the draft** | Span 554,1010: the Basin Tunnel's lower portal is unplaced; the Valley Tunnel's portal is on the Deep Reach floor | span's plan says "the two Ancient highways meet on the Cross" | branch routes `span.basin`, `span.valley`; question 6 |
| G9 | **The Stair tunnel** | Arcbeam-Stair | the draft has an 860 km surface route with 16 km of tunnel; seouterwall *proposes* a 180 km base tunnel, the Bab al-Hawa shaft (1033,1258) and a surface highway through the Godsgate; catch has the caravans enter by the 6.2 km notch (*old* 726,896) | question 7 |
| G10 | **Xanadu's line** | Strongbow 1026,1594 to Theodiga 908,1535 (264 km, under 2,600 m); Theodiga to the Pile 381 km | the draft joins them; no doc says how Strongbow's line meets the rest, and the caravans use the Lasso pass (1040,1566) | **answered**: the Rift line's east end runs the Pile-Theodiga-Strongbow; it may go on from Theodiga to Stair and a Bowl arcology (section 8) |
| G11 | **Nodes the draft lacks or should drop** | new: Fort Ebon 695,782, Nulab 443,1359; in the valley plan but not in the model's source: Wheel 406,886, Thera 526,955; the three Zeijani caverns (876,802; 834,882; 806,818) and Dhelv would be picked up as "cavern" nodes | the draft skips only Dhelv | M1 |
| G12 | **Upkeep spheres by polygon name** | `ancient_roads.py` `UPKEEP` | names are stale: "Dalab Council" is now "Realm of Dalab"; "Dilihan Province", "Tungang Union", "Fellgangs" and "Shell Province" are unmapped; there is no "Beast Riders" or "The Cut" political polygon | M1, M3 |
| G13 | **Flooded Tower** | the draft end is 11 km off the node at 1028,840 | the node moved | M1 |
| G14 | **The airless rim** | `ANCIENT-ROADS.md` | §2: "crossable only in tunnel"; §4: the airless rim is "intact: the high stretches look new" | question 4 |
| G15 | **Old px in the docs** | `ANCIENT-ROADS.md` §3-4c, `LORE.md` §4 (the Pile "448,1237", Pluton "471,998"), `biomes/outlands/SURVEY.md`, `biomes/godthrone/PLAN.md` | old canvas | annotate 5.1 beside them when each is next edited (no edit now) |
| G16 | **The Godthrone's summit** | `tools/scale-model/README.md` 5.1 section: "Godthrone (px 968, 1012)" | 968,1012 is at -883 m on 5.1; the summit is **861,1272** (24,822 m) | M6 |
| G17 | **Name clashes** | Span's "the Line" (Dalab's salvage barricade, `span/PLAN.md` l.201, `TODO.md` l.64); swhighlands' "Drum" (a Vothic town) and "Cascade" (the Kaskejt Rivr) | the network uses the Rift line's id `rift` and the crater's Drum and Cascade arcologies | rename one side when its owner next edits (question 11) |
| G18 | **Modern links ignore the Ancient alignments** | iziz-cluster's links (Mav's Refuge-Girder 135 km, Girder-Talia 154 km at 8 %); the draft's Iziz-Stump, Fort Ordo-Stump and Stump-Verge meet at Stump (1044,952) inside that region's box | `ANCIENT-ROADS.md`: "modern highways prefer the Ancient alignment" | the corridor discount (section 2.3) |
| G19 | **Lines that end nowhere** | none in the draft but the intended ends (Strongbow, Trickster's House) and the north spur Leng-Tilted Tower-Veladiga (614,490 to 685,479) | | keep; question 9 confirms the northern ruins |

## 2. Representation

**One rule for every scale: the network is records, and a page or a region draws a window of them by chainage.** The
records are plain data (`[G data]`): ids stable, edits kept as deltas by id, no three.js or DOM. Godot reads the same
JSON, and `core/world` streams it.

### 2.1 The records (*proposed*)

```
network.json  (model px; one file for the world; deterministic from the model + the authored routes + edits.json)
  nodes:  [{ id, name, kind: 'site' | 'portal' | 'junction' | 'station' | 'shaft' | 'end', px: [x, y], sett?: <settlement id> }]
  routes: [{ id: 'rift' | 'innerwall' | 'r.<sett id>.<sett id>' | 'span.basin' ...,
             class: 'trunk' | 'branch' | 'line' | 'private',
             section: 'way' | 'gallery' | 'bore2' | 'road',          the cross-section family (2.2)
             tracks: n, from: nodeId, to: nodeId,
             px: [[x, y]...], s: [m...],                              global chainage in metres from `from`, at every vertex
             z:  [m...],                                              the graded floor
             datum?: { name, s },                                     a named zero (the Line's bore km: 'N portal', s = 94,000)
             forms:    [{ s0, s1, form }],                            open | cut | fill | viaduct | causeway | spiral | portal | tunnel | gallery | twin | junction | shallow
             cond:     [{ s0, s1, track | '*', state, depth? }],      section 2.4's vocabulary
             upkeep:   [{ s0, s1, sphere, keeper }],                  from the political polygons
             breaks:   [{ s0, s1, kind: 'gap' | 'deleted' | 'sealed' | 'collapsed', walk? }],
             stations: [{ id: '<route>.st<n>', s, num?, kind, state, loj? }],
             openings: [{ id, s, kind: 'portal' | 'adit' | 'shaft' | 'vent', to: [x, y, z]?, state }],
             joins:    [{ s, node }] }]                               where a route meets a node or another route
```

- **Global chainage is the key.** A station, a gap, a portal or a state run is placed by `(route id, s)`. Clipping a route
  to a region, a station or a settlement keeps its global `s`, so the same station is the same everywhere. Two regions meet
  at an exact seam point found by `s`, not by whichever vertex fell inside each box.
- **Runs, not per-vertex arrays.** `forms`, `cond`, `upkeep` and `breaks` are runs over `s`. The world's ~17,000 km is a
  few thousand runs. The Line's 20 m sections are derived inside a window, never stored for the world.
- **Derived, never written:** the segments and gaps of a line (the Line plan's rule), the junctions between routes, and
  the upkeep from the polygons.
- **Edits are deltas by id** (`network.edits.json`, replayed after the router):
  - `{op: 'add' | 'cut' | 'move' | 'set' | 'pin', id, ...}`: add a route, cut one, move a vertex by `s`, set a run, pin an
    authored alignment.
  - A rerun of the router keeps the owner's edits, and an added route moves no other route's id.
- **Authored routes are pinned.** The router does not route these: `rift` (from `survey_line.py`), `innerwall`, `stair`,
  `hub01`, `trickster.rim`, `span.basin`, `span.valley` and `pluton`. It routes only the open trunks and branches between
  nodes.

### 2.2 The cross-sections and what draws them

| `section` | What | Where | Drawn by (KTRANSIT) | In the kit today? |
|---|---|---|---|---|
| `way` | the 30 m paved way with its guideway(s) down the middle; at 4 %; cuttings, fills, viaducts, causeways, spiral tunnels; waystations and milestones | every open trunk and branch | **new: `KTRANSIT.way`**: a graded alignment (`road`'s cut-and-fill at 4 %) + the pavement + guideway beams on the `line` kind's track vocabulary; the viaducts reuse `highway`'s spans and piers (ruin, `cull`, overgrowth); the cuttings `lineH`; the portals `kits/ancients` `buildSpanPortal` | no: the road (8 %, 26 m at most), highway and rail exist; the way, the causeway and the portal piece are owed |
| `gallery` | the Line's four-track tunnel, 32 m x 13 m, its split bores, crossovers, hot doors | the Rift line underground | the **`line` kind** (the Line session) | planned (Line plan §4) |
| `bore2` | a twin-track bore, 10-14 m (`ANCIENT-TUNNELS.md` §2) | the Inner Wall, Stair, Hub 01, rim tunnels | the `line` kind with `forms: twin` and 2 tracks | planned through `line` |
| `road` | Dalab's road over the crest and its road tunnel; modern roads on Ancient alignments | riftrim, the reused stretches | `KTRANSIT.road` / `core/world` ROADS | yes |

*Proposed*: **one `line` record for every Ancient route, open or underground.** The `way` is the `line` kind's open-air
form, not a sibling kit. The Line plan's `forms` already lists `open`, so this is its record carried to the surface.

### 2.3 At each scale

**The scale model and the map.**
- `DATA.ancient_network` holds `network.json`, with a layer on the page (a new fragment beside `60-settlements.js`):
  - lines coloured by condition;
  - tunnels dashed, private tunnels hidden behind a toggle;
  - stations and portals as glyphs;
  - a hover readout giving the route id, `s` in km, form, condition and keeper.
- The layer is for the owner's review: trunks, branches, ends and conditions.
- Later, `core/minimap` and the game map draw the same records.

**An open-world region** (`core/world`).
- **The cut.** `cut_site.py` / `extract_region.py` write a region's network window into `region.json`:
  - each route's clipped stretch in region metres, with its global `s` at every vertex and the exact seam points;
  - its runs clipped by `s`;
  - the stations, openings and joins inside the box;
  - a corridor strip along every trunk (`cut_site.py corridor()` exists).
- **The ground.** The open forms become `WORLD_DATA.roads` entries with a **kind per run**. This needs three things in
  `core/world` `42`/`41`, all opt-in:
  - a road record's `runs: [{s0, s1, form}]`;
  - `bound()` skipping `viaduct`, `tunnel`, `gallery` and `portal` runs (no ground forced up to a deck or down to a bore);
  - per-road `hw`, grade and reach, in place of the constants.
  
  The 1:1 alignment is the model's, **refined inside its corridor and held to 4 %**, not re-routed. A tunnel carves nothing
  but its portals, its adits and the sinkholes over its collapsed shallow stretches (`KTRANSIT.sinkholeH`'s pattern).
- **The draw**, by distance:
  - the way's band in the terrain shader at range (`aRoad`, as roads now);
  - KTRANSIT meshes within ~2 km, built per 400 m chunk of `s` (the kit's `B.finish` chunks), streamed by the terrain's
    tiles through a per-tile index of `(route, s0, s1)`;
  - the viaducts' piers and the stations as far-tier instances;
  - a tunnel's inside only near a portal or for an eye underground: a station page, or a `KCAVERN` window.
- **Sites.** The stations, waystations and portals become sites keyed `net.<route>.st<n>`, beside the settlements' own
  sites, in `SITES.json`. Modern links (`KSITES` LINK records) prefer the Ancient corridor (a cost discount inside it), so
  the Ancient alignment shows through today's roads.

**A biome station or a settlement a line crosses.**
- The page takes the windows of the routes in its box, at their global `s`. For example:
  - `biomes/line --station bore` is the window `rift` 302-303.2 km (bore km 208-209.2);
  - Span's Basin Tunnel is `span.basin` from its upper portal down;
  - Ledge's terminus is `rift` at its lifts.
- A settlement's own street network joins a route at a junction node (`KTRANSIT.join`, as a highway ramp joins the
  Valley's grid).
- The record is the same on the page, in the region and in Godot. A page never invents an Ancient line of its own.
  The exception is the city-scale transit inside a site (the Valley's grid, subway and elevated lines; Verge's funicular;
  Hook's grid), which stays the site's own, registered under the site's id.

### 2.4 Condition: one vocabulary

The roads plan, the transit kit and the Line plan each have a list. *Proposed* mapping, with the network's `cond` the
first column:

| Network `cond` | `ANCIENT-ROADS.md` §4 | KTRANSIT (span / rail / subway / furniture) | The Line (track / section) |
|---|---|---|---|
| `intact` | intact (airless) | intact | built |
| `kept` | kept | intact + the keeper's dress | kept |
| `worn` | worn | cracked / bent | worn / cracked |
| `broken` | broken | collapsed / gone / bent | blocked / spalled |
| `buried` | buried | silted / overgrowth 2 | silted |
| `flooded` | (the tunnels') | silted | flooded (depth) |
| `cut` | gone | gone | cut / fallen |

- **The keeper's dress** generalises the Line plan's `kept` car state, "a culture's upkeep dress over another's vehicle",
  to the infrastructure:
  - Izani masonry spans on Ancient piers, waystations and milestones (the Empire);
  - the Eternal State's registered patching;
  - the Tungangs' lamp posts and number plates;
  - Yuni's partial repair.
- It is a `keeper` field on the upkeep run, drawn as a dress layer. The ruin is unchanged.

### 2.5 What the transit kit has, lacks, and where the network lives

- **It has:** records first; stable ids; KRAND choices; graded alignments; viaduct spans and piers with ruin and
  overgrowth; elevated guideways and stations; the subway's sections and sinkholes; trains in ruin states; furniture; the
  war and the blockades; the quake's shift; 400 m chunks.
- **It lacks:**
  - the `way` section;
  - the `line` kind (planned, not written);
  - a causeway;
  - a portal piece (`kits/ancients` has `buildSpanPortal`);
  - long-line windows by global `s` (its paths are page-local polylines);
  - kilometre LOD (shells or impostors for spans and stations at range: `KNOWN_ISSUES.md`);
  - the keeper's dress;
  - waystations and milestones;
  - walk floors on decks and platforms.
- **Where the world graph lives.** The world graph (nodes, routes, chainage, runs, deltas, windows, the per-tile index) is
  needed by:
  - `core/world` (streaming);
  - `core/city` (a settlement's join);
  - `core/simulation` (the riding plan's carriers; `SIM.trade` land carriers; `core/camp`'s caravans);
  - the stations;
  - Godot.
  
  That is infrastructure, not a kit's drawing. *Proposed*: **a small data-only core module, `core/network` (`KNET`)**:
  - the record schema;
  - `window(route, s0, s1)`;
  - `clip(box)`;
  - `at(route, s)`;
  - `nearest(x, y)`;
  - the derived segments and junctions;
  - the edit replay;
  - node tests.
  
  `KTRANSIT` keeps the drawing and the piece records it builds from a window. **I ask before planning it** (question 1;
  `README.md` "CORE MODULES ARE NOT OPTIONAL", `GODOT-PLAN.md` §6). The alternatives are a data side inside
  `kits/ancient-transit` (a kit that `core/world` would then depend on) or a layer of `core/world` (which the stations and
  settlement pages do not take).

### 2.6 Where this would change the other sessions' work

**The Line session** (`biomes/line/PLAN.md`):
- (a) Its `KTRANSIT.line` record becomes the network's route `rift`. Its chainage stays "km from the north portal" as the
  route's named `datum` (s = 94 km). Nothing in its station table moves.
- (b) Its `forms` gains the open-air forms (`cut`, `fill`, `viaduct`, `causeway`, `spiral`, `portal`; it has `open`).
  `tracks` and `cond` per track serve every route.
- (c) The Rift line continues past Ledge to Nulab, Chimes, the Pile, Theodiga and Strongbow (answered: section 8). Its
  numbering question (its question 2) is the owner's either way.
- (d) The window it builds comes from `KNET.window` rather than from `survey_line.py` direct. The survey becomes the
  authored alignment the model pins.
- (e) Its `kept` car state is proposed here as one case of the keeper's dress.

None of these changes its stations, its section, its train or the riding hook.

**The Tungang and Fellgang session** (`kits/tungang/PLAN.md`):
- (a) The Travellers' rule, "branches near the surface, not deeper in", becomes data: every `openings` entry and every
  branch run carries its cover. Their working ground is the stretches within a set depth of a portal or adit (*proposed*:
  under 500 m of cover, or within 5 km of an opening).
- (b) Loj Twenny's reach is the Line plan's side gallery (G6).
- (c) The Glaziers stay off the network: "a train that never comes" fits a line that ends at Strongbow down the valley
  (question 3).

**The transit kit and vehicles sessions:**
- the `way` section;
- windows by global `s`;
- a causeway;
- the portal piece;
- the keeper's dress.

Each is agreed with them before code.

**`core/world` (openworld-sites):**
- road runs by kind;
- per-road width, grade and reach;
- the network window in the cut;
- the corridor discount for modern links.

Each is opt-in, so a region without a network is byte-identical.

## 3. Edits the scale model needs (for the scale-model session to apply)

| # | Edit | Detail |
|---|---|---|
| M1 | **Rerun the router on 5.1** (`ancient_roads.py`) | Read `model/data` and the 5.1 settlements by **id**. Node types as now, minus the Zeijani caverns (Nūru-Šaplu, Qarnu-Tūbu, Šurpu-Dhelv) and Dhelv, plus Nulab and the cities on Ancient ground. Add Fort Ebon. Add Wheel and Thera once they are in the settlements (M4). `UPKEEP` keyed by polygon **id**, with Realm of Dalab, Dilihan Province, Tungang Union and Fellgangs mapped. Airless cells in tunnel only (or as question 4 decides). A finer climbing cost (`ANCIENT-ROADS.md` §4b). Write `network.json` in the schema of 2.1, not the draft's shape. |
| M2 | **Pin the authored routes** | `rift` (the Line's survey alignment, Dalab-Shelf-N portal-S portal-Ledge, then on per question 3); `innerwall` (Drum, 623,940, 553,952, Dorado; the access shafts per question 5); `stair` (sealed at its mid-point; per question 7); `hub01`; `trickster.rim` (re-surveyed on 5.1); `span.basin`, `span.valley` (once span places the Basin Tunnel's lower portal); `pluton` (private, a hidden layer). The router routes round them and joins them at their nodes. |
| M3 | **Upkeep polygons** | A polygon for the Cut road's corridor ("The Cut" is no political region), and one for the Beast Riders if their lapsed roads are to be told apart (no political polygon holds them). |
| M4 | **Settlements** | Wheel (406,886, ruined arcology) and Thera (526,955, ruin) from the valley plan's list, if the owner confirms they are on the shared store. The Ancient portals, stations and shafts go in `network.json`, not the settlements collection. |
| M5 | **The page layer** | `DATA.ancient_network` and a fragment drawing it (section 2.3), with its legend. `model/INDEX.md` and `BRIEF-GEMINI.md` updated. Publish the split copy as now. |
| M6 | **README fix** | the 5.1 section's "Godthrone (px 968, 1012)": the summit is 861,1272 (24,822 m). |
| M7 | **The cut** | `extract_region.py` and `cut_site.py` write the network window (section 2.3). Their tests take a region the network crosses. |
| M8 | **Retire the 4.22 draft files** | `openworld/ancient-roads-draft.*` replaced by `network.json` and its picture, or marked "4.22 canvas" in their names, so no one reads 4.22 px as 5.1. |

## 4. Phases

| Phase | What | Done when |
|---|---|---|
| N0 | The owner's answers (section 7); the Line, Tungang, transit, vehicles and openworld-sites sessions asked through the coordinator | the questions are answered |
| N1 | **`core/network`** (or wherever question 1 puts it): the schema, `window`, `clip`, `at`, the derived segments, gaps and junctions, the edit replay; the Line's survey imported as route `rift` | `node core/network/test-network.js` passes; the digest is stable; a window's `s` matches across two clips |
| N2 | **The model** (the scale-model session: M1-M6): the router on 5.1, the authored routes, the layer | the owner reviews the layer: trunks, branches, ends, conditions |
| N3 | **The cut and the ground** (M7; `core/world` road runs by kind) | a region's network window round-trips; the seam check passes on two neighbouring cuts |
| N4 | **The kit** (with the transit session): `way` on the `line` record, windows by `s`, causeway, portal, the keeper's dress, far-tier instances | `tests/test-transit.js` with the new kinds; the kit page shows a way in each condition and keeper |
| N5 | **The first region** (question 10) | GPU-verified on a lane: the way on the ground at 4 %, viaducts over the rivers, a portal |
| N6 | **The joins**: the stations and settlements a line crosses take their windows (Span's two tunnels, Ledge, Dalab, `biomes/line`'s stations from `KNET`) | each page's record digest matches the region's for the same `s` |
| N7 | **Godot**: an importer for `network.json` and the windows; **the simulation**: the network as carriers' routes (the riding plan's trains, `SIM.trade` land carriers, `core/camp` caravans) | the golden trace replays |

**Checks** (each with its negative control):
- `seam`: a route clipped by two neighbouring regions meets at one point within 0.1 m, with equal `s`. Negative: one box
  shifted 1 px.
- `grade`: every open run holds 4 % (spirals included). Negative: a vertex lifted 50 m.
- `air`: no open run over 8 km, unless question 4 allows it. Negative: an open run across the Stalker Peaks.
- `ends`: every route ends at a node or joins another. Negative: an end moved 3 km.
- `cover`: every tunnel run lies under at least 30 m of rock. Negative: a bore point raised over the ground.
- `stable`: an added route moves no other route's id, chainage or runs.
- `windows`: a station page's window equals the region's at the same `s`.

## 5. What this round did not do

- No edit to the scale model, `kits/ancient-transit`, `kits/tungang`, the Line's branch or any biome plan.
- No router rerun committed.
- The 5.1 measurements above were made in this session's scratchpad (`measure.py`, `lines.py`, `netdata.py`) and are
  quoted here.
- The settlements were read from the model's source on `claude/openworld-sites-24defd`. The shared store may hold more
  (Wheel and Thera, for instance), which this round could not read.

## 6. Hand-over

The notes folder of this session group carries `ancient-network.md`: the short version of sections 1.4, 2.6 and 7 for
the sessions named in 2.6.

## 7. Questions for the owner (answered 2026-11-11: section 8)

1. **Where the network's data lives.** A new data-only core module, `core/network` (`KNET`: the records, windows by
   chainage, clips, edits), which `core/world`, `core/city`, `core/simulation`, the stations and Godot take, with
   `KTRANSIT` drawing from it? Or keep it in `kits/ancient-transit`, or in `core/world`? *Recommended: `core/network`.*
2. **One record for every Ancient route**: the Line's `line` kind carried to the surface as its open `way` form (the
   30 m paved way at 4 %, with viaducts, cuttings, causeways and portals), so one code draws the Rift line and every trunk?
   And **how many guideways** does an open trunk carry: one (as "a guideway down its middle" says), or two, one each way?
   Does the Rift line's four-track width carry on the surface from its south portal to Ledge?
3. **The Rift line past Ledge.** Does one route run on from Ledge's lifts by Nulab and Chimes to the Pile, on the Rift floor or
   in tunnels along its walls? And east from the Pile to Theodiga and Strongbow, so Strongbow is literally the end of the line,
   the crews who came east came along it, and the Glaziers live just off its end?
4. **The airless rim.** May an open way run over 8 km (sealed cars; its stretches "look new", `ANCIENT-ROADS.md` §4), or
   only in tunnel (§2, and the router)? On 5.1 the draft's Hub 01, Pluton and rim routes would cross 15-221 km of
   airless surface.
5. **The Inner Wall tunnel's access.** Cascade is 214 km from the tunnel's straight line on 5.1. Should the tunnel bend
   north under Cascade? Should the Republic's arcology be a new site near the east portal (623,940)? Or does Span's
   Valley Tunnel (Span is 114 km from the line) join the Inner Wall tunnel as a branch?
6. **Span's tunnels.** Are the Basin Tunnel (to the SW lowlands, toward Dalab) and the Valley Tunnel part of a trunk
   Dalab-Span-Valley ("the two Ancient highways meet on the Cross")? Where is the Basin Tunnel's lower portal?
7. **The Stair tunnel.** Accept seouterwall's proposal: a 180 km base tunnel under the Godsgate, the Bab al-Hawa shaft
   (1033,1258) and a surface construction highway as the surviving way? Or keep it a tunnel only, with the caravans on
   the notch?
8. **The condition vocabulary** of section 2.4 (`intact kept worn broken buried flooded cut`), mapped onto the kit's and
   the Line's states, and **the keeper's dress** (Izani, Eternian, Tungang, Yuni upkeep drawn over the Ancient structure,
   generalising the Line's `kept` cars)?
9. **The nodes.**
   - Add Fort Ebon, Nulab, Wheel and Thera, and drop the Zeijani caverns?
   - Which other cities stand on Ancient ground (Voth, Jimjam, Dilihan, Theodiga's Xanadui)?
   - Are the tentative ruins (`ANCIENT-ROADS.md` §7.3) settled enough to route for good, or is the 5.1 run another draft?
10. **The first region to carry the network.** *Recommended*: **iziz-cluster** (built; three draft routes meet at Stump,
    1044,952, inside its box; the Empire's kept trunks; its modern links to bend onto the Ancient corridor). The
    alternatives:
    - the Rift line's north end, Dalab to the north portal (a city, a climb on spirals, a portal);
    - the Valley's edge, Span and the Inner Wall's west portal.
11. **Names.** Span's barricade is called "the Line", and swhighlands has a "Drum" and a "Cascade". Rename those, or the
    network's?

## 8. The owner's answers (2026-11-11) and the proposed network

### 8.1 The answers

| # | Question | The owner's answer |
|---|---|---|
| 1 | Where the data lives | **`core/network`** (`KNET`), a data-only core module; `KTRANSIT` draws from it |
| 2 | One record; guideways | **One record for every route; two guideways** down the middle of the open 30 m way, one each way; the Rift line's four tracks carry on from the south portal to Ledge |
| 3 | The Rift line past Ledge | **On to Strongbow** (by Nulab, Chimes, the Pile and Theodiga). **Cube is now canonically renamed the Pile**; conflicting docs fixed. Later the same day: **"the rail line might even extend from strongbow, to theodiga, to Stair, to an arcology TBD in the bowl"** |
| 4 | The airless rim | **Tunnel only** above 8 km |
| 5 | The Inner Wall tunnel's access | **Bend it under Cascade** (a shaft from the Republic's arcology down to the bore) |
| 6 | Span's two tunnels | **One trunk**: Dalab, the Basin Tunnel, Span, the Valley Tunnel, the Valley |
| 7 | The Stair tunnel | **Accept** seouterwall's proposal: the 180 km base tunnel, the Bab al-Hawa shaft (1033,1258), the surviving surface highway through the Godsgate |
| 8 | Condition and keepers | **Both**: one vocabulary (section 2.4) and the keeper's dress |
| 9 | Nodes | **Drop the Zeijani caverns and Dhelv.** **Forts are not on the Ancient highway by default**: Iziz may have built them near it for convenience; if not, an **Iziz-built highway network** joins them. **The same for ports.** **The major Eternian cities have an arcology or an Ancient ruin at their core** (nodes). **A rusted, stranded Ancient port or two on the dams' former shore** would be joined. **Extensions into the new west and north** are likely (their lore mostly to come). **Theodiga's Xanadui** are a node. "Show me a pic of the network you propose": `network-proposal/ancient-network-proposal-5.1.jpg` |
| 10 | The first region | **iziz-cluster** |
| 11 | Names | **Rename the local ones**: Span's barricade ("the Line"), the SW highlands' Drum and Cascade |

### 8.2 The network as proposed on 5.1

`network-proposal/` holds the picture, `net51.json` and the router (`route51.py`, read-only on the model; its README says
how to rerun it). It is the draft that the scale-model session's router (M1) is to reproduce and improve, and the owner's
reference until the model carries the layer.

| Class | Routes | km | in tunnel | What |
|---|---|---|---|---|
| **The lines** (pinned) | the Rift line (11 legs), the Inner Wall, the Stair line | 3,449 | 1,216 | below |
| **The Twenny gallery** | 1 | 25 | 14 | the Line plan's branch from bore km 218 |
| **Trunks** (routed) | 54 | 14,014 | 1,667 | a relative-neighbourhood graph over the Ancient cost among 55 sites |
| *Possible* | Strongbow to Stair | 344 | 329 | the Line session's bore under the Catch's walls; then on along the Stair line to the Bowl arcology |
| *Izani roads* (not Ancient) | 8 | 732 | 54 | the forts and the ports, each to its nearest network site |
| *Extensions* (lore to come) | 3 | 1,699 | 318 | toward the Ria valley, Farport and the Crook, the Silent Vales |

**Totals (lines, gallery and trunks):** 17,488 km, 2,897 km of it in tunnel. **No open stretch runs over 8 km.** The
picture and the numbers follow section 8.6, which reroutes the Rift line by Cthonos and The Tubes and moves the
possible leg to Strongbow-Stair.

**The lines.**
- **The Rift line**, Dalab to Strongbow:
  - Dalab to Shelf: 99 km, 18 km of it in tunnel (the Line plan's spirals under Shelf);
  - Shelf to the north portal: 7 km;
  - the bore: 304 km, on the Line plan's survey alignment;
  - the surface to Ledge: 41 km;
  - Ledge's lifts down to the lake, then on to Nulab: 59 km;
  - Nulab to Chimes: 92 km;
  - Chimes (6) to Cthonos (7): 278 km, 89 km of it in tunnel;
  - Cthonos to The Tubes (8): 221 km;
  - The Tubes to **the Pile** (9): 292 km, round the Rift's lake (a straight 154 km across it would be the elevated
    crossing of 8.6; this is follow-up question 7);
  - the Pile to Theodiga (10): 424 km;
  - Theodiga to Strongbow (11): 296 km;
  - *possibly* Strongbow to Stair (12): 344 km, 329 km of it bored; then along the Stair line to the Bowl arcology (13).
  
  The numbers are the Line session's (8.6).
- **The Inner Wall tunnel**, bent under Cascade: from Drum, under Cascade, to the Valley at Babel, 539 km.
  - *Proposed*: a level bore at 2,400 m, giving 179 km of tunnel.
  - Cascade stands 382 m over the bore, so the arcology needs only a short shaft.
  - The Valley end moves from Dorado to **Babel**, the Valley's nearest arcology after the bend. The Valley trunk goes on to
    Dorado.
- **The Stair line**: Arcbeam, the Bab al-Hawa shaft and Stair, 797 km.
  - The base tunnel is a level bore at 4,969 m under the Godsgate's shoulder, 180 km long.
  - The approaches add 147 km of shorter tunnels.
  - It is sealed halfway (canon). The **Godsgate highway** (Arcbeam to Stair, routed as a trunk) is the way that survived.
- **The Span trunk**: Dalab to Span (the Basin Tunnel's way up), then Span to Thera (the Valley Tunnel down to the Valley's
  eastern rampart).

**The nodes** (55 sites):
- **Every arcology and Ancient ruin**, except the forts (Fort Ebon, Fort Kalor, Fort Kreia, Fort Ordo, Fort Vaklu), the
  Zeijani caverns and Dhelv.
- **The cities on Ancient ground**: Hook, Iziz, Yuni, Ys, Dalab, Roketstad and Verge.
- **Nulab**: the Line's station on the lake.
- **Lux**: the one major Eternian city on the model. Centrum and the Sanctum are not placed, and Farport is a port.
- **Wheel and Thera**, from the valley plan.
- **Two stranded Ancient ports** (*proposed*), one on each dam lake's former shore:
  - the east dam's lake (1,050 m) at 723,450;
  - the west dam's lake (900 m) at 631,454.
  
  Each is the shore point nearest an Ancient site (Veladiga, Tilted Tower).
- **A Bowl arcology** (to be named and placed), provisionally at 1024,1149, where the Stair line crosses the Bowl. The
  line's possible extension then runs from Strongbow to Stair, and north along the Stair line to it.

**The Izani roads.** These are an Iziz-built network, not Ancient (`class: 'izani'`). They are drawn with `KTRANSIT.road`
or `core/world` ROADS, not as the way.

| From | To |
|---|---|
| Fort Ebon | Tethis |
| Fort Kalor | Hexahedron |
| Fort Kreia | the Sleeping City |
| Fort Ordo | Flooded Tower |
| Fort Vaklu | Iziz |
| Port Tobin | Iziz |
| Port Goto | Shell |
| Port Visas | Ys |

A fort that Iziz built *beside* the Ancient way needs a node on the route at its `s` instead of a road. Which forts those
are is the owner's call.

### 8.3 What the answers change in this proposal

- **Section 2.5**: `core/network` is settled. Its plan is the next piece of work (phase N1), agreed module by module.
- **Section 2.2**: the `way` carries **two guideways**. The Rift line's surface stretch to Ledge keeps the four-track
  section.
- **The `izani` class** joins the record set: a route class drawn as a modern road, its keeper the Empire.
- **Section 3, the scale-model edits**:
  - **M1** takes the node rule of 8.2: forts and ports leave the Ancient set and are joined by Izani roads; Lux, the docks
    and the Bowl site are added.
  - **M2** pins:
    - the Inner Wall tunnel, bent under Cascade and ending at Babel;
    - the Stair line by Bab al-Hawa, with the Godsgate highway;
    - the Span trunk;
    - the Rift line to Strongbow;
    - the possible Theodiga-Stair leg, as a hidden layer.
  - **M9 (new)**: rename the settlement "Cube" to **"the Pile"**, keeping its id, in `60-settlements.js` and in the shared
    store. Do the same in the regions' copies of the settlements (`source/settlements.json` in `openworld/isle-demo`,
    `north-basin`, `longsong` and `pinnacle-rock`) when each is next refreshed.
- **Phases**: N0 is done. **N5's first region is iziz-cluster.**

### 8.4 The rename, and the files other sessions own

**Renamed on this branch:**
- `LORE.md`;
- `openworld/ANCIENT-ROADS.md` and `openworld/ANCIENT-TUNNELS.md`;
- `biomes/KARST-SITES-5.1.md` and `biomes/STATIONS-MAP-5.1.md`.

In each, the first mention keeps "formerly Cube or Arccube".

**Left to their owners**, because each has newer work on a branch or is data rather than a doc (the coordinator relays):
- `biomes/riftrim/PLAN.md` and `biomes/rift/PLAN-STATIONS.md`: rift-hearths-cavern's branch edits riftrim.
- The rift stations' map labels: `biomes/rift/stations/plateau/45m-host-map.js`, `85-host-tower.js` and
  `44s-host-station.js`, and `biomes/rift/stations/jungle/45m-host-map.js`.
- The tungang plan, on its branch. (The Line plan is renamed: `claude/awesome-varahamihira-66a852`, after bcb6a2438.
  It cites this routing, the datum and the way, trestle and service-bore sections in its section 2.2.)
- The tongues page's Tungang word for it, *Tkyoob* ("the cube"). That is the Tungang session's, and a new word is wanted.
- The model's settlement name (M9).
- `HANDOFF-REBUILD.md` is a record and stays as written.

**The local name clashes** (question 11) go to Span's and the SW highlands' sessions: Span's barricade "the Line", and
swhighlands' Drum and Cascade.

### 8.5 Follow-up questions

1. **The Bowl arcology**: its name, and its place (provisionally 1024,1149, on the Stair line). With the extension, the
   Rift line would reach the crater by Stair and the sealed Stair line. Is that ring intended, or does the line stop at the
   Bowl?
2. **The Rift line east of Chimes**: the router keeps it mostly on the Rift floor (135 of the 712 km to the Pile in tunnel).
   Should the stretch through the Lizardmen's country be underground, given the tunnel wars?
3. **The Eternian cities**: Lux is the only one on the model. Where do Centrum and the Sanctum go? Is Farport joined by an
   Eternian road, as a port would be?
4. **The forts beside the way**: which of the five forts did Iziz build on the Ancient way, so that they take a node on the
   route instead of an Izani road?
5. **The stranded ports**: are 723,450 and 631,454 right, or should they move to where the old lakes' Ancient towns stood?
6. **Wheel and Thera** are on the valley's list but not on the model. Should they be added to the settlements (M4)?
7. **The Rift's lake**: does the line cross it on the elevated corridor (154 km straight, The Tubes to the Pile), or go
   round it (292 km, the router's)?

### 8.6 The Line session's decisions (the owner, 2026-11-11, relayed by that session; `biomes/line/PLAN.md` 0744edac0)

1. **Station numbers, north to south**:
   - the main stations: 1 Dalab, 2 Shelf (the north mouth, at the top of the spirals inside the Wall), 3 the Twenny
     junction (bore km 218), 4 Ledge's lifts, 5 Nulab, 6 Chimes, 7 Cthonos, 8 The Tubes, 9 the Pile (Loj Nahn);
   - other stops are lettered halts (2a, 2b);
   - past the Pile, *proposed*: 10 Theodiga, 11 Strongbow, 12 Stair, 13 the Bowl's arcology.
   
   This settles G5. The `rift` route's `stations[].num` takes these numbers, and the route runs by Cthonos and The Tubes,
   as now drawn.
2. **The extension**: "the line might connect to strongbow, theodiga, and all the way to Stair and an arcology to be
   placed in the bowl maybe". It is drawn as Theodiga-Strongbow (line), then Strongbow-Stair, the Line session's straight
   bore (*possible*), then the Stair line to the Bowl.
3. **"Where the network runs aboveground, we should have an ancient highway running alongside it. In places of rough or
   boggy terrain, the whole network may be elevated like louisiana highways."** This changes section 2.2:
   - **The `way` section becomes a corridor**: the guideways (two on a trunk, four on the Rift line) with **a 30 m
     highway alongside**, about 45 m wide on a trunk and 70 m on the Line.
   - **Over bog and water the whole corridor is elevated**: twin low decks 8-15 m up on paired pier bents every 30-40 m,
     for tens of km (the Atchafalaya Basin Bridge). This is a new form, **`trestle`**, beside `viaduct` (a high crossing of
     a valley) and `causeway` (an embankment).
   - In the transit kit, the trestle is `highway`'s spans and piers set low and paired. The highway alongside is the
     `road` kind at 4 %.
   - The causeway class in the picture marks where a trestle is likely.
4. **"A smaller access road along the underground portions"**: the Line plan has it as a 6.6 m two-lane service road
   along the gallery's west wall, with a 7 m service bore between twin bores, joining the highway at the mouths.
   - The network takes it for **every tunnel run**: the bores of the Inner Wall, Stair, Hub 01 and rim tunnels as much as
     the Line's.
   - It is drawn by the `line` kind; it is not a separate route.

### 8.7 The owner, later on 2026-11-11

1. **Izani highways join Iziz's settlements, especially in the heartland.** In some cases a settlement may be **moved onto
   an existing highway**. The `izani` class grows from the forts and ports to the Empire's towns.
2. **The Bowl arcology lies further south**, on the most temperate ground near the Godsgate. **No tunnel to Arcbeam**
   (clarified in 8.8: the Stair tunnel is dropped).
3. **Quintagon**: a new arcology in the lands north-east of Verge, in the eastern badlands (`e badlands`, `rmuqm20f95x4v`).
4. **The road to Trickster's House** does not go straight through the mountains. It winds east from Yuni, then curves
   round through the Loom-Chasms (`rmvraoas90co7`) and the Great Chasm (`rmw4vh9t20da4`). This replaces the draft's rim
   tunnel at ~1450,749.
5. **Another highway runs through the Outland Gate** (`rmvoutlandpass`, the Gate at 1438,326). It splits off to an Ancient
   site, still to be placed, in Korona (`Korona / NE`, `rmuqm3urh0mo6`), running through the Tiers (`rmucfm4y5yd6y`).

### 8.8 The follow-up answers and the last decisions (2026-11-11)

**Follow-ups:**
- **The Bowl arcology** goes at **970,1186**: the Bowl's most temperate ground near the Godsgate (15 degC mean, 1,716 m,
  314 mm of rain).
- **"No tunnel to Arcbeam" means: drop the Stair tunnel.** There is no Ancient tunnel from Arcbeam to Stair at all.
  - Stair is reached by the Rift line's possible leg from Strongbow, and by the surface trunks.
  - This changes canon in `LORE.md` §4 (the Catch: "the Ancients' tunnel to Stair ... sealed halfway", the divers'
    prospect), `biomes/catch/PLAN.md` and `biomes/seouterwall/PLAN.md` (the base tunnel and Bab al-Hawa). I have not
    rewritten those yet (follow-up question 1 below).
- **Quintagon** goes at **1349,830** (2,320 m, 14 degC, 376 mm, 289 km from Verge).
- **The Outland Gate highway** runs from the Outlands (Trickster's House) north through the Gate to the Ria valley. It
  splits at the Gate, and the branch runs south-west through the Tiers to the Korona site.
- **The Korona site** is *proposed* at **1135,466**: level ground in Korona beyond the Tiers, 2,927 m, 12 degC.
- **The Rift line through the Lizardmen's country** (Chimes to the Pile) is **underground**, with surface stretches where
  the tunnel wars broke it open (to be authored).
- **The Rift's lake**: the line goes **round** it.
- **Moving towns onto the network**: list the candidates. Only **Talia** (1073,939) lies within 10 km of an Ancient route
  without being on it: 6.3 km, toward 1072,936. It is the one candidate.
- **The forts beside the way**: **Fort Kalor, Fort Kreia and Fort Ordo** become stops on the Ancient routes. Fort Ebon and
  Fort Vaklu keep Izani roads.
- **Centrum and the Sanctum**: the scale-model session places them as Eternian nodes (edit M10). Farport gets an Eternian
  road.
- **The stranded ports** stay at 723,450 and 631,454.
- **Wheel and Thera** are added to the model (M4).

**Decisions:**
- **Noa's Regret is not on the network.**
- **The Izani highways.** Iziz built highways during its rule:
  - to **Pinnacle Rock, Girder, the Hykkousoi cities** (the League of Amphitriton's: Tethis, Kierson, Nereus, Pontus),
    **Shim, Kautoa and Nusidi**;
  - and its network **joins each node to several nearby cities**;
  - and **an Izani highway runs to Jimjam through Dilihan, and from there east into the anarchic frontier**, less well kept.
  
  The router builds them at 8 %, with no tunnels and bridges only where a road must cross water. Each is a
  relative-neighbourhood graph plus every town's two nearest, minus the pairs an Ancient trunk already joins. The northern
  highway runs Iziz, Dilihan, Jimjam, Shell, Crescent, and is drawn lapsed beyond Jimjam.
- **The Vothic highways**: "new, less elaborate highways between its major settlements". These are the Vothic Kingdom's
  cities and arcologies (Voth, Almua, Shim, Zey'danin, Drum, Torus, Wing), meshed the same way, as a `vothic` class.

**The network now** (`network-proposal/`, regenerated):

| Class | Routes | km | in tunnel |
|---|---|---|---|
| Lines: the Rift line (11 legs, Dalab to Strongbow) and the Inner Wall | 12 | 2,652 | 1,503 |
| The Twenny gallery | 1 | 25 | 14 |
| Trunks, including the road to Trickster's House (2,084 km by Yuni, the Loom-Chasms and the Great Chasm) and the Outland Gate highway with its Korona branch | 59 | 17,847 | 1,793 |
| *Possible*: Strongbow, Stair, the Bowl arcology | 2 | 978 | 524 |
| *Izani highways* | 38 | 9,312 | (bridges only) |
| *Vothic highways* | 5 | 1,375 | (bridges only) |
| *Extensions* (west, south-west) | 2 | 851 | 235 |

The Ancient network is 60 sites and 20,524 km, 3,310 km of it in tunnel, with no open stretch over 8 km.

**New scale-model edits:**
- **M10**: place Centrum and the Sanctum. Add Quintagon (1349,830), the Bowl arcology (970,1186) and the Korona site
  (1135,466) as settlements, named when the owner names them.
- **M11**: retire the Stair tunnel. Drop Noa's Regret from the node rule.

**Bore geometry: unchanged.** Mouths at 458.2,1158.6 (3,614 m) and 439.5,1309.5 (3,501 m); 304 km bored; the hot
section at bore km 55-203; 42 km on the surface to Ledge. This routing moves none of it.

### 8.10 The owner, 2026-11-11 (the last round)

**Decisions:**
- **The Izani frontier highway** does not run straight from Jimjam to Shell.
  - It goes round through the north basin where the other former lakebed lies (the east dam's lake).
  - It passes **an abandoned Ancient port** on that old shore (**Old port (north basin)**, 907,415).
  - It leads on **through northern Korona to the Ancient facility**, crossing scenic bridges over the tepui and Arachnoid
    gorges.
- **The Korona facility is the Pit** (1135,466, proposed place).
- **A trade highway from Jimjam to Lux**, spottily kept: class `trade`.
- **Spirladunon** (800,1017) is a node on the old Izani highway.
- **Yuni roads to Mungo and to Mantis**: class `yuni`.
- **Dalab's dirt roads** between its settlements: Dalab, Daranch, Blade, Span and Shelf.
- **Amaro**, Shumar's capital, and **Driyan** lie on the Ancient highway. *Proposed* places:
  - Driyan at 596,1068, on the lakeshore on the Nazar-Wing trunk.
  - Amaro at 652,1266, on the Dalab-Pluton trunk. That is the trunk's nearest point to Shumar: no Ancient route now
    crosses Shumar, so this is follow-up question 6.
- **Talia moves** onto the Ancient trunk, 6.3 km, from 1073,939 to 1072,936 (edit M12).
- **The Hykkousoi cities** are the League of Amphitriton's towns: confirmed.
- **The Beast Riders' sites** (Mav's Refuge, Pinnacle Rock, Girder, Talon) are joined by **undergrowth trails**, and each
  trail also leads to the nearest Ancient highway (class `trail`).
- **Modern highways and trails join the Ancient network where it is close.** The router adds a spur from any town within
  40 km of an Ancient route.
- **Temora and Zey'danin** on the Throne's shore have **their own Vothic highway, not joined to the mainland**. A **dirt
  path** links it to **Nereus**, the Hykkousoi town to their north-west.
- **Izani highways to Cascade** from Drum and from Pontus.
- **No route between Theodiga and Pluton.**
- **Farport is an Ancient node.** Part of its plateau is hollowed out as an Ancient storage depot; the Ancient port it
  served was washed away long ago. The west extension is now a trunk, Farport to Fulcrum.
- **A dirt road from Pinnacle Rock to Coyote Canyon** (1265,500), by the basin where it can.
- **Roads favour the lowland path**, the road from Trickster's House to the Outland Gate included. Every route's surface now
  costs more the higher it runs above 1,500 m.
- **An Izani road from Mantis to the Bowl arcology.**

**The network now:**

| Class | Routes | km | in tunnel |
|---|---|---|---|
| Lines (the Rift line, the Inner Wall) | 12 | 2,655 | 1,510 |
| The Twenny gallery | 1 | 25 | 14 |
| Trunks | 59 | 18,408 | 1,884 |
| *Possible*: Strongbow, Stair, the Bowl | 2 | 1,070 | 499 |
| *Izani highways* | 47 | 11,234 | (bridges only) |
| *Trade highway*, Jimjam to Lux | 1 | 583 | |
| *Yuni roads* (Mungo, Mantis, a spur) | 3 | 1,036 | |
| *Vothic highways* | 6 | 1,186 | |
| *Dirt roads* (Dalab, Nereus, Coyote Canyon) | 5 | 1,222 | |
| *Beast Rider trails* | 7 | 576 | |
| *Extension* (south-west) | 1 | 982 | 50 |

The Ancient network is 62 sites and 21,088 km, 3,408 km of it in tunnel, with no open stretch over 8 km.

**Scale-model edit M12**:
- move Talia to 1072,936;
- add Amaro and Driyan;
- add the north-basin port;
- rename the Korona site to **the Pit**;
- mark Farport's depot in its notes.

### 8.11 The Bowl arcology: a design proposal

The owner: "Bowl will be a new arcology; propose me a design."

**The site:**
- 970,1186, on the Bowl's south-western rim near the Godsgate;
- 1,716 m, 15 degC mean, 314 mm of rain: temperate, dry, windy;
- below it, the Bowl's hot salt floor and Mantis's oasis.

**Its place on the network:**
- *possibly* the Rift line's last station (13), at the end of its leg from Stair;
- the Godsgate highway;
- the Izani road from Mantis.

The existing targets in `kits/ancients/targets` are hill, ring, spire, wheel, lozenge, monolith, lighthouse, crescent,
canyon, forest, blades and the rest. None is a dish, so the recommended form is new.

**Chosen by the owner (2026-11-11): A, Parabola.** The Bowl's arcology is **Parabola**. The name was the working name
that came with the design, so it stands unless the owner renames it. The router and the picture carry it at 970,1186 as
the Rift line's possible station 13.

**A. Recommended: Parabola** (working name; others: the Dish, the Lens). A city that was a solar furnace.

| | |
|---|---|
| Form | a **terraced paraboloid**: a dish about 1.8 km across the rim and 320 m deep, tilted about 30 degrees to face the noon sun, standing on **three Cyclopean piers** on the rim's slope. Its inner face is stepped terraces. Its outer face is the Ancients' white seamed shell on great organic ribs (Soleri, Gaudi), with bronze bands where the ribs land on the piers |
| The focus | a **receiver** on a tripod mast over the dish: a sphere of bronze and blue glass that gathered the light of the dish's mirrored terraces. It was the city's power and its emblem |
| Inside | the terraces are dwellings behind glazed fronts, with farm terraces on their roofs, all facing the focus. The cyan strips run along the terrace edges. At the dish's lowest point, inside the shell, is the **terminus hall**, where the Rift line would end (station 13) and the Godsgate way arrives |
| People | about 120,000 as built, of the Pile's order (153,700) |
| Ruin | most of the mirror panels have fallen and glitter in the scree below. The receiver is cracked and leaning in its mast. A quarter of the shell on the windward side is down. The lower decks are drifted with Bowl sand. The inner terraces have gone to wild orchard and garden in the mild climate. **Rain gathered by the dish has made a lake at its bottom**, the only standing fresh water for a day's march |
| Now (*proposed*) | an Izani customs post and caravanserai at the terminus hall, since the Izani road from Mantis ends there. Yuni and Izani prospectors work the mirror scree for Ancient glass. The receiver is a prize no one has reached: the mast's stairs are gone |
| The delve | down the terraces to the lake, and up the mast to the receiver |
| Build | a target `kits/ancients/targets/parabola` on the Pile's pattern: the plan as `[G data]` records (terraces, piers, ribs, the mast, the hall), ruin deltas by id, `KTAGS` registered, a blueprint folder of sheets |

**B. The Escarpment**: an arcology stepped down the Bowl's south wall in long terraced bands, like Ledge but horizontal,
looking north over the salt lake. It is quieter, and it reads as part of the rim.

**C. The Gnomon**: a single leaning blade of a tower, 900 m high. Its shadow on the Bowl's floor was the Ancients'
calendar, and the floor is still marked with the hour lines. It is striking, but it is close to `blades` and `spire`.

### 8.12 Still open

1. **The Bowl arcology**: answered. It is **Parabola**, design A. Building it is a task of its own: a target in
   `kits/ancients/targets/parabola` on the Pile's pattern, with its blueprint. The scale-model session adds it to the
   settlements as an arcology at 970,1186 (M10).
2. **Amaro**: should an Ancient route cross Shumar (the Wing-Pluton trunk through the plateau), with Amaro on it, or does
   Amaro sit at the Dalab-Pluton trunk's nearest point (652,1266)?
3. **Driyan's place** (596,1068): right?
4. **The Pit's place** (1135,466): right?

### 8.13 The owner, 2026-11-11 (corrections round)

**No modern road where a decent Ancient one serves.** A meshed Izani, Vothic or Dalab road is now dropped when more than
half of it runs within 8 km of an open Ancient route. The roads the owner named are kept.

These were dropped:

| Network | Roads dropped |
|---|---|
| Izani | Arcbeam to Port Tobin; Pontus to Tethis; Stump to Talia; Talia to Verge; Trigon to Port Visas; Ys to Port Visas; Girder to Nusidi |
| Vothic | Drum to Torus; Torus to Voth |
| Dalab dirt roads | Dalab to Daranch; Blade to Span |

Both of Dalab's dirt roads ran beside the Ancient trunks, so Dalab now has none of its own (follow-up question 5).

**Other changes:**
- **Shim's Izani highway** goes to the nearest Ancient road (71 km) and to Driyan (168 km), not to Wing.
- **The Yuni road to Mungo passes through Locus** (615 km).
- **The north basin highway is Ancient**, not Izani: the east dam port, the north basin port, northern Korona, the Pit
  (938 km, a trunk). **An Izani road leads from Jimjam to it** (238 km, less well kept).
- **No Tethis-Nereus road.**
- **Serai** "falls along the lake and on the highway". The nearest lakeside point on any highway out of Jimjam is
  842,412, by the north basin's remnant lake. That is **136 km** from Serai's place now (826,478), which is too far to be
  a move. Which lake is meant is follow-up question 6.

**The network now:**

| Class | Routes | km | in tunnel |
|---|---|---|---|
| Lines | 12 | 2,655 | 1,510 |
| The Twenny gallery | 1 | 25 | 14 |
| Trunks | 60 | 19,346 | 2,103 |
| *Possible*: Strongbow, Stair, the Bowl | 2 | 1,070 | 499 |
| *Izani highways* | 38 | 8,365 | (bridges only) |
| *Trade*, Jimjam to Lux | 1 | 583 | |
| *Yuni roads* | 3 | 1,037 | |
| *Vothic highways* (the Temora-Zey'danin one included) | 3 | 647 | |
| *Dirt roads* (Nereus, Coyote Canyon) | 2 | 833 | |
| *Beast Rider trails* | 7 | 576 | |
| *Extension* (south-west) | 1 | 982 | 50 |

The Ancient network is 63 sites and 22,026 km, 3,627 km of it in tunnel, with no open stretch over 8 km.

**Follow-up questions, added to 8.12:**

5. **Dalab's dirt roads**: should Dalab keep its own roads beside the Ancient trunks (they are a lower class of road for
   carts and herds), or rely on the trunks?
6. **Serai**: which lake? Jimjam's own lake shore near the city, or the north basin's remnant lake 136 km north on the
   frontier road?

### 8.14 The owner, 2026-11-11 (places and the last classes)

- **Amaro** stays inside the polygon 'Shumar', at 734,1182 (3,191 m). **No Ancient route crosses Shumar**: a **dirt
  path** (102 km) joins Amaro to the Ancient highway.
- **Driyan** lies **east of Shim, up along the river**: on the Sharf Rivrh (`r034`) at 705,1129. It is a node of the
  Ancient network, with trunks to Wing, Nazar and Pluton, and an Izani highway to Shim.
- **Dalab makes shoddy repairs to the Ancient roads**, not dirt roads beside them. The Ancient routes inside the Realm of
  Dalab carry the keeper class `shoddy` (drawn tan).
- **Serai** sits in the northern basin, on that lake, on the highway. It moves to **894,410**, on the north basin's
  remnant lake by the north basin highway, 192 km from its old place (826,478). Edit M12.
- **Ancient highways keep above the old shorelines** in the northern semiarid basins, because the dam lakes were full in
  the Ancients' day. Every cell under the two dam lakes' old levels costs 20 times the surface for an Ancient route, so the
  routes go round. Modern roads may cross the dry beds.
- **The Xanadu roads**: an intermediate class (`xanadu`) joining the Sultanate's settlements (Erehwon, Qiblai, Theodiga,
  Strongbow, Strongwall) and Oidong (Longsong). There are 8 roads, 2,301 km.
- **Parabola**: the owner answered the build session's five questions. It is tilted 30 degrees (the back rim about 980 m
  up), faces north, has lost the west quarter of its shell, carries mirror panels on the terrace lips, and keeps the Izani
  customs post. All five were relayed to that session.

**The network now:** the Ancient network is 62 sites and 22,038 km, 3,733 km of it in tunnel, with no open stretch over
8 km.

| Class | Routes | km |
|---|---|---|
| *Izani highways* | 39 | 8,246 |
| *Xanadu roads* | 8 | 2,301 |
| *Yuni roads* | 3 | 1,037 |
| *Trade highway* | 1 | 583 |
| *Vothic highways* | 2 | 283 |
| *Dirt paths* (Nereus, Coyote Canyon, Amaro) | 3 | 935 |
| *Beast Rider trails* | 7 | 576 |

### 8.15 The owner, 2026-11-11 (road fixes)

- **Spirladunon joins Torus** by an Izani highway. Spirladunon's long highway toward the Pontus region (to Fort Ebon,
  717 km) is dropped.
- **Nereus's road over the sea** (to Fort Ebon) is dropped.
- **A direct Izani highway from Dilihan to Port Visas.**
- **A dirt road from Coyote Canyon to the nearest Ancient road.**
- **A dirt path from Reed to Mungo.**
- **Two small Ring Islander fishing villages**, about 1,000 people each, on the Throne's coast north-east (806,794) and
  south-east (801,871) of Zey'danin, each joined to it by a dirt path. Both are *proposed* places, and the scale model adds
  them (edit M12).

### 8.16 Strongbow moves to Oidong (the owner, 2026-11-11)

**Where it is now.** Strongbow is a cliff arcology at the Oidong Valley's east end, at 5.1 px 1298,1647. It was at 1026,1594.
It stands on the valley floor at the foot of the High Rift's escarpment, over Oidong's lake.
- **Source:** the Oidong-High Rift session's scale-model edit 5.1e5, on branch `claude/cool-tereshkova-d594e8` (`bd01a61f5`).
- **The router:** `route51.py` takes the new place before `setts.json`'s snapshot catches up.

Re-routed (the owner's corrections the same day: "qiblai shouldnt be a line stop it was built much later", "longsong shouldnt be a
line stop either", "there is no rift line in oidong valley, just a road", "it goes to strongbow"):
- **The Rift line, Theodiga (10) to Strongbow (11): 1,124 km**, 197 km of it in tunnel (it was 296 km to the old site).
  - It stays out of the Oidong Valley: the router traces it with the valley's polygon at 1,000x the cost, except within 10 km
    of Strongbow.
  - Its route runs south from Theodiga past Strongwall, east along the uplands south of the valley, then north into Strongbow.
  - It stops at neither Qiblai (a much later city) nor Longsong.
- **The valley has a road and no line.** With the line out of the valley, the Xanadu roads come back: Strongbow to Longsong on
  the valley floor (162 km), Qiblai to Longsong (583 km) and Qiblai to Strongbow (745 km). The Oidong session's surface road
  (Longsong to Strongbow, then the Order's road up the beck) is the same road.
- **Possible: the dead bore from Theodiga (10) to Stair (12)**, 438 km, 385 km of it bored. The owner: "theodiga could go to
  stair". It replaces the possible leg from Strongbow, which from the new site would have been a 562 km bore.
  - It is a third way across, but a hard one: dark, with little food or water.
  - **The trains do not run in it.**
  - From Stair, the possible leg on to Parabola (13) by the Godsgate is unchanged.

**Leg ids** (for the open world's links, the Oidong-High Rift session's ask): every leg in `net51.json` has a unique `id`, with the
id its legs share kept as `line` (`legs51.py`). The line's last leg is `rift.theodiga-strongbow`, uncut. The dead bore is
`rift.bowl.theodiga-stair`.

### 8.9 Still open (earlier list; items 2 to 5 answered in 8.10)

1. **The Stair tunnel's canon: done** (the owner: "Yes, rewrite it"). `LORE.md` §4's Catch passage now says that no
   Ancient tunnel reaches Stair, which the Ancients reached by the Godsgate highway. *Proposed* there: the divers dive the
   Hill arcology's sand-drifted lower levels, and the Rift line's possible bore mouth from Strongbow. Its open question is
   updated, and `ANCIENT-ROADS.md` §4b's note is marked dropped. Still with their owners: `biomes/catch/PLAN.md`
   (sections 6a-6b, the tunnel and the divers' camp at its portal), `biomes/catch/KNOWN_ISSUES.md` (the placeholder
   portal), and `biomes/seouterwall/PLAN.md` (the base tunnel, the Bab al-Hawa shaft as a caravanserai, the vault that
   records the collapse).
2. **Talia**: should it move 6.3 km onto the Ancient trunk at 1072,936?
3. **Names**: the Bowl arcology and the Korona site.
4. **The Hykkousoi cities**: are they the League of Amphitriton's towns (Tethis, Kierson, Nereus, Pontus), as drawn?
5. **The frontier highway**: does it end at Crescent, or run on into Region 87 (Mav's Refuge, Pinnacle Rock)?

## 9. The road test bed (2026-11-11)

The owner asked for test renders of each road class, to check how they meet each other and how they handle uneven ground.
`openworld/network-proposal/testbed/` is the test bed. Its `README.md` has the stage, the classes and the checks.
- **How it is built:** the Ancient Transit kit's page with its stage swapped. The kit's fragments are read in place, and
  `python build.py` builds the page.
- **The ground:** a ridge, a valley, a marsh, a hill and a knoll.
- **The roads:** every class in section 8 crosses that ground and the other classes:
  - the Ancient way, with its viaduct, its trestle and its guideway;
  - the Izani, Vothic, Xanadu and Yuni highways;
  - the trade highway;
  - the dirt road;
  - a Beast Rider trail.

`verify.py --assert` checks:
- each class's ruling grade;
- one level at every junction;
- no step where the way meets a deck;
- the clearances (5 m under the viaduct and under the guideway, 3 m over the water);
- the trail's crossings;
- the ground at junctions and under road edges.

Every check has a negative control, and all pass on the GPU. What the bed found:

1. **A kit bug, fixed.** `KTRANSIT.profile` notched the grade at a lone pin: a pinned sample was clamped inside the grading
   passes and only put back afterwards, so the trail's crossing dropped at 63 %. The fix is in
   `kits/ancient-transit/src/41-tr-path.js`, with a test and its negative in `tests/test-transit.js`. The kit's page is
   rebuilt, and its `PORT-BASELINE.json` entry is updated.
2. **Order of levelling.** A junction takes the level of the first road through it, and a weak road crossing two stricter
   roads close together was pinned to two heights it could not join: the dirt road climbed at 44 %.
   - **Rule:** build the network from the strictest class down. Add each weaker class to the finished network with
     `KTRANSIT.join`, so it meets the levels already set.
   - **For `core/network`:** level the roads in class order.
3. **A trail crosses at grade, with no junction.** It takes the crossed road's level and never flattens that road. Joined as
   a junction, a trail held the dirt road flat on an 11 % slope, and the dirt road then dropped at 16 % beyond it.
4. **The ground under roads.**
   - Where two cuttings overlap, the ground takes the deepest single cut, not the sum.
   - Under a road on fill, junctions included, the ground is raised and falls away at 1 : 1.5. The kit draws a road's
     embankment along its runs but not under a junction, so a junction on fill stood over a hole.
   - The fill under a road is read from that road's level at the point's projection across it. The first version took the
     highest road sample within the road's half-width of the point. On the 30 m way at 4 %, that reaches 15 m upslope, so
     the ground stood up to 0.3 m through the surface in a sawtooth (seen at the way × Izani junction).
   - A check now reads the ground as the mesh draws it (its 1.8 m triangles), across every road's whole width.
5. **A trail is held at the crossed road's level from kerb to kerb**, every 2 m. Pinned only on the road's centre line, the
   trail followed the hillside between pins, and it rode 0.2 to 0.5 m above the Xanadu road's surface.
6. **Surfaces by class.** The kit draws every road surface as asphalt. The bed gives each class its own surface, and a
   junction takes the surface of its widest road.

**Done in the kit** (2026-11-11, the owner: "work on owed issues"). The bed now uses each of these, and the bed's own stand-ins are gone:
- `KTRANSIT.crossPins`, and a road's `o.crosses`: a lane held at the crossed road's level from kerb to kerb, with a test and a negative;
- a `surface` on a road record or `draw.road` / `draw.junctions` (`KTRANSIT.surfaceOf`); a junction takes its widest arm's;
- an earth pad under a junction on fill (`draw.junctions`, `pad: false` to leave it out);
- the deepest-cut rule in the kit's demo page;
- `KTRANSIT.hull`.
The fill envelope under roads (finding 4) stays a host's job: the kit draws embankments, and a host raises its ground to them.
