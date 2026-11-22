# Multi-Kit Settlements & Dynamic Architectural Unlocks Scope (`[APPROVED]`)

**Status:** `[APPROVED]` — `Rulings #99–101` locked (`2026-11-22`). Phase 1 (`core/kits/10-core-kits.js`, `tools/kit_pack.py`, `kits/kits-manifest.json`, `28` kits) and Phase 2 (`core/city/42-city-multikit.js`, `core/region/47s-region-styles.js`, `[G data]`) implemented and verified.

---

## 1. Design Intent & Locked Rulings (`Rulings #99–101`)

Settlements in Krator — both prebuilt cosmopolitan ports/capitals (such as `Verge`, `Hook`, `Voth`, `Dilihan`, and `Nephtos`) and player-founded settlements ([SETTLEMENT-MIGRATION-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/SETTLEMENT-MIGRATION-SCOPE.md)) — support **an arbitrary (`1..N`) number of building kits** unlocked dynamically during play without page-size bloat or global namespace collisions.

### Ruling #99 — Migrating Knowledgeable Tradesmen (Living Vernacular Tradition)
- When skilled master builders, masons, carpenters, or shipwrights from another culture migrate into a settlement (via rural-surplus `migrantPool`, headhunted artisans, or refugee charters under `Rulings #95–98`), their presence unlocks **new construction of their `homeKit` vernacular buildings**:
  - `1–2` active master tradesmen (+ local apprentices) -> unlocks **Tier 1–2** (`dwellings`, `workshops`, `shops`, `hospitality`) of `homeKit`.
  - `3+` active master tradesmen -> unlocks **Tier 3** (`guildhalls`, `shrines`, `civic` architecture) of `homeKit`.
- **Living-Tradition Persistence Rule:** Styles carried solely by migrating tradesmen require **at least one living master or locally trained apprentice** (`masters + apprentices > 0`) in the settlement to construct *new* buildings of that kit. If all practitioners die or emigrate without training local apprentices, **all already-built structures remain standing permanently** (`standingOnly: true`), while new lots stop drawing from that kit unless re-seeded by new tradesmen or codified via blueprint.

### Ruling #100 — Purchased Guild Blueprints & Recovered Ancient Schematics (Permanent Unlocks)
- Players and polities can acquire **codified architectural folios and engineering blueprints** (`schematic:<kitId>:<pack>`) through:
  - Purchasing guild architectural folios at foreign Hiring Bourses, Universities (`Talia`, `Silkhead`, `Voth`), or Engineering Guildhalls (`Roketstad`, `Locus`).
  - Recovering or opening Ancient / vassal schematics ([RELICS-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/RELICS-SCOPE.md) `Ruling #84` `open_schematic`, e.g., `Pylon` ferrocrete, `Eternian` canal locks, `Republic` hydro-mills, `Xanadu` vaulted bathhouses/cisterns).
- **Permanent Codification Rule:** Unlike living tradesman traditions, a purchased or recovered blueprint **permanently unlocks** either **specific named pieces** (`blueprintKeys`, e.g. `highlands-republican:rep_mill_water`) or an **entire kit tier** (`blueprintTier: 1..3`) in `settlement.unlockedStyles`, independent of migrant headcount.

### Ruling #101 — Dual-Level Player Style Policy (Ward Zoning + Individual Lot Pinning)
- When multiple architectural styles are unlocked in a settlement, style selection operates at **two simultaneous levels** in [`KRATOR_KITS`](file:///home/antigravity/traviso761-debug/krator-master/core/kits/10-core-kits.js):
  1. **Ward / District Policy (`setWardPolicy`):** Players (or prebuilt city programmes) can leave a ward **Cosmopolitan / Mixed** (weighted organically by ward practitioner counts + blueprint tiers) or **pin / restrict** a ward's allowed styles (e.g., *"Harbour Ward = `islanders` + `hykkousoi`; Artisan Ward = `iziz-vernacular`; High Quarter = `xanadu`"*), while automatically enforcing physiological clearance (`minDoorH >= 3.2 m` for Giant wards, `access: 'mount'` for Beast Rider stables/quarters).
  2. **Individual Commission / Lot Override (`pinLot`):** Players can explicitly select any unlocked kit/blueprint piece (`<kitId>:<pieceKey>`) when commissioning an individual building or landmark on a specific lot.

---

## 2. Four-Phase Technical Architecture (`KRATOR_KITS`)

| Phase | Module / Path | Status | Summary |
|---|---|---|---|
| **Phase 1: Universal 5-Lineage Seal & `[G data]` Manifest** | [`core/kits/10-core-kits.js`](file:///home/antigravity/traviso761-debug/krator-master/core/kits/10-core-kits.js), [`tools/kit_pack.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/kit_pack.py), [`kits/kits-manifest.json`](file:///home/antigravity/traviso761-debug/krator-master/kits/kits-manifest.json) | **DONE (`2026-11-22`)** | Seals **28 cultural building kits** across all 5 engine lineages (`core_engine`, `vernacular`, `xanadu`, `yuni`, `catalog`) with zero leaked globals, uniform `{ dims, proto, bind, trades }` contract, `<kitId>:<pieceKey>` router, and `Rulings #99–101` `[G data]` unlock engine. |
| **Phase 2: `KCITY` & `SIM` Chooser Integration** | [`core/city/42-city-multikit.js`](file:///home/antigravity/traviso761-debug/krator-master/core/city/42-city-multikit.js), [`core/region/47s-region-styles.js`](file:///home/antigravity/traviso761-debug/krator-master/core/region/47s-region-styles.js) | **DONE (`2026-11-22`)** | Wires `KCITY.multikit` (ward zoning, `groundOk` footprint boundary checks, `commissionLot`, progressive `growWays`) and `KREGION` `47s` (`RH.simStyles`, co-working tradesman apprenticeship, ledger-conserved `RH.buyBlueprint` / `RH.grantSchematic`, `RH.setWardStyle`, `RH.commissionLotStyle`, multi-kit `RH.openSpur` & `RH.kitOf`). Verified by [`test-multikit.js`](file:///home/antigravity/traviso761-debug/krator-master/core/city/test-multikit.js) and [`test-region-styles.js`](file:///home/antigravity/traviso761-debug/krator-master/core/region/tests/test-region-styles.js); settlement page wiring parked in `TODO.md` for the all-builds rebuild. |
| **Phase 3: Lazy Runtime Sidecars & Shared-Library `Texture2DArray`** | `core/city/53-city-host-multikit.js` *(promoted from `isle-demo` `58` + `88a` + `88t`)* | **Planned** | Stream `<kitId>.bundle.js` + `<kitId>.tex.js` lazily via `KRATOR_KITS.ensure(kitsUsedByLots)` (keeping base `.html` `< 16 MB` under `check_budgets.py`) and deduplicate `DataTexture2DArray` layers by canonical `core/materials/library/<set>` id (`< 350 MB` VRAM for `15+` active kits). |
| **Phase 4: Per-Kit Prototype `.glb` Libraries for Godot 4.7.2** | `godot/data/kits/<kitId>.glb` + `godot/krator/` | **Planned** | Export one headless `.glb` prototype library per sealed kit so Godot instantiates `MultiMeshInstance3D`s + `KCONS` progressive construction dynamically when blueprints or migrant quarters unlock mid-campaign. |

---

## 3. Cross-References
- **Continental Master Scope:** [CONTINENTAL-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CONTINENTAL-SCOPE.md)
- **Migration, Artisans & Cosmopolitan Wards (`Rulings #95–98`):** [SETTLEMENT-MIGRATION-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/SETTLEMENT-MIGRATION-SCOPE.md)
- **Ancient Relics & Open Schematics (`Ruling #84`):** [RELICS-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/RELICS-SCOPE.md)
