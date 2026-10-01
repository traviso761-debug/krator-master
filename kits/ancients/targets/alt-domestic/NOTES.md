# alt-domestic — notes

Queue item 3, domestic group: from-scratch ALTERNATE versions of the kit's
domestic types after the user's `arco1` / `arco2` reference sets. Three new
house/apartment types and one alternate each for the Amphitheater, Fuel
station, Radar, Dish, Megastructure, Factory and Laboratory.

```
python3 build.py --target alt-domestic && python3 jscheck.py .syntax-alt-domestic.js
python3 verify.py dist/alt-domestic.html --assert --views "Undulant house — row,Flower dish — reclaimed"
```

## Files, seeds, keys

| builder | type key | fragment | seed | budget class |
|---|---|---|---|---|
| `buildAltWaveHouse` (The Undulant house) | `adWave` | `src/8ak-alt-a-houses.js` | 9850+d | small |
| `buildAltBridgeHouse` (The Bridge house) | `adBridge` | `src/8ak-alt-a-houses.js` | 9855+d | small |
| `buildAltFinApartments` (The Fin apartments) | `adFins` | `src/8ak-alt-a-houses.js` | 9860+d (fire mask 9862) | medium |
| `buildAltAmphitheater` (The Garden amphitheater) | `adAmph` | `src/8ak-alt-b-civic.js` | 9865+d | medium |
| `buildAltFuelStation` (The Trestle fuel station) | `adFuel` | `src/8ak-alt-b-civic.js` | 9870+d | small |
| `buildAltRadar` (The Rotor radar tower) | `adRadar` | `src/8ak-alt-b-civic.js` | 9875+d | small |
| `buildAltDish` (The Flower dish) | `adDish` | `src/8ak-alt-b-civic.js` | 9880+d | small |
| `buildAltMega` (The Rampart) | `adMega` | `src/8ak-alt-c-works.js` | 9885+d | mega |
| `buildAltFactory` (The Pilotis works) | `adFac` | `src/8ak-alt-c-works.js` | 9890+d (fire mask 9892) | medium |
| `buildAltLab` (The Star laboratory) | `adLab` | `src/8ak-alt-c-works.js` | 9895+d | medium |

Every builder is the kit contract: `build…(scene,gx,gz,d)`, local to its own
group at `(gx,0,gz)`, opens with its own `reseed`, sets and resets `KOFF`,
registers itself, takes its materials from `MAT`/`TEX` (`CONC`, `SHELL`, `WIN`,
`MAT.brick`, `MAT.darkGlass`, `MAT.turf`, the salvage set); no new
materials. Shared helpers are prefixed `ad`
(`adBox adPrism adExtZ adExtX adLoft adRev adLeg adTris adUV adRubbleArc
adRubbleLine adTarp adTreesBox adReclaim`); the first fragment explains them.

**Decay.** 0 intact · 1 ruined · 2 **reclaimed** · 3 rehabilitated.
- 1 and 2 share a collapse (`brk`): each builder brings something down that
  changes the silhouette, not just holes in the intact form.
- 2 is the ruin overgrown and then lived in: `adReclaim` stands shacks,
  gardens, rain butts and cook fires on the flat surfaces the builder allows
  (`ok(p)`), and each builder adds its own: tarps over breaks, salvage walls,
  fire in specific openings (FIREKIT, so night only), ladders and bridges.
- 3 stands whole on old fabric: `HOLES = .55` and `repairPass` from the scene
  loop, as for every kit type.

**For the kit rows (coordinator).** In the kit, decay 2 means TOPPLED and is
only built for rows with a `t`. These builders read 2 as RECLAIMED. Giving them
a kit row with `t` will show the reclaimed state at `x = t`; leaving `t` off
shows 0/1/3 like the other domestic types. `BUDGET.type` already lists the ten
keys (one additive line in `src/91-probe.js`).

**The target.** One row per type, states west to east in reading order:
intact (`-s`), rehabilitated (`0`), ruined (`+s`), reclaimed (`t = 2s`). Four
presets per type: `— row`, `— intact`, `— reclaimed`, `— night` (the reclaimed
camp at night, when its fires show). The first preset is an overview.

## Per builder

(numbers: scene triangles per decay, 0 · 1 · 2 · 3, from `verify.py --assert`)

| type | 0 intact | 1 ruined | 2 reclaimed | 3 rehab | meshes (0) |
|---|---|---|---|---|---|
| Undulant house | 19 494 | 20 358 | 20 866 | 21 078 | 2 |
| Bridge house | 2 394 | 5 558 | 6 446 | 3 834 | 6 |
| Fin apartments | 24 804 | 32 838 | 34 460 | 29 722 | 3 |
| Garden amphitheater | 31 140 | 30 362 | 33 232 | 37 260 | 5 |
| Trestle fuel station | 9 428 | 12 870 | 13 858 | 12 236 | 6 |
| Rotor radar tower | 2 880 | 8 390 | 9 206 | 5 996 | 2 |
| Flower dish | 9 076 | 13 302 | 13 990 | 11 864 | 3 |
| The Rampart | 62 032 | 89 025 | 96 495 | 79 762 | 1 |
| Pilotis works | 10 832 | 20 536 | 23 932 | 20 028 | 3 |
| Star laboratory | 11 744 | 15 272 | 17 044 | 14 854 | 7 |

All well inside their class (small 60 k, medium 250 k, mega 700 k). The whole
target is ~0.94 M scene triangles, 40 type/decay pairs, 44 registered volumes;
every invariant passes (`verify.py --assert`, error panel clean). Worst draw
calls seen over the shots: 182 (whole target in view).

### The Undulant house (`adWave`)
Refs: `arco2/casa mila.jpg` (and its copy) for the rolling stone skin, the
deep-set windows with wrought-iron rails and the helmeted chimney cowls;
`arco1/hillarcology7.webp` (sheet 3 #11, the wave-roofed house) for the attic
swelling into the roof.
Weaknesses: the window openings are quad-stepped (holes in one 156 x 52
surface), so close up their heads are notched rather than curved; the skin has
no thickness at an opening (a dark recess wall stands 1.5 m behind it); the
reclaimed shacks on the roof crown can overhang the attic's slope.

### The Bridge house (`adBridge`)
Refs: `arco1/4334781da80cd29f4a71b65264ce6d26.jpg` (sheet 0 #25, the concrete
box on splayed legs over the car) and `arco1/a1760b6e4c99499a1a63ef80b783c4ef.jpg`
(sheet 1 #23, the chamfered brutalist house with its low wing).
Weaknesses: the lightest builder (2.4 k intact) — no interior beyond a floor
plate and lit cells along the ribbon; the tube's ruin has only one failure mode
(pivot on the west leg); the wing is a plain extrusion.

### The Fin apartments (`adFins`)
Refs: `arco1/168e808caa6219b967f81a70e06a71c0.jpg` (sheet 0 #6, the curved slab
with shark-fin blades between the balconies); the scalloped rhythm of
`arco2/03.09-Bertrand-Goldberg-Associates.jpeg`.
Weaknesses: seen square-on the fins are edge-on lines (they read only from
an angle — the presets are oblique); the snapped fins are squashed in place
(vertices above the break are flattened onto it) rather than cut cleanly; the
two fallen fins are 50 m long and can read as ramps; firelight runs ~50 % of
the south windows in the reclaimed state, which is busy.

### The Garden amphitheater (`adAmph`)
Refs: `arco2/260115-ufm-harry-diaz.jpg`, `arco2/5o-an#U0303os-de-ufm-1.jpeg`
and `arco2/francisco-marroquin-university-guatemala-city-1.webp` (the lawn
with sinuous concrete seat ribbons and the brick galleries with hanging
planters); `arco2/77fffacb-be11-44f0-830d-697e32e1283f.webp` for the terraces.
Weaknesses: from the south the bandshell's back reads as a white dome; the
seat ribbons are a riser and a tread with no back face (the lawn hides it from
most angles, not from above the rim); the gallery's interior is a dark plane
behind the windows; the turf's board texture shows as concentric mowing
stripes on the polar lawn grid.

### The Trestle fuel station (`adFuel`)
Refs: `arco1/d285b9f27bed900b20befbde67d46c49.jpg` (sheet 2 #20, the disc on
raked legs round a core) and `arco1/17a2aaceb8f663ed88b6c94fc32ffef9.jpg`
(sheet 0 #8, the hovering disc).
Weaknesses: the lens is a single surface of revolution (no structure visible
in its soffit beyond the light strips); the legs land on the forecourt with no
footing; the reclaimed tarp walls hang from computed rim points and do not
follow the lens's tilt exactly.

### The Rotor radar tower (`adRadar`)
Refs: `arco1/mrakovica-monument-spomenik-a-cavic-0019-1536x10201-1.jpg` (sheet
3 #13, the stack of turned finned blocks) and
`arco2/The-Memorial-Ossuary-of-Fallen-Fighters-Gradski-Park-Kavadarci-Macedonia-10.jpg`
(the T-head over a court of stepped walls).
Weaknesses: intact it is very cheap (2.9 k) and the cruciform blocks are plain
prisms (no chamfers or relief); from a distance the turned blocks read as a
jumble more than a screw; the fallen head lies on its back as one rigid piece.

### The Flower dish (`adDish`)
Refs: `arco1/Stone-Flower-Jasenovac-Croatia-14.jpg` (sheet 1 #21, the opening
concrete petals) and `arco1/Spomenik_revoluciji-Podgaric.jpg` (sheet 1 #20,
the ribbed sphere held between arms).
Weaknesses: the petals are thick but their edges are a single band, so the
cupping is stronger than the thickness suggests; the ruined dish lies on its
rim through a petal's footprint; the reclaimed pool is a level disc at a fixed
depth, so on the bowl's low side it can show through the panels' holes.

### The Rampart (`adMega`)
Refs: `arco1/7b511ddd8938e68ebcb8cb694c55becf.jpg` (sheet 1 #9, the endless
battered wall of triangular relief facets).
Weaknesses: the glyph relief is kit boxes on each facet, not carved pattern;
the facets are one uniform size (no hierarchy of large and small panels); the
breach floor is one ruled surface between the faces, so the section reads as
smooth concrete except for the floor plates poking out of it; at 230 m the
arcade is the only thing that gives scale.

### The Pilotis works (`adFac`)
Refs: `arco2/SUNY_Medical_Center.jpg` (the stacked boxes on columns beside a
dark tower, joined by sky-bridges) and
`arco2/03.09-Bertrand-Goldberg-Associates.jpeg`.
Weaknesses: the halls are solid sawtooth extrusions (no interior; the ruined
middle hall is two end pieces and rubble); the stack's boxes have slots but
no depth behind them; the slid top box is placed, not simulated, and its
corner sits slightly into the box below.

### The Star laboratory (`adLab`)
Refs: `arco1/Ilinden_Memorial_Krusevo-thumbnail_webp-9999x9999.webp` (sheet 1
#16, the domed drum with radial lobes ending in great round windows).
Weaknesses: the lobes meet the drum by interpenetration (no fillet); the ruined
lobe's middle third is simply gone; the eye frames are flat discs on a lofted
tube rather than a thickened rim.

## Edits outside the allocation

- `build.py`: one line in `TARGET_OUT` (`'alt-domestic': 'alt-domestic.html'`).
- `src/91-probe.js`: one additive line after `BUDGET`
  (`Object.assign(BUDGET.type,{adWave:'small',...})`) so the new keys are
  judged against the right class.
- No kit rows were added (`targets/kit` untouched).
