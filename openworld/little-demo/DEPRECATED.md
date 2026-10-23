# Little Demo is deprecated (2026-10-20)

The owner decided that the eastern-desert open world is not maintained any more. Nothing builds from this folder.

## What it was

The first open world: the scale model's "little demo" region (the eastern desert, about 1,080 x 1,370 km) at 1:1,
streamed, with the sedesert, eastabyss, hyperjungle and ebadlands kits' flora placed by climate, six baked town tiles
and twelve highways (`README.md`). Its page is `dist/little-demo.html` (and the artifact copy), as last built.

## What moved, and where

The Isle Demo (`openworld/isle-demo`, `settlements/isle-demo`) read this world's fragments in place. They were moved
with `git mv` (contents unchanged) from `openworld/little-demo/src/` to `openworld/isle-demo/src/world/`:

`00-head.html`, `41-world-fields.js`, `42-world-roads.js`, `45-world-host.js`, `80-world-sky.js`,
`81-world-terrain.js`, `83-world-water.js`, `83w-world-seas.js`, `84-world-nursery.js`, `85-world-flora.js`,
`86-world-floor.js`, `87-world-places.js`, `88-world-towns.js`, `90-world-camera.js`, `91-world-probe.js`,
`98-world-start.js`, `99-tail.html`.

Isle-demo's pages rebuild from them byte-identical (the settlements page's two path labels excepted: the label of a
fragment names its path). The world's probe checks that `openworld/isle-demo/verify.py` runs are
`src/world/91-world-probe.js`'s.

## What stays, and what is broken

Left in place: `build.py`, `bake.py`, `publish.py`, `verify.py`, `data/`, `bake/`, `source/`, `shots/`, the docs, the
built pages, and the two fragments only this build used: `src/46-world-config.js` and `src/47-world-kits.js`
(isle-demo has its own).

**`build.py` no longer runs here**: it lists `00-head.html` and the other moved fragments from its own `src/`. That is
accepted because the world is deprecated. To rebuild it anyway, check out the commit before the move (or `git mv` the
fragments back). `bake.py` and `publish.py` need a built page, and `dist/` still holds the last one.

Mentions of little-demo elsewhere (comments in biome and core fragments that are embedded in built pages, history in
plans and known-issue notes) were left as they are: editing an embedded comment changes a built page's bytes.
