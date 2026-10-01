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
`MAT.brick`, `MAT.darkGlass`, the salvage set). One new material,
`MAT.adLawnR` (the amphitheater's rank lawn). Shared helpers are prefixed `ad`
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

TRIS_TABLE
