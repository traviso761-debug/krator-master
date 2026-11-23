# Dasri Kit Host & Bundle API (`kits/dasri/API.md`)

`kits/dasri/dasri_bundle.py` packages the entire Dasri kit (`core/engine`, `core/rand`, `core/materials/record`, `tex/`, and all 28 `ds_jabal_*` / `ds_vil_*` definitions) into a single self-contained closure exposing `DASRI` (alias `DS`).

## Python Bundler (`dasri_bundle.py`)

```python
import sys
sys.path.insert(0, os.path.join(ROOT, 'kits', 'dasri'))
import dasri_bundle

# Full texture pack, dry draw (host registers records in core/tags first)
js = dasri_bundle.bundle(tex=True, furniture=False)

# With repo-relative input list for build_sources.py (--list-sources)
js, files = dasri_bundle.bundle(tex='lean', furniture=True, with_files=True)
```

Options for `bundle(tex=..., furniture=..., with_files=..., side=...)`:
- `tex=True` (default): packs all building surface families from `kits/dasri/tex/`.
- `tex='lean'`: packs the 10 core masonry/wood/salt families (`brick`, `banco`, `qadad`, `stucco`, `ashlar`, `basalt`, `rubble`, `cedar`, `timber`, `halite`).
- `tex='urban'` / `tex='village'`: packs only the urban Jabal or rural oasis surface subset.
- `tex=False`: vertex colours only.
- `furniture=True`: seals the `nomad`, `generic`, `generic-goods`, and `jobs` catalog pieces so `DASRI.draw` furnishes interiors and courtyards automatically.
- `side={}`: writes the texture map payload into `side['dasri']` for sidecar `.tex.js` output (`tools/textures/matlib_pack.py`).

## JavaScript Runtime (`DASRI` / `DS`)

```js
// 1. Query dimensions & metadata ([G data])
const box = DASRI.dims('ds_jabal_rock_palace'); // { w: 18.4, d: 20.0, h: 25.8 }
const meta = DASRI.BOX['ds_vil_oasis_qasr'];    // { w, d, h, register: 'village', floors: 3, stepped: true, ... }
const oasisRow = DASRI.ROWS.dasri_oasis;        // ready-to-use KHAMLET.CULTURES row

// 2. Draw a settlement or cliffside cluster (register records in KTAGS before calling DASRI.draw)
const drawn = DASRI.draw(
  {
    id: 'arfwai-oasis',
    records: [
      { id: 'qasr', key: 'ds_vil_oasis_qasr', x: 0, z: 0, ry: 0 },
      { id: 'cliff-house', key: 'ds_vil_house_elder', x: -18, z: -24, ry: 0, cliff: true }
    ]
  },
  {
    scene: worldGroup,
    ground: (x, z) => terrainH(x, z),
    seed: 9101,
    label: 'Arfwai Oasis (Train of Jabal)'
  }
);
// drawn: Array<THREE.Mesh> with .group, .recs, .missing, .tris, .lights, .smokes

// 3. Instantiate a single prototype at the origin
const proto = DASRI.proto('ds_jabal_house_mid', { cliff: true, v: 1, lo: -5.0 });
```

### Placement Options per Record
- `cliff` (`boolean`, optional): when `true` (or auto-detected when `ground` rises `> 2.2 m` across the `-z` rear), suppresses rear `-z` protrusions (`z >= -d/2`) and extends a deep battered stone retaining skirt (`lo`) into the cliff/spire.
- `v` (`0 | 1`): on `ds_jabal_house_poor` and `ds_jabal_house_mid`, `v: 1` selects the **Shibam Hadramawt** mudbrick + whitewashed `qadad` upper-crown variant.
- `y`, `lo`: explicit floor elevation and foundation skirt depth override (otherwise computed automatically by `DASRI.cliffSeat`).
