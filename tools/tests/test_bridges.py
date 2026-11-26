#!/usr/bin/env python3
"""The bridges (core/world/42b-world-bridges.js, the owner 2026-11-11) on a real region's ground: openworld/oidong-highrift,
whose spec asks for them (SITE_SPEC.bridges) and whose links cross the Oidong Valley's and the High Rift's rivers.

Plans the region again in node (core/world/bake_sites.py's script), lays every road and link it plans into the world
(WORLD.addRoad, as the page does from WORLD_DATA.roads), and holds the result to the module's contract, each check with
a negative:
  - the plan: every span a bridge, every deck clear of its water by 4 m, the grade held, the piers on the ground;
  - the rivers run on under the bridges: wherever a deck crosses water, the ground (WORLD.H, the roads laid) is under
    the water; the negative lays the same roads with no spans, so their fill buries the rivers again;
  - the probe's own checks (core/world/91-world-probe.js): every named river carries water to its mouth, the roads lie
    on the land at their grade off the decks;
  - the other regions are unchanged: a region that does not ask for bridges plans as before (its bake --check).

    python3 tools/tests/test_bridges.py
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'core', 'world'))
import bake_sites as B   # noqa: E402

CHECK = r'''
const P=KSITES.plan(SITE_SPEC,{dims,programs});
const roads=P.sites.flatMap(S=>S.roads).concat(P.links||[]);
const out={plan:{bridges:(P.bridges||[]).length,errors:P.errors},checks:[]};
const ok=(name,pass,neg,detail)=>out.checks.push({name,ok:!!pass&&!neg,neg:!!neg,detail});
/* 1. the plan's own bridge check, and its negative (every deck lowered to its water) */
{const K=BRIDGES.check(roads,P.bridges||[]),N=BRIDGES.check(roads,(P.bridges||[]).map(b=>Object.assign({},b,{clearance:0})));
 ok('the plan: every span a bridge, every deck clear of its water, the grade held, the piers on the ground',K.ok&&(P.bridges||[]).length>0,N.ok,
  K.ok?JSON.stringify(K.counts):K.problems.slice(0,4).join('; '));}
/* the probe's checks, read from core/world 91's source (its functions are the page's) */
const lay=list=>{WORLD_DATA.roads={format:'krator-openworld-roads',version:1,roads:[]};for(const r of list)WORLD.addRoad(r);};
const underDecks=()=>{let n=0,dry=0,first=null;for(const b of P.bridges||[])for(const p of b.deck){const w=WORLD.riverWater(p[0],p[1]);if(!(w>-1e8))continue;n++;
  if(!(w>WORLD.H(p[0],p[1])+.2)){dry++;first=first||[Math.round(p[0]),Math.round(p[1])];}}return{n,dry,first};};
/* 2. the rivers under the decks: laid with their spans, and (the negative) laid with none */
lay(roads);const A=underDecks();
lay(roads.map(r=>{const q=Object.assign({},r);delete q.spans;return q;}));const Bn=underDecks();
ok('the rivers run on under the bridges (the roads laid with their spans)',A.n>0&&A.dry===0,Bn.dry===0,
 A.n+' stations over the water, '+A.dry+' buried; with no spans '+Bn.dry+' of '+Bn.n+' buried');
lay(roads);
/* 3. the probe's rivers and highways, as the page's verify reads them */
const RV=PROBE_rivers(),HW=PROBE_highways();
ok('the probe: the named rivers carry water to their mouths, the roads laid',RV.ok,false,RV.detail);
ok('the probe: the roads lie on the land at their grade, off the decks',HW.ok,false,HW.detail);
process.stdout.write(JSON.stringify(out));
'''


def probe_fns():
    """core/world 91's rivers() and highways(), lifted out of the page's probe by their source text"""
    s = open(os.path.join(ROOT, 'core', 'world', '91-world-probe.js'), encoding='utf-8').read()
    out = []
    for name in ('rivers', 'highways'):
        i = s.index('function %s(' % name)
        depth, j, started = 0, i, False
        while True:
            c = s[j]
            if c == '{':
                depth += 1; started = True
            elif c == '}':
                depth -= 1
                if started and depth == 0:
                    break
            j += 1
        out.append(s[i:j + 1].replace('function %s(' % name, 'function PROBE_%s(' % name, 1))
    return '\n'.join(out) + '\n'


def main():
    js = B.script('oidong-highrift')
    cut = js.index('const P=KSITES.plan(')
    js = js[:cut] + probe_fns() + CHECK
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(js)
        tmp = f.name
    try:
        r = subprocess.run([B.node(), '--stack-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('test_bridges: node failed:\n' + r.stderr[-3000:])
    R = json.loads(r.stdout)
    bad = 0
    print('the plan: %d bridges%s' % (R['plan']['bridges'], ('; errors: ' + '; '.join(R['plan']['errors'][:3])) if R['plan']['errors'] else ''))
    for c in R['checks']:
        bad += 0 if c['ok'] else 1
        print(('PASS  ' if c['ok'] else 'FAIL  ') + c['name'] + '  (' + str(c['detail']) + ')' + ('  (its negative passed)' if c['neg'] else ''))
    # 4. a region that does not ask for bridges plans as before
    for region in ('xanadu-oidong-highrift', 'iziz-cluster', 'pinnacle'):
        P = B.plan(region)
        P.pop('check', None)
        old = json.load(open(os.path.join(ROOT, 'openworld', region, 'plan', 'sites.json'), encoding='utf-8'))
        same = old.get('hash') == P['hash'] and 'bridges' not in P
        bad += 0 if same else 1
        print(('PASS  ' if same else 'FAIL  ') + 'a region with no bridges asked plans as before: %s (%s)' % (region, P['hash']))
    print('\n%d FAILED' % bad if bad else '\nOK')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
