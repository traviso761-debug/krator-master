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
