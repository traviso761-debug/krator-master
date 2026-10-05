#!/bin/sh
# Render one spike case to a PNG on a machine with no display (a cloud container): Xvfb plus Godot's
# Compatibility renderer on Mesa's llvmpipe. On a desktop, run godot --path godot -- --case=... --shot=... directly.
#   GODOT=/path/to/godot godot/tools/shot.sh <case> <out.png> [--eye=x,y,z --at=x,y,z --hour=h]
case="$1"; out="$2"; shift 2
cd "$(dirname "$0")/.." || exit 1
mkdir -p shots && touch shots/.gdignore   # the editor need not import screenshots
xvfb-run -a -s "-screen 0 1600x900x24" "${GODOT:-godot}" --path . --rendering-method gl_compatibility \
  --rendering-driver opengl3 -- --case="$case" --shot="$out" "$@" 2>&1 | grep -E "^(===|  |saved|ERROR|SCRIPT)"
