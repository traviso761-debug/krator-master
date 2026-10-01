#!/usr/bin/env python3
"""Export the REAL geometry of selected buildings from their kit pages, for the walkable mockup.

  python3 tools/export_shells.py                # every kit in SELECTION -> walk/shells/<kit>.js
  python3 tools/export_shells.py post-apoc      # one kit

Each kit page is loaded headless (the kit's own built HTML: never edited, never rebuilt here). For
every selected building we know where the page placed it (Highlands: SITES; Post-Apoc: REG with
?only=; Locus/Abyss: SHEET_ITEMS), so we cut out of the scene every triangle whose centroid (merged
meshes) or every instance whose origin (instanced meshes) falls in the building's plot, and take it
into the building's OWN frame (origin at the plot centre on the ground, +z the front): the frame the
interior sets (sets/*.js) are written in. Geometry is written flat-coloured (vertex colour x material
colour x instance colour; textures dropped), positions as float32 (exact: the kits offset decals by
millimetres), colours as uint8, in four buckets: solid (front faces only, winding kept through mirrored
transforms), double (the kits' two-sided materials), glow (unlit) and glass (translucent). Beast Rider buildings need no export: they
are catalog ASSETs the mockup builds directly.
"""
import asyncio, base64, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(KIT))
THREE = os.path.join(ROOT, 'kits', 'catalog', 'three.min.js')
OUT = os.path.join(KIT, 'walk', 'shells')

# kit -> page, ready test, how to find a building's placement, and the buildings: (set key, kit key, variant)
SELECTION = {
    'highlands': {
        'page': 'settlements/highlands/dist/highlands.html', 'ready': "typeof SITES!=='undefined' && SITES.length>0 && !!window._api",
        'items': [('hl_rep_house_poor_b', 'hl_rep_house_poor_b', 0), ('hl_rep_house_mid_a', 'hl_rep_house_mid_a', 0),
                  ('hl_rep_tavern_b', 'hl_rep_tavern_b', 0), ('hl_rus_house_mid_a', 'hl_rus_house_mid_a', 0),
                  ('hl_tri_small_b', 'hl_tri_small_b', 0)],
    },
    'post-apoc': {
        'page': 'kits/post-apoc/dist/post-apoc.html', 'ready': "!!window._api && window._api.REG && window._api.REG.length>0", 'only': True,
        'items': [('dw-silo', 'dw-silo', 0), ('dw-bottle', 'dw-bottle', 0), ('shop-general', 'shop-general', 0), ('lg-stack', 'lg-stack', 0)],
    },
    'locus': {
        'page': 'settlements/locus/locus-kit.html', 'ready': "window._ready===true && !!window._api && !!window._api.SHEET_ITEMS",
        'items': [('stilt_mid', 'stilt_mid', 0)], 'flat': True,
    },
    'abyss': {
        'page': 'settlements/locus/abyss-kit.html', 'ready': "window._ready===true && !!window._api && !!window._api.SHEET_ITEMS",
        'items': [('abyss_house_mid#2', 'abyss_house_mid', 2), ('abyss_shop_food', 'abyss_shop_food', 0)], 'flat': True,
    },
}

PLACE_JS = {
    'highlands': """(k)=>{const S=SITES.filter(s=>s.key===k.key)[0];if(!S)return null;const D=VERN.defs[k.key];
        return {x:S.x,z:S.z,ry:S.ry||0,w:D.w,d:D.d,h:D.h||20};}""",
    'post-apoc': """(k)=>{const r=window._api.REG.filter(r=>r.key===k.key)[0];if(!r)return null;
        return {x:r.x,z:r.z,ry:r.ry||0,w:r.decl.w,d:r.decl.d,h:r.decl.h};}""",
    'locus': """(k)=>{const its=window._api.SHEET_ITEMS.filter(i=>i.key===k.key);const it=its[k.v]||its[0];if(!it)return null;
        return {x:it.x,z:it.z,ry:Math.PI,w:it.w,d:it.d,h:it.h};}""",
}
PLACE_JS['abyss'] = PLACE_JS['locus']

EXTRACT_JS = r"""(P)=>{
  const c=Math.cos(P.ry), s=Math.sin(P.ry), hw=P.w/2+P.pad, hd=P.d/2+P.pad;
  function toLocal(x,z){const dx=x-P.x,dz=z-P.z;return [dx*c-dz*s, dx*s+dz*c];}   /* inverse of rotation.y */
  function inside(x,y,z){const l=toLocal(x,z);return Math.abs(l[0])<=hw&&Math.abs(l[1])<=hd&&y>-1&&y<P.h+12;}
  /* buckets: solid (front faces only, as the kits draw them), double (two-sided cloth, tarps, foliage), glass, glow */
  const B={solid:{p:[],c:[]},double:{p:[],c:[]},glow:{p:[],c:[]},glass:{p:[],c:[]}};
  const v=new THREE.Vector3(),m=new THREE.Matrix4(),mi=new THREE.Matrix4(),col=new THREE.Color(),ic=new THREE.Color(),vc=new THREE.Color();
  let tris=0;
  function bucketOf(mat){if(mat.isMeshBasicMaterial||mat.isShaderMaterial||(mat.emissive&&mat.emissiveIntensity>0.5&&mat.emissive.getHex()>0x202020))return 'glow';
    if(mat.transparent&&mat.opacity<0.9)return 'glass';return mat.side===THREE.DoubleSide?'double':'solid';}
  function emit(geo,mat,M,inst,checkTri){
    const pos=geo.attributes.position,colA=geo.attributes.color,idx=geo.index,n=idx?idx.count:pos.count;
    const b=B[bucketOf(mat)];const base=(mat.color?mat.color:new THREE.Color(1,1,1));
    const tv=[[0,0,0],[0,0,0],[0,0,0]],tc=[[0,0,0],[0,0,0],[0,0,0]];
    /* a mirrored transform (negative determinant) flips the winding: swap two corners so front faces stay front */
    const flip=M.determinant()<0!==(mat.side===THREE.BackSide), ord=flip?[0,2,1]:[0,1,2];
    for(let i=0;i+2<n;i+=3){
      for(let k=0;k<3;k++){const j=idx?idx.getX(i+k):i+k;v.fromBufferAttribute(pos,j).applyMatrix4(M);tv[k][0]=v.x;tv[k][1]=v.y;tv[k][2]=v.z;
        col.copy(base);if(colA){vc.fromBufferAttribute(colA,j);col.multiply(vc);}if(inst)col.multiply(inst);tc[k][0]=col.r;tc[k][1]=col.g;tc[k][2]=col.b;}
      if(checkTri){const cx=(tv[0][0]+tv[1][0]+tv[2][0])/3,cy=(tv[0][1]+tv[1][1]+tv[2][1])/3,cz=(tv[0][2]+tv[1][2]+tv[2][2])/3;if(!inside(cx,cy,cz))continue;}
      /* P.flat: the sheet's own ground layers (a canvas, a water patch) lie flat at y ~ 0 in several coplanar
         sheets that fight each other: drop every triangle lying within 6 cm of the ground */
      if(P.flat&&Math.abs(tv[0][1])<0.06&&Math.abs(tv[1][1])<0.06&&Math.abs(tv[2][1])<0.06)continue;
      for(const k of ord){const l=toLocal(tv[k][0],tv[k][2]);b.p.push(l[0],tv[k][1],l[1]);   /* exact (float32): the kits offset decals by millimetres */
        for(let q=0;q<3;q++)b.c.push(Math.max(0,Math.min(255,Math.round(tc[k][q]*255))));}
      tris++;
    }
  }
  scene.updateMatrixWorld(true);
  scene.traverse(function(o){
    if(!o.visible||!o.geometry||!(o.isMesh)||o.isSprite)return;
    if(o.userData&&(o.userData.probeSkip||o.userData.label))return;
    for(let p=o.parent;p;p=p.parent)if(!p.visible)return;
    const mat=Array.isArray(o.material)?o.material[0]:o.material;if(!mat)return;
    if(o.geometry.attributes.position.count>200000&&!o.isInstancedMesh){/* big merged meshes: per triangle */}
    if(o.isInstancedMesh){
      for(let i=0;i<o.count;i++){o.getMatrixAt(i,mi);m.multiplyMatrices(o.matrixWorld,mi);v.setFromMatrixPosition(m);
        if(!inside(v.x,v.y,v.z))continue;let inst=null;if(o.instanceColor){ic.fromArray(o.instanceColor.array,i*3);inst=ic;}
        emit(o.geometry,mat,m,inst,false);}
    } else {
      const bb=new THREE.Box3().setFromObject(o);if(bb.isEmpty())return;
      /* quick reject: the mesh's box must touch the plot */
      const pts=[[bb.min.x,bb.min.z],[bb.max.x,bb.min.z],[bb.min.x,bb.max.z],[bb.max.x,bb.max.z]];
      const R=Math.hypot(P.w,P.d)/2+P.pad,cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2,rr=Math.hypot(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2;
      if(Math.hypot(cx-P.x,cz-P.z)>R+rr)return;
      emit(o.geometry,mat,o.matrixWorld,null,true);
    }
  });
  function b64(arr,T){const a=new T(arr);const u=new Uint8Array(a.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
  const out={tris:tris};
  for(const k in B){if(!B[k].p.length)continue;
    out[k]={p:b64(B[k].p,Float32Array),c:b64(B[k].c,Uint8Array),n:B[k].p.length/9,f:'f32'};}
  return out;
}"""


async def export(kit, spec):
    from playwright.async_api import async_playwright

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x):
            pass
    handler = lambda *x, **k: Quiet(*x, directory=ROOT, **k)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    exe = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
    result = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': exe} if exe else {}), args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        groups = [[it] for it in spec['items']] if spec.get('only') else [spec['items']]
        for grp in groups:
            pg = await b.new_page(viewport={'width': 800, 'height': 600})
            pg.set_default_timeout(900000)
            await pg.route('**/three*.min.js', lambda route: asyncio.ensure_future(route.fulfill(path=THREE, content_type='application/javascript')))
            q = ('?only=' + ','.join(it[1] for it in grp)) if spec.get('only') else ''
            await pg.goto('http://127.0.0.1:%d/%s%s' % (port, spec['page'], q), timeout=900000)
            await pg.wait_for_function(spec['ready'], timeout=900000, polling=1000)
            await pg.wait_for_timeout(1500)
            for set_key, key, v in grp:
                P = await pg.evaluate(PLACE_JS[kit], {'key': key, 'v': v})
                if not P:
                    print('  %s: %s not on the page' % (kit, key)); continue
                P['pad'] = 1.0
                P['flat'] = bool(spec.get('flat'))
                r = await pg.evaluate(EXTRACT_JS, P)
                if r.get('error'):
                    print('  %s: %s %s' % (kit, key, r['error'])); continue
                r.update({'key': key, 'variant': v, 'w': P['w'], 'd': P['d'], 'h': P['h']})
                result[set_key] = r
                print('  %-10s %-22s %6d triangles' % (kit, set_key, r['tris']))
            await pg.close()
        await b.close()
    httpd.shutdown()
    os.makedirs(OUT, exist_ok=True)
    fn = os.path.join(OUT, kit + '.js')
    with open(fn, 'w', encoding='utf-8') as fh:
        fh.write('/* GENERATED by tools/export_shells.py from %s: real building geometry for the walk mockup. Do not edit. */\n' % spec['page'])
        fh.write('(window.KRATOR_SHELLS = window.KRATOR_SHELLS || {})[%s] = %s;\n' % (json.dumps(kit), json.dumps(result, separators=(',', ':'))))
    print('wrote %s (%.0f KB)' % (os.path.relpath(fn, KIT), os.path.getsize(fn) / 1024))


def main():
    kits = sys.argv[1:] or list(SELECTION)
    for k in kits:
        print('exporting', k)
        asyncio.run(export(k, SELECTION[k]))


if __name__ == '__main__':
    main()
