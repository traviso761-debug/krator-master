// ================================================================= HOST — the head's and the foot's towns, the Ancients' halls, the station's mouth
// [draw] The cliff city's town builder (kits/ancients/cliff/40-cliff-town.js, KCLIFF.drawTown, lifted from this fragment on 2026-11-22):
// each part to the builder its key names (the Dalab set, the Fellgang set, the Ancients' halls and mole, the station's mouth over deck 20's
// concourse, the winding house as a tg stand-in, the yards and the Travellers' wagons). Ledge's own: its two Fellgang quarters.
const LTOWN=(function(){const L=LEDGE_LAYOUT,W=L.world;
 return KCLIFF.drawTown({L,scene,ground:LEDGE_H,seed:id=>LEDGE.seed(W,id),draw:(id,i,salt)=>LEDGE.draw(W,id,i,salt),prefix:'ledge',mats:LMAT,
  quarters:[{zone:'Z0',id:'ledge-head',focus:'trade',seed:4376,label:'The head\'s Fellgang quarter',character:'stony'},
            {zone:'Z5',id:'ledge-foot',focus:'fishing',seed:4377,label:'The foot\'s Fellgang quarter',character:'low'}],
  mouth:{part:'station',decks:['d.20.c','d.20.e1']}});})();