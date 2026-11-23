#!/usr/bin/env python3
"""Headless verification of Xanadu's works sheet (settlements/xanadu/WORKS-PLAN.md W3). The page is built on Xanadu's (build.py),
so its probe (window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py),
with the sheet's own:

  works-laid        the four camps laid on core/hamlet (the Xanadu row in its camp form) with no error, every placement drawn
                    (no builder failed), the only stand-ins the adits (core/hamlet's pending xa_adit: the kit has none)
  census            each tune record's camps add up to its people (Kōlḍ-Lōḍ 950 = the adit camp 500 + the mill camp 450; Opal
                    Valley Mines 850 = the diggings 500 + the landing 350), each a camp census (workers 88 % or more, households
                    of four, the miners' shrine its religious building), the records read from XAN_TUNE
  works-present     the adit camp's adits and mine heads, the mill camp's stamp mills, corrals, smithy and the Golden Tears'
                    watch post, the diggings' sorting sheds and opal mine heads with a share of the houses the Glaziers' (a fifth,
                    within 10 to 35 %), the landing's warehouses, watch house and quay with the barge and the launch moored off it;
                    the tailings, spoil and potch heaps
  footprints        no two of a camp's records within half a metre of each other, every one inside its camp's ground, every
                    kit piece laid at the kit's own box

    KRATOR_GL=gpu python3 verify.py dist/xanadu-works.html --assert --views "Overview,The adit camp"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

WORKS_JS = r"""
{const K=window._xw||{},C=K.camps||[],by=id=>C.find(c=>c.id===id)||{works:{}},S=K.sums||{};
 R.push({name:'works-laid',ok:!K.err&&C.length===4&&C.every(c=>!c.error&&c.records>=20)&&!K.failed&&(K.standinKeys||[]).every(k=>k==='xa_adit'),
  detail:K.err?('the sheet did not lay: '+K.err):(C.map(c=>c.id+' '+c.records+(c.error?' ('+c.error+')':'')).join(', ')+'; '+(K.placed||0)+' placed, '+(K.failed||0)+' failed'+
   (K.failed?' ('+(K.fails||[]).slice(0,3).join('; ')+')':'')+', stand-ins '+(K.standins||0)+' ('+(K.standinKeys||[]).join(', ')+')')});
 const campOk=c=>c.camp&&c.pop>0&&c.workers/c.pop>=.88&&c.households===Math.ceil(c.pop/4)&&c.religious==='xa_wayside_shrine';
 const rec=K.records||{};
 R.push({name:'census',ok:S.smgxtultfq===950&&S.sjuarjbku0===850&&rec.smgxtultfq&&rec.smgxtultfq.people===950&&rec.sjuarjbku0&&rec.sjuarjbku0.people===850&&
   by('kold-lod.adit').pop===500&&by('kold-lod.mill').pop===450&&by('opal.diggings').pop===500&&by('opal.landing').pop===350&&C.every(campOk),
  detail:'Kold-Lod '+S.smgxtultfq+' / '+(rec.smgxtultfq||{}).people+' ('+(rec.smgxtultfq||{}).name+'), Opal Valley '+S.sjuarjbku0+' / '+(rec.sjuarjbku0||{}).people+'; '+
   C.map(c=>c.id+' '+c.pop+' ('+c.workers+' at work, '+c.households+' households, '+c.religious+')').join(', ')});
 const W=id=>by(id).works,has=(id,keys)=>keys.every(k=>(W(id)[k]||0)>0),G=K.glazier||{},gs=G.of?G.houses/G.of:0,H=K.heapsBy||{};
 R.push({name:'works-present',ok:has('kold-lod.adit',['xa_adit','xa_mine_head','xa_smithy'])&&has('kold-lod.mill',['xa_stamp_mill','xa_corral','xa_smithy','xa_fort_post','xa_placer_sluice'])&&
   has('opal.diggings',['xa_sorting_shed','xa_mine_head'])&&has('opal.landing',['xa_warehouse','xa_watch'])&&by('opal.landing').landing&&K.vessels===2&&
   gs>=.1&&gs<=.35&&K.glazierDrawn===G.houses&&(H.tailings||0)>=2&&(H.potch||0)>=2&&(H.spoil||0)>=1,
  detail:C.map(c=>c.id+': '+Object.keys(c.works).map(k=>k.replace(/^xa_/,'')+' '+c.works[k]).join(', ')).join('; ')+'; the Glaziers '+G.houses+' of '+G.of+' houses ('+Math.round(gs*100)+' %, '+
   K.glazierDrawn+' drawn); '+K.vessels+' vessels at the quay; heaps '+JSON.stringify(H)});
 const F=K.footprints||{};R.push({name:'footprints',ok:F.n>0&&!F.overlaps&&!F.outside&&!F.wrongBox,detail:F.n+' records: '+F.overlaps+' overlapping, '+F.outside+' outside their camp\'s ground, '+F.wrongBox+' not at the kit\'s box'});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + WORKS_JS
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
