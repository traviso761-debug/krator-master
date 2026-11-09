(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KRATOR_AUDIO_PLAYBACK = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = Object.freeze({
    maxAmbientBeds: 4,
    minStingIntervalSeconds: 120,
    maxStingsPerFiveMinutes: 4,
    maxSimultaneousStings: 1
  });

  function boundedInt(value, fallback, min, max) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
  }

  function normalizeSettings(settings) {
    const value = settings || {};
    return {
      maxAmbientBeds: boundedInt(value.maxAmbientBeds, DEFAULTS.maxAmbientBeds, 1, 16),
      minStingIntervalSeconds: boundedInt(value.minStingIntervalSeconds, DEFAULTS.minStingIntervalSeconds, 0, 1800),
      maxStingsPerFiveMinutes: boundedInt(value.maxStingsPerFiveMinutes, DEFAULTS.maxStingsPerFiveMinutes, 1, 20),
      maxSimultaneousStings: boundedInt(value.maxSimultaneousStings, DEFAULTS.maxSimultaneousStings, 1, 8)
    };
  }

  function selectBeds(candidates, maximum) {
    const cap = boundedInt(maximum, DEFAULTS.maxAmbientBeds, 1, 16);
    return (candidates || [])
      .filter(item => item && item.eligible)
      .map((item, index) => ({ item, index }))
      .sort((a, b) => Number(!!b.item.active) - Number(!!a.item.active) || a.index - b.index)
      .slice(0, cap)
      .map(entry => entry.item.id);
  }

  function createStingLimiter(settings) {
    let limits = normalizeSettings(settings);
    let lastStart = -Infinity;
    let sequence = 0;
    const starts = [];
    const active = new Map();

    function prune(now) {
      while (starts.length && starts[0] <= now - 300) starts.shift();
    }

    return {
      configure(next) { limits = normalizeSettings(next); },
      reserve(track, now, duration) {
        const time = Number(now);
        if (!Number.isFinite(time)) return { ok: false, reason: 'invalid-time' };
        prune(time);
        if (time - lastStart < limits.minStingIntervalSeconds) return { ok: false, reason: 'minimum-interval' };
        if (starts.length >= limits.maxStingsPerFiveMinutes) return { ok: false, reason: 'rolling-window' };
        if (active.size >= limits.maxSimultaneousStings) return { ok: false, reason: 'simultaneous-limit' };
        const id = ++sequence;
        starts.push(time);
        lastStart = time;
        active.set(id, { track, startedAt: time, endsAt: time + Math.max(0.01, Number(duration) || 0.01) });
        return { ok: true, id };
      },
      release(id) { active.delete(id); },
      snapshot(now) {
        prune(Number(now));
        return { recentStarts: starts.length, active: Array.from(active.values()), lastStart };
      }
    };
  }

  function scheduleStingEvents(events, settings) {
    const limiter = createStingLimiter(settings);
    const ordered = (events || []).map((event, index) => ({ event, index }))
      .sort((a, b) => a.event.time - b.event.time || a.index - b.index);
    const accepted = [];
    const reservations = [];
    ordered.forEach(({ event }) => {
      reservations.forEach(reservation => {
        if (reservation.endsAt <= event.time) limiter.release(reservation.id);
      });
      const result = limiter.reserve(event.track, event.time, event.duration);
      if (!result.ok) return;
      reservations.push({ id: result.id, endsAt: event.time + Math.max(0.01, Number(event.duration) || 0.01) });
      accepted.push(event);
    });
    return accepted;
  }

  return { DEFAULTS, normalizeSettings, selectBeds, createStingLimiter, scheduleStingEvents };
});
