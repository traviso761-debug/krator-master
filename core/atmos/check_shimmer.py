#!/usr/bin/env python3
"""The heat shimmer and the breath's turn on a real WebGL context (SwiftShader by default, so no GPU lock; KRATOR_GL=gpu for the GPU).

    python3 core/atmos/check_shimmer.py [--shot out.png]

A checkered ground 200 m square with one hot patch in its middle (a KTHERM-style raster, 80 degrees over -5), seen from 40 m off
at 6 m up. It draws the frame twice through ATMOS.shimmer (k 0, then k 1 a second on) and counts the pixels that moved inside the hot
patch's screen box and outside it: the shimmer must move many inside and none outside, and the sky none. On the same page an
instanced mesh with BIO.animHook's breath.turn (35b-core-anim-turn.js) must compile and turn: its pixels differ between uTurn 0 and .25.
Exit 0 when every check holds and no shader or WebGL error was logged.
"""
import asyncio, json, os, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness  # noqa: E402

FILES = ['core/shader/06-core-khook.js', 'core/shader/06b-core-kcolor.js'] + sorted(
    'core/atmos/' + f for f in os.listdir(HERE) if f.startswith('89-atmos-') and f.endswith('.js')) + [
    'core/atmos/fx/89-atmos-fx-shimmer.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js',
    'core/biome/35-core-anim.js', 'core/biome/35b-core-anim-turn.js']

PAGE = r"""<!doctype html><html><body style="margin:0"><script src="three.min.js"></script>%s<script>
const W=320,Hh=200,R=new THREE.WebGLRenderer({preserveDrawingBuffer:true});R.setSize(W,Hh);R.setPixelRatio(1);document.body.appendChild(R.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fb0d0);const cam=new THREE.PerspectiveCamera(50,W/Hh,.5,2000);cam.position.set(0,6,60);cam.lookAt(0,0,0);
ATMOS.init({THREE,scene,camera:cam,hour:()=>12,onFrame:()=>{},ground:()=>0,seed:3,err:m=>{throw new Error(m);},viewH:Hh,pixelRatio:1});
/* a checkered ground, so an offset shows */
const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');for(let j=0;j<8;j++)for(let i=0;i<8;i++){g.fillStyle=(i+j)%%2?'#3a2a20':'#d8c8a0';g.fillRect(i*8,j*8,8,8);}
const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(40,40);tx.magFilter=THREE.NearestFilter;
const gr=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({map:tx}));gr.rotation.x=-Math.PI/2;scene.add(gr);
const nx=21,T=[];for(let j=0;j<nx;j++)for(let i=0;i<nx;i++)T.push(Math.hypot(i-10,j-10)<3.5?80:-5);const F={x0:-100,z0:-100,cell:10,nx,nz:nx,T};
const S=ATMOS.shimmer({renderer:R,field:F,near:4,far:30});
const gl=R.getContext(),read=()=>{const px=new Uint8Array(W*Hh*4);gl.readPixels(0,0,W,Hh,gl.RGBA,gl.UNSIGNED_BYTE,px);return px;};
S.k.value=0;S.draw(scene,cam,0);const a=read();S.k.value=1;S.draw(scene,cam,1.0);const b=read();
/* the hot patch (35 m of hot nodes round the origin, 45 m with the texture's bilinear edge) on screen: project its rim, take the box */
let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let k=0;k<64;k++){const v=new THREE.Vector3(Math.cos(k/64*6.283)*46,0,Math.sin(k/64*6.283)*46).project(cam);const px=(v.x+1)/2*W,py=(v.y+1)/2*Hh;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);}
let inside=0,outside=0,sky=0,horizon=new THREE.Vector3(0,0,-1000).project(cam),hy=(horizon.y+1)/2*Hh;
for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;if(Math.abs(a[k]-b[k])+Math.abs(a[k+1]-b[k+1])+Math.abs(a[k+2]-b[k+2])<6)continue;
 const inB=x>=x0-4&&x<=x1+4&&y>=y0-4&&y<=y1+4;if(y>hy+2)sky++;else if(inB)inside++;else outside++;}
/* the breath's turn: an instanced card under BIO.animHook with breath.turn */
BIO.init({THREE,scene,seed:3,err:()=>{},ticks:()=>{},eye:()=>[0,0,0]});BIO._tickWind();
const geo=new THREE.InstancedBufferGeometry().copy(new THREE.BoxGeometry(6,4,.4));geo.instanceCount=1;
geo.setAttribute('aP0',new THREE.InstancedBufferAttribute(new Float32Array([0,0,0,1]),4));geo.setAttribute('aP1',new THREE.InstancedBufferAttribute(new Float32Array([0,0,0,0]),4));
const im=new THREE.InstancedMesh(new THREE.BoxGeometry(6,4,.4),new THREE.MeshLambertMaterial({color:0x111111,emissive:0x202020}),1);
im.geometry.setAttribute('aP0',new THREE.InstancedBufferAttribute(new Float32Array([0,0,0,1]),4));im.geometry.setAttribute('aP1',new THREE.InstancedBufferAttribute(new Float32Array([0,0,0,0]),4));
im.material.onBeforeCompile=BIO.animHook({mode:'breath',breath:{key:'sun',shape:'turn',amp:6.2832}});im.setMatrixAt(0,new THREE.Matrix4().makeTranslation(0,3,40));scene.add(im);
const sc2=new THREE.Scene();sc2.background=new THREE.Color(0xffffff);sc2.add(im);sc2.add(new THREE.AmbientLight(0xffffff,1));
BIO.breathState('sun').value=0;R.render(sc2,cam);const c=read();BIO.breathState('sun').value=.25;R.render(sc2,cam);const d=read();
let turned=0,drawn=0;for(let k=0;k<c.length;k+=4){if(c[k]<200)drawn++;if(Math.abs(c[k]-d[k])>20)turned++;}
S.draw(scene,cam,.4);const png=R.domElement.toDataURL('image/png');   /* a shimmered frame, for --shot */
S.k.value=0;S.draw(scene,cam,0);const png0=R.domElement.toDataURL('image/png');
window.RESULT={inside,outside,sky,box:[x0,x1,y0,y1].map(Math.round),turned,drawn,programs:R.info.programs.length,png,png0};
</script></body></html>"""


async def main(shot):
    tmp = tempfile.mkdtemp(prefix='kshimmer-')
    try:
        tags = []
        for f in FILES:
            dst = os.path.join(tmp, os.path.basename(f))
            shutil.copy(os.path.join(ROOT, f), dst)
            tags.append('<script src="%s"></script>' % os.path.basename(f))
        with open(os.path.join(tmp, 'index.html'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(PAGE % ''.join(tags))
        from playwright.async_api import async_playwright
        with harness.serve(tmp) as port:
            async with async_playwright() as p:
                b = await harness.launch_chromium(p)
                pg = await b.new_page()
                lines = []
                pg.on('console', lambda m: lines.append((m.type, m.text)))
                pg.on('pageerror', lambda e: lines.append(('error', 'pageerror: ' + str(e))))
                await harness.route_three(pg, tmp, os.path.join(ROOT, 'kits', 'ancients'))
                await pg.goto('http://127.0.0.1:%d/index.html' % port)
                await pg.wait_for_function('window.RESULT', timeout=120000)
                r = await pg.evaluate('window.RESULT')
                if shot:
                    import base64
                    for key, path in (('png', shot), ('png0', shot.replace('.png', '-still.png'))):
                        with open(path, 'wb') as fh:
                            fh.write(base64.b64decode(r[key].split(',', 1)[1]))
                r = {k: v for k, v in r.items() if not k.startswith('png')}
                # an explicit loseContext (the harness ignores its warning) is followed by three's own log of it: that pair is not a
                # failure; a context lost without the call is
                lost = any('loseContext: context lost' in t for k, t in lines)
                errs = [t for t in harness.gl_errors(lines) if not (lost and t == 'THREE.WebGLRenderer: Context Lost.')]
                errs += [t for k, t in lines if t.startswith('pageerror')]
                await b.close()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    checks = [('the shimmer moves the hot patch (%d pixels)' % r['inside'], r['inside'] > 200),
              ('and nothing outside it (%d)' % r['outside'], r['outside'] == 0),
              ('the sky does not shimmer (%d)' % r['sky'], r['sky'] == 0),
              ('the turned card is drawn (%d pixels) and turns (%d)' % (r['drawn'], r['turned']), r['drawn'] > 100 and r['turned'] > 50),
              ('no shader or WebGL error (%s)' % (errs[:3] or 'none'), not errs)]
    for name, good in checks:
        print(('PASS  ' if good else 'FAIL  ') + name)
    print(json.dumps(r))
    return 0 if all(g for _, g in checks) else 1


if __name__ == '__main__':
    shot = sys.argv[sys.argv.index('--shot') + 1] if '--shot' in sys.argv else None
    sys.exit(asyncio.run(main(shot)))
