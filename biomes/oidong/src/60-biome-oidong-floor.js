// ================================================================= OIDONG VALLEY — floor
// Everything under the trees, by zone (OIDONG.zones):
//   MOSS      moss over everything: mats and cushions, mossed stones, ferns, moon caps in rings, ginseng, coin vines on the
//             fallen wood; the valley's garden floor
//   MEADOW    short grass, box domes that look clipped, sky poppies in drifts, tea bushes, the odd mossed stone
//   SHORE     reeds and iris, moss, pebbles; lotus pads, lotus flowers and seed heads, iridescent lilies on the water
//   FLATS     the pale gravel: peyote buttons flush with it, stone-blooms, monk's sage, the standing stones in odd groups
//   BAMBOO    bamboo shoots, moss, a few ferns
//   TERRACE   tea, sky poppies, grass, stones; snow lotus where it is cold
//   MIST      ferns, moss, moon caps, mossed boulders
//   STREAM    iris, ferns, moss, stones
// Three LOD bands along the spine at 8 / 16 / 32 m cells; then the water, the standing stones and the fallen wood.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=OIDONG.PAL,zones=OIDONG.zones,blocked=OIDONG.blocked,C=OIDONG.C,GOLD=OIDONG.GOLD;
const {bright,shade,vary,tint,means,leafCol,nearW}=OIDONG;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.granite),.02,.05,.05),means().rock,k==null?rr(.5,.75):k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};
OIDONG.STONES=[];   // the standing-stone groups: {x,z,n,r}

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function mossMat(x,y,z,set,k){const R=rr(.8,2.2)*(k||1);BIO.put('mossmat',[x,y+.04,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,1,R],leafCol(set||PAL.moss,1.15,.03,.08,.06));}
function cushion(x,y,z,set,k){const R=rr(.3,.8)*(k||1);BIO.put('lobe',[x,y-.08,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.45,.7),R],leafCol(set||PAL.moss,1.1,.03,.08,.06));}
function grass(x,y,z,lv,set,k){const h=rr(.35,.78)*(k||1)*(lv===0?1.6:1),n=lv===2?ri(4,7):lv===1?3:2;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.7):0;tuft('grass',x+Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d),z+Math.sin(a)*d,h*rr(.8,1.15),h*1.45,leafCol(set||PAL.sage,1.25,.03));}}
function fern(x,y,z,lv,k){const n=lv===2?ri(7,11):5,L=rr(.68,1.42)*(k||1),hc=leafCol(PAL.celadon,1.2,.03,.08,.05),a0=rr(0,TAU);
 for(let i=0;i<n;i++){const a=a0+i*GOLD;BIO.put('fern',[x,y+.03,z],qEuler(rr(-.08,.08),-a,rr(.2,.68)),[L,L,L*rr(.34,.45)],bright(vary(hc,.02,.05,.05),rr(.95,1.12)));}}
function mooncaps(x,y,z,lv,n,r){const col=bright(C(pick(PAL.mooncap)),1.05);for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.14,.34);
 {const cd=OIDONG.CARD.mooncapcard;BIO.put('mooncap',[px,Y(px,pz)-.02,pz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),cd?[h*.55,h*1.1,h*.55]:[h*.9,h,h*.9],cd?nearW(rr(.95,1.08)):vary(col,.02,.05,.04));}}}
function box(x,y,z,lv){const R=rr(.55,1.35),hc=vary(pick(PAL.jade),.02,.05,.04);
 BIO.put('boxdome',[x,y+R*.35,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.65,.85),R],bright(hc,rr(1.05,1.2)));
 for(let f=0,nf=lv===2?3:1;f<nf;f++){const fa=rr(0,TAU);BIO.put('teabush',[x+Math.cos(fa)*R*.65,y+R*.45,z+Math.sin(fa)*R*.65],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R*.75,R*.55,R*.75],bright(hc,1.15),{n:[0,1,0]});}
 if(lv===2&&rng()<.5){const R2=R*rr(.5,.8),a=rr(0,TAU);BIO.put('boxdome',[x+Math.cos(a)*R,Y(x+Math.cos(a)*R,z+Math.sin(a)*R)+R2*.3,z+Math.sin(a)*R],qEuler(0,rr(0,TAU),0),[R2,R2*.8,R2],bright(hc,1.1));}}
function teaBush(x,y,z,lv){const R=rr(.55,.98),hc=vary(pick(PAL.celadon),.02,.05,.04);BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[R,R*.8,R],shade(hc,-.3));
 for(let k=0,m=lv===2?6:3;k<m;k++){const a=rr(0,TAU),d=R*.48;BIO.put('teabush',[x+Math.cos(a)*d,y+R*.55,z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R*1.1,R*.72,R*1.1],bright(hc,1.2),{n:[0,1,0]});}}
// the sky poppies: a drift of powder-blue blooms on short stems, iridescent at the edges
function poppies(x,y,z,lv,n,r){const col=bright(C(pick(PAL.poppy)),1.1);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d,fy=Y(fx,fz),h=rr(.3,.7),s=rr(.2,.34);
  if(lv===2)BIO.beam('rod',[fx,fy,fz],[fx,fy+h,fz],.012,.012,shade(C(0x7a9a6a),-.3));
  BIO.put('poppy',[fx,fy+h,fz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,vary(col,.02,.05,.04),{c2:bright(C(pick(PAL.irid.lily)),1.0)});}}
function snowLotus(x,y,z,lv){const s=rr(.25,.45);BIO.put('snowlotus',[x,y+.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*.8,s],nearW(1.02));}
function ginseng(x,y,z,lv){const s=rr(.35,.6);BIO.put('ginseng',[x,y+s*.4,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.4,s*.8,s*1.4],leafCol(PAL.jade,1.2,.02),{n:[0,1,0]});
 if(lv===2)for(let k=0,m=ri(4,8);k<m;k++)BIO.put('ball',[x+rr(-.08,.08),y+s*.75+rr(-.03,.03),z+rr(-.08,.08)],null,.025,bright(C(pick(PAL.coral)),1.1));}
function sage(x,y,z,lv){const h=rr(.32,.65),n=lv===2?ri(3,5):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,.85):0;tuft('sagebush',x+Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d),z+Math.sin(a)*d,h*rr(.8,1.1),h*2,leafCol(PAL.sage,1.2,.02));}}
function peyote(x,y,z,lv){const n=lv===2?ri(1,3):1;around(x,z,n,.4,1.2,(px,pz)=>{const s=rr(.25,.5);{const cd=OIDONG.CARD.peyotecard;BIO.put('peyote',[px,Y(px,pz)+(cd?.04:-.03),pz],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),cd?[s*2.8,s*2.8,s*2.8]:[s,s,s],cd?nearW(rr(.95,1.08)):leafCol(PAL.peyote,1.05,.02,.05,.03));}});}
function stoneBloom(x,y,z,lv){const n=lv===2?ri(1,3):1;around(x,z,n,.3,.9,(px,pz)=>{const s=rr(.14,.28),c=rockTint(PAL.sand,rr(.7,.95)).lerp(C(pick(PAL.lavender)),.25);
 BIO.put('stonebloom',[px,Y(px,pz)-.02,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s,s],c);
 if(lv===2)BIO.put('daisy',[px,Y(px,pz)+s*.45,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),s*.9,bright(C(pick(PAL.blush)),1.15));});}
function iris(x,y,z,lv){const h=rr(.65,1.18),n=lv===2?ri(2,3):2;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.25,.7):0,ix=x+Math.cos(a)*d,iz=z+Math.sin(a)*d,iy=Y(ix,iz);
  tuft('blade',ix,iy,iz,h*rr(.85,1.1),h*.72,leafCol(PAL.celadon,1.25,.02));
  if(lv>=1&&rng()<.55)BIO.put('poppy',[ix+rr(-.18,.18),iy+h*.95,iz+rr(-.18,.18)],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.15,.25),bright(C(pick(PAL.lavender)),1.15),{c2:bright(C(0x8a90e8),1.0)});}}
function reeds(x,y,z,lv){const h=rr(1.4,2.6)*(lv===0?1.5:1),n=lv===2?ri(4,7):lv===1?3:2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.2):0;tuft('reed',x+Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d),z+Math.sin(a)*d,h*rr(.8,1.1),h*.58,leafCol(PAL.jade,1.2,.02));}}
function shoots(x,y,z,lv){const n=lv===2?ri(3,5):2;around(x,z,n,.28,.95,(px,pz)=>{const h=rr(.20,.44),py=Y(px,pz);BIO.put('cone',[px,py-.04,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.20,h,h*.20],shade(vary(C(0x68643a),.02,.05,.04),-.18));if(lv>=1)tuft('blade',px,py,pz,h*.68,h*.48,leafCol(PAL.jade,1.08,.02));});}
function stone(x,y,z,lv,st,k,mossy){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5)*(k||1),py=Y(px,pz);
 if(putRooted(px,pz,'stone',[px,py+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(PAL.granite))){st.stones++;
  if(mossy&&lv===2)BIO.put('moss',[px,py+r*.75,pz],qEuler(0,rr(0,TAU),0),[r*1.6,r*.6,r*1.6],leafCol(PAL.moss,1.1,.03),{n:[0,1,0]});}});}
function boulder(x,y,z,lv,st,big,mossy){const Rb=rr(.8,2.2)*(big||1);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.3,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.6,.95);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(PAL.granite));if(ok)st.boulders++;
  if(ok&&mossy&&lv===2&&rng()<.7)BIO.put('moss',[bx+rr(-.2,.2)*r,by+h*1.02,bz+rr(-.2,.2)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[r*1.3,r*.5,r*1.3],leafCol(PAL.moss,1.15,.03),{n:[0,1,0]});});}
// a fallen trunk in the moss woods, furred with moss, a coin vine or two over it
function log(x,y,z,st){const a=rr(0,TAU),L=rr(5,13),r0=rr(.25,.5),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/3)+1,pts=[];
 const col=tint(pick([0xa89888,0x9a8a7a,0xb4a494]),means().wood,rr(.7,.9));
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||blocked(px,pz,1.2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.5+Math.sin(t*Math.PI)*.12,z:pz,r:mix(r0,r0*.6,t),col:col});}
 BIO.tube('wood',pts,col,{seg:6,cap:true});st.logs++;
 for(let i=0;i<n;i++){const p=pts[i];BIO.put('moss',[p.x,p.y+p.r*.7,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[p.r*3,p.r*1.1,p.r*3],leafCol(PAL.moss,1.15,.03,.08,.05),{n:[0,1,0]});}
 if(rng()<.5){const p=pts[1],Lc=rr(.6,1.4);BIO.put('coin',[p.x,p.y+p.r*.6,p.z],qEuler(0,rr(0,TAU),0),[Lc*.35,Lc,Lc*.35],leafCol(PAL.jade,1.2,.02));}
 return true;}
// a STANDING-STONE GROUP: three, five or seven stones (never an even number: the valley's rule), the tallest off centre,
// each on a skirt of moss or in a clear ring of gravel; the ground shader rakes ripples round them on the flats
function stoneGroup(x,z,lv,st,onFlats){const n=pick([3,3,5,5,7]),a0=rr(0,TAU),Rg=rr(2,5),ps=[];
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.4,.4),d=k?Rg*rr(.4,1):Rg*rr(0,.3),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  if(BIO.mask(px,pz)<=0||blocked(px,pz,1.5))return false;if(Math.abs(Y(px,pz)-Y(x,z))>1.2)return false;ps.push([px,pz]);}
 ps.forEach((p,k)=>{const py=Y(p[0],p[1]),h=(k===0?rr(1.6,3.2):rr(.6,1.8))*(onFlats?1:.8),w=h*rr(.35,.6);
  BIO.put('standing',[p[0],py-.15,p[1]],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w,h,w*rr(.8,1.2)],rockTint(PAL.darkStone,rr(.6,.85)));
  if(lv===2){if(onFlats){for(let s=0,m=ri(2,5);s<m;s++){const a=rr(0,TAU),d=w*rr(.6,1.4);BIO.put('stone',[p[0]+Math.cos(a)*d,py+.05,p[1]+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),rr(.08,.2),rockTint(PAL.granite));}}
   else BIO.put('mossmat',[p[0],py+.05,p[1]],qEuler(0,rr(0,TAU),0),w*rr(2,3),leafCol(PAL.moss,1.15,.03));}});
 OIDONG.STONES.push({x,z,n,r:Rg+1.5});st.groups++;return true;}
OIDONG.small={tuft,grass,fern,mooncaps,poppies};

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantMoss(x,y,z,Z,lv,st){const t=rng();
 if(t<.28){mossMat(x,y,z);fern(x+rr(-.5,.5),Y(x,z),z+rr(-.5,.5),lv,.75);st.moss++;st.ferns++;}
 else if(t<.48){fern(x,y,z,lv,1.1);st.ferns++;}
 else if(t<.60){cushion(x,y,z);st.moss++;}
 else if(t<.70){mooncaps(x,y,z,lv,lv===2?ri(4,8):3,rr(.6,1.4));st.caps++;}
 else if(t<.78){ginseng(x,y,z,lv);st.herbs++;}
 else if(t<.90){stone(x,y,z,lv,st,1,true);}
 else{mossMat(x,y,z,PAL.mossDark,1.35);st.moss++;}}
function plantMeadow(x,y,z,Z,lv,st){const t=rng();
 if(t<.38){grass(x,y,z,lv);st.grass++;}
 else if(t<.52){box(x,y,z,lv);st.boxes++;}
 else if(t<.68){poppies(x,y,z,lv,lv===2?ri(4,9):3,rr(.8,2.2));grass(x,y,z,lv,PAL.sage,.75);st.flowers++;st.grass++;}
 else if(t<.80){teaBush(x,y,z,lv);st.herbs++;}
 else if(t<.88){mossMat(x,y,z,PAL.mossPale,1.15);st.moss++;}
 else if(t<.94){stone(x,y,z,lv,st,.85,true);}
 else{grass(x,y,z,lv,PAL.gold,1.0);st.grass++;}}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.32){reeds(x,y,z,lv);st.reeds++;}
 else if(t<.56){iris(x,y,z,lv);st.reeds++;}
 else if(t<.72){mossMat(x,y,z);fern(x,y,z,lv,.7);st.moss++;st.ferns++;}
 else if(t<.84){stone(x,y,z,lv,st,.75,true);}
 else{fern(x,y,z,lv,.95);st.ferns++;}}
function plantFlats(x,y,z,Z,lv,st){const t=rng();
 if(t<.28){peyote(x,y,z,lv);st.peyote++;}
 else if(t<.48){stoneBloom(x,y,z,lv);st.flowers++;}
 else if(t<.70){sage(x,y,z,lv);st.herbs++;}
 else if(t<.86){stone(x,y,z,lv,st,.65,false);}
 else{grass(x,y,z,lv,PAL.sand,.65);st.grass++;}}
function plantBamboo(x,y,z,Z,lv,st){const t=rng();
 if(t<.42){shoots(x,y,z,lv);fern(x,y,z,lv,.65);st.shoots++;st.ferns++;}
 else if(t<.70){mossMat(x,y,z,PAL.mossPale,1.2);st.moss++;}
 else if(t<.88){fern(x,y,z,lv,.9);st.ferns++;}
 else{stone(x,y,z,lv,st,.75,true);}}
function plantTerrace(x,y,z,Z,lv,st){const t=rng(),cold=Z.cold>.62;
 if(cold&&t<.3){snowLotus(x,y,z,lv);st.herbs++;}
 else if(t<.42){teaBush(x,y,z,lv);st.herbs++;}
 else if(t<.62){poppies(x,y,z,lv,lv===2?ri(3,7):3,rr(.6,1.8));st.flowers++;}
 else if(t<.82){grass(x,y,z,lv,PAL.sage,.9);st.grass++;}
 else if(t<.92){stone(x,y,z,lv,st,.9,!cold);}
 else{cushion(x,y,z,PAL.mossPale,.9);st.moss++;}}
function plantMist(x,y,z,Z,lv,st){const t=rng();
 if(t<.40){fern(x,y,z,lv,1.2);st.ferns++;}
 else if(t<.64){mossMat(x,y,z,PAL.mossDark,1.3);st.moss++;}
 else if(t<.76){mooncaps(x,y,z,lv,lv===2?ri(3,6):2,rr(.5,1.2));st.caps++;}
 else if(t<.88){boulder(x,y,z,lv,st,1,true);}
 else{cushion(x,y,z,PAL.moss,1.35);st.moss++;}}
function plantStream(x,y,z,Z,lv,st){const t=rng();
 if(t<.34){iris(x,y,z,lv);st.reeds++;}
 else if(t<.58){fern(x,y,z,lv,1.0);st.ferns++;}
 else if(t<.78){mossMat(x,y,z);st.moss++;}
 else{stone(x,y,z,lv,st,.85,true);}}

// ---------------------------------------------------------------- the pass
OIDONG.FLOOR_ZONES=['moss','meadow','shore','flats','bamboo','terrace','mistZ','stream'];
const PLANTERS=[plantMoss,plantMeadow,plantShore,plantFlats,plantBamboo,plantTerrace,plantMist,plantStream];
OIDONG.floorWeights=Z=>[Z.moss*1.6,Z.meadow*1.25,Z.shore*1.5,Z.flats*.8,Z.bamboo*1.1,Z.terrace*1.05,Z.mistZ*1.5,Z.stream*1.7];
OIDONG.buildFloor=function(R,q){
 reseed(600019);q=q==null?1:q;R=R||2500;means();OIDONG.STONES.length=0;
 const st={moss:0,ferns:0,caps:0,herbs:0,grass:0,boxes:0,flowers:0,reeds:0,peyote:0,shoots:0,stones:0,boulders:0,logs:0,groups:0,lotus:0,lilies:0,pods:0};
 function plant(x,y,z,lv){if(blocked(x,z,.55))return;const Z=zones(x,z);if(Z.cliff>.6||Z.pool>.3)return;
  const w=OIDONG.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(.85,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[6,L.floor[0],0],[12,L.floor[1],L.floor[0]],[24,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .88*q*(lv===0?.55:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.45,patchScale:.014,pad:.45,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the still water: lotus pads, lotus flowers standing out of them, seed heads after the flowers, the iridescent lilies
 BIO.grid(5,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.mid)return 0;const dep=BIO.depth(x,z);if(dep<.15||dep>3.5)return 0;return .55*q*smooth(.42,.6,fbm(x*.007+1,z*.007-2,808,2));},
  (x,y,z,d)=>{if(!BIO.clearOf(x,z,.8)||blocked(x,z,1.2))return;const wl=BIO.waterH(x,z),lv=BIO.lodD(x,z)<L.hero?2:1,t=rng();
   if(t<.72){const R2=rr(.5,1.2);BIO.put('lilypad',[x,wl+.03,z],qEuler(rr(-.02,.02),rr(0,TAU),rr(-.02,.02)),[R2,1,R2],bright(vary(C(pick(PAL.jade)),.02,.05,.04),1.0));st.lotus++;
    const u=h3(x*.37,z*.37,4.1);
    if(u<.2){const col=bright(C(pick(PAL.blush.concat(PAL.ivory))),1.1),h=rr(.2,.7);BIO.put('cup',[x+rr(-.3,.3),wl+h,z+rr(-.3,.3)],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.35,.6),col);}
    else if(u<.4&&lv===2){const v=h3(x+1.7,z-2.3,9.7),a=v*TAU,s=.55+.35*h3(z,x,2.2);BIO.put('lotuspod',[x+Math.cos(a)*.35*R2,wl-.25,z+Math.sin(a)*.35*R2],qEuler(.25*(v-.5),a,.2*(u*3-.5)),s,C(0xffffff).multiplyScalar(.95+.15*v));st.pods++;}}
   else{const pr=pick(PAL.lilyPair),s=rr(.35,.6)*(OIDONG.CARD.lily?1.5:1);BIO.put('lilypad',[x,wl+.02,z],qEuler(0,rr(0,TAU),0),[s*1.2,1,s*1.2],bright(vary(C(pick(PAL.mossDark)),.02,.05,.04),1.0));
    BIO.put('lily',[x+rr(-.2,.2),wl+.08,z+rr(-.2,.2)],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),s,OIDONG.CARD.lily?nearW(rr(.95,1.08)):bright(C(pr[0]),1.1),{c2:OIDONG.CARD.lily?nearW(1):bright(C(pr[1]),1.15)});st.lilies++;}},
  {patch:.5,patchScale:.02,noMask:true,depth:[.15,3.5],pad:.4,box:BIO.window('water')});
 // the standing stones: in odd groups on the flats, in the moss lawns and the meadows
 BIO.grid(90,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return (Z.flats*.5+Z.moss*.22+Z.meadow*.18+Z.shore*.1)*q;},
  (x,y,z,d)=>{const Z=zones(x,z),lv=BIO.lodD(x,z)<L.hero?2:1;for(let t=0;t<3;t++)if(stoneGroup(x+rr(-12,12),z+rr(-12,12),lv,st,Z.flats>.4))break;},{patch:.2,pad:3});
 // fallen wood in the moss woods and the mist, mossed over
 BIO.grid(34,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return (Z.moss*.5+Z.mistZ*.4)*q;},
  (x,y,z,d)=>{for(let t=0;t<4;t++)if(log(x+rr(-10,10),y,z+rr(-10,10),st))break;},{patch:0,pad:2});
 // reeds standing in the pools' shallows
 BIO.grid(3,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .45*q*smooth(.9,.25,BIO.depth(x,z))*smooth(.5,.62,fbm(x*.01,z*.01,909,2));},
  (x,y,z,d)=>{tuft('reed',x,Math.max(y,BIO.waterH(x,z)-.35),z,rr(1.2,2.2),rr(.5,.8),leafCol(PAL.jade,1.2,.03));st.reeds++;},{patch:.5,patchScale:.03,noMask:true,depth:[-.1,.9],pad:1,box:BIO.window('water')});
 return{under:st};};

// ---------------------------------------------------------------- the high country (the passes station, PLAN-STATIONS.md; the Cold Hearths' cold ground)
// OIDONG.buildHigh(R, q, o): the cold desert over the valley on scale model 5.1 (the passes: ET, ~5,000 m, 141 mm, -8 degC; the north rim: Dsc, 4.3 km,
// 110 mm), above the last tree. Nothing the valley floor grows but its cold plants: CUSHION PLANTS (dense domes, silver-green, on the gravel, fewer as the
// cold deepens), the SNOW LOTUS in its true home among the stones, SKY POPPIES only in the damp hollows (the wet field: meltwater lies there), SCREE and
// boulders under the steeps (the rock and slope fields: what the talus mask says, not a noise), and the people's marks: CAIRNS (o.cairns: [x, z, h]) and
// PRAYER-STONE WALLS (o.walls: [[x0, z0], [x1, z1]]) along the pilgrims' road. New placement: every cell is seeded from KRAND.cell(seed, ix, iz), never from
// how many draws came before it. Reads the zones' `cold`, `wet`, `rock`, `slope` fields and o.keep(x, z) (0 where the host keeps the ground bare: a vent's
// hot disc). [G data]
OIDONG.buildHigh=function(R,q,o){o=o||{};q=q==null?1:q;R=R||2500;means();
 const st={cushions:0,lotus:0,poppies:0,stones:0,boulders:0,cairns:0,walls:0},seed=KRAND.child(620019,'oidong/high'),keep=o.keep||(()=>1);
 const F=n=>(x,z)=>BIO.field(n,x,z),cold=F('cold'),wet=F('wet'),FIELD_WET=wet,rock=F('rock'),slope=F('slope');
 const L=BIO.LOD(),c0=BIO.center();
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0||blocked(px,pz,.8))continue;
  fn(px,Y(px,pz),pz,ld<L.floor[0]?2:ld<L.floor[1]?1:0);}};
 // the cushions: domes on the gravel and between the stones, sparse, thinning as the cold deepens and gone on steep rock
 cellPass(7,1,L.floor[1]*1.6,(x,y,z,lv)=>{const a=(.55-.35*smooth(.85,1,cold(x,z)))*(1-smooth(.4,.8,rock(x,z)))*q*(lv===0?.5:1);if(rng()>a)return;
  const n=lv===2?ri(1,4):1;for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.4,1.4):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,Rr=rr(.2,.65);if(BIO.mask(px,pz)<=0)continue;
   BIO.put('lobe',[px,Y(px,pz)-.06,pz],qEuler(0,rr(0,TAU),0),[Rr,Rr*rr(.4,.6),Rr],shade(leafCol(rng()<.5?PAL.sage:PAL.mossPale,.9,.03,.1,.06),-.18));st.cushions++;}});
 // the snow lotus: among the stones and on the scree's edge, where it is coldest
 cellPass(11,2,L.floor[1],(x,y,z,lv)=>{const a=.45*smooth(.6,.9,cold(x,z))*(.4+.6*smooth(.15,.5,rock(x,z)))*(1-smooth(.75,.95,slope(x,z)))*q;if(rng()>a)return;
  snowLotus(x,y,z,lv);st.lotus++;if(lv===2&&rng()<.6){stone(x+rr(-.8,.8),y,z+rr(-.8,.8),lv,st,.7);}});
 // the sky poppies: drifts in the damp hollows only (the wet field over its median here)
 cellPass(14,3,L.floor[1],(x,y,z,lv)=>{const a=.9*smooth(.42,.62,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;const col=bright(C(pick(PAL.poppy)),1.1),n=lv===2?ri(4,9):2,r=rr(1.2,2.6);   /* the floor's drift, each head on unmasked ground */
  for(let i=0;i<n;i++){const ang=rr(0,TAU),d=r*Math.sqrt(rng()),fx=x+Math.cos(ang)*d,fz=z+Math.sin(ang)*d,fy=Y(fx,fz),h=rr(.25,.5),sz=rr(.2,.34);if(BIO.mask(fx,fz)<=0||FIELD_WET(fx,fz)<.4)continue;
   if(lv===2)BIO.beam('rod',[fx,fy,fz],[fx,fy+h,fz],.012,.008,shade(C(0x7a9a6a),-.3));
   BIO.put('poppy',[fx,fy+h,fz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),sz,vary(col,.02,.05,.04),{c2:bright(C(pick(PAL.irid.lily)),1.0)});}st.poppies++;});
 // scree and boulders under the steeps: the talus mask (rock under a steep face, falling off on the flat), not a noise
 cellPass(9,4,L.mid,(x,y,z,lv)=>{const t=clamp(rock(x,z)*1.2+smooth(.45,.8,slope(x,z))*.5,0,1)*q;if(rng()>t*.8)return;
  if(rng()<.22)boulder(x,y,z,lv,st,.8);else stone(x,y,z,lv,st,1.2);});
 // the gravel's loose stones, everywhere a little
 cellPass(6,5,L.floor[0],(x,y,z,lv)=>{if(rng()>.35*q)return;stone(x,y,z,lv,st,.6);});
 // CAIRNS: flat stones stacked, each smaller, the top one pale (a pilgrim's); always drawn whole (a landmark)
 (o.cairns||[]).forEach((c,i)=>{reseed(KRAND.hash(seed,i,61));const x=c[0],z=c[1],h=c[2]==null?1.6:c[2],y0=Y(x,z);let y=y0,r=h*.38;
  while(y<y0+h&&r>.08){const t=r*rr(.38,.5);BIO.put('stone',[x+rr(-.04,.04),y+t*.5,z+rr(-.04,.04)],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[r*rr(.95,1.15),t,r*rr(.95,1.15)],rockTint(PAL.granite,rr(.55,.8)));y+=t*.92;r*=rr(.8,.9);}
  BIO.put('stone',[x,y+.05,z],qEuler(0,rr(0,TAU),0),[.12,.08,.12],nearW(1));st.cairns++;BIO.register({name:'A cairn (the pilgrims\' road)',x,z,y:y0,r:h*.6+.5,h:h+.4});});
 // PRAYER-STONE WALLS (mani walls): a low long heap of flat stones along the road, a pale carved stone set on top every metre or so
 (o.walls||[]).forEach((w,i)=>{reseed(KRAND.hash(seed,i,71));const a=w[0],b=w[1],Ln=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(Ln/.45),ux=(b[0]-a[0])/Ln,uz=(b[1]-a[1])/Ln,ang=Math.atan2(uz,ux);
  for(let k=0;k<=n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=Y(x,z);
   for(let j=0;j<3;j++){const s=rr(.25,.45);BIO.put('stone',[x+rr(-.25,.25)-uz*rr(-.4,.4),y+s*.25+j*.18,z+rr(-.25,.25)+ux*rr(-.4,.4)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s*1.3,s*.55,s],rockTint(PAL.granite,rr(.5,.75)));}
   if(k%2===0)BIO.put('standing',[x,y+.62,z],qEuler(0,-ang,0),[.22,.32,.06],nearW(rr(.92,1.02)));}
  st.walls++;BIO.register({name:'A prayer-stone wall (the pilgrims\' road)',x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:Y((a[0]+b[0])/2,(a[1]+b[1])/2)-.5,r:Ln/2+1,h:2});});
 return st;};
})();
