# Sky demo

The shared sky (`core/atmos/sky/`, `SKY-PLAN.md` step S0) on one page, for the owner to judge before any biome takes it.

```
cd core/atmos/demo && python3 build.py      # dist/sky-demo.html (about 670 KB, three.js r128 inlined)
```

**Controls.** Hour, day (from game start, -182..182: the whole year), time held or running (a 72-minute day, x20,
x200), site, air pressure, cloud cover, weather (clear, overcast, fog). Drag to look, wheel to zoom.
**Views:** game start at sunrise (06:00 on 17 Ceppaṭampar, the southern spring equinox), its dusk (the Pleiades high
in the evening), a winter midnight (21 Jūn: the cluster overhead), a summer night (17 Ṭicampar: the cluster gone, near
the sun), the next eclipse at the site (only round the summer solstice: the giant is lifted), the Double Dark (the night
before game start: the Week and the Thirteen new), noon, Day's transit of the giant (on the current day). **Look at:** the giant, the sun, the cluster, the zenith, each moon
(the Companion, the Week, the Thirteen), level.
The readout gives the date in Jimjam's months and counts, and where the sun, the giant, both moons and the cluster stand.

**URL hash** for repeatable shots: `#site=rim&view=winter&look=cluster&day=-88&hour=0&fov=50`.

**Sites** are scale-model pixels through the site frame (`ATMOS.siteAt`): Voth (446,690, the reference), the
hyperjungle at Pinnacle Rock (755,351), Korona (814,189), the Throne's glacier (545,560, 0.5 atm) and an Outer Wall crest
(450,1040, 0.3 atm). The glacier and the rim pixels are approximate. **The ridges are demo stand-ins**, not any biome's.

What the page is for: the colour script through the day, the giant (lifted to declination -37.6, ESE 25 degrees up at
Voth, its ice-giant face and sky-plankton bands, its phases, its hairline ring with the far half behind the disc, its eclipse rim),
the ring's structure, the four moons on the ring line (Ceres-like Companion, Iapetus-like Week, Venus-like Thirteen, Io-like Day,
whose daily transit has its own view), the procedural Pleiades night
(nebula, bright members, field, the galaxy's band in the far half), stars by day in thin air, the clouds, and the chrome
sphere showing the sky's light (`ATMOS.skylight`) on a standard material.

Not yet here: the Godot twin (`atmos_sky.gdshaderinc`, `krator/sky.gd`), the per-hour grade (split tone), the plume
and cloud-sea landmarks, ATMOS.weather's rain and lightning (the weather select only greys and fogs the sky).
