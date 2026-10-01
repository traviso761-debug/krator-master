# Ring Sea watercraft

Twenty-one procedural vessels for the Ring Sea, each tagged by culture, riding a live swell
on one sheet with their sails breathing in the wind and their oars stroking. The **Under way**
button (off by default, so the preset views stay put) sets the whole fleet sailing east with wakes. Built on the Ancients-lineage fragment contract
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
| 2 | `61-rs-iziz-turtle.js` | Iziz Turtle Ship | iziz-vernacular | turtle ship (boxy spiked shell of Ancient hex plate, Iziz orange trim, sun sails) |
| 3 | `62-rs-xanadu-swan.js` | Xanadu Swan Barge | xanadu | royal barge (swan neck and tail rooted in the hull, 32 paddlers) |
| 4 | `63-rs-voth-flagship.js` | Voth Ordinator Flagship | voth | flagship (brown-black junk hull, green sails with the gold wave, mizzen on the castle) |
| 5 | `64-rs-beast-waa.js` | Beast-Rider Voyaging Canoe | beast-rider | double canoe (crab-claw sails, flyer's perch) |
| 6 | `65-rs-hyk-galley.js` | Hykkousoi Scroll-Sail Galley | hykkousoi | explorer (bamboo-yard scroll sails, tarp hold) |
| 7 | `66-rs-salvage-tug.js` | Salvagers' Sailing Tug | ancients-salvage | Ancient steel tug converted to gaff rig |
| 8 | `67-rs-xanadu-dragon.js` | Xanadu Dragon Boat | xanadu | festival racer; `rsDruk` is the thunder-dragon figurehead |
| 9 | `68-rs-iziz-dhoni.js` | Iziz Dhoni | iziz-vernacular | coaster, main and mizzen lateen |
| 10 | `69-rs-islander-oruwa.js` | Islander Oruwa | ringsea-islander | outrigger fishing canoe |
| 11 | `70-rs-islander-karakoa.js` | Islander Karakoa | ringsea-islander | war outrigger (double outriggers, tanja sail) |
| 12 | `71-rs-voth-chitin.js` | Voth Chitin Bireme | voth | bireme raider, carapace roof, Voth-blue fan sails, blue eyes |
| 13 | `72-rs-hyk-hexareme.js` | Hykkousoi Siege Hexareme | hykkousoi | three banks of great oars, towers, stone-thrower, boarding bridge |
| 14 | `73-rs-hyk-pearl.js` | Hykkousoi Pearl Baghlah | hykkousoi | pearling mother ship: diving booms, divers, oyster baskets |
| 15 | `74-rs-iziz-wheel.js` | Iziz Wheel Galley | iziz-vernacular | treadmill paddle-wheel warship (the wheels turn), orange trim, sun lateen |
| 16 | `75-rs-beast-rookery.js` | Beast-Rider Rookery Raft | beast-rider | trimaran roost tower for flyers (`rsFlyer`) |
| 17 | `76-rs-islander-lakatoi.js` | Islander Lakatoi | ringsea-islander | four-hull trading raft, twin pandanus crab claws |
| 18 | `77-rs-voth-hulk.js` | Voth Cargo Hulk | voth | cargo: bluff hulk, castles, hold of sacks, derrick, Voth-blue square sail |
| 19 | `78-rs-hyk-corbita.js` | Hykkousoi Amphora Corbita | hykkousoi | cargo: round-ship, swan sternpost, amphorae |
| 20 | `79-rs-xanadu-carrack.js` | Xanadu Bullion Carrack | xanadu | cargo: tiled castles, saffron wheel sails, bullion chests |
| 21 | `80-rs-iziz-lighter.js` | Iziz Salvage Lighter | iziz-vernacular | cargo: flat lighter of Ancient panels and pipe, A-frame derrick |

`ringsea-islander`, `beast-rider` and `hykkousoi` are culture tags this kit introduced; the rest reuse existing ones. Iron Republic, Dalab and Yuni have no ships here (landlocked or not seafaring).

## Taking one vessel to another world

Copy `40-rs-core.js`, `41-rs-tex.js`, `42-rs-hull.js`, `43-rs-rig.js`, `44-rs-parts.js`
(they need `canvasTex`, `TEX`, `MAT` from `core/materials/`, and `h3`/`rng`/`reseed`
from `10-core.js`), plus the vessel's own fragment. Then:

```js
const V = RS.defs.vothTrireme.build();   // {group, anims, deckY, oars}
V.group.position.set(x, 0, z); V.group.rotation.y = heading; scene.add(V.group);
// each frame: RS_U.uTime.value=t; rsRide(V.group, RS.defs.vothTrireme, x, z, heading, t, seaH); for (const f of V.anims) f(t);
```

`seaH(x,z,t)` is your sea's height; leave it out to ride the kit's own swell (`rsSeaH`). `RS_U.uTime` drives the sails' flutter.

See `API.md` for the vessel frame and the builders.

## Files

`src/00-30, 92, 93, 99` are vendored from `settlements/reedlake` (see `KNOWN_ISSUES.md`
for the two deliberate changes). `verify.py`/`jscheck.py` come from the same place, with
`_api.extra()` vessel invariants and a pre-installed-Chromium fallback.

## Faction colours

Iziz and Voth ships wear the liveries of `core/sockets/80-cultures.js` (on main): `RS_CULT`, `rsSymSun`,
`rsSymDiamond` and `rsFactionSail` in `41-rs-tex.js` are copies of those packs and symbols. Re-copy them if the packs change.
