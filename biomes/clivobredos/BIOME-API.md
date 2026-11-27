# biomes/clivobredos: the kit's public surface

The Cliff Lungs (`PLAN.md`): native colonies, coral-like stacks of rings, that lie up the southern Inner Wall's face from the hyperjungle's cloud sea
to the paramo and breathe the jungle's air up through themselves. One object, `LUNG`, on the biome kits' contract (the Throne's and sedesert's shape):
its data half is `src/41-biome-lung-data.js` (`[G data]`: no THREE, no DOM; `tests/test-lung.js`), its drawing half `src/72-biome-lung.js`.

## The breath (the one state of the biome)

| Call | What |
|---|---|
| `LUNG.breath(t, W)` | -1..1 at clock `t` (days: `day + hour/24`, the sky's t) and weather `W {wet (.9), cloud (0), wind (7 m/s), summer (-1..1; else KCLOCK.season's), sun (0..1, the sun's disc not behind the giant: 1 - ATMOS.sunHidden(t))}`. The noon draw is 1, dawn .3, dusk 0, a clear winter night -.2 |
| `LUNG.engines(t, W)` | `{latent, solar, reverse, wind, summer, hour, b}`: the condensation engine (on the cloud deck's day, `ATMOS.deckLevel` with `LUNG.DECK`), the solar chimney, the winter reversal, the crest wind's suction |
| `LUNG.DECK` | `{high: 7.5, low: 15.5, lap, burn}`: the deck's day the host binds (`ATMOS.deckDay`) and the breath reads (`LUNG.deckK(hour)`) |
| `LUNG.atmAt(y)`, `LUNG.yAt(atm)` | the model's air law, 1.6 exp(-y/8000); the stage's y is the altitude |
| `LUNG.bandAt(atm)` | `{i, name, col (sRGB), atm0, atm1}`: the pressure band a ring is born in, 0.05 atm a band from 1.60, rising as the air thins |
| `LUNG.yield(bore, W)` | m3 of condensate a day a mouth weeps (3 m bore: 4.7; 6 m: 18.8); `LUNG.latentKW(bore)` the dawn's latent heat (290 kW); `LUNG.physics(o)` the stack (~195 Pa, 2.9 m/s at dawn, 9.4 in the sun) |
| `LUNG.hand(world, id)` | +1, or -1 for the mirror lung (one in forty by the hash) |

## The layout and its records

`LUNG.layout({scarp, ground, world, n, deckY, wind, clip, step, yTop, offMap, footK})` on a `KRELIEF.scarp` record's ravines and buttresses ->
`{lungs, mouths, bells, husks, lawns, sphincters}`:

- a lung `{id, on, line, r, wall, bore, pts (centreline tip to foot), hand, mirror, dead, young, live, cut, rings, len, atm0, atm1, mouth?, bell?}`;
- a ring `{id, lung, n, a, b (foot and tip ends), len (20-60 m), atm (the birth pressure), band (= LUNG.bandAt(atm).i), r, wall}`, foot first;
- a mouth `{id, lung, x, y, z, r, lean, live, mirror, yield, collar, well {x, z, r}}`; a bell `{id, lung, x, y, z, r, face, live}`;
- a lawn (the fall-out lawn downwind of a live mouth) `{id, lung, x, z, ax, az, len, w}`; a sphincter (every tenth joint) `{id, lung, x, y, z, r}`.

`LUNG.hazards(L)` -> core/hazard records (`{name, x, y, z, r, h, tags: {hazard}}`): the draw (`grab`) and the cold breath (`cold`) at the bells, the film
(`slip`) and the lip (`fall`) at the mouths, the mouth-maw's lie (`hunter`) at the wells, the sphincters (`pit`, trigger `weight`). The cycled ones
carry `stateFn: 'LUNG.breath'` (registered in `KHAZ.STATES` when core/hazard is on the page) and a seed `'<id>:<role>'`; `LUNG.roleK(role, b)` is
their state at breath b, and `LUNG.now()` the clock the host hands them (`[t, W]`).

`LUNG.sites(L)` -> `{format: 'krator-lung-sites', mouths, hamlet, stairs}`: the wells, the hamlet's place at the greatest live mouth and the stairs'
rests, plain data for `core/hamlet` (PLAN.md section 9, `LUNG_SITES`; the page sets `window.LUNG_SITES` and exports it as "sites").

## The drawing

`LUNG.build({layout, ground, normal, deckY, quality})` (72) draws the records: the rings as 10 m sub-segments of one unit tube whose ribs climb a
right-handed helix (x negated on the mirror lung), the bores, the sphincter joints, the mouths with their collars, combs and drip, the bells with
their holdfasts and fringes, the husks, and the breath meadows (fall-out lawns, dew coils, rime caps). The breath reaches the items through
`BIO.breathState(key).value` (core/biome's breath mode), which the host sets once a frame: `lungsheen`, `lungslack`, `lungdraw`, `lungcold`, `lungdrip`.
Nothing is emissive or additive: nothing glows. The skin's and bore's wet term is held to a band of rings (`LUNG.SHEEN_W`, a KHOOK layer;
`LUNG.sheenK(s, lag, w)` its arithmetic), and with `walk` (a KWALK) every drawn segment writes its bore's floor as a strip.

`LUNG.SPECIES`, `LUNG.PLANTS`, `LUNG.HARVEST`, `LUNG.byKey`, `LUNG.plantOfItem`, `LUNG.SPIRALS`, `LUNG.TAGS` are the contract's tables; every record is tagged
(climate, aridity, Koppen, spiral, harvest, `alien`, `breath`). `LUNG.buildStair(L, o)` (the Stair station's own, `stations/stair/73`) lashes a
lung-stair to the best live lung and lays a husk across a ravine.
