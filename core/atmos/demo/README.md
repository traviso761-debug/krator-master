# Sky demo

The shared sky (`core/atmos/sky/`, `SKY-PLAN.md` step S0) on one page, for the owner to judge before any biome takes it.

```
cd core/atmos/demo && python3 build.py      # dist/sky-demo.html (about 670 KB, three.js r128 inlined)
```

**Controls.** Hour, day (from game start, -182..182: the whole year), time held or running (a 72-minute day, x20,
x200), site, air pressure, cloud cover, weather (clear, overcast, fog). Drag to look, wheel to zoom.
**Views:** game start at sunrise (06:00 on 17 Ceppaṭampar, the southern spring equinox), its dusk (the Pleiades high
in the evening), a winter midnight (21 Jūn: the cluster overhead), a summer night (17 Ṭicampar: the cluster gone, near
the sun), the next eclipse at the site (in the seasons round the equinoxes), the Double Dark (the night
before game start: the Week and the Thirteen new), noon, Day's transit of the giant (on the current day). **Look at:** the giant, the sun, the cluster, the zenith, each moon
(the Companion, the Week, the Thirteen), level.
The readout gives the date in Jimjam's months and counts, and where the sun, the giant, both moons and the cluster stand.

**URL hash** for repeatable shots: `#site=rim&view=winter&look=cluster&day=-88&hour=0&fov=50`.

**The smog** (2026-11-09, `core/atmos/README.md` "The smog"): four toggles on the clouds' mood, each on its own: **Colour** (none,
smog brown-purple, dull red, sickly green, ash grey, ghostly purple, jaundice yellow), **Pattern** (none; violent: torn, broken
edges; ordered: regular rows; glitched: two more sheets of cloud sliding on their own winds; ripple: rings spreading from an
epicentre 2.5 km north, slow), **Glow** at night (none; an ethereal breathe over the whole sky; lightning under one patch at a
time, each flash striking a visible bolt from the cloud to the ground; orbs: two small bright lights wandering under the cloud), **Sky events** (none; flashing pillars of light; lights ascending to the heavens; both: one a minute here, 3-8 km off, in the glow's
colour), **Dark** (0..1), **Pace** (how much faster than the page's wind
the pattern's own motions run, x3 by default, so they read at 1x) and **Sheet tints** (the glitched sheets in the tint's
complement and its hue-rotated twin). **Shifting** hands them to `ATMOS.cloudMood` (a new episode each minute
here: the three effects together or apart, the readout names the episode). **Smog mist** turns on a height fog whose mist has a
field: a "city" 3 km to the north-west where the smog is universal, thinning to a tenth by 4 km out, all day. The ground and the
test pieces take it; the sky pass does not (the far ridges stand clear of it, as they would behind a valley's smog). **Radiation** (`fx/89-atmos-fx-radiation.js`) lights two zones of air with a warm additive glow that wavers: one 350 m across
1 km to the north-east (`#rad=1&az=41&el=4`), one 80 m close by to the north-west. **Sound** binds `core/audio/24-core-audio-sky.js`: thunder after each flash, a crack when it is near, a boom after a pillar, a rising
tone with an ascent, the orbs' hum and the breathe's drone, from a stand-in synth until the catalogue's clips are chosen. URL hash:
`#colour=brown&pattern=violent&glow=ethereal&dark=.6&smog=1&az=300&el=22&alt=80` (then the Hour slider to 22 for the glow), or the
shortcuts `#mood=smog|ash|green|shift`.

**Sites** are scale-model pixels through the site frame (`ATMOS.siteAt`): Voth (446,690, the reference), the
hyperjungle at Pinnacle Rock (755,351), Korona (814,189), the Throne's glacier (545,560, 0.5 atm) and an Outer Wall crest
(450,1040, 0.3 atm). The glacier and the rim pixels are approximate. **The ridges are demo stand-ins**, not any biome's.

What the page is for: the colour script through the day, the giant (on the celestial equator, NE ~25 degrees up at
Voth, bobbing ~2 degrees a day with its rings opening and closing; eclipse seasons round the equinoxes, its ice-giant face and sky-plankton bands, its phases, its hairline ring with the far half behind the disc, its eclipse rim),
the ring's structure, the four moons on the ring line (Ceres-like Companion, Iapetus-like Week, carbon-world Thirteen, Io-like Day,
whose daily transit has its own view), the procedural Pleiades night
(nebula, bright members, field, the galaxy's band in the far half), stars by day in thin air, the clouds, and the chrome
sphere showing the sky's light (`ATMOS.skylight`) on a standard material.

The ground and the test pieces take the clouds' shadows and the rain (`ATMOS.cloudShade`); `#alt=600&pitch=-0.5` looks down on
the shadows. Not yet here: the per-hour grade (split tone), the plume
and cloud-sea landmarks, ATMOS.weather's rain and lightning (the weather select only greys and fogs the sky).
