"""The ratchet every lint in tools/ shares (CORE-IMPROVEMENTS.md, "Order of work" step 1).

A lint counts its findings by key ("<build or file>: <rule> ..." -> count). Its baseline (tools/<lint>_baseline.json)
holds today's counts: the lint fails only on a key that is not in the baseline or whose count has grown, so existing
code keeps passing and new code cannot add to the pile. Fixing a finding and rerunning with --write-baseline shrinks
the file; each baseline is meant to reach {}.

    import ratchet
    sys.exit(ratchet.main('check_x', findings, argv, detail))

findings: {key: count}. detail: optional {key: [lines to print]} shown for failing keys (and every key with --list).
Flags every lint takes through this: --list (every finding, baselined or not), --write-baseline (accept today's
findings: only for a deliberate exception, or after fixes shrank them).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def path(name):
    return os.path.join(ROOT, 'tools', name + '_baseline.json')


def load(name):
    p = path(name)
    return json.load(open(p, encoding='utf-8')) if os.path.isfile(p) else {}


def write(name, findings):
    with open(path(name), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(dict(sorted(findings.items())), fh, indent=1)
        fh.write('\n')


def main(name, findings, argv, detail=None, what='finding'):
    detail = detail or {}
    if '--write-baseline' in argv:
        write(name, findings)
        print('wrote tools/%s_baseline.json: %d keys, %d %ss' % (name, len(findings), sum(findings.values()), what))
        return 0
    base = load(name)
    if '--list' in argv:
        for k in sorted(findings):
            print('%s%s  x%d' % ('' if k in base else 'NEW ', k, findings[k]))
            for ln in detail.get(k, []):
                print('    ' + ln)
    bad = [k for k in sorted(findings) if findings[k] > base.get(k, 0)]
    for k in bad:
        print('FAIL  %s  x%d (baseline %d)' % (k, findings[k], base.get(k, 0)))
        for ln in detail.get(k, [])[:12]:
            print('    ' + ln)
    shrunk = [k for k in base if findings.get(k, 0) < base[k]]
    total = sum(findings.values())
    print('%s: %d %ss in %d keys, %d over the baseline%s' % (
        name, total, what, len(findings), len(bad),
        ('; %d keys shrank (rerun with --write-baseline to lock that in)' % len(shrunk)) if shrunk else ''))
    return 1 if bad else 0
