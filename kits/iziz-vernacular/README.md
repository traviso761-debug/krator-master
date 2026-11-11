# kits/iziz-vernacular: the Iziz Vernacular

The Iziz Vernacular, the building culture of Iziz's settlers: post-Cataclysm timber, plaster, salvaged sheet and orange
trim, poor to rich houses, trades, civic buildings, works, farmsteads, guild halls and the frontier, as `VERN.def` records
drawn with the `vn*` helpers and the `v*` kit items. Moved unchanged from `settlements/iziz/src` on 2026-11-03
(MODULARITY-PLAN.md step 4): it is a culture kit, not Iziz's layout, and the open-world rebuild will place it anywhere
the Izani live.

| File | What |
|---|---|
| `src/69b-vern-mat.js` | textures (world units: a 128 px tile = 2 m), materials, geometry, kit items (`v*`) |
| `src/69c-vern-helpers.js` | the `vn*` helpers: primitives, walls, frames, plinths, roofs, `vnWin`, `vnDoor`, `vnLamp`, stairs, verandas, yard props; `VERN.def`, `VERN.place` |
| `src/69e-vern-hollow.js` | the hollow bodies (`vnBody`, `vnBand`) the interiors plan in |
| `src/69e5-iziz-openings.js` | real doors and glass (`vnPlate`, `vnHole`, `vnOpening`, `IZDOOR`, `IZ_ROOMC`) |
| `src/69f-iziz-fixtures.js` | the doors, windows and lamps noted for `core/tags` (reads only) |
| `src/70-vern-dwellings.js` | poor, middle and rich houses |
| `src/71-vern-trade.js`, `71a-vern-food.js`, `71b-vern-cloth.js`, `71c-vern-craft.js` | the trades: shops, taverns, workshops, food, cloth, crafts |
| `src/72-vern-civic.js` | school, hospital, barracks and the rest of the civic set |
| `src/73-vern-infra.js`, `73b-vern-works.js`, `73c-vern-land.js` | infrastructure, works (mine, quarry, water), the farm belt |
| `src/74-vern-guilds.js`, `74b-vern-frontier.js` | the guild halls; the frontier set (the Governor's House among them) |
| `src/74z-vern-trades.js` | every Voth census trade and the building that carries it (`VERN.trades`) |

`vernacular.py` names the files (`FILES`, `BASE`, `BUILDINGS`) and their paths. `bundle_files()` is THE Vernacular bundle the
contract asks for (`VASSAL-KITS.md`, "The bundle"): the Ancients core (from `kits/ancients/src` and `core/materials`), the kit's
foundation and every building fragment. Verge's and the isle demo's `IZV` take it and add their own extra (Verge the Ancients
funicular, the isle demo Iziz's `88y-iziz-matlib.js`); until 2026-11-03 each kept a copy of the list, and Verge's lacked `71a`-`c`,
`73b` and `73c`. `PORT.md` has their port tags (moved with them from Iziz's).

**What it draws through.** The Ancients core: `10-core`, `12-stats`, `30-kit`, `32-surfaces`, `34-kitdefs`, `38-helpers2`,
`50-registry`, `54-mat-concrete`, `69-mat-salvage` (`kits/ancients/src`, which Iziz vendors), with `core/materials` (`20-textures`,
`22-materials`, `68-mat-v5`, `opt/69a-world-uv`). Its library bind, `88y-iziz-matlib.js`, is still Iziz's (it binds Iziz's
`materials.json` families; it moves to `core/materials` with step 4's matlib item).

**The dark voids left** (the doors-and-glass pass, 2026-11-03). Every doorway and window draws through 69e5 (a real leaf in
`KDOOR`, `KGLASS` glass over the room card), and `vnStrip`, `vnWin`'s dark plate and `vnDoor`'s recess in 69c are wrapped
there. What still draws `vDarkB` (`MAT.void`, unlit) is not an opening, and stays dark on purpose: furnace, kiln, forge and
oven mouths behind their embers (`71` the kiln and the smithy's hearth, `71b` the dye vats' fires, `71c` the forges and the
chimney's flue, `72` the bakehouse oven, `73c` the farm hearth, `74` the brazier and the guild forge), wells and cisterns
(`72` the well, `74` `vgWell`, `73` the standpipe's trough), troughs, drains, culverts and pits (`71` and `73c` the sawpits,
`71b` the tannery's drain, `73b` the tail race's culvert, `73c` `vldTrough` and the boat's bilge, `74` `vgTrough`), the vent
cowls' mouths and a tank's open end (`73b`), the quarry's drill grooves and parting gaps (`73b`), oil stains (`71c`), the
Ancient panels' cell slots (`71c` `vcrPanel`) and a basket's mouth (`73c`). `vWinGlass` (the opaque dark glass) is left on
water (troughs, pools, the mill race) and the wrecked robot's eye (`74`).

**Who takes it.**
- Read in place: `settlements/iziz` (its `vernacular` target is the kit's sheet; the city places it), and through Iziz's
  page `kits/pylon` and `kits/talia`, which are written on its contract (`settlements/iziz/VASSAL-KITS.md`);
  `settlements/verge` and `settlements/isle-demo` bundle it as `IZV` (`bundle_files()`).
- Vendored, checked against this kit (`--vendor-check`): Highlands and Dalab (`69b`, `69c`), Ys (`69b`, `69c`, `69e`, `70`, `71`);
  Xanadu and Reed Lake take Highlands' copies.

**Its own sheet.** Not yet: the kit's sheet is Iziz's `vernacular` target (`dist/iziz-vernacular.html`), and
`verify.py dist/iziz-vernacular.html --assert` in `settlements/iziz` is its check. A `build.py` of its own (the sheet, Pylon's
and Talia's mixed streets) waits: the sheet runs on Iziz's page shell (its scene, rows and views, `targets/vernacular`), so
the kit building it today would read the settlement, as Pylon and Talia do (MODULARITY-PLAN.md step 4).
