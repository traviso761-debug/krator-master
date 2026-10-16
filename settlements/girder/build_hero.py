#!/usr/bin/env python3
"""Girder with a hero: the same world (build.py, every src/ fragment) plus a third-person character you order
about with the mouse, and people to talk to. Writes girder-hero.html; girder.html is untouched.

Adds three fragments to build.py's list (hero/README.md); the first is generated:
  88-hero-model.js  HERO_GLB: every hero/*.glb as base64, by name (hero/prep_model.py makes them from Meshy exports),
                    and HERO_CAST: hero/cast.json (the hero, the people, the dialogue), checked here first
  88-hero.js        hero/88-hero.js: the hero's body: model loading, routing on NAV, movement, clips, camera
  89-talk.js        hero/89-talk.js: the controls, the cast, name tags, the dialogue box

Usage:  python3 build_hero.py [--no-checks]
        python3 build_hero.py --cast <draft.json> --out <page.html>     try a dialogue draft without touching hero/cast.json
        python3 build_hero.py --slim --out <page.html>
          for a host with a per-file size limit (the gallery: 16 MB): the models go in slimmed by hero/slim_glb.py
          (about 2 MB for both instead of 6; smaller textures, no normal maps), the page about 15.7 MB. Not committed.
"""
import base64, json, os, sys
import build            # build.py: its port lint and open-issue list run on import, as when it is run itself

HERO = os.path.join(build.HERE, 'hero')
CODE = ['88-hero.js', '89-talk.js']


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def check_cast(cast, models):
    """hero/cast.json against what the page has: every model a hero/*.glb, every person's talk and every go a
    conversation, every who the hero or a person, every step one of the shapes 89-talk.js plays. Returns errors."""
    errs, conv = [], cast.get('dialogue', {})
    hero = cast.get('hero') or {}
    for k in ('id', 'name', 'model'):
        if not hero.get(k):
            errs.append('hero: no %s' % k)
    if hero.get('model') and hero['model'] not in models:
        errs.append('hero: model %r is not a hero/*.glb' % hero['model'])
    ids = {hero.get('id')}
    for p in cast.get('people', []):
        tag = 'people[%s]' % p.get('id')
        for k in ('id', 'name', 'model', 'x', 'z'):
            if p.get(k) is None:
                errs.append('%s: no %s' % (tag, k))
        if p.get('id') in ids:
            errs.append('%s: id used twice' % tag)
        ids.add(p.get('id'))
        if p.get('model') and p['model'] not in models:
            errs.append('%s: model %r is not a hero/*.glb' % (tag, p['model']))
        if p.get('talk') and p['talk'] not in conv:
            errs.append('%s: talk %r is not a conversation' % (tag, p['talk']))
    for cid, steps in conv.items():
        if not isinstance(steps, list) or not steps:
            errs.append('dialogue %r: not a list of steps' % cid)
            continue
        for i, s in enumerate(steps):
            at = 'dialogue %r step %d' % (cid, i)
            known = set(s) - {'say', 'who', 'choose', 'go', 'note'}
            if known:
                errs.append('%s: unknown key(s) %s' % (at, ', '.join(sorted(known))))
            if 'say' not in s and 'choose' not in s and 'go' not in s:
                errs.append('%s: needs say, choose or go' % at)
            if s.get('who') and s['who'] not in ids:
                errs.append('%s: who %r is neither the hero nor a person' % (at, s['who']))
            if s.get('go') and s['go'] not in conv:
                errs.append('%s: go %r is not a conversation' % (at, s['go']))
            for j, c in enumerate(s.get('choose') or []):
                if not c.get('text'):
                    errs.append('%s choice %d: no text' % (at, j))
                if c.get('go') and c['go'] not in conv:
                    errs.append('%s choice %d: go %r is not a conversation' % (at, j, c['go']))
    return errs


def hero_bodies():
    glbs = sorted(f for f in os.listdir(HERO) if f.endswith('.glb'))
    cast = json.load(open(arg('--cast') or os.path.join(HERO, 'cast.json'), encoding='utf-8'))
    errs = check_cast(cast, {f[:-4] for f in glbs})
    if errs:
        sys.exit('build_hero.py: hero/cast.json:\n  - ' + '\n  - '.join(errs))
    if '--slim' in sys.argv:
        sys.path.insert(0, HERO)
        from slim_glb import slim
    else:
        slim = lambda b: b
    rows = [" %s: '%s'" % (f[:-4], base64.b64encode(slim(open(os.path.join(HERO, f), 'rb').read())).decode()) for f in glbs]
    model = ('/* ============================== 30. HERO MODELS AND CAST (generated) ==============================\n'
             '   HERO_GLB: hero/*.glb as base64, by file name (slimmed by hero/slim_glb.py in a --slim build); HERO_CAST:\n'
             '   hero/cast.json. build_hero.py writes it, hero/prep_model.py makes the GLBs. Do not edit. */\n'
             'var HERO_GLB = {\n' + ',\n'.join(rows) + '\n};\n'
             'var HERO_CAST = ' + json.dumps(cast, ensure_ascii=False, indent=1) + ';\n')
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
