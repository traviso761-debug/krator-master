# kits/fauna: API

Units metres, seconds, kilograms. An animal's frame: origin on the ground under the middle of its body, **+z its snout**, y up,
x its left (three.js yaw: rotation.y > 0 turns +z toward +x).

## Files

| File | What |
|---|---|
| `fauna-core.js` | `ANIMAL({...})` (the registry), `FAUNA_VOCAB`, `FAUNA_YIELDS`, `FAUNA_FAMILIES`, `faHash`/`faNoise` (patches and markings), `faunaFrame` (the part builder below) |
| `krator-fauna-<group>.js` | the species, one file per group (README's table): livestock, mounts, farm, abyss, desert, bay, hyperjungle, flyers, crawlers, voth. Prefixes: `FA_SAL`, `faFm`, `faAb`, `faDs`, `faBy`, `faHj`, `faFl`, `faCr`, `faVo` |
| `krator-fauna-runtime.js` | `KratorFauna`: list, entry, has, build, animate, profile, lifeOf, setTextures, textures, warm, VOCAB, YIELDS |
| `fauna_bundle.py` | `bundle(groups)`: the closure; `files(groups)`; the packed maps as `FA_TEX` |
| `src/` | the sheet page (head, vendored sky, 90-sheet, hover inspector, polygon tool) |

A new species file is `krator-fauna-<group>.js`; the bundle picks it up by its suffix. Names in it are private to the closure,
but they share it with every other species file: prefix them (`FA_SAL`, `faSalKey`).

## The builder (`build(A)`)

| Call | Draws |
|---|---|
| `A.part(name, pivot, fn)` | what `fn` draws belongs to part `name`, turning about `pivot` (animal frame). Names the runtime animates: `body` (default), `head`, `tail`, `jaw`, `earL`, `earR`, `leg0`..`legN` (pairs front to back, left then right), `wingL`/`wingR`, `wing2L`/`wing2R` (each built outward from its root: +x the left, -x the right), `seg0`..`segN` |
| `A.tube(fam, c(t), rad(t), nt, ns, col, {caps, colf(t, angle)})` | a skin along a curve; the section an ellipse [half-width, half-height]; angle 0 is the top |
| `A.ellip(fam, x, y, z, rx, ry, rz, col, {rx, ry, rz, seg, colf(x,y,z)})` | an ellipsoid |
| `A.cone(fam, a, b, r0, r1, col, seg)` | a tapered rod, capped |
| `A.sheet(fam, f(u, v), nu, nv, col, {colf(u, v)})` | a free surface (a coat's skirt) |
| `A.locks(fam, [{at, dir, len, w, col, curl, side}])` | hanging hair: tapered, double-sided strips that droop at the tip |
| `A.anchor(name, [x, y, z])`, `A.profile(fn)` | points and a body profile a host fits tack to |
| `A.variant`, `A.breed`, `A.S` (the breed's scale), `A.pose`, `A.rnd()`, `A.rr(a, b)` | the build's options and its own seeded stream |

Families (the library set each maps is in `materials.json`; `core/materials/PLAN.md`, "The Fauna kit"): `coat` (thick fur, `fur.bat`),
`sleek` (short sleek hair: horses, deer, cats, cattle; `hide.strider`), `shag` (shaggy fur: the sloth; `fur.sloth`), `hair` (long hair,
double-sided), `skin` (`hide.leather033c`), `scale` (reptiles, birds' legs; `organic.scale`), `feather` (double-sided, no map yet),
`membrane` (double-sided: bat, pterosaur and insect wings; `membrane.bat`), `chitin` (`organic.chitin`), `horn`, `hoof`, `eye`, `mouth`,
`plain`, `glow` (unlit: its colour is its light). Each family's map is mixed in at its own strength (the runtime's `LOOK`). Colours are
sRGB hex or `[r, g, b]` 0..1 sRGB; the builder writes linear floats.

## The runtime

`KratorFauna.build(key, {variant, breed, pose, seed})` returns a `THREE.Group`: a child group per part at its pivot,
`userData = {key, name, variant, variantName, breed, S, tags, traits, yields, life, data, size, source, anchors, parts: {body,
head, tail, jaw, earL, earR, wingL, wingR, legs: [], segs: []}, tris, w, d, h, fauna: true}`. Materials are shared per family
across a page (one shader program each). A fresh build stands in its rest pose (`animate(g, 0, 'idle')`: a flyer's wings folded).

`KratorFauna.animate(group, t, mode, {phase})`: modes `idle`, `graze`, `walk`, `rest`, `fly`, `swim`; it sets only part
rotations and places (the body's bob, a chain's wave). An entry whose wings are folded into its shape lists
`poses: ['perch', 'fly']`: a host that flies it builds `{pose: 'fly'}` (the sheet swaps that build in for Fly).

Gait data an animal sets (`data`): `gait {type, freq, stride}`, `legs`, `wings`, `grazePitch`; and, read only when present:

| Field | What |
|---|---|
| `flap {freq, amp, glide, fold, sweep, foldScale, roll, tuck, sync}` | perched: fold droops the wings (about z), sweep turns them back along the flanks (about y), foldScale shortens them along the span (a folded wing is about half its spread), roll turns them about their own span first (so a folded wing hangs down the flank, not across the back: about 0.75); tuck: the legs swung back in flight; sync: the second pair beats with the first (a moth), not against it (a dragonfly) |
| `swim {freq, amp, axis}` | axis 'x': the tail beats up and down (flukes) |
| `chain {amp, wave}` | metres: the head, segments, legs and tail ride one travelling side-to-side wave in walk and swim |
| `idle {headYaw, headPitch, tailYaw}` | radians: how far the head looks about and the tail sways at idle |

A flyer or insect with legs walks by its leg count (2 biped, 4 quadruped, 6 hexapod). Gait `climber`: an animal hanging by a `grip`
anchor walks hand over hand along its bough (the sheet hangs it from one). Every frame starts from the rest pose, so no mode leaves a turn behind.

`KratorFauna.profile(key, breed, pose)` returns `{at(t) -> {z, y, hw, hh}, S, anchors}` or null. `KratorFauna.lifeOf(key)` returns
the life layer's record (diet, feeding, activity, temperament, habitat, locomotion, fleeDistance, aggression, herd, speed,
schedule[24], traits, yields, life). `KratorFauna.warm()` starts every packed detail map decoding (call it before building only a
few animals, so a later build does not wait on one).

## Checks (`verify.py --assert`)

vocabulary, traits, yields (each trait backed: milkable has milk, eggs has eggs, edible has meat), life (with size and source),
builds (every variant and breed, no NaN), inside the declared box (+10%), parts (legs == `data.legs`, wings if `data.wings`),
on the ground (legged builds), triangle budget (`data.budget`, default 9 000), animation (every mode keeps the animal in its
box), determinism, textures decoded. `--only key,key` loads the page with only those animals laid out (the assertions still
build every animal).
