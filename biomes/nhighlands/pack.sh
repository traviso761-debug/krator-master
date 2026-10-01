#!/bin/bash
# Pack the kit the way the other kits are kept in the repo root: nhighlands/ (sources, docs, dist) minus the local three.min.js and run logs.
cd "$(dirname "$0")/.."
rm -f krator-biome-nhighlands.zip
zip -q -r krator-biome-nhighlands.zip nhighlands -x 'nhighlands/three.min.js' 'nhighlands/run*' 'nhighlands/.syntax.js' 'nhighlands/shots/*' 'nhighlands/pack.sh' 'nhighlands/*.txt' 'nhighlands/*.done'
ls -la krator-biome-nhighlands.zip
