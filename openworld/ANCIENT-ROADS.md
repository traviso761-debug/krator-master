# The Ancients' highways: the plan (draft, 2026-10-23)

Owner (2026-10-23): the Ancients would have had a transport network. Aside from passages under mountains it was mostly
**above ground**, so there should be **Ancient highways connecting the arcologies and ruins**, accounted for when the open
world is built out; and **at least one underground route through the Inner Wall**, besides the Rift line under the Outer
Wall (`biomes/riftrim/PLAN.md`, `LORE.md` §4).

**Status: plan, awaiting the owner.** Nothing built.

## 0. What exists

- **Modern highways** in the open world: `openworld/little-demo/src/42-world-roads.js` (`ROADS`) routes the owner's list
  of highways between settlements (`source/highways.json`) over the land, least cost on a 2 km grid then a 200 m grid in
  a corridor, an 8 % ruling grade with switchbacks, an 8 m carriageway, the ground cut and filled to it (`README.md`,
  "Settlements and highways"). Plain data (`[G data]`), baked to `data/roads.json`.
- **Nothing for the Ancients' network**: no layer on the scale model, nothing in `extract_region.py`, no road furniture
  in `kits/ancients`.

## 1. What the network is

**Nodes** (settled 2026-10-23): **every arcology, lived in or ruined, and every ruin** on the model (the `settlements`
collection: 12 arcologies such as Pylon, Hexahedron, Arcbeam, Fulcrum, Ledge, Cascade; 14 ruined arcologies such as
Arccube, Babel, Blade, Henge, Hub 01, Leng; 8 ruins; 2 caverns), and the cities **founded on Ancient settlements: Hook,
Iziz, Yuni, Ys and Dalab** (round the Ancient genetic laboratory, `LORE.md` §6.1), **Roketstad** (its Ancient spaceport)
and **Verge** (its Ancient funicular); others to come. Most ruins are **highly tentative** in name and place, except **Nazar** and
**Carcosa**; in the Rift, except **Arccube**.

**Edges**: a planned network, not a mesh: **trunks** between the clusters (the crater floor, the Valley of the Ancients,
the north-western lowlands, the north basin, the east, the Rift by its line) and **branches** to each site off the
nearest trunk. Proposed rule: route least-cost paths between every pair of nearby nodes, keep a relative-neighbourhood
graph of them (an edge stays unless a third node is nearer to both ends), then merge routes that run within a few
kilometres of each other into one trunk. The owner reviews it on the model and adds, cuts or moves lines.

## 2. How the Ancients built

Not the modern highway's profile: an engineered way that does not climb when it can cut through.

| | Modern highway (`ROADS`) | Ancient highway |
|---|---|---|
| Ruling grade | 8 %, switchbacks on scarps | **~4 %**, no switchbacks: cuttings, viaducts, spiral tunnels |
| Alignment | follows the land | **straight or in long curves** (radius over ~1 km) |
| Valleys | down and up | **viaducts** |
| Ridges | over | **cuttings and tunnels** |
| Lakes, floodplains | fords, causeways at 40x cost | **causeways and embankments** |
| Width | 8 m | **~30 m: one broad paved way with a guideway down its middle** (settled 2026-10-23): road and line are one |

The router's cost (proposed): length x (1 + grade penalty over 4 %); a viaduct where the ground falls more than ~30 m under
the grade line; a cutting where it rises up to ~60 m over it; **a tunnel** where it would rise more, at a fixed cost per
kilometre (several times the surface's); the airless rim crossable only in tunnel.

## 3. The tunnels

- **The Rift line** under the Outer Wall (the owner, 2026-10-23: **mostly underground**, enough to hold a people): of the
  draft's 535 km from Dalab to Ledge, ~340 km lies over 4 km and ~420 km over 3 km. The line enters the Wall at portals
  in its northern foothills (~3.5 km, ~110 km south of Dalab) and comes out on the cliff over Ledge: **~340-420 km of
  tunnel**, with Ancient stations every ~30-50 km, sidings, ventilation and service galleries, and branches into the
  natural caves (`biomes/riftrim/PLAN.md`). The surface road over the crest is Dalab's own, for when the tunnel's keepers
  close it.
- **Pluton's tunnels** (the owner, 2026-10-23): Pluton (px 471,998, 9.7 km, on the Godthrone's airless flank) is the key
  to the tunnels the Ancients drove up inside **the Godthrone** to its summit (px 574,909 on 4.22, moved to ~575,937 on 4.23; 17.1 km on 4.22, a caldera rim at ~25 km after, so the climb is ~8 km longer over the same ~270 km; ~270 km away), for
  their own purposes. **Not part of the public network**, and **uninhabitable now**. The draft's Cube-Pluton route stands
  for the way to Pluton from the Rift.
- **At least one route under the Inner Wall.** Straight-line checks between Ancient sites on either side (2026-10-23;
  the router will find shorter):
  - **North-west**: the crater's north-west (Trigon px 450,410 or Tethis 461,445) to Footfall (288,437): ~330 km, a
    ~6.1 km crest, **~70-80 km of tunnel**. The shortest.
  - **West, to the Valley of the Ancients**: the crater floor (Agropolis 445,587, Drum 401,602 or Wing 427,712) to the
    Valley's ruins (Babel 184,578, Dorado 211,634, Blade 179,692): crests of 3.9-6.6 km, 150-210 km of tunnel in a
    straight line. The longest, and the one that reaches the Ancients' densest ruins.
  **Chosen: the west, to the Valley of the Ancients** (the owner, 2026-10-23). It is **in very bad condition** now.
  **It can be reached from surface settlements** by shafts and side galleries, among them **an arcology the Iron
  Republic owns** (name to come). The model's one Republic arcology is **Cascade** (px 296,511, 2,815 m, on the Inner
  Wall), about 140 km north of the straight crater-to-Valley lines: either the tunnel bends under it, or the Republic's
  arcology is a new site nearer the route (the router measures both).
- Tunnels are where the Tungangs' kind live (the Rift line's are theirs): an Inner Wall tunnel may hold kin of theirs,
  or something worse.

## 4. What is left of it

**After more than a thousand years, most of it is in very bad condition** (the owner, 2026-10-23). What decides a
stretch is first **who kept it up**:

| Sphere | Upkeep | What it looks like |
|---|---|---|
| **The Empire of Iziz today** (the south-west crater, its holdings and its roads east) | **maintained**, for centuries | relaid paving, rebuilt spans in Izani masonry on Ancient piers, waystations and milestones; the Empire's roads are the Ancient trunks |
| **Voth, the Iron Republic, Dilihan** (former Empire) | **maintained**: they try to keep up what the Empire built | the Izani works kept in repair under new masters, patched where money ran short |
| **The rest of the former Empire**: Jimjam, the Hykkousoi, the Scyvoi, the Beast Riders, Dalab, and the southern, south-western and eastern highlands | **lapsed since the Empire broke** | Izani roads in decline, not yet ruin: weeds and saplings in the joints, verges grown in, a span down here and there, waystations empty; far better than never-kept ground |
| **The Cut road** | **well maintained** | **the one Izani-built highway kept up end to end**: from the Empire's network through the Cut toward the Eternal State, where it meets the State's roads; **its weak stretch is the no man's land between Jimjam and the State**, where upkeep lapses and the road shows it |
| **The Eternal State** (the north-western lowlands) | **maintained**, by paper and corvée | registered, patched and policed: the State's canals and roads keep the Ancient alignments, the best-kept stretches on Krator |
| **Xanadu** (the East Rift Highlands) | **partly maintained**; the network there **was never extensive**, and **Strongbow** (arcology, px 754,1264) **was the end of the line** | a short line kept up in pieces, ending at Strongbow |
| **Yuni** (the far south-east) | **partly maintained** | the stretches it needs kept passable, the rest let go: Yuni has less logistical strength to bring to it than the other two |
| **Everywhere else** | **none** | **badly decayed**: broken, buried, overgrown, washed out, quarried, or gone |

Then **the land it crosses** sets how an unkept stretch failed. A condition per stretch (`kept`, `worn`, `broken`,
`buried`, `gone`; `intact` only where nothing weathers):

| Where | What happened to it |
|---|---|
| **The north basin** | scoured by the dam floods (`DATA.floods`): stretches gone, viaduct piers standing alone in the channels |
| **The hyperjungle** | buried under litter and roots, its embankments long green mounds through the forest, its viaducts strangled by figs |
| **The deserts** | drifted over by sand, the cuttings half full, the surface showing on the reg |
| **The rivers** | 4.21's courses cross it where viaducts fell: broken spans, fords beside them |
| **The Cut** | **deleted**: the line ends at the bowl's lip in a clean cut, the deck hanging over nothing |
| **The airless rim** | **intact**: nothing weathers without air, so the high stretches look new |
| **The tunnels** | some collapsed, some flooded, some kept (the Tungangs') |
| **Where people live** | **reused**: Izani, Eternian and caravan roads run on Ancient alignments; elsewhere towns quarry its paving |

Modern highways prefer the Ancient alignment where it serves (a cost discount inside its corridor), so the network shows
through today's roads.

## 4b. The first draft (2026-10-23)

`tools/scale-model/ancient_roads.py` routes a tentative network on 4.21's heights and the settlements as they stand
(`openworld/ancient-roads-draft.jpg`, `.json`): **42 nodes, 48 routes, ~14,400 km**, coloured by upkeep (kept up 30% of
its length, partly kept 7%, lapsed since the Empire 24%, badly decayed 38%). What it shows:

- **Trunks**: the Eternal State and the Republic down the western lowlands (Fulcrum, Corpus, Henge, Carcosa, Cascade);
  the crater floor's ring (Trigon, Tethis, Agropolis, Drum, Wing, Torus, Hook, Pylon, Iziz, Lunapolis, Hexahedron, Ys);
  the Valley of the Ancients (Babel, Necropolis, Dorado, Blade) to Dalab; Iziz east by Arcbeam to Yuni and Verge.
- **Roketstad** joins by Corpus and Trigon; **Verge** by Yuni; **Strongbow** ends Xanadu's short line at Theodiga.
- **Over the Outer Wall**: Dalab to Ledge (the Rift line, 535 km, only 33 km in tunnel in the draft: it is to run
  ~340-420 km underground, section 3); Arcbeam to Stair in the Catch (its tunnel **closed by seismic activity since about the Cataclysm**, sealed halfway: the northern half
  stripped by Yuni long ago, the southern half open from Stair; the owner, 2026-10-23: `biomes/catch/PLAN.md`);
  Hub 01 to Yuni (44 km in tunnel; no human has reached Hub 01 since the Cataclysm and come back, `LORE.md` §4); Cube to Pluton (the key to the Ancients' own tunnels up the Godthrone, section 3).
- **The Inner Wall to the Valley**: the draft finds **surface passes** (Drum to Cascade, and Wing by Nazar and Span),
  not the tunnel the owner wants: at the draft's tunnel cost a pass is cheaper. The Ancient tunnel goes **under the
  Drum-Cascade pass**, with **Cascade** (the Republic's arcology) as its surface access, as the owner described; the
  next run forces it.
- Tunnels are short overall (~160 km) because the router climbs the 4 km cells' passes; a finer run and a higher
  climbing cost will put more of the mountain crossings underground.

It is a draft for looking at: the settlements are to be reworked first, then the network is routed for real.

## 4c. The second draft (2026-10-26)

Re-run on 4.22's heights and the settlements as the collection now holds them (`ancient_roads.py`; the draft files above are
overwritten): **54 nodes, 63 routes, ~17,200 km (241 km in tunnel)**, up from 42, 48, ~14,400 and 161. New nodes: the new
arcologies and ruins **Shell, Crescent, Stump, Flooded Tower, Tilted Tower, Shelf, Loj Twenny**, the ruins **Fort Kreia, Fort Ordo,
Fort Kalor, Nusidi** and **the Sleeping City** (which joins by Fort Kreia, 87 km, and Fort Ordo, 122 km), and **Trickster's House**
(Arcoindian II, a ruined arcology on the N Outlands basin's west wall at px 1240,330, the owner, 2026-10-26; `biomes/outlands/PLAN.md`).
**Lunapolis** is no longer in the collection. **Trickster's House joins the network by one route only, to Verge: 845 km, of which
56 km is tunnel and 4 km causeway**, the Ancient profile crossing the east rim under about 9.8 km at px (1178, 419)
(`biomes/outlands/SURVEY.md` section 7 has the routes to the nearest sites: Yuni 1,120 km, Fort Kreia 1,111, the Sleeping City 1,115,
Fort Ordo 1,125, Crescent 1,186; every one crosses at that same rim tunnel). It is not by the surface pass the Coyote Men use
(the Gate, px 1136,84, 7.7 km).
**The god's road** (the Coyote Men's trickster, `biomes/outlands/PLAN.md`) is a separate, surface road from the Sleeping City through the Gate to
Trickster's House: 1,938 km, highest 7,728 m (`openworld/gods-road.json`, `.jpg`; `tools/scale-model/god_road.py`).

## 5. Data and drawing

1. **The model** (`tools/scale-model/ancient_roads.py`, its to-do list): `DATA.ancient_roads`, each route `{id, from, to,
   kind: 'trunk' | 'branch', px: [[x, y], ...], h_m: the graded profile, seg: per vertex 'surface' | 'cutting' |
   'embankment' | 'viaduct' | 'causeway' | 'tunnel', cond: per vertex}`, deterministic; a layer on the model page for the
   owner's review.
2. **The cut** (`extract_region.py`): the routes in `region.json` as the rivers are (every vertex, its graded height, the
   segment kinds and the condition).
3. **The open world**: `ROADS` gains an Ancient profile. It does not re-route: the model's alignment is refined at 1:1
   inside a corridor, held to its grade, the ground cut and filled to it, viaducts and tunnels left as gaps for the
   furniture; flora grows on it by its condition (nothing on `kept` or `intact`, moss on `worn`, forest on `buried`).
4. **The furniture** (`kits/ancients`): viaduct piers and decks (standing, fallen), tunnel portals, the guideway, markers,
   interchanges, waystations: catalog pieces the open world places from the records.
5. **Godot**: everything up to the furniture is plain data (`[G data]`), as the rivers and the modern roads are.

## 6. Order of work

- **A0.** The owner approves; confirms the nodes (which towns stand on Ancient ground) and road or road-and-line.
- **A1.** The router on the model's heights with the Ancient cost; a first network; the Inner Wall routes measured.
- **A2.** The owner reviews the layer on the model: trunks, branches, the Inner Wall route chosen.
- **A3.** Conditions per stretch: the upkeep from the political polygons (Iziz; Voth, the Republic, Dilihan; the lapsed
  former Empire; the Eternal State; Yuni; the Cut road), then the land;
  the reused stretches named.
- **A4.** `extract_region.py`; `openworld/little-demo` first (its region's Ancient sites and any line through it).
- **A5.** `ROADS`' Ancient profile and the ground; the probe checks it lies on the land and keeps its grade.
- **A6.** The furniture in `kits/ancients`; the open world places it.

## 7. Questions for the owner

1. **The Republic's arcology** over the Inner Wall tunnel: Cascade (the draft's pass runs through it), or a new site?
2. **Other cities on Ancient ground** beyond Hook, Iziz, Yuni, Ys, Dalab, Roketstad and Verge.
3. **The tentative ruins**: which stand, move or go, so the network is routed once they are settled.

Settled (2026-10-23): every arcology and every ruin is a node, with the cities on Ancient ground; one broad way with a
guideway down its middle; the Inner Wall route runs west to the Valley of the Ancients; Xanadu's short line ends at
Strongbow; the Rift line runs mostly underground; Pluton is the key to the Ancients' own tunnels up the Godthrone.
