#!/usr/bin/env python3
"""Verify the isle demo's site planner (dist/isle-site.html).

    python3 verify.py dist/isle-site.html --assert [--shots DIR]

For each town (Kautoa, Valapo) the page is loaded headless and checked:
  - it loads clean: no page error, the probe (window._site) ready without an error
  - the frame: the town's origin is its settlement point in the open world (moved by ISLE.SHIFT where the owner had it
    moved), its centre stands on land, the settlement point and a shore lie in the planning square
  - the ground is the open world's: the planner's height + the frame's sea level equals WORLD.H at the same world point
    (24 samples over the planning square), and the frame's sea is the water's level the world draws there
  - the editor works on it: a district, a marker and an avenue added, undone, redone; the town's save payload
    carries the frame and the drawing
  - negative controls: a shore pushed 4 km off must fail the frame check; a frame moved by 50 m must fail the ground check; a payload without its frame must fail
Then, without a browser:
  - serve.py's merge puts one town's site into a copy of the file and leaves the other town's entry as it was; it
    refuses a site without a frame and a town that is not on the map
  - the Voth files build.py reads in place still hash as voth-sources.json records them (else re-check, --accept)
"""
import argparse, asyncio, hashlib, json, os, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

CHECKS = r"""(neg)=>{const R=[],F=ISLE.F,S=WORLD_DATA.meta.settlements.find(s=>s.name===F.town);
 {const d=ISLE.SHIFT[F.town]||[0,0],ex=S.x+d[0],ez=S.z+d[1],ok=Math.abs(F.x-ex)<1e-6&&Math.abs(F.z-ez)<1e-6,h=VOTH.terrainH(0,0),sh=VOTH.landDist(0,0)+(neg==='shore'?4000:0);
  const pin=Math.abs(S.x-F.x)<3900&&Math.abs(S.z-F.z)<3900;
  R.push({name:'the frame: on land, the settlement point and a shore in the square',ok:ok&&h>0&&pin&&sh>0&&sh<3900,
   detail:'origin '+F.x+', '+F.z+' (settlement '+S.x+', '+S.z+(d[0]||d[1]?', moved '+d:'')+'), centre '+h.toFixed(1)+' m above the sea, the shore '+Math.round(sh)+' m away'+(pin?'':'; the settlement point is OUTSIDE the square')});}
 {const dx=neg==='frame'?50:0;let worst=0,at=null;
  for(let i=0;i<24;i++){const a=i*2.399963,r=3800*Math.sqrt((i+.5)/24),lx=Math.cos(a)*r,lz=Math.sin(a)*r;
   const d=Math.abs(TERR.h(lx,lz)+F.sea-WORLD.H(F.x+lx+dx,F.z+lz));if(d>worst){worst=d;at=[Math.round(lx),Math.round(lz)];}}
  let sea=null;for(let r=0;r<=12000&&sea==null;r+=250)for(let k=0;k<64;k++){const w=WORLD.lakeWater(F.x+Math.cos(k/64*6.2832)*r,F.z+Math.sin(k/64*6.2832)*r);if(w>-1e8){sea=w;break;}}
  const ok=worst<0.01&&sea!=null&&Math.abs(sea-F.sea)<0.01;
  R.push({name:"the ground is the open world's",ok,detail:'24 samples, worst '+worst.toFixed(3)+' m at '+at+'; the frame sea '+F.sea+', the world water '+(sea==null?'none':sea.toFixed(2))});}
 {const c0=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  const u0=SITE.undo.length,d=SITE.addDistrict('plaza',[[-60,-60],[60,-60],[60,60],[-60,60]]),m=SITE.addMarker(100,100),a=SITE.addLine('avenue',[[-200,0],[200,0]]);
  const n1=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  SITE.doUndo();SITE.doUndo();SITE.doUndo();const n0=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  SITE.doRedo();const area=SITE.area(SITE.district(d.id).poly);
  const P=JSON.parse(ISLE.townJSON());if(neg==='payload')delete P.frame;
  const pay=P.frame&&P.frame.town===F.town&&isFinite(P.frame.sea)&&Array.isArray(P.districts)&&P.districts.some(q=>q.id===d.id);
  SITE.doUndo();while(SITE.undo.length>u0)SITE.doUndo();SITE.dirty=false;TOOL.status();
  const ok=n1.join()===c0.map(c=>c+1).join()&&n0.join()===c0.join()&&Math.abs(area-14400)<1&&!!pay;
  R.push({name:'the editor draws on it and saves the town with its frame',ok,detail:'drawn '+c0+', added '+n1+', undone '+n0+', redone plaza '+area.toFixed(0)+' m2; payload '+(pay?'carries the frame and the drawing':'MISSING its frame or drawing')});}
 return R;}"""


def hashes_ok():
    rec = json.load(open(os.path.join(HERE, 'voth-sources.json'), encoding='utf-8'))['files']
    bad = [k for k, h in rec.items() if hashlib.sha1(open(os.path.join(ROOT, k), 'rb').read().replace(b'\r\n', b'\n')).hexdigest() != h]
    return not bad, ('%d files as recorded' % len(rec)) if not bad else 'changed: ' + ', '.join(bad)


def merge_ok():
    sys.path.insert(0, HERE)
    import serve
    tmp = tempfile.mkdtemp()
    keep = serve.FILE
    try:
        serve.FILE = os.path.join(tmp, 'isle-site.json')
        fr = {'x': 1, 'z': 2, 'sea': -3}
        site = lambda n: {'frame': dict(fr), 'districts': [{'id': 'd1', 'n': n}], 'markers': []}
        serve.merge('Kautoa', site('k'))
        serve.merge('Valapo', site('w'))
        serve.merge('Kautoa', site('k2'))
        d = json.load(open(serve.FILE, encoding='utf-8'))
        both = d['towns']['Valapo']['districts'][0]['n'] == 'w' and d['towns']['Kautoa']['districts'][0]['n'] == 'k2'
        refused = 0
        for town, s in (('Kautoa', {'districts': [], 'markers': []}), ('Atlantis', site('x'))):
            try:
                serve.merge(town, s)
            except ValueError:
                refused += 1
        return both and refused == 2, 'one town saved over, the other kept: %s; refused %d of 2 bad saves (no frame, no such town)' % (both, refused)
    finally:
        serve.FILE = keep
        shutil.rmtree(tmp, ignore_errors=True)


async def run(a):
    import harness
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.dirname(os.path.abspath(a.html)))   # the build folder: the page fetches ../site/
    page = os.path.relpath(os.path.abspath(a.html), folder).replace(os.sep, '/')
    fails = []
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            for town in ('Kautoa', 'Valapo'):
                pg = await b.new_page(viewport={'width': 1280, 'height': 800})
                errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto('http://127.0.0.1:%d/%s?town=%s' % (port, page, town), timeout=0)
                await pg.wait_for_function('window._site && _site.ready', timeout=300000)
                st = await pg.evaluate('JSON.stringify({err:_site.error||null,town:_site.town,from:_site.from,ms:_site.ms})')
                st = json.loads(st)
                print('--- %s (site from %s, ready in %s ms) ---' % (town, st['from'], (st['ms'] or {}).get('site')))
                if st['err'] or st['town'] != town:
                    print('  FAIL  loads clean : ' + str(st['err'] or 'opened ' + st['town']))
                    fails.append(town + ' load'); await pg.close(); continue
                print('  PASS  loads clean : no error, the town is ' + town)
                if a.assert_:
                    for r in await pg.evaluate(CHECKS, None):
                        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                        if not r['ok']: fails.append(town + ': ' + r['name'])
                    for neg, nm in (('shore', 'the frame: on land, the settlement point and a shore in the square'), ('frame', "the ground is the open world's"), ('payload', 'the editor draws on it and saves the town with its frame')):
                        r = [x for x in await pg.evaluate(CHECKS, neg) if x['name'] == nm][0]
                        print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') : ' + r['detail'])
                        if r['ok']: fails.append(town + ': negative ' + neg)
                if a.shots:
                    os.makedirs(a.shots, exist_ok=True)
                    for v in ('v-map', 'v-city'):
                        await pg.evaluate("document.getElementById('%s').onclick()" % v)
                        await pg.wait_for_timeout(800)
                        await pg.screenshot(path=os.path.join(a.shots, '%s-%s.png' % (town.lower(), v[2:])))
                if errs:
                    print('  FAIL  page errors : ' + '; '.join(errs[:3])); fails.append(town + ' page errors')
                await pg.close()
            await b.close()
    if a.assert_:
        print('--- without a browser ---')
        for name, (ok, detail) in (('serve.py merges one town at a time', merge_ok()), ("the Voth files read are the ones recorded", hashes_ok())):
            print(('  PASS  ' if ok else '  FAIL  ') + name + ' : ' + detail)
            if not ok: fails.append(name)
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--shots', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
