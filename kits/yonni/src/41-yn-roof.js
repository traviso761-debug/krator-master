// prefix: yn
// ================================================================= YONNI ROUND RAIN-CANOPIES, TWIN-SPEAR FINIALS & STORM-LANTERNS
// Broad oversailing conical & bell-curved slate-blue shingle and patinated verdigris bronze standing-seam roofs, radial
// tin-bronze ribs, inverted rain-catch funnels, and Twin-Spear (Sfira-Kande) roof finials.

/* Twin-Spear tin-bronze roof finial (reflecting Yonni's 90% twin births & Spear-Queen rule) */
function ynTwinSpearFinial(cx,y,cz,s,o){
 o=o||{};const sc=s==null?1:s,bz=P('bronze'),vd=P('verdigris');
 W(cx,y,cz,o.ry||0,()=>{
  cyl('bronze',0,0,0,.18*sc,.14*sc,bz,12);
  sph('verdigris',0,.24*sc,0,.13*sc,vd,1,10);
  /* paired twin bronze spear-shafts rising from the hub */
  for(const sg of [-1,1]){
   const dx=sg*.11*sc;
   cyl('bronze',dx,.22*sc,0,.024*sc,.78*sc,bz,8);
   cone('bronze',dx,1.0*sc,0,.058*sc,.34*sc,P('brass'),8);
  }
  /* crescent rain-ring binding the twin shafts */
  ring('bronze',0,.62*sc,0,.16*sc,.022*sc,bz,0,PI/2,12);
 });
}

/* Broad oversailing conical / bell-curved Round Rain-Canopy.
   rWall: supporting drum outer radius (soffit closes cleanly to rWall+.02 with no coplanar overlap);
   rEave: oversailing eave radius; yEave: eave soffit height; rise: cone rise.
   o: {mk ('slate'|'verdigris'|'shingle'|'turf'), ribs (count of radial tin-bronze ribs), bell, finial, a0, a1} */
function ynCanopy(cx,cz,rWall,rEave,yEave,rise,o){
 o=o||{};const mk=o.mk||'slate',col=o.col==null?P(mk==='verdigris'?'verdigris':mk==='turf'?'turf':'slate'):o.col;
 const seg=o.seg==null?28:o.seg,a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1,full=Math.abs((a1-a0)-TAU)<1e-3;
 const rHub=o.rHub==null?.16:o.rHub,bell=o.bell==null?.12:o.bell;
 /* multi-ring profile from eave up to hub collar (leaves rHub for finial base so ribs/cone never bunch at r=0) */
 const prof=[[rWall+.015,yEave-.08],[rEave-.04,yEave-.05],[rEave,yEave+.04]];
 const steps=5;
 for(let i=1;i<=steps;i++){
  const t=i/steps,r=lerp(rEave,rHub,t),curve=bell*Math.sin(t*PI)*(1-t*.4);
  prof.push([r,yEave+.04+rise*t+curve]);
 }
 lathe(mk,cx,cz,prof,seg,col,{a0,a1,uv:'cone'});
 /* warm timber interior soffit/ceiling liner (inward:true) so looking up from inside any hall or palace never sees transparent sky */
 const openCollar=rHub>.35&&o.finial===false;
 const rInTop=openCollar?Math.max(.02,rHub-.03):.01;
 const innerProf=[[Math.max(.02,rWall+.02),yEave-.095],[Math.max(.03,rEave-.05),yEave-.065]];
 for(let i=1;i<=steps;i++){
  const t=i/steps,r=lerp(Math.max(.04,rEave-.05),rInTop,t),curve=bell*Math.sin(t*PI)*(1-t*.4);
  innerProf.push([r,yEave-.01+rise*t+curve]);
 }
 lathe('planks',cx,cz,innerProf,seg,P('planks'),{a0,a1,uv:'cone',inward:true});
 /* dark ironwood eave ring fascia */
 lathe('ironwood',cx,cz,[[rEave-.02,yEave-.055],[rEave+.025,yEave-.01],[rEave+.025,yEave+.045]],seg,P('ironwood'),{a0,a1,uv:'arc'});
 /* radial tin-bronze standing-seam ribs lifted 3.5 cm proud of the canopy surface, stopping at rHub+.05 */
 const nRibs=o.ribs==null?(mk==='turf'?0:8):o.ribs;
 if(nRibs>0){
  const rc=P('bronze');
  for(let i=0;i<nRibs;i++){
   const u=full?i/nRibs:(nRibs<2?.5:i/(nRibs-1)),a=a0+(a1-a0)*u,ca=Math.cos(a),sa=Math.sin(a);
   const p0=[cx+ca*(rEave-.03),yEave+.08,cz+sa*(rEave-.03)];
   const pm=[cx+ca*lerp(rEave,rHub,.5),yEave+.08+rise*.5+bell*.82,cz+sa*lerp(rEave,rHub,.5)];
   const p1=[cx+ca*(rHub+.06),yEave+.08+rise*.96,cz+sa*(rHub+.06)];
   beam('bronze',p0,pm,.045,rc,true,6);
   beam('bronze',pm,p1,.038,rc,true,6);
  }
 }
 if(full&&o.finial!==false){
  ynTwinSpearFinial(cx,yEave+.04+rise,cz,o.finialScale==null?Math.max(.65,Math.min(1.35,rEave/3.4)):o.finialScale);
 }else if(!full){
  /* engaged cliff-canopy flashing collar against rock scarp */
  cyl('bronze',cx,yEave+.04+rise,cz,rHub+.06,.16,P('bronze'),10);
 }
 return yEave+.04+rise+(full&&o.finial!==false?1.34*(o.finialScale==null?Math.max(.65,Math.min(1.35,rEave/3.4)):o.finialScale):.16);
}

/* Giant ribbed mushroom / umbrella pavilion canopy (8dac4161, c1eecdde market & terrace umbrellas) */
function ynUmbrellaCanopy(cx,cz,rCol,rEave,yFoot,yEave,rise,o){
 o=o||{};const nStruts=o.struts==null?10:o.struts,iwCol=P('ironwood');
 cyl('bronze',cx,yFoot+.005,cz,rCol*1.35,.175,P('bronze'),12);
 cyl('ironwood',cx,yFoot+.185,cz,rCol,Math.max(.3,yEave-yFoot-.19),iwCol,12);
 for(let i=0;i<nStruts;i++){
  const a=i/nStruts*TAU,ca=Math.cos(a),sa=Math.sin(a);
  beam('ironwood',[cx+ca*(rCol+.02),yEave-.95,cz+sa*(rCol+.02)],[cx+ca*(rEave*.72),yEave-.04,cz+sa*(rEave*.72)],.055,iwCol,true,6);
 }
 return ynCanopy(cx,cz,rCol,rEave,yEave,rise,Object.assign({mk:'verdigris',ribs:nStruts,bell:.18},o));
}

/* Inverted bronze & slate rain-catch cistern funnel roof */
function ynFunnelRoof(cx,cz,rWall,rEave,yEave,dip,o){
 o=o||{};const seg=o.seg==null?26:o.seg,rSpout=o.rSpout==null?.45:o.rSpout;
 lathe(o.mk||'verdigris',cx,cz,[
  [rWall+.015,yEave-.12],[rEave,yEave+.04],[rEave+.04,yEave+.12],[lerp(rEave,rSpout,.55),yEave-.35*dip],[rSpout,yEave-dip]
 ],seg,P('verdigris'),{uv:'cone'});
 lathe('planks',cx,cz,[
  [Math.max(.05,rWall-.04),yEave-.16],[Math.max(.05,rEave-.06),yEave-.02],[lerp(rEave,rSpout,.55),yEave-.35*dip-.05],[rSpout+.02,yEave-dip-.05]
 ],seg,P('planks'),{uv:'cone',inward:true});
 cyl('bronze',cx,yEave-dip-.28,cz,rSpout+.05,.3,P('bronze'),14);
}

/* Exterior bronze coastal storm-lantern bracket + night halo */
function ynStormLamp(x,y,z,yaw,s){
 const sc=s==null?1:s;
 W(x,y,z,yaw||0,()=>{
  box('bronze',0,.14,.14,.05,.05,.28*sc,P('bronze'));
  cyl('bronze',0,-.12,.28*sc,.1*sc,.05*sc,P('bronze'),8);
  cyl('glass',0,-.07,.28*sc,.08*sc,.16*sc,0xd8ecef,8);
  sph('glow',0,.01,.28*sc,.045*sc,0xffb44c,1,6);
  cone('verdigris',0,.09,.28*sc,.13*sc,.09*sc,P('verdigris'),8);
  haloAt(0,.01,.28*sc,0xffb44c,false);
 });
}

/* Carnelian & indigo Twin-Spear banner on bronze standard */
function ynBanner(x,y,z,ry,h,col){
 const bh=h==null?2.6:h,c=col==null?P('carnelian'):col;
 ynNoCut(()=>W(x,y,z,ry||0,()=>{
  cyl('ironwood',0,0,0,.04,bh,P('ironwood'),8);
  cone('bronze',0,bh,0,.065,.22,P('bronze'),8);
  box('bronze',0,bh-.24,0,.78,.04,.04,P('bronze'));
  withCloth(clothHang(bh*.52,.07),()=>{
   quad('flag',0,bh-.28-bh*.26,.025,.68,bh*.52,c,0);
  });
 }));
}
