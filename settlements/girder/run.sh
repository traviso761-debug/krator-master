#!/bin/bash
# usage: ./run.sh <logname> <verify args...>
cd /home/claude/girder; L=$1; shift; rm -f $L.done
python3 verify.py girder.html "$@" > $L.txt 2>&1; echo done > $L.done
