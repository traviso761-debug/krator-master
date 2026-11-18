// ================================================================= RHEOLITH — physics and site data (PLAN.md sections 1, 4, 6.3a, 7; [G data])
// Pure arithmetic for the 180-550 degC mineral-siloxane biosphere: viability window, conduit throttling and phreatic blowout,
// basal lava-crust buoyancy, thermoelectric fracture sealing, surface byproduct zoning, and the Ranj volatile-siloxane link.
// No THREE, no DOM, no host globals: runs identically in Node (tests/test-rheolith.js), the browser page, and a Godot port.

var RHEO_PHYS = (function () {
  var cl = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var sm = function (a, b, x) {
    var t = cl((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  var rd = function (x, n) {
    var m = Math.pow(10, n == null ? 4 : n);
    return Math.round(x * m) / m;
  };

  var WINDOW = {
    tMin: 180,
    tOpt: 310,
    tMax: 550,
    tCalcine: 600,
    tHydro: 140,
    awActive: 0.15,
    awHydro: 0.25,
    phOpt: 1.5,
    phMax: 3.8
  };

  var REAGENTS = {
    gagCake: {
      key: 'gagCake',
      name: 'Brimstone-Iron Cake',
      craft: 'sulphur + iron filings',
      guild: 'chokecoral / wirevein',
      action: 'fuels rapid zeolite-siloxane accretion (+choke, +seal)'
    },
    fluxSalt: {
      key: 'fluxSalt',
      name: 'Alkali-Fluorite Salt',
      craft: 'potash/soda alkali + fluorite crust',
      guild: 'fluxcreeper',
      action: 'depolymerises silicate plugs and buoyancy foam (-choke, -buoyancy, -seal)'
    },
    heavyDross: {
      key: 'heavyDross',
      name: 'Heavy Dross',
      craft: 'galena lead-silver slag or barite',
      guild: 'all guilds (poison)',
      action: 'locks zeolite pores with Pb2+/Ba2+, killing bore-healing and weighting crust'
    },
    vitriolBath: {
      key: 'vitriolBath',
      name: 'Hot Vitriol Bath',
      craft: 'concentrated H2SO4 held at 220-300 degC',
      guild: 'dormant staregg / live cutting',
      action: 'prevents hydrolysis and keeps siloxane above glass transition in a retort'
    }
  };

  function windowAt(o) {
    o = o || {};
    var tempC = o.tempC == null ? 25 : o.tempC;
    var aw = o.waterActivity == null ? 0.05 : o.waterActivity;
    var ph = o.acidPh == null ? 1.0 : o.acidPh;
    if (tempC > WINDOW.tCalcine) {
      return { viable: false, state: 'calcined', k: 0, tempC: tempC, waterActivity: aw, acidPh: ph };
    }
    if (tempC < WINDOW.tHydro && aw >= WINDOW.awHydro) {
      return { viable: false, state: 'hydrolysed', k: 0, tempC: tempC, waterActivity: aw, acidPh: ph };
    }
    if (tempC >= WINDOW.tMin && tempC <= WINDOW.tMax && aw < WINDOW.awActive && ph <= WINDOW.phMax) {
      var kt = tempC <= WINDOW.tOpt
        ? 0.18 + 0.82 * sm(WINDOW.tMin, WINDOW.tOpt, tempC)
        : 0.18 + 0.82 * sm(WINDOW.tMax, WINDOW.tOpt, tempC);
      var kw = 1 - 0.85 * sm(0.05, WINDOW.awActive, aw);
      var kp = ph <= WINDOW.phOpt ? 1 : 1 - 0.85 * sm(WINDOW.phOpt, WINDOW.phMax, ph);
      var k = rd(cl(kt * kw * kp, 0.02, 1), 4);
      return { viable: true, state: 'active', k: k, tempC: tempC, waterActivity: aw, acidPh: ph };
    }
    if (tempC > WINDOW.tMax) {
      return { viable: false, state: 'scorched', k: 0, tempC: tempC, waterActivity: aw, acidPh: ph };
    }
    if (aw >= WINDOW.awHydro) {
      return { viable: false, state: 'hydrolysed', k: 0, tempC: tempC, waterActivity: aw, acidPh: ph };
    }
    return { viable: false, state: 'vitrified', k: 0, tempC: tempC, waterActivity: aw, acidPh: ph };
  }

  function choke(ventRec, tHours, doses) {
    var v = ventRec || {};
    var d = doses || {};
    var t = Math.max(0, tHours == null ? 0 : tHours);
    var ap0 = cl(v.aperture == null ? 0.48 : v.aperture, 0.02, 1);
    var p0 = cl(v.pressure == null ? 0.18 : v.pressure, 0, 1.5);
    var heatMW = v.heatMW == null ? 12 : v.heatMW;
    var tempC = v.tempC == null ? 340 : v.tempC;
    var gag = Math.max(0, d.gagCake == null ? 0 : d.gagCake);
    var salt = Math.max(0, d.fluxSalt == null ? 0 : d.fluxSalt);
    var dross = Math.max(0, d.heavyDross == null ? 0 : d.heavyDross);
    var win = windowAt({ tempC: tempC, waterActivity: 0.04, acidPh: 1.1 });
    var liveK = (win.viable ? win.k : 0) * Math.exp(-2.4 * dross);
    var grow = liveK * (0.04 + 0.44 * gag) * (1 - Math.exp(-t / 4.5));
    var rot = (0.62 * salt + 0.04 * liveK * (v.graze == null ? 0.2 : v.graze)) * (1 - Math.exp(-t / 0.16));
    var apRaw = cl(ap0 - grow + rot, 0.02, 1);
    var pBuild = apRaw < 0.24
      ? p0 + (heatMW / 12) * (0.26 - apRaw) * 0.082 * t
      : p0 * Math.exp(-t * (apRaw - 0.18) * 1.6);

    if (pBuild >= 1.0) {
      return {
        aperture: 0.92,
        pressure: rd(pBuild, 4),
        periodScale: 0.45,
        heightScale: 2.45,
        state: 'blowout',
        blast: true,
        frost: rd(cl(0.35 + 0.5 * salt, 0, 1), 3),
        tell: 'collar shattered: phreatic acid-steam blowout'
      };
    }
    var primed = ap0 < 0.34 || gag > 0.2 || p0 > 0.34;
    if (salt >= 0.25 && primed && t >= 0.04 && t <= 1.5) {
      var head = cl(p0 + 0.48 * gag + 0.35 * (1 - ap0), 0.35, 1.2);
      return {
        aperture: rd(cl(apRaw + 0.34, 0.46, 0.96), 4),
        pressure: rd(head, 4),
        periodScale: 0.5,
        heightScale: rd(1.6 + 0.8 * cl(head, 0, 1), 3),
        state: 'salted-surge',
        blast: true,
        frost: rd(cl(0.55 + 0.45 * salt, 0, 1), 3),
        tell: 'white SiF4 frost hiss and boiling acid-steam surge'
      };
    }
    if (dross >= 0.45 && liveK < 0.35) {
      return {
        aperture: rd(apRaw, 4),
        pressure: rd(cl(pBuild, 0, 0.99), 4),
        periodScale: rd(cl(0.75 / Math.max(0.14, apRaw), 0.7, 3.6), 3),
        heightScale: rd(cl(0.7 + 0.4 * (1 - apRaw), 0.65, 1.3), 3),
        state: 'poisoned',
        blast: false,
        frost: rd(cl(0.15 * salt, 0, 1), 3),
        tell: 'barite-galena lock: zeolite pores dead and brittle'
      };
    }
    if (apRaw < 0.08) {
      return {
        aperture: rd(apRaw, 4),
        pressure: rd(cl(pBuild, 0, 0.99), 4),
        periodScale: 8.0,
        heightScale: 0,
        state: 'gagged',
        blast: false,
        frost: rd(cl(0.18 * salt, 0, 1), 3),
        tell: 'throttled silent; slow metallic tick underground'
      };
    }
    var throttled = apRaw < 0.34;
    return {
      aperture: rd(apRaw, 4),
      pressure: rd(cl(pBuild, 0, 0.99), 4),
      periodScale: rd(cl(0.66 / Math.max(0.12, apRaw), 0.65, 4.2), 3),
      heightScale: rd(cl(0.76 + 0.58 * (1 - apRaw), 0.76, 1.58), 3),
      state: throttled ? 'throttled' : 'open',
      blast: false,
      frost: rd(cl(0.85 * salt + (v.graze == null ? 0 : 0.45 * v.graze), 0, 1), 3),
      tell: throttled ? 'steady honeycomb throttle and metallic tick' : 'clean open vent with supple shed rinds'
    };
  }

  function buoyancy(crustAgeDays, reefCover, doses) {
    var d = doses || {};
    var age = Math.max(0.25, crustAgeDays == null ? 20 : crustAgeDays);
    var cover0 = cl(reefCover == null ? 0 : reefCover, 0, 1);
    var salt = Math.max(0, d.fluxSalt == null ? 0 : d.fluxSalt);
    var dross = Math.max(0, d.heavyDross == null ? 0 : d.heavyDross);
    var hours = Math.max(0, d.hours == null ? 12 : d.hours);
    var h0 = 0.075 * Math.sqrt(age);
    var abio = cl(1 - 0.62 * sm(28, 95, age), 0.32, 1);
    var decay = Math.exp(-hours / 8.5 * (1.35 * salt + 1.15 * dross));
    var effCover = rd(cl(cover0 * decay, 0, 1), 4);
    var weightK = cl(1 - 0.46 * dross, 0.35, 1);
    var thicknessM = rd(h0 * (1 + 0.45 * effCover), 3);
    var baseLoad = 220 * h0 * abio * weightK;
    var loadKg = rd(Math.max(12, baseLoad * (1 + 2.5 * effCover)), 1);
    var ringPitchHz = Math.round(55 + 125 * effCover * cl(h0 / 0.34, 0.65, 1.12));
    var state = effCover >= 0.45 ? 'buoyant' : (loadKg < 105 ? 'foundering' : 'thin');
    return {
      effCover: effCover,
      thicknessM: thicknessM,
      loadKg: loadKg,
      ringPitchHz: ringPitchHz,
      state: state
    };
  }

  function seal(crackRec, tHours, doses) {
    var c = crackRec || {};
    var d = doses || {};
    var t = Math.max(0, tHours == null ? 0 : tHours);
    var s0 = cl(c.sealed01 == null ? 0.15 : c.sealed01, 0, 1);
    var tempC = c.tempC == null ? 290 : c.tempC;
    var gag = Math.max(0, d.gagCake == null ? 0 : d.gagCake);
    var salt = Math.max(0, d.fluxSalt == null ? 0 : d.fluxSalt);
    var dross = Math.max(0, d.heavyDross == null ? 0 : d.heavyDross);
    var win = windowAt({ tempC: tempC, waterActivity: 0.04, acidPh: 1.2 });
    var brittle = dross >= 0.4 || tempC < 150;
    var knit = (!brittle && win.viable) ? win.k * (0.18 + 0.82 * gag) * (1 - Math.exp(-t / 1.05)) : 0;
    var cut = 0.88 * salt * (1 - Math.exp(-t / 0.32));
    var s = rd(cl(s0 + knit - cut, 0, 1), 4);
    var state = brittle ? 'brittle' : (s >= 0.85 ? 'sealed' : (cut > 0.2 ? 'etched' : 'weeping'));
    return {
      sealed01: s,
      gasLeakK: rd(1 - s, 4),
      brittle: brittle,
      state: state
    };
  }

  function byproductAt(o) {
    o = o || {};
    var dist = Math.max(0, o.distM == null ? 20 : o.distM);
    var tempC = o.tempC == null ? 40 : o.tempC;
    var wind = cl(o.windDot == null ? 0 : o.windDot, -1, 1);
    var flux = cl(o.recentFlux == null ? 0 : o.recentFlux, 0, 1);
    var slope = cl(o.slope == null ? 0.2 : o.slope, 0, 1);
    var crust = cl(o.crust == null ? 0 : o.crust, 0, 1);
    return {
      throatcollar: rd(sm(6.5, 1.0, dist) * sm(85, 195, tempC), 4),
      throatskin: rd(sm(1.4, 3.4, dist) * sm(15, 6.0, dist) * sm(75, 130, tempC) * sm(290, 225, tempC), 4),
      etchhalo: rd(sm(16, 2.2, dist) * sm(0.18, 0.55, flux), 4),
      bismuthnest: rd(sm(18, 2.5, dist) * sm(115, 220, tempC) * (0.35 + 0.65 * sm(0.22, 0.65, slope)), 4),
      scarplug: rd(sm(32, 4.5, dist) * sm(60, 155, tempC) * (0.38 + 0.62 * sm(0.2, 0.6, slope)), 4),
      bellblister: rd(crust * sm(0.75, 0.2, flux), 4),
      combplate: rd(crust * (0.35 + 0.65 * sm(0.15, 0.65, flux)), 4),
      staregg: rd(sm(10, 26, dist) * sm(280, 55, dist) * (0.28 + 0.72 * cl(0.5 + 0.5 * wind, 0, 1)), 4)
    };
  }

  function ranjViability(o) {
    o = o || {};
    var throatT = o.throatTempC == null ? 25 : o.throatTempC;
    var dist = Math.max(0, o.throatDistM == null ? 600 : o.throatDistM);
    var mulch = cl(o.zeoliteMulch == null ? 0 : o.zeoliteMulch, 0, 1);
    var rain = Math.max(0, o.rainMm == null ? 1050 : o.rainMm);
    var src = windowAt({ tempC: throatT, waterActivity: 0.04, acidPh: 1.2 });
    if (!src.viable) {
      return { fruiting: false, vapour01: 0, why: 'no active rheolith throat below (cold or hydrolysed)' };
    }
    if (dist < 8) {
      return { fruiting: false, vapour01: 0, why: 'scorched by acid steam at the fumarole lip' };
    }
    var reach = 88 + 240 * mulch;
    var distK = sm(reach * 1.15, reach * 0.26, dist);
    var rainK = 1 - 0.84 * sm(1850, 3100, rain) * (1 - 0.58 * mulch);
    var scorchK = sm(7, 15, dist);
    var vap = rd(cl(src.k * distK * rainK * scorchK, 0, 1), 4);
    var ok = vap >= 0.24;
    var why = ok
      ? (mulch >= 0.4 ? 'zeolite vent-sinter mulch holds throat vapours on a warm fault apron' : 'active rheolith throat exhales trace siloxane and selenium vapours')
      : (rain > 2200 ? 'monsoon rain hydrolyses fugitive siloxane vapours before the fungus can take' : 'too far from an active rheolith throat for fugitive vapours');
    return { fruiting: ok, vapour01: vap, why: why };
  }

  return {
    WINDOW: WINDOW,
    REAGENTS: REAGENTS,
    windowAt: windowAt,
    choke: choke,
    buoyancy: buoyancy,
    seal: seal,
    byproductAt: byproductAt,
    ranjViability: ranjViability
  };
})();

var RHEO_SITES = {
  throat: {
    key: 'throat',
    name: 'The Breached Throat',
    region: 'South-East Rift Graben of the Throne (scale model 5.1, px 938, 902)',
    elev: 1380,
    atm: 1.18,
    soil: 26,
    rain: 920,
    sky: { px: 938, py: 902 },
    wind: [0.82, 0.57],
    graben: { strike: 0.34, halfW: 145, wallH: 52, floorY: 1380 },
    pit: { x: 0, z: 0, r: 26, throatR: 7.4, floor: -21, rim: 3.6, throatT: 365, deepT: 545, aperture0: 0.28 },
    crustBench: { x: 76, z: -22, rx: 44, rz: 32, ageDays: 42, reefCover: 0.78 },
    vents: [
      { id: 'main', name: 'The Breached Throat', x: 0, z: 0, T: 365, reach: 74, decay: 1.85, aperture: 0.28, graze: 0.15, geyser: true },
      { id: 'north-choke', name: 'Ticking Collar Pipe', x: -34, z: -48, T: 295, reach: 42, decay: 2.0, aperture: 0.16, graze: 0.08 },
      { id: 'west-rot', name: 'White-Rime Rotting Fumarole', x: -58, z: 26, T: 265, reach: 46, decay: 2.0, aperture: 0.42, graze: 0.78 },
      { id: 'south-fissure', name: 'Bismuth Seam Fissure', x: 18, z: 62, T: 318, reach: 48, decay: 1.95, aperture: 0.52, graze: 0.18 },
      { id: 'east-apron', name: 'Crust-Edge Steam Hornito', x: 44, z: -56, T: 245, reach: 38, decay: 2.1, aperture: 0.62, graze: 0.22 }
    ],
    springs: [
      { key: 'vitriol-pot-w', name: 'West Vitriol Pot (pH 1.4)', x: -42, z: -12, r: 6.5, pH: 1.4, temp: 0.92, mineral: 'sulfur' },
      { key: 'vitriol-pot-s', name: 'South Acid Pool (pH 1.8)', x: 28, z: 38, r: 8.2, pH: 1.8, temp: 0.84, mineral: 'iron' }
    ]
  }
};
