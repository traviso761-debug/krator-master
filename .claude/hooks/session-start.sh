#!/bin/bash
# Cloud sessions only: what the Godot port work needs that the container does not ship.
#  - Godot 4.5 (Linux x86_64) as `godot`, for godot/ (tests, --check, screenshots, the editor the MCP server drives)
#  - Python playwright, for the export and verify scripts (Chromium is already in /opt/pw-browsers)
#  - the Godot MCP server (.mcp.json) fetched once into the npm cache, so it starts quickly
# Idempotent: each step is skipped when its result is already there.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

GODOT_VERSION="4.7.2-stable"   # the owner's version (2026-10-08); dhelv_nav_test fails on 4.5
GODOT_DIR="$HOME/.local/godot-$GODOT_VERSION"
GODOT_BIN="$GODOT_DIR/Godot_v${GODOT_VERSION}_linux.x86_64"
if [ ! -x "$GODOT_BIN" ]; then
  mkdir -p "$GODOT_DIR"
  curl -sSL -o "$GODOT_DIR/godot.zip" \
    "https://github.com/godotengine/godot/releases/download/${GODOT_VERSION}/Godot_v${GODOT_VERSION}_linux.x86_64.zip"
  unzip -o -q "$GODOT_DIR/godot.zip" -d "$GODOT_DIR"
  rm -f "$GODOT_DIR/godot.zip"
  chmod +x "$GODOT_BIN"
fi
mkdir -p "$HOME/.local/bin"
ln -sf "$GODOT_BIN" "$HOME/.local/bin/godot"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$HOME/.local/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
  echo "export GODOT=\"$GODOT_BIN\"" >> "$CLAUDE_ENV_FILE"
fi

python3 -c "import playwright" 2>/dev/null || pip install -q playwright

npm cache ls godot-mcp-server@0.6.0 > /dev/null 2>&1 || npx -y godot-mcp-server@0.6.0 --version < /dev/null > /dev/null 2>&1 || true
