#!/bin/bash
# usage: ./run.sh <logname> <page.html> <verify args...>
# Backgrounds a verify run and writes <logname>.txt, then <logname>.done. Do not
# pipe verify.py through head/tail when backgrounding: the pipe buffers and the
# log stays empty until the run ends.
cd "$(dirname "$0")"
L=$1; shift
rm -f "$L.done"
python3 -u verify.py "$@" > "$L.txt" 2>&1
echo done > "$L.done"
