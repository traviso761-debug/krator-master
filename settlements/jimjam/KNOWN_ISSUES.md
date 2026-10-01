# Jimjam: known issues

- [ ] `sock()` (and so `jjAwning`/`jjBanner`) ignores `JJ.frame`: a socket declared inside `jjWithYaw` drops the yaw. Every family passes `ry` explicitly or uses its own frame-aware wrapper (`jjMilSock`); fix it in the adapter and then remove the workarounds together.
- [ ] `jjDome`'s finial ignores `JJ.frame` and the placement scale; `jjPalDome` and the housing onion are frame-aware local replacements.
- [ ] `jjStairs` draws floating step slabs (fine on the ground, wrong on a podium); `jjTempleFlight` and the housing stair are solid versions.
- [ ] `jjArch` and `jjArcade` make one real mesh per arch and draw only an open parabolic ring with no wall round it, so ground-floor openings come to a narrow point. Hospitality, housing and shops use instanced round-headed wall panels instead (`jjHospBay`, `jjShopArcade`); promote one of them to `61` and retire the ring.
- [ ] `jjPlinth` leaves open slits between its courses; `jjCivPlinth` is the local fix.
- [ ] `jjWall`'s `band` option runs a course at mid-height that crosses windows on 3-storey and 9 m walls.
- [ ] `useGroupXF` (vendored `50-registry.js`) uses the group's LOCAL matrix, so `JJFURN.place(buildingGroup, …)` lands near the world origin; `jjHospFurn` places furniture in the scene at the transformed point.
- [ ] Goods (crates, jars, spice cones, armour) are simple primitives; they read at eye level, not from the air.
- [ ] Cut-out cloth (swallow-tailed banners, sun plates) casts rectangular shadows.
- [ ] The amphitheater's front view shows the back of the stage building; the bowl reads from above and in its own views.
- [ ] The palace's back façade is plainer than its front; the plaza's coloured rays read as tile more than inlay.
- [ ] Farmhouses are deliberately plain; their roof stairs meet the parapet without an opening.
- [ ] Courts, pools and planting spots are empty by design (`plantSpots`, `fountainSpot`, `poolSpot` on the defs); a settlement places furniture and biome plants there.
- [ ] Biome: none was specified, so the two plants are placeholders (`biome:'placeholder'`).
- [ ] Life layer: none yet. Defs carry no activity/capacity data; add it with the city phase (README project rule).
- [ ] The coplanar-face resolver (`63-jj-zfix.js`) scans instanced boxes and flat cylinders only; a plain mesh laid flush on another surface can still z-fight. Builders should still offset details by 1–2 cm themselves; the resolver is a net, not a licence.
