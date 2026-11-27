# kits/painted-men: the Painted Men (Kwéent'x̱) building kit

The standalone building kit of the **Painted Men** (*Kwéent'x̱* and allied north-eastern highland raider tribes, catalog culture `painted`). Split out of `kits/highlands` (`2026-11-19`) so the Iron Republic (`republican`) and free alpine cantons (`rustic`) carry pure Slavic / Carpathian / Novgorodian woodcarving, while the Painted Men retain 100% of their **Tlingit / Pacific-Northwest black-red-teal (`#141619`, `#b63124`, `#1f6e6c`) formline crest boards, ovoids, U-forms, split-Us, trigons, Raven/Eagle-Bear-Frog totem poles, spread Thunderbird gable wings, bamboo-stilt dwellings, arched rib-vault longhouses, painted salvage roundhouses, and cantilevered cliff settlements**.

## Fragments

| Files | What |
|---|---|
| `src/83-pm-tlingit.js` | Dedicated Tlingit / Pacific-NW procedural formline painter (`PMFORM`, `pmOvoid`, `pmUForm`, `pmSplitU`, `pmEye`, `pmSwoop`, `pmTrigon`, `pmCedar`), crest panels (`pmFormA/W/V/T/B/F` — Salmon, Orca, Thunderbird, Bear, ovoid/split-U frieze), Eagle–Bear–Frog stacked totem wraps (`pmTotem`, `pmTotemP`), Thunderbird crossarm wings (`pmWing`), standalone salvage geometry fallbacks, and branch-scoped hooks (`hnForm`, `hnFrieze`, `hnTotemPost`, `hnTotemPole`, `hnTotem`, `hnBarge` `'bird'`) |
| `src/84-tri-dwell.js` | Painted Men dwellings (`hl_tri_small_a/b/c`, `hl_tri_large_a/b` — painted stilt huts, woven-mat round bamboo huts, salmon-gable earth-lodges, NW-coast great plank-house with oval mouth-door entrance pole, multi-family stilt long-dwelling) and the reusable cantilevered cliff settlement (`hl_tri_cliff_village`) |
| `src/85-tri-village.js` | Communal halls, sacred sites, farms & crafts (`hl_tri_longhouse` arched rib-vault hall, `hl_tri_warrior_hall` palisaded hall with sparring ring, `hl_tri_shaman` painted-cone lodge, `hl_tri_stone_circle`, `hl_tri_farmhouse`, `hl_tri_farm` dry-stone terraces, `hl_tri_pen`, `hl_tri_granary`, `hl_tri_smithy`) |
| `src/85b-tri-salvage.js` | Post-Cataclysm reclaimed Painted Men structures (`hl_tri_tank_round`, `hl_tri_cont_long`, `hl_tri_hull_hall`, `hl_tri_silo_drum`, `hl_tri_scrap_forge`) |
| `targets/sheet/*` | `88y-pmsheet-matlib.js` (binds `materials.json` packed textures shared from `kits/highlands/tex/`), `89z-rows.js` (`SHEET` layout), `91t-pmsheet-tags.js` (`KTAGS` registration onto `culture: 'painted'`) |

## Taking the kit in a settlement

`painted_men.py` exposes `paths()` (this kit's four fragments) and `full_paths()` (the shared timber, log, bamboo, opening, dress and furnish helpers from `kits/highlands` plus this kit's fragments, so Painted Men can load either standalone or beside Highlands on the same page without clashing):

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'painted-men'))
import painted_men as kpm
paths.update({f: p for f, p in kpm.full_paths().items() if f not in paths})
```

## Build & Verify

```bash
python3 tools/build.py kits/painted-men
python3 kits/painted-men/verify.py kits/painted-men/dist/painted-men.html --assert --out kits/painted-men/shots
```
