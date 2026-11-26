# Arcoforte (`kits/arcoforte`)

A standalone 1:1 procedural arcology complex inspired by Paolo Soleri's **Arcoforte** (*Arcology: The City in the Image of Man*, Section 5, plates 47–49), synthesizing all cross-sections, top-view and bridge-level plans, elevations, and sea-cliff sketches into one unified coastal megastructure (~300 m tall, ~580 × 580 m / 29 ha, peak capacity ~20,000), with full **living, work, and recreation** interiors planned as data and furnished via `kits/interiors` + `kits/ancients-interiors` so the complex can stand in **refurbished, culture-socketable form** as the centerpiece of a coastal settlement.

## Reference images (`reference/`)
- `reference/arcology-arcoforte-1.webp` — Top view (1:2,000): the sea-cliff headland, 7 cliff skyscrapers, domed Tourist Center rotunda, NW marina, 9-bastion horseshoe "neocliff" with 13 radial-oculus courtyard skylights, sheltered central park with waterways, bridges and ribbed amphitheatre, and southern Linear City throat.
- `reference/arcology-arcoforte-2.webp` — Composite cross-section (1:2,000) & sea-cliff caption: multilevel boat-lift harbour platform, sub-cliff fishing & automated industries, inclined cliff shafts, vaulted City Center, fluted Domed Rotunda, battered residential bastions, mushroom-pier garden belvederes, and 300 m skyscrapers topped by the complex Cultural Center / Public / Gardens / Heliport roof.
- `reference/arcology-arcoforte-3.webp` — Coastal cross-section, exterior elevation (1:5,000) & 1965 sea-cliff sketches (`150 m + 150 m`): sloped trapezoidal bastion ribs, promenade pavilions, cylindrical rotunda, and plunging cliff piers.

## Acceptance frames (`VISUAL-BAR.md`)
1. **Vista:** `Sea cliff vista` — offshore NW view across the breaking sea and multilevel boat-lift harbour platform up the 300 m seven-tower cliff face, Sky-Crown, Domed Rotunda, and Horseshoe Neocliff.
2. **Ground-level:** `Central park and waterways` — eye-level frame beside the flowing park waterway, reflection pool, and ribbed amphitheatre looking across the arch footbridge into the vaulted City Center arcades and Domed Rotunda.

## Build, test, blueprint, and verify

```bash
node kits/arcoforte/tests/test-arcoforte.js                   # layout, rules, living/work/rec plates, socket & negatives
python3 kits/arcoforte/arcoforte_blueprint.py                 # writes floors/*.png, AREAS.md, and BLUEPRINT.md
python3 tools/build.py kits/arcoforte                         # builds dist/arcoforte.html + dist/arcoforte.tex.ancients.js
python3 kits/arcoforte/verify.py kits/arcoforte/dist/arcoforte.html --assert --all-views
python3 kits/arcoforte/verify.py kits/arcoforte/dist/arcoforte.html --assert --state marginal --socket fleetborn
```

## Controls & URL parameters
- **Cutaway (`X`, `[` `]`, or top Cutaway bar):** Opens any of the 12 multi-storey interior zones (`harbour_works`, `auto_vaults`, `linear_west`, `linear_east`, `city_west`, `city_east`, `bastion_west`, `bastion_east`, `promenade_rec`, `rotunda`, `tower_central`, `sky_crown`) storey by storey, building its rooms, door leaves (`E`), and catalog furniture on demand.
- **State (`?state=refurbished|marginal|intact|ruined`, `ARCOFORTE.state(spec)`, or panel `State` selector):** Defaults to `refurbished` (kept & re-glazed living/work/rec zones, sealed/ruined deep automated vaults). `marginal` keeps the lower `'harbour'`, `'bastions'`, and `'ring'` refurbished and working while rendering `'towers_upper'`, `'vaults'`, and `'crown'` weathered/ruined; `ARCOFORTE.state({...})` accepts custom per-zone maps across `ARCOFORTE.ZONES`.
- **Culture Socket (`?socket=refurbished|ancient|scrap|iziz|xanadu|republican|fleetborn|shorekin`, per-zone `?socket=bastions:fleetborn,ring:fleetborn,harbour:shorekin`, or panel `Culture` selector):** Re-dresses inhabited rooms live via `ARCOFORTE.socket(spec)` / `ARCOFORTE_HOST.socket(spec)`. `'fleetborn'` outfits habitable `'bastions'` and `'ring'` halls with Fleet-born caretaker fittings; `'shorekin'` outfits `'harbour'` works & boat-lift rooms with Arch local/sea timber, brucite-travertine, coir, and pandanus fittings.
