# Hosting Krator Worlds on your network

This guide is for anyone who wants to run the Krator site on their own computer and open it from other devices on
the same network (phones, tablets, other PCs). It covers Windows, Linux and macOS. The short reference for
maintainers is [README.md](README.md).

## What you get

One small web server, with no internet connection needed once it is set up:

| Address | What |
|---|---|
| `/` | the **Krator Worlds** gallery: every settlement, kit, arcology, port piece, watercraft set and biome (84 pages) |
| `/voth` | Krator's Voth, the city of cantons |
| `/menagerie` | the **World Menagerie**'s front page |
| `/iziz`, `/chicago`, `/moria`, `/tongue`, … | every World Menagerie world, at the same address it has on the Menagerie |
| `/healthz` | answers `ok` when the server is up |

The World Menagerie has its own Voth. It is **not** served: `/voth` is always Krator's.

## How it fits together

```
krator-master/                     (this repository, branch host-server)
├── settlements/ kits/ biomes/     Krator's worlds, each built to a page in its dist/ folder
├── gallery/build_gallery.py       collects those pages into one gallery
└── host/
    ├── WorldMenagerie/            the World Menagerie itself, embedded with its history (git subtree)
    ├── krator.toml                the settings you edit: port, Krator's routes, what to drop from the Menagerie
    ├── sync.py      ──────────►   menagerie/   the Menagerie pages to serve, minus its Voth   (generated)
    │                ──────────►   site.toml    the full route table the server reads         (generated)
    ├── gallery build ─────────►   site/        the gallery, with three.js served locally     (generated)
    ├── server.py                  the web server: serves only what site.toml lists
    ├── sitectl                    Linux: commands, and the systemd service
    ├── sitectl.py                 any system: the same commands, run in a terminal
    └── sitectl.bat                Windows: finds Python and runs sitectl.py
```

**Setup** fills the three generated folders and files. **Serve** starts the server. Nothing in `settlements/`,
`kits/`, `biomes/` or `core/` knows that `host/` exists, and `tools/check_insulation.py` keeps it that way.

## What you need

- **Git**, to download the repository. On Windows: [Git for Windows](https://git-scm.com/download/win).
- **Python 3.11 or later**, and nothing else. On Windows: [python.org](https://www.python.org/downloads/windows/).
  Tick **"Add python.exe to PATH"** in the installer. The Microsoft Store "python" that Windows offers by default
  is only a shortcut to the Store, so install the real one.
- About **400 MB** of disk: the download is about 360 MB with its history, and setup writes 160 MB more.
- `node` is **not** needed. It is only used by developers who rebuild the biome worlds.

## Windows

All commands work the same in **Command Prompt** and in **PowerShell**. Or skip the commands: after step 1,
**double-click `host\sitectl.bat`** in Explorer. It sets up the site the first time, then runs it in that window
(close the window to stop it). If something goes wrong, the window stays open to show why.

### 1. Download

```
git clone -b host-server https://github.com/traviso761-debug/krator-master.git
cd krator-master
```

### 2. Set up (once, and again after each update)

```
host\sitectl.bat setup
```

This copies the World Menagerie's pages, builds the few Krator pages that a fresh download lacks (the port's),
assembles the gallery and checks every route. It takes seconds (longer on a slow disk) and ends by printing the site's addresses.

### 3. Run it

```
host\sitectl.bat serve
```

Leave that window open: the site runs as long as it does. **Ctrl+C** stops it. Command Prompt then asks
"Terminate batch job (Y/N)?"; answer `Y`.

Open the address it prints, such as `http://127.0.0.1:8001/` on this computer or `http://192.168.1.20:8001/` from
another device on the network.

### 4. Let other devices in

The first time the server starts, Windows asks whether Python may use the network. Allow it on **Private
networks** only. If you missed that prompt, or other devices still cannot connect:

1. Make sure Windows thinks of your network as **Private**: Settings → Network & internet → your connection →
   Network profile type → Private.
2. Run `host\sitectl.bat firewall`. It prints the one command, to be run in a terminal opened **as
   administrator**, that opens the port to private networks only, and the command that closes it again.

### Start it automatically at login (optional)

Press **Win+R**, type `shell:startup`, and press Enter. In the folder that opens, create a shortcut with this target
(use your own path):

```
C:\Windows\System32\cmd.exe /c "C:\path\to\krator-master\host\sitectl.bat serve"
```

Set the shortcut's **Run** option to *Minimized*. Delete the shortcut to stop it starting.

### PowerShell note

From PowerShell, `host\sitectl.bat serve` works as written. If you have changed into the `host` folder, type
`.\sitectl.bat serve`: PowerShell does not run programs from the current folder without the `.\`.

## Linux

```
git clone -b host-server https://github.com/traviso761-debug/krator-master.git
cd krator-master/host
python3 sitectl.py setup                    # copy, build what is missing, check
./sitectl install && ./sitectl enable       # a systemd user service named "krator"
./sitectl health                            # prints ok
./sitectl url                               # the addresses to open
```

(`setup` rather than `./sitectl build --no-build`: a fresh download lacks the port's built pages, and only
`setup` builds them without needing `node`.) To keep the service running after you log out and
start it at boot, run `sudo loginctl enable-linger $USER` once (`./sitectl boot` shows this).

Everyday commands: `./sitectl status`, `./sitectl logs`, `./sitectl restart`, `./sitectl reload` (applies a
`krator.toml` change without downtime), `./sitectl update` (after a `git pull`), `./sitectl disable`.

## macOS

```
git clone -b host-server https://github.com/traviso761-debug/krator-master.git
cd krator-master
python3 host/sitectl.py setup
python3 host/sitectl.py serve
```

The `python3` that comes with macOS is too old (3.9). Install 3.11 or later from python.org first. macOS asks
once whether Python may accept incoming connections; allow it.

## Command reference

| Windows (`host\sitectl.bat …`) or any system (`python3 host/sitectl.py …`) | Linux service (`host/sitectl …`) | What it does |
|---|---|---|
| `setup` | (`sync`, `build`, `check`) | first run: copy the Menagerie pages, build the gallery, check every route |
| `run` (or double-click the `.bat`) | | `setup` if it has never been done, then `serve` |
| `serve [--port N]` | `serve`, or `install` + `enable` | run the site; on Linux, `enable` runs it as a service that starts at login |
| `update` | `update` | after a `git pull`: copy and build again (the Linux service also reloads) |
| `sync [--check]` | `sync [--check]` | copy only the Menagerie pages; `--check` reports what has changed and copies nothing |
| `build [--all \| --no-build]` | `build [--no-build]` | build only the gallery (see below) |
| `check` | `check` | validate the route table and list every address |
| `url` | `url` | print the addresses to open |
| `health` | `health` | ask the running server whether it is up |
| `firewall` | | print the Windows firewall commands |
| | `status`, `logs`, `follow`, `restart`, `reload`, `stop`, `disable`, `boot` | manage the systemd service |

Build modes: by default, `sitectl.py build` builds only the worlds whose page is missing and reuses every other
built page. `--all` rebuilds every world, which needs `node` for the biomes. `--no-build` builds nothing. The Linux
`./sitectl build` rebuilds everything unless given `--no-build`.

Changes to Krator or Menagerie pages show up on the next page load, with no restart needed. A change to
`krator.toml` needs `sync`, then a restart of `serve` (on Linux, `./sitectl reload`).

## Keeping it up to date

**Everyone:** fetch the latest and rebuild.

```
git pull
host\sitectl.bat update          (Linux service: cd host && ./sitectl update)
```

Then restart `serve` if `krator.toml` changed.

**Maintainers: bringing in new World Menagerie work.** The Menagerie lives in its own repository (at
`../WorldMenagerie` on the original machine), and `host/WorldMenagerie/` is a copy of it with its history. Commit
the work in the Menagerie first, then, from the root of this repository:

```
git subtree pull --prefix=host/WorldMenagerie ../WorldMenagerie main
cd host && ./sitectl update
```

A fix made here, inside `host/WorldMenagerie/`, goes back with
`git subtree push --prefix=host/WorldMenagerie ../WorldMenagerie <branch>`. Commit such fixes on their own, touching
nothing outside that folder. One such fix is here and not yet in `../WorldMenagerie`: commit `ea0b6c1`, which lets
`server.py` run on Windows.

## Changing what is served

Everything is set in `host/krator.toml`. After an edit, run `sync`, then restart the server (Linux:
`./sitectl reload`).

- **Port.** `port = 8001` under `[server]`. Use a port no other program is using. Ports below 1024 need
  administrator rights.
- **This computer only.** `host = "127.0.0.1"` under `[server]` hides the site from the network.
- **Drop a Menagerie page.** Add its address to `drop_routes` and its files to `drop_paths` under `[sync]`. Its
  Voth is dropped this way.
- **Add a Krator page.** Add it to `ENTRIES` in `gallery/build_gallery.py` and run `build`. It appears in the
  gallery and at `/worlds/<slug>.html`.
- **Replace the old Menagerie service (Linux, original machine).** The Menagerie's own service, `menagerie`, still
  uses port 8000. To retire it and give its port to this one: `systemctl --user disable --now menagerie`, set
  `port = 8000`, then `./sitectl sync && ./sitectl restart`.

### Not served, on purpose

- The World Menagerie's **Voth** (`voth.html`, `src/voth`, `css/voth.css`). Its source is in
  `host/WorldMenagerie/`, but it is never copied or served.
- The Menagerie's **raw OpenStreetMap cache** (`data/osm/raw`, 561 MB). The pages do not need it, and it is not in
  the repository.
- Seven **development pages** that are not in the gallery: the Ancients kit's `skyi`, `skyj`, `skyk` and `dalab`
  targets, and Iziz's agent sheets `w-a`, `w-b`, `w-c`.

## Keep it on your network

The server is for a home or office network. **Never forward its port on your router** or expose it to the
internet. It serves only the files its route table lists and nothing else, but it has no passwords or HTTPS.

## Troubleshooting

| Problem | Fix |
|---|---|
| `sitectl: needs Python 3.11 or later` | Install Python from python.org with "Add python.exe to PATH" ticked, then open a **new** terminal. |
| Typing `python` opens the Microsoft Store | Windows' Store shortcut. Install Python from python.org, or turn the shortcut off: Settings → Apps → Advanced app settings → App execution aliases. |
| `no site.toml yet` | Run `setup` first. |
| `Address already in use`, or "only one usage of each socket address" | Another program, or another copy of the server, has the port. Stop it, or run `serve --port 8002`. |
| Other devices cannot connect | They must be on the same network. Use the address with this computer's network IP, not `127.0.0.1`. On Windows, see step 4 above. |
| A world's page is blank | Open the browser's developer console (F12). A "MIME type" error means an old `server.py`: run `git pull`. |
| `build --all` fails on a biome | That build needs `node`. Use `build` without `--all`; the biomes' built pages are already in the repository. |
| `sync --check` says `DIFFERS from upstream` | `host/server.py` no longer matches `host/WorldMenagerie/server.py`. Make the fix in the Menagerie copy, then copy it over `host/server.py`. |

## For maintainers

- **Branch:** `host-server` on `traviso761-debug/krator-master`. It is proposed for `main` as pull request #3 and
  is not merged.
- **The rule:** nothing a world is built from (`settlements/`, `kits/`, `biomes/`, `core/`) may name `host/` or the
  Menagerie. Run `python3 tools/check_insulation.py` before you commit.
- **`host/server.py`** is a copy of `host/WorldMenagerie/server.py`, kept byte for byte identical. Fix it in the
  Menagerie copy, then copy it over.
- **`host/menagerie.lock`** records the git tree hash of the Menagerie copy that was last synced. `sync --check`
  compares the two. Commit the lock after a subtree pull and a sync.
- **Generated, never committed:** `host/site/`, `host/menagerie/`, `host/site.toml`.
- `sitectl.bat` has been read through but not yet run on a real Windows machine. `sitectl.py`, which does all its
  work, has been tested from a fresh clone.
