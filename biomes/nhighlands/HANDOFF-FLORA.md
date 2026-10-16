# Handoff: more canopy, moss and fern for the Northern Highlands

**For:** Gemini (or any agent new to this repository).
**From:** Claude, for the owner, 2026-10-15.
**Read this whole file before you change anything.** Every step says what to do, where, and how to check it. When
this file and your own judgement disagree, follow this file and say so in your report.

---

## 0. What you are making

The Northern Highlands (`biomes/nhighlands/`) is one page, `dist/nhighlands.html`: a 43 km² flank of old-growth
forest, temperate low down (the NW corner), montane in the middle, boreal high up (the SE corner), with a stream, a
tarn and a ruined tower. The owner wants **more canopy cover, more moss, more fern, and a few alien touches**, from
the fourteen new reference pictures in `refs/45-…` to `refs/58-…`.

You will add **six trees, one epiphyte pass and five floor plants**, all **additive**: nothing that exists is retuned,
thinned or moved.

| what | ref | kind | where | the point |
|---|---|---|---|---|
| Ghost alder | 45 | tree | wet flats low down | pale, lichen-mottled stands over grass |
| Shag maple | 47, 50 | tree (new habit) | temperate, wet | limbs in thick moss sleeves, curtains of moss: the mossiest thing on the map |
| Serpentwood | 48, 52 | tree (new habit) | temperate and old wood, mist | sinuous S-curved mossy trunks twisting round each other |
| Fan-leaf | 53, 54 | tree (data + a leaf card) | temperate glades' edges | ginkgo-like fan leaves, bright: an ancient, slightly alien green |
| Table cedar | 56 | tree (new habit) | montane, rocky spurs | flat tiers of foliage: wide emergent canopy |
| Veil banyan | 57 | tree (new habit) | temperate, low and wet, rare | one tree is a grove: huge spread, prop roots, hanging roots |
| Moss sleeves and staghorns | 46, 50, 58 | epiphyte pass over existing hero trees | temperate | moss collars on boles; antler-fronded staghorns on trunks |
| Crown ferns | 46, 52 | floor | temperate, gullies, banks | big upright vases of fronds |
| Fern sea | 46, 52 | floor | low temperate under closed canopy | dense sword-fern carpet |
| Moss hummocks | 50 | floor | low wet hollows, old wood | rolling moss mounds 1-4 m |
| Sun-wheels | 55 | floor (alien) | temperate, on moss | flat rosettes of perfect fractal leaf wheels |
| Spore lamps | 50 | floor (alien, glows) | on the hummocks | tiny gold-green sporophyte pins that glow at night |

Ref 49 (Wistman's Wood) and ref 51 (dark spurge) are already in the kit (the gnarled oak, the dark spurge): use them
only to judge the mood. The owner's alien collage is already `refs/25-alienflora.jpg` (the great trumpet, lace fern,
bell-bulbs, red-stem fans and disc stalks came from it); keep new alien touches in its spirit: **mostly Earth, now and
then something that is not.**

---

## 1. Hard rules (break one and the work is rejected)

1. **Work in your own git worktree from `origin/main`**, never in `C:\Users\travi\Documents\krator-master` (its `main`
   is stale and another agent has uncommitted work there). Section 2 has the commands.
2. **Edit only:** `biomes/nhighlands/src/50-biome-nhighlands-species.js`, `55-biome-nhighlands-trees.js`,
   `60-biome-nhighlands-floor.js`, `70-biome-nhighlands.js`, `99-host-take.js`, and the docs `BIOME-API.md`,
   `KNOWN_ISSUES.md`, `INDEX.md` (regenerated, never by hand). Not `core/`, not other biomes, not `tools/`, not `dist/`
   by hand, not `materials.json` or `tex/` (see section 11).
3. **Never open, read or grep:** `dist/`, `three.min.js`, `*.zip`, `shots/`, `archive/`, `godot/data/`, `host/`, the
   library images in `core/materials/`. Search `biomes/nhighlands/src` only.
4. **Never read a fragment over ~30 KB whole.** `50-…` (51 KB) and `55-…` (45 KB) are. Find sections with
   `grep -n "^// ------" <file>` and read the range you need. Section 3 gives the line numbers.
5. **Targeted edits only.** Never rewrite a fragment.
6. **Never put a `//` comment in the middle of a line.** These fragments pack many statements on a line; a `//` there
   silently comments out the rest. Use `/* … */` unless the comment is on its own line.
7. **Append, never insert.** New species at the **end** of `NHL.SPECIES`. New tree passes at the **end** of
   `NHL.buildTrees`'s passes, after a `reseed` of their own (section 5). New floor plants in **new functions on their own
   seeds**, never inside the existing planters (`plantTemperate` etc. pick by `rng()` thresholds: a new branch there
   reshuffles the whole floor).
8. **Do not change any existing builder's output.** You may add a new habit (a new `B.<name>`). You may add an
   optional field that only new species carry (like `farShape`, section 6.4). Never change an existing default.
9. **`60-…` and `70-…` are tagged `[G data]`** (they will be ported to Godot): no `THREE`, `T3`, `document`, `window`,
   canvas or geometry constructors there. Geometry, materials, canvas textures and `BIO.def` go in `50-…`. The build
   runs a lint (`tools/check_port.py`) and fails if you break this.
10. **No `Math.random()`.** Use the kit's `rr(a,b)`, `ri(a,b)`, `pick(arr)`, `rng()`. The build must be deterministic.
11. **Do not generate, download or invent texture images.** Paint small canvas textures in code, like the kit already
    does (section 8.1). List what wants a real texture (section 11).
12. **Budgets** (`BUDGET.showcase` in `99-host-take.js`): 32 M triangles held (now ~24.4 M), **520 draw calls** at a
    camera (now ~330-380 at the stream views), **15 M triangles drawn** at a camera (now ~12-12.7 M). Draw calls are the
    tightest: **every new instanced item type costs about one draw call per chunk in range.** Add at most **five** new
    item types in total (the plan below uses five); reuse existing items everywhere else. If a phase breaks a budget,
    make your own plant cheaper; never thin an existing one. If you cannot, stop and report.
13. **Do not push, merge, publish the gallery, or rewrite `PORT-BASELINE.json` or `baseline.json`.** Commit on your branch.
14. **Unsure? Stop and write the question in your report.**

---

## 2. Setup (once)

Windows 11; bash commands (Git Bash). `python` is Python 3; Node is on `PATH` (the build's syntax check uses it).

```bash
cd /c/Users/travi/Documents/krator-master
git fetch origin
git worktree add ../krator-nhl-flora -b gemini/nhighlands-flora origin/main
cd ../krator-nhl-flora
git lfs pull --include="biomes/nhighlands/tex/*"
```

This file is `biomes/nhighlands/HANDOFF-FLORA.md`; the pictures are already in `biomes/nhighlands/refs/` (45-58).

Build once **before changing anything**, and record the "before" state:

```bash
cd biomes/nhighlands
python build.py
python verify.py dist/nhighlands.html --assert --save-baseline ../../../nhl-before.json --out ../../../nhl-shots/before
```

The build prints `built dist/nhighlands.html (…) syntax OK`. The verify takes **several minutes** (software WebGL):
run it in the background and wait. If either fails before you change anything, stop: the checkout is wrong.
Playwright: if `python -c "import playwright"` fails, `pip install playwright` then `python -m playwright install chromium`.

---

## 3. Read these, in this order

1. `CLAUDE.md` at the repository root (skim).
2. `biomes/nhighlands/BIOME-API.md` (all of it: the zones table and "What the biome exports").
3. `biomes/nhighlands/KNOWN_ISSUES.md` (skim; the budget and draw-call items matter).
4. `biomes/nhighlands/BRIEF.md` section 1 ("The place": the mood, the palette, the alien rule). The palette rule:
   **green everywhere; dark blues and purples only in the understorey, ≤15% of the floor, never in the canopy.**
5. The pictures `refs/45-…` to `refs/58-…`, and `refs/25-alienflora.jpg`.
6. The code, **by section** (line numbers as of `origin/main` 827fae40):

| file | lines | what to learn |
|---|---|---|
| `50-…species.js` | 24-69 | `PAL`: palettes |
| | 70-138 | `NHL.SPECIES`: habit, H, rb, crownR, `bk` (bark kind 0-7: plated, fibrous, smooth, birch, furrowed, trumpet, pine, charred), bark/leaf colours, `item` (foliage card), `form` (the habit's knobs), `tags:TG(climate,aridity,riparian,HV(wood,edible,medicinal,notes,fruit))` |
| | 139-170 | `NHL.PLANTS`: the floor plants for the inspector, **keyed by their item's label** |
| | 182-290 | leaf and frond textures (`BIO.alphaTex(size,(g,S)=>{…})`, greyscale, tinted per instance) |
| | 327-390 | `G.*` geometry makers (`G.cushion`, `G.card`, `G.flat`, `G.tuft`…) |
| | 394-445 | materials `M.*` (`BIO.leafMat(tex,key,{…})`; the glow materials `M.bulb`, `M.pod`) |
| | 446-449 | `NHL.setNight` (sets each glow material by name: **a new glow material must be added here**) |
| | 467-end | `BIO.def(...)`: every instanced item, with its label |
| `55-…trees.js` | 28-42 | `zones(x,z)`: temperate, montane, boreal, alpine, rip (banks), glade, oldwood, crag, burn, dark, low, mist, wet, rock |
| | 64-75 | `treeGrow`, `arc` |
| | 81-112 | helpers: `clumpAt` (a foliage clump), `sprayAt`, `drape` (hanging moss), `glowCluster`, `mossOn` (a moss mat on a limb) |
| | 113-130 | `bole`, `limb`, `limbOk`, `reg` |
| | 183-208 | **`B.broad`: copy its structure** |
| | 211-232 | **`B.gnarl`: the model for the new twisting habits** |
| | 352-382 | impostors: `HABIT(S)` (354) and `buildFar` |
| | 383-end | `NHL.buildTrees`: `pass(key,cell,accept,opt)`, the passes, the build loop (each tree builds from **its own seed**) |
| `60-…floor.js` | 1-26 | helpers (`Y`, `okGround`, `leafCol`) |
| | 27-90 | the small-plant drawers (`swordFern`, `ladyFern`, `mossMat`, `mossCushion`, `boulder`…): **reuse them** |
| | 171-200 | `NHL.buildFloor`: the LOD bands (`bands=[[5.6,320,0],[13,900,320]]`), `nearest` origin, the stepping stones (a depth window) |
| `70-biome-nhighlands.js` | all (2 KB) | `NHL.build`: trees, then floor |
| `99-host-take.js` | 8-66 | preset views (`VIEWS`, `add(name,[cx,cy,cz,tx,ty,tz])`, and the "trees found in the scene" helpers) |
| | 71-128 | `BUDGET`, `biomeChecks` (every species placed; floor items not in water: the `FLOOR` list), `FRUIT_NOT_DRAWN`, `HCHK`, `hostChecks`, `hostNegatives` |

---

## 4. How the kit works (the minimum)

```
host fields (cold, wet, flow, mist, rock, upland) -> NHL.zones(x,z) -> tree passes (55) -> builders B[habit] (55)
                                                                  -> floor bands and planters (60)
instanced items (BIO.def in 50) are what builders and planters place: BIO.put / BIO.beam; bark is BIO.lathe / BIO.tube
```

- **A tree pass:** `pass(key, cell, Z=>accept, opt)`: one candidate per `cell`-metre cell, kept with probability
  `accept(Z)`. `opt`: `pad` (keep-clear radius), `own` (radius it reserves), `patch`/`patchScale` (clumping), `hero`/`mid`
  (distances for level 2/1), `far:true` (beyond `mid` it becomes an impostor; without it, nothing), `lodK` (thin with
  distance from the spine), `mod(T,Z)` (adjust the tree record). Two presets exist: `BIG` (far impostors, thins with
  distance) and `SMALL`; use `o(BIG,{…})` like the other passes.
- **A builder:** `B.<habit>=function(T,st,lv){…}`. `T={x,z,y0,sp,H,rb,crownR,seed,wet,cold,lv}`. `lv` 2 near, 1 mid.
  It must end with `T.spread=<radius>;reg(S,T);`.
- **Each tree builds from its own seed** (the build loop reseeds per tree), so a tree's shape never depends on another.
  Positions do depend on pass order: that is why new passes go last.
- **Zones are already masked**; build every acceptance from zones, never from raw fields.
- **Floor:** near band (lv 2, 5.6 m cells, to 320 m from each spine origin), mid band (lv 1, 13 m cells, 320-900 m),
  far floor (lv 0, 30 m cells, past 950 m, only a few cheap items). `BIO.range` sets how far a placed item is drawn.

---

## 5. Where new code goes (the skeleton; do this first, P0)

**Trees.** In `NHL.buildTrees`, after the last pass (`pass('rowan',…)`) and before the `// build` comment:

```js
 // THE NEW FLORA (HANDOFF-FLORA.md), on its own stream after every other pass: nothing placed above moves
 reseed(550091);
```

New `pass(...)` lines go after it, one per phase.

**Epiphytes and floor.** In `60-…`, a new section at the end of the fragment, inside its closing `})();`:

```js
// ---------------------------------------------------------------- the new flora (HANDOFF-FLORA.md)
// Epiphytes on the hero trees, then the new floor plants: each on its own seed, after the floor, so nothing above moves
NHL.buildNewFlora=function(R,q,box){q=q==null?1:q;R=R||3300;means();
 const st={sleeves:0,staghorns:0,crownferns:0,fernsea:0,hummocks:0,wheels:0,lamps:0};
 return{newflora:st};};
```

In `70-…`, after the floor line:

```js
 if(NHL.buildNewFlora){BIO.cur='nhighlands/floor';Object.assign(out,NHL.buildNewFlora(R,q,opt.box));}
```

Build and verify: every number in the verify output must equal the "before" baseline (`--baseline ../../../nhl-before.json`
prints the deltas; there must be none). Commit P0.

---

## 6. The trees (new `NHL.SPECIES` entries 25-30)

All `tags:TG('temperate','humid',riparian,HV(…))`. Give each `edible:[]` unless stated; if you list an edible part,
add the key to `FRUIT_NOT_DRAWN` in `99-host-take.js`, or the fruit check fails.

#### 25 `ghostalder`: **Ghost alder** (ref 45) — data only, habit `broad`

Tall, slender, leaning, often two or three stems; **pale grey bark heavily mottled with white lichen and with moss on
the lower side**; a light high canopy; stands thick on wet flats with a grass floor.

```js
/*25*/{key:'ghostalder',name:'Ghost alder',habit:'broad',H:[16,26],rb:[.2,.36],crownR:[4,6],bk:3,bark:[0xc8c8c0,0xb8bab2,0xd8d8d0],leaf:PAL.broad.map(c=>C(c).lerp(C(0x9aba5a),.25).getHex()),item:'broad',
 form:{hB:.55,boughs:[3,5],el:[.85,1.25],L:[.55,.8],wig:.1,curve:-.03,moss:.9,drape:.25,bulbs:.05,clump:[2.4,3.4],stems:[1,3]},
 tags:TG('temperate','humid','yes',HV('fuel',[],true,'Grows where nothing else will stand the wet; the lichen on it is a wound dressing.'))},
```

Pass: `pass('ghostalder',16,Z=>Z.temperate*Z.low*smooth(.55,.8,Z.wet)*(1-Z.oldwood)*.55+Z.rip*Z.low*.25,o(BIG,{pad:1.6,own:1,patch:.3,patchScale:.012}));`
(`bk:3` is the birch bark texture; the grey-white tint and the moss make it an alder, not a birch.)

#### 26 `shagmaple`: **Shag maple** (refs 47, 50) — new habit `shag`

A short massive trunk that splits low into many thick limbs **spreading up and out**, every limb wearing a **thick
sleeve of moss** (much fatter than the limb), with curtains of moss hanging from the undersides. Very little leaf: the
moss *is* its crown. Alien touch: the sleeves are its own symbiont, so they are thicker and brighter than any Earth moss.

- `H:[14,24], rb:[1.0,1.6], crownR:[10,15], bk:4, bark:[0x4a4438,0x403a30,0x56503e], leaf:PAL.broad, item:'maple'`,
  `farShape:'dome'`, tags riparian `'both'`, `HV('fuel',[],false,'The moss is gathered for bedding and caulking; it grows back in a season.')`.
- **Builder `B.shag`** (copy `B.broad`'s first half, then):
  1. Bole: `bole(T,S,H*.22,u=>T.rb*(1-.5*u)*(1+.5*Math.exp(-u*H/2)),{vs:4,buttress:.5,bh:1.4,nb:5,moss:1,seg:lv===2?10:7})`.
  2. Limbs: `lv===2?ri(6,10):4`, each a `treeGrow` from the bole top, elevation `rr(.5,1.1)`, length `T.crownR*rr(.7,1.05)`,
     `curve:-.05`, `wig:.2`; each limb forks once (as `B.broad` does) at point 3.
  3. **Sleeves**: for each limb polyline `pts`, draw a second tube over it in the moss bucket:
     `st.limb+=BIO.tube('nmoss',pts.map(p=>({x:p.x,y:p.y+p.r*.25,z:p.z,r:p.r*rr(1.6,2.1)+.06})),bright(vary(pick(PAL.moss),.03,.08,.05),1.05),{seg:lv===2?7:4,cap:true});`
     You need a moss bucket: in `50-…`, after the line `BIO.bucket('nwood',…)` (≈463), add
     `BIO.bucket('nmoss',BIO.barkMat(NHL.MOSSTEX),{label:'Moss sleeves',uvScale:[2,2]});` (a bark-style material on
     the moss texture, so the vertex colours tint it like the barks). Count it as one of your five new kinds: it adds
     draw calls too.
  4. Curtains (hero only): along each limb, `drape(p.x,p.y-p.r*1.6,p.z,rr(2,6),false)` at 3-6 points.
  5. A few leaf clumps at the limb tips (`clumpAt(S.item,…)`, size 2-3), about half what `B.broad` puts.
  6. `T.spread=T.crownR;reg(S,T);`
- Pass: `pass('shagmaple',46,Z=>Z.temperate*(.12+.3*Z.mist+.2*Z.rip)*smooth(.5,.8,Z.wet)*(1-Z.oldwood*.5),o(BIG,{pad:4,own:4,patch:.4}));`

#### 27 `serpentwood`: **Serpentwood** (refs 48, 52) — new habit `serpent`

Two to five trunks rising from one foot in **sinuous S-curves**, twisting round each other, bark entirely mossed,
forking high into fine twisting limbs; a small high canopy. The misty laurisilva. Alien touch: the trunks of one tree
**braid** (each wraps half a turn round the others).

- `H:[10,22], rb:[.25,.45], crownR:[5,8], bk:4, bark:[0x4a5034,0x3e4430,0x566040], leaf:PAL.laurel, item:'small'`,
  `farShape:'low'`, tags riparian `'both'`, `HV('fuel',[],true,'The twisted wood is prized for bows and handles.')`.
- **Builder `B.serpent`** (start from `B.gnarl`):
  1. For each of `ri(2,5)` stems: 9 points; point `i` at `t=i/8`: angle round the foot `a0+s*TAU/ns+t*rr(1.2,2.4)` (the
     braid), offset `rb*1.2*(1-.4*t)` from the axis, plus an S-wave sideways `Math.sin(t*Math.PI*2+s)*H*.08`; height
     `T.y0-.3+H*.75*t`; radius `rb*(1-.5*t)`. Draw with `limb(S,pts,st,{seg:lv===2?8:5,flutes:3,fluteA:.1,twist:.8,col:mossy(S,T,s,1)})`.
  2. Moss mats on every second point (`mossOn`), hero only.
  3. At each stem's top, 2-4 twisting limbs (`treeGrow`, `wig:.5`, elevation .4-1.0) and leaf clumps at their tips, as in
     `B.gnarl`.
  4. `T.spread=T.crownR;reg(S,T);`
- Pass: `pass('serpentwood',24,Z=>(Z.temperate*Z.mist*.3+Z.oldwood*.2)*(1-Z.rip*.5),o(SMALL,{far:true,pad:2,own:1.5,patch:.45}));`

#### 28 `fanleaf`: **Fan-leaf** (refs 53, 54) — data only, habit `broad`, **plus a new leaf card** (new item 1 of 5)

A ginkgo-like tree: a straight grey-brown trunk with moss low down, sparse ascending branches, and **fan-shaped,
notched leaves**, bright yellow-green, in loose sprays. The brightest canopy green in the forest: an old, faintly alien
tree among the familiar ones.

- Texture `TX.fan` in the leaf textures section (section 8.1 shows how): 512 canvas, ~40 fan leaves, each a wedge
  (a 70-100° sector) on a thin stalk, with a notch in the middle of its rim and radial veins drawn a little darker.
- Material `fan:BIO.leafMat(TX.fan,'nh-fan',{aN:true,swayW:'1.0',swayA:.12})` in `M`.
- Item `BIO.def('fan',BIO.geo.clump(),M.fan,{attrs:['aN'],label:'Fan-leaf leaves'})`.
- Species: `H:[22,34], rb:[.5,.9], crownR:[6,9], bk:0, bark:[0x6a6058,0x5e564e,0x76706a], leaf:[0x9ac83a,0xa8d040,0x8ab830,0xb4d84a], item:'fan'`,
  `form:{hB:.3,boughs:[6,9],el:[.75,1.15],L:[.6,.9],wig:.08,curve:-.03,moss:.5,drape:.1,bulbs:0,clump:[2.6,3.8]}`,
  tags riparian `'no'`, `HV('timber',['nuts (roasted)'],true,'The fruit stinks; the roasted nut inside is eaten in small numbers. The leaves for the memory.')`
  (then add `'fanleaf'` to `FRUIT_NOT_DRAWN`).
- Pass: `pass('fanleaf',60,Z=>(Z.temperate*(.05+.25*Z.glade)+Z.montane*.04)*(1-Z.rip),o(BIG,{pad:3,own:2,patch:.5}));`

#### 29 `tablecedar`: **Table cedar** (ref 56) — new habit `table`

An emergent with a massive short trunk that splits into a few heavy ascending limbs, carrying **flat horizontal tiers
of dense foliage** stacked like plates, the top flattish. It covers ground: one tree's tiers shade a 30-40 m disc.

- `H:[24,38], rb:[1.2,2.0], crownR:[12,18], bk:1, bark:[0x5a4a3a,0x4e4034,0x665446], leaf:PAL.conifer.map(c=>C(c).lerp(C(0x3a5a3a),.3).getHex()), item:'needle'`,
  `farShape:'umbrella'`, tags climate `'temperate'`, aridity `'subhumid'`, riparian `'no'`, `HV('timber',[],true,'Fragrant rot-proof timber for halls; the resin burnt as incense.')`.
- **Builder `B.table`**:
  1. Bole to `H*.3` (`bole`, buttress .4, `moss:.4`).
  2. 3-5 heavy limbs (`treeGrow`, elevation .7-1.1, length `H*.5`), drawn with `limb`.
  3. **Tiers:** along each limb at 3-5 heights, a flat pad: place 6-14 `needle` clumps (`clumpAt`) in a disc of radius
     `crownR*rr(.35,.6)` at that height with `flat` = .28 (the 6th argument of `clumpAt(item,x,y,z,size,flat,col,…)`; the other habits use .55-.58).
     Each pad a little darker underneath: one more ring of clumps 0.6 m lower with `shade(hc,-.15)`.
  4. Lv 1: 2 tiers a limb, 5 clumps each.
  5. `T.spread=T.crownR;reg(S,T);`
- Pass: `pass('tablecedar',90,Z=>(Z.montane*.22+Z.temperate*.06)*(.3+.7*smooth(.2,.5,Z.rock))*(1-Z.rip)*(1-Z.alpine),o(BIG,{pad:7,own:7,patch:.3}));`

#### 30 `banyan`: **Veil banyan** (ref 57) — new habit `banyan`

Rare and huge: a cluster of fused trunks (a column of strands), from which **long limbs reach out almost level, 20-35
m**, sagging and lifting again; from the limbs **prop roots drop straight to the ground** and thicken into pillars, and
thin hanging roots fringe the limbs. The crown is a vast low dome. Alien touch: its hanging roots end in small pale
bell-bulbs that glow at night (reuse `glowCluster`, it already glows).

- `H:[22,34], rb:[2.2,3.4], crownR:[22,35], bk:2, bark:[0x8a8a7a,0x7e7e70,0x969686], leaf:PAL.broad, item:'broad'`,
  `farShape:'dome'`, tags riparian `'both'`, `HV('none',['figs (small, in autumn)'],false,'One tree shelters a village. Where a prop root touches the ground it becomes a trunk.')`
  (and add `'banyan'` to `FRUIT_NOT_DRAWN`).
- **Builder `B.banyan`**:
  1. The trunk: 8-14 thin strands (`limb`, radius `rb*.3`) rising round the axis from the ground to `H*.45`, twisting
     gently, plus one core `bole`.
  2. Limbs: `lv===2?ri(8,12):5`, each a polyline of 8 points from the trunk top, nearly level (elevation .05-.25),
     length `crownR*rr(.7,1)`, with a sag: `curve:-.06`, and a lift at the end (raise the last two points by 1-3 m).
  3. **Prop roots** (hero and mid): at 2-4 points along each limb, a straight `BIO.beam('rod',[p.x,p.y,p.z],[p.x,Y(p.x,p.z)-.3,p.z],r,r*1.3,col)`
     with `r` .15-.45 m (thicker nearer the trunk). `Y` here is `BIO.terrainH`. The **inspector and the keep-clear**
     only know the tree's centre: register `T.spread=T.crownR` and pass `own:T.crownR*.6` in the pass so nothing grows
     through the roots.
  4. Hanging roots (hero): 10-20 `BIO.beam('rod',…)` from the limbs straight down 2-8 m, radius .02-.05; one in five
     ends in a `glowCluster(x,y,z,ri(2,4),st)`.
  5. Leaf clumps along the outer half of each limb (`clumpAt`, size 3.5-5), a dense low dome.
  6. `T.spread=T.crownR;reg(S,T);`
- Pass (rare: aim for 4-12 on the map): `pass('banyan',260,Z=>Z.temperate*Z.low*smooth(.5,.75,Z.wet)*(1-Z.oldwood)*(1-Z.rip)*.35,o(BIG,{hero:420,mid:820,pad:16,own:18,patch:0}));`

### 6.4 The impostor shape (`farShape`)

`HABIT(S)` (55, line ≈354) picks the far blob from the habit. New habits would fall through to the default dome. Make
`HABIT` read an optional field first, so only the new species change:

```js
HABIT=S=>S.farShape||(S.habit==='conifer'? … the existing expression unchanged … );
```

Wrap the whole existing expression in parentheses; do not alter it. The shapes: `'dome'`, `'low'`, `'umbrella'`,
`'tall'`, `'cone'`, `'spire'`, `'lump'`, `'cup'`, `'cups'`, `'snag'`.

---

## 7. The epiphytes and the floor (in `NHL.buildNewFlora`)

Each block begins with its **own** `reseed(<seed>)` (use 610031, 610032, … one per block, in order) so that adding a
later block never moves an earlier one. Set `BIO.range` the way `buildFloor` does (`NHL.LOD.floor` for small things,
`NHL.LOD.tree` for things on trees) and reset it to `null` at the end.

#### 7.1 Moss sleeves and staghorns (refs 46, 50, 58): on existing hero trees (new item 2 of 5: `staghorn`)

Walk `NHL.TREES`. For each tree with `T.lv===2`, whose species key is one of `greatspruce, cathedralcedar,
shadowhemlock, silverfir, forestlime, bluebeech, mossmaple, mountainmaple` (straight boles), and where
`zones(T.x,T.z).temperate>.5`:

- **Moss collars** (probability `.55*T.wet`): 2-5 rings on the lower 35% of the bole: at height `h`, `BIO.put('cushion',[T.x,T.y0+h,T.z],qEuler(0,rr(0,TAU),0),[R,rr(.5,1.1),R],bright(vary(pick(PAL.moss),.03,.08,.05),1.0))`
  with `R=T.rb*(1-.4*h/T.H)*rr(1.12,1.3)`. The cushion is a dome; check in the screenshot that it reads as a fat moss
  collar and not as a floating cap. If it floats (the bole leans or is fluted more than the ring), push `R` up, or drop
  the collar for that species and say so.
- **Staghorns** (probability `.18`, only broadleaves `forestlime, bluebeech, mossmaple, mountainmaple`): 1-3 per tree
  at 2-9 m, on the bole's surface: angle `a`, position `[T.x+Math.cos(a)*r, T.y0+h, T.z+Math.sin(a)*r]` with
  `r=T.rb*(1-.4*h/T.H)`, facing outward (`qEuler(0,-a,0)`).
  The item `staghorn` (in `50-…`): a **round shield card** (pale green, flat against the trunk) plus 5-9 **forked
  antler fronds** drooping out and down. Make the fronds a canvas texture `TX.staghorn` (each frond a strap that forks
  2-3 times into rounded tips, mid green `0x7aa040` edges lighter) on `BIO.geo.frond(3)`, and put the shield as a second
  `BIO.put('paddle',…)` (the teal aroid's card, tinted pale green `0xa8c070`, scaled flat: reuse, no new item).
  Add `{label:'Staghorns',…}` to `NHL.PLANTS` with tags.
- **Range:** `BIO.range=NHL.LOD.tree` while placing these (they belong to the trees), then back.

#### 7.2 Crown ferns (refs 46, 52): reuse `lady`

Vases of 8-14 upright fronds, 1-2 m: `ladyFern`-like but each frond placed with `BIO.put('lady',[x,y,z],qEuler(-rr(.25,.5),a,0)…)`
round a centre (look at `ladyFern` in `60-…` and copy its put, steeper). Near band and mid band (lv 2 and 1),
temperate and montane gullies and banks: weight `Z.rip*.5+Z.temperate*Z.mist*.25+Z.temperate*.06`. Use the floor's band
loop (copy the `bands.forEach…` block of `buildFloor`, with your own weight function). No new item. Add a
`NHL.PLANTS` entry only if the label differs (it does not: it is `'Lady ferns'`, so no new entry).

#### 7.3 Fern sea (refs 46, 52): reuse `frond` (`swordFern`)

Where the canopy is closed low down, a carpet of sword ferns: weight `Z.temperate*Z.low*(1-Z.glade)*(1-Z.rip)*smooth(.5,.8,Z.wet)`,
near band only, cell 3 m, two `swordFern(x,y,z,lv,rr(.9,1.3))` per accepted cell. **This is the triangle hog**: measure
it; if the drawn-triangle budget (15 M at a camera) goes over, raise the cell to 4 m. No new item.

#### 7.4 Moss hummocks (ref 50): reuse `cushion` and `mossmat`

Rolling mounds 1-4 m across, 0.4-1.5 m high, in groups of 3-9 that touch: weight `(Z.temperate*Z.low*Z.mist*.6+Z.oldwood*.3)*smooth(.55,.8,Z.wet)*(1-Z.rip)`,
near and mid bands, cell 8 m. Each mound: `mossCushion` at the larger sizes (look at it; scale up), plus a `mossMat`
apron round it. No new item.

#### 7.5 Sun-wheels (ref 55): new item 3 of 5 `wheel` — alien

A flat rosette 0.3-0.8 m across: a central bud and 20-40 stalks radiating flat, **each ending in a perfect wheel of
10-14 narrow leaflets**, bright yellow-green, the wheels nested by size toward the centre. Alien: too regular for Earth.

- Texture `TX.wheel` (512 canvas): draw it top-down as one whole rosette: radial stalks, and at each stalk's end a wheel
  of thin pointed leaflets (lines from a point outward, 12 of them, length ~4% of the canvas), the wheels smaller toward
  the centre; a tight bud in the middle.
- Material `wheel:BIO.leafMat(TX.wheel,'nh-wheel',{swayW:'1.0',swayA:.01,alphaTest:.4})`; item
  `BIO.def('wheel',G.flat(),M.wheel,{label:'Sun-wheels'})` (`G.flat` is the flat card the wood sorrel uses).
- Placement: on moss under the canopy: weight `Z.temperate*(1-Z.glade)*(1-Z.rip)*.04`, near band only, groups of 1-4
  within 1.5 m. Put each one flat on the ground: `BIO.put('wheel',[x,y+.02,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),rr(.3,.8),leafCol([0xa8d048,0x9ac040,0xb4d850],1,.02))`.
- `NHL.PLANTS`: `{label:'Sun-wheels',name:'Sun-wheel',tags:TG('temperate','humid','no',HV('none',[],false,'Alien: a rosette of perfect leaf wheels; it turns to follow the light through the day.'))}`.

#### 7.6 Spore lamps (ref 50): new item 4 of 5 `sporepin` + new glow material — alien, glows

Clusters of 10-40 tiny pins (2-6 cm tall, a hair-thin stalk and a round head) on the moss hummocks and the moss
sleeves' tops, gold-green, **glowing softly at night**.

- Geometry: a small merged pin (copy `G.mushroom`'s approach, or a rod plus a tiny sphere; under 30 triangles).
- Material: `spore:new T3.MeshLambertMaterial({color:0xffffff,vertexColors:true,emissive:0xc8ff60,emissiveIntensity:.04})`
  in `M`. **Add it to `NHL.setNight`**: `M.spore.emissiveIntensity=lerp(.04,1.2,k);`.
- Item: `BIO.def('sporepin',<geometry>,M.spore,{label:'Spore lamps'})`.
- Placement: on top of each hummock from 7.4 (hero band only), 40% of them: 10-40 pins within the mound's radius, at its
  surface height (approximate: `y + mound height * (1 - (d/R)^2)`).
- `NHL.PLANTS`: `{label:'Spore lamps',name:'Spore lamp moss',tags:TG('temperate','humid','both',HV('none',[],false,'Alien: the moss\'s sporophytes glow at night; a lamp-moss hollow lights a path.'))}`.

That is four new instanced items (`fan`, `staghorn`, `wheel`, `sporepin`) and one bucket (`nmoss`): five.

---

## 8. Drawing recipes and gotchas

### 8.1 A leaf texture

Copy any `TX.*=BIO.alphaTex(512,(g,S)=>{…},[r,g,b])` in the leaf-texture section. It paints **greyscale on
transparency**; the instance colour tints it, so paint values (light midrib, darker edges), not colour. `S` is the
canvas size. `BIO.tex.clusters(S,n,spread)` scatters `n` cluster centres into `BIO.tex.cl` (see `TX.maple`). The last
argument is the mean grey the kit measures for tinting; copy a similar texture's.

### 8.2 Things that will bite

- `BIO.put(item,[x,y,z],quaternion,scale,colour,opts)`: `scale` a number or `[sx,sy,sz]`; `colour` a `THREE.Color`
  (in 55 and 60 use the kit's `vary`, `bright`, `shade`, `pick(PAL.x)`) or `null`.
- `qEuler(x,y,z)`; Y is up. `T.y0` is the ground under the tree (already sunk 0.4 m).
- Always make `lv===1` much cheaper than `lv===2` (fewer limbs, no curtains, no roots, fewer clumps).
- A tree builder's `st` counters: add `BIO.tube`'s return to `st.limb`; count clumps with `st.clumps++`.
- `limbOk(pts,pad)` rejects a limb that would pass through another tree; keep using it for long limbs (the banyan's,
  the table cedar's) and accept that some limbs are skipped.
- The `nothing-rooted-in-the-water` check samples the floor items named in `biomeChecks`' `FLOOR` list; add `'wheel'`
  and `'sporepin'` to it.
- The `every-species-placed` check fails if any species has zero trees. The banyan is rare: if it never lands, raise
  its weight a little, do not fake its placement.
- New glow must reach the night through `NHL.setNight`; the `night-raises-the-glow` assert only looks at bulbs and pods,
  so check the spore lamps in the night screenshot yourself.
- The palette rule: no purple or blue in the canopy. Everything new here is green, grey, white or brown.

---

## 9. Phases (one commit each; do not start the next with a failing check)

| phase | what |
|---|---|
| **P0** | the skeleton (section 5), `farShape` in `HABIT` (6.4). Prove nothing changed (the baseline deltas are zero) |
| **P1** | `ghostalder`, `fanleaf` (data species; the fan-leaf texture and item) |
| **P2** | `serpentwood` (habit `serpent`) |
| **P3** | `shagmaple` (habit `shag`, the `nmoss` bucket) |
| **P4** | `tablecedar` (habit `table`) |
| **P5** | `banyan` (habit `banyan`) |
| **P6** | crown ferns, fern sea, moss hummocks (floor, reused items) |
| **P7** | moss collars and staghorns (epiphytes) |
| **P8** | sun-wheels, spore lamps (alien floor, the glow) |
| **P9** | docs, the texture list, the report |

If you run short of time, stop at the end of a phase with everything committed and passing.

---

## 10. Build, verify, look (every phase)

```bash
cd biomes/nhighlands
python build.py
python verify.py dist/nhighlands.html --assert --baseline ../../../nhl-before.json --out ../../../nhl-shots/pN
```

- Exit code 0: no page errors, every assert `ok` (including the budgets and the negative controls).
- The baseline delta shows what moved. From P1 on, the new species' counts and the triangle and call totals grow; the
  **existing species' counts must not change** (`every-species-placed` prints `key:count` for each). If an existing count
  changes, a pass went in the wrong place.
- SwiftShader flakes about one run in seven with a `null shader-info-log TypeError`; re-run once before believing it.
- Shader errors are silent (a mesh just vanishes): if a new plant does not show, look for `THREE.WebGLProgram` in the
  console lines the verify prints.
- Screenshots go to `../../../nhl-shots/` (outside the worktree, so they can never be committed).

**Preset views.** Add one per new tree to `VIEWS` in `99-host-take.js`, after the existing ones, using the "trees found
in the scene" helpers there (read lines 30-66 first: they find a tree of a species with a clear line of sight). Name
them plainly (`'A veil banyan'`, `'Serpentwood in the mist'`, `'Moss hummocks'`). One night view of the spore lamps
(`add(name,[…],'night')`). The verify screenshots every view.

**Live look (faster, with the GPU):** `python -m http.server 8841 --directory dist`, open
`http://localhost:8841/nhighlands.html` (~20 s to build), Alt+click for the inspector, `?q=.4` for a quick look.

Compare each screenshot with its reference: silhouette, proportions, colour and **how much it covers** at 10-60 m.
Fix floating, buried, clipping and wrong-scale things before committing.

---

## 11. Docs and the texture list (P9)

- `BIOME-API.md`: the six species in the zones table (which zone each lives in), the five new floor plants, the
  `NHL.buildNewFlora` export, the `farShape` field.
- `KNOWN_ISSUES.md`: one new open item listing what is procedural and anything that looks wrong you could not fix
  (e.g. moss collars on fluted boles).
- `INDEX.md`: `python tools/make_index.py` from the worktree root (it rewrites every build's INDEX.md: stage only
  `biomes/nhighlands/INDEX.md`).
- Do not edit `PORT-BASELINE.json`; run `python tools/port_baseline.py` and paste its summary into the report (only
  `nhighlands.html` should differ).
- **Library cards that exist and might fit** (do not wire them; the owner decides): `card.ginkgo` (the fan-leaf),
  `card.moss.hanging`, `card.fern.green`, `card.frond.fractal`, `card.clubmoss`, `bark.mossy`. Name them in the report.
- **Textures wanted:** for each surface you painted in code, a paste-ready prompt, one fenced block each:

  ```
  Seamless tileable texture, 2048x2048, top-down orthographic, flat even lighting, no shadows: <the surface, colours as
  hex>. Matte. One tile covers <N> metres.
  ```

  Cut-outs (the fan leaves, the staghorn fronds, the sun-wheel) instead: "isolated on flat pure magenta (#FF00FF),
  front view, whole object in frame, no shadow". Surfaces: the moss sleeves, the ghost alder's lichen-mottled bark,
  the serpentwood's mossed bark, the table cedar's needle tiers, the banyan's strand bark, the three cut-outs.

---

## 12. Commit and report

- Commit each phase on `gemini/nhighlands-flora`, staging only your files (`git add <paths>`, never `git add -A`),
  including `biomes/nhighlands/dist/nhighlands.html` (built pages are committed; Git LFS handles them). Never commit
  screenshots or the baseline JSON you saved outside the worktree.
- Message: one plain line of what the phase added, a blank line, what you checked; your attribution line last.
- **Do not push.** The owner or Claude will review and merge.

**The report**, `biomes/nhighlands/HANDOFF-FLORA-REPORT.md`, committed last:
1. Each phase: done or not, and the verify summary lines.
2. Before and after: held triangles, drawn triangles and draw calls at each preset view; the build time (`window._phases`).
3. Every species' count before and after.
4. Every place you departed from this file, and why.
5. Open questions for the owner.
6. The library cards that might fit, and "Textures wanted".

---

## 13. Common mistakes

- A new pass before `reseed(550091)`, or among the old passes (moves existing trees).
- A new floor plant inside `plantTemperate` and friends (reshuffles the whole floor).
- Forgetting the species' `HV` harvest, or listing an edible part without adding the key to `FRUIT_NOT_DRAWN`.
- A raw field in an `accept` instead of a zone.
- A `//` comment mid-line; `THREE` or a canvas in `60-…` or `70-…`; `Math.random()`.
- A new glow material missing from `NHL.setNight`.
- A sixth new item type (draw calls).
- Opening `dist/` to check something. Use the verify and the screenshots.
