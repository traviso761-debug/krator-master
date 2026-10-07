# settlements/dhelv: known issues

- [ ] **Meshing the rock is slow: about 7 ms a chunk** (16 m, 32 cells a side). The page meshes near the camera within a
      budget a frame, so a jump to a far view fills in over a few seconds. A worker (P5c) or coarser chunks far off would help.
- [ ] **The direct sun's beam is shadowed only by the meshed rock.** Its spot through an opening casts shadows from the
      cavern chunks near the camera; far from the camera the throat's rock is not meshed, so a low sun's beam can land on a
      floor the rock would hide. The sky's light (straight down each opening) is the larger share and needs no shadow.
- [x] **The Throne kit is not on the flows yet.** Done (P5b): its pioneers on the flows, its forest on the old cone, its
      ruffs on the kipuka's rim (`45-dhelv-bio.js`: Dhelv's own ages and fields, not its flow model).
- [ ] **The ground the cavern meshes at a well's rim is tuff** against the flow's basalt round it.
- [ ] **The flows' ages are a noise, not a history.** The Throne's own model (46) lays flows from vents down the fall line;
      Dhelv's ground is the layout's, so the lobes and tongues are drawn by a noise and do not change the ground's height.
- [ ] **The ground is one heightfield of 5 m squares (465k triangles), drawn from every view.** Underground it shows only
      up the openings; a coarser grid away from the kipuka and the openings (or chunks) would take most of it off.
- [ ] **What is drawn is decided by distance and the site's frame, not by occlusion.** A carved interior seen through a long
      window from more than 32 m out shows empty; the inspector's ray still meets furniture that is not drawn.
- [ ] **Only the kipuka's floor is walked on the surface** (and the cliff paths); the flows are not. The forest's plants are
      not walk blocks (a walker passes through a trunk).
- [x] **The cut-away is not wired** for Dhelv's carved sites. Done (P5c): the 32 carved sites nearest the camera, refreshed
      every half second (`dhCutBoxes` in `90-dhelv-scene.js`; the rock's `CV_BOXCUT`). A site farther than the 32nd shows
      shut; past the cut the rock is not drawn, so the view shows the dark behind it.
- [ ] **The hall's wall curves; the carved fronts are flat.** A wide front (an estate, the temple) on the dome's foot stands
      up to a metre off the rock at its ends.
- [ ] **The layout's numbers are a proposal** (PLAN.md section 12); `layout-plan.svg` is drawn for the owner to tune by eye.
