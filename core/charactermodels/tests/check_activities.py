#!/usr/bin/env python3
"""The activities the simulations use against data/activities.json (ACTIVITIES-PLAN.md):

  python3 core/charactermodels/tests/check_activities.py          # report: unmapped ids, and the entries marked gap
  python3 core/charactermodels/tests/check_activities.py --strict # exit 1 when an id the sims use has no entry

Ids come from the settlements' world/activities.json files and from the sims' code: core/simulation, the
settlements' sim fragments and Voth's tune, where an ALL_CAPS string stands next to act, activity, sched, does,
wants or FURN_ACT (a scan, not a parse: the ignore list below drops what is not an activity)."""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
TABLE = json.load(open(os.path.join(HERE, 'data', 'activities.json'), encoding='utf-8'))
# ALL_CAPS strings the scan meets that are not activities
IGNORE = {'GET', 'POST', 'PUT', 'NONE', 'ALL', 'ANY', 'TRUE', 'FALSE', 'HTML', 'JSON', 'URL', 'GPU', 'CPU', 'DOM', 'API', 'SIM',
          'KSIM', 'KCITY', 'KTAGS', 'NAN', 'MAX', 'MIN', 'LOD', 'HUD', 'UI', 'ID', 'AND', 'NOT', 'OR',
          # a person's standing in a town (core/simulation 77-sim-1-world), not something they do
          'ESTABLISHED', 'EXPELLED', 'PERSECUTED', 'RESIDENT', 'VISITING', 'TRADING',
          # the animals' activities (Voth 47-vc-sim-animals, the sim example): beasts are not character bodies
          'GRAZE', 'ROAM', 'MINGLE', 'BED', 'WATER', 'FLY', 'WATER_BEASTS'}

SOURCES = (glob.glob(os.path.join(ROOT, 'core', 'simulation', '**', '*.js'), recursive=True)
           + glob.glob(os.path.join(ROOT, 'settlements', '*', 'src', '*sim*.js'))
           + glob.glob(os.path.join(ROOT, 'settlements', 'voth', 'targets', 'voth-city', '*.js'))
           + glob.glob(os.path.join(ROOT, 'core', 'region', '**', '*.js'), recursive=True))
NEAR = re.compile(r'act|activit|sched|does|want|FURN_ACT|furnAct|alsoAct|free|idle', re.I)
TOK = re.compile(r"""['"]([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)['"]""")


def used():
    seen = {}
    for p in glob.glob(os.path.join(ROOT, 'settlements', '*', 'world', 'activities.json')):
        d = json.load(open(p, encoding='utf-8'))
        d = d.get('activities', d) if isinstance(d, dict) else d
        ids = d.keys() if isinstance(d, dict) else [x.get('id') for x in d if isinstance(x, dict)]
        for k in ids:
            if isinstance(k, str) and re.fullmatch(r'[A-Z][A-Z0-9_]+', k):
                seen.setdefault(k, set()).add(os.path.relpath(p, ROOT).replace(os.sep, '/'))
    for p in SOURCES:
        if os.path.getsize(p) > 2_000_000:
            continue
        rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
        for line in open(p, encoding='utf-8', errors='replace'):
            if not NEAR.search(line):
                continue
            for t in TOK.findall(line):
                if len(t) > 2 and t not in IGNORE:
                    seen.setdefault(t, set()).add(rel)
    return seen


def main():
    A = TABLE['activities']
    seen = used()
    missing = sorted(k for k in seen if k not in A)
    gaps = sorted(k for k, e in A.items() if e.get('gap'))
    print('activities.json: %d entries; the sims use %d ids' % (len(A), len(seen)))
    print('\nunmapped (%d): played as %s until they get an entry' % (len(missing), TABLE.get('fallback', 'IDLE')))
    for k in missing:
        print('  %-16s %s' % (k, ', '.join(sorted(seen[k]))[:110]))
    print('\nstand-ins, marked gap (%d):' % len(gaps))
    for k in gaps:
        print('  %-14s %s' % (k, A[k]['gap']))
    if '--strict' in sys.argv and missing:
        sys.exit(1)


if __name__ == '__main__':
    main()
