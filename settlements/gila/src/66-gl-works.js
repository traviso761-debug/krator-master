// prefix: gl
// ================================================================= GILA — the four pieces the Lizardmen kit lacks (PLAN.md section 6)
// Built on the Lizardmen kit's toolkit (40-lz-kit.js) and materials (26k-kit.js), seeds 7801-7804:
//   gl-well       a brick well after Mohenjo-daro's: wedge-brick shaft, squared leiwen lip (one flaw), bone sweep-pole, lacquer bucket
//   gl-tank       the great tank: a brick basin (12 x 7 m, 2.4 m deep from rim to floor) with stairs at both ends and a 7-pier colonnade
//   gl-pans       evaporating salt pans: a squared spiral of clay bunds, brine let in at the outer sluice, white salt raked at the centre
//   gl-saltstore  the salt store: a reed hall on a 9-block channelled brick podium with curing salt cones in front
// The water in every well, the great tank and every salt-pan field is drawn on core/water (WATER.still, 90g-gl-world.js), never here. [draw]

function glBucket(x, y, z) {
  W(x, y, z, 0, () => {
    lathe('lacqR', 0, 0, [[0.06, 0], [0.22, 0.03], [0.25, 0.34], [0.23, 0.42]], 12, P('oxblood'), {});
    lathe('lacq', 0, 0, [[0.20, 0.04], [0.22, 0.38]], 12, P('lacq'), { inward: true });
    ring('bronzeC', 0, 0.39, 0, 0.24, 0.018, P('bronze'), 0, 0, 0, 14);
    beam('rope', [-0.22, 0.39, 0], [0, 0.68, 0], 0.014, P('reedD'), true, 5);
    beam('rope', [0.22, 0.39, 0], [0, 0.68, 0], 0.014, P('reedD'), true, 5);
  });
}

defBuilding({
  key: 'gl-well', name: 'Brick well', seed: 7801, caste: 'all', cut: false, w: 6.5, d: 6.5, h: 5.4, budget: 45000,
  tags: { types: ['infrastructure'], wealth: 'middle', role: 'well' },
  note: 'after Mohenjo-daro\'s wells: a round shaft of wedge bricks inside a raised squared brick lip carrying a bronze leiwen band (one flaw), a bone shaduf sweep-pole with a basalt counterweight and a lacquered bucket; fresh lens water on core/water',
  build(o) {
    lzDust(0, 0, 3.0);
    box('stoneP', 0, 0, 0, 5.2, 0.16, 5.2, P('basaltD'), 0.06);
    /* the squared brick lip, leaning slightly askew, and the round wedge-brick shaft inside it */
    const lw = 2.5, lh = 0.86;
    lzBatterRoom(lw, lw, 0.16, lh, 'brick', P('brick'), { lean: { front: 0.06, back: -0.04, left: 0.08, right: -0.03 } });
    for (const [ry, zz] of [[0, lw / 2 + 0.02], [PI, lw / 2 + 0.04]]) {
      W(0, 0.28, 0, ry, () => W(0, 0, zz, 0, () => lzLeiwen(1.9, 0.52, { cell: 0.26, mk: 'bronze', back: false, t: 0.025, proud: 0.02 })));
    }
    /* round wedge-brick coping rising proud of the squared lip, and inner brick lining down to the dark floor under the water */
    lathe('brick', 0, 0, [[0.92, 0.18], [1.14, 0.18], [1.16, 1.16], [0.92, 1.16]], 18, P('brick'), {});
    lathe('brick', 0, 0, [[0.92, 0.18], [0.92, 1.16]], 18, P('brick'), { inward: true });
    cyl('basalt', 0, 0.16, 0, 0.91, 0.08, P('basaltD'), 16);
    /* the bone sweep-pole (shaduf): two leaning bone uprights lashed at the fork, a long bone arm, basalt stone at the tail */
    for (const s of [-1, 1]) {
      beam('bones', [s * 0.55 - 1.35, 0.16, -0.9], [s * 0.12 - 1.35, 2.85, -0.6], 0.09, P('boneO'), true, 7);
    }
    ring('rope', -1.35, 2.75, -0.62, 0.19, 0.03, P('reedD'), 0, 0, PI / 2, 12);
    beam('bones', [-1.35, 2.05, -2.55], [0, 4.45, 0.05], 0.075, P('bone'), true, 7, 0.04);
    /* basalt counterweight lashed to the tail of the sweep */
    box('basalt', -1.35, 1.55, -2.48, 0.52, 0.46, 0.44, P('basaltD'), 0.2);
    beam('rope', [-1.35, 2.02, -2.48], [-1.35, 2.08, -2.48], 0.03, P('reedD'), true, 5);
    ring('rope', -1.35, 1.82, -2.48, 0.28, 0.025, P('reedD'), 0, PI / 2, 0, 12);
    /* rope down to the lacquered bucket poised over the shaft */
    beam('rope', [0, 4.42, 0.05], [0, 1.88, 0.05], 0.016, P('reedD'), true, 5);
    glBucket(0, 1.22, 0.05);
    FURNISH('generic_storage_jar', 1.75, 0.16, 1.45, 0.4, { setting: 'outdoor' });
    FURNISH('lizardmen_common_jug', 1.35, 0.16, 1.85, -0.6, { setting: 'outdoor' });
    door(0, 0.16, 2.5, 0, 1.6);
  }
});

defBuilding({
  key: 'gl-tank', name: 'The great tank', seed: 7802, caste: 'all', cut: false, w: 22, d: 17, h: 6.2, budget: 95000,
  tags: { types: ['civic', 'infrastructure'], wealth: 'rich', role: 'bath' },
  note: 'after the Great Bath of Mohenjo-daro: a baked-brick basin 12 x 7 m and 2.4 m deep from its paved terrace rim to its bitumened brick floor, brick flights of nine treads descending into the water at both ends, and a leaning seven-pier brick colonnade on the lake side; its water is a core/water still record',
  build(o) {
    const TW = 20.4, TD = 15.4, BW = 12.0, BD = 7.0, rimY = 2.48, flY = 0.08;
    /* paved brick floor of the basin (never pierced by the ground mesh) and the four wide embankment banks forming the 2.4 m pit */
    box('brick', 0, 0, 0, BW + 1.2, flY, BD + 1.2, P('basaltD'));
    const sideW = (TW - BW) / 2, fbD = (TD - BD) / 2;
    /* north and south terrace banks */
    for (const s of [-1, 1]) {
      box('brick', 0, 0, s * (BD / 2 + fbD / 2), TW, rimY, fbD, P('brick'));
    }
    /* west and east terrace banks */
    for (const s of [-1, 1]) {
      box('brick', s * (BW / 2 + sideW / 2), 0, 0, sideW, rimY, BD, P('brick'));
    }
    /* inner lining of baked brick with bitumen coping and bronze leiwen bands above the waterline */
    for (const s of [-1, 1]) {
      box('stoneP', 0, rimY - 0.16, s * (BD / 2 + 0.28), BW + 0.9, 0.2, 0.56, P('basaltD'));
      box('stoneP', s * (BW / 2 + 0.28), rimY - 0.16, 0, 0.56, 0.2, BD + 0.9, P('basaltD'));
      W(0, rimY - 0.68, s * (BD / 2 - 0.03), s > 0 ? PI : 0, () => lzLeiwen(7.2, 0.44, { cell: 0.28, mk: 'bronze', back: false, t: 0.025, proud: 0.02 }));
    }
    /* brick stairs at both ends (-x and +x) descending from the terrace rim into the water */
    for (const s of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const h = rimY * (9 - i) / 9, xx = s * (BW / 2 - 0.22 - i * 0.34);
        box('brick', xx, flY, 0, 0.38, h - flY, 3.2, P('brick'));
      }
    }
    /* approach stair on the +z front up onto the brick walk */
    for (let i = 0; i < 9; i++) {
      const h = rimY * (i + 1) / 9;
      box('stoneP', 0, 0, TD / 2 + 0.72 - i * 0.08, 4.6, h * 0.2, 0.34, P('basaltD'));
    }
    W(0, 0, TD / 2 + 0.08, 0, () => {
      for (let i = 0; i < 9; i++) {
        const y = rimY * (i + 1) / 9;
        box('brick', 0, 0, 0.65 - i * 0.18, 4.2, y, 0.32, P('brick'));
      }
    });
    /* the seven-pier leaning brick colonnade along the +x (lake) side of the terrace, carrying bone beams and shade mats */
    const px = BW / 2 + sideW * 0.56, colH = 3.1;
    const zs = lzSpan(-BD / 2 - 2.1, BD / 2 + 2.1, 7);
    for (let i = 0; i < zs.length; i++) {
      const zz = zs[i], lean = (i % 2 ? 0.07 : -0.05);
      W(px, rimY, zz, 0, () => {
        lzWall([-0.34, 0.34], [0.34, 0.34], [-0.30 + lean * colH, 0.30], [0.30 + lean * colH, 0.30], 0, colH, 'brick', P('brick'), [], { inner: false });
        lzWall([0.34, -0.34], [-0.34, -0.34], [0.30 + lean * colH, -0.30], [-0.30 + lean * colH, -0.30], 0, colH, 'brick', P('brick'), [], { inner: false });
        lzWall([0.34, 0.34], [0.34, -0.34], [0.30 + lean * colH, 0.30], [0.30 + lean * colH, -0.30], 0, colH, 'brick', P('brick'), [], { inner: false });
        lzWall([-0.34, -0.34], [-0.34, 0.34], [-0.30 + lean * colH, -0.30], [-0.30 + lean * colH, 0.30], 0, colH, 'brick', P('brick'), [], { inner: false });
        box('stoneP', lean * colH, colH - 0.04, 0, 0.76, 0.14, 0.76, P('basaltD'));
      });
    }
    beam('bones', [px, rimY + colH + 0.12, zs[0] - 0.5], [px, rimY + colH + 0.12, zs[zs.length - 1] + 0.5], 0.11, P('boneO'), true, 7);
    beam('bones', [px - 1.5, rimY + colH - 0.08, zs[0] - 0.4], [px - 1.5, rimY + colH - 0.08, zs[zs.length - 1] + 0.4], 0.09, P('boneO'), true, 7);
    for (const zz of zs) {
      beam('bones', [px - 1.7, rimY + colH - 0.1, zz], [px + 0.45, rimY + colH + 0.22, zz], 0.07, P('bone'), true, 6);
    }
    psurf('matW', (u, v) => [px - 1.6 + 2.0 * u, rimY + colH - 0.06 + 0.26 * u, zs[0] - 0.3 + (zs[zs.length - 1] - zs[0] + 0.6) * v], 4, 8, P('reedL'), {});
    /* two bronze spiral eyes on horned posts at the west corners */
    for (const s of [-1, 1]) {
      lzHorn(-BW / 2 - 2.2, rimY, s * (BD / 2 + 1.2), s > 0 ? 0 : PI, 2.5, 0.13, { curl: 0.45, lean: 0.15, mk: 'ivory' });
      lzEye(-BW / 2 - 1.6, rimY + 0.85, s * (BD / 2 + 1.6), PI / 2, 0.32, { mk: 'bronze' });
    }
    FURNISH('lizardmen_court_jug', -BW / 2 - 1.8, rimY, 0, PI / 2, { setting: 'outdoor' });
    FURNISH('generic_storage_jar', -BW / 2 - 1.8, rimY, 1.6, 0.3, { setting: 'outdoor' });
    door(0, 0, TD / 2 + 0.7, 0, 3.6);
  }
});

defBuilding({
  key: 'gl-pans', name: 'Salt evaporating pans', seed: 7803, caste: 'all', cut: false, w: 30, d: 30, h: 2.6, budget: 60000,
  tags: { types: ['industry'], wealth: 'poor', role: 'saltworks', job: 'salt' },
  note: 'a squared spiral of clay-walled evaporating pans on the lake flat: brine enters at the outer sluice on the shore side and concentrates round the turns until dry halite is raked into white cones at the centre; brine drawn on core/water',
  build(o) {
    const S = 27.6, bh = 0.52, bt = 0.46;
    /* level clay-and-salt floor pad so the shallow brine sits cleanly above any ground slope */
    box('earthR', 0, 0, 0, S + 0.8, 0.16, S + 0.8, P('earthP'));
    /* outer perimeter clay bund with an inlet sluice gap on +z */
    box('earth', -S * 0.26, 0.16, S / 2, S * 0.48 - 0.7, bh, bt, P('earth'));
    box('earth', S * 0.26, 0.16, S / 2, S * 0.48 - 0.7, bh, bt, P('earth'));
    box('earth', 0, 0.16, -S / 2, S + bt, bh, bt, P('earth'));
    box('earth', -S / 2, 0.16, 0, bt, bh, S, P('earth'));
    box('earth', S / 2, 0.16, 0, bt, bh, S, P('earth'));
    /* bronze-and-bone inlet sluice gate on +z */
    for (const s of [-1, 1]) {
      cyl('bones', s * 0.85, 0.16, S / 2, 0.08, 1.35, P('boneO'), 6);
    }
    beam('bones', [-0.95, 1.42, S / 2], [0.95, 1.42, S / 2], 0.07, P('boneO'), true, 6);
    box('bronzeC', 0, 0.2, S / 2, 1.55, 0.56, 0.07, P('verd'));
    /* squared-spiral interior clay bunds winding in to the raking court at the centre */
    let px = -10.4, pz = 10.4, dir = 0, len = 20.8;
    for (let n = 0; n < 9 && len > 3.2; n++) {
      const dx = [1, 0, -1, 0][dir], dz = [0, -1, 0, 1][dir];
      const mx = px + dx * len / 2, mz = pz + dz * len / 2;
      box('earth', mx, 0.16, mz, dx ? len + bt : bt, bh * 0.88, dz ? len + bt : bt, P(n % 2 ? 'earth' : 'earthP'));
      px += dx * len; pz += dz * len; dir = (dir + 1) % 4;
      if (n % 2 === 1) len -= 4.4;
    }
    /* central crystallising floor and five raked white salt cones */
    box('ivory', 0, 0.16, 0, 6.2, 0.26, 6.2, WHITE);
    for (const [cx, cz, cr, ch] of [[0, 0, 1.15, 1.35], [-1.8, -1.5, 0.78, 0.92], [1.9, -1.4, 0.82, 0.96], [-1.7, 1.6, 0.74, 0.86], [1.8, 1.7, 0.8, 0.94]]) {
      cone('ivory', cx, 0.40, cz, cr, ch, WHITE, 12);
    }
    /* bone rakes leaning on a rack by the sluice and salt baskets ready for the Drovers */
    W(5.6, 0.16, S / 2 + 0.5, 0, () => {
      for (const s of [-1, 1]) beam('bones', [s * 1.1, 0, 0], [s * 0.95, 1.65, 0], 0.06, P('boneO'), true, 6);
      beam('bones', [-1.1, 1.55, 0], [1.1, 1.55, 0], 0.05, P('boneO'), true, 6);
      for (let i = 0; i < 5; i++) {
        const rx = -0.8 + i * 0.4;
        beam('wood', [rx, 0, 0.35], [rx + 0.04, 1.85, -0.05], 0.025, P('reedD'), true, 5);
        box('bones', rx, 0.02, 0.38, 0.34, 0.08, 0.05, P('bone'));
      }
    });
    FURNISH('generic_basket', -4.2, 0.16, S / 2 + 0.45, 0.2, { setting: 'outdoor' });
    FURNISH('generic_basket', -3.3, 0.16, S / 2 + 0.55, 1.1, { setting: 'outdoor' });
    FURNISH('generic_sack', -5.2, 0.16, S / 2 + 0.4, -0.4, { setting: 'outdoor' });
    door(0, 0.16, S / 2 + 0.4, 0, 2.0);
  }
});

defBuilding({
  key: 'gl-saltstore', name: 'Salt store', seed: 7804, caste: 3, cut: true, w: 16, d: 13, h: 9.4, budget: 90000,
  tags: { types: ['industry', 'infrastructure'], wealth: 'middle', role: 'store', job: 'salt' },
  note: 'a dry reed hall raised on a nine-block baked-brick podium with air channels beneath (after the kit\'s granary) so lake damp cannot cake the halite, five salt cones draining on reed mats out front, sacks and barrels stacked inside for the Coil Rounds',
  build(o) {
    const L = 11.4, Wd = 7.6, py = 1.65;
    lzCutFloor(py);
    lzNoCut(() => {
      /* nine brick blocks (odd: 3 x 3) with dry air channels between them */
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          box('brick', -3.6 + i * 3.6, 0, -2.3 + j * 2.3, 2.8, py, 1.75, P('brick'));
        }
      }
      box('brick', 0, py - 0.12, 0, L + 0.6, 0.26, Wd + 0.6, P('brick'));
      for (const s of [-1, 1]) {
        lzHorn(s * (L / 2 + 0.35), py + 0.18, Wd / 2 - 0.5, PI, 2.1, 0.1, { curl: 0.45, mk: 'bones' });
      }
      /* notched log stair up the front to the Drovers' door */
      W(2.4, 0, Wd / 2 + 0.28, 0, () => {
        const run = 2.0;
        for (let i = 0; i < 9; i++) {
          const t = (i + 1) / 9;
          box('wood', 0, t * py - 0.11, run * (1 - t) + 0.1, 1.3, 0.11, 0.32, P('reedD'));
        }
        for (const s of [-1, 1]) {
          beam('wood', [s * 0.68, 0, run + 0.25], [s * 0.68, py + 0.04, -0.08], 0.09, P('reedD'), true, 6);
        }
      });
      /* five white salt cones draining on woven reed mats in front of the podium */
      for (let i = 0; i < 5; i++) {
        const sx = -4.6 + i * 1.55, sz = Wd / 2 + 1.45 + (i % 2) * 0.45;
        cyl('matW', sx, 0, sz, 0.68, 0.06, P('reedL'), 10);
        cone('ivory', sx, 0.06, sz, 0.55, 0.78 + (i % 3) * 0.12, WHITE, 10);
      }
    });
    const dh = lzDoorH(3), dw = dh * 0.62;
    lzBatterRoom(L - 0.5, Wd - 0.5, py + 0.14, 2.3, 'reed', P('reed'), {
      lean: { front: 0.07, back: -0.05, left: 0.09, right: -0.04 },
      front: [{ s: (L - 0.5) / 2 + 2.4, w: dw, h: dh, door: true }, lzVent(3, 1.5, 1.35)],
      back: [lzVent(3, 2.4, 1.35), lzVent(3, L - 2.9, 1.35)]
    });
    W(-1.8, py + 0.26, (Wd - 0.5) / 2 - 0.04, 0, () => lzLeiwen(2.6, 0.95, { cell: 0.32, mk: 'lacqR', back: 'lacq' }));
    lzRibRoof(L - 0.5, Wd - 0.5, py + 2.4, py + 6.7, 9, {
      mk: 'thatch', col: P('reedL'), over: 0.65, ribR: 0.13, past: 0.26, bend: 0.95, ext: 0.5,
      endMk: 'reed', endCol: P('reedD'), leanEnds: { left: 0.09, right: -0.04 }, y0: py + 0.14
    });
    lzThreshold(2.4, Wd / 2 - 0.25, 0, dw);
    for (const [x, z, k] of [
      [-4.1, -2.0, 'generic_sack'], [-2.7, -2.1, 'generic_sack'], [-1.2, -2.0, 'generic_barrel'],
      [0.4, -2.1, 'generic_sack'], [2.0, -2.0, 'generic_crate'], [3.6, -1.9, 'generic_barrel'],
      [-3.6, 0.6, 'generic_basket'], [-1.8, 0.8, 'generic_sack'], [-0.2, 0.6, 'generic_floor_basket']
    ]) {
      FURNISH(k, x, py + 0.14, z, rr(0, TAU));
    }
    FURNISH('lizardmen_common_board', 4.2, py + 0.14, 1.2, -PI / 2);
    FURNISH_HANG('lizardmen_common_hanging', 0, py + 5.1, 0, 0);
  }
});
