# Copper Glacier

The alpine cryosphere of the southern Crook on map 5.1 (`rmvcopperglacier`): glaciers over gneiss and granite, the turquoise Copper Tarn,
and the copper of the eastern pass. Three station pages, each a 5.2 km square on its scale-model site. `PLAN.md` has the lore, the stations,
the life and the core adoption.

| Page | Build | What |
|---|---|---|
| `dist/copperglacier.html` | `python3 build.py` | station 1, Copper Tarn: a valley glacier from the east calving into the tarn; the icefall, crevasses, lateral moraines, an ice cave at each margin, the meltwater stream and its plume, frost coral and cushions on the moraines |
| `dist/copperglacier-pass.html` | `python3 build.py --station pass` | station 2, the copper slope over the pass: a hanging glacier, its terminal moraine and pond, the skarn's malachite and gossan, the four copper nodes the resource data places, copper flowers on the copper ground |
| `dist/copperglacier-icefield.html` | `python3 build.py --station icefield` | station 3, the high icefield at 6.5 km: plateau ice, nunataks of gneiss, the ice cliff at its edge, crevasses, ice caves in the wind's moats |

```
python3 build.py [--station pass|icefield]
python3 verify.py dist/copperglacier.html --assert --all-views
```

Verified 2026-11-03 on the GPU (both lanes, the harness's queue): all three pages pass `--assert --all-views` (53, 53 and 50 checks; 10.1, 15.1 and 1.75 M triangles), with KGROUND's relief and the reworked ice caves.

## How it is put together

- **One stage for every station.** `src/45-host-stage.js` makes the land from a station's numbers in `44z-host-site.js`. A station replaces
  only that fragment (`stations/<name>/44z-host-site.js`), and its `station.json` names its site on the 5.1 map.
- **The glacier is `core/terrain`'s `KGLACIER`.** The data half (`44g-core-glacier.js`) gives the ice, the trough, the moraines, the pond
  basin, and the seracs, bergs, crevasses and caves as records. The drawing half (`host/44h-core-glacier-draw.js`) draws them. It was lifted
  from the Throne's glacier station on 2026-11-03, which draws through it too.
- **The copper is the resource data's.** `res_site.js` reads `kits/resources/data/geology.json` round the site at build time, and the page
  carries the result as `CG_RES` (`44r`, virtual). It holds every node in the square, with its id, kind and grade, and the prospectivity of
  the 4 km cells. The copper field, the copper flowers, the malachite on the ground and the nodes' outcrops all read it.
- **Placement** (`src/60`) draws each cell from `KRAND.cell` and never from a running stream. The frost coral's limbs are polylines joined to
  their parents by `BIO.flareJoin`, drawn in one `BIO.tree` scope each.
- **The universal set**: KGROUND layers on documented masks, with KGROUND's relief and the mesh's cavities (and `tri` on the pass) (`84`), KFAR and KHORIZON (`85`), core/water with still water that has no surf or
  breakers, the plume, the mirror switch off at load and the shore's fields (`89w`, `89z`), KSHADOW (`89z`: measured, off at load, `?shadow=1`), the shared sky at
  each site (`89`), the air row (`89a`).

## Switches

`?shadow=1` · `?kground=0` · `?relief=0` · `?tri=0` · `?polygon=0` · `?plume=0` · `?fields=0` · `?far=0` · `?hz=0` · `?hfog=0` · `?snow=0` · `?q=0.5` · `?nobake=1`
· `?index=0` · `?lodmerge=0` · `?lodfade=0` · `?lodcull=0`
