// ================================================================= HOST — the plateau's and the shelf's towns, the Ancients' halls
// [draw] The cliff city's town builder (kits/ancients/cliff/40-cliff-town.js, KCLIFF.drawTown): the Dalab set on the plateau and the shelf,
// the station's hall and the great lifts' halls, the caravans' yards and pens, the Travellers' wagons. The station's platforms are under the
// plateau (no mouth on the face); no Fellgang houses here (the Travellers live in their wagons).
const STOWN=(function(){const L=SHELF_LAYOUT,W=L.world;
 return KCLIFF.drawTown({L,scene,ground:SHELF_H,seed:id=>SHELF.seed(W,id),draw:(id,i,salt)=>SHELF.draw(W,id,i,salt),prefix:'shelf',mats:LMAT,quarters:[],mouth:null});})();
/* Dalab's road drawn on the ground (KCLIFF.road): switchbacks at 9 % where a leg is steeper, a cliff leg left as its cut ramp */
const SROAD=(function(){const L=SHELF_LAYOUT,G=L.ground;return KCLIFF.road({pts:L.ways.find(w=>w.id==='road').pts.map(p=>[p[0],p[1]]),H:SHELF_H,w:6,page:G.page,scene,name:'Dalab\'s road'});})();
