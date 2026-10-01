// ================================================================= SOUTHWEST BAY — trees
// The nine tree species of the bay, each with its own builder, placed by
// zone from the host's climate fields (wet / salt / upland / flow) and
// terrainH. The zone weights are computed HERE from those fields, never from
// the host's map: a world that binds the same fields gets the same zoning.
// Beyond the LOD spine the canopy species become blob impostors in the 'far'
// bucket (the hyperjungle's technique); the small species thin out with
// distance and stop. Every count scales with q; the core charges BIO.cur.
// RUNTIME LOD (the core's, as xanadu and swlowlands use it): a hero tree is drawn in full
// while the camera is within SWBAY.LOD.tree of its chunk (BIO.LOD.chunk, 1200 m) and as a
// lite stand-in impostor past that; a far tree is only ever its impostor.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=SWBAY.SPECIES,PAL=SWBAY.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWBAY.TREES=[];
// the runtime LOD ranges (metres from the camera to a chunk's box; BIO.LOD.scale multiplies them):
// hero trees in full, the floor's near / mid / far bands, the reeds in the shallows, fallen logs,
// the dressing on a world's structures. Equal ranges share a mesh per item per chunk (the passes
// use many of the same items), so they are kept to two values: each distinct one is a draw call
// per item per chunk in view.
SWBAY.LOD={tree:1200,floor:800,floorMid:1200,farFloor:1200,reeds:800,logs:1200,dress:1200};

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. A plant's aridity tag is honoured by which weight it reads:
// 'semiarid' species read sav (the highlands), 'humid' ones hyper / rain / shore.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),h=Y(x,z),land=smooth(.15,1.2,h);
 return{up,wet,salt,flow,h,
  hyper:smooth(.30,.09,up)*smooth(.55,.80,wet)*land,                     // the tall jungle ringing the bay
  rain:smooth(.08,.26,up)*smooth(.64,.42,up)*smooth(.35,.6,wet)*land,   // the rainforest on the slope
  sav:smooth(.42,.62,up),                                              // the parasol savannah, quickly, above it
  shore:smooth(2.4,.5,h)*smooth(.14,.03,up)*smooth(.5,.8,wet)*land};}   // the beach and the delta
SWBAY.zones=zones;

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
function means(){if(MEAN)return MEAN;MEAN={bark:SWBAY.BARKTEX.map(t=>texMean(t)),cap:texMean(SWBAY.CAPTEX),gill:texMean(SWBAY.GILLTEX),wood:texMean(SWBAY.WOODTEX),rock:texMean(SWBAY.ROCKTEX)};return MEAN;}
SWBAY.means=means;SWBAY.tint=tint;SWBAY.bright=bright;SWBAY.shade=shade;SWBAY.vary=vary;
const barkCol=(S,k)=>tint(S.bark[k%S.bark.length],means().bark[S.barkK]);
// an untextured rod / lobe in a species' bark colour: the designer's colour, a shade down
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.25);
const leafCol=(S,k)=>bright(vary(pick(S.leaf),.03,.10,.06),k==null?1.3:k);
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
SWBAY.blocked=blocked;

// ---------------------------------------------------------------- epiphytes
// Red and purple, on every bole and bough in proportion to the wet field:
// bromeliad rosettes clinging to the bark (their axis tilted outward), fleshy
// hanging chains with a flower spike under the boughs, blooms in the axils.
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
 // the boughs: long, near level, drooping at the tips; two or three secondaries each
 const spots=[],nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU),boughs=[];
 for(let k=0;k<nB;k++){const u=mix(.55,.88,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(.15,.45),len=T.crownR*rr(.7,1.05),r0=clamp(rAt(u)*.45,.4,1.8);
  const o={x:T.x+Math.cos(a)*rAt(u)*.7,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.7},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.2,5,-.13,.06);
  if(!okPts(pts,2))continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,(k+ti)%6),{seg:r0>1?7:5,cap:true});boughs.push(pts);
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,.9);epiBough(pts[3],T.wet,st,lv,.6);beardsAt(pts[2],T.wet,.8,st);}
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
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.spread,h:T.H});};
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
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.spread,h:T.H});};
// 2 the cap-tree: a giant mushroom -- a pale stipe with an annulus skirt, a domed cap with cream warts, gills under it
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%4,capR=T.crownR,m=means();
 const rAt=u=>rb*(1-.25*u)*(1+.6*Math.exp(-u*H/5))*(1+.08*Math.sin(u*9+ti));
 const stipeC=k=>tint(vary(PAL.stipe[(k+ti)%PAL.stipe.length],.01,.05,.04),m.bark[5]);
 const capC=T.capCol||(T.capCol=vary(pick(T.sav>.5?PAL.capSav:PAL.cap),.02,.08,.05));
 const rings=[],vs=8,skirtU=rr(.58,.7);
 for(let yy=0;yy<H*.8;yy+=(yy<6?1.5:vs*.5)){const u=yy/H;let r=rAt(u);
  if(Math.abs(u-skirtU)<.03)r*=1+.5*(1-Math.abs(u-skirtU)/.03);   // the annulus: a skirt of flesh round the stem
  rings.push({x:T.x,y:T.y0+yy,z:T.z,r:r,yy:yy,col:stipeC(Math.floor(yy/9)).lerp(C(PAL.moss[ti%3]),smooth(5,0,yy)*.4)});}
 rings.push({x:T.x,y:T.y0+H*.8,z:T.z,r:rAt(.8)*.9,yy:H*.8,col:stipeC(1)},{x:T.x,y:T.y0+H*.8+1,z:T.z,r:.05,yy:H*.8+1,col:stipeC(1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe('bark5',rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.04*Math.sin(4*ang+ph)+.02*Math.sin(9*ang+R.yy*.2)),null);
 // the cap: a dome from the rim (u .78, curled a little under) to the crown, lighter toward the top
 const cap=(y0,R,rim,seg,col)=>{const cr=[],n=lv===2?9:6;
  cr.push({x:T.x,y:y0-rim*.35,z:T.z,r:R*.94,yy:0,col:shade(col,-.12)});
  for(let i=0;i<=n;i++){const t=i/n,r=R*Math.sqrt(Math.max(0,1-t*t))*(1+.02*Math.sin(t*7+ti)),y=y0+R*.42*t*(1+.15*(1-t));
   cr.push({x:T.x,y:y,z:T.z,r:i===n?.05:r,yy:t*R*.6+rim,col:col.clone().lerp(C(PAL.capWart[0]),t*.18)});}
  st.cap+=BIO.lathe('cap',cr,seg,Math.max(2,Math.round(TAU*R/12)),8,(Rg,ang)=>Rg.r*(1+.035*Math.sin(7*ang+ph)+.02*Math.sin(13*ang+Rg.yy)),null);
  // the gills: a shallow inverted cone from the rim in to the stem, the radial texture wrapped round
  const rI=Math.max(rAt(.8)*1.05,R*.12),yI=y0-rim*.35-R*.14;
  const gr=[{x:T.x,y:y0-rim*.35,z:T.z,r:R*.94,yy:0,col:tint(PAL.gill[ti%3],m.gill,1.05)},{x:T.x,y:yI,z:T.z,r:rI,yy:R*.5,col:tint(PAL.gill[(ti+1)%3],m.gill,.85)},{x:T.x,y:yI-.6,z:T.z,r:rI*1.12,yy:R*.55,col:tint(PAL.gill[(ti+1)%3],m.gill,.7)},{x:T.x,y:yI-1.6,z:T.z,r:rI*.92,yy:R*.6,col:tint(PAL.gill[(ti+1)%3],m.gill,.7)}];   // a collar of flesh at the stem
  st.cap+=BIO.lathe('gill',gr,seg,Math.max(2,Math.round(R/3.5)),R,(Rg,ang)=>Rg.r,null);
  return y0+R*.42;};
 const capTop=cap(T.y0+H*.78,capR,2.2,lv===2?18:11,tint(capC,m.cap,1.0));
 if(lv===2&&rng()<.3){const u2=rr(.36,.5);cap(T.y0+H*u2,capR*rr(.35,.5),1.2,10,tint(shade(capC,.1),m.cap,1.0));st.tiers++;}   // a tiered one: a shelf lower down the stem
 // epiphytes hanging off the rim, moss and a ring of mushrooms at the foot
 if(lv>=1){for(let i=0,n=lv===2?ri(2,6):2;i<n;i++){const a=rr(0,TAU);BIO.put('epihang',[T.x+Math.cos(a)*capR*.9,T.y0+H*.78-.6,T.z+Math.sin(a)*capR*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1,2),rr(3,8),1],bright(vary(pick(PAL.epi),.02,.1,.06),1.15));st.epi++;}}
 if(lv===2){for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),d=rb*rr(1.3,3),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z),h=rr(.6,1.6);if(y<.3)continue;
   BIO.put('shroom',[x,y-.05,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*1.1,h,h*1.1],bright(vary(capC,.03,.08,.08),1.15));st.shrooms++;}
  for(let i=0,n=ri(1,3);i<n;i++){const a=rr(0,TAU),R=rAt(.02)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+rr(.5,3),T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(0,.3),Math.sin(a)]),rr(1,2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 T.spread=capR;
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:capR,h:T.H});};
// 3 the fan-crown: a pale bole, a few thick boughs rising steeply, each opening into a splayed fan of huge paddle fronds
B[3]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3;
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
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,1.0);epiBough(pts[3],T.wet,st,lv,.7);beardsAt(pts[3],T.wet,.7,st);}}
 tips.push({p:{x:T.x,y:T.y0+H*.63,z:T.z},a:a0+.5,top:true});
 const nF=lv===2?ri(S.fans[0],S.fans[1]):lv===1?5:3,L=T.crownR*rr(.5,.75);
 tips.forEach(t=>{fanAt(t.p.x,t.p.y+.3,t.p.z,t.a,t.top?Math.PI:rr(.9,1.4),t.top?nF+2:nF,L*(t.top?.9:1),.55,-.25,col);st.fans+=nF;
  if(lv===2){fanAt(t.p.x,t.p.y+.8,t.p.z,t.a+rr(-.3,.3),.6,3,L*.6,1.0,.7,shade(col,.1));   // young fronds standing up in the middle
   if(rng()<.6)BIO.put('paddle',[t.p.x,t.p.y-.4,t.p.z],qEuler(0,-t.a-rr(-1,1),-1.1),[L*.7,L*.7,L*.5],bright(0x7a6a3a,1.1));}});   // a dead one hanging
 let spread=T.crownR;tips.forEach(t=>{spread=Math.max(spread,Math.hypot(t.p.x-T.x,t.p.z-T.z)+L);});T.spread=spread;
 epiBole(T,rAt,st,lv,1.8,.1,.55);
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.spread,h:T.H});};
// 4 the umbrella monkey puzzle: a long straight scaly bole, a PARASOL on top -- seven to ten long near-level
// branches curving up into a rim, their foliage a flat disc -- and a sparse drooping whorl or two well below it
B[4]=function(T,st,lv){const S=SP[T.sp],fam='bark4',H=T.H,rb=T.rb,ti=T.seed%3,rc=rodCol(S,T.seed);
 const rAt=u=>rb*(1-.62*u)*(1+.5*Math.exp(-u*H/4));
 const rings=[],vs=6;for(let yy=0;yy<H*.97;yy+=vs*.5)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/14)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.97+.5,z:T.z,r:.04,yy:H*.97+.5,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?9:6,Math.max(1,Math.round(TAU*rb/2.5)),vs,(R,ang)=>R.r,null);
 const hc=C(pick(S.leaf)),R=T.crownR,uTop=rr(.86,.91),yT=T.y0+H*uTop,cy=yT+R*.12,ex=R,ey=Math.max(4,R*.35),sz0=clamp(R*.32,2,4.2);
 // the parasol
 const nb=lv===2?ri(11,15):8,a0=rr(0,TAU),r0=clamp(rAt(uTop)*.5,.14,.55);
 for(let k=0;k<nb;k++){const a=a0+k/nb*TAU+rr(-.1,.1),len=R*rr(.92,1.08),o=[T.x+Math.cos(a)*rAt(uTop)*.5,yT+rr(-.3,.3),T.z+Math.sin(a)*rAt(uTop)*.5];
  const mid=[o[0]+Math.cos(a)*len*.55,o[1]+len*.03,o[2]+Math.sin(a)*len*.55],end=[o[0]+Math.cos(a)*len,o[1]+len*.24,o[2]+Math.sin(a)*len];   // level, then curving up into the rim
  if(!clear3(end[0],end[1],end[2],3,3))continue;
  BIO.beam('rod',o,mid,r0,r0*.65,rc);BIO.beam('rod',mid,end,r0*.65,r0*.22,rc);st.limb+=2*BIO.defs.rod.tris;
  for(let c=0,m=lv===2?4:3;c<m;c++){const f=mix(.4,1,c/(m-1)),x=mix(o[0],end[0],f)+rr(-.4,.4),z=mix(o[2],end[2],f)+rr(-.4,.4),y=(f<.55?mix(o[1],mid[1],f/.55):mix(mid[1],end[1],(f-.55)/.45))+rr(.2,.8);
   clumpAt('puzzle',x,y,z,sz0*rr(.85,1.15)*(f>.9?1.3:1),.3,hc,T.x,cy,T.z,ex,ey);st.clumps++;}}
 // fill between the branches so the top reads as one flat disc; a short leader spike in the middle
 if(lv>=1)for(let c=0,m=lv===2?Math.round(nb*1.3):nb;c<m;c++){const a=rr(0,TAU),d=R*rr(.35,.92),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=yT+d/R*R*.2+rr(.1,.7);
  if(!clear3(x,y,z,sz0*.5,sz0*.3))continue;clumpAt('puzzle',x,y,z,sz0*rr(.8,1.1),.28,hc,T.x,cy,T.z,ex,ey);st.clumps++;}
 BIO.beam('rod',[T.x,yT-.5,T.z],[T.x,T.y0+H*.99,T.z],rAt(uTop)*.6,.1,rc);clumpAt('puzzle',T.x,T.y0+H*.99,T.z,sz0*1.1,.5,hc,T.x,cy,T.z,ex,ey);st.clumps++;
 // a sparse drooping whorl or two well below the parasol, and dead stubs under those
 const nT=lv===2?ri(2,3):1;
 for(let t=0;t<nT;t++){const u=mix(.52,.76,(t+rr(.1,.9))/nT),nb2=lv===2?ri(6,8):4,a1=rr(0,TAU),len=R*rr(.35,.55),r1=clamp(rAt(u)*.4,.12,.45);
  for(let k=0;k<nb2;k++){const a=a1+k/nb2*TAU+rr(-.2,.2),o=[T.x+Math.cos(a)*rAt(u)*.5,T.y0+H*u,T.z+Math.sin(a)*rAt(u)*.5],end=[o[0]+Math.cos(a)*len,o[1]-len*.12+len*.1,o[2]+Math.sin(a)*len];
   BIO.beam('rod',o,end,r1,r1*.3,rc);st.limb+=BIO.defs.rod.tris;if(rng()<.7){clumpAt('puzzle',end[0],end[1]+.3,end[2],sz0*rr(.7,.95),.4,hc,T.x,cy,T.z,ex,ey);st.clumps++;}}}
 if(lv===2)for(let k=0,m=ri(2,5);k<m;k++){const u=rr(.28,.5),a=rr(0,TAU),L=R*rr(.15,.35);BIO.beam('rod',[T.x,T.y0+H*u,T.z],[T.x+Math.cos(a)*L,T.y0+H*u-L*.3,T.z+Math.sin(a)*L],rAt(u)*.3,.06,shade(rc,-.2));}
 if(typeof REGISTER==='function'&&lv===2)REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:R,h:T.H});};
// 5 the dragon tree: a fat pale trunk forking twice, every fork tip a dense head of stiff blue-green leaves, the whole a flat umbrella
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hc=C(pick(S.leaf)),cy=T.y0+H*.95,heads=[];
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
// 6 the parasol mushroom: a thin stalk and a flat cap on the savannah, the odd ring of young ones round it
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,capR=T.crownR,col=T.capCol||(T.capCol=vary(pick(PAL.capSav),.02,.08,.05));
 BIO.put('parasol',[T.x,T.y0+.3,T.z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[capR*2,H,capR*2],bright(col,1.1));st.sapTris+=BIO.defs.parasol.tris;st.parasols++;
 if(lv>=1)for(let k=0,m=lv===2?ri(2,5):2;k<m;k++){const a=rr(0,TAU),d=rr(capR*.6,capR*1.6),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z),h=rr(1,3.5);if(y<.3||!BIO.clearOf(x,z,.5))continue;
  BIO.put('parasol',[x,y+.2,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h*.9,h,h*.9],bright(vary(col,.02,.06,.06),1.1));st.parasols++;}
 if(lv===2&&rng()<.5)for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU),d=rr(1,3),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=rr(.3,.9);BIO.put('shroom',[x,Y(x,z)-.05,z],qEuler(0,rr(0,TAU),0),[h,h,h],bright(vary(col,.03,.08,.06),1.1));st.shrooms++;}};
// 7 the crown fern: a fibrous trunk and a great radiating crown of fronds, dead fronds hanging under it
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?8:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('bigfrond',tx,ty,tz,Rf,n,-.12,.22,bright(hc,1.5),1.25);
 if(lv>=1){frondCrown('bigfrond',tx,ty+.5,tz,Rf*.62,lv===2?5:3,.55,1.1,bright(shade(hc,.1),1.5),1.1);
  for(let k=0,m=lv===2?ri(3,6):2;k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*rb*.9,ty-.6,tz+Math.sin(a)*rb*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.2,2),Rf*rr(.5,.8),1],bright(vary(0x6a5a3a,.02,.1,.06),1.1));}
  if(rng()<.5*T.wet){const a=rr(0,TAU),s=rr(.8,1.4);BIO.put('epi',[tx+Math.cos(a)*rb,ty-H*rr(.2,.5),tz+Math.sin(a)*rb],qUp([Math.cos(a)*.8,.6,Math.sin(a)*.8]),[s,s*.8,s],epiCol());st.epi++;}}
 st.fronds+=n;};
// 8 the splay shrub: a stub of a trunk and a splayed rosette of huge upright paddle fronds, a traveller's palm in a fan
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 BIO.put('trunk',[T.x,T.y0-.3,T.z],qUp([rr(-.06,.06),1,rr(-.06,.06)]),[rb/.4*1.2,H*.45+.3,rb/.4*1.2],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const ty=T.y0+H*.45,n=lv===2?ri(S.fans[0],S.fans[1]):lv===1?6:4,hc=C(pick(S.leaf)),a0=rr(0,TAU),flat=rng()<.5,L=T.crownR;
 for(let k=0;k<n;k++){const a=flat?a0+(k/(n-1)-.5)*2.2+(k%2?Math.PI:0):a0+k/n*TAU+rr(-.2,.2),pitch=rr(.35,.95)*(1-.35*(k%3===0?1:0));
  BIO.put('paddle',[T.x+Math.cos(a)*rb*.5,ty+rr(-.2,.2),T.z+Math.sin(a)*rb*.5],qEuler(rr(-.06,.06),-a,pitch),[L*rr(.85,1.1),L*rr(.85,1.05),L*rr(.75,.95)],bright(vary(hc,.02,.06,.05),rr(1.0,1.25)));}
 if(lv===2){for(let k=0;k<2;k++){const a=a0+k*2.6;BIO.put('paddle',[T.x,ty-.2,T.z],qEuler(0,-a,-.35),[L*.8,L*.8,L*.6],bright(vary(0x8a7a3a,.02,.06,.05),1.05));}   // old fronds drooping
  if(rng()<.5){const col=bloomCol();for(let b=0,m=ri(3,6);b<m;b++)BIO.put('bloom',[T.x+rr(-.6,.6),ty+rr(.3,1.2),T.z+rr(-.6,.6)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.25,.45),col);st.blooms++;}}
 st.fans+=n;};
// 9 the ironbark (the hyperjungle's, scaled to the ceiling): a fluted, buttressed bole in furrowed red-brown bark,
// surface roots off every buttress, level tiers of boughs with drooping tips, a top tuft, combed needle sprays
B[9]=function(T,st,lv){const S=SP[T.sp],fam='bark6',H=T.H,rb=T.rb,ti=T.seed%3;
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
  if(lv>=1){epiBough(pts[2],T.wet,st,lv,.8);beardsAt(pts[3],T.wet,.8,st);}
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
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.spread,h:T.H});};
// 10 the bracket tree: a dark dead-looking bole carrying tiers of huge half-disc shelf fungi, a few leaves left at the top
B[10]=function(T,st,lv){const S=SP[T.sp],fam='bark1',H=T.H,rb=T.rb,ti=T.seed%3,m=means();
 const rAt=u=>rb*(1-.5*u)*(1+.7*Math.exp(-u*H/4));
 const rings=[],vs=6;for(let yy=0;yy<H;yy+=vs*.7)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/10)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(6,0,yy)*.5)});
 rings.push({x:T.x,y:T.y0+H+.6,z:T.z,r:.04,yy:H+.6,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?8:6,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+.05*Math.sin(5*ang+R.yy*.3)),null);
 const shelfC=vary(pick(PAL.shelf),.02,.08,.05),under=tint(pick(PAL.shelfUnder),m.cap,1.0);
 const nS=lv===2?ri(S.shelves[0],S.shelves[1]):3,a0=rr(0,TAU);
 for(let k=0;k<nS;k++){const u=mix(.22,.93,(k+rr(.1,.9))/nS),y=T.y0+H*u,rT=rAt(u)*1.02,R=T.crownR*mix(1,.55,u)*rr(.8,1.15),a=a0+k*GOLD+rr(-.4,.4);
  const top=tint(shade(shelfC,(k%2?.12:-.05)),m.cap,1.0),rim=tint(shade(shelfC,.3),m.cap,1.0);
  const sr=[{x:T.x,y:y-.2,z:T.z,r:rT,yy:0,col:under},{x:T.x,y:y-.3,z:T.z,r:R*.7,yy:.8,col:under},{x:T.x,y:y-.08,z:T.z,r:R,yy:1.6,col:rim},{x:T.x,y:y+.3,z:T.z,r:R*.82,yy:2.4,col:top},{x:T.x,y:y+.55,z:T.z,r:R*.42,yy:3.2,col:top},{x:T.x,y:y+.62,z:T.z,r:rT,yy:3.6,col:top}];
  const sd=T.seed+k;st.cap+=BIO.lathe('shelf',sr,lv===2?12:8,Math.max(2,Math.round(R/2)),2,(Rg,ang)=>{const kk=smooth(-.2,.3,Math.cos(ang-a));return rT*.96+(Rg.r-rT*.96)*kk*(1+.06*Math.sin(ang*9+sd));/* the back half sits just inside the trunk */},null);st.shelves++;
  if(lv===2&&rng()<.5){BIO.put('epihang',[T.x+Math.cos(a)*R*.8,y-.35,T.z+Math.sin(a)*R*.8],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.8,1.4),rr(1.5,4),1],bright(vary(pick(PAL.epi),.02,.1,.06),1.15));st.epi++;}}
 // what is left of the crown: a few dark leaves, and a broken top
 const hc=C(pick(PAL.shrub)),cy=T.y0+H,n=lv===2?ri(2,5):2;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(.5,3);BIO.beam('rod',[T.x,T.y0+H*rr(.8,.97),T.z],[T.x+Math.cos(a)*d*1.6,T.y0+H*rr(.85,1.02),T.z+Math.sin(a)*d*1.6],rb*.25,.08,rodCol(S,k));
  clumpAt('ucard',T.x+Math.cos(a)*d*1.6,T.y0+H*.95,T.z+Math.sin(a)*d*1.6,rr(2,3.5),.6,hc,T.x,cy,T.z,4,4);st.clumps++;}
 if(lv===2){for(let i=0,q=ri(2,5);i<q;i++){const a=rr(0,TAU),d=rb*rr(1.3,2.6),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z),h=rr(.4,1);if(y<.3)continue;
   BIO.put('shroom',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[h,h,h],bright(vary(shelfC,.03,.08,.08),1.1));st.shrooms++;}
  BIO.put('mossmat',[T.x+rb,T.y0+rr(.5,2),T.z],qUp([1,.2,0]),rr(1,1.8),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}
 if(typeof REGISTER==='function'&&lv===2)REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H});};
// 11 the coral fungus: a shrub of forking fleshy branches in orange, pink and violet, paler at the tips
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,base=vary(pick(PAL.coral),.02,.08,.05),tipC=shade(base,.35),depthMax=2;
 function branch(o,a,el,len,r,depth){const e=[o[0]+Math.cos(a)*Math.cos(el)*len,o[1]+Math.sin(el)*len,o[2]+Math.sin(a)*Math.cos(el)*len];
  BIO.beam('rod',o,e,r,r*.7,bright(base.clone().lerp(tipC,depth/depthMax),1.05));st.sapTris+=BIO.defs.rod.tris;
  if(depth<depthMax){const n=ri(2,3),a2=rr(0,TAU);for(let k=0;k<n;k++)branch(e,a2+k/n*TAU+rr(-.4,.4),clamp(el+rr(-.35,.25),.3,1.45),len*rr(.55,.75),r*.68,depth+1);}
  else if(lv===2&&rng()<.5)BIO.put('lobe',[e[0],e[1]-.05,e[2]],qEuler(0,rr(0,TAU),0),[r*2.2,r*1.6,r*2.2],bright(tipC,1.1));}
 const n=ri(3,6),a0=rr(0,TAU);for(let k=0;k<n;k++)branch([T.x+rr(-.3,.3),T.y0+.2,T.z+rr(-.3,.3)],a0+k/n*TAU+rr(-.3,.3),rr(.85,1.35),H*rr(.32,.42),rb,0);
 st.corals++;};
// 12 the umbrella thorn: a short gnarled trunk, crooked boughs rising and then flattening out, one wide flat crown of fine leaflets
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hc=C(pick(S.leaf)),R=T.crownR,top=T.y0+H,spots=[];
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
 if(typeof REGISTER==='function'&&lv===2)REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:R,h:T.H});};
// ---------------------------------------------------------------- impostors (the far canopy)
// lite: the stand-in behind a hero tree (seen only past SWBAY.LOD.tree, 1.2-2.9 km): the cheap
// blob count in 20-triangle blobs (a prism gum's 15 m blob is ~25 px across at 1.2 km) on a
// one-band bole (no flare). The prism gum's underside is greener than its far
// impostor's: from a low camera the sides show, and the hero's crown reads green with purple in
// it, not purple. It draws no random numbers (a cap's colour is the hero's T.capCol), so every
// hero built after it is unchanged.
let ICO=null,ICO0=null;
function buildFar(T,fi,st,lite){const K=BIO.bucket('far');if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}
 const ip=lite?ICO0:ICO;
 const S=SP[T.sp],cheap=lite||BIO.lodD(T.x,T.z)>2000,tiny=(T.sp>=5&&T.sp<=8)||T.sp>=10;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd,under){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m*(under&&dy<0?under:1),z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=(T.sp===2?tint(PAL.stipe[fi%4],[1,1,1],.8):C(S.bark[fi%S.bark.length])).convertSRGBToLinear(),seg=tiny?3:cheap?4:6,top=T.y0+T.H*[.88,.9,.8,.62,.95,.5,.9,.9,.4,.92,.9,.3,.5][T.sp],rings=[];
 (lite?[0,1]:[0,.06,.5,1]).forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(T.sp===6?.15:.5,T.rb*(1-.5*u)*(u<.08?1.6:1)*(T.sp===1&&u<.6?1.3:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*(r2/rings.length);
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=S.leaf.map(h=>bright(h,.85)),R=T.crownR,a0=(T.seed%628)/100;
 if(T.sp===0){const L2=S.leaf2.map(h=>bright(lite?C(h).lerp(C(S.leaf[0]),.6):h,.85));blob(T.x,T.y0+T.H*.88,T.z,R*.6,T.H*.1,L[fi%2],L2[fi%2],fi);
  for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.55,T.y0+T.H*.78+((k*7)%5),T.z+Math.sin(a)*R*.55,R*.45,T.H*.07,L[(k+fi)%2],L2[(k+1)%2],fi+k);}}
 else if(T.sp===1){for(let k=0;k<3;k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.42,T.y0+T.H*.93+((k*11)%7),T.z+Math.sin(a)*R*.42,R*.52,T.H*.09,L[k%3],L[2],fi+k);}}
 else if(T.sp===2){const cc=T.capCol||(T.capCol=vary(pick(PAL.cap),.02,.08,.05));blob(T.x,T.y0+T.H*.84,T.z,R*.98,T.H*.14,cc,shade(cc,-.35),fi,.35);}
 else if(T.sp===3){for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.5,T.y0+T.H*.7+((k*5)%4),T.z+Math.sin(a)*R*.5,R*.5,T.H*.09,L[(k+fi)%4],L[2],fi+k);}}
 else if(T.sp===9){for(let k=0;k<(cheap?3:4);k++){const t=k/3;blob(T.x+Math.sin(k*2.4+a0)*R*.06,mix(T.y0+T.H*.55,T.y0+T.H*.94,t),T.z+Math.cos(k*2.4+a0)*R*.06,R*mix(.8,.22,t),T.H*.07,L[(k+fi)%4],L[2],fi+k);}}
 else if(T.sp===4){blob(T.x,T.y0+T.H*.92,T.z,R*.95,T.H*.05,L[fi%4],L[2],fi,.3);}
 else if(T.sp===12){blob(T.x,T.y0+T.H*.95,T.z,R*.9,T.H*.08,L[fi%4],L[2],fi,.3);}
 else if(T.sp===6){const cc=T.capCol||(T.capCol=vary(pick(PAL.capSav),.02,.08,.05));blob(T.x,T.y0+T.H*.94,T.z,R*.98,T.H*.06,cc,shade(cc,-.3),fi,.3);}
 else if(T.sp===5){blob(T.x,T.y0+T.H*.9,T.z,R*.85,T.H*.16,L[fi%4],L[2],fi);}
 else if(T.sp===7){blob(T.x,T.y0+T.H*.95,T.z,R*.95,T.H*.1,L[fi%4],L[2],fi,.5);}
 else if(T.sp===8){blob(T.x,T.y0+T.H*.7,T.z,R*.8,T.H*.5,L[fi%4],L[2],fi);}
 else if(T.sp===11){blob(T.x,T.y0+T.H*.55,T.z,R*.9,T.H*.5,L[fi%4],shade(L[(fi+1)%4],.3),fi);}
 else if(T.sp===10){for(let k=0;k<(lite?1:2);k++)blob(T.x,T.y0+T.H*(.45+k*.35),T.z,R*.8,T.H*.04,L[(fi+k)%4],shade(L[2],-.3),fi+k,.3);}
 else{blob(T.x,T.y0+T.H*.9,T.z,R*.9,T.H*.1,L[fi%4],L[2],fi);}
 {const kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);}   // written raw, so the impostor's triangles carry the tree's lod key here
 K.tris+=tris;BIO.tally(tris,0,0);if(lite)st.lite+=tris;else st.far+=tris;}

// ---------------------------------------------------------------- the pass
SWBAY.buildTrees=function(R,q){
 reseed(550021);q=q==null?1:q;R=R||2400;means();
 const st={trunk:0,limb:0,cap:0,far:0,lite:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fans:0,epi:0,shrooms:0,parasols:0,tiers:0,roots:0,shelves:0,corals:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=SWBAY.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp,Z)=>{const S=SP[sp];return{x:x,z:z,y0:y-.5,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:Z.wet,sav:Z.sav};};
 // one species pass: a jittered grid over the whole disc, the zone weight
 // as acceptance; the hero radius says where it becomes an impostor / stops
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{const S=SP[sp];if(y<.3)return;
    if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);
    if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+(opt.space||1)});n++;},{patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:1});
  return n;}
 // the bay jungle canopy: prism gums to the temple height, cap-trees and fan-crowns under and among them, baobabs at its edge
 pass(0,104,(Z)=>Z.hyper*.85+Z.rain*.10*(1-Z.up),{hero:700,mid:1250,far:true,pad:9,patch:.3,space:6});
 pass(9,108,(Z)=>Z.hyper*.7+Z.rain*.30,{hero:700,mid:1250,far:true,pad:9,patch:.35,patchScale:.007,space:6});
 pass(2,70,(Z)=>Z.hyper*.7+Z.rain*.45,{hero:700,mid:1200,far:true,pad:6,patch:.45,space:4});
 pass(3,62,(Z)=>Z.hyper*.6+Z.rain*.55+Z.hyper*Z.flow*.3,{hero:700,mid:1200,far:true,pad:5,patch:.45,space:3});
 // the baobabs: at the jungle's edge, and in stands and avenues across the savannah (the image at the top of the brief)
 pass(1,88,(Z)=>Z.hyper*.2+Z.rain*.28+Z.sav*.42*(1-smooth(.75,1,Z.up)*.6),{hero:680,mid:1200,far:true,pad:7,patch:.55,patchScale:.006,space:6});
 // the savannah: monkey puzzles in stands, dragon trees, parasol mushrooms
 pass(4,52,(Z)=>Z.sav*.55*(1-Z.up*.3)+Z.rain*.25*smooth(.3,.5,Z.up),{hero:600,mid:1050,far:true,pad:3,patch:.5,patchScale:.008,space:2});
 pass(5,40,(Z)=>Z.sav*.5+Z.rain*.08*smooth(.35,.5,Z.up),{hero:520,mid:950,far:true,pad:2,lodK:.6,patch:.45,space:1});
 pass(12,40,(Z)=>Z.sav*.5*(1-smooth(.8,1,Z.up)*.5)+Z.rain*.06*smooth(.4,.55,Z.up),{hero:600,mid:1050,far:true,pad:2.5,lodK:.4,patch:.5,patchScale:.007,space:1.5});
 pass(6,34,(Z)=>Z.sav*.55+Z.rain*.12,{hero:520,mid:950,far:true,pad:1.5,lodK:.7,patch:.55,patchScale:.012,space:.5});
 // the understorey trees: tree ferns up the slope and along the river, splay shrubs in the jungle and on the shore
 pass(7,34,(Z)=>Z.rain*.55+Z.hyper*.35+Z.flow*.2*(Z.rain+Z.hyper),{hero:520,mid:950,far:true,pad:2.5,lodK:.6,space:1});
 pass(8,30,(Z)=>Z.hyper*.5+Z.rain*.35+Z.shore*.6,{hero:560,mid:1000,far:true,pad:1.5,lodK:.7,space:.5});
 // the fungoid understorey: bracket trees on the wet slope, coral fungus in the jungle's shade
 pass(10,58,(Z)=>Z.hyper*.4+Z.rain*.5+Z.flow*.2*(Z.rain+Z.hyper),{hero:580,mid:1000,far:true,pad:3,lodK:.6,patch:.5});
 pass(11,40,(Z)=>Z.hyper*.45+Z.rain*.3+Z.shore*.2,{hero:520,mid:900,far:true,pad:1,lodK:.8,patch:.6,patchScale:.012,space:.4});
 // build
 // runtime LOD: a hero is drawn in full while the camera is within SWBAY.LOD.tree of its chunk (its
 // foot keys all of it) and as its lite stand-in past that; a far tree (beyond the spine's mid ring)
 // is only ever its impostor, always drawn. The stand-ins are tris.lite.
 TREES.forEach((T,i)=>{BIO.owner=[T.x,T.z];
  if(T.lv===0){BIO.range=null;BIO.minRange=0;buildFar(T,i,st);st.fars++;}
  else{BIO.range=SWBAY.LOD.tree;BIO.minRange=0;B[T.sp](T,st,T.lv);st.heroes++;
   BIO.range=1e9;BIO.minRange=SWBAY.LOD.tree;buildFar(T,i,st,true);}
  st.byS[T.sp]++;});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,blooms:st.blooms,pods:st.pods,fronds:st.fronds,fans:st.fans,epiphytes:st.epi,tiers:st.tiers,roots:st.roots,shelves:st.shelves,corals:st.corals,
  tris:{trunk:st.trunk,limbs:st.limb,caps:st.cap,far:st.far,lite:st.lite,small:st.sapTris}};};
SWBAY._canopyH=function(x,z){let h=0;for(const T of SWBAY.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||12;};
})();
