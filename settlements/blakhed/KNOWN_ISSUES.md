# Blakhed: known issues

Steps **B1-B5** and **B6 (interiors)** of `PLAN.md` (2026-11-16). What is done and what remains owed.

## Done in steps B2 and B6 (interiors)

- **Step B2 (town-scale Fellgang pieces in `kits/tungang`):** added `fg-doublehall` (both customs under one roof: rope wall +
  tally board), `fg-halting-house` (inn), `fg-markethall`, `fg-booth`, `fg-ropewalk` (44 m range), `fg-great-icehouse` (5-tier
  vaulted store), `fg-smithy`, `fg-tannery`, `fg-granary` (staddle piers), `fg-fair-stand`, `fg-stair-hoist`, `fg-fair-hurdle`,
  `fg-cairn` (standing peace stone & fell cairn) and `fg-stone-sign`, and replaced all temporary Market, Fair and Stairhead
  stand-ins in Blakhed with real `kits/tungang` records.
- **Step B6 (interiors only):** town Fellgang buildings are furnished from the catalog (`tungang_bundle.bundle(furniture=True)`),
  record their floors and walls on `KWALK` (`core/walk/box`), register operable `KDOOR` Ancient plate doors (`E` opens/closes),
  build drystone threshold steps where doors stand above sloped ground, and expose `XA_CUT` cutaway units (`X` key). The Golden
  Tears' Xanadui buildings (`xa_serai`, `xa_rich_c`, `xa_temple`, `xa_barracks`, `xa_bath`, `xa_warehouse`, `xa_mid_a`) are
  hollowed, planned, furnished and walked on dressed-stone podiums and steps (`src/89b1-bk-interiors.js`, `targets/town/90c-bk-build.js`).
  Dalab's four toll-post pieces at the Stairhead (`settlements/dalab/src`) have no `kits/interiors` set yet and stay solid.

## `core/hamlet` and `core/camp`

- **The Fellgang row's works (`BK_ROW`):** `core/hamlet/fellgang/22-hamlet-fellgang.js` defines works for `fowling` and `ice`
  only. `src/69bo-bk-ring.js` extends the row locally (`farming`, `ranch`, `quarry` and `stair`) and passes the extended row
  object to `KHAMLET.village`, as Kirstabal does, so no other build moves. Moving those foci into `22-hamlet-fellgang.js`
  rides along with the next all-builds rebuild.
- **The Winterings (`core/camp`):** `core/camp` has no `traveller` or `fellgang` row yet (`core/camp/PLAN.md`). The Travellers'
  winter quarter places `fg-wagon` and `fg-halt` records in family rows (`src/69bn-bk-town.js`) drawn through `TG.fg.pieces`.

## The scale model and the open world (step B0)

- **Blakhed's pin** (`441,1400`) and the Stairhead are queued for the West Rift pin batch on scale model 5.1 (`PLAN.md`
  sections 0 and 6), and there is no West Rift region in `openworld/SITES.json` yet.
- **The Blak Riba's town vertex:** on 5.1, `r116` vertex `440.2,1399.5` passes 1.9 km north-west of the pin; `src/69bm-bk-ground.js`
  moves that one vertex inside its own 2 km cell to `440.8,1399.8` so the town sits on its south-east bank (~0.6 km from the
  Market).
- **Five questions in `PLAN.md` section 0** remain open for the owner (`ask`): keeping the Stairhead at the falls' lip 24 km
  downstream vs moving the town, the stair's beast-path + hoist form, the Chimes Riba crossing to the north rim (off the page),
  naming the rim's herd beasts (pens and folds are drawn empty), and whether a Giant guard stands at Dalab's toll post.

## The economy (`sim/wr-blakhed.js`, step B5)

- `sim/wr-blakhed.js` runs Blakhed, the Stairhead, Dalab's toll post, the Golden Tears' mission, the twelve hamlets and the
  four West Rift partner stops (Nulab, the drovers' salt, the Ice-cutters, the Fowlers) for a full year on
  `core/region/50-region-valley.js`, and provides `WR_BLAKHED.join` to replace `gate.dalab.blakhed` and `gate.dalab.nulab` in
  `XAN_TUNE`'s Annual Great Caravan without altering `core/region/data/xan-tune.js` (keeping `test-xan-economy.js` and
  `test-east-rift.js` byte-identical until the full West Rift `WR_TUNE` lands in W1-W4).

## Still owed (remaining B6 items, out of scope of interiors-only pass)

- [ ] **People and schedules (`core/simulation`, `core/charactermodels`):** citizen actors, Fair and Great Caravan crowds, and
      herd beasts (Fellgang outfits are owed by the outfit sessions).
- [ ] **Dalab interior set:** `kits/interiors` has no `dalab` set yet, so Dalab's four Stairhead toll-post buildings stay solid.
- [ ] **Winter state, hazards and export:** snow / pond-cutting state on `core/clock`, `core/hazard` zones on the river and
      gorge stair, and the Godot export (`core/export`).
