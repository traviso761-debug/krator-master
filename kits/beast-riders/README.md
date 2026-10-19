# kits/beast-riders: the Beast Riders kit

The Beast Riders' buildings as a set of their own (owner, 2026-10-18). The riders are the hyperjungle's tribes (LORE 6.6:
Quetzal, Wingclaw, Nightwing, Raptor, Staghorn, Threehorn, Hardshell, Tiger, Mammoth...), united by Queen Mav; they
ride and keep great beasts, flying and running, and their towns are Mav's Refuge, Girder and Pinnacle Rock, with a
quarter in Kautoa (Ridertown, `settlements/isle-demo`).

```
python3 build.py                                   # dist/beast-riders.html
python3 verify.py dist/beast-riders.html --assert [--shots DIR]
python3 ../../tools/textures/pack.py kits/beast-riders   # (from the repo root) after a change to materials.json
```

## What it is

**Catalog buildings** (`ASSET`, culture `beast-rider`) on the catalog's engine (`kits/catalog`: `krator-furniture-core.js`,
`krator-asset-engine.js`), read in place:
- **The kit's own** (`src/50-br-mounts.js`), the mounts' buildings, which no build had:
  - `br_bldg_raptor_stable`: a long stable for the running mounts (raptor, staghorn, tiger), stalls on a straw floor
    under a hip roof, its fenced paddock before it (two variants: five stalls or four);
  - `br_bldg_great_byre`: an open byre on log posts for the great beasts (threehorn, hardshell, mammoth), hung hides
    for a windbreak, long troughs, hay ricks, a trampled yard round it;
  - `br_bldg_rookery_tower`: a free-standing roost tower for the flyers (quetzal, wingclaw, nightwing): raked log legs,
    a deck at 13.5 m with perch rails out on four sides, nests, a thatch canopy, a ladder, a feed hoist and shed.
- **Girder's and Mav's Refuge's** (`kits/catalog/krator-master-buildings-beast-rider.js`, 13 keys): the deck lots,
  nature shrine, council chamber, rain canopy, roost gallery, gateway-tree facades, room fronts, Girder's tower, roost
  deck, dwellings, houses, assembly hall and palisade. They stay in the catalog, where Girder, Mav's Refuge and Voth
  read them; the kit shows them with its own beside them. **They are lossy hand-made copies** of the two towns' own buildings (`KNOWN_ISSUES.md`):
  the faithful port from Girder's and Mav's Refuge's sources is the next step.

**Textures** (`materials.json`, `tex/`): the library's detail maps on the vertex-coloured, UV-less meshes, triplanar
(the catalog's `krator-furniture-detail.js`), at building scale with Girder's picks (thatch, planks, ironbark, rock,
cloth, rope, leather, cane), and the kit's three surfaces (delivered 2026-10-18): `straw.bedding` (stall floors, hay,
nests: family `'straw/cloth'`), `wood.guano` (the perches and the roost deck: `'guano/wood'`), `ground.stable.yard`
(the paddocks and yards: `'yard/stone'`). The build merges the catalog's packed maps with the kit's into `KF_TEX`; the
catalog itself is unchanged.

**The page**: every building and variant in rows (the kit's own first), with the catalog's dev tools read in place:
the click inspector (`kits/catalog/inspector.js`: select, measure, isolate, cycle variants, audit declared sizes), the
hover inspector (T) and the polygon tool (P). The probe is `window._kit`.

## Taking the buildings into another build

Load the catalog's core (and the beast-rider and generic furniture files, for the pieces the buildings place), then
`kits/catalog/krator-master-buildings-beast-rider.js` and this kit's `src/50-br-mounts.js`, read in place, and build a
key with `buildAsset(key, x, z, ry, {variant})`. The isle demo does it in a sealed closure (`settlements/isle-demo/
bundles.py`, `CAT`). Each building's box is declared (`w`, `d`, `h`) and holds everything it draws.

## Checks

`verify.py --assert`: the page loads clean; every building of the culture builds, every variant; each fits its declared
box (1.6 m allowed, the catalog's rule); every catalog piece placed exists; the kit's three surfaces attach and every map
loads; the inspector, hover and polygon tools are on the page; a negative (a box shrunk by 3 m) is caught.

See `KNOWN_ISSUES.md`.
