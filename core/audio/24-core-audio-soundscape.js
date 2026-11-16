// ================================================================= CORE — soundscapes and biome blending
// A soundscape is a biome's or region's acoustic background (core/audio/PLAN.md section 4.3, step A4).
// Plain records and pure functions: no Web Audio, no DOM.
//
// Features:
//   - Curves over the 24-hour day (dawn chorus, midday heat, night cicadas) with cyclic interpolation.
//   - Weather curves over rain, wind, and fog (rain beds swell with downpours; insects mute during storms).
//   - Biome blending: mixes multiple active biomes by their blend weights (e.g. hyperjungle crossfading into savannah).
//   - Deterministic call scheduling using KRAND: reproducible seeded playback for the lab, simulation, and game engines.
//
// Needs core/rand (KRAND). One shared object, KSOUNDSCAPE.

(function(root) {
  var R = root.KRAND;

  function num(v, lo, hi, d) {
    v = +v;
    return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  // Linear interpolation on a sorted 2D curve [[x, y], ...], with optional cyclic wrapping for hours (x in 0..24)
  function evalCurve(points, x, cyclicMax) {
    if (!Array.isArray(points) || !points.length) return 1.0;
    if (points.length === 1) return clamp(num(points[0][1], 0, 1, 1), 0, 1);

    var pts = points.slice().sort(function(a, b) { return a[0] - b[0]; });

    if (cyclicMax > 0) {
      x = ((x % cyclicMax) + cyclicMax) % cyclicMax;
      // If x is before first point or after last point, interpolate across the cyclic boundary
      var first = pts[0], last = pts[pts.length - 1];
      if (x < first[0]) {
        var span = (first[0] + (cyclicMax - last[0]));
        var t = (x + (cyclicMax - last[0])) / span;
        return clamp(last[1] + t * (first[1] - last[1]), 0, 1);
      }
      if (x > last[0]) {
        var span2 = (first[0] + (cyclicMax - last[0]));
        var t2 = (x - last[0]) / span2;
        return clamp(last[1] + t2 * (first[1] - last[1]), 0, 1);
      }
    } else {
      if (x <= pts[0][0]) return clamp(pts[0][1], 0, 1);
      if (x >= pts[pts.length - 1][0]) return clamp(pts[pts.length - 1][1], 0, 1);
    }

    // Standard linear interpolation between bounding points
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      if (x >= p0[0] && x <= p1[0]) {
        var range = p1[0] - p0[0];
        if (range <= 0) return clamp(p0[1], 0, 1);
        var f = (x - p0[0]) / range;
        return clamp(p0[1] + f * (p1[1] - p0[1]), 0, 1);
      }
    }
    return 1.0;
  }

  // Evaluates hour weight [0..1] cyclically over 24 hours
  function evalHour(curve, hour) {
    return evalCurve(curve, hour, 24);
  }

  // Evaluates weather weight [0..1] against atmos state { rain, wind, fog }
  function evalWeather(curves, atmos) {
    if (!curves || typeof curves !== 'object') return 1.0;
    atmos = atmos || {};
    var w = 1.0;
    if (curves.rain) w *= evalCurve(curves.rain, num(atmos.rain, 0, 1, 0), 0);
    if (curves.wind) w *= evalCurve(curves.wind, num(atmos.wind, 0, 3, 1), 0);
    if (curves.fog)  w *= evalCurve(curves.fog,  num(atmos.fog,  0, 1, 0), 0);
    return clamp(w, 0, 1);
  }

  function cleanTrack(t) {
    t = t || {};
    return {
      id: String(t.id || '').slice(0, 80),
      name: String(t.name || '').slice(0, 80),
      clip: String(t.clip || '').slice(0, 80),
      mode: t.mode === 'bed' ? 'bed' : 'events',
      vol: num(t.vol, 0, 2, 0.8),
      pan: num(t.pan, -1, 1, 0),
      speed: num(t.speed, 0.25, 2, 1),
      pitch: num(t.pitch, -24, 24, 0),
      loopXf: num(t.loopXf, 0, 10, 0),
      reverse: !!t.reverse,
      start: num(t.start, 0, 7200, 0),
      end: num(t.end, 0, 7200, 0),
      fadeIn: num(t.fadeIn, 0, 30, 0.05),
      fadeOut: num(t.fadeOut, 0, 30, 0.05),
      // Timed calls parameters
      first: num(t.first, 0, 300, 1),
      every: num(t.every, 0.5, 300, 8),
      jitter: num(t.jitter, 0, 150, 3),
      chance: num(t.chance, 0, 1, 1),
      maxLen: num(t.maxLen, 0, 600, 0),
      rPitch: num(t.rPitch, 0, 12, 0),
      rVol: num(t.rVol, 0, 1, 0),
      rPan: num(t.rPan, 0, 1, 0),
      // Modulation curves
      biome: String(t.biome || '').toLowerCase().slice(0, 80),
      hourCurve: Array.isArray(t.hourCurve) ? t.hourCurve.slice() : null,
      weatherCurve: t.weatherCurve && typeof t.weatherCurve === 'object' ? JSON.parse(JSON.stringify(t.weatherCurve)) : null
    };
  }

  function clean(s) {
    s = s || {};
    var out = {
      id: String(s.id || '').toLowerCase().slice(0, 80),
      name: String(s.name || '').slice(0, 80),
      biome: String(s.biome || '').toLowerCase().slice(0, 80),
      space: num(s.space, 0.5, 6, 2.5),
      tracks: []
    };
    (Array.isArray(s.tracks) ? s.tracks : []).forEach(function(t) {
      out.tracks.push(cleanTrack(t));
    });
    return out;
  }

  function validate(s, clips) {
    var errs = [];
    clips = clips || {};
    if (!s.id) errs.push('id: missing soundscape id');
    if (!s.tracks.length) errs.push('tracks: soundscape must have at least one track');
    s.tracks.forEach(function(t, idx) {
      if (!t.clip) errs.push('track ' + (idx + 1) + ': missing clip id');
      else if (clips && Object.keys(clips).length && !clips[t.clip]) {
        errs.push('track ' + (idx + 1) + ': clip "' + t.clip + '" not found in catalogue');
      }
    });
    return errs;
  }

  // Blends multiple soundscapes by weights, hour of day, and weather conditions
  // soundscapeMap: { [biomeKey]: soundscape }
  // blendWeights:  { [biomeKey]: weight }
  // hour: 0..24
  // atmos: { rain: 0..1, wind: 0..3, fog: 0..1 }
  function blend(soundscapeMap, blendWeights, hour, atmos) {
    soundscapeMap = soundscapeMap || {};
    blendWeights = blendWeights || {};
    hour = num(hour, 0, 24, 12);
    atmos = atmos || {};

    var activeBiomes = Object.keys(soundscapeMap).filter(function(b) {
      return (blendWeights[b] || 0) > 0.001;
    });

    // Normalize weights
    var totalWeight = 0;
    activeBiomes.forEach(function(b) { totalWeight += blendWeights[b]; });
    if (totalWeight <= 0) totalWeight = 1;

    var activeTracks = [];

    activeBiomes.forEach(function(biomeKey) {
      var s = soundscapeMap[biomeKey];
      if (!s) return;
      var biomeW = (blendWeights[biomeKey] || 0) / totalWeight;

      (s.tracks || []).forEach(function(t) {
        var hW = evalHour(t.hourCurve, hour);
        var wW = evalWeather(t.weatherCurve, atmos);
        var effectiveWeight = biomeW * hW * wW;

        if (effectiveWeight > 0.001) {
          activeTracks.push({
            biome: biomeKey,
            track: t,
            effectiveGain: t.vol * effectiveWeight,
            effectiveChance: clamp(t.chance * effectiveWeight, 0, 1),
            hourWeight: hW,
            weatherWeight: wW,
            biomeWeight: biomeW
          });
        }
      });
    });

    return {
      hour: hour,
      atmos: atmos,
      activeBiomes: activeBiomes,
      tracks: activeTracks
    };
  }

  // Deterministic calculation of next event time and randomized params using KRAND
  function nextCall(track, lastTime, seed, callIndex) {
    seed = (seed >>> 0);
    callIndex = (callIndex >>> 0);
    var h0 = R ? R.hash(seed, 0x5055, callIndex, 1) : Math.random() * 0xffffffff;
    var h1 = R ? R.hash(seed, 0x5055, callIndex, 2) : Math.random() * 0xffffffff;
    var h2 = R ? R.hash(seed, 0x5055, callIndex, 3) : Math.random() * 0xffffffff;
    var h3 = R ? R.hash(seed, 0x5055, callIndex, 4) : Math.random() * 0xffffffff;

    var u0 = R ? R.unit(h0) : Math.random();
    var u1 = R ? R.unit(h1) : Math.random();
    var u2 = R ? R.unit(h2) : Math.random();
    var u3 = R ? R.unit(h3) : Math.random();

    // Check chance
    var skip = u0 > (track.chance != null ? track.chance : 1.0);

    // Jittered interval
    var interval = track.every + (u1 - 0.5) * 2 * track.jitter;
    interval = Math.max(0.1, interval);
    var time = (lastTime < 0 ? track.first : lastTime + interval);

    // Random variation
    var dPitch = (u2 - 0.5) * 2 * (track.rPitch || 0);
    var dVol = 1.0 + (u3 - 0.5) * 2 * (track.rVol || 0);
    var dPan = (u0 - 0.5) * 2 * (track.rPan || 0);

    return {
      time: Math.round(time * 1000) / 1000,
      skip: skip,
      pitch: clamp(track.pitch + dPitch, -24, 24),
      vol: clamp(track.vol * dVol, 0, 2),
      pan: clamp(track.pan + dPan, -1, 1)
    };
  }

  var mod = {
    clean: clean,
    validate: validate,
    cleanTrack: cleanTrack,
    evalCurve: evalCurve,
    evalHour: evalHour,
    evalWeather: evalWeather,
    blend: blend,
    nextCall: nextCall
  };

  root.KSOUNDSCAPE = mod;
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})(typeof window !== 'undefined' ? window : global);
