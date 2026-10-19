/* ============================== HOOK SITE EDITOR: START ([web]) ============================== */
/* The Port page has built Hook (92-camera.js started its frame loop); the editor's scene pieces (94) and panel (96)
   go up here and the site loads: site/hook-site.json from the server when there is one (serve.py: always the
   newest), else the copy build.py inlined as HOOK_SITE. window._site is the probe verify.py reads
   (settlements/voth/targets/voth-site/98-start.js is the model). */
setTimeout(function () {
  var note = $('loading');
  try {
    document.title = 'Hook site editor';
    VIEW.setup();
    var dc = document.createElement('canvas'); dc.width = dc.height = 64; var dx = dc.getContext('2d');
    dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(32, 32, 26, 0, 7); dx.fill(); dx.lineWidth = 8; dx.strokeStyle = 'rgba(20,18,12,0.9)'; dx.stroke();
    TOOL.dotTex = new THREE.CanvasTexture(dc);
    TOOL.ui(); TOOL.bind();
    /* Hook's views and clear, in place of Voth's (TOOL.ui bound them to Voth's lake) */
    $('v-map').onclick = function () { ctl.target.set(0, 0, -450); ctl.dist = 3400; ctl.el = 1.45; ctl.az = 0; updateCamera(); };
    $('v-city').onclick = function () { ctl.target.set(-150, PORT.DECK, -250); ctl.dist = 2300; ctl.el = .72; ctl.az = .25; updateCamera(); };
    $('b-clear').onclick = function () { if (confirm('Remove every quarter, avenue, marker, host and ground edit? (Undo brings it all back; the grid block stays.)')) TOOL.replaceAll(Object.assign(SITE.blank(), { grid: SITE.data.grid, note: SITE.data.note })); };
    var go = function (data, from) {
      TOOL.start(data); TOOL.setMode('select'); TOOL.status();
      $('v-city').onclick();
      note.style.display = 'none';
      window._site = { ready: true, from: from, site: SITE, tool: TOOL, view: VIEW };
    };
    var inl = (typeof HOOK_SITE !== 'undefined') ? HOOK_SITE : null;
    if (location.protocol.indexOf('http') === 0) {
      fetch('../site/hook-site.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
        .then(function (d) { go(d, 'server'); }).catch(function () { go(inl, 'inline'); });
    } else go(inl, 'inline');
  } catch (e) { note.textContent = 'Failed: ' + e.message; reportErr('site editor ' + (e.stack || e)); window._site = { ready: true, error: String(e.stack || e) }; }
}, 50);
