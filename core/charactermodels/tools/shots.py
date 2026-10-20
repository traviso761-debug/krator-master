# Close-up shots of the Cosmetic Lab, the same picture every run (for comparing a clipping fix before and after).
#   python3 tools/shots.py <outdir> <spec.json> [--page dist/cosmetic-lab.html]
#   python3 tools/shots.py <outdir> tools/shots-clipping.json    (the open clipping issues: 14 shots)
# spec: [{name, body?, armour, clip?, t?, yaw, pitch, dist, at:[x,y,z], cloth?, pre?}, ...]
#   body   mpfb_male (default), mpfb_female, mpfb_giant
#   clip   a clip button's name (idle by default; 'none' for the A-pose); t the clip time in s (2 by default)
#   yaw, pitch in radians (yaw 0 the front, 3.14 the back); dist, at in metres; cloth false hangs the chains rigid
#   pre    JavaScript run before stepping, with f the figure
# The page's own loop is held (_kchar.still) and the figure stepped here: the chains reset, the clip set 2 s before t
# and run to it at 30 Hz from a stop, so a walk lands on the same frame with the same cloth every run.
import asyncio, functools, http.server, json, os, socketserver, sys, threading
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import verify

STEP = '''async (s)=>{ var K = window._kchar, f = K.fig, c = K.cam;
  // the clip from a stop, with no fade from the last shot's
  await f.play(null); await f.play(document.getElementById('clip-' + (s.clip || 'idle')).dataset.clip || null);
  c.yaw = s.yaw; c.spin = false; c.at = s.at; c.want.dist = c.dist = s.dist; c.want.pitch = c.pitch = s.pitch;
  f.cloth = s.cloth !== false; if(s.pre) eval(s.pre);
  Object.values(f.clothState().items).forEach(function(it){ it.reset = true; });
  var t = s.t == null ? 2 : s.t;
  if(f.action){ f.action.paused = false; f.action.time = Math.max(0, t - 2); }
  for(var i = 0; i < 60; i++) f.update(1 / 30);
  if(f.action){ f.action.paused = true; f.action.time = t; f.update(0); } }'''


async def main(outdir, spec, page):
    from playwright.async_api import async_playwright
    os.makedirs(outdir, exist_ok=True)
    chrome = os.environ.get('KRATOR_CHROME') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome, args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 800, 'height': 600})
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
        await pg.wait_for_function('window._kchar', timeout=120000)
        await pg.evaluate('window._kchar.ready')
        body = 'mpfb_male'
        for s in spec:
            if s.get('body', 'mpfb_male') != body:
                body = s.get('body', 'mpfb_male')
                await pg.evaluate('(b)=>Promise.resolve(window._kchar.body(b))', body)
                await pg.wait_for_timeout(500)
                await pg.wait_for_function('window._kchar && window._kchar.fig', timeout=120000)
                await pg.evaluate('window._kchar.ready')
            await pg.evaluate('window._kchar.still = true')
            await pg.evaluate('(arm)=>{ var r = JSON.parse(JSON.stringify(window._kchar.record())); r.armour = arm; return window._kchar.set(r); }', s['armour'])
            await pg.click('#clip-' + s.get('clip', 'idle'))
            await pg.evaluate(STEP, s)
            await pg.wait_for_timeout(400)       # the camera settles; the figure is held
            await pg.screenshot(path=os.path.join(outdir, s['name'] + '.png'), clip={'x': 0, 'y': 0, 'width': 800, 'height': 520})
            print(s['name'], flush=True)
        await b.close()
        srv.shutdown()


if __name__ == '__main__':
    a = sys.argv[1:]
    page = os.path.join(HERE, 'dist', 'cosmetic-lab.html')
    if '--page' in a:
        i = a.index('--page'); page = a[i + 1]; del a[i:i + 2]
    asyncio.run(main(a[0], json.load(open(a[1], encoding='utf-8')), page))
