# kits/metropolis: API

What a host (the Ancient's Valley, or any page that reads the kit's fragments in place) calls. The towers' records, plans and shells are
described in `README.md` and `PLAN.md`; this page is the overgrowth (2026-11-09: the owner wants the ruins themselves overgrown, Midgar at the
end of FF7, Girder's middle sections all over) and the look keys it adds.

## Looks

A **look** is a state (`intact`, `gutted`, `crown`, `broken`, `stump`, `skeleton`, `fallen`) or a state with a variant: `crown.wild` is the
crown state overgrown. `MP.look(s)` splits one: `{state, variant, wild}`. Every reader of a state takes a look (`MP.ruin`, `MP.debrisPlan`,
`MP.heaps`, `MP.debris`, `KSHELL.record`, `MP.hero`), so a host key is `family + '.' + look` and splits as `family` and the rest
(`k.split('.')[0]`, `k.split('.').slice(1).join('.')`).

- `MP.hero(family, look, lite, only)`: the hero; for a `.wild` look, the state's hero with `MP.overgrowDress` run on it.
- `KSHELL.record(F, look)`: the state's record under the look's own id (`spindle.crown.wild`), so a wild shell packs and bakes beside
  the clean one. `record.state` is the base state, `record.look` the look.
- `MP.debris(F, look)`: the state's rubble (a wild look lies on the same heaps).

## The sockets (`44b-mp-sockets.js`, `[G data]`)

```js
MP.sockets(F, look, seed, o)        // -> [{x, y, z, nx, ny, nz, kind, size, r, u, seed, p, t, f}] in the hero's frame
MP.socketsAt(F, look, seed, density) // the same, keeping the sockets with u < density
MP.socketInside(F, socket, pad)      // true when the socket sits on its skin part (a heap's on its mound): a sanity check
MP.skin(F)                           // the family's skin as parts (polar, arc, box; the same numbers the builders draw from)
MP.skinAt(F, part, t, f, y)          // the part's skin point under a socket's parameter at height y (a strand follows the wall down)
```

`F` is a family record (`MP.FAMILY[id]`: the Spindle, the Ledger and the fourteen designs). `seed` is an int; `o.spacing` is the metres
between sockets along the skin (6), `o.kinds` a Set of the kinds wanted.

| kind | where | normal | sizes |
|---|---|---|---|
| `ledge` | a window sill on every other storey, a balcony, a terrace, a parapet planter, the Spiral's ramp tread | out and a little up (a terrace: up) | vine, shrub (a terrace: tree) |
| `wall` | a crack mid-storey, every fourth storey | out | vine |
| `floor` | a storey's slab 1.5 m in from the skin, open to the weather (every look but intact); a skeleton's bare slabs all over | up | vine, shrub, tree |
| `edge` | the torn rim where the tear leaves the storey | out and up | vine, shrub |
| `top` | the cut top (the torn storey's floor), or a flat roof that stands (a roof park), at six tenths of the spacing | up | shrub, tree |
| `root` | the foot, 1.2 m out from the plinth | out | shrub, tree |
| `heap` | the rubble mounds of the states past gutted (`MP.debrisPlan`), on their slopes | up the slope | shrub, tree |

`size` says how big a plant the socket holds; `r` the room it has in metres (a sill 0.6, a top up to 5); `u` a unit hash in [0, 1), so a
host keeps `u < density` and the same sockets come first as its density rises; `seed` a u32 for the plant; `p`, `t`, `f` the skin part and
its parameter. Deterministic by (family, state, seed, part, level, index); the test proves it for every family and state, every socket on
its skin and under the state's top (`tests/test-metropolis.js`). About 1,100 sockets a Spindle crown, 500 a Ledger, 4,300 the Swell.

## The growth the kit draws (`59e-mp-overgrow.js`, `[draw]`)

```js
MP.overgrow(G, F, state, o)   // -> G, changed in place: strands, roots, moss, soil, the kit's stand-ins; G.userData.wild = the counts
MP.plant(F, state, at, o)     // -> {asked, planted}: o.plant(socket) per kept socket, in the world frame of at = {x, y, z, yaw}
MP.overgrowDress(G, family, state, o)   // what MP.hero does for a '.wild' look (below)
```

`MP.overgrow` draws into the hero so every tier reads it: creeper strands as tubes (four sides) hugging the wall down from a sill, a torn
edge or a rim, swaying and forking once, with leaves; roots down the plinth at the foot; moss and soil in the vertex colours round each
wet socket (a green-brown blotch spreading from a floor, a top, an edge or a terrace; a drip under a sill; a damp band at the foot);
rubble soil on the open floors and tops; and the kit's own stand-in plants (a bush at a shrub socket, a small tree at a tree socket).
The geometries whose colours change are copied with their other buffers shared, so a hero whose buffers another hero shares (the
valley's flattened stub) keeps the other clean. Options: `o.density` 0..1 (`MP.WILD_DENSITY`, 0.6), `o.seed`, `o.tint` `[r, g, b]`
multiplied into the moss, the leaves and the soil (the biome's colour), `o.standins` `true | false | fn(socket)`, `o.strands`,
`o.moss`, `o.soil` (each true unless false), `o.cap` (`MP.WILD_CAP`, 900 sockets at most, the lowest units first), `o.sockets`
(ready-made). It adds two materials to `MP.mats()`: `vine` (bark) and `moss`; the stand-ins take `green`. A wild hero may hold
`MP.WILD_BUDGET` (1.6) times its family's triangle budget (`userData.tris`, the kit's own: the growth is 13 to 41 k triangles a hero on this page;
the page's planting is counted apart in `userData.floraTris`, 30 to 60 k).

`MP.plant` is the biome adapter: the host's kits grow their species at the sockets. Each kept socket is handed over turned and moved
by `at` (`x, y, z, nx, ny, nz` in the world; the hero-frame record under `local`); `o.plant` returns true when it planted. `o.kinds` and
`o.sizes` (Sets) narrow the sockets; `o.density` and `o.seed` must match the overgrow call so the same sockets are meant.

A host that recolours heroes (the valley's rust) runs `MP.overgrowDress` or `MP.overgrow` after its recolouring, so the moss lands on
the rusted colours and is not rusted itself.

## The page's own dress (`MP.overgrowDress`)

For a `.wild` look `MP.hero` runs `MP.overgrow` at the defaults and then, when the lowland kits are on the page (`59d`, `MP.flora.ok()`)
and the hero is not an impostor's (`o.lite`), plants them on the standing sockets: a tree socket on a top, a floor, a heap or at the foot
takes one of the small lowland trees (magnolia, tree fern, jacaranda, banksia, pompom, grass tree, skirt palm, cane palm) scaled by its
room; a shrub socket there, or on a terrace, a floor plant (fern, azalea, iris, heliconia, giant fern, shrub, moss, grass). The kit's
stand-ins are kept for the rest (sills, cracks, edges). The planted meshes are added to the hero flagged `userData.noShell`, which
`KSHELL.bake` skips (a leaf card bakes as a solid quad), so a wild shell holds the strands, the moss, the soil and the solid stand-ins.

## The test bed

Views `Wild, <family>` stand every family in three states (gutted, crown, stump), each clean beside its wild look; `Wild pair, Spindle
crown` and `Wild pair, Ledger gutted` stand a wild hero beside its baked wild shell; `Wild hero / Wild shell, Spindle crown, 130 m` and
`Wild, Spindle crown, the top` look close. `MP.WILD_KEYS` (six: the Spindle's and the Ledger's gutted, crown and stump) take heroes, shells
and rubble; `MP.WILD_IMP` (two) impostors too, and those two stand in the tiers' city on about 45 % of the matching ruins. The shells pack
two 2048 atlases (`MPS.atlases`, one material each). `verify.py --assert` checks each wild key for sockets, strands and moss, its budget,
its shell slot, and the negatives (no growth at density 0, a socket moved off the skin fails the inside test).
