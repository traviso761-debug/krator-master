# City of Iziz

Static pages for the City of Iziz project, served to the local network by a small Python server.
Which URLs exist is decided by `site.toml`.

**Site:** http://192.168.124.227:8000/

## Site map

| URL | Also at | File | Page |
|---|---|---|---|
| `/` | `/index.html`, `/iziz`, `/iziz.html` | `iziz.html` | Iziz: massing model |
| `/tongue` | `/izani-tongue` | `The-Izani-Tongue_2.html` | The Izani Tongue |
| `/image.png` | | `image.png` | The Iziz painting (also hung inside the city model) |
| `/healthz` | | (built in) | Returns `ok`, for checking the server is up |

Any other URL returns 404, including every file in this folder that isn't listed above.
A trailing slash is ignored (`/tongue/` = `/tongue`).

### `/`: Iziz massing model

A 3D city model built with three.js. It loads `three.min.js` from cdnjs, so the viewer's
device needs internet access. Izani script images (thumbnails, signs) are drawn in the browser, so
there are no image files to serve, except the painting below. The page has no sub-pages.
Its state lives in the URL.

**The painting in the city.** On load, the page fetches `image.png` (a relative URL, so it resolves to
`/image.png`) and swaps 6 wall posters in the inner city for framed prints of it. Clicking a building
with a print says "a framed print of the Iziz painting". If the image can't load, the posters stay as
they are. The settings are in `iziz.html`: search for `const ART=` to change the file, the count or
the frame colour. To use a different image, replace `image.png` (same name, no restart), or change
`src` there and add a route for the new file in `site.toml`.

**Query parameters** (`/?seed=42`)

| Parameter | Effect |
|---|---|
| `seed=N` | Builds a different city (1 to 2147483646). Default `1337`. Also works in the `#` part. |
| `debug` | Counts building overlaps into `window._overlaps` (developer use). |

**Hash parameters** (`/#v=...&t=...`). The page keeps these up to date as you move, and
**Copy link** in the Views panel copies them. Opening such a link restores the view.

| Parameter | Values | Meaning |
|---|---|---|
| `v` | `px,py,pz,tx,ty,tz` | Camera position and look-at target |
| `t` | `0`–`24` | Hour of day |
| `paused` | (flag) | Clock paused |
| `wire` | `off`, `edges`, `triangles` | Wireframe overlay |
| `under` | `solid`, `hidden`, `xray` | Surfaces under the wireframe |
| `colour` | `textured`, `clay`, `districts` | Colouring mode |
| `life` | `0` | Hide people and traffic |
| `weather` | `auto`, `clear`, `rain`, `fog`, `dust`, `windy` | Weather |
| `day` | `120`, `360`, `720`, `1440` | Day length (seconds per day) |

Example: `/#v=0,720,620,0,20,0&t=18&weather=fog`

A hash is only applied if it contains `v` or `t`.

**Built-in views** (from the Views panel, not the URL): Painting view, Overview, Palace, Temple plaza,
Street level, Bridge, Spaceport, Arena, Arena floor, Temple top, Temple hall, and depending on the
city: Sewer outfall, River falls, Rope bridge, The lake, The docks, Dock road, and Painting print (looks at
one of the framed prints).

Saved views and display settings are kept in each viewer's browser (`localStorage` keys
`iziz.savedViews` and `iziz.settings`), not on the server.

### `/tongue`: The Izani Tongue

A single long reference page. It is self-contained, with no external fonts, scripts or images.
Its sections, in order:

1. How to read the sound charts below
2. Consonants
3. Vowels
4. How sounds combine
5. Derivations
6. Seed lexicon
7. City lexicon
8. Names of places
9. Naming patterns
10. Syntax
11. Register & expressions
12. Alphabet
13. On the walls of Iziz
14. The world
15. Lore
16. English, on the same grid

The sections have no `id`s yet, so you can't link straight to one (`/tongue#syntax` won't scroll).
Add `id="syntax"` etc. to the `<section>` tags in the HTML to enable that.

### Not served

| File | Why |
|---|---|
| `The-Izani-Tongue_2.pdf` | Print version of the Tongue page (private). To publish it, add a `[[route]]`. |
| `server.py`, `site.toml`, `sitectl`, `README.md` | Backend |

## Files

| File | Purpose |
|---|---|
| `sitectl` | **Control script:** start, stop, restart, reload, logs. See [Managing the server](#managing-the-server). |
| `site.toml` | **Configuration:** listen address, port, headers, pages, folders |
| `server.py` | The server. Stdlib-only Python 3.11+. |
| `~/.config/systemd/user/iziz.service` | Runs the server in the background |
| `AUDIT.md` | Architecture and performance audit (2026-09-16) with the improvement plan |

## Managing the server

Use `./sitectl` from this folder. Never run it with `sudo`; it refuses.

| Command | What it does |
|---|---|
| `./sitectl status` | Service state and the site URLs |
| `./sitectl reload` | Check `site.toml`, then apply it with no downtime (alias `apply`) |
| `./sitectl restart` | Check `site.toml`, then restart. Use after editing `server.py`, host or port. |
| `./sitectl start` / `stop` | Start or stop the server |
| `./sitectl enable` / `disable` | Start now and at every login / stop and don't start at login |
| `./sitectl check` | Validate `site.toml` and list every URL. Nothing changes. |
| `./sitectl logs [N]` | Last N log lines (default 50) |
| `./sitectl follow` | Live log, Ctrl+C to quit |
| `./sitectl url` | Print the site URLs for this machine's current IPs |
| `./sitectl health` | Ask the running server if it's up |
| `./sitectl install` | Rewrite the systemd unit for this folder (after moving the project) |
| `./sitectl boot` | How to start the site at boot without a login |

`start`, `restart`, `reload` and `enable` run the config check first and stop if it fails, so a bad edit
never takes the site down. Editing HTML or images needs no command.

## Configuration (`site.toml`)

### Workflow

1. Edit `site.toml`.
2. Check it: `./sitectl check`. This prints the route table and exits non-zero on errors
   or missing files.
3. Apply it: `./sitectl reload`. No downtime. If the new config is invalid, the server
   logs `reload failed, keeping previous config` and carries on with the old one.
4. `reload` prints the last log lines, which confirm the reload.

Changing `host` or `port` needs `./sitectl restart` instead of `reload`.

Editing a page's HTML needs neither. Files are read on every request, and the `no-cache` header makes
browsers pick up changes on refresh.

### `[server]`

| Key | Default | Meaning |
|---|---|---|
| `host` | `"0.0.0.0"` | `0.0.0.0` = whole network, `127.0.0.1` = this machine only |
| `port` | `8000` | TCP port |
| `log_requests` | `true` | Log one line per request |
| `health` | (none) | URL that returns `ok`. Delete the key to disable. |
| `[server.headers]` | | Headers sent with every response |

### Adding a page

```toml
[[route]]
path = "/lexicon"              # canonical URL, must start with /
aliases = ["/words"]           # optional extra URLs
file = "lexicon.html"          # relative to this folder, or absolute
title = "Izani lexicon"        # optional, shown in --check
enabled = true                 # optional; false hides it without deleting the entry
[route.headers]                # optional, overrides [server.headers]
"Cache-Control" = "max-age=600"
```

The same URL can't be used twice. `--check` reports it.

### Serving a folder

For images, scripts, stylesheets or many pages, mount a folder instead of listing every file:

```toml
[[mount]]
prefix = "/assets"
dir = "assets"                 # /assets/img/map.png -> ./assets/img/map.png
[mount.headers]
"Cache-Control" = "max-age=3600"
```

Mounts never list directory contents, and requests can't escape the folder (`../` is refused).
Exact `[[route]]` paths take priority over mounts. When two mounts overlap, the longer prefix wins.

### Linking between pages

Use root-relative links such as `<a href="/tongue">`. They keep working if the IP address or port changes.

### Command-line overrides

```
python3 server.py --config other.toml     # different config file
python3 server.py --port 8080 --host 127.0.0.1
python3 server.py --check
```

## Service

`./sitectl` covers everyday use. Underneath, the server is a **systemd user service**, and these are the raw
commands. Run them **without `sudo`**. With `sudo`, they target root's
services and fail with `Failed to connect to user scope bus`.

| Task | Command |
|---|---|
| Status | `systemctl --user status iziz` |
| Apply `site.toml` changes | `systemctl --user reload iziz` |
| Restart (after editing `server.py`, host or port) | `systemctl --user restart iziz` |
| Stop | `systemctl --user stop iziz` |
| Start | `systemctl --user start iziz` |
| Start now and at every login | `systemctl --user enable --now iziz` |
| Stop now and don't start at login | `systemctl --user disable --now iziz` |
| After editing `iziz.service` | `systemctl --user daemon-reload`, then `restart` |

The service runs `--check` before starting (`ExecStartPre`). **If a listed page file is missing, the
service will not start.** Fix the path or set `enabled = false` on that route.

Current unit file:

```ini
[Unit]
Description=City of Iziz site server (routes in ~/DEVEL/CityofIziz/site.toml)
After=network.target

[Service]
WorkingDirectory=%h/DEVEL/CityofIziz
ExecStartPre=/usr/bin/python3 %h/DEVEL/CityofIziz/server.py --config %h/DEVEL/CityofIziz/site.toml --check
ExecStart=/usr/bin/python3 %h/DEVEL/CityofIziz/server.py --config %h/DEVEL/CityofIziz/site.toml
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

### Logs

```
journalctl --user -fu iziz             # follow live
journalctl --user -u iziz -n 50        # last 50 lines
journalctl --user -u iziz --since today
```

Plain `journalctl -u iziz` shows nothing because `-u` only searches system services.
As root, use `sudo journalctl --user-unit iziz -f`.

Request lines look like `192.168.124.200 "GET /tongue HTTP/1.1" 200 -`. Each 404 also logs a
`code 404, message Not Found` line. Browsers ask for `/favicon.ico` on their own, so those 404s are harmless.

### Starting at boot

The service starts when `snapwerks` logs in. For it to start at boot with no login, run once:

```
sudo loginctl enable-linger snapwerks
```

Check it with `loginctl show-user snapwerks -p Linger`. It is currently `Linger=no`.

## Network notes

- Anyone on the LAN can reach the site. It uses plain HTTP with no login. Don't port-forward it
  to the internet as-is.
- The firewall is off (ufw disabled, firewalld inactive). If you enable one: `sudo ufw allow 8000/tcp`.
- The router assigns `192.168.124.227` and may change it. Check with `hostname -I`, or reserve the address
  in the router's DHCP settings.
- `/` loads three.js from cdnjs. On a network with no internet access it won't render.
  `/tongue` is self-contained and works offline.

## Troubleshooting

| Symptom | Check |
|---|---|
| Site doesn't load | `systemctl --user status iziz`, then `curl http://127.0.0.1:8000/healthz` |
| Service won't start | `journalctl --user -u iziz -n 20`: usually a `problem:` line from `--check` |
| New page is 404 | Did you `reload`? Run `python3 server.py --check` to see the route table |
| Reload didn't take effect | Look for `reload failed` in the logs (TOML syntax error) |
| `Address already in use` | Something else is on the port: `ss -ltnp \| grep 8000` |
| Works locally, not from other devices | IP changed (`hostname -I`), device on a different network, or a firewall |
| `Failed to connect to user scope bus` | You used `sudo` with `--user`. Drop the `sudo`. |
