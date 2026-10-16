/* ============================== 4. START ============================== */
/* [web] Build the ground and cantons, then load the site: site/voth-site.json from the server when there is
   one (always the newest), else the copy build.py inlined. window._site is the probe verify reads. */
setTimeout(function () {
  var note = $('loading');
  try {
    VIEW.stage(); VIEW.terrain(); VIEW.cantons(); VIEW.bridges(); VIEW.falls(); VIEW.cantonLabels(); VIEW.minimap();
    var dc = document.createElement('canvas'); dc.width = dc.height = 64; var dx = dc.getContext('2d');
    dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(32, 32, 26, 0, 7); dx.fill(); dx.lineWidth = 8; dx.strokeStyle = 'rgba(20,18,12,0.9)'; dx.stroke();
    TOOL.dotTex = new THREE.CanvasTexture(dc);
    TOOL.ui(); TOOL.bind();
    var go = function (data, from) {
      TOOL.start(data); TOOL.setMode('select'); TOOL.status();
      $('v-city').onclick();
      note.style.display = 'none';
      window._site = { ready: true, from: from, cantons: VIEW.cantonsMade, bridges: VIEW.bridgeCount, site: SITE, tool: TOOL, view: VIEW };
    };
    var inl = (typeof SITE_INIT !== 'undefined') ? SITE_INIT : null;
    if (location.protocol.indexOf('http') === 0) {
      fetch('../site/voth-site.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
        .then(function (d) { go(d, 'server'); }).catch(function () { go(inl, 'inline'); });
    } else go(inl, 'inline');
  } catch (e) { note.textContent = 'Failed: ' + e.message; console.error(e); window._site = { ready: true, error: String(e.stack || e) }; }
}, 50);
