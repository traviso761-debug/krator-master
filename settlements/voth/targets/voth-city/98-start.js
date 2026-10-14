/* ============================== 7. START ============================== */
/* [web] Lay the city out on the owner's site, then draw it. window._vc is the probe verify.py reads. */
var vcGo = function () {
  var note = $('loading');
  try {
    SL.layout();
    note.textContent = 'Building Voth\'s structures and the kit pieces...';
    setTimeout(function () {
      try {
        if (/[?&]lite=1/.test(location.search)) HOST.layers.buildings = false;
        VC.start();
        note.style.display = 'none';
        window._vc = { ready: true, plan: PLAN, log: PLAN.log, stats: PLAN.stats, failed: HOST.failed, wall: VC.wall, transit: PLAN.transit,
          setStep: function (k) { $('step').value = k; $('step').oninput(); } };
      } catch (e) { note.textContent = 'Draw failed: ' + e.message; console.error(e); window._vc = { ready: true, error: String(e.stack || e) }; }
    }, 30);
  } catch (e) { note.textContent = 'Layout failed: ' + e.message; console.error(e); window._vc = { ready: true, error: String(e.stack || e), log: PLAN && PLAN.log }; }
};
/* under serve.py the owner's edits are read fresh (site/voth-city-edits.json), so a saved edit shows on the next
   reload without a rebuild; opened any other way the page lays out with what build.py inlined (EDITS_INIT) */
setTimeout(function () {
  if (location.protocol.indexOf('http') !== 0) return vcGo();
  fetch('../site/voth-city-edits.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) { VC.EDITS = j; vcGo(); }).catch(function () { vcGo(); });
}, 50);
