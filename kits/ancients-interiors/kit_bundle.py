#!/usr/bin/env python3
"""The Ancients interiors core for another build: kit_bundle.bundle() -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/ancients-interiors'); import kit_bundle as ai_bundle
    js = ai_bundle.bundle()

The text is this kit's engine-neutral core (src/10-49): the global KratorAncientsInteriors. Load it AFTER kits/interiors'
bundle (kits/interiors/kit_bundle.py), then call KratorAncientsInteriors.install(KratorInteriors) once.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def read(p):
    with open(os.path.join(HERE, p), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline-safe: no script tag may appear in the text, not even in a comment (kits/interiors/kit_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files():
    return ['src/' + f for f in sorted(os.listdir(os.path.join(HERE, 'src'))) if f[0].isdigit() and f.endswith('.js') and f < '50']


def bundle():
    return safe('/* kits/ancients-interiors bundle (kit_bundle.py): KratorAncientsInteriors. GENERATED; edit kits/ancients-interiors. */\n') + \
        ''.join('/* ---- kits/ancients-interiors/%s ---- */\n%s\n' % (f, read(f)) for f in files())


if __name__ == '__main__':
    print(len(bundle()))
