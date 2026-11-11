#!/usr/bin/env python3
"""Copy the core files (and core/charactermodels' pieces) the Godot project vendors (res:// cannot reach outside godot/).

    python3 godot/tools/sync_core.py           # copy core -> godot
    python3 godot/tools/sync_core.py --check   # exit 1 and name the files that drifted
"""
import filecmp, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT)
PAIRS = [(f"core/rand/{f}", f"godot/tests/rand/{f}") for f in ("krand.gd", "krand_test.gd", "golden.json")]
PAIRS += [(f"core/tags/{f}", f"godot/tests/tags/{f}") for f in ("ktags.gd", "ktags_test.gd", "golden.json", "ksound.gd", "ksound_test.gd", "golden-sound.json")]
PAIRS += [(f"core/mask/{f}", f"godot/tests/mask/{f}") for f in ("kmask.gd", "kmask_test.gd", "golden.json", "kmask_distance_test.gd", "golden-distance.json")]
PAIRS += [(f"core/clock/{f}", f"godot/tests/clock/{f}") for f in ("kseason.gd", "kseason_test.gd", "golden-season.json", "kseason_flush_test.gd", "golden-flush.json")]   # KCLOCK.season's twin
PAIRS += [(f"core/biome/{f}", f"godot/tests/fire/{f}") for f in ("kfire.gd", "kfire_test.gd", "golden-fire.json")]   # KFIRE (38-core-fire.js)
PAIRS += [("core/simulation/ksim.gd", "godot/tests/sim/ksim.gd")]   # SIM.pose's twin (its test reads a world's export: tests/dhelv)
# KField (class_name: the importer godot/krator/field_import.gd uses it from here)
PAIRS += [(f"core/terrain/{f}", f"godot/tests/terrain/{f}") for f in ("kfield.gd", "kfield_test.gd", "golden-field.json",
                                                                           "kstrata.gd", "kstrata_test.gd", "golden-strata.json",
                                                                           "klava.gd", "klava_test.gd", "golden-lava.json",
    "ktherm.gd", "ktherm_test.gd", "golden-therm.json",
    "klamina.gd", "klamina_test.gd", "golden-lamina.json",
    "kstrata_vary.gd", "kstrata_vary_test.gd", "golden-strata-vary.json")]   # KLava: 46-core-lava.js; KTherm: 47-core-therm.js; KLamina: 35b-core-lamina.js; KStrataVary: 35c-core-strata-vary.js
# kits/resources' node field (KResField), its test and vectors, the geology it reads, and krand.gd beside it (it preloads it)
PAIRS += [(f"kits/resources/godot/{f}", f"godot/tests/resources/{f}") for f in ("kres_field.gd", "kres_field_test.gd", "golden-field.json")]
PAIRS += [("kits/resources/data/geology.json", "godot/tests/resources/geology.json"), ("core/rand/krand.gd", "godot/tests/resources/krand.gd")]
# core/charactermodels: the MakeHuman bodies' data, the peoples and the golden (tracked), and their pieces (GLBs and GSH1
# blend-shape files, gitignored: ~200 MB; make_mpfb.py writes them), read at runtime by krator/character/ (res:// cannot reach
# the kit). tests/make-golden.js writes the golden.
_CH = "core/charactermodels"
_BODIES = sorted(b for b in os.listdir(os.path.join(REPO, _CH, "data")) if b.startswith("mpfb_"))
PAIRS += [(f"{_CH}/data/{b}/{f}.json", f"godot/data/characters/{b}/{f}.json") for b in _BODIES for f in ("skeleton", "kit")]
PAIRS += [(f"{_CH}/data/{f}.json", f"godot/data/characters/{f}.json") for f in ("peoples", "clips", "props", "posture", "fur")]
_PP = os.path.join(REPO, _CH, "pieces", "props")   # gitignored: absent on CI, so the props are copied only where built
PAIRS += [(f"{_CH}/pieces/props/{f}", f"godot/data/characters/pieces/props/{f}")
          for f in (sorted(os.listdir(_PP)) if os.path.isdir(_PP) else []) if f.endswith(".glb")]
PAIRS += [(f"{_CH}/tests/golden-mpfb.json", "godot/data/characters/golden-mpfb.json")]
for _b in _BODIES:
    _pd = os.path.join(REPO, _CH, "pieces", _b)
    if os.path.isdir(_pd):
        PAIRS += [(f"{_CH}/pieces/{_b}/{f}", f"godot/data/characters/pieces/{_b}/{f}")
                  for f in sorted(os.listdir(_pd)) if f.endswith(".glb") or f.endswith(".gshapes.bin")]

drift = [(a, b) for a, b in PAIRS if not os.path.exists(os.path.join(REPO, b))
         or not filecmp.cmp(os.path.join(REPO, a), os.path.join(REPO, b), shallow=False)]
if "--check" in sys.argv:
    for a, b in drift:
        print(f"drift: {b} differs from {a}")
    sys.exit(1 if drift else 0)
for a, b in drift:
    os.makedirs(os.path.dirname(os.path.join(REPO, b)), exist_ok=True)
    shutil.copyfile(os.path.join(REPO, a), os.path.join(REPO, b))
    print(f"copied {a} -> {b}")
print("in step" if not drift else f"{len(drift)} copied")
