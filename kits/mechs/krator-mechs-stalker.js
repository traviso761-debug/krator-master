/* ======================================================================
   Krator Mechs: the Stalkers (kits/mechs/krator-mechs-stalker.js)

   The quiet robotic killers of the Catch (LORE.md section 4, Hub 01; biomes/catch/PLAN.md
   section 6c): about the size of a man, in pairs or triads, hunting stragglers and lying
   in wait under the sand. Two kinds: the harpooner (a two-legged hull with a pneumatic
   harpoon gun on each side) and the blade (a hunched walker whose long arms end in hooked
   blades). Their source is Hub 01 and the mad mind in it, which no one in the world knows;
   nothing here says so on the model.

   Sleeker than the Iziz walkers (the owner, 2026-10-23): the Ancients' own make, never
   refitted. Smooth white shells scoured by sand, tight joints, flexible sleeves on the
   legs, nothing tied or bolted on. Grey frame, dark joints, a red unit stripe, cyan and
   red sensor lights, teal and red hoses where the core shows.

   This file registers the culture and its few shared marks (ST below); one file per
   Stalker follows it (krator-mechs-stalker-<kind>.js).
   ====================================================================== */

MECH_CULTURE('stalker', {
  name: 'Stalkers', sign: 'a unit number and a red stripe, the Ancients\' own marks',
  livery: 'sand-scoured white shells, grey frame, dark joints, a red stripe, cyan and red lenses',
  lore: 'Quiet robotic killers of the Catch, about the size of a man, in pairs or triads',
  /* the shared maps three times finer and at a third of their strength: a man-sized, smooth shell, scoured, not scrap */
  detail: { tile: 3, mix: 0.35 },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    shell: 0xe2ded5, shellDk: 0xc7c2b7, frame: 0x6d6b67, frameDk: 0x4a4946, joint: 0x2e2e30, sleeve: 0x8d8a84,
    red: 0xc0392b, teal: 0x2f8f9a, blade: 0xc9ccd0, tip: 0x9fa4aa, eye: 0xff4a36, cyan: 0x5fd8e4, rubber: 0x262628
  }
});

const ST = {};
/* the unit stripe: four short red slashes standing a few millimetres proud of a curved shell, facing (s, 0, 0) */
ST.hatch = function (F, x, y, z, s, n, len) {
  n = n || 4; len = len || 0.09;
  for (let i = 0; i < n; i++) F.cb(x, y, z - (i - (n - 1) / 2) * 0.03, 0.02, len, 0.014, F.col('red'), 'paint', 0.45, 0, 0);
};
/* two small cyan running lights on a side */
ST.lights = function (F, x, y, z, s) {
  for (let i = 0; i < 2; i++) F.knob(x, y - i * 0.05, z + i * 0.02, 0.011, F.col('cyan'), 'glow');
};
