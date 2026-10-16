// prefix: zv
// ================================================================= WORKS AND FARMS (PLAN.md 6.4, P3c): the stores, the warehouse and the
// granary, the fields, the alecap beds, the farmhouses, the brewery, the fungal alchemist, the smithy
// The carved ones' void plans (and their `route`, walked by the probe) are their interiors items (kits/interiors/sets/zeijani.js);
// a constructed one's rooms are a planned body (zbBody draws its plan). Drawn here: the fronts, roofs and what stands outside.

/* a carved doorway on a def's face (z = 0): worn jambs either side of a cut w wide and h high, a stepped lintel over it, a sign
   board above (a core/sockets trade), lamps in niches either side. o: {mk, n (lintel steps), sign, lamps, signY} */
function zvFace(x,w,h,o){o=o||{};const c=P('white'),mk=o.mk||'tuffHewn';
 for(const s of [-1,1])box(mk,x+s*(w/2+.14),0,.1,.28,h,.36,c);
 zfStepLintel(mk,x,h,.1,w+.3,c,{n:o.n||2,h:.26,d:.36});
 if(o.sign)sock('sign',x,o.signY||h+1.05,.1,0,{w:Math.min(2.8,w+1.2),h:.72,trade:o.sign});
 if(o.lamps)for(const s of [-1,1]){const lx=x+s*(w/2+1.0);zfNiche(lx,1.6,.02,.32,.42);FURNISH('zeijani_slipper_lamp',lx,1.6,.05,0,{setting:'outdoor'});}
 door(x,0,0,0,w);}
/* a constructed block's shell round a planned body: a plinth, the flat roof slab, a parapet with a coping; returns the roof's top */
function zvShell(key,W,D,o){o=o||{};const c=o.col||P('tuff'),wt=P('white'),inst=zbBody(key,{wall:o.wall||'ashlar',wallCol:c}),B=inst&&inst.buildings[0],RY=B?B.roof.y:3.2,y0=o.y0===undefined?.3:o.y0;
 box('ashlar',0,0,0,W+.4,y0,D+.4,P('tuffDark'));box('paving',0,y0,0,W-.9,.02,D-.9,P('tuffDark'));box('ashlar',0,RY,0,W-.1,.25,D-.1,c);const top=RY+.25;
 if(o.parapet!==false)for(const [x,z,w,d] of [[0,D/2-.2,W,.4],[0,-D/2+.2,W,.4],[W/2-.2,0,.4,D-.8],[-W/2+.2,0,.4,D-.8]]){box('ashlar',x,top,z,w,.6,d,c);box('tuffPol',x,top+.6,z,w+.1,.08,d+.1,wt);}
 return top;}
/* a framed doorway on a constructed front at z (the planner's street door: w wide, 2.1 high from y) */
function zvDoorway(x,y,z,w,o){o=o||{};const wt=P('white');for(const s of [-1,1])box('tuffPol',x+s*(w/2+.13),y,z+.06,.26,2.1,.16,wt);zfStepLintel('tuffPol',x,y+2.1,z+.1,w+.4,wt,{n:o.n||2,h:.22,d:.24});
 if(o.leaf!==false)zfLeaf(x,y,z-.15,w,2.1,P('wood'),o.open===undefined?1.3:o.open);door(x,y,z,0,w);}

/* the stores: a side tunnel walled off at its mouth. The wall (tuff ashlar to the tunnel's crown) and its door are the building;
   the store rooms are cut off the tunnel behind it */
defBuilding({key:'zj_store_tunnel',name:'The stores: a side tunnel walled off',seed:5001,originFront:true,
 tags:{types:['industry'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:20,d:27,h:8.5,
 note:'a side tunnel 5 m wide walled off at its mouth (the wall and its door are the building); four store rooms cut off it',
 build(o){const it=zjItem('zj_store_tunnel');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('tuff'),wt=P('white');
  for(const s of [-1,1])box('ashlar',s*1.65,0,-1.5,1.7,4.6,.5,c);box('ashlar',0,2.3,-1.5,1.6,2.3,.5,c);
  for(const s of [-1,1])box('tuffPol',s*.85,0,-1.22,.2,2.3,.1,wt);box('tuffPol',0,2.3,-1.2,2.0,.24,.14,wt);
  zfLeaf(0,0,-1.32,1.5,2.3,P('wood'),1.2);
  box('plain',0,3.0,-1.22,2.6,.08,.02,P('ochre'));sock('emblem',0,3.7,-1.2,0,{w:.9,h:.9});
  zfArch('tuffHewn',0,0,.05,5.2,4.6,.4,wt,{t:.4});
  FURNISH('zeijani_jar_cradle',-3.6,0,1.1,0,{setting:'outdoor'});FURNISH('zeijani_pot_stack',3.4,0,1.0,0,{setting:'outdoor'});
  door(0,0,-1.5,0,1.5);}});

/* the warehouse: tuff ashlar under a flat roof on timber beams (their ends show under the coping), a wide door for the carts */
defBuilding({key:'zj_warehouse',name:'Warehouse',seed:5002,cut:true,tags:{types:['industry'],wealth:'middle',style:'constructed',rock:'tuff'},w:14,d:10,h:5.2,
 build(o){const top=zvShell('zj_warehouse',12,8,{parapet:false}),wd=P('woodD');
  for(let i=0;i<7;i++){const x=-5.1+i*1.7;for(const z of [-4.12,4.12])box('log',x,top-.55,z,.22,.22,.3,wd);}
  box('tuffPol',0,top,0,12.1,.14,8.1,P('white'));zvDoorway(0,.3,4,2.0,{open:1.45});
  sock('emblem',3.4,2.6,4.04,0,{w:.8,h:.8});
  FURNISH('zeijani_jar_cradle',-3.6,0,5.0,0,{setting:'outdoor'});FURNISH('zeijani_pot_stack',3.2,0,5.0,0,{setting:'outdoor'});FURNISH('zeijani_alecap_basket',-2.2,0,5.2,.4,{setting:'outdoor'});}});

/* the granary (the Dogon's and the board's towers): a round store raised on stones, its earthen wall under a tall conical
   thatch, its door up three steps */
defBuilding({key:'zj_granary',name:'Granary',seed:5003,cut:true,tags:{types:['industry'],wealth:'poor',style:'constructed',rock:'tuff'},w:8,d:8,h:7.6,
 build(o){const g=zwGap(2.42,.8),c=P('tuffDark');
  for(let i=0;i<9;i++){const a=i*TAU/9+.2;cyl('ashlar',Math.cos(a)*1.9,0,Math.sin(a)*1.9,.3,.62,c,8);}cyl('ashlar',0,0,0,.4,.62,c,8);
  cyl('ashlar',0,.6,0,2.66,.3,c,26);
  zfDrum('earth',0,.9,0,2.42,2.5,P('earth'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:26});zfDrum('earth',0,.9,0,2.3,2.5,P('plaster'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:26,inward:true});
  sector('earth',0,0,2.3,2.42,ZF_FRONT+g-.03,ZF_FRONT+g,.9,3.4,P('earth'));sector('earth',0,0,2.3,2.42,ZF_FRONT-g,ZF_FRONT-g+.03,.9,3.4,P('earth'));
  box('log',0,2.95,2.4,1.2,.16,.3,P('woodD'));
  for(let i=0;i<3;i++)box('plain',0,1.6+i*.38,2.43,.05,.05,.02,P('ochre'));
  zfCone('thatch',0,3.25,0,3.0,4.2,P('thatch'),{layers:2});lathe('thatch',0,0,[[2.9,3.24],[.06,7.3]],24,P('thatch'),{inward:true});
  zfSteps('ashlar',0,.9,2.75,1.0,3,c,.3,.3);door(0,.9,2.42,0,.8);
  FURNISH('zeijani_mealing_bins',-2.6,0,2.4,.6,{setting:'outdoor'});FURNISH('zeijani_alecap_basket',2.4,0,2.6,0,{setting:'outdoor'});}});

/* the fields: three terraces stepping up a slope (retaining walls of tuff, a stone stair at one side, a channel), rows of crop
   cards (the library's cut-out sheets). v selects the crop: the yam field's vines and the vegetable plots */
function zvField(card,cw,ch,rows,o){o=o||{};const c=P('tuffDark'),dz=3.6;
 for(let i=0;i<3;i++){const y=i*.5,z0=4.6-i*dz;box('earth',-.4,0,z0-dz/2,13.2,y+.32,dz,P('earth'));box('ashlar',-.4,0,z0+.08,13.2,y+.45,.3,c);box('tuffPol',-.4,y+.45,z0+.08,13.3,.06,.36,P('white'));
  for(let r=0;r<rows;r++){const z=z0-.55-r*(dz-.9)/(rows-1);for(let k=0;k<17;k++){const x=-6.3+k*.74+rr(-.12,.12);
   zfCard(card,x,y+.32,z+rr(-.08,.08),cw*rr(.85,1.15),ch*rr(.85,1.2),rr(0,PI),P('white'));}}
  zfSteps('ashlar',5.5,y+.45,z0+.25,1.0,3,c,.15,.25);}
 box('water',-7.3,.05,-.8,.36,.04,11.4,P('water'));box('ashlar',-7.3,0,-.8,.6,.06,11.6,c);
 FURNISH('zeijani_olla',6.6,0,6.0,0,{v:o.v|0,setting:'outdoor'});FURNISH('zeijani_alecap_basket',5.4,0,6.1,.3,{setting:'outdoor'});}
defBuilding({key:'zj_farm_yam',name:'Yam terraces',seed:5004,cls:'feature',tags:{types:['farm'],wealth:'poor',style:'constructed',rock:'tuff'},w:16,d:12,h:2.6,front:{x:5.5,z:5.2},
 note:'three terraces of yam vines on a light well\'s floor or a clearing: retaining walls, a stair, an irrigation channel',
 build(o){zvField('cardYam',.62,.6,4);}});
defBuilding({key:'zj_farm_veg',name:'Vegetable plots',seed:5005,cls:'feature',tags:{types:['farm'],wealth:'poor',style:'constructed',rock:'tuff'},w:16,d:12,h:2.4,front:{x:5.5,z:5.2},
 note:'three terraces of beans, gourds and greens in rows; retaining walls, a stair, an irrigation channel',
 build(o){zvField('cardCrop',.52,.46,5,{v:1});}});

/* the alecap beds: a low arched doorway into the dark; inside, compost beds in stone kerbs (fixtures) either side of a water
   channel, the spawn racks along the walls (the room's furniture). The beds glow faintly; the air is still and damp */
defBuilding({key:'zj_farm_alecap',name:'Alecap beds in the dark',seed:5006,originFront:true,
 tags:{types:['farm'],wealth:'poor',style:'carved',rock:'tuff',finish:'raw'},w:18,d:30,h:7.5,
 note:'a long low hall cut in the dark: eight compost and dung beds in stone kerbs either side of a water channel, spawn racks',
 build(o){const it=zjItem('zj_farm_alecap');cvFromItem(it,{finish:'raw'});zfFixtures(it);
  box('water',0,.01,-14,.4,.03,22,P('water'));
  zvFace(0,2.0,2.6,{n:1});box('plain',0,3.2,.12,2.4,.1,.02,P('alecap'));
  for(const z of [-8,-14,-20])haloAt(0,1.2,z,0x8fe8c8,false);
  FURNISH('zeijani_alecap_basket',-2.2,0,1.2,.3,{setting:'outdoor'});FURNISH('zeijani_alecap_basket',2.0,0,1.4,-.4,{v:1,setting:'outdoor'});}});

/* the timber farmhouse: a round house of logs on a stone footing under a domed thatch (the planner's three rooms), a fenced yard
   with a drying rack */
defBuilding({key:'zj_farmhouse_wood',name:'Farmhouse (timber)',seed:5007,cut:true,tags:{types:['dwelling-single','farm'],wealth:'middle',style:'wooden'},w:14,d:14,h:7.4,
 build(o){const g=zwGap(5,1.0),wd=P('woodD');
  zfDrum('ashlar',0,0,0,5.22,.4,P('tuffDark'),{seg:34});cyl('ashlar',0,.3,0,5.22,.1,P('tuffDark'),34);
  zfDrum('log',0,.4,0,5.05,2.85,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:34});zfDrum('plank',0,.4,0,4.78,2.8,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:34,inward:true});
  sector('log',0,0,4.75,5.07,ZF_FRONT+g-.02,ZF_FRONT+g+.02,.4,3.25,wd);sector('log',0,0,4.75,5.07,ZF_FRONT-g-.02,ZF_FRONT-g+.02,.4,3.25,wd);
  zwPartitions('zj_farmhouse_wood','plank',P('wood'));
  zfDome('thatch',0,3.2,0,5.7,3.6,P('thatch'),{seg:34,rows:10});lathe('thatch',0,0,[[5.5,3.18],[3.6,5.2],[.05,6.8]],32,P('thatch'),{inward:true,uv:'arc'});
  box('log',0,2.45,5.0,1.5,.3,.3,wd);for(const s of [-1,1])cyl('log',s*.62,.4,5.0,.09,2.05,wd,7);zfLeaf(0,.4,4.86,1.0,2.0,P('wood'),-.5);
  smokeAt(0,7.0,0,{r:.15});door(0,.4,5.0,0,1.0);
  /* the yard's fence (posts and two rails) on the house's east side, a drying rack in it */
  const post=(x,z)=>cyl('log',x,0,z,.07,1.2,wd,6);for(let i=0;i<=6;i++){post(4.4+i*.4,6.4);post(6.8,6.4-i*1.0);}
  for(const y of [.45,.95]){box('log',5.6,y,6.4,2.4,.06,.06,wd);box('log',6.8,y,3.4,.06,.06,6.0,wd);}
  FURNISH('zeijani_drying_trays',5.6,0,4.2,0,{setting:'outdoor'});FURNISH('zeijani_olla',-2.0,0,5.6,0,{v:1,setting:'outdoor'});}});

/* the carved farmhouse: a doorway in a low outcrop, a window either side of it into the side rooms, a yard wall in front */
defBuilding({key:'zj_farmhouse_carved',name:'Farmhouse (carved)',seed:5008,originFront:true,
 tags:{types:['dwelling-single','farm'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:17,d:12,h:6.2,
 note:'cut in a low outcrop: the living room behind the door, a bedroom and a store either side',
 build(o){const it=zjItem('zj_farmhouse_carved');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('tuffDark');
  zvFace(0,1.4,2.4,{n:1,lamps:true});
  for(const s of [-1,1]){box('ashlar',s*4.2,0,2.6,3.4,.9,.32,c);box('tuffPol',s*4.2,.9,2.6,3.5,.06,.38,P('white'));}
  FURNISH('zeijani_drying_trays',-4.4,0,1.4,0,{setting:'outdoor'});FURNISH('zeijani_jar_cradle',4.4,0,1.4,0,{setting:'outdoor'});}});

/* the brewery: a wide arched taproom door on the face under the tavern's board, benches outside; the brewing hall's vents */
defBuilding({key:'zj_brewery',name:'Brewery (carved)',seed:5009,originFront:true,
 tags:{types:['industry','tavern'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:25,d:29,h:9,
 note:'the taproom at the face, the brewing hall behind it (mash tuns, fermenting crocks), the cooperage off it, the cool cellar 2.6 m down a flight',
 build(o){const it=zjItem('zj_brewery');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
  zfArch('tuffPol',0,0,.06,2.6,3.0,.42,c,{key:true,keyMk:'basaltPol'});box('tuffPol',0,0,.27,3.4,.1,.5,c);
  sock('sign',0,3.95,.1,0,{w:2.6,h:.8,trade:'TAVERN'});for(const s of [-1,1]){zfNiche(s*2.6,1.6,.02,.32,.42);FURNISH('zeijani_slipper_lamp',s*2.6,1.6,.05,0,{setting:'outdoor'});}
  sock('awning',0,2.9,.4,0,{w:7.2,d:1.8,drop:.5,h:2.5});
  FURNISH('zeijani_stone_bench',-3.6,0,1.6,0,{setting:'outdoor'});FURNISH('zeijani_stone_bench',3.6,0,1.6,0,{setting:'outdoor'});FURNISH('zeijani_jar_cradle',5.6,0,.9,0,{setting:'outdoor'});
  door(0,0,0,0,2.6);}});

/* the fungal alchemist: a doorway under the alchemist's board, glow jars in niches either side, the glow room's light in a slit */
defBuilding({key:'zj_lab',name:'Fungal alchemist (carved)',seed:5010,originFront:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:21,d:25,h:8,
 note:'the selling room at the face, the domed still room behind it, the glow-culture room off its side, the dark spawn room deepest',
 build(o){const it=zjItem('zj_lab');cvFromItem(it,{finish:'hewn'});zfFixtures(it);
  zvFace(0,1.8,2.7,{mk:'tuffPol',n:3,sign:'ALCHEMIST',lamps:true});
  haloAt(7.8,1.4,-10.5,0x8fe8c8,true);haloAt(0,2.2,-10.5,0xffb04a,false);
  FURNISH('zeijani_drying_trays',-3.6,0,1.2,0,{setting:'outdoor'});FURNISH('zeijani_glow_basin',3.4,0,1.2,0,{setting:'outdoor'});}});

/* the smithy: tuff ashlar, the forge's smoke shaft standing up through the roof, a wide door, an awning over the anvil's yard */
defBuilding({key:'zj_smithy',name:'Smithy',seed:5011,cut:true,tags:{types:['industry'],wealth:'middle',style:'constructed',rock:'tuff'},w:11,d:9,h:7,
 build(o){const top=zvShell('zj_smithy',9,7,{y0:.2}),c=P('tuff');
  box('ashlar',-2.6,top,-1.8,1.4,2.6,1.4,c);box('basaltPol',-2.6,top+2.6,-1.8,1.6,.2,1.6,P('soot'));smokeAt(-2.6,top+2.9,-1.8,{r:.22});
  zvDoorway(0,.2,3.5,1.6,{open:1.5});sock('sign',0,2.95,3.6,0,{w:2.2,h:.6,trade:'WEAPONS'});
  sock('awning',0,2.6,3.6,0,{w:7.4,d:1.6,drop:.4,h:2.3});
  FURNISH('zeijani_trade_display',-2.6,0,4.3,0,{setting:'outdoor'});FURNISH('zeijani_stone_stool',2.4,0,4.4,.3,{setting:'outdoor'});}});
