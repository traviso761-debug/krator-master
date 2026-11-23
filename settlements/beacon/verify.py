#!/usr/bin/env python3
"""Headless verification of the Beacon's page (PLAN.md section 7, the build's step 1). The page is built on Xanadu's (build.py), so
its probe (window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
house's own:

  beacon-laid          the watch fort (kits/xanadu xa_fort_watch, kept), the Yellow Monastery (kits/qiblai qb_monastery, the gold
                       dress) and every building, court, wall run and the stair the layout lists placed and baked
  on-the-model         the ground is the scale model's with the restored knoll: at the pin the model's bicubic height within 1 m of
                       the cell's own (863 m: ground/knoll-patch.json), and the drawn ground 300 m past the lot's ease the model's
  house-on-its-levels  the fort's corners and the lamp level on the crown, the precinct's corners and middle 12 m below it, to 5 cm
  lamp-on-its-plinth   the plinth's roof (the chapel's top) at the crown + 18 m and the lamp's centre at + 22 m: the height the
                       layout's sights are taken from
  fort-walks           every wall walk and stair of the fort reached from its stairs' feet (core/walk, xfReach)
  layout-rules         every rule of src/31-bc-rules.js passes on the layout the page drew from
  lamp-lit             at the page's hour (?hour=, default 18.4) the lamp is lit by its night (src/40-bc-lamp.js), sweeping or
                       signalling, and its keepers on watch

    KRATOR_GL=gpu python3 verify.py dist/beacon.html --assert --views "Overview,The lamp and the fort gate"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

HOUSE_JS = r"""
if(typeof BC!=="undefined"){const Q=window._beacon||{},P=Q.placed||{},L=BEACON_LAYOUT;
 const blocks=L.parts.filter(p=>(p.zone==='precinct'||p.zone==='lampward')&&BC_BLOCKS.indexOf(p.kind)>=0).length,grounds=L.parts.filter(p=>(p.zone==='precinct'||p.zone==='lampward')&&BC_GROUNDS.indexOf(p.kind)>=0).length;
 R.push({name:'beacon-laid',ok:Q.fort&&Q.monastery&&P.xa_fort_watch===1&&P.qb_monastery===1&&P.bc_block===blocks&&P.bc_ground===grounds&&(P.bc_wall|0)>=10&&P.bc_stair===1&&(window._instances|0)>1000&&Q.forts===1,
  detail:'the fort '+(Q.fort?'placed':'NOT placed')+', the monastery '+(Q.monastery?'placed':'NOT placed')+'; '+(P.bc_block|0)+' of '+blocks+' buildings, '+(P.bc_ground|0)+' of '+grounds+' courts and pits, '+(P.bc_wall|0)+' wall runs, '+(P.bc_stair|0)+' stair; '+(window._instances|0)+' instances; '+(Q.forts|0)+' fort with walks'});
 {const p=Q.pin||{},ox=BC.lot[3]+BC.EASE+300,dr=terrainH(ox,0),mo=bcModel(ox,0);
  R.push({name:'on-the-model',ok:Math.abs((p.model||0)-(p.cell||0))<1&&p.cell>850&&Math.abs(dr-mo)<.5,
   detail:'at the pin the model gives '+p.model+' m against the cell\'s '+p.cell+' m (the restored knoll; '+p.patched+' cells overlaid from ground/knoll-patch.json); 300 m past the lot\'s ease the page draws '+dr.toFixed(2)+' m, the model '+mo.toFixed(2)+' m'});}
 {const fg=Q.fortGround||[],pg=Q.precinctGround||[],bf=fg.filter(h=>Math.abs(h-Q.crown)>.05).length,bp=pg.filter(h=>Math.abs(h-(Q.crown-12))>.05).length;
  R.push({name:'house-on-its-levels',ok:fg.length===5&&pg.length===5&&!bf&&!bp&&Math.max(Q.cut,Q.fill)<15,
   detail:'the crown at '+Q.crown+' m; the fort\'s corners and the lamp '+fg.join(', ')+'; the precinct\'s corners and middle '+pg.join(', ')+(bf||bp?' ('+(bf+bp)+' OFF their level)':'')+'; cut '+Q.cut+' m, fill '+Q.fill+' m'});}
 {const t=Q.crown+BEACON_LAYOUT.draw.plinth.h,l=Q.crown+BEACON_LAYOUT.lamp.h;
  R.push({name:'lamp-on-its-plinth',ok:Math.abs(Q.plinthTop-t)<.05&&Math.abs(Q.lampY-l)<.05,detail:'the plinth\'s roof at '+Q.plinthTop+' m (the crown + '+BEACON_LAYOUT.draw.plinth.h+' = '+t.toFixed(2)+'), the lamp\'s centre at '+Q.lampY+' m (+ '+BEACON_LAYOUT.lamp.h+' = '+l.toFixed(2)+')'});}
 {const F=(typeof xfReach==='function'?xfReach():null)||[],bad=F.filter(q=>!q.floors||q.unreached.length||q.capped);
  R.push({name:'fort-walks',ok:F.length===1&&!bad.length,detail:F.map(q=>q.reached+' of '+q.floors+' walks and stairs reached'+(q.unreached.length?', NOT '+q.unreached.slice(0,4).join(', '):'')).join('; ')||'no walks registered (core/walk not on the page?)'});}
 R.push({name:'layout-rules',ok:Array.isArray(Q.rules)&&!Q.rules.length,detail:(Q.rules||['no record']).length?'FAILED: '+(Q.rules||[]).join('; '):'every rule of the layout passes ('+BEACON.checks(BEACON_LAYOUT).length+')'});
 {const S=window._beaconLamp||{};
  R.push({name:'lamp-lit',ok:S.lit===true&&(S.mode==='sweep'||S.mode==='signal')&&Array.isArray(S.keepers)&&S.keepers.length===3,detail:'at '+BC_SKY.hour+' h the lamp is '+(S.lit?'lit':'DARK')+', '+S.mode+(S.bearing!=null?' at '+S.bearing+' deg':'')+(S.station?' to '+S.station:'')+'; the Lamp Watch '+(S.keepers||[]).join(', ')});}}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + HOUSE_JS
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
    ap.add_argument("--interiors", action="store_true")   # settlements/xanadu/verify.py reads it (the hollow-wall audit): off on this page
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
