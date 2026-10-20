#!/usr/bin/env bash
# The whole character pipeline in one go, both bodies at once (about 75 minutes), or a few garments (about 10):
#   tools/rebuild.sh                       # every garment, both MakeHuman exports, the man's, giant's and woman's kits, the pages
#   tools/rebuild.sh --only <male ids> <female ids>   # those garments alone, merged into the kits as they stand
#                                                     # (make_mpfb.py --merge: Godot's skin cover regions wait for a whole build)
# BLENDER (Blender 4.5 with MPFB2, README "Setup"), KIT (where the MakeHuman exports go, kit_male / kit_female under it)
# and LOGS (the logs) can be set in the environment. Run it in the background: it prints a line as each stage ends.
set -e
cd "$(dirname "$0")/.."
BLENDER=${BLENDER:-/home/user/mpfb/blender-4.5.14-linux-x64/blender}
KIT=${KIT:-/home/user/mpfb}
LOGS=${LOGS:-/tmp/kchar-rebuild}
mkdir -p "$LOGS"
waitall(){ for j in $(jobs -p); do wait "$j" || { echo "a stage failed: see $LOGS"; exit 1; }; done; }

if [ "$1" = "--only" ]; then
  M=$2; F=$3
  if [ -n "$M" ]; then "$BLENDER" -b --python tools/make_garments.py -- male --only "$M" > "$LOGS/garments_m.log" 2>&1 & fi
  if [ -n "$F" ]; then "$BLENDER" -b --python tools/make_garments.py -- female --only "$F" > "$LOGS/garments_f.log" 2>&1 & fi
  waitall; echo garments done
  rm -rf "$LOGS/part_m" "$LOGS/part_f"
  if [ -n "$M" ]; then "$BLENDER" -b --python tools/mpfb_build.py -- male "$LOGS/part_m" --only "$M" > "$LOGS/build_m.log" 2>&1 & fi
  if [ -n "$F" ]; then "$BLENDER" -b --python tools/mpfb_build.py -- female "$LOGS/part_f" --only "$F" > "$LOGS/build_f.log" 2>&1 & fi
  waitall; echo mpfb_build done
  if [ -n "$M" ]; then python3 tools/make_mpfb.py male "$LOGS/part_m" --merge > "$LOGS/kit_m.log" 2>&1; fi
  if [ -n "$F" ]; then python3 tools/make_mpfb.py female "$LOGS/part_f" --merge > "$LOGS/kit_f.log" 2>&1; fi
  echo merge done
else
  "$BLENDER" -b --python tools/make_garments.py -- male > "$LOGS/garments_m.log" 2>&1 &
  "$BLENDER" -b --python tools/make_garments.py -- female > "$LOGS/garments_f.log" 2>&1 &
  waitall; echo garments done
  "$BLENDER" -b --python tools/mpfb_build.py -- male "$KIT/kit_male" > "$LOGS/build_m.log" 2>&1 &
  "$BLENDER" -b --python tools/mpfb_build.py -- female "$KIT/kit_female" > "$LOGS/build_f.log" 2>&1 &
  waitall; echo mpfb_build done
  python3 tools/make_mpfb.py male "$KIT/kit_male" > "$LOGS/kit_m.log" 2>&1
  python3 tools/make_mpfb.py giant "$KIT/kit_male" > "$LOGS/kit_g.log" 2>&1
  python3 tools/make_mpfb.py female "$KIT/kit_female" > "$LOGS/kit_f.log" 2>&1
  echo make_mpfb done
fi
python3 build.py --thumbs > "$LOGS/pages.log" 2>&1
echo pages done
