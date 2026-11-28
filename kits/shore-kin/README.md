# Shore-Kin Vernacular Architectural Kit (`kits/shore-kin`)

Procedural building kit (`culture: 'shore-kin'`, prefix `sk`) on `core/engine` for the **Shore-kin** — the mixed Fleet-born (`cFlīt-qBōn`), Rian (Ria Sound), Eternian, and Hueru-Kuran hinterland villagers and harbour-yard crews around Arcoforte (`PLAN.md`, Arcoforte Phase P3c §2.2b).

## Architectural Synthesis & Arch Material Rule

Shore-kin are clients of the Fleet-born caretaker house and build strictly from **Arch local and sea-derived materials** (**zero** Crookshore nephrite/jade and **zero** red cypress):

- **Rian strand:** Arched `laterite` *cuirasse* and `pillow_basalt` flood socles, `mangrove` boardwalks and front net-drying decks, 2-to-3 tier *Costularia* sedge, uluhe fern, and *Pandanus* thatch roofs crowned with carved upswept *Metrosideros* (`ohia`) gable horns.
- **Eternian strand:** Six-sided hexagonal plans, oyster-shell & `limeshelf` whitewash, pierced `brucite_travertine` ventilation block screens, faceted **closed-eyed ancestor masks** over doorways (fired `laterite_terracotta` for commoners, gleaming white **`paktong`** for house heads and the client moot hall), and braced tarred `mangrove`-pile harbour cribs.
- **Hueru-Kuran strand:** Battered dry-laid white-veined green `serpentinite` and buff-rind `dunite` ring walls, steamed `mangrove`-knee and stranded `whalebone_drift` rib vaults lined with *Melaleuca* `paperbark` under coastal `turf_dome` roofs, oiled `shark_ray_hide` awnings, and flame-rimmed `laterite_terracotta` & `verdigris_ash` kiln/chimney crowns.
- **Fleet-born (`cFlīt-qBōn`) accents:** Mangrove-tannin `catechu_stain` red-brown sails and trim, *Pycnandra* `verdigris_ash` green accents, white copper-nickel-zinc **`paktong`** fittings and tide-post inlays, vesicular `pumice` net-floats, and spun golden `byssus_cloth` banners.

Every building carries a structured `materials` part-list and aggregated `bill` record (`src/34-sk-trades.js` `SK_BILLS`) so `SIM` and `KCONS` bill local Arch goods directly.

## Build, Test & Verify

```bash
python3 tools/build.py kits/shore-kin
node kits/shore-kin/tests/test-shore-kin.js
python3 kits/shore-kin/verify.py kits/shore-kin/dist/shore-kin.html --assert
```

## Controls (Viewer Page)

- **Orbit / Pan / Zoom:** Mouse drag / right-drag / wheel
- **`F`:** Walk mode (`WASD`) across floors, boardwalks, stairs, and upper galleries
- **`X`:** Cut-away mode (opens roofs/walls on the camera side to inspect furnished rooms and Stage 7 `KROOMLIGHT`)
- **`E`:** Open / close nearest door (`core/door`)
- **`N`:** Night mode (braziers, kiln draw-arches, cupola breast, shell oil lamps, and `KROOMLIGHT` portal/lamp pool)
- **`I` / `P`:** Inspector (`core/tags`) and polygon coordinate tool
