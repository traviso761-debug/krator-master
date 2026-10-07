# settlements/dhelv: known issues

- [ ] **Meshing the rock is slow: about 7 ms a chunk** (16 m, 32 cells a side). The page meshes near the camera within a
      budget a frame, so a jump to a far view fills in over a few seconds. A worker (P5c) or coarser chunks far off would help.
- [ ] **The direct sun's beam is shadowed only by the meshed rock.** Its spot through an opening casts shadows from the
      cavern chunks near the camera; far from the camera the throat's rock is not meshed, so a low sun's beam can land on a
      floor the rock would hide. The sky's light (straight down each opening) is the larger share and needs no shadow.
- [ ] **The Throne kit is not on the flows yet.** The kipuka has the hyperjungle (P5b); the young lava round it should carry
      the Throne's pioneers (lehua, tree ferns, glassfern), as its kipuka station does. That kit reads a set of ground fields
      (owned, kedge, knear, rock, slope, humid: biomes/throne/stations/kipuka/47-host-land.js) and its flow history (46): Dhelv
      would compute those from DH.groundY and the kipuka. The ground the cavern meshes at a rim is still tuff against basalt.
- [ ] **Only the kipuka's floor is walked on the surface** (and the cliff paths); the flows are not. The forest's plants are
      not walk blocks (a walker passes through a trunk).
- [ ] **The cut-away is not wired** for Dhelv's carved sites (`ZJ_CUTSITES` stays empty): the kit's 32 slots are too few for
      Dhelv's ~60 carved sites; the nearest 32 to the camera would do (P5c).
- [ ] **The hall's wall curves; the carved fronts are flat.** A wide front (an estate, the temple) on the dome's foot stands
      up to a metre off the rock at its ends.
- [ ] **The layout's numbers are a proposal** (PLAN.md section 12); `layout-plan.svg` is drawn for the owner to tune by eye.
