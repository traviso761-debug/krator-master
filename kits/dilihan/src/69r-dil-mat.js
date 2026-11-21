// ================================================================= 69r. DILIHAN VASSAL KIT — Kiln-Brick Palette & Kit Items
// [draw] Built on the Iziz Vernacular contract (settlements/iziz/VASSAL-KITS.md) for Dilihan / Dellu-Handu (px 744, py 663;
// -888.6 m ASL, 1.79 atm, Am tropical monsoon on the southern bench of the Cut).
//
// Material kinship: local alluvial lake-apron clays fired in kiln-red, terracotta-orange, oxblood and golden-ochre brick
// (kin to Jimjam across Wall Street), bound to real PBR maps from settlements/jimjam/tex/ with pale cream lime-mortar
// stringcourses, splash-proof dark basalt/laterite monsoon plinths, terracotta barrel/scale tiles, verdigris copper on rich
// and civic roofs, and Iziz's canonical Imperial orange (VPAL.orange 0xe07a2a) on fascias, keystones, banners and awnings.
// Because the bound PBR brick & terracotta sets carry their own rich kiln colour (keep: 1.0), brick/tile/mortar instance
// tints are subtle warm multipliers near white so both ?mat=lib and ?mat=proc render bright, sun-warmed red/orange masonry.

const DL_PAL = {
  /* Subtle warm kiln-lot multipliers over full-colour red/terracotta/ochre brick maps */
  brick:      [0xffffff, 0xffe8d8, 0xf8dfd0, 0xfff0e4],
  brickWarm:  [0xffd6b4, 0xffe0c4, 0xfacaa4, 0xffdec0],
  brickDeep:  [0xf6e2dc, 0xecd4cc, 0xfaf0ec],
  brickOchre: [0xfff4e0, 0xfcead0, 0xfff8ea],
  mortar:     [0xf2ebe0, 0xeae2d3, 0xf5efe4],
  laterite:   [0xd8d0cc, 0xc8c0bc, 0xe2dad6],
  tile:       [0xfff0e6, 0xffe4d4, 0xf8dcd0],
  /* Untextured / grey-map instance tints (converted sRGB -> linear via vC) */
  orange:     VPAL.orange,                                   /* [0xe07a2a, 0xc4641e, 0xf2a24a, 0xd8893c] shared Iziz orange */
  trim:       VPAL.trim,                                     /* [0xe07a2a, 0xd8893c, 0xc4641e, 0xb8552a] */
  linen:      [0xf0e7d5, 0xe8ddc8, 0xf4ecdc, 0xece2ce],      /* unbleached canvas shade-sails & sun-blinds */
  louver:     [0x764e30, 0x684226, 0x845838, 0x5c3a22],      /* oiled tropical teak/ironwood jalousie shutters & rafters */
  bamboo:     [0xb89c58, 0xa88c4c, 0xc4a864, 0x9e8244],      /* seasoned hyperbamboo pergola & screen slats */
  terracotta: [0xc45e36, 0xb6522c, 0xcf6a3e, 0xa84826],      /* unglazed porous zeer evaporative water-cooling jars */
  indigo:     [0x2c4d75, 0x254266, 0x365c88],                /* Cut indigo dye-vats & cloth accents */
  water:      [0x2f959c, 0x38a2a8],                          /* cool turquoise impluvium basin water */
  gilt:       [0xdca438, 0xe6b246, 0xcf9830],                /* Izani sun-orb finials & shrine accents (rich/civic only) */
  shadeVoid:  0x261c18                                       /* cool shadowed room/jali backing (never pure black void) */
};

function dlnHash01(a, b, s) {
  return KRAND.unit(KRAND.hash(a | 0, b | 0, s | 0, 9801));
}

function dlnBrickCanvas(spec) {
  return canvasTex(256, 256, function (g, w, h) {
    const cols = 8;
    const rows = 20;
    const bw = w / cols;
    const ch = h / rows;
    const jt = 2.2;
    g.fillStyle = spec.mortar;
    g.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) {
      const hdr = spec.headerEvery && (r % spec.headerEvery === spec.headerEvery - 1);
      const unit = hdr ? bw * 0.5 : bw;
      const off = hdr ? 0 : (r % 2) * (bw * 0.5);
      const n = Math.round(w / unit) + 1;
      for (let i = -1; i < n; i++) {
        const pal = (hdr && spec.headers) ? spec.headers : spec.faces;
        const hex = pal[Math.floor(dlnHash01(r, i, 3) * pal.length)];
        const k = 0.88 + dlnHash01(r, i, 7) * 0.24;
        const c = new THREE.Color(hex).multiplyScalar(k);
        c.r = Math.min(1, c.r);
        c.g = Math.min(1, c.g);
        c.b = Math.min(1, c.b);
        g.fillStyle = '#' + c.getHexString();
        const x0 = i * unit + off + jt * 0.5;
        const y0 = r * ch + jt * 0.5;
        const rw = unit - jt;
        const rh = ch - jt;
        for (const dx of [0, -w, w]) {
          const xx = x0 + dx;
          if (xx > w || xx + rw < 0) continue;
          g.fillRect(xx, y0, rw, rh);
          g.fillStyle = 'rgba(255,242,226,0.14)';
          g.fillRect(xx, y0, rw, 1.1);
          g.fillStyle = 'rgba(24,8,4,0.20)';
          g.fillRect(xx, y0 + rh - 1.2, rw, 1.2);
          g.fillStyle = '#' + c.getHexString();
        }
      }
    }
  });
}

function dlnMortarCanvas() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#eae2d3';
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 420; k++) {
      const x = dlnHash01(k, 1, 19) * w;
      const y = dlnHash01(k, 2, 23) * h;
      g.fillStyle = dlnHash01(k, 3, 29) < 0.5 ? 'rgba(90,72,54,0.06)' : 'rgba(255,252,244,0.09)';
      g.fillRect(x, y, 4, 3);
    }
    g.fillStyle = 'rgba(110,95,78,0.22)';
    for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 1.5);
  });
}

function dlnTileCanvas() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#7d341c';
    g.fillRect(0, 0, w, h);
    const cols = 8;
    const rows = 8;
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < cols; i++) {
        const base = (i + r) % 2 === 0 ? '#c95f38' : '#b84e30';
        const c = new THREE.Color(base).multiplyScalar(0.9 + dlnHash01(r, i, 41) * 0.2);
        g.fillStyle = '#' + c.getHexString();
        g.fillRect(i * cw + 1, r * rh + 1, cw - 2, rh - 2.5);
        g.fillStyle = 'rgba(255,235,210,0.18)';
        g.fillRect(i * cw + 2, r * rh + 1, cw * 0.45, rh - 3);
      }
    }
  });
}

TEX.dlBrick = dlnBrickCanvas({
  faces: [0xb84e30, 0xc95f38, 0xa64228, 0xc25632, 0xad462b],
  mortar: '#e6dccb',
  headerEvery: 6,
  headers: [0x8f3622, 0x9c3c26, 0xd46c3a]
});
TEX.dlBrickDeep = dlnBrickCanvas({
  faces: [0x8f3622, 0x7e2c1c, 0x9c3d28, 0x863020],
  mortar: '#ccbda8'
});
TEX.dlBrickBand = dlnBrickCanvas({
  faces: [0xb84e30, 0xc95f38, 0xa64228, 0xc05430],
  mortar: '#eae2d3',
  headerEvery: 4,
  headers: [0xd99e40, 0xe2ab4e, 0xcf9238]
});
TEX.dlBrickOchre = dlnBrickCanvas({
  faces: [0xd6963e, 0xdf9f48, 0xc98936, 0xe4a852],
  mortar: '#f0e6d2',
  headerEvery: 6,
  headers: [0xb84e30, 0xc45a36]
});
TEX.dlLaterite = dlnBrickCanvas({
  faces: [0x3d3835, 0x48403c, 0x35302d, 0x52453f],
  mortar: '#8c8074'
});
TEX.dlMortar = dlnMortarCanvas();
TEX.dlTile = dlnTileCanvas();

MAT.dlBrick      = new THREE.MeshStandardMaterial({ map: TEX.dlBrick,      color: 0xffffff, roughness: 0.90, metalness: 0, side: DS });
MAT.dlBrickDeep  = new THREE.MeshStandardMaterial({ map: TEX.dlBrickDeep,  color: 0xffffff, roughness: 0.92, metalness: 0, side: DS });
MAT.dlBrickBand  = new THREE.MeshStandardMaterial({ map: TEX.dlBrickBand,  color: 0xffffff, roughness: 0.90, metalness: 0, side: DS });
MAT.dlBrickOchre = new THREE.MeshStandardMaterial({ map: TEX.dlBrickOchre, color: 0xffffff, roughness: 0.90, metalness: 0, side: DS });
MAT.dlLaterite   = new THREE.MeshStandardMaterial({ map: TEX.dlLaterite,   color: 0xffffff, roughness: 0.92, metalness: 0, side: DS });
MAT.dlMortar     = new THREE.MeshStandardMaterial({ map: TEX.dlMortar,     color: 0xffffff, roughness: 0.84, metalness: 0, side: DS });
MAT.dlTile       = new THREE.MeshStandardMaterial({ map: TEX.dlTile,       color: 0xffffff, roughness: 0.82, metalness: 0, side: DS });
MAT.dlWater      = new THREE.MeshStandardMaterial({ color: vC(0x2d8e96),   roughness: 0.14, metalness: 0.22 });
MAT.dlGilt       = new THREE.MeshStandardMaterial({ color: 0xffffff,       roughness: 0.32, metalness: 0.82 });

vWorldUV(MAT.dlBrick, 0.5);
vWorldUV(MAT.dlBrickDeep, 0.5);
vWorldUV(MAT.dlBrickBand, 0.5);
vWorldUV(MAT.dlBrickOchre, 0.5);
vWorldUV(MAT.dlLaterite, 0.5);
vWorldUV(MAT.dlMortar, 0.5);
vWorldUV(MAT.dlTile, 0.5);

/* Geometries for brick arches, smooth round drums, and two-tier monitor skirts */
const DL_DRUM = new THREE.CylinderGeometry(1, 1, 1, 20).translate(0, 0.5, 0);
const DL_SKIRT = vnSkirtGeo(0.46, 0.50);
const DL_HALF_ARCH = (function () {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0.5, 0.5);
  s.lineTo(-0.5, 0.5);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.38, 0);
  hole.absarc(0, 0, 0.38, Math.PI, 0, true);
  hole.lineTo(-0.38, 0);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 14 });
  g.translate(0, 0, -0.5);
  return g;
})();

kdef('dlBrickB',      VBOX,         MAT.dlBrick);
kdef('dlBrickDeepB',  VBOX,         MAT.dlBrickDeep);
kdef('dlBrickBandB',  VBOX,         MAT.dlBrickBand);
kdef('dlBrickOchreB', VBOX,         MAT.dlBrickOchre);
kdef('dlLateriteB',   VBOX,         MAT.dlLaterite);
kdef('dlMortarB',     VBOX,         MAT.dlMortar);
kdef('dlTileB',       VBOX,         MAT.dlTile);
kdef('dlWaterB',      VBOX,         MAT.dlWater);
kdef('dlGiltB',       VBOX,         MAT.dlGilt);

kdef('dlBrickPost',   VPOST,        MAT.dlBrick);
kdef('dlMortarPost',  VPOST,        MAT.dlMortar);
kdef('dlBrickDrum',   DL_DRUM,      MAT.dlBrick);
kdef('dlMortarDrum',  DL_DRUM,      MAT.dlMortar);
kdef('dlArchSpandrel',DL_HALF_ARCH, MAT.dlBrick);
kdef('dlArchMortar',  DL_HALF_ARCH, MAT.dlMortar);

kdef('dlGableBrick',  VGABLE,       MAT.dlBrick);
kdef('dlGableBand',   VGABLE,       MAT.dlBrickBand);
kdef('dlGableTile',   VGABLE,       MAT.dlTile);
kdef('dlHipTile',     VHIP,         MAT.dlTile);
kdef('dlPyrTile',     VPYR,         MAT.dlTile);
kdef('dlSkirtTile',   DL_SKIRT,     MAT.dlTile);
kdef('dlSkirtCu',     DL_SKIRT,     MAT.verdigris);
kdef('dlDomeTile',    VDOME,        MAT.dlTile);
kdef('dlDomeMortar',  VDOME,        MAT.dlMortar);
kdef('dlGiltBall',    VBALL,        MAT.dlGilt);
