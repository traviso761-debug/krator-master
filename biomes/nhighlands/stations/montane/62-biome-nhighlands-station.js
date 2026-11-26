// ================================================================= NORTHERN HIGHLANDS — station 2, the dry-summer montane: its passes and its floor
// [G data] The kit's registry is open (50 to 70). The trees are the kit's own, the four written for this station at the end of NHL.SPECIES (copper pine,
// ember giant, white fir, black oak: nsemiarid's station `high` takes kin of them, its PLAN-STATIONS.md), with the kit's montane species thinned in and its
// trumpets thinned to the draws (the wet forest's reach). The floor: golden bunchgrass in the open park, corn lilies and green sedge in the meadows,
// fireweed in the old burns, heath and lichen on the sandstone. The fields come from the station's SITE (44z): `meadow`, `draw`, `fire`, `open`, `dome`.
(function(){
const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
const fld=n=>(x,z)=>BIO.field(n,x,z),MEAD=fld('meadow'),DRAW=fld('draw'),FIRE=fld('fire'),OPEN=fld('open'),DOME=fld('dome');
// the corn lily (card.cornlily, the library's; the bogs' stand-in where no pack is on the page): its own item on this page. Stations 3 and 4 (base
// `montane`) replace this file with their own of the same name
{const tx=BIO.alphaTex(256,(g,S)=>{g.fillStyle='#6e9a44';for(let i=0;i<7;i++){const y=S*(.95-i*.11),w=S*(.28-i*.03);g.beginPath();g.ellipse(S/2+(i%2?w*.3:-w*.3),y,w,S*.07,(i%2?.4:-.4),0,TAU);g.fill();}},[180,190,160]);
 const M={cornlily:BIO.leafMat(tx,'nh-cornlily',{ground:NHL.FLOOR_GROUND,swayW:'(position.y)',swayA:.06,alphaTest:.4})};Object.assign(NHL.LIB||{},BIO.libSwap('nhighlands',M));
 BIO.def('cornlily',NHL.G.tuft(),M.cornlily,{label:'Corn lily'});}
if(!NHL.PLANTS.some(p=>p.label==='Corn lily'))NHL.PLANTS.push({label:'Corn lily',name:'Corn lily (false hellebore: poisonous)',tags:NHL.TG('temperate','subhumid','yes',NHL.HV('none',[],true,'every part is poisonous; a herder\'s bane, a physician\'s drop'))});
const col=(set,k)=>{const c=C(pick(set));c.offsetHSL((rng()-.5)*.02,(rng()-.5)*.06,(rng()-.5)*.05);return c.multiplyScalar(k==null?1:k);};
const GOLD=[0xb8a050,0xc8ae5a,0xa8904a,0xd0b868],GREEN=[0x6a8a3a,0x7a9a40,0x5e7e34];
// ---------------------------------------------------------------- the forest
NHL.STATION_PASSES=function(P){const {pass,o,BIG,SMALL}=P,bare=(x,z)=>1-smooth(.25,.6,DOME(x,z)),noMead=(x,z)=>1-smooth(.2,.5,MEAD(x,z));
 // the red giants first: they claim the moist draws (a few to a draw, as the groves of the Sierra's west slope)
 pass('embergiant',90,(Z,x,z)=>DRAW(x,z)*.55*bare(x,z)*noMead(x,z),o(BIG,{hero:420,mid:820,pad:9,own:8,patch:.25}));
 // the open park: copper pines on the sunny slopes, white fir on the shaded ones and higher, wide apart (fire keeps the floor open)
 pass('copperpine',46,(Z,x,z)=>(.25+.45*OPEN(x,z))*bare(x,z)*noMead(x,z)*(1-FIRE(x,z)*.7)*(1-DRAW(x,z)*.4),o(BIG,{pad:6,own:5,patch:.35}));
 pass('whitefir',38,(Z,x,z)=>(.15+.4*(1-OPEN(x,z))+.3*Z.montane*smooth(.5,.58,Z.cold))*bare(x,z)*noMead(x,z)*(1-FIRE(x,z)*.8),o(BIG,{pad:3.5,patch:.4}));
 pass('silverfir',60,(Z,x,z)=>DRAW(x,z)*.25*bare(x,z)*noMead(x,z),o(BIG,{pad:3.5,patch:.4}));
 // black oaks low on the warm slopes and at the meadows' edges
 pass('blackoak',52,(Z,x,z)=>(smooth(.5,.4,Z.cold)*.4+.25*MEAD(x,z)*(1-smooth(.4,.7,MEAD(x,z))))*bare(x,z)*(1-DRAW(x,z)*.5),o(BIG,{pad:4,own:3,patch:.4}));
 // the old burns: snags standing in fireweed, and the wet forest's trumpets thinned into the draws
 pass('burnsnag',34,(Z,x,z)=>FIRE(x,z)*.45*bare(x,z)*noMead(x,z),o(BIG,{pad:1.5,patch:.2}));
 pass('greattrumpet',260,(Z,x,z)=>DRAW(x,z)*.12*bare(x,z)*noMead(x,z),o(BIG,{hero:420,mid:820,pad:9,own:6,patch:0}));
 // the creek: alder and willow; rowan at the wood's edge
 pass('greyalder',26,(Z,x,z)=>Z.rip*.5*noMead(x,z),o(BIG,{pad:2.5,patch:.35}));
 pass('brookwillow',18,(Z,x,z)=>Z.rip*.4*noMead(x,z),o(SMALL,{pad:1.6,patch:.4}));
 pass('rowan',70,(Z,x,z)=>.04*bare(x,z)*noMead(x,z),o(SMALL,{pad:2,patch:.5}));
 // the sandstone domes' cracks: a few crag pines
 pass('cragpine',40,(Z,x,z)=>smooth(.35,.7,DOME(x,z))*.25,o(BIG,{pad:2,patch:.4,mod:(T)=>{T.lean=rr(0,TAU);}}));};
// ---------------------------------------------------------------- the floor
NHL.STATION_LOGS=(x,z)=>.35*(1-smooth(.2,.5,MEAD(x,z)))*(1-smooth(.3,.6,DOME(x,z)))+.5*DRAW(x,z);   /* an open park drops fewer: most in the draws */
NHL.STATION_PLANT=function(x,y,z,Z,lv,st,F){const t=rng(),m=MEAD(x,z),fi=FIRE(x,z),dm=DOME(x,z);st.mont=st.mont||{bunch:0,corn:0,fire:0};const S=st.mont;
 const bunch=(k)=>{F.grass(x,y,z,lv,GOLD,(k||1)*1.15);S.bunch++;};
 if(lv===0){if(m>.4){if(t<.4){F.grass(x,y,z,0,GREEN,1.1);}}else if(dm<.4&&t<.5)bunch(1.2);return true;}
 if(dm>.45){if(t<.3){F.lichen(x,y,z,lv);st.lichen++;}else if(t<.45){F.heath(x,y,z,lv);st.heath++;}else if(t<.55)F.boulder(x,y,z,lv,st,false,.2);return true;}
 if(m>.4){   // the meadow: corn lilies, green sedge and grass, a few bluebells
  if(t<.3){const h=rr(1,1.8);F.tuft('cornlily',x,y,z,h,h*.55,col([0x7aa048,0x88a850,0x6e9440]));S.corn++;}else if(t<.7)F.grass(x,y,z,lv,GREEN,1.2);else if(t<.82)F.bluebells(x,y,z,lv,lv===2?ri(4,10):2);else F.sorrel(x,y,z,lv);return true;}
 if(fi>.4){   // an old burn: fireweed through golden grass
  if(t<.45){const n=lv===2?ri(3,7):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.4),h=rr(.9,1.5);F.tuft('spike',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.7,col([0xb04a8a,0xc0569a,0xa04080],1.1));}S.fire++;}
  else bunch(1);return true;}
 // the open park: bunchgrass over needle litter, a few shrubs, bracken in the shade, boulders
 if(t<.55)bunch(1);else if(t<.65){F.shrub(x,y,z,lv);st.shrubs++;}else if(t<.72){F.heath(x,y,z,lv);st.heath++;}else if(t<.78&&Z.wet>.5){F.bracken(x,y,z,lv);st.bracken++;}else if(t<.82)F.boulder(x,y,z,lv,st,false,.2);
 return true;};
})();
