/* ================================================================= TETHIS — shallow sea & bathymetry records ([G data])
   Records each Tethis site's coordinates on the page and defines the shared shallow-sea bathymetry, coral patch-reefs,
   lagoon tint field, and core/water open-sea surface.
   [G data]: no THREE, no DOM, no Math.random. */

var TETHISWATER = (function () {
  'use strict';

  var NW = {
    sites: [],
    sea: null
  };

  /* Smoothstep helper without clamping surprises */
  function ss(a, b, x) {
    var t = (x - a) / (b - a);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return t * t * (3.0 - 2.0 * t);
  }

  /* Local coral patch-reef elevation bump (0..+18 m) in sunlit inter-saucer bays and outer coral ring.
     Carefully masked to 0 around every submerged pod (U0, U1, U4, U6), subsea tube (ST_*), the western ship canal,
     and the eastern B_6_8 wreck channel so submerged hulls and fallen bridge trusses keep exact clearance. */
  function coralReefLift(lx, lz) {
    var r = Math.hypot(lx, lz);
    if (r > 980.0) return 0.0;

    /* Keep central U0 basin (r < 105), western harbour approach (lx < -260, |lz| < 96), and east wreck channel clear */
    var clearCenter = ss(98.0, 142.0, r);
    var clearWestCanal = (lx < -220.0 && Math.abs(lz) < 105.0) ? ss(105.0, 58.0, Math.abs(lz)) : 0.0;
    var clearEastWreck = (lx > 330.0 && lx < 740.0 && Math.abs(lz) < 88.0) ? ss(88.0, 46.0, Math.abs(lz)) : 0.0;

    /* Keep U1 (195,-338), U4 (195,+338), U6 (390,0) and their subsea tube corridors clear */
    var dU1 = Math.hypot(lx - 195.0, lz + 337.75);
    var dU4 = Math.hypot(lx - 195.0, lz - 337.75);
    var dU6 = Math.hypot(lx - 390.0, lz);
    var clearPods = ss(66.0, 98.0, dU1) * ss(68.0, 102.0, dU4) * ss(68.0, 102.0, dU6);

    /* Subsea tube rays from (0,0) to U1, U4, U6 */
    var clearTubes = 1.0;
    var rays = [[0.5, -0.866025, 340.0], [0.5, 0.866025, 340.0], [1.0, 0.0, 390.0]];
    for (var i = 0; i < rays.length; i++) {
      var ux = rays[i][0], uz = rays[i][1], L = rays[i][2];
      var proj = lx * ux + lz * uz;
      if (proj > 0.0 && proj < L) {
        var perp = Math.abs(-lx * uz + lz * ux);
        var m = ss(22.0, 48.0, perp);
        if (m < clearTubes) clearTubes = m;
      }
    }

    var mask = clearCenter * clearPods * clearTubes * (1.0 - clearWestCanal) * (1.0 - clearEastWreck);
    if (mask <= 0.001) return 0.0;

    /* Outer barrier-atoll shoal ring (r = 460..760 m) + inter-saucer coral knolls */
    var ring = Math.max(0.0, 1.0 - Math.pow((r - 565.0) / 175.0, 2.0));
    var n1 = KRAND.fbm(lx * 0.0065 + 19.3, 1.1, lz * 0.0065 - 11.7, 3, 12611);
    var n2 = KRAND.fbm(lx * 0.019 - 7.4, 2.3, lz * 0.019 + 31.2, 2, 12612);
    var patch = ss(0.47, 0.76, n1 * 0.72 + n2 * 0.28);
    var fadeOut = 1.0 - ss(700.0, 960.0, r);
    var lift = (ring * 9.5 + patch * 13.5) * mask * fadeOut;
    return lift;
  }

  /* Local seabed height (y < 0, m) around one Tethis site: base shelf + coral reef patches, clamped <= -2.1 m */
  NW.localBed = function (lx, lz) {
    var base = TETHIS.seabedAt(lx, lz);
    var lift = coralReefLift(lx, lz);
    var y = base + lift;
    if (y > -2.1) y = -2.1;
    return Math.round(y * 100) / 100;
  };

  /* World-space bathymetry across the entire showcase sea */
  NW.bed = function (x, z) {
    var best = -35.5;
    for (var i = 0; i < NW.sites.length; i++) {
      var s = NW.sites[i];
      var lx = x - s.gx, lz = z - s.gz;
      if (Math.abs(lx) < 1150.0 && Math.abs(lz) < 1100.0) {
        var y = NW.localBed(lx, lz);
        if (y > best) best = y;
      }
    }
    /* Gentle pelagic sandwaves between sites */
    var wave = (KRAND.fbm(x * 0.0022 + 3.1, 0.7, z * 0.0022 - 4.8, 2, 12619) - 0.5) * 1.6;
    var out = best + wave * 0.35;
    return out > -2.0 ? -2.0 : out;
  };

  NW.addSite = function (d, gx, gz, P) {
    var site = { d: d, gx: gx, gz: gz, P: P };
    NW.sites.push(site);
    return site;
  };

  /* Luminous turquoise lagoon & coral-shoal tint field for WATER.open */
  NW.tintAt = function (x, z) {
    for (var i = 0; i < NW.sites.length; i++) {
      var s = NW.sites[i];
      var lx = x - s.gx, lz = z - s.gz;
      if (Math.abs(lx) > 950.0 || Math.abs(lz) > 850.0) continue;
      /* Sheltered saucer sea-wells glow bright turquoise-jade */
      var plats = s.P.platforms;
      for (var k = 0; k < plats.length; k++) {
        var p = plats[k];
        var d = Math.hypot(lx - p.x, lz - p.z);
        if (d < p.rWell + 18.0) {
          var a = 0.42 * (1.0 - ss(p.rWell * 0.65, p.rWell + 18.0, d));
          return { c: s.d > 0 ? 0x3ecbb8 : 0x45dcd4, a: a };
        }
      }
      /* Shallow coral heads glow warm aquamarine */
      var by = NW.localBed(lx, lz);
      if (by > -13.5) {
        var a2 = 0.34 * ss(-13.5, -3.0, by);
        return { c: 0x52e2d8, a: a2 };
      }
    }
    return null;
  };

  NW.makeSea = function () {
    if (NW.sea) return NW.sea;
    NW.sea = WATER.open({
      name: 'The Shallow Coral Sea of Tethis',
      level: 0.0,
      swell: [
        [0.20, 68, 22, 0.0, 0.26],
        [0.11, 41, -31, 1.7, 0.20],
        [0.06, 24, 68, 4.1, 0.14],
        [0.03, 15, -12, 2.6, 0.10]
      ],
      damp: 5.5,
      bed: NW.bed,
      bedBox: [-3100, -1350, 3100, 1350],
      bedCell: 6,
      tint: {
        box: [-2900, -1150, 2900, 1150],
        cell: 8,
        at: NW.tintAt
      }
    });
    return NW.sea;
  };

  /* Ground height for core/ruins: the sculpted shallow seabed under the site */
  NW.ground = function (site, x, z) {
    return NW.localBed(x - site.gx, z - site.gz);
  };

  return NW;
})();
