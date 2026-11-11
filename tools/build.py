#!/usr/bin/env python3
"""Run a build and record what it read (CORE-IMPROVEMENTS.md 5a; tools/buildlib.py has the manifest's shape).

    python3 tools/build.py biomes/rift                      # = cd biomes/rift && python3 build.py, plus build-inputs.json
    python3 tools/build.py biomes/throne --station kipuka   # arguments after the build go to build.py
    python3 tools/build.py settlements/girder --script <other>.py    # a build's second script (see test_all.extra_builds)
    python3 tools/build.py --all [-j 4]                     # every build and the extra pages (test_all's rebuild list)

It is the same build: build.py runs unchanged in its own folder. What it adds:
  - every Python process the build starts records the files it opens and the folders it lists (an audit hook,
    tools/_inputs/sitecustomize.py), and the run's inputs, listings and outputs go to <build>/build-inputs.json under
    the command's key. tools/check_stale.py and tools/reach.py read that file. Commit it with the pages.
  - a read of a Git LFS pointer that is not a page or a bundle (a texture pack, a library image) stops the build with
    the `git lfs pull` to run (2a);
  - a page over its size cap fails, a page over 90% of it warns (3a; the cap is 16 MB unless BUDGETS.json raises it);
  - a page missing a fragment a shared fragment needs, or holding it too late, fails (tools/fragment_needs.json, the
    NEEDS rule of tools/check_assembly.py: the water ext modules' order);
  - a build that takes the "names" check (tools/checks_optin.json) fails on a view name holding an apostrophe or a colon
    (item 30; tools/check_views.py's VIEW-NAME rule with no ratchet).
A build that takes the "recorded" check (item 25) refuses a plain `python3 build.py` (tools/check_port.py says why); a
new build's build.py calls buildlib.through_tools_build(__file__) at its top, so a plain run comes here by itself.
Fresh worktree: `python3 tools/lfs_needs.py <build> --pull` fetches every texture pack and bundle the build reads first.
A plain `python3 build.py` still works (unless the build takes the "recorded" check), but it leaves build-inputs.json behind,
so check_stale.py reports its page as UNRECORDED, and it does not see the LFS pointers it reads.
"""
import concurrent.futures, os, shutil, subprocess, sys, tempfile, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib, check_assembly  # noqa: E402

ROOT = buildlib.ROOT
HOOK = os.path.join(ROOT, 'tools', '_inputs')


def run(build, args, script='build.py', quiet=False):
    """Run one build command; returns (exit code, text)."""
    build = build.rstrip('/').replace(os.sep, '/')
    bdir = os.path.join(ROOT, build)
    if not os.path.isfile(os.path.join(bdir, script)):
        return 2, 'no %s/%s' % (build, script)
    logs = tempfile.mkdtemp(prefix='krator-inputs-')
    env = dict(os.environ, KRATOR_INPUTS_DIR=logs, KRATOR_ROOT=ROOT,
               PYTHONPATH=HOOK + os.pathsep + os.environ.get('PYTHONPATH', ''))
    try:
        r = subprocess.run([sys.executable, script] + list(args), cwd=bdir, env=env, stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace')
        out = r.stdout
        if r.returncode != 0:
            return r.returncode, out
        reads, writes, lists = set(), set(), set()
        for f in os.listdir(logs):
            import json
            with open(os.path.join(logs, f), encoding='utf-8') as fh:
                d = json.load(fh)
            reads.update(d['reads']); writes.update(d['writes']); lists.update(d['lists'])
    finally:
        shutil.rmtree(logs, ignore_errors=True)
    man = build + '/' + buildlib.MANIFEST
    outputs = sorted(p for p in writes if p != man and os.path.isfile(os.path.join(ROOT, p))
                     and not os.path.basename(p).startswith('.'))
    inputs = sorted(p for p in reads if p not in writes and p != man and os.path.isfile(os.path.join(ROOT, p)))
    outset = set(writes)
    listings = {}
    for d in sorted(lists):
        if d in ('', '.') or d.startswith('.git'):
            continue
        h = buildlib.listing_hash(d, outset)
        if h:
            listings[d] = h
    cmd = ' '.join([script] + list(args))
    buildlib.write_manifest(build, cmd, {
        'inputs': {p: buildlib.file_hash(os.path.join(ROOT, p)) for p in inputs},
        'listings': listings,
        'outputs': {p: buildlib.file_hash(os.path.join(ROOT, p)) for p in outputs},
        'outputs_raw': {p: buildlib.raw_hash(os.path.join(ROOT, p)) for p in outputs},
    })
    code, notes = 0, []
    for p in outputs:
        if p.endswith(('.html', '.js')):
            level, msg = buildlib.check_size(build, os.path.join(ROOT, p))
            if level:
                notes.append(('PAGE CAP FAIL  ' if level == 'fail' else 'page cap warn  ') + msg)
                code = code or (1 if level == 'fail' else 0)
        if p.endswith('.html') and not buildlib.is_pointer(os.path.join(ROOT, p)):
            with open(os.path.join(ROOT, p), encoding='utf-8', errors='replace') as fh:
                text = fh.read().replace('\r\n', '\n')
            for key, lines in check_assembly.check_needs(text):
                notes.append('FRAGMENT NEEDS FAIL  %s: %s' % (p, lines[0]))
                code = 1
    if buildlib.opted_in('names', build):   # item 30: no apostrophe or colon in a view name, no ratchet
        import check_views
        found, where, _, _ = check_views.scan(build)
        for k in sorted(found):
            if ': VIEW-NAME ' in k:
                notes.append('VIEW NAME FAIL  %s (%s): a view or check name may not hold : \' \\ / * ? " < > |' % (k, where[k][0]))
                code = 1
    tail = '\n'.join(notes)
    out += ('\n' + tail if tail else '') + '\nrecorded %s: %d inputs, %d listings, %d outputs' % (
        man, len(inputs), len(listings), len(outputs))
    return code, out


def all_commands():
    """test_all's rebuild list: every build (kits/interiors first) and the pages built only when asked."""
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import test_all
    cmds = [(b, [], 'build.py') for b in test_all.builds()]
    for name, cmd, cwd in test_all.extra_builds():
        cmds.append((cwd, cmd[2:], os.path.basename(cmd[1])))
    return cmds


def main(argv):
    if '--all' in argv:
        j = int(argv[argv.index('-j') + 1]) if '-j' in argv else 1
        cmds = all_commands()
        first = [c for c in cmds if c[0] in ('kits/interiors',)]
        rest = [c for c in cmds if c not in first]
        fails = []

        def one(c):
            t = time.time()
            code, out = run(c[0], c[1], c[2])
            return c, code, out, time.time() - t

        def report(res):
            c, code, out, dt = res
            name = ' '.join([c[0], c[2]] + c[1])
            print('%s  %s  (%.0fs)' % ('PASS' if code == 0 else 'FAIL', name, dt), flush=True)
            if code:
                fails.append(name)
                print('\n'.join('      ' + ln for ln in out.splitlines()[-15:]), flush=True)
        for c in first:
            report(one(c))
        # a build that writes a file the same manifest folder holds is never run twice at once: one worker per build
        groups = {}
        for c in rest:
            groups.setdefault(c[0], []).append(c)
        with concurrent.futures.ThreadPoolExecutor(max_workers=j) as ex:
            for res in ex.map(lambda g: [one(c) for c in g], groups.values()):
                for r in res:
                    report(r)
        print('%d commands, %d failed' % (len(cmds), len(fails)))
        return 1 if fails else 0
    pos = [a for a in argv if not a.startswith('--')]
    if not pos:
        print(__doc__); return 2
    build = pos[0]
    rest = argv[argv.index(build) + 1:]
    script = 'build.py'
    if '--script' in rest:
        i = rest.index('--script'); script = rest[i + 1]; rest = rest[:i] + rest[i + 2:]
    code, out = run(build, rest, script)
    print(out)
    return code


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
