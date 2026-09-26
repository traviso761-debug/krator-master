# Biomes — one at a time

`src/` carries the biome CORE (`75-biome-10..40`) plus the host binding
(`75-biome-45-bind.js`) permanently, and **exactly one biome's own fragments**
(`76-5x..7x-biome-<name>-*.js`). The alternatives live here, uncompiled.

To swap:

```
mv src/76-*biome-hyperjungle-*.js biomes-available/hyperjungle/
cp biomes-available/eastabyss/*.js src/
```

then change the one call in the target's `89z-rows.js` from
`HYPERJUNGLE.build({R,heroR,quality})` to `EASTABYSS.build({R,quality,lakeHue})`.
Nothing else differs; both expose `build` / `dress` / `canopyH` and both bake
through `BIO.bake()`.

## Why one at a time, and not both

No structure needs two biomes, but `build.py` concatenates *everything* in
`src/` into *every* target — so leaving both in `src/` does not mean "either
one", it means **both always load**. And they cannot both load: they define
twelve item names in common (`pod`, `ucard`, `frond`, `ribbon`, `strand`,
`mossmat`, `lobe`, `bloom`, `rod`, `trunk`, `fungus`, `boulder`) into `BIO.defs`,
which is one flat registry. `BIO.def` warns "defined twice" and then overwrites
the entry and pushes the name into `BIO.order` a second time, so whichever
loaded first silently renders with the other's geometry.

**Namespacing the keys was tried and reverted.** Prefixing eastabyss's items
`ea:` fixes the clash here, but eastabyss's own showcase — and its host
fragments — place those items by bare name, so the prefix breaks the biome in
its home tree (`biomes/eastabyss`: error panel dirty, 580 565 instances down to
163 040). A fix that only works in one of the two worlds is drift, which is
exactly what `BIOME-API.md` and the biome tree's own build.py exist to prevent.
If both biomes ever genuinely need to coexist in one world, the fix belongs in
the **core** (`BIO.def`/`BIO.put` namespacing per biome, in `biomes/*/src/20-core-kit.js`),
not in one biome's fragments — and it has to be copied to every world.

## Keeping them from drifting

These files are copies of `../../biomes/<name>/src/`. Edit them THERE and copy
across, never here. As of the port they are byte-identical to the home tree.
