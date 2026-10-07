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
