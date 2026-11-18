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

- **The Fellgang row's works (`core/hamlet/fellgang/22-hamlet-fellgang.js`):** defines `fowling` and `ice` (preserving riftrim stations 8 & 9 bit-for-bit) alongside `farming`, `ranch`, `quarry`, `stair`, `copper`, `gold` and `pass`. `src/69bo-bk-ring.js` adds `fg-dugout-icehouse` to Blakhed's `ice` focus only so station 9's digest never moves.
- **The Winterings (`core/camp/fellgang/52-camp-fellgang.js`):** shared opt-in `traveller`, `traveller-kradz` and `fellgang-band` rows on `core/camp` (`KCAMP.census`, `KCAMP.pitch`, `KCAMP.outlawCamp`). Blakhed pitches seven extended-family circles and horseshoes of `fg-wagon` vardos, `fg-bender` bender tents, `fg-camp-hearth` tripod campfires, `fg-tinsmith` pitches/clotheslines and hurdle pony paddocks.
- **Dalab's mission and toll post (`settlements/dalab/src`):** Dalab's 13-building mission near the Market centre (~134 people) and four-piece toll post at the Stairhead draw on dressed-stone podiums (`KWALK` aprons and entry steps), while `kits/interiors` has no `dalab` set yet, so the Dalab buildings themselves stay solid.

## The scale model and the open world (step B0)

- **Blakhed's pin** (`441,1400`) and the Stairhead are queued for the West Rift pin batch on scale model 5.1 (`PLAN.md`
  sections 0 and 6), and there is no West Rift region in `openworld/SITES.json` yet.
- **The Blak Riba's town vertex:** on 5.1, `r116` vertex `440.2,1399.5` passes 1.9 km north-west of the pin; `src/69bm-bk-ground.js`
  moves that one vertex inside its own 2 km cell to `440.8,1399.8` so the town sits on its south-east bank (~0.6 km from the
  Market).
- **Five questions in `PLAN.md` section 0** remain open for the owner (`ask`): keeping the Stairhead at the falls' lip 24 km
  downstream vs moving the town, the stair's beast-path + hoist form, the Chimes Riba crossing to the north rim (off the page),
  naming the rim's herd beasts (pens and folds are drawn empty), and whether a Giant guard stands at Dalab's toll post.

## The economy & regional politics (`core/region/data/wr-tune.js` + `sim/wr-blakhed.js`)

- `core/region/data/wr-tune.js` (`WR_TUNE`) wires all **12,250 Fellgangs** across 25 settlements, seasonal mining camps and mobile clans (`wr.blakhed`, `wr.stairhead`, 12 `bk.h.*` hamlets, `wr.fells`, `wr.fowlers`, `wr.icecutters`, `wr.drovers`, `wr.passkeepers`, `wr.coppersmiths`, `wr.goldcamp`, `wr.wildcat`, `wr.barricade`, `wr.travellers`, `wr.kradz`) alongside 12 West Rift neighbours (`wr.nulab`, `wr.basin`, `dalab.ledge`, `dalab.skarn`, `dalab.shelf`, `dalab.blakhed`, `tg.fower`, `tg.twenny`, `tg.hearth`, `tg.saltpeter`, `tears.blakhed`, `gate.kimr`), Wildcat's zero-sum road raids (`Rd.raids` in `50-region-valley.js`) and Autumn Fair truce window, the W5 Tungang Union strike proof, Rising 8 (`wr.rising.nulab`), and the W3 Great Caravan join (`node core/region/tests/test-wr-fellgangs.js`, `node settlements/blakhed/test-bk-economy.js`).

## Presented citizens (`src/78-bk-sim.js` + `targets/town/90e-bk-life.js`) & remaining items

- **Done (`B6` simulation):** 311 live citizens and pack-sledges on `core/simulation` (`SIM.pose`, `77-sim-6-needs.js`, `77-sim-6-govern.js` dugout/barrow ice-keeping, weekly Double Meeting in `fg-doublehall`, and Market Truce enforcement inside the 16 `fg-truce-post` stones), rendered in six multi-part instanced cultural silhouettes (`fellgang`, `traveller`, `kradz`, `wildcat`, `mission`, `sledge`).
- [ ] **MPFB garment meshes (`core/charactermodels`):** Blender + MPFB2 fitted GLB garments for Fellgangs, Travellers and Wildcat when the character-kit session runs.
- [ ] **Dalab interior set:** `kits/interiors` has no `dalab` set yet, so Dalab's mission and Stairhead toll-post buildings stay solid.
- [ ] **Winter state, hazards and export:** snow / pond-cutting state on `core/clock`, `core/hazard` zones on the river and
      gorge stair, and the Godot export (`core/export`).
