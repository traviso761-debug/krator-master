# host/desktop/: the Krator Worlds desktop app

A small window that gives this computer the Krator Worlds gallery (the same pages as the shared artifact), always
built from the latest `main` on GitHub.

```
python host/desktop/krator_worlds.pyw
```

or double-click `krator_worlds.pyw` (Windows runs `.pyw` files with `pythonw`, so no console opens). The window's
**Desktop shortcut** button puts a "Krator Worlds" shortcut on the Desktop.

## What it does

| Button | What happens |
|---|---|
| **Check GitHub** (also on start) | asks GitHub for the newest commit on `main` and says whether this computer has it |
| **Get the latest** | the first time, a shallow clone of `main` into `%LOCALAPPDATA%\KratorWorlds\krator-master` (one commit, no Git LFS images: the built pages carry their textures). After that, fetches `main` and resets the copy to it. Then `host/sitectl.py update`: syncs the Menagerie pages and builds the gallery into the copy's `host/site/` with local three.js and the level-of-detail bar, building only the pages GitHub does not carry (the port's) |
| **Open Krator Worlds** | serves the copy's `host/site.toml` on `http://localhost:8011/` (this computer only: `127.0.0.1`) and opens it in the browser. Closing the window stops the server |

It never touches a working checkout. Everything it keeps is under `%LOCALAPPDATA%\KratorWorlds\` (on Linux and
macOS, `~/.local/share/KratorWorlds/`); delete that folder to start over.

## Needs

Python 3.11 or later (tkinter and tomllib come with it) and git. The first download is large (the repository's
built pages, about 1 GB); later updates fetch only what changed.

## Notes

- Port 8011, not the LAN site's 8001 (`host/sitectl`), so both can run at once.
- `KRATOR_WORLDS_REPO` (a clone URL or path) and `KRATOR_WORLDS_HOME` (where it keeps its copy) override the defaults,
  for testing against a local clone.
- The pages a build moved its texture packs out of (`<page>.tex.<key>.js`, `tools/textures/matlib_pack.py`) are
  copied beside them by `gallery/build_gallery.py`, so they work here as they do in the shared gallery.
