# The garment audit: every outfit, drawn in flat colours by what each pixel is, and the pixels counted, so a gap or a
# layer through a layer is a number rather than a judgement on a shot (HANDOFF-GARMENT-DEFECTS.md).
#   python3 tools/garment_audit.py <outdir> [--page dist/cosmetic-lab.html] [--clips idle:2,walk:0.3,...] [--bodies a,b]
#       [--match substring] [--morph '{"height":1}'] [--shards n] [--shard i] [--pre 'javascript']
#   python3 tools/garment_audit.py --report <outdir>
#   python3 tools/garment_audit.py --baseline <outdir>      write tests/garment-audit.json from a whole sweep
#   python3 tools/garment_audit.py --check <outdir>         fail if a sweep is worse than it (HANDOFF-GARMENT-DEFECTS.md)
# AUDIT_GL=d3d11 renders on the GPU (seconds a shot, on swiftshader the default about 17); shots are the same every run.
# Skin is red (the head, hands and feet by rest position are not: they are bare by design), the rest of the body grey, a legs item green, a torso item blue, feet yellow, a head item cyan: each
# cloth's front at full strength, its inside at half. The background is magenta. Then, in each shot, a small patch of one
# class closed in by another is a fault:
#   skin     skin through cloth (the owner's knees; a patch the cut leaves open on purpose shows at the A-pose too)
#   hole     the background through the figure (a tear)
#   under    a lower layer through a higher (legs through a top; a top's patch inside trousers is its hem, not counted)
#   inside   a cloth's inside closed in by a front: cloth folded through itself or another
# Outfits come from data/peoples.json. shot records go to <outdir>/audit-<shard>.jsonl, one per shot, with the patches.
import asyncio, functools, http.server, json, os, socketserver, sys, threading
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import verify

CLASSES = {'bg': (255, 0, 255), 'skin': (255, 0, 0), 'body': (128, 128, 128), 'legs': (0, 255, 0), 'legsb': (0, 120, 0),
           'torso': (0, 0, 255), 'torsob': (0, 0, 120), 'feet': (255, 255, 0), 'feetb': (120, 120, 0),
           'head': (0, 255, 255), 'headb': (0, 120, 120), 'hair': (255, 255, 255)}
NAMES = list(CLASSES)
RGB = np.array([CLASSES[n] for n in NAMES], dtype=np.int16)
FRONT = ('legs', 'torso', 'feet', 'head')
CLOTH = FRONT + ('legsb', 'torsob', 'feetb', 'headb')
MIN_PX, MAX_PX, HOLE_PX, CLOSED = 8, 2500, 150, 0.8    # a patch's size in pixels (a pixel is about 2.5 mm), and the share of its rim
RANK = {'legs': 0, 'feet': 0, 'torso': 1, 'head': 2}
VIEWS = {'front': 0.0, 'left': 1.57, 'back': 3.14, 'right': -1.57}
CLIPS = 'none:0,idle:2,walk:0.3,walk:0.6,run:0.25,run:0.4,ual_crouch:1'

# the figure's materials recoloured. onBeforeCompile runs for each material, so one program serves every colour
FLAT = '''() => { var K = window._kchar, f = K.fig, C = window._auditC || (window._auditC = {});
  var scene = f.group.parent; scene.background = new THREE.Color(1, 0, 1);
  scene.children.forEach(function(o){ if(o !== f.group && (o.isMesh)) o.visible = false; if(o.isLight) o.castShadow = false; });
  var kit = KCHAR_DATA.bodies[f.bodyId || window._auditBody].kit;
  var byKey = {}; (kit.items || []).forEach(function(it){ byKey[it.glb ? it.glb.replace(/\\.glb$/, '').replace(/^pieces\\//, '') : it.id] = it; });
  var COL = { base:[.502, .502, .502], skin:[1, 0, 0], legs:[0, 1, 0], torso:[0, 0, 1], feet:[1, 1, 0], head:[0, 1, 1], other:[1, 1, 1] };
  Object.values(f.live).forEach(function(m){
    m.children.forEach(function(c){ if(c.userData.fur) c.visible = false; });
    var p = m.userData.part, role = p.role, slot = p.slot;
    var c = role === 'base' ? (m.userData.srcMaterial === kit.base_material ? COL.skin : COL.base) : role === 'armour' ? COL[slot] || COL.other : role === 'mod' ? COL.skin : COL.other;
    var mat = m.material;
    if(mat.userData.auditF){ mat.userData.auditF.value.set(c[0], c[1], c[2]); return; }
    var prev = mat.hasOwnProperty('onBeforeCompile') ? mat.onBeforeCompile : null, key = prev && mat.customProgramCacheKey ? mat.customProgramCacheKey() : String(prev);
    var U = mat.userData.auditF = { value:new THREE.Vector3(c[0], c[1], c[2]) }, S = { value:f.pose.stature || 1.8 };
    // skin is judged where cloth is meant to lie: the head, the hands and the feet (by rest position) count as bare
    mat.onBeforeCompile = function(sh, r){ if(prev) prev(sh, r); sh.uniforms.kAud = U; sh.uniforms.kAudS = S;
      sh.vertexShader = 'varying vec3 kAudP;\\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\\n\\tkAudP = position;');
      sh.fragmentShader = 'uniform vec3 kAud;\\nuniform float kAudS;\\nvarying vec3 kAudP;\\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        '#include <dithering_fragment>\\n\\tbool kSkin = kAud.x > 0.9 && kAud.y < 0.1;\\n\\tvec3 kRel = kAudP / kAudS;\\n' +
        '\\tif(kSkin && (kRel.y > 0.82 || abs(kRel.x) > 0.36 || kRel.y < 0.07 || (abs(kRel.x) > 0.125 && kRel.y > 0.5))) gl_FragColor = vec4(0.502, 0.502, 0.502, 1.0);\\n' +
        // skin keeps where on the body it is, in green (height) and blue (the way round): what the A-pose shows bare is the cut
        '\\telse if(kSkin) gl_FragColor = vec4(1.0, floor(kRel.y * 32.0) * 0.012, floor((atan(kRel.x, kRel.z) + 3.1416) / 6.2832 * 15.99) * 0.024, 1.0);\\n' +
        '\\telse gl_FragColor = vec4(gl_FrontFacing ? kAud : kAud * 0.47, 1.0);'); };
    mat.customProgramCacheKey = function(){ return 'kaudit|' + key; };
    mat.needsUpdate = true;
  }); }'''

STEP = '''async (s)=>{ var K = window._kchar, f = K.fig;
  var btn = document.getElementById('clip-' + (s.clip || 'idle'));
  await f.play(null); if(s.clip !== 'none') await f.play(btn ? btn.dataset.clip || null : s.clip);
  f.cloth = s.cloth !== false; if(s.pre) eval(s.pre);
  // the cloth from its rigid rest with the clock at zero (fig.clothReset): the chains' state from the outfit before, and
  // a breeze on the page's clock, gave one build 0, 774 and 5473 px of a shin through a skirt in three sweeps
  if(f.clothReset) f.clothReset();
  Object.values(f.clothState().items).forEach(function(it){ it.reset = true; });
  var t = s.t == null ? 2 : s.t;
  // the clip wrapped back 2 s from t, so the 2 s of cloth end on t: from 0 they ended wherever 2 s fell in the loop, the
  // skeleton then jumped to t and the cloth stayed, so every shot held cloth from another moment of the stride
  // (a kicked-up sole through a robe's back that no one could see in the page)
  var d = f.action ? f.action.getClip().duration : 0, once = f.action && f.action.loop === THREE.LoopOnce;
  if(f.action){ f.action.paused = false; f.action.time = once ? Math.max(0, t - 2) : (((t - 2) % d) + d) % d; }
  for(var i = 0; i < 60; i++) f.update(1 / 30);
  if(f.action){ f.action.paused = true; f.action.time = once ? t : t % d; f.update(0); }
  // the cloth's state as a number (the chains' points summed, 1e-6), so two sweeps can be told apart in the records
  var sum = 0, n = 0; Object.values(f.clothState().items).forEach(function(c){ if(!c.on) return; c.chains.forEach(function(ch){ ch.x.forEach(function(x){ sum += x.x + x.y + x.z; n++; }); }); });
  return { cloth: Math.round(sum * 1e6) / 1e6, points: n }; }'''

VIEW = '''async ([yaw, at, dist]) => { var c = window._kchar.cam; c.yaw = yaw; c.spin = false; c.at = at; c.want.dist = c.dist = dist; c.want.pitch = c.pitch = 0.05;
  await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); }'''


def classify(img):
    """the class index of each pixel, -1 where a pixel is a blend at an edge"""
    a = np.asarray(img.convert('RGB'), dtype=np.int16)
    d = np.abs(a[:, :, None, :] - RGB[None, None, :, :]).sum(3)
    lab = d.argmin(2).astype(np.int8)
    lab[d.min(2) > 45] = -1
    skin = (a[:, :, 0] > 200) & (a[:, :, 1] < 110) & (a[:, :, 2] < 110)
    lab[skin] = NAMES.index('skin')
    key = np.round(a[:, :, 1] / (255 * 0.012)).astype(np.int32) * 32 + np.round(a[:, :, 2] / (255 * 0.024)).astype(np.int32)
    key[~skin] = -1
    return lab, key


def bare_keys(lab, key):
    """the bins of the body this shot shows as skin, with their neighbours"""
    inner = ndimage.binary_erosion(lab == NAMES.index('skin'))
    out = set()
    for k in np.unique(key[inner]):
        y, a = int(k) // 32, int(k) % 32
        out |= {(y + dy) * 32 + (a + da) % 16 for dy in (-1, 0, 1) for da in (-1, 0, 1)}
    return out


def patches(lab, key=None, bare=()):
    """the faults in a shot: [{kind, cls, px, x, y, rim}]"""
    out = []
    if key is not None and bare:       # skin the A-pose shows bare is the cut, not a fault
        lab = lab.copy()
        lab[np.isin(key, list(bare))] = NAMES.index('body')
    ids = {n: i for i, n in enumerate(NAMES)}
    cloth = np.isin(lab, [ids[n] for n in CLOTH])

    def scan(cls, kind, closers):
        mask = lab == ids[cls]
        if not mask.any():
            return
        comp, n = ndimage.label(mask, structure=np.ones((3, 3)))
        for k, sl in enumerate(ndimage.find_objects(comp), 1):
            y0, x0 = max(sl[0].start - 3, 0), max(sl[1].start - 3, 0)
            sub = comp[y0:sl[0].stop + 3, x0:sl[1].stop + 3] == k
            px = int(sub.sum())
            if px < MIN_PX or px > (HOLE_PX if kind == 'hole' else MAX_PX):
                continue
            ring = ndimage.binary_dilation(sub, iterations=2) & ~sub
            near = lab[y0:sl[0].stop + 3, x0:sl[1].stop + 3][ring]
            near = near[near >= 0]
            if near.size == 0:
                continue
            rim = float(np.isin(near, closers).mean())
            if rim >= CLOSED:
                ys, xs = np.nonzero(sub)
                out.append({'kind': kind, 'cls': cls, 'px': px, 'x': int(xs.mean()) + x0, 'y': int(ys.mean()) + y0, 'rim': round(rim, 2)})

    fronts = [ids[n] for n in FRONT]
    scan('skin', 'skin', [ids[n] for n in CLOTH])
    scan('bg', 'hole', [ids[n] for n in CLOTH] + [ids['skin']])
    for low, high in (('legs', ['torso', 'torsob']), ('feet', ['torso', 'torsob', 'legs', 'legsb']), ('torso', ['head', 'headb'])):
        scan(low, 'under', [ids[h] for h in high])
    for b in ('legsb', 'torsob', 'headb'):
        scan(b, 'inside', fronts)
    return out


def outfits(bodies, match):
    pe = json.load(open(os.path.join(HERE, 'data', 'peoples.json'), encoding='utf-8'))['peoples']
    sex = {'mpfb_male': 'male', 'mpfb_female': 'female', 'mpfb_giant': 'giant'}
    out = []
    for p in pe:
        for b in bodies:
            for tier, o in ((p.get('outfits') or {}).get(sex[b], {})).items():
                name = '%s-%s-%s' % (b.split('_')[1][0], p['id'], tier)
                if not match or match in name or match in ' '.join(str(v) for v in o.values()):
                    out.append({'name': name, 'body': b, 'armour': o})
    return sorted(out, key=lambda o: (o['body'], o['name']))


async def main(outdir, page, clips, bodies, match, morph, shards, shard, pre, extra):
    from playwright.async_api import async_playwright
    os.makedirs(os.path.join(outdir, 'img'), exist_ok=True)
    todo = extra or outfits(bodies, match)
    todo = todo[shard::shards]
    done = {}
    for f in os.listdir(outdir):
        if f.startswith('audit-') and f.endswith('.jsonl'):
            for x in open(os.path.join(outdir, f), encoding='utf-8'):
                n = json.loads(x)['outfit']
                done[n] = done.get(n, 0) + 1
    todo = [o for o in todo if done.get(o['name'], 0) < len(clips) * len(VIEWS)]
    print(len(todo), 'outfits to do', flush=True)
    log = open(os.path.join(outdir, 'audit-%d.jsonl' % shard), 'a', encoding='utf-8', newline='\n')
    async with async_playwright() as p:
        gl = os.environ.get('AUDIT_GL', 'swiftshader')     # d3d11 on a machine with a GPU
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=' + gl, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu'])
        pg = await b.new_page(viewport={'width': 1300, 'height': 1000})
        pg.on('pageerror', lambda e: print('page error', e, flush=True))
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=verify.THREE, content_type='text/javascript'))
        await pg.route('**/GLTFLoader.js', lambda r: r.fulfill(path=verify.LOADER, content_type='text/javascript'))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())

        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass
        root = os.path.dirname(os.path.abspath(page))
        srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        await pg.goto('http://127.0.0.1:%d/%s' % (srv.server_address[1], os.path.basename(page)))
        await pg.wait_for_function('window._kchar', timeout=180000)
        await pg.evaluate('window._kchar.ready')
        body = 'mpfb_male'
        await pg.evaluate('window._auditBody = "mpfb_male"')
        await pg.add_style_tag(content='body *{visibility:hidden !important} canvas{visibility:visible !important}')
        for o in todo:
            if o['body'] != body:
                body = o['body']
                await pg.evaluate('(b)=>{ window._auditBody = b; return Promise.resolve(window._kchar.body(b)); }', body)
                await pg.wait_for_timeout(500)
                await pg.wait_for_function('window._kchar && window._kchar.fig', timeout=180000)
                await pg.evaluate('window._kchar.ready')
            await pg.evaluate('window._kchar.still = true')
            await pg.evaluate('''([arm, mo])=>{ var r = JSON.parse(JSON.stringify(window._kchar.record())); r.armour = arm; r.hair = null; r.beard = null; if(mo) r.morph = mo; return window._kchar.set(r); }''',
                              [o['armour'], morph])
            await pg.evaluate(FLAT)
            big = 1.6 if body == 'mpfb_giant' else 1.0
            bare = set()
            for clip, t in clips:
                cloth = await pg.evaluate(STEP, {'clip': clip, 't': t, 'pre': pre})
                low = clip in ('ual_crouch', 'crouch_walk', 'dodge_roll', 'ual_roll')
                at, dist = [0, (0.62 if low else 0.92) * big, 0], (3.3 if not low else 3.0) * big
                for v, yaw in VIEWS.items():
                    await pg.evaluate(VIEW, [yaw, at, dist])
                    name = '%s--%s-%s--%s' % (o['name'], clip, t, v)
                    path = os.path.join(outdir, 'img', name + '.png')
                    el = await pg.query_selector('canvas')
                    await el.screenshot(path=path)
                    lab, key = classify(Image.open(path))
                    if clip == 'none':
                        bare |= bare_keys(lab, key)
                    ps = patches(lab, key, bare)
                    if not ps:
                        os.remove(path)
                    log.write(json.dumps({'outfit': o['name'], 'clip': clip, 't': t, 'view': v, 'armour': o['armour'], 'patches': ps,
                                          'px': int((lab != NAMES.index('bg')).sum()), 'cloth': cloth}) + '\n')
                log.flush()
            print(o['name'], flush=True)
        await b.close()
        srv.shutdown()


def report(outdir, top):
    import glob
    rows = []
    for f in glob.glob(os.path.join(outdir, 'audit-*.jsonl')):
        rows += [json.loads(x) for x in open(f, encoding='utf-8')]
    print(len(rows), 'shots', len({r['outfit'] for r in rows}), 'outfits')
    kinds = {}
    for r in rows:
        for p in r['patches']:
            k = kinds.setdefault(p['kind'], [0, 0, set()])
            k[0] += 1
            k[1] += p['px']
            k[2].add(r['outfit'])
    for k, v in sorted(kinds.items()):
        print('%-7s %5d patches %7d px  in %d outfits' % (k, v[0], v[1], len(v[2])))
    # by outfit and kind, the clips that show it: at the A-pose ('none') a fault is the cut, in motion the motion's
    by = {}
    for r in rows:
        for p in r['patches']:
            e = by.setdefault((r['outfit'], p['kind']), {'px': 0, 'rest': 0, 'clips': {}})
            e['px'] += p['px']
            if r['clip'] in ('none', 'idle'):
                e['rest'] += p['px']
            c = '%s:%s' % (r['clip'], r['t'])
            e['clips'][c] = e['clips'].get(c, 0) + p['px']
    print('\nworst outfit, kind (px in all, at rest), clips')
    for (o, k), e in sorted(by.items(), key=lambda x: -x[1]['px'])[:top]:
        cl = sorted(e['clips'].items(), key=lambda x: -x[1])[:4]
        print('%-34s %-7s %6d %6d  %s' % (o, k, e['px'], e['rest'], ' '.join('%s=%d' % c for c in cl)))


BASELINE = os.path.join(HERE, 'tests', 'garment-audit.json')


def totals(outdir):
    """{outfit: {'skin rest': px, 'under walk': px...}}: skin and legs through tops, by rest, stand and motion"""
    import glob
    seen, out = {}, {}
    for f in glob.glob(os.path.join(outdir, 'audit-*.jsonl')):
        for x in open(f, encoding='utf-8'):
            r = json.loads(x)
            seen[(r['outfit'], r['clip'], r['t'], r['view'])] = r
    for r in seen.values():
        e = out.setdefault(r['outfit'], {})
        ph = 'rest' if r['clip'] == 'none' else 'idle' if r['clip'] == 'idle' else 'motion'
        for p in r['patches']:
            if p['kind'] == 'skin' or (p['kind'] == 'under' and p['cls'] == 'legs'):
                k = p['kind'] + ' ' + ph
                e[k] = e.get(k, 0) + p['px']
    return out


def check(outdir):
    """a sweep against the baseline: the sum of each kind and phase, and any one outfit, within 10 % (and 400 px)"""
    base, now = json.load(open(BASELINE, encoding='utf-8')), totals(outdir)
    bad = []
    keys = sorted({k for o in list(base.values()) + list(now.values()) for k in o})
    for k in keys:
        a, b = sum(o.get(k, 0) for o in base.values()), sum(o.get(k, 0) for o in now.values())
        print('%-12s %8d -> %8d' % (k, a, b))
        if b > a * 1.02 + 400:
            bad.append('all outfits, %s: %d -> %d' % (k, a, b))
        for o in sorted(set(base) | set(now)):
            x, y = base.get(o, {}).get(k, 0), now.get(o, {}).get(k, 0)
            if y > x * 1.1 + 400:
                bad.append('%s, %s: %d -> %d' % (o, k, x, y))
    print('\n'.join(bad) if bad else 'garment audit: ok')
    return not bad


if __name__ == '__main__':
    a = sys.argv[1:]
    if '--baseline' in a:
        a.remove('--baseline')
        with open(BASELINE, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(totals(a[0]), f, indent=0, sort_keys=True)
        sys.exit()
    if '--check' in a:
        a.remove('--check')
        sys.exit(0 if check(a[0]) else 1)

    def opt(name, d=None):
        if name in a:
            i = a.index(name)
            v = a[i + 1]
            del a[i:i + 2]
            return v
        return d
    if '--report' in a:
        a.remove('--report')
        report(a[0], int(opt('--top', 50)))
        sys.exit()
    page = opt('--page', os.path.join(HERE, 'dist', 'cosmetic-lab.html'))
    clips = [(c.split(':')[0], float(c.split(':')[1])) for c in opt('--clips', CLIPS).split(',')]
    bodies = opt('--bodies', 'mpfb_male,mpfb_female,mpfb_giant').split(',')
    match = opt('--match')
    morph = opt('--morph')
    pre = opt('--pre')
    outs = opt('--outfits')          # a JSON file of [{name, body, armour}]: pairs the peoples do not list
    extra = json.load(open(outs, encoding='utf-8')) if outs else None
    shards, shard = int(opt('--shards', 1)), int(opt('--shard', 0))
    asyncio.run(main(a[0], page, clips, bodies, match, json.loads(morph) if morph else None, shards, shard, pre, extra))
