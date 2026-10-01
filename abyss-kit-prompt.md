# Prompt for an AI coding assistant (ChatGPT, Codex or Gemini): flesh out the Eastern Abyssal building kit

*(Copy everything below the line into the assistant. Attach the eight reference images from `abyss.zip` with it, and keep their filenames so the prompt's references match.*

*Which assistant, best first:*
- ***ChatGPT Codex** (the coding agent, connected to GitHub): it clones the repo and runs commands itself. Point it at `traviso761-debug/krator-master` and tell it to work on a new branch.*
- ***ChatGPT with code execution:** zip `settlements/locus/` (leave out `*.html`, `publish/`, `shots/`), `core/`, `tools/`, `gallery/build_gallery.py`, `README.md`, `CLAUDE.md` and `painting-to-3d-world.skill`, and upload the zip with the images. It can run `build.py`, but it has no browser, so you run `verify.py` and `kitshots.py` and paste back the output and screenshots.*
- ***An assistant that can't run code** (Gemini, in your experience): it writes code and you run everything.)*

---

You are going to **extend an existing procedural building kit** in my project, Krator. Krator is a set of procedural Three.js worlds. Each world lives in its own folder as numbered JavaScript source **fragments**, and a Python script (`build.py`) concatenates them into **one self-contained HTML file** that renders the world in a browser.

The kit is the **Eastern Abyssal** architecture set: the buildings of the `abyssal-desert` culture, who live on the salt marshes and river deltas at the edge of the eastern abyss. A few of these buildings already exist in the **Locus** world (`settlements/locus/`). Your job is to:

1. Build a **new kit sheet** called **`abyss`** (output `abyss-kit.html`) inside the Locus build.
2. Bring the **existing abyssal buildings** from the Locus kit onto that sheet (section 5).
3. Add a **full city's worth of new abyssal buildings** to it (section 7), in the style described in section 6.

Read this whole prompt before you write any code. It is long on purpose. Every rule in it comes from a real mistake. If something is unclear, **ask me instead of guessing**.

---

## 1. What "done" means

The work is done only when **all** of these are true:

1. `cd settlements/locus && python3 build.py` finishes with **no errors**. It writes `abyss-kit.html` (the new sheet) **as well as** the existing `locus.html`, `locus-kit.html` and `locus-plants.html`.
2. `abyss-kit.html` opens in a browser and shows **every building in section 7, with every variant**, plus the old abyssal buildings from section 5, laid out in rows on flat ground. The on-screen error panel is empty.
3. Every building is a **procedural generator** (a `build(F)` function), not a hand-placed model. It is deterministic: identical on every load.
4. Every building is registered with `ASSET({...})` and carries `kit`, `group`, `culture` and `types` (section 9). The inspector shows them when you hover over it.
5. **Nothing already built is broken.** `locus.html` and `locus-kit.html` still build, still pass `verify.py --assert`, and the Locus kit sheet still shows its 23 named items.
6. `python3 verify.py abyss-kit.html --assert` passes, and the screenshots have been **looked at**, including eye-level close-ups made with `kitshots.py`.
7. The docs exist: `ABYSS-KIT-NOTES.md` and `ABYSS-KIT-KNOWN-ISSUES.md` in `settlements/locus/`, and the Locus `INDEX.md` has been regenerated.

"The code looks right" is **not** done. "It builds" is **not** done.

---

## 2. Read these first, in this order

If you cannot open the repo, tell me and I will paste them.

1. `README.md` (repo root): project-wide rules. Covers tagging, modularity, flora and furniture kept separate from buildings, dev tools, the standard skybox, and the life-layer rule "never encode a world rule only in the visuals".
2. `CLAUDE.md` (repo root): working rules. Edit only `src/` and build scripts. Never open the built `.html` files.
3. `settlements/locus/INDEX.md`: every Locus fragment, its sections and its size.
4. `settlements/locus/LOCUS-KIT-NOTES.md`: **the existing kit. Read all of it.** It describes every existing building, the style as built, and the framework changes the kit made.
5. `settlements/locus/LOCUS-KIT-KNOWN-ISSUES.md`: what is already known to be wrong.
6. `settlements/locus/src/53-assets.js`, **lines 1–130**: the `ASSET` registry, the `FURN` and `PLANT` registries, the tag lists (`BUILDING_TYPES`, `FURN_CULTURES`) and the **build frame `F`**: `F.box`, `F.cyl`, `F.cone`, `F.ball`, `F.beam`, `F.rod`, `F.lathe`, `F.quad`, `F.tri`, `F.rnd`, `F.rr`, `F.pick`. **This is the API you will draw with.**
7. `settlements/locus/src/64-locus-core.js`: the shared abyssal helpers in `LOCUS.*`: `pile`, `pileGrid`, `deck`, `rail`, `stair`, `ladder`, `canopy`, `stripes`, `pole`, `guy`, `roll`, `hang`, plus pipes, tanks and valves further down. **Reuse these; don't rewrite them.**
8. `settlements/locus/src/64-locus-dwellings.js`: **the worked example.** Two houses with 3 variants each, a tent and a sun shade. Copy its pattern exactly: how `ASSET` is declared, how `F.variant` switches between variants, how `F.rnd()` is used.
9. `settlements/locus/src/70-sheet.js`: how a kit sheet lays out its rows.
10. `settlements/locus/src/10-core.js`, lines 1–20: `TARGET`, `SHEET`, `KIT`.
11. `settlements/locus/build.py`: the build rules and the `flavour(...)` function that writes each target's HTML.
12. `settlements/locus/src/05-palette.js`: the `PAL` palette, including the LOCUS block (pastels, canvas, reed, pile, mudBrown, umber, sienna, steelDark, pipe, oil, saltWater …).
13. `settlements/locus/src/47-texture.js`: which material **families** exist (`timber`, `plank`, `bark`, `canvas`, `cloth`, `thatch`, `metal`, `rust`, …). Use only families that exist, or add a new one there and document it.
14. Inside `painting-to-3d-world.skill` (a zip file in the repo root): `painting-to-3d-world/SKILL.md` and `references/threejs-pitfalls.md`.

Some files are **huge or generated. Never open or search them:** `*.html` in the Locus folder, `publish/`, `three.min.js`, `shots/`, `archive/`, `*.zip` (except to read the skill). Some fragments are over 30 KB: `21-sky.js`, `30-layout.js`, `56-mid.js`, `58-rich.js`, `59-civic.js`, `84-life.js` and the `69c*` biome files. **You don't need them.** If you do, find the section first with `grep -n '^/\* ====' <file>` and read only that range.

---

## 3. How this engine works (read this even if it seems obvious)

- **All fragments share one JavaScript scope.** `build.py` concatenates every file in `src/`, in **filename order**, into a single `BUILD()` function. So:
  - Every top-level `var` and `function` is visible to every other fragment.
  - Two fragments declaring the same name **break the build** (`build.py` checks this).
  - A short common name (`seed`, `base`, `h`, `pos`, `col`) can silently clobber another file's variable. **Wrap each new fragment's code in an IIFE** `(function(){ ... })();`, as `64-locus-dwellings.js` does, and put any shared helpers in **one** object named `ABYSS` (for example `ABYSS.coneShell(F, ...)`).
  - File order matters. Your new fragments go **after** `64-locus-*.js` (so `LOCUS.*` exists) and **before** `68-place.js` / `70-sheet.js`. Name them `65-abyss-*.js`.
- **Every new fragment's first statement must be `reseed(N);`** with its own N. `build.py` fails the build otherwise. Use the free block **650001–659001**, one per fragment (`650001`, `651001`, `652001` …).
- **Inside a `build(F)` function, never call `rnd()`, `Math.random()` or `rr()`. Use `F.rnd()`, `F.rr(a,b)` and `F.pick(arr)` only.** These are the instance's private random stream, so two copies of a building with the same seed look identical, and adding a building elsewhere doesn't change this one.
- **Units:** metres. `y` is up. A person is **1.75 m** tall (the sheet draws a 1.75 m figure beside every item, so use it). A storey is about 3 m. A door is 2.1–2.4 m tall and 0.9–1.2 m wide. Check every dimension against the figure.
- **Local frame:** `build(F)` draws one building around its own origin. The origin is the **centre of the footprint, on the ground**, `+x` is right and **`+z` is the FRONT** (the door, the street side). Use only `F.*` calls with local coordinates; they handle rotation and placement. **Never use world coordinates inside `build(F)`.**
- **Stay inside the footprint.** Whatever `w × d` you declare in `ASSET`, `build(F)` must stay inside it, because the sheet and the world pass space things by it. Declare `h` honestly too.
- **Variants:** in this engine, variants are **inside one `ASSET`**. Declare `variants:3` and branch on `F.variant` (0, 1, 2). Each variant must be a **visibly different design**, not the same box with a different seed.
- **Colours:** take them from `PAL` (and the palette you add in section 6), passing them as the `c` argument. Shade with the existing `shade(col, k)`.
- **Z-fighting:** two faces in the same plane (a band flush with a wall, a deck flush with a floor) flicker. Offset one by 0.02–0.05 m.
- **Moving parts:** if anything animates (windmill sails, a windpump), register it the way the pumpjack does: `LOCUS.anim(F, kind, …)`, with its motion in `76-locus-anim.js`. Static parts go through the ordinary kit. Read the pumpjack section of `LOCUS-KIT-NOTES.md` first.

---

## 4. Wiring the new sheet (do this first, as round 1)

The engine already supports **one** sub-kit sheet, `locus`. You need a second, `abyss`, and some buildings must appear on **both**. Make these **minimal, backward-compatible** changes:

1. **`src/10-core.js`:** make `KIT` also recognise the new target:
   `var KIT = TARGET==='locus' ? 'locus' : TARGET==='abyss' ? 'abyss' : null;`
2. **`src/53-assets.js`:** let `kit` be **a string or an array of strings**. Add one helper, `function assetInKit(A,k){ return Array.isArray(A.kit) ? A.kit.indexOf(k)>=0 : A.kit===k; }`, and use it everywhere `A.kit===KIT` is tested. Add `'abyssal-desert'` to `FURN_CULTURES`.
3. **`src/70-sheet.js`:** replace the two `A.kit===KIT` tests with `assetInKit(A,KIT)`. Give the `abyss` sheet its own ground colour (a pale salt-crust tone, for example `#c9c2a8`) next to the existing `KIT==='locus'` line.
4. **`build.py`:** add a flavour for the new target, writing `abyss-kit.html` and `publish/abyss-building-kit.html`:
   `abyss = flavour('abyss', 'Abyssal Building Kit', 'Eastern Abyss — building kit', 'Laying out the abyssal kit…')`.
   Add it to the output loop exactly as `locus` is handled.
5. **`kitshots.py`:** it currently hard-codes `locus-kit.html` (in the `--dump` call and the final `verify.py` call) and always writes `sheet-items.json`. Add an optional `--sheet <file>` argument (default `locus-kit.html`), and write the item dump to `sheet-items-<sheet name>.json` so the two sheets don't overwrite each other. Usage becomes `python3 kitshots.py shots --sheet abyss-kit.html --dump`, then `python3 kitshots.py shots --sheet abyss-kit.html key:variant:f …`. With no `--sheet`, the old usage must still work.
6. Rebuild. Confirm that **`locus-kit.html` still shows its 23 items** (`verify.py locus-kit.html --assert` and `--eval "()=>window._sheet"`), and that `abyss-kit.html` loads with an empty sheet and no errors.

**Do not change anything else in the shared engine in round 1.** If you find another place that needs changing, tell me what and why before you change it.

---

## 5. The existing buildings to bring onto the new sheet

These Locus buildings are **abyssal**. Add `'abyss'` to their `kit` (so `kit:['locus','abyss']`) and give each an `abyss` sheet row. **Do not copy or rewrite them.** One definition, on two sheets. Don't change how they look in this pass; if you see something wrong with one, add it to the known issues.

| key | what | file | include? |
|---|---|---|---|
| `stilt_poor` | marsh stilt house, 3 variants | `64-locus-dwellings.js` | **yes**, as poor housing |
| `stilt_mid` | pastel stilt house, 3 variants | `64-locus-dwellings.js` | **yes**, as middle housing |
| `tent_pavilion` | great pavilion tent, 3 variants | `64-locus-dwellings.js` | **yes**, with hospitality |
| `sunshade_poles` | four-pole sun shade, 3 variants | `64-locus-dwellings.js` | **yes**, as street furniture / market |
| `farm_saltrice` | salt-rice farm, 2 variants | `64-locus-farm.js` | **yes**, as the farm |
| `infra_fishing_dock` | fishing dock, 2 variants | `64-locus-infra.js` | **yes**, as infrastructure |
| `ind_pumpjack` | pumpjack (animated) | `64-locus-petroleum.js` | **yes**, as industry (Geomancer machinery the abyssal towns live beside) |
| `ind_oil_tank` | oil storage tank | `64-locus-petroleum.js` | **yes**, but **note** that variant 3 is "banco-clad in the Yuni manner". Leave it as it is and list it in known issues. |
| `prop_pipe_rack`, `prop_drum_stack` | petroleum props | `64-locus-petroleum.js` | **yes** |

These are **Yuni-inspired and must NOT go on the abyss sheet, and must not be used as style references**:
`ind_refinery` (mud-brown Yuni banco), `ind_generator_house` and `trade_fuel_station` (Yuni white-and-blue), `civic_geomancer_chapterhouse` (Yuni civic forms), `locus_warehouse` (culture `yuni`), and **everything** in `55-mid-example.js`, `56-mid.js`, `57-poor.js`, `58-rich.js` and `59-civic.js` (the Yuni base kit: parabolic arches, toron, banco, Musgum shells, Gaudí-style park pieces).

Keep the old buildings' culture tags as they are: `abyssal-desert` for the dwellings, tents, farm and dock, `geomancer` for the petroleum pieces.

---

## 6. The style brief: Eastern Abyssal

**Setting:** a hot, bright, salty land at the edge of the abyss. Salt lakes, a marshy river delta, shallow water, reed beds, salt crust. Ground floors stand on **piles and plank decks** above wet ground. **Shade** matters more than walls: canvas sails, deep canopies, overhead awnings. The people are **scavengers and recyclers** living beside the Geomancers' oil works and the ruins of the Ancients, so salvaged material (sheet metal, drums, tanks, containers, cans, glass and mirror) is everyday building material, used with **pride and colour**, not as squalor.

**Already established by the existing kit (keep it):** houses on bark-grey piles with plank decks, rails and straight stairs. Reed-mat walls (poor) and **pastel lime-wash** walls (everyone else) with a darker plinth band and cornice. Timber lattice window screens. **Flat terraces under sagging canvas sails on poles** (the middle-class signature) and porch canopies on two poles (the poor signature). Striped canvas tents. A Persian-style wind-catcher. The pastel palette in `PAL.pastel` (rose, apricot, mint, sky, lilac, sand, chalk, seafoam, blush, celadon-straw) and `PAL.canvas` / `PAL.canvasDye`.

**What to take from each new reference image** (filenames as in `abyss.zip`):

- **`e9a047faf231325c299cf542db65f8bc.jpg`** (salvage tower over the water): a tall house made of **stacked, offset shipping containers and sheds**, cantilevered over a plank deck on stilts above lily-padded water. Corrugated and rusted walls in mixed colours, a deep porch with a corrugated roof, external ladders and walkways, **tangled cables, antennas, satellite dishes**, a billboard, potted plants on balconies. → Use for poor and middle **stacked** housing, the salvage dealer and the inn.
- **`recycled_house_closeup.jpg`** (glittering towers): **tapering towers clad in flattened cans, foil, bottle bottoms and mirror shards**, studded with salvaged trim round the windows, on a base of **rough rubble stone**. → The **shimmering patched-metal cladding** is a signature finish for rich and sacred buildings (a "tin-mirror" material, section 6b). Tapering tower forms.
- **`umbrellas.jpg`** (painted street under umbrellas): narrow streets of **brightly painted** houses (yellow, orange, teal, pink), wrought-iron balconies, painted murals and signs, and **a canopy of coloured umbrellas strung on wires overhead**. → Pastel and bright facades; **strung overhead canopies over market streets**, as a separate furniture item (section 8); balconies.
- **`wq.jpg`** (conical shells over green terraces): very large **conical shells** of thatch or shingle, open at the base in a great arch, over **terraced floors with planting** and a round pool. → The **cone-shell** form: library, school, rich houses, temple corner towers, the ruler's palace.
- **`46f83d9aae2938d962b2047b00c2d771.jpg`** (sail-roofed platform): a big timber **platform on stilts** with walkways and stairs, under **swooping orange sail-cloth roofs with red patterned bands**, hung lanterns, small **propeller-lanterns** on poles, and **blue crystals** set in a ring. → Market, tavern, inn, caravanserai and the ruler's plaza: **sail roofs** rather than flat canvas, patterned bands, lanterns.
- **`679e20bb4070b7a2b25e8737e3de5451.jpg`** (Leopard-clan hall): a **steep, swooping thatched roof** whose ridge ends sweep up into **horn-like points with gilded tips**, carved claw-like buttresses at the base, a **red-lacquered plinth** with geometric bands, and a broad stair. → The **temple** and **palace** roof form, and the fortress and barracks halls. Keep it as the grandest roof in the kit.
- **`2285020dda0d7209b3c62ae90a1093fd.jpg`** (desert scrap house): a **rusted water tank on a ring balcony** as an upper room, a yellow container cabin, a **horizontal green drum turned into a room** with a cut-out window and awning, pipes, a ladder, a billboard and a corrugated porch. → **Repurposed tanks and drums as rooms**: poor and middle housing, the alchemist, the tavern, the granary.
- **`95129441d715cc5d7fcb57f64c3c6b8f.jpg`** (silo cluster with antenna mast): a cluster of **domed cylindrical silos** with porthole windows and hatches, joined by **blue tarps**, timber decks and small sheds, beside a **lattice antenna tower with dishes**. → The **granary**, the barracks, the fortress towers, and silo houses for the middle tier.

**Signature forms** (build these as shared helpers first; see 6c):
1. **Piles and decks** (already in `LOCUS`).
2. **Sails:** swooping, patterned canvas roofs on poles and masts, from flat (existing `LOCUS.canopy`) to steeply swooping (new).
3. **Cone shells:** tall conical roofs/towers in thatch, shingle or tin-mirror, often open at the base in an arch.
4. **Repurposed vessels:** tanks, drums, silos and containers used as rooms, with cut windows, hatches and ring balconies.
5. **Swoop-and-horn roofs:** a steep thatch saddle roof with up-swept horn ridge ends and gilded tips, for sacred and noble buildings.
6. **Tin-mirror cladding:** glittering patchwork metal with mirror and bottle studs, for wealth and sanctity.
7. **Overhead clutter:** cables, antennas, dishes, strung lanterns, strung umbrellas, banners. Keep it **cheap** (thin rods; instanced where repeated).

### 6b. Palette and materials

Add an `ABYSS` block to `05-palette.js` (do not change the existing entries):

| name | approx hex | use |
|---|---|---|
| `abSailOrange` | `#E07B39` | sail roofs |
| `abSailRed` | `#B8402E` | sail bands, patterns |
| `abBrightYellow` | `#F2C230` | painted facades (umbrella street) |
| `abBrightTeal` | `#2FA59A` | painted facades, trim |
| `abBrightPink` | `#E26D8E` | painted facades |
| `abRustA`, `abRustB` | `#8A4A2B`, `#A5602F` | salvaged sheet |
| `abContainer` | `['#3F6E8C','#A23A2A','#C9A33A','#5D7D4A','#7C7F80']` | container colours (pick) |
| `abTarpBlue` | `#2E6FB7` | tarps |
| `abTin` | `#C9CDD2` | tin-mirror base |
| `abLacquer` | `#9A2C26` | lacquered plinths (temple/palace) |
| `abGild` | `#D4A537` | horn tips, finials |
| `abCrystal` | `#5BC8E6` | blue crystals (emissive, sacred only) |
| `abSalt` | `#E9E4D6` | salt crust, plaza paving |
| `abRubble` | `#9C8E7C` | rubble-stone bases |

**Materials:** check `47-texture.js` for what exists. Add, if missing, and document in the notes:
- `corrugate`: ribbed sheet metal (tinted per instance).
- `tinmirror`: a patchwork of small bright metal tiles with a few sharp highlights (a high-metalness, low-roughness material with a procedural patch texture), tinted by `abTin`. **Don't** make it a real mirror (no reflection render targets).
- `rubble`: a rough stone base.
- `pattern`: canvas with the sail band motif (zigzags and triangles, as on the sails in `46f83d…`), procedural, two colours.

### 6c. Helpers to build first, in `65-abyss-core.js`

All take `F` first and use local coordinates. Record each signature in `ABYSS-KIT-NOTES.md`.

- `ABYSS.sail(F, pts, col, opt)`: a swooping sail roof between 3–6 corner points, with `opt.swoop` (how much it curves up at the tips), `opt.band` (a patterned border colour), both faces drawn. Build it on `F.quad`/`F.tri` subdivided into a grid (8×8 is plenty), so it can curve.
- `ABYSS.mast(F, x,z,h, opt)`: a pole with guys, an optional lantern, an optional propeller-lantern.
- `ABYSS.coneShell(F, x,z, r, h, opt)`: a cone shell (thatch, shingle or tin-mirror) built with `F.lathe`, with an optional **arched opening** cut at the base on the +z side (build it from segments that leave the gap, not by boolean subtraction), a ring beam, and a finial.
- `ABYSS.vessel(F, kind, x,y,z, opt)`: `kind` is `'tank' | 'drum' | 'silo' | 'container'`. A repurposed vessel as a room: vertical tank, horizontal drum, domed silo or container box, with cut window(s), a door or hatch, an optional **ring balcony** and optional ladder. Rivet rows and seams as thin bands.
- `ABYSS.swoopRoof(F, x,z, w,d, h, opt)`: a steep saddle roof of thatch with **up-swept horn ridge ends** (`opt.horn` length) and gilded tips. Make the eaves deep and the curve smooth (several segments along the ridge, not one wedge).
- `ABYSS.tinClad(F, ...)`: apply tin-mirror cladding to a box face or a lathe (a shell 0.03 m outside the wall, so no z-fighting).
- `ABYSS.cables(F, a, b, sag, n)`: `n` sagging cables between two points (a few segments each). Use these **sparingly**.
- `ABYSS.antenna(F, x,y,z, kind)`: a mast, a dish or a lattice tower.
- `ABYSS.lattice(F, x,z, w, h)`: a lattice tower (instanced struts), for the antenna mast and the windpump tower.
- `ABYSS.altar(F, x,z, size, h, opt)`: the stepped square altar (section 7, temple).

---

## 7. The new buildings (all required)

Every line is **one `ASSET`** with `kit:'abyss'`, `culture:'abyssal-desert'`, a `group` (its row on the sheet) and the listed `variants`. Each variant must be a visibly different design. Sizes are guides; declare what you actually build.

**Housing** (the old `stilt_poor` and `stilt_mid` stay as well; the new ones must look different from them)
- `abyss_house_poor` (3 variants, 6–9 m): (a) a **drum house**, a horizontal salvaged drum on a pile deck with a cut window, a tarp awning and a ladder; (b) a **container shack** on piles with a corrugated porch and a water butt; (c) a **reed-and-sheet lean-to** with a patched corrugated roof and a two-pole porch canopy. Little paint, mostly rust and reed. No lamps.
- `abyss_house_mid` (3 variants, 9–14 m, 2–3 storeys): (a) a **stacked-container house**, two or three containers offset and cantilevered, with external stair, balconies, cables and a dish; (b) a **silo house**, a domed silo with portholes and a ring balcony, joined to a timber cabin by a tarp; (c) a **painted townhouse**, pastel or bright lime-wash, with an iron balcony, a mural panel, a flat roof terrace under a sail.
- `abyss_house_rich` (3 variants, 16–24 m): (a) a **cone-shell house** with a tall tin-mirror or shingle cone over terraced floors, an arched opening and a pool court; (b) a **sail-roofed compound**, a walled deck compound on piles with several swooping sail roofs and a private dock; (c) a **tin-mirror tower house** on a rubble base, tapering, with salvaged-trim windows and a lantern top.

**Shops** (8; one `ASSET` each with 2 variants; open fronts, counters, goods, a sign. Make shop signs simple boards with a pictograph in your own helper.)
- `abyss_shop_weapons`: weaponsmith. A forge in a cut drum, racks of spears and harpoons.
- `abyss_shop_armor`: armourer. Plate cut from Ancient metal on stands, a shield wall.
- `abyss_shop_general`: general goods. Crates, sacks, barrels, hanging goods.
- `abyss_shop_food`: food. A clay oven, baskets of fish and salt-rice, a smoking rack.
- `abyss_shop_alchemy`: alchemist. A **tank house** with a coloured-glass porthole, a flue, shelves of jars, a small crystal.
- `abyss_shop_salvage`: salvage dealer and tinker. A yard of sorted scrap and a container office with dishes and cables. *(my pick)*
- `abyss_shop_salt`: salt and fish merchant. Salt cones under a sail, drying racks. *(my pick)*
- `abyss_shop_sailmaker`: canvas, rope and sail-maker. Bolts of patterned canvas, coils of rope. *(my pick)*

**Hospitality**
- `abyss_inn` (2 variants): a 3-storey stacked inn around a deck court, with walkways, strung lanterns and a sail roof over the court.
- `abyss_tavern` (2 variants): a **sail-roofed platform** tavern on piles (image `46f83…`) with benches, a bar counter in a cut tank, and lanterns.
- `abyss_caravanserai` (1): a square walled court (~50 × 50 m) of deck and salt paving, rooms in containers and cabins round all four sides, a **great swoop-roof gate**, a well, a beast yard with sun shades.

**Civic**
- `abyss_library` (1): a **cone-shell** hall (image `wq.jpg`), tall, with terraced reading floors inside the open arch, and smaller cones beside it.
- `abyss_school` (1): a ring of small cone-roofed classrooms round a shaded court under a sail.
- `abyss_amphitheater` (1): a round or horseshoe tiered bowl in rubble stone and timber benches, a stage platform on piles under a swooping sail, entrances through the outer ring. About 60–80 m across.

**Sacred: the temple of the altar (centrepiece)**
- `abyss_temple` (1): a **square sacred precinct** (~70 × 70 m) whose centre is a **large square altar**:
  - The **altar** is a stepped square platform, about **14 × 14 m** at its base and 3–4 m high, in three or four steps. It has **stairs in the middle of all four sides**, a top of salt-white paving with a tin-mirror or lacquer border, and an **offering basin / fire bowl** at its centre with a ring of blue crystals. Build it with `ABYSS.altar`.
  - Around it is an open court paved in salt stone, with a **square ambulatory**: a covered walk on all four sides under swoop-and-horn thatch roofs on lacquered posts.
  - A **great gate** on the +z side has the tallest swoop-and-horn roof in the kit (image `679e…`).
  - **Cone-shell towers** stand at the four corners, tin-mirror clad.
  - The altar must be **visible from the gate**: nothing blocks the axis.
  - **Simulation data, not just visuals** (the README rule): register the altar as its own part and give the asset data such as `sim:{ activity:'WORSHIP', capacity:200, focus:[0,0,0] }` (the altar centre in the local frame). Document the field. It does nothing yet; it is scaffolding for the life layer.

**Ruler's palace and plaza** (ask me what the ruler is called; use "the Headman" until I answer)
- `abyss_palace` (1): the largest building (~90 × 70 m). A raised deck compound on piles over water or wet ground, a central great hall under the grandest **swoop-and-horn roof**, two or more tin-mirror **cone towers**, sail-roofed loggias and a private dock.
- `abyss_palace_plaza` (1): a **separate asset** so the world can place it independently. A great plaza in front of the palace (~90 × 60 m), paved in salt-white stone with a **mosaic of concentric squares** in lacquer red, teal and gold (echoing the altar), **an overhead canopy of strung lanterns and umbrellas** on masts round the edge, and benches. State the offset at which the palace and the plaza line up in the notes.

**Military**
- `abyss_fortress` (1): a citadel on a rubble mound. Walls of rubble stone below and **salvaged plate** above, **silo-shaped round towers** with domed caps, a gate under a swoop roof, a lattice signal mast with dishes.
- `abyss_barracks` (1): two long halls with swoop thatch roofs around a drill yard, an armoury in a container row, a watch silo.
- **Walls, gate and tower are a modular system:**
  - `abyss_wall_seg`: a **fixed documented length** (for example 12 m) and height (for example 8 m), rubble below and plate or palisade above, with a walkway. Segments placed end to end must join with **no gap and no overlap**.
  - `abyss_wall_tower`: a round silo tower that sits on a segment joint and meets the walkway.
  - `abyss_wall_gate`: N segments long (document N), with a cart-sized gate (≥ 4 m wide, ≥ 5 m high) under a swoop roof.
  - `abyss_wall_corner`: a 90° corner tower.
  - Add `abyss_wall_run` (1): a **sheet-only demo asset** that places segment, tower, segment, gate, segment, corner, segment, by calling the other builders' functions with offsets (not by copying their code), to prove they join. Tag it `types:['infrastructure']` with `tags:['demo']`.

**Farming and storage** (the old `farm_saltrice` is the farm)
- `abyss_farmhouse` (2 variants): a rural stilt house with a pen for animals, drying racks, a threshing deck.
- `abyss_granary` (1): a cluster of **domed silos** on a raised deck, with ladders and hatches (image `9512…`).
- `abyss_windmill` (1): a **windpump**, a lattice tower with a multi-blade salvaged-metal wheel and a tail vane, beside a tank on stilts. The wheel is **animated** through `LOCUS.anim` (one rotation per frame, no new geometry per frame). This replaces a traditional windmill and suits a salt-marsh people lifting water.
- `abyss_warehouse` (2 variants): (a) a long shed of corrugated sheet on piles with big sliding doors; (b) a row of **containers under a shared sail roof**, with crates and drums in the yard.

Count the keys at the end and list any missing.

---

## 8. What must NOT be part of a building

- **Plants are never part of a building.** Use the existing PLANT registry. The Locus plants (`salt_rice_stand`, `salt_reed`, `marsh_palmetto`) and the eastern-abyss biome species are placed with `buildPlant`, exactly as `farm_saltrice` and the Chapterhouse forecourt do. If you need a plant that doesn't exist (potted herbs, lily pads), register it as a new `PLANT` with the biome tags `climate`, `aridity` and `tags:{wet, abyssal:true, riparian}`, plus edibility or harvestability (README rule), in its own fragment `65-abyss-plants.js`.
- **Furniture is separate**, including outdoor pieces: benches, braziers, lantern posts, strung umbrella and lantern canopies, the crystal ring, counters, racks, the fire bowl. Register them with `FURN({...})` and `culture:'abyssal-desert'` in `65-abyss-furniture.js`, tagged with `room` and with whether they are indoor, outdoor or both. A building may *place* furniture, but the furniture is defined and registered separately.
- **People are not part of a building.** The sheet adds the scale figure.

---

## 9. Registry and tags (every new asset)

```js
ASSET({ key:'abyss_…', name:'…', family:'poor'|'mid'|'rich'|'trade'|'civic'|'prop',
        kit:'abyss', group:'<row name>', culture:'abyssal-desert', types:[...],
        wealth:[lo,hi], w, d, h, variants, tags:[...], sim:{...}, build:function(F){ ... } })
```

- `types` uses only `BUILDING_TYPES`: `civic`, `market/shop`, `tavern/inn`, `industry`, `farm`, `single-family dwelling`, `multi-family dwelling`, `infrastructure`, `religious`, `funerary`, `prop`. Use several where they apply (the caravanserai is `tavern/inn` + `market/shop`; the inn is `tavern/inn` + `multi-family dwelling`; the temple is `religious` + `civic`). If you need `military`, **add it to `BUILDING_TYPES`** and say so. The fortress and barracks need it.
- `group` sets the sheet rows. Use, in this order: `Housing — poor`, `Housing — middle`, `Housing — rich`, `Shops`, `Hospitality`, `Civic`, `Temple`, `Palace and plaza`, `Military`, `Walls`, `Farming and storage`, `Industry (Geomancer)`, `Street furniture and docks`. The old assets need a `group` on this sheet too. Their `group` is currently their Locus row name, so either give `group` the same string-or-array treatment as `kit`, or add a separate `abyssGroup` field. Pick one, say which, and keep the Locus sheet's rows unchanged.
- **Lighting:** poor and middle buildings have no electric light. Lanterns there are unlit oil lanterns. Rich, civic, sacred and palace buildings may have **glowing lanterns** (warm) and the temple's crystals glow blue. Use the existing night-light mechanism in `72-lights.js` / `81-glow.js`. Ask me if you're unsure whether something should glow.
- Every asset gets `sim` scaffolding where it has an obvious activity: `TRADE` (shops, market), `REST` (inn), `DRINK` (tavern), `LEARN` (school, library), `WORSHIP` (temple), `GOVERN` (palace), `GARRISON` (barracks, fortress), `FARM`, `STORE`, `PERFORM` (amphitheater), each with a `capacity`. These are data only; nothing reads them yet.

---

## 10a. Your environment: say which mode you are in before round 1

Work out which of these you are in, and **tell me in your read-back**:

- **Mode A: you have the repo and a shell** (for example, Codex). Run every command yourself: `build.py`, `verify.py`, `kitshots.py`. Look at the screenshots. Commit each round on a branch with a clear message. Check whether Playwright and Chromium are installed (`python3 -c "import playwright"`). If they aren't, you are in mode B for verification only.
- **Mode B: you can run Python but have no browser** (for example, ChatGPT's code sandbox with my uploaded zip). Do this:
  1. Unzip and work on the files in the sandbox.
  2. Run `python3 build.py` yourself after every change. It uses only the standard library.
  3. **Warning:** if Node is missing, `build.py` prints `NOTE: node not found, skipping the syntax check` and then **still prints "syntax OK". That "syntax OK" is false.** Run `node --version` first. If Node exists, the check is real. If it doesn't, tell me, and treat syntax as **unchecked** until I run `verify.py`.
  4. You cannot run `verify.py` or `kitshots.py` (they need a headless browser). At the end of each round, give me the exact commands, then wait for me to paste back the output and the screenshots. **Look at the screenshots I send** and say what is wrong in them before moving on.
  5. Hand back each round as **a zip of only the files you changed or created**, at their repo paths (for example `settlements/locus/src/65-abyss-core.js`), plus a list of them. I will unzip it over my copy.
- **Mode C: you cannot run anything.** Write the code, give me full new files and exact edits as described below, give me the commands, and wait for my output. Never describe a result you haven't seen.

## 10. How to work: small rounds, verified each time

**Do not try to write all of this in one reply.** You will run out of room and produce broken, half-finished files. Work in rounds and **stop at the end of each one** so I can check it:

- **Round 1:** the sheet wiring (section 4) and the old assets on the new sheet (section 5). Prove the Locus sheet is unchanged.
- **Round 2:** palette, materials, and **all** helpers from 6c, on a temporary `abyss_helpers_demo` asset showing each helper once (sail, mast, cone shell with arch, each vessel kind, swoop roof, tin cladding, cables, antenna, lattice, altar). Delete the demo asset in the final round, or tag it `demo`.
- **Round 3:** housing (3 assets × 3 variants), with furniture and plant registrations as needed.
- **Round 4:** shops (8).
- **Round 5:** hospitality and civic (inn, tavern, caravanserai, library, school, amphitheater).
- **Round 6:** the temple and altar.
- **Round 7:** palace and plaza.
- **Round 8:** military and the wall system.
- **Round 9:** farming and storage, and the windpump animation.
- **Round 10:** docs, index, gallery, final verification.

In **every** round:
1. List the files you are creating or changing.
2. For a **new** file, give its **complete contents**. For an **existing** file, give an **exact, minimal edit**: the exact old lines and the exact new lines. Never write "… rest unchanged …" inside a code block I'm meant to paste. Never regenerate an existing file to change part of it.
3. Build: `cd settlements/locus && python3 build.py` (mode A or B: you run it; mode C: I do).
4. Verify (mode A: you run it; modes B and C: I do and paste back the output): `python3 verify.py abyss-kit.html --assert --out shots` and `python3 verify.py locus-kit.html --assert` (the old sheet must not break).
5. Close-ups: `python3 kitshots.py shots --sheet abyss-kit.html --dump`, then `python3 kitshots.py shots --sheet abyss-kit.html <key>:<variant>:f <key>:<variant>:c …` for **every new asset and variant**, front (`f`) and eye-level close (`c`), and `n` (night) for anything lit.
6. **Look at the shots.** Proportion errors only show up at eye level: doors taller than 2.5 m, stairs that don't reach the deck, piles not reaching the ground, roofs floating above walls, sails passing through walls, vessels intersecting each other. No automated check catches these.
7. End the round with: what you built, what you checked, what you **could not** check, and any known problems. Add those problems to `ABYSS-KIT-KNOWN-ISSUES.md`.

**Be honest about what you ran.** Say which commands you ran yourself and which you are handing to me. For anything you can't run, give me the exact commands and wait for my output. Never write "verified", "tested" or "renders correctly" about something you did not run and look at.

---

## 11. Common mistakes to avoid (each has happened before)

- Using `rnd()` or `Math.random()` inside `build(F)`. Use `F.rnd()` / `F.rr()` / `F.pick()`.
- A new fragment that doesn't open with `reseed(N)`, or reuses another fragment's N.
- Top-level names outside an IIFE or the `ABYSS` object, colliding with an engine global.
- Drawing outside the declared `w × d`.
- Copying an old Locus building's code into a new asset instead of putting the old asset on both sheets.
- Changing how an old Locus building looks, or breaking the Locus sheet's row order.
- Pulling Yuni forms (parabolic arches, toron spikes, banco, Musgum shells) into the abyssal style.
- Piles that stop short of the ground, or decks floating above their piles.
- Sails drawn single-sided (invisible from below), or flat when they should swoop.
- Every vessel the same size and colour. Vary them with `F.rr` and `F.pick` within each variant.
- Cables, antennas and lanterns drawn as hundreds of separate heavy meshes. Keep them thin, few, and through the kit.
- A tin-mirror material that tries to render true reflections. It is a bright patchwork texture, nothing more.
- Plants or furniture modelled inside a building's `build(F)` instead of placed from their registries.
- Guessing at anything ambiguous. **Ask me.**

---

## 12. Final round checklist

1. A table of every asset on the abyss sheet: key, name, group, culture, types, variants, w × d × h, triangle count, and old or new.
2. `python3 build.py` is clean. `verify.py --assert` passes for `abyss-kit.html`, `locus-kit.html` and `locus.html`.
3. Budgets: report draw calls, triangles and instances for the abyss sheet (`--eval "()=>window._api"` and the stats `verify.py` prints). Keep any single asset under **250 k triangles**.
4. `ABYSS-KIT-NOTES.md` covers the style as built, the palette, the materials, every `ABYSS.*` helper signature, every asset, the palace↔plaza offset, the wall segment length and join rule, the seed block, the `sim` fields, and the framework changes from round 1. `ABYSS-KIT-KNOWN-ISSUES.md` is written.
5. Run `python3 tools/make_index.py` from the repo root.
6. Add `settlements/locus/abyss-kit.html` to `ENTRIES` in `gallery/build_gallery.py` and run `python3 gallery/build_gallery.py` (see `gallery/README.md`). Publishing the gallery is my job; tell me it's ready.
7. Add any new lessons (pitfalls you hit and how you solved them) to `painting-to-3d-world/SKILL.md` inside the skill zip.

Before you start round 1, **read back to me** in a short bullet list: which mode (A, B or C) you are in, and why; the files you will change in round 1, the IIFE/`ABYSS` naming rule, the seed block, which old assets go on the abyss sheet and which don't, how you will handle `group` for assets on two sheets, the three shops you picked, the ruler's title question, and anything in this prompt you found unclear. Then wait for my go-ahead.
