#!/usr/bin/env python3
"""Headless verification for the master catalog (dist/catalog.html).

Usage:
  python3 verify.py dist/catalog.html [--assert] [--seeds 4] [--sheet all|furniture|buildings]
                                      [--query cultures=xanadu,voth] [--out ./shots] [--rows [words]]
                                      [--dump r.json] [--eval "()=>..."] [--page indoor|outdoor|both|all]

What it does:
  1. Serves this folder over HTTP and routes three.min.js to the local r128 copy.
  2. Loads the sheet in headless Chromium with software WebGL (SwiftShader). The furniture sheet is
     split into pages by setting (indoor, outdoor, both); a full run loads each page in turn.
  3. Prints the error panel (#errs) and page errors; either fails the run.
  4. --assert, measured inside the page for EVERY instance (every entry, every variant):
       builds            no build exception, at least one mesh
       no-nan-geometry   no NaN vertex or transform
       declared-size     the built geometry, over seeds 1..--seeds (default 4), fits the
                         declared box centred on the instance origin: x in [-w/2, w/2],
                         y in [0, h], z in [-d/2, d/2], each side within
                         max(TOL_M, TOL_FRAC * dimension); plants may sink ROOT_FRAC * h
       anchor-geometry   wall: nothing behind z = -d/2 and geometry on that plane (or touching
                         it at the top: a leaning ladder); ceiling: reaches y = h; surface:
                         lowest point at y = 0 (ANCHOR_AUDIT)
       palette           every palette key a piece names is in its culture's FPAL
       tags              furniture: culture, type, setting, rooms, anchor, clearance,
                         materials (kits/furniture/SPEC.md "The entry"), and the
                         materials it declares cover every material family it builds with;
                         plants: climate + aridity; buildings: culture, family, and types
                         (non-empty, every one in BUILDING_TYPES)
     plus static checks on krator-master-furniture.js and every krator-master-furniture-<culture>.js:
       spec-source       no entry still declares the old `room:` key
       style-*           SPEC "No host globals", F.shade/F.TAU not bare shade/TAU, and
                         "Colour": no literal colour (0x...) or literal colour array in any
                         FURN block; style-colour-kit: none in the kit or a culture file outside
                         its /* PALETTE */ block either
     Under-size (built > 30% smaller than declared on an axis) is a WARN.
  5. --out: screenshots (initial view, one per section, and --rows one per row; --rows xanadu,court
     only the rows whose title has one of the words).

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
# anchor geometry audit. wall: nothing more than `behind` m behind z = -d/2, and the vertices
# within max(band, bandFrac*d) of the back plane span at least backW of w and backH of h.
# ceiling: reaches within `top` m of y = h, and the top band spans at least topSpan m.
# surface: the lowest point within `base` m of y = 0 (it stands on the top, not above or in it).
ANCHOR_AUDIT = {'behind': 0.02, 'band': 0.06, 'bandFrac': 0.08, 'backW': 0.3, 'backH': 0.25,
                'top': 0.03, 'topSpan': 0.05, 'base': 0.02}

HOST_GLOBALS = re.compile(r'\b(kput|BOX|FAMMAT|MAT|PAL|scene|THREE|mk[A-Z]\w*|_target|treeHelper)\b')
BARE_HELPERS = re.compile(r'(?<![\w.$])(shade|TAU)\b')
HEX = re.compile(r'0x[0-9a-fA-F]{3,6}\b')
HEX_ARRAY = re.compile(r'\[\s*0x[0-9a-fA-F]{3,6}\s*,\s*0x[0-9a-fA-F]{3,6}')


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


def furn_files():
    """krator-master-furniture.js and every per-culture file (krator-master-furniture-<culture>.js)"""
    return ['krator-master-furniture.js'] + sorted(f for f in os.listdir(HERE)
                                                 if f.startswith('krator-master-furniture-') and f.endswith('.js'))


PALETTE_BLOCK = re.compile(r'/\* PALETTE \*/.*?/\* END PALETTE \*/', re.S)


def furn_blocks():
    """every literal FURN({...}) block in every furniture file, as (key, head, body). A culture file's
    palette (between the PALETTE markers) is the one place literal colours belong and is cut out
    first; FK.set() pieces are built from style sheets of palette keys and are checked in the page."""
    out = []
    for f in furn_files():
        src = PALETTE_BLOCK.sub('', open(os.path.join(HERE, f), encoding='utf-8').read())
        starts = [m.start() for m in re.finditer(r'^FURN\(\{', src, re.M)] + [len(src)]
        for a, b in zip(starts, starts[1:]):
            blk = src[a:b]
            key = re.search(r"key\s*:\s*'([^']+)'", blk).group(1)
            i = blk.find('build')
            out.append((key, blk[:i], blk[i:]))
    return out


def kit_checks():
    """the furniture kit and the style sheets outside FURN blocks: no literal colour anywhere but a palette"""
    res = []
    bad = []
    for f in ['krator-furniture-kit.js'] + furn_files():
        src = PALETTE_BLOCK.sub('', open(os.path.join(HERE, f), encoding='utf-8').read())
        n = len(HEX.findall(src))
        if n:
            bad.append('%s: %d' % (f, n))
    res.append({'name': 'style-colour-kit', 'ok': not bad,
                'detail': ('literal colours outside a PALETTE block: ' + ', '.join(bad)) if bad
                else 'kit and %d furniture files: 0 literal colours outside the PALETTE blocks' % len(furn_files())})
    return res


PAL_KEY_CALLS = re.compile(r"F\.(?:col|shade)\(\s*'([^']+)'")
PAL_KEY_LISTS = re.compile(r"F\.(?:cols|pick)\(\s*\[([^\]]*)\]")


def palette_keys(body):
    """the palette keys a piece names: F.col('k'), F.shade('k', ..), F.cols([..]), F.pick(['k', ..])"""
    keys = set(PAL_KEY_CALLS.findall(body))
    for lst in PAL_KEY_LISTS.findall(body):
        keys.update(re.findall(r"'([^']+)'", lst))
    return sorted(keys)


def static_checks():
    """SPEC source conformance and the style rules ("No host globals", "Colour", F.* helpers),
    from the source text. All are assertions now; the palette keys a piece names are
    returned for the in-page check that its culture's FPAL defines them."""
    res = []
    blocks = furn_blocks()
    old_room = [k for k, head, _ in blocks if re.search(r'(?<![\w])room\s*:', head)]
    res.append({'name': 'spec-source', 'ok': not old_room,
                'detail': ('%d entries still declare room: %s' % (len(old_room), ', '.join(old_room[:8])))
                if old_room else '%d FURN entries, none uses the old room: key' % len(blocks)})
    hg = [(k, sorted(set(HOST_GLOBALS.findall(body)))) for k, _, body in blocks]
    hg = [(k, g) for k, g in hg if g]
    res.append({'name': 'style-host-globals', 'ok': not hg,
                'detail': ('%d of %d pieces use kput/BOX/FAMMAT/MAT/PAL/scene/THREE/mk*: %s'
                           % (len(hg), len(blocks), '; '.join('%s: %s' % (k, ','.join(g)) for k, g in hg[:8])))
                if hg else '%d pieces build only through F.*' % len(blocks)})
    bare = [k for k, _, body in blocks if BARE_HELPERS.search(body)]
    res.append({'name': 'style-helpers', 'ok': not bare,
                'detail': ('%d of %d pieces call shade/TAU bare: %s' % (len(bare), len(blocks), ', '.join(bare[:10])))
                if bare else '%d pieces use F.shade / F.TAU, none the bare engine globals' % len(blocks)})
    lit = [(k, len(HEX.findall(body))) for k, _, body in blocks]
    lit = [(k, n) for k, n in lit if n]
    arr = [k for k, _, body in blocks if HEX_ARRAY.search(body)]
    res.append({'name': 'style-colour', 'ok': not lit and not arr,
                'detail': ('%d of %d pieces carry %d literal colours (%d build literal arrays): %s'
                           % (len(lit), len(blocks), sum(n for _, n in lit), len(arr), ', '.join(k for k, _ in lit[:10])))
                if lit or arr else '%d pieces, 0 literal colours: every colour is a palette key (FPAL)' % len(blocks)})
    res += kit_checks()
    keys = {k: palette_keys(body) for k, _, body in blocks}
    return res, keys


ASSERT_JS = r"""(cfg)=>{
const out={per:[],warn:[]};
const V=new THREE.Vector3();
/* pr (optional): the anchor probe. Vertices in the instance's local frame (built at ry = 0)
   feed: the back band (z within band of -d/2) and anything behind the back plane, for wall
   pieces; the top band (y within band of h), for ceiling pieces. */
function measure(g,fams,pr){
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
      V.applyMatrix4(o.matrixWorld);box.expandByPoint(V);
      if(pr){const lx=V.x-pr.ox,ly=V.y-pr.oy,lz=V.z-pr.oz;
        if(lz<-pr.d/2)pr.behind=Math.max(pr.behind,-pr.d/2-lz);
        if(lz<=-pr.d/2+pr.band){pr.bx0=Math.min(pr.bx0,lx);pr.bx1=Math.max(pr.bx1,lx);pr.by0=Math.min(pr.by0,ly);pr.by1=Math.max(pr.by1,ly);}
        if(ly>=pr.h-pr.tband){pr.tx0=Math.min(pr.tx0,lx);pr.tx1=Math.max(pr.tx1,lx);pr.tz0=Math.min(pr.tz0,lz);pr.tz1=Math.max(pr.tz1,lz);}}}
  });
  return {meshes,nan,box};
}
const REG={furniture:FURN_BY_KEY,plant:PLANT_BY_KEY,building:ASSET_BY_KEY};
for(const g of INSTANCES.slice()){
  const u=g.userData,A=u.asset,v=u.opt.variant,d=entryDims(A,v);
  const r={kind:u.kind,key:u.key,variant:v,fail:[],warn:[]};
  if(u.error) r.fail.push('build threw: '+u.error);
  const fams=new Set();
  const AC=cfg.anchor;
  const pr=u.kind==='furniture'?{ox:u.x,oy:u.opt.y||0,oz:u.z,d:d.d,h:d.h,band:Math.max(AC.band,AC.bandFrac*d.d),
    tband:Math.max(AC.band,AC.bandFrac*d.h),behind:0,bx0:1e9,bx1:-1e9,by0:1e9,by1:-1e9,tx0:1e9,tx1:-1e9,tz0:1e9,tz1:-1e9}:null;
  let {meshes,nan,box}=measure(g,fams,pr);
  /* sweep more seeds: the declared box must hold for every instance, not one */
  for(let s=2;s<=cfg.seeds;s++){
    const g2=_buildInstance(u.kind,REG[u.kind],u.key,u.x,u.z,0,{variant:v,seed:s,y:u.opt.y});
    const m2=measure(g2,fams,pr);
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
    /* anchor geometry (kits/furniture/SPEC.md "anchor"): what the anchor promises, the geometry must do */
    if(pr){
      const sp=(a,b)=>b>=a?b-a:0, f2=t=>t.toFixed(2);
      if(A.anchor==='wall'){
        if(pr.behind>AC.behind)r.fail.push('anchor: wall piece reaches '+f2(pr.behind)+' m behind its back plane z = -d/2');
        const sx=sp(pr.bx0,pr.bx1),sy=sp(pr.by0,pr.by1);
        const leans=pr.by1>=d.h-pr.tband;   /* a ladder: touches the wall only at its top, and leans on it */
        if(sx<AC.backW*d.w||(sy<AC.backH*d.h&&!leans))r.fail.push('anchor: wall piece has too little at its back plane (within '+f2(pr.band)+
          ' m of z = -d/2: '+f2(sx)+' m of w '+d.w+', '+f2(sy)+' m of h '+d.h+')');
        r.back=[sx,sy].map(t=>Math.round(t*100)/100);
      }else if(A.anchor==='ceiling'){
        if(m.y1<d.h-AC.top)r.fail.push('anchor: ceiling piece stops '+f2(d.h-m.y1)+' m short of its top y = h');
        const sx=sp(pr.tx0,pr.tx1),sz=sp(pr.tz0,pr.tz1);
        if(Math.max(sx,sz)<AC.topSpan)r.fail.push('anchor: ceiling piece has almost nothing at its top ('+f2(sx)+' x '+f2(sz)+' m)');
      }else if(A.anchor==='surface'){
        if(m.y0>AC.base)r.fail.push('anchor: surface piece floats '+f2(m.y0)+' m above the top it stands on');
        if(m.y0<-AC.base)r.fail.push('anchor: surface piece sinks '+f2(-m.y0)+' m into the top it stands on');
      }
    }
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
    /* every palette key the piece names exists in its culture's palette */
    const pal=FPAL[A.culture]||{}, miss=(cfg.palKeys[u.key]||[]).filter(k=>pal[k]==null);
    if(!FPAL[A.culture])r.fail.push('palette: no FPAL for culture '+A.culture);
    else if(miss.length)r.fail.push('palette: keys not in FPAL["'+A.culture+'"]: '+miss.join(', '));
  }else if(u.kind==='plant'){
    if(PLANT_CLIMATES.indexOf(A.climate)<0)r.fail.push('bad climate '+A.climate);
    if(PLANT_ARIDITY.indexOf(A.aridity)<0)r.fail.push('bad aridity '+A.aridity);
  }else{
    if(ASSET_CULTURES.indexOf(A.culture)<0)r.fail.push('bad culture '+A.culture);
    if(!isStr(A.family)||A.family==='other')r.fail.push('no family');
    if(!Array.isArray(A.types)||!A.types.length)r.fail.push('no types');
    else{const bad=A.types.filter(t=>BUILDING_TYPES.indexOf(t)<0);if(bad.length)r.fail.push('types not in BUILDING_TYPES: '+bad.join(', '));}
  }
  out.per.push(r);
}
out.counts={furniture:FURNS.length,plants:PLANTS.length,buildings:ASSETS.length,instances:INSTANCES.length};
return out;}"""


async def run_one(a, page, first):
    """one load of the sheet (one furniture page); returns the failures"""
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
            q = ('' if a.sheet in ('all', 'furniture') else 'sheet=' + a.sheet) + (('&' if a.sheet not in ('all', 'furniture') else '') + a.query if a.query else '')
            if page:
                q = (q + '&' if q else '') + 'page=' + page
            q = '?' + q if q else ''
            if page:
                print('\n========== page: %s ==========' % page)
            await pg.goto('http://127.0.0.1:%d/%s%s' % (port, rel, q), timeout=900000)   # the sheet builds during load
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
                sres, palkeys = static_checks()
                if not first:
                    sres = []                                   # the static checks read the source files: once per run
                res = await pg.evaluate(ASSERT_JS, {'tolM': TOL_M, 'tolF': TOL_FRAC, 'under': UNDER_FRAC, 'rootFrac': ROOT_FRAC,
                                                    'seeds': a.seeds, 'palKeys': palkeys, 'anchor': ANCHOR_AUDIT})
                c = res['counts']
                print('\n--- catalog: %d furniture, %d plants, %d buildings -> %d instances (every variant) ---'
                      % (c['furniture'], c['plants'], c['buildings'], c['instances']))
                per = res['per']
                other = ('build threw', 'no meshes', 'outside declared', 'anchor:', 'palette:')
                checks = [('builds', lambda f: f.startswith('build threw') or f == 'no meshes'),
                          ('no-nan-geometry', lambda f: 'NaN' in f),
                          ('declared-size', lambda f: f.startswith('outside declared')),
                          ('anchor-geometry', lambda f: f.startswith('anchor:')),
                          ('palette', lambda f: f.startswith('palette:')),
                          ('tags', lambda f: not (f.startswith(other) or 'NaN' in f))]
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
                for r in sres:
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']:
                        fails.append('assert ' + r['name'])
                print('\n--- warnings (reported, not failed) ---')
                under = [r for r in per if r['warn']]
                print('  WARN  under-size (>%d%% smaller than declared on an axis): %d instances' % (UNDER_FRAC * 100, len(under)))
                for r in under[:40]:
                    print('          %s #%d: %s' % (r['key'], r['variant'] + 1, '; '.join(r['warn'])))
                if a.dump:
                    json.dump(res, open(a.dump, 'w'), indent=1)
                    print('dumped', a.dump)
                    a.dump = ''                                 # the first page's (use --page for another)

            for ev in (a.eval or []):
                try:
                    print('eval:', json.dumps(await pg.evaluate(ev))[:3000])
                except Exception as e:
                    print('eval failed:', str(e)[:400])

            if a.out:
                pre = page + '_' if page else ''
                fn = os.path.join(a.out, pre + 'initial.png'); await pg.screenshot(path=fn); print('shot:', fn)
                secs = await pg.evaluate("()=>window._catalog.sections.map(s=>({kind:s.kind,z0:s.z0,z1:s.z1,w:Math.max(...s.rows.map(r=>r.width))}))")
                for s in secs:
                    await pg.evaluate("(s)=>{ctl.walk=false;ctl.target.set(s.w/2,0,(s.z0+s.z1)/2);"
                                      "ctl.dist=Math.max(s.w,s.z0-s.z1)*0.75;ctl.az=0.35;ctl.el=0.9;updateCamera();}", s)
                    await pg.wait_for_timeout(600)
                    fn = os.path.join(a.out, pre + 'section_%s.png' % s['kind']); await pg.screenshot(path=fn); print('shot:', fn)
                if a.rows:
                    titles = await pg.evaluate('()=>window._catalog.rows.map(r=>r.title)')
                    want = [w.strip().lower() for w in a.rows.split(',') if w.strip()] if a.rows != 'all' else []
                    for i, title in enumerate(titles):
                        if want and not any(w in title.lower() for w in want):
                            continue
                        t = await pg.evaluate("(i)=>{window._catalog.gotoRow(i);return window._catalog.rows[i].title;}", i)
                        await pg.wait_for_timeout(600)
                        fn = os.path.join(a.out, pre + 'row_%02d_%s.png' % (i, re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')))
                        await pg.screenshot(path=fn); print('shot:', fn)
            await b.close()
    finally:
        httpd.shutdown()
    return [(page + ': ' if page else '') + f for f in fails]


FURN_PAGES = ['indoor', 'outdoor', 'both']


async def run(a):
    """The furniture sheet is split into pages by setting (indoor, outdoor, both): all ~2200 instances on
    one page do not build in reasonable time. A full run loads each page in turn; --query (a partial run)
    loads one page with all of its pieces unless --page names one."""
    if a.page:
        pages = [] if a.page == 'all' and a.sheet not in ('all', 'furniture') else [a.page]
    elif a.sheet in ('all', 'furniture') and not a.query:
        pages = FURN_PAGES
    else:
        pages = ['all'] if a.sheet in ('all', 'furniture') else ['']
    fails = []
    for i, page in enumerate(pages or ['']):
        fails += await run_one(a, page, i == 0)
    if fails:
        print('\nFAILED: ' + '; '.join(fails))
        return 1
    print('\nOK')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--sheet', default='furniture', choices=['all', 'furniture', 'plants', 'buildings'], help='the catalog registers furniture only; plants and buildings are for a page that loads them')
    ap.add_argument('--out', default='')
    ap.add_argument('--rows', nargs='?', const='all', default='',
                    help="with --out: one screenshot per row; or a comma list of row-title words (--rows xanadu,court) for a few rows")
    ap.add_argument('--dump', default='', help='with --assert: write the per-instance results as JSON')
    ap.add_argument('--seeds', type=int, default=4, help='with --assert: audit seeds 1..N of every instance (default 4)')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--query', default='', help="extra page query, e.g. cultures=xanadu,voth (only those cultures' furniture: a quick partial run)")
    ap.add_argument('--page', default='', choices=['', 'indoor', 'outdoor', 'both', 'all'],
                    help='furniture page by setting (default: every page in turn; with --query: all of it on one page)')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
