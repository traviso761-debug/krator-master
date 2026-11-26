#!/usr/bin/env python3
"""A comparison sheet for one animal: python3 rig/sheet.py <key> <gltf-loader.js> <out.png> [--rigged]

With --rigged the rows are the rig-*.glb: standing, close on the head, then the walk at four moments, textured.

A row per raw GLB in rig/sources/<key>/ with its intake numbers: textured from two sides, then plain grey, so a good texture cannot hide
bad shape. Every model is turned the same way and fitted to its box, under the same light. A model with no metal/roughness map is drawn
as a matte surface and one with no normals gets smooth ones, so a missing map does not read as a dark model. Takes three.js from kits/ancients, and
GLTFLoader.js for r128 from the path given. Headless Chromium through tools/harness.py; needs Pillow.
"""
import asyncio, base64, functools, http.server, io, json, os, socketserver, sys, threading
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'tools'))
from harness import launch_chromium
THREE_JS = os.path.join(HERE, '..', '..', 'ancients', 'three.min.js')
PAGE = """<!doctype html><canvas id=c width=420 height=420></canvas><script src=/three.min.js></script><script src=/GLTFLoader.js></script><script>
const R=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true,preserveDrawingBuffer:true});R.outputEncoding=THREE.sRGBEncoding;R.setClearColor(0xd6d6d6);
const T=new THREE.WebGLRenderTarget(840,840,{type:THREE.UnsignedByteType,format:THREE.RGBAFormat,encoding:THREE.sRGBEncoding});
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(24,1,.01,1e4);S.add(new THREE.HemisphereLight(0xffffff,0x8a8378,.95));const L=new THREE.DirectionalLight(0xffffff,1.15);S.add(L);
const clay=new THREE.MeshStandardMaterial({color:0x6f6c66,roughness:.8,metalness:0});let cur=null,mats=new Map(),box;
let mix=null,clips=[];window.pose=(c,t)=>{if(!clips.length)return;mix.stopAllAction();const a=mix.clipAction(clips.find(q=>q.name===c));a.play();mix.setTime(t);cur.updateMatrixWorld(true);};
window.load=u=>new Promise((ok,no)=>new THREE.GLTFLoader().load(u,g=>{if(cur)S.remove(cur);cur=g.scene;S.add(cur);clips=g.animations;mix=new THREE.AnimationMixer(cur);mats=new Map();cur.traverse(o=>{if(o.isMesh){if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();const m=o.material;if(!m.metalnessMap){m.metalness=0;m.roughness=.7;m.needsUpdate=true;}mats.set(o,m);}});cur.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(cur);ok(1);},null,e=>no(''+e)));
window.shot=(az,el,useClay,zoom)=>{mats.forEach((m,o)=>{o.material=useClay?clay:m;});const c=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()/2,d=r/Math.sin(12*Math.PI/180)*1.02/(zoom||1);if(zoom)c.z+=(box.max.z-c.z)*.62,c.y+=(box.max.y-c.y)*.25;const a=az*Math.PI/180,e=el*Math.PI/180;
 C.position.set(c.x+d*Math.cos(e)*Math.sin(a),c.y+d*Math.sin(e),c.z+d*Math.cos(e)*Math.cos(a));C.lookAt(c);L.position.copy(C.position).add(new THREE.Vector3(r*2,r*3,0));R.setRenderTarget(T);R.clear();R.render(S,C);const n=840,b=new Uint8Array(n*n*4);R.readRenderTargetPixels(T,0,0,n,n,b);R.setRenderTarget(null);
 let q='';for(let i=0;i<b.length;i+=8192)q+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(q);};
</script>"""
CELL = 420


async def run(key, loader, out, rigged=False):
    from playwright.async_api import async_playwright
    d = os.path.join(HERE, 'sources', key)
    files = sorted(f for f in os.listdir(d) if f.startswith('rig-' if rigged else 'raw-') and f.endswith('.glb'))
    intake = json.load(open(os.path.join(d, 'intake.json'), encoding='utf-8'))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=d)
    handler.log_message = lambda *a, **k: None
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    rows = []
    async with async_playwright() as p:
        b = await launch_chromium(p, ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] if os.name == 'nt' else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])      # the harness's --use-gl=swiftshader can lose the context here
        pg = await b.new_page(viewport={'width': 460, 'height': 460}); pg.set_default_timeout(240000)
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE_JS, content_type='application/javascript'))
        await pg.route('**/GLTFLoader.js', lambda r: r.fulfill(path=loader, content_type='application/javascript'))
        await pg.route('**/_sheet.html', lambda r: r.fulfill(body=PAGE, content_type='text/html'))
        await pg.goto('http://127.0.0.1:%d/_sheet.html' % port)
        for f in files:
            await pg.evaluate('u=>load(u)', '/' + f)
            row = []
            views = [(35, 18, False, None, 0, 0), (35, 12, False, 2.6, 0, 0)] + [(90, 14, False, None, 'walk', t) for t in (0.0, 0.25, 0.5, 0.75)] if rigged else [(35, 18, False, None, 0, 0), (215, 18, False, None, 0, 0), (35, 18, True, None, 0, 0), (125, 12, True, None, 0, 0)]
            for az, el, c, zoom, clip, t in views:
                await pg.evaluate('([c,t])=>{if(c)pose(c,t);}', [clip, t])
                raw = base64.b64decode(await pg.evaluate('([a,e,c,z])=>shot(a,e,c,z)', [az, el, c, zoom]))      # read from a render target: the headless canvas reads back black or white
                row.append(Image.frombytes('RGBA', (840, 840), raw).convert('RGB').transpose(Image.FLIP_TOP_BOTTOM).resize((CELL, CELL), Image.LANCZOS))
            rows.append((f, row)); print('drew', f, flush=True)
        await b.close()
    refs = [Image.open(os.path.join(d, v + '.png')).convert('RGB').resize((CELL, CELL)) for v in ('front', 'left', 'back')]
    W = Image.new('RGB', (CELL * len(rows[0][1]), (CELL + 34) * (len(rows) + 1)), (32, 32, 34)); D = ImageDraw.Draw(W)
    D.text((10, 10), key + ': the reference views', fill=(255, 255, 255))
    for x, im in enumerate(refs): W.paste(im, (x * CELL, 34))
    for y, (f, row) in enumerate(rows, 1):
        m = intake.get(f, {})
        if rigged:
            D.text((10, y * (CELL + 34) + 10), f[4:-4] + ': standing, the head, the walk at four moments', fill=(255, 255, 255))
        else:
            D.text((10, y * (CELL + 34) + 10), '%s   %s tris  %s MB  feet %s/%s  mirror %s%%  pieces %s  tex %s' % (f[4:-4], m.get('tris'), m.get('mb'), m.get('contacts'), m.get('want'), m.get('mirror'), m.get('pieces'), m.get('tex')), fill=(255, 255, 255))
        for x, im in enumerate(row): W.paste(im, (x * CELL, y * (CELL + 34) + 34))
    W.save(out)
    print('wrote', out)


if __name__ == '__main__':
    asyncio.run(run(*sys.argv[1:4], '--rigged' in sys.argv))
