// Headless screenshots of dist/barbarian.html with the repo's three.min.js.
//   node shots.js [outdir] [char,char,...] [frames]
// Per character: <key>-front.png, <key>-side.png, <key>-mixamo-NN.png and <key>-attack-NN.png (frames each).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HERE = __dirname, OUT = process.argv[2] || path.join(HERE, 'shots');
const CHARS = (process.argv[3] || 'barbarian,puffer,priest,knight,warrior').split(',');
const N = parseInt(process.argv[4] || '8', 10);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const srv = http.createServer((req, res) => {
    fs.readFile(path.join(HERE, 'dist', 'barbarian.html'), (e, d) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(d); });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 720, height: 900 } });
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await pg.route('**/three.min.js', r => r.fulfill({ path: path.join(HERE, 'three.min.js'), contentType: 'application/javascript' }));
  const shot = async (name, js) => { await pg.evaluate(js); await pg.waitForTimeout(100); await pg.evaluate(js); await pg.screenshot({ path: path.join(OUT, name + '.png') }); };
  for (const key of CHARS) {
    await pg.goto(`http://127.0.0.1:${port}/barbarian.html?${key}#${key}`);
    await pg.waitForFunction('window._ready===true || document.getElementById("errs").textContent.length>0', null, { timeout: 120000 });
    const errs = await pg.evaluate('document.getElementById("errs").textContent'); if (errs) { console.log(key, 'ERRS:', errs); continue; }
    console.log(key, (await pg.evaluate('document.getElementById("hud").textContent')).split('\n')[0]);
    await pg.evaluate('document.getElementById("ui").style.display="none";document.getElementById("cap").style.display="none"');
    const ty = await pg.evaluate('CHAR.bones.mixamorigHips.userData.rest.y');
    const dist = 4.6 + ty * 1.2;
    await shot(key + '-front', `CHAR.view(0.4,0.1,${dist},${ty}); CHAR.setPhase("mixamo",0.3)`);
    await shot(key + '-side', `CHAR.view(Math.PI/2,0.08,${dist},${ty}); CHAR.setPhase("mixamo",0.3)`);
    for (let i = 0; i < N; i++) await shot(key + '-mixamo-' + String(i).padStart(2, '0'), `CHAR.view(0.6,0.1,${dist},${ty}); CHAR.setPhase("mixamo",${i / N})`);
    for (let i = 0; i < N; i++) await shot(key + '-attack-' + String(i).padStart(2, '0'), `CHAR.view(0.6,0.1,${dist},${ty}); CHAR.setPhase("attack",${i / N})`);
  }
  await b.close(); srv.close();
  console.log('wrote', OUT);
})().catch(e => { console.error(e); process.exit(1); });
