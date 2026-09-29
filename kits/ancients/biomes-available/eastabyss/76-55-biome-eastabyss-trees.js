// ================================================================= EASTERN ABYSS — trees
// The eleven tree species of the eastern abyss, each with its own builder,
// placed by zone from the host's climate fields (wet / salt / upland / flow)
// and terrainH. The zone weights are computed HERE from those fields, never
// from the host's map: a world that binds the same four fields gets the same
// zoning. Beyond the LOD spine the canopy species become blob impostors in
// the 'far' bucket (the hyperjungle's technique); the small species thin out
// with distance and stop. Every count scales with q; the core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;

const SP=EASTABYSS.SPECIES,PAL=EASTABYSS.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
EASTABYSS.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. A plant's aridity tag is honoured by which weight it reads:
// 'arid' species read flatK (dry ground only), 'humid' ones marshK/jungK.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),h=Y(x,z);
 return{up,wet,salt,flow,h,
  jung:smooth(.05,.20,up)*smooth(.86,.66,up)*smooth(.45,.7,wet),
  sav:smooth(.62,.86,up),
  marsh:smooth(.22,.03,up)*smooth(.5,.8,wet)*(1-salt*.7),
  flat:smooth(.28,.06,wet)*smooth(.3,.7,salt)*smooth(.15,.03,up),
  shore:smooth(1.6,.4,h)*smooth(.6,.85,wet)*smooth(.1,.02,up)};}
EASTABYSS.zones=zones;

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
function means(){if(MEAN)return MEAN;MEAN={bark:EASTABYSS.BARKTEX.map(t=>texMean(t)),wood:texMean(EASTABYSS.WOODTEX),rock:texMean(EASTABYSS.ROCKTEX)};return MEAN;}
EASTABYSS.means=means;EASTABYSS.tint=tint;EASTABYSS.bright=bright;EASTABYSS.shade=shade;EASTABYSS.vary=vary;
const barkCol=(S,k)=>tint(S.bark[k%S.bark.length],means().bark[S.barkK]);
// an untextured rod / lobe in a species' bark colour: the designer's colour, a shade down
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.25);
const leafCol=(S,k)=>bright(vary(pick(S.leaf),.03,.10,.06),k==null?1.3:k);
const compCol=()=>bright(vary(pick(PAL.comp),.03,.10,.06),1.15);

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
EASTABYSS.blocked=blocked;

// ---------------------------------------------------------------- cauliflory
// Flowers straight off the bark: clusters at random heights round the bole
// (and, for the bell-bark, along its boughs). Complementary to the lake.
function cauliflory(x,z,y0,H,rAt,n,size,st,uLo,uHi){uLo=uLo==null?.15:uLo;uHi=uHi==null?.75:uHi;
 for(let i=0;i<n;i++){const u=rr(uLo,uHi),y=y0+H*u,a=rr(0,TAU),R=rAt(u)+.12,col=compCol();
  const m=ri(6,12);for(let k=0;k<m;k++){const a2=a+rr(-.5,.5)/Math.max(.5,R),y2=y+rr(-.9,.9)*size*1.1,s=size*rr(.55,.9);
   BIO.put('bloom',[x+Math.cos(a2)*(R+s*.3),y2,z+Math.sin(a2)*(R+s*.3)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),s,i%3?col:shade(col,rr(-.1,.2)));st.blooms++;}
  if(rng()<.2){const Lp=size*rr(3,5);BIO.put('pod',[x+Math.cos(a)*(R+.3),y-size*.6,z+Math.sin(a)*(R+.3)],qEuler(0,rr(0,TAU),0),Lp,bright(pick(PAL.accent),rr(.8,1.1)));st.pods++;}}}

// ---------------------------------------------------------------- beard moss
// Spanish-moss-like beards hung from a bough point; how many depends on how
// wet the ground is (none on the flats, thick in the marsh and the deltas).
function beardsAt(p,wet,k,st,long){const n=Math.round(rr(0,2.2)*k*smooth(.55,.95,wet));
 for(let i=0;i<n;i++){const L=long?rr(4,12):rr(2.5,8);BIO.put('beard',[p.x+rr(-.8,.8),p.y-(p.r||.3)*.5,p.z+rr(-.8,.8)],qEuler(0,rr(0,TAU),0),[rr(1.2,2.6),L,1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));st.moss++;}}
// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,wid){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);frondAt(item,x,y,z,a,Rf*rr(.85,1.1),rr(p0,p1),bright(col,rr(.88,1.1)),wid);}}
function fanAt(x,y,z,a,L,tilt,col,item){BIO.put(item||'fan',[x,y,z],qEuler(tilt,Math.atan2(Math.cos(a),Math.sin(a)),rr(-.08,.08)),[L*rr(.9,1.1),L,1],col);}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed} and lv 2 near / 1 mid / 0 far
const B=[];
// 0/1 the scale-trees: a straight pole, dichotomous forks, strap tufts at the tips, flowers up the bole
B[0]=B[1]=function(T,st,lv){const S=SP[T.sp],fam=T.sp===0?'bark0i':'bark'+S.barkK,H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.42*u)*(1+.7*Math.exp(-u*H/6));
 const rings=[],vs=9;for(let yy=0;yy<H*.74;yy+=vs*.5)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/30)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(14,1,yy)*.45)});
 rings.push({x:T.x,y:T.y0+H*.74,z:T.z,r:rAt(.74),yy:H*.74,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.74+rAt(.74)*.9,z:T.z,r:.05,yy:H*.74+1,col:barkCol(S,1)});   // closed: a dome, never an open pipe
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.03*Math.sin(3*ang+R.yy*.05+ph)),null);
 // the forks
 const spots=[];
 function fork(o,d,lvl,r0){const len=H*S.forkLen[lvl]*rr(.85,1.15),pts=treeGrow(o,d,len,r0,Math.max(.12,r0*.5),4,-.05,.05);
  for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2))return;
  st.limb+=BIO.tube(fam,pts,barkCol(S,2),{seg:r0>1.2?7:5,cap:lvl===S.forks-1});st.forks++;
  const e=pts[pts.length-1];if(lv>=1&&lvl>0)beardsAt(pts[2],T.wet,.9,st,true);
  if(lvl<S.forks-1){const sx=-d[2],sz=d[0],sl=Math.hypot(sx,sz)||1,side=[sx/sl,0,sz/sl],spread=rr(.35,.6),tw=rr(0,TAU);
   for(let k=-1;k<=1;k+=2){const dd=[d[0]*Math.cos(spread)+side[0]*Math.sin(spread)*k+Math.cos(tw)*.15,d[1]*Math.cos(spread)+rr(.05,.25),d[2]*Math.cos(spread)+side[2]*Math.sin(spread)*k+Math.sin(tw)*.15],l=Math.hypot(dd[0],dd[1],dd[2]);
    fork({x:e.x,y:e.y,z:e.z},[dd[0]/l,dd[1]/l,dd[2]/l],lvl+1,Math.max(.12,r0*.6));}}
  else{spots.push({p:e,s:len*.35},{p:pts[pts.length-2],s:len*.3});}}
 const top={x:T.x,y:T.y0+H*.74,z:T.z},a0=rr(0,TAU),nTop=2;
 for(let k=0;k<nTop;k++){const a=a0+k*Math.PI+rr(-.3,.3),el=rr(.9,1.2);fork(top,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],0,rAt(.74)*.7);}
 if(!spots.length)spots.push({p:top,s:5},{p:{x:top.x,y:top.y+4,z:top.z},s:4});   // hemmed in by an obstacle: a tuft on the pole at least
 // the tufts: strap clumps at every fork tip, lit from the crown's centre
 const cy=T.y0+H*.92,ex=T.crownR,ey=H*.2,item='strap',sz0=T.sp===0?rr(9,13):rr(7,10),nC=lv===2?4:2;let mine=0;
 spots.forEach(s=>{for(let c=0;c<nC;c++){const a=rr(0,TAU),d=s.s*.7*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.3,.7)*s.s*.6;
  if(!clear3(x,y,z,sz0*.5,sz0*.4))continue;clumpAt(item,x,y,z,sz0*rr(.85,1.2),.75,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}
  if(rng()<.09){BIO.put('pod',[s.p.x,s.p.y-.3,s.p.z],qEuler(0,rr(0,TAU),0),rr(3,5)*(T.sp===0?1.3:1),bright(pick(PAL.accentDull),rr(.8,1.1)));st.pods++;}});
 if(!mine){clumpAt(item,T.x,T.y0+H*.76,T.z,sz0,.75,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}   // hemmed in: never a bare pole
 let spread=T.crownR;spots.forEach(s=>{spread=Math.max(spread,Math.hypot(s.p.x-T.x,s.p.z-T.z)+s.s);});T.spread=spread;
 cauliflory(T.x,T.z,T.y0,H,rAt,(T.sp===0?ri(9,14):ri(6,10))*(lv===2?1:.5),T.sp===0?rr(1.0,1.5):rr(.7,1.0),st,.12,.72);
 if(lv===2){
  // beard moss and moss mats low on the bole
  for(let i=0,n=ri(3,6);i<n;i++){const a=rr(0,TAU),yy=rr(3,18),R=rAt(yy/H)+.2;BIO.put('beard',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(2,4),rr(3,8),1.5],bright(pick(PAL.mossPale),1.2));st.moss++;}}
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.spread,h:T.H});};
// 2 the bell-bark: a smooth pale bole, rising boughs, broad leaves, flowers on trunk and boughs
B[2]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.5*u)*(1+.9*Math.exp(-u*H/5));
 const rings=[],vs=6;for(let yy=0;yy<H*.9;yy+=vs*.5)rings.push({x:T.x+.4*Math.sin(yy*.07+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/20)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(10,1,yy)*.5)});
 rings.push({x:T.x+.4*Math.sin(H*.9*.07+ti),y:T.y0+H*.9+1,z:T.z,r:.05,yy:H*.9+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.05*Math.sin(4*ang+ph)*smooth(8,0,R.yy)+.02*Math.sin(7*ang+R.yy*.1)),null);
 const spots=[],boughs=[],nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const u=mix(.52,.86,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(.25,.6),len=T.crownR*rr(.7,1.05),r0=clamp(rAt(u)*.5,.3,1.4);
  const o={x:T.x+Math.cos(a)*rAt(u)*.7,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.7},d=[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
  const pts=treeGrow(o,d,len,r0,.15,5,-.10,.07);let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>.9?7:5,cap:true});boughs.push(pts);if(lv>=1){beardsAt(pts[2],T.wet,1.2,st,true);beardsAt(pts[4],T.wet,.8,st,false);}
  // secondaries
  for(let s=2;s<5;s++){const p=pts[s],a2=a+rr(-1,1),el2=rr(.1,.5),len2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.12,p.r*.6),.08,3,-.08,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});
   spots.push({p:sec[2],s:len2*.45},{p:sec[3],s:len2*.4,tip:true});}
  spots.push({p:pts[3],s:len*.2},{p:pts[4],s:len*.22},{p:pts[5],s:len*.25,tip:true});}
 spots.push({p:{x:T.x,y:T.y0+H*.93,z:T.z},s:4,tip:true},{p:{x:T.x,y:T.y0+H*.88,z:T.z},s:5});   // the leader
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.25,sz0=rr(6.5,9),nC=lv===2?1.7:1.1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.3,.5)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('broad',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}});
 if(!mine){clumpAt('broad',T.x,T.y0+H*.9,T.z,sz0,.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2){cauliflory(T.x,T.z,T.y0,H,rAt,ri(8,13),rr(.6,.9),st,.1,.6);
  boughs.forEach(pts=>{for(let i=1;i<4;i++)if(rng()<.6){const p=pts[i],col=compCol();for(let k=0,m=ri(3,6);k<m;k++){const a=rr(0,TAU),s=rr(.45,.8);
   BIO.put('bloom',[p.x+Math.cos(a)*(p.r+.2),p.y+rr(-.6,.6),p.z+Math.sin(a)*(p.r+.2)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),s,col);st.blooms++;}}});
  for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),yy=rr(1,9),R=rAt(yy/H)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H});};
// 3 the crown fern: a fibrous trunk and a great radiating crown of fronds, dead fronds hanging under it
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?8:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('bigfrond',tx,ty,tz,Rf,n,-.12,.22,bright(hc,1.5),1.25);
 if(lv>=1){frondCrown('bigfrond',tx,ty+.5,tz,Rf*.62,lv===2?5:3,.55,1.1,bright(shade(hc,.1),1.5),1.1);
  // last season's fronds hang brown under the crown
  for(let k=0,m=lv===2?ri(3,6):2;k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*rb*.9,ty-.6,tz+Math.sin(a)*rb*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.2,2),Rf*rr(.5,.8),1],bright(vary(0x6a5a3a,.02,.1,.06),1.1));}}
 st.fronds+=n;};
// 4 the salt cycad: a squat fibrous trunk, a stiff crown, a cone in the middle, flowers under the crown
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([0,1,0]),[rb/.4*1.3,H+.4,rb/.4*1.3],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const ty=T.y0+H,Rf=T.crownR,n=lv===2?ri(S.fronds[0],S.fronds[1]):8,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('cycfrond',T.x,ty,T.z,Rf,n,.2,.6,bright(hc,1.45),1.05);
 if(lv===2){frondCrown('cycfrond',T.x,ty+.2,T.z,Rf*.55,4,.75,1.2,bright(shade(hc,.12),1.45),.9);
  BIO.put('cone',[T.x,ty-.1,T.z],qUp([0,1,0]),[Rf*.28,Rf*.55,Rf*.28],shade(C(pick(PAL.accent)),-.15));
  const col=compCol();for(let k=0,m=ri(5,10);k<m;k++){const a=rr(0,TAU),s=rr(.35,.6);BIO.put('bloom',[T.x+Math.cos(a)*(rb*1.05),ty-rr(.3,1.2)-H*.15*rng(),T.z+Math.sin(a)*(rb*1.05)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),s,col);st.blooms++;}}
 st.fronds+=n;};
// 5 the pipe reed: a jointed ribbed stem, whorls of needles at every node, a strobilus on top
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,n=ri(6,9),la=rr(0,TAU),lk=rr(0,.08),pts=[];
 for(let k=0;k<=n;k++){const u=k/n;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*mix(1,.35,u),col:barkCol(S,k%3)});}
 st.limb+=BIO.tube('bark4',pts,barkCol(S,0),{seg:lv===2?6:5,vscale:H/n*8});   // one ring of the ribbed texture per node
 const hc=vary(pick(S.leaf),.02,.1,.05);
 for(let k=1;k<=n;k++){const p=pts[k],u=k/n,R=T.crownR*mix(1.1,.45,u)*rr(.85,1.15);
  BIO.put('whorl',[p.x,p.y-.05,p.z],qEuler(0,rr(0,TAU),0),[R,R,R],bright(hc,rr(.9,1.1)*1.1));
  if(lv===2&&k<n)BIO.put('whorl',[p.x,p.y+.35,p.z],qEuler(0,rr(0,TAU),0),[R*.7,R*.7,R*.7],bright(shade(hc,.1),1.1));}
 const e=pts[n];BIO.put('cone',[e.x,e.y,e.z],qUp([0,1,0]),[e.r*3.2,rr(1.2,2.4),e.r*3.2],shade(C(pick(PAL.accentDull)),-.1));st.whorls+=n;};
// 6 the marsh knee-tree: a buttressed bole, a wide level crown of feathery sprays, beards of moss, knees round the base
B[6]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.55*u)*(1+1.6*Math.exp(-u*H/2.6));
 const nl=ri(4,7),lobes=[];for(let k=0;k<nl;k++)lobes.push({a:k/nl*TAU+rr(-.3,.3),amp:rr(.5,1.1)});
 const lobeSum=ang=>{let s=0;for(const L of lobes){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,5);}return s;};
 const rings=[],vs=8;for(let yy=0;yy<H*.88;yy+=(yy<8?1.6:vs*.6))rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/16)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(6,0,yy)*.5)});
 rings.push({x:T.x,y:T.y0+H*.88+1,z:T.z,r:.05,yy:H*.88+1,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?11:8,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+.9*Math.exp(-R.yy/2.2)*lobeSum(ang)+.03*Math.sin(5*ang)),(R,ang)=>mix(1,.55+.45*clamp(lobeSum(ang),0,1),Math.exp(-R.yy/2.5)));
 const spots=[],nB=lv===2?ri(5,8):ri(4,5),a0=rr(0,TAU),beards=[];
 for(let k=0;k<nB;k++){const u=mix(.5,.86,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(-.05,.3),len=T.crownR*rr(.7,1.05),r0=clamp(rAt(u)*.45,.25,1.1);
  const o={x:T.x+Math.cos(a)*rAt(u)*.7,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.7},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.12,4,-.12,.07);
  let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:4,cap:true});
  for(let s=1;s<=4;s++){spots.push({p:pts[s],s:len*.24});if(S.beards&&s>1){beards.push(pts[s]);if(rng()<.5*T.wet)beards.push(pts[s]);}}}
 spots.push({p:{x:T.x,y:T.y0+H*.9,z:T.z,r:.3},s:3},{p:{x:T.x,y:T.y0+H*.86,z:T.z,r:.3},s:4});
 const cy=T.y0+H*.82,ex=T.crownR,ey=H*.2,sz0=rr(5,7);
 spots.forEach(s=>{if(lv<2&&rng()<.4)return;for(let c=0,m=lv===2?(rng()<.5?2:1):1;c<m;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.2,.5)*s.s;
  if(!clear3(x,y,z,sz0*.5,sz0*.3))continue;clumpAt('feather',x,y,z,sz0*rr(.85,1.2),.45,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}});
 if(lv>=1){beards.forEach(p=>{if(lv===1&&rng()<.5)return;const L=rr(4,12);BIO.put('beard',[p.x+rr(-.5,.5),p.y-p.r*.5,p.z+rr(-.5,.5)],qEuler(0,rr(0,TAU),0),[rr(1.2,2.4),L,1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));st.moss++;});}
 if(lv===2){for(let k=0,m=ri(4,9);k<m;k++){const a=rr(0,TAU),d=rb*rr(1.6,4.5),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z);if(y<-.9||!BIO.clearOf(x,z,.5))continue;
   const h=rr(.5,1.6);BIO.put('cone',[x,y-.25,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*.7,h+.25,h*.7],rodCol(S,k));st.knees++;}}
 if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H});};
// 7 the stilt-wood: a small pale tree standing on arching prop roots in the shallows
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,gy=T.y0,base=gy+rr(1.2,2.4),rc=rodCol(S,T.seed);
 BIO.put('trunk2',[T.x,base-.3,T.z],qUp([0,1,0]),[rb/.4,H-base+gy+.3,rb/.4],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const nR=lv===2?ri(7,11):5;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.2,.2),R=rr(1.6,3.6)*(rb/.6),gx=T.x+Math.cos(a)*R,gz=T.z+Math.sin(a)*R,gyy=Y(gx,gz);
  const mid=[T.x+Math.cos(a)*R*.55,base-(base-gyy)*.35,T.z+Math.sin(a)*R*.55];
  BIO.beam('rod',[T.x+Math.cos(a)*rb*.7,base+.4,T.z+Math.sin(a)*rb*.7],mid,rb*.32,rb*.24,rc);BIO.beam('rod',mid,[gx,Math.min(gyy,base-1)-.4,gz],rb*.24,rb*.15,rc);}
 const cy=T.y0+H*.8,ex=T.crownR,ey=H*.25,n=lv===2?ri(7,10):4,hc=C(pick(S.leaf));
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=T.crownR*rr(.15,.8),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=T.y0+H*rr(.62,.98);
  clumpAt('round',x,y,z,T.crownR*rr(.5,.8),.7,hc,T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2&&rng()<.5){const a=rr(0,TAU);BIO.beam('rod',[T.x+Math.cos(a)*rb*.5,T.y0+H*.6,T.z+Math.sin(a)*rb*.5],[T.x+Math.cos(a)*T.crownR*.9,T.y0+H*.7,T.z+Math.sin(a)*T.crownR*.9],rb*.3,rb*.1,rc);}
 if(lv>=1)beardsAt({x:T.x+rr(-1,1)*T.crownR*.5,y:T.y0+H*.7,z:T.z+rr(-1,1)*T.crownR*.5,r:.4},T.wet,1,st,false);};
// 8 the fan palmetto: a fibrous trunk and a head of fans
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.16);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.15,H+.5,rb/.4*1.15],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),n=lv===2?ri(9,14):lv===1?7:4,hc=vary(pick(S.leaf),.03,.1,.05),a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),L=T.crownR*rr(.85,1.15),tilt=rr(.35,1.15),ox=Math.cos(a)*.5,oz=Math.sin(a)*.5;
  fanAt(tx+ox,ty+rr(-.3,.3),tz+oz,a,L,tilt,bright(vary(hc,.02,.06,.05),1.45));}
 if(lv===2){for(let k=0;k<3;k++){const a=a0+k*2.1;fanAt(tx,ty+.4,tz,a,T.crownR*.7,rr(.05,.3),bright(shade(hc,.12),1.45));}
  if(rng()<.5){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*rb,ty-.4,tz+Math.sin(a)*rb],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1,1.8),rr(2,4),1],bright(0x7a6a4a,1.1));}
  beardsAt({x:tx,y:ty-.2,z:tz,r:.3},T.wet,.8,st,false);}
 st.fans+=n;};
// 9 the shelf umbrella-tree: a pale trunk, a few rising boughs, a flat-topped crown of leaflets
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),la=rr(0,TAU),lk=rr(0,.1);
 BIO.put('trunk2',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.62+.5,rb/.4],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const tx=T.x+Math.cos(la)*lk*H*.62,tz=T.z+Math.sin(la)*lk*H*.62,ty=T.y0+H*.62,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),spots=[];
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),R=T.crownR*rr(.5,.95),mid=[tx+Math.cos(a)*R*.45,ty+H*.22,tz+Math.sin(a)*R*.45],end=[tx+Math.cos(a)*R,ty+H*.36+rr(-.05,.05)*H,tz+Math.sin(a)*R];
  BIO.beam('rod',[tx,ty-.2,tz],mid,rb*.5,rb*.3,rc);BIO.beam('rod',mid,end,rb*.3,rb*.12,rc);spots.push(mid,end,end);}
 const cy=T.y0+H*.95,ex=T.crownR,ey=H*.18,sz0=T.crownR*rr(.42,.6),hc=C(pick(S.leaf));
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.5*rng(),x=p[0]+Math.cos(a)*d,z=p[2]+Math.sin(a)*d,y=T.y0+H*rr(.88,1.02);
  clumpAt('leaflet',x,y,z,sz0*rr(.85,1.2),.32,hc,T.x,cy,T.z,ex,ey);st.clumps++;}});
 if(typeof REGISTER==='function'&&lv===2)REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H});};
// 10 the jade shrub: a thick little trunk, a few fat branches, paddle leaves, the odd head of pale flowers
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed);
 BIO.put('trunk2',[T.x,T.y0-.3,T.z],qUp([rr(-.08,.08),1,rr(-.08,.08)]),[rb/.4*1.2,H*.5+.3,rb/.4*1.2],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const spots=[[T.x,T.y0+H*.55,T.z]],nB=ri(3,5),a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const a=a0+k*GOLD,R=T.crownR*rr(.4,.9),end=[T.x+Math.cos(a)*R,T.y0+H*rr(.6,.95),T.z+Math.sin(a)*R];BIO.beam('rod',[T.x,T.y0+H*.45,T.z],end,rb*.45,rb*.2,rc);spots.push(end);}
 const hc=C(pick(S.leaf)),sz0=T.crownR*rr(.6,.85);
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.4*rng();clumpAt('paddle',p[0]+Math.cos(a)*d,p[1]+rr(0,.4)*sz0,p[2]+Math.sin(a)*d,sz0*rr(.8,1.2),.75,hc,T.x,T.y0+H*.7,T.z,T.crownR,H*.4);st.clumps++;}});
 if(lv===2&&rng()<.4){const p=pick(spots),col=bright(C(pick(PAL.accent)).lerp(C(0xffffff),.55),1.1);for(let k=0,m=ri(3,7);k<m;k++)BIO.put('bloom',[p[0]+rr(-.5,.5),p[1]+sz0*.6+rr(0,.3),p[2]+rr(-.5,.5)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.18,.3),col);}};

// 11 the tide lycopsid: a scale-barked pole on prop roots in the shallows, a crown of long fronds drooping low
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,gy=T.y0,base=gy+rr(1.0,2.0),rc=rodCol(S,T.seed),ti=T.seed%3;
 const rings=[];for(let yy=0;yy<=H;yy+=2.2)rings.push({x:T.x,y:base+yy,z:T.z,r:rb*(1-.35*yy/H)*(yy<1?1.3:1),yy:yy,col:barkCol(S,(Math.floor(yy/6)+ti)%3)});
 rings.push({x:T.x,y:base+H+rb*.6,z:T.z,r:.04,yy:H+1,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('bark0',rings,lv===2?8:6,2,6,(R,ang)=>R.r*(1+.04*Math.sin(5*ang+R.yy)),null);
 const nR=lv===2?ri(6,9):4;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.2,.2),R=rr(1.4,3.2)*(rb/.5),gx=T.x+Math.cos(a)*R,gz=T.z+Math.sin(a)*R,gyy=Y(gx,gz);
  const mid=[T.x+Math.cos(a)*R*.5,base-(base-gyy)*.3,T.z+Math.sin(a)*R*.5];
  BIO.beam('rod',[T.x+Math.cos(a)*rb*.6,base+.3,T.z+Math.sin(a)*rb*.6],mid,rb*.3,rb*.22,rc);BIO.beam('rod',mid,[gx,Math.min(gyy,base-.8)-.4,gz],rb*.22,rb*.14,rc);}
 const ty=base+H,n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?9:5,a0=rr(0,TAU),Rf=T.crownR;
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),red=rng()<.22,hc=red?vary(pick(PAL.accent),.02,.1,.06):vary(pick(S.leaf),.03,.1,.06);
  frondAt('strapfrond',T.x,ty-.2,T.z,a,Rf*rr(.85,1.15),rr(-.95,-.35),bright(hc,1.4),1.15);}   // negative pitch: the fronds hang
 if(lv>=1){for(let k=0;k<4;k++){const a=a0+k*1.6;frondAt('strapfrond',T.x,ty+.2,T.z,a,Rf*.5,rr(.4,.9),bright(vary(pick(S.leaf),.02,.08,.05),1.4),1);}
  beardsAt({x:T.x,y:ty-.5,z:T.z,r:.3},T.wet,1,st,false);
  const col=compCol();for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU);BIO.put('bloom',[T.x+Math.cos(a)*(rb+.15),base+H*rr(.3,.85),T.z+Math.sin(a)*(rb+.15)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.3,.5),col);st.blooms++;}}
 st.fronds+=n;};
// 12 the Calamophyton palm: a slim fibrous trunk and an umbrella of leafless, forking twig-fronds (arid, riparian)
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.1);
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H+.4,rb/.4],tint(pick(S.bark),means().bark[1],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?9:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('calam',tx,ty,tz,T.crownR,n,-.05,.3,bright(hc,1.45),1.1);
 if(lv>=1)frondCrown('calam',tx,ty+.15,tz,T.crownR*.6,5,.45,.9,bright(shade(hc,.1),1.45),1);
 if(lv===2&&rng()<.5){BIO.put('cone',[tx,ty+.1,tz],qUp([0,1,0]),[rb*1.6,rr(.5,.9),rb*1.6],shade(C(pick(PAL.accentDull)),-.1));}
 st.fronds+=n;};
// 13 Sanfordacaulis: a slender pole with a dense ball of fine twigs on top, mint and lavender (wet ground)
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.08);
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.82+.4,rb/.4],tint(pick(S.bark),means().bark[1],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H*.82,tz=T.z+Math.sin(la)*lk*H*.82,cy=T.y0+H*.82+T.crownR*.7,R=T.crownR,hc=C(pick(S.leaf)),rc=rodCol(S,T.seed);
 if(lv===2){for(let k=0,m=ri(6,10);k<m;k++){const a=rr(0,TAU),el=rr(.1,1.2);BIO.beam('rod',[tx,cy-R*.7,tz],[tx+Math.cos(a)*Math.cos(el)*R*.9,cy-R*.7+Math.sin(el)*R*1.1,tz+Math.sin(a)*Math.cos(el)*R*.9],rb*.35,rb*.12,rc);}}
 const n=lv===2?ri(7,10):lv===1?5:3;
 for(let k=0;k<n;k++){const a=rr(0,TAU),el=rr(-.4,1.2),d=R*rr(.2,.7);const x=tx+Math.cos(a)*Math.cos(el)*d,y=cy+Math.sin(el)*d*.8,z=tz+Math.sin(a)*Math.cos(el)*d;
  clumpAt('sanford',x,y,z,R*rr(1.0,1.4),.9,rng()<.8?hc:C(pick(S.leaf)),tx,cy,tz,R,R*.9);st.clumps++;}
 if(lv>=1)beardsAt({x:tx,y:cy-R*.6,z:tz,r:.3},T.wet,.6,st,false);};
// ---------------------------------------------------------------- impostors (the far canopy)
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
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=cheap?4:6,top=T.y0+T.H*(T.sp===6?.85:.78),rings=[];
 [0,.06,.5,1].forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.5,T.rb*(1-.5*u)*(u<.08?1.6:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*(r2/rings.length);
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=S.leaf.map(h=>bright(h,.85)),R=T.crownR,a0=(T.seed%628)/100;
 if(T.sp===0||T.sp===1){for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.5,T.y0+T.H*.92+((k*7)%5),T.z+Math.sin(a)*R*.5,R*.5,T.H*.06,L[(k+fi)%4],L[2],fi+k);}}
 else if(T.sp===2){blob(T.x,T.y0+T.H*.86,T.z,R*.75,T.H*.14,L[fi%4],L[2],fi);if(!cheap)blob(T.x+Math.cos(a0)*R*.4,T.y0+T.H*.78,T.z+Math.sin(a0)*R*.4,R*.5,T.H*.1,L[1],L[3],fi+3);}
 else if(T.sp===6){blob(T.x,T.y0+T.H*.82,T.z,R*.85,T.H*.14,L[fi%4],L[2],fi);}
 else{blob(T.x,T.y0+T.H*.94,T.z,R*.9,T.H*.09,L[fi%4],L[2],fi);}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
EASTABYSS.buildTrees=function(R,q){
 reseed(550011);q=q==null?1:q;R=R||3000;means();
 const st={trunk:0,limb:0,far:0,sapTris:0,forks:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,whorls:0,knees:0,fans:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=EASTABYSS.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.5,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 // one species pass: a jittered grid over the whole disc, the zone weight
 // as acceptance; the hero radius says where it becomes an impostor / stops
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{const S=SP[sp];if(!opt.inWater&&y<.3)return;if(opt.inWater&&(y<-1.6||y>1.2))return;
    if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp);if(opt.inWater)T.y0=Math.max(y,-.2)-.5;
    const ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);
    if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},{patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,noMask:!!opt.inWater,pad:1});
  return n;}
 // canopy of the jungle (the fork scale-tree and the bell-bark in stands), the sky scale-trees above it
 pass(0,118,(Z)=>Z.jung*.85,{hero:1100,mid:1900,far:true,pad:8,patch:.3});
 (function(){let n=0;BIO.grid(44,0,R,(x,z)=>{const Z=zones(x,z);return Z.jung*.78*q;},(x,y,z)=>{if(y<.3||blocked(x,z,5)||!BIO.clearOf(x,z,7))return;
   const sp=BIO.stand(x,z,2,.3,.0022,71)===0?1:2,T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<1000?2:(ld<1800?1:0);TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},{patch:.55,patchScale:.008,pad:1});st.canopy=n;})();
 pass(3,30,(Z)=>Z.jung*.55+Z.marsh*.08*smooth(.02,.08,Z.up)+Z.jung*Z.flow*.3,{hero:900,mid:1600,far:false,pad:2.5,lodK:.5});
 pass(4,36,(Z)=>Z.jung*.45+Z.sav*.22*(1-Z.up)+Z.marsh*.04,{hero:800,mid:1400,far:false,pad:2,lodK:.6});
 pass(5,20,(Z)=>(Z.jung+Z.marsh)*(Z.flow*.7+.05)*.8,{hero:900,mid:1400,far:false,pad:1.5,lodK:.7,patch:.5});
 // the marsh: knee-trees (the lusher the wetter -- deltas and the west), stilt-woods at the water, palmettos throughout
 pass(6,52,(Z)=>Z.marsh*smooth(.70,.96,Z.wet)*.56+Z.marsh*Z.flow*.3,{hero:950,mid:1800,far:true,pad:5,patch:.45,patchScale:.006});
 pass(7,36,(Z)=>Z.shore*.32+Z.marsh*Z.flow*.22,{hero:900,mid:1400,far:false,pad:2.5,lodK:.7,inWater:true});
 pass(8,40,(Z)=>Z.marsh*(.2+.25*smooth(.85,.96,Z.wet))+Z.jung*.2*(1-Z.up)+Z.sav*.05+Z.shore*.2,{hero:900,mid:1500,far:false,pad:2,lodK:.6});
 // the savannah: umbrella trees thinning with height; the flats: jade shrubs along the river only
 pass(9,34,(Z)=>Z.sav*(1-smooth(.75,1,Z.up)*.75)*.8,{hero:1000,mid:1800,far:true,pad:3,patch:.5});
 pass(10,13,(Z)=>Z.flat*Z.flow*.85,{hero:1000,mid:1500,far:false,pad:1,lodK:.4,patch:.4});
 // the new Devonian set: tide lycopsids in the shallows and the deltas, Calamophyton on the arid river banks, Sanfordacaulis where it is wet
 pass(11,30,(Z)=>Z.shore*.5+Z.marsh*Z.flow*.3,{hero:900,mid:1500,far:false,pad:2.5,lodK:.6,inWater:true});
 pass(12,14,(Z)=>Z.flat*Z.flow*.75+Z.sav*Z.flow*.5,{hero:1000,mid:1600,far:false,pad:1.5,lodK:.5,patch:.4});
 pass(13,30,(Z)=>Z.marsh*.26+Z.jung*.16*(1-Z.up)+Z.shore*.15,{hero:900,mid:1500,far:false,pad:2,lodK:.6});
 // build
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,fronds:st.fronds,knees:st.knees,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far,small:st.sapTris}};};
EASTABYSS._canopyH=function(x,z){let h=0;for(const T of EASTABYSS.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||12;};
})();
