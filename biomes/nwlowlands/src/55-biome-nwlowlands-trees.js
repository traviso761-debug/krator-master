// ================================================================= NORTHWESTERN LOWLANDS — trees
// Twenty tree species and three bamboos, placed by zone from the host's climate
// fields (wet / tropic / dry / flow / upland) and terrainH. The biome's rule is
// VERTICALITY: trees ~50% taller than their Earth kin, clean boles, few low limbs,
// crowns carried high on steeply ascending limbs, spires and spindles -- the eye goes
// up. (The glow-willow is the exception, and hangs its lanterns.) BAMBOO grows in
// GROVES: patches with a hard edge where the tree passes do not plant, culms taller
// in the interior than at the rim, clumping kinds fringing it -- a sub-biome, not a
// scatter. Beyond the LOD spine the trees become blob impostors and the groves blob
// canopies.
// RUNTIME LOD (the core's, as xanadu and swlowlands use it): a hero tree is drawn in full while
// the camera is within NWLOW.LOD.tree of its chunk (BIO.LOD.chunk, 1200 m) and as a lite
// stand-in impostor past that; a far tree is only ever its impostor. The groves' culms the same,
// with lite blobs in the culm colour standing in for them.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=NWLOW.SPECIES,PAL=NWLOW.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
NWLOW.TREES=[];
// the runtime LOD ranges (metres from the camera to a chunk's box; BIO.LOD.scale multiplies them):
// hero trees and the groves' culms in full, the avenue's row (the showpiece, longer), the floor's
// near / mid / far bands, the understorey under the crowns, fallen logs, the dressing on a world's
// structures. Equal ranges share a mesh per item per chunk (the passes use many of the same items),
// so they are kept to a few values: each distinct one is a draw call per item per chunk in view.
NWLOW.LOD={tree:1200,grove:1200,avenue:2000,floor:800,floorMid:1200,farFloor:1200,under:800,logs:1200,dress:1200};

// ---------------------------------------------------------------- zones from the fields
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const wet=BIO.field('wet',x,z),tropic=BIO.field('tropic',x,z),dry=BIO.field('dry',x,z),flow=BIO.field('flow',x,z),up=BIO.field('upland',x,z),h=Y(x,z);
 const trop=smooth(.68,.86,tropic),rain=trop*smooth(.72,.86,wet),sub=(1-trop)*(1-dry)*smooth(.45,.65,wet);
 // bamboo groves: patches of their own in the wet country, likelier by water; a hard-ish edge
 const bk=fbm(x*.0026+5,z*.0026-9,5501,2)+flow*.08+(wet-.8)*.2,bamboo=smooth(.61,.65,bk)*(rain+sub)*(1-dry*.9);
 return{wet,tropic,dry,flow,up,h,rain,sub,bamboo,
  med:dry,
  shore:smooth(3.2,.9,h)*smooth(.82,.95,wet)*(1-dry),
  gully:dry*smooth(.34,.5,wet),
  rip:flow,
  // stands: birch and spire cedar grow in stands of their own
  birchK:smooth(.55,.63,fbm(x*.0021-7,z*.0021+3,5502,2)),spireK:smooth(.56,.64,fbm(x*.0019+11,z*.0019-5,5503,2))};}
NWLOW.zones=zones;

// ---------------------------------------------------------------- colour
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[.25,.25,.25];
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
// the sRGB tint that renders `hex` on a greyscale texture of linear mean m (the instanced small trunks, logs, rocks)
function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
 c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={fibre:texMean(NWLOW.FIBRETEX),smooth:texMean(NWLOW.SMOOTHTEX),wood:texMean(NWLOW.WOODTEX),rock:texMean(NWLOW.ROCKTEX)};return MEAN;}
Object.assign(NWLOW,{means,tint,bright,shade,vary});
// the two-tone bark buckets take the designer's colour as it should look (their material does the light arithmetic)
const barkC=(S,k)=>vary(C(S.bark[(k==null?ri(0,99):k)%S.bark.length]),.01,.05,.04);
// an untextured rod in a species' bark colour, a shade down for the rig
const rodCol=(hex)=>shade(vary(hex,.01,.05,.04),-.3);
const leafCol=(set,k)=>bright(vary(pick(set),.025,.10,.06),k==null?1.3:k);

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+40;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
// the floor asks only about the bole (rt); the trees ask about each other's ground (r)
function blockedTrunk(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<(o.rt||o.r)+pad)return true;}return false;}
NWLOW.blocked=blockedTrunk;NWLOW.blockedGround=blocked;
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const okPts=pts=>{for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+1.5,pts[i].r+1.5))return false;return true;};

// ---------------------------------------------------------------- the LIMB
// A sinuous limb from o toward azimuth a at elevation el, len metres long,
// radius r0 -> r1 over n segments. sag bends it down with distance (a live
// oak's limbs run out level and droop); rise lifts the last part again; wig
// wanders it sideways. A limb that meets the ground RESTS on it -- the
// sprawl oak's limbs lie along the ground for metres and climb again.
function limbPts(o,a,el,len,r0,r1,n,sag,wig,rise){const ca=Math.cos(a),sa=Math.sin(a),ce=Math.cos(el),se=Math.sin(el),sx=-sa,sz=ca;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,v1=rr(-1,1)*wig*.6,pts=[];let rested=0;
 for(let k=0;k<=n;k++){const t=k/n,hd=len*ce*t,lat=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  let y=o.y+len*(se*t+sag*t*t)+(rise||0)*len*Math.pow(smooth(.5,1,t),2)+v1*len*Math.sin(t*TAU)*.5;
  const x=o.x+ca*hd+sx*lat,z=o.z+sa*hd+sz*lat,r=mix(r0,r1,Math.pow(t,.8));
  const gy=Y(x,z)+r*.75;if(k>0&&y<gy){y=gy;rested++;}
  pts.push({x,y,z,r});}
 pts.rested=rested;return pts;}
// a limb's direction at point i (for secondaries)
function limbDir(pts,i){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z;return Math.atan2(dz,dx);}

// ---------------------------------------------------------------- foliage and epiphytes
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao*1.3),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
// the foliage colour of a clump: the species' set, with the odd flush of bronze new growth
function crownCol(S,flush){return C(rng()<(flush||0)?pick(PAL.flush):pick(S.leaf));}
// Spanish moss off a limb point: how much depends on the species and how wet the ground is
function mossAt(p,k,wet,st,Lmax){const n=Math.round(rr(0,2.2)*k*smooth(.45,.9,wet));
 for(let i=0;i<n;i++){const L=rr(1.5,Lmax||7);BIO.put('beard',[p.x+rr(-.7,.7),p.y-(p.r||.3)*.6,p.z+rr(-.7,.7)],qEuler(0,rr(0,TAU),0),[rr(1,2.2),L,1],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.02));st.moss++;}}
// a staghorn fern on a bole: a shield and antlers, facing out
function staghorn(x,y,z,a,R,s,st){const nx=Math.cos(a),nz=Math.sin(a);
 BIO.put('staghorn',[x+nx*(R+.05),y-s*.3,z+nz*(R+.05)],qFacing([nx,rr(-.1,.25),nz]),[s,s,1],leafCol(PAL.aroid,1.35));
 BIO.put('staghorn',[x+nx*(R+.1),y-s*.2,z+nz*(R+.1)],qFacing([nx,-.6,nz]),[s*.9,s*1.2,1],leafCol(PAL.aroid,1.3));st.epi++;}
// a bromeliad perched on a bough
// grey-green tank bromeliads and air plants only: a red rosette on a bough reads as a flower
// growing out of the bark, which is not how these trees flower
function brom(p,st){const R=rr(.35,.8),c=rng()<.5?vary(pick(PAL.mossPale),.02,.06,.05):vary(pick(PAL.aroid),.03,.1,.06);
 BIO.put('brom',[p.x,p.y+p.r*.8,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R,R*1.1,R],bright(c,1.1));st.epi++;}
// ---------------------------------------------------------------- the crown, ON its branches
// A clump's centre sits within a third of its own size of a real branch point,
// a little above it: no foliage hangs in the air. twigs() sprouts short
// three-sided tips off a branch point where a crown needs more to carry.
function twigs(fam,S,p,a0,n,len,elLo,elHi,st,out){for(let k=0;k<n;k++){const a=a0+rr(-1.4,1.4),el=rr(elLo,elHi),L=len*rr(.7,1.2),r=Math.max(.05,(p.r||.2)*.5);
  const tip={x:p.x+Math.cos(a)*Math.cos(el)*L,y:p.y+Math.sin(el)*L,z:p.z+Math.sin(a)*Math.cos(el)*L,r:.04};
  if(!clear3(tip.x,tip.y,tip.z,1,1))continue;st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r},tip],barkC(S),{seg:3});out.push(tip);}}
function crownOn(item,spots,sz0,flat,colFn,T,cy,ex,ey,dens,st){let n=0;
 for(const p of spots){const m=Math.floor(dens)+(rng()<dens%1?1:0);
  for(let c=0;c<m;c++){const sz=sz0*rr(.85,1.2),a=rr(0,TAU),d=sz*.3*Math.sqrt(rng()),x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,y=p.y+sz*flat*rr(.1,.35);
   if(!clear3(x,y,z,sz*.5,sz*flat*.5))continue;clumpAt(item,x,y,z,sz,flat,colFn(),T.x,cy,T.z,ex,ey);st.clumps++;n++;}}
 return n;}
// a LEADER: an upright limb from the bole to the crown's top, so the top of a crown is carried
function leader(fam,S,T,from,top,r0,st,all){const el=Math.PI/2-rr(.1,.32),len=(top-from.y)/Math.sin(el);if(len<1.5)return null;
 const pts=limbPts({x:from.x,y:from.y,z:from.z},rr(0,TAU),el,len,r0,.1,4,-.02,.05,0);if(!okPts(pts))return null;
 st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});if(all)all.push(...pts);return pts;}
// an ARCH: a vault limb, parametrised by what it does -- out to `reach`, up to `peak` metres
// over its origin at fraction pT of the way, and down to `end` metres over the origin at the tip
function archPts(o,a,reach,peak,pT,end,r0,r1,n,wig){const ca=Math.cos(a),sa=Math.sin(a),sx=-sa,sz=ca,w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,lat=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*reach;
  const f=t<=pT?1-Math.pow(1-t/pT,2):1-(1-end/peak)*Math.pow((t-pT)/(1-pT),2);
  const x=o.x+ca*reach*t+sx*lat,z=o.z+sa*reach*t+sz*lat,r=mix(r0,r1,Math.pow(t,.8));let y=o.y+peak*f+Math.sin(t*9+w1*7)*reach*.012;
  const gy=Y(x,z)+r*.75;if(k>0&&y<gy)y=gy;pts.push({x,y,z,r});}
 return pts;}
function spread(T,pts){let s=T.crownR*.5;for(const p of pts){const d=Math.hypot(p.x-T.x,p.z-T.z);if(d>s)s=d;}return s;}
function reg(T,S){if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:Math.max(T.spread||0,T.crownR*.6),h:T.H});}
// the bole: a lathe with a flared, lobed foot; closed at the top with a dome ring (never an open pipe)
function bole(fam,T,S,top,rb,flare,fh,lobes,seg,vs,lean){const nl=lobes||0,L=[],ti=T.seed%3;for(let k=0;k<nl;k++)L.push({a:k/nl*TAU+rr(-.3,.3),amp:rr(.5,1.1)});
 const lobeSum=ang=>{let s=0;for(const q of L){const c=Math.cos(ang-q.a);if(c>0)s+=q.amp*Math.pow(c,5);}return s;};
 const la=rr(0,TAU),lx=Math.cos(la)*(lean||0),lz=Math.sin(la)*(lean||0);
 const rAt=u=>rb*(1-.35*u)*(1+flare*Math.exp(-u*top/fh)),rings=[],step=Math.max(.8,Math.min(vs*.5,top/7));
 for(let yy=0;yy<top;yy+=(yy<fh*1.5?Math.min(step,fh*.5):step))rings.push({x:T.x+lx*yy,y:T.y0+yy,z:T.z+lz*yy,r:rAt(yy/top),yy:yy,col:barkC(S,Math.floor(yy/9)+ti)});
 const r1=rAt(1);rings.push({x:T.x+lx*top,y:T.y0+top,z:T.z+lz*top,r:r1,yy:top,col:barkC(S,1)},{x:T.x+lx*top,y:T.y0+top+r1*.8,z:T.z+lz*top,r:.05,yy:top+1,col:barkC(S,1)});
 const tris=BIO.lathe(fam,rings,seg,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+(nl?flare*.9*Math.exp(-R.yy/fh)*lobeSum(ang):0)+.03*Math.sin(5*ang+R.yy*.2)),
  nl?(R,ang)=>mix(1,.6+.4*clamp(lobeSum(ang),0,1),Math.exp(-R.yy/fh)):null);
 return{tris,top:{x:T.x+lx*top,y:T.y0+top,z:T.z+lz*top},rAt,lx,lz};}


// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet} and lv 2 near / 1 mid
const B={};
// COLUMN: a clean bole to a high crotch, a few STEEP limbs and a leader, the crown up
// there on their secondaries. Birch comes in several stems from one foot; the gums and
// the tower ash hang ribbons of shed bark; the she-oak drapes; the wattle flowers gold.
B.column=function(T,st,lv){const S=SP[T.sp],fam=S.bk,rb0=T.rb,nS=S.stems?(lv===2?ri(S.stems[0],Math.min(4,S.stems[1])):1):1,all=[],spots=[];
 for(let si=0;si<nS;si++){const off=si?rr(.4,1.3):0,sa=rr(0,TAU),H=T.H*(si?rr(.72,.95):1),rb=rb0*(si?rr(.7,.95):1);
  const Ts=Object.assign({},T,{x:T.x+Math.cos(sa)*off,z:T.z+Math.sin(sa)*off});
  const hc=H*rr(S.crotch[0],S.crotch[1]),bt=S.buttress||0;
  const bo=bole(fam,Ts,S,hc,rb,bt?bt:.3,bt?4:1.2,bt?ri(4,6):0,lv===2?(rb>1?12:8):6,4,S.stems?rr(.01,.05):rr(0,.025));st.trunk+=bo.tris;
  const nL=lv===2?ri(S.limbs[0],S.limbs[1]):Math.max(2,S.limbs[0]-1),a0=rr(0,TAU);
  for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),u=rr(.82,1),o={x:bo.top.x-bo.lx*(1-u)*hc+Math.cos(a)*rb*.3,y:T.y0+hc*u,z:bo.top.z-bo.lz*(1-u)*hc+Math.sin(a)*rb*.3};
   const el=rr(.95,1.3),len=(T.y0+H-o.y)*rr(.75,1.02)/Math.sin(el),pts=limbPts(o,a,el,len,rb*rr(.35,.5),.08,5,-.06,.07,0);if(!okPts(pts))continue;
   st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?6:4,cap:true});all.push(...pts);st.limbs++;
   for(let i=2;i<pts.length;i+=(lv===2&&nS===1)?1:2){const p=pts[i],len2=T.crownR*rr(.3,.5),sp=limbPts(p,a+rr(-1.2,1.2),rr(.25,.8),len2,Math.max(.06,p.r*.5),.04,3,-.12,.1,0);
    if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:3});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],a,1,len2*.4,.1,.8,st,spots);}}
  const L=leader(fam,S,Ts,bo.top,T.y0+H,rb*.4,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.3,0,.6,st,spots);}
  if(S.ribbons&&lv===2)for(let j=0,m=ri(3,7);j<m;j++){const u=rr(.1,.9),a=rr(0,TAU),R=bo.rAt(u);BIO.put('strand',[Ts.x+bo.lx*hc*u+Math.cos(a)*(R+.05),T.y0+hc*u,Ts.z+bo.lz*hc*u+Math.sin(a)*(R+.05)],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.25,.6),rr(2,7),1],C(0xd8d2bc));}   // ribbons of shed bark
  if(bt&&lv===2&&rng()<.7)staghorn(Ts.x,T.y0+hc*rr(.2,.5),Ts.z,rr(0,TAU),bo.rAt(.3),rr(1.2,2),st);}
 const cy=T.y0+T.H*.85,ex=T.crownR,ey=T.H*.15,sz0=T.sp===0||T.sp===12?rr(8,11):S.item==='lance'?rr(5,7):rr(4,6);
 if(S.item==='drape'){crownOn('needle',spots.filter(()=>rng()<.4),sz0*.7,.6,()=>C(pick(S.leaf)),T,cy,ex,ey,1,st);
  spots.forEach(p=>{for(let j=0,m=lv===2?ri(1,2):1;j<m;j++)BIO.put('drape',[p.x+rr(-.8,.8),p.y+rr(0,.8),p.z+rr(-.8,.8)],qEuler(0,rr(0,TAU),0),[rr(.8,1.5),rr(2,4.5),1],leafCol(S.leaf,1.25));});}
 else{const fl=S.flower?spots.filter(()=>rng()<.3):[],lf=S.flower?spots.filter(p=>fl.indexOf(p)<0):spots;
  crownOn(S.item,lf,sz0,S.item==='lance'?.8:.62,()=>C(pick(S.leaf)),T,cy,ex,ey,lv===2?1.4:.9,st);
  if(fl.length)crownOn('blossom',fl,sz0*.8,.6,()=>vary(C(pick(S.flower)),.01,.05,.04),T,cy,ex,ey,lv===2?1.4:.9,st);}
 T.spread=spread(T,all);reg(T,S);};
// FASTIGIATE: a leader to the top and many short limbs hugging it all the way up --
// a green spindle (column ginkgo, spindle poplar)
B.fastigiate=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.22,rb,.3,1.2,0,lv===2?9:6,4,rr(0,.02));st.trunk+=bo.tris;const all=[],spots=[];
 const L=leader(fam,S,T,bo.top,T.y0+H,rb*.6,st,all);if(L)spots.push(L[2],L[3],L[4]);
 const nL=lv===2?ri(10,15):6;
 for(let k=0;k<nL;k++){const u=mix(.2,.86,(k+rr(0,1))/nL),y=T.y0+H*u,a=k*GOLD+rr(-.3,.3),env=Math.sin(Math.PI*mix(.1,1,u)),len=T.crownR*mix(.7,1.2,env)*rr(.9,1.1);
  const pts=limbPts({x:T.x+Math.cos(a)*rb*.3,y,z:T.z+Math.sin(a)*rb*.3},a,rr(1.15,1.38),len/Math.cos(1.2)*.35,rb*.28,.05,3,-.02,.05,0);if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?4:3,cap:true});all.push(...pts);spots.push(pts[1],pts[2],pts[3]);}
 crownOn(S.item,spots,rr(3.5,4.8),1.05,()=>C(pick(S.leaf)),T,T.y0+H*.55,T.crownR,H*.45,lv===2?1.3:.8,st);
 T.spread=spread(T,all);reg(T,S);};
// SPIRE: a straight tapering column to the very top and whorls of short limbs (spire
// cedar: conical from a third of the way up; needle cypress: a narrow flame; crag pine:
// a bare pole to 70% and a few flat layered pads at the top)
B.spire=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.97,rb,S.flatTop?.25:.45,1.5,0,lv===2?9:6,4,rr(0,.02));st.trunk+=bo.tris;const all=[];
 const at=y=>({x:T.x+bo.lx*(y-T.y0),z:T.z+bo.lz*(y-T.y0)});
 if(S.flatTop){const spots=[],n=lv===2?ri(5,7):4,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const y=T.y0+H*mix(.72,.95,k/n),c=at(y),a=a0+k*GOLD,pts=limbPts({x:c.x,y,z:c.z},a,rr(.05,.35),T.crownR*rr(.6,1),rb*.3,.06,4,-.05,.1,.12);
   if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:4,cap:true});all.push(...pts);spots.push(pts[2],pts[3],pts[4]);}
  crownOn('needle',spots,rr(4,5.5),.26,()=>C(pick(S.leaf)),T,T.y0+H*.85,T.crownR,H*.1,lv===2?1.6:1,st);
  for(let k=0;k<(lv===2?ri(2,4):0);k++){const y=T.y0+H*rr(.2,.6),c=at(y),a=rr(0,TAU);BIO.beam('rod',[c.x,y,c.z],[c.x+Math.cos(a)*rr(1,2),y+rr(-.3,.3),c.z+Math.sin(a)*rr(1,2)],.06,.03,C(0x4a5250));}}
 else{const col=!!S.columnar,y0=T.y0+H*(col?.06:.3),nW=lv===2?(col?16:13):8,spots=[];
  for(let k=0;k<nW;k++){const u=k/(nW-1),y=mix(y0,T.y0+H*.96,u),c=at(y),R=col?T.crownR*(.55+.45*Math.sin(Math.PI*mix(.15,1,u)))*(1-.5*u):T.crownR*Math.pow(1-u,.85)+.6,m=lv===2?(col?3:4):3,a0=rr(0,TAU);
   for(let j=0;j<m;j++){const a=a0+j/m*TAU+rr(-.3,.3),el=col?rr(.9,1.2):rr(-.12,.25),len=R/Math.max(.35,Math.cos(el));
    if(lv===2&&!col){const pts=limbPts({x:c.x,y,z:c.z},a,el,len,Math.max(.06,rb*.16*(1-u)),.04,2,-.1,.05,0);st.limb+=BIO.tube(fam,pts,barkC(S),{seg:3});all.push(...pts);spots.push(pts[1],pts[2]);}
    else spots.push({x:c.x+Math.cos(a)*R*.6,y:y+(col?R*.5:0),z:c.z+Math.sin(a)*R*.6,r:.1});}}
  crownOn('needle',spots,col?rr(2.4,3.2):rr(3,4.2),col?1.1:.55,()=>C(pick(S.leaf)),T,T.y0+H*.6,T.crownR,H*.45,lv===2?1.1:.8,st);}
 T.spread=Math.max(T.crownR,spread(T,all));reg(T,S);};
// PALM (mist palm): a pale ringed stem, tall and thin, a green crownshaft, an arching
// crown of feather fronds and lilac flower strings hanging below the shaft
B.palm=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(.01,.06),pts=[];
 for(let i=0;i<=6;i++){const u=i/6;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0-.2+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*(1+.35*Math.exp(-u*10))*(1-.15*u),col:u>.9?C(0x6a8a5a):barkC(S)});}
 st.trunk+=BIO.tube('bk_ring',pts,barkC(S),{seg:lv===2?7:5,cap:true});const e=pts[6];
 const nf=lv===2?ri(9,13):6,a0=rr(0,TAU),hc=vary(C(pick(S.leaf)),.02,.08,.05);
 for(let f=0;f<nf;f++)frondAt('palmfrond',e.x,e.y+.3,e.z,a0+f/nf*TAU+rr(-.2,.2),T.crownR*rr(.85,1.1),rr(-.7,.35),bright(hc,1.4),1.05);
 if(lv===2)for(let j=0,m=ri(2,4);j<m;j++){const a=rr(0,TAU);BIO.put('strand',[pts[5].x+Math.cos(a)*rb*1.2,pts[5].y,pts[5].z+Math.sin(a)*rb*1.2],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.3,.5),rr(1,2),1],C(pick(PAL.lantern)).lerp(C(0xffffff),.3));}
 st.fronds+=nf;if(lv===2&&rng()<.4){T.spread=T.crownR;reg(T,S);}};
// FERN (spire tree fern): a slim dark trunk, a crown of long fronds, the old ones hanging grey
B.fern=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.1),pts=[];
 for(let i=0;i<=4;i++){const u=i/4;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0-.2+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*(1+.5*Math.exp(-u*6))});}
 st.trunk+=BIO.tube('bk_fern',pts,barkC(S),{seg:lv===2?7:5,cap:true});const e=pts[4],nf=lv===2?ri(11,16):7,a0=rr(0,TAU),hc=vary(C(pick(S.leaf)),.03,.1,.05);
 for(let f=0;f<nf;f++)frondAt('bigfrond',e.x,e.y,e.z,a0+f/nf*TAU+rr(-.2,.2),T.crownR*rr(.85,1.1),rr(-.25,.3),bright(hc,1.45),1.2);
 if(lv===2){for(let f=0;f<4;f++)frondAt('bigfrond',e.x,e.y+.2,e.z,a0+f*1.6,T.crownR*.5,rr(.7,1.1),bright(shade(hc,.1),1.45),1);
  for(let k=0,m=ri(3,6);k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[e.x+Math.cos(a)*rb,e.y-.4,e.z+Math.sin(a)*rb],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.8,1.4),rr(1.5,3),1],C(0x8a8e84));}}
 st.fronds+=nf;};
// PANDAN (stilt pandan): a short trunk on a cone of stilt roots, branching arms each
// ending in a tall spiral tuft of blade leaves -- upright even at the lake's edge
B.pandan=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,base=T.y0+rr(1,2),all=[];
 for(let k=0,m=lv===2?ri(6,9):4;k<m;k++){const a=k/m*TAU+rr(-.2,.2),R=rr(1,2.2),gx=T.x+Math.cos(a)*R,gz=T.z+Math.sin(a)*R;
  st.limb+=BIO.tube('bk_ring',[{x:T.x+Math.cos(a)*rb*.6,y:base+rr(.3,1),z:T.z+Math.sin(a)*rb*.6,r:rb*.4},{x:gx,y:Y(gx,gz)-.3,z:gz,r:rb*.3}],barkC(S),{seg:4});}
 const trunk=[{x:T.x,y:base,z:T.z,r:rb},{x:T.x,y:T.y0+H*.45,z:T.z,r:rb*.8}];st.trunk+=BIO.tube('bk_ring',trunk,barkC(S),{seg:6});
 for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),pts=limbPts(trunk[1],a,rr(.9,1.25),H*rr(.4,.55),rb*.6,rb*.4,3,-.05,.08,.1);st.limb+=BIO.tube('bk_ring',pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  const e=pts[3],hc=vary(C(pick(S.leaf)),.02,.06,.05);for(let t=0;t<3;t++)BIO.put('spike',[e.x,e.y-.3,e.z],qEuler(rr(-.2,.2),t*1.1+rr(0,1),rr(-.2,.2)),[T.crownR*.9,T.crownR*1.1,T.crownR*.9],bright(hc,1.3));
  if(lv===2&&rng()<.3)BIO.put('pompom',[e.x+rr(-.3,.3),e.y-.5,e.z+rr(-.3,.3)],qEuler(0,rr(0,TAU),0),[.35,.45,.35],C(0xd87a2a));}
 T.spread=spread(T,all);};
// the GLOW-WILLOW: a silver twisting bole, limbs arching over, veils to the ground in
// lavender-grey-green, and hanging from the limbs on fine strings its LANTERN BLOSSOMS:
// papery calyxes that light themselves, violet to amethyst, each in a soft glow
B.willow=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.28,.38),bo=bole(fam,T,S,hc,rb,.6,1.2,ri(3,5),lv===2?10:7,3,rr(.12,.28));st.trunk+=bo.tris;
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),len=T.crownR*rr(.8,1.15),pts=limbPts(bo.top,a,rr(.8,1.15),len,rb*.45,.08,6,-rr(.6,.9),.12,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  const nv=lv===2?ri(14,20):6;
  for(let v=0;v<nv;v++){const i=ri(2,pts.length-1),p=pts[i],px=p.x+rr(-1.8,1.8),pz=p.z+rr(-1.8,1.8),gy=Y(px,pz),Lv=Math.max(1.5,(p.y-gy)*rr(.55,.95));
   BIO.put('veil',[px,p.y+rr(0,1),pz],qEuler(0,rr(0,TAU),0),[rr(.45,.85),Lv*rr(.7,1),1],leafCol(S.leaf,1.2));st.veils++;}
  // the lanterns: on strings from the limb, at various lengths, the lowest near head height
  const nl=lv===2?ri(7,12):3;
  for(let j=0;j<nl;j++){const i=ri(2,pts.length-1),p=pts[i],px=p.x+rr(-1.5,1.5),pz=p.z+rr(-1.5,1.5),gy=Y(px,pz),drop=Math.min(p.y-gy-1.2,rr(1.5,7));if(drop<.5)continue;
   const ly=p.y-drop,s=rr(.28,.45),col=bright(vary(C(pick(PAL.lantern)),.02,.05,.05),1.1);
   if(lv===2)BIO.beam('rod',[px,p.y,pz],[px,ly,pz],.012,null,C(0x8a9290));
   BIO.put('lantern',[px,ly,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*1.25,s],col);
   BIO.put('halo',[px,ly-s*.6,pz],qEuler(0,rr(0,TAU),0),s*rr(1.9,2.5),col.clone().multiplyScalar(.3));st.lanterns++;}}
 T.spread=spread(T,all);reg(T,S);};
// the GRASS TREE: a short charred trunk (sometimes two heads), a fountain of fine blades,
// a grey skirt of dead ones, and a spear of a flower spike far above it all
B.grasstree=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,heads=rng()<.25?2:1;
 for(let h=0;h<heads;h++){const a=rr(0,TAU),hh=H*(h?rr(.6,.85):1),top={x:T.x+(h?Math.cos(a)*.9:0),y:T.y0+hh,z:T.z+(h?Math.sin(a)*.9:0)};
  st.trunk+=BIO.tube('bk_char',[{x:T.x,y:T.y0-.2,z:T.z,r:rb*1.15},{x:mix(T.x,top.x,.5),y:T.y0+hh*.5,z:mix(T.z,top.z,.5),r:rb},{x:top.x,y:top.y,z:top.z,r:rb*.9}],barkC(S),{seg:6,cap:true});
  const R=T.crownR,hc=C(pick(PAL.gum));for(let t=0;t<(lv===2?5:3);t++)BIO.put('spike',[top.x,top.y-R*.35,top.z],qEuler(rr(-.25,.25),t*1.3,rr(-.25,.25)),[R*2,R*1.3,R*2],bright(vary(hc,.02,.06,.05),1.3));
  if(lv===2)for(let k=0;k<ri(5,9);k++){const a2=rr(0,TAU);BIO.put('strand',[top.x+Math.cos(a2)*rb,top.y-.2,top.z+Math.sin(a2)*rb],qFacing([Math.cos(a2),0,Math.sin(a2)]),[rr(.5,.9),rr(.8,1.6),1],C(0x9a9888));}
  if(rng()<.55){const sh=rr(2.5,4.5);BIO.beam('rod',[top.x,top.y,top.z],[top.x,top.y+sh,top.z],.06,.045,C(0x5a5a4e));
   const col=C(pick(PAL.grassSpike));for(let j=0;j<(lv===2?16:6);j++){const yy=top.y+sh*rr(.35,1),aa=rr(0,TAU);BIO.put('bloom',[top.x+Math.cos(aa)*.08,yy,top.z+Math.sin(aa)*.08],qEuler(rr(-.3,.3),aa,rr(-.3,.3)),rr(.1,.16),col);}}}};
// the CANDLE BANKSIA: a small grey tree of ascending branches, leathery leaves, and at
// the tips its flowers standing straight up like candles, orange to gold
B.banksia=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;const bo=bole(fam,T,S,H*.3,rb,.3,1,0,lv===2?7:5,3,rr(0,.08));st.trunk+=bo.tris;const spots=[],all=[];
 for(let k=0,n=lv===2?ri(4,6):3;k<n;k++){const a=k*GOLD+rr(-.3,.3),pts=limbPts(bo.top,a,rr(.8,1.2),H*rr(.55,.75),rb*.5,.06,4,-.08,.1,0);st.limb+=BIO.tube(fam,pts,barkC(S),{seg:4,cap:true});all.push(...pts);spots.push(pts[2],pts[3],pts[4]);}
 crownOn('glossy',spots,rr(2.5,3.4),.7,()=>C(pick(S.leaf)),T,T.y0+H*.7,T.crownR,H*.3,lv===2?1.3:.9,st);
 if(lv>=1)spots.forEach(p=>{if(rng()>.55)return;const hgt=rr(.35,.6);BIO.put('pompom',[p.x+rr(-.4,.4),p.y+hgt+.4,p.z+rr(-.4,.4)],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[.12,hgt,.12],bright(C(pick(PAL.banksiaCandle)),.9));st.blooms++;});
 T.spread=spread(T,all);};

// ---------------------------------------------------------------- impostors (the far canopy)
// Blobs in the 'far' bucket. The wide species get flattened, overlapping blobs out
// to their real width, so the silhouette from the hills reads WIDE too.
// lite: the stand-in behind a hero tree (seen only past NWLOW.LOD.tree): fewer, coarser blobs
// (the 20-triangle blob for crowns under 16 m) on a one-band bole; draws no random numbers, so
// the heroes built after it are unchanged.
let ICO=null,ICO0=null,OCT=null;
function buildFar(T,fi,st,lite){const K=BIO.bucket('far');if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}
 const S=SP[T.sp],cheap=lite||BIO.lodD(T.x,T.z)>2200,ip=lite&&T.crownR<16?ICO0:ICO;let tris=0;   // a wide crown keeps the finer blob: at 1.2 km it is still 60-100 px across
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=cheap?4:6,shape=({column:'column',fastigiate:'spindle',spire:(S.flatTop?'pine':'spindle'),willow:'weep'})[S.habit]||'round';
 const top=T.y0+T.H*(shape==='column'?(S.crotch?S.crotch[0]:.6):shape==='spindle'?.85:shape==='pine'?.9:.6),rings=[];
 (lite?[0,1]:[0,.06,.5,1]).forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.4,T.rb*(1-.5*u)*(u<.08?1.5:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.45*(.7+.3*(r2/rings.length));
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=S.leaf.map(h=>bright(h,.85)),R=T.crownR,H=T.H,a0=(T.seed%628)/100,n=L.length;
 if(shape==='wide'){const m=cheap?3:5;blob(T.x,T.y0+H*.75,T.z,R*.55,H*.22,L[fi%n],L[(fi+2)%n],fi);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU;blob(T.x+Math.cos(a)*R*.58,T.y0+H*mix(.5,.68,(k*7%5)/5),T.z+Math.sin(a)*R*.58,R*.42,H*.18,L[(k+fi)%n],L[(k+1)%n],fi+k);}}
 else if(shape==='parasol'){blob(T.x,T.y0+H*.85,T.z,R*.85,H*.09,L[fi%n],L[(fi+1)%n],fi);if(!cheap)blob(T.x,T.y0+H*.72,T.z,R*.55,H*.07,L[1%n],L[2%n],fi+3);}
 else if(shape==='tier'){for(let k=0;k<(cheap?2:3);k++)blob(T.x,T.y0+H*mix(.4,.88,k/2),T.z,R*mix(.9,.4,k/2),H*.06,L[(k+fi)%n],L[(k+1)%n],fi+k);}
 else if(shape==='pine'){blob(T.x,T.y0+H*.92,T.z,R*.8,H*.1,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='flat'){blob(T.x,T.y0+H*.86,T.z,R*.9,H*.12,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='column'){const c0=S.crotch?S.crotch[0]:.6;blob(T.x,T.y0+H*mix(c0,1,.6),T.z,R*.75,H*(1-c0)*.42,L[fi%n],L[(fi+1)%n],fi);if(!cheap)blob(T.x+Math.cos(a0)*R*.3,T.y0+H*.93,T.z+Math.sin(a0)*R*.3,R*.45,H*.08,L[(fi+2)%n],L[1%n],fi+3);}
 else if(shape==='spindle'){blob(T.x,T.y0+H*.58,T.z,R*.95,H*.4,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='weep'){blob(T.x,T.y0+H*.55,T.z,R*.85,H*.42,L[fi%n],L[(fi+1)%n],fi);}
 else{blob(T.x,T.y0+H*.72,T.z,R*.85,H*.25,L[fi%n],L[(fi+2)%n],fi);}
 {const kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);}   // written raw, so the impostor's triangles carry the tree's lod key here
 K.tris+=tris;BIO.tally(tris,0,0);if(lite)st.lite+=tris;else st.far+=tris;}


// ---------------------------------------------------------------- the BAMBOO GROVES
// A grove is a patch of the `bamboo` zone weight with a hard edge (zones()). Inside it
// the tree passes do not plant. Sky bamboo fills the interior, its culms tallest in the
// middle and lower toward the rim so a grove reads as one mass; Buddha-belly bamboo and
// coil cane fringe it where it is wet. Near the spine every culm has leaf sprays up its
// top half; mid-range a couple of big sprays; far, the grove is a blob canopy.
// Runtime LOD: the near and mid bands' culms and leaf are drawn within NWLOW.LOD.grove of the camera;
// past it a lite blob (farGrove lite) stands in, one per 22 m cell (the far band's spacing) where a sky culm
// clump stood. The far band is its blobs only, always drawn.
function groves(R,q,st){const skyS=SP[20],bellyS=SP[21],coilS=SP[22],m=means();
 const culmTint=hex=>tint(vary(C(hex),.015,.06,.05),m.culm,1);
 const bands=[[6,420,0,2],[13,1250,420,1],[22,1e9,1250,0]],STAND=new Map();
 bands.forEach(b=>{const lv=b[3];BIO.range=lv?NWLOW.LOD.grove:null;BIO.minRange=0;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const Z=zones(x,z);return smooth(.04,.3,Z.bamboo)*q;},(x,y,z)=>{
   if(y<.35||blocked(x,z,.6))return;const Z=zones(x,z),e=smooth(.05,.7,Z.bamboo),fine=fbm(x*.05,z*.05,5504,2);
   // the rim: clumping kinds where it is wet, else a shorter sky bamboo
   const rim=e<.3&&rng()<.55,kind=rim?(Z.flow>.25||Z.wet>.92?'coil':'belly'):'sky',S=kind==='sky'?skyS:kind==='belly'?bellyS:coilS;
   if(lv===0){if(kind!=='sky')return;const H=rr(S.H[0],S.H[1])*mix(.6,1,e);farGrove(x,y,z,H,st);return;}
   const H=rr(S.H[0],S.H[1])*(kind==='sky'?mix(.55,1,e)*mix(.85,1.1,fine):1),r=rr(S.rb[0],S.rb[1]),lean=[rr(-.04,.04),1,rr(-.04,.04)];
   if(kind==='sky'){const ck=Math.floor(x/22)+','+Math.floor(z/22);if(!STAND.has(ck))STAND.set(ck,[x,y,z,H]);}   // the cell's stand-in
   // culms come in tight clumps (a running bamboo's culms rise close together from one rhizome run)
   const n=kind==='sky'?(lv===2?ri(3,5):2):ri(3,5),spreadC=kind==='sky'?1.3:.8;
   for(let c=0;c<n;c++){const cx=x+(c?rr(-spreadC,spreadC):0),cz=z+(c?rr(-spreadC,spreadC):0),h=H*(c?rr(.75,1):1),col=culmTint(pick(S.bark));
    if(kind==='sky')BIO.put('culm',[cx,y-.2,cz],qUp(lean),[r*2,h,r*2],col);
    else if(kind==='belly')BIO.put('belly',[cx,y-.2,cz],qUp([rr(-.08,.08),1,rr(-.08,.08)]),[r*2.4,h,r*2.4],col);
    else BIO.put('coil',[cx,y-.2,cz],qEuler(0,rr(0,TAU),0),[r/.012*.5,h,r/.012*.5],bright(col,.9));
    st.culms++;}
   // the clump's leaf mass: branches leaf out from a third of the way up (as a culm does), heaviest in the upper half
   const nl=lv===2?(kind==='sky'?ri(5,8):2):(kind==='sky'?2:1);
   for(let k=0;k<nl;k++){const u=lv===2?rr(.32,1)*rr(.85,1.05):rr(.55,1),a=rr(0,TAU),d=rr(.4,2.6)*(kind==='sky'?1:.6),s=(lv===2?rr(4.4,6.4):rr(6,8))*(kind==='sky'?1:.65);
    clumpAt('bleaf',x+lean[0]*H*u+Math.cos(a)*d,y+H*u,z+lean[2]*H*u+Math.sin(a)*d,s,.75,C(pick(S.leaf)),x,y+H*.85,z,4,H*.3);st.clumps++;}},
  {patch:0,pad:.3});});
 // the stand-ins: drawn only past the grove range, from where the culms were (no random numbers)
 BIO.range=1e9;BIO.minRange=NWLOW.LOD.grove;for(const P of STAND.values())farGrove(P[0],P[1],P[2],P[3],st,true);
 BIO.range=null;BIO.minRange=0;
 // shoots at the grove floor are the floor pass's (60)
}
// lite: a near grove's stand-in, a 20-triangle blob from the ground to the culm tops in the pale
// culm colour (what a grove of sky bamboo reads as from a kilometre off) under a little leaf; its
// colours come from its cell, so it draws no random numbers
function farGrove(x,y,z,H,st,lite){const K=BIO.bucket('far');if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}const ip=lite?ICO0:ICO;
 const hc=Math.floor(x/22)*7+Math.floor(z/22)*13&0x7fffffff,pale=lite?C(PAL.culm[hc%PAL.culm.length]).lerp(C(0xffffff),.35):null;
 const ca=(lite?pale.clone().lerp(C(PAL.bamboo[hc%PAL.bamboo.length]),.35):C(pick(PAL.bamboo))).convertSRGBToLinear(),cb=(lite?pale.clone().multiplyScalar(.8):C(PAL.bamboo[0]).multiplyScalar(.6)).convertSRGBToLinear();let tris=0;
 const cy=lite?.55:.72,ry=lite?.5:.3;
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],t=smooth(-.4,.7,dy),sh=.55+.45*smooth(-.7,.8,dy);
  K.pos.push(x+dx*10,y+H*cy+dy*H*ry,z+dz*10);const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;K.nor.push(dx/nl,ny/nl,dz/nl);K.uv.push(0,0);K.col.push(mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
 tris=ip.length/9;{const kk=BIO._lodKey(x,z);for(let i=0;i<tris;i++)K.k.push(kk);}
 K.tris+=tris;BIO.tally(tris,0,0);if(lite)st.lite+=tris;else st.far+=tris;}

// the SMALL species far off: one 20-triangle blob in the leaf colour, so the chaparral
// and the palm groves still read at range instead of stopping at the band edge.
// lite (the stand-in behind a hero): an 8-triangle octahedron, its colour from the tree's seed
function buildFarSmall(T,st,lite){const K=BIO.bucket('far');if(!ICO0)ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;if(!OCT)OCT=new T3.OctahedronGeometry(1,0).attributes.position.array;
 const S=SP[T.sp],ip=lite?OCT:ICO0;
 const ca=bright(C(lite?S.leaf[T.seed%S.leaf.length]:pick(S.leaf)),.85).convertSRGBToLinear(),cb=ca.clone().multiplyScalar(.55),R=T.crownR*.85,H=T.H,cy=T.y0+H*.62;
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],t=smooth(-.5,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
  K.pos.push(T.x+dx*R,cy+dy*Math.max(R*.6,H*.38),T.z+dz*R);K.nor.push(dx/nl,ny/nl,dz/nl);K.uv.push(0,0);K.col.push(mix(cb.r,ca.r,t),mix(cb.g,ca.g,t),mix(cb.b,ca.b,t));}
 const tris=ip.length/9,kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);
 K.tris+=tris;BIO.tally(tris,0,0);if(lite)st.lite+=tris;else st.far+=tris;}

// ---------------------------------------------------------------- the pass
NWLOW.buildTrees=function(R,q,opt){opt=opt||{};
 reseed(560031);q=q==null?1:q;R=R||2850;const m=means();if(!m.culm)m.culm=texMean(NWLOW.CULMTEX);
 const st={trunk:0,limb:0,far:0,lite:0,limbs:0,clumps:0,blooms:0,moss:0,fronds:0,veils:0,lanterns:0,epi:0,culms:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=NWLOW.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 const DENS=.4;   // the showcase's stocking at q=1, measured against the budget (KNOWN_ISSUES)
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;const pad=opt.pad==null?3:opt.pad;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z)*(1-smooth(.02,.2,Z.bamboo));if(a<=0)return 0;   // never inside a bamboo grove
    return a*(opt.lodK?lerp(1,BIO.lod(x,z),opt.lodK):1)*q*(opt.dens==null?DENS:opt.dens);},
   (x,y,z,d)=>{if(!opt.inWater&&y<.3)return;if(opt.inWater&&(y<opt.inWater[0]||y>opt.inWater[1]))return;
    if(blocked(x,z,pad))return;if(!BIO.clearOf(x,z,pad+2))return;
    const T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:(opt.own==null?T.rb*1.5+1:T.crownR*opt.own),rt:T.rb*1.6+.8});n++;},{patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale||.01,noMask:!!opt.inWater,pad:1});
  return n;}
 // AVENUES: rows along a host path (see BIOME-API.md), e.g. ghost gums down a road
 (opt.avenues||[]).forEach(av=>{const P=av.path,sp=SP.findIndex(S=>S.key===av.species),gap=av.spacing||18,off=av.offset||9;let carry=gap*.5;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;let d=carry;
   for(;d<L;d+=gap*rr(.95,1.05))[-1,1].forEach(side=>{const o=off+rr(-.4,.8),x=a[0]+ux*d-uz*side*o,z=a[1]+uz*d+ux*side*o,y=Y(x,z);
    if(y<.3||!BIO.clearOf(x,z,4)||blocked(x,z,2))return;const T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<1100?2:ld<1700?1:0;T.row=1;TREES.push(T);hadd({x,z,r:gap*.4,rt:T.rb*1.6+.8});st.avenue=(st.avenue||0)+1;});
   carry=d-L;}});
 // the emergents and the giants first
 pass(0,120,Z=>Z.rain*.7,{hero:1100,mid:1800,far:true,pad:10,own:.5,patch:.25});                                  // sky meranti
 pass(12,120,Z=>Z.sub*.35*smooth(.7,.85,Z.wet)+Z.rain*.12,{hero:1100,mid:1800,far:true,pad:8,own:.45,patch:.35});   // column kauri
 pass(13,110,Z=>Z.gully*.6+Z.sub*.08*smooth(.2,.6,Z.up),{hero:1100,mid:1900,far:true,pad:8,own:.45,patch:.35});   // tower ash
 pass(5,70,Z=>Z.sub*.3+Z.gully*.25,{hero:1000,mid:1700,far:true,pad:5,patch:.4});                                  // ribbon blue gum
 pass(4,55,Z=>Z.sub*.22+Z.med*.25*(1-Z.up*.5),{hero:1000,mid:1700,far:true,pad:4,patch:.45});                      // ghost gum
 pass(7,34,Z=>Z.sub*Z.spireK*.7,{hero:950,mid:1600,far:true,pad:3,patch:.3});                                     // spire cedar, in stands
 pass(6,32,Z=>Z.sub*Z.birchK*.65*(1-Z.spireK),{hero:850,mid:1500,far:true,pad:1.5,patch:.3});                      // candle birch, in stands
 pass(9,60,Z=>Z.sub*.12+Z.med*.06,{hero:950,mid:1600,far:true,pad:4,patch:.5});                                    // column ginkgo
 pass(11,26,Z=>Z.rip*(Z.sub+Z.med*.5)*.7,{hero:950,mid:1600,far:true,pad:3});                                     // spindle poplar
 pass(8,55,Z=>(Z.rip*.5+Z.shore*.5)*(1-Z.med*.6),{hero:950,mid:1500,far:true,pad:4,own:.35});                     // glow-willow
 pass(10,32,Z=>Z.shore*.6+Z.rain*smooth(.9,.97,Z.wet)*.25,{hero:900,mid:1500,far:true,pad:2.5});                 // pale paperbark
 pass(3,22,Z=>Z.shore*Z.rain*.5+Z.shore*.15,{hero:800,mid:1300,far:true,pad:2,lodK:.5});                       // stilt pandan
 pass(1,20,Z=>Z.rain*.45,{hero:850,mid:1400,far:true,pad:1.5,lodK:.5});                                         // mist palm
 pass(2,18,Z=>Z.rain*.5+Z.sub*smooth(.88,.96,Z.wet)*.2,{hero:800,mid:1300,far:true,pad:1.5,lodK:.5});          // spire tree fern
 pass(19,40,Z=>Z.sub*.08+Z.med*.12,{hero:900,mid:1500,far:true,pad:3,patch:.5});                                  // tall wattle
 pass(15,44,Z=>Z.med*.2+Z.rip*Z.med*.3,{hero:900,mid:1500,far:true,pad:3,patch:.5});                             // drape she-oak
 pass(14,34,Z=>Z.med*.28*(1-Z.gully),{hero:900,mid:1600,far:true,pad:2,patch:.45});                             // needle cypress
 pass(16,60,Z=>Z.med*smooth(.25,.55,Z.up)*.5,{hero:1000,mid:1700,far:true,pad:4,patch:.4});                     // crag pine
 pass(18,32,Z=>Z.med*.22,{hero:800,mid:1300,far:true,pad:1.5,lodK:.5,patch:.5});                               // candle banksia
 pass(17,22,Z=>Z.med*.3*(1-Z.gully),{hero:700,mid:1200,far:true,pad:1,lodK:.5,patch:.5});                       // grass tree
 // build
 const trisS=SP.map(()=>0),cur=()=>{const t=BIO.stats[BIO.cur||'biome'];return t?t.tris:0;};
 // runtime LOD: a hero is drawn in full while the camera is within NWLOW.LOD.tree of its chunk (its foot
 // keys all of it; the avenue's row: NWLOW.LOD.avenue) and as its lite stand-in past that; a far tree is
 // only ever its impostor, always drawn. trisBySpecies counts the tree itself; the stand-ins are tris.lite.
 const SMALL={1:1,2:1,3:1,17:1,18:1},far=(T,i,lite)=>SMALL[T.sp]?buildFarSmall(T,st,lite):buildFar(T,i,st,lite);
 TREES.forEach((T,i)=>{BIO.owner=[T.x,T.z];const t0=cur(),S=SP[T.sp],rg=T.row?NWLOW.LOD.avenue:NWLOW.LOD.tree;
  if(T.lv===0){BIO.range=null;BIO.minRange=0;far(T,i,false);st.fars++;}else{BIO.range=rg;BIO.minRange=0;B[S.habit](T,st,T.lv);st.heroes++;}
  st.byS[T.sp]++;trisS[T.sp]+=cur()-t0;
  if(T.lv>0){BIO.range=1e9;BIO.minRange=rg;far(T,i,true);}});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 // the groves last: they fill the patches the trees left
 const g0=cur();groves(R,q,st);trisS[20]+=cur()-g0;
 return{trees:TREES.length,avenue:st.avenue||0,heroes:st.heroes,far:st.fars,culms:st.culms,lanterns:st.lanterns,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),
  trisBySpecies:SP.map((S,i)=>S.key+':'+Math.round(trisS[i]/1000)+'k').join(' '),limbs:st.limbs,clumps:st.clumps,tris:{trunk:st.trunk,limbs:st.limb,far:st.far,lite:st.lite}};};
NWLOW._canopyH=function(x,z){let h=0;for(const T of NWLOW.TREES){if(Math.hypot(x-T.x,z-T.z)<Math.max(30,T.crownR))h=Math.max(h,T.y0+T.H);}return h||12;};
})();
