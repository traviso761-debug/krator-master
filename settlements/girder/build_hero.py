#!/usr/bin/env python3
"""Girder with a hero: the same world (build.py, every src/ fragment) plus a third-person character you order
about with the mouse, and Phil to talk to. Writes girder-hero.html; girder.html is untouched.

Adds three fragments to build.py's list (hero/README.md); the first is generated:
  88-hero-model.js  HERO_GLB: every hero/*.glb as base64, by name (hero/prep_model.py makes them from Meshy exports)
  88-hero.js        hero/88-hero.js: Styv, the body: model loading, routing on NAV, movement, clips, camera
  89-talk.js        hero/89-talk.js: the controls, the people to talk to (Phil), name tags, the dialogue box

Usage:  python3 build_hero.py [--no-checks]
        python3 build_hero.py --slim --out <page.html>
          for a host with a per-file size limit (the gallery: 16 MB): the models go in slimmed by hero/slim_glb.py
          (about 2 MB for both instead of 6; smaller textures, no normal maps), the page about 15.7 MB. Not committed.
"""
import base64, os, sys
import build            # build.py: its port lint and open-issue list run on import, as when it is run itself

HERO = os.path.join(build.HERE, 'hero')
CODE = ['88-hero.js', '89-talk.js']


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def hero_bodies():
    glbs = sorted(f for f in os.listdir(HERO) if f.endswith('.glb'))
    if '--slim' in sys.argv:
        sys.path.insert(0, HERO)
        from slim_glb import slim
    else:
        slim = lambda b: b
    rows = [" %s: '%s'" % (f[:-4], base64.b64encode(slim(open(os.path.join(HERO, f), 'rb').read())).decode()) for f in glbs]
    model = ('/* ============================== 30. HERO MODELS (generated) ==============================\n'
             '   hero/*.glb as base64, by file name (slimmed by hero/slim_glb.py in a --slim build): build_hero.py\n'
             '   writes it, hero/prep_model.py makes the GLBs. Do not edit. */\n'
             'var HERO_GLB = {\n' + ',\n'.join(rows) + '\n};\n')
    out = {'88-hero-model.js': model}
    for f in CODE:
        out[f] = open(os.path.join(HERO, f), encoding='utf-8').read()
    return out


_vb = build.virtual_bodies
build.virtual_bodies = lambda: dict(_vb(), **hero_bodies())
build.VIRTUAL |= {'88-hero-model.js'} | set(CODE)
build.OUT = os.path.abspath(arg('--out')) if arg('--out') else os.path.join(build.HERE, 'girder-hero.html')
build.MANIFEST = os.path.join(HERO, 'build-manifest.json')

if __name__ == '__main__':
    build.main()
