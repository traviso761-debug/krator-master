// ================================================================= EASTERN BADLANDS — trees
// The seventeen tree-scale species of the eastern badlands, each with its own builder (or a shared
// habit builder with the species' numbers), placed by zone from the host's climate fields. The zones
// are computed HERE from those fields, never from the host's map: a world that binds the same fields
// gets the same zoning. TEMPERATURE (cold) and DRYNESS (wet) lead, as the owner asked: the region
// spans BSh to EF, and two points of one Koppen class can be a sulphur flat and a green wash.
// Beyond the LOD spine a tree becomes an impostor in the 'far' bucket: blobs on a pole, or stacked
// cones for the spires. Every count scales with q; the core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=EBADLANDS.SPECIES,PAL=EBADLANDS.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=EBADLANDS.C;
EBADLANDS.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet (rain, channels, water), flow (a channel's banks), canyon, rim,
// rock, dune, slope, cold (from the mean temperature: 1 at -10 C), upland. Two the world does not bind yet
// are read when a host binds them and are 0 otherwise (BIO.field): geo, the geothermal ground (sulphur
// pools and vents), and barren, ground nothing grows on (the ice cap, the airless rim: EF, O, HF).
// Each weight 0..1:
//   (wet is on the world's scale: its median here is ~.15, a 900 mm Cfa valley ~.5)
//   waste   hot and dry (BSh, the northern basins)            ember crowns, sunspires, needle blooms, yucca
//   vent    geothermal ground (the Danakil-like flats)         stilt pods, needle blooms, ember crowns; chimneys
//   steppe  cool and dry (BSk: sagebrush, pinyon-juniper)      junipers, pinyons, yucca, a bristlecone up high
//   bad     bare banded rock outside the cold                  scattered junipers, sunspires; toadstool rocks
//   vale    warm and wet (Cfa: the green valleys and plateaus) gambel oak, maple, weepers, umbels, ponderosa
//   pine    temperate montane (Dfb)                            ponderosa, aspen groves, gambel oak, pinyon
//   boreal  cold and moist (Dfc)                               spruce, fir, aspen
//   tundra  the treeline and above (ET)                        krummholz spruce, bristlecones; cushions, moss
//   rip     a stream's floor and banks                         cottonwoods, maples, weepers, umbels, aspens up high
//   bench / rim   a canyon's ledges and lip                    pinyon, juniper, maple, yucca
//   cliff   steep bare rock: the layered faces of the canyons, the escarpment and the badland walls. Nothing roots
//           there (the owner, Oct 2026): every zone above is multiplied by 1 - cliff
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),up=F('upland'),can=F('canyon'),rim=F('rim'),rock=F('rock'),dune=F('dune'),slope=F('slope'),cold=F('cold'),geo=F('geo'),barren=F('barren');
 const cliff=smooth(.8,.96,slope)*smooth(.3,.6,rock),live=(1-barren)*(1-cliff),open=(1-can)*(1-dune*.85)*live,gentle=smooth(.6,.28,slope);
 const hot=smooth(.2,.02,cold),tun=smooth(.82,.95,cold),bor=smooth(.5,.66,cold)*smooth(.95,.86,cold);
 const vent=geo*(1-tun)*live;
 return{wet,flow,up,can,rim,rock,dune,slope,cold,geo,barren,hot,cliff,
  vent:vent*(1-cliff),
  waste:open*hot*smooth(.26,.1,wet)*(1-rock*.55)*(1-vent*.8),
  steppe:open*smooth(.03,.2,cold)*smooth(.72,.5,cold)*smooth(.45,.22,wet)*(1-rock*.6),
  bad:open*rock*smooth(.6,.3,cold)*(1-vent*.5),
  vale:open*smooth(.18,.42,wet)*smooth(.55,.3,cold)*gentle*(1-rock*.7)*(1-vent),
  pine:open*smooth(.22,.38,cold)*smooth(.68,.52,cold)*smooth(.14,.3,wet)*(1-rock*.55),
  boreal:open*bor*smooth(.1,.26,wet)*(1-rock*.5),
  tundra:(1-can)*tun*live*(1-rock*.45),
  rip:(can*smooth(.45,.8,wet)+(1-can)*flow*.85)*gentle*live*(1-tun)*(1-vent*.85),
  bench:smooth(.15,.45,can)*smooth(.95,.7,can)*live,
  rimZ:rim*live*(1-tun)};}
EBADLANDS.zones=zones;
// which of two dominants a stand is (pinyon or juniper on the plateaus, spruce or fir in the boreal, gold or green aspen)
EBADLANDS.standOf=(x,z,n,seed)=>BIO.standAt(x,z,n||2,.0024,seed||83);

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:EBADLANDS.BARKTEX.map(t=>texMean(t)),wood:texMean(EBADLANDS.WOODTEX),rock:texMean(EBADLANDS.ROCKTEX),crust:texMean(EBADLANDS.CRUSTTEX)};
 // a library bark's mean is the pack's (an sRGB grey: its linear value per channel)
 const lm=EBADLANDS.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);if(lm.wood!=null)MEAN.wood=lin(lm.wood);
 return MEAN;}
Object.assign(EBADLANDS,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const deadCol=()=>tint(pick(PAL.deadwood),means().wood,rr(.85,1.05));
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
EBADLANDS.leafCol=leafCol;

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
// a point along a polyline at fraction u
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
EBADLANDS.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
// a scatter of blooms in a disc of radius r (one colour per head); o.flat lays them on the ground
function blooms(x,y,z,r,n,set,sz,o){o=o||{};const c=bright(vary(pick(set||PAL.flowers),.03,.1,.08),1.15),tl=o.tilt==null?.5:o.tilt;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(o.s0==null?.3:o.s0,o.s1==null?.55:o.s1);
  BIO.put('bloom',[x+Math.cos(a)*d,y+(o.flat?rr(0,.3):rr(-.3,.4)*r),z+Math.sin(a)*d],qEuler(rr(-tl,tl),rr(0,TAU),rr(-tl,tl)),s,(o.flat||i%4)?c:shade(c,rr(-.1,.2)));}}
EBADLANDS.blooms=blooms;
// a CANYON GRAPE curtain hung from a point: leafy vine ribbons, grape clusters among them (generic_fruit_canyon_grape).
// The floor (grape tangles) and the dressing (vines off a ledge) hang the same curtain.
function hangVine(x,y,z,len,w,st){const n=ri(2,4),a0=rr(0,TAU),lc=leafCol(PAL.grapeLeaf,1.2,.03,.08,.05);
 for(let i=0;i<n;i++){const a=a0+i*GOLD,d=w*rr(.1,.5),L=len*rr(.6,1.05);
  BIO.put('vine',[x+Math.cos(a)*d,y+rr(-.1,.1),z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w*rr(.7,1.1),L,1],bright(lc,rr(.9,1.08)));
  if(rng()<.7){const t=rr(.25,.8),gs=rr(.12,.2);BIO.put('grapes',[x+Math.cos(a)*d*1.2,y-L*t,z+Math.sin(a)*d*1.2],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[gs,gs*rr(1.1,1.5),gs],bright(vary(pick(PAL.grape),.02,.06,.05),1.15));if(st)st.fruit++;}}
 if(st)st.vines++;}
EBADLANDS.hangVine=hangVine;
// the volume the world's inspector names a tree by
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
// a bole as a tube from the ground (crooked, tapering), coloured in bands; returns the points
function bole(T,S,fam,x,z,h,r0,r1,lean,la,wig,n,st,seg,dead){const pts=[];const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,ph=rr(0,TAU);
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*h,ox=Math.cos(la)*lean*h*t*t+Math.cos(ph)*w,oz=Math.sin(la)*lean*h*t*t+Math.sin(ph)*w;
  pts.push({x:x+ox,y:T.y0-.3+(h+.3)*t,z:z+oz,r:mix(r0,r1,Math.pow(t,.8))*(t<.08?1.25:1),col:dead?deadCol():barkCol(S,k)});}
 st.trunk+=BIO.tube(fam,pts,pts[0].col,{seg:seg,cap:true});return pts;}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed} and lv 2 near / 1 mid
const B=[];
// an OPEN PINE: one or a few crooked stems, branches in loose whorls up the crown, needle tufts at their ends
// (pinyon: low, rounded, often multi-stemmed; ponderosa: a long clear orange bole and a short open crown;
// bristlecone: squat, twisted, half its branches dead and silver). cfg: fam, multi (chance of 2-3 stems), cb
// crown base (fraction of H), shape(u) branch length 0..1 up the crown, el elevation, curve, wig, tuftK, dead
function pineTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const nS=cfg.multi&&rng()<cfg.multi?ri(2,3):1,a0=rr(0,TAU),hc=C(pick(S.leaf)),spots=[];let topY=T.y0+H;
 for(let s=0;s<nS;s++){const a=a0+s*TAU/nS,off=nS>1?rb*.6:0,lean=nS>1?rr(.05,.16):rr(0,cfg.lean||.03),hS=H*(s?rr(.7,.92):1)*cfg.stemU;
  const deadStem=cfg.deadStem&&s>0&&rng()<cfg.deadStem;
  const pts=bole(T,S,deadStem?'wood':cfg.fam,T.x+Math.cos(a)*off,T.z+Math.sin(a)*off,hS,rb*(nS>1?.72:1),rb*.22,lean,a,cfg.wig,lv===2?5:3,st,lv===2?7:5,deadStem);
  const step=(lv===2?cfg.step:cfg.step*2.2)*H,cb=cfg.cb*H;
  for(let yy=cb;yy<hS-.4;yy+=step*rr(.8,1.2)){const u=yy/hS,p=along(pts,u),n=lv===2?ri(2,4):ri(1,2),bu=(yy-cb)/Math.max(.1,hS-cb);
   for(let k=0;k<n;k++){const ba=rr(0,TAU),L=R*cfg.shape(bu)*rr(.75,1.15)*(nS>1?.8:1);if(L<.4)continue;
    const el=cfg.el+cfg.elU*bu+rr(-.15,.15),r0=Math.max(.04,p.r*rr(.35,.55)),dead=cfg.dead&&rng()<cfg.dead;
    const bp=treeGrow({x:p.x+Math.cos(ba)*p.r*.6,y:p.y,z:p.z+Math.sin(ba)*p.r*.6},dirOf(ba,el),L,r0,Math.max(.03,r0*.3),3,cfg.curve,cfg.bwig||.1);
    let ok=true;for(let i=1;i<bp.length;i++)if(!clear3(bp[i].x,bp[i].y,bp[i].z,bp[i].r+.8,bp[i].r+.8)){ok=false;break;}if(!ok)continue;
    if(lv===2&&r0>.07)st.limb+=BIO.tube(dead?'wood':cfg.fam,bp,dead?deadCol():barkCol(S,k+1),{seg:r0>.2?5:3,cap:r0>.2});
    else BIO.beam('rod',[bp[0].x,bp[0].y,bp[0].z],[bp[3].x,bp[3].y,bp[3].z],r0*2,r0*.8,rodCol(S.bark[0]));
    st.forks++;
    if(dead)continue;
    spots.push({p:bp[3],s:L*.3,tip:true},{p:bp[2],s:L*.25});
    if(lv===2&&L>R*.45&&rng()<.7){const sa=ba+rr(-1,1),sp2=treeGrow(bp[1],dirOf(sa,el+.3),L*.5,r0*.5,.03,2,cfg.curve,.12);
     BIO.beam('rod',[sp2[0].x,sp2[0].y,sp2[0].z],[sp2[2].x,sp2[2].y,sp2[2].z],r0*.9,.05,rodCol(S.bark[0]));spots.push({p:sp2[2],s:L*.22,tip:true});}}}
  const e=pts[pts.length-1];spots.push({p:{x:e.x,y:e.y+.3,z:e.z},s:R*.3,tip:true});topY=Math.max(topY,e.y+R*.4);}
 const cy=T.y0+H*mix(cfg.cb,1,.55),ey=H*(1-cfg.cb)*.5,sz0=R*cfg.tuftK*(lv===2?1:1.5);let mine=0;
 for(const s of spots){const n=lv===2?(s.tip?2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.45*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.1,.35)*s.s;
   clumpAt(cfg.item||'needle',x,y,z,sz0*rr(.85,1.2),cfg.flat||.7,hc,T.x,cy,T.z,R,ey);st.clumps++;mine++;}
  if(cfg.cones&&lv===2&&s.tip&&rng()<cfg.cones){if(cfg.coneCol){const r=rr(.07,.1);BIO.put('fruit',[s.p.x,s.p.y-.08,s.p.z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[r*1.15,r,r*1.15],bright(vary(cfg.coneCol,.02,.06,.06),.9));st.fruit++;}
   else BIO.put('cone',[s.p.x,s.p.y-.15,s.p.z],qEuler(Math.PI+rr(-.4,.4),rr(0,TAU),0),[.18,.32,.18],C(0x7a5a3a));}}
 if(!mine){clumpAt(cfg.item||'needle',T.x,T.y0+H*.8,T.z,sz0,.7,hc,T.x,cy,T.z,R,ey);st.clumps++;}
 regTree(T,S,R*1.15,topY-T.y0+1);}
B[0]=function(T,st,lv){pineTree(T,st,lv,{fam:'bark0',multi:.35,stemU:.95,cb:.12,step:.09,el:.55,elU:.35,curve:.05,wig:.12,bwig:.14,tuftK:.42,flat:.6,cones:.35,coneCol:0x8a5a34,
 shape:u=>.35+.65*Math.pow(Math.sin(clamp(u*1.05+.08,0,1)*Math.PI),.6)});};
B[2]=function(T,st,lv){pineTree(T,st,lv,{fam:'bark1',multi:0,stemU:1,cb:rr(.45,.6),step:.045,el:-.05,elU:.45,curve:.12,wig:.03,bwig:.08,tuftK:.36,flat:.75,cones:.1,
 shape:u=>.25+.75*Math.pow(1-u,.6)*smooth(0,.25,u+.1)});};
B[6]=function(T,st,lv){pineTree(T,st,lv,{fam:'bark4',multi:.3,deadStem:.6,stemU:.85,cb:.18,step:.12,el:.25,elU:.4,curve:.08,wig:.28,bwig:.22,tuftK:.38,flat:.55,dead:.45,lean:.12,
 shape:u=>.4+.6*Math.sin(clamp(u,0,1)*Math.PI)});
 // strip bark: a band of living brown up the silver bole
 if(lv===2){const S=SP[6];for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),yy=rr(.3,T.H*.5);BIO.put('lichen',[T.x+Math.cos(a)*T.rb*1.02,T.y0+yy,T.z+Math.sin(a)*T.rb*1.02],qUp([Math.cos(a),0,Math.sin(a)]),rr(.3,.6),leafCol(PAL.lichen,1.1,.02));}}};

// a SPIRE (spruce, fir): a straight bole, whorls of drooping sprays to the top, narrowing as a cone; a leader.
// Under the treeline (T.H < 4.5, the size hook's krummholz) it is a flag tree: a mat at the foot and sprays only
// on its lee side, the windward side scoured bare.
function spireTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,hc=C(pick(S.leaf)),fam='bark3';
 const krum=H<4.5,lee=rr(-.3,.3);
 const rings=[],n=6;for(let k=0;k<=n;k++){const u=k/n;rings.push({x:T.x,y:T.y0-.3+(H*.97+.3)*u,z:T.z,r:Math.max(.04,rb*(1-.9*u)*(u<.06?1.3:1)),yy:u*H,col:barkCol(S,k)});}
 rings.push({x:T.x,y:T.y0+H,z:T.z,r:.02,yy:H,col:barkCol(S,0)});
 st.trunk+=BIO.lathe(fam,rings,lv===2?6:5,1,4,(Rg)=>Rg.r,null);
 const cb=H*(krum?.05:cfg.cb*rr(.6,1.4)),step=krum?.35:(lv===2?cfg.step:cfg.step*2.4),top=T.y0+H;
 // the full branch (a twig and its sprays) only where a camera can come close: within 240 m of the LOD spine
 const rich=lv===2&&(EBADLANDS.RICH_ALL||BIO.lodD(T.x,T.z)<240);   // a variant host grows every hero rich (RICH_ALL)
 for(let y=T.y0+cb;y<top-.5;y+=step*rr(.85,1.15)){const u=(y-T.y0-cb)/Math.max(.5,H-cb),L=(R*cfg.widthK*Math.pow(1-u,cfg.pow)+.35)*rr(.85,1.12),nn=lv===2?ri(cfg.n[0],cfg.n[1]):cfg.n[0]-1;
  const a0=rr(0,TAU);
  for(let k=0;k<nn;k++){const a=a0+k/nn*TAU+rr(-.25,.25);
   if(krum&&Math.cos(a-lee)<-.1&&u>.25)continue;                 // the windward side of a flag tree is bare
   const Lk=krum?L*(1+.6*Math.max(0,Math.cos(a-lee))):L,col=bright(vary(hc,.02,.06,.05),rr(1.0,1.25)*mix(.82,1.05,u));
   if(rich&&Lk>1.2){
    // the BRANCH: a twig sagging out from the trunk and turning up at its end, the sprays hung along it fanning
    // out to both sides, the longest near the trunk, a leader spray at the tip
    const bx=Math.cos(a),bz=Math.sin(a),sag=Lk*cfg.sag*(1-u*.7),ox=T.x+bx*rb*.4,oz=T.z+bz*rb*.4;
    const P=[0,.5,1].map(t=>({x:mix(ox,T.x+bx*Lk,t),y:y-sag*Math.sin(t*Math.PI*.8)+t*t*Lk*cfg.upturn,z:mix(oz,T.z+bz*Lk,t)}));
    BIO.beam('twig',[P[0].x,P[0].y,P[0].z],[P[2].x,P[2].y,P[2].z],.08*(1-u*.5),.03,cfg.twig);
    const m=Math.max(1,Math.min(4,Math.round(Lk/1.05)));
    for(let j=0;j<m;j++){const t=(j+.7)/(m+.4),q=t<.5?P[0]:P[1],r2=t<.5?P[1]:P[2],f=t<.5?t*2:t*2-1,sl=mix(1.55,.85,t)*rr(.85,1.15);
     const px=mix(q.x,r2.x,f),py=mix(q.y,r2.y,f),pz=mix(q.z,r2.z,f);
     for(let sd=-1;sd<=1;sd+=2)frondAt('spray',px,py,pz,a+sd*rr(.55,.95),sl,cfg.pitch-.15+rr(-.15,.15),bright(col,rr(.92,1.06)),cfg.wid*.8);st.clumps+=2;}
    frondAt('spray',P[2].x,P[2].y,P[2].z,a,mix(1.2,.8,u),cfg.pitch+.25,bright(col,1.08),cfg.wid*.8);st.clumps++;}
   else{frondAt('spray',T.x+Math.cos(a)*rb*.3,y,T.z+Math.sin(a)*rb*.3,a,Lk,cfg.pitch+rr(-.12,.12)+u*cfg.pitchU,col,cfg.wid);st.clumps++;}}}
 BIO.put('cone',[T.x,top-.6,T.z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[.35,1.6,.35],bright(vary(hc,.02,.05,.04),1.1));
 // the crown's dark core: a cone inside the sprays, so the gaps between whorls show shadowed foliage, not the sky
 if(!krum){const cw=R*cfg.widthK*(lv===2?.38:1.3);BIO.put('cone',[T.x,T.y0+cb+(lv===2?H*.1:0),T.z],qEuler(0,rr(0,TAU),0),[cw,(H-cb)*.9,cw],bright(vary(hc,.02,.05,.04),lv===2?.38:.7));}
 if(krum)BIO.put('lobe',[T.x+Math.cos(lee)*R*.3,T.y0-.1,T.z+Math.sin(lee)*R*.3],qEuler(0,rr(0,TAU),0),[R*1.1,.9,R*1.1],bright(vary(hc,.02,.06,.05),.75));   // the skirt mat
 if(lv===2&&cfg.cones&&!krum)for(let k=0,m=ri(3,8);k<m;k++){const u=rr(.7,.95),a=rr(0,TAU),d=R*(1-u)*cfg.widthK*rr(.4,.9);
  BIO.put('cone',[T.x+Math.cos(a)*d,T.y0+H*u,T.z+Math.sin(a)*d],qEuler(cfg.cones>0?Math.PI:0,0,0),[.14,.3,.14],C(cfg.coneCol));}
 regTree(T,S,R*cfg.widthK+.5,H+.5);}
B[3]=function(T,st,lv){spireTree(T,st,lv,{cb:.06,step:.95,widthK:1,pow:.9,n:[5,7],pitch:-.22,pitchU:.25,wid:1.6,cones:1,coneCol:0x8a5a3a,sag:.32,upturn:.12,twig:0x4a3a2e});};
B[4]=function(T,st,lv){spireTree(T,st,lv,{cb:.04,step:.85,widthK:.85,pow:1.1,n:[4,6],pitch:-.05,pitchU:.2,wid:1.5,cones:-1,coneCol:0x4a3a5a,sag:.12,upturn:.18,twig:0x5a5450});};

// a BROADLEAF: one or several stems, limbs from the fork, secondaries, leaf clumps on the skeleton
// (cottonwood: broad and open; aspen: a straight white bole and a narrow crown; gambel oak: a thicket of
// thin stems; maple: a rounded small tree; juniper: twisted shaggy stems and dense scale foliage).
// cfg: fam, item, stems [a,b], forkU, limbs [a,b], el, limbK, sec, curve, wig, tuftK, flat
function decTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const nS=ri(cfg.stems[0],cfg.stems[1]),a0=rr(0,TAU),hc=cfg.col?cfg.col(T):C(pick(S.leaf)),spots=[];let reach=R*.6,topY=T.y0+H*.8;
 for(let s=0;s<nS;s++){const a=a0+s*TAU/nS+rr(-.3,.3),off=nS>1?rb*rr(.5,1.2):0,lean=nS>1?rr(.06,.2):rr(0,cfg.lean||.04),fh=H*cfg.forkU*(s?rr(.75,1):1);
  const pts=bole(T,S,cfg.fam,T.x+Math.cos(a)*off,T.z+Math.sin(a)*off,fh,rb*(nS>1?.7:1),rb*(nS>1?.45:.6),lean,a,cfg.wig,lv===2?4:2,st,lv===2?(rb>.3?7:5):4,false);
  const top=pts[pts.length-1],nL=lv===2?ri(cfg.limbs[0],cfg.limbs[1]):Math.max(2,cfg.limbs[0]-1),la0=rr(0,TAU);
  for(let k=0;k<nL;k++){const la=la0+k*GOLD+rr(-.3,.3),el=cfg.el*rr(.8,1.2),L=(H-fh)*cfg.limbK*rr(.8,1.15)/(nS>1?1.15:1),r0=top.r*rr(.55,.75);
   const o=k<2?top:along(pts,rr(.75,.98)),lp=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(la,el),L,r0,Math.max(.04,r0*.35),3,cfg.curve,cfg.wig);
   let ok=true;for(let i=1;i<lp.length;i++)if(!clear3(lp[i].x,lp[i].y,lp[i].z,lp[i].r+1,lp[i].r+1)){ok=false;break;}if(!ok)continue;
   if(lv===2||r0>.3)st.limb+=BIO.tube(cfg.fam,lp,barkCol(S,k+2),{seg:r0>.25?5:4,cap:r0>.25});else{BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[2].x,lp[2].y,lp[2].z],r0*2,r0*1.3,rodCol(S.bark[0]));BIO.beam('rod',[lp[2].x,lp[2].y,lp[2].z],[lp[3].x,lp[3].y,lp[3].z],r0*1.3,r0*.7,rodCol(S.bark[0]));}st.forks++;
   spots.push({p:lp[3],s:L*.3,tip:true},{p:lp[2],s:L*.25});
   const nSec=lv===2?cfg.sec:0;
   for(let q=0;q<nSec;q++){const p=lp[ri(1,2)],a2=la+rr(-1.3,1.3),el2=el+rr(-.3,.5),L2=L*rr(.4,.65);
    const sp2=treeGrow({x:p.x,y:p.y,z:p.z},dirOf(a2,el2),L2,Math.max(.03,p.r*.55),.03,2,cfg.curve,.12);
    if(lv===2&&sp2[0].r>.06)st.limb+=BIO.tube(cfg.fam,sp2,barkCol(S,q),{seg:3});else BIO.beam('rod',[sp2[0].x,sp2[0].y,sp2[0].z],[sp2[2].x,sp2[2].y,sp2[2].z],sp2[0].r*2,.05,rodCol(S.bark[0]));
    spots.push({p:sp2[2],s:L2*.4,tip:true},{p:sp2[1],s:L2*.3});}
   reach=Math.max(reach,Math.hypot(lp[3].x-T.x,lp[3].z-T.z)+L*.3);topY=Math.max(topY,lp[3].y+R*cfg.tuftK);}
  spots.push({p:{x:top.x,y:top.y+R*.15,z:top.z},s:R*.3,tip:true});}
 const cy=T.y0+H*mix(cfg.forkU,1,.5),ey=H*(1-cfg.forkU)*.55,sz0=R*cfg.tuftK*(lv===2?1:1.5);let mine=0;
 for(const s of spots){const n=lv===2?(s.tip?cfg.nC||2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.15,.4)*s.s;
   if(!clear3(x,y,z,sz0*.4,sz0*.3))continue;
   clumpAt(cfg.item,x,y,z,sz0*rr(.85,1.2),cfg.flat,cfg.mixCol&&rng()<cfg.mixCol[0]?C(pick(cfg.mixCol[1])):hc,T.x,cy,T.z,R,ey);st.clumps++;mine++;}
  if(cfg.berry&&lv===2&&s.tip&&rng()<cfg.berry)blooms(s.p.x,s.p.y,s.p.z,s.s*.4,ri(2,4),PAL.berry,[.12,.2],{tilt:.8});
  if(cfg.fruit&&lv===2&&s.tip&&rng()<cfg.fruit.p){const F=cfg.fruit;for(let i=0,n=ri(1,3);i<n;i++){const a=rr(0,TAU),d=s.s*rr(.1,.35),r=rr(F.s[0],F.s[1]);
   BIO.put('fruit',[s.p.x+Math.cos(a)*d,s.p.y-rr(.05,.3),s.p.z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),0),[r,r*F.long,r],bright(vary(pick(F.col),.02,.06,.05),1.05));st.fruit++;}}}
 // CANYON GRAPE: a vine climbs the tree and hangs off its lower limbs in curtains, dark clusters among the leaves
 if(cfg.grape&&lv===2&&rng()<cfg.grape){const L=spots.filter(q=>q.tip&&q.p.y<T.y0+H*.75);for(let i=0,n=Math.min(L.length,ri(3,7));i<n;i++){const q=L[ri(0,L.length-1)].p;
  const len=Math.max(1.5,(q.y-T.y0)*rr(.35,.75));hangVine(q.x,q.y,q.z,len,rr(1,1.8),st);}}
 if(!mine){clumpAt(cfg.item,T.x,T.y0+H*.8,T.z,sz0,cfg.flat,hc,T.x,cy,T.z,R,ey);st.clumps++;}
 regTree(T,S,reach,topY-T.y0+1);}
// is this aspen grove gold (a clonal stand turns together): by the grove's field where the tree stands, by its seed in a nursery
const aspenGold=T=>(T.x||T.z)?EBADLANDS.standOf(T.x,T.z,3,97)===0:T.seed%3===0;
B[1]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'scale',stems:[2,4],forkU:.3,limbs:[3,5],el:.75,limbK:.75,sec:2,curve:-.05,wig:.22,tuftK:.42,flat:.65,berry:.25});};
B[5]=function(T,st,lv){decTree(T,st,lv,{fam:'bark2',item:'round',stems:[1,1],forkU:rr(.55,.68),limbs:[4,6],el:1.05,limbK:.55,sec:1,curve:.02,wig:.04,tuftK:.36,flat:.85,
 col:T=>C(pick(aspenGold(T)?SP[5].gold:SP[5].leaf)),mixCol:[.15,PAL.aspenGold]});};
B[7]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'round',stems:[1,2],forkU:rr(.28,.38),limbs:[4,6],el:.62,limbK:1.0,sec:3,curve:-.04,wig:.1,tuftK:.4,grape:.35,flat:.7,nC:3,mixCol:[.08,PAL.cottonGold]});};
B[8]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'lobed',stems:[2,5],forkU:.38,limbs:[2,4],el:.8,limbK:.7,sec:1,curve:-.02,wig:.14,tuftK:.48,flat:.7,
 fruit:{p:.22,s:[.04,.055],long:1.35,col:PAL.acorn}});};   // acorns: generic_fruit_mast
B[9]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'lobed',stems:[1,3],forkU:.32,limbs:[3,5],el:.8,limbK:.8,sec:2,curve:-.03,wig:.1,tuftK:.42,flat:.75,grape:.2,mixCol:[.25,PAL.mapleGreen]});};

// 10 the chaparral yucca: a ball of blue-grey daggers; a flowering one sends up a cream spike three times its height
B[10]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,hc=vary(pick(S.leaf),.02,.08,.05);
 BIO.put('rosette',[T.x,T.y0-.1,T.z],qEuler(0,rr(0,TAU),0),[R,R*.95,R],bright(hc,1.25));
 if(rng()<.6){const top=T.y0+H,lean=[rr(-.3,.3),rr(-.3,.3)];BIO.beam('rod',[T.x,T.y0+R*.6,T.z],[T.x+lean[0],top,T.z+lean[1]],T.rb*2,T.rb*.7,rodCol(0x7a8a5a,-.1));
  const seeding=rng()<.35;   // past flowering: green capsules where the blossoms were (generic_fruit_yucca)
  for(let k=0,n=lv===2?ri(9,15):4;k<n;k++){const u=rr(.42,1),y=mix(T.y0+R*.6,top,u),px=T.x+lean[0]*u+rr(-.15,.15),pz=T.z+lean[1]*u+rr(-.15,.15);
   if(seeding){if(u<.85){BIO.put('fruit',[px,y,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[.07,.13,.07],leafCol(PAL.yuccaPod,1.1,.02,.06,.05));st.fruit++;}}
   else BIO.put('plume',[px,y,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[mix(.9,.45,u),mix(1.1,.7,u),mix(.9,.45,u)],leafCol(PAL.cream,1.15,.01,.04,.04),{n:[0,1,0]});}
  st.spikes++;}
 regTree(T,S,R,Math.max(H,R));};
// 11 the ember crown: a bottle of glossy teal pods stacked round its axis, branches fanning from the top,
// every tip a pompom of orange flame-spikes (alienflora 1)
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,bH=H*rr(.55,.66);
 const rAt=u=>rb*(.85+.55*Math.sin(clamp(u*1.1,0,1)*Math.PI*.9))*(1-u*.35);
 // a core lathe so no daylight shows through the pods
 const rings=[];for(let u=0;u<=1.001;u+=.25)rings.push({x:T.x,y:T.y0-.2+bH*u,z:T.z,r:rAt(u)*.62,yy:u*bH,col:barkCol(S,ri(0,2))});
 st.trunk+=BIO.lathe('bark5',rings,lv===2?8:6,1,3,R2=>R2.r,null);
 const rows=lv===2?Math.round(bH/(rb*.6)):Math.round(bH/(rb*1.5));
 for(let i=0;i<rows;i++){const u=(i+.5)/rows,y=T.y0+bH*u-rb*.4,r=rAt(u),n=Math.max(4,Math.round(TAU*r/(rb*(lv===2?.6:1.3)))),a0=i*.4+rr(0,.3);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,h=rb*rr(.9,1.25)*(lv===2?1:1.7),w=rb*rr(.55,.75)*(lv===2?1:1.7);
   BIO.put('gem',[T.x+Math.cos(a)*r*.62,y,T.z+Math.sin(a)*r*.62],qEuler(Math.sin(a)*.25,rr(0,TAU),-Math.cos(a)*.25),[w,h,w],EBADLANDS.LIB.gem?bright(vary(0xd8ece8,.02,.06,.06),rr(1.0,1.25)):bright(vary(pick(PAL.emberPod),.02,.08,.07),rr(1.0,1.35)));st.pods++;}}
 const top={x:T.x,y:T.y0+bH,z:T.z},nB=lv===2?ri(7,11):5,hc=pick(S.leaf);
 for(let k=0;k<nB;k++){const a=k*GOLD+rr(-.2,.2),el=rr(.35,1.0),L=R*rr(.6,1.0),bp=treeGrow({x:top.x,y:top.y,z:top.z},dirOf(a,el),L,rb*.2,.06,3,.1,.08);
  st.limb+=BIO.tube('bark5',bp,barkCol(S,1),{seg:4,cap:true});
  for(const p of [bp[3],bp[2]]){clumpAt('flame',p.x,p.y+.3,p.z,R*rr(.42,.6)*(lv===2?1:1.3),.8,bright(vary(hc,.03,.08,.05),1.25),T.x,T.y0+H*.85,T.z,R,H*.2);st.clumps++;if(lv<2)break;}}
 clumpAt('flame',top.x,top.y+R*.35,top.z,R*.6,.8,bright(C(pick(S.leaf)),1.25),T.x,T.y0+H*.85,T.z,R,H*.2);st.clumps++;
 regTree(T,S,R*1.05,H+1);};
// 12 the sunspire: a vast pale bottle, a few thick arms forking once, a black urchin with gold tips at every end (alienflora 1b)
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,bH=H*rr(.5,.6);
 const rAt=u=>rb*(1.05+.35*Math.sin(clamp(u*1.2,0,1)*Math.PI)-.55*u*u);
 const rings=[];for(let u=0;u<=1.001;u+=.1)rings.push({x:T.x,y:T.y0-.3+bH*u,z:T.z,r:Math.max(.15,rAt(u)),yy:u*bH,col:barkCol(S,Math.floor(u*3))});
 rings.push({x:T.x,y:T.y0+bH+.4,z:T.z,r:.1,yy:bH+.4,col:barkCol(S,0)});
 const ph=rr(0,TAU);st.trunk+=BIO.lathe('bark5',rings,lv===2?12:8,Math.max(1,Math.round(TAU*rb/3)),4,(Rg,a)=>Rg.r*(1+.035*Math.sin(9*a+ph)+.02*Math.sin(4*a+Rg.yy)),null);
 const nA=lv===2?ri(5,8):4,a0=rr(0,TAU),top={x:T.x,y:T.y0+bH,z:T.z},tips=[];
 for(let k=0;k<nA;k++){const a=a0+k*GOLD,el=rr(.5,1.0),L=(H-bH)*rr(.75,1.05),r0=rb*rr(.18,.26);
  const bp=treeGrow({x:T.x+Math.cos(a)*rAt(.95)*.5,y:T.y0+bH*rr(.88,.98),z:T.z+Math.sin(a)*rAt(.95)*.5},dirOf(a,el),L,r0,r0*.45,3,.12,.06);
  st.limb+=BIO.tube('bark5',bp,barkCol(S,2),{seg:lv===2?6:4,cap:true});st.forks++;
  if(lv===2&&rng()<.7){for(let q=-1;q<=1;q+=2){const sp2=treeGrow(bp[2],dirOf(a+q*rr(.4,.7),el+.25),L*.45,r0*.4,r0*.25,2,.06,.05);st.limb+=BIO.tube('bark5',sp2,barkCol(S,1),{seg:4,cap:true});tips.push(sp2[2]);}}
  else tips.push(bp[3]);}
 let reach=R*.5,topY=T.y0+H;
 for(const p of tips){const s=R*rr(.18,.26);BIO.put('urchin',[p.x,p.y+s*.5,p.z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),s,bright(vary(pick(PAL.sunBall),.02,.08,.05),1.3));st.clumps++;
  reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+s);topY=Math.max(topY,p.y+s*1.5);}
 // registered by the heads' real reach (a forked arm carries its head past crownR), or the probe finds an empty volume
 regTree(T,S,reach,topY-T.y0+1);};
// 13 the needle bloom (alienflora 12): one to four slender jointed stalks rising from a rosette of dark strap leaves, each
// crowned by a dense urchin of fine magenta needles with pale tips round a round teal eye; a bud or two on the taller stalks
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,n=lv===2?ri(1,4):1,a0=rr(0,TAU);let reach=1;
 if(lv===2)for(let k=0,m=ri(5,8);k<m;k++){const a=a0+k/m*TAU+rr(-.2,.2);BIO.put('reed',[T.x+Math.cos(a)*.15,T.y0-.05,T.z+Math.sin(a)*.15],qEuler(Math.sin(a)*.5,rr(0,TAU),-Math.cos(a)*.5),[rr(.5,.8),rr(.7,1.2),rr(.5,.8)],leafCol(PAL.needleStalk,.95,.02,.06,.05));}
 for(let k=0;k<n;k++){const a=a0+k*GOLD,d=k?rr(.25,.8):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=H*(k?rr(.5,.85):1),la=rr(0,TAU),lean=rr(.03,.09)*h;
  const P=[0,.36,.7,1].map(t=>[x+Math.cos(la)*lean*t*t,T.y0-.1+(h+.1)*t,z+Math.sin(la)*lean*t*t]),sc=rodCol(pick(PAL.needleStalk),-.12);
  for(let j=0;j<3;j++){const r0=mix(.06,.03,j/3),r1=mix(.06,.03,(j+1)/3);BIO.beam('rod',P[j],P[j+1],r0,r1,sc);
   if(lv===2&&j<2)BIO.put('fruit',P[j+1],null,[r1*.75,r1*1.1,r1*.75],shade(C(sc),-.15));}   // a node at each joint
  const top=P[3],s=T.crownR*rr(.5,.65)*(h/H*.6+.4),ec=bright(vary(pick(PAL.teal),.02,.06,.05),1.4);
  BIO.put('needlehead',[top[0],top[1]+s*.55,top[2]],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),s,bright(C(0xffffff).lerp(C(pick(S.leaf)),.2),rr(1,1.15)));
  BIO.put('fruit',[top[0],top[1]+s*.55,top[2]],null,s*.2,ec);                     // the teal eye
  if(lv===2&&h>H*.6&&rng()<.6){const t=rr(.45,.65),bp=[mix(P[1][0],P[2][0],t),mix(P[1][1],P[2][1],t),mix(P[1][2],P[2][2],t)],ba=rr(0,TAU),bs=s*rr(.25,.35);
   const bt=[bp[0]+Math.cos(ba)*.35,bp[1]+.3,bp[2]+Math.sin(ba)*.35];BIO.beam('rod',bp,bt,.035,.025,sc);
   BIO.put('needlehead',[bt[0],bt[1]+bs*.4,bt[2]],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),bs,bright(C(0xffffff).lerp(C(pick(S.leaf)),.35),.95));}
  reach=Math.max(reach,d+s);st.clumps++;}
 regTree(T,S,reach+.5,H+T.crownR);};
// 14 the rose weeper: a leaning curved trunk, arching limbs, curtains of pink feathery strands (alien.jpg)
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU);
 const pts=bole(T,S,'bark5',T.x,T.z,H*rr(.55,.7),rb,rb*.5,rr(.15,.3),la,.12,lv===2?5:3,st,lv===2?7:5,false),top=pts[pts.length-1];
 const nL=lv===2?ri(5,8):4,hc=pick(S.leaf);let reach=Math.hypot(top.x-T.x,top.z-T.z)+R*.5;
 for(let k=0;k<nL;k++){const a=la+k*GOLD+rr(-.3,.3),L=R*rr(.65,1.0),lp=treeGrow({x:top.x,y:top.y,z:top.z},dirOf(a,rr(.5,.9)),L,top.r*.6,.05,4,-.55,.1);
  st.limb+=BIO.tube('bark5',lp,barkCol(S,k),{seg:4,cap:true});st.forks++;
  const nH=lv===2?7:3;for(let q=0;q<nH;q++){const p=along(lp,rr(.35,1)),hl=Math.max(1.2,(p.y-T.y0)*rr(.45,.8));
   BIO.put('weep',[p.x,p.y+.2,p.z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[rr(1.1,1.8),hl,1],bright(vary(hc,.03,.08,.06),1.2));st.clumps++;}
  clumpAt('round',lp[2].x,lp[2].y+.4,lp[2].z,R*.4,.6,bright(vary(hc,.03,.08,.06),1.1),T.x,top.y,T.z,R,H*.3);
  reach=Math.max(reach,Math.hypot(lp[4].x-T.x,lp[4].z-T.z)+1);}
 regTree(T,S,reach,H+1);};
// 15 the giant umbel: a hollow green stalk, an umbrella of rays, an umbellet of white flowers on each, huge leaves at the foot (alien4)
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,sc=rodCol(pick(PAL.umbelStalk),-.05),lean=[rr(-.25,.25),rr(-.25,.25)];
 const top=[T.x+lean[0],T.y0+H,T.z+lean[1]];BIO.beam('rod',[T.x,T.y0-.2,T.z],top,T.rb*2,T.rb*1.4,sc);
 const seed=rng()<.33,nR=lv===2?ri(14,22):8,fc=seed?leafCol([0xb8a070,0xa89060,0xc0a878],1.1,.01,.04,.04):leafCol(S.leaf,1.25,.01,.03,.03);if(seed)st.fruit++;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.1,.1),el=rr(.25,.75),L=R*rr(.8,1.05),e=[top[0]+Math.cos(a)*Math.cos(el)*L,top[1]+Math.sin(el)*L*.6,top[2]+Math.sin(a)*Math.cos(el)*L];
  if(lv===2)BIO.beam('rod',top,e,.05,.03,sc);
  BIO.put('plume',[e[0],e[1]+.1,e[2]],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R*.32,R*.16,R*.32],fc,{n:[0,1,0]});st.blooms++;}
 if(lv===2)for(let k=0,m=ri(4,7);k<m;k++){const a=rr(0,TAU);BIO.put('fern',[T.x,T.y0+rr(.2,.8),T.z],qEuler(rr(-.1,.1),-a,rr(.1,.4)),[H*rr(.32,.45),H*.25,H*rr(.3,.4)],leafCol(PAL.umbelLeaf,1.25,.02));}
 regTree(T,S,R+.5,H+R*.6);};
// 16 the stilt pod: arched stilt roots meeting at a hub, a stem to a big scaled pod, teal tendrils hanging from it (alien2)
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,hub={x:T.x,y:T.y0+H*rr(.28,.38),z:T.z},nR=lv===2?ri(5,8):4,a0=rr(0,TAU);
 for(let k=0;k<nR;k++){const a=a0+k/nR*TAU+rr(-.2,.2),d=R*rr(.7,1.1),fx=T.x+Math.cos(a)*d,fz=T.z+Math.sin(a)*d,fy=BIO.terrainH(fx,fz)-.3,pts=[];
  for(let i=0;i<=5;i++){const t=i/5;pts.push({x:mix(hub.x,fx,t),y:mix(hub.y,fy,t)+Math.sin(t*Math.PI)*H*.12,z:mix(hub.z,fz,t),r:mix(rb*.45,rb*.3,t)});}
  st.limb+=BIO.tube('bark5',pts,barkCol(S,k),{seg:lv===2?5:4,cap:true});}
 const ph=H*rr(.78,.86),stem=treeGrow({x:hub.x,y:hub.y,z:hub.z},[rr(-.08,.08),1,rr(-.08,.08)],ph-(hub.y-T.y0),rb*.55,rb*.4,3,0,.05);
 st.trunk+=BIO.tube('bark5',stem,barkCol(S,1),{seg:lv===2?6:4});
 const e=stem[3],pw=R*rr(.55,.75),phH=H-ph+.6;
 BIO.put('podhead',[e.x,e.y-.3,e.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[pw,phH,pw],bright(vary(pick(S.leaf),.02,.08,.05),1.25));st.pods++;
 const nT=lv===2?ri(5,9):3;for(let k=0;k<nT;k++){const a=rr(0,TAU),r=pw*.4;BIO.put('tendril',[e.x+Math.cos(a)*r,e.y+phH*.15,e.z+Math.sin(a)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[.35,rr(1.2,2.6),1],leafCol(PAL.tendril,1.3,.02));}
 if(lv===2)for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);BIO.put('tendril',[e.x+Math.cos(a)*pw*.3,e.y+phH*.95,e.z+Math.sin(a)*pw*.3],qEuler(Math.PI+rr(-.4,.4),rr(0,TAU),0),[.3,rr(.8,1.6),1],leafCol(PAL.tendril,1.3,.02));}
 regTree(T,S,R*1.15,H+1);};

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe); far.cone: n stacked cones for a spire,
// widest at the foot of the crown, the bole showing under it.
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const cheap=BIO.lodD(T.x,T.z)>BIO.LOD().far;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z);
 const F=S.far||{poleU:.35},bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
 if(F.cone){const lc=bright(S.leaf[fi%S.leaf.length],.95).convertSRGBToLinear(),R=T.crownR*(F.narrow||1),n=cheap?2:F.cone,seg=cheap?5:7;
  // the bole: a thin dark post under the crown
  const ring=(y,r,c)=>{const o=[];for(let s=0;s<seg;s++){const a=s/seg*TAU+fi;o.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),.35,Math.sin(a),c.r,c.g,c.b]);}return o;};
  const tri=(a,b,c)=>{vtx(...a);vtx(...b);vtx(...c);tris++;};
  const base=T.y0+T.H*.05,P0=ring(T.y0-.3,T.rb,bc),P1=ring(base+.5,T.rb*.7,bc);
  for(let s=0;s<seg;s++){const s1=(s+1)%seg;tri(P0[s],P1[s1],P1[s]);tri(P0[s],P0[s1],P1[s1]);}
  for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,y0=base+(T.H-T.H*.05)*u0*.82,y1=base+(T.H-T.H*.05)*Math.min(1,u1*1.05+.05),r0=R*Math.pow(1-u0*.85,.9),sh=.75+.25*u0;
   const c=new T3.Color(lc.r*sh,lc.g*sh,lc.b*sh),Rg=ring(y0,r0,c),tip=[T.x,y1,T.z,0,1,0,lc.r,lc.g,lc.b];
   for(let s=0;s<seg;s++){const s1=(s+1)%seg;tri(Rg[s],tip,Rg[s1]);tri(Rg[s],Rg[s1],[T.x,y0+.2,T.z,0,-1,0,c.r*.7,c.g*.7,c.b*.7]);}}
  for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;return;}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=cheap?4:6,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.3,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const o=b[5]||{};if(o.rich&&cheap)return;
  const y=o.yOf==='R'?T.y0+R*b[0]:T.y0+T.H*b[0],rx=o.rxOf==='rb'?T.rb*b[1]:R*b[1],ry=o.ryOf==='R'?R*b[2]:T.H*b[2],off=o.off?R*o.off:0;
  blob(T.x+Math.cos(a0)*off,y,T.z+Math.sin(a0)*off,rx,ry,colOf(b[3]),colOf(b[4]),fi+(o.rich?3:bi));});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
// the builders, checked against the species table before anything is placed (a missing one would throw
// halfway through the forest and the floor would never run: SKILL.md 1b)
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('ebadlands: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,forks:0,clumps:0,blooms:0,pods:0,spikes:0,fruit:0,vines:0,heroes:0,fars:0,byS:SP.map(()=>0)});
// opt.records (biomes/WORLD.md, level-free records): place every tree and build none; T.lv is left unset. A host that
// draws the trees as variants (grown with make/grow) picks each record's level itself, by the camera.
EBADLANDS.buildTrees=function(R,q,opt){const recOnly=!!(opt&&opt.records);
 reseed(550031);q=q==null?1:q;R=R||3000;means();
 const st=newStats();
 const TREES=EBADLANDS.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD(),WATER=BIO.window('water');
 // one species pass: a jittered grid over the whole disc, the zone weight as acceptance; past the hero
 // radius a tree is a mid-range one, past the mid radius an impostor (or, for a species with none, nothing)
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=EBADLANDS.make(sp,x,y,z);
    if(opt.size)opt.size(T,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(recOnly)delete T.lv;else if(T.lv===0&&!S.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2,box:opt.water?WATER:null});
  return n;}
 EBADLANDS.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(!recOnly){if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}}st.byS[T.sp]++;});
 EBADLANDS.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,spikes:st.spikes,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
EBADLANDS._canopyH=function(x,z){let h=0;for(const T of EBADLANDS.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
// the nearest built hero of a species to a point (a world's camera or a placement pass may want one)
EBADLANDS.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of EBADLANDS.TREES){if(T.sp!==sp||(T.lv!=null&&T.lv<2)||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// opt: pad keep-clear, patch/patchScale the stand patchiness, small the smaller LOD radii, lodK thinning with
// distance, water only in the host's water window, size(T,Z) a hook that sizes a tree from the zones
const stand=(x,z,s)=>EBADLANDS.standOf(x,z,2,s);
EBADLANDS.PASSES=[
 // the boreal forest first (the tallest stands claim their ground): spruce and fir in stands; spruce shrinks to
 // krummholz flag trees as the cold reaches the treeline
 {sp:3,cell:16,accept:(Z,x,z)=>(Z.boreal*.75+Z.pine*.1*smooth(.45,.62,Z.cold)+Z.rip*smooth(.45,.65,Z.cold)*.4)*(stand(x,z,61)===0?1:.45)+Z.tundra*.3*smooth(.995,.9,Z.cold),
  opt:{pad:1.5,patch:.35,patchScale:.008,size:(T,Z)=>{const k=smooth(.84,.97,Z.cold);if(k>0){T.H=lerp(T.H,rr(1.2,3.6),k);T.crownR=lerp(T.crownR,rr(1.2,2.4),k);T.rb=lerp(T.rb,rr(.12,.25),k);}}}},
 {sp:4,cell:17,accept:(Z,x,z)=>Z.boreal*.6*(stand(x,z,61)===1?1:.35),opt:{pad:1.2,patch:.35,patchScale:.008}},
 // ponderosa parkland and the aspen groves (clonal: big patches, one colour per grove)
 {sp:2,cell:30,accept:(Z)=>Z.pine*.55+Z.vale*.12*smooth(.06,.24,Z.cold)+Z.rimZ*.08*smooth(.12,.3,Z.cold),opt:{pad:3,patch:.45,patchScale:.008}},
 {sp:5,cell:17,accept:(Z)=>Z.pine*.38+Z.boreal*.28+Z.rip*smooth(.18,.38,Z.cold)*.45,opt:{pad:1,patch:.92,patchScale:.0065,lodK:.3}},
 // the riparian forest: cottonwoods on the floodplain and the canyon floor, maples on the benches and in the side canyons
 {sp:7,cell:34,accept:(Z)=>(Z.rip*.65+Z.vale*.06*Z.flow)*smooth(.5,.25,Z.cold),opt:{pad:3,patch:.4,patchScale:.012}},
 {sp:9,cell:26,accept:(Z)=>(Z.rip*.3+Z.bench*.25*smooth(.3,.5,Z.wet)+Z.vale*.1)*smooth(.55,.3,Z.cold),opt:{pad:1.5,patch:.55,patchScale:.012}},
 {sp:14,cell:34,accept:(Z)=>(Z.vale*.12+Z.rip*.2)*smooth(.42,.15,Z.cold),opt:{pad:2,patch:.6,patchScale:.008}},
 // pinyon-juniper woodland on the plateaus, rims and benches, in stands of either; the bristlecones on the high rock
 {sp:0,cell:27,accept:(Z,x,z)=>(Z.steppe*.32+Z.pine*.1*smooth(.4,.25,Z.cold)+Z.rimZ*.45+Z.bench*.32+Z.bad*.05*smooth(.05,.25,Z.cold))*(stand(x,z,71)===0?1:.4),opt:{pad:1.5,patch:.55,patchScale:.01}},
 {sp:1,cell:26,accept:(Z,x,z)=>(Z.steppe*.4+Z.waste*.05+Z.rimZ*.35+Z.bench*.3+Z.bad*.1)*(stand(x,z,71)===1?1:.4),opt:{pad:1.2,patch:.55,patchScale:.01}},
 {sp:6,cell:40,accept:(Z)=>Z.tundra*.28*smooth(.99,.88,Z.cold)*(.4+.6*Z.rock)+Z.boreal*Z.rock*.25+Z.steppe*smooth(.42,.6,Z.cold)*.12,opt:{pad:2,patch:.5}},
 // gambel oak thickets in the valleys and the pine belt
 {sp:8,cell:22,accept:(Z)=>Z.vale*.32+Z.pine*.22*smooth(.5,.3,Z.cold)+Z.steppe*.08*smooth(.25,.45,Z.wet)+Z.bench*.12,opt:{pad:1,patch:.8,patchScale:.012,lodK:.3}},
 // the alien flora of the hot north and the vents
 {sp:11,cell:72,accept:(Z)=>Z.waste*.2+Z.vent*.25+Z.bad*.04*Z.hot,opt:{pad:3,patch:.45}},
 {sp:12,cell:66,accept:(Z)=>Z.waste*.15+Z.bad*.09*Z.hot+Z.vale*.03*Z.hot,opt:{pad:4,patch:.45}},
 {sp:16,cell:36,accept:(Z)=>Z.vent*.4+Z.waste*.04+Z.rip*.12*Z.hot,opt:{pad:2,patch:.5}},
 {sp:13,cell:20,accept:(Z)=>Z.waste*.12+Z.bad*.07*Z.hot+Z.vent*.18+Z.steppe*.03*smooth(.3,.1,Z.cold),opt:{pad:.8,patch:.92,patchScale:.012,lodK:.5,small:true}},
 // the wet meadows' giant umbels, and yucca on the dry slopes
 {sp:15,cell:19,accept:(Z)=>(Z.vale*.14*smooth(.5,.75,Z.wet)+Z.rip*.24)*smooth(.5,.25,Z.cold),opt:{pad:1,patch:.8,patchScale:.014,lodK:.5,small:true}},
 {sp:10,cell:30,accept:(Z)=>Z.waste*.15+Z.steppe*.08*smooth(.32,.12,Z.cold)+Z.bad*.08+Z.vale*.05*smooth(.6,.35,Z.wet)+Z.bench*.1,opt:{pad:1,patch:.5,lodK:.5,small:true}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the pass's own tree record (H, rb, crownR and seed drawn from the kit's stream: reseed first
// for a repeatable variant). grow(T,lv): build that one tree into this kit's buckets and items at level lv
// (2 hero, 1 mid, 0 the far impostor; null when the species has none) and nothing else: no keep-clear entry,
// no TREES record. openworld/little-demo/src/84-world-nursery.js is the user.
EBADLANDS.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
EBADLANDS.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
