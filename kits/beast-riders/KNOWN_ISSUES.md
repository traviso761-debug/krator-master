# kits/beast-riders: known issues

- [x] **The catalog's thirteen were lossy copies of Girder's and Mav's Refuge's buildings** (owner, 2026-10-18).
      Closed 2026-10-18: the kit shows the PORTS (`br_port_*`, README), the towns' own builders on their own engines,
      each checked against its town's page (verify.py). The catalog's copies are off the sheet.
- [ ] **The catalog's copies stay in the catalog** (`kits/catalog/krator-master-buildings-beast-rider.js`) for the builds
      that read them (Voth; the isle demo's Ridertown switched to the ports on 2026-10-18). Retiring them means re-pointing those builds to the ports.
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
- [x] **The isle demo's Ridertown still takes the catalog's copies** (`br_bldg_nature_shrine`, `br_bldg_roost_gallery`):
      see `settlements/isle-demo/KNOWN_ISSUES.md` for the keys to switch and what the switch needs. - 2026-10-20: switched 2026-10-18 (see settlements/isle-demo/KNOWN_ISSUES.md), nothing open.
- [ ] **No interiors yet for the kit's own buildings**: the stables, byre and tower place their outdoor pieces
      (troughs, hay, tack, water butts) but have no planned rooms in `kits/interiors/sets/beast-rider.js`.
- [ ] **Software GL washes the colours out** on the catalog engine (its tone mapping on a pale ground); judge the look
      in the browser.
- [ ] **`wood.guano`'s drips are top-heavy** in the source image, so a tall surface shows a band of drips each tile
      (used on the deck and the short perch rails only).
- [ ] **The rider mounts themselves** (raptors, threehorns, quetzals...) are not placed in the stables: kits/fauna's
      mounts, a later pass.
