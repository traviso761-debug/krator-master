# kits/tungang: known issues and the running note

## Done (2026-11-11, the Fellgang set: `PLAN.md` section 3.3.1)

- The kit scaffold on `core/engine` (from `kits/lizardmen`'s build, verify and head): `build.py`, `verify.py` (on
  `tools/harness.py`), `materials.json` and `tex/` (20 library families, 9 furniture detail maps; no LFS pointer in the pack),
  `PORT.md`, `INDEX.md`, `README.md` (with the Core adoption section), `API.md`.
- The 14 village buildings, keyed and boxed as riftrim's stand-ins (`TG.fg.BOX`), each within 0.5 m of its box in both states;
  the stand-ins' frame (the floor at the highest corner, the plinth to the lowest, a stepped footing on a slope); the meeting
  hall's `fowlers` and `icecut` variants; the longhouse's byre down-slope; the ice house's blocks in the cut-away.
- The road and wall pieces: `fg-fixed-line` (from the rope record), `fg-lantern-post`, `fg-wall-station`, `fg-nest-ledge`,
  `fg-burial-ledge`, `fg-halt` (keyed so for the Travellers, the owner 2026-11-11, not `fg-carry-hut`) and the optional
  `fg-wagon` (built).
- The host API (`TG.fg.draw`, `ropes`, `pieces`, `proto`, `dims`, `check`) and the sealed bundle (`tungang_bundle.py`, `TG`),
  proven in plain node (`tests/test-bundle.js`) and on the sheet.
- The `fellgang` row with the `fowling` and `ice` focuses in core/hamlet, opt-in (`core/hamlet/fellgang/`), with its test
  in `core/hamlet/test-hamlet.js` (the same digest as the borrowed `ranch` and `quarry`; negatives).

## Open

- [ ] **The daub sheet is owed** (`patterns/fellgang/daub`, `core/materials/PROMPTS-NEEDED.md` section 43): the slogans are
      block letters and the family marks six simple signs, all geometry in `'plain'` vertex colour (`40-fg-kit.js` `fgText`,
      `fgMark`). When the sheet comes, the marks (the wheel, the aurochs, handprints, tallies, the red X) go on as decals; the
      slogans' words stay the kit's own letters.
- [ ] **No furniture in a world's draw.** The bundle's `FURNISH` is a stub (as the isle demo's `ISK`): a station's villages
      have their walls, hearths, racks, shelves, the rope wall and the tally board, but no catalog beds, benches or chests.
      The sheet places them (253 pieces). Owed: the catalog through the bundle (`core/furnish` and the culture file sealed
      in, or the station's own catalog) once a station asks for interiors.
- [ ] **No sledge in the catalog.** `PLAN.md` names `fellgang_common_ice_sledge`; `kits/catalog/krator-master-furniture-fellgang.js`
      has no such piece (its 21 pieces are listed in `README.md`'s neighbours). The sledge shed and the wagon draw the kit's
      own sledge (`fgSledge`, `56-fg-works.js`); the Ice-cutters' station keeps its instanced sledges.
- [ ] **No walk records.** `core/walk` is not taken yet (Lizardmen's `37-wk-rec.js` pattern): the doors open but a walker is
      not stopped by the walls. Rides with the Tungang set, whose holds need the walk first.
- [ ] **The state switch reloads the page** (`99-sheet-fg.js`): rebuilding the world in place makes the engine's geometry
      disposal log a WebGL "delete: object does not belong to this context" error per mesh (254 on the sheet). Seen only on
      a rebuild; core/engine's `buildWorld` (not this kit's to change) is where it would be fixed.
- [ ] **The cutters' tools by the stacks** (`PLAN.md` 3.3.1: saws, pike poles and tongs leaned on the station's stacks) are
      drawn only inside the ice house; a piece for the stacks (`fg-ice-tools`) is not built.
- [ ] **Triangles.** The Fowlers' 27 buildings draw about 160k triangles (the Ice-cutters' about 110k): fine for a station,
      to be weighed with the riftrim session against its page budget before the swap. `core/lod` is not taken yet.
- [ ] **check_assembly baseline entry.** `core/city/33-city-strategies.js` (taken whole, for `KCITY.prim`) calls
      `KCITY.stance` in a strategy core/hamlet never runs; the page does not load `15-city-ground.js` (it needs the city core
      before it). Recorded as one key in `tools/check_assembly_baseline.json`.
- [ ] **The Godot export** of the sheet (`core/export`) is not wired: `PLAN.md` phase T10.
- [ ] **Gallery.** The kit is a new build: it goes into the Krator Worlds gallery when it first reaches `main`.
- [ ] **Not yet built** from `PLAN.md` 3.3: the bands (`fg-war-camp`, `fg-raid-cache`),
      the fells (`fg-shieling`, `fg-cairn`, `fg-stone-sign`); the Tungang (`tg`) and Glazier (`gz`) sets. (Wildcat's scrap
      pueblo is built on `core/pueblo`, 2026-11-11: `PLAN.md` 1.3.1, "Built".)
- [ ] **The pueblos: no walk records.** The rooms are hollow and furnished (2026-11-11), but their walls and slabs are
      prisms, which `core/walk` does not read: no floors on the roofs and terraces, no ladders as climbs. Owed with a pueblo
      page of its own (or `KWALK` records written from core/pueblo's cells).
- [ ] **The catalog's twelve new Fellgang pieces reach 36 builds** (every build that lists the catalog folder): only
      `kits/catalog` and this kit are rebuilt on this branch; the others ride the next all-builds rebuild (as the
      tungang-furniture branch's pieces do), so `check_stale` flags them until then.
- [ ] **A host's ground under a pueblo**: the house paves its plazas and digs its kivas, so the world's terrain must sit
      0.35 m under the plazas and open the pits (`fgWcCarve` on the sheet); a terrain that cannot be carved shows through.
- [ ] **Barricade's river**: the sheet draws its bed in rock; the water is `core/water`'s, wired where Barricade is placed.
- [ ] **Furniture triangles**: the two great houses hold 6,000 catalog pieces; they are drawn in 40 m chunks shown within 90 m
      of the camera (260 m while the section is open). A world calls `TG.fg.chunksTick(camera)`; a LOD of the pieces is owed.
- [ ] **Wildcat: the Deeds and the slogans are geometry** (block letters, marks and tallies as thin boxes), as the Fellgang
      set's slogans are, until the daub sheet is delivered (`core/materials/PROMPTS-NEEDED.md` section 43).
- [ ] **Wildcat's triangles.** The great house draws about 190k triangles (2,400 vigas, 440 salvage panels, 98 ladders) and its
      stockade about 870 stakes: fine on the sheet, heavy for a station far off. A LOD (the columns alone past ~400 m) is owed
      with `core/lod`.
