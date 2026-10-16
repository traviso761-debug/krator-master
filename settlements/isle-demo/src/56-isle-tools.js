/* ============================== 3b. THE ISLE'S TOOLS: TOWNS, SAVING, VIEWS ============================== */
/* [web] Runs after Voth's tools (55-site-tools.js, read in place) and changes only what is Voth's own there:
   - Voth's things are not on this map: no canton docks to start the stops from, no causeways of Voth's to take over
     (SITE.vothStations and SITE.vothCauseways are empty), a blank site is the isle demo's;
   - saving: each town's drawing goes to its own entry of site/isle-site.json (POST /save/isle-site?town=, serve.py
     merges it in, so saving one town never touches the other), with the town's frame; the draft in the browser is
     kept per town; a download (or a copy) is the one town's site; an import takes a town's site or the whole file;
   - the town buttons reload the page on the other town (the ground is raised per town);
   - the map and city views look at the town, the words for Voth's ferries and elephant bugs are the isles'. */
VOTH.rectFrus = function (tx) {            /* Voth's tapered box (45-kit.js): base 1 x 1, top tx, height 1, base at y = 0 */
  return new THREE.CylinderGeometry(Math.SQRT1_2 * tx, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0);
};
VIEW.cantonList = [];
SITE.vothStations = function () { return []; };
SITE.vothCauseways = function () { return []; };
(function () {
  var blank0 = SITE.blank;
  SITE.blank = function () { var b = blank0(); b.site = 'isle-demo'; b.causeways = []; b.stations = []; return b; };
  var replace0 = TOOL.replaceAll;
  /* an import of the whole file takes this town's entry */
  TOOL.replaceAll = function (o) { if (o && o.towns) o = ISLE.townSite(o, ISLE.F.town) || SITE.blank(); replace0(o); };
})();
TOOL.HINTS.causeway = 'Click to lay a causeway or jetty corner by corner; double-click or Enter to finish. In the editor: mole (fill) or bridge (a deck), and its width.';
TOOL.HINTS.lower = 'Hold the left button on the ground to lower it; below the sea (0 m) it fills with water. [ and ] change the brush size.';
TOOL.HINTS.ferry = 'Click the water (or a beach) to place a canoe landing: a stop on a sea line.';
TOOL.HINTS.strider = 'Click the ground to place a land stop (a road or path line).';
TOOL.HINTS.route = 'Click stops in order to make a line (canoe landings or land stops, not both); Enter or double-click finishes; Backspace drops the last stop; Esc cancels.';

/* this town's site as the file keeps it: its frame, then its drawing */
ISLE.townJSON = function () { var o = { town: ISLE.F.town, frame: ISLE.F }; Object.keys(SITE.data).forEach(function (k) { o[k] = SITE.data[k]; }); return JSON.stringify(o, null, 1); };
TOOL.save = function () {
  var prev = SITE.data.saved;
  SITE.data.saved = new Date().toISOString();
  fetch('/save/isle-site?town=' + encodeURIComponent(ISLE.F.town), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ISLE.townJSON() })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function () { SITE.dirty = false; TOOL.status(); TOOL.flash('saved ' + ISLE.F.town + ' to site/isle-site.json'); try { localStorage.removeItem(TOOL.DRAFT); } catch (e) { } })
    .catch(function () { SITE.data.saved = prev; TOOL.download(); TOOL.flash('no save server: downloaded instead (python3 serve.py saves into settlements/isle-demo/site/)'); });
};
TOOL.download = function () {
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ISLE.townJSON()], { type: 'application/json' }));
  a.download = 'isle-site.' + ISLE.F.town.toLowerCase() + '.json'; a.click();
};
/* the tools' buttons, after TOOL.ui: the copy, the towns, clear, the views */
ISLE.tools = function () {
  var T = ISLE.F.town;
  $('town').textContent = T;
  document.title = T + ' · Isle Demo Site Planner';
  $('b-copy').onclick = function () { TOOL.copy(ISLE.townJSON()); };
  ISLE.TOWNS.forEach(function (n) {
    var b = $('t-' + n); if (!b) return;
    b.classList.toggle('on', n === T);
    b.onclick = function () {
      if (n === T) return;
      if (SITE.dirty && !confirm('Leave ' + T + '? Its unsaved changes stay in this browser as a draft (restore it when you come back).')) return;
      TOOL.autosave(); SITE.dirty = false;
      location.search = '?town=' + encodeURIComponent(n);
    };
  });
  $('b-clear').onclick = function () {
    if (confirm('Remove every district, line, marker, stop and ground edit in ' + T + '? (Undo brings it all back.)')) TOOL.replaceAll(SITE.blank());
  };
  var gy = Math.max(0, VOTH.terrainH(0, 0));   /* the views look at the town's centre on its ground */
  $('v-map').onclick = function () { ctl.target.set(0, gy * 0.5, 0); ctl.dist = 7600; ctl.el = 1.45; ctl.az = 0; updateCamera(); };
  $('v-city').onclick = function () { ctl.target.set(0, gy, 0); ctl.dist = 2400; ctl.el = 0.75; ctl.az = 0.35; updateCamera(); };
};
