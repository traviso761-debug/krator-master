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
  - The frost coral's shape (a stout fork of three or four limbs, three levels near the eye).
  - The nunataks are rounded ridges (`KRELIEF.range`), not jagged gneiss.
- [ ] **The ice cliffs** at station 1's snout (in the tarn) and station 3's edge are ground mesh, so a steep face stretches the ground's
  textures. Station 2's snout is tapered over 110 m to avoid it.
- [ ] **KSHADOW is off at page load** (`?shadow=1` on). Measured on the Arc 140T (D3D11), station 1, synced render + readPixels, 9.7 M triangles, 23 calls:
  the snout 117 -> 140 ms, a frost coral 100 -> 156 ms, from afar 105 -> 144 ms (+20-56%). Not affordable, as on the Throne's station 1. The owner's call:
  on, off, or casters cut to the corals. The pane was hidden while measuring, so the timings may run high; the ratio is the reading.
- [ ] **Ice worms** are points that glow from dusk to dawn (`86`): no motion, no daytime look. Animals belong to the fauna kit; this is the
  glacier's one native animal as a placeholder.

## Left out, with reasons

- **KSTRATA:** the walls are foliated gneiss and granite, with no beds.
- **KKARST, KSPELEO, KCAVERN:** no soluble rock (`biomes/KARST-SITES-5.1.md`); the caves are ice caves.
- **Impostors** (`34`, listed): no tree passes 7 m.
- **R9 wet ground:** Oidong found `WATER.wetGround` over KGROUND's Standard ground drew black.
- **Thin air on station 3:** it is 0.71 atm at 6.5 km, but no ambient hazard is registered. `KHAZ`'s ambient kinds want a record shape the
  page has not been given.
