# Girder — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [ ] UNCONFIRMED BRIEF: "platforms protected by rope bridges" was read as "connected by rope bridges" — ask Travis
- [ ] Terrain: ground drops 4-12 m below brook water level in a hollow below the cascade; widen the vale in terrainH (10-core)
- [ ] "Girder from the brook" view was moved onto the footbridge after the last render — never re-shot
- [ ] Life: under the default 2-minute day, worker commutes fade instead of walking (pause/slow the clock to see real walks)
- [ ] Life: sentries never change shift; wall-walk pacers have no way up or down (no ladder/nav link to the ledge)
- [ ] Life: lift-foot nav edge runs through the capstan circle (walkers detour); capstan bar is static and cannot turn with the millipede (30-layout / 50-structure)
- [ ] Life: a lift queue does not steer round the sentry posted at the lift foot; hand lanterns do not light the ground
- [ ] Life: 78-life still carries 12 private road links (_life.virtualLinks) now redundant with the crossing fix in 30-layout — remove and re-test
- [ ] Layout: gallery walk-loop corners at (+-22,+-22) sit inside the corner columns (20.8-24)
- [ ] Flyers: the 12 court-side roost stalls are static residents (every approach crosses a bridge); quetzals use outer bays only
- [ ] Flyers: circuit joins fail ~25% (fall back to plain departure); formations dissolve; quetzal head clearance under the eave judged by eye
- [ ] Flyers: rider-lantern / bat-eye glints never confirmed in a night frame; re-run the obstacle audit against the real forest (it was run against placeholder crowns)
- [ ] Overgrowth: vine curtains are flat two-sided ribbons with no sway; blocky close up (58-overgrowth)
- [ ] Arch: house yards sparse, no animals in pens; dwellings under low slabs have no roofs
- [ ] Forest: no trodden-ground tone on gate tracks; fireflies hard to see; brook bed strip only inside |x|,|z|<1200; FAST-off (shadows) build never run
- [ ] Forest: 62-jungle hard-codes four camera positions from 80-camera to keep them clear — publish viewpoints from the layout instead
- [ ] Night at 21:00 is too bright under the gas giant (shared with Mav's Refuge)
- [ ] Interiors are furnished AFTER load (56-interiors.js): ~16 s of placer time in a desktop browser (118 s headless), nearest the camera first; frames drop while it runs. The interiors placer (kits/interiors 45-placer.js, its geometry tests) is the cost: a faster placer or cached plans would let it run at load
- [ ] Interior lamps, hearths and braziers are data only (their lights are on the placements, not in the night light volume): furnished rooms are lit at night only by the window spill
- [ ] Furniture budget (BUDGET.furniture, measured + 15 %): HEAVY_PIECES
- [ ] Walk mode: closed door leaves are drawn in the shells' doorways and the walker passes through them; no head collisions; no ladders (watch posts, wall-walk and orchard ladders are not climbable); no rail on the gallery or deck edges, so the walker can fall off; the stairwell beside each half landing is open
- [ ] Woodpiles are the catalog's stave stack: the beast-rider culture file has no log pile (br_woodpile is only in the harvested registry, krator-master-furniture.js, which the bundle leaves out)
- [ ] Still geometry that is arguably furniture: 72-lights.js LAMPPOSTs on the roads and deck corners (planner-owned; the culture file has no lantern post), the hides hung across workshop fronts, gallery banners, prayer flags, roost pennants and plaques (kept as facade dressing)
- [ ] The Beast Rider set's Girder items (kits/interiors/sets/beast-rider.js) describe the catalog's buildings, not Girder's shells (sizes, door widths, floor heights differ; Girder sizes every slot and house itself): 56-interiors.js derives each building's item from its real shell instead. The roost deck item's keeper's shelter did not exist in Girder: 55-arch now draws one on each deck's outer corner apron

Catalog verify pass (2026-10), not synced back here: kits/catalog recentred `br_bldg_girder_palisade` by 0.40 m and
raised the sizes of the beast-rider hypertree plants. Girder's palisade is a ring of radius `PALISADE.R` built
in world coordinates (30-layout), not a 16 m section with an origin, and Girder declares no plant sizes. Nothing
here maps onto the catalog's correction. The catalog copy is the centred one.
