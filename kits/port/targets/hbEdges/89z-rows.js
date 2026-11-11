// TARGET: hbEdges - one small-craft harbour against every kind of side it can
// meet (steps of 40 and 20 m both ways, open sea, natural land). Set
// PORT_ONLY to hbFish / hbMarina / hbHaven and PORT_EDGE_D to the decay.
const PORT_ONLY='hbHaven';
const TITLE='Krator Ancient Port — edges: small-craft harbours';
const PORT_EDGE_D=1;
const PORT_LAYOUT_DEF=portLayoutEdges(PORT_ONLY,{d:PORT_EDGE_D});
