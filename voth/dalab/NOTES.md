# Dalab — notes

## Round 1 (Sep 28 2026) — the building kit

Brief from Travis: a Dalab building kit for the SW-lowlands mound settlement;
buildings now, the settlement later. Cahokian monumentality in rammed earth,
wood, stone and scrap; circular plans, thatch and shingle; stone for the wealthy
and sacred in Tiwanaku / Mesoamerican manners with relief and painted murals of
heroes and avatars of The God; green-skinned citizens; Giant guards; the same
lighting system as the previous builds. Deliverable: `dist/dalab-set.html`.

Decisions:
* New repo `dalab/` on the Iziz contract: the Ancients core vendored from
  upstream (newer than Iziz's copies — it carries `KIT.meshes`, which the night
  flip needs), the Vernacular kit + helpers, KratorSky, scene, probe, camera
  and labels vendored from Iziz. `build.py --vendor-check` reads both.
* Dalab adds two fragments of its own vocabulary (`69d` materials / kit items,
  `69e` building blocks) and four of buildings (`70` dwellings, `71` trade,
  `72` civic, `73` sacred), all registering through `VERN` with
  `culture:'dalab'`.
* Textures: rammed-earth lifts, a stepped-fret relief height field, a 2 m
  colour mural tile (avatar + hero), a banner with the eye of The God, turf.
  The mural is square so a 2 m band shows the whole frieze under `vWorldUV`;
  the plane variant (`dMural`) carries plain UVs for round-house facets.
* The mounds are lathes with a smoothstep profile (flat foot, flat plateau,
  walkable), a front stair of stone treads following the profile, steles, an
  apron. The ring bank is a lathe with a phi gap.
* Lighting: KratorSky by hour in the showcase (the Iziz city's package), the
  Ancients' night flip on whole InstancedMeshes, and Dalab's rule: The God's
  light (cold teal) for priest / noble / civic only, two-pane windows that swap
  by hour; fire in peasant hearths, kilns, altars and plaza pits. A seventh
  VIEWS element is the hour; `N` toggles.

Set: peasant ×4 (round earth hut, scrap hut, post house, family compound),
noble ×3 (stone hall, great roundhouse, earth-walled manor), tavern, small and
large markets, granaries, warehouse, scrap smithy, workshop, guard's barracks,
three embassies (Izizian, Vothic, Historians'), the Halls of Reformation, the
priests' temple, priest's house, wayside shrine, the ceremonial mound, the High
Priest's mound. 32 registered volumes, 6.2 k instances, 183 k scene
triangles, ~80 draw calls.

Verified: build rules green, `jscheck` parses, `--assert` all pass (occupancy,
NaN, budgets, registry). Shots read at overview, eye level and night; fixes made
from them: the mound turf came out cream (a plain mesh gets no instance tint —
the colour now lives on `MAT.dTurfMesh`), the night halos rendered as flat
additive rectangles (now a radial glow card, `TEX.dGlow`), the giants' arms
pointed up (rolled past the vertical so they hang), the smithy's scrap heap
was car-sized and its roof stones floated, a preset without an hour inherited
the previous night preset's hour (a preset with no hour is now a day preset, as
an Ancients preset without the night flag), the hut hearth faced sideways so the
fire read edge-on from the front, and two eye-level presets stood inside
geometry.

## Round 2 (Sep 28 2026) — adjustments and more buildings

From Travis after walking the set: the great roundhouse's and tavern's lower
awnings sat too low and cut through their posts; the manor gate flickered;
expand the Halls to about twice the size with more buildings; another mound
with a High Priest's palace built into it; ground-level priest compounds; a
quality pass on the mound stairs; more shops and workshops; a windmill.

* **Awnings**: the ring veranda's shingle skirt and the tavern porch cone now
  sit on a timber ring at the post tops instead of 1.6 m below them.
* **Manor gate**: the relief bands stood 7 cm proud, flush with the pylon's
  batter at its foot (z-fight); now 10 cm. The lintel's top was flush with the
  pylon tops; it sits lower and narrower.
* **Mound stair** (`dnMound`): was a run of separate horizontal treads, which
  opened gaps where the slope was steepest. Now a continuous ramp of tilted
  slabs following the profile, kerb stringers both sides, treads laid on the
  ramp every 0.3 m of rise, a landing with gilt-topped piers every 4 m of rise.
* **Halls of Reformation**: r 34 → 68. Gatehouse drums with a relief bridge,
  the great hall (r 13), four wing halls on the diagonals with pipe to the
  centre, two cell blocks (colonnaded ranges of seven God-lit cells), the
  archive drum, two vat sheds, two pylons, twelve steles, God-posts along the
  axis. 146 m def.
* **Palace mound** (`dalab_palace_mound`): r 42 / h 17; three stone terraces
  cut into the front slope, each a battered range with relief, God-lit
  galleries, a stone colonnade and banners; the trilithon door into the mound
  on the lowest; the mound stair passes through them; the greater temple and
  two wings on the plateau.
* **Priests' compound** (`dalab_priest_compound`): a stone ring wall (r 22)
  round three priests' houses, a mural-ringed chapel drum, an altar, steles,
  gardens, God-posts. **Healers' hall** (`dalab_healers`) alongside: the
  ward, a dispensary drum, a herb garden, the sick on benches.
* **Trade**: shop row (three counters with awnings, a tall middle shop),
  potter's workshop (beehive kiln, pot racks, clay pit, wheel), weaver's
  workshop (looms under an open hall, drying lines), dyer's yard (six vats
  and their stains), windmill (tapered earth tower, thatch cap with tail pole,
  four cloth sails on a tilted axle, millstone shed).
* Fixes from the shots: mural rings on the chapel and archive drums sat inside
  the wall face and showed as triangles; the dyer's frames; the compound
  preset.

41 registered volumes, 9.1 k instances, 257 k scene triangles, ~85 draw calls.
`--assert` green.

## Round 3 (Sep 28 2026) — palace stairs and gardens, the known-issues pass

From Travis: each palace terrace gets its own landing; the palace doors
overlapped the relief; terraced gardens on the palace hillsides from the
SW-lowlands biome; a quality pass on the known issues.

* **The lowlands biome is vendored** (`src/86-bio-*.js`, byte-identical to
  `../biomes/swlowlands/src`, checked by `build.py --vendor-check`). It gained
  two exports upstream, additive: `SWLOW.treeAt(species,x,y,z,{scale})` and
  `SWLOW.plantAt(kind,x,y,z,{set,k})` — one tree or one small plant at an
  explicit point, no zone, no mask. `86-bio-45-init.js` binds BIO with constant
  fields and a queue for the wind tick; `dnTree` / `dnPlant` convert a builder's
  local frame to world and adopt the biome's registry entries as `cls:'flora'`
  of the site. `94-dalab-light.js` binds the scene, bakes the biome after
  `kbake`, and feeds the sun into `BIO.setSun`.
* **Palace mound** rebuilt: three terraces at rho 33.5 / 29 / 25 with landings
  (a stone platform faced down to the slope, paved, balustraded), the axial
  flight to the first, paired side flights on solid walls past the ends of the
  ranges above, a last pair to the plateau with a rim balustrade. Relief bands
  stop clear of the doors; the gate stands 45 cm proud. Gardens: five contour
  beds per flank (bearings 42°–142° off the front) behind retaining walls,
  with garden flights up each flank; skirt palms, ember manzanita, pompom
  cycads, young jacarandas and ringbarks, and shrubs, azaleas, agaves, aloes,
  yuccas, golden grass, toyon, ferns, blooms.
* **Known issues pass**: see KNOWN_ISSUES.md — mounds merged into one mesh,
  drum openings proud, finer mural facets, giant hands, cable sag, ring bank
  caps, ground glow under The God's light, pipe trestles, turning sails.

65 registered volumes (24 flora), 10.2 k kit instances + 7.2 k biome, 370 k
scene triangles, ~110 draw calls. `--assert` green.

## Round 4 (Sep 28 2026) — the sacred deco, gardens all round

From Travis: palace gardens all the way round the back; colour on the palace
and the other religious buildings, from the art-deco sheet in the reference
zip (terracotta walls, cream trim, turquoise-inlaid fret, stepped crests, tall
avatar panels on the piers, diamond-checker tile).

* `DPAL.sacred` (terracotta), `DPAL.trim` (cream), `DPAL.tq`. Three new
  textures: `dReliefTq` (the stepped fret in colour: cream faces over
  turquoise recesses), `dDecoPanel` (a 1×4 turquoise panel with the cream
  avatar, plain UVs), `dChecker` (ochre / turquoise / cream lozenges).
* Helpers: `dnFretBand`, `dnDecoPanel`, `dnCrest` (three cream-trimmed
  steps over fret bands, a gilt ball), `dnTrimBand`, `dnChecker`;
  `dnCornice`, `dnGate` and `dnStele` take a trim / colour flag.
* Applied to `dnTemple` (default; `o.deco:false` keeps the grey), the
  priest's house, the shrine, the priests' compound (wall, gate, chapel,
  steles, checker court), the palace terraces, wings, landings and crest, and
  the High Priest's ring gate steles. The mounds' turf, stairs and flights
  stay grey stone so the red reads.
* Gardens: one arc per bed from 42° round the back to 318°, with a third
  garden flight up the back to a small checker viewing platform on the rim.

72 registered volumes, 10.7 k kit instances + 8.4 k biome, 400 k scene
triangles, ~112 draw calls. `--assert` green.

## Round 5 (Sep 28 2026) — the mound temple's facade, the great hall

From Travis: z-fight on the ceremonial mound's upper facade; the Halls'
central building larger and more elaborate.

* **Temple facade** (`dnTemple`, and so every mound): at scale .72 the corner
  avatar panels crossed the window jambs and the plinth fret band, and the
  mural frieze crossed the window heads. The panels now stand at the very
  corners, the plinth band stops 1.6 s short of each corner, the windows sit
  0.6 s lower (below the frieze), the string course no longer reaches into it.
* **The great hall**: r 13 → 18, on a two-course base with a stair; sixteen
  battered buttress piers with relief fronts and pyramid pinnacles, God
  windows between; a fret plinth, the mural frieze and a 32-strip light ring
  under the cornice; a clerestory drum with sixteen God windows; the panel
  dome on inward-leaning iron ribs with a rust lantern, a God ball and a
  mast; an eight-column portico with a relief entablature and a cream-trimmed
  stepped crest over a checker floor; three domed apses on the other axes.
  Pipes and pylon cables re-aimed; God-posts moved past the portico.

72 registered volumes, 11.2 k kit instances, 400 k scene triangles, ~115 draw
calls. `--assert` green.

## Round 6 (Sep 28 2026) — fixes, embassies, the chapterhouse, murals, the ranch

* **Great hall entrance**: the portico slab's top lay on the base drum's top
  (z-fight); the slab is 8 cm taller and the checker floor sits on it. Six
  columns in two ranks of three, symmetric about the door (was four per side
  at a pitch that missed the axis).
* **Healers' hall**: the mural frieze moved above the window heads (variant 2,
  the sun); the platform is 3 m wider so the dispensary drum stands on it.
* **Temple**: the cream string course ran through the window heads; gone. The
  windows sit 0.4 s higher, the frieze 0.3 s higher, no overlap.
* **Murals**: four variants (`dMuralTex(v)`; items `dMural[1-3]`, `dMuralB[1-3]`;
  `dnMuralBand`/`dnMuralRing` take a variant or pick one): the avatar and the
  hero; a procession of three heroes with banners; two avatars flanking the
  eye-in-the-sun; the beasts of the fields (lizards and a maize sheaf — the
  peasant mural).
* **Embassies**: the Historians' embassy is gone; the **Yuni embassy** (drum
  halls under tile cones with lanterns, round windows, a curved banco arcade,
  toron, a mosaic dais — the vp* kit from Iziz's ported fragments, now
  vendored: `75-port-embassy.js`, `76-port-chapterhouse.js`) and the
  **Republican embassy**, a PLACEHOLDER (dry-stone, jettied timber gallery,
  slate shingle, a watch tower; tagged `placeholder:true`) until the Republic's
  highlands set lands from the other session. The **Historians' chapterhouse**
  is the Yuni-set port from Iziz, placed as `dalab_chapterhouse`.
* **Fauna registry** (`DFAUNA.def(kind,fn,meta)`, `dnAnimal`): the Dalab
  lizard (a fat striped ground lizard, 2.4 m; `frill` for a crested bull).
  Monsters register the same way when they exist.
* **Ranch** (`dalab_ranch`, 120 m square, the Halls' area): rail fence, ranch
  house on a plinth, a great thatch barn, granaries, a well, four paddocks with
  troughs and hay, a shade roof, a stone-walled **monster pen** (crested
  lizards in it for now), a skirt-palm windbreak.

86 registered volumes, 13.7 k kit instances, 505 k scene triangles, ~140 draw
calls. `--assert` green.

## Round 7 (Sep 28 2026) — the settlement, the Republican embassy, the 10 M ceiling

* **The Republican embassy** is real: the Highlands kit landed on main
  (`../highlands/`), so `70-hl-tex 71-hl-mat 71b-hl-motif 72-hl-helpers
  73-hl-carve 74-rep-dwell` are vendored (no name collisions with Dalab, seeds
  in the 20000s) and the embassy places a Peles villa inside the Dalab compound
  through the Highlands' own `hnSub`. The placeholder is gone.
* **The set's ceiling** is 10 M triangles (Travis), for level of detail later.
* **The settlement** (`targets/city/`, `dist/dalab.html`): see README. World
  4.4 km; the Ancient lab north of centre at scale .4 inside its precinct; the
  main settlement south of it on the live-oak avenue, its palace mound facing
  the lab; the High Priest's ringed mound outside the lab gate facing away; six
  outlying towns on a 1.56 km ring, each mound facing the lab, joined by the
  highway circuit with spurs off the map N/S/E/W; the river down the west edge
  with a channel to the main settlement and irrigation channels to the towns;
  farm wedges round every settlement with farm lanes; residual oak stands in
  the clearing and the forest closing in at the edge. Every building faces its
  street and is tested against the mask and the occupancy hash; the audit
  reports on-road corners and overlaps (0 overlaps; the on-road count is the
  mounds' lanes and is checked by disc). The life layer moves ~320 agents in
  two draw calls. First run: 294 buildings, 1 870 trees (42 avenue oaks), one
  road network, 5.1 M triangles, ~195 draw calls, 12 s to build.
* Fixes from the first shots: the biome reads ground under 0.3 m as water, so
  the terrain now sits 2.2 m up (the oaks planted); the world-wide water plane
  z-fought the ground at a distance (now strips along the river and channels);
  the plaza is reserved ground so the market and shrine are let onto it by
  name; the outlying towns' streets shortened (140 m) so 18 houses read as a
  town; two presets that stood inside geometry.
* Second pass on the settlement (same round): the oak vault runs along every
  road out of the main settlement to the circuit as well as the lab avenue
  (`OAK_ROADS`; 284 avenue oaks); the outlying plaza ring is clipped round the
  mound's foot and the mound lane round the plaza (they cut through each
  other's ground); farm lanes never run at the mound and stop at a precinct;
  connectivity links avoid precincts; the market and shrine are placed onto
  the reserved plaza by name; outlying towns tightened (r 170, ring 74,
  radials 118 m, house pitch 16 m) so 18 houses read as a town; the main
  settlement's count raised to ~84 houses with more trade and granaries.
  Audit: 0 overlaps; the remaining on-road corners are the mounds' own foot
  lanes and the plaza market, both by design. 6.1 M triangles, ~213 draw
  calls, one road network.
