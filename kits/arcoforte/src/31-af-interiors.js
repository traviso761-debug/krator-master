/* ================================================================= ARCOFORTE — interiors: living, work, and recreation ([G data])
   Plans out the interiors across all six zones of Arcoforte so the complex can stand, in refurbished form, as the
   centerpiece of a new settlement (`PLAN.md` section 2):
     - LIVING: sloped-terrace apartments in the 9 Neocliff Bastions, radial atrium apartments in the Domed Rotunda,
               cellular sky-tray dwellings in the 7 Sea-Cliff Skyscrapers, upper live-over-work flats in the Linear City.
     - WORK:   cliff-foot Fishing, Cold-Storage, Sail Loft & Boatyard Hall; City Center vaulted markets, workshops,
               clinic, school & counting houses; Linear City customs & warehouses; Skyscraper Living-Working studios;
               and the sealed/ruined Sub-Cliff Automated Industry Vaults (kept intact only in `?state=intact`).
     - REC:    Domed Rotunda Grand Reception Concourse, Refectory & Observatory; Promenade Mushroom-Pier Belvederes
               (sea-view tavern, bathhouse, reading pavilion, conservatory); 300 m Sky-Crown Cultural Assembly Hall,
               Hanging Sky-Garden & Chart Deck; Linear City travellers tavern; Central Park Amphitheatre.

   Uses `kits/ancients-interiors` plates (`AI.ringPlate`, `AI.barPlate`, `AI.hallPlate`, `AI.gridPlate`) and hall recipes.
   Every room carries `sector` ('living' | 'work' | 'rec' | 'infra') and `kept` (boolean). Pure [G data]: no Three.js, no DOM. */
const AF_INT = (function () {
  'use strict';
  const PI = Math.PI, D2R = PI / 180;
  const r2 = v => Math.round(v * 100) / 100;
  const cyc = arr => (i => arr[i % arr.length]);
  const rectPoly = (x0, x1, z0, z1) => [[r2(x0), r2(z0)], [r2(x1), r2(z0)], [r2(x1), r2(z1)], [r2(x0), r2(z1)]];

  /* Culture socket profiles: maps a socket name onto the catalog culture, allowed fallback list, and hall-recipe dress */
  const SOCKETS = {
    refurbished: {
      label: 'Refurbished (Ancient + Settler Salvage)',
      culture: 'post-apoc',
      cultures: ['ancient', 'post-apoc', 'scrap', 'generic'],
      dress: 'occupied',
      wealth: 0.58
    },
    ancient: {
      label: 'Intact Ancient',
      culture: 'ancient',
      cultures: ['ancient', 'generic'],
      dress: 'ancient',
      wealth: 0.78
    },
    scrap: {
      label: 'Frontier Scrap Settlers',
      culture: 'scrap',
      cultures: ['scrap', 'post-apoc', 'generic'],
      dress: 'occupied',
      wealth: 0.35
    },
    iziz: {
      label: 'Izani Imperial Refit',
      culture: 'iziz',
      cultures: ['iziz', 'ancient', 'generic'],
      dress: 'iziz',
      wealth: 0.65
    },
    xanadu: {
      label: 'Xanadu Sultanate Refit',
      culture: 'xanadu',
      cultures: ['xanadu', 'ancient', 'generic'],
      dress: 'xanadu',
      wealth: 0.65
    },
    republican: {
      label: 'Highland Republic Refit',
      culture: 'republican',
      cultures: ['republican', 'ancient', 'generic'],
      dress: 'republican',
      wealth: 0.62
    }
  };

  /* Register custom culture dresses on KratorAncientsInteriors when available so recipes dress in the socket's culture */
  function installDresses(AI, cat) {
    if (!AI || !AI.DRESS || AI._afDressed) return;
    const known = {};
    if (cat && cat.list) cat.list().forEach(e => { known[e.key] = e; });
    const pick = (cult, type, fb) => {
      if (cat && cat.list) {
        const hit = cat.list().find(e => e.culture === cult && e.type === type && e.setting !== 'outdoor');
        if (hit) return hit.key;
      }
      return fb;
    };
    ['iziz', 'xanadu', 'republican'].forEach(c => {
      AI.DRESS[c] = Object.assign({}, AI.DRESS.occupied, {
        table: pick(c, 'table', AI.DRESS.occupied.table),
        bench: pick(c, 'bench', AI.DRESS.occupied.bench),
        chair: pick(c, 'chair', AI.DRESS.occupied.chair),
        desk: pick(c, 'desk', AI.DRESS.occupied.desk),
        bookcase: pick(c, 'shelf', AI.DRESS.occupied.bookcase),
        divan: pick(c, 'bed', AI.DRESS.occupied.divan),
        banner: pick(c, 'banner', AI.DRESS.occupied.banner),
        lampStem: pick(c, 'lamp', AI.DRESS.occupied.lampStem)
      });
    });
    AI._afDressed = true;
  }

  function tagStorey(st, sector, kept, levelName) {
    st.sector = sector;
    st.kept = kept;
    st.levelName = levelName;
    st.rooms.forEach(R => {
      R.sector = (R.kind === 'corridor' || R.kind === 'core') ? 'infra' : sector;
      R.kept = kept;
    });
    return st;
  }

  /* Build all 12 cutaway interior units in world coordinates (matching the arcology's local frame) */
  function buildPlans(AI, state, P) {
    const L = P || ARCOFORTE.plan({ state: state });
    const stMode = L.state;
    const D = ARCOFORTE.DIM;
    const units = [];

    function pushUnit(spec) {
      const ruinShare = !spec.kept ? 0.48 : (stMode === 'ruined' ? 0.42 : 0);
      spec.storeys.forEach(st => {
        if (ruinShare > 0) {
          AI.ruinStorey(st, 'af|' + spec.id + '|' + stMode, { frac: ruinShare, place: Math.round(spec.x) + ',' + Math.round(spec.z) });
        }
        st.rooms.forEach(R => {
          R.building = spec.id;
          R.culture = 'ancient';
          R.wealth = spec.kept ? 0.6 : 0.3;
          if (!spec.kept) R.furnish = false;
        });
      });
      const bld = {
        id: spec.id,
        name: spec.name,
        sector: spec.sector,
        kept: spec.kept,
        storeys: spec.storeys,
        floors: true,
        hollow: null
      };
      const plan = {
        type: 'arcoforte.' + spec.id,
        d: spec.kept ? 0 : 1,
        state: spec.kept ? 'intact' : 'ruined',
        name: spec.name,
        furnish: spec.kept,
        culture: 'ancient',
        wealth: 0.6,
        types: spec.types,
        buildings: [bld]
      };
      units.push(Object.assign({}, spec, {
        levels: spec.storeys.map(s => ({ y: s.y, h: s.h, name: s.levelName + ' [' + s.sector.toUpperCase() + ']', sector: s.sector })),
        buildings: [bld],
        plan: plan
      }));
    }

    const keptMain = stMode !== 'ruined';
    const keptAuto = stMode === 'intact';

    /* 1. HARBOUR WORKS (Fishing Industry, Cold Storage, Sail Loft & Boatyard; y = 6.0, 12.0 m) */
    {
      const y0 = D.BENCH + 0.4, h = 5.2;
      const s0 = AI.barPlate({
        id: 'af.hw.s0', level: 0, y: y0, h: h,
        path: u => [-74 + 148 * u, -227], depth: 24, side: 'both', cw: 3.0, roomW: 14,
        kinds: cyc(['workshop', 'store', 'workshop', 'sailloft', 'store']), ends: ['core', null], door: 1.6
      });
      tagStorey(s0, 'work', keptMain, 'Fishing & Boatyard Floor');

      const s1 = AI.hallPlate({
        id: 'af.hw.s1', level: 1, y: y0 + 6.0, h: h,
        poly: rectPoly(-56, 56, -238, -216), kind: 'store', doorEdge: 0, doorW: 2.4, furnish: keptMain, recipe: 'store-hall'
      });
      tagStorey(s1, 'work', keptMain, 'Cold Storage & Fleet Provision Hall');

      pushUnit({
        id: 'harbour_works', name: 'Harbour Fishing & Cold-Storage Works', sector: 'work', kept: keptMain,
        x: 0, z: -227, w: 164, d: 30, types: ['industry', 'infrastructure'], storeys: [s0, s1]
      });
    }

    /* 2. SUB-CLIFF AUTOMATED INDUSTRIES (Sealed & ruined in refurbished state; intact in ?state=intact) */
    {
      const y0 = D.BENCH + 0.4, h = 5.6;
      const s0 = AI.hallPlate({
        id: 'af.auto.s0', level: 0, y: y0, h: h,
        poly: rectPoly(-62, 62, -202, -178), kind: 'workshop', doorEdge: 0, doorW: 2.6, furnish: keptAuto, recipe: 'engine-room'
      });
      tagStorey(s0, 'infra', keptAuto, keptAuto ? 'Automated Industry & Transit Plant' : 'Sealed Automated Vaults (Ruined)');

      pushUnit({
        id: 'auto_vaults', name: 'Sub-Cliff Automated Industry Vaults', sector: 'infra', kept: keptAuto,
        x: 0, z: -190, w: 140, d: 30, types: ['industry', 'infrastructure'], storeys: [s0]
      });
    }

    /* 3. LINEAR CITY WEST SPINE (Customs Reception, Craft Workshops & Upper Town Flats) */
    {
      const cx = -(D.LIN_GAP + D.LIN_W / 2);
      const s0 = AI.hallPlate({
        id: 'af.lw.s0', level: 0, y: 84.4, h: 4.2,
        poly: rectPoly(cx - 14, cx + 14, 224, 284), kind: 'hall', doorEdge: 1, doorW: 2.2, furnish: keptMain, recipe: 'reception'
      });
      tagStorey(s0, 'work', keptMain, 'Land-Gate Customs & Trade Reception');

      const s1 = AI.barPlate({
        id: 'af.lw.s1', level: 1, y: 89.2, h: 4.0,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.6, roomW: 9.5,
        kinds: cyc(['workshop', 'store', 'study', 'workshop', 'armoury']), ends: ['core', null], door: 1.3
      });
      tagStorey(s1, 'work', keptMain, 'Artisans, Smithy & Guild Workshops');

      const s2 = AI.barPlate({
        id: 'af.lw.s2', level: 2, y: 94.0, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall', 'study']), ends: ['core', null], door: 1.1
      });
      tagStorey(s2, 'living', keptMain, 'Linear Spine Lower Flats');

      const s3 = AI.barPlate({
        id: 'af.lw.s3', level: 3, y: 98.8, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 26, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'bedroom', 'kitchen', 'dormitory']), ends: ['core', null], door: 1.1
      });
      tagStorey(s3, 'living', keptMain, 'Linear Spine Terrace Apartments');

      pushUnit({
        id: 'linear_west', name: 'Linear City West (Customs, Workshops & Flats)', sector: 'work', kept: keptMain,
        x: cx, z: 290, w: 36, d: 164, types: ['market', 'industry', 'dwelling-multi'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 4. LINEAR CITY EAST SPINE (Caravan Warehouse, Travellers Tavern/Mess & Family Flats) */
    {
      const cx = D.LIN_GAP + D.LIN_W / 2;
      const s0 = AI.hallPlate({
        id: 'af.le.s0', level: 0, y: 84.4, h: 4.2,
        poly: rectPoly(cx - 14, cx + 14, 224, 288), kind: 'store', doorEdge: 3, doorW: 2.4, furnish: keptMain, recipe: 'store-hall'
      });
      tagStorey(s0, 'work', keptMain, 'Caravan Freight & Granary Hall');

      const s1 = AI.hallPlate({
        id: 'af.le.s1', level: 1, y: 89.2, h: 4.0,
        poly: rectPoly(cx - 14, cx + 14, 224, 280), kind: 'tavern', doorEdge: 3, doorW: 2.0, furnish: keptMain, recipe: 'crew-mess'
      });
      tagStorey(s1, 'rec', keptMain, 'Travellers Tavern & Common Mess');

      const s2 = AI.barPlate({
        id: 'af.le.s2', level: 2, y: 94.0, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'kitchen', 'dormitory', 'bedroom']), ends: ['core', null], door: 1.1
      });
      tagStorey(s2, 'living', keptMain, 'East Spine Family Apartments');

      const s3 = AI.barPlate({
        id: 'af.le.s3', level: 3, y: 98.8, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 26, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'hall', 'kitchen', 'bedroom']), ends: ['core', null], door: 1.1
      });
      tagStorey(s3, 'living', keptMain, 'East Spine Penthouse Flats');

      pushUnit({
        id: 'linear_east', name: 'Linear City East (Warehouse, Tavern & Flats)', sector: 'living', kept: keptMain,
        x: cx, z: 290, w: 36, d: 164, types: ['tavern', 'dwelling-multi'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 5. WEST CITY CENTER VAULTED ARCADE (West N-S flank facet at x = -178 m, matching Soleri Plate 1 west wing) */
    {
      const chordPath = u => [-178, -62 + 164 * u];
      const s0 = AI.barPlate({
        id: 'af.cw.s0', level: 0, y: 84.4, h: 5.2, path: chordPath, depth: 30, side: 'both', cw: 3.2, roomW: 11,
        kinds: cyc(['workshop', 'store', 'tavern', 'workshop', 'laundry']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s0, 'work', keptMain, 'Park Arcade Market & Trade Stalls');

      const s1 = AI.barPlate({
        id: 'af.cw.s1', level: 1, y: 90.4, h: 4.8, path: chordPath, depth: 30, side: 'both', cw: 3.0, roomW: 11,
        kinds: cyc(['sickbay', 'study', 'strongroom', 'sickbay', 'store']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s1, 'work', keptMain, 'Settlement Clinic, Apothecary & Offices');

      const s2 = AI.barPlate({
        id: 'af.cw.s2', level: 2, y: 96.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 10,
        kinds: cyc(['study', 'library', 'school', 'workshop']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s2, 'work', keptMain, 'Guild Chambers & Craft School');

      const s3 = AI.barPlate({
        id: 'af.cw.s3', level: 3, y: 102.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 11,
        kinds: cyc(['bath', 'hall', 'tavern', 'shrine']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s3, 'rec', keptMain, 'Bathhouse, Social Halls & Skylight Lounge');

      pushUnit({
        id: 'city_west', name: 'West City Center (Market, Clinic & Baths)', sector: 'work', kept: keptMain,
        x: -178, z: 20, w: 72, d: 172, types: ['civic', 'market', 'tavern'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 6. EAST CITY CENTER VAULTED ARCADE (East N-S flank facet at x = +178 m, matching Soleri Plate 1 east wing) */
    {
      const chordPath = u => [178, -62 + 164 * u];
      const s0 = AI.barPlate({
        id: 'af.ce.s0', level: 0, y: 84.4, h: 5.2, path: chordPath, depth: 30, side: 'both', cw: 3.2, roomW: 11,
        kinds: cyc(['workshop', 'store', 'workshop', 'kitchen', 'store']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s0, 'work', keptMain, 'East Park Arcade & Craft Works');

      const s1 = AI.barPlate({
        id: 'af.ce.s1', level: 1, y: 90.4, h: 4.8, path: chordPath, depth: 30, side: 'both', cw: 3.0, roomW: 11,
        kinds: cyc(['study', 'strongroom', 'chartroom', 'study']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s1, 'work', keptMain, 'Counting House, Registry & Assay');

      const s2 = AI.barPlate({
        id: 'af.ce.s2', level: 2, y: 96.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 10.5,
        kinds: cyc(['school', 'library', 'study', 'school']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s2, 'work', keptMain, 'Academy, Scriptorium & Archive');

      const s3 = AI.barPlate({
        id: 'af.ce.s3', level: 3, y: 102.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 11,
        kinds: cyc(['hall', 'tavern', 'kitchen', 'library']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s3, 'rec', keptMain, 'East Commons, Refectory & Club Rooms');

      pushUnit({
        id: 'city_east', name: 'East City Center (Counting House, Academy & Commons)', sector: 'work', kept: keptMain,
        x: 178, z: 20, w: 72, d: 172, types: ['civic', 'market'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 7 & 8. BATTERED NEOCLIFF DWELLING BASTIONS (West w1 & East e2: 5 stepped residential levels each) */
    [
      { id: 'bastion_west', b: L.bastions.find(x => x.id === 'af.bastion.w1') || L.bastions[5], label: 'West Neocliff Dwelling Bastion' },
      { id: 'bastion_east', b: L.bastions.find(x => x.id === 'af.bastion.e2') || L.bastions[2], label: 'East Neocliff Dwelling Bastion' }
    ].forEach(BS => {
      const B = BS.b, am = B.am, storeys = [];
      for (let lv = 0; lv < 5; lv++) {
        const y = 84.4 + lv * 10.0, t = (y - D.PLATEAU) / (D.Y_RING_TOP - D.PLATEAU);
        const rOuter = (B.rOut0 + (B.rOut1 - B.rOut0) * t) - 4;
        const rInner = B.rIn + 4;
        const p0 = [D.RING_CX + rInner * Math.cos(am), D.RING_CZ + rInner * Math.sin(am)];
        const p1 = [D.RING_CX + rOuter * Math.cos(am), D.RING_CZ + rOuter * Math.sin(am)];
        const st = AI.barPlate({
          id: 'af.' + BS.id + '.s' + lv, level: lv, y: y, h: 3.8,
          path: u => [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u],
          depth: 30, side: 'both', cw: 2.4, roomW: 7.2,
          kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall', 'dormitory', 'study']), ends: ['core', null], door: 1.0
        });
        tagStorey(st, 'living', keptMain, 'Terrace Dwelling Tier ' + (lv + 1));
        storeys.push(st);
      }
      pushUnit({
        id: BS.id, name: BS.label + ' (Stepped Apartments)', sector: 'living', kept: keptMain,
        x: B.cx, z: B.cz, r: 46, types: ['dwelling-multi'], storeys: storeys
      });
    });

    /* 9. PROMENADE MUSHROOM-PIER RECREATION BELVEDERE (y = 152.4, 159.0 m on East Promenade) */
    {
      const pv = L.promenade.pavilions[1];
      const s0 = AI.hallPlate({
        id: 'af.prom.s0', level: 0, y: 152.4, h: 4.8,
        poly: rectPoly(pv.x - 13, pv.x + 13, pv.z - 9, pv.z + 9), kind: 'tavern', doorEdge: 0, doorW: 2.0, furnish: keptMain, recipe: 'stern-lounge'
      });
      tagStorey(s0, 'rec', keptMain, 'Mushroom-Pier Belvedere Lounge & Tavern');

      const s1 = AI.hallPlate({
        id: 'af.prom.s1', level: 1, y: 159.0, h: 4.8,
        poly: rectPoly(pv.x - 13, pv.x + 13, pv.z - 9, pv.z + 9), kind: 'hall', doorEdge: 0, doorW: 2.0, furnish: keptMain, recipe: 'greenhouse'
      });
      tagStorey(s1, 'rec', keptMain, 'Roof Conservatory & Tea Garden');

      pushUnit({
        id: 'promenade_rec', name: 'Promenade Belvedere (Lounge & Conservatory)', sector: 'rec', kept: keptMain,
        x: pv.x, z: pv.z, w: 32, d: 24, types: ['tavern', 'civic'], storeys: [s0, s1]
      });
    }

    /* 10. DOMED ROTUNDA ("TOURIST CENTER" & RESIDENTIAL ATRIUM DRUM, R = 40 m) */
    {
      const rx = D.ROT_X, rz = D.ROT_Z, rOut = () => D.ROT_R - 1.8;
      /* L0 (y = 70.4): Grand Pilgrim & Tourist Reception Ring + Central Atrium Plaza */
      const s0 = AI.ringPlate({
        id: 'af.rot.s0', level: 0, y: 70.4, h: 5.6, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 3.0, roomW: 8.5, sym: 12,
        kinds: cyc(['hall', 'tavern', 'store', 'shrine']), core: { r: 14, kind: 'hall', recipe: 'reception' }
      });
      tagStorey(s0, 'rec', keptMain, 'Grand Tourist & Pilgrim Reception Concourse');

      /* L1 (y = 78.4): Grand Refectory & Kitchens */
      const s1 = AI.ringPlate({
        id: 'af.rot.s1', level: 1, y: 78.4, h: 5.2, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.8, roomW: 8.5, sym: 12,
        kinds: cyc(['kitchen', 'hall', 'tavern', 'store']), core: { r: 14, kind: 'hall', recipe: 'dining-hall' }
      });
      tagStorey(s1, 'rec', keptMain, 'Rotunda Grand Refectory & Feast Ring');

      /* L2 (y = 96.4): Administration, Chart & Archive Ring */
      const s2 = AI.ringPlate({
        id: 'af.rot.s2', level: 2, y: 96.4, h: 4.4, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.5, sym: 12,
        kinds: cyc(['study', 'library', 'chartroom', 'strongroom'])
      });
      tagStorey(s2, 'work', keptMain, 'Chancery, Harbour Registry & Archives');

      /* L3 & L4 (y = 122.4, 152.4): Sunlit Atrium Residential Rings */
      const s3 = AI.ringPlate({
        id: 'af.rot.s3', level: 3, y: 122.4, h: 4.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.0, sym: 12,
        kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall'])
      });
      tagStorey(s3, 'living', keptMain, 'Lower Atrium Residential Ring');

      const s4 = AI.ringPlate({
        id: 'af.rot.s4', level: 4, y: 152.4, h: 4.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.0, sym: 12,
        kinds: cyc(['bedroom', 'dormitory', 'kitchen', 'study'])
      });
      tagStorey(s4, 'living', keptMain, 'Upper Atrium Residential Ring');

      /* L5 (y = 186.4): Oculus Dome Observatory & Gallery */
      const s5 = AI.ringPlate({
        id: 'af.rot.s5', level: 5, y: 186.4, h: 5.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.8, roomW: 8.5, sym: 12,
        kinds: cyc(['library', 'hall', 'shrine', 'study']), core: { r: 13, kind: 'hall', recipe: 'gallery' }
      });
      tagStorey(s5, 'rec', keptMain, 'Oculus Dome Gallery & Observatory');

      pushUnit({
        id: 'rotunda', name: 'Domed Rotunda (Concourse, Refectory & Atrium Dwellings)', sector: 'rec', kept: keptMain,
        x: rx, z: rz, r: D.ROT_R + 2, types: ['civic', 'inn', 'dwelling-multi'], storeys: [s0, s1, s2, s3, s4, s5]
      });
    }

    /* 11. CENTRAL SEA-CLIFF SKYSCRAPER T3 (Living-Working Studios, Sky-Garden Mess & Tower Flats) */
    {
      const T3 = L.towers[3];
      const bar = (id, lv, y, kinds, sec, nm) => {
        const st = AI.barPlate({
          id: id, level: lv, y: y, h: 3.8,
          path: u => [T3.x - 14 + 28 * u, T3.z], depth: 24, side: 'both', cw: 2.4, roomW: 6.8,
          kinds: kinds, ends: ['core', null], door: 1.0
        });
        return tagStorey(st, sec, keptMain, nm);
      };
      const tStoreys = [
        bar('af.t3.s0', 0, 60.4, cyc(['workshop', 'store', 'study']), 'work', 'Cliff Plinth Transfer & Marine Studios'),
        bar('af.t3.s1', 1, 92.4, cyc(['workshop', 'study', 'library', 'workshop']), 'work', 'Lower Cliff Tray — Living-Working Studios'),
        bar('af.t3.s2', 2, 128.4, cyc(['study', 'bedroom', 'kitchen', 'workshop']), 'work', 'Mid Cliff Tray — Artisan Live-Work Suites'),
        tagStorey(AI.hallPlate({
          id: 'af.t3.s3', level: 3, y: 164.4, h: 4.4,
          poly: rectPoly(T3.x - 13, T3.x + 13, T3.z - 15, T3.z + 11), kind: 'hall', doorEdge: 2, doorW: 2.0, furnish: keptMain, recipe: 'crew-mess'
        }), 'rec', keptMain, 'Sea-View Cantilevered Sky-Garden Commons'),
        bar('af.t3.s4', 4, 200.4, cyc(['bedroom', 'kitchen', 'bedroom', 'dormitory']), 'living', 'Upper Tower Cellular Apartments'),
        bar('af.t3.s5', 5, 236.4, cyc(['bedroom', 'hall', 'kitchen', 'study']), 'living', 'High Cliff Lookout Apartments')
      ];
      pushUnit({
        id: 'tower_central', name: 'Sea-Cliff Skyscraper 4 (Living-Working & Tower Flats)', sector: 'living', kept: keptMain,
        x: T3.x, z: T3.z, w: 36, d: 36, types: ['dwelling-multi', 'industry'], storeys: tStoreys
      });
    }

    /* 12. 300 M COMPLEX SKY-CROWN (Hanging Sky-Garden, Cultural Assembly Hall & Chart Observatory) */
    {
      const cx = L.towers[3].x, cz = L.towers[3].z;
      const s0 = AI.hallPlate({
        id: 'af.cr.s0', level: 0, y: 258.4, h: 5.6,
        poly: rectPoly(cx - 42, cx + 42, cz - 14, cz + 14), kind: 'hall', doorEdge: 2, doorW: 2.6, furnish: keptMain, recipe: 'greenhouse'
      });
      tagStorey(s0, 'rec', keptMain, 'Hanging Sky-Garden & Hydroponic Conservatory');

      const s1 = AI.hallPlate({
        id: 'af.cr.s1', level: 1, y: 266.4, h: 6.0,
        poly: rectPoly(cx - 38, cx + 38, cz - 14, cz + 14), kind: 'hall', doorEdge: 2, doorW: 2.6, furnish: keptMain, recipe: 'officers-hall'
      });
      tagStorey(s1, 'rec', keptMain, 'Cultural Center & Settlement Council Hall');

      const s2 = AI.hallPlate({
        id: 'af.cr.s2', level: 2, y: 274.4, h: 5.4,
        poly: rectPoly(cx - 28, cx + 28, cz - 12, cz + 12), kind: 'chartroom', doorEdge: 2, doorW: 2.2, furnish: keptMain, recipe: 'chart-deck'
      });
      tagStorey(s2, 'work', keptMain, 'Sea-Watch Observatory, Beacon & Comms Deck');

      pushUnit({
        id: 'sky_crown', name: '300 m Sky-Crown (Sky-Gardens, Cultural Hall & Observatory)', sector: 'rec', kept: keptMain,
        x: cx, z: cz, w: 92, d: 34, types: ['civic', 'park'], storeys: [s0, s1, s2]
      });
    }

    return { state: stMode, units: units };
  }

  /* Compute exact architectural floor area (m2) and population/work/rec capacity across the whole complex,
     scaling representative bastion/tower plates across all 9 bastions and 7 skyscrapers, plus explicit room counts. */
  function areaSummary(P, built) {
    const bySector = { living: 0, work: 0, rec: 0, infra: 0 };
    const sampledRooms = { living: 0, work: 0, rec: 0, infra: 0, total: 0 };
    const multOf = {
      harbour_works: 1.5,
      auto_vaults: 2.0,
      linear_west: 1.75,
      linear_east: 1.75,
      city_west: 2.5,
      city_east: 2.5,
      bastion_west: 4 * 2.4,   /* 4 West bastions x 12 storeys / 5 sampled */
      bastion_east: 5 * 2.4,   /* 5 East bastions x 12 storeys / 5 sampled */
      promenade_rec: 6,        /* 6 Mushroom-pier belvederes */
      rotunda: 4.2,            /* 26 storeys / 6 sampled */
      tower_central: 7 * 7.5,  /* 7 Cliff skyscrapers x ~45 storeys / 6 sampled */
      sky_crown: 2.4           /* Full 7-tower span */
    };

    let keptFloor = 0, grossFloor = 0;
    built.units.forEach(u => {
      const mult = multOf[u.id] == null ? 1 : multOf[u.id];
      u.storeys.forEach(st => {
        st.rooms.forEach(R => {
          sampledRooms[R.sector] = (sampledRooms[R.sector] || 0) + 1;
          sampledRooms.total++;
          const a = R.poly ? (Math.abs(R.poly.reduce((s, p, i) => {
            const q = R.poly[(i + 1) % R.poly.length];
            return s + p[0] * q[1] - q[0] * p[1];
          }, 0)) / 2) : 180;
          const fullA = a * mult;
          bySector[R.sector] = (bySector[R.sector] || 0) + fullA;
          grossFloor += fullA;
          if (u.kept) keptFloor += fullA;
        });
      });
    });

    /* Soleri's Arcoforte peak benchmark: ~20,000 people (~22 m2 living net per person); refurbished centerpiece holds ~35% active occupancy */
    const peakResidents = Math.round(bySector.living / 11.2);
    const refurbishedResidents = P.state === 'ruined' ? 0 : Math.round(peakResidents * 0.36);
    const workSlots = Math.round(bySector.work / 24);
    const recCapacity = Math.round(bySector.rec / 8) + 650; /* includes outdoor Park Amphitheatre */

    return {
      grossM2: Math.round(grossFloor),
      keptM2: Math.round(keptFloor),
      bySectorM2: {
        living: Math.round(bySector.living),
        work: Math.round(bySector.work),
        rec: Math.round(bySector.rec),
        infra: Math.round(bySector.infra)
      },
      sampledUnits: built.units.length,
      sampledRooms: sampledRooms,
      peakPopulation: peakResidents,
      refurbishedPopulation: refurbishedResidents,
      workplaces: workSlots,
      recCapacity: recCapacity
    };
  }

  /* Export plain simulation-ready place records (`home`, `work`, `rec`) for a future settlement on core/simulation */
  function simPlaces(P, built, culture) {
    const places = [], cult = culture || 'refurbished';
    built.units.forEach(u => {
      if (!u.kept) return;
      u.storeys.forEach(st => {
        const area = st.rooms.reduce((s, r) => s + (r.poly ? 36 : 0), 0);
        places.push({
          id: 'sim.' + st.id,
          unit: u.id,
          name: u.name + ' — ' + st.levelName,
          sector: st.sector,
          activity: st.sector === 'living' ? 'SLEEP' : st.sector === 'work' ? 'WORK' : 'LEISURE',
          culture: cult,
          at: [u.x, st.y, u.z],
          capacity: Math.max(8, Math.round(area / (st.sector === 'rec' ? 10 : 18)))
        });
      });
    });
    places.push({
      id: 'sim.af.park.amphitheatre',
      unit: 'park',
      name: P.park.amphitheatre.name,
      sector: 'rec',
      activity: 'LEISURE',
      culture: cult,
      at: [P.park.amphitheatre.x, P.park.amphitheatre.y, P.park.amphitheatre.z],
      capacity: 650
    });
    return places;
  }

  /* Furnish all kept units in one AI.furnishPlan call so identical room shapes share templates across the whole complex */
  function furnishAll(AI, built, cat, sockKey, seed) {
    const sk = SOCKETS[sockKey] || SOCKETS.refurbished;
    installDresses(AI, cat);
    const keptBlds = [];
    built.units.forEach(u => {
      if (u.kept) u.buildings.forEach(b => keptBlds.push(b));
    });
    const combinedPlan = {
      type: 'arcoforte',
      d: 0,
      state: 'intact',
      name: 'Arcoforte',
      furnish: keptBlds.length > 0,
      culture: sk.culture,
      wealth: sk.wealth,
      types: ['civic', 'dwelling-multi', 'industry'],
      buildings: keptBlds
    };
    const F = AI.furnishPlan(combinedPlan, cat, {
      culture: sk.culture,
      cultures: sk.cultures,
      wealth: sk.wealth,
      seed: seed == null ? 11 : seed
    });
    const byUnit = {};
    built.units.forEach(u => { byUnit[u.id] = { rooms: [], pieces: 0 }; });
    (F.rooms || []).forEach(r => {
      const uid = r.R && r.R.building;
      if (byUnit[uid]) {
        byUnit[uid].rooms.push(r);
        byUnit[uid].pieces += r.placements.length;
      }
    });
    return { socket: sockKey || 'refurbished', profile: sk, full: F, byUnit: byUnit };
  }

  const API = { SOCKETS, installDresses, buildPlans, furnishAll, areaSummary, simPlaces };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  return API;
})();
