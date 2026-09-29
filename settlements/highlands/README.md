# Highlands building kit

The wooden architecture of the highland, temperate regions of the Inner Wall, in three related branches —
**Republican** (the Iron Republic: Russian + Transylvanian Saxon, Peles for the grand), **Rustic** (the villages
to the south: Norse + Alpine) and **Tribal** (the Painted Men: bamboo, raw logs, totems, cliff settlements) —
carved and painted in a NW-coast formline palette, with a note of East-Asian dougong on civic eaves.

Built on the Ancients kit fragment contract and the Iziz Vernacular helpers (vendored), so the kit drops into a
settlement target (Raketstad is next) the same way the Iziz Vernacular set dropped into the Iziz city.

```
python build.py                         # dist/highlands.html (the whole kit, one page), roketstad.html
python verify.py dist/highlands.html --assert --views "Overview" --out shots
```

* `DESIGN.md` — the brief: branches, shared vocabulary, lighting rule, tags, the building list.
* `API.md` — the contract: registry, palette, kit items, helpers, rules for package work.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open.
