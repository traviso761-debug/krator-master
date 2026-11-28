# Shelf: known issues (2026-11-22)

- **The station's platforms, the spirals and the great lifts' shafts are inside the rock and not drawn** (records only; KCARVE / KCAVERN owed
  with the interiors). The station's hall on the plateau stands over them.
- **The road tunnel's bore is a record** (`ways` `tunnel`: its two adits and a helix of 10.9 turns, 130 m across, 8.9 km at 9 %; checked
  in the rock, clear of the Line's spirals and the station); its two portals are drawn. The bore itself comes with `KCARVE`.
- **No flora**: the Wall's cold steppe (Dsb) is bare; the barley terraces are the Dalab set's orchards without trees (`dnTree` returns nothing).
- **The station's Tungangs** live in the station (300, `tungang`); their loj's name is open, and its buildings wait on the `tg` set.
- **The shell** has Ledge's form with the 2026-11-22 look pass (pods, struts, the cut face's courses) and night (`KCLIFF.night`); no interiors.

## Done (2026-11-22, the second known-issues pass)

- **Dalab's road on a graded cut** (`KCLIFF.roadCut`, read by `SHELF.groundAt`): the switchbacks solved on the slope's plane per 400 m
  piece, the ground graded to the road and eased back over its shoulder; the rules check it holds 9 % over 40 m (it reads 9.1 % on the page).
- **The cut ramp up the natural cliff is gone**: 850 m of cliff in 260 m is no road's. The road crosses the shelf between the halting place
  and the carters' yard to **the Ancients' road tunnel**: a portico on the dressed face at the north-west end, a helix up the Wall, a portal
  house on the plateau west of the north-west gate (`anc:portal`, `KCLIFF.drawTown`). A strike still leaves the shelf its road.
