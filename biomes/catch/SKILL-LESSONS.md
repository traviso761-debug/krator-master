## 5v. A dry basin as four stations on the shared sky: flats that read, walls in the same air (the Catch, Oct 2026)

The Catch is the sealed basin south-east of the Godthrone (`biomes/catch`): ~18 mm of rain, walls of 10-17 km on every
horizon, five oases. Four stations on one kit (the sand sea, Stair's oasis, the soda lake and its wind-cut lake beds, the
north fan), on the shared sky, `core/water`, `KBASIN` and `KSTACKS`. What held up, and what the owner's review caught:

- **Start from the nearest finished stage, and borrow a kit's species by trimming its passes, not by forking it.** The
  sand sea's host came from `biomes/nsemiarid` (a heightfield stage, `KBASIN`'s lake marks, a field cache, the painted
  ground over the library's layers); the stations from Korona's `build.py --station`. The eastern desert kit was read in
  place at the oases for its palm and mesquite only: filter its public `PASSES` to those species before its build, and
  hand it zone fields that switch its scrub off (`dune` 1 inside its mask) while it builds, then restore the page's. Its
  registry is closed by its fauna fragment: if you skip that fragment, call `BIO.kitEnd(KIT)` yourself.
- **Write the stage contract once and keep each station to one file.** A station is a `45b-host-stage.js`: the land,
  `waterH` from the same records the water draws, a field cache, `bindStage(...)` (fields, mask, `BIO.init`) and a `STAGE`
  object (the sky's site and ridges, the ground's paint and layers, the water records, `views(gh, nearTree)`, `expect`).
  The four stations then cost a few hours each, and every shared fix (the ground shader, the sky, the checks) reaches all
  four with one `build.py --all`.
- **Flat ground needs more than a texture to read from distance.** The owner: the lake and soda bed read as a blank blob
  from far, middle and even semi-close range. Three causes, none a missing texture: the crust sets were pale and low in
  contrast; the ground shader faded every layer's grain to the painted colour past 60 m (fine for a forest floor under
  trees, fatal for a salt flat); and the painted colour had no large-scale variation. The fixes, in this order: pack the
  pale sets with `tint.contrast` 1.3-1.7; past ~25-220 m read each layer from a second tap six times coarser instead of
  fading it (a crust's polygons hold as big shapes); mottle the painted colour at two large scales. Judge a flat from 300
  m and from 2 km, not only from the preset at 3 m.
- **Depth between near and far is the haze, and the walls must stand in the same air.** The owner asked for more contrast
  between near and far dunes, then for the haze on the far mountains too. Thicken the station's fog (2-3x the old
  default in dense air) and a lower sun (15:00-16:00) carve the dunes; then give each sky ridge a target share of haze
  (`hz`: far crests ~.7, inner walls ~.5, near hills ~.3) and compute its haze factor from the fog and its distance
  (`-ln(1-hz)/(dist*fog)`), so walls and dunes fade by one law. A raw ridge `haze` of 1 at 60-300 km saturates (the walls
  vanish into a grey band); scaling it down to keep them crisp makes them look pasted on.
- **A slab under the walls has three usual causes; find which before tuning.** In the haze a far wall turned into a flat
  grey or tan slab. Toggle the sky's ridge layers one by one (`SKY.uniforms.uRidgeN`, re-set after each `SKY.update`)
  and hide suspects, rather than retuning blind: here it was (1) a fixed **snowline**, dead level at 35 km, the hazed snow
  above it the colour of the sky, so only a flat-topped rock band read (raise `snowH` so only the peaks carry snow); (2) a
  ridge profile whose averaged noise varies a degree on a five-degree body (keep the mean, double the amplitude, lower
  the base, more cycles and peaks); (3) the **void past the ground mesh** from a high camera, which the ridges fill down to
  the horizon (a far apron ring of plain ground to 200 km, in the floor's colour, under the same fog, and a camera far
  plane to match). A ground mesh still rising at its edge is cut into a straight top too: give a mountain front a crest
  inside the map and a fall behind it.
- **Check the sky at the station's own site and hour before choosing the hour.** The shared sky put the giant's eclipse
  over these sites from ~08:00 to ~10:00 on day 0, so a 10:00 page rendered at dusk. Print `ATMOS.skyState(siteAt(px, py),
  h, 0)` in node for the hours you might pick (`core/atmos/test-sky.js` shows how to load the model) and open after it.
- **A water tint keyed to a guessed shoreline lands on dry ground.** The soda lake's pink margin was placed by distance to
  an estimated shore and lay ~100 m inland, under the ground, so the brine showed one pale cyan. Key a shallows tint to
  the real depth (`level - terrainH`), and drop the water's `envMapIntensity` (~.15) or the sky's reflection washes any
  tint out.
- **Landform fields must not bury each other.** `KBASIN`'s strandlines are a few metres of bench on the slope; with its
  yardangs (14-22 m) over the same bed and a 0.5 degree slope, the lines were hundreds of metres wide and invisible. Make
  the shore band steeper where the lines should read, and run a second `KBASIN` with `yardang.h:0` blended in near the
  water (both draw their strands from the seed and the lake, so they agree line for line).
- **Riparian flora on a brine shore is a lore error the fields will happily make.** A lake's margin is `wet` 1 to the
  kit, so tugai poplars and a reed belt lined a soda lake. Give the station a `bias` that keeps fresh-water species to the
  inflows (here the dead channels).
- **Probe what a merged bucket draws.** A dead poplar is bark tubes only, no leaf instance, and the probe samples a merged
  mesh by its box centre: its registered volume read empty. Add one invisible mesh carrying `userData.probePoints` (a
  point at each tree's bole) after the bake.
- **A rock texture mapped top-down must be isotropic.** A desert-varnish set (vertical streaks) laid on the hills by world
  xz turned into parallel stripes, corduroy over every slope; an isotropic set (oxidised basalt) and a few dozen
  `KSTACKS` crags on the steep faces read as rock.
- **When core lacks a mode, compose it on the host and say so.** core/atmos has no dust storm; the black storm is a host
  fragment that scales the wind's base vector (the weather owns `windScale` and rewrites it every frame), then, after the
  sky has set the hour's light, thickens and browns the fog and the sky pass's own uniforms (the sky draws apart from the
  world's fog, so the world alone browning leaves a blue sky over a brown storm). Note the core gap in KNOWN_ISSUES and
  let the core mode replace the file.
- **The GPU verify lock is shared by every session on the machine.** Queue all your pages in one background script that
  takes and releases the lock per page, and keep working while it waits; a foreground `until mkdir` loop blocks you for
  as long as the other sessions hold it.
