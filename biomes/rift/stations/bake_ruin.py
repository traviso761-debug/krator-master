#!/usr/bin/env python3
"""Bake an Ancients ruin (kits/ancients: a target's decayed site) into station 4's massing data fragment (PLAN-STATIONS.md,
station 4). The owner, 2026-10-27: first the Arcube ("good for massing"), then THE PILE (target arcpile, the Rift's ruin in place of
the Arcube, built on claude/upbeat-yalow-7b38ae), "and must be able to cover its lower decks in wild vegetation".

    python3 kits/ancients/build.py --target arcpile
    python3 biomes/rift/stations/bake_ruin.py [--page kits/ancients/dist/arcpile.html] [--site 1500] [--probe] [--cell 8]

It opens the page headless (tools/harness.py's launcher), takes every mesh of the RUINED site (a target builds its intact site at
x -s and the ruin at +s: its 89z-rows.js; the Pile's s is 1,500, the Arcube's 2,600) but its ground, in world space with each
surface's colour (material colour x instance colour x vertex colour), and decimates it by clustering vertices on a `cell`-metre grid (the
mean position and colour of each cell's vertices; triangles that collapse are dropped). The result, centred on the ruin's axis,
is written to stations/plateau/44c-host-ruin-data.js as RUIN_MASS = {cell, lo, hi, n, i16, pos, col, idx}: positions as 16-bit
steps over the box lo..hi, colours 8-bit, indices 16- or 32-bit, each base64. Deterministic: the target's build is, and the clustering is a pure function of it.
When the page publishes its ruin's roofs (the Pile: AP_SITE[1].roofs, `overgrow` on the base's, left bare for the Rift's flora), they
are written beside it as RUIN_ROOFS = [[x0, x1, z0, z1, y, overgrow], ...], in the same frame (all of them: the station needs the
blocks of the tier above to know which part of a roof is open sky).
--probe prints the site's meshes (name, kind, triangles, bounds) and writes nothing.
"""
import argparse, asyncio, base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness   # noqa: E402

PAGE = os.path.join(ROOT, 'kits', 'ancients', 'dist', 'arcpile.html')

# every visible mesh whose world box lies in the site's box and is under `span` metres across (the ground's planes and
# paint discs are wider), its triangles in world space, each vertex's colour; then the vertex clustering
TAKE_JS = r"""([site,span,cell,probe])=>{const T=THREE,S=scene,out=[],M=new T.Matrix4(),IM=new T.Matrix4(),v=new T.Vector3(),c=new T.Color(),ci=new T.Color();
 const box=new T.Box3();S.updateMatrixWorld(true);
 const meshes=[];S.traverse(o=>{if(!o.isMesh||!o.visible)return;let p=o;while(p){if(!p.visible)return;p=p.parent;}meshes.push(o);});
 const keep=[],info=[];
 for(const o of meshes){const g=o.geometry;if(!g||!g.attributes.position)continue;const m=Array.isArray(o.material)?o.material[0]:o.material;
  if(m&&(m.transparent&&m.opacity<.5||m.side===T.BackSide))continue;
  g.computeBoundingBox();const n=o.isInstancedMesh?o.count:1;let bb=new T.Box3();
  for(let k=0;k<n;k++){if(o.isInstancedMesh){o.getMatrixAt(k,IM);M.multiplyMatrices(o.matrixWorld,IM);}else M.copy(o.matrixWorld);box.copy(g.boundingBox).applyMatrix4(M);bb.union(box);}
  const cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2,w=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);
  if(Math.abs(cx-site[0])>site[2]||Math.abs(cz-site[1])>site[2])continue;
  const tris=(g.index?g.index.count:g.attributes.position.count)/3*n;
  info.push({name:o.name||'',inst:o.isInstancedMesh?n:0,tris,w:Math.round(w),y:[Math.round(bb.min.y),Math.round(bb.max.y)],mat:m&&m.type,big:w>span});
  if(w>span)continue;keep.push(o);}
 if(probe)return{info:info.sort((a,b)=>b.tris-a.tris).slice(0,60),n:info.length};
 // the clustering: a map from a cell's key to its index, the sums of its positions and colours
 const key=new Map(),sp=[],sc=[],cnt=[],idx=[];let tin=0;
 const at=(x,y,z,r,g,b)=>{const i=Math.floor((x-site[0])/cell),j=Math.floor(y/cell),k=Math.floor((z-site[1])/cell),h=i+','+j+','+k;let q=key.get(h);
  if(q===undefined){q=cnt.length;key.set(h,q);sp.push(0,0,0);sc.push(0,0,0);cnt.push(0);}sp[q*3]+=x;sp[q*3+1]+=y;sp[q*3+2]+=z;sc[q*3]+=r;sc[q*3+1]+=g;sc[q*3+2]+=b;cnt[q]++;return q;};
 for(const o of keep){const g=o.geometry,P=g.attributes.position,C=g.attributes.color,I=g.index,m=Array.isArray(o.material)?o.material[0]:o.material,n=o.isInstancedMesh?o.count:1;
  const base=m&&m.color?m.color:new T.Color(1,1,1),nt=(I?I.count:P.count)/3;
  for(let k=0;k<n;k++){if(o.isInstancedMesh){o.getMatrixAt(k,IM);M.multiplyMatrices(o.matrixWorld,IM);if(o.instanceColor)o.getColorAt(k,ci);else ci.setRGB(1,1,1);}else{M.copy(o.matrixWorld);ci.setRGB(1,1,1);}
   for(let t=0;t<nt;t++){const q=[0,0,0];for(let e=0;e<3;e++){const vi=I?I.getX(t*3+e):t*3+e;v.fromBufferAttribute(P,vi).applyMatrix4(M);
     c.copy(base).multiply(ci);if(C)c.multiply(new T.Color(C.getX(vi),C.getY(vi),C.getZ(vi)));q[e]=at(v.x,v.y,v.z,c.r,c.g,c.b);}
    tin++;if(q[0]!==q[1]&&q[1]!==q[2]&&q[0]!==q[2])idx.push(q[0],q[1],q[2]);}}}
 // only the cells a kept triangle uses, renumbered; one triangle of each set of three cells (a cluster's faces collapse to duplicates)
 const seen=new Set(),tri=[];for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],d=idx[t+2],h=[a,b,d].sort((x,y)=>x-y).join(',');if(seen.has(h))continue;seen.add(h);tri.push(a,b,d);}
 const re=new Map(),pos=[],col=[],out_i=[];for(const q of tri){let r=re.get(q);if(r===undefined){r=re.size;re.set(q,r);const n=cnt[q];pos.push(sp[q*3]/n-site[0],sp[q*3+1]/n,sp[q*3+2]/n-site[1]);col.push(sc[q*3]/n,sc[q*3+1]/n,sc[q*3+2]/n);}out_i.push(r);}
 return{tin,tout:out_i.length/3,nv:re.size,pos,col,idx:out_i,meshes:keep.length};}"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--probe', action='store_true'); ap.add_argument('--cell', type=float, default=8)
    ap.add_argument('--span', type=float, default=2600)
    ap.add_argument('--page', default=PAGE); ap.add_argument('--site', type=float, default=1500)
    ap.add_argument('--half', type=float, default=1100, help="the half-size of the box taken round the ruin's axis")
    a = ap.parse_args()
    SITE = [a.site, 0, a.half]
    page = os.path.abspath(a.page)
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await harness.launch_chromium(p)
        with harness.serve(os.path.dirname(page)) as port:
            pg, errs, ready = await harness.open_page(b, page, port, size='960x600')
            if not ready:
                sys.exit('%s never ready: %s' % (page, errs[:3]))
            r = await pg.evaluate(TAKE_JS, [SITE, a.span, a.cell, a.probe])
            roofs = await pg.evaluate("()=>typeof AP_SITE!=='undefined'&&AP_SITE[1]&&AP_SITE[1].roofs?"
                                      "AP_SITE[1].roofs.map(r=>[r.rect[0],r.rect[1],r.rect[2],r.rect[3],r.y,r.overgrow?1:0]):null")
        await b.close()
    if a.probe:
        print(json.dumps(r, indent=1))
        return
    import numpy as np
    pos = np.array(r['pos'], dtype=np.float64).reshape(-1, 3)
    lo, hi = pos.min(0), pos.max(0)
    # positions quantised to 16 bits over the mass's box (a 3.4 km box: 5 cm steps), colours to 8 bits, indices 32-bit
    q = np.round((pos - lo) / np.maximum(hi - lo, 1e-6) * 65535).astype('<u2')
    col = np.clip(np.round(np.array(r['col']).reshape(-1, 3) * 255), 0, 255).astype('u1')
    idx = np.array(r['idx'], dtype='<u2' if r['nv'] < 65536 else '<u4')   # 16-bit indices when the vertices allow
    b64 = lambda arr: base64.b64encode(arr.tobytes()).decode('ascii')
    out = os.path.join(HERE, 'plateau', '44c-host-ruin-data.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write('// ================================================================= HOST — the ruin\'s massing (station 4), BAKED\n')
        f.write('// Written by biomes/rift/stations/bake_ruin.py from kits/ancients/dist/%s (the target\'s ruined site at x %g), its\n'
                % (os.path.basename(page), a.site))
        f.write('// vertices clustered on a %g m grid: %d triangles in, %d out, %d vertices. Do not edit: re-run the bake.\n' % (a.cell, r['tin'], r['tout'], r['nv']))
        f.write('const RUIN_MASS={cell:%g,lo:%s,hi:%s,n:%d,i16:%s,pos:"%s",col:"%s",idx:"%s"};\n' % (
            a.cell, json.dumps([round(v, 3) for v in lo]), json.dumps([round(v, 3) for v in hi]), r['nv'],
            'true' if idx.dtype.itemsize == 2 else 'false', b64(q), b64(col), b64(idx)))
        f.write('// every standing roof (the page\'s AP_SITE[1].roofs): [x0, x1, z0, z1, y, overgrow] in the ruin\'s frame; overgrow 1 on the\n')
        f.write('// base\'s (left bare for the Rift\'s flora), 0 on the crown\'s (farmed); a block of the tier above rests on part of each\n')
        f.write('const RUIN_ROOFS=%s;\n' % json.dumps([[round(v, 2) for v in q_[:5]] + [q_[5]] for q_ in roofs] if roofs else []))
    print('roofs: %d (overgrow %d)' % (len(roofs) if roofs else 0, sum(q_[5] for q_ in roofs) if roofs else 0))
    print('wrote %s: %d triangles in (%d meshes), %d out, %d vertices, %.0f KB' % (os.path.relpath(out, ROOT), r['tin'], r['meshes'], r['tout'], r['nv'], os.path.getsize(out) / 1024))


asyncio.run(main())
