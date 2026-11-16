"""The checks every open-world region's verify.py shares for core/world's resources and site proposals (49r, 89r, 93).

    import verify_world as VW          (sys.path: core/world)
    await VW.resources(pg, V, out_dir, fails)

Runs, each with its negative: the region's geology loaded and read by the census (negative: a census that finds no
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
