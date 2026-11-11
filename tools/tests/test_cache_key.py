#!/usr/bin/env python3
"""The verify cache's harness key (tools/harness.py, result_fingerprint; owner 2026-11-11): it moves when anything that can
change a verify's result changes (the launcher's flags, the page server, a check, a new top-level function,
VERIFY_CACHE_VERSION) and never for the queue, the locks, the watchdog, the cloud transport, the lanes listing, the cache
itself, comments or docstrings. Each case edits a copy of the harness's text and compares fingerprints; every name in
NOT_IN_KEY must still exist, so the list cannot rot. tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_cache_key.py
"""
import ast, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["KRATOR_VERIFY_WRAP"] = "0"
sys.path.insert(0, os.path.join(ROOT, "tools"))
import harness  # noqa: E402

with open(os.path.join(ROOT, "tools", "harness.py"), encoding="utf-8") as fh:
    SRC = fh.read()
BASE = harness.result_fingerprint(SRC)
fails = []


def check(name, ok, detail=""):
    print(("PASS  " if ok else "FAIL  ") + name + (": " + detail if detail and not ok else ""))
    if not ok:
        fails.append(name)


def edited(old, new, count=1):
    assert SRC.count(old) >= 1, "the test's anchor is gone from harness.py: %r (update this test)" % old
    return harness.result_fingerprint(SRC.replace(old, new, count))


def same(name, old, new):
    check("unchanged by " + name, edited(old, new) == BASE)


def moved(name, old, new):
    check("moved by " + name, edited(old, new) != BASE)


if __name__ == "__main__":
    check("stable", harness.result_fingerprint(SRC) == BASE and harness.result_fingerprint() == BASE)
    # not in the key
    same("a comment", "# The cloud lanes (tools/CLOUD-LANE.md", "# The cloud lanes, edited (tools/CLOUD-LANE.md")
    same("the module docstring", "The shared verify harness", "The shared verify harness, edited")
    same("a function's docstring", "Run `argv`, relaying its output, under the stall watchdog", "Run `argv`, relaying, watched")
    same("the lock's wait", 'or 28800) if timeout is None else timeout', 'or 28801) if timeout is None else timeout')
    same("the watchdog's tick", "tick = max(0.5, min(15.0, stall / 4))", "tick = max(0.5, min(16.0, stall / 4))")
    same("the lanes listing", '"cloud lanes: off (tools/CLOUD-LANE.md)"', '"cloud lanes: switched off"')
    same("the stall default", 'KRATOR_GPU_STALL_MIN") or 25)', 'KRATOR_GPU_STALL_MIN") or 30)')
    same("the cloud routing", 'print("harness: on the %s lane (the cloud machine)" % got, flush=True)', 'pass')
    same("the cache's own message", '"harness: cached pass: ', '"harness: cached pass (same bytes): ')
    same("the __main__ block", 'sys.exit(lanes_main(sys.argv[2:]))', 'sys.exit(lanes_main(sys.argv[2:]) or 0)')
    # in the key
    moved("VERIFY_CACHE_VERSION", "VERIFY_CACHE_VERSION = 1", "VERIFY_CACHE_VERSION = 2")
    moved("a GPU flag", '"--enable-gpu", "--enable-webgl", "--ignore-gpu-blocklist"]', '"--enable-gpu", "--enable-webgl"]')
    moved("a cloud lane's flags", '"--use-angle=gl-egl"]', '"--use-angle=vulkan"]')
    moved("a check's limit", "INSTANCE_CAP = 250000", "INSTANCE_CAP = 250001")
    moved("the shader-error pattern", 'SHADER_ERR = re.compile(r"THREE', 'SHADER_ERR = re.compile(r"three')
    moved("the load timeout", "LOAD_MS = 900000", "LOAD_MS = 600000")
    moved("a new top-level function", "\ndef is_gpu():", "\ndef new_check():\n    return 1\n\n\ndef is_gpu():")
    names = set()
    for n in ast.parse(SRC).body:
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            names.add(n.name)
        elif isinstance(n, ast.Assign):
            names.update(t.id for t in n.targets if isinstance(t, ast.Name))
    stale = sorted(harness.NOT_IN_KEY - names)
    check("every name in NOT_IN_KEY exists", not stale, ", ".join(stale))
    for must in ("verify_page", "VerifyPage", "launch_chromium", "_launch", "lane_args", "serve", "open_page", "GPU_ARGS",
                 "GL_ARGS", "CLOUD_LANE_ARGS", "LANE_ARGS", "UNIVERSAL_JS", "VERIFY_CACHE_VERSION"):
        check("%s is in the key" % must, must not in harness.NOT_IN_KEY)
    print("\n%d failed" % len(fails) if fails else "\nOK")
    sys.exit(1 if fails else 0)
