# The Oidong Valley and the High Rift: known issues

- [ ] **The Order's road is planned, not laid.** Its three links (777 km with 59 stops) are records in the plan. As in
  `openworld/xanadu-oidong-highrift`, laying them would bury the carved river channels they cross: the world has no
  bridge yet.
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
- [ ] **Strongbow** (an arcology on the model's list, px 1026,1594) is inside the cut and planned by no one.
