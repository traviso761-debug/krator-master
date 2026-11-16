// prefix: cy
// ================================================================= THE VALLEY (Ham-Hau): Catalhoyuk's rooms and houses
// The owner (2026-11-16): the Valley holds to Catalhoyuk more than Taos. Houses stand wall to wall with no streets, each with
// its own walls (the double walls of neighbours); a house is entered through its roof by a ladder that comes down beside the
// hearth and the oven on the room's south side; the rooms are plastered white inside, with raised platforms to sit, work and
// sleep on along the north and east, and bins on the west. In a village (56-cy-village.js, KHAMLET.platform on the tell) the
// roofs are the street; a lone house on the sheet carries its own outside ladder. The rich rooms are painted and set with
// horns (cyHorns: Catalhoyuk's bucrania, here goat horns and the coyote skull) under a frieze of running birds (cyBird).
//   cyMainRoom(ox,o)     the main room centred at (ox, 0): walls, floor, fixtures, roof, hatch, the inner ladder. o: IW, ID, H
//                        (inside sizes and wall height), holes, skip (to cyRing), store (a store room: jars and bins, no hearth),
//                        door {x} (an ear door in the south wall: an upper room opening onto its terrace), socle (0 on an upper
//                        storey), covered (a room stacked above: no kerb, no smoke), floorHole (the hatch of the room below
//                        comes through this floor), flush (the roof meets its neighbours'), paint (the horns and the frieze).
//                        Returns {top, x0, x1, z0, z1} (the roof's top and the wall lines)
//   cyHouse(o)           a lone house: the main room and its side stores ({side 'e'|'w', W, loom}), each store's ground door an ear
//                        door; o.carve the tribe's name beside the first store's door; o.roofWork the roof oven and screen;
//                        o.IW, o.paint for the headman's
//   cy_room, cy_house_poor, cy_house_mid, cy_house_head   the lone houses (the hamlet row's houses)
//   cy_cell, cy_cell_store   the village's cells (the platform row's room and store: 5.4 m square, flush roofs)
//   cy_shrine_room, cy_hall  the village's sunk rooms in the yard (the platform row's kivas): the painted shrine with its horns,
//                            and the council room with its benches
const CY_ROOM={IW:5.0,ID:4.2,H:2.75};
const CY_CELL={W:5.4,IW:5.4-2*.42,H:2.75};
function cyMainRoom(ox,o){o=o||{};const IW=o.IW==null?CY_ROOM.IW:o.IW,ID=o.ID==null?CY_ROOM.ID:o.ID,Hh=o.H==null?CY_ROOM.H:o.H,t=CY.WALL;
 const x0=ox-IW/2-t/2,x1=ox+IW/2+t/2,z0=-ID/2-t/2,z1=ID/2+t/2;
 const holes=Object.assign({},o.holes||{});
 if(o.door)holes.s=(holes.s||[]).concat(cyEarHoles(o.door.x-x0,.85,CY.DOOR_H));
 cyRing(x0,z0,x1,z1,0,Hh,{holes,skip:o.skip,socle:o.socle});
 /* the ladder from the floor up through the hatch, climbing north from beside the hearth; the hatch over its top */
 const zf=ID/2-.5,run=(Hh+.24-.06)/CY.LEAN,zt=zf-run,hole={x0:ox+.55,x1:ox+1.45,z0:zt-.08,z1:zt+1.0};
 const fl=o.floorHole?{x0:ox+.55,x1:ox+1.45,z0:zt-.08,z1:zt+1.0}:null;
 svWell('floor',ox,0,0,IW,.06,ID,P('floor'),fl);
 if(o.store){for(let i=0;i<4;i++)cyJar(ox-IW/2+.35+i*.62,-ID/2+.35,{h:.6+(i%2)*.15});
  cyBin(ox-IW/2+.3,-.2,PI/2);cyBin(ox-IW/2+.3,.5,PI/2);cyBin(ox+IW/2-.3,-1.0,-PI/2);}
 else{cyPlatform(ox-IW/2+1.3,-ID/2,ox+IW/2,-ID/2+.95,.28);
  cyPlatform(ox+IW/2-.85,-ID/2+.95,ox+IW/2,Math.min(.25,zt-.15),.16);
  cyHearth(ox,.55);cyOven(ox-IW/2+.95,ID/2-.55,PI);
  cyBin(ox-IW/2+.3,-ID/2+.85,PI/2);cyBin(ox-IW/2+.3,-ID/2+1.55,PI/2);}
 if(o.paint){cyHorns(ox-IW/2,0,-.1,PI/2,{n:3});cyHorns(ox-IW/2,0,-ID/2+1.6,PI/2,{n:2});
  const zf2=-ID/2+.02;box('plain',ox,1.62,zf2,IW-.3,.07,.006,P('red'));box('plain',ox,2.32,zf2,IW-.3,.05,.006,P('ochre'));
  for(let i=0;i<4;i++)cyBird(ox-IW/2+.75+i*(IW-1.3)/3,1.95,zf2,.5);}
 cyLadder(ox+1.0,zf,.06,Hh+.24,PI);
 const top=cyRoof(x0-t/2,z0-t/2,x1+t/2,z1+t/2,Hh,{hole,flush:o.flush});
 if(!o.covered){cyHatchFrame(hole,top,'n');smokeAt(ox+1.0,top+.3,zt+.4,{r:.3,kind:'fire'});}
 if(o.door)cyEarDoor(o.door.x,z1,0,.85,CY.DOOR_H,{name:o.store?'the store door':'the room door'});
 cyTarget(ox-.6,.06,-.2,o.store?'store floor':'room floor');if(!o.covered)cyTarget(ox-IW/2+.6,top,-ID/2+.4,'roof');
 return {top,x0,x1,z0,z1};}
/* the outside ladder of a lone house: against the south face at x, from the ground to the roof's top */
function cyOutLadder(x,top,ID){const z=(ID==null?CY_ROOM.ID:ID)/2+CY.WALL+.05,run=top/CY.LEAN;cyLadder(x,z+run,0,top,PI);}
function cyHouse(o){o=o||{};const IW=o.IW==null?CY_ROOM.IW:o.IW,ID=CY_ROOM.ID,t=CY.WALL,S=o.stores||[];
 const ext=s=>(S.find(q=>q.side===s)||{W:-t}).W+t,Le=S.some(q=>q.side==='e')?ext('e'):0,Lw=S.some(q=>q.side==='w')?ext('w'):0;
 const total=Lw+IW+2*t+Le,ox=-total/2+Lw+IW/2+t,dz=.8;
 const holes={};
 if(Le)holes.e=cyEarHoles(ID/2+t/2-dz,.8,1.95);
 if(Lw)holes.w=cyEarHoles(ID/2+t/2+dz,.8,1.95);
 const M=cyMainRoom(ox,{IW,holes,paint:o.paint});
 const z0=M.z0,z1=M.z1;let carved=!o.carve;
 for(const q of S){const SW=q.W,e=q.side==='e',xs0=e?M.x1:M.x1-(IW+t)-(SW+t),xs1=xs0+SW+t,sx=(xs0+xs1)/2;
  cyRing(xs0,z0,xs1,z1,0,CY_ROOM.H,{skip:e?'w':'e',holes:{s:cyEarHoles(SW/2+t/2,.95,CY.DOOR_H)}});
  box('floor',sx,0,0,SW,.06,ID,P('floor'));
  cyEarDoor(sx,z1,0,.95,CY.DOOR_H,{name:'the store door'});
  cyEarDoor(e?xs0:xs1,dz,e?PI/2:-PI/2,.8,1.95,{leaf:false});
  cyRoof(xs0-t/2,z0-t/2,xs1+t/2,z1+t/2,CY_ROOM.H,{});
  const far=e?xs1-t/2:xs0+t/2,inn=e?-1:1;
  if(q.loom)cyLoom(sx,-ID/2+.25,0,{w:Math.min(1.5,SW-.3),col:new THREE.Color(.5,.18,.36)});
  else for(let i=0;i<3;i++)cyBin(far+inn*.35,-1.4+i*.75,e?-PI/2:PI/2,{w:.55,h:.7});
  if(q.jars)for(let i=0;i<2;i++)cyJar(sx+(i-.5)*.7,ID/2-.6,{h:.75});
  cyTarget(sx,.06,-.6,'store floor');
  if(!carved){carved=true;const C=cyContour(CY_TRIBES[o.tribe||'valley'].hum+'.'),pz=z1+t/2,px=sx-(e?1.25:-1.25);
   box('lime',px,1.15,pz,1.1,.6,.03,P('lime'));
   if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs:cyCarve(C,px,1.22,pz+.015,.96,.42,{col:P('ochre')})};}}
 if(o.roofWork){const y=M.top;
  W(0,y,0,0,()=>{cyOven(ox-IW/2+.9,-ID/2+.75,0,{r:.42});box('reed',ox+.4,0,-ID/2-.1,IW*.7,1.15,.05,P('reed'));
   for(const s of [-1,1])pole('timber',[ox+.4+s*IW*.35,0,-ID/2-.1],[ox+.4+s*IW*.35,1.25,-ID/2-.1],.035,P('timber'),6);});}
 cyOutLadder(ox-1.6,M.top);
 return {ox,top:M.top,total};}
const CY_HOUSE_TAGS=(w)=>({types:['dwelling-single'],wealth:w,style:'valley',role:'house'});
defBuilding({key:'cy_room',name:'Valley room (one Catalhoyuk cell)',seed:9101,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_HOUSE_TAGS('poor'),w:6.1,d:6.9,h:3.95,budget:30000,cut:true,front:{x:-1.6,z:3.97,yaw:0},
 note:'the Valley tribe\'s unit (Ham-Hau): a main room entered through the roof by a ladder beside the hearth and oven; platforms, bins, white plaster; a lone cell carries an outside ladder',
 build(o){const M=cyMainRoom(0);cyOutLadder(-1.6,M.top);}});
defBuilding({key:'cy_house_poor',name:'Valley house (main room and store)',seed:9102,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_HOUSE_TAGS('poor'),w:8.4,d:6.9,h:3.95,budget:45000,cut:true,
 note:'a main room and a side store; the store\'s ground door is the ear door, the culture\'s mark (PLAN.md section 2), with the tribe\'s Hum name carved beside it',
 build(o){cyHouse({stores:[{side:'e',W:2.0}],carve:true});}});
defBuilding({key:'cy_house_mid',name:'Valley house (two stores and a roof oven)',seed:9103,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_HOUSE_TAGS('middle'),w:10.9,d:6.9,h:3.95,budget:60000,cut:true,
 note:'a main room between two stores; on the roof the household\'s work floor: a domed oven and a reed screen against the wind',
 build(o){cyHouse({stores:[{side:'e',W:2.0,jars:true},{side:'w',W:2.0}],carve:true,roofWork:true});}});
defBuilding({key:'cy_house_head',name:'Valley headman house (painted room and loom room)',seed:9104,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_HOUSE_TAGS('rich'),w:12.1,d:6.9,h:3.95,budget:80000,cut:true,
 note:'the headman\'s: a larger main room painted with running birds and set with horn pillars, a loom room and a store; the roof oven and screen',
 build(o){cyHouse({IW:6.0,stores:[{side:'e',W:2.2,loom:true},{side:'w',W:2.0,jars:true}],carve:true,roofWork:true,paint:true});}});
/* the village's cells: one room on its cell of the tell's grid, as KHAMLET.platform's record gives it (o.rec: storey, entry,
   door; o.covered when a room stands on it; o.floorHole when one stands under it). Front +z: toward the yard */
function cyCell(o,store){const r=o.rec||{},IW=CY_CELL.IW;
 const M=cyMainRoom(0,{IW,ID:IW,store,flush:true,socle:r.storey>0?0:null,covered:!!o.covered,floorHole:!!o.floorHole,
  door:r.entry==='door'?{x:-.05}:null,paint:!!(r.head&&!store&&o.paintHead)});
 if(!o.rec)cyOutLadder(-1.6,M.top,IW);}   /* a lone cell on the sheet: its own ladder up (in a village the roofs are the street) */
defBuilding({key:'cy_cell',name:'Valley village room (a cell of the tell)',seed:9105,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_HOUSE_TAGS('poor'),w:CY_CELL.W,d:CY_CELL.W,h:2.99,budget:30000,cut:true,front:{x:-1.6,z:4.15,yaw:0},
 note:'one room of a Valley village on its tell (KHAMLET.platform\'s room): entered by the roof, or by an ear door onto the terrace in front of an upper room; its roof the street',
 build(o){cyCell(o||{},false);}});
defBuilding({key:'cy_cell_store',name:'Valley village store (a cell of the tell)',seed:9106,cls:'building',kind:'store',frag:'kits/coyote',
 tags:{types:['industry'],wealth:'poor',style:'valley',role:'store'},w:CY_CELL.W,d:CY_CELL.W,h:2.99,budget:24000,cut:true,front:{x:-1.6,z:4.15,yaw:0},
 note:'a village store room on the tell (KHAMLET.platform\'s store): jars and bins, entered by its roof',
 build(o){cyCell(o||{},true);}});
/* the sunk rooms in the yard: walls from the record's floor, the roof 0.84 m over the yard, two steps up to it */
function cySunk(o,kind){const W0=5.0,t=CY.WALL,IW=W0-2*t,Hh=o.h==null?3.2:o.h,x0=-IW/2-t/2,x1=IW/2+t/2;
 cyRing(x0,x0,x1,x1,0,Hh,{socle:0});
 box('floor',0,0,0,IW,.06,IW,P('floor'));
 if(kind==='shrine'){cyHorns(-IW/2,0,-.6,PI/2,{n:3});cyHorns(-IW/2,0,.7,PI/2,{n:3});cyHorns(IW/2,0,-.2,-PI/2,{n:2});
  cyPlatform(-.7,-IW/2,.7,-IW/2+.7,.5);const zf2=-IW/2+.02;
  box('plain',0,1.55,zf2,IW-.3,.08,.006,P('red'));for(let i=0;i<3;i++)cyBird(-IW/2+.75+i*(IW-1.5)/2,1.95,zf2,.55);
  cyHearth(.3,.35,{r:.32});}
 else{cyPlatform(-IW/2,-IW/2,IW/2,-IW/2+.6,.42);cyPlatform(-IW/2,-IW/2+.6,-IW/2+.6,IW/2-.2,.42);cyPlatform(IW/2-.6,-IW/2+.6,IW/2,IW/2-.2,.42);
  cyHearth(0,.2,{r:.4});}
 const zf=IW/2-.45,run=(Hh+.24-.06)/CY.LEAN,zt=zf-run,hole={x0:.65,x1:1.45,z0:zt-.08,z1:zt+1.0};
 cyLadder(1.05,zf,.06,Hh+.24,PI);
 const top=cyRoof(x0-t/2,x0-t/2,x1+t/2,x1+t/2,Hh,{hole,flush:true});cyHatchFrame(hole,top,'n');
 /* two steps from the yard up to the roof, each half the rise (a walker's step), against the south face */
 const yard=top-.84,hs=(top-yard)/2,zo=x1+t/2;
 box('render',-1.0,yard+hs,zo+.2,1.6,hs,.4,P('mudL'));box('render',-1.0,yard,zo+.2,1.6,hs,.4,P('mudL'));
 box('render',-1.0,yard,zo+.6,1.6,hs,.4,P('mudL'));
 cyTarget(-.5,.06,0,kind==='shrine'?'shrine floor':'hall floor');cyTarget(-1.2,top,-1.2,'roof');}
defBuilding({key:'cy_shrine_room',name:'Valley shrine room (sunk, painted, horned)',seed:9107,cls:'building',kind:'shrine',frag:'kits/coyote',
 tags:{types:['religious'],wealth:'middle',style:'valley',role:'shrine'},w:5.0,d:6.0,h:3.6,budget:40000,cut:true,front:{x:-1.0,z:3.4,yaw:0},
 note:'the village\'s shrine (the platform row\'s kiva): sunk into the tell, entered through its roof; horn pillars, the running birds painted over a red band, an offering bench',
 build(o){cySunk(o||{},'shrine');}});
defBuilding({key:'cy_hall',name:'Valley council room (sunk, benched)',seed:9108,cls:'building',kind:'hall',frag:'kits/coyote',
 tags:{types:['civic'],wealth:'middle',style:'valley',role:'council'},w:5.0,d:6.0,h:3.8,budget:30000,cut:true,front:{x:-1.0,z:3.4,yaw:0},
 note:'the village\'s council room (the platform row\'s great kiva): sunk into the tell, benches on three sides round the hearth',
 build(o){cySunk(Object.assign({h:3.4},o||{}),'hall');}});
