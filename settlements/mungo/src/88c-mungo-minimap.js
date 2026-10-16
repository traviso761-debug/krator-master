/* ============================== MINIMAP — MUNGO's own records ==============================
   Locus's 88b-locus-minimap.js draws the plan (ground, streets, footprints); this adds what only Mungo has: the reed
   islands and their pads, the pontoon bridge and the island bridges, the marsh's causeways. Hoisted, so the order of
   the fragments does not matter. */
function MINIMAP_EXTRA(M){
  REED.islands.forEach(function(I){ M.obb(I.x, I.z, I.rx*0.86, I.rz*0.86, 0, { col:'rgba(176,156,96,.85)', y:-1, name:'Reed island' + (I.cluster ? ' (' + I.cluster + ')' : '') }); });
  REED.pads.forEach(function(P){ M.disc(P.x, P.z, 9, { col:'rgba(150,170,90,.8)', y:-1, name:P.name||'Reed pad' }); });
  REED.bridges.forEach(function(b){ var A=REED.islands[b[0]], B=REED.islands[b[1]]; if(A&&B) M.strip([A.x,A.z],[B.x,B.z], 2.4, { col:'rgba(200,176,112,.8)', y:-1.2 }); });
  if(REED.pontoon) M.strip(REED.pontoon.a, REED.pontoon.b, 3, { col:'rgba(214,190,120,.95)', y:-1.1, name:REED.pontoon.name });
  CAUSEWAYS.forEach(function(c){ M.strip([c[0],c[1]],[c[2],c[3]], 2*c[4], { col:'rgba(150,136,104,.6)', y:-2.5 }); });
  if(REED.tavern) M.label(REED.tavern.x, REED.tavern.z - 30, "Reed's Local", { size:9 });
  if(GEOCHAPTER) M.label(GEOCHAPTER.x, GEOCHAPTER.z - 40, 'Geomancers', { size:9 });
}
