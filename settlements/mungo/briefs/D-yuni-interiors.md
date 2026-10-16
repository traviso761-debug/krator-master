# Brief D: interiors for the Yuni middle-class houses (start a Yuni set)

Read `settlements/mungo/briefs/00-common.md` first.

## Why
In Mungo the Geomancers' chapterhouse is "surrounded by a half dozen Yuni culture residential buildings". Mungo is a
fork of the Locus engine, whose Yuni base-kit assets come from `settlements/locus/src/56-mid.js` (forked from Yuni).
The owner: "Make sure all buildings socket in to existing interior and furniture systems; build out interiors and
furniture if needed and place in the appropriate sheet for their culture." The Locus interiors set covers only the
Locus-kit buildings; the Yuni houses have NO interiors items. You start the Yuni set.

## Build it
- Read `kits/interiors/sets/README.md` fully (item format, frame, programmes, the residence rule), `kits/interiors/API.md`
  sections 7 and 10, and `kits/interiors/sets/locus.js` as the model (it already uses the Yuni furniture cultures for
  the Geomancer buildings).
- New file `kits/interiors/sets/yuni.js`: set `yuni`, title `Yuni (base kit, as built by Locus and Mungo)`, items for the
  six middle-class houses in `settlements/locus/src/56-mid.js`, EVERY variant (`<key>#<n>` for variant n > 0 whose rooms
  differ; `like` for ones that do not): `mid_bluewash_townhouse`, `mid_djenne_house`, `mid_stacked_cubes`,
  `mid_round_tower_house`, `mid_courtyard_house`, `mid_washed_house`. `56-mid.js` is 63 KB: find each builder with
  `grep -n "key:'mid_" settlements/locus/src/56-mid.js` and read only that range. Read the builder for the real body:
  wall blocks, storey heights (`F.y` offsets), plinths, where the door is drawn, how many storeys, roof terraces. Do not
  guess from `w x d`.
- Furniture cultures: the Yuni ones the catalog carries (see how `locus.js` names them: `yuni-common` for middle-class
  homes, `yuni-court` for rich; check `kits/catalog/README.md` "Furniture by culture" for the exact culture ids and the
  fallback chain). Wealth ~0.45-0.6. Each house is a residence (single-family dwelling): living + bedroom(s) + kitchen
  where the body allows; every residence passes the residence rule (bed, food container, item container per unit).
- If a programme needs a piece the Yuni cultures and their fallbacks lack, add it to the right culture file in
  `kits/catalog/` in the catalog's style and run that page's verify (`kits/catalog/README.md`); say so in the report.
- Check: `cd kits/interiors && python build.py --sets-page yuni`, then
  `python verify.py dist/interiors-sets.yuni.html --sets --assert --query set=yuni` and a screenshot run
  (`--out <scratch>/shots --rooms`). Look at the shots. Do NOT run the interiors `build.py` without `--sets-page`
  (other agents are writing other set files at the same time).
- Add the row for your set to `kits/interiors/sets/README.md`'s table (shared with two other agents adding one row
  each: make one small Edit adding your row only; re-read the file just before editing).

## Files you own
`kits/interiors/sets/yuni.js` (new), one row in `kits/interiors/sets/README.md`, additions to a Yuni culture file in
`kits/catalog/` if needed. Read-only: everything in `settlements/locus/`.

## Done when
All six houses and their variants have items (or a `skip` with the reason), every room passes `--sets --assert`,
every residence passes the residence rule, and you have looked at the room shots. Report per `00-common.md`, including
for each key/variant: rooms, storeys, door position in the local frame.
