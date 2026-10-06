// prefix: nr
// ================================================================= THE ARCOLOGY: the def that holds everything in the hull frame
// place('nr-arcology', 0, 0, 0, {y: -NR_SEA_H}) puts the hull's keel origin under the sea; its build pushes the list, trim
// and heading (NR_HULL's rotation) and draws, in the hull frame: the shell (40), the decks and cabins (42), the atrium (44),
// the bridge, dining room and engine room (46), the holds (47), the top deck (48); then it places the deck buildings on
// their lots (5x), the pirates' timber (62) and the park flora (64) as child defs. The furnishing pass runs after the
// world is built (70-nr-interiors.js, called from 91f-furnish.js's buildWorld).
defBuilding({key:'nr-arcology',name:"Noah's Regret (the grounded arcology)",seed:4000,cls:'building',kind:'arcology',
 tags:{types:['infrastructure','dwelling-multi','military'],wealth:'middle',style:'floating harbour',role:"Bloody Ruephus's pirate base"},
 w:2*(NR.A+NR.W.PONT)+16,d:2*(NR.B+NR.W.PONT)+140,   /* the stem's rake; the breakwater piers out to sea (41) */
 h:NR.L.TOP+70,budget:6e6,
 front:{x:0,z:0,yaw:0},
 note:'a ring of pontoon hull round a harbour basin, four decks of cabins and public rooms, a top deck of parks and Ancient mid-rises; aground on the south shore, listing 0.8 degrees to port',
 build(){const R=NR_HULL.R;
  pushM(new THREE.Matrix4().set(R[0],R[1],R[2],0, R[3],R[4],R[5],0, R[6],R[7],R[8],0, 0,0,0,1));
  try{
   for(const [nm,fn] of NR_PARTS){const t0=GSTAT.tris;try{fn();}catch(e){reportErr('part '+nm+': '+(e.stack||e));}NR_PART_TRIS[nm]=Math.round(GSTAT.tris-t0);}
   for(const Lt of NR.LOTS){if(!DEFS[Lt.key]){reportErr('no def for lot '+Lt.id+': '+Lt.key);continue;}
    place(Lt.key,Lt.x,Lt.z,Lt.ry,{y:Lt.y,lot:Lt,name:DEFS[Lt.key].name+' ('+({hq:"Ruephus's headquarters",barracks:'barracks',mess:'the mess hall'})[Lt.use]+')',
     tags:{role:Lt.use==='hq'?"Ruephus's headquarters":Lt.use==='mess'?'mess hall':'barracks',types:Array.from(new Set((DEFS[Lt.key].tags.types||[]).concat(['military'])))}});}
   for(const [nm,fn] of NR_AFTER){try{fn();}catch(e){reportErr('after '+nm+': '+(e.stack||e));}}
  }finally{popM();}}});
