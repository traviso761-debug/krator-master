#!/bin/bash
# Pack the kit the way the other kits are kept in the repo root: rift/ (sources, docs, dist) minus the local three.min.js and run logs.
cd "$(dirname "$0")/.."
rm -f krator-biome-rift.zip
zip -q -r krator-biome-rift.zip rift -x 'rift/three.min.js' 'rift/run*' 'rift/.syntax.js' 'rift/shots/*' 'rift/pack.sh'
ls -la krator-biome-rift.zip
