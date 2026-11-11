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
- Read in place: `settlements/yuni` (the city places the buildings; its `sheet` target, `yuni-assets.html`, is the kit's sheet).
- Read in place on Locus's frame (2026-11-03): `settlements/locus` (its own frame, `53-assets.js`, has the kit's `F.opening`,
  `F.mass` and `F.doorIds`, but no fixtures registry or interiors planner, so an opening there is a door point and a mass draws
  nothing; its doors are locked unless `?interiors=1` plans a room behind one), and through Locus Mungo and Verge's `YKIT`. Until then Locus kept an older fork of these files.
- The interiors kit's sets `kits/interiors/sets/yuni.js` and `yuni-town.js` furnish these buildings by key.

**Its own sheet.** Not yet: the sheet is Yuni's `sheet` target, on Yuni's page shell, and `verify.py yuni-assets.html
--assert` in `settlements/yuni` is its check.
