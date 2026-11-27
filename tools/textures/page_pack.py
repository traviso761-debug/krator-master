#!/usr/bin/env python3
"""Per-page library packs: a page carries only the families it draws (settlements/xanadu/XS1-CLASSES.md, "Fixes after XS0").

OPT-IN, off by default: no committed page changes until Stage 8 switches it on (the owner, 2026-11-22: data now, looks
after; TODO.md, "Ride along with the next all-builds rebuild"). Today every page built on Xanadu's page ships the whole
48-family Xanadu pack (xanadu.tex.xanadu.js + -2.js, 13.86 + 5.16 MiB) and, inline, the whole Vale biome pack
(xanadu-bio, 41 families, about 6 MB of base64), whatever it draws.

THE DATA. A page's lists live in a pages file (settlements/xanadu/page-packs.json for the pages Xanadu's build makes),
keyed by the page's repo path:
    "settlements/thalaba/dist/thalaba.html": {
      "packs":  {"xanadu": [families], "xanadu-bio": [], ...},    the families the page keeps, per pack key
      "record": {"decoded": {...}, "drawn": {...}, "views": [...], "renderer": ..., "at": ...}   what a run of the page used
    }
A pack key the page has no list for is carried whole. `record` writes both from a run of the page (below): `packs` is
`decoded` (every family whose image the page created: bound to a material, composited, or read) over the load,
renderer.compile of the whole scene and every preset view. `drawn` (bound to a material in the scene) is kept for the report.

THE CHECK (at build time, when on): the page's pack must hold every family it uses, or the build stops:
  - every family the record saw decoded or drawn;
  - every family the page's OWN fragments name (its kit's src/ and its target's, not Xanadu's shared src, which the record
    covers): MAT.<fam>, MAT['<fam>'], kput('<fam>', KMAT.packed('<key>', '<fam>'));
  - no listed family missing from the pack, and a record present (a list with no run behind it is refused).

    python3 tools/textures/page_pack.py record settlements/thalaba/dist/thalaba.html [--pages <file>] [--queries ?interiors=1]
                                                         # run it (as shipped, then once per query), write its lists
    python3 tools/textures/page_pack.py show [--pages <file>]                                            # each page's lists and savings

The build side (settlements/xanadu/build.py, `--page-packs`): page_pack.Page(page, own_files).exclude(key, pack_dir) gives
matlib_pack.fragment its `exclude`, and the page's sidecars are named after the page (thalaba.tex.xanadu.js), since two pages
of one dist/ may now carry different families. tools/textures/pack.py --page packs one page's families of a build alone.
"""
import io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PAGES = os.path.join(ROOT, 'settlements', 'xanadu', 'page-packs.json')


def rel(p):
    return os.path.relpath(os.path.abspath(p), ROOT).replace(os.sep, '/')


def load(path=None):
    path = path or PAGES
    if not os.path.isfile(path):
        return {'pages': {}}
    with io.open(path, encoding='utf-8') as fh:
        return json.load(fh)


def save(doc, path=None):
    with io.open(path or PAGES, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(doc, indent=1, sort_keys=True, ensure_ascii=False) + '\n')


def pack_families(pack_dir):
    pj = os.path.join(pack_dir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return []
    with io.open(pj, encoding='utf-8') as fh:
        return sorted(json.load(fh).get('families', {}))


def refs_in(text, key, fams):
    """The families of pack `key` a fragment names: MAT.<f>, MAT['<f>'], kput('<f>', KMAT.packed('<key>', '<f>'))."""
    out = set()
    for f in fams:
        e = re.escape(f)
        pats = [r"KMAT\.packed\(\s*['\"]%s['\"]\s*,\s*['\"]%s['\"]" % (re.escape(key), e)]
        if key == 'xanadu' or not key.startswith('xanadu-'):   # bindMat packs: a family binds the MAT key of its name
            pats += [r"\bMAT\.%s\b" % e, r"\bMAT\[\s*['\"]%s['\"]\s*\]" % e, r"\bkput\(\s*['\"]%s['\"]" % e]
        if any(re.search(p, text) for p in pats):
            out.add(f)
    return out


def check(entry, key, fams, own_refs):
    """Errors: what the page uses that its pack for `key` would lack. `entry` is the page's row, `fams` the pack's
    families, `own_refs` the families the page's own fragments name."""
    keep = (entry.get('packs') or {}).get(key)
    if keep is None:
        return []
    errs = []
    rec = entry.get('record') or {}
    if not rec.get('decoded'):
        errs.append('%s: a family list with no record of a run behind it (page_pack.py record)' % key)
    unknown = sorted(set(keep) - set(fams))
    if unknown:
        errs.append('%s: listed but not in the pack: %s' % (key, ', '.join(unknown)))
    used = set((rec.get('decoded') or {}).get(key, [])) | set((rec.get('drawn') or {}).get(key, []))
    lack = sorted((used - set(keep)) & set(fams))
    if lack:
        errs.append('%s: the page drew or decoded %s, which its pack would lack' % (key, ', '.join(lack)))
    lack = sorted(set(own_refs) - set(keep))
    if lack:
        errs.append('%s: the page\'s own fragments name %s, which its pack would lack' % (key, ', '.join(lack)))
    return errs


class Page:
    """One page's per-page packs at build time. own_files: the page's own fragments (its kit's src/ and its target's)."""

    def __init__(self, page, own_files=(), pages=None):
        self.page = rel(page)
        self.doc = load(pages)
        self.entry = self.doc.get('pages', {}).get(self.page)
        self.own = []
        for p in own_files:
            with io.open(p, encoding='utf-8', errors='replace') as fh:
                self.own.append(fh.read())
        self.kept = {}

    def exclude(self, key, pack_dir):
        """The families of `key`'s pack (in pack_dir/tex) this page leaves out: () when it has no list for the key.
        Stops the build when the check fails."""
        if not self.entry or key not in (self.entry.get('packs') or {}):
            return ()
        fams = pack_families(pack_dir)
        refs = set()
        for t in self.own:
            refs |= refs_in(t, key, fams)
        errs = check(self.entry, key, fams, refs)
        if errs:
            raise SystemExit('page_pack: %s cannot carry a per-page pack:\n  ' % self.page + '\n  '.join(errs))
        keep = set(self.entry['packs'][key])
        self.kept[key] = (len(keep & set(fams)), len(fams))
        return tuple(f for f in fams if f not in keep)

    def sidecar_name(self):
        """Per-page sidecars: <page stem>.tex.js (two pages of one dist/ may carry different families)."""
        return os.path.splitext(os.path.basename(self.page))[0] + '.tex.js'


# ---- record: run the page, note what it uses ----
TRACK_JS = r"""(()=>{ window.__ppImg=new Set(); const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 if(!d||!d.set) return; const prev=d.set; Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,
 set(v){ try{ if(typeof v==='string'&&v.startsWith('data:image')) window.__ppImg.add(v); }catch(e){} return prev.call(this,v); }}); })();"""


def fams_js(find_js):
    return "()=>{" + find_js + r"""
 const {sc}=__kfind(); const urls=new Map(); const all={};
 const reg=(build,P)=>{ if(!P) return; for(const fam in P){ const e=P[fam]; if(!e||typeof e!=='object') continue;
   (all[build]=all[build]||{})[fam]=1;
   for(const s of ['map','normalMap','roughnessMap','nrcMap']) if(typeof e[s]==='string'&&e[s].startsWith('data:')) urls.set(e[s],[build,fam]); } };
 try{ if(window.KMAT&&KMAT.packs) for(const b in KMAT.packs) reg(b,KMAT.packs[b]); }catch(e){}
 try{ if(window.KMAT_SIDE) for(const b in KMAT_SIDE) reg(b,KMAT_SIDE[b]); }catch(e){}
 const dec={}, drawn={}; const add=(o,h)=>{ (o[h[0]]=o[h[0]]||{})[h[1]]=1; };
 for(const u of (window.__ppImg||[])){ const h=urls.get(u); if(h) add(dec,h); }
 const look=t=>{ if(!t||!t.isTexture) return; const im=t.image; const h=im&&im.src&&urls.get(im.src); if(h) add(drawn,h); };
 if(sc) sc.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);
   for(const m of ms){ for(const k in m){ let v; try{ v=m[k]; }catch(e){ continue; } if(v&&v.isTexture) look(v); }
     if(m.uniforms) for(const k in m.uniforms){ const v=m.uniforms[k]&&m.uniforms[k].value; if(v&&v.isTexture) look(v); else if(Array.isArray(v)) v.forEach(look); } } });
 const ks=o=>{ const r={}; for(const b in o) r[b]=Object.keys(o[b]).sort(); return r; };
 return {all:ks(all), decoded:ks(dec), drawn:ks(drawn)}; }"""


COMPILE_JS = r"""()=>{ let R=null; try{ R=(typeof renderer!=='undefined'&&renderer)||window.renderer||(window._api&&window._api.renderer); }catch(e){}
 const f=(()=>{ %s return __kfind(); })(); if(!R||!f.sc||!f.cam) return 'no renderer'; try{ R.compile(f.sc,f.cam); return 'compiled'; }catch(e){ return 'compile threw '+e; } }"""


async def _record(html, query='', settle_ms=1500):
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import harness as H
    import tempfile
    from playwright.async_api import async_playwright
    tf = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
    tf.write(TRACK_JS)
    tf.close()
    FJ = fams_js(H.FIND_JS)
    union = lambda a, b: {k: sorted(set(a.get(k, [])) | set(b.get(k, []))) for k in set(a) | set(b)}
    out = {'views': [], 'decoded': {}, 'drawn': {}}
    try:
        async with async_playwright() as p:
            b = await H.launch_chromium(p)
            with H.serve(os.path.dirname(os.path.abspath(html))) as port:
                pg, errs, ready = await H.open_page(b, html, port, init=[tf.name], query=query)
                if not ready:
                    raise SystemExit('page_pack record: %s never became ready: %s' % (rel(html), errs[:3]))
                out['renderer'] = await pg.evaluate(H.RENDERER_JS)
                await pg.wait_for_function("()=>!(window._texPending>0)", timeout=180000, polling=500)
                r = await pg.evaluate(FJ)
                out['all'] = r['all']
                out['decoded'], out['drawn'] = r['decoded'], r['drawn']
                out['compile'] = await pg.evaluate(COMPILE_JS % H.FIND_JS)
                names = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
                for v in names:
                    await pg.evaluate("(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(b)b.click();}", v)
                    await pg.wait_for_timeout(settle_ms)
                    try:
                        await pg.wait_for_function("()=>!(window._texPending>0)", timeout=120000, polling=500)
                    except Exception:
                        pass
                    r = await pg.evaluate(FJ)
                    out['decoded'], out['drawn'] = union(out['decoded'], r['decoded']), union(out['drawn'], r['drawn'])
                    out['views'].append(v)
                    print('  view %-50s decoded %s' % (v[:50], {k: len(x) for k, x in sorted(out['decoded'].items())}), flush=True)
                out['errors'] = errs[:5]
                await pg.close()
            await b.close()
    finally:
        os.unlink(tf.name)
    return out


def record(html, pages=None, queries=('',)):
    """Run the page once per query ('' first: as shipped; '?interiors=1' for a page whose walk-in mode builds more) and
    keep the union of what the runs used."""
    import asyncio, datetime
    r = None
    for q in queries:
        print('  run %s' % (q or '(as shipped)'), flush=True)
        x = asyncio.run(_record(html, q))
        if r is None:
            r = x
            r['views'] = [(q + ' ' if q else '') + v for v in x['views']]
            continue
        u = lambda a, b: {k: sorted(set(a.get(k, [])) | set(b.get(k, []))) for k in set(a) | set(b)}
        r['decoded'], r['drawn'], r['all'] = u(r['decoded'], x['decoded']), u(r['drawn'], x['drawn']), u(r['all'], x['all'])
        r['views'] += [q + ' ' + v for v in x['views']]
    doc = load(pages)
    doc.setdefault('what', 'per-page library packs (tools/textures/page_pack.py): per page, the families of each pack it '
                           'keeps, and the run they were derived from. Read only when the build is run with --page-packs '
                           '(opt-in until Stage 8: TODO.md, "Ride along with the next all-builds rebuild").')
    rows = doc.setdefault('pages', {})
    packs = {k: sorted(set(r['decoded'].get(k, [])) | set(r['drawn'].get(k, []))) for k in r['all']}
    rows[rel(html)] = {'packs': packs, 'record': {
        'at': datetime.date.today().isoformat(), 'renderer': r.get('renderer'), 'views': r['views'], 'compile': r.get('compile'),
        'decoded': r['decoded'], 'drawn': r['drawn'], 'carried': {k: len(v) for k, v in r['all'].items()}, 'errors': r.get('errors')}}
    save(doc, pages)
    for k in sorted(r['all']):
        print('%-22s keeps %3d of %3d (drawn %d)' % (k, len(packs[k]), len(r['all'][k]), len(r['drawn'].get(k, []))))
    return rows[rel(html)]


def main(argv):
    pages = argv[argv.index('--pages') + 1] if '--pages' in argv else None
    qs = argv[argv.index('--queries') + 1] if '--queries' in argv else None
    args = [a for a in argv if not a.startswith('--') and a not in (pages, qs)]
    if args and args[0] == 'record':
        for h in args[1:]:
            print('== ' + rel(h))
            record(os.path.join(ROOT, h) if not os.path.isabs(h) else h, pages, [''] + [q for q in (qs or '').split(',') if q])
        return 0
    if args and args[0] == 'show':
        for pg, e in sorted(load(pages).get('pages', {}).items()):
            c = (e.get('record') or {}).get('carried', {})
            print('%s: %s' % (pg, ', '.join('%s %d/%s' % (k, len(v), c.get(k, '?')) for k, v in sorted(e.get('packs', {}).items()))))
        return 0
    print(__doc__)
    return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
