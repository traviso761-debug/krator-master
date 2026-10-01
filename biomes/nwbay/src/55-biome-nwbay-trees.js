// ================================================================= NORTH-WEST BAY — trees
// The fifteen tree species of the bay (and the mat reed's beds), each with
// its own builder, placed by zone from the host's climate fields (wet / salt /
// upland / flow / karst) and terrainH. The zone weights are computed HERE
// from those fields, never from the host's map: a world that binds the same
// fields gets the same zoning. Beyond the LOD spine the canopy species become
// blob impostors in the 'far' bucket (the hyperjungle's technique); the small
// species thin out with distance and stop. Every count scales with q; the
// core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=NWBAY.SPECIES,PAL=NWBAY.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
NWBAY.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. A plant's aridity tag is honoured by which weight it reads:
// 'semiarid' species read ridge / cinder (the dry ground), 'humid' ones the
// jungle, the shore, the tidal rim and the banks. `karst` is the rock: the
// stack tops (karst > .95) carry the figs, tree ferns and scrub; the rim band
// (.03 .. .9) is a cliff face and nothing roots there (the host's mask is zero
// on it too; the probe checks).
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),karst=BIO.field('karst',x,z),h=Y(x,z),land=smooth(.15,1.2,h),rock=smooth(.03,.5,karst),dry=smooth(.5,.2,wet);
 return{up,wet,salt,flow,karst,h,
  hyper:smooth(.30,.09,up)*smooth(.55,.80,wet)*land*(1-rock),                                   // the tall jungle ringing the bay
  rain:smooth(.08,.26,up)*smooth(.64,.42,up)*smooth(.35,.6,wet)*land*(1-rock),                    // the rainforest on the slope
  ridge:smooth(.42,.62,up)*(1-rock),                                                              // the dry upper slopes toward the Inner Wall
  low:smooth(.36,.1,up)*smooth(.2,.4,wet)*smooth(.78,.55,wet)*land*(1-rock)*smooth(.45,.15,salt),   // the open lowland: the terraces, the valley floor, the jungle's edge
  shore:smooth(2.4,.5,h)*smooth(.14,.03,up)*smooth(.5,.8,wet)*land*(1-rock)*smooth(.25,.08,karst),   // the beach and the delta
  tidal:smooth(.3,.6,salt)*smooth(.45,.7,wet)*smooth(1.4,.3,h)*smooth(-2.2,-1.2,h)*(1-rock),       // the brackish shallows and their rim: lagoons, the delta's mouths
  cinder:(dry*smooth(.08,.35,salt)+.6*smooth(.1,.3,up)*smooth(.25,.5,salt))*land*(1-rock),        // the lava fields (dry ground by the sea) and the headlands
  top:smooth(.85,.97,karst),                                                                      // the stack tops
  bank:smooth(.45,.8,flow)*land*(1-rock)*smooth(.35,.12,up)};}                                    // the river's banks on the lowland and the terrace reach
NWBAY.zones=zones;

// ---------------------------------------------------------------- colour
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[.25,.25,.25];
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
// the sRGB tint that renders `hex` on a texture of linear mean m
function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
 c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:NWBAY.BARKTEX.map(t=>texMean(t)),wood:texMean(NWBAY.WOODTEX),rock:texMean(NWBAY.ROCKTEX)};return MEAN;}
NWBAY.means=means;NWBAY.tint=tint;NWBAY.bright=bright;NWBAY.shade=shade;NWBAY.vary=vary;
const barkCol=(S,k)=>tint(S.bark[k%S.bark.length],means().bark[S.barkK]);
// an untextured rod / lobe in a species' bark colour: the designer's colour, a shade down
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.25);
const rootCol=()=>tint(vary(pick(PAL.root),.02,.06,.05),means().bark[2],.9);
const epiCol=()=>bright(vary(pick(PAL.epi),.02,.10,.06),1.2);
const bloomCol=()=>bright(vary(pick(PAL.bloom),.03,.10,.06),1.15);

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const okPts=(pts,pad)=>{for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+pad,pts[i].r+pad))return false;return true;};

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
NWBAY.blocked=blocked;

// ---------------------------------------------------------------- the karst's edge
// For a tree on a stack top: how far to the rim, which way, and the ground
// level at the foot of the face beyond it (the waterline when the foot is in
// the sea). Read from the karst field alone, so it works on any host.
function karstEdge(x,z){let best=null;
 for(let k=0;k<12;k++){const a=k/12*TAU,ca=Math.cos(a),sa=Math.sin(a);for(let d=3;d<=30;d+=3){if(BIO.field('karst',x+ca*d,z+sa*d)<.5){if(!best||d<best.d)best={d:d,a:a};break;}}}
 if(!best)return null;const ox=Math.cos(best.a),oz=Math.sin(best.a);let foot=null;
 for(let d=best.d+4;d<=best.d+44;d+=4){if(BIO.field('karst',x+ox*d,z+oz*d)<.05){foot=Y(x+ox*d,z+oz*d);break;}}
 if(foot==null)foot=Y(x+ox*(best.d+34),z+oz*(best.d+34));
 return{d:best.d,out:[ox,oz],footY:foot<0?0:foot+.2};}
NWBAY.karstEdge=karstEdge;

// ---------------------------------------------------------------- epiphytes, lianas
// Red and purple, on every bole and bough in proportion to the wet field:
// bromeliad rosettes clinging to the bark (their axis tilted outward), fleshy
// hanging chains with a flower spike under the boughs, blooms in the axils;
// and LIANAS, long woody strands off the boughs where it is wet.
function epiBole(T,rAt,st,lv,k,uLo,uHi){const n=Math.round(rr(1.2,5)*k*smooth(.40,.90,T.wet)*(lv===2?1:.35));
 for(let i=0;i<n;i++){const u=rr(uLo==null?.12:uLo,uHi==null?.78:uHi),a=rr(0,TAU),R=rAt(u)+.05,x=T.x+Math.cos(a)*R,y=T.y0+T.H*u,z=T.z+Math.sin(a)*R,s=rr(.6,1.5);
  BIO.put('epi',[x,y,z],qUp([Math.cos(a)*.85,.55,Math.sin(a)*.85]),[s,s*.8,s],epiCol());st.epi++;
  if(rng()<.5){BIO.put('epihang',[x+Math.cos(a)*.3,y-.2,z+Math.sin(a)*.3],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.9,1.8),rr(2,6),1],bright(vary(pick(rng()<.6?PAL.epiDull:PAL.epi),.02,.1,.06),1.15));st.epi++;}
  if(rng()<.3){const col=bloomCol();for(let b=0,m=ri(2,5);b<m;b++)BIO.put('bloom',[x+rr(-.6,.6),y+rr(-.3,.9),z+rr(-.6,.6)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.25,.5),col);st.blooms++;}}}
function epiBough(p,wet,st,lv,k){if(rng()>k*.85*smooth(.40,.9,wet)*(lv===2?1:.4))return;
 const s=rr(.6,1.4);BIO.put('epi',[p.x+rr(-.4,.4),p.y+(p.r||.3)*.75,p.z+rr(-.4,.4)],qUp([rr(-.25,.25),1,rr(-.25,.25)]),[s,s*.8,s],epiCol());st.epi++;
 if(rng()<.6){BIO.put('epihang',[p.x+rr(-.5,.5),p.y-(p.r||.3)*.6,p.z+rr(-.5,.5)],qEuler(0,rr(0,TAU),0),[rr(1,2),rr(2.5,7),1],bright(vary(pick(rng()<.5?PAL.epiDull:PAL.epi),.02,.1,.06),1.15));st.epi++;}}
// beard moss where it is very wet
function beardsAt(p,wet,k,st){const n=Math.round(rr(0,1.6)*k*smooth(.7,.97,wet));
 for(let i=0;i<n;i++)BIO.put('beard',[p.x+rr(-.8,.8),p.y-(p.r||.3)*.5,p.z+rr(-.8,.8)],qEuler(0,rr(0,TAU),0),[rr(1.2,2.4),rr(2.5,8),1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));}
// lianas: long twisting strands hanging from a bough almost to the ground
function lianasAt(p,wet,st,lv,k){if(lv<2||rng()>k*.6*smooth(.5,.9,wet))return;const L=Math.min(p.y-1.5,rr(8,34));if(L<4)return;
 BIO.put('liana',[p.x+rr(-.5,.5),p.y-(p.r||.3)*.5,p.z+rr(-.5,.5)],qEuler(0,rr(0,TAU),0),[rr(.8,1.6),L,1],bright(vary(pick(PAL.vine),.03,.1,.06),1.1));st.lianas++;}
// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn],c2:c2?bright(c2,ao):null});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,wid){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);frondAt(item,x,y,z,a,Rf*rr(.85,1.1),rr(p0,p1),bright(col,rr(.88,1.1)),wid);}}
// a SPLAYED FAN of wide paddle fronds round an axis direction a, spread across +-half
function fanAt(x,y,z,a,half,n,L,p0,p1,col){for(let k=0;k<n;k++){const t=n>1?k/(n-1):.5,aa=a+(t-.5)*2*half+rr(-.08,.08),pitch=mix(p0,p1,Math.abs(t-.5)*2)+rr(-.1,.1);
  BIO.put('paddle',[x,y,z],qEuler(rr(-.06,.06),-aa,pitch),[L*rr(.85,1.1),L*rr(.9,1.05),L*rr(.8,1.0)],bright(vary(col,.02,.06,.05),rr(.9,1.12)));}}
const reg=(T,S,r)=>{if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:r||T.spread||T.crownR,h:T.H});};

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet} and lv 2 near / 1 mid / 0 far
const B=[];
// 0 the prism gum: a fluted bole in shed strips of six colours, long near-level boughs, iridescent lance-leaf fans
B[0]=function(T,st,lv){const S=SP[T.sp],fam='bark0',H=T.H,rb=T.rb,ti=T.seed%6;
 const rAt=u=>rb*(1-.45*u)*(1+.9*Math.exp(-u*H/6));
 const nl=ri(4,6),lobes=[];for(let k=0;k<nl;k++)lobes.push({a:k/nl*TAU+rr(-.3,.3),amp:rr(.3,.7)});
 const lobeSum=ang=>{let s=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,5);}return s;};
 const band=14,rings=[],vs=9;
 for(let yy=0;yy<H*.9;yy+=(yy<10?2:vs*.5)){const b=yy/band+ti,i=Math.floor(b);
  const col=barkCol(S,i).lerp(C(PAL.moss[ti%3]),smooth(12,1,yy)*.45);   // neutral: the rainbow strips are in the canvas
  rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:col});}
 rings.push({x:T.x,y:T.y0+H*.9+rAt(.9)*.8,z:T.z,r:.05,yy:H*.9+1,col:barkCol(S,1)});   // closed: a dome, never an open pipe
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?14:9,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.8*Math.exp(-R.yy/3)*lobeSum(ang)+.02*Math.sin(5*ang+ph)),(R,ang)=>mix(1,.6+.4*clamp(lobeSum(ang),0,1),Math.exp(-R.yy/3.5)));
 const spots=[],nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU),boughs=[];
 for(let k=0;k<nB;k++){const u=mix(.55,.88,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(.15,.45),len=T.crownR*rr(.7,1.05),r0=clamp(rAt(u)*.45,.4,1.8);
  const o={x:T.x+Math.cos(a)*rAt(u)*.7,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.7},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.2,5,-.13,.06);
  if(!okPts(pts,2))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,(k+ti)%6),{seg:r0>1?7:5,cap:true});boughs.push(pts);
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,.9);epiBough(pts[3],T.wet,st,lv,.6);beardsAt(pts[2],T.wet,.8,st);lianasAt(pts[3],T.wet,st,lv,.7);}
  for(let s=2;s<5;s++){const p=pts[s],a2=a+rr(-1,1),el2=rr(.0,.4),len2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.12,p.r*.6),.08,3,-.1,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,(k+ti+2)%6),{seg:4});
   spots.push({p:sec[2],s:len2*.45},{p:sec[3],s:len2*.4,tip:true});}
  spots.push({p:pts[3],s:len*.2},{p:pts[4],s:len*.22},{p:pts[5],s:len*.26,tip:true});}
 spots.push({p:{x:T.x,y:T.y0+H*.94,z:T.z},s:5,tip:true},{p:{x:T.x,y:T.y0+H*.88,z:T.z},s:6});   // the leader
 const cy=T.y0+H*.84,ex=T.crownR,ey=H*.25,sz0=rr(7,10),nC=lv===2?1.8:1.1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.4,.4)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('prism',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,C(pick(S.leaf2)));st.clumps++;mine++;}});
 if(!mine){clumpAt('prism',T.x,T.y0+H*.9,T.z,sz0,.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,C(pick(S.leaf2)));st.clumps++;}
 let spread=T.crownR;boughs.forEach(pts=>{const e=pts[pts.length-1];spread=Math.max(spread,Math.hypot(e.x-T.x,e.z-T.z)+8);});T.spread=spread;
 epiBole(T,rAt,st,lv,1.4);
 if(lv===2)for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),yy=rr(1,9),R=rAt(yy/H)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2.4),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}
 reg(T,S);};
// 1 the gate baobab: a bottle bole, the crown IS the top -- boughs rising from the shoulder, palmate leaves, hanging pods
B[1]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(u<.55?1+.22*Math.sin(u/.55*Math.PI):mix(1,.22,Math.pow((u-.55)/.45,.9)))*(1+.5*Math.exp(-u*H/8));
 const rings=[],vs=10;for(let yy=0;yy<H*.9;yy+=(yy<8?2:vs*.5))rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/24)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(8,1,yy)*.35)});
 rings.push({x:T.x,y:T.y0+H*.9+rAt(.9)*.7,z:T.z,r:.05,yy:H*.9+1,col:barkCol(S,1)});
 const ph=rr(0,TAU),nl=ri(6,9),lobes=[];for(let k=0;k<nl;k++)lobes.push({a:k/nl*TAU+rr(-.2,.2),amp:rr(.15,.4)});
 const lobeSum=ang=>{let s=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,4);}return s;};
 st.trunk+=BIO.lathe(fam,rings,lv===2?14:9,Math.max(1,Math.round(TAU*rb/5)),vs,(R,ang)=>R.r*(1+.6*Math.exp(-R.yy/4)*lobeSum(ang)+.015*Math.sin(6*ang+R.yy*.08+ph)),null);
 const spots=[],hangs=[],nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU),boughs=[];
 for(let k=0;k<nB;k++){const u=mix(.74,.9,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(.15,.6),len=T.crownR*rr(.6,1.0),r0=clamp(rAt(u)*.4,.4,1.8);
  const o={x:T.x+Math.cos(a)*rAt(u)*.75,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.75},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.18,5,.06,.07);
  if(!okPts(pts,2))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>1?7:5,cap:true});boughs.push(pts);
  for(let s=2;s<5;s++){const p=pts[s],a2=a+rr(-1.1,1.1),el2=rr(.1,.6),len2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.12,p.r*.6),.08,3,.04,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});
   spots.push({p:sec[2],s:len2*.45},{p:sec[3],s:len2*.4,tip:true});if(rng()<.5)hangs.push(sec[1]);}
  spots.push({p:pts[3],s:len*.2},{p:pts[4],s:len*.22},{p:pts[5],s:len*.25,tip:true});if(lv>=1)epiBough(pts[2],T.wet,st,lv,.5);}
 spots.push({p:{x:T.x,y:T.y0+H*.95,z:T.z},s:5,tip:true});
 const cy=T.y0+H*.9,ex=T.crownR,ey=H*.2,sz0=rr(6,9),nC=lv===2?1.5:1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.2,.5)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('palmate',x,y,z,sz0*rr(.85,1.2),.7,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}});
 if(!mine){clumpAt('palmate',T.x,T.y0+H*.93,T.z,sz0,.7,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2)hangs.forEach(h=>{const Lp=rr(4,7);if(!clear3(h.x,h.y-Lp*.5,h.z,2,Lp*.5+1))return;BIO.put('pod',[h.x,h.y-h.r*.6,h.z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),Lp,bright(pick(PAL.pod),rr(.85,1.15)));st.pods++;});
 let spread=T.crownR;boughs.forEach(pts=>{const e=pts[pts.length-1];spread=Math.max(spread,Math.hypot(e.x-T.x,e.z-T.z)+7);});T.spread=spread;
 epiBole(T,rAt,st,lv,.6,.3,.85);
 reg(T,S);};
// 2 the fan-crown: a pale bole, a few thick boughs rising steeply, each opening into a splayed fan of huge paddle fronds
B[2]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.5*u)*(1+.8*Math.exp(-u*H/5));
 const rings=[],vs=6;for(let yy=0;yy<H*.62;yy+=vs*.5)rings.push({x:T.x+.3*Math.sin(yy*.09+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/18)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(9,1,yy)*.5)});
 rings.push({x:T.x+.3*Math.sin(H*.62*.09+ti),y:T.y0+H*.62+1,z:T.z,r:.05,yy:H*.62+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.05*Math.sin(4*ang+ph)*smooth(8,0,R.yy)+.02*Math.sin(7*ang+R.yy*.1)),null);
 const nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU),tips=[],col=C(pick(S.leaf));
 for(let k=0;k<nB;k++){const u=mix(.42,.6,(k+rr(0,.9))/nB),a=a0+k/nB*TAU+rr(-.35,.35),el=rr(.7,1.1),len=H*rr(.3,.42),r0=clamp(rAt(u)*.5,.35,1.3);
  const o={x:T.x+Math.cos(a)*rAt(u)*.6,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.6},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.3,5,-.08,.05);
  if(!okPts(pts,2))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>.9?7:5,cap:true});
  const e=pts[5];tips.push({p:e,a:a});
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,1.0);epiBough(pts[3],T.wet,st,lv,.7);beardsAt(pts[3],T.wet,.7,st);lianasAt(pts[2],T.wet,st,lv,.6);}}
 tips.push({p:{x:T.x,y:T.y0+H*.63,z:T.z},a:a0+.5,top:true});
 const nF=lv===2?ri(S.fans[0],S.fans[1]):lv===1?5:3,L=T.crownR*rr(.5,.75);
 tips.forEach(t=>{fanAt(t.p.x,t.p.y+.3,t.p.z,t.a,t.top?Math.PI:rr(.9,1.4),t.top?nF+2:nF,L*(t.top?.9:1),.55,-.25,col);st.fans+=nF;
  if(lv===2){fanAt(t.p.x,t.p.y+.8,t.p.z,t.a+rr(-.3,.3),.6,3,L*.6,1.0,.7,shade(col,.1));   // young fronds standing up in the middle
   if(rng()<.6)BIO.put('paddle',[t.p.x,t.p.y-.4,t.p.z],qEuler(0,-t.a-rr(-1,1),-1.1),[L*.7,L*.7,L*.5],bright(0x7a6a3a,1.1));}});   // a dead one hanging
 let spread=T.crownR;tips.forEach(t=>{spread=Math.max(spread,Math.hypot(t.p.x-T.x,t.p.z-T.z)+L);});T.spread=spread;
 epiBole(T,rAt,st,lv,1.8,.1,.55);
 reg(T,S);};
// 3 the ironbark (the hyperjungle's, scaled to the ceiling): a fluted, buttressed bole in furrowed red-brown bark,
// surface roots off every buttress, level tiers of boughs with drooping tips, a top tuft, combed needle sprays
B[3]=function(T,st,lv){const S=SP[T.sp],fam='bark6',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(u<.62?1-.42*u:mix(.74,.07,smooth(.62,1,u)))*(1+.8*Math.exp(-u*H/15));
 const nl=ri(6,8),lobes=[],la=rr(0,TAU);for(let k=0;k<nl;k++)lobes.push({a:la+k/nl*TAU+rr(-.22,.22),amp:rr(.55,1.2),p:9*rr(.8,1.3)});
 const lobeSum=ang=>{let sm=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)sm+=L.amp*Math.pow(c,L.p);}return sm;};
 const butF=yy=>yy<20?1.25*Math.exp(-yy/7)*clamp((20-yy)/8,0,1):0;
 const rings=[],vs=12;for(let yy=0;yy<H*.96;yy+=(yy<14?1.5:vs*.5))rings.push({x:T.x,y:T.y0+yy,z:T.z,r:Math.max(.3,rAt(yy/H)),yy:yy,col:barkCol(S,(Math.floor(yy/22)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(16,2,yy)*.5)});
 rings.push({x:T.x,y:T.y0+H*.96+1,z:T.z,r:.05,yy:H*.96+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?14:9,Math.max(1,Math.round(TAU*rb/5)),vs,(R,ang)=>R.r*(1+.01*Math.sin(3*ang+R.yy*.045+ph)+butF(R.yy)*lobeSum(ang)),(R,ang)=>{const f=clamp(butF(R.yy)*1.6,0,1);return f>0?mix(1,.5+.5*clamp(lobeSum(ang)*1.4,0,1),f):1;});
 // surface roots, one off each buttress, running out along the ground
 if(lv===2)lobes.forEach(L=>{if(rng()<.3)return;const ang=L.a,R0=rAt(.03)*(1+.4*L.amp),len=rr(10,26)*(.6+.4*L.amp),rr0=clamp(rb*.16*L.amp,.5,1.6),pts=[],wob=rr(0,TAU);
  for(let j=0;j<=7;j++){const t=j/7,d=R0*.75+len*t,a=ang+.3*Math.sin(wob+t*5.2)*t;const x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;if(j>1&&(BIO.mask(x,z)<=0||!BIO.clearOf(x,z,2)))break;
   const r=mix(rr0,.18,Math.pow(t,.75));pts.push({x:x,y:Y(x,z)+r*(j===0?1.4:.22)+(j===0?2:0),z:z,r:r,col:barkCol(S,1)});}
  if(pts.length>3){st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:6});st.roots++;}});
 // boughs: the level tiers with drooping tips, and the top tuft
 const spots=[],boughs=[],a0=rr(0,TAU),nB=ri(S.boughs[0],S.boughs[1]);
 function bough(u,a,len,el,curve,rs){const r0=clamp(rAt(u)*rs,.4,2.2),o={x:T.x+Math.cos(a)*Math.max(0,rAt(u)-1),y:T.y0+H*u,z:T.z+Math.sin(a)*Math.max(0,rAt(u)-1)};
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.25,5,curve,.06);if(!okPts(pts,2.5))return;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>1.2?7:5,cap:true});boughs.push(pts);
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,.8);beardsAt(pts[3],T.wet,.8,st);lianasAt(pts[2],T.wet,st,lv,.7);}
  for(let s=2;s<5;s++){const p=pts[s],a2=a+rr(-1,1),el2=rr(-.05,.35),len2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.12,p.r*.6),.08,3,-.1,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});
   spots.push({p:sec[2],s:len2*.45},{p:sec[3],s:len2*.4,tip:true});}
  spots.push({p:pts[3],s:len*.2},{p:pts[4],s:len*.22},{p:pts[5],s:len*.26,tip:true});}
 for(let k=0;k<nB;k++)bough(mix(.5,.76,(k+rr(0,.9))/nB),a0+.7+k*GOLD+rr(-.25,.25),T.crownR*rr(.62,1.0),rr(-.02,.24),-.14,.48);
 for(let k=0,m=ri(4,6);k<m;k++)bough(rr(.84,.94),a0+k*GOLD+rr(-.3,.3),T.crownR*rr(.3,.48),rr(.15,.5),-.12,.6);
 spots.push({p:{x:T.x,y:T.y0+H*.97,z:T.z},s:4,tip:true},{p:{x:T.x,y:T.y0+H*.92,z:T.z},s:5});
 const cy=T.y0+H*.8,ex=T.crownR,ey=H*.28,sz0=rr(6.5,9.5),nC=lv===2?1.9:1.1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.3,.4)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.3))continue;clumpAt('needle',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),.5,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}});
 if(!mine){clumpAt('needle',T.x,T.y0+H*.9,T.z,sz0,.5,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}
 let spread=T.crownR;boughs.forEach(pts=>{const e=pts[pts.length-1];spread=Math.max(spread,Math.hypot(e.x-T.x,e.z-T.z)+8);});T.spread=spread;
 epiBole(T,rAt,st,lv,1.2,.15,.7);
 if(lv===2)for(let i=0,n=ri(3,6);i<n;i++){const a=rr(0,TAU),yy=rr(1,12),R=rAt(yy/H)*(1+butF(yy)*lobeSum(a))+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2.4),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}
 reg(T,S);};
// 4 the crown fern: a fibrous trunk and a great radiating crown of fronds, dead fronds hanging under it
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?8:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('bigfrond',tx,ty,tz,Rf,n,-.12,.22,bright(hc,1.5),1.25);
 if(lv>=1){frondCrown('bigfrond',tx,ty+.5,tz,Rf*.62,lv===2?5:3,.55,1.1,bright(shade(hc,.1),1.5),1.1);
  for(let k=0,m=lv===2?ri(3,6):2;k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*rb*.9,ty-.6,tz+Math.sin(a)*rb*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.2,2),Rf*rr(.5,.8),1],bright(vary(0x6a5a3a,.02,.1,.06),1.1));}
  if(rng()<.5*T.wet){const a=rr(0,TAU),s=rr(.8,1.4);BIO.put('epi',[tx+Math.cos(a)*rb,ty-H*rr(.2,.5),tz+Math.sin(a)*rb],qUp([Math.cos(a)*.8,.6,Math.sin(a)*.8]),[s,s*.8,s],epiCol());st.epi++;}}
 st.fronds+=n;};
// 5 the splay shrub: a stub of a trunk and a splayed rosette of huge upright paddle fronds, a traveller's palm in a fan
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 BIO.put('trunk',[T.x,T.y0-.3,T.z],qUp([rr(-.06,.06),1,rr(-.06,.06)]),[rb/.4*1.2,H*.45+.3,rb/.4*1.2],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const ty=T.y0+H*.45,n=lv===2?ri(S.fans[0],S.fans[1]):lv===1?6:4,hc=C(pick(S.leaf)),a0=rr(0,TAU),flat=rng()<.5,L=T.crownR;
 for(let k=0;k<n;k++){const a=flat?a0+(k/(n-1)-.5)*2.2+(k%2?Math.PI:0):a0+k/n*TAU+rr(-.2,.2),pitch=rr(.35,.95)*(1-.35*(k%3===0?1:0));
  BIO.put('paddle',[T.x+Math.cos(a)*rb*.5,ty+rr(-.2,.2),T.z+Math.sin(a)*rb*.5],qEuler(rr(-.06,.06),-a,pitch),[L*rr(.85,1.1),L*rr(.85,1.05),L*rr(.75,.95)],bright(vary(hc,.02,.06,.05),rr(1.0,1.25)));}
 if(lv===2){for(let k=0;k<2;k++){const a=a0+k*2.6;BIO.put('paddle',[T.x,ty-.2,T.z],qEuler(0,-a,-.35),[L*.8,L*.8,L*.6],bright(vary(0x8a7a3a,.02,.06,.05),1.05));}   // old fronds drooping
  if(rng()<.5){const col=bloomCol();for(let b=0,m=ri(3,6);b<m;b++)BIO.put('bloom',[T.x+rr(-.6,.6),ty+rr(.3,1.2),T.z+rr(-.6,.6)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.25,.45),col);st.blooms++;}}
 st.fans+=n;};
// 6 the dragon tree: a fat pale trunk forking twice, every fork tip a dense head of stiff blue-green leaves, the whole a flat umbrella
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hc=C(pick(S.leaf)),cy=T.y0+H*.95,heads=[];
 BIO.put('trunk2',[T.x,T.y0-.3,T.z],qUp([rr(-.05,.05),1,rr(-.05,.05)]),[rb/.4*1.25,H*.5+.3,rb/.4*1.25],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const nF=ri(S.forks[0],S.forks[1]),lvls=lv===2?2:1;
 function fork(o,a,el,len,r0,depth){const e=[o[0]+Math.cos(a)*Math.cos(el)*len,o[1]+Math.sin(el)*len,o[2]+Math.sin(a)*Math.cos(el)*len];
  BIO.beam('rod',o,e,r0,r0*.7,rc);st.sapTris+=BIO.defs.rod.tris;
  if(depth<lvls){const n=ri(2,3),a0=rr(0,TAU);for(let k=0;k<n;k++)fork(e,a0+k/n*TAU+rr(-.3,.3),rr(.55,.95),len*rr(.55,.75),r0*.7,depth+1);}
  else heads.push(e);}
 const a0=rr(0,TAU);for(let k=0;k<nF;k++)fork([T.x,T.y0+H*.48,T.z],a0+k/nF*TAU+rr(-.3,.3),rr(.5,.85),H*rr(.22,.3),rb*.55,0);
 const sz=clamp(T.crownR*.42,1.8,4.2);
 heads.forEach(e=>{const y=Math.min(e[1],cy);clumpAt('sword',e[0],y+sz*.15,e[2],sz*rr(.85,1.15),.55,hc,T.x,cy,T.z,T.crownR,H*.3);st.clumps++;
  if(lv===2&&rng()<.35){const col=bloomCol();for(let b=0;b<4;b++)BIO.put('bloom',[e[0]+rr(-1,1),y+sz*.4+rr(0,.5),e[2]+rr(-1,1)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.2,.4),col);st.blooms++;}});
 if(lv===2&&rng()<.4){const a=rr(0,TAU),R=rb*1.3;BIO.put('rosette',[T.x+Math.cos(a)*R,T.y0-.02,T.z+Math.sin(a)*R],qEuler(0,rr(0,TAU),0),[.8,.6,.8],bright(vary(pick(PAL.succulent),.03,.1,.06),1.05));}};
// 7 the umbrella thorn: a short gnarled trunk, crooked boughs rising and then flattening out, one wide flat crown of fine leaflets
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hc=C(pick(S.leaf)),R=T.crownR,top=T.y0+H,spots=[];
 BIO.put('trunk2',[T.x,T.y0-.3,T.z],qUp([rr(-.08,.08),1,rr(-.08,.08)]),[rb/.4*1.1,H*.42+.3,rb/.4*1.1],tint(pick(S.bark),means().bark[2],rr(.8,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),el=rr(.55,.9),L1=H*rr(.3,.42),o=[T.x,T.y0+H*.42,T.z];
  const m1=[o[0]+Math.cos(a)*Math.cos(el)*L1,o[1]+Math.sin(el)*L1,o[2]+Math.sin(a)*Math.cos(el)*L1];
  BIO.beam('rod',o,m1,rb*.5,rb*.3,rc);st.sapTris+=BIO.defs.rod.tris;
  for(let s=0,n=lv===2?ri(2,3):2;s<n;s++){const a2=a+rr(-.7,.7),L2=R*rr(.55,.95),e=[m1[0]+Math.cos(a2)*L2,Math.min(top,m1[1]+L2*rr(.15,.3)),m1[2]+Math.sin(a2)*L2];   // flattening out into the crown
   if(!clear3(e[0],e[1],e[2],2,2))continue;BIO.beam('rod',m1,e,rb*.3,rb*.1,rc);st.sapTris+=BIO.defs.rod.tris;
   spots.push([mix(m1[0],e[0],.55),mix(m1[1],e[1],.55),mix(m1[2],e[2],.55)],e,e);}}
 const cy=top,sz0=clamp(R*.34,2,4.5);
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.5*rng();clumpAt('leaflet',p[0]+Math.cos(a)*d,top-rr(0,1.2),p[2]+Math.sin(a)*d,sz0*rr(.85,1.2),.3,hc,T.x,cy,T.z,R,Math.max(3,R*.3));st.clumps++;}});
 if(lv===2)for(let c=0,m=ri(4,8);c<m;c++){const a=rr(0,TAU),d=R*rr(.2,.9);clumpAt('leaflet',T.x+Math.cos(a)*d,top-rr(.2,1.4),T.z+Math.sin(a)*d,sz0*rr(.8,1.1),.28,hc,T.x,cy,T.z,R,Math.max(3,R*.3));st.clumps++;}   // fill the disc
 if(!spots.length){clumpAt('leaflet',T.x,top,T.z,sz0,.3,hc,T.x,cy,T.z,R,4);st.clumps++;}
 if(lv===2)reg(T,S,R);};
// 8 the CLIFF FIG (new): a strangler rooted on the karst. A lattice bole of fused roots on plate buttresses,
// a wide crown of glossy leaves whose outward boughs are longer and droop over the cliff edge, and
// AERIAL-ROOT CURTAINS that drop from those boughs and run straight down the rock face to the waterline.
// T.out / T.edgeD / T.footY come from the pass (karstEdge); a fig with none is one standing inland on the top.
B[8]=function(T,st,lv){const S=SP[T.sp],fam='bark5',H=T.H,rb=T.rb,ti=T.seed%3,hasEdge=T.edgeD!=null,out=T.out||[1,0],oa=Math.atan2(out[1],out[0]);
 const rAt=u=>rb*(1-.4*u)*(1+1.1*Math.exp(-u*H/7));
 const nl=ri(5,8),lobes=[],la=rr(0,TAU);for(let k=0;k<nl;k++)lobes.push({a:la+k/nl*TAU+rr(-.25,.25),amp:rr(.5,1.3),p:rr(6,12)});
 const lobeSum=ang=>{let s=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,L.p);}return s;};
 const butF=yy=>yy<12?1.3*Math.exp(-yy/4)*clamp((12-yy)/5,0,1):0;
 const rings=[],vs=8;for(let yy=0;yy<H*.6;yy+=(yy<10?1.2:vs*.5))rings.push({x:T.x+.4*Math.sin(yy*.15+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/12)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(10,1,yy)*.45)});
 rings.push({x:T.x,y:T.y0+H*.6+1,z:T.z,r:.05,yy:H*.6+1,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?14:9,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+.22*lobeSum(ang)*smooth(.6,.1,R.yy/H)+butF(R.yy)*lobeSum(ang)+.03*Math.sin(7*ang+R.yy*.3)),(R,ang)=>{const f=clamp(butF(R.yy)*1.5,0,1);return f>0?mix(1,.5+.5*clamp(lobeSum(ang)*1.3,0,1),f):1;});
 // the crown: boughs from the upper bole; the outward ones longer, lower and drooping over the edge
 const spots=[],boughs=[],a0=rr(0,TAU),nB=ri(S.boughs[0],S.boughs[1]),hangs=[];
 for(let k=0;k<nB;k++){const u=mix(.4,.6,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),outward=hasEdge?smooth(-.2,.8,Math.cos(a-oa)):0;
  const el=rr(.25,.55)-outward*.3,len=T.crownR*rr(.65,1)*(1+.5*outward),r0=clamp(rAt(u)*.45,.4,1.6),curve=-.1-outward*.2;
  const o={x:T.x+Math.cos(a)*rAt(u)*.6,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.6},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.2,6,curve,.07);
  if(!okPts(pts,2))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,(k+ti)%3),{seg:r0>1?7:5,cap:true});boughs.push(pts);
  if(lv>=1){epiBough(pts[3],T.wet,st,lv,.8);lianasAt(pts[3],T.wet,st,lv,.9);}
  for(let s=2;s<6;s++){const p=pts[s],a2=a+rr(-1,1),el2=rr(-.1,.35),len2=len*rr(.28,.45);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.12,p.r*.6),.08,3,-.12,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,(k+ti+1)%3),{seg:4});
   spots.push({p:sec[2],s:len2*.45},{p:sec[3],s:len2*.4,tip:true});}
  spots.push({p:pts[3],s:len*.18},{p:pts[4],s:len*.2},{p:pts[5],s:len*.22},{p:pts[6],s:len*.24,tip:true});
  if(outward>.3){hangs.push(pts[4],pts[5],pts[6]);}}
 spots.push({p:{x:T.x,y:T.y0+H*.66,z:T.z},s:5,tip:true});
 const cy=T.y0+H*.6,ex=T.crownR,ey=H*.3,sz0=rr(5.5,8),nC=lv===2?1.8:1.1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.4,.3)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('glossy',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}});
 if(!mine){clumpAt('glossy',T.x,T.y0+H*.62,T.z,sz0,.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}
 // the AERIAL ROOTS: from an outward bough to the rim, then straight down the face to the water
 if(hasEdge){const n=lv===2?ri(5,10):lv===1?3:0,px=-out[1],pz=out[0];
  for(let i=0;i<n;i++){const h0=hangs.length?pick(hangs):{x:T.x+out[0]*T.crownR*.5,y:T.y0+H*.5,z:T.z+out[1]*T.crownR*.5};
   const side=rr(-1,1)*4,ex2=T.x+out[0]*(T.edgeD+rr(.4,1.4))+px*side,ez2=T.z+out[1]*(T.edgeD+rr(.4,1.4))+pz*side;
   const yTop=h0.y-.3,yBot=T.footY+rr(-.4,.4),L=yTop-yBot;if(L<4)continue;
   const r0=rr(.16,.4),pts=[{x:h0.x,y:h0.y,z:h0.z,r:r0},{x:mix(h0.x,ex2,.5),y:yTop-Math.min(5,L*.2),z:mix(h0.z,ez2,.5),r:r0*.95}],n2=Math.max(3,Math.round(L/9)),wob0=rr(0,9);
   for(let j=0;j<=n2;j++){const t=j/n2,w=(fbm(t*3+wob0,i*1.7,909,2)-.5)*1.4;pts.push({x:ex2+px*w,y:yTop-Math.min(8,L*.3)-(L-Math.min(8,L*.3))*t,z:ez2+pz*w,r:r0*mix(1,.5,t)});}
   st.limb+=BIO.tube('root',pts,rootCol(),{seg:lv===2?5:4});st.roots++;
   if(lv===2){for(let q=0,m=ri(1,3);q<m;q++)BIO.put('strand',[ex2+px*rr(-1.5,1.5),yTop-rr(3,10),ez2+pz*rr(-1.5,1.5)],qEuler(0,rr(0,TAU),0),[rr(.4,.9),Math.min(L*.6,rr(6,24)),1],bright(vary(pick(PAL.root),.02,.06,.06),1.0));
    if(rng()<.5)BIO.put('mossmat',[ex2,yTop-L*rr(.3,.8),ez2],qUp([out[0],.2,out[1]]),rr(.8,1.6),bright(vary(pick(PAL.moss),.03,.1,.06),.95));}}}
 let spread=T.crownR;boughs.forEach(pts=>{const e=pts[pts.length-1];spread=Math.max(spread,Math.hypot(e.x-T.x,e.z-T.z)+6);});T.spread=spread;
 epiBole(T,rAt,st,lv,1.2,.1,.5);
 if(lv===2)for(let i=0,q=ri(2,4);i<q;i++){const a=rr(0,TAU),yy=rr(.5,6),R=rAt(yy/H)*(1+butF(yy)*lobeSum(a))+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}
 reg(T,S);};
// 9 the FLAME-CROWN (new): a short bole, three to five limbs rising and flattening into one wide flat umbrella
// of fern-fine leaves, and a scarlet flush of bloom on one side of the crown in patches (Delonix): the
// lowland and farm tree, and the street tree of Ys's land quarter.
B[9]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3,hc=C(pick(S.leaf)),R=T.crownR,top=T.y0+H,rc=rodCol(S,T.seed);
 const bloomK=T.bloomK||(T.bloomK=rr(.15,.7)),flameA=T.flameA||(T.flameA=rr(0,TAU)),flame=vary(pick(PAL.flame),.02,.08,.05);
 const rAt=u=>rb*(1-.3*u)*(1+.9*Math.exp(-u*H/3)),hB=H*rr(.3,.42);
 const rings=[];for(let yy=0;yy<hB;yy+=1.2)rings.push({x:T.x+.2*Math.sin(yy*.5+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/4)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(3,0,yy)*.3)});
 rings.push({x:T.x,y:T.y0+hB+.5,z:T.z,r:.05,yy:hB+.5,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/2.5)),5,(Rg,ang)=>Rg.r*(1+.08*Math.sin(5*ang+ti)*smooth(5,0,Rg.yy)),null);
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.35,.35),el=rr(.6,1.0),L1=(H-hB)*rr(.55,.75)/Math.sin(el);
  const o={x:T.x+Math.cos(a)*rAt(hB/H)*.5,y:T.y0+hB-.5,z:T.z+Math.sin(a)*rAt(hB/H)*.5};
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],L1,rb*.5,.15,4,-.22,.08);   // rising, then flattening into the crown
  if(!okPts(pts,1.5))continue;for(let j=0;j<pts.length;j++)pts[j].y=Math.min(pts[j].y,top-.8);
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:5,cap:true});
  const e=pts[4];
  for(let s=0,n=lv===2?ri(3,5):2;s<n;s++){const a2=a+rr(-1.2,1.2),L2=R*rr(.4,.8),m2=[e.x,e.y,e.z],e2=[e.x+Math.cos(a2)*L2,Math.min(top-.5,e.y+L2*rr(.05,.18)),e.z+Math.sin(a2)*L2];   // level, into the disc
   if(!clear3(e2[0],e2[1],e2[2],2,2))continue;BIO.beam('rod',m2,e2,rb*.22,rb*.07,rc);st.sapTris+=BIO.defs.rod.tris;
   spots.push([mix(m2[0],e2[0],.5),mix(m2[1],e2[1],.5),mix(m2[2],e2[2],.5)],e2);
   if(lv===2&&rng()<.5){const a3=a2+rr(-.8,.8),L3=L2*.5,e3=[e2[0]+Math.cos(a3)*L3,Math.min(top-.3,e2[1]+L3*.1),e2[2]+Math.sin(a3)*L3];BIO.beam('rod',e2,e3,rb*.08,rb*.03,rc);spots.push(e3);}}
  spots.push([e.x,e.y,e.z]);}
 const cy=top-R*.1,sz0=clamp(R*.3,2.2,4.6),ey=Math.max(3,R*.28);
 const leafAt=(x,y,z,s)=>{const fa=Math.atan2(z-T.z,x-T.x),inPatch=Math.cos(fa-flameA)>mix(.75,-.5,bloomK)&&rng()<.88;
  clumpAt('fernleaf',x,y,z,s,.32,inPatch?flame:hc,T.x,cy,T.z,R,ey);st.clumps++;
  if(inPatch&&lv===2){const c2=bright(vary(flame,.02,.06,.06),1.25);for(let b=0,m=ri(3,7);b<m;b++)BIO.put('bloom',[x+rr(-1,1)*s*.5,y+rr(.1,.7)*s*.4,z+rr(-1,1)*s*.5],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.3,.55),c2);st.blooms++;}};
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.5*rng();leafAt(p[0]+Math.cos(a)*d,Math.min(top,p[1]+rr(0,1)),p[2]+Math.sin(a)*d,sz0*rr(.85,1.2));}});
 if(lv>=1)for(let c=0,m=lv===2?ri(6,12):5;c<m;c++){const a=rr(0,TAU),d=R*rr(.15,.95);leafAt(T.x+Math.cos(a)*d,top-rr(.3,1.8)-d/R*.6,T.z+Math.sin(a)*d,sz0*rr(.8,1.1));}   // fill the disc; the flush sits on top
 if(!spots.length)leafAt(T.x,top,T.z,sz0);
 if(lv===2&&T.wet>.5)epiBole(T,rAt,st,lv,.4,.1,.3);
 T.spread=R;if(lv===2)reg(T,S,R);};
// 10 the CINDER PINE (new): wind-sheared, gnarled, black-barked. A leaning, kinked bole, every branch on the lee
// side rising a little and then level, the foliage dark needle clumps sheared to a plane that slopes up leeward,
// dead stubs to windward. T.lee (the pass: down the salt gradient, i.e. inland) is the way the wind blows.
B[10]=function(T,st,lv){const S=SP[T.sp],fam='bark7',H=T.H,rb=T.rb,ti=T.seed%3,hc=C(pick(S.leaf)),R=T.crownR,lee=T.lee||[1,0],la=Math.atan2(lee[1],lee[0]);
 const lean=rr(.25,.6),pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},[Math.cos(la)*Math.sin(lean),Math.cos(lean),Math.sin(la)*Math.sin(lean)],H*.75,rb,rb*.25,6,-.15,.12);
 for(let k=2;k<pts.length-1;k++){pts[k].x+=rr(-.4,.4)*rb*2;pts[k].z+=rr(-.4,.4)*rb*2;}   // the kinks
 pts.forEach((p,i)=>{p.col=barkCol(S,(i+ti)%3).lerp(C(PAL.moss[ti%3]),i===0?.2:0);});
 st.trunk+=BIO.tube(fam,pts,barkCol(S,0),{seg:lv===2?8:6,cap:true});
 const top=pts[pts.length-1],spots=[],crownTop=T.y0+H;
 const nB=lv===2?ri(6,10):4;
 for(let k=0;k<nB;k++){const t=mix(.35,.98,(k+rr(0,.9))/nB),i=Math.min(pts.length-2,Math.floor(t*(pts.length-1))),f=t*(pts.length-1)-i,o={x:mix(pts[i].x,pts[i+1].x,f),y:mix(pts[i].y,pts[i+1].y,f),z:mix(pts[i].z,pts[i+1].z,f)};
  const a=la+rr(-1.1,1.1),el=rr(.0,.35),len=R*rr(.5,1.0)*(1+.3*Math.cos(a-la)),r0=clamp(mix(pts[i].r,pts[i+1].r,f)*.45,.08,.5);
  const b=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.06,4,-.12,.14);
  if(!okPts(b,1))continue;st.limb+=BIO.tube(fam,b,barkCol(S,1),{seg:4});
  for(let s=2;s<=4;s++)spots.push({p:b[s],s:len*.2,t:s===4});
  if(lv===2&&rng()<.5){const p=b[2],a2=a+rr(-.9,.9),l2=len*.4,e=[p.x+Math.cos(a2)*l2,p.y+rr(-.2,.4),p.z+Math.sin(a2)*l2];BIO.beam('rod',[p.x,p.y,p.z],e,p.r*.7,.05,rodCol(S,k));spots.push({p:{x:e[0],y:e[1],z:e[2]},s:l2*.3,t:true});}}
 if(lv>=1)for(let k=0,m=ri(2,4);k<m;k++){const t=rr(.3,.8),i=Math.min(pts.length-2,Math.floor(t*(pts.length-1))),p=pts[i],a=la+Math.PI+rr(-1,1),L=rr(1,3);BIO.beam('rod',[p.x,p.y,p.z],[p.x+Math.cos(a)*L,p.y+rr(-.3,.5),p.z+Math.sin(a)*L],p.r*.4,.04,shade(C(S.bark[0]),.12));}   // dead stubs to windward
 const sz0=clamp(R*.3,1.4,3.2),cy=crownTop-2,ex=R,ey=Math.max(2,R*.3);
 spots.forEach(s=>{for(let c=0,n=lv===2?2:1;c<n;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,dl=((x-T.x)*lee[0]+(z-T.z)*lee[1])/R;
  const ymax=crownTop-H*.3*(1-clamp(dl,-1,1))*.5,y=Math.min(s.p.y+rr(0,.8),ymax);   // sheared: lower to windward
  clumpAt('cneedle',x,y,z,sz0*rr(.8,1.2)*(s.t?1.15:1),.35,hc,T.x,cy,T.z,ex,ey);st.clumps++;}});
 if(!spots.length){clumpAt('cneedle',top.x,top.y,top.z,sz0,.4,hc,T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2&&rng()<.5){const a=rr(0,TAU);BIO.put('mossmat',[T.x+Math.cos(a)*rb,T.y0+rr(.3,1.5),T.z+Math.sin(a)*rb],qUp([Math.cos(a),.3,Math.sin(a)]),rr(.6,1.2),bright(vary(pick(PAL.moss),.03,.1,.06),.9));}
 T.spread=R*1.1;if(lv===2)reg(T,S,R*1.1);};
// 11 the LANTERN MANGROVE (the SW lowlands', recoloured): a short dark trunk standing above the water on a cage
// of arching prop roots, drop roots from the boughs, a wide low dome of glossy blue-green leaves
B[11]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3,gy=T.y0+.5,base=Math.max(gy,0)+rr(.8,1.8),hc=C(pick(PAL.mangrove));
 const rAt=u=>rb*(1-.5*u),hB=H*rr(.3,.42);
 const rings=[];for(let yy=0;yy<hB;yy+=1.5)rings.push({x:T.x,y:base-.2+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/5)+ti)%3)});
 rings.push({x:T.x,y:base-.2+hB+.4,z:T.z,r:.04,yy:hB+.4,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?9:6,Math.max(1,Math.round(TAU*rb/2.5)),5,(Rg,ang)=>Rg.r*(1+.06*Math.sin(4*ang+ti)),null);
 const nR=lv===2?ri(10,16):6;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.25,.25),Rr=rr(1.6,4.2)*(rb/.6),gx=T.x+Math.cos(a)*Rr,gz=T.z+Math.sin(a)*Rr,gyy=Math.min(Y(gx,gz),base-1),h0=base+rr(.3,2.2);
  const pts=[{x:T.x+Math.cos(a)*rb*.7,y:h0,z:T.z+Math.sin(a)*rb*.7,r:rb*.24},{x:T.x+Math.cos(a)*Rr*.3,y:h0+rr(.8,1.8),z:T.z+Math.sin(a)*Rr*.3,r:rb*.2},
   {x:T.x+Math.cos(a)*Rr*.62,y:h0+rr(.2,1),z:T.z+Math.sin(a)*Rr*.62,r:rb*.17},{x:T.x+Math.cos(a)*Rr*.88,y:mix(h0,gyy,.6),z:T.z+Math.sin(a)*Rr*.88,r:rb*.15},{x:gx,y:gyy-.4,z:gz,r:rb*.14}];
  st.limb+=BIO.tube('root',pts,rootCol(),{seg:lv===2?5:4});st.roots++;}
 const spots=[],nL=lv===2?ri(5,7):4,a0=rr(0,TAU),topY=base-.2+hB,hangs=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.2,.2),el=rr(.3,.7),len=T.crownR*rr(.6,.95),o={x:T.x+Math.cos(a)*rAt(hB/H)*.5,y:topY-.3,z:T.z+Math.sin(a)*rAt(hB/H)*.5};
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rb*.4,.1,5,-.35,.1);if(!okPts(pts,1.5))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:5,cap:true});
  for(let i=2;i<pts.length;i++){spots.push({p:pts[i],s:len*.2,t:i===pts.length-1});if(lv===2&&rng()<.3)hangs.push(pts[i]);}
  if(lv===2)for(let s=0;s<2;s++){const p=pts[2+s],a2=a+rr(-1,1),l2=len*.35,e=[p.x+Math.cos(a2)*l2,p.y+rr(0,.6),p.z+Math.sin(a2)*l2];if(!clear3(e[0],e[1],e[2],2,2))continue;BIO.beam('rod',[p.x,p.y,p.z],e,p.r*.6,.05,rodCol(S,k));spots.push({p:{x:e[0],y:e[1],z:e[2]},s:l2*.4,t:true});}}
 spots.push({p:{x:T.x,y:topY+1,z:T.z},s:2,t:true});
 const cy=base+H*.72,ex=T.crownR,ey=H*.28,sz0=rr(3.6,5.2);
 spots.forEach(s=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng());clumpAt('glossy',s.p.x+Math.cos(a)*d,s.p.y+rr(-.2,.6)*s.s,s.p.z+Math.sin(a)*d,sz0*rr(.85,1.15)*(s.t?1.1:1),.6,hc,T.x,cy,T.z,ex,ey);st.clumps++;}});
 hangs.forEach(p=>{BIO.beam('rod',[p.x,p.y,p.z],[p.x+rr(-.3,.3),Math.min(gy,0)-.6,p.z+rr(-.3,.3)],rr(.03,.06),null,shade(C(S.bark[0]),-.2));});   // drop roots
 if(lv===2&&rng()<.5){const a=rr(0,TAU);BIO.put('epi',[T.x+Math.cos(a)*rb*.9,base+hB*.5,T.z+Math.sin(a)*rb*.9],qUp([Math.cos(a)*.8,.6,Math.sin(a)*.8]),[.7,.55,.7],epiCol());st.epi++;}
 T.spread=T.crownR;if(lv===2&&typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:Math.max(gy,0),r:T.crownR,h:H});};
// 12 the STILT PANDAN (new; a screwpine): a cone of straight stilt roots, a stem forking once or twice, every tip
// a head of long serrated straps, dead straps hanging under it, the odd orange fruit head
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,hc=C(pick(S.leaf)),rc=rodCol(S,T.seed),gy=T.y0+.5,base=gy+H*rr(.2,.35),heads=[];
 const nR=lv===2?ri(7,12):5;for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.2,.2),Rr=rr(.8,2.2)*(rb/.3),gx=T.x+Math.cos(a)*Rr,gz=T.z+Math.sin(a)*Rr;
  BIO.beam('rod',[T.x+Math.cos(a)*rb*.5,base+rr(-.3,.6),T.z+Math.sin(a)*rb*.5],[gx,Y(gx,gz)-.4,gz],rb*.32,rb*.28,rc);st.sapTris+=BIO.defs.rod.tris;st.roots++;}
 function fork(o,a,el,len,r,depth){const e=[o[0]+Math.cos(a)*Math.cos(el)*len,o[1]+Math.sin(el)*len,o[2]+Math.sin(a)*Math.cos(el)*len];BIO.beam('rod',o,e,r,r*.8,rc);st.sapTris+=BIO.defs.rod.tris;
  if(depth<(lv===2?2:1)&&rng()<.8){const n=ri(2,3),a0=rr(0,TAU);for(let k=0;k<n;k++)fork(e,a0+k/n*TAU+rr(-.3,.3),rr(.7,1.1),len*rr(.5,.7),r*.75,depth+1);}else heads.push(e);}
 fork([T.x,base-.3,T.z],rr(0,TAU),rr(1.2,1.5),H*.35,rb,0);
 const sz=clamp(T.crownR*.6,1.6,3.4),cy=gy+H;
 heads.forEach(e=>{clumpAt('strap',e[0],e[1]+sz*.1,e[2],sz*rr(.85,1.15),.6,hc,T.x,cy,T.z,T.crownR,H*.3);st.clumps++;
  if(lv===2&&rng()<.3)BIO.put('lobe',[e[0]+rr(-.3,.3),e[1]-sz*.2,e[2]+rr(-.3,.3)],qEuler(0,rr(0,TAU),0),[.35,.45,.35],bright(C(0xe08a30),1.1));   // a fruit head
  if(lv===2&&rng()<.6)BIO.put('ribbon',[e[0],e[1]-.3,e[2]],qEuler(0,rr(0,TAU),0),[rr(.8,1.4),rr(1.5,3),1],bright(vary(0x9a8a5a,.02,.08,.06),1.0));});   // dead straps
 T.spread=T.crownR;};
// 13 the LOTUS TRUMPET (Xanadu's): a fat fluted bole, arms that climb and spread, and on every arm a trumpet
// flaring into a wide shallow cup, green inside, with a fringe of lotus flowers round its rim; aerial roots
// hang from the arms. The tallest trumpet crowns the bole. In and beside the travertine pools.
B[13]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1-.45*u)*(1+.55*Math.exp(-u*H/2.2)),hB=H*rr(.34,.44);
 const nl=7,lobes=[];for(let k=0;k<nl;k++)lobes.push({a:k/nl*TAU+rr(-.1,.1),amp:rr(.08,.14)});
 const lobeSum=ang=>{let s=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,4);}return s;};
 const rings=[];for(let yy=0;yy<hB;yy+=1.2)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/6)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(4,0,yy)*.4)});
 rings.push({x:T.x,y:T.y0+hB+.4,z:T.z,r:.05,yy:hB+.4,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/3)),4,(Rg,ang)=>Rg.r*(1+lobeSum(ang)*(1+.6*Math.exp(-Rg.yy/2))),null);
 const fr=[C(pick(PAL.lotus)),C(pick([0xff60b0,0xf080c0,0xff9ad0,0xe050a0,0xffc0e0]))],leafC=vary(pick(S.leaf),.02,.06,.05);
 function trumpet(p,R,depth){const rg=[],n=lv===2?8:5,ph=rr(0,TAU);
  for(let i=0;i<=n;i++){const u=i/n,f=Math.pow(u,2.2),r=lerp(R*.08,R,f),yy=depth*u;rg.push({x:p.x,y:p.y+yy,z:p.z,r:r,yy:yy*3,col:barkCol(S,ti).lerp(bright(leafC,1.1),smooth(.2,.8,u))});}
  rg.push({x:p.x,y:p.y+depth+R*.04,z:p.z,r:R*1.06,yy:depth*3+1,col:bright(leafC,1.25)},{x:p.x,y:p.y+depth-R*.12,z:p.z,r:R*.8,yy:depth*3+2,col:shade(leafC,-.2)},{x:p.x,y:p.y+depth-R*.18,z:p.z,r:.05,yy:depth*3+3,col:shade(leafC,-.35)});
  st.cups+=BIO.lathe('trumpet',rg,lv===2?18:11,Math.max(1,Math.round(TAU*R/3)),3,(Rg,ang)=>Rg.r*(1+.06*Math.cos(nR*ang+ph)),(Rg,ang)=>.82+.18*Math.cos(nR*ang+ph));
  const nf=lv===2?Math.round(TAU*R/.9):lv===1?Math.round(TAU*R/2):0,ph2=rr(0,TAU);
  for(let k=0;k<nf;k++){const a=ph2+k/nf*TAU,rr2=R*rr(.98,1.08),x=p.x+Math.cos(a)*rr2,z=p.z+Math.sin(a)*rr2,y=p.y+depth+rr(.1,.35);
   BIO.put('lotus',[x,y,z],qEuler(rr(-.2,.2),-a,rr(.8,1.2)),rr(.75,1.05)*Math.min(1.3,R/2.5),bright(vary(fr[k%2],.02,.08,.05),1.15),{c2:bright(C(0xfff0f4),1.05)});st.blooms++;}
  if(lv===2&&rng()<.6){const cc=bright(C(pick(PAL.lotus)),1.1);for(let k=0,m2=ri(2,4);k<m2;k++){const a=rr(0,TAU),d=R*rr(.2,.6);BIO.put('cup',[p.x+Math.cos(a)*d,p.y+depth-R*.08,p.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.5,.8),cc);st.blooms++;}}}
 const nA=lv===2?ri(S.arms[0],S.arms[1]):ri(3,5),a0=rr(0,TAU),topY=T.y0+hB;let spread=T.crownR;
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),reach=rr(2.5,T.crownR*1.9),rise=H*rr(.25,.6)-hB*.2,R=rr(1.6,3.2)*Math.min(1.3,H/15);
  const o={x:T.x+Math.cos(a)*rAt(hB/H)*.5,y:topY-rr(.3,1.5),z:T.z+Math.sin(a)*rAt(hB/H)*.5},el=Math.atan2(rise*.4,reach),len=Math.hypot(reach,rise*.4);
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rAt(hB/H)*.38,.3,5,rise*.6/len,.05);if(!okPts(pts,R*.6))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,(k+ti)%3),{seg:5});const e=pts[5];trumpet({x:e.x,y:e.y,z:e.z},R,R*rr(.5,.8));spread=Math.max(spread,Math.hypot(e.x-T.x,e.z-T.z)+R);
  if(lv===2&&rng()<.5){const p=pts[3],L=Math.max(2,(p.y-T.y0-1)*rr(.5,.9));BIO.put('strand',[p.x,p.y-.2,p.z],qEuler(0,rr(0,TAU),0),[rr(.3,.6),L,1],bright(vary(pick(PAL.root),.02,.06,.06),1.0));}}
 trumpet({x:T.x,y:topY,z:T.z},rr(2,3.4)*Math.min(1.3,H/15),rr(1.4,2.4));   // the crowning trumpet
 T.spread=spread;if(lv===2)reg(T,S,spread);};
// 14 the PIPE REED (the eastern abyss's): a jointed ribbed stem, whorls of needles at every node, a strobilus on top
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,n=ri(6,9),la=rr(0,TAU),lk=rr(0,.08),pts=[];
 for(let k=0;k<=n;k++){const u=k/n;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*mix(1,.35,u),col:barkCol(S,k%3)});}
 st.limb+=BIO.tube('bark4',pts,barkCol(S,0),{seg:lv===2?6:5,vscale:H/n*8});   // one ring of the jointed texture per node
 const hc=vary(pick(S.leaf),.02,.1,.05);
 for(let k=1;k<=n;k++){const p=pts[k],u=k/n,R=T.crownR*mix(1.1,.45,u)*rr(.85,1.15);
  BIO.put('whorl',[p.x,p.y-.05,p.z],qEuler(0,rr(0,TAU),0),[R,R,R],bright(hc,rr(.9,1.1)*1.1));
  if(lv===2&&k<n)BIO.put('whorl',[p.x,p.y+.35,p.z],qEuler(0,rr(0,TAU),0),[R*.7,R*.7,R*.7],bright(shade(hc,.1),1.1));}
 const e=pts[n];BIO.put('cone',[e.x,e.y,e.z],qUp([0,1,0]),[e.r*3.2,rr(1.2,2.4),e.r*3.2],shade(C(0x6a4a3a),-.1));st.whorls+=n;};
NWBAY.BUILDERS=B;

// ---------------------------------------------------------------- impostors (the far canopy)
let ICO=null;
function buildFar(T,fi,st){const K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const S=SP[T.sp],cheap=BIO.lodD(T.x,T.z)>2000,tiny=T.sp===5||T.sp===12||T.sp===14;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd,under){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m*(under&&dy<0?under:1),z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=tiny?3:cheap?4:6,top=T.y0+T.H*[.88,.9,.62,.92,.9,.4,.9,.95,.64,.95,.78,.86,.88,.5,.92,.9][T.sp],rings=[];
 const yb=T.sp===11?Math.max(T.y0,0)+1:T.y0;
 [0,.06,.5,1].forEach(u=>{const y=yb+(top-yb)*u,r=Math.max(.5,T.rb*(1-.5*u)*(u<.08?1.6:1)*(T.sp===1&&u<.6?1.3:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*(r2/rings.length);
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=S.leaf.map(h=>bright(h,.85)),R=T.crownR,a0=(T.seed%628)/100;
 if(T.sp===0){const L2=S.leaf2.map(h=>bright(h,.85));blob(T.x,T.y0+T.H*.88,T.z,R*.6,T.H*.1,L[fi%2],L2[fi%2],fi);
  for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.55,T.y0+T.H*.78+((k*7)%5),T.z+Math.sin(a)*R*.55,R*.45,T.H*.07,L[(k+fi)%2],L2[(k+1)%2],fi+k);}}
 else if(T.sp===1){for(let k=0;k<3;k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.42,T.y0+T.H*.93+((k*11)%7),T.z+Math.sin(a)*R*.42,R*.52,T.H*.09,L[k%3],L[2],fi+k);}}
 else if(T.sp===2){for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.5,T.y0+T.H*.7+((k*5)%4),T.z+Math.sin(a)*R*.5,R*.5,T.H*.09,L[(k+fi)%4],L[2],fi+k);}}
 else if(T.sp===3){for(let k=0;k<(cheap?3:4);k++){const t=k/3;blob(T.x+Math.sin(k*2.4+a0)*R*.06,mix(T.y0+T.H*.55,T.y0+T.H*.94,t),T.z+Math.cos(k*2.4+a0)*R*.06,R*mix(.8,.22,t),T.H*.07,L[(k+fi)%4],L[2],fi+k);}}
 else if(T.sp===8){const o=T.out||[0,0];blob(T.x+o[0]*R*.3,T.y0+T.H*.62,T.z+o[1]*R*.3,R*.85,T.H*.16,L[fi%4],L[2],fi,.4);}
 else if(T.sp===9){const fl=(T.bloomK||(T.bloomK=rr(.15,.7)))>.4,fa=T.flameA||(T.flameA=rr(0,TAU));blob(T.x,T.y0+T.H*.92,T.z,R*.95,T.H*.08,L[fi%4],L[2],fi,.3);
  if(fl)blob(T.x+Math.cos(fa)*R*.45,T.y0+T.H*.95,T.z+Math.sin(fa)*R*.45,R*.5,T.H*.05,PAL.flame[fi%4],PAL.flame[(fi+1)%4],fi+3,.3);}
 else if(T.sp===10){const l=T.lee||[1,0];blob(T.x+l[0]*R*.4,T.y0+T.H*.72,T.z+l[1]*R*.4,R*.75,T.H*.14,L[fi%4],L[2],fi,.4);}
 else if(T.sp===11){blob(T.x,Math.max(T.y0,0)+T.H*.68,T.z,R*.9,T.H*.22,PAL.mangrove[fi%4],PAL.mangrove[2],fi,.5);}
 else if(T.sp===13){blob(T.x,T.y0+T.H*.6,T.z,R*1.3,T.H*.2,L[fi%3],PAL.lotus[fi%6],fi);}
 else if(T.sp===7){blob(T.x,T.y0+T.H*.95,T.z,R*.9,T.H*.08,L[fi%4],L[2],fi,.3);}
 else if(T.sp===6){blob(T.x,T.y0+T.H*.9,T.z,R*.85,T.H*.16,L[fi%4],L[2],fi);}
 else if(T.sp===4){blob(T.x,T.y0+T.H*.95,T.z,R*.95,T.H*.1,L[fi%4],L[2],fi,.5);}
 else if(T.sp===5){blob(T.x,T.y0+T.H*.7,T.z,R*.8,T.H*.5,L[fi%4],L[2],fi);}
 else if(T.sp===12){blob(T.x,T.y0+T.H*.85,T.z,R*1.1,T.H*.2,L[fi%4],L[2],fi);}
 else if(T.sp===14){blob(T.x,T.y0+T.H*.6,T.z,R*.9,T.H*.4,L[fi%3],L[2],fi);}
 else{blob(T.x,T.y0+T.H*.9,T.z,R*.9,T.H*.1,L[fi%4],L[2],fi);}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the reed beds
// The mat reed grows in pure beds, not as scattered tufts: a bed is a disc of
// 7-18 m on still shallow water or the saturated bank beside it, stems on a
// jittered ~1.35 m spacing, all of a height. Run after the trees (a bed keeps
// out of a trunk, not the other way round). Every bed is exported in
// NWBAY.REEDBEDS ({x,z,r,n,depth,h}) and registered, so a world can put a
// reed-cutters' camp, a drying rack or a reed-boat slip on the bank of one.
NWBAY.REEDBEDS=[];
NWBAY.buildReedBeds=function(R,q){reseed(570011);q=q==null?1:q;R=R||2400;
 const S=SP[15];const BEDS=NWBAY.REEDBEDS;BEDS.length=0;let stems=0;
 const spacing=S.bed.spacing,hc=S.leaf;
 BIO.grid(64,0,R,(x,z)=>{const Z=zones(x,z),h=Z.h;if(h<-1.4||h>1.0||Z.karst>.03)return 0;const ld=BIO.lodD(x,z);if(ld>1900)return 0;
   const still=1-Z.flow*.6,water=smooth(.3,-.4,h)*smooth(-1.4,-.8,h);
   return (Z.tidal*.55*still+Z.shore*.25*still+.35*water*Z.wet*still+Z.bank*.2*water)*q;},
  (cx,cy,cz)=>{const ld=BIO.lodD(cx,cz),lv=ld<950?2:(ld<1600?1:0),Rb=rr(S.bed.R[0],S.bed.R[1])*(lv===0?.8:1),sp=spacing*(lv===2?1:lv===1?1.7:2.6);
   const nH=rr(S.H[0],S.H[1]),bedCol=vary(pick(hc),.02,.06,.04);let n=0,dsum=0;
   const N=Math.ceil(Rb*2/sp);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const x=cx-Rb+(ix+rng())*sp,z=cz-Rb+(iz+rng())*sp,d=Math.hypot(x-cx,z-cz);if(d>Rb*(.85+.15*fbm(x*.3,z*.3,88,1)))continue;
    const y=Y(x,z);if(y<-1.4||y>1.1)continue;if(!BIO.clearOf(x,z,.6)||blocked(x,z,.8))continue;
    const h=nH*rr(.9,1.08)*(lv===0?1.35:1),w=h*(lv===2?.42:.6);
    BIO.put('matreed',[x,Math.max(y,-.05)-.05,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[w,h,w],bright(vary(bedCol,.015,.05,.04),1.3));n++;dsum+=Math.max(0,-y);}
   if(!n)return;stems+=n;const bed={x:cx,z:cz,r:Rb,n:n,depth:dsum/n,h:nH};BEDS.push(bed);
   if(lv===2&&typeof REGISTER==='function')REGISTER({name:'Mat-reed bed',kind:'stand',label:S.name,x:cx,z:cz,y:-1,r:Rb,h:nH+1});},
  {patch:.6,patchScale:.012,noMask:true,pad:.5});
 return{beds:BEDS.length,stems:stems};};

// ---------------------------------------------------------------- the pass
NWBAY.buildTrees=function(R,q){
 reseed(550021);q=q==null?1:q;R=R||2400;means();
 const st={trunk:0,limb:0,cups:0,far:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fans:0,epi:0,lianas:0,roots:0,whorls:0,heroes:0,fars:0,figsOnEdge:0,byS:SP.map(()=>0)};
 const TREES=NWBAY.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp,Z)=>{const S=SP[sp];return{x:x,z:z,y0:y-.5,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:Z.wet};};
 // one species pass: a jittered grid over the whole disc, the zone weight
 // as acceptance; the hero radius says where it becomes an impostor / stops.
 // opt.water:[lo,hi] lets a species stand in the shallows (past the host
 // mask); opt.prep(T) lets a species read its surroundings (the figs the
 // karst's edge, the cinder pines the wind).
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;const yr=opt.water||[.3,1e9];
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{const S=SP[sp];if(y<yr[0]||y>yr[1])return;
    if(sp!==8&&BIO.field('karst',x,z)>.02)return;   // nothing but a fig on the rock, and never on the rim band (a species past the mask could reach a sea stack's foot)
    if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);
    if(T.lv===0&&!opt.far)return;
    if(opt.prep&&opt.prep(T)===false)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+(opt.space||1)});n++;},{patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:1,noMask:!!opt.water});
  return n;}
 // the bay jungle canopy: prism gums to the ceiling, ironbarks in stands with them, fan-crowns under and among them, baobabs at its edge
 pass(0,104,(Z)=>Z.hyper*.85+Z.rain*.10*(1-Z.up),{hero:700,mid:1250,far:true,pad:9,patch:.3,space:6});
 pass(3,108,(Z)=>Z.hyper*.7+Z.rain*.30,{hero:700,mid:1250,far:true,pad:9,patch:.35,patchScale:.007,space:6});
 pass(2,62,(Z)=>Z.hyper*.6+Z.rain*.55+Z.hyper*Z.flow*.3+Z.top*.25,{hero:700,mid:1200,far:true,pad:5,patch:.45,space:3});
 pass(1,88,(Z)=>Z.hyper*.15+Z.rain*.25+Z.low*.3+Z.ridge*.42*(1-smooth(.75,1,Z.up)*.6),{hero:680,mid:1200,far:true,pad:7,patch:.55,patchScale:.006,space:6});
 // the CLIFF FIGS: on the stack tops, nearly all of them at the rim with the crown over the edge; a few inland on the top
 pass(8,52,(Z,x,z)=>{if(Z.top<.5)return 0;const E=karstEdge(x,z);return E?(E.d<26?1:.18):.12;},{hero:900,mid:1500,far:true,pad:4,patch:0,space:4,
  prep:T=>{const E=karstEdge(T.x,T.z);if(E&&E.d<26){T.out=E.out;T.edgeD=E.d;T.footY=E.footY;st.figsOnEdge++;}}});
 // the FLAME-CROWNS: the open lowland and the terraces, the jungle's edge, a few on the shore and the lower ridge
 pass(9,46,(Z)=>Z.low*.85+Z.rain*.12*smooth(.2,.35,Z.up)+Z.shore*.15+Z.ridge*.15*smooth(.6,.45,Z.up)+Z.bank*.3,{hero:600,mid:1100,far:true,pad:3,patch:.45,patchScale:.009,space:2});
 // the CINDER PINES: the lava fields and the headlands, leaning away from the sea
 pass(10,36,(Z)=>Z.cinder*.75,{hero:600,mid:1050,far:true,pad:2.5,lodK:.4,patch:.5,patchScale:.012,space:1.5,
  prep:T=>{const gx=BIO.field('salt',T.x+8,T.z)-BIO.field('salt',T.x-8,T.z),gz=BIO.field('salt',T.x,T.z+8)-BIO.field('salt',T.x,T.z-8),g=Math.hypot(gx,gz);
   if(g>.004)T.lee=[-gx/g,-gz/g];else{const a=rr(0,TAU);T.lee=[Math.cos(a),Math.sin(a)];}}});
 // the dry upper slopes and the headlands: dragon trees, umbrella thorns
 pass(6,40,(Z)=>Z.ridge*.45+Z.cinder*.2+Z.rain*.06*smooth(.35,.5,Z.up),{hero:520,mid:950,far:true,pad:2,lodK:.6,patch:.45,space:1});
 pass(7,40,(Z)=>Z.ridge*.5*(1-smooth(.8,1,Z.up)*.5)+Z.low*.12,{hero:600,mid:1050,far:true,pad:2.5,lodK:.4,patch:.5,patchScale:.007,space:1.5});
 // the understorey trees: tree ferns up the slope, along the river and on the karst tops; splay shrubs in the jungle, on the shore and the tops
 pass(4,34,(Z)=>Z.rain*.55+Z.hyper*.35+Z.flow*.2*(Z.rain+Z.hyper)+Z.top*.6,{hero:520,mid:950,far:true,pad:2.5,lodK:.6,space:1});
 pass(5,30,(Z)=>Z.hyper*.5+Z.rain*.35+Z.shore*.5+Z.top*.5,{hero:560,mid:1000,far:true,pad:1.5,lodK:.7,space:.5});
 // the semi-aquatic fringe: mangroves in the brackish shallows, pandans on the shore and the tidal rim,
 // lotus trumpets on the banks of the terrace reach and the delta, pipe reeds in beds along the water
 pass(11,22,(Z)=>Z.tidal*.95,{hero:600,mid:1100,far:true,pad:1.5,patch:.5,patchScale:.012,space:1,water:[-1.7,.6]});
 pass(12,26,(Z)=>Z.shore*.5+Z.tidal*.5*smooth(-.4,.3,Z.h),{hero:520,mid:950,far:true,pad:1,lodK:.6,patch:.5,patchScale:.015,space:.5,water:[-.4,1e9]});
 pass(13,42,(Z)=>Z.bank*.7*smooth(.2,.5,Z.wet)+Z.shore*Z.flow*.4,{hero:600,mid:1100,far:true,pad:2.5,lodK:.5,patch:.5,patchScale:.011,space:1.5});
 pass(14,22,(Z)=>(Z.flow*.6*smooth(.7,.92,Z.wet)+Z.tidal*.35*smooth(-.4,.2,Z.h)+Z.shore*.2*smooth(.8,.95,Z.wet))*smooth(2.5,.5,Z.h),{hero:520,mid:900,far:true,pad:.8,lodK:.7,patch:.7,patchScale:.02,space:.3,water:[-.4,1e9]});
 // build
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,blooms:st.blooms,pods:st.pods,fronds:st.fronds,fans:st.fans,epiphytes:st.epi,lianas:st.lianas,roots:st.roots,whorls:st.whorls,figsOnEdge:st.figsOnEdge,
  tris:{trunk:st.trunk,limbs:st.limb,cups:st.cups,far:st.far,small:st.sapTris}};};
NWBAY._canopyH=function(x,z){let h=0;for(const T of NWBAY.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||12;};
})();
