// prefix: et
// ================================================================= THE MACHINE LAYER (PLAN.md section 6, P4): what the Machine
// Talkers keep running. The Clock (its parade is data on its record, `clock`: 91c-et-clock.js draws and runs it, and a
// Godot importer reads the same record), the pneumatic tube's stations and pipes, the talking heads, and the relic hall
// built round an Ancient part.

/* the Clock: a bronze automaton bridging a street between two towers of stepped piers; a gold-ringed dial over a
   balcony between two doors, out of which the ancestors parade on the hour; a verdigris crown and a bell cupola. The
   record carries `clock`: the dial (centre, normal, radius) and the parade's track and figures, in world coordinates */
defBuilding({key:'et_clock',name:'The Clock',seed:7120,w:24,d:8,h:26,budget:120000,front:{x:0,z:4,yaw:0},
 tags:{types:['civic'],wealth:'rich',style:'ministry'},
 note:'an automaton bridging a street: a gold-ringed dial, a balcony between two doors where the ancestors parade on the hour, a verdigris crown and a bell cupola',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),vg=P('verdigris'),gold=etKeyCol('gold'),Z=2.5,DY=12.8,DR=2.3,BY=8.2;
  for(const s of [-1,1]){pushM(TF(s*8.6,0,0));etPierBundle({n:3,w:5,d:5,h0:17,step:1.6,mk:'brick',col:br,spire:4});popM();}
  box('paving',0,0,0,12,.05,8,P('paving'));
  box('brick',0,7,0,12.2,9,5,br);box('stone',0,7,0,12.4,.5,5.2,sd);                     /* the body over the street */
  for(let k=0;k<3;k++)box('verdigris',0,16+k*.6,0,11-k*3,.6,4.6-k*1.0,vg);
  pushM(TF(0,17.8,0));etOgee(1.5,0,2.2,{mk:'scale',seg:6,a0:0,col:vg,finial:1.2});popM();
  cyl('bronze',0,17.8,0,.08,.6,P('bronze'),6);sph('bronze',0,18.1,0,.35,P('bronze'));      /* the bell */
  // the dial: a dark face in a gold ring, the hours in gold (the hands are 91c-et-clock.js's)
  pushM(TF(0,DY,Z-.15,0,PI/2));cyl('plain',0,0,0,DR,.2,new THREE.Color(0x16181c),24);popM();   /* cyl() stands on y: turned to face +z */
  ring('gold',0,DY,Z+.06,DR+.12,.16,gold,0,PI/2);ring('verdigris',0,DY,Z+.02,DR+.45,.12,vg,0,PI/2);
  for(let i=0;i<12;i++){const a=i*TAU/12;box('gold',Math.sin(a)*DR*.84,DY+Math.cos(a)*DR*.84-.18,Z+.08,.14,i%3?.22:.36,.06,gold,-a);}
  // the balcony and its two doors
  box('stone',0,BY-.3,Z+.45,9.2,.3,1.4,sd);for(let i=0;i<12;i++)box('bronze',-4.4+i*.8,BY,Z+1.1,.05,.9,.05,P('bronze'));box('bronze',0,BY+.9,Z+1.1,9,.06,.06,P('bronze'));
  for(const s of [-1,1]){box('stone',s*3.8,BY,Z+.02,1.3,2.5,.06,new THREE.Color(sd).multiplyScalar(.4));etStepHead(s*3.8,BY+2.55,Z+.05,1.3,{mk:'verdigris',col:vg});}
  etMazeBand(0,15.0,Z+.03,11.6,.7);etFrieze(0,BY-1.6,Z+.03,11.6,1.0);
  for(const s of [-1,1])etFigure(s*5.1,16.6,Z-.9,2.4,{pose:'seat',metal:'gold'});
  // the parade: the track out of the left door, along the balcony, into the right; six ancestors in the metals of rank
  if(CURREC&&!PLACE_DRY){const W=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).applyMatrix4(CM);return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];};
   const n=new THREE.Vector3(0,0,1).transformDirection(CM);
   CURREC.clock={dial:W(0,DY,Z+.12),normal:[+n.x.toFixed(4),+n.y.toFixed(4),+n.z.toFixed(4)],radius:DR,
    track:[W(-3.8,BY,Z-1.2),W(-3.8,BY,Z+.7),W(3.8,BY,Z+.7),W(3.8,BY,Z-1.2)],figureH:1.9,period:60,
    figures:['gold','silver','bronze','gunmetal','bronze','silver'].map((m,i)=>({metal:m,seed:etSeedAt(-3.8,BY,Z+i,7)}))};}}});

/* the tube station: a hexagonal kiosk of pale brick, glazed above a dado behind steel, a verdigris fish-scale cap; inside,
   the bronze head of the tube in its niche, the clerk's capsule rack and desk; the pipe rises through the roof and runs
   off on a bracket (the census's power-house stokers and engineers: here the engineers of the revived tubes) */
function etHexPut(key,k,ap,inset,y){const ph=PI/6+k*PI/3,r=ap-inset;FURNISH(key,r*Math.cos(ph),y,r*Math.sin(ph),Math.atan2(-Math.cos(ph),-Math.sin(ph)));}
defBuilding({key:'et_tube_station',name:'Tube station',seed:7121,cut:true,w:10,d:10,h:9,budget:60000,
 tags:{types:['infrastructure'],wealth:'middle',style:'ministry'},
 note:'a hexagonal kiosk of pale brick, glazed above a dado, a verdigris fish-scale cap; the tube head in its niche, the capsule rack and the clerk inside; the pipe out through the roof',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),R=3.6,G=.4,H=3.4,ap=R*ET_HEX_AP,fw=R;
  prism('stone',etHex(R+.3),0,G,sd);prism('paving',etHex(R-.1),G,G+.03,P('paving'));
  etHexFaces(ap,(k)=>{if(k===1)etWall(fw,G,H,'brick',br,[{x:0,w:1.3,h:2.5,door:true,maskMetal:'lead',leaf:P('bronze')}],{frame:brD});
   else etWall(fw,G,H,'brick',br,[{x:0,w:fw-.9,h:1.9,y:1.0,steel:true,shut:false}],{frame:brD});
   if(k===4){pushM(TF(0,0,-ET_T/2-.02,PI));pushM(TF(0,G,0));etTubeHead(0,0,2.4,{top:H+.4});popM();popM();}});
  for(const q of etHex(R))box('brick',q[0],G,q[1],.42,H,.42,brD);
  prism('stone',etHex(R+.25),G+H,G+H+.25,sd);
  etOgee(R+.55,G+H+.25,2.8,{mk:'scale',seg:6,a0:0,col:P('verdigris'),finial:.9});
  pole('bronze',[0,G+H+.2,-ap+.4],[0,G+H+3.2,-ap+.4],.15,P('bronze'),10);
  etPipeRun([0,G+H+3.2,-ap+.4],[0,G+H+3.2,-ap-1.0],{posts:false});
  etHexPut('eternian_common_tube_rack',5,ap,.4,G);etHexPut('eternian_common_register_desk',3,ap,.5,G);
  etHexPut('eternian_common_bench',0,ap,.4,G);etHexPut('eternian_common_chest',2,ap,.45,G);}});

/* a pipe segment of the tube network, 10 m, on bracket posts: the city page runs these along its main streets between
   stations (a core/city overlay) and across the canals on the bridges */
defBuilding({key:'et_tube_pipe',name:'Tube pipe',seed:7122,cls:'feature',kind:'pipe',w:10.4,d:1,h:3.4,budget:8000,
 front:{x:0,z:.5,yaw:0},tags:{types:['infrastructure']},
 note:'a 10 m segment of bronze tube (0.3 m bore) on iron bracket posts',
 build(o){etPipeRun([-5,2.9,0],[5,2.9,0]);}});

/* the talking head: an Ancient terminal face woken by the Machine Talkers, in a stepped bronze surround on a wall of dark
   stone, cyan strips alive either side; the petition stand before it. The face is a cell of the owner's sheet, picked by
   where the head stands (never the deranged one: the page may choose it). Its record carries `voice` for the life pass */
defBuilding({key:'et_talking_head',name:'Talking head',seed:7123,cls:'feature',kind:'talking-head',w:5,d:3.4,h:5.4,budget:20000,
 front:{x:0,z:1.7,yaw:0},tags:{types:['civic']},
 note:'an Ancient terminal face in a stepped bronze surround on dark stone, cyan strips, a petition stand before it',
 build(o){const sd=P('stoneD'),br=P('bronze'),cy=new THREE.Color(0x39d6e8),FY=2.7,c=ET_FACE_CALM[KRAND.hash(etSeedAt(0,0,0,11),3)%ET_FACE_CALM.length];
  box('stone',0,0,-.7,4.6,4.8,.8,sd);for(let k=0;k<3;k++)box('stone',0,4.8+k*.22,-.7,4.6-k*1.2,.22,.9-k*.15,sd);
  for(let k=0;k<3;k++){const e=(2-k)*.24;box('bronze',0,FY-1.05-e/2,-.28+k*.04,2.3+e,2.1+e,.08,new THREE.Color(br).multiplyScalar(.76+k*.12));}   /* stepping in toward the face */
  etFaceScreen(0,FY,-.12,1.7,1.7,c);
  for(const s of [-1,1])box('glow',s*1.75,FY-1.2,-.27,.07,2.4,.04,cy);box('glow',0,FY-1.45,-.27,2.6,.06,.04,cy);
  FURNISH('eternian_court_petition_stand',0,0,1.3,PI);
  if(CURREC&&!PLACE_DRY)CURREC.voice={face:c,deranged:false};}});

/* the relic hall: a ministry built round an Ancient part (PLAN.md section 6). The gate is a turbine casing, a white ring
   with its blades and hub, set into the brick front; the apse a half-drum of Ancient white panels with live cyan strips;
   the hall between under celadon. The parts are drawn here until the port and Ancients kits' parts are read in place */
defBuilding({key:'et_relic_hall',name:'Relic hall',seed:7124,w:22,d:27,h:18,budget:120000,front:{x:0,z:7,yaw:0},
 tags:{types:['civic'],wealth:'rich',style:'ministry'},
 note:'a hall of pale brick built round Ancient parts: a turbine casing as its gate, a half-drum of white Ancient panels as its apse, a celadon roof',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),wh=etKeyCol('white'),cy=new THREE.Color(0x39d6e8),G=.8,W=16,D=14,H=10,RC=4.3,CY=G+RC+.4;
  box('stone',0,0,-3.2,W+1,G,22.6,sd);   /* the podium, under the apse too */
  pushM(TF(0,0,-1));
   // the front wall round the casing, the casing itself, the hub and blades
   pushM(TF(0,0,D/2));box('brick',-(W/2+RC+.4)/2-.0,G,0,W/2-RC-.4+.01,H,.8,br);box('brick',(W/2+RC+.4)/2,G,0,W/2-RC-.4+.01,H,.8,br);
    box('brick',0,G+2*RC+.8,0,2*RC+.8,H-2*RC-.8,.8,br);box('stone',0,G,0,2*RC+.8,.4,.8,sd);
    box('stone',0,G+.4,-.1,2*RC,2*RC,.1,new THREE.Color(sd).multiplyScalar(.35));
    for(const z of [-.6,0,.6])ring('white',0,CY,z,RC,.42,wh,0,PI/2);
    ring('glow',0,CY,.9,RC-.25,.05,cy,0,PI/2);
    pushM(TF(0,CY,-.5,0,PI/2));cyl('white',0,0,0,.8,1.0,wh,16);popM();
    for(let i=0;i<14;i++){const a=(i+.5)*TAU/14,sx=Math.sin(a),cx=Math.cos(a);beam('white',[sx*.8,CY+cx*.8,0],[sx*RC,CY+cx*RC,0],.08,wh,false,undefined,.5);}   /* the blades: never exactly vertical (beamQ) */
    etMazeBand(0,G+H-1.2,.42,W-.4,.7);
   popM();
   for(const s of [-1,1]){pushM(TF(s*W/2,0,0,s*PI/2));box('brick',0,G,0,D,H,.8,br);for(const x of [-4,0,4])etLancet(x,G+2.5,.42,1.0,5.5,{light:'glass'});popM();}
   box('stone',0,G+H,0,W+.6,.4,D+.6,sd);etHip(W,D,G+H+.4,5.5,{mk:'celadon',ov:.7,flare:.5,under:P('timber'),cap:P('celadon')});
   // the apse: a half-drum of Ancient white panels at the back, live cyan bands
   const AB=G+H-3.6;   /* the apse's drum stops short of the hall's wall head, so its dome stays under the roof line */
   lathe('white',0,-D/2,[[5.4,G],[5.4,AB]],18,wh,{a0:PI,a1:TAU,uv:'arc'});
   const AP=[[5.6,AB],[5.0,AB+1.2],[3.8,AB+2.1],[2.0,AB+2.7],[.05,AB+2.95]];
   lathe('white',0,-D/2,AP,18,wh,{a0:PI,a1:TAU});   /* the half-dome, closed to its crown */
   lathe('white',0,-D/2,[[5.3,G],[5.3,AB]].concat(AP.map(q=>[q[0]-.3,q[1]-.2])),18,wh,{a0:PI,a1:TAU,inward:true});   /* its inside, seen from the hall */
   /* the dome's flat face over the back wall, closed: a gable of white panels following its profile */
   {const F=AP.map(q=>[-q[0],q[1],-D/2]).concat(AP.slice(0,-1).reverse().map(q=>[q[0],q[1],-D/2]));etPoly2('white',F,wh,wh);
    box('white',0,AB-.2,-D/2,11.4,.5,.5,wh);}
   /* the hall's back wall, an arch into the apse; the apse's floor */
   box('brick',-5.5,G,-D/2,5,H,.8,br);box('brick',5.5,G,-D/2,5,H,.8,br);box('brick',0,G+6.4,-D/2,6,H-6.4,.8,br);
   box('stone',0,G+6.0,-D/2,6.4,.4,1.0,sd);box('paving',0,G-.04,-D/2-2.7,10.6,.05,5.3,P('paving'));
   for(const y of [G+1.6,G+3.6,G+5.6])lathe('glow',0,-D/2,[[5.45,y],[5.45,y+.08]],18,cy,{a0:PI,a1:TAU,uv:'arc'});
  popM();}});
