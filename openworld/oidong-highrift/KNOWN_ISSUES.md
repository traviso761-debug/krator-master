# The Oidong Valley and the High Rift: known issues

- [x] **The roads are laid** (2026-11-11), bridged over the rivers (core/world 42b, 88b), so their fill buries none:
  the Order's road up the valley and the staircase (`guide`; the straight line had taken it over 6,000 m), and the
  Sultanate's road down the valley to Strongbow.
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
- [ ] **Strongbow**, the Ancients' cliff arcology, hangs in the scarp between the Oidong Valley and Xanadu, 3 km north of
  the cataract by which the valley's river leaves (px 1001,1596, its top on the lip at about 1,400 m; the owner,
  2026-11-11: "right on the xanadu-oidong border - the same cliff the cataract is on - so that it offers a real advantage
  to anyone using its elevator", after moves to the east end and to the north-west wall the same day). The scarp falls
  about 3,100 m to the Xanadu floor over some 20 km (5.1 px 1001 to 991), steepest (1,300 m in 4 km) at px 994-996. It
  is a site and a road's end only: the arcology is the Strongbow session's. The cut was widened west for it (box from
  px 976, origin px 1306,1634), so every world coordinate moved 10 km from the earlier frame.
