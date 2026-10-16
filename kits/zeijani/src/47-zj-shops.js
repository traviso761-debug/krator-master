// prefix: zs
// ================================================================= THE SHOPS (PLAN.md 6.4): twelve trades, a carved and a constructed front each
// One interior and one sign per trade, shared by its two fronts: the items `zj_shop_<trade>_carved` / `_built` in
// kits/interiors/sets/zeijani.js (the selling room's kind requires the trade's goods, the back room's its workstation),
// the sign the item's `sign` (a core/sockets pictograph, drawn by the zeijani pack). The defs are made from the items here.
const ZS_ITEMS=KratorInteriors.sets.byName.zeijani.items.filter(it=>/^zj_shop_/.test(it.key));
/* what stands outside each trade's front (catalog pieces that may stand outdoors) */
const ZS_OUT={weapons:'zeijani_trade_display',armour:'zeijani_trade_display',general:'zeijani_jar_cradle',food:'zeijani_alecap_basket',
 alchemist:'zeijani_drying_trays',lampwright:'zeijani_glow_basin',stonecutter:'zeijani_stone_bench',dyer:'zeijani_yarn_rack',potter:'zeijani_pot_stack',
 leather:'zeijani_trade_display',knapper:'zeijani_trade_display',rope:'zeijani_rope_coils'};
function zsTrade(key){return key.replace(/^zj_shop_/,'').replace(/_(carved|built)$/,'');}

/* the carved shopfront: the cut framed by worn jambs and a stepped lintel, its shutters folded back on the face, the sign in a
   dark niche above, lamps in niches either side; the counter across the cut is the item's fixture */
function zsCarved(it,i){const t=zsTrade(it.key),smoke=(it.voids||[]).find(v=>v.id==='smoke');
 defBuilding({key:it.key,name:it.name,seed:4600+i,originFront:true,
  tags:{types:['shop'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:13,d:15,h:8.5,note:it.note,
  build(o){cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
   for(const s of [-1,1]){box('tuffHewn',s*2.42,0,.1,.28,2.5,.36,c);
    W(s*3.24,.12,.07,0,()=>{box('plank',0,0,0,1.2,2.3,.06,P('wood'));for(const y of [.35,1.85])box('wood',0,y,.05,1.1,.1,.04,P('woodD'));});
    zfNiche(s*4.6,1.6,.02,.32,.42);FURNISH('zeijani_slipper_lamp',s*4.6,1.6,.05,0,{setting:'outdoor'});}
   zfStepLintel('tuffHewn',0,2.5,.1,4.2,c,{n:2,h:.28,d:.36});
   box('basaltPol',0,3.12,.02,2.9,1.02,.04,P('soot'));box('tuffPol',0,3.04,.1,3.1,.08,.18,c);
   sock('sign',0,3.63,.1,0,{w:2.5,h:.8,trade:it.sign});
   if(smoke)smokeAt(smoke.c[0],7.9,smoke.c[1],{r:.14});
   door(1.6,0,0,0,1.0);
   FURNISH(ZS_OUT[t]||'zeijani_trade_display',-3.4,0,1.1,0,{setting:'outdoor'});}});}

/* the constructed shop: the planned body (zbBody), a plinth, a flat roof behind a parapet (every other trade a dome on it),
   a framed door, an awning over the front and the sign on the parapet */
function zsBuilt(it,i){const t=zsTrade(it.key),dome=i%2===0;
 defBuilding({key:it.key,name:it.name,seed:4700+i,cut:true,
  tags:{types:['shop'],wealth:'middle',style:'constructed',rock:'tuff'},w:11,d:10,h:dome?6.4:4.8,note:it.note,
  build(o){const c=P('tuff'),wt=P('white'),inst=zbBody(it.key,{wall:'ashlar',wallCol:c}),B=inst&&inst.buildings[0],RY=B?B.roof.y:3.2,top=RY+.22;
   box('ashlar',0,0,0,8.0,.2,6.8,P('tuffDark'));box('paving',0,.2,0,6.7,.02,5.5,P('tuffDark'));
   box('ashlar',0,RY,0,7.5,.22,6.3,c);
   for(const [x,z,w,d] of [[0,3.0,7.6,.4],[0,-3.0,7.6,.4],[3.6,0,.4,5.6],[-3.6,0,.4,5.6]]){box('ashlar',x,top,z,w,.6,d,c);box('tuffPol',x,top+.6,z,w+.1,.08,d+.1,wt);}
   if(dome){zfDrum('ashlar',-1.2,top,-.7,1.5,.45,c,{seg:22});zfDome('plaster',-1.2,top+.45,-.7,1.5,1.15,P('plaster'),{seg:22,rows:7});}
   for(const s of [-1,1])box('tuffPol',1.4+s*.64,.2,3.26,.26,2.1,.14,wt);box('tuffPol',1.4,2.3,3.28,1.6,.24,.2,wt);zfLeaf(1.4,.2,3.0,1.0,2.1,P('wood'),.5);
   sock('awning',0,2.75,3.2,0,{w:6.6,d:1.7,drop:.5,h:2.25});
   sock('sign',-1.4,top+.3,3.24,0,{w:2.4,h:.52,trade:it.sign});
   door(1.4,.2,3.2,0,1.0);
   FURNISH('zeijani_trade_display',-1.8,0,4.2,0,{setting:'outdoor'});if(ZS_OUT[t]&&ZS_OUT[t]!=='zeijani_trade_display')FURNISH(ZS_OUT[t],-3.0,0,4.4,0,{setting:'outdoor'});}});}

ZS_ITEMS.filter(it=>/_carved$/.test(it.key)).forEach(zsCarved);
ZS_ITEMS.filter(it=>/_built$/.test(it.key)).forEach(zsBuilt);
