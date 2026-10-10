// Render GLBs side by side in headless Chromium, for checking donors and pieces by eye.
//   node tools/render.mjs <out.png> <view> <a.glb> [<b.glb> ...]
// view: full | head | back | side | headside. Each model is drawn in its bind pose (no clip), 1 m apart along x.
// three.js r128 and its GLTFLoader come from THREE_DIR (default: the jsDelivr CDN).
import fs from 'fs';
import { execSync } from 'child_process';
import { createRequire } from 'module';
// playwright from the global node modules (it is not a dependency of this repo)
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');

const [out, view, ...glbs] = process.argv.slice(2);
const dir = process.env.THREE_DIR;
const src = f => dir ? { path: dir + '/' + f } : { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/' + (f === 'three.min.js' ? 'build/' : 'examples/js/loaders/') + f };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }).catch(() => chromium.launch());
const W = Math.min(1800, 420 * glbs.length), H = view.startsWith('head') ? 420 : 640;
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', m => console.log('[page]', m.text()));
await page.setContent('<body style="margin:0;background:#888"></body>');
await page.addScriptTag(src('three.min.js'));
await page.addScriptTag(src('GLTFLoader.js'));
const data = glbs.map(g => fs.readFileSync(g).toString('base64'));
await page.evaluate(async ({ data, view, W, H }) => {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H); r.outputEncoding = THREE.sRGBEncoding; document.body.appendChild(r.domElement);
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x9aa0a6);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x445544, 0.9));
  const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(1, 2, 3); sc.add(d);
  const n = data.length, gap = view.startsWith('head') ? 0.4 : 1.0;
  for (let i = 0; i < n; i++) {
    const buf = Uint8Array.from(atob(data[i]), c => c.charCodeAt(0)).buffer;
    const g = await new Promise((ok, no) => new THREE.GLTFLoader().parse(buf, '', ok, no));
    g.scene.position.x = (i - (n - 1) / 2) * gap;
    if (view === 'side' || view === 'headside') g.scene.rotation.y = Math.PI / 2;
    if (view === 'back') g.scene.rotation.y = Math.PI;
    sc.add(g.scene);
  }
  const head = view.startsWith('head');
  const cam = head ? new THREE.OrthographicCamera(-gap * n / 2, gap * n / 2, 0.2 * H / W * n * gap / 0.4 * 0.4 / 0.4, -0.2, 0.1, 10)
                   : new THREE.OrthographicCamera(-gap * n / 2, gap * n / 2, 1.0, -1.0, 0.1, 10);
  if (head) { const h = gap * n * H / W / 2; cam.top = h; cam.bottom = -h; cam.updateProjectionMatrix(); cam.position.set(0, 1.56, 3); }
  else { const h = gap * n * H / W / 2; cam.top = Math.max(h, 1); cam.bottom = -cam.top; cam.left = -cam.top * W / H; cam.right = cam.top * W / H; cam.updateProjectionMatrix(); cam.position.set(0, 0.92, 3); }
  cam.lookAt(cam.position.x, cam.position.y, 0);
  r.render(sc, cam);
}, { data, view, W, H });
await page.screenshot({ path: out });
await browser.close();
