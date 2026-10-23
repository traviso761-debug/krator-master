// Presets, DERIVED: 89z-rows.js loads before 90-scene.js and this after it, so the builder has run and left its site in
// SCN_SITE (8ar3). Local frame: x east, z south; the Gate of the Heirs faces south (th = 90 degrees).
// the per-type guide (91-probe.js BUDGET): the Sanctum is an arcology between Plymouth's mass and Hexahedron's: 'mega'
BUDGET.type.sanctum='mega';
const SCS=SCN_SITE.kept||{x:0,z:0,RP:400,RS:266.7,YP:30,YS0:75,YS1:315,YT:425,front:Math.PI/2,atria:[],wells:[]};
const SCP=(r,th,y)=>[SCS.x+r*Math.cos(th),y,SCS.z+r*Math.sin(th)];
const scAp=SCS.RP*Math.cos(Math.PI/6);
// THE HERO: 1 400 m south and a little east, 250 m up: the whole 800 m podium and the 425 m figure in the 50 degree lens
const SCHERO=SCP(1400,SCS.front-.32,250).concat([SCS.x,190,SCS.z]);
const scAt=SCS.atria[1]||{c:[0,300],th:Math.PI/2},scWell=SCS.wells[0]||{c:[150,0],th:0};
const VIEWS={
 'The Sanctum':                 SCHERO,
 'The Gate of the Heirs':       SCP(scAp+90,SCS.front+.08,16).concat(SCP(scAp,SCS.front,18)),
 'From the avenue':             SCP(scAp+420,SCS.front,6).concat([SCS.x,170,SCS.z]),
 // AN ATRIUM: the south court, its gold ancestor in the pool, the gate's passage behind
 'The south atrium':            [SCS.x+scAt.c[0]+18,24,SCS.z+scAt.c[1]-22,SCS.x+scAt.c[0],9,SCS.z+scAt.c[1]],
 // UNDER THE SOLID: from the podium's roof, the stalk and the soffit with its wells
 'Under the solid':             SCP(232,SCS.front+.5,SCS.YP+4).concat([SCS.x,SCS.YS0+30,SCS.z]),
 'The roof garden':             SCP(380,SCS.front-.6,SCS.YS1+110).concat([SCS.x,SCS.YS1+20,SCS.z]),
 'A light well from above':     [SCS.x+scWell.c[0]+30,SCS.YS1+140,SCS.z+scWell.c[1]+60,SCS.x+scWell.c[0],SCS.YS1-40,SCS.z+scWell.c[1]],
 'The face of the solid':       SCP(560,SCS.front-.12,SCS.YS0+150).concat(SCP(200,SCS.front-.12,SCS.YS0+120)),
 // THE SIX MINISTRIES: the Ministry of Revenue (the south-east corner) with the Gate of the Heirs and the Ministry of Rites
 'The Six Ministries':          SCP(1000,Math.PI/3+.35,180).concat(SCP(300,Math.PI/3,120)),
 'A garden court':              (function(){const a=(SCS.courts||[])[2]||{c:[0,300]};return [SCS.x+a.c[0]+12,26,SCS.z+a.c[1]-16,SCS.x+a.c[0],4,SCS.z+a.c[1]];})(),
 'The line of heads':           SCP(scAp+30,SCS.front-.28,40).concat(SCP(scAp,SCS.front-.12,34)),
 'The podium from above':       [SCS.x,1350,SCS.z+520,SCS.x,0,SCS.z],
 'The Sanctum by night':        SCHERO.concat([1]),
};
window._sanctumSite={vol:SCS.vol,trees:SCS.trees,tags:KTAGS.sanctum?KTAGS.sanctum.audit():null};
