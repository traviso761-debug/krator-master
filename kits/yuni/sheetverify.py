#!/usr/bin/env python3
"""The Yuni-lineage kit sheets' verify (kits/yuni, kits/locus, kits/eastern-abyssal: each verify.py calls main()).

  python3 verify.py [dist/<kit>.html] [--assert] [--views "Whole sheet|..."] [--all-views] [--query "?interiors=1"]
                    [--eval "()=>..."] [--out shots] [--size 1280x800] [--no-cache]

On the shared harness (tools/harness.py verify_page: the browser, the local three.js, the server, the universal asserts:
a clean error panel and console, every texture decoded, no NaN geometry, the budget, the eyes). Waits for the library maps
to decode (window._texPending), prints the sheet's counters, runs the kit's asserts with --assert, and screenshots each
view. The asserts:
  every-asset-builds   every ASSET of the kit, each variant, is on the sheet and registered (SITES) with its core/tags
                       record (Yuni's fork: its FIX building, with a culture and types); every FURN piece too; no asset or
                       furniture error on the panel
  tags-vocabulary      KTAGS.page.audit(): no unknown key or value, no building missing its types, and none missing its
                       culture except one whose asset declares a culture core/tags does not know (counted, KNOWN_ISSUES.md)
  doors-kdoor          every door the kit draws is a KDOOR record (53-assets.js F.door / F.doorway), ids unique and keyed
                       by an asset; with no interiors planned every door onto a solid body is locked as built
  textures-library     the engine's families on the library (KMAT 'lib'), the town's pack loaded, every map decoded
  engine-read-in-place the manifest names the engine's files (from settlements/<town>/src) and the kit's src/ holds only
                       the kit's own files
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from harness import parse_views, verify_page

ASSERT_JS = r"""()=>{const A=window._api,R=[];if(!A||!A.SHEET_ITEMS)return [{name:'probe',ok:false,detail:'window._api has no sheet'}];
 const errs=(document.getElementById('errs')||{}).textContent||'';
 {const miss=[],untag=[];let want=0;
  A.ASSETS.forEach(a=>{want+=a.variants;const n=A.SHEET_ITEMS.filter(it=>it.key===a.key&&it.fam!=='furn').length;if(n!==a.variants)miss.push(a.key+' '+n+'/'+a.variants);});
  const top=A.SHEET_ITEMS.filter(it=>it.fam!=='furn');
  if(A.FIX)top.forEach(it=>{const b=it.bid&&A.FIX.byId[it.bid];if(!b||!b.culture||!(b.types&&b.types.length))untag.push(it.key+'#'+it.variant);});
  else top.forEach(it=>{const s=A.SITES.find(s=>s.kind==='asset'&&s.x===it.x&&s.z===it.z);const r=s&&s.rid&&A.tag(s.rid);if(!r)untag.push(it.key+'#'+it.variant);});
  const fm=A.FURNS.filter(f=>A.SHEET_ITEMS.filter(it=>it.fam==='furn'&&it.key===f.key).length!==f.variants).map(f=>f.key);
  const sites=new Set(A.SITES.filter(s=>s.kind==='asset').map(s=>s.x+','+s.z)),placed=top.filter(it=>sites.has(it.x+','+it.z)).length;
  const ae=/asset |no such asset|furniture |\.sub: no asset/.test(errs);
  R.push({name:'every-asset-builds',ok:!miss.length&&!untag.length&&!fm.length&&!ae&&placed===want&&top.length===want&&A.ASSETS.length>0,
   detail:(miss.length?'missing '+miss.join(', ')+'; ':'')+(untag.length?'no core/tags building '+untag.slice(0,6).join(', ')+'; ':'')+(fm.length?'furniture missing '+fm.join(', ')+'; ':'')+(ae?'asset errors on the panel; ':'')+
    A.ASSETS.length+' assets of kit '+A.kit+', '+want+' variants on the sheet ('+placed+' registered), '+A.FURNS.length+' FURN pieces; rows '+A.SHEET_ROWS.map(r=>r.fam+':'+r.items.length).join(' | ')});}
 {const T=A.tags(),a=T.audit,X=A.tagFix||{unknownCultures:{}},xc=Object.values(X.unknownCultures).reduce((s,n)=>s+n,0);
  R.push({name:'tags-vocabulary',ok:a.unknown===0&&a.missingCulture===xc&&(a.missingTypes||0)===0&&T.records>0,
   detail:T.records+' records ('+Object.entries(a.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+a.unknown+(a.unknown?' '+JSON.stringify(a.unknownValues)+JSON.stringify(a.unknownKeys):'')+', missing types '+(a.missingTypes||0)+
    (X.typed?' ('+X.typed+' typed from their assets)':'')+', missing culture '+a.missingCulture+(xc?' (each a culture core/tags does not know: '+JSON.stringify(X.unknownCultures)+'; KNOWN_ISSUES.md)':'')});}
 {const D=A.doors(),L=D.list,O=D.openings||{},bad=[],ids={};const keys=new Set(A.allKeys);
  if(A.FIX)A.FIX.doors.forEach(d=>{if(d._leaves&&d._leaves.length&&!d._kd)bad.push(d.id+' has leaves and no KDOOR record');});
  L.forEach(r=>{if(ids[r.id])bad.push('id twice '+r.id);ids[r.id]=1;if(!keys.has(r.id.split('.')[0]))bad.push(r.id+' not keyed by an asset');});
  if(!A.interiors)L.forEach(r=>{if(!r.locked)bad.push(r.id+' opens onto a solid body');});
  R.push({name:'doors-kdoor',ok:!bad.length&&L.length>0,detail:bad.length?bad.slice(0,8).join(' | '):L.length+' KDOOR records ('+L.filter(r=>r.locked).length+' locked'+(A.interiors?', interiors planned':', no interiors on the sheet: locked as built')+'), '+O.leaves+' leaves, '+O.panes+' panes, '+O.cards+' room cards, '+O.voids+' voids'+(A.FIX?'; '+A.FIX.doors.length+' FIX doors ('+O.opens+' openings with no leaf)':'')});}
 {const M=A.materials(),pend=window._texPending||0;R.push({name:'textures-library',ok:M.mode==='lib'&&M.lib.length>0&&pend===0,
   detail:'KMAT '+M.mode+', '+M.lib.length+' of '+M.families+' families on the library ('+M.lib.join(' ')+'), procedural '+M.proc.join(' ')+', pending '+pend});}
 return R;}"""


async def run(a, here, kit_files, engine):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=here, size=a.size, settle_ms=0, query=a.query or '') as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(600)
        e = (await pg.evaluate("(document.getElementById('errs')||{}).textContent||''")).strip()
        print('ERROR PANEL:', e or '(clean)')
        for k in ('_sheet', '_openings', '_stats', '_furniture'):
            print(k[1:] + ':', json.dumps(await pg.evaluate("window.%s||null" % k)))
        for k, t in [c for c in getattr(pg, 'krator_console', []) if c[0] in ('error', 'warning')][:8]:
            print('console %s: %s' % (k, t[:300]))
        if e:
            fails.append('error panel')
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:900])
                if not r['ok']:
                    fails.append('assert ' + r['name'])
            man = json.load(open(os.path.join(here, 'build-manifest.json'), encoding='utf-8'))
            eng = [f for f in engine if f in man]
            copied = sorted(f for f in os.listdir(os.path.join(here, 'src')) if f not in kit_files)
            ok = len(eng) == len(engine) and not copied
            print(('PASS ' if ok else 'FAIL ') + 'engine-read-in-place - ' +
                  ('%d engine files on the page, none in the kit (src/ holds its %d files only)' % (len(eng), len(kit_files)) if ok
                   else 'engine files on the page %s of %s; files in src/ that are not the kit\'s: %s' % (len(eng), len(engine), copied)))
            if not ok:
                fails.append('assert engine-read-in-place')
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        names = await pg.evaluate("_api.views()")
        views = names if a.all_views else parse_views(a.views or 'Whole sheet', names)
        for i, vn in enumerate(views):
            await pg.evaluate("n=>_api.go(n)", vn)
            await pg.wait_for_timeout(900)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)
        e2 = (await pg.evaluate("(document.getElementById('errs')||{}).textContent||''")).strip()
        if e2 and e2 != e:
            print('ERROR PANEL after views:', e2)
            fails.append('error panel after views')
    return V.exit()


def main(here, page, kit_files, engine):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=os.path.join(here, 'dist', page))
    ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--eval'); ap.add_argument('--query')
    ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800'); ap.add_argument('--no-cache', action='store_true')
    return asyncio.run(run(ap.parse_args(), here, kit_files, engine))
