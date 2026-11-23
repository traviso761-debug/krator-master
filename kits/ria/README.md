# Ria Dynasty Architectural Kit (`kits/ria`)

The architectural kit of the **Ria Dynastic Continuum ("The Two Reaches")** along the `Mā-Rīa` river system (`CROOK-RIA-DECISIONS.md` §2.4, §2.6), built on `core/engine` (`PLAN.md`).

Displays **16 complete `defBuilding` monuments, waterworks, sanctuaries, gates, and dwellings** arranged in two clear dynastic rows:

1. **Row 1 — Lower Ria / Western Dynasty (`Heartland` & `Ria Sound`, Low-Ria *Rīwa-Tōka*, `style: 'lower-ria'`, 8 buildings):**
   Kiln-fired Babylonian polychrome glazed-brick battered pylons (`cobalt`, `emerald`, `saffron`), Classical fluted `travertine` round-arch arcades, and Egyptian cavetto cornices crowned by 3-to-7-tier Thai Rattanakosin *Prasat* and Burmese Konbaung *Pyatthat* glazed-tile roofs, upturned gilded *chofa* / *hang hong* flame-finials, and **5-Headed Gilded *Uktena* River-Serpent** balustrades.
2. **Row 2 — Upper Ria / Eastern Dynasty (`Upper Ria` & `Neo-Ozarks`, High-Ria *Līwa-Tōga*, `style: 'upper-ria'`, 8 buildings):**
   Cut imperial `porphyry` and cream-white karst `dolomite` ashlar, Classical/Egyptian lotus-and-papyrus colonnades, and **Compass-Hills `lodestone`-capped obelisks** (`lodestone = 220`) crowned by Khmer Angkor stone *Prangs*, Northern Lanna / *Wat Rong Khun* white-`alabaster` & `indigoslate` multi-tiered *Prasat* roofs, upturned Bagan/Nusantara ribbed lotus domes, circular Mandala cloisters, karst counterweight boat-lifts, and **Silver-Bronze Crested Water-Swan (*Hongsa*)** balustrades & finials.

## Build & Verify

```bash
# Repack library textures after editing materials.json
/tmp/pw-venv/bin/python tools/textures/pack.py kits/ria

# Build dist/ria.html + dist/ria.tex.js sidecar
python3 tools/build.py kits/ria

# Headless verification & assertions
python3 kits/ria/verify.py --assert
```

## Controls (`core/host`)

- **Orbit / Pan / Zoom:** Left-drag / Right-drag / Wheel
- **Walk (`F`):** First-person walker on `KWALK` floors, grand stairs, boardwalks, covered bridges, and the exterior helical ramp of `ra_west_spiral_beacon`
- **Door (`E`):** Open / shut the nearest `KDOOR` doorway
- **Cut-away (`X`):** Slice open roofs and upper walls to inspect furnished interiors
- **Night (`N`):** Night sky, glowing braziers, lantern stands, and beacon fire
