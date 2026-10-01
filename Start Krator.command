#!/bin/bash
# Starts the Krator site (macOS: double-click this file; Linux: start-krator.sh does the same). The first time it
# also sets the site up. Close this window, or press Ctrl+C, to stop it. See START-HERE.md.
cd "$(dirname "$0")" || exit 1
for py in python3.14 python3.13 python3.12 python3.11 python3; do
  if command -v "$py" >/dev/null 2>&1 && "$py" -c 'import tomllib' >/dev/null 2>&1; then
    "$py" host/sitectl.py run "$@"; status=$?
    [ $status -ne 0 ] && { echo; read -r -p "Something went wrong (see above). Press Enter to close. " _; }
    exit $status
  fi
done
echo "Krator needs Python 3.11 or later. Install it from https://www.python.org/downloads/ and try again."
read -r -p "Press Enter to close. " _
exit 1
