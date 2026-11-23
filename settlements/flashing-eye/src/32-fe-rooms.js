// ================================================================= THE FLASHING EYE: the rooms (the blueprint's sheets L, H and P as data)
// What each building of the house holds, storey by storey, in kits/interiors' room kinds: the programme kits/qiblai's qnIxType
// plans on the building's shell (89q5s: planBuilding, then the catalog's Xanadu pieces through qnFurnishRooms). Plain data in the
// building's own frame (the record's: origin at the plot's centre on its ground, +z the front, metres); the page's
// targets/cone/90fk-fe-interiors.js draws, furnishes, tags and walks it. Each building:
//   part     the FE_PLACE record it stands in (its key, place and level)
//   shell    {x, z, w, d, y, hs}: the box the storeys are planned in, inside the drawn body's narrowest part; hs each storey's
//            height, the lowest first
//   door     'drawn': the street door is the one the record drew on the shell's lowest storey (core/door, qnIxDoorOf); else
//            {n, t, w, h, leaf}: a door the record did not draw (n the face's outward normal, t along it), leaf: a shut plank
//            leaf drawn in it (a door into the rock)
//   more     the record's doors on a higher storey, each {level, n}: the door on that storey's face n (prog.doors)
//   body     {hw, hd}: the drawn body's half extents at the street door, when it is thicker than the shell (the doorway is run
//            through it)
//   levels   each storey's room kinds, the first taking the door (or the stair's top); names, the sheet's rooms they are
//   stair    kits/interiors' stair for its flights (a tower's steep one), else the planner's
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
  want:['xanadu_ember_hearth','xanadu_common_hour_drum','xanadu_book_lectern','xanadu_crimson_banner'],only:['xanadu_ember_hearth','xanadu_book_lectern'],block:['xanadu|shrine'],stair:FE_TOWER_STAIR});
 /* the Eye Post (sheet P): three storeys in its tapering shaft and band (planned inside the band, its narrowest), the door run
    through the thick base; the platform's heliograph and fire basket stand on the lantern's floor (platform). The Book of Breaths
    takes its whole storey (the sheet's signal store beside it leaves the lectern no room by the stair in a 5.4 m floor) */
 BL.push({id:'post',name:'The Eye Post',part:'post',sheet:'P',shell:{x:0,z:0,w:6,d:6,y:.6,hs:[3.88,3.88,3.89]},door:'drawn',body:{hw:4,hd:4},
  levels:[['dormitory','store'],['library'],['signals','store']],names:[['The Watch Room','Juniper store'],['The Book of Breaths (the rim\'s copy)'],['The Mirror Room','Shutter store']],wealth:.6,
  want:['xanadu_veil_rack','xanadu_book_lectern','xanadu_signal_lectern','xanadu_common_signal_mirror'],only:['xanadu_book_lectern','xanadu_signal_lectern'],
  block:['xanadu|table','generic|table','eastabyss|table','generic|desk','eastabyss|desk'],stair:FE_TOWER_STAIR});
 /* the lantern's floor: y over the record's base (the shaft 9.5 m on its 0.6 m plinth, the band and cornice 2.15, the floor 0.25),
    the lantern's width (the band's 6.25 x 0.92), the coals' place (the record's feFireB), the line's bearing from the post (the
    Beacon at 245 degrees: +z is south, +x east) */
 const b=245*Math.PI/180,platform={part:'post',y:.6+9.5+2.15+.25,lw:8*Math.pow(.94,4)*.92,pieces:[
  {key:'xanadu_eye_heliograph',at:[.35,1.0],ry:Math.atan2(Math.sin(b),-Math.cos(b))},
  {key:'xanadu_fire_basket',at:'coals',ry:0}]};
 const OWN=['xanadu_eye_heliograph','xanadu_fire_basket','xanadu_ember_hearth','xanadu_book_lectern','xanadu_mirror_bench','xanadu_crimson_banner','xanadu_veil_rack',
  'xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_common_hour_drum','xanadu_common_reader_seat',
  /* the Order of the Beacon's own: never here */
  'xanadu_court_gold_banner','xanadu_court_relic_lamp','xanadu_lamp_switchboard','xanadu_cable_drum','xanadu_generator_set','xanadu_lens_bench','xanadu_register_of_lights'];
 return{buildings:BL,platform,OWN,seed:34560};})();
