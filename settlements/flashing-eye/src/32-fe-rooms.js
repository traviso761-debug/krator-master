// ================================================================= THE FLASHING EYE: the rooms (the blueprint's sheets L, H, P, T, M1-M2, E1-E2 and F as data)
// What each building of the house holds, storey by storey, in kits/interiors' room kinds: the programme kits/qiblai's qnIxType
// plans on the building's shell (89q5s: planBuilding, then the catalog's Xanadu pieces through qnFurnishRooms). Plain data in the
// building's own frame (the record's: origin at the plot's centre on its ground, +z the front, metres); the page's
// targets/cone/90fk-fe-interiors.js draws, furnishes, tags and walks it. Each building:
//   part     the FE_PLACE record it stands in (its key, place and level)
//   shell    {x, z, w, d, y, hs, ry}: the box the storeys are planned in, inside the drawn body's narrowest part; hs each
//            storey's height, the lowest first; ry its turn in the record's frame. Or fn(o): from the record's options (a range
//            sized to its layout box)
//   door     'drawn': the street door is the one the record drew on the shell's lowest storey (core/door, qnIxDoorOf); else
//            {n, t, w, h, leaf}: a door the record did not draw (n the face's outward normal in the shell's frame, t along it):
//            an open doorway (a court's ranges, entered from their court), or with leaf a shut plank door (a door into the rock)
//   more     more ways in (prog.doors), each {level, n}: the record's door on that storey's face n; or {level, n, t, w, h, open}:
//            an open doorway the record did not draw
//   body     {hw, hd}: the drawn body's half extents at the street door, when it is thicker than the shell (the doorway is run
//            through it)
//   levels   each storey's room kinds, the first taking the door (or the stair's top); names, the sheet's rooms they are
//   stair    kits/interiors' stair for its flights (a tower's steep one), else the planner's
//   rows     [{level, kind, key, dx, dz, margin, back}]: a hall's seats laid in rows after the room is furnished (kits/interiors stops a
//            room at about nine pieces whatever its size): rows of `key` every dx along and dz deep, facing the storey's shrine
//            (or the room's far side from its door), clear of what stands there, its fixtures and its doors
//   want     the Order's pieces (kits/catalog, xanadu) offered first in this building; only: the only Xanadu pieces of their type
//            it is offered (kits/interiors shuffles its candidates, so being first is not enough); block: other culture|type
//            pairs kept out. Every other Order piece (OWN) is kept out of it
// [G data]: no browser, no three.js.
const FE_ROOMS=(function(){
 /* a tower's stair: steep, a ladder-stair as Tibetan towers have, so its run fits a narrow storey (prog.stair) */
 const FE_TOWER_STAIR={w:.9,riser:.27,tread:.2};
 const ST=4.2,LIP=[['mirror','The Mirror Hall\'s house',-45],['books','The Book House',-15],['guests','The guest house',15],['labrang','The Prismarch\'s hall',45]];
 /* the Lip Range (sheet L): four houses side by side along its 120 m, each four storeys: L-2 and L-1 cut into the band's top
    (their windows in the face), L0 at the bench, L1 above. The street door of the plan is a shut door at the back of L-2 (the
    rock-cut passage); the ways in are the record's two doors on L0, from the bench behind and out onto the balcony */
 const LIPL={
  mirror:{levels:[['store','store'],['signals','study'],['signals','gallery'],['study','school']],
   names:[['Mirror store'],['Readers\' Gallery (L-1)'],['The Mirror Hall'],['The Master of Mirrors']],wealth:.75,
   want:['xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_crimson_banner'],only:['xanadu_signal_lectern']},
  books:{levels:[['library','store'],['library','library'],['library','library'],['library','study']],
   names:[['The Vault of Breaths'],['Stacks'],['Reading Room'],['Scriptorium']],wealth:.75,
   want:['xanadu_book_lectern'],only:['xanadu_book_lectern']},
  guests:{levels:[['store','store'],['dormitory','dormitory'],['hall','hall'],['bedroom','bedroom','bedroom']],
   names:[['Guests\' stores and the tank\'s head'],['Guests\' dormitory'],['Guest Hall'],['Guest chambers']],wealth:.6,
   want:['xanadu_crimson_banner','xanadu_common_reader_seat'],only:[]},
  labrang:{levels:[['magazine','store'],['dormitory','dormitory'],['audience','antechamber'],['cell','signals','shrine']],
   names:[['The Labrang\'s treasury'],['The household'],['Audience Hall'],['The Prismarch\'s cell','His mirror room','His oratory']],wealth:.85,
   want:['xanadu_crimson_banner','xanadu_signal_lectern','xanadu_common_signal_mirror'],only:['xanadu_signal_lectern']}};
 const BL=[];
 for(const [k,name,x] of LIP)BL.push(Object.assign({id:'lip.'+k,name,part:'lip-range',sheet:'L',
  shell:{x,z:0,w:30,d:14,y:-2*ST,hs:[ST,ST,ST,ST]},door:{n:[0,-1],t:0,w:1.1,h:2.1,leaf:true},more:[{level:2,n:[0,-1]},{level:2,n:[0,1]}]},LIPL[k]));
 /* the Ember Tower (sheets H and T): the Hall (one tall storey, the record's front door) in front of the tower; the tower's shaft
    behind it from its back half, the sanctum on its ground (its own door on the east face), the tenders over it, the Book of the
    Ember, the bell of the Opening, the belvedere under the tiers (the tower's five drawn storeys). The shaft is planned in the
    4.5 m of the tower clear of the hall's body and roof */
 BL.push({id:'ember.hall',name:'The Hall of the Ember',part:'ember',sheet:'H',shell:{x:0,z:5.75,w:16,d:8.5,y:.9,hs:[5.2]},door:'drawn',
  levels:[['hall']],names:[['The Hall']],wealth:.75,want:['xanadu_crimson_banner','xanadu_common_reader_seat'],only:[]});
 BL.push({id:'ember.shaft',name:'The Ember Tower\'s shaft',part:'ember',sheet:'H, T',shell:{x:0,z:-7.25,w:11,d:4.5,y:.9,hs:[6,6,6,6,5]},door:'drawn',
  levels:[['shrine'],['bedroom'],['library'],['hall'],['gallery']],names:[['The Sanctum of the Ember'],['The tenders\' room'],['The Book of the Ember'],['The bell of the Opening'],['The belvedere under the tiers']],wealth:.8,
  rows:[{level:4,kind:'gallery',key:'xanadu_common_meditation_cushion',dx:3.5,dz:1.3,margin:.3,back:.2}],
  want:['xanadu_ember_hearth','xanadu_common_hour_drum','xanadu_book_lectern','xanadu_crimson_banner'],only:['xanadu_ember_hearth','xanadu_book_lectern'],block:['xanadu|shrine'],stair:FE_TOWER_STAIR});
 /* the Eye Post (sheet P): three storeys, one in each lift of its tapering shaft (planned inside the top lift, its narrowest; the
    band over them is solid), the door run through the thick base; the platform's heliograph and fire basket stand on the lantern's floor (platform). The Book of Breaths
    takes its whole storey (the sheet's signal store beside it leaves the lectern no room by the stair) */
 BL.push({id:'post',name:'The Eye Post',part:'post',sheet:'P',shell:{x:0,z:0,w:6.8,d:6.8,y:.6,hs:[9.5/3,9.5/3,9.5/3]},door:'drawn',body:{hw:4,hd:4},
  levels:[['dormitory','store'],['library'],['signals','store']],names:[['The Watch Room','Juniper store'],['The Book of Breaths (the rim\'s copy)'],['The Mirror Room','Shutter store']],wealth:.6,
  want:['xanadu_veil_rack','xanadu_book_lectern','xanadu_signal_lectern','xanadu_common_signal_mirror'],only:['xanadu_book_lectern','xanadu_signal_lectern'],
  block:['xanadu|table','generic|table','eastabyss|table','generic|desk','eastabyss|desk'],stair:FE_TOWER_STAIR});
 /* the bench's lesser buildings (sheets E1, E2): each a range sized to its layout box (qb_fe_range: a 0.5 m plinth, storeys of
    3.6 m, its door in the middle of its front), the record's options giving its size */
 const RANGE=o=>{const hs=[];for(let i=0;i<(o.st==null?1:o.st);i++)hs.push(3.6);return{x:0,z:0,w:o.w==null?20:o.w,d:o.d==null?12:o.d,y:.5,hs};};
 const RANGES={
  granary:{levels:[['store','store'],['dormitory','store']],names:[['Granary'],['Lay Brothers\' Dormitory','Upper Granary']],wealth:.3},
  infirmary:{levels:[['dormitory','kitchen','store'],['dormitory','study']],names:[['Infirmary'],['Infirmary, upper ward']],wealth:.55},
  kitchen:{levels:[['kitchen','store'],['dormitory']],names:[['Great Kitchen'],['Cooks\' Dormitory']],wealth:.4},
  refectory:{levels:[['hall','kitchen']],names:[['Refectory']],wealth:.5,want:['xanadu_common_reader_seat']},
  bath:{levels:[['bath','store']],names:[['Bath House']],wealth:.45},
  woodstore:{levels:[['store','store']],names:[['Juniper and Wood Store']],wealth:.2},
  chapter:{levels:[['study','dormitory','dormitory'],['dormitory','dormitory'],['dormitory','dormitory','store']],names:[['the Master of Novices\' room','Chapter cells'],['Chapter cells (first floor)'],['Chapter cells']],wealth:.4},
  school:{levels:[['workshop','school'],['dormitory','signals']],names:[['The Mirror School (the mirror bench)'],['Mirror School Dormitory','The Code Room']],wealth:.6,
   want:['xanadu_mirror_bench','xanadu_signal_lectern','xanadu_common_signal_mirror'],only:['xanadu_mirror_bench','xanadu_signal_lectern']},
  shelter:{levels:[['dormitory','kitchen']],names:[['The Halfway Shelter']],wealth:.3}};
 for(const id in RANGES)BL.push(Object.assign({id,name:RANGES[id].names[0][0],part:id,sheet:'E1, E2',shell:RANGE,door:'drawn'},RANGES[id]));
 /* a court: four ranges R deep round a yard (qb_fe_court: a 0.5 m plinth, storeys of 3.6 m), the front one the gate (its outer
    door the record's, its door to the yard a more), the others open doorways from the yard. ranges: [front, west, east, back]
    programmes */
 const court=(id,part,name,R,ranges,wealth,o)=>{const sides=[['front',0,1],['west',-1,0],['east',1,0],['back',0,-1]];
  sides.forEach(([k,sx,sz],i)=>{const r=ranges[i];
   const shell=O=>{const W=O.w==null?30:O.w,D=O.d==null?40:O.d,st=O.st==null?2:O.st,hs=[];for(let j=0;j<st;j++)hs.push(3.6);
    return k==='front'?{x:0,z:D/2-R/2,w:W,d:R,y:.5,hs}:k==='back'?{x:0,z:-D/2+R/2,w:W,d:R,y:.5,hs,ry:Math.PI}:{x:sx*(W/2-R/2),z:0,w:D-2*R,d:R,y:.5,hs,ry:sx<0?Math.PI/2:-Math.PI/2};};
   BL.push(Object.assign({id:id+'.'+k,name:name+' ('+k+' range)',part,sheet:o.sheet,shell,wealth,
    door:k==='front'?'drawn':{n:[0,-1],t:0,w:1.2,h:2.3},more:k==='front'?[{level:0,n:[0,-1]}]:[]},r));});};
 court('novices','novices','The Novices\' Court',7,[
  {levels:[['lobby','school'],['school','study']],names:[['the gate passage','Novices\' School'],['Novices\' School','Master of Novices']]},
  {levels:[['hall','kitchen']].concat([['dormitory','dormitory']]),names:[['the refectory'],['Novices\' Dormitory']],want:['xanadu_common_reader_seat']},
  {levels:[['dormitory','store'],['dormitory','dormitory']],names:[['Novices\' Dormitory'],['Novices\' Dormitory']]},
  {levels:[['shrine','school'],['dormitory','dormitory']],names:[['the novices\' chapel','Novices\' School'],['Novices\' Dormitory']]}],.4,{sheet:'E1, E2'});
 court('foot','foothouse','The Foot House',7,[
  {levels:[['lobby','store'],['dormitory']],names:[['Gate','Stores'],['the muleteers']]},
  {levels:[['dormitory','dormitory'],['dormitory','dormitory']],names:[['Pilgrims\' Hostel'],['Pilgrims\' Hostel']]},
  {levels:[['stable','workshop'],['store','store']],names:[['Mule Stables','Harness room'],['Stores']]},
  {levels:[['kitchen','hall'],['dormitory','bedroom']],names:[['Kitchen','the hostel\'s hall'],['The Hosteller and the muleteers']]}],.4,{sheet:'F'});
 /* the towers (sheet T): the Mirror Tower (four lifts of 6 m tapering from 10 m; planned inside the top lift, its doorway run
    through the base) and the Labrang Tower (one 11 m block, 26 m: six storeys, one a bay) */
 BL.push({id:'tw.mirror',name:'The Mirror Tower',part:'tw.mirror',sheet:'T',shell:{x:0,z:0,w:8,d:8,y:.6,hs:[6,6,6,6]},door:'drawn',body:{hw:5,hd:5},
  levels:[['lobby'],['store'],['signals'],['signals']],names:[['The readers\' door'],['The signal store'],['The readers\' room'],['the lantern\'s watch']],wealth:.7,
  want:['xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_crimson_banner'],only:['xanadu_signal_lectern'],stair:FE_TOWER_STAIR});
 {const h=26/6;BL.push({id:'tw.labrang',name:'The Labrang Tower',part:'tw.labrang',sheet:'T',shell:{x:0,z:0,w:11,d:11,y:.8,hs:[h,h,h,h,h,h]},door:'drawn',
  levels:[['guard','store'],['dormitory'],['dormitory','store'],['cell','shrine'],['bedroom','study'],['signals','gallery']],
  names:[['The Prismarch\'s door and his guard'],['The household'],['The household'],['The Prismarch\'s cell and oratory'],['his chamber and study'],['The mirror room and the gallery']],wealth:.85,
  want:['xanadu_crimson_banner','xanadu_signal_lectern','xanadu_common_signal_mirror'],only:['xanadu_signal_lectern'],stair:FE_TOWER_STAIR});}
 /* the Red Monastery (sheets M1, M2): the gate tower (the Gate of the Open Eye; its door to the court an open doorway), the two
    front ranges either side of it, the side ranges and the back range round the Court of the Drum (each entered from the
    court), and the Assembly Hall with the Shrine of the Eye behind it; on a 0.8 m plinth */
 const MP=.8,MH=[3.6,3.4];
 BL.push({id:'mon.gate',name:'The Gate of the Open Eye',part:'red-monastery',sheet:'M1, M2',shell:{x:0,z:22.5,w:10,d:9,y:MP,hs:[3.8,3.4,3.2]},door:'drawn',
  more:[{level:0,n:[0,-1],t:0,w:2,h:2.8,open:true}],levels:[['lobby','store'],['hall'],['study']],names:[['Gate of the Open Eye','the porter\'s store'],['Drum of the Hours'],['the gate\'s watch']],wealth:.7,
  want:['xanadu_common_hour_drum','xanadu_crimson_banner']});
 const MR=(id,name,shell,levels,names,o)=>BL.push(Object.assign({id:'mon.'+id,name,part:'red-monastery',sheet:'M1, M2',shell,door:{n:[0,-1],t:0,w:1.2,h:2.3},levels,names,wealth:.55},o||{}));
 MR('sw','The Red Monastery\'s front range (west)',{x:-15.5,z:22.5,w:21,d:7,y:MP,hs:MH},[['shrine','store'],['dormitory','dormitory']],[['Sacristy','Lamp room for the Hall'],['Cells of the Rim Watch']],{want:['xanadu_crimson_banner']});
 MR('se','The Red Monastery\'s front range (east)',{x:15.5,z:22.5,w:21,d:7,y:MP,hs:MH},[['store','study'],['dormitory','dormitory']],[['the gate\'s store','the porter'],['Chapter cells (south-east)']]);
 MR('w','The Red Monastery\'s west range',{x:-22.5,z:0,w:38,d:7,y:MP,hs:MH,ry:Math.PI/2},[['library','study','dormitory'],['dormitory','dormitory']],[['Library of the Eye','Scriptorium','Old Brothers\' Cells'],['Chapter cells (west range)']],{want:['xanadu_book_lectern']});
 MR('e','The Red Monastery\'s east range',{x:22.5,z:0,w:38,d:7,y:MP,hs:MH,ry:-Math.PI/2},[['committee','store','dormitory'],['dormitory','dormitory']],[['Chapter House','Treasury','Chapter cells (east)'],['Chapter cells (east range)']],{want:['xanadu_crimson_banner']});
 MR('n','The Red Monastery\'s back range',{x:0,z:-22.5,w:52,d:7,y:MP,hs:MH,ry:Math.PI},[['dormitory','dormitory','store'],['bedroom','study','dormitory']],[['Chapter cells (north)'],['Prior','Chant-master','Chapter cells (back range)']]);
 BL.push({id:'mon.hall',name:'The Assembly Hall',part:'red-monastery',sheet:'M1, M2',shell:{x:0,z:-8.5,w:24,d:17,y:MP,hs:[5,4.2]},door:'drawn',
  levels:[['gallery','shrine'],['gallery','study']],names:[['Assembly Hall','Shrine of the Eye'],['Masters\' Gallery','the hall\'s store of texts']],wealth:.85,
  rows:[{level:0,kind:'gallery',key:'xanadu_common_meditation_cushion',dx:3.6,dz:1.7,margin:1.1},{level:1,kind:'gallery',key:'xanadu_common_meditation_cushion',dx:3.6,dz:1.8,margin:1.2}],
  want:['xanadu_crimson_banner','xanadu_common_hour_drum'],block:['xanadu|shrine']});
 /* the gatehouses (E1, E2: qb_fe_gate, a 0.4 m plinth, a passage front to back through the ground storey, the record's doors on
    both faces): the passage, and over the Mule Gate the porters' loft, over the Gate of Breath the Veil Room */
 const GATE=o=>({x:0,z:0,w:o.w==null?10:o.w,d:o.d==null?8:o.d,y:.4,hs:(o.st==null?2:o.st)>1?[4,3.6]:[4.2]});
 for(const [id,name,up] of[['g.rift','The Gate of the Rift',null],['g.mule','Mule Gate','Porters\' loft (the Mule Gate)'],['g.breath','Gate of Breath','The Veil Room (over the Gate of Breath)']])
  BL.push({id,name,part:id,sheet:'E1, E2',shell:GATE,door:'drawn',more:[{level:0,n:[0,-1]}],levels:up?[['lobby'],['guard','store']]:[['lobby']],
   names:up?[['the passage'],[up]]:[['the passage']],wealth:id==='g.breath'?.6:.45,want:id==='g.breath'?['xanadu_veil_rack','xanadu_crimson_banner']:[]});
 /* the corner towers (E1: two storeys of 6 m in an 8 m shaft under two red tiers, no door drawn; the precinct's walls stop at
    their faces, 89zfe): an open doorway on the side toward the bench (the north ones face south, the two on the Lip north) */
 for(const [id,n] of[['tw.nw',[0,1]],['tw.ne',[0,1]],['tw.sw',[0,-1]],['tw.se',[0,-1]]])
  BL.push({id,name:{'tw.nw':'North-west Tower','tw.ne':'North-east Tower','tw.sw':'South-west Tower (on the Lip)','tw.se':'South-east Tower (on the Lip)'}[id],part:id,sheet:'E1',
   shell:{x:0,z:0,w:8,d:8,y:.5,hs:[6,6]},door:{n,t:0,w:1.2,h:2.4},levels:[['guard'],['guard','store']],names:[['the watch room'],['the watch\'s loft']],wealth:.4,stair:FE_TOWER_STAIR});
 /* the Watch's hut on the rim (sheet P: four bunks, the Rim Watch on duty sleeping in turns) and the six shrines of the Way of
    Shrines (one room each, its door to the bridge that arrives) */
 BL.push({id:'hut',name:'The Watch\'s Hut',part:'hut',sheet:'E0, P',shell:{x:0,z:0,w:8,d:8,y:.4,hs:[3.2]},door:'drawn',levels:[['dormitory','kitchen']],
  names:[['the bunks','the hearth']],wealth:.3,want:['xanadu_veil_rack']});
 for(let i=1;i<=6;i++)BL.push({id:'shrine.'+i,name:'Shrine '+i+' of the Way of Shrines',part:'shrine.'+i,sheet:'E0',shell:{x:0,z:0,w:5,d:5,y:.4,hs:[3.2]},door:'drawn',
  levels:[['shrine']],names:[['the shrine']],wealth:.7,want:['xanadu_crimson_banner']});
 /* the lantern's floor: y over the record's base (the shaft 9.5 m on its 0.6 m plinth, the band and cornice 2.15, the floor 0.25),
    the lantern's width (the band's 6.65 x 0.92), the coals' place (the record's feFireB), the line's bearing from the post (the
    Beacon at 245 degrees: +z is south, +x east) */
 const b=245*Math.PI/180,platform={part:'post',y:.6+9.5+2.15+.25,lw:8*Math.pow(.94,3)*.92,pieces:[
  {key:'xanadu_eye_heliograph',at:[.35,1.0],ry:Math.atan2(Math.sin(b),-Math.cos(b))},
  {key:'xanadu_fire_basket',at:'coals',ry:0}],
  /* the way up from the Mirror Room (the post's top storey) through a hatch: an iron ladder against a wall where the room's pieces
     leave it room, its hatch on the lantern's floor */
  ladder:{building:'post',level:2,w:.6,d:.5}};
 const OWN=['xanadu_eye_heliograph','xanadu_fire_basket','xanadu_ember_hearth','xanadu_book_lectern','xanadu_mirror_bench','xanadu_crimson_banner','xanadu_veil_rack',
  'xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_common_hour_drum','xanadu_common_reader_seat',
  /* the Order of the Beacon's own: never here */
  'xanadu_court_gold_banner','xanadu_court_relic_lamp','xanadu_lamp_switchboard','xanadu_cable_drum','xanadu_generator_set','xanadu_lens_bench','xanadu_register_of_lights'];
 /* built at load (the sheets with views: L, H, P); the rest as the camera comes to them */
 const atLoad=['lip.mirror','lip.books','lip.guests','lip.labrang','ember.hall','ember.shaft','post'];
 return{buildings:BL,platform,OWN,atLoad,seed:34560};})();
