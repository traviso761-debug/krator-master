# Handoff: new flora for the Throne (the plume's edge and the ash desert)

**For:** Gemini (or any agent new to this repository).
**From:** Claude, for the owner, 2026-10-15.
**Read this whole file before you change anything.** It is long on purpose. Every step says exactly what to do, where,
and how to check it. When this file and your own judgement disagree, follow this file and say so in your report.

---

## 0. What you are making, in one paragraph

The Throne is the volcano at the centre of the Krator world. Its kit (`biomes/throne/`) draws plants procedurally
in Three.js and builds eleven "station" pages, each a 5 km tile of the mountain. You will add **thirteen new
plants**, drawn from the owner's eleven reference pictures in `biomes/throne/refs/` (21-31), to **two** of those pages:

| page | built by | file it writes | what it is |
|---|---|---|---|
| **The plume's edge / the rift** (station 1) | `python build.py` | `dist/throne.html` | the south-east shoulder: a rift of cinder cones, an acid lake, hot pools, fumaroles (vents), gullies, lava-tube skylights, lava flows of every age. The life turns alien going under the plume |
| **The ash desert** (station 7) | `python build.py --station ashdesert` | `dist/throne-ash.html` | deep under the plume: ash dunes, yardangs (wind-carved ridges), striped rhyolite hills, a deadly CO2 hollow, ash storms. No water |

**Nothing on the other nine pages may change.** Not one tree may move there. Section 4 explains how to guarantee that.

---

## 1. Hard rules (break one and the work is rejected)

1. **Work in your own git worktree, from `origin/main`.** Never in `C:\Users\travi\Documents\krator-master` itself:
   its `main` is stale and another agent has uncommitted work there. Section 2 has the commands.
2. **Edit only these files:**
   - `biomes/throne/src/47-host-land.js` (one field added)
   - `biomes/throne/stations/ashdesert/47-host-land.js` (one field added)
   - `biomes/throne/src/50-biome-throne-species.js` (palettes, species, harvest, plants, geometry, materials, items)
   - `biomes/throne/src/55-biome-throne-trees.js` (zones, builders, passes)
   - `biomes/throne/src/60-biome-throne-floor.js` (the new floor function)
   - `biomes/throne/src/70-biome-throne.js` (one call)
   - `biomes/throne/src/99-host-take.js` and `biomes/throne/stations/ashdesert/99-host-take.js` (checks, preset views)
   - other stations' `99-host-take.js` **only** if section 7.4 says so
   - docs: `biomes/throne/BIOME-API.md`, `biomes/throne/KNOWN_ISSUES.md`, `biomes/throne/INDEX.md` (regenerated, never by hand)
      Do not touch `core/`, other biomes, `tools/`, or any `dist/` file by hand.
3. **Never open, read or grep:** anything in `dist/`, `three.min.js`, `*.zip`, `shots/`, `archive/`, `godot/data/`,
   `host/`, `core/materials/library/` images. They are huge and generated. When you search, search `biomes/throne/src`
   or pass `--glob '!**/dist/**'`.
4. **Never read a fragment whole if it is over ~30 KB.** `50-…` (79 KB), `55-…` (71 KB) and `60-…` (35 KB) are. Find
   sections with `grep -n "^// ------" <file>` and read only the range you need (offset/limit). Section 3 gives you
   the line numbers as of `origin/main` 3bd2969c (they will shift a little as you add code).
5. **Change code with small targeted edits.** Never regenerate or rewrite a whole fragment.
6. **Never put a `//` comment in the middle of a line.** These fragments pack many statements on one line; a `//`
   inserted mid-line silently comments out everything after it. Use `/* … */` for any comment that is not on its
   own line. Comments on their own line may use `//`.
7. **Append, never insert.** New species go at the **end** of `THRONE.SPECIES`. New passes go in a **new list** that
   runs after all the old passes (section 4). New items go at the end of their section. The random number generator
   is shared; anything placed before existing code reshuffles every station.
8. **No new fragments.** Add new sections inside the files listed in rule 2.
9. **`60-biome-throne-floor.js` and `70-biome-throne.js` are tagged `[G data]`** (they will be ported to Godot). They
   must not mention `THREE`, `T3`, `document`, `window`, `canvas`, or any geometry/material constructor. All drawing
   setup (geometry, materials, canvas textures, `BIO.def`) goes in `50-…`. The build runs a lint
   (`tools/check_port.py`) and fails if you break this.
10. **Do not generate, download or invent texture images.** Draw everything with vertex colours, instance colours and
    small canvas textures made in code (section 9). Then list every surface that wants a real texture (section 11).
11. **Do not thin, delete, recolour or retune any existing species or plant.** You only add.
12. **Stay inside the triangle budget** (20 M triangles a page, `BUDGET.showcase` in `99-host-take.js`). Station 1 is
    already near 18.6 M. If a phase breaks the budget, make *your* new plant lighter (fewer segments, fewer instances,
    hero band only). If you cannot, stop and report. Never lower another plant to make room.
13. **Do not push, merge, publish the gallery or rewrite `PORT-BASELINE.json`.** Commit on your branch only (section 12).
14. **If you are unsure, stop and write the question in your report.** Do not guess at lore, colours or placement
    beyond what this file says.

---

## 2. Setup (once)

The machine is Windows 11. Use Git Bash or PowerShell; the commands below are bash. `python` is Python 3; Node is at
`C:/Program Files/nodejs/node.exe` (the build uses it for its syntax check; it finds it on `PATH`).

```bash
cd /c/Users/travi/Documents/krator-master
git fetch origin
git worktree add ../krator-throne-flora -b gemini/throne-flora origin/main
cd ../krator-throne-flora
git lfs pull --include="biomes/throne/tex/*"
```

This file is `biomes/throne/HANDOFF-FLORA.md`, and the eleven reference pictures are already in
`biomes/throne/refs/` (`21-…` to `31-…`), so your worktree has them.

Build the two pages once **before changing anything**, and record the "before" state (section 8.2 says how):

```bash
cd biomes/throne
python build.py
python build.py --station ashdesert
```

Each build prints `built dist/<page>  (N fragments, K KB)  syntax OK`. If it prints `SYNTAX ERROR` or anything
else, stop: the checkout is wrong.

Verification needs Playwright: `pip install playwright` then `python -m playwright install chromium`, if
`python -c "import playwright"` fails.

---

## 3. Read these, in this order (and nothing else to begin with)

1. `CLAUDE.md` at the repository root: the house rules. Skim.
2. `biomes/throne/BIOME-API.md`: the kit's contract. Read "The fields it reads", "The zones", "The species", "The glow".
3. `biomes/throne/KNOWN_ISSUES.md`: what is known to be rough. Skim.
4. `biomes/throne/NOTES.md` lines 1-40: the lore (the plume, Krator's own life, the natives' poisons).
5. The reference pictures in `refs/21-…` to `refs/31-…`.
6. Then the code, **by section** (line numbers as of `origin/main`):

| file | lines | what to learn there |
|---|---|---|
| `src/50-biome-throne-species.js` | 17-67 | `THRONE.PAL`: colour palettes (arrays of hex) |
| | 69-134 | `THRONE.SPECIES`: the tree table; species 23 (`brimstone`) and 25 (`glasswillow`) are the newest, copy their shape |
| | 136-166 | `THRONE.HARVEST`: one entry per species key (required, the checks fail without it) |
| | 168-218 | `THRONE.PLANTS`: the floor plants, tagged; each lists its item keys |
| | 320-430 | `G.*`: local geometry makers. **`G.lathe` (331) is the workhorse**: read its comment |
| | 431-470 | materials `M.*`; `glowMat(key, day, night, map)` at 434 |
| | 574-578 | `THRONE.setNight` (glow by night: automatic for any `glowMat`) |
| | 607-end | `BIO.def(...)`: every instanced item. `brimcup` (≈658) is a good example |
| `src/55-biome-throne-trees.js` | 12-57 | `zones(x,z)`: fields in, zones out |
| | 75-82 | `treeGrow`, `dirOf`, `along`, `tip`: polyline makers |
| | 94-137 | foliage and cap helpers: `clumpAt`, `drips`, `bole`, `limb`, `cap` |
| | 411-414 | `capTube` |
| | 547-566 | **`B[23]`, the brimstone candelabra: the model builder to copy** |
| | 598-622 | `THRONE.buildTrees` and its inner `pass()` |
| | 624-681 | `THRONE.PASSES`: species, cell size, acceptance, options |
| | 683-end | `THRONE.make` / `THRONE.grow` |
| `src/60-biome-throne-floor.js` | 17-30 | floor helpers (`Y`, `around`, `tuft`, `card`, `flat`) |
| | 239-271 | **`THRONE.buildSulphur`: the model floor function to copy** |
| `src/70-biome-throne.js` | all (4 KB) | `THRONE.build`: the order things are built |
| `src/47-host-land.js` | 68-86 | station 1's `fieldsAt` and `FNAMES` |
| `stations/ashdesert/47-host-land.js` | "the fields" section | the ash desert's `fieldsAt` and `FNAMES` |
| `src/99-host-take.js` | 18-30, 61-130 | preset views (`VIEWS`), the checks (`HCHK`, `hostChecks`, `hostNegatives`) |

---

## 4. How the kit works (the minimum you need)

```
host fields (47-host-land.js)  ->  zones(x,z) (55)  ->  passes: where each species may stand (55)
                                                     ->  builders B[i]: draw one tree (55)
                                                     ->  floor functions: small plants (60)
items (BIO.def, 50) are instanced meshes; builders and floor code call BIO.put / BIO.beam / BIO.tube to add instances
```

- **Fields** are 0..1 maps the host page supplies (`vent`, `acid`, `cinder`, `flow` = gullies, `skylight`, `plume`,
  `rock`, `slope`, `ash`, …). `BIO.field(name,x,z)` reads one; a field a page does not supply reads 0.
  `BIO.hasField(name)` says whether the page supplies it at all.
- **Zones** (`zones(x,z)` in 55) combine fields into what the passes use: `vent`, `halo` (a vent's edge), `marsh` (the
  acid lake's and hot pools' shores), `sky` (skylights), `cinder`, `gully`, `cliff`, the open ground by flow age
  (`fresh`, `young`, `mature`, `old`), `alien` (0 on the clear shoulder, 1 deep under the plume), `seam` (the middle of
  the turn). Every zone is already multiplied by `live` = not a cliff and not barren ground. **Always build your
  acceptance from zones, never from raw fields**, so the no-trees-on-cliffs rule holds.
- **A pass** is `{sp, cell, accept:Z=>number, opt:{…}}`. The ground is cut into `cell`-metre cells; in each cell the
  pass may place one tree with probability `accept(Z)`. `opt.pad` keeps other trees that many metres away;
  `opt.reach(T)` reserves a radius for a wide tree; `opt.patch`/`patchScale` clump the trees; `opt.small` shrinks the
  hero/mid distances for small trees; `opt.depth:[lo,hi]` lets a tree stand in water that deep (and ignores the
  mask).
- **A builder** `B[i]=function(T,st,lv){…}` draws tree `T` = `{x,z,y0,sp,H,rb,crownR,seed,age}` at level of detail
  `lv` (2 near, 1 mid; level 0 is the far impostor, drawn from the species' `far` recipe, or skipped when `far:null`).
  It must end with `regTree(T,S,reach,height)` (the inspector uses it).
- **Floor functions** (`THRONE.buildSulphur` is the model) call `reseed(<own seed>)` first, then `BIO.grid(cell, 0, R,
  accept(x,z), place(x,y,z), opts)` per band of distance from the cameras (`BIO.LOD().floor` = `[near, far]` metres).
- **Glow:** a material made with `glowMat(key, day, night)` glows its own instance colour, weakly by day and strongly
  at night. `THRONE.setNight` handles it automatically.

### 4.1 The gating design (how the other nine pages stay untouched)

Two new **host fields**, each set to 1 everywhere on its page and absent (0) on every other page:

- `riftlife` on station 1 (`src/47-host-land.js`)
- `ashlife` on the ash desert (`stations/ashdesert/47-host-land.js`)

Every other station has its own `47-host-land.js`, so neither field reaches them. Then:

- New **trees** go in a new list, `THRONE.PASSES_NEW`, which runs **only when one of the two fields exists**. On the
  other pages it never runs, so it never draws from the random generator, so nothing there moves.
- New **floor plants** go in one new function, `THRONE.buildNewFlora`, on its own seed, called from `THRONE.build`
  only when one of the two fields exists (exactly how `buildSulphur` is gated on `sulph`).
- Each new species carries flags `rift:true` and/or `ashp:true` saying which page plants it (like `vents:true`).

On stations 1 and 7 the old trees keep their **positions** (their passes run first, unchanged). Their **shapes** may
change, because the builders run after all passes and share the generator. That is expected and acceptable; say so in
your report.

---

## 5. The new plants (one per reference, plus companions)

Colours are hex. Heights in metres. "Hero" = within the near band of the cameras, drawn in full; "mid" = a coarser
version. Every new species is `origin:'native'` (Krator's own life), `abyssal:false`, Koppen `['BSk']` or
`['BSk','BSh']` (the only classes these two stations have that fit; the `tagged` check rejects any class outside
`THRONE.KOPPEN`), and `plume` is one of `'plume'`, `'vent'` or `'seam'` (the check accepts only
`shoulder, seam, plume, vent, windward`).

### Trees (new `THRONE.SPECIES` entries 26-32)

---

#### 26 `chalice`: **Chalice parasol** (ref 21) — station 1 and the ash desert

- **Look:** a very tall, slender pale stalk that flares at its foot into a wide, fluted, conical skirt sitting on a
  mound; a smallish, almost flat cap on top, orange, with glowing amber gills beneath. They stand in loose rows. The
  stalk is silver-grey and streaked, like wet bark.
- **Size:** `H:[18,42]`, `rb:[.35,.6]` (the stalk's radius at mid height), `crownR:[3,6]` (the cap's radius).
- **Where:** station 1: gullies under the plume and the acid lake's shore. Ash desert: sparse giants on old ground
  in the lee of hills and yardangs.
  - accept: `(Z.gully*.25+Z.marsh*.2)*Z.alien*Z.riftlife + (Z.old*.05+Z.mature*.03)*Z.ashlife`
  - pass: `cell:44, pad:5, reach:T=>T.crownR*1.1+1, patch:.5, patchScale:.006`
- **Shape recipe:**
  1. The skirt: a new lathe item `chalskirt` (`G.lathe` profile from y=0 radius 1 to y=1 radius .12, concave:
     `[[0,1,.8],[.15,.62,.85],[.35,.34,.9],[.6,.2,.95],[1,.12,1]]`, 20 segments, `ribN:14, ribA:.08` for the flutes).
     `BIO.put('chalskirt',[T.x,T.y0-.3,T.z],qEuler(0,rr(0,TAU),0),[T.rb*5,H*.18,T.rb*5],barkCol(S,0))`.
  2. The stalk: `bole(T,S,'bark'+S.barkK,T.x,T.z,H*.97,T.rb*1.3,T.rb*.7,rr(.01,.04),rr(0,TAU),.015,lv===2?8:4,st,lv===2?8:4)`.
  3. The cap at the stalk's tip: `cap(tip(pts),T.crownR,.18,C(pick(PAL.chalCap)),st)` (it already puts the disc and gills).
  4. Glowing gills: one more instance of a new glow item `chalgill` (a flat lathe disc, `[[0,.05,1],[.5,.6,1],[1,1,1]]`,
     with the `glowMat`) just under the cap: `BIO.put('chalgill',[p.x,p.y-.05,p.z],q,[s*.95,1,s*.95],C(pick(PAL.chalGlow)))`.
  5. `regTree(T,S,Math.max(T.crownR,T.rb*5)+1,H+1)`.
- **Palette:** `chalStalk:[0x9a9690,0xa8a49c,0x8a8680]`, `chalCap:[0xc86a2a,0xd27a34,0xb85a22]`, `chalGlow:[0xffa040,0xffb050]`.
- **Species fields:** `barkK:2` (pale smooth), `far:{poleU:.92,taper:.3,blobs:[[.97,.6,.03,'L0','L1']]}`, flags `rift:true, ashp:true`, `plume:'plume'`.
- **Harvest line:** none edible; "The skirt holds the drizzle; the natives tap it for sour water."

---

#### 27 `cagebulb`: **Cage lantern** (ref 22) — station 1 and the ash desert

- **Look:** a twisted trunk of several root-strands braided together, standing on splayed roots; on top, a large
  egg- or onion-shaped bulb made of a **lattice** (big rounded holes, like a Voronoi cage), red-orange; inside, a
  dim glowing core; long thin roots hang from under the bulb.
- **Size:** `H:[6,16]`, `rb:[.25,.45]`, `crownR:[2,4]` (the bulb's radius).
- **Where:** station 1: the vents' halo and old ground under the plume. Ash desert: old flows (the scoured lava).
  - accept: `(Z.halo*.3+Z.old*Z.alien*.05)*Z.riftlife + (Z.old*.06+Z.young*.02)*Z.ashlife`
  - pass: `cell:30, pad:3, reach:T=>T.crownR*1.2+.5, patch:.5, patchScale:.01`
- **Shape recipe:**
  1. Trunk: 3-5 strands with `treeGrow` from points round the foot, each twisting round the axis (offset each
     polyline's points by an angle that grows with height: for point `k` of `n`, angle `a0+k/n*rr(2,3.5)`), drawn
     with `BIO.tube('bark'+S.barkK, pts, col, {seg:lv===2?5:3})`. Add the tube's return value to `st.limb`.
  2. The bulb: a new item `cagebulb`: `G.lathe` egg profile `[[0,.15,1],[.15,.6,1],[.45,1,1],[.75,.85,1],[.95,.35,1],[1,.05,1]]`,
     24 segments, with a material using a **canvas alpha map of round holes** (section 9.2), `alphaTest:.5`,
     `side:DoubleSide`. Put it at the trunk's tip, scaled `[R,R*1.4,R]`.
  3. The core: a glow item `cagecore` (`new T3.IcosahedronGeometry(1,1)` with `glowMat`), at the bulb's centre, scale `R*.35`.
  4. Hanging roots (hero only): 6-12 `BIO.tube` polylines from the bulb's lower half, drooping 1-3 m, radius .03-.06.
  5. `regTree(T,S,R+1,H+R)`.
- **Palette:** `cageBulb:[0xb8301a,0xc84020,0xa02818,0xd85a2a]`, `cageCore:[0xff7a20,0xff9a30]`, `cageRoot:[0x5a2a20,0x6a3226,0x4a221a]`.
- **Species fields:** `barkK:8` (rope strands), `far:{poleU:.7,taper:.2,blobs:[[.82,.6,.18,'L0','L1']]}`, flags `rift:true, ashp:true`, `plume:'vent'`.
- **Harvest line:** "The cage is chitin-hard; the ash nomads use old ones as lanterns."

---

#### 28 `medusa`: **Medusa cap** (ref 24) — station 1 only

- **Look:** a domed, glossy dark-maroon cap with pale spots, its underside ribbed and glowing orange-red, and from its
  rim a curtain of long dark-red tendrils hanging nearly to the ground, twisting together. A thin stalk, mostly hidden.
- **Size:** `H:[4,10]`, `rb:[.08,.16]`, `crownR:[1.6,3.4]`.
- **Where:** gullies and skylights under the plume; mature/old ground deep under it.
  - accept: `(Z.gully*.3+Z.sky*.35+Z.mature*Z.alien*.03)*Z.alien*Z.riftlife`
  - pass: `cell:22, pad:2.5, reach:T=>T.crownR*1.1, patch:.55, patchScale:.012`
- **Shape recipe:**
  1. Stalk: `capTube` on a `treeGrow` straight up, `H*.92`.
  2. Dome: a new item `medusadome`: lathe `[[0,1,1],[.4,.9,1],[.75,.6,1],[1,.05,1]]` (a dome, open below), 20 segments.
     Spots: instance colour only (section 9.1 if you want a spot texture).
  3. Underside: a glow item `medusagill` (flat lathe disc with `gillN:24, gillA:.3`), just under the dome.
  4. Tendrils: hero `ri(14,24)`, mid `ri(4,6)`: from points on the rim, `treeGrow` straight down `H*rr(.5,.85)` with
     `wig:.06`, radius `.04 -> .01`, colour `PAL.medusaTendril`; `st.limb+=BIO.tube(...)`.
  5. `regTree(T,S,T.crownR+.5,H+T.crownR*.6)`.
- **Palette:** `medusaDome:[0x4a1218,0x5a1a20,0x3a0e14]`, `medusaGlow:[0xff6a3a,0xff8048]`, `medusaTendril:[0x8a1a1a,0x7a1414,0xa02020]`.
- **Species fields:** `barkK:9`, `far:null` (small: no impostor), flag `rift:true`, `plume:'plume'`.

---

#### 29 `lacefan`: **Lace-fan tree** (ref 27) — station 1 only

- **Look:** a squat, gnarled, deeply ribbed brown trunk that splits into several thick branches; each branch ends in a
  ribbed, knobby **sheath** like a cup, and from each cup rises a wide fan-shaped bracket: orange, perforated like lace
  (a branching vein pattern with holes between), glowing white-orange from inside. Picture it as a bonsai of
  glowing lace fans.
- **Size:** `H:[6,14]`, `rb:[.5,.9]`, `crownR:[3,6]`.
- **Where:** the vents' halo and old ground under the plume; a few in skylights.
  - accept: `(Z.halo*.2+Z.old*Z.alien*.04+Z.sky*.1)*Z.alien*Z.riftlife`
  - pass: `cell:36, pad:3.5, reach:T=>T.crownR*1.1, patch:.5, patchScale:.01`
- **Shape recipe:**
  1. Trunk: `bole(...)` short and thick (`H*.4`, `wig:.05`), then 4-7 branches with `treeGrow` at elevations 0.6-1.2 rad,
     drawn with `limb(...)`.
  2. Cups: a new item `lacecup`: lathe `[[0,.6,.8],[.4,.75,.9],[.8,.95,1],[1,1.05,.95]]`, `ribN:10, ribA:.1`; one at each
     branch tip, scale ~`T.rb*.6`.
  3. Fans: a new item `lacefan`: a **bracket** (lathe with `arc:.5`, a half circle; profile `[[0,.05,1],[.3,.5,1],[1,1,1]]`,
     `wavN:5, wavA:.12` for the lobed rim), material = `glowMat` with a **canvas alpha map** of the lace pattern
     (section 9.2), `alphaTest:.45`. Two fans per cup, overlapping, tilted up 0.3-0.6 rad, facing outward.
  4. `regTree(T,S,T.crownR+1,H+1)`.
- **Palette:** `laceBark:[0x5a4234,0x4e3a2e,0x664a3a]`, `laceFan:[0xe88040,0xf09050,0xd87030]`.
- **Species fields:** `barkK:0`, `far:{poleU:.6,taper:.3,blobs:[[.75,1,.3,'L0','L1']]}`, flag `rift:true`, `plume:'vent'`.

---

#### 30 `braidcap`: **Braid cap** (ref 29) — station 1 only

- **Look:** a pale violet stem wrapped by 3-5 dark green-and-purple vine strands in a tight helix; 2-4 spotted purple
  caps at different heights on short side stalks, the biggest at the top; the stem flares a little at its foot.
- **Size:** `H:[8,18]`, `rb:[.2,.35]`, `crownR:[2.5,4.5]`.
- **Where:** gullies and skylights (the plume's dark wet places), and the acid lake's shore.
  - accept: `(Z.gully*.18+Z.sky*.25+Z.marsh*.1)*Z.alien*Z.riftlife`
  - pass: `cell:30, pad:3, reach:T=>T.crownR*1.1, patch:.5, patchScale:.01`
- **Shape recipe:**
  1. Stem: `capTube` on a gently curving `treeGrow` (`curve:.05`).
  2. Vines: 3-5 helices: for each, sample the stem with `along(pts,u)` at u=0..1 (12 steps hero, 5 mid) and offset each
     sample sideways by `r*1.1` at angle `a0+u*rr(5,8)`; `BIO.tube` with radius `.06 -> .03`.
  3. Caps: top cap with `cap(tip(pts),T.crownR,.22,col,st)`; 1-3 lower caps on short `treeGrow` side stalks
     (length .6-1.5 m, elevation ~0.5 rad) with radius `T.crownR*rr(.35,.6)`.
  4. `regTree(T,S,T.crownR+1,H+1)`.
- **Palette:** `braidStem:[0xb8a0c8,0xa890bc,0xc4acd4]`, `braidVine:[0x2e4a2a,0x4a2a4a,0x3a4a30]`, `braidCap:[0x7a3aa0,0x8a46b0,0x6a2e90,0x9a50c0]`.
- **Species fields:** `barkK:2`, `far:{poleU:.85,taper:.3,blobs:[[.92,.8,.1,'L0','L1']]}`, flag `rift:true`, `plume:'seam'`.

---

#### 31 `pyre`: **Pyre thistle** (ref 30) — the ash desert (and a few on station 1's cinder)

- **Look:** a tall spiky rosette, like a black flame: long leathery near-black blades, serrated, pointing upward and
  outward, the inner ones taller; the blades' inner faces glow ember-orange with vein patterns. From the centre rises
  a single long pale stalk that arcs over and ends in a glowing orange lure. Its foot is a black bulb with claw-like
  roots splayed across the ash.
- **Size:** `H:[3,8]` (the blades' height; the stalk rises to `H*1.5`), `rb:[.4,.7]` (the bulb), `crownR:[1.5,3]`.
- **Where:** ash desert: open ash, deep ash, the dunes' windward faces, scoured lava. Station 1: cinder cones under the plume.
  - accept: `(Z.young*.08+Z.old*.06+Z.ashdeep*.05)*Z.ashlife + Z.cinder*Z.alien*.05*Z.riftlife`
    (note `Z.ashdeep` is not multiplied by `live` in `zones`; multiply it by `(1-Z.cliff)` here)
  - pass: `cell:20, pad:2.5, reach:T=>T.crownR*1.1, patch:.55, patchScale:.01`
- **Shape recipe:**
  1. Bulb: an `IcosahedronGeometry(1,1)` item `pyrebulb`, squashed `[rb*1.4,rb,rb*1.4]`, near-black.
  2. Claw roots: 5-8 `BIO.tube` polylines lying on the ground (`Y(x,z)` from 60 is not available in 55; use
     `BIO.terrainH(x,z)`), curling at the tips.
  3. Blades: a new item `pyreblade`: a thin flat lanceolate shape. Simplest: `G.lathe` with `arc:.08` is awkward; instead
     build a flat blade with `BIO.geo._make(pos,nor,uv)` (see `G.tuft` at 322 for how a geometry is made from arrays):
     a long narrow leaf, 12 points down each side, with saw teeth (every other edge point pushed out 15%). Give it a
     **vertex colour gradient**: near-black outside, ember orange `0xe0501a` along the midline. Material: `glowMat`
     with a low day level (`.04`) and night `.5`, so the midline glows. 14-24 blades (hero), 6-8 (mid), in two or three
     rings, rising 1.1-1.45 rad.
  4. Stalk and lure: one `treeGrow` stalk, pale `0xd8d0b8`, rising `H*1.3` then arcing over (`curve:-.15`); at its tip a
     glow item `pyrelure` (a small lathe tear-drop) in `0xff8a20`.
  5. `regTree(T,S,T.crownR+1,H*1.5)`.
- **Palette:** `pyreBlade:[0x1a1414,0x221a18,0x140e0e]`, `pyreVein:[0xe0501a,0xf06a2a]`, `pyreStalk:[0xd8d0b8,0xc8c0a8]`, `pyreLure:[0xff8a20,0xffa030]`.
- **Species fields:** `barkK:9`, `far:{poleU:.5,taper:.6,blobs:[[.5,.8,.4,'L0','L1']]}`, flags `ashp:true, rift:true`, `plume:'plume'`.
- **Harvest line:** `medicinal:true`, "The lure's sap is an anaesthetic the ash nomads trade; too much stops the heart."

---

#### 32 `coilhorn`: **Coil horns** (ref 31) — both stations

- **Look:** thick ribbed tubes, yellow mottled with olive-green and black mould, rising from the ground and coiling in
  a spiral, tapering to a hooked tip; in clusters of 3-9 of mixed size.
- **Size:** `H:[1.5,6]` (the coil's height), `rb:[.25,.6]` (the tube's radius at its foot), `crownR:[1,3]` (the coil's radius).
- **Where:** station 1: the acid lake's shore and the hot pools (marsh), gullies. Ash desert: the **rim** of the CO2
  hollow (they live on its gas) and the lee hollows of yardangs.
  - Expose the ash desert's `hollow` field in `zones` (section 7.2) as `hollowRim`:
    `smooth(.0,.3,F('hollow'))*(1-smooth(.6,.95,F('hollow')))*live` (the ring just outside the deadly floor).
  - accept: `(Z.marsh*.25+Z.gully*.08)*Z.riftlife + (Z.hollowRim*.5+Z.yard*.04)*Z.ashlife`
  - pass: `cell:14, pad:2, reach:T=>T.crownR*1.2, patch:.6, patchScale:.014`
- **Shape recipe:** each tree is a cluster. For each horn: a helix polyline, 16 points (hero) / 6 (mid): point `k` at
  `t=k/n`: angle `a0+t*rr(3.5,5.5)`, radius `R*(1-t*.7)`, height `H*sin(t*PI*.8)` (it rises then droops into the hook);
  radius along it `rb*(1-t*.85)`. `BIO.tube('bark5', pts, col, {seg:lv===2?10:5, cap:true})` (`barkK:5` = banded, which
  gives the ribs). Colour each point from `PAL.coilYellow` with every third point lerped toward `PAL.coilMould`.
- **Palette:** `coilYellow:[0xc8b830,0xd4c440,0xb8a828],coilMould:[0x3a4a1a,0x1e2410,0x4a5a22]`.
- **Species fields:** `barkK:5`, `far:null`, flags `rift:true, ashp:true`, `plume:'vent'`.
- **Harvest line:** "Hollow and stinking of the gas they live on; the ash nomads read the hollow's mood by their colour."

### Floor plants (new `THRONE.PLANTS` entries, placed by `THRONE.buildNewFlora`)

| key | name | ref | stations | where (from zones / fields) | shape (items in `50-…`) | size |
|---|---|---|---|---|---|---|
| `emberburr` | Ember burr | 22 | both | cinder, the vents' halo, young lava | a spiky ball: new item `burr` made of ~30 thin cones radiating from a point (merge them into one geometry with `BIO.geo._make`), red `0xc83020`, `glowMat` low by day; a short stalk with `BIO.beam('rod',…)` | 0.5-2 m |
| `bloodchalice` | Blood chalice | 23 | station 1 | the acid lake's and pools' shore (marsh), gullies | a cluster of 5-12 tall flared trumpets: new item `bchalice` = `G.lathe` `[[0,.08,.7],[.6,.12,.8],[.85,.3,.9],[1,.6,1]]` with `wavN:2, wavA:.25` (a lip on one side), deep red `0x9a1a24`; stems with `BIO.beam('rod',…)` | 1-3 m |
| `mossdome` | Moss domes | 24 | station 1 | gullies, marsh margins, skylights | squat domes: new item `mossdome` = lathe `[[0,1,.8],[.3,.95,.9],[.7,.7,1],[1,.1,1]]` with `jit:.06` (lumpy), moss green `0x6a8a3a..0x8a9a4a`; on hero, a fringe of 8-14 pale hanging roots on the downhill side (`BIO.tube`, `0xd8d0c0`) | 0.4-2.5 m |
| `redcoral` | Red coral-fern | 24 | station 1 | with the moss domes | branching red sprays: reuse the existing `feather` or `plumebush` item tinted `0xd83a2a` (see `plumebush` in 60) | 0.3-1 m |
| `geodepod` | Geode pods | 25 | both | rocky ground that is not a cliff: `rock>.4 && slope<.8`; station 1 the cones and flow fronts' feet, ash desert the hills and yardangs | 4-6 cracked shell lobes (new item `geolobe`: lathe quarter-shell with `arc:.22`, `jit:.04`, grey `0x8a8a86`) round a glowing core (new glow item `geocore`, teal `0x20d0b0`, an icosahedron) | 0.4-1.5 m |
| `velvet` | Red velvet | 26 | station 1 | the acid lake's and pools' wet shore (marsh), nowhere else | flat patches: the existing `mat` geometry (`BIO.geo.mat()`) as a **new** item `velvet` with its own plain Lambert material, crimson `0x9a1a22..0xb02430` (do **not** reuse item `mat`: that is the slime mould and glows pink at night) | patches 2-6 m |
| `wirestalk` | Wire sporestalks | 26 | station 1 | in the velvet | bundles of 4-10 very thin tall orange filaments (`BIO.beam('rod',…)`, radius .01-.02, `0xe8702a`) each topped by a spore ball (new item `sporeball`, small icosahedron, `0xe8803a`) | 1.5-4 m |
| `pinshroom` | Gold pins | 26 | station 1 | in the velvet and gullies | clusters of 3-8 tiny glowing gold mushrooms (new glow item `pin`: lathe cap on a rod) `0xf0c040` | 0.05-0.25 m |
| `snareraft` | Snare raft | 28 | station 1 | **floating** on the acid lake and the hot pools (0.4-4 m deep): use `BIO.grid` with `depth:[.4,4], noMask:true` exactly as the acid pads do in `buildSulphur` | a ruffled leaf pad (new item `raftpad`: lathe disc `[[0,0,1],[.8,.9,1],[1,1,1]]`, `wavN:9, wavA:.15`, green `0x5a9a2a`) on the water surface (`BIO.waterH(x,z)+.02`); a central dome of pale hairs (reuse `feather`, tinted `0xd8e0c0`); 6-12 runners lying on the water (`BIO.tube` flat, pale green) each ending in a small sundew disc (a smaller `raftpad`, `0x7ab040`) | 2-5 m across |

Tags for every floor plant: `PK(name,'temperate',aridity,riparian,['BSk'],'native',plume,[items…],HV(…))`:
`emberburr` arid/no/plume; `bloodchalice` humid/yes/vent; `mossdome` subhumid/both/seam; `redcoral` subhumid/both/seam;
`geodepod` arid/no/plume; `velvet` humid/yes/vent; `wirestalk` humid/yes/vent; `pinshroom` humid/both/plume;
`snareraft` humid/yes/vent (its HV: `medicinal:true`, "Carnivorous: the runners' discs hold what lands on the water.
Part of the arrow poison (NOTES.md).").

**List every item key a plant uses** in its `items` array, or the inspector cannot name it.

---

## 6. Phases (do them in this order; one commit each)

Each phase: write the code, build both pages, verify (section 8), take **one** screenshot of the new plant from a
preset view, commit. Do not start the next phase with a failing check.

| phase | what | why this order |
|---|---|---|
| **P0** | the gating (section 7): the two fields, the zones, `THRONE.PASSES_NEW`, `THRONE.buildNewFlora` (empty), the check filters. **No plants yet.** Prove the nine other pages unchanged | everything else stands on it |
| **P1** | `geodepod` (floor) | simplest: lathe shells and a glow core |
| **P2** | `emberburr`, `velvet`, `wirestalk`, `pinshroom` (floor) | simple shapes; teaches glow and the floor bands |
| **P3** | `pyre` (tree 31) | the ash desert's hero; teaches a custom geometry |
| **P4** | `chalice` (tree 26) | teaches the bole and cap helpers |
| **P5** | `coilhorn` (tree 32), `medusa` (tree 28), `braidcap` (tree 30) | polyline work |
| **P6** | `bloodchalice`, `mossdome`, `redcoral` (floor) | |
| **P7** | `cagebulb` (tree 27), `lacefan` (tree 29) | hardest: the canvas alpha textures |
| **P8** | `snareraft` (floor, on water) | water placement |
| **P9** | docs (section 10), the texture-gap list (section 11), the report (section 12) | |

If you run low on time, stop at the end of any phase with everything committed and checks passing. Half the plants,
done right, is worth more than all of them half-done.

---

## 7. P0 in detail: the gating

### 7.1 The two fields

In `src/47-host-land.js`:
- add `'riftlife'` to the end of the `FNAMES` array (line ≈75);
- add `riftlife:1` to the object `fieldsAt` returns (the `return{…}` inside `fieldsAt`, line ≈68-74).

In `stations/ashdesert/47-host-land.js`: the same with `'ashlife'` and `ashlife:1` (its `FNAMES` and `fieldsAt`
return are in "the fields" section).

### 7.2 The zones

In `src/55-biome-throne-trees.js`, function `zones(x,z)` (line ≈45):
- in the second `const` line, add: `riftlife=F('riftlife'),ashlife=F('ashlife'),hill=F('hill'),yard=F('yard'),hollow=F('hollow')`
- in the returned object add: `riftlife:riftlife*live,ashlife:ashlife*live,hill:hill*live,yard:yard*live,hollowRim:smooth(0,.3,hollow)*(1-smooth(.6,.95,hollow))*live`
- add a line to the comment block above (12-41) describing the five, in the same style.

`live` is defined further down than the `F(...)` reads; put your additions to the return object, not to the early
`const` lines, if they use `live`. Read the function before editing.

### 7.3 The new pass list

In `55-…`, after `THRONE.PASSES=[ … ];` (ends ≈681), add:

```js
// THE NEW FLORA (stations 1 and 7: the 'riftlife' and 'ashlife' fields; HANDOFF-FLORA.md). Its own list, run after every
// other pass and only on a page with one of the fields, so no other page draws from the generator for it
THRONE.PASSES_NEW=[
];
```

In `THRONE.buildTrees` (≈602), right after `THRONE.PASSES.forEach(pass);` add:

```js
 if(BIO.hasField('riftlife')||BIO.hasField('ashlife'))THRONE.PASSES_NEW.forEach(pass);
```

### 7.4 The new floor function

In `60-…`, a new section at the very end of the fragment, **inside** its closing `})();` (look at how the file ends):

```js
// ---------------------------------------------------------------- the new flora (stations 1 and 7: HANDOFF-FLORA.md)
// Only where the host hands in 'riftlife' or 'ashlife', on its own seed (so no other page's floor moves)
THRONE.buildNewFlora=function(R,q){reseed(660047);q=q==null?1:q;R=R||2500;const st={},L=BIO.LOD();
 const rift=BIO.hasField('riftlife'),ash=BIO.hasField('ashlife');
 return st;};
```

In `70-biome-throne.js`, after the `cave` line:

```js
 // the new flora (stations 1 and 7): only where the host has the field (its own seed)
 if((BIO.hasField('riftlife')||BIO.hasField('ashlife'))&&THRONE.buildNewFlora){BIO.cur='throne/floor';out.newflora=THRONE.buildNewFlora(R,q);}
```

### 7.5 The checks that must learn about the new species

- `src/99-host-take.js`, `HCHK.placed` (≈line 70): station 1 requires every species not `windward`, `vents` or `cold`.
  Change its filter to also skip the ash desert's own: add `&&(S.rift||!S.ashp)` to the filter. (So a species with
  `ashp` but no `rift` is not required on station 1.)
- `stations/ashdesert/99-host-take.js`, `HCHK.placed`: it lists `['pagoda','drizzle','ropepuff','lampcap']`. Add each new
  `ashp` species' key **in the phase that adds it**.
- **Every other station's `99-host-take.js`:** open each one's `placed(C){` line (`grep -n "placed(C)" stations/*/99-host-take.js`).
  If its filter is a fixed list of keys or a flag (`S.vents`, `S.isle`, …), leave it. If it is a rule that new species
  would match (like station 1's), make it skip `S.rift||S.ashp`, and say which you changed in your report.
- Add one new check to each of the two pages, with a negative control (a broken input that must fail), modelled on
  `bells` in `src/99-host-take.js`: **"the new flora stays on its own page"**: every placed tree whose species has
  `rift` or `ashp` is on a page whose field exists. Negative: feed it a tree list with a `pyre` (ashp only) on station 1
  and require the check to fail. Optional but good: a check that no `snareraft` instance sits on dry land.

### 7.6 Prove P0 changed nothing

Section 8.2. All nine other pages must be identical in placement. Stations 1 and 7 must be identical too (no plants
yet). Only then commit P0.

---

## 8. Build and verify (every phase)

### 8.1 Build

```bash
cd biomes/throne
python build.py
python build.py --station ashdesert
```

From P0 on, also build the other nine at P0 and at the end (P9), to prove them untouched:

```bash
for s in kipuka frontier isle cloudforest savanna vents glacier caldera tube; do python build.py --station $s; done
```

Every build must print `syntax OK`. The build also runs the port lint first; if it says
`the port lint failed`, you used a browser API in `60-…` or `70-…` (rule 9).

### 8.2 Verify

The Throne has no `verify.py` of its own; use the shared one from a sibling biome kit (it is kit-agnostic):

```bash
cd ../..    # the worktree root
python biomes/geyser/verify.py biomes/throne/dist/throne.html --assert --out ../flora-shots/p1
python biomes/geyser/verify.py biomes/throne/dist/throne-ash.html --assert --out ../flora-shots/p1
```

- It loads the page in headless Chromium with software WebGL. **Each run takes minutes.** Run them in the background
  and wait; do not start them twice.
- It must exit 0: no errors on the page's error panel, every assertion and every host check `ok`, every negative
  control failing as it should, and the triangle budget held.
- **SwiftShader flakes about one run in seven** with a `null shader-info-log TypeError`. Re-run once before believing it.
- **Shader errors are silent**: a broken material just makes a mesh vanish. If a new plant does not show, read the
  page's console in the verify output for `THREE.WebGLProgram` messages.
- Keep screenshots outside the worktree (`../flora-shots/`, as above) so they can never be committed.

**Placement fingerprint (P0 and P9):** run with `--eval` to print a hash of every tree's position and species, before
your changes (on a clean build of `origin/main`) and after:

```bash
python biomes/geyser/verify.py biomes/throne/dist/throne-vents.html --eval "()=>{let h=0;for(const T of THRONE.TREES){const s=T.sp+','+Math.round(T.x*10)+','+Math.round(T.z*10);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;}return THRONE.TREES.length+' '+h;}"
```

Record the "before" numbers for all eleven pages in your report. After P0 and after P9, all nine other pages must
print the same numbers. On stations 1 and 7, the old species must keep the same positions: filter the hash to
`T.sp<26` and compare.

Also run the smoke test on all eleven pages at the end:

```bash
python tools/harness.py smoke biomes/throne/dist/throne.html biomes/throne/dist/throne-ash.html
```

### 8.3 Look at it

One screenshot per phase. Add a preset view for each new tree to the page's `VIEWS` (in its `99-host-take.js`),
following the `'Bone bells in the steam':atTree(nearTree('bonebell',NC.x,NC.z),30,2.6,4,.5)` pattern (read `atTree`
and `nearTree` in that file first). The verify screenshots every preset into `--out`. Name views plainly:
`'Chalice parasols in the gully'`. The `camerasOut` check fails if a view starts under the ground.

Compare each screenshot with its reference picture. The aim is the **silhouette and colour** read at 5-30 m, not
photo-realism. Fix the obvious mismatches (wrong proportions, wrong colour, floating, buried, clipping into other
trees) before you commit.

To watch it live in a real browser (faster than headless, and with the GPU): serve the `dist/` folder
(`python -m http.server 8840 --directory biomes/throne/dist`) and open `http://localhost:8840/throne.html`. The page
takes ~15 s to build. Alt+click shows the inspector (the plant's name and tags). `?q=0.5` halves the density for quick
looks.

---

## 9. Drawing recipes and gotchas

### 9.1 Adding a species, step by step (copy this checklist into each phase)

1. `50-…` palettes: add your `PAL.*` arrays at the end of `THRONE.PAL` (before its closing `};`).
2. `50-…` species: append `/*26*/{key:'chalice',name:'Chalice parasol',alien:true,rift:true,ashp:true,H:[18,42],rb:[.35,.6],crownR:[3,6],barkK:2,bark:PAL.chalStalk,leaf:PAL.chalCap,far:{…},tags:K('temperate','semiarid','no',['BSk'],'native','plume')},`
   at the end of `THRONE.SPECIES` (before `];`). The index in the comment must equal its position.
3. `50-…` harvest: add `chalice:HV('none',[],false,'…'),` to `THRONE.HARVEST`.
4. `50-…` materials and items: any new geometry goes in `G.*` (after the last `G.` maker), any new material in `M.*`
   (glowing ones with `glowMat('key',day,night)`; plain ones copy how `M.vcol` or `M.vsway` is made), and the item with
   `BIO.def('key',geometry,material,{label:'Readable name'})` at the end of the instanced-items section.
5. `55-…` builder: `B[26]=function(T,st,lv){ … regTree(T,S,reach,height);};` in a new section at the end of the
   builders, before "the pass" section (≈598). Begin with
   `const S=SP[T.sp],H=T.H,R=T.crownR,fam='bark'+S.barkK;` like `B[23]`.
   The build fails loudly (`throne: no builder for species 26`) if you forget it.
6. `55-…` pass: add `{sp:26,cell:…,accept:Z=>…,opt:{…}},` to `THRONE.PASSES_NEW`.
7. The ash desert's `placed` list (if `ashp`).
8. A preset view.
9. Build both pages, verify, screenshot, commit.

### 9.2 Lace and lattice (the cage lantern, the lace fan)

The look comes from **holes**. Make a canvas texture once in `50-…` (the leaf and bark texture sections, 220-319,
show how the kit paints canvases; copy their pattern):

- **Lattice (cage lantern):** 256x256 canvas, fill white, then draw ~40 filled black circles (random centres, radius
  14-26 px, kept ~6 px apart) so white struts remain between them. Use it as `alphaMap` with `alphaTest:.5`,
  `transparent:false`, `side:T3.DoubleSide`. Wrap: `RepeatWrapping`, and set the lathe's UVs to repeat 3x round.
- **Lace (fan):** 256x256 canvas, fill black, then draw white branching veins from the bottom centre outward (a
  recursive branch: 6 main veins, each forking twice, line width 6 -> 2 px), then a white rim band along the top.
  `alphaMap` with `alphaTest:.45`, on the `glowMat` (pass the canvas texture as its `map` too, so the veins glow).
- Make the random circles and veins with the kit's seeded `rr`/`rng`, never `Math.random()`: the build must be
  deterministic.
- Note in KNOWN_ISSUES that these are procedural stand-ins and in the texture-gap list that they want an owner's
  cut-out texture.

### 9.3 Things that will bite

- `BIO.put(item,[x,y,z],quaternion,scale,colour,opts)`: `scale` may be a number or `[sx,sy,sz]`; `colour` is a
  `THREE.Color` (use `C(hex)`, or `vary(C(pick(PAL.x)),.03,.08,.06)` for variety) or `null` (the texture's own).
- `qEuler(x,y,z)` makes the rotation. Y is up.
- `T.y0` is the ground under the tree (already 0.4 m sunk). Put the foot of everything at or a little below `T.y0`.
- `st.trunk` / `st.limb` / `st.caps`: add what `BIO.tube` returns to `st.trunk` or `st.limb`; count caps with `st.caps++`.
  `newStats()` (≈600) lists the counters; add your own counter there only if you report it.
- Level of detail: always make the `lv===1` version much cheaper (fewer segments, fewer tendrils, no fringe). Use
  `lv===2?many:few` everywhere, like `B[23]`.
- Floor bands: in `buildNewFlora`, plant near things in `L.floor[0]` (hero), mid things to `L.floor[1]`, with
  `box:BIO.originBox(hi)` as in `buildSulphur`. Nothing small beyond `L.floor[1]`.
- Never call `Math.random()`. Use `rr(a,b)`, `ri(a,b)`, `pick(arr)`, `rng()`.
- Water: on station 1, `BIO.waterH(x,z)` is the lake's or pool's surface (or a huge negative number where there is
  none). `BIO.depth(x,z)` is how deep. The `dry` check fails if an instance sits more than a metre under water; the
  snare raft must sit **on** the surface.
- The ash desert's CO2 hollow must stay empty: its `hollow` check fails if anything stands in it. `hollowRim` keeps
  the coil horns outside it; check the screenshot.

---

## 10. Docs (P9)

- `BIOME-API.md`: add the two fields (`riftlife`, `ashlife`) and the zones you exposed (`hill`, `yard`, `hollowRim`) to
  "The fields it reads"; the seven species (26-32) to the species table with their flags; a line under "What the kit
  exports" for `THRONE.PASSES_NEW` and `THRONE.buildNewFlora`.
- `KNOWN_ISSUES.md`: one item, `- [ ] **The new flora's surfaces are procedural** (2026-10-…)`, listing which plants
  are vertex colour or canvas stand-ins, and anything that looks wrong you could not fix.
- `INDEX.md`: regenerate, never edit by hand: `python tools/make_index.py` (from the worktree root). It rewrites every
  build's INDEX.md; stage only `biomes/throne/INDEX.md` (and the root `INDEX.md` only if its Throne line changed).
- `PORT.md`: run `python tools/audit_port.py biomes/throne` only if the build's lint asks; keep the Tag and Note cells.
- Do **not** edit `PORT-BASELINE.json`. Run `python tools/port_baseline.py` and paste its summary into your report:
  the eleven Throne pages will differ (the new code is in every page) and nothing else should.

---

## 11. Texture gaps (P9): write them, do not make them

The owner supplies textures. For each surface below that you drew procedurally, add a row to a new section at the end of
your report titled **"Textures wanted"**, with a paste-ready image prompt in this form (one fenced block per texture;
the owner pastes it straight into an image generator):

```
Seamless tileable texture, 2048x2048, top-down orthographic, flat even lighting, no shadows, no perspective:
<the surface, in plain words, with its colours written in as hex>. Matte unless stated. Physically plausible scale:
one tile covers <N> metres.
```

Cut-outs (blades, fans, lattice, leaves) are different: **"isolated on a flat pure magenta (#FF00FF) background,
front view, the whole object in frame, no shadow"**, so they can be keyed out.

The surfaces: the chalice stalk (streaked silver bark), the cage lantern's lattice (cut-out), the lace fan (cut-out,
glowing), the medusa dome (glossy maroon, pale spots), the pyre thistle blade (cut-out, black with ember veins), the
coil horn (ribbed yellow with mould), the braid cap's cap (spotted purple), the geode shell (cracked grey stone) and
its crystal core (teal), the red velvet (ground cover), the moss dome (lumpy moss). Do not open
`core/materials/PLAN.md`'s images; you may read its text section "Prompts for generated sources" for the house style.

---

## 12. Committing and handing back

- Commit at the end of each phase on `gemini/throne-flora`, staging **only** files you changed (`git add <paths>`,
  never `git add -A`). Built pages are committed in this repo (Git LFS handles them): include every file under
  `biomes/throne/dist/` that the builds changed (`git status biomes/throne/dist` lists them; after P9's full rebuild
  that is all eleven pages, since each carries the new code). Never commit screenshots.
- Message style: one plain line saying what the phase added, a blank line, then what you checked. End with your own
  attribution line.
- **Do not push.** The owner (or Claude) will review and merge.

**Your report** (write it to `biomes/throne/HANDOFF-FLORA-REPORT.md` and commit it last) must contain:
1. Each phase: done or not; what you checked and the result (paste the verify summary lines, not the whole log).
2. The placement fingerprints before and after for all eleven pages.
3. The triangle counts of stations 1 and 7 before and after (from the verify output).
4. Every place you departed from this file, and why.
5. Every check you added, with its negative control.
6. Open questions for the owner.
7. "Textures wanted" (section 11).

---

## 13. Common mistakes (read again before each phase)

- Appended the species but forgot its builder, or its `HARVEST` entry, or its `placed` list entry.
- Put a pass in `THRONE.PASSES` instead of `THRONE.PASSES_NEW` (moves every station's trees).
- Read a raw field (`BIO.field('rock',…)`) in an `accept` instead of a zone (trees on cliffs).
- A `//` comment mid-line (silently deletes code).
- `THREE` or a canvas in `60-…` or `70-…` (the port lint fails).
- `Math.random()` (the build stops being deterministic; the fingerprints never match).
- A glowing thing on a plain material (it will not glow at night), or a plain thing on `glowMat` (it glows when it should not).
- Reusing the `mat` item for the red velvet (it is the slime mould and glows pink).
- Forgetting `lv===1` is a real level (mid trees look like hero trees and blow the budget).
- Opening `dist/` files or the built HTML to "check" something. Use the verify and screenshots.
