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
  lamp-head-follows    the Ancient lamp head (kits/ancients anc_beacon_lamp, mounted by 80g on the plinth's yoke) faces the
                       bearing the lamp's night gives, to half a degree, its beam shown only with the shutters open
  life-on-the-ground   the house's walkers (src/41-bc-life.js: the Lamp Watch, the kora's six, the novices' round): every one
                       drawn, six or more out at the page's hour, each on the drawn ground under its feet
  watch-at-the-plinth  while the lamp is lit the Lamp Watch's three are in the plinth (the page's figures hidden there)
  lamp-night-on-atmos  the lamp's night is core/atmos's evening (ATMOS.night half dark or more): about 12.4 h of the day, the Lamp
                       Watch in the plinth whenever the lamp is lit
  tank-still-water     the saddle tank's water is core/water's still water (WATER.at finds it at its level, between the tank's
                       floor and rim) and drawn by WATER.drawStill
  interiors-furnished  every building of the order with rooms (BC_IX_PROG: all but the gatehouses) and the Lamp Plinth planned on
                       its shell with as many floors as it has storeys and furnished (the plinth's four: the switch room, the
                       signal room, the Lamp Watch, the Chapel of the Beacon); the Order's own catalog pieces placed
  interiors-walk-in    every interior in core/walk with its street door found and unlocked
  offices-kept         the Lamp School's six masters out on the drawn ground on their way to the noon office, then in the hall
  carts-on-their-days  the oil carts away on the page's day (unless ?day= is 110 or 290); on day 110 up the fort road on the ground
                       before 11:00 and unloading side by side at the Oil Pit at 11:30
  rimpost-placed       the Rim Post (xa_fort_post) 17 km off on the rimpost station's bearing, its base on the far land as drawn
                       (the highest of its corners and centre), its footing past the lowest, near the model's summit
  rimpost-in-sight     the line from the lamp to the post's light clears the page's ground (the near ground, the far land as drawn;
                       Earth's curve with k 0.13) by 10 m or more
  rimpost-answers      the post's light shows as BEACON_RELAY.answering says at the page's clock: on the lamp's slot to it, not on
                       the next, never by day

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
  R.push({name:'lamp-on-its-plinth',ok:Math.abs(Q.plinthTop-t)<.05&&Math.abs(Q.lampY-l)<.05&&off<.05&&Math.abs(A[1]-Q.lampY)<.01&&XF_PLINTH.yellow===BC_SP.wall,detail:'the chapel '+(XF_PLINTH.yellow===BC_SP.wall?'in the gold spoke\'s wall':'NOT in the gold ('+XF_PLINTH.yellow.toString(16)+' against '+BC_SP.wall.toString(16)+')')+'; '+(Number.isFinite(off)?'80g\'s record (beacon:\'ancient\'): the lamp '+off.toFixed(2)+' m off the layout\'s (0,0); ':'NO record in window._xaBeacons; ')+'the plinth\'s roof at '+Q.plinthTop+' m (the crown + '+BEACON_LAYOUT.draw.plinth.h+' = '+t.toFixed(2)+'), the lamp\'s centre at '+Q.lampY+' m (+ '+BEACON_LAYOUT.lamp.h+' = '+l.toFixed(2)+')'});}
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
 {bcLampTick();const S=window._beaconLamp||{},Lp=typeof BC_LAMP!=='undefined'?BC_LAMP:null;let face=null,beam=null;
  if(Lp){Lp.head.updateWorldMatrix(true,false);const d=new THREE.Vector3(0,0,1).transformDirection(Lp.head.matrixWorld);face=(Math.atan2(d.x,-d.z)*180/Math.PI+360)%360;beam=Lp.beam.visible;}
  const off=face==null||S.bearing==null?NaN:Math.abs(((face-S.bearing)%360+540)%360-180),want=!!(S.lit&&S.shutter);
  R.push({name:'lamp-head-follows',ok:!!Lp&&off<.5&&beam===want,detail:Lp?'the Ancient lamp head (anc_beacon_lamp, on 80g\'s yoke) faces '+(face==null?'?':face.toFixed(1))+' deg, the lamp\'s night says '+S.bearing+' ('+off.toFixed(2)+' off); its beam '+(beam?'shown':'hidden')+', the shutters '+(S.shutter?'open':'shut'):'NO lamp head on the plinth (kits/ancients/pieces/89p not on the page?)'});}
 /* P3: the house's life (src/41-bc-life.js, targets/house/90t-bc-life.js) */
 {const Lf=window._beaconLife||[],vis=Lf.filter(w=>w.visible),skip=o=>{for(;o;o=o.parent){if(o.userData&&o.userData.probeSkip||o.visible===false)return true;}return false;};
  const rc=new THREE.Raycaster(),bad=[],meshes=[];rc.camera=camera;scene.updateMatrixWorld(true);scene.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&(o.userData.isGround||!skip(o)))meshes.push(o);});   /* the terrain is probeSkip (kept out of the volumes' probe) but is the ground */
  vis.forEach(w=>{rc.set(new THREE.Vector3(w.x,w.y+1,w.z),new THREE.Vector3(0,-1,0));rc.far=3;const h=rc.intersectObjects(meshes,false)[0];
   if(!h||Math.abs(h.distance-1)>.35)bad.push(w.id+' ('+w.where+') '+(h?(1-h.distance).toFixed(2)+' m off':'nothing under it'));});
  R.push({name:'life-on-the-ground',ok:Lf.length===BEACON_LIFE.walkers().length&&vis.length>=6&&!bad.length,detail:Lf.length+' walkers, '+vis.length+' out at '+BC_SKY.hour+' h ('+[...new Set(vis.map(w=>w.where))].join(', ')+'), each on the drawn ground under its feet (a ray down from a metre up)'+(bad.length?'; OFF: '+bad.slice(0,4).join('; '):'')});}
 {const S=window._beaconLamp||{},Lf=window._beaconLife||[],wt=Lf.filter(w=>w.group==='watch'),inP=wt.filter(w=>w.where==='in the plinth'&&!w.visible).length;
  R.push({name:'watch-at-the-plinth',ok:wt.length===3&&(S.lit?inP===3:true)&&(S.lit===true),detail:'the lamp '+(S.lit?'lit':'DARK')+'; the Lamp Watch\'s three '+wt.map(w=>w.where).join(', ')});}
 /* P5: core/atmos's evening is the lamp's night, and the saddle tank is core/water's still water */
 {const t0=bcClockS(),h=bcHourAt(t0),agree=BC_ENV.night(t0)===(ATMOS.night(h)>=.5),W=BEACON_LIFE.walkers().filter(w=>w.group==='watch');let lit=0,bad=[];
  for(let m=0;m<1440;m+=5){const t=m*60;if(!BEACON_LAMP.state(t,BC_ENV).lit)continue;lit++;W.forEach(w=>{const p=BEACON_LIFE.at(w,t);if(p.where!=='in the plinth'&&bad.length<3)bad.push(w.id+' '+p.where+' at '+(m/60).toFixed(2)+' h');});}
  R.push({name:'lamp-night-on-atmos',ok:agree&&lit>120&&lit<170&&!bad.length,detail:'the lamp\'s night is ATMOS.night half dark or more ('+h.toFixed(2)+' h: '+ATMOS.night(h).toFixed(2)+', '+(agree?'agreed':'NOT agreed')+'); lit '+(lit*5/60).toFixed(1)+' h of the day, the Lamp Watch in the plinth throughout'+(bad.length?'; OUT: '+bad.join('; '):'')});}
 {const T=(window._beaconGrounds||{}).tank,S=T&&WATER.at(T.x,T.z),hh=S?S.heightAt(T.x,T.z):null,drawn=!!(typeof BC_TANK!=='undefined'&&BC_TANK&&BC_TANK.D&&BC_TANK.D.mesh.parent);
  R.push({name:'tank-still-water',ok:!!T&&!!S&&S.kind==='still'&&Math.abs(hh-T.level)<.01&&T.level>T.floor+.3&&T.level<T.rim-.3&&drawn,detail:T?'the Saddle Tank: WATER.at gives '+(S?S.kind+' ('+S.name+') at '+hh+' m':'NOTHING')+', its floor '+T.floor+' m, its rim '+T.rim+' m; '+(drawn?'drawn by WATER.drawStill':'NOT drawn'):'no tank recorded'});}
 /* P6: the house's day: the offices and the oil carts, drawn at given times (BC_LIFE.tick(t)), then back to the page's clock */
 {const skip=o=>{for(;o;o=o.parent){if(o.userData&&o.userData.probeSkip||o.visible===false)return true;}return false;},meshes=[];scene.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&(o.userData.isGround||!skip(o)))meshes.push(o);});
  const rc=new THREE.Raycaster();rc.camera=camera;const onGround=w=>{rc.set(new THREE.Vector3(w.x,w.y+1,w.z),new THREE.Vector3(0,-1,0));rc.far=3;const h=rc.intersectObjects(meshes,false)[0];return !!h&&Math.abs(h.distance-1)<=.35;};
  const day=BC_SKY.day*86400,pit=BEACON_LAYOUT.parts.find(p=>p.id==='oilpit').box,cd=BEACON_LIFE.CARTS.days[0]*86400;
  const noon=BC_LIFE.tick(day+12*3600+60).filter(w=>w.group==='school'),hall=BC_LIFE.tick(day+12*3600+20*60).filter(w=>w.group==='school');
  const sOk=noon.length===6&&noon.every(w=>w.visible&&onGround(w))&&hall.every(w=>w.where==='at the office'&&!w.visible);
  const nowC=BC_LIFE.tick().filter(w=>w.group==='carts'),atPit=BC_LIFE.tick(cd+11.5*3600).filter(w=>w.group==='carts'),road=BC_LIFE.tick(cd+10.95*3600).filter(w=>w.group==='carts');
  const near=w=>w.z>pit[0]-6&&w.z<pit[1]+6&&w.x>pit[2]-6&&w.x<pit[3]+6,isDay=BEACON_LIFE.CARTS.days.indexOf(BC_SKY.day)>=0;
  const cOk=nowC.length===2&&(isDay||nowC.every(w=>!w.visible))&&atPit.every(w=>w.visible&&w.where==='unloading at the oil pit'&&near(w)&&onGround(w))&&road.every(w=>w.visible&&onGround(w));
  BC_LIFE.tick();
  R.push({name:'offices-kept',ok:sOk,detail:'the Lamp School\'s '+noon.length+' masters: at 12:01 '+noon.filter(w=>w.visible&&onGround(w)).length+' out on the drawn ground, at 12:20 '+hall.filter(w=>w.where==='at the office').length+' at the office in the monastery\'s hall'});
  R.push({name:'carts-on-their-days',ok:cOk,detail:'the oil carts on day '+BC_SKY.day+': '+nowC.map(w=>w.where).join(', ')+'; on day '+BEACON_LIFE.CARTS.days[0]+' at 10:57 '+road.map(w=>w.where+(onGround(w)?'':' OFF the ground')).join(', ')+', at 11:30 '+atPit.map(w=>w.where+(near(w)?'':' AWAY from the pit')+(onGround(w)?'':' OFF the ground')).join(', ')});}
 /* B8: the interiors (targets/house/90w-bc-interiors.js) */
 {const X=window._beaconIx||{buildings:[],placed:{}},want=L.parts.filter(p=>(p.zone==='precinct'||p.zone==='lampward')&&BC_IX_PROG[p.kind]).map(p=>p.id).concat(['plinth']);
  const by=id=>X.buildings.find(b=>b.id===id),miss=want.filter(id=>!by(id)||!by(id).rooms||!by(id).pieces),P=by('plinth')||{kinds:[]};
  const lev=want.filter(id=>{const b=by(id),p=L.parts.find(q=>q.id===id);return b&&b.levels!==(id==='plinth'?4:(p.storeys==null?1:p.storeys));});
  const own=[['plinth','xanadu_lamp_switchboard'],['plinth','xanadu_signal_lectern'],['lights','xanadu_register_of_lights'],['generator','xanadu_generator_set'],['workshop','xanadu_lens_bench'],['school','xanadu_signal_lectern']]
   .filter(([b,k])=>!((by(b)||{}).keys||{})[k]).map(([b,k])=>k+' in '+b);
  R.push({name:'interiors-furnished',ok:X.on&&!miss.length&&!lev.length&&P.levels===4&&P.kinds.indexOf('signals')>=0&&P.kinds.indexOf('shrine')>=0&&!own.length,
   detail:(X.on?'':'interiors OFF; ')+(want.length-miss.length)+' of '+want.length+' buildings planned and furnished ('+X.rooms+' rooms, '+X.pieces+' pieces, '+X.ms+' ms)'+(miss.length?'; NOT '+miss.join(', '):'')+(lev.length?'; storeys OFF: '+lev.join(', '):'')+
    '; the plinth '+P.levels+' floors: '+P.kinds.join(', ')+(own.length?'; the Order\'s pieces NOT placed: '+own.join(', '):'; the Order\'s own pieces placed')});
  const nw=X.buildings.filter(b=>!b.walk||!b.door).map(b=>b.id+(b.door?'':' (no door)')+(b.walk?'':' (not walked)'));
  R.push({name:'interiors-walk-in',ok:X.on&&X.buildings.length>=want.length&&!nw.length,detail:X.walked+' of '+X.buildings.length+' interiors in core/walk with their street door unlocked'+(nw.length?'; NOT '+nw.slice(0,5).join(', '):'')});}
 /* P4: the signal line on the page (src/42-bc-relay.js, targets/house/90u-bc-relay.js) */
 {const Q=window._beaconRelay||{},P=(window._beacon||{}).placed||{},rel=BEACON_LAYOUT.lamp.relays.find(r=>r.id==='rimpost'),g=Q.ground||[],hi=Math.max(...g),lo=Math.min(...g),st=BEACON_LAMP.STATIONS.find(s=>s.id==='rimpost');
  const ok=P.xa_fort_post===1&&g.length===5&&Math.abs(Q.at[1]-(hi+.05))<.02&&Q.at[1]-Q.drop<lo&&Math.abs(Q.km-17)<1.5&&Math.abs(Q.bearing-st.bearing)<1.5&&Math.abs(hi-rel.ground)<40;
  R.push({name:'rimpost-placed',ok,detail:'the Rim Post '+(P.xa_fort_post===1?'placed':'NOT placed')+' '+Q.km+' km off at '+Q.bearing+' deg (the station\'s '+st.bearing+'); its base at '+(Q.at||[])[1]+' m on the far land as drawn ('+lo.toFixed(2)+'..'+hi.toFixed(2)+' under its corners and centre; the model\'s summit '+rel.ground+' m), its footing '+Q.drop+' m'});}
 {const Q=window._beaconRelay||{},la=(window._beacon||{}).lampY,M=[BC_FARMESH],rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0);let nn=0,nf=0;
  const ground=(x,z)=>{if(Math.abs(x)<1900&&Math.abs(z)<1900){nn++;return terrainH(x,z);}rc.set(new THREE.Vector3(x,6000,z),dn);rc.far=12000;const h=rc.intersectObjects(M,false)[0];nf++;return h?6000-h.distance:null;};
  const S=BEACON_RELAY.sight([0,la,0],Q.light||[0,0,0],ground,{n:600});
  R.push({name:'rimpost-in-sight',ok:S.clear>=10&&nf>400,detail:'the line from the lamp ('+la+' m) to the Rim Post\'s light ('+(Q.light||[])[1]+' m, '+(S.D/1000).toFixed(2)+' km) clears the page\'s ground by '+S.clear.toFixed(1)+' m at its closest ('+(S.at?(S.at[2]*100).toFixed(0)+'% along':'')+'; Earth\'s curve, k '+BEACON_RELAY.K+'; '+nn+' samples on the near ground, '+nf+' on the far land as drawn; the layout\'s 2 km grid gives '+BEACON_LAYOUT.lamp.relays[0].seeLamp+' m)'});}
 {const Q=window._beaconRelay||{},h0=Math.floor(Q.t/3600)*3600,on=BEACON_RELAY.answering('rimpost',h0+20,BC_ENV).lit,off=BEACON_RELAY.answering('rimpost',h0+BEACON_LAMP.SLOT+20,BC_ENV).lit,day=BEACON_RELAY.answering('rimpost',12*3600+20,BC_ENV).lit;
  R.push({name:'rimpost-answers',ok:Q.shown===Q.lit&&on&&!off&&!day,detail:'at the page\'s clock ('+(Q.t/3600).toFixed(2)+' h) the post\'s light '+(Q.shown?'shown':'dark')+' ('+Q.why+'), as BEACON_RELAY.answering says; this hour it shows on the lamp\'s slot to it ('+(on?'yes':'NO')+'), not on the next ('+(off?'LIT':'dark')+'), never by day ('+(day?'LIT':'dark')+')'});}}
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
