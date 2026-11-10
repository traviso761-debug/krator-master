# kits/yuni: the Yuni kit

The buildings of Yuni, the walled city in the south-east valley of the Outer Wall (`settlements/yuni`): Sahel earth
architecture crossed with Gaudi (Djenne and Sankore, Musgum shells, Tiebele paint, Hausa relief, parabolic portals and
trencadis). Poor to rich houses, the Emir's palace, the trades and the Order's public buildings, as `ASSET` records drawn
through a local frame `F`. Moved unchanged from `settlements/yuni/src` on 2026-11-03 (MODULARITY-PLAN.md step 4b): it is
the city's building culture, not its layout.

| File | What |
|---|---|
| `src/55-mid-example.js` | the reference asset (the washed pinnacle house): the pattern every asset fragment follows |
| `src/56-mid.js` | middle-class houses and the trades: shops, taverns, workshops, the caravanserai, the market |
| `src/57-poor.js` | the poor quarters: Musgum shell houses, painted egg huts, Mandara cone clusters, banco houses, compounds, granary, shade hangar, pen, well, lean-to |
| `src/58-rich.js` | the wealthy compounds and the Emir's palace |
| `src/59-civic.js`, `59a-civic-park.js`, `59b-civic-library.js`, `59c-civic-furniture.js` | the Order's civic buildings (Djenne and Sankore types, bathhouse, bell tower), the Parc-Guell-like park, the Library of Yuni, and the Order's library and school furniture (`FURN`, culture `order`). The three parts continue `59-civic.js`: one `reseed` stream, one unit for the build rules |

`yunikit.py` names the files (`FILES`) and their paths. `PORT.md` has their port tags (moved with them).

**What it draws through.** The Yuni engine, which stays in `settlements/yuni`: `05-palette.js` (`PAL`), `10-core.js` (its
own `rnd`/`reseed`, the owner's exception to `core/rand`), `45-kit.js`, `47-texture.js`, `51-fixtures.js` (tagged doors,
windows and openings) and `53-assets.js` (`ASSET`, `FURN`, the frame `F`: `F.door`, `F.opening`, `F.mass` for the interiors
planner). The engine is not a kit or a core module: each world that runs it has forked it with its own constants inside
`10-core.js` (MODULARITY-PLAN.md step 4b says why).

**Openings (core/door, 2026-11-03).** No black plates: a builder draws an opening through the frame, which both forks
(Yuni's and Locus's `53-assets.js`, helpers in `45-kit.js`) carry. `F.door` is a working door (a KDOOR record,
`<key>.<n>.d<i>`); `F.window` a pane of glass (`81-glow.js`, KGLASS) over the room card (`ROOMC`, KGLASS's `room`
colour); `F.card(...)` the room card alone (an open hut mouth, a shop within its front, a vent: F.box's arguments without
the colour); `F.paneBox(...)` a glazing panel (card and glass, `o.kind`, `o.out`); `F.pane(...)` glass alone;
`F.doorway(...)` a doorway drawn as a panel, now a locked leaf (`o.col`, `o.fam`, `o.out`). A void that is not an
opening (a smoke hole, a flue's top, a well, a pot's mouth, a trough, a shadowed floor) stays `VOIDC`.

**Who takes it.**
- Read in place: `settlements/yuni` (the city places the buildings; its `sheet` target, `yuni-assets.html`, still builds: the
  kit with the city's own Ancients assets and interiors, on the city's page).
- Read in place on Locus's frame (2026-11-03): `settlements/locus` (its own frame, `53-assets.js`, has the kit's `F.opening`,
  `F.mass` and `F.doorIds`, but no fixtures registry or interiors planner, so an opening there is a door point and a mass draws
  nothing; its doors are locked unless `?interiors=1` plans a room behind one), and through Locus Mungo and Verge's `YKIT`. Until then Locus kept an older fork of these files.
- The interiors kit's sets `kits/interiors/sets/yuni.js` and `yuni-town.js` furnish these buildings by key.

**Its own sheet** (2026-11-09): `python3 build.py` writes `dist/yuni.html` (the library maps beside it, `dist/yuni.tex.yuni.js`);
`python3 verify.py --assert` checks it (`sheetverify.py`: every asset and variant builds and is registered, the core/tags
vocabulary, the doors as KDOOR records, the library textures, the engine read in place). Every asset of the kit, each variant,
in its family's row with a 1.75 m figure, fronts north; the Order's furniture (`59c`, FURN) in a row of its own; a label over
each piece near the camera, a button per row, a select and Prev / Next (the arrows) through the pieces, Front / Back / Plan.

How it is split (MODULARITY-PLAN.md step 4b: the engine is not a core module and stays in each world that forked it):
- **The engine, read in place from `settlements/yuni/src`, never copied** (`sheetbuild.YUNI_ENGINE`): `05-palette`, `10-core`,
  `45-kit`, `47-texture`, `50-structure`, `51-fixtures`, `53-assets`, `72-lights`, `81-glow`, `86-inspect`. The sheet target
  (`YUNI_TARGET`, `10-core.js` `SHEET`) switches off the world those files carry (the river, the butte, the terrain).
- **The page shell from core**: `core/host` (camera, walk, panel, probe, the inspector, marks), `core/walk` (the ground a floor,
  each building's footprint a block, the doors' leaves), `core/door` (KDOOR, KGLASS, KDOORHOST: the E key and its tip),
  `core/atmos/placeholder` (KratorSky), `core/tags`, `core/rand`, `core/materials/record`. The library pack is Yuni's
  (`settlements/yuni/materials.json`, `tex/`), read in place: the engine's families are Yuni's palette (`05-palette.js` FAMMAT).
- **The sheet's own fragments**, `targets/sheet/` (the Yuni lineage's sheet shell, which `kits/locus` and `kits/eastern-abyssal`
  take too; `sheetbuild.py` is the recipe they share, `sheetverify.py` the checks): the head and tail, the stage (scene, camera,
  renderer, two lights), the sky's binding, the layout, the emit and ground, the labels and controls, the take on core/host.
  The layout follows Yuni's `70-sheet.js` and `89-sheetui.js`; the rows are narrower (420 m, not 2.5 km).

Where the split is not clean, and what was done about it:
- `50-structure.js` reads one name of Yuni's layout at load (`BRIDGES`, `30-layout.js`): `targets/sheet/30-ys-world.js` gives it
  the empty list a sheet has.
- Yuni's doors are bound in its `76-doors.js`, with the interiors planner (`64-interiors.js`) and the walker: the city's code,
  not taken. The shell binds them as `settlements/locus/src/95-locus-doors.js` does: every door into a room is locked as built
  (no room is planned behind it on a sheet), a door into a court or onto the street opens with E, its leaves posed at Yuni's
  swing. So the kit's sheet has no interiors; Yuni's own `yuni-assets.html` plans them, with the city's planner.
- The building records say `build:'yuni'` (`51-fixtures.js` makes `KTAGS.page` with Yuni's name).
- Walking: the footprints are blocks, so the walker goes round a building, not into it.

Yuni's `sheet` target (`settlements/yuni`, `yuni-assets.html`) still builds, byte for byte as before; it stays as long as the
city does (it shows the kit beside the city's Ancients assets, with the city's interiors). Mungo's and Verge's pages are
unchanged: nothing they read moved.
