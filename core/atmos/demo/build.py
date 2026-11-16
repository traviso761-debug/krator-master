#!/usr/bin/env python3
"""Build the sky demo: Krator's shared sky (core/atmos/sky/, SKY-PLAN.md step S0) on one page.

    python3 build.py [--out dist/sky-demo.html]

The page shows the standard preset at any hour, date and site, with the controls the owner judges the sky by: the
hour and the date (Jimjam's months and counts), the site (the scale model's pixel), the air's pressure, cloud cover,
weather, and preset views (game start at sunrise, a winter midnight under the Pleiades, a summer night without them,
the next eclipse, the Double Dark). A chrome sphere shows the sky's light (ATMOS.skylight) on standard materials.
Nothing here is a runtime dependency: the page is a viewer. three.js r128 is inlined from a local copy. Deterministic.
"""
import argparse, base64, io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATMOS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(ATMOS))

FRAGMENTS = [
    os.path.join(ROOT, 'core', 'shader', '06-core-khook.js'),
    os.path.join(ROOT, 'core', 'shader', '06b-core-kcolor.js'),
    os.path.join(ROOT, 'core', 'clock', '20-core-clock.js'),
    os.path.join(ATMOS, '89-atmos-0-core.js'),
    os.path.join(ATMOS, '89-atmos-0p-presets.js'),
    os.path.join(ATMOS, '89-atmos-b-skylight.js'),
    os.path.join(ATMOS, 'sky', '89-atmos-e-skymodel.js'),
    os.path.join(ATMOS, 'sky', '89-atmos-f-skypresets.js'),
    os.path.join(ATMOS, 'sky', '89-atmos-g-sky.js'),
    os.path.join(ATMOS, 'sky', '89-atmos-j-fog.js'),          # the height fog and its mist field (#smog=1)
    os.path.join(ATMOS, 'sky', '89-atmos-k-cloudmood.js'),    # the clouds' mood: the shifting episodes (#mood=)
    os.path.join(ATMOS, 'host', '89-atmos-h-skyhost.js'),
    os.path.join(ATMOS, 'host', '89-atmos-j-heightfog.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-lightning.js'),    # the mood's lightning strikes its bolts through this
    os.path.join(ATMOS, 'fx', '89-atmos-fx-radiation.js'),    # the radiation glow (two zones, the Radiation switch)
    os.path.join(ROOT, 'core', 'audio', '24-core-audio-sky.js'),   # the light effects heard (KSKYSOUND: the stand-in synth until the clips are wired)
    os.path.join(HERE, 'src', '10-demo.js'),
]


def find_three():
    for c in (os.path.join(ROOT, 'kits', 'ancients', 'three.min.js'), os.path.join(ROOT, 'kits', 'ringsea', 'three.min.js')):
        if os.path.isfile(c) and os.path.getsize(c) > 100000:
            return c
    sys.exit('build.py: no local three.min.js (r128) found (an LFS pointer is not enough: git lfs pull)')


MOONS = ['companion', 'week', 'thirteen', 'day', 'two-day', 'four-day']   # ATMOS.SKY.moons order


def moon_atlas():
    """The six moon maps (core/materials/library/sky.moon.*) stacked into one 512x1536 JPEG, a 2:1 row a moon, as a data URL."""
    from PIL import Image
    W, H = 512, 256
    atlas = Image.new('RGB', (W, H * len(MOONS)))
    for i, m in enumerate(MOONS):
        p = os.path.join(ROOT, 'core', 'materials', 'library', 'sky.moon.' + m, 'albedo.jpg')
        if os.path.getsize(p) < 1000:
            sys.exit('build.py: %s is an LFS pointer (git lfs pull)' % p)
        atlas.paste(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS), (0, H * i))
    b = io.BytesIO()
    atlas.save(b, 'JPEG', quality=86, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'sky-demo.html'))
    a = ap.parse_args()
    js = 'var SKY_MOON_ATLAS="' + moon_atlas() + '";\n' + '\n'.join('// ---- ' + os.path.relpath(p, ROOT).replace(os.sep, '/') + '\n' + read(p) for p in FRAGMENTS)
    page = read(os.path.join(HERE, 'src', '00-head.html')).replace('/*THREE*/', read(find_three())).replace('/*JS*/', js)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(page)
    print('wrote', os.path.relpath(a.out, ROOT).replace(os.sep, '/'), '%.0f KB' % (len(page.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
