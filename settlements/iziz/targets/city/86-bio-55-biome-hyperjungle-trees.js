// ================================================================= HYPERJUNGLE — trees
// The hero hypertrees of Girder's 60-trees.js, ported onto the biome core:
// fluted buttressed boles (BIO.lathe into 'bark'+sp), surface roots and every
// bough, secondary and twig as BIO.tube into 'limb', instanced leaf clumps hung
// along the boughs, ghostwood racemes and baobab pods. Girder's trees leaned
// on the city's structural branches for half their crown; here every tree
// grows three tiers of its own boughs (top tuft, crown fillers and a lower
// tier at u 0.50-0.75) so the crown is full on its own. Between them stand
// immature hypertrees ('trunk' item + rod boughs + clump cards) and beyond
// heroR the impostor far forest (vertex-coloured blob crowns, 'far' bucket).
// Placement goes through BIO.scatter / BIO.grid (host mask + keep-clear);
// every count scales with q; everything is charged to BIO.cur by the core.
// Every hero also exports PERCHES (points along its boughs with the bough
// radius there) for the floor pass (epiphyte gardens) and the fauna pass
// (roosts); nothing else needs to know a bough's geometry.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=HYPERJUNGLE.SPECIES,PAL=HYPERJUNGLE.PAL,GOLD=2.399963,NSP=SP.length;
HYPERJUNGLE.TREES=[];HYPERJUNGLE.SAPLINGS=[];

// ---------------------------------------------------------------- trunk profile
// Girder's trunkR: bole radius of tree T at world height y. The baobab is a
// bottle; the others taper to a whip. Exported for the floor pass.
function trunkR(T,y){const yy=Math.max(0,y-T.y0),u=clamp(yy/T.H,0,1);let r;
 if(T.sp===3)r=u<.55?1+.25*Math.sin(u/.55*Math.PI):mix(1,.12,Math.pow((u-.55)/.45,.9));
 else r=u<.62?1-.42*u:mix(.74,.07,smooth(.62,1,u));
 return T.rb*r*(1+.80*Math.exp(-yy/15));}
HYPERJUNGLE.trunkR=trunkR;

// ---------------------------------------------------------------- colour
const C=h=>new BIO.host.THREE.Color(h);
function shade(hex,f){const c=C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
// bright(sRGB colour, k): the colour with its LINEAR value scaled by k, handed
// back in sRGB for the core (which converts once) -- Girder's `mul` on clumps
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
// mean LINEAR colour of a canvas texture, for matching tints across textures
function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[1,1,1];
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
// TINTS. The species bark textures are already coloured, so the bole tint is
// "as much of the designer's bark tint as the texture allows" (never above
// white); a limb, drawn on the pale limb texture, is tinted so it renders the
// SAME colour the bole does; a far impostor gets that rendered colour flat.
let TINT=null;
function tints(){if(TINT)return TINT;
 const boleM=SP.map((S,k)=>texMean(HYPERJUNGLE.BARKTEX[k])),limbM=texMean(HYPERJUNGLE.LIMBTEX);
 TINT={bole:[],limb:[],far:[]};
 for(let sp=0;sp<NSP;sp++){const B=SP[sp].bark;TINT.bole[sp]=[];TINT.limb[sp]=[];TINT.far[sp]=[];
  for(let k=0;k<3;k++){
   const w=(sp===2?shade(0xffffff,-.08*k):C(B[k%B.length])).convertSRGBToLinear();
   const bt=sp===2?[w.r,w.g,w.b]:[Math.min(1,w.r/Math.max(.02,boleM[sp][0])),Math.min(1,w.g/Math.max(.02,boleM[sp][1])),Math.min(1,w.b/Math.max(.02,boleM[sp][2]))];
   const act=[boleM[sp][0]*bt[0],boleM[sp][1]*bt[1],boleM[sp][2]*bt[2]];
   const lt=[Math.min(1,act[0]/Math.max(.02,limbM[0])),Math.min(1,act[1]/Math.max(.02,limbM[1])),Math.min(1,act[2]/Math.max(.02,limbM[2]))];
   TINT.bole[sp][k]=C(0).setRGB(bt[0],bt[1],bt[2]).convertLinearToSRGB();
   if(sp===1){lt[0]*=.90;lt[1]*=.89;lt[2]*=.86;}
   TINT.limb[sp][k]=C(0).setRGB(lt[0],lt[1],lt[2]).convertLinearToSRGB();
   TINT.far[sp][k]=act;}}
 return TINT;}
const boleCol=(sp,k)=>tints().bole[sp][k%3],limbCol=(sp,k)=>tints().limb[sp][k%3];
// an UNTEXTURED rod (sapling boughs) gets the bole's rendered colour itself, a
// shade down: the limb tint on a plain white rod glows (ghostwood rods went pure white)
const rodCol=(sp,k)=>{const a=tints().far[sp][k%3];return C(0).setRGB(a[0]*.85,a[1]*.85,a[2]*.85).convertLinearToSRGB();};

// ---------------------------------------------------------------- polyline helpers (Girder)
function treeCum(pts){const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y,pts[i].z-pts[i-1].z));return c;}
function treePolyAt(pts,cum,s){let i=1;while(i<pts.length-1&&cum[i]<s)i++;
 const a=pts[i-1],b=pts[i],L=(cum[i]-cum[i-1])||1,t=clamp((s-cum[i-1])/L,0,1);
 return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t),tx:(b.x-a.x)/L,ty:(b.y-a.y)/L,tz:(b.z-a.z)/L};}
// a bough from o along unit d: gravity / phototropic curve (curve*len*t^2 in y)
// and a sideways wiggle, so it ARCS -- never a straight rod
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
function treeDir(tx,ty,tz,side,a,b,c){let sx=-tz*side,sz=tx*side;const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const x=tx*a+sx*b,y=ty*a+c,z=tz*a+sz*b,l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
// SPECIES COME IN STANDS (BIO.standAt's fbm patch field), but that field's
// values are bell-shaped, so an even split of its range gives an uneven
// species mix. The field is SAMPLED over the disc at build time and split at
// its measured quantiles for the target shares below (so the shares hold for
// any seed, radius or species count), with Girder's share of off-pattern
// trees. Order along the field = which stands border which.
const SHARE=[.22,.17,.22,.11,.17,.11];   // ironbark, ghostwood, prism gum, baobab, mahogany, kapok
let QUANT=null;
function standQuantiles(R){const v=[],o=BIO.host.origin,n=64;
 for(let iz=0;iz<n;iz++)for(let ix=0;ix<n;ix++){const x=o[0]+(ix/(n-1)-.5)*2*R,z=o[1]+(iz/(n-1)-.5)*2*R;if(Math.hypot(x-o[0],z-o[1])>R)continue;v.push(BIO.standAt(x,z,4000)/4000);}
 v.sort((a,b)=>a-b);QUANT=[];let acc=0;for(let k=0;k<NSP-1;k++){acc+=SHARE[k]||(1/NSP);QUANT.push(v[Math.min(v.length-1,Math.floor(acc*v.length))]);}return QUANT;}
function standSp(x,z,off){if(rng()<(off==null?.26:off))return ri(0,NSP-1);const v=BIO.standAt(x,z,4000)/4000;let k=0;while(k<QUANT.length&&v>=QUANT[k])k++;return k;}
HYPERJUNGLE.standSp=function(x,z,off){return standSp(x,z,off);};

// ---------------------------------------------------------------- one hero hypertree
// Lower-tier habit per species (the tier Girder's city branches used to be):
// count, bole height band, length (x crownR), elevation, curve, radius scale.
const LOWER=[
 {n:[6,8],u:[.50,.75],len:[.62,1.00],el:[-.02,.24],curve:-.14,rs:.48},   // ironbark: level tiers, drooping tips
 {n:[6,8],u:[.48,.72],len:[.58,.92],el:[.55,.95],curve:.06,rs:.45},      // ghostwood: rising steeply
 {n:[6,8],u:[.52,.76],len:[.70,1.05],el:[.18,.48],curve:-.16,rs:.50},    // prism gum: long, near level, the widest crown
 {n:[6,9],u:[.78,.94],len:[.60,1.00],el:[.12,.55],curve:.06,rs:.50},     // baobab: the crown IS the top
 {n:[5,7],u:[.60,.80],len:[.66,.98],el:[.20,.50],curve:-.10,rs:.46},     // mahogany: a high umbrella, nothing below 60 %
 {n:[8,11],u:[.52,.82],len:[.78,1.08],el:[-.04,.10],curve:-.04,rs:.52}]; // kapok: level pagoda whorls, the widest spread
function buildHero(T,ti,q,st){
 const sp=T.sp,S=SP[sp],Hb=S.hab,fam='bark'+sp,vs=18,sc0=14,LC=S.leaf;
 const lod=BIO.lod(T.x,T.z),lodK=clamp(lod,.55,1),farHalf=lod<.84;   // beyond ~880 m: fewer, larger clumps; lighter bark
 let k;
 // ---- trunk: sections between multiples of the texture height, each with a constant repeat ----
 const topU=sp===3?.925:.985,Hend=T.H*topU,half=vs*.5,ys=[];
 for(k=0;k*half<Hend-3;k++)ys.push(k*half);
 [1.2,3,5.5,8.5,11,14,16.5,21,27].forEach(v=>{if(Math.abs(v/half-Math.round(v/half))*half>1)ys.push(v);});
 ys.push(Hend);ys.sort((a,b)=>a-b);
 const nl=ri(Hb.lobes[0],Hb.lobes[1]),lobes=[],la=rr(0,TAU);
 for(k=0;k<nl;k++)lobes.push({a:la+k/nl*TAU+rr(-.22,.22),amp:rr(.55,1.2),p:Hb.butP*rr(.8,1.3)});
 const ph1=rr(0,TAU),ph2=rr(0,TAU),leanA=rr(0,TAU),leanK=sp===3?0:rr(2,5);
 function lobeSum(ang){let sm=0;for(let j=0;j<lobes.length;j++){const c=Math.cos(ang-lobes[j].a);if(c>0)sm+=lobes[j].amp*Math.pow(c,lobes[j].p);}return sm;}
 function butF(yy){return yy<27?Hb.butA*Math.exp(-yy/Hb.butH)*clamp((27-yy)/11,0,1):0;}
 function trunkMul(yy,ang){let m=1+.010*Math.sin(3*ang+yy*.045+ph1)+.007*Math.sin(7*ang-yy*.10+ph2);if(yy<27)m+=butF(yy)*lobeSum(ang);return m;}
 function trunkPt(yy){const u=yy/T.H;let r=trunkR(T,T.y0+yy),off=0;
  if(sp!==3){r*=1-.72*smooth(.93,.985,u);off=leanK*Math.pow(clamp((u-.88)/.105,0,1),2);}
  const moss=smooth(21,2.5,yy);let c=boleCol(sp,(Math.floor(yy/22)+ti)%3);
  if(moss>.01)c=c.clone().lerp(sp===2?shade(PAL.moss[1],.45):C(PAL.moss[ti%3]),moss*(sp===1?.35:.55));
  return{x:T.x+Math.cos(leanA)*off,y:T.y0+yy,z:T.z+Math.sin(leanA)*off,r:Math.max(.3,r),col:c,yy:yy};}
 const rings=ys.map(trunkPt),rtop=rings[rings.length-1];
 if(sp===3)[[1.8,.93],[3.6,.74],[5.1,.45],[6,.12],[6.3,.004]].forEach(d=>{const p=trunkPt(Hend);p.y+=d[0];p.yy+=d[0];p.r=rtop.r*d[1];rings.push(p);});
 else{const p9=trunkPt(Hend);p9.y+=1;p9.yy+=1;p9.r=.03;rings.push(p9);}
 let i0=0;
 while(i0<rings.length-1){let i1=i0+1;while(i1<rings.length-1&&rings[i1].r/rings[i0].r>.78&&rings[i1].r/rings[i0].r<1.25)i1++;
  const rm=(rings[i0].r+rings[i1].r)*.5,seg=rm>2.2?(farHalf?20:28):12;
  st.trunk+=BIO.lathe(fam,rings.slice(i0,i1+1),seg,Math.max(1,Math.round(TAU*rm/sc0)),vs,
   (R,ang)=>R.r*trunkMul(R.yy,ang),
   (R,ang)=>{const f=clamp(butF(R.yy)*1.6,0,1);return f>0?mix(1,.50+.50*clamp(lobeSum(ang)*1.4,0,1),f):1;});
  i0=i1;}
 // ---- surface roots, one off each buttress ----
 lobes.forEach(L=>{if(sp===3&&rng()<.45)return;
  const ang=L.a,R0=trunkR(T,T.y0+7)*(1+Hb.butA*.35*L.amp),len=rr(26,70)*(sp===3?.6:1)*(.6+.4*L.amp),rr0=clamp(T.rb*.17*L.amp,1,3.2),pts=[],wob=rr(0,TAU);
  for(let j=0;j<=9;j++){const t=j/9,d=R0*.72+len*t,a=ang+.32*Math.sin(wob+t*5.2)*t+.10*Math.sin(wob*2+t*11);
   const x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;if(j>1&&(BIO.mask(x,z)<=0||!BIO.clearOf(x,z,2)))break;
   const r=mix(rr0,.22,Math.pow(t,.75));pts.push({x:x,y:BIO.terrainH(x,z)+r*(j===0?1.6:.22)+(j===0?3:0),z:z,r:r,col:j<3?undefined:shade(limbCol(sp,1),-.12)});}
  if(pts.length>3){st.root+=BIO.tube('limb',pts,limbCol(sp,1),{seg:6});st.roots++;}});
 // ---- boughs of my own: top tuft, crown fillers, and the lower tier ----
 const mine=[],nTop=ri(Hb.topN[0],Hb.topN[1]),a0=rr(0,TAU);
 function ownBough(u,ang,len,el,curve,rScale,rMin,rMax){
  const ys0=T.y0+T.H*u,r0=trunkR(T,ys0)*(u>.93?.6:1),rb=clamp(r0*rScale,rMin||.55,rMax||3.3);
  const o={x:T.x+Math.cos(ang)*Math.max(0,r0-1),y:ys0,z:T.z+Math.sin(ang)*Math.max(0,r0-1)};
  const d=[Math.cos(ang)*Math.cos(el),Math.sin(el),Math.sin(ang)*Math.cos(el)];
  const pts=treeGrow(o,d,len,rb,.3,7,curve,.06);
  for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+3,pts[i].r+3))return;
  mine.push({pts:pts});}
 for(k=0;k<nTop;k++)ownBough(rr(.855,.955),a0+k*GOLD+rr(-.3,.3),T.crownR*rr(Hb.topLen[0],Hb.topLen[1]),rr(Hb.topEl[0],Hb.topEl[1]),sp===1?.10:-.12,.62);
 for(k=0;k<Hb.fillN;k++)ownBough(rr(.72,.86),a0+1.2+k*GOLD+rr(-.3,.3),T.crownR*rr(.55,.85),sp===1?rr(.7,1):rr(.3,.55),sp===1?.04:-.14,.42);
 const LW=LOWER[sp],nLow=ri(LW.n[0],LW.n[1]);
 for(k=0;k<nLow;k++)ownBough(mix(LW.u[0],LW.u[1],(k+rr(0,.9))/nLow),a0+.7+k*GOLD+rr(-.25,.25),T.crownR*rr(LW.len[0],LW.len[1]),rr(LW.el[0],LW.el[1]),LW.curve+rr(-.03,.03),LW.rs,1.6,4.8);
 st.topBoughs+=mine.length;
 // perches: two points per bough, exported for epiphytes and roosts
 T.perch=[];mine.forEach(Lm=>{[2,4].forEach(i=>{const p=Lm.pts[i];T.perch.push({x:p.x,y:p.y,z:p.z,r:p.r});});});
 // ---- skin the limbs; grow secondaries and twigs; collect foliage spots ----
 const yMinFol=T.y0+T.H*T.crown0-17,spots=[],hangs=[];
 const terGap=Hb.terGap*(farHalf?1.35:1);
 mine.forEach(Lm=>{const pts=Lm.pts,r0=pts[0].r,n=pts.length;
  const cpts=pts.map((p,i)=>({x:p.x,y:p.y,z:p.z,r:p.r,col:limbCol(sp,i<n*.4?1:2)}));
  st.limb+=BIO.tube('limb',cpts,limbCol(sp,1),{seg:r0>=4.5?10:(r0>=2.6?8:6),cap:true});
  const cum=treeCum(pts),L=cum[n-1],sStart=L*Hb.secStart;let side=rng()<.5?1:-1;
  for(let s=sStart+rr(0,Hb.secGap*.5);s<L*.985;s+=Hb.secGap*rr(.75,1.3)){
   const at=treePolyAt(pts,cum,s),t=s/L;side=-side;
   const len1=Math.max(8.5,L*rr(Hb.secLen[0],Hb.secLen[1])*(1-.5*t))*(sp===3?.8:1);
   const d1=treeDir(at.tx,at.ty,at.tz,side,rr(.45,.8),rr(.7,1.1),Hb.secUp+rr(-.12,.18));
   const rS=clamp(Math.min(at.r*.62,len1*.032),.25,1.6);
   const sec=treeGrow(at,d1,len1,rS,.14,4,Hb.secCurve+rr(-.05,.05),.07);let ok=true;
   for(let j=1;j<sec.length;j++)if(!clear3(sec[j].x,sec[j].y,sec[j].z,sec[j].r+2.5,sec[j].r+2.5)){ok=false;break;}
   if(!ok)continue;
   st.bough+=BIO.tube('limb',sec,limbCol(sp,2),{seg:rS>.9?5:4});st.boughs++;
   const sprd=clamp(len1*.26,5,12);
   spots.push({p:sec[2],s:sprd,inner:true},{p:sec[3],s:sprd},{p:sec[4],s:sprd*.9,tip:true});
   if(sp===3&&rng()<.8)hangs.push({x:sec[1].x,y:sec[1].y-sec[1].r*.7,z:sec[1].z});
   if(sp===3&&rng()<.6)hangs.push({x:sec[2].x,y:sec[2].y-sec[2].r*.7,z:sec[2].z});
   if(sp===4&&rng()<.45)hangs.push({x:sec[3].x,y:sec[3].y-sec[3].r*.6,z:sec[3].z});
   if(sp===5&&rng()<.7)hangs.push({x:sec[4].x,y:sec[4].y+.5,z:sec[4].z});
   // twigs
   const cum1=treeCum(sec),L1=cum1[4];let sd2=rng()<.5?1:-1;
   for(let s2=L1*.3+rr(0,terGap*.5);s2<L1*.95;s2+=terGap*rr(.8,1.3)){
    const a2=treePolyAt(sec,cum1,s2);sd2=-sd2;
    const len2=Math.max(5,len1*rr(.3,.5)*(1-.4*s2/L1));
    const d2=treeDir(a2.tx,a2.ty,a2.tz,sd2,rr(.5,.9),rr(.6,1),Hb.secUp*.8+rr(-.15,.25));
    const tw=treeGrow(a2,d2,len2,Math.max(.15,a2.r*.6),.08,2,Hb.secCurve,.05);
    if(!clear3(tw[2].x,tw[2].y,tw[2].z,2.5,2.5)||!clear3(tw[1].x,tw[1].y,tw[1].z,2.5,2.5))continue;
    st.twig+=BIO.tube('limb',tw,limbCol(sp,2),{seg:3});st.twigs++;
    spots.push({p:tw[1],s:clamp(len2*.4,3.6,8)},{p:tw[2],s:clamp(len2*.45,3.6,8.5),tip:true});
    if(sp===1&&rng()<.55)hangs.push({x:tw[2].x,y:tw[2].y-.5,z:tw[2].z});
    if(sp===1&&rng()<.30)hangs.push({x:tw[1].x,y:tw[1].y-.5,z:tw[1].z});
    if(sp===5&&rng()<.5)hangs.push({x:tw[2].x,y:tw[2].y+.3,z:tw[2].z});}}
  const tip=pts[n-1];spots.push({p:tip,s:6.5,tip:true},{p:pts[n-2],s:6});
  if(sp===3)for(let h=0;h<3;h++){const ah=treePolyAt(pts,cum,L*rr(.35,.95));hangs.push({x:ah.x,y:ah.y-ah.r*.8,z:ah.z});}});
 // leader tuft
 if(sp!==3){const tp=trunkPt(Hend);for(k=0;k<3;k++)spots.push({p:{x:tp.x,y:tp.y-k*5.5,z:tp.z},s:6+k*2,tip:k===0});}
 else spots.push({p:{x:T.x,y:T.y0+Hend+7,z:T.z},s:8.5,tip:true});
 st.spots+=spots.length;
 // ---- foliage: clumps round every spot, lit as one mass from the crown's centre ----
 const bb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
 spots.forEach(s=>{const p=s.p;bb[0]=Math.min(bb[0],p.x);bb[1]=Math.max(bb[1],p.x);bb[2]=Math.min(bb[2],p.y);bb[3]=Math.max(bb[3],p.y);bb[4]=Math.min(bb[4],p.z);bb[5]=Math.max(bb[5],p.z);});
 const cx=T.x,cz=T.z,cy=mix(bb[2],bb[3],.42),ex=Math.max(24,(bb[1]-bb[0])*.5,(bb[5]-bb[4])*.5),ey=Math.max(18,(bb[3]-bb[2])*.58);
 const item='clump'+sp,sizeK=1/Math.sqrt(lodK),denK=[1.15,1.35,1,1.1,1.2,.95][sp];
 spots.forEach(s=>{
  const nC=Hb.clumps*denK*(s.tip?1.15:1)*(s.inner?.8:1)*lodK*q,cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){
   const size=rr(Hb.size[0],Hb.size[1])*(s.inner?1.12:1)*sizeK,a=rr(0,TAU),rd=s.s*Math.sqrt(rng());
   const x=s.p.x+Math.cos(a)*rd,z=s.p.z+Math.sin(a)*rd,y=s.p.y+s.s*(Hb.lift+rr(-.35,.45))*(s.inner?.5:1);
   if(y<yMinFol&&!(s.tip&&y>yMinFol-18))continue;
   if(!clear3(x,y,z,size*.55,size*.5*Hb.flat+2))continue;
   const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
   const ao=mix(.42,1,smooth(.30,.95,qq))*mix(.78,1,smooth(-.6,.35,dy))*(s.inner?.72:1)*rr(.86,1.12);
   const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
   const ci=sp===2?ri(0,1):ri(0,LC.length-1);
   BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),a*3.1,rr(-.3,.3)),[size,size*Hb.flat,size],bright(LC[ci],1.25*ao),
    {n:[nx/nn,ny/nn,nz/nn],c2:sp===2?bright(LC[2+ri(0,1)],1.25*ao):null});
   st.clumps++;}});
 // ---- flowers / fruit: ghostwood racemes, baobab pods, mahogany capsules, kapok flowers ----
 hangs.forEach(h=>{if(h.y<yMinFol-12)return;if(rng()>lodK)return;
  if(sp===1){const Lr=rr(6,11);if(!clear3(h.x,h.y-Lr*.5,h.z,3,Lr*.5+1))return;
   BIO.put('raceme',[h.x,h.y,h.z],qEuler(0,rr(0,TAU),0),[Lr*.42,Lr,Lr*.42],bright(0xffffff,rr(.8,1)),{n:[rr(-.3,.3),.9,rr(-.3,.3)]});st.racemes++;}
  else if(sp===3){const Lp=rr(9,14);if(!clear3(h.x,h.y-Lp*.5,h.z,3,Lp*.5+1))return;
   BIO.put('pod',[h.x,h.y,h.z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),Lp,bright(S.pod,rr(.85,1.15)));st.pods++;}
  else if(sp===4){const Lp=rr(5,8);if(!clear3(h.x,h.y-Lp*.5,h.z,2,Lp*.5+1))return;   // woody capsules, in twos and threes
   for(let k=0,n=ri(1,3);k<n;k++)BIO.put('capsule',[h.x+rr(-1.5,1.5),h.y+rr(-.5,.5),h.z+rr(-1.5,1.5)],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[Lp*.7,Lp,Lp*.7],bright(S.capsule,rr(.8,1.1)));st.capsules++;}
  else if(sp===5){if(!clear3(h.x,h.y,h.z,3,3))return;   // a cluster of scarlet cup flowers on the bare twig ends, the odd burst silk pod
   const fc=bright(pick(S.flower),rr(.9,1.15));
   for(let k=0,n=ri(3,6);k<n;k++){const sz=rr(1.4,2.6);BIO.put('bloom',[h.x+rr(-2.5,2.5),h.y+rr(-1.5,2),h.z+rr(-2.5,2.5)],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),sz,fc);}
   if(rng()<.25)BIO.put('bloom',[h.x+rr(-2,2),h.y-rr(1,3),h.z+rr(-2,2)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(2,3.2),bright(S.silk,1.1));st.flowers++;}});
 if(typeof REGISTER==='function')REGISTER({name:S.name+' hypertree',kind:'tree',label:'Hypertree',x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H});
}

// ---------------------------------------------------------------- an immature hypertree
// Girder's TREE_SAPLINGS: a 'trunk' item in the species' bark tint, a few
// arcing boughs (rod beams near the origin, virtual further out), clump cards.
const SAP_BAND=[[.30,.92],[.42,.9],[.55,.9],[.78,.9],[.62,.94],[.45,.9]],SAP_CR=[.20,.24,.34,.24,.22,.36],SAP_EL=[[0,.3],[.7,1.1],[.35,.7],[.2,.6],[.3,.65],[-.05,.15]];
function buildSapling(Sd,si,q,st){
 const sp=Sd.sp,S=SP[sp],Hb=S.hab,H=Sd.H,LC=S.leaf,rb=H*(sp===3?.085:.032)+.25,lean=rr(0,TAU),lk=rr(0,.06)*H,pts=[];
 const d0=BIO.lodD(Sd.x,Sd.z),lodK=clamp(BIO.lod(Sd.x,Sd.z),.5,1)*(Sd.ring?.6:1),beams=Sd.ring?0:(d0<420?2:(d0<760?1:0));
 for(let k=0;k<=7;k++){const u=k/7,r=sp===3?rb*(u<.55?mix(1,1.1,u/.55):mix(1.1,.18,smooth(.55,1,u))):rb*mix(1,.12,Math.pow(u,.85))*(1+.6*Math.exp(-u*H/4));
  pts.push({x:Sd.x+Math.cos(lean)*lk*u*u+Math.sin(u*5+si)*.4,y:Sd.y0+H*u*(sp===3?.9:1),z:Sd.z+Math.sin(lean)*lk*u*u,r:Math.max(.15,r)});}
 const tc=limbCol(sp,si%3),rc=rodCol(sp,si%3);
 BIO.put('trunk',[Sd.x,Sd.y0,Sd.z],qUp([Math.cos(lean)*lk/H*.8,1,Math.sin(lean)*lk/H*.8]),[rb/.4,H*(sp===3?.9:1),rb/.4],tc);
 st.sapTris+=BIO.defs.trunk.tris;
 const nB=Sd.ring?ri(3,5):ri(5,8),spots=[],band=SAP_BAND[sp];let a=rr(0,TAU);
 for(let k=0;k<nB;k++){a+=GOLD+rr(-.3,.3);const u2=mix(band[0],band[1],(k+rr(0,.8))/nB),i2=Math.min(6,Math.floor(u2*7)),bp=pts[i2],bq=pts[i2+1],f=u2*7-i2;
  const o={x:mix(bp.x,bq.x,f),y:mix(bp.y,bq.y,f),z:mix(bp.z,bq.z,f)},tk=(u2-band[0])/(band[1]-band[0]);
  const len=Sd.cr*(sp===0?mix(1,.35,tk):rr(.7,1)),el=rr(SAP_EL[sp][0],SAP_EL[sp][1]);
  const br=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,Math.max(.12,mix(bp.r,bq.r,f)*.5),.06,3,Hb.secCurve,.08);
  if(beams===2){BIO.beam('rod',[br[0].x,br[0].y,br[0].z],[br[1].x,br[1].y,br[1].z],br[0].r,br[1].r,rc);BIO.beam('rod',[br[1].x,br[1].y,br[1].z],[br[3].x,br[3].y,br[3].z],br[1].r,br[3].r,rc);st.sapTris+=2*BIO.defs.rod.tris;}
  else if(beams===1){BIO.beam('rod',[br[0].x,br[0].y,br[0].z],[br[2].x,br[2].y,br[2].z],br[0].r,br[2].r,rc);st.sapTris+=BIO.defs.rod.tris;}
  spots.push(br[1],br[2],br[3],br[3]);if(sp!==3&&sp!==1)spots.push(br[2]);}
 const tp=pts[7];spots.push(tp,tp,{x:tp.x,y:tp.y-H*.07,z:tp.z});if(sp===3)spots.push(tp,tp);
 const cy=Sd.y0+H*mix(band[0],1,.5),size0=clamp(H*.15,3.2,8.5)/Math.sqrt(lodK),sapLeaf=[0x3a6a34,0x2e5a2c];
 spots.forEach(p=>{if(rng()>lodK*q*.85)return;
  const size=size0*rr(.8,1.25),s=size*.45,x=p.x+rr(-s,s),y=p.y+rr(-.2,.5)*s,z=p.z+rr(-s,s);
  if(!clear3(x,y,z,size*.5,size*.5))return;
  const dx=(x-Sd.x)/Sd.cr,dy=(y-cy)/(H*.35),dz=(z-Sd.z)/Sd.cr,qq=Math.hypot(dx,dy,dz);
  const ao=mix(.55,1,smooth(.25,.9,qq))*rr(.88,1.12),nx=dx+rr(-.3,.3),ny=dy*.6+.8,nz=dz+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
  const c1=C(LC[sp===2?ri(0,1):ri(0,LC.length-1)]).lerp(C(sapLeaf[si%2]),sp===1?.2:.4);
  BIO.put('clump'+sp,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*Hb.flat,size],bright(c1,1.3*ao),
   {n:[nx/nn,ny/nn,nz/nn],c2:sp===2?bright(LC[2+ri(0,1)],1.3*ao):null});
  st.sapClumps++;});
}

// ---------------------------------------------------------------- the far forest: impostors
// Girder's far trees: a 7-segment bole and a handful of deformed icosahedral
// blob crowns, vertex-coloured (no texture), written straight into the 'far'
// bucket so the crowns get per-vertex shading and colour gradients.
let ICO=null;
function buildFar(T,fi,st){const K=BIO.bucket('far');if(!ICO)ICO=new BIO.host.THREE.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const d0=BIO.lodD(T.x,T.z),cheap=d0>2100;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2)+.10*Math.sin(dz*7.9+k1);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m-(dy<0?ry*.25*dy*dy:0),z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const sp=T.sp,Hend=T.H*(sp===3?.92:.95),us=[0,.015,.05,.14,.45,.75,1],seg=cheap?5:7,bc=tints().far[sp][fi%3],rings=[];
 us.forEach(u=>{const y=T.y0+Hend*u,r=Math.max(.8,trunkR(T,y))*(u<.02?1.25:1),ring=[];
  for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){
  const A=rings[r2][s2],B=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.75+.25*(r2/rings.length);
  [A,D,E,A,E,B].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc[0]*sh,bc[1]*sh,bc[2]*sh));tris+=2;}
 const L=SP[sp].leaf.map(h=>bright(h,[1.45,.85,1.05,1.1,1.4,1.1][sp])),R=T.crownR,yc0=T.y0+T.H*T.crown0,yTop=T.y0+T.H,a0=(T.seed%628)/100;let k;
 if(sp===0){for(k=0;k<(cheap?3:4);k++){const t=k/3;blob(T.x+Math.sin(k*2.4+a0)*R*.06,mix(yc0+9,yTop-15,t),T.z+Math.cos(k*2.4+a0)*R*.06,R*mix(.80,.20,t),mix(23,18,t),L[(k+fi)%4],L[2],fi+k);}}
 else if(sp===1){for(k=0;k<(cheap?3:4);k++){const a=a0+k/4*TAU;blob(T.x+Math.cos(a)*R*.46,mix(yc0,yTop,.62)+((k*37)%18),T.z+Math.sin(a)*R*.46,R*.44,37,L[(k+fi)%4],L[2],fi+k);}
  blob(T.x,yTop-21,T.z,R*.48,33,L[3],L[0],fi+9);}
 else if(sp===2){blob(T.x,yTop-23,T.z,R*.72,28,L[fi%2],L[2+fi%2],fi);
  for(k=0;k<(cheap?3:4);k++){const a2=a0+k/4*TAU;blob(T.x+Math.cos(a2)*R*.62,yTop-45-((k*53)%21),T.z+Math.sin(a2)*R*.62,R*.46,24,L[k%2],L[2+(k+fi)%2],fi+k*3);}}
 else if(sp===3){for(k=0;k<3;k++){const a3=a0+k/3*TAU;blob(T.x+Math.cos(a3)*R*.42,T.y0+T.H*.93+((k*11)%7),T.z+Math.sin(a3)*R*.42,R*.52,15,L[k%3],L[2],fi+k);}}
 else if(sp===4){blob(T.x,yTop-26,T.z,R*.60,30,L[(fi)%3],L[3],fi);   // mahogany: a high dense umbrella, one dome and a ring of lobes under its rim
  for(k=0;k<(cheap?3:5);k++){const a4=a0+k/5*TAU;blob(T.x+Math.cos(a4)*R*.55,yTop-52-((k*17)%13),T.z+Math.sin(a4)*R*.55,R*.42,22,L[(k+fi)%3],L[3],fi+k*2);}}
 else{for(k=0;k<(cheap?3:4);k++){const t=k/3;   // kapok: flat stacked tiers, widest lowest, bare crown top
  const a5=a0+k*1.9;blob(T.x+Math.cos(a5)*R*.12,mix(yc0+14,yTop-12,t),T.z+Math.sin(a5)*R*.12,R*mix(.86,.34,t),mix(14,11,t),L[(k+fi)%4],L[2],fi+k);}}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
HYPERJUNGLE.buildTrees=function(R,heroR,q){
 reseed(550001);q=q==null?1:q;heroR=heroR||1500;R=Math.max(R||3000,heroR+200);tints();standQuantiles(R);
 const st={trunk:0,limb:0,bough:0,twig:0,root:0,far:0,sapTris:0,roots:0,topBoughs:0,boughs:0,twigs:0,spots:0,clumps:0,racemes:0,pods:0,capsules:0,flowers:0,sapClumps:0};
 const TREES=HYPERJUNGLE.TREES;TREES.length=0;const SAPS=HYPERJUNGLE.SAPLINGS;SAPS.length=0;
 const mk=(x,y,z,hero)=>{const sp=standSp(x,z),S=SP[sp];
  return{x:x,z:z,y0:y-.8,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),crown0:S.crown0,seed:ri(0,999999),hero:hero};};
 // 1. HERO hypertrees: area-uniform over the hero disc, Girder's 165 m minimum spacing
 const nHero=Math.round(Math.PI*heroR*heroR/125000*q);
 BIO.scatter(nHero,0,heroR,165,(x,y,z)=>{TREES.push(mk(x,y,z,true));},{pad:34});
 const heroes=TREES.slice();
 // 2. FAR impostors from heroR out to R, one per ~150 m cell, no patchiness (the canopy must close)
 BIO.grid(165*Math.sqrt(1/Math.max(.25,q)),heroR+30,R,(x,z,d)=>{for(const T of heroes)if(Math.hypot(x-T.x,z-T.z)<T.crownR+60)return 0;return 1;},
  (x,y,z)=>{TREES.push(mk(x,y,z,false));},{patch:0,pad:20});
 const fars=TREES.filter(T=>!T.hero);
 // 3. SAPLINGS between the heroes, and a sparse ring out to heroR+400 so the impostor line is not a cliff
 const near=(x,z)=>{for(const T of TREES){const d=Math.hypot(x-T.x,z-T.z);if(d<trunkR(T,T.y0+5)*1.5+(T.hero?34:22))return false;}return true;};
 BIO.grid(74,0,heroR+400,(x,z,d)=>d<heroR?.85:.32*(1-(d-heroR)/400)+.06,(x,y,z,d)=>{if(!near(x,z))return;
  const sp=standSp(x,z,.35),H=20+40*Math.pow(rng(),1.4),cr=H*SAP_CR[sp]+2;
  if(!BIO.clearOf(x,z,cr+4))return;
  SAPS.push({x:x,z:z,y0:y-1,H:H,sp:sp,cr:cr,ring:d>=heroR});},{patch:.5,pad:6});
 // build
 heroes.forEach((T,ti)=>buildHero(T,ti,q,st));
 fars.forEach((T,fi)=>buildFar(T,fi,st));
 SAPS.forEach((Sd,si)=>buildSapling(Sd,si,q,st));
 const ct=BIO.defs.clump0.tris,bark=st.trunk+st.limb+st.bough+st.twig+st.root,leaves=st.clumps*ct,hang=st.racemes*BIO.defs.raceme.tris+(st.pods+st.capsules)*BIO.defs.pod.tris;
 const sap=st.sapTris+st.sapClumps*ct;
 const mix6=SP.map(S=>0);heroes.forEach(T=>mix6[T.sp]++);
 return{trees:TREES.length,hyper:heroes.length,far:fars.length,saplings:SAPS.length,heroMix:mix6,
  boughs:st.topBoughs,secondaries:st.boughs,twigs:st.twigs,roots:st.roots,clumps:st.clumps,racemes:st.racemes,pods:st.pods,capsules:st.capsules,flowers:st.flowers,sapClumps:st.sapClumps,
  tris:{trunk:st.trunk,limbs:st.limb,boughs:st.bough,twigs:st.twig,roots:st.root,bark:bark,leaves:leaves,hang:hang,far:st.far,saplings:sap,total:bark+leaves+hang+st.far+sap}};};

// approximate canopy top near (x,z): the highest crown within 200 m, else 60
HYPERJUNGLE._canopyH=function(x,z){let h=0;for(const T of HYPERJUNGLE.TREES){if(Math.hypot(x-T.x,z-T.z)<200)h=Math.max(h,T.y0+T.H);}return h||60;};
})();
