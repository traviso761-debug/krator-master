// ================================================================= HOST — the shell: every deck drawn from its record (PLAN.md 5.3, 5.4)
// [draw] The Ancients' cliff city drawn by the kit's builder (kits/ancients/cliff/20-cliff-stack-draw.js, KCLIFF.drawShell): every deck from
// its record and state, SHELF.draw by the deck's id for what varies inside it; the face cores; Dalab's dress on its lived decks.
const LB=KCLIFF.LB;
const LMAT=KCLIFF.mats();
const SSHELL=(function(){const L=SHELF_LAYOUT,W=L.world;
 return KCLIFF.drawShell({S:L.stack,decks:L.decks,cores:L.lifts.filter(lf=>lf.kind==='core'),draw:(id,i,salt)=>SHELF.draw(W,id,i,salt),
  parent:scene,name:'the shell',mats:LMAT});})();