// ================================================================= N SEMIARID — trees
// The seventeen tree-scale species of the northern semiarid country, placed by zone from the host's climate fields. The
// zones are computed HERE from those fields, never from the host's map: a world that binds the same fields gets the same
// zoning. Rain (wet) leads: the region runs from the old beds' lowland desert through the hot steppe and the
// Mediterranean foothills to the rainy uplands; the lake beds' own fields (bed, salt, silt: core/terrain's KBASIN through
// the overlay) and the stream's flow make the rest. Beyond the LOD spine a tree becomes an impostor in the 'far' bucket.
// Every count scales with q; the core charges BIO.cur.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=NSEMIARID.SPECIES,PAL=NSEMIARID.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=NSEMIARID.C;
NSEMIARID.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet (rain, channels, water: ~ rain / 1,800 mm), flow (a stream's banks), rock,
// dune, slope, salt, cold, upland; and the overlays' (biomes/nsemiarid/PLAN.md section 3), 0 where none is bound:
// bed (lay under an old lake), silt (lake sediment), scour (a flood's bare channel). Each weight 0..1:
//   desert   the lowland desert (BWh), mostly the old beds       crescent saxaul, helicopter trumpets, giant dandelions
//   steppe   the hot steppe (BSh)                                pistachio parkland, dandelion frills, trumpets, foxtails
//   med      the Mediterranean foothills (Csa)                   Judas trees, almonds, pomegranates, foxtails, lanterns
//   forest   the rainy uplands (Cfa): the feral fruit forest      apple, walnut, apricot, pear, kite ash, lanterns
//   tugai    the warm, low, wet lake margins (Af, Am, Aw)        golden poplar (dead and grey on the salt behind it)
//   rip      a stream's or a spring's banks above the margins    spring planes, walnuts, poplars
//   pan      salt ground on the old beds                          nothing tree-sized: salt fingers, windows (60)
//   cliff    steep bare rock: nothing roots (every zone x 1 - cliff)
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),up=F('upland'),rock=F('rock'),dune=F('dune'),slope=F('slope'),salt=F('salt'),cold=F('cold'),bed=F('bed'),silt=F('silt'),scour=F('scour');
 const cliff=smooth(.75,.95,slope)*smooth(.3,.6,rock),live=1-cliff,hot=smooth(.45,.15,cold);
 const pan=smooth(.3,.6,salt),open=(1-dune*.85)*live*(1-pan),gentle=smooth(.6,.28,slope);
 const tugai=Math.max(flow*smooth(.5,.8,wet),smooth(.82,.95,wet))*smooth(.5,.15,up)*hot*live*(1-pan*.6);
 return{wet,flow,up,rock,dune,slope,salt,cold,bed,silt,scour,cliff,hot,pan:pan*live,
  desert:open*smooth(.17,.09,wet)*(1-rock*.5),
  steppe:open*smooth(.1,.18,wet)*smooth(.36,.27,wet)*(1-rock*.6)*(1-scour*.5),
  med:open*smooth(.27,.36,wet)*smooth(.56,.46,wet)*hot*(1-rock*.5),
  forest:open*smooth(.46,.58,wet)*(1-flow*.5)*gentle*(1-rock*.6),
  tugai:tugai,
  rip:flow*(1-tugai)*live*gentle};}
NSEMIARID.zones=zones;
NSEMIARID.standOf=(x,z,n,seed)=>BIO.standAt(x,z,n||2,.0024,seed||87);

// ---------------------------------------------------------------- the travellers' shapes (positions only: core/rand)
// CRESCENT GROVES (the saxaul): one per 180 m cell, its centre and radius drawn from the cell; the grove is an arc whose
// horns point downwind (a barchan's plan: the grove roots its downwind limbs and dies behind). crescent(x,z) is 0..1 on
// the living arc; crescentDead(x,z) inside it on the upwind side, where the old trunks stand dead.
const CC=180;
function crescentAt(x,z){const W=NSEMIARID.WIND,ci=Math.floor(x/CC),cj=Math.floor(z/CC);let live=0,dead=0;
 for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const i=ci+di,j=cj+dj,h=KRAND.hash(911,i,j);if(KRAND.unit(h)>.55)continue;
  const cx=(i+.2+.6*KRAND.unit(KRAND.hash(h,1)))*CC,cz=(j+.2+.6*KRAND.unit(KRAND.hash(h,2)))*CC,Rc=28+40*KRAND.unit(KRAND.hash(h,3));
  const dx=x-cx,dz=z-cz,d=Math.sqrt(dx*dx+dz*dz),u=(dx*W[0]+dz*W[1])/(d||1);
  const arc=(1-smooth(5,11,Math.abs(d-Rc)))*smooth(.55,.2,u);   // the downwind sector left open: the horns trail downwind
  if(arc>live)live=arc;
  const inner=smooth(Rc*.9,Rc*.55,d)*smooth(.1,-.4,u);if(inner>dead)dead=inner;}
 return[live,dead];}
NSEMIARID.crescentAt=crescentAt;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:NSEMIARID.BARKTEX.map(t=>texMean(t)),wood:texMean(NSEMIARID.WOODTEX),rock:texMean(NSEMIARID.ROCKTEX)};
 // a library bark's pack brightness replaces its canvas's (50-species, materials.json)
 const lm=NSEMIARID.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);if(lm.wood!=null)MEAN.wood=lin(lm.wood);
 return MEAN;}
Object.assign(NSEMIARID,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const deadCol=()=>tint(pick(PAL.deadwood),means().wood,rr(.85,1.05));
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
NSEMIARID.leafCol=leafCol;

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
NSEMIARID.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// a scatter of blooms in a disc of radius r (one colour per head); o.flat lays them on the ground
function blooms(x,y,z,r,n,set,sz,o){o=o||{};const c=bright(vary(pick(set),.03,.1,.08),1.15),tl=o.tilt==null?.5:o.tilt;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.3,.55);
  const bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d;if(o.flat&&BIO.depth(bx,bz)>.3)continue;   // a flat scatter never spills into the water
  BIO.put(o.item||'bloom',[bx,y+(o.flat?rr(0,.3):rr(-.3,.4)*r),bz],qEuler(rr(-tl,tl),rr(0,TAU),rr(-tl,tl)),s,(o.flat||i%4)?c:shade(c,rr(-.1,.2)));}}
NSEMIARID.blooms=blooms;
// a vine curtain from a point (the glider gourd on a tree's limbs, the rust vine on a hulk): ribbons, and pods among them
function hangVine(x,y,z,len,w,st,o){o=o||{};const n=ri(2,4),a0=rr(0,TAU),lc=leafCol(o.leaf||PAL.gourd,1.2,.03,.08,.05);
 for(let i=0;i<n;i++){const a=a0+i*GOLD,d=w*rr(.1,.5),L=len*rr(.6,1.05);
  BIO.put('vine',[x+Math.cos(a)*d,y+rr(-.1,.1),z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w*rr(.7,1.1),L,1],bright(lc,rr(.9,1.08)));
  if(o.pods!==false&&rng()<.6){const t=rr(.25,.8),gs=rr(.35,.6),gx=x+Math.cos(a)*d*1.2,gz=z+Math.sin(a)*d*1.2;if(y-L*t-gs<Math.max(BIO.waterH(gx,gz),BIO.terrainH(gx,gz))+.3)continue;BIO.put('gourd',[gx,y-L*t,gz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[gs,gs*rr(1.1,1.4),gs],leafCol(PAL.gourd,1.1,.02,.06,.05));if(st)st.pods++;}}
 if(st)st.vines++;}
NSEMIARID.hangVine=hangVine;
// seeds in flight, strung out downwind of a point, rising and falling, spinning: a still frame, for what the floor places
// (the glider gourd's wings, the sail candelabra's blades). The trees' seeds are not drawn this way any more: a variant is
// drawn turned, which turned its trail off the wind; they fly in 89c-host-seeds.js, torn loose by core/atmos's wind
function seedsAloft(item,x,y,z,n,reach,sz,set,st){const W=NSEMIARID.WIND;
 for(let i=0;i<n;i++){const d=reach*Math.pow(rng(),.7),side=rr(-.25,.25)*d,px=x+W[0]*d-W[1]*side,pz=z+W[1]*d+W[0]*side,py=y+rr(-.4,.5)*Math.min(30,d*.35)+rr(0,4);
  if(py<Y(px,pz)+.4||py<BIO.waterH(px,pz)+.6)continue;const s=rr(sz[0],sz[1]);
  BIO.put(item,[px,py,pz],qEuler(rr(-1.2,1.2),rr(0,TAU),rr(-1.2,1.2)),[s,s,s],leafCol(set,1.2,.02,.05,.04));if(st)st.aloft++;}}
NSEMIARID.seedsAloft=seedsAloft;
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
// a BROADLEAF: one or several stems, limbs from the fork, secondaries, leaf clumps on the skeleton (the eastern badlands'
// decTree, with blossom, cauliflory (flowers on the old wood: the Judas tree), fruit, samaras and dead trees added).
// cfg: fam, item, stems [a,b], forkU, limbs [a,b], el, limbK, sec, curve, wig, tuftK, flat; col(T); mixCol [p,set];
// fruit {p, s[a,b], long, col}; blossom {p,set}; cauli {n,set}; samara {p}; dead (no leaves, deadwood); vine (gourds)
function decTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,dead=!!cfg.dead,fam=dead?'wood':cfg.fam;
 const nS=ri(cfg.stems[0],cfg.stems[1]),a0=rr(0,TAU),hc=cfg.col?cfg.col(T):C(pick(S.leaf)),spots=[];let reach=R*.6,topY=T.y0+H*.8;
 const bk=k=>dead?deadCol():barkCol(S,k);
 for(let s=0;s<nS;s++){const a=a0+s*TAU/nS+rr(-.3,.3),off=nS>1?rb*rr(.5,1.2):0,lean=cfg.leanA!=null?rr(.5,1)*cfg.lean:nS>1?rr(.06,.2):rr(0,cfg.lean||.04),fh=H*cfg.forkU*(s?rr(.75,1):1);
  const la=cfg.leanA!=null?cfg.leanA+rr(-.5,.5):a;   // a leaning tree's stems lean one way (cfg.leanA); otherwise each away from the middle
  const pts=bole(T,S,fam,T.x+Math.cos(a)*off,T.z+Math.sin(a)*off,fh,rb*(nS>1?.7:1),rb*(nS>1?.45:.6),lean,la,cfg.wig,lv===2?4:2,st,lv===2?(rb>.3?7:5):4,dead);
  const top=pts[pts.length-1],nL=lv===2?ri(cfg.limbs[0],cfg.limbs[1]):Math.max(2,cfg.limbs[0]-1),la0=rr(0,TAU);
  if(cfg.cauli&&lv===2&&!dead)for(let i=0,m=ri(cfg.cauli.n[0],cfg.cauli.n[1]);i<m;i++){const p=along(pts,rr(.15,.95)),ba=rr(0,TAU);
   blooms(p.x+Math.cos(ba)*p.r,p.y,p.z+Math.sin(ba)*p.r,p.r*.6+.15,ri(3,6),cfg.cauli.set,[.07,.12],{tilt:.9});st.blooms++;}
  for(let k=0;k<nL;k++){const la=la0+k*GOLD+rr(-.3,.3),el=cfg.el*rr(.8,1.2),L=(H-fh)*cfg.limbK*rr(.8,1.15)/(nS>1?1.15:1),r0=top.r*rr(.55,.75);
   const o=k<2?top:along(pts,rr(.75,.98)),lp=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(la,el),L,r0,Math.max(.04,r0*.35),3,cfg.curve,cfg.wig);
   let ok=true;for(let i=1;i<lp.length;i++)if(!clear3(lp[i].x,lp[i].y,lp[i].z,lp[i].r+1,lp[i].r+1)){ok=false;break;}if(!ok)continue;
   if(lv===2||r0>.3)st.limb+=BIO.tube(fam,lp,bk(k+2),{seg:r0>.25?5:4,cap:r0>.25});else{BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[2].x,lp[2].y,lp[2].z],r0*2,r0*1.3,rodCol(S.bark[0]));BIO.beam('rod',[lp[2].x,lp[2].y,lp[2].z],[lp[3].x,lp[3].y,lp[3].z],r0*1.3,r0*.7,rodCol(S.bark[0]));}st.forks++;
   spots.push({p:lp[3],s:L*.3,tip:true},{p:lp[2],s:L*.25});
   const nSec=lv===2?cfg.sec:0;
   for(let q=0;q<nSec;q++){const p=lp[ri(1,2)],a2=la+rr(-1.3,1.3),el2=el+rr(-.3,.5),L2=L*rr(.4,.65);
    const sp2=treeGrow({x:p.x,y:p.y,z:p.z},dirOf(a2,el2),L2,Math.max(.03,p.r*.55),.03,2,cfg.curve,.12);
    if(lv===2&&sp2[0].r>.06)st.limb+=BIO.tube(fam,sp2,bk(q),{seg:3});else BIO.beam('rod',[sp2[0].x,sp2[0].y,sp2[0].z],[sp2[2].x,sp2[2].y,sp2[2].z],sp2[0].r*2,.05,dead?deadCol():rodCol(S.bark[0]));
    spots.push({p:sp2[2],s:L2*.4,tip:true},{p:sp2[1],s:L2*.3});}
   reach=Math.max(reach,Math.hypot(lp[3].x-T.x,lp[3].z-T.z)+L*.3);topY=Math.max(topY,lp[3].y+R*cfg.tuftK);}
  spots.push({p:{x:top.x,y:top.y+R*.15,z:top.z},s:R*.3,tip:true});}
 if(dead){regTree(T,S,reach,topY-T.y0+1);return;}
 const cy=T.y0+H*mix(cfg.forkU,1,.5),ey=H*(1-cfg.forkU)*.55,sz0=R*cfg.tuftK*(lv===2?1:1.5);let mine=0;
 const blossoming=cfg.blossom&&rng()<cfg.blossom.p;
 for(const s of spots){const n=lv===2?(s.tip?cfg.nC||2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.15,.4)*s.s;
   if(!clear3(x,y,z,sz0*.4,sz0*.3))continue;
   const bl=blossoming&&rng()<.75;
   clumpAt(bl?'blossom':cfg.item,x,y,z,sz0*rr(.85,1.2),cfg.flat,bl?C(pick(cfg.blossom.set)):(cfg.mixCol&&rng()<cfg.mixCol[0]?C(pick(cfg.mixCol[1])):hc),T.x,cy,T.z,R,ey);st.clumps++;mine++;}
  if(cfg.fruit&&lv===2&&s.tip&&!blossoming&&rng()<cfg.fruit.p){const F=cfg.fruit;for(let i=0,n=ri(1,3);i<n;i++){const a=rr(0,TAU),d=s.s*rr(.1,.35),r=rr(F.s[0],F.s[1]);
   BIO.put('fruit',[s.p.x+Math.cos(a)*d,s.p.y-rr(.05,.3),s.p.z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),0),[r,r*F.long,r],bright(vary(pick(F.col),.02,.06,.05),1.05));st.fruit++;}}
  if(cfg.samara&&lv===2&&s.tip&&rng()<cfg.samara.p)for(let i=0,n=ri(2,5);i<n;i++){const a=rr(0,TAU),L=rr(.4,.6);
   BIO.put('samara',[s.p.x+Math.cos(a)*s.s*.3,s.p.y-rr(.1,.5),s.p.z+Math.sin(a)*s.s*.3],qEuler(rr(-.5,.5),a,-rr(.8,1.3)),[L,L,L],leafCol(PAL.samaraSeed,1.1,.02,.05,.04));st.pods++;}}
 if(cfg.vine&&lv===2&&rng()<cfg.vine){const L=spots.filter(q=>q.tip&&q.p.y<T.y0+H*.8);for(let i=0,n=Math.min(L.length,ri(2,5));i<n;i++){const q=L[ri(0,L.length-1)].p;
  hangVine(q.x,q.y,q.z,Math.max(1.5,(q.y-T.y0)*rr(.3,.65)),rr(.8,1.5),st);}}
 if(!mine){clumpAt(cfg.item,T.x,T.y0+H*.8,T.z,sz0,cfg.flat,hc,T.x,cy,T.z,R,ey);st.clumps++;}
 regTree(T,S,reach,topY-T.y0+1);}
// 0 the wild pistachio: squat, broad, several gnarled stems, a low dome; red-blushed nut clusters
B[0]=function(T,st,lv){decTree(T,st,lv,{fam:'bark3',item:'round',stems:[1,3],forkU:.3,limbs:[4,6],el:.42,limbK:1.05,sec:2,curve:-.06,wig:.18,tuftK:.42,flat:.6,
 fruit:{p:.3,s:[.05,.07],long:1.2,col:PAL.pistNut}});};
// 1 the crescent saxaul: gnarled grey stems twisting out of the sand, leafless, a broom of jointed green twigs. In a
// crescent grove (the pass's acceptance) the trees lean downwind, where the grove roots its limbs
B[1]=function(T,st,lv){const W=NSEMIARID.WIND,la=Math.atan2(W[1],W[0]);decTree(T,st,lv,{fam:'bark3',item:'broom',stems:[2,4],forkU:.28,limbs:[3,5],el:.5,limbK:.9,sec:2,curve:-.12,wig:.3,tuftK:.46,flat:.75,lean:.25,leanA:la});};
// 2 the spring plane (chinar): a vast pale bole flaking in camouflage patches, broad limbs, a dome of palmate leaves
B[2]=function(T,st,lv){decTree(T,st,lv,{fam:'bark1',item:'palm',stems:[1,1],forkU:rr(.28,.38),limbs:[5,7],el:.6,limbK:1.0,sec:3,curve:-.05,wig:.08,tuftK:.38,flat:.72,nC:3,
 mixCol:[.08,[0xb8a050,0xa89a48]]});};
// 3 the Judas tree: several thin stems, a rounded crown; in flower the magenta pea flowers break out of the bark itself
B[3]=function(T,st,lv){const fl=rng()<.55;decTree(T,st,lv,{fam:'bark2',item:'round',stems:[2,4],forkU:.35,limbs:[3,5],el:.75,limbK:.75,sec:2,curve:-.03,wig:.14,tuftK:.4,flat:.75,
 blossom:fl?{p:1,set:PAL.judasFl}:null,cauli:fl?{n:[6,12],set:PAL.judasFl}:null});};
// 4 the wild almond: a spreading small tree, pale pink blossom on the bare wood early in the year, else grey-green
B[4]=function(T,st,lv){decTree(T,st,lv,{fam:'bark2',item:'small',stems:[1,3],forkU:.3,limbs:[3,5],el:.65,limbK:.9,sec:2,curve:-.04,wig:.16,tuftK:.42,flat:.7,
 blossom:{p:.45,set:PAL.almondFl},fruit:{p:.2,s:[.035,.05],long:1.4,col:[0x8a9a6a,0x9aa478]}});};
// 5 the wild apple: the Ancients' orchards gone wild; every tree a different apple (red, gold, green-gold)
B[5]=function(T,st,lv){const fc=[pick(PAL.appleFruit)];decTree(T,st,lv,{fam:'bark2',item:'round',stems:[1,2],forkU:.3,limbs:[4,6],el:.6,limbK:.95,sec:2,curve:-.06,wig:.14,tuftK:.42,flat:.7,
 blossom:{p:.15,set:[0xf8e8ee,0xf0d0dc]},fruit:{p:.55,s:[.05,.08],long:.95,col:fc},vine:.12});};
// 6 the wild walnut: a tall, broad tree, pinnate leaves, green husked nuts
B[6]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'lobed',stems:[1,1],forkU:rr(.3,.4),limbs:[5,7],el:.62,limbK:1.0,sec:3,curve:-.05,wig:.08,tuftK:.4,flat:.7,nC:3,
 fruit:{p:.35,s:[.045,.06],long:1.05,col:PAL.walnutFruit}});};
// 7 the wild apricot: dark red-brown bark, orange fruit thick on the limbs in summer
B[7]=function(T,st,lv){decTree(T,st,lv,{fam:'bark2',item:'round',stems:[1,2],forkU:.32,limbs:[3,5],el:.7,limbK:.85,sec:2,curve:-.04,wig:.14,tuftK:.42,flat:.72,
 blossom:{p:.12,set:[0xf8e4e8,0xffffff]},fruit:{p:.55,s:[.035,.05],long:1,col:PAL.apricotFruit}});};
// 8 the wild pear: narrower and upright, small hard pears
B[8]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'round',stems:[1,1],forkU:.35,limbs:[4,6],el:.95,limbK:.7,sec:2,curve:.02,wig:.08,tuftK:.38,flat:.85,
 fruit:{p:.45,s:[.04,.06],long:1.35,col:PAL.pearFruit}});};
// 9 the kite ash: a tall open ash whose seeds come down as half-metre helicopters; bunches hang from every tip, and the
// ripest are in the air downwind
B[9]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:'lobed',stems:[1,1],forkU:rr(.35,.45),limbs:[4,6],el:.75,limbK:.8,sec:2,curve:-.02,wig:.08,tuftK:.38,flat:.75,
 samara:{p:.45}});};
// 10 the golden poplar (after the Euphrates poplar): gold in its season, willow-narrow leaves low and round leaves high;
// on the salt behind the living forest it stands DEAD (salt in its zone, or the pass marks it), grey and leafless
B[10]=function(T,st,lv){const dead=!!T.dead;decTree(T,st,lv,{fam:'bark0',item:'round',stems:[1,2],forkU:rr(.3,.45),limbs:[3,6],el:.7,limbK:.85,sec:2,curve:-.02,wig:.16,tuftK:.4,flat:.75,
 mixCol:[.35,PAL.poplarGreen],dead});
 // its cotton: torn off the crown by the wind and drifting downwind (89c-host-seeds.js)
};
// 11 THE DANDELION FRILL (the frill-tree line: the Rift's and the drylands' bottle column): a ribbed column swollen low,
// rows of fins up every rib, a splay of fins round the crown. Here every fin is a seed on a plume. Its stage is its
// seed's: GREEN (iridescent teal to violet fins), RIPE (silk-white fins and the crown pod open into a seed clock 4-6 m
// across), HALF SHED (the downwind side stripped first) or BARE (ribs pricked with sockets; the new fins grow back from the
// foot, so how high they reach says how long since it shed)
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,W=NSEMIARID.WIND,wa=Math.atan2(W[1],W[0]);
 const stage=['green','ripe','half','bare'][T.seed%4],ripe=stage==='ripe'||stage==='half',bH=H*.82;
 const rAt=u=>rb*(.7+.5*Math.sin(clamp(u*1.4,0,1)*Math.PI*.85))*(1-u*.45);
 const rings=[];for(let u=0;u<=1.001;u+=.125)rings.push({x:T.x,y:T.y0-.3+bH*u,z:T.z,r:rAt(u),yy:u*bH,col:barkCol(S,ri(0,2))});
 st.trunk+=BIO.lathe('bark5',rings,lv===2?12:8,1,4,(Rg,a)=>Rg.r*(1+.1*Math.cos(a*6)),null);
 const ribs=lv===2?8:6,regrow=stage==='bare'?rr(.15,.45):1;
 // the fins' colour: WHITE (the default since 2026-10-22: the fin card's own membrane, faintly iridescent while green,
 // silk-white ripe) or TINT (the first look: teal to violet while green); the host picks (NSEMIARID.frillLook, ?frill=tint)
 const white=NSEMIARID.frillLook!=='tint';
 const finCol=()=>ripe?leafCol(PAL.frillRipe,1.15,.01,.03,.03):white?leafCol(PAL.frillPale,1.1,.03,.05,.04):leafCol(S.leaf,1.25,.08,.12,.06);
 // a ruff: rows about every 0.8 m up every rib, each fin splayed out and up from the column like a feather from a shaft,
 // longest at the swelling (2026-10-22: shorter fins lying almost flat read as specks on a bottle)
 const rows=lv===2?Math.round(bH/.8):Math.round(bH/2.2);
 for(let i=0;i<rows;i++){const u=(i+.5)/rows;if(u>regrow)break;const y=T.y0+bH*u,r=rAt(u);
  for(let k=0;k<ribs;k++){const a=k/ribs*TAU+i*.39,down=Math.cos(a-wa);
   if(stage==='half'&&down>-.1&&u>.3)continue;   // the downwind side shed first
   const L=(1.3+2.1*Math.sin(u*Math.PI*.9))*rr(.85,1.12);
   BIO.put('fin',[T.x+Math.cos(a)*r*.92,y,T.z+Math.sin(a)*r*.92],qEuler(rr(-.25,.25),-a,rr(.32,.7)),[L,L*.55,L*rr(1,1.3)],finCol());st.clumps++;}}
 // the crown: a splay of long fins round the pod; ripe, the pod is a seed clock of plumes
 const top=T.y0+bH;
 if(stage!=='bare'){for(let k=0,n=lv===2?14:7;k<n;k++){const a=k/n*TAU,L=rr(2.2,3.4);if(stage==='half'&&Math.cos(a-wa)>0)continue;
   BIO.put('fin',[T.x+Math.cos(a)*rb*.3,top,T.z+Math.sin(a)*rb*.3],qEuler(rr(-.1,.1),-a,rr(.5,.95)),[L,L,L*1.2],finCol());st.clumps++;}}
 if(ripe){const R=T.crownR*(stage==='half'?.85:1);BIO.put('clock',[T.x,top+R*.8,T.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,R,R],leafCol(PAL.clock,1.15,.01,.03,.03));}
 else if(stage==='green')BIO.put('lobe',[T.x,top-.2,T.z],qEuler(0,rr(0,TAU),0),[rb*.7,rb*1.2,rb*.7],leafCol(S.leaf,.9,.03,.06,.05));
 regTree(T,S,rb*1.6+2.5,H+(ripe?T.crownR*1.8:1));};
// 12 THE HELICOPTER TRUMPET (the trumpet-tree line: a slim ribbed stalk flaring into a bell): the bell carries eight
// pitched blades grown up its outside, on a living ring joint at the stalk's top, so it turns in the wind like an
// anemometer (86-host-variants.js spins it by core/atmos's wind) and flings its winged seeds over the rim; in a high wind
// they come off in numbers and autorotate away downwind (89c-host-seeds.js)
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,lean=[rr(-.05,.05)*H,rr(-.05,.05)*H];
 const rings=[];for(let u=0;u<=1.001;u+=.2)rings.push({x:T.x+lean[0]*u*u,y:T.y0-.3+(H*.84+.3)*u,z:T.z+lean[1]*u*u,r:rb*(1-.45*u)*(u<.05?1.3:1),yy:u*H,col:barkCol(S,ri(0,2))});
 st.trunk+=BIO.lathe('bark5',rings,lv===2?8:6,1,4,(Rg,a)=>Rg.r*(1+.08*Math.cos(a*5)),null);
 const top=rings[rings.length-1];
 // the joint: a swollen ring the bell turns on
 BIO.put('lobe',[top.x,top.y-.1,top.z],qEuler(0,rr(0,TAU),0),[rb*1.15,rb*.7,rb*1.15],leafCol(S.leaf,.85,.03,.06,.05));
 // the crown: bell, throat and blades on one origin, one turn, one scale (the spin's pivot is that origin)
 const Hb=R*rr(.78,.95),q=qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),o=[top.x,top.y-.08,top.z],sc=[R,Hb,R];
 BIO.put('bell',o,q,sc,leafCol(S.leaf,1.15,.05,.1,.05));
 BIO.put('bellIn',o,q,sc,leafCol(PAL.trumpetIn,1.1,.02,.05,.04));
 BIO.put('vanes',o,q,sc,leafCol(PAL.trumpetVane,1.2,.02,.05,.04));
 regTree(T,S,R*1.6,H*.84+Hb*1.2);};
// 13 THE DRIFT LANTERN (the bell-bulb line: nhighlands' bulbs that glow at night): a few arching stalks, each hung with
// pale bulbs; as they ripen they fill with gas and lift away at dusk, a seed under each. Some of this tree's are already
// aloft over it and downwind (buoyancy goes with the air's density: 1.42 atm lifts 40% more than Earth's)
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,W=NSEMIARID.WIND;const n=ri(3,6),a0=rr(0,TAU);
 for(let s=0;s<n;s++){const a=a0+s*TAU/n+rr(-.3,.3),h=H*rr(.7,1),out=T.crownR*rr(.5,1);
  const pts=[{x:T.x,y:T.y0-.2,z:T.z,r:T.rb},{x:T.x+Math.cos(a)*out*.3,y:T.y0+h*.65,z:T.z+Math.sin(a)*out*.3,r:T.rb*.6},{x:T.x+Math.cos(a)*out,y:T.y0+h,z:T.z+Math.sin(a)*out,r:T.rb*.3},{x:T.x+Math.cos(a)*out*1.3,y:T.y0+h*.88,z:T.z+Math.sin(a)*out*1.3,r:T.rb*.2}];
  pts.forEach(p=>p.col=barkCol(S,s));st.limb+=BIO.tube('bark5',pts,pts[0].col,{seg:lv===2?5:3});
  const tip=pts[3];for(let k=0,m=lv===2?ri(2,4):1;k<m;k++){const b=rr(.6,1.1);BIO.put('lantern',[tip.x+rr(-.3,.3),tip.y-k*.4,tip.z+rr(-.3,.3)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[b,b*1.2,b],leafCol(S.leaf,1.5,.02,.06,.04));st.pods++;}
  BIO.put('lobe',[pts[1].x,pts[1].y,pts[1].z],qEuler(0,rr(0,TAU),0),[.9,.4,.9],leafCol(PAL.lanternLeaf,1.1,.03,.08,.05));}
 if(lv===2)for(let k=0,m=ri(2,6);k<m;k++){const d=rr(2,H*4),px=T.x+W[0]*d+rr(-4,4),pz=T.z+W[1]*d+rr(-4,4),b=rr(.6,1.0);
  BIO.put('lantern',[px,T.y0+H+rr(2,6)+d*.25,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[b,b*1.2,b],leafCol(S.leaf,1.6,.02,.06,.04));st.aloft++;}
 regTree(T,S,T.crownR*1.4,H+1);};
// 14 the wild pomegranate: a thicket shrub-tree, glossy narrow leaves, scarlet flowers and sour red fruit
B[14]=function(T,st,lv){decTree(T,st,lv,{fam:'bark2',item:'small',stems:[3,6],forkU:.25,limbs:[2,4],el:.85,limbK:.8,sec:1,curve:-.04,wig:.2,tuftK:.5,flat:.75,
 fruit:{p:.45,s:[.07,.1],long:.9,col:PAL.pomFruit}});if(lv===2&&rng()<.5)blooms(T.x,T.y0+T.H*.7,T.z,T.crownR*.7,ri(4,9),PAL.pomFl,[.1,.16]);};
// 15 the foxtail spire (after Eremurus): a rosette of strap leaves and a spike 4-8 m tall opening from the bottom up
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,lean=[rr(-.04,.04)*H,rr(-.04,.04)*H];
 BIO.put('rosette',[T.x,T.y0-.05,T.z],qEuler(0,rr(0,TAU),0),[T.crownR,T.crownR*.7,T.crownR],leafCol(PAL.foxLeaf,1.2,.03,.08,.05));
 BIO.beam('rod',[T.x,T.y0,T.z],[T.x+lean[0],T.y0+H,T.z+lean[1]],T.rb*2,T.rb*.8,rodCol(0x6a8a4a,-.1));
 const fc=pick(PAL.foxtail),n=lv===2?ri(8,12):3,open=rr(.3,1);
 for(let k=0;k<n;k++){const u=.35+.65*k/n,y=T.y0+H*u,w=mix(.55,.25,u)*(u<open+.35?1:.6);
  BIO.put('spike',[T.x+lean[0]*u,y,T.z+lean[1]*u],qEuler(0,rr(0,TAU),0),[w*1.6,H*.65/n+.25,w*1.6],bright(vary(fc,.02,.06,.05),u<open?1.25:.85));st.spikes++;}
 regTree(T,S,T.crownR,H);};
// 16 the giant dandelion: a basal rosette and a hollow stalk 3.5-6 m under a seed clock 1-3 m across; the clock balds from
// its downwind side, and its seeds are strung out downwind
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,W=NSEMIARID.WIND,n=ri(1,3);
 BIO.put('rosette',[T.x,T.y0-.05,T.z],qEuler(0,rr(0,TAU),0),[T.crownR,T.crownR*.4,T.crownR],leafCol(PAL.grass,1.15,.03,.08,.05));
 for(let k=0;k<n;k++){const h=H*rr(.7,1),lx=rr(-.15,.15)*h+W[0]*h*.05,lz=rr(-.15,.15)*h+W[1]*h*.05,tx=T.x+lx,tz=T.z+lz,ty=T.y0+h;
  BIO.beam('rod',[T.x,T.y0,T.z],[tx,ty,tz],T.rb*2,T.rb*1.2,rodCol(pick(PAL.clockStalk),-.05));
  const R=rr(.5,1.2)*(T.crownR/1.2),bald=rng();
  if(bald<.8){const sc=bald<.5?1:.75;   // a balding clock is shrunk and pushed upwind
   BIO.put('clock',[tx-W[0]*R*(1-sc)*.6,ty+R*.1,tz-W[1]*R*(1-sc)*.6],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R*sc,R*sc,R*sc],leafCol(PAL.clock,1.2,.01,.03,.03));}
  else BIO.put('lobe',[tx,ty,tz],qEuler(0,0,0),[R*.15,R*.12,R*.15],leafCol([0xb8a878],1,.02,.04,.04));   // bare: the receptacle
  }
 regTree(T,S,T.crownR+1,H+1.5);};

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe, as the eastern badlands draw them)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const cheap=BIO.lodD(T.x,T.z)>BIO.LOD().far;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z);
 const F=S.far||{poleU:.35},bc=C(T.dead?0xa8a094:S.bark[fi%S.bark.length]).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=cheap?4:6,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.25,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 if(!T.dead){const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
  const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
  F.blobs.forEach((b,bi)=>{const o=b[5]||{};if(o.rich&&cheap)return;
   const y=T.y0+T.H*b[0],rx=R*b[1],ry=T.H*b[2],off=o.off?R*o.off:0;
   blob(T.x+Math.cos(a0)*off,y,T.z+Math.sin(a0)*off,rx,ry,colOf(b[3]),colOf(b[4]),fi+(o.rich?3:bi));});}
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('nsemiarid: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,forks:0,clumps:0,blooms:0,pods:0,spikes:0,fruit:0,vines:0,aloft:0,heroes:0,fars:0,dead:0,byS:SP.map(()=>0)});
// opt.records (biomes/WORLD.md, level-free records): place every tree and build none; T.lv is left unset. A host that
// draws the trees as variants (grown with make/grow) picks each record's level itself, by the camera.
NSEMIARID.buildTrees=function(R,q,opt){const recOnly=!!(opt&&opt.records);
 reseed(750031);q=q==null?1:q;R=R==null?3000:R;means();
 const st=newStats();
 const TREES=NSEMIARID.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=NSEMIARID.make(sp,x,y,z);
    if(opt.size)opt.size(T,zones(x,z),x,z);
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(recOnly)delete T.lv;else if(T.lv===0&&!S.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2});
  return n;}
 NSEMIARID.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.dead)st.dead++;if(!recOnly){if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}}st.byS[T.sp]++;});
 NSEMIARID.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,dead:st.dead,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,spikes:st.spikes,fruit:st.fruit,aloft:st.aloft,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
NSEMIARID._canopyH=function(x,z){let h=0;for(const T of NSEMIARID.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||4;};
NSEMIARID.nearestTree=function(sp,x,z,minH,pred){let b=null,bd=1e9;for(const T of NSEMIARID.TREES){if(T.sp!==sp||(T.lv!=null&&T.lv<2)||(minH&&T.H<minH)||(pred&&!pred(T)))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// opt: pad keep-clear, patch/patchScale the stand patchiness, small the smaller LOD radii, lodK thinning with distance,
// size(T,Z,x,z) a hook that sizes (or marks) a tree from the zones
const stand=(x,z,s)=>NSEMIARID.standOf(x,z,2,s);
NSEMIARID.PASSES=[
 // the tugai first: golden poplar along the lake margins and the lower stream; dead and grey where the salt has come
 // up behind it
 {sp:10,cell:16,accept:(Z)=>Z.tugai*.75+Z.rip*.18*smooth(.4,.1,Z.up)+Z.pan*.06*smooth(.2,.5,Z.wet),opt:{pad:1.5,patch:.4,patchScale:.012,
  size:(T,Z)=>{if(Z.salt>.3||Z.pan>.3){T.dead=true;T.H*=rr(.6,.9);}}}},
 // the spring planes at the stream and the pool in the foothills and the steppe, and walnuts up the stream
 {sp:2,cell:40,accept:(Z)=>Z.rip*.7*smooth(.05,.25,Z.up)*(1-Z.tugai),opt:{pad:4,patch:.3}},
 {sp:6,cell:30,accept:(Z)=>Z.forest*.22+Z.rip*.25*smooth(.35,.6,Z.up),opt:{pad:3,patch:.5,patchScale:.008}},
 // the feral fruit forest on the upland: apple, apricot and pear in stands, the kite ash in its gaps
 {sp:5,cell:16,accept:(Z,x,z)=>Z.forest*.55*(stand(x,z,51)===0?1:.45),opt:{pad:1.5,patch:.5,patchScale:.01}},
 {sp:7,cell:18,accept:(Z,x,z)=>Z.forest*.3*(stand(x,z,51)===1?1:.4)+Z.med*.08,opt:{pad:1.5,patch:.55,patchScale:.01}},
 {sp:8,cell:20,accept:(Z)=>Z.forest*.24,opt:{pad:1.5,patch:.6,patchScale:.01}},
 {sp:9,cell:36,accept:(Z)=>Z.forest*.18+Z.rip*.06*smooth(.4,.7,Z.up),opt:{pad:3,patch:.5}},
 // the Mediterranean foothills: Judas trees and almonds in drifts, pomegranate thickets, pistachio below
 {sp:3,cell:20,accept:(Z,x,z)=>Z.med*.3*(stand(x,z,61)===0?1:.4)+Z.forest*.04,opt:{pad:1.2,patch:.6,patchScale:.012}},
 {sp:4,cell:18,accept:(Z,x,z)=>Z.med*.34*(stand(x,z,61)===1?1:.4)+Z.steppe*.04,opt:{pad:1.2,patch:.6,patchScale:.012}},
 {sp:14,cell:14,accept:(Z)=>Z.med*.22+Z.tugai*.08+Z.rip*.08,opt:{pad:1,patch:.75,patchScale:.014,lodK:.4,small:true}},
 // the steppe: pistachio parkland, widely spaced
 {sp:0,cell:38,accept:(Z)=>Z.steppe*.3+Z.med*.1+Z.desert*.03,opt:{pad:3,patch:.45,patchScale:.008}},
 // the desert and the beds: crescent saxaul groves (the arc of a grove only: crescentAt)
 {sp:1,cell:7,accept:(Z,x,z)=>(Z.desert*.9+Z.steppe*.2*smooth(.2,.1,Z.wet))*crescentAt(x,z)[0]*(1-Z.pan),opt:{pad:1.4,patch:0,lodK:.3}},
 // Krator's own: the dandelion frills in loose stands on the steppe, the helicopter trumpets in groves, the drift lanterns
 // in the foothills' and the forest's clearings
 {sp:11,cell:70,accept:(Z)=>Z.steppe*.3+Z.med*.08,opt:{pad:4,patch:.5,patchScale:.006}},
 {sp:12,cell:26,accept:(Z,x,z)=>(Z.steppe*.13+Z.desert*.16*(1-Z.pan)+Z.med*.04)*(stand(x,z,71)===0?1:.15),opt:{pad:2,patch:.7,patchScale:.008}},
 {sp:13,cell:30,accept:(Z)=>Z.med*.12+Z.forest*.1*smooth(.7,.4,Z.wet+.1),opt:{pad:2,patch:.6,patchScale:.01,small:true}},
 // the tall herbs: foxtail spires in drifts, giant dandelions everywhere it is open
 {sp:15,cell:22,accept:(Z)=>Z.steppe*.14+Z.med*.18,opt:{pad:.8,patch:.85,patchScale:.016,lodK:.5,small:true}},
 {sp:16,cell:22,accept:(Z)=>Z.steppe*.14+Z.desert*.07*(1-Z.pan)+Z.med*.05,opt:{pad:.8,patch:.8,patchScale:.016,lodK:.5,small:true}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the pass's own tree record (H, rb, crownR and seed drawn from the kit's stream: reseed first for a
// repeatable variant). grow(T,lv): build that one tree into this kit's buckets and items at level lv (2 hero, 1 mid, 0 the
// far impostor) and nothing else: no keep-clear entry, no TREES record.
NSEMIARID.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
NSEMIARID.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
