# host/

The LAN site server for Krator. It serves the Krator Worlds gallery and, next to it, the World Menagerie's
pages (its Iziz fork, the OpenStreetMap cities, the fan works, the Tongue), pulled from the copy of the
Menagerie embedded at `host/WorldMenagerie/`. Nothing needs the internet: three.js is served locally.

**To set it up and run it (Windows, Linux or macOS), read [HOSTING.md](HOSTING.md).** This file is the maintainers'
reference.

## The rule

The dependency runs one way: `host/` reads Krator's **built** pages and the Menagerie's files. Nothing a world is
built from (`settlements/`, `kits/`, `biomes/`, `core/`) may name `host/` or the Menagerie.
`python3 tools/check_insulation.py` enforces this. Krator code you want from the Menagerie (its controls or flight
model, say) is vendored into a build like any other shared fragment, converted to fragment form and listed for
`build.py --vendor-check`. It is never imported from `host/`.

## Site map

| URL | What |
|---|---|
| `/` | the Krator Worlds gallery (also `/krator-worlds`) |
| `/worlds/<slug>.html` | each gallery page; `/worlds/three.min.js` is the r128 build they all load |
| `/voth` | Krator's Voth (also `/voth.html`, `/cantons`). The Menagerie's Voth is not served |
| `/menagerie` | the Menagerie's front page (also `/home`), moved from `/` |
| `/iziz`, `/chicago`, … `/krator`, `/tongue` | every other Menagerie route, at the same URL as on the Menagerie |
| `/src/*`, `/data/*`, `/css/*`, `/vendor/*` | the Menagerie's modules, data, styles and three.js |
| `/scenes.json` | the scene menu the Menagerie pages carry: Krator's entries first, then the Menagerie's |
| `/healthz` | returns `ok` |

## Files

| File | Committed | What |
|---|---|---|
| `krator.toml` | yes | the hand-written config: server settings, Krator's routes, and `[sync]` (where the Menagerie is, what to drop) |
| `sync.py` | yes | copies what the Menagerie's `site.toml` serves into `menagerie/`, then writes `site.toml` |
| `server.py` | yes | **vendored** from the Menagerie, byte for byte. `./sitectl sync --check` reports drift. Fix it upstream, then copy it again |
| `sitectl` | yes | adapted from the Menagerie's: the systemd user service `krator` (Linux) |
| `sitectl.py` | yes | the same commands without systemd, for any system: `setup`, `serve`, `update`, … |
| `sitectl.bat` | yes | Windows: finds Python 3.11+ and runs `sitectl.py`. Kept CRLF by `.gitattributes` |
| `HOSTING.md` | yes | the setup guide for every system |
| `WorldMenagerie/` | yes | the World Menagerie itself, with its history: a git subtree (see below). Its Voth is in the source but never served |
| `menagerie.lock` | yes | the Menagerie tree last synced (its git tree hash), and whether it had uncommitted changes |
| `site.toml` | no | generated: `krator.toml` followed by the Menagerie's routes and mounts |
| `menagerie/` | no | generated: about 80 MB (the Menagerie's 561 MB raw OSM cache is never copied) |
| `site/` | no | generated: the gallery built with local three.js, about 80 MB |

## Use

```
cd host
./sitectl sync          # pull the Menagerie pages, write site.toml
./sitectl build         # rebuild every world, then the gallery into site/ (--no-build: reuse built pages)
./sitectl serve         # run in the foreground on port 8001; or, as a service:
./sitectl install && ./sitectl enable
./sitectl update        # later: sync, build, reload
```

The biome builds need `node` for their syntax check. On a machine without it, `./sitectl build` stops at the
first biome; `./sitectl build --no-build` uses the pages already in each `dist/`.

To add a Krator page, add it to `ENTRIES` in `gallery/build_gallery.py`, as for the artifact. To drop another
Menagerie page, add its route to `drop_routes` and its files to `drop_paths` in `krator.toml`.

The service listens on port 8001 so it can run beside the Menagerie's own (`menagerie`, port 8000). To replace
that one: `systemctl --user disable --now menagerie`, set `port = 8000` in `krator.toml`, then `./sitectl sync` and
`./sitectl restart`. Serve it on the LAN only; never port-forward it.

## The embedded Menagerie

`host/WorldMenagerie/` is the World Menagerie with its full history, added with `git subtree`, so a clone of
Krator serves everything with no second checkout. `sync.py` copies from it what the Menagerie's `site.toml` serves,
less the drops above. Its Voth stays in the source tree but is never copied or served.

To bring in later Menagerie work from its own checkout (commit it there first; run from the repo root):

```
git subtree pull --prefix=host/WorldMenagerie ../WorldMenagerie main
cd host && ./sitectl update
```

Changes made here, inside `host/WorldMenagerie/`, go back with
`git subtree push --prefix=host/WorldMenagerie ../WorldMenagerie <branch>`. Keep such commits to that folder alone.
`[sync] menagerie` in `krator.toml` can still point at a separate checkout instead.
