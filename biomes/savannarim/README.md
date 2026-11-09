# biomes/savannarim: the savannah rims

Krator's monsoon savannahs, 0.6 to 1 km above the hyperjungle's floor at 1.7-1.9 atm: hyperjungle N's abyssal savannah (station 3,
`north`), the e rim near Fridon (station 2, `east`) and the se rim, the incense country near Talia (station 1, the page as built).
The plan is `biomes/hyperjungle/PLAN-LANDS.md`; `PLAN.md` here holds the core adoption and the order; `KNOWN_ISSUES.md` what is open.

```
python3 tools/build.py biomes/savannarim                    # station 1, dist/savannarim.html
python3 tools/build.py biomes/savannarim --station north    # station 3, dist/savannarim-north.html
python3 tools/build.py biomes/savannarim --station east     # station 2, dist/savannarim-east.html
```

- **One stage for every land.** `src/45-host-stage.js` draws the map from `LAND` (`44l-host-land.js`: a station's own replaces it): the
  rise, the river, the forest's edge, kopjes, laterite, dambos, the fires. `src/87-host-land.js` places the base on it, and a land's own
  species in its `landOwn` (the e rim's and the se rim's, in their `44l`).
- **The kit** (`50`, `55`, `60`, `70`: `SAVRIM`): the species records, the builders (`SAVRIM.<key>.make/grow`, `SAVRIM.builders`) and the
  grass passes (`SAVRIM.grass`, `SAVRIM.blindGrass`, read in place by the hyperjungle's station `north` for its gaps).
- **The neighbours are read in place**, never copied (`build.py` NEIGH): the hyperjungle on every page (its six for the gallery forest and
  the outliers, its lands' builders: the bone giants, the bloodwood, the comb tree, the elephant ear), and per station the cousins' kits
  (BIO.kin: eastabyss, ehighlands, sedesert, crater-drylands).
- Switches: `?land=0` (none of the land's passes), `?fire=0`, `?season=0`, `?kground=0`, `?far=0`, `?hz=0`, `?groundtint=0`.
