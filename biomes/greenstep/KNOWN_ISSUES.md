# biomes/greenstep: known issues

Open items, each with what is owed. The kit and its first page were built in one cloud session (2026-11-09) with no GPU (the owner,
2026-11-09: no GPU verify from cloud sessions): `verify.py --assert` ran in software GL (SwiftShader) only.

- [ ] **GPU verify owed**: `python3 verify.py dist/greenstep.html --assert --all-views` on the Arc and the RTX (the integration session).
  Software GL measured the page at 8-10 M triangles drawn at its views and 17-20 M scene triangles, ~100-120 draw calls, a 75 s build;
  the kin's hero trees are most of it (`greenstep/kin`: ~16 M of the 20 M per-pass budget at the first full run). Worth timing on the Arc.
- [ ] **The look pass is the owner's**: the risers read as stepped walls of near-black basalt with mossy faces in the spray; the
  colonnade's columns are the strata shader's (`tibasalt-ponded` `fx.columns`) and show only near. The cliffs are the ground mesh
  (~10 m cells): whole columns, an overhanging fan at a rille's lip and the entablature's hackly tier would need `KSTACKS` `columns`
  or `KCARVE` on the risers (not taken this turn).
- [ ] **Tallwalls is a site only** (`site.tallwalls`): the fortress is the settlement build's (`PLAN.md`, "Still open").
- [ ] **The tier cedar is not grown** (`swlowlands.cedar`: riftrim's gorge found its pads off the limbs; its `KNOWN_ISSUES.md`).
- [ ] **The kin packs are whole** (`station.json` `"*"` for `swlowlands` and `shighlands`): the page is ~11.6 MB under the 16 MB cap;
  narrow each to the families its rows draw with (riftrim measured its rows' families on the page) before another kit is added.
- [ ] **No KSHADOW cost measured** (off at load; `?shadow=1`).
