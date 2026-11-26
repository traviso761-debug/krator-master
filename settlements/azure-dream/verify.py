#!/usr/bin/env python3
"""Headless verification of Grēṭ-Āil, the Azure Dream's head monastery. The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
page's own:

  azure-laid        every place of the site placed (89zad: over 120), with the Hall of Dreaming, the great monastery in the blue
                    dress, the mole, the three jetties and the boathouse among them
  dream-cots        the Hall's 256 cots, 32 in each of the eight turnings (PLAN.md section 5; the owner: "keep it")
  cove-water        the cove holds water (the ground under the lake 3 m or more, 60-160 m out from the head on its centre line)
                    and its two headlands stand out of it (20 m or more at their records' centres): the records of
                    tools/scale-model/edit_517_azure.py on the 1:1 ground
  terraces-climb    the precinct's four terraces climb the slope in order (the gate court, the monastery, the Lotus Garden, the
                    Hall), all over the lake
  stair-climbs      the Stair of Lowered Eyes zigzags up the scarp in six runs, 20-70 m of rise, its foot on the ground
  lamps             the lamps placed: the Hall's 32 azure lamps and the Damsel's gold one, the wharf's lanterns

    KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

PAGE_JS = r"""
{const Z=window._azure||{},K=Z.byKind||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],has=id=>P.some(p=>p.id===id);
 R.push({name:'azure-laid',ok:Z.placed>=120&&['hall-of-dreaming','great-monastery','mole','boathouse','jetty:0','jetty:1','jetty:2'].every(has),
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces'});
 const T=Z.cotsByTurning||{},tk=Object.keys(T);
 R.push({name:'dream-cots',ok:Z.cots===256&&tk.length===8&&tk.every(k=>T[k]===32),detail:Z.cots+' cots: '+JSON.stringify(T)});
 const wet=[];for(let d=60;d<=160;d+=20)wet.push(+terrainH(0,d).toFixed(1));
 const arms=AD_ARMS.map(L=>+(terrainH(L.x-AD.WX,L.z-AD.WZ)).toFixed(1));
 R.push({name:'cove-water',ok:wet.every(h=>h<-3)&&arms.every(h=>h>20),detail:'the ground on the centre line 60-160 m out '+wet.join(', ')+' m; the headlands '+arms.join(', ')+' m over the lake'});
 const L=Z.terraces||{},o=['court','monastery','lotus','hall'].map(k=>L[k]);
 R.push({name:'terraces-climb',ok:o.every((y,i)=>y>0&&(i===0||y>o[i-1])),detail:'court '+o[0]+', monastery '+o[1]+', Lotus Garden '+o[2]+', Hall '+o[3]+' m over the lake'});
 const S=Z.stair||{},runs=P.filter(p=>p.key==='qb_terrace_stair'&&/^stair:/.test(p.id)).length,foot=typeof AD_STAIR!=='undefined'?Math.abs(AD_STAIR.fy-terrainH(0,-AD_STAIR.footU)):99;
 R.push({name:'stair-climbs',ok:runs===6&&S.rise>=20&&S.rise<=70&&foot<4,detail:runs+' runs, '+S.rise+' m of rise, its foot '+foot.toFixed(1)+' m off the ground'});
 const LA=typeof AD_LAMPS!=='undefined'?AD_LAMPS:[],n=k=>LA.filter(l=>l[3]===k).length;
 R.push({name:'lamps',ok:n('azure')===32&&n('gold')===1&&n('oil')>=4,detail:LA.length+' lamps: azure '+n('azure')+', gold '+n('gold')+', oil '+n('oil')+', clerestory panes '+n('pane')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + PAGE_JS
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
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
