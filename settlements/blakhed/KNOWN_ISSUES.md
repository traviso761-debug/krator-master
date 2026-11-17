# Blakhed: known issues

Steps B1-B5 (first pass) of `PLAN.md` (2026-11-16). What is owed, by whom.

## The Tungang kit (`kits/tungang`, step B2)

`PLAN.md` section 5 names the town-scale pieces the Fellgang set lacks today, kept out of the kit until the owner reviews this
pass:
- **A double meeting hall** holding both the Fowlers' rope wall and the Ice-cutters' tally board under one roof (the Market
  stands two `fg-meethall` buildings facing across the square, one in each variant).
- **A long rope walk** (~240 m; the page sets twelve 20 m `fg-ropehouse` sheds end to end along the bank).
- **A great ice house** (the Icegarth sets out fourteen `fg-icehouse` barrows behind the six ice ponds).
- **A market hall and booths, and the Fair's ring, pens and stalls** (the page draws the Market's and Fair's booths, the Fair
  ring's post-and-rail fence and the judges' cairn as page geometry, with `fg-pens` for the fair pens).
- **A halting house (inn), smithy, tannery/felt house and granary** (longhouses and stores stand in on the Market and in the
  quarters).
- **A stair hoist** (the Stairhead's two gin wheels and lowering frames over the first pitch are page geometry).

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
  `core/region/50-region-valley.js`, and provides `WR_BLAKHED.joinXanadu` to replace `gate.dalab.blakhed` in `XAN_TUNE`'s
  Annual Great Caravan without altering `core/region/data/xan-tune.js` (keeping `test-xan-economy.js` and `test-east-rift.js`
  byte-identical until the full West Rift `WR_TUNE` lands in W1-W4).

## Not done (step B6)

Walk-in Fellgang interiors, citizens and beasts on `core/simulation` / `core/charactermodels` (Fellgang outfits are owed by the
outfit sessions), winter snow / pond-cutting state on `core/clock`, `core/hazard` zones on the river and stair, and the Godot
export.
