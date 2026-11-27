# Dilihan Vassal Building Kit (`kits/dilihan`)

The local Iziz-vassal building kit for **Dilihan / Dellu-Handu** (`px 744, 663`, `-888.6 m ASL`, `1.79 atm`, `Am` tropical monsoon on the southern bench of the Cut), written on the shared **Iziz Vernacular contract** (`settlements/iziz/VASSAL-KITS.md`).

Where mainland `kits/iziz-vernacular` builds in sand plaster, timber, and salvage sheet, Dilihan's veteran colonists fire local alluvial clays into **warm red, terracotta-orange, oxblood, and banded ochre brick** (in material kinship with neighboring **Jimjam**) while adapting every house, workshop, bazaar, bathhouse, and garrison hall to oppressive basin heat and monsoon humidity:

- **Courtyards & Evaporative Cooling:** Sunken turquoise *impluvium* rain-basins, porous terracotta *zeer* water-cooling jars, dogtrot / *zaguán* wind-passages, and open stack-effect wind-wells.
- **Shades, Loggias & Sails:** Deep bracketed monsoon eaves, ground-floor brick-arched loggias, wrap-around louvered sleeping verandas, slatted bamboo/teak pergolas, *jalousie* window hoods, and taut linen + **Iziz Imperial Orange (`0xe07a2a`)** courtyard shade-sails.
- **Airy Openings, Brick *Jali* & Roof Monitors:** Outward-propped hinged louver shutters, perforated honeycomb red-brick *jali* (*cobogó*) breeze-screens, raised ridge-vent clerestory monitors, and brick *malqaf* wind-catcher towers.

## Building & Verifying

```bash
python3 tools/build.py kits/dilihan
KRATOR_CHROME=/usr/bin/chromium python3 kits/dilihan/verify.py kits/dilihan/dist/dilihan.html --assert --no-cache --size 960x600 --out kits/dilihan/shots
```

## Taking the Kit in Another Build (`dilihan.py`)

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'dilihan'))
import dilihan as kdil
paths.update({f: p for f, p in kdil.paths().items() if f not in paths})
```

All 24 buildings register on `VERN.def` (`dil_*`, `tags: { culture: 'iziz', style: 'dilihan', ... }`) in seed block `9801..9999` and place via `VERN.place(...)`. When a settlement already loads `settlements/jimjam`'s texture pack (as `settlements/dilihan` does), bind `MAT.dl*` directly onto `'jimjam'` via `KMAT.bindMat('jimjam', MAT, { alias: kdil.JIMJAM_MAT_ALIAS })` for zero extra texture sidecar weight.
