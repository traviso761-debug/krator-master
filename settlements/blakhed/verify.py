#!/usr/bin/env python3
"""Headless verification of Blakhed. The page is built on Xanadu's (build.py), so its probe (window._api), invariants and views
are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py, with the survey's checks: tools/checks_optin.json),
with the town's own:

  blakhed-laid     the town laid on core/city with no error and no refusal: the Market (the two meeting halls, a rope wall and a
                   tally board, the head's house, the stores, the halting houses), the Icegarth (14 ice houses), the Ropewalk (12
                   rope houses), the Folds, the Fair's pens, the cairn hall; every Fellgang record drawn by TG.fg.draw, no key missing
  people           the 5,000 (the town, the Stairhead, the steadings: PLAN.md section 0) within 15 %
  villages         the four steadings, the Stairhead and the twelve hamlets laid on core/hamlet with no error, each 20+ records
  golden-tears     the Golden Tears' mission (the owner, 2026-11-16): its compound in the Xanadu kit's pieces, 100-200 people, the
                   boxes core/city planned with the same as VERN.defs
  toll-post        Dalab's toll post at the Stairhead (the Dalab set's pieces), the gin wheels and the stair drawn
  on-the-model     at the pin the drawn ground within 3 m of the model's bicubic height, and that within 25 m of the cell
  water-on-core    the Blak Riba a core/water flow whose bed falls all its length, the leat falling, the six ice ponds still water
  fell-flora       the Rift Rim kit's veiled rim grown over the plan's mask

    KRATOR_GL=gpu python3 verify.py dist/blakhed.html --assert --views "Overview,The Market"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
if(typeof BK_PLAN!=="undefined"){const Q=window._blakhed||{},P=BK_PLAN||{records:[]},K={};for(const r of P.records)K[r.kind]=(K[r.kind]||0)+1;
 const fg=P.records.filter(r=>r.set==='fg').length+(Q.villages||[]).filter(v=>v.drawn).reduce((n,v)=>n+v.records,0),need={hall:2,head:1,icehouse:14,ropewalk:12,cairnhall:1,halting:2},short=Object.keys(need).filter(k=>(K[k]||0)<need[k]);
 const halls=Q.halls||[],rope=halls.find(h=>h.variant==='fowlers'),tally=halls.find(h=>h.variant==='icecut');
 R.push({name:'blakhed-laid',ok:!Q.err&&P.records.length>=900&&!short.length&&!(Q.refused||[]).length&&(K.folds||0)>=12&&(K.fairpens||0)>=10&&Q.drawn===fg&&!Object.keys(Q.missing||{}).length&&!(Q.errors||[]).length&&!!(rope&&rope.pegs>0&&tally&&tally.slats>0),
  detail:Q.err?('the site did not lay: '+Q.err):(P.records.length+' records ('+JSON.stringify(K)+'), '+Q.drawn+' / '+fg+' Fellgang drawn in '+Q.draws+' draws, '+Q.tris+' triangles, '+Q.pieces+' pieces'+(short.length?'; SHORT '+short.join(', '):'')+((Q.refused||[]).length?'; REFUSED '+Q.refused.join('; '):'')+(Object.keys(Q.missing||{}).length?'; MISSING '+JSON.stringify(Q.missing):'')+((Q.errors||[]).length?'; ERRORS '+Q.errors.join('; '):'')+'; the halls '+JSON.stringify(halls))});
 const pp=Q.people||{};R.push({name:'people',ok:Math.abs((pp.five||0)-5000)<=.15*5000,
  detail:'the 5,000: the town '+pp.town+', the Stairhead '+pp.stairhead+', the steadings '+pp.steadings+' = '+pp.five+'; beside them the hamlets '+pp.hamlets+', the Golden Tears '+pp.tears+', Dalab\'s toll post '+pp.toll+', the Travellers in the Winterings '+pp.travellers});
 const V=Q.villages||[];R.push({name:'villages',ok:V.length===17&&V.every(v=>!v.error&&v.records>=20)&&V.filter(v=>v.kind==='steading').length===4&&V.filter(v=>v.kind==='hamlet').length===12,
  detail:V.map(v=>v.id.replace(/^bk\.(h|stead)?\.?/,'')+' '+v.records+(v.error?' ('+v.error+')':'')).join(', ')});
 const tk=Q.tears||[],xd=Q.xdims||[];R.push({name:'golden-tears',ok:tk.length>=10&&['xa_serai','xa_rich_c','xa_temple','xa_barracks'].every(k=>tk.includes(k))&&pp.tears>=100&&pp.tears<=200&&xd.length>0&&xd.every(d=>d[1])&&(Q.page||{}).wall>20,
  detail:tk.length+' pieces ('+tk.join(', ')+'), '+pp.tears+' people, the plots against VERN.defs '+JSON.stringify(xd)+', the wall '+(Q.page||{}).wall+' bays'});
 R.push({name:'toll-post',ok:(Q.toll||[]).length===4&&(Q.page||{}).hoists===2&&(Q.page||{}).steps>200,detail:'Dalab\'s pieces '+(Q.toll||[]).join(', ')+'; '+JSON.stringify(Q.page)});
 const pin=Q.pin||{};R.push({name:'on-the-model',ok:Math.abs((pin.drawn||0)-(pin.model||0))<3&&Math.abs((pin.model||0)-(pin.cell||0))<25,
  detail:'at the pin the model gives '+pin.model+' m, the page draws '+pin.drawn+' m (the cell: '+pin.cell+' m)'});
 const W=window._bkWater||{},RP=BK_GROUND.river.pts,L=BK_GROUND.leat;let falls=RP.length>100,lf=L.length>4;
 for(let i=1;i<RP.length;i++)if(!(RP[i].bed<RP[i-1].bed))falls=false;for(let i=1;i<L.length;i++)if(!(L[i][2]<L[i-1][2]))lf=false;
 R.push({name:'water-on-core',ok:W.flows===2&&W.stills===6&&falls&&lf&&typeof WATER!=='undefined'&&!!WATER.at,
  detail:(W.flows||0)+' flows (the Blak Riba '+W.riverPts+' points, its bed '+(falls?'falling all its length':'NOT falling all its length')+'; the leat '+(lf?'falling':'NOT falling')+'), '+(W.stills||0)+' ice ponds'});
 const fl=window._bkFlora||{};R.push({name:'fell-flora',ok:!!fl.ok,detail:'the Rift Rim kit (rim w) '+(fl.ok?'grown':'NOT grown')+' in '+fl.ms+' ms, '+(fl.tiles||0)+' mask tiles; '+JSON.stringify(fl.build||{}).slice(0,200)});}
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
