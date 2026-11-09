// ================================================================= NORTHERN HIGHLANDS — station 5, the bog country: its plants and its passes
// [G data] The mire's own plants and how the kit's species stand in it (PLAN-STATIONS.md station 5): the kit's registry is open (50 to 70), so the
// items here are the kit's, defined for this station's page only (station 1 and the kit's readers never see them). Three library cards the
// library already held: cotton-grass (card.cottongrass), cloudberry (card.cloudberry) and the corn lily (card.cornlily, owed to this kit's turn:
// the fen's margins are its wet meadow); each has a painted stand-in for a page without the pack.
// The forest (NHL.STATION_PASSES) is the kit's own species in their wet, cold habits: spruce, fir, larch and birch close on the mineral knolls,
// thinning through the lagg into the open mire, where only stunted spruce, tamarack-like larch and dwarf birch stand on the hummocks and the great
// trumpets stand alone holding their water. The field `bog` (45-host-stage.js) is 1 on the open mire, 0 on the knolls.
// The floor (NHL.STATION_PLANT): sphagnum hummocks (the moss cushion and mat in sphagnum's reds, ochres and greens), cotton-grass lawns, cloudberry,
// heath and lichen on the hummocks' tops, sedge, corn lilies in the lagg; the kit's montane and boreal floors on the knolls.
(function(){
const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
const bogOf=(x,z)=>BIO.field('bog',x,z);
// ---------------------------------------------------------------- the cards (painted stand-ins; the pack's library maps replace them: BIO.libSwap)
const TXB={
 cotton:BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<9;i++){const x=S*(.3+.4*rng()),top=S*(.12+.2*rng());g.strokeStyle='#8a9a5a';g.lineWidth=S*.012;g.beginPath();g.moveTo(S/2,S);g.quadraticCurveTo(x,S*.6,x,top+S*.05);g.stroke();
  g.fillStyle='#f4f2ea';for(let k=0;k<14;k++){g.beginPath();g.arc(x+(rng()-.5)*S*.07,top+(rng()-.5)*S*.06,S*(.012+.012*rng()),0,TAU);g.fill();}}},[220,220,210]),
 cloud:BIO.alphaTex(256,(g,S)=>{g.fillStyle='#3e6a2c';for(let i=0;i<5;i++){const a=i/5*TAU,x=S/2+Math.cos(a)*S*.2,y=S*.62+Math.sin(a)*S*.14;g.beginPath();g.ellipse(x,y,S*.14,S*.1,a,0,TAU);g.fill();}
  g.fillStyle='#e8902a';g.beginPath();g.arc(S/2,S*.4,S*.07,0,TAU);g.fill();},[170,180,150]),
 corn:BIO.alphaTex(256,(g,S)=>{g.fillStyle='#6e9a44';for(let i=0;i<7;i++){const y=S*(.95-i*.11),w=S*(.28-i*.03);g.beginPath();g.ellipse(S/2+(i%2?w*.3:-w*.3),y,w,S*.07,(i%2?.4:-.4),0,TAU);g.fill();}
  g.fillStyle='#d8dcb4';for(let k=0;k<30;k++){g.beginPath();g.arc(S/2+(rng()-.5)*S*.16,S*(.08+.16*rng()),S*.012,0,TAU);g.fill();}},[180,190,160])};
const MB={
 cotton:BIO.leafMat(TXB.cotton,'nh-cotton',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 cloudberry:BIO.leafMat(TXB.cloud,'nh-cloudberry',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.04,alphaTest:.4}),
 cornlily:BIO.leafMat(TXB.corn,'nh-cornlily',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 /* the library's fen sedge and dwarf birch (card.sedge.fen, card.dwarfbirch: in the library since 2026-10-26); without the pack, the cotton's and cloudberry's stand-ins */
 sedge:BIO.leafMat(TXB.cotton,'nh-sedge',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 dwarfbirch:BIO.leafMat(TXB.cloud,'nh-dwarfbirch',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.05,alphaTest:.4})};
Object.assign(NHL.LIB||{},BIO.libSwap('nhighlands',MB));   /* materials.json families cotton, cloudberry, cornlily, sedge, dwarfbirch (the pack carries them on this station's page only) */
const G=NHL.G||{};const tuftG=G.tuft?G.tuft():BIO.geo.cross?BIO.geo.cross():null;
BIO.def('cotton',tuftG,MB.cotton,{label:'Cotton-grass'});
BIO.def('cloudberry',tuftG,MB.cloudberry,{label:'Cloudberry'});
BIO.def('cornlily',tuftG,MB.cornlily,{label:'Corn lily'});
BIO.def('sedge',tuftG,MB.sedge,{label:'Fen sedge'});
BIO.def('dwarfbirch',tuftG,MB.dwarfbirch,{label:'Dwarf birch'});
const TG=NHL.TG,HVf=NHL.HV;
NHL.PLANTS.push(
 {label:'Cotton-grass',name:'Cotton-grass (the mire\'s white heads)',tags:TG?TG('boreal','humid','yes',HVf('none',[],false,'the down was spun and stuffed into pillows and wicks')):{climate:'boreal',aridity:'humid',abyssal:false,riparian:'yes',harvest:{wood:'none',edible:[],medicinal:false,fruit:null,notes:'down for wicks and stuffing'}}},
 {label:'Cloudberry',name:'Cloudberry',tags:TG?TG('boreal','humid','yes',HVf('none',['cloudberries (amber, late summer)'],false,'')):{climate:'boreal',aridity:'humid',abyssal:false,riparian:'yes',harvest:{wood:'none',edible:['cloudberries'],medicinal:false,fruit:null,notes:''}}},
 {label:'Corn lily',name:'Corn lily (false hellebore: poisonous)',tags:TG?TG('boreal','humid','yes',HVf('none',[],true,'every part is poisonous; a herder\'s bane, a physician\'s drop')):{climate:'boreal',aridity:'humid',abyssal:false,riparian:'yes',harvest:{wood:'none',edible:[],medicinal:true,fruit:null,notes:'poisonous'}}});
// the sphagnum's colours: red, ochre, green (the hummock tops red, the lawns green)
NHL.FRUIT_NOT_DRAWN_MORE=['Cloudberry'];   /* the berries are on the card; no catalog cloudberry yet (KNOWN_ISSUES.md) */
const SPH={red:[0x7a3e2c,0x86482f,0x6e3a2a],ochre:[0xa08040,0xb09048,0x8a7038],green:[0x6a8a3a,0x7a9a40,0x5a7a34]};
const col=(set,k)=>{const c=C(pick(set));c.offsetHSL((rng()-.5)*.02,(rng()-.5)*.06,(rng()-.5)*.05);return c.multiplyScalar(k==null?1:k);};
// ---------------------------------------------------------------- the forest: the kit's species in the mire (PLAN-STATIONS.md station 5)
NHL.STATION_PASSES=function(P){const {pass,o,BIG,SMALL}=P;
 const dwarf=(k,kr,mx)=>(T)=>{const H0=T.H;T.H=Math.min(T.H*k,mx==null?6:mx);const f=T.H/H0;T.rb*=Math.max(.3,f*.9);T.crownR*=kr==null?f*1.3:kr;};   /* stunted: a share of its height, never over mx m */
 const B=(x,z)=>bogOf(x,z);
 // the mineral knolls and the bench's NW lip: a closed montane-boreal wood (spruce and fir, larch, birch in groves), thinning into the lagg
 pass('normanspruce',30,(Z,x,z)=>(1-smooth(.15,.45,B(x,z)))*(Z.montane*.55+Z.boreal*.35),o(BIG,{pad:2.5,patch:.4}));
 pass('spirespruce',26,(Z,x,z)=>(1-smooth(.2,.5,B(x,z)))*Z.boreal*.6,o(BIG,{pad:1.8,patch:.4}));
 pass('silverfir',48,(Z,x,z)=>(1-smooth(.1,.35,B(x,z)))*Z.montane*.35,o(BIG,{pad:3.5,patch:.4}));
 pass('larch',40,(Z,x,z)=>(1-smooth(.3,.7,B(x,z)))*.3,o(BIG,{pad:2.5,patch:.6,patchScale:.006}));
 pass('birch',26,(Z,x,z)=>{const b=B(x,z);return (1-smooth(.2,.55,b))*Z.grove*.5+smooth(.2,.45,b)*(1-smooth(.5,.75,b))*.3;},o(BIG,{pad:1.5,patch:.25}));
 pass('rowan',60,(Z,x,z)=>(1-smooth(.15,.4,B(x,z)))*.08,o(SMALL,{pad:2,patch:.5}));
 // the stream's levees
 pass('greyalder',24,(Z,x,z)=>Z.rip*.45*(1-smooth(.45,.7,B(x,z))),o(BIG,{pad:2.5,patch:.35}));
 pass('brookwillow',16,(Z,x,z)=>Z.rip*.5*(1-smooth(.6,.8,B(x,z))),o(SMALL,{pad:1.6,patch:.4}));
 // the open mire: stunted trees on the hummocks (a bog spruce a few metres tall, a larch like a tamarack, dwarf birch knee-high), scattered
 pass('spirespruce',30,(Z,x,z)=>smooth(.5,.75,B(x,z))*.16,o(SMALL,{far:true,pad:1.6,patch:.5,patchScale:.02,mod:dwarf(rr(.12,.22),.25,6.5)}));
 pass('larch',44,(Z,x,z)=>smooth(.45,.7,B(x,z))*.12,o(SMALL,{far:true,pad:1.8,patch:.5,patchScale:.02,mod:dwarf(rr(.15,.28),.3,7.5)}));
 /* (the knee-high dwarf birch is a floor plant on the hummocks now, the library's card: the kit's birch scaled to 1.4 m read as poles) */
 pass('windspruce',40,(Z,x,z)=>smooth(.7,.95,B(x,z))*.06,o(SMALL,{pad:1.2,patch:.4,mod:dwarf(.6,.6,5)}));
 // the great trumpets alone in the fen, holding their water (the kit's own), and their glow over the pools at night
 pass('greattrumpet',240,(Z,x,z)=>smooth(.45,.7,B(x,z))*.35,o(BIG,{hero:420,mid:820,pad:9,own:6,patch:0}));};
// ---------------------------------------------------------------- the floor
// one spot of the kit's floor grid (5.6 m near, 13 m mid, 30 m far): the mire's plants by its bog field, the kit's own floors on the mineral ground
NHL.STATION_PLANT=function(x,y,z,Z,lv,st,F){const b=bogOf(x,z),t=rng();st.bog=st.bog||{hummock:0,cotton:0,cloud:0,corn:0,sedge:0};const S=st.bog;
 const hummock=(R)=>{R*=.6;const set=rng()<.3?SPH.red:rng()<.35?SPH.ochre:SPH.green;BIO.put('cushion',[x,y+R*.05,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.22,.34),R],col(set,set===SPH.red?.8:.95));S.hummock++;   /* low and soft: at full size the cushion read as a red boulder */
  if(lv===2&&rng()<.5)BIO.put('mossmat',[x+rr(-.6,.6),y+.05,z+rr(-.6,.6)],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R*1.6,1,R*1.6],col(SPH.green,.95));
  if(rng()<.35)F.heath(x,y+R*.4,z,lv);else if(rng()<.25)F.lichen(x,y+R*.4,z,lv);else if(rng()<.3)dwarf();};
 const cotton=(n)=>{for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.6),h=rr(.35,.6);F.tuft('cotton',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.8,col([0xe8e6dc,0xf0eee6,0xdcd8c8]));}S.cotton++;};
 const cloud=(n)=>{for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.2),h=rr(.14,.24);F.tuft('cloudberry',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*1.6,col([0x5a7a34,0x6a8a3a]));}S.cloud++;};
 const corn=()=>{const h=rr(1.1,1.9);F.tuft('cornlily',x,y,z,h,h*.55,col([0x7aa048,0x88a850,0x6e9440]));S.corn++;};
 const sedge=(k)=>{const h=rr(.45,.8)*(k||1);F.tuft('sedge',x,y,z,h,h*1.2,col([0x9a9a5a,0xa8a060,0x8a8a50]));S.sedge++;};
 const dwarf=()=>{const h=rr(.35,.7);F.tuft('dwarfbirch',x,y+.1,z,h,h*1.5,col([0x6a8a3a,0x7a8a3e,0x8a7a3a]));S.dwarf=(S.dwarf||0)+1;};
 if(lv===0){   // the far floor: what reads from a kilometre (the hummocks' colour, the cotton-grass's white)
  if(b>.5){if(t<.35)hummock(rr(.9,1.6));else if(t<.6)cotton(2);}else F.plantFar(x,y,z,Z,st);return true;}
 if(b>.62){   // the open mire: hummocks and lawns
  if(t<.3)hummock(rr(.5,1.4));else if(t<.55)cotton(lv===2?ri(3,8):2);else if(t<.68)cloud(lv===2?ri(2,5):1);else if(t<.84)sedge(.8);else if(t<.92){F.heath(x,y,z,lv);st.heath++;}else{F.lichen(x,y,z,lv);st.lichen++;}
  return true;}
 if(b>.3){   // the lagg and the fen's margins: sedge, corn lilies, cotton-grass, the kit's wet bank plants
  if(t<.26)sedge(1.1);else if(t<.42)corn();else if(t<.56)cotton(lv===2?ri(2,5):1);else if(t<.66)hummock(rr(.4,.9));else if(t<.76){F.ladyFern(x,y,z,lv);st.ferns++;}else F.plantBank(x,y,z,Z,lv,st);
  return true;}
 // the mineral knolls: the kit's own montane and boreal floors
 (Z.boreal>.5?F.plantBoreal:F.plantMontane)(x,y,z,Z,lv,st);return true;};
})();
