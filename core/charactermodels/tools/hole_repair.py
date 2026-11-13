# Issue 5 of REVIEW-GARMENTS-2026-11-06.md, holes at open edges: where a garment's hide mask hides skin that a camera
# can see through an opening (a lapel, a hem, a slit, a loose cuff), the page shows a hole into the body. Which skin
# that is cannot be read off the garment's topology (every grid's edge is "open": tried 2026-11-10); it can be seen.
#
#   python3 tools/hole_repair.py find <outdir> [--page dist/cosmetic-lab.html] [--known | --match s | --outfits f.json]
#                                     [--clips idle:2,walk:0.6,...]
#       the audit's shots again; for every hole patch (background ringed by cloth or skin), rays through its pixels
#       against the WHOLE skin (the hidden triangles too): the first skin triangle each ray meets is one the eye sees
#       through the opening. Written to <outdir>/holes.json: {body: {item id: [base triangles]}} for every worn item
#       that hides the triangle, with the shots that saw it.
#   python3 tools/hole_repair.py apply <outdir>/holes.json [--min-shots 2]
#       clears those triangles from the items' hide masks (data/<body>/kit.json, through make_mpfb.write_kit) and
#       records them in tests/hide-repairs.json, so `apply tests/hide-repairs.json` restores them after a Blender
#       rebuild or `make_mpfb.py hides` has rederived the masks.
#   python3 tools/hole_repair.py find <outdir> --skin ...      the reverse: skin that shows through cloth (the audit's
#       "skin" patches: skin ringed by cloth, not bare in the A-pose). The triangles seen are ones the mask should
#       hide and does not; written to <outdir>/skins.json under the worn item of the slot that rings the patch.
#   python3 tools/hole_repair.py apply <outdir>/skins.json --hide [--min-shots 2]      sets those triangles in the mask
# A repair is checked by the audit afterwards: "hole" down on the outfit, skin not up (skin unhidden under cloth that
# lies on it comes through in motion: the reason the masks hide to the edge of a snug garment).
import asyncio, base64, functools, http.server, json, os, socketserver, sys, threading
import numpy as np
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, 'tools'))

# the rays: the editor's camera rebuilt from its state (90-editor.js frame()), the base skin with its whole index
RAYS = '''([pts, w, h]) => { var K = window._kchar, f = K.fig, c = K.cam, live = f.live, base = null;
  var kit = KCHAR_DATA.bodies[f.bodyId || window._auditBody].kit;
  Object.keys(live).forEach(function(k){ var m = live[k]; if(m.userData.part && m.userData.part.role === 'base' && m.userData.srcMaterial === kit.base_material) base = m; });
  if(!base || !base.userData.index0) return null;
  var cam = new THREE.PerspectiveCamera(30, w / Math.max(1, h), 0.05, 50), cp = Math.cos(c.pitch);
  var tx = c.at ? c.at[0] : 0, tz = c.at ? c.at[2] : 0, ty = c.at ? c.at[1] : c.ty;
  cam.position.set(tx + Math.sin(c.yaw) * cp * c.dist, ty + Math.sin(c.pitch) * c.dist, tz + Math.cos(c.yaw) * cp * c.dist);
  cam.lookAt(tx, ty, tz); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  var g = base.geometry, keep = g.index, bs = g.boundingSphere, vis = base.visible;
  g.setIndex(new THREE.BufferAttribute(base.userData.index0, 1)); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 50);
  base.visible = true; base.updateMatrixWorld(true);
  var rc = new THREE.Raycaster(), out = [];
  pts.forEach(function(p){
    rc.setFromCamera({ x: p[0] / w * 2 - 1, y: -(p[1] / h * 2 - 1) }, cam);
    var hit = rc.intersectObject(base, false);
    out.push(hit.length ? hit[0].faceIndex : -1);
  });
  g.setIndex(keep); g.boundingSphere = bs; base.visible = vis;
  return out; }'''


def hole_pixels(lab, GA, step=2, most=80, skin=False):
    """the pixels of every hole patch of a classified shot (as garment_audit.patches finds them), thinned to a grid;
    skin=True: of every skin patch ringed by cloth instead, each paired with the cloth class that rings it most"""
    ids = {n: i for i, n in enumerate(GA.NAMES)}
    closers = [ids[n] for n in GA.CLOTH] + ([] if skin else [ids['skin']])
    mask = lab == ids['skin' if skin else 'bg']
    comp, n = ndimage.label(mask, structure=np.ones((3, 3)))
    out = []
    for k, sl in enumerate(ndimage.find_objects(comp), 1):
        y0, x0 = max(sl[0].start - 3, 0), max(sl[1].start - 3, 0)
        sub = comp[y0:sl[0].stop + 3, x0:sl[1].stop + 3] == k
        px = int(sub.sum())
        if px < GA.MIN_PX or px > (GA.MAX_PX if skin else GA.HOLE_PX):
            continue
        ring = ndimage.binary_dilation(sub, iterations=2) & ~sub
        near = lab[y0:sl[0].stop + 3, x0:sl[1].stop + 3][ring]
        near = near[near >= 0]
        if near.size == 0 or float(np.isin(near, closers).mean()) < GA.CLOSED:
            continue
        ys, xs = np.nonzero(sub)
        sel = [(int(x) + x0, int(y) + y0) for x, y in zip(xs, ys) if (x % step == 0 and y % step == 0)] or [(int(xs[0]) + x0, int(ys[0]) + y0)]
        if skin:
            cl = near[np.isin(near, closers)]
            # one garment's surface, not the gap between two: skin between a shirt's hem and a skirt's waist is meant to
            # show when the trunk bends, and hidden it would be a hole. The ring is that slot's alone (95 % of it),
            # front or inside face
            names = [GA.NAMES[int(c)] for c in cl]
            slots = [n[:-1] if n.endswith('b') else n for n in names]
            slot = max(set(slots), key=slots.count) if slots else None
            if slot is None or slots.count(slot) < 0.95 * len(near):
                continue
            out.append((sel[:most], slot))
        else:
            out.append(sel[:most])
    return out


async def find(outdir, page, clips, todo, skin=False):
    import garment_audit as GA
    import verify
    from playwright.async_api import async_playwright
    os.makedirs(outdir, exist_ok=True)
    kits = {b: json.load(open(os.path.join(HERE, 'data', b, 'kit.json'), encoding='utf-8')) for b in ('mpfb_male', 'mpfb_female', 'mpfb_giant')
            if os.path.exists(os.path.join(HERE, 'data', b, 'kit.json'))}
    bits = {}

    def hides(body, item, t):
        key = (body, item)
        if key not in bits:
            e = next((x for x in kits[body]['items'] if x['id'] == item), None)
            raw = base64.b64decode(e['hide']) if e and isinstance(e.get('hide'), str) else b''
            bits[key] = np.unpackbits(np.frombuffer(raw, np.uint8), bitorder='little') if raw else np.zeros(0, np.uint8)
        b = bits[key]
        return t < len(b) and bool(b[t])
    found = {}                                  # body -> item -> triangle -> [shots]
    async with async_playwright() as p:
        gl = os.environ.get('AUDIT_GL', 'swiftshader')
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
            await pg.evaluate('''([arm])=>{ var r = JSON.parse(JSON.stringify(window._kchar.record())); r.armour = arm; r.hair = null; r.beard = null; return window._kchar.set(r); }''', [o['armour']])
            await pg.evaluate(GA.FLAT)
            big = 1.6 if body == 'mpfb_giant' else 1.0
            worn = [v for v in o['armour'].values() if isinstance(v, str)]
            nh = nt = 0
            bare = set()
            for clip, t in ([('none', 0.0)] if skin else []) + [c for c in clips if not (skin and c[0] == 'none')]:
                await pg.evaluate(GA.STEP, {'clip': clip, 't': t, 'pre': None})
                low = clip in ('ual_crouch', 'crouch_walk', 'dodge_roll', 'ual_roll')
                at, dist = [0, (0.62 if low else 0.92) * big, 0], (3.3 if not low else 3.0) * big
                for v, yaw in GA.VIEWS.items():
                    await pg.evaluate(GA.VIEW, [yaw, at, dist])
                    el = await pg.query_selector('canvas')
                    path = os.path.join(outdir, 'shot.png')
                    await el.screenshot(path=path)
                    im = Image.open(path)
                    lab, key = GA.classify(im)
                    if skin:
                        if clip == 'none':
                            bare |= GA.bare_keys(lab, key)
                            continue
                        if bare:                      # skin the A-pose shows bare is the cut, not a fault
                            lab = lab.copy()
                            lab[np.isin(key, list(bare))] = GA.NAMES.index('body')
                    patches = hole_pixels(lab, GA, skin=skin)
                    if not patches:
                        continue
                    slots = [sl for pp, sl in patches for _q in pp] if skin else None
                    pts = [q for pp in patches for q in (pp[0] if skin else pp)]
                    tris = await pg.evaluate(RAYS, [pts, im.width, im.height])
                    if tris is None:
                        continue
                    nh += len(patches)
                    shot = '%s--%s-%s--%s' % (o['name'], clip, t, v)
                    if skin:
                        seen_here = set()
                        for tri, sl in zip(tris, slots):
                            item = o['armour'].get(sl) if sl else None
                            if tri is None or tri < 0 or not isinstance(item, str) or (item, tri) in seen_here:
                                continue
                            seen_here.add((item, tri))
                            found.setdefault(body, {}).setdefault(item, {}).setdefault(int(tri), []).append(shot)
                            nt += 1
                        continue
                    for tri in {int(x) for x in tris if x is not None and x >= 0}:
                        for item in worn:
                            if hides(body, item, tri):
                                found.setdefault(body, {}).setdefault(item, {}).setdefault(tri, []).append(shot)
                                nt += 1
            print('%-30s %s patches %3d, %s triangles seen %4d' % (o['name'], 'skin' if skin else 'hole', nh, 'bare' if skin else 'hidden', nt), flush=True)
            json.dump({bd: {it: {str(t): s for t, s in tr.items()} for it, tr in items.items()} for bd, items in found.items()},
                      open(os.path.join(outdir, 'skins.json' if skin else 'holes.json'), 'w', encoding='utf-8', newline='\n'), indent=0)
        await b.close()
        srv.shutdown()


def apply(path, min_shots, hide=False):
    import make_mpfb
    data = json.load(open(path, encoding='utf-8'))
    rec_path = os.path.join(HERE, 'tests', 'hide-repairs.json')
    rec = json.load(open(rec_path, encoding='utf-8')) if os.path.exists(rec_path) else {}
    if 'unhide' not in rec and 'hide' not in rec:
        rec = {'unhide': rec, 'hide': {}}          # the first form of the file: unhidden triangles only
    if 'unhide' in data or 'hide' in data:         # the record itself: both sections applied again
        for sec_name, hd in (('unhide', False), ('hide', True)):
            if data.get(sec_name):
                tmp = path + '.' + sec_name + '.tmp'
                with open(tmp, 'w', encoding='utf-8') as f:
                    json.dump({b: {it: {str(t): ['rec', 'rec'] for t in ts} for it, ts in items.items()} for b, items in data[sec_name].items()}, f)
                apply(tmp, 2, hd)
                os.remove(tmp)
        return
    sec = rec.setdefault('hide' if hide else 'unhide', {})
    for body, items in data.items():
        kp = os.path.join(HERE, 'data', body, 'kit.json')
        kit = json.load(open(kp, encoding='utf-8'))
        nt = kit['base_tris'] if isinstance(kit.get('base_tris'), int) else None
        for e in kit['items']:
            tr = items.get(e['id'])
            if not tr or not isinstance(e.get('hide'), str):
                continue
            want = sorted(int(t) for t, shots in tr.items() if (len(shots) if isinstance(shots, list) else min_shots) >= min_shots)
            raw = np.frombuffer(base64.b64decode(e['hide']), np.uint8)
            b = np.unpackbits(raw, bitorder='little').copy()
            was = int(b.sum())
            for t in want:
                if t < len(b):
                    b[t] = 1 if hide else 0
            now = int(b.sum())
            if now == was:
                continue
            e['hide'] = base64.b64encode(np.packbits(b, bitorder='little').tobytes()).decode()
            e['hides'] = now if nt is None else int(b[:nt].sum())
            sec.setdefault(body, {})[e['id']] = sorted(set(sec.get(body, {}).get(e['id'], [])) | set(want))
            print('%-11s %-34s hides %5d -> %5d' % (body, e['id'], was, now))
        make_mpfb.write_kit(kp, kit)
    with open(rec_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rec, f, indent=0, sort_keys=True)
    print('recorded in', rec_path)


if __name__ == '__main__':
    a = sys.argv[1:]

    def opt(k, d=None):
        if k in a:
            i = a.index(k); v = a[i + 1]; del a[i:i + 2]
            return v
        return d
    if a and a[0] == 'apply':
        ms = int(opt('--min-shots', 2))
        hd = '--hide' in a
        if hd:
            a.remove('--hide')
        apply(a[1], ms, hd)
        sys.exit()
    if not a or a[0] != 'find':
        sys.exit(__doc__ or 'hole_repair.py find|apply (see the file\'s head)')
    import garment_audit as GA
    page = opt('--page', os.path.join(HERE, 'dist', 'cosmetic-lab.html'))
    clips = [(c.split(':')[0], float(c.split(':')[1])) for c in opt('--clips', 'idle:2,walk:0.3,walk:0.6,run:0.25,run:0.4,ual_crouch:1').split(',')]
    outs = opt('--outfits')
    match = opt('--match')
    todo = json.load(open(outs, encoding='utf-8')) if outs else GA.outfits(['mpfb_male', 'mpfb_female', 'mpfb_giant'], match)
    sk = '--skin' in a
    if sk:
        a.remove('--skin')
    asyncio.run(find(a[1], page, clips, todo, sk))
