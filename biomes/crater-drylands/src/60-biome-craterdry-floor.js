// ================================================================= CRATER DRYLANDS — floor
// Everything under the trees, by zone and by the age of the burn (CRATERDRY.zones):
//   CHAR      the first months: grey-white ash, black debris, the charred skeletons of shrubs, burnt stubble,
//             stones; FIRE LILIES flowering red straight out of the char, the first green resprouts
//   BLOOM     half a year to ~2.5: the frenzy. Drifts of fireweed (pink), ash poppies (orange), lupine (violet),
//             goldfields (yellow) and flame plumes (crimson), each drift its own colour, over a green flush of grass
//             and resprouting shrubs; the odd charred skeleton still standing
//   REGROW    ~2.5 to ~7: young chaparral, ash broom in yellow, crater proteas, red buckwheat, bunchgrass
//   MATURE    older: dense old chaparral, straw-dry grass, litter and dead wood (the fuel of the next fire)
//   KOP       the granite: boulder piles, propeller crassula in the cracks, prism ferns in the shaded clefts, lichen
//   WASH      cobbles, prism ferns in the bank's shade, sedge, poppies, green grass
//   SEEP      reeds, ferns, green grass, flowers
// Three LOD bands along the spine at 9 / 18 / 36 m cells; then the superbloom's carpet (a close grid of flowers near
// the spine), the kopjes' boulder piles, and the burnt logs.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=CRATERDRY.PAL,zones=CRATERDRY.zones,blocked=CRATERDRY.blocked,C=CRATERDRY.C;
const {bright,shade,vary,tint,means,leafCol}=CRATERDRY;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.granite),.02,.06,.06),means().rock,k==null?rr(.45,.7):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const blooms=(x,y,z,r,n,set,sz)=>CRATERDRY.blooms(x,y,z,r,n,set,sz,{flat:true,tilt:.4,s0:.14,s1:.3});
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};

// ---------------------------------------------------------------- fields local to the floor
// which flower holds a drift of the bloom: one colour per patch, so the bloom reads as drifts and not confetti
const BLOOM_SETS=[['fireweed',PAL.fireweed],['poppy',PAL.poppy],['lupine',PAL.lupine],['goldfield',PAL.goldfield],['celosia',PAL.celosia]];
const driftOf=(x,z)=>{const v=fbm(x*.011+4,z*.011-2,4343,2),w=fbm(x*.004-9,z*.004+3,4344,2);return Math.floor(clamp(v*1.5-.25+w*.6-.3,0,.999)*BLOOM_SETS.length);};
CRATERDRY.driftOf=driftOf;CRATERDRY.BLOOM_SETS=BLOOM_SETS;
const chapK=(x,z)=>fbm(x*.008+11,z*.008-5,4141,2);                       // the chaparral's density

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){BIO.put(item,[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
function grass(x,y,z,lv,set,k){const h=rr(.3,.7)*(k||1)*(lv===0?1.6:1);around(x,z,lv===2?ri(3,6):lv===1?2:1,.4,1.6,(px,pz)=>tuft('grass',px,y,pz,h*rr(.8,1.15),h*1.5,leafCol(set||PAL.grass,1.25,.04,.12,.06)));}
function bunch(x,y,z,lv,set){const h=rr(.35,.85)*(lv===0?1.6:1);around(x,z,lv===2?ri(2,4):1,.4,1.4,(px,pz)=>tuft('bunch',px,y,pz,h*rr(.8,1.1),h*1.2,leafCol(set||PAL.straw,1.25,.03)));}
// a CHAPARRAL shrub: a dark mass under a head of small leaves; old ones big and dusty
function chap(x,y,z,lv,k,set){const hc=vary(pick(set||PAL.chap),.03,.08,.05),Rs=rr(.6,1.3)*(k||1);
 if(lv>=1)BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[Rs*.75,Rs*.6,Rs*.75],shade(hc,-.35));
 for(let i=0,m=lv===2?ri(1,3):1;i<m;i++){const a=rr(0,TAU),d=i?Rs*rr(.25,.5):0;card('small',x+Math.cos(a)*d,y+Rs*rr(.5,.75),z+Math.sin(a)*d,Rs*rr(1.1,1.4),Rs*rr(.6,.8),bright(vary(hc,.02,.06,.05),1.3),.25);}}
// a CHARRED SHRUB: the black twig skeleton a fire leaves of a bush, on a grey ash ring
function charred(x,y,z,lv,grey){const h=rr(.7,1.6);tuft(pick(['twigs','twigs1','twigs2','twigs3']),x,y,z,h,h*rr(.9,1.3),grey?tint(pick(PAL.deadwood),means().wood,rr(.8,1)):shade(C(pick(PAL.char)),.05));
 if(lv>=1&&!grey)BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[h*.8,1,h*.8],leafCol(PAL.ash,1.0,.01,.03,.04));}
function ash(x,y,z){const R=rr(.8,2.2);BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],leafCol(PAL.ash,1.0,.01,.03,.05));}
function debris(x,y,z,set){const R=rr(.8,1.8);BIO.put('litter',[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],leafCol(set||PAL.char,1.0,.02,.04,.03));}
// a FIRE LILY: a red trumpet on a bare stalk over a tuft of last year's straw (they come up out of the char)
function lily(x,y,z,lv){around(x,z,lv===2?ri(1,3):1,.3,.9,(px,pz)=>{const h=rr(.45,.8);
 if(lv===2)tuft('bunch',px,y,pz,h*.55,h*.8,leafCol([0xb89a60,0xa88a50],1.1,.02));tuft('lily',px,y,pz,h,h*.55,leafCol(PAL.lily,1.3,.02,.06,.05));});}
// a drift's flower, by its set: spikes for fireweed and lupine, plumes for the flame plume, flat blooms for the rest
function flower(x,y,z,lv,k){const [name,set]=BLOOM_SETS[k];
 if(name==='fireweed'||name==='lupine'){const h=name==='fireweed'?rr(.6,1.3):rr(.4,.8);around(x,z,lv===2?ri(2,5):1,.3,1.1,(px,pz)=>tuft(name==='lupine'?'lupine':'spike',px,y,pz,h*rr(.8,1.1),h*.5,leafCol(set,1.25,.02,.06,.05)));}
 else if(name==='celosia'){around(x,z,lv===2?ri(2,4):1,.3,.9,(px,pz)=>{const h=rr(.4,.8);tuft('plume',px,y,pz,h,h*.5,leafCol(set,1.25,.02,.06,.05));});}
 else blooms(x,y,z,rr(.6,1.4),lv===2?ri(5,10):2,set,name==='goldfield'?[.16,.28]:[.24,.4]);}
function broom(x,y,z,lv){const Rs=rr(.6,1.1);
 if(CRATERDRY.LIB.broom){card('broom',x,y+Rs*.5,z,Rs*1.5,Rs*.95,bright(C(0xffffff),rr(.9,1.05)),.2);if(lv===2)card('broom',x+rr(-.4,.4),y+Rs*.4,z+rr(-.4,.4),Rs*1.1,Rs*.8,bright(C(0xffffff),rr(.85,1)),.25);return;}
 card('small',x,y+Rs*.5,z,Rs*1.3,Rs*.9,leafCol([0x5a6a34,0x667a3a],1.2,.03),.2);
 if(lv>=1)for(let i=0,m=lv===2?ri(2,4):1;i<m;i++){const a=rr(0,TAU),d=Rs*rr(0,.45);tuft('plume',x+Math.cos(a)*d,y+Rs*.4,z+Math.sin(a)*d,Rs*rr(.6,.9),Rs*.6,leafCol(PAL.broom,1.25,.02,.06,.04));}}
function protea(x,y,z,lv){const Rs=rr(.5,.9);card('small',x,y+Rs*.45,z,Rs*1.3,Rs*.8,leafCol(PAL.proteaLeaf,1.2,.03),.2);
 if(lv>=1)for(let i=0,m=lv===2?ri(1,3):1;i<m;i++){const a=rr(0,TAU),d=Rs*rr(0,.4),s=rr(.16,.26);BIO.put('protea',[x+Math.cos(a)*d,y+Rs*rr(.75,1.0),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,leafCol(PAL.protea,1.15,.02,.05,.05));}}
function buck(x,y,z,lv,dry){const Rs=rr(.3,.6);card('small',x,y+Rs*.4,z,Rs*1.4,Rs*.6,leafCol(dry?PAL.chapDry:PAL.buckLeaf,1.2,.02),.2);
 if(lv>=1)blooms(x,y+Rs*.7,z,Rs*.8,lv===2?ri(5,10):3,dry?[0x8a4a2a,0x7a3e24]:PAL.buck,[.1,.18]);}
function crassula(x,y,z,lv){around(x,z,lv===2?ri(1,3):1,.3,1,(px,pz)=>{const s=rr(.18,.4);BIO.put('crassula',[px,Y(px,pz)-.02,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*rr(.9,1.3),s],bright(C(0xffffff),rr(.95,1.15)));});}
// a PRISM FERN: a low tuft of lacy blue-violet fronds that turn copper and violet at an angle (iridescent: aC2)
function fern(x,y,z,lv){const n=lv===2?ri(5,8):3,L=rr(.5,1.0),lib=CRATERDRY.LIB.fern,base=lib?C(0xd8dcff):C(pick(PAL.fernIrid)),c2=lib?C(pick([0xffd0a0,0xf0c0ff])):C(pick(PAL.fernIrid2));
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3),pitch=rr(.15,.5);BIO.put('irisfern',[x,y+.05,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*.8,L*rr(.9,1.2)],bright(vary(base,.02,.05,.05),1.3),{n:[Math.cos(a)*.3,1,Math.sin(a)*.3],c2:bright(c2,1.2)});}}
function lichen(x,y,z){const R=rr(.3,.9);BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,1,R],leafCol(PAL.lichen,1.05,.02));}
function reed(x,y,z,lv){const h=rr(1.2,2.2)*(lv===0?1.5:1);around(x,z,lv===2?ri(2,4):lv===1?2:1,.6,2,(hx,hz)=>tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.0),leafCol(PAL.reed,1.3,.025)));}
function stone(x,y,z,lv,set,st,k){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5)*(k||1);
 if(putRooted(px,pz,'stone',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(set)))st.stones++;});}
function boulder(x,y,z,lv,st,big){const Rb=rr(.8,2.4)*(big||1);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.3,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.6,.95);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(PAL.granite));if(ok)st.boulders++;
  if(ok&&lv===2&&rng()<.35)BIO.put('lichen',[bx+rr(-.2,.2)*r,by+h*1.02,bz+rr(-.2,.2)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.4,.8),leafCol(PAL.lichen,1.1,.02));});}
// a fallen log, charred black (fresh) or weathered silver (old), along the ground
function log(x,y,z,st,grey){const a=rr(0,TAU),L=rr(4,11),r0=rr(.18,.38),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/3)+1,pts=[];
 const col=grey?tint(pick(PAL.deadwood),means().wood,rr(.8,1.0)):tint(pick(PAL.char),means().wood,rr(.9,1.1));
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.5+Math.sin(t*Math.PI)*.12,z:pz,r:mix(r0,r0*.5,t),col:col});}
 BIO.tube('wood',pts,col,{seg:6,cap:true});st.logs++;
 for(let k=0,m=ri(1,3);k<m;k++){const i=ri(1,n-2),p=pts[i],b=rr(0,TAU),el=rr(.3,1.1),Ls=rr(.5,1.5);BIO.beam('rod',[p.x,p.y,p.z],[p.x+Math.cos(b)*Math.cos(el)*Ls,p.y+Math.sin(el)*Ls,p.z+Math.sin(b)*Math.cos(el)*Ls],p.r*.5,.04,shade(col,-.1));}
 if(!grey)ash(x,Y(x,z),z);
 return true;}
CRATERDRY.small={tuft,card,grass,bunch,chap,flower};

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantChar(x,y,z,Z,lv,st){const t=rng(),a=Z.age;
 if(t<.22){ash(x,y,z);st.ash++;}
 else if(t<.38){debris(x,y,z);st.ash++;}
 else if(t<.58){charred(x,y,z,lv);st.charred++;}
 else if(t<.66+.12*smooth(.06,.3,a)){if(a>.06){lily(x,y,z,lv);st.lilies++;}else{debris(x,y,z);st.ash++;}}
 else if(t<.78){bunch(x,y,z,lv,PAL.char);st.tufts++;}
 else if(t<.86&&a>.2){grass(x,y,z,lv,PAL.grass,.5);st.resprouts++;}
 else{stone(x,y,z,lv,PAL.granite,st);}}
function plantBloom(x,y,z,Z,lv,st){const t=rng(),k=driftOf(x,z);
 if(t<.42){flower(x,y,z,lv,k);st.flowers++;}
 else if(t<.5){flower(x,y,z,lv,ri(0,BLOOM_SETS.length-1));st.flowers++;}
 else if(t<.72){grass(x,y,z,lv);st.tufts++;}
 else if(t<.84){chap(x,y,z,lv,.55,PAL.grass);st.resprouts++;}
 else if(t<.9){charred(x,y,z,lv,Z.age>1.4);st.charred++;}
 else if(t<.95){debris(x,y,z,PAL.char);st.ash++;}
 else{stone(x,y,z,lv,PAL.granite,st);}}
function plantRegrow(x,y,z,Z,lv,st){const t=rng(),ck=chapK(x,z);
 if(t<.3+.15*ck){chap(x,y,z,lv,.8);st.shrubs++;}
 else if(t<.52){broom(x,y,z,lv);st.shrubs++;}
 else if(t<.6){protea(x,y,z,lv);st.flowers++;}
 else if(t<.7){buck(x,y,z,lv);st.shrubs++;}
 else if(t<.86){bunch(x,y,z,lv,rng()<.5?PAL.grass:PAL.straw);st.tufts++;}
 else if(t<.9){flower(x,y,z,lv,driftOf(x,z));st.flowers++;}
 else{stone(x,y,z,lv,PAL.granite,st);}}
function plantMature(x,y,z,Z,lv,st){const t=rng(),ck=chapK(x,z);
 if(t<.42+.2*ck){chap(x,y,z,lv,rr(1,1.5),rng()<.4?PAL.chapDry:PAL.chap);st.shrubs++;}
 else if(t<.66){bunch(x,y,z,lv,PAL.straw);st.tufts++;}
 else if(t<.74){debris(x,y,z,[0x8a6a4a,0x7a5a3e,0x9a7a52]);st.litter++;}
 else if(t<.8){charred(x,y,z,lv,true);st.charred++;}
 else if(t<.86){buck(x,y,z,lv,true);st.shrubs++;}
 else if(t<.9){protea(x,y,z,lv);st.flowers++;}
 else{stone(x,y,z,lv,PAL.granite,st);}}
function plantKop(x,y,z,Z,lv,st){const t=rng(),cleft=smooth(.12,.3,Z.wet)*smooth(.4,.8,Z.slope);
 if(t<.28){boulder(x,y,z,lv,st,1.2);}
 else if(t<.46){crassula(x,y,z,lv);st.crassula++;}
 else if(t<.46+.18*(.4+cleft)){fern(x,y,z,lv);st.ferns++;}
 else if(t<.74){lichen(x,y,z);st.lichen++;}
 else if(t<.86){grass(x,y,z,lv,PAL.straw,.7);st.tufts++;}
 else{stone(x,y,z,lv,PAL.granite,st);}}
function plantWash(x,y,z,Z,lv,st){const t=rng();
 if(t<.22){stone(x,y,z,lv,PAL.granite,st,.7);}
 else if(t<.36){fern(x,y,z,lv);st.ferns++;}
 else if(t<.58){grass(x,y,z,lv);st.tufts++;}
 else if(t<.7){flower(x,y,z,lv,1);st.flowers++;}
 else if(t<.82){chap(x,y,z,lv,.7);st.shrubs++;}
 else{bunch(x,y,z,lv,PAL.straw);st.tufts++;}}
function plantSeep(x,y,z,Z,lv,st){const t=rng();
 if(t<.35){reed(x,y,z,lv);st.reeds++;}
 else if(t<.55){fern(x,y,z,lv);st.ferns++;}
 else if(t<.85){grass(x,y,z,lv,PAL.grass,1.2);st.tufts++;}
 else{flower(x,y,z,lv,ri(0,BLOOM_SETS.length-1));st.flowers++;}}

// ---------------------------------------------------------------- the pass
CRATERDRY.FLOOR_ZONES=['char','bloom','regrow','mature','kop','wash','seep'];
const PLANTERS=[plantChar,plantBloom,plantRegrow,plantMature,plantKop,plantWash,plantSeep];
CRATERDRY.floorWeights=Z=>[Z.char*.85,Z.bloom*1.5,Z.regrow*1.45,Z.mature*1.2,Z.kop*.9,Z.wash*.9,Z.seep*1.4];
CRATERDRY.buildFloor=function(R,q){
 reseed(600031);q=q==null?1:q;R=R||2500;means();
 const st={tufts:0,shrubs:0,flowers:0,carpet:0,lilies:0,resprouts:0,charred:0,ash:0,litter:0,crassula:0,ferns:0,lichen:0,reeds:0,stones:0,boulders:0,logs:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.cliff>.6)return;
  const w=CRATERDRY.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[9,L.floor[0],0],[18,L.floor[1],L.floor[0]],[36,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .7*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.6,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE SUPERBLOOM's carpet: a close grid of flowers in the bloom near the spine, the drift's colour, cheap flat blooms
 BIO.grid(3.6,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return Z.bloom*.75*q*smooth(1.6,.8,Math.abs(Z.age-1.3));},
  (x,y,z,d)=>{if(blocked(x,z,.4))return;const k=driftOf(x,z),lv=BIO.lodD(x,z)<L.floor[0]?2:1;
   if(lv===2&&rng()<.5)flower(x,y,z,1,k);else blooms(x,y,z,rr(.5,1.1),lv===2?ri(3,6):ri(2,3),BLOOM_SETS[k][1],[.26,.46]);st.carpet++;},
  {patch:.4,patchScale:.02,pad:.4,box:BIO.originBox(L.floor[1])});
 // the kopjes' boulder piles: big rounded granite blocks heaped on the tors and their aprons
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return (Z.kop*.55+smooth(.15,.35,Z.rock)*(1-Z.kop)*.25)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(1.3,2.4));},{patch:.3,pad:1});
 // the burnt logs: black in the char and the bloom, silver in the old scrub
 BIO.grid(34,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return (Z.char*.6+Z.bloom*.45+Z.mature*.15)*q;},
  (x,y,z,d)=>{const Z=zones(x,z),grey=Z.age>2.2;for(let t=0;t<4;t++)if(log(x+rr(-12,12),y,z+rr(-12,12),st,grey))break;},{patch:0,pad:2});
 // reeds standing in the seep's shallows
 BIO.grid(3,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .5*q*smooth(1.0,.3,BIO.depth(x,z));},
  (x,y,z,d)=>{reed(x,Math.max(y,BIO.waterH(x,z)-.4),z,2);st.reeds++;},{patch:.6,patchScale:.03,noMask:true,depth:[-.1,.9],pad:1,box:BIO.window('water')});
 return{under:st};};
})();
