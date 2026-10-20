/* ============================== 6b. THE SIM'S RUN LOOP ON THE CITY PAGE (P7b) ============================== */
/* [web] The towns declared on core/simulation (40) step with the page's frames: a world minute is a SIM.step, the clock
   runs at the 72-minute day (a third of a world minute a second) times the speed chosen, and it is HELD when the page
   opens, as core/clock holds by default (and so verify.py's day starts where the declaration left it). At most
   `maxPerFrame` minutes a frame: past that the world runs slower than asked, never in a burst. The buttons: run or hold,
   the speed; the HUD's line: the day and hour, and the drawn town's food (the fewest days any of its foods lasts).
   A generic sim clock for core/host is the follow-up (PLAN.md section 9: Voth's 56c lifted); this one has no jump. */
ISLE.RUN = { on: false, speeds: [1, 20, 120], speed: 0, perSec: 1 / 3, carry: 0, last: null, maxPerFrame: 20, note: '' };
ISLE.runTick = function (now) {
  var R = ISLE.RUN, dt = R.last == null ? 0 : Math.min(0.25, (now - R.last) / 1000); R.last = now;
  if (!R.on || !ISLE.SIM) return 0;
  R.carry += dt * R.perSec * R.speeds[R.speed];
  var n = Math.min(Math.floor(R.carry), R.maxPerFrame); if (n <= 0) return 0;
  R.carry = Math.min(R.carry - n, R.maxPerFrame); ISLE.simRun(n); return n;
};
ISLE.runText = function (town) {
  var S = ISLE.SIM; if (!S) return '';
  var C = S.clock, h = Math.floor((C.m % 1440) / 60), m = C.m % 60, X = S.towns[ISLE.TUNE.sim.towns[town].id], low = null;
  if (X && X.econ) X.econ.foods.forEach(function (f) { var d = SIM.economyDays(f, X.id); if (isFinite(d) && (low == null || d < low.d)) low = { f: f, d: d }; });
  return 'day ' + C.day + ' ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + (ISLE.RUN.on ? ' x' + ISLE.RUN.speeds[ISLE.RUN.speed] : ' (held)') +
    (low ? ' · ' + town + "'s food: " + low.f + ' ' + low.d.toFixed(1) + ' days' : '');
};
ISLE.runUI = function (ui) {
  var R = ISLE.RUN, play = document.createElement('button'), fast = document.createElement('button');
  var show = function () { play.textContent = R.on ? 'hold the sim' : 'run the sim'; play.className = R.on ? 'on' : ''; fast.textContent = 'speed x' + R.speeds[R.speed]; };
  play.onclick = function () { R.on = !R.on; R.last = null; show(); };
  fast.onclick = function () { R.speed = (R.speed + 1) % R.speeds.length; show(); };
  show(); ui.appendChild(play); ui.appendChild(fast);
};
