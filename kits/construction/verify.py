#!/usr/bin/env python3
"""Headless check for the Construction kit's sheet (dist/construction.html).

  python3 verify.py dist/construction.html [--assert] [--views "The sheet|xanadu"] [--all-views] [--eval "()=>..."]
                                           [--out shots] [--size 1280x800]

On the shared harness (tools/harness.py: Chromium, the local three.js, the universal asserts after the kit's own). Waits for
window._ready and the library textures (window._texPending), prints the error panel, and with --assert checks:
  pieces        every row's kit piece was built and flattened (ISK, IZV, XAK), no sheet errors
  stages        every stage draws what it says: cleared shows the plot and every pile and no piece and no scaffold; footing,
                frame, infill and roof show a growing share of the piece with the scaffold up; built shows the whole piece and
                nothing of the site; the share grows left to right in every row
  piles         the piles shrink and go as the work goes on: none is gone before the roof, all are gone once built
  floats        nothing floats: every visible site mesh rests on the ground or on another site mesh under it (3 cm), and
                each piece starts at the ground
  zfight        no two of a site's axis-aligned boxes share a face plane facing the same way over an area
  deterministic the same record twice gives the same site, the same piece and the same build order (each row)
  tags          every site, pile and scaffold is a core/tags record, the vocabulary clean, a culture on each
  library       the kit's families are bound (KCONS.libMats through KMAT.bindMat) and Xanadu's maps bound (XAK.bind)
Each check has its negative in the same run (a check that cannot fail is not a check): a moved pile must float, two
boxes put on one plane must fight, a changed bill must change the site's signature.
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

ASSERT_JS = r"""()=>{const A=window._api,R=[],ok=(name,pass,detail)=>R.push({name,ok:!!pass,detail:String(detail)});
 const rows=A.rows(),errs=A.errors();
 ok('pieces',rows.every(r=>r.parts>0&&r.F)&&!errs.length,rows.map(r=>r.id+' '+r.key+' '+r.parts+' parts, '+r.box.w.toFixed(1)+' x '+r.box.d.toFixed(1)+' x '+r.box.h.toFixed(1)+' m').join('; ')+(errs.length?' | '+errs.join('; '):''));
 const C=A.cells(),E=[];const by={};C.forEach(c=>(by[c.row]=by[c.row]||[]).push(c));
 for(const c of C){const sh=c.all?c.drawn/c.all:0,piles=Object.values(c.piles);
  if(c.stage==='cleared'){if(c.drawn>0||c.scaffold||!c.plot||!piles.every(Boolean))E.push(c.row+'/cleared: drawn '+c.drawn+', scaffold '+c.scaffold+', plot '+c.plot);}
  else if(c.stage==='built'){if(sh<1||c.scaffold||c.plot||piles.some(Boolean))E.push(c.row+'/built: share '+sh.toFixed(3)+', scaffold '+c.scaffold+', plot '+c.plot);}
  else{if(!(sh>0&&sh<1)||!c.scaffold||!c.plot)E.push(c.row+'/'+c.stage+': share '+sh.toFixed(3)+', scaffold '+c.scaffold+', plot '+c.plot);}}
 for(const r in by){const s=by[r].map(c=>c.drawn);if(!s.every((v,i)=>!i||v>s[i-1]))E.push(r+': the share does not grow left to right '+s.join(' '));}
 ok('stages',!E.length,E.length?E.join(' | '):C.length+' cells, '+Object.keys(by).length+' rows: '+Object.keys(by).map(r=>r+' '+by[r].map(c=>(c.all?100*c.drawn/c.all:0).toFixed(0)+'%').join(' ')).join('; '));
 {const P=[];for(const c of C){const n=Object.values(c.piles).filter(Boolean).length,all=Object.keys(c.piles).length;
   if(c.stage!=='built'&&c.stage!=='roof'&&n!==all)P.push(c.row+'/'+c.stage+' '+n+' of '+all);if(c.stage==='built'&&n)P.push(c.row+'/built still has '+n);}
  ok('piles',!P.length,P.length?P.join(' | '):'every pile on site until the roof, none once built');}
 const F=A.floats();ok('floats',F.n>0&&!F.bad.length,F.bad.length?F.bad.length+' of '+F.n+': '+F.bad.slice(0,6).join(' | '):F.n+' site meshes, each on the ground or on another');
 {const c=CONS_SHEET.CELLS.find(q=>q.stage==='frame'),P=Object.values(c.S.parts.piles)[0],y0=P.position.y;P.position.y+=0.5;P.updateMatrixWorld(true);const n=A.floats().bad.length;P.position.y=y0;P.updateMatrixWorld(true);
  ok('floats (negative: a pile lifted half a metre floats)',n>0,n+' findings with the pile lifted');}
 const Z=A.zfight();ok('zfight',Z.n>0&&!Z.bad.length,Z.bad.length?Z.bad.length+': '+Z.bad.slice(0,5).join(' | '):Z.n+' boxes, no shared face planes');
 {const c=CONS_SHEET.CELLS.find(q=>q.stage==='frame'),g=c.S.group,m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.1,0.5),CONS_SHEET.LIB.board);m.userData.cons='board';m.name='negative';m.position.set(0,0.05,0);
  g.children[0].add(m);g.updateMatrixWorld(true);const n=A.zfight().bad.length;g.children[0].remove(m);
  ok('zfight (negative: a board on the plot\'s plane fights it)',n>0,n+' findings with the board added');}
 const D=A.determinism();ok('deterministic',D.length===rows.length&&D.every(d=>d.ok),D.map(d=>d.row+' site '+d.site+' piece '+d.piece+' order '+d.order).join('; '));
 {const s=KCONS.site({w:8,d:6,h:5,bill:{timber:1}}),t=KCONS.site({w:8,d:6,h:5,bill:{stone:1}});let a=0,b=0;
  s.group.traverse(m=>{if(m.isMesh)a++;});t.group.traverse(m=>{if(m.isMesh)b++;});
  ok('deterministic (negative: a different bill is a different site)',a!==b,a+' meshes against '+b);}
 const T=A.tags(),au=T.audit;ok('tags',au.unknown===0&&au.missingCulture===0&&au.byClass.building===C.length&&au.byClass.prop>0&&au.byClass.part>0,
  T.records+' records ('+Object.entries(au.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+au.unknown+(au.unknown?' '+JSON.stringify(au.unknownValues)+JSON.stringify(au.unknownKeys):'')+', missing culture '+au.missingCulture);
 const L=A.lib(),nb=Object.keys(L.bound||{}).length,nx=L.xak?Object.keys(L.xak).filter(k=>L.xak[k]).length:0;
 ok('library',nb>=10&&nx>0,nb+' kit materials bound ('+Object.entries(L.bound||{}).map(e=>e.join(' ')).join(', ')+'); Xanadu '+nx+' bound');
 return R;}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with _h.verify_page(a.html, here=HERE, size=a.size, settle_ms=500) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=180000)
        except Exception:
            print('textures still decoding after 180 s')
        e = await pg.evaluate("(document.getElementById('errs')||{}).textContent||''")
        print('ERROR PANEL:', e.strip() or '(clean)')
        if e.strip() or V.errs:
            fails.append('error panel or page errors')
            for x in V.errs[:8]:
                print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS  ' if r['ok'] else 'FAIL  ') + r['name'] + '  (' + r['detail'][:900] + ')')
                if not r['ok']:
                    fails.append(r['name'])
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:8000])
        names = await pg.evaluate("Object.keys((KHOST.host||{}).views||{})")
        views = names if a.all_views else _h.parse_views(a.views, names) if a.views else []
        for i, vn in enumerate(views):
            await pg.evaluate("n=>KHOST.go(n)", vn)
            await pg.wait_for_timeout(1200)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots')); ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
