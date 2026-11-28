/* Preset views for Tethis — derived from TETHIS_SITE (8az4-tethis-draw.js).
   All view names use file-safe characters (no :, /, ?, *, ') per tools/check_views.py. */
BUDGET.type.tethis = 'mega';

const NV_A = TETHIS_SITE[0] || { x: -1750, z: 0 };
const NV_B = TETHIS_SITE[1] || { x: 1750, z: 0 };
const NVW = function (S, x, y, z) { return [S.x + x, y, S.z + z]; };

const VIEWS = {
  /* 1. Skyline overview of intact Tethis in the turquoise shallow coral sea (separates T0 cleanly from P1/P2 towers) */
  'Tethis in the shallow sea': NVW(NV_A, -720, 305, 890).concat(NVW(NV_A, 10, 66, -15)),

  /* 2. The Great Mushroom Spire T0, asymmetric stem blister pods, and 24 warm-lit radial soffit ribs (Ref 3) */
  'The Great Mushroom Spire and radial soffit': NVW(NV_A, 165, 82, 225).concat(NVW(NV_A, 0, 148, 0)),

  /* 3. Garden Saucer P3, curved ribbed-glass conservatories, clustered pylons, and Belvedere J1 (Ref 1) */
  'Botanical saucer and skybridge belvedere': NVW(NV_A, -355, 42, 545).concat(NVW(NV_A, -210, 28, 355)),

  /* 4. Satellite dishes on diagonal struts & submerged reef saucer lobes through clear turquoise water (Ref 2) */
  'Satellite dishes and shallow reef lagoon': NVW(NV_A, -235, 68, 255).concat(NVW(NV_A, -15, 6, 35)),

  /* 5. All 4 north Metabolist/Soleri plug-in capsule towers T1a, T1b, T2a, T2b framed uncropped (Ref 4) */
  'Capsule towers and north residential rings': NVW(NV_A, 20, 154, -835).concat(NVW(NV_A, 0, 86, -345)),

  /* 6. Unobstructed waterfront Promenade eye-level acceptance frame on Nexus P0 looking across lagoon to T0 */
  'Grand Promenade at eye level': NVW(NV_A, -66, 56.5, 36).concat(NVW(NV_A, 8, 104, -18)),

  /* 7. Underwater view framed cleanly between P0 pylons onto glowing Benthic Rotunda U0 and coral reef (y < 0) */
  'Underwater Benthic Rotunda and coral shoal': NVW(NV_A, -118, -12, 48).concat(NVW(NV_A, 0, -14, 0)),

  /* 8. Modern Hykkousoi Tethis — skyline with grown nacre rims and T0 helical conch-stair */
  'Hykkousoi Tethis and the conch helix': NVW(NV_B, -690, 265, 850).concat(NVW(NV_B, 10, 68, -15)),

  /* 9. Close-up of the T0 helical conch-stair, grown nacre barnacle-pods, and pearl-oyster lagoon */
  'The conch stair and nacre barnacle rims': NVW(NV_B, 148, 76, 158).concat(NVW(NV_B, 0, 96, 0)),

  /* 10. Hykkousoi grown arched rib-bridge B_6_1 and East Residential Quarter */
  'The grown rib-bridge on the east ring': NVW(NV_B, 425, 48, -235).concat(NVW(NV_B, 292, 26, -168)),

  /* 11. West Harbour ship canal, raised Hykkousoi rib-drawbridge B_5_7s, and Oil-Mirror Pharos T5 */
  'West Harbour drawbridge and Pharos': NVW(NV_B, -530, 46, 155).concat(NVW(NV_B, -530, 26, 0)),

  /* 12. Cut-off Salvage Island P8 and collapsed pipe-bridge wreckage on the shallow seabed (watched by core/ruins) */
  'Salvage Island P8 and collapsed span': NVW(NV_B, 535, 56, 190).concat(NVW(NV_B, 565, 10, 0)),

  /* 13. Underwater flooded Hykkousoi Pearl Sanctuary & Gene-Scriptorium U0 */
  'Underwater flooded Pearl Sanctuary': NVW(NV_B, -116, -12, 46).concat(NVW(NV_B, 0, -14, 0)),

  /* 14. Night view — glowing mushroom soffit coffers, ribbon apartments, and Hykkousoi Pharos fire */
  'Hykkousoi Tethis at night': NVW(NV_B, -680, 225, 820).concat(NVW(NV_B, -20, 68, 0)).concat([1])
};
