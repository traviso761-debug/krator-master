// ================================================================= THE RIFT — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (RIFT.zones):
//   the SHORE      the algal crust: glasswort in the lake's yellows, algal
//                  mats, stromatolite domes, pale salt grass, reeds at the
//                  water; scum mats floating on the still shallows
//   the JUNGLE     iridescent rosettes, curl succulents, honeycomb barrels,
//                  ball vines over the rocks, scale-moss in yellow-green,
//                  urchin and anemone blooms, the odd terrestrial fern, moss,
//                  fallen frill trees, boulders -- the understorey is more
//                  colourful than the canopy over it
//   the SAVANNAH   dry grass, yellow-green grass, purple fan shrubs, rosettes
//                  shot with red-purple, candle stalks, urchin blooms, termite
//                  spires, red boulders
//   the CLOUD      ferns and mosses on everything, curls, dark shrubs,
//                  groundsel seedlings, anemones, mossy logs
//   the PEAK       pale dry grass, yucca spikes, dark scrub lobes, rubble,
//                  grey rosettes
//   the SLOPE      the dry ridge: dry grass, rosettes, spikes, boulders
// Three LOD bands along the spine (near / mid / far) at 7 / 14 / 30 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=RIFT.PAL,zones=RIFT.zones,blocked=RIFT.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=RIFT;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const irid=(set,k)=>bright(vary(pick(set),.02,.08,.05),k==null?1.2:k);
const softC2=RIFT.softC2,leanN=RIFT.leanN;

// ---------------------------------------------------------------- fields local to the floor
const purpleK=(x,z)=>smooth(.46,.62,fbm(x*.0052-5,z*.0052+2,3131,2));      // the purple fan shrub patches
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col,c2){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col,{c2:c2||null});}
function groundMoss(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(set||PAL.moss,.95,.03));}
function blooms(item,x,y,z,r,n,set,sz){const c=bright(vary(pick(set||PAL.comp),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.2,.4);BIO.put(item,[x+Math.cos(a)*d,y+rr(.1,.6),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set){const hc=vary(pick(set||PAL.fern),.06,.14,.07);
 frondCrown(x,y-.1,z,rr(1.8,3.6),lv===2?ri(5,7):lv===1?4:3,.08,.45,bright(hc,1.7));}
function giantFern(x,y,z,lv,set){const hc=vary(pick(set||PAL.cloudFern),.05,.14,.07),R=rr(3,5.5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');
 if(lv===2)frondCrown(x,y+.3,z,R*.5,3,.6,1.0,bright(shade(hc,.1),1.6),'bigfrond');}
function shrub(x,y,z,lv,set){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.4,3.2);
 if(lv===2){if(rng()<.5)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1),Rs],shade(vary(hc,.03,.1,.05),-.15));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}}
 else{const s=Rs*1.7;card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));}}
// scale-moss: the jungle's carpet, yellow-green shot with purple
function scalemoss(x,y,z,lv){const t=rng(),set=t<.6?PAL.yellowGreen:t<.85?PAL.jungleGreen:PAL.comp,h=rr(.35,.7)*(lv===0?1.8:1);
 const col=leafCol(set,1.35,.03);tuft('clubmoss',x,y,z,h,h*2.2,col,rng()<.6?softC2(irid(PAL.irid.GP,1.1),col,.5):null);}
// the iridescent rosette (a fan bromeliad): magenta, green and blue at once
function irosette(x,y,z,lv,set,c2set,k){const R=rr(.5,1.3)*(k||1),c=vary(pick(set||PAL.jungleGreen),.04,.1,.06),rx=rr(-.08,.08),ry=rr(0,TAU),rz=rr(-.08,.08);
 BIO.put('irosette',[x,y-.02,z],qEuler(rx,ry,rz),[R,R*rr(.7,1.0),R],bright(c,1.1),{c2:softC2(irid(c2set||PAL.irid.GP,1.15),c,.3),n:leanN(ry,.5)});
 if(lv===2&&rng()<.2){BIO.beam('rod',[x,y,z],[x+rr(-.2,.2),y+R*2,z+rr(-.2,.2)],.03,.02,rodCol(0x5a4a6a));BIO.put('urchin',[x,y+R*2,z],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.3,.5),bright(C(pick(PAL.comp)),1.15));}}
function curls(x,y,z,lv){const n=lv===2?ri(1,2):1,hc=vary(pick(PAL.tealGreen),.03,.08,.05);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,.7):0,h=rr(.9,2.2),w=h*rr(.9,1.3);BIO.put('curl',[x+Math.cos(a)*d,y-.1,z+Math.sin(a)*d],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[w,h,w],bright(vary(hc,.02,.06,.05),1.25),{c2:softC2(irid(PAL.irid.GB,1.15),hc,.35),n:leanN(a,.3+.6*d)});}}
function barrels(x,y,z,lv,st){const n=lv===2?ri(1,3):lv===1?2:1,hc=vary(pick(PAL.pore),.02,.08,.05);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,1.6):0,r=rr(.35,.8),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d;
  BIO.put('barrel',[bx,Y(bx,bz)-.1,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r,r*rr(.8,1.2),r],bright(vary(hc,.02,.06,.05),1.05));st.barrels++;}}
function ballvine(x,y,z,lv,st){const n=lv===2?ri(4,7):lv===1?3:3,a=rr(0,TAU),hc=vary(pick(PAL.ball),.02,.08,.05),rc=rodCol(0x6a7a3a);let px=x,pz=z,py=y;
 for(let k=0;k<n;k++){const r=rr(.25,.55),aa=a+rr(-.7,.7),nx=px+Math.cos(aa)*rr(.5,1.1),nz=pz+Math.sin(aa)*rr(.5,1.1),ny=Y(nx,nz)+r*.7;
  if(lv>=1)BIO.beam('rod',[px,py,pz],[nx,ny,nz],.035,.03,rc);BIO.put('ball',[nx,ny,nz],qEuler(0,rr(0,TAU),0),r,bright(vary(hc,.02,.05,.05),rr(1.0,1.2)));px=nx;pz=nz;py=ny;st.balls++;}
 // a few near vines end in a big melon split in two, the halves fallen apart with their yellow flesh up (FRUIT.md:
 // fruitBallmelonFlesh). Drawn from the spot's hash, not rng(), so the rest of the floor keeps its layout. 48 tris each.
 if(lv===2&&h3(x,z,7.31)<.14){const r=.42+.13*h3(z,x,1.7),a2=h3(x,z,2.9)*TAU,d=r*.62,ex=px+Math.cos(a)*(r+.35),ez=pz+Math.sin(a)*(r+.35);
  for(const s of [1,-1]){const hx=ex+Math.cos(a2)*d*s,hz=ez-Math.sin(a2)*d*s,hy=Y(hx,hz)+r*.78,q=qEuler(0,a2,-.42*s);
   BIO.put('melonhalf',[hx,hy,hz],q,r,bright(hc,1.1));BIO.put('melonflesh',[hx,hy,hz],q,r,bright(C(0xf0d850),1.0+.12*h3(hx,hz,.5)));}
  st.splits++;}}
function reed(x,y,z,lv,set){const h=rr(1.6,3.2)*(lv===0?1.6:1),n=lv===2?ri(3,5):lv===1?2:1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.6):0,hx=x+Math.cos(a)*d,hz=z+Math.sin(a)*d;if(k&&Y(hx,hz)-BIO.waterH(hx,hz)<-.4)continue;
  tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(set||PAL.tealGreen,1.3,.025));}}
function glasswort(x,y,z,lv,k){const t=rng(),set=t<.7?PAL.accent:PAL.alga,h=rr(.5,1.1)*(k||1)*(lv===0?1.5:1);
 tuft('samphire',x,y,z,h,h*1.25,leafCol(set,1.3,.03));if(lv===2&&rng()<.4)tuft('samphire',x+rr(-.7,.7),y,z+rr(-.7,.7),h*.7,h*.9,leafCol(set,1.3,.03));}
function saltgrass(x,y,z,lv){const h=rr(.35,.8)*(lv===0?1.6:1);tuft('grass',x,y,z,h,h*1.3,leafCol([0xc8c0a0,0xd0c8a8,0xb8b090],1.25,.02));}
function stromatolite(x,y,z,lv,st){const n=lv===2?ri(1,3):1,Rb=rr(.5,1.6);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(1,1.6):0,r=Rb*(i?rr(.4,.8):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz);
  BIO.put('lobe',[bx,by-.1,bz],qEuler(0,rr(0,TAU),0),[r,r*rr(.5,.8),r],bright(vary(pick(PAL.alga),.02,.1,.08),.9).lerp(C(PAL.salt),rr(.2,.5)));st.domes++;}}
function savgrass(x,y,z,lv,set){const h=rr(.9,1.7)*(lv===0?1.7:1),n=lv===2?ri(3,5):lv===1?2:1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.4):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set||PAL.savgrass,1.3,.03));}}
function rosette(x,y,z,lv,set,k){const R=rr(.35,.9)*(k||1),c=vary(pick(set||PAL.succulent),.03,.1,.06);
 BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.8,R],bright(c,1.05));
 if(lv===2&&rng()<.15){BIO.beam('rod',[x,y,z],[x+rr(-.2,.2),y+R*2.2,z+rr(-.2,.2)],.03,.02,rodCol(0x8a6a4a));blooms('urchin',x,y+R*2.2,z,.25,ri(2,4),PAL.accent,[.12,.22]);}}
function purpleFan(x,y,z,lv){const hc=vary(pick(PAL.potato),.02,.08,.05),Rs=rr(.8,1.6);
 if(lv===2)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs*.6,Rs*.5,Rs*.6],shade(vary(hc,.02,.08,.05),-.25));
 const n=lv===2?ri(4,7):3,a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),L=Rs*rr(2,2.8);
  BIO.put('fan',[x+Math.cos(a)*Rs*.2,y+Rs*.2,z+Math.sin(a)*Rs*.2],qEuler(rr(.3,.9),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.08,.08)),[L,L,1],bright(vary(hc,.02,.06,.05),1.35));}}
function candle(x,y,z,lv){const h=rr(2,5),rc=rodCol(0x8a8a7a);BIO.beam('rod',[x,y-.1,z],[x,y+h*.66,z],.06,.04,rc);
 BIO.put('candle',[x,y+h*.6,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.14,h*.38,h*.14],bright(vary(pick(PAL.lavender),.02,.06,.05),1.3));}
function termite(x,y,z,lv,st){const h=rr(1.5,4);BIO.put('cone',[x,y-.2,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*.45,h,h*.45],rockTint(PAL.redrock,rr(.5,.8)));
 if(lv===2&&rng()<.5)BIO.put('cone',[x+rr(-.8,.8),y-.2,z+rr(-.8,.8)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*.3,h*.6,h*.3],rockTint(PAL.redrock,rr(.5,.8)));st.spires++;}
function spikes(x,y,z,lv,set){const h=rr(.8,1.8)*(lv===0?1.5:1);tuft('spike',x,y,z,h,h*1.3,leafCol(set||[0x7a8a5a,0x6a7a4a,0x8a9a6a],1.3,.03));}
function scrub(x,y,z,lv){const hc=vary(pick(PAL.highDark),.04,.1,.05),Rs=rr(.8,2);
 BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.5,.8),Rs],shade(hc,-.1));if(lv===2)card(x,y+Rs*.4,z,Rs*1.4,Rs*.9,bright(vary(hc,.03,.08,.05),1.35),.3);}
function boulder(x,y,z,lv,set,st,mossy){const n=lv===2?ri(1,2):1,Rb=rr(1,3);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;
  if(mossy&&lv>=1){BIO.put('mossmat',[bx+rr(-.15,.15)*r,by+h*1.05,bz+rr(-.15,.15)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.6,.9),leafCol(PAL.moss,.95));st.moss++;}
  if(mossy&&lv===2&&rng()<.35)irosette(bx+rr(-.3,.3)*r,by+h*1.0,bz+rr(-.3,.3)*r,1,PAL.jungleGreen,PAL.irid.GP,.7);}}
function scum(x,z,lv,st){const R=rr(.6,1.8),w=BIO.waterH(x,z);
 BIO.put('pad',[x,w+.04,z],qEuler(rr(-.02,.02),rr(0,TAU),rr(-.02,.02)),[R,1,R],bright(vary(pick(PAL.scum),.02,.1,.06),1.0));st.scum++;
 if(lv===2&&rng()<.4){const R2=R*rr(.5,.9),a=rr(0,TAU);BIO.put('pad',[x+Math.cos(a)*R*1.3,w+.035,z+Math.sin(a)*R*1.3],qEuler(0,rr(0,TAU),0),[R2,1,R2],bright(vary(pick(PAL.scum),.02,.1,.06),1.0));st.scum++;}}
// a fallen frill tree: a ribbed tube gone dark, mossed, rosettes and scale-moss along its back
function log(x,y,z,st,cloud){const a=rr(0,TAU),L=rr(22,60),r0=rr(1,2.2),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/8)+1,pts=[],ph=rr(0,TAU);
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.5,t),col:tint(pick(PAL.deadwood),means().wood,rr(.7,1)).lerp(C(PAL.moss[i%3]),rng()<.5?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:9,cap:true,rfn:(i,ang)=>1+.08*Math.cos(9*ang+ph)});st.logs++;
 for(let s=3;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.7){if(cloud)frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(1,2),5,.05,.4,leafCol(PAL.cloudFern,1.7));else irosette(px,py+r*.9,pz,1,PAL.jungleGreen,PAL.irid.GP,.8);}
  else tuft('clubmoss',px,py+r*.9,pz,rr(.4,.8),.8,leafCol(PAL.yellowGreen,1.35,.03),irid(PAL.irid.GP,1.1));}
 return true;}

// the new understorey: zebra bromeliads, prism ferns, tongue succulents, big red anemones, pompoms; and the savannah's purple
function zebra(x,y,z,lv){const R=rr(.5,1.1),c=C(0xffffff).lerp(C(pick([0xe0a0c0,0xd090b0,0xf0b0c8,0xc890a0])),.5);
 BIO.put('zebra',[x,y-.02,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*.7,R],c);
 if(lv===2&&rng()<.25)BIO.put('zebra',[x+rr(-1.2,1.2),y-.02,z+rr(-1.2,1.2)],qEuler(0,rr(0,TAU),0),[R*.7,R*.5,R*.7],c);}
function prismFern(x,y,z,lv){const hc=vary(pick(PAL.tealGreen),.05,.1,.06),R=rr(1.6,3.2),n=lv===2?ri(6,9):4,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=R*rr(.8,1.1);BIO.put('prismfrond',[x,y-.05,z],qEuler(rr(-.15,.15),-a,rr(.05,.5)),[L,L*rr(.85,1.05),L*1.3],bright(hc,rr(1.3,1.6)),{n:[Math.cos(a)*.6,.8,Math.sin(a)*.6],c2:irid(PAL.irid.OR,1.2)});}}
function tongues(x,y,z,lv){const h=rr(.8,2.0)*(lv===0?1.4:1),hc=vary(pick([0x6ab040,0x7ac048,0x8ad050,0x5aa838]),.03,.08,.05);
 tuft('tongue',x,y,z,h,h*1.1,bright(hc,1.25),softC2(irid(PAL.irid.YG,1.1),hc,.3));if(lv===2&&rng()<.4)tuft('tongue',x+rr(-.8,.8),y,z+rr(-.8,.8),h*.7,h*.8,bright(hc,1.2),null);}
function bigAnemone(x,y,z,lv){const R=rr(.9,1.8),c=bright(vary(pick([0xd03a3a,0xe04a30,0xc02a4a,0xf06040]),.02,.08,.05),1.2);
 BIO.put('anemone',[x,y+R*.35,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),R*2,c);if(lv===2){BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[R*.5,R*.35,R*.5],shade(c,-.3));}}
function pompoms(x,y,z,lv){const n=lv===2?ri(2,4):1,c=bright(vary(pick([0xd03a3a,0xe04a40,0xd8a030,0xe8b040]),.02,.08,.05),1.15);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.5,1.4):0,R=rr(.3,.7);BIO.put('pompom',[x+Math.cos(a)*d,y+R*.5,z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),R*2,c);}}
function vain(x,y,z,lv){const n=lv===2?ri(2,4):1,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.1+rr(-.3,.3),d=k?rr(.6,1.6):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(2.2,4.8),tilt=rr(.15,.55);
  const col=bright(vary(pick(PAL.vain),.02,.1,.06),1.4);
  if(lv>=1)BIO.beam('rod',[px,y-.1,pz],[px+Math.cos(a)*Math.sin(tilt)*h*.55,y+h*.55*Math.cos(tilt),pz+Math.sin(a)*Math.sin(tilt)*h*.55],.04,.03,rodCol(0x4a3a5a));
  const bx=px+Math.cos(a)*Math.sin(tilt)*h*.55,bz=pz+Math.sin(a)*Math.sin(tilt)*h*.55,by=y+h*.55*Math.cos(tilt);
  BIO.put('vain',[bx,by-.05,bz],qEuler(tilt,Math.atan2(Math.cos(a),Math.sin(a)),rr(-.1,.1)),[h*.9,h*.75,1],col);}}
function heath(x,y,z,lv){const t=rng(),set=t<.55?PAL.potato:t<.8?[0xd06030,0xe07040,0xc85028,0xd88050]:[0x8a3a6a,0x9a4a7a,0x7a2e5a],h=rr(.4,.9)*(lv===0?1.6:1),n=lv===2?ri(2,4):1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,1.6):0;tuft('clubmoss',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*2,leafCol(set,1.3,.03),null);}}
function pineSucculent(x,y,z,lv){const R=rr(.35,.8),hc=vary(pick([0x8a8ad0,0x7a90c8,0x9a88d8,0xa090e0,0x9a78c8]),.03,.06,.05);
 BIO.put('pinecone',[x,y-.02,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*rr(1.2,1.7),R],bright(hc,1.15),{n:[0,1,0],c2:softC2(bright(C(0xe090c0),1.1),hc,.3)});}
const vainK=(x,z)=>smooth(.48,.62,fbm(x*.0044+9,z*.0044-6,4141,2));   // the Vain frond patches
// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantJungle(x,y,z,Z,lv,st){const t=rng(),damp=dampK(x,z);
 if(t<.30){scalemoss(x,y,z,lv);st.scalemoss++;if(lv>=1){for(let k=0,m=lv===2?ri(1,3):1;k<m;k++)scalemoss(x+rr(-2,2),y,z+rr(-2,2),lv);}if(lv===2&&damp>.45){groundMoss(x+rr(-1,1),y,z+rr(-1,1),rr(1.2,2.4));st.moss++;}}
 else if(t<.44){irosette(x,y,z,lv,rng()<.5?PAL.jungleGreen:PAL.comp,rng()<.6?PAL.irid.GP:PAL.irid.GB,rr(1,1.6));st.rosettes++;if(lv===2&&rng()<.4)irosette(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),1,PAL.jungleGreen,PAL.irid.GB,1);}
 else if(t<.51){curls(x,y,z,lv);st.curls++;}
 else if(t<.58){if(lv>=1&&okGround(x,z,2)){barrels(x,y,z,lv,st);}else{scalemoss(x,y,z,lv);st.scalemoss++;}}
 else if(t<.64){if(lv>=1){ballvine(x,y,z,lv,st);}else{scalemoss(x,y,z,lv);st.scalemoss++;}}
 else if(t<.70){scalemoss(x,y,z,lv);st.scalemoss++;}
 else if(t<.74){if(rng()<.3){fern(x,y,z,lv,PAL.fern);st.ferns++;}else{shrub(x,y,z,lv,rng()<.4?PAL.compDeep:PAL.jungleGreen);st.shrubs++;}}
 else if(t<.77){zebra(x,y,z,lv);st.zebras++;}
 else if(t<.79){const R=rr(.8,1.6),hc=vary(pick(RIFT.SPECIES[18].leaf),.03,.1,.06);for(let k=0,m=lv===2?4:2;k<m;k++){const a=rr(0,TAU),d=R*rr(.1,.6);BIO.put('croton',[x+Math.cos(a)*d,y+R*rr(.3,.8),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R,R*.7,R],bright(hc,1.3),{n:[Math.cos(a)*.5,.8,Math.sin(a)*.5],c2:irid(PAL.irid.MG,1.2)});}st.shrubs++;}
 else if(t<.84){prismFern(x,y,z,lv);st.ferns++;}
 else if(t<.88){tongues(x,y,z,lv);st.tongues++;}
 else if(t<.91){if(damp>.5&&lv>=1){groundMoss(x,y,z,rr(1.4,3));st.moss++;}else{scalemoss(x,y,z,lv);st.scalemoss++;}}
 else if(t<.94){if(rng()<.5){bigAnemone(x,y,z,lv);}else{pompoms(x,y,z,lv);}st.blooms++;}
 else if(t<.97){blooms(rng()<.5?'urchin':'anemone',x,y,z,rr(.8,1.8),ri(3,8),rng()<.6?PAL.comp:PAL.accent,[.3,.6]);st.blooms++;if(lv===2)scalemoss(x,y,z,lv);}
 else{boulder(x,y,z,lv,PAL.rock,st,true);}}
function plantShore(x,y,z,Z,lv,st){const t=rng(),damp=smooth(.3,.8,Z.wet);
 if(t<.36){glasswort(x,y,z,lv,.8+damp*.6);st.glasswort++;}
 else if(t<.52){saltgrass(x,y,z,lv);st.tufts++;}
 else if(t<.64){if(lv>=1){groundMoss(x,y,z,rr(1,2.6),PAL.alga);st.moss++;}else{glasswort(x,y,z,lv,1);st.glasswort++;}}
 else if(t<.74){stromatolite(x,y,z,lv,st);}
 else if(t<.84){if(Z.h<1.2){reed(x,y,z,lv,rng()<.5?PAL.tealGreen:PAL.accentDull);st.reeds++;}else{rosette(x,y,z,lv,PAL.succulent);st.rosettes++;}}
 else if(t<.92){if(rng()<.5){saltgrass(x,y,z,lv);st.tufts++;}else return;}
 else{boulder(x,y,z,lv,PAL.saltrock,st,false);}}
function plantSav(x,y,z,Z,lv,st){const t=rng(),pk=purpleK(x,z),vk=vainK(x,z);
 if(t<.24){savgrass(x,y,z,lv);st.tufts++;if(lv===2&&rng()<.4)savgrass(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv);}
 else if(t<.34){savgrass(x,y,z,lv,PAL.savgreen);st.tufts++;}
 else if(t<.34+.15*vk+.02){vain(x,y,z,lv);st.vain++;if(lv===2&&vk>.5)vain(x+rr(-2.5,2.5),y,z+rr(-2.5,2.5),1);}
 else if(t<.46+.12*pk+.02){purpleFan(x,y,z,lv);st.purple++;if(lv===2&&pk>.5)purpleFan(x+rr(-2.5,2.5),y,z+rr(-2.5,2.5),1);}
 else if(t<.62){heath(x,y,z,lv);st.tufts++;}
 else if(t<.70){pineSucculent(x,y,z,lv);st.rosettes++;}
 else if(t<.78){irosette(x,y,z,lv,rng()<.6?PAL.savgreen:PAL.succulent,PAL.irid.RP,1.2);st.rosettes++;}
 else if(t<.85){candle(x,y,z,lv);st.candles++;}
 else if(t<.91){blooms('urchin',x,y,z,rr(.6,1.5),ri(2,6),rng()<.5?PAL.comp:PAL.accent,[.25,.5]);st.blooms++;}
 else if(t<.95){termite(x,y,z,lv,st);}
 else{boulder(x,y,z,lv,rng()<.5?PAL.redrock:PAL.rock,st,false);}}
function plantCloud(x,y,z,Z,lv,st){const t=rng();
 if(t<.30){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv,PAL.cloudFern);st.ferns++;}}
 else if(t<.50){if(lv>=1){groundMoss(x,y,z,rr(1.4,3.2));st.moss++;}else{fern(x,y,z,lv,PAL.cloudFern);st.ferns++;}}
 else if(t<.58){fern(x,y,z,lv,PAL.cloudFern);st.ferns++;}
 else if(t<.64){tongues(x,y,z,lv);st.tongues++;}
 else if(t<.72){curls(x,y,z,lv);st.curls++;}
 else if(t<.82){shrub(x,y,z,lv,PAL.highDark);st.shrubs++;}
 else if(t<.86){irosette(x,y,z,lv,rng()<.4?PAL.cloudTeal:PAL.highLight,PAL.irid.LG,1.3);st.rosettes++;}
 else if(t<.90){const R=rr(.6,1.2);BIO.put('zebra',[x,y-.02,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*.7,R],C(0xffffff).lerp(C(pick([0xc0e0a0,0xe0a0c0,0xa0d0b0])),.5));st.zebras++;}
 else if(t<.95){blooms(rng()<.5?'anemone':'bloom',x,y,z,rr(.6,1.4),ri(3,7),PAL.flowers,[.3,.5]);st.blooms++;}
 else{boulder(x,y,z,lv,PAL.rock,st,true);}}
// the garrigue: silver and olive tufts, purple heath, thyme-like blooms
function silverTuft(x,y,z,lv){const h=rr(.4,.9)*(lv===0?1.5:1),n=lv===2?ri(2,3):1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.5,1.2):0;tuft('clubmoss',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*2,leafCol(rng()<.6?PAL.silver:PAL.garrigue,1.25,.02),null);}}
function plantPeak(x,y,z,Z,lv,st){const t=rng();
 if(t<.26){savgrass(x,y,z,lv,[0xc8c0a0,0xb8b090,0xd0c8a8,0xa8a880]);st.tufts++;}
 else if(t<.42){silverTuft(x,y,z,lv);st.tufts++;}
 else if(t<.52){spikes(x,y,z,lv);st.spikes++;}
 else if(t<.62){scrub(x,y,z,lv);st.shrubs++;}
 else if(t<.70){heath(x,y,z,lv);st.tufts++;}
 else if(t<.80){irosette(x,y,z,lv,rng()<.5?PAL.silver:PAL.succulent,PAL.irid.RP,1.1);st.rosettes++;}
 else if(t<.86){candle(x,y,z,lv);st.candles++;}
 else if(t<.92){blooms(rng()<.5?'urchin':'bloom',x,y,z,rr(.5,1.2),ri(3,7),[0x9a5ad0,0xe0c030,0xf0d040,0xb070e0,0xf08040],[.2,.4]);st.blooms++;}
 else{boulder(x,y,z,lv,PAL.rock,st,false);}}
function plantSlope(x,y,z,Z,lv,st){const t=rng();
 if(t<.40){savgrass(x,y,z,lv);st.tufts++;}
 else if(t<.52){irosette(x,y,z,lv,PAL.succulent,PAL.irid.RP,1.1);st.rosettes++;}
 else if(t<.62){silverTuft(x,y,z,lv);st.tufts++;}
 else if(t<.70){spikes(x,y,z,lv,PAL.savgreen);st.spikes++;}
 else if(t<.80){purpleFan(x,y,z,lv);st.purple++;}
 else if(t<.88){scrub(x,y,z,lv);st.shrubs++;}
 else{boulder(x,y,z,lv,PAL.rock,st,false);}}

// ---------------------------------------------------------------- the pass
RIFT.buildFloor=function(R,q){
 reseed(600011);q=q==null?1:q;R=R||3000;means();
 const st={scalemoss:0,zebras:0,tongues:0,vain:0,rosettes:0,curls:0,barrels:0,balls:0,splits:0,ferns:0,shrubs:0,reeds:0,tufts:0,glasswort:0,domes:0,purple:0,candles:0,spikes:0,blooms:0,moss:0,boulders:0,spires:0,scum:0,logs:0};
 // one plant of the right zone's mix at (x,z); density by zone
 function plant(x,y,z,lv){if(!okGround(x,z,.8))return;const Z=zones(x,z);
  const w=[Z.jung*1.5,Z.shore*.9,Z.sav*1.2,Z.cloud*1.5,Z.peak*1.1,Z.slope*.9],tot=w[0]+w[1]+w[2]+w[3]+w[4]+w[5];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<5;k++){if(r<w[k])break;r-=w[k];}if(k>=5&&r>w[5])return;
  [plantJungle,plantShore,plantSav,plantCloud,plantPeak,plantSlope][Math.min(k,5)](x,y,z,Z,lv,st);}
 // three bands along the LOD spine (which runs north-south here); the runtime LOD draws each only within its
 // range of the camera (RIFT.LOD: the near band's plants are under a pixel past it, the ground's paint carries on)
 const bands=[[7,600,0,[-640,-R,640,R]],[14,1500,600,[-1540,-R,1540,R]],[30,1e9,1500,null]],LOD=RIFT.LOD,rng3=[LOD.floor,LOD.midFloor,LOD.farFloor];
 bands.forEach((b,bi)=>{const lv=2-bi;BIO.range=rng3[bi];
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .82*q*(lv===0?.7:lv===1?.85:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.75,patchScale:.014,pad:.6,box:b[3]});});
 // the water: scum mats on the still shallows, reeds standing at the shore
 const wbands=[[7,600,0,[-640,-R,640,R]],[14,1500,600,[-1540,-R,1540,R]]];
 wbands.forEach((b,bi)=>{const lv=2-bi;BIO.range=rng3[bi];
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const h=Y(x,z)-BIO.waterH(x,z);if(h>.35||h<-2.4)return 0;   // h: the ground against the local water
    const Z=zones(x,z);const still=1-Z.flow;return .6*q*still*smooth(.02,-.15,h)*smooth(-2.4,-.9,h)*(.5+.5*smooth(.45,.65,fbm(x*.004+1,z*.004-2,808,2)))+.25*q*smooth(-.9,-.1,h)*Z.shore;},
   (x,y,z,d)=>{if(!BIO.clearOf(x,z,1))return;const w=BIO.waterH(x,z);if(y-w<-.9||rng()<.78){scum(x,z,lv,st);}else{reed(x,Math.max(y,w-.6),z,lv,rng()<.5?PAL.tealGreen:PAL.accentDull);st.reeds++;}},{patch:.8,patchScale:.02,noMask:true,pad:.5,box:b[3]});});
 // fallen frill trees in the jungle, mossy logs in the cloud forest
 BIO.range=LOD.logs;
 BIO.grid(170,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1500)return 0;const Z=zones(x,z);return (Z.jung*.8+Z.cloud*.5)*q;},(x,y,z,d)=>{const cloud=zones(x,z).cloud>.5;for(let t=0;t<4;t++)if(log(x+rr(-30,30),y,z+rr(-30,30),st,cloud))break;},{patch:0,pad:3});
 // the spine's far band: the far band's 30 m planting over the near and mid bands too, drawn only where they are not
 // (past their range from the camera, BIO.minRange), so the floor thins with distance instead of stopping at a chunk's
 // edge. Planted last, so every draw from the PRNG before it is as it was.
 BIO.range=LOD.farFloor;
 BIO.grid(30,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=1500)return 0;return .82*q*.7;},(x,y,z,d)=>{BIO.minRange=BIO.lodD(x,z)<600?LOD.floor:LOD.midFloor;plant(x,y,z,0);},{patch:.75,patchScale:.014,pad:.6,box:[-1540,-R,1540,R]});
 BIO.range=null;BIO.minRange=0;
 return{under:st};};
})();
