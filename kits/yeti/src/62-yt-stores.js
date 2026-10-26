// prefix: yt
// ================================================================= STORES (PLAN.md sections 1 and 6, Y4)
// Cold uses are pycrete even where it is only seasonal: the walls are the refrigerator, the air touches the ice, nothing
// is heated. The vole-proof cache stands on posts.
//   yt_ice_cellar    a deep-sunk unlined dome: ice blocks from the lake stacked round the walls, meat laid on the ice
//   yt_frostroot_house the root store and freeze-drying house: roots frozen at night and trodden by day (chuno-like), on
//                    racks and mats in an unlined dome, the sacks of dried frostroot and sweetroot
//   yt_raised_cache  the labaz of the Evenki: a log store on four tall larch posts, a notched-log ladder, out of the voles'
//                    and the foxes' reach
ytRoomDef({key:'yt_ice_cellar',name:'Ice cellar',seed:9601,dims:{Rr:2.6,Ho:2.9,sink:1.1,pass:2.2},budget:80000,
 tags:{types:['infrastructure'],wealth:'middle',style:'common',role:'store',job:'warehousing'},opts:{lined:false,heated:false,window:false},
 note:'a deep-sunk unlined pycrete dome: lake ice in blocks round its walls, meat and fish laid on the ice; never heated',
 inside(D){for(let i=0;i<5;i++){const a=PI*(.95+i*.27);ytIceBlocks(Math.cos(a)*(D.Rr-.5),D.yFl,Math.sin(a)*(D.Rr-.5),-a+PI/2,2,3);}
  FURNISH('generic_cured_meat',0,D.yFl,-.4,0);FURNISH('generic_fish',.6,D.yFl,.3,0);FURNISH('generic_sack',-.7,D.yFl,.4,0);FURNISH('generic_storage_jar',0,D.yFl,1.0,0);
  wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:0,heated:false,cold:'ice cellar'};}});
ytRoomDef({key:'yt_frostroot_house',name:'Root store and freeze-drying house',seed:9603,dims:{Rr:3.0,Ho:3.2,sink:.6,pass:2.4},budget:90000,
 tags:{types:['farm'],wealth:'middle',style:'common',role:'store',job:'farming'},opts:{lined:false,heated:false},
 note:'the Three Gifts\' store: roots frozen by night and trodden by day until dry (the frostroot), on racks and mats; the sacks of sweetroot and snow potato',
 inside(D){ytRack(-1.2,D.yFl,-1.4,.5,1.6,1.6,'root');ytRack(1.2,D.yFl,-1.4,-.5,1.6,1.6,'root');ytRug('felt',0,D.yFl,.4,1.8,1.2,0);
  for(const [x,z] of [[-1.5,.8],[1.5,.8],[0,1.5]])FURNISH('generic_sack',x,D.yFl,z,0);FURNISH('generic_veg_basket',0,D.yFl+.02,.4,0);
  wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:0,heated:false,cold:'root store'};}});
defBuilding({key:'yt_raised_cache',name:'Raised cache (labaz)',seed:9605,w:4.4,d:4.4,h:5.4,budget:30000,
 tags:{types:['infrastructure'],wealth:'poor',style:'poor',role:'store',job:'warehousing'},
 note:'a log store on four tall larch posts, a notched-log ladder: the meat, the pine nuts and the mouse-nuts out of the voles\' and the foxes\' reach',
 build(o){CURREC.season='winter';CURREC.layers=[{k:'larch',m:.15}];CURREC.heat={stove:null,heated:false,crownVent:0};
  const hp=2.4,w=2.4,d=2.0;for(const [x,z] of [[-1,-.8],[1,-.8],[-1,.8],[1,.8]]){cyl('larch',x,0,z,.13,hp,P('larchOld'),8);cyl('larch',x,hp-.05,z,.22,.08,P('larchOld'),8);}
  box('larch',0,hp,0,w+.3,.12,d+.3,P('larch'));
  for(let i=0;i<6;i++){const y=hp+.12+i*.22;box('larch',0,y,-d/2,w,.2,.18,P('larch'));box('larch',0,y,d/2,w,.2,.18,P('larch'));box('larch',-w/2,y,0,.18,.2,d,P('larch'));box('larch',w/2,y,0,.18,.2,d,P('larch'));}
  const yr=hp+.12+6*.22;ytQuad('larch',[-w/2-.3,yr,d/2+.35],[w/2+.3,yr,d/2+.35],[-w/2-.3,yr+.7,0],[w/2+.3,yr+.7,0],P('larchOld'),[0,1,1]);
  ytQuad('larch',[w/2+.3,yr,-d/2-.35],[-w/2-.3,yr,-d/2-.35],[w/2+.3,yr+.7,0],[-w/2-.3,yr+.7,0],P('larchOld'),[0,1,-1]);
  poly('larch',[[-w/2,yr,d/2],[-w/2,yr,-d/2],[-w/2,yr+.7,0]],P('larchOld'),true);poly('larch',[[w/2,yr,-d/2],[w/2,yr,d/2],[w/2,yr+.7,0]],P('larchOld'),true);
  W(0,0,1.9,0,()=>{beam('larch',[0,0,0],[0,hp+.1,-.6],.16,P('larchOld'),true,8);for(let i=1;i<6;i++)box('larch',0,i*.42,-i*.42*.6/(hp+.1),.24,.06,.1,P('larch'));wkLadder(0,0,0,0,hp+.12,-.8);});
  door(0,0,2.2,0,.6);}});
