#!/usr/bin/env python3
"""Headless check for the Fauna kit.

  python3 verify.py dist/fauna.html [--assert] [--out shots --views front34,side] [--eval "()=>..."] [--size 1280x800] [--only key,key]

Serves dist/ over HTTP, routes three.min.js to a local r128 (offline), loads in headless Chromium (SwiftShader), waits for
window._ready (the detail maps decoded), prints the error panel, runs the invariants with --assert (the vocabulary, traits,
yields and life of every animal; every variant and breed built: no NaN, inside its box, on the ground, with its parts,
animated in every mode, deterministic), and with --out screenshots every animal alone from each view.
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers. Every verify.py in the repo carries this same block: a fix
# here belongs in all of them (grep for "Harness helpers").
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
# Every page builds its world in one synchronous script, so "load" fires only when
# the world is built: minutes under software GL on a shared box (Dalab's city took
# 285 s with seven other agents running; 180 s timed Locus out mid-build).
LOAD_MS = 900000
# KRATOR_CHROME names a Chromium to launch. The other names are the ones single
# copies of this harness used before they were merged; they still work.
CHROME_ENV = ("KRATOR_CHROME", "PW_CHROME", "PW_CHROMIUM", "CHROME_PATH", "VERIFY_CHROME", "CHROMIUM")


async def launch_chromium(p, args=GL_ARGS):
    """$KRATOR_CHROME (or an older name in CHROME_ENV), else playwright's own
    build, else a pinned build under /opt/pw-browsers: a cloud container ships
    one that need not match the pip playwright's pin."""
    for k in CHROME_ENV:
        if os.environ.get(k):
            return await p.chromium.launch(executable_path=os.environ[k], args=args)
    try:
        return await p.chromium.launch(args=args)
    except Exception as e:
        if "Executable doesn't exist" not in str(e):
            raise
        for c in ["/opt/pw-browsers/chromium"] + sorted(
                glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"), reverse=True):
            if os.path.exists(c):
                return await p.chromium.launch(executable_path=c, args=args)
        raise


def local_three(folder):
    """The pinned three.js r128 to serve in place of the CDN copy: this build's
    own, the page folder's, else the repo's copy in kits/ancients (a build that
    keeps none still runs offline). Returns a path that may not exist."""
    here = os.path.dirname(os.path.abspath(__file__))
    cands = [os.path.join(here, "three.min.js"), os.path.join(folder, "three.min.js")]
    d = here
    for _ in range(4):
        d = os.path.dirname(d)
        cands.append(os.path.join(d, "kits", "ancients", "three.min.js"))
    return next((c for c in cands if os.path.exists(c)), cands[0])


def parse_views(spec, names=()):
    """--views. Names separated by '|' or ';' are taken exactly, so a name may
    hold commas. Separated by commas, consecutive pieces are joined back up
    whenever that spells an existing preset's name, longest first: so
    "Overview,Town types — row, stacked house, well, tower" is two views."""
    spec = (spec or "").strip()
    if not spec:
        return []
    if "|" in spec or ";" in spec:
        return [v.strip() for v in re.split(r"[|;]", spec) if v.strip()]
    names = set(names or ())
    toks, out, i = spec.split(","), [], 0
    while i < len(toks):
        j = next((j for j in range(len(toks), i + 1, -1)
                  if ",".join(toks[i:j]).strip() in names), i + 1)
        v = ",".join(toks[i:j]).strip()
        if v:
            out.append(v)
        i = j
    return out

try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
ASSERT_JS = r"""()=>{const KF=KratorFauna,V=KF.VOCAB,Y=KF.YIELDS,R=[];const fails={vocab:[],traits:[],yields:[],life:[],build:[],box:[],parts:[],ground:[],tris:[],anim:[],det:[]};
 const inList=(k,v)=>Array.isArray(v)?v.every(x=>V[k].indexOf(x)>=0):V[k].indexOf(v)>=0;
 for(const L of KF.list()){const E=KF.entry(L.key),T=E.tags;
  for(const k of ['aridity','climate','koppen'])if(!T[k]||!T[k].length||!inList(k,T[k]))fails.vocab.push(L.key+' '+k);
  for(const k of ['riparian','diet','feeding','activity','temperament'])if(!T[k]||!inList(k,T[k]))fails.vocab.push(L.key+' '+k+'='+T[k]);
  for(const k of ['habitat','locomotion'])if(!T[k]||!T[k].length||!inList(k,T[k]))fails.vocab.push(L.key+' '+k+'='+T[k]);
  const D=E.data||{};if(!D.gait||V.gait.indexOf(D.gait.type)<0)fails.vocab.push(L.key+' gait='+(D.gait&&D.gait.type));
  if(!E.size||!(E.size.length>0||E.size.span>0)||!E.size.height)fails.life.push(L.key+' size {length|span, height}');
  if(!E.source||!E.source.length||!E.source.every(q=>q.build&&q.file))fails.life.push(L.key+' source [{build, file, lines}]');
  if(!T.biomes||!T.biomes.length)fails.vocab.push(L.key+' biomes');
  for(const k of V.traits)if(typeof E.traits[k]!=='boolean')fails.traits.push(L.key+' '+k);
  for(const k of Object.keys(E.yields)){const y=E.yields[k],a=y&&typeof y==='object'?y.amount:y;if(!(k in Y)||!(a>=0))fails.yields.push(L.key+' '+k);}
  if(E.traits.milkable&&!E.yields.milk)fails.yields.push(L.key+' milkable without a milk yield');
  if(E.traits.eggs&&!E.yields.eggs)fails.yields.push(L.key+' eggs without an egg yield');
  if(E.traits.edible&&!E.yields.meat)fails.yields.push(L.key+' edible without a meat yield');
  const Lf=E.life;if(!(Lf.maturity>0&&Lf.lifespan>Lf.maturity&&Lf.litter>0))fails.life.push(L.key);
  for(const b of (L.breeds||[null]))for(let v=0;v<L.variants;v++){const tag=L.key+(b?'/'+b:'')+'#'+v;let g;
   try{g=KF.build(L.key,{variant:v,breed:b,seed:3});}catch(e){fails.build.push(tag+' '+e.message);continue;}
   const u=g.userData;g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);let nan=false;
   g.traverse(o=>{if(o.isMesh){const a=o.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){nan=true;break;}}});
   if(nan)fails.build.push(tag+' NaN');
   const bw=box.max.x-box.min.x,bd=box.max.z-box.min.z,bh=box.max.y;
   if(bw>u.w*1.1||bd>u.d*1.1||bh>u.h*1.1)fails.box.push(tag+' '+bw.toFixed(2)+'x'+bd.toFixed(2)+'x'+bh.toFixed(2)+' vs '+u.w.toFixed(2)+'x'+u.d.toFixed(2)+'x'+u.h.toFixed(2));
   const Dv=Object.assign({},D,(E.modelData||{})[v]||{});const nLegs=Dv.legs==null?4:Dv.legs;if(!u.parts.body||(!u.parts.head&&!D.noHead)||u.parts.legs.filter(Boolean).length!==nLegs)fails.parts.push(tag+' legs '+u.parts.legs.filter(Boolean).length+'/'+nLegs);
   if(Dv.wings&&!(u.parts.wingL&&u.parts.wingR))fails.parts.push(tag+' wings');
   if(nLegs>0&&Math.abs(box.min.y)>0.05)fails.ground.push(tag+' lowest '+box.min.y.toFixed(3));
   if(u.tris>(Dv.budget||9000))fails.tris.push(tag+' '+u.tris+' > '+(Dv.budget||9000));
   for(const m of ['idle','graze','walk','rest','fly','swim']){try{for(const t of [0,.37,1.9])KF.animate(g,t,m,{phase:1});g.updateMatrixWorld(true);const b2=new THREE.Box3().setFromObject(g);
    if(!(b2.max.x-b2.min.x<u.w*1.6&&b2.max.z-b2.min.z<u.d*1.4))fails.anim.push(tag+' '+m+' grows');}catch(e){fails.anim.push(tag+' '+m+' '+e.message);}}
   const g2=KF.build(L.key,{variant:v,breed:b,seed:3});if(g2.userData.tris!==u.tris)fails.det.push(tag);}}
 const n=KF.list().reduce((a,L)=>a+L.variants*((L.breeds||[0]).length),0);
 const rep=(name,arr,ok)=>R.push({name,ok:!arr.length,detail:arr.length?arr.slice(0,12).join(' | '):ok});
 rep('vocabulary',fails.vocab,'every tag in the vocabulary: biomes, Koppen, aridity, climate, riparian, habitat, locomotion, diet, feeding, activity, temperament, gait');
 rep('traits',fails.traits,'every animal states edible, milkable, tameable, rideable, draught, eggs');
 rep('yields',fails.yields,'every yield a known kind with an amount, and every trait backed by its yield');
 rep('life',fails.life,'maturity, lifespan, young per birth, size and source for every animal');
 rep('builds',fails.build,n+' builds (every variant and breed), no NaN');
 rep('inside-declared-box',fails.box,'every build within its declared w x d x h + 10%');
 rep('parts',fails.parts,'every build has a body, a head, its legs (data.legs) and wings (data.wings) to animate');
 rep('on-the-ground',fails.ground,'every legged build stands on y = 0');
 rep('triangle-budget',fails.tris,'every build under its budget (data.budget, default 9000)');
 rep('animation',fails.anim,'idle, graze, walk, rest, fly and swim run and keep the animal in its box');
 rep('deterministic',fails.det,'the same seed builds the same animal');
 rep('textures',KF.textures().pending?['still decoding '+KF.textures().pending]:[],'detail maps: '+KF.textures().families.join(', '));
 return R;}"""
async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    if a.out: os.makedirs(a.out, exist_ok=True)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); bad = False
    async with async_playwright() as p:
        b = await launch_chromium(p)
        W, H = [int(t) for t in a.size.split("x")]; pg = await b.new_page(viewport={"width": W, "height": H}); pg.set_default_timeout(600000)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        three = local_three(folder)
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{name}?t=4" + ("&only=" + a.only if a.only else ""), timeout=LOAD_MS)
        try: await pg.wait_for_function("window._ready===true||(document.getElementById('errs')&&document.getElementById('errs').style.display==='block')", timeout=LOAD_MS)
        except Exception as e: print('never ready', e)
        await pg.wait_for_timeout(600)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)')
        if e.strip() or errs: bad = True
        for x in errs[:8]: print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700]); bad |= not r['ok']
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.out:
            n = await pg.evaluate("_sheet.instances.length")
            for i in range(n):
                for kind in a.views.split(','):
                    lab = await pg.evaluate("([i,k])=>_sheet.view(i,k)", [i, kind]); await pg.wait_for_timeout(500)
                    fn = os.path.join(a.out, '%02d-%s.png' % (i, kind)); await pg.screenshot(path=fn); print('shot', fn, lab)
        await b.close()
    sys.exit(1 if bad else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=''); ap.add_argument('--views', default='front34,side'); ap.add_argument('--eval'); ap.add_argument('--size', default='1280x800')
    ap.add_argument('--only', default='', help='key,key: lay out (and shoot) only these animals')
    asyncio.run(run(ap.parse_args()))
