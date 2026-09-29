// ================================================================= EASTERN ABYSS — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (EASTABYSS.zones):
//   the FLATS      near-bare crust: samphire in the lake's own colours where the
//                  ground is damp, pale salt grass, rosette succulents and
//                  jade along the river (the only arid plants in the kit)
//   the MARSH      reeds in green and lake-colour stands, cordgrass meadows
//                  (the gold-green sea of the reference plates), sedge tussocks,
//                  marsh shrubs, ferns under the knee-trees, samphire on the
//                  salty edges, moss in the wet; reeds standing in the shallows
//   the WATER      lily pads on still water only (pools, the lake's quiet
//                  margins), in the lake's complement, with the odd flower;
//                  rafts of floating leaves and water-hyacinth rosettes where
//                  the raft field says so
//   the JUNGLE     a club-moss carpet in three colours, giant ferns, shrubs,
//                  young pipe reeds, blooms on the floor, moss on everything,
//                  fallen scale-trees, mossy boulders -- the understorey is
//                  more colourful than the canopy over it
//   the SAVANNAH   dry grass, the purple Vain fronds in patches, frond shrubs,
//                  rosettes on the rocky ground, boulders
// Three LOD bands along the spine (near / mid / far) at 8 / 16 / 32 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=EASTABYSS.PAL,zones=EASTABYSS.zones,blocked=EASTABYSS.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=EASTABYSS;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));

// ---------------------------------------------------------------- fields local to the floor
const reedRed=(x,z)=>smooth(.52,.64,fbm(x*.0038+3,z*.0038-8,2121,2));      // the lake-colour reed stands
const vainK=(x,z)=>smooth(.46,.62,fbm(x*.0052-5,z*.0052+2,3131,2));       // the Vain frond patches
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);
const raftK=(x,z)=>smooth(.50,.60,fbm(x*.0071-13,z*.0071+17,5151,2));       // where the still water carries leaf rafts instead of lilies
const meadowK=(x,z)=>smooth(.48,.60,fbm(x*.0033+41,z*.0033-23,6161,2));     // the cordgrass meadows of the marsh
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function groundMoss(x,y,z,r){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(PAL.moss,.95,.03));}
function blooms(x,y,z,r,n,set,sz){const c=bright(vary(pick(set||PAL.comp),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.16,.34);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(0,.4),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set){const hc=vary(pick(set||PAL.fern),.06,.14,.07);
 frondCrown(x,y-.1,z,rr(1.8,3.6),lv===2?ri(5,7):lv===1?4:3,.08,.45,bright(hc,1.7));}
function giantFern(x,y,z,lv){const hc=vary(pick(rng()<.25?PAL.compDeep:PAL.fern),.05,.14,.07),R=rr(3,5.5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');
 if(lv===2)frondCrown(x,y+.3,z,R*.5,3,.6,1.0,bright(shade(hc,.1),1.6),'bigfrond');}
function shrub(x,y,z,lv,set){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.4,3.2);
 if(lv===2){if(rng()<.5)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1),Rs],shade(vary(hc,.03,.1,.05),-.15));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}}
 else{const s=Rs*1.7;card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));}}
function clubmoss(x,y,z,lv){const t=rng(),set=t<.5?PAL.marshGreen:t<.8?PAL.comp:PAL.accentDull,h=rr(.35,.7)*(lv===0?1.8:1);
 tuft('clubmoss',x,y,z,h,h*2.2,leafCol(set,1.35,.03));}
function reed(x,y,z,lv,red){const set=red?(rng()<.55?PAL.accentDull:PAL.accent):PAL.reedGreen,h=rr(1.6,3.2)*(lv===0?1.6:1),n=lv===2?ri(3,5):lv===1?2:1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.6):0,hx=x+Math.cos(a)*d,hz=z+Math.sin(a)*d;if(k&&Y(hx,hz)<-.4)continue;
  tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(set,1.35,.025));}}
function cordgrass(x,y,z,lv){const h=rr(1.2,2.2)*(lv===0?1.5:1),n=lv===2?ri(3,5):lv===1?2:1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.7,2.2):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.2,leafCol(PAL.cordgrass,1.3,.03));}}
function sedge(x,y,z,lv){const h=rr(.6,1.3)*(lv===0?1.5:1);tuft('grass',x,y,z,h,h*1.3,leafCol(rng()<.7?PAL.marshGreen:PAL.reedGreen,1.35,.03));}
function samphire(x,y,z,lv,k){const t=rng(),set=t<.7?PAL.accent:PAL.succulent,h=rr(.5,1.1)*(k||1)*(lv===0?1.5:1);
 tuft('samphire',x,y,z,h,h*1.25,leafCol(set,1.3,.03));if(lv===2&&rng()<.4)tuft('samphire',x+rr(-.7,.7),y,z+rr(-.7,.7),h*.7,h*.9,leafCol(set,1.3,.03));}
function saltgrass(x,y,z,lv){const h=rr(.35,.8)*(lv===0?1.6:1);tuft('grass',x,y,z,h,h*1.3,leafCol(PAL.saltgrass,1.25,.02));}
function savgrass(x,y,z,lv){const h=rr(.9,1.7)*(lv===0?1.7:1),n=lv===2?ri(3,5):lv===1?2:1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.4):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(PAL.savgrass,1.3,.03));}}
function rosette(x,y,z,lv,set,k){const R=rr(.35,.9)*(k||1),c=vary(pick(set||PAL.succulent),.03,.1,.06);
 BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.8,R],bright(c.lerp(C(PAL.accent[1]),rr(0,.25)),1.05));
 if(lv===2&&rng()<.15){BIO.beam('rod',[x,y,z],[x+rr(-.2,.2),y+R*2.2,z+rr(-.2,.2)],.03,.02,rodCol(0x8a6a4a));blooms(x,y+R*2.2,z,.25,ri(3,6),PAL.accent,[.08,.16]);}}
function vain(x,y,z,lv){const n=lv===2?ri(2,4):1,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.1+rr(-.3,.3),d=k?rr(.4,1.1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(1.1,2.4),tilt=rr(.15,.55);
  const col=bright(vary(pick(PAL.vain),.02,.1,.06),1.4);
  if(lv>=1)BIO.beam('rod',[px,y-.1,pz],[px+Math.cos(a)*Math.sin(tilt)*h*.55,y+h*.55*Math.cos(tilt),pz+Math.sin(a)*Math.sin(tilt)*h*.55],.04,.03,rodCol(0x4a3a5a));
  const bx=px+Math.cos(a)*Math.sin(tilt)*h*.55,bz=pz+Math.sin(a)*Math.sin(tilt)*h*.55,by=y+h*.55*Math.cos(tilt);
  BIO.put('vain',[bx,by-.05,bz],qEuler(tilt,Math.atan2(Math.cos(a),Math.sin(a)),rr(-.1,.1)),[h*.9,h*.75,1],col);}}
function frondShrub(x,y,z,lv){const hc=vary(pick(PAL.savleaf),.05,.12,.06),Rs=rr(1.2,2.4);
 if(lv===2)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.6,Rs*.7],shade(vary(hc,.03,.1,.05),-.2));
 frondCrown(x,y+Rs*.4,z,Rs*1.3,lv===2?ri(5,7):4,.15,.6,bright(hc,1.5));}
function boulder(x,y,z,lv,set,st){const n=lv===2?ri(1,2):1,Rb=rr(1,3);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;
  if(set===PAL.rock&&lv>=1){BIO.put('mossmat',[bx+rr(-.15,.15)*r,by+h*1.05,bz+rr(-.15,.15)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.6,.9),leafCol(PAL.moss,.95));st.moss++;}}}
function youngReed(x,y,z,lv){const n=ri(3,5),h=rr(2,5),hc=vary(pick(PAL.reedGreen),.03,.1,.05),rc=rodCol(0x6a8a5a);
 BIO.beam('rod',[x,y-.2,z],[x,y+h,z],.06+h*.012,.03,rc);
 for(let k=1;k<=n;k++){const R=rr(.7,1.4)*mix(1.1,.6,k/n);BIO.put('whorl',[x,y+h*k/n,z],qEuler(0,rr(0,TAU),0),[R,R,R],bright(hc,1.2));}}
// a RAFT of floating leaves: a dozen pointed leaves lying every which way on the water, a few tips lifted
function raft(x,y,z,lv,st){const set=PAL.floatleaf,n=lv===2?ri(6,10):ri(3,5),R=rr(1.5,3.2),c=vary(pick(set),.03,.1,.06);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=R*Math.sqrt(rng()),L=rr(.7,1.3);BIO.put('floatleaf',[x+Math.cos(a)*d,.06,z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.25,.05)),[L,1,L],bright(vary(c,.02,.06,.05),1.05));}
 st.rafts++;
 if(lv===2&&rng()<.3){const c2=bright(vary(pick(PAL.hyacinth),.03,.08,.05),1.15),a=rr(0,TAU),hx=x+Math.cos(a)*R*.6,hz=z+Math.sin(a)*R*.6,r=rr(.5,.9);   // a water hyacinth: a fat pale rosette with a lavender spike
  BIO.put('rosette',[hx,.08,hz],qEuler(0,rr(0,TAU),0),[r,r*1.1,r],c2);
  if(rng()<.6){BIO.beam('rod',[hx,.1,hz],[hx,.1+r*1.6,hz],.04,.03,rodCol(0x6a7a4a));blooms(hx,.1+r*1.6,hz,.2,ri(3,6),PAL.vain,[.1,.18]);}}}
function lily(x,y,z,lv,st){const t=rng(),set=t<.55?PAL.pad:t<.8?[0x3a6a3a,0x4a7a40,0x2e5a30]:PAL.accent,R=rr(.45,1.4);
 BIO.put('pad',[x,.05,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[R,1,R],bright(vary(pick(set),.03,.1,.06),1.05));st.lilies++;
 if(lv===2&&rng()<.22)BIO.put('bloom',[x+rr(-.3,.3)*R,.22,z+rr(-.3,.3)*R],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.25,.5),bright(rng()<.5?C(0xf4ecd8):C(pick(PAL.accent)).lerp(C(0xffffff),.35),1.1));
 if(lv===2&&rng()<.3){const R2=R*rr(.5,.8),a=rr(0,TAU);BIO.put('pad',[x+Math.cos(a)*R*1.4,.04,z+Math.sin(a)*R*1.4],qEuler(0,rr(0,TAU),0),[R2,1,R2],bright(vary(pick(set),.03,.1,.06),1.05));st.lilies++;}}
// a fallen scale-tree: a mossed tube with ferns and club-moss along its back
function log(x,y,z,st){const a=rr(0,TAU),L=rr(22,60),r0=rr(1,2),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/8)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.5,t),col:tint(pick(PAL.deadwood),means().wood,rr(.7,1)).lerp(C(PAL.moss[i%3]),rng()<.4?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:9,cap:true});st.logs++;
 for(let s=3;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.75)frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(1,2),5,.05,.4,leafCol(PAL.fern,1.7));
  else tuft('clubmoss',px,py+r*.9,pz,rr(.4,.8),.8,leafCol(PAL.comp,1.35,.03));}
 return true;}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantJungle(x,y,z,Z,lv,st){const t=rng(),damp=dampK(x,z);
 if(t<.36){clubmoss(x,y,z,lv);st.clubmoss++;if(lv>=1){for(let k=0,m=lv===2?ri(1,3):1;k<m;k++)clubmoss(x+rr(-2,2),y,z+rr(-2,2),lv);}if(lv===2&&dampK(x,z)>.45){groundMoss(x+rr(-1,1),y,z+rr(-1,1),rr(1.2,2.4));st.moss++;}}
 else if(t<.52){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.64){fern(x,y,z,lv,rng()<.2?PAL.compDeep:PAL.fern);st.ferns++;}
 else if(t<.76){shrub(x,y,z,lv,rng()<.25?PAL.compDeep:PAL.shrub);st.shrubs++;}
 else if(t<.84){if(damp>.5&&lv>=1){groundMoss(x,y,z,rr(1.4,3));st.moss++;}else{clubmoss(x,y,z,lv);st.clubmoss++;}}
 else if(t<.90){if(lv>=1&&Z.flow>.2){youngReed(x,y,z,lv);st.reeds++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.95){blooms(x,y,z,rr(.8,1.8),ri(3,8),rng()<.7?PAL.comp:PAL.accent);st.blooms++;if(lv===2)clubmoss(x,y,z,lv);}
 else{boulder(x,y,z,lv,PAL.rock,st);}}
function plantMarsh(x,y,z,Z,lv,st){const t=rng(),red=rng()<reedRed(x,z),mk=meadowK(x,z);
 if(t<.55*mk){cordgrass(x,y,z,lv);st.tufts++;if(lv===2&&rng()<.5)cordgrass(x+rr(-2,2),y,z+rr(-2,2),lv);}
 else if(t<.46){reed(x,y,z,lv,red);st.reeds++;}
 else if(t<.62){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.72){if(Z.salt>.25||rng()<.3){samphire(x,y,z,lv,1.2);st.samphire++;}else{reed(x,y,z,lv,red);st.reeds++;}}
 else if(t<.82){shrub(x,y,z,lv,rng()<.4?PAL.accentDull:PAL.marshGreen);st.shrubs++;}
 else if(t<.90){if(lv>=1&&okGround(x,z,2)){fern(x,y,z,lv);st.ferns++;}else{sedge(x,y,z,lv);st.tufts++;}}
 else if(t<.96){if(dampK(x,z)>.5&&lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{reed(x,y,z,lv,red);st.reeds++;}}
 else{if(lv>=1&&Z.flow>.3){youngReed(x,y,z,lv);st.reeds++;}else{blooms(x,y,z,rr(.6,1.4),ri(2,5),rng()<.5?PAL.comp:PAL.accent);st.blooms++;}}}
function plantFlat(x,y,z,Z,lv,st){const t=rng(),damp=Math.max(Z.flow,smooth(.05,.35,Z.wet));
 if(t<.45*damp+.12){samphire(x,y,z,lv,.8+damp*.5);st.samphire++;}
 else if(t<.6){saltgrass(x,y,z,lv);st.tufts++;}
 else if(t<.6+.25*Z.flow){rosette(x,y,z,lv,PAL.succulent);st.rosettes++;}
 else if(t<.93){if(rng()<.5){saltgrass(x,y,z,lv);st.tufts++;}else return;}
 else{boulder(x,y,z,lv,PAL.saltrock,st);}}
function plantSav(x,y,z,Z,lv,st){const t=rng(),vk=vainK(x,z);
 if(t<.5*vk+.04){vain(x,y,z,lv);st.vain++;if(lv===2&&vk>.5)vain(x+rr(-2.5,2.5),y,z+rr(-2.5,2.5),1);}
 else if(t<.70){savgrass(x,y,z,lv);st.tufts++;if(lv===2&&rng()<.4)savgrass(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv);}
 else if(t<.82){frondShrub(x,y,z,lv);st.shrubs++;}
 else if(t<.90){rosette(x,y,z,lv,rng()<.5?PAL.savleaf:PAL.succulent,1.3);st.rosettes++;}
 else if(t<.95){blooms(x,y,z,rr(.6,1.5),ri(2,6),PAL.comp);st.blooms++;}
 else{boulder(x,y,z,lv,PAL.rock,st);}}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.45){reed(x,y,z,lv,rng()<.55);st.reeds++;}
 else if(t<.75){samphire(x,y,z,lv,1.1);st.samphire++;}
 else{sedge(x,y,z,lv);st.tufts++;}}

// ---------------------------------------------------------------- the pass
EASTABYSS.buildFloor=function(R,q){
 reseed(600011);q=q==null?1:q;R=R||3000;means();
 const st={clubmoss:0,ferns:0,shrubs:0,reeds:0,tufts:0,samphire:0,rosettes:0,vain:0,blooms:0,moss:0,boulders:0,lilies:0,rafts:0,logs:0};
 const cur=()=>{const t=BIO.stats[BIO.cur||'biome'];return t?t.tris:0;};
 // one plant of the right zone's mix at (x,z); density by zone
 function plant(x,y,z,lv){if(!okGround(x,z,.8))return;const Z=zones(x,z);
  const w=[Z.jung*1.35,Z.marsh*1.25,Z.flat*.16,Z.sav*1.2,Z.shore*.9],tot=w[0]+w[1]+w[2]+w[3]+w[4];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<4;k++){if(r<w[k])break;r-=w[k];}if(k>=4&&r>w[4])return;
  [plantJungle,plantMarsh,plantFlat,plantSav,plantShore][Math.min(k,4)](x,y,z,Z,lv,st);}
 // three bands along the LOD spine
 const bands=[[7,600,0,[-R,-640,R,640]],[14,1500,600,[-R,-1540,R,1540]],[30,1e9,1500,null]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .82*q*(lv===0?.7:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.75,patchScale:.014,pad:.6,box:b[3]});});
 // the water: lily pads on still water, reeds standing in the shallows
 const wbands=[[7,600,0,[-R,-640,R,640]],[14,1500,600,[-R,-1540,R,1540]]];
 wbands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const h=Y(x,z);if(h>.35||h<-2.6)return 0;
    const Z=zones(x,z);const still=1-Z.flow;return .7*q*still*Z.wet*smooth(.02,-.15,h)*smooth(-2.6,-1.0,h)+.3*q*smooth(-.9,-.1,h)*smooth(.6,.85,Z.wet);},
   (x,y,z,d)=>{if(!BIO.clearOf(x,z,1))return;if(y<-.9||rng()<.72){if(rng()<raftK(x,z))raft(x,y,z,lv,st);else lily(x,y,z,lv,st);}else{const Z=zones(x,z);reed(x,Math.max(y,-.6),z,lv,rng()<.5);st.reeds++;}},{patch:.8,patchScale:.02,noMask:true,pad:.5,box:b[3]});});
 // fallen scale-trees in the jungle
 BIO.grid(170,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1500)return 0;return zones(x,z).jung*.8*q;},(x,y,z,d)=>{for(let t=0;t<4;t++)if(log(x+rr(-30,30),y,z+rr(-30,30),st))break;},{patch:0,pad:3});
 return{under:st};};
})();
