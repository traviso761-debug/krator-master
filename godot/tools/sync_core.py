#!/usr/bin/env python3
"""Copy the core files the Godot project vendors (res:// cannot reach outside godot/).

    python3 godot/tools/sync_core.py           # copy core -> godot
    python3 godot/tools/sync_core.py --check   # exit 1 and name the files that drifted
"""
import filecmp, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT)
PAIRS = [(f"core/rand/{f}", f"godot/tests/rand/{f}") for f in ("krand.gd", "krand_test.gd", "golden.json")]
PAIRS += [(f"core/tags/{f}", f"godot/tests/tags/{f}") for f in ("ktags.gd", "ktags_test.gd", "golden.json")]

drift = [(a, b) for a, b in PAIRS if not os.path.exists(os.path.join(REPO, b))
         or not filecmp.cmp(os.path.join(REPO, a), os.path.join(REPO, b), shallow=False)]
if "--check" in sys.argv:
    for a, b in drift:
        print(f"drift: {b} differs from {a}")
    sys.exit(1 if drift else 0)
for a, b in drift:
    shutil.copyfile(os.path.join(REPO, a), os.path.join(REPO, b))
    print(f"copied {a} -> {b}")
print("in step" if not drift else f"{len(drift)} copied")
