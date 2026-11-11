// ================================================================= ANCIENT TRANSIT — the records: kinds, states, shares  [G data]
// The Ancients' transport infrastructure in ruin (PLAN.md): street furniture, the elevated highway, the train lines. Everything
// placed is a record first; the draw fragments (55-57) decide nothing. No THREE, no DOM: tests/test-transit.js runs these in node.
// Frame: world metres, y up; a heading `yaw` is three's rotation.y (the front, +z, turns to (sin yaw, cos yaw)); a `side` of +1 is
// toward (cos yaw, -sin yaw), -1 the other way. Every choice is a KRAND hash of a stable id and an index, never a draw count.
//
//   KTRANSIT.STATES, KTRANSIT.SPAN_STATES, KTRANSIT.RAIL_STATES, KTRANSIT.STATION_STATES   the vocabularies
//   KTRANSIT.RUIN                     the default shares (span, furniture, rail, station); a host passes its own as o.ruin
//   KTRANSIT.KINDS                    the furniture kinds: footprint, variants, the states each can have, where it stands, its ruin numbers
//   KTRANSIT.shares(spec, allowed)    -> pick(u): a cumulative pick over shares that must sum to 1 (restricted to `allowed`, renormalised)
//   KTRANSIT.pick(seed, kind, state)  -> {kind, state, variant, seed}: a piece to build; state null draws one by the shares
//   KTRANSIT.u(seed, a, b, c)         a unit hash
var KTRANSIT = {};
KTRANSIT.SEED = 4417;
KTRANSIT.u = function (seed, a, b, c) { return KRAND.unit(KRAND.hash(seed >>> 0, a | 0, b == null ? 0 : b | 0, c == null ? 0 : c | 0)); };
KTRANSIT.idHash = function (s) { return KRAND.child(KTRANSIT.SEED, String(s)) >>> 0; };

/* the furniture's ruin states, the lines' (a span of deck or guideway), a rail section's, a station's */
KTRANSIT.STATES = ['intact', 'bent', 'fallen', 'burnt', 'crushed'];
KTRANSIT.SPAN_STATES = ['intact', 'cracked', 'collapsed', 'gone'];
KTRANSIT.RAIL_STATES = ['intact', 'bent', 'gone'];
KTRANSIT.STATION_STATES = ['intact', 'ruined', 'collapsed'];
KTRANSIT.PIER_STATES = ['standing', 'bare', 'stub', 'fill', 'none'];
KTRANSIT.CAR_STATES = ['ok', 'derailed', 'overturned', 'fallen'];
KTRANSIT.RUIN = {
  span: { intact: 0.45, cracked: 0.3, collapsed: 0.15, gone: 0.1 },
  furniture: { intact: 0.12, bent: 0.26, fallen: 0.27, burnt: 0.2, crushed: 0.15 },   /* the owner, 2026-11-08: even more ruined */
  rail: { intact: 0.6, bent: 0.25, gone: 0.15 },
  station: { intact: 0.4, ruined: 0.4, collapsed: 0.2 }
};

/* THE FURNITURE KINDS (the brief's list, 2026-11-08). w, d, h: the intact piece's box (x across, z along, y up), its origin at the
   footprint's centre on the ground, +z its front (a bench faces +z, a shelter opens on +z, a lamp's arm reaches +z). where: 'kerb' (on the
   pavement at the kerb), 'median', 'carriageway' (across or on the road: a gantry, a footbridge, a barrier), 'any'. span: a piece that crosses the
   street takes the street's width plus the pavements' edge as its span (F.span; this is its default, w its most). step: how often a street
   lays one (metres, 0: by weight only). ruin: lean [lo, hi] radians for `bent`, kink: the share of the height above which a bent piece
   kinks further; crush: the height scale of `crushed`; sink: how far `crushed` sinks into the ground (a bench half buried); own: the states the piece draws itself (the
   generic pass leaves them alone: a footbridge's fall is one end down, not the whole turned over; a pole's `crushed` is a stump sheared at its
   foot, never a pole squashed short: the owner, 2026-11-08). glass: the piece has glazing the ruin states break out. The wreckage kinds (rubble_*) come only intact: they ARE the ruin. */
var TR_ALL = KTRANSIT.STATES;
KTRANSIT.KINDS = {
  tr_lamp: { name: 'a lamp standard', w: 0.6, d: 6.2, h: 9, variants: 2, states: TR_ALL, where: 'kerb', step: 30, weight: 0, ruin: { lean: [0.12, 0.45], kink: 0.5, crush: 0.4, own: ['crushed'] } },
  tr_signal: { name: 'a traffic signal', w: 0.6, d: 6.5, h: 7, variants: 2, states: TR_ALL, where: 'kerb', step: 0, weight: 2, ruin: { lean: [0.1, 0.4], kink: 0.55, crush: 0.45, own: ['crushed'] } },
  tr_gantry: { name: 'an overhead sign gantry', w: 32, d: 1.6, h: 9, variants: 2, states: ['intact', 'bent', 'fallen', 'burnt'], where: 'carriageway', step: 0, weight: 1, span: 14, ruin: { lean: [0.08, 0.22], kink: 0.7, crush: 0.5 } },
  tr_sign: { name: 'a street sign', w: 1.2, d: 0.2, h: 3.4, variants: 3, states: TR_ALL, where: 'kerb', step: 0, weight: 6, ruin: { lean: [0.15, 0.6], kink: 0.6, crush: 0.3, own: ['crushed'] } },
  tr_bench: { name: 'a bench', w: 2.2, d: 0.8, h: 0.95, variants: 2, states: ['intact', 'fallen', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 6, ruin: { lean: [0, 0], kink: 1, crush: 0.6, sink: 0.4 } },
  tr_bollard: { name: 'a bollard', w: 0.35, d: 0.35, h: 1.1, variants: 2, states: ['intact', 'bent', 'fallen'], where: 'kerb', step: 0, weight: 8, ruin: { lean: [0.2, 0.7], kink: 1, crush: 0.5 } },
  tr_bin: { name: 'a litter bin', w: 0.7, d: 0.7, h: 1.1, variants: 2, states: ['intact', 'fallen', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 6, ruin: { lean: [0, 0], kink: 1, crush: 0.45 } },
  tr_hydrant: { name: 'a hydrant', w: 0.5, d: 0.5, h: 0.95, variants: 1, states: ['intact', 'bent', 'fallen'], where: 'kerb', step: 0, weight: 4, ruin: { lean: [0.15, 0.5], kink: 1, crush: 0.5 } },
  tr_planter: { name: 'a planter', w: 1.8, d: 1.0, h: 1.3, variants: 2, states: ['intact', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 5, ruin: { lean: [0, 0], kink: 1, crush: 0.55, sink: 0.2 } },
  tr_kiosk: { name: 'a kiosk', w: 3.2, d: 3.4, h: 3.3, variants: 2, states: ['intact', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 2, ruin: { lean: [0, 0], kink: 1, crush: 0.5 }, glass: true },
  tr_shelter: { name: 'a tram shelter', w: 5.2, d: 2.2, h: 3.0, variants: 2, states: ['intact', 'bent', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 3, ruin: { lean: [0.08, 0.25], kink: 1, crush: 0.42 }, glass: true },
  tr_cabinet: { name: 'a utility cabinet', w: 1.6, d: 0.8, h: 1.7, variants: 2, states: ['intact', 'bent', 'burnt', 'crushed'], where: 'kerb', step: 0, weight: 5, ruin: { lean: [0.06, 0.2], kink: 1, crush: 0.5 } },
  tr_barrier: { name: 'a crash barrier', w: 3.0, d: 0.6, h: 0.85, variants: 1, states: ['intact', 'fallen', 'crushed'], where: 'carriageway', step: 0, weight: 4, ruin: { lean: [0, 0], kink: 1, crush: 0.5 } },
  tr_guardrail: { name: 'a guardrail', w: 6.0, d: 0.3, h: 0.8, variants: 1, states: TR_ALL, where: 'median', step: 0, weight: 4, ruin: { lean: [0.2, 0.6], kink: 1, crush: 0.4 } },
  tr_footbridge: { name: 'a pedestrian bridge', w: 34, d: 14, h: 7.5, variants: 2, states: ['intact', 'bent', 'fallen', 'burnt'], where: 'carriageway', step: 0, weight: 1, span: 24, ruin: { lean: [0.05, 0.12], kink: 1, crush: 0.5, own: ['fallen'] } },
  /* the abandoned military positions (the owner, 2026-11-08): laid by KTRANSIT.war, never by the dress (weight 0) */
  tr_sandbags: { name: 'a sandbag wall', w: 4, d: 3, h: 1.1, variants: 2, states: ['intact', 'burnt', 'crushed'], where: 'carriageway', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 0.55 } },
  tr_sentry: { name: 'a sentry post', w: 2.8, d: 2.8, h: 6.6, variants: 2, states: ['intact', 'fallen', 'burnt', 'crushed'], where: 'carriageway', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 0.45 } },
  tr_boom: { name: 'a checkpoint boom', w: 7.2, d: 0.9, h: 1.4, variants: 1, states: ['intact', 'bent', 'fallen', 'burnt'], where: 'carriageway', step: 0, weight: 0, ruin: { lean: [0.2, 0.5], kink: 1, crush: 0.5 } },
  tr_hedgehog: { name: 'a tank trap', w: 2.0, d: 2.0, h: 1.6, variants: 1, states: ['intact', 'bent', 'fallen'], where: 'carriageway', step: 0, weight: 0, ruin: { lean: [0.2, 0.6], kink: 1, crush: 0.5 } },
  tr_wire: { name: 'a coil of razor wire', w: 4, d: 2.0, h: 1.1, variants: 2, states: ['intact', 'crushed'], where: 'carriageway', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 0.35 } },
  tr_rubble_pave: { name: 'a heap of pavement rubble', w: 2.6, d: 2.2, h: 0.9, variants: 2, states: ['intact'], where: 'any', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 1 } },
  tr_rubble_glass: { name: 'a heap of glass', w: 1.8, d: 1.6, h: 0.35, variants: 2, states: ['intact'], where: 'any', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 1 } },
  tr_rubble_cable: { name: 'a tangle of cable', w: 2.4, d: 2.0, h: 0.6, variants: 2, states: ['intact'], where: 'any', step: 0, weight: 0, ruin: { lean: [0, 0], kink: 1, crush: 1 } }
};
KTRANSIT.KIND_KEYS = Object.keys(KTRANSIT.KINDS);

/* a cumulative pick over shares: spec {state: share} summing to 1 (within 1e-6, else it throws: a share typed wrong is a bug, not a
   tendency); allowed (optional) restricts it to those states and renormalises. Returns pick(u) for u in [0, 1). */
KTRANSIT.shares = function (spec, allowed) {
  if (!spec || typeof spec !== 'object') throw new Error('KTRANSIT.shares: a {state: share} object, please');
  var keys = Object.keys(spec), sum = 0;
  keys.forEach(function (k) { var v = +spec[k]; if (!(v >= 0) || !isFinite(v)) throw new Error('KTRANSIT.shares: ' + k + ' is not a share'); sum += v; });
  if (Math.abs(sum - 1) > 1e-6) throw new Error('KTRANSIT.shares: the shares sum to ' + sum + ', not 1');
  var use = allowed ? keys.filter(function (k) { return allowed.indexOf(k) >= 0; }) : keys;
  if (!use.length) throw new Error('KTRANSIT.shares: no allowed state has a share');
  var tot = 0; use.forEach(function (k) { tot += +spec[k]; });
  if (tot <= 0) { use = use.slice(0, 1); tot = 1; spec = {}; spec[use[0]] = 1; }
  return function (u) { var acc = 0; for (var i = 0; i < use.length; i++) { acc += spec[use[i]] / tot; if (u < acc) return use[i]; } return use[use.length - 1]; };
};

/* one piece to build: its kind (a key of KINDS, else it throws), its state (given and allowed, or drawn by the shares among the kind's
   states), its variant and the seed its builder draws from, all hashed from `seed` */
KTRANSIT.pick = function (seed, kind, state, shares) {
  var K = KTRANSIT.KINDS[kind]; if (!K) throw new Error('KTRANSIT.pick: no kind ' + kind);
  if (state != null) { if (K.states.indexOf(state) < 0) throw new Error('KTRANSIT.pick: ' + kind + ' has no state ' + state); }
  else state = KTRANSIT.shares(shares || KTRANSIT.RUIN.furniture, K.states)(KTRANSIT.u(seed, 11, 0, 0));
  return { kind: kind, state: state, variant: Math.floor(KTRANSIT.u(seed, 12, 0, 0) * K.variants) % K.variants, seed: KRAND.hash(seed >>> 0, 13) >>> 0 };
};
/* the ruin numbers of a piece in a state: lean (radians), kink (height share), yaw of the fall, crush scale, sink, soot: one hash each */
KTRANSIT.ruinOf = function (seed, kind, state) {
  var K = KTRANSIT.KINDS[kind], R = K.ruin, u = function (k) { return KTRANSIT.u(seed, 20 + k, 0, 0); };
  /* a long piece (a gantry, a guardrail, a shelter) leans over its length and falls about it; a narrow one (a lamp, a sign) leans any way and
     falls about its front axis, so its arm stays flat on the ground */
  var long = K.w > 1.5 * K.d;
  return { state: state, lean: state === 'bent' ? R.lean[0] + (R.lean[1] - R.lean[0]) * u(0) : 0, leanDir: long ? (u(1) < 0.5 ? 0 : Math.PI) : u(1) * Math.PI * 2, kink: R.kink,
    kinkMore: state === 'bent' ? 0.3 + 0.6 * u(2) : 0, fallYaw: (u(3) - 0.5) * 1.2, fallSide: u(4) < 0.5 ? -1 : 1, fallAxis: K.w >= K.d ? 'x' : 'z', own: R.own && R.own.indexOf(state) >= 0,
    crush: state === 'crushed' ? R.crush * (0.8 + 0.4 * u(5)) : 1, sink: state === 'crushed' ? (R.sink == null ? 0 : R.sink) : 0,
    soot: state === 'burnt' ? 0.16 + 0.12 * u(6) : (state === 'intact' ? 0.82 + 0.18 * u(6) : 0.55 + 0.25 * u(6)),
    glass: state === 'intact' ? u(7) < 0.7 : (state === 'bent' && u(7) < 0.25), rust: state === 'intact' ? 0.55 + 0.35 * u(8) : 0.85 + 0.15 * u(8) };
};
