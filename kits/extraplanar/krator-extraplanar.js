/* ======================================================================
   Krator Extraplanar: the hunters' culture (kits/extraplanar/krator-extraplanar.js)

   The things that walk out of the Ancient's Valley's portals (PLAN.md section 3), on the Mechs kit's machinery:
   MECH_CULTURE and MECH are the mechs core's (kits/mechs/mechs-core.js), read into THIS kit's closure by
   extraplanar_bundle.py, so the culture exists in KratorExtraplanar alone; KratorMechs never sees it.

   No livery, no regalia, nothing a people made. Bone-grey, chrome-dark and black, the glow bucket for every eye
   and the sun. The shared detail maps (when a host passes them) at 2.5x finer and a third of their strength: smooth
   things, scoured, not scrap.

   This file registers the culture, widens the mechs vocabularies for what these are (a hunter, a tripod, a sting, a
   gaze), and holds the marks every hunter shares (XPM): an eye, a halo of eyes, bone ribs, the seed's wear.
   One file per hunter follows (krator-extraplanar-<name>.js).
   ====================================================================== */

MECH_CULTURE('extraplanar', {
  name: 'Extraplanar', sign: 'none: nothing a people made', livery: 'bone-grey, chrome-dark and black; eyes and suns that glow',
  lore: 'What walks out of the Valley\'s portals. Nothing with a face a person would trust.',
  detail: { tile: 2.5, mix: 0.3 },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    bone: 0xd8d2c4, boneDk: 0xa8a094, boneLt: 0xeae6db, void: 0x050406, tar: 0x15141a,
    chrome: 0x3a3c42, chromeLt: 0x6b6e76, chromeDk: 0x232428,
    skin: 0xc9b48a, skinDk: 0x9c8a66, skinLt: 0xe0cfa6,
    robe: 0x1d1a24, robeLt: 0x3a3350, robeHem: 0x2a2538,
    eyeWhite: 0xf2efe6, pupil: 0x0a0a0c, eyeRed: 0xff3a2a, eyeGold: 0xffd56a,
    sun: 0xffd27a, sunHot: 0xfff2c8, sunDk: 0xd9a04a, crater: 0x8a5a2a,
    vein: 0xff3b3b, ringGlow: 0x9fe8ff, seam: 0x7fd4ff, claw: 0xe8e4da
  }
});

/* the vocabularies, widened for this kit (inside its closure only; verify.py checks the tags against these) */
MECH_TYPES.push('hunter');
MECH_DRIVES.push('tripod');
MECH_WEAPONS.push('sting', 'gaze', 'sun', 'rake');

const XPM = {};
/* [0, 1) from the frame's seed through core/rand: every seeded choice of a hunter's build */
XPM.u = function (F, salt, i) { return XP.u(F.seed, salt, i == null ? 0 : i); };
XPM.pick = function (F, salt, i, arr) { return arr[Math.floor(XPM.u(F, salt, i) * arr.length) % arr.length]; };

/* an eye: a white disc with a black pupil, facing +z of the current bone at (x, y, z), radius r; `tint` another white */
XPM.eye = function (F, x, y, z, r, tint) {
  F.cy(x, y, z, r, r, 0.012, tint || F.col('eyeWhite'), 'glow', 'z', 14);
  F.cy(x, y, z + 0.009, r * 0.42, r * 0.42, 0.012, F.col('pupil'), 'glow', 'z', 10);
  F.cy(x, y, z - 0.012, r * 1.12, r * 1.12, 0.012, F.col('tar'), 'metal', 'z', 14);   /* a dark rim behind, so it reads at a distance */
};

/* a halo: a dark ring of radius r about +z of `bone`, carrying n eyes, each on a bone of its own (eye_<i>) so the idle can blink them.
   Returns the eye bones' names. */
XPM.haloOfEyes = function (F, R, bone, r, n, o) {
  o = o || {};
  R.on(bone);
  F.tor(0, 0, 0, r, o.tube == null ? 0.03 : o.tube, F.col('chromeDk'), 'metal', 'z', 36);
  F.tor(0, 0, 0, r * 0.93, 0.008, F.col('ringGlow'), 'glow', 'z', 36);
  const names = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + 0.3, nm = 'eye_' + i, ex = Math.cos(a) * r, ey = Math.sin(a) * r;
    R.bone(nm, bone, ex, ey, 0.03);
    R.on(nm);
    F.rod(-ex * 0.08, -ey * 0.08, -0.03, 0, 0, -0.03, 0.012, F.col('chromeDk'), 'metal');
    XPM.eye(F, 0, 0, 0, o.eye == null ? 0.075 : o.eye);
    names.push(nm);
  }
  R.on(bone);
  return names;
};

/* ribs: n partial rings of bone about the y axis of the current bone round an ellipsoid (a, b, c) between y0 and y1; the seed
   breaks some (a shorter arc) and leaves one out */
XPM.ribs = function (F, x, y0, y1, a, c, n, salt) {
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, y = y0 + (y1 - y0) * t, u = XPM.u(F, salt, i);
    if (u < 0.1) continue;                                          /* a rib gone */
    const sq = Math.sin(t * Math.PI), rr = Math.max(a, c) * (0.55 + 0.5 * sq) + 0.04;
    const arc = u < 0.28 ? Math.PI * 1.25 : Math.PI * 2;               /* a broken rib */
    F.tor(x, y, 0, rr, 0.028 + 0.012 * sq, F.col(i % 3 ? 'bone' : 'boneDk'), 'paint', 'y', 22, arc, 0, u * 6.28, 0);
  }
};

/* the wear: shallow dark pits on a surface, as discs lying just proud of it (a sphere of radius r at (x, y, z)): n of them, from the seed */
XPM.pocks = function (F, x, y, z, r, n, salt, col) {
  for (let i = 0; i < n; i++) {
    const az = XPM.u(F, salt, i * 2) * Math.PI * 2, el = (XPM.u(F, salt, i * 2 + 1) - 0.5) * 2.4;
    const dx = Math.cos(el) * Math.sin(az), dy = Math.sin(el), dz = Math.cos(el) * Math.cos(az), pr = r * (0.08 + 0.1 * XPM.u(F, salt + 1, i));
    F.face(x + dx * (r + 0.004), y + dy * (r + 0.004), z + dz * (r + 0.004), dx, dy, dz, pr, col || F.col('crater'), 'paint', 10);
  }
};

/* a long finger: two rods and a claw tip, from the bone's origin along -y, bent a little toward +z */
XPM.finger = function (F, len, r, col, claw) {
  F.rod(0, 0, 0, 0, -len * 0.55, len * 0.06, r, col, 'paint');
  F.rod(0, -len * 0.55, len * 0.06, 0, -len * 0.95, len * 0.2, r * 0.8, col, 'paint');
  F.cy(0, -len * 1.02, len * 0.26, r * 0.7, 0.003, len * 0.2, claw || F.col('claw'), 'metal', 'y', 6, 0.5, 0, 0);
};
