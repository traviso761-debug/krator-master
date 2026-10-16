# Setting up the tools

Only Godot connects through an MCP server. Blender runs headless from the shell, and Meshy is a REST API.

## Blender 4.5 LTS + MPFB2

- Linux tarball from `download.blender.org/release`; it runs headless as is: `blender -b --python script.py -- <args>`.
- MPFB from `extensions.blender.org/add-ons/mpfb`:
  `blender -b --python-expr "import bpy; bpy.ops.extensions.package_install_files(filepath='mpfb.zip', repo='user_default')"`
- Asset packs from `static.makehumancommunity.org/assets/assetpacks`, loaded once with
  `bpy.ops.mpfb.load_pack(filepath=...)`: makehuman_system_assets, hair01, eyebrows01, shirts01, pants01, skirts01,
  dress01, shoes01, suits01 (CC0); bodyparts05 (beards, CC0); hair02, hair03, bodyparts06 (CC-BY: keep a CREDITS file).
- Community-repository hair and beards need texture-name fixes and a skip list for broken items.
- Build humans with `detailed_helpers=True` and the Mixamo-style rig.
- A full per-body build (refit every item once per slider end) takes about 10 minutes; run it in the foreground with
  a timeout, not in the background.
- Cloud sessions don't ship Blender: install it in the start hook or fetch it when needed. It is large.

## Meshy

- REST API at `https://api.meshy.ai/openapi`, Bearer key from the Meshy dashboard.
- Text-to-3D preview (about 20 credits), refine (10), auto-rig (5), animation library (3 per clip on a rigged model).
- Save task ids beside the output so a rerun resumes instead of paying again.
- The key: in a file outside the repo, named by `MESHY_API_KEY_FILE` (or `MESHY_API_KEY`); never printed, never
  committed. Check `git diff --cached | grep -cE "ms[y]_[A-Za-z0-9]{8,}"` is 0 before each commit.
- Cloud sessions: the network policy must allow `api.meshy.ai`.

## Godot 4.5

- `github.com/godotengine/godot/releases`, tag `4.5-stable`, Linux x86_64; link as `~/.local/bin/godot`.
- Headless tests: `godot --headless --path <project> --script res://tests/x.gd`.
- MCP (Claude drives the editor): `tomyud1/godot-mcp` v0.6.0, its `addons/godot_mcp` in the project with the plugin
  enabled, and in `.mcp.json`:
  `{"mcpServers":{"godot":{"command":"npx","args":["-y","godot-mcp-server@0.6.0"]}}}`
  With the editor open the plugin shows "MCP Connected" (it talks to `127.0.0.1:6505`). In the cloud, run the editor
  under Xvfb; scene runs and screenshots are slow there, so take screenshots with a headless script instead.
- Cloud sessions: a SessionStart hook (checking `CLAUDE_CODE_REMOTE=true`, skipping what is installed) installs Godot,
  Python playwright, and warms the MCP server's npm cache.

## Browser checks

Playwright with the preinstalled Chromium (`/opt/pw-browsers`), launched with `--use-gl=swiftshader`
`--enable-unsafe-swiftshader` for WebGL. Serve the built page over a local HTTP server; route large vendored scripts
to local files.
