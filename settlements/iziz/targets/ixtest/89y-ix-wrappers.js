// TARGET: ixtest — the interiors test sheet (the owner, 2026-10-19: "build me a test artifact containing every building we
// made an interior for today. i may want to exile certain ancient buildings that don't work"). Wrapper defs that build an
// Ancients-kit building or a transplant the way the city does (the same builder at the city's scale and decay, then the same
// interior hook: izTowerIx, izAncIx, izTransIx), so each sits on the sheet as a site of its own and is labelled by its key and
// state. The vernacular civic buildings, the port pieces, the guilds, the temple's and the arena's interiors are their own defs.
// kitSection slices whose x range is not centred are moved back over their site (IXT_CENTRE, kit units).
const IXT_KITS={skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,
 aptsA:kitSection(buildApartments,-60,60),aptsC:kitSection(buildApartments,265,420),honey:kitSection(buildApartments,75,235),
 houseD:kitSection(buildHouses2,-30,30),houseE:kitSection(buildHouses2,30,95),houseF:kitSection(buildHouses2,95,170),fuel:buildFuelStation,
 // the owner's roster (2026-10-19): the bridge house always in its rehabilitated form (rusted when ruined, below)
 wave:buildAltWaveHouse,bridge:(G,gx,gz,d)=>buildAltBridgeHouse(G,gx,gz,3),fins:buildAltFinApartments,adlab:buildAltLab,flat:buildAltFlat,hotel:buildHotel,cultural:buildCultural,aptsC2:buildAptsC2};
const IXT_CENTRE={aptsC:342.5,honey:155,houseE:62.5,houseF:132.5};
const IXT_STATE=d=>d===3?'repaired':d===1?'ruined':'toppled';
// a kit building at decay d: HOLES as the city sets it, the kit's records moved into the world and named with the key and state,
// then (outside the site's transform, as placeKit calls it) its interior
function ixtKitDef(key,d){const label=key+' · '+IXT_STATE(d);
 VERN.def({key:'ixt_'+key+'_d'+d,name:label,family:'ixtest',tags:{type:['civic']},w:60,d:60,h:120,build(G,o){reseed(8601);
  const r0=REG.length;HOLES=d===3?.55:1;try{withFlatGround(()=>IXT_KITS[key](G,0,0,d));}finally{HOLES=1;KOFF=[0,0,0];}
  if(key==='bridge'&&d===1)izsRustSkin(G);
  vnAdoptREG(r0,n=>label+' — '+n);endGroupXF();
  try{if(/^sky/.test(key))izTowerIx(key,G,d,r0);else if(d!==2)izAncIx(key,G,d,r0,key==='cultural'&&typeof CULT_HALLS!=='undefined'?{halls:CULT_HALLS.slice()}:undefined);}catch(e){reportErr('ixtest '+label+': '+(e&&e.stack||e));}
  finally{useGroupXF(G);}}});}
// a transplant (the Ancient half) as placeTrans builds it: TRANS.place at the site, then izTransIx after the wreck
function ixtTransDef(kind,mode,scale){const label='t_'+kind+' · '+(mode==='ancrehab'?'reclaimed':'ruined');
 VERN.def({key:'ixt_t_'+kind+'_'+mode,name:label,family:'ixtest',tags:{type:['civic']},w:40,d:40,h:80,build(G,o){reseed(8601);const C=VERN.cur;endGroupXF();
  try{const snap=kitSnapshot(),P=TRANS.place(scene,kind,mode,C.x,C.z,C.ry,scale,8700+kind.length*7+(mode==='ancrehab'?1:0),{},C.o.y||0);
   if(P){const R=REG[REG.length-1];R.name=label+' — '+R.name;izTransIx(kind,mode,P,REG.length-1,snap);}}
  catch(e){reportErr('ixtest '+label+': '+(e&&e.stack||e));}finally{KOFF=[0,0,0];useGroupXF(G);}}});}
// the temple's and the arena's shells (their interiors are the next site, on the same transform)
function ixtShellDef(kind,scale){VERN.def({key:'ixt_'+kind,name:kind,family:'ixtest',tags:{type:['civic']},w:80,d:80,h:80,build(G,o){reseed(8601);const C=VERN.cur;endGroupXF();
 try{TRANS.place(scene,kind,'anc',C.x,C.z,C.ry,scale,8800+kind.length,{role:kind,wealth:'civic'},C.o.y||0);const R=REG[REG.length-1];R.name=kind+' (shell) — '+R.name;}
 catch(e){reportErr('ixtest '+kind+': '+(e&&e.stack||e));}finally{KOFF=[0,0,0];useGroupXF(G);}}});}
for(const k of['skyA','skyB','skyC','skyD','skyE','skyF'])for(const d of[3,1,2])ixtKitDef(k,d);
for(const k of['aptsA','aptsC','honey','houseD','houseE','houseF','fuel','wave','bridge','fins','adlab','flat','hotel','cultural','aptsC2'])for(const d of[3,1])ixtKitDef(k,d);
for(const k of['setback','setback2','pent','hept','wedge','barrel','midrise'])for(const m of['ancrehab','ancruin'])ixtTransDef(k,m,2.4);
ixtShellDef('temple',.72);ixtShellDef('arena',.82);
