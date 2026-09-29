#!/bin/bash
# usage: ./run.sh <logname> <page.html> <verify args...>
#   ./run.sh log_seg dist/segment.html --assert --views "Overview,Intact" --out shots/seg
# Writes <logname>.txt, then <logname>.done when finished. Run it in the
# background. Do NOT pipe verify.py through head/tail: the pipe buffers and
# the log stays empty until the run ends.
cd "$(dirname "$0")"
L=$1; shift
H=$1; shift
rm -f "$L.done"
python3 -u verify.py "$H" "$@" > "$L.txt" 2>&1
echo done > "$L.done"
