# Yuni — known issues (printed by build.py; tell the user before making changes)

- [x] The INNER CITY is placed: 15 scheduled plots (9 Ancient groups, the Emir's Palace, the Library of Yuni and
      the Order's Archive, Chapter house and School) plus 184 infill buildings packed as rows along each ring
      street, every one oriented to the best street within 55 m. Invariants: `inner-city-placement-sane`,
      `plot-schedule-built`.
- [x] The WESTERN half outside the wall is placed: the prosperous quarter (clock 6:30-10) and the market district
      (10-12), 821 buildings, plus the caravanserai and the great market circle with four halls and four rings of
      stalls. Everything reads the painted mask, so nothing stands on a street, in a park or on the farm belt.
- [x] The WHOLE ring outside the wall is placed: prosperous quarter, market district, and the poorer half from
      clock 12 round to 6, thinning to mud and thatch against the talus. 1,479 district buildings in all.
- [x] NOTHING STANDS IN THE ROAD AND NOTHING GROWS THROUGH A BUILDING. The clearance tests were point
      tests: 399 buildings had a box over a street edge (worst six metres, a market hall in its own
      boulevard) and 31 avenue trees stood inside buildings. `boxStreetPen()` and `treeClearBox()` ask
      the real oriented rectangle, inside `gridRy()` so the nudge table can fix it, with half a metre
      of tolerance for a doorstep. Now four (all scheduled landmarks, about a metre) and zero. Both are
      bucketed into uniform grids, which also took minutes off the build. Invariant:
      `nothing-in-the-road-or-through-a-tree`. Cost: 1,820 buildings became 1,765.
- [x] The four market halls hunt round the market circle instead of sitting on fixed cross axes; two
      of them had been refused by the new box test and vanished from the market entirely.
- [x] Scheduled plots may slide a few metres along their own radius to clear the ring street.
- [x] Where a district's chaos is above 0.3, a refused house may take a free yaw facing the nearest
      street. Those are tagged `free` and excluded from the on-grid count rather than loosening it.
- [x] EVERY NON-ANCIENT ASSET IN THE KIT NOW SPAWNS. An audit of PLACED against ASSETS found nine that had
      never once been built. Three — the family compound (26 m deep), the painted terrace apartments (22) and the
      Hall of Records (40) — are deeper than half a ring band, and both packers filter on `f.d <= allow` where
      allow is half the band (18-20 m inside the wall, 17 outside), so every row of every band silently dropped
      them despite two of them carrying the heaviest weights in the list. `packDeep()` now sweeps each band that
      is 34 m or wider FIRST, giving a deep landmark the band's whole depth on its mid-radius; the two ordinary
      rows then pack round it. The other six were the whole Parc Guell family, which had no placement path at
      all: `famWeights()` has no `park` key, so `districtFabric()` dropped them, and park ground is mask code 3,
      which every fabric pass refuses. Section 3b of `68-place.js` is their own pass — the only one that ignores
      the mask, because inside a park polygon that reserved ground is exactly where they belong — placing the
      signature piece in the middle of each park, two gate lodges at its edge, the fountain roundel off to one
      side and the viaduct along a flank. 15 park pieces; `60-flora.js` leaves the middle of a park unplanted
      (trees are laid down eight fragments before placement and can never be taken out again).
- [x] FARM_PLOTS carries farmsteads: one plot in five takes a walled compound with its granary, well and stock pen.
- [x] The summit carries the starport ruin plus three ruined dishes and a ruined radar mast, hand-placed.
- [ ] The budget was raised to 190 draw calls / 7.0 M triangles / 460 k instances to take the full city. The world
      now sits at 116 calls and 4.53 M triangles. There is still no LOD: everything is drawn at full detail at
      every distance, which is why the frame rate is what it is on a soft renderer.
- [ ] 778 district candidates were refused outright because no grid axis fitted them. That is the slums crowding
      themselves; it reads fine, but a relaxation pass would recover some of that density.
- [ ] The inner-city fill is wealthy fabric only (rich + civic). It reads right for the core, but the density is
      about 6 buildings per hectare — honest for compounds with courtyards, thin if you want 10,000 people in there.
- [ ] Triangle costs: houses 570-980, wealthy compounds 1.7-2.1k, Emir's Palace 11.6k, caravanserai 12.3k (54% over
      its 8k landmark budget), Ancient factory 45-61k. ~3000 buildings at these costs is a lot — thin or add an LOD
      before placing the whole city.
- [ ] The gas giant still hangs in the NORTH-EAST while the valley now opens NORTH-WEST. That is deliberate: the
      giant's position is fixed by Yuni's longitude on a tidally locked moon and must agree with Mav's Refuge and
      Girder. Say so if it reads oddly.
- [ ] A daytime "airlight" floor was added to the giant's shader (21-sky.js, search YUNI) so its unlit side is
      sky-coloured rather than black in this thinner 1.3 atm air. A deviation from the shared Krator sky — confirm.
- [ ] The canal commands the land by 0.5-1.5 m, which is right, but the embankment on the NW half is only read from
      close up; from the air the canal can look like a ditch rather than a raised channel.
- [ ] Ancient "worn" variants are full height, so several are much taller than their ruins (Conocylinder 165 m);
      check that against the 640 m walled city when placing.
- [x] Ancient weathering: a rust-tinted stain pass now runs from every ledge, seam and fastener, moss and vines
      are gone from the worn state except a trace on the four tall towers, and the worn skin is its own texture.
- [x] Ancient robotics dressing: the wall sampler now bins by face normal, so long rectangular buildings take it.
- [ ] The Library of Yuni is over its triangle budget (~18k est.), most of it shelving. The interior only reads
      from on or near the entrance axis; from an oblique angle you see the facade, not the books.
- [ ] The watch tower's bell reads to about 55 m and goes to a dark hole beyond that.
- [ ] Djenné town house variant A reads weakest of the three; the Musgum door surround is still a flat slab.
- [ ] Underground rooms are lit by the sun in FAST/headless mode (no shadows there); on a real GPU the butte should
      shadow them. Not yet checked on real hardware.
- [ ] `ancient_starport_ruin` uses `districts:['summit']`, which is outside the contract's district list.
- [ ] The Grand Vault was rebuilt (second design): Sagrada Familia — six leaning star-section pillars carrying a
      stepped canopy, tilted buttresses, one stone throughout, ornament from arch and geometry, colour only in the
      electric light. The screen's string courses still read as thin rails from 200 m out.
- [ ] Furniture is in its own catalogue target (yuni-furniture.html) and every piece is tagged with a culture;
      plants likewise (yuni-plants.html) with a climate band and a preferred aridity. Only the Order's furniture is
      wired back into a building so far (the library and the school build from the registry); everything else in
      the city still draws its own.
- [ ] `F.lantern` is a fixed 0.5 m hanging lantern, too big for anything standing on a table. The ancients agent
      wrote a local `oilLamp()` helper; consider promoting it to the contract as `F.oillamp`.
- [x] THE LIFE LAYER is in: 454 people and 53 carts and caravans walking the NAV graph — ramblers, factory
      workers, academics, saffron-robed monks of the Order and market merchants, each with a day and a home.
      Invariant `life-layer-alive`.
- [x] The caravanserai now renders. It never had: the district fill packed houses into its reserved yard before
      the caravanserai was asked for, so the clearance test refused it silently. Reserved yards (the caravanserai,
      the market circle, the new Vault depot) are claimed BEFORE the fill now.
- [x] DOORSTEPS. Every POI now carries the door points `buildAsset` collected, and an agent walks a final leg off
      the street to the nearest door within 70 m (or, in an open place, to a point inside it). People stand at a
      doorway now, not on the centre line outside it.
- [x] Every population's routes are their own PATHVIZ layer — `Life: pedestrians`, `merchants`, `factory workers`,
      `academics`, `monks of the Order`, `carts and caravans` — each accumulating the edges it has actually
      travelled, in its own colour (monks saffron). The life fragment was renamed 84-life.js so it registers with
      PATHVIZ before 87-pathviz.js builds the dropdown; at 90 it registered too late and none of it appeared.
- [x] The path devtool draws RIBBONS, not lines. WebGL ignores LineBasicMaterial.linewidth on every desktop
      driver, so a route was one pixel wide and unreadable over a city this dense. Each corridor is now a flat
      2.8 m quad ribbon laid on the ground with depth testing off, so the layers read as an overlay map.
- [x] `any()` was being used as a UNION when it is a fallback chain: because `lab` was non-empty, every academic
      in the city walked to the Reliquary and to nothing else. `pool()` takes the real union. Academics went from
      0 corridors to 15, merchants from 46 to 72.
- [x] The last-leg check sat BELOW the no-path check in `step()`, so an agent crossing to a doorstep looked
      path-less and was sent to ask for a new destination instead of finishing. Carts went 20 → 57 corridors.
- [x] `gridRy` gained an 11-entry nudge table (along and across the frontage). Refused district candidates fell
      from 667 to 165 and the city grew from 1700 to 1822 buildings.
- [ ] The life layer has no collision between agents and no interiors — people stand at the door, not inside.
- [ ] CARAVANS DO NOT MOVE. Nine are spawned and drawn as four-beast carts with a caravanserai bias, but they
      register zero corridors and `want` reads null even on the cart code path they now share. Tried: their own
      `destFn`, a synchronous vehicle route, an off-map road-end state machine, and finally unifying them onto
      the cart path — none produced a corridor. Left as decorated carts; needs a fresh look.
- [ ] No LOD: everything is drawn at full detail at every distance.
