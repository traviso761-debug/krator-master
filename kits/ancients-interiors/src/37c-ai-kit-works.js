/* ======================== Ancients interiors: the works (factory, robotics, data centre, starport) ========================
   AI.KIT entries (shape: 37-ai-kit.js) for the four big industrial volumes of the original Ancients kit. Their halls
   are single volumes, so the floors are OPEN BAYS along aisles (AI.gridPlate), with walled offices and stores in
   AI.barPlate strips along an edge, and stacked office mezzanines where the height allows. Builder frame: x east,
   z south, y up, no rotation. A ground storey that stands on the builder's own plinth or base is its own building with
   floors: false; storeys above it (the kit draws their slabs) are a second building with floors: true.
   ====================================================================== */
(function (AI) {
  'use strict';
  const TAU = Math.PI * 2;
  const cyc = list => (i => list[i % list.length]);
  const r3 = v => Math.round(v * 1000) / 1000;
  /* move every point of a storey through f([x, z]) -> [x, z] (a plate drawn in a local frame, put into the builder's) */
  function xform(st, f) {
    const F = p => { const q = f(p); return [r3(q[0]), r3(q[1])]; };
    st.outline = st.outline.map(F);
    st.rooms.forEach(function (R) { if (R.poly) R.poly = R.poly.map(F); R.doors.forEach(D => { D.at = F(D.at); }); });
    st.walls.forEach(function (W) { W.pts = W.pts.map(F); if (W.door) W.door.at = F(W.door.at); });
    return st;
  }
  /* a straight bar plate between two points */
  const line = (ax, az, bx, bz) => (u => [ax + (bx - ax) * u, az + (bz - az) * u]);

  /* ---------------------------------------------------------------- FACTORY, the Foundry (88-factory.js, 40-factory-extras.js)
     The catenary vault: W 90, Hh 55, L 160 at hx -40 (z -80..80) on the 6 m plinth (floor y 6). Its skin is
     x = hx +- 44 sqrt(1 - (y-6)/53.8); the ruin lines it with a guts layer at .97 across and .93 up, so every room keeps
     inside hw(y) = 42.4 sqrt(1 - (y-6)/50) (the guts, less a margin). End walls at z +-80: rooms keep to |z| < 77.
     Ground: an office-and-store strip along each long side (rooms against the vault, the corridor on the hall side),
     between them the shop floor as open workshop bays along two aisles running the hall's length; an office
     mezzanine over each side strip (y 11). The conveyor tube crosses at y 29.5, above everything. The ruin keeps the
     plan (ribs 5, 6, 11 gone, the skin holed, no floor fallen): no collapse. The silos, stacks, cooling towers, tank
     farm, factorySilo and the AA battery have no rooms. */
  AI.KIT.fac = { name: 'Factory (the Foundry)', frag: '88-factory.js', culture: 'ancient', wealth: 0.5, types: ['industrial'],
    buildings: function (d) {
      const hx = -40, Y0 = 6, hw = y => 42.4 * Math.sqrt(Math.max(0, 1 - (y - Y0) / 50));
      const ZE = 77;
      /* side strips: 10 m deep at the ground (h 4.5: x within hw(10.5) = 40.45 of hx), 7.8 m on the mezzanine (hw(15)) */
      const g = hw(Y0 + 4.5), m = hw(11 + 4);
      const kG = cyc(['study', 'study', 'store']), kM = cyc(['study', 'study', 'store', 'study']);
      const side = (id, lv, y, h, xo, D, kinds) => AI.barPlate({ id, level: lv, y, h, depth: D, side: 'left', cw: 2.2, roomW: 5.5, kinds,
        ends: ['core', 'store'],
        path: xo < 0 ? line(xo, -ZE, xo, ZE) : line(xo, ZE, xo, -ZE) });
      const wG = hx - g + 0.3, eG = hx + g - 0.3;           /* the ground strips' outer faces */
      const sW = side('fac.gw', 0, Y0, 4.5, wG + 5, 10, kG), sE = side('fac.ge', 0, Y0, 4.5, eG - 5, 10, kG);
      const wM = hx - m + 0.3, eM = hx + m - 0.3;
      /* the mezzanine's inner edge is the ground strip's (x -70.2 / -9.8): its corridor stands over the one below */
      const DM = (wG + 10) - wM;
      const mW = side('fac.mw', 1, 11, 4, wM + DM / 2, DM, kM), mE = side('fac.me', 1, 11, 4, eM - DM / 2, DM, kM);
      /* the shop floor: two aisles down the hall, bays 12 x 12 either side of each (the bay height is the working
         clear height under the vault: at |x - hx| = 28.4, the outer bays' edge, the guts stand 27 m) */
      const floor = AI.gridPlate({ id: 'fac.floor', level: 0, y: Y0, h: 12, x0: wG + 10 + 1.8, x1: eG - 10 - 1.8, z0: -ZE, z1: ZE,
        bay: [12, 12], aisle: 4, along: 'z', kinds: (i, n, row) => (i % 6 === 5 ? 'store' : 'workshop') });
      const inside = (x, z, y) => Math.abs(x - hx) < hw(y) + 0.2 && Math.abs(z) < 79;
      return [{ id: 'fac', name: 'the Foundry hall', storeys: [sW, sE, floor], floors: false, hollow: [], inside },
              { id: 'fac-mezz', name: 'the Foundry mezzanines', storeys: [mW, mE], floors: true, hollow: [], inside }];
    } };

  /* ---------------------------------------------------------------- ROBOTICS FACTORY, the Assembler (62-robotics.js)
     The hall: HW 200, HD 90, HH 22 centred x -40 on the base (BOXC 400 x 4 x 300, top y 4): x -140..60, z -45..45,
     y 4..26. INTACT IT IS A SOLID boxD (198 x 20 x 88 at (-40, 15, 0)): hollow. The ruin is four 1.6 m walls round
     the assembly floor: three conveyor lines at z -24, 0, 24 (x -128..48) with machines at lz +- 5 every 16 m, gantries
     at y 21, the dark ceiling at y 25. The plan follows the ruin: an aisle 6 m wide down each line and machine bays
     9 deep either side, 16 m long and centred on the machines (x -128 + 16k); store rooms along the north and south
     walls; an office block at the east end, three storeys of 5.5 m (y 4, 9.5, 15: under the ceiling at 25).
     The tower: a fluted drum r 24 + 3 sin(.3y), H 70 at (110, -40) from y 4, lined by a dark lathe r 20 (nu 24:
     inscribed 19.83); open bays every 14 m, their bay plates (boxD 6 x .6 x 10 at r 21) at y 18, 32, 46, 60 (top
     18.3). Five levels of 14 m: a ring of ten bays (one per opening) round a central assembly hall. The ruin cuts
     the drum at 85% (y 63.5, jag 3) and draws no plate at 60: that level falls in (collapse). */
  AI.KIT.robo = { name: 'Robotics factory (the Assembler)', frag: '62-robotics.js', culture: 'ancient', wealth: 0.55, types: ['industrial'],
    buildings: function (d) {
      const Y = 4;
      const floor = AI.gridPlate({ id: 'robo.floor', level: 0, y: Y, h: 12, x0: -139, x1: 43, z0: -36, z1: 36, bay: [16, 9], aisle: 6, along: 'x',
        kinds: (i, n, row) => (i % 11 === 0 || i % 11 === 10 ? 'store' : 'workshop') });
      const strip = (id, z, sd) => AI.barPlate({ id, level: 0, y: Y, h: 6, depth: 7.8, side: sd, cw: 2.2, roomW: 12, path: line(-138.8, z, 42.5, z),
        kinds: cyc(['store', 'store', 'store', 'workshop']), ends: null });
      const sN = strip('robo.n', -40.05, 'right'), sS = strip('robo.s', 40.05, 'left');
      const office = (lv, y) => AI.barPlate({ id: 'robo.o' + lv, level: lv, y, h: 5, depth: 15, side: 'both', cw: 2.4, roomW: 6,
        path: line(51.5, -43.8, 51.5, 43.8), ends: ['core', lv ? 'store' : 'antechamber'],
        kinds: lv === 0 ? cyc(['study', 'study', 'store']) : cyc(['study', 'study', 'study', 'store']) });
      const o0 = office(0, Y), o1 = office(1, 9.5), o2 = office(2, 15);
      /* the tower */
      const tx = 110, tz = -40, TY = [4, 18.4, 32.4, 46.4, 60.4];
      const ring = (lv, y) => AI.ringPlate({ id: 'robo.t' + lv, level: lv, y, h: 13.2, cx: tx, cz: tz, rOut: () => 19.3, depth: 7, cw: 2.4, n: 10, sym: 10,
        kinds: cyc(lv % 2 ? ['workshop', 'store'] : ['workshop', 'workshop', 'store', 'workshop', 'workshop']), core: { r: 9.5, kind: 'workshop' } });
      const T = TY.map((y, lv) => ring(lv, y));
      const hall = (x, z) => x > -139.6 && x < 59.6 && z > -44.6 && z < 44.6;
      const tower = (x, z) => Math.hypot(x - tx, z - tz) < 19.85;
      return [{ id: 'robo', name: 'the Assembler hall', storeys: [floor, sN, sS, o0], floors: false,
                hollow: d === 0 ? [{ box: [-139, 59, 5, 25, -44, 44] }] : [], inside: hall },
              { id: 'robo-offices', name: 'the hall office block', storeys: [o1, o2], floors: true, hollow: [], inside: hall },
              { id: 'robo-tower', name: 'the assembly tower, ground', storeys: [T[0]], floors: false, hollow: [], inside: tower },
              { id: 'robo-tower-up', name: 'the assembly tower', storeys: T.slice(1), floors: true, hollow: [], inside: tower,
                collapse: d > 0 ? (x, z, y) => y > 56 : null }];
    } };

  /* ---------------------------------------------------------------- DATA CENTRE, the Vault (72-datacenter.js)
     The mass: W 260, Dp 140, H 62 on the 8 m berm, battered 6% (at the roof x +-122.2, z +-65.8): rooms keep to
     |x| < 121.8, |z| < 65.4. INTACT IT IS A SOLID boxD (W .94 x H x Dp .94 at (0, 39, 0)): hollow. The ruin's bite
     (the south-east corner, x > 52, z > -18) shows four server floors 15.5 m apart (slabs at 8 + 15.5 j, .8 thick,
     shrinking upward by lim 1, .75, .57, .39) with rack rows along x every 8.5 m in z; the rest of the ruin is the dark
     mass in two boxes (hollow). So: four server levels, y 8.8 + 15.5 j, clear 14.7, each an open floor of server bays
     (18 x 9 on aisles along x: the rack rows' direction), in three blocks that meet the ruin's cut faces (x 52, z -18):
     the west block, the north-east block, and the bite. On level 0 the west end is an office block: three storeys of
     5.17 m (offices, stores, a stair core at each end). The entrance slit (boxD 9 x 18 x 16 at (0, 17, 63.8)) keeps
     clear of bays. The bite is its own building: floors true intact, false in a ruin (the builder's slabs); where a
     ruined slab ends (x > 52 + 74.1 lim, z > -18 + 85.9 lim) the bays fall in. */
  AI.KIT.dc = { name: 'Data centre (the Vault)', frag: '72-datacenter.js', culture: 'ancient', wealth: 0.6, types: ['industrial', 'civic'],
    buildings: function (d) {
      const XE = 121.8, ZE = 65.4, XI = 52, ZI = -18, FY = 15.5, Y0 = 8.8, H = 14.7;
      const slit = (x, z, y) => y < 26 && Math.abs(x) < 14.5 && z > 50;   /* a bay's centre within its half-size of the slit */
      const kinds = (i, n, row) => ((i + row) % 3 === 0 ? 'store' : 'workshop');
      const grid = (id, lv, x0, x1, z0, z1) => AI.gridPlate({ id, level: lv, y: Y0 + FY * lv, h: H, x0, x1, z0, z1, bay: [18, 9], aisle: 3.5, along: 'x',
        kinds, skip: (x, z) => slit(x, z, Y0 + FY * lv) });
      const W = [], B = [], O = [];
      for (let j = 0; j < 4; j++) {
        W.push(grid('dc.w' + j, j, j === 0 ? -106 : -XE, XI, -ZE, ZE));
        W.push(grid('dc.ne' + j, j, XI, XE, -ZE, ZI));
        B.push(grid('dc.b' + j, j, XI, XE, ZI, ZE));
      }
      for (let k = 0; k < 3; k++) O.push(AI.barPlate({ id: 'dc.o' + k, level: k, y: Y0 + k * FY / 3, h: 4.6, depth: 13, side: 'both', cw: 2.4, roomW: 6,
        path: line(-115.1, -45, -115.1, 45), ends: ['core', 'core'], kinds: k === 0 ? cyc(['study', 'store', 'study']) : cyc(['study', 'study', 'study', 'store']) }));
      const lim = [1, 0.75, 0.57, 0.39];
      const box = (x, z) => Math.abs(x) < XE + 0.3 && Math.abs(z) < ZE + 0.3;
      return [{ id: 'dc', name: 'the Vault server floors', storeys: W, floors: true,
                hollow: d === 0 ? [{ box: [-122.2, 122.2, 8, 70, -65.8, 65.8] }]
                                : [{ box: [-122.2, 52, 8, 70, -65.8, 65.8] }, { box: [52, 122.2, 8, 70, -65.8, -18] }], inside: box },
              { id: 'dc-offices', name: 'the Vault office block', storeys: O, floors: true, hollow: [], inside: box },
              { id: 'dc-bite', name: 'the Vault, south-east server floors', storeys: B, floors: d === 0, hollow: [],
                inside: (x, z) => box(x, z) && x > XI - 0.3 && z > ZI - 0.3,
                collapse: d > 0 ? function (x, z, y) { const j = Math.max(0, Math.min(3, Math.round((y - Y0) / FY))), l = lim[j];
                  return x > XI + (126.1 - XI) * l || z > ZI + (67.9 - ZI) * l; } : null }];
    } };

  /* ---------------------------------------------------------------- STARPORT, the Starfish (44-starport.js)
     The dome: RD 70, HD 40 on a 3 m drum (r 80.5, uncapped: the floor is the ground; rooms at y .3, the kit's slab);
     the ruin lines it with a dark lathe at .9 r. Five hangar arms, L 210, at th = i 72deg + .3, each starting at
     RD .6 = 42 from the centre (inside the dome) with a vault of half-width w = 38 (1 - .55 t) and height
     h = 30 (1 - .6 t) + 6, profile y = h (1 - q^2)^.55; the ruin lines each with guts at .985 (about the origin) and
     3 + .9 (y - 3) up. The arms' inner ends cut the dome's middle into a pentagon of inradius 42 (41.4 in the ruin):
     that is the concourse, an open floor of bays (seating halls, shops, waiting rooms) on aisles. Inside the drum the
     arm vaults cross the dome skin: no rooms there. Each arm outside the drum (from 82 m out to 214, short of the mouth's
     door apron) is a hangar: a strip of stores along each vault side (h 4, kept under the vault) and open maintenance
     bays down the middle, narrowing with the arm. In the ruin arm 2 has pancaked beyond its break (v > .5): those
     rooms fall in. The control needle (from y 38) has no room. */
  AI.KIT.port = { name: 'Starport (the Starfish)', frag: '44-starport.js', culture: 'ancient', wealth: 0.6, types: ['civic', 'industrial'],
    buildings: function (d) {
      const RD = 70, HD = 40, NA = 5, L = 210, U0 = RD * 0.6, Y = 0.3;
      const TH = i => i / NA * TAU + 0.3;
      /* the half-width of arm floor under which a room of top yTop fits, at u metres from the centre, intact and ruined */
      const sect = t => ({ w: 38 * (1 - 0.55 * t), h: HD * 0.75 * (1 - 0.6 * t) + 6 });
      const half = (t, y) => { if (t < 0 || t > 1) return 0; const s = sect(t), k = y / s.h; return k >= 1 ? 0 : s.w * Math.sqrt(1 - Math.pow(k, 1 / 0.55)); };
      const avail = (u, yTop) => Math.min(half((u - U0) / L, yTop), 0.985 * half((u / 0.985 - U0) / L, (yTop - 3) / 0.9 + 3));
      const availOn = (ua, ub, yTop) => { let m = Infinity; for (let k = 0; k <= 8; k++) m = Math.min(m, avail(ua + (ub - ua) * k / 8, yTop)); return m; };
      /* the concourse: the pentagon left by the arms' inner ends, inradius 40.5 */
      const pent = (x, z) => { for (let i = 0; i < NA; i++) if (x * Math.cos(TH(i)) + z * Math.sin(TH(i)) > 40.5) return false; return true; };
      const BW = 10, BD = 8;
      const conc = AI.gridPlate({ id: 'port.c', level: 0, y: Y, h: 6, x0: -52, x1: 52, z0: -52, z1: 52, bay: [BW, BD], aisle: 4, along: 'x',
        kinds: cyc(['hall', 'hall', 'shop', 'hall', 'antechamber', 'shop', 'hall', 'store']),
        skip: (x, z) => !(pent(x - BW / 2, z - BD / 2) && pent(x + BW / 2, z - BD / 2) && pent(x + BW / 2, z + BD / 2) && pent(x - BW / 2, z + BD / 2)) });
      /* the hangars, drawn along +x (u out from the centre, v across) and turned onto each arm */
      const UA = U0 + 40, UB = U0 + 172, SD = 6, SH = 4, BH = 9;
      const arms = [];
      for (let i = 0; i < NA; i++) {
        const th = TH(i), cx = Math.cos(th), cz = Math.sin(th), f = p => [p[0] * cx - p[1] * cz, p[0] * cz + p[1] * cx];
        const edge = u => avail(u, Y + SH + 0.2) - 0.4;   /* the strips' outer face */
        const strips = [1, -1].map(s => xform(AI.barPlate({ id: 'port.a' + i + (s > 0 ? 'l' : 'r'), level: 0, y: Y, h: SH, depth: SD, side: s > 0 ? 'left' : 'right', cw: 2.2, roomW: 11,
          path: u => { const uu = UA + (UB - UA) * u; return [uu, s * (edge(uu) - SD / 2)]; },
          kinds: cyc(['store', 'store', 'workshop', 'store']), ends: null }), f));
        const bays = xform(AI.gridPlate({ id: 'port.a' + i + 'm', level: 0, y: Y, h: BH, x0: UA, x1: UB, z0: -24.5, z1: 24.5, bay: [12, 9], aisle: 6, along: 'x',
          kinds: (k, n, row) => (k % 4 === 3 ? 'store' : 'workshop'),
          skip: (u, v) => { const ua = u - 6, ub = u + 6, o = Math.abs(v) + 4.5;
            return o > availOn(ua, ub, Y + BH + 0.2) - 0.5 || o > Math.min(edge(ua), edge(ub)) - SD - 0.6; } }), f);
        arms.push({ id: 'port-arm' + i, name: 'hangar arm ' + (i + 1), storeys: strips.concat([bays]), floors: true, hollow: [],
          inside: (x, z) => { const u = x * cx + z * cz, v = -x * cz + z * cx; return u > U0 - 1 && u < U0 + L && Math.abs(v) < sect((u - U0) / L).w; },
          collapse: d > 0 && i === 2 ? (x, z) => x * cx + z * cz > U0 + 0.5 * L - 5 : null });
      }
      return [{ id: 'port', name: 'the concourse', storeys: [conc], floors: true, hollow: [], inside: (x, z) => pent(x * 0.98, z * 0.98) }].concat(arms);
    } };
})(KratorAncientsInteriors);
