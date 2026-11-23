// ================================================================= OPEN WORLD — the landform records in the world (relief P10)
// [web] A relief region's landform records (43b-world-landforms.js: WORLD.landforms) made known to the page:
//  * registered in core/tags (class 'feature', kind the record's: mesa, butte, dome, tower, spire, fin, balanced, tor,
//    fissure), each with its name, footprint and height, so a query or the inspector finds them as it finds a camp or a
//    bridge. A region's kopjes and fissures number in the thousands: the pins and the raised records over 20 m across are
//    tagged; the rest are found by WORLD.landformAt (the inspector's 'landform' line);
//  * marked on the minimap (window.MAP_MARKS, 90's map): the pins and the buttes, inselbergs and towers, as small diamonds
//    under one legend, without a Go to entry each.
// Runs once at load (WORLD.landforms over the region's box places every cell: about a third of a second on Oidong).
var LANDFORMS;LATE.push(()=>{LANDFORMS=(function(){'use strict';
const B=WORLD.box(),L=WORLD.landforms?WORLD.landforms(B[0],B[1],B[2],B[3]):[],stats={records:L.length,tagged:0,marked:0,kinds:{}};
if(!L.length)return{stats,tags:()=>null};
const TAGS=KTAGS.create({build:(WORLD_DATA.meta.cut&&WORLD_DATA.meta.cut.region||'region')+':landforms'});
const BIG=new Set(['butte','mesa','dome','tower']);window.MAP_MARKS=window.MAP_MARKS||[];
for(const R of L){stats.kinds[R.kind]=(stats.kinds[R.kind]||0)+1;
 if(R.pinned||(!R.carve&&R.R>=10)){const y=R.carve?WORLD.H(R.x,R.z):(R.top==null?WORLD.H(R.x,R.z):R.top),h=R.carve?R.d:(R.top==null?R.R:R.top-R.y0);
  TAGS.add({class:'feature',kind:R.kind,key:R.id,name:R.name||R.kind,at:[R.x,y,R.z],r:R.R,h:Math.max(1,h),
   note:'core/world 43b: '+(R.pinned?'pinned':'placed by cell')+(R.carve?', cut '+Math.round(R.d)+' m':'')});stats.tagged++;}
 if(R.pinned?R===L.find(Q=>Q.pinned):BIG.has(R.kind)){window.MAP_MARKS.push({x:R.x,z:R.z,label:R.name||R.kind,color:R.pinned?'#e8c890':'#b08a62',legend:'landforms (buttes, inselbergs, a pinned rock)'});stats.marked++;}}
return{stats,tags:()=>TAGS.audit()};})();});
