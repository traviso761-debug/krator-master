#!/usr/bin/env python3
"""Write host/app/dist/krator-gallery.sh: Krator Gallery for Linux (and macOS) as one file to send someone.

The file is a bash launcher with krator_gallery.py after it. The launcher finds Python 3.11 or later, unpacks the
app to ~/.local/share/krator-gallery/, and opens the window; with no Tk (python3-tk) or no display it runs in the
terminal instead (download, build, serve until Ctrl+C). A PyInstaller binary cannot be made for Linux from Windows,
and would tie itself to one glibc; nearly every current distribution has a new enough python3.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = '#---- krator_gallery.py ----'

LAUNCHER = r'''#!/usr/bin/env bash
# Krator Gallery for Linux: downloads the latest Krator from GitHub, builds the gallery of every Krator world with
# the World Menagerie, and serves it at http://localhost:8001/.
#
#   bash krator-gallery.sh                  the window (or, without one, the same work in this terminal)
#   bash krator-gallery.sh --update --serve [--home DIR] [--local-only]      in this terminal
#
# Needs Python 3.11 or later; git is used if installed. The copy of Krator goes in ~/Krator Gallery (about 2 GB).
set -e
PY=
for c in python3.14 python3.13 python3.12 python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(sys.version_info < (3, 11))' 2>/dev/null; then
    PY=$c; break
  fi
done
if [ -z "$PY" ]; then
  echo "Krator Gallery needs Python 3.11 or later, and this computer has none."
  echo "  Ubuntu 22.04:  sudo apt install python3.11"
  echo "  older systems: install Python 3.11+ from your package manager or python.org"
  exit 1
fi
APP="${XDG_DATA_HOME:-$HOME/.local/share}/krator-gallery/krator_gallery.py"
mkdir -p "$(dirname "$APP")"
sed -n '/^#---- krator_gallery.py ----$/,$p' "$0" | tail -n +2 > "$APP"
if [ $# -eq 0 ]; then
  if [ -z "${DISPLAY}${WAYLAND_DISPLAY}" ] || ! "$PY" -c 'import tkinter; tkinter.Tk().destroy()' >/dev/null 2>&1; then
    echo "No window available, so this runs in the terminal. For the window, install Tk for Python:"
    echo "  Debian/Ubuntu: sudo apt install python3-tk    Fedora: sudo dnf install python3-tkinter    Arch: sudo pacman -S tk"
    echo
    set -- --update --serve
  fi
fi
exec "$PY" "$APP" "$@"
exit
'''


def main():
    with open(os.path.join(HERE, 'krator_gallery.py'), encoding='utf-8') as f:
        app = f.read()
    out = os.path.join(HERE, 'dist', 'krator-gallery.sh')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(LAUNCHER + MARK + '\n' + app)
    os.chmod(out, 0o755)
    print('wrote %s (%.0f KB)' % (out, os.path.getsize(out) / 1024))


if __name__ == '__main__':
    main()
