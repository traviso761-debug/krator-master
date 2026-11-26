// ================================================================= FLOATING CITY — Submarine & Hero Hall Interiors (KROOMLIGHT) [G data]
// Camera-independent [G data] hero interior rooms and Stage 7 KROOMLIGHT portal/vault lighting audit:
//   1. Pioneer Submarine Dynamo Control Hall (-62 m, vault: true -> 0.000 sky PMREM / portal daylight leak!)
//   2. AS-01 Court of the Amber Seal Bullion Vault (+102 m, vault: true -> 0.000 sky leak, warm amber-lamp pool)
//   3. Khao Phra Sumeru River-Peace Rotunda (+22 m, 4 cardinal lotus portals -> positive portal daylight)
//   4. Tooka-Hoov Suudme Amber Bourse Hall (+104 m, glazed Ishtar portal & sanjhya counting gallery)
//   5. Upper-Ria Hongsa Truce Court (+6.2 m, open colonnade facing the East Sea-Ring Harbour Berth)
const FC_INTERIORS = (function () {
  'use strict';
  const HALLS = [
    {
      id: 'fc.int.dynamo_hall',
      name: 'Pioneer Submarine Hydro-Dynamo Control Hall',
      x: 0, y: -62.0, z: 180.0, w: 38.0, d: 38.0, h: 9.5,
      vault: true,
      envMapIntensity: 0.0,
      openings: [],
      lamps: [
        { x: -12, y: -56, z: 168, color: 0x4cf2ff, intensity: 1.8, dist: 26 },
        { x: 12,  y: -56, z: 192, color: 0x4cf2ff, intensity: 1.8, dist: 26 },
        { x: 0,   y: -55, z: 180, color: 0xffd27a, intensity: 1.4, dist: 22 }
      ],
      furniture: [
        { key: 'kulanewa_flux_binnacle', dx: 0, dz: 0, ry: 0 },
        { key: 'kulanewa_uktena_brazier', dx: -8, dz: -6, ry: 0.4 },
        { key: 'kulanewa_uktena_brazier', dx: 8, dz: 6, ry: -0.4 }
      ]
    },
    {
      id: 'fc.int.amber_vault',
      name: 'AS-01 Court of the Amber Seal Bullion Vault',
      x: 238, y: 102.0, z: -1418, w: 28.0, d: 20.0, h: 6.2,
      vault: true,
      envMapIntensity: 0.0,
      openings: [],
      lamps: [
        { x: 233, y: 106.5, z: -1418, color: 0xf4b844, intensity: 1.6, dist: 20 },
        { x: 243, y: 106.5, z: -1418, color: 0xf4b844, intensity: 1.6, dist: 20 }
      ],
      furniture: [
        { key: 'kulanewa_uktena_brazier', dx: -5, dz: 0, ry: 0 },
        { key: 'kulanewa_lotus_divan', dx: 5, dz: 0, ry: Math.PI }
      ]
    },
    {
      id: 'fc.int.sumeru_rotunda',
      name: 'Khao Phra Sumeru River-Peace Charter Rotunda',
      x: 0, y: 22.0, z: 180.0, w: 42.0, d: 42.0, h: 14.0,
      vault: false,
      envMapIntensity: 0.35,
      openings: [
        { x: 0, z: 201.0, w: 6.4, h: 5.2, nx: 0, nz: 1 },
        { x: 0, z: 159.0, w: 6.4, h: 5.2, nx: 0, nz: -1 },
        { x: 21.0, z: 180.0, w: 6.4, h: 5.2, nx: 1, nz: 0 },
        { x: -21.0, z: 180.0, w: 6.4, h: 5.2, nx: -1, nz: 0 }
      ],
      lamps: [
        { x: 0, y: 30.0, z: 180.0, color: 0xffcf70, intensity: 1.5, dist: 28 }
      ],
      furniture: [
        { key: 'kulanewa_lotus_divan', dx: -6, dz: -6, ry: 0.78 },
        { key: 'kulanewa_lotus_divan', dx: 6, dz: -6, ry: -0.78 },
        { key: 'kulanewa_flux_binnacle', dx: 0, dz: 4, ry: 0 }
      ]
    },
    {
      id: 'fc.int.suudme_bourse',
      name: 'Tooka-Suurgild Suudme Amber Bourse Counting Hall',
      x: 392, y: 104.0, z: -1404, w: 26.0, d: 20.0, h: 7.5,
      vault: false,
      envMapIntensity: 0.32,
      openings: [
        { x: 392, z: -1394, w: 4.8, h: 4.2, nx: 0, nz: 1 },
        { x: 405, z: -1404, w: 3.6, h: 3.2, nx: 1, nz: 0 }
      ],
      lamps: [
        { x: 392, y: 109.5, z: -1404, color: 0xffc864, intensity: 1.4, dist: 22 }
      ],
      furniture: [
        { key: 'kulanewa_flux_binnacle', dx: -4, dz: 0, ry: 0 },
        { key: 'kulanewa_lotus_divan', dx: 4, dz: -3, ry: -0.5 }
      ]
    },
    {
      id: 'fc.int.hongsa_truce',
      name: 'Upper-Ria Hongsa Co-Court Truce Colonnade',
      x: 685, y: 6.2, z: 815, w: 30.0, d: 24.0, h: 8.0,
      vault: false,
      envMapIntensity: 0.38,
      openings: [
        { x: 685, z: 827, w: 8.5, h: 4.8, nx: 0, nz: 1 }
      ],
      lamps: [
        { x: 685, y: 12.0, z: 815, color: 0xe8c4ff, intensity: 1.3, dist: 22 }
      ],
      furniture: [
        { key: 'kulanewa_lotus_divan', dx: 0, dz: -4, ry: 0 }
      ]
    }
  ];

  function daylightAt(hall, wx, wz) {
    if (hall.vault || !hall.openings || !hall.openings.length) return 0.0;
    let sum = 0.0;
    for (let i = 0; i < hall.openings.length; i++) {
      const op = hall.openings[i];
      const d = Math.hypot(wx - op.x, wz - op.z);
      const area = op.w * op.h;
      sum += (area / 28.0) / (1.0 + 0.12 * d * d);
    }
    return Math.min(1.0, +sum.toFixed(4));
  }

  function auditUndergroundAndPortals(overrideBadLeak) {
    let vaultLeaks = 0, litPortals = 0;
    for (let i = 0; i < HALLS.length; i++) {
      const H = HALLS[i];
      const env = (overrideBadLeak && H.vault) ? 0.5 : H.envMapIntensity;
      const dl = (overrideBadLeak && H.vault) ? 0.25 : daylightAt(H, H.x, H.z);
      if (H.vault) {
        if (env !== 0.0 || dl !== 0.0) vaultLeaks++;
      } else {
        const nearDoor = H.openings[0];
        const dlDoor = daylightAt(H, (H.x + nearDoor.x) * 0.5, (H.z + nearDoor.z) * 0.5);
        if (dlDoor > 0.04) litPortals++;
      }
    }
    return {
      ok: vaultLeaks === 0 && litPortals === 3,
      vaultLeaks: vaultLeaks,
      litPortals: litPortals,
      halls: HALLS.length
    };
  }

  return {
    HALLS: HALLS,
    daylightAt: daylightAt,
    auditUndergroundAndPortals: auditUndergroundAndPortals
  };
})();
