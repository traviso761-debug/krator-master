#!/usr/bin/env python3
"""Extract Scale Model 5.1 survey raster & site blueprint for Kōpa-Dīga / Arcodiga (settlements/arcodiga).

Reads tools/scale-model/model/data/{model.json,h.png} around Kopa-North (px 89, 604) and the southern
basalt gorge-throat (px 88.5, 608) at 1:1 (2,000 m/px) and writes site/arcodiga-site.json so both Python
audit scripts and runtime fragments share one deterministic survey record.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
DATA_DIR = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
OUT_PATH = os.path.join(HERE, 'site', 'arcodiga-site.json')


def sample_scale_model():
    model_path = os.path.join(DATA_DIR, 'model.json')
    h_path = os.path.join(DATA_DIR, 'h.png')
    if not (os.path.isfile(model_path) and os.path.isfile(h_path)):
        return None
    with open(model_path, encoding='utf-8') as fh:
        meta_raw = json.load(fh)
    kv = {e['key']: e.get('value') for e in meta_raw.get('keys', []) if 'key' in e}
    lo = float(kv.get('lo', -2600.0))
    hi = float(kv.get('hi', 27000.0))

    from PIL import Image
    im = Image.open(h_path)
    x0, x1 = 83, 95
    y0, y1 = 598, 613
    grid = []
    wet = []
    for py in range(y0, y1 + 1):
        row_h = []
        row_w = []
        for px in range(x0, x1 + 1):
            r, g, b = im.getpixel((px, py))[:3]
            u16 = (r << 8) | g
            elev = round(lo + (u16 / 65535.0) * (hi - lo), 1)
            row_h.append(elev)
            row_w.append(1 if b > 127 else 0)
        grid.append(row_h)
        wet.append(row_w)
    return {
        'pxBox': [x0, y0, x1, y1],
        'cellM': 2000.0,
        'centerPx': [88.5, 608.0],
        'lagoonCenterPx': [89.0, 604.0],
        'elevGridM': grid,
        'wetMask': wet,
    }


def build_blueprint():
    raster = sample_scale_model()
    return {
        'id': 'arcodiga',
        'names': {
            'ancient': 'Arcodiga',
            'hueruKuran': 'Kōpa-Dīga',
            'eternianPaper': 'Dī-Gā Wài-Sī',
            'eternianLowland': 'Dò-gā-pò',
            'farportCreole': 'qDī-gā cMā-pò',
        },
        'regionId': 'rmw4wknusgc7h',
        'subregion': 'crookshore',
        'pinPx': [89, 604],
        'throatPx': [88.5, 608.0],
        'farportPx': [248, 585],
        'atm': 1.60,
        'rainMm': 1725,
        'koppen': ['Cfa', 'Am'],
        'tsunamiTrimlineM': 65.0,
        'arcologyDatumY': -95.0,
        'arcologySpanM': 1460.0,
        'arcologyWingSpanM': 2040.0,
        'population': {
            'total': 3400,
            'households': 715,
            'hueruKuran': 2450,
            'eternian': 950,
            'eastWingEnclave': 420,
            'seRimCantonment': 530,
        },
        'resources': {
            'jade': 200,
            'coal': 209,
            'tin': 200,
            'iron': 180,
            'silica': 150,
            'wood': 255,
        },
        'scaleModelPatch': raster,
    }


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    bp = build_blueprint()
    with open(OUT_PATH, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(bp, fh, indent=2, ensure_ascii=False)
        fh.write('\n')
    print('wrote %s (lagoon min %.1f m, rim max %.1f m)' % (
        os.path.relpath(OUT_PATH, ROOT).replace(os.sep, '/'),
        min(min(r) for r in bp['scaleModelPatch']['elevGridM']) if bp['scaleModelPatch'] else -95.0,
        max(max(r) for r in bp['scaleModelPatch']['elevGridM']) if bp['scaleModelPatch'] else 200.0,
    ))


if __name__ == '__main__':
    main()
