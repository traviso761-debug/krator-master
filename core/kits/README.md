# `core/kits` — Universal Kit Registry & Multi-Kit Style Unlocks (`KRATOR_KITS`)

`[G data]` Engine-neutral footprint manifest reader, `<kitId>:<pieceKey>` router, `KCITY` `kit.dims(key, v)` adapter, and settlement style-unlock / ward-policy rules ([MULTI-KIT-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/MULTI-KIT-SCOPE.md), `Rulings #99–101`).

- **No Three.js, no DOM, no browser APIs:** runs identically in Node (`core/kits/test-kits.js`), browser worlds, and as a 1:1 spec for Godot (`KratorKits`).
- **Paired with [`tools/kit_pack.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/kit_pack.py) and [`kits/kits-manifest.json`](file:///home/antigravity/traviso761-debug/krator-master/kits/kits-manifest.json):**
  - `KRATOR_KITS.loadManifest(manifest)` indexes all 26+ cultural building kits (`w, d, h, variants, wealth, family, types, doorH, access, tier, trades`) in ~100 KB of plain data so `KCITY` (`10`–`40`) and `SIM` (`core/region`) lay out multi-kit towns without loading 3D meshes or PBR texture packs up front.
  - `KRATOR_KITS.register(kitId, api)` registers sealed kit closures (`<kitId>.bundle.js`) emitted by `tools/kit_pack.py` across all 5 engine lineages (`core/engine`, `Ancients/Vernacular`, `Xanadu/Qiblai`, `Yuni/Locus`, `Catalog`).
  - `KRATOR_KITS.kitAdapter(defaultKit)` hands `KCITY.create({ kit })` a drop-in `{ dims(qkey, v) }` resolving both qualified `'<kitId>:<pieceKey>'` and legacy unqualified keys.
  - `KRATOR_KITS.createStyleState`, `updateTradesmen` (`Ruling #99`), `unlockBlueprint` (`Ruling #100`), `setWardPolicy` & `pinLot` (`Ruling #101`), and `candidates(state, query)` enforce living-tradition tradesman unlocks, permanent blueprint/schematic unlocks, Giant/mount `minDoorH` clearance, and ward + per-lot style policies.
