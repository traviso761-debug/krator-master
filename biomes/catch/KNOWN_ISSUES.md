# biomes/catch: known issues

- [ ] **The walls are painted, not cast.** Each station's horizon is four of the shared sky's ridge layers drawn from the
      survey's distances (PLAN.md section 1): far crests 12-17 km, the Godthrone north-west, the inner walls' snowfields,
      the interior hills. A horizon cast from the scale model's heightfield at the site (SKY-PLAN.md 3.3, "Later") replaces
      them with no code change: the stage's `ridges` take a `profile`.
- [x] **The black storm** (2026-10-26): core/atmos's weather still has no dust-storm mode (a core change: an opt-in `o.dust`
      like `o.ash`), so the host composes one (`src/89y-host-storm.js`, the panel's "air" select or `?air=storm`): ATMOS's
      wind base scaled to a gale (the dust box lifts thick off every bare patch), then, after the shared sky has set the
      hour's light, the fog thickened and turned ochre-brown, the sun dimmed, and the sky pass's own zenith, horizon and haze
      browned so the walls vanish first. When core/atmos gains the mode, this file goes and the select becomes its.
- [x] **The weather host** (`core/atmos/host/89-atmos-e-weatherhost.js`): committed on the biome rebuild (7f174cae0) byte for
      byte as this branch carries it, so the merge is clean.
- [ ] **The Stalkers have no buried pose.** kits/mechs has none yet (kits/mechs/KNOWN_ISSUES.md): the pair stands, pitched
      forward and sunk into the sand. A crouched or lying pose in the kit would read better.
- [ ] **The tunnel's portal is a placeholder** (station 2): a plain concrete frame and a dark mouth, until the Stair build
      draws it from `kits/ancients`. Stair itself (the Hill arcology, the merchants, the divers) is its own build: the Hill's
      slope is left empty here, a `site.stair` record.
- [ ] **The oases' names and places are proposed** (PLAN.md section 8, 2026-10-26): the owner asked for proposals.
- [ ] **No fauna.** The sedesert kit's deer and coyotes are not read (the floor is too hot); the Catch has none of its own
      yet (brine flies at the lake, a wading bird on the brine, the caravans' beasts: for `kits/fauna`).
- [ ] **The dune shrub has no library card.** It is drawn as procedural geometry (green jointed twigs, red fruit), which
      reads; a card (`card.calligonum`) would be finer at the hero range. Not owed yet: say if wanted.
- [ ] **The lake's three other pans** (4.22: 497, 257 and 176 km2) are one playa on station 3; the others are the open
      world's.
- [x] **Look pass** (2026-10-26, with the owner's note that the lake and soda bed read as a blank blob from far, middle and
      even semi-close distance). Not a missing texture: the crusts' sets are pale and low in contrast, the ground shader
      faded every layer's grain to the painted colour past 60 m, and the painted colour had no large-scale variation. Now:
      the soda, efflorescence, ochre and algal sets are packed with a contrast lift (1.3-1.7, materials.json); past 25-220 m
      each layer is read from a second tap six times coarser, so a crust's polygons hold as large shapes (45c); the painted
      ground is mottled at two large scales (`STAGE.macro`); the yardang silt is a relief map over the painted tan, not its
      own near-white. The lake's shore band is steeper (~1.7 degrees over its lowest 600 m) so the strandlines stand as
      benches, the yardangs are kept to the north-western lake beds, the brine's pink margin follows the real depth (it lay
      under dry ground before), and the water takes less of the sky. The oasis's hills and the fan's mountain front take a
      desert-varnished rock set (`ground.rock`, rock.sandstone.varnish) on their steep faces; the fan's braids run down its
      radii; two oasis cameras moved out of a crown and the reeds. The Stalkers lie pitched forward and lower.
- [x] **The oasis hills' outcrops and the lake's low sun** (2026-10-26): forty crags (KSTACKS buttes, 26-70 m) of oxidised
      basalt stand out of the interior hills' steep faces on the west and east ridges, never on the Hill's slope (Stair's
      site) or near the water; the steep faces take the same set (`ground.rock`: the varnished sandstone first tried streaked
      into corduroy in a top-down mapping). The lake station opens at 16:00 (the sun ~19 degrees) so the strandline benches
      and the crusts' polygons throw shadow.
- [ ] **The morning is the giant's eclipse here.** At these sites the sky model puts the eclipse between ~08:00 and ~10:00
      on day 0, so the stations open at 13:00 (the lake at 16:00).
