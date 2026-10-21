# Shots of the Animation Lab, the same picture every run (for comparing a clip or prop fix before and after).
#   python3 tools/lab_shots.py <outdir> <spec.json> [--page <animation-lab.html>] [--gpu]
# The page is served from its own folder, so put the pieces it needs beside it (pieces/<body>/*.txt, pieces/props/*.txt:
# fetch them from the published lab). --gpu renders on the machine's GPU (ANGLE) instead of SwiftShader: minutes faster.
# spec: [{name, clip, prop?, t, who?, bodies?, yaw?, pitch?, dist?, ty?, pre?}, ...]
#   clip    a clip's name; prop the held prop ('' empty hands; the clip's default when left out); t the clip time in s
#   who     'all' (the six people, default) or 'g' (the giants)
#   bodies  figure ids (m-short ... f-tall, g-giant, g-heavy, g-patrol) each framed close and put side by side in one
#           sheet, labelled; left out, the whole row in one shot
#   yaw, pitch in radians (yaw 0 the front); dist (metres, a giant's scaled) and ty (the look-at height as a share of
#           the figure's height) frame each body; the lab's framing when left out
#   at      a joint's name to look at (the hands in a close-up) instead of the figure's middle
#   wide    the share of the stage's width kept per body (0.5 by default)
#   pre     JavaScript run before stepping, with L the lab (window._lab)
# The page's clock is paused and each figure stepped here: its clip set 1 s before t and run to it at 30 Hz (by its own
# cadence), so the cloth lands the same every run.
import asyncio, base64, functools, http.server, io, json, os, socketserver, sys, threading
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import verify

STEP = '''async (s)=>{ var L = window._lab, c = L.cam;
  var w = document.querySelector('[data-who="' + (s.who || 'all') + '"]'); if(w.getAttribute('aria-pressed') !== 'true') w.click();
  L.figs.forEach(function(f, i){ f.group.visible = (s.who || 'all') === 'g' ? i >= 6 : i < 6; f.group.position.z = 0; });
  await L.play(s.clip);
  if(s.prop !== undefined){ var p = document.getElementById('hold-pick'); p.value = s.prop; p.dispatchEvent(new Event('change')); await new Promise(function(r){ setTimeout(r, 300); }); }
  if(document.getElementById('play').getAttribute('aria-pressed') === 'true') document.getElementById('play').click();
  var on = document.querySelector('.tag[aria-pressed="true"]'); if(on) on.click();
  if(s.pre) eval(s.pre);
  L.figs.forEach(function(f){
    if(!f.group.visible || !f.action) return;
    f.action.time = Math.max(0, s.t - 1);
    for(var i = 0; i < 30; i++) f.update(1 / 30 / (f.cadence || 1));
    f.action.time = s.t; f.update(0);
  });
  ['yaw', 'pitch'].forEach(function(n){ if(s[n] != null) c.want[n] = s[n]; });
  ['yaw', 'pitch', 'dist', 'x', 'ty'].forEach(function(n){ c[n] = c.want[n]; });
  document.getElementById('labels').style.visibility = s.bodies ? 'hidden' : ''; }'''

# frame one figure: the lab's focus (its x), then this shot's distance and height
FOCUS = '''(a)=>{ var s = a[0], id = a[1], L = window._lab, c = L.cam, tag = document.getElementById('tag-' + id);
  if(tag.getAttribute('aria-pressed') !== 'true') tag.click();
  var f = L.figs.filter(function(x){ return x.group.visible; })[0], k = L.figs[Array.prototype.indexOf.call(document.querySelectorAll('#labels .tag'), tag)];
  var h = (k.pose.stature || 1.75);
  L.figs.forEach(function(x){ x.group.visible = x === k; });
  c.want.dist = (s.dist || 3.4) * k.scale; c.want.ty = (s.ty == null ? 0.55 : s.ty) * h;
  // the camera looks at z 0: a close-up moves the figure back so the joint is there
  if(s.at){ k.group.updateMatrixWorld(true); var bp = k.bones.filter(function(b){ return b.name === s.at; })[0].getWorldPosition(new THREE.Vector3());
    k.group.position.z -= bp.z; c.want.x = bp.x; c.want.ty = bp.y; }
  ['yaw', 'pitch', 'dist', 'x', 'ty'].forEach(function(n){ c[n] = c.want[n]; }); }'''


async def main(outdir, spec, page, gpu):
    from playwright.async_api import async_playwright
    from PIL import Image, ImageDraw
    os.makedirs(outdir, exist_ok=True)
    chrome = os.environ.get('KRATOR_CHROME') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    args = ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] if gpu else ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome, args=args)
        pg = await b.new_page(viewport={'width': 1400, 'height': 860})
        pg.on('pageerror', lambda e: print('page error', e))
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=verify.THREE, content_type='text/javascript'))
        await pg.route('**/GLTFLoader.js', lambda r: r.fulfill(path=verify.LOADER, content_type='text/javascript'))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())

        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass
        root = os.path.dirname(os.path.abspath(page))
        srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        await pg.goto('http://127.0.0.1:%d/%s' % (srv.server_address[1], os.path.basename(page)))
        await pg.wait_for_function('window._lab', timeout=120000)
        await pg.evaluate('window._lab.ready')
        canvas = pg.locator('#stage canvas')
        for s in spec:
            await pg.evaluate(STEP, s)
            await pg.wait_for_timeout(100)
            if not s.get('bodies'):
                await pg.wait_for_timeout(500)
                await canvas.screenshot(path=os.path.join(outdir, s['name'] + '.png'))
            else:
                tiles = []
                for id in s['bodies']:
                    await pg.evaluate(FOCUS, [s, id])
                    await pg.wait_for_timeout(250)
                    url = await pg.evaluate("document.querySelector('#stage canvas').toDataURL('image/png')")
                    im = Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGBA')
                    im = Image.alpha_composite(Image.new('RGBA', im.size, (214, 220, 204, 255)), im).convert('RGB')
                    w, h = im.size
                    cw = s.get('wide', 0.5) / 2
                    im = im.crop((int(w * (0.5 - cw)), 0, int(w * (0.5 + cw)), h))   # the figure's column
                    ImageDraw.Draw(im).text((8, 6), '%s  %s  t %.2f' % (id, s['clip'], s['t']), fill=(20, 20, 20))
                    tiles.append(im)
                tw, th = tiles[0].size
                sheet = Image.new('RGB', (tw * len(tiles), th), 'white')
                for i, t in enumerate(tiles):
                    sheet.paste(t, (i * tw, 0))
                sheet.save(os.path.join(outdir, s['name'] + '.png'))
            print(s['name'])
        await b.close()


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit('usage: lab_shots.py <outdir> <spec.json> [--page <html>] [--gpu]')
    page = a[a.index('--page') + 1] if '--page' in a else os.path.join(HERE, 'dist', 'animation-lab.html')
    asyncio.run(main(a[0], json.load(open(a[1], encoding='utf-8')), page, '--gpu' in a))
