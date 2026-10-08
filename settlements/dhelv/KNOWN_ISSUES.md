# settlements/dhelv: known issues

- [ ] **Meshing the rock is slow: about 7 ms a chunk** (16 m, 32 cells a side). The page meshes near the camera within a
      budget a frame, so a jump to a far view fills in over a few seconds. A worker (P5c) or coarser chunks far off would help.
- [ ] **The direct sun's beam is shadowed only by the meshed rock.** Its spot through an opening casts shadows from the
      cavern chunks near the camera; far from the camera the throat's rock is not meshed, so a low sun's beam can land on a
      floor the rock would hide. The sky's light (straight down each opening) is the larger share and needs no shadow.
- [x] **The Throne kit is not on the flows yet.** Done (P5b): its pioneers on the flows, its forest on the old cone, its
      ruffs on the kipuka's rim (`45-dhelv-bio.js`: Dhelv's own ages and fields, not its flow model).
- [ ] **The ground the cavern meshes at a well's rim is tuff** against the flow's basalt round it.
- [x] **The flows' ages are a noise, not a history.** Done (the shelf): the Throne's own model lays seven flows from vents
      up the flank over the layout's land (`48-dhelv-flows.js`), and the ground is the land plus the lava laid.
- [x] **The ground is one heightfield of 5 m squares, drawn from every view.** Done (the shelf): 50 m tiles at 5, 10 or
      25 m by what passes through them, about 125k triangles. It is still one mesh, drawn from every view.
- [ ] **The spur's walls are one material, darker than the cave's rock.** Columns and a caprock on the cave's shader; no
      texture of their own yet (a jointed basalt colonnade would suit; ask the owner for one before painting it in).
- [ ] **The shelf's three hypertrees and three saplings are the same few trees.** Each is tinted a little and turned; up
      close the saplings read as a plantation. More variants cost load time (about 50 ms each).
- [ ] **What is drawn is decided by distance and the site's frame, not by occlusion.** A carved interior seen through a long
      window from more than 32 m out shows empty; the inspector's ray still meets furniture that is not drawn.
- [ ] **Headroom is checked on the carved ways and the doors only** (the cavern's `ceilingAt` costs about 1 ms, every 2 m);
      the open floors' grids (the hall, the pits, the apron) are under the hall's dome or the sky.
- [ ] **The stacked-lookup check has one crossing to try** (the cistern's way under the braid); the ledge stands back in
      the wall, not over the square.
- [ ] **About 650 people, not 5,000** (PLAN.md 8.2's numbers are to confirm): the modelled homes hold them; about 170 are
      out at 10:00. `?pop=` scales the homes.
- [ ] **Door transit into carved apartments** (PLAN.md 8.3, 7): the ramblers stop at a building's door and are indoors;
      Dhelv's page has no `IX.life` for the rooms inside.
- [ ] **Only the apron's floor is walked on the surface**; the flows and the shelf's top are not. The forest's plants are
      not walk blocks (a walker passes through a trunk).
- [x] **The cut-away is not wired** for Dhelv's carved sites. Done (P5c): the 32 carved sites nearest the camera, refreshed
      every half second (`dhCutBoxes` in `90-dhelv-scene.js`; the rock's `CV_BOXCUT`). A site farther than the 32nd shows
      shut; past the cut the rock is not drawn, so the view shows the dark behind it.
- [ ] **The hall's wall curves; the carved fronts are flat.** A wide front (an estate, the temple) on the dome's foot stands
      up to a metre off the rock at its ends.
- [ ] **The layout's numbers are a proposal** (PLAN.md section 12); `layout-plan.svg` is drawn for the owner to tune by eye.
