#!/usr/bin/env python3
"""XS0 (settlements/xanadu/STACK-PLAN.md section 9): measure every Xanadu page on the stage 1 harness.

For each page: linked-program samplers (tools/harness.py SAMPLERS_JS, the same read tools/route_harness.py takes),
estimated video memory (harness VRAM_JS), page and sidecar bytes against the 16 MB cap, and which packed library
families the scene's materials draw (KMAT packs matched to the textures on scene materials).

Order per page: load until ready and every packed image decoded; render; read (A: as loaded); renderer.compile(scene,
camera) over the whole scene graph, render, read (B: every material in the scene linked); then each preset view in turn
(kit pages: the #ui buttons; region pages: _api.go(i)), reading after each. Samplers accumulate over every program linked
in the run (r128 keeps them in renderer.info.programs); VRAM is the worst reading.

Usage: python3 xs0_measure.py <out.json> <page-id> [<page-id> ...]   (ids in PAGES; results merge into out.json)
  XS0_VIEWS=6 (how many preset views, evenly spaced; 0 = load and compile only), XS0_QUERY='?shadow=1' (appended to the URL).
  On a GPU lane:  KRATOR_GL=gpu python3 tools/harness.py lock --lane arc -- python3 settlements/xanadu/xs0/xs0_measure.py ...
  (the harness launches Chromium with the lane's switches; without KRATOR_GL=gpu it runs on SwiftShader).
"""
import asyncio, json, os, re, sys, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as H  # noqa: E402

KIT_READY = None   # harness READY_JS
WORLD_READY = "typeof CAM==='object'&&CAM&&window._api&&typeof _api.settle==='function'"
PAGES = {
    'erewhon': ('settlements/xanadu/dist/erewhon.html', 'settlements/xanadu', 'kit'),
    'xanadu-sheet': ('settlements/xanadu/dist/xanadu.html', 'settlements/xanadu', 'kit'),
    'pher': ('settlements/pher/dist/pher.html', 'settlements/pher', 'kit'),
    'kirstabal': ('settlements/kirstabal/dist/kirstabal.html', 'settlements/kirstabal', 'kit'),
    'thalaba': ('settlements/thalaba/dist/thalaba.html', 'settlements/thalaba', 'kit'),
    'thalaba-pieces': ('settlements/thalaba/dist/thalaba-pieces.html', 'settlements/thalaba', 'kit'),
    'lightwall': ('settlements/lightwall/dist/lightwall.html', 'settlements/lightwall', 'kit'),
    'qiblai': ('settlements/qiblai/dist/qiblai.html', 'settlements/qiblai', 'kit'),
    'strongwall': ('settlements/strongwall/dist/strongwall.html', 'settlements/strongwall', 'kit'),
    'flashing-eye': ('settlements/flashing-eye/dist/flashing-eye.html', 'settlements/flashing-eye', 'kit'),
    'viridian': ('settlements/viridian/dist/viridian.html', 'settlements/viridian', 'kit'),
    'viridian-sheet': ('settlements/viridian/dist/viridian-sheet.html', 'settlements/viridian', 'kit'),
    'azure-dream': ('settlements/azure-dream/dist/azure-dream.html', 'settlements/azure-dream', 'kit'),
    'azure-dream-summit': ('settlements/azure-dream/dist/azure-dream-summit.html', 'settlements/azure-dream', 'kit'),
    'azure-dream-west-end': ('settlements/azure-dream/dist/azure-dream-west-end.html', 'settlements/azure-dream', 'kit'),
    'azure-dream-north-shore': ('settlements/azure-dream/dist/azure-dream-north-shore.html', 'settlements/azure-dream', 'kit'),
    'azure-dream-east-end': ('settlements/azure-dream/dist/azure-dream-east-end.html', 'settlements/azure-dream', 'kit'),
    'xanadu-lake-shore': ('openworld/xanadu-lake-shore/dist/xanadu-lake-shore.html', 'openworld/xanadu-lake-shore', 'world'),
    'xanadu-north-shore': ('openworld/xanadu-north-shore/dist/xanadu-north-shore.html', 'openworld/xanadu-north-shore', 'world'),
    'xanadu-oidong-highrift': ('openworld/xanadu-oidong-highrift/dist/xanadu-oidong-highrift.html', 'openworld/xanadu-oidong-highrift', 'world'),
}
MAX_VIEWS = int(os.environ.get('XS0_VIEWS', '8'))
QUERY = os.environ.get('XS0_QUERY', '')

# every packed family the page carries: KMAT.packs (inline) and KMAT_SIDE (sidecars), by data URL
FAMS_JS = "()=>{" + H.FIND_JS + r"""
 const {sc}=__kfind(); const urls=new Map(); const fams={};
 const reg=(src,build,P)=>{ if(!P) return; for(const fam in P){ const e=P[fam]; if(!e||typeof e!=='object') continue;
   const k=build+'|'+fam; if(!fams[k]) fams[k]={build,fam,lib:e.lib||null,specular:e.specular==null?null:e.specular,card:!!e.card,
     metal:e.metal||0,size:e.size||null,height:!!e.height,src,slots:{},onScene:{},alphaTest:0,transparent:false,mats:0,decoded:false};
   for(const s of ['map','normalMap','roughnessMap','nrcMap']) if(typeof e[s]==='string'&&e[s].startsWith('data:')){ urls.set(e[s],[k,s]); fams[k].slots[s]=e[s].length; } } };
 try{ if(window.KMAT&&KMAT.packs) for(const b in KMAT.packs) reg('pack',b,KMAT.packs[b]); }catch(e){}
 try{ if(window.KMAT_SIDE) for(const b in KMAT_SIDE) reg('side',b,KMAT_SIDE[b]); }catch(e){}
 const dec=window.__xs0img||new Set(); for(const u of dec){ const h=urls.get(u); if(h) fams[h[0]].decoded=true; }
 let texOn=0, texPacked=0; const seenT=new Set(), seenM=new Set();
 const look=(t,m,slot)=>{ if(!t||!t.isTexture) return; const im=t.image; const src=im&&im.src; if(!seenT.has(t)){ seenT.add(t); texOn++; }
   const h=src&&urls.get(src); if(!h) return; const F=fams[h[0]]; F.onScene[h[1]]=true; if(!seenM.has(m)){ seenM.add(m); F.mats++; }
   if(m.alphaTest>0) F.alphaTest=Math.max(F.alphaTest,m.alphaTest); if(m.transparent) F.transparent=true; texPacked++; };
 if(sc) sc.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);
   for(const m of ms){ for(const k in m){ let v; try{ v=m[k]; }catch(e){ continue; } if(v&&v.isTexture) look(v,m,k); }
     if(m.uniforms) for(const k in m.uniforms){ const v=m.uniforms[k]&&m.uniforms[k].value; if(v&&v.isTexture) look(v,m,k); else if(Array.isArray(v)) v.forEach(x=>look(x,m,k)); } } });
 const out=Object.values(fams).map(f=>{ f.drawn=Object.keys(f.onScene).length>0; return f; });
 return {fams:out, texOnScene:texOn, packedTexOnScene:texPacked, decodedImages:dec.size}; }"""
IMG_TRACK_JS = """(()=>{ window.__xs0img=new Set(); const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 if(!d||!d.set) return; const prev=d.set; Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,
 set(v){ try{ if(typeof v==='string'&&v.startsWith('data:image')) window.__xs0img.add(v); }catch(e){} return prev.call(this,v); }}); })();"""
RINFO_JS = "()=>{" + H.FIND_JS + r"""
 let R=null; try{ R=(typeof renderer!=='undefined'&&renderer)||window.renderer||(window._api&&window._api.renderer)||(window.HOST&&HOST.renderer); }catch(e){}
 if(!R) return null; const gl=R.getContext(); const i=R.info;
 return {calls:i.render.calls, tris:i.render.triangles, gpuTextures:i.memory.textures, gpuGeometries:i.memory.geometries,
   programs:(i.programs||[]).length, units:gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), combined:gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
   vunits:gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS), maxTex:gl.getParameter(gl.MAX_TEXTURE_SIZE),
   shadow:!!(R.shadowMap&&R.shadowMap.enabled), webgl2:(typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext)}; }"""
COMPILE_JS = "()=>{" + H.FIND_JS + r"""
 let R=null; try{ R=(typeof renderer!=='undefined'&&renderer)||window.renderer||(window._api&&window._api.renderer)||(window.HOST&&HOST.renderer); }catch(e){}
 const {sc,cam}=__kfind(); if(!R||!sc||!cam) return 'no renderer/scene/camera'; const t=performance.now();
 try{ R.compile(sc,cam); }catch(e){ return 'compile threw: '+String(e).slice(0,160); } return 'compiled in '+Math.round(performance.now()-t)+' ms'; }"""
# every program's sampler uniforms (not only the top five): what stacks up
ALLPROG_JS = H.SAMPLERS_JS.replace("top:out.slice(0,5)", "top:out.slice(0,12)")
TEXWAIT_JS = "()=>!(window._texPending>0)"


async def frames(pg, n=3):
    await pg.evaluate("(n)=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else requestAnimationFrame(f)};requestAnimationFrame(f);})", n)


async def read(pg, tag):
    s = await pg.evaluate(ALLPROG_JS)
    v = await pg.evaluate(H.VRAM_JS)
    r = await pg.evaluate(RINFO_JS)
    return {'at': tag, 'samplers_max': s['max'] if s else None, 'programs': s['programs'] if s else None,
            'top': s['top'] if s else [], 'vram': v, 'rinfo': r}


def sidecars(html):
    s = open(html, encoding='utf-8', errors='replace').read(400000) + open(html, encoding='utf-8', errors='replace').read()[-200000:]
    out = []
    for m in re.finditer(r'<script src="([^"/:]+\.js)"', s):
        p = os.path.join(os.path.dirname(html), m.group(1))
        if os.path.isfile(p) and p not in out:
            out.append(p)
    return out


async def measure(browser, pid):
    rel, here, kind = PAGES[pid]
    html = os.path.join(ROOT, rel)
    t0 = time.time()
    rec = {'query': QUERY, 'id': pid, 'page': rel, 'kind': kind, 'bytes': os.path.getsize(html),
           'sidecars': {os.path.relpath(p, ROOT): os.path.getsize(p) for p in sidecars(html)}, 'reads': [], 'views': []}
    with H.serve(os.path.dirname(html)) as port:
        # open_page with our image tracker added before the page's scripts
        W, Hh = 1280, 800
        pg = await browser.new_page(viewport={'width': W, 'height': Hh})
        pg.set_default_timeout(900000)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        H.watch_console(pg)
        await pg.add_init_script(H.IMG_HOOK_JS)
        await pg.add_init_script(IMG_TRACK_JS)
        await H.route_three(pg, os.path.dirname(html), os.path.join(ROOT, here))
        await pg.goto('http://127.0.0.1:%d/%s%s' % (port, os.path.basename(html), QUERY), timeout=H.LOAD_MS)
        ready = True
        try:
            await pg.wait_for_function(WORLD_READY if kind == 'world' else H.READY_JS, timeout=900000, polling=1000)
        except Exception:
            ready = False
        rec['ready'] = ready
        rec['load_s'] = round(time.time() - t0, 1)
        if kind == 'world':
            try:
                rec['settle'] = await pg.evaluate('_api.settle(240000)')
            except Exception as e:
                rec['settle'] = 'failed: ' + str(e)[:200]
        try:
            await pg.wait_for_function(TEXWAIT_JS, timeout=180000, polling=500)
        except Exception:
            rec['texPendingTimeout'] = True
        await frames(pg, 3)
        rec['reads'].append(await read(pg, 'as loaded'))
        rec['families_loaded'] = await pg.evaluate(FAMS_JS)
        rec['shadow_state'] = await pg.evaluate("()=>{try{const R=(typeof renderer!=='undefined'&&renderer)||window.renderer||(window._api&&_api.renderer)||(window.HOST&&HOST.renderer);let n=0;const {sc}=(()=>{"+H.FIND_JS+" return __kfind();})();if(sc)sc.traverse(o=>{if(o.isLight&&o.castShadow)n++;});return {enabled:!!(R&&R.shadowMap.enabled),casting:n,kshadow:typeof KSHADOW!=='undefined',khorizon:typeof KHORIZON!=='undefined'};}catch(e){return String(e).slice(0,120);}}")
        rec['compile'] = await pg.evaluate(COMPILE_JS)
        await frames(pg, 2)
        rec['reads'].append(await read(pg, 'after renderer.compile'))
        # views
        if kind == 'world':
            try:
                names = await pg.evaluate('_api.views()')
            except Exception:
                names = []
        else:
            names = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
        rec['views_available'] = len(names)
        pick = [] if MAX_VIEWS <= 0 else names if len(names) <= MAX_VIEWS else [names[0]] if MAX_VIEWS == 1 else [names[round(i * (len(names) - 1) / (MAX_VIEWS - 1))] for i in range(MAX_VIEWS)]
        for v in pick:
            tv = time.time()
            try:
                if kind == 'world':
                    i = int(v.split(':')[0])
                    await pg.evaluate('(i)=>_api.go(i)', i)
                    await pg.evaluate('_api.settle(180000)')
                else:
                    ok = await pg.evaluate("(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}", v)
                    if not ok:
                        raise RuntimeError('no such preset')
                    await pg.wait_for_timeout(1500)
                try:
                    await pg.wait_for_function(TEXWAIT_JS, timeout=120000, polling=500)
                except Exception:
                    pass
                await frames(pg, 3)
                r = await read(pg, 'view ' + v)
                r['s'] = round(time.time() - tv, 1)
                r['top'] = r['top'][:3]
                rec['views'].append(r)
                print('  %s / %-40s samplers %s  vram %s MB  calls %s' % (pid, v[:40], r['samplers_max'],
                      (r['vram'] or {}).get('totalMB'), (r['rinfo'] or {}).get('calls')), flush=True)
            except Exception as e:
                rec['views'].append({'at': 'view ' + v, 'error': str(e)[:300]})
        rec['families_end'] = await pg.evaluate(FAMS_JS)
        rec['final'] = await read(pg, 'end of run')
        rec['errs'] = errs[:10]
        rec['gl_errors'] = H.gl_errors(getattr(pg, 'krator_console', []))[:10]
        rec['img_errors'] = await pg.evaluate('(window.__kimgErr||[]).slice(0,8)')
        try:
            rec['panel'] = (await pg.evaluate("()=>{const e=document.getElementById('errs');return e?e.textContent.slice(0,600):null}"))
        except Exception:
            rec['panel'] = None
        await pg.close()
    rec['total_s'] = round(time.time() - t0, 1)
    return rec


async def main(out, ids):
    from playwright.async_api import async_playwright
    res = json.load(open(out)) if os.path.isfile(out) else {}
    async with async_playwright() as p:
        b = await H.launch_chromium(p)
        rn = None
        for pid in ids:
            print('== %s' % pid, flush=True)
            try:
                rec = await measure(b, pid)
            except Exception as e:
                rec = {'query': QUERY, 'id': pid, 'page': PAGES[pid][0], 'error': str(e)[:600]}
                try:
                    await b.close()
                except Exception:
                    pass
                b = await H.launch_chromium(p)
            if rn is None:
                try:
                    pg = await b.new_page(); rn = await pg.evaluate(H.RENDERER_JS); await pg.close()
                except Exception:
                    rn = '?'
            rec['renderer'] = rn
            res[pid] = rec
            json.dump(res, open(out, 'w'), indent=1)
            fin = rec.get('final') or {}
            print('== %s done: samplers %s, vram %s MB, %s s' % (pid, fin.get('samplers_max'), (fin.get('vram') or {}).get('totalMB'), rec.get('total_s')), flush=True)
        await b.close()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2:]))
