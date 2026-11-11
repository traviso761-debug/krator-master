#!/usr/bin/env python3
"""The survey's tools-side checks (CORE-IMPROVEMENTS.md items 23-26, 30, 31; the 2026-11-11 survey), each on a fixture built
here with the fault in it, which must fail, beside the fixed one, which must pass. The harness-side ones (22, 27, 28) are in
test_verify_page.py, the node helper (29) in test_ktest.py.

    python3 tools/tests/test_survey_checks.py

Fixture builds go in a temporary folder under tools/tests/ (the tools resolve builds against the repo root) and are removed
on the way out; nothing tracked is touched.
"""
import contextlib, io, json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = sys.executable
sys.path.insert(0, os.path.join(ROOT, 'tools'))
for k in ('KRATOR_CHECKS', 'KRATOR_INPUTS_DIR', 'KRATOR_ALLOW_PLAIN_BUILD', 'KRATOR_GPU_LOCK_HELD', 'KRATOR_GPU_LANE_HELD'):
    os.environ.pop(k, None)
import buildlib, check_assembly, check_stale, check_text, check_views, commit, harness, lfs_needs  # noqa: E402

fails = []
POINTER = 'version https://git-lfs.github.com/spec/v1\noid sha256:%s\nsize 1234\n'


def check(name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + (': ' + str(detail)[:400] if detail and not ok else ''))
    if not ok:
        fails.append(name)


def write(path, text, binary=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb' if binary else 'w', **({} if binary else {'encoding': 'utf-8', 'newline': '\n'})) as fh:
        fh.write(text)


@contextlib.contextmanager
def env(**kw):
    old = {k: os.environ.get(k) for k in kw}
    os.environ.update({k: v for k, v in kw.items()})
    try:
        yield
    finally:
        for k, v in old.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v


def manifest(build, inputs, outputs, listings=(), cmd='build.py'):
    """A build-inputs.json as tools/build.py writes it, for the files as they are now."""
    buildlib.write_manifest(build, cmd, {
        'inputs': {p: buildlib.file_hash(os.path.join(ROOT, p)) for p in inputs},
        'listings': {d: buildlib.listing_hash(d, outputs) for d in listings},
        'outputs': {p: buildlib.file_hash(os.path.join(ROOT, p)) for p in outputs},
        'outputs_raw': {p: buildlib.raw_hash(os.path.join(ROOT, p)) for p in outputs}})


def test_lfs_needs():   # item 23
    root = tempfile.mkdtemp(prefix='krator-lfs-')
    try:
        write(os.path.join(root, 'kits/a/tex/bark.jpg'), POINTER % ('1' * 64))
        write(os.path.join(root, 'kits/a/tex/leaf.png'), b'\x89PNG real bytes\0', binary=True)   # pulled already
        write(os.path.join(root, 'kits/a/src/10-a.js'), "const PACK='../../kits/b/tex/';\n")
        write(os.path.join(root, 'kits/b/tex/stone.webp'), POINTER % ('2' * 64))
        write(os.path.join(root, 'kits/c/dist/core.js'), POINTER % ('3' * 64))
        write(os.path.join(root, 'kits/a/build.py'), '# a fixture\n')
        write(os.path.join(root, 'kits/a/build-inputs.json'), json.dumps({'runs': {'build.py': {'inputs': {'kits/c/dist/core.js': 'x'}}}}))
        reads = lfs_needs.build_reads('kits/a', root=root, use_list=False)
        ptr = lfs_needs.pointers(reads, root=root)
        check('lfs_needs: its own tex/, a pack named in its source, a bundle in its manifest',
              ptr == ['kits/a/tex/bark.jpg', 'kits/b/tex/stone.webp', 'kits/c/dist/core.js'], ptr)
        check('lfs_needs: a file already pulled is not listed (the negative: a real image)', 'kits/a/tex/leaf.png' in reads and 'kits/a/tex/leaf.png' not in ptr)
        cmd = lfs_needs.pull_command(ptr)
        check('lfs_needs: one pull, a tex/ folder whole', cmd == 'git lfs pull --include="kits/a/tex/**,kits/b/tex/**,kits/c/dist/core.js"', cmd)
        write(os.path.join(root, 'settlements/s/tests/test-x.js'),
              "const P=path.join(HERE,'dist','plan.js'); const I=require(path.join(__dirname,'..','..','..','kits','i','dist','core.js'));\n")
        write(os.path.join(root, 'settlements/s/dist/plan.js'), POINTER % ('4' * 64))
        write(os.path.join(root, 'kits/i/dist/core.js'), 'module.exports={};\n')
        got = lfs_needs.test_reads('settlements/s/tests/test-x.js', root=root)
        check('lfs_needs --test: the bundles a node test requires, its own and another kit\'s',
              sorted(got) == ['kits/i/dist/core.js', 'settlements/s/dist/plan.js'], sorted(got))
        check('lfs_needs --test: only the pointer is to pull', lfs_needs.pointers(got, root=root) == ['settlements/s/dist/plan.js'])
    finally:
        shutil.rmtree(root, ignore_errors=True)


def test_stale_and_sources(tmp):   # items 24, 31
    b = tmp + '/stale'
    full = os.path.join(ROOT, b)
    write(os.path.join(full, 'src/10-a.js'), 'var A=1;\n')
    write(os.path.join(full, 'KNOWN_ISSUES.md'), '# known\n- one\n')
    write(os.path.join(full, 'py/helper.py'), 'X = 1\n')
    write(os.path.join(full, 'dist/p.html'), '<script>var A=1;</script>\n')
    ins = [b + '/src/10-a.js', b + '/KNOWN_ISSUES.md', b + '/py/helper.py']
    manifest(b, ins, [b + '/dist/p.html'], listings=[b + '/src', b + '/py'])
    page = os.path.join(full, 'dist', 'p.html')

    def keys():
        check_stale._hash.clear()
        return [k for k, _, _ in check_stale.check(b)]
    check('check_stale: a fresh build has no finding', keys() == [], keys())
    check('page_sources: a fresh page is current', (harness.page_sources(page) or ['?'])[0] == 'current', harness.page_sources(page))
    write(os.path.join(full, 'KNOWN_ISSUES.md'), '# known\n- one\n- two\n')
    write(os.path.join(full, 'py/other.py'), 'Y = 2\n')
    check('check_stale: KNOWN_ISSUES.md and an import-path listing only read DOCS-ONLY (item 24)', keys() == [b + ': DOCS-ONLY build.py'], keys())
    check('page_sources: a docs-only change keeps the page current', harness.page_sources(page)[0] == 'current', harness.page_sources(page))
    write(os.path.join(full, 'src/20-b.js'), 'var B=2;\n')
    check('check_stale: a fragment added to src/ is STALE (the negative: a listing the page is made from)', keys() == [b + ': STALE build.py'], keys())
    os.remove(os.path.join(full, 'src/20-b.js'))
    write(os.path.join(full, 'src/10-a.js'), 'var A=2;\n')
    check('check_stale: a changed fragment is STALE', keys() == [b + ': STALE build.py'], keys())
    st = harness.page_sources(page)
    check('page_sources: a changed fragment makes the page stale (item 31)', st and st[0] == 'stale' and any('10-a.js' in w for w in st[1]), st)
    V = harness.VerifyPage(page, full)
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        code = V.exit()
    check('VerifyPage.exit: a pass on a stale page says STALE PASS', code == 0 and 'STALE PASS' in out.getvalue(), out.getvalue())
    write(os.path.join(full, 'src/10-a.js'), 'var A=1;\n')
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        V.exit()
    check('VerifyPage.exit: a current page says OK, not stale', 'STALE' not in out.getvalue() and 'OK' in out.getvalue(), out.getvalue())


def test_through_tools_build(tmp):   # item 25
    for name, helper in (('rec', True), ('plain', False)):
        b = tmp + '/' + name
        full = os.path.join(ROOT, b)
        head = ('import os, sys\nsys.path.insert(0, %r)\nimport buildlib\nbuildlib.through_tools_build(__file__)\n' % os.path.join(ROOT, 'tools')
                if helper else 'import os\n')
        write(os.path.join(full, 'build.py'), head + "os.makedirs('dist', exist_ok=True)\n"
              "open('dist/p.html', 'w', encoding='utf-8', newline='\\n').write(open('src.js', encoding='utf-8').read())\n")
        write(os.path.join(full, 'src.js'), '<script>var A=1;</script>\n')
        r = subprocess.run([PY, 'build.py'], cwd=full, capture_output=True, text=True, encoding='utf-8', errors='replace')
        has = os.path.isfile(os.path.join(full, buildlib.MANIFEST))
        if helper:
            m = buildlib.load_manifest(b) or {}
            ins = list(m.get('runs', {}).get('build.py', {}).get('inputs', {}))
            check('through_tools_build: a plain `python3 build.py` writes build-inputs.json (item 25)',
                  r.returncode == 0 and has and b + '/src.js' in ins, r.stdout[-300:] + r.stderr[-300:])
        else:
            check('the negative: a build.py without the helper leaves no build-inputs.json', r.returncode == 0 and not has)
    b = tmp + '/plain'
    with env(KRATOR_CHECKS='recorded'):
        why = buildlib.plain_build_refusal(b)
        r = subprocess.run([PY, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', os.path.join(ROOT, b)], capture_output=True, text=True)
        check('check_port refuses a plain build of an opted-in build (exit 3)', why and r.returncode == 3 and 'tools/build.py' in r.stdout, r.stdout + r.stderr)
        with env(KRATOR_INPUTS_DIR='/nowhere'):
            check('... and lets tools/build.py through', buildlib.plain_build_refusal(b) is None)
    check('... and a build not opted in is left alone', buildlib.plain_build_refusal(b) is None)


def test_assembly(tmp):   # item 26
    check('check_assembly names the fragment for BIO.leafOn', (check_assembly.fix_for('BIO.leafOn') or '').startswith('add core/biome/31b-core-leafset.js'),
          check_assembly.fix_for('BIO.leafOn'))
    heads = [check_assembly.header_of(f) for f in buildlib.CORE_BIOME_MIN]
    full_page = '\n'.join(h + '\nvar x;' for h in heads) + '\n'
    short = '\n'.join(h + '\nvar x;' for h, f in zip(heads, buildlib.CORE_BIOME_MIN) if '31b' not in f) + '\n'
    with env(KRATOR_CHECKS='minset'):
        got = check_assembly.check_minset(short, 'biomes/x')
        check('MINSET: a page with the biome head but no 31b fails (opted in)', [k for k, _ in got] == ['MINSET core/biome/31b-core-leafset.js'], got)
        check('MINSET: the page with all of CORE_BIOME_MIN passes', check_assembly.check_minset(full_page, 'biomes/x') == [])
    check('MINSET: a build not opted in is not checked', check_assembly.check_minset(short, 'biomes/x') == [])
    b = tmp + '/asm'
    page = b + '/dist/p.html'
    write(os.path.join(ROOT, page), '<script>\nvar BIO = BIO || {}; BIO.kit = function(){};\nBIO.leafOn(1, 2);\n</script>\n')
    _, f, d, _ = check_assembly.check_page(page)
    k = page + ': MISSING BIO.leafOn'
    check('check_page: the MISSING finding says which fragment to add', k in f and any('31b-core-leafset.js' in ln for ln in d.get(k, [])), d)


def test_text_and_names(tmp):   # item 30
    cases = {'clean.md': ('caf\u00e9 \u2014 fine\n'.encode('utf-8'), []), 'bom.md': (b'\xef\xbb\xbfsubject\n', ['BOM']),
             'u16.md': ('x\n'.encode('utf-16'), ['BOM']), 'moji.md': ('caf\u00c3\u00a9 \u00e2\u20ac\u201d\n'.encode('utf-8'), ['MOJIBAKE']),
             'crlf.md': (b'a\r\nb\r\n', ['CRLF']), 'ok.bat': (b'@echo off\r\n', [])}
    for n, (data, want) in cases.items():
        got = [r for r, _ in check_text.scan_bytes(n, data)]
        check('check_text %s: %s' % (n, want or 'clean'), got == want, got)
    moji = 'quoted: caf\u00c3\u00a9\n'.encode('utf-8')
    check('check_text: mojibake already in the committed file is not the change\'s', check_text.scan_bytes('n.md', moji + b'more\n', moji) == [])
    check('check_text: ... but mojibake the change adds is', [r for r, _ in check_text.scan_bytes('n.md', moji + moji, moji)] == ['MOJIBAKE'])
    text, probs = commit.clean_message(b'\xef\xbb\xbfFix the thing\r\n\r\nBody line  \r\n')
    check('commit.py: a BOM and CRLF are cleaned out of the message', text == 'Fix the thing\n\nBody line\n' and not probs, repr(text) + str(probs))
    check('commit.py: mojibake in the message refuses it', commit.clean_message('Fix caf\u00c3\u00a9\n'.encode('utf-8'))[1])
    repo = tempfile.mkdtemp(prefix='krator-commit-')
    try:
        g = lambda *a: subprocess.run(['git'] + list(a), cwd=repo, capture_output=True, text=True)
        g('init', '-q'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 'test'); g('config', 'commit.gpgsign', 'false')
        write(os.path.join(repo, 'a.md'), b'\xef\xbb\xbfhello\n', binary=True)
        write(os.path.join(repo, 'msg.txt'), b'\xef\xbb\xbfAdd a\r\n', binary=True)
        g('add', 'a.md')
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = commit.main(['-F', 'msg.txt'], cwd=repo)
        check('commit.py refuses a staged file with a BOM (nothing committed)', code == 1 and g('rev-parse', 'HEAD').returncode != 0, out.getvalue())
        write(os.path.join(repo, 'a.md'), b'hello\n', binary=True)
        g('add', 'a.md')
        with contextlib.redirect_stdout(io.StringIO()):
            code = commit.main(['-F', 'msg.txt', '-q'], cwd=repo)
        msg = g('log', '-1', '--format=%B').stdout
        check('commit.py commits clean text with the message cleaned', code == 0 and msg.strip() == 'Add a' and '\ufeff' not in msg, repr(msg))
    finally:
        shutil.rmtree(repo, ignore_errors=True)
    check('check_views: an apostrophe or a colon is not a safe view name', check_views.unsafe("Bob's view") and check_views.unsafe('a: b')
          and not check_views.unsafe('Bob view'))
    b = tmp + '/names'
    full = os.path.join(ROOT, b)
    write(os.path.join(full, 'src/10-views.js'), 'const VIEWS = {"the smith\'s yard": [0, 0, 0], "gate": [1, 1, 1]};\n')
    write(os.path.join(full, 'build.py'), "import os\nos.makedirs('dist', exist_ok=True)\nopen('dist/p.html', 'w', encoding='utf-8', newline='\\n').write('<p>')\n")
    run = lambda: subprocess.run([PY, os.path.join(ROOT, 'tools', 'build.py'), b], capture_output=True, text=True, encoding='utf-8', errors='replace')
    r0 = run()
    with env(KRATOR_CHECKS='names'):
        r1 = run()
    check('tools/build.py: a view name with an apostrophe fails an opted-in build, and only that', r0.returncode == 0 and r1.returncode == 1
          and 'VIEW NAME FAIL' in r1.stdout and "smith's" in r1.stdout, r0.stdout[-200:] + ' | ' + r1.stdout[-300:])


def main():
    test_lfs_needs()
    tmp = 'tools/tests/_tmp_survey_%d' % os.getpid()
    try:
        test_stale_and_sources(tmp)
        test_through_tools_build(tmp)
        test_assembly(tmp)
        test_text_and_names(tmp)
    finally:
        shutil.rmtree(os.path.join(ROOT, tmp), ignore_errors=True)
    print('\n%d failed' % len(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
