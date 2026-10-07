// ================================================================= THE THRONE — floor
// Everything under the trees, by zone, by the age of the ground's last flow, and by the plume (THRONE.zones):
//   FRESH     bare black lava; lichen (Earth's, everywhere) and, under the plume, the mat; spatter stones
//   YOUNG     the shoulder: lava ferns and grass in the cracks, lichen, ash broom; the plume: ash creepers riding the
//             ash, soot cups, the mat, stalk daisies
//   MATURE / OLD   the shoulder: grass and straw, broom, ferns; the plume: creepers, plume-bushes, soot cups, daisies
//   CINDER    a cone's loose scoria: straw tufts and lichen on the shoulder's side, soot cups and creepers under the plume
//   GULLY     ferns, scale cones, grass and moss
//   VENT      brain caps, vent coral, the mat, sulphur-crusted stones
//   MARSH     sulphur rosettes in the acid water's edge, vent coral and brain caps
//   SKY       the skylights: ferns, scale cones
// Three LOD bands along the spine at 6.5 / 13 / 30 m cells; then the lantern brackets on the dark walls (flow fronts,
// crater walls, the skylights), and the spatter and boulders round the cones and the fissure.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=THRONE.PAL,zones=THRONE.zones,blocked=THRONE.blocked,C=THRONE.C;
const {bright,shade,vary,tint,means,leafCol}=THRONE;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.lava),.02,.06,.06),means().rock,k==null?rr(.45,.7):k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};
const LC=k=>THRONE.LIB.cardsOf(k),hasLib=k=>LC(k).length>0;
// a library CARD PLANT: crossed cards from one of a sheet's cells, standing on its foot, h tall (no colour: the card's own)
function cardPlant(key,x,y,z,h,w){const L=LC(key);if(!L.length)return false;BIO.put(pick(L),[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h,h,w||h],null);return true;}
function clumpPlant(item,x,y,z,R){BIO.put(item,[x,y+R*.45,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R*1.4,R*.9,R*1.4],null,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){BIO.put(item,[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
function flat(item,x,y,z,R,col){BIO.put(item,[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],col);}
// Earth's hardies
function lichen(x,y,z,k){flat('lichen',x,y,z,rr(.3,.9)*(k||1),leafCol(PAL.lichen,1.05,.02));}
function grass(x,y,z,lv,set,k){const h=rr(.3,.7)*(k||1)*(lv===0?1.6:1);around(x,z,lv===2?ri(3,6):lv===1?2:1,.4,1.6,(px,pz)=>tuft('grass',px,y,pz,h*rr(.8,1.15),h*1.5,leafCol(set||PAL.grass,1.25,.04,.12,.06)));}
function bunch(x,y,z,lv,set){const h=rr(.35,.85)*(lv===0?1.6:1);around(x,z,lv===2?ri(2,4):1,.4,1.4,(px,pz)=>tuft('bunch',px,y,pz,h*rr(.8,1.1),h*1.2,leafCol(set||PAL.straw,1.25,.03)));}
function fern(x,y,z,lv){const n=lv===2?ri(5,8):3,L=rr(.5,1.1),c=C(pick(PAL.fern));
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3),pitch=rr(.15,.55);BIO.put('fern',[x,y+.05,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*.8,L*rr(.9,1.2)],bright(vary(c,.02,.06,.06),1.3),{n:[Math.cos(a)*.3,1,Math.sin(a)*.3]});}}
function broom(x,y,z,lv){const Rs=rr(.6,1.1);if(THRONE.LIB.broom){card('broom',x,y+Rs*.5,z,Rs*1.5,Rs*.95,null,.2);return;}card('small',x,y+Rs*.5,z,Rs*1.3,Rs*.9,leafCol(PAL.broomLeaf,1.2,.03),.2);
 if(lv>=1)for(let i=0,m=lv===2?ri(2,4):1;i<m;i++){const a=rr(0,TAU),d=Rs*rr(0,.45);tuft('plume',x+Math.cos(a)*d,y+Rs*.4,z+Math.sin(a)*d,Rs*rr(.6,.9),Rs*.6,leafCol(PAL.broom,1.25,.02,.06,.04));}}
// Krator's own
// an ASH CREEPER (ref 15): a pale rosette riding the ash on grey runners that splay over the ground to the next one
function creeper(x,y,z,lv,st){const s=rr(.25,.55),TD=LC('tendril');
 if(TD.length)BIO.put(pick(TD),[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s*2.6,s*rr(1.4,2),s*2.6],null);
 else BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.7,1),s],leafCol(PAL.creeper,1.15,.02,.06,.05));
 if(lv===2)for(let k=0,n=ri(3,6);k<n;k++){const a=rr(0,TAU),L=rr(.6,1.8),ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;
  BIO.beam('rod',[x,y+.02,z],[ex,Y(ex,ez)+.02,ez],.035,.015,leafCol(PAL.creeperRoot,1.0,.01,.03,.04));}
 st.creepers++;}
// a PLUME-BUSH (ref 14): a burst of dark red feathers, taller than a man
function plumebush(x,y,z,lv,st){const h=rr(1.1,2.6)*(lv===0?1.3:1);around(x,z,lv===2?ri(1,3):1,.3,.9,(px,pz)=>tuft('feather',px,y,pz,h*rr(.8,1.1),h*rr(.7,1),leafCol(PAL.plumebush,1.25,.02,.07,.05)));st.plumes++;}
// SOOT CUPS (ref 5): a clump of black cups with green rims, stacked at differing heights
function soot(x,y,z,lv,st){const n=lv===2?ri(5,12):2,h0=rr(.3,.9);
 for(let k=0;k<n;k++){const a=k*2.4,d=rr(0,.45)*Math.sqrt(k),s=rr(.12,.24),hh=h0*rr(.2,1);BIO.put('cup',[x+Math.cos(a)*d,y+hh*.6,z+Math.sin(a)*d],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*rr(1.4,2.4),s],leafCol(PAL.soot,1.0,.02,.04,.03));}
 st.cups++;}
// STALK DAISIES (ref 5): red stalks with pale pink daisies
function daisies(x,y,z,lv,st){around(x,z,lv===2?ri(3,7):1,.15,.6,(px,pz)=>{const h=rr(.3,.75),py=Y(px,pz);
 if(lv===2)BIO.beam('rod',[px,py-.05,pz],[px+rr(-.05,.05),py+h,pz+rr(-.05,.05)],.025,.02,leafCol(PAL.daisyStalk,1.0,.02,.05,.04));
 BIO.put('bloom',[px,py+h,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),rr(.12,.2),leafCol(PAL.daisy,1.2,.02,.05,.05));});st.daisies++;}
// THE MAT (ref 7): a slime mould's sheet over the ground, its veins bright, little green vent cones rising out of it
function matPatch(x,y,z,lv,st){const R=rr(1.2,3.2);flat('mat',x,y,z,R,leafCol(PAL.mat,1.0,.02,.05,.05));
 if(lv>=1)for(let k=0,n=lv===2?ri(1,4):1;k<n;k++){const a=rr(0,TAU),d=R*rr(0,.6),s=rr(.12,.3),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('ventcone',[px,Y(px,pz)+.02,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(.5,.9),s],leafCol(PAL.cone,1.0,.02,.05,.05));}
 st.mat++;}
// BRAIN CAPS (ref 17): folded yellow domes on short twisted stems
function brain(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.6,1.6,(px,pz)=>{const s=rr(.3,.9),h=rr(.2,.9),py=Y(px,pz);
 BIO.beam('rod',[px,py-.1,pz],[px+rr(-.1,.1),py+h,pz+rr(-.1,.1)],s*.22,s*.15,leafCol(PAL.brainStem,1.0,.02,.04,.04));
 BIO.put('brain',[px,py+h,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*rr(.7,1),s],leafCol(PAL.brain,1.15,.02,.05,.05));});st.brains++;}
// VENT CORAL (ref 16): lumpy blue columns crowned with anemone tufts, pink and lime
function coral(x,y,z,lv,st){around(x,z,lv===2?ri(2,5):1,.4,1.3,(px,pz)=>{const s=rr(.25,.55),h=rr(.5,1.6),py=Y(px,pz);
 BIO.put('column',[px,py-.1,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,h,s],leafCol(PAL.coral,1.1,.02,.05,.05));
 tuft('feather',px,py+h*.92,pz,s*2.2,s*2.4,leafCol(PAL.anemone,1.3,.02,.06,.05));});st.coral++;}
// a SULPHUR ROSETTE (ref 4): broad wavy leaves maroon at the rim, in the acid water's edge, with antler stalks
function srosette(x,y,z,lv,st){const s=rr(.5,1.1);BIO.put('srosette',[x,Math.max(y,BIO.waterH(x,z)-.1)-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*rr(.6,.9),s],leafCol(PAL.sulphurLeaf,1.15,.02,.06,.05));
 if(lv===2)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),h=s*rr(1,2),bx=x+Math.cos(a)*s*.2,bz=z+Math.sin(a)*s*.2,by=y+s*.3,tx=bx+Math.cos(a)*h*.25,tz=bz+Math.sin(a)*h*.25;
  BIO.beam('rod',[bx,by,bz],[tx,by+h,tz],.04,.025,leafCol(PAL.sulphurLeaf,1.0,.04,.06,.05));
  for(let j=0;j<2;j++){const b=a+rr(-1.2,1.2),L=h*rr(.25,.4);BIO.beam('rod',[tx,by+h,tz],[tx+Math.cos(b)*L,by+h+L*.7,tz+Math.sin(b)*L],.022,.012,leafCol(PAL.sulphurRim,1.1,.02,.06,.05));}}
 st.srosettes++;}
// SCALE CONES (ref 18): pink scaled fingers in a little group
function scalecones(x,y,z,lv,st){around(x,z,lv===2?ri(2,5):1,.2,.7,(px,pz)=>{const s=rr(.1,.22),h=rr(.4,1.3);BIO.put('scalecone',[px,Y(px,pz)-.05,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s,h,s],leafCol(PAL.scale,1.15,.02,.05,.05));});st.scales++;}
function stone(x,y,z,lv,set,st,k){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5)*(k||1);
 if(putRooted(px,pz,'stone',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(set)))st.stones++;});}
function boulder(x,y,z,lv,st,big,set){const Rb=rr(.8,2.2)*(big||1);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.3,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.6,.95);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set||PAL.lava));if(ok)st.boulders++;
  if(ok&&lv===2&&rng()<.4)BIO.put('lichen',[bx,by+h*1.0,bz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.4,.8),leafCol(PAL.lichen,1.1,.02));});}
// the windward's: a GLASSFERN (black glassy fronds, blue and violet at an angle: aC2), the library's red BROMELIADS and
// MOSS clumps
function glassfern(x,y,z,lv,st){const n=lv===2?ri(4,7):2,L=rr(.35,.85);
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3);BIO.put('glassfern',[x,y+.04,z],qEuler(rr(-.1,.1),-a,rr(.1,.45)),[L,L*.8,L*rr(.8,1.1)],leafCol(PAL.glassfern,1.0,.01,.03,.02),{n:[Math.cos(a)*.3,1,Math.sin(a)*.3],c2:C(pick(PAL.glassIrid))});}st.glassferns++;}
function bromeliad(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.3,1,(px,pz)=>{const s=rr(.35,.8);BIO.put('bromeliad',[px,Y(px,pz)+s*.2,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s,s*.6,s],THRONE.LIB.bromeliad?null:leafCol(PAL.bromeliad,1.2),{n:[0,1,0]});});st.bromeliads++;}
function moss(x,y,z,lv,st){const R=rr(.5,1.3);BIO.put('mossclump',[x,y+R*.12,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,R*.35,R],THRONE.LIB.mossclump?null:leafCol(PAL.moss,1.2),{n:[0,1,0]});st.moss++;}
// the frontier's: an ANGEL TRUMPET shrub (a dark bush hung with the library's trumpets), SPIDER LILIES on short stalks
function angel(x,y,z,lv,st){const Rs=rr(.8,1.6),L=LC('angel');card('small',x,y+Rs*.6,z,Rs*1.6,Rs*1.1,leafCol([0x2e4a26,0x365430,0x2a4422],1.15),.25);
 if(L.length)for(let k=0,n=lv===2?ri(4,9):2;k<n;k++){const a=rr(0,TAU),d=Rs*rr(.2,.75),s=rr(.35,.6);BIO.put(pick(L),[x+Math.cos(a)*d,y+Rs*rr(.7,1.2),z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*1.3,s],null);}
 st.angels++;}
function spiderlily(x,y,z,lv,st){const L=LC('spiderlily');if(!L.length)return;around(x,z,lv===2?ri(2,5):1,.2,.8,(px,pz)=>{const h=rr(.3,.6),py=Y(px,pz);
  if(lv===2)BIO.beam('rod',[px,py-.05,pz],[px,py+h,pz],.02,.02,leafCol([0x3a6a2a,0x4a7a32],1.0));BIO.put(pick(L),[px,py+h,pz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.25,.4),null);});st.lilies++;}
THRONE.small={tuft,card,grass,bunch,fern,creeper,soot,matPatch,glassfern,bromeliad,moss,angel,spiderlily};

// ---------------------------------------------------------------- the zone planters
// the WINDWARD's mixes (wet ground: the kipuka station). Fresh lava: glassferns and lichen; young: glassferns, ferns,
// moss, bromeliads; the woods (mature flows: the kipuka itself is the hyperjungle's): ferns, moss, bromeliads, and a
// little of Krator's own (scale cones); the gullies: ferns, moss, scale cones.
const wet=Z=>rng()<Z.wetW;
function wetFresh(x,y,z,Z,lv,st){const t=rng();if(t<.4)glassfern(x,y,z,lv,st);else if(t<.72){lichen(x,y,z,.8);st.lichen++;}else if(t<.8)moss(x,y,z,lv,st);else stone(x,y,z,lv,PAL.lava,st);}
function wetYoung(x,y,z,Z,lv,st){const t=rng();if(t<.2)glassfern(x,y,z,lv,st);else if(t<.48){fern(x,y,z,lv);st.ferns++;}else if(t<.68)moss(x,y,z,lv,st);else if(t<.8)bromeliad(x,y,z,lv,st);else if(t<.9){grass(x,y,z,lv,PAL.grass,.8);st.tufts++;}else{lichen(x,y,z);st.lichen++;}}
function wetWoods(x,y,z,Z,lv,st){const t=rng();if(t<.38){fern(x,y,z,lv);st.ferns++;}else if(t<.58)moss(x,y,z,lv,st);else if(t<.74)bromeliad(x,y,z,lv,st);else if(t<.8)scalecones(x,y,z,lv,st);else if(t<.9){grass(x,y,z,lv,PAL.grass,1.1);st.tufts++;}else glassfern(x,y,z,lv,st);}
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix; `al` (rng() < Z.alien) picks the plume's side.
const al=Z=>rng()<Z.alien;
function plantFresh(x,y,z,Z,lv,st){if(wet(Z))return wetFresh(x,y,z,Z,lv,st);const t=rng();
 if(t<.45){lichen(x,y,z,.7);st.lichen++;}
 else if(t<.62&&al(Z)){matPatch(x,y,z,lv,st);}
 else if(t<.7){stone(x,y,z,lv,PAL.lava,st);}
 else if(t<.74&&Z.age>6){if(al(Z))creeper(x,y,z,lv,st);else{fern(x,y,z,lv);st.ferns++;}}}
function plantYoung(x,y,z,Z,lv,st){if(wet(Z))return wetYoung(x,y,z,Z,lv,st);const t=rng();
 if(!al(Z)&&hasLib('succulent')&&rng()<.22){const s=rr(.35,.7);if(cardPlant('succulent',x,y,z,s,s*1.6))st.cards++;return;}
 if(al(Z)&&hasLib('specimen')&&rng()<.18){plumeCard(x,y,z,lv,st);return;}
 if(al(Z)&&hasLib('moltensucc')&&rng()<.12){if(cardPlant('moltensucc',x,y,z,rr(.4,.9)))st.cards++;return;}
 if(al(Z)){if(t<.3)creeper(x,y,z,lv,st);else if(t<.48)soot(x,y,z,lv,st);else if(t<.62)matPatch(x,y,z,lv,st);else if(t<.74)daisies(x,y,z,lv,st);else if(t<.86){lichen(x,y,z);st.lichen++;}else stone(x,y,z,lv,PAL.lava,st);}
 else{if(t<.3){fern(x,y,z,lv);st.ferns++;}else if(t<.52){lichen(x,y,z);st.lichen++;}else if(t<.7){grass(x,y,z,lv,PAL.grass,.7);st.tufts++;}else if(t<.82){broom(x,y,z,lv);st.shrubs++;}else stone(x,y,z,lv,PAL.lava,st);}}
// the library's plume plants (only with the pack): glow tufts, snare flowers, the sixteen plume fungi, glow mushrooms
function plumeCard(x,y,z,lv,st){const t=rng();
 if(t<.22&&cardPlant('aflora',x,y,z,rr(.5,1.1)))st.cards++;else if(t<.34&&cardPlant('carnivore',x,y,z,rr(.4,.9)))st.cards++;
 else if(t<.48&&cardPlant('carnplant',x,y,z,rr(.5,1.2)))st.cards++;else if(t<.55&&cardPlant('trumpets',x,y,z,rr(.5,1.1)))st.cards++;else if(t<.62&&cardPlant('mushalien',x,y,z,rr(.4,1.1)))st.cards++;
 else if(t<.88&&cardPlant('specimen',x,y,z,rr(.35,1.0)))st.cards++;else if(cardPlant('glowshroom',x,y,z,rr(.3,.7)))st.glow++;}
function plantWoods(x,y,z,Z,lv,st){if(wet(Z))return wetWoods(x,y,z,Z,lv,st);const t=rng();
 if(al(Z)&&hasLib('specimen')&&rng()<.35){plumeCard(x,y,z,lv,st);return;}
 if(!al(Z)&&Z.seam>.3&&rng()<.25){if(hasLib('lavaleaf')&&rng()<.6){clumpPlant('lavaleaf',x,y,z,rr(.6,1.2));st.shrubs++;return;}if(hasLib('distressed')){clumpPlant('distressed',x,y,z,rr(.5,1.0));st.shrubs++;return;}}
 if(al(Z)){if(t<.26)creeper(x,y,z,lv,st);else if(t<.44)plumebush(x,y,z,lv,st);else if(t<.6)soot(x,y,z,lv,st);else if(t<.74)daisies(x,y,z,lv,st);else if(t<.82)matPatch(x,y,z,lv,st);else{bunch(x,y,z,lv,PAL.ash);st.tufts++;}}
 else{if(t<.32){grass(x,y,z,lv);st.tufts++;}else if(t<.56){bunch(x,y,z,lv,PAL.straw);st.tufts++;}else if(t<.72){broom(x,y,z,lv);st.shrubs++;}else if(t<.8){fern(x,y,z,lv);st.ferns++;}else if(t<.9){lichen(x,y,z);st.lichen++;}else stone(x,y,z,lv,PAL.lava,st);}}
function plantCinder(x,y,z,Z,lv,st){const t=rng();
 if(hasLib('moltensucc')&&rng()<.3){if(cardPlant('moltensucc',x,y,z,rr(.4,.9)))st.cards++;return;}
 if(al(Z)){if(t<.25)soot(x,y,z,lv,st);else if(t<.45)creeper(x,y,z,lv,st);else if(t<.55)matPatch(x,y,z,lv,st);else stone(x,y,z,lv,PAL.cinder,st,.6);}
 else{if(t<.3){bunch(x,y,z,lv,PAL.straw);st.tufts++;}else if(t<.5){lichen(x,y,z);st.lichen++;}else if(t<.6){broom(x,y,z,lv);st.shrubs++;}else stone(x,y,z,lv,PAL.cinder,st,.6);}}
function plantGully(x,y,z,Z,lv,st){const t=rng();
 if(wet(Z)&&t<.25){moss(x,y,z,lv,st);return;}
 if(al(Z)&&hasLib('glowshroom')&&rng()<.25){if(cardPlant('glowshroom',x,y,z,rr(.3,.8)))st.glow++;return;}
 if(t<.32){fern(x,y,z,lv);st.ferns++;}else if(t<.48){scalecones(x,y,z,lv,st);}else if(t<.66){grass(x,y,z,lv,PAL.moss,1.1);st.tufts++;}
 else if(t<.78&&al(Z)){soot(x,y,z,lv,st);}else if(t<.88){lichen(x,y,z);st.lichen++;}else stone(x,y,z,lv,PAL.lava,st,.8);}
function plantVent(x,y,z,Z,lv,st){const t=rng();
 if(hasLib('coralcard')&&rng()<.3){if(cardPlant('coralcard',x,y,z,rr(.4,1.0)))st.cards++;return;}
 if(t<.24)brain(x,y,z,lv,st);else if(t<.44)coral(x,y,z,lv,st);else if(t<.66)matPatch(x,y,z,lv,st);else stone(x,y,z,lv,PAL.sulphur,st,.8);}
function plantMarsh(x,y,z,Z,lv,st){const t=rng();
 if(rng()<.3){if(rng()<.5?cardPlant('carnplant',x,y,z,rr(.5,1.1)):cardPlant('coralcard',x,y,z,rr(.4,.9))){st.cards++;return;}}
 if(t<.45)srosette(x,y,z,lv,st);else if(t<.62)coral(x,y,z,lv,st);else if(t<.76)brain(x,y,z,lv,st);else if(t<.86)matPatch(x,y,z,lv,st);else stone(x,y,z,lv,PAL.sulphur,st,.6);}
function plantSky(x,y,z,Z,lv,st){const t=rng();
 if(hasLib('glowshroom')&&rng()<.35){if(cardPlant('glowshroom',x,y,z,rr(.3,.8)))st.glow++;return;}
 if(t<.4){fern(x,y,z,lv);st.ferns++;}else if(t<.6)scalecones(x,y,z,lv,st);else if(t<.75){grass(x,y,z,lv,PAL.moss,.9);st.tufts++;}else stone(x,y,z,lv,PAL.lava,st);}

// ---------------------------------------------------------------- the pass
// THE FRONTIER's zones (stations/frontier): a plantation's ground between the rows (sparse weeds on bare red earth),
// a fresh clearing (char, slash, the first ferns and lilies), the shore (grass and lichen), the forest's edge (the
// natives' poison gardens: angel trumpets, spider lilies among the ferns)
function plantField(x,y,z,Z,lv,st){const t=rng();if(t<.35){grass(x,y,z,lv,PAL.grass,.6);st.tufts++;}else if(t<.45){fern(x,y,z,lv);st.ferns++;}else if(t<.5){lichen(x,y,z,.6);st.lichen++;}}
function plantClear(x,y,z,Z,lv,st){const t=rng();if(t<.3)flat('litter',x,y,z,rr(1,2.2),leafCol([0x1e1b18,0x2c2824,0x3a342c],1.0,.02,.04,.03));else if(t<.45){fern(x,y,z,lv);st.ferns++;}
 else if(t<.55)spiderlily(x,y,z,lv,st);else if(t<.7){grass(x,y,z,lv,PAL.straw,.7);st.tufts++;}else if(t<.8)stone(x,y,z,lv,PAL.lava,st,.6);}
function plantCoast(x,y,z,Z,lv,st){const t=rng();if(t<.35){bunch(x,y,z,lv,PAL.straw);st.tufts++;}else if(t<.5){grass(x,y,z,lv,PAL.grass,.8);st.tufts++;}else if(t<.62)bromeliad(x,y,z,lv,st);
 else if(t<.75){lichen(x,y,z);st.lichen++;}else if(t<.85)glassfern(x,y,z,lv,st);else stone(x,y,z,lv,PAL.lava,st,.8);}
function plantEdge(x,y,z,Z,lv,st){const t=rng();if(t<.45)angel(x,y,z,lv,st);else if(t<.62)spiderlily(x,y,z,lv,st);else if(t<.75){fern(x,y,z,lv);st.ferns++;}else moss(x,y,z,lv,st);}
// THE SAVANNA's zones (stations/savanna): the tall grass (and on a fresh burn, black stubble with green coming through and
// the fire flowers), the gill-parasol woods' floor, the channels' gravel bars
function tallGrass(x,y,z,lv,st,k){const G=LC('grassdry');if(G.length){const s=rr(1.1,1.8)*k;BIO.put(pick(G),[x,y,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s*1.1,s*1.25,s*1.1],null);st.cards++;}else{bunch(x,y,z,lv,PAL.straw);}st.tufts++;}
function plantSavanna(x,y,z,Z,lv,st){const t=rng(),b=Z.burn>.5;
 if(b){if(t<.3){grass(x,y,z,lv,PAL.grass,.45);st.tufts++;}else if(t<.42&&hasLib('flowerspike')){if(cardPlant('flowerspike',x,y,z,rr(.5,.9)))st.cards++;}else if(t<.5)stone(x,y,z,lv,PAL.lava,st,.6);return;}
 if(t<.62)tallGrass(x,y,z,lv,st,1);else if(t<.78){bunch(x,y,z,lv,PAL.straw);st.tufts++;}else if(t<.84){broom(x,y,z,lv);st.shrubs++;}else if(t<.9){lichen(x,y,z,.6);st.lichen++;}else if(t<.95)stone(x,y,z,lv,PAL.lava,st,.7);}
function plantCapwood(x,y,z,Z,lv,st){const t=rng();if(t<.3)tallGrass(x,y,z,lv,st,.75);else if(t<.5){grass(x,y,z,lv,PAL.straw,.7);st.tufts++;}else if(t<.62){fern(x,y,z,lv);st.ferns++;}else if(t<.72){broom(x,y,z,lv);st.shrubs++;}else if(t<.85){lichen(x,y,z);st.lichen++;}else stone(x,y,z,lv,PAL.lava,st,.6);}
function plantBraid(x,y,z,Z,lv,st){const t=rng();if(t<.25)stone(x,y,z,lv,PAL.lava,st,.9);else if(t<.45){grass(x,y,z,lv,PAL.straw,.6);st.tufts++;}else if(t<.55)tallGrass(x,y,z,lv,st,.7);else if(t<.7){lichen(x,y,z,.6);st.lichen++;}}
THRONE.FLOOR_ZONES=['fresh','young','woods','cinder','gully','vent','marsh','sky','field','clear','coast','edge','savanna','capwood','braid'];
const PLANTERS=[plantFresh,plantYoung,plantWoods,plantCinder,plantGully,plantVent,plantMarsh,plantSky,plantField,plantClear,plantCoast,plantEdge,plantSavanna,plantCapwood,plantBraid];
THRONE.floorWeights=Z=>[Z.fresh*.45,Z.young*1.25,(Z.mature+Z.old)*1.35*(1-Z.edge),Z.cinder*.7,Z.gully*1.4,Z.vent*1.5,Z.marsh*1.6,Z.sky*1.6,Z.field*.9,Z.clear*1.2,Z.coast*1.3,Z.edge*2.6,Z.savanna*1.5,Z.capwood*1.2,Z.braid*.8];
THRONE.buildFloor=function(R,q){
 reseed(600047);q=q==null?1:q;R=R||2500;means();
 const st={angels:0,lilies:0,glassferns:0,bromeliads:0,moss:0,cards:0,glow:0,tufts:0,shrubs:0,ferns:0,lichen:0,stones:0,boulders:0,creepers:0,plumes:0,cups:0,daisies:0,mat:0,brains:0,coral:0,srosettes:0,scales:0,brackets:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.cliff>.6)return;
  const w=THRONE.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[6.5,L.floor[0],0],[13,L.floor[1],L.floor[0]],[30,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return (lv===0?.6:.95)*q;},(x,y,z,d)=>plant(x,y,z,lv),{patch:.6,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE LANTERN BRACKETS on the dark walls: a flow's front, a crater's wall, a skylight's; facing out of the wall
 // (down its slope). Under the plume, and in every skylight
 BIO.grid(5,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const s=BIO.field('slope',x,z),rk=BIO.field('rock',x,z),pl=BIO.field('plume',x,z),sk=BIO.field('skylight',x,z);
   return smooth(.55,.85,s)*smooth(.25,.5,rk)*Math.max(smooth(.3,.7,pl),smooth(.3,.6,sk))*.55*q*(1-smooth(.5,.8,BIO.field('barren',x,z)));},   // not on barren ground (a hot fissure's walls)
  (x,y,z,d)=>{const e=2,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),a=Math.atan2(-gz,-gx),lv=BIO.lodD(x,z)<L.hero?2:1;
   // each one ON the wall: spread along the wall (across its fall line, not up it: a wall leans back, so a bracket lifted
   // above its foot would hang in the air in front of it), at the ground's own height there, tucked a little into the rock
   const SH=LC('shelf'),ox=Math.cos(a),oz=Math.sin(a);
   for(let k=0,n=lv===2?ri(2,5):1;k<n;k++){const s=rr(.15,.4),u=rr(-1.8,1.8),q=qEuler(rr(-.1,.1),Math.PI/2-a+rr(-.3,.3),0);
    const px=x-oz*u-ox*s*.4,pz=z+ox*u-oz*s*.4,py=Y(px,pz);
    if(SH.length)BIO.put(pick(SH),[px,py-s*1.4,pz],q,s*3.2,null);else BIO.put('bracket',[px,py+s*.2,pz],q,[s,s*.6,s],leafCol(PAL.bracket,1.0,.03,.06,.05));}
   st.brackets++;},{patch:.5,patchScale:.03,pad:.5});
 // spatter and basalt boulders round the cones, the fissure and the pit's rim
 BIO.grid(14,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const c=BIO.field('cinder',x,z),v=BIO.field('vent',x,z);return (c*.25+v*.2)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(.6,1.4),BIO.field('cinder',x,z)>.5?PAL.cinder:PAL.lava);},{patch:.3,pad:1});
 return{under:st};};

// ---------------------------------------------------------------- the shallows (the geyser isle: stations/isle)
// What stands in the water, so off the host's mask: KELP on the sea bed 3-15 m down (crossed cards as tall as the water
// is deep, their fronds lying on the surface); the HYPER-MANGROVES in the warm lagoon (the host's 'mangal' field: the
// shallows and mud flats), on their prop roots; the WRACK, kelp cast up flat along the high-water line (the host's 'wrack'
// field). Only on a page that asks for it (THRONE.build({shallows:true})). The mangroves are trees like the others
// (THRONE.TREES, the far impostors, the obstacles).
THRONE.buildShallows=function(R,q){reseed(610047);q=q==null?1:q;R=R||2500;const st={kelp:0,wrack:0,mangroves:0},L=BIO.LOD(),KL=LC('kelp'),WR=THRONE.LIB.wrack||[];
 if(KL.length)BIO.grid(5.5,0,R,(x,z)=>{const ld=BIO.lodD(x,z);return ld>L.mid*1.3?0:.55*q*(ld<L.hero?1:.55);},
  (x,y,z)=>{const w=BIO.host.waterH(x,z),dep=w-y;if(dep<3||dep>15)return;
   for(let k=0,n=ri(1,3);k<n;k++){const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2),py=BIO.terrainH(px,pz),h=w-py+rr(-.4,.5),s=h*rr(.3,.42);
    BIO.put(pick(KL),[px,py-.1,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,h,s],null);st.kelp++;}},
  {depth:[3,15],noMask:true,patch:.85,patchScale:.012,pad:0});
 if(WR.length)BIO.grid(2.2,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;return BIO.field('wrack',x,z)*.8*q;},
  (x,y,z)=>{if(BIO.host.waterH(x,z)>y-.3)return;   // the cached field blurs the high-water line: never in the water itself
   for(let k=0,n=ri(1,4);k<n;k++){const s=rr(.5,1.1);BIO.put(pick(WR),[x+rr(-.6,.6),y+.03+k*.01,z+rr(-.6,.6)],qEuler(0,rr(0,TAU),0),[s,1,s*rr(1.2,2)],leafCol(PAL.wrack,1.0,.02,.05,.05));st.wrack++;}},
  {noMask:true,patch:.7,patchScale:.03,pad:0});
 // the seaweed: from the tide line to 3 m down, in clumps (the owner's nine), near the cameras
 const SW=LC('seaweed');st.seaweed=0;
 if(SW.length)BIO.grid(2.4,0,R,(x,z)=>{const ld=BIO.lodD(x,z);return ld>L.floor[1]?0:.7*q*(ld<L.floor[0]?1:.5);},
  (x,y,z)=>{const w=BIO.host.waterH(x,z),dep=w-y;if(dep<.15||dep>3)return;
   for(let k=0,n=ri(1,4);k<n;k++){const px=x+rr(-.8,.8),pz=z+rr(-.8,.8),py=BIO.terrainH(px,pz),s=rr(.5,1.3)*Math.min(1,.4+dep*.4);BIO.put(pick(SW),[px,py-.05,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s,s,s],null);st.seaweed++;}},
  {depth:[.15,3],noMask:true,patch:.8,patchScale:.03,pad:0});
 BIO.grid(18,0,R,(x,z)=>BIO.field('mangal',x,z)*.75*q,
  (x,y,z)=>{const T=THRONE.make(19,x,y,z),ld=BIO.lodD(x,z);THRONE.TREES.push(T);BIO.host.obstacles.push({x,z,r:T.crownR*.5});
   THRONE.grow(T,ld<L.hero?2:(ld<L.mid?1:0));st.mangroves++;},
  {noMask:true,patch:.5,patchScale:.01,pad:4});
 return st;};
// THE UNDERSTORY (the isle's woods and its warm ground): a second, denser floor near the cameras, so the wet forest's
// floor is ferns and moss, not bare litter between the trees. Only on a page that asks (THRONE.build({understory:true}))
THRONE.buildUnderstory=function(R,q){reseed(620047);q=q==null?1:q;R=R||2500;const st={ferns:0,moss:0,bromeliads:0,glassferns:0,tufts:0,lichen:0,stones:0,glow:0,cards:0},L=BIO.LOD();
 const k=(x,z)=>BIO.field('iwood',x,z)+BIO.field('grove',x,z)*1.2+BIO.field('beach',x,z)*.25+BIO.field('cforest',x,z)*1.1+BIO.field('savanna',x,z)*1.2*(1-BIO.field('burn',x,z)*.8)+BIO.field('capwood',x,z)*.5,FG=LC('ferngreen');
 [[2.6,L.floor[0],0],[5,L.floor[1],L.floor[0]]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return clamp(k(x,z),0,1)*.9*q;},
   (x,y,z)=>{if(blocked(x,z,.5))return;const t=rng();
    // on the savanna it is the tall grass, close and thick
    if(BIO.field('savanna',x,z)+BIO.field('capwood',x,z)*.6>.4){
     // on the fresh burn only the first green and the fire flowers, sparse
     if(BIO.field('burn',x,z)>.5){if(t<.25){grass(x,y,z,lv,PAL.grass,.45);st.tufts++;}else if(t<.33&&hasLib('flowerspike')){if(cardPlant('flowerspike',x,y,z,rr(.5,.9)))st.cards++;}return;}
     if(t<.8){tallGrass(x,y,z,lv,st,rr(.8,1.15));if(lv===2&&rng()<.6)tallGrass(x+rr(-1,1),BIO.terrainH(x+.5,z),z+rr(-1,1),lv,st,rr(.7,1));}else if(t<.9){bunch(x,y,z,lv,PAL.straw);st.tufts++;}else if(hasLib('flowerspike')&&t<.93){if(cardPlant('flowerspike',x,y,z,rr(.5,.9)))st.cards++;}return;}
    // in the cloud forest its own green ferns (the library's), half the ferns
    if(t<.46){if(FG.length&&BIO.field('cforest',x,z)>.4&&rng()<.6){const s=rr(.5,1.1);BIO.put(pick(FG),[x,y,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s,s,s],null);st.cards++;}else fern(x,y,z,lv);st.ferns++;}else if(t<.66)moss(x,y,z,lv,st);else if(t<.76)bromeliad(x,y,z,lv,st);else if(t<.84)glassfern(x,y,z,lv,st);else{grass(x,y,z,lv,PAL.grass,1.0);st.tufts++;}},
   {patch:.55,patchScale:.02,pad:.4,box:BIO.originBox(b[1])});});
 return st;};

// ---------------------------------------------------------------- the sulphur life (vent country: stations/vents)
// Only where the host hands in its 'sulph' field (the marsh, the vents' crusts, the cracks' lips, the steam valley), on its
// own seed (so no other station's floor moves). BRIMSTONE REEDS in stands, in the shallows (up to ~0.5 m) and on the
// crust; ACID PADS floating on the open water, a few carrying a bladder; GAS BLADDERS in clusters on the crust. Near the
// cameras only (the floor's bands): the reeds thinner out to the mid band, the pads and bladders the hero band
THRONE.buildSulphur=function(R,q){reseed(640047);q=q==null?1:q;R=R||2500;const st={reeds:0,stems:0,pads:0,bladders:0},L=BIO.LOD();
 const SF=(x,z)=>BIO.field('sulph',x,z)*(1-smooth(.6,.85,BIO.field('slope',x,z))),dep=(x,z)=>BIO.depth(x,z);
 const RB=LC('reedbrim');
 const reeds=(x,y,z,lv)=>{const w=Math.max(y,BIO.waterH(x,z));
  // with the owner's sheet: a stand or two of the cards, rising from the ground under the water
  if(RB.length){for(let k=0,n=lv===2?ri(1,2):1;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,1.4):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.depth(px,pz)>.5)continue;const h=rr(1.8,3.4);BIO.put(pick(RB),[px,Y(px,pz)-.1,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[h*.8,h,h*.8],null);st.stems++;}st.reeds++;return;}
  for(let k=0,n=lv===2?ri(6,11):ri(2,4);k<n;k++){const a=rr(0,TAU),d=k?rr(.2,1.4):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz),h=rr(1.4,3.4),la=rr(0,TAU),ln=rr(.02,.12)*h,
    tx=px+Math.cos(la)*ln,tz=pz+Math.sin(la)*ln,mx=mix(px,tx,.45),mz=mix(pz,tz,.45),my=mix(Math.max(py,w-.05),py+h,.45),r=rr(.035,.06);
   if(BIO.depth(px,pz)>.6)continue;
   BIO.beam('rod',[px,py-.1,pz],[mx,my,mz],r*1.2,r,vary(C(pick(PAL.reedLow)),.03,.08,.06));BIO.beam('rod',[mx,my,mz],[tx,py+h,tz],r,r*.6,vary(C(pick(PAL.reedHigh)),.03,.08,.06));
   const ts=rr(.045,.075);BIO.put('tassel',[tx,py+h+ts*1.2,tz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[ts,ts*rr(1.6,2.4),ts],C(pick(PAL.tassel)));st.stems++;}
  st.reeds++;};
 const bladders=(x,y,z,n)=>{for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.15,.7):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz),h=rr(.08,.45),s=rr(.12,.32);
   if(h>.1)BIO.beam('rod',[px,py-.05,pz],[px,py+h,pz],.025,.02,C(pick(PAL.bladderStalk)));
   BIO.put('bladder',[px,py+h+s*1.1,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*rr(1.1,1.5),s],vary(C(pick(PAL.bladder)),.03,.08,.06));st.bladders++;}};
 // the reeds: dense near, thinner to the mid band; in the shallows (the grid's depth window) or on the crust
 [[5,L.floor[0],0,2],[12,L.mid,L.floor[0],1]].forEach(([cell,hi,lo,lv])=>BIO.grid(cell,0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=hi||ld<lo)return 0;return SF(x,z)*.32*q;},
  (x,y,z)=>{if(THRONE.blocked(x,z,.8))return;reeds(x,y,z,lv);},{patch:1.1,patchScale:.022,pad:.5,depth:[-1e12,.45],noMask:true,box:BIO.originBox(hi)}));
 // the pads: on the open water, 0.15-1.5 m deep
 BIO.grid(2.6,0,R,(x,z)=>BIO.lodD(x,z)<L.floor[1]?SF(x,z)*.45*q:0,(x,y,z)=>{const w=BIO.waterH(x,z),s=rr(.35,1.15);
   BIO.put('acidpad',[x,w+.015,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[s,1,s],vary(C(pick(PAL.acidPad)),.03,.08,.06));st.pads++;
   if(rng()<.15){const b=rr(.1,.2);BIO.put('bladder',[x+rr(-.2,.2)*s,w+b*.9,z+rr(-.2,.2)*s],qEuler(0,rr(0,TAU),0),[b,b*.8,b],C(pick(PAL.bladder)));st.bladders++;}},
  {patch:.55,patchScale:.025,pad:.3,depth:[.15,1.5],noMask:true,box:BIO.originBox(L.floor[1])});
 // the bladders: clusters on the crust, dry ground only
 BIO.grid(8,0,R,(x,z)=>BIO.lodD(x,z)<L.floor[0]?SF(x,z)*.3*q:0,(x,y,z)=>{if(THRONE.blocked(x,z,.6))return;bladders(x,y,z,ri(3,7));},
  {patch:.5,patchScale:.03,pad:.5,box:BIO.originBox(L.floor[0])});
 return st;};

// ---------------------------------------------------------------- the cold (the glacier: stations/glacier)
// Only where the host hands in its 'cbelt' field, on its own seed. The cold belt's floor in the snow (teal cushions, a
// little grass, fallen gill-coral caps); the tundra on the moraines and the bare ground (lichen, moss, sparse grass); the
// WARM ground round the fumaroles (the warm living spots: moss, the mat, glow mushrooms where the pack has them)
THRONE.buildCold=function(R,q){reseed(650047);q=q==null?1:q;R=R||2500;const st={cushions:0,tufts:0,lichen:0,moss:0,caps:0,mat:0,glow:0},L=BIO.LOD();
 const F=(n,x,z)=>BIO.field(n,x,z),GS=LC('glowshroom');
 const cushion=(x,y,z,k)=>{const s=rr(.5,1.1)*k;BIO.put('cushion',[x,y-s*.08,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*rr(.8,1.1),s],vary(C(pick(PAL.cushion)),.02,.06,.06),{n:[0,1,0]});st.cushions++;};
 const plant=(x,y,z,lv)=>{const cb=F('cbelt',x,z),tu=F('tundra',x,z),wm=F('warm',x,z),t=rng();
  // the death zone (the summit): only the hardiest: lichen on the rocks, moss and the mat on the warm ground
  if(F('deathzone',x,z)>.5){if(wm>.35){if(t<.45){moss(x,y,z,lv,st);st.moss++;}else if(t<.7){flat('mat',x,y,z,rr(.8,2),leafCol(PAL.mat,1.0,.02,.05,.05));st.mat++;}else{lichen(x,y,z,.8);st.lichen++;}}else if(rng()<tu){lichen(x,y,z,.8);st.lichen++;}return;}
  if(wm>.35){if(t<.4){moss(x,y,z,lv,st);st.moss++;}else if(t<.65){matPatch(x,y,z,lv,st);st.mat++;}else if(t<.8&&GS.length){if(cardPlant('glowshroom',x,y,z,rr(.3,.7)))st.glow++;}else{lichen(x,y,z,.8);st.lichen++;}return;}
  if(rng()<cb){if(t<.45)around(x,z,lv===2?ri(1,3):1,.4,1.4,(px,pz)=>cushion(px,Y(px,pz),pz,1));else if(t<.62){grass(x,y,z,lv,PAL.straw,.6);st.tufts++;}
   else if(t<.7){const s=rr(.5,1.4);BIO.put('gcoral',[x,y+.05,z],qEuler(rr(-.6,.6),rr(0,TAU),rr(-.6,.6)),[s,s*.5,s],THRONE.LIB.gcoralT?C(0xffffff).multiplyScalar(rr(.8,1)):vary(C(pick(PAL.gcCap)),.02,.08,.06));st.caps++;}
   else if(t<.82){lichen(x,y,z,.7);st.lichen++;}return;}
  if(rng()<tu){if(t<.5){lichen(x,y,z,.9);st.lichen++;}else if(t<.7){moss(x,y,z,lv,st);st.moss++;}else if(t<.82){grass(x,y,z,lv,PAL.straw,.45);st.tufts++;}else if(t<.88)cushion(x,y,z,.6);}};
 [[6,L.floor[0],0,2],[13,L.floor[1],L.floor[0],1]].forEach(([cell,hi,lo,lv])=>BIO.grid(cell,0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=hi||ld<lo)return 0;return Math.max(F('cbelt',x,z),F('tundra',x,z),F('warm',x,z))*.9*q;},
  (x,y,z)=>{if(THRONE.blocked(x,z,.6))return;plant(x,y,z,lv);},{patch:.55,patchScale:.02,pad:.5,box:BIO.originBox(hi)}));
 return st;};

// ---------------------------------------------------------------- the cave (the lava tube: stations/tube)
// Only where the host hands in its 'cave' field (a tube's floor out of the light), on its own seed. Krator's own cave life
// in the dark: the mat in glowing sheets, glow mushrooms in clusters, pale fungi and alien mushrooms, scale cones, lichen
// and stones; thickest along the walls' feet, thin down the middle where the lava last ran
THRONE.buildCave=function(R,q){reseed(660047);q=q==null?1:q;R=R||2500;const st={mat:0,glow:0,cards:0,scales:0,lichen:0,stones:0},L=BIO.LOD();
 const F=(n,x,z)=>BIO.field(n,x,z);
 const plant=(x,y,z,lv)=>{const t=rng();
  if(t<.07){matPatch(x,y,z,lv,st);}
  else if(t<.4&&hasLib('glowshroom')){around(x,z,lv===2?ri(1,3):1,.3,1.2,(px,pz)=>{if(cardPlant('glowshroom',px,Y(px,pz),pz,rr(.25,.7)))st.glow++;});}
  else if(t<.6&&hasLib('specimen')){if(cardPlant('specimen',x,y,z,rr(.3,.9)))st.cards++;}
  else if(t<.7&&hasLib('mushalien')){if(cardPlant('mushalien',x,y,z,rr(.35,.9)))st.cards++;}
  else if(t<.78){scalecones(x,y,z,lv,st);st.scales++;}
  else if(t<.9){lichen(x,y,z,.7);st.lichen++;}
  else{stone(x,y,z,lv,PAL.lava,st,.6);}};
 BIO.grid(2.2,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const c=F('cave',x,z);return c*q*(.45+.55*smooth(.2,.75,F('slope',x,z)+.4*fbm(x*.05,z*.05,6601,2)));},
  (x,y,z)=>{if(THRONE.blocked(x,z,.5))return;plant(x,y,z,BIO.lodD(x,z)<L.floor[0]?2:1);},{patch:.6,patchScale:.03,pad:.3});
 return st;};
})();
