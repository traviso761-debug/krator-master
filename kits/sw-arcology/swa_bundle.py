#!/usr/bin/env python3
"""The SW Arcology Vassal kit (plus Post-Apoc base + Scrap Voth closure) for Drum and Torus.

Usage:
    import sys; sys.path.insert(0, '<repo>/kits/sw-arcology'); import swa_bundle
    js_swa = swa_bundle.bundle()                # KratorPostApoc with all 32 swa-* + post-apoc defs + vassal cultures
    js_vs  = swa_bundle.voth_scrap_bundle()     # KratorVothScrap closure with all 19 voth_scrap_* defs
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ROOT = os.path.dirname(os.path.dirname(HERE))
PA_DIR = os.path.join(ROOT, 'kits', 'post-apoc')
CAT_CORE = os.path.join(ROOT, 'core', 'catalog', 'krator-furniture-core.js')
VOTH_SCRAP = os.path.join(HERE, 'voth-scrap.js')

DEFAULT_PA_DEFS = (
    '40-dw-small.js',
    '42-lg-dwell.js',
    '44-civic.js',
    '46-shops.js',
    '48-industry.js',
    '50-farm.js',
    '52-defence.js',
    '54-compound.js',
    '56-arena.js',
    '58-dock.js',
    '53-barricade.js',
)

SWA_EXTRA = (
    os.path.join(SRC, '33-swa-parts.js'),
    os.path.join(SRC, '60-swa-small.js'),
    os.path.join(SRC, '62-swa-medium.js'),
    os.path.join(SRC, '64-swa-large.js'),
    os.path.join(SRC, '81-swa-cultures.js'),
)


def _safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def bundle(defs=DEFAULT_PA_DEFS):
    """Return the KratorPostApoc bundle with Post-Apoc defs + all 32 SW Arcology defs + vassal cultures."""
    if PA_DIR not in sys.path:
        sys.path.insert(0, PA_DIR)
    import apoc_bundle
    return apoc_bundle.bundle(defs, extra=SWA_EXTRA)


def voth_scrap_bundle():
    """Return the KratorVothScrap closure (krator-furniture-core.js + kits/sw-arcology/voth-scrap.js)."""
    core_js = open(CAT_CORE, encoding='utf-8', newline='').read()
    vs_js = open(VOTH_SCRAP, encoding='utf-8', newline='').read()
    body = (
        "/* KratorVothScrap closure (krator-furniture-core.js + voth-scrap.js; generated, edit source files) */\n"
        "var KratorVothScrap = (function () {\n"
        "  const scene = { add: function () {}, remove: function () {} };\n"
        + core_js + "\n\n"
        + vs_js + "\n"
        "  _LOD = 0.65;\n"
        "  return {\n"
        "    get: function (k) { return ASSET_BY_KEY[k] || null; },\n"
        "    keys: function () { return Object.keys(ASSET_BY_KEY); },\n"
        "    buildProto: function (key, variant, seed) {\n"
        "      return buildAsset(key, 0, 0, 0, { variant: variant == null ? 0 : variant, seed: seed == null ? 1 : seed, wealth: 0.5, y: 0 });\n"
        "    }\n"
        "  };\n"
        "})();\n"
    )
    return _safe(body)


if __name__ == '__main__':
    print('swa_bundle:', len(bundle()), 'voth_scrap_bundle:', len(voth_scrap_bundle()))
