#!/usr/bin/env python3
"""The owner's before-and-after pairs for tier 2 (STAGE-8/G-weather.md: W5, the weather cells; W6, the volumetric clouds),
made on copies of the pages, so no build's sources or committed pages change.

  KRATOR_GL=gpu KRATOR_GPU_LANE=arc python3 core/atmos/pairs/pairs.py [--pages shighlands,throne,wouterwall] [--views 2]
                                              [--cover 0.6] [--settle 5000] [--keep] [--no-build] [--out core/atmos/pairs/shots]

(each page load takes the lane itself; the builds run outside it.) For each page: its build runs (the page as the current
core makes it), the page is copied beside itself as <page>.wx.html with the W5 and W6 files spliced in after the last of
the page's own atmos host files it inlines, and the committed page is put back (git checkout). bindWeather is wrapped (a
setter, whatever the files' order) to pass cells:true, so the moving weather joins the page's Weather selector as 'live'.

Each copy is loaded three times: ?clouds=layers (the sky as it is: the 'before'), ?clouds=volumes (the 'after'), both at
?weather=clear with the cover set to --cover (the preset's clouds.cover: many pages open on a near-clear sky, which shows
no cloud either way), and ?clouds=volumes&weather=live (the cells' own weather and cover) on the first view. The step-down's
budget is set out of reach, so the tier is the one asked for. Each of up to --views preset views (KHOST.go; the PAGES table
names the sky views) is shot as the page frames it and turned up at the horizon from the same eye (10 degrees up):
<out>/<page>/<view>[-sky]-<tier>.png. pairs.json records the tier, the calls and triangles, the cover and the weather.
No GPU timing here (shoot()'s docstring says why): the passes' cost is the weather demo's. --keep leaves the .wx.html copies
in each dist/ (untracked) to open; shots are not committed (.gitignore).

The open world (core/world) draws its own SKY and never calls ATMOS.sky, so no open-world pair can be made until it is moved
onto the shared sky (reported, not done here).
"""
import argparse, asyncio, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATMOS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(ATMOS))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

# name: (build folder, build args, page in dist/, the preset views to shoot (KHOST's names; None: the first --views)
PAGES = {
    'shighlands': ('biomes/shighlands', [], 'shighlands.html',          # the cloud sea
                   ['Above the cloud sea', 'Up the face from the cloud', 'The paramo']),
    'throne': ('biomes/throne', [], 'throne.html',                       # station 1, at its triangle ceiling
               ['The plume', 'The rift from above', 'The new cone, steaming']),
    'wouterwall': ('biomes/wouterwall', [], 'wouterwall.html', None),    # an outer wall: high ground, the cloud's base near
}
HOSTS = ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js', '89-atmos-c-hostbind.js']
X = lambda *p: os.path.join(ATMOS, *p)
# what the copy gains, in this order (volclouds after the sky's chunk, which every page has; the hosts wrap ATMOS.sky and
# take bindWeather's cells; the lightning and the splashes only if the page has not got them)
SPLICE = [X('sky', '89-atmos-m-volclouds.js'), X('host', '89-atmos-m-volhost.js'),
          ('fx', X('fx', '89-atmos-fx-lightning.js')), ('fx', X('fx', '89-atmos-fx-raincover.js')),
          X('wx', '89-atmos-wx-cells.js'), X('wx', '89-atmos-wx-host.js')]
# the cells on: bindWeather wrapped to pass cells:true whenever the weather's host defines it (before or after this point)
CELLS_ON = ("/* pairs.py: the weather cells on this copy */(function(){const A=ATMOS,wrap=b=>typeof b!=='function'||b.pairs?b:"
            "Object.assign(function(o){return b.call(this,Object.assign({cells:true},o||{}));},{pairs:true});let cur=wrap(A.bindWeather);"
            "Object.defineProperty(A,'bindWeather',{configurable:true,enumerable:true,get:()=>cur,set:f=>{cur=wrap(f);}});})();\n")


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True, encoding='utf-8')


def build(folder, args):
    """Run the build; return the tracked files it changed (to put back) and the untracked ones it made (to remove)."""
    before = set(git('status', '--porcelain', '--', folder).stdout.splitlines())
    p = subprocess.run([sys.executable, 'build.py'] + args, cwd=os.path.join(ROOT, folder), capture_output=True, text=True, encoding='utf-8')
    if p.returncode != 0:
        raise RuntimeError('%s build failed:\n%s' % (folder, (p.stdout + p.stderr)[-1500:]))
    after = git('status', '--porcelain', '--', folder).stdout.splitlines()
    new = [l for l in after if l not in before]
    return [l[3:] for l in new if not l.startswith('??')], [l[3:] for l in new if l.startswith('??')]


def splice(page_text):
    """The copy's text: the W5/W6 files after the last atmos host file the page inlines (verbatim, as the build read it)."""
    end = -1
    for h in HOSTS:
        t = read(X('host', h)).strip()
        i = page_text.find(t)
        if i >= 0:
            end = max(end, i + len(t))
    if end < 0:
        raise RuntimeError('none of the atmos host files is inlined verbatim: is the page built from this checkout?')
    add = []
    for s in SPLICE:
        if isinstance(s, tuple):
            t = read(s[1])
            if t.strip().splitlines()[0] in page_text:
                continue
            s = s[1]
        add.append(read(s).strip())
    if 'A.volOn=true' in page_text or 'A.wxOn=true' in page_text:
        raise RuntimeError('the page already lists the volumes or the cells')
    return page_text[:end] + '\n' + '\n'.join(add) + '\n' + CELLS_ON + page_text[end:]


# the view turned up at the horizon from the same eye (10 degrees up): where the clouds are
SKY_POSE = """(v)=>{let at=KHOST.host.views[v];if(typeof at==='function')at=at();if(!at)return false;const dx=at[3]-at[0],dz=at[5]-at[2],l=Math.hypot(dx,dz)||1;
 KHOST.setView(at[0],at[1],at[2],at[0]+dx/l*2000,at[1]+352,at[2]+dz/l*2000);return true;}"""
STATS = """()=>{const V=typeof ATMOS!=='undefined'?ATMOS.vol:null,r=KHOST.host.renderer;
 return{tier:V?V.tier:null,ms:V&&V.ms!=null?+V.ms.toFixed(3):null,compileMs:V?V.compileMs:null,log:V?V.log.slice():[],tris:r.info.render.triangles,calls:r.info.render.calls,
 cover:ATMOS.skyCur?+ATMOS.skyCur.uniforms.uCloud.value.x.toFixed(3):null,wx:ATMOS.W?{mode:ATMOS.W.mode,rain:+(ATMOS.W.rain||0).toFixed(3),fog:+(ATMOS.W.fog||0).toFixed(3)}:null}}"""


async def shoot(name, html, here, want, a, R):
    """Per tier: each view as the page frames it, then turned up at the sky; the cover set to --cover on both tiers (the
    page's own is often a clear sky, which shows no cloud either way); no GPU timing here: on these 19-21 M triangle pages
    the Arc's timer queries stall the page (a forced frame loop hung the Throne, a passes-only loop shighlands), and the whole
    frame is noise at +-4 ms. The cloud passes are full-screen passes at a fixed resolution, independent of the world under
    them: their cost is the weather demo's (core/atmos/wxdemo/verify.py --timing on the arc lane, the same 1280x800)."""
    out = os.path.join(a.out, name)
    os.makedirs(out, exist_ok=True)
    rec = {}
    for tier, weather in (('layers', 'clear'), ('volumes', 'clear'), ('volumes', 'live')):
        q = '?clouds=%s&weather=%s' % (tier, weather)
        async with _h.verify_page(html, here=here, query=q) as V:
            pg = V.page
            have = await pg.evaluate("()=>typeof KHOST!=='undefined'&&KHOST.host?Object.keys(KHOST.host.views):[]")
            views = [v for v in (want or []) if v in have][:a.views] or have[:a.views]
            R.append(('%s %s/%s: the page has its preset views' % (name, tier, weather), bool(views), json.dumps(have[:8])))
            if weather != 'clear':
                views = views[:1]
            err = await pg.evaluate("()=>{const e=document.getElementById('errs')||document.getElementById('err');return e?e.textContent:''}")
            R.append(('%s %s/%s: the error panel is empty' % (name, tier, weather), not err, (err or '')[:300]))
            # the tier held by a budget out of reach: the volumes' own timer runs (it runs only with the step-down on), nothing steps
            await pg.evaluate("()=>{if(ATMOS.vol)ATMOS.vol.cfg.budget=1e9;}")
            if a.cover is not None and weather == 'clear':
                await pg.evaluate("(c)=>{if(ATMOS.skyCur)ATMOS.skyCur.preset.clouds.cover=c;}", a.cover)
            tag = tier if weather == 'clear' else 'volumes-live'
            for v in views:
                for pose in ('view', 'sky'):
                    if pose == 'view':
                        await pg.evaluate("(v)=>KHOST.go(v)", v)
                    else:
                        await pg.evaluate(SKY_POSE, v)
                    await pg.wait_for_timeout(a.settle)
                    fn = '%s%s-%s.png' % (v.replace(' ', '_').replace('/', '-').replace(',', ''), '-sky' if pose == 'sky' else '', tag)
                    await V.shot(os.path.join(out, fn), view='%s %s %s' % (v, pose, tag))
                    st = await pg.evaluate(STATS)
                    rec['%s|%s|%s' % (v, pose, tag)] = st
                    print('%s %s %s %s: %s' % (name, v, pose, tag, json.dumps(st)), flush=True)
            if tier == 'volumes' and weather == 'clear':
                tiers = {k: s['tier'] for k, s in rec.items() if k.endswith('|volumes')}
                R.append(('%s: the volumes draw (tier held at volumes)' % name, all(t == 'volumes' for t in tiers.values()), json.dumps(tiers)))
                calls = {k: s['calls'] for k, s in rec.items() if k.endswith('|volumes')}
                R.append(('%s: the page counts its world at volumes (not the composite alone)' % name, all((c or 0) > 1 for c in calls.values()), json.dumps(calls)))
        R.extend(('%s %s/%s: %s' % (name, tier, weather, n), ok, d) for n, ok, d in V.universal if not ok)
    return rec


async def run(a):
    R, J = [], {}
    names = [n.strip() for n in a.pages.split(',') if n.strip()]
    made = []
    try:
        for n in names:
            folder, args, page, want = PAGES[n]
            dist = os.path.join(ROOT, folder, 'dist')
            copy = os.path.join(dist, page[:-5] + '.wx.html')
            if not a.no_build:
                changed, new = build(folder, args)
                text = read(os.path.join(dist, page))
                if changed:
                    git('checkout', '--', *changed)
                for f in new:
                    if os.path.isfile(os.path.join(ROOT, f)):
                        os.remove(os.path.join(ROOT, f))
                print('%s: built; put back %d committed file(s), removed %d new' % (n, len(changed), len(new)))
            else:
                text = read(os.path.join(dist, page))
            with open(copy, 'w', encoding='utf-8', newline='\n') as f:
                f.write(splice(text))
            made.append(copy)
            J[n] = await shoot(n, copy, os.path.join(ROOT, folder), want, a, R)
    finally:
        if not a.keep:
            for c in made:
                if os.path.isfile(c):
                    os.remove(c)
    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(a.out, 'pairs.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(J, f, indent=1)
    bad = [r for r in R if not r[1]]
    for name, ok, d in R:
        print('%s %s%s' % ('PASS' if ok else 'FAIL', name, (' : ' + d) if d and not ok else ''))
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pages', default=','.join(PAGES))
    ap.add_argument('--views', type=int, default=3)
    ap.add_argument('--settle', type=int, default=4000, help='ms after a view is chosen (the volumes\' history converges)')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--cover', type=float, default=.6, help='the cloud cover on both tiers (the preset clouds.cover); -1 keeps the page own')
    ap.add_argument('--keep', action='store_true')
    ap.add_argument('--no-build', action='store_true')
    a = ap.parse_args()
    if a.cover is not None and a.cover < 0:
        a.cover = None
    sys.exit(asyncio.run(run(a)))


if __name__ == '__main__':
    main()
