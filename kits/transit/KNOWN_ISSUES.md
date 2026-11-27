# kits/transit — Known Issues & Next Extensions

- **Additional culture canal vessels:** `kits/transit` ships the three Eternian inland hulls (`et_canal_barge`, `et_tow_scow`, `et_inspection_launch`) alongside five culture canal infrastructure style profiles (`eternian`, `republican`, `marr`, `dalab`, `voth`). Iron-hulled *Slussport* steam/horse narrowboats (`republican`) and *Marr* painted canal lighters can register directly via `TR_VESSEL` as those settlements adopt `KCANAL`.
- **Counterweighted bascule / drawbridge animation:** `KCANAL.bridge` and `KCANAL.auditTransit` currently model fixed arch/humpback soffits; timed lift/drawbridge cycles on `KSCHED` can extend `bridgeClearsVessel` for masted river-sea coasters.
