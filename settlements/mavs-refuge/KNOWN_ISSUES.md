# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [x] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
  2026-10-01: ported. Roosts are centred between two gallery posts (30-layout); the landing lips are longer (main 3.0-3.6 m, hangar 3.6-4.2, satellite 2.2; 56-levels stores Ro.lipL); quetzals/archaeopteryx/dragonflies touch down on the lip ~2.5-3 m outside the post line, fold first, then walk in, and walk back out to the lip end to launch. Bats still fly in to hang from the ceiling, with shallow beats on the last 16 m (as Girder).
- [x] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
  2026-10-01: ported flyPursue / flyTryPeel / flyJoinRoute. Each circuit flyer gets a lap timer (Rookery circuits 150-420 s, patrols 260-700 s), then peels off onto a fresh arrival route (Rookery flyers home to the Rookery when it has room); perched beasts launch straight onto a short-handed circuit to refill it (one per circuit at night). Formations dissolve as flyers rotate, as in Girder.
- [x] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
  2026-10-01: ported. A bat launched in the evening or at night is owed a return 90-540 sim seconds later (flyBatDue); those still out at daybreak follow within ~2 minutes. The hour weights no longer favour bat arrivals at dawn. _flyers.batReturnHours / batsOut report it.
- [x] Flyers: rider lance stays on the saddle when the rider dismounts
  2026-10-01: the lance bone is parented to the rider's translate bone instead of the saddle, so it goes with him when he stands beside the beast and is hidden with him when only the saddle is left (same one-line fix made in Girder's copy of the model).
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [x] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
  2026-10-01: ported: the bark2 colour texture is pulled 30 % toward its luminance at load, and the far Prism gum trunks' palette tints 45 %.
- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
  2026-10-01: night floors cut (hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03) and the night fill turned cool blue-grey instead of a dimmed day colour (82-daynight); the giant's key 0.44 -> 0.18 x phase (21-sky); a full giant now cuts the lamps by 8 % instead of 28 %, so lamps, windows and fires are the main light. An eclipse keeps its own fill (DN_ECL_*) so it still reads as twilight. 21:00 lights: hemi 0.53 -> ~0.17, ambient 0.38 -> ~0.09, key 0.45 -> ~0.19. Same code in both builds.
- [x] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes) — fixed Oct 2026: it samples the flyers' legs against the REGISTER volumes, trunkR trunks, bridge segments and the ground, with two control legs that must hit (61 legs clear)
