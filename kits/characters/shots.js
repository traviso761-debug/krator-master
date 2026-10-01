// Headless screenshots of dist/barbarian.html with the repo's three.min.js.
//   node shots.js [outdir]
// Writes: front side back face idle bones tpose mixamo-side mixamo-front .png, walk-NN / mixamo-NN .png (16 frames each)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HERE = __dirname, OUT = process.argv[2] || path.join(HERE, 'shots');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const srv = http.createServer((req, res) => {
    const f = path.join(HERE, 'dist', req.url.split('?')[0].replace(/^\//, '') || 'barbarian.html');
    fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': 'text/html' }); res.end(d); } });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 1100 } });
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await pg.route('**/three.min.js', r => r.fulfill({ path: path.join(HERE, 'three.min.js'), contentType: 'application/javascript' }));
  await pg.goto(`http://127.0.0.1:${port}/barbarian.html`);
  await pg.waitForFunction('window._ready===true || document.getElementById("errs").textContent.length>0', null, { timeout: 120000 });
  const errs = await pg.evaluate('document.getElementById("errs").textContent'); if (errs) console.log('ERRS:', errs);
  console.log(await pg.evaluate('document.getElementById("hud").textContent'));
  const shot = async (name, js) => { await pg.evaluate(js); await pg.waitForTimeout(150); await pg.evaluate(js); await pg.screenshot({ path: path.join(OUT, name + '.png') }); };
  await pg.evaluate('document.getElementById("ui").style.display="none";document.getElementById("cap").style.display="none"');
  await shot('front', 'CHAR.view(0.45,0.12,5.6); CHAR.setPhase("walk",0.25)');
  await shot('side', 'CHAR.view(Math.PI/2,0.08,5.6); CHAR.setPhase("walk",0.25)');
  await shot('back', 'CHAR.view(Math.PI+0.5,0.12,5.6); CHAR.setPhase("walk",0.75)');
  await shot('idle', 'CHAR.view(0,0.1,5.6); CHAR.setPhase("idle",0.0)');
  await shot('face', 'CHAR.view(0.35,0.05,1.5,1.95); CHAR.setPhase("idle",0.0)');
  await shot('bones', 'CHAR.view(0.45,0.12,5.6); CHAR.setPhase("walk",0.25); CHAR.mesh.material.wireframe=true; CHAR.scene.children.forEach(o=>{if(o.isSkeletonHelper)o.visible=true}); CHAR.renderer.render(CHAR.scene,CHAR.camera)');
  await pg.evaluate('CHAR.mesh.material.wireframe=false; CHAR.scene.children.forEach(o=>{if(o.isSkeletonHelper)o.visible=false})');
  const N = 16;
  for (let i = 0; i < N; i++) await shot('walk-' + String(i).padStart(2, '0'), `CHAR.view(0.6,0.1,5.6); CHAR.setPhase("walk",${i / N})`);
  for (let i = 0; i < N; i++) await shot('mixamo-' + String(i).padStart(2, '0'), `CHAR.view(0.6,0.1,5.6); CHAR.setPhase("mixamo",${i / N})`);
  await shot('mixamo-side', 'CHAR.view(Math.PI/2,0.08,5.6); CHAR.setPhase("mixamo",0.3)');
  await shot('mixamo-front', 'CHAR.view(0.3,0.12,5.6); CHAR.setPhase("mixamo",0.3)');
  await shot('tpose', 'CHAR.view(0.3,0.12,6.5); CHAR.mixer.stopAllAction(); CHAR.bones.mixamorigHips.traverse(b=>{if(b.isBone){b.quaternion.identity();b.position.copy(b.userData.rest)}}); CHAR.renderer.render(CHAR.scene,CHAR.camera)');
  await b.close(); srv.close();
  console.log('wrote', OUT);
})().catch(e => { console.error(e); process.exit(1); });
