// ================================================================= XANADU — trees
// The thirty-one tree species of the Vale, each with its own builder, placed
// by zone from the host's climate fields (wet / upland / flow / mist) and
// terrainH. The zone weights are computed HERE from those fields, never from
// the host's map. Two placements are not a grid: the RINGS (fairy circles:
// eight to fifteen trees of one species standing on a circle round an empty
// lawn) and the ARCHES (hornbeams in pairs across an alley, each leaning to
// its partner until their boughs lace overhead into a tunnel). Beyond the LOD
// spine the canopy species become blob impostors in the 'xfar' bucket.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=XANADU.SPECIES,PAL=XANADU.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
XANADU.TREES=[];XANADU.RINGS=[];XANADU.ARCHES=[];
// the runtime LOD ranges (metres from the camera to a chunk): trees in full, the floor near the spine, the far floor, the dressing
XANADU.LOD={tree:1500,floor:750,farFloor:3000,dress:1500,logs:1500};

// ---------------------------------------------------------------- zones from the fields
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),flow=BIO.field('flow',x,z),mist=BIO.field('mist',x,z),h=Y(x,z);
 const low=smooth(.22,.08,up),mz=smooth(.35,.7,mist);
 // the groves: the vale's trees gather in them round sunny glades ("forests ancient as the hills, enfolding sunny spots of greenery")
 const grove=smooth(.45,.58,fbm(x*.0036+11,z*.0036-7,4747,3));
 return{up,wet,flow,mist,h,grove,
  shore:low*smooth(10,2.5,h)*smooth(.68,.84,wet),                         // the lake shore
  rip:smooth(.25,.75,flow)*smooth(.45,.2,up),                              // the river's banks
  forest:low*smooth(.64,.78,wet)*(1-.6*mz),                                // the green flanks: Hyrcanian and East Asian wood
  vale:low*smooth(.80,.62,wet)*(1-.6*mz),                                  // the open vale: parkland, glades, gardens nobody planted
  chasm:mz*smooth(.5,.2,up),                                               // the chasm and the fountain's spray
  cloud:mz*smooth(.3,.55,up),                                              // the mist band on the mountains
  dry:smooth(.16,.3,up)*smooth(.72,.55,up)*smooth(.6,.42,wet)*(1-mz),     // the uplands: Mediterranean
  crag:smooth(.52,.75,up)*(1-mz*.7)};}                                     // the cliffs' ledges and the high ground
XANADU.zones=zones;

// ---------------------------------------------------------------- colour
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[.25,.25,.25];
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
 c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:XANADU.BARKTEX.map(t=>texMean(t)),rock:texMean(XANADU.ROCKTEX)};return MEAN;}
XANADU.means=means;XANADU.tint=tint;XANADU.bright=bright;XANADU.shade=shade;XANADU.vary=vary;
// the agate is painted in its own colours: its bark colour is a multiplier on them, not a tint
const barkCol=(S,k)=>S.barkK===1?C(S.bark[k%S.bark.length]):tint(S.bark[k%S.bark.length],means().bark[S.barkK]);
const fam=S=>'xbark'+S.barkK;
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.2);
const softC2=(c2,base,k)=>{const c=(c2.isColor?c2.clone():C(c2));return c.lerp(base.isColor?base:C(base),k==null?.45:k);};
XANADU.softC2=softC2;
const irid=(S)=>S.irid?C(pick(PAL.irid[S.irid])):null;

// ---------------------------------------------------------------- polyline helpers
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
// a quadratic arc from a through the control c to b, n segments
function arc(a,c,b,r0,r1,n){const pts=[];for(let k=0;k<=n;k++){const t=k/n,u=1-t;pts.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:mix(r0,r1,t)});}return pts;}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const P3=p=>[p.x,p.y,p.z];
// a rotation taking local x to xv and local y to yv (xv is made orthogonal to yv first)
const _qm=new T3.Matrix4();
function qBasis(xv,yv){const Y3=new T3.Vector3(yv[0],yv[1],yv[2]).normalize(),X3=new T3.Vector3(xv[0],xv[1],xv[2]);X3.addScaledVector(Y3,-X3.dot(Y3)).normalize();const Z3=new T3.Vector3().crossVectors(X3,Y3);
 _qm.makeBasis(X3,Y3,Z3);return new T3.Quaternion().setFromRotationMatrix(_qm);}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
XANADU.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn],c2:c2?bright(c2,ao):null});}
function frondAt(item,x,y,z,a,L,pitch,col,wid,c2){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col,{c2:c2||null});}
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,wid){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);frondAt(item,x,y,z,a,Rf*rr(.85,1.1),rr(p0,p1),bright(col,rr(.88,1.1)),wid);}}
function flower(item,x,y,z,s,col,c2,up){BIO.put(item,[x,y,z],up?qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)):qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),s,col,{c2:c2});}
const psyPair=()=>{const p=pick(PAL.psyPair);return[bright(C(p[0]),1.1),bright(C(p[1]),1.1)];};
const reg=(S,T,r)=>{if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:r||T.spread||T.crownR,h:T.H});};
// a BOLE: a lathe up to `top` metres, radius rAt(u), with fluting that winds (tw
// radians a metre: the whorl), buttress fins at the foot, an optional lean and
// wobble; closed in a dome. Returns the top point.
function bole(T,S,top,rAt,o){o=o||{};const vs=o.vs||6,ti=T.seed%3,rings=[],ph=rr(0,TAU),ph2=rr(0,TAU),famN=o.fam||fam(S);
 const lx=o.lean?o.lean[0]:0,lz=o.lean?o.lean[1]:0;
 const at=yy=>{const w=o.wob?o.wob(yy):[0,0];return[T.x+lx*yy+w[0],T.z+lz*yy+w[1]];};
 for(let yy=0;yy<top;yy+=vs*.5){const p=at(yy);rings.push({x:p[0],y:T.y0+yy,z:p[1],r:rAt(yy/T.H),yy:yy,col:o.col?o.col(yy):barkCol(S,(Math.floor(yy/10)+ti)%3)});}
 const pe=at(top),re=rAt(top/T.H);rings.push({x:pe[0],y:T.y0+top,z:pe[1],r:re*.8,yy:top,col:barkCol(S,1)},{x:pe[0],y:T.y0+top+re*1.3,z:pe[1],r:.04,yy:top+re,col:barkCol(S,1)});
 const nf=o.flutes||0,fa=o.fluteA||0,tw=o.twist||0,nb=o.nb||5,bt=o.buttress||0,bh=o.bh||2.5;
 const seg=o.seg||(T.lv===2?14:8);
 BIO.lathe(famN,rings,seg,Math.max(1,Math.round(TAU*rAt(.1)/(o.urep||3))),vs,
  (R,ang)=>R.r*(1+fa*Math.cos(nf*ang+R.yy*tw+ph))*(1+bt*Math.exp(-R.yy/bh)*Math.max(0,Math.cos(nb*ang+ph2))),
  (R,ang)=>1-(fa>0?.25*(.5-.5*Math.cos(nf*ang+R.yy*tw+ph)):0));
 T.stTrunk=(T.stTrunk||0)+1;return{x:pe[0],y:T.y0+top,z:pe[1]};}
// a LIMB: a tube along pts, twisted flutes if asked, capped
function limb(S,pts,st,o){o=o||{};const ph=rr(0,TAU),tw=o.twist||0,fa=o.fluteA||0,nf=o.flutes||4;
 st.limb+=BIO.tube(o.fam||fam(S),pts,o.col||barkCol(S,1),{seg:o.seg||(pts[0].r>.5?7:5),cap:true,rfn:fa?(i,ang)=>1+fa*Math.cos(nf*ang+i*tw+ph):null});}
function limbOk(pts,pad){for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+(pad||1.5),pts[i].r+(pad||1.5)))return false;return true;}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet,...} and lv 2 near / 1 mid / 0 far
const B=[];
// 0 the dawn redwood: a straight fluted column flaring into buttresses, tiers of short level boughs in copper feathers that turn green away from the sun
B[0]=function(T,st,lv){const S=SP[0],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.8*u);
 const top=bole(T,S,H*.96,rAt,{flutes:9,fluteA:.08,twist:0,buttress:.9,bh:2.2,nb:6,vs:6});
 const tiers=lv===2?Math.round(H/1.9):Math.round(H/3.6),hc=vary(pick(S.leaf),.02,.06,.05),rc=rodCol(S,T.seed);
 for(let t=0;t<tiers;t++){const u=lerp(.22,.97,t/(tiers-1)),y=T.y0+H*u,Rt=T.crownR*Math.pow(1-u,.85)*rr(.85,1.15)+.6,nB=lv===2?ri(4,6):3,a0=t*GOLD;
  for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.25,.25),ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt,ey=y-Rt*.12;
   if(lv===2&&Rt>1.5)BIO.beam('rod',[T.x,y,T.z],[ex,ey,ez],rAt(u)*.3+.05,.05,rc);
   const n=lv===2&&Rt>2.5?2:1;for(let c=0;c<n;c++){const f=c?.5:.85,sz=Math.max(1.4,Rt*rr(.55,.75));
    clumpAt('feather',T.x+(ex-T.x)*f,ey+sz*.05,T.z+(ez-T.z)*f,sz,.45,hc,T.x,y,T.z,Rt+1,Rt*.6+1,irid(S));st.clumps++;}}}
 clumpAt('feather',T.x,T.y0+H*.99,T.z,1.6,.8,hc,T.x,T.y0+H,T.z,2,2,irid(S));
 T.spread=T.crownR;reg(S,T);};
// 1 the ginkgo: a whorled column, ascending boughs from its upper two-thirds, spurs of little fans in rosettes, green going gold (a few trees gold already)
B[1]=function(T,st,lv){const S=SP[1],H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.7*u)*(1+.3*Math.exp(-u*H/2));
 bole(T,S,H*.92,rAt,{flutes:5,fluteA:.05,twist:.18,vs:5});
 const autumn=rng()<.2,hc=autumn?C(pick([0xe8c030,0xf0d040,0xd8b028])):vary(pick(S.leaf),.02,.06,.05),c2=autumn?C(0xf8e060):null;
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),cy=T.y0+H*.66,spots=[];
 for(let k=0;k<nB;k++){const u=lerp(.32,.85,(k+rr(0,.8))/nB),a=a0+k*GOLD,el=rr(.75,1.1),len=T.crownR*rr(.8,1.2)*(1.1-u*.5),r0=clamp(rAt(u)*.45,.12,.5);
  const pts=treeGrow({x:T.x,y:T.y0+H*u,z:T.z},dirOf(a,el),len,r0,.08,4,-.05,.08);if(!limbOk(pts))continue;
  if(lv===2)limb(S,pts,st,{flutes:4,fluteA:.06,twist:.6});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),r0,.08,rodCol(S,ti));
  for(let i=1;i<=4;i++)spots.push(pts[i]);}
 spots.push({x:T.x,y:T.y0+H*.96,z:T.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){const sz=rr(1.8,3)*Math.min(1.2,H/20);clumpAt('ginkgo',p.x+rr(-1,1),p.y+rr(-.3,.8),p.z+rr(-1,1),sz,.6,hc,T.x,cy,T.z,T.crownR,H*.35,c2||irid(S));st.clumps++;}});
 T.spread=T.crownR;reg(S,T);};
// 2 the LOTUS TRUMPET: the Rift's trumpet tree gone branching. A fat fluted bole, arms that
// climb and spread to different heights, and on every arm a trumpet flaring into a wide
// shallow cup, green inside, with a fringe of lotus flowers round its rim; aerial roots hang
// from the arms. The tallest trumpet crowns the bole.
B[2]=function(T,st,lv){const S=SP[2],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1-.45*u)*(1+.55*Math.exp(-u*H/2.2));
 const hB=H*rr(.34,.44),top=bole(T,S,hB,rAt,{fam:'xbarkT',flutes:7,fluteA:.10,twist:.05,buttress:.6,bh:1.6,nb:7,vs:4});
 const fr=[C(pick(PAL.comp)),C(pick([0xff60b0,0xf080c0,0xff9ad0,0xe050a0,0xffc0e0]))];
 const leafC=vary(pick(S.leaf),.02,.06,.05);
 function trumpet(p,R,depth,lvl){   // the cup: a ribbed funnel from the arm's tip, the rim turned out, a floor closing it
  const rings=[],n=lv===2?9:5,ph=rr(0,TAU);
  for(let i=0;i<=n;i++){const u=i/n,f=Math.pow(u,2.2),r=lerp(R*.08,R,f),yy=depth*u;rings.push({x:p.x,y:p.y+yy,z:p.z,r:r,yy:yy*3,col:barkCol(S,ti).lerp(bright(leafC,1.1),smooth(.2,.8,u))});}
  rings.push({x:p.x,y:p.y+depth+R*.04,z:p.z,r:R*1.06,yy:depth*3+1,col:bright(leafC,1.25)},{x:p.x,y:p.y+depth-R*.12,z:p.z,r:R*.8,yy:depth*3+2,col:shade(leafC,-.2)},{x:p.x,y:p.y+depth-R*.18,z:p.z,r:.05,yy:depth*3+3,col:shade(leafC,-.35)});
  st.trunk+=BIO.lathe('xbarkT',rings,lv===2?20:12,Math.max(1,Math.round(TAU*R/3)),3,(Rg,ang)=>Rg.r*(1+.06*Math.cos(nR*ang+ph)),(Rg,ang)=>.82+.18*Math.cos(nR*ang+ph));
  // the fringe: lotus flowers standing round the rim
  const nf=lv===2?Math.round(TAU*R/.9):lv===1?Math.round(TAU*R/2):0,ph2=rr(0,TAU);
  for(let k=0;k<nf;k++){const a=ph2+k/nf*TAU,rr2=R*rr(.98,1.08),x=p.x+Math.cos(a)*rr2,z=p.z+Math.sin(a)*rr2,y=p.y+depth+rr(.1,.35);
   BIO.put('lotus',[x,y,z],qEuler(rr(-.2,.2),-a,rr(.8,1.2)),rr(.75,1.05)*Math.min(1.3,R/2.5),bright(vary(fr[k%2],.02,.08,.05),1.15),{c2:bright(C(0xfff0f4),1.05)});st.blooms++;}
  if(lv===2&&rng()<.6){const cc=bright(C(pick(PAL.comp)),1.1);for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.6);BIO.put('cup',[p.x+Math.cos(a)*d,p.y+depth-R*.08,p.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.5,.8),cc);st.blooms++;}}}
 const nA=lv===2?ri(S.arms[0],S.arms[1]):ri(3,5),a0=rr(0,TAU);let spread=T.crownR;
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),reach=rr(2.5,T.crownR*1.9),rise=H*rr(.25,.6)-hB*.2,R=rr(1.6,3.2)*Math.min(1.3,H/15);
  const o=[top.x+Math.cos(a)*rAt(hB/H)*.5,top.y-rr(.3,1.5),top.z+Math.sin(a)*rAt(hB/H)*.5],e=[T.x+Math.cos(a)*reach,T.y0+hB+rise,T.z+Math.sin(a)*reach];
  const c=[mix(o[0],e[0],.75),mix(o[1],e[1],.15),mix(o[2],e[2],.75)];
  const pts=arc(o,c,e,rAt(hB/H)*.38,.3,5);if(!limbOk(pts,R*.6))continue;
  limb(S,pts,st,{fam:'xbarkT',seg:lv===2?7:5,flutes:6,fluteA:.08,twist:.3});
  trumpet({x:e[0],y:e[1],z:e[2]},R,R*rr(.55,.8),1);
  if(lv===2)for(let i=1;i<4;i++)if(rng()<.55){const p=pts[i];BIO.put('strand',[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[rr(.3,.6),Math.max(1,p.y-T.y0-rr(0,2)),1],bright(vary(0x8a7a58,.02,.06,.06),1.05));}
  spread=Math.max(spread,reach+R);}
 trumpet({x:top.x,y:top.y+rr(1,H*.3),z:top.z},rr(2.8,4.2)*Math.min(1.3,H/15),rr(2,3),0);
 BIO.beam('rod',[top.x,top.y-1,top.z],[top.x,top.y+H*.2,top.z],rAt(hB/H)*.5,rAt(hB/H)*.3,barkCol(S,1));
 T.spread=spread;reg(S,T,spread);};
// 3 the CLOUD PINE: a bonsai nobody trimmed. A whorled trunk in an S, level boughs, and on every tip a flat pad of needles; a pad crowns the top
B[3]=function(T,st,lv){const S=SP[3],H=T.H,rb=T.rb,wind=T.wind||0,la=T.lean!=null?T.lean:rr(0,TAU);
 const n=7,pts=[];const sw=rr(.8,1.6),sway=rr(.1,.22)*H+wind*H*.35;
 for(let i=0;i<=n;i++){const t=i/n,s=Math.sin(t*Math.PI*sw)*sway*(1-.3*t)+wind*H*.5*t*t,side=Math.sin(t*Math.PI*1.3+1)*H*.08;
  pts.push({x:T.x+Math.cos(la)*s-Math.sin(la)*side,y:T.y0+t*H*(1-.18*wind),z:T.z+Math.sin(la)*s+Math.cos(la)*side,r:rb*(1-.75*t)*(1+.6*Math.exp(-t*9))});}
 limb(S,pts,st,{fam:'xbark0',seg:lv===2?8:6,flutes:4,fluteA:.10,twist:.7});
 const hc=vary(pick(S.leaf),.02,.06,.05),rc=rodCol(S,T.seed),nP=lv===2?ri(S.pads[0],S.pads[1]):3,cy=T.y0+H*.7;let spread=T.crownR*.5;
 const pad=(x,y,z,R)=>{const m=lv===2?ri(4,7):2;for(let c=0;c<m;c++){const a=rr(0,TAU),d=R*.55*Math.sqrt(rng());clumpAt('needle',x+Math.cos(a)*d,y+rr(-.1,.25)*R*.3,z+Math.sin(a)*d,R*rr(.7,.95),.32,hc,x,y-R*.5,z,R,R*.5,null);st.clumps++;}};
 for(let k=0;k<nP;k++){const t=lerp(.35,.9,k/Math.max(1,nP-1)),i=Math.min(n-1,Math.floor(t*n)),p=pts[i],a=(k%2?la+Math.PI:la)+rr(-.9,.9)+wind*.0,L=T.crownR*rr(.5,1)*(1.1-t*.4),R=rr(1.1,2.2)*Math.min(1.3,H/10);
  const e=[p.x+Math.cos(a)*L,p.y+rr(-.1,.5),p.z+Math.sin(a)*L],m=[mix(p.x,e[0],.5),p.y-rr(.2,.8),mix(p.z,e[2],.5)];
  if(!clear3(e[0],e[1],e[2],R,1))continue;
  BIO.beam('rod',[p.x,p.y,p.z],m,p.r*.5,p.r*.35,rc);BIO.beam('rod',m,e,p.r*.35,.06,rc);pad(e[0],e[1]+.3,e[2],R);spread=Math.max(spread,L+R);}
 const e=pts[n];pad(e.x,e.y+.2,e.z,rr(1.3,2.2)*Math.min(1.3,H/10));
 T.spread=spread;if(lv===2)reg(S,T,spread);};
// 4 the CUSHION TREE: braided stems spreading from one foot, and over them a lumpy dome of smooth leafy cushions, as if clipped
B[4]=function(T,st,lv){const S=SP[4],H=T.H,rb=T.rb,nS=lv===2?ri(S.stems[0],S.stems[1]):3,a0=rr(0,TAU),tips=[];
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.3,.3),reach=T.crownR*rr(.3,.75),hh=H*rr(.45,.75),pts=[],n=5,tw=rr(1.5,3)*(k%2?1:-1);
  for(let i=0;i<=n;i++){const t=i/n,r=rb*(1-.5*t)*(1+.8*Math.exp(-t*6)),w=Math.sin(t*Math.PI)*.6;const aa=a+tw*t*.35;
   pts.push({x:T.x+Math.cos(aa)*(reach*Math.pow(t,1.3)+.3)+Math.cos(a+1.6)*w,y:T.y0+hh*t,z:T.z+Math.sin(aa)*(reach*Math.pow(t,1.3)+.3)+Math.sin(a+1.6)*w,r});}
  if(lv===2)limb(S,pts,st,{fam:'xbark0',seg:6,flutes:3,fluteA:.12,twist:.9});else BIO.beam('rod',P3(pts[0]),P3(pts[n]),rb,rb*.5,rodCol(S,k));
  tips.push(pts[n]);}
 const hc=vary(pick(S.leaf),.02,.06,.05),cy=T.y0+H*.72;let n=0;
 tips.forEach(p=>{const R=rr(1.3,2.2)*Math.min(1.3,H/9);BIO.put('cushion',[p.x,p.y+R*.4,p.z],qEuler(0,rr(0,TAU),0),[R,R*rr(.75,.9),R],bright(vary(hc,.02,.06,.06),rr(1.1,1.35)));n++;});
 const nc=lv===2?ri(6,11):4;for(let k=0;k<nc;k++){const a=rr(0,TAU),d=T.crownR*.6*Math.sqrt(rng()),R=rr(1.4,2.6)*Math.min(1.3,H/9),y=cy+(1-d/T.crownR)*H*.22+rr(-.5,.5);
  BIO.put('cushion',[T.x+Math.cos(a)*d,y,T.z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[R,R*rr(.7,.9),R],bright(vary(hc,.02,.06,.06),lerp(1.05,1.45,smooth(-2,4,y-cy))));n++;}
 st.cushions=(st.cushions||0)+n;T.spread=T.crownR;if(lv===2)reg(S,T);};
// 5 the WHORL OLIVE: a short fat bole wrung like a cloth (deep flutes winding a turn every few metres, striped cream and umber), two or three twisted limbs, a silver crown
B[5]=function(T,st,lv){const S=SP[5],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.45*u)*(1+.7*Math.exp(-u*H/1.2));
 const hB=H*rr(.35,.5),top=bole(T,S,hB,rAt,{fam:'xbark0',flutes:5,fluteA:.24,twist:rr(.9,1.6)*(rng()<.5?-1:1),buttress:.5,bh:.8,nb:4,vs:1.4,seg:lv===2?18:10,urep:1.2});
 const nL=ri(2,3),a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.8;
 for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.4,.4),pts=treeGrow({x:top.x,y:top.y-.4,z:top.z},dirOf(a,rr(.5,.9)),T.crownR*rr(.7,1.1),rAt(hB/H)*.55,.08,5,-.02,.25);
  if(lv===2)limb(S,pts,st,{fam:'xbark0',seg:7,flutes:4,fluteA:.18,twist:1.2});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.1,rodCol(S,k));
  for(let i=2;i<=5;i++){const p=pts[i];for(let c=0,m=lv===2?2:1;c<m;c++){clumpAt('olive',p.x+rr(-1,1),p.y+rr(0,1),p.z+rr(-1,1),rr(1.6,2.4),.55,hc,T.x,cy,T.z,T.crownR,H*.3,C(pick(PAL.irid.SG)));st.clumps++;}}}
 T.spread=T.crownR;if(lv===2)reg(S,T);};
// 6 the AGATE TREE: a tall smooth bole whose bark is banded rust, ochre, violet and slate like a cut agate (it shimmers), a vase of rising boughs, a jade-green crown
B[6]=function(T,st,lv){const S=SP[6],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.55*u)*(1+.35*Math.exp(-u*H/3));
 const hB=H*.55;bole(T,S,hB,rAt,{fam:'xbarkA',flutes:3,fluteA:.04,twist:.05,buttress:.35,nb:5,vs:6,urep:4});
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.06,.05),cy=T.y0+H*.78,spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),len=H*rr(.35,.5),pts=treeGrow({x:T.x,y:T.y0+hB-rr(0,2),z:T.z},dirOf(a,rr(.9,1.2)),len,rAt(.55)*.5,.1,5,-.12,.06);
  if(!limbOk(pts))continue;limb(S,pts,st,{fam:'xbarkA',seg:lv===2?7:5});for(let i=2;i<=5;i++)spots.push(pts[i]);}
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('broad',p.x+rr(-1.5,1.5),p.y+rr(-.5,1.5),p.z+rr(-1.5,1.5),rr(3,4.6),.6,hc,T.x,cy,T.z,T.crownR,H*.25,irid(S));st.clumps++;}});
 T.spread=T.crownR;reg(S,T);};
// 7 the RING BEECH: a slender silver bole that leans a little out of its ring, a crown that grows away from the ring's lawn, one bough reaching back over it
B[7]=function(T,st,lv){const S=SP[7],H=T.H,rb=T.rb,oa=T.outA!=null?T.outA:rr(0,TAU),lk=T.lean||rr(0,.04);
 const rAt=u=>rb*(1-.6*u)*(1+.4*Math.exp(-u*H/2));
 const top=bole(T,S,H*.7,rAt,{lean:[Math.cos(oa)*lk,Math.sin(oa)*lk],vs:6,buttress:.25,nb:4});
 const hc=vary(pick(S.leaf),.02,.06,.05),cx=top.x+Math.cos(oa)*T.crownR*.35,cz=top.z+Math.sin(oa)*T.crownR*.35,cy=T.y0+H*.82,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,spots=[];
 for(let k=0;k<nB;k++){const a=oa+(k/nB-.5)*2.6+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,H*.25),z:top.z},dirOf(a,rr(.45,.9)),T.crownR*rr(.7,1.1),rAt(.6)*.5,.08,4,-.05,.08);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{seg:5});for(let i=2;i<=4;i++)spots.push(pts[i]);}
 if(T.inA!=null){const pts=treeGrow({x:top.x,y:top.y-2,z:top.z},dirOf(T.inA,.35),T.reachIn||T.crownR,rAt(.6)*.4,.08,4,.02,.05);if(limbOk(pts,1)){if(lv===2)limb(S,pts,st,{seg:5});for(let i=2;i<=4;i++)spots.push(pts[i]);}}
 spots.push({x:cx,y:T.y0+H*.97,z:cz});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('broad',p.x+rr(-1.2,1.2),p.y+rr(-.3,1.2),p.z+rr(-1.2,1.2),rr(2.8,4),.55,hc,cx,cy,cz,T.crownR,H*.22,rng()<.4?irid(S):null);st.clumps++;}});
 T.spread=T.crownR;reg(S,T);};
// 8 the ARCH HORNBEAM: a fluted grey trunk that leans toward its partner across the alley; its main limbs arc over and lace with the partner's, the crowns meet in a vault
B[8]=function(T,st,lv){const S=SP[8],H=T.H,rb=T.rb,P=T.partner;
 const dx=P[0]-T.x,dz=P[1]-T.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,side=T.side||1;
 const apex=[T.x+dx*.5+(-uz)*side*.8,T.y0+H*rr(.72,.82),T.z+dz*.5+ux*side*.8];
 const hB=H*.35,foot=[T.x,T.y0,T.z],knee=[T.x+ux*L*.08,T.y0+hB,T.z+uz*L*.08];
 const trunk=arc(foot,knee,[T.x+ux*L*.2,T.y0+H*.5,T.z+uz*L*.2],rb*1.1,rb*.7,5);
 limb(S,trunk,st,{fam:'xbark2',seg:lv===2?9:6,flutes:5,fluteA:.14,twist:.05});
 const o=trunk[5],hc=vary(pick(S.leaf),.02,.06,.05),spots=[];
 // the main limbs: over the alley to (and a little past) the apex, lacing with the partner's
 const nL=lv===2?ri(3,4):2;for(let k=0;k<nL;k++){const off=(k-(nL-1)/2)*rr(1.2,2.2),pastT=rr(.1,.35);
  const e=[apex[0]+ux*L*pastT+(-uz)*off,apex[1]-rr(0,2)-pastT*L*.3,apex[2]+uz*L*pastT+ux*off];
  const c=[mix(o.x,apex[0],.45)+(-uz)*off*.5,apex[1]+rr(1,3),mix(o.z,apex[2],.45)+ux*off*.5];
  const pts=arc([o.x,o.y,o.z],c,e,rb*.45,.1,6);limb(S,pts,st,{fam:'xbark2',seg:5,flutes:4,fluteA:.1,twist:.4});for(let i=2;i<=6;i++)spots.push(pts[i]);}
 // the outer side: a few boughs away from the alley
 for(let k=0,m=lv===2?2:1;k<m;k++){const a=Math.atan2(-uz,-ux)+rr(-.9,.9),pts=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.5,.9)),T.crownR*rr(.6,1),rb*.4,.08,4,-.05,.1);if(limbOk(pts)){if(lv===2)limb(S,pts,st,{fam:'xbark2',seg:5});for(let i=2;i<=4;i++)spots.push(pts[i]);}}
 const cy=apex[1],cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('broad',p.x+rr(-1,1),p.y+rr(0,1.4),p.z+rr(-1,1),rr(2.4,3.6),.55,hc,apex[0],cy-2,apex[2],L*.7,H*.3,null);st.clumps++;}});
 T.spread=T.crownR;reg(S,T,L*.6);};
// 9 the WISTERIA TREE: two stems wound round each other, an umbrella of low boughs, light leaves, and curtains of racemes in violet, blue and white
B[9]=function(T,st,lv){const S=SP[9],H=T.H,rb=T.rb,hT=H*rr(.45,.6),ph=rr(0,TAU),tops=[];
 for(let s=0;s<2;s++){const pts=[],n=8;for(let i=0;i<=n;i++){const t=i/n,a=ph+s*Math.PI+t*TAU*rr(.9,1.3),r=rb*.55*(1+.5*Math.exp(-t*5)),w=rb*.55;
  pts.push({x:T.x+Math.cos(a)*w*(1-.3*t),y:T.y0+hT*t,z:T.z+Math.sin(a)*w*(1-.3*t),r});}
  limb(S,pts,st,{fam:'xbark0',seg:lv===2?7:5,flutes:3,fluteA:.12,twist:.8});tops.push(pts[n]);}
 const o=tops[0],nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),hc=C(pick([0x8ac060,0x9ad068,0x7ab058])),cy=T.y0+H*.8,rc=vary(pick(S.leaf),.03,.08,.06);
 let white=rng()<.2;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.15,.5)),T.crownR*rr(.7,1.1),rb*.4,.08,5,-.08,.2);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{fam:'xbark0',seg:5,flutes:3,fluteA:.1,twist:.8});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),rb*.35,.08,rodCol(S,k));
  for(let i=1;i<=5;i++){const p=pts[i];clumpAt('broad',p.x+rr(-.8,.8),p.y+rr(.2,1),p.z+rr(-.8,.8),rr(1.6,2.4),.45,hc,T.x,cy,T.z,T.crownR,H*.2,null);st.clumps++;
   const m=lv===2?ri(3,6):lv===1?2:1;for(let r=0;r<m;r++){const col=white?C(0xf4f0ff):vary(pick(S.leaf),.03,.08,.06);
    BIO.put('raceme',[p.x+rr(-1.3,1.3),p.y+rr(-.2,.4),p.z+rr(-1.3,1.3)],qEuler(0,rr(0,TAU),0),[rr(.5,.8),rr(1.1,2.6),1],bright(col,1.2),{c2:bright(C(white?0xd8c8ff:pick(PAL.irid.WV)),1.1)});st.racemes=(st.racemes||0)+1;}}}
 T.spread=T.crownR;reg(S,T);};
// 10 the PERSIAN IRONWOOD: three to six mottled stems in a vase, a wide spreading crown, every spray a different jewel (amber, crimson, gold, plum, the odd green)
B[10]=function(T,st,lv){const S=SP[10],H=T.H,rb=T.rb,nS=lv===2?ri(S.stems[0],S.stems[1]):3,a0=rr(0,TAU),spots=[];
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.4,.4),pts=treeGrow({x:T.x+Math.cos(a)*.3,y:T.y0-.2,z:T.z+Math.sin(a)*.3},dirOf(a,rr(1.05,1.3)),H*rr(.6,.8),rb,.1,5,-.25,.1);
  if(lv===2)limb(S,pts,st,{fam:'xbark2',seg:6});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),rb,.1,rodCol(S,k));
  for(let i=2;i<=5;i++)spots.push(pts[i]);}
 const cy=T.y0+H*.8,cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){const col=C(pick(S.leaf));clumpAt('broad',p.x+rr(-1.6,1.6),p.y+rr(-.2,1.2),p.z+rr(-1.6,1.6),rr(2.4,3.4),.5,col,T.x,cy,T.z,T.crownR,H*.25,C(pick(PAL.irid.CP)));st.clumps++;}});
 T.spread=T.crownR;if(lv===2)reg(S,T);};
// 11 the CHESTNUT-LEAVED OAK: the flanks' great tree. A heavy bole, broad boughs, a high dark dome
B[11]=function(T,st,lv){const S=SP[11],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.6*u)*(1+.4*Math.exp(-u*H/2.5));
 const hB=H*.5,top=bole(T,S,hB,rAt,{vs:6,buttress:.3,nb:5,flutes:6,fluteA:.03});
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.06,.05),cy=T.y0+H*.75,spots=[];
 for(let k=0;k<nB;k++){const u=rr(.35,.5),a=a0+k*GOLD,pts=treeGrow({x:T.x,y:T.y0+H*u,z:T.z},dirOf(a,rr(.45,.85)),T.crownR*rr(.8,1.1),rAt(u)*.45,.1,5,-.06,.12);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{seg:6});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.1,rodCol(S,k));for(let i=2;i<=5;i++)spots.push(pts[i]);}
 spots.push({x:T.x,y:T.y0+H*.95,z:T.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('broad',p.x+rr(-1.6,1.6),p.y+rr(-.5,1.5),p.z+rr(-1.6,1.6),rr(3.4,5),.6,hc,T.x,cy,T.z,T.crownR,H*.28,null);st.clumps++;}});
 T.spread=T.crownR;if(lv===2)reg(S,T);};
// 12 the CAUCASIAN WINGNUT: a leaning bole over the water, spreading boughs, and the catkins: long green chains of winged nuts hanging everywhere
B[12]=function(T,st,lv){const S=SP[12],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(.04,.14);
 const rAt=u=>rb*(1-.6*u)*(1+.4*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.45,rAt,{lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:6,flutes:5,fluteA:.05});
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.06,.05),cy=T.y0+H*.72;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,2),z:top.z},dirOf(a,rr(.35,.8)),T.crownR*rr(.8,1.15),rAt(.45)*.5,.1,5,-.1,.12);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{seg:6});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.1,rodCol(S,k));
  for(let i=2;i<=5;i++){const p=pts[i];clumpAt('broad',p.x+rr(-1.2,1.2),p.y+rr(0,1.2),p.z+rr(-1.2,1.2),rr(2.8,4),.5,hc,T.x,cy,T.z,T.crownR,H*.25,irid(S));st.clumps++;
   if(lv>=1)for(let c=0,m=lv===2?ri(2,4):1;c<m;c++)BIO.put('catkin',[p.x+rr(-1.8,1.8),p.y-rr(0,.5),p.z+rr(-1.8,1.8)],qEuler(0,rr(0,TAU),0),[rr(.25,.4),rr(.9,1.8),1],bright(vary(0x9ac060,.03,.08,.06),1.1));}}
 T.spread=T.crownR;reg(S,T);};
// 13 the CACAO: a slim pale trunk, a few layered branches of long drooping leaves (the new ones copper-red), and the pods straight off the trunk: maroon, gold, orange
B[13]=function(T,st,lv){const S=SP[13],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.55;
 BIO.beam('rod',[T.x,T.y0-.2,T.z],[T.x,T.y0+hT,T.z],rb*2,rb*1.4,tint(pick(S.bark),means().bark[2]));
 const nB=lv===2?ri(3,5):3,a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),y=T.y0+hT+rr(-.3,.8),e=[T.x+Math.cos(a)*T.crownR,y+rr(.4,1.2),T.z+Math.sin(a)*T.crownR];
  BIO.beam('rod',[T.x,y,T.z],e,rb*.8,rb*.3,rc);
  for(let c=0,m=lv===2?3:1;c<m;c++){const f=rr(.4,1),col=C(rng()<.2?S.leaf[2]:pick([S.leaf[0],S.leaf[1],S.leaf[3]]));clumpAt('broad',T.x+(e[0]-T.x)*f,e[1]+rr(-.2,.5),T.z+(e[2]-T.z)*f,rr(1.6,2.4),.55,col,T.x,T.y0+H*.8,T.z,T.crownR,H*.3,null);st.clumps++;}}
 clumpAt('broad',T.x,T.y0+H*.95,T.z,rr(1.8,2.4),.6,C(S.leaf[0]),T.x,T.y0+H*.8,T.z,T.crownR,H*.3,null);st.clumps++;
 if(lv>=1)for(let k=0,m=lv===2?ri(4,9):2;k<m;k++){const a=rr(0,TAU),y=T.y0+rr(.5,hT),col=C(pick([0x8a2a3a,0xd8a030,0xe07a28,0x9a3a2a,0xc8b040]));
  BIO.put('pod',[T.x+Math.cos(a)*rb*1.3,y,T.z+Math.sin(a)*rb*1.3],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.35,.5),bright(col,1.1));st.pods++;}
 if(lv===2)reg(S,T,T.crownR);};
// 14 the PITAYA: a fountain of three-winged stems arching up and over from one crown, dragon fruit at the tips, magenta with green flames
B[14]=function(T,st,lv){const S=SP[14],H=T.H,n=lv===2?ri(10,16):6,a0=rr(0,TAU),col=bright(vary(pick(S.bark),.02,.06,.05),1.05);
 for(let k=0;k<n;k++){const a=a0+k*GOLD,up=rr(.4,1),r=T.crownR*rr(.6,1.1),p0=[T.x,T.y0+.2,T.z],p1=[T.x+Math.cos(a)*r*.35,T.y0+H*up,T.z+Math.sin(a)*r*.35],p2=[T.x+Math.cos(a)*r,T.y0+H*up*rr(.35,.7),T.z+Math.sin(a)*r];
  BIO.beam('wing',p0,p1,rr(.2,.28),null,col);BIO.beam('wing',p1,p2,rr(.18,.24),null,col);
  if(rng()<(lv===2?.55:.3)){BIO.put('pitayafruit',[p2[0],p2[1]+.1,p2[2]],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.16,.24),bright(C(pick([0xe0206a,0xf03080,0xd81858])),1.1));st.fruit=(st.fruit||0)+1;}
  if(lv===2&&rng()<.2)BIO.put('bloom',[p1[0],p1[1]+.2,p1[2]],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.4,.6),bright(C(0xfff8e8),1.05),{c2:bright(C(0xf8f0a0),1)});}};
// 15 the PRICKLY PEAR: pads on pads, three deep, orange and red fruit along the top edges
B[15]=function(T,st,lv){const S=SP[15],col=bright(vary(pick(S.bark),.02,.08,.06),1.05);let n=0;
 function pad(x,y,z,a,tilt,s,dep){BIO.put('opad',[x,y,z],qEuler(tilt,a,rr(-.2,.2)),s,bright(vary(col,.02,.05,.05),rr(.9,1.1)));n++;
  const tx=x+Math.sin(tilt)*Math.cos(a+Math.PI/2)*s*1.1,ty=y+Math.cos(tilt)*s*1.2,tz=z+Math.sin(tilt)*Math.sin(a+Math.PI/2)*s*1.1;
  if(dep<(lv===2?3:2)){const m=ri(1,3);for(let k=0;k<m;k++)pad(tx+rr(-.15,.15)*s,ty-s*.2,tz+rr(-.15,.15)*s,a+rr(-1.2,1.2),rr(-.6,.6),s*rr(.75,.95),dep+1);}
  else if(lv>=1){for(let k=0,m=ri(2,5);k<m;k++){const u=(k+.5)/m-.5;BIO.put('ball',[x+Math.cos(a)*u*s*.9,y+s*1.18-Math.abs(u)*s*.3,z+Math.sin(a)*u*s*.9],qEuler(0,rr(0,TAU),0),[s*.1,s*.14,s*.1],bright(C(pick([0xe86a20,0xf08028,0xd8402a,0xe89030])),1.1));}}}
 for(let k=0,m=ri(1,3);k<m;k++)pad(T.x+rr(-.4,.4),T.y0-.05,T.z+rr(-.4,.4),rr(0,TAU),rr(-.2,.2),T.H*rr(.32,.42),0);
 st.pads=(st.pads||0)+n;};
// 16 the BOTTLE PALM: a swollen bottle of a foot, a trunk forking, a mop of long drooping blades on every tip, pink feather plumes over them
B[16]=function(T,st,lv){const S=SP[16],H=T.H,rb=T.rb;
 const rAt=u=>rb*(.35+.9*Math.exp(-Math.pow(u*2.2,2))*(1-u*.3));
 const hB=H*.55,top=bole(T,S,hB,rAt,{vs:1.2,flutes:5,fluteA:.03,seg:lv===2?12:8,urep:2});
 const n=lv===2?ri(S.forks[0],S.forks[1]):2,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.06,.05),plumeC=C(pick([0xf09ab0,0xf8b0c0,0xe88aa8,0xf0c0b0]));
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),e=[top.x+Math.cos(a)*rr(.8,1.8),top.y+H*rr(.15,.4),top.z+Math.sin(a)*rr(.8,1.8)];
  BIO.beam('rod',[top.x,top.y-.5,top.z],e,rAt(.55)*.6,rAt(.55)*.4,tint(pick(S.bark),means().bark[5]));
  BIO.put('hair',[e[0],e[1]-T.crownR*.55,e[2]],qEuler(0,rr(0,TAU),0),[T.crownR*1.5,T.crownR*1.1,T.crownR*1.5],bright(vary(hc,.02,.06,.05),1.25));
  if(lv>=1)for(let p=0,m=lv===2?ri(2,4):1;p<m;p++)BIO.put('plume',[e[0]+rr(-.4,.4),e[1]+rr(0,.3),e[2]+rr(-.4,.4)],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[rr(.9,1.3),rr(1.4,2.2),rr(.9,1.3)],bright(vary(plumeC,.02,.06,.05),1.15),{c2:bright(C(0xffe0e8),1.05)});}
 if(lv===2)reg(S,T,T.crownR);};
// 17 the DESERT ROSE: a fat twisted caudex, a few thick stubby limbs, a tuft of leaves and a crown of ruffled flowers (red with black edges, crimson, pink and white)
B[17]=function(T,st,lv){const S=SP[17],H=T.H,rb=T.rb;
 const rAt=u=>rb*(.3+.8*Math.exp(-Math.pow(u*2.4,2)));
 const top=bole(T,S,H*.55,rAt,{vs:.5,flutes:4,fluteA:.12,twist:1.8,seg:lv===2?12:8,urep:1.5,buttress:.4,bh:.3,nb:4});
 const n=ri(3,6),a0=rr(0,TAU),pair=rng()<.55?[C(0xe02a30),C(0x1a0a10)]:pick([[C(0xff3a8a),C(0xffe0f0)],[C(0xfff0f4),C(0xff2a6a)],[C(0xb01830),C(0xff9a40)]]);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),e=[T.x+Math.cos(a)*T.crownR*rr(.4,.9),T.y0+H*rr(.8,1.05),T.z+Math.sin(a)*T.crownR*rr(.4,.9)];
  BIO.beam('rod',[top.x,top.y-.2,top.z],e,rb*.28,rb*.16,tint(pick(S.bark),means().bark[5]));
  clumpAt('ucard',e[0],e[1]+.1,e[2],rr(.6,.9),.6,bright(C(pick(S.leaf)),1.3),T.x,T.y0+H,T.z,T.crownR,H*.3,null);
  for(let f=0,m=lv===2?ri(3,6):1;f<m;f++)flower('ruffle',e[0]+rr(-.35,.35),e[1]+rr(.1,.35),e[2]+rr(-.35,.35),rr(.3,.45),bright(vary(pair[0],.02,.05,.04),1.15),bright(pair[1],1.05),true);st.blooms+=3;}};
// 18 the HAZE BLOSSOM: a low gnarled trunk, a wide umbrella wholly in blossom (pink, lavender, white; now and then all violet), petals lying round its foot
B[18]=function(T,st,lv){const S=SP[18],H=T.H,rb=T.rb,la=rr(0,TAU);
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,rr(1.2,1.45)),H*.4,rb,rb*.6,5,-.1,.18);limb(S,pts,st,{fam:'xbark0',seg:lv===2?8:6,flutes:4,fluteA:.12,twist:.6});
 const o=pts[5],nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),violet=rng()<.15,base=violet?C(pick([0xb080f0,0xa070e8,0xc098ff])):C(pick(S.leaf)),cy=T.y0+H*.8,spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),p=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.25,.6)),T.crownR*rr(.8,1.1),rb*.5,.08,4,-.06,.2);
  if(!limbOk(p))continue;if(lv===2)limb(S,p,st,{fam:'xbark0',seg:5,flutes:3,fluteA:.1,twist:.8});else BIO.beam('rod',P3(p[0]),P3(p[4]),rb*.45,.08,rodCol(S,k));for(let i=1;i<=4;i++)spots.push(p[i]);}
 spots.push({x:o.x,y:T.y0+H*.95,z:o.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('blossom',p.x+rr(-1.3,1.3),p.y+rr(0,1.4),p.z+rr(-1.3,1.3),rr(2.4,3.4),.55,vary(base,.02,.06,.04),o.x,cy,o.z,T.crownR,H*.25,C(pick(PAL.irid.PK)));st.clumps++;}});
 if(lv===2)for(let k=0,m=ri(3,6);k<m;k++){const a=rr(0,TAU),d=T.crownR*rr(.2,1),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d;BIO.put('mossmat',[px,BIO.terrainH(px,pz)+.06,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),rr(1,2.2),bright(vary(base,.02,.05,.05),1.2));}
 T.spread=T.crownR;reg(S,T);};
// 19 the FROST WILLOW: a pale whorled trunk, arching boughs, a curtain of long silver strands that go lavender away from the sun
B[19]=function(T,st,lv){const S=SP[19],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(.02,.12);
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/2));
 const top=bole(T,S,H*.45,rAt,{fam:'xbark0',lean:[Math.cos(la)*lk,Math.sin(la)*lk],flutes:5,fluteA:.14,twist:.5,vs:3});
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.8;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,1.5),z:top.z},dirOf(a,rr(.7,1.1)),T.crownR*rr(.8,1.1),rAt(.45)*.45,.08,5,-.35,.1);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{fam:'xbark0',seg:5});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.08,rodCol(S,k));
  for(let i=2;i<=5;i++){const p=pts[i],m=lv===2?ri(2,4):1;for(let r=0;r<m;r++){const drop=Math.max(1.5,Math.min(p.y-T.y0-rr(.3,1.5),rr(4,9)));
   BIO.put('willow',[p.x+rr(-1,1),p.y+rr(0,.5),p.z+rr(-1,1)],qEuler(0,rr(0,TAU),0),[rr(1.2,2),drop,1],bright(vary(hc,.02,.04,.05),1.3),{c2:bright(C(pick(PAL.irid.SL)),1.1)});st.strands=(st.strands||0)+1;}}}
 T.spread=T.crownR;reg(S,T);};
// 20 the TRAVELLER'S PALM: a ringed stem and a flat fan of great paddle leaves, all in one plane
B[20]=function(T,st,lv){const S=SP[20],H=T.H,rb=T.rb,hT=H*.45,fa=rr(0,TAU),hc=vary(pick(S.leaf),.02,.06,.05);
 BIO.beam('rod',[T.x,T.y0-.2,T.z],[T.x,T.y0+hT,T.z],rb*2,rb*1.7,tint(pick(S.bark),means().bark[4]));
 const n=lv===2?ri(14,20):9,cx=Math.cos(fa),cz=Math.sin(fa);
 for(let k=0;k<n;k++){const t=(k+.5)/n,ang=lerp(-1.25,1.25,t)+rr(-.04,.04),L=H*rr(.55,.7)*(1-.25*Math.abs(t-.5)),d=[cx*Math.sin(ang),Math.cos(ang),cz*Math.sin(ang)];
  const b=[T.x,T.y0+hT,T.z],m=[b[0]+d[0]*L*.45,b[1]+d[1]*L*.45,b[2]+d[2]*L*.45];
  BIO.beam('rod',b,m,.07,.05,shade(hc,-.2));
  const q=qBasis([cx*Math.cos(ang),-Math.sin(ang),cz*Math.cos(ang)],d);   // the blade lies in the fan's plane
  BIO.put('banana',m,q,[L*.32,L*.62,1],bright(vary(hc,.02,.05,.05),rr(1.2,1.45)),{n:[-cz,.4,cx]});st.fans++;}
 if(lv===2)reg(S,T,H*.4);};
// 21 the VIOLET PLANTAIN: a purple pseudostem, arching purple paddles, and a tall spike of purple bracts over hands of yellow fruit
B[21]=function(T,st,lv){const S=SP[21],H=T.H,rb=T.rb,hc=vary(pick(S.leaf),.02,.06,.05);
 BIO.beam('rod',[T.x,T.y0-.2,T.z],[T.x,T.y0+H*.55,T.z],rb*2,rb*1.5,rodCol(S,T.seed));
 const n=lv===2?ri(6,9):4,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),el=rr(.3,.9),d=[Math.cos(a)*Math.sin(el),Math.cos(el),Math.sin(a)*Math.sin(el)],L=T.crownR*rr(1.2,1.6);
  const q=qBasis([-Math.sin(a),0,Math.cos(a)],d);   // the blade spreads sideways across its arch
  BIO.put('banana',[T.x,T.y0+H*.5,T.z],q,[L*.38,L,1],bright(vary(hc,.02,.05,.05),rr(1.2,1.4)),{n:[Math.cos(a)*.6,.7,Math.sin(a)*.6]});st.fans++;}
 if(lv>=1){const y0=T.y0+H*.55,tiers=lv===2?ri(5,8):3;BIO.beam('rod',[T.x,y0,T.z],[T.x,T.y0+H,T.z],.08,.05,rodCol(S,1));
  for(let t=0;t<tiers;t++){const y=lerp(y0+.4,T.y0+H*.95,t/tiers),a=t*GOLD;
   for(let k=0;k<3;k++){const aa=a+k/3*TAU;BIO.put('ball',[T.x+Math.cos(aa)*.28,y,T.z+Math.sin(aa)*.28],qEuler(rr(-.3,.3),aa,.5),[.07,.22,.07],bright(C(0xf0d040),1.1));}
   BIO.put('cone',[T.x,y+.12,T.z],qEuler(rr(-.4,.4),a,rr(-.4,.4)),[.35,.5,.35],bright(C(0x6a2a8a),1.05));}}};
// 22 the WOLLEMI PINE: two to four tall straight stems, short level branches of dark leafy cords, spiky round cones at the tips up top
B[22]=function(T,st,lv){const S=SP[22],H=T.H,rb=T.rb,nS=lv===2?ri(S.stems[0],S.stems[1]):2,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),rc=rodCol(S,T.seed);
 for(let s=0;s<nS;s++){const a=a0+s/nS*TAU,d=s?rr(.8,1.8):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=H*(s?rr(.65,.9):1),ly=Y(x,z);
  BIO.put('trunk',[x,ly-.5,z],qUp([rr(-.03,.03),1,rr(-.03,.03)]),[rb/.4,h,rb/.4],tint(pick(S.bark),means().bark[3],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
  const tiers=lv===2?Math.round(h/1.8):Math.round(h/3.5);
  for(let t=0;t<tiers;t++){const u=lerp(.25,.98,t/tiers),y=ly+h*u,Rt=T.crownR*(1-.55*u)*rr(.8,1.1),m=lv===2?3:2,ab=t*GOLD;
   for(let k=0;k<m;k++){const aa=ab+k/m*TAU,ex=x+Math.cos(aa)*Rt,ez=z+Math.sin(aa)*Rt;
    if(lv===2)BIO.beam('rod',[x,y,z],[ex,y-.3,ez],.06,.03,rc);
    clumpAt('needle',x+(ex-x)*.6,y-.2,z+(ez-z)*.6,Math.max(1.2,Rt*.9),.35,hc,x,y,z,Rt+1,1.5,null);st.clumps++;
    if(u>.8&&lv===2&&rng()<.4)BIO.put('ball',[ex,y+.2,ez],qEuler(0,rr(0,TAU),0),rr(.18,.26),bright(C(pick([0x6a8a3a,0x8a7a3a,0x5a7a44])),1));}}}
 T.spread=T.crownR+1;reg(S,T);};
// 23 the cloud tree-fern (the Rift's, in the chasm's spray)
B[23]=function(T,st,lv){const S=SP[23],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12);
 BIO.put('trunk',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4*1.1,H+.5,rb/.4*1.1],tint(pick(S.bark),means().bark[3],rr(.8,1)));st.sapTris+=BIO.defs.trunk.tris;
 const tx=T.x+Math.cos(la)*lk*H,tz=T.z+Math.sin(la)*lk*H,ty=T.y0+H*(1-lk*lk*.5),Rf=T.crownR;
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):lv===1?8:5,hc=vary(pick(S.leaf),.03,.1,.05);
 frondCrown('bigfrond',tx,ty,tz,Rf,n,-.12,.22,bright(hc,1.5),1.25);
 if(lv>=1){frondCrown('bigfrond',tx,ty+.5,tz,Rf*.62,lv===2?5:3,.55,1.1,bright(shade(hc,.1),1.5),1.1);
  for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),yy=rr(1,H*.8);BIO.put('mossmat',[T.x+Math.cos(a)*rb*1.05,T.y0+yy,T.z+Math.sin(a)*rb*1.05],qUp([Math.cos(a),rr(-.1,.3),Math.sin(a)]),rr(.5,1),bright(vary(pick(PAL.moss),.03,.1,.06),.95));st.moss++;}}
 st.fronds+=n;};
// 24 the lantern tree (the Rift's): drooping boughs hung with bright lantern pods, here in the psychedelic set
B[24]=function(T,st,lv){const S=SP[24],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),la=rr(0,TAU),lk=rr(0,.1);
 BIO.put('trunkw',[T.x,T.y0-.5,T.z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H*.55+.5,rb/.4],tint(pick(S.bark),means().bark[0],rr(.85,1)));st.sapTris+=BIO.defs.trunkw.tris;
 const tx=T.x+Math.cos(la)*lk*H*.55,tz=T.z+Math.sin(la)*lk*H*.55,ty=T.y0+H*.55,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.03,.08,.05),cy=T.y0+H*.9;
 for(let k=0;k<nB;k++){const a=a0+k*GOLD+rr(-.3,.3),R=T.crownR*rr(.6,1),mid=[tx+Math.cos(a)*R*.5,ty+H*.3,tz+Math.sin(a)*R*.5],end=[tx+Math.cos(a)*R,ty+H*.12,tz+Math.sin(a)*R];
  BIO.beam('rod',[tx,ty-.2,tz],mid,rb*.5,rb*.3,rc);BIO.beam('rod',mid,end,rb*.3,rb*.1,rc);
  [mid,end].forEach(p=>{clumpAt('broad',p[0],p[1]+.3,p[2],rr(1.5,2.4),.55,hc,T.x,cy,T.z,T.crownR,H*.3,null);st.clumps++;
   if(lv>=1)for(let f=0,m=lv===2?ri(2,4):1;f<m;f++){BIO.put('pod',[p[0]+rr(-1,1),p[1]-.2,p[2]+rr(-1,1)],qEuler(0,rr(0,TAU),0),rr(1.4,2.2),bright(C(pick(PAL.psy)),1.2));st.pods++;}});}
 if(lv===2)reg(S,T,T.crownR);};
// 25 the silver fan palm (the Rift's fan tree): a pale trunk forking, a head of flat silver wheels on every tip
B[25]=function(T,st,lv){const S=SP[25],H=T.H,rb=T.rb,rc=rodCol(S,T.seed),hT=H*.5,tips=[];
 BIO.put('trunk',[T.x,T.y0-.4,T.z],qUp([rr(-.05,.05),1,rr(-.05,.05)]),[rb/.4,hT+.4,rb/.4],tint(pick(S.bark),means().bark[3],rr(.85,1)));st.sapTris+=BIO.defs.trunk.tris;
 function fork(p,a,el,len,r,dep){const e=[p[0]+Math.cos(a)*Math.cos(el)*len,p[1]+Math.sin(el)*len,p[2]+Math.sin(a)*Math.cos(el)*len];BIO.beam('rod',p,e,r,r*.7,rc);
  if(dep<1&&rng()<.6){for(let k=0,m=ri(2,3);k<m;k++)fork(e,a+rr(-1.3,1.3),rr(.6,1.1),len*rr(.6,.8),r*.7,dep+1);}else tips.push(e);}
 const n1=ri(S.forks[0],S.forks[1]),a0=rr(0,TAU);for(let k=0;k<n1;k++)fork([T.x,T.y0+hT-.3,T.z],a0+k/n1*TAU+rr(-.3,.3),rr(.8,1.2),H*rr(.25,.4),rb*.6,0);
 const hc=vary(pick(S.leaf),.02,.05,.04);
 tips.forEach(p=>{const n=lv===2?ri(6,9):4;for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.2,.2),tilt=rr(.3,1.1),R=T.crownR*rr(.7,1);
   const d=[Math.cos(a)*Math.sin(tilt),Math.cos(tilt),Math.sin(a)*Math.sin(tilt)];
   BIO.put('fan',[p[0]+d[0]*R*.45,p[1]+d[1]*R*.45,p[2]+d[2]*R*.45],qUp(d),[R,1,R],bright(vary(hc,.02,.04,.05),rr(1.25,1.45)));st.fans++;}});
 if(lv===2)reg(S,T,T.crownR);};
// 26 the barrel frill (the Rift's ridgetop shrub)
B[26]=function(T,st,lv){const S=SP[26],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs,ph=rr(0,TAU);
 const rAt=u=>rb*(.75+.5*Math.sin(u*Math.PI)*(1-.3*u))*(1-.25*u);
 const rings=[];for(let yy=0;yy<H*.9;yy+=Math.max(.5,H/9))rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/1.5)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.9,z:T.z,r:rAt(.9)*.8,yy:H*.9,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.9+rAt(.9)*.7,z:T.z,r:.04,yy:H,col:barkCol(S,1)});
 st.trunk+=BIO.lathe('xbarkF',rings,lv===2?18:12,Math.max(1,Math.round(TAU*rb/2)),2.5,(R,ang)=>R.r*(1+.12*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05),rows=lv===2?ri(5,7):3,nf=lv===2?nR:Math.ceil(nR/2);
 for(let r=0;r<rows;r++){const u=lerp(.1,.85,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.05,Lp=lerp(1.0,1.7,Math.sin(u*Math.PI))*(H/4);
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=Lp*rr(.85,1.15);
   BIO.put('frill',[T.x+Math.cos(a)*R,yy,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(.5,1.0,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),{c2:softC2(bright(pick(c2s),1.1),hc,.4),n:[Math.cos(a)*.8,.6,Math.sin(a)*.8]});st.fins++;}}
 const top=T.y0+H*.92,pr=psyPair();
 for(let k=0,m=lv===2?ri(5,9):3;k<m;k++){const a=rr(0,TAU),d=rr(0,.5)*rb;flower('star',T.x+Math.cos(a)*d,top+rr(0,.4),T.z+Math.sin(a)*d,rr(.4,.7),pr[0],pr[1],true);st.blooms++;}
 if(lv===2)reg(S,T,T.crownR+rb);};
// 27 the silver scrub (the Rift's garrigue bush)
B[27]=function(T,st,lv){const S=SP[27],H=T.H,Rs=T.crownR,hc=vary(pick(S.leaf),.02,.05,.04);
 BIO.put('lobe',[T.x,T.y0-.2,T.z],qEuler(0,rr(0,TAU),0),[Rs*.8,H*.6,Rs*.8],shade(hc,-.25));
 const n=lv===2?ri(3,5):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=Rs*rr(.1,.6);clumpAt('leaflet',T.x+Math.cos(a)*d,T.y0+H*rr(.4,.9),T.z+Math.sin(a)*d,Rs*rr(.8,1.2),.6,hc,T.x,T.y0+H*.6,T.z,Rs,H*.5,null);st.clumps++;}
 if(lv>=1&&rng()<.7){const fc=bright(C(pick([0x9a5ad0,0xb070e0,0x8a48c0,0xd0a0f0,0xf0c040])),1.15);for(let k=0,m=lv===2?ri(3,7):2;k<m;k++){const a=rr(0,TAU),d=Rs*rr(0,.7);BIO.put('candle',[T.x+Math.cos(a)*d,T.y0+H*.8,T.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[H*.18,H*.45,H*.18],fc);st.blooms++;}}};
// 28 the chasm frill (the Rift's frill tree at a fraction of its height, in the spray, flowering)
B[28]=function(T,st,lv){const S=SP[28],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/5));
 const rings=[],vs=5;for(let yy=0;yy<H*.9;yy+=vs*.6)rings.push({x:T.x,y:T.y0+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/12)+ti)%3).lerp(C(PAL.moss[ti%3]),smooth(6,1,yy)*.4)});
 rings.push({x:T.x,y:T.y0+H*.9,z:T.z,r:rAt(.9),yy:H*.9,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.9+rAt(.9)*1.6,z:T.z,r:.05,yy:H*.9+2,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe('xbarkF',rings,lv===2?20:12,Math.max(1,Math.round(TAU*rb/4)),vs,(R,ang)=>R.r*(1+.10*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const c2s=PAL.irid[S.irid],hc=vary(pick(S.leaf),.03,.08,.05),rows=lv===2?Math.max(3,Math.round(H/2.4)):Math.max(2,Math.round(H/5)),nf=lv===2?nR:nR/2;
 for(let r=0;r<rows;r++){const u=lerp(.08,.86,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.08;
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=lerp(1.5,3.2,smooth(.05,.7,u))*(H/18)*rr(.9,1.1);
   BIO.put('frill',[T.x+Math.cos(a)*R,yy,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(1.05,.85,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),{c2:bright(pick(c2s),1.2),n:[Math.cos(a)*.85,.5,Math.sin(a)*.85]});st.fins++;}}
 if(lv===2){const pr=psyPair();for(let k=0,m=ri(4,8);k<m;k++){const u=rr(.2,.9),a=rr(0,TAU),R=rAt(u)+.2;flower(rng()<.5?'orchid':'swirl',T.x+Math.cos(a)*R,T.y0+H*u,T.z+Math.sin(a)*R,rr(.5,.9),pr[0],pr[1]);st.blooms++;}}
 T.spread=T.crownR;reg(S,T);};
// 29 the beard tree (the Rift's, in the mountains' mist): gnarled, draped in beard moss, orchids in the forks
B[29]=function(T,st,lv){const S=SP[29],H=T.H,rb=T.rb,ti=T.seed%3;
 const rAt=u=>rb*(1-.5*u)*(1+1.2*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.5,rAt,{fam:'xbark0',vs:2.5,flutes:3,fluteA:.12,twist:.7,wob:yy=>[.5*Math.sin(yy*.6+ti),.4*Math.cos(yy*.5+ti)]});
 const nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.03,.08,.05),cy=T.y0+H*.8;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.5,.5),el=rr(.2,.7),len=T.crownR*rr(.7,1.1);
  const pts=treeGrow({x:top.x,y:top.y-.3,z:top.z},dirOf(a,el),len,rAt(.5)*.6,.1,4,-.15,.22);if(!limbOk(pts))continue;
  limb(S,pts,st,{fam:'xbark0',seg:5,col:barkCol(S,1).lerp(C(PAL.moss[k%3]),.3)});
  for(let i=1;i<=4;i++){const p=pts[i];
   if(rng()<.8){clumpAt('leaflet',p.x+rr(-.5,.5),p.y+rr(0,1),p.z+rr(-.5,.5),rr(1.4,2.4),.5,hc,T.x,cy,T.z,T.crownR,H*.4,null);st.clumps++;}
   if(lv>=1){for(let b=0,m=lv===2?ri(2,4):1;b<m;b++){BIO.put('beard',[p.x+rr(-.5,.5),p.y-p.r*.5,p.z+rr(-.5,.5)],qEuler(0,rr(0,TAU),0),[rr(.8,1.6),rr(2,5),1.2],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.25));st.moss++;}
    if(rng()<.5)BIO.put('mossmat',[p.x,p.y+p.r*.9,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.6,1.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));}
   if(lv===2&&rng()<.5){const pr=psyPair();for(let f=0,m=ri(2,4);f<m;f++)flower('orchid',p.x+rr(-.8,.8),p.y+rr(-.3,.8),p.z+rr(-.8,.8),rr(.35,.6),pr[0],pr[1]);st.blooms++;}}}
 reg(S,T,T.crownR);};
// 30 the serpent stalk (the Rift's anemone stalk): black sinuous stalks on the dry red ground, each tip a red tuft
B[30]=function(T,st,lv){const S=SP[30],H=T.H,rb=T.rb,rc=shade(C(pick(S.bark)),-.1),tips=[];
 function stalk(x,y,z,a,h,r,dep){const m=5,pts=[];let px=x,py=y,pz=z,aa=a;for(let j=0;j<=m;j++){const u=j/m;pts.push({x:px,y:py,z:pz,r:r*(1-.5*u)});aa+=rr(-.8,.8);px+=Math.cos(aa)*h*.14;pz+=Math.sin(aa)*h*.14;py+=h/m;}
  st.limb+=BIO.tube('xbark3',pts,rc,{seg:5});const e=pts[m];
  if(dep<1&&rng()<.4){stalk(e.x,e.y,e.z,aa+rr(1,2),h*rr(.35,.55),r*.7,dep+1);}tips.push(e);}
 for(let k=0,n=ri(1,3);k<n;k++)stalk(T.x+rr(-.8,.8),T.y0,T.z+rr(-.8,.8),rr(0,TAU),H*rr(.6,1),rb,0);
 const col=bright(vary(pick(S.leaf),.02,.08,.05),1.2);
 tips.forEach(p=>{const R=T.crownR*rr(.8,1.2),n=lv===2?ri(3,5):2;for(let k=0;k<n;k++){const a=rr(0,TAU),d=R*rr(0,.3);BIO.put('anemone',[p.x+Math.cos(a)*d,p.y+rr(0,.3)*R,p.z+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),R*rr(1.3,1.8),col);st.blooms++;}});};

// ---------------------------------------------------------------- impostors (the far canopy)
// Each species a trunk of four quads and one to three blobs by its habit.
const HABIT={dawnredwood:'cone',wollemi:'cone',ginkgo:'oval',lotustrumpet:'cups',cloudpine:'pads',topiary:'lumps',whorlolive:'dome',agatetree:'vase',ringbeech:'oval',archhornbeam:'dome',
 wisteria:'umbrella',parrotia:'umbrella',hyrcanoak:'dome',wingnut:'dome',hazeblossom:'umbrella',frostwillow:'weep',chasmfrill:'column',cloudfrill:'column',beardtree:'dome'};
let ICO=null,ICO0=null;
// lite: the stand-in behind a hero tree (seen only past its detail range): a coarser blob, fewer of them
function buildFar(T,fi,st,lite){const K=BIO.bucket('xfar');if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}const ip=lite?ICO0:ICO;
 const S=SP[T.sp],cheap=lite||BIO.lodD(T.x,T.z)>2200,hb=HABIT[S.key]||'dome';let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.18*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.12*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=shade(C(S.bark[fi%S.bark.length]),-.1).convertSRGBToLinear(),seg=cheap?3:5,top=T.y0+T.H*(hb==='cone'?.95:hb==='column'?.9:.6),rings=[];
 [0,.5,1].forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.35,T.rb*(1-.5*u)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*(r2/rings.length);
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100,I=S.irid?PAL.irid[S.irid]:null,A=L[fi%L.length],Bc=I?I[fi%I.length]:L[(fi+1)%L.length];
 if(hb==='cone')blob(T.x,T.y0+T.H*.6,T.z,R*.8,T.H*.4,A,Bc,fi);
 else if(hb==='column')blob(T.x,T.y0+T.H*.5,T.z,R*.6,T.H*.45,A,Bc,fi);
 else if(hb==='oval')blob(T.x,T.y0+T.H*.7,T.z,R*.85,T.H*.3,A,Bc,fi);
 else if(hb==='umbrella')blob(T.x,T.y0+T.H*.78,T.z,R,T.H*.2,A,Bc,fi);
 else if(hb==='weep')blob(T.x,T.y0+T.H*.6,T.z,R,T.H*.38,A,Bc,fi);
 else if(hb==='vase'){blob(T.x,T.y0+T.H*.82,T.z,R,T.H*.17,A,Bc,fi);}
 else if(hb==='cups'||hb==='pads'||hb==='lumps'){for(let k=0;k<(cheap?2:3);k++){const a=a0+k/3*TAU;blob(T.x+Math.cos(a)*R*.55,T.y0+T.H*(.7+.1*(k%2)),T.z+Math.sin(a)*R*.55,R*.45,T.H*.1,A,hb==='cups'?0xff80b0:Bc,fi+k);}}
 else blob(T.x,T.y0+T.H*.75,T.z,R*.9,T.H*.25,A,Bc,fi);
 {const kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);}   // the impostor's triangles carry the tree's lod key like any other
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
XANADU.buildTrees=function(R,q){
 reseed(550023);q=q==null?1:q;R=R||3400;means();
 const st={trunk:0,limb:0,far:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fins:0,fans:0,heroes:0,fars:0,rings:0,arches:0,byS:SP.map(()=>0)};
 const TREES=XANADU.TREES;TREES.length=0;XANADU.RINGS.length=0;XANADU.ARCHES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 const lvOf=(x,z,hero,mid)=>{const ld=BIO.lodD(x,z);return ld<hero?2:(ld<mid?1:0);};
 const okAt=(x,z,pad)=>BIO.mask(x,z)>.2&&!blocked(x,z,pad)&&BIO.clearOf(x,z,pad+2);
 // --- THE RINGS: fairy circles of one species round an empty lawn
 BIO.grid(300,0,R,(x,z)=>{const Z=zones(x,z);return (Z.forest*.55+Z.vale*.5+Z.dry*.3)*q;},(x,y,z)=>{
  const Z=zones(x,z),sp=Z.dry>.5?3:(Z.vale>Z.forest?(rng()<.4?1:rng()<.5?18:7):7),S=SP[sp];
  const rad=sp===3?rr(6,10):rr(8,15),n=Math.max(7,Math.round(TAU*rad/(sp===3?4.2:5.6))),a0=rr(0,TAU),pos=[];
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,px=x+Math.cos(a)*rad,pz=z+Math.sin(a)*rad;if(!okAt(px,pz,2))return;pos.push([px,pz,a]);}
  let h0=1e9,h1=-1e9;pos.forEach(p=>{const h=Y(p[0],p[1]);h0=Math.min(h0,h);h1=Math.max(h1,h);});if(h1-h0>rad*.45)return;
  const lvR=lvOf(x,z,520,1050),ring={x,z,r:rad,sp,n,lv:lvR};XANADU.RINGS.push(ring);st.rings++;
  const H0=rr(S.H[0],S.H[1]);
  pos.forEach(p=>{const T=mk(p[0],Y(p[0],p[1]),p[1],sp);T.H=H0*rr(.9,1.1);T.crownR*=.8;T.outA=p[2];T.lean=rr(.03,.08);T.inA=p[2]+Math.PI+rr(-.3,.3);T.reachIn=rad*rr(.45,.7);
   if(sp===3){T.lean=p[2];T.wind=0;}
   T.lv=lvR;TREES.push(T);hadd({x:p[0],z:p[1],r:T.rb*1.4+1.5});});
  hadd({x,z,r:rad-2});},{patch:0,pad:4});
 // --- THE ARCHES: alleys of hornbeams in pairs, leaning together until the boughs lace overhead
 BIO.grid(360,0,R,(x,z)=>{const Z=zones(x,z);return (Z.forest*.6+Z.vale*.18)*q;},(x,y,z)=>{
  const a=rr(0,TAU),ux=Math.cos(a),uz=Math.sin(a),np=ri(3,7),sp2=rr(8,10.5),hw=rr(4.5,6.5),pairs=[];
  for(let k=0;k<np;k++){const cx=x+ux*sp2*(k-(np-1)/2),cz=z+uz*sp2*(k-(np-1)/2),L=[cx-uz*hw,cz+ux*hw],Rp=[cx+uz*hw,cz-ux*hw];
   if(!okAt(L[0],L[1],2)||!okAt(Rp[0],Rp[1],2))return;if(Math.abs(Y(L[0],L[1])-Y(Rp[0],Rp[1]))>3)return;pairs.push([L,Rp]);}
  const lvA=lvOf(x,z,520,1050),H=rr(SP[8].H[0],SP[8].H[1]);XANADU.ARCHES.push({x,z,a,n:np,hw,lv:lvA});st.arches++;
  pairs.forEach((pr,k)=>{[0,1].forEach(s=>{const p=pr[s],o=pr[1-s],T=mk(p[0],Y(p[0],p[1]),p[1],8);T.H=H*rr(.92,1.08);T.partner=o;T.side=s?1:-1;T.lv=lvA;TREES.push(T);hadd({x:p[0],z:p[1],r:T.rb*1.4+1});});});
  hadd({x,z,r:1.5});},{patch:0,pad:4});
 // --- one species pass: a jittered grid over the disc, the zone weight as acceptance
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(y<(opt.minY==null?.3:opt.minY))return;
    if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp);if(opt.mod)opt.mod(T,zones(x,z));
    T.lv=lvOf(x,z,opt.hero,opt.mid);
    if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},{patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:1,noMask:opt.noMask});
  return n;}
 // the shore and the river: dawn redwoods (some standing in the shallows), frost willows, wingnuts, lotus trumpets
 pass(0,15,(Z,x,z)=>{const h=Z.h;if(h>.35||h<-1.3)return 0;return .5*smooth(.5,.7,fbm(x*.004+3,z*.004-1,811,2));},{hero:470,mid:980,far:true,pad:2.5,patch:0,noMask:true,minY:-1.3});
 pass(0,34,(Z)=>Z.shore*.55+Z.rip*.5+Z.chasm*.35,{hero:470,mid:980,far:true,pad:3,patch:.4});
 pass(19,40,(Z)=>Z.shore*.45+Z.rip*.45,{hero:430,mid:900,far:true,pad:4,patch:.5});
 pass(12,40,(Z)=>Z.rip*.55+Z.forest*.05,{hero:430,mid:900,far:true,pad:4,patch:.5});
 pass(2,48,(Z)=>Z.vale*.26*(.12+1.7*Z.grove)+Z.shore*.32+Z.rip*.2,{hero:470,mid:980,far:true,pad:4,patch:.4});
 // the vale: cushion trees, haze blossoms, wisteria, ginkgos, traveller's palms
 pass(4,40,(Z)=>Z.vale*.34*(.12+1.7*Z.grove),{hero:430,mid:900,far:true,pad:3,patch:.4});
 pass(18,40,(Z)=>Z.vale*.32*(.12+1.7*Z.grove)+Z.rip*.08,{hero:430,mid:900,far:true,pad:3,patch:.4});
 pass(9,42,(Z)=>Z.vale*.18*(.12+1.7*Z.grove)+Z.rip*.2+Z.shore*.1,{hero:430,mid:900,far:true,pad:3,patch:.4});
 pass(1,46,(Z)=>Z.vale*.26*(.12+1.7*Z.grove)+Z.forest*.12,{hero:470,mid:980,far:true,pad:3,patch:.4});
 pass(20,30,(Z)=>Z.vale*.1+Z.rip*.18+Z.chasm*.08,{hero:400,mid:750,far:false,pad:2.5,lodK:.6,patch:.4});
 // the forest: oaks and agate trees over ironwood, wingnuts on the water, Wollemi pines in the damp, lantern trees under
 pass(11,30,(Z)=>Z.forest*.55,{hero:400,mid:820,far:true,pad:4,patch:.3});
 pass(6,60,(Z)=>Z.forest*.34+Z.vale*.1,{hero:470,mid:980,far:true,pad:4,patch:.5,patchScale:.006});
 pass(10,30,(Z)=>Z.forest*.5+Z.vale*.06,{hero:400,mid:820,far:true,pad:2.5,patch:.45});
 pass(22,50,(Z)=>Z.forest*.08+Z.chasm*.35+Z.cloud*.2,{hero:470,mid:980,far:true,pad:3,patch:.5});
 pass(24,26,(Z)=>Z.forest*.12+Z.chasm*.25,{hero:400,mid:750,far:false,pad:2,lodK:.6,patch:.5});
 // the chasm and the mountains' mist: tree-ferns, cacao, violet plantains, frills, beard trees
 pass(23,16,(Z)=>Z.chasm*.6+Z.rip*.12+Z.cloud*.3,{hero:400,mid:750,far:false,pad:1.6,lodK:.6});
 pass(13,16,(Z)=>Z.chasm*.45*smooth(.3,.1,Z.up)+Z.rip*.2+Z.forest*.03,{hero:360,mid:680,far:false,pad:2,lodK:.6,patch:.5});
 pass(21,20,(Z)=>Z.chasm*.35*smooth(.3,.1,Z.up)+Z.rip*.18,{hero:360,mid:680,far:false,pad:2,lodK:.6,patch:.5});
 pass(28,34,(Z)=>Z.chasm*.45+Z.cloud*.35,{hero:430,mid:900,far:true,pad:3,patch:.4});
 pass(29,22,(Z)=>Z.cloud*.55+Z.chasm*.2,{hero:400,mid:820,far:true,pad:2.5,lodK:.5});
 // the uplands: whorl olives, cloud pines, bottle palms, desert roses, prickly pears, pitaya, the ridgetop's own
 pass(5,30,(Z)=>Z.dry*.55,{hero:400,mid:820,far:true,pad:2.5,patch:.5});
 pass(3,34,(Z)=>Z.dry*.3+Z.crag*.45,{hero:430,mid:900,far:true,pad:3,patch:.5,mod:(T,Z)=>{if(Z.crag>.4){T.wind=rr(.2,.6);T.lean=rr(4.2,5.4);}}});   // the crag's pines lean away from the lake, north-north-west winds
 pass(16,34,(Z)=>Z.dry*.24,{hero:400,mid:750,far:false,pad:2.5,lodK:.6,patch:.5});
 pass(17,28,(Z)=>Z.dry*.24,{hero:320,mid:600,far:false,pad:1.5,lodK:.7,patch:.5});
 pass(15,24,(Z)=>Z.dry*.34+Z.crag*.08,{hero:320,mid:600,far:false,pad:1.2,lodK:.7,patch:.5});
 pass(14,26,(Z)=>Z.dry*.3,{hero:320,mid:600,far:false,pad:1.5,lodK:.7,patch:.5});
 pass(25,32,(Z)=>Z.dry*.25+Z.crag*.12,{hero:400,mid:750,far:false,pad:2,lodK:.6,patch:.5});
 pass(26,32,(Z)=>Z.dry*.2+Z.crag*.2,{hero:320,mid:680,far:false,pad:1.5,lodK:.7,patch:.5});
 pass(27,22,(Z)=>Z.dry*.45+Z.crag*.35,{hero:320,mid:600,far:false,pad:1,lodK:.8,patch:.45});
 pass(30,30,(Z)=>Z.dry*.18,{hero:320,mid:600,far:false,pad:1.5,lodK:.7,patch:.5});
 // build
 // runtime LOD: a hero tree is drawn in full while the camera is within XANADU.LOD.tree metres of
 // its chunk and as a stand-in impostor past that; a far tree is only ever its impostor
 TREES.forEach((T,i)=>{BIO.owner=[T.x,T.z];
  if(T.lv===0){BIO.range=null;BIO.minRange=0;buildFar(T,i,st,false);st.fars++;}
  else{BIO.range=XANADU.LOD.tree;BIO.minRange=0;B[T.sp](T,st,T.lv);st.heroes++;
   BIO.range=1e9;BIO.minRange=XANADU.LOD.tree;buildFar(T,i,st,true);}
  st.byS[T.sp]++;});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,rings:st.rings,arches:st.arches,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,blooms:st.blooms,pods:st.pods,fins:st.fins,fans:st.fans,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far,small:st.sapTris}};};
XANADU._canopyH=function(x,z){let h=0;for(const T of XANADU.TREES){if(Math.hypot(x-T.x,z-T.z)<60)h=Math.max(h,T.y0+T.H);}return h||10;};
})();
