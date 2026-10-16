// prefix: ze
// ================================================================= THE WEALTHY ESTATES CARVED IN THE HALL'S WALLS (PLAN.md 6.4)
// As the galleries: the front is drawn here, the void plan is the def's interiors item (kits/interiors/sets/zeijani.js), carved
// by the cavern, its carved furniture drawn by zfFixtures (the pillars, the basins, the kitchens' hearths, the servants' bed shelves).
// Frames stand 2 cm inside every cut and lintels under its ceiling, so no drawn face lies on the rock's.

/* a window cut in the face (the item's `win`): jambs, a sill above the cut's floor, a lintel under its head */
function zeWindow(x,y,w,h,c){for(const s of [-1,1])box('tuffPol',x+s*(w/2+.06),y-.08,.1,.16,h+.06,.3,c);
 box('tuffPol',x,y-.08,.16,w+.4,.14,.42,c);box('tuffPol',x,y+h-.05,.12,w+.44,.26,.36,c);}

/* estate A: engaged columns, an entablature with the spirits' frieze, a stepped crown; a labyrinth panel over the door */
defBuilding({key:'zj_estate_a',name:'Carved estate: the columned hall',seed:4401,originFront:true,
 tags:{types:['dwelling-single'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:36,d:40,h:13,
 note:'a pillared reception hall behind a front of engaged columns, a court under its own light shaft, the family\'s and the service corridors: 13 rooms',
 build(o){const it=zjItem('zj_estate_a');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white');
  /* the doorway (the cut 2.6 wide, 3.4 high): jambs, a threshold, a stepped lintel */
  for(const s of [-1,1])box('tuffPol',s*1.42,0,.1,.28,3.3,.4,c);box('tuffPol',0,0,.34,2.9,.12,.6,c);
  zfStepLintel('tuffPol',0,3.3,.12,2.4,c,{n:3,h:.3,d:.4});
  box('tuffPol',0,4.3,.08,4.0,1.9,.24,c);zfBand('patLabyrinth',0,4.35,.21,3.8,1.8,0,c);
  /* the order: four engaged columns, the architrave, the frieze, the cornice, the crown */
  for(const x of [-6.2,-2.6,2.6,6.2])zfColumn('tuffPol',x,0,.35,.42,6.4,c);
  box('tuffPol',0,6.4,.3,15.6,.5,.9,c);box('plain',0,6.36,.76,15.6,.05,.02,P('cinnabar'));
  box('tuffPol',0,6.9,.2,15.0,.9,.6,c);zfBand('patFrieze',0,6.9,.51,15.0,.9,0,c);
  box('tuffPol',0,7.8,.35,16.6,.3,1.1,c);box('plain',0,7.78,.91,16.6,.05,.02,P('turquoise'));
  zfStepLintel('tuffPol',0,8.1,.2,9.0,c,{n:3,h:.4,d:.6});
  /* lamps between the columns; the windows of the living room and the kitchen */
  for(const s of [-1,1]){zfNiche(s*4.4,1.5,.02,.4,.5);FURNISH('zeijani_slipper_lamp',s*4.4,1.5,.05,0,{setting:'outdoor'});zeWindow(s*11,1.3,.9,1.2,c);}
  door(0,0,0,0,2.4);
  FURNISH('zeijani_glow_basin',-1.95,0,.95,0,{setting:'outdoor'});FURNISH('zeijani_glow_basin',1.95,0,.95,0,{setting:'outdoor'});
  FURNISH('zeijani_stone_bench',-8.8,0,.6,0,{setting:'outdoor'});FURNISH('zeijani_olla',8.6,0,.55,0,{v:1,setting:'outdoor'});}});

/* estate B: a round-headed portal; above it the loggia's five arches on a string course, a glazed frieze, a stepped crown */
defBuilding({key:'zj_estate_b',name:'Carved estate: the loggia',seed:4402,originFront:true,
 tags:{types:['dwelling-single'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:34,d:36,h:14,
 note:'two storeys: a domed hall; upstairs a loggia behind five arches between the family\'s rooms; down a flight a court under a light shaft, the service rooms: 12 rooms',
 build(o){const it=zjItem('zj_estate_b');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white'),U=4.6;
  zfArch('tuffPol',0,0,.02,2.1,3.0,.42,c,{key:true,keyMk:'basaltPol'});box('tuffPol',0,0,.29,2.6,.12,.5,c);
  box('tuffPol',0,3.55,.1,6.0,.7,.24,c);zfBand('patGlazed',0,3.6,.23,5.8,.6,0,c);
  for(const s of [-1,1]){zfNiche(s*2.2,1.4,.02,.36,.46);FURNISH('zeijani_slipper_lamp',s*2.2,1.4,.05,0,{setting:'outdoor'});}
  /* the loggia: a string course, five arches (the cuts 1.2 wide, 2 m high, their sills 0.6 m above its floor), pilasters between */
  box('tuffPol',0,U+.28,.3,19.4,.2,.7,c);
  for(const x of [-7,-3.5,0,3.5,7]){zfArch('tuffPol',x,U+.6,.02,1.1,2.0,.36,c);box('tuffPol',x,U+.48,.2,1.5,.18,.5,c);}
  for(const x of [-8.75,-5.25,-1.75,1.75,5.25,8.75])box('tuffPol',x,U+.48,.1,.32,2.5,.3,c);
  box('tuffPol',0,U+3.0,.12,19.0,.8,.3,c);zfBand('patGlazedBeetle',0,U+3.0,.28,18.6,.8,0,c);box('plain',0,U+2.94,.28,18.6,.05,.02,P('cinnabar'));
  box('tuffPol',0,U+3.8,.3,20,.25,.8,c);zfStepLintel('tuffPol',0,U+4.05,.15,8.0,c,{n:3,h:.35,d:.5});
  door(0,0,0,0,2.0);
  FURNISH('zeijani_stone_bench',-4.2,0,.6,0,{setting:'outdoor'});FURNISH('zeijani_stone_bench',4.2,0,.6,0,{setting:'outdoor'});FURNISH('zeijani_olla',6.4,0,.55,0,{v:0,setting:'outdoor'});}});
