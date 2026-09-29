// ================================================================= EASTERN HIGH DESERT — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (SEDESERT.zones):
//   the SCRUB       spinifex hummocks on the red soil (the character of the
//                   place), dry grass, creosote and saltbush, stands of the
//                   tower of jewels, agaves, barrel cacti, prickly pear, cholla,
//                   hoodia clumps in pink flower, stones and boulders
//   the BADLAND     hoodoos, rubble, boulders, an agave or a barrel in a crack
//   the CANYON      reeds and sedge at the water, dry grass and creosote on the
//                   floor, bleached fallen mesquites, boulders off the walls
//   the POND        reeds round the margin, blooms, a playa of cracked mud
//   the MOUNTAINS   agaves, spinifex, grey boulders and scree
//   the RIM/BENCH   creosote, agave, stones
//   the RED DESERT  almost nothing: a tuft, a stone
// Three LOD bands along the spine (near / mid / far) at 8 / 16 / 32 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SEDESERT.PAL,zones=SEDESERT.zones,blocked=SEDESERT.blocked,C=SEDESERT.C;
const {bright,shade,vary,tint,means,leafCol}=SEDESERT;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
// the floor's blooms lie flat on the ground, small, one colour per patch
const blooms=(x,y,z,r,n,set,sz)=>SEDESERT.blooms(x,y,z,r,n,set,sz,{flat:true,tilt:.4,s0:.16,s1:.34});
// a RING SCATTER: n things round (x,z), the first at the centre, the rest dLo..dHi out (two draws each)
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0;fn(x+Math.cos(a)*d,z+Math.sin(a)*d,i,a);}}

// ---------------------------------------------------------------- fields local to the floor
const echK=(x,z)=>smooth(.5,.64,fbm(x*.0048+3,z*.0048-8,2121,2));      // the tower-of-jewels stands
const hoodK=(x,z)=>smooth(.5,.62,fbm(x*.0052-5,z*.0052+2,3131,2));     // the hoodia patches
const hummK=(x,z)=>fbm(x*.006+21,z*.006+13,777,2);                     // spinifex density
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){BIO.put(item,[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
// a SPINIFEX HUMMOCK: a grey-green dome of needles, bare in the middle when old
function hummock(x,y,z,lv,k){const R=rr(.9,2.2)*(k||1),hc=leafCol(PAL.spinifex,1.3,.03);
 if(lv>=1)BIO.put('lobe',[x,y-.4,z],qEuler(0,rr(0,TAU),0),[R*.75,R*.5,R*.75],shade(vary(hc,.02,.08,.05),-.3));
 around(x,z,lv===2?ri(3,5):lv===1?2:1,R*.2,R*.6,(px,pz)=>tuft('needle',px,y,pz,R*rr(.7,1.0),R*rr(1.2,1.6),bright(vary(hc,.02,.06,.05),rr(.9,1.1))));}
function drygrass(x,y,z,lv){const h=rr(.5,1.1)*(lv===0?1.6:1);around(x,z,lv===2?ri(2,4):1,.6,1.8,(px,pz)=>tuft('grass',px,y,pz,h*rr(.8,1.1),h*1.3,leafCol(PAL.drygrass,1.3,.03)));}
function reed(x,y,z,lv,acc){const set=acc?PAL.accent:PAL.reed,h=rr(1.4,2.8)*(lv===0?1.5:1);
 around(x,z,lv===2?ri(2,4):lv===1?2:1,.7,2.2,(hx,hz,k)=>{if(k&&BIO.depth(hx,hz)>.8)return;tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.0),leafCol(set,1.3,.025));});}
function sedge(x,y,z,lv){const h=rr(.5,1.0)*(lv===0?1.5:1);tuft('grass',x,y,z,h,h*1.3,leafCol(PAL.sedge,1.3,.03));}
function creosote(x,y,z,lv){const hc=vary(pick(PAL.creosote),.04,.1,.06),Rs=rr(1.0,2.4);
 if(lv===2){for(let i=0,m=ri(2,4);i<m;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0,h=Rs*rr(.6,1.1);
   BIO.beam('rod',[x,y-.1,z],[x+Math.cos(a)*d*1.3,y+h,z+Math.sin(a)*d*1.3],.05,.02,rodCol(0x4a3a2e));
   card('small',x+Math.cos(a)*d,y+h,z+Math.sin(a)*d,Rs*rr(.9,1.3),Rs*rr(.6,.9),bright(vary(hc,.03,.08,.05),1.4),.3);}}
 else card('small',x,y+Rs*.5,z,Rs*1.4,Rs*.9,bright(hc,1.4));}
function saltbush(x,y,z,lv){const hc=vary(pick(PAL.saltbush),.03,.08,.05),Rs=rr(.8,1.8);
 if(lv>=1)BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),[Rs*.8,Rs*.6,Rs*.8],shade(vary(hc,.02,.08,.05),-.25));
 card('small',x,y+Rs*.45,z,Rs*1.5,Rs*.9,bright(hc,1.35),.25);}
function echium(x,y,z,lv){around(x,z,lv===2?ri(2,5):lv===1?2:1,1,3,(px,pz)=>{const h=rr(2.2,4.2);
  if(lv===2)BIO.put('agave',[px,y-.1,pz],qEuler(0,rr(0,TAU),0),[h*.22,h*.16,h*.22],leafCol(PAL.echiumLeaf,1.2,.02));
  tuft('spire',px,y+h*.05,pz,h,h*.42,leafCol(PAL.echium,1.25,.015));});}
function agaveR(x,y,z,set,k){const R=rr(.6,1.5)*(k||1),c=vary(pick(set||PAL.agave),.03,.1,.06);
 BIO.put('agave',[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.8,R],bright(c,1.1));}
function barrel(x,y,z,lv,k){around(x,z,lv===2?ri(1,3):1,.8,1.6,(px,pz)=>{const R=rr(.5,1.3)*(k||1);
 BIO.put('barrel',[px,y-.05,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,R*rr(.8,1.3),R],leafCol(PAL.barrel,1.15,.03,.08,.05));
 if(lv===2&&rng()<.3)blooms(px,y+R*.9,pz,R*.3,ri(2,4),[0xe8d040,0xf0a040],[.12,.22]);});}
function pear(x,y,z,lv){const hc=vary(pick(PAL.pear),.03,.08,.05);
 around(x,z,lv===2?ri(3,6):2,.3,1.2,(px,pz)=>{const h=rr(.4,1.4);card('paddle',px,y+h,pz,rr(1,1.8),rr(.9,1.4),bright(vary(hc,.02,.06,.05),1.3),.35);});
 if(lv===2&&rng()<.4)blooms(x,y+1.6,z,.8,ri(2,5),[0xe8c030,0xd8a030,0xe07070],[.14,.24]);}
function cholla(x,y,z,lv){const hc=leafCol(PAL.cholla,1.2,.02,.06,.05),h=rr(1.2,2.6),n=lv===2?ri(5,9):3;
 BIO.beam('rod',[x,y-.1,z],[x,y+h*.5,z],.08,.06,rodCol(0x5a4a3a));
 for(let i=0;i<n;i++){const a=rr(0,TAU),el=rr(.2,1.2),L=rr(.5,1.1),y0=y+h*rr(.3,.6);const e=[x+Math.cos(a)*Math.cos(el)*L,y0+Math.sin(el)*L,z+Math.sin(a)*Math.cos(el)*L];
  BIO.put('cone',[e[0],e[1]-.1,e[2]],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[.3,rr(.5,.9),.3],hc);BIO.beam('rod',[x,y0,z],e,.05,.05,hc);}}
function hoodia(x,y,z,lv){const hc=leafCol(PAL.hoodia,1.15,.02,.06,.05),n=lv===2?ri(5,10):3;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.8),h=rr(.4,1.1);BIO.put('column',[x+Math.cos(a)*d,y-.1,z+Math.sin(a)*d],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[.22,h,.22],hc);}
 blooms(x,y+.8,z,.9,lv===2?ri(5,12):3,PAL.comp,[.28,.5]);}
function stone(x,y,z,lv,set,st){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5);
 BIO.put('stone',[px,y+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(set));st.stones++;});}
function boulder(x,y,z,lv,set,st){const Rb=rr(1,3.2);
 around(x,z,lv===2?ri(1,2):1,Rb*.7,Rb*1.2,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;
  if(lv===2)SEDESERT.ROCKS.push([bx,by+h*1.05,bz,r]);   // a basking place (the fauna pass reads it)
  if(lv===2&&rng()<.4){BIO.put('lichen',[bx+rr(-.2,.2)*r,by+h*1.08,bz+rr(-.2,.2)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.4,.8),leafCol(PAL.lichen,1.1,.02));}});}
function hoodoo(x,y,z,lv,st){const h=rr(4,14),w=h*rr(.22,.36);
 BIO.put('hoodoo',[x,y-.4,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[w,h,w],rockTint(PAL.rock,rr(.4,.65)));st.hoodoos++;
 for(let i=0,n=lv===2?ri(3,7):2;i<n;i++){const a=rr(0,TAU),d=w*rr(.8,2.2),r=rr(.3,.9);BIO.put('stone',[x+Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d)+r*.2,z+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*1.2,r*.7,r*1.2],rockTint(PAL.rock));}}
// a fallen mesquite: a bleached tube with its stubs, dry grass grown up through it
function log(x,y,z,st){const a=rr(0,TAU),L=rr(6,16),r0=rr(.25,.55),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/3)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.5))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.4+Math.sin(t*Math.PI)*.3,z:pz,r:mix(r0,r0*.4,t),col:tint(pick(PAL.deadwood),means().wood,rr(.8,1.1))});}
 BIO.tube('wood',pts,pts[0].col,{seg:7,cap:true});st.logs++;
 for(let k=0,m=ri(2,4);k<m;k++){const i=ri(1,n-2),p=pts[i],b=rr(0,TAU),el=rr(.3,1.2),Ls=rr(.8,2.5);BIO.beam('rod',[p.x,p.y,p.z],[p.x+Math.cos(b)*Math.cos(el)*Ls,p.y+Math.sin(el)*Ls,p.z+Math.sin(b)*Math.cos(el)*Ls],p.r*.5,.04,shade(C(pick(PAL.deadwood)),-.1));}
 if(rng()<.6)drygrass(x+rr(-1,1),y,z+rr(-1,1),2);
 return true;}

SEDESERT.small={tuft,card,agaveR,barrel};   // the dressing pass grows the same plants on a ledge
// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantScrub(x,y,z,Z,lv,st){const t=rng(),ek=echK(x,z),hk=hoodK(x,z),hm=hummK(x,z);
 if(t<.22+.2*smooth(.4,.7,hm)){hummock(x,y,z,lv);st.hummocks++;if(lv>=1&&hm>.55)hummock(x+rr(-2.5,2.5),y,z+rr(-2.5,2.5),lv,.8);}
 else if(t<.55){if(rng()<ek){echium(x,y,z,lv);st.spires++;}else{drygrass(x,y,z,lv);st.tufts++;}}
 else if(t<.66){creosote(x,y,z,lv);st.shrubs++;}
 else if(t<.72){saltbush(x,y,z,lv);st.shrubs++;}
 else if(t<.78){if(rng()<hk*.8){hoodia(x,y,z,lv);st.hoodia++;}else{agaveR(x,y,z,rng()<.5?PAL.agave:PAL.agaveRed);st.rosettes++;}}
 else if(t<.84){barrel(x,y,z,lv);st.cacti++;}
 else if(t<.89){pear(x,y,z,lv);st.cacti++;}
 else if(t<.93){cholla(x,y,z,lv);st.cacti++;}
 else if(t<.98){stone(x,y,z,lv,PAL.rock,st);}
 else{boulder(x,y,z,lv,PAL.rock,st);}}
function plantBad(x,y,z,Z,lv,st){const t=rng();
 if(t<.45){stone(x,y,z,lv,PAL.rock,st);}
 else if(t<.62){boulder(x,y,z,lv,PAL.rock,st);}
 else if(t<.74){agaveR(x,y,z,PAL.agave,.9);st.rosettes++;}
 else if(t<.82){barrel(x,y,z,lv);st.cacti++;}
 else if(t<.92){drygrass(x,y,z,lv);st.tufts++;}
 else{hummock(x,y,z,lv,.7);st.hummocks++;}}
function plantRip(x,y,z,Z,lv,st){const t=rng(),nearW=smooth(.4,.9,Z.flow);
 if(t<.3*nearW+.05){reed(x,y,z,lv,rng()<.25);st.reeds++;}
 else if(t<.45){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.62){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.74){creosote(x,y,z,lv);st.shrubs++;}
 else if(t<.8){saltbush(x,y,z,lv);st.shrubs++;}
 else if(t<.9){stone(x,y,z,lv,rng()<.5?PAL.rock:PAL.rockGrey,st);}
 else if(t<.96){boulder(x,y,z,lv,rng()<.6?PAL.rock:PAL.rockGrey,st);}
 else{blooms(x,y,z,rr(.6,1.4),ri(2,6),rng()<.5?PAL.comp:[0xe8d040,0xf0f0d0]);st.blooms++;}}
function plantOasis(x,y,z,Z,lv,st){const t=rng(),nearW=smooth(.3,.8,Z.flow);
 if(t<.4*nearW+.05){reed(x,y,z,lv,rng()<.3);st.reeds++;}
 else if(t<.55){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.7){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.8){creosote(x,y,z,lv);st.shrubs++;}
 else if(t<.9){blooms(x,y,z,rr(.6,1.6),ri(3,8),rng()<.6?PAL.comp:[0xe8d040,0xf0f0d0]);st.blooms++;}
 else{stone(x,y,z,lv,PAL.rockGrey,st);}}
function plantMtn(x,y,z,Z,lv,st){const t=rng();
 if(t<.25){agaveR(x,y,z,rng()<.6?PAL.agave:PAL.agaveRed,1.1);st.rosettes++;}
 else if(t<.45){hummock(x,y,z,lv,.8);st.hummocks++;}
 else if(t<.6){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.85){stone(x,y,z,lv,PAL.rockGrey,st);}
 else{boulder(x,y,z,lv,PAL.rockGrey,st);}}
function plantRim(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){creosote(x,y,z,lv);st.shrubs++;}
 else if(t<.5){agaveR(x,y,z,PAL.agave);st.rosettes++;}
 else if(t<.7){hummock(x,y,z,lv,.9);st.hummocks++;}
 else if(t<.9){stone(x,y,z,lv,PAL.rock,st);}
 else{barrel(x,y,z,lv);st.cacti++;}}
function plantDune(x,y,z,Z,lv,st){const t=rng();
 if(t<.7){drygrass(x,y,z,lv);st.tufts++;}else{stone(x,y,z,lv,PAL.rock,st);}}

// ---------------------------------------------------------------- the pass
SEDESERT.ROCKS=[];
SEDESERT.buildFloor=function(R,q){
 reseed(600021);q=q==null?1:q;R=R||3000;means();SEDESERT.ROCKS.length=0;
 const st={hummocks:0,tufts:0,shrubs:0,spires:0,rosettes:0,cacti:0,hoodia:0,reeds:0,blooms:0,stones:0,boulders:0,hoodoos:0,logs:0};
 // one plant of the right zone's mix at (x,z); density by zone
 function plant(x,y,z,lv){if(blocked(x,z,.8))return;const Z=zones(x,z);if(Z.ab>.3)return;
  const w=[Z.scrub*.95,Z.bad*.5,Z.rip*1.3,Z.bank*1.2,Z.oasis*1.3,Z.mtn*.6,Z.rim*.7,Z.bench*.5,Z.desert*.1],P=[plantScrub,plantBad,plantRip,plantRip,plantOasis,plantMtn,plantRim,plantRim,plantDune];
  let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  P[k](x,y,z,Z,lv,st);}
 // three bands along the LOD spine (the core's floor radii); each band's window is the spine's reach
 const L=BIO.LOD(),bands=[[9,L.floor[0],0],[18,L.floor[1],L.floor[0]],[36,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .62*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.7,patchScale:.014,pad:.8,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the water's edge: reeds standing in the shallows of the river and the pond (the host's water window)
 BIO.grid(9,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=L.mid)return 0;const Z=zones(x,z);return .4*q*(Z.bank+Z.oasis)*smooth(1.0,.3,BIO.depth(x,z));},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1;reed(x,Math.max(y,BIO.waterH(x,z)-.5),z,lv,rng()<.35);st.reeds++;},{patch:.6,patchScale:.03,noMask:true,depth:[-.1,1.0],pad:1,box:BIO.window('water')});
 // hoodoos in the badlands
 BIO.grid(55,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return Z.bad*.5*q;},(x,y,z,d)=>{if(blocked(x,z,3))return;const lv=BIO.lodD(x,z)<L.hero*1.1?2:1;
  for(let i=0,n=ri(1,3);i<n;i++){const hx=x+rr(-14,14),hz=z+rr(-14,14);if(okGround(hx,hz,2))hoodoo(hx,Y(hx,hz),hz,lv,st);}},{patch:.3,pad:3});
 // fallen mesquites on the canyon floor
 BIO.grid(70,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return Z.rip*.7*q;},(x,y,z,d)=>{for(let t=0;t<4;t++)if(log(x+rr(-16,16),y,z+rr(-16,16),st))break;},{patch:0,pad:2});
 return{under:st};};
})();
