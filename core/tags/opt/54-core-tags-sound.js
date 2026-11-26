// ================================================================= CORE TAGS — the sound record: aeolian emitters ([G data])
// H9 (biomes/hyperjungle/PLAN-LANDS.md section 11): a place that sounds in the wind, as a record core/audio (not written yet) and
// Godot's audio read. It serves hyperjungle's howl bamboo (the borer holes in old culms), Outland Gate's singing buttress (basalt
// dike-ribs in the Outland Bore) and High Rift's Singing Gjár (the organ-pipe drone of wind across deep fissures).
// A sound is registered like anything placed: T.add({class:'feature', kind:'sound', key, at, r, tags:{sound: KTAGS.sound({...})}}).
// Loading this file adds the `sound` tag key (rule 'object') and VOCAB.soundKinds to KTAGS.VOCAB; it changes nothing else, so
// a build that does not load it is untouched. It sits in opt/: a dozen settlements take every numbered file in core/tags. Plain numbers: no THREE, no DOM, no Math.random. The GDScript twin of the level is
// ksound.gd (golden-sound.json; node core/tags/test-sound.js). Needs 50-core-tags.js and 52-core-tags-vocab.js (and core/rand).
//
//   KTAGS.sound(o) -> the record, its kind's row filling what o leaves out:
//     kind     'edge' | 'pipe' | 'cavity' | a preset ('bamboo-howl', 'gjar-organ', 'rib-flute')
//     mode     how the wind makes the tone:
//              edge    vortex shedding off an edge or rib: f = St * u / d (St .2), between lo and hi Hz
//              pipe    a pipe closed at the foot (a fissure, a gap between columns): f0 = c / (4 (L + .6 r)), overblown to the odd
//                      harmonics (3 f0, 5 f0...) as the wind rises
//              cavity  a Helmholtz resonator (a hole into a culm's internode): f = c / (2 pi) * sqrt(A / (V Leff)), A the hole's
//                      area, Leff its neck plus 1.7 r; one tone, louder with the wind
//     d, L, r, V, neck   the sizes the mode reads (m, m3)
//     on, full (m/s)     the wind across it at which it starts, and at which it is at full voice
//     axis (radians from +x toward +z, or null): the wind counts by its part ACROSS this line (a fissure's or a rib's strike);
//              null: any wind
//     gain (0..1), range (m: silent past it), ref (m: full level inside it), partials (pipe: how many odd harmonics, 3),
//     detune (a share: each record's own pitch offset, drawn from KRAND.hash(seed, salt) when the record is made), seed
//   KTAGS.soundLevel(snd, wind:{speed (m/s), dir (radians: the way it blows toward)}, o:{T (C, 15: the air's temperature,
//     which sets the speed of sound)}) -> {on, gain (0..1), pitch (Hz, the loudest partial), u (m/s across), partials:[[Hz, amp]]}
//   KTAGS.soundAt(snd, at:[x,y,z], listener:[x,y,z], wind, o) -> the same with gain times the fall with distance
//     (min(1, ref / dist), easing to 0 over the last quarter of range)
(function(){
 'use strict';
 var root = typeof globalThis !== 'undefined' ? globalThis : this;
 var K = typeof KTAGS !== 'undefined' ? KTAGS : root.KTAGS;
 if (!K || !K.VOCAB) throw new Error('54-core-tags-sound: load 50-core-tags.js and 52-core-tags-vocab.js first');
 if (K.sound) return;
 var TAU = Math.PI * 2;
 function d(v, x){ return v == null ? x : v; }
 function sm(a, b, v){ var t = (v - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

 // the modes' defaults, then the presets the plans name (each a mode and its sizes)
 var KINDS = {
   edge:   { mode: 'edge', d: 0.5, lo: 20, hi: 2000, on: 5, full: 16, gain: 0.6, range: 400, ref: 8 },
   pipe:   { mode: 'pipe', L: 10, r: 0.5, partials: 3, on: 6, full: 20, gain: 0.8, range: 1500, ref: 20 },
   cavity: { mode: 'cavity', r: 0.05, V: 0.035, neck: 0.03, on: 3, full: 12, gain: 0.5, range: 600, ref: 5 },
   // the howl bamboo: fist-sized borer holes into internodes 30 cm across and half a metre long (about 75 Hz: a howl)
   'bamboo-howl': { mode: 'cavity', r: 0.05, V: 0.035, neck: 0.03, on: 3, full: 12, gain: 0.5, range: 900, ref: 6, detuneMax: 0.12 },
   // the Singing Gjár: a fissure 40 m deep and 2 m wide, its fundamental under hearing and its odd harmonics a drone
   'gjar-organ': { mode: 'pipe', L: 40, r: 1, partials: 7, on: 6, full: 22, gain: 0.9, range: 3000, ref: 30, detuneMax: 0.05 },
   // the singing buttress: basalt dike-ribs half a metre thick in the Outland Bore (60-110 km/h): low flute tones
   'rib-flute': { mode: 'edge', d: 0.45, lo: 8, hi: 400, on: 8, full: 28, gain: 0.8, range: 2500, ref: 25, detuneMax: 0.08 }
 };
 K.VOCAB.soundKinds = KINDS;
 K.VOCAB.keys.sound = 'object';

 K.sound = function(o){
   o = o || {};
   var row = KINDS[o.kind == null ? 'edge' : o.kind];
   if (!row) throw new Error('KTAGS.sound: unknown kind ' + o.kind + ' (' + Object.keys(KINDS).join(', ') + ')');
   var s = { kind: o.kind == null ? 'edge' : o.kind }, k;
   for (k in row) if (k !== 'detuneMax') s[k] = row[k];
   for (k in o) if (o[k] !== undefined && k !== 'detune') s[k] = o[k];
   s.axis = o.axis == null ? null : +o.axis;
   s.seed = (o.seed == null ? 1 : o.seed) >>>0;
   if (o.detune != null) s.detune = +o.detune;
   else {
     var R = root.KRAND;
     if (!R) throw new Error('KTAGS.sound: core/rand is needed to draw a detune (or give detune)');
     s.detune = (row.detuneMax == null ? 0.03 : row.detuneMax) * (2 * R.unit(R.hash(s.seed, 0x50D)) - 1);
   }
   if (s.mode !== 'edge' && s.mode !== 'pipe' && s.mode !== 'cavity') throw new Error('KTAGS.sound: mode is edge, pipe or cavity');
   if (!(s.full > s.on) || !(s.on >= 0)) throw new Error('KTAGS.sound: full must be over on, and on not under 0');
   if (s.mode === 'edge' && !(s.d > 0)) throw new Error('KTAGS.sound: an edge needs d > 0');
   if (s.mode === 'pipe' && !(s.L > 0)) throw new Error('KTAGS.sound: a pipe needs L > 0');
   if (s.mode === 'cavity' && !(s.r > 0 && s.V > 0)) throw new Error('KTAGS.sound: a cavity needs r and V > 0');
   if (!(s.range > 0)) throw new Error('KTAGS.sound: range must be over 0');
   return s;
 };

 K.soundLevel = function(s, wind, o){
   o = o || {}; wind = wind || {};
   var sp = d(wind.speed, 0), u = s.axis == null ? sp : sp * Math.abs(Math.sin(d(wind.dir, 0) - s.axis));
   var c = 331.3 * Math.sqrt(1 + d(o.T, 15) / 273.15), det = 1 + s.detune, g = d(s.gain, 1) * sm(s.on, s.full, u), parts = [];
   if (s.mode === 'edge') {
     var f = 0.2 * u / s.d * det;
     parts.push([f < s.lo ? s.lo : f > s.hi ? s.hi : f, 1]);
   } else if (s.mode === 'pipe') {
     var f0 = c / (4 * (s.L + 0.6 * d(s.r, 0))) * det, n = d(s.partials, 3), lift = sm(s.on, s.full * 1.5, u) * (n - 1);
     for (var i = 0; i < n; i++) { var a = 1 - Math.abs(i - lift) / 1.5; parts.push([(2 * i + 1) * f0, a > 0 ? a : 0]); }
   } else {
     var A = Math.PI * s.r * s.r, Le = d(s.neck, 0) + 1.7 * s.r;
     parts.push([c / TAU * Math.sqrt(A / (s.V * Le)) * det, 1]);
   }
   var best = 0; for (var j = 1; j < parts.length; j++) if (parts[j][1] > parts[best][1]) best = j;
   return { on: g > 0, gain: g, pitch: parts[best][0], u: u, partials: parts };
 };

 K.soundAt = function(s, at, listener, wind, o){
   var L = K.soundLevel(s, wind, o), dx = listener[0] - at[0], dy = listener[1] - at[1], dz = listener[2] - at[2];
   var dist = Math.sqrt(dx * dx + dy * dy + dz * dz), ref = d(s.ref, 1), fall = (dist <= ref ? 1 : ref / dist) * (1 - sm(s.range * 0.75, s.range, dist));
   L.gain *= fall; L.on = L.gain > 0; L.dist = dist;
   return L;
 };
})();
