// ================================================================= ŌPAL-PHŌRḌ — the Iridescent Order's house: two pieces the Qiblai kit lacks
// The blueprint (settlements/opal-ford/iridescent/BLUEPRINT.md) draws a range of cells along each graded terrace (sheet C) and
// the house of studies as four 12 m ranges round its debate court (sheets H1, H2); the Qiblai kit has neither (its kora arcade
// and its guild lodges stood in for them). Written on the kit's contract (QB.def, the qn* helpers, kits/qiblai/src/89q0) in the
// Turquoise spoke's dress (QSPOKE[4]; o.sp another spoke's), for this page only: they move into kits/qiblai/src/89q3-qb-sacred.js
// with the all-builds rebuild (TODO.md, "Ride along"), where every page that takes the kit gains them. [draw]
//
//   of_cell_range        a single storey of twelve monks' cells, 48 m: a door and a window on the spray in each, a walk in front
//                        under a timber eave (the kit's cloister), prayer drums along it, the spoke's colour, a white parapet
//   of_college_range     the house of studies' range, two storeys and 12 m deep, its cloister walk on the court face, a door
//   _m, _s               every 14 m, windows on both faces; 80 m (the north-east range: the lecture halls under the novices'
//                        dormitory), 50 m (the side ranges), 31 m (either side of the Gate of the Novices)

function buildOfCellRange(G,o){reseed(33701+(o.v|0));const L=o.len==null?48:o.len,D=6.6,P=.5,H=3.2,n=Math.max(2,Math.round(L/4));
 const S=QSPOKE[o.sp==null?4:o.sp%8],wall=xC(S.wall),trim=xC(S.trim),band=xC(S.band),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE));
 vnReg('Range of cells',0,0,L/2,P+H+1.4);
 qnPlinth(0,0,L,D+3.2,P,0,stone);const z0=-1.5;
 const St=qnStack(0,P,z0,L,D,0,[H],wall,'wash',xC(XPAL.white));
 qnWins(0,P,z0,L,D,0,[H],St.k,{pitch:L/n,ww:.7,wh:1.0,kind:'lit',trim,left:false,right:false,back:false,val:'all'});
 for(let i=0;i<n;i++){const u=-L/2+L*(i+.5)/n+1.25;qnDoor(u,P,z0+D/2,0,.9,2.1,{c:trim,step:false});}   /* each cell its door, beside its window */
 qnRoof(0,St.y,z0,St.w,St.d,0,wash,{band,parapet:.45});
 qnCloister(0,P,z0,0,L-.8,D,wash,{band,drums:true});}

function buildOfCollegeRange(G,o){reseed(33711+(o.v|0));const L=o.len==null?50:o.len,D=11.6,P=.7,hs=[3.4,3.0],n=Math.max(1,Math.round(L/14));
 const S=QSPOKE[o.sp==null?4:o.sp%8],wall=xC(S.wall),trim=xC(S.trim),band=xC(S.band),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE));
 vnReg('College range',0,0,L/2,P+6.4+1.6);
 qnPlinth(0,0,L,D+3,P,0,stone);const z0=-1.3;
 const St=qnStack(0,P,z0,L,D,0,hs,wall,'wash',xC(XPAL.white));
 qnWins(0,P,z0,L,D,0,hs,St.k,{pitch:2.6,ww:.8,wh:1.05,kind:'lit',trim,left:false,right:false,val:'all',skip:[]});
 for(let i=0;i<n;i++){const u=-L/2+L*(i+.5)/n;qnDoor(u,P,z0+D/2,0,1.6,2.6,{c:xC(XPAL.red),step:false});}
 const top=qnRoof(0,St.y,z0,St.w,St.d,0,wash,{band,parapet:.6});
 qnCloister(0,P,z0,0,L-1,D,wash,{band});
 for(const s of[-1,1])qnFlags([s*L*.3,top,z0],[s*(L/2-.4),top,z0+D/2-.3]);}

QB.def({key:'of_cell_range',name:'Range of cells (the Iridescent Order)',family:'Sacred — the monasteries',tags:QTAG('civic',['religious','multi-family dwelling'],{job:'worship',note:'twelve cells on a terrace over the fall (settlements/opal-ford)'}),
 w:48,d:10,h:6,fw:48,fd:6.6,build:(G,o)=>buildOfCellRange(G,Object.assign({len:48},o))});
QB.def({key:'of_college_range',name:'College range (the house of studies)',family:'Sacred — the monasteries',tags:QTAG('civic',['religious','civic'],{job:'scribing',note:'the Iridescent Order\'s house of studies (settlements/opal-ford)'}),
 w:80,d:15,h:9,fw:80,fd:11.6,build:(G,o)=>buildOfCollegeRange(G,Object.assign({len:80},o))});
QB.def({key:'of_college_range_m',name:'College range (the house of studies, side)',family:'Sacred — the monasteries',tags:QTAG('civic',['religious','multi-family dwelling'],{job:'scribing'}),
 w:50,d:15,h:9,fw:50,fd:11.6,build:(G,o)=>buildOfCollegeRange(G,Object.assign({len:50},o))});
QB.def({key:'of_college_range_s',name:'College range (the house of studies, gate side)',family:'Sacred — the monasteries',tags:QTAG('civic',['religious','multi-family dwelling'],{job:'scribing'}),
 w:31,d:15,h:9,fw:31,fd:11.6,build:(G,o)=>buildOfCollegeRange(G,Object.assign({len:31},o))});
