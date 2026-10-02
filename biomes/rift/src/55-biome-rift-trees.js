// ================================================================= THE RIFT — trees
// The seventeen tree species of the Rift, each with its own builder, placed by
// zone from the host's climate fields (wet / salt / upland / flow / mist) and
// terrainH. The zone weights are computed HERE from those fields, never from
// the host's map: a world that binds the same fields gets the same zoning.
// Beyond the LOD spine the canopy species become blob impostors in the 'far'
// bucket (the hyperjungle's technique), the small species 20-triangle blobs
// (the lowlands'). The runtime LOD (the core's BIO.range, xanadu's use of it)
// draws a hero tree in full only near the camera and its stand-in impostor past
// that. Every count scales with q; the core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=RIFT.SPECIES,PAL=RIFT.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
RIFT.TREES=[];
// the runtime LOD ranges (metres from the camera to a chunk, BIO.LOD.chunk on a side): hero trees in full (their
// stand-ins past it), the floor's near (7 m) and mid (14 m) bands, its far band, the fallen logs, the dressing.
// A chunk is 1.2 km on a side, so a range much under that hides little more near the spine and costs draw calls.
RIFT.LOD={tree:1200,floor:650,midFloor:1300,farFloor:3000,logs:1200,dress:1200};

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. A plant's aridity tag is honoured by which weight it reads:
// 'arid' species read slope/peak (dry ground), 'humid' ones jung/cloud.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),mist=BIO.field('mist',x,z),h=Y(x,z)-BIO.waterH(x,z);   // h: the ground against the local water (0 in this host)
 const floor=smooth(.26,.10,up);
 return{up,wet,salt,flow,mist,h,
  jung:floor*smooth(.45,.70,wet)*(1-smooth(.3,.7,salt)),          // the valley floor, the wet side
  sav:floor*smooth(.50,.28,wet)*(1-smooth(.3,.7,salt)),           // the valley floor, the dry side
  slope:smooth(.10,.30,up)*smooth(.5,.28,wet)*smooth(.5,.2,mist), // the dry ridge: the north pediment and the crest's flanks
  cloud:smooth(.12,.30,up)*smooth(.35,.65,mist),                  // the cloud forest on the wet face
  peak:smooth(.60,.82,up)*smooth(.55,.30,mist),                   // the Mediterranean crest
  shore:smooth(2.0,.5,h)*smooth(.25,.6,salt)};}                   // the algal shore
RIFT.zones=zones;

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
function means(){if(MEAN)return MEAN;MEAN={bark:RIFT.BARKTEX.map(t=>texMean(t)),wood:texMean(RIFT.WOODTEX),rock:texMean(RIFT.ROCKTEX)};return MEAN;}
RIFT.means=means;RIFT.tint=tint;RIFT.bright=bright;RIFT.shade=shade;RIFT.vary=vary;
const barkCol=(S,k)=>tint(S.bark[k%S.bark.length],means().bark[S.barkK]);
// an untextured rod / lobe in a species' bark colour: the designer's colour, a shade down
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.25);
const leafCol=(S,k)=>bright(vary(pick(S.leaf),.03,.10,.06),k==null?1.3:k);
const compCol=()=>bright(vary(pick(PAL.comp),.03,.10,.06),1.15);
const iridCol=(S,k)=>S.irid?bright(vary(pick(PAL.irid[S.irid]),.02,.08,.05),k==null?1.2:k):null;
// items without a normal of their own (curls, rosettes, tufts) show the second colour at every horizontal view angle,
// so theirs is pulled part way back toward the base colour
const softC2=(c2,base,k)=>{const c=(c2.isColor?c2.clone():C(c2));return c.lerp(base.isColor?base:C(base),k==null?.45:k);};
RIFT.softC2=softC2;
// a per-instance normal for the iridescence of a curl or a rosette (aN, 50-species): its up axis leaning out toward
// azimuth a by l (the side of the plant a clump would light), so plants differ instead of all turning at one view angle
const leanN=(a,l)=>{const n=Math.hypot(l,1);return[Math.cos(a)*l/n,1/n,Math.sin(a)*l/n];};
RIFT.leanN=leanN;

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
RIFT.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
// a clump lit from the crown's centre; c2 is the iridescent second colour (null: none)
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn],c2:c2?bright(c2,ao):null});}
function frondAt(item,x,y,z,a,L,pitch,col,wid,c2){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col,{c2:c2||null});}
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,wid){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);frondAt(item,x,y,z,a,Rf*rr(.85,1.1),rr(p0,p1),bright(col,rr(.88,1.1)),wid);}}
function fanAt(x,y,z,a,L,tilt,col,item,c2){BIO.put(item||'fan',[x,y,z],qEuler(tilt,Math.atan2(Math.cos(a),Math.sin(a)),rr(-.08,.08)),[L*rr(.9,1.1),L,1],col,{c2:c2||null,n:[Math.cos(a)*.9,.45,Math.sin(a)*.9]});}
// beard moss hung from a bough point, in proportion to the wet field
function beardsAt(p,wet,k,st,long){const n=Math.round(rr(0,2.2)*k*smooth(.6,.95,wet));
 for(let i=0;i<n;i++){const L=long?rr(4,12):rr(2.5,8);BIO.put('beard',[p.x+rr(-.8,.8),p.y-(p.r||.3)*.5,p.z+rr(-.8,.8)],qEuler(0,rr(0,TAU),0),[rr(1.2,2.6),L,1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));st.moss++;}}
function anemonesOn(x,z,y0,H,rAt,n,set,st,sz){for(let i=0;i<n;i++){const u=rr(.15,.85),a=rr(0,TAU),R=rAt(u)+.25;
 BIO.put('anemone',[x+Math.cos(a)*R,y0+H*u,z+Math.sin(a)*R],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),sz?rr(sz[0],sz[1]):rr(.7,1.4),bright(C(pick(set||PAL.accent)),1.12));st.blooms++;}}
const reg=(S,T,r)=>{if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:r||T.spread||T.crownR,h:T.H});};

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet} and lv 2 near / 1 mid / 0 far
const B=[];
// 0 the frill tree: a tapering ribbed column, a fin on every rib on every row pointing out and up, a splay of long fins and a pale bud at the summit
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/7));
 const rings=[],vs=8;for(let yy=0;yy<H*.90;yy+=vs*.6)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/24)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(10,1,yy)*.4)});
 rings.push({x:T.x,y:T.y0+H*.90,z:T.z,r:rAt(.9),yy:H*.9,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.90+rAt(.9)*1.6,z:T.z,r:.05,yy:H*.9+2,col:barkCol(S,1)});   // closed: a pointed dome, never an open pipe
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe('barkF',rings,T.young?18:lv===2?30:18,Math.max(1,Math.round(TAU*rb/5)),vs,(R,ang)=>R.r*(1+.10*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05),fk=Math.min(1,H/100)*(S.key==='cloudfrill'?1.6:1);   // fin length follows the tree: a sapling's fins are a metre
 const rows=lv===2?Math.max(3,Math.round(H/5.2)):Math.max(2,Math.round(H/10)),nf=lv===2?nR:nR/2;
 for(let r=0;r<rows;r++){const u=lerp(.06,.86,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.08;
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=lerp(3.5,8.5,smooth(.05,.7,u))*fk*(.8+.4*fbm(u*9,k*.7,T.seed%97,1))*rr(.9,1.1);
   BIO.put('frill',[T.x+Math.cos(a)*R,yy,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(1.05,.85,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),{c2:bright(pick(c2s),1.2),n:[Math.cos(a)*.85,.5,Math.sin(a)*.85]});st.fins++;}}
 const top=T.y0+H*.9,n=lv===2?14:8,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),L=H*rr(.09,.13)*mix(1.6,1,fk);BIO.put('frill',[T.x+Math.cos(a)*rAt(.9)*.7,top+rr(-1,1),T.z+Math.sin(a)*rAt(.9)*.7],qEuler(rr(-.1,.1),-a,rr(.55,.95)),[L,L,L*.95],bright(vary(hc,.02,.06,.05),1.4),{c2:bright(pick(c2s),1.2),n:[Math.cos(a)*.7,.7,Math.sin(a)*.7]});st.fins++;}
 BIO.put('cone',[T.x,top-.5,T.z],qUp([0,1,0]),[rAt(.9)*2.2,rAt(.9)*3.5,rAt(.9)*2.2],shade(C(pick(PAL.comp)),.2));
 if(lv===2&&!T.young){anemonesOn(T.x,T.z,T.y0,H*.7,rAt,ri(4,9),S.flowers?PAL.flowers:PAL.accent,st,[1.2,2.2]);
  for(let i=0,n2=ri(2,5);i<n2;i++){const a=rr(0,TAU),yy=rr(2,14),R=rAt(yy/H)+.2;BIO.put('beard',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(2,4),rr(3,8),1.5],bright(pick(PAL.mossPale),1.2));st.moss++;}}
 T.spread=Math.max(T.crownR,H*.13+rAt(.9));reg(S,T);};
// 1 the bell palm: a pale trunk, dichotomous forks, an inverted bell of pleated fans at every tip
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.35*u)*(1+.6*Math.exp(-u*H/4)),hT=H*.55;
 const rings=[],vs=6;for(let yy=0;yy<hT;yy+=vs*.6)rings.push({x:T.x+.3*Math.sin(yy*.09+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/12)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(6,0,yy)*.4)});
 rings.push({x:T.x+.3*Math.sin(hT*.09+ti),y:T.y0+hT+.5,z:T.z,r:.05,yy:hT+.5,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('barkB',rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+.03*Math.sin(5*ang+R.yy*.3)),null);
 const bells=[],top={x:T.x+.3*Math.sin(hT*.09+ti),y:T.y0+hT-1,z:T.z};
 function fork(o,d,lvl,r0,len){const pts=treeGrow(o,d,len,r0,Math.max(.1,r0*.55),4,.06,.06);
  for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2))return;
  st.limb+=BIO.tube('barkB',pts,barkCol(S,2),{seg:r0>.5?7:5,cap:lvl===S.forks});st.forks++;const e=pts[pts.length-1];
  if(lvl<S.forks){const sx=-d[2],sz=d[0],sl=Math.hypot(sx,sz)||1,side=[sx/sl,0,sz/sl],spread=rr(.4,.7),tw=rr(0,TAU);
   for(let k=-1;k<=1;k+=2){const dd=[d[0]*Math.cos(spread)+side[0]*Math.sin(spread)*k+Math.cos(tw)*.1,d[1]*Math.cos(spread)+rr(.1,.3),d[2]*Math.cos(spread)+side[2]*Math.sin(spread)*k+Math.sin(tw)*.1],l=Math.hypot(dd[0],dd[1],dd[2]);
    fork({x:e.x,y:e.y,z:e.z},[dd[0]/l,dd[1]/l,dd[2]/l],lvl+1,Math.max(.1,r0*.62),len*rr(.55,.7));}}
  else bells.push({p:e,r:r0});}
 const nMain=ri(2,4),a0=rr(0,TAU);
 for(let k=0;k<nMain;k++){const a=a0+k/nMain*TAU+rr(-.4,.4),el=rr(.85,1.2);fork(top,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],1,rAt(.55)*.6,H*rr(.22,.30));}
 if(!bells.length)bells.push({p:top,r:rAt(.55)*.6});   // hemmed in: a bell on the trunk at least
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05),Rb=rr(3.5,5.5)*(T.crownR/16);let spread=T.crownR*.5;
 bells.forEach(b=>{const n=lv===2?ri(8,11):lv===1?6:4,ao=rr(0,TAU);
  for(let k=0;k<n;k++){const a=ao+k/n*TAU+rr(-.15,.15),L=Rb*rr(1.05,1.25),tilt=rr(.5,.8);
   fanAt(b.p.x+Math.cos(a)*b.r*.8,b.p.y-.2,b.p.z+Math.sin(a)*b.r*.8,a,L,tilt,bright(vary(hc,.02,.06,.05),rr(1.3,1.55)),'pleat',bright(pick(c2s),1.25));st.fans++;}
  if(lv>=1)for(let k=0;k<3;k++){const a=ao+k*2.1;fanAt(b.p.x,b.p.y+.2,b.p.z,a,Rb*.85,rr(.1,.3),bright(shade(hc,.1),1.45),'pleat',bright(pick(c2s),1.25));st.fans++;}
  if(lv===2){for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);BIO.put('anemone',[b.p.x+Math.cos(a)*b.r*1.3,b.p.y-rr(.5,1.5),b.p.z+Math.sin(a)*b.r*1.3],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.8,1.4),bright(C(pick(S.flowers?PAL.flowers:PAL.accent)),1.1));st.blooms++;}
   if(rng()<.5){BIO.put('pod',[b.p.x,b.p.y-.4,b.p.z],qEuler(0,rr(0,TAU),0),rr(2,3.5),bright(pick(PAL.accentDull),1));st.pods++;}}
  spread=Math.max(spread,Math.hypot(b.p.x-T.x,b.p.z-T.z)+Rb*1.2);});
 if(lv===2)for(let i=0,n=ri(1,4);i<n;i++){const a=rr(0,TAU),yy=rr(1,8),R=rAt(yy/H)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(.8,1.8),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}
 T.spread=spread;reg(S,T);};
// 2 the lobe tree: a stringy plum bole, arching boughs, pads of lobed leaves in yellow-green shot with purple, pods hanging
B[2]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.5*u)*(1+.9*Math.exp(-u*H/5));
 const rings=[],vs=6;for(let yy=0;yy<H*.9;yy+=vs*.5)rings.push({x:T.x+.4*Math.sin(yy*.07+ti),y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/20)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(10,1,yy)*.5)});
 rings.push({x:T.x+.4*Math.sin(H*.9*.07+ti),y:T.y0+H*.9+1,z:T.z,r:.05,yy:H*.9+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.05*Math.sin(4*ang+ph)*smooth(8,0,R.yy)+.02*Math.sin(7*ang+R.yy*.1)),null);
 const spots=[],boughs=[],nB=ri(S.boughs[0],S.boughs[1]),a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const u=mix(.5,.86,(k+rr(0,.9))/nB),a=a0+k*GOLD+rr(-.3,.3),el=rr(.25,.6),len=T.crownR*rr(.7,1.05),r0=clamp(rAt(u)*.5,.3,1.2);
  const o={x:T.x+Math.cos(a)*rAt(u)*.7,y:T.y0+H*u,z:T.z+Math.sin(a)*rAt(u)*.7},d=[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
  const pts=treeGrow(o,d,len,r0,.15,5,-.10,.07);let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>.9?7:5,cap:true});boughs.push(pts);if(lv>=1)beardsAt(pts[2],T.wet,.8,st,true);
  spots.push({p:pts[3],s:len*.2},{p:pts[4],s:len*.22},{p:pts[5],s:len*.25,tip:true});}
 spots.push({p:{x:T.x,y:T.y0+H*.93,z:T.z},s:4,tip:true},{p:{x:T.x,y:T.y0+H*.88,z:T.z},s:5});
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.25,sz0=rr(5.5,8)*Math.min(1,H/30),nC=lv===2?1.7:1.1,c2s=PAL.irid[S.irid];let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.3,.5)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('lobeleaf',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,rng()<.75?C(pick(c2s)):null);st.clumps++;mine++;}});
 if(!mine){clumpAt('lobeleaf',T.x,T.y0+H*.9,T.z,sz0,.6,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,C(pick(c2s)));st.clumps++;}
 if(lv===2){boughs.forEach(pts=>{for(let i=2;i<5;i++)if(rng()<.45){const p=pts[i];BIO.put('pod',[p.x,p.y-.2,p.z],qEuler(0,rr(0,TAU),0),rr(1.8,3.2),bright(pick(PAL.accent),rr(.8,1.1)));st.pods++;}});
  anemonesOn(T.x,T.z,T.y0,H*.6,rAt,ri(3,7),S.flowers?PAL.flowers:PAL.comp,st);
  for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),yy=rr(1,9),R=rAt(yy/H)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 reg(S,T,T.crownR);};
// 3 the trumpet tree: a slim ribbed stalk flaring into a wide ribbed funnel, light green, the funnel's mouth open to the sky
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,ti=T.seed%3,nR=S.ribs,ph=rr(0,TAU),la=rr(0,TAU),lk=rr(0,.05);
 const lc=(u)=>barkCol(S,(Math.floor(u*6)+ti)%3).lerp(bright(C(pick(S.leaf)),1.1),smooth(.55,.95,u)*.7);   // the funnel is leaf, the stalk bark
 const rings=[];const n=lv===2?22:12;
 for(let i=0;i<=n;i++){const u=i/n,f=smooth(.62,1,u),r=rb*(1-.3*u)+(R-rb*.7)*Math.pow(f,1.8),yy=H*u,x=T.x+Math.cos(la)*lk*yy,z=T.z+Math.sin(la)*lk*yy;
  rings.push({x:x,y:T.y0+yy,z:z,r:r,yy:yy,col:lc(u)});}
 // the rim turns in a little, then the cup's floor closes the lathe (never an open pipe from above)
 const top=rings[n];rings.push({x:top.x,y:top.y+R*.05,z:top.z,r:R*.92,yy:H+.5,col:lc(1)},{x:top.x,y:top.y-R*.35,z:top.z,r:R*.55,yy:H+1,col:shade(lc(1),-.35)},{x:top.x,y:top.y-R*.45,z:top.z,r:.05,yy:H+1.5,col:shade(lc(1),-.45)});
 st.trunk+=BIO.lathe('barkT',rings,lv===2?26:16,Math.max(1,Math.round(TAU*rb/2)),3,(Rg,ang)=>Rg.r*(1+(.05+.07*smooth(.6,1,Rg.yy/H))*Math.cos(nR*ang+ph)),(Rg,ang)=>.8+.2*Math.cos(nR*ang+ph));
 if(lv===2){const col=bright(C(pick(PAL.accent)),1.15);for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.7);BIO.put('urchin',[top.x+Math.cos(a)*d,top.y-R*.2,top.z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.5,.9),col);st.blooms++;}   // blooms in the cup
  anemonesOn(T.x,T.z,T.y0,H*.6,u=>rb*(1-.3*u),ri(2,5),PAL.comp,st,[.5,1.0]);}
 else BIO.put('urchin',[top.x,top.y-R*.2,top.z],qEuler(0,rr(0,TAU),0),rr(.6,.9),bright(C(pick(PAL.accent)),1.15));   // the instance the probe finds
 T.spread=R*1.1;reg(S,T,R*1.1);};
// 4 the pagoda tree: a straight fibrous trunk and tiers of level whorls clothed in rope foliage, a terrestrial green
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.6*u)*(1+.5*Math.exp(-u*H/4));
 const rings=[],vs=8;for(let yy=0;yy<H*.97;yy+=vs*.6)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/20)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.97+.5,z:T.z,r:.05,yy:H*.97+.5,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('bark1',rings,lv===2?9:7,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r,null);
 const nT=lv===2?ri(S.tiers[0],S.tiers[1]):ri(4,6),a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.08,.05),rc=rodCol(S,T.seed),c2=C(pick(PAL.irid.YG));
 let spread=0;
 for(let t=0;t<nT;t++){const u=lerp(.28,.96,(t+.5)/nT),Rt=T.crownR*lerp(1,.25,Math.pow((t+.5)/nT,1.3))*rr(.85,1.1),y=T.y0+H*u,nB=lv===2?ri(4,6):4,ab=a0+t*.7;
  for(let k=0;k<nB;k++){const a=ab+k/nB*TAU+rr(-.2,.2),ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt,ey=y+Rt*.12*rr(.5,1.2);
   if(!clear3(ex,ey,ez,2,2))continue;
   BIO.beam('rod',[T.x,y,T.z],[ex,ey,ez],rAt(u)*.35,.06,rc);
   const n=lv===2?2:1;for(let c=0;c<n;c++){const f=c?.55:1,sz=Rt*rr(.28,.4);clumpAt('rope',T.x+(ex-T.x)*f,y+(ey-y)*f+sz*.1,T.z+(ez-T.z)*f,sz,.32,hc,T.x,y,T.z,Rt,Rt*.5,rng()<.3?c2:null);st.clumps++;}}
  spread=Math.max(spread,Rt*1.1);}
 clumpAt('rope',T.x,T.y0+H*.99,T.z,T.crownR*.25,.5,hc,T.x,T.y0+H*.95,T.z,4,3,null);st.clumps++;
 T.spread=spread;reg(S,T);};
// 5 the curl succulent: a bunch of spiralling teal tendrils
B[5]=function(T,st,lv){const S=SP[T.sp],n=lv===2?ri(2,4):lv===1?2:1,c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.15,.6):0,h=T.H*rr(.7,1.15),w=h*rr(.9,1.3);
  BIO.put('curl',[T.x+Math.cos(a)*d,T.y0+.4,T.z+Math.sin(a)*d],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[w,h,w],bright(vary(hc,.02,.06,.05),1.25),{c2:softC2(bright(pick(c2s),1.15),hc,.35),n:leanN(a,.3+.6*d)});st.curls++;}
 if(lv===2&&rng()<.3){BIO.put('urchin',[T.x,T.y0+T.H*.5,T.z],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.5,.9),bright(C(pick(PAL.comp)),1.15));st.blooms++;}};
// 6 the prism bush: a dark lobe under a crown of pinnate sprays that go green to orange and magenta with the light
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,Rs=T.crownR,c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05);
 BIO.put('lobe',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[Rs*.8,H*.5,Rs*.8],shade(vary(hc,.03,.1,.05),-.35));
 const n=lv===2?ri(4,7):3;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=Rs*rr(.2,.7),y=T.y0+H*rr(.45,.95);clumpAt('spray',T.x+Math.cos(a)*d,y,T.z+Math.sin(a)*d,Rs*rr(.9,1.4),.7,hc,T.x,T.y0+H*.7,T.z,Rs,H*.5,C(pick(c2s)));st.clumps++;}
 if(lv===2&&rng()<.5)for(let k=0,m=ri(1,3);k<m;k++)BIO.put('urchin',[T.x+rr(-.5,.5)*Rs,T.y0+H*rr(.9,1.1),T.z+rr(-.5,.5)*Rs],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.4,.7),bright(C(pick(PAL.comp)),1.15));};
// 7 the candle stalk: one to three slim stems each carrying a fuzzy lavender bottlebrush
B[7]=function(T,st,lv){const S=SP[T.sp],n=lv===2?ri(1,3):1,rc=rodCol(S,T.seed),a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.1,d=k?rr(.4,1.2):0,px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,h=T.H*rr(.75,1.15),lean=rr(0,.06),lx=Math.cos(a)*lean*h,lz=Math.sin(a)*lean*h;
  BIO.beam('rod',[px,T.y0,pz],[px+lx,T.y0+h*.68,pz+lz],T.rb,T.rb*.6,rc);
  const hh=h*.36,w=T.crownR*rr(.9,1.2);BIO.put('candle',[px+lx*.95,T.y0+h*.62,pz+lz*.95],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w,hh,w],bright(vary(pick(S.leaf),.02,.06,.05),1.3));st.candles++;}};
// 8 the baobab: a great bottle of a trunk, a few short boughs at the top, a sparse leaflet crown
B[8]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1.12-.62*Math.pow(u,1.4))*(1+.30*Math.exp(-u*H/3)),hT=H*.68;
 const rings=[],vs=6;for(let yy=0;yy<hT;yy+=vs*.4)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/9)+ti)%3)});
 rings.push({x:T.x,y:T.y0+hT+rAt(.68)*.6,z:T.z,r:.05,yy:hT+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?14:9,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.05*Math.sin(7*ang+ph)+.03*Math.sin(3*ang-ph)*smooth(0,6,R.yy)),(R,ang)=>.92+.08*Math.sin(7*ang+ph));
 const spots=[],nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),top={x:T.x,y:T.y0+hT-.5,z:T.z};
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),el=rr(.45,1.1),len=T.crownR*rr(.55,.9),r0=rAt(.68)*rr(.22,.32);
  const pts=treeGrow({x:T.x+Math.cos(a)*rAt(.68)*.5,y:top.y,z:T.z+Math.sin(a)*rAt(.68)*.5},[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.1,4,-.12,.08);
  let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+1.5,pts[i].r+1.5)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:6,cap:true});spots.push(pts[2],pts[3],pts[4],pts[4]);
  if(lv===2)for(let s=0;s<2;s++){const p=pts[2+s],a2=a+rr(-1.2,1.2),el2=rr(.2,.8),l2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],l2,Math.max(.08,p.r*.5),.05,3,-.05,.08);
   st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});spots.push(sec[2],sec[3]);}}
 const cy=T.y0+H*.9,ex=T.crownR,ey=H*.3,sz0=rr(2.6,3.8),hc=C(pick(S.leaf));
 spots.forEach(p=>{if(lv<2&&rng()<.4)return;const a=rr(0,TAU),d=sz0*.5*rng();clumpAt('leaflet',p.x+Math.cos(a)*d,p.y+rr(0,.4)*sz0,p.z+Math.sin(a)*d,sz0*rr(.8,1.2),.45,hc,T.x,cy,T.z,ex,ey);st.clumps++;});
 if(lv===2&&rng()<.5){const n=ri(3,6);for(let k=0;k<n;k++){const p=pick(spots);BIO.put('pod',[p.x,p.y-.3,p.z],qEuler(0,rr(0,TAU),0),rr(1.4,2.4),bright(0xd8d0b8,1));st.pods++;}}
 reg(S,T,T.crownR);};
// 9 the monkey-puzzle: a straight trunk, tiers of long whorled branches in the upper half clothed in rope foliage, an umbrella top
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/4));
 const rings=[],vs=8;for(let yy=0;yy<H*.96;yy+=vs*.6)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/24)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.96+.6,z:T.z,r:.05,yy:H*.96+.6,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('bark1',rings,lv===2?9:7,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r,null);
 const nT=lv===2?ri(S.tiers[0],S.tiers[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.08,.05),rc=rodCol(S,T.seed),c2s=PAL.irid[S.irid];let spread=0;
 for(let t=0;t<nT;t++){const u=lerp(.52,.97,(t+.5)/nT),Rt=T.crownR*(u<.9?1:.55)*rr(.8,1.1),y=T.y0+H*u,nB=lv===2?ri(4,6):3,ab=a0+t*.9;
  for(let k=0;k<nB;k++){const a=ab+k/nB*TAU+rr(-.25,.25),mid=[T.x+Math.cos(a)*Rt*.5,y-Rt*.06,T.z+Math.sin(a)*Rt*.5],end=[T.x+Math.cos(a)*Rt,y+Rt*.14,T.z+Math.sin(a)*Rt];
   if(!clear3(end[0],end[1],end[2],2,2))continue;
   BIO.beam('rod',[T.x,y,T.z],mid,rAt(u)*.4,.12,rc);BIO.beam('rod',mid,end,.12,.05,rc);
   const sz=Rt*rr(.3,.42);clumpAt('rope',end[0],end[1]+sz*.15,end[2],sz,.4,hc,T.x,y,T.z,Rt,Rt*.5,rng()<.4?C(pick(c2s)):null);st.clumps++;
   if(lv>=1&&rng()<.7){const fc=bright(C(pick([0x9a4ac8,0xb060d8,0x8a3ab8,0xc080e0])),1.2);for(let f=0,m=lv===2?ri(3,6):2;f<m;f++)BIO.put('bloom',[end[0]+rr(-.6,.6)*sz,end[1]+sz*.3+rr(0,.3),end[2]+rr(-.6,.6)*sz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.22,.38),fc);st.blooms++;}
   if(lv===2){clumpAt('rope',mid[0],mid[1]+sz*.1,mid[2],sz*.75,.4,hc,T.x,y,T.z,Rt,Rt*.5,null);st.clumps++;}}
  spread=Math.max(spread,Rt*1.15);}
 for(let k=0;k<3;k++){const a=a0+k*2.1;clumpAt('rope',T.x+Math.cos(a)*2,T.y0+H*.98,T.z+Math.sin(a)*2,T.crownR*.3,.45,hc,T.x,T.y0+H*.95,T.z,4,3,null);st.clumps++;}
 T.spread=spread;reg(S,T);};
// 10 the purple fan shrub: a squat dark lobe bristling with fans of a sweet-potato purple
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,Rs=T.crownR,hc=vary(pick(S.leaf),.02,.06,.05);
 BIO.put('lobe',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[Rs*.7,H*.45,Rs*.7],shade(vary(hc,.02,.08,.05),-.3));
 const n=lv===2?ri(7,11):lv===1?5:3,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rs*rr(2.0,2.8),tilt=rr(.3,.95);fanAt(T.x+Math.cos(a)*Rs*.25,T.y0+H*.3+rr(-.2,.2),T.z+Math.sin(a)*Rs*.25,a,L,tilt,bright(vary(hc,.02,.06,.05),1.35));st.fans++;}
 if(lv===2){for(let k=0;k<2;k++){const a=a0+k*2.4;fanAt(T.x,T.y0+H*.4,T.z,a,Rs*1.8,rr(.05,.25),bright(shade(hc,.08),1.35));st.fans++;}
  if(rng()<.5)for(let k=0,m=ri(2,5);k<m;k++)BIO.put('urchin',[T.x+rr(-.6,.6)*Rs,T.y0+H*rr(.6,1.0),T.z+rr(-.6,.6)*Rs],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.3,.55),bright(C(pick(PAL.accent)),1.15));}};
// 11 the dragon tree: a thick pale trunk forking into a dense flat-topped umbrella of stiff strap heads, yellow blooms on top
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.5;
 BIO.put('trunk2',[T.x,T.y0-.4,T.z],qUp([rr(-.04,.04),1,rr(-.04,.04)]),[rb/.4*1.15,hT+.4,rb/.4*1.15],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const tips=[],n1=ri(3,5),a0=rr(0,TAU),top=[T.x,T.y0+hT-.3,T.z];
 for(let k=0;k<n1;k++){const a=a0+k/n1*TAU+rr(-.3,.3),el=rr(.55,.95),l=H*rr(.22,.3),e=[T.x+Math.cos(a)*Math.cos(el)*l,top[1]+Math.sin(el)*l,T.z+Math.sin(a)*Math.cos(el)*l];
  BIO.beam('rod',top,e,rb*.5,rb*.3,rc);
  const n2=lv===2?ri(2,3):1;for(let j=0;j<n2;j++){const a2=a+rr(-.9,.9),el2=rr(.5,1.1),l2=H*rr(.12,.18),e2=[e[0]+Math.cos(a2)*Math.cos(el2)*l2,e[1]+Math.sin(el2)*l2,e[2]+Math.sin(a2)*Math.cos(el2)*l2];
   BIO.beam('rod',e,e2,rb*.3,rb*.15,rc);tips.push(e2);}}
 const hc=vary(pick(S.leaf),.02,.08,.05),cy=T.y0+H*.9,sz=T.crownR*rr(.4,.55);
 tips.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz*.35*rng();clumpAt('dragon',p[0]+Math.cos(a)*d,p[1]+sz*.25,p[2]+Math.sin(a)*d,sz*rr(.85,1.15),.55,hc,T.x,cy,T.z,T.crownR,H*.3);st.clumps++;}
  if(lv===2&&rng()<.45){const col=bright(C(pick(PAL.accent)),1.2);for(let k=0,m=ri(2,4);k<m;k++)BIO.put('urchin',[p[0]+rr(-.4,.4)*sz,p[1]+sz*.55+rr(0,.3),p[2]+rr(-.4,.4)*sz],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.35,.6),col);st.blooms++;}});
 if(lv===2)for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[T.x+Math.cos(a)*rb,T.y0+hT-.2,T.z+Math.sin(a)*rb],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.8,1.4),rr(1.5,3),1],bright(0x8a7a5a,1.05));}
 reg(S,T,T.crownR);};
// 12 the tree aloe: a fibrous stem, one to three forks, a grey-green rosette on each shot with red-purple, red spikes over it
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.7,c2s=PAL.irid[S.irid];
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([rr(-.05,.05),1,rr(-.05,.05)]),[rb/.4,hT+.4,rb/.4],tint(pick(S.bark),means().bark[1],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 const heads=[[T.x,T.y0+hT,T.z]],n=lv===2?ri(0,2):0,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.3,l=H*rr(.15,.25),e=[T.x+Math.cos(a)*l*.7,T.y0+hT+l*.6,T.z+Math.sin(a)*l*.7];BIO.beam('rod',[T.x,T.y0+hT-.2,T.z],e,rb*.7,rb*.5,rc);heads.push(e);}
 const hc=vary(pick(S.leaf),.02,.06,.05),R=T.crownR;
 heads.forEach(p=>{const rx=rr(-.08,.08),ry=rr(0,TAU),rz=rr(-.08,.08),ox=p[0]-T.x,oz=p[2]-T.z,fork=Math.hypot(ox,oz)>.01;   // a fork's head leans out from the stem
  BIO.put('irosette',[p[0],p[1]-.1,p[2]],qEuler(rx,ry,rz),[R,R*1.5,R],bright(vary(hc,.02,.06,.05),1.15),{c2:softC2(bright(pick(c2s),1.1),hc,.6),n:leanN(fork?Math.atan2(oz,ox):ry,fork?.7:.5)});st.rosettes++;
  if(lv>=1&&rng()<.7){const m=lv===2?ri(2,4):1,col=bright(C(0xd03a2a).lerp(C(pick(PAL.accent)),.35),1.2);for(let k=0;k<m;k++){const a=rr(0,TAU),d=R*rr(.1,.4),h=R*rr(1.2,1.9);
   BIO.beam('rod',[p[0]+Math.cos(a)*d,p[1]+R*.6,p[2]+Math.sin(a)*d],[p[0]+Math.cos(a)*d*1.4,p[1]+R*.6+h*.55,p[2]+Math.sin(a)*d*1.4],.04,.03,rc);
   BIO.put('candle',[p[0]+Math.cos(a)*d*1.4,p[1]+R*.6+h*.5,p[2]+Math.sin(a)*d*1.4],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R*.3,h*.5,R*.3],col);st.blooms++;}}
  if(lv===2)for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[p[0]+Math.cos(a)*rb,p[1]-.2,p[2]+Math.sin(a)*rb],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.5,.9),rr(1,2.2),1],bright(0x7a6a4a,1.05));}});};
// 13 the Rift acacia: a pale trunk, a few rising boughs, a flat-topped crown of leaflets
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),la=rr(0,TAU),lk=rr(0,.1);
 BIO.put('trunk2',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.62+.5,rb/.4],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const tx=T.x+Math.cos(la)*lk*H*.62,tz=T.z+Math.sin(la)*lk*H*.62,ty=T.y0+H*.62,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),spots=[];
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),R=T.crownR*rr(.5,.95),mid=[tx+Math.cos(a)*R*.45,ty+H*.22,tz+Math.sin(a)*R*.45],end=[tx+Math.cos(a)*R,ty+H*.36+rr(-.05,.05)*H,tz+Math.sin(a)*R];
  BIO.beam('rod',[tx,ty-.2,tz],mid,rb*.5,rb*.3,rc);BIO.beam('rod',mid,end,rb*.3,rb*.12,rc);spots.push(mid,end,end);}
 const cy=T.y0+H*.95,ex=T.crownR,ey=H*.18,sz0=T.crownR*rr(.42,.6),hc=C(pick(S.leaf));
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.5*rng(),x=p[0]+Math.cos(a)*d,z=p[2]+Math.sin(a)*d,y=T.y0+H*rr(.88,1.02);
  clumpAt('leaflet',x,y,z,sz0*rr(.85,1.2),.32,hc,T.x,cy,T.z,ex,ey);st.clumps++;}});
 if(lv===2)reg(S,T,T.crownR);};
// 14 the giant groundsel: a thick fibrous column, a cabbage of a rosette on top (and on each fork), a skirt of dead leaves
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.78;
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([rr(-.05,.05),1,rr(-.05,.05)]),[rb/.4*1.2,hT+.4,rb/.4*1.2],tint(pick(S.bark),means().bark[1],rr(.75,.9)));st.sapTris+=BIO.defs.trunk.tris;
 const heads=[[T.x,T.y0+hT,T.z]],n=lv===2?ri(0,2):0,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.3,l=H*rr(.2,.32),e=[T.x+Math.cos(a)*l*.6,T.y0+hT*rr(.5,.8)+l*.75,T.z+Math.sin(a)*l*.6];BIO.beam('rod',[T.x,T.y0+hT*rr(.5,.8),T.z],e,rb*.8,rb*.6,rc);heads.push(e);}
 const hc=vary(pick(S.leaf),.02,.06,.05),R=T.crownR;
 heads.forEach(p=>{BIO.put('rosette',[p[0],p[1]-.1,p[2]],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*.9,R],bright(vary(hc,.02,.06,.05),1.2));st.rosettes++;
  if(lv>=1){const m=lv===2?ri(5,8):3;for(let k=0;k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[p[0]+Math.cos(a)*rb*1.1,p[1]-.3,p[2]+Math.sin(a)*rb*1.1],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.7,1.2),rr(1.2,2.6),1],bright(vary(0x6a5a3a,.02,.08,.06),1.05));}}
  if(lv===2&&rng()<.3){BIO.put('candle',[p[0],p[1]+R*.5,p[2]],qEuler(0,rr(0,TAU),0),[R*.35,R*1.2,R*.35],bright(C(pick(PAL.accent)).lerp(C(0xffffff),.3),1.15));st.blooms++;}});};
// 15 the Rift cycad: a squat fibrous trunk, a stiff crown, a cone in the middle
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([0,1,0]),[rb/.4*1.3,H+.4,rb/.4*1.3],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const ty=T.y0+H,Rf=T.crownR,n=lv===2?ri(S.fronds[0],S.fronds[1]):8,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('cycfrond',T.x,ty,T.z,Rf,n,.2,.6,bright(hc,1.45),1.05);
 if(lv===2){frondCrown('cycfrond',T.x,ty+.2,T.z,Rf*.55,4,.75,1.2,bright(shade(hc,.12),1.45),.9);
  BIO.put('cone',[T.x,ty-.1,T.z],qUp([0,1,0]),[Rf*.28,Rf*.55,Rf*.28],shade(C(pick(PAL.accentDull)),-.15));}
 st.fronds+=n;};
// 16 the peak pine: a trunk and a rough cone of dark needle clumps (a sketch of the Mediterranean crest)
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.08);
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.9+.4,rb/.4],tint(pick(S.bark),means().bark[1],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 const hc=vary(pick(S.leaf),.02,.06,.05),R=T.crownR,cy=T.y0+H*.65,nL=lv===2?4:3;
 for(let l=0;l<nL;l++){const u=lerp(.35,.97,l/(nL-1)),Rl=R*lerp(1,.25,l/(nL-1)),n=lv===2?ri(2,4):2;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=Rl*rr(0,.6);clumpAt('needle',T.x+Math.cos(a)*d,T.y0+H*u,T.z+Math.sin(a)*d,Rl*rr(.8,1.1),.7,hc,T.x,cy,T.z,R,H*.35);st.clumps++;}}};

// 17 the parasol tree: a pale bole, boughs radiating almost level from one point, secondaries, a wide flat canopy of broad leaves
B[17]=B[22]=function(T,st,lv){const S=SP[T.sp],fam='bark'+S.barkK,H=T.H,rb=T.rb,ti=T.seed%3,dome=!!S.dome;   // 22 the violet dome: the same habit under a domed canopy of iridescent purple
 const rAt=u=>rb*(1-.45*u)*(1+.8*Math.exp(-u*H/5)),hT=H*.72;
 const rings=[],vs=6;for(let yy=0;yy<hT;yy+=vs*.6)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/16)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(8,1,yy)*.45)});
 rings.push({x:T.x,y:T.y0+hT+1,z:T.z,r:.05,yy:hT+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.06*Math.sin(5*ang+ph)*smooth(10,0,R.yy)),null);
 const spots=[],nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),o={x:T.x,y:T.y0+hT-1,z:T.z};let spread=T.crownR*.6;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),el=rr(.12,.32),len=T.crownR*rr(.75,1.05),r0=clamp(rAt(.7)*.45,.3,1.1);
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,.14,5,-.06,.06);
  let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:r0>.8?7:5,cap:true});if(lv>=1)beardsAt(pts[3],T.wet,.9,st,true);
  for(let s=1;s<5;s++){const p=pts[s],a2=a+rr(-.9,.9),el2=rr(.05,.35),len2=len*rr(.3,.5);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.1,p.r*.55),.07,3,-.04,.08);
   if(!clear3(sec[3].x,sec[3].y,sec[3].z,3,3))continue;st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});spots.push({p:sec[2],s:len2*.5},{p:sec[3],s:len2*.45,tip:true});}
  spots.push({p:pts[3],s:len*.22},{p:pts[4],s:len*.24},{p:pts[5],s:len*.26,tip:true});spread=Math.max(spread,len*1.1);}
 spots.push({p:{x:T.x,y:T.y0+hT+2,z:T.z},s:5,tip:true});
 const cy=T.y0+hT+(dome?H*.1:4),ex=T.crownR,ey=H*(dome?.2:.12),sz0=rr(6,9)*Math.min(1,H/40),nC=lv===2?(dome?2.2:1.8):1.1,c2s=PAL.irid[S.irid];let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d;let y=s.p.y+rr(-.2,.9)*s.s*.6;
   if(dome){const q=Math.hypot(x-T.x,z-T.z)/T.crownR;y+=H*.16*Math.max(0,1-q*q);}   // the dome: clumps lifted toward the middle
   if(!clear3(x,y,z,sz0*.5,sz0*.3))continue;clumpAt('broad',x,y,z,sz0*rr(.85,1.2)*(s.tip?1.1:1),dome?.55:.42,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,rng()<.75?C(pick(c2s)):null);st.clumps++;mine++;}});
 if(!mine){clumpAt('broad',T.x,T.y0+hT+2,T.z,sz0,dome?.55:.42,C(pick(S.leaf)),T.x,cy,T.z,ex,ey,C(pick(c2s)));st.clumps++;}
 if(lv===2){anemonesOn(T.x,T.z,T.y0,hT*.7,rAt,ri(3,6),S.flowers?PAL.flowers:PAL.comp,st);for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),yy=rr(1,9),R=rAt(yy/H)+.15;BIO.put('mossmat',[T.x+Math.cos(a)*R,T.y0+yy,T.z+Math.sin(a)*R],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(1,2.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 T.spread=spread;reg(S,T);};
// 18 the Rift croton: a dark little stem under a rounded head of broad veined leaves, green and yellow-green with the veins and the undersides lit magenta and purple
B[18]=function(T,st,lv){const S=SP[18],H=T.H,Rs=T.crownR,c2s=PAL.irid[S.irid];
 BIO.put('lobe',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[Rs*.55,H*.45,Rs*.55],shade(C(0x3a4a2a),-.2));
 BIO.beam('rod',[T.x,T.y0,T.z],[T.x+rr(-.2,.2),T.y0+H*.55,T.z+rr(-.2,.2)],T.rb,T.rb*.6,rodCol(S,T.seed));
 const n=lv===2?ri(6,10):lv===1?4:3,cy=T.y0+H*.7;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=Rs*rr(.15,.75),y=T.y0+H*rr(.4,1.0),hc=vary(pick(S.leaf),.03,.1,.06),purple=rng()<.35;
  clumpAt('croton',T.x+Math.cos(a)*d,y,T.z+Math.sin(a)*d,Rs*rr(.8,1.25),.7,purple?C(pick(c2s)).lerp(hc,.4):hc,T.x,cy,T.z,Rs,H*.5,purple?hc:C(pick(c2s)));st.clumps++;}
 if(lv===2&&rng()<.3)for(let k=0,m=ri(1,3);k<m;k++)BIO.put('urchin',[T.x+rr(-.5,.5)*Rs,T.y0+H*rr(.9,1.15),T.z+rr(-.5,.5)*Rs],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.3,.5),bright(C(pick(PAL.accent)),1.15));};
// 19 the anemone stalk: a dark sinuous stalk, forking once or twice, each tip a red anemone spray
B[19]=function(T,st,lv){const S=SP[19],H=T.H,rb=T.rb,rc=shade(C(pick(S.bark)),-.1),tips=[];
 function stalk(x,y,z,a,h,r,dep){const m=4,pts=[];let px=x,py=y,pz=z,aa=a;for(let j=0;j<=m;j++){const u=j/m;pts.push({x:px,y:py,z:pz,r:r*(1-.5*u)});aa+=rr(-.7,.7);px+=Math.cos(aa)*h*.12;pz+=Math.sin(aa)*h*.12;py+=h/m;}
  st.limb+=BIO.tube('bark3',pts,rc,{seg:5});const e=pts[m];
  if(dep<1&&rng()<.6){stalk(e.x,e.y,e.z,aa+rr(1,2),h*rr(.35,.55),r*.7,dep+1);stalk(e.x,e.y,e.z,aa-rr(1,2),h*rr(.35,.55),r*.7,dep+1);}else tips.push(e);}
 stalk(T.x,T.y0,T.z,rr(0,TAU),H,rb,0);
 const col=bright(vary(pick(S.leaf),.02,.08,.05),1.2);
 tips.forEach(p=>{const R=T.crownR*rr(.8,1.2),n=lv===2?ri(3,5):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=R*rr(0,.4);BIO.put('anemone',[p.x+Math.cos(a)*d,p.y+rr(0,.4)*R,p.z+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),R*rr(1.4,2),col);st.blooms++;}});};
// 20 the pinecone succulent: a cone of fat lavender-blue leaves, pink at the tips, one to three to a plant
B[20]=function(T,st,lv){const S=SP[20],n=lv===2?ri(1,3):1,c2s=PAL.irid[S.irid],a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*2.2,d=k?rr(.6,1.4):0,R=T.crownR*rr(.8,1.2)*(k?.7:1),hc=vary(pick(S.leaf),.03,.06,.05);
  BIO.put('pinecone',[T.x+Math.cos(a)*d,T.y0+.35,T.z+Math.sin(a)*d],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*rr(1.2,1.7),R],bright(hc,1.15),{n:[0,1,0],c2:softC2(bright(C(0xe090c0),1.1),hc,.3)});st.rosettes++;}};
// 21 the carrot frill: the frill tree's smaller cousin, its fins longest low on the column and shrinking to a point, a head of hot-pink flowers at the tip
B[21]=function(T,st,lv){const S=SP[21],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1.05-.85*Math.pow(u,1.3))*(1+.4*Math.exp(-u*H/6));
 const rings=[],vs=8;for(let yy=0;yy<H*.94;yy+=vs*.5)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:Math.max(.3,rAt(yy/H)),yy:yy,col:barkCol(S,(Math.floor(yy/20)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(8,1,yy)*.4)});
 rings.push({x:T.x,y:T.y0+H*.94+1,z:T.z,r:.04,yy:H*.94+1,col:barkCol(S,1)});
 const ph=rr(0,TAU);
const ck=Math.min(1,H/50);
 st.trunk+=BIO.lathe('barkC',rings,T.young?16:lv===2?33:16,Math.max(1,Math.round(TAU*rb/5)),vs,(R,ang)=>R.r*(1+.10*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05);
 const rows=lv===2?Math.max(3,Math.round(H/3.6)):Math.max(2,Math.round(H/6)),nf=lv===2?nR:Math.ceil(nR/2);
 for(let r=0;r<rows;r++){const u=lerp(.05,.92,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.05;
  const Lp=lerp(9,1.2,Math.pow(u,1.15))*smooth(0,.12,u+.06)*ck;   // the carrot: long fins low, a point at the top; a sapling's in proportion
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=Lp*(.85+.3*fbm(u*9,k*.7,T.seed%97,1))*rr(.9,1.1);
   BIO.put('frill',[T.x+Math.cos(a)*R,yy,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(.75,1.15,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),{c2:bright(pick(c2s),1.15),n:[Math.cos(a)*.85,.5,Math.sin(a)*.85]});st.fins++;}}
 // the flower head: a crowd of hot-pink urchin blooms round the tip, a few hanging pods under them
 const top=T.y0+H*.94,pink=[0xff40a0,0xf03090,0xff58b0,0xe82a88],n=lv===2?ri(14,22):8;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(0,1.4)*ck,y=top+rr(-2.5,1.5)*ck,c=bright(vary(pick(pink),.01,.06,.05),1.25);BIO.put('urchin',[T.x+Math.cos(a)*d,y,T.z+Math.sin(a)*d],qEuler(rr(-.6,.6),rr(0,TAU),rr(-.6,.6)),rr(1.2,2.2)*mix(.45,1,ck),c);st.blooms++;}
 if(lv===2&&!T.young)for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);BIO.put('pod',[T.x+Math.cos(a)*1.2,top-2.5,T.z+Math.sin(a)*1.2],qEuler(0,rr(0,TAU),0),rr(2,3.5),bright(pick(pink),1.0));st.pods++;}
 T.spread=Math.max(T.crownR,(9+rb)*ck);reg(S,T);};
// 27 the beard tree: a gnarled short trunk, crooked boughs, small leaves, and everything draped: beard moss, moss mats, epiphyte rosettes, flowers of every colour
B[27]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.5*u)*(1+1.2*Math.exp(-u*H/2.5));
 const rings=[],vs=5;for(let yy=0;yy<H*.5;yy+=vs*.5)rings.push({x:T.x+.5*Math.sin(yy*.6+ti),y:T.y0+yy,z:T.z+.4*Math.cos(yy*.5+ti),r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/4)+ti)%3).lerp(C(PAL.moss[ti%3]),.4)});
 rings.push({x:T.x+.5*Math.sin(H*.3+ti),y:T.y0+H*.5+.5,z:T.z+.4*Math.cos(H*.25+ti),r:.05,yy:H*.5+.5,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+.12*Math.sin(3*ang+R.yy*.7)),null);
 const top={x:T.x+.5*Math.sin(H*.3+ti),y:T.y0+H*.48,z:T.z+.4*Math.cos(H*.25+ti)},nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.03,.08,.05),cy=T.y0+H*.8;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.5,.5),el=rr(.2,.7),len=T.crownR*rr(.7,1.1);
  const pts=treeGrow(top,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rAt(.5)*.6,.1,4,-.15,.22);
  let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+1.5,pts[i].r+1.5)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,1).lerp(C(PAL.moss[k%3]),.3),{seg:5,cap:true});
  for(let i=1;i<=4;i++){const p=pts[i];
   if(rng()<.8){clumpAt('leaflet',p.x+rr(-.5,.5),p.y+rr(0,1),p.z+rr(-.5,.5),rr(1.4,2.4),.5,hc,T.x,cy,T.z,T.crownR,H*.4);st.clumps++;}
   if(lv>=1){for(let b=0,m=lv===2?ri(2,4):1;b<m;b++){BIO.put('beard',[p.x+rr(-.5,.5),p.y-p.r*.5,p.z+rr(-.5,.5)],qEuler(0,rr(0,TAU),0),[rr(.8,1.6),rr(2,5),1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));st.moss++;}
    if(rng()<.5)BIO.put('mossmat',[p.x,p.y+p.r*.9,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.6,1.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));}
   if(lv===2&&rng()<.45){const R=rr(.4,.8);BIO.put(rng()<.5?'zebra':'irosette',[p.x,p.y+p.r*.8,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R,R*.7,R],rng()<.5?C(0xffffff).lerp(C(0xe0a0c0),.5):bright(vary(pick(PAL.highLight),.03,.08,.05),1.1),{c2:C(pick(PAL.irid.LG))});}
   if(lv===2&&rng()<.5){const fc=bright(C(pick(PAL.flowers)),1.15);for(let f=0,m=ri(2,5);f<m;f++)BIO.put(rng()<.5?'bloom':'anemone',[p.x+rr(-.8,.8),p.y+rr(-.3,.8),p.z+rr(-.8,.8)],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.3,.55),fc);st.blooms++;}}}
 reg(S,T,T.crownR);};
// 28 the cloud tree-fern: a fibrous trunk and a great radiating crown of light-green fronds, last season's hanging brown beneath
B[28]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?8:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('bigfrond',tx,ty,tz,Rf,n,-.12,.22,bright(hc,1.5),1.25);
 if(lv>=1){frondCrown('bigfrond',tx,ty+.5,tz,Rf*.62,lv===2?5:3,.55,1.1,bright(shade(hc,.1),1.5),1.1);
  for(let k=0,m=lv===2?ri(3,6):2;k<m;k++){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*rb*.9,ty-.6,tz+Math.sin(a)*rb*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.2,2),Rf*rr(.5,.8),1],bright(vary(0x6a5a3a,.02,.1,.06),1.1));}
  for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),yy=rr(1,H*.8);BIO.put('mossmat',[T.x+Math.cos(a)*rb*1.05,T.y0+yy,T.z+Math.sin(a)*rb*1.05],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(.5,1),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 st.fronds+=n;};
// 29 the lantern tree: a pale trunk, drooping boughs of small leaves hung with bright lantern pods in every colour
B[29]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),la=rr(0,TAU),lk=rr(0,.1);
 BIO.put('trunk2',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.55+.5,rb/.4],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 const tx=T.x+Math.cos(la)*lk*H*.55,tz=T.z+Math.sin(la)*lk*H*.55,ty=T.y0+H*.55,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.03,.08,.05),cy=T.y0+H*.9;
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),R=T.crownR*rr(.6,1),mid=[tx+Math.cos(a)*R*.5,ty+H*.3,tz+Math.sin(a)*R*.5],end=[tx+Math.cos(a)*R,ty+H*.12,tz+Math.sin(a)*R];   // the boughs rise then droop
  BIO.beam('rod',[tx,ty-.2,tz],mid,rb*.5,rb*.3,rc);BIO.beam('rod',mid,end,rb*.3,rb*.1,rc);
  [mid,end,[mix(mid[0],end[0],.5),mix(mid[1],end[1],.5),mix(mid[2],end[2],.5)]].forEach((p,i)=>{clumpAt('leaflet',p[0],p[1]+.3,p[2],rr(1.5,2.6),.55,hc,T.x,cy,T.z,T.crownR,H*.3);st.clumps++;
   if(lv>=1)for(let f=0,m=lv===2?ri(2,4):1;f<m;f++){BIO.put('pod',[p[0]+rr(-1,1),p[1]-.2,p[2]+rr(-1,1)],qEuler(0,rr(0,TAU),0),rr(1.6,2.6),bright(C(pick(PAL.flowers)),1.25));st.pods++;}});}
 if(lv===2)reg(S,T,T.crownR);};
// 30 the barrel frill: a fat, shrub-sized frill tree of the ridgetop, a ribbed barrel with short dense fins and a crown of blooms
B[30]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs,ph=rr(0,TAU);
 const rAt=u=>rb*(.75+.5*Math.sin(u*Math.PI)*(1-.3*u))*(1-.25*u);
 const rings=[];for(let yy=0;yy<H*.9;yy+=Math.max(.5,H/9))rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/1.5)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.9,z:T.z,r:rAt(.9)*.8,yy:H*.9,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.9+rAt(.9)*.7,z:T.z,r:.04,yy:H,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('bark4',rings,lv===2?18:12,Math.max(1,Math.round(TAU*rb/2)),2.5,(R,ang)=>R.r*(1+.12*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05),rows=lv===2?ri(5,7):3,nf=lv===2?nR:Math.ceil(nR/2);
 for(let r=0;r<rows;r++){const u=lerp(.1,.85,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.05,Lp=lerp(1.0,1.7,Math.sin(u*Math.PI))*(H/4);
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=Lp*rr(.85,1.15);
   BIO.put('frill',[T.x+Math.cos(a)*R,yy,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(.5,1.0,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),{c2:softC2(bright(pick(c2s),1.1),hc,.4),n:[Math.cos(a)*.8,.6,Math.sin(a)*.8]});st.fins++;}}
 const top=T.y0+H*.92,fc=bright(C(pick([0xe0c030,0xf0d040,0xb060d0,0xc070e0,0xf08040])),1.2);
 for(let k=0,m=lv===2?ri(5,9):3;k<m;k++){const a=rr(0,TAU),d=rr(0,.5)*rb;BIO.put('urchin',[T.x+Math.cos(a)*d,top+rr(0,.5),T.z+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),rr(.35,.6),fc);st.blooms++;}
 if(lv===2)reg(S,T,T.crownR+rb);};
// 31 the fan tree: a pale trunk forking two to four times, a head of big fans on every tip, violet-grey with the odd green one
B[31]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.45,tips=[];
 BIO.put('trunk2',[T.x,T.y0-.4,T.z],qUp([rr(-.04,.04),1,rr(-.04,.04)]),[rb/.4*1.1,hT+.4,rb/.4*1.1],tint(pick(S.bark),means().bark[2],rr(.85,1)));st.sapTris+=BIO.defs.trunk2.tris;
 function fork(p,a,el,len,r,dep){const e=[p[0]+Math.cos(a)*Math.cos(el)*len,p[1]+Math.sin(el)*len,p[2]+Math.sin(a)*Math.cos(el)*len];BIO.beam('rod',p,e,r,r*.7,rc);
  if(dep<2&&rng()<.7){const n=ri(2,3);for(let k=0;k<n;k++)fork(e,a+rr(-1.3,1.3),rr(.5,1.1),len*rr(.55,.75),r*.7,dep+1);}else tips.push(e);}
 const n1=ri(S.forks[0],S.forks[1]),a0=rr(0,TAU);for(let k=0;k<n1;k++)fork([T.x,T.y0+hT-.3,T.z],a0+k/n1*TAU+rr(-.3,.3),rr(.6,1.0),H*rr(.2,.3),rb*.6,0);
 const hc=vary(pick(S.leaf),.02,.06,.05),Rf=T.crownR*rr(.6,.85);
 tips.forEach(p=>{const n=lv===2?ri(6,9):4,ao=rr(0,TAU);for(let k=0;k<n;k++){const a=ao+k/n*TAU+rr(-.2,.2),tilt=rr(.35,.9);fanAt(p[0]+Math.cos(a)*.2,p[1]-.1,p[2]+Math.sin(a)*.2,a,Rf*rr(.9,1.15),tilt,bright(vary(rng()<.2?C(0x9aa070):hc,.02,.06,.05),1.35));st.fans++;}
  if(lv===2)for(let k=0;k<2;k++){const a=ao+k*2.5;fanAt(p[0],p[1]+.2,p[2],a,Rf*.7,rr(.05,.25),bright(shade(hc,.08),1.35));st.fans++;}
  if(lv===2&&rng()<.5)BIO.put('pod',[p[0],p[1]-.2,p[2]],qEuler(0,rr(0,TAU),0),rr(1.2,2),bright(C(pick(PAL.accent)),1.05));});
 if(lv===2)reg(S,T,T.crownR);};
// 32 the Rift stone pine: a leaning trunk, a few boughs, a flat umbrella of dark needle clumps (the Mediterranean crest's canon tree)
B[32]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),la=rr(0,TAU),lk=rr(.02,.14);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.6+.5,rb/.4],tint(pick(S.bark),means().bark[1],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H*.6,tz=T.z+Math.sin(la)*lk*H*.6,ty=T.y0+H*.6,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),spots=[],hc=vary(pick(S.leaf),.02,.06,.05);
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),R=T.crownR*rr(.5,.95),mid=[tx+Math.cos(a)*R*.45,ty+H*.2,tz+Math.sin(a)*R*.45],end=[tx+Math.cos(a)*R,ty+H*.3+rr(-.04,.04)*H,tz+Math.sin(a)*R];
  BIO.beam('rod',[tx,ty-.2,tz],mid,rb*.5,rb*.3,rc);BIO.beam('rod',mid,end,rb*.3,rb*.12,rc);spots.push(mid,end,end);}
 const cy=T.y0+H*.95,sz0=T.crownR*rr(.4,.55);
 spots.forEach(p=>{for(let c=0,m=lv===2?2:1;c<m;c++){const a=rr(0,TAU),d=sz0*.5*rng();clumpAt('needle',p[0]+Math.cos(a)*d,T.y0+H*rr(.86,1.0),p[2]+Math.sin(a)*d,sz0*rr(.85,1.2),.35,hc,T.x,cy,T.z,T.crownR,H*.15);st.clumps++;}});
 if(lv===2)reg(S,T,T.crownR);};
// 33 the silver scrub: a low rounded bush of silver-grey leaflets, purple bloom heads over it (the garrigue)
B[33]=function(T,st,lv){const S=SP[T.sp],H=T.H,Rs=T.crownR,hc=vary(pick(S.leaf),.02,.05,.04);
 BIO.put('lobe',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[Rs*.8,H*.6,Rs*.8],shade(hc,-.25));
 const n=lv===2?ri(3,5):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=Rs*rr(.1,.6);clumpAt('leaflet',T.x+Math.cos(a)*d,T.y0+H*rr(.4,.9),T.z+Math.sin(a)*d,Rs*rr(.8,1.2),.6,hc,T.x,T.y0+H*.6,T.z,Rs,H*.5);st.clumps++;}
 if(lv>=1&&rng()<.7){const fc=bright(C(pick([0x9a5ad0,0xb070e0,0x8a48c0,0xd0a0f0])),1.15);for(let k=0,m=lv===2?ri(3,7):2;k<m;k++){const a=rr(0,TAU),d=Rs*rr(0,.7);BIO.put('candle',[T.x+Math.cos(a)*d,T.y0+H*.8,T.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[H*.18,H*.45,H*.18],fc);st.blooms++;}}};
// the cloud forest's forms of the jungle trees: the same builders, the species record does the rest
B[23]=B[0];B[24]=B[1];B[25]=B[2];B[26]=B[17];
// ---------------------------------------------------------------- impostors (the far canopy)
// Blobs in the 'far' bucket, whose material (RIFT.farMat, 50-species) shifts a vertex toward a second colour with the
// view: its uv carries that colour (pack2) and the rule (1 the leaves', 2 the iridescent bark's; 0 none), so the
// impostors keep the iridescence of the trees they stand for. lite: the stand-in behind a hero tree, drawn only past
// RIFT.LOD.tree from the camera: coarser blobs, fewer of them, fewer fins.
let ICO=null,ICO0=null;
const icos=()=>{if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}};
const pack2=c=>{const q=v=>Math.round(Math.sqrt(clamp(v,0,1))*255);return q(c[0])*65536+q(c[1])*256+q(c[2]);};
const lin=h=>{const c=(h.isColor?h.clone():C(h)).convertSRGBToLinear();return[c.r,c.g,c.b];};
const IRB={0:'frill',23:'frill',21:'carrot',3:'trumpet',1:'bell',24:'bell'};   // the builders' iridescent barks (RIFT.IRIDBARK)
// an impostor's triangles carry its tree's lod key, like everything its hero puts
function keyed(K,T,tris,st){const kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}
// a blob: ca on top, cb below (linear), c2 the colour it turns (linear) or null. A blob is a whole crown facing every
// way at once, solid where the hero's leaves are cards and gaps, so it turns only part way (IRID_FAR) or it reads as paint
const IRID_FAR=.4;
const turn=(r,g,b,c2,s,k)=>pack2([r+(c2[0]*s-r)*k,g+(c2[1]*s-g)*k,b+(c2[2]*s-b)*k]);
function farBlob(K,ip,x,y,z,rx,ry,ca,cb,c2,sd){const k1=sd*7.3,k2=sd*3.1;
 if(c2)cb=[mix(cb[0],ca[0],.5),mix(cb[1],ca[1],.5),mix(cb[2],ca[2],.5)];   // the shift now carries the second colour: the underside only leans to it
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
  const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
  const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
  const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
  const r=mix(cb[0],ca[0],t)*sh,g=mix(cb[1],ca[1],t)*sh,b=mix(cb[2],ca[2],t)*sh;
  K.pos.push(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m);K.nor.push(dx/nl,ny/nl,dz/nl);K.col.push(r,g,b);K.uv.push(c2?turn(r,g,b,c2,sh,IRID_FAR):0,c2?1:0);}
 return ip.length/9;}
// a fin: one triangle standing out from the column at azimuth a, rising at elevation e (the frill trees' frill, a hint)
function farFin(K,T,a,y,r0,L,e,ca,c2){const cx=Math.cos(a),sz=Math.sin(a),nl=Math.hypot(.85,.5),r1=r0+L*Math.cos(e);
 [[T.x+cx*r0,y-L*.12,T.z+sz*r0,.75],[T.x+cx*r1,y+L*Math.sin(e),T.z+sz*r1,1.1],[T.x+cx*r0,y+L*.3,T.z+sz*r0,.85]].forEach(p=>{const s=p[3];
  K.pos.push(p[0],p[1],p[2]);K.nor.push(cx*.85/nl,.5/nl,sz*.85/nl);K.col.push(ca[0]*s,ca[1]*s,ca[2]*s);K.uv.push(c2?turn(ca[0]*s,ca[1]*s,ca[2]*s,c2,s,.7):0,c2?1:0);});
 return 1;}
function buildFar(T,fi,st,lite){const K=BIO.bucket('far');icos();const ip=lite?ICO0:ICO;
 const S=SP[T.sp],cheap=lite||BIO.lodD(T.x,T.z)>2200;let tris=0;
 const bc=lin(S.bark[fi%S.bark.length]),ib=IRB[T.sp]?RIFT.IRIDBARK[IRB[T.sp]]:null,seg=cheap?4:6,top=T.y0+T.H*(T.sp===0||T.sp===23?.9:T.sp===21?.9:T.sp===8?.68:T.sp===17||T.sp===22||T.sp===26?.72:.78),rings=[];
 (lite?[0,.5,1]:[0,.06,.5,1]).forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.5,T.rb*(T.sp===8?(1.1-.5*u):(1-.5*u))*(u<.08?1.6:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 // the bole: an iridescent bark facing the eye in its first colour and turning to its second at grazing angles, as its hero's does
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*(r2/rings.length);
  [A,D,E,A,E,Bq].forEach(p=>{K.pos.push(p[0],p[1],p[2]);K.nor.push(p[3],.05,p[4]);
   if(ib){K.col.push(bc[0]*sh*ib[0][0],bc[1]*sh*ib[0][1],bc[2]*sh*ib[0][2]);K.uv.push(pack2([bc[0]*sh*ib[1][0],bc[1]*sh*ib[1][1],bc[2]*sh*ib[1][2]]),2);}
   else{K.col.push(bc[0]*sh,bc[1]*sh,bc[2]*sh);K.uv.push(0,0);}});tris+=2;}
 // a stand-in a little darker: it stands for a hero whose crown is cards, gaps and shade, seen at 1.2 km and more
 const dk=lite?.8:1,L=S.leaf.map(h=>lin(bright(h,.85*dk))),R=T.crownR,a0=(T.seed%628)/100,I=S.irid?PAL.irid[S.irid].map(h=>lin(h).map(v=>v*dk)):null,c2=k=>I?I[k%I.length]:null;
 const blob=(x,y,z,rx,ry,ca,cb,sd,k)=>{tris+=farBlob(K,ip,x,y,z,rx,ry,ca,cb,k===false?null:c2(k||0),sd);};
 if(T.sp===0||T.sp===23){blob(T.x,T.y0+T.H*.5,T.z,R*.55,T.H*.42,L[fi%4],I?I[0]:L[2],fi,fi);blob(T.x,T.y0+T.H*.93,T.z,R*.8,T.H*.08,L[(fi+1)%4],L[2],fi+1,fi+1);
  // the frill: two rows of fins on the column and the splay at the summit, a triangle each (one row and three in the stand-in)
  const rAt=u=>T.rb*(1-.55*u)*(1+.5*Math.exp(-u*T.H/7)),fk=Math.min(1,T.H/100)*(SP[T.sp].key==='cloudfrill'?1.6:1),fc=k=>lin(bright(S.leaf[(fi+k)%S.leaf.length],1.1));
  (lite?[.55]:[.35,.65]).forEach((u,r)=>{const nf=lite?3:4;for(let k=0;k<nf;k++){const a=a0+(k+(r%2)*.5)/nf*TAU;tris+=farFin(K,T,a,T.y0+T.H*u,rAt(u),lerp(3.5,8.5,smooth(.05,.7,u))*fk*1.5,.95,fc(k),c2(k));}});
  for(let k=0,n=lite?3:5;k<n;k++){const a=a0+.4+k/n*TAU;tris+=farFin(K,T,a,T.y0+T.H*.9,rAt(.9)*.7,T.H*.11*mix(1.6,1,fk),.7,fc(k+2),c2(k+1));}}
 else if(T.sp===1||T.sp===24){for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.55,T.y0+T.H*.88+((k*7)%5),T.z+Math.sin(a)*R*.55,R*.4,T.H*.07,L[(k+fi)%4],I?I[k%I.length]:L[2],fi+k,k+1);}}
 else if(T.sp===2||T.sp===25){blob(T.x,T.y0+T.H*.86,T.z,R*.75,T.H*.14,L[fi%4],I?I[0]:L[2],fi,fi+1);}
 else if(T.sp===3){blob(T.x,T.y0+T.H*.92,T.z,R*.95,T.H*.06,L[fi%4],L[2],fi,fi);}
 else if(T.sp===32){blob(T.x,T.y0+T.H*.9,T.z,R*.85,T.H*.08,L[fi%4],L[2],fi);}
 else if(T.sp===4||T.sp===9){blob(T.x,T.y0+T.H*.78,T.z,R*.8,T.H*.2,L[fi%4],L[2],fi,fi);}
 else if(T.sp===8){blob(T.x,T.y0+T.H*.85,T.z,R*.8,T.H*.12,L[fi%4],L[2],fi);}
 else if(T.sp===21){blob(T.x,T.y0+T.H*.4,T.z,R*.8,T.H*.36,L[fi%4],I?I[0]:L[2],fi,fi+1);blob(T.x,T.y0+T.H*.94,T.z,R*.3,T.H*.05,lin(0xff40a0),lin(0xe82a88),fi+2,false);
  // the carrot frill's fins: longest low, shrinking up the column (a triangle each)
  const rAt=u=>T.rb*(1.05-.85*Math.pow(u,1.3))*(1+.4*Math.exp(-u*T.H/6)),ck=Math.min(1,T.H/50),fc=k=>lin(bright(S.leaf[(fi+k)%S.leaf.length],1.1));
  (lite?[.22]:[.16,.38]).forEach((u,r)=>{const nf=lite?3:4;for(let k=0;k<nf;k++){const a=a0+(k+(r%2)*.5)/nf*TAU;tris+=farFin(K,T,a,T.y0+T.H*u,rAt(u),lerp(9,1.2,Math.pow(u,1.15))*ck*1.4,.75,fc(k),c2(k));}});}
 else if(T.sp===22){blob(T.x,T.y0+T.H*.82,T.z,R*.9,T.H*.16,L[fi%4],I?I[0]:L[2],fi,fi+1);}
 else if(T.sp===17||T.sp===26){blob(T.x,T.y0+T.H*.8,T.z,R*.95,T.H*.07,L[fi%4],I?I[0]:L[2],fi,fi+1);if(!cheap)blob(T.x+Math.cos(a0)*R*.4,T.y0+T.H*.78,T.z+Math.sin(a0)*R*.4,R*.55,T.H*.06,L[1],I?I[1]:L[3],fi+3,fi+2);}
 else{blob(T.x,T.y0+T.H*.9,T.z,R*.9,T.H*.12,L[fi%4],L[2],fi,fi);}
 keyed(K,T,tris,st);}
// the SMALL species far off, and behind their heroes past RIFT.LOD.tree: one 20-triangle blob shaped by the habit, so
// the groves and the scrub still read at range instead of stopping at the band edge (the lowlands' buildFarSmall).
// No draws from the PRNG (the colours come from the tree's seed), so every hero builds exactly as before.
const SMALLF={6:'bush',7:'spike',10:'bush',12:'head',14:'head',15:'bush',18:'bush',19:'head',27:'crown',28:'crown',29:'crown',30:'tuft',31:'crown'};
function buildFarSmall(T,st){const K=BIO.bucket('far');icos();const S=SP[T.sp],ip=ICO0,hb=T.young?'spire':(SMALLF[T.sp]||'crown'),H=T.H,R=T.crownR,sd=T.seed;
 const ca=lin(bright(S.leaf[sd%S.leaf.length],.85)),cb=[ca[0]*.55,ca[1]*.55,ca[2]*.55],I=S.irid?PAL.irid[S.irid]:null,c2=I?lin(bright(I[(sd>>3)%I.length],.85)):null;
 let cy,rx,ry;
 if(hb==='bush'){cy=T.y0+H*.42;rx=R*.9;ry=Math.max(R*.45,H*.42);}               // a low mound: prism bush, purple fan, cycad, croton
 else if(hb==='tuft'){cy=T.y0+H*.45;rx=R*.75;ry=H*.48;}                          // a squat barrel: the barrel frill
 else if(hb==='spike'){cy=T.y0+H*.6;rx=Math.max(R*.5,.45);ry=H*.42;}             // candle stalks: a pale spire
 else if(hb==='head'){cy=T.y0+H*.74;rx=R*.85;ry=Math.max(R*.5,H*.22);}           // a head on a stem: tree aloe, groundsel, anemone stalk
 else if(hb==='spire'){cy=T.y0+H*.5;rx=Math.max(R*.5,T.rb*1.8);ry=H*.48;}        // the frill saplings: a finned column
 else{cy=T.y0+H*.66;rx=R*.85;ry=Math.max(R*.55,H*.3);}                            // a crown on a short bole: beard tree, tree-fern, lantern, fan tree
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],t=smooth(-.5,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1,s=mix(.55,1,t);
  const r=mix(cb[0],ca[0],t),g=mix(cb[1],ca[1],t),b=mix(cb[2],ca[2],t);
  K.pos.push(T.x+dx*rx,cy+dy*ry,T.z+dz*rx);K.nor.push(dx/nl,ny/nl,dz/nl);K.col.push(r,g,b);K.uv.push(c2?turn(r,g,b,c2,s,IRID_FAR):0,c2?1:0);}
 keyed(K,T,ip.length/9,st);}

// ---------------------------------------------------------------- the pass
RIFT.buildTrees=function(R,q){
 reseed(550011);q=q==null?1:q;R=R||3000;means();
 const st={trunk:0,limb:0,far:0,sapTris:0,forks:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fins:0,fans:0,domes:0,curls:0,candles:0,rosettes:0,heroes:0,fars:0,standins:0,byS:SP.map(()=>0)};
 const TREES=RIFT.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.5,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 // one species pass: a jittered grid over the whole disc, the zone weight
 // as acceptance; the hero radius says where it becomes an impostor / stops
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(y-BIO.waterH(x,z)<.3)return;
    if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp);
    if(opt.scale){const f=rr(opt.scale[0],opt.scale[1]);T.H*=f;T.rb*=Math.pow(f,.8);T.crownR*=f;T.young=true;}   // a sapling pass: the adult builder at a fraction of its size
    // farSmall: a small species kept past its mid radius as a far blob, which keeps nothing clear (the passes after it place as before)
    const ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);T.small=!opt.far;T.farB=!!opt.farSmall;
    if(T.lv===0&&!opt.far&&!opt.farSmall)return;
    TREES.push(T);n++;
    if(T.lv>0||opt.far)hadd({x:x,z:z,r:T.rb*1.4+1});},{patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:1});
  return n;}
 // the jungle: frill trees over everything, bell palms and lobe trees in stands, pagoda trees, trumpet trees
 pass(0,120,(Z)=>Z.jung*.7,{hero:950,mid:1700,far:true,pad:10,patch:.3});
 (function(){let n=0;BIO.grid(52,0,R,(x,z)=>{const Z=zones(x,z);return Z.jung*.72*q;},(x,y,z)=>{if(y-BIO.waterH(x,z)<.3||blocked(x,z,5)||!BIO.clearOf(x,z,7))return;
   const sp=BIO.stand(x,z,2,.3,.0022,71)===0?1:2,T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<900?2:(ld<1600?1:0);TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},{patch:.55,patchScale:.008,pad:1});st.canopy=n;})();
 pass(4,60,(Z)=>Z.jung*.28+Z.cloud*.8,{hero:1000,mid:1800,far:true,pad:5,patch:.5});
 pass(3,40,(Z)=>Z.jung*.30+Z.cloud*.10+Z.shore*.12,{hero:900,mid:1500,far:true,pad:2.5,lodK:.5});
 pass(5,28,(Z)=>Z.jung*.24+Z.cloud*.22+Z.shore*.08,{hero:800,mid:1300,far:false,pad:1.2,lodK:.7,patch:.5});
 pass(6,26,(Z)=>Z.jung*.38+Z.cloud*.10,{hero:800,mid:1300,far:false,farSmall:true,pad:1.5,lodK:.7,patch:.5});
 // the savannah: baobabs, monkey-puzzles (also up the dry slope), acacias, purple fan shrubs, candle stalks, dragon trees and tree aloes (also the crest)
 pass(8,90,(Z)=>Z.sav*.55*smooth(.12,.02,Z.up),{hero:1000,mid:1900,far:true,pad:8,patch:.4});
 pass(9,70,(Z)=>Z.sav*.28+Z.slope*.40,{hero:1000,mid:1900,far:true,pad:5,patch:.5,patchScale:.007});
 pass(13,48,(Z)=>Z.sav*.5,{hero:1000,mid:1800,far:true,pad:3,patch:.5});
 pass(11,38,(Z)=>Z.sav*.22+Z.slope*.6+Z.peak*.2,{hero:950,mid:1700,far:true,pad:2.5,patch:.5});
 pass(12,36,(Z)=>Z.sav*.22+Z.slope*.3+Z.peak*.3,{hero:900,mid:1400,far:false,farSmall:true,pad:2,lodK:.6});
 pass(10,26,(Z)=>Z.sav*.30+Z.slope*.10,{hero:900,mid:1300,far:false,farSmall:true,pad:1.5,lodK:.7,patch:.5});
 pass(7,24,(Z)=>Z.sav*.35+Z.peak*.2+Z.jung*.06+Z.slope*.15,{hero:900,mid:1300,far:false,farSmall:true,pad:1.5,lodK:.6,patch:.5});
 // the cloud forest: the jungle's forms in light green (frill, bell palm, lobe tree, parasol), the beard tree, the tree-fern, the lantern tree
 pass(23,34,(Z)=>Z.cloud*.7,{hero:900,mid:1500,far:true,pad:3.5,patch:.35});
 pass(24,22,(Z)=>Z.cloud*.65,{hero:950,mid:1500,far:true,pad:2.5,patch:.45});
 pass(25,22,(Z)=>Z.cloud*.6,{hero:950,mid:1500,far:true,pad:2.5,patch:.45});
 pass(26,36,(Z)=>Z.cloud*.8,{hero:900,mid:1500,far:true,pad:4,patch:.45});
 pass(27,22,(Z)=>Z.cloud*.7,{hero:950,mid:1500,far:false,farSmall:true,pad:2.5,lodK:.5});
 pass(28,17,(Z)=>Z.cloud*.75+Z.jung*.04,{hero:900,mid:1400,far:false,farSmall:true,pad:1.6,lodK:.6});
 pass(29,24,(Z)=>Z.cloud*.75,{hero:950,mid:1500,far:false,farSmall:true,pad:2,lodK:.6});
 // the highland: groundsels in the cloud forest, cycads on the dry flanks and the crest, pines on the peak
 pass(14,20,(Z)=>Z.cloud*.85+Z.peak*.2,{hero:900,mid:1400,far:false,farSmall:true,pad:2,lodK:.5});
 pass(15,34,(Z)=>Z.slope*.35+Z.peak*.3+Z.cloud*.15+Z.sav*.10,{hero:850,mid:1300,far:false,farSmall:true,pad:2,lodK:.6});
 pass(16,44,(Z)=>Z.peak*.45,{hero:1000,mid:1700,far:true,pad:3,patch:.5});
 // the ridgetop: stone pines, fan trees, barrel frills and silver scrub over the crest and the dry flanks
 pass(32,40,(Z)=>Z.peak*.7+Z.slope*.25,{hero:1000,mid:1700,far:true,pad:3,patch:.5});
 pass(31,36,(Z)=>Z.peak*.5+Z.slope*.35,{hero:950,mid:1500,far:false,farSmall:true,pad:2,lodK:.6,patch:.5});
 pass(30,26,(Z)=>Z.peak*.65+Z.slope*.4+Z.sav*.05,{hero:900,mid:1400,far:false,farSmall:true,pad:1.5,lodK:.7,patch:.5});
 pass(33,22,(Z)=>Z.peak*.75+Z.slope*.45,{hero:850,mid:1300,far:false,pad:1,lodK:.8,patch:.45});
 // the parasol tree over the jungle in its own stands, anemone stalks in the wet, crotons on both sides, pinecone succulents on the dry side
 pass(17,70,(Z)=>Z.jung*.55,{hero:900,mid:1600,far:true,pad:7,patch:.5,patchScale:.006});
 pass(21,64,(Z)=>Z.jung*.5+Z.cloud*.1,{hero:900,mid:1600,far:true,pad:6,patch:.45,patchScale:.007});
 pass(22,66,(Z)=>Z.jung*.5,{hero:900,mid:1600,far:true,pad:6,patch:.5,patchScale:.0055});
 // the saplings: young frill trees and carrot frills in the understorey, the adult builders at a fraction of their size
 pass(0,30,(Z)=>Z.jung*.32,{hero:850,mid:1400,far:false,farSmall:true,pad:2,lodK:.6,patch:.5,scale:[.1,.28]});
 pass(21,26,(Z)=>Z.jung*.36+Z.cloud*.08,{hero:850,mid:1400,far:false,farSmall:true,pad:1.5,lodK:.6,patch:.5,scale:[.12,.35]});
 pass(19,26,(Z)=>Z.jung*.32+Z.shore*.15+Z.jung*Z.flow*.3,{hero:850,mid:1300,far:false,farSmall:true,pad:1.5,lodK:.7,patch:.5});
 pass(18,24,(Z)=>Z.sav*.42+Z.slope*.2+Z.jung*.22,{hero:900,mid:1300,far:false,farSmall:true,pad:1.5,lodK:.7,patch:.5});
 pass(20,20,(Z)=>Z.sav*.42+Z.slope*.3+Z.jung*.05,{hero:900,mid:1300,far:false,pad:1,lodK:.7,patch:.5});
 // build. The runtime LOD (BIO.range, the core's; xanadu's use of it): a hero tree is drawn in full while the camera is
 // within RIFT.LOD.tree of its chunk and as its stand-in impostor past that; a far tree is only ever its impostor (range
 // 1e9: always in range, culled by chunk against the view). A small species stands in as a 20-triangle blob, or not at
 // all (the curls, pinecones and silver scrub: under a pixel at that range).
 // The impostors are charged to their own pass ('rift/far': held, but never drawn with their heroes).
 const cur=BIO.cur,farCur=cur==='rift/trees'?'rift/far':cur,LOD=RIFT.LOD;
 TREES.forEach((T,i)=>{BIO.owner=[T.x,T.z];const rh=LOD.tree;
  if(T.lv===0){BIO.cur=farCur;BIO.range=1e9;BIO.minRange=0;if(T.small)buildFarSmall(T,st);else buildFar(T,i,st,false);st.fars++;BIO.cur=cur;}
  else{BIO.range=rh;BIO.minRange=0;B[T.sp](T,st,T.lv);st.heroes++;
   if(!T.small||T.farB){BIO.cur=farCur;BIO.range=1e9;BIO.minRange=rh;if(T.small)buildFarSmall(T,st);else buildFar(T,i,st,true);st.standins++;BIO.cur=cur;}}
  st.byS[T.sp]++;});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,standins:st.standins,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,fins:st.fins,fans:st.fans,domes:st.domes,curls:st.curls,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far,small:st.sapTris}};};
RIFT._canopyH=function(x,z){let h=0;for(const T of RIFT.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||12;};
})();
