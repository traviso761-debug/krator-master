// prefix: zt
// ================================================================= TRADE (PLAN.md 6.4, P3c): the tavern and the inn, each carved and
// constructed; the market stalls. Plans: their interiors items (a carved one's `route` is walked by the probe; a constructed
// one's rooms are a planned body).

/* the carved tavern: a wide arched door under the tavern's board, an awning on poles over benches, lamps in niches */
defBuilding({key:'zj_tavern_carved',name:'Tavern (carved)',seed:5201,originFront:true,
 tags:{types:['tavern'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:23,d:23,h:8.5,
 note:'a pillared taproom cut behind the face, the kitchen and the cellar behind it',
 build(o){const it=zjItem('zj_tavern_carved');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
  zfArch('tuffPol',0,0,.06,2.6,3.0,.42,c,{key:true,keyMk:'basaltPol'});box('tuffPol',0,0,.27,3.4,.1,.5,c);
  sock('sign',0,3.95,.1,0,{w:2.6,h:.8,trade:'TAVERN'});for(const s of [-1,1]){zfNiche(s*2.6,1.6,.02,.32,.42);FURNISH('zeijani_slipper_lamp',s*2.6,1.6,.05,0,{setting:'outdoor'});}
  sock('awning',0,2.9,.4,0,{w:8.4,d:2.2,drop:.5,h:2.5});
  for(const s of [-1,1])FURNISH('zeijani_stone_bench',s*3.6,0,1.8,0,{setting:'outdoor'});FURNISH('zeijani_jar_cradle',-6.2,0,1.0,0,{setting:'outdoor'});
  door(0,0,0,0,2.6);}});

/* the constructed tavern: the planner's taproom, kitchen and store under a flat roof, a dome over the taproom, the board over the
   door, an awning over the benches */
defBuilding({key:'zj_tavern_built',name:'Tavern (constructed)',seed:5202,cut:true,tags:{types:['tavern'],wealth:'middle',style:'constructed',rock:'tuff'},w:15,d:12,h:7.4,
 build(o){const top=zvShell('zj_tavern_built',12,9),c=P('tuff');
  zfDrum('ashlar',-2.4,top,-.6,2.0,.5,c,{seg:24});zfDome('plaster',-2.4,top+.5,-.6,2.0,1.5,P('plaster'),{seg:24,rows:8});cyl('copper',-2.4,top+2.0,-.6,.1,.3,P('copper'),8);
  zvDoorway(0,.3,4.5,1.4,{n:3});sock('sign',0,3.1,4.62,0,{w:2.4,h:.6,trade:'TAVERN'});
  sock('awning',0,2.75,4.6,0,{w:9.6,d:2.0,drop:.5,h:2.25});
  for(const s of [-1,1])FURNISH('zeijani_stone_bench',s*3.4,0,5.7,0,{setting:'outdoor'});FURNISH('zeijani_jar_cradle',5.2,0,5.4,0,{setting:'outdoor'});}});

/* the carved inn: a taller doorway under the inn's board, a row of small windows above (the guest cells' light), benches */
defBuilding({key:'zj_inn_carved',name:'Inn (carved)',seed:5203,originFront:true,
 tags:{types:['inn','tavern'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:27,d:32,h:9.5,
 note:'the taproom at the face; a corridor back past six guest cells (each a bed shelf and a hearth niche) to the kitchen',
 build(o){const it=zjItem('zj_inn_carved');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
  zvFace(0,2.4,2.8,{mk:'tuffPol',n:3,sign:'INN',lamps:true});
  for(let i=0;i<5;i++){const x=-5.2+i*2.6;if(i===2)continue;zfNiche(x,4.6,.02,.5,.6);box('tuffPol',x,4.95,.06,.8,.12,.14,c);}
  box('plain',0,5.6,.02,12,.1,.02,P('ochre'));
  for(const s of [-1,1])FURNISH('zeijani_stone_bench',s*4.0,0,1.4,0,{setting:'outdoor'});FURNISH('zeijani_olla',6.4,0,1.0,0,{v:1,setting:'outdoor'});}});

/* the constructed inn: two storeys (the taproom, kitchen and store; guest rooms upstairs), a balcony of timber on the front at
   the upper floor, the board, a roof terrace behind a parapet */
defBuilding({key:'zj_inn_built',name:'Inn (constructed)',seed:5204,cut:true,tags:{types:['inn','tavern'],wealth:'middle',style:'constructed',rock:'tuff'},w:15,d:13,h:9.4,
 build(o){const top=zvShell('zj_inn_built',12,10),wd=P('woodD'),wt=P('white');
  W(0,0,5.06,0,()=>{box('tuffPol',0,3.4,0,11.8,.4,.1,wt);});zfBand('patFriezeB',0,3.44,5.12,11.6,.32,0,wt);
  box('plank',0,3.6,5.6,8.0,.12,1.1,P('wood'));for(const x of [-3.8,-1.3,1.3,3.8])beam('log',[x,3.6,5.05],[x,2.7,5.1],.1,wd,true,6);
  for(let i=0;i<=16;i++)box('log',-4.0+i*.5,3.72,6.1,.05,.8,.05,wd);box('log',0,4.5,6.1,8.1,.08,.08,wd);
  zvDoorway(0,.3,5,1.4,{n:3});sock('sign',2.2,2.2,5.1,0,{w:1.4,h:.6,trade:'INN'});
  for(const s of [-1,1])FURNISH('zeijani_stone_bench',s*3.6,0,6.2,0,{setting:'outdoor'});}});

/* the market stalls. (a) a niche cut in a wall: a block of the wall (drawn: no void), the recess dark behind a counter, a shutter
   propped open over it, a lamp; (b) a free-standing frame: four poles, a counter, a felt awning (v 0) or a fungus-cap canopy (v 1) */
defBuilding({key:'zj_stall_a',name:'Market stall in a wall niche',seed:5205,tags:{types:['market'],wealth:'poor',style:'carved',rock:'tuff',finish:'hewn'},w:5,d:2.2,h:3.6,
 build(o){const c=P('tuffDark'),wt=P('white'),wd=P('woodD');
  box('tuffHewn',0,0,-.6,4.4,3.4,.8,c);box('basaltPol',0,.9,-.19,2.6,1.6,.02,P('soot'));
  for(const s of [-1,1])box('tuffHewn',s*1.5,.9,-.05,.4,1.6,.3,c);box('tuffHewn',0,2.5,-.05,3.4,.9,.3,c);box('tuffHewn',0,0,-.05,3.4,.9,.3,c);
  box('tuffPol',0,.9,.05,3.0,.1,.5,wt);
  W(0,2.5,.12,0,()=>{WX(0,0,0,0,-1.0,0,()=>{box('plank',0,-.05,0,2.8,.06,1.2,P('wood'));});});for(const s of [-1,1])beam('log',[s*1.2,.95,.55],[s*1.2,2.5,.95],.04,wd,true,5);
  FURNISH('zeijani_pot_stack',-.6,1.0,.0,0,{setting:'outdoor'});FURNISH('zeijani_slipper_lamp',.9,1.0,.05,0,{setting:'outdoor'});door(0,0,.4,0,2.6);}});
defBuilding({key:'zj_stall_b',name:'Market stall under an awning',seed:5206,tags:{types:['market'],wealth:'poor',style:'wooden'},w:4.4,d:3.6,h:3.2,
 build(o){const wd=P('woodD'),cap=(o.v|0)===1;
  for(const [x,z] of [[-1.6,-1.2],[1.6,-1.2],[-1.6,1.2],[1.6,1.2]])cyl('log',x,0,z,.06,cap?2.2:2.5,wd,6);
  box('plank',0,.85,.9,3.4,.08,.7,P('wood'));box('plank',0,0,1.18,3.4,.85,.06,P('wood'));
  if(cap){for(const [x,z,r] of [[-.9,0,1.3],[1.0,-.2,1.2],[0,.5,1.0]]){cyl('carved',x,0,z,.08,2.3+r*.2,P('lilac'),6);ellip('plain',x,2.3+r*.2,z,r,.38,r,P('alecap'),0,14);}}
  else{plane4('felt',[-1.9,2.6,-1.5],[1.9,2.6,-1.5],[-1.9,2.3,1.6],.04,P('alecap'));box('felt',0,2.3,1.6,3.8,.3,.02,P('ochre'));}
  FURNISH('zeijani_trade_display',0,0,-.5,0,{setting:'outdoor'});FURNISH('zeijani_alecap_basket',-1.0,.89,.9,.2,{setting:'outdoor'});door(0,0,1.4,0,3.0);}});
