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
  'Wildcat: the hamlets on the flat (the ford\'s U, the pens\' L)':[612,58,-262,610,0,-342],
  /* inside: the storey section opens the houses (the seventh entry; K steps it by hand) */
  'Wildcat inside: the terraces cut at storey 2':[X(east.cx+20),H+30,Z(east.cz-6),X(east.cx+10),H+3,Z(east.cz-34),{section:2}],
  'Wildcat inside: a dwelling at storey 3, from above':[X(hc0.cx+hc0.n[0]*7+3),ht-2.6+6,Z(hc0.cz+hc0.n[1]*7),X(hc0.cx),ht-2.6*2,Z(hc0.cz),{section:3}],
  'Wildcat inside: the round room\'s floor (the kivas opened)':[X(gk.x+9),H+9,Z(gk.z+9),X(gk.x),H-2.6,Z(gk.z),{section:'kiva'}]});}
{const P=TG.fg.barricade(),K=FG_GORGE,X=x=>K.x+x,Z=z=>K.z+z,H=K.H,B=P.bounds,gate=P.passages.find(p=>p.kind==='gate')||{x:0,z1:B.z1},gk=P.kivas.find(k=>k.great)||{x:0,z:-20},
 hero=P.cells.filter(c=>c.hero),hc0=hero[0]||P.cells[0];
 Object.assign(VIEWS,{
  'Barricade: the wall across the pass (core/pueblo, the bar)':[X(70),70,Z(B.z1+120),X(0),H+6,Z(0)],
  'Barricade: the barricade of wrecks on the outer face':[X(gate.x-30),H+2.2,Z(B.z1+14),X(gate.x-5),H+5,Z(B.z1)],
  'Barricade: the gate (the trail through the wall)':[X(gate.x+3),H+1.8,Z(gate.z1+11),X(gate.x),H+2.2,Z(gate.z1-6)],
  'Barricade: the terraces from the plaza, toward the Labyrinth':[X(-30),H+2,Z(B.z0+6),X(10),H+8,Z(B.z1-10)],
  'Barricade: the count room and the plaza from the wall':[X(gk.x+24),H+16,Z(gk.z+26),X(gk.x),H,Z(gk.z)],
  'Barricade: up the gorge from the bastion':[X(B.x1-4),H+22,Z(B.z1-6),X(B.x0+30),H+2,Z(B.z0-60)],
  'Barricade inside: the wall cut at storey 3':[X(10),H+34,Z(B.z1+18),X(0),H+5,Z(B.z1-14),{section:3}],
  'Barricade inside: the count room (the kivas opened)':[X(gk.x+8),H+8,Z(gk.z+8),X(gk.x),H-2.8,Z(gk.z),{section:'kiva'}]});}
