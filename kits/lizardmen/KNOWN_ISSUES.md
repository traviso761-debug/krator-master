# kits/lizardmen: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Look

- [ ] **The ornament is geometry.** The leiwen panels, the glyph spirals and the spiral eyes are boxes and tubes
      (`40-lz-kit.js`): fine up close, heavy and aliased at a distance. Pattern sheets for them (a leiwen block, a glyph band,
      the eye) would replace them (`DESIGN.md` section 8); the prompts are not written yet.
- [ ] **No tent family.** The owner's hide-tent and sail-tent references (`DESIGN.md` section 9) are not built: the mustering
      ground stands empty of its camp.
- [ ] **The antechamber's dust does not fall upward** and there is no recursive shimmer toward the inner door
      (`DESIGN.md` section 4): the motes are static spheres; the shader is a later pass.
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
