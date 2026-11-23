# Ria Dynasty Architectural Kit (`kits/ria`)

The architectural kit of the **Ria Dynastic Continuum ("The Two Reaches")** along the `Mā-Rīa` river system (`CROOK-RIA-DECISIONS.md` §2.4, §2.6), built on `core/engine` (`PLAN.md`).

Displays **16 complete `defBuilding` monuments, waterworks, sanctuaries, gates, and dwellings** arranged in two clear dynastic rows:

1. **Row 1 — Lower Ria / Western Dynasty (`Heartland` & `Ria Sound`, Low-Ria *Rīwa-Tōka*, `style: 'lower-ria'`, 8 buildings):**
   Equal 50/50 synthesis of Near-Eastern & Classical masonry — Babylonian polychrome glazed-brick Ishtar round-arch portals & bastions (`cobalt`, `emerald`, `saffron`), stepped crow-step merlon Hanging-Garden ziggurat wings, Persepolitan double-protome Apadana hypostyle halls, Classical semicircular exedras, Pantheon stepped rotundas, Cosmatesque Solomonic spiral cloisters, and sculpted temple pediments — with 3-to-7-tier Thai Rattanakosin *Prasat* & Burmese Konbaung *Pyatthat* crowns, cruciform *Sala-Nam* water pavilions, glazed *Prangs*, and **5-Headed Gilded *Uktena* River-Serpent** balustrades.
2. **Row 2 — Upper Ria / Eastern Dynasty (`Upper Ria` & `Neo-Ozarks`, High-Ria *Līwa-Tōga*, `style: 'upper-ria'`, 8 buildings):**
   Equal 50/50 synthesis of Egyptian, Classical & Minoan stone architecture — colossal flat-topped battered `porphyry` & `dolomite` temple pylons with flaring cavetto cornices, Egyptian green palm-frond capitals, Greco-Roman circular rotunda-peristyles & basilicas, stepped Pantheon saucer-domes, Pompeian-Minoan flat balustrade impluvium courts with downward-tapering red-porphyry columns, and **Compass-Hills `lodestone` obelisks** (`lodestone = 220`) — with Northern Lanna white-`alabaster` & `indigoslate` *Prasat* spires, Angkor-Bagan stepped stone *Shikhara-Prangs*, karst counterweight boat-lifts, and **Silver-Bronze Crested Water-Swan (*Hongsa*)** balustrades & finials.

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
