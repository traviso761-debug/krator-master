# kits/beast-riders: known issues

- [x] **The catalog's thirteen were lossy copies of Girder's and Mav's Refuge's buildings** (owner, 2026-10-18).
      Closed 2026-10-18: the kit shows the PORTS (`br_port_*`, README), the towns' own builders on their own engines,
      each checked against its town's page (verify.py). The catalog's copies are off the sheet.
- [ ] **The catalog's copies stay in the catalog** (`kits/catalog/krator-master-buildings-beast-rider.js`) for the builds
      that read them (Voth; the isle demo's Ridertown, below). Retiring them means re-pointing those builds to the ports.
- [ ] **Not ported**: Girder's towers (the Ancients' frame, not a rider building: the catalog's `br_bldg_girder_tower`
      copy stands), its farm plots and the gallery dressing on the tower floors; Mav's Refuge's platforms' decks, stairs
      and the trees themselves, its market, mustering ground and plaza, the satellites' huts and farms. Their builders are
      not marked (`PORT`); marking one is a line in the town and a row in `towns/<town>-ports.js`.
- [ ] **The ports show what stood round them as absent**: a tower dwelling has no roof unless it stands under the open
      sky (the floor slab above is its ceiling in Girder); the council chamber, the rain canopy and the gate-tree
      carvings ring or cut into a trunk the sheet does not draw; a room front is a level's face, not a room; the roost
      deck's raking struts reach 15 m down to columns that are not there. The palisade is clipped from the town's ring
      (a stretch round a watch post, a gate), so its wall-walk ends at the clip.
- [ ] **The ports' look is the towns' library look under the kit's renderer**: the towns tone-map with ACES (Girder's
      exposure 1.38); the kit's renderer does not, so the ports read a little flatter than in their towns. Their
      instanced shapes are made plain meshes, so Girder's contact shading along the foot of a wall and the cloth sway
      are not there.
- [ ] **A clipped port keeps all its mark's furniture** (the palisade places none, so nothing shows today).
- [ ] **The isle demo's Ridertown still takes the catalog's copies** (`br_bldg_nature_shrine`, `br_bldg_roost_gallery`):
      see `settlements/isle-demo/KNOWN_ISSUES.md` for the keys to switch and what the switch needs.
- [ ] **No interiors yet for the kit's own buildings**: the stables, byre and tower place their outdoor pieces
      (troughs, hay, tack, water butts) but have no planned rooms in `kits/interiors/sets/beast-rider.js`.
- [ ] **Software GL washes the colours out** on the catalog engine (its tone mapping on a pale ground); judge the look
      in the browser.
- [ ] **`wood.guano`'s drips are top-heavy** in the source image, so a tall surface shows a band of drips each tile
      (used on the deck and the short perch rails only).
- [ ] **The rider mounts themselves** (raptors, threehorns, quetzals...) are not placed in the stables: kits/fauna's
      mounts, a later pass.

## The tent set (src/70-79, 2026-10-19)

- [ ] **The thorn hedge has no texture of its own**: the cut brush is thin branches of geometry with `bark.ironbark` as its
      detail map. `foliage.thorn.cut` is owed (core/materials/PROMPTS-NEEDED.md, section 1); wire it as the family `thorn`.
- [ ] **The painted marks are geometry**: the sigils on the hides, the chevrons and diamonds on the pavilions' shoulder
      bands, the awnings' stripes and the pennants are thin strokes and flat quads in palette colours, not a painted
      sheet; up close they read as appliqué. A painted band sheet would need UVs the catalog's meshes do not carry.
- [ ] **No mounts in the pens**: the corrals, kennels, perch frames, the pond and the grove are empty (kits/fauna's
      mounts, a later pass, as for the stables). The pens were sized before the hardshell and the jungle mammoth reached
      kits/fauna (2026-10-19), from their real kin (about 3.5 m and 6 m long): check them against `hardshell` (5.3 m) and
      `jungle-mammoth` (7.7 m).
- [ ] **The grove's trees are the catalog's generic tree** (`F.tree`, 'olive'): their places are hashed (KRAND), but the
      tree helper draws its limbs from the frame's own stream, and they are not the hyperjungle's species.
- [ ] **A tent stands on flat ground**: its floor, skirt and stakes start at y 0; a camp on a slope needs the settlement
      to level a pad (hedge and fence runs follow the ground piece by piece, not within a piece).
- [ ] **Interiors are placed by hand** (F.furn round the wall: `brtIn`), not planned rooms in `kits/interiors`.
- [ ] **No camp is laid on the sheet**: `BR_CAMP` says what a band pitches, not where; Pinnacle Rock lays them.

## The rock-cut pieces (src/55-56, 2026-10-19)

- [ ] **The rock-cut pieces are proud of the wall, not cut into it** (src/55-56): a piece cannot cut the world's rock, so
      its dressed face stands on the wall's face inside a raw rim of the rock and the carving stands proud of that; a
      recess (a door's, a niche's) is at most about 0.6 m deep. A world that carves its rock (Pinnacle Rock's KCAVERN, a
      carve patch) can set a piece back into the cut (opt.embed) and cut the rooms behind it from
      `kits/interiors/sets/beast-rider-rock.js` (its `voids`).
- [ ] **The rock-cut rims are boxes**: rough chunks of the raw stone in three steps; up close the top brow reads a
      little like crenellation. The beasts and the claw are reliefs of ellipsoids and tubes, one material each.
- [ ] **A wrapped piece's wide straight parts are segments** (≤ 1.2 m along the arc), its reliefs and lamps locally
      flat; a stack under about 0.6 × the piece's width in radius is clamped to that.
- [ ] **The Deep Root cavern's pieces are its dressing only**: the passage, the hall, the light well and the stack fig's
      roots are Pinnacle Rock's (KCAVERN). The face carries all twelve tribes (the owner, 2026-10-19).
- [ ] **The sheet's rock is a backdrop**: the wall behind each rock row and the stack in the wrapped row are plain
      boxes on the sheet, not part of any piece.
