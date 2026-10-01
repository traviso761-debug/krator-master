#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
python3 build.py
python3 verify.py dist/jimjam-kit.html --assert --views "Opening — three-quarter,Shaft patterns — eye level" --out shots
