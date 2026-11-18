# Shumari Building Kit (`kits/shumari`)

Architectural kit for the **Kingdom of Shumar** (`culture: 'shumari'`) on the `1.06 atm` dry western plateau of *Subaru-yama* (see [PLAN.md](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/PLAN.md)).

## Visual Grammar & Reference Plates

Shumari architecture fuses **Cairene Mamluk funerary and civic stonework** with **highland basalt engineering** and **Free Giant dual-scale ergonomics**:

- **[01-mamluk-carved-dome-ablaq.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/01-mamluk-carved-dome-ablaq.png)** — High-shouldered pointed stone dome carved in geometric star-and-lozenge relief over an epigraphic collar, 12-window arched drum clerestory, stepped corner *muqarnas* ("Turkish triangles"), `1-over-2` bullseye *qamariyya* roundels, and horizontal *ablaq* masonry (`sm_regiment_qubba` `v=1`).
- **[02-mamluk-spiral-dome-minaret.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/02-mamluk-spiral-dome-minaret.png)** — Bold 3D convex torsion ribs/gadroons winding up a pointed Mamluk dome (`hand = +1` on living regimental monuments; mirror-handed `hand = -1` on `sm_doriyan_stele` memorials for lost *Dōriyan*), crowned by a culture-neutral 3-sphere bronze *jamur* (`sm_regiment_qubba` `v=0`, `sm_doriyan_stele`).
- **[03-mamluk-pishtaq-twin-domes.png](file:///home/antigravity/traviso761-debug/krator-master/kits/shumari/refs/03-mamluk-pishtaq-twin-domes.png)** — Monumental recessed *pishtaq* portal rising above the *shurafat* roofline, framed by slender corner colonnettes, pointed *ablaq* voussoir arch, stepped prism *muqarnas* hood, triplet *jali* lights, and `4.4 m`-tall crimson-lacquered bronze-strapped `KDOOR` leaves for `3.6 m` Free Giants (`smPishtaq`).

## Build, Test & Headless Verification

```bash
# 1. Pack library textures from materials.json into tex/
python3 tools/textures/pack.py kits/shumari

# 2. Build dist/shumari.html + dist/shumari.tex.js + build-inputs.json
python3 tools/build.py kits/shumari

# 3. Offline Node unit tests (dome profile, handedness, Giant clearances, seeds, view names)
node kits/shumari/tests/test-sm-kit.js

# 4. Headless Chromium + SwiftShader verification
KRATOR_CHROME=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py kits/shumari/dist/shumari.html --no-cache --assert
```

## Key Sheet Views (`src/92s-sm-views.js`)

- `Overview` — Full Phase SM2 monument & toolkit sheet
- `Spiral qubba and pishtaq` — `sm_regiment_qubba` (`v=0`) right-handed spiral dome, *pishtaq*, *ablaq* walls, and compound stair
- `Carved qubba dome` — `sm_regiment_qubba` (`v=1`) geometric star-relief dome, Turkish-triangle shoulders, and `1-over-2` *qamariyya*
- `Inside the regiment qubba` — Walkable mausoleum interior showing tiered basalt columbarium urns, crimson-lacquered ancestor blade-racks, eternal oil braziers, and hollow octagonal drum/dome soffit
- `Doriyan mirror canopy` — `sm_doriyan_stele` open 8-pier *ablaq* pavilion over NW-facing black basalt steles under a mirror-handed (`hand = -1`) spiral dome
- `Toolkit samples` — Side-by-side Free Giant (`4.4 m` *pishtaq*, `giant: true`) vs Hearth-Commons (`2.25 m` door + crimson-lacquer *mashrabiya* winter bay, `giant: false`) scale contrast
- `Gorge street under the qubba` & `Domes of the Subaru-su` — Acceptance framing views from `PLAN.md` §2.5
