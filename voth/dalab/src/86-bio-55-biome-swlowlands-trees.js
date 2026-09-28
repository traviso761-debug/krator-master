// ================================================================= SOUTHWESTERN LOWLANDS — trees
// The twenty-one tree species of the lowlands, each with its own builder (a
// few share one), placed by zone from the host's climate fields (wet / tropic
// / dry / salt / flow / upland) and terrainH. The zone weights are computed
// HERE from those fields, never from the host's map: a world that binds the
// same fields gets the same zoning. The wide species are what the biome is:
// a limb here is a long sinuous tube that can run out along the ground and
// rise again (limbPts), and the crowns sit on the limbs, not on a sphere.
// Beyond the LOD spine the canopy species become blob impostors in the 'far'
// bucket; the small species thin out with distance and stop.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=SWLOW.SPECIES,PAL=SWLOW.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWLOW.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. Aridity tags are honoured by which weight a species reads:
// the 'semiarid' species read med (summer-dry ground), the 'humid' ones rain,
// swamp or sub, never med's dry slopes.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const wet=BIO.field('wet',x,z),tropic=BIO.field('tropic',x,z),dry=BIO.field('dry',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),up=BIO.field('upland',x,z),h=Y(x,z);
 const trop=smooth(.68,.86,tropic),fresh=1-smooth(.45,.8,salt);
 // patch fields: pine flatwoods in the subtropical plain; chaparral vs woodland in the hills
 const pineK=smooth(.54,.64,fbm(x*.0016+14,z*.0016-9,4401,2)),chapK=smooth(.46,.58,fbm(x*.0021-3,z*.0021+6,4402,2)+(.5-wet)*.6);
 return{wet,tropic,dry,salt,flow,up,h,pineK,chapK,
  rain:trop*smooth(.72,.86,wet)*fresh,
  swamp:smooth(.84,.94,wet)*smooth(3.2,1.2,h)*(1-dry)*fresh*smooth(.3,.6,tropic+.25),
  sub:(1-trop)*(1-dry)*smooth(.45,.65,wet),
  med:dry,
  mang:smooth(.25,.6,salt)*smooth(.4,.7,tropic),
  beach:smooth(.55,.9,salt)*smooth(-.2,.6,h)*(1-smooth(.4,.7,tropic)*.6),
  rip:flow*(1-smooth(.5,.8,salt))};}
SWLOW.zones=zones;

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
function means(){if(MEAN)return MEAN;MEAN={fibre:texMean(SWLOW.FIBRETEX),smooth:texMean(SWLOW.SMOOTHTEX),wood:texMean(SWLOW.WOODTEX),rock:texMean(SWLOW.ROCKTEX)};return MEAN;}
Object.assign(SWLOW,{means,tint,bright,shade,vary});
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
SWLOW.blocked=blockedTrunk;SWLOW.blockedGround=blocked;
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
const B=[];
// 5 / 14 the SPRAWL OAK (and the smaller coast oak): a short massive bole and a handful
// of enormous limbs of three habits. VAULT limbs climb steeply, arch over and come down
// at the tips: together they make the high tunnel of a live-oak avenue. SWEEP limbs run
// out low, rest on the ground and climb again. A few UPRIGHT limbs fill the top. The
// crown is carried on secondaries and twigs along all of them; Spanish moss hangs from
// every limb in the wet. An avenue oak (T.bias, the direction of the road) leans its
// vaults over the road and keeps its sweeping limbs off it.
B[5]=B[14]=B[26]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,coast=T.sp!==5,bias=T.bias;
 const hc=rr(3.5,6)*(coast?.75:1),bo=bole(fam,T,S,hc,rb,.7,1.4,ri(4,6),lv===2?12:8,3.4,bias==null?rr(0,.06):0);st.trunk+=bo.tris;
 const nL=lv===2?ri(6,9):ri(4,6),a0=bias==null?rr(0,TAU):bias,spots=[],all=[],hk=H/26;
 for(let k=0;k<nL;k++){const r=rng(),kind=r<(coast?.5:.6)?'vault':r<(coast?.68:.84)?'sweep':'up';
  let a=a0+k*GOLD+rr(-.25,.25);
  if(bias!=null){if(kind==='vault'&&rng()<.6)a=bias+rr(-.75,.75);if(kind==='sweep')a=bias+Math.PI+rr(-1.2,1.2);}
  const r0=rb*rr(.42,.58),o={x:bo.top.x+Math.cos(a)*rb*.45,y:T.y0+hc*rr(.75,1),z:bo.top.z+Math.sin(a)*rb*.45},n=lv===2?10:6;let pts;
  // an avenue oak keeps its vault tips high (the tunnel stays open to a rider); a wild one lets them come down
  if(kind==='vault')pts=archPts(o,a,T.crownR*rr(.8,1.05),rr(8,12.5)*hk*(coast?.75:1),rr(.38,.55),bias!=null?rr(5,9):rr(-2.5,3),r0,.14,n,.09);
  else if(kind==='sweep'){const rise=rng()<S.touch*1.6?rr(.25,.45):rr(0,.1);pts=limbPts(o,a,rr(.15,.35),T.crownR*rr(.7,.95),r0,.14,n,-rr(.7,1.0),.09,rise);}
  else pts=limbPts(o,a,rr(1.0,1.25),T.crownR*rr(.4,.55),r0*.8,.14,Math.max(4,n-3),-rr(.05,.15),.08,0);
  if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?(r0>.9?8:6):5,cap:true});all.push(...pts);st.limbs++;
  // secondaries out and a little up off the limb, twigs off those: the crown sits on them
  for(let i=2;i<pts.length;i+=lv===2?1:2){const p=pts[i],t=i/(pts.length-1),ad=limbDir(pts,i)+(rng()<.5?-1:1)*rr(.5,1.3),len2=Math.min(9,T.crownR*rr(.13,.22)*(1.2-t*.4));
   const sp=limbPts({x:p.x,y:p.y+p.r*.4,z:p.z},ad,rr(-.05,.55),len2,Math.max(.1,p.r*.55),.06,3,-.3,.14,.08);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});
   spots.push(sp[1],sp[2],sp[3]);if(lv===2&&i%2)twigs(fam,S,sp[3],ad,2,len2*.4,.05,.8,st,spots);
   if(lv>=1&&i%2)mossAt(sp[2],S.moss*.7,T.wet,st,coast?3:7);}
  for(let i=3;i<pts.length;i+=2){spots.push(pts[i]);if(lv>=1)mossAt(pts[i],S.moss*.6,T.wet,st,coast?3:8);}
  if(lv===2&&!coast){for(let i=2;i<pts.length;i+=3){BIO.put('frond',[pts[i].x,pts[i].y+pts[i].r*.8,pts[i].z],qEuler(rr(.1,.4),rr(0,TAU),0),[rr(.8,1.5),.8,1],leafCol(PAL.fern,1.5));}}}   // resurrection fern and bromeliads on the limbs
 // leaders carry the top of the crown to H
 for(let k=0;k<(lv===2?2:1);k++){const L=leader(fam,S,T,{x:bo.top.x,y:T.y0+hc,z:bo.top.z},T.y0+H-2.5,rb*.4,st,all);if(L){spots.push(L[2],L[3],L[4]);if(lv===2)twigs(fam,S,L[4],rr(0,TAU),3,4,-.1,.5,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.35,sz0=coast?rr(6,8):rr(7,9.5);
 if(!crownOn('oakleaf',spots,sz0,.58,()=>crownCol(S,.015),T,cy,ex,ey,lv===2?1.3:.8,st)){clumpAt('oakleaf',bo.top.x,T.y0+hc+2,bo.top.z,sz0,.55,crownCol(S),T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2&&!coast&&T.wet>.6&&rng()<.6){const a=rr(0,TAU);staghorn(T.x,T.y0+hc*.7,T.z,a,bo.rAt(.7),rr(1.2,2),st);}
 T.spread=spread(T,all);reg(T,S);};
// 6 the PILLAR FIG: a fused, fluted bole, level limbs, and roots dropping from the
// limbs to the ground to become new trunks -- one tree that is a grove
B[6]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.3,.42),bo=bole(fam,T,S,hc,rb,1.1,2.2,ri(6,9),lv===2?14:9,3.6,0);st.trunk+=bo.tris;
 const nL=lv===2?ri(7,10):ri(5,6),a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),el=rr(.05,.32),len=T.crownR*rr(.7,1.0),r0=rb*rr(.35,.5);
  const o={x:T.x+Math.cos(a)*rb*.5,y:T.y0+hc*rr(.75,1),z:T.z+Math.sin(a)*rb*.5},pts=limbPts(o,a,el,len,r0,.14,lv===2?9:6,-rr(.1,.3),.1,rr(.05,.2));
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);st.limbs++;
  for(let i=2;i<pts.length;i++){const p=pts[i],t=i/(pts.length-1);
   // the pillars: some thick, most thin, all straight down to the ground
   if(lv>=1&&t>.3&&rng()<(lv===2?.55:.3)){const gy=Y(p.x,p.z);if(p.y-gy>2&&BIO.clearOf(p.x,p.z,.5)){
    if(rng()<.35){const rr0=rr(.25,.8)*(1-t*.4);const col=barkC(S);st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:rr0*.7},{x:p.x+rr(-.2,.2),y:mix(p.y,gy,.5),z:p.z+rr(-.2,.2),r:rr0},{x:p.x,y:gy-.4,z:p.z,r:rr0*1.35}],col,{seg:lv===2?7:5});st.pillars++;}
    else{for(let j=0,m=ri(1,3);j<m;j++){const ox=rr(-.6,.6),oz=rr(-.6,.6);BIO.beam('rod',[p.x+ox,p.y,p.z+oz],[p.x+ox,gy-.2,p.z+oz],rr(.05,.14),null,rodCol(pick(S.bark)));}st.roots++;}}}
   if(lv===2&&rng()<.3)BIO.put('strand',[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[rr(.2,.5),rr(2,6),1],rodCol(0x8a7a5a));
   // secondaries up into the dome
   if(i%2===0){const ad=limbDir(pts,i)+rr(-1,1),len2=len*rr(.2,.35),sp=limbPts({x:p.x,y:p.y,z:p.z},ad,rr(.5,1.1),len2,Math.max(.1,p.r*.55),.06,3,-.08,.1,0);
    if(okPts(sp)){st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],ad,2,len2*.4,.1,.9,st,spots);}}
   else spots.push(p);}}
 for(let k=0;k<(lv===2?3:1);k++){const L=leader(fam,S,T,{x:T.x+rr(-1,1),y:T.y0+hc,z:T.z+rr(-1,1)},T.y0+H-2.5,rb*.35,st,all);if(L){spots.push(L[2],L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),lv===2?4:2,T.crownR*.22,-.1,.4,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.3,sz0=rr(7.5,10),dens=lv===2?1.7:1;
 crownOn('glossy',spots,sz0,.6,()=>crownCol(S,.05),T,cy,ex,ey,dens,st);
 if(lv===2){for(let k=0,m=ri(1,3);k<m;k++)staghorn(T.x,T.y0+rr(3,hc*.9),T.z,rr(0,TAU),bo.rAt(.5),rr(1.2,2.2),st);}
 T.spread=spread(T,all);reg(T,S);};
// 2 the PARASOL KAPOK: a pale plank-buttressed column, spines, and at two thirds of its
// height a flat parasol of level boughs in two tiers, bromeliads along them
B[2]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.58,.66),bo=bole(fam,T,S,hc,rb,1.6,5.5,ri(4,6),lv===2?14:9,5,0);st.trunk+=bo.tris;
 if(lv===2){for(let k=0,m=ri(14,26);k<m;k++){const u=rr(.05,.6),a=rr(0,TAU),R=bo.rAt(u),yy=T.y0+hc*u;BIO.put('cone',[T.x+Math.cos(a)*R*.95,yy,T.z+Math.sin(a)*R*.95],qFacing([Math.cos(a),0,Math.sin(a)]).multiply(qEuler(Math.PI/2,0,0)),[.16,.35,.16],rodCol(pick(S.bark)));}}
 const spots=[],all=[],tiers=[[hc*rr(.95,1),ri(5,7),1],[H*rr(.74,.8),ri(3,5),.62]];
 tiers.forEach((tr,ti)=>{const a0=rr(0,TAU);for(let k=0;k<(lv===2?tr[1]:Math.min(4,tr[1]));k++){const a=a0+k/tr[1]*TAU+rr(-.3,.3),el=rr(.04,.22),len=T.crownR*tr[2]*rr(.75,1),r0=rb*(ti?.28:.38);
  const pts=limbPts({x:T.x+Math.cos(a)*rb*.3,y:T.y0+tr[0],z:T.z+Math.sin(a)*rb*.3},a,el,len,r0,.14,lv===2?7:5,-rr(.02,.12),.06,rr(.05,.15));
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);st.limbs++;
  for(let i=1;i<pts.length;i++){const p=pts[i];spots.push(p);if(lv===2&&i%2)twigs(fam,S,p,a,2,len*.15,.05,.45,st,spots);
   if(i%2===0){const ad=limbDir(pts,i)+rr(-1.2,1.2),len2=len*rr(.2,.32),sp=limbPts({x:p.x,y:p.y,z:p.z},ad,rr(.15,.45),len2,Math.max(.1,p.r*.5),.06,3,-.05,.08,0);
    if(okPts(sp)){st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);}}
   if(lv===2&&rng()<.22)brom(p,st);if(lv>=1)mossAt(p,.35,T.wet,st,5);}}});
 // a leader to the top of the parasol
 const lead=limbPts({x:T.x,y:T.y0+hc,z:T.z},0,Math.PI/2-.05,H-hc,rb*.3,.15,4,0,.03,0);if(okPts(lead)){st.limb+=BIO.tube(fam,lead,barkC(S),{seg:6,cap:true});spots.push(lead[3],lead[4]);twigs(fam,S,lead[4],rr(0,TAU),4,T.crownR*.2,-.05,.3,st,spots);}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.12,sz0=rr(8.5,12),dens=lv===2?1.4:.8;
 crownOn('broad',spots,sz0,.4,()=>crownCol(S),T,cy,ex,ey,dens,st);
 if(lv===2){for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU),u=rr(.2,.9);BIO.put('strand',[T.x+Math.cos(a)*bo.rAt(u),T.y0+hc*u,T.z+Math.sin(a)*bo.rAt(u)],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.25,.5),rr(6,18),1],leafCol(PAL.vine,1.1));}
  for(let k=0,m=ri(1,3);k<m;k++)staghorn(T.x,T.y0+rr(8,hc*.8),T.z,rr(0,TAU),bo.rAt(.3),rr(1.4,2.4),st);}
 T.spread=spread(T,all);reg(T,S);};
// 3 the RIBBON GUM: a tall straight bole striped red over white, three or four
// ascending limbs, an open hanging crown; ribbons of shed bark hanging
B[3]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.45,.58),bo=bole(fam,T,S,hc,rb,.5,2.2,0,lv===2?11:8,6,rr(0,.04));st.trunk+=bo.tris;
 const nL=lv===2?ri(3,4):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.3,.3),len=(H-hc)*rr(.75,1.05),pts=limbPts(bo.top,a,rr(.95,1.25),len,rb*.55,.14,5,-.1,.07,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);
  for(let i=2;i<=5;i++){const p=pts[i],ad=a+rr(-1.2,1.2),len2=len*rr(.25,.4),sp=limbPts(p,ad,rr(.4,.9),len2,Math.max(.1,p.r*.55),.05,3,-.12,.1,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],ad,2,len2*.35,-.3,.4,st,spots);}
  if(lv===2)for(let j=0;j<ri(1,3);j++){const p=pts[ri(0,3)];BIO.put('strand',[p.x+rr(-.3,.3),p.y,p.z+rr(-.3,.3)],qEuler(0,rr(0,TAU),0),[rr(.3,.6),rr(2,5),1],shade(C(pick(S.bark)),-.2));}}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.2,sz0=rr(5,7);
 crownOn('lance',spots,sz0,.8,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 1 the KNEE-CYPRESS: a flaring, fluted foot (standing in the water as often as not),
// a flat-topped crown of feathery sprays, beards of moss, knees round the base
B[1]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.62,.78),bo=bole(fam,T,S,hc,rb,1.8,2.4,ri(5,8),lv===2?12:8,5,0);st.trunk+=bo.tris;
 const nL=lv===2?ri(6,9):ri(4,5),a0=rr(0,TAU),spots=[],all=[],beards=[];
 for(let k=0;k<nL;k++){const u=mix(.72,.98,(k+rr(0,.9))/nL),a=a0+k*GOLD+rr(-.3,.3),el=rr(-.02,.3),len=T.crownR*rr(.6,1.0)*(1.1-u*.3),r0=clamp(bo.rAt(u)*.4,.2,1);
  const pts=limbPts({x:T.x+Math.cos(a)*bo.rAt(u)*.6,y:T.y0+hc*u,z:T.z+Math.sin(a)*bo.rAt(u)*.6},a,el,len,r0,.1,4,-.15,.08,.05);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let s=1;s<=4;s++){spots.push(pts[s]);if(lv===2&&s>1)twigs(fam,S,pts[s],a,2,len*.2,-.1,.35,st,spots);if(s>1)beards.push(pts[s]);}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.95,bo.rAt(1)*.7,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.25,-.1,.2,st,spots);}}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.15,sz0=rr(5,7);
 crownOn('feather',spots,sz0,.42,()=>crownCol(S),T,cy,ex,ey,lv===2?1.5:.7,st);
 if(lv>=1)beards.forEach(p=>{if(lv===1&&rng()<.5)return;mossAt(p,1.6,Math.max(T.wet,.9),st,10);});
 if(lv===2){for(let k=0,m=ri(5,12);k<m;k++){const a=rr(0,TAU),d=rb*rr(1.8,5),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z);if(y<-1.8||!BIO.clearOf(x,z,.5))continue;
   const h=rr(.5,1.6)+Math.max(0,-y);BIO.put('cone',[x,y-.25,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*.45,h+.25,h*.45],rodCol(pick(S.bark)));st.knees++;}}
 T.spread=spread(T,all);reg(T,S);};
// 0 the LANTERN MANGROVE: a short lacquer-red trunk on a cage of arching prop roots
// in the brackish shallows, drop roots from the boughs, a wide low dome of glossy leaves
B[0]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,gy=T.y0,base=Math.max(gy,0)+rr(.8,1.8);
 const T2=Object.assign({},T,{y0:base-.2});const hc=H*rr(.3,.42),bo=bole(fam,T2,S,hc,rb,.3,1.2,0,lv===2?8:6,3,rr(0,.06));st.trunk+=bo.tris;
 const nR=lv===2?ri(10,16):6;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.25,.25),R=rr(1.6,4.2)*(rb/.6),gx=T.x+Math.cos(a)*R,gz=T.z+Math.sin(a)*R,gyy=Math.min(Y(gx,gz),base-1),h0=base+rr(.3,2.2);
  const pts=[{x:T.x+Math.cos(a)*rb*.7,y:h0,z:T.z+Math.sin(a)*rb*.7,r:rb*.24},{x:T.x+Math.cos(a)*R*.3,y:h0+rr(.8,1.8),z:T.z+Math.sin(a)*R*.3,r:rb*.2},
   {x:T.x+Math.cos(a)*R*.62,y:h0+rr(.2,1),z:T.z+Math.sin(a)*R*.62,r:rb*.17},{x:T.x+Math.cos(a)*R*.88,y:mix(h0,gyy,.6),z:T.z+Math.sin(a)*R*.88,r:rb*.15},{x:gx,y:gyy-.4,z:gz,r:rb*.14}];
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4});st.roots++;}
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD,len=T.crownR*rr(.6,.95),pts=limbPts(bo.top,a,rr(.3,.7),len,rb*.4,.1,5,-.35,.1,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){spots.push(pts[i]);if(lv===2&&i%2)twigs(fam,S,pts[i],a,2,len*.18,0,.5,st,spots);
   if(lv===2&&rng()<.14){const p=pts[i];BIO.beam('rod',[p.x,p.y,p.z],[p.x+rr(-.2,.2),-.6,p.z+rr(-.2,.2)],rr(.025,.05),null,shade(C(0x5a2a1a),-.2));}}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.35,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.3,-.1,.3,st,spots);}}
 const cy=base+H*.7,ex=T.crownR,ey=H*.25,sz0=rr(4,5.5);
 crownOn('glossy',spots,sz0,.6,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);if(lv===2)reg(T,S);};
// 4 the LACQUER CANE PALM: a clump of slender ringed stems, yellow-green below and
// lipstick red at the crownshaft, each with a few arching pinnate fronds
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,n=lv===2?ri(4,8):2;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,1.6):0,la=a,lk=rr(.02,.12)*(k?1:.3),h=H*(k?rr(.45,1):1),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z)-.2,r=rr(.07,.13);
  const cs=C(pick(S.crownshaft)),lo=vary(C(pick(S.bark)),.02,.08,.06),pts=[];
  for(let i=0;i<=5;i++){const u=i/5;pts.push({x:x+Math.cos(la)*lk*h*u*u,y:y+h*u,z:z+Math.sin(la)*lk*h*u*u,r:r*(1-.25*u),col:u>.8?cs:(u>.62?lo.clone().lerp(cs,.5):lo)});}
  st.limb+=BIO.tube('bk_cane',pts,lo,{seg:5,cap:true});
  const e=pts[5],nf=lv===2?ri(5,7):4,a0=rr(0,TAU),hc=vary(C(pick(S.leaf)),.02,.08,.05);
  for(let f=0;f<nf;f++){const af=a0+f/nf*TAU+rr(-.2,.2);frondAt('palmfrond',e.x,e.y,e.z,af,T.crownR*rr(.8,1.1),rr(-.95,-.25),bright(hc,1.4),1.1);}
  st.fronds+=nf;}};
// 7 the VEIL WILLOW: a short leaning bole, limbs rising and arching over, and a curtain
// of hanging strands from every limb almost to the ground (golden twigs among the green)
B[7]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.25,.35),bo=bole(fam,T,S,hc,rb,.6,1.2,ri(3,5),lv===2?10:7,3,rr(.05,.2));st.trunk+=bo.tris;
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),len=T.crownR*rr(.8,1.15),pts=limbPts(bo.top,a,rr(.75,1.1),len,rb*.45,.08,6,-rr(.6,.9),.08,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  const nv=lv===2?ri(16,24):7;
  for(let v=0;v<nv;v++){const i=ri(2,pts.length-1),p=pts[i],px=p.x+rr(-1.8,1.8),pz=p.z+rr(-1.8,1.8),gy=Y(px,pz),L=Math.max(1.5,(p.y-gy)*rr(.55,.95));
   const col=rng()<.08?shade(vary(C(pick(S.twig)),.02,.08,.05),-.1):leafCol(S.leaf,1.25);
   BIO.put('veil',[px,p.y+rr(0,1),pz],qEuler(0,rr(0,TAU),0),[rr(.45,.85),L*rr(.7,1),1],col);st.veils++;}
  clumpAt('lance',pts[3].x,pts[3].y+1,pts[3].z,rr(4,6),.7,C(pick(S.leaf)),T.x,T.y0+H*.8,T.z,T.crownR,H*.3);st.clumps++;}
 T.spread=spread(T,all);reg(T,S);};
// 8 / 20 the VASE: several stems from the foot, leaning out and forking (copper
// ringbark: pale-banded, peeling, sometimes in blossom; eyed beech: ringed eyes)
B[8]=B[20]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,ring=T.sp===8,bloom=ring&&rng()<.35;
 const nS=lv===2?ri(3,5):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.3,.3),len=H*rr(.5,.62),o={x:T.x+Math.cos(a)*rb*.4,y:T.y0,z:T.z+Math.sin(a)*rb*.4};
  const pts=limbPts(o,a,Math.PI/2-rr(.2,.45),len,rb*rr(.7,1),rb*.5,5,-.04,.06,0);if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5});all.push(...pts);
  const e=pts[5];for(let f=0;f<(lv===2?3:2);f++){const af=a+rr(-1,1),len2=H*rr(.3,.45),sp=limbPts(e,af,rr(.5,1.1),len2,rb*.45,.07,4,-.12,.1,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:5,cap:true});all.push(...sp);spots.push(sp[2],sp[3],sp[4]);if(lv===2)twigs(fam,S,sp[4],af,2,len2*.3,.1,.8,st,spots);}
  if(lv===2&&ring)for(let j=0;j<ri(2,4);j++){const p=pts[ri(0,4)],aa=rr(0,TAU);BIO.put('strand',[p.x+Math.cos(aa)*p.r,p.y,p.z+Math.sin(aa)*p.r],qFacing([Math.cos(aa),0,Math.sin(aa)]),[rr(.2,.45),rr(.4,1.2),1],shade(C(0xb0906a),-.1));}}   // peeling curls
 const cy=T.y0+H*.8,ex=T.crownR,ey=H*.3,sz0=rr(5,7);
 const inBloom=bloom?spots.filter(()=>rng()<.7):[],inLeaf=bloom?spots.filter(p=>inBloom.indexOf(p)<0):spots;
 crownOn('broad',inLeaf,sz0,.65,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);if(bloom)crownOn('blossom',inBloom,sz0,.65,()=>C(pick(PAL.blossom)),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 9 / 11 the BROADLEAF: a leaning bole and sinuous limbs (ghost sycamore: mottled
// white; flayed madrone: red over green-white, cream panicles, red berries)
B[9]=B[11]=B[24]=B[25]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,mad=T.sp===11,sprawl=mad&&rng()<.3;
 const hc=H*(sprawl?rr(.15,.25):rr(.32,.45)),bo=bole(fam,T,S,hc,rb,.5,1.5,0,lv===2?10:7,4,sprawl?rr(.25,.45):rr(.04,.18));st.trunk+=bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.65,1.0)*(sprawl?1.2:1),el=sprawl?rr(.1,.5):rr(.45,.9);
  const pts=limbPts(bo.top,a,el,len,rb*.5,.1,6,-rr(.1,.35),.12,sprawl?rr(.2,.4):.05);if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i+=lv===2?1:2){const p=pts[i],len2=len*rr(.22,.36),sp=limbPts(p,limbDir(pts,i)+rr(-1,1),rr(.3,.9),len2,Math.max(.08,p.r*.55),.05,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],limbDir(pts,i),2,len2*.35,.1,.7,st,spots);}}
 if(!sprawl){const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.4,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.25,-.1,.4,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.3,sz0=mad?rr(5.5,7):rr(6.5,8.5),item=(mad||T.sp===24)?'glossy':'broad';
 crownOn(item,spots,sz0,.62,()=>crownCol(S,mad?.06:0),T,cy,ex,ey,lv===2?1.6:1,st);
 // the madrone's cream panicles and red berries, at the branch tips
 if(mad&&lv===2)spots.forEach(p=>{if(rng()>.22)return;const fl=rng()<.55,col=C(pick(fl?PAL.cream:PAL.berry));for(let j=0;j<ri(4,8);j++)BIO.put('bloom',[p.x+rr(-1,1)*sz0*.35,p.y+sz0*rr(.25,.5),p.z+rr(-1,1)*sz0*.35],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),fl?rr(.3,.5):rr(.15,.25),col);st.blooms++;});
 T.spread=spread(T,all);reg(T,S);};
// 10 the EMBER MANZANITA: a knot of crooked stems, smooth blood-red and charred
// black, small grey-green leaves, urn flowers and red berries
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,n=lv===2?ri(4,7):2,spots=[],a0=rr(0,TAU),seg=lv===2?4:3,all=[];
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.4,.4),len=H*rr(.55,.85),dead=rng()<.12,col=dead?C(0x2a2420):barkC(S);
  const pts=limbPts({x:T.x+rr(-.3,.3),y:T.y0+.1,z:T.z+rr(-.3,.3)},a,rr(.8,1.35),len,rb*rr(.7,1),rb*.35,4,-.12,.16,.05);
  st.limb+=BIO.tube('bk_ember',pts,col,{seg,cap:true});all.push(...pts);
  const e=pts[4];for(let f=0;f<(lv===2?2:0);f++){const len2=len*rr(.35,.55),sp=limbPts(pts[ri(2,3)],a+rr(-1.2,1.2),rr(.5,1.1),len2,rb*.35,.03,3,-.15,.18,0);
   st.limb+=BIO.tube('bk_ember',sp,col,{seg:3});if(!dead)spots.push(sp[3]);}
  if(!dead)spots.push(e);}
 const hc=C(pick(S.leaf)),sz0=T.crownR*rr(.7,.95);
 spots.push({x:T.x,y:T.y0+H*.6,z:T.z});
 spots.forEach(p=>{clumpAt('manz',p.x,p.y+sz0*.1,p.z,sz0*rr(.8,1.15),.75,hc,T.x,T.y0+H*.7,T.z,T.crownR,H*.4);st.clumps++;
  if(lv===2&&rng()<.3){const fl=rng()<.5,col=C(fl?0xf4dce0:pick(PAL.berry));for(let j=0;j<ri(3,6);j++)BIO.put('bloom',[p.x+rr(-.6,.6),p.y+rr(-.2,.4),p.z+rr(-.6,.6)],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.1,.2),col);}});
 T.spread=spread(T,all)+T.crownR*.3;if(lv===2&&rng()<.5)reg(T,S);};
// 12 the CORK OAK: thick grey cork, gnarled limbs, a dense dark rounded crown. Only a
// HARVESTED tree (T.stripped: a grove the host asked for) has its lower bole stripped
// to raw red-orange; a wild cork oak keeps its cork.
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,stripped=!!T.stripped;
 const hs=stripped?rr(1.8,3.2):0,hc=rr(3,5);let tris=0;
 if(stripped){const SS=Object.assign({},S,{bark:S.stripped});tris+=bole('bk_lacquer',T,SS,hs,rb,.3,1,0,lv===2?11:8,2.5,0).tris;}
 const T2=Object.assign({},T,{y0:T.y0+hs}),bo=bole('bk_cork',T2,S,hc-hs+.5,rb*1.18,stripped?.05:.3,1,ri(3,5),lv===2?11:8,2.2,0);st.trunk+=tris+bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.6,.95),pts=limbPts(bo.top,a,rr(.3,.75),len,rb*.55,.1,5,-.25,.14,.08);
  if(!okPts(pts))continue;st.limb+=BIO.tube('bk_cork',pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){const p=pts[i],len2=len*rr(.25,.4),sp=limbPts(p,limbDir(pts,i)+rr(-1,1),rr(.4,1),len2,Math.max(.08,p.r*.55),.05,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube('bk_cork',sp,barkC(S),{seg:4});spots.push(sp[2],sp[3],p);if(lv===2)twigs('bk_cork',S,sp[3],limbDir(pts,i),2,len2*.4,.1,.8,st,spots);}}
 {const L=leader('bk_cork',S,T,bo.top,T.y0+H*.9,rb*.45,st,all);if(L){spots.push(L[3],L[4]);twigs('bk_cork',S,L[4],rr(0,TAU),3,T.crownR*.3,-.1,.4,st,spots);}}
 const cy=T.y0+H*.7,ex=T.crownR,ey=H*.35,sz0=rr(5.5,7.5);
 crownOn('oakleaf',spots,sz0,.7,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 13 the SKIRT PALM: short and stout, a skirt of dead leaves, and a head of wide
// fan leaves arching out and hanging (a quarter of them the silver-blue kind)
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12),blue=rng()<.25;
 const pts=[];for(let i=0;i<=4;i++){const u=i/4;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*(1+.35*Math.exp(-u*6))*(1-.12*u)});}
 st.trunk+=BIO.tube('bk_fibre',pts,barkC(S),{seg:lv===2?9:6});
 const e=pts[4],set=blue?PAL.palm.slice(4):PAL.palm.slice(0,4),hc=vary(C(pick(set)),.02,.06,.05);
 // the skirt
 for(let k=0,m=lv===2?ri(14,24):8;k<m;k++){const a=rr(0,TAU),L=H*rr(.25,.6);BIO.put('ribbon',[e.x+Math.cos(a)*rb*1.05,e.y-.2,e.z+Math.sin(a)*rb*1.05],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1,1.8),L,1],bright(vary(C(0x9a8462),.02,.08,.08),1.1));}
 // the leaves: two tiers of drooping fans, a few upright spears in the middle
 const nf=lv===2?ri(16,24):10,a0=rr(0,TAU);
 for(let k=0;k<nf;k++){const a=a0+k*GOLD,up=k%2===0,L=T.crownR*rr(.85,1.15),yaw=Math.atan2(Math.cos(a),Math.sin(a));
  BIO.put('droop',[e.x,e.y+(up?.3:-.1),e.z],qEuler(up?rr(-.55,-.15):rr(.05,.45),yaw,rr(-.1,.1)),[L*.95,L*.8,L],bright(vary(hc,.02,.05,.05),1.4));}
 for(let k=0;k<(lv===2?4:2);k++){const a=rr(0,TAU);BIO.put('fan',[e.x,e.y+.2,e.z],qEuler(rr(-.3,-.05),Math.atan2(Math.cos(a),Math.sin(a)),0),[T.crownR*.5,T.crownR*.6,1],bright(shade(hc,.1),1.4));}
 if(lv===2&&rng()<.35)for(let k=0;k<ri(2,4);k++){const a=rr(0,TAU);BIO.put('strand',[e.x+Math.cos(a)*1.2,e.y,e.z+Math.sin(a)*1.2],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.3,.6),rr(2,3.5),1],C(pick(PAL.cream)));}
 st.fronds+=nf;};
// 15 the POMPOM CYCAD: a shaggy trunk forking into a few arms, a stiff frond crown on
// each, and over each crown a red pompom on a stalk
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,hf=H*rr(.3,.5);
 const trunk=[{x:T.x,y:T.y0-.2,z:T.z,r:rb*1.3},{x:T.x,y:T.y0+hf*.5,z:T.z,r:rb},{x:T.x,y:T.y0+hf,z:T.z,r:rb*.9}];
 st.trunk+=BIO.tube('bk_fibre',trunk,barkC(S),{seg:lv===2?8:6});
 const n=ri(2,4),a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),arm=limbPts(trunk[2],a,rr(.8,1.2),(H-hf)*rr(.8,1.1),rb*.7,rb*.55,4,-.05,.06,.15);
  st.limb+=BIO.tube('bk_fibre',arm,barkC(S),{seg:6,cap:true});const e=arm[4],hc=vary(C(pick(S.leaf)),.02,.08,.05),nf=lv===2?ri(10,16):7,f0=rr(0,TAU);
  for(let f=0;f<nf;f++)frondAt('palmfrond',e.x,e.y,e.z,f0+f/nf*TAU+rr(-.2,.2),T.crownR*rr(.8,1.1),rr(-.9,-.1),bright(hc,1.35),.8);
  const sh=rr(1,2.2);BIO.beam('rod',[e.x,e.y,e.z],[e.x,e.y+sh,e.z],.05,.04,rodCol(0x5a6a3a));
  BIO.put('pompom',[e.x,e.y+sh+.35,e.z],qEuler(0,rr(0,TAU),0),[rr(.4,.6),rr(.45,.7),rr(.4,.6)],bright(C(pick(S.bloom)),.8));
  if(lv===2)for(let j=0;j<ri(3,6);j++){const aa=rr(0,TAU);BIO.put('ribbon',[e.x+Math.cos(aa)*rb*.6,e.y-.3,e.z+Math.sin(aa)*rb*.6],qFacing([Math.cos(aa),0,Math.sin(aa)]),[rr(.6,1),rr(1,2.5),1],bright(C(0x8a7458),1.05));}
  st.fronds+=nf;}};
// 16 / 18 the TIERED tree: a column carrying level limbs in tiers, each limb bearing flat
// pads, the lowest tiers widest (tier cedar: blue-green needles; crimson ghost: cream
// bark cracked with gold, pads of crimson leaves)
B[16]=B[18]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,crim=T.sp===18;
 const bo=bole(fam,T,S,H*.88,rb,.5,1.6,crim?0:ri(3,5),lv===2?10:7,4,rr(0,.05));st.trunk+=bo.tris;
 const nT=ri(S.tiers[0],S.tiers[1]),all=[],hc=C(pick(S.leaf));
 for(let t=0;t<nT;t++){const f=t/(nT-1||1),yy=T.y0+H*mix(crim?.35:.28,.9,f),nL=lv===2?ri(3,5):3,a0=rr(0,TAU);
  for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.4,.4),len=T.crownR*mix(1,.4,Math.pow(f,1.2))*rr(.7,1),pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(-.02,.18),len,rb*mix(.45,.25,f),.08,4,-.06,.08,.1);
   if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4,cap:true});all.push(...pts);
   for(let i=1;i<pts.length;i++){const p=pts[i],sz=Math.max(4,len*rr(.38,.55))*(crim?1.15:1);if(!clear3(p.x,p.y+1,p.z,sz*.5,sz*.2))continue;
    for(let c=0;c<(lv===2?3:1);c++)clumpAt(S.item,p.x+rr(-1,1)*sz*.3,p.y+sz*rr(.05,.2),p.z+rr(-1,1)*sz*.3,sz*rr(.85,1.15),crim?.32:.26,crim?C(pick(S.leaf)):hc,T.x,p.y-1,T.z,T.crownR,H*.15);st.clumps+=lv===2?2:1;}}}
 clumpAt(S.item,bo.top.x,T.y0+H*.95,bo.top.z,T.crownR*.3,.35,hc,T.x,T.y0+H*.8,T.z,T.crownR,H*.2);st.clumps++;
 T.spread=spread(T,all);reg(T,S);};
// 17 the FLATWOOD PINE: a tall straight red-plated pole, a few stubs, a small crown of needle pads
B[17]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.92,rb,.25,1.2,0,lv===2?7:5,4,rr(0,.02));st.trunk+=bo.tris;
 const n=lv===2?ri(5,7):3,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*GOLD,yy=T.y0+H*rr(.68,.9),len=T.crownR*rr(.6,1),pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(.1,.5),len,rb*.25,.06,3,-.1,.1,.2);
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:4,cap:true});
  for(let i=1;i<=3;i++)clumpAt('needle',pts[i].x,pts[i].y+.6,pts[i].z,rr(3.4,4.6),.6,C(pick(S.leaf)),T.x,T.y0+H*.9,T.z,T.crownR,H*.12);st.clumps+=2;}
 clumpAt('needle',bo.top.x,T.y0+H*.93,bo.top.z,rr(3,4),.8,C(pick(S.leaf)),T.x,T.y0+H*.9,T.z,T.crownR,H*.12);st.clumps++;
 if(lv===2)for(let k=0;k<ri(2,5);k++){const a=rr(0,TAU),yy=T.y0+H*rr(.3,.6);BIO.beam('rod',[T.x+bo.lx*(yy-T.y0),yy,T.z+bo.lz*(yy-T.y0)],[T.x+Math.cos(a)*rr(1,2.2),yy+rr(-.2,.4),T.z+Math.sin(a)*rr(1,2.2)],.07,.03,C(0x3a3430));}
 T.spread=T.crownR;if(lv===2)reg(T,S);};
// 19 the RATTLE-POD: a short trunk, rising limbs spread into a wide flat top of feathery
// leaves, clusters of long red pods hanging under it
B[19]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.35,rb,.4,1,0,lv===2?9:6,3,rr(.02,.12));st.trunk+=bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.75,1.05),pts=limbPts(bo.top,a,rr(.5,.85),len,rb*.5,.08,5,-.3,.08,.05);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){spots.push(pts[i]);if(lv===2)twigs(fam,S,pts[i],a,1,len*.2,.3,1,st,spots);}}
 const cy=T.y0+H*.9,sz0=rr(4.5,6),hc=C(pick(S.leaf));
 crownOn('feather',spots,sz0,.3,()=>hc,T,cy,T.crownR,H*.15,lv===2?1.5:1,st);
 spots.forEach(p=>{
  if(lv>=1&&rng()<.45){const pc=C(pick(S.pod));for(let j=0,m=ri(3,7);j<m;j++){const L=rr(.9,1.6);BIO.put('pod',[p.x+rr(-.8,.8),p.y-.2,p.z+rr(-.8,.8)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[L*.5,L,L*.5],bright(vary(pc,.02,.08,.06),.9));st.pods++;}}});
 T.spread=spread(T,all);reg(T,S);};

// 21 / 22 the FLOWERING PARASOL (flame parasol: scarlet; violet jacaranda: lilac): a
// short bole, limbs spreading out and low into a very wide flat dome of fine leaves,
// and the flowers where a flowering tree has them -- over the top of the crown, at the
// branch ends. The flame parasol hangs long dark pods under it.
B[21]=B[22]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,flame=T.sp===21;
 const hc=H*rr(.25,.35),bo=bole(fam,T,S,hc,rb,.6,1.2,flame?ri(3,5):0,lv===2?10:7,3,rr(.02,.1));st.trunk+=bo.tris;
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),pts=archPts({x:bo.top.x+Math.cos(a)*rb*.4,y:T.y0+hc,z:bo.top.z+Math.sin(a)*rb*.4},a,T.crownR*rr(.8,1),(H-hc)*rr(.55,.8),rr(.45,.6),(H-hc)*rr(.2,.45),rb*.5,.08,lv===2?7:5,.1);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){const p=pts[i],sp=limbPts(p,limbDir(pts,i)+rr(-1.2,1.2),rr(.3,.9),T.crownR*rr(.15,.25),Math.max(.07,p.r*.55),.04,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],a,2,2.5,.2,.9,st,spots);}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.4,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),4,T.crownR*.25,0,.4,st,spots);}}
 // the flowers take the TOP of the crown: the highest share of the branch ends
 const ys=spots.map(p=>p.y).sort((a,b)=>a-b),cut=ys[Math.floor(ys.length*(1-S.bloomK))]||1e9;
 const inBloom=spots.filter(p=>p.y>=cut&&rng()<.85),inLeaf=spots.filter(p=>inBloom.indexOf(p)<0);
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.18,sz0=rr(5,6.5);
 crownOn('feather',spots,sz0,.32,()=>C(pick(S.leaf)),T,cy,ex,ey,lv===2?1.2:.8,st);
 crownOn('blossom',inBloom,sz0*.85,.3,()=>vary(C(pick(S.flower)),.01,.05,.04),T,cy,ex,ey,lv===2?1.3:.9,st);st.blooms+=inBloom.length;
 if(flame&&lv===2)inLeaf.forEach(p=>{if(rng()>.25)return;for(let j=0,m=ri(3,6);j<m;j++){const L=rr(1.2,2);BIO.put('pod',[p.x+rr(-.8,.8),p.y-.2,p.z+rr(-.8,.8)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[L*.35,L,L*.35],C(pick(S.pod)));st.pods++;}});
 T.spread=spread(T,all);reg(T,S);};
// 23 the LANTERN MAGNOLIA: a straight grey column, short limbs up its length into a
// broad dome of big glossy leaves, and at the branch ends big cream-white flowers
// held upright like lanterns
B[23]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.8,rb,.4,1.4,0,lv===2?10:7,4,rr(0,.04));st.trunk+=bo.tris;
 const spots=[],all=[],nT=lv===2?ri(9,13):6;
 for(let k=0;k<nT;k++){const u=mix(.25,.85,k/(nT-1)),yy=T.y0+H*.8*u,a=k*GOLD+rr(-.3,.3),len=T.crownR*mix(1,.45,u)*rr(.75,1.05);
  const pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(.25,.7),len,rb*mix(.4,.22,u),.07,4,-.15,.1,.15);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4,cap:true});all.push(...pts);spots.push(pts[2],pts[3],pts[4]);
  if(lv===2)twigs(fam,S,pts[4],a,2,len*.25,.2,.9,st,spots);}
 spots.push(bo.top);
 crownOn('glossy',spots,rr(4.5,6),.65,()=>C(pick(S.leaf)),T,T.y0+H*.6,T.crownR,H*.4,lv===2?1.4:.9,st);
 // flowers at the branch ends, on the OUTSIDE of the dome where they are seen, cupped and facing up
 // each flower on its own twig, grown from the branch end outward and up to where it shows
 if(lv>=1)spots.forEach(p=>{if(rng()>(lv===2?.6:.3))return;const s=rr(.5,.8),dx=p.x-T.x,dz=p.z-T.z,dl=Math.hypot(dx,dz)||1,o=rr(2,3),tip={x:p.x+dx/dl*o,y:p.y+rr(1.2,2.2),z:p.z+dz/dl*o,r:.035};
  st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:Math.max(.05,(p.r||.1)*.6)},{x:mix(p.x,tip.x,.6),y:mix(p.y,tip.y,.45),z:mix(p.z,tip.z,.6),r:.05},tip],barkC(S),{seg:3});
  BIO.put('bloom',[tip.x,tip.y+s*.15,tip.z],qEuler(rr(-.35,.35)+Math.PI/2*.85,rr(0,TAU),rr(-.3,.3)),[s,s,s],bright(C(pick(S.flower)),1.05));st.blooms++;});
 T.spread=spread(T,all);reg(T,S);};

// ---------------------------------------------------------------- impostors (the far canopy)
// Blobs in the 'far' bucket. The wide species get flattened, overlapping blobs out
// to their real width, so the silhouette from the hills reads WIDE too.
let ICO=null;
function buildFar(T,fi,st){const K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const S=SP[T.sp],cheap=BIO.lodD(T.x,T.z)>2200;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=cheap?4:6,shape={5:'wide',14:'wide',26:'wide',24:'wide',6:'wide',2:'parasol',1:'flat',16:'tier',18:'tier',17:'pine',19:'flat',7:'weep',21:'flat',22:'flat'}[T.sp]||'round';
 const top=T.y0+T.H*(shape==='wide'?.25:shape==='pine'?.9:.6),rings=[];
 [0,.06,.5,1].forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.4,T.rb*(1-.5*u)*(u<.08?1.5:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.45*(.7+.3*(r2/rings.length));
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=(S.flower&&T.sp!==23?S.flower:S.leaf).map(h=>bright(h,.85)),R=T.crownR,H=T.H,a0=(T.seed%628)/100,n=L.length;
 if(shape==='wide'){const m=cheap?3:5;blob(T.x,T.y0+H*.75,T.z,R*.55,H*.22,L[fi%n],L[(fi+2)%n],fi);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU;blob(T.x+Math.cos(a)*R*.58,T.y0+H*mix(.5,.68,(k*7%5)/5),T.z+Math.sin(a)*R*.58,R*.42,H*.18,L[(k+fi)%n],L[(k+1)%n],fi+k);}}
 else if(shape==='parasol'){blob(T.x,T.y0+H*.85,T.z,R*.85,H*.09,L[fi%n],L[(fi+1)%n],fi);if(!cheap)blob(T.x,T.y0+H*.72,T.z,R*.55,H*.07,L[1%n],L[2%n],fi+3);}
 else if(shape==='tier'){for(let k=0;k<(cheap?2:3);k++)blob(T.x,T.y0+H*mix(.4,.88,k/2),T.z,R*mix(.9,.4,k/2),H*.06,L[(k+fi)%n],L[(k+1)%n],fi+k);}
 else if(shape==='pine'){blob(T.x,T.y0+H*.92,T.z,R*.8,H*.1,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='flat'){blob(T.x,T.y0+H*.86,T.z,R*.9,H*.12,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='weep'){blob(T.x,T.y0+H*.55,T.z,R*.85,H*.42,L[fi%n],L[(fi+1)%n],fi);}
 else{blob(T.x,T.y0+H*.72,T.z,R*.85,H*.25,L[fi%n],L[(fi+2)%n],fi);}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// the SMALL species far off: one 20-triangle blob in the leaf colour, so the chaparral
// and the palm groves still read at range instead of stopping at the band edge
let ICO0=null;
function buildFarSmall(T,st){const K=BIO.bucket('far');if(!ICO0)ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;const S=SP[T.sp],ip=ICO0;
 const ca=bright(C(pick(S.leaf)),.85).convertSRGBToLinear(),cb=ca.clone().multiplyScalar(.55),R=T.crownR*.85,H=T.H,cy=T.y0+H*.62;
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],t=smooth(-.5,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
  K.pos.push(T.x+dx*R,cy+dy*Math.max(R*.6,H*.38),T.z+dz*R);K.nor.push(dx/nl,ny/nl,dz/nl);K.uv.push(0,0);K.col.push(mix(cb.r,ca.r,t),mix(cb.g,ca.g,t),mix(cb.b,ca.b,t));}
 const tris=ip.length/9;K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SWLOW.buildTrees=function(R,q,opt){opt=opt||{};
 reseed(550021);q=q==null?1:q;R=R||2850;means();
 const st={trunk:0,limb:0,far:0,limbs:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,knees:0,veils:0,pillars:0,roots:0,epi:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=SWLOW.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 // one species pass: a jittered grid over the whole disc, the zone weight as
 // acceptance; hero/mid say where it becomes an impostor (far:true) or stops.
 // inWater:[lo,hi] roots it on the bed between those heights, past the mask.
 // DENS: the showcase's overall stocking at q=1, measured against the budget (KNOWN_ISSUES);
 // the sprawl oaks are exempt -- they are what the lowlands are
 const DENS=.75;
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;const pad=opt.pad==null?4:opt.pad;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    return a*(opt.lodK?lerp(1,BIO.lod(x,z),opt.lodK):1)*q*(opt.dens==null?DENS:opt.dens);},
   (x,y,z,d)=>{if(!opt.inWater&&y<.3)return;if(opt.inWater&&(y<opt.inWater[0]||y>opt.inWater[1]))return;
    if(blocked(x,z,pad))return;if(!BIO.clearOf(x,z,pad+2))return;
    const T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);
    if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:(opt.own==null?T.rb*1.5+1:T.crownR*opt.own),rt:T.rb*1.6+.8});n++;},{patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale||.01,noMask:!!opt.inWater,pad:1});
  return n;}
 // AVENUES (allées) first: the host may ask for rows of a species along a path, e.g. a
 // live-oak avenue down a road. {path:[[x,z],...], spacing, offset, species}. Each tree
 // knows the road's direction (T.bias) and arches over it.
 (opt.avenues||[]).forEach(av=>{const P=av.path,sp=SP.findIndex(S=>S.key===(av.species||'sprawloak')),gap=av.spacing||22,off=av.offset||13;let carry=gap*.5;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;let d=carry;
   for(;d<L;d+=gap*rr(.9,1.1))[-1,1].forEach(side=>{const o=off+rr(-.8,1.8),dj=d+rr(-2,2),x=a[0]+ux*dj-uz*side*o,z=a[1]+uz*dj+ux*side*o,y=Y(x,z);
    if(y<.3||!BIO.clearOf(x,z,6)||blocked(x,z,3))return;const T=mk(x,y,z,sp);T.bias=Math.atan2(-side*ux,side*uz);
    const ld=BIO.lodD(x,z);T.lv=ld<1100?2:ld<1700?1:0;TREES.push(T);hadd({x,z,r:T.crownR*.4,rt:T.rb*1.6+.8});st.avenue=(st.avenue||0)+1;});
   carry=d-L;}});
 // GROVES: a planted, harvested stand. {center:[x,z], r, spacing, species, stripped}.
 // Rows on a jittered square grid (a planting, not a wild stand); stripped:true marks the
 // cork oaks as harvested -- the only stripped cork in the biome.
 (opt.groves||[]).forEach(gv=>{const sp=SP.findIndex(S=>S.key===(gv.species||'corkoak')),g=gv.spacing||16,r=gv.r||60,c=gv.center,ang=gv.angle||0,ca=Math.cos(ang),sa=Math.sin(ang);
  for(let i=-Math.ceil(r/g);i<=Math.ceil(r/g);i++)for(let j=-Math.ceil(r/g);j<=Math.ceil(r/g);j++){const u=i*g+rr(-1.5,1.5),v=j*g+rr(-1.5,1.5);if(Math.hypot(u,v)>r)continue;
   const x=c[0]+u*ca-v*sa,z=c[1]+u*sa+v*ca,y=Y(x,z);if(y<.3||BIO.mask(x,z)<=0||!BIO.clearOf(x,z,4)||blocked(x,z,2))continue;
   const T=mk(x,y,z,sp);T.stripped=!!gv.stripped;T.crownR*=.8;const ld=BIO.lodD(x,z);T.lv=ld<1100?2:ld<1700?1:0;TREES.push(T);hadd({x,z,r:g*.45,rt:T.rb*1.6+.8});st.grove=(st.grove||0)+1;}});
 // the giants first: they claim their ground (own: a share of the crown radius is kept clear of other giants)
 pass(2,170,Z=>Z.rain*.55,{hero:1100,mid:1800,far:true,pad:14,own:.55,patch:.2});                          // parasol kapok
 pass(5,105,Z=>Z.sub*(1-Z.pineK)*.56*smooth(.55,.8,Z.wet),{hero:800,mid:1500,far:true,pad:12,own:.5,patch:.3,dens:1}); // sprawl oak
 pass(6,150,Z=>(Z.sub*smooth(.25,.55,Z.tropic)+Z.rain*.25)*.7,{hero:1000,mid:1600,far:true,pad:14,own:.55,patch:.3}); // pillar fig
 pass(14,90,Z=>Z.med*(1-Z.chapK)*.42*smooth(.3,.5,Z.wet+.1),{hero:900,mid:1500,far:true,pad:9,own:.45,patch:.4});   // coast oak
 pass(16,110,Z=>Z.med*smooth(.3,.6,Z.up)*.55,{hero:1000,mid:1700,far:true,pad:10,own:.45,patch:.4});              // tier cedar
 pass(18,210,Z=>(Z.sub*.35+Z.med*.4)*(1-Z.chapK*.5),{hero:1000,mid:1700,far:true,pad:8,own:.4,patch:.2});         // crimson ghost: rare
 // the bayou and the shore
 pass(0,32,Z=>Z.mang*.85,{hero:900,mid:1400,far:true,pad:2,inWater:[-1.7,.3],own:.3,patch:.6});                 // lantern mangrove
 pass(1,52,Z=>Z.swamp*.45+Z.rain*smooth(.9,.97,Z.wet)*.18,{hero:900,mid:1400,far:true,pad:5,inWater:[-1.9,3.5],own:.35,patch:.5}); // knee-cypress
 pass(3,70,Z=>Z.rain*.4+Z.sub*smooth(.3,.6,Z.tropic)*.15,{hero:900,mid:1500,far:true,pad:6,patch:.4});          // ribbon gum
 pass(4,30,Z=>Z.rain*.5+Z.swamp*.25+Z.sub*smooth(.2,.5,Z.tropic)*.12,{hero:700,mid:1100,far:true,pad:1.5,lodK:.5});   // lacquer cane palm
 // the plain
 pass(7,40,Z=>(Z.rip*.7+smooth(.9,.97,Z.wet)*smooth(4,1.5,Z.h)*.3)*(1-Z.med*.7)*(1-Z.rain*.7),{hero:900,mid:1400,far:true,pad:4,own:.35});   // veil willow
 pass(17,34,Z=>Z.sub*Z.pineK*.6,{hero:800,mid:1400,far:true,pad:2,patch:.3});                                    // flatwood pine
 pass(20,80,Z=>Z.sub*.18*smooth(.6,.8,Z.wet),{hero:900,mid:1500,far:true,pad:5,patch:.5});                        // eyed beech
 pass(8,55,Z=>Z.sub*.14+Z.med*.12*smooth(.3,.5,Z.wet),{hero:850,mid:1300,far:true,pad:3,lodK:.5,patch:.5});     // copper ringbark
 // the hills
 pass(9,48,Z=>Z.rip*(Z.med+Z.sub*.4)*.7,{hero:900,mid:1500,far:true,pad:4});                                      // ghost sycamore
 pass(11,60,Z=>Z.med*(1-Z.chapK)*.45*smooth(.28,.45,Z.wet),{hero:900,mid:1500,far:true,pad:4,patch:.5});         // flayed madrone
 pass(12,64,Z=>Z.med*(1-Z.chapK*.7)*.35,{hero:900,mid:1500,far:true,pad:4,patch:.5});                             // cork oak
 pass(19,90,Z=>Z.med*.22*(1-Z.up)+Z.sub*.03,{hero:900,mid:1500,far:true,pad:5,patch:.5});                         // rattle-pod
 pass(13,32,Z=>Z.med*(Z.rip*.7+.05)+Z.sub*.03+Z.beach*.08,{hero:1000,mid:1600,far:true,pad:2.5,lodK:.4,patch:.6});// skirt palm
 pass(24,85,Z=>(Z.sub*smooth(.25,.6,Z.tropic)+Z.rain*.15)*.55,{hero:1000,mid:1700,far:true,pad:6,own:.35,patch:.4});   // sunburn tree
 pass(25,70,Z=>Z.sub*.3*smooth(.6,.8,Z.wet)*(1-Z.pineK),{hero:1000,mid:1700,far:true,pad:5,patch:.4});                 // star gum
 pass(26,70,Z=>Z.med*(1-Z.chapK*.6)*.5*smooth(.28,.5,Z.wet+.08),{hero:1000,mid:1700,far:true,pad:6,own:.35,patch:.4}); // bay laurel
 pass(21,95,Z=>(Z.sub*smooth(.3,.6,Z.tropic)+Z.rain*.12)*.4,{hero:1000,mid:1700,far:true,pad:6,own:.4,patch:.4});   // flame parasol
 pass(22,85,Z=>Z.sub*.1+Z.med*.14*smooth(.3,.5,Z.wet),{hero:1000,mid:1600,far:true,pad:5,own:.35,patch:.45});    // violet jacaranda
 pass(23,75,Z=>Z.sub*.22*smooth(.6,.8,Z.wet)*(1-Z.pineK),{hero:1000,mid:1600,far:true,pad:5,patch:.45});          // lantern magnolia
 pass(15,60,Z=>Z.med*Z.chapK*.28,{hero:800,mid:1200,far:true,pad:2,lodK:.5,patch:.6});                            // pompom cycad
 pass(10,20,Z=>Z.med*Z.chapK*.5,{hero:600,mid:1000,far:true,pad:.8,lodK:.6,patch:.35});                          // ember manzanita
 // build
 const trisS=SP.map(()=>0),cur=()=>{const t=BIO.stats[BIO.cur||'biome'];return t?t.tris:0;};
 const SMALL={4:1,8:1,10:1,13:1,15:1};
 TREES.forEach((T,i)=>{const t0=cur();if(T.lv===0){if(SMALL[T.sp])buildFarSmall(T,st);else buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;trisS[T.sp]+=cur()-t0;});
 return{trees:TREES.length,avenue:st.avenue||0,grove:st.grove||0,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),trisBySpecies:SP.map((S,i)=>S.key+':'+Math.round(trisS[i]/1000)+'k').join(' '),limbs:st.limbs,clumps:st.clumps,moss:st.moss,pillars:st.pillars,veils:st.veils,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
// ONE TREE AT A POINT. A world that plants a garden, a courtyard or a sacred grove asks for a
// species by key at an explicit (x,y,z): no zone, no mask, no LOD (always the hero build).
// opt.scale shrinks a species to a young or clipped specimen (H, rb, crownR all by it).
SWLOW.treeAt=function(species,x,y,z,opt){opt=opt||{};means();const sp=typeof species==='number'?species:SP.findIndex(S=>S.key===species);if(sp<0)return null;
 const S=SP[sp],k=opt.scale==null?1:opt.scale;if(opt.seed!=null)reseed(opt.seed);
 const st={trunk:0,limb:0,far:0,limbs:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,knees:0,veils:0,pillars:0,roots:0,epi:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const T={x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1])*k,rb:rr(S.rb[0],S.rb[1])*k,crownR:rr(S.crownR[0],S.crownR[1])*k,seed:ri(0,999999),wet:opt.wet==null?.6:opt.wet,lv:2};
 if(opt.bias!=null)T.bias=opt.bias;SWLOW.TREES.push(T);hadd({x:x,z:z,r:T.crownR*.4,rt:T.rb*1.6+.8});B[T.sp](T,st,2);return T;};
SWLOW._canopyH=function(x,z){let h=0;for(const T of SWLOW.TREES){if(Math.hypot(x-T.x,z-T.z)<Math.max(40,T.crownR))h=Math.max(h,T.y0+T.H);}return h||10;};
})();
