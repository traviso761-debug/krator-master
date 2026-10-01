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
- [ ] The far impostors are the blob technique (icosahedron crowns on a lathe pole, 100-200
      triangles) for every species but the twist-candles, whose spires follow the hero's habit.
- [ ] The candelabra's columns are individual instances (40-80 per tree at lv 2): the
      heaviest thing per tree in the kit. A merged column fan per tree would halve it.
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's test structure still passes one list.
- [ ] The fauna is a first pass: the kites glide (no flap), the swifts follow a Lissajous
      swarm rather than a boid flock, the striders' legs are two rods swinging fore and aft,
      and the lizards never move. Nothing reacts to the camera.
- [ ] The floor's planters are cumulative-threshold ladders (`t<.22`, `t<.55` ...) rather
      than weighted tables; inserting a plant means re-deriving the thresholds after it.
      The bottle tree / desert rose and puya / agave builders could share a caudex and a
      rosette helper the way the fork and column trees do.

- [ ] TODO (the undercut lip): the ground's refinement is separable, so the 1.5 m columns and
      rows of the lip's window run the width of the whole map (~100k vertices more than the
      ~15k the window needs). A local patch of fine ground, stitched to the coarse grid's edges, would not.
- [ ] TODO: the cave's paint comes from the 19.5 m field cache, which reads the recessed
      heightfield: the cave and the cap's top are painted as Abyss wall (dark brown) rather
      than as the canyon floor above them, and the cave's interior shows no strata.
- [ ] TODO: `waterH` still reports the river's surface over the cave (canyonU < 1.1, x < RIM+40),
      so the cave floor counts as 63 m under water (it keeps plants off it; nothing else reads it).
- [ ] TODO: the cataract is a flat ribbon dropping off the lip; the water does not arc off the cap,
      and no spray rises from the cave's floor behind it.
- [ ] TODO: meshing and baking the undercut takes ~0.9 s at load, on the main thread; the finer
      ground's own cost is not measured.
- [ ] TODO: the wadi gorge could take alcoves (Shade's are the model); not started.
- [ ] The ground's detail texture is still projected on x-z (Shade's is triplanar now), so
      the gorge and butte faces may show vertical grain. Not checked here.
- [ ] THE RIVER IS NOT DRAWN FROM ABOVE. The ribbon's triangles (45, `idx.push(a,cc,dd,a,dd,b)`)
      wind clockwise seen from above, so they face down, and `MAT_WATER` is single-sided: every
      camera above the river culls it and sees the bed (the silt and the mud cracks), the reeds
      and candles standing on it. The pond's fan faces up and shows. Found while checking the
      candles' impostor (with the material made double-sided for one shot the teal river and the
      gorge's rapids appear). The fix is one line (wind it `a,dd,cc,a,b,dd`, or `side:DoubleSide`),
      not made here: it changes every river view and wants its own look at the ribbon's colours
      and at where the drawn ground's chords (below) rise through the water.
- [ ] The ground's 17.8 m triangles cut chords across the river's 2.6 m channel: up to ~1.5 m
      off terrainH on the banks. 55 of the 1665 hero candle columns float over the drawn ground
      (up to 0.43 m) and 164 end under it (none over 2 m tall: the mint feet and short side
      columns). The far spires carry a 1.5 m skirt for it. A finer strip of ground along the
      river would fix both (the lip's window shows the cost of doing it by refining the grid).

## Done

- [x] The twist-candles have a far impostor (`far:{spires:3}` on the species record;
      `spiresOf` / `farSpires` in 55), where past the mid radius they used to stop: three
      twisted three-sided spires (9 triangles each) set out as the hero sets its columns, rooted
      in the bed with the hero's top, so the part above the LOCAL water (`BIO.waterH`) is the
      hero's; a spire the water drowns is not built. The probe lays the spires out for every
      clump and checks them against the drawn ground ('candles: far spires neither float nor
      sink', two negatives). This spine runs the river, so no candle reaches the mid radius here
      (176 clumps, all heroes; the baked scene hashes the same as before); with the spine cut to
      the pond, 72 of 139 clumps are impostors (+1,638 triangles) and the candles run on.

- [x] THE UNDERCUT LIP. The canyon floor runs out as a sheer promontory to where the
      cataract leaves it (the Abyss face is ~8:1 there, too shallow for the water to clear it
      from the plateau's own edge: the fall used to start 30 m out over air), and a cave is
      carved under its 18 m cap behind the curtain (`core/terrain/36-core-carve.js`). The
      ground is refined to 1.5 m in a window round the lip. Checked, with negatives: the
      curtain leaves from rock and stays clear of it, the cave is open under rock, nothing
      grows under the cap, no camera inside rock. Views: 'The undercut lip', 'Behind the cataract'.

- [x] A cluster (`around()` in 60-floor: reeds, grass, stones...) tested the mask at its
      centre only, so a reed clump at a reserved place's edge put outliers inside it (Shade's
      canyon watch). Each satellite now tests the mask itself.
- [x] Carve patches (`BIO.carve`, now shared in `core/terrain/36-core-carve.js`): alcoves,
      niches and undercuts on the heightfield, meshed by surface nets with baked occlusion
      and hood shadow. Shade uses six.
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
