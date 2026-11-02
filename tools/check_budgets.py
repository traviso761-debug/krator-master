#!/usr/bin/env python3
"""The page-size cap and the budget ceilings (CORE-IMPROVEMENTS.md 3a and 3d).

    python3 tools/check_budgets.py              # every build
    python3 tools/check_budgets.py kits/fauna   # one build

Two checks, both hard (no ratchet: today's tree passes because its over-cap pages have a BUDGETS.json entry):
  PAGE CAP   every page and bundle a build writes (dist/*.html, dist/*.js, the *.html beside a build.py) is at most
             16 MB, the gallery's file limit, unless the build's BUDGETS.json raises it. A page over 90% of its cap is
             a warning: plan the split before it is a failure. An LFS pointer is measured by the size it records, so a
             checkout without the pages (CI) checks the committed sizes. tools/build.py applies the same cap at build.
  BUDGETS    <build>/BUDGETS.json holds every ceiling a build is allowed past a default, each entry with a `why` (a
             sentence) and a `raised` date. An entry without them fails, and so does a raise: an entry whose number changed
             since HEAD while its `why` did not ("ceiling = what we measured" must be written down, not slipped in).

BUDGETS.json shape (agreed with the harness, 2026-10-27): one entry per page file name, or "*" for every page of the
build; any field may be left out; unknown keys are ignored:
  {"what": "...", "pages": {"voth-city.html": {"bytes": 20971520, "tris": 11000000, "calls": 140,
                                               "why": "one sentence", "raised": "2026-10-27"}, "*": {...}}}
tools/harness.py verify_page reads tris, calls and bytes (over a ceiling fails); tools/build.py and this check read
bytes (buildlib.page_cap). Every raise passes this check.
"""
import json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib  # noqa: E402

ROOT = buildlib.ROOT


def size(p):
    if buildlib.is_pointer(p):
        with open(p, 'rb') as fh:
            m = re.search(rb'\nsize (\d+)', fh.read(1024))
        return int(m.group(1)) if m else 0
    return os.path.getsize(p)


def pages(build):
    d = os.path.join(ROOT, build)
    out = []
    dist = os.path.join(d, 'dist')
    if os.path.isdir(dist):
        out += [os.path.join(dist, f) for f in sorted(os.listdir(dist)) if f.endswith(('.html', '.js'))]
    out += [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith('.html') and not f.startswith('.')]
    return out


def entries(node, path=()):
    """Every leaf entry of a BUDGETS.json: a dict holding a number."""
    if isinstance(node, dict):
        if any(isinstance(v, (int, float)) and not isinstance(v, bool) for v in node.values()):
            yield path, node
        else:
            for k, v in node.items():
                if k != 'what':
                    yield from entries(v, path + (k,))


def head_budgets(build):
    r = subprocess.run(['git', 'show', 'HEAD:%s/BUDGETS.json' % build], cwd=ROOT, stdout=subprocess.PIPE,
                       stderr=subprocess.DEVNULL, text=True, encoding='utf-8')
    if r.returncode != 0:
        return {}
    try:
        return {p: e for p, e in entries(json.loads(r.stdout))}
    except ValueError:
        return {}


def check(build):
    fails, warns = [], []
    for p in pages(build):
        n, cap = size(p), buildlib.page_cap(build, p)
        r = buildlib.rel(p)
        if n > cap:
            fails.append('PAGE CAP  %s is %.2f MB, over its cap of %.2f MB: split it (texture sidecars), or raise the cap '
                         'in %s/BUDGETS.json with a why' % (r, n / 2 ** 20, cap / 2 ** 20, build))
        elif n > buildlib.WARN_AT * cap:
            warns.append('page cap  %s is %.2f MB, %d%% of its %.2f MB cap: plan the split' % (r, n / 2 ** 20, 100 * n / cap, cap / 2 ** 20))
    f = os.path.join(ROOT, build, 'BUDGETS.json')
    if os.path.isfile(f):
        try:
            cur = json.load(open(f, encoding='utf-8'))
        except ValueError as e:
            return fails + ['BUDGETS   %s/BUDGETS.json does not parse: %s' % (build, e)], warns
        old = head_budgets(build)
        for path, e in entries(cur):
            name = '%s/BUDGETS.json %s' % (build, '.'.join(path))
            why = (e.get('why') or '').strip()
            if len(why) < 12:
                fails.append('BUDGETS   %s has no why (a sentence: what the ceiling is for, and why it is raised)' % name)
            if not re.match(r'\d{4}-\d{2}-\d{2}$', str(e.get('raised', ''))):
                fails.append('BUDGETS   %s has no raised date (YYYY-MM-DD)' % name)
            o = old.get(path)
            if o:
                nums = [k for k, v in e.items() if isinstance(v, (int, float)) and o.get(k) != v]
                if nums and (o.get('why') or '').strip() == why:
                    fails.append('BUDGETS   %s changed %s since HEAD but kept its why: a raise needs its own reason'
                                 % (name, ', '.join(nums)))
    return fails, warns


def main(argv):
    names = [a.rstrip('/').replace(os.sep, '/') for a in argv if not a.startswith('--')]
    nf = nw = 0
    for b in names or buildlib.build_dirs():
        fails, warns = check(b)
        for w in warns:
            print('warn  ' + w)
        for x in fails:
            print('FAIL  ' + x)
        nf += len(fails); nw += len(warns)
    print('check_budgets: %d failure(s), %d warning(s)' % (nf, nw))
    return 1 if nf else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
