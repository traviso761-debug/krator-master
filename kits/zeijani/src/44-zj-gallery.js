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
  zfArch('tuffHewn',0,0,.02,1.88,3.05,.42,c,{key:true,keyMk:'tuffPol'});box('tuffHewn',0,0,.29,2.6,.12,.5,c);
  for(const s of [-1,1]){zfNiche(s*2.0,1.45,.02,.36,.46);FURNISH('zeijani_slipper_lamp',s*2.0,1.24,-.06,PI,{setting:'outdoor'});}
  box('plain',0,4.05,.01,8.6,.14,.03,P('ochre'));box('plain',0,4.25,.01,8.6,.08,.03,P('cinnabar'));
  zfDovecote(0,4.8,.02,9,3,{paint:'cinnabar'});
  door(0,0,0,0,2.0);
  FURNISH('zeijani_stone_bench',-4.2,0,.6,0,{setting:'outdoor'});FURNISH('zeijani_olla',3.6,0,.55,0,{v:1,setting:'outdoor'});}});

/* gallery B, the well: the stair is drawn here from the item's `well` (its walk strips are the item's `walk` entries) */
function zgSpiral(W){const c=P('white'),A1=PI/2+W.turns*TAU,n=Math.round((A1-PI/2)/(PI/16));
 for(let i=0;i<n;i++){const a0=PI/2+(A1-PI/2)*i/n,a1=PI/2+(A1-PI/2)*(i+1)/n,y=W.y0-W.drop*((a0+a1)/2-PI/2)/PI;
  sector('tuffHewn',W.c[0],W.c[1],W.rs-W.w/2-.05,W.r+.05,a0,a1,y-.32,y,c,2);
  sector('tuffHewn',W.c[0],W.c[1],W.rs-W.w/2-.22,W.rs-W.w/2-.05,a0,a1,y-.32,y+.78,c,2);}}
defBuilding({key:'zj_gallery_b',name:'Gallery of cells: the well',seed:4302,originFront:true,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'carved',rock:'tuff',finish:'hewn'},w:30,d:34,h:12,
 note:'a round shaft open to the sky with a spiral stair down its wall, twelve cells off its landings and the entrance tunnel, a hearth hall and a cistern at the bottom',
 build(o){const it=zjItem('zj_gallery_b');cvFromItem(it,{finish:'hewn'});zfFixtures(it);zgSpiral(it.well);const c=P('white');
  /* the front: a square door under a stepped lintel, a carved hood over it (the board's mushroom-rock houses), two lamp niches,
     a painted ring and two columns of dovecote holes */
  for(const s of [-1,1])box('tuffHewn',s*1.02,0,.06,.28,2.9,.24,c);zfStepLintel('tuffHewn',0,2.9,.08,2.3,c,{n:3,h:.26,d:.28});
  zfDome('tuffPol',0,3.85,-.05,2.2,1.3,c,{a0:0,a1:PI,seg:16,rows:6});box('tuffPol',0,3.75,.55,4.6,.14,1.2,c);
  for(const s of [-1,1]){zfNiche(s*1.7,1.35,.02,.32,.42);FURNISH('zeijani_slipper_lamp',s*1.7,1.14,-.06,PI,{setting:'outdoor'});zfDovecote(s*4.2,2.0,.02,2,5,{paint:'ochre',dx:.6,dy:.75});}
  box('plain',0,5.5,.01,6.4,.12,.03,P('turquoise'));box('plain',0,5.65,.01,6.4,.06,.03,P('cinnabar'));
  door(0,0,0,0,1.8);
  FURNISH('zeijani_olla',-3.0,0,.6,0,{v:1,setting:'outdoor'});FURNISH('zeijani_drying_trays',3.2,0,.9,0,{setting:'outdoor'});}});
