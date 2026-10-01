#!/usr/bin/env python3
"""Headless verification for the master catalog (dist/catalog.html).

Usage:
  python3 verify.py dist/catalog.html [--assert] [--seeds 4] [--sheet all|furniture|plants|buildings]
                                      [--out ./shots] [--rows] [--dump r.json] [--eval "()=>..."]

What it does:
  1. Serves this folder over HTTP and routes three.min.js to the local r128 copy.
  2. Loads the sheet in headless Chromium with software WebGL (SwiftShader).
  3. Prints the error panel (#errs) and page errors; either fails the run.
  4. --assert, measured inside the page for EVERY instance (every entry, every variant):
       builds            no build exception, at least one mesh
       no-nan-geometry   no NaN vertex or transform
       declared-size     the built geometry, over seeds 1..--seeds (default 4), fits the
                         declared box centred on the instance origin: x in [-w/2, w/2],
                         y in [0, h], z in [-d/2, d/2], each side within
                         max(TOL_M, TOL_FRAC * dimension); plants may sink ROOT_FRAC * h
       tags              furniture: culture, type, setting, rooms, anchor, clearance,
                         materials (kits/furniture/SPEC.md "The entry"), and the
                         materials it declares cover every material family it builds with;
                         plants: climate + aridity; buildings: culture + type (family)
     plus static checks on krator-master-furniture.js:
       spec-source       no entry still declares the old `room:` key
       WARN lines        SPEC "No host globals" / "No literal colour arrays" counts
                         (reported, not failed; see KNOWN_ISSUES.md)
     Under-size (built > 30% smaller than declared on an axis) is a WARN.
  5. --out: screenshots (initial view, one per section, and --rows one per row).

Exit code is non-zero if the error panel is dirty, the page threw, or an assertion fails.
ALLOW (below) lists pieces deferred in KNOWN_ISSUES.md; it is empty unless a piece
genuinely cannot be fixed.

Requires: pip install playwright (Chromium at /opt/pw-browsers/chromium or PW_CHROMIUM).
"""
import argparse, asyncio, http.server, json, os, re, socketserver, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
TOL_M, TOL_FRAC, UNDER_FRAC, ROOT_FRAC = 0.05, 0.04, 0.30, 0.10
# key -> reason; only for pieces recorded as deferred in KNOWN_ISSUES.md
ALLOW = {}

HOST_GLOBALS = re.compile(r'\b(kput|BOX|FAMMAT|MAT|PAL|scene|THREE|mk[A-Z]\w*|_target|treeHelper)\b')
BARE_HELPERS = re.compile(r'(?<![\w.$])(shade|TAU)\b')
HEX = re.compile(r'0x[0-9a-fA-F]{3,6}\b')
HEX_ARRAY = re.compile(r'\[\s*0x[0-9a-fA-F]{3,6}\s*,\s*0x[0-9a-fA-F]{3,6}')


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


def furn_blocks():
    src = open(os.path.join(HERE, 'krator-master-furniture.js'), encoding='utf-8').read()
    starts = [m.start() for m in re.finditer(r'^FURN\(\{', src, re.M)] + [len(src)]
    out = []
    for a, b in zip(starts, starts[1:]):
        blk = src[a:b]
        key = re.search(r"key\s*:\s*'([^']+)'", blk).group(1)
        i = blk.find('build')
        out.append((key, blk[:i], blk[i:]))
    return out


def static_checks():
    """SPEC source conformance and the two style rules, from the source text."""
    res, warns = [], []
    blocks = furn_blocks()
    old_room = [k for k, head, _ in blocks if re.search(r'(?<![\w])room\s*:', head)]
    res.append({'name': 'spec-source', 'ok': not old_room,
                'detail': ('%d entries still declare room: %s' % (len(old_room), ', '.join(old_room[:8])))
                if old_room else '%d FURN entries, none uses the old room: key' % len(blocks)})
    hg = [(k, sorted(set(HOST_GLOBALS.findall(body)))) for k, _, body in blocks]
    hg = [(k, g) for k, g in hg if g]
    bare = [k for k, _, body in blocks if BARE_HELPERS.search(body)]
    lit = [(k, len(HEX.findall(body))) for k, _, body in blocks]
    lit = [(k, n) for k, n in lit if n]
    arr = [k for k, _, body in blocks if HEX_ARRAY.search(body)]
    warns.append('host globals (kput/BOX/FAMMAT/MAT/PAL/scene/THREE/mk*): %d of %d pieces%s'
                 % (len(hg), len(blocks), (' - ' + '; '.join('%s: %s' % (k, ','.join(g)) for k, g in hg[:6])) if hg else ''))
    warns.append('engine helpers used bare (shade/TAU instead of F.shade/F.TAU): %d of %d pieces'
                 % (len(bare), len(blocks)))
    warns.append('literal colours (0x...): %d of %d pieces, %d literals in all'
                 % (len(lit), len(blocks), sum(n for _, n in lit)))
    warns.append('literal colour arrays ([0x.., 0x..]): %d of %d pieces' % (len(arr), len(blocks)))
    return res, warns


ASSERT_JS = r"""(cfg)=>{
const out={per:[],warn:[]};
const V=new THREE.Vector3();
function measure(g,fams){
  g.updateMatrixWorld(true);
  let meshes=0,nan=0;const box=new THREE.Box3();
  g.traverse(o=>{
    const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(e[i])){nan++;break;}
    if(!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position)return;
    meshes++;
    if(o.material&&o.material.userData)fams.add(o.material.userData.family||'');
    const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){V.fromBufferAttribute(p,i);
      if(!isFinite(V.x)||!isFinite(V.y)||!isFinite(V.z)){nan++;continue;}
      V.applyMatrix4(o.matrixWorld);box.expandByPoint(V);}
  });
  return {meshes,nan,box};
}
const REG={furniture:FURN_BY_KEY,plant:PLANT_BY_KEY,building:ASSET_BY_KEY};
for(const g of INSTANCES.slice()){
  const u=g.userData,A=u.asset,v=u.opt.variant,d=entryDims(A,v);
  const r={kind:u.kind,key:u.key,variant:v,fail:[],warn:[]};
  if(u.error) r.fail.push('build threw: '+u.error);
  const fams=new Set();
  let {meshes,nan,box}=measure(g,fams);
  /* sweep more seeds: the declared box must hold for every instance, not one */
  for(let s=2;s<=cfg.seeds;s++){
    const g2=_buildInstance(u.kind,REG[u.kind],u.key,u.x,u.z,0,{variant:v,seed:s,y:u.opt.y});
    const m2=measure(g2,fams);
    if(g2.userData.error) r.fail.push('build threw (seed '+s+'): '+g2.userData.error);
    nan+=m2.nan; if(!m2.meshes) meshes=0; box.union(m2.box);
    scene.remove(g2); INSTANCES.splice(INSTANCES.indexOf(g2),1);
    g2.traverse(o=>{if(o.geometry)o.geometry.dispose();});
  }
  if(!meshes) r.fail.push('no meshes');
  if(nan) r.fail.push(nan+' NaN vertices/transforms');
  r.meshes=meshes;r.families=[...fams].sort();
  if(meshes&&!box.isEmpty()){
    const y0=u.opt.y||0;
    const m={x0:box.min.x-u.x,x1:box.max.x-u.x,y0:box.min.y-y0,y1:box.max.y-y0,z0:box.min.z-u.z,z1:box.max.z-u.z};
    r.box=[m.x0,m.x1,m.y0,m.y1,m.z0,m.z1].map(t=>Math.round(t*1000)/1000);
    r.decl=[d.w,d.d,d.h];
    const tol=s=>Math.max(cfg.tolM,cfg.tolF*s);
    const over=[];
    if(m.x1-d.w/2>tol(d.w))over.push('+x '+(m.x1-d.w/2).toFixed(2));
    if(-d.w/2-m.x0>tol(d.w))over.push('-x '+(-d.w/2-m.x0).toFixed(2));
    if(m.z1-d.d/2>tol(d.d))over.push('+z '+(m.z1-d.d/2).toFixed(2));
    if(-d.d/2-m.z0>tol(d.d))over.push('-z '+(-d.d/2-m.z0).toFixed(2));
    if(m.y1-d.h>tol(d.h))over.push('top '+(m.y1-d.h).toFixed(2));
    const tolBelow=u.kind==='plant'?Math.max(cfg.tolM,cfg.rootFrac*d.h):tol(d.h);
    if(-m.y0>tolBelow)over.push('below ground '+(-m.y0).toFixed(2));
    if(over.length)r.fail.push('outside declared '+d.w+'x'+d.d+'x'+d.h+' by '+over.join(', ')+
      ' (built '+(m.x1-m.x0).toFixed(2)+'x'+(m.z1-m.z0).toFixed(2)+'x'+(m.y1-m.y0).toFixed(2)+')');
    const under=[];
    if((m.x1-m.x0)<d.w*(1-cfg.under))under.push('w '+(m.x1-m.x0).toFixed(2)+'/'+d.w);
    if((m.z1-m.z0)<d.d*(1-cfg.under))under.push('d '+(m.z1-m.z0).toFixed(2)+'/'+d.d);
    if(m.y1<d.h*(1-cfg.under))under.push('h '+m.y1.toFixed(2)+'/'+d.h);
    if(under.length)r.warn.push('under-size '+under.join(', '));
  }
  /* tags */
  const isStr=s=>typeof s==='string'&&s.length>0;
  if(u.kind==='furniture'){
    if(FURN_CULTURES.indexOf(A.culture)<0)r.fail.push('bad culture '+A.culture);
    if(FURN_TYPES.indexOf(A.type)<0)r.fail.push('bad type '+A.type);
    if(FURN_SETTINGS.indexOf(A.setting)<0)r.fail.push('bad setting '+A.setting);
    if(FURN_ANCHORS.indexOf(A.anchor)<0)r.fail.push('bad anchor '+A.anchor);
    if(!Array.isArray(A.rooms)||!A.rooms.length||!A.rooms.every(isStr))r.fail.push('bad rooms');
    const c=A.clearance;
    if(!c||typeof c!=='object'||Array.isArray(c)||!Object.keys(c).every(k=>['front','back','left','right','top'].indexOf(k)>=0&&typeof c[k]==='number'&&c[k]>=0&&c[k]<20))
      r.fail.push('bad clearance '+JSON.stringify(c));
    if(!Array.isArray(A.materials)||!A.materials.length||!A.materials.every(k=>CATALOG_MATERIALS[k]))
      r.fail.push('bad materials '+JSON.stringify(A.materials));
    else{const miss=r.families.map(f=>FAMILY_TO_MATERIAL[f]||('?'+f)).filter(k=>A.materials.indexOf(k)<0);
      if(miss.length)r.fail.push('materials missing '+[...new Set(miss)].join(','));}
    if(A.variantNames&&A.variantNames.length!==A.variants)r.fail.push('variantNames length');
  }else if(u.kind==='plant'){
    if(PLANT_CLIMATES.indexOf(A.climate)<0)r.fail.push('bad climate '+A.climate);
    if(PLANT_ARIDITY.indexOf(A.aridity)<0)r.fail.push('bad aridity '+A.aridity);
  }else{
    if(ASSET_CULTURES.indexOf(A.culture)<0)r.fail.push('bad culture '+A.culture);
    if(!isStr(A.family)||A.family==='other')r.fail.push('no type (family)');
  }
  out.per.push(r);
}
out.counts={furniture:FURNS.length,plants:PLANTS.length,buildings:ASSETS.length,instances:INSTANCES.length};
return out;}"""


async def run(a):
    from playwright.async_api import async_playwright
    path = os.path.abspath(a.html)
    rel = os.path.relpath(path, HERE).replace(os.sep, '/')
    if a.out:
        os.makedirs(a.out, exist_ok=True)
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=HERE, **k)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(**_exe(), args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
            W, H = [int(t) for t in a.size.split('x')]
            pg = await b.new_page(viewport={'width': W, 'height': H})
            pg.set_default_timeout(600000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            three = os.path.join(HERE, 'three.min.js')
            await pg.route('**/three.min.js', lambda route: asyncio.ensure_future(
                route.fulfill(path=three, content_type='application/javascript')))
            q = '' if a.sheet == 'all' else '?sheet=' + a.sheet
            await pg.goto('http://127.0.0.1:%d/%s%s' % (port, rel, q), timeout=300000)
            try:
                await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0",
                                           timeout=580000)
            except Exception:
                print('timed out waiting for the sheet to build'); fails.append('build timeout')
            await pg.wait_for_timeout(1500)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            print('ERROR PANEL:', repr(panel[:1500]) if panel else 'clean')
            if panel:
                fails.append('error panel not clean')
            if errs:
                print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            info = await pg.evaluate("()=>({ready:!!window._ready,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,"
                                     "rows:(window._catalog||{rows:[]}).rows.length})")
            print('ready:', info['ready'], ' rows:', info['rows'], ' draw calls:', info['calls'], ' triangles:', info['tris'])

            if a.assert_:
                res = await pg.evaluate(ASSERT_JS, {'tolM': TOL_M, 'tolF': TOL_FRAC, 'under': UNDER_FRAC, 'rootFrac': ROOT_FRAC, 'seeds': a.seeds})
                c = res['counts']
                print('\n--- catalog: %d furniture, %d plants, %d buildings -> %d instances (every variant) ---'
                      % (c['furniture'], c['plants'], c['buildings'], c['instances']))
                per = res['per']
                checks = [('builds', lambda f: f.startswith('build threw') or f == 'no meshes'),
                          ('no-nan-geometry', lambda f: 'NaN' in f),
                          ('declared-size', lambda f: f.startswith('outside declared')),
                          ('tags', lambda f: not (f.startswith('build threw') or f == 'no meshes' or 'NaN' in f
                                                  or f.startswith('outside declared')))]
                print('\n--- invariants ---')
                for name, sel in checks:
                    bad, allowed = [], []
                    for r in per:
                        fs = [f for f in r['fail'] if sel(f)]
                        if fs:
                            (allowed if r['key'] in ALLOW else bad).append((r, fs))
                    ok = not bad
                    kinds = {}
                    for r in per:
                        kinds[r['kind']] = kinds.get(r['kind'], 0) + 1
                    detail = ('%d instances (%s)' % (len(per), ', '.join('%s %d' % kv for kv in sorted(kinds.items()))))
                    if allowed:
                        detail += '; %d deferred (KNOWN_ISSUES.md): %s' % (len(allowed), ', '.join(sorted({r['key'] for r, _ in allowed})))
                    print(('  PASS  ' if ok else '  FAIL  ') + name + ' : ' + (detail if ok else '%d failing' % len(bad)))
                    for r, fs in bad[:60]:
                        print('          %s #%d [%s]: %s' % (r['key'], r['variant'] + 1, r['kind'], '; '.join(fs)))
                    if not ok:
                        fails.append('assert ' + name)
                sres, swarn = static_checks()
                for r in sres:
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']:
                        fails.append('assert ' + r['name'])
                print('\n--- warnings (reported, not failed) ---')
                for w in swarn:
                    print('  WARN  ' + w)
                under = [r for r in per if r['warn']]
                print('  WARN  under-size (>%d%% smaller than declared on an axis): %d instances' % (UNDER_FRAC * 100, len(under)))
                for r in under[:40]:
                    print('          %s #%d: %s' % (r['key'], r['variant'] + 1, '; '.join(r['warn'])))
                if a.dump:
                    json.dump(res, open(a.dump, 'w'), indent=1)
                    print('dumped', a.dump)

            for ev in (a.eval or []):
                try:
                    print('eval:', json.dumps(await pg.evaluate(ev))[:3000])
                except Exception as e:
                    print('eval failed:', str(e)[:400])

            if a.out:
                fn = os.path.join(a.out, 'initial.png'); await pg.screenshot(path=fn); print('shot:', fn)
                secs = await pg.evaluate("()=>window._catalog.sections.map(s=>({kind:s.kind,z0:s.z0,z1:s.z1,w:Math.max(...s.rows.map(r=>r.width))}))")
                for s in secs:
                    await pg.evaluate("(s)=>{ctl.walk=false;ctl.target.set(s.w/2,0,(s.z0+s.z1)/2);"
                                      "ctl.dist=Math.max(s.w,s.z0-s.z1)*0.75;ctl.az=0.35;ctl.el=0.9;updateCamera();}", s)
                    await pg.wait_for_timeout(600)
                    fn = os.path.join(a.out, 'section_%s.png' % s['kind']); await pg.screenshot(path=fn); print('shot:', fn)
                if a.rows:
                    n = await pg.evaluate('()=>window._catalog.rows.length')
                    for i in range(n):
                        t = await pg.evaluate("(i)=>{window._catalog.gotoRow(i);return window._catalog.rows[i].title;}", i)
                        await pg.wait_for_timeout(600)
                        fn = os.path.join(a.out, 'row_%02d_%s.png' % (i, re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')))
                        await pg.screenshot(path=fn); print('shot:', fn)
            await b.close()
    finally:
        httpd.shutdown()
    if fails:
        print('\nFAILED: ' + '; '.join(fails))
        return 1
    print('\nOK')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--sheet', default='all', choices=['all', 'furniture', 'plants', 'buildings'])
    ap.add_argument('--out', default='')
    ap.add_argument('--rows', action='store_true', help='with --out: one screenshot per row')
    ap.add_argument('--dump', default='', help='with --assert: write the per-instance results as JSON')
    ap.add_argument('--seeds', type=int, default=4, help='with --assert: audit seeds 1..N of every instance (default 4)')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
