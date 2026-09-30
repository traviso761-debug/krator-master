# Ring Sea watercraft

Seventeen procedural vessels for the Ring Sea, each tagged by culture, riding at anchor
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
| 1 | `60-rs-hyk-trireme.js` | Hykkousoi Trireme | hykkousoi | warship, trireme (162 oars, triple ram, roundel sails) |
| 2 | `61-rs-iziz-turtle.js` | Iziz Turtle Ship | iziz-vernacular | turtle ship (spiked shell of reclaimed Ancient hex plate) |
| 3 | `62-rs-xanadu-swan.js` | Xanadu Swan Barge | xanadu | royal barge (swan neck and tail rooted in the hull, 32 paddlers) |
| 4 | `63-rs-voth-flagship.js` | Voth Ordinator Flagship | voth | flagship (brown-black junk hull, oxblood sails, mizzen on the castle) |
| 5 | `64-rs-beast-waa.js` | Beast-Rider Voyaging Canoe | beast-rider | double canoe (crab-claw sails, flyer's perch) |
| 6 | `65-rs-hyk-galley.js` | Hykkousoi Scroll-Sail Galley | hykkousoi | explorer (bamboo-yard scroll sails, tarp hold) |
| 7 | `66-rs-salvage-tug.js` | Salvagers' Sailing Tug | ancients-salvage | Ancient steel tug converted to gaff rig |
| 8 | `67-rs-xanadu-dragon.js` | Xanadu Dragon Boat | xanadu | festival racer; `rsDruk` is the thunder-dragon figurehead |
| 9 | `68-rs-iziz-dhoni.js` | Iziz Dhoni | iziz-vernacular | coaster, main and mizzen lateen |
| 10 | `69-rs-islander-oruwa.js` | Islander Oruwa | ringsea-islander | outrigger fishing canoe |
| 11 | `70-rs-islander-karakoa.js` | Islander Karakoa | ringsea-islander | war outrigger (double outriggers, tanja sail) |
| 12 | `71-rs-voth-chitin.js` | Voth Chitin Bireme | voth | bireme raider, carapace roof, fan sails (flagship's lacquer) |
| 13 | `72-rs-hyk-hexareme.js` | Hykkousoi Siege Hexareme | hykkousoi | three banks of great oars, towers, stone-thrower, boarding bridge |
| 14 | `73-rs-xanadu-baghlah.js` | Xanadu Pearl Baghlah | xanadu | deep-water trader, gilded arch-windowed stern, two lateens |
| 15 | `74-rs-iziz-wheel.js` | Iziz Wheel Galley | iziz-vernacular | treadmill paddle-wheel warship (the wheels turn) |
| 16 | `75-rs-beast-rookery.js` | Beast-Rider Rookery Raft | beast-rider | trimaran roost tower for flyers (`rsFlyer`) |
| 17 | `76-rs-islander-lakatoi.js` | Islander Lakatoi | ringsea-islander | four-hull trading raft, twin pandanus crab claws |

`ringsea-islander`, `beast-rider` and `hykkousoi` are culture tags this kit introduced; the rest reuse existing ones. Iron Republic, Dalab and Yuni have no ships here (landlocked or not seafaring).

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
