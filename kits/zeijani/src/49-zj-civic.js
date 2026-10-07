// prefix: zc
// ================================================================= CIVIC (PLAN.md 6.4): the council, the cistern hall, the portal, the caravanserai, the town hall
// The carved ones' void plans are their interiors items (kits/interiors/sets/zeijani.js); drawn here: what stands on the ground,
// on the faces and roofs. The council is SUNK (cut down into the ground: no rock block), after Kailasa.

/* the council (after Kailasa, cut down into the ground; its plan: the council's item): the gatehouse's face in the pit's front
   wall over the tunnel's mouth, the council hall's base moulding, friezes, pilasters, windows and parapet, a tiered tower on its
   roof (the ground's level) crowned with a stone disc and a copper finial, the pavilion's stepped roof, the bridges' parapets,
   the two lamp pillars, stone lanterns round the rim and at the lane's head */
function zcLantern(x,z,c){zfColumn('tuffPol',x,0,z,.22,1.5,c);box('tuffPol',x,1.5,z,.62,.08,.62,c);sph('glow',x,1.72,z,.13,P('flame'),1,10);box('tuffPol',x,1.86,z,.62,.08,.62,c);haloAt(x,1.75,z,0xffb04a,false);}
defBuilding({key:'zj_council',name:'The council: a hall cut from the rock in its pit',seed:4901,sunk:true,
 tags:{types:['civic'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:46,d:92,h:24,
 note:'after Kailasa, cut down into the ground: a pit 12 m deep down a sunken lane; the council hall left standing (the pillared chamber, a tiered tower on its roof), the pavilion, bridges of rock, two lamp pillars, cloisters',
 build(o){const it=zjItem('zj_council');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white'),Y=-12,U=-5.5;
  /* the gatehouse's face (the pit's front wall, z 14, facing into the pit) */
  W(0,0,14,PI,()=>{for(const s of [-1,1])box('tuffPol',s*1.36,Y,.12,.3,3.0,.32,c);zfStepLintel('tuffPol',0,Y+3.0,.14,3.2,c,{n:3,h:.3,d:.32});
   for(const s of [-1,1]){zkBand('patFriezeC',s*3.2,s*9.2,0,Y+1.2,3.4,0,c);box('tuffPol',s*6.2,Y,.12,6.4,.5,.4,c);}
   for(const s of [-1,1])for(const x of [2.4,9.8])box('tuffPol',s*x,Y,.1,.5,11.4,.3,c);
   box('tuffPol',0,-6.6,.2,20.6,.4,.5,c);zkBand('patFriezeB',-9.6,9.6,0,-4.6,1.4,0,c);box('tuffPol',0,-1.6,.2,20.6,.4,.6,c);});
  for(let i=0;i<9;i++){const x=-8+i*2;box('tuffPol',x,0,14.3,.9,.5,.6,c);box('tuffPol',x,.5,14.3,.5,.3,.6,c);}
  /* the hall (x ±11, z -38..-10, y -12..0): base moulding, friezes (the flanks split at their stairs), pilasters, windows, cornice, parapet */
  const faces=[[0,-10,0,22,[[-11,11]]],[0,-38,PI,22,[[-11,11]]],[-11,-24,-PI/2,28,[[-14,-3.2],[.8,14]]],[11,-24,PI/2,28,[[-14,-.8],[3.2,14]]]];
  for(const [cx,cz,ry,L,spans] of faces)W(cx,0,cz,ry,()=>{
   for(const [a,b] of spans){box('tuffPol',(a+b)/2,Y,.1,b-a,.5,.5,c);zkBand('patFriezeB',a+.3,b-.3,0,Y+1.0,1.8,0,c);}
   for(let x=-L/2+1.5;x<=L/2-1.4;x+=3.5){box('tuffPol',x,Y+3.2,.08,.45,8.6,.26,c);}
   for(let x=-L/2+3.25;x<=L/2-3;x+=3.5){if(ry===0&&Math.abs(x)<1.8)continue;box('basaltPol',x,U+.6,.02,1.0,1.8,.04,P('soot'));box('tuffPol',x,U+.48,.1,1.4,.12,.2,c);box('tuffPol',x,U+2.4,.1,1.4,.18,.2,c);}
   box('tuffPol',0,-1.3,.18,L+.4,.5,.5,c);});
  for(const [x0,x1,z0,z1] of [[-11,11,-10.3,-9.9],[-11,11,-38.1,-37.7],[-11.1,-10.7,-38,-10],[10.7,11.1,-38,-10]])box('tuffPol',(x0+x1)/2,0,(z0+z1)/2,x1-x0,.6,z1-z0,c);
  /* the tower on the hall's roof, over its back: six receding tiers, a niche band on each, the stone disc and the finial */
  for(let i=0;i<6;i++){const w=14-2*i,d=12-1.8*i,y=i*1.5;box('tuffPol',0,y,-30,w,1.35,d,c);box('tuffPol',0,y+1.35,-30,w+.3,.15,d+.3,c);
   for(const s of [-1,1])box('basaltPol',0,y+.35,-30+s*(d/2+.005),w*.5,.6,.02,P('soot'));}
  cyl('tuffPol',0,9,-30,1.5,.5,c,16);cyl('tuffPol',0,9.5,-30,.8,.4,c,12);cone('copper',0,9.9,-30,.35,1.4,P('copper'),12);
  for(const [x,z] of [[-9,-12],[9,-12]]){zfDrum('tuffPol',x,0,z,1.1,.9,c,{seg:16});zfDome('tuffPol',x,.9,z,1.15,1.0,c,{seg:16,rows:6});}
  /* the pavilion (x ±4, z -4..3): a frieze, a stepped roof from -1.5 */
  for(const [cx,cz,ry,L] of [[0,3,0,8],[0,-4,PI,8],[-4,-.5,-PI/2,7],[4,-.5,PI/2,7]])W(cx,0,cz,ry,()=>zkBand('patFriezeC',-L/2+.3,L/2-.3,0,Y+1.2,1.6,0,c));
  for(let i=0;i<3;i++)box('tuffPol',0,-1.5+i*.6,-.5,8.4-2*i,.6,7.4-1.8*i,c);cone('copper',0,.3,-.5,.3,1.0,P('copper'),10);
  /* the bridges' parapets (their tops at -5.5) */
  for(const [z0,z1] of [[3,14],[-10,-4]])for(const s of [-1,1])box('tuffPol',s*1.85,U,(z0+z1)/2,.3,.8,z1-z0,c);
  /* the lamp pillars, 16 m, a lamp on each */
  for(const x of [-8,8]){zfColumn('tuffPol',x,Y,7,.95,16,c);cyl('copper',x,4,7,.7,.3,P('copper'),12);sph('glow',x,4.4,7,.4,P('flame'),1,12);haloAt(x,4.5,7,0xffb04a,true);}
  for(const [x,z] of [[-21.5,-46.5],[21.5,-46.5],[-21.5,16.5],[21.5,16.5],[-3.6,42],[3.6,42]])zcLantern(x,z,c);
  door(0,0,41,0,2.4);}});

/* the cistern hall (its plan: the cistern's item): a round-headed portal under a glazed frieze, the still water below the
   terraces, flights of steps down the back terraces' risers, the causeway's and the platform's parapets, the dipping frame and
   lanterns on the platform, drip channels down the back wall */
defBuilding({key:'zj_cistern',name:'The cistern hall: a stepwell under the rock',seed:4902,originFront:true,
 tags:{types:['infrastructure'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:32,d:34,h:19,
 note:'a vaulted hall 9 m deep: terraces of rock step down on three sides to the still water, pillars rise from the water to the vault, a causeway runs out to a platform where water is drawn',
 build(o){const it=zjItem('zj_cistern');cvFromItem(it,{finish:'plaster'});zfFixtures(it);const c=P('white');
  zfArch('tuffPol',0,0,.02,2.4,3.1,.42,c,{key:true,keyMk:'basaltPol'});box('tuffPol',0,0,.29,3.0,.12,.5,c);
  box('tuffPol',0,3.8,.08,6.2,.8,.24,c);zfBand('patGlazedDfly',0,3.85,.21,6.0,.7,0,c);
  for(const s of [-1,1]){zfNiche(s*2.6,1.4,.02,.36,.46);FURNISH('zeijani_slipper_lamp',s*2.6,1.4,.05,0,{setting:'outdoor'});}
  box('water',0,-7.0,-17.6,23.8,.02,24.8,P('water'));
  /* the causeway's and the platform's parapets: set in from the rock's rounded edges and sunk 0.3 m into it, so none floats */
  for(const s of [-1,1])box('tuffPol',s*1.0,-.3,-11.7,.28,1.0,12.6,c);
  for(const [x,z,w,d] of [[0,-22.05,6.4,.28],[-3.05,-20.0,.28,4.3],[3.05,-20.0,.28,4.3]])box('tuffPol',x,-.3,z,w,1.0,d,c);
  for(const s of [-1,1])zcLantern(s*2.6,-21.4,c);FURNISH('zeijani_dipping_frame',0,0,-19.6,0,{setting:'room'});
  /* flights down the back terraces' risers (each 1.6 m: eight steps), and the drip channels on the back wall */
  for(let k=2;k<=4;k++){const yTop=-1.6*(k-1),z0=-30+2*(k-1);for(let i=0;i<7;i++)box('tuffHewn',0,yTop-1.6,z0+.12+i*.24,1.6,1.6-(i+1)*.2,.24,c);}
  for(const x of [-8,-4,4,8])box('basaltPol',x,0,-29.86,.16,4,.04,P('soot'));
  door(0,0,0,0,2.4);}});

/* the portal (its plan: the portal's item): the arch's ornate rim (a voussoir ring keyed in basalt, an outer ring of dark stone,
   engaged columns flying pennants, a relief panel of the spirits, a stepped crown, the emblem on the rock above), the rolling
   stone door in its channel, the dwellings' ledges, ladders and doorways, lanterns before the gate */
function zcLadder(x,y0,y1,z0,z1,wd){for(const s of [-1,1])beam('log',[x+s*.24,y0,z0],[x+s*.24,y1,z1],.05,wd,true,6);const n=Math.round((y1-y0)/.32);
 for(let i=1;i<n;i++){const t=i/n;box('log',x,y0+t*(y1-y0),z0+t*(z1-z0),.54,.05,.06,wd);}}
defBuilding({key:'zj_portal',name:'The portal: the great gate in the cliff',seed:4903,originFront:true,
 tags:{types:['civic','infrastructure'],wealth:'rich',style:'carved',rock:'tuff',finish:'hewn'},w:50,d:40,h:25,
 note:'a giant arched tunnel through the rock with an ornate rim, a rolling stone door in its side channel, terraced dwellings beside it',
 build(o){const it=zjItem('zj_portal');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white'),wd=P('woodD');
  zfArch('tuffPol',0,0,.05,9.8,11.8,1.0,c,{t:.8,n:17,key:true,keyMk:'basaltPol'});zfArch('basaltPol',0,0,.02,12.6,13.1,.6,P('soot'),{t:.2,n:25});
  for(const s of [-1,1]){zfColumn('tuffPol',s*8.6,0,.6,.75,15,c);sock('flag',s*8.6,16.9,.6,0,{w:1.4,h:.8});zcLantern(s*6.6,3.4,c);}
  box('tuffPol',0,13.6,.12,16,2.4,.3,c);zfBand('patFriezeB',0,13.7,.28,15.6,2.2,0,c);zfStepLintel('tuffPol',0,16,.12,10,c,{n:4,h:.45,d:.4});
  sock('emblem',0,19.4,.12,0,{w:2.6,h:2.6});
  /* the rolling stone, rolled open into its channel (its face toward the tunnel), the tunnel's back rim */
  WX(11.2,5.6,-12.4,0,PI/2,0,()=>{cyl('tuffPol',0,0,0,5.55,1.2,c,28);cyl('basaltPol',0,1.2,0,.9,.06,P('soot'),16);});
  W(0,0,-36,PI,()=>zfArch('tuffHewn',0,0,.05,9.8,11.8,.8,c,{t:.6,n:15}));
  /* the dwellings: a ledge before each doorway, a frame round it, ladders up the face */
  for(const r of it.rooms){const xs=r.poly.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs),cx=(x0+x1)/2,y=r.y;
   box('tuffHewn',cx,y-.25,.45,x1-x0+.6,.25,.9,c);for(const s of [-1,1])box('tuffHewn',cx+s*.6,y,.1,.2,2.0,.2,c);box('tuffHewn',cx,y+1.9,.1,1.4,.22,.22,c);
   FURNISH('zeijani_olla',cx+(cx<0?-1.2:1.2),y,.5,0,{v:1,setting:'outdoor'});}
  for(const s of [-1,1]){zcLadder(s*12.6,0,2,1.1,.75,wd);zcLadder(s*14.0,2,6,.85,.55,wd);zcLadder(s*15.6,6,10,.85,.55,wd);}
  door(0,0,0,0,10);}});

/* the town hall in its rock spire (its plan: the town hall's item): a blocky carved front round the door (pilasters, labyrinth
   panels, a stepped lintel, a frieze, a painted band), the spire's dark cap stone, the windows' frames, a lamp either side */
defBuilding({key:'zj_townhall',name:'The town hall in a rock spire',seed:4904,originFront:true,
 tags:{types:['civic'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:18,d:18,h:22,
 note:'a fairy chimney: the council room at the ground, the records above, the lookout at the top; spiral stairs cut in the rock between them',
 build(o){const it=zjItem('zj_townhall');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white');
  for(const s of [-1,1]){box('tuffPol',s*1.08,0,.1,.3,2.9,.36,c);box('tuffPol',s*2.25,0,-.25,1.9,5.6,1.0,c);zkBand('patLabyrinth',s*1.45,s*3.05,.25,1.1,3.0,0,c);zcLantern(s*3.9,1.4,c);}
  zfStepLintel('tuffPol',0,2.9,.12,2.4,c,{n:3,h:.3,d:.36});box('tuffPol',0,4.0,-.25,6.4,1.6,1.0,c);zkBand('patFriezeC',-3.0,3.0,.25,4.15,1.2,0,c);
  box('plain',0,5.62,.26,6.4,.08,.02,P('cinnabar'));box('tuffPol',0,5.6,-.2,6.8,.35,1.1,c);
  /* the records' window and the lookout's four: a sill and a lintel stone at each */
  box('tuffPol',0,6.88,-1.6,1.2,.12,.5,c);box('tuffPol',0,8.1,-1.6,1.2,.2,.5,c);
  for(const [dx,dz] of [[0,1],[1,0],[0,-1],[-1,0]]){const x=dx*5.9,z=-8.4+dz*5.9,ry=Math.atan2(dx,dz);box('tuffPol',x,11.48,z,1.2,.12,.5,c,ry);box('tuffPol',x,13.05,z,1.2,.2,.5,c,ry);}
  ellip('basalt',0,19.8,-8.4,5.4,1.7,5.0,P('basaltDark'),0,18);
  door(0,0,0,0,1.6);}});

/* the caravanserai (its plan: the caravanserai's item, constructed): the rooms' walls round the arc with their doors, the
   colonnade and the roof over it all, a parapet; the front wall and gate; the tower over the taproom with a spout from which the
   waterfall drops into the round pool; the long pools' kerbs; the stable's fence and lean-to */
defBuilding({key:'zj_caravanserai',name:'The caravanserai: a tower over a half-round court',seed:4905,cut:true,
 tags:{types:['tavern','civic'],wealth:'middle',style:'constructed',rock:'tuff'},w:46,d:36,h:20,
 note:'a half-round court under a colonnade, six rooms round it, a tall tower over the taproom with a waterfall into the court\'s pool, long pools, a stable yard',
 build(o){const it=zjItem('zj_caravanserai');const c=P('tuff'),wt=P('white'),wd=P('woodD'),CZ=6,R0=12.6,R1=17,TZ=-9.2,step=PI/7;
  /* the plinth, the outer wall, the rooms' inner walls with their doors, the walls between them */
  sector('ashlar',0,CZ,R0-.3,R1+.5,PI,PI+3*step,0,.25,P('tuffDark'),10);sector('ashlar',0,CZ,R0-.3,R1+.5,PI+4*step,2*PI,0,.25,P('tuffDark'),10);
  sector('ashlar',0,CZ,R1,R1+.45,PI,PI+3*step,.25,3.4,c,10);sector('ashlar',0,CZ,R1,R1+.45,PI+4*step,2*PI,.25,3.4,c,10);
  for(let i=0;i<7;i++){if(i===3)continue;const a0=PI+i*step,a1=a0+step,am=(a0+a1)/2,g=.55/R0;
   sector('ashlar',0,CZ,R0,R0+.3,a0,am-g,.25,3.4,c,3);sector('ashlar',0,CZ,R0,R0+.3,am+g,a1,.25,3.4,c,3);sector('ashlar',0,CZ,R0,R0+.3,am-g,am+g,2.35,3.4,c,1);}
  for(let i=0;i<=7;i++){const a=PI+i*step;W(Math.cos(a)*(R0+R1)/2,0,CZ+Math.sin(a)*(R0+R1)/2,PI/2-a,()=>box('ashlar',0,.25,0,.35,3.15,R1-R0+.4,c));}
  /* the colonnade on the court's edge (open where the tower stands), the roof over gallery and rooms, its parapet */
  for(let i=0;i<=14;i++){const a=PI+i*PI/14;if(Math.abs(a-1.5*PI)<.26)continue;zfColumn('tuffPol',Math.cos(a)*11.9,0,CZ+Math.sin(a)*11.9,.22,3.4,wt);}
  for(const [a0,a1] of [[PI,PI+3*step],[PI+4*step,2*PI]]){sector('plank',0,CZ,11.55,R1+.45,a0,a1,3.4,3.6,P('wood'),10);sector('ashlar',0,CZ,R1+.05,R1+.45,a0,a1,3.6,4.2,c,10);sector('tuffPol',0,CZ,11.55,11.8,a0,a1,3.25,3.6,wt,10);}
  /* the front wall and the gate */
  for(const s of [-1,1]){box('ashlar',s*7.05,0,CZ,10.7,3.2,.45,c);box('tuffPol',s*7.05,3.2,CZ,10.8,.12,.55,wt);box('tuffPol',s*1.66,0,CZ,.32,3.8,.6,wt);zcLantern(s*2.6,CZ+1.6,wt);}
  zfStepLintel('tuffPol',0,3.8,CZ,3.0,wt,{n:3,h:.3,d:.6});zfLeaf(-.75,0,CZ-.1,1.45,3.0,P('wood'),1.4);box('plank',1.377,0,CZ-.814,1.45,3.0,.06,P('wood'),1.74);   /* the leaves stand open into the court */
  /* the tower over the taproom: its wall, a band of windows, a corbelled crown, a dome; the spout and the waterfall */
  zfDrum('ashlar',0,0,TZ,3.65,17,c,{a0:PI/2+.2,a1:PI/2+TAU-.2,seg:28});zfDrum('plaster',0,.25,TZ,3.3,3.15,P('plaster'),{a0:PI/2+.19,a1:PI/2+TAU-.19,seg:28,inward:true});
  cyl('ashlar',0,3.4,TZ,3.62,.3,c,28);box('tuffPol',0,3.0,TZ+3.6,1.5,.4,.4,wt);
  /* the drum's opening is the taproom's door only: closed over the lintel to the crown */
  sector('ashlar',0,TZ,3.3,3.65,PI/2-.21,PI/2+.21,3.0,16.7,c,3);
  for(let i=0;i<8;i++){const a=i*TAU/8+.2;box('basaltPol',Math.cos(a)*3.67,8+(i%2)*3,TZ+Math.sin(a)*3.67,.7,1.2,.04,P('soot'),PI/2-a);}
  lathe('tuffPol',0,TZ,[[3.6,16.6],[4.1,17],[4.1,17.6],[3.6,17.7]],28,wt);zfDome('plaster',0,17.6,TZ,3.3,2.6,P('plaster'),{seg:24,rows:8});cone('copper',0,20.1,TZ,.25,1.0,P('copper'),10);
  box('tuffPol',0,7.7,TZ+4.6,1.0,.3,2.2,wt);box('water',0,8.0,TZ+4.6,.7,.05,2.0,P('water'));
  box('water',0,.35,TZ+5.55,1.1,7.65,.05,P('water'));sph('plain',0,.45,TZ+5.55,.45,P('white'),.4,10);
  /* the pools: kerbs round still water (their plan: the court's pool fixtures) */
  for(const [x,z,w,d] of [[0,CZ-8.6,4.6,3.0],[-5.6,CZ-3.6,2.4,5.2],[5.6,CZ-3.6,2.4,5.2]]){for(const s of [-1,1]){box('tuffPol',x+s*(w/2+.1),0,z,.2,.42,d+.4,wt);box('tuffPol',x,0,z+s*(d/2+.1),w,.42,.2,wt);}
   box('water',x,.3,z,w,.02,d,P('water'));}
  /* the stable: a log fence (open on its west side for the door), a thatched lean-to along its back */
  for(const [x0,z0,x1,z1] of [[4.5,6.4,16,6.4],[16,6.4,16,14],[4.5,14,16,14],[4.5,6.4,4.5,8.8],[4.5,11.2,4.5,14]]){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0);
   for(const y of [.5,1.0])W((x0+x1)/2,y,(z0+z1)/2,ry,()=>box('log',0,0,0,.1,.12,L,wd));for(let t=0;t<=L;t+=2)cyl('log',x0+(x1-x0)*t/L,0,z0+(z1-z0)*t/L,.07,1.3,wd,6);}
  for(const x of [5,10.25,15.5])cyl('log',x,0,11,.09,2.3,wd,6);plane4('thatch',[4.3,2.3,11],[16.2,2.3,11],[4.3,2.9,14.2],.14,P('thatch'));
  door(0,0,CZ,0,3.0);}});
