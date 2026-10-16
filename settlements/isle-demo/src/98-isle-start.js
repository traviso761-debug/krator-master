/* ============================== 4. START ============================== */
/* [web] Decode the region's rasters (PNGs inside the page, decoded by the browser exactly as the open world's start,
   openworld/little-demo/src/98-world-start.js, decodes them) and WORLD.init. Then the town named by ?town= (Kautoa when
   none): the site file (site/isle-site.json from the server when there is one, always the newest, else the copy
   build.py inlined), the town's frame (the file's, else made from the world), its ground and water through Voth's
   VIEW on this page's VOTH, the tools, and the town's site. window._site is the probe verify.py reads. */
setTimeout(function () {
  var note = $('loading'), T0 = performance.now(), ms = {};
  var lap = function (k) { ms[k] = Math.round(performance.now() - T0); console.log('isle-site: ' + k + ' at ' + ms[k] + ' ms'); };
  var fail = function (e) { note.textContent = 'Failed: ' + (e && e.message ? e.message : e); console.error(e); window._site = { ready: true, error: String(e && e.stack ? e.stack : e) }; };
  var decode = function (b64) {
    return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { rej(new Error('a raster did not decode')); }; i.src = 'data:image/png;base64,' + b64; });
  };
  var pixels = function (img) {
    var c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    var g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data;
  };
  var ch = function (px, n) { var a = new Uint8Array(n); for (var i = 0; i < n; i++) a[i] = px[i * 4]; return a; };
  var keys = Object.keys(WORLD_DATA.png), im = {};
  Promise.all(keys.map(function (k) { return decode(WORLD_DATA.png[k]).then(function (i) { im[k] = i; }); })).then(function () {
    var M = WORLD_DATA.meta, lo = M.heights.lo, hi = M.heights.hi, nh = im.elev.width * im.elev.height, nm = im.biome.width * im.biome.height, i;
    var e = pixels(im.elev), w = pixels(im.wlev), R = { elev: new Float32Array(nh), wlev: new Float32Array(nh), whas: new Uint8Array(nh), wflag: new Uint8Array(nh) };
    for (i = 0; i < nh; i++) {
      R.elev[i] = lo + ((e[i * 4] << 8) | e[i * 4 + 1]) / 65535 * (hi - lo); R.wflag[i] = e[i * 4 + 2] > 127 ? 1 : 0; R.whas[i] = w[i * 4 + 2] > 127 ? 1 : 0;
      R.wlev[i] = R.whas[i] ? lo + ((w[i * 4] << 8) | w[i * 4 + 1]) / 65535 * (hi - lo) : lo;
    }
    ['clim', 'rain', 'temp', 'biome', 'mask'].forEach(function (k) { R[k] = ch(pixels(im[k]), nm); });
    var d16 = function (img) { var p = pixels(img), a = new Float32Array(nh); for (var j = 0; j < nh; j++) a[j] = lo + ((p[j * 4] << 8) | p[j * 4 + 1]) / 65535 * (hi - lo); return a; };
    R.scarpL = d16(im.scarpl); R.scarpU = d16(im.scarpu); R.scarpW = new Float32Array(ch(pixels(im.scarpw), nh));
    lap('decoded'); WORLD.init(R); lap('world');
    var inl = (typeof SITE_INIT !== 'undefined') ? SITE_INIT : null;
    if (location.protocol.indexOf('http') !== 0) return { file: inl, from: 'inline' };
    return fetch('../site/isle-site.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
      .then(function (d) { return { file: d, from: 'server' }; }).catch(function () { return { file: inl, from: 'inline' }; });
  }).then(function (got) {
    var q = /[?&]town=([^&]+)/.exec(location.search), town = q ? decodeURIComponent(q[1]) : ISLE.TOWNS[0];
    if (ISLE.TOWNS.indexOf(town) < 0) town = ISLE.TOWNS[0];
    var site = ISLE.townSite(got.file, town), F = ISLE.frame(town, site && site.frame);
    lap('frame'); VIEW.stage(); VIEW.terrain(); lap('terrain'); VIEW.cantonLabels(); VIEW.minimap(); lap('minimap');
    var gy = Math.max(0, VOTH.terrainH(0, 0)), lab = VIEW.sprite(town, { size: 0.04 });
    lab.position.set(0, gy + 80, 0); scene.add(lab); VIEW.labels.push(lab);
    var dc = document.createElement('canvas'); dc.width = dc.height = 64; var dx = dc.getContext('2d');
    dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(32, 32, 26, 0, 7); dx.fill(); dx.lineWidth = 8; dx.strokeStyle = 'rgba(20,18,12,0.9)'; dx.stroke();
    TOOL.dotTex = new THREE.CanvasTexture(dc);
    TOOL.ui(); TOOL.bind(); ISLE.tools();
    TOOL.DRAFT = 'isle-demo.site.draft.' + town;
    lap('tools'); TOOL.start(site || SITE.blank()); TOOL.setMode('select'); TOOL.status(); lap('site');
    $('v-city').onclick();
    note.style.display = 'none';
    window._site = { ready: true, ms: ms, from: got.from, town: town, frame: F, site: SITE, tool: TOOL, view: VIEW, isle: ISLE };
  }).catch(fail);
}, 50);
