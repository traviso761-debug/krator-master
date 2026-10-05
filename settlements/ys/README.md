# Ys

The half-drowned capital of the Hykkousoi, on the ruins of an Ancient city at the head of the
north-west bay of the Ring Sea. **Phases 0–3 are built: the harness, the mockup, the Hykkousoi kit (`dist/kit.html`, `--assert` green)
and the city (`dist/ys.html`): the layout, shore and nav in `targets/city`, the placement pass (`88-city-place.js` records,
`88b-city-draw.js` draws them), twenty Ancient host types with grown pods, the bridge graph, the harbours and moles, the
river, the north-west bay biome on the land and the karst, and the building editor (the Edit button). Phase 4 (the record
and the gallery) is in `NOTES.md`'s last rounds; the foreign quarter's own kits are the last phase 3 piece.**

```
python3 build.py                                    # every target under targets/ -> dist/<name>.html (city -> dist/ys.html)
python3 build.py --vendor-check                     # vendored fragments still identical upstream? (adapted ones listed)
python3 verify.py dist/ys.html --assert --views "Opening — the bay from the head of the shore,Overview" --out /tmp/ys-shots
python3 verify.py dist/ys.html --hour 22 --cam=1000,60,500,200,8,-200 --out /tmp/ys-shots     # a night shot from anywhere
python3 verify.py dist/ys.html --marks /tmp/ys-marks.json --eval "()=>window._api.totals"
./run.sh log_city dist/ys.html --assert --all-views --out /tmp/ys-shots                        # background it; poll log_city.done
```

* `DESIGN.md` — what it is: the lore, the map, the datums, the Hykkousoi vocabulary, the building list,
  the drowned treatment, the interior rule, the biome, the marks, the dev tools.
* `PLAN.md` — how it gets built: engine, folder, fragments and seeds, phases and gates, invariants,
  budgets, risks, the reuse survey, assumptions to confirm.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open (printed by every build).
* `refs/` — the reference contact sheets (mood; never copy). `refs/index.txt` says what each holds.

In the page: hover to inspect (name · class · tags), Labels, the Polygon tool (copy-pasteable world
coordinates), Walk (F) at eye height, the hour slider, `n` noon/night, Compass (a rose that turns with the
camera and a ground gizmo at the orbit target). A preset is `[cx,cy,cz,tx,ty,tz, hour?, compass?]`.
