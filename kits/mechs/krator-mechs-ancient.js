/* ======================================================================
   Krator Mechs: the Ancients (kits/mechs/krator-mechs-ancient.js)

   The Ancients' own machines as the Ancient's Valley finds them (biomes/ancientsvalley/
   PLAN.md section 6, "Feral robots"; the owner, 2026-11-09): a thousand years feral in
   a ruined megalopolis. Utilitarian, no livery, no regalia, no rider by nature. Ancient
   white render over a dark frame, dark glass for the sensors, and all of it gone to rust
   and soot: which panels have rusted through is drawn from the seed, so a street of one
   chassis is not a row of twins. Lenses and lamps are the glow bucket (a host's
   KratorMechs.lights(g, false) kills them).

   Three behaviours on shared chassis, so the far view cannot tell them apart (tags.role,
   per variant; KratorMechs.roleOf(key, v)):
     KEEPER   at its thousand-year routine: a sweeper, a porter with a crane that loads
              nothing, a lamplighter, a gardener. Its "attack" clip is that routine.
     HUNTER   attacks on sight: the stilt tripod, the shrouded walker, the hunched trooper
              (the Stalkers of the Catch are the kind's model).
     FEIGNER  a keeper chassis, docile until the moment: its variant carries the real
              attack clip and a TELL the host can read before the blow: a `call` event
              of kind 'tell' (a sound, a flag for the sim), a red lamp that comes on
              (the `tell` bone, hidden at rest) and the head turning to track. The valley
              decides who turns (Eternian influence is a game system: the biome gives a
              `calls` flag, nothing more).

   This file registers the culture and the dressing every Ancient machine shares (ANC
   below); one file per machine follows it (krator-mechs-ancient-<name>.js).
   ====================================================================== */

MECH_CULTURE('ancient', {
  name: 'Ancients', sign: 'none: a unit plate, long since blank', livery: 'Ancient white render and dark glass gone to rust and soot; amber, cyan and red lenses',
  lore: 'The Ancients\' own machines as the Valley finds them, a thousand years feral: keepers at their routines, hunters, and feigners that pass for keepers until they turn',
  /* the shared detail maps a little finer than the Iziz scrap and at two thirds of their strength: render and composite, not riveted plate */
  detail: { tile: 1.6, mix: 0.7 },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    white: 0xd6d2c8, whiteDk: 0xb5b0a5, whiteLt: 0xe4e0d7, render: 0xc8c3b7,
    frame: 0x5f5d58, frameDk: 0x3e3d3a, joint: 0x2c2c2e, steel: 0x8a8781, chrome: 0xaeaba3,
    rust: 0x7b4526, rustDk: 0x4f2b17, rustLt: 0x9a5d31, soot: 0x2a2725, grime: 0x6b6256, oxide: 0x4e7a6c,
    glass: 0x1a2128, glassDk: 0x0f1317, lensDead: 0x3a3a38,
    amber: 0xffb45a, lensWarm: 0xffd59a, lensRed: 0xff3a2a, lensAmber: 0xffa040, cyan: 0x66d9e2, glowBlue: 0x66d9e2, eye: 0x66d9e2,
    rubber: 0x262628, hose: 0x4a4744, hoseDk: 0x343230, bristle: 0x6e5a3a, bristleDk: 0x4a3c26,
    /* the service livery (the owner's references, 2026-11-09: the yellow work machines): a safety yellow faded to ochre, and
       the hazard stripes' black, red and white */
    work: 0xc49a3c, workDk: 0x9a782c, workLt: 0xd6b25a, hazard: 0x1f1d1b, hazardRed: 0xa83a2a, hazardWhite: 0xe6e0d2
  }
});

const ANC = {};
/* a panel's colour by the seed: white render, or rusted through with chance p (the lower parts take a higher p) */
ANC.wear = function (F, p) {
  if (!F.chance(p == null ? 0.3 : p)) return F.col('white');
  return F.col(F.pick(['rust', 'rust', 'rustDk', 'rustLt', 'grime']));
};
/* a white panel's darker, dirtier neighbour (so two panels side by side read as two) */
ANC.wearDk = function (F, p) { const c = ANC.wear(F, p); return c === F.col('white') ? F.col('whiteDk') : c; };
/* a sooted part: the feet, the undersides, anything near a burn */
ANC.soot = function (F) { return F.col(F.chance(0.5) ? 'soot' : 'grime'); };
/* a work-livery panel (the keepers, and the service frames the war armed): faded yellow, or rusted through with chance p */
ANC.work = function (F, p) {
  if (!F.chance(p == null ? 0.3 : p)) return F.col(F.chance(0.3) ? 'workDk' : 'work');
  return F.col(F.pick(['rust', 'rustDk', 'rustLt', 'grime']));
};
/* hazard stripes: diagonal bands on a w x h panel centred at (x, y, z) facing +z (turned rx, ry, rz), standing 6 mm proud of
   the surface they lie on (put them at surface + 0.006). kind 'yb' black on yellow (industrial), 'rw' red on white (the
   booms and bumpers) */
ANC.hazard = function (F, x, y, z, w, h, kind, rx, ry, rz) {
  const cols = kind === 'rw' ? [F.col('hazardRed'), F.col('hazardWhite')] : [F.col('hazard'), F.col('work')];
  F.bands(x, y, z, w, h, 0.785, Math.max(0.04, h * 0.55), cols, 'paint', rx, ry, rz);
};
/* twin round lamps (the service machines' faces: two bezels side by side): radius r, gap g, facing +z, turned ry */
ANC.twinLamps = function (F, x, y, z, r, g, kind, ry) {
  ry = ry == null ? 0 : ry;
  const c = Math.cos(ry), s = Math.sin(ry);
  for (const t of [-1, 1]) {
    const lx = x + t * (g / 2) * c, lz = z - t * (g / 2) * s;
    F.cy(lx, y, lz, r * 1.2, r * 1.2, 0.05, F.col('frameDk'), 'metal', 'z', 14, 0, ry, 0);
    ANC.lens(F, lx + s * 0.03, y, lz + c * 0.03, s, 0, c, r, kind || 'amber', null);
  }
};
/* a rotating beacon on a short post: an amber dome (glow) under a dark cap */
ANC.beacon = function (F, x, y, z, r) {
  r = r == null ? 0.06 : r;
  F.cy(x, y + r * 0.3, z, r * 1.1, r * 1.0, r * 0.6, F.col('frameDk'), 'metal', 'y', 10);
  F.sph(x, y + r * 0.6, z, r * 0.85, r * 1.1, r * 0.85, F.col('lensAmber'), 'lampAmber', 10, 6, 0, TAU, 0, Math.PI / 2);
  F.cy(x, y + r * 1.75, z, r * 0.9, r * 0.6, r * 0.2, F.col('frameDk'), 'metal', 'y', 10);
};
/* a whip aerial on a swinging bone `name` from (x, y, z) of parent, len tall, a bead at the tip */
ANC.aerial = function (F, R, name, parent, x, y, z, len, lean) {
  R.dangle(name, parent, x, y, z, { mode: 'whip', len: len, k: 36, c: 3.5, wind: 0.02, max: 0.3, rx: lean == null ? -0.15 : lean });
  R.on(name);
  F.cy(0, 0.04, 0, 0.02, 0.02, 0.08, F.col('frameDk'), 'metal', 'y', 6);
  F.rod(0, 0, 0, 0, len, 0, 0.007, F.col('steel'), 'metal');
  F.knob(0, len, 0, 0.014, F.col('frameDk'), 'metal');
  R.on(parent);
};
/* a ladder of n rungs up a flank: rails and rungs standing off a face at (x, y, z) that faces (sx, 0, 0), h tall, w wide */
ANC.ladder = function (F, x, y, z, sx, w, h, n) {
  for (const t of [-1, 1]) F.cb(x + sx * 0.05, y, z + t * w / 2, 0.025, h, 0.025, F.col('frameDk'), 'metal');
  for (let i = 0; i < n; i++) F.cb(x + sx * 0.035, y - h / 2 + h * (i + 0.5) / n, z, 0.02, 0.02, w, F.col('steel'), 'metal');
};
/* a chain: a line of links (beads) from the top down len on the current bone, radius r */
ANC.chain = function (F, x, y, z, len, r) {
  const n = Math.max(2, Math.round(len / (r * 3)));
  F.rod(x, y, z, x, y - len, z, r * 0.45, F.col('frameDk'), 'metal');
  for (let i = 0; i < n; i++) F.cy(x, y - len * (i + 0.5) / n, z, r, r, r * 1.6, F.col('steel'), 'metal', i % 2 ? 'x' : 'z', 6);
};

/* a lens. kind: 'amber' | 'cyan' | 'red' live (the glow bucket), 'dead' a grey glass gone blind. Facing (dx, dy, dz),
   radius r, with a dark housing when `housing` is given */
ANC.lens = function (F, x, y, z, dx, dy, dz, r, kind, housing) {
  if (kind === 'dead') {
    const n = Math.hypot(dx, dy, dz) || 1, ux = dx / n, uy = dy / n, uz = dz / n;
    if (housing != null) F.taper(x - ux * r * 1.7, y - uy * r * 1.7, z - uz * r * 1.7, ux, uy, uz, r * 0.7, r * 1.15, r * 1.6, housing, 'metal', 8);
    F.face(x + ux * 0.006, y + uy * 0.006, z + uz * 0.006, ux, uy, uz, r, F.col('lensDead'), 'metal', 10);
    return;
  }
  MP.lamp(F, x, y, z, dx, dy, dz, r, kind === 'cyan' ? 'cell' : kind === 'red' ? 'tail' : kind === 'white' ? 'head' : 'amber', housing);
};
/* a ring of n small lenses round a dome of radius R centred at (x, y, z), at latitude lat (radians up from the
   equator), facing outward: the many-eyed sensor heads */
ANC.eyes = function (F, x, y, z, R, n, lat, kind, r, phase) {
  for (let i = 0; i < n; i++) {
    const a = (phase == null ? 0 : phase) + i * TAU / n, cl = Math.cos(lat), sl = Math.sin(lat);
    const dx = Math.sin(a) * cl, dy = sl, dz = Math.cos(a) * cl;
    F.knob(x + dx * (R - 0.01), y + dy * (R - 0.01), z + dz * (R - 0.01), r == null ? 0.03 : r, F.col(kind === 'amber' ? 'amber' : kind === 'red' ? 'lensRed' : 'cyan'), 'glow');
  }
};
/* a dark glass strip (a dead screen, a visor) standing 8 mm proud of its panel, facing (dx, dy, dz) */
ANC.visor = function (F, x, y, z, w, h, rx, ry, rz) {
  F.cb(x, y, z, w, h, 0.016, F.col('glassDk'), 'metal', rx, ry, rz);
};
/* the blank unit plate: a small darker rectangle standing proud, where the glyphs were */
ANC.plate = function (F, x, y, z, w, h, rx, ry, rz) {
  F.cb(x, y, z, w, h, 0.012, F.col('whiteDk'), 'paint', rx, ry, rz);
};
/* a ribbed sleeve round a limb segment: n rings of radius r on a core of radius r * 0.84 between y0 and y1 (one colour,
   so the stack never fights itself) */
ANC.sleeve = function (F, y0, y1, r, col, n) {
  const L = y1 - y0, m = n == null ? 5 : n;
  F.cy(0, (y0 + y1) / 2, 0, r * 0.84, r * 0.84, L, col, 'rubber', 'y', 12);
  for (let i = 0; i < m; i++) F.cy(0, y0 + L * (i + 0.5) / m, 0, r, r, L / m * 0.55, col, 'rubber', 'y', 12);
};
/* a conduit between two bones, in the hose colours */
ANC.conduit = function (F, R, a, pa, b, pb, r, sag, segs) {
  MP.hose(F, R, a, pa, b, pb, r, F.col(F.chance(0.5) ? 'hose' : 'hoseDk'), sag, segs);
};
/* a rust streak running down a panel from (x, y, z): a thin dark strip standing 8 mm proud, facing (0, 0, 1) turned by ry */
ANC.streak = function (F, x, y, z, len, w, ry) {
  F.cb(x, y - len / 2, z, w == null ? 0.05 : w, len, 0.012, F.col(F.chance(0.6) ? 'rustDk' : 'rust'), 'paint', 0, ry == null ? 0 : ry, 0);
};

/* ---------------------------------------------------------------- the tell
   A red lamp on a bone `tell`, drawn on `parent` at (x, y, z) facing (dx, dy, dz): the runtime scales the bone to
   nothing except while a feigner's attack clip runs (ANC.hiddenIdle in the entry's anim.idle; ANC.reveal marks the
   clip's keys), so the lamp comes on at the tell and goes out when the clip ends. A keeper variant on the same
   chassis never shows it. */
ANC.tell = function (F, R, parent, x, y, z, dx, dy, dz, r) {
  r = r == null ? 0.04 : r;
  const n = Math.hypot(dx, dy, dz) || 1, ux = dx / n, uy = dy / n, uz = dz / n;
  R.on(parent);
  F.taper(x - ux * r * 1.2, y - uy * r * 1.2, z - uz * r * 1.2, ux, uy, uz, r * 0.9, r * 1.25, r * 1.3, F.col('frameDk'), 'metal', 8);
  R.bone('tell', parent, x, y, z);
  R.on('tell');
  F.knob(ux * r * 0.3, uy * r * 0.3, uz * r * 0.3, r, F.col('lensRed'), 'lampTail');
  R.point('tell_pt', 'tell', ux * r, uy * r, uz * r);
  R.on(parent);
};
/* the idle gate for hidden bones: nothing at rest, their clip keys decide while a clip runs. names: ['tell', 'flick', ...]
   (only the variants in `feign` show the tell: a keeper variant's routine clip keeps it dark) */
ANC.hiddenIdle = function (P, st, names) {
  const feign = st.A.feign == null ? [] : st.A.feign;
  for (const n of names) {
    if (!st.by[n]) continue;
    const show = st.atk >= 0 && (n !== 'tell' || feign.indexOf(st.variant) >= 0);
    P.sc[n] = show ? 1 : 0.0001;
  }
};
/* mark a clip's keys: bone `name` is shown from tOn (to tOff), hidden before (and after). The scale lerps across the
   segment that ends at tOn, so author a key shortly before the tell for a snap. Returns the clip. */
ANC.reveal = function (clip, name, tOn, tOff) {
  for (const k of clip.keys) {
    const t = k[0], on = t >= tOn - 1e-6 && (tOff == null || t < tOff - 1e-6);
    (k[1].sc || (k[1].sc = {}))[name] = on ? 1 : 0.0001;
  }
  return clip;
};
/* the tell event: a `call` of kind 'tell' at time t from a named point (the lamp's), for the host's ear and the sim */
ANC.tellEvent = function (t, at) { return { t: t, type: 'call', kind: 'tell', at: at || 'tell_pt', dir: [0, 0, 1] }; };
/* a feigner clip: the keys (with their tell at tOn marked) and the tell event added to the events */
ANC.feign = function (clip, tOn) {
  ANC.reveal(clip, 'tell', tOn);
  clip.events = (clip.events || []).concat([ANC.tellEvent(tOn + 0.02)]);
  return clip;
};
