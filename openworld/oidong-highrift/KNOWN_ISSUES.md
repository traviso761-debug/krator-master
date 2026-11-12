# The Oidong Valley and the High Rift: known issues

- [x] **The Order's road is laid** (2026-11-11), bridged over the rivers (core/world 42b, 88b), so their fill buries
  none. It runs from Longsong up the valley (`guide`; the straight line had taken it over 6,000 m) to Strongbow's foot,
  where the Sultanate's road from the west ends, then up the beck's staircase.
- [ ] **Three sites are not on the scale model's list.** The Singing Gjár, the Mirror Grange and the Caldron House are
  `"model": false` rows in `openworld/SITES.json` (their own pixel). Add them to
  `tools/scale-model/model/src/60-settlements.js` once the open-world sites session's Qiblai move has landed.
- [ ] **Longsong is in two regions.** `openworld/xanadu-oidong-highrift` still plans its first three villages. Drop it
  from that region when it is recut.
- [ ] **The High Rift kit grows only its floor.** It has no trees (the Mirror's larch is a station kin, off by default),
  and the bladed quartz on the fissures' walls (`HRIFT.combs`) needs walls the world does not model. The vents' heat is
  a profile picked by distance (`src/49`), not KTHERM's bake.
- [ ] **The Order's buildings are the Xanadu kit's pieces.** Its chapter house is `xa_monastery`, its scriptorium
  `xa_guild_gold`, its relic works `xa_guild_alch`; the Vein Camp's adits (`xa_adit`) are pending boxes. The Order's
  own architecture (Longsong's `62-ls-arch`, battered stone halls) is not a kit yet.
- [x] **The Singing Gjár's purpose and the two accessory houses**: confirmed by the owner (2026-11-11: "keep as
  proposed").
- [ ] **Strongbow**, the Ancients' cliff arcology, moved on 2026-11-11 to the valley's east end (px 1298,1647, at the foot
  of the High Rift's escarpment over Oidong's lake; the owner). It is a site and a road's end only. The arcology itself
  (a tower down the cliff on cables and terraces, pads at its lip: the owner's two reference pictures) is not built, and
  the Ancient network's routes to it (G10, xanadu.3.4, xanadu.3.5) still start from its old place.
