// Chip pictures for the editor: every head, armour slot, hair and beard of each body's kit, drawn in the bind pose.
//   node tools/thumbs.mjs <kits/characters>        -> dist/thumbs/<body>/<name>__<mesh>.png (160 px)
// build.py runs it when dist/thumbs is missing, or with --thumbs. three.js r128 and its loader are the local copies
// verify.py uses (settlements/ys/three.min.js, tools/vendor/GLTFLoader.r128.js).
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');

const HERE = path.resolve(process.argv[2] || '.');
const ROOT = path.resolve(HERE, '..', '..');
const jobs = [];
for (const body of ['male', 'female']) {
  const kp = path.join(HERE, 'data', body, 'kit.json');
  if (!fs.existsSync(kp)) continue;
  const kit = JSON.parse(fs.readFileSync(kp));
  const glb = g => path.join(HERE, g);
  const out = (g, mesh) => path.join(HERE, 'dist', 'thumbs', g.replace(/^pieces\//, '').replace(/\.glb$/, '') + '__' + mesh + '.png');
  for (const h of kit.heads) jobs.push({ parts: [[glb(h.glb), 'head']], frame: 'head', out: out(h.glb, 'head') });
  for (const a of kit.armour) for (const s of Object.keys(a.slots)) jobs.push({ parts: [[glb(a.glb), s]], frame: s, out: out(a.glb, s) });
  for (const h of kit.hair) {
    const head = kit.heads.find(x => x.id === h.head);
    jobs.push({ parts: [[glb(head.glb), 'head'], [glb(h.glb), h.kind]], frame: 'head', out: out(h.glb, h.kind) });
  }
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await b.newPage({ viewport: { width: 160, height: 160 } });
await page.setContent('<body style="margin:0"></body>');
await page.addScriptTag({ path: path.join(ROOT, 'settlements', 'ys', 'three.min.js') });
await page.addScriptTag({ path: path.join(HERE, 'tools', 'vendor', 'GLTFLoader.r128.js') });
await page.evaluate(() => {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(160, 160); r.outputEncoding = THREE.sRGBEncoding; document.body.appendChild(r.domElement);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 1.0));
  const l = new THREE.DirectionalLight(0xffe2b8, 0.9); l.position.set(1, 2, 3); sc.add(l);
  const cam = new THREE.PerspectiveCamera(24, 1, 0.02, 20);
  const cache = {};
  window.shot = async (parts, frame) => {
    const group = new THREE.Group();
    for (const [b64, name] of parts) {
      if (!cache[b64.length + name]) {
        const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
        const g = await new Promise((ok, no) => new THREE.GLTFLoader().parse(buf, '', ok, no));
        let m = null; g.scene.traverse(o => { if (o.isSkinnedMesh && o.name === name) m = o; });
        cache[b64.length + name] = m && new THREE.Mesh(m.geometry, m.material);
      }
      const m = cache[b64.length + name]; if (m) group.add(m.clone());
    }
    sc.add(group);
    const box = new THREE.Box3().setFromObject(group), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
    let size = Math.max(s.x, s.y);
    if (frame === 'head') { size = Math.max(0.3, Math.min(size, 0.42)); c.y = Math.max(c.y, box.max.y - 0.17); }
    const d = size * 0.5 / Math.tan(12 * Math.PI / 180) * 1.12;
    cam.position.set(c.x + d * 0.3, c.y + d * 0.06, c.z + d); cam.lookAt(c);
    r.render(sc, cam);
    sc.remove(group);
    return r.domElement.toDataURL('image/png');
  };
});
const b64 = {};
for (const j of jobs) {
  const parts = j.parts.map(([f, m]) => [b64[f] || (b64[f] = fs.readFileSync(f).toString('base64')), m]);
  const url = await page.evaluate(([p, f]) => window.shot(p, f), [parts, j.frame]);
  fs.mkdirSync(path.dirname(j.out), { recursive: true });
  fs.writeFileSync(j.out, Buffer.from(url.split(',')[1], 'base64'));
}
console.log('thumbs: ' + jobs.length);
await b.close();
