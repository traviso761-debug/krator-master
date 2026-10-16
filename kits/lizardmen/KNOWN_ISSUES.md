# kits/lizardmen: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Look

- [x] **The ornament is geometry** (first pass). Fixed 2026-10-16: the owner's sheets (`leiwenS`/`leiwenS2`, `glyphS`/`glyphS2`,
      `eyeS`) draw the panels, the bands (as columns on stelae and pylons) and the eyes; a building takes the A or B take by the
      engine's seed hash (`GABLE_ALT`). The geometry stays as the fallback without the pack (`?mat=proc`). The cyclopean masonry
      is `rock.basalt.polygonal`, delivered the same day.
- [x] **The tent family** (2026-10-16, second pass): `57-lc-camp.js`, four tents in a row of their own, two pitched behind the
      mustering ground's spiral grid. Open: the tents are not yet told apart by wear or by caste colour beyond the skin.
- [x] **The antechamber's dust falls upward** (a particle layer over the floor) **and a faint recursive shimmer** (seven
      translucent nested triangles converging on the inner door, breathing with the clock) **grows toward the inner door**
      (2026-10-16). Both are browser-side in `60-lz-reliquary.js`; the Godot port redoes them as a GPU particle and a shader.
- [ ] **The squared-spiral passage into the reliquary is not modelled:** the portal opens straight into the antechamber.
- [ ] **Two-way weathering** (half-built, half-ruined) is not a parameter yet; the only weathering is the repaired breach's
      cleaner stones.

## Scope

- [ ] A kit sheet, not a settlement: no spiral village layout (that needs a street generator on `core/city`, agreed with
      that workstream first), no Lizardman figures to size the doors against (the castes are heights in `LZ_CASTE` only),
      no life layer for people (the two beasts carry life data).
- [ ] **The farm's crops are placeholders** (carrot frill greens, trumpet pods, the Rift yam as simple geometry): they belong
      to the biome and fruit work.

## Textures

- [x] The kit adopts the library from the start (`materials.json`, 42 families). The ground is the Islanders' leafy grass
      tinted darker: the Rift floor's own ground set is the biome's to choose.
