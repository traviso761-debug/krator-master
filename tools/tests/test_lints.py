#!/usr/bin/env python3
"""Each check test_all.py runs, against the case it exists to catch (a lint that passes on everything proves nothing)."""
import json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, check_assembly, check_source, port_baseline  # noqa: E402

fails = []


def check(name, ok):
    print('%s  %s' % ('pass' if ok else 'FAIL', name))
    if not ok:
        fails.append(name)


# ---- check_source: a positive and a negative for each rule
def rules(text):
    return set(check_source.lint(text))


check('TRAILING a swallowed statement', 'TRAILING' in rules("a=1; // b=2; c=3;\n"))
check('TRAILING a swallowed brace', 'TRAILING' in rules("if(a){b(); // c(); }\n"))
check('TRAILING leaves prose', 'TRAILING' not in rules("a=1; // the fold; see the plan\n"))
check('TRAILING leaves a comment on its own line', 'TRAILING' not in rules("// b=2; c=3;\na=1;\n"))
check('ORNUM an option read', 'ORNUM' in rules("const s=o.scale||1.5;\n"))
check('ORNUM leaves 0', 'ORNUM' not in rules("const s=o.scale||0;\n"))
check('ORNUM leaves a bare guard', 'ORNUM' not in rules("const s=dz||1;\n"))
check('ORNUM leaves .length', 'ORNUM' not in rules("const s=a.length||1;\n"))
check('CAMPOS in a hook', 'CAMPOS' in rules("m.onBeforeCompile=s=>{s.x=`vec3 d=cameraPosition-p;`;};\n"))
check('CAMPOS leaves a ShaderMaterial file', 'CAMPOS' not in rules("const f=`vec3 d=cameraPosition-p;`;\n"))
check('BAREGLSL a bare splice', 'BAREGLSL' in rules("const f=`float a=${x};`;\n"))
check('BAREGLSL leaves a call', 'BAREGLSL' not in rules("const f=`float a=${A.glf(x)};`;\n"))
check('BAREGLSL leaves a chunk splice', 'BAREGLSL' not in rules("const f=`float a;\n${chunk}\nvoid main(){}`;\n"))
check('RAWTEX an undecoded sample', 'RAWTEX' in rules("m.onBeforeCompile=s=>{s.x='vec4 c=texture2D(t,uv);';};\n"))
check('RAWTEX leaves a decoded one', 'RAWTEX' not in rules("m.onBeforeCompile=s=>{s.x='vec4 c=pow(texture2D(t,uv),vec4(2.2));';};\n"))


# ---- check_assembly: the scanner's scopes and the rules
def reads(body):
    return {n for _, n in check_assembly.analyse(body)['reads']}


def decls(body):
    return {d[1] for d in check_assembly.analyse(body)['decls']}


check('an arrow parameter shadows', 'P' not in reads("[1].map(P=>P+1);\n"))
check('arrow parameters shadow', 'K' not in reads("[1].map((K,i)=>K+i);\n"))
check('an arrow still reads its globals', 'Q' in reads("[1].map(P=>P+Q);\n"))
check('a declarator list survives an inner const', 'b' in decls("const a=()=>{const t=1;return t;},b=2;\n"))


def page(frags):
    return '\n'.join(check_assembly.header_of(f) for f in frags)


W = 'core/water/'
pg = page([W + '20-core-water.js', W + '22-core-water-flow.js', W + 'ext/55-core-water-confluence.js'])
check('NEEDS a missing need', any('21-core-water-shore' in k for k, _ in check_assembly.check_needs(pg)))
pg = page([W + '20-core-water.js', W + '21-core-water-shore.js', W + '22-core-water-flow.js',
           W + 'ext/57-core-water-audit.js', W + 'ext/55-core-water-confluence.js'])
check('NEEDS 57 before 55', any('57-core-water-audit' in k for k, _ in check_assembly.check_needs(pg)))
pg = page([W + '20-core-water.js', W + '22-core-water-flow.js', W + 'ext/57-core-water-audit.js'])
check('NEEDS 57 without 55 is fine', not check_assembly.check_needs(pg))

# ---- the LFS refusal, the baseline's NOT BUILT and its --write guard
POINTER = 'version https://git-lfs.github.com/spec/v1\noid sha256:%s\nsize 12\n' % ('a' * 64)
tmp = tempfile.mkdtemp(prefix='krator-lints-')
try:
    ptr = os.path.join(tmp, 'albedo.jpg')
    with open(ptr, 'w') as fh:
        fh.write(POINTER)
    check('a pointer is seen', buildlib.is_pointer(ptr) and buildlib.pointer_oid(ptr) == 'a' * 64)
    check('a texture pointer is refusable', buildlib.refusable('core/materials/library/x/albedo.jpg'))
    check('a page pointer is an output', not buildlib.refusable('biomes/rift/dist/rift.html'))
    try:
        buildlib.refuse_pointer(ptr)
        check('refuse_pointer stops', False)
    except SystemExit as e:
        check('refuse_pointer stops, naming the pull', 'git lfs pull' in str(e))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    try:
        import pack
    except ImportError:
        pack = None     # numpy or Pillow missing: the build needs them, this test does not
    if pack:
        try:
            pack.load(ptr, 16, 'RGB')
            check('pack.py refuses a pointer', False)
        except SystemExit as e:
            check('pack.py refuses a pointer', 'git lfs pull' in str(e))

    out, pg, st, rt = port_baseline.OUT, port_baseline.pages, buildlib.git_status, port_baseline.ROOT
    port_baseline.OUT = os.path.join(tmp, 'b.json')
    port_baseline.ROOT = tmp
    port_baseline.pages = lambda: ['p.html']
    with open(os.path.join(tmp, 'p.html'), 'w') as fh:
        fh.write(POINTER)
    with open(port_baseline.OUT, 'w') as fh:
        json.dump({'pages': {'p.html': {'sha256': 'b' * 64, 'bytes': 1}}}, fh)
    check('the compare does not fail on a pointer page', port_baseline.main([]) == 0)
    check('--write refuses a pointer page', port_baseline.main(['--write']) == 1)
    check('--update refuses a pointer page', port_baseline.main(['--update', 'p.html']) == 1)
    with open(os.path.join(tmp, 'p.html'), 'w') as fh:
        fh.write('<html></html>')
    buildlib.git_status = lambda: ['someone/else.js']
    check('--write refuses other work in the tree', port_baseline.main(['--write']) == 1)
    check('the compare fails on a changed page', port_baseline.main([]) == 1)
    port_baseline.OUT, port_baseline.pages, buildlib.git_status, port_baseline.ROOT = out, pg, st, rt
finally:
    shutil.rmtree(tmp, ignore_errors=True)

# ---- reach: a file every biome takes reaches something, and says which builds it cannot answer for
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'reach.py'), 'core/rand/08-core-rand.js'], capture_output=True, text=True,
                   encoding='utf-8', errors='replace')
check('reach.py answers', r.returncode == 0 and ' page(s)' in r.stdout and not r.stdout.startswith('0 build'))

print('%d failed' % len(fails))
sys.exit(1 if fails else 0)
