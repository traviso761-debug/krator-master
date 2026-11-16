#!/usr/bin/env python3
"""tools/audit_port.py's survey fixes (BUGS-2026-11-15.md T13), on a made-up repo in a temporary folder:
  - PORT.md is written with LF line ends (it was CRLF on Windows);
  - `audit_port.py core/<module>` refreshes that module's rows of core/PORT.md and keeps every other row as it stood
    (`core` alone still refreshes them all: the negative control);
  - a plan that only asks its frame where things are (F.at, F.surf) stays [G data]; one that builds with F.box is [draw].

    python3 tools/tests/test_audit_port.py
"""
import contextlib, io, os, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import audit_port  # noqa: E402

checks = []


def ok(name, cond):
    checks.append((name, bool(cond)))


def put(root, rel, text):
    p = os.path.join(root, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def row(root, build, name):
    with open(os.path.join(root, build, 'PORT.md'), encoding='utf-8') as fh:
        return next((ln for ln in fh.read().split('\n') if ln.startswith('| `%s`' % name)), None)


def run(*argv):
    with contextlib.redirect_stdout(io.StringIO()):
        audit_port.main(list(argv))


def main():
    old = audit_port.ROOT
    with tempfile.TemporaryDirectory() as tmp:
        audit_port.ROOT = tmp
        try:
            for top in ('settlements', 'kits', 'biomes', 'openworld'):
                os.makedirs(os.path.join(tmp, top))
            put(tmp, 'kits/fake/build.py', '# a build\n')
            put(tmp, 'kits/fake/src/10-plan.js', 'const P=[];\nP.push(F.at(1,2));\nP.push(F.surf(3));\nP.push(F.at(4,5));\nP.push(F.surf(6));\n')
            put(tmp, 'kits/fake/src/20-hall.js', 'F.box(1,2,3);\nF.box(1,2,3);\nF.cyl(1,2);\nF.box(4,5,6);\n')
            run('kits/fake')
            raw = open(os.path.join(tmp, 'kits', 'fake', 'PORT.md'), 'rb').read()
            ok('PORT.md is written with LF line ends, on Windows too', b'\n' in raw and b'\r\n' not in raw)
            r = row(tmp, 'kits/fake', 'src/10-plan.js')
            ok('a plan that only calls F.at and F.surf is [G data] (no geometry counted)', r and '[G data]' in r and '| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |' in r)
            r = row(tmp, 'kits/fake', 'src/20-hall.js')
            ok('negative control: a fragment that builds with F.box and F.cyl is [draw]', r and '[draw]' in r)

            put(tmp, 'core/alpha/10-core-alpha.js', 'const a=1;\n')
            put(tmp, 'core/beta/10-core-beta.js', 'const b=1;\n')
            run('core')
            a0, b0 = row(tmp, 'core', 'alpha/10-core-alpha.js'), row(tmp, 'core', 'beta/10-core-beta.js')
            # both modules change; only alpha is asked for
            put(tmp, 'core/alpha/10-core-alpha.js', 'const a=new THREE.Vector3();\nconst a2=new THREE.Color();\n')
            put(tmp, 'core/beta/10-core-beta.js', 'const b=new THREE.Vector3();\n')
            put(tmp, 'core/beta/20-core-beta-new.js', 'const c=1;\n')
            run('core/alpha')
            a1, b1 = row(tmp, 'core', 'alpha/10-core-alpha.js'), row(tmp, 'core', 'beta/10-core-beta.js')
            ok('audit_port.py core/alpha refreshes alpha\'s row', a1 and a1 != a0 and '| 2 |' in a1)
            ok("...and keeps beta's row as it stood", b1 == b0)
            ok("...and does not add beta's new fragment (beta's own run does)", row(tmp, 'core', 'beta/20-core-beta-new.js') is None)
            run('core')
            ok('negative control: audit_port.py core refreshes beta too', row(tmp, 'core', 'beta/10-core-beta.js') != b0
               and row(tmp, 'core', 'beta/20-core-beta-new.js') is not None)
        finally:
            audit_port.ROOT = old
    bad = 0
    for name, good in checks:
        bad += not good
        print('%s  %s' % ('ok  ' if good else 'FAIL', name))
    print('%d checks, %d wrong' % (len(checks), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
