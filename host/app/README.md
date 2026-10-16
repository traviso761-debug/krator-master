# host/app/: Krator Gallery, the one-click Windows app

`KratorGallery.exe` downloads the latest Krator from GitHub (`traviso761-debug/krator-master`, branch `main`),
builds the gallery of every Krator world with the World Menagerie beside it, and serves it on this computer and
the local network (the same site as `host/sitectl`; `host/README.md` has the site map). Nothing else needs to be
installed: the exe carries its own Python. Git is used when it is on PATH and is optional.

## Use

Double-click `KratorGallery.exe`.

| Button | What |
|---|---|
| Download latest and build | asks GitHub for the latest `main`; if this copy is older, fetches it, builds, and opens the gallery |
| Open gallery | starts the server (port 8001, or the next free one) and opens `http://localhost:<port>/` |
| Open Menagerie | the same, at the World Menagerie's front page (`/menagerie`: `[sync] menagerie_index` in `host/krator.toml`) |
| Stop server | stops it. Closing the window stops it too |
| Rebuild | builds again from the copy on disk (after a failed build) |
| Open folder | the folder the app keeps its copy in |

The top two lines say what is on this computer and what is on GitHub (`NEW:` when there is something to fetch).
**Update automatically** (on by default) looks at GitHub when the app starts and every 15 minutes while it is open
(`CHECK_EVERY`); when `main` has moved on it fetches, builds and, if it was serving, serves again on the same
port, so an open gallery tab only needs a reload. It never makes the first download (the button does), skips a
round while a button's work runs, and only logs a failure (offline, a broken build): what is built stays served.
New builds appear on their own: the gallery lists any build no `ENTRIES` line names (`gallery/README.md`).
**Let phones and other computers on this network open it**
serves on every interface, as `host/krator.toml` does; Windows asks once whether to allow it on the network
(allow Private only). Untick it to serve this computer only. `/share` shows the address other devices use.

The copy lives in `~/Krator Gallery/` by default (**Change...** picks another folder; settings are in
`%APPDATA%/KratorGallery/settings.json`). The app only ever replaces a folder it made itself: pick a folder with
other files in it and it makes `Krator Gallery/` inside it. It never touches a Krator checkout of your own.

## What it does

1. **Download.** With git: a shallow, partial, sparse clone (`godot/` and `archive/` left out, LFS textures as
   pointers: no page needs them); later updates fetch only what changed and `reset --hard` to it. Without git: the
   ZIP of that commit from codeload.github.com (about 650 MB), unpacked beside the old copy and swapped in (the
   whole download every time). Either way the folder holds about 2 GB once built (the built site is 580 MB of it).
   A first run took about 1.5 minutes on a fast connection (October 2026).
2. **Clear stale pages.** After a git update, the ignored files in every build's `dist/` (the pages the repo does
   not carry: Ys, the Port) are deleted (`git clean -X`) so they are built from the new sources.
3. **Build.** `host/sitectl.py setup`: sync the Menagerie into `host/menagerie/`, build the missing pages
   (`build_gallery.py --build-missing`: the biomes' node syntax check is skipped where node is absent), write
   `host/site/`, check `site.toml`. About two minutes.
4. **Serve.** `host/server.py --config host/site.toml --port <port>`, after writing `address.json` for `/share`.

State (the commit fetched, whether it built) is in `.krator-gallery.json` in the app's folder.

## Without a window

```
KratorGallery.exe --update [--force] [--build] [--serve] [--home DIR] [--local-only] [--no-auto]
python host/app/krator_gallery.py --update --serve        (from source: Python 3.11+)
```

`--serve` keeps serving until Ctrl+C and, unless `--no-auto`, updates automatically as the window does.

The windowed exe prints nothing to a console; redirect it (`KratorGallery.exe --update > log.txt`) or run the
`.py`.

## Linux (and macOS)

```
python host/app/build_linux.py        # writes host/app/dist/krator-gallery.sh, one file to send
bash krator-gallery.sh                # on the Linux machine
```

The script is a bash launcher with `krator_gallery.py` appended. It finds Python 3.11 or later (`python3.14` down
to `python3`; Ubuntu 22.04 needs `sudo apt install python3.11`), unpacks the app to
`~/.local/share/krator-gallery/`, and opens the same window. Without Tk (`python3-tk` on Debian and Ubuntu,
`python3-tkinter` on Fedora, `tk` on Arch) or without a display, it says so and runs `--update --serve` in the
terminal: download or update, build, serve until Ctrl+C, updating every 15 minutes. Settings are in `~/.config/krator-gallery/`. A
PyInstaller binary cannot be built for Linux from Windows and would tie itself to one glibc, hence the script.
Rerun `build_linux.py` after changing `krator_gallery.py`.

## Build the exe

```
pip install pyinstaller
python host/app/build_exe.py          # writes host/app/dist/KratorGallery.exe, about 15 MB
```

`build/` and `dist/` are not committed. The exe bundles the whole standard library because it stands in for
`python.exe`: a repo script that runs another through `sys.executable` (`build_gallery.py` runs each `build.py`)
calls the exe with the script's path, and `krator_gallery.run_script` runs it in UTF-8 mode, unbuffered, as
`sitectl.py` runs them. Some antivirus programs distrust new unsigned PyInstaller exes; if one quarantines it,
run from source instead.

The repo and branch are `REPO` and `BRANCH` at the top of `krator_gallery.py`.
