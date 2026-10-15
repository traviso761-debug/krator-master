// ================================================================= RING SEA ISLES — floor
// Everything under the trees, by zone (RINGISLES.zones):
//   FOREST   ferns, red ginger, elephant ears; in the XA forest more of them, and lianas hung from the canopy, bromeliads
//            and moss on the boughs (the hypertropic forest's dressing)
//   SAVANNA  tall grass by the burn mosaic: black (ash, stubble, the green flush), flush (short bright regrowth), green,
//            cured (gold, standing, seed heads); the XV grass head-high; thorn scrub; termite mounds (bigger on XV)
//   STEPPE   warm bunchgrass on red soil, low thorn scrub, stones; saltbush on the salt steppe
//   SALT     the pan: glasswort and samphire mats at its rim (green to red), salt-crust plates in its middle
//   STRAND   beach morning glory over the upper beach, beach grass on the dunes, naupaka behind the sand, the wrack line
//            at the high-water mark, driftwood
//   LAGOON   seagrass meadows on the sand; coral heads (brain, branching, table) scattered, thickening toward the reef
//   REEF     the reef flat: coral heads crowded, rubble; table corals on the fore reef
//   BENCH    the tide pools: anemones, urchins and limpets in the pools and on the wet rock
// Three LOD bands along the spine at 3.5 / 7 / 15 m cells; then the water's own passes (each with its window of depth).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=RINGISLES.PAL,zones=RINGISLES.zones,blocked=RINGISLES.blocked,C=RINGISLES.C;
const {bright,shade,vary,tint,means,leafCol}=RINGISLES;
const Y=(x,z)=>BIO.terrainH(x,z);
const lib=k=>!!RINGISLES.LIB[k],lc=(slot,c)=>RINGISLES.libCol(slot,c);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,y,z,h,w,col,tl){const t=tl==null?.06:tl;BIO.put(item,[x,y-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w||h*.8,h,w||h*.8],col);}
function flat(item,x,y,z,R,col){BIO.put(item,[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],col);}
const rockTint=set=>tint(vary(pick(set||PAL.stone),.02,.06,.06),means().rock,rr(.5,.75));

// ---------------------------------------------------------------- small plants
// the GRASS by its burn state: k the zone's size (the XV grass head-high)
function savGrass(x,y,z,lv,Z,k){const b=Z.burn,u=rng();
 if(u<b.black){if(rng()<.5)flat('ash',x,y,z,rr(.6,1.4),leafCol(PAL.grassBlack,1,.01,.03,.03));else tuft('stubble',x,y,z,rr(.15,.35),rr(.4,.7),leafCol(PAL.grassBlack,1.1,.01,.03,.04));
  if(rng()<.35)tuft('tallgrass',x+rr(-.5,.5),y,z+rr(-.5,.5),rr(.12,.25),.35,leafCol(PAL.grassFlush,1.25,.02,.08,.05));return 'black';}
 const set=u<b.black+b.flush?PAL.grassFlush:u<b.black+b.flush+b.green?PAL.grassGreen:(k>1.3?PAL.grassXV:PAL.grassCured);
 const hk=u<b.black+b.flush?.35:u<b.black+b.flush+b.green?.75:1;
 const h=rr(1.0,1.8)*k*hk*(lv===0?1.4:1),seed=set===PAL.grassCured||set===PAL.grassXV;
 around(x,z,lv===2?ri(2,4):lv===1?2:1,.5,1.7,(px,pz)=>tuft(seed&&rng()<.5?'tallgrassb':'tallgrass',px,Y(px,pz),pz,h*rr(.8,1.15),h*rr(.9,1.3),leafCol(set,1.2,.02,.08,.06)));
 return set===PAL.grassFlush?'flush':set===PAL.grassGreen?'green':'cured';}
function bunch(x,y,z,lv,dry){const h=rr(.3,.65)*(lv===0?1.5:1);around(x,z,lv===2?ri(2,4):1,.5,1.5,(px,pz)=>tuft('bunch',px,Y(px,pz),pz,h*rr(.8,1.15),h*1.3,leafCol(dry?PAL.bunch:PAL.bunchGreen,1.2,.03,.08,.06)));}
function thornbush(x,y,z,lv,k){const Rs=rr(.5,1.1)*(k||1),hc=vary(pick(PAL.thornbush),.02,.08,.05);
 if(lv>=1)BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs*.6,Rs*.55,Rs*.6],shade(hc,-.45));
 for(let i=0,n=lv===2?ri(2,4):1;i<n;i++)BIO.put('thornspray',[x+rr(-.3,.3)*Rs,y+Rs*rr(.45,.8),z+rr(-.3,.3)*Rs],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[Rs*1.3,Rs*.6,Rs*1.3],bright(hc,1.2),{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
function mound(x,y,z,lv,big){const h=(big?rr(2.6,5.5):rr(1.2,3))*(lv===0?1:1);BIO.put('mound',[x,y-.25,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[h*.55,h+.25,h*.55],shade(vary(pick(big?PAL.moundXV:PAL.mound),.02,.06,.05),-.05));}
function stone(x,y,z,lv,set){around(x,z,lv===2?ri(1,3):1,.4,1.4,(px,pz)=>{const r=rr(.12,.45);BIO.put('stone',[px,Y(px,pz)+r*.15,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.65,r*rr(.9,1.4)],rockTint(set));});}
function saltbush(x,y,z,lv){const Rs=rr(.45,.9);for(let i=0,n=lv===2?ri(2,3):1;i<n;i++)BIO.put('saltbush',[x+rr(-.25,.25)*Rs,y+Rs*rr(.35,.6),z+rr(-.25,.25)*Rs],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[Rs*1.3,Rs*.8,Rs*1.3],leafCol(PAL.saltbush,1.15,.01,.04,.04),{n:[0,1,0]});}
function samphire(x,y,z,lv,red){const n=lv===2?ri(3,6):2;around(x,z,n,.2,.9,(px,pz)=>{const h=rr(.15,.35);tuft('samphire',px,Y(px,pz),pz,h,h*rr(1.4,2.2),lc('samphire',leafCol(red?PAL.samphire.slice(2):PAL.samphire.slice(0,2),1.15,.02,.06,.05)));});}
function crust(x,y,z,lv){for(let i=0,n=lv===2?ri(2,5):1;i<n;i++){const s=rr(.5,1.6),px=x+rr(-1.5,1.5),pz=z+rr(-1.5,1.5);BIO.put('crust',[px,Y(px,pz)+.02,pz],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[s,1,s*rr(.7,1)],C(pick(PAL.saltCrust)));}}
// the strand
function creeper(x,y,z,lv){const R=rr(1.2,2.6);flat('creeper',x,y,z,R,leafCol(PAL.creeper,1.15,.02,.06,.05));
 if(lv===2)for(let k=0,n=ri(1,4);k<n;k++){const a=rr(0,TAU),d=R*rr(.1,.45),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.09,.14);BIO.put('gloryflower',[px,Y(px,pz)+.1,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,1,s],leafCol(PAL.creeperBloom,1.2,.02,.06,.04));}
 if(lv===2)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),L=rr(1.5,3.5),ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;BIO.beam('rod',[x,y+.02,z],[ex,Y(ex,ez)+.02,ez],.014,.01,shade(C(pick(PAL.creeper)),-.35));}}
function naupaka(x,y,z,lv){const Rs=rr(.7,1.4);if(lv>=1)BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.7,Rs*.7],shade(C(pick(PAL.naupaka)),-.4));
 for(let i=0,n=lv===2?ri(3,6):2;i<n;i++)BIO.put('naupaka',[x+rr(-.4,.4)*Rs,y+Rs*rr(.4,.85),z+rr(-.4,.4)*Rs],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[Rs*1.1,Rs*.7,Rs*1.1],leafCol(PAL.naupaka,1.2,.02,.06,.05),{n:[rr(-.2,.2),1,rr(-.2,.2)]});
 if(lv===2)for(let i=0,n=ri(2,6);i<n;i++)BIO.put('halfflower',[x+rr(-.5,.5)*Rs,y+Rs*rr(.8,1.1),z+rr(-.5,.5)*Rs],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.05,.08),C(pick(PAL.naupakaBloom)));}
function beachgrass(x,y,z,lv){const h=rr(.4,.9);around(x,z,lv===2?ri(3,6):2,.3,1.4,(px,pz)=>tuft('beachgrass',px,Y(px,pz),pz,h*rr(.8,1.2),h,leafCol(PAL.beachgrass,1.2,.02,.06,.05),.15));}
function wrack(x,y,z,lv){const s=rr(.4,1.1);BIO.put('wrack',[x,y+.02,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[s*rr(1.2,2.2),1,s],lc('wrack',leafCol(PAL.wrack,1,.02,.06,.05)));}
function drift(x,y,z){const a=rr(0,TAU),L=rr(1.5,5),r=rr(.08,.22),ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;BIO.beam('drift',[x,y+r*.6,z],[ex,Y(ex,ez)+r*.6,ez],r,r*.8,tint(pick(PAL.drift),means().wood,1));}
// the forest
function fern(x,y,z,lv,k){const n=lv===2?ri(5,8):3,L=rr(.6,1.3)*(k||1),c=C(pick(PAL.fern));for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.3,.3);BIO.put('fern',[x,y+.05,z],qEuler(rr(-.1,.1),-a,rr(.25,.7)),[L,L*.8,L*rr(.9,1.2)],lc('fern',bright(vary(c,.02,.06,.06),1.25)));}}
function ginger(x,y,z,lv){const h=rr(1.2,2.2);around(x,z,lv===2?ri(2,4):1,.3,.9,(px,pz)=>{const py=Y(px,pz),hh=h*rr(.8,1.1);BIO.beam('rod',[px,py-.05,pz],[px,py+hh*.6,pz],.03,.025,C(pick(PAL.ginger)));
  for(let k=0;k<3;k++){const a=rr(0,TAU);BIO.put('gingerleaf',[px,py+hh*rr(.3,.6),pz],qEuler(rr(-.1,.1),-a,rr(.3,.7)),[hh*.5,hh*.4,hh*.18],leafCol(PAL.ginger,1.2,.02,.06,.05),{n:[0,1,0]});}
  if(rng()<.6)BIO.put('gingerbloom',[px,py+hh*.62,pz],qEuler(0,rr(0,TAU),0),[.12,.3,.12],C(pick(PAL.gingerBloom)));});}
function aroid(x,y,z,lv){const n=lv===2?ri(3,6):2,h=rr(.9,1.8);for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.3,.3),s=h*rr(.6,.9);
 BIO.put('aroid',[x+Math.cos(a)*.15,y+h*rr(.25,.45),z+Math.sin(a)*.15],qEuler(-rr(.4,.9),-a+Math.PI/2,0),[s*.9,s,s],leafCol(PAL.aroid,1.15,.02,.06,.05));}}
// the water
function seagrass(x,y,z,lv){const h=rr(.25,.6);around(x,z,lv===2?ri(3,6):2,.2,1.1,(px,pz)=>tuft('seagrass',px,Y(px,pz),pz,h*rr(.8,1.2),h*.9,leafCol(PAL.seagrass,1.1,.02,.06,.05),.2));}
function coral(x,y,z,lv,dense){const t=rng();
 if(t<.42){const r=rr(.35,1.3)*(dense?1.2:1);BIO.put('brain',[x,y-r*.15,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[r,r*rr(.8,1.1),r],tint(pick(rng()<.75?PAL.coralBrain:PAL.coralGold),means().coral,rr(.8,1.05)));}
 else if(t<.78){const n=lv===2?ri(2,5):1;around(x,z,n,.2,.9,(px,pz)=>{const h=rr(.35,.9);tuft('branchcoral',px,Y(px,pz)-.05,pz,h,h*rr(1,1.5),lc('branchcoral',leafCol(pick([PAL.coralRose,PAL.coralTeal,PAL.coralViolet,PAL.coralGold]),1.1,.02,.06,.05)),.15);});}
 else if(t<.88){const r=rr(.5,1.4);BIO.put('tablecoral',[x,y-.1,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[r,r*rr(.5,.8),r],tint(pick(PAL.coralTeal),means().coral,rr(.8,1)));}
 else{for(let i=0,n=ri(2,5);i<n;i++){const r=rr(.08,.25),px=x+rr(-1,1),pz=z+rr(-1,1);BIO.put('rubble',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r,r*.6,r],tint(pick(PAL.coralDead),means().rock,rr(.9,1.1)));}}}
function pool(x,y,z,lv){const t=rng();
 if(t<.45){const h=rr(.06,.14);tuft('anemone',x,y,z,h,h*1.4,C(pick(PAL.anemone)),.2);}
 else if(t<.75){const s=rr(.05,.09);BIO.put('urchin',[x,y+s*.4,z],qEuler(0,rr(0,TAU),0),s,C(pick(PAL.urchin)));}
 else{for(let i=0,n=ri(2,5);i<n;i++){const s=rr(.025,.045),px=x+rr(-.4,.4),pz=z+rr(-.4,.4);BIO.put('limpet',[px,Y(px,pz)-.005,pz],null,[s*2,s,s*2],C(pick(PAL.limpet)));}}}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix
function plantForest(x,y,z,Z,lv,st){const t=rng(),xa=Z.xaShare;
 if(t<.36){fern(x,y,z,lv,1+.4*xa);st.ferns++;}else if(t<.52){ginger(x,y,z,lv);st.gingers++;}else if(t<.66+.1*xa){aroid(x,y,z,lv);st.aroids++;}
 else if(t<.8){fern(x,y,z,lv,.7);st.ferns++;}}
function plantSavanna(x,y,z,Z,lv,st){const t=rng(),k=1+.55*(Z.xv/(Z.sav||1));
 if(t<.8){const s=savGrass(x,y,z,lv,Z,k);st.grass++;st[s]=(st[s]||0)+1;}
 else if(t<.9){if(Z.burn.black<.5){thornbush(x,y,z,lv,1);st.thornbush++;}}
 else if(t<.935){if(lv>=1&&!blocked(x,z,2)){mound(x,y,z,lv,Z.xv>Z.aw);st.mounds++;}}
 else if(t<.97){stone(x,y,z,lv);st.stones++;}}
function plantSteppe(x,y,z,Z,lv,st){const t=rng(),xs=Z.xs/(Z.step||1);
 if(t<.58){bunch(x,y,z,lv,Z.burn.cured+Z.burn.green*.5>.4);st.bunch++;}
 else if(t<.72){thornbush(x,y,z,lv,.7);st.thornbush++;}
 else if(t<.72+.14*xs){saltbush(x,y,z,lv);st.saltbush++;}
 else if(t<.92){stone(x,y,z,lv,PAL.reefRock);st.stones++;}
 else if(lv>=1&&!blocked(x,z,2)&&rng()<.4){mound(x,y,z,lv,false);st.mounds++;}}
function plantSalt(x,y,z,Z,lv,st){const e=Z.panEdge,mid=Z.pan*(1-e);
 if(rng()<e){samphire(x,y,z,lv,rng()<.4);st.samphire++;if(rng()<.2){saltbush(x,y,z,lv);st.saltbush++;}}
 else if(rng()<mid*.6){crust(x,y,z,lv);st.crust++;}}
function plantStrand(x,y,z,Z,lv,st){const t=rng(),d=Z.dune;
 if(t<.32-.15*d){creeper(x,y,z,lv);st.creepers++;}
 else if(t<.55+.25*d){beachgrass(x,y,z,lv);st.beachgrass++;}
 else if(t<.75){naupaka(x,y,z,lv);st.naupaka++;}
 else if(t<.8&&lv>=1){drift(x,y,z);st.drift++;}}

// ---------------------------------------------------------------- the pass
RINGISLES.FLOOR_ZONES=['forest','savanna','steppe','salt','strand'];
const PLANTERS=[plantForest,plantSavanna,plantSteppe,plantSalt,plantStrand];
RINGISLES.floorWeights=Z=>[Z.forest*1.2,Z.sav*1.45,Z.step*1.2,(Z.pan+Z.panEdge)*1.2,(Z.strand+Z.dune)*1.3];
RINGISLES.buildFloor=function(R,q){reseed(600071);q=q==null?1:q;R=R||2000;means();
 const st={ferns:0,gingers:0,aroids:0,grass:0,black:0,flush:0,green:0,cured:0,thornbush:0,mounds:0,stones:0,bunch:0,saltbush:0,samphire:0,crust:0,
  creepers:0,beachgrass:0,naupaka:0,drift:0,wrack:0,seagrass:0,coral:0,pools:0,lianas:0,epiphytes:0};
 function plant(x,y,z,lv){if(blocked(x,z,.5))return;const Z=zones(x,z);if(Z.cliff>.6||Z.live<.3)return;
  const w=RINGISLES.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=.02)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.radii(),bands=[[3.5,L.floor[0],0],[7,L.floor[1],L.floor[0]],[15,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .75*q*(lv===0?.55:1);},(x,y,z)=>plant(x,y,z,lv),{patch:.55,patchScale:.014,pad:.4,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE SAVANNA'S CARPET: a close grid of single tufts over the savanna (the zone planters' clumps are too sparse for tall grass)
 BIO.grid(2.4,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return Z.sav*.8*q*(1-Z.burn.black*.7);},
  (x,y,z)=>{if(blocked(x,z,.4))return;const Z=zones(x,z);if(Z.live<.3)return;const s=savGrass(x,y,z,1,Z,1+.55*(Z.xv/(Z.sav||1)));st.grass++;st[s]=(st[s]||0)+1;},{patch:.35,patchScale:.02,pad:.3});
 // THE WRACK LINE: along the high-water mark, the cast-up seaweed in a band (the ground 0.25-0.7 m over the sea)
 BIO.grid(1.6,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);if(Z.strand<.3)return 0;const h=Y(x,z);return .9*q*smooth(.15,.3,h)*smooth(.8,.5,h);},
  (x,y,z)=>{wrack(x,y,z,2);st.wrack++;},{patch:.5,patchScale:.03,pad:.2});
 // THE LAGOON: seagrass in meadows on the sand (0.4-3.5 m of water), coral heads scattered, thicker toward the reef
 BIO.grid(3,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return Z.lagoon*.85*q*smooth(.35,.6,fbm(x*.012,z*.012,7601,2));},
  (x,y,z)=>{seagrass(x,y,z,BIO.lodD(x,z)<L.floor[0]?2:1);st.seagrass++;},{noMask:true,depth:[.35,3.6],patch:.4,patchScale:.03,pad:.2});
 BIO.grid(5,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;const Z=zones(x,z);return (Z.lagoon*.12+Z.reef*.75)*q;},
  (x,y,z)=>{coral(x,y,z,BIO.lodD(x,z)<L.floor[0]?2:1,zones(x,z).reef>.5);st.coral++;},{noMask:true,depth:[.2,6],patch:.5,patchScale:.02,pad:.3});
 // the fore reef: table corals and heads down the drop
 BIO.grid(7,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;const d=BIO.depth(x,z);return smooth(1,3,d)*smooth(12,6,d)*.5*q;},
  (x,y,z)=>{coral(x,y,z,1,true);st.coral++;},{noMask:true,depth:[1,12],patch:.5,pad:.5});
 // THE BENCH: the tide pools' life, in the pools and on the wet rock round them
 BIO.grid(.9,0,R,(x,z)=>{const Z=zones(x,z);return Z.bench*.6*q;},(x,y,z)=>{pool(x,Math.max(y,y),z,2);st.pools++;},{noMask:true,depth:[-.4,.7],patch:.3,pad:0,box:BIO.window('bench')});
 return{under:st};};

// ---------------------------------------------------------------- the forest's dressing (after the trees): lianas and epiphytes
// The XA forest (and a little of Af): lianas hung from the crowns of the tall trees, bromeliads and moss in their forks
RINGISLES.buildDressing=function(q){reseed(610071);q=q==null?1:q;const st={lianas:0,epiphytes:0};
 for(const T of RINGISLES.TREES){if(T.lv==null||T.lv<1||T.H<9)continue;const Z=zones(T.x,T.z),k=Z.xa*1+Z.af*.25;if(k<=.05||rng()>k*q)continue;
  const R=T.crownR||3,top=T.y0+T.H*.82;
  for(let i=0,n=T.lv===2?ri(2,6):2;i<n;i++){const a=rr(0,TAU),d=R*rr(.3,.85),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,gy=Y(x,z),y=top-rr(0,T.H*.15),L=Math.max(1.5,(y-gy)*rr(.45,.95));
   BIO.put('liana',[x,y,z],qEuler(0,rr(0,TAU),0),[rr(.5,.9),L,1],lc('liana',leafCol(PAL.liana,1.15,.02,.06,.05)));st.lianas++;}
  for(let i=0,n=T.lv===2?ri(2,5):1;i<n;i++){const y=T.y0+T.H*rr(.35,.75),a=rr(0,TAU),r=(T.rb||.3)*1.1,s=rr(.35,.7);
   BIO.put(rng()<.6?'epiphyte':'mossclump',[T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.8,s],lc('epiphyte',leafCol(PAL.epiphyte,1.15,.03,.08,.05)),{n:[0,1,0]});st.epiphytes++;}}
 return st;};
})();
