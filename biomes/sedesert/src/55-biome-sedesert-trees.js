// ================================================================= EASTERN HIGH DESERT — trees
// The thirteen tree-scale species of the eastern high desert, each with its
// own builder, placed by zone from the host's climate fields (wet / flow /
// upland / canyon / rim / rock / dune / oasis / slope) and terrainH. The zone
// weights are computed HERE from those fields, never from the host's map: a
// world that binds the same fields gets the same zoning. Beyond the LOD spine
// a tree (not a mesquite shrub) becomes an impostor in the 'far' bucket: blobs
// on a pole, or for the twist-candles spires standing in the local water. The
// small ones thin out with distance as well. Every count scales with q; the
// core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=SEDESERT.SPECIES,PAL=SEDESERT.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=SEDESERT.C;
SEDESERT.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. A plant's aridity tag is honoured by which weight it reads:
// 'arid' species read scrub / bad / mtn (dry ground only), 'humid' ones bank /
// oasis, 'semiarid' the rim and the benches as well as the floor.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),up=F('upland'),can=F('canyon'),rim=F('rim'),rock=F('rock'),dune=F('dune'),oasis=F('oasis'),slope=F('slope'),ab=F('abyss');
 const open=(1-can)*(1-dune)*(1-ab),gentle=smooth(.55,.25,slope);
 return{wet,flow,up,can,rim,rock,dune,oasis,slope,ab,
  rip:can*smooth(.5,.85,wet)*gentle,                 // the canyon floor
  bank:can*flow*gentle,                              // its banks
  bench:smooth(.15,.45,can)*smooth(.95,.7,can),      // the walls' benches
  oasis:oasis*(1-can),
  scrub:open*(1-rock*.75)*smooth(.55,.1,up)*(1-oasis*.6)*gentle,
  bad:open*rock*smooth(.6,.2,up),
  mtn:open*smooth(.06,.3,up)*smooth(.95,.6,up),
  desert:dune};}
SEDESERT.zones=zones;
// the scrub's stands: which of the three big succulents dominates here (0 candelabra, 1 cardon, 2 Joshua tree)
SEDESERT.standOf=(x,z)=>BIO.standAt(x,z,3,.0022,71);

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:SEDESERT.BARKTEX.map(t=>texMean(t)),wood:texMean(SEDESERT.WOODTEX),rock:texMean(SEDESERT.ROCKTEX)};return MEAN;}
Object.assign(SEDESERT,{means,tint,bright,shade,vary});
// a species' bark colour on its texture: 39 distinct answers over 130k calls, so memoised
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
// an untextured rod / lobe in a species' bark colour: the designer's colour, a shade down
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.25);
// a leaf colour from a palette: a jittered pick, brightened (the floor and the dressing use it too)
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
SEDESERT.leafCol=leafCol;
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
SEDESERT.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,wid){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);frondAt(item,x,y,z,a,Rf*rr(.85,1.1),rr(p0,p1),bright(col,rr(.88,1.1)),wid);}}
// a SCATTER OF BLOOMS in a disc of radius r: one colour per head, every fourth bloom
// shaded (the tree heads); o.flat lays them on the ground with no shading (the floor)
function blooms(x,y,z,r,n,set,sz,o){o=o||{};const c=bright(vary(pick(set||PAL.comp),.03,.1,.08),1.15),tl=o.tilt==null?.5:o.tilt;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(o.s0==null?.3:o.s0,o.s1==null?.55:o.s1);
  BIO.put('bloom',[x+Math.cos(a)*d,y+(o.flat?rr(0,.4):rr(-.3,.4)*r),z+Math.sin(a)*d],qEuler(rr(-tl,tl),rr(0,TAU),rr(-tl,tl)),s,(o.flat||i%4)?c:shade(c,rr(-.1,.2)));}}
const bloomsAt=blooms;SEDESERT.blooms=blooms;
// the volume the world's inspector names a tree by
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed} and lv 2 near / 1 mid / 0 far
const B=[];
// a DICHOTOMOUS TREE: a bole, then forks that each split in two, a tuft at every tip
// (the dragon tree's umbrella, the quiver tree's dome, the Joshua tree's gnarl). cfg:
// fam bucket, item tuft item, boleU fraction of H for the bole, el0 first fork
// elevation, spread the opening angle per level, tuftK tuft size vs crownR, flat
function forkTree(T,st,lv,cfg){const S=SP[T.sp],fam=cfg.fam,H=T.H,rb=T.rb,ti=T.seed%3;
 const boleH=H*cfg.boleU,rAt=u=>rb*(1-.35*u)*(1+.5*Math.exp(-u*boleH/2.5));
 const rings=[],vs=5,lean=rr(0,cfg.lean||.04),la=rr(0,TAU);
 for(let yy=0;yy<boleH;yy+=vs*.5){const u=yy/boleH;rings.push({x:T.x+Math.cos(la)*lean*yy,y:T.y0+yy,z:T.z+Math.sin(la)*lean*yy,r:rAt(u),yy:yy,col:barkCol(S,(Math.floor(yy/6)+ti)%S.bark.length)});}
 const top={x:T.x+Math.cos(la)*lean*boleH,y:T.y0+boleH,z:T.z+Math.sin(la)*lean*boleH};
 rings.push({x:top.x,y:top.y,z:top.z,r:rAt(1),yy:boleH,col:barkCol(S,1)},{x:top.x,y:top.y+rAt(1)*.8,z:top.z,r:.05,yy:boleH+1,col:barkCol(S,1)});   // closed with a dome, never an open pipe
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe(fam,rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+(cfg.flute||.03)*Math.sin(4*ang+R.yy*.1+ph)),null);
 const spots=[],NL=lv===2?S.forks:Math.max(2,S.forks-2);   // a mid-range tree forks two levels less and wears bigger tufts
 function fork(o,d,lvl,r0){const len=H*S.forkLen[lvl]*rr(.85,1.15)*(lv===2?1:1.25),pts=treeGrow(o,d,len,r0,Math.max(.08,r0*.55),3,cfg.curve==null?.06:cfg.curve,cfg.wig==null?.06:cfg.wig);
  for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+1.5,pts[i].r+1.5))return;
  st.limb+=BIO.tube(fam,pts,barkCol(S,2),{seg:r0>.5?6:lvl>2?3:4,cap:lvl===NL-1});st.forks++;
  const e=pts[pts.length-1];
  if(lvl<NL-1){const sx=-d[2],sz=d[0],sl=Math.hypot(sx,sz)||1,side=[sx/sl,0,sz/sl],spread=cfg.spread*rr(.8,1.2),tw=rr(0,TAU);
   for(let k=-1;k<=1;k+=2){const dd=[d[0]*Math.cos(spread)+side[0]*Math.sin(spread)*k+Math.cos(tw)*.12,d[1]*Math.cos(spread)+(cfg.rise==null?.12:cfg.rise),d[2]*Math.cos(spread)+side[2]*Math.sin(spread)*k+Math.sin(tw)*.12],l=Math.hypot(dd[0],dd[1],dd[2]);
    fork({x:e.x,y:e.y,z:e.z},[dd[0]/l,dd[1]/l,dd[2]/l],lvl+1,Math.max(.08,r0*.62));}}
  else spots.push({p:e,s:len*.3});}
 const a0=rr(0,TAU),nTop=cfg.nTop||2;
 for(let k=0;k<nTop;k++){const a=a0+k/nTop*TAU+rr(-.3,.3),el=cfg.el0*rr(.85,1.15);fork(top,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],0,rAt(1)*.75);}
 if(!spots.length)spots.push({p:top,s:2},{p:{x:top.x,y:top.y+1,z:top.z},s:1.5});   // hemmed in by an obstacle: a tuft on the pole at least
 // a FILLED crown (the dragon tree): tufts between the tips too, so the umbrella closes
 if(cfg.fill&&lv===2&&spots.length>3){const n=Math.round(spots.length*cfg.fill);for(let i=0;i<n;i++){const a=pick(spots),b=pick(spots);if(a===b)continue;
  spots.push({p:{x:(a.p.x+b.p.x)/2,y:(a.p.y+b.p.y)/2+rr(-.3,.3),z:(a.p.z+b.p.z)/2},s:(a.s+b.s)/2,fill:true});}}
 const cy=T.y0+H*.9,ex=T.crownR,ey=H*.25,sz0=T.crownR*cfg.tuftK*(lv===2?1:1.6),nC=lv===2?cfg.nC:Math.max(1,Math.round(cfg.nC*.5));let mine=0;
 spots.forEach(s=>{for(let c=0;c<nC;c++){const a=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(0,.6)*s.s;
  if(!clear3(x,y,z,sz0*.5,sz0*.4))continue;clumpAt(cfg.item,x,y,z,sz0*rr(.85,1.2),cfg.flat,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;mine++;}
  if(cfg.skirt&&lv===2&&!s.fill&&rng()<.7){BIO.put('strand',[s.p.x,s.p.y-.1,s.p.z],qEuler(0,rr(0,TAU),0),[sz0*.6,sz0*rr(.5,.9),1],bright(vary(0x8a7a5a,.02,.08,.06),1.1));}   // last year's dead leaves under the tuft
  if(cfg.bloom&&lv===2&&rng()<cfg.bloom){BIO.put('plume',[s.p.x,s.p.y+sz0*.5,s.p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),sz0*rr(.5,.8),bright(vary(pick(cfg.bloomCol),.02,.1,.06),1.2),{n:[0,1,0]});}});
 if(!mine){clumpAt(cfg.item,top.x,top.y+1,top.z,sz0,cfg.flat,C(pick(S.leaf)),T.x,cy,T.z,ex,ey);st.clumps++;}
 let spread=T.crownR*.6,topY=top.y+2;spots.forEach(s=>{spread=Math.max(spread,Math.hypot(s.p.x-T.x,s.p.z-T.z)+s.s);topY=Math.max(topY,s.p.y+s.s+sz0);});
 // registered by the crown's real reach (the forks rise past H), or the probe finds an empty volume
 regTree(T,S,spread,topY-T.y0);}
// 0 the dragon tree: a straight pale bole, an umbrella of forks, dense stiff tufts, red resin on the bark
B[0]=function(T,st,lv){forkTree(T,st,lv,{fam:'bark0',item:'strap',boleU:.42,el0:1.1,spread:.48,rise:.12,curve:.08,wig:.04,tuftK:.3,flat:.6,nC:2,nTop:ri(3,5),fill:.5,flute:.05});
 if(lv===2){const S=SP[0];for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),yy=rr(.5,T.H*.45);BIO.put('lichen',[T.x+Math.cos(a)*(T.rb*1.02),T.y0+yy,T.z+Math.sin(a)*(T.rb*1.02)],qUp([Math.cos(a),0,Math.sin(a)]),rr(.3,.7),bright(C(S.resin),1.3));}}};   // resin bleeds
// 5 the quiver tree: a gold peeling bole, a dome of forks, fat aloe rosettes
B[5]=function(T,st,lv){forkTree(T,st,lv,{fam:'bark2',item:'aloe',boleU:.55,el0:1.15,spread:.5,rise:.15,curve:.04,wig:.05,tuftK:.34,flat:.65,nC:2,nTop:2,bloom:.35,bloomCol:PAL.spike});};
// 11 the Joshua tree: a shaggy bole, a few gnarled forks, dagger tufts each over a skirt of dead leaves
B[11]=function(T,st,lv){forkTree(T,st,lv,{fam:'bark1',item:'dagger',boleU:.4,el0:.9,spread:.7,rise:.05,curve:.12,wig:.16,tuftK:.4,flat:.8,nC:2,nTop:ri(1,3),skirt:true,lean:.08,bloom:.2,bloomCol:[0xf0e8c0,0xe8e0b8]});};
// a SUCCULENT COLUMN TREE: a trunk, thick arms, and columns rising from the arms
// in a dome (the giant candelabra) or a vase (the cardon)
function columnTree(T,st,lv,cfg){const S=SP[T.sp],fam=cfg.fam,H=T.H,rb=T.rb,ti=T.seed%3;
 const trH=H*cfg.trunkU,rAt=u=>rb*(1-.25*u)*(1+.6*Math.exp(-u*trH/2.5));
 const rings=[],vs=6;for(let yy=0;yy<trH;yy+=vs*.5)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/trH),yy:yy,col:barkCol(S,(Math.floor(yy/5)+ti)%S.bark.length)});
 rings.push({x:T.x,y:T.y0+trH,z:T.z,r:rAt(1),yy:trH,col:barkCol(S,1)},{x:T.x,y:T.y0+trH+rAt(1)*.6,z:T.z,r:.05,yy:trH+1,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+cfg.flute*Math.sin(cfg.nrib*ang)),null);
 // the arms
 const nA=lv===2?ri(cfg.arms[0],cfg.arms[1]):ri(3,4),a0=rr(0,TAU),spots=[];const hc=C(pick(S.leaf));
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),el=cfg.armEl*rr(.8,1.2),len=T.crownR*cfg.armK*rr(.8,1.1),r0=rAt(1)*rr(.45,.6);
  const o={x:T.x+Math.cos(a)*rAt(1)*.5,y:T.y0+trH*rr(.8,1),z:T.z+Math.sin(a)*rAt(1)*.5},pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,r0*.55,4,cfg.armCurve,.05);
  let ok=true;for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+2,pts[i].r+2)){ok=false;break;}if(!ok)continue;
  st.limb+=BIO.tube(fam,pts,barkCol(S,2),{seg:r0>.8?6:4,cap:true});
  for(let s=1;s<=4;s++){const p=pts[s],u=s/4;spots.push({p:p,r:p.r,u:Math.hypot(p.x-T.x,p.z-T.z)/T.crownR,along:u});}}
 spots.push({p:{x:T.x,y:T.y0+trH,z:T.z,r:rAt(1)*.6},r:rAt(1)*.6,u:0,along:1});
 // the columns: from every arm point a cluster rises; height by the dome / vase shape
 const nCol=lv===2?ri(S.cols[0],S.cols[1]):Math.round(S.cols[0]*.45);let placed=0;
 const dome=u=>cfg.vase?mix(.55,1,smooth(0,1,u)):mix(1,.35,u*u);
 const topY=T.y0+H;
 for(let i=0;i<nCol&&spots.length;i++){const s=spots[i%spots.length],a=rr(0,TAU),d=Math.max(.3,s.r)*rr(.4,1.6)+(i%3?0:rr(0,1.5));
  const x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,u=clamp(Math.hypot(x-T.x,z-T.z)/T.crownR,0,1.2);
  const h=(topY-s.p.y)*dome(u)*rr(.7,1.05),w=cfg.colW*rb*rr(.8,1.25);if(h<1.5)continue;
  const tilt=(cfg.vase?.14:.06)*u*rr(.5,1.4),ta=Math.atan2(z-T.z,x-T.x);
  if(!clear3(x,s.p.y+h*.5,z,w,h*.5))continue;
  BIO.put('column',[x,s.p.y-.3,z],qEuler(Math.sin(ta)*tilt,rr(0,TAU),-Math.cos(ta)*tilt),[w,h+.3,w],bright(vary(i%5?hc:C(pick(S.leaf)),.02,.06,.05),rr(.9,1.08)));placed++;
  if(lv===2&&rng()<cfg.sideK){const hh=h*rr(.25,.5),yy=s.p.y+h*rr(.3,.7),aa=rr(0,TAU);BIO.put('column',[x+Math.cos(aa)*w*.7,yy,z+Math.sin(aa)*w*.7],qEuler(Math.sin(aa)*.5,0,-Math.cos(aa)*.5),[w*.6,hh,w*.6],bright(vary(hc,.02,.06,.05),1.0));placed++;}
  if(lv===2&&cfg.bloom&&rng()<.12)bloomsAt(x,s.p.y+h+.3,z,w*.8,ri(2,5),cfg.bloom,[.25,.45]);}
 if(!placed){BIO.put('column',[T.x,T.y0+trH-.3,T.z],qEuler(0,0,0),[cfg.colW*rb,H-trH,cfg.colW*rb],bright(hc,1.0));placed++;}
 st.cols+=placed;regTree(T,S,T.crownR,T.H);}
// 1 the giant candelabra: a ribbed green trunk, arms, and a dome of hundreds of ribbed columns
B[1]=function(T,st,lv){columnTree(T,st,lv,{fam:'bark4',trunkU:.22,flute:.08,nrib:9,arms:[6,10],armEl:.55,armK:.75,armCurve:.28,colW:.62,vase:false,sideK:.35,bloom:null});};
// 2 the cardon: a woody furrowed trunk, arms fanning out, a vase of thick blue-grey columns
B[2]=function(T,st,lv){columnTree(T,st,lv,{fam:'bark3',trunkU:.28,flute:.05,nrib:6,arms:[4,7],armEl:.45,armK:.8,armCurve:.35,colW:.8,vase:true,sideK:.5,bloom:[0xf4ecd8,0xf8f0e0]});};
// 3 the bottle tree: a swollen spiny bottle, a few stubby branches with strap tufts and pink blooms
B[3]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3,bH=H*.68;
 const rAt=u=>rb*(.9+.75*Math.pow(Math.sin(clamp(u*1.15,0,1)*Math.PI),.7)*(1-u*.4))*(u>.92?mix(1,.35,(u-.92)/.08):1);
 const rings=[],vs=4;for(let yy=0;yy<=bH;yy+=vs*.4){const u=yy/bH;rings.push({x:T.x,y:T.y0+yy,z:T.z,r:Math.max(.12,rAt(u)),yy:yy,col:barkCol(S,(Math.floor(yy/4)+ti)%3)});}
 rings.push({x:T.x,y:T.y0+bH+.4,z:T.z,r:.05,yy:bH+.5,col:barkCol(S,1)});
 const ph=rr(0,TAU);st.trunk+=BIO.lathe(fam,rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/2.5)),vs,(R,ang)=>R.r*(1+.04*Math.sin(7*ang+ph)+.02*Math.sin(13*ang+R.yy)),null);
 const spots=[],nB=ri(2,4),a0=rr(0,TAU),top={x:T.x,y:T.y0+bH,z:T.z};
 for(let k=0;k<nB;k++){const a=a0+k*GOLD,el=rr(.6,1.2),len=(H-bH)*rr(.8,1.2),pts=treeGrow({x:T.x+Math.cos(a)*rAt(.9)*.5,y:T.y0+bH*rr(.86,.98),z:T.z+Math.sin(a)*rAt(.9)*.5},[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rb*.28,.12,3,.05,.08);
  st.limb+=BIO.tube(fam,pts,barkCol(S,2),{seg:5,cap:true});spots.push(pts[3],pts[2]);}
 spots.push(top);
 const cy=T.y0+H*.9,sz0=T.crownR*rr(.45,.6);
 spots.forEach((p,i)=>{if(lv<2&&i%2)return;clumpAt('strap',p.x,p.y+sz0*.2,p.z,sz0*rr(.9,1.2),.5,C(pick(S.leaf)),T.x,cy,T.z,T.crownR,H*.3);st.clumps++;
  if(rng()<.75)bloomsAt(p.x,p.y+sz0*.5,p.z,sz0*.6,lv===2?ri(5,12):3,PAL.comp,[.35,.6]);st.blooms++;});
 regTree(T,S,T.crownR,T.H);};
// 4 the boojum: a tapering pole, bristled all the way up, sometimes forking near the top, a yellow plume at every tip
B[4]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3,la=rr(0,TAU),bend=rr(0,.12);
 const rAt=u=>rb*(1-.9*u)+.06;
 const poleAt=u=>({x:T.x+Math.cos(la)*bend*H*u*u,y:T.y0+H*u,z:T.z+Math.sin(la)*bend*H*u*u});
 const rings=[];for(let u=0;u<=1;u+=.06){const p=poleAt(u);rings.push({x:p.x,y:p.y,z:p.z,r:rAt(u),yy:u*H,col:barkCol(S,(Math.floor(u*8)+ti)%3)});}
 const e=poleAt(1);rings.push({x:e.x,y:e.y+.4,z:e.z,r:.03,yy:H+.4,col:barkCol(S,1)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?8:6,2,6,(R,ang)=>R.r,null);
 const tips=[e];
 if(rng()<.55){const nF=ri(1,2);for(let k=0;k<nF;k++){const u0=rr(.5,.75),o=poleAt(u0),a=rr(0,TAU),el=rr(.9,1.25),len=H*(1-u0)*rr(.8,1.1);
  const pts=treeGrow(o,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rAt(u0)*.7,.06,3,.02,.05);st.limb+=BIO.tube(fam,pts,barkCol(S,1),{seg:5,cap:true});tips.push(pts[3]);}}
 const hc=vary(pick(S.leaf),.02,.08,.05);
 if(lv>=1){const step=lv===2?1.3:2.6;for(let yy=1.5;yy<H*.96;yy+=step){const u=yy/H,p=poleAt(u),n=lv===2?3:2;
  for(let k=0;k<n;k++){const a=rr(0,TAU),L=rr(.8,1.6)*(1-.4*u);frondAt('bristle',p.x+Math.cos(a)*rAt(u),p.y,p.z+Math.sin(a)*rAt(u),a,L,rr(-.2,.3),bright(hc,rr(.9,1.1)),.9);}}}
 tips.forEach(p=>{BIO.put('plume',[p.x,p.y+.5,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(1.2,2.2),bright(vary(0xd8c040,.02,.1,.06),1.2),{n:[0,1,0]});st.blooms++;});
 if(lv===2)regTree(T,S,T.crownR,T.H);};
// 6 the mesquite: several dark stems leaning out from the base, feathery yellow-green foliage, pods hanging in season
B[6]=function(T,st,lv){const S=SP[T.sp],fam='bark3',H=T.H,rb=T.rb,shrub=H<6.5;
 const nS=shrub?ri(3,6):ri(2,4),a0=rr(0,TAU),spots=[],hc=C(pick(S.leaf));
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.4,.4),el=shrub?rr(.5,1.0):rr(.8,1.25),len=H*rr(.55,.8),r0=rb*rr(.6,1)*(shrub?.5:1);
  const pts=treeGrow({x:T.x+Math.cos(a)*rb*.4,y:T.y0-.3,z:T.z+Math.sin(a)*rb*.4},[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,r0,r0*.35,4,-.15,.1);
  if(shrub){for(let i=0;i<pts.length-1;i++)BIO.beam('rod',[pts[i].x,pts[i].y,pts[i].z],[pts[i+1].x,pts[i+1].y,pts[i+1].z],pts[i].r,pts[i+1].r,rodCol(S,k));}
  else st.limb+=BIO.tube(fam,pts,barkCol(S,k),{seg:5,cap:true});
  for(let s=2;s<=4;s++)spots.push({p:pts[s],s:len*.22});
  // secondaries
  const nSec=shrub?(lv===2?2:1):(lv===2?3:2);
  for(let q=0;q<nSec;q++){const p=pts[ri(2,3)],a2=a+rr(-1.2,1.2),el2=rr(.1,.7),len2=len*rr(.35,.6);
   const sec=treeGrow({x:p.x,y:p.y,z:p.z},[Math.cos(a2)*Math.cos(el2),Math.sin(el2),Math.sin(a2)*Math.cos(el2)],len2,Math.max(.05,p.r*.55),.04,3,-.2,.1);
   if(shrub)BIO.beam('rod',[sec[0].x,sec[0].y,sec[0].z],[sec[3].x,sec[3].y,sec[3].z],sec[0].r,.04,rodCol(S,q));else st.limb+=BIO.tube(fam,sec,barkCol(S,2),{seg:4});
   spots.push({p:sec[2],s:len2*.35},{p:sec[3],s:len2*.4,tip:true});}}
 const cy=T.y0+H*.75,ex=T.crownR,ey=H*.35,sz0=Math.max(1.2,T.crownR*rr(.3,.42)),nC=lv===2?1.6:1;let mine=0;
 spots.forEach(s=>{const cnt=Math.floor(nC)+(rng()<nC-Math.floor(nC)?1:0);
  for(let c=0;c<cnt;c++){const a=rr(0,TAU),d=s.s*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.2,.6)*s.s;
   if(!clear3(x,y,z,sz0*.5,sz0*.35))continue;clumpAt('feather',x,y,z,sz0*rr(.85,1.25)*(s.tip?1.1:1),.55,hc,T.x,cy,T.z,ex,ey);st.clumps++;mine++;}
  if(lv===2&&!shrub&&rng()<.3){BIO.put('pods',[s.p.x,s.p.y-.2,s.p.z],qEuler(0,rr(0,TAU),0),[rr(.8,1.4),rr(.8,1.6),1],bright(vary(pick(PAL.pod),.02,.1,.06),1.1));st.pods++;}});
 if(!mine){clumpAt('feather',T.x,T.y0+H*.7,T.z,sz0,.55,hc,T.x,cy,T.z,ex,ey);st.clumps++;}
 if(!shrub)regTree(T,S,T.crownR,T.H);};
// 7 the wadi palm: a fibrous trunk, a crown of arching pinnate fronds, a skirt of dead ones, a bunch of dates
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.14);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[1],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?9:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('palmfrond',tx,ty,tz,Rf,n,-.15,.35,bright(hc,1.45),1.15);
 if(lv>=1){frondCrown('palmfrond',tx,ty+.5,tz,Rf*.6,lv===2?5:3,.6,1.15,bright(shade(hc,.1),1.45),1);
  for(let k=0,m=lv===2?ri(4,8):3;k<m;k++){const a=rr(0,TAU);BIO.put('strand',[tx+Math.cos(a)*rb*.9,ty-.5,tz+Math.sin(a)*rb*.9],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1,1.8),Rf*rr(.5,.8),1],bright(vary(0x8a7a4a,.02,.1,.06),1.1));}
  if(lv===2&&rng()<.6){const a=rr(0,TAU);BIO.put('dates',[tx+Math.cos(a)*rb*1.2,ty-1.2,tz+Math.sin(a)*rb*1.2],qEuler(0,rr(0,TAU),0),[1.2,1.8,1.2],bright(vary(0xc88a3a,.02,.1,.06),1.1),{n:[Math.cos(a),.2,Math.sin(a)]});}}
 st.fronds+=n;if(lv===2)regTree(T,S,Rf,T.H);};
// 8 the desert rose: a squat swollen caudex on the rock, stubby branches, a head of pink blooms
B[8]=function(T,st,lv){const S=SP[T.sp],fam='bark2',H=T.H,rb=T.rb,ti=T.seed%3,bH=H*.55;
 const rAt=u=>rb*(1.3-.9*u*u)*(u>.9?mix(1,.4,(u-.9)/.1):1);
 const rings=[];for(let u=0;u<=1;u+=.1)rings.push({x:T.x,y:T.y0+bH*u,z:T.z,r:Math.max(.1,rAt(u)),yy:bH*u,col:barkCol(S,(Math.floor(u*4)+ti)%3)});
 rings.push({x:T.x,y:T.y0+bH+.3,z:T.z,r:.05,yy:bH+.3,col:barkCol(S,1)});
 const ph=rr(0,TAU);st.trunk+=BIO.lathe(fam,rings,lv===2?10:7,2,3,(R,ang)=>R.r*(1+.08*Math.sin(3*ang+ph)+.03*Math.sin(8*ang+R.yy*2)),null);
 const nB=lv===2?ri(3,6):3,a0=rr(0,TAU),hc=C(pick(S.leaf)),cy=T.y0+H;
 for(let k=0;k<nB;k++){const a=a0+k*GOLD,el=rr(.7,1.3),len=(H-bH)*rr(.7,1.3),pts=treeGrow({x:T.x+Math.cos(a)*rAt(.8)*.5,y:T.y0+bH*.92,z:T.z+Math.sin(a)*rAt(.8)*.5},[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rb*.22,.08,2,.03,.1);
  st.limb+=BIO.tube(fam,pts,barkCol(S,2),{seg:4,cap:true});const e=pts[2];
  if(rng()<.6)clumpAt('small',e.x,e.y+.2,e.z,T.crownR*rr(.35,.5),.6,hc,T.x,cy,T.z,T.crownR,H*.4);
  bloomsAt(e.x,e.y+.4,e.z,T.crownR*.35,lv===2?ri(6,14):4,PAL.comp,[.32,.55]);st.blooms++;}
 };
// 9 the giant puya: a ball of needles the size of a hut, a straw spike three times its height
B[9]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,hc=vary(pick(S.leaf),.02,.08,.05);
 BIO.put('agave',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[R,R*.95,R],bright(hc,1.2));
 if(lv>=1){for(let k=0,n=lv===2?8:4;k<n;k++){const a=k/n*TAU+rr(-.2,.2);BIO.put('needle',[T.x+Math.cos(a)*R*.55,T.y0-.1,T.z+Math.sin(a)*R*.55],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R*.9,R*.8,R*.9],bright(vary(hc,.02,.06,.05),1.25));}}
 if(rng()<.75){const sc=bright(vary(pick(PAL.spike),.02,.08,.05),1.1);BIO.beam('rod',[T.x,T.y0+R*.5,T.z],[T.x+rr(-.3,.3),T.y0+H,T.z+rr(-.3,.3)],R*.16,R*.05,sc);
  for(let k=0,n=lv===2?ri(6,10):3;k<n;k++){const u=rr(.45,1);BIO.put('plume',[T.x+rr(-.3,.3),T.y0+R*.5+(H-R*.5)*u,T.z+rr(-.3,.3)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),R*mix(.55,.3,u),bright(vary(0xd8d0a8,.02,.06,.06),1.15),{n:[0,1,0]});}st.spikes++;}
 };
// 10 the mountain agave: a red-tinged rosette and a candelabra flower stalk
B[10]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,hc=C(pick(S.leaf)).lerp(C(pick(PAL.agave)),rr(.2,.6));
 BIO.put('agave',[T.x,T.y0-.15,T.z],qEuler(0,rr(0,TAU),0),[R,R*.8,R],bright(hc,1.2));
 const sc=shade(C(0x6a4a4a),-.1);BIO.beam('rod',[T.x,T.y0+R*.3,T.z],[T.x+rr(-.4,.4),T.y0+H,T.z+rr(-.4,.4)],T.rb,T.rb*.4,sc);
 const n=lv===2?ri(6,10):4,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const u=mix(.5,.95,k/n),a=a0+k*GOLD,L=R*mix(.9,.4,k/n),y=T.y0+R*.3+(H-R*.3)*u,ex=T.x+Math.cos(a)*L,ez=T.z+Math.sin(a)*L;
  BIO.beam('rod',[T.x,y,T.z],[ex,y+L*.35,ez],T.rb*.35,T.rb*.15,sc);
  BIO.put('plume',[ex,y+L*.35+.3,ez],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),R*rr(.45,.7),bright(vary(0xd8c040,.03,.1,.06),1.2),{n:[0,1,0]});}
 st.spikes++;};
// 12 the twist-candles: a clump of tapering three-lobed columns in pastel yellows, roses and rusts,
// twisting as they rise, with small mint ones glowing at their feet -- standing in the shallows
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,n=lv===2?ri(3,8):ri(2,4),a0=rr(0,TAU),base=T.y0+.5;
 for(let k=0;k<n;k++){const a=a0+k*GOLD,d=k?T.crownR*rr(.2,.9):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=H*(k?rr(.4,.9):1),w=T.rb*rr(.7,1.3)*(.5+.5*h/H);
  const y=Math.min(BIO.terrainH(x,z),base)-.2;
  BIO.put('candle',[x,y,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w*2,h,w*2],bright(vary(pick(S.leaf),.02,.08,.05),1.15));st.candles++;}
 if(lv===2)for(let k=0,m=ri(2,6);k<m;k++){const a=rr(0,TAU),d=T.crownR*rr(.5,1.4),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Math.min(BIO.terrainH(x,z),base)-.1,h=rr(.4,1.1);
  BIO.put('candle',[x,y,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*.5,h,h*.5],bright(vary(pick(PAL.candleTip),.02,.08,.05),1.5));st.candles++;}
 };

// ---------------------------------------------------------------- impostors (the far canopy)
// far:{spires:n} (the twist-candles): the clump as n twisted three-sided spires, 9 triangles each, set out as
// the hero sets its columns (the main one at the clump's foot, the rest round it). Each stands where the hero's
// column does: rooted in the bed under the LOCAL water (BIO.waterH: the river descends, the pond has its own
// level), its top at the bed + h, so what shows above the water is the hero's. The foot has a 1.5 m skirt: a
// host may draw its ground coarser than terrainH (the ideal host's 17.8 m triangles dip up to ~1.5 m under it on
// a bank), or its water clear, or not at all. A spire the water drowns, or that shows less than 0.8 m over the
// water and the ground, is not built. spiresOf(T) is the layout as data ({x,z,yb,h,foot,top,w,c,q}); it hashes
// the tree's own seed, not the biome's stream, so building one moves nothing else, and a host can lay it out
// for any clump to check it.
function spiresOf(T){const S=SP[T.sp],H=T.H,base=T.y0+.5,o=[];
 const hr=(k,a,b)=>a+(b-a)*h3(T.seed%9973,k,4.7),a0=hr(.5,0,TAU);
 for(let k=0,n=S.far&&S.far.spires||0;k<n;k++){const a=a0+k*GOLD,d=k?T.crownR*hr(k+.1,.2,.9):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
  const g=BIO.terrainH(x,z),h=H*(k?hr(k+.2,.4,.9):1),yb=Math.min(g,base)-.2,top=yb+h*1.03;
  if(top-Math.max(BIO.waterH(x,z),g)<.8)continue;
  o.push({x,z,yb,h,foot:yb-1.5,top,w:T.rb*hr(k+.3,.7,1.3)*(.5+.5*h/H),c:(T.seed+k*3)%S.leaf.length,q:hr(k+.4,0,TAU)});}
 return o;}
SEDESERT.spiresOf=spiresOf;
function farSpires(T,st){const K=BIO.bucket('far'),S=SP[T.sp],kk=BIO._lodKey(T.x,T.z);let tris=0;
 const vtx=v=>{K.pos.push(v[0],v[1],v[2]);K.nor.push(v[3],v[4],v[5]);K.uv.push(0,0);K.col.push(v[6],v[7],v[8]);};
 const tri=(a,b,c)=>{vtx(a);vtx(b);vtx(c);K.k.push(kk);tris++;};   // a, b, c counter-clockwise from outside
 for(const P of spiresOf(T)){const c=bright(S.leaf[P.c],1.15).convertSRGBToLinear();
  // a ring at y: three corners on the lobes (the hero's radius x 1.28), turning 1.2 rad over the height as its lobes do
  const ring=y=>{const t=Math.max(0,(y-P.yb)/P.h),r=1.28*P.w*Math.pow(1-.72*t,.7),s=lerp(.66,1,t),o=[];
   for(let j=0;j<3;j++){const an=P.q-1.2*t+j*TAU/3,cx=Math.cos(an),cz=Math.sin(an);o.push([P.x+cx*r,y,P.z+cz*r,cx*.75,.66,cz*.75,c.r*s,c.g*s,c.b*s]);}return o;};
  const A=ring(P.foot),B=ring(P.yb+P.h*.55),tip=[P.x,P.top,P.z,0,1,0,c.r,c.g,c.b];   // the foot, the waist, the tip
  for(let j=0;j<3;j++){const j1=(j+1)%3;tri(A[j],B[j],A[j1]);tri(A[j1],B[j],B[j1]);tri(B[j],tip,B[j1]);}}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp];if(S.far&&S.far.spires)return farSpires(T,st);
 const K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const cheap=BIO.lodD(T.x,T.z)>BIO.LOD().far;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 // the pole: a four-ring lathe in the bark colour, darker toward the foot, tapered as the species record says
 const F=S.far||{poleU:.35},bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=cheap?4:6,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.3,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);   // (the lathe charges its own triangles)
 // the crown: the species' blobs [yK of H, rx of crownR, ry of H, colour A, colour B, options]
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c==='P'?PAL.comp[fi%PAL.comp.length]:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const o=b[5]||{};if(o.rich&&cheap)return;
  const y=o.abs?T.y0+T.H*b[0]:o.yOf==='R'?T.y0+R*b[0]:T.y0+T.H*b[0],rx=o.abs?b[1]:o.rxOf==='rb'?T.rb*b[1]:R*b[1],ry=o.abs?b[2]:o.ryOf==='R'?R*b[2]:T.H*b[2],off=o.off?R*o.off:0;
  blob(T.x+Math.cos(a0)*off,y,T.z+Math.sin(a0)*off,rx,ry,colOf(b[3]),colOf(b[4]),fi+(o.rich?3:bi));});
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SEDESERT.buildTrees=function(R,q){
 reseed(550021);q=q==null?1:q;R=R||3000;means();
 const st={trunk:0,limb:0,far:0,sapTris:0,forks:0,clumps:0,blooms:0,pods:0,fronds:0,cols:0,spikes:0,candles:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=SEDESERT.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
 const LOD=BIO.LOD(),WATER=BIO.window('water');
 // one species pass: a jittered grid over the whole disc, the zone weight as
 // acceptance; past the hero radius a tree is a mid-range one, past the mid
 // radius an impostor (or, for a species with none, nothing)
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=mk(x,y,z,sp);
    if(opt.size)opt.size(T,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!(S.far&&(!S.farIf||S.farIf(T))))return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,noMask:!!S.depth,depth:S.depth||[-Infinity,-.3],pad:pad+2,box:opt.water?WATER:null});
  return n;}
 SEDESERT.PASSES.forEach(pass);
 // build
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,fronds:st.fronds,columns:st.cols,spikes:st.spikes,candles:st.candles,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far,small:st.sapTris}};};
SEDESERT._canopyH=function(x,z){let h=0;for(const T of SEDESERT.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
// the nearest built hero of a species to a point (a world's camera or a placement pass may want one)
SEDESERT.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of SEDESERT.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// opt: pad keep-clear, patch/patchScale the stand patchiness, small the smaller LOD
// radii, lodK thinning with distance, water only in the host's water window,
// size(T,Z) a hook that sizes a tree from the zones
const stand=SEDESERT.standOf;
SEDESERT.PASSES=[
 // dragon trees where the water table allows: the canyon rim and benches, the pond, the mountain-foot seeps
 {sp:0,cell:48,accept:(Z)=>Z.rim*.4+Z.oasis*.45*(1-Z.flow*.6)+Z.bench*.22+Z.mtn*smooth(.22,.5,Z.wet)*.5+Z.rip*.04,opt:{pad:5,patch:.4,patchScale:.008}},
 // the big succulents in stands across the scrub, the badlands' edges, the rim
 {sp:1,cell:80,accept:(Z,x,z)=>(stand(x,z)===0?.30:.03)*Z.scrub+Z.bad*.06,opt:{pad:8,patch:.5,patchScale:.006}},
 {sp:2,cell:75,accept:(Z,x,z)=>(stand(x,z)===1?.28:.03)*Z.scrub+Z.rim*.12+Z.bench*.06,opt:{pad:7,patch:.5,patchScale:.006}},
 {sp:11,cell:60,accept:(Z,x,z)=>(stand(x,z)===2?.28:.03)*Z.scrub*(.4+.6*smooth(.02,.25,Z.up))+Z.bad*.05,opt:{pad:3,patch:.5}},
 // the bottle trees and boojums on the harder ground; the quiver trees on the rocky slopes
 {sp:3,cell:60,accept:(Z)=>Z.bad*.28+Z.scrub*.05+Z.mtn*.14+Z.bench*.1,opt:{pad:3,patch:.45}},
 {sp:4,cell:70,accept:(Z)=>Z.scrub*.12+Z.bad*.16+smooth(.05,.3,Z.dune)*smooth(.6,.3,Z.dune)*.35,opt:{pad:2.5,patch:.4}},
 {sp:5,cell:55,accept:(Z)=>Z.mtn*.5*smooth(.7,.3,Z.up)+Z.bad*.1+Z.scrub*smooth(.1,.35,Z.up)*.2,opt:{pad:3,patch:.45}},
 // the mesquites: tall on the banks and the floor, at the pond; shrinking to shrubs out in the scrub as the water table falls
 {sp:6,cell:28,accept:(Z)=>Z.bank*.8+Z.rip*.4+Z.oasis*.5*(1-Z.flow*.5)+Z.scrub*.24*smooth(.08,.45,Z.wet)+Z.bench*.16,opt:{pad:2.5,patch:.45,patchScale:.012,
  size:(T,Z)=>{const S=SP[6],k=smooth(.12,.85,Z.wet);T.H=lerp(S.H[0]*.7,S.H[1],k)*rr(.85,1.1);T.crownR=lerp(S.crownR[0]*.6,S.crownR[1],k)*rr(.85,1.1);T.rb=lerp(S.rb[0],S.rb[1],k);}}},
 // the wadi palms on the floor and at the pond: only where the host says the water is
 {sp:7,cell:34,accept:(Z)=>Z.rip*.45*smooth(.7,.95,Z.wet)+Z.bank*.35+Z.oasis*.8*(1-Z.flow*.4),opt:{pad:2.5,patch:.4,water:true}},
 // the desert roses on the walls and the rock; the puyas and agaves on the slopes
 {sp:8,cell:40,accept:(Z)=>Z.bench*.45+Z.rock*(1-Z.can)*(1-Z.dune)*(1-Z.ab)*.2+Z.rim*.2,opt:{pad:1.5,lodK:.5,patch:.4,small:true}},
 {sp:9,cell:60,accept:(Z)=>Z.mtn*.3+Z.bad*.1,opt:{pad:2,lodK:.5,patch:.45,small:true}},
 {sp:10,cell:50,accept:(Z)=>Z.mtn*.28+Z.scrub*.1+Z.bad*.12+Z.rim*.1,opt:{pad:1.5,lodK:.5,patch:.45,small:true}},
 // the twist-candles: in the shallows of the river and the pond (their depth band is on the species record)
 {sp:12,cell:16,accept:(Z)=>(Z.bank+Z.oasis*Z.flow)*.45,opt:{pad:1.5,lodK:.5,patch:.5,patchScale:.02,small:true,water:true}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the pass's own tree record (H, rb, crownR and seed drawn from the kit's stream: reseed first for a
// repeatable variant). grow(T,lv): build that one tree into this kit's buckets and items at level lv (2 hero, 1 mid,
// 0 the far impostor; null when the species has none) and nothing else: no keep-clear entry, no TREES record. An open
// world grows each species' variants once with these and instances them (openworld/README.md). buildTrees never calls them.
SEDESERT.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
SEDESERT.grow=function(T,lv){means();
 const st={trunk:0,limb:0,far:0,sapTris:0,forks:0,clumps:0,blooms:0,pods:0,fronds:0,cols:0,spikes:0,candles:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 T.lv=lv;if(lv===0){const S=SP[T.sp];if(!(S.far&&(!S.farIf||S.farIf(T))))return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
