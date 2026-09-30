# Prompt for ChatGPT: build the Jimjam city kit

*(Copy everything below the line into ChatGPT. Attach the five reference images with it. If ChatGPT cannot read the GitHub repo `traviso761-debug/krator-master` directly, also attach the files listed in section 2.)*

---

You are going to build a **new procedural building kit** for my project, Krator. Krator is a set of procedural Three.js worlds. Each world or kit lives in its own folder, is written as numbered JavaScript source **fragments**, and is concatenated by a Python script (`build.py`) into **one self-contained HTML file** that renders the buildings in a browser.

The new kit is for the city of **Jimjam**. It must follow the same structure and rules as an existing kit in the repo, the **Iziz Vernacular** set (`settlements/iziz/`). Treat Iziz as the template. Copy its **structure and conventions**. Do **not** copy its buildings or its look, because Jimjam is a different culture.

Please read this whole prompt before you write any code. It is long on purpose. Every rule here comes from a real mistake. If something is unclear, **ask me instead of guessing**.

---

## 1. What "a functioning kit" means (the definition of done)

A kit is finished when all of these are true:

1. A folder `settlements/jimjam/` exists, laid out like `settlements/iziz/` (see section 4).
2. Running `cd settlements/jimjam && python3 build.py` finishes with **no errors** and writes `dist/jimjam-kit.html`.
3. Opening that HTML file in a browser shows **every building in the list in section 6**, laid out in rows on a flat ground plane, with no error shown in the on-screen error panel.
4. Every building is a **procedural generator function**, not a hand-placed model. It builds from rules plus a seed, and it looks the same every time the page loads (deterministic).
5. Every building is **registered** with a name, a classification and tags (section 8), so that the inspector tool shows them when you hover over it.
6. The page has the standard dev tools: **inspector**, **polygon tool**, **walk mode**, **floating labels**, **preset camera views** (section 9).
7. The page uses the **standard Krator skybox** (sun + gas giant).
8. `python3 verify.py dist/jimjam-kit.html --assert ...` passes, and the screenshots have been **looked at**.
9. The docs exist: `README.md`, `DESIGN.md`, `API.md`, `KNOWN_ISSUES.md`, `NOTES.md` and a generated `INDEX.md`.

"The code looks right" is **not** done. "It builds" is **not** done. It is done only when it renders with no errors and the screenshots show the right buildings.

---

## 2. Read these first, in this order

Before writing anything, read these files from the repo. If you can't open the repo, tell me and I will paste them:

1. `README.md` (repo root): project-wide design rules. Covers tagging, modularity, flora kept separate from buildings, the inspector and polygon tools, and the skybox.
2. `CLAUDE.md` (repo root): working rules. Edit only `src/` and `targets/`. Never open or edit `dist/`.
3. `settlements/iziz/INDEX.md`: the list of every Iziz fragment and what it contains.
4. `settlements/iziz/API.md`: **the contract. This is the most important file.** It covers the `VERN` registry, the kit items, the helpers, how to add a building, targets and the probe.
5. `settlements/iziz/DESIGN.md`: how the Iziz Vernacular brief was written. Write Jimjam's `DESIGN.md` the same way.
6. `settlements/iziz/src/69b-vern-mat.js`: how textures, materials and kit items are defined.
7. `settlements/iziz/src/69c-vern-helpers.js`: the registry (`VERN.def`, `VERN.place`, `vnReg`) and the building-block helpers.
8. `settlements/iziz/src/70-vern-dwellings.js`: a worked example of 8 dwellings across 3 wealth tiers. Copy its pattern exactly.
9. `settlements/iziz/targets/vernacular/89z-rows.js` and `91z-views.js`: how the showcase lays out the buildings and defines camera views.
10. `settlements/iziz/build.py`: what the build checks. It fails on duplicate or over-generic top-level names, on a `build*()` function that does not start with `reseed(N)`, and on a generative fragment with no reseed.
11. `core/sockets/README.md`: the socket system for banners, awnings, flags, emblems and shop signs. Use it for Jimjam's banners and shop signs.
12. Inside `painting-to-3d-world.skill` (a zip file): `painting-to-3d-world/SKILL.md` and `references/threejs-pitfalls.md`. These list the Three.js mistakes that have cost the most time.

Some files are huge and generated. **Never open or search** `dist/`, `three.min.js`, `*.zip` (except to read the skill above), `shots/`, `archive/`, or any `.html` in a build folder.

---

## 3. How the code works (read this even if it seems obvious)

- **All fragments share one JavaScript scope.** `build.py` concatenates every file in `src/`, then the target's files, in **filename order**, into a single `<script>`. So:
  - Every top-level `function`, `const` or `let` is a **global** visible to every other fragment.
  - Two fragments that both declare `const MAT` or `function box` will **break the build**.
  - A local variable with a common name (`seed`, `base`, `pos`, `dir`, `h`) can silently clobber another file's global. **Prefix every top-level name in Jimjam's own code with `jj` or `JJ`** (for example `JJ.def`, `jjDome`, `JPAL`, `buildJjTemple`).
  - File order matters. Something defined in `72-...js` cannot be used at the top level of `70-...js`. Inside functions called later it is fine.
- **Units:** metres. `x` = east, `z` = south, `y` = up. A person is **1.75 m** tall. A normal storey is **3.2–3.6 m**, and a grand civic storey is **5–8 m**. Check every dimension against a 1.75 m person.
- **Local frame:** each building function builds around its own origin. The origin is at the **centre of its plot, on the ground**, and **+z is the front** (the entrance faces +z). A building function **never** uses world coordinates. `JJ.place(scene, key, x, z, ry, o)` moves and rotates it.
- **Instancing:** repeated pieces (bricks, columns, merlons, windows, domes) are drawn through the instancing kit (`kdef` / `kput` / `kbake`). Don't create a new `THREE.Mesh` for every brick, column or merlon, or the page will crawl. Read how `69b-vern-mat.js` defines kit items and how `70-vern-dwellings.js` places them with `vB(...)`, `vPst(...)` and so on.
- **Bake order:** `kbake(scene)` runs once, after all buildings are placed. Anything pushed into the kit **after** the bake silently never appears. It raises no error, so the building just has missing parts. Place everything before the bake.
- **Determinism:** never use `Math.random()`. Use the kit's `rng()` / `rr(a,b)` after `reseed(N)`. **Every** `buildJj...` function's **first line** must be `reseed(<unique number> + (o.v|0));`. Use seed block **9100–9999** for Jimjam and give each building its own number, leaving gaps of 10 for variants.
- **Materials:** as in Iziz, paint the textures near-grey and **tint per instance** with a colour, so one material can serve many colours. Every textured material needs **world-unit UVs** (Iziz's `vWorldUV`) so bricks are the same size on a 3 m wall and a 30 m wall. Custom `BufferGeometry` **must have UVs**, or the textures silently don't show.
- **Z-fighting:** two faces in the same plane (a cornice top flush with a roof top, a marble band flush with a brick wall) flicker. Offset one by 0.02–0.05 m.
- **One `InstancedMesh` per material.** Skip instanced meshes that have zero instances.

---

## 4. Folder layout to create

Build it as a **new folder** by copying the *engine* from Iziz, not its buildings:

```
settlements/jimjam/
  build.py            copied from iziz, adapted: targets = ['kit'], output names jimjam-*.html
  verify.py           copied unchanged from iziz
  jscheck.py          copied unchanged
  run.sh              copied, paths adapted
  three.min.js        copied unchanged
  VENDOR.json         sha1s of the vendored fragments (see below)
  README.md DESIGN.md API.md KNOWN_ISSUES.md NOTES.md
  src/
    00-head.html               copied from iziz; change the <title> to "Jimjam Kit"
    10-core.js 12-stats.js 30-kit.js 32-surfaces.js 34-kitdefs.js 36-decor.js
    38-helpers2.js 50-registry.js 54-mat-concrete.js         VENDORED from iziz, byte-identical, do not edit
    (20-textures.js 22-materials.js 68-mat-v5.js come from core/materials/ through build.py, as Iziz does)
    37-sockets.js 80-cultures.js   copied from core/sockets/ (add a 'jimjam' culture pack in YOUR OWN fragment, not by editing these)
    81-sky.js                  the standard Krator skybox, copied from iziz
    60-jj-mat.js               NEW: Jimjam textures, palette, materials, kit items (prefix j / J)
    61-jj-helpers.js           NEW: JJ registry + building-block helpers (prefix jj)
    62-jj-culture.js           NEW: the 'jimjam' socket culture pack (banners, sun emblem, shop signs)
    70-jj-housing.js           NEW: 9 houses
    71-jj-shops.js             NEW: 8 shops
    72-jj-hospitality.js       NEW: inn, tavern, caravanserai
    73-jj-civic.js             NEW: library, school, amphitheater
    74-jj-sacred.js            NEW: the solstice temple
    75-jj-palace.js            NEW: Raja's palace + great sunray plaza
    76-jj-military.js          NEW: fortress, barracks, walls/gate/tower
    77-jj-agri.js              NEW: farms, granary, windmill, farmhouses, warehouses
    90-scene.js 91-probe.js 92-camera.js 93-labels.js 99-tail.html   copied from iziz, adapted to loop JJ instead of VERN
  targets/kit/
    89z-rows.js                NEW: TITLE, GROUND_C, SITES (the rows of buildings)
    91z-views.js               NEW: VIEWS (camera presets)
```

Do **not** copy these from Iziz: `40-…48`, `52-58`, `64-66`, `69-mat-salvage.js`, `69b`, `69c`, `70-79`, `82-89`, or `targets/city/`. Those are Iziz's own buildings and city. If `90-scene.js` or `92-camera.js` reference something from those files, remove or stub that reference and tell me what you removed.

If `build.py` has a list of vendored files or scoped files, update it so it matches the new folder. After copying, run `python3 build.py --vendor-check` and make sure it reports **no drift**.

---

## 5. The Jimjam style brief

**Jimjam is an exotic city of red and yellow brick with white marble trim. It has many domes, thick spires and raised plazas. At its centre is a temple with an arch that frames the sun on the summer solstice.**

What to take from each reference image (attached):

- **Image 1 (red pavilion in the snowy gorge):** deep lacquer-red walls with heavy gold/brass mouldings, **round porthole windows in thick gold frames**, a ribbed dome (dark slate scales with gold ribs) topped by a **lantern cupola**, a tall arched entrance with a round rose window above it, and warm lamps flanking the door. Use this for rich houses, the inn and palace pavilions. **Ignore** the snow and the mountains (not Jimjam's climate) and the fact that it's a train carriage.
- **Image 2 (red towers above the city):** **thick, tapering, cylindrical spires built in stacked stages**, each stage capped with a flared ring or balcony and ending in a dome with masts. Smaller **bulbous turrets clustered** on the flanks. Round windows, small square windows, vents. Use this for the silhouette of spires, wall towers, fortress towers and the windmill tower. Take the **massing** only: Jimjam is brick and marble, not painted sheet metal.
- **Image 3 (terraced hill town):** the city climbs in **terraces joined by stairs**. **Round raised plazas** sit on drum-shaped podiums, with **radial sunray / mandala patterns** inlaid on their tops in red, orange and white. Arcades of arched openings run along the terrace walls, crenellated parapets top them, and greenery spills over the edges. Use this for raised plazas, the amphitheater, the palace plaza pattern and terrace walls.
- **Images 4 and 5 (two contact sheets of an imagined red city):** red brick everywhere. **Columns wrapped in a diamond/lattice pattern** in lighter brick or marble, **gold/yellow domes**, **stepped pyramidal temple towers** (shikhara-like), long red banners with a **gold sun emblem**, crenellated fortress walls with thick round towers, **arcaded viaducts**, market shops under canvas awnings, reflecting pools in front of tombs and temples, and processional plazas lined with columns and statues. The labelled panels (HOUSES, SHOPS, SMALL TEMPLE, GRAND TEMPLE, FORTRESS, CITADEL, PLAZA, GARDEN) show what each building type should feel like. **Use these as the main guide.**

### Palette (put this in `JPAL` in `60-jj-mat.js`)

| name | approx hex | use |
|---|---|---|
| `brickRed` | `#A8322A` | the main wall material |
| `brickDeep` | `#7E2220` | plinths, shadowed bands, poor housing |
| `brickYellow` | `#D9A33A` | alternating bands, whole walls on some buildings, spire stages |
| `ochre` | `#E4B54A` | painted plaster on poor/middle housing |
| `marble` | `#F1ECE2` | trim: cornices, string courses, window and door surrounds, stair treads, column bases and capitals, plaza paving |
| `marbleVein` | `#D8D0C4` | secondary marble, paving joints |
| `gold` | `#D9A520` | domes on rich/civic/sacred buildings, finials, sun emblems (**not** on poor housing) |
| `slate` | `#2F3440` | the ribbed dark dome variant from image 1 |
| `terracotta` | `#C4602F` | roof tiles, pots, poor domes |
| `canvas` | `#E9D9B0` / `#C0392B` | awnings and banners |
| `turquoise` | `#3AA6A0` | small tile accents only (image 3) |

**Textures to make (procedural, drawn on a canvas, no image files):**
- **Red brick:** running bond with visible mortar. Tint it to get the red and yellow versions. Scale: **a 128 px tile = 2 m**, so bricks are roughly 0.25 × 0.08 m.
- **Banded brick:** red and yellow in horizontal bands. The bands show from a distance, which matters for the city read.
- **Diamond lattice:** for column shafts and some wall panels.
- **Marble:** near-white with faint veins.
- **Dome scales/ribs:** for gold, slate and terracotta domes.
- **Sunray inlay:** a radial pattern of alternating red and yellow wedges on marble, with concentric rings (image 3). This is used for plaza floors and **must be a separate texture** so any plaza can use it.

### Architectural vocabulary (build these as reusable helpers in `61-jj-helpers.js` BEFORE any building)

Every building should be assembled mostly from these pieces. Build the helpers first, test them, then build the buildings from them:

- `jjWall(x,y,z,w,h,d,ry,{band})`: a brick wall block, optionally banded red/yellow, with a marble string course at each floor line and a marble coping on top.
- `jjPlinth(...)`: a raised podium with a marble cap. **Raised plazas and raised ground floors are a core Jimjam feature. Most civic buildings stand on one.**
- `jjStairs(...)`: marble stairs up to a plinth, with cheek walls.
- `jjColumn(x,y,z,r,h,{lattice})`: a round column with a marble base and capital, optionally lattice-patterned.
- `jjArch(x,y,z,w,h,ry,{depth})`: a round-headed arch opening with a marble archivolt. Build it from instanced voussoir blocks or a lathe/extrude **with UVs**.
- `jjArcade(...)`: a row of arches on columns.
- `jjDome(x,y,z,r,{kind:'gold'|'slate'|'terracotta', shape:'hemi'|'onion'|'ribbed'})`: a dome on a short drum, with an optional lantern cupola and finial.
- `jjSpire(x,y,z,r,stages,{...})`: a **thick** tapering round tower built in stages (image 2). Each stage is a slightly narrower cylinder with a marble ring or balcony at the joint, ending in a dome or cone. `stages` is 2–5. This is Jimjam's signature silhouette, so make it read well from far away.
- `jjTurret(...)`: a small bulbous turret that clusters on a spire or a corner.
- `jjPorthole(x,y,z,ry,r)`: a round window in a thick gold (rich) or marble (middle) frame.
- `jjWindow(...)`: an arched window with a marble surround and optional shutters or a jali screen.
- `jjDoor(...)`: an arched door with a marble surround and a lamp either side if lit.
- `jjCrenel(...)`: a crenellated parapet (merlons as instanced blocks).
- `jjCornice(...)`: a stepped marble cornice.
- `jjRoundPlaza(x,y,z,r,{raised, inlay})`: a round drum-shaped podium with a paved top, optionally with the sunray inlay, with stairs.
- `jjAwning(...)` and `jjBanner(...)`: go through `sock('awning'|'banner'|'sign'|'emblem', ...)` from `core/sockets` so the culture pack draws the cloth.

Record each helper's signature in `API.md` as you write it.

---

## 6. The buildings (every one of these is required)

Each line below is **one `JJ.def(...)` entry with its own `buildJj...` function**, unless it says "×N variants". Where it says variants, write the variants as separate keys (for example `jj_house_poor_a`, `_b`, `_c`) so each is a distinct, recognisably different design, not the same box with a different seed.

**Housing: 3 variants for each of 3 tiers = 9 buildings**
- `jj_house_poor_a/b/c`: 5–8 m footprint, 1–2 storeys. Deep-red and ochre plastered brick, flat roofs with a parapet, or a small terracotta dome on one variant. Small square windows. External stair to the roof. Clustered as if in a dense quarter. **No** gold, and little marble (just a door lintel).
- `jj_house_mid_a/b/c`: 8–12 m footprint, 2–3 storeys. Red brick with yellow bands, marble string courses and window surrounds, arched windows, one porthole, a roof terrace, one small dome **or** a short turret per house. A shop-front option on the ground floor for one variant.
- `jj_house_rich_a/b/c`: 16–24 m footprint. A walled courtyard mansion on a plinth, marble stairs, an arcaded court, a **gold dome** or slate ribbed dome with a lantern, one thick spire or corner turrets, porthole windows in gold frames, a small pool or fountain spot in the court (the fountain is furniture, see section 7).

**Shops: 8 types** (each a separate key, each with a trade sign through `sock('sign', ..., {trade: ...})`, with open stall fronts, counters and goods-shaped props)
- `jj_shop_weapons`: weaponsmith. A forge chimney and weapon racks.
- `jj_shop_armor`: armourer. Armour stands, a shield wall.
- `jj_shop_general`: general goods. Crates, sacks, barrels.
- `jj_shop_food`: grocer/baker. A bread oven dome, produce baskets.
- `jj_shop_alchemy`: alchemist. A small dome, a smoking flue, shelves of jars, a coloured-glass porthole.
- `jj_shop_textiles`: cloth and carpet merchant. Hanging carpets and bolts of cloth. *(my pick for #6; ask if you want a different one)*
- `jj_shop_jeweler`: goldsmith/jeweller. A small, rich marble front, lit. *(my pick for #7)*
- `jj_shop_spice`: spice and potter's shop. Heaped spice cones, clay jars. *(my pick for #8)*

Shops are 6–10 m wide, 2 storeys, living quarters above, canvas awnings over the front. If a sign icon doesn't exist in `80-cultures.js` (`FOOD ARMOR WEAPONS TINKER GENERAL MESS`), add new icons **in `62-jj-culture.js`**, not by editing the vendored file.

**Hospitality**
- `jj_inn`: 3 storeys around a court, a gallery on arches, porthole windows, stables at the back.
- `jj_tavern`: a single hall with a domed or vaulted roof, an open arcade front with benches, a big chimney.
- `jj_caravanserai`: a square walled court (~50 × 50 m), a monumental arched gatehouse with a spire either side, two storeys of arched cells around the court, a well in the middle, and a camel/beast yard.

**Civic**
- `jj_library`: on a plinth, a large central gold dome over a reading hall, arcaded wings, tall arched windows, marble stairs.
- `jj_school`: a courtyard building with classrooms around an arcade and a small bell turret.
- `jj_amphitheater`: a semicircular or round tiered seating bowl in brick with marble seat edges, a stage building (scaenae frons) with arches and spires behind the stage, and entrances (vomitoria) through the outer arcade. About 70–90 m across.

**Sacred: the solstice temple (the city's centrepiece)**
- `jj_temple_sun`: a raised temple platform approached up a long flight of marble stairs, a **monumental freestanding or gatehouse arch** at the head of the stairs, and behind it a sanctuary with a gold dome and a stepped pyramidal tower (the shikhara in images 4 and 5), with four thick spires at the corners.
- **The arch must actually frame the sun on the summer solstice.** Treat this as a rule in data, not a picture:
  - Put `const JJ_SOLSTICE = {latDeg: 30, event: 'sunset', azimuthDeg: <computed>, altitudeDeg: 2};` in the temple fragment. For latitude φ, the solstice sunrise azimuth A (clockwise from north) satisfies `cos A = sin(23.44°) / cos φ`. At 30° that gives sunrise ≈ 62.6° and sunset ≈ 297.4°. **Compute it in code from `latDeg`**; don't hard-code the number.
  - The temple builder orients its **axis** (the line from the observer spot, through the arch, to the sun) along that azimuth. The building's `ry` in the showcase must be set so that holds, and the builder must **register an observer point** (for example `JJ.cur.def.solsticeObserver = [lx, ly, lz]` in the local frame, or a tag).
  - Size the arch opening so that, from the observer point at eye height (1.7 m), the sun at `altitudeDeg` sits **inside** the arch opening, roughly centred in it.
  - Add a camera view `'Solstice — through the arch'` that stands at the observer point, looks along the axis, and **sets the sky's sun to the solstice azimuth and altitude** for that view.
  - Add a probe test `window._api.solsticeCheck()` that casts a ray from the observer toward the sun and returns `true` if it passes through the arch opening without hitting the arch. `verify.py --assert` should fail if it returns false.
  - Assumption: Krator's sun may not follow Earth's numbers. Keep latitude and event as parameters so I can change them. Ask me if I want sunrise instead of sunset.

**Palace**
- `jj_palace`: Raja's palace. The largest building (~120 × 90 m plus the plaza). A multi-storey palace block on a high plinth, a central gold onion dome, several secondary domes, 4–6 thick staged spires of different heights, arcaded loggias, balconies with jali screens, and a ceremonial gateway facing the plaza.
- `jj_palace_plaza`: **a separate key** so the city can place it independently. A great raised plaza in front of the palace (~100 × 80 m, or round), paved in white marble with a **red-and-yellow sunray pattern inlaid** into the marble (the sunray texture from section 5). It has a central disc and rays radiating to the edge, a marble balustrade around it, stairs down on three sides, and sockets for banner poles around the edge. Keep it modular: the palace and the plaza must line up when both are placed with the documented offset, which you should write in `API.md`.

**Military**
- `jj_fortress`: a citadel on a rocky or brick plinth. Thick battered curtain walls, crenellations, 4+ massive round towers (image 2 massing, brick), a keep with a dome, and a gate with a portcullis-shaped arch.
- `jj_barracks`: two long 2-storey barrack blocks around a drill yard, an armoury, a stable, and a small watch spire.
- **Walls, gate and tower are a modular SYSTEM, not one building:**
  - `jj_wall_seg`: one straight wall segment of a **fixed documented length** (for example 12 m), a documented height (for example 10 m) and a walkway on top, crenellated. Segments placed end to end must join with **no gap and no overlap**.
  - `jj_wall_tower`: a round tower whose diameter covers a segment joint. It stands on the joint and fits the segment's walkway height with a door onto the walkway.
  - `jj_wall_gate`: a gatehouse the same length as N segments (document N), with an arched gateway big enough for a cart (≥ 4 m wide, ≥ 5 m high) flanked by two thick spires.
  - `jj_wall_corner`: a corner tower that joins two segments at 90°.
  - In the showcase, show one short **assembled wall run** (segment, tower, segment, gate, segment, corner, segment) so I can see that it joins, as well as each piece alone.

**Agriculture and storage**
- `jj_farm_field`: a field plot with irrigation channels, a low mud-brick boundary wall and **planting spots**. The crops themselves are flora (section 7), not part of the building.
- `jj_farmhouse_a`, `jj_farmhouse_b`: rural houses in plainer red/ochre brick with a courtyard, animal pens, a threshing floor and a small dome or flat roof.
- `jj_granary`: brick silos with domed tops (like beehives or tall stacked drums) on a raised platform, with loading stairs.
- `jj_windmill`: a thick round brick tower (image 2 massing) with a gold or terracotta cap and sails. The sails are a **separate named object** so they can be animated later. If you animate them now, keep it to one rotation per frame and no new geometry.
- `jj_warehouse_a`, `jj_warehouse_b`: long brick storehouses, one with a barrel-vaulted roof and one with a row of small domes, with large arched loading doors and crates and sacks in a yard.

That is **39 required keys** in total: 9 houses, 8 shops, 3 hospitality, 3 civic, 1 temple, 2 palace, 2 military buildings (fortress, barracks) plus 4 wall pieces, 5 agriculture keys (field, 2 farmhouses, granary, windmill) and 2 warehouses. Count them when you finish and list any that are missing.

---

## 7. Things that must NOT be part of a building

- **Plants are never part of a building.** Palms, cypress, flowering vines, lilies, crops: each is a separate flora object with its own tags. No biome was specified for Jimjam, so make **simple placeholder plants** (a cone for cypress, a trunk plus a leaf ball for palm) in a separate fragment `85-jj-flora-placeholder.js`, tagged `cls:'flora'` with `biome:'placeholder'`, and expect them to be replaced later. Buildings may declare **planting spots** (an exported list of local positions) so the placement pass can put plants there.
- **Furniture is separate too**, and that includes outdoor pieces: fountains, statues, benches, braziers, lamp posts, market stalls, banner poles, planters and pools. Put them in their own fragment `84-jj-furniture.js`, register them with `cls:'furniture'` and tags `culture:'jimjam'`, `type` (`fountain`, `statue`, `bench`, …) and `setting:'indoor'|'outdoor'|'both'`. A building can *place* furniture as a child, but the furniture must be defined and registered separately.
- **Banners, awnings, flags, emblems and shop signs** go through the socket system. The building declares `sock(...)`, and the `jimjam` culture pack draws them: long red banners with a gold sun emblem, and awnings in striped canvas.

---

## 8. Registry and tags (required on every building)

Mirror Iziz's `VERN` exactly, renamed to `JJ`:

```js
JJ.def({key, name, family, tags:{type:[...], wealth, lit}, w, d, h, build})
JJ.place(scene, key, x, z, ry, o)   // o = {v, lit, scale, y}
jjReg(name, lx, lz, r, h, extraTags) // inspector volume in the local frame
```

- `culture:'jimjam'` is added automatically by `JJ.def`.
- `type`: one or more of these exact strings: `civic`, `market/shop`, `tavern/inn`, `industry`, `farm`, `single-family dwelling`, `multi-family dwelling`, `infrastructure`, `religious`, `funerary`, `military`. A building may have several; for example, the caravanserai is `tavern/inn` + `market/shop`.
- `wealth`: `poor` | `middle` | `rich` | `civic`.
- `lit`: **true only for rich and civic** buildings. For Jimjam, "lit" means **oil lamps and braziers** that glow (emissive), not electric bulbs. Poor and middle buildings have no glowing lamps.
- `w, d, h` must be **honest**: the actual footprint and height. The showcase spaces buildings by `w`, so a wrong `w` makes buildings overlap.
- Register at least one inspector volume per building (`jjReg`). Large buildings (palace, fortress, temple, caravanserai) register one volume **per major part** (for example "Raja's Palace — east spire") so hovering over them is useful.

---

## 9. The showcase target and dev tools

- `targets/kit/89z-rows.js`: lay the buildings out in rows by family, poor → rich from left to right, with the front (+z) toward the camera. Leave at least 10 m between buildings and more between rows (use each row's largest `d`). One row for housing per tier, one for shops, one for hospitality, one for civic, then the temple, the palace plus plaza, military, the assembled wall run, and agriculture.
- `targets/kit/91z-views.js`: the first entry is the opening shot (an attractive 3/4 aerial of the densest rows). Also provide `'Overview'`, **one view per row**, **one eye-level view (camera y = 1.7 m) per building family**, `'Palace and plaza — aerial'` (so the sunray inlay is visible), `'Wall run'`, and `'Solstice — through the arch'`.
- Keep Iziz's dev tools working (they come from `92-camera.js` and `93-labels.js`):
  - **Inspector** (toggleable): hovering shows *name · classification · tags · world point*.
  - **Polygon tool:** click the ground to add points; it outputs copy-pasteable `[[x,z],…]`.
  - **Walk mode (F):** eye height 1.7 m, WASD.
  - **Labels:** one floating label per building.
- **Skybox:** use the standard Krator sky (`KratorSky` from `81-sky.js`) with the sun and the gas giant. The ground is a flat warm sand/stone colour.
- **Probe:** `window._api` must expose at least `totals`, `typeStats()`, `tagAudit()` (fails if any REG entry lacks `cls`, `culture`, `type` or `wealth`), `nanSweep()`, `defs()`, `setView(name)`, `views()` and `solsticeCheck()`.
- **Budgets:** the whole showcase must stay under **3 million triangles and 400 draw calls**, and no single building over **250 k triangles**. Spires and domes tempt you to add too many segments. 16–24 radial segments is plenty.

---

## 10. How to work: small rounds, verified each time

**Do not try to write all of this in one reply.** You will run out of room and produce broken, half-finished files. Work in rounds, and **stop at the end of each round** so I can check it:

- **Round 1: skeleton.** Folder, copied engine files, `build.py` adapted, `60-jj-mat.js` (palette, textures, kit items), `61-jj-helpers.js` (the JJ registry and **all** helpers from section 5), a test target that shows just the helpers (a wall, an arcade, one dome of each kind, one spire of 2, 3 and 5 stages, a round plaza with the sunray inlay). Build it and verify it.
- **Round 2: housing (9)** + furniture and flora placeholders.
- **Round 3: shops (8)** + the jimjam culture pack (banners, signs, awnings).
- **Round 4: hospitality + civic** (inn, tavern, caravanserai, library, school, amphitheater).
- **Round 5: the temple, including the solstice check.**
- **Round 6: palace + plaza.**
- **Round 7: military + the wall system.**
- **Round 8: agriculture + warehouses.**
- **Round 9: docs, index, gallery, final full verification.**

In **every** round:
1. Say which files you are creating or changing.
2. For a **new** file, give its **complete contents**. For an **existing** file, give an **exact, minimal edit** (the old lines and the new lines). Never say "rest of file unchanged" inside a code block I'm meant to paste. Never regenerate an existing large file just to change part of it.
3. Run (or tell me to run) `python3 build.py`, then `python3 verify.py dist/jimjam-kit.html --assert --views "<the new views>" --out shots`.
4. **Look at the screenshots, at eye level.** Proportion errors (doors 4 m tall, stairs that don't reach the plinth, domes floating above or sunk into their drum, spires that don't touch the roof) only show up there. No automated check catches them.
5. End the round with: what you built, what you checked, what you **could not** check, and any known problems. Add those problems to `KNOWN_ISSUES.md`.

**Be honest about what you ran.** If you cannot run Python or a headless browser in your environment, **say so plainly** and give me the exact commands to run, then wait for my output. Never write "verified", "tested" or "renders correctly" about something you did not actually run and look at.

---

## 11. Common mistakes to avoid (each of these has happened before)

- Using `Math.random()`. Use `rng()` after `reseed(N)`.
- A `buildJj…` function whose first line is not `reseed(...)`. The build fails.
- A top-level name without the `jj`/`JJ`/`J` prefix that collides with a vendored global (`MAT`, `box`, `mesh`, `rng`, `REG`, `PAL`, …).
- Editing a vendored file. Don't. If a vendored helper is missing something, write a `jj` version in your own fragment.
- Putting geometry in world coordinates inside a builder. Always use the local frame; `JJ.place` does the rest.
- Placing things after `kbake`. They vanish silently.
- Textures that don't show: missing UVs on custom geometry, or a material not passed through the world-UV helper.
- Faces flush in the same plane (flicker). Offset by 0.02–0.05 m.
- Stairs that don't meet the plinth top. Doors below or above the floor level. Buildings sunk into or floating above the ground (`y` must be the ground at the base).
- Domes too flat or too small. Jimjam domes are **prominent**, often taller than a hemisphere (onion) and sitting on a visible drum.
- "Thick spires" drawn as thin needles. Jimjam spires are **fat, staged cylinders**, like image 2: 4–10 m in diameter at the base.
- Forgetting marble trim. Every red or yellow brick building needs white marble at the plinth cap, string courses, window/door surrounds and the cornice. That contrast *is* the style.
- Plants or fountains modelled as part of a building. Make them separate objects (section 7).
- An inspector volume with missing tags. `tagAudit()` must pass.
- Guessing at something ambiguous. **Ask me.**

---

## 12. Final round (round 9) checklist

1. All 39 keys are defined and appear in the showcase. List them in a table (key, name, type tags, wealth, lit, w × d × h, triangle count).
2. `python3 build.py` is clean. `python3 build.py --vendor-check` shows no drift.
3. `verify.py --assert` passes on all views, including `tagAudit` and `solsticeCheck`.
4. Budgets are within limits (report the totals).
5. `README.md` (how to build and verify), `DESIGN.md` (the Jimjam brief: materials, palette, wealth tiers, lighting rule, solstice rule), `API.md` (JJ registry, kit items, every helper signature, how to add a building, the palace↔plaza offset, the wall-segment length and join rule, the seed blocks), `KNOWN_ISSUES.md` and `NOTES.md` (round by round) are written.
6. Run `python3 tools/make_index.py` from the repo root so `INDEX.md` (root and `settlements/jimjam/INDEX.md`) lists the new build.
7. Add `settlements/jimjam/dist/jimjam-kit.html` to `ENTRIES` in `gallery/build_gallery.py` and run `python3 gallery/build_gallery.py` (see `gallery/README.md`). Publishing the gallery is my job; just tell me it's ready.
8. Update `painting-to-3d-world/SKILL.md` inside the skill zip with any new lessons from this build (pitfalls you hit and how you solved them).

Before you start round 1, **read back to me** in a short bullet list: the folder you will create, the prefix you will use, the seed block, the three shop types you picked for #6–#8, the solstice assumption (latitude, sunrise or sunset), and anything in this prompt you found unclear. Then wait for my go-ahead.
