// prefix: tb
// ================================================================= THE CAVERN TEST BLOCK (P2): the cavern module's first consumer
// A block of tuff on the sheet with a carved front, and behind it what a carved def is made of (PLAN.md 6.3): a doorway, a
// vaulted antechamber (hewn), a domed hall (polished) under a skylight shaft that opens on the block's top, a plastered side
// room with a carved bed shelf, and a stair down to a basalt lava tube with a flow ledge, running out under the sheet.
// Local frame: origin at the foot of the front, the rock behind it (-z), +z out of the face. Every floor is walkable in F.
const TB_HALL=[0,-10.5],TB_HALLR=3.5;
function tbCircle(cx,cz,r,n){const P=[];for(let i=0;i<n;i++){const a=i*TAU/n;P.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}return P;}
defBuilding({key:'zj_testblock',name:'Cavern test block: a carved front, rooms, a stair down to a lava tube',seed:4101,cls:'feature',kind:'cavern-test',originFront:true,
 tags:{style:'carved',rock:'tuff'},w:28,d:32,h:12.5,note:'the cavern module (core/terrain/39-core-cavern.js) on the kit sheet: its floors are walkable in F',
 build(o){
  /* the rock: a block of tuff standing on the sheet, its top domed */
  cvMass({id:'rock',poly:[[-12,-16],[12,-16],[12,0],[-12,0]],y0:-.5,y1:10,taper:.04,cap:1.5,rock:'tuff',finish:'raw'});
  /* the way in: a level passage through the front, then a vaulted antechamber */
  cvStair({id:'door',joins:['ante'],a:[0,0,-1.6],b:[0,0,1.4],w:1.6,h:2.6,finish:'hewn'});
  cvDoor({id:'front',c:[0,0],y:0,r:1.8});
  cvRoom({id:'ante',poly:[[-3,-6],[3,-6],[3,-1.2],[-3,-1.2]],y:0,h:2.9,ceil:'vault',rise:.8,r:.4,finish:'hewn'});
  /* the domed hall, polished, under its skylight */
  cvStair({id:'ante-hall',joins:['ante','hall'],a:[0,0,-5.6],b:[0,0,-7.4],w:1.4,h:2.4,finish:'polished'});
  cvRoom({id:'hall',poly:tbCircle(TB_HALL[0],TB_HALL[1],TB_HALLR,20),y:0,h:3,ceil:'dome',rise:1.8,finish:'polished'});
  cvShaft({id:'sky',joins:['hall'],c:TB_HALL,y0:4.4,y1:12.4,r0:.65,r1:.8,finish:'polished'});
  cvDoor({id:'skylight',c:TB_HALL,y:11.2,r:1.4});
  /* a plastered side room off the antechamber, its bed shelf carved */
  cvStair({id:'ante-side',joins:['ante','side'],a:[2.6,0,-5],b:[4.9,0,-5],w:1.1,h:2.2,finish:'hewn'});
  cvRoom({id:'side',poly:[[4.5,-9],[9,-9],[9,-4],[4.5,-4]],y:0,h:2.8,finish:'plaster',r:.3});
  cvFixture({id:'bedshelf',kind:'bedshelf',box:[7.9,8.85,-8.7,-6.5,0,.5]});
  /* down to the tube: a stair from the hall's west side, under the block, to a basalt lava tube with a flow ledge */
  cvStair({id:'down',joins:['hall','tube'],a:[-3.1,0,-10.5],b:[-12.6,-8,-10.5],w:1.5,h:2.5,finish:'hewn'});
  cvTube({id:'tube',joins:['down'],pts:[[-13.6,-8,-10.5],[-13.6,-8.2,4],[0,-8.4,12],[16,-8.7,14]],w:6,h:4.6,ledge:{v:1.6,d:.5},blend:2.5,rock:'basalt'});
  /* the front's dressing: a stepped lintel in polished tuff over the doorway, two steps of sill */
  const c=P('white');
  box('tuffPol',0,2.72,-.1,3.2,.34,.35,c);box('tuffPol',0,3.06,-.12,2.4,.3,.3,c);box('tuffPol',0,3.36,-.14,1.6,.26,.26,c);
  door(0,0,0,0,1.6);}});
