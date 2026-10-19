#!/usr/bin/env python3
"""A geometry fingerprint of a built page: proof that a refactor moved nothing when the page's bytes must move.

The hash baseline (tools/port_baseline.py) proves a page unchanged only when its source text is unchanged: a refactor
that moves code (kits/beast-riders' ports split Girder's and Mav's Refuge's builders into per-building functions)
changes the page's bytes however faithful it is. This loads the page headless (tools/harness.py), waits until the world
is built, and hashes what the page DREW: every mesh under window.scene (its geometry's attributes and index, an
InstancedMesh's instance matrices and colours, its material's type and family), in scene order, plus the page's own
probes (window._api's records, window._arch, window._furniture...). Two pages whose fingerprints agree drew the same
world, vertex for vertex.

    python3 tools/scene_fingerprint.py settlements/girder/girder.html --out before.json
    python3 tools/scene_fingerprint.py settlements/girder/girder.html --compare before.json      # exit 1 on a difference

Anything animated (flyers, life) changes between frames: objects whose hash differs between two samples taken a second
apart in the SAME load are reported as `moving` and left out of the comparison (their geometry hash, which does not
move, is kept).
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import harness

FP_JS = r"""(probes)=>{
 function h32(arr){ if(!arr) return 0; let u;
   if(arr.buffer) u=new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength); else u=new TextEncoder().encode(JSON.stringify(arr));
   let h=0x811c9dc5; for(let i=0;i<u.length;i++){ h^=u[i]; h=Math.imul(h,16777619)>>>0; } return h>>>0; }
 function hs(s){ return h32(new TextEncoder().encode(s)); }
 const out=[]; const sc=window.scene; if(!sc) return {err:'no window.scene'};
 sc.updateMatrixWorld(true);
 let n=0;
 sc.traverse(o=>{
   const path=[]; for(let p=o;p&&p!==sc;p=p.parent) path.unshift((p.name||p.type)+'#'+(p.parent?p.parent.children.indexOf(p):0));
   const e={path:path.join('/'), type:o.type, i:n++};
   for(let p=o;p&&p!==sc;p=p.parent){ const u=p.userData||{}; if(u.kit) e.ud='kit'; else if(u.merged) e.ud='merged';
     else if(u.inspectLabel==='Furniture (catalog)'||/^furniture/i.test(p.name||'')) e.ud=e.ud||'furniture'; }
   const g=o.geometry;
   if(g&&g.attributes){ const a={}; for(const k of Object.keys(g.attributes).sort()) a[k]=h32(g.attributes[k].array);
     if(g.index) a.index=h32(g.index.array); e.geo=hs(JSON.stringify(a)); e.verts=g.attributes.position?g.attributes.position.count:0; }
   if(o.isInstancedMesh){ e.count=o.count; e.inst=h32(o.instanceMatrix.array); if(o.instanceColor) e.icol=h32(o.instanceColor.array); }
   if(o.material){ const m=Array.isArray(o.material)?o.material:[o.material];
     e.mat=m.map(x=>x.type+':'+((x.userData&&(x.userData.fam||x.userData.family||x.userData.lib))||'')).join(','); }
   if(g||o.isLight||o.isPoints) { e.mw=h32(new Float32Array(o.matrixWorld.elements)); out.push(e); }
 });
 const pr={};
 for(const k of probes){ let v=window[k]; if(v===undefined) continue;
   try{ pr[k]=hs(JSON.stringify(v,(kk,vv)=>typeof vv==='function'?undefined:(vv&&vv.isObject3D?undefined:vv))); }catch(err){ pr[k]='unserialisable: '+err.message; } }
 if(window._api){ for(const k of Object.keys(window._api).sort()){ const v=window._api[k]; if(typeof v==='function') continue;
   try{ pr['_api.'+k]=hs(JSON.stringify(v,(kk,vv)=>typeof vv==='function'?undefined:(vv&&vv.isObject3D?undefined:(kk==='rid'?undefined:vv)))); }catch(err){ pr['_api.'+k]='unserialisable'; } } }
 return {objects:out, probes:pr};
}"""

FABRIC_PROBES = ('_arch', '_furniture', '_stats', '_struct', '_levels', '_lots', '_api.SITES', '_api.NL_LAMPS', '_api.NL_WINDOWS',
                 '_api.SLOTS', '_api.ROOSTS', '_api.STALLS', '_api.PLATS', '_api.PALISADE', '_api.GATES', '_api.HALL')
PROBES = ['_arch', '_furniture', '_stats', '_struct', '_levels', '_lots', '_interiors', '_materials', '_brook', '_trees', '_jungle']


async def take(page, query, wait):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await harness.launch_chromium(p)
        with harness.serve(ROOT) as port:
            pg, errs, ready = await harness.open_page(b, page, port, root=ROOT, query=query)
            await pg.wait_for_timeout(wait)
            a = await pg.evaluate(FP_JS, PROBES)
            await pg.wait_for_timeout(1200)
            c = await pg.evaluate(FP_JS, PROBES)
            panel = await pg.evaluate("()=>document.getElementById('errs')?document.getElementById('errs').textContent:''")
        await b.close()
    if 'err' in a:
        sys.exit('scene_fingerprint: ' + a['err'])
    moving = set()
    for x, y in zip(a['objects'], c['objects']):
        if x != y:
            moving.add(x['path'])
    objs = []
    for x in a['objects']:
        if x['path'] in moving:
            x = {k: v for k, v in x.items() if k in ('path', 'type', 'geo', 'verts', 'mat')}
            x['moving'] = True
        objs.append(x)
    return {'page': os.path.relpath(page, ROOT).replace(os.sep, '/'), 'query': query, 'ready': ready, 'errors': errs,
            'panel': panel, 'objects': objs, 'probes': a['probes']}


def unordered(objs):
    """the objects as a multiset of what they drew (type, geometry, instances, material), path and order left out: a
    page whose level-of-detail pass re-parents meshes as it runs (core/lod 97-lod-auto.js) orders them by timing"""
    keys = ('type', 'geo', 'verts', 'count', 'inst', 'icol', 'mat', 'ud')
    return sorted(json.dumps({k: o.get(k) for k in keys if not (o.get('moving') and k in ('inst', 'icol'))}, sort_keys=True) for o in objs)


def diff(a, b, order=True):
    out = []
    if not order:
        A, B = unordered(a['objects']), unordered(b['objects'])
        import collections
        ca, cb = collections.Counter(A), collections.Counter(B)
        out += ['only before: ' + k for k in sorted(ca - cb)] + ['only after: ' + k for k in sorted(cb - ca)]
        for k in sorted(set(a['probes']) | set(b['probes'])):
            if a['probes'].get(k) != b['probes'].get(k):
                out.append('probe %s: %s -> %s' % (k, a['probes'].get(k), b['probes'].get(k)))
        return out
    if len(a['objects']) != len(b['objects']):
        out.append('object count %d -> %d' % (len(a['objects']), len(b['objects'])))
    for x, y in zip(a['objects'], b['objects']):
        if x.get('moving') or y.get('moving'):
            x = {k: v for k, v in x.items() if k in ('path', 'type', 'geo', 'verts', 'mat')}
            y = {k: v for k, v in y.items() if k in ('path', 'type', 'geo', 'verts', 'mat')}
        if x != y:
            out.append('%s: %s' % (x.get('path'), ', '.join('%s %s -> %s' % (k, x.get(k), y.get(k)) for k in sorted(set(x) | set(y)) if x.get(k) != y.get(k))))
    for k in sorted(set(a['probes']) | set(b['probes'])):
        if a['probes'].get(k) != b['probes'].get(k):
            out.append('probe %s: %s -> %s' % (k, a['probes'].get(k), b['probes'].get(k)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('page')
    ap.add_argument('--out')
    ap.add_argument('--compare')
    ap.add_argument('--query', default='')
    ap.add_argument('--wait', type=int, default=3000)
    ap.add_argument('--unordered', action='store_true', help='compare what was drawn, not where in the scene graph or in what order')
    ap.add_argument('--select', choices=['all', 'fabric'], default='all',
                    help="fabric: only what the town's kit drew (its instanced and merged meshes, the catalog furniture batch) and "
                         "the probes of what was placed; a page that streams its interiors or trees in after load differs between "
                         "loads elsewhere")
    a = ap.parse_args()
    fp = asyncio.run(take(os.path.abspath(a.page), a.query, a.wait))
    if a.select == 'fabric':
        fp['objects'] = [o for o in fp['objects'] if o.get('ud')]
        fp['probes'] = {k: v for k, v in fp['probes'].items() if k in FABRIC_PROBES}
    fp['select'] = a.select
    print('%s: %d objects (%d moving), %d probes, ready %s, errors %d%s' % (
        fp['page'], len(fp['objects']), sum(1 for o in fp['objects'] if o.get('moving')), len(fp['probes']), fp['ready'],
        len(fp['errors']), ('  panel: ' + fp['panel'][:300]) if fp['panel'] else ''))
    if a.out:
        with open(a.out, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(fp, fh, indent=0, sort_keys=True)
    if a.compare:
        ref = json.load(open(a.compare, encoding='utf-8'))
        d = diff(ref, fp, order=not a.unordered)
        if d:
            print('DIFFERENT (%d):' % len(d))
            for line in d[:60]:
                print('  ' + line)
            sys.exit(1)
        print('SAME: the page drew what %s drew' % a.compare)


if __name__ == '__main__':
    main()
