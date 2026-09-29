// ================================================================= DALAB — the town types (round 10: filling the grid)
// The kinds a full street grid needs between the huts and the civic set: dense dwellings (a terrace row, a stacked
// house), the small civic and trade that stand on every block (a well court, a bath house, a scribes' hall, a
// travellers' inn), the industry the walls are made from (the earth yard), an orchard plot, and the watch towers
// the giants stand at. Same rules as the rest of the kit: peasants build round in rammed earth under thatch, civic
// builds in grey stone with relief and murals and carries The God's light. Front is +z.

// ---------------------------------------------------------------- TERRACE ROW: three joined earth cells under one long thatch ridge
function buildDalabRowhouse(G,o){reseed(8801+(o.v|0));const N=3,CW=5.6,D=6.4,H=2.6;const W=N*CW;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Terrace row (peasant)',0,0,W/2+2,H+4.2);
 vB('dEarth',0,-.05,0,W+1.2,.4,D+1.2,0,dCol(DPAL.earthDark));                                         // the shared plinth
 vB('dEarth',0,.3,0,W,H,D,0,earth);
 for(let k=1;k<N;k++)vB('dEarth',-W/2+k*CW,.3,0,.5,H+.3,D+.5,0,dCol(DPAL.earthDark));                 // party walls stand proud
 for(let k=0;k<N;k++){const x=-W/2+CW/2+k*CW;const c=[DPAL.red,DPAL.turq,DPAL.gold][k%3];
  vnDoor(x-1.2,.3,D/2,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
  vnWin(x+1.3,.3+1.2,D/2,0,.8,.7,'open','vWood',wood,true);dnHearth(x+1.3,.3+1.2,D/2,0,.8,.7);
  vB('dEarth',x,.3+.1,D/2+.06,CW-.9,.5,.12,0,dCol(c));                                                 // each cell its own painted foot
  dnJar(x+2.2,.3,D/2+1.2,.28);}
 // one long thatch: a hip over the whole run, a timber ring beam, a smoke hole at each cell
 vnHipRoof('vHipT',0,.3+H,0,W,D,3.0,0,dCol(DPAL.thatch),1.0);vB('vWood',0,.3+H-.15,0,W+.6,.22,D+.6,0,wood);
 for(let k=0;k<N;k++)vnChimney(-W/2+CW/2+k*CW+1.0,.3+H+2.3,-1.2,1.0,.1,true);
 // the shared yard in front: paving, a drying line, a bench, a woodpile at the end
 vnPaving(0,.02,D/2+2.2,W-2,2.8,0,dCol(DPAL.earthDark),8);vnDryingRack(-W/2+4,0,D/2+3.6,0,4.5);
 vB('vWood',3.5,.35,D/2+2.4,2.4,.1,.4,0,wood);dnWoodpile(W/2+1.1,0,-.6,Math.PI/2,1.6);
 dnFolk(-1,D/2+4.2,3,1.8);}
// ---------------------------------------------------------------- STACKED HOUSE: two storeys of rammed earth, an outside stair to a gallery, three doors up
function buildDalabTenement(G,o){reseed(8811+(o.v|0));const W=11,D=8,H1=2.9,H2=2.6;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Stacked house (peasant)',0,0,8,H1+H2+3.6);
 vB('dEarth',0,-.05,0,W+1.4,.4,D+1.4,0,dCol(DPAL.earthDark));
 kput('dEarthBat',[0,.3,0],null,[W,H1,D],earth);vB('dEarth',0,.3+H1-.1,0,W-.2,H2,D-.2,0,earth.clone().multiplyScalar(1.04));   // the ground floor battered, the upper straight
 vB('dEarth',0,.3+H1-.1,D/2-.05,W,.3,.16,0,dCol(DPAL.red));                                                      // the red string course
 vnDoor(-3.2,.3,D/2,0,1.0,2.0,'vWood',wood,vC(0x5a4a3a),false);vnDoor(2.6,.3,D/2,0,1.0,2.0,'vWood',wood,vC(0x5a4a3a),false);
 vnWin(-.4,.3+1.3,D/2,0,.8,.7,'open','vWood',wood,true);dnHearth(-.4,.3+1.3,D/2,0,.8,.7);
 // the gallery: a timber deck along the front at first-floor level on posts, a rail, the stair up its end
 const GY=.3+H1-.1;vB('vWood',0,GY,D/2+1.0,W+.6,.18,2.0,0,wood);for(const x of[-W/2,-W/4,0,W/4,W/2])vPst('vPost',x,0,D/2+1.9,.11,GY,wood);
 vB('vWood',0,GY+1.0,D/2+1.95,W+.6,.08,.08,0,wood);for(const x of[-W/2,-W/4,0,W/4,W/2])vB('vWood',x,GY+.18,D/2+1.95,.08,.85,.08,0,wood);
 vnStairs(W/2+1.2,0,D/2+1.0,Math.PI/2,1.0,GY,9,'vWood',wood);
 for(const x of[-3.6,0,3.6]){vnDoor(x,GY,D/2-.1,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);vnWin(x+1.6,GY+1.2,D/2-.1,0,.6,.6,'shut','vWood',wood);}
 for(const s of[-1,1])vnWin(s*W/2,.3+1.4,-1.5,s*Math.PI/2,.7,.7,'shut','vWood',wood);
 vnHipRoof('vHipT',0,.3+H1+H2-.1,0,W-.2,D-.2,2.6,0,dCol(DPAL.thatch),1.1);vB('vWood',0,.3+H1+H2-.25,0,W+.4,.22,D+.4,0,wood);
 dnMuralBand(0,.3+H1+H2-.9,-D/2+.05,Math.PI,W-2,.5);vnChimney(-2.5,.3+H1+H2+2.0,-1.5,1.0,.1,true);
 // the yard: jars, a rack of lines between two posts, folk
 dnJar(-W/2-.9,0,1.5,.3);dnJar(-W/2-1.5,0,.6,.26);vnDryingRack(-2,0,D/2+3.8,0,5);vnSacks(W/2+.6,0,-1.2,3);
 dnFolk(-1,D/2+4.6,3,1.6);}
// ---------------------------------------------------------------- WELL COURT: a paved court round a stone well-drum, a sweep pole, jars, the queue
function buildDalabWell(G,o){reseed(8821+(o.v|0));const st=dCol(DPAL.stone),wood=dCol(DPAL.woodGrey);
 vnReg('Well court',0,0,5,5);
 vnPaving(0,.02,0,8,8,0,st,14);dnDrum('dStoneDrum',0,0,0,1.3,1.1,st);dnDrum('dReliefDrum',0,.35,0,1.34,.5,st);dnDrum('vDarkB',0,1.05,0,1.05,.1,null);
 for(const s of[-1,1])vPst('vPostB',s*1.1,0,-1.4,.12,2.6,wood);vB('vWood',0,2.5,-1.4,2.6,.14,.14,0,wood);                 // the frame over the well
 kput('vPost',[1.6,2.0,-1.2],qEuler(0,.4,-.55),[.09,4.6,.09],wood);vB('vWood',2.9,3.3,-.7,.6,.6,.6,0,vC(0x4a3a2c));      // the sweep and its counterweight
 kput('vPost',[0,1.35,-1.4],qEuler(Math.PI/2,0,0),[.05,2.3,.05],vC(0x3a2a1c));vnBarrel(0,1.55,-1.4,.22,.4,wood);                  // the rope and the bucket
 vB('vStone',0,.05,2.6,3.0,.35,.8,0,st);dnJar(-2.6,0,1.6,.32);dnJar(2.4,0,1.2,.28);dnJar(2.9,0,2.0,.26);dnJar(-3.0,0,-1.8,.3);
 vnPlanter(-3.2,0,-3.2,1.8,.7,0,wood);dnStele(3.2,0,-3.2,0,1.8,st);
 dnFolk(0,2.2,3,1.4);dnFolk(-2,-1,2,.8);}
// ---------------------------------------------------------------- BATH HOUSE: a stone drum under a low dome, a steaming pool court behind an earth wall; The God's light
function buildDalabBathhouse(G,o){reseed(8831+(o.v|0));const R=5.2,H=3.8,CW=22,CD=18;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),earth=dCol(DPAL.earth);
 vnReg('Bath house',0,0,12,H+R*.7+1.5);vnReg('Bath house wall',0,0,12.5,2.4,{part:'wall',type:['civic']});
 dnEarthWall(0,0,0,CW,CD,0,2.2,3.0,{c:earth,relief:true,stoneGate:true});
 // the hot room, back of the court
 const hz=-CD/2+R+1.8;dnDrum('dStoneDrum',0,0,hz,R,H,st);dnDrum('dReliefDrum',0,.3,hz,R+.06,.9,st);dnMuralRing(0,H-1.3,hz,R+.05,1.0,st,2);
 kput('dStoneDome',[0,H,hz],null,[R+.3,R*.7,R+.3],st.clone().multiplyScalar(.9));vBall('dGiltBall',0,H+R*.7+.2,hz,.3);
 vnChimney(R*.5,H+R*.55,hz-R*.4,1.6,.16,false);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,hz,R,a);dnGodWin(p[0],1.6,p[1],a,.9,1.1,'vStone',st);}
 const dp=dnOnRing(0,hz,R,0);dnGate(dp[0],0,dp[1]+.1,0,1.6,2.6,st);vnDoor(dp[0],0,dp[1],0,1.4,2.5,'vStone',st,vC(0x4a2e1c),false);for(const x of[-2,2])dnGodLamp(x,3.0,dp[1],0);
 // the pool: a stone-kerbed basin of dark water in the court, steam, benches, a colonnade of stone posts along one side
 {const pz=hz+R+4.4;vB('vStone',0,0,pz,9,.4,6,0,st);vB('vPanelB',0,.32,pz,8.2,.12,5.2,0,vC(0x3a8a80));   /* the pool reads teal, not black */
  for(let k=0;k<5;k++)kput('dGlow',[rr(-3.5,3.5),.7+rr(0,.5),pz+rr(-2,2)],null,[1.2,.5,1.2],vC(0xdfe8e4));                      // steam
  for(const x of[-7,7]){vB('vStone',x,0,pz,1.4,.5,5,0,st);for(const z of[-2,0,2])dnJar(x,.5,pz+z,.24);}
  for(let k=0;k<5;k++){vPst('vPostS',-CW/2+2.2,0,-CD/2+4+k*2.6,.24,3.0,st);}vB('vWood',-CW/2+2.2,3.0,-CD/2+4+5.2,.4,.25,12,0,wood);
  vnShedRoof(-CW/2+3.4,3.2,-CD/2+9.2,2.6,12,.7,Math.PI/2,'vShingleB',dCol(DPAL.shingle),.3,.2);}
 vnPaving(0,.02,CD/2-3,10,4,0,st,10);dnFirePit(CW/2-4,0,CD/2-4,.6);dnChecker(0,.03,hz+R+1.0,5,1.6,0);
 dnStele(-4.5,0,CD/2+1.6,0,2.4,st,true);dnStele(4.5,0,CD/2+1.6,0,2.4,st,true);
 dnFolk(0,CD/2+4,3,1.6);dnFolk(3,hz+R+4.4,2,1.2);}
// ---------------------------------------------------------------- SCRIBES' HALL: a long timber hall on a stone plinth, mural bands, God-lit windows, a stele court
function buildDalabScribes(G,o){reseed(8841+(o.v|0));const W=18,D=9,H=4.0,Y0=.9;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg("Scribes' hall",0,0,12,Y0+H+4.5);
 vB('vStone',0,0,0,W+2,Y0,D+2,0,st);dnReliefBand(0,.15,D/2+1.0,0,W-1,.55,st);vnStairs(0,0,D/2+1.0+.6,0,3.4,Y0,3,'vStone',st);
 vnFrame(0,Y0,0,W,H,D,0,wood,.18);vB('vWood',0,Y0,0,W-.12,H,D-.12,0,wood.clone().multiplyScalar(.9));
 dnMuralBand(0,Y0+H-1.4,D/2-.02,0,W-3,1.2);dnMuralBand(0,Y0+H-1.4,-D/2+.02,Math.PI,W-3,1.2,1);
 vnGableRoof(0,Y0+H,0,W,D,3.2,0,'vGableS',sh,1.2,'vGableW',wood,.3);dnCrest(0,Y0+H+3.2,0,3,0,wood);
 vnDoor(0,Y0,D/2,0,1.5,2.5,'vWood',wood,vC(0x4a2e1c));
 for(const x of[-6.6,-4.4,-2.2,2.2,4.4,6.6])dnGodWin(x,Y0+1.3,D/2,0,1.0,1.3,'vWood',wood);for(const s of[-1,1])for(const z of[-2.4,2.4])dnGodWin(s*W/2,Y0+1.3,z,s*Math.PI/2,.9,1.2,'vWood',wood);
 for(const x of[-3.6,3.6])dnGodLamp(x,Y0+3.2,D/2,0);
 // the reading porch: a bench under a shingle skirt along the front, tablets stacked at its end
 vnVeranda(0,0,D/2+2.0,W-4,2.6,0,Y0,2.5,wood);vnShedRoof(0,Y0+2.5,D/2+2.0,W-4,2.6,.5,0,'vShingleB',sh,.4,.22);
 for(let k=0;k<6;k++)vB('vStone',-W/2+5.5+k*.35,Y0,D/2+.9,.3,rr(.5,.9),.7,0,st.clone().multiplyScalar(.9));
 // the stele court: four steles with the reformed word, a checker path
 for(const x of[-6,-2,2,6])dnStele(x,0,D/2+6.4,0,2.6,st,x<0);dnChecker(0,.03,D/2+4.6,W-6,1.4,0);
 dnGodPost(-W/2-1.6,0,D/2+3,3.6);dnGodPost(W/2+1.6,0,D/2+3,3.6);
 dnPriest(-4,0,D/2+5.2,Math.PI);dnFolk(3,D/2+5.4,4,1.6);}
// ---------------------------------------------------------------- TRAVELLERS' INN: an earth-walled court with lizard stalls, a stacked lodge at the back, the fire
function buildDalabInn(G,o){reseed(8851+(o.v|0));const CW=27,CD=24;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),st=dCol(DPAL.stone);
 vnReg("Travellers' inn",0,0,16,10);vnReg('Inn wall',0,0,16.5,2.8,{part:'wall',type:['market/shop']});
 dnEarthWall(0,0,0,CW,CD,0,2.6,4.2,{c:earth,t:.9});
 // the lodge along the back: two storeys, a gallery, a long thatch
 {const W=16,D=7,H1=2.8,H2=2.4,lz=-CD/2+D/2+1.2;kput('dEarthBat',[0,0,lz],null,[W,H1,D],earth);vB('dEarth',0,H1-.1,lz,W-.2,H2,D-.2,0,earth.clone().multiplyScalar(1.04));
  vB('dEarth',0,H1-.1,lz+D/2-.05,W,.3,.16,0,dCol(DPAL.turq));vnDoor(0,0,lz+D/2,0,1.6,2.2,'vWood',wood,vC(0x5a4a3a),false);
  for(const x of[-5,5]){vnWin(x,1.3,lz+D/2,0,.9,.8,'open','vWood',wood,true);dnHearth(x,1.3,lz+D/2,0,.9,.8);}
  const GY=H1-.1;vB('vWood',0,GY,lz+D/2+1.0,W,.18,2.0,0,wood);for(const x of[-W/2+.3,-W/4,0,W/4,W/2-.3])vPst('vPost',x,0,lz+D/2+1.9,.11,GY,wood);
  vB('vWood',0,GY+1.0,lz+D/2+1.95,W,.08,.08,0,wood);vnStairs(-W/2-.9,0,lz+D/2+1.0,-Math.PI/2,1.0,GY,9,'vWood',wood);
  for(const x of[-5,-1.7,1.7,5])vnDoor(x,GY,lz+D/2-.1,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
  vnHipRoof('vHipT',0,H1+H2-.1,lz,W-.2,D-.2,2.8,0,dCol(DPAL.thatch),1.1);vB('vWood',0,H1+H2-.25,lz,W+.4,.22,D+.4,0,wood);vnChimney(4,H1+H2+2.2,lz-1.5,1.0,.1,true);
  dnBanner(-W/2-.6,H1+H2+.4,lz+D/2-.3,Math.PI/2,.8,2.0,dCol(DPAL.red));}
 // the stalls: a lean-to along the +x wall, lizards tethered in them
 {const sx=CW/2-2.6;for(let k=0;k<4;k++){const z=-CD/2+5+k*3.6;vPst('vPost',sx-2.4,0,z,.11,2.2,wood);vB('vWood',sx-1.2,0,z+1.8,2.6,1.1,.12,0,wood);
   if(k<3)dnAnimal('lizard',sx-1.2,0,z,rr(-.4,.4)-Math.PI/2,rr(1.1,1.5),{c:dCol([0x8a4a2a,0x6a5a2a,0x4f4f36])});}
  vnShedRoof(sx-1.2,2.3,-CD/2+9.6,3.2,14.4,.7,Math.PI/2,'vShingleB',dCol(DPAL.shingle),.3,.2);vB('vWood',sx-2.4,2.2,-CD/2+9.6,.16,.16,14.4,0,wood);
  vB('vStone',sx-1.2,0,CD/2-4.6,2.4,.5,1.2,0,st);vB('vDarkB',sx-1.2,.42,CD/2-4.6,2.0,.1,.9,0,vC(0x2a4a48));}   // the trough
 // the yard: a fire, benches, crates and sacks unloaded, the well, folk and a priest passing through
 dnFirePit(-4,0,2,.8);for(let k=0;k<3;k++)vB('vWood',-4+Math.cos(k*2.1)*2.2,.35,2+Math.sin(k*2.1)*2.2,1.6,.1,.35,k*2.1,wood);
 vnCrate(-CW/2+3,0,4,1.0,.3,wood);vnCrate(-CW/2+3.4,0,5.4,.8,.1,wood);vnSacks(-CW/2+4.5,0,7,4);vnBarrel(-CW/2+2.6,0,7.5,.4,1.0,wood);
 dnDrum('dStoneDrum',5,0,5,1.0,.9,st);dnDrum('vDarkB',5,.85,5,.8,.1,null);dnJar(6.4,0,4.2,.3);
 vnPaving(0,.02,CD/2+2.2,6,3,0,dCol(DPAL.earthDark),6);dnGodPost(-3.2,0,CD/2+1.0,3.4);dnGodPost(3.2,0,CD/2+1.0,3.4);
 dnFolk(0,CD/2+3.6,3,1.6);dnFolk(-1,4,4,2.2);}
// ---------------------------------------------------------------- EARTH YARD: where the walls come from — block stacks, the mixing pit, drying racks, a ramming shed
function buildDalabEarthyard(G,o){reseed(8861+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),eD=dCol(DPAL.earthDark);
 vnReg('Earth yard',0,0,10,5);
 vnFence(0,0,0,18,13,0,wood,3.5,1.1);
 // the shed: an open post shed with a thatch hip over the ramming frames
 {const W=8,D=5,H=2.8,sx=-4.5,sz=-3;for(const c of[[-1,-1],[1,-1],[1,1],[-1,1]])vPst('vPostB',sx+c[0]*W/2,0,sz+c[1]*D/2,.14,H,wood);
  vnHipRoof('vHipT',sx,H,sz,W,D,2.0,0,dCol(DPAL.thatch),.9);
  for(let k=0;k<2;k++){const fx=sx-2+k*4;vB('vWood',fx,0,sz,1.4,1.2,.9,0,wood);vB('dEarth',fx,.1,sz,1.1,.9,.6,0,earth);for(const s of[-1,1])vPst('vPost',fx+s*.75,0,sz,.06,2.0,wood);}   // the ramming forms
  dnFolk(sx,sz+1.8,2,1.0);}
 // the block stacks: rammed blocks drying in rows, some under tarps
 for(let r=0;r<3;r++)for(let k=0;k<5;k++){const x=1.5+k*1.3,z=-4.5+r*1.6;const n=2+Math.floor(rng()*3);for(let j=0;j<n;j++)vB('dEarth',x+rr(-.05,.05),j*.42,z,1.1,.4,.55,rr(-.06,.06),j%2?earth:eD);}
 kput('vTarpB',[4.1,1.35,-4.5],vQ(0,0,.06),[6.6,.05,1.4],vC(0xa09070));
 // the mixing pit: a dark wet disc kerbed with stones, a pile of straw, water jars, a treading figure
 dnDrum('dEarthDrum',-4,-.02,4,2.6,.3,eD);vB('vDarkB',-4,.26,4,3.6,.08,3.6,0,vC(0x4a3a2a));for(let k=0;k<9;k++){const a=k/9*TAU;kput('vRock',[-4+Math.cos(a)*2.7,.15,4+Math.sin(a)*2.7],qEuler(rng(),rng(),0),[.5,.3,.5],vC(0x6a625a));}
 kput('vThatchB',[0,0,5],null,[2.2,1.3,2.2],vC(0xc8b060));dnJar(2.0,0,3.8,.34);dnJar(2.7,0,4.6,.3);dnJar(3.5,0,3.9,.3);
 vnDryingRack(5.5,0,3,Math.PI/2,5);dnWoodpile(7.6,0,0,Math.PI/2,1.6);vnCrate(-7.5,0,-.5,.9,.2,wood);
 vnPaving(0,.02,8.2,4,2.4,0,eD,4);dnFolk(-3.5,4,1,.4);dnFolk(0,8.4,2,1.2);}
// ---------------------------------------------------------------- ORCHARD PLOT: a fenced plot of manzanita and skirt palm in rows, a keeper's lean-to, a cistern
function buildDalabOrchard(G,o){reseed(8871+(o.v|0));const wood=dCol(DPAL.woodGrey),st=dCol(DPAL.stone);
 vnReg('Orchard plot',0,0,11,4);
 vnFence(0,0,0,20,18,0,wood,3.0,1.0);
 for(let r=0;r<3;r++)for(let k=0;k<3;k++){const x=-6+k*6,z=-5.5+r*5.5;if(r===1&&k===1)continue;dnTree(rng()<.7?'manzanita':'skirtpalm',x+rr(-.6,.6),0,z+rr(-.6,.6),{scale:rr(.55,.8)});}
 for(let k=0;k<7;k++)dnPlant(dPick(['agave','shrub','grass']),rr(-8,8),0,rr(-7.5,7.5),{});
 // the cistern in the middle, a keeper's lean-to at the gate, ladders and baskets
 dnDrum('dStoneDrum',0,0,0,1.4,.8,st);dnDrum('vDarkB',0,.75,0,1.15,.1,null);dnJar(1.9,0,.4,.3);
 for(const z of[-1.2,1.2])vPst('vPost',7.5,0,z,.08,2.0,wood);kput('vTarpB',[6.6,1.9,0],vQ(0,0,.3),[2.4,.05,3.0],vC(0xb0a080));vnSacks(6.4,0,.4,2);
 kput('vPost',[-2.4,.1,-5.6],qEuler(0,0,.35),[.07,3.2,.07],wood);kput('vPost',[-1.9,.1,-5.6],qEuler(0,0,.35),[.07,3.2,.07],wood);   // a ladder against a tree
 vnPaving(0,.02,10.4,3,2,0,dCol(DPAL.earthDark),3);dnFolk(2,-3,2,1.4);dnFolk(0,10.6,1,.6);}
// ---------------------------------------------------------------- WATCH TOWER: a tall battered earth tower with a timber lookout under a thatch cap; a giant at its foot
function buildDalabWatchtower(G,o){reseed(8881+(o.v|0));const R=2.6,H=11;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),st=dCol(DPAL.stone);
 vnReg('Watch tower',0,0,5,H+5);
 dnDrum('dStoneDrum',0,-.05,0,R+1.0,.6,st);kput('dEarthDrum',[0,.5,0],null,[R,H,R],earth);kput('dEarthDrum',[0,.5,0],null,[R+.12,1.2,R+.12],dCol(DPAL.earthDark));
 dnPaintRing(0,.5+H-1.6,0,R+.04,.5,dCol(DPAL.red));dnMuralRing(0,.5+H*.55,0,R+.04,.8,st,3);
 // the lookout: a timber deck wider than the drum on brackets, a rail, the thatch cap on posts, a bell of Ancient plate
 const DY=.5+H;vB('vWood',0,DY,0,R*2+2.6,.25,R*2+2.6,0,wood);vB('vWood',0,DY,0,R*2+2.6,.25,R*2+2.6,Math.PI/4,wood);
 for(let k=0;k<8;k++){const a=k/8*TAU;const p=dnOnRing(0,0,R+.9,a);kput('vPost',[p[0],DY-1.4,p[1]],qEuler(0,-a,.6),[.1,1.9,.1],wood);vPst('vPost',p[0],DY+.25,p[1],.09,1.0,wood);vPst('vPostB',p[0]*.85,DY+.25,p[1]*.85,.12,2.6,wood);}
 kput('dRopeRing',[0,DY+1.2,0],qEuler(Math.PI/2,0,0),[R+.95,R+.95,1],wood);
 kput('dConeT',[0,DY+2.7,0],null,[R+1.8,2.6,R+1.8],dCol(DPAL.thatch));vBall('dGiltBall',0,DY+5.3,0,.2);
 kput('vPlate',[0,DY+1.6,-R-.2],vQ(0,0,0),[.7,.9,1],null);
 // the door and the ladder-stair spiralling the drum; a brazier on the deck
 vnDoor(0,.5,R-.02,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
 for(let k=0;k<22;k++){const t=k/22;const a=Math.PI*.5+t*Math.PI*1.4;const p=dnOnRing(0,0,R+.45,a);vB('vWood',p[0],.5+.6+t*(H-1.6),p[1],.9,.08,.4,a,wood);}
 dnFirePit(0,DY+.25,0,.35);dnFolk(0,0,1,.1,DY+.25);
 dnGiant(2.6,0,R+2.4,-.3,2,{spear:true});dnGodPost(-2.4,0,R+2.2,3.4);
 vnPaving(0,.02,R+2.5,5,2.5,0,st,5);dnFolk(-1,R+4.5,2,1.2);}

dDef({key:'dalab_rowhouse',name:'Terrace row',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:20,d:14,h:7,build:buildDalabRowhouse});
dDef({key:'dalab_tenement',name:'Stacked house',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:16,d:14,h:10,build:buildDalabTenement});
dDef({key:'dalab_well',name:'Well court',family:'infrastructure',tags:{type:['infrastructure'],wealth:'peasant',lit:false},w:10,d:10,h:5,build:buildDalabWell});
dDef({key:'dalab_bathhouse',name:'Bath house',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true},w:25,d:23,h:8,build:buildDalabBathhouse});
dDef({key:'dalab_scribes',name:"Scribes' hall",family:'civic',tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'scribes'},w:24,d:20,h:9,build:buildDalabScribes});
dDef({key:'dalab_inn',name:"Travellers' inn",family:'trade',tags:{type:['market/shop','multi-family dwelling'],wealth:'middle',lit:false},w:32,d:30,h:10,build:buildDalabInn});
dDef({key:'dalab_earthyard',name:'Earth yard',family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:15,h:5,build:buildDalabEarthyard});
dDef({key:'dalab_orchard',name:'Orchard plot',family:'farm',tags:{type:['farm'],wealth:'peasant',lit:false},w:22,d:22,h:5,build:buildDalabOrchard});
dDef({key:'dalab_watchtower',name:'Watch tower',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:false},w:12,d:12,h:17,build:buildDalabWatchtower});
