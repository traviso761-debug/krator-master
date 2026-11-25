# openworld/east-abyss: East Abyss Basin & Near-Environs

1:1 open-world cut of the East Abyss basin (`e abysss`), Yuni Valley (`Yuni Valley`), and East Rim (`east rim`)
from Scale Model 5.1 (edit `5.1e32`, 2026-11-25), built on `core/world` + `biomes/eastabyss` for biome polish
and Godot native export (`godot/data/east-abyss/`).

## Build & Export

- Cut from scale model: `python3 tools/scale-model/cut_site.py east-abyss`
- Build 1:1 web page: `python3 tools/build.py openworld/east-abyss`
- Export Godot data (with Catch-Bowl geology landforms & dense-air weather presets): `python3 openworld/east-abyss/tools/export_godot.py`

## Included Sites (16)

The Arcades, Sfenops, Bir-Sakhr Reed, Middle Tabisti, Liikofi, Mungo, Tafidda, Quintagon, Slice, Verge,
Braita Reed, Sista Riba, Bissa, Locus, Downback, Upsprings.
