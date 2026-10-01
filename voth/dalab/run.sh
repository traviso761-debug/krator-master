#!/bin/bash
# usage: ./run.sh <logname> <verify args...>
# Backgrounds a verify run and writes <logname>.txt, then <logname>.done.
# Do NOT pipe verify.py through head/tail when backgrounding it: the pipe
# buffers, so the log stays empty until the run ends and you lose the ability
# to watch it. Write the whole log, read the parts you want afterwards.
cd "$(dirname "$0")"
L=$1; shift
rm -f "$L.done"
# -u so the log is readable while the run is still going; without it Python
# block-buffers stdout into a file and the log stays empty until the end.
python -u verify.py dist/dalab-set.html "$@" > "$L.txt" 2>&1
echo done > "$L.done"
