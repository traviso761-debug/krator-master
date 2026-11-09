# biomes/greenstep: known issues

Open items, each with what is owed. The kit and its first page were built in one cloud session (2026-11-09) with no GPU (the owner,
2026-11-09: no GPU verify from cloud sessions): `verify.py --assert` ran in software GL (SwiftShader) only.

- [ ] **GPU verify owed**: `python3 verify.py dist/greenstep.html --assert --all-views` on the Arc and the RTX (the integration session).
  Software GL (2026-11-09, `--assert` at "The Great Veil from the basin" and "The brink at the prow"): every invariant and every
  negative control passes; 12.7 M scene triangles (budget 24 M; `greenstep/kin` 8.9 M of its 20 M, `greenstep/floor` ~3.8 M), 8-10 M
  drawn at the views, ~120 draw calls, 15,734 kin trees (2,407 hero, 13,327 far form only), attach audit 0 of 9,366 cards, a ~60 s build.
  The SW lowlands' `oakleaf` item went over the 250k instance cap (328k) at the first full run: fewer cork oaks and red bays, and the
  hero forms within 440 m of the spine (`LAND.kinHero`), took it under. Worth timing on the Arc.
- [ ] **The look pass is the owner's**: the risers read as stepped walls of near-black basalt with mossy faces in the spray; the
  colonnade's columns are the strata shader's (`tibasalt-ponded` `fx.columns`) and show only near. The cliffs are the ground mesh
  (~10 m cells): whole columns, an overhanging fan at a rille's lip and the entablature's hackly tier would need `KSTACKS` `columns`
  or `KCARVE` on the risers (not taken this turn).
- [ ] **Tallwalls is a site only** (`site.tallwalls`): the fortress is the settlement build's (`PLAN.md`, "Still open").
- [ ] **The tier cedar is not grown** (`swlowlands.cedar`: riftrim's gorge found its pads off the limbs; its `KNOWN_ISSUES.md`).
- [ ] **The kin packs are whole** (`station.json` `"*"` for `swlowlands` and `shighlands`): the page is ~11.6 MB under the 16 MB cap;
  narrow each to the families its rows draw with (riftrim measured its rows' families on the page) before another kit is added.
- [ ] **No KSHADOW cost measured** (off at load; `?shadow=1`).
- [ ] **Off the LOD spine the kin are far forms only, at every range** (`87-host-kin.js`): a camera walked well away from the spine
  (`LAND.kinHero`, 440 m) stands among the source kits' far blobs (the frill's lollipop, the sprawl oak's dome). riftrim grows no kin
  there at all; nwlowlands grows a lite form. A hero for every tree on the page is ~4x the triangles and the oak leaves' instance cap.
  The fix is variants for kin (riftrim's `86-host-variants.js` grown from `BIO.kin`'s builders, so the level follows the camera): owed.
