// prefix: ynh
// ================================================================= COASTAL HARBOUR & WAR-GALLEY DOCKYARD (shore: true)
// Placed along the northern shoreline (land at local z > 0, stone moles & piers plunging to YN_SEA.floor = -3.8 m over z < 0).

/* Helper: battered coastal granite mole pier from z0 down to seabed (-3.8 m) with flagstone quay deck at y = .35 */
function ynhMole(x,z0,z1,w,yDeck){
 const yd=yDeck==null?.36:yDeck,za=Math.min(z0,z1),zb=Math.max(z0,z1),zc=(za+zb)/2,L=zb-za,bzCol=P('bronze');
 ynBelowGrade(()=>box('granite',x,-3.85,zc,w+.65,3.85,L+.5,P('granite')));
 ynNoCut(()=>{
  box('cobble',x,0,zc,w,yd-.105,L,P('cobble'));
  box('flagstone',x,yd-.1,zc,w+.14,.1,L+.12,P('flagstone'));
  for(const sz of [za+.6,zc])for(const sx of [-1,1]){
   cyl('bronze',x+sx*(w/2-.22),yd+.005,sz,.11,.36,bzCol,8);
  }
 });
}

/* Helper: bronze-rammed Yonni coastal war-galley / fishing skiff hull (outward-wound psurf + interior plank deck) */
function ynhGalleyHull(x,y,z,ry,len,beamW,o){
 o=o||{};const iwCol=P('ironwood'),pkCol=P('planks');
 ynNoCut(()=>W(x,y,z,ry||0,()=>{
  /* sleek curved hull shell via psurf: du is +z, dv is (+sg*dx, +dy, 0), so sg > 0 flips to outward (+x, -y) */
  for(const sg of [-1,1]){
   psurf('ironwood',(u,v)=>{
    const zz=(u-.5)*len,taper=Math.sin(u*PI),hw=beamW*.5*Math.pow(taper,.68)*(0.35+.65*v);
    const yy=v*beamW*.36+.18*Math.pow(2*u-1,4)*beamW;
    return [sg*hw,yy,zz];
   },14,4,iwCol,{flip:sg>0});
  }
  /* interior sole deck + plank thwarts + tin-bronze naval ram at +z bow */
  psurf('planks',(u,v)=>{
   const zz=(u-.46)*len*.92,taper=Math.sin(clamp(u,.05,.95)*PI),hw=beamW*.38*Math.pow(taper,.68)*(v*2-1);
   return [hw,beamW*.22,zz];
  },10,2,pkCol,{up:true});
  for(let i=-2;i<=2;i++)box('planks',0,beamW*.28,i*len*.14,beamW*.72*Math.cos(i*.28),.05,.24,pkCol);
  cone('bronze',0,beamW*.16,len*.5+.35,.16,.75,P('bronze'),8);
  if(o.mast){
   cyl('ironwood',0,.28,0,.08,len*.56,iwCol,8);
   beam('ironwood',[-beamW*.9,len*.44,.09],[beamW*.9,len*.44,.09],.06,iwCol,true,6);
   withCloth(clothHang(1.2,.06),()=>quad('sail',0,len*.34,.15,beamW*1.65,len*.22,P('sail'),0));
  }
 }));
}

/* 1. Cobble Mole & Coastal Fishing Quay */
defBuilding({key:'yn-fishquay',name:'Fish-Kwe Cobble Mole & Fishing Quay',seed:7401,cls:'building',w:14.6,d:19.4,h:11.6,cut:true,
 tags:{types:['infrastructure','farm'],wealth:'poor',style:'freestanding',role:'fishing dock',job:'fishing'},
 note:'Battered coastal granite mole plunging into the sea with a round net-loft drum on shore, fish-smoking racks, and moored skiff.',
 build(){
  ynhMole(-.2,1.1,-8.2,3.2,.35);
  yndTower({cx:-.2,cz:4.4,y0:.38,r:2.95,baseH:1.85,shaftH:2.05,baseMk:'rivercobble',shaftMk:'sealimeWarm',roofMk:'slate',roofOver:.85,roofRise:2.25,ribs:8,
   tier:'poor',furn:false,rootD:4.6,
   opens0:[{a:PI/2,w:1.15,h:2.0,door:true,visor:true},{a:-PI/2,w:1.1,h:1.95,door:true,open:true}]});
  ynhGalleyHull(2.95,-.92,-4.4,0,6.4,1.75,{mast:false});
  ynFurn([
   ['yonni_works_smoke_rack',-1.4,.38,3.8,PI*.15],
   ['yonni_trade_barrels',1.15,.38,3.6,-PI/2],
   ['yonni_common_dual_spear_rack',-.2,.38,2.15,0],
   ['yonni_common_brazier',-.2,.38,5.2,0]
  ]);
 }});

/* 2. Spear-Queen War-Galley Dockyard */
defBuilding({key:'yn-dockyard',name:'Gale-Slip Spear-Queen War-Galley Dockyard',seed:7402,cls:'building',w:18.8,d:22.6,h:15.2,cut:true,
 tags:{types:['industry','military'],wealth:'rich',style:'freestanding',role:'dockyard',job:'shipwrighting'},
 note:'Twin cobble pier-drums supporting an oversailing slate & bronze slipway canopy over a bronze-rammed Yonni war-galley on stocks.',
 build(){
  const slCol=P('slate'),iwCol=P('ironwood');
  for(const sg of [-1,1]){
   ynhMole(sg*5.2,1.9,-8.8,2.6,.40);
   const cx=sg*5.2,cz=5.15,r=2.75;
   ynRootSkirt(cx,cz,r,5.0,{mk:'cobble',plinthH:.48});
   ynFloorDisc(cx,cz,r-.05,.43,'flagstone',P('flagstone'));
   ynDrumWall(cx,cz,r-.34,r,.43,4.2,'cobble',P('cobble'),[
    {a:PI/2,w:1.15,h:2.05,door:true,visor:true},{a:sg<0?0:PI,w:1.1,h:2.0,door:true,open:true}
   ]);
   ynCanopy(cx,cz,r,r+.85,4.63,2.45,{mk:'verdigris',ribs:8});
   ynFurn([
    ['yonni_trade_workbench',cx,.43,cz-1.15,0],
    ['yonni_common_chest',cx+sg*1.1,.43,cz+.3,-sg*PI/2],
    ['yonni_common_dual_spear_rack',cx,.43,cz+1.45,PI]
   ]);
  }
  /* inclined timber slipway + war-galley under broad spanning canopy */
  ynNoCut(()=>{
   for(let i=0;i<7;i++)box('ironwood',0,-.65+i*.16,-6.4+i*1.35,3.4,.18,.28,iwCol);
   for(const sg of [-1,1])for(let k=0;k<4;k++)cyl('ironwood',sg*3.9,.41,-7.2+k*3.2,.16,5.15,iwCol,8);
   for(const sg of [-1,1])plane4('slate',[sg*.06,7.45,2.1],[sg*.06,7.45,-8.5],[sg*5.2,5.45,2.1],.07,slCol);
   beam('bronze',[0,7.52,2.1],[0,7.52,-8.5],.09,P('bronze'));
  });
  ynhGalleyHull(0,.32,-2.2,PI,11.6,2.85,{mast:true});
 }});

/* 3. Harbourmaster & Customs Quay (also serves ferrymen, dockers, stevedores) */
defBuilding({key:'yn-customs-quay',name:'Harbor-Tur Customs & Ferry Quay',seed:7403,cls:'building',w:16.4,d:20.4,h:14.8,cut:true,
 tags:{types:['civic','infrastructure'],wealth:'middle',style:'freestanding',role:'customs quay',job:'customs'},
 note:'Harbourmaster sea-lime round-tower on a stone mole with bronze cargo-crane, weigh-scale, and stepped ferry landing.',
 build(){
  ynhMole(2.35,1.4,-8.6,4.6,.40);
  yndTower({cx:-1.55,cz:4.1,y0:.43,r:3.25,baseH:2.1,shaftH:2.5,upperH:2.2,upperR:3.75,arcade:true,bays:10,
   roofMk:'verdigris',roofOver:.9,roofRise:2.55,ribs:10,tier:'middle',furn:false,furnUpper:false,rootD:5.2,
   stair:{a0:PI*.68,sweep:PI*.82,aTop:PI*1.5},
   opens0:[{a:PI/2,w:1.25,h:2.12,door:true,visor:true},{a:0,w:1.15,h:2.05,door:true,open:true}]});
  /* pivoting bronze-and-ironwood harbour crane on the seaward mole head */
  ynNoCut(()=>{
   cyl('ashlar',3.45,.405,-6.2,.65,.55,P('ashlar'),12);
   cyl('ironwood',3.45,.96,-6.2,.18,4.2,P('ironwood'),10);
   beam('ironwood',[3.45,3.8,-6.2],[6.15,5.3,-7.8],.14,P('ironwood'));
   sagRope('rope',[6.05,5.2,-7.75],[6.05,1.6,-7.75],.01,.025,P('rope'),2);
   svStair(-.5,-5.2,-.65,.40,0,{style:'solid',w:1.25,mk:'flagstone',col:P('flagstone'),run:2.2});
  });
  ynFurn([
   ['yonni_works_scribe_desk',-1.55,.43,2.55,0],
   ['yonni_works_weigh_scale',3.6,.40,-1.2,0,{setting:'outdoor'}],
   ['yonni_trade_barrels',3.7,.40,1.0,-PI/2,{setting:'outdoor'}],
   ['yonni_common_chest',-3.05,.43,4.1,PI/2],
   ['yonni_common_brazier',-1.55,.43,4.8,0]
  ]);
 }});

/* 4. Coast-Guard Cutter Berth */
defBuilding({key:'yn-canoeshed-guard',name:'Kost-Berth Coast-Guard Cutter Berth',seed:7404,cls:'building',w:15.2,d:19.8,h:13.8,cut:true,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'freestanding',role:'coastguard'},
 note:'Fortified cobble sea-mole & watch-drum sheltering a fast bronze-rammed Yonni patrol cutter.',
 build(){
  ynhMole(-1.75,1.3,-8.1,2.8,.36);
  yndTower({cx:-1.75,cz:4.3,y0:.39,r:2.85,baseH:2.2,shaftH:2.8,roofMk:'slate',roofOver:.88,roofRise:2.55,ribs:8,tier:'middle',furn:false,rootD:5.0,
   opens0:[{a:PI/2,w:1.15,h:2.1,door:true,visor:true}]});
  ynhGalleyHull(3.65,-.88,-3.3,0,8.8,2.15,{mast:true});
  ynBanner(-1.75,.39,7.3,0,2.8,P('carnelian'));
  ynFurn([
   ['yonni_trade_bunk',-1.75,.39,2.75,0],
   ['yonni_common_dual_spear_rack',-3.35,.39,4.3,PI/2],
   ['yonni_trade_armour_stand',-.15,.39,4.3,-PI/2],
   ['yonni_common_brazier',-1.75,.39,5.1,0]
  ]);
 }});
