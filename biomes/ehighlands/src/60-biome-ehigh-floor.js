// ================================================================= EASTERN HIGHLANDS — floor
// Everything under and between the plants, by zone (EHIGH.zones):
//   PUNA     gold ichu tussocks, sedge turf where it is wetter, tola scrub, stones, the odd gentian
//   FELL     the cold meadow: turf, small cushions, gentians, snow wool toward the top, lichened stones
//   DRY      the sunward slope: tola in flower, sparse ichu, stones, lichens
//   SCREE    stones and lichens, snow wool, a little turf in the hollows
//   TOR      basalt boulders, lichens (orange, yellow, green: the Andean crusts), cushions in the cracks
//   BOG      the bofedal: a close quilt of glossy cushions round the pools, turf at its margin
//   GULLY    turf, ferny shade under the ragbark, mossy stones, the stream's banks
//   GEO      orange and green mat algae in the run-off; nothing else
//   MOTHER   lichens and the odd flower on the Mother Cushion
// Three LOD bands along the spine at 8 / 16 / 32 m cells; then the bog's quilt (a close grid near the spine), the tors'
// boulders, and two passes tied to the glass towers: WORMWICK in the ground round each tower, and wild COMBS (tower
// honey) hung on the cliffs of the gullies and the tors.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=EHIGH.PAL,zones=EHIGH.zones,blocked=EHIGH.blocked,C=EHIGH.C;
const {bright,shade,vary,tint,means,leafCol}=EHIGH;
const Y=(x,z)=>BIO.terrainH(x,z);
// the library's basalt is full colour: the instance stays near white (a little scoria-red now and then); the canvas is grey
const rockTint=(set,k)=>EHIGH.LIB&&EHIGH.LIB.basalt?(set===PAL.scoria?bright(C(0xe0a890),rr(.8,1)):bright(C(0xffffff),rr(.75,1.0))):tint(vary(pick(set||PAL.basalt),.02,.06,.06),means().rock,k==null?rr(.5,.75):k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){BIO.put(item,[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
// ICHU: a fountain of stiff gold blades, the tussocks spaced apart with bare ground between (the puna's look)
function ichu(x,y,z,lv,k){const h=rr(.45,.95)*(k||1)*(lv===0?1.5:1);around(x,z,lv===2?ri(1,3):1,.9,2.2,(px,pz)=>tuft('ichu',px,Y(px,pz),pz,h*rr(.8,1.15),h*rr(1.0,1.4),leafCol(rng()<.2?PAL.ichuDry:PAL.ichu,1.25,.02,.08,.06)));}
function turf(x,y,z,lv,green){const R=rr(.9,2.2)*(lv===0?1.6:1);BIO.put('turf',[x,y+.03,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,1,R],leafCol(green?PAL.turfGreen:PAL.turf,1.15,.02,.06,.05));}
function tola(x,y,z,lv,flower){const Rs=rr(.4,.85);if(lv>=1)BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.55,Rs*.7],shade(C(pick(PAL.tola)),-.4));
 card('small',x,y+Rs*.45,z,Rs*1.3,Rs*.8,leafCol(PAL.tola,1.25,.02,.06,.05),.2);
 if(flower&&lv>=1)for(let i=0,m=lv===2?ri(4,8):2;i<m;i++){const a=rr(0,TAU),d=Rs*rr(0,.6);BIO.put('bloom',[x+Math.cos(a)*d,y+Rs*rr(.7,.95),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.07,.12),leafCol(PAL.tolaBloom,1.2,.02,.05,.05));}}
function gentian(x,y,z,lv){const n=lv===2?ri(2,5):1,col=leafCol(PAL.gentian,1.3,.02,.06,.05);around(x,z,n,.1,.5,(px,pz)=>BIO.put('bloom',[px,Y(px,pz)+.06,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),rr(.06,.1),col));}
// SNOW WOOL: fist-sized balls of white fleece, in twos and threes
function snowwool(x,y,z,lv){around(x,z,lv===2?ri(1,4):1,.15,.6,(px,pz)=>{const s=rr(.07,.16);BIO.put('snowwool',[px,Y(px,pz)+s*.55,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(1.1,1.5),s],leafCol(PAL.snowwool,1.05,.01,.02,.03));});}
function lichen(x,y,z){const R=rr(.25,.8);BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,1,R],leafCol(PAL.lichen,1.1,.02));}
function stone(x,y,z,lv,st,k){around(x,z,lv===2?ri(1,3):1,.5,1.6,(px,pz)=>{const r=rr(.12,.45)*(k||1);
 if(putRooted(px,pz,'stone',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(rng()<.15?PAL.scoria:PAL.basalt))){st.stones++;
  if(lv===2&&rng()<.4)BIO.put('lichen',[px,Y(px,pz)+r*.55,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),r*rr(.5,.9),leafCol(PAL.lichen,1.1,.02));}});}
function boulder(x,y,z,lv,st,big){const Rb=rr(.7,2.0)*(big||1);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.4,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.55,.9);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(PAL.basalt));if(ok)st.boulders++;
  if(ok&&lv>=1&&rng()<.55)BIO.put('lichen',[bx+rr(-.2,.2)*r,by+h*1.0,bz+rr(-.2,.2)*r],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),r*rr(.5,.9),leafCol(PAL.lichen,1.1,.02));});}
// a BOG CUSHION: a glossy green dome among its neighbours, the quilt's cell
function bogq(x,y,z,lv,k){const R=rr(.5,1.4)*(k||1)*(lv===0?1.4:1);BIO.put('bogq',[x,y+.02,z],qEuler(0,EHIGH.GIANT_YAW+rr(-.4,.4),0),[R,R*rr(.22,.38),R],bright(vary(pick(PAL.bogq),.03,.08,.06),rr(1.0,1.2)));}
function sinter(x,y,z){const R=rr(.6,1.8);BIO.put('sinter',[x,y+.04,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[R,1,R],leafCol(PAL.sinter,1.15,.02,.06,.05));}
function smallCushion(x,y,z){const R=rr(.25,.7);BIO.put('bogq',[x,y+.02,z],qEuler(0,EHIGH.GIANT_YAW+rr(-.3,.3),0),[R,R*rr(.35,.55),R],bright(vary(pick(PAL.cushion),.03,.1,.06),rr(1.05,1.2)));}
EHIGH.small={tuft,card,ichu,turf,tola,gentian,snowwool,bogq};

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantPuna(x,y,z,Z,lv,st){const t=rng(),wt=Z.turf;
 if(t<.5-.28*wt){ichu(x,y,z,lv);st.ichu++;}
 else if(t<.74){turf(x,y,z,lv,wt>.5);st.turf++;}
 else if(t<.84){tola(x,y,z,lv,rng()<.3);st.tola++;}
 else if(t<.9){gentian(x,y,z,lv);st.flowers++;}
 else if(t<.94){smallCushion(x,y,z);st.cushions++;}
 else{stone(x,y,z,lv,st);}}
function plantFell(x,y,z,Z,lv,st){const t=rng(),hi=smooth(.6,.82,Z.cold);
 if(t<.36){turf(x,y,z,lv,Z.wet>.35);st.turf++;}
 else if(t<.5){ichu(x,y,z,lv,.7);st.ichu++;}
 else if(t<.62){smallCushion(x,y,z);st.cushions++;}
 else if(t<.7+.08*hi){snowwool(x,y,z,lv);st.snowwool++;}
 else if(t<.8){gentian(x,y,z,lv);st.flowers++;}
 else if(t<.88){lichen(x,y,z);st.lichen++;}
 else{stone(x,y,z,lv,st);}}
function plantDry(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){tola(x,y,z,lv,rng()<.55);st.tola++;}
 else if(t<.5){ichu(x,y,z,lv,.8);st.ichu++;}
 else if(t<.75){stone(x,y,z,lv,st);}
 else if(t<.9){lichen(x,y,z);st.lichen++;}
 else{smallCushion(x,y,z);st.cushions++;}}
function plantScree(x,y,z,Z,lv,st){const t=rng();
 if(t<.42){stone(x,y,z,lv,st,1.3);}
 else if(t<.6){lichen(x,y,z);st.lichen++;}
 else if(t<.78){snowwool(x,y,z,lv);st.snowwool++;}
 else if(t<.88){turf(x,y,z,lv);st.turf++;}
 else{smallCushion(x,y,z);st.cushions++;}}
function plantTor(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){boulder(x,y,z,lv,st);}
 else if(t<.62){lichen(x,y,z);st.lichen++;}
 else if(t<.74){smallCushion(x,y,z);st.cushions++;}
 else if(t<.86){ichu(x,y,z,lv,.7);st.ichu++;}
 else{stone(x,y,z,lv,st);}}
function plantBog(x,y,z,Z,lv,st){const t=rng();
 if(t<.62){bogq(x,y,z,lv);st.bogq++;}
 else if(t<.84){turf(x,y,z,lv,true);st.turf++;}
 else if(t<.92){gentian(x,y,z,lv);st.flowers++;}
 else{ichu(x,y,z,lv,.6);st.ichu++;}}
function plantGully(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){turf(x,y,z,lv,true);st.turf++;}
 else if(t<.5){stone(x,y,z,lv,st);}
 else if(t<.66){ichu(x,y,z,lv,.8);st.ichu++;}
 else if(t<.8){lichen(x,y,z);st.lichen++;}
 else if(t<.9){bogq(x,y,z,lv,.6);st.bogq++;}
 else{gentian(x,y,z,lv);st.flowers++;}}
function plantGeo(x,y,z,Z,lv,st){if(rng()<.7){sinter(x,y,z);st.sinter++;}}
function plantMother(x,y,z,Z,lv,st){const t=rng(),m=BIO.field('mother',x,z),yy=y+m*1.6+.1;
 if(t<.5){lichen(x,yy,z);st.lichen++;}else if(t<.7){gentian(x,yy,z,lv);st.flowers++;}}

// ---------------------------------------------------------------- the pass
EHIGH.FLOOR_ZONES=['puna','fell','dry','scree','tor','bog','gully','geo','mother'];
const PLANTERS=[plantPuna,plantFell,plantDry,plantScree,plantTor,plantBog,plantGully,plantGeo,plantMother];
EHIGH.floorWeights=Z=>[Z.puna*1.3,Z.fell*1.2,Z.dry*1.0,Z.scree*.8,Z.tor*.9,Z.bog*1.0,Z.gully*1.1,Z.geo*.5,Z.mother*.05];
EHIGH.buildFloor=function(R,q){
 reseed(600041);q=q==null?1:q;R=R||2500;means();
 const st={ichu:0,turf:0,tola:0,flowers:0,cushions:0,snowwool:0,lichen:0,stones:0,boulders:0,bogq:0,sinter:0,wick:0,combs:0};
 EHIGH.WICKS=[];EHIGH.COMBS=[];
 function plant(x,y,z,lv){if(blocked(x,z,.5))return;const Z=zones(x,z);if(Z.cliff>.6||Z.snow>.7)return;
  const w=EHIGH.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .75*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.55,patchScale:.014,pad:.5,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE BOG'S QUILT: a close grid of cushions over the bofedal near the spine (the pools keep their water clear)
 BIO.grid(3.4,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return Z.bog*.85*q;},
  (x,y,z,d)=>{if(blocked(x,z,.3))return;bogq(x,y,z,BIO.lodD(x,z)<L.floor[0]?2:1,rr(.8,1.3));st.bogq++;},
  {patch:.3,patchScale:.03,pad:.3,box:BIO.originBox(L.floor[1])});
 // THE ICHU: a close grid of tussocks over the open grass near the spine (the puna is mostly grass, a tussock every
 // metre or two with bare soil between); 6 triangles each, so the plain reads as grassland at no great cost
 BIO.grid(3.2,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=L.floor[1])return 0;const Z=zones(x,z);return (Z.puna*(1-.7*Z.turf)+Z.dry*.4+Z.fell*.35*(1-Z.turf))*q*(ld<L.floor[0]?.8:.45*smooth(L.floor[1],L.floor[0]*1.1,ld));},
  (x,y,z,d)=>{if(blocked(x,z,.4))return;const lv=BIO.lodD(x,z)<L.floor[0]?2:1,h=rr(.45,.95)*(lv===1?1.3:1);
   tuft('ichu',x,y,z,h*rr(.8,1.15),h*rr(1.0,1.4),leafCol(rng()<.2?PAL.ichuDry:PAL.ichu,1.25,.02,.08,.06));st.ichu++;},
  {patch:.5,patchScale:.02,pad:.4,box:BIO.originBox(L.floor[1])});
 // the tors' boulders
 BIO.grid(10,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return (Z.tor*.5+Z.scree*.12)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(1.1,2));},{patch:.3,pad:1});
 // WORMWICK: in the ground round each glass tower near the spine, 3 to 22 m out, where the turf can root (not on bare
 // rock): a few thin stalks, each out of a buried larva
 const T5=EHIGH.TREES.filter(T=>EHIGH.SPECIES[T.sp].key==='glasstower'&&T.lv===2);
 for(const T of T5){if(rng()>.55*q)continue;const n=ri(2,7);
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(3,20),cx=T.x+Math.cos(a)*d,cz=T.z+Math.sin(a)*d;if(BIO.mask(cx,cz)<=0||BIO.field('rock',cx,cz)>.6||blocked(cx,cz,.3))continue;
   turf(cx,Y(cx,cz),cz,2,true);
   // a patch: the larvae feed together, so the stalks come up a hand or two apart
   for(let k=0,m=ri(3,8);k<m;k++){const x=cx+rr(-.6,.6),z=cz+rr(-.6,.6),h=rr(.1,.18),y=Y(x,z);
    BIO.put('wick',[x,y-.01,z],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[h*.32,h,h*.32],bright(C(0xffffff),rr(.85,1.05)));st.wick++;
    EHIGH.WICKS.push([x,z]);}}}
 // TOWER HONEY: wild combs hung under the overhangs of sheer rock (the gullies' walls, the tors), near enough to the
 // towers for the bees: on a cliff cell, facing out from the rock
 BIO.grid(14,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return Z.cliff*(BIO.field('gully',x,z)>.2||Z.cold<.4?.5:0)*q;},
  (x,y,z,d)=>{const e=1.5,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),gl=Math.hypot(gx,gz)||1,nx=-gx/gl,nz=-gz/gl;
   // hang it on the face a little up from the foot, set out from the rock by its own depth
   const m=ri(1,4),S0=rr(.45,.8),hx=x,hz=z,hy=Y(hx,hz)+S0*1.5+.6;
   const sw=S0*(m+1.2)*.9;BIO.put('boulder',[hx-nx*.4,hy+.35,hz-nz*.4],qFacing([nx,0,nz]),[sw,.55,S0*2.4],rockTint(PAL.basalt));st.boulders++;
   for(let k=0;k<m;k++){const s=S0*rr(.8,1.1),o=(k-(m-1)/2)*S0*.85;
    BIO.put('comb',[hx+nz*o+nx*.2,hy,hz-nx*o+nz*.2],qFacing([nx,0,nz]),[s,s*rr(1.1,1.5),s],bright(vary(pick(PAL.comb),.02,.06,.05),1.15));st.combs++;}
   (EHIGH.COMBS||(EHIGH.COMBS=[])).push([hx,hy,hz]);},{patch:0,pad:1,noMask:true});
 return{under:st};};
})();
