# Boats, Ships, and Vessels Kit

Forty-one procedural vessels for the Ring Sea, river valleys, and exterior coasts, each tagged by culture, riding a live swell
on one sheet (a Gerstner swell with whitecaps, to the horizon) with their sails and pennants breathing in
the wind and their oars stroking. The **Under way** button (off by default, so the preset views stay put) sets
each row sailing a racetrack course with wakes, heeling into the turns and trimming to the wind; off again, they
run home to station in a few seconds. Walk mode (F) stands on the decks and rides with the ship. Built on the Ancients-lineage fragment contract
(`core/materials/` + vendored shell), one vessel per fragment.

```
python3 build.py                                    # -> dist/ringsea.html (deterministic; manifest in build-manifest.json)
python3 verify.py dist/ringsea.html --assert --views "Opening,Overview" --out shots
python3 verify.py dist/ringsea.html --views "Voth Ordinator Flagship" --out shots \
  --shot "aboard=()=>_api.walkAboard('vothFlagship',9,1.5,Math.PI)"   # --shot NAME=JS: pose, then screenshot
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
| 12 | `71-rs-voth-chitin.js` | Voth Chitin Bireme | voth | bireme raider, carapace roof, Voth-purple fan sails, blue eyes |
| 13 | `72-rs-hyk-hexareme.js` | Hykkousoi Siege Hexareme | hykkousoi | three banks of great oars, towers, stone-thrower, boarding bridge |
| 14 | `73-rs-hyk-pearl.js` | Hykkousoi Pearl Baghlah | hykkousoi | pearling mother ship: diving booms, divers, oyster baskets |
| 15 | `74-rs-iziz-wheel.js` | Iziz Wheel Galley | iziz-vernacular | treadmill paddle-wheel warship (the wheels turn), orange trim, sun lateen |
| 16 | `75-rs-beast-rookery.js` | Beast-Rider Rookery Raft | beast-rider | trimaran roost tower for flyers (`rsFlyer`) |
| 17 | `76-rs-islander-lakatoi.js` | Islander Lakatoi | ringsea-islander | four-hull trading raft, twin pandanus crab claws |
| 18 | `77-rs-voth-hulk.js` | Voth Cargo Hulk | voth | cargo: bluff hulk, castles, hold of sacks, derrick, Voth-purple square sail |
| 19 | `78-rs-hyk-corbita.js` | Hykkousoi Amphora Corbita | hykkousoi | cargo: round-ship, swan sternpost, amphorae |
| 20 | `79-rs-xanadu-carrack.js` | Xanadu Bullion Carrack | xanadu | cargo: tiled castles, saffron wheel sails, bullion chests |
| 21 | `80-rs-iziz-lighter.js` | Iziz Salvage Lighter | iziz-vernacular | cargo: flat lighter of Ancient panels and pipe, A-frame derrick |
| 22 | `81-rs-voth-junk.js` | Voth Merchant Junk | voth | cargo: the Voth bay junk (78c life ships), dark tarred hull, poop cabin, two raked masts under lavender battened sails |
| 23 | `82-rs-hyk-galleon.js` | Hykkousoi Sea Galleon | hykkousoi | warship/cargo: Voth's 58 m galleon as a Hykkousoi ship, beakhead, three-tier aftcastle, round ports, square courses and topsails, lateen mizzen |
| 24 | `83-rs-voth-ferry.js` | Voth Bay Ferry | voth | ferry: the canton ferry (78d), passenger cabin aft under a purple canopy, one square sail |
| 25 | `84-rs-voth-taxi.js` | Voth Water Taxi | voth | passenger: long slim taxi (78d), high curved prow, striped awning on six posts, boatman at the sweep |
| 26 | `85-rs-voth-barge.js` | Voth River Barge | voth | cargo: flat 50 m river barge (78d), deckhouse and forecastle house, stacked cargo, derrick, stern sweeps |
| 27 | `86-rs-voth-pleasure.js` | Voth Pleasure Barge | voth | state: gilded pleasure barge (78d), pavilion under an oxblood roof, canopied foredeck, purple sail |
| 28 | `87-rs-voth-dhow.js` | Voth Fishing Dhow | voth | fishing: the bay dhow (78e), forward-raked mast under a lateen, fish bin, nets and floats |
| 29 | `88-rs-islander-drua.js` | Islander Drua | ringsea-islander | warship/voyager: the Kautoan great double canoe, 31 m and 25 m hulls under one deck, thatched deckhouse, steering stage, one huge shunting crab-claw of pandanus with the white moon |
| 30 | `89-rs-islander-korakora.js` | Islander Kora-kora | ringsea-islander | royal war galley of the western isles: tall carved prow (frigate bird) and stern, double outriggers with 54 paddlers, canopied fighting deck, royal parasol, tripod mast and teal tanja |
| 31 | `89b-rs-islander-lanong.js` | Islander Lanong | ringsea-islander | pirate raider: beamy patchwork hull, scrap-iron plates, bronze swivel guns and a captured Republic gun on the bow platform, two tripod masts with patched tanja sails, trophies (other fleets' shields, a Xanadu swan head, a Voth flag under the moon) |
| 32 | `89c-rs-ark-catamaran.js` | cFlīt-qBōn Great Moon-Pool Ark-Catamaran | cflit-qbon | pelagic living ark: twin bitumen-caulked red-cypress hulls in Paktong sheaths around a 5x4 m Free-Dive Moon-Pool, four catechu crab-claw sails, nephrite storm-lights, bow tsunami gong and nephrite coupling hinges |
| 33 | `89d-rs-ark-smelter.js` | cFlīt-qBōn Paktong Phytomining Smelt-Barge | cflit-qbon | foundry catamaran: tuff-brick hearth, domed Paktong smelt-furnace burning blue-grey nickel-shrub ash, twin hide deck bellows, quench trough and white-copper ingot racks |
| 34 | `89e-rs-ark-tender.js` | cFlīt-qBōn Deep-Trench Vent-Harvester Tender | cflit-qbon | diving tender: sheerlegs capstan crane hoisting a weighted nephrite & bronze dive sled, 150 m lines, baskets of frost-coral and yellow sulfur, trailing hollow-water density floats |
| 35 | `89f-rs-ark-trimaran.js` | cFlīt-qBōn Fast Crab-Claw Scout Trimaran | cflit-qbon | scout trimaran: razor central hull with Paktong cutwater, curved aka floats, catechu crab-claw speed sail, bow harpoon-capstan and lashed giant red-cypress drift-timber |
| 36 | `89g-rs-ark-ward.js` | cFlīt-qBōn Coupled 3-Hull Chained Ark-Ward | cflit-qbon | floating village ward: three twin-hulled catamarans coupled via sawn green-nephrite ball-and-socket hinge-bridges, moored by a cyclopean Paktong and nephrite-ring trench chain |
| 37 | `89h-rs-hk-whaler.js` | Hueru-Kuran Whalebone Baidarka Whaler | hueru-kuran | whaling catamaran: twin Aleut/Kuril-Ainu bifid-jaw hulls in whale-rib and amber-oiled hide stitched with baleen, bleached leviathan rib-arch shelter, harpoon pulpit with nephrite toggle harpoons, hide floats and Jōmon flame-rimmed hearth |
| 38 | `89i-rs-ria-west-palace.js` | Lower-Ria Heartland Dynastic Palace-Barge | ria | royal palace-barge: 44 sweeps, dolomite-and-cobalt mosaic cypress forecourt, grand axial stair, silk-curtained porphyry audience hall, gilded aft rotunda dome and 5-headed gilded Uktena river-serpent prow |
| 39 | `89j-rs-ria-east-palace.js` | Upper-Ria Dynastic Swan-Prow Palace-Barge | ria | royal palace-barge: giant Crested Silver-Bronze Swan/Heron prow wrapping the bow with a chest balcony, striped sun-velarium, semicircular colonnaded upper courts and 36 silver sweeps |
| 40 | `89k-rs-ria-patrician-villa.js` | Ria Patrician Floating-Villa Barge | ria | patrician villa-barge: S-curved emerald-and-gold Sturgeon-Leviathan prow lunging toward a suspended gilded Ria-Amber orb, cypress court, pedimented porphyry banquet hall and gilded aft belvedere |
| 41 | `89l-rs-ria-noble-salon.js` | Ria Noble House State Salon Barge | ria | state salon-barge: crimson-and-gold filigree hull, gilded Bighorn-Ram prow and Kingfisher tail-stern, twelve gilded sweeps and vaulted canopy hung with billowing white silk curtains |

`ringsea-islander`, `beast-rider`, `hykkousoi`, `cflit-qbon`, `hueru-kuran` and `ria` are culture tags used here alongside the shared ones. Iron Republic, Dalab and Yuni have no ships here (landlocked or not seafaring).

## Taking one vessel to another world

Copy `40-rs-core.js`, `41-rs-tex.js`, `42-rs-hull.js`, `43-rs-rig.js`, `44-rs-parts.js`
(they need `canvasTex`, `TEX`, `MAT` from `core/materials/`, and `h3`/`rng`/`reseed`
from `10-core.js`), plus the vessel's own fragment. Then:

```js
const V = RS.defs.vothTrireme.build();   // {group, anims, deckY, oars}
V.group.position.set(x, 0, z); V.group.rotation.y = heading; scene.add(V.group);
// each frame: RS_U.uTime.value=t; rsRide(V.group, RS.defs.vothTrireme, x, z, heading, t, seaH); for (const f of V.anims) f(t);
// optional: V.group.userData.rsU.uRsTrim.value = rig angle (rad), .uRsFlag.value = pennant swing (0 = as built)
```

`seaH(x,z,t)` is your sea's height; leave it out to ride `WATER.heightAt` (core/water: `rsRide` is `WATER.ride` and `rsSeaH`
is `WATER.heightAt` since 2026-10-12, so the world needs core/water and an open surface for that). `RS_U.uTime` drives the sails' and pennants' flutter.
For a life layer, `95-rs-deck.js` (`rsDeckData`) turns any placed vessel into deck heights, a walk outline and obstacles.

See `API.md` for the vessel frame and the builders.

## Files

`src/10-core.js`, `12-stats.js`, `30-kit.js` and `99-tail.html` are vendored from `kits/ancients/src` (`build.py --vendor-check`;
`KNOWN_ISSUES.md` for the drift). The viewer shell (`00-head.html`, `92-camera.js`, `93-labels.js`, `verify.py`, `jscheck.py`) began as
Reed Lake's and is this kit's own until it moves onto `core/host` and the harness (`KNOWN_ISSUES.md`).

## Faction colours

Iziz and Voth ships wear the liveries of `core/sockets/80-cultures.js` (on main): `RS_CULT`, `rsSymSun`,
`rsSymDiamond` and `rsFactionSail` in `41-rs-tex.js` are copies of those packs and symbols. Re-copy them if the packs change.
