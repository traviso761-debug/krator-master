# `kits/tabisti` API (`TBK`)

## Settlement Bundle (`kit_bundle.py`)

```python
import sys
sys.path.insert(0, os.path.join(ROOT, 'kits', 'tabisti'))
import kit_bundle as tb_bundle

js, dep_files = tb_bundle.bundle('TBK')
```

### Runtime Exports (`TBK`)

- `TBK.proto(key, variant)` -> `THREE.Group` built at `(0, 0, 0)` with front `+z`, `userData = {key, v, tris, w, d, h, style: 'urban', doors, fixtures}`.
- `TBK.dims()` -> `{ [key]: { cls: 'building', name, w, d, h, fw, fd, style: 'urban', wealth, types, role, job, cut, variants } }` for all 50 buildings (`tb_*`, seeds `10401..10450`).
- `TBK.trades` -> `TB_TRADES` (`44/44` Voth census trades actively carried, `0` gaps).
- `TBK.tradeDefs()` -> `{ [trade]: string[] }`.
- `TBK.polities` -> `TB_POLITIES` (`sfenops`, `middle_tabisti`, `liikofi`, title `Ahedman`).
- `TBK.lexicon` -> `TB_LEXICON` (authentic Tabist vocabulary).
- `TBK.errors` -> `string[]` (`0` in verified builds).

## Tag Contract

- `KIT.id`: `'tabisti'`
- `KIT.pack`: `'tabisti'`
- `KIT.culture`: `'eastabyss'`
- `tags.style`: `'urban'` (strictly zero salvage)
