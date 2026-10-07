// prefix: zc
// ================================================================= CIVIC (PLAN.md 6.4): the council, the cistern hall, the portal, the caravanserai, the town hall
// The carved ones' void plans are their interiors items (kits/interiors/sets/zeijani.js); drawn here: what stands on the ground,
// on the faces and roofs. The council is SUNK (cut down into the ground: no rock block).

/* the council: a stepped cross in relief on the cross's roof at the ground; labyrinth reliefs on its arms' ends (the west end
   framed as its door), windows on its sides, stone lanterns round the trench and at the stair's head */
function zcPlus(a,b,cx,cz){return [[cx-a,cz-b],[cx-b,cz-b],[cx-b,cz-a],[cx+b,cz-a],[cx+b,cz-b],[cx+a,cz-b],[cx+a,cz+b],[cx+b,cz+b],[cx+b,cz+a],[cx-b,cz+a],[cx-b,cz+b],[cx-a,cz+b]];}
function zcLantern(x,z,c){zfColumn('tuffPol',x,0,z,.22,1.5,c);box('tuffPol',x,1.5,z,.62,.08,.62,c);sph('glow',x,1.72,z,.13,P('flame'),1,10);box('tuffPol',x,1.86,z,.62,.08,.62,c);haloAt(x,1.75,z,0xffb04a,false);}
defBuilding({key:'zj_council',name:'The council: a cross cut in a trench',seed:4901,sunk:true,
 tags:{types:['civic'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:30,d:44,h:11,
 note:'a cross of rock left standing in a trench 9 m deep, its roof at the ground; down a stair-tunnel; the council hall inside the cross, the dais in its east arm',
 build(o){const it=zjItem('zj_council');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white'),C=[0,-8],Y=-9;
  prism('tuffPol',zcPlus(8.4,2.4,C[0],C[1]),.3,.5,c);prism('tuffPol',zcPlus(7.2,1.6,C[0],C[1]),.5,.7,c);prism('tuffPol',zcPlus(5.8,.9,C[0],C[1]),.7,.9,c);
  /* the arms' ends (east, north, south: a labyrinth relief; west: the door's frame) */
  for(const [cx,cz,ry] of [[9,C[1],PI/2],[0,C[1]-9,PI],[0,C[1]+9,0]])W(cx,0,cz,ry,()=>zkBand('patLabyrinth',-2.4,2.4,0,Y+2.6,3.2,0,c));
  W(-9,0,C[1],-PI/2,()=>{for(const s of [-1,1])box('tuffPol',s*.92,Y,.12,.3,2.9,.3,c);zfStepLintel('tuffPol',0,Y+2.9,.14,2.0,c,{n:3,h:.3,d:.3});zkBand('patLabyrinth',-2.4,2.4,0,Y+4.6,2.2,0,c);});
  /* windows on the eight side faces: a dark recess in a frame */
  for(const sx of [-1,1])for(const sz of [-1,1]){
   W(sx*6,0,C[1]+sz*3,sz>0?0:PI,()=>{box('basaltPol',0,Y+4.2,.02,.9,1.3,.04,P('soot'));box('tuffPol',0,Y+4.08,.08,1.3,.12,.18,c);box('tuffPol',0,Y+5.5,.08,1.3,.16,.18,c);});
   W(sx*3,0,C[1]+sz*6,sx>0?PI/2:-PI/2,()=>{box('basaltPol',0,Y+4.2,.02,.9,1.3,.04,P('soot'));box('tuffPol',0,Y+4.08,.08,1.3,.12,.18,c);box('tuffPol',0,Y+5.5,.08,1.3,.16,.18,c);});}
  for(const [x,z] of [[-13.6,-21.6],[13.6,-21.6],[-13.6,5.6],[13.6,5.6],[-2.6,20.2],[2.6,20.2]])zcLantern(x,z,c);
  door(-9,Y,C[1],-PI/2,1.6);}});
