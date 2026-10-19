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
function grass(x,y,z,lv,set,k){const h=rr(.3,.7)*(k||1)*(lv===0?1.6:1),n=lv===2?ri(2,4):lv===1?2:1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,1.6):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set||PAL.sage,1.25,.03));}}
function fern(x,y,z,lv,k){const n=lv===2?ri(5,8):3,L=rr(.6,1.3)*(k||1),hc=leafCol(PAL.celadon,1.2,.03,.08,.05),a0=rr(0,TAU);
 for(let i=0;i<n;i++){const a=a0+i*GOLD;BIO.put('fern',[x,y+.03,z],qEuler(rr(-.08,.08),-a,rr(.2,.65)),[L,L,L*rr(.32,.42)],bright(vary(hc,.02,.05,.05),rr(.95,1.1)));}}
function mooncaps(x,y,z,lv,n,r){const col=bright(C(pick(PAL.mooncap)),1.05);for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.14,.34);
 {const cd=OIDONG.CARD.mooncapcard;BIO.put('mooncap',[px,Y(px,pz)-.02,pz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),cd?[h*.55,h*1.1,h*.55]:[h*.9,h,h*.9],cd?nearW(rr(.95,1.08)):vary(col,.02,.05,.04));}}}
function box(x,y,z,lv){const R=rr(.5,1.3),hc=vary(pick(PAL.jade),.02,.05,.04);
 BIO.put('boxdome',[x,y+R*.35,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.65,.85),R],bright(hc,rr(1.05,1.2)));
 if(lv===2&&rng()<.4){const R2=R*rr(.5,.8),a=rr(0,TAU);BIO.put('boxdome',[x+Math.cos(a)*R,y+R2*.3,z+Math.sin(a)*R],qEuler(0,rr(0,TAU),0),[R2,R2*.8,R2],bright(hc,1.1));}}
function teaBush(x,y,z,lv){const R=rr(.5,.9),hc=vary(pick(PAL.celadon),.02,.05,.04);BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[R,R*.8,R],shade(hc,-.3));
 for(let k=0,m=lv===2?4:2;k<m;k++){const a=rr(0,TAU),d=R*.5;BIO.put('teabush',[x+Math.cos(a)*d,y+R*.6,z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R*1.1,R*.7,R*1.1],bright(hc,1.2),{n:[0,1,0]});}}
// the sky poppies: a drift of powder-blue blooms on short stems, iridescent at the edges
function poppies(x,y,z,lv,n,r){const col=bright(C(pick(PAL.poppy)),1.1);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d,fy=Y(fx,fz),h=rr(.3,.7),s=rr(.2,.34);
  if(lv===2)BIO.beam('rod',[fx,fy,fz],[fx,fy+h,fz],.012,.008,shade(C(0x7a9a6a),-.3));
  BIO.put('poppy',[fx,fy+h,fz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,vary(col,.02,.05,.04),{c2:bright(C(pick(PAL.irid.lily)),1.0)});}}
function snowLotus(x,y,z,lv){const s=rr(.25,.45);BIO.put('snowlotus',[x,y+.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*.8,s],nearW(1.02));}
function ginseng(x,y,z,lv){const s=rr(.35,.6);BIO.put('ginseng',[x,y+s*.4,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.4,s*.8,s*1.4],leafCol(PAL.jade,1.2,.02),{n:[0,1,0]});
 if(lv===2)for(let k=0,m=ri(4,8);k<m;k++)BIO.put('ball',[x+rr(-.08,.08),y+s*.75+rr(-.03,.03),z+rr(-.08,.08)],null,.025,bright(C(pick(PAL.coral)),1.1));}
function sage(x,y,z,lv){const h=rr(.3,.6),n=lv===2?ri(2,4):1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,.8):0;tuft('sagebush',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*2,leafCol(PAL.sage,1.2,.02));}}
function peyote(x,y,z,lv){const n=lv===2?ri(1,3):1;around(x,z,n,.4,1.2,(px,pz)=>{const s=rr(.25,.5);{const cd=OIDONG.CARD.peyotecard;BIO.put('peyote',[px,Y(px,pz)+(cd?.04:-.03),pz],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),cd?[s*2.8,s*2.8,s*2.8]:[s,s,s],cd?nearW(rr(.95,1.08)):leafCol(PAL.peyote,1.05,.02,.05,.03));}});}
function stoneBloom(x,y,z,lv){const n=lv===2?ri(1,3):1;around(x,z,n,.3,.9,(px,pz)=>{const s=rr(.14,.28),c=rockTint(PAL.sand,rr(.7,.95)).lerp(C(pick(PAL.lavender)),.25);
 BIO.put('stonebloom',[px,Y(px,pz)-.02,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s,s],c);
 if(lv===2)BIO.put('daisy',[px,Y(px,pz)+s*.45,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),s*.9,bright(C(pick(PAL.blush)),1.15));});}
function iris(x,y,z,lv){const h=rr(.6,1.1);tuft('blade',x,y,z,h,h*.7,leafCol(PAL.celadon,1.25,.02));
 if(lv>=1&&rng()<.5)BIO.put('poppy',[x+rr(-.2,.2),y+h*.95,z+rr(-.2,.2)],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.15,.25),bright(C(pick(PAL.lavender)),1.15),{c2:bright(C(0x8a90e8),1.0)});}
function reeds(x,y,z,lv){const h=rr(1.4,2.6)*(lv===0?1.5:1),n=lv===2?ri(3,5):lv===1?2:1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.1):0;tuft('reed',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*.55,leafCol(PAL.jade,1.2,.02));}}
function shoots(x,y,z,lv){const n=lv===2?ri(2,5):2;around(x,z,n,.3,1,(px,pz)=>{const h=rr(.3,.9);BIO.put('cone',[px,Y(px,pz)-.05,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.35,h,h*.35],leafCol(PAL.gold,1.1,.02));});}
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
 if(t<.34){mossMat(x,y,z);st.moss++;}
 else if(t<.46){fern(x,y,z,lv);st.ferns++;}
 else if(t<.56){cushion(x,y,z);st.moss++;}
 else if(t<.66){mooncaps(x,y,z,lv,lv===2?ri(3,7):2,rr(.6,1.4));st.caps++;}
 else if(t<.72){ginseng(x,y,z,lv);st.herbs++;}
 else if(t<.86){stone(x,y,z,lv,st,1,true);}
 else{mossMat(x,y,z,PAL.mossDark,1.3);st.moss++;}}
function plantMeadow(x,y,z,Z,lv,st){const t=rng();
 if(t<.36){grass(x,y,z,lv);st.grass++;}
 else if(t<.5){box(x,y,z,lv);st.boxes++;}
 else if(t<.64){poppies(x,y,z,lv,lv===2?ri(3,8):2,rr(.8,2));st.flowers++;}
 else if(t<.74){teaBush(x,y,z,lv);st.herbs++;}
 else if(t<.84){mossMat(x,y,z,PAL.mossPale,1.1);st.moss++;}
 else if(t<.92){stone(x,y,z,lv,st,.8,true);}
 else{grass(x,y,z,lv,PAL.gold,.9);st.grass++;}}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.28){reeds(x,y,z,lv);st.reeds++;}
 else if(t<.5){iris(x,y,z,lv);st.reeds++;}
 else if(t<.7){mossMat(x,y,z);st.moss++;}
 else if(t<.82){stone(x,y,z,lv,st,.7,true);}
 else{fern(x,y,z,lv,.8);st.ferns++;}}
function plantFlats(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){peyote(x,y,z,lv);st.peyote++;}
 else if(t<.5){stoneBloom(x,y,z,lv);st.flowers++;}
 else if(t<.68){sage(x,y,z,lv);st.herbs++;}
 else if(t<.86){stone(x,y,z,lv,st,.6,false);}
 else{grass(x,y,z,lv,PAL.sand,.5);st.grass++;}}
function plantBamboo(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){shoots(x,y,z,lv);st.shoots++;}
 else if(t<.7){mossMat(x,y,z,PAL.mossPale);st.moss++;}
 else if(t<.86){fern(x,y,z,lv,.7);st.ferns++;}
 else{stone(x,y,z,lv,st,.7,true);}}
function plantTerrace(x,y,z,Z,lv,st){const t=rng(),cold=Z.cold>.62;
 if(cold&&t<.3){snowLotus(x,y,z,lv);st.herbs++;}
 else if(t<.4){teaBush(x,y,z,lv);st.herbs++;}
 else if(t<.58){poppies(x,y,z,lv,lv===2?ri(2,6):2,rr(.6,1.6));st.flowers++;}
 else if(t<.78){grass(x,y,z,lv,PAL.sage,.8);st.grass++;}
 else if(t<.9){stone(x,y,z,lv,st,.9,!cold);}
 else{cushion(x,y,z,PAL.mossPale,.8);st.moss++;}}
function plantMist(x,y,z,Z,lv,st){const t=rng();
 if(t<.34){fern(x,y,z,lv,1.1);st.ferns++;}
 else if(t<.6){mossMat(x,y,z,PAL.mossDark,1.2);st.moss++;}
 else if(t<.72){mooncaps(x,y,z,lv,lv===2?ri(2,5):2,rr(.5,1.2));st.caps++;}
 else if(t<.86){boulder(x,y,z,lv,st,1,true);}
 else{cushion(x,y,z,PAL.moss,1.3);st.moss++;}}
function plantStream(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){iris(x,y,z,lv);st.reeds++;}
 else if(t<.5){fern(x,y,z,lv,.9);st.ferns++;}
 else if(t<.74){mossMat(x,y,z);st.moss++;}
 else{stone(x,y,z,lv,st,.8,true);}}

// ---------------------------------------------------------------- the pass
OIDONG.FLOOR_ZONES=['moss','meadow','shore','flats','bamboo','terrace','mistZ','stream'];
const PLANTERS=[plantMoss,plantMeadow,plantShore,plantFlats,plantBamboo,plantTerrace,plantMist,plantStream];
OIDONG.floorWeights=Z=>[Z.moss*1.5,Z.meadow*1.1,Z.shore*1.4,Z.flats*.7,Z.bamboo*.9,Z.terrace*.9,Z.mistZ*1.4,Z.stream*1.6];
OIDONG.buildFloor=function(R,q){
 reseed(600019);q=q==null?1:q;R=R||2500;means();OIDONG.STONES.length=0;
 const st={moss:0,ferns:0,caps:0,herbs:0,grass:0,boxes:0,flowers:0,reeds:0,peyote:0,shoots:0,stones:0,boulders:0,logs:0,groups:0,lotus:0,lilies:0,pods:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.cliff>.6||Z.pool>.3)return;
  const w=OIDONG.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .72*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.55,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
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
})();
