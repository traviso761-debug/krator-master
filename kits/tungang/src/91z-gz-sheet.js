// ================================================================= THE SHEET'S GLAZIER ROCK: the rows carved, and a sample scarp hold
// After the rows are built (buildWorld, wrapped here after 91t-fg-sheet.js), the Glaziers' carved defs get their rock, as a world
// gives it (PLAN.md 3.4; kits/zeijani/PLAN.md 6.3: "a carved def stands in a block of its host rock, front forward"):
//   THE ROWS        each Glazier row a block of the scarp's rock behind its fronts (a KCAVERN mass), carved from every site's void
//                   plan (TG.gz.carve: the plan is the one source; its floors go to core/walk)
//   THE SCARP HOLD  (east of the Glazier rows) a fault scarp in two steps over a milk-opal tarn, laid as a world lays a hold: the
//                   sites registered in core/tags, the rock carved from their plans, the fronts drawn through the host API
//                   (TG.gz.draw: dry, the lamps as light records). The lower face: the stair up, cells, household fronts, the
//                   Register, the glass shop, the dark adit; lotus ponds on the shore. The ledge (6.8 m) and the upper face: an
//                   adit and a vein gallery, a cell, a rich house, the wheel walk to the tea hall, the monks' house
// The rock is one KCAVERN (cell .5 m) drawn by KCAVERN.drawRock with the rock cut (core/terrain/host/39h): the cut-away (C) opens
// every void's rock 2.2 m over its own floor, and the rock that is no void's (the blocks' outsides) inside one box over the
// whole Glazier ground. window._gzSheet holds what was laid and drawn, for verify.py. Host-only: three.js.
const GZ_SCARP={ledge:6.8,top:24,x0:-45,x1:45,back:-30,shelf:-7,
 /* the sites in the scarp's frame (x along the face, z out of it): [key, x, level ('lo' | 'hi' | 'shore'), v] */
 sites:[['gz-stair',-31,'lo',0],['gz-cell',-23.5,'lo',0],['gz-cell',-17.5,'lo',1],['gz-front',-8,'lo',0],['gz-front',3,'lo',1],['gz-register-room',13.5,'lo',0],
  ['gz-glass-shop',25,'lo',1],['gz-dark-adit',36.5,'lo',0],['gz-lotus-pond',-12,'shore',0],['gz-lotus-pond',14,'shore',1],
  ['gz-adit',-38.5,'hi',0],['gz-vein-gallery',-29.5,'hi',1],['gz-cell',-23,'hi',2],['gz-house',-12.5,'hi',0],['gz-wheel-walk',1,'hi',1],['gz-tea-hall',16,'hi',0],
  ['gz-monks-house',33.5,'hi',0]]};
/* the Glazier rows' sites (the engine's layout) and their rows */
function gzSheetRows(){const rows=new Map();for(const S of SITES){if(!/^gz-/.test(S.key))continue;const k=S.z.toFixed(2);if(!rows.has(k))rows.set(k,[]);rows.get(k).push(S);}return [...rows.values()];}
/* the stair's seed with two flights (the scarp's ledge is two flights up) */
function gzSheetStairV(){for(let v=0;v<40;v++)if(TG.gz.plan('gz-stair',{v}).n===2)return v;return 0;}
function gzSheetRock(W){const out={rows:[],scarp:null,draw:null,prims:0};
 if(typeof KCAVERN==='undefined'||!KCAVERN.drawRock){reportErr('the Glazier rock needs core/terrain (KCAVERN) and its host draw');return out;}
 const C=KCAVERN.create({ground:()=>-.5,cell:.5,chunk:16,seed:9400,walk:typeof KWALK!=='undefined'?KWALK:null,minRock:.6});
 /* THE ROWS: a block behind each row's fronts, as deep as its deepest def plus 2 m, 1.2 m over its tallest; then every site carved */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 gzSheetRows().forEach((R,i)=>{const z=R[0].z,dmax=Math.max(...R.map(S=>TG.gz.BOX[S.key].d-TG.gz.BOX[S.key].out)),hmax=Math.max(4,...R.map(S=>TG.gz.BOX[S.key].h));
  const a=Math.min(...R.map(S=>S.x-TG.gz.BOX[S.key].w/2))-3,b=Math.max(...R.map(S=>S.x+TG.gz.BOX[S.key].w/2))+3;
  C.mass({id:'gzrow'+i,poly:[[a,z-dmax-2],[b,z-dmax-2],[b,z],[a,z]],y0:-.5,y1:hmax+1.2});
  const sites=R.map((S,j)=>({id:'row'+i+'.'+j+'.'+S.key,key:S.key,x:S.x,y:0,z:S.z,ry:0,v:S.o.v|0,state:S.o.state}));
  const P=TG.gz.carve(C,sites);out.prims+=P.length;out.rows.push({z,sites,prims:P.length});
  x0=Math.min(x0,a);x1=Math.max(x1,b);z0=Math.min(z0,z-dmax-2);z1=Math.max(z1,z+10);});
 /* THE SCARP HOLD, east of the rows (its face along x, the tarn to +z) */
 const G=GZ_SCARP,ox=Math.max(150,x1+70),oz=out.rows.length?(z0+z1)/2+20:-700,stv=gzSheetStairV();
 C.mass({id:'gzscarp.lo',poly:[[ox+G.x0,oz+G.back],[ox+G.x1,oz+G.back],[ox+G.x1,oz],[ox+G.x0,oz]],y0:-.5,y1:G.ledge});
 C.mass({id:'gzscarp.hi',poly:[[ox+G.x0,oz+G.back],[ox+G.x1,oz+G.back],[ox+G.x1,oz+G.shelf],[ox+G.x0,oz+G.shelf]],y0:G.ledge-.2,y1:G.top});
 const sites=G.sites.map(([key,x,lv,v],i)=>({id:'scarp.'+i+'.'+key,key,x:ox+x,y:lv==='hi'?G.ledge:0,z:oz+(lv==='hi'?G.shelf:lv==='shore'?11:0),ry:0,v:key==='gz-stair'?stv:v}));
 const P=TG.gz.carve(C,sites);out.prims+=P.length;
 const t0=performance.now();C.build();out.buildMs=Math.round(performance.now()-t0);
 /* the rock: one material, the cut layer on it */
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide,color:hc(0x8a7c78)});
 if(KCAVERN.cutLayer){KCAVERN.cutLayer(mat);KCAVERN.cut.above(2.2);KCAVERN.cut.boxes([{x:(Math.min(x0,ox+G.x0)+Math.max(x1,ox+G.x1))/2,z:(z0+Math.max(z1,oz+30))/2,hw:(Math.max(x1,ox+G.x1)-Math.min(x0,ox+G.x0))/2+4,hd:(Math.max(z1,oz+30)-z0)/2+4,ry:0,floor:0}]);}
 const R=KCAVERN.drawRock(C,{THREE,material:mat,ground:'drop',attrs:KCAVERN.cutWeight?['aKCut']:[],weight:KCAVERN.cutWeight?KCAVERN.cutWeight(C):null,label:'The scarp\'s rock (KCAVERN, carved from the Glaziers\' void plans)',name:'gz:rock'});
 R.group.children.forEach(m=>{m.receiveShadow=true;m.castShadow=true;m.userData.probeSkip=true;});W.add(R.group);out.rock={tris:R.tris,chunks:R.chunks,ms:R.ms};out.cavern=C;
 /* the sheet's ground ends 800 m north of the origin (core/engine 90-scene.js, GROUND_SIZE): the Glazier rows run past it, so
    the ground is carried on under them */
 const gzN=Math.min(z0,oz+G.back)-40;if(gzN<-GROUND_SIZE/2)W.add(fgSheetMesh(()=>0,-GROUND_SIZE/2,GROUND_SIZE/2,gzN,-GROUND_SIZE/2,25,KIT.ground));
 /* the tarn before the scarp: milky turquoise water, a shore of pale gravel */
 const tarn=new THREE.Mesh(new THREE.PlaneGeometry(G.x1-G.x0+40,60),new THREE.MeshStandardMaterial({color:hc(0x7cc4c4),roughness:.18,metalness:.05,transparent:true,opacity:.9}));
 tarn.rotation.x=-PI/2;tarn.position.set(ox,.03,oz+24+30);tarn.userData.probeSkip=true;tarn.receiveShadow=true;W.add(tarn);
 /* register every scarp site in core/tags before it is drawn (as a world does), then draw them through the host API */
 sites.forEach(s=>fgSheetRegister(s,s.y,'The Glazier scarp'));
 out.scarp={x:ox,z:oz,sites};out.draw=TG.gz.draw(sites,{scene:W,seed:9410,label:'The Glazier scarp (TG.gz.draw: the fronts and the rooms\' fittings)'});
 out.lights=out.draw.lights.length;window._gzSheet=out;return out;}
/* the cut-away opens the rock with the buildings */
const gzSheetCut0=cutSet;
cutSet=function(on){if(typeof KCAVERN!=='undefined'&&KCAVERN.cut)KCAVERN.cut.set(on);return gzSheetCut0(on);};
const gzSheetBW=buildWorld;
buildWorld=function(){const W=gzSheetBW();try{gzSheetRock(W);}catch(err){reportErr('the Glazier rock: '+(err.stack||err));}
 if(typeof nightRebuild==='function')nightRebuild();if(window._build&&window._gzSheet)window._build.glaziers={rows:window._gzSheet.rows.length,scarp:window._gzSheet.scarp?window._gzSheet.scarp.sites.length:0,rockTris:window._gzSheet.rock?window._gzSheet.rock.tris:0,buildMs:window._gzSheet.buildMs};return W;};
