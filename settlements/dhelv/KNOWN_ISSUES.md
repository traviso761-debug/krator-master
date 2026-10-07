# settlements/dhelv: known issues

- [ ] **Meshing the rock is slow: about 7 ms a chunk** (16 m, 32 cells a side). The page meshes near the camera within a
      budget a frame, so a jump to a far view fills in over a few seconds. A worker (P5c) or coarser chunks far off would help.
- [ ] **The direct sun's beam is shadowed only by the meshed rock.** Its spot through an opening casts shadows from the
      cavern chunks near the camera; far from the camera the throat's rock is not meshed, so a low sun's beam can land on a
      floor the rock would hide. The sky's light (straight down each opening) is the larger share and needs no shadow.
- [ ] **The surface is placeholder.** The flows are vertex-coloured basalt over the kit's earth texture; the kipuka has no
      forest, no stream; the ground the cavern meshes inside a well's rim is pale tuff against the dark flow. P5b.
- [ ] **Only the kipuka's floor is walked on the surface** (and the cliff paths); the flows are not (P5b, with the forest).
- [ ] **The cut-away is not wired** for Dhelv's carved sites (`ZJ_CUTSITES` stays empty): the kit's 32 slots are too few for
      Dhelv's ~60 carved sites; the nearest 32 to the camera would do (P5c).
- [ ] **The hall's wall curves; the carved fronts are flat.** A wide front (an estate, the temple) on the dome's foot stands
      up to a metre off the rock at its ends.
- [ ] **The layout's numbers are a proposal** (PLAN.md section 12); `layout-plan.svg` is drawn for the owner to tune by eye.
