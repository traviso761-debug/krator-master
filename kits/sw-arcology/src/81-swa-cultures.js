// ================================================================= SW Arcology Vassal Culture Packs (PLAN.md §3, LORE.md §6.12)
// Loaded inside the KratorPostApoc closure (both in kits/sw-arcology/build.py and via swa_bundle.py for Drum & Torus) so no
// shared file in core/sockets or kits/post-apoc is touched:
//   - 'vinvolk'     : Drum (Drïm) — weathered drum-bronze, Vothic ash-stone, muted porphyry crimson & iron soot; fin-drum totem
//   - 'rinkvolk'    : Torus (Tors) — sunlit Ancient ceramic white, harvest amber-cider gold, terrace moss & ruby-vine burgundy; ring-vine sign
//   - 'voth-vassal' : Vothic Military / Chichani Levy — imperial porphyry purple, ash-black basalt, bronze & gold ash-diamond

SYMBOLS.vinvolk = (g, cx, cy, R, c1, c2) => {
  // Drum cylinder crowned by radial Ancient structural fins
  const w = R * 1.05, h = R * 1.15, x0 = cx - w / 2, y0 = cy - h * 0.42;
  g.fillStyle = c1;
  g.fillRect(x0, y0, w, h);
  for (let i = -2; i <= 2; i++) {
    g.fillRect(cx + i * (w * 0.22) - R * 0.04, y0 - R * 0.28, R * 0.08, h + R * 0.36);
  }
  g.fillStyle = c2;
  g.beginPath();
  g.arc(cx, y0 + h * 0.52, R * 0.28, 0, SYM_TAU);
  g.fill();
};

SYMBOLS.rinkvolk = (g, cx, cy, R, c1, c2) => {
  // Elevated Forest Ring torus with hanging fruitvine clusters below both rims
  g.strokeStyle = c1;
  g.lineWidth = R * 0.24;
  g.beginPath();
  g.arc(cx, cy - R * 0.16, R * 0.68, 0, SYM_TAU);
  g.stroke();
  g.fillStyle = c2;
  for (const sx of [-0.66, -0.36, 0.36, 0.66]) {
    g.fillRect(cx + sx * R - R * 0.05, cy + R * 0.15, R * 0.1, R * 0.62);
    g.beginPath();
    g.arc(cx + sx * R, cy + R * 0.78, R * 0.11, 0, SYM_TAU);
    g.fill();
  }
};

SYMBOLS.voth_diamond = (g, cx, cy, R, c1, c2) => {
  // Voth's diamond on its point with inner sun-eye
  g.fillStyle = c1;
  g.beginPath();
  g.moveTo(cx, cy - R * 0.92);
  g.lineTo(cx + R * 0.78, cy);
  g.lineTo(cx, cy + R * 0.92);
  g.lineTo(cx - R * 0.78, cy);
  g.closePath();
  g.fill();
  g.fillStyle = c2;
  g.beginPath();
  g.moveTo(cx, cy - R * 0.42);
  g.lineTo(cx + R * 0.36, cy);
  g.lineTo(cx, cy + R * 0.42);
  g.lineTo(cx - R * 0.36, cy);
  g.closePath();
  g.fill();
};

mkCulture({
  key: 'vinvolk', name: 'Drum (Vinvolk)',
  field: '#6e2832', edge: '#d0a53c', band: '#34322e', disc: '#dfd8c8', ink: '#34322e', ink2: '#6e2832',
  sym: 'vinvolk', pole: 0x5a4836,
  awn: { mode: 'stripes', cols: ['#6e2832', '#cfc4ae', '#8a5a36', '#cfc4ae', '#48443e', '#cfc4ae'], n: 6 },
  paint: [0x8c8579, 0x6e2832, 0x8a5c38, 0x4c5e62, 0xb8b2a4, 0x5c4636],
  signBg: '#34322e', signFg: '#dfd8c8', signFrame: 0xa8823e
});

mkCulture({
  key: 'rinkvolk', name: 'Torus (Rinkvolk)',
  field: '#567448', edge: '#e4b248', band: '#7a2638', disc: '#eeebe2', ink: '#3e5234', ink2: '#7a2638',
  sym: 'rinkvolk', pole: 0x6a543a,
  awn: { mode: 'stripes', cols: ['#eeebe2', '#567448', '#e4b248', '#eeebe2', '#7a2638', '#eeebe2'], n: 6 },
  paint: [0xdad6ca, 0x5c7a4e, 0xd49e3a, 0x7a2a3a, 0x6a8682, 0x9c7448],
  signBg: '#3e4e36', signFg: '#f2ece0', signFrame: 0xc49438
});

mkCulture({
  key: 'voth-vassal', name: 'Voth Vassal Garrison',
  field: '#5e1e2d', edge: '#d0a53c', band: '#2b2a28', disc: '#d0a53c', ink: '#2b2a28', ink2: '#5e1e2d',
  sym: 'voth_diamond', pole: 0x383430,
  awn: { mode: 'stripes', cols: ['#5e1e2d', '#c8bba4', '#5e1e2d', '#d0a53c', '#2b2a28', '#c8bba4'], n: 6 },
  paint: [0x8c8579, 0x5e1e2d, 0x34322e, 0xa8823e, 0xc9c6bb, 0x6a2434],
  signBg: '#5e1e2d', signFg: '#e8c468', signFrame: 0xa8823e
});

// Alias 'shop-parts' -> 'shop-tinker' when post-apoc shop defs are bundled so Stage 1 PA_DEFS resolve 1:1
if (typeof DEFS !== 'undefined' && DEFS['shop-tinker'] && !DEFS['shop-parts']) {
  DEFS['shop-parts'] = DEFS['shop-tinker'];
}
