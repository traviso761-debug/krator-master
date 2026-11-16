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
  ix-bench            L4: the houses round the Stair Foot built with the Xanadu kit's interiors (hollow walls, planned and
                      furnished rooms), over half of those within its radius, with rooms and pieces
  ix-glazier          L4: from each carved home's front room a walker reaches its first carved room (core/walk: the front's
                      floor from the walked draw, the doorway, the cavern's floor); the carved rooms furnished
  bench-ground        the blocks' open ground is kitchen gardens, orchards and yards, not bare (the owner, 2026-11-16)

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
 R.push({name:'lights-of-the-wall',ok:(W.lights||0)>200,detail:(W.lights||0)+' light records from the Glaziers\' lamps'});
 const IX=(typeof LW_IX!=='undefined')?LW_IX:{};
 R.push({name:'ix-bench',ok:IX.on&&IX.houses>=IX.near*.5&&IX.rooms>IX.houses&&IX.pieces>300,detail:(IX.houses||0)+' of '+(IX.near||0)+' houses within '+IX.radius+' m of the Stair Foot built with interiors: '+(IX.rooms||0)+' rooms, '+(IX.pieces||0)+' pieces'});
 const homes=(typeof LW_CARVED!=='undefined'?LW_CARVED:[]).filter(s=>/^gz-(cell|front|house)$/.test(s.key)),gz=s=>{const PL=TG.gz.plan(s.key,{v:s.v}),V=PL.voids.find(q=>q.kind==='room'&&!q.pass),out=TG.gz.BOX[s.key].out;const dr=PL.voids.find(q=>q.pass&&q.z+q.d/2>0&&q.y===0);return {V,p:[s.x+(dr?dr.x:V?V.x:0),s.y+.06,s.z+out*.45]};};   /* the walker starts on its doorway's line in the front room */
 const walkTo=(s,dy)=>{const g=gz(s),P=[g.p[0],g.p[1]+dy,g.p[2]];if(!g.V)return false;const r=KWALK.reach([P],{box:[s.x-16,s.x+16,s.z-20,s.z+8],cell:.2});   /* a .95 m doorway between its jambs leaves a .45 m band for a .25 m walker: the default .4 m grid can miss it */return r.reached.some(F=>F.name===s.id+'.'+g.V.id);};
 const got=homes.filter(s=>walkTo(s,0)),neg=homes.slice(0,12).filter(s=>walkTo(s,40));
 const furn=(typeof LW_DRAW!=='undefined'?LW_DRAW:[]).reduce((a,D)=>a+((D.group&&D.group.userData.furniture)|0),0);
 R.push({name:'ix-glazier',ok:homes.length>40&&got.length===homes.length&&!neg.length&&furn>200,detail:got.length+' of '+homes.length+' carved homes walked from the front room into the first carved room; '+furn+' catalog pieces in the carved rooms; from 40 m up: '+neg.length+' (none)'+(got.length<homes.length?'; not reached: '+homes.filter(s=>!got.includes(s)).slice(0,6).map(s=>s.id+' '+s.key).join(', '):'')});
 let n=0,bare=0,kinds={};for(const b of (typeof LW_BLOCKS!=='undefined'?LW_BLOCKS:[]))if(b.kind!=='field'){const xs=b.poly.map(p=>p[0]),zs=b.poly.map(p=>p[1]);
  for(let x=Math.min(...xs)+2;x<Math.max(...xs);x+=9)for(let z=Math.min(...zs)+2;z<Math.max(...zs);z+=9){const pl=lwPlot(x,z);if(pl==null)continue;n++;kinds[pl]=(kinds[pl]||0)+1;if(pl==='dooryard')bare++;}}
 R.push({name:'bench-ground',ok:n>500&&bare<n*.35&&(kinds.garden||0)>n*.15&&(kinds.orchard||0)>n*.15,detail:n+' samples of the blocks\' open ground: '+JSON.stringify(kinds)});}
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
