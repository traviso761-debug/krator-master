#!/usr/bin/env python3
"""The Dilihan vassal-city building kit (kits/dilihan/README.md; settlements/iziz/VASSAL-KITS.md).

Built on the Iziz Vernacular contract (`VERN.def`, `vn*` helpers, `VPAL.orange` 0xe07a2a trim, seed block 9801..9999) for
Dilihan / Dellu-Handu (pin solqo7hz7s, px 744, py 663; -888.6 m ASL, 1.79 atm, Am tropical monsoon on the southern bench of
the Cut): local kiln-fired red and terracotta-orange brick (kin to Jimjam) with evaporative impluvium courtyards, dogtrot /
zaguan breezeways, perforated red-brick jali screens, propped jalousie louver shutters, taut Iziz-orange & linen shade-sails,
deep monsoon eaves, and raised clerestory monitor / malqaf roofs.

A settlement or sheet takes the kit in place:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'dilihan'))
    import dilihan as kdil
    paths.update({f: p for f, p in kdil.paths().items() if f not in paths})

When a settlement already loads `settlements/jimjam` and `kits/iziz-vernacular` texture packs, bind the kit's `MAT.dl*`
materials directly onto `'jimjam'` via `KMAT.bindMat('jimjam', MAT, {alias: kdil.JIMJAM_MAT_ALIAS})` for zero extra texture weight.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ROOT = os.path.dirname(os.path.dirname(HERE))

BASE = ['69r-dil-mat.js', '69s-dil-helpers.js']
BUILDINGS = ['70d-dil-dwell.js', '71d-dil-trade.js', '72d-dil-civic.js']
TRADES = ['73d-dil-trades.js']
FILES = BASE + BUILDINGS + TRADES

# Alias map so a host world that already carries the Jimjam texture pack binds MAT.dl* with zero duplicate .webp bytes
JIMJAM_MAT_ALIAS = {
    'dlBrick': 'brick',
    'dlBrickDeep': 'brickDeep',
    'dlBrickBand': 'bandBrick',
    'dlBrickOchre': 'brickYellow',
    'dlLaterite': 'brickDark',
    'dlMortar': 'marble',
    'dlTile': 'domeTerracotta',
}


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    """This kit's own fragments (69r..73d), ready to layer after kits/iziz-vernacular's foundation (69b..69e5)."""
    return {f: path(f) for f in (FILES if names is None else names)}


def full_paths(include_vern_buildings=False):
    """The Iziz Vernacular foundation (and optionally its 70..74z buildings for a Mixed Street sheet) plus this kit's files."""
    import importlib.util
    vern_dir = os.path.join(ROOT, 'kits', 'iziz-vernacular')
    spec = importlib.util.spec_from_file_location('vernacular', os.path.join(vern_dir, 'vernacular.py'))
    kvern = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kvern)
    out = kvern.paths(kvern.FILES if include_vern_buildings else kvern.BASE)
    out.update(paths())
    return out
