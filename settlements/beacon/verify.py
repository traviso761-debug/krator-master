#!/usr/bin/env python3
"""Headless verification of the Beacon's page (PLAN.md section 7, the build's step 1). The page is built on Xanadu's (build.py), so
its probe (window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
house's own:

  beacon-laid          the watch fort (kits/xanadu xa_fort_watch, kept), the Yellow Monastery (kits/qiblai qb_monastery, the gold
                       dress) and every building, court, wall run and the stair the layout lists placed and baked
  on-the-model         the ground is the scale model's with the restored knoll: at the pin the model's bicubic height within 1 m of
                       the cell's own (863 m: ground/knoll-patch.json), and the drawn ground 300 m past the lot's ease the model's
  house-on-its-levels  the fort's corners and the lamp level on the crown, the precinct's corners and middle 12 m below it, to 5 cm
  lamp-on-its-plinth   80g's plinth (beacon:'ancient') records the lamp in window._xaBeacons: its roof (the chapel's top) at the
                       crown + 18 m, the lamp's centre at + 22 m over the layout's lamp (0,0), the height the sights are taken
                       from; the stand-in head seated there
  fort-walks           every wall walk and stair of the fort reached from its stairs' feet (core/walk, xfReach)
  layout-rules         every rule of src/31-bc-rules.js passes on the layout the page drew from
  lamp-lit             at the page's hour (?hour=, default 18.4) the lamp is lit by its night (src/40-bc-lamp.js), sweeping or
                       signalling, and its keepers on watch
  life-on-the-ground   the house's walkers (src/41-bc-life.js: the Lamp Watch, the kora's six, the novices' round): every one
                       drawn, six or more out at the page's hour, each on the drawn ground under its feet
  watch-at-the-plinth  while the lamp is lit the Lamp Watch's three are in the plinth (the page's figures hidden there)

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
  const A=Q.lampAt||[NaN,NaN,NaN],off=Math.hypot(A[0],A[2]);
  R.push({name:'lamp-on-its-plinth',ok:Math.abs(Q.plinthTop-t)<.05&&Math.abs(Q.lampY-l)<.05&&off<.05&&Math.abs(A[1]-Q.lampY)<.01,detail:(Number.isFinite(off)?'80g\'s record (beacon:\'ancient\'): the lamp '+off.toFixed(2)+' m off the layout\'s (0,0); ':'NO record in window._xaBeacons; ')+'the plinth\'s roof at '+Q.plinthTop+' m (the crown + '+BEACON_LAYOUT.draw.plinth.h+' = '+t.toFixed(2)+'), the lamp\'s centre at '+Q.lampY+' m (+ '+BEACON_LAYOUT.lamp.h+' = '+l.toFixed(2)+')'});}
 {const F=(typeof xfReach==='function'?xfReach():null)||[],bad=F.filter(q=>!q.floors||q.unreached.length||q.capped);
  R.push({name:'fort-walks',ok:F.length===1&&!bad.length,detail:F.map(q=>q.reached+' of '+q.floors+' walks and stairs reached'+(q.unreached.length?', NOT '+q.unreached.slice(0,4).join(', '):'')).join('; ')||'no walks registered (core/walk not on the page?)'});}
 R.push({name:'layout-rules',ok:Array.isArray(Q.rules)&&!Q.rules.length,detail:(Q.rules||['no record']).length?'FAILED: '+(Q.rules||[]).join('; '):'every rule of the layout passes ('+BEACON.checks(BEACON_LAYOUT).length+')'});
 /* P2: the grounds outside the walls (90s) */
 {const G=window._beaconGrounds||{pieces:[],parts:[]},site=L.parts.filter(p=>p.zone==='site').map(p=>p.id),miss=site.filter(id=>G.parts.indexOf(id)<0),tiles=G.pieces.filter(r=>r.key==='xa_farm').length;
  R.push({name:'grounds-laid',ok:!miss.length&&tiles>=30&&G.ways===2,detail:(site.length-miss.length)+' of '+site.length+' outside parts placed'+(miss.length?' (NOT '+miss.join(', ')+')':'')+'; '+tiles+' terraced-field tiles; '+G.ways+' roads'});}
 {const bad=[];let n=0;(window._beaconGrounds||{pieces:[]}).pieces.forEach(r=>{if(r.mode==='walls')return;n++;const[lo,hi]=bcBoxGround(r.box);
   if(r.mode==='footed'?(r.y<hi-.01||r.y-r.drop>lo+.01):Math.abs(r.y-lo)>.01)bad.push(r.id+'/'+r.key+' at '+r.y+' on '+lo.toFixed(2)+'..'+hi.toFixed(2));});
  R.push({name:'grounds-on-the-ground',ok:n>30&&!bad.length,detail:n+' pieces: the footed on their high side with their footing past the low, the draped on their low side'+(bad.length?'; OFF: '+bad.slice(0,4).join('; '):'')});}
 {let n=0,bad=0,worst=0;(typeof BC_WAYS!=='undefined'?BC_WAYS:[]).forEach(M=>{const p=M.geometry.attributes.position;for(let i=0;i<p.count;i+=3){const d=p.getY(i)-terrainH(p.getX(i),p.getZ(i));n++;if(d<.1||d>.4){bad++;worst=Math.max(worst,Math.abs(d));}}});
  R.push({name:'ways-on-the-ground',ok:n>100&&!bad,detail:n+' road vertices sampled, '+bad+' off the ground'+(bad?' (worst '+worst.toFixed(2)+' m)':' (each 0.22 m over it)')});}
 {const S=window._beaconLamp||{};
  R.push({name:'lamp-lit',ok:S.lit===true&&(S.mode==='sweep'||S.mode==='signal')&&Array.isArray(S.keepers)&&S.keepers.length===3,detail:'at '+BC_SKY.hour+' h the lamp is '+(S.lit?'lit':'DARK')+', '+S.mode+(S.bearing!=null?' at '+S.bearing+' deg':'')+(S.station?' to '+S.station:'')+'; the Lamp Watch '+(S.keepers||[]).join(', ')});}
 /* P3: the house's life (src/41-bc-life.js, targets/house/90t-bc-life.js) */
 {const Lf=window._beaconLife||[],vis=Lf.filter(w=>w.visible),skip=o=>{for(;o;o=o.parent){if(o.userData&&o.userData.probeSkip||o.visible===false)return true;}return false;};
  const rc=new THREE.Raycaster(),bad=[],meshes=[];rc.camera=camera;scene.updateMatrixWorld(true);scene.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&(o.userData.isGround||!skip(o)))meshes.push(o);});   /* the terrain is probeSkip (kept out of the volumes' probe) but is the ground */
  vis.forEach(w=>{rc.set(new THREE.Vector3(w.x,w.y+1,w.z),new THREE.Vector3(0,-1,0));rc.far=3;const h=rc.intersectObjects(meshes,false)[0];
   if(!h||Math.abs(h.distance-1)>.35)bad.push(w.id+' ('+w.where+') '+(h?(1-h.distance).toFixed(2)+' m off':'nothing under it'));});
  R.push({name:'life-on-the-ground',ok:Lf.length===BEACON_LIFE.walkers().length&&vis.length>=6&&!bad.length,detail:Lf.length+' walkers, '+vis.length+' out at '+BC_SKY.hour+' h ('+[...new Set(vis.map(w=>w.where))].join(', ')+'), each on the drawn ground under its feet (a ray down from a metre up)'+(bad.length?'; OFF: '+bad.slice(0,4).join('; '):'')});}
 {const S=window._beaconLamp||{},Lf=window._beaconLife||[],wt=Lf.filter(w=>w.group==='watch'),inP=wt.filter(w=>w.where==='in the plinth'&&!w.visible).length;
  R.push({name:'watch-at-the-plinth',ok:wt.length===3&&(S.lit?inP===3:true)&&(S.lit===true),detail:'the lamp '+(S.lit?'lit':'DARK')+'; the Lamp Watch\'s three '+wt.map(w=>w.where).join(', ')});}}
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
