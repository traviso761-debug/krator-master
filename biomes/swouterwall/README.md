# South-Western Outer Wall (`biomes/swouterwall`)

Procedural Three.js biome kit for the **South-Western Outer Wall** (`rmwvsqhhqyk3f`, annealed with northern `Region 177` `rmwzq42zszc94`) and **Trigemini Pass** (`rmwvsmgi8xrro`) on Scale-Model 5.1 (`PLAN.md`).

## Stations

| Station | Output | Map 5.1 `(px, py)` | Elev & Air | Highlights |
|---|---|---|---|---|
| `boreallakes` (default) | `dist/swouterwall.html` | `(264, 904)` | `+3,040 m`, `1.10 atm`, `Dfc` | Two stepped dark Boreal Paternoster Lakes linked by a boulder riffle, Tarn Spire-Spruce, NWOW Fur Larch, floating Quaking Sphagnum rafts & dawn frost-smoke |
| `morainetarn` | `dist/swouterwall-morainetarn.html` | `(276, 1024)` | `+4,360 m`, `0.91 atm`, `ET` | Milky-turquoise glacial-flour Moraine Tarn behind an arcuate terminal moraine, Stone-Pine krummholz, flame-gold Moraine Birch, `KFROST` sorted stone polygons & spring aufeis |
| `trigemini` | `dist/swouterwall-trigemini.html` | `(279, 1120)` | `+5,680 m`, `0.76 atm`, `ET`/`HT` | 3-way Trigemini Pass U-trough junction (Copper Glacier, Dalab, W Rift Highland), half-frozen Cold Tarn (`WATER.ice` shore shelves + katabatic lead), `lungcushion` O₂ domes & `?works=0` Dalab way-cairns |
| `breathvale` | `dist/swouterwall-breathvale.html` | `(410, 1213)` | `+6,100 m`, `0.69 -> 0.58 atm`, `HT` -> `O` | Southern Hanging Breath-Vale beneath a `0.62 atm` cobalt-violet sky; vascular flora stops dead at the `< 0.60 atm` headwall ceiling (`+6,465 m`), with `sunblood_crust` to `0.58 atm` |

## Build & Verify

```bash
node biomes/swouterwall/tests/test-swow.js
python3 tools/build.py biomes/swouterwall --all
python3 tools/check_port.py biomes/swouterwall
python3 tools/check_core_use.py biomes/swouterwall
python3 biomes/swouterwall/verify.py --assert --no-cache
```

Query flags:
- `?works=0` — hides Dalab/Fellgang pass way-cairns and courier pennants (`site:*` reserves remain).
- `?kin=0` — disables `BIO.kin` cousins (`nwouterwall` & `copperglacier`) to inspect native `SWOW` flora in isolation.
- `?shadow=1` — enables `KSHADOW` sun shadows at load (strictly OFF by default).
- `?dawn=1` — opens in cold `06:20` katabatic dawn / boreal lake frost-smoke mode.
