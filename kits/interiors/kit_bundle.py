#!/usr/bin/env python3
"""The interiors core for another build: kit_bundle.bundle(sets) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/interiors'); import kit_bundle
    js = kit_bundle.bundle(['highlands'])

The text is the engine-neutral core (src/10-49: ROOM, furnishRoom, planBuilding, the sets,
the life layer; globals KratorInteriors, ROOM, furnishRoom), adapters/runtime-adapter.js (furnish
into a KratorFurniture batch: kits/catalog/furniture_bundle.py) and the named interior sets
(sets/<name>.js). Load it AFTER the furniture bundle. A building is then furnished with
KratorInteriors.sets.furnish(item, x, z, ry, IX.runtimeAdapter(KratorFurniture, batch), { baseY }).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def read(p):
    with open(os.path.join(HERE, p), encoding='utf-8') as fh:
        return fh.read()


def files(sets=None):
    core = ['src/' + f for f in sorted(os.listdir(os.path.join(HERE, 'src'))) if f[0].isdigit() and f.endswith('.js') and f < '50']
    ss = ['sets/' + f for f in sorted(os.listdir(os.path.join(HERE, 'sets'))) if f.endswith('.js') and (sets is None or f[:-3] in sets)]
    return core + ['adapters/runtime-adapter.js'] + ss


def bundle(sets=None):
    return ('/* kits/interiors bundle (kit_bundle.py): the core, the runtime adapter, sets %s. GENERATED; edit kits/interiors. */\n'
            % (', '.join(sets) if sets else 'all')) + ''.join('/* ---- kits/interiors/%s ---- */\n%s\n' % (f, read(f)) for f in files(sets))


if __name__ == '__main__':
    import sys
    print(len(bundle(sys.argv[1:] or None)))
