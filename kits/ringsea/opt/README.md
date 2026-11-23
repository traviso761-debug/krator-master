# Ring Sea opt-in vessels: the Realm of Dalab's lake hulls

Three procedural vessels built on the `kits/ringsea` contract (`40-rs-core.js`, `41-rs-tex.js`, `42-rs-hull.js`, `43-rs-rig.js`, `44-rs-parts.js`, seeds `74100..74300`) for Dalab's basin on the West Rift's great lake and the Chimes Riba (`settlements/nulab/PLAN.md` sections 6, 7 and step N4):

- `90-rs-dalab-ferry.js` (`dalabLakeFerry`): 24 m two-masted lake ferry crossing the 54 km between Nulab and Ledge's lifts.
- `91-rs-dalab-barge.js` (`dalabGrainBarge`): 38 m bluff grain, tithe and copper barge with salvaged Line strakes and derrick rig.
- `92-rs-dalab-skiff.js` (`dalabFishingBoat`): 14 m double-ended lake and Chimes Riba fishing skiff under a dipping lug sail.

Opt-in (`core/hamlet/dalab` pattern): sitting in `opt/` keeps `kits/ringsea/dist/ringsea.html` byte-identical until the kit incorporates Dalab, while `settlements/nulab/build.py` seals `kits/ringsea` core and these three fragments in `gen/69n4-nl-ringsea-bundle.js`.
