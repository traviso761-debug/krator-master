// prefix: yn
// ================================================================= YONNI INTERIORS, ROTATING SQUALL-TURBINES, TERRACES & MINE WORKINGS
// Helpers for placing non-overlapping catalog + bespoke Yonni furniture in circular rooms, animated coastal wind-rotors,
// curved stone crop terraces (02f9f0ab), and Scoured-Hills mine adits linked to kits/resources ore nodes.

/* Furnish from a list of [key, x, y, z, ry, opts] */
function ynFurn(list){for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]==null?0:e[4],e[5]);}

/* Furnish a circular room of inner radius rIn at floor height y (tier: 'poor' | 'middle' | 'rich').
   Items standing inside the central rug radius are lifted onto y + rugH (.05) so zero underside faces ever coplanarize! */
function ynFurnRoundRoom(cx,cz,rIn,y,tier,o){
 o=o||{};const rWall=Math.max(1.0,rIn-.56);
 const rugKey=tier==='rich'&&rIn>=2.5?'yonni_court_carpet':'yonni_common_rug_round';
 const rugH=rugKey==='yonni_court_carpet'?.05:.045,rugR=rugKey==='yonni_court_carpet'?1.38:.94;
 const hasRug=tier!=='poor'&&rIn>=1.8;
 if(hasRug)FURNISH(rugKey,cx,y,cz,0);
 const yCenter=hasRug?y+rugH:y;
 const wantBed=o.bed===true||(o.bed!==false&&o.center!=='table');
 /* central round feast table or forward hearth-brazier (clear of twin bed foot) */
 if(o.center==='table'){
  FURNISH(tier==='rich'&&rIn>=2.5?'yonni_court_feast_table':'yonni_common_round_table',cx,yCenter,cz,0);
  for(let i=0;i<3;i++){
   const a=i*TAU/3+.5,sr=tier==='rich'&&rIn>=2.5?1.22:.88,sy=(sr<rugR+.22&&hasRug)?yCenter:y;
   if(sr<rIn-.32)FURNISH(tier==='rich'?'yonni_common_chair':'yonni_common_stool',cx+Math.cos(a)*sr,sy,cz+Math.sin(a)*sr,ynFace(Math.cos(a)*sr,Math.sin(a)*sr,0,0));
  }
 }else{
  const fz=wantBed?cz+Math.min(.92,rIn*.36):cz;
  const fy=(Math.abs(fz-cz)<rugR+.45&&hasRug)?yCenter+.006:y+.006;
  FURNISH('yonni_common_brazier',cx,fy,fz,0);
 }
 /* paired twin-bed / alcove at -z when not a dining/reception table drum */
 if(wantBed){
  const bedKey=(tier==='rich'&&rIn>=2.65)?'yonni_court_twin_bed':tier==='poor'?'yonni_poor_twin_pallet':'yonni_common_twin_alcove';
  const bz=cz-Math.max(.68,rIn-1.35),by=(Math.abs(bz-cz)<rugR+.98&&hasRug)?yCenter:y;
  FURNISH(bedKey,cx,by,bz,0);
 }
 /* dual-spear rack on +x wall, sea-chest on -x wall, shelves / lamp on front-side arcs */
 const aR=.06,aL=PI-.06;
 FURNISH('yonni_common_dual_spear_rack',cx+Math.cos(aR)*rWall,y,cz+Math.sin(aR)*rWall,ynFace(Math.cos(aR),Math.sin(aR),0,0));
 FURNISH('yonni_common_chest',cx+Math.cos(aL)*rWall,y,cz+Math.sin(aL)*rWall,ynFace(Math.cos(aL),Math.sin(aL),0,0));
 if(rIn>=2.55){
  const aS=PI*.68,aB=PI*.32;
  FURNISH('yonni_common_shelves',cx+Math.cos(aS)*(rWall-.1),y+.005,cz+Math.sin(aS)*(rWall-.1),ynFace(Math.cos(aS),Math.sin(aS),0,0));
  FURNISH('yonni_common_post_lamp',cx+Math.cos(aB)*(rWall-.32),y+.008,cz+Math.sin(aB)*(rWall-.32),0);
 }
 if(o.ceilingY)FURNISH_HANG('yonni_common_storm_lamp',cx,o.ceilingY,cz,0);
}

/* ---------------------------------------------------------------- Rotating Vertical-Axis Coastal Squall-Turbine Sails */
const YN_SPINNERS=[];
function ynSpinnerReset(){YN_SPINNERS.length=0;}
function ynSpinner(x,y,z,speed,drawFn){
 const B={},keepT=GTARGET,keepCMS=CMS.slice(),keepCM=CM,keepSB=SB,subBB={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};
 const wPos=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 GTARGET=B;SB=subBB;resetCM();
 try{drawFn();}finally{
  GTARGET=keepT;CMS.length=0;for(const m of keepCMS)CMS.push(m);CM=keepCM;SB=keepSB;
 }
 if(SB&&isFinite(subBB.mn[0])){
  for(let k=0;k<3;k++){
   const off=k===0?wPos.x:k===1?wPos.y:wPos.z;
   SB.mn[k]=Math.min(SB.mn[k],subBB.mn[k]+off);SB.mx[k]=Math.max(SB.mx[k],subBB.mx[k]+off);
  }
 }
 YN_SPINNERS.push({buckets:B,x:wPos.x,y:wPos.y,z:wPos.z,speed:speed==null?.85:speed,group:null});
}
function ynSpinnerFlush(parent){
 for(const s of YN_SPINNERS){
  const g=new THREE.Group();g.position.set(s.x,s.y,s.z);
  flushBuckets(s.buckets,g,true);
  parent.add(g);s.group=g;
 }
}
FRAME_HOOKS.push(()=>{
 const t=ANIMU.uTime.value;
 for(const s of YN_SPINNERS)if(s.group)s.group.rotation.y=t*s.speed;
});

/* ---------------------------------------------------------------- Curved Coastal Wet-Hill Crop Terraces (02f9f0ab) */
function ynCropTerrace(cx,cz,r0,r1,a0,a1,y0,steps,o){
 o=o||{};const n=steps==null?3:steps,dr=(r1-r0)/n,dh=o.stepH==null?.48:o.stepH;
 const cbCol=P('cobble'),eaCol=P('earth'),tfCol=P('turf');
 ynNoCut(()=>{
  for(let i=0;i<n;i++){
   const ra=r0+dr*i,rb=r0+dr*(i+1)-.04,yt=y0+dh*(n-i);
   sector('cobble',cx,cz,rb-.24,rb,a0,a1,y0+.005,yt,cbCol,10);
   sector('earth',cx,cz,ra+.02,rb-.25,a0,a1,y0+.01,yt-.055,eaCol,10);
   sector('turf',cx,cz,ra+.08,rb-.32,a0+.03,a1-.03,yt-.05,yt+.03,tfCol,10);
  }
 });
}

/* ---------------------------------------------------------------- Scoured-Hills Mine Workings & kits/resources Linker */
function ynAdit(x,z,ry,o){
 o=o||{};const w=o.w==null?2.5:o.w,h=o.h==null?2.7:o.h,grCol=P('granite'),iwCol=P('ironwood');
 ynNoCut(()=>W(x,0,z,ry||0,()=>{
  /* stepped coastal granite crag mass around the timbered mine adit */
  for(let i=0;i<6;i++){
   const xx=lerp(-4.6,4.6,i/5),hh=rr(3.8,5.6)*(1-Math.abs(xx)/11);
   if(Math.abs(xx)<w/2+.35)continue;
   box('granite',xx,.008*i,-1.7,1.65,hh,2.6,grCol,rr(-.08,.08));
  }
  box('granite',0,h+.32,-1.7,w+1.5,2.6,2.6,P('stoneD'));
  box('earth',0,.005,-1.5,w,.045,2.5,P('earth'));
  /* shadowed adit throat card in textured stone */
  box('ironstone',0,.06,-2.72,w-.1,h-.06,.08,0x1c1816);
  /* heavy oiled ironwood portal frames + crescent slate rain-hood */
  for(const s of [-1,1])box('ironwood',s*(w/2-.13),.056,-.42,.24,h-.056,.24,iwCol);
  box('ironwood',0,h+.005,-.42,w+.24,.26,.32,iwCol);
  ynCrescentVisor(0,-1.15,.9,PI/2,.95,h+.28,.65,'slate',P('slate'));
 }));
}

function ynWindlass(x,z,ry){
 ynNoCut(()=>W(x,0,z,ry||0,()=>{
  cyl('cobble',0,0,0,1.15,.48,P('cobble'),14);
  cyl('ironstone',0,.48,0,.86,.05,0x1c1816,14);
  for(const s of [-1,1]){
   beam('ironwood',[s*1.25,0,-.48],[s*1.05,1.68,0],.1,P('ironwood'));
   beam('ironwood',[s*1.25,0,.48],[s*1.05,1.68,0],.1,P('ironwood'));
  }
  W(0,1.65,0,0,()=>tube('ironwood',t=>[(t-.5)*2.2,0,0],()=>[.12,.12],4,8,P('wood'),{caps:true}));
  sagRope('rope',[0,1.65,.12],[0,.68,0],.01,.022,P('rope'),3);
  cyl('bronze',0,.54,0,.22,.28,P('bronze'),10);
  /* small conical rain-hat over the windlass shaft */
  ynCanopy(0,0,1.0,1.65,2.15,.85,{mk:'slate',ribs:4,finial:false,seg:14});
 }));
}

function ynOreHeap(x,z,metal,s){
 const sc=s==null?1:s,L=(typeof RES_LOOK!=='undefined'&&RES_LOOK[metal])||({pile:0x6a3a24,lump:0x2a2624});
 const mk=metal==='coal'?'coal':metal==='tin'?'cassiterite':metal==='saltpeter'?'efflor':'gossan';
 ynNoCut(()=>W(x,0,z,0,()=>{
  cone(mk,0,0,0,.92*sc,.68*sc,L.pile,10);
  for(let i=0;i<7;i++){
   const a=i/7*TAU+.2,r=(.55+(i%2)*.22)*sc;
   sph(mk,Math.cos(a)*r,.08*sc,Math.sin(a)*r,.11*sc,i%2?L.pile:L.lump,.7,6);
  }
 }));
}

function ynOreLinks(){
 const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
 const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
 return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
}
globalThis.ynOreLinks=ynOreLinks;
