// prefix: zg
// ================================================================= THE CARVED GALLERIES OF THE POOR (PLAN.md 6.4: Cappadocian apartments going deep)
// The front is drawn here; everything behind it is the void plan in the def's interiors item (kits/interiors/sets/zeijani.js),
// carved by the cavern (cvFromItem), its carved furniture drawn by zfFixtures, its rooms furnished by the interiors kit.
// A carved def's origin is the foot of its front (originFront): its rock runs back from there.
defBuilding({key:'zj_gallery_a',name:'Gallery of cells: the spine',seed:4301,originFront:true,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'carved',rock:'tuff',finish:'hewn'},w:30,d:56,h:12,
 note:'a corridor descending in three levels with twelve cells, a hearth hall, a kiva, a cistern and an air shaft',
 build(o){const it=zjItem('zj_gallery_a');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
  /* the portal: a round arch cut in the face, a threshold, lamp niches, the dovecote holes and painted bands over it */
  zfArch('tuffHewn',0,0,.02,2.0,3.05,.42,c,{key:true,keyMk:'tuffPol'});box('tuffHewn',0,0,.25,2.6,.12,.5,c);
  for(const s of [-1,1]){zfNiche(s*2.0,1.45,.02,.36,.46);FURNISH('zeijani_slipper_lamp',s*2.0,1.24,-.06,PI,{setting:'outdoor'});}
  box('plain',0,4.05,.01,8.6,.14,.03,P('ochre'));box('plain',0,4.25,.01,8.6,.08,.03,P('cinnabar'));
  zfDovecote(0,4.8,.02,9,3,{paint:'cinnabar'});
  door(0,0,0,0,2.0);
  FURNISH('zeijani_stone_bench',-4.2,0,.6,0,{setting:'outdoor'});FURNISH('zeijani_olla',3.6,0,.55,0,{v:1,setting:'outdoor'});}});
