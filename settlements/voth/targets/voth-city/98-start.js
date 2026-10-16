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
        VC.hostTake();   /* core/host's whole interface (97-vc-host-take.js) */
        note.style.display = 'none';
        window._vc = { ready: true, plan: PLAN, log: PLAN.log, stats: PLAN.stats, failed: HOST.failed, wall: VC.wall, transit: PLAN.transit,
          setStep: function (k) { $('step').value = k; $('step').oninput(); } };
      } catch (e) { note.textContent = 'Draw failed: ' + e.message; console.error(e); window._vc = { ready: true, error: String(e.stack || e) }; }
    }, 30);
  } catch (e) { note.textContent = 'Layout failed: ' + e.message; console.error(e); window._vc = { ready: true, error: String(e.stack || e), log: PLAN && PLAN.log }; }
};
/* the owner's edits are KHOST_EDITS (settlements/voth/edits.json, inlined by build.py; a newer draft in this browser
   wins until it is saved: core/host/host.py edits_js), which the layout reads (35-vc-steps.js VC.edits) */
setTimeout(vcGo, 50);
