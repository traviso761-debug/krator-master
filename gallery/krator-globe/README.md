# gallery/krator-globe

The full **Krator 5.1 Planetary Globe & Geodetic Atlas** (`dist/krator-globe.html`), pairing the canonical Scale Model 5.1 crater interior (`3,642 × 3,446 km` around the Throne, including the sculpted `6.28 km` **The Dome** shield volcano & caldera) with Krator's `2048 × 1024` global planetary synthesis (`R = 4,812.85 km`, `84 km/°`, `0.75 g`, tidally locked with `(0°, 0°)` facing the giant):

- **Biosphere zoning:** Earthly green flora inside Scale Model 5.1 fading out across the Ria Valley & Crook, plus a second naturalized Earthly green enclave around **Lake Capsica** (Ancient Ring-Citadel, West Causeway Quay, Sunken Observatory); iridescent blue-green and retinol-purple native Kratorian flora across the wider moon.
- **Tectonics & relief:** East Tharn Highlands, en-echelon East Abyssal & Danakil salt/soda rift grabens (~7% global abyssal relief), antipodal chaos terrain modeled on the scale-model chaos province, coherent West Tharn / Southwest Arch Ridge coastline, and feathered Sinusoidal / Azimuthal Equidistant 5.1 seam blending.
- **Climate & tools:** 43-class Köppen + exotic climate synthesis (including lethal wet-bulb hothouse `WH`, dense-air abyssal basins, and thin-air hyperalpine cordilleras), live Sun/eclipse/giantshine ephemeris, 52°-inclined broken Station orbit, local sky horizon radar, and spherical great-circle geodesic ruler.

## Build & Bake

```bash
python3 gallery/krator-globe/build.py
python3 gallery/krator-system/bake_krator.py
python3 gallery/krator-system/build.py
```

`dist/krator-globe.html` is gitignored so `globe_data.json` is stored once; `gallery/krator-system/bake_krator.py` runs `gallery/krator-globe/build.py` automatically when `dist/krator-globe.html` is not yet built.
