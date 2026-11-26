// ================================================================= ARCODIGA — Soleri's dam arcology: the plan (records)
// Plate 18 of Paolo Soleri's Arcology: The City in the Image of Man, at the sheet's drawn 1:10,000 proportions:
//   the DAM ARCH        convex upstream into the reservoir, 1 460 m chord (keyed into 640-720 m canyon walls), 360 m to the
//                       crest deck, 160 m thick at the base tapering to 48 m at the crest
//   the CREST           a cantilevered promenade arc (342-376 m) pierced by 17 circular light-well oculi
//   the VTOL TOWER      230 m upstream in the reservoir (z -490): a 76 m square twin-elevator shaft rising from the bed to a
//                       136 m cantilevered T-head airport deck at 432 m, linked to the crest by a bridge and to the spine below
//   the RIBS & PROWS    16 radial cellular Living-Working buttresses on the concave downstream face with recessed light wells,
//                       and 4 taller faceted Commercial / City Center prows framing the central axis
//   the AXIAL SPINE     an 88 m wide multi-deck horizontal vault (Public / City Center / Commercial, y 152-204 m) running from
//                       the VTOL elevator shaft straight through the dam into the hub of the stiffening wing
//   the STIFFENING WING a 2 040 m horizontal saddle rib spanning cliff to cliff at z +210 m: twin highway decks and guideway
//                       slot at y 176 m, concave hyperbolic saddle fins flaring to y 322 m at both canyon walls (Research
//                       Laboratories west, Learning Center east, City Center hub at x 0)
//   the TOE & VALLEY    the Power House (5 turbine/tailrace bays) and Automated Industries at the dam's foot, feeding the
//                       Y-shaped Waterways, Recreation terraces and 3 circular pumped-silt farm basins downstream
//
// Three states (DECAYS [0, 1, 3]):
//   0 intact        the Ancients' city at its peak (~280 000 people), full reservoir at 328 m, active tailraces
//   1 ruined        crest breached by the Notch (x -265 m, sill 212 m), west wing span severed by the outflow jet, reservoir at
//                   213 m with a 212 m cascade into a plunge pool and braided scour channel
//   3 refurbished   settlement centerpiece (~21 500 people): impoundment kept at 324 m with working hydro and open highways;
//                   Crest, VTOL, Axial Spine, Stiffening Wing, Powerhouse/Industries, 4 central prows and 4 inner ribs are
//                   refurbished and inhabited, while the 12 outer Living-Working ribs are bulkheaded and dormant for expansion
//
// [G data]: no three.js, no DOM. Every random choice is a pure KRAND hash of (seed, salt, index, sub), never stream order.
const ARCODIGA = {};

ARCODIGA.DIM = {
  H: 360, SPAN: 1460, ARCH_RISE: 260, TH0: 160, TH1: 48,
  CH: 640, CANYON_W0: 685, CANYON_Z0: -900, CANYON_Z1: 1120,
  WL_FULL: 328, WL_REFURB: 324, WL_RUIN: 213,
  CREST: { y0: 342, y1: 376, depth: 66, oculi: 17, ocStep: 76, ocR: 15 },
  VTOL: { x: 0, z: -490, shaftW: 76, deckW: 136, y0: 16, yDeck0: 408, yDeck1: 432, bridgeW: 28, bridgeY: 360 },
  SPINE: { w: 88, y0: 152, y1: 204, z0: -452, z1: 184, storeys: 5 },
  WING: { zC: 210, halfSpan: 1020, rockX: 930, yHwy: 176, hwyH: 16, zNose0: 296, zBack0: 148, yTop0: 216, yTop1: 322, yBot0: 140, yBot1: 62, bays: 68 },
  PROWS: { xs: [-156, -52, 52, 156], w: 46, y0: 44, y1: 352, proj0: 104, proj1: 74, sh: 4 },
  RIBS: { countPerSide: 8, x0: 232, x1: 645, w: 32, proj0: 62, proj1: 44, sh: 4 },
  POWER: { w: 296, z0: -86, z1: 96, h: 46, chutes: [-96, -48, 0, 48, 96] },
  IND: { xIn: 168, xOut: 388, z0: -56, z1: 116, h: 36 },
  SILT_BEDS: [
    { id: 'arcodiga.silt.0', x: -165, z: 620, r: 88 },
    { id: 'arcodiga.silt.1', x: -245, z: 790, r: 78 },
    { id: 'arcodiga.silt.2', x: -120, z: 885, r: 68 }
  ],
  NOTCH: { x: -265, sill: 212, wBot: 26, wTop: 84, wingBreak0: -348, wingBreak1: -182 },
  POP: { share: 0.65, m2Peak: 45, m2Refurb: 68 }
};

ARCODIGA.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
ARCODIGA.lerp = function (a, b, t) { return a + (b - a) * t; };

/* deterministic portable draws via core/rand */
ARCODIGA.u = function (seed, a, b, c) {
  return KRAND.unit(KRAND.hash(seed | 0, a | 0, b == null ? 0 : b | 0, c == null ? 0 : c | 0));
};
ARCODIGA.rng = function (seed, a, b, c, lo, hi) {
  return lo + (hi - lo) * ARCODIGA.u(seed, a, b, c);
};

/* ---- parametric surfaces shared by plan, interiors, water and builder ---- */
ARCODIGA.zUp = function (x) {
  const D = ARCODIGA.DIM, u = x / (D.SPAN / 2);
  return -D.ARCH_RISE * (1 - u * u);
};
ARCODIGA.th = function (y) {
  const D = ARCODIGA.DIM, t = ARCODIGA.clamp(y / D.H, 0, 1);
  return D.TH1 + (D.TH0 - D.TH1) * (1 - t);
};
ARCODIGA.zDs = function (x, y) {
  return ARCODIGA.zUp(x) + ARCODIGA.th(y);
};
/* outward downstream unit normal in (x, z) perpendicular to zUp(x) */
ARCODIGA.nDs = function (x) {
  const D = ARCODIGA.DIM, dz = (2 * D.ARCH_RISE * x) / Math.pow(D.SPAN / 2, 2);
  const L = Math.hypot(dz, 1);
  return [-dz / L, 1 / L];
};
/* inner canyon wall half-width at z (narrows at the dam arch, opens upstream and downstream) */
ARCODIGA.canyonHalfW = function (z) {
  const D = ARCODIGA.DIM;
  const pinch = Math.exp(-Math.pow((z + 40) / 360, 2));
  const flareDs = z > 180 ? Math.min(220, (z - 180) * 0.24) : 0;
  const flareUs = z < -260 ? Math.min(160, (-260 - z) * 0.22) : 0;
  return D.CANYON_W0 + 135 * (1 - pinch) + flareDs + flareUs;
};
/* canyon floor base elevation for a ribbing/abutment seat at x */
ARCODIGA.abutY = function (x) {
  const ax = Math.abs(x);
  if (ax <= 420) return 0;
  return Math.min(136, Math.pow((ax - 420) / 310, 1.45) * 118);
};

/* horizontal stiffening wing envelope at x */
ARCODIGA.wingProfile = function (x) {
  const W = ARCODIGA.DIM.WING, ax = Math.abs(x), u = ARCODIGA.clamp(ax / W.rockX, 0, 1.12);
  const uCl = Math.min(1, u);
  const yTop = W.yTop0 + (W.yTop1 - W.yTop0) * Math.pow(uCl, 1.65);
  const yBot = W.yBot0 - (W.yBot0 - W.yBot1) * Math.pow(uCl, 1.55);
  const zNose = W.zNose0 - 22 * uCl * uCl;
  const zBack = W.zBack0 + 24 * uCl * uCl;
  const zCrest = W.zC;
  return { yHwy: W.yHwy, yTop: yTop, yBot: yBot, zNose: zNose, zBack: zBack, zCrest: zCrest, inRock: ax > W.rockX };
};
/* cross-section z bounds [zRear, zFront] of the stiffening wing at (x, y) */
ARCODIGA.wingZAt = function (x, y) {
  const P = ARCODIGA.wingProfile(x);
  if (y > P.yTop || y < P.yBot) return null;
  const v = y >= P.yHwy ? (y - P.yHwy) / Math.max(1, P.yTop - P.yHwy) : (P.yHwy - y) / Math.max(1, P.yHwy - P.yBot);
  const shape = Math.pow(ARCODIGA.clamp(1 - v, 0, 1), 1.95);
  const halfCore = 17 + 15 * (1 - v);
  const zFront = P.zCrest + halfCore + Math.max(0, P.zNose - (P.zCrest + halfCore)) * shape;
  const zRear = P.zCrest - halfCore - Math.max(0, (P.zCrest - halfCore) - P.zBack) * shape;
  return [zRear, zFront];
};

/* ruin notch predicate in dam/wing coordinates */
ARCODIGA.inNotch = function (x, y) {
  const N = ARCODIGA.DIM.NOTCH, H = ARCODIGA.DIM.H;
  if (y < N.sill) return false;
  const t = ARCODIGA.clamp((y - N.sill) / (H - N.sill), 0, 1);
  const wob = 7 * Math.sin(y * 0.09 + 0.7) + 4 * Math.cos(y * 0.21);
  const hw = N.wBot + (N.wTop - N.wBot) * Math.pow(t, 0.82) + wob;
  return Math.abs(x - N.x) < hw;
};
ARCODIGA.inWingBreak = function (x) {
  const N = ARCODIGA.DIM.NOTCH;
  return x > N.wingBreak0 && x < N.wingBreak1;
};

/* Hull descriptor so external water, tideline, dock and canyon-host fragments snap to exact concrete faces without magic numbers */
ARCODIGA.HULL = {
  span: ARCODIGA.DIM.SPAN,
  wingSpan: ARCODIGA.DIM.WING.halfSpan * 2,
  H: ARCODIGA.DIM.H,
  vtolH: ARCODIGA.DIM.VTOL.yDeck1,
  zUp: function (x) { return ARCODIGA.zUp(x); },
  toe: function (x) { return ARCODIGA.zDs(x, 0); },
  toeZ: function (x) { return ARCODIGA.zDs(x, 0); },
  zDs: function (x, y) { return ARCODIGA.zDs(x, y); },
  nDs: function (x) { return ARCODIGA.nDs(x); },
  thAt: function (y) { return ARCODIGA.th(ARCODIGA.clamp(y, 0, ARCODIGA.DIM.H)); },
  rAt: function (y) {
    const D = ARCODIGA.DIM, yy = ARCODIGA.clamp(y, 0, D.H);
    const halfArch = ARCODIGA.th(yy) * 0.5;
    if (y <= D.POWER.h) return Math.max(halfArch, (D.POWER.z1 - ARCODIGA.zUp(0)) * 0.5);
    if (y >= D.H) return D.CREST.depth * 0.5;
    return halfArch;
  },
  vtol: {
    x: ARCODIGA.DIM.VTOL.x,
    z: ARCODIGA.DIM.VTOL.z,
    H: ARCODIGA.DIM.VTOL.yDeck1,
    rAt: function (y) {
      const V = ARCODIGA.DIM.VTOL;
      return y < V.yDeck0 ? V.shaftW * 0.5 : V.deckW * 0.5;
    }
  },
  wingZAt: function (x, y) { return ARCODIGA.wingZAt(x, y); },
  canyonHalfW: function (z) { return ARCODIGA.canyonHalfW(z); },
  waterline: function (d) {
    const D = ARCODIGA.DIM;
    return d === 1 ? D.WL_RUIN : d === 3 ? D.WL_REFURB : D.WL_FULL;
  },
  tailraceQuay: {
    x0: -ARCODIGA.DIM.POWER.w * 0.5,
    x1: ARCODIGA.DIM.POWER.w * 0.5,
    z: ARCODIGA.DIM.POWER.z1,
    y: 1.6
  }
};

/* ---- full plan record (all 5 Soleri organs + circulation + stats) ---- */
ARCODIGA.plan = function (o) {
  o = o || {};
  const D = ARCODIGA.DIM, S = o.seed == null ? 12700 : o.seed;
  const P = {
    id: 'arcodiga', seed: S, dim: D, hull: ARCODIGA.HULL,
    organs: [], ribs: [], prows: [], oculi: [], wingZones: [], works: [], siltBeds: [],
    cores: [], links: [], tags: []
  };

  /* 1. Dam cellular matrix & Crest Promenade */
  const damFloor = 740 * 1e4; /* 740 ha of lit cellular galleries & terraces inside the arch */
  P.organs.push({
    id: 'arcodiga.dam', kind: 'dam', name: 'Arcodiga — arch dam cellular matrix',
    at: [0, D.H / 2, -120], size: [D.SPAN, 280, D.H], floor: damFloor, garden: 0,
    refurbished: false, role: 'structure-living', types: ['infrastructure', 'dwelling-multi']
  });

  const crestFloor = 48 * 1e4, crestGarden = 9.5 * 1e4;
  P.organs.push({
    id: 'arcodiga.crest', kind: 'crest', name: 'Promenade crest and oculi courts',
    at: [0, D.CREST.y0, -190], size: [1360, D.CREST.depth, D.CREST.y1 - D.CREST.y0],
    floor: crestFloor, garden: crestGarden, refurbished: true, role: 'civic-living',
    types: ['civic', 'dwelling-multi', 'park']
  });
  const halfOc = (D.CREST.oculi - 1) / 2;
  for (let k = -halfOc; k <= halfOc; k++) {
    const ox = k * D.CREST.ocStep, oz = ARCODIGA.zUp(ox) + 28;
    P.oculi.push({ id: 'arcodiga.oculus.' + (k + halfOc), k: k, x: ox, y: D.H, z: oz, r: D.CREST.ocR });
  }

  /* 2. Upstream VTOL Airport & Twin Elevator Cores */
  const V = D.VTOL, vtolFloor = 26 * 1e4;
  P.organs.push({
    id: 'arcodiga.vtol', kind: 'vtol', name: 'Vertical take-off airport and elevator tower',
    at: [V.x, V.yDeck0, V.z], size: [V.deckW, V.deckW, V.yDeck1],
    floor: vtolFloor, garden: 0, refurbished: true, role: 'transport',
    types: ['infrastructure', 'civic']
  });
  for (const s of [-1, 1]) {
    P.cores.push({
      id: 'arcodiga.core.vtol.' + (s < 0 ? 'w' : 'e'), sys: 'vtol',
      x: s * 18, z: V.z, r: 9, y0: V.y0, y1: V.yDeck1
    });
  }

  /* 3. Four Central Faceted Commercial / City Center Prows */
  const PR = D.PROWS;
  for (let i = 0; i < PR.xs.length; i++) {
    const px = PR.xs[i], y0 = PR.y0, y1 = PR.y1, stCount = Math.floor((y1 - y0) / PR.sh);
    const meanProj = (PR.proj0 + PR.proj1) / 2;
    const fl = stCount * PR.w * (meanProj + 28);
    const rec = {
      id: 'arcodiga.prow.' + i, idx: i, x: px, w: PR.w, y0: y0, y1: y1,
      z0: ARCODIGA.zDs(px, (y0 + y1) / 2) - 18, proj0: PR.proj0, proj1: PR.proj1,
      storeys: stCount, floor: fl, garden: PR.w * PR.proj1 * 0.65,
      refurbished: true, dormant: false,
      name: (i === 1 || i === 2 ? 'City Center central prow ' : 'Commercial prow ') + (i + 1),
      types: ['civic', 'market', 'dwelling-multi']
    };
    P.prows.push(rec);
    P.cores.push({ id: rec.id + '.core', sys: 'prow', x: px, z: ARCODIGA.zDs(px, 180) + 22, r: 6.5, y0: y0, y1: D.H });
  }

  /* 4. Sixteen Radial Living-Working Buttress Ribs (4 inner refurbished, 12 outer dormant in d=3) */
  const RB = D.RIBS;
  for (const side of [-1, 1]) {
    for (let j = 1; j <= RB.countPerSide; j++) {
      const t = (j - 1) / (RB.countPerSide - 1);
      const rx = Math.round(side * ARCODIGA.lerp(RB.x0, RB.x1, t));
      const y0 = Math.max(48, Math.ceil(ARCODIGA.abutY(rx) / RB.sh) * RB.sh + 12);
      const y1 = 348 - j * 4;
      const n = ARCODIGA.nDs(rx);
      const stCount = Math.floor((y1 - y0) / RB.sh);
      const meanProj = (RB.proj0 + RB.proj1) / 2;
      const fl = stCount * RB.w * (meanProj + 24);
      const activeInRefurb = j <= 2; /* inner 2 on each side (4 total) active; outer 6 per side (12 total) sealed/dormant */
      const id = 'arcodiga.rib.' + (side < 0 ? 'w' : 'e') + j;
      const rib = {
        id: id, side: side, j: j, x: rx, w: RB.w, y0: y0, y1: y1,
        nx: n[0], nz: n[1], proj0: RB.proj0, proj1: RB.proj1,
        storeys: stCount, floor: fl, garden: RB.w * RB.proj1 * 0.5,
        refurbished: activeInRefurb, dormant: !activeInRefurb,
        name: 'Living-Working buttress ' + (side < 0 ? 'W' : 'E') + j,
        types: ['dwelling-multi', 'industry']
      };
      P.ribs.push(rib);
      P.cores.push({
        id: id + '.core', sys: activeInRefurb ? 'rib-active' : 'rib-dormant',
        x: rx + n[0] * 16, z: ARCODIGA.zDs(rx, 200) + n[1] * 16, r: 5.5, y0: y0, y1: D.H
      });
    }
  }

  /* 5. Axial City Spine (Public — City Center — Commercial) */
  const SP = D.SPINE, spineLen = SP.z1 - SP.z0;
  const spineFloor = spineLen * SP.w * 8;
  P.organs.push({
    id: 'arcodiga.spine', kind: 'spine', name: 'Axial City Center and Commercial Spine',
    at: [0, (SP.y0 + SP.y1) / 2, (SP.z0 + SP.z1) / 2], size: [SP.w, spineLen, SP.y1 - SP.y0],
    floor: spineFloor, garden: 0, refurbished: true, role: 'civic-commercial',
    types: ['civic', 'market', 'infrastructure']
  });

  /* 6. Colossal Horizontal Stiffening Wing (Highways, Research Labs, Learning Center, Hub) */
  const WG = D.WING;
  const wingDefs = [
    { id: 'arcodiga.wing.research', name: 'Horizontal Stiffening Wing — Research Laboratories (west)', x0: -WG.rockX, x1: -110, floor: 168 * 1e4, types: ['civic', 'industry'] },
    { id: 'arcodiga.wing.hub', name: 'Horizontal Stiffening Wing — City Center & Highway Hub', x0: -110, x1: 110, floor: 64 * 1e4, types: ['civic', 'infrastructure', 'market'] },
    { id: 'arcodiga.wing.learning', name: 'Horizontal Stiffening Wing — Learning Center (east)', x0: 110, x1: WG.rockX, floor: 168 * 1e4, types: ['civic'] }
  ];
  for (const wz of wingDefs) {
    wz.at = [(wz.x0 + wz.x1) / 2, WG.yHwy + 16, WG.zC];
    wz.size = [wz.x1 - wz.x0, 124, 140];
    wz.garden = 0;
    wz.refurbished = true;
    P.wingZones.push(wz);
    P.organs.push(wz);
  }

  /* 7. Toe Works: Power House, Automated Industries, Silt Beds */
  const PW = D.POWER, IN = D.IND;
  const worksDefs = [
    { id: 'arcodiga.power', kind: 'power', name: 'Power House and hydro turbine hall', at: [0, PW.h / 2, (PW.z0 + PW.z1) / 2], size: [PW.w, PW.z1 - PW.z0, PW.h], floor: 24 * 1e4, garden: 0, refurbished: true, types: ['industry', 'infrastructure'] },
    { id: 'arcodiga.ind.w', kind: 'industry', name: 'Automated Industries — west vaults', at: [-(IN.xIn + IN.xOut) / 2, IN.h / 2, (IN.z0 + IN.z1) / 2], size: [IN.xOut - IN.xIn, IN.z1 - IN.z0, IN.h], floor: 28 * 1e4, garden: 0, refurbished: true, types: ['industry'] },
    { id: 'arcodiga.ind.e', kind: 'industry', name: 'Automated Industries — east vaults', at: [(IN.xIn + IN.xOut) / 2, IN.h / 2, (IN.z0 + IN.z1) / 2], size: [IN.xOut - IN.xIn, IN.z1 - IN.z0, IN.h], floor: 28 * 1e4, garden: 0, refurbished: true, types: ['industry'] }
  ];
  for (const wk of worksDefs) { P.works.push(wk); P.organs.push(wk); }
  for (const sb of D.SILT_BEDS) {
    const area = Math.PI * sb.r * sb.r;
    P.siltBeds.push({ id: sb.id, x: sb.x, z: sb.z, r: sb.r, area: area, name: 'Pumped-silt farm basin' });
  }

  /* 8. Circulation graph (links between ground/highway portals and every organ, prow, and rib) */
  const addLink = (id, a, b, kind) => P.links.push({ id: id, a: a, b: b, kind: kind });
  addLink('arcodiga.link.hwy.w', 'ground', 'arcodiga.wing.research', 'highway');
  addLink('arcodiga.link.hwy.e', 'ground', 'arcodiga.wing.learning', 'highway');
  addLink('arcodiga.link.wing.wh', 'arcodiga.wing.research', 'arcodiga.wing.hub', 'concourse');
  addLink('arcodiga.link.wing.eh', 'arcodiga.wing.learning', 'arcodiga.wing.hub', 'concourse');
  addLink('arcodiga.link.hub.spine', 'arcodiga.wing.hub', 'arcodiga.spine', 'concourse');
  addLink('arcodiga.link.spine.vtol', 'arcodiga.spine', 'arcodiga.vtol', 'concourse');
  addLink('arcodiga.link.vtol.crest', 'arcodiga.vtol', 'arcodiga.crest', 'bridge');
  addLink('arcodiga.link.crest.dam', 'arcodiga.crest', 'arcodiga.dam', 'shaft');
  addLink('arcodiga.link.ground.power', 'ground', 'arcodiga.power', 'plaza');
  addLink('arcodiga.link.power.indw', 'arcodiga.power', 'arcodiga.ind.w', 'yard');
  addLink('arcodiga.link.power.inde', 'arcodiga.power', 'arcodiga.ind.e', 'yard');
  addLink('arcodiga.link.power.spine', 'arcodiga.power', 'arcodiga.spine', 'lift');
  for (const pr of P.prows) {
    addLink(pr.id + '.link.spine', 'arcodiga.spine', pr.id, 'arcade');
    addLink(pr.id + '.link.crest', 'arcodiga.crest', pr.id, 'core');
  }
  for (const rb of P.ribs) {
    /* each rib joins the crest promenade and mid-height gallery via its bulkhead throat */
    addLink(rb.id + '.link.throat', 'arcodiga.crest', rb.id, rb.dormant ? 'bulkhead' : 'gallery');
    if (!rb.dormant) addLink(rb.id + '.link.spine', 'arcodiga.wing.hub', rb.id, 'skyway');
  }

  /* 9. Aggregate Areas & Population Stats (Peak Intact vs Refurbished Settlement Centerpiece) */
  const prowFloor = P.prows.reduce((s, r) => s + r.floor, 0);
  const ribFloor = P.ribs.reduce((s, r) => s + r.floor, 0);
  const organFloor = P.organs.reduce((s, o2) => s + o2.floor, 0);
  const totalFloor = organFloor + prowFloor + ribFloor;
  const totalGarden = P.organs.reduce((s, o2) => s + (o2.garden || 0), 0)
    + P.prows.reduce((s, r) => s + r.garden, 0)
    + P.ribs.reduce((s, r) => s + r.garden, 0)
    + P.siltBeds.reduce((s, b) => s + b.area, 0);

  /* Refurbished active floor: active ribs + prows (lower/mid rehabilitated storeys) + spine + hub + wing partial + crest + vtol + works */
  const refurbActiveFloor =
    crestFloor * 0.55 +
    vtolFloor * 0.5 +
    spineFloor * 0.75 +
    64 * 1e4 * 0.7 +          /* wing hub */
    168 * 1e4 * 0.18 * 2 +    /* research & learning active lower decks */
    (24 + 28 + 28) * 1e4 * 0.5 + /* powerhouse & automated industries */
    prowFloor * 0.32 +
    P.ribs.filter(r => r.refurbished).reduce((s, r) => s + r.floor * 0.28, 0);

  const dormantFloor = P.ribs.filter(r => r.dormant).reduce((s, r) => s + r.floor, 0) + damFloor * 0.85;
  const peakPop = Math.round((totalFloor * D.POP.share) / D.POP.m2Peak);
  const refurbPop = Math.round((refurbActiveFloor * 0.62) / D.POP.m2Refurb);

  P.stats = {
    height: D.H, vtolTop: V.yDeck1, archSpan: D.SPAN, wingSpan: WG.halfSpan * 2,
    prows: P.prows.length, ribs: P.ribs.length, activeRibs: P.ribs.filter(r => r.refurbished).length,
    dormantRibs: P.ribs.filter(r => r.dormant).length, oculi: P.oculi.length,
    floor: Math.round(totalFloor), refurbFloor: Math.round(refurbActiveFloor), dormantFloor: Math.round(dormantFloor),
    garden: Math.round(totalGarden), siltArea: Math.round(P.siltBeds.reduce((s, b) => s + b.area, 0)),
    peakPop: peakPop, refurbPop: refurbPop
  };
  return P;
};

/* BFS reachability from 'ground' when `cutIds` (link ids or node ids) are blocked */
ARCODIGA.reach = function (P, cutIds) {
  const blocked = new Set(cutIds || []);
  const adj = new Map();
  const add = (a, b) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); };
  for (const L of P.links) {
    if (blocked.has(L.id) || blocked.has(L.a) || blocked.has(L.b)) continue;
    add(L.a, L.b); add(L.b, L.a);
  }
  const seen = new Set();
  if (!blocked.has('ground')) {
    const q = ['ground']; seen.add('ground');
    while (q.length) {
      const u = q.shift(), ns = adj.get(u) || [];
      for (const v of ns) if (!seen.has(v)) { seen.add(v); q.push(v); }
    }
  }
  return seen;
};

/* Bulkhead links closed in the refurbished settlement state (seals all 12 dormant outer ribs cleanly) */
ARCODIGA.refurbBulkheads = function (P) {
  return P.links.filter(L => L.kind === 'bulkhead').map(L => L.id);
};

/* Deltas for the Refurbished state (d = 3) */
ARCODIGA.refurb = function (P) {
  const bulkheads = ARCODIGA.refurbBulkheads(P);
  return {
    state: 'refurbished',
    wl: P.dim.WL_REFURB,
    bulkheads: bulkheads,
    sealedRibs: P.ribs.filter(r => r.dormant).map(r => r.id),
    activeRibs: P.ribs.filter(r => r.refurbished).map(r => r.id),
    hydroActive: true,
    highwayOpen: true
  };
};

/* Deltas & debris records for the Ruined / Cataclysm-breached state (d = 1) */
ARCODIGA.ruin = function (P) {
  const N = P.dim.NOTCH, S = P.seed + 1;
  const severedRibs = P.ribs.filter(r => ARCODIGA.inNotch(r.x, P.dim.H - 8)).map(r => r.id);
  const brokenLinks = [
    'arcodiga.link.wing.wh', /* west wing severed from hub by the flood jet */
    'arcodiga.link.vtol.crest' /* crest causeway dropped span */
  ].concat(P.links.filter(L => severedRibs.indexOf(L.a) >= 0 || severedRibs.indexOf(L.b) >= 0).map(L => L.id));
  const debris = [];
  /* fallen wing-truss megablocks downstream of the severed west stiffening-wing span */
  for (let i = 0; i < 28; i++) {
    const t = ARCODIGA.u(S, 301, i, 0);
    const dx = ARCODIGA.lerp(N.wingBreak0 - 25, N.wingBreak1 + 25, ARCODIGA.u(S, 302, i, 1));
    const dz = P.dim.WING.zC - 35 + 240 * Math.pow(t, 1.25) + (ARCODIGA.u(S, 303, i, 2) - 0.5) * 40;
    const sc = 8 + 18 * (1 - 0.35 * t) * ARCODIGA.u(S, 304, i, 3);
    debris.push({
      id: 'arcodiga.debris.wing.' + i, kind: i < 8 ? 'truss' : 'slab',
      x: Math.round(dx * 10) / 10, z: Math.round(dz * 10) / 10,
      s: [Math.round(sc * 1.5 * 10) / 10, Math.round(sc * 0.55 * 10) / 10, Math.round(sc * 1.15 * 10) / 10],
      rot: [ARCODIGA.u(S, 305, i, 4) * 0.5 - 0.25, ARCODIGA.u(S, 306, i, 5) * 3.14, ARCODIGA.u(S, 307, i, 6) * 0.4 - 0.2]
    });
  }
  /* notch spill blocks at the dam toe */
  for (let i = 0; i < 34; i++) {
    const t = Math.pow(ARCODIGA.u(S, 401, i, 0), 1.3);
    const sx = N.x + (ARCODIGA.u(S, 402, i, 1) - 0.5) * (70 + 110 * t);
    const sz = ARCODIGA.zDs(sx, 0) + 12 + 130 * t;
    const sc = 6 + 15 * ARCODIGA.u(S, 403, i, 2);
    debris.push({
      id: 'arcodiga.debris.notch.' + i, kind: 'block',
      x: Math.round(sx * 10) / 10, z: Math.round(sz * 10) / 10,
      s: [Math.round(sc * 1.3 * 10) / 10, Math.round(sc * 0.65 * 10) / 10, Math.round(sc * 1.1 * 10) / 10],
      rot: [ARCODIGA.u(S, 404, i, 3) * 0.6 - 0.3, ARCODIGA.u(S, 405, i, 4) * 3.14, ARCODIGA.u(S, 406, i, 5) * 0.6 - 0.3]
    });
  }
  return {
    state: 'ruined',
    wl: P.dim.WL_RUIN,
    notch: N,
    severedRibs: severedRibs,
    brokenLinks: brokenLinks,
    debris: debris
  };
};
