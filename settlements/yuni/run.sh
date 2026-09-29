#!/bin/bash
# ./run.sh <logname> <verify args...>   — background-safe
n=$1; shift; rm -f $n.done; (python3 verify.py "$@" > $n.txt 2>&1; echo done > $n.done) &
