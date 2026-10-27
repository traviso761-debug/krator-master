"""Freeze Span's watch post into a static snapshot for station 4's preview page (python3 freeze_span.py <span.html> [--list]).

Station 4 is the biome only (the owner, 2026-10-27): its page never loads settlements/span. To see how Span sits on the site,
this tool opens Span's built page headless (a committed one: git show <rev>:settlements/span/dist/*
| git lfs smudge into a folder, then this with --rev <rev>) (tools/harness.py), takes the meshes Span draws round its watch pillar (the post,
the watch stair, the cliff stair: everything within REACH m of the pillar's axis except Span's own stand-in rock, ground, water
and sky), bakes each into world positions, normals and one colour (the material's, times its vertex colours), and writes them
relative to the top of Span's watch pillar, its axes the pillar's (x along its first side, z across, y up from the top):
span-watch.frozen.json. The preview build (build.py --station pillars --preview span) places it on station 4's watch pillar
from SWHI_PILLARS_SITE. The snapshot is a copy: re-run this after Span changes; nothing reads Span live."""
import asyncio, json, os, sys, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

REACH = 260
JS = r"""(o)=>{const T=THREE,out=[];const LY=typeof SPAN_LAYOUT!=='undefined'?SPAN_LAYOUT:null,Q=LY&&LY.pillars?(LY.pillars.find(p=>p.site==='watch')||LY.pillars.find(p=>/watch/i.test(p.id))||LY.pillars[0]):null,W=Q?(()=>{if(Q.site){const c=SPAN.toWorld(SPAN_FRAME,Q.u,Q.v,Q.top);return{id:Q.id,x:c[0],z:c[2],top:c[1],beds:[{ry:(Q.ry||0)-(SPAN_FRAME.ang||0)}]};}const fl=LY.pillarRim.floor,c=SPAN.toWorld(SPAN_FRAME,Q.u,Q.v,fl+Q.H);return{id:Q.id,x:c[0],z:c[2],top:c[1],beds:[{ry:0}]};})():null;
 if(!W)return{error:'no watch pillar in SPAN_LAYOUT'};const top=W.top,cx=W.x,cz=W.z,ry=(W.beds&&W.beds[0]&&W.beds[0].ry)||0,ca=Math.cos(ry),sa=Math.sin(ry);
 const skip=m=>{const l=(m.userData&&m.userData.inspectLabel)||m.name||'';return (m.userData&&m.userData.ground)||/stand-in|proxies|ground|terrain|water|river|lake|sky|distant|far|cloud|ring|giant/i.test(l)||m.userData.farField||(m.material&&m.material.userData&&m.material.userData.farField);};
 const v=new T.Vector3(),n=new T.Vector3(),M=new T.Matrix4(),N=new T.Matrix3(),IM=new T.Matrix4(),col=new T.Color();
 scene.updateMatrixWorld(true);
 scene.traverse(m=>{if(!m.isMesh||!m.visible||skip(m))return;const g=m.geometry;if(!g||!g.attributes.position)return;
  g.computeBoundingSphere();const bs=g.boundingSphere;const reps=m.isInstancedMesh?m.count:1;
  const mats=Array.isArray(m.material)?m.material:[m.material];const mat=mats[0]||{};const base=mat.color?mat.color.clone():new T.Color(1,1,1);
  const pos=g.attributes.position,nor=g.attributes.normal,vc=g.attributes.color,ic=m.instanceColor,idx=g.index;
  for(let r=0;r<reps;r++){M.copy(m.matrixWorld);if(m.isInstancedMesh){m.getMatrixAt(r,IM);M.multiply(IM);}
   v.copy(bs.center).applyMatrix4(M);if(Math.hypot(v.x-cx,v.z-cz)>o.reach+bs.radius*M.getMaxScaleOnAxis())continue;
   N.getNormalMatrix(M);const tri=idx?idx.count/3:pos.count/3,p=[],q=[],c=[];
   const C=base.clone();if(ic){col.fromArray(ic.array,r*3);C.multiply(col);}
   const keep=k=>{let sx=0,sz=0,sy=0;for(let e=0;e<3;e++){const i=idx?idx.getX(3*k+e):3*k+e;v.fromBufferAttribute(pos,i).applyMatrix4(M);sx+=v.x;sy+=v.y;sz+=v.z;}return Math.hypot(sx/3-cx,sz/3-cz)<=o.reach&&sy/3>top-o.below;};
   for(let k=0;k<tri;k++){if(!keep(k))continue;for(let e=0;e<3;e++){const t=3*k+e,i=idx?idx.getX(t):t;v.fromBufferAttribute(pos,i).applyMatrix4(M);const dx=v.x-cx,dz=v.z-cz;
    p.push(+(dx*ca+dz*sa).toFixed(2),+(v.y-top).toFixed(2),+(-dx*sa+dz*ca).toFixed(2));
    if(nor){n.fromBufferAttribute(nor,i).applyMatrix3(N).normalize();q.push(+(n.x*ca+n.z*sa).toFixed(2),+n.y.toFixed(2),+(-n.x*sa+n.z*ca).toFixed(2));}
    if(vc){c.push(+(C.r*vc.getX(i)).toFixed(3),+(C.g*vc.getY(i)).toFixed(3),+(C.b*vc.getZ(i)).toFixed(3));}}}
   if(p.length)out.push({label:(m.userData&&m.userData.inspectLabel)||m.name||'mesh',color:[+C.r.toFixed(3),+C.g.toFixed(3),+C.b.toFixed(3)],pos:p,nor:q.length?q:null,col:c.length?c:null});}});
 return{watch:{x:cx,z:cz,top,ry},parts:out};}"""
LIST_JS = r"""(o)=>{const LY=typeof SPAN_LAYOUT!=='undefined'?SPAN_LAYOUT:null,Q=LY&&LY.pillars?(LY.pillars.find(p=>p.site==='watch')||LY.pillars.find(p=>/watch/i.test(p.id))||LY.pillars[0]):null,W=Q?(()=>{if(Q.site){const c=SPAN.toWorld(SPAN_FRAME,Q.u,Q.v,Q.top);return{id:Q.id,x:c[0],z:c[2],top:c[1],beds:[{ry:(Q.ry||0)-(SPAN_FRAME.ang||0)}]};}const fl=LY.pillarRim.floor,c=SPAN.toWorld(SPAN_FRAME,Q.u,Q.v,fl+Q.H);return{id:Q.id,x:c[0],z:c[2],top:c[1],beds:[{ry:0}]};})():null;const L=[];if(!W)return'no watch';scene.updateMatrixWorld(true);
 scene.traverse(m=>{if(!m.isMesh||!m.visible)return;const g=m.geometry;g.computeBoundingSphere();const c=g.boundingSphere.center.clone().applyMatrix4(m.matrixWorld);
  const d=Math.hypot(c.x-W.x,c.z-W.z);if(d<o.reach+g.boundingSphere.radius)L.push([(m.userData&&m.userData.inspectLabel)||m.name||'mesh',m.isInstancedMesh?m.count:1,Math.round(d),Math.round(g.boundingSphere.radius)]);});
 return{watch:[W.id,W.x,W.z,W.top],near:L};}"""

async def main():
    html = os.path.abspath(sys.argv[1])
    from playwright.async_api import async_playwright
    with harness.serve(os.path.dirname(html)) as port:
        async with async_playwright() as p:
            br = await harness.launch_chromium(p)
            pg, errs, ready = await harness.open_page(br, html, port)
            if not ready:
                sys.exit('span page did not build: ' + '; '.join(errs[:3]))
            if '--probe' in sys.argv:
                print(await pg.evaluate("()=>JSON.stringify({site:SPAN_LAYOUT.site,pillars:(SPAN_LAYOUT.pillars||[]).slice(0,3),rim:SPAN_LAYOUT.pillarRim?Object.keys(SPAN_LAYOUT.pillarRim):null,keys:Object.keys(SPAN_LAYOUT).slice(0,40),F:SPAN_FRAME,err:(document.getElementById('errs')||{}).textContent})"))
                await br.close(); return
            if '--dbg' in sys.argv:
                print(await pg.evaluate("([js])=>{try{const f=(0,eval)(js);const r=f({reach:260,below:290});return JSON.stringify(r).slice(0,300);}catch(e){return String(e.stack).slice(0,600);}}", [JS]))
                await br.close(); return
            if '--all' in sys.argv:
                print(await pg.evaluate("()=>{const o=[],b=new THREE.Box3();scene.updateMatrixWorld(true);scene.traverse(m=>{if(!m.isMesh)return;b.setFromObject(m);const c=b.getCenter(new THREE.Vector3());let p=m,path=[];while(p){path.push(p.name||p.type);p=p.parent;}o.push([(m.userData.inspectLabel||m.name||'mesh').slice(0,40),Math.round(c.x),Math.round(c.y),Math.round(c.z),Math.round(b.max.x-b.min.x),path.slice(1,4).join('<')]);});return JSON.stringify(o);}"))
                await br.close(); return
            if '--list' in sys.argv:
                print(json.dumps(await pg.evaluate(LIST_JS, {'reach': REACH}), indent=1))
                await br.close(); return
            R = await harness.evaluate_big(pg, JS, {'reach': REACH, 'below': 290})
            await br.close()
    if R.get('error'):
        sys.exit(R['error'])
    rev = sys.argv[sys.argv.index('--rev') + 1] if '--rev' in sys.argv else os.popen('git -C "%s" rev-parse --short HEAD' % os.path.dirname(html)).read().strip()
    R.update({'format': 'span-watch-frozen', 'version': 1, 'source': 'settlements/span/dist/span.html', 'rev': rev,
              'frozen': datetime.date.today().isoformat(), 'frame': 'x along the watch pillar first side, z across, y up from its top (m)'})
    # packed: the parts merged by colour, positions as int16 decimetres and normals as int8 (base64): ~1/4 the size
    import base64, struct, collections
    G = collections.OrderedDict()
    for q in R.pop('parts'):
        k = tuple(q['color'])
        g = G.setdefault(k, {'pos': [], 'nor': [], 'labels': set()})
        g['pos'] += q['pos']; g['nor'] += (q['nor'] or [0, 1, 0] * (len(q['pos']) // 3)); g['labels'].add(q['label'])
    R['groups'] = [{'color': list(k), 'labels': sorted(g['labels'])[:6], 'n': len(g['pos']) // 3,
                    'pos': base64.b64encode(struct.pack('<%dh' % len(g['pos']), *[max(-32767, min(32767, round(v * 10))) for v in g['pos']])).decode(),
                    'nor': base64.b64encode(struct.pack('<%db' % len(g['nor']), *[max(-127, min(127, round(v * 127))) for v in g['nor']])).decode()}
                   for k, g in G.items()]
    R['units'] = {'pos': 'int16 decimetres', 'nor': 'int8 /127'}
    out = os.path.join(HERE, 'span-watch.frozen.json')
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(R, fh, separators=(',', ':'))
    print('wrote', os.path.relpath(out, ROOT).replace(os.sep, '/'), len(R['groups']), 'colour groups', sum(g['n'] // 3 for g in R['groups']), 'triangles')

asyncio.run(main())
