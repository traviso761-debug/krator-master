#!/bin/bash
cd /home/claude/biome
L=$1; shift
rm -f $L.done
python3 -u verify.py dist/hyperjungle.html "$@" > $L.txt 2>&1
echo done > $L.done
