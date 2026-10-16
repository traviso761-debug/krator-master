// ================================================================= SOUTHERN HIGHLANDS — floor
// Everything under the trees, by zone (SHIGH.zones), every plant a spiral:
//   FOREST    star moss in mats and cushions over everything, escargot begonias, fiddlehead ferns with their croziers,
//             spiral ginger, coral coil-shrubs, mossy stones
//   ELFIN     moss, swirl tussocks coming in, tank bromeliads on the ground, begonias, ferns, coral shrubs, daisies
//   PARAMO    swirl tussocks (gold), corkscrew rush, silver rosettes, spiral-eye daisies (gold, white, coral), moss
//             cushions, stones, rosette lichen
//   BOG       sphagnum (green, gold and rust), corkscrew rush, sundew coils, cushions, white daisies
//   DRY       straw tussocks, braid spears, corkscrew albuca, young aloes, stones, coral daisies, lichen
//   CRAG      lichen, albuca, silver rosettes, stones, moss in the joints
//   STREAM    ferns, ginger, moss, stones, begonias
// Three LOD bands along the spine at 8 / 16 / 32 m cells; then the tors' boulders and the fallen wood in the forest.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SHIGH.PAL,zones=SHIGH.zones,blocked=SHIGH.blocked,C=SHIGH.C,GOLD=SHIGH.GOLD;
const {bright,shade,vary,tint,means,leafCol}=SHIGH;
const Y=(x,z)=>BIO.terrainH(x,z);
const H=SHIGH.HAND;   // the floor is all right-handed (a mirror-handed tree is the only exception the kit draws)
const rockTint=(set,k)=>tint(vary(pick(set||PAL.granite),.02,.06,.06),means().rock,k==null?rr(.45,.7):k);
const nearW=(k)=>bright(vary(C(0xffffff),.02,.05,.05),k==null?1:k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const putRooted=(x,z,...a)=>{if(BIO.mask(x,z)<=0)return false;BIO.put(...a);return true;};

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function mossMat(x,y,z,set,k){const R=rr(.8,2.2)*(k||1);BIO.put('mossmat',[x,y+.04,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,1,R],leafCol(set||PAL.moss,1.15,.03,.08,.06));}
function cushion(x,y,z,set,k){const R=rr(.3,.8)*(k||1);BIO.put('lobe',[x,y-.08,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.45,.7),R],leafCol(set||PAL.cushion,1.1,.03,.08,.06));}
function swirl(x,y,z,lv,set,k){const s=rr(.35,.7)*(k||1)*(lv===0?1.4:1);around(x,z,lv===2?ri(2,4):1,.5,1.5,(px,pz)=>BIO.put(SHIGH.it('swirl',lv),[px,Y(px,pz)-.03,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[s*rr(.85,1.15),s*rr(.8,1.2),s*rr(.85,1.15)],leafCol(set||PAL.tussock,1.15,.02,.06,.05)));}
function rush(x,y,z,lv){const h=rr(.4,.8)*(lv===0?1.4:1);around(x,z,lv===2?ri(1,3):1,.3,1,(px,pz)=>tuft('rush',px,y,pz,h*rr(.8,1.15),h*.7,leafCol(PAL.rush,1.25,.03,.08,.05)));}
function rosette(x,y,z,set,k,lv){const s=rr(.18,.4)*(k||1);BIO.put(SHIGH.it('rosette',lv),[x,y+.03,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*.7,s],leafCol(set||PAL.silver,1.15,.02,.05,.05));}
function daisies(x,y,z,lv,set){const n=lv===2?ri(3,8):2,c=pick(set||PAL.daisy);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.9),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.08,.35),s=rr(.12,.24);
  BIO.put('daisy',[px,Y(px,pz)+h,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),s,bright(vary(C(c),.02,.06,.05),1.2));}}
function begonia(x,y,z,lv){around(x,z,lv===2?ri(1,3):1,.4,1.1,(px,pz)=>{const s=rr(.28,.55);BIO.put('begonia',[px,Y(px,pz)+.02,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),s,pick([nearW(1.05),bright(C(0xffe0ec),1.0),bright(C(0xf0f8f0),1.0)]));});}
// a fiddlehead fern: a few fronds round a centre at the golden angle, and its croziers still coiled in the middle
function fern(x,y,z,lv,k){const n=lv===2?ri(5,8):3,L=rr(.6,1.3)*(k||1),hc=leafCol(PAL.fern,1.25,.03,.08,.05),a0=rr(0,TAU);
 for(let i=0;i<n;i++){const a=a0+i*GOLD*H;BIO.put('fern',[x,y+.03,z],qEuler(rr(-.08,.08),-a,rr(.2,.65)),[L,L,L*rr(.32,.42)],bright(vary(hc,.02,.05,.05),rr(.95,1.1)));}
 if(lv===2)for(let i=0,m=ri(1,3);i<m;i++){const a=rr(0,TAU),s=rr(.25,.45);BIO.put('crozier',[x+Math.cos(a)*.08,y,z+Math.sin(a)*.08],qEuler(rr(-.1,.1),-a,0),[s*H,s,s],nearW());}}
function ginger(x,y,z,lv){around(x,z,lv===2?ri(2,5):1,.25,.8,(px,pz)=>{const h=rr(.6,1.4);BIO.put('ginger',[px,Y(px,pz)-.03,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*H,h,h],nearW());});}
// a coral coil-shrub: a mass of small coral leaves, its shoots ending in coral croziers
function coral(x,y,z,lv){const Rs=rr(.45,.9),c=leafCol(rng()<.7?PAL.coral:PAL.rose,1.2,.03,.08,.05);
 if(lv>=1)BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.55,Rs*.7],shade(c,-.45));
 BIO.put('small',[x,y+Rs*.6,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[Rs*1.4,Rs*.85,Rs*1.4],c,{n:[0,1,0]});
 if(lv===2)for(let i=0,m=ri(2,4);i<m;i++){const a=rr(0,TAU),s=rr(.22,.38);BIO.put('crozier',[x+Math.cos(a)*Rs*.5,y+Rs*.6,z+Math.sin(a)*Rs*.5],qEuler(rr(-.15,.15),-a,0),[s*H,s,s],bright(C(0xf09070),1.05));}}
function sundews(x,y,z,lv){around(x,z,lv===2?ri(3,6):1,.1,.5,(px,pz)=>{const s=rr(.1,.2);BIO.put(SHIGH.it('crozier',lv),[px,Y(px,pz)-.01,pz],qEuler(rr(-.15,.15),rr(0,TAU),0),[s*H,s,s],leafCol(PAL.sundew,1.3,.02,.06,.05));});}
function albuca(x,y,z,lv){around(x,z,lv===2?ri(1,3):1,.3,.9,(px,pz)=>{const s=rr(.25,.5);BIO.put('albuca',[px,Y(px,pz)-.02,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*H,s,s],nearW());});}
function spear(x,y,z,lv){around(x,z,lv===2?ri(2,5):1,.15,.6,(px,pz)=>{const h=rr(.4,1.0);BIO.put('spear',[px,Y(px,pz)-.03,pz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[h*.9*H,h,h*.9],nearW());});}
function aloeJuv(x,y,z,lv){const s=rr(.14,.3);BIO.put(SHIGH.it('aloe',lv),[x,y-.02,z],qEuler(0,rr(0,TAU),0),[s*H,s*.75,s],leafCol(PAL.aloe,1.0,.02,.05,.04));}
function lichen(x,y,z){const R=rr(.25,.8);BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,1,R],leafCol(PAL.lichen,1.05,.02));}
function stone(x,y,z,lv,st,k,mossy){around(x,z,lv===2?ri(1,3):1,.5,1.5,(px,pz)=>{const r=rr(.15,.5)*(k||1),py=Y(px,pz);
 if(putRooted(px,pz,'stone',[px,py+r*.2,pz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],rockTint(PAL.granite))){st.stones++;
  if(mossy&&lv===2)BIO.put('moss',[px,py+r*.75,pz],qEuler(0,rr(0,TAU),0),[r*1.6,r*.6,r*1.6],leafCol(PAL.moss,1.1,.03),{n:[0,1,0]});}});}
function boulder(x,y,z,lv,st,big,mossy){const Rb=rr(.8,2.4)*(big||1);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.3,(bx,bz,i)=>{const r=Rb*(i?rr(.35,.7):1),by=Y(bx,bz),h=r*rr(.6,.95);
  const ok=putRooted(bx,bz,'boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(PAL.granite));if(ok)st.boulders++;
  if(ok&&lv===2&&rng()<.45)BIO.put(mossy?'moss':'lichen',[bx+rr(-.2,.2)*r,by+h*1.02,bz+rr(-.2,.2)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),mossy?[r*1.2,r*.5,r*1.2]:r*rr(.4,.8),mossy?leafCol(PAL.moss,1.1,.03):leafCol(PAL.lichen,1.1,.02),mossy?{n:[0,1,0]}:undefined);});}
// a fallen trunk in the cloud forest, furred with moss, a crozier or two up through it
function log(x,y,z,st){const a=rr(0,TAU),L=rr(5,13),r0=rr(.25,.5),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/3)+1,pts=[];
 const col=tint(pick(PAL.deadwood),means().wood,rr(.8,1.0));
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||blocked(px,pz,1.2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.5+Math.sin(t*Math.PI)*.12,z:pz,r:mix(r0,r0*.6,t),col:col});}
 BIO.tube('wood',pts,col,{seg:6,cap:true});st.logs++;
 for(let i=0;i<n;i++){const p=pts[i];BIO.put('moss',[p.x,p.y+p.r*.7,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[p.r*3,p.r*1.1,p.r*3],leafCol(PAL.moss,1.15,.03,.08,.05),{n:[0,1,0]});}
 return true;}
SHIGH.small={tuft,swirl,daisies,fern,coral};

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantForest(x,y,z,Z,lv,st){const t=rng();
 if(t<.26){mossMat(x,y,z);st.moss++;}
 else if(t<.4){begonia(x,y,z,lv);st.begonias++;}
 else if(t<.58){fern(x,y,z,lv);st.ferns++;}
 else if(t<.68){ginger(x,y,z,lv);st.ginger++;}
 else if(t<.75){coral(x,y,z,lv);st.shrubs++;}
 else if(t<.84){cushion(x,y,z,PAL.moss,1.2);st.moss++;}
 else if(t<.9){stone(x,y,z,lv,st,1,true);}
 else{mossMat(x,y,z,PAL.mossDark,1.3);st.moss++;}}
function plantElfin(x,y,z,Z,lv,st){const t=rng();
 if(t<.2){mossMat(x,y,z);st.moss++;}
 else if(t<.36){swirl(x,y,z,lv,PAL.tussockGreen);st.tussocks++;}
 else if(t<.44){begonia(x,y,z,lv);st.begonias++;}
 else if(t<.56){fern(x,y,z,lv,.8);st.ferns++;}
 else if(t<.66){rosette(x,y,z,PAL.coral,1.2,lv);st.rosettes++;}
 else if(t<.76){coral(x,y,z,lv);st.shrubs++;}
 else if(t<.84){daisies(x,y,z,lv,[0xf4f0e0,0xe86a4a]);st.flowers++;}
 else if(t<.92){cushion(x,y,z,PAL.moss);st.moss++;}
 else{stone(x,y,z,lv,st,1,true);}}
function plantParamo(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){swirl(x,y,z,lv);st.tussocks++;}
 else if(t<.5){rush(x,y,z,lv);st.rush++;}
 else if(t<.6){rosette(x,y,z,null,1,lv);st.rosettes++;}
 else if(t<.74){daisies(x,y,z,lv);st.flowers++;}
 else if(t<.8){cushion(x,y,z);st.moss++;}
 else if(t<.86){stone(x,y,z,lv,st);}
 else if(t<.92){lichen(x,y,z);st.lichen++;}
 else if(t<.95){aloeJuv(x,y,z,lv);st.aloes++;}
 else{swirl(x,y,z,lv,PAL.rust,.8);st.tussocks++;}}
function plantBog(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){mossMat(x,y,z,PAL.sphagnum,1.2);st.moss++;}
 else if(t<.48){rush(x,y,z,lv);st.rush++;}
 else if(t<.64){sundews(x,y,z,lv);st.sundews++;}
 else if(t<.78){cushion(x,y,z,PAL.cushion,1.3);st.moss++;}
 else if(t<.86){daisies(x,y,z,lv,[0xf4f0e0]);st.flowers++;}
 else{swirl(x,y,z,lv,PAL.tussockGreen,.8);st.tussocks++;}}
function plantDry(x,y,z,Z,lv,st){const t=rng();
 if(t<.26){swirl(x,y,z,lv,[0xd8c48a,0xc8b07a,0xe0cc96]);st.tussocks++;}
 else if(t<.4){spear(x,y,z,lv);st.spears++;}
 else if(t<.52){albuca(x,y,z,lv);st.albuca++;}
 else if(t<.62){aloeJuv(x,y,z,lv);st.aloes++;}
 else if(t<.76){stone(x,y,z,lv,st);}
 else if(t<.86){daisies(x,y,z,lv,[0xe86a4a,0xf0c030]);st.flowers++;}
 else{lichen(x,y,z);st.lichen++;}}
function plantCrag(x,y,z,Z,lv,st){const t=rng();
 if(t<.26){lichen(x,y,z);st.lichen++;}
 else if(t<.4){albuca(x,y,z,lv);st.albuca++;}
 else if(t<.55){rosette(x,y,z,null,1,lv);st.rosettes++;}
 else if(t<.75){stone(x,y,z,lv,st,1.2);}
 else if(t<.88){mossMat(x,y,z,PAL.mossDark,.7);st.moss++;}
 else{spear(x,y,z,lv);st.spears++;}}
function plantStream(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){fern(x,y,z,lv,1.1);st.ferns++;}
 else if(t<.48){ginger(x,y,z,lv);st.ginger++;}
 else if(t<.66){mossMat(x,y,z);st.moss++;}
 else if(t<.84){stone(x,y,z,lv,st,.8,true);}
 else{begonia(x,y,z,lv);st.begonias++;}}

// ---------------------------------------------------------------- the pass
SHIGH.FLOOR_ZONES=['forest','elfin','paramo','bog','dry','crag','stream'];
const PLANTERS=[plantForest,plantElfin,plantParamo,plantBog,plantDry,plantCrag,plantStream];
SHIGH.floorWeights=Z=>[Z.forest*1.5,Z.elfin*1.3,Z.paramo*1.2,Z.bog*1.4,Z.dry*.9,Z.crag*.8,Z.stream*1.6];
SHIGH.buildFloor=function(R,q){
 reseed(600047);q=q==null?1:q;R=R||2500;means();
 const st={moss:0,begonias:0,ferns:0,ginger:0,shrubs:0,tussocks:0,rush:0,rosettes:0,flowers:0,sundews:0,albuca:0,spears:0,aloes:0,lichen:0,stones:0,boulders:0,logs:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.cliff>.6)return;
  const w=SHIGH.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .72*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.55,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the tors' boulders: granite blocks heaped on the tors and their aprons, mossy where the cloud reaches
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const Z=zones(x,z);return (Z.crag*.5+smooth(.15,.35,Z.rock)*(1-Z.crag)*.25)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(1.2,2.2),BIO.field('fog',x,z)>.45);},{patch:.3,pad:1});
 // fallen wood in the cloud forest, mossed over
 BIO.grid(30,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return Z.forest*.55*q;},
  (x,y,z,d)=>{for(let t=0;t<4;t++)if(log(x+rr(-10,10),y,z+rr(-10,10),st))break;},{patch:0,pad:2});
 // corkscrew rush standing in the tarn's shallows
 BIO.grid(2.6,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .5*q*smooth(1.0,.3,BIO.depth(x,z));},
  (x,y,z,d)=>{tuft('rush',x,Math.max(y,BIO.waterH(x,z)-.35),z,rr(.6,1.1),rr(.5,.8),leafCol(PAL.rush,1.25,.03));st.rush++;},{patch:.6,patchScale:.03,noMask:true,depth:[-.1,.8],pad:1,box:BIO.window('water')});
 return{under:st};};
})();
