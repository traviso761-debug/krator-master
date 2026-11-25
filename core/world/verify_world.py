"""The checks every open-world region's verify.py shares for core/world's resources and site proposals (49r, 89r, 93).

    import verify_world as VW          (sys.path: core/world)
    await VW.resources(pg, V, out_dir, fails)
    await VW.negatives(pg, has, fails)    (after the region's hostChecks: the world's negatives, each must fail)

resources() runs, each with its negative: the region's geology loaded and read by the census (negative: a census that finds no
family); every marker of the richest spots inside the region (negative: the markers moved off the map); the proposal tool
places and assesses a point on its own map pixel (negative: the pixel read 5 px off). Then opens the resources panel and
takes its shot (out_dir/resources.png), so the panel, its map and census are seen on the GPU."""
import os


def say(r, neg=None):
    if neg is None:
        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
        return not r['ok']
    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') ' + r['name'] + ' : ' + r['detail'])
    return r['ok']


# what a world negative (91 hostNegatives) needs of the region before it can break its check (as each region's APPLIES
# for hostChecks): a name's prefix -> the HAS keys it needs (a key 'a|b' is either)
NEG_NEEDS = {'negative: a tile seeded by Math.random': ('kits',), 'negative: a tree put under the water': ('kits',),
             'negative: a tree put outside the polygon': ('kits',), 'negative: a tree put at the foot of another': ('kits',),
             'negative: a river with its water taken away': ('rivers',),
             'negative: a highway read 2 m high, rising 1 m a step': ('roads',),
             'negative: a tree put on a highway and one in a town': ('kits', 'roads|towns')}


async def negatives(pg, has, fails):
    """The world's own negatives (core/world/91-world-probe.js hostNegatives, round the camera as hostChecks read it):
    each a broken input its check must refuse, so each must come back not ok (2026-11-24, Stage 8 B7, S3-26: no region's
    verify ran them). A negative whose check the region has nothing for (HAS: no kits, rivers, roads or towns) is n/a,
    as is one the probe could not build (its name says 'the control cannot run')."""
    print("--- the world's negatives (core/world/91-world-probe.js hostNegatives: each must fail) ---")
    if not await pg.evaluate("!!(window._api&&typeof _api.hostNegatives==='function')"):
        print('  FAIL  _api.hostNegatives is not on the page')
        fails.append('world negatives: not on the page')
        return
    for r in await pg.evaluate('_api.hostNegatives()'):
        need = next((v for k, v in NEG_NEEDS.items() if r['name'].startswith(k)), ())
        lack = [n for n in need if not any(has.get(a) for a in n.split('|'))]
        if lack:
            print('  n/a   ' + r['name'] + ' : this region has no ' + ' or '.join(lack[0].split('|')) + ' yet')
            continue
        if 'the control cannot run' in r['name']:
            print('  n/a   ' + r['name'] + ' : ' + r['detail'])
            continue
        print(('  PASS  ' if not r['ok'] else '  MISSED') + ' ' + r['name'] + ' : ' + r['detail'])
        if r['ok']:
            fails.append(r['name'] + ' (passed)')


async def resources(pg, V, out_dir, fails):
    print('--- the resources and the proposal tool (core/world 49r, 89r, 93) ---')
    if not await pg.evaluate('!!(window._resources&&window._propose)'):
        print('  FAIL  the resources panel or the proposal tool is not on the page')
        fails.append('resources: not on the page')
        return
    for r in await pg.evaluate('_resources.checks()'):
        if say(r): fails.append(r['name'])
    for neg, key in (('geology', 'geology'), ('markers', 'richest spots')):
        r = [x for x in await pg.evaluate('_resources.checks(%r)' % neg) if key in x['name']][0]
        if say(r, neg): fails.append('negative ' + neg)
    r = await pg.evaluate('_propose.check()')
    if say(r): fails.append(r['name'])
    r = await pg.evaluate("_propose.check('px')")
    if say(r, 'px'): fails.append('negative proposal px')
    await pg.evaluate('_resources.open()')
    await pg.evaluate('_api.settle(120000)')
    out = os.path.join(out_dir, 'resources.png')
    await V.shot(out, view='resources')
    print('resources panel: ' + out)
