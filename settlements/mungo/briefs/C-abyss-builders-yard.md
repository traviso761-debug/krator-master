# Brief C: a building-materials shop for the Eastern Abyssal kit

Read `settlements/mungo/briefs/00-common.md` first.

## Why
Mungo's market (between its reed village and its abyssal town) must have "a full set of weapon, armor, general, food,
alchemy, and building material shops". The Eastern Abyssal kit (in the Locus build) has weaponsmith, armourer,
general goods, cookshop, alchemist, salvage dealer, salt merchant and sailmaker, but **no building-materials shop**.
The owner: "if inventing a new one, put it in its culture's kit after building it rather than making a whole new kit".
Mungo's lumberjacks also deliver felled timber there, so it doubles as the village's timber yard.

## Build it
- Read `settlements/locus/ABYSS-KIT-NOTES.md` (all of it: the style as built, the helpers, the rules),
  `ABYSS-KIT-KNOWN-ISSUES.md`, `API.md` (furniture is catalog data placed with `ABYSS.furn`), and
  `settlements/locus/src/65-abyss-40-shops.js` (21 KB: the eight shops; your model) plus the helpers you need from
  `65-abyss-00-core.js` (42 KB: read by section, `grep -n 'ABYSS [0-9]' ...`).
- Add ONE asset at the end of `65-abyss-40-shops.js`, inside that fragment's IIFE, seeds from the fragment's own block
  (654xxx, unused), builders use `F.rnd()/F.rr()/F.pick()` only:
  key `abyss_shop_builder`, name `Builders' yard`, `kit:'abyss'`, group `Shops`, culture `abyssal-desert`,
  types `['market/shop','industry']`, `sim:{activity:'TRADE', capacity:6}` (and a second activity for deliveries if the
  `sim` field allows a list: check `53-assets.js`), 2 variants, footprint about 18 x 14.
  What it is: the abyssal builders' merchant and timber yard: a plank-and-container office with a counter under a
  swooping sail; racks of seal-tree and scale-tree poles and sawn planks (the eastern-abyss biome's timber), bundled mat
  reed for thatch, stacks of salvaged corrugated sheet and drums, clay bricks and lime sacks, a saw-pit or a hand-cranked
  saw bench, a hoist derrick on one variant. Use the kit's vocabulary (containers, drums, tin cladding, sails, plank
  decks on piles, lanterns); salvage used with pride.
- Every loose thing (stacks, racks, sacks, saw bench) is FURNITURE from the master catalog placed with `ABYSS.furn`:
  look in `kits/catalog/krator-master-furniture-jobs.js` and `-eastabyss.js`, `-scrap.js`, `-generic-goods.js` for
  timber stacks, plank piles, sacks, bricks. If the catalog lacks a piece you need (a plank stack, a pole rack, a brick
  pallet, a saw bench), ADD it to `kits/catalog/krator-master-furniture-jobs.js` with a `job` (look at `FURN_JOBS` for the
  vocabulary; add `'carpentry'`/`'building'` only if none fits, and say so) or to `-eastabyss.js`, in the catalog's
  style (`kits/catalog/README.md` "Furniture by culture", `kits/furniture/SPEC.md`), then
  `cd kits/catalog && python build.py && python verify.py dist/catalog.html --assert --page jobs` (one page; slow).
- Interiors: add `abyss_shop_builder` and `abyss_shop_builder#1` items to `kits/interiors/sets/abyss.js` (read
  `kits/interiors/sets/README.md`; programme `shop` plus a `store`; an open yard part is open ground, not a room).
  Check with `cd kits/interiors && python build.py --sets-page abyss && python verify.py
  dist/interiors-sets.abyss.html --sets --assert --query "set=abyss&only=abyss_shop_builder,abyss_shop_builder%231"`.
  Do NOT run the interiors `build.py` without `--sets-page` (other agents are writing other set files).
- Build Locus: `cd settlements/locus && python build.py` (note: `build.py` has uncommitted edits by another session:
  leave them; do not edit build.py). Verify the abyss sheet: `python verify.py abyss-kit.html --assert --out <scratch>/shots`
  and the kit shots: `python kitshots.py <scratch>/shots --sheet abyss-kit.html abyss_shop_builder:0:f abyss_shop_builder:1:f
  abyss_shop_builder:0:n` (read `kitshots.py --help` for the view letters). Look at them. Confirm `locus.html` still
  builds and its verify passes (`python verify.py locus.html --assert`; slow).
- Docs: add the row to `ABYSS-KIT-NOTES.md`'s table (and the budget line), a dated line in its notes, and the
  interiors item note.

## Files you own
`settlements/locus/src/65-abyss-40-shops.js`, `settlements/locus/ABYSS-KIT-NOTES.md`, `settlements/locus/ABYSS-KIT-KNOWN-ISSUES.md`,
`kits/interiors/sets/abyss.js`, `kits/catalog/krator-master-furniture-jobs.js` / `-eastabyss.js` (additions only).
Rebuilt outputs (`settlements/locus/*.html`, `publish/`, `kits/catalog/dist`, `kits/interiors/dist/interiors-sets.abyss.html`) are fine.
Do not touch any other Locus fragment.

## Done when
`abyss_shop_builder` (2 variants) is on the abyss sheet, reads as a builders' merchant and timber yard at eye level,
places its loose goods as catalog furniture, has interiors that pass `--sets --assert`, and Locus still builds and
verifies. Report per `00-common.md` (with the footprint, door/counter positions in the local frame, triangle counts).
