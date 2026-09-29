#!/bin/bash
# Pack the kit the way the other kits are kept in the repo root: xanadu/ (sources, docs, dist) minus the local three.min.js and run logs.
cd "$(dirname "$0")/.."
rm -f krator-biome-xanadu.zip
zip -q -r krator-biome-xanadu.zip xanadu -x 'xanadu/three.min.js' 'xanadu/run*' 'xanadu/.syntax.js' 'xanadu/shots/*' 'xanadu/pack.sh'
ls -la krator-biome-xanadu.zip
