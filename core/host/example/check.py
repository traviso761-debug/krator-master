#!/usr/bin/env python3
"""Headless checks of the core/host example (build.py first): every piece of the interface on a page, each check with a
negative, read from the page (tools/harness.py's launcher, the local three.js).

    python3 check.py            # 'all passed', exit 1 on a failure

The stocks panel (O): hidden until asked, then a row per good and item whose total is SIM.stocks()'s; an item opens its
flows and holders; a holder flies the camera there and opens its contents. The inspector: a click on the shed names it and
lists its store from SIM.contents; a click on the ground does not. The editor: a crate put down is one ADD op, a record and a
mesh; undo takes all three away. The cutaway: the shed at its loft sets the planes and shows the bar; off clears them.
Marks: a line's measured length. The minimap: drawn from the records. The pictures: drawn off screen.
"""
import asyncio, contextlib, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import launch_chromium, open_page, serve   # noqa: E402

PAGE = os.path.join(HERE, 'host-example.html')
bad = 0


def ok(name, cond, neg=False):
    global bad
    r = bool(cond) and not neg
    if not r:
        bad += 1
    print(('PASS  ' if r else 'FAIL  ') + name + (' (its negative passed)' if neg else ''))


async def main():
    from playwright.async_api import async_playwright
    with serve(HERE) as port:
        async with async_playwright() as p:
            b = await launch_chromium(p)
            pg, errs, ready = await open_page(b, PAGE, port)
            ok('the page is ready, no page error', ready and not errs, bool(errs))
            ev = pg.evaluate
            # ---- the stocks panel
            hidden = await ev("()=>getComputedStyle(document.getElementById('stocks')).display")
            await pg.keyboard.press('o')
            await pg.wait_for_timeout(300)
            shown = await ev("()=>getComputedStyle(document.getElementById('stocks')).display")
            ok('the stocks panel: hidden until O, shown after', hidden == 'none' and shown == 'block', shown == 'none')
            rows = await ev("""()=>{const S=SIM.stocks(),out={};document.querySelectorAll('#stk-body tr.it').forEach(tr=>{out[tr.dataset.k]=tr.children[1].textContent;});
              return {rows:out,corn:S.by.corn.total,order:S.order};}""")
            corn = rows['rows'].get('corn', '')
            ok('a row per good and item (%d), corn\'s total the simulation\'s (%s)' % (len(rows['rows']), rows['corn']),
               set(rows['order']) == set(rows['rows']) and corn.replace(',', '').startswith(str(round(rows['corn']))), not rows['rows'])
            det = await ev("""()=>{document.querySelector('#stk-body tr.it[data-k="corn"]').click();const d=document.querySelector('#stk-body td.det');
              return d?{text:d.textContent,holders:d.querySelectorAll('tr.hd').length}:null;}""")
            ok('an item opens its flows and its holders (%s)' % (det and det['holders']), det and 'the last day' in det['text'] and 'held by' in det['text'] and det['holders'] > 0, not det)
            go = await ev("""()=>{const tr=document.querySelector('#stk-body tr.hd');const id=tr.dataset.id;tr.click();const p=SIM.whereIs(id),t=KHOST.cam.ctl.target;
              return {id,d:Math.hypot(t.x-p.x,t.z-p.z),holds:document.getElementById('insp-holds').textContent};}""")
            ok('a holder flies the camera there and opens what it holds (%s)' % go['id'], go['d'] < 0.01 and len(go['holds']) > 5, go['d'] > 1)
            # ---- the inspector: a click on the shed, and on bare ground
            ins = await ev("""()=>{KHOST.go('The shed');KHOST.cam.apply();const v=new THREE.Vector3(40,5,30).project(camera),r=renderer.domElement.getBoundingClientRect();
              KHOST.inspectAt(r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height);const a={text:document.getElementById('insp-text').textContent,holds:document.getElementById('insp-holds').textContent,sel:KHOST.selected&&KHOST.selected.key};
              const g=new THREE.Vector3(-60,0,-40).project(camera);KHOST.inspectAt(r.left+(g.x+1)/2*r.width,r.top+(1-g.y)/2*r.height);
              return Object.assign(a,{ground:document.getElementById('insp-holds').textContent,gsel:KHOST.selected&&KHOST.selected.key});}""")
            ok('a click on the shed names it (core/tags) and lists its store (SIM.contents)', ins['sel'] == 'shed' and 'The shed' in ins['text'] and 'corn' in ins['holds'] and "settlement's store" in ins['holds'], ins['sel'] != 'shed')
            ok('a click on bare ground names no record and lists nothing', ins['gsel'] is None and ins['ground'] == '', bool(ins['gsel']))
            # ---- the editor: put a crate down, undo it
            ed = await ev("""()=>{const E=KHOST.edit;E.tool(true);E.item=KHOST.pictures.items[0];E.mode='place';const n0=KTAGS.page.records.filter(r=>!r.removed).length,c0=scene.children.length;
              const op=E.place([60,0,40]);const a={op:op&&op.op,ops:E.log.ops.length,recs:KTAGS.page.records.filter(r=>!r.removed).length-n0,meshes:scene.children.length-c0};
              E.undo();a.after={ops:E.log.ops.length,recs:KTAGS.page.records.filter(r=>!r.removed).length-n0,meshes:scene.children.length-c0};E.tool(false);return a;}""")
            ok('the editor: a crate put down is one ADD op, one record, one mesh', ed['op'] == 'ADD' and ed['ops'] == 1 and ed['recs'] == 1 and ed['meshes'] == 1, ed['ops'] != 1)
            ok('undo takes the op, the record and the mesh away', ed['after'] == {'ops': 0, 'recs': 0, 'meshes': 0}, ed['after']['ops'] != 0)
            # ---- the cutaway
            cut = await ev("""()=>{KHOST.cut.to('shed',1);const a={on:KHOST.cut.on,y:KHOST.cut.planes[0].constant,bar:getComputedStyle(document.getElementById('khost-cutbar')).display,
              clip:renderer.localClippingEnabled};KHOST.cut.off();a.off=KHOST.cut.planes[0].constant;a.offBar=getComputedStyle(document.getElementById('khost-cutbar')).display;return a;}""")
            ok('the cutaway: the shed at its loft cuts at 4.5 + 1.4 m and shows the bar; off moves the planes away', cut['on'] and abs(cut['y'] - 5.9) < 1e-6 and cut['bar'] == 'block' and cut['off'] > 1e6 and cut['offBar'] == 'none', not cut['on'])
            # ---- marks, the minimap, the pictures
            mk = await ev("""()=>{const M=KHOST.marks,m=M.add('line');m.pts.push([0,0,0],[30,0,40]);const L=M.measure(m).len;M.finish();const n=M.list.length;M.list.splice(M.list.indexOf(m),1);M.draw();return {L,n};}""")
            ok('marks: a line measures its length (50 m)', abs(mk['L'] - 50) < 1e-9 and mk['n'] >= 1, abs(mk['L'] - 50) > 1e-6)
            mm = await ev("()=>{const M=KHOST.minimap;return M?M.export().records.length:0;}")
            ok('the minimap: drawn from the records (%d)' % mm, mm >= 7, mm == 0)
            await ev("()=>KHOST.pictures.open()")
            await pg.wait_for_timeout(1500)
            pics = await ev("()=>Object.keys(KHOST.pictures.done).filter(k=>KHOST.pictures.done[k].startsWith('data:image')).length")
            ok('the pictures: each item drawn off screen (%d of 3)' % pics, pics == 3, pics == 0)
            err = await ev("()=>{const e=document.getElementById('errs');return e?e.textContent:''}")
            ok('the error panel is clean at the end', not err.strip() and not errs, bool(err.strip()))
            if err.strip():
                print(err[:2000])
            await b.close()
    print('all passed' if not bad else '%d FAILED' % bad)
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
