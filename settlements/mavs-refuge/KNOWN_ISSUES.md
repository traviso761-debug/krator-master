# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [ ] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
- [ ] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
- [ ] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
- [ ] Flyers: rider lance stays on the saddle when the rider dismounts
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [ ] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
- [ ] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
- [x] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes) — fixed Oct 2026: it samples the flyers' legs against the REGISTER volumes, trunkR trunks, bridge segments and the ground, with two control legs that must hit (61 legs clear)
