#!/bin/bash
# Pack the kit as ../krator-biome-rift.zip (tools/pack_biome.py: the shared core/ fragments it lists go into src/).
exec python3 "$(dirname "$0")/../../tools/pack_biome.py" rift
