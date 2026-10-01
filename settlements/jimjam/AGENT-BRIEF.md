# Jimjam kit: brief for building agents

You are adding buildings to the **Jimjam City Kit** (`settlements/jimjam/`), a procedural Three.js building set that builds into one HTML page. Read this whole brief, then the parts of the style brief it points to. Work only in the files your task names.

## 1. What Jimjam looks like

Read **sections 5, 6 and 7 of `jimjam-chatgpt-prompt.md`** (repo root). They hold the style brief, the palette intent, the vocabulary and the specification of every building. In short: an exotic city of **red and yellow brick with white marble trim**, many **domes** (gold, slate ribbed, terracotta), **thick staged spires**, **raised plazas** on podiums with marble stairs, **arcades on patterned brick columns**, porthole windows in gold frames, **clustered ornamental chimney stacks** (Tudor style: spiral, chevron, diamond shafts), crenellated parapets, banners with a gold sun.

Reference images (look at them):

| File | What to take |
|---|---|
| `/tmp/claude-0/-home-user-krator-master/683c3496-58e0-5d06-a802-49a02edbd47a/images/1.jpg` | red lacquer pavilion: gold mouldings, porthole windows, ribbed slate dome with lantern |
| `…/images/2.jpg` | thick tapering staged red towers with flared rings, clustered bulbous turrets |
| `…/images/3.jpg` | terraced hill town, round raised plazas with sunray inlays, arcades, stairs |
| `…/images/4.webp`, `…/images/5.webp` | **the main guide**: contact sheets of houses, shops, temples, fortress, citadel, plazas, gardens in red brick with gold domes and marble |
| `…/images/6.jpg`, `7.jpg`, `8.jpg` | Tudor ornamental brick chimney shafts |

The quality bar: every building must be **recognisably its type at a glance**, have a **distinct silhouette** from its neighbours, **depth in its façades** (projecting balconies, recessed loggias, stepped cornices, porches; never windows painted flat on a box), and **marble trim** everywhere the brief says. Nothing floats, nothing is sunk, stairs reach their landings, doors are 2.1–2.6 m tall for houses (larger for civic gates). A person is 1.75 m.

## 2. How the code works

- `python3 build.py` concatenates `src/*` and then `targets/kit/*` **in filename order** into one `<script>`. **Every top-level name is a global**, and `build.py` fails on a duplicate. Prefix every top-level name in your fragment with **your family prefix** (below).
- Every builder is `function buildJjXxx(jjG,jjO){reseed(N+(jjO.v|0)); …}`, and **`reseed` must be the first statement** (`build.py` checks). Use `rng()` / `rr(a,b)` after reseed if you need randomness. Never use `Math.random()`.
- **Local frame:** the origin is the plot centre on the ground, **+z is the front** (entrance), x is to the right as you face the building from the front, and y is up. Never use world coordinates. The showcase turns every building so its front faces north (towards the camera presets).
- Register with `JJ.def({key, name, family, row, w, d, h, r, tags:{type:[...], wealth, lit}, views?, build})` at the foot of your fragment:
  - `w`, `d`, `h` are the honest footprint and height. The showcase spaces buildings by `w` and `d`, so a wrong `d` makes rows overlap.
  - `r` is the inspector radius, about half the larger of `w` and `d`.
  - `row` is one of `'Housing — poor'`, `'Housing — middle'`, `'Housing — rich'`, `'Shops'`, `'Hospitality'`, `'Civic'`, `'Temple'`, `'Palace and plaza'`, `'Military'`, `'Walls'`, `'Agriculture and storage'`. The page lays out the rows and generates the camera presets `'<name> — front'`, `'<name> — eye level'` and `'<row> — aerial'` for you.
  - `tags.type` uses only `civic`, `market/shop`, `tavern/inn`, `industry`, `farm`, `single-family dwelling`, `multi-family dwelling`, `infrastructure`, `religious`, `funerary`, `military`. `wealth` is `poor|middle|rich|civic`. `lit` is true only for rich and civic. `culture:'jimjam'` is added automatically.
  - `views` (optional) adds presets in your **local** frame: `{'Name':{cam:[x,y,z], tgt:[x,y,z], sky:{hour,day}}}`.
- Add inspector volumes for major parts with `jjReg(name, lx, lz, r, h, {extra tags})` in the local frame. One whole-building volume is added for you.

### Drawing helpers (`src/61-jj-helpers.js`; read it, it is dense)

**Coordinate conventions differ per helper. Get this right:**

| helper | y means |
|---|---|
| `jjBox(x,y,z,w,h,d,mat,tint,ry)` | **centre** of the box |
| `jjCylinder(x,y,z,r,h,mat,tint,radial)` | **centre**; radial 16 or 32 |
| `jjBeam([x,y,z],[x,y,z],r,mat)` | a rod between two points |
| `jjWall(x,y,z,w,h,d,ry,{band})` | **base**. Brick block; `band` adds yellow courses and a marble coping (+0.44 m) |
| `jjPlinth(x,y,z,w,h,d,ry,{mat,band})` | **base**. Podium with a cap |
| `jjStairs(x,y,z,w,run,rise,steps,ry,{mat})` | **base**. Lowest step at `z+run/2`, climbing towards −z (put it in front of a podium face, with its centre at `face+run/2`) |
| `jjColumn(x,y,z,r,h,{pattern})`, `jjBrickShaft(x,y,z,r,h,{pattern,section,cap,relief,base})` | **base**. Patterns: `spiral chevron diamond ogee fleur tracery plain`; caps: `corbel crenel star none` |
| `jjChimneyStack(x,y,z,{n,h,r,patterns,seed,ry})` | **base** (on the roof). A cluster of n ornamental shafts on one base under one crenellated cap; returns the top y |
| `jjArch(x,y,z,w,h,ry,{depth})` | **base**. A parabolic brick arch ring, centred in z on `z` |
| `jjArcade(x,y,z,n,bayW,h,ry,{depth,r})` | **base**. Columns, arches and an entablature |
| `jjDome(x,y,z,r,{kind:'gold'/'slate'/'terracotta', shape:'hemi'/'onion'/'ribbed'})` | **base** of the dome. Put a drum under it (`jjCylinder`) |
| `jjSpire(x,y,z,r,stages,{stageH,pattern,kind,terminal})` | **base**. A thick staged tower that ends in an onion dome |
| `jjTurret(x,y,z,r,h,{kind,shape,pattern})` | **base** |
| `jjPorthole(x,y,z,ry,r)` | **centre**. Faces +z (rotated by `ry`); pass the wall face as `z` |
| `jjWindow(x,y,z,w,h,ry,{shutter,lit})` | **centre**. Sits proud of the face at `z` |
| `jjDoor(x,y,z,w,h,ry,{mat})` | **base**, at face `z` |
| `jjCrenel(x,y,z,w,d,h)` | **base**. A crenellated parapet along x |
| `jjCornice(x,y,z,w,d,ry)` | **base**. Stepped brick and marble, about 1.4 m tall |
| `jjRoundPlaza(x,y,z,r,{raised,inlay})` | **base** |
| `jjAwning(x,y,z,ry,{w,d,drop,h})`, `jjBanner(x,y,z,ry,{w,h})` | culture sockets (cloth drawn by the culture pack) |
| `jjWithYaw(x,y,z,ry,()=>{…})` | everything drawn inside is rotated by `ry` about (x,y,z). Use it for side façades: `ry=Math.PI/2` turns +z into +x |

**Materials** (pass the key string): `brick` (red), `brickYellow`, `brickDeep`, `brickDark` (vitrified), `bandBrick` (red with yellow header courses), `ochre` (lime plaster), `marble`, `tile` (roof tile), `gold`, `domeGold`, `slate`, `terracotta` (dome scales), `dark` (voids, unlit glass), `glass`, `glow` (emissive, lit buildings only), `wood`, `iron`, `turquoise`, `cream`, `canvas`, `water`, `sunray`. Textures tile in metres on boxes and cylinders, so you never scale UVs. **Leave `tint` undefined** unless you want a subtle multiplier (for example `jjColor(0xffffff,.92)`); the textures carry their own colour.

**Performance:** prefer `jjBox`, `jjCylinder` and `jjBeam` (instanced). `jjArch`, `jjPorthole` and the `jjMesh` calls make real meshes, one draw call each, so don't put hundreds per building. Keep one building under **250 k triangles** (the palace may go to 600 k; say so).

If you need a helper that doesn't exist (a barrel vault, a chhatri pavilion, a jharokha oriel, a ribbed vault, a sail), **write it in your own fragment with your family prefix**. Do not edit `61-jj-helpers.js` or `60-jj-mat.js`. If a shared helper has a bug, work around it locally and report it.

## 3. Files, prefixes and seeds

| task | your fragment(s) | top-level prefix | seeds |
|---|---|---|---|
| Housing rework | `src/70-jj-housing.js` (rewrite) | `jjHouse…`, `buildJjHouse…` | 9110–9199 |
| Shops + culture pack | `src/71-jj-shops.js`, `src/62-jj-culture.js` | `jjShop…`, `jjCult…` | 9200–9299 |
| Hospitality + civic | `src/72-jj-hospitality.js`, `src/73-jj-civic.js` | `jjHosp…`, `jjCiv…` | 9300–9399 |
| Temple, palace, plaza | `src/74-jj-sacred.js`, `src/75-jj-palace.js` (+ the solstice probe, see your task) | `jjTemple…`, `jjPal…` | 9400–9499 |
| Military, walls, agriculture | `src/76-jj-military.js`, `src/77-jj-agri.js` | `jjMil…`, `jjWallKit…`, `jjAgri…` | 9500–9699 |

You may also add **furniture** (fountains, stalls, benches and so on) to `src/84-jj-furniture.js` only if your task says so; otherwise place existing furniture keys or leave a spot. **Plants are never part of a building.** Leave planting spots (an exported list of local points) and don't draw plants.

## 4. Build and verify (you can run all of this)

```
cd settlements/jimjam
python3 build.py                                   # must print "syntax OK"
python3 verify.py dist/jimjam-kit.html --assert --views "<Name> — front,<Name> — eye level" --out /tmp/jj-shots-<you>
python3 verify.py dist/jimjam-kit.html --cam=x,y,z,tx,ty,tz --cam-name close --out /tmp/jj-shots-<you>   # ad-hoc shot (world coords)
python3 verify.py dist/jimjam-kit.html --eval "()=>JSON.stringify(SITES.map(s=>[s.key,s.x|0,s.z|0]))"     # where things stand
```

- Software rendering is slow (20–60 s per shot) and **four other agents are rendering at the same time**, so keep each run to 2–6 views and use `timeout 900`. If a run dies with a null shader-info-log TypeError, re-run once (a SwiftShader flake).
- **Look at your screenshots** (Read the PNGs) at the front and at eye level for every building, and fix what you see. Proportion errors only show at eye level.
- `--assert` must pass: a clean error panel, `tagAudit`, `nanSweep`, budgets.
- Write shots to `/tmp/…`, never into the repo.

## 5. When you finish

- Commit **only your fragment files** (no `dist/`, no `build-manifest.json`, no `VENDOR.json`, no shots) to your worktree branch, with a clear message. Don't push.
- Report back: the files, every key you defined (key · name · w×d×h · triangles), what you looked at, what is still weak, and any shared-helper bugs you worked around.
