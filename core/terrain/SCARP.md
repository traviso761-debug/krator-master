# The scarp: `KRELIEF.scarp` and its published profile

A wall of given height along a polyline on a heightfield, with benches, ravines, buttresses, a talus foot and a rim (`38-core-relief.js`, `test-scarp.js`). It is
two things done together, as the owner asked on 2026-11-02: the core form the kits draw, and the same profile sculpted into the scale model, so a kit's face and the
model agree where the open world streams it.

## What the four kits draw (read 2026-11-02; none is converted)

| Kit | What is there | Its numbers on this form |
|---|---|---|
| shighlands (`src/45-host-stage.js`) | the one real scarp: `rimZ`, `landH`, `ravAt` | `h:760, run:1160, power:1.15`, three ravines of half-width 110-150; no benches, buttresses or talus |
| ehighlands (`src/...`, `rangeH`) | the dry range; the wet face is plan only | `h:470, run:1417, power:1.25`, its ribs a pair of noises, not buttresses |
| swhighlands | no scarp code: station 5's stage still owes `scarp`, `fan`, `wadi` | plan 4.1 km over ~8 km: `h:4100, run:8000`, `ravines.fan` for the fans |
| sedesert | the Inner Wall ramp, `mtnH`; benches on its river canyon | `h:900, run:1450, power:1.5`; benches `at:[.45]` is its `wallK` |

The one thing all four share is a power of a smoothstep. That is the face here: with no benches the profile is exactly `1 - smooth(0, run, d)^power` (`test-scarp.js`
holds it to shighlands' and ehighlands' lines), so a kit can move onto the form without its face moving, its noise and its warp apart.

## The form

```
const W = KRELIEF.scarp({pts: [[x,z],...], side: 1, h: 2500, run: 2600, power: 1.25, drop: false,
  benches: {n: 3, w: 140}, ravines: {n: 8, w: [110,180], head: [200,500], depth: [80,260], fan: {r, h}},
  buttresses: {sp: 900, amp: 150}, talus: {h: 180, reach: 900}, rim: {lip: 8, w: 60},
  warp: {amp: 60}, rough: .012, ends: 2600, seed})
y    = KRELIEF.shape(W, x, z, g)     // g the ground without the wall
part = KRELIEF.at(W, x, z)           // {part, d, s, share, i}; null on the plateau and the open floor
rock = KRELIEF.scarpRock(W, x, z)    // 0..1
```

`pts` is the RIM. `side` 1 puts the plateau on the side of n = (-uz, ux), u along the line. By default the ground is the floor and the plateau stands `h` over it;
`drop: true` is the other way (the ground is the plateau, as shighlands' is). Ravines and buttresses move the rim line itself (a ravine's head eats back into the plateau, a
buttress stands out into the floor), so every part follows them. `W.ravines[i]` and `W.buttresses[i]` carry a rim point and the way down (`x, z, nx, nz`): the Lungs'
centrelines, a creek or a walk read those. `KRELIEF.at` names `rim`, `face`, `bench`, `buttress`, `ravine`, `talus` and `fan`.

Each query walks every segment, and the sign comes from the nearest segment; a polyline with a sharp reflex corner can flip sides right on the corner. Keep corners over
about 90 degrees, and bake the result into a `KFIELD`, as a page's ground is baked.

## The profile, for the model's side

`KRELIEF.scarpProfile(W, n)` -> `{format:'krator-scarp-profile', version:1, h, run, power, side, drop, pts, d[], share[], benches, talus, rim, ravines, buttresses}`.
`golden-scarp.json` is one written out: the southern Inner Wall's stand-in (2.5 km over 2.6 km, three benches, talus, rim lip), rewritten by
`node core/terrain/test-scarp.js --write`.

`share` is what the model sculpts: **height over the floor = h x share(d)**, d the metres from the rim toward the foot. In closed form, faces numbered from the rim,
each falling from share `a` to share `b` over `r` metres from `d0`:

```
share(d) = a - (a - b) * smoothstep(0, 1, (d - d0) / r) ^ power      on a face
share(d) = the face above's b                                        on a bench, for w metres
talus(f) = h_t * smoothstep(reach, 0, f) ^ curve                     f = d - run; the ground is the higher of the two
```

Each face's `r` is its share of the fall times (`run` less the benches' widths). **Gemini: the model's cell is 2 km, so at 5.1 scale the wall is one or two cells wide:**
sculpt the rim line, the plateau, the floor and the `run` as this curve sampled at the model's cells, and leave benches, ravines and buttresses to the kit's inset
(they are finer than a cell), bar a ravine of a whole cell's width. The kit then reads the model on either side of the wall and draws the wall itself in a `KFIELD` inset: its
`pts` and `h` are the model's rim line and the height step at that line, so the two meet at the rim and at the foot. Only the record's `pts` and `h` need to travel. Nothing under
`tools/scale-model/` has changed for this.

## Adopting it

1. Take `38-core-relief.js` in the page's core list (most have it) and `core/rand`. A kit that does not call `KRELIEF.scarp` draws as before.
2. Make the record once, from the rim line and the kit's numbers. Keep it with the kit's plan: it is JSON.
3. Put it in the ground function (`KRELIEF.apply(ground, [W])`), usually over a `KFIELD` inset (`30-core-field.js`): "finer where the world draws finer".
4. Read `KRELIEF.at` and `scarpRock` for cover, strata and placement, never a second idea of where the wall is: the cliff gate (`BIO.cliffCheck`) still applies.
