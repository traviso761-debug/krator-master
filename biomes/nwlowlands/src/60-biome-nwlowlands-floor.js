// ================================================================= NORTHWESTERN LOWLANDS — floor
// Everything under the trees, by zone (NWLOW.zones). The shrub layer here is SEA PENS:
// upright feathers, clubs and whips in white, pale pink and lilac, the region's most
// alien note, and vertical like everything else in it.
//   the SHORE       reeds, sedge, iris, sea pens at the water; lotus and lilies on it
//   the RAINFOREST  teal aroids, torch ginger, ferns and forking ferns, tall feather pens, moss
//   the GROVES      bamboo leaf litter, shoots, a little moss and fern: a bare floor, so a
//                   grove reads as a grove
//   the PLAIN       bluebell carpets, ferns, rhododendrons, lilies, sea pens, green grass
//   the HILLS       tussock and dry grass, kangaroo paw, saltbush, club pens, rocks
// Three LOD bands along the spine, a grass carpet, the water, fallen trees, and an
// understorey pass under the crowns.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NWLOW.PAL,zones=NWLOW.zones,blocked=NWLOW.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=NWLOW;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
const bellK=(x,z)=>smooth(.5,.62,fbm(x*.0048-5,z*.0048+2,4131,2));     // the bluebell carpets
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function groundMoss(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(set||PAL.moss,.95,.03));}
function blooms(x,y,z,r,n,set,sz,h){const c=bright(vary(pick(set),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.16,.34);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(.05,h==null?.4:h),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,item){const hc=vary(pick(PAL.fern),.06,.14,.07);frondCrown(x,y-.1,z,rr(1.6,3.2)*(item==='forkfern'?1.3:1),lv===2?ri(5,7):lv===1?4:3,.1,.55,bright(hc,1.7),item);}
function giantFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.05,.14,.07);frondCrown(x,y-.1,z,rr(3,5),lv===2?ri(6,8):4,.1,.6,bright(hc,1.6),'bigfrond');}
function shrub(x,y,z,lv,set,k){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.1,2.4)*(k||1);
 if(lv===2){BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs*.8,Rs*rr(.8,1.1),Rs*.8],shade(vary(hc,.03,.1,.05),-.2));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.6):0;card(x+Math.cos(a)*d,y+Rs*rr(.6,.9),z+Math.sin(a)*d,Rs*rr(1.3,1.7),Rs*rr(1.3,1.7),bright(vary(hc,.04,.1,.06),1.45),.2);}}
 else card(x,y+Rs*.7,z,Rs*1.6,Rs*1.5,bright(hc,1.4));
 return Rs;}
// a SEA PEN: one to five upright fronds -- feather pens, club pens, the odd whip pen
function seaPen(x,y,z,lv,st,big){const t=rng(),n=lv===2?ri(2,6):ri(1,3),set=rng()<.8?PAL.pen:PAL.penDeep,base=rr(1,2.6)*(big||1);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,.9):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=base*rr(.6,1.35)*(lv===0?1.4:1),col=bright(vary(pick(set),.02,.06,.05),1.15);
  if(t<.62)BIO.put('pen',[px,y-.05,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.42,h,h*.42],col);          // feather
  else if(t<.86)BIO.put('clubpen',[px,y-.05,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.34,h*.8,h*.34],col); // club
  else BIO.put('pen',[px,y-.05,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h*.16,h*1.8,h*.16],col);}              // whip
 st.pens++;}
function aroid(x,y,z,lv,st){const n=lv===2?ri(3,6):2,hc=vary(pick(PAL.aroid),.03,.1,.06);
 for(let k=0;k<n;k++){const a=rr(0,TAU),L=rr(1,2.4),stem=rr(.5,1.6),px=x+Math.cos(a)*.3,pz=z+Math.sin(a)*.3;
  if(lv===2)BIO.beam('rod',[px,y,pz],[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],.03,.02,rodCol(0x3a6a5a));
  BIO.put('heart',[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],qEuler(rr(.4,.9),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.2,.2)),[L*.8,L,1],bright(vary(hc,.02,.08,.06),1.45));}st.aroids++;}
function ginger(x,y,z,lv,st){const h=rr(1.4,2.8);tuft('spike',x,y,z,h,h*.7,leafCol(PAL.fern,1.35));
 if(lv>=1){const col=C(pick(PAL.ginger)),sh=rr(.8,1.4);BIO.beam('rod',[x+.2,y,z],[x+.2,y+sh,z],.02,.015,rodCol(0x4a6a3a));BIO.put('pompom',[x+.2,y+sh+.1,z],qEuler(0,rr(0,TAU),0),[.14,.22,.14],bright(col,.85));}st.ginger++;}
function rhodo(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.shrub,1.1);if(lv>=1)blooms(x,y+Rs*.9,z,Rs*.8,lv===2?ri(10,18):5,PAL.rhodo,[.22,.36],Rs*.6);st.rhodo++;}
function lilies(x,y,z,lv,st){const n=lv===2?ri(3,7):2,col=C(pick(PAL.lily));
 for(let k=0;k<n;k++){const px=x+rr(-.8,.8),pz=z+rr(-.8,.8),h=rr(.6,1.2);tuft('spike',px,y,pz,h*.8,h*.4,leafCol(PAL.grassGreen,1.3));BIO.put('bloom',[px,y+h,pz],qEuler(rr(.8,1.2),rr(0,TAU),0),rr(.18,.28),bright(col,1.1));}st.lilies++;}
function bluebells(x,y,z,lv,st){blooms(x,y,z,rr(1.2,2.4),lv===2?ri(14,26):ri(6,10),PAL.bluebell,[.07,.13],.35);st.bells++;}
function reed(x,y,z,lv){const h=rr(1.4,2.8)*(lv===0?1.5:1);for(let k=0,n=lv===2?ri(2,4):1;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,2):0;tuft('reed',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(PAL.reed,1.35,.025));}}
function grassTuft(x,y,z,lv,set,hk,k){const h=rr(.5,1.1)*(hk||1)*(lv===0?1.6:1),n=lv===2?(k||ri(2,4)):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,1.8):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set,1.3,.03));}}
function kpaw(x,y,z,lv,st){tuft('spike',x,y,z,rr(.6,.9),.8,leafCol(PAL.grassGreen,1.2));if(lv>=1)tuft('lupin',x,y,z,rr(1,1.6),.7,bright(C(pick(PAL.kpaw)),1.1));st.kpaw++;}
function saltbush(x,y,z,lv,st){const Rs=rr(.7,1.3);BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*.8,Rs],shade(vary(pick(PAL.saltbush),.02,.06,.05),-.05));if(lv===2)card(x,y+Rs*.6,z,Rs*1.8,Rs*1.3,leafCol(PAL.saltbush,1.2));st.shrubs++;}
function boulder(x,y,z,lv,set,st){const n=lv===2?ri(1,3):1,Rb=rr(.8,2.6);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.5,.9);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;}}
function lotus(x,z,lv,st){const R=rr(.5,1.1);BIO.put('pad',[x,.12,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,1,R],bright(vary(pick(PAL.pad),.03,.1,.06),1.1));
 if(lv===2&&rng()<.35){const h=rr(.5,1.2);BIO.beam('rod',[x+.2,0,z],[x+.2,h,z],.02,.015,C(0x4a6a4a));BIO.put('bloom',[x+.2,h,z],qEuler(rr(1.1,1.4),rr(0,TAU),0),rr(.28,.4),bright(C(pick(PAL.lotus)),1.1));}
 for(let k=0,m=rng()<.5?ri(1,3):0;k<m;k++){const a=rr(0,TAU),d=R*rr(1.3,2.4),R2=R*rr(.5,.9);BIO.put('pad',[x+Math.cos(a)*d,.05,z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[R2,1,R2],bright(vary(pick(PAL.pad),.03,.1,.06),1.05));}st.lotus++;}
// the bamboo grove floor: pale leaf litter, shoots coming up, a little moss
function groveFloor(x,y,z,lv,st){const t=rng();
 if(t<.62){BIO.put('mossmat',[x,y+.05,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rr(1.5,3),1,rr(1.5,3)],leafCol(PAL.litter,.95,.02));st.litter++;}
 else if(t<.84){const h=rr(.4,1.6);BIO.put('cone',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.28,h,h*.28],shade(vary(C(0x7a6a44),.03,.1,.08),-.1));st.shoots++;}
 else if(t<.94){groundMoss(x,y,z,rr(.8,1.8));st.moss++;}
 else{fern(x,y,z,lv);st.ferns++;}}
// a fallen trunk, silvered, with moss and ferns along its back
function log(x,y,z,st){const a=rr(0,TAU),L=rr(14,40),r0=rr(.6,1.4),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/7)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.5))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.55,t),col:tint(pick(PAL.deadwood),means().wood,rr(.55,.85)).lerp(C(PAL.moss[i%3]),rng()<.35?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:8,cap:true});st.logs++;
 for(let s=2;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.75)frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(.8,1.6),5,.05,.4,leafCol(PAL.fern,1.7));
  else BIO.put('fungus',[px,py+r*.3,pz],qEuler(0,rr(0,TAU),0),[rr(.3,.6),rr(.12,.2),rr(.3,.6)],C(pick(PAL.fungus)));}
 return true;}

// ---------------------------------------------------------------- the zone planters
function plantRain(x,y,z,Z,lv,st){const t=rng();
 if(t<.18)aroid(x,y,z,lv,st);
 else if(t<.32){if(lv>=1&&okGround(x,z,2.5))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}
 else if(t<.42){fern(x,y,z,lv,'forkfern');st.ferns++;}
 else if(t<.52)ginger(x,y,z,lv,st);
 else if(t<.66)seaPen(x,y,z,lv,st,1.6);
 else if(t<.78){shrub(x,y,z,lv,PAL.aroid);st.shrubs++;}
 else if(t<.9){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else blooms(x,y,z,rr(.8,1.6),ri(3,7),PAL.ginger);}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){reed(x,y,z,lv);st.tufts++;}
 else if(t<.6){grassTuft(x,y,z,lv,PAL.reed,.9);st.tufts++;}
 else if(t<.75){tuft('spike',x,y,z,rr(.7,1.1),.6,leafCol(PAL.reed,1.3));if(lv>=1)blooms(x,y+.8,z,.3,ri(2,4),PAL.bluebell,[.14,.22],.2);st.iris++;}
 else if(t<.9)seaPen(x,y,z,lv,st,1.1);
 else aroid(x,y,z,lv,st);}
function plantSub(x,y,z,Z,lv,st){const t=rng(),bk=bellK(x,z);
 if(t<.3*bk){bluebells(x,y,z,lv,st);if(lv===2&&rng()<.5)bluebells(x+rr(-2,2),y,z+rr(-2,2),lv,st);return;}
 if(t<.22){grassTuft(x,y,z,lv,PAL.grassGreen,1);st.tufts++;}
 else if(t<.38){fern(x,y,z,lv,rng()<.3?'forkfern':'frond');st.ferns++;}
 else if(t<.6)seaPen(x,y,z,lv,st,1.3);
 else if(t<.68)rhodo(x,y,z,lv,st);
 else if(t<.72)lilies(x,y,z,lv,st);
 else if(t<.8){shrub(x,y,z,lv,PAL.shrub);st.shrubs++;}
 else if(t<.88){if(lv>=1&&dampK(x,z)>.5){groundMoss(x,y,z,rr(1,2.2));st.moss++;}else{grassTuft(x,y,z,lv,PAL.grassGreen);st.tufts++;}}
 else if(t<.95)bluebells(x,y,z,lv,st);
 else boulder(x,y,z,lv,PAL.rock,st);}
function plantMed(x,y,z,Z,lv,st){const t=rng();
 if(t<.36){grassTuft(x,y,z,lv,PAL.grassDry,1.1);st.tufts++;if(lv===2&&rng()<.5)grassTuft(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv,PAL.grassDry,.9);}
 else if(t<.5)seaPen(x,y,z,lv,st,.9);
 else if(t<.6)kpaw(x,y,z,lv,st);
 else if(t<.72)saltbush(x,y,z,lv,st);
 else if(t<.8){fern(x,y,z,lv);st.ferns++;}
 else if(t<.88){BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rr(.5,1),rr(.4,.8),rr(.5,1)],bright(vary(pick(PAL.saltbush),.02,.08,.05),1.05));st.shrubs++;}
 else if(t<.93)blooms(x,y,z,rr(.8,1.8),ri(3,8),PAL.wattleGold,[.1,.18]);
 else boulder(x,y,z,lv,rng()<.4?PAL.rockRed:PAL.rock,st);}
function plantRip(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){reed(x,y,z,lv);st.tufts++;}else if(t<.6){fern(x,y,z,lv);st.ferns++;}else if(t<.8)seaPen(x,y,z,lv,st,1.2);else{shrub(x,y,z,lv,PAL.shrub,.8);st.shrubs++;}}

// ---------------------------------------------------------------- the understorey (under the crowns)
function sapling(x,y,z,lv,set,st,col){const h=rr(2.5,6),r=h*.01+.03;
 BIO.put('trunk2',[x,y-.1,z],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[r/.4,h,r/.4],col||rodCol(0x9aa4a0));
 for(let i=0,m=lv===2?ri(2,3):1;i<m;i++){const s=rr(1,1.8);BIO.put('ucard',[x+rr(-.3,.3),y+h*rr(.7,1),z+rr(-.3,.3)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*1.2,s],bright(vary(pick(set),.04,.1,.06),1.4));}
 st.saplings++;}
function underPlant(x,y,z,Z,lv,st){const t=rng();
 if(Z.rain>.4){if(t<.2)aroid(x,y,z,lv,st);else if(t<.4){if(okGround(x,z,2))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}else if(t<.6)seaPen(x,y,z,lv,st,1.8);
  else if(t<.72)ginger(x,y,z,lv,st);else if(t<.86)sapling(x,y,z,lv,PAL.glossy,st);else{fern(x,y,z,lv,'forkfern');st.ferns++;}return;}
 if(Z.med>.5){if(t<.3)seaPen(x,y,z,lv,st,1.1);else if(t<.5)saltbush(x,y,z,lv,st);else if(t<.66)kpaw(x,y,z,lv,st);else if(t<.82)sapling(x,y,z,lv,PAL.gum,st,rodCol(0xd8d8d0));else{grassTuft(x,y,z,lv,PAL.grassDry,1);st.tufts++;}return;}
 if(t<.28)seaPen(x,y,z,lv,st,1.5);else if(t<.46){fern(x,y,z,lv,rng()<.3?'forkfern':'frond');st.ferns++;}else if(t<.58)rhodo(x,y,z,lv,st);
 else if(t<.72)sapling(x,y,z,lv,PAL.birch,st,rodCol(0xe8e8e0));else if(t<.86)bluebells(x,y,z,lv,st);else{groundMoss(x,y,z,rr(1.2,2.4));st.moss++;}}

// ---------------------------------------------------------------- the pass
NWLOW.buildFloor=function(R,q){
 reseed(610021);q=q==null?1:q;R=R||2850;means();
 const st={pens:0,aroids:0,ginger:0,rhodo:0,lilies:0,bells:0,kpaw:0,ferns:0,shrubs:0,tufts:0,moss:0,boulders:0,lotus:0,litter:0,shoots:0,logs:0,iris:0,saplings:0,understorey:0};
 const planters=[plantRain,plantShore,plantSub,plantMed,plantRip];
 function plant(x,y,z,lv){if(!okGround(x,z,.7))return;const Z=zones(x,z);
  if(Z.bamboo>.08){if(rng()<smooth(.08,.4,Z.bamboo)){groveFloor(x,y,z,lv,st);return;}}
  const w=[Z.rain*1.3,Z.shore*.9,Z.sub*1.0,Z.med*1.1,Z.rip*.5];let tot=0;for(const v of w)tot+=v;if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  planters[k](x,y,z,Z,lv,st);}
 [[10,560,0],[19,1400,560],[40,1e9,1400]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .5*q*(lv===0?.45:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.72,patchScale:.014,pad:.5});});
 // a cheap second pass of grass: the ground cover of the plain and the hills
 [[5,480,0],[10,1200,480]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return q*.7;},(x,y,z,d)=>{if(blocked(x,z,.4))return;const Z=zones(x,z);
    const w=(Z.med*.9+Z.sub*.4)*(1-Z.bamboo)*.75;if(rng()>w)return;grassTuft(x,y,z,1,Z.med>.5?PAL.grassDry:PAL.grassGreen,Z.med>.5?1.1:.8);st.tufts++;},{patch:.6,patchScale:.02,pad:.3});});
 // the water: lotus and lilies on still fresh water, reeds in the shallows
 [[7,560,0],[14,1400,560]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const h=Y(x,z);if(h>.3||h<-3.5)return 0;
    const Z=zones(x,z);return q*(1-Z.flow*.85)*(.7*smooth(-3.5,-1,h)+.3*smooth(-.9,-.1,h));},
   (x,y,z,d)=>{if(!BIO.clearOf(x,z,1)||blocked(x,z,.5))return;if(y>-.5&&rng()<.35){reed(x,Math.max(y,-.4),z,lv);st.tufts++;}else lotus(x,z,lv,st);},{patch:.8,patchScale:.02,noMask:true,pad:.4});});
 // fallen trees
 BIO.grid(130,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1400)return 0;const Z=zones(x,z);return (Z.rain*.8+Z.sub*.35)*(1-Z.bamboo)*q;},(x,y,z,d)=>{for(let t=0;t<4;t++)if(log(x+rr(-25,25),y,z+rr(-25,25),st))break;},{patch:0,pad:3});
 // THE UNDERSTOREY under the near and mid crowns, scaled by the ground each crown covers
 for(const T of NWLOW.TREES){if(T.lv<1||T.crownR<3.5)continue;const Rc=Math.max(T.spread||T.crownR,T.crownR)*.9,area=Math.PI*Rc*Rc,n=Math.round(Math.min(T.lv===2?30:6,area*(T.lv===2?.02:.004))*q);
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=T.rb*2+.8+(Rc-T.rb*2)*Math.sqrt(rng()),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
   if(BIO.mask(x,z)<=0||!okGround(x,z,.7))continue;const y=Y(x,z);if(y<.3)continue;const Z=zones(x,z);if(Z.bamboo>.2)continue;underPlant(x,y,z,Z,T.lv,st);st.understorey++;}}
 return{under:st};};
})();
