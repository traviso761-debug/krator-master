#!/usr/bin/env python3
"""Which of the Voth files core/host is copied from have changed since they were read (ROADMAP.md section 10).

    python3 core/host/sources.py           # list the changed files and the commits that changed them; exit 1 if any
    python3 core/host/sources.py --write   # record the current versions (after porting their changes into core/host)

Voth's city plan (settlements/voth; it was settlements/streetlab until 2026-10-14, and the record was re-keyed to the
new paths with the blobs it had) belongs to the Voth and simulation branch and is not edited from here: its features
are ported by hand into core/host, and this says when there is something new to port. Read-only."""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
REC = os.path.join(HERE, 'voth-sources.json')


def git(*a):
    return subprocess.run(['git', '-C', ROOT] + list(a), capture_output=True, text=True).stdout.strip()


def main(argv):
    rec = json.load(open(REC, encoding='utf-8'))
    if '--write' in argv:
        rec['files'] = {f: git('rev-parse', 'HEAD:' + f) for f in rec['files']}
        rec['commit'] = git('rev-parse', 'HEAD')
        json.dump(rec, open(REC, 'w', encoding='utf-8', newline='\n'), indent=1, sort_keys=True)
        print('recorded %d files at %s' % (len(rec['files']), rec['commit'][:10]))
        return 0
    changed = 0
    for f, blob in sorted(rec['files'].items()):
        now = git('rev-parse', 'HEAD:' + f)
        if now != blob:
            changed += 1
            log = git('log', '--oneline', '--follow', rec['commit'] + '..HEAD', '--', f)   # --follow: across the move
            print('CHANGED  %s\n%s' % (f, '\n'.join('    ' + l for l in log.splitlines()[:8]) or '    (removed or renamed)'))
    print('%d of %d Voth sources changed since %s' % (changed, len(rec['files']), rec['commit'][:10]))
    return 1 if changed else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
