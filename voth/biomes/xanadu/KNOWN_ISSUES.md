# Krator biome kit — Xanadu: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. A claude.ai artifact is a separate copy of
      `dist/xanadu.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The ceiling is the Rift's, 25M triangles for the scene, 19M per pass.
      The first build measured 42M: the LOD spine (ten origins over a 6.4 km map)
      put almost every tree inside a hero radius. Hero radii were cut by a quarter and
      the uplands thinned. `XANADU.build({quality:.6})` (or `?q=.6` on the ideal type)
      is the knob.
- [ ] THE MAP IS READ AT 44 m. Anything on the scale model smaller than a cell (a
      single escarpment line, a narrow spit) is lost or softened; the escarpments
      between the green slopes and the uplands are slopes here, not cliffs.
- [ ] The city is not here. The map's districts (markets, farms, the palace) are
      treated as the wild ground under them; a world that builds the city should
      clear its footprints through `mask` / `obstacles` and keep the fields.
- [ ] The cataract that drains the lake is paint (a notch and a spray plume at
      azimuth 112 on the sky); the lake's outlet is not geometry.
- [ ] The river's ribbon is a hand above the bed and reaches out to where the banks
      rise above that; on a very gentle floodplain its edge can float a few
      centimetres over the ground at grazing angles.
- [ ] The fountain is a host particle system (2600 points). It is not a biome
      concern and is skipped by the probe.
- [ ] Impostors are the hyperjungle's blob technique, one or three blobs by habit;
      the lotus trumpet's impostor is three pink-rimmed blobs, not cups.
- [ ] Flowers are two-tone through the iridescence hook (a second colour away from
      the sun and at grazing angles), not painted in two colours: seen face-on in
      full sun a painted orchid shows mostly its first colour.
- [ ] Only one test structure dresses (the dome ruin). `dress()` samples by triangle area (inherited).
- [ ] No fauna yet.

## Done

- [x] The Vale's terrain from the scale model (class grid, escarpment cleanup, the island).
- [x] The sacred river traced off the map: gorge, cascades, monotone bed, its own water.
- [x] Thirty-one species (twenty-three unique, eight from the Rift ridge, altered), tagged.
- [x] Fairy rings and hornbeam arches as placements, with the rings' lawns on the floor.
- [x] Groves round glades on the vale (a grove field in the zones, flowers thick in the glades).
