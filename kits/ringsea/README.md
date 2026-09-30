# Ring Sea watercraft

Twelve procedural vessels for the Ring Sea, each tagged by culture, riding at anchor
on one sheet and rowing in place. Built on the Ancients-lineage fragment contract
(`core/materials/` + vendored shell), one vessel per fragment.

```
python3 build.py                                    # -> dist/ringsea.html (deterministic; manifest in build-manifest.json)
python3 verify.py dist/ringsea.html --assert --views "Opening,Overview" --out shots
python3 verify.py dist/ringsea.html --views "Voth Brackwater Trireme,Voth Brackwater Trireme — abeam" --out shots
```

Every vessel has two preset views: `<name>` (starboard bow quarter) and `<name> — abeam`.

| # | Fragment | Vessel | Culture | Type |
|---|---|---|---|---|
| 1 | `60-rs-voth-trireme.js` | Voth Brackwater Trireme | voth | warship, trireme (162 oars, triple ram, roundel sails) |
| 2 | `61-rs-iron-turtle.js` | Iron Republic Turtle Ship | highland-republican | warship, turtle ship (spiked hex shell, smoking dragon head) |
| 3 | `62-rs-xanadu-swan.js` | Xanadu Swan Barge | xanadu | royal barge (swan neck, 32 paddlers, tiered pavilion) |
| 4 | `63-rs-yuni-junk.js` | Yuni Treasure Junk | yuni-common | merchant junk (three battened sails, stern castle) |
| 5 | `64-rs-beast-waa.js` | Beast-Rider Voyaging Canoe | beast-rider | double canoe (crab-claw sails, flyer's perch) |
| 6 | `65-rs-dalab-scroll.js` | Dalab Scroll-Sail Galley | dalab | explorer (bamboo-yard scroll sails, tarp hold) |
| 7 | `66-rs-salvage-bireme.js` | Salvagers' Bireme | ancients-salvage | bireme raider on an Ancient fuselage |
| 8 | `67-rs-yuni-dragon.js` | Yuni Court Dragon Boat | yuni-court | festival racer (20 paddlers, drum) |
| 9 | `68-rs-iziz-dhoni.js` | Iziz Dhoni | iziz-vernacular | coaster, lateen |
| 10 | `69-rs-islander-oruwa.js` | Islander Oruwa | ringsea-islander | outrigger fishing canoe |
| 11 | `70-rs-islander-karakoa.js` | Islander Karakoa | ringsea-islander | war outrigger (double outriggers, tanja sail) |
| 12 | `71-rs-voth-chitin.js` | Voth Chitin Bireme | voth | bireme raider, carapace roof, fan sails |

`ringsea-islander` and `beast-rider` are new culture tags; the rest reuse existing ones.

## Taking one vessel to another world

Copy `40-rs-core.js`, `41-rs-tex.js`, `42-rs-hull.js`, `43-rs-rig.js`, `44-rs-parts.js`
(they need `canvasTex`, `TEX`, `MAT` from `core/materials/`, and `h3`/`rng`/`reseed`
from `10-core.js`), plus the vessel's own fragment. Then:

```js
const V = RS.defs.vothTrireme.build();   // {group, anims, deckY, oars}
V.group.position.set(x, 0, z); V.group.rotation.y = heading; scene.add(V.group);
// each frame: for (const f of V.anims) f(seconds);
```

See `API.md` for the vessel frame and the builders.

## Files

`src/00-30, 92, 93, 99` are vendored from `settlements/reedlake` (see `KNOWN_ISSUES.md`
for the two deliberate changes). `verify.py`/`jscheck.py` come from the same place, with
`_api.extra()` vessel invariants and a pre-installed-Chromium fallback.
