#!/usr/bin/env python3
"""The export report's compare, proven on two fake reports (tools/export_report.py --from new.json --compare old.json):
a 12 percent growth is flagged, a 5 percent one is not, a vanished case and an ok-to-stub section are listed, a new
case is listed, and --assert exits 1 only when the list is not empty. tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_export_report.py
"""
import json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = sys.executable
SCRIPT = os.path.join(ROOT, 'tools', 'export_report.py')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import export_report  # noqa: E402


def row(case, **kw):
    r = {'case': case, 'json': 1000000, 'glb': 2000000, 'tex': 3000000, 'ok': 2, 'empty': 0, 'stub': 0, 'none': 0, 'sets': 3,
         'inst': 1000, 'bkts': 2, 'tris': 5000, 'itris': 9000, 'verts': 6000, 'mats': 20, 'usedm': 10, 'texs': 10,
         'usedt': 8, 'draws': 5, 'terrain': 'field', 'sections': {'items': 'ok', 'water': 'ok'}}
    r.update(kw)
    return r


def run(*args):
    r = subprocess.run([PY, SCRIPT] + list(args), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                       encoding='utf-8', cwd=ROOT)
    return r.returncode, r.stdout


def main():
    old = [row('a'), row('b'), row('gone')]
    new = [row('a', glb=2240000, inst=1050, sections={'items': 'ok', 'water': 'stub'}),   # glb +12%, inst +5%, water fell
           row('b'), row('fresh')]
    fails = []

    def check(cond, what):
        if not cond:
            fails.append(what)

    # the pure function first
    flags = export_report.compare(new, {r['case']: r for r in old}, 10)
    whats = {(c, w) for c, w, _ in flags}
    check(('a', 'glb') in whats, 'a 12% growth is flagged')
    check(('a', 'inst') not in whats, 'a 5% growth is not flagged')
    check(('a', 'section water') in whats, 'an ok -> stub section is listed')
    check(('gone', 'case') in whats, 'a vanished case is listed')
    check(('fresh', 'case') in whats, 'a new case is listed')
    check(len(flags) == 4, 'nothing else is flagged (%d flags)' % len(flags))
    check(export_report.compare(new, {r['case']: r for r in old}, 15) == [f for f in flags if f[1] != 'glb'],
          'a 15% tolerance drops the 12% growth and keeps the rest')
    check(export_report.grew(0, 1, 10) and not export_report.grew(0, 0, 10) and not export_report.grew(5, 4, 10),
          'growth from 0 counts; no change and shrinkage do not')
    same = {r['case']: r for r in new}
    check(export_report.compare(new, same, 10) == [], 'a report against itself flags nothing')
    # a baseline without per-section statuses (written before they were recorded) skips the section check
    check(export_report.compare(new, {r['case']: dict(r, sections=None) for r in old}, 10) ==
          [f for f in flags if not f[1].startswith('section')], 'a baseline without sections skips that check')

    # then the command line: the table marks, the list ends the output, --assert sets the exit code
    with tempfile.TemporaryDirectory() as tmp:
        po, pn = os.path.join(tmp, 'old.json'), os.path.join(tmp, 'new.json')
        for p, rows in ((po, old), (pn, new)):
            with open(p, 'w', encoding='utf-8', newline='\n') as f:
                json.dump({'cases': rows}, f)
        code, out = run('--from', pn, '--compare', po)
        check(code == 0, 'without --assert the exit code is 0 (got %d)' % code)
        lines = out.strip().splitlines()
        check(any(l.startswith('grew past tolerance (10%): 4') for l in lines), 'the list header counts 4')
        check(lines[-1].strip() == 'gone case: in the baseline, not in this run', 'the output ends with the list')
        check('a glb 2.0 MB -> 2.2 MB (+12%)' in out, 'the growth line names case, column, old, new and percent')
        check('a section water: ok -> stub' in out, 'the section line names the fall')
        check(any(l.startswith('a ') and '(+240 kB)*' in l and l.rstrip().endswith('glb water') for l in lines),
              'the table marks the glb delta and names the flags in the flag column')
        check(not any('(+50)*' in l for l in lines), 'the 5% instance growth carries no mark')
        code, out = run('--from', pn, '--compare', po, '--assert')
        check(code == 1, '--assert exits 1 on a non-empty list (got %d)' % code)
        code, out = run('--from', pn, '--compare', po, '--tolerance', '15', '--assert')
        check(code == 1 and 'a glb' not in out, '--tolerance 15 drops the 12% growth; the other flags still assert')
        code, out = run('--from', pn, '--compare', pn, '--assert')
        check(code == 0 and 'grew past tolerance (10%): none' in out, '--assert exits 0 when nothing is flagged')

    for f in fails:
        print('FAIL  ' + f)
    print('%s  test_export_report (%d checks, %d failed)' % ('FAIL' if fails else 'PASS', 20, len(fails)))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
