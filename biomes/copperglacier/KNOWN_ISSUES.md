# Copper Glacier: known issues

## For the owner's eye (2026-11-03, the first build)

- [ ] **The copper is the data's, not the lore's.** The region note's porphyry copper and banded malachite-azurite glaciers are not in
  `geology.json`. Copper is background (50) on the gneiss and granite and rich (240) only on the eastern pass's skarn strip (`PLAN.md`
  section 1). So station 2's slope is green with malachite, while station 1 has one low node and a faint stain on the moraine. A
  porphyry province in the Crook would be a rebake (`kits/resources/REBAKE-PLAN.md`).
- [x] **The textures are wired** (2026-11-03, the owner's delivery): `rock.gneiss.banded` on the walls (stations 2, 3) and the boulders, and
  `ice.glacier.verdigris` on the copper ground's ice. Station 1's walls stay granite: its data cell is granite.
- [ ] **Every station's look has not been judged.**
  - The tarn's turquoise.
  - The glacier's surface reads as white snow with grey patches more than banded ice.
  - The pass's malachite tint covers most of the bare rock: the cell's prospectivity is 240 everywhere on the page.
  - The frost coral's shape: limbs taper to a point with a bead of iridescence (2026-11-03, the owner: they were blunt), three fork levels near the eye, two far off.
  - The ice caves (reworked 2026-11-03, the owner: they did not touch the ground nor blend in): each shell sits on a levelled pad (2.5 R) with an apron of
    ice from its flank to the ground (KGLACIER.drawer `apron`), its foot carried 2.5 m into the ground (`skirt`), a lower and narrower mouth facing down the
    glacier (`mouthTop`, `mouth` .2), a finer shell (`fine` 2) and a planar map (`uvWorld`). The mouth's edge is still stepped by the shell's grid;
    burying the shell under the ground's ice was tried and dropped: the ground mesh's 12 m cells are as wide as a cave and could not open its mouth.
  - The nunataks are rounded ridges (`KRELIEF.range`), not jagged gneiss.
- [ ] **The ice cliffs** at station 1's snout (in the tarn) and station 3's edge are ground mesh, so a steep face stretches the ground's
  textures. Station 2's snout is tapered over 110 m to avoid it.
- [ ] **KSHADOW is off at page load** (`?shadow=1` on). Measured on the Arc 140T (D3D11), station 1, synced render + readPixels, 9.7 M triangles, 23 calls:
  the snout 117 -> 140 ms, a frost coral 100 -> 156 ms, from afar 105 -> 144 ms (+20-56%). Not affordable, as on the Throne's station 1. The owner's call:
  on, off, or casters cut to the corals. The pane was hidden while measuring, so the timings may run high; the ratio is the reading.
  2026-11-08, the owner's call: casters cut to the corals. `89z` now casts only the frost corals' limbs and tips (`biome:coral`, `biome:coraltip`;
  `window._shadow.state.casters` counts them); everything else only receives. Still off at load; since 2026-11-08 (the owner: "yes, move it") on core/shadow's own switch like the other kits: core's button or `?shadow=1` turns it on, `?shadow=0` none of it. The new cost is not timed (no GPU run).
- [ ] **Ice worms** are points that glow from dusk to dawn (`86`): no motion, no daytime look. Animals belong to the fauna kit; this is the
  glacier's one native animal as a placeholder.

## Station 11, the azurite tarn (2026-11-16, Gemini's 5.1 showcase; `PLAN.md` section 7.3)

- [ ] **The GPU verify is owed** (`python3 verify.py dist/copperglacier-azurite.html --assert --all-views` on a lane). Only SwiftShader ran here
  (the report in the station's commit says which checks). Its texture units were counted on SwiftShader; the Arc's ANGLE fails a program at 16.
- [ ] **An ideal type: the crater is drawn about 1:13.** On the model the Copper Tarn is a round basin ~30 km across (px 138-154, 1134-1162), its
  outlet 9105 leaving the NW lip at px 142,1136 for the west, the ice 16 km east of the middle. The page draws the spec's framing (the whole
  collar in a 5.2 km cut): the tarn 2.2 km across, the glacier from the ENE, the breach WSW. **For the owner:** keep the ideal crater, or move
  the station to the real breach (about px 140,1137, the outlet's head) and lose the snout from the frame (the ice is 30 km off there).
- [ ] **The copper is the spec's, not the resource data's.** The data has the cell as water, no copper and no node within 3 km; the spec's IOCG
  skarn (section 7.1) is drawn as the station's own copper field (the seams on the marble, the bars' green pebbles). A rebake with the IOCG
  skarn round the tarn would make it the data's (`kits/resources/REBAKE-PLAN.md`; the first item above).
- [ ] **No azurite texture.** The azurite seams are the library's `rock.malachite` tinted azure (`84`, `aST.y`): a stand-in. Owed to
  `core/materials/PROMPTS-NEEDED.md` (outside this kit; the coordinating session adds it): `rock.azurite`, banded azurite and malachite in
  contact marble, deep azure nodules and crusts, 2 m tile.
- [ ] **Layers left out for the texture units** (`SITE.layersOff`): the beds take five, so the station's bare ice is all `ice.verdigris` (the
  spec's banded ice), and the dirty ice (the medial moraine), the snow and the wall rock are the paint's and the beds'.
- [ ] **The beds are planar.** KSTRATA's dip is one plane, so the collar's beds dip gently WSW everywhere, not radially out of the crater (the
  spec's upturned flap). A radial dip is not in KSTRATA.
- [ ] **For the scale-model queue (no edit made):** none needed for this ideal type. If the owner wants the 1:1 framing, the model would need the
  spec's small cirque crater at 147,1143 inside today's 30 km basin, which contradicts the model's lake; not proposed.
- [ ] **Not drawn:** the Fellgang and Dalab prospectors on the bars (no people in a biome kit), the native-copper nuggets as objects.

## Left out, with reasons

- **KSTRATA:** the walls are foliated gneiss and granite, with no beds.
- **KKARST, KSPELEO, KCAVERN:** no soluble rock (`biomes/KARST-SITES-5.1.md`); the caves are ice caves.
- **Impostors** (`34`, listed): no tree passes 7 m.
- **R9 wet ground:** Oidong found `WATER.wetGround` over KGROUND's Standard ground drew black.
- **Thin air on station 3:** it is 0.71 atm at 6.5 km, but no ambient hazard is registered. `KHAZ`'s ambient kinds want a record shape the
  page has not been given.
