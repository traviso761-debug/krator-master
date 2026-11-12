// prefix: ltc
// ================================================================= LOJ TWENNY: THE ROCK CARVED (KCAVERN, from the plan) [G data]
// The hold's rock is one KCAVERN (core/terrain/39-core-cavern.js) under the rift fill: the terminus hall (a hewn room under a
// flattened vault, as the Line's stations are), the branch gallery coming in from the west, and every way and site of the plan
// carved from KCITY.cavern.carve(H, {plan: TG.tg.planOf}) (the sidings, the ramps and stairs between the decks, and each def's
// void plan behind its front). The cavern writes the walk floors (KWALK) of every room, stair and tube; the platforms and the
// concourse at the car floor are the page's own floors (60-lt-scene.js draws them, LTC.floors writes them).
const LTC={SURF:44,cell:.5,chunk:16,seed:20261120};
LTC.build=function(W){const H=LT.plan(),P=LT.HALL,C=KCAVERN.create({ground:()=>LTC.SURF,cell:LTC.cell,chunk:LTC.chunk,seed:LTC.seed,walk:W,minRock:.8});
 /* the terminus hall: 157 x 22 m, a flattened vault to 10.5 m; the branch gallery in from the west (twin tracks, 14 m) */
 C.room({id:'lt.hall',owner:'lt.hall',poly:[[P.x0,P.z0],[P.x1,P.z0],[P.x1,P.z1],[P.x0,P.z1]],y:P.invert,h:P.crown,ceil:'vault',rise:P.crown-P.spring,r:.8,finish:'hewn'});
 C.room({id:'lt.branch',owner:'lt.branch',poly:[[-90,-7],[P.x0+.6,-7],[P.x0+.6,7],[-90,7]],y:P.invert,h:8.5,ceil:'vault',rise:3,r:.6,finish:'hewn'});
 let n=0;const skip={'lt.hall':1};
 for(const p of KCITY.cavern.carve(H,{plan:TG.tg.planOf})){if(skip[p.owner])continue;
  if(p.prim==='room')C.room({id:p.id,owner:p.owner,poly:p.poly,y:p.y,h:p.h,finish:'hewn'});
  else if(p.prim==='stair')C.stair({id:p.id,owner:p.owner,a:p.a,b:p.b,w:p.w,h:p.h});
  else if(p.prim==='tube')C.tube({id:p.id,owner:p.owner,pts:p.pts,w:p.w,h:p.h});
  else if(p.prim==='shaft')C.shaft({id:p.id,owner:p.owner,c:p.c,y0:p.y0,y1:p.y1,r0:p.r0,floor:true});
  else continue;n++;}
 C.build();LTC.C=C;LTC.prims=n;return C;};
/* the platforms' and the concourse's floors at the car floor (the cavern writes the hall's invert, under them) */
LTC.floors=function(W){const P=LT.HALL,y=P.platformY;
 W.floor({rect:[3,150,-11,-4.5],y,name:'the north platform',tag:'platform'});W.floor({rect:[3,150,4.5,11],y,name:'the south platform',tag:'platform'});
 W.floor({rect:[148,157,-11,11],y,name:'the concourse',tag:'platform'});};
