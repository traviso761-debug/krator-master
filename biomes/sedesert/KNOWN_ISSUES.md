# Krator biome kit — the eastern high desert: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/sedesert.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The scene is ~12.1M triangles / ~534k instances at q=1 (baseline.json),
      built in ~5.4 s: 8.3k trees, 6.8k of them heroes along a spine that runs the whole
      river, and ~1.9k animals. The probe's ceilings (12.8M scene, 7.0M per pass) are the
      measured numbers, not a target; the abyss kit ran at 7.4M. `SEDESERT.build({quality:.6})` is the knob.
      The heaviest items: the fork trees' tufts and limbs, the candelabras' columns, the
      spinifex hummocks, the floor's stones.
- [ ] The Inner Wall's slope is a sketch: 900 m of ramp with ridges, quiver trees and
      agaves on it, and the wall proper painted on the sky dome. The foothills are meant
      to be their own kit.
- [ ] The zone weights (SEDESERT.zones) are thresholds on the ten fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] The river's water is a ribbon of fixed half-width (12 m) at WL(x); the channel
      is cut 2.6 m below the floor so the ribbon's edges hide under the banks. A world
      whose channel is wider must widen the ribbon (45-host-stage, `HW`).
- [ ] The cataract's plunge pool is a flat fan at -703 m with the Abyss floor's rocks
      standing out of it; the rapids are foam in the ribbon's vertex colour, not geometry.
- [ ] The strata (35-core-strata) are colour only: harder beds do not stand out as
      ledges and soft ones are not recessed (that needs the heightfield's profile to read
      the column), and the Abyss cliff and the mountains still get the painter's coarse bands.
- [ ] The far impostors are the blob technique; the twist-candles stop at ~1.3 km from
      the LOD spine instead of becoming impostors (they stand in water, which no impostor
      reads).
- [ ] The candelabra's columns are individual instances (40-80 per tree at lv 2): the
      heaviest thing per tree in the kit. A merged column fan per tree would halve it.
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area (inherited).
- [ ] The fauna is a first pass: the kites glide (no flap), the swifts follow a Lissajous
      swarm rather than a boid flock, the striders' legs are two rods swinging fore and aft,
      and the lizards never move. Nothing reacts to the camera.
- [ ] The floor's planters are cumulative-threshold ladders (`t<.22`, `t<.55` ...) rather
      than weighted tables; inserting a plant means re-deriving the thresholds after it.
      The bottle tree / desert rose and puya / agave builders could share a caudex and a
      rosette helper the way the fork and column trees do.

## Done

- [x] A cluster (`around()` in 60-floor: reeds, grass, stones...) tested the mask at its
      centre only, so a reed clump at a reserved place's edge put outliers inside it (Shade's
      canyon watch). Each satellite now tests the mask itself.
- [x] Carve patches (36-core-carve, `BIO.carve`): alcoves, niches and undercuts on the
      heightfield, meshed by surface nets with baked occlusion and hood shadow. The ideal
      host declares none (the cataract's lip is a candidate); Shade uses six.
- [x] The strata's colour pass: a warmer palette (buff bleached bands, purple-brown shales,
      rare grey-green reduced beds), colour drifting along each bed, varnish hanging from the
      bed tops, sand on ledges, an optional bleached cap and dust at a foot.

- [x] The strata are the core's bedded-rock shader (35-core-strata): beds of irregular
      thickness that dip and warp, laminae, cross-bedding and varnish streaks, instead of
      six level 3.4 m bands. Shared with settlements/shade (its ground and its carved stone).
- [x] Rocks scattered round a grid point (stones, boulders and their lichen, hoodoos and
      their apron stones) now test the host's mask at their own position (`putRooted` in 60):
      the grid tested only the centre, so a cluster spilled into the water here and onto
      the cliffs in Shade. The random draws are made either way, so nothing else moves.
      Found by Shade's `no-flora-on-cliffs` check (settlements/shade).
- [x] Fauna: kites, swifts, striders and lizards on the contract (75), driven by BIO.tick.
- [x] The quality pass (NOTES.md): typed stores, memoised terrain, BIO.col, data-driven
      impostors, a pass table, shared helpers, host hooks for register / lod / windows.
- [x] The dragon tree forks six times into a filled umbrella (tufts between the tips as
      well as on them); a mid-range one forks four times with bigger tufts.
- [x] Bottle trees, desert roses, puyas and agaves become impostors past the mid radius;
      the cataract has a plunge pool and spray at the lip; the gorge has rapids.
- [x] A descending river: the core carries `waterH` / `depth`, the host's mask and the
      shallows passes read it, the pond sits at its own level.
- [x] The canyon floor is flat across the canyon relative to the water (the floor's
      undulation is suppressed inside the walls), so the riparian floor never floods.
- [x] The grid tests the acceptance before the host mask: the zone passes over a
      6.8 km disc no longer pay two terrain calls per rejected cell.
- [x] The water-bound passes (palms, candles, reeds in the shallows, the near floor
      band) are windowed to the river strip and the pond.
