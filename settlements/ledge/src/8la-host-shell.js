// ================================================================= HOST — the shell: every deck drawn from its record (PLAN.md 9.3, 9.8)
// [draw] The Ancients' cliff city drawn by the kit's builder (kits/ancients/cliff/20-cliff-stack-draw.js, KCLIFF.drawShell, lifted
// from this fragment on 2026-11-22 when Shelf took the same form): every deck from its record and state, LEDGE.draw by the deck's id
// for what varies inside it. Ledge's own: the station's concourse on deck 20 (C and E1, open, columns), the face cores, the holders'
// dress (Dalab's planters and teal awnings, the Fellgangs' ochre ones, Loj Fower's lamps on kept decks: the builder's defaults).
// LB (the box batch) and LMAT (the shell's materials) are the builder's, used by the towns (8lb) and the wreck (8lc) too.
const LB=KCLIFF.LB;
const LMAT=KCLIFF.mats();
const LSHELL=(function(){const L=LEDGE_LAYOUT,W=L.world;
 return KCLIFF.drawShell({S:L.stack,decks:L.decks,cores:L.lifts.filter(lf=>lf.kind==='core'),draw:(id,i,salt)=>LEDGE.draw(W,id,i,salt),
  parent:scene,name:'the shell',mats:LMAT,concourse:{'d.20.c':1,'d.20.e1':1}});})();
/* the city at night on the host's clock: warm lit windows, brighter lamps (KCLIFF.night) */
const LNIGHT=KCLIFF.night({mats:LMAT,ticks:TICKS});
