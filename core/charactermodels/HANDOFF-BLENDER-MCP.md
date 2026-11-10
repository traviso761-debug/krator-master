# Handoff: the Blender MCP server, for Gemini (2026-11-03)

How Claude reaches Blender on this machine, and how to give Gemini (Antigravity) the same tools.

## What Claude uses

- **The server**: Blender Lab's MCP server, `blender-mcp` 1.0.0 (https://projects.blender.org/lab/blender_mcp), installed
  as a Claude desktop extension. Its own Python environment, with the launcher, is at
  `C:\Users\travi\AppData\Roaming\Claude\Claude Extensions\ant.dir.gh.blender.blender-mcp\.venv\Scripts\blender-mcp.exe`.
  It speaks MCP over stdio. Checked 2026-11-03: started outside Claude, it answers `initialize` and lists 26 tools.
- **Blender**: 4.5.14 portable at `C:\Users\travi\Tools\blender-4.5\blender.exe`, with MPFB 2.0.18 and its system assets.
  The user environment variable `BLENDER_PATH` points at it (the server reads it).
- **The tools come in three kinds:**
  - `*_for_cli` (`execute_blender_code_for_cli`, `get_blendfile_summary_*_for_cli`): run `blender --background <file.blend>
    --python-expr ...` on a `.blend` you name. Your code must set `result = {...}` (a dict). 120 s timeout. Nothing is saved
    unless your code saves. **These work now**, and are what Claude used.
  - `search_api_docs`, `search_manual_docs`, `get_python_api_docs`: the bundled Blender API and manual. No Blender needed.
  - The rest (`execute_blender_code`, `get_objects_summary`, screenshots, `render_viewport_to_path`, `jump_to_*`...): talk to a
    **running** Blender over `localhost:9876` through the Blender Lab MCP add-on. **The add-on is not installed** in the
    portable Blender, so these fail with "Cannot connect to Blender at localhost:9876". To have them: in Blender,
    Preferences > Get Extensions > Repositories, add `https://lab.blender.org/`, install and enable the MCP add-on, start its
    server (port 9876; the server's `BLENDER_MCP_HOST` / `BLENDER_MCP_PORT` change it). Not tried here.

## Giving Gemini the same

Antigravity reads `C:\Users\travi\.gemini\config\mcp_config.json`, which also holds the `lotsofsounds` server. **Done
2026-11-03**: the `blender` entry below is in it (the file before is `mcp_config.json.bak-2026-11-03`). Reload MCP servers
in Antigravity or restart it to pick it up. The entry:

```json
{
  "mcpServers": {
    "lotsofsounds": { "...": "leave as it is" },
    "blender": {
      "command": "C:\\Users\\travi\\AppData\\Roaming\\Claude\\Claude Extensions\\ant.dir.gh.blender.blender-mcp\\.venv\\Scripts\\blender-mcp.exe",
      "args": [],
      "env": { "BLENDER_PATH": "C:\\Users\\travi\\Tools\\blender-4.5\\blender.exe" }
    }
  }
}
```

That borrows Claude's copy: a Claude extension update can move or replace it. For a copy of Gemini's own (PowerShell):

```
python -m venv C:\Users\travi\Tools\blender-mcp-venv
C:\Users\travi\Tools\blender-mcp-venv\Scripts\pip install git+https://projects.blender.org/lab/blender_mcp.git
```

then set `"command"` to `C:\\Users\\travi\\Tools\\blender-mcp-venv\\Scripts\\blender-mcp.exe`. (Needs Python 3.10 or newer; the
install reaches the network.)

To check it from Gemini: call `search_api_docs` (no Blender needed), then `execute_blender_code_for_cli` on any `.blend`
with `result = {"version": bpy.app.version_string}` (it needs `import bpy` in the code).

## How the character work really uses Blender

Most of it does not go through MCP. The garment and body pipeline runs Blender headless from scripts:

- `core/charactermodels/tools/rebuild.sh --only <male ids> <female ids>` with `BLENDER=/c/Users/travi/Tools/blender-4.5/blender.exe`
  and a short `LOGS` path (Git Bash). It runs `make_garments.py` and `mpfb_build.py` inside Blender, then `make_mpfb.py` and
  `build.py`. About 10 minutes for a few garments, 75 for everything. Run it detached (a `.sh` started from PowerShell's
  `Start-Process`): a session's end kills child jobs. Example scripts: `C:\Users\travi\Tools\rb\*.sh`.
- `--only` cannot re-export a MakeHuman library piece (the kimono): it reports `merged 0 items`. Reweight its GLB in
  `pieces/` with `make_mpfb.py`'s functions instead (`HANDOFF-GARMENT-DEFECTS.md` round 4).
- Pull the cloth, leather and fur albedos from Git LFS first, or garments build with flat colour (`make_garments.py` now
  stops on an LFS pointer).

MCP's `_for_cli` tools are for looking into a `.blend` (what a scene holds, a quick bpy check) without writing a script.
