// ================================================================= EASTERN BADLANDS — floor
// Everything under the trees, by zone, from the same climate fields the tree pass reads (EBADLANDS.zones):
//   the WASTE    the hot north: sparse bunchgrass, mirage grass, spiral mats, moonflower cacti, prickly pear,
//                red buckwheat, stones and the odd toadstool rock
//   the VENTS    sulphur chimneys and crust mounds (yellow, ochre, white), gold parasols, spiral mats, basalt
//   the STEPPE   the Great Basin's sagebrush sea: sage, rabbitbrush in flower, bunchgrass, phlox cushions,
//                buckwheat, prickly pear, stones and boulders
//   the BADLAND  banded stones and boulders, toadstool rocks, a little grass (green where it is wet)
//   the VALE     the green valleys: thick grass, wildflowers, lupine spikes, phlox, ferns at the wet
//   the PINES    bunchgrass, needle litter, cones, fallen logs, lupine and phlox
//   the BOREAL   needle litter, moss, ferns, low shrubs, fallen logs, lichened boulders
//   the TUNDRA   cushion plants, moss and lichen, sedge, tiny alpine flowers, dwarf willow, grey scree
//   the RIPARIAN reeds and sedge at the water, grass, ferns, wildflowers, river cobbles; fan cups where it is hot
//   the RIM      stones, bunchgrass, buckwheat, phlox, lichen
// Three LOD bands along the spine (near / mid / far) at 9 / 18 / 36 m cells; then the badland's toadstool rocks,
// the vents' chimney clusters, fallen logs, and reeds standing in the shallows.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=EBADLANDS.PAL,zones=EBADLANDS.zones,blocked=EBADLANDS.blocked,C=EBADLANDS.C;
const {bright,shade,vary,tint,means,leafCol}=EBADLANDS;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rockRed),.02,.06,.06),means().rock,k==null?rr(.4,.65):k);
const crustTint=(set,k)=>tint(vary(pick(set),.02,.06,.05),means().crust,k==null?rr(.6,.8):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const blooms=(x,y,z,r,n,set,sz)=>EBADLANDS.blooms(x,y,z,r,n,set,sz,{flat:true,tilt:.4,s0:.14,s1:.3});
// a cluster round a point the mask accepted: each satellite tests the mask itself
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};

// ---------------------------------------------------------------- fields local to the floor
const sageK=(x,z)=>fbm(x*.008+11,z*.008-5,4141,2);                       // the sagebrush sea's density
const mirK=(x,z)=>smooth(.5,.62,fbm(x*.006-3,z*.006+9,4242,2));          // mirage-grass patches
const flowerK=(x,z)=>smooth(.45,.65,fbm(x*.01+4,z*.01+1,4343,2));         // wildflower drifts

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){BIO.put(item,[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
// a SAGEBRUSH: silver-grey, a twisted woody base, a rounded head of small leaves
function sage(x,y,z,lv,k){const hc=vary(pick(PAL.sage),.03,.08,.05),Rs=rr(.5,1.1)*(k||1);
 if(lv===2){BIO.beam('rod',[x,y-.1,z],[x+rr(-.2,.2),y+Rs*.45,z+rr(-.2,.2)],.07,.04,rodCol(0x5a5048));
  for(let i=0,m=ri(2,3);i<m;i++){const a=rr(0,TAU),d=i?Rs*rr(.25,.5):0;card('small',x+Math.cos(a)*d,y+Rs*rr(.55,.8),z+Math.sin(a)*d,Rs*rr(1.0,1.3),Rs*rr(.6,.8),bright(vary(hc,.02,.06,.05),1.35),.25);}}
 else{if(lv===1)BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[Rs*.75,Rs*.6,Rs*.75],shade(hc,-.2));card('small',x,y+Rs*.5,z,Rs*1.5,Rs*.85,bright(hc,1.35));}}
function rabbit(x,y,z,lv){const hc=vary(pick(PAL.rabbit),.03,.08,.05),Rs=rr(.5,1.0);
 card('small',x,y+Rs*.5,z,Rs*1.3,Rs*.9,bright(hc,1.3),.2);
 if(lv>=1)for(let i=0,m=lv===2?ri(3,6):2;i<m;i++){const a=rr(0,TAU),d=Rs*rr(0,.45);BIO.put('plume',[x+Math.cos(a)*d,y+Rs*rr(.85,1.15),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),Rs*rr(.35,.55),leafCol(PAL.rabbitFl,1.2,.02,.06,.05),{n:[0,1,0]});}}
function bunch(x,y,z,lv,set){const h=rr(.35,.85)*(lv===0?1.6:1);around(x,z,lv===2?ri(2,4):1,.4,1.4,(px,pz)=>tuft('bunch',px,y,pz,h*rr(.8,1.1),h*1.2,leafCol(set||PAL.bunch,1.3,.03)));}
function grass(x,y,z,lv,k){const h=rr(.3,.7)*(k||1)*(lv===0?1.6:1);around(x,z,lv===2?ri(3,6):lv===1?2:1,.4,1.6,(px,pz)=>tuft('grass',px,y,pz,h*rr(.8,1.15),h*1.5,leafCol(PAL.grass,1.25,.04,.12,.06)));}
function mirage(x,y,z,lv){const h=rr(.9,1.8);around(x,z,lv===2?ri(2,5):1,.5,1.6,(px,pz)=>tuft('mirage',px,y,pz,h*rr(.8,1.1),h*.9,leafCol(PAL.mirage,1.25,.02,.06,.04)));}
function reed(x,y,z,lv){const h=rr(1.2,2.4)*(lv===0?1.5:1);around(x,z,lv===2?ri(2,4):lv===1?2:1,.6,2,(hx,hz,k)=>{if(k&&BIO.depth(hx,hz)>.8)return;tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.0),leafCol(PAL.reed,1.3,.025));});}
function sedge(x,y,z,lv){const h=rr(.4,.9)*(lv===0?1.5:1);tuft('reed',x,y,z,h,h*1.2,leafCol(PAL.sedge,1.3,.03));}
function flowers(x,y,z,lv,set){if(lv===2&&rng()<.45){const h=rr(.4,.9);around(x,z,ri(2,4),.3,1,(px,pz)=>tuft('spike',px,y,pz,h*rr(.8,1.1),h*.5,leafCol(set||[0x7a5ab8,0x8a6ac8,0x6a4aa8],1.2,.02)));}
 else blooms(x,y,z,rr(.6,1.4),lv===2?ri(4,9):2,set||PAL.flowers);}
function phlox(x,y,z,lv){const R=rr(.3,.7);BIO.put('lobe',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[R,R*.35,R],leafCol(PAL.cushion,.9,.03));
 blooms(x,y+R*.3,z,R*.8,lv===2?ri(6,12):3,PAL.phlox,[.1,.18]);}
function buck(x,y,z,lv){const hc=leafCol(PAL.buckLeaf,1.2,.02),Rs=rr(.3,.6);card('small',x,y+Rs*.4,z,Rs*1.4,Rs*.6,hc,.2);
 if(lv>=1)blooms(x,y+Rs*.7,z,Rs*.8,lv===2?ri(5,10):3,PAL.buck,[.1,.18]);}
function pear(x,y,z,lv){const hc=vary(pick(PAL.pear),.03,.08,.05);
 around(x,z,lv===2?ri(3,6):2,.3,1.1,(px,pz)=>{const h=rr(.3,1.1);card('paddle',px,y+h,pz,rr(.9,1.5),rr(.8,1.2),bright(vary(hc,.02,.06,.05),1.3),.35);});
 if(lv===2&&rng()<.35)blooms(x,y+1.3,z,.7,ri(2,4),[0xe8c030,0xe07070,0xf09050],[.12,.2]);
 // tunas: red fruit along the pads' upper edges (generic_fruit_tuna)
 if(lv>=1&&rng()<.55)around(x,z,ri(3,7),.2,.9,(px,pz)=>{const r=rr(.045,.065);BIO.put('fruit',[px,y+rr(.9,1.6),pz],qEuler(rr(-.3,.3),rr(0,TAU),0),[r,r*1.35,r],bright(vary(pick(PAL.tuna),.02,.06,.05),1.05));});}
// the moonflower cactus: segmented teal columns, white night flowers (alienflora 17)
function moonflower(x,y,z,lv){const hc=leafCol(PAL.moon,1.15,.02,.06,.05),n=lv===2?ri(4,8):3,tops=[];
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.6),h=rr(.5,1.4),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('column',[px,y-.1,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[.4,h,.4],hc);tops.push([px,y+h,pz]);
  if(lv===2&&rng()<.5){BIO.put('column',[px,y+h-.1,pz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[.3,h*.5,.3],hc);}}
 if(lv>=1)for(const t of tops){const k=rng();
  if(k<.45)BIO.put('bloom',[t[0],t[1]+.12,t[2]],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.45,.7),bright(C(pick(PAL.cream)),1.2));
  else if(k<.7)BIO.put('fruit',[t[0]+rr(-.08,.08),t[1]+.05,t[2]+rr(-.08,.08)],qEuler(rr(-.3,.3),rr(0,TAU),0),[.07,.1,.07],bright(vary(pick(PAL.pitaya),.02,.06,.05),1.1));}}   // moonfruit: generic_fruit_pitaya
function spiral(x,y,z,lv){const R=rr(.4,.9);BIO.put('spiral',[x,y-.02,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,R*rr(.8,1.2),R],bright(C(0xf0f0f0),rr(1,1.2)));}
// gold parasols: thin stems under translucent yellow caps, in a cluster (alienflora, untitled)
function parasols(x,y,z,lv){const n=lv===2?ri(4,9):2,sc=rodCol(0xb8402a);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,1.4):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.7,2.2),r=rr(.25,.6),lean=[rr(-.12,.12)*h,rr(-.12,.12)*h];
  if(i&&BIO.mask(px,pz)<=0)continue;
  BIO.beam('rod',[px,y-.05,pz],[px+lean[0],y+h,pz+lean[1]],.035,.025,sc);
  BIO.put('parasol',[px+lean[0],y+h,pz+lean[1]],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r,r,r],leafCol(PAL.parasol,1.35,.02,.06,.04));}}
// fan cups: ribbed brown funnels in a group, the tallest at the middle (alien3)
function fans(x,y,z,lv){const n=lv===2?ri(3,7):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.5):0,s=(i?rr(.4,.8):rr(.8,1.2)),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
 if(i&&BIO.mask(px,pz)<=0)continue;BIO.put('funnel',[px,y-.05,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s*.8,s,s*.8],leafCol(PAL.fan,1.2,.02,.06,.05));}}
function fern(x,y,z,lv){const n=lv===2?ri(5,8):3,hc=vary(pick(PAL.fern),.03,.08,.05),L=rr(.6,1.2);
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3);BIO.put('fern',[x,y+.05,z],qEuler(rr(-.1,.1),-a,rr(.2,.6)),[L,L*.8,L*rr(.9,1.2)],bright(vary(hc,.02,.05,.05),1.3));}}
function moss(x,y,z,set){const R=rr(.4,1.1);BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,1,R],leafCol(set||PAL.moss,1.0,.02));}
function litter(x,y,z){const R=rr(.8,1.8);BIO.put('litter',[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],leafCol([0x8a6a4a,0x7a5a3e,0x9a7a52],1.0,.02));}
function cushion(x,y,z,lv){const R=rr(.25,.6);BIO.put('lobe',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[R,R*.45,R],leafCol(PAL.cushion,.95,.03));
 if(lv===2&&rng()<.4)blooms(x,y+R*.35,z,R*.7,ri(3,7),[0xe8e0f0,0xd880c0,0xf0e060],[.06,.1]);}
function willow(x,y,z,lv){const hc=leafCol(PAL.willow,1.25,.02),Rs=rr(.3,.6);card('small',x,y+Rs*.3,z,Rs*1.6,Rs*.5,hc,.15);if(lv===2)card('small',x+rr(-.4,.4),y+Rs*.25,z+rr(-.4,.4),Rs*1.2,Rs*.4,hc,.15);}
function shrub(x,y,z,lv,set){const hc=leafCol(set||PAL.oak,1.25,.03),Rs=rr(.4,.9);if(lv>=1)BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.55,Rs*.7],shade(hc,-.3));card('small',x,y+Rs*.45,z,Rs*1.4,Rs*.8,hc,.25);}
function stone(x,y,z,lv,set,st,k){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5)*(k||1);
 if(putRooted(px,pz,'stone',[px,y+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(set)))st.stones++;});}
function boulder(x,y,z,lv,set,st,lich){const Rb=rr(.8,2.6);
 around(x,z,lv===2?ri(1,2):1,Rb*.7,Rb*1.2,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.55,.95);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));if(ok)st.boulders++;
  if(lv===2&&rng()<(lich||.3)){const L=[[bx+rr(-.2,.2)*r,by+h*1.05,bz+rr(-.2,.2)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.4,.8),leafCol(PAL.lichen,1.1,.02)];if(ok)BIO.put('lichen',...L);}});}
function toadstool(x,y,z,lv,st){const h=rr(3,9),w=h*rr(.3,.5),set=pick([PAL.rockRed,PAL.rockBand,PAL.rockGrey]);
 if(putRooted(x,z,'toadstool',[x,y-.3,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[w,h,w*rr(.8,1.2)],rockTint(set,rr(.6,.85))))st.toadstools++;
 for(let i=0,n=lv===2?ri(3,6):1;i<n;i++){const a=rr(0,TAU),d=w*rr(.7,1.8),r=rr(.25,.7),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;putRooted(px,pz,'stone',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*1.2,r*.7,r*1.2],rockTint(set));}}
// a SULPHUR CHIMNEY cluster: knobbly pillars in ochre, yellow and white, crust mounds round their feet (danakil.jpg)
function chimneys(x,y,z,lv,st){const n=lv===2?ri(2,6):ri(1,2);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(1,5):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=i?rr(1,3.5):rr(2.5,7),w=h*rr(.32,.5);if(BIO.mask(px,pz)<=0)continue;
  BIO.put('chimney',[px,Y(px,pz)-.3,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w,h,w],crustTint(rng()<.5?PAL.sulphur:PAL.ochre,rr(.75,.95)));st.chimneys++;}
 for(let i=0,m=lv===2?ri(2,5):1;i<m;i++)mound(x+rr(-4,4),z+rr(-4,4),st);}
function mound(x,z,st){if(BIO.mask(x,z)<=0)return;const r=rr(.5,1.6),set=rng()<.55?PAL.sulphur:rng()<.5?PAL.crust:PAL.ochre;
 BIO.put('mound',[x,Y(x,z)-.12,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[r,rr(.15,.4),r],crustTint(set));st.mounds++;}
// a fallen log: a tube along the ground with its stubs (pine and spruce: dark; bristlecone and cottonwood: bleached)
function log(x,y,z,st,pale){const a=rr(0,TAU),L=rr(5,14),r0=rr(.2,.45),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/3)+1,pts=[];
 const col=pale?tint(pick(PAL.deadwood),means().wood,rr(.8,1.0)):tint(C(0x6a5644),means().wood,rr(.7,.9));
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.5+Math.sin(t*Math.PI)*.15,z:pz,r:mix(r0,r0*.5,t),col:col});}
 BIO.tube('wood',pts,col,{seg:6,cap:true});st.logs++;
 for(let k=0,m=ri(1,3);k<m;k++){const i=ri(1,n-2),p=pts[i],b=rr(0,TAU),el=rr(.3,1.1),Ls=rr(.6,1.8);BIO.beam('rod',[p.x,p.y,p.z],[p.x+Math.cos(b)*Math.cos(el)*Ls,p.y+Math.sin(el)*Ls,p.z+Math.sin(b)*Math.cos(el)*Ls],p.r*.5,.04,shade(col,-.1));}
 if(rng()<.6)moss(x,Y(x,z)+r0,z,PAL.moss);
 return true;}
EBADLANDS.small={tuft,card,sage,bunch,grass,phlox};

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantWaste(x,y,z,Z,lv,st){const t=rng(),mk=mirK(x,z);
 if(t<.18+.3*mk){if(rng()<mk){mirage(x,y,z,lv);st.mirage++;}else{bunch(x,y,z,lv);st.tufts++;}}
 else if(t<.6){bunch(x,y,z,lv);st.tufts++;}
 else if(t<.66){spiral(x,y,z,lv);st.mats++;}
 else if(t<.72){moonflower(x,y,z,lv);st.cacti++;}
 else if(t<.78){pear(x,y,z,lv);st.cacti++;}
 else if(t<.84){buck(x,y,z,lv);st.shrubs++;}
 else if(t<.95){stone(x,y,z,lv,rng()<.6?PAL.rockRed:PAL.rockBand,st);}
 else{boulder(x,y,z,lv,PAL.rockRed,st,.15);}}
function plantVent(x,y,z,Z,lv,st){const t=rng();
 if(t<.28){mound(x,z,st);if(lv===2)mound(x+rr(-2,2),z+rr(-2,2),st);}
 else if(t<.44){parasols(x,y,z,lv);st.parasols++;}
 else if(t<.54){spiral(x,y,z,lv);st.mats++;}
 else if(t<.66){mirage(x,y,z,lv);st.mirage++;}
 else if(t<.74){fans(x,y,z,lv);st.fans++;}
 else if(t<.92){stone(x,y,z,lv,PAL.basalt,st);}
 else{boulder(x,y,z,lv,PAL.basalt,st,.05);}}
function plantSteppe(x,y,z,Z,lv,st){const t=rng(),sk=sageK(x,z);
 if(t<.32+.25*smooth(.4,.7,sk)){sage(x,y,z,lv);st.shrubs++;if(lv>=1&&sk>.55)sage(x+rr(-1.6,1.6),y,z+rr(-1.6,1.6),lv,.8);}
 else if(t<.66){bunch(x,y,z,lv);st.tufts++;}
 else if(t<.74){rabbit(x,y,z,lv);st.shrubs++;}
 else if(t<.8){phlox(x,y,z,lv);st.flowers++;}
 else if(t<.85){buck(x,y,z,lv);st.shrubs++;}
 else if(t<.88){pear(x,y,z,lv);st.cacti++;}
 else if(t<.97){stone(x,y,z,lv,Z.cold>.3?PAL.rockGrey:PAL.rockRed,st);}
 else{boulder(x,y,z,lv,Z.cold>.3?PAL.rockGrey:PAL.rockRed,st);}}
function plantBad(x,y,z,Z,lv,st){const t=rng(),green=smooth(.3,.55,Z.wet);
 if(t<.4){stone(x,y,z,lv,PAL.rockBand,st);}
 else if(t<.5){boulder(x,y,z,lv,PAL.rockBand,st,.1);}
 else if(t<.5+.35*green){grass(x,y,z,lv,.8);st.tufts++;}
 else if(t<.88){if(rng()<.5){bunch(x,y,z,lv);st.tufts++;}else{buck(x,y,z,lv);st.shrubs++;}}
 else if(Z.hot>.5){spiral(x,y,z,lv);st.mats++;}
 else{stone(x,y,z,lv,PAL.rockRed,st);}}
function plantVale(x,y,z,Z,lv,st){const t=rng(),fk=flowerK(x,z);
 if(t<.5){grass(x,y,z,lv);st.tufts++;if(lv===2)grass(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv);}
 else if(t<.6+.2*fk){flowers(x,y,z,lv);st.flowers++;}
 else if(t<.86){if(Z.wet>.55&&rng()<.5){fern(x,y,z,lv);st.ferns++;}else{phlox(x,y,z,lv);st.flowers++;}}
 else if(t<.93){shrub(x,y,z,lv,PAL.oak);st.shrubs++;}
 else{stone(x,y,z,lv,PAL.rockRed,st);}}
function plantPine(x,y,z,Z,lv,st){const t=rng();
 if(t<.32){bunch(x,y,z,lv,[0x9aa070,0xa8a878,0x8a9a64]);st.tufts++;}
 else if(t<.5){litter(x,y,z);st.litter++;}
 else if(t<.6){flowers(x,y,z,lv,rng()<.5?[0x7a5ab8,0x8a6ac8]:PAL.flowers);st.flowers++;}
 else if(t<.68){phlox(x,y,z,lv);st.flowers++;}
 else if(t<.78){shrub(x,y,z,lv,PAL.oak);st.shrubs++;}
 else if(t<.84){sage(x,y,z,lv,.8);st.shrubs++;}
 else if(t<.95){stone(x,y,z,lv,PAL.rockGrey,st);}
 else{boulder(x,y,z,lv,PAL.rockGrey,st,.4);}}
function plantBoreal(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){litter(x,y,z);st.litter++;}
 else if(t<.5){moss(x,y,z);st.moss++;}
 else if(t<.62){fern(x,y,z,lv);st.ferns++;}
 else if(t<.74){shrub(x,y,z,lv,[0x4e6a34,0x5a7a3a,0x46602e]);st.shrubs++;}
 else if(t<.8){grass(x,y,z,lv,.6);st.tufts++;}
 else if(t<.92){stone(x,y,z,lv,PAL.rockGrey,st);}
 else{boulder(x,y,z,lv,PAL.rockGrey,st,.7);}}
function plantTundra(x,y,z,Z,lv,st){const t=rng();
 if(t<.24){cushion(x,y,z,lv);st.cushions++;}
 else if(t<.42){moss(x,y,z,rng()<.5?PAL.moss:PAL.lichen);st.moss++;}
 else if(t<.56){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.64){willow(x,y,z,lv);st.shrubs++;}
 else if(t<.88){stone(x,y,z,lv,PAL.rockGrey,st);}
 else{boulder(x,y,z,lv,PAL.rockGrey,st,.8);}}
// a CANYON GRAPE TANGLE: a low mound smothered in the vine, curtains and clusters hanging off its sides
function grapeTangle(x,y,z,lv){const R=rr(.9,1.8),hc=leafCol(PAL.grapeLeaf,1.15,.03,.08,.05);
 BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[R,R*.8,R],shade(hc,-.25));card('lobed',x,y+R*.6,z,R*1.8,R*.9,hc,.3);
 for(let i=0,n=lv===2?ri(2,4):1;i<n;i++){const a=rr(0,TAU);EBADLANDS.hangVine(x+Math.cos(a)*R*.8,y+R*.7,z+Math.sin(a)*R*.8,R*.75,rr(.7,1.1),null);}}
function plantRip(x,y,z,Z,lv,st){const t=rng(),nearW=smooth(.4,.9,Z.flow);
 if(t<.3*nearW+.05){reed(x,y,z,lv);st.reeds++;}
 else if(t<.42){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.62){grass(x,y,z,lv);st.tufts++;}
 else if(t<.7){if(Z.hot>.6&&rng()<.6){fans(x,y,z,lv);st.fans++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.8){flowers(x,y,z,lv);st.flowers++;}
 else if(t<.9){stone(x,y,z,lv,rng()<.5?PAL.rockRed:PAL.rockGrey,st,.7);}
 else if(lv>=1&&rng()<.4){grapeTangle(x,y,z,lv);st.vines++;}
 else{shrub(x,y,z,lv,PAL.willow);st.shrubs++;}}
function plantRim(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){bunch(x,y,z,lv);st.tufts++;}
 else if(t<.42){buck(x,y,z,lv);st.shrubs++;}
 else if(t<.52){phlox(x,y,z,lv);st.flowers++;}
 else if(t<.6){moss(x,y,z,PAL.lichen);st.moss++;}
 else if(t<.9){stone(x,y,z,lv,Z.cold>.3?PAL.rockGrey:PAL.rockRed,st);}
 else{boulder(x,y,z,lv,Z.cold>.3?PAL.rockGrey:PAL.rockRed,st);}}

// ---------------------------------------------------------------- the pass
EBADLANDS.FLOOR_ZONES=['waste','vent','steppe','bad','vale','pine','boreal','tundra','rip','rim'];
const PLANTERS=[plantWaste,plantVent,plantSteppe,plantBad,plantVale,plantPine,plantBoreal,plantTundra,plantRip,plantRim];
// the floor's density per zone (the weights the plant() draw mixes by)
EBADLANDS.floorWeights=Z=>[Z.waste*.7,Z.vent*.9,Z.steppe*1.0,Z.bad*.45,Z.vale*1.3,Z.pine*.9,Z.boreal*.9,Z.tundra*.75,Z.rip*1.3,(Z.rimZ+Z.bench)*.6];
EBADLANDS.buildFloor=function(R,q){
 reseed(600031);q=q==null?1:q;R=R||3000;means();
 const st={vines:0,tufts:0,shrubs:0,flowers:0,mirage:0,mats:0,cacti:0,parasols:0,fans:0,ferns:0,moss:0,litter:0,cushions:0,reeds:0,stones:0,boulders:0,toadstools:0,chimneys:0,mounds:0,logs:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.barren>.6)return;
  const w=EBADLANDS.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[9,L.floor[0],0],[18,L.floor[1],L.floor[0]],[36,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .66*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.6,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the sagebrush sea: a close grid of sage on the steppe near the spine (the Great Basin's ground cover), cards only
 BIO.grid(5,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[0])return 0;const Z=zones(x,z);return Z.steppe*.55*q*smooth(.25,.6,sageK(x,z)+.2);},
  (x,y,z,d)=>{if(blocked(x,z,.5))return;const hc=vary(pick(PAL.sage),.03,.08,.05),Rs=rr(.45,.95);card('small',x,y+Rs*.45,z,Rs*1.5,Rs*.8,bright(hc,1.35),.2);st.shrubs++;},
  {patch:.5,patchScale:.02,pad:.4,box:BIO.originBox(L.floor[0])});
 // reeds standing in the shallows (the host's water window)
 BIO.grid(9,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=L.mid)return 0;const Z=zones(x,z);return .4*q*Z.rip*smooth(1.0,.3,BIO.depth(x,z));},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1;reed(x,Math.max(y,BIO.waterH(x,z)-.4),z,lv);st.reeds++;},{patch:.6,patchScale:.03,noMask:true,depth:[-.1,.9],pad:1,box:BIO.window('water')});
 // toadstool rocks in the badlands and the waste
 BIO.grid(50,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return (Z.bad*.22+Z.waste*.08)*q;},(x,y,z,d)=>{if(blocked(x,z,3))return;const lv=BIO.lodD(x,z)<L.hero*1.1?2:1;
  for(let i=0,n=ri(1,3);i<n;i++){const hx=x+rr(-12,12),hz=z+rr(-12,12);if(okGround(hx,hz,2))toadstool(hx,Y(hx,hz),hz,lv,st);}},{patch:.3,pad:3});
 // the vents' chimney fields
 BIO.grid(22,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return Z.vent*.55*q;},(x,y,z,d)=>{if(blocked(x,z,2))return;chimneys(x,y,z,BIO.lodD(x,z)<L.hero?2:1,st);},{patch:.5,patchScale:.02,pad:1.5});
 // fallen logs in the forests and on the canyon floor
 BIO.grid(40,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return (Z.boreal*.55+Z.pine*.3+Z.rip*.25+Z.tundra*.06)*q;},(x,y,z,d)=>{const Z=zones(x,z),pale=Z.tundra>.3||Z.rip>.4;for(let t=0;t<4;t++)if(log(x+rr(-14,14),y,z+rr(-14,14),st,pale))break;},{patch:0,pad:2});
 return{under:st};};
})();
