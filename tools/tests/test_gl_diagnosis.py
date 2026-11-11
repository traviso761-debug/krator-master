#!/usr/bin/env python3
"""What a shader failure was (tools/harness.py verify_page: the `gl-context` line, and the names in `shader-errors`).
A context lost and restored is counted and fails nothing; a ShaderMaterial that never links is named with its mesh; link
errors on a program that is gone by the end read as transient, and as following from the context loss when the context
of their canvas was lost just after (the signature of 2026-11-11). Always on software GL: no GPU lane is taken.

Headless Chromium on software GL sometimes loses the first context by itself as its GPU process starts (and restores it
a second later), so the cases count the losses the page asked for and the fixture keeps its own failures clear of that one.

    python3 tools/tests/test_gl_diagnosis.py
"""
import asyncio, os, sys

for k in ('KRATOR_GL', 'KRATOR_GPU_LANE', 'KRATOR_GPU_LANE_HELD', 'KRATOR_GPU_LOCK_HELD'):
    os.environ.pop(k, None)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import harness   # noqa: E402

FIXTURE = os.path.join(HERE, 'verify_page', 'gl.html')
FOLLOWS = 'the link errors below follow from it; rerun with --no-cache'
VALID = 'link errors were logged but every program is valid now'
NAMED = 'programs that do not link now (1): ShaderMaterial (key'
# case -> (the universal asserts it must fail, the losses the page asks for, what shader-errors must say, what it must not)
CASES = {
    'clean': (set(), 0, [], []),
    'lost': (set(), 1, [], []),
    'broken': ({'shader-errors'}, 0, [NAMED, 'NaN_is_not_glsl', 'material ShaderMaterial "bad glsl"', "on 'broken sign'", 'log: ', 'as they failed: '], [FOLLOWS, VALID]),
    'transient': ({'shader-errors'}, 0, [VALID, 'no context loss explains them: a transient driver failure', 'as they failed: 1 link (ShaderMaterial)'],
                  [FOLLOWS, 'do not link now']),
    'lost-links': ({'shader-errors'}, 1, ['the WebGL context was lost 1 time during the run: ' + FOLLOWS, VALID, 'built again after the context came back',
                                          'as they failed: 1 link (ShaderMaterial)'], ['do not link now']),
}


async def one(case):
    async with harness.verify_page(FIXTURE, here=os.path.dirname(FIXTURE), size='640x400', query='?case=' + case, settle_ms=500) as V:
        pass
    return V


def pure():
    """gl_diagnosis on records no fixture makes: which link failures a loss explains."""
    link = 'THREE.WebGLProgram: shader error: 0 35715 false gl.getProgramInfoLog'
    base = {'hooked': True, 'canvases': 2, 'renderers': 1, 'programs': 9, 'lostNow': 0, 'scene': True, 'bad': [], 'badN': 0, 'heldN': 0, 'links': [], 'linkN': 0}
    ev = lambda e, t, canvas=1, asked=False: {'e': e, 't': t, 'canvas': canvas, 'size': '64x64', 'asked': asked}   # noqa: E731
    fail = lambda t, canvas=1, name='MeshStandardMaterial': {'t': t, 'canvas': canvas, 'name': name, 'lost': False, 'empty': True}   # noqa: E731
    prog = {'name': 'MeshStandardMaterial', 'key': 'standard,', 'log': '', 'materials': ['MeshStandardMaterial "wall"'], 'meshes': ['keep'], 'meshN': 3, 'held': []}
    D, out = harness.gl_diagnosis, []
    # a loss and a GL call error, no link failure recorded: counted on its line, nothing claimed
    ctx, pre, post = D(dict(base, ev=[ev('lost', 4000)]), ['WebGL: INVALID_OPERATION: texImage2D: no texture'])
    out.append(('a loss with no link failure recorded explains nothing', 'lost 1 time' in ctx and not pre and not post))
    # link failures on canvas 1, the loss on canvas 2
    ctx, pre, post = D(dict(base, ev=[ev('lost', 4000, 2)], links=[fail(3900)], linkN=1), [link])
    out.append(('a loss on another canvas explains nothing', not pre and 'no context loss explains them' in post))
    # a link failure half a minute before the loss, and one long after the restore
    ctx, pre, post = D(dict(base, ev=[ev('lost', 40000), ev('restored', 41000)], links=[fail(9000), fail(60000)], linkN=2), [link] * 2)
    out.append(('a loss far from the link failures explains nothing', not pre and 'no context loss explains them' in post))
    # 22 link failures with empty logs just before the context of their canvas went, twice
    P = dict(base, ev=[ev('lost', 4000), ev('restored', 4400), ev('lost', 9000)], linkN=22,
             links=[fail(3900 + i, name='MeshStandardMaterial' if i % 2 else 'ShaderMaterial') for i in range(22)])
    ctx, pre, post = D(P, [link] * 22)
    out.append(('22 link failures as the context of their canvas went', pre.startswith('the WebGL context was lost 2 times during the run: ' + FOLLOWS)
                and '22 links (MeshStandardMaterial x11, ShaderMaterial x11)' in post and 'all with an empty log' in post
                and 'lost 2 times and restored 1 time' in ctx and VALID in post))
    # one of two inside the window
    ctx, pre, post = D(dict(base, ev=[ev('lost', 40000), ev('restored', 41000)], links=[fail(9000), fail(39990)], linkN=2), [link] * 2)
    out.append(('one of two link failures explained', '1 of the 2 link errors below follow from it' in pre))
    # a program still unlinked at the end is named, whatever the context did
    ctx, pre, post = D(dict(base, ev=[ev('lost', 4000), ev('restored', 4400)], links=[fail(3990)], linkN=1, bad=[prog], badN=1), [link])
    out.append(('a program still unlinked is named, not put down to the loss', not pre and 'programs that do not link now (1): MeshStandardMaterial' in post
                and "on 'keep' and 2 more" in post and 'an empty log' in post))
    # r128 keeps a failed program on a material that draws with another now
    ctx, pre, post = D(dict(base, links=[fail(3990)], linkN=1, heldN=1, bad=[dict(prog, meshes=[], meshN=0, held=['ShaderMaterial "sea"'])]), [link])
    out.append(('a failed program its material no longer draws with', 'every program drawn now is valid' in post and 'kept by a material' in post))
    # a page the hook never reached: the line says so and nothing is claimed
    ctx, pre, post = D(None, [link])
    out.append(('no record: nothing claimed', 'not watched' in ctx and not pre and not post))
    # no shader failure: only the line
    ctx, pre, post = D(dict(base, ev=[ev('lost', 100), ev('restored', 1100)]), [])
    out.append(('no failure: only the line', 'lost 1 time and restored 1 time' in ctx and not pre and not post))
    return out


async def main():
    bad = 0
    for case, (want, asks, sh_has, sh_not) in CASES.items():
        V = await one(case)
        U = {n: (ok, d) for n, ok, d in V.universal}
        failed = {n for n, (ok, d) in U.items() if not ok}
        ctx, sh = U.get('gl-context', (False, '(no gl-context line)')), U.get('shader-errors', (True, ''))[1]
        lost = [e for e in (V.gl or {}).get('ev', []) if e['e'] == 'lost']
        back = [e for e in (V.gl or {}).get('ev', []) if e['e'] == 'restored']
        asked = sum(1 for e in lost if e.get('asked'))
        # the line gives the count the page's own record holds; the page's own losses are the ones the case makes
        line = ('the WebGL context was lost %s and restored %s' % (harness._times(len(lost)), harness._times(len(back)))) if lost else 'no WebGL context lost'
        miss = [s for s in [line] + ((['%d asked for by the page' % asks]) if asks else []) if s not in ctx[1]]
        miss += [s for s in sh_has if s not in sh] + ['NOT ' + s for s in sh_not if s in sh]
        ok = failed == want and ctx[0] and not miss and asked == asks and len(back) == len(lost)
        bad += not ok
        print('%s  %-11s fails %s%s' % ('ok  ' if ok else 'FAIL', case, sorted(failed) or 'nothing',
                                        '' if ok else '   (expected %s; %d losses asked for, expected %d; missing %s)' % (sorted(want) or 'nothing', asked, asks, miss)), flush=True)
        print('        gl-context : ' + ctx[1])
        if sh_has or not ok:
            print('        shader-errors : ' + sh)
    checks = pure()
    for name, ok in checks:
        bad += not ok
        print('%s  %s' % ('ok  ' if ok else 'FAIL', name))
    print('%d cases, %d wrong' % (len(CASES) + len(checks), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
