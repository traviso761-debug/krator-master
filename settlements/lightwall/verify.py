#!/usr/bin/env python3
"""Headless verification of Laitwal, the Light Wall. The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the town's own:

  town-laid           the bench laid on core/city with no error (frontage-courts on the built blocks), the landmarks placed
                      (the assay house, the factor's house, the bazaar, the quays, the caravanserai, the monastery)
  wall-drawn          every Glazier site drawn through TG.gz.draw (none missing, no TG error), the carved quarter's rock carved
                      (KCAVERN) and the outer wall's sites as fronts on whole rock; the main stair climbs three bands
  wall-carved         at each carved site the rock is open at its first room's centre and solid behind its back wall
                      (TG.gz.check.carved): the void plan is the one source
  wall-tags           every Glazier site registered in core/tags with culture glazier before it was drawn
  half-and-half       the people: about 2,500 in the wall and about 2,500 on the bench (PLAN.md 2), each within 25 %
                      (reported as a budget until the owner calibrates it)
  lights-of-the-wall  the Glaziers' lamps as light records (the moonglass and the lamp code), over 200

    KRATOR_GL=gpu python3 verify.py dist/lightwall.html --assert --views "Overview,From the lake,The Stair Foot"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
{const T=window._lightwall||{},W=T.wall||{},by=T.byKind||{};
 const marks=['assay','factor','bazaar','quay','caravanserai','monastery'].filter(k=>!by[k]);
 R.push({name:'town-laid',ok:!T.err&&T.lots>150&&!marks.length,detail:T.err?('the bench did not lay: '+T.err):(T.lots+' lots on '+(T.blocks-T.fields)+' built blocks ('+T.fields+' fields), '+T.placed+' placed ('+JSON.stringify(by)+')'+(marks.length?'; missing '+marks.join(', '):''))});
 const stairs=(typeof LW_WALL!=='undefined'?LW_WALL:[]).filter(s=>s.key==='gz-stair'&&s.band>=0&&s.band<3&&Math.abs(s.x)<1).length;
 R.push({name:'wall-drawn',ok:W.drawn===W.sites&&!Object.keys(W.missing||{}).length&&!(W.errors||[]).length&&W.carved>40&&W.facade>100&&W.rock&&W.rock.cavern&&W.rock.cavern.tris>1000&&stairs===3,
  detail:(W.drawn||0)+' of '+(W.sites||0)+' sites drawn ('+(W.carved||0)+' carved, '+(W.facade||0)+' fronts on whole rock), '+(W.tris||0)+' triangles of fronts, the rock '+(W.rock?W.rock.tris+' triangles ('+(W.rock.cavern?W.rock.cavern.chunks+' cavern chunks, built '+W.rock.buildMs+' ms':'no cavern')+')':'none')+', the main stair '+stairs+' flights of bands'+((W.errors||[]).length?'; TG errors: '+W.errors.join(' | '):'')});
 const C=(typeof LW_ROCK!=='undefined'&&LW_ROCK.C)?TG.gz.check.carved(LW_ROCK.C,LW_CARVED):{ok:false,bad:['no cavern'],n:0};
 R.push({name:'wall-carved',ok:C.ok,detail:C.n+' carved sites: open in the first room, rock behind its back wall'+(C.bad.length?'; '+C.bad.slice(0,4).join(' | '):'')});
 const tg=KTAGS.page?KTAGS.page.query({'class':'building',tags:{culture:'glazier'}}):[];
 R.push({name:'wall-tags',ok:tg.length===(W.sites||-1),detail:tg.length+' records of culture glazier for '+(W.sites||0)+' sites'});
 const P=T.people||{},ok=k=>Math.abs((P[k]||0)-2500)<=625;
 R.push({name:'half-and-half',ok:ok('wall')&&ok('bench'),budget:true,detail:'the wall '+(P.wall||0)+', the bench '+(P.bench||0)+' (each ~2,500), total '+(P.total||0)});
 R.push({name:'lights-of-the-wall',ok:(W.lights||0)>200,detail:(W.lights||0)+' light records from the Glaziers\' lamps'});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + TOWN_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}

if __name__ == '__main__':
    import argparse, asyncio
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--strict-budget", dest="strict_budget", action="store_true")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append")
    ap.add_argument("--size", default="1280x800")
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--interiors", action="store_true")
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
