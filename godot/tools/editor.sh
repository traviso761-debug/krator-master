#!/bin/sh
# Start the Godot editor on godot/ in the background, so the Godot MCP server (.mcp.json) can drive it. On a machine
# with no display (a cloud session) it runs under Xvfb with the Compatibility renderer; on a desktop, open the
# project in Godot as usual instead. The plugin (addons/godot_mcp) connects to the server on 127.0.0.1:6505 by itself.
#   godot/tools/editor.sh          start (a no-op when it is already running); the log is godot/.godot/editor.log
#   godot/tools/editor.sh stop
# The first start imports the whole project (data/ included): minutes. Later starts reuse godot/.godot.
cd "$(dirname "$0")/.." || exit 1
GODOT_BIN="${GODOT:-godot}"
if [ "$1" = "stop" ]; then pkill -f "godot.*--editor --path $(pwd)" && echo "stopped"; exit 0; fi
if pgrep -f "godot.*--editor --path $(pwd)" > /dev/null; then echo "already running"; exit 0; fi
mkdir -p .godot
if [ -n "${DISPLAY:-}" ]; then
  nohup "$GODOT_BIN" --editor --path "$(pwd)" > .godot/editor.log 2>&1 &
else
  nohup xvfb-run -a -s "-screen 0 1600x900x24" "$GODOT_BIN" --editor --path "$(pwd)" \
    --rendering-method gl_compatibility --rendering-driver opengl3 > .godot/editor.log 2>&1 &
fi
echo "started (log: godot/.godot/editor.log)"
