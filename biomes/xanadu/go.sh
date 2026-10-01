#!/bin/bash
cd "$(dirname "$0")"
L=$1; shift
rm -f $L.done
python3 -u verify.py dist/xanadu.html "$@" > $L.txt 2>&1
echo done > $L.done
