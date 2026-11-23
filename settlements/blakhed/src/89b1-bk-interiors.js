// ================================================================= BLAKHED — interiors glue (step B6: interiors only)
// Runs after 88z-kit-furniture-bundle.js (KratorFurniture, KratorInteriors) and before 89y-xa-interiors.js (XAF):
//   1. Turns Xanadu's hollow-wall and room-furnishing pass on by default on Blakhed's page (?interiors=0 turns it off,
//      ?interiors=1 also keeps it on), so the Golden Tears' Xanadui buildings hollow out, plan rooms, furnish from the
//      catalog, unlock their KDOOR doors and register KWALK floors and xafUnits cutaway.
//   2. Registers an interior set item for opt-in `xa_serai` (kits/xanadu/src/87k-xa-lake-trades.js, not in sets/xanadu.js):
//      its back and two side two-storey ranges hollow out and open onto the caravanserai's central courtyard via vaPlanDoors,
//      while the front range's iwan gate stays open from the caravan road into the court.
if(typeof KFURN!=='undefined'&&KFURN.flags){const bkFlags0=KFURN.flags;KFURN.flags=function(){return bkFlags0(true);};}
if(typeof KratorInteriors!=='undefined'&&KratorInteriors.sets){
 (function(IX){const rect=IX.sets.shape.rect,r3=v=>Math.round(v*1000)/1000;
  const batK=(w,h,d)=>{const want=1-2*h*.088/Math.min(w,d);return want>.94?.96:want>.89?.92:want>.83?.86:.8;};
  /* match each battered range's ground-storey mid-batter footprint so VAUTO hollows it and vaPlanDoors cuts unlocked doors onto the court */
  const range=(id,cx,cz,w,d,hs,doors,program)=>{const m=(1+batK(w,hs[0],d))/2,ww=r3(w*m),dd=r3(d*m);
   const ds=doors.map(D=>Object.assign({},D,{at:Math.abs(w-7)<1?[r3(cx+(cx<0?ww/2:-ww/2)),D.at[1]]:[D.at[0],r3(cz+dd/2)]}));
   return{id,poly:rect(ww,dd,cx,cz),y:.35,levels:hs.map(h=>({h})),wall:.42,roof:'flat',doors:ds,program};};
  IX.sets.add({set:'blakhed-xa',title:'Blakhed: the Golden Tears\' caravanserai',culture:'xanadu',items:[
   {key:'xa_serai',name:'Caravanserai',culture:'xanadu',wealth:.55,types:['tavern/inn','market/shop'],lot:[46,46],
    bodies:[
     range('back',0,-16.5,40,7,[3.4,3],[{at:[-8,-13],w:1.3},{at:[8,-13],w:1.3}],[['hall','kitchen','store','tavern'],['bedroom','bedroom','bedroom','study']]),
     range('west',-16.5,0,7,26,[3.4,3],[{at:[-13,0],w:1.3}],[['store','living'],['bedroom','bedroom']]),
     range('east',16.5,0,7,26,[3.4,3],[{at:[13,0],w:1.3}],[['store','living'],['bedroom','bedroom']])],
    note:'the caravanserai\'s back and side two-storey ranges opening onto the court; the front range holds the open gate iwan'}]});})(KratorInteriors);}
