# The isle demo: the site planner

Roadmap stage 6's example: two Islander towns, Kautoa (a city) and Valapo (a village), on the scale model's Ring Sea
isles. `PLAN.md` holds the assay and the plan (P0-P8). This folder is P4, **the site planner**, where the owner lays
out the two towns (P5). Both are drawn (2026-10-18, `site/isle-site.json`); `PLAN.md` section 8 is their programme.

```
python3 build.py                       # writes dist/isle-site.html
python3 serve.py                       # http://127.0.0.1:8817/dist/isle-site.html  (?town=Valapo for Valapo)
python3 verify.py dist/isle-site.html --assert [--shots DIR]
```

## What it is

**Voth's site editor, read in place** (`settlements/voth/targets/voth-site`, never copied or edited):
- its page shell, with this page's words swapped in;
- the site model (`10-site-model.js`): districts, markers, avenues, causeways, stops and lines, and ground edits;
- the scene (`50-site-scene.js`): the ground mesh, water, shoreline, overlay, labels and minimap;
- the tools (`55-site-tools.js`): drawing, editing, undo and redo, ground brushes, import and export.

**On the open world's ground.** The page carries:
- the region (`openworld/isle-demo/data`);
- the world's own height and colour fragments: `openworld/isle-demo/src/world/41-world-fields.js` and `42-world-roads.js`, and
  `openworld/isle-demo/src/43-world-isles.js` (the coast as terrain, the climate classes' colours).

So the planner's ground is the world's, to the centimetre (a verify check). What the owner draws here will stand where
the world draws it.

**One town at a time, each in its own frame** (`src/10-isle-frame.js`):
- metres, x east, z south;
- the origin at the town's settlement point in the open world (Valapo's moved 3.7 km toward its coast: `ISLE.SHIFT`);
- heights above the Ring Sea (0 m here, -1500.09 m in the world);
- the planning square is 7.8 km across.

The site file keeps each town's frame with its drawing: `{site, version, towns: {Kautoa: {frame: {x, z, sea},
districts, markers, avenues, causeways, stations, routes, terrain}, Valapo: {...}}}`. P6 (the city plan) and P8 (the
bake) put a drawing back in the world with its frame.

**This page's own fragments:**
- `10-isle-frame.js` [G data]: the frame, and the `VOTH` object Voth's fragments read, made from the world's fields.
  Voth's cantons, docks and districts are empty lists. `CANT` stands in for the canton plan, which is not on this page.
- `56-isle-tools.js` [web]:
  - saving each town into its own entry of `site/isle-site.json` (serve.py merges it in);
  - a draft per town;
  - the town buttons;
  - the views centred on the town;
  - the isles' words for Voth's ferries and elephant bugs: canoe landings and land stops.
- `98-isle-start.js` [web]: decode the region, raise the town's ground, load its site.

**Voth's files are hashed** in `voth-sources.json`. A build that finds one changed says so. Re-check the planner against
it, then run `build.py --accept`, or vendor the file and track its drift.

## Using it

- **The buttons and keys are Voth's** (the hint line explains each tool). 1-6 draw districts, 7 places a marker, 8 an
  avenue, 9 a causeway or jetty, R/L/M edit the ground, B places a canoe landing, N a land stop, K makes a line.
- **Kautoa / Valapo** switch towns. The page reloads on the other town; unsaved changes stay as that town's draft.
- **save** writes this town into `site/isle-site.json` (serve.py must be running), else downloads it.
  **export JSON** / **copy JSON** give this town's site with its frame. **import** takes a town's site or the whole file.

## Checks (2026-10-15)

`verify.py --assert`: both towns load clean (about 0.7 s headless). The checks:
- each frame is its settlement point, on land;
- the ground equals `WORLD.H` at 24 samples, and the frame's sea is the world's water level;
- the editor adds, undoes and redoes, and the save payload carries the frame;
- serve.py merges one town and keeps the other, and refuses a site with no frame or no such town;
- the Voth files read are the ones recorded.

There are two negative controls, a moved frame and a payload with no frame; both are caught.

## The city page (P6): `dist/isle-city.html`

```
python3 build.py                                          # writes both pages; the city's [G data] half as dist/isle-city.plan.js
python3 -m http.server 8829 --directory .                 # http://127.0.0.1:8829/dist/isle-city.html (?town=Valapo)
python3 verify.py dist/isle-city.html --assert [--shots DIR]
node tests/test-isle-city.js                              # the plan without a browser (about a minute)
node tools/scale-site.js                                  # (superseded: the owner's drawings are at size; --write needs --force)
```

**Both towns on core/city,** one `KCITY` instance each (`src/32-isle-city.js`): `rand: 'krand'`, `index: 'insertion'`, the
exact-streets rule and the "high" stance (a house's floor at its highest corner, its footing down the slope). Steps 0-5
come from the owner's site file and the programme (`src/30-isle-programme.js`, PLAN.md section 8); steps 6-12 are
core/city's builder. A new layout, not a hash-identical port.
- **The owner's drawings at the towns' size** (2026-10-18; `site/isle-site.full.json` keeps the first, full-size
  drawing). The owner's ground edits from the planner (raise, lower, smooth) are replayed onto each town's ground exactly
  as the planner keeps them (`ISLE.terrainDelta`), so Valapo's raised beaches stand where they were drawn.
- **Kautoa** (about 6,000 people, at least two thirds of the build area built): every frontage built, each house in a
  walled compound (a yard behind and beside it, drawn as a low wall), single-family houses; the palace, the ceremonial
  square and the Governor's House at their markers facing the ceremonial park, five envoy houses, a council hall, a
  school, a healer and two chiefs' houses round its ring; the harbour in thirds (fishing west, trade middle, the naval
  base east); a works quarter inland of it; a caravanserai in Ridertown by the west gate; the wall round the build area
  with a gate wherever an avenue reaches it. Each landmark on the slope stands on a terrace cut into the town's ground
  (`KCITY.ground.levelPad`).
- **Valapo** (about a third of Kautoa): no build area drawn, so it grows from the village hall: built ground within a
  radius of it or near the shore, the avenues and the markers (`grow`, the dial for its size); its parks are white sand
  beaches; two harbours (the fishing fleet, the garrison and the trade landing west; the smelter by Market 2 south); a
  caravanserai at the owner's marker A. What open ground is left is farmland by PLAN 8c's crops.
- **The built share** (`_city.cur.R.cover`, a check for Kautoa): every cell of the build area on land counted as built
  (a house's compound, a street or its 2.5 m verge, a landmark, market or plaza) or open (free ground, parks, too steep).
  The census also gives the share the roofs alone cover.
- **Sizes** at five a household: Kautoa about 1,700 buildings and 6,200 people; Valapo about 570 and 2,150.
- **Beyond the square** (the farm ring, the fishing villages, the highways past the gates, Valapo's iron mine camp and
  its cart road) are world records in the probe (`_city.world`), placed later by the open world.

**Placement needs no drawing code.** build.py reads every kit piece's declared box from the kits' sources (`ISLE_DIMS`,
`ISLE_VDIMS`); the plan places by those, so node, the browser and Godot plan alike. The region's rasters arrive as
integers decoded by build.py (`WORLD_RAW`): the page reads no canvas.

**Drawing** (`src/60-isle-draw.js`): the kits read in place and sealed in closures (`bundles.py`): `ISK` (the Islanders,
with kits/resources and the farm animals), `IZV` (the Iziz Vernacular), `CAT` (the Beast Riders kit's buildings: its own,
and its ports of Mav's Refuge's shrine and roost drawn by the town's sealed engine, `kits/beast-riders/towns.py`, whose
maps are the sidecar `isle-city.tex.brtowns.js`), `RINGSEA` (through `settlements/voth/ringsea.py`). Each piece is built
once and drawn instanced: in full within 520 m of the camera's target (2,600 at most), as massing beyond. A port keeps its
town's materials, the towns' shader hooks put on their plain-mesh branch (`DRAW.portMats`). No furniture on this page (the
export profile, P6b, brings it), but what a port's town drew into it.

**Checks** (`src/34-isle-census.js`, run by verify and the node test): exact footprint overlap, nothing on a street, in
the sea or on the wall, the vessels afloat, the programme's landmarks and districts, both harbours' vessels and the six
origins, the wall's named gates, the landing, the size in citizens, the hug, the farmland; that the declared boxes are
the bundles' own. Negatives: a building pushed onto another, one pushed into the sea, the palace taken away.

See `KNOWN_ISSUES.md`.
