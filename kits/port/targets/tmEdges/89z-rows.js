// TARGET: edges - one segment against every kind of side it can meet, so a
// segment's portSideClose / stamps can be checked in one page: neighbours set
// back and standing out 40 m and 20 m, open sea on both sides, natural land
// coast on both sides. Copy it like the segment target (change PORT_ONLY,
// TITLE, and PORT_EDGE_D for the decay to test).
const PORT_ONLY='tmPass';
const TITLE='Krator Ancient Port — edges: tmPass';
const PORT_EDGE_D=0;
const PORT_LAYOUT_DEF=portLayoutEdges(PORT_ONLY,{d:PORT_EDGE_D});
