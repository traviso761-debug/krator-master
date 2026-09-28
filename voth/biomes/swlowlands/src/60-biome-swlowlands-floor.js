// ================================================================= SOUTHWESTERN LOWLANDS — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (SWLOW.zones):
//   the BEACH       sea oats and dune grass, beach vine with lilac flowers
//   the RAINFOREST  elephant ears, heliconias in red and gold, ferns and forking
//                   ferns, bromeliads on the ground, young cane palms, moss
//   the BAYOU       saw palmetto, ferns, purple flag iris, sedge, moss
//   the WATER       lily pads carpeting the still bayou, water hyacinth, duckweed,
//                   reeds in the shallows
//   the PLAIN       green glades, saw-palmetto carpets under the flatwood pines,
//                   ferns, azaleas in flower, leaf litter
//   the HILLS       chaparral (dark and red scrub, yuccas with tall flower stalks)
//                   in patches through golden grass with feather-grass tussocks,
//                   poppies, lupins, salvia, mullein spikes, sage, agaves, aloes,
//                   pincushion shrubs, sandstone and red rock
// Three LOD bands along the spine (near / mid / far) at 7 / 14 / 30 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SWLOW.PAL,zones=SWLOW.zones,blocked=SWLOW.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=SWLOW;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
// patch fields local to the floor
const poppyK=(x,z)=>smooth(.5,.64,fbm(x*.0045-5,z*.0045+2,3131,2));
const lupinK=(x,z)=>smooth(.52,.66,fbm(x*.0051+9,z*.0051-3,3132,2));
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function groundMoss(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(set||PAL.moss,.95,.03));}
function blooms(x,y,z,r,n,set,sz,h){const c=bright(vary(pick(set),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.16,.34);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(.05,h==null?.4:h),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set,item){const hc=vary(pick(set||PAL.fern),.06,.14,.07);
 frondCrown(x,y-.1,z,rr(1.6,3.2)*(item==='forkfern'?1.3:1),lv===2?ri(5,7):lv===1?4:3,.05,.45,bright(hc,1.7),item);}
function giantFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.05,.14,.07),R=rr(3,5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');}
function shrub(x,y,z,lv,set,k){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.2,2.8)*(k||1);
 if(lv===2){if(rng()<.6)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1),Rs],shade(vary(hc,.03,.1,.05),-.15));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}}
 else{const s=Rs*1.7;card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));}
 return Rs;}
function palmetto(x,y,z,lv,st){const hc=vary(pick(PAL.palmetto),.03,.1,.06),n=lv===2?ri(5,9):lv===1?4:3,a0=rr(0,TAU),L=rr(1.1,2);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3);BIO.put('fan',[x+Math.cos(a)*.3,y-.1,z+Math.sin(a)*.3],qEuler(rr(.15,.9),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.1,.1)),[L*rr(.9,1.2),L*rr(.9,1.1),1],bright(vary(hc,.02,.06,.05),1.45));}st.palmettos++;}
function earCluster(x,y,z,lv,st){const n=lv===2?ri(3,6):2,hc=vary(pick(PAL.aroid),.03,.1,.06);
 for(let k=0;k<n;k++){const a=rr(0,TAU),L=rr(1,2.2),stem=rr(.4,1.2),px=x+Math.cos(a)*.3,pz=z+Math.sin(a)*.3;
  if(lv===2)BIO.beam('rod',[px,y,pz],[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],.03,.02,rodCol(0x4a6a3a));
  BIO.put('heart',[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],qEuler(rr(.5,1.1),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.2,.2)),[L*.8,L,1],bright(vary(hc,.02,.08,.06),1.45));}st.ears++;}
function heliconia(x,y,z,lv,st){const h=rr(1.2,2.6),hc=vary(pick(PAL.aroid),.03,.1,.06);tuft('spike',x,y,z,h,h*.8,bright(hc,1.4));
 if(lv>=1){const col=C(pick(PAL.heliconia));for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),bx=x+Math.cos(a)*.3,bz=z+Math.sin(a)*.3,top=y+h*rr(.6,.95);
  if(lv===2)BIO.beam('rod',[bx,y,bz],[bx,top,bz],.025,.02,rodCol(0x4a6a3a));
  for(let j=0;j<ri(4,7);j++)BIO.put('bloom',[bx+rr(-.1,.1),top-j*.14,bz+rr(-.1,.1)],qEuler(rr(-.3,.3),rr(0,TAU),rr(.6,1.2)),rr(.22,.34),bright(vary(col,.02,.06,.05),1.1));}}st.helic++;}
function brom(x,y,z,st){const R=rr(.4,.9),c=rng()<.5?vary(pick(PAL.heliconia),.02,.1,.06):vary(pick(PAL.aroid),.03,.1,.06);
 BIO.put('brom',[x,y-.03,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*1.1,R],bright(c,1.1));st.brom++;}
function youngCane(x,y,z,lv,st){const S=SWLOW.SPECIES[4],n=ri(2,4);
 for(let k=0;k<n;k++){const px=x+rr(-.6,.6),pz=z+rr(-.6,.6),h=rr(1.2,3);BIO.beam('rod',[px,y-.1,pz],[px,y+h,pz],.05,.04,rodCol(pick(S.crownshaft)));
  frondCrown(px,y+h,pz,rr(1.2,2),ri(3,5),-.8,-.2,leafCol(S.leaf,1.4),'palmfrond');}st.canes++;}
function iris(x,y,z,lv,st){const h=rr(.7,1.2);tuft('spike',x,y,z,h,h*.6,leafCol(PAL.reed,1.35,.03));if(lv>=1)blooms(x,y+h*.75,z,.35,ri(2,4),PAL.iris,[.14,.24],.25);st.iris++;}
function reed(x,y,z,lv){const h=rr(1.4,2.8)*(lv===0?1.5:1),n=lv===2?ri(2,4):1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,2):0;tuft('reed',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(PAL.reed,1.35,.025));}}
function sedge(x,y,z,lv,set){const h=rr(.5,1.1)*(lv===0?1.5:1);tuft('grass',x,y,z,h,h*1.3,leafCol(set||PAL.grassGreen,1.35,.03));}
function grassTuft(x,y,z,lv,set,hk,k){const h=rr(.5,1.1)*(hk||1)*(lv===0?1.6:1),n=lv===2?(k||ri(2,4)):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,1.8):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set,1.3,.03));}}
function azalea(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.shrub,.8);if(lv>=1)blooms(x,y+Rs*.6,z,Rs*.9,lv===2?ri(10,18):5,PAL.azalea,[.2,.34],Rs*.6);st.azaleas++;}
function yucca(x,y,z,lv,st){const h=rr(.8,1.4);tuft('spike',x,y,z,h,h*1.3,leafCol(PAL.agave,1.3,.02));
 if(lv>=1&&rng()<.5){const sh=rr(2.5,4.5),c=C(pick(PAL.cream));BIO.beam('rod',[x,y+h*.4,z],[x,y+sh,z],.05,.035,rodCol(0x7a6a4a));
  for(let j=0;j<(lv===2?ri(22,34):8);j++){const yy=y+sh*rr(.5,1),a=rr(0,TAU),d=(y+sh-yy)*.28+.12;BIO.put('bloom',[x+Math.cos(a)*d,yy,z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.2,.32),bright(c,1.15));}}st.yuccas++;}
function mullein(x,y,z,lv,st){const h=rr(1.2,2.4),c=C(pick(PAL.mullein));BIO.put('rosette',[x,y,z],qEuler(0,rr(0,TAU),0),[.45,.3,.45],leafCol(PAL.sage,1.1));
 if(lv>=1){BIO.beam('rod',[x,y,z],[x,y+h,z],.04,.03,rodCol(0x8a9a78));for(let j=0;j<(lv===2?12:5);j++){const yy=y+h*rr(.35,1),a=rr(0,TAU);BIO.put('bloom',[x+Math.cos(a)*.08,yy,z+Math.sin(a)*.08],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.1,.16),bright(c,1.1));}}st.spikes++;}
function aloe(x,y,z,lv,st){const h=rr(.5,.9);tuft('spike',x,y,z,h,h*1.5,leafCol(PAL.agave,1.25,.02));
 if(lv>=1){for(let k=0,m=ri(1,3);k<m;k++){const px=x+rr(-.3,.3),pz=z+rr(-.3,.3),sh=rr(.9,1.6),c=C(pick(PAL.aloe));BIO.beam('rod',[px,y,pz],[px,y+sh,pz],.03,.02,rodCol(0x6a5a3a));
  for(let j=0;j<ri(4,7);j++)BIO.put('bloom',[px+rr(-.06,.06),y+sh-j*.09,pz+rr(-.06,.06)],qEuler(rr(-.3,.3),rr(0,TAU),rr(.8,1.2)),rr(.12,.18),bright(c,1.1));}}st.aloes++;}
function agave(x,y,z,lv,st){const R=rr(.5,1.2);BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,R*.9,R],bright(vary(pick(PAL.agave),.02,.08,.05),1.05));st.agaves++;}
function pincushion(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.chap,.6);if(lv>=1){const c=C(pick(PAL.pincushion));for(let k=0;k<(lv===2?ri(5,10):3);k++){const a=rr(0,TAU),d=Rs*rr(.2,.8);
 BIO.put('pompom',[x+Math.cos(a)*d,y+Rs*rr(.6,1.1),z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),rr(.13,.2),bright(c,.85));}}st.shrubs++;}
function chaparral(x,y,z,lv,st){const red=rng()<.22,set=red?PAL.chapRed:PAL.chap,Rs=rr(1,2.2);
 if(lv===2){
  for(let i=0;i<3;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;BIO.put('manz',[x+Math.cos(a)*d,y+Rs*rr(.4,.7),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[Rs*1.5,Rs*1.1,Rs*1.5],bright(vary(pick(set),.03,.1,.06),1.4),{n:[0,1,0]});}}
 else BIO.put('manz',[x,y+Rs*.5,z],qEuler(0,rr(0,TAU),0),[Rs*1.9,Rs*1.3,Rs*1.9],bright(vary(pick(set),.03,.1,.06),1.35),{n:[0,1,0]});
 st.chap++;}
function boulder(x,y,z,lv,set,st){const n=lv===2?ri(1,3):1,Rb=rr(.8,2.6);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.5,.9);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;}}
function lily(x,z,lv,st,dense){const t=rng(),R=rr(.35,1.1);
 BIO.put('pad',[x,.04,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[R,1,R],bright(vary(pick(PAL.pad),.03,.1,.06),1.05));st.lilies++;
 if(lv===2&&rng()<.18)BIO.put('bloom',[x+rr(-.3,.3)*R,.2,z+rr(-.3,.3)*R],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.22,.4),bright(rng()<.6?C(0xf6f0e0):C(0xf4c0d0),1.1));
 for(let k=0,m=dense?ri(2,5):(rng()<.3?1:0);k<m;k++){const R2=R*rr(.5,1),a=rr(0,TAU),d=R*rr(1.3,2.6);BIO.put('pad',[x+Math.cos(a)*d,.035,z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[R2,1,R2],bright(vary(pick(PAL.pad),.03,.1,.06),1.05));st.lilies++;}}
function hyacinth(x,z,lv,st){for(let k=0,m=ri(2,5);k<m;k++){const px=x+rr(-.8,.8),pz=z+rr(-.8,.8),R=rr(.25,.45);BIO.put('pad',[px,.08,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R,1,R],bright(vary(pick(PAL.aroid),.03,.1,.06),1.15));}
 if(lv>=1)blooms(x,.1,z,.6,ri(3,7),PAL.hyacinth,[.14,.24],.45);st.lilies++;}
function duckweed(x,z,st){BIO.put('mossmat',[x,.03,z],qEuler(0,rr(0,TAU),0),[rr(1.5,4),1,rr(1.5,4)],leafCol(PAL.duckweed,1.1,.02));st.duckweed++;}
// a fallen tree: a silvered tube with moss, ferns and bromeliads along its back
function log(x,y,z,st,tropical){const a=rr(0,TAU),L=rr(14,40),r0=rr(.6,1.4),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/7)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.5))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.55,t),col:tint(pick(PAL.deadwood),means().wood,rr(.55,.85)).lerp(C(PAL.moss[i%3]),rng()<.35?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:8,cap:true});st.logs++;
 for(let s=2;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.75)frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(.8,1.6),5,.05,.4,leafCol(PAL.fern,1.7));
  else if(tropical)brom(px,py+r*.9,pz,st);
  else BIO.put('fungus',[px,py+r*.3,pz],qEuler(0,rr(0,TAU),0),[rr(.3,.6),rr(.12,.2),rr(.3,.6)],C(pick(PAL.fungus)));}
 return true;}

// ---------------------------------------------------------------- the understorey (under the crowns)
// A SAPLING: the next generation in the shade -- a thin stem and a few leaf clumps
function sapling(x,y,z,lv,set,st){const h=rr(1.8,4.5),r=h*.012+.03;
 BIO.put('trunk2',[x,y-.1,z],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[r/.4,h,r/.4],rodCol(0x6a5a48));
 for(let i=0,m=lv===2?ri(2,4):2;i<m;i++){const s=rr(1.2,2.2),a=rr(0,TAU),d=rr(0,.5);BIO.put('ucard',[x+Math.cos(a)*d,y+h*rr(.6,1),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.8,s],bright(vary(pick(set),.04,.1,.06),1.4));}
 st.saplings++;}
// a berry shrub for the dry woods (toyon-like): dark leaves, red berries
function toyon(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.chap,.9);if(lv>=1)blooms(x,y+Rs*.7,z,Rs*.8,lv===2?ri(6,12):4,PAL.berry,[.1,.16],Rs*.5);st.shrubs++;}
// one understorey plant under a crown in zone Z: the shade layer, heavier than the open floor's mix
function underPlant(x,y,z,Z,lv,st){const t=rng();
 if(Z.rain>.4){if(t<.2)earCluster(x,y,z,lv,st);else if(t<.38){if(okGround(x,z,2))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}
  else if(t<.5){fern(x,y,z,lv,PAL.fern,'forkfern');st.ferns++;}else if(t<.62)heliconia(x,y,z,lv,st);
  else if(t<.76){shrub(x,y,z,lv,PAL.aroid,1.2);st.shrubs++;}else if(t<.88)sapling(x,y,z,lv,PAL.aroid,st);else if(lv>=1)youngCane(x,y,z,lv,st);else fern(x,y,z,lv);return;}
 if(Z.swamp>.4){if(t<.35)palmetto(x,y,z,lv,st);else if(t<.62){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
  else if(t<.78)iris(x,y,z,lv,st);else if(t<.9)sapling(x,y,z,lv,PAL.shrub,st);else{shrub(x,y,z,lv,PAL.shrub);st.shrubs++;}return;}
 if(Z.med>.5){if(t<.34)toyon(x,y,z,lv,st);else if(t<.52)chaparral(x,y,z,lv,st);else if(t<.66){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.6,1.2),shade(vary(pick(PAL.sage),.03,.08,.05),-.1));card(x,y+.6,z,1.6,1.1,leafCol(PAL.sage,1.25));st.shrubs++;}
  else if(t<.8)sapling(x,y,z,lv,PAL.cork,st);else if(t<.9){fern(x,y,z,lv);st.ferns++;}else yucca(x,y,z,lv,st);return;}
 // the plain
 if(t<.24){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}else if(t<.4)azalea(x,y,z,lv,st);
 else if(t<.56){shrub(x,y,z,lv,PAL.shrub,1.1);st.shrubs++;}else if(t<.7)sapling(x,y,z,lv,PAL.sycamore,st);
 else if(t<.82)palmetto(x,y,z,lv,st);else if(t<.9)earCluster(x,y,z,lv,st);else{groundMoss(x,y,z,rr(1.2,2.4));st.moss++;}}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantRain(x,y,z,Z,lv,st){const t=rng();
 if(t<.17){earCluster(x,y,z,lv,st);}
 else if(t<.29){if(lv>=1&&okGround(x,z,2.5))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}
 else if(t<.40){fern(x,y,z,lv,PAL.fern,'forkfern');st.ferns++;}
 else if(t<.50){heliconia(x,y,z,lv,st);}
 else if(t<.57){brom(x,y,z,st);if(lv===2)fern(x+rr(-1,1),y,z+rr(-1,1),lv);}
 else if(t<.70){shrub(x,y,z,lv,PAL.aroid);st.shrubs++;}
 else if(t<.79){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.86){if(lv>=1)youngCane(x,y,z,lv,st);else earCluster(x,y,z,lv,st);}
 else if(t<.93){blooms(x,y,z,rr(.8,1.8),ri(3,8),PAL.heliconia);st.blooms++;if(lv===2)fern(x,y,z,lv);}
 else palmetto(x,y,z,lv,st);}
function plantSwamp(x,y,z,Z,lv,st){const t=rng();
 if(t<.24)palmetto(x,y,z,lv,st);
 else if(t<.42){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
 else if(t<.58)iris(x,y,z,lv,st);
 else if(t<.74){if(rng()<.5)reed(x,y,z,lv);else sedge(x,y,z,lv);st.tufts++;}
 else if(t<.86){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.8));st.moss++;}else{sedge(x,y,z,lv);st.tufts++;}}
 else if(t<.93)earCluster(x,y,z,lv,st);
 else{blooms(x,y,z,rr(.6,1.4),ri(2,5),PAL.iris);st.blooms++;}}
function plantSub(x,y,z,Z,lv,st){const t=rng();
 if(Z.pineK>.5&&t<.55){palmetto(x,y,z,lv,st);if(lv===2&&rng()<.5)palmetto(x+rr(-2,2),y,z+rr(-2,2),1,st);return;}   // the flatwoods' palmetto carpet
 if(t<.30){grassTuft(x,y,z,lv,PAL.grassGreen,1,null);st.tufts++;}
 else if(t<.40)palmetto(x,y,z,lv,st);
 else if(t<.53){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
 else if(t<.62)azalea(x,y,z,lv,st);
 else if(t<.72){groundMoss(x,y,z,rr(1.2,2.6),PAL.litter);st.litter++;}
 else if(t<.81){shrub(x,y,z,lv,PAL.shrub);st.shrubs++;}
 else if(t<.87){if(lv>=1&&dampK(x,z)>.5){groundMoss(x,y,z,rr(1,2.2));st.moss++;}else{grassTuft(x,y,z,lv,PAL.grassGreen);st.tufts++;}}
 else if(t<.94){blooms(x,y,z,rr(.6,1.5),ri(3,7),rng()<.5?PAL.azalea:PAL.lupin);st.blooms++;}
 else if(t<.97){earCluster(x,y,z,lv,st);}
 else boulder(x,y,z,lv,PAL.rock,st);}
function plantMed(x,y,z,Z,lv,st){const t=rng();
 if(rng()<Z.chapK*.9){   // the chaparral
  if(t<.62)chaparral(x,y,z,lv,st);
  else if(t<.74)yucca(x,y,z,lv,st);
  else if(t<.82){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.6,1.2),shade(vary(pick(PAL.sage),.03,.08,.05),-.1));card(x,y+.6,z,1.6,1.1,leafCol(PAL.sage,1.25));st.shrubs++;}
  else if(t<.9){grassTuft(x,y,z,lv,PAL.grassGold,1.1);st.tufts++;}
  else if(t<.95)pincushion(x,y,z,lv,st);
  else boulder(x,y,z,lv,rng()<.4?PAL.rockRed:PAL.rock,st);
  return;}
 const pk=poppyK(x,z),lk=lupinK(x,z);   // the golden grassland
 if(t<.40){grassTuft(x,y,z,lv,PAL.grassGold,1.1);st.tufts++;if(lv===2&&rng()<.5)grassTuft(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv,PAL.grassGold,1);}
 else if(t<.50){grassTuft(x,y,z,lv,PAL.stipa,.9,ri(3,5));st.tufts++;}             // feather-grass tussocks
 else if(t<.50+.14*pk+.02){blooms(x,y,z,rr(1,2.2),lv===2?ri(8,16):ri(3,6),PAL.poppy,[.12,.22],.25);st.blooms++;}
 else if(t<.66+.08*lk){const h=rr(.5,.9);tuft('lupin',x,y,z,h,h*.9,bright(vary(pick(rng()<.6?PAL.lupin:[0x8a4ab8,0x9a5ac8]),.03,.08,.06),1.25));st.spikes++;}
 else if(t<.74){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.5,1),shade(vary(pick(PAL.sage),.03,.08,.05),-.05));st.shrubs++;}
 else if(t<.79)mullein(x,y,z,lv,st);
 else if(t<.84)agave(x,y,z,lv,st);
 else if(t<.88)aloe(x,y,z,lv,st);
 else if(t<.91)pincushion(x,y,z,lv,st);
 else if(t<.95){grassTuft(x,y,z,lv,PAL.grassGold,.8);st.tufts++;}
 else boulder(x,y,z,lv,rng()<.35?PAL.rockRed:PAL.rock,st);}
function plantBeach(x,y,z,Z,lv,st){const t=rng();
 if(t<.45){grassTuft(x,y,z,lv,PAL.stipa,1.3,ri(2,4));st.tufts++;}
 else if(t<.62){sedge(x,y,z,lv,PAL.grassGreen);st.tufts++;}
 else if(t<.8){for(let k=0,m=ri(2,5);k<m;k++){const R=rr(.2,.4);BIO.put('pad',[x+rr(-1.5,1.5),y+.05,z+rr(-1.5,1.5)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R,1,R],leafCol(PAL.aroid,1.2));}
  if(lv>=1)blooms(x,y,z,1.5,ri(2,5),[0xc890e0,0xd8a0e8],[.12,.2],.1);st.vines++;}
 else if(t<.9)palmetto(x,y,z,lv,st);
 else boulder(x,y,z,lv,PAL.rock,st);}
function plantRip(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){reed(x,y,z,lv);st.tufts++;}
 else if(t<.6){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.75){fern(x,y,z,lv);st.ferns++;}
 else if(t<.85)iris(x,y,z,lv,st);
 else{shrub(x,y,z,lv,PAL.shrub,.8);st.shrubs++;}}

// ---------------------------------------------------------------- the pass
SWLOW.buildFloor=function(R,q){
 reseed(600021);q=q==null?1:q;R=R||2850;means();
 const st={saplings:0,understorey:0,ferns:0,shrubs:0,tufts:0,blooms:0,moss:0,boulders:0,lilies:0,duckweed:0,logs:0,palmettos:0,ears:0,helic:0,brom:0,canes:0,iris:0,azaleas:0,yuccas:0,spikes:0,aloes:0,agaves:0,chap:0,litter:0,vines:0};
 const planters=[plantRain,plantSwamp,plantSub,plantMed,plantBeach,plantRip];
 function plant(x,y,z,lv){if(!okGround(x,z,.7))return;const Z=zones(x,z);
  const w=[Z.rain*1.3,Z.swamp*1.2,Z.sub*.95,Z.med*1.1,Z.beach*.6,Z.rip*.5];let tot=0;for(const v of w)tot+=v;if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  planters[k](x,y,z,Z,lv,st);}
 // three bands along the LOD spine (the spine runs NW-SE, so no box window: the disc is cheap to walk)
 const bands=[[10,560,0],[19,1400,560],[40,1e9,1400]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .56*q*(lv===0?.42:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.72,patchScale:.014,pad:.5});});
 // a second, cheap pass of grass: the ground cover of the hills and the glades (tufts are 6 triangles)
 [[5,480,0],[10,1200,480]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return q*.7;},(x,y,z,d)=>{if(blocked(x,z,.4))return;const Z=zones(x,z);
    const w=(Z.med*(1-Z.chapK*.6)+Z.sub*.4*(1-Z.pineK)+Z.beach*.3)*.75;if(rng()>w)return;
    const set=Z.med>.5?(rng()<.15?PAL.stipa:PAL.grassGold):PAL.grassGreen;grassTuft(x,y,z,1,set,Z.med>.5?1.1:.8);st.tufts++;},{patch:.6,patchScale:.02,pad:.3});});
 // the water: lily pads carpeting still fresh water, hyacinth, duckweed; reeds in the shallows. The sea gets none.
 [[8,560,0],[16,1400,560]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const h=Y(x,z);if(h>.3||h<-4)return 0;
    const Z=zones(x,z);if(Z.salt>.35)return 0;return q*(1-Z.flow*.85)*(.8*smooth(-4,-1,h)+.3*smooth(-.9,-.1,h));},
   (x,y,z,d)=>{if(!BIO.clearOf(x,z,1)||blocked(x,z,.5))return;const k=rng();
    if(y>-.5&&k<.35){reed(x,Math.max(y,-.4),z,lv);st.tufts++;}
    else if(k<.72)lily(x,z,lv,st,dampK(x,z)>.45);
    else if(k<.86)hyacinth(x,z,lv,st);else duckweed(x,z,st);},{patch:.8,patchScale:.02,noMask:true,pad:.4});});
 // THE UNDERSTOREY: under every near and mid crown, a shade layer scattered over the
 // ground the crown covers (clear of the bole), heavier than the open floor's mix. It
 // follows the trees, so it is thickest where the canopy is.
 for(const T of SWLOW.TREES){if(T.lv<1||T.crownR<5)continue;const Rc=Math.max(T.spread||T.crownR,T.crownR)*.85,area=Math.PI*Rc*Rc,n=Math.round(Math.min(T.lv===2?48:8,area*(T.lv===2?.011:.0018))*q);   // by the ground the crown covers
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=T.rb*2+.8+(Math.max(T.spread||T.crownR,T.crownR)*.85-T.rb*2)*Math.sqrt(rng()),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
   if(BIO.mask(x,z)<=0||!okGround(x,z,.7))continue;const y=Y(x,z);if(y<.3)continue;underPlant(x,y,z,zones(x,z),T.lv,st);st.understorey++;}}
 // fallen trees in the rainforest, the bayou and the plain
 BIO.grid(120,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1400)return 0;const Z=zones(x,z);return (Z.rain*.8+Z.swamp*.4+Z.sub*.35)*q;},
  (x,y,z,d)=>{const trop=zones(x,z).rain>.4;for(let t=0;t<4;t++)if(log(x+rr(-25,25),y,z+rr(-25,25),st,trop))break;},{patch:0,pad:3});
 return{under:st};};
})();
