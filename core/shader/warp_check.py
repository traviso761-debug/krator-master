#!/usr/bin/env python3
"""A built page's every drawn material takes the warp: KWARP on the running page, nothing built into it (core/shader/README.md).

    KRATOR_GL=gpu python3 core/shader/warp_check.py <page.html> [--out <folder>] [--k 0.00024] [--query ?x=1]

Injects core/shader/07-core-kwarp.js, installs a test Bend (y += k d^2 from the eye) on the page's scene, renders, and prints what bent
and every material left out with its reason. Writes <name>-flat.png and <name>-bent.png, to judge the seams by eye. Fails on a shader
error, a program that did not link, or a material left out for a reason not in ALLOWED. Takes the GPU lock."""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness  # noqa: E402

ALLOWED = ('the sky dome', 'a raw shader', 'no world projection', 'not compiled yet')
INSTALL = """k => { const S = (typeof scene !== 'undefined' && scene) || (window.BIO && BIO.host && BIO.host.scene) || (window.ATMOS && ATMOS.h && ATMOS.h.scene);
  if (!S) return 'no scene';
  window._kw = KWARP.install({key: 'bend', scene: S, uniforms: {uKWBend: {value: k}},
    glsl: 'uniform float uKWBend;vec3 kWarp(vec3 p){vec3 e=kEye();vec2 d=p.xz-e.xz;p.y+=uKWBend*dot(d,d);return p;}'});
  return 'ok'; }"""


async def run(a):
    from playwright.async_api import async_playwright
    html = os.path.abspath(a.page)
    name = os.path.splitext(os.path.basename(html))[0]
    folder = os.path.dirname(html)
    here = os.path.dirname(folder) if os.path.basename(folder) == 'dist' else folder
    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(HERE, '07-core-kwarp.js'), encoding='utf-8') as fh:
        frag = fh.read()
    with harness.gpu_lock(what='warp_check ' + name):
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            try:
                with harness.serve(folder) as port:
                    pg, errs, ready = await harness.open_page(b, html, port, here=here, query=a.query)
                    await pg.wait_for_timeout(4000)
                    await pg.screenshot(path=os.path.join(a.out, name + '-flat.png'))
                    await pg.add_script_tag(content=frag)
                    st = await pg.evaluate(INSTALL, a.k)
                    await pg.wait_for_timeout(8000)
                    await pg.evaluate('() => _kw.sweep() && 0')
                    await pg.wait_for_timeout(6000)
                    await pg.screenshot(path=os.path.join(a.out, name + '-bent.png'))
                    r = await pg.evaluate('() => _kw.report()')
                    prog = await pg.evaluate("() => KHOOK.checkPrograms().map(r => r.kind + ': ' + (r.name || r.layer) + ' ' + (r.fragmentLog || r.vertexLog || r.programLog || r.anchor || '').slice(0, 200))")
                    sh = harness.gl_errors(getattr(pg, 'krator_console', []))
            finally:
                await b.close()
    left = {}
    for x in r['left']:
        left.setdefault(x['reason'], []).append(x['material'] + (' on ' + x['object'] if x['object'] else ''))
    print('%s: ready %s, install %s; %d programs bent, %d meshes with default shadows, %d page errors' % (name, ready, st, r['warped'], r['depth'], len(errs)))
    for why, ms in left.items():
        print('  left out (%d): %s: %s' % (len(ms), why, ', '.join(sorted(set(ms))[:6])))
    print('  shader errors: %d %s' % (len(sh), ' | '.join(t[:200] for t in sh[:2])))
    print('  programs: %s' % (json.dumps(prog[:2]) if prog else 'all linked'))
    bad = st != 'ok' or sh or prog or not r['warped'] or [w for w in left if not w.startswith(ALLOWED)]
    return 1 if bad else 0


if __name__ == '__main__':
    A = argparse.ArgumentParser()
    A.add_argument('page')
    A.add_argument('--out', default='warp-shots')
    A.add_argument('--k', type=float, default=0.00024)
    A.add_argument('--query', default='')
    sys.exit(asyncio.run(run(A.parse_args())))
