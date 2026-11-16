// prefix: cy
// ================================================================= THE VALLEY (Ham-Hau): the Catalhoyuk room and the poor house
// The owner (2026-11-16): the Valley holds to Catalhoyuk more than Taos. Houses stand wall to wall with no streets; a house is
// entered through its roof by a ladder that comes down beside the hearth and the oven on the room's south side; the rooms are
// plastered white inside, with raised platforms to sit, work and sleep on along the north and east, and bins on the west. In
// a village (KHAMLET.platform, C2) the roofs are the street: a lone house on the sheet carries its own outside ladder.
//   cy_room          one cell: the main room, roof hatch, the two ladders. The platform village's unit (PLAN.md section 6)
//   cy_house_poor    a main room and a side store with its own ground door: the EAR DOOR (the owner will judge it in practice),
//                    the tribe's Hum name carved on a plastered panel beside it, the store reached from the room through a
//                    second, open ear doorway
const CY_ROOM={IW:5.0,ID:4.2,H:2.75};
/* the main room, its centre at (ox,0): walls, floor, the fixtures, the roof and its hatch, the inner ladder. o.holes and o.skip
   go to cyRing. Returns the roof's top. */
function cyMainRoom(ox,o){o=o||{};const R=CY_ROOM,t=CY.WALL,x0=ox-R.IW/2-t/2,x1=ox+R.IW/2+t/2,z0=-R.ID/2-t/2,z1=R.ID/2+t/2;
 cyRing(x0,z0,x1,z1,0,R.H,{holes:o.holes,skip:o.skip});
 box('floor',ox,0,0,R.IW,.06,R.ID,P('floor'));
 /* the fixtures (south: the ladder's foot, the hearth and the oven; north and east: the platforms; west: the bins) */
 cyPlatform(ox-1.2,-R.ID/2,ox+R.IW/2,-R.ID/2+.95,.28);
 cyPlatform(ox+R.IW/2-.85,-R.ID/2+.95,ox+R.IW/2,.25,.16);
 cyHearth(ox,.55);cyOven(ox-1.5,R.ID/2-.55,PI);
 cyBin(ox-R.IW/2+.3,-1.25,PI/2);cyBin(ox-R.IW/2+.3,-.55,PI/2);
 /* the ladder from the floor up through the hatch, climbing north; the hatch over its top */
 const L=cyLadder(ox+1.0,1.6,.06,R.H+.24,PI);
 const hole={x0:ox+.55,x1:ox+1.45,z0:.3,z1:1.35};
 const top=cyRoof(x0-t/2,z0-t/2,x1+t/2,z1+t/2,R.H,{hole});
 cyHatchFrame(hole,top,'n');
 smokeAt(ox+1.0,top+.3,.8,{r:.3,kind:'fire'});
 cyTarget(ox-.6,.06,-.2,'room floor');cyTarget(ox-1.5,top,-1.4,'roof');
 return top;}
/* the outside ladder of a lone house: against the south face at x, from the ground to the roof's top */
function cyOutLadder(x,top){const z=CY_ROOM.ID/2+CY.WALL+.05,run=top/CY.LEAN;cyLadder(x,z+run,0,top,PI);}
defBuilding({key:'cy_room',name:'Valley room (one Catalhoyuk cell)',seed:9101,cls:'building',kind:'house',frag:'kits/coyote',
 tags:{types:['dwelling-single'],wealth:'poor',style:'valley',role:'house'},w:6.1,d:6.9,h:3.95,budget:30000,cut:true,
 front:{x:-1.6,z:3.97,yaw:0},
 note:'the Valley tribe\'s unit (Ham-Hau): a main room entered through the roof by a ladder beside the hearth and oven; platforms, bins, white plaster; a lone cell carries an outside ladder',
 build(o){const top=cyMainRoom(0);cyOutLadder(-1.6,top);}});
defBuilding({key:'cy_house_poor',name:'Valley house (main room and store)',seed:9102,cls:'building',kind:'house',frag:'kits/coyote',
 tags:{types:['dwelling-single'],wealth:'poor',style:'valley',role:'house'},w:8.4,d:6.9,h:3.95,budget:45000,cut:true,
 note:'a main room and a side store; the store\'s ground door is the ear door, the culture\'s mark (PLAN.md section 2), with the tribe\'s Hum name carved beside it',
 build(o){const R=CY_ROOM,t=CY.WALL,SW=2.0,ox=-(SW+t)/2;
  const xs0=ox+R.IW/2+t/2,xs1=xs0+SW+t,z0=-R.ID/2-t/2,z1=R.ID/2+t/2,sx=(xs0+xs1)/2;
  /* the main room, its east wall holding the open ear doorway into the store (east wall: at from its south corner) */
  const top=cyMainRoom(ox,{holes:{e:cyEarHoles(R.ID/2+t/2-.8,.8,1.95)}});
  /* the store: south, east and north walls (the main room's east wall is its west); the ear door in the south face */
  cyRing(xs0,z0,xs1,z1,0,R.H,{skip:'w',holes:{s:cyEarHoles(SW/2+t/2,.95,2.0)}});
  box('floor',sx,0,0,SW,.06,R.ID,P('floor'));
  cyEarDoor(sx,z1,0,.95,2.0,{name:'the store door'});
  cyEarDoor(xs0,.8,PI/2,.8,1.95,{leaf:false});
  cyRoof(xs0-t/2,z0-t/2,xs1+t/2,z1+t/2,R.H,{});
  for(let i=0;i<3;i++)cyBin(xs1-t/2-.35,-1.4+i*.75,-PI/2,{w:.55,h:.7});
  cyTarget(sx,.06,-.6,'store floor');
  /* the tribe's name, carved on a plastered panel beside the door (the culture's rule: the script on the wall that faces the road) */
  const C=cyContour(CY_TRIBES.valley.hum+'.'),pz=z1+t/2,px=sx-1.25;
  box('lime',px,1.15,pz,1.1,.6,.03,P('lime'));
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs:cyCarve(C,px,1.22,pz+.015,.96,.42,{col:P('ochre')})};
  cyOutLadder(ox-1.6,top);}});
