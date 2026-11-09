# kits/ancient-transit: API

Two globals: `KTRANSIT` (the records and their drawing; `src/40-57`, read in place) and `KratorTransitFurniture` (the furniture closure,
`transit_bundle.furniture()`). Frame: world metres, y up; a `yaw` is three's `rotation.y` (the front, +z, turns to `(sin yaw, cos yaw)`); a
`side` of +1 is toward `(cos yaw, -sin yaw)`, -1 the other way. Every record is plain JSON; every id is stable.

## The data side (`[G data]`: no three.js, no DOM; `tests/test-transit.js`)

| Call | Returns |
|---|---|
| `KTRANSIT.path(pts, {ground, radius, step, shift})` | `P`: `pts` (filleted), `seg [{x0, z0, x1, z1, s0, s1, len, yaw}]`, `L`, `S X Z YG YAW` (one a sample), `at(s) -> {s, x, z, yaw, yG}`, `lateral(s, off) -> [x, z]`, `project(x, z) -> {s, off, d}`. `pts` are `[[x, z], ...]` (two or more); `ground(x, z)` is required; `radius` fillets the corners (0 none); `step` 4 m; `shift(x, z) -> [dx, dz]` carries every point of the line as the land was carried (an earthquake's slip: the line bends and breaks at the fault) |
| `KTRANSIT.profile(P, {mode, clearance, window, above, maxGrade, lift})` | `{Y, at(s)}`: `mode 'deck'` is the highest ground within `window` of each sample plus `clearance`; `'grade'` the ground plus `above`; `lift(s)` a floor to clear (a crossing); the grade is limited both ways by raising only |
| `KTRANSIT.intersections(P, Q)` | `[{sP, sQ, x, z, yawP, yawQ}]` where `P` crosses a path or a polyline `Q` |
| `KTRANSIT.highway(pts, o)` | `H` (below). `o`: `id` ('hw'), `seed`, `ground` (required), `clearance` 9, `span` 24, `width` 18, `lanes` 4, `maxGrade` 0.05, `radius` 80, `lampStep` 36, `ruin` (span shares, or a function of s), `rampRuin`, `ramps [{s, side, dir: 'off' | 'on', grade 0.06, tail 80, width 7.5}]`, `over [H...]` |
| `KTRANSIT.overgrow(L, level, seed, salt)` | soil and plants on a line's spans (the highway's `o.overgrowth`, the elevated line's): `level` 0..2 or a function of s; 1 patchy (mounds along the edges, bushes and grass on them), 2 a bed across the deck with creepers down its sides. Writes `span.growth = {level, cover, depth, plants: [{kind: bush | grass, lat, up, along, x, y, z, r, h}], creepers: [{side, along, len, w}]}`; a host plants its biome kit's species at the plants' `x, y, z` and passes `plants: false` to the draw |
| `KTRANSIT.spanToWorld(S, lat, up, along)` | a point in a span's frame (standing, or its fall when collapsed) in the world |
| `KTRANSIT.cull(H, blocked(x, z, r) -> bool)` | the piers whose footing (r 2.6) is blocked go (`state 'none'`), the spans they carried are `gone`, the ramps' too; returns the count |
| `KTRANSIT.rail(pts, o)` | `R` (below). `o`: `id` ('rl'), `seed`, `ground`, `elevated` false, `gauge` 1.6, `width` (5.2 at grade, 7 elevated), `radius` 160, `maxGrade` (0.03, 0.04), `clearance` 8, `span` 20, `ruin` (span shares), `railRuin`, `streets [{id, pts, width}]`, `signalStep` 300, `tieStep` 0.65, `catenary` false, `stations [s...]`, `stationRuin` |
| `KTRANSIT.subway(pts, o)` | `SW` (below): a bored twin-track tunnel under the ground in 20 m sections (`intact | cracked | collapsed | silted`), cut-and-cover stations (a hall with side platforms, columns, a roof; benches, bins and signs on the platforms; a stair entrance up to the street at each end, `intact | ruined | choked`; `intact | ruined | collapsed` as a whole), vent heads, and what the host carves into its ground: sinkholes over the collapsed sections, a void down to the hall floor over a fallen-in station, the stair pits. `o`: `id` ('sw'), `seed`, `ground` (the host's ground WITHOUT the carving), `depth` 11 (the floor below the ground), `radius` 4.2, `section` 20, `maxGrade` 0.04, `radiusTurn` 150, `gauge` 1.6, `tracks` [-2, 2], `ruin` (`KTRANSIT.RUIN.subway`), `stations [s...]`, `stationRuin`, `stationStates [state...]`, `ventStep` 150 |
| `KTRANSIT.sinkholeH(SW, x, z)`, `KTRANSIT.carved(SW)` | the depression the host adds to its ground at (x, z) (0 away from the carving), and the list of what is carved (`{x, z, r, k?}`: where a ground mesh refines itself) |
| `KTRANSIT.war(street, o)` | `W` (below): the war along a street by one number, `o.damage` 0..1 or a function of s: 0.1-0.3 a riot (scorch marks, glass and cable, bins and benches overturned and burnt, barricades dragged across the road), 0.3-0.7 shelled (craters with rims of rubble and slabs thrown), 0.7-1 bombed to smithereens (craters overlapping, nothing standing). `o.military` (true, or a share of the slots) adds abandoned positions every 180-300 m: checkpoints (barriers staggered across, a boom, a sentry hut, sandbags, wire), emplacements (a sandbag U facing the road, tank traps, wire), posts (a watchtower, sandbags, wire); `o.positions [s...]` puts a checkpoint there (a crossing). `o.seed`, `o.step` 10 |
| `KTRANSIT.craterH(W, x, z)`, `KTRANSIT.inCrater(W, x, z, pad)` | the depression the host adds to its ground: a bowl `(1 - q^2)^2` deep inside each crater, a low continuous rim over its edge; whether a point lies in one |
| `KTRANSIT.road(pts, o)` | `Rd`: a road at grade as a graded alignment (`o.maxGrade` 0.08, `KTRANSIT.profile` 'cutfill': it cuts a hill and fills a dip), `yAt(s)`, `levelAt(x, z)` (the surface's height anywhere: the alignment, lower where the ground is carved under it), `segs` with each one's `fill` (+ a fill, - a cut), and `drifts` (`o.drift` 0..1 or a function of s: the road under sand, each a wedge from a kerb `reach` across, `depth` deep). `o`: `id`, `ground` (required), `width` 11, `pavement` 3.5, `shift`, `radius` 40 |
| `KTRANSIT.lineH(L, x, z, {form, slope})` | the cutting a host carves for a graded line (a road record, a rail at grade): 0 where the line is on or over the ground, else the ground taken down to `form` under the line's level (0.1 for a road; a rail passes 0.45, its ballast) across its half width plus the pavement, the sides at 1 : `slope` (2). Fills are drawn by the kit (a road's embankment, a rail's ballast body) |
| `KTRANSIT.quake(o)` | `Q` (below): an earthquake's fault across the page: `o.pts` (the fault's polyline), `o.throw` (the side +1 lifted, m, 3), `o.width` (the scarp's ramp, 6), `o.slip` (the lifted side carried along the fault, m, 5), `o.twist` (the land turned about the fault, rad at the fault, 0.05), `o.buckle {amp 0.8, wavelength 32, reach 90}` (the ridges the land buckled into beside it), `o.reach` (how far the shift and twist die out, 120) |
| `KTRANSIT.quakeH(Q, x, z)`, `KTRANSIT.quakeShift(Q, x, z)`, `KTRANSIT.quakeRoll(Q, x, z)` | the land's rise at (x, z); where the point was carried `[dx, dz]`; the roll a structure standing there takes (rad). A host adds `quakeH` to its ground, and hands `shift: (x, z) => KTRANSIT.quakeShift(Q, x, z)` and `quake: Q` to the lines, the streets' dress and war and the road's drawing, so paths bend and break at the fault, spans and piers lean, and the surfaces follow the scarp |
| `KTRANSIT.train(R, o)` | `Tn` (below). `o`: `id`, `s` (the head), `kind 'freight' | 'passenger'`, `cars` (a count, or a list of `loco box tank flat coach`), `state 'standing' | 'derailed' | 'fallen'`, `from` (the first car off), `burnt` 0.4, `seed`. Throws when the train does not fit behind `s` |
| `KTRANSIT.dress(street, o)` | `D` (below). Lamp standards every 30 m on alternating kerbs with their arms over the carriageway; the kerb kinds by weight, facing the street; a gantry or a footbridge across it every 120 m or so, spanning it pavement to pavement (`piece.span`); rubble heaps on it. `street {id, pts, width, ground}`; `o`: `seed`, `space` (a KSPACE index, made when absent), `blocked(x, z, r)`, `step` 8, `ruin` (furniture shares), `kinds {kind: weight}`, `rubble` 1.5 a 100 m, `across` true, `pavement` 3.5, `only [kinds]` |
| `KTRANSIT.dressGrid({ground, x, z, seed, pitch, variant})` | every kind in every state on a grid: `{pieces, cols, rows, w}` |
| `KTRANSIT.pick(seed, kind, state, shares)` | `{kind, state, variant, seed}`; `state` null draws by the shares among the kind's states; an unknown kind or state throws |
| `KTRANSIT.ruinOf(seed, kind, state)` | the ruin numbers a build reads: `lean, leanDir, kink, kinkMore, fallYaw, fallSide, fallAxis, crush, sink, soot, glass, rust, own` |
| `KTRANSIT.shares(spec, allowed)` | `pick(u)` over `{state: share}` summing to 1 (else throws), restricted to `allowed` and renormalised |
| `KTRANSIT.KINDS`, `KIND_KEYS`, `STATES`, `SPAN_STATES`, `RAIL_STATES`, `STATION_STATES`, `PIER_STATES`, `CAR_STATES`, `RUIN`, `CARS` | the vocabularies, the defaults, the car sizes |

### The records

```
H  { id, kind: 'highway', seed, path: P, width, lanes, span, clearance, deck (1.4), cap (0.9), deckY: [..], deckAt(s), L,
     spans: [{ id: 'h1.s12', i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, pitch, width, lanes, state, barriers: [side -1, side +1],
               crack: { side, depth } | null, fall: { x, z, y, yaw, pitch, roll } | null, lamps: [{ id, s, x, z, y, yaw, side, state, seed }] }],
     piers: [{ id: 'h1.p12', i, s, x, z, yG, yTop, h, state: standing | bare | stub | fill | none, cap, stub, yaw }],
     rubble: [{ id, x, z, y, yaw, w, h, d, tilt }],
     ramps: [{ id: 'h1.r0', dir, side, s, path, deckAt(s), width, spans, piers, rubble, road, L }],
     roads: [{ id, pts: [{ x, z, y }], width, yaw }], crossings: [{ s, x, z }] }
R  { id, kind: 'rail', elevated, seed, path, gauge, width, deck (1.0), deckAt(s), railAt(s), carried(s), L,
     beds: [{ id, i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, fillH, state: intact | cut }]          (at grade)
     spans, piers, rubble                                                                             (elevated; the highway's shapes)
     rails: [{ id, i, s0, s1, state: intact | bent | gone, bend }], ties: [[s, 0 | 1 gone | 2 burnt], ...],
     crossings: [{ id, s, x, z, y, yaw, streetYaw, width, state: intact | broken, street, gates: [{ x, z, yaw, side, arm: up | down | broken }] }],
     signals: [{ id, s, x, z, y, yaw, side, state: intact | bent | fallen }], catenary: [the same, masts every 50 m],
     stations: [{ id, s, s0, s1, x, z, y, yaw, len, state, platforms: [{ side, w }], canopy: { h, w, state },
                  stairs: [{ id, s, x, z, y, yG, yaw, side, end, state: intact | ruined | collapsed }] }] }
SW { id, kind: 'subway', seed, path, L, radius, width, gauge, tracks, floorAt(s), railAt(s), axisAt(s), deckAt (= floorAt),
     sections: [{ id: 'sw.t12', i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, pitch, state, inStation, silt }],
     rails: [{ id, i, track, off, s0, s1, state: intact | bent | gone, bend }],
     stations: [{ id: 'sw.st0', s, s0, s1, x, z, y, yaw, len (80), hallW (16), hallH (6), state, platforms: [{ side, from, to }], columns: [{ along, side, lat, state }],
                  furniture: [{ kind, state, variant, seed, lat, along, x, z, y, yaw }],
                  entrances: [{ id, s, x, z, y, yaw, side, end, state: intact | ruined | choked, rise, flight: { run, w }, passage: { from, to, h, w } }] }],
     vents: [{ id, s, x, z, y, yaw, side, state: intact | ruined | fallen }],
     sinkholes: [{ id, x, z, r, depth, section }], voids: [{ id, x, z, yaw, len, w, drop, ramp, station, r, k }], pits: [{ id, x, z, yaw, w, run, rise, along, r }] }
W  { id, kind: 'war', seed, path, damageAt(s), craters: [{ id, s, x, z, r, depth }], scorch: [{ id, x, z, r }],
     pieces: [{ id: 'avenue.w7', kind, state, variant, seed, x, z, y, yaw, s, r, role: heap | strewn | barricade | position }],
     rubble: [{ id, x, z, y, yaw, w, h, d, tilt }], positions: [{ id, kind: checkpoint | emplacement | post, s, x, z, yaw, side, pieces: [ids] }] }
Q  { id, kind: 'quake', path (the fault), throw, width, slip, twist, buckle: { amp, wavelength, reach }, reach, L }
Tn { id, kind, state, line, s, L, cars: [{ id, k, kind, s, x, z, y, yaw, roll, pitch, len, w, h, state: ok | derailed | overturned | fallen, burnt, off, seed, load }] }
D  { id, path, length, slots, skipped, pieces: [{ id: 'avenue.f3', kind, state, variant, seed, x, z, y, yaw, side, s, r, span? }] }
```

A span's `y0, y1` are the deck's TOP at its ends; the deck is `deck` metres thick under it; a pier's `yTop` is the deck's underside. A
collapsed span's `fall` is where its middle lies (`y` the ground there). A ramp's spans and piers are the highway's shapes, 7.5 m wide, one
lane; its `road` is the surface at grade from its landing. A rail at grade: `deckAt` is the ballast top, `railAt` the rail head (+0.2);
elevated: the guideway's top and +0.24. A car's `x, z, y` is under its middle at rail level (an overturned or fallen one lifted by half its
width, so its side rests on the ground), its `yaw` the heading, `roll` about that axis.

## The drawing side (`[draw]`: three.js)

| Call | Returns |
|---|---|
| `KTRANSIT.mats()` | the library materials by family (`asphalt concrete pave steel rust paint white ballast rubble corrugated glass glow line`; `metal` is steel, `soil` rubble), from `KMAT.packed('ancient-transit', fam)` with the repeat `1 / scale`; without the pack, plain vertex colours |
| `KTRANSIT.builder()` | `B`: `quad(fam, A, B, C, D, col, {uv, face})`, `tri`, `box(fam, matrix, w, h, d, col, {centred, noBottom})`, `sweep(fam, profile, frames, col, {caps, open, u0})` (a closed profile `[[lat, up]...]` listed clockwise, swept along `THREE.Matrix4` frames or `{x, y, z, yaw, pitch, roll}`), `strip(fam, L, R, col)`, `cyl(fam, a, b, r, col, seg)`, `mesh(fam, mesh, matrix, {col, mul})`, `finish(name, {mats}) -> Group` (one mesh a family, `userData.tris`) |
| `KTRANSIT.frame(x, y, z, yaw, pitch, roll)` | a `THREE.Matrix4` (local +z along, +x to side +1, +y up; pitch climbs) |
| `KTRANSIT.rgb(hex)`, `KTRANSIT.COL` | linear `[r, g, b]` from sRGB; the kit's palette |
| `KTRANSIT.skin(group)` | a furniture group's meshes given the library materials by `userData.family` |
| `KTRANSIT.draw.highway(H, {furn, shadow})` | a `Group`: the decks, barriers, lane paint, piers, embankments, ramps and their roads, the lamp standards (from `furn`, the furniture bundle; none without it), the rubble (one instanced mesh); `userData {tris, spans, piers, lamps, rubble}` |
| `KTRANSIT.draw.line(B, L, o)`, `draw.road(B, road, ground, {pavement})`, `draw.rubble(list, o)`, `draw.growth(B, S, M, L, {plants})` | the parts, into a builder; `growth` draws a span's soil, stand-in plant domes (`plants: false` leaves them to the host) and creepers |
| `KTRANSIT.draw.rail(R, {shadow})` | a `Group`: beds, sleepers, rails, crossings, signals, masts and wire, or the guideway, piers and stations; `userData {tris, ties, rails, crossings, stations}` |
| `KTRANSIT.draw.subway(SW, {furn, shadow})` | a `Group`: the tunnel lining (two-sided, facing inward; the lower half under a rubble mound where it fell in; silt on the floor where it silted), ring beams, the floor slab, the rails on plinths, the cable tray and dead lamp strip, the stations (hall, platforms, screens, columns, roof whole, holed or fallen in slabs, the kit's furniture, the stair entrances with canopies and kerbs, the passages), the vent heads |
| `KTRANSIT.draw.war(W, {furn, shadow, err})` | a `Group`: the scorch marks (rings on the ground), the crater rims and thrown slabs (one instanced mesh), every piece (merged). The craters are the host's ground: add `KTRANSIT.craterH` to it |
| `KTRANSIT.draw.train(Tn, {shadow, gauge})` | a `Group`, one car after another in their records' frames |
| `KTRANSIT.draw.dress(D, {furn, shadow, err})` | a `Group`: every piece built by the bundle and merged, one mesh a family; `userData {tris, pieces, failed}` |
| `KTRANSIT.draw.street(street, D, {furn, pavement, shift})` | the road surface (asphalt in bands every 3 m, so it follows the ground into the craters and over a fault's scarp; lines, pavements, kerbs; `shift` carries its points as the land was carried) with the dress under it |

## The furniture bundle (`KratorTransitFurniture`)

```js
const g = KratorTransitFurniture.build('tr_lamp', { state: 'bent', variant: 1, seed: 7, linear: true, span: 0 });   // null for an unknown kind; a state the kind has not throws; span: a gantry's or footbridge's length across the street
g.userData   // { kind, state, variant, seed, tris, box: {min, max}, ruin, w, d, h }; one mesh a family, each with userData.family
KratorTransitFurniture.list()           // [{ key, name, w, d, h, variants, states, where }]
KratorTransitFurniture.dims(kind, v)    // the declared box
KratorTransitFurniture.materials(fam)   // the plain material a family gets before a host skins it
```

The piece's origin is its footprint's centre on the ground, +z its front (a bench faces +z, a lamp's arm reaches +z). Vertex colours are
LINEAR by default (every Krator page renders with `outputEncoding` sRGB); `{ linear: false }` keeps sRGB. UVs are planar in metres (the
dominant axis of each face), so the library's maps lie on it with a repeat of `1 / scale`. The military kinds (`KTRANSIT.MILITARY_KINDS`: `tr_sandbags` (a wall; v1 a U), `tr_sentry` (a hut; v1 a watchtower), `tr_boom`, `tr_hedgehog`, `tr_wire` (v1 two coils)) are laid by `KTRANSIT.war`, never by the dress. The ruin pass (`transit-furnish.js` header): `bent`
leans about a hinge near the foot and kinks above `kink` of the height; `fallen` lies the piece down about its foot and sets it on the ground;
`crushed` scales the height, spreads and sinks it (a pole's `crushed` is a stump sheared at its foot, drawn by the piece); `burnt` soots every colour and
takes the glass; every ruined piece's metal goes to the rust family, every colour toward rust-brown and grime (the intact ones too: a thousand years). A kind draws its own differences from `F.ruin` (a lamp's cable out, a cabinet's doors off, a dead bush, a footbridge's fall).

## Adding a kind

One row in `KTRANSIT.KINDS` (`src/40-tr-records.js`: the box, variants, states, where it stands, its ruin numbers) and one `TR_ASSET(key,
build)` in `krator-transit-furniture.js`, colours by palette key, families by name. `tests/test-furniture.js` builds it in every state and
checks its box; `KTRANSIT.dressGrid` puts it on the block.
