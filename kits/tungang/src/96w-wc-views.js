// ================================================================= WILDCAT'S VIEWS (before 99-host-take.js hands VIEWS to core/host)
// The great house on its knoll and the hamlets (91w-wc-sheet.js); the eyes are worked out from the plan, so they follow it.
{const P=TG.fg.wildcat(),K=FG_KNOLL,X=x=>K.x+x,Z=z=>K.z+z,H=K.H,h=P.storey,gk=P.kivas.find(k=>k.great)||{x:-30,z:-10},hero=P.cells.filter(c=>c.hero),D=fgWcDress(P),dd=D.deeds[0];
 const hc0=hero.length?hero[Math.floor(hero.length/2)]:P.cells[0],ht=hc0.storeys*h+H,east=P.plazas[P.plazas.length-1],G=P.enclosure&&P.enclosure.gate;
 Object.assign(VIEWS,{
  'Wildcat: the great house (core/pueblo, a scrap pueblo of Pueblo Bonito\'s scale)':[X(95),105,Z(150),X(0),4,Z(-8)],
  'Wildcat: from the gate (the stockade at the knoll\'s foot)':G?[X(G.x+6),3.2,Z(G.z+16),X(G.x-4),9,Z(G.z-40)]:[X(0),4,Z(90),X(0),8,Z(0)],
  'Wildcat: the west plaza and the round room':[X(gk.x+16),H+2.2,Z(gk.z+15),X(gk.x-4),H+3,Z(gk.z-12)],
  'Wildcat: the terraces from the east plaza':[X(east.cx-6),H+1.7,Z(east.cz+12),X(east.cx+18),H+7,Z(east.cz-26)],
  'Wildcat: the hero\'s top terrace, the horned crest':[X(hc0.cx+hc0.n[0]*20+6),ht+5,Z(hc0.cz+hc0.n[1]*20),X(hc0.cx),ht,Z(hc0.cz)],
  'Wildcat: the Deeds on the front block':dd?[X(dd.x+Math.sin(dd.ry)*9+2),H+1.6,Z(dd.z+Math.cos(dd.ry)*9),X(dd.x),H+1.4,Z(dd.z)]:[X(0),H+2,Z(30),X(0),H+1,Z(0)],
  'Wildcat: the outer wall (NO SKABS), from the north':[X(-25),14,Z(P.bounds.z0-60),X(0),H+6,Z(P.bounds.z0)],
  'Wildcat: the hamlets on the flat (the ford\'s U, the pens\' L)':[612,58,-262,610,0,-342]});}
