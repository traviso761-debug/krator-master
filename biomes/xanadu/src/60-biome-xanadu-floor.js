// ================================================================= XANADU — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (XANADU.zones):
//   the VALE     meadow grass, gold where it is dry; the flowers, every colour
//                and shape at once (painted orchids, swirl lilies, ruffles,
//                stars, plain five-petalled blooms), two-tone, on short stems;
//                blood grass, pampas plumes, box domes that look clipped
//   the FOREST   ferns, box domes, baneberry (the doll's eyes), understorey
//                leaves, moss, mushrooms, cobra lilies in the damp, fallen
//                trees whose wood already looks petrified
//   the SHORE    reeds and iris, pebbles; lotus pads and lotus flowers on the still water
//   the BANKS    ferns, iris, cobra lilies, mossy boulders
//   the CHASM    giant ferns, moss on everything, orchids, cobra lilies
//   the DRY      garrigue: silver tufts, blood grass, thyme blooms, star
//                flowers on the stones, prickly pear seedlings, limestone,
//                petrified logs
//   the CRAG     sparse: silver tufts, stars, stones
// And the lawns inside the fairy rings: a ring of mushrooms and a ring of
// flowers of one pair. Three LOD bands, each origin of the spine planting only
// its own share (nearest origin) so the bands never double.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=XANADU.PAL,zones=XANADU.zones,blocked=XANADU.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=XANADU;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.4,.65):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
const psyPair=()=>{const p=pick(PAL.psyPair);return[bright(C(p[0]),1.12),bright(C(p[1]),1.1)];};
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);
const flowerK=(x,z)=>smooth(.45,.66,fbm(x*.0048-5,z*.0048+2,3131,2));      // the flower drifts on the vale

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col,c2){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col,c2?{c2}:null);}
function groundMoss(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(set||PAL.moss,.95,.03));}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set){const hc=vary(pick(set||PAL.fern),.06,.14,.07);frondCrown(x,y-.1,z,rr(1.6,3.2),lv===2?ri(5,7):lv===1?4:3,.08,.45,bright(hc,1.7));}
function giantFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.05,.14,.07),R=rr(3,5.5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');if(lv===2)frondCrown(x,y+.3,z,R*.5,3,.6,1.0,bright(shade(hc,.1),1.6),'bigfrond');}
function grass(x,y,z,lv,set,k){const h=rr(.5,1.1)*(k||1)*(lv===0?1.7:1),n=lv===2?ri(2,4):lv===1?2:1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.6,2):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set||PAL.meadow,1.3,.03));}}
// the blood grass: a green clump, and redder blades standing out of it
function bloodGrass(x,y,z,lv){const h=rr(.6,1.1)*(lv===0?1.5:1);tuft('blade',x,y,z,h*.7,h*.9,leafCol([0x6a9a3a,0x7aa840],1.3,.02));tuft('blade',x+rr(-.1,.1),y,z+rr(-.1,.1),h,h*.8,leafCol(PAL.blood,1.25,.02));}
// a flower drift: n flowers of one pair, on short stems up close
function flowers(x,y,z,lv,n,r,items){const pr=psyPair(),it=pick(items||['orchid','swirl','ruffle','bloom','bloom','lotus']);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d,fy=Y(fx,fz),h=rr(.25,.7),s=rr(.22,.42);
  if(lv===2&&h>.35)BIO.beam('rod',[fx,fy,fz],[fx,fy+h,fz],.012,.008,rodCol(0x4a7a3a));
  BIO.put(it,[fx,fy+h,fz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,pr[0],{c2:pr[1]});}}
function star(x,y,z,lv){const pr=rng()<.5?[bright(C(0x7a1a2a),1.1),bright(C(0xe8c8a0),1.05)]:psyPair(),s=rr(.3,.6);
 BIO.put('star',[x,y+.05,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),s,pr[0],{c2:pr[1]});}
function plume(x,y,z,lv){const col=pick([0xf0a060,0xf8c090,0xf0b0c8,0xe8e0c8,0xf09050]),h=rr(1.4,2.4);
 tuft('grass',x,y,z,h*.8,h*.9,leafCol(PAL.meadow,1.25,.02));
 for(let k=0,m=lv===2?ri(3,6):2;k<m;k++){const a=rr(0,TAU),d=rr(0,.4);BIO.put('plume',[x+Math.cos(a)*d,y+h*.55,z+Math.sin(a)*d],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[rr(.5,.8),rr(.9,1.5),rr(.5,.8)],bright(vary(C(col),.02,.06,.05),1.15),{c2:bright(C(0xfff4e8),1.05)});}}
function box(x,y,z,lv,dark){const R=rr(.5,1.3),hc=dark?vary(pick(PAL.forest),.02,.06,.05):vary(pick([0x5a8a34,0x6a9a3a,0x4a7a30]),.02,.06,.05);
 BIO.put('cushion',[x,y+R*.35,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.65,.85),R],bright(hc,rr(1.05,1.25)));
 if(lv===2&&rng()<.4){const R2=R*rr(.5,.8),a=rr(0,TAU);BIO.put('cushion',[x+Math.cos(a)*R,y+R2*.3,z+Math.sin(a)*R],qEuler(0,rr(0,TAU),0),[R2,R2*.8,R2],bright(hc,1.1));}}
function baneberry(x,y,z,lv){const n=lv===2?ri(1,3):1;card(x,y+.35,z,rr(1,1.6),rr(.6,.9),leafCol(PAL.forest,1.45,.03),.3);
 if(lv>=1)for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(0,.4),h=rr(.7,1.1);BIO.put('baneberry',[x+Math.cos(a)*d,y-.05,z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h,h,h],C(0xffffff));}}
function cobras(x,y,z,lv){const n=lv===2?ri(4,9):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(0,1.2),h=rr(.4,.85),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
 BIO.put('cobra',[px,Y(px,pz)-.03,pz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[h,h,h],bright(vary(C(pick([0x8ab040,0x9ac050,0xa8a040,0x7aa040])),.02,.06,.05),1.1));}}
function mushrooms(x,y,z,lv,n,r){const col=bright(C(pick(PAL.mush)),1.05);for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.12,.3);
 BIO.put('mushroom',[px,Y(px,pz)-.02,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h,h,h],col);}}
function iris(x,y,z,lv){const h=rr(.7,1.2);tuft('blade',x,y,z,h,h*.7,leafCol([0x4a8a4a,0x5a9a50],1.3,.02));
 if(lv>=1){const pr=rng()<.5?[bright(C(0x6a3ae0),1.1),bright(C(0xf0e040),1.05)]:[bright(C(0xf0d030),1.1),bright(C(0x8a3a1a),1)];for(let k=0,m=lv===2?ri(1,3):1;k<m;k++)BIO.put('orchid',[x+rr(-.2,.2),y+h*rr(.8,1.05),z+rr(-.2,.2)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.2,.3),pr[0],{c2:pr[1]});}}
function reed(x,y,z,lv){const h=rr(1.6,3)*(lv===0?1.5:1),n=lv===2?ri(3,5):lv===1?2:1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.4):0,hx=x+Math.cos(a)*d,hz=z+Math.sin(a)*d;if(k&&Y(hx,hz)<-.6)continue;tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(PAL.reed,1.3,.025));}}
function silverTuft(x,y,z,lv){const h=rr(.35,.8)*(lv===0?1.5:1),n=lv===2?ri(2,3):1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.5,1.2):0;tuft('clubmoss',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*2,leafCol(rng()<.6?PAL.silver:PAL.garrigue,1.25,.02));}}
function thyme(x,y,z,lv){silverTuft(x,y,z,lv);if(lv>=1){const c=bright(C(pick([0xb070e0,0xd090f0,0xf0a0d0,0xffffff])),1.1);for(let k=0,m=ri(3,7);k<m;k++)BIO.put('bloom',[x+rr(-.6,.6),y+rr(.25,.5),z+rr(-.6,.6)],qEuler(rr(-.4,.4),rr(0,TAU),0),rr(.1,.18),c,{c2:bright(c,.8)});}}
function pearSeedling(x,y,z,lv){const s=rr(.25,.45),col=bright(vary(pick(PAL.cactus),.02,.06,.05),1.05);BIO.put('opad',[x,y-.03,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),s,col);
 if(lv===2&&rng()<.6)BIO.put('opad',[x+rr(-.2,.2),y+s*1.1,z+rr(-.2,.2)],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.3,.3)),s*.8,col);}
function boulder(x,y,z,lv,set,st,mossy){const n=lv===2?ri(1,2):1,Rb=rr(.8,2.6);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;
  if(mossy&&lv>=1){BIO.put('mossmat',[bx+rr(-.15,.15)*r,by+h*1.05,bz+rr(-.15,.15)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.6,.9),leafCol(PAL.moss,.95));st.moss++;}}}
// a fallen tree: its wood already banded like petrified wood; moss, ferns and mushrooms along its back
function log(x,y,z,st,wet){const a=rr(0,TAU),L=rr(10,30),r0=rr(.5,1.1),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/5)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.5))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.3,z:pz,r:mix(r0,r0*.6,t)});}
 BIO.tube('xwood',pts,C(pick([0xffffff,0xf0e8e0,0xe8e0f0])),{seg:8,cap:true,capCol:C(pick(PAL.agate))});st.logs++;
 if(wet)for(let s=2;s<L-1;s+=rr(2.5,5)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.7)frondCrown(px,py+r*.9,pz,rr(.8,1.6),5,.05,.4,leafCol(PAL.fern,1.7));else mushrooms(px,py+r,pz,2,ri(2,5),.4);}
 return true;}

// the MAQUIS: the uplands' shrubs -- lavender, broom, cistus, rosemary -- in mounds a metre or two across
function lavender(x,y,z,lv){const R=rr(.5,.9);BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[R,R*.7,R],bright(vary(C(0x8a9a80),.02,.06,.05),.9));
 const c=bright(vary(C(pick([0x8a5ad8,0x9a6ae0,0x7a4ac8,0xa888e8])),.02,.06,.05),1.15);for(let k=0,m=lv===2?ri(8,14):4;k<m;k++){const a=rr(0,TAU),d=R*rr(0,.8);BIO.put('candle',[x+Math.cos(a)*d,y+R*.45,z+Math.sin(a)*d],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[.14,rr(.45,.7),.14],c);}}
function broom(x,y,z,lv){const h=rr(.8,1.5);tuft('clubmoss',x,y,z,h,h*1.6,leafCol([0x4a7a30,0x5a8a34],1.3,.02));tuft('clubmoss',x+rr(-.3,.3),y,z+rr(-.3,.3),h*.8,h*1.3,leafCol([0x4a7a30],1.25,.02));
 if(lv>=1){const c=bright(C(pick([0xf8d020,0xf0c018,0xffe040])),1.15);for(let k=0,m=lv===2?ri(10,18):5;k<m;k++)BIO.put('bloom',[x+rr(-.6,.6)*h,y+h*rr(.4,1),z+rr(-.6,.6)*h],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),rr(.12,.2),c,{c2:bright(c,.85)});}}
function cistus(x,y,z,lv){const R=rr(.7,1.3),hc=vary(C(pick([0x5a7a40,0x6a8a48])),.02,.06,.05);BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[R,R*.75,R],shade(hc,-.15));
 card(x,y+R*.5,z,R*1.5,R*.9,bright(hc,1.35),.25);
 if(lv>=1){const c=bright(C(pick([0xf080c0,0xffb0d8,0xfff4f8,0xe868b0])),1.1);for(let k=0,m=lv===2?ri(5,10):3;k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.85);BIO.put('bloom',[x+Math.cos(a)*d,y+R*rr(.55,.8),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.18,.3),c,{c2:bright(C(0xffe860),1.05)});}}}
function rosemary(x,y,z,lv){const h=rr(.6,1.1);for(let k=0,m=lv===2?3:1;k<m;k++)tuft('clubmoss',x+rr(-.4,.4),y,z+rr(-.4,.4),h*rr(.8,1.1),h*1.8,leafCol([0x3e5a3a,0x4a6a44,0x5a7a50],1.25,.02));
 if(lv===2){const c=bright(C(0xa0b0f0),1.1);for(let k=0;k<6;k++)BIO.put('bloom',[x+rr(-.5,.5),y+h*rr(.6,1),z+rr(-.5,.5)],qEuler(rr(-.5,.5),rr(0,TAU),0),rr(.08,.12),c,{c2:c});}}

// ---------------------------------------------------------------- the zone planters
function plantVale(x,y,z,Z,lv,st){const glade=1-Z.grove,t=rng(),fk=Math.min(1,flowerK(x,z)+glade*.35),gold=smooth(.62,.48,Z.wet);
 if(t<.34){grass(x,y,z,lv,gold>.5?PAL.gold:PAL.meadow);st.tufts++;}
 else if(t<.34+.26*fk+.04){flowers(x,y,z,lv,lv===2?ri(5,12):lv===1?4:2,rr(.8,2.2));st.flowers++;if(lv===2)grass(x,y,z,lv,PAL.meadow,.7);}
 else if(t<.70){grass(x,y,z,lv,PAL.meadow,.8);st.tufts++;}
 else if(t<.78){bloodGrass(x,y,z,lv);st.tufts++;}
 else if(t<.83){plume(x,y,z,lv);st.plumes++;}
 else if(t<.88){box(x,y,z,lv,false);st.boxes++;}
 else if(t<.92){if(Z.wet>.7){iris(x,y,z,lv);st.tufts++;}else{star(x,y,z,lv);st.flowers++;}}
 else if(t<.95){mushrooms(x,y,z,lv,ri(2,6),.8);st.mush++;}
 else if(t<.98){fern(x,y,z,lv,PAL.fern);st.ferns++;}
 else{boulder(x,y,z,lv,PAL.limestone,st,false);}}
function plantForest(x,y,z,Z,lv,st){const t=rng(),damp=dampK(x,z);
 if(t<.28){fern(x,y,z,lv);st.ferns++;if(lv===2&&rng()<.4)fern(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv);}
 else if(t<.40){box(x,y,z,lv,true);st.boxes++;}
 else if(t<.50){baneberry(x,y,z,lv);st.bane++;}
 else if(t<.62){card(x,y+.4,z,rr(1.2,2),rr(.8,1.2),leafCol(PAL.forest,1.45,.03),.3);st.shrubs++;}
 else if(t<.72){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.78){if(damp>.52){cobras(x,y,z,lv);st.cobras++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.83){mushrooms(x,y,z,lv,ri(3,8),1.2);st.mush++;}
 else if(t<.89){flowers(x,y,z,lv,lv===2?ri(3,6):2,rr(.6,1.4),['bloom','orchid']);st.flowers++;}
 else if(t<.95){grass(x,y,z,lv,PAL.forest,.7);st.tufts++;}
 else{boulder(x,y,z,lv,PAL.rock,st,true);}}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.32){if(Z.h<1.4){reed(x,y,z,lv);st.reeds++;}else{grass(x,y,z,lv,PAL.meadow);st.tufts++;}}
 else if(t<.50){iris(x,y,z,lv);st.tufts++;}
 else if(t<.66){grass(x,y,z,lv,PAL.reed);st.tufts++;}
 else if(t<.78){flowers(x,y,z,lv,lv===2?ri(3,7):2,rr(.6,1.5),['bloom','lotus','swirl']);st.flowers++;}
 else if(t<.86){plume(x,y,z,lv);st.plumes++;}
 else{boulder(x,y,z,lv,PAL.limestone,st,false);}}
function plantBank(x,y,z,Z,lv,st){const t=rng();
 if(t<.30){fern(x,y,z,lv);st.ferns++;}
 else if(t<.44){if(Z.flow>.85){reed(x,y,z,lv);st.reeds++;}else{iris(x,y,z,lv);st.tufts++;}}
 else if(t<.56){cobras(x,y,z,lv);st.cobras++;}
 else if(t<.70){if(lv>=1){groundMoss(x,y,z,rr(1,2.4));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.82){flowers(x,y,z,lv,lv===2?ri(3,6):2,rr(.6,1.3),['orchid','swirl','bloom']);st.flowers++;}
 else{boulder(x,y,z,lv,PAL.rock,st,true);}}
function plantChasm(x,y,z,Z,lv,st){const t=rng();
 if(t<.30){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.52){if(lv>=1){groundMoss(x,y,z,rr(1.4,3.2));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.62){cobras(x,y,z,lv);st.cobras++;}
 else if(t<.72){flowers(x,y,z,lv,lv===2?ri(3,6):2,rr(.5,1.2),['orchid','swirl']);st.flowers++;}
 else if(t<.80){box(x,y,z,lv,true);st.boxes++;}
 else if(t<.88){fern(x,y,z,lv);st.ferns++;}
 else{boulder(x,y,z,lv,PAL.rock,st,true);}}
function plantDry(x,y,z,Z,lv,st){const t=rng();
 if(t<.14){silverTuft(x,y,z,lv);st.tufts++;}
 else if(t<.24){bloodGrass(x,y,z,lv);st.tufts++;}
 else if(t<.32){thyme(x,y,z,lv);st.flowers++;}
 else if(t<.40){grass(x,y,z,lv,PAL.gold,.9);st.tufts++;}
 else if(t<.48){lavender(x,y,z,lv);st.maquis++;}
 else if(t<.56){broom(x,y,z,lv);st.maquis++;}
 else if(t<.64){cistus(x,y,z,lv);st.maquis++;}
 else if(t<.70){rosemary(x,y,z,lv);st.maquis++;}
 else if(t<.75){star(x,y,z,lv);st.flowers++;if(lv===2&&rng()<.5)star(x+rr(-1,1),y,z+rr(-1,1),lv);}
 else if(t<.80){pearSeedling(x,y,z,lv);st.tufts++;}
 else if(t<.84){plume(x,y,z,lv);st.plumes++;}
 else if(t<.89){flowers(x,y,z,lv,lv===2?ri(3,6):2,rr(.6,1.2),['ruffle','bloom','swirl']);st.flowers++;}
 else if(t<.93){box(x,y,z,lv,true);st.boxes++;}
 else{boulder(x,y,z,lv,PAL.limestone,st,false);}}
function plantCrag(x,y,z,Z,lv,st){const t=rng();
 if(t<.35){silverTuft(x,y,z,lv);st.tufts++;}
 else if(t<.5){star(x,y,z,lv);st.flowers++;}
 else if(t<.62){grass(x,y,z,lv,PAL.garrigue,.8);st.tufts++;}
 else if(t<.7){thyme(x,y,z,lv);st.flowers++;}
 else if(t<.8){boulder(x,y,z,lv,PAL.rock,st,false);}}

// ---------------------------------------------------------------- the pass
XANADU.buildFloor=function(R,q){
 reseed(600023);q=q==null?1:q;R=R||3400;means();
 const st={maquis:0,tufts:0,flowers:0,plumes:0,boxes:0,bane:0,shrubs:0,moss:0,ferns:0,cobras:0,mush:0,reeds:0,boulders:0,logs:0,lotus:0,rings:0};
 function plant(x,y,z,lv){if(!okGround(x,z,.8))return;const Z=zones(x,z);
  const w=[Z.vale*(1.1+.8*(1-Z.grove)),Z.forest*1.3,Z.shore*1.1,Z.rip*1.2,Z.chasm*1.4+Z.cloud*.9,Z.dry*1.8,Z.crag*.7],P=[plantVale,plantForest,plantShore,plantBank,plantChasm,plantDry,plantCrag];
  let tot=0;for(const v of w)tot+=v;if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  P[k](x,y,z,Z,lv,st);}
 // the bands: each origin plants the cells it is nearest to
 const O=BIO.host.origin,nearest=(x,z)=>{let b=0,bd=1e18;for(let i=0;i<O.length;i++){const d=(x-O[i][0])**2+(z-O[i][1])**2;if(d<bd){bd=d;b=i;}}return b;};
 const bands=[[7,420,0],[14,1000,420]];
 BIO.range=XANADU.LOD.floor;
 bands.forEach((b,bi)=>{const lv=2-bi;O.forEach((o,oi)=>{
  BIO.grid(b[0],0,1e9,(x,z,d)=>{if(nearest(x,z)!==oi)return 0;const ld=Math.hypot(x-o[0],z-o[1]);if(ld>=b[1]||ld<b[2])return 0;return .8*q*(lv===1?.85:1);},(x,y,z)=>plant(x,y,z,lv),
   {patch:.75,patchScale:.014,pad:.6,center:[0,0],box:[o[0]-b[1],o[1]-b[1],o[0]+b[1],o[1]+b[1]]});});});
 BIO.range=XANADU.LOD.farFloor;
 BIO.grid(30,0,R,(x,z)=>{if(BIO.lodD(x,z)<1000)return 0;return .6*q*(1-.8*smooth(.5,.8,BIO.field('upland',x,z)));},(x,y,z)=>plant(x,y,z,0),{patch:.75,patchScale:.014,pad:.6});
 BIO.range=XANADU.LOD.floor;
 // the still water: lotus pads, lotus flowers standing out of them
 O.forEach((o,oi)=>{BIO.grid(6,0,1e9,(x,z)=>{if(nearest(x,z)!==oi||Math.hypot(x-o[0],z-o[1])>900)return 0;const h=Y(x,z);if(h>-.15||h<-2.6)return 0;
   const fl=BIO.field('flow',x,z);return .5*q*(1-fl)*smooth(.46,.62,fbm(x*.006+1,z*.006-2,808,2));},
  (x,y,z)=>{if(!BIO.clearOf(x,z,1))return;const R2=rr(.5,1.3);BIO.put('lilypad',[x,.03,z],qEuler(rr(-.02,.02),rr(0,TAU),rr(-.02,.02)),[R2,1,R2],bright(vary(C(pick([0x4a8a3a,0x5a9a40,0x6a9a48,0x3e7a3a])),.02,.06,.05),1.05));st.lotus++;
   if(rng()<.18){const col=bright(C(pick([0xff80b0,0xffa0c8,0xfff0f4,0xff6aa0,0xf8c040])),1.1),h=rr(.2,.7);BIO.put('cup',[x+rr(-.3,.3),h,z+rr(-.3,.3)],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.35,.6),col);}},
  {patch:.6,patchScale:.02,noMask:true,pad:.3,center:[0,0],box:[o[0]-900,o[1]-900,o[0]+900,o[1]+900]});});
 // the fairy rings' lawns: a ring of mushrooms, a ring of flowers of one pair
 XANADU.RINGS.forEach(r=>{if(r.lv<1)return;st.rings++;const pr=psyPair(),mc=bright(C(pick(PAL.mush)),1.05),it=pick(['orchid','swirl','ruffle','bloom']);
  const nm=Math.round(TAU*r.r*.62/(r.lv===2?.6:1.6));for(let k=0;k<nm;k++){const a=k/nm*TAU+rr(-.02,.02),d=r.r*.62+rr(-.15,.15),px=r.x+Math.cos(a)*d,pz=r.z+Math.sin(a)*d,h=rr(.15,.32);BIO.put('mushroom',[px,Y(px,pz)-.02,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h,h,h],mc);}
  const nf=Math.round(TAU*r.r*.4/(r.lv===2?.35:1));for(let k=0;k<nf;k++){const a=k/nf*TAU,d=r.r*.4+rr(-.2,.2),px=r.x+Math.cos(a)*d,pz=r.z+Math.sin(a)*d,h=rr(.2,.45);BIO.put(it,[px,Y(px,pz)+h,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.25,.4),pr[0],{c2:pr[1]});}
  if(r.lv===2)for(let k=0;k<40;k++){const a=rr(0,TAU),d=r.r*.9*Math.sqrt(rng()),px=r.x+Math.cos(a)*d,pz=r.z+Math.sin(a)*d;grass(px,Y(px,pz),pz,1,PAL.meadow,.55);}});
 BIO.range=XANADU.LOD.logs;
 // fallen trees in the forest and the chasm, petrified-looking logs on the uplands
 BIO.grid(110,0,R,(x,z)=>{if(BIO.lodD(x,z)>1100)return 0;const Z=zones(x,z);return (Z.forest*.7+Z.chasm*.5+Z.dry*.35)*q;},(x,y,z)=>{const Z=zones(x,z),wet=Z.dry<.5;for(let t=0;t<4;t++)if(log(x+rr(-20,20),y,z+rr(-20,20),st,wet))break;},{patch:0,pad:2});
 BIO.range=null;
 return{under:st};};
})();
