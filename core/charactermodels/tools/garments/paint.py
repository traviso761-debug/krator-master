"""Layer 3: Unified linear colour palette, fabric grain library, procedural motifs, and strip painter.

Consolidates all palette colors (`C`), fabric texture definitions (`FABRIC`, `FABRIC_OF`, `COTTON`, `WOOL`,
`leathery`), procedural motifs (`motif`), and UV strip painting (`paint_strip`, `P`, `PN`, `B`) into a
single shared module.
"""
import math
from pathlib import Path
import numpy as np
from PIL import Image

TOOLS_DIR = Path(__file__).resolve().parent.parent
ROOT = TOOLS_DIR.parent
LIB = ROOT.parent.parent / 'core' / 'materials' / 'library'

COTTON = 'cloth.cotton.coarse'
WOOL = 'cloth.wool'

C = {
    'maguey': (0.70, 0.64, 0.52), 'cotton': (0.86, 0.82, 0.72), 'earth': (0.42, 0.30, 0.20), 'soot': (0.10, 0.09, 0.09),
    'ochre': (0.66, 0.42, 0.13), 'madder': (0.58, 0.18, 0.12), 'indigo': (0.10, 0.13, 0.28), 'rust': (0.55, 0.28, 0.14),
    'clay': (0.66, 0.38, 0.24), 'umber': (0.30, 0.21, 0.15), 'purple': (0.17, 0.06, 0.22), 'ash': (0.86, 0.84, 0.82),
    'crimson': (0.42, 0.04, 0.07), 'gold': (0.86, 0.64, 0.22), 'jade': (0.16, 0.48, 0.36), 'quetzal': (0.10, 0.42, 0.30),
    'leather': (0.36, 0.22, 0.12), 'hide': (0.58, 0.42, 0.28), 'black': (0.06, 0.05, 0.05), 'teal': (0.12, 0.36, 0.38),
    'oat': (0.70, 0.64, 0.52), 'moss': (0.30, 0.33, 0.21), 'bark': (0.30, 0.23, 0.17), 'sand': (0.78, 0.62, 0.42),
    'saddle': (0.45, 0.27, 0.14), 'slate': (0.27, 0.29, 0.31), 'verdigris': (0.26, 0.52, 0.46), 'cream': (0.88, 0.84, 0.74),
    'copper': (0.62, 0.35, 0.18), 'ancient': (0.86, 0.88, 0.89), 'sunorange': (0.86, 0.47, 0.13), 'deepgreen': (0.08, 0.18, 0.13),
    'buck': (0.72, 0.56, 0.38), 'bone': (0.88, 0.84, 0.72), 'fur': (0.44, 0.33, 0.22), 'darkfur': (0.20, 0.15, 0.11),
    'jungle': (0.20, 0.44, 0.26), 'mint': (0.52, 0.88, 0.62), 'rose': (0.84, 0.54, 0.50), 'lilac': (0.64, 0.56, 0.78),
    'turq': (0.20, 0.62, 0.62), 'mongolblue': (0.16, 0.30, 0.58), 'saffron': (0.93, 0.66, 0.20), 'maroon': (0.42, 0.11, 0.14),
    'peach': (0.90, 0.64, 0.42), 'sky': (0.42, 0.66, 0.84),
    'sealinen': (0.87, 0.85, 0.78), 'nacre': (0.91, 0.90, 0.92), 'nacrepink': (0.93, 0.80, 0.82), 'nacregreen': (0.78, 0.90, 0.86),
    'bronze': (0.64, 0.45, 0.20), 'olive': (0.42, 0.40, 0.24), 'slateblue': (0.32, 0.41, 0.54), 'deepsea': (0.10, 0.20, 0.31),
    'ribpink': (0.86, 0.56, 0.62), 'ribgreen': (0.44, 0.74, 0.68),
    'terracotta': (0.70, 0.36, 0.22), 'holyred': (0.74, 0.10, 0.10), 'godteal': (0.28, 0.88, 0.72), 'white': (0.95, 0.94, 0.91),
    'yuniyellow': (0.96, 0.78, 0.18), 'mud': (0.40, 0.28, 0.18), 'sahel': (0.93, 0.91, 0.84), 'orderblue': (0.20, 0.36, 0.70),
    'tileblue': (0.16, 0.50, 0.72), 'tilegreen': (0.34, 0.62, 0.36), 'coral': (0.92, 0.46, 0.36), 'violet': (0.42, 0.26, 0.56),
    'silver': (0.78, 0.78, 0.80), 'pomegranate': (0.62, 0.12, 0.16), 'kesar': (0.70, 0.19, 0.01), 'peacock': (0.06, 0.42, 0.44),
    'lacrose': (0.72, 0.42, 0.52), 'yakbrown': (0.34, 0.24, 0.16),
    'osaffron': (0.60, 0.12, 0.005), 'omaroon': (0.18, 0.025, 0.03),
    'woad': (0.20, 0.30, 0.48), 'weld': (0.80, 0.70, 0.30), 'heather': (0.42, 0.34, 0.36), 'loden': (0.22, 0.28, 0.18),
    'iron': (0.30, 0.31, 0.33),
    'repred': (0.68, 0.08, 0.08), 'repochre': (0.78, 0.55, 0.18), 'repcream': (0.92, 0.88, 0.78), 'felt': (0.46, 0.45, 0.43),
    'linen': (0.88, 0.85, 0.76), 'velvet': (0.07, 0.06, 0.07), 'brass': (0.78, 0.62, 0.28), 'greyblue': (0.34, 0.38, 0.44),
    'repgrey': (0.38, 0.39, 0.37), 'repgreyd': (0.24, 0.25, 0.24), 'drab': (0.40, 0.38, 0.29), 'drabd': (0.30, 0.28, 0.21),
    'repblack': (0.11, 0.11, 0.12),
    'dunesand': (0.52, 0.48, 0.34), 'duneumber': (0.26, 0.21, 0.18), 'shroudtaupe': (0.44, 0.36, 0.34),
    'shroudoat': (0.58, 0.54, 0.42), 'ashrobe': (0.48, 0.44, 0.38), 'oxblood': (0.16, 0.02, 0.04),
    'sable': (0.12, 0.07, 0.04), 'emerald': (0.04, 0.28, 0.19), 'darkemerald': (0.02, 0.14, 0.10),
    'cobalt': (0.12, 0.26, 0.58), 'magenta': (0.58, 0.14, 0.30), 'magentapink': (0.76, 0.26, 0.46),
    'porcelain': (0.93, 0.92, 0.90), 'porcelainblue': (0.52, 0.72, 0.76), 'amber': (0.96, 0.58, 0.08),
    'neonmagenta': (0.92, 0.14, 0.72), 'cybercyan': (0.22, 0.82, 0.95), 'taupe': (0.58, 0.52, 0.44),
    'charcoal': (0.14, 0.14, 0.15), 'neonyellow': (0.98, 0.92, 0.16), 'rustred': (0.64, 0.18, 0.12),
    'ivory': (0.92, 0.89, 0.80), 'sage': (0.48, 0.56, 0.44), 'scarlet': (0.78, 0.12, 0.12),
    'khaki': (0.68, 0.62, 0.46), 'olivegrey': (0.38, 0.40, 0.34), 'steel': (0.52, 0.55, 0.58),
    'plum': (0.36, 0.14, 0.28), 'wine': (0.38, 0.08, 0.14),
}

FABRIC = {
    'cloth.weave.plain': 0.12, 'cloth.weave.twill': 0.15, 'cloth.plain': 0.25, 'cloth.silk': 0.3, 'cloth.felt': 0.3,
    'cloth.weave.burlap': 0.2, 'cloth.cotton.coarse': 0.2, 'cloth.wool': 0.2, 'cloth.velvet': 0.2, 'cloth.quilted': 0.3,
    'cloth.bazin': 0.3, 'cloth.oiled': 0.3, 'leather.polished': 0.25, 'leather.buckskin': 0.3, 'fur.short': 0.2,
    'fur.astrakhan': 0.15, 'straw.plaited': 0.2, 'beads.glass': 0.12, 'shell.nacre': 0.3, 'metal.gold': 0.3,
    'metal.bronze': 0.3, 'metal.iron': 0.3, 'metal.brass.braid': 0.2
}
FABRIC_OF = {
    'maguey': 'cloth.weave.burlap', 'cotton': 'cloth.cotton.coarse', 'sahel': 'cloth.cotton.coarse',
    'white': 'cloth.cotton.coarse', 'linen': 'cloth.plain', 'sealinen': 'cloth.plain', 'cream': 'cloth.plain',
    'leather': 'leather.polished', 'saddle': 'leather.polished', 'hide': 'leather.buckskin', 'buck': 'leather.buckskin',
    'fur': 'fur.short', 'darkfur': 'fur.short', 'felt': 'cloth.felt', 'velvet': 'cloth.velvet',
    'purple': 'cloth.silk', 'crimson': 'cloth.silk', 'mongolblue': 'cloth.silk', 'saffron': 'cloth.silk', 'maroon': 'cloth.silk',
    'yuniyellow': 'cloth.bazin', 'drab': 'cloth.quilted', 'repgrey': 'cloth.wool', 'repgreyd': 'cloth.wool',
    'repblack': 'cloth.wool', 'repred': 'cloth.wool', 'repochre': 'cloth.wool', 'repcream': 'cloth.plain',
    'nacre': 'shell.nacre', 'gold': 'metal.gold', 'bronze': 'metal.bronze', 'copper': 'metal.bronze', 'brass': 'metal.bronze',
    'iron': 'metal.iron', 'silver': 'metal.iron', 'yakbrown': 'cloth.wool', 'earth': 'cloth.wool', 'umber': 'cloth.wool',
    'pomegranate': 'cloth.silk', 'kesar': 'cloth.silk', 'peacock': 'cloth.silk', 'lacrose': 'cloth.silk',
    'osaffron': 'cloth.cotton.coarse', 'omaroon': 'cloth.wool',
    'dunesand': 'cloth.cotton.coarse', 'duneumber': 'cloth.wool', 'shroudtaupe': 'cloth.cotton.coarse',
    'shroudoat': 'cloth.weave.burlap', 'ashrobe': 'cloth.weave.burlap'
}
GRAIN = {}
rng = np.random.default_rng(7)
FRET = [
    "XXXXXXXXXXXX",
    "X..........X",
    "X.XXXXXXXX.X",
    "X.X......X.X",
    "X.X.XXXX.X.X",
    "X.X.X..X.X.X",
    "X.X.X..XXX.X",
    "X.X.X......X",
    "X.X.XXXXXXXX",
    "X.X.........",
    "X.XXXXXXXXXX",
    "X..........."
]
FRETA = np.array([[c == 'X' for c in r] for r in FRET])


REPO_ROOT = ROOT.parent.parent
LFS_DIRS = [
    REPO_ROOT / '.git' / 'lfs' / 'objects',
    REPO_ROOT.parent / 'krator-master' / '.git' / 'lfs' / 'objects',
]


def _resolve_lfs(path: Path) -> Path:
    """Resolve a Git LFS pointer file in a worktree to its cached binary object."""
    try:
        if path.exists() and path.stat().st_size < 500:
            txt = path.read_text(encoding='utf-8', errors='ignore')
            for line in txt.splitlines():
                if line.startswith('oid sha256:'):
                    oid = line.split('oid sha256:')[1].strip()
                    for ldir in LFS_DIRS:
                        cand = ldir / oid[:2] / oid[2:4] / oid
                        if cand.exists():
                            return cand
    except Exception:
        pass
    return path


CULTURAL_TEX_PATHS = {
    'tex.voth_kilim':       REPO_ROOT / 'settlements/voth/tex/tap_kilim.albedo.webp',
    'tex.voth_solar':       REPO_ROOT / 'settlements/voth/tex/tap_solar.albedo.webp',
    'tex.voth_tzintzun':    REPO_ROOT / 'settlements/voth/tex/tap_tzintzun.albedo.webp',
    'tex.voth_ordinator':   REPO_ROOT / 'settlements/voth/tex/tap_ordinator.albedo.webp',
    'tex.voth_masks':       REPO_ROOT / 'settlements/voth/tex/tap_masks.albedo.webp',
    'tex.voth_temple':      REPO_ROOT / 'settlements/voth/tex/tap_temple.albedo.webp',
    'tex.voth_carpet':      REPO_ROOT / 'settlements/voth/tex/carpet_palace.albedo.webp',
    'tex.voth_damask':      REPO_ROOT / 'settlements/voth/tex/damask_purple.albedo.webp',
    'tex.voth_filigree':    REPO_ROOT / 'settlements/voth/tex/filigree_crimson.albedo.webp',
    'tex.voth_mudcloth':    REPO_ROOT / 'settlements/voth/tex/mudcloth.albedo.webp',
    'tex.voth_frieze':      REPO_ROOT / 'settlements/voth/tex/frieze_red.albedo.webp',
    'tex.voth_medallion':   REPO_ROOT / 'settlements/voth/tex/medallion_sun.albedo.webp',
    'tex.xanadu_band':      REPO_ROOT / 'settlements/xanadu/tex/xBandC.albedo.webp',
    'tex.xanadu_valance':   REPO_ROOT / 'settlements/xanadu/tex/xValance.albedo.webp',
    'tex.xanadu_penbey':    REPO_ROOT / 'settlements/xanadu/tex/xPenbey.albedo.webp',
    'tex.xanadu_sun':       REPO_ROOT / 'settlements/xanadu/tex/xSun.albedo.webp',
    'tex.xanadu_mosaic':    REPO_ROOT / 'settlements/xanadu/tex/xMosC.albedo.webp',
    'tex.xanadu_twig':      LIB / 'band.xanadu.twig/albedo.jpg',
    'tex.iziz_brocade':     REPO_ROOT / 'settlements/iziz/tex/courtBrocade.albedo.webp',
    'tex.iziz_carpet_a':    REPO_ROOT / 'settlements/iziz/tex/courtCarpetA.albedo.webp',
    'tex.iziz_carpet_b':    REPO_ROOT / 'settlements/iziz/tex/courtCarpetB.albedo.webp',
    'tex.iziz_velvet':      REPO_ROOT / 'settlements/iziz/tex/courtVelvet.albedo.webp',
    'tex.iziz_sunbanner':   REPO_ROOT / 'settlements/iziz/palace/tex/palSunBanner.albedo.webp',
    'tex.highlands_caihua': REPO_ROOT / 'settlements/highlands/tex/hCaihua.albedo.webp',
    'tex.highlands_frieze': REPO_ROOT / 'settlements/highlands/tex/hFrzA.albedo.webp',
    'tex.highlands_harl':   REPO_ROOT / 'settlements/highlands/tex/hHarlR.albedo.webp',
    'tex.highlands_crane':  REPO_ROOT / 'settlements/highlands/tex/hM_d_crane.albedo.webp',
    'tex.highlands_folk':   REPO_ROOT / 'settlements/highlands/tex/hM_w_folkA.albedo.webp',
    'tex.longsong_thangka': REPO_ROOT / 'settlements/longsong/tex/thangka.albedo.webp',
    'tex.longsong_valance': REPO_ROOT / 'settlements/longsong/tex/valance.albedo.webp',
    'tex.longsong_glyph':   REPO_ROOT / 'settlements/longsong/tex/glyphband.albedo.webp',
    'tex.longsong_mandala': REPO_ROOT / 'settlements/longsong/tex/mandala.albedo.webp',
    'tex.longsong_rug':     REPO_ROOT / 'settlements/longsong/tex/rug.albedo.webp',
    'tex.dalab_banner':     REPO_ROOT / 'settlements/dalab/tex/dBanner.albedo.webp',
    'tex.dalab_deco':       REPO_ROOT / 'settlements/dalab/tex/dDecoPanel.albedo.webp',
    'tex.dalab_mosaic':     REPO_ROOT / 'settlements/dalab/tex/dMosaic.albedo.webp',
    'tex.ys_band':          REPO_ROOT / 'settlements/ys/tex/hkBand.albedo.webp',
    'tex.ys_cloth':         REPO_ROOT / 'settlements/ys/tex/hkCloth.albedo.webp',
    'tex.ys_nacre':         REPO_ROOT / 'settlements/ys/tex/hkNacreC.albedo.webp',
    'tex.reedlake_band':    REPO_ROOT / 'settlements/reedlake/tex/rlBand.albedo.webp',
    'tex.reedlake_cloth':   REPO_ROOT / 'settlements/reedlake/tex/rlClothT.albedo.webp',
    'tex.reedlake_fringe':  REPO_ROOT / 'settlements/reedlake/tex/rlFringe.albedo.webp',
    'tex.yuni_rug':         REPO_ROOT / 'settlements/yuni/tex/rug.albedo.webp',
    'tex.yuni_mosaic':      REPO_ROOT / 'settlements/yuni/tex/mosaic.albedo.webp',
    'tex.yuni_paint':       REPO_ROOT / 'settlements/yuni/tex/paintcol.albedo.webp',
    'tex.girder_tapestry':  REPO_ROOT / 'settlements/girder/tex/tapestry.albedo.webp',
    'tex.girder_blanket':   REPO_ROOT / 'settlements/girder/tex/fly_r_blanket.albedo.webp',
    'tex.locus_pattern':    REPO_ROOT / 'settlements/locus/tex/pattern.albedo.webp',
    'tex.bogolan':          LIB / 'pattern.bogolan/albedo.jpg',
    'tex.jacquard':         LIB / 'cloth.quatrefoil_jacquard_fabric/albedo.jpg',
    'tex.damask_maze':      LIB / 'cloth.damask.maze/albedo.jpg',
    'tex.embroidery_cross': LIB / 'embroidery.cross/albedo.jpg',
    'tex.embroidery_saxon': LIB / 'embroidery.saxon/albedo.jpg',
}
CULTURAL_TEX_CACHE = {}

# Cultural procedural motifs automatically accented with authentic settlement/library texture-pack patterns
CULTURAL_MOTIF_PACK_MAP = {
    'peony_brocade':       ('tex.highlands_folk',   0.65, 0.25),
    'dalab_solar_weave':   ('tex.dalab_deco',       0.52, 0.30),
    'ordinator_cuirass':   ('tex.voth_ordinator',   0.52, 0.28),
    'voth_glyphs':         ('tex.voth_solar',       0.50, 0.30),
    'xanadu_sun_wheel':    ('tex.xanadu_band',      0.48, 0.30),
    'tocharian_wheel':     ('tex.longsong_glyph',   0.45, 0.35),
    'gold_chain_frieze':   ('tex.voth_damask',      0.58, 0.30),
    'patchwork_harlequin': ('tex.highlands_caihua', 0.50, 0.28),
    'bogolan':             ('tex.bogolan',          0.62, 0.35),
    'islamic_star':        ('tex.iziz_carpet_a',    0.52, 0.32),
    'paisley_vine':        ('tex.iziz_brocade',     0.58, 0.30),
    'nomad_diamond':       ('tex.reedlake_band',    0.55, 0.32),
    'diamonds':            ('tex.voth_kilim',       0.46, 0.35),
    'chevron':             ('tex.reedlake_band',    0.42, 0.35),
    'chevrons':            ('tex.reedlake_band',    0.42, 0.35),
    'zigzag':              ('tex.reedlake_band',    0.42, 0.35),
    'fret':                ('tex.voth_solar',       0.46, 0.38),
    'steps':               ('tex.voth_kilim',       0.48, 0.35),
    'rose':                ('tex.embroidery_saxon', 0.52, 0.32),
    'knot':                ('tex.girder_tapestry',  0.45, 0.35),
    'wave':                ('tex.ys_band',          0.42, 0.35),
}


def sample_cultural_tex(key, w, h, fg, bg, pal_blend=0.30):
    """Sample a linear-RGB cultural fabric/pattern texture from the repo texture pack and harmonize with (fg, bg)."""
    if key not in CULTURAL_TEX_CACHE:
        arr = None
        p = CULTURAL_TEX_PATHS.get(key)
        if p is not None:
            rp = _resolve_lfs(p)
            if rp.exists() and rp.stat().st_size > 500:
                try:
                    im = Image.open(rp).convert('RGB')
                    px = np.asarray(im, dtype=np.float32) / 255.0
                    arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
                except Exception:
                    arr = None
        CULTURAL_TEX_CACHE[key] = arr
    src = CULTURAL_TEX_CACHE[key]
    if src is None or w < 1 or h < 1:
        out = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
        out[:] = fg
        return out
    sh, sw, _ = src.shape
    yy = (np.linspace(0.0, 1.0, h, endpoint=False) * sh).astype(int) % sh
    xx = (np.linspace(0.0, 1.0, w, endpoint=False) * sw).astype(int) % sw
    samp = src[np.ix_(yy, xx)].astype(np.float64)
    lum = 0.299 * samp[..., 0] + 0.587 * samp[..., 1] + 0.114 * samp[..., 2]
    p10, p90 = float(np.percentile(lum, 10)), float(np.percentile(lum, 90))
    t_lum = np.clip((lum - p10) / max(p90 - p10, 0.06), 0.0, 1.0)[..., None]
    fg_a = np.asarray(fg, dtype=np.float64).reshape(1, 1, 3)
    bg_a = np.asarray(bg, dtype=np.float64).reshape(1, 1, 3)
    pal_img = bg_a * (1.0 - t_lum) + fg_a * t_lum
    return np.clip((1.0 - pal_blend) * samp + pal_blend * pal_img, 0.0, 1.0)


def grain(fid):
    if fid not in GRAIN:
        path = _resolve_lfs(LIB / fid / 'albedo.jpg')
        g = None
        if path.exists() and path.stat().st_size > 1000:
            im = Image.open(path).convert('RGB')
            px = np.asarray(im, dtype=np.float32) / 255.0
            px = np.power(px, 2.2)
            lum = px @ np.array([0.299, 0.587, 0.114], np.float32)
            g = (lum / max(float(lum.mean()), 1e-3)).clip(0.4, 1.6)
        GRAIN[fid] = g
    return GRAIN[fid]


def P(base, weave=0.07, bands=(), panels=(), fabric=None):
    f = fabric or (FABRIC_OF.get(base, 'cloth.weave.plain') if isinstance(base, str) else 'cloth.weave.plain')
    return {
        'base': C[base] if isinstance(base, str) else base,
        'weave': weave,
        'bands': list(bands),
        'panels': list(panels),
        'fabric': f
    }


def PN(u0, u1, style, fg, bg, rep=0.25, down=None):
    return (u0, u1, style, C[fg] if isinstance(fg, str) else fg, C[bg] if isinstance(bg, str) else bg, rep, down)


def B(where, a, b, style, fg, bg=None, rep=0.08):
    return (where, a, b, style, C[fg] if isinstance(fg, str) else fg,
            (C[bg] if isinstance(bg, str) else bg) if bg else None, rep)


def leathery(p):
    if p.get('fabric') in ('cloth.weave.plain', 'cloth.plain', 'cloth.cotton.coarse', 'cloth.wool'):
        q = dict(p)
        q['fabric'] = 'leather.polished'
        return q
    return p


def motif(style, w, h, fg, bg, aspect=1.0):
    if style in CULTURAL_TEX_PATHS:
        return sample_cultural_tex(style, w, h, fg, bg, pal_blend=0.22)
    img = np.empty((h, w, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)
    if style == 'solid':
        img[:] = fg
    elif style == 'fret':
        m = FRETA[(v * FRETA.shape[0]).astype(int).clip(0, FRETA.shape[0] - 1),
                  (u * FRETA.shape[1]).astype(int).clip(0, FRETA.shape[1] - 1)]
        img[m] = fg
    elif style == 'steps':
        s = np.floor(np.minimum(u, 1 - u) * 8) / 4
        img[(1 - v) < s] = fg
    elif style in ('zigzag', 'chevron', 'chevrons'):
        tri = np.abs(((u * 2) % 2) - 1)
        img[np.abs(v - (0.15 + 0.7 * tri)) < 0.16] = fg
    elif style == 'diamonds':
        d = np.abs(u - 0.5) * 2 + np.abs(v - 0.5) * 2
        img[(d < 0.92) & (d > 0.48)] = fg
        img[d < 0.22] = fg
    elif style == 'sun':
        d = np.hypot(u - 0.5, v - 0.5)
        an = np.arctan2(v - 0.5, u - 0.5)
        img[d < 0.2] = fg
        img[(d > 0.26) & (d < 0.46) & (((an / (2 * np.pi) * 12) % 1) < 0.45)] = fg
    elif style == 'orb':
        d = np.hypot(u - 0.5, v - 0.5)
        img[(d < 0.16) | ((d > 0.28) & (d < 0.36))] = fg
    elif style == 'hex':
        x, y = u * 2, v * 2 * 0.866
        r = (y / 0.866).astype(int)
        x = x + 0.5 * (r % 2)
        cx, cy = x % 1 - 0.5, (y % 0.866) - 0.433
        hh = np.maximum(np.abs(cx) * 0.866 + np.abs(cy) * 0.5, np.abs(cy))
        img[hh > 0.36] = fg
    elif style == 'claw':
        for k in range(3):
            img[(np.abs((u - 0.22 - 0.28 * k) - (v - 0.5) * 0.45) < 0.06) & (v > 0.12) & (v < 0.88)] = fg
    elif style == 'tiger':
        img[np.sin(2 * np.pi * (u * 2 + 0.35 * np.sin(2 * np.pi * v))) > 0.55] = fg
    elif style == 'wave':
        img[v > 0.55 + 0.28 * np.sin(2 * np.pi * u) - 0.1 * np.cos(4 * np.pi * u)] = fg
    elif style == 'trencadis':
        rs = np.random.default_rng(w * 7 + h)
        pts = rs.random((7, 2))
        cols = [np.array(fg), np.array(bg), (np.array(fg) + np.array(bg)) / 2, np.array(fg) * 0.8 + 0.2,
                np.array(bg) * 0.85, np.array(fg), np.array(bg) * 0.7 + 0.3]
        d = np.stack([(u - px) ** 2 + (v - py) ** 2 for px, py in pts])
        o = np.sort(d, 0)
        k = np.argmin(d, 0)
        for i in range(len(pts)):
            img[k == i] = cols[i]
        img[(np.sqrt(o[1]) - np.sqrt(o[0])) < 0.03] = np.array(bg) * 0.35 + 0.55
    elif style == 'bogolan':
        img[(np.abs(v - 0.2) < 0.06) & ((u * 4) % 1 < 0.6)] = fg
        img[(np.abs(v - 0.8) < 0.06) & ((u * 4) % 1 < 0.6)] = fg
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.012] = fg
        img[(np.abs(np.abs(u - 0.5) - np.abs(v - 0.5)) < 0.04) & (np.abs(u - 0.5) < 0.22) & (np.abs(u - 0.5) > 0.1)] = fg
    elif style == 'eye':
        ax, ay = (u - 0.5) * 2, (v - 0.5) * 2
        alm = np.abs(ay) < 0.55 * (1 - ax ** 2)
        img[alm] = (1, 1, 1)
        img[alm & (ax ** 2 + ay ** 2 < 0.12)] = fg
        img[alm & (ax ** 2 + ay ** 2 < 0.03)] = (0.05, 0.05, 0.05)
    elif style == 'tartan':
        a, b = ((u * 3) % 1) < 0.34, ((v * 3) % 1) < 0.34
        img[a | b] = np.array(fg) * 0.55 + np.array(bg) * 0.45
        img[a & b] = fg
        img[(((u * 12) % 1) < 0.12) & ~a & ~b] = np.array(fg) * 0.8 + np.array(bg) * 0.2
    elif style == 'knot':
        w1, w2 = 0.5 + 0.32 * np.sin(u * 2 * math.pi), 0.5 - 0.32 * np.sin(u * 2 * math.pi)
        img[(np.abs(v - w1) < 0.11) | (np.abs(v - w2) < 0.11)] = fg
    elif style == 'rose':
        x, y = u - 0.5, v - 0.5
        r, th = np.sqrt(x * x + y * y), np.arctan2(y, x)
        img[r < 0.36 * (0.55 + 0.45 * np.abs(np.cos(3 * th)))] = fg
        img[r < 0.08] = bg
        img[(np.abs(np.abs(x) - 0.42) < 0.05) & (np.abs(y) < 0.18)] = np.array(fg) * 0.5 + np.array(bg) * 0.5
    elif style == 'triskele':
        x, y = u - 0.5, v - 0.5
        m = np.zeros_like(u, bool)
        for k in range(3):
            a = 2 * math.pi * k / 3 + math.pi / 2
            dx, dy = math.cos(a), math.sin(a)
            px, py = -dy, dx
            t, s_ = x * dx + y * dy, x * px + y * py
            m |= (t > 0.04) & (t < 0.3) & (np.abs(s_) < 0.045)
            m |= ((t - 0.3) ** 2 + s_ ** 2) < 0.055 ** 2
            m |= (np.abs(t - 0.3) < 0.018) & (s_ > -0.08) & (s_ < 0.22)
        m |= (x * x + y * y) < 0.06 ** 2
        img[m] = fg
    elif style == 'buttons':
        img[(((u - 0.5) * aspect) ** 2 + (v - 0.5) ** 2) < 0.09 ** 2] = fg
    elif style == 'buttons2':
        for cx in (0.2, 0.8):
            img[(((u - cx) * aspect) ** 2 + (v - 0.5) ** 2) < 0.08 ** 2] = fg
    elif style == 'frog':
        img[(np.abs(v - 0.5) < 0.09) & (np.abs(u - 0.5) < 0.38)] = fg
        for cx in (0.12, 0.88):
            d = np.sqrt((u - cx) ** 2 + (v - 0.5) ** 2)
            img[(d < 0.11) & (d > 0.05)] = fg
    elif style == 'feather':
        uu = (u + 0.5 * (v > 0.5)) % 1
        vv = (v * 2) % 1
        d = ((uu - 0.5) * 1.6) ** 2 + (vv - 0.1) ** 2
        img[d < 0.36] = fg
        img[(d < 0.36) & (np.abs(uu - 0.5) < 0.04)] = np.array(bg) * 0.7 + np.array(fg) * 0.3
    elif style == 'nomad_diamond':
        dx, dy = np.abs(u - 0.5) * 2, np.abs(v - 0.5) * 2
        d = dx + dy
        img[(dx > 0.86) | (dy > 0.86)] = C['madder']
        img[(d < 0.90) & (d > 0.64)] = C['cream']
        img[(d < 0.78) & (d > 0.70)] = C['madder']
        img[d <= 0.64] = C['soot']
        cross = ((dx < 0.14) & (dy < 0.46)) | ((dy < 0.14) & (dx < 0.46)) | ((dx + dy) < 0.26)
        img[cross] = fg
        img[(d > 0.90) & (dx < 0.86) & (dy < 0.86)] = C['lacrose']
    elif style == 'formline_eye':
        ax, ay = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        ov = (ax ** 2) * 0.75 + (ay ** 2) * 1.15
        img[ov < 0.82] = fg
        img[ov < 0.54] = C['bone']
        img[ov < 0.28] = C['turq']
        img[ov < 0.14] = C['soot']
        img[((ax - 0.12) ** 2 + (ay + 0.10) ** 2) < 0.018] = C['white']
    elif style == 'formline_visage':
        vf = 1.0 - v
        ax = np.abs(u - 0.5) * 2.0
        ex = (np.abs(u - 0.5) - 0.22) * 4.2
        ey = (vf - 0.36) * 4.2
        e_ov = ex ** 2 + ey ** 2
        img[e_ov < 0.95] = C['turq']
        img[e_ov < 0.55] = C['white']
        img[e_ov < 0.20] = C['soot']
        img[(ax < 0.16) & (vf > 0.15) & (vf < 0.52)] = C['ochre']
        mx = (u - 0.5) * 2.0
        my = (vf - 0.74) * 3.2
        m_arch = (np.abs(mx) < 0.68) & (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.52)
        img[m_arch] = C['ochre']
        m_in = (np.abs(mx) < 0.58) & (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.32)
        img[m_in] = C['bone']
        teeth_grid = ((np.floor(u * 18) % 2 == 0) | (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.05))
        img[m_in & teeth_grid] = C['soot']
    elif style == 'slat_wood':
        slat_edge = ((u * 16) % 1) < 0.14
        img[slat_edge] = C['soot']
        lash = ((v * 3) % 1) < 0.22
        img[lash] = fg
        lash_cord = lash & (((u * 48) % 1) < 0.3)
        img[lash_cord] = C['soot']
    elif style == 'gold_grid':
        gu, gv = (u * 2) % 1, (v * 2) % 1
        line = (gu < 0.12) | (gv < 0.12)
        dot = (np.abs(gu - 0.56) < 0.16) & (np.abs(gv - 0.56) < 0.16)
        img[line | dot] = fg
    elif style == 'fluted':
        rib = 0.5 + 0.5 * np.sin(u * 2 * math.pi * 3)
        img[:] = np.asarray(bg)[None, None, :] * (0.72 + 0.38 * rib[:, :, None])
        img[(u * 6) % 1 < 0.12] = fg
    elif style == 'checks':
        img[((u * 2).astype(int) + (v * 2).astype(int)) % 2 == 0] = fg
    elif style == 'stripes':
        img[(v * 4).astype(int) % 2 == 0] = fg
    elif style == 'vstripes':
        img[(u * 4).astype(int) % 2 == 0] = fg
    elif style == 'dots':
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.06] = fg
    elif style == 'teeth':
        img[v < (1 - np.abs(u - 0.5) * 2) * 0.85] = fg
    elif style == 'dentils':
        img[((u * 4) % 1) < 0.68] = fg
        img[v < 0.15] = C['soot']
        img[v > 0.85] = C['soot']
    elif style == 'rays':
        img[(u * 2).astype(int) % 2 == 0] = fg
    elif style == 'quilt':
        a1, a2 = ((u + v) * 1.0) % 1, ((u - v) * 1.0) % 1
        img[(np.abs(a1 - 0.5) < 0.045) | (np.abs(a2 - 0.5) < 0.045)] = fg
    elif style == 'cross':
        gu, gv = np.floor(u * 9), np.floor(v * 9)
        d = np.abs(gu - 4) + np.abs(gv - 4)
        img[(d == 4) | ((d <= 1) & ((gu == 4) | (gv == 4)))] = fg
    elif style == 'beads':
        img[(((u * 3) % 1 - 0.5) ** 2 + ((v * 2) % 1 - 0.5) ** 2) < 0.12] = fg
    elif style == 'coin_veil':
        row_idx = np.floor(v * 6).astype(int)
        cu = (u * 8 + 0.5 * (row_idx % 2)) % 1 - 0.5
        cv = (v * 6) % 1 - 0.5
        r2 = cu ** 2 + cv ** 2
        img[r2 < 0.24] = C['iron']
        img[r2 < 0.20] = fg
        img[(r2 < 0.12) & (r2 > 0.07)] = C['iron']
        img[r2 < 0.03] = C['white']
        bead_m = ((row_idx % 3) == 1) & (((u * 8) % 1 - 0.5) ** 2 + (cv + 0.35) ** 2 < 0.055)
        img[bead_m] = C['sunorange']
    elif style == 'polos_mosaic':
        row_m = np.floor(v * 8).astype(int)
        mu = (u * 8 + 0.37 * (row_m % 3)) % 1
        mv = (v * 8) % 1
        tile = (mu > 0.14) & (mu < 0.86) & (mv > 0.16) & (mv < 0.86)
        img[:] = bg
        img[tile] = fg
    elif style == 'fluted_beard':
        rib = 0.5 + 0.5 * np.sin(u * 2 * math.pi * 14)
        img[:] = np.asarray(fg)[None, None, :] * (0.52 + 0.55 * rib[:, :, None])
        img[((u * 14) % 1) < 0.16] = np.asarray(fg) * 0.25
        img[(v < 0.04) | (v > 0.95)] = np.asarray(fg) * 0.35
    elif style == 'star_stole':
        img[:] = bg
        for sx, sy, col_s in ((0.28, 0.20, fg), (0.72, 0.45, fg), (0.32, 0.72, C['ochre']), (0.68, 0.88, fg)):
            dx, dy = (u - sx) * 2.2, (v - sy) * 3.8
            rr = np.hypot(dx, dy)
            th = np.arctan2(dy, dx)
            star = rr < 0.32 * (0.52 + 0.48 * np.cos(5 * th))
            img[star] = col_s
    elif style == 'pelagic_stole':
        img[:] = bg
        in_top = (v > 0.03) & (v < 0.20) & (np.abs(u - 0.5) < 0.42)
        ray_an = np.arctan2(0.21 - v, u - 0.5)
        rays_m = in_top & (((ray_an / math.pi * 9) % 1) < 0.52)
        img[in_top] = C['soot']
        img[rays_m] = C['holyred']
        ladder = (np.abs(u - 0.5) < 0.22) & (v >= 0.20) & (v < 0.52)
        img[ladder] = C['indigo']
        dots_l = ladder & (((u * 12) % 1 - 0.5) ** 2 + ((v * 28) % 1 - 0.5) ** 2 < 0.12)
        img[dots_l] = C['white']
        reg_g = (np.abs(u - 0.5) < 0.34) & (v >= 0.52) & (v < 0.68)
        img[reg_g] = C['jungle']
        img[reg_g & (np.abs(np.abs(u - 0.5) - 0.14) < 0.06) & (np.abs(v - 0.59) < 0.025)] = C['holyred']
        reg_r = (np.abs(u - 0.5) < 0.34) & (v >= 0.68) & (v < 0.80)
        img[reg_r] = C['holyred']
        zig = reg_r & (np.abs((v - 0.71) * 28 - np.abs(((u * 10) % 2) - 1)) < 0.38)
        img[zig] = C['white']
        reg_b = (np.abs(u - 0.5) < 0.36) & (v >= 0.80)
        img[reg_b & (np.abs(u - 0.5) > 0.14)] = C['sunorange']
    elif style == 'net_mesh':
        img[:] = bg
        d1 = np.abs(((u * 3 + v * 2) % 1) - 0.5)
        d2 = np.abs(((u * 3 - v * 2) % 1) - 0.5)
        cord = (d1 < 0.13) | (d2 < 0.13)
        knot = (d1 < 0.18) & (d2 < 0.18)
        img[cord] = fg
        img[knot] = C['soot']
    elif style == 'labyrinth_panel':
        img[:] = bg
        bx = np.minimum(u, 1.0 - u)
        by = np.minimum(v, 1.0 - v)
        img[(bx < 0.14) | (by < 0.10)] = C['madder']
        img[((bx >= 0.04) & (bx < 0.09)) | ((by >= 0.03) & (by < 0.065))] = C['cream']
        in_box = (bx >= 0.16) & (by >= 0.12)
        gu = np.floor(u * 12).astype(int)
        gv = np.floor(v * 16).astype(int)
        maze = ((gu % 2 == 0) & (gv % 3 != 1)) | ((gv % 2 == 0) & (gu % 3 != 2))
        img[in_box & maze] = fg
        img[in_box & ~maze & (((gu + gv) % 3) == 0)] = C['madder']
    elif style == 'kiln_mask':
        vf = 1.0 - v
        img[:] = bg
        for yc in (0.20, 0.48, 0.74):
            img[np.abs(vf - yc) < 0.042] = C['holyred']
        ex = (np.abs(u - 0.5) - 0.16) * 5.2
        ey = (vf - 0.42) * 6.0
        arch = (ey <= 0.15) & (ey >= -0.85) & ((ex ** 2 + (ey - 0.15) ** 2) < 0.85)
        arch_hole = (ey <= 0.02) & (ey >= -0.55) & ((ex ** 2 + (ey - 0.02) ** 2) < 0.28)
        img[arch] = C['white']
        img[arch_hole] = C['umber']
        img[(np.abs(u - 0.5) < 0.035) & (vf > 0.26) & (vf < 0.42)] = C['white']
        mx = (u - 0.5) * 3.8
        my = (vf - 0.78) * 3.2
        m_r2 = mx ** 2 + my ** 2
        img[m_r2 < 0.82] = C['white']
        img[m_r2 < 0.54] = C['soot']
    elif style == 'gourd_holes':
        img[:] = bg
        img[np.abs(v - 0.52) < 0.08] = C['holyred']
        for hx, hy in ((0.22, 0.34), (0.52, 0.70), (0.78, 0.36)):
            hr2 = ((u - hx) * 3.2) ** 2 + ((v - hy) * 2.6) ** 2
            img[hr2 < 0.22] = C['soot']
    elif style == 'pleated_kilt':
        pleat = 0.5 + 0.5 * np.sin((u * 28 + v * 1.5) * 2 * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * (0.72 + 0.42 * pleat[:, :, None])
        img[v > 0.92] = C['madder']
        img[(v > 0.89) & (v <= 0.92)] = C['sky']
    elif style == 'fila_embroidery':
        img[:] = bg
        cx = ((u * 2.0) % 1.0) - 0.5
        cy = v - 0.5
        r = np.sqrt(cx ** 2 + cy ** 2)
        ang = np.arctan2(cy, cx)
        rosette = (np.abs(r - 0.28) < 0.045) | ((r < 0.22) & (np.abs(np.cos(ang * 4)) > 0.65))
        vine = (np.abs(cx) > 0.30) & (np.abs(cy - 0.18 * np.sin(cx * 10.0)) < 0.055)
        img[rosette | vine] = fg
    elif style == 'agbada_scroll':
        img[:] = bg
        sx = np.abs(u - 0.5) * 2.0
        in_shield = v < (0.94 - 0.26 * sx)
        vy = (v * 3.2) % 1.0 - 0.5
        vx = sx - 0.44 - 0.20 * np.sin(vy * math.pi * 2.0)
        scroll = in_shield & ((np.abs(vx) < 0.13) | (np.abs(vx) < 0.22) & (np.abs(vy) < 0.16))
        scroll_core = in_shield & (np.abs(vx) < 0.05)
        seam = in_shield & ((sx < 0.06) | (np.abs(v - (0.90 - 0.26 * sx)) < 0.035))
        img[scroll | seam] = fg
        img[scroll_core] = C['lacrose']
    elif style == 'arabesque_border':
        img[:] = bg
        bx = np.minimum(u, 1.0 - u) * 2.0
        guard = (bx < 0.16) | ((bx > 0.22) & (bx < 0.28))
        wy = (v * 6.0) % 1.0 - 0.5
        wx = (u - 0.5) * 2.0
        vine = (bx >= 0.28) & ((np.abs(wx - 0.35 * np.sin(wy * 2 * math.pi)) < 0.18) |
                               (((wx + 0.25 * np.cos(wy * 2 * math.pi)) ** 2 + (wy * 1.4) ** 2) < 0.18))
        img[guard | vine] = fg
    elif style == 'heliophant_pectoral':
        img[:] = bg
        ax = (u - 0.5) * 2.0
        r = np.sqrt((ax * 0.95) ** 2 + (v * 1.35) ** 2)
        ang = np.arctan2(v * 1.35, ax * 0.95)
        img[(r > 0.18) & (r < 0.30)] = C['turq']
        img[(r >= 0.30) & (r < 0.35)] = C['soot']
        img[(r >= 0.35) & (r < 0.44) & ((np.floor(ang * 14) % 2) == 0)] = C['sunorange']
        img[(np.abs(r - 0.54) < 0.035) & ((np.floor(ang * 18) % 2) == 0)] = C['turq']
        col_idx = np.floor((u * 11.0)).astype(int)
        cu = (u * 11.0) % 1.0 - 0.5
        p_top = 0.36 + 0.16 * (1.0 - ax ** 2)
        p_bot = p_top + 0.24 + 0.06 * ((col_idx % 2) == 0)
        in_pend = (np.abs(ax) < 0.82) & (np.abs(cu) < 0.26) & (v > p_top) & (v < p_bot)
        img[in_pend & ((col_idx % 2) == 0)] = C['turq']
        img[in_pend & ((col_idx % 2) == 1)] = C['sunorange']
        img[in_pend & (v < p_top + 0.035)] = C['gold']
    elif style == 'wing_spots':
        img[:] = bg
        for sx, sy, sr in ((0.25, 0.38, 0.18), (0.52, 0.52, 0.22), (0.76, 0.36, 0.18), (0.36, 0.74, 0.15), (0.66, 0.76, 0.15)):
            d2 = ((u - sx) * 2.2) ** 2 + ((v - sy) * 2.2) ** 2
            img[d2 < (sr * 2.2) ** 2] = C['yuniyellow']
            img[d2 < (sr * 1.45) ** 2] = C['turq']
        scallop = 0.82 + 0.08 * np.cos(u * 6.0 * math.pi)
        img[v > scallop] = C['indigo']
    elif style == 'brocade_skirt':
        img[:] = bg
        for yc, bw in ((0.28, 0.08), (0.58, 0.11), (0.84, 0.09)):
            in_b = np.abs(v - yc) < bw
            edge = np.abs(np.abs(v - yc) - bw) < 0.018
            med = in_b & ((((np.floor(u * 16) + np.floor(v * 24)) % 2) == 0) | (np.abs(((u * 8) % 1.0) - 0.5) < 0.18))
            img[in_b] = C['madder']
            img[med] = C['gold']
            img[edge] = C['gold']
    elif style == 'diamond_quilt':
        du = (u * 5.0 + v * 3.0) % 1.0 - 0.5
        dv = (u * 5.0 - v * 3.0) % 1.0 - 0.5
        seam_dist = np.minimum(0.5 - np.abs(du), 0.5 - np.abs(dv))
        pillow = np.clip(seam_dist * 3.2, 0.0, 1.0) ** 0.55
        hl = 1.0 + 0.08 * (du + dv)
        shade = (0.72 + 0.32 * pillow) * hl
        img[:] = np.asarray(fg)[None, None, :] * shade[:, :, None]
        img[seam_dist < 0.06] = bg
    elif style == 'ancient_hex':
        nx = max(4.0, round(3.5 * aspect))
        su = u * nx
        sv = v * 3.5 * 0.866
        r_hex = np.floor(sv).astype(int)
        hu = (su + 0.5 * (r_hex % 2)) % 1.0 - 0.5
        hv = (sv % 1.0) - 0.5
        hex_d = np.maximum(np.abs(hu), np.abs(hu) * 0.5 + np.abs(hv) * 0.866)
        bevel = np.clip((0.46 - hex_d) * 5.0, 0.0, 1.0)
        img[:] = np.asarray(fg)[None, None, :] * (0.82 + 0.22 * bevel[:, :, None])
        img[hex_d > 0.41] = bg
        node = (hex_d > 0.38) & (np.abs(hv) > 0.34)
        img[node] = C['turq']
        img[(v < 0.05) | (v > 0.95)] = C['gold']
    elif style == 'ancient_visor':
        nx = max(5.0, round(4.0 * aspect))
        su = u * nx
        sv = v * 4.5 * 0.866
        r_hex = np.floor(sv).astype(int)
        hu = (su + 0.5 * (r_hex % 2)) % 1.0 - 0.5
        hv = (sv % 1.0) - 0.5
        hex_d = np.maximum(np.abs(hu), np.abs(hu) * 0.5 + np.abs(hv) * 0.866)
        bevel = np.clip((0.46 - hex_d) * 5.0, 0.0, 1.0)
        img[:] = np.asarray(fg)[None, None, :] * (0.82 + 0.22 * bevel[:, :, None])
        img[hex_d > 0.41] = bg
        img[(v < 0.08) | (v > 0.92)] = C['gold']
        img[(v > 0.28) & (np.abs(u - 0.5) < 0.035)] = C['gold']
        img[(v > 0.30) & (np.abs(u - 0.5) < 0.016)] = C['turq']
        in_visor = (v >= 0.14) & (v <= 0.28) & (np.abs(u - 0.5) < 0.36)
        visor_rim = (np.abs(v - 0.13) < 0.02) | (np.abs(v - 0.29) < 0.02)
        img[visor_rim & (np.abs(u - 0.5) < 0.38)] = C['gold']
        img[in_visor] = C['turq']
    elif style == 'lorica_lames':
        lame_v = (v * 3.5) % 1.0
        lame_shade = 0.76 + 0.32 * np.sin(lame_v * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * lame_shade[:, :, None]
        img[(lame_v > 0.76) & (lame_v <= 0.88)] = fg
        img[lame_v > 0.88] = C['soot']
        nx = max(6.0, round(3.5 * aspect))
        riv_u = (u * nx) % 1.0 - 0.5
        riv = (riv_u ** 2 + ((lame_v - 0.35) * 2.0) ** 2) < 0.045
        img[riv] = C['gold']
    elif style == 'lamellar_scale':
        nx = max(8.0, round(4.5 * aspect))
        row_s = np.floor(v * 4.0).astype(int)
        su = (u * nx + 0.5 * (row_s % 2)) % 1.0 - 0.5
        sv = (v * 4.0) % 1.0
        arch = (su * 1.65) ** 2 + ((sv - 0.55) * 1.35) ** 2
        img[:] = C['soot']
        in_scale = arch < 0.82
        is_anc = ((np.floor(u * nx).astype(int) + row_s * 3) % 5) == 0
        img[in_scale] = bg
        img[in_scale & is_anc] = C['ancient']
        img[in_scale & (arch > 0.56)] = fg
        lace = (sv < 0.24) & (np.abs(su) < 0.18)
        img[lace] = C['crimson']
    elif style == 'quetzal_scale':
        nx = max(6.0, round(5.5 * max(aspect, 1.0)))
        row_s = np.floor(v * 4.0).astype(int)
        su = (u * nx + 0.5 * (row_s % 2)) % 1.0 - 0.5
        sv = (v * 4.0) % 1.0
        arch = (su * 1.55) ** 2 + ((sv - 0.52) * 1.35) ** 2
        img[:] = C['deepgreen']
        in_scale = arch < 0.86
        is_turq = ((np.floor(u * nx).astype(int) + row_s * 2) % 3) == 0
        is_mint = ((np.floor(u * nx).astype(int) + row_s) % 4) == 0
        img[in_scale] = bg
        img[in_scale & is_turq] = C['turq']
        img[in_scale & is_mint & (arch < 0.45)] = C['mint']
        img[in_scale & (arch > 0.62)] = fg
        shaft = in_scale & (np.abs(su) < 0.06) & (sv > 0.18) & (sv < 0.82)
        img[shaft] = C['saffron']
        knot = (sv < 0.22) & (np.abs(su) < 0.16)
        img[knot] = C['maroon']
    elif style == 'bone_lamellar':
        nx = max(8.0, round(7.0 * max(aspect, 1.0)))
        row_b = np.floor(v * 3.0).astype(int)
        su = (u * nx + 0.25 * (row_b % 2)) % 1.0
        sv = (v * 3.0) % 1.0
        img[:] = C['darkfur']
        lame = (su > 0.09) & (su < 0.91) & (sv > 0.08) & (sv < 0.92)
        img[lame] = C['bone']
        img[lame & ((su < 0.22) | (su > 0.78))] = C['cream']
        lace_band = (sv > 0.22) & (sv < 0.36)
        img[lace_band] = C['maroon']
        img[lace_band & (((su * 2.0) % 1.0) < 0.42)] = C['turq']
        rivet = ((su - 0.5) ** 2 + (sv - 0.72) ** 2) < 0.018
        img[rivet] = C['brass']
    elif style == 'tiger_pelt':
        img[:] = C['saffron']
        wave = 0.12 * np.sin(u * 2 * math.pi * max(2.0, round(aspect * 2.0)))
        stripe = np.abs(((v * 5.0 + wave) % 1.0) - 0.5) < 0.18
        img[stripe] = C['soot']
        img[(~stripe) & (np.abs(((v * 5.0 + wave) % 1.0) - 0.5) < 0.26)] = C['ochre']
    elif style == 'leopard_spots':
        img[:] = bg
        nx = max(5.0, round(5.0 * max(aspect, 0.8)))
        ny = 5.0
        row_l = np.floor(v * ny).astype(int)
        su = (u * nx + 0.5 * (row_l % 2)) % 1.0 - 0.5
        sv = (v * ny) % 1.0 - 0.5
        ang_l = np.arctan2(sv, su)
        rad_l = np.hypot(su * 1.15, sv * 1.15) * (1.0 + 0.16 * np.cos(ang_l * 3.0) + 0.10 * np.sin(ang_l * 5.0))
        img[rad_l < 0.34] = C['ochre']
        ring_mask = (rad_l >= 0.22) & (rad_l <= 0.42) & (np.cos(ang_l * 4.0 + (row_l % 3)) > -0.55)
        img[ring_mask] = fg
    elif style == 'eternian_icons':
        img[:] = bg
        border = (np.abs(u - 0.06) < 0.020) | (np.abs(u - 0.94) < 0.020) | (u < 0.025) | (u > 0.975)
        img[border] = fg
        n_ic = max(2.0, round(3.4 / max(aspect, 0.18)))
        nx_ic = max(1.0, round(aspect * n_ic * 0.85))
        sub_aspect = (aspect * n_ic) / nx_ic
        col_ic = np.floor(u * nx_ic).astype(int)
        row_ic = np.floor(v * n_ic).astype(int)
        idx_ic = (row_ic + col_ic * 2) % 4
        lu = (u * nx_ic) % 1.0 - 0.5
        lv = (v * n_ic) % 1.0 - 0.5
        iu = lu * 2.4 * max(0.88, sub_aspect * 1.15)
        iv = lv * 2.4 * max(1.0, 0.88 / max(sub_aspect, 0.15))
        r_ic = np.hypot(iu, iv)
        if nx_ic > 1.5:
            col_div = np.abs(np.abs(lu) - 0.48) < 0.025
            img[col_div] = fg
        eye_top = 0.42 * (1.0 - (iu / 0.78) ** 2)
        in_eye = (np.abs(iu) < 0.78) & (np.abs(iv) <= np.maximum(0.0, eye_top))
        eye_rim = in_eye & (np.abs(np.abs(iv) - eye_top) < 0.11)
        iris = (r_ic < 0.28) & (r_ic > 0.16)
        pupil = r_ic < 0.10
        m0 = (idx_ic == 0) & (eye_rim | iris | pupil)
        ring1 = (r_ic > 0.44) & (r_ic < 0.58) & (~((iv < -0.22) & (np.abs(iu) < 0.24)))
        bar1 = (np.abs(iu) < 0.09) & (iv > -0.68) & (iv < 0.08)
        m1 = (idx_ic == 1) & (ring1 | bar1)
        tri_w = 0.68 * (iv + 0.58) / 1.15
        in_tri = (iv > -0.58) & (iv < 0.58) & (np.abs(iu) < tri_w)
        tri_rim = in_tri & ((np.abs(np.abs(iu) - tri_w) < 0.11) | (iv > 0.46))
        excl = ((np.abs(iu) < 0.07) & (iv > -0.22) & (iv < 0.18)) | ((np.abs(iu) < 0.08) & (np.abs(iv - 0.32) < 0.07))
        m2 = (idx_ic == 2) & (tri_rim | excl)
        drop_w = 0.46 * np.sin(np.clip((iv + 0.62) / 1.20, 0.0, 1.0) * math.pi) ** 0.75
        in_drop = (iv > -0.62) & (iv < 0.58) & (np.abs(iu) < drop_w)
        m3 = (idx_ic == 3) & in_drop & (~((r_ic < 0.16) & (iv > 0.10)))
        img[m0 | m1 | m2 | m3] = fg
    elif style == 'voth_glyphs':
        img[:] = bg
        border = (np.abs(u - 0.08) < 0.028) | (np.abs(u - 0.92) < 0.028) | (u < 0.03) | (u > 0.97)
        img[border] = fg
        n_gv = max(2.0, round(2.6 / max(aspect, 0.20)))
        nx_gv = max(1.0, round(aspect * n_gv * 0.85))
        sub_asp = (aspect * n_gv) / nx_gv
        gv = ((v * n_gv) % 1.0 - 0.5) * max(1.0, 0.9 / max(sub_asp, 0.15))
        gu = ((u * nx_gv) % 1.0 - 0.5) * 2.2 * max(0.85, sub_asp * 1.1)
        gr = np.hypot(gu, gv * 1.55)
        wheel = ((gr > 0.30) & (gr < 0.42)) | ((gr > 0.13) & (gr < 0.22)) | (gr < 0.07)
        spine = (np.abs(gu) < 0.055) & (np.abs(gv) < 0.46)
        diamond = np.abs((np.abs(gu) + np.abs((gv + 0.30) * 1.7)) - 0.36) < 0.065
        crescent = (np.hypot(gu, (gv - 0.28) * 1.7) < 0.38) & (np.hypot(gu, (gv - 0.36) * 1.7) > 0.30)
        rungs = (np.abs(gu) < 0.38) & (np.abs(((v * 16.0) % 1.0) - 0.5) < 0.12)
        img[wheel | spine | diamond | crescent | rungs] = fg
    elif style == 'sun_burst_ikat':
        img[:] = bg
        nx_sb = max(1.0, round(max(aspect, 0.5) * 1.6))
        ny_sb = max(1.0, round(1.6 / max(aspect, 0.35)))
        sub_asp = (aspect * ny_sb) / nx_sb
        su = ((u * nx_sb) % 1.0 - 0.5) * 2.0 * max(1.0, sub_asp)
        sv = ((v * ny_sb) % 1.0 - 0.5) * 2.0 * max(1.0, 1.0 / max(sub_asp, 0.2))
        sr = np.hypot(su, sv)
        sang = np.arctan2(sv, su)
        ray_len = 0.54 + 0.34 * np.cos(sang * 16.0)
        is_ray = (sr < ray_len) & (sr > 0.20)
        ring = (sr >= 0.13) & (sr <= 0.23)
        core = sr < 0.08
        step_border = ((np.abs(su) > 0.78) | (np.abs(sv) > 0.80)) & (((np.floor(u * 16 * nx_sb) + np.floor(v * 18 * ny_sb)) % 2) == 0)
        img[is_ray | ring | core | step_border] = fg
        img[(sr > 0.08) & (sr < 0.13)] = C['crimson']
    elif style == 'tzintzun_tapestry':
        img[:] = bg
        nx_t = max(1.0, round(max(aspect, 0.45) * 1.05))
        ny_t = 1.0
        sub_asp = (aspect * ny_t) / nx_t
        su = ((u * nx_t) % 1.0 - 0.5) * 2.0 * min(1.35, max(0.85, sub_asp))
        sv = ((v * ny_t) % 1.0 - 0.5) * 2.0
        sr = np.hypot(su, sv)
        sang = np.arctan2(sv, su)
        # Bold 16-rayed golden solar wheel with crisp dark contrast outline
        ray_phase = np.cos(sang * 16.0)
        ray_w = 0.58 + 0.26 * ray_phase
        in_sun = (sr < ray_w) & (sr > 0.28) & (ray_phase > -0.10)
        sun_shadow = (sr < ray_w + 0.035) & (sr > 0.25) & (~in_sun) & (sr < 0.84)
        outer_ring = (sr >= 0.21) & (sr <= 0.29)
        inner_ring = (sr >= 0.09) & (sr <= 0.15)
        star_core = ((np.abs(su) * 0.35 + np.abs(sv) < 0.11) | (np.abs(sv) * 0.35 + np.abs(su) < 0.11)) & (sr < 0.12)
        # Crisp continuous diamond & Mayan step-fret frame (no blocky rounding!)
        d_man = np.abs(su) + np.abs(sv)
        ikat_frame = (np.abs(d_man - 1.08) < 0.055) | (np.abs(d_man - 1.28) < 0.048)
        au, av = np.abs(su), np.abs(sv)
        step_fret = ((au > 0.72) & (av > 0.72) & ((np.abs(au - 0.82) < 0.045) | (np.abs(av - 0.82) < 0.045)))
        cell_border = (au > 0.92) | (av > 0.92)
        img[sun_shadow] = C['soot']
        img[(d_man > 1.135) & (d_man < 1.232)] = C['soot']
        img[(sr > 0.15) & (sr < 0.21)] = C['soot']
        img[in_sun | outer_ring | inner_ring | star_core | ikat_frame | step_fret | cell_border] = fg
    elif style == 'tzintzun_emerald_stole':
        img[:] = bg
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        gv = (v * 2.0) % 1.0 - 0.5
        agv = np.abs(gv) * 2.0
        # Bold double gold border with Mayan step-fret notches along left & right edges
        outer_rail = au > 0.84
        inner_rail = (au > 0.66) & (au < 0.74)
        fret_teeth = (au >= 0.74) & (au <= 0.84) & (((np.floor(v * 16.0)) % 2) == 0)
        horiz_bar = (agv > 0.84) & (au < 0.74)
        # Central Mayan diamond-eye & stepped pyramid glyph in each cartouche
        d_glyph = au * 1.35 + agv * 1.15
        d_outer = (d_glyph >= 0.42) & (d_glyph <= 0.56)
        d_inner = (d_glyph >= 0.18) & (d_glyph <= 0.28)
        d_pupil = (au < 0.08) & (agv < 0.12)
        step_arch = (np.abs(au - 0.38) < 0.06) & (agv > 0.42) & (agv < 0.74)
        img[(au > 0.74) & (au < 0.84) & (~fret_teeth)] = C['soot']
        img[(d_glyph > 0.28) & (d_glyph < 0.42)] = C['soot']
        img[outer_rail | inner_rail | fret_teeth | horiz_bar | d_outer | d_inner | d_pupil | step_arch] = fg
    elif style == 'ordinator_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        fore_arch = 0.29 - 0.12 * ((abs_u - 0.28) ** 2)
        in_enamel = (mv > 0.04) & (mv < fore_arch) & (abs_u > 0.07) & (abs_u < 0.68)
        img[in_enamel] = C['cream']
        enamel_rim = (np.abs(mv - fore_arch) < 0.025) & (abs_u < 0.72)
        img[enamel_rim] = fg
        eye_v_center = 0.42 - 0.11 * (abs_u - 0.12)
        in_eye = (abs_u > 0.11) & (abs_u < 0.52) & (np.abs(mv - eye_v_center) < 0.042 * (1.0 - 0.6 * np.abs(abs_u - 0.31) / 0.22))
        brow_ridge = (abs_u > 0.08) & (abs_u < 0.56) & (mv > eye_v_center - 0.070) & (mv < eye_v_center - 0.038)
        img[brow_ridge] = fg
        img[in_eye] = C['soot']
        nose_edge = (mv > 0.30) & (mv < 0.66) & (np.abs(abs_u - (0.045 + 0.035 * (mv - 0.30))) < 0.018)
        img[nose_edge] = C['umber']
        nose_hi = (mv > 0.28) & (mv < 0.65) & (abs_u < 0.035)
        img[nose_hi] = C['cream']
        cheek_line = 0.54 + 0.22 * (abs_u - 0.16)
        cheek_recess = (abs_u > 0.18) & (abs_u < 0.58) & (np.abs(mv - cheek_line) < 0.032)
        img[cheek_recess] = C['soot']
        mouth_arch = (mv > 0.70) & (mv < 0.88) & (abs_u < 0.26 * (1.0 - 0.5 * (mv - 0.70)))
        mouth_slits = mouth_arch & ((np.abs(((mu * 18.0) % 1.0) - 0.5) < 0.22) | (np.abs(mv - 0.76) < 0.018))
        img[mouth_slits] = C['soot']
        jaw_trim = (abs_u > 0.68) | (mv > 0.93)
        img[jaw_trim] = C['umber']
    elif style == 'ordinator_cuirass':
        img[:] = bg
        cu = (u - 0.5) * 2.0
        cv = v
        abs_u = np.abs(cu)
        pect_arch = 0.48 + 0.14 * np.cos(cu * math.pi * 0.85)
        in_pect = cv < pect_arch
        scroll_1 = np.abs(np.sin(cu * 4.5 * math.pi) * 0.12 + (cv - 0.24)) < 0.038
        scroll_2 = np.abs(np.cos(cu * 3.0 * math.pi) * 0.10 - (cv - 0.20)) < 0.032
        sun_r = np.hypot(cu * 1.15, (cv - 0.23) * 1.65)
        sun_med = (sun_r < 0.16) | ((sun_r < 0.26) & (np.cos(np.arctan2(cv - 0.23, cu) * 12.0) > 0.25))
        img[in_pect & (scroll_1 | scroll_2 | sun_med)] = fg
        arch_band = np.abs(cv - pect_arch) < 0.048
        img[arch_band] = fg
        key_dots = arch_band & (np.abs(cv - pect_arch) < 0.024) & (((np.floor(u * 28.0) + np.floor(v * 20.0)) % 2) == 0)
        img[key_dots] = C['cream']
        in_abs = cv >= (pect_arch + 0.048)
        lame_phase = ((cv - pect_arch) * 9.5) % 1.0
        img[in_abs] = C['deepgreen']
        img[in_abs & (lame_phase < 0.22)] = C['soot']
        img[in_abs & (lame_phase >= 0.22) & (lame_phase < 0.36)] = fg
        img[in_abs & (abs_u < 0.06)] = fg
    elif style == 'tzintzun_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # 1. Clearly defined vertical diamond 'third eye' on the forehead
        gem_d = abs_u * 1.55 + np.abs(mv - 0.22) * 1.10
        img[(gem_d >= 0.16) & (gem_d <= 0.22)] = C['umber']
        img[(gem_d >= 0.125) & (gem_d < 0.16)] = C['cream']
        img[gem_d < 0.125] = C['soot']
        # Inner vertical third-eye iris slit
        third_slit = (abs_u < 0.018) & (np.abs(mv - 0.22) < 0.065)
        img[third_slit] = fg
        # 2. Sharp double-arched brow ridges
        brow_v = 0.35 - 0.075 * np.sin(np.clip((abs_u - 0.07) / 0.48, 0.0, 1.0) * math.pi)
        brow_line = (abs_u > 0.07) & (abs_u < 0.56) & ((np.abs(mv - brow_v) < 0.020) | (np.abs(mv - (brow_v - 0.034)) < 0.016))
        img[brow_line] = C['umber']
        # 3. Large, clearly defined upturned almond eyes
        eye_v_c = 0.435 - 0.055 * (abs_u - 0.14)
        eye_u = (abs_u - 0.28) / 0.195
        eye_arch = 0.058 * np.maximum(0.0, 1.0 - eye_u ** 2)
        in_eye = (np.abs(eye_u) < 1.0) & (np.abs(mv - eye_v_c) < eye_arch)
        eye_rim = (np.abs(eye_u) < 1.12) & (np.abs(np.abs(mv - eye_v_c) - eye_arch) < 0.022)
        img[eye_rim] = C['umber']
        img[in_eye] = C['soot']
        # 4. Crisp nasal ridge, nostrils, and solemn sculpted lips on the pointed oval faceplate
        nose_w = 0.036 + 0.044 * np.clip((mv - 0.34) / 0.29, 0.0, 1.0) ** 1.4
        nose_contour = (mv > 0.34) & (mv < 0.64) & (np.abs(abs_u - nose_w) < 0.018)
        nostril = (np.hypot(abs_u - 0.052, mv - 0.62) < 0.024)
        img[nose_contour] = C['umber']
        img[nostril] = C['soot']
        img[(mv > 0.33) & (mv < 0.61) & (abs_u < 0.024)] = C['cream']
        lip_u = abs_u / 0.18
        up_lip = 0.73 - 0.032 * np.maximum(0.0, 1.0 - (lip_u - 0.25) ** 2)
        lo_lip = 0.73 + 0.036 * np.maximum(0.0, 1.0 - lip_u ** 2)
        lip_outline = (lip_u < 1.0) & ((np.abs(mv - up_lip) < 0.016) | (np.abs(mv - lo_lip) < 0.016))
        lip_part = (lip_u < 0.95) & (np.abs(mv - 0.73) < 0.014)
        img[lip_outline] = C['umber']
        img[lip_part] = C['soot']
        # Outer bevel border of the pointed gold oval mask
        oval_rim = (abs_u > 0.76) | (mv > 0.92) | (mv < 0.04)
        img[oval_rim] = C['umber']
    elif style == 'priest_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        slit = (abs_u < 0.62) & (mv > 0.12) & (mv < 0.92) & (np.abs(((mu * 11.0) % 1.0) - 0.5) < 0.22) & (abs_u > 0.05)
        img[slit] = C['soot']
        img[abs_u < 0.055] = fg
        eye_v = 0.40 - 0.07 * (abs_u - 0.10)
        brow_plate = (abs_u > 0.06) & (abs_u < 0.54) & (mv > eye_v - 0.065) & (mv < eye_v - 0.015)
        eye_open = (abs_u > 0.10) & (abs_u < 0.48) & (np.abs(mv - (eye_v + 0.015)) < 0.032)
        img[brow_plate] = fg
        img[eye_open] = C['soot']
        cross_band = (np.abs(mv - 0.18) < 0.028) | (np.abs(mv - 0.54) < 0.025) | (np.abs(mv - 0.78) < 0.024)
        img[cross_band] = fg
        img[(abs_u > 0.52) & (mv > 0.22) & (mv < 0.52)] = C['crimson']
    elif style == 'chosen_kabuki_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        brow_sweep = np.abs(mv - (0.30 - 0.14 * (abs_u - 0.08))) < 0.042
        cheek_sweep = (mv > 0.44) & (np.abs(abs_u - (0.20 + 0.22 * (mv - 0.44))) < 0.058)
        chin_stripe = (mv > 0.76) & (abs_u < 0.07)
        img[(brow_sweep | cheek_sweep | chin_stripe) & (abs_u > 0.04)] = fg
        eye_u = (abs_u - 0.26) / 0.17
        eye_arch = 0.040 * np.maximum(0.0, 1.0 - eye_u ** 2)
        in_eye = (np.abs(eye_u) < 1.05) & (np.abs(mv - 0.40) < eye_arch)
        eye_wing = (abs_u > 0.26) & (abs_u < 0.56) & (np.abs(mv - (0.40 - 0.12 * (abs_u - 0.26))) < 0.020)
        img[in_eye | eye_wing] = C['soot']
        img[(mv > 0.35) & (mv < 0.62) & (np.abs(abs_u - 0.045) < 0.012)] = C['taupe']
        lip = (abs_u < 0.16) & (np.abs(mv - 0.73) < 0.026 * (1.0 - (abs_u / 0.16) ** 2))
        img[lip] = C['soot']
    elif style == 'chosen_tapestry':
        img[:] = bg
        nx_c = max(2.0, round(max(aspect, 0.5) * 4.0))
        ny_c = max(2.0, round(4.0 / max(aspect, 0.35)))
        su = ((u * nx_c) % 1.0 - 0.5) * 2.0
        sv = ((v * ny_c) % 1.0 - 0.5) * 2.0
        d = np.abs(np.round(su * 4.0) / 4.0) + np.abs(np.round(sv * 4.0) / 4.0)
        diamond_ring = (np.abs(d - 0.75) < 0.18)
        center_cross = (np.abs(su) < 0.16) & (np.abs(sv) < 0.38) | (np.abs(sv) < 0.16) & (np.abs(su) < 0.38)
        border_zig = np.abs(np.abs(sv) - 0.85) < 0.09
        img[diamond_ring | border_zig] = fg
        img[center_cross] = C['oat']
        img[(np.abs(d - 0.50) < 0.10)] = C['soot']
    elif style == 'lightkeeper_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        plate = (np.abs(mu) < 0.62) & (mv > 0.22) & (mv < 0.86)
        img[plate] = C['slate']
        r_L = np.hypot((mu - 0.25) * 1.1, (mv - 0.40) * 1.4)
        r_R1 = np.hypot((mu + 0.20) * 1.2, (mv - 0.35) * 1.5)
        r_R2 = np.hypot((mu + 0.34) * 1.2, (mv - 0.42) * 1.5)
        r_R3 = np.hypot((mu + 0.21) * 1.2, (mv - 0.47) * 1.5)
        bezel = ((r_L >= 0.09) & (r_L <= 0.13)) | ((r_R1 >= 0.055) & (r_R1 <= 0.085)) | ((r_R2 >= 0.055) & (r_R2 <= 0.085)) | ((r_R3 >= 0.055) & (r_R3 <= 0.085))
        lens = (r_L < 0.09) | (r_R1 < 0.055) | (r_R2 < 0.055) | (r_R3 < 0.055)
        img[bezel] = C['brass']
        img[lens] = fg
        grille = (np.abs(mu) < 0.26) & (mv > 0.62) & (mv < 0.84) & (np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.22)
        img[grille] = C['brass']
    elif style == 'electromonk_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        tri_w = 0.28 * (0.30 - mv) / 0.20
        in_rune = (mv > 0.09) & (mv < 0.30) & ((np.abs(abs_u - tri_w) < 0.032) | ((np.abs(mv - 0.12) < 0.024) & (abs_u < 0.26)) | ((abs_u < 0.028) & (mv < 0.34)))
        img[in_rune] = C['cream']
        r_eye = np.hypot((abs_u - 0.25) * 1.15, (mv - 0.42) * 1.45)
        img[(r_eye >= 0.085) & (r_eye <= 0.125)] = C['brass']
        img[r_eye < 0.085] = fg
        grille = (abs_u < 0.28) & (mv > 0.64) & (mv < 0.86) & (np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.22)
        img[grille] = C['silver']
    elif style == 'corsair_skull_mask':
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        skull_plate = (mv > 0.30) & (mv < 0.88) & (abs_u < (0.56 - 0.24 * np.maximum(0.0, mv - 0.52)))
        img[skull_plate] = C['brass']
        r_eye = np.hypot((abs_u - 0.24) * 1.15, (mv - 0.43) * 1.45)
        r_top = np.hypot(mu * 1.15, (mv - 0.25) * 1.45)
        socket = (r_eye < 0.13) | (r_top < 0.11)
        lens = (r_eye < 0.085) | (r_top < 0.075)
        crosshair = lens & ((np.abs(abs_u - 0.24) < 0.015) | (np.abs(mv - 0.43) < 0.015) | (abs_u < 0.015) | (np.abs(mv - 0.25) < 0.015))
        img[socket] = C['soot']
        img[lens] = fg
        img[crosshair] = C['cream']
        nasal = (mv > 0.48) & (mv < 0.60) & (abs_u < 0.065 * (mv - 0.46) / 0.14)
        teeth_gap = (mv > 0.64) & (mv < 0.86) & (abs_u < 0.28) & ((np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.18) | (np.abs(mv - 0.75) < 0.018))
        img[nasal | teeth_gap] = C['soot']
    elif style == 'circuit_schematic':
        img[:] = bg
        nx_cs = max(4.0, round(8.0 * max(aspect, 0.4)))
        ny_cs = max(4.0, round(8.0 / max(aspect, 0.4)))
        gu = (u * nx_cs) % 1.0
        gv = (v * ny_cs) % 1.0
        cell_i = (np.floor(u * nx_cs).astype(int) * 7 + np.floor(v * ny_cs).astype(int) * 13) % 6
        h_trace = (cell_i < 3) & (np.abs(gv - 0.5) < 0.08)
        v_trace = (cell_i >= 2) & (cell_i < 5) & (np.abs(gu - 0.5) < 0.08)
        diag_trace = (cell_i == 5) & (np.abs(gu - gv) < 0.10)
        pad_ring = (np.hypot(gu - 0.5, gv - 0.5) < 0.24) & (np.hypot(gu - 0.5, gv - 0.5) > 0.12)
        border = (u < 0.05) | (u > 0.95) | (np.abs(u - 0.5) < 0.025)
        img[h_trace | v_trace | diag_trace | pad_ring | border] = fg
    elif style == 'baroque_scroll':
        img[:] = bg
        su = (u - 0.5) * 2.0
        sv = v * 4.0 * math.pi
        wave1 = np.abs(su - 0.42 * np.sin(sv)) < 0.13
        wave2 = np.abs(su + 0.42 * np.sin(sv + 0.8)) < 0.11
        curl = np.abs(np.hypot(su - 0.25 * np.cos(sv), ((v * 4.0) % 1.0 - 0.5) * 1.6) - 0.34) < 0.08
        border = (np.abs(su) > 0.84)
        img[wave1 | wave2 | curl | border] = fg
    elif style == 'procrastinator_wheel':
        # 8-spoked Dharma / Procrastinator wheel with concentric glyph rings and the Three Evidential dots
        img[:] = bg
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        rim = ((r >= 0.72) & (r <= 0.88)) | ((r >= 0.24) & (r <= 0.34))
        spoke = (r >= 0.28) & (r <= 0.76) & (np.abs(np.sin(4.0 * th)) < 0.14)
        boss = (r > 0.88) & (r < 0.96) & (np.abs(np.cos(4.0 * th)) > 0.86)
        hub = r < 0.14
        img[rim | spoke | boss] = fg
        img[hub] = C['godteal']
    elif style == 'bone_apron':
        # Tibetan Cham carved bone-bead lattice (rgyan drug) with skull-rosette nodes and dangling bone strands
        img[:] = bg
        gu = (u * 4.0) % 1.0 - 0.5
        gv = (v * 4.0) % 1.0 - 0.5
        d1 = np.abs(gu + gv)
        d2 = np.abs(gu - gv)
        strand = (d1 < 0.11) | (d2 < 0.11)
        bead = (((u * 16.0) % 1.0 - 0.5) ** 2 + ((v * 16.0) % 1.0 - 0.5) ** 2) < 0.18
        node_r = np.hypot(gu, gv)
        img[strand & bead] = fg
        img[node_r < 0.22] = C['omaroon']
        img[node_r < 0.17] = fg
        img[node_r < 0.06] = C['gold']
    elif style == 'cham_mask':
        # Wrathful Dharmapala / Shanag Cham mask with three blazing eyes, gold flame brows, and fanged grimace
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Gold flame-brow & third eye on forehead
        brow_arch = np.abs(mv - (0.32 - 0.08 * np.sin(np.clip(abs_u * 2.5, 0.0, 1.0) * math.pi))) < 0.032
        img[brow_arch & (abs_u < 0.58)] = C['gold']
        r_third = np.hypot(mu * 1.3, (mv - 0.22) * 1.8)
        img[r_third < 0.11] = C['gold']
        img[r_third < 0.075] = C['holyred']
        img[r_third < 0.035] = C['white']
        # Twin wrathful bulging eyes
        r_eye = np.hypot((abs_u - 0.25) * 1.25, (mv - 0.42) * 1.55)
        img[r_eye < 0.15] = C['gold']
        img[r_eye < 0.11] = C['white']
        img[r_eye < 0.055] = C['soot']
        # Snarling fanged mouth
        in_mouth = (abs_u < 0.36) & (mv > 0.64) & (mv < 0.84)
        img[in_mouth] = C['soot']
        fang = in_mouth & ((np.abs(mv - 0.66) < 0.035) | (np.abs(mv - 0.82) < 0.035)) & ((((u * 18.0) % 1.0) < 0.55) | (np.abs(abs_u - 0.28) < 0.04))
        img[fang] = C['bone']
        mouth_rim = (abs_u < 0.40) & (mv > 0.61) & (mv < 0.87) & ~in_mouth
        img[mouth_rim] = C['gold']
    elif style == 'keeper_visor':
        # Gilded-lead Vault Containment Visor with glowing blue-glass slit (for LS-006 The Second Sun) and 7+1 Seal marks
        img[:] = bg
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        plate = (abs_u < 0.62) & (mv > 0.16) & (mv < 0.88)
        img[plate] = C['slate']
        rim = (abs_u < 0.65) & (mv > 0.13) & (mv < 0.91) & ~plate
        img[rim] = C['brass']
        # Blue-glass ocular slit with brass crossbars
        visor_slit = (abs_u < 0.46) & (mv > 0.35) & (mv < 0.48)
        visor_bezel = (abs_u < 0.50) & (mv > 0.32) & (mv < 0.51) & ~visor_slit
        img[visor_bezel] = C['brass']
        img[visor_slit] = fg
        img[visor_slit & (np.abs(mv - 0.39) < 0.015)] = C['white']
        # Silenced acoustic grille below nose
        grille = (abs_u < 0.28) & (mv > 0.62) & (mv < 0.82) & (np.abs(((mu * 12.0) % 1.0) - 0.5) < 0.20)
        img[grille] = C['brass']
    elif style == 'xanadu_mosaic':
        # Persian star-and-cross glazed tile mosaic (after TEX.xMosA in settlements/xanadu/src/70-xa-tex.js):
        # 8-pointed turquoise and cream stars on lapis/bg with gold central bosses and cream cross-tiles
        img[:] = bg
        nx_m = max(2.0, round(3.0 * max(aspect, 0.35)))
        ny_m = max(2.0, round(3.0 / max(aspect, 0.35)))
        gu = (u * nx_m) % 1.0 - 0.5
        gv = (v * ny_m) % 1.0 - 0.5
        r = np.hypot(gu, gv)
        # 8-pointed star: union of axis-aligned square and 45-degree rotated square
        sq1 = (np.abs(gu) < 0.31) & (np.abs(gv) < 0.31)
        sq2 = (np.abs(gu + gv) < 0.43) & (np.abs(gu - gv) < 0.43)
        star8_outer = sq1 | sq2
        sq1_in = (np.abs(gu) < 0.19) & (np.abs(gv) < 0.19)
        sq2_in = (np.abs(gu + gv) < 0.26) & (np.abs(gu - gv) < 0.26)
        star8_inner = sq1_in | sq2_in
        img[star8_outer] = fg
        img[star8_inner] = C['cream']
        img[r < 0.10] = C['gold']
        # Corner cross-tiles between stars
        cu = np.minimum(gu + 0.5, 0.5 - gu)
        cv = np.minimum(gv + 0.5, 0.5 - gv)
        cross_tile = ((cu < 0.08) & (cv < 0.20)) | ((cv < 0.08) & (cu < 0.20))
        img[cross_tile] = C['cream']
    elif style == 'xanadu_sun_wheel':
        # Sultanate of Xanadu emblem (after TEX.xSun & TEX.xBand in 70-xa-tex.js):
        # Gold Sun-and-Moon roundel on maroon disc with 12-rayed gold sun & cream crescent
        img[:] = bg
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        # Outer gold medallion ring & maroon field
        img[r < 0.88] = C['gold']
        img[r < 0.76] = C['maroon']
        # 12-rayed sun star
        ray_r = 0.46 + 0.18 * np.cos(12.0 * th)
        img[r < ray_r] = C['gold']
        # Cream crescent moon & inner sun core
        r_moon1 = np.hypot(dx, dy)
        r_moon2 = np.hypot(dx - 0.11, dy + 0.07)
        crescent = (r_moon1 < 0.30) & (r_moon2 > 0.24)
        img[crescent] = C['cream']
        img[r < 0.12] = C['kesar']
        # Corner lozenge-chain frieze accents
        corner = (np.abs(dx) > 0.65) & (np.abs(dy) > 0.65) & (np.abs(np.abs(dx) - np.abs(dy)) < 0.12)
        img[corner] = fg
    elif style == 'tocharian_wheel':
        # Xanadu Temple Grammarians' 8-spoked Dharma wheel & Tocharian sound-grid syllabary (LORE.md §6.13)
        img[:] = bg
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        # Sound-grid syllabary background table
        gu = (u * 8.0) % 1.0
        gv = (v * 10.0) % 1.0
        grid_line = (gu < 0.09) | (gv < 0.09)
        # Tocharian-like arched syllable stroke + vowel diacritic inside each grid cell
        glyph_arch = (np.abs( np.hypot(gu - 0.52, gv - 0.55) - 0.24 ) < 0.06) & (gv < 0.68)
        glyph_bar = (np.abs(gv - 0.30) < 0.05) & (gu > 0.28) & (gu < 0.76)
        img[grid_line] = C['maroon']
        img[glyph_arch | glyph_bar] = C['saffron']
        # Central 8-spoked saffron-and-gold wheel over maroon sanctum disc
        img[r < 0.74] = C['omaroon']
        rim = ((r >= 0.58) & (r <= 0.72)) | ((r >= 0.18) & (r <= 0.26))
        spoke = (r >= 0.22) & (r <= 0.62) & (np.abs(np.sin(4.0 * th)) < 0.15)
        felly_boss = (r > 0.70) & (r < 0.78) & (np.abs(np.cos(4.0 * th)) > 0.88)
        img[rim | spoke | felly_boss] = fg
        img[r < 0.12] = C['turq']
    elif style == 'chahar_aina':
        # Indo-Persian & Tibetan Dzong 'Four-Mirror' (Chahar-Aina) steel plate damascened in Xanadui gold
        img[:] = bg
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        ax, ay = np.abs(dx), np.abs(dy)
        oct_d = np.maximum(np.maximum(ax, ay), (ax + ay) * 0.73)
        in_plate = oct_d < 0.88
        img[in_plate] = C['steel']
        # Gold koftgari damascened border & inner octagonal frame
        gold_rim = ((oct_d >= 0.76) & (oct_d < 0.88)) | ((oct_d >= 0.62) & (oct_d < 0.67))
        # Central 8-spoked gold Xanadu wheel boss on mirror plate
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        boss_rim = (r >= 0.26) & (r <= 0.34)
        boss_spoke = (r < 0.28) & (np.abs(np.sin(4.0 * th)) < 0.16)
        rivet = (np.abs(ax - 0.52) < 0.05) & (np.abs(ay - 0.52) < 0.05)
        img[gold_rim | boss_rim | boss_spoke | rivet] = fg
        img[r < 0.11] = C['holyred']
    elif style == 'ordinator_plume':
        # Layered forward-swooping mohawk feather/hair crest: dense diagonal feather barbs, golden rachis quills & iridescent tips
        img[:] = bg
        n_plumes = 7.0
        pu = (u * n_plumes) % 1.0
        dx = pu - 0.5
        quill = np.abs(dx) < 0.055 * (1.0 - 0.45 * v)
        barb_phase = (v * 38.0 - np.abs(dx) * 18.0) % 1.0
        barb_hi = barb_phase < 0.48
        barb_dark = (barb_phase >= 0.48) & (barb_phase < 0.72)
        edge_fringe = np.abs(dx) > (0.42 - 0.12 * (v ** 1.6))
        tip_eye = (v > 0.74) & (np.hypot(dx * 1.8, (v - 0.84) * 2.4) < 0.26)
        tip_core = (v > 0.78) & (np.hypot(dx * 2.2, (v - 0.85) * 2.8) < 0.13)
        img[barb_hi] = np.array(fg) * 1.08
        img[barb_dark] = np.array(bg) * 0.72
        img[edge_fringe] = np.array(bg) * 0.48
        img[quill] = C['gold']
        img[tip_eye] = C['gold']
        img[tip_core] = C['cybercyan']
    elif style == 'dalab_solar_weave':
        # High-drip Dalab Genepriest liturgical brocade: stepped Tiwanaku solar fret, golden sun-rays, and All-Seeing Eye medallions
        img[:] = bg
        cx, cy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        ax, ay = np.abs(cx), np.abs(cy)
        r = np.hypot(cx, cy)
        th = np.arctan2(cy, cx)
        # Outer stepped Andean/Moebius diamond-cross temple frame
        step_d = np.floor(ax * 6.0) / 6.0 + np.floor(ay * 6.0) / 6.0
        frame_gold = ((step_d >= 0.65) & (step_d <= 0.85)) | ((ax > 0.84) & (ax < 0.94))
        ray_burst = (r >= 0.34) & (r <= 0.64) & (((th / (2 * np.pi) * 16.0) % 1.0) < 0.46)
        alm = (np.abs(cy) < 0.32 * (1.0 - (cx * 1.45) ** 2)) & (ax < 0.68)
        alm_rim = (np.abs(cy) < 0.38 * (1.0 - (cx * 1.35) ** 2)) & (ax < 0.73) & (~alm)
        iris = alm & (r < 0.22)
        pupil = alm & (r < 0.09)
        img[ray_burst | frame_gold | alm_rim] = C['gold']
        img[alm] = C['white']
        img[iris] = C['godteal']
        img[pupil] = C['soot']
    elif style == 'cyber_hex_neon':
        # High-contrast cyberpunk carbon-hex armor weave with glowing neon circuit traces
        img[:] = bg
        hx, hy = u * 6.0, v * 6.0 * 0.866
        hr = (hy / 0.866).astype(int)
        hx = hx + 0.5 * (hr % 2)
        hcx, hcy = (hx % 1.0) - 0.5, (hy % 0.866) - 0.433
        hd = np.maximum(np.abs(hcx) * 0.866 + np.abs(hcy) * 0.5, np.abs(hcy))
        hex_rim = (hd > 0.36) & (hd <= 0.44)
        trace_v = (np.abs((u * 4.0) % 1.0 - 0.5) < 0.045) & (((v * 8.0) % 1.0) < 0.72)
        trace_h = (np.abs((v * 4.0) % 1.0 - 0.5) < 0.045) & (((u * 8.0) % 1.0) < 0.65)
        node_dot = np.hypot((u * 4.0) % 1.0 - 0.5, (v * 4.0) % 1.0 - 0.5) < 0.09
        img[hex_rim] = np.array(bg) * 1.45 + 0.04
        img[trace_v | trace_h] = np.array(fg) * 0.85
        img[node_dot] = np.minimum(1.0, np.array(fg) * 1.25 + 0.15)
    if style in CULTURAL_MOTIF_PACK_MAP:
        tex_key, tex_w, pal_b = CULTURAL_MOTIF_PACK_MAP[style]
        tex_acc = sample_cultural_tex(tex_key, w, h, fg, bg, pal_blend=pal_b)
        img = (1.0 - tex_w) * img + tex_w * tex_acc
    return img


def paint_strip(spec, W, H, circ, length, circ_rows=None):
    """the strip of a part's texture: W px round (circ metres), H px down (length metres). circ_rows, when given, is
    the part's circumference row by row (top first): a band's motif is then tiled at each row's own circumference,
    so it keeps its size in metres on a flared skirt (issue 9, REVIEW-GARMENTS-2026-11-06.md)"""
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = spec['base']
    g = spec.get('weave', 0.06)
    fab = spec.get('fabric')
    gr = grain(fab) if fab in FABRIC else None
    if g and gr is None:
        n = rng.normal(0, g * 0.5, (H, W, 1))
        thread = (((np.arange(W) % 3) == 0)[None, :, None] * 0.5 + ((np.arange(H) % 3) == 0)[:, None, None] * 0.5) * g
        img = img * (1 + n - thread)

    panels = spec.get('panels', [])
    bands = spec.get('bands', [])

    bot_band_r = H
    for where, f0, f1, *_ in bands:
        if where == 'bottom':
            r0 = int(max(0, round((1.0 - max(f0, f1) / max(length, 1e-4)) * H)))
            bot_band_r = min(bot_band_r, r0)

    def _draw_panel(p_spec, respect_bot_hem=False):
        u0, u1, style, fg, bg, rep, down = p_spec
        c0, c1 = int(max(0, round(u0 * W))), int(min(W, round(u1 * W)))
        if c1 - c0 < 1:
            return
        n_rep = max(1, int(round(length / rep))) if rep else 1
        ch = max(2, H // n_rep)
        cell = motif(style, c1 - c0, ch, np.array(fg), np.array(bg), aspect=(u1 - u0) * circ / max(length / n_rep, 1e-4))
        hh = (bot_band_r if respect_bot_hem else H) if down is None else min(H, int(round(down / max(length, 1e-4) * H)))
        if hh < 1:
            return
        img[:hh, c0:c1] = np.tile(cell, (H // ch + 1, 1, 1))[:hh] * (1 + rng.normal(0, 0.015, (hh, c1 - c0, 1)))

    for p_spec in panels:
        if p_spec[6] is None and (p_spec[1] - p_spec[0]) > 0.22:
            _draw_panel(p_spec, respect_bot_hem=False)

    for where, f0, f1, style, fg, bg, rep in bands:
        if where == 'bottom':
            r0, r1 = (1 - f1 / max(length, 1e-4)) * H, (1 - f0 / max(length, 1e-4)) * H
        else:
            r0, r1 = f0 / max(length, 1e-4) * H, f1 / max(length, 1e-4) * H
        r0, r1 = int(max(0, round(r0))), int(min(H, round(r1)))
        if r1 - r0 < 1:
            continue
        n_rep = max(1, int(round(circ / rep))) if rep else 1
        cw = max(2, W // n_rep)
        band_h_m = max(abs(f1 - f0), 1e-4)
        cell = motif(style, cw, r1 - r0, np.array(fg), np.array(bg if bg is not None else spec['base']), aspect=(circ / n_rep) / band_h_m)
        band_arr = np.tile(cell, (1, W // cw + 1, 1))[:, :W]
        if circ_rows is not None and rep and len(circ_rows) > 1:
            cr = np.interp(np.arange(r0, r1), np.linspace(0, max(H - 1, 1), len(circ_rows)), circ_rows)
            xs = np.arange(W)
            rows_out = np.empty((r1 - r0, W, 3), dtype=np.float64)
            for k in range(r1 - r0):
                per = W / max(1, int(round(cr[k] / rep)))          # pixels per repeat on this row
                pos = (xs % per) / per * cell.shape[1]
                i0 = np.floor(pos).astype(int) % cell.shape[1]
                i1 = (i0 + 1) % cell.shape[1]
                t = (pos - np.floor(pos))[:, None]
                rows_out[k] = cell[k, i0] * (1 - t) + cell[k, i1] * t
            band_arr = rows_out
        img[r0:r1] = band_arr * (1 + rng.normal(0, 0.015, (r1 - r0, W, 1)))

    for p_spec in panels:
        if p_spec[6] is not None:
            _draw_panel(p_spec, respect_bot_hem=False)
        elif (p_spec[1] - p_spec[0]) <= 0.22:
            _draw_panel(p_spec, respect_bot_hem=(bot_band_r < H and bot_band_r > H // 2))

    if gr is not None:
        n = gr.shape[0]
        tile = FABRIC[fab]
        ix = (np.arange(W) * (circ / max(W, 1)) / tile * n).astype(int) % n
        iy = (np.arange(H) * (length / max(H, 1)) / tile * n).astype(int) % n
        k = min(1.0, max(g, 0.02) / 0.07)
        img = img * (1 + (gr[np.ix_(iy, ix)][:, :, None] - 1) * k)
    if fab and fab.startswith('metal.'):
        u_an = np.linspace(0, 2 * np.pi, W, endpoint=False)[None, :, None]
        v_an = np.linspace(0, 1, H)[:, None, None]
        # Anisotropic cylindrical specular highlights + polished bevel rim & subtle shadow troughs for unmistakable metallic read
        spec_lobe = (
            0.28 * np.exp(-((np.sin(u_an - 0.52) - 0.78) ** 2) / 0.055)
            + 0.22 * np.exp(-((np.sin(u_an + 0.68) + 0.74) ** 2) / 0.075)
            + 0.14 * np.exp(-((np.cos(u_an) - 0.85) ** 2) / 0.085)
        )
        trough = 0.14 * (np.sin(2.0 * u_an + 0.3) ** 2)
        bevel = 0.16 * np.exp(-((v_an - 0.07) / 0.05) ** 2) + 0.10 * np.exp(-((v_an - 0.93) / 0.045) ** 2)
        tint = np.array([1.0, 0.96, 0.84])[None, None, :] if 'gold' in fab or 'bronze' in fab or 'brass' in fab else np.array([0.94, 0.97, 1.0])[None, None, :]
        img = img * (1.08 - trough) + (spec_lobe + bevel) * (0.55 * img + 0.45 * tint)
    return img.clip(0, 1)
