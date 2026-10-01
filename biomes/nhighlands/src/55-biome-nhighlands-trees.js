// ================================================================= NORTHERN HIGHLANDS — trees
// The twenty-four tree species of the flank, built by HABIT (one builder per
// habit, the species' numbers and its form record make the difference) and
// placed by zone from the host's climate fields (cold / wet / flow / mist /
// rock / upland). The zone weights are computed HERE from those fields, never
// from the host's map. Two placements are not a plain grid: the TRUMPET
// COLONIES (five to thirty understorey trumpets round one spot, the way they
// sucker) and the BIRCH STANDS of the boreal band (and of the old burn).
// Beyond the LOD spine the canopy becomes blob impostors in the 'nfar' bucket.
//
// The trumpet builders take the Rift's lathe-and-ribs form (biomes/rift/src/
// 55-biome-rift-trees.js, B[3]) and xanadu's branching lotus trumpet (biomes/
// xanadu/src/55-biome-xanadu-trees.js, B[2]) and make it old: a gnarled,
// buttressed, mossy bole, writhing arms, a fringed rim on every funnel, violet
// down the throat. Copied and changed here, never imported: a biome is
// self-contained. The two lessons kept: at least three lathe segments per rib,
// and the cup's floor is closed so a funnel never reads as an open pipe.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=NHL.SPECIES,PAL=NHL.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const KEY={};SP.forEach((S,i)=>KEY[S.key]=i);NHL.KEY=KEY;
NHL.TREES=[];NHL.COLONIES=[];NHL.STANDS=[];
// the runtime LOD ranges (metres from the camera to a chunk)
NHL.LOD={tree:1300,floor:650,farFloor:3200,dress:1300,logs:1300};

// ---------------------------------------------------------------- zones from the fields
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const cold=BIO.field('cold',x,z),wet=BIO.field('wet',x,z),flow=BIO.field('flow',x,z),mist=BIO.field('mist',x,z),rock=BIO.field('rock',x,z),up=BIO.field('upland',x,z);
 const temperate=smooth(.44,.28,cold),montane=smooth(.24,.40,cold)*smooth(.74,.58,cold),boreal=smooth(.56,.72,cold),alpine=smooth(.88,.985,cold);
 const rip=smooth(.3,.8,flow);
 const glade=smooth(.62,.72,fbm(x*.0042+13,z*.0042-29,4401,2))*(1-rip)*(1-alpine);                 // clearings: bluebells, bracken, disc stalks
 const oldwood=smooth(.32,.6,rock)*smooth(.14,.30,cold)*smooth(.78,.62,cold)*(1-rip);            // the old wood on the boulder fields
 const crag=smooth(.55,.9,rock)*smooth(.3,.5,cold);
 const burn=boreal*(1-alpine)*smooth(.65,.71,fbm(x*.0015+77,z*.0015-31,4402,2));                  // the old burn: snags over fireweed, birch coming back
 const colony=smooth(.52,.64,fbm(x*.0062-3,z*.0062+8,4403,2));                                   // where the understorey trumpets sucker
 const grove=smooth(.54,.64,fbm(x*.0044+5,z*.0044+41,4404,2));                                   // birch stands
 const cane=smooth(.68,.74,fbm(x*.008+2,z*.008-12,4405,2))*temperate*(1-glade);                  // mountain cane patches
 const dark=smooth(.56,.66,fbm(x*.0055-17,z*.0055+3,4406,2))*smooth(.75,.4,cold);                 // where the dark understorey seeps in
 return{cold,wet,flow,mist,rock,up,temperate,montane,boreal,alpine,rip,glade,oldwood,crag,burn,colony,grove,cane,dark};}
NHL.zones=zones;

// ---------------------------------------------------------------- colour
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x0e100a),-f);return c;}
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
function means(){if(MEAN)return MEAN;MEAN={bark:NHL.BARKTEX.map(t=>texMean(t)),wood:texMean(NHL.WOODTEX),rock:texMean(NHL.ROCKTEX)};return MEAN;}
Object.assign(NHL,{means,tint,bright,shade,vary});
const fam=S=>'nbark'+S.bk;
const barkCol=(S,k)=>tint(S.bark[k%S.bark.length],means().bark[S.bk]);
const mossC=()=>tint(vary(pick(PAL.mossDark),.03,.08,.05),means().bark[4],.9);   // moss written onto bark (through the furrowed texture's mean)
// MOSS ON EVERYTHING: a bole's colour at height yy, pulled toward moss low down and on the wet side
function mossy(S,T,k,amt){const base=barkCol(S,k);if(!amt)return base;const m=mossC();return base.lerp(m,clamp(amt,0,.85));}
const rodCol=(S,k)=>shade(C(S.bark[k%S.bark.length]),-.2);

// ---------------------------------------------------------------- polyline helpers
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
function arc(a,c,b,r0,r1,n){const pts=[];for(let k=0;k<=n;k++){const t=k/n,u=1-t;pts.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:mix(r0,r1,t)});}return pts;}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const P3=p=>[p.x,p.y,p.z];

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[Math.floor(x/HC)+','+Math.floor(z/HC)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
NHL.blocked=blocked;

// ---------------------------------------------------------------- foliage and epiphyte helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.78,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// a drooping SPRAY (frond card pinned at the branch, hanging out along a)
function sprayAt(x,y,z,a,L,pitch,col){BIO.put('spray',[x,y,z],qEuler(rr(-.25,.25),-a,pitch),[L,L*rr(.8,1),L*rr(.9,1.3)],col);}
// HANGING MOSS (temperate) or BEARD LICHEN (boreal) off a point
function drape(x,y,z,len,lichen){const it=lichen?'beard':'drape',set=lichen?PAL.lichen:PAL.drape;
 BIO.put(it,[x,y,z],qEuler(0,rr(0,TAU),0),[rr(.7,1.4)*(lichen?.7:1),len,1],bright(vary(pick(set),.02,.06,.05),lichen?1.2:1.25));}
// a cluster of BELL-BULBS (and now and then LANTERN PODS) hung off a point; one halo in two clusters, for the night
function glowCluster(x,y,z,n,st,podK){const pods=rng()<(podK==null?.25:podK);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.7),L=rr(.6,2.4),s=rr(.85,1.35);
  if(pods)BIO.put('lantern',[x+Math.cos(a)*d,y,z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s*.9,L*.8,s*.9],bright(vary(pick(PAL.pod),.02,.06,.05),1.1));
  else BIO.put('bulb',[x+Math.cos(a)*d,y,z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[s,L,s],bright(vary(pick(PAL.bulb),.015,.05,.04),1.05));}
 if(rng()<.5)BIO.put(pods?'haloV':'halo',[x,y-1.6,z],qEuler(0,rr(0,TAU),0),rr(2.4,3.6),null);
 st.glow+=n;}
function mossOn(p,st,R){BIO.put('mossmat',[p.x,p.y+p.r*.85,p.z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[R,1,R],bright(vary(pick(PAL.moss),.03,.08,.05),.95));st.moss++;}
const reg=(S,T,r)=>{if(typeof BIO.register==='function')BIO.register({name:S.name,kind:'tree',key:S.key,x:T.x,z:T.z,y:T.y0,r:r||T.spread||T.crownR,h:T.H});};
// a BOLE: a lathe up to `top` metres, radius rAt(u), fluting, buttresses, lean and wobble, closed in a dome;
// its colour mossed low down (o.moss 0..1). Returns the top point.
function bole(T,S,top,rAt,o){o=o||{};const vs=o.vs||6,ti=T.seed%3,rings=[],ph=rr(0,TAU),ph2=rr(0,TAU),famN=o.fam||fam(S);
 const lx=o.lean?o.lean[0]:0,lz=o.lean?o.lean[1]:0,mz=(o.moss||0)*T.wet;
 const at=yy=>{const w=o.wob?o.wob(yy):[0,0];return[T.x+lx*yy+w[0],T.z+lz*yy+w[1]];};
 const mcol=mossC();
 for(let yy=0;yy<top;yy+=vs*.5){const p=at(yy),c=o.col?o.col(yy):barkCol(S,(Math.floor(yy/10)+ti)%3);
  if(mz>0)c.lerp(mcol,clamp(mz*smooth(top*.45,0,yy)*.6+mz*.1,0,.6));
  rings.push({x:p[0],y:T.y0+yy,z:p[1],r:rAt(yy/T.H),yy:yy,col:c});}
 const pe=at(top),re=rAt(top/T.H);rings.push({x:pe[0],y:T.y0+top,z:pe[1],r:re*.8,yy:top,col:barkCol(S,1)},{x:pe[0],y:T.y0+top+re*1.3,z:pe[1],r:.04,yy:top+re,col:barkCol(S,1)});
 const nf=o.flutes||0,fa=o.fluteA||0,tw=o.twist||0,nb=o.nb||5,bt=o.buttress||0,bh=o.bh||2.5;
 const seg=o.seg||(T.lv===2?14:8);
 BIO.lathe(famN,rings,seg,Math.max(1,Math.round(TAU*rAt(.1)/(o.urep||3))),vs,
  (R,ang)=>R.r*(1+fa*Math.cos(nf*ang+R.yy*tw+ph))*(1+bt*Math.exp(-R.yy/bh)*Math.max(0,Math.cos(nb*ang+ph2))),
  (R,ang)=>1-(fa>0?.25*(.5-.5*Math.cos(nf*ang+R.yy*tw+ph)):0));
 return{x:pe[0],y:T.y0+top,z:pe[1]};}
function limb(S,pts,st,o){o=o||{};const ph=rr(0,TAU),tw=o.twist||0,fa=o.fluteA||0,nf=o.flutes||4;
 st.limb+=BIO.tube(o.fam||fam(S),pts,o.col||barkCol(S,1),{seg:o.seg||(pts[0].r>.5?7:5),cap:true,rfn:fa?(i,ang)=>1+fa*Math.cos(nf*ang+i*tw+ph):null});}
function limbOk(pts,pad){for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+(pad||1.5),pts[i].r+(pad||1.5)))return false;return true;}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet,cold,...} and lv 2 near / 1 mid
const B={};
// CONIFER: the giants, the hemlock, the firs, the spruces, the spires, the larch. A bole (buttressed and
// fluted in the giants), dead lower branches hung with moss under the crown, then tiers of branches with
// needle clumps (or drooping sprays: the cedar and the hemlock), the crown's outline from the form, and a top.
B.conifer=function(T,st,lv){const S=SP[T.sp],f=S.form,H=T.H,rb=T.rb,R=T.crownR,snow=smooth(.84,.95,T.cold),lichen=(f.lichen||0)*smooth(.45,.7,T.cold),moss=(f.moss||0)*smooth(.6,.3,T.cold);
 const rAt=u=>rb*(1-.84*u)*(1+(f.buttress||0)*.45*Math.exp(-u*H/3));
 bole(T,S,H*.97,rAt,{flutes:f.flutes,fluteA:f.fluteA,buttress:f.buttress,nb:6,bh:3,vs:H>40?9:6,moss:moss,seg:lv===2?(rb>1.4?14:10):6});
 const clear=f.clear*rr(.85,1.1),hc=vary(pick(S.leaf),.015,.06,.05),rc=rodCol(S,T.seed);
 const prof=v=>{const g=v<.06?.55+.45*v/.06:1;
  if(f.crown==='spire')return g*(.25+.75*Math.pow(1-v,.85));
  if(f.crown==='dome')return g*(1-Math.pow(v,1.7))*.95+.05;
  if(f.crown==='open')return g*Math.pow(1-v,.75);
  return g*Math.pow(1-v,.95);};
 // dead lower branches below the crown, the old-growth look: bare, mossed or lichened, hung with drapes
 if(lv===2&&clear>.15){const nd=Math.round(H*clear/3.5);for(let k=0;k<nd;k++){const u=rr(.12,clear),a=rr(0,TAU),y=T.y0+H*u,L=rr(.8,2.6)*Math.min(1.5,rb);
  const e=[T.x+Math.cos(a)*(rAt(u)+L),y-L*rr(.1,.4),T.z+Math.sin(a)*(rAt(u)+L)];BIO.beam('rod',[T.x,y,T.z],e,.07,.04,shade(rc,-.1));
  if(moss>.3&&rng()<moss)drape(e[0],e[1],e[2],rr(1.2,3.6),false);else if(lichen>.2&&rng()<lichen)drape(e[0],e[1],e[2],rr(.6,1.6),true);}}
 const step=f.step*(lv===2?1:3)*Math.max(.8,Math.min(1.25,H/40)),y0c=H*clear,top=H*.96;let spread=0;
 const flat=f.top==='flat'&&H>S.H[0]*1.1;
 for(let y=y0c,t=0;y<top;y+=step*rr(.85,1.15),t++){const v=(y-y0c)/(top-y0c),Rt=Math.max(.5,R*(flat&&v>.8?Math.max(prof(v),.42):prof(v))*rr(.85,1.12)),nB=lv===2?(Rt>3?ri(4,5):ri(3,4)):3,a0=t*GOLD+rr(-.3,.3);
  for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.2,.2),el=lerp(.18,-.4,f.droop)*(1-v)+v*.45,L=Rt*rr(.85,1.08);
   const sx=T.x,sz=T.z,sy=T.y0+y,d=dirOf(a,el),ex=sx+d[0]*L,ey=sy+d[1]*L-f.droop*L*.18,ez=sz+d[2]*L;
   if(lv===2&&L>1.6)BIO.beam('rod',[sx,sy,sz],[ex,ey,ez],Math.min(.22,rb*.07+.03),.03,rc);
   if(lv<2&&S.item!=='spray'){const sz2=Math.max(1.4,Rt*1.45);clumpAt(S.item,sx+d[0]*Rt*.35,sy+sz2*.1,sz+d[2]*Rt*.35,sz2,.75,hc,T.x,T.y0+y,T.z,Rt+1,Math.max(2,step));st.clumps++;spread=Math.max(spread,L);if(snow>0&&rng()<snow*.8)BIO.put('needle',[sx+d[0]*Rt*.35,sy+sz2*.4,sz+d[2]*Rt*.35],qEuler(0,rr(0,TAU),0),[sz2*.8,sz2*.25,sz2*.8],bright(C(pick(PAL.snow)),1),{n:[0,1,0]});continue;}
   if(S.item==='spray'){const n=lv===2?(L>3?4:3):2;for(let c=0;c<n;c++){const fr=.2+.7*(c+1)/n;sprayAt(sx+d[0]*L*fr*.6,sy+d[1]*L*fr*.6-f.droop*L*.06,sz+d[2]*L*fr*.6,a+rr(-.5,.5),L*rr(.6,.85),-f.droop*rr(.4,.9)+.1,bright(hc,rr(.85,1.12)));st.sprays++;}}
   else{const n=lv===2?(L>3.4?4:L>1.8?3:2):1;for(let c=0;c<n;c++){const fr=n===1?.65:.25+.72*c/(n-1),sz2=Math.max(1.3,L*rr(.62,.8))*(f.sparse?.8:1);
     clumpAt(S.item,sx+(ex-sx)*fr,sy+(ey-sy)*fr+sz2*.05,sz+(ez-sz)*fr,sz2,f.sparse?.45:.62,hc,T.x,T.y0+y,T.z,Rt+1,Math.max(2,step),null);st.clumps++;}
    if(f.curtain&&lv===2&&L>2)for(let c=0;c<2;c++){const fr=rr(.4,.9);sprayAt(sx+(ex-sx)*fr,sy+(ey-sy)*fr,sz+(ez-sz)*fr,a+rr(-.6,.6),rr(1,1.8),-1.25,bright(hc,.9));st.sprays++;}}
   // SNOW on the upper side of the high boreal crowns
   if(snow>0&&rng()<snow*.9){const fr=rr(.35,.8);BIO.put('needle',[sx+(ex-sx)*fr,sy+(ey-sy)*fr+.25,sz+(ez-sz)*fr],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[L*.6,L*.18,L*.6],bright(C(pick(PAL.snow)),1),{n:[0,1,0]});st.snow++;}
   if(lichen>.2&&lv===2&&v<.6&&rng()<lichen*.35)drape(ex,ey,ez,rr(.5,1.4),true);
   if(moss>.4&&lv===2&&v<.35&&rng()<moss*(f.drape||0)*.6)drape(sx+(ex-sx)*.6,sy+(ey-sy)*.6,sz+(ez-sz)*.6,rr(1.4,4),false);
   spread=Math.max(spread,L);}}
 // the top
 const ty=T.y0+H*.97;
 if(f.top==='candelabra'&&lv===2){for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),o=[T.x+Math.cos(a)*rb*.3,T.y0+H*rr(.82,.9),T.z+Math.sin(a)*rb*.3],e=[o[0]+Math.cos(a)*rr(1,3),o[1]+rr(4,9),o[2]+Math.sin(a)*rr(1,3)];
   BIO.beam('rod',o,e,rb*.12,.08,rc);for(let c=0;c<3;c++)sprayAt(e[0],e[1]-c*1.2,e[2],rr(0,TAU),rr(2,3.2),rr(-.6,-.2),bright(hc,1.05));}}
 else if(f.top==='nod'){sprayAt(T.x,ty,T.z,rr(0,TAU),rr(2,3.4),-.9,bright(hc,1.05));}
 else{const n=flat?3:1;for(let c=0;c<n;c++)clumpAt(S.item,T.x+(flat?rr(-1.5,1.5):0),ty+(flat?-.5:0),T.z+(flat?rr(-1.5,1.5):0),flat?R*.45:Math.max(1,R*.22),flat?.4:1.1,hc,T.x,ty-2,T.z,2,2);
  if(snow>.3)BIO.put('needle',[T.x,ty+.3,T.z],qEuler(0,rr(0,TAU),0),[1,.5,1],bright(C(pick(PAL.snow)),1),{n:[0,1,0]});}
 if(lv===2&&moss>.5&&T.wet>.8&&rng()<.12)glowCluster(T.x+rr(-2,2)+Math.cos(T.seed)*rb*2,T.y0+H*clear*rr(.6,1),T.z+Math.sin(T.seed)*rb*2,ri(3,6),st,.2);
 T.spread=Math.max(R,spread);reg(S,T,T.spread);};

// BROAD: the moss maple, the blue beech, the mountain maple, the grey alder, the rowan. One to three stems,
// boughs that fork once, clumps on the spots; the moss maple hung with curtains of moss and carrying moss
// on every bough's upper side; bell-bulbs under the boughs now and then.
B.broad=function(T,st,lv){const S=SP[T.sp],f=S.form,H=T.H,rb=T.rb;const ns=f.stems?ri(f.stems[0],f.stems[1]):1,moss=(f.moss||0)*T.wet*smooth(.6,.3,T.cold),hc=vary(pick(S.leaf),.02,.06,.05),spots=[];
 for(let s=0;s<ns;s++){const la=rr(0,TAU),lk=ns>1?rr(.04,.12):rr(0,.03),rbs=rb*(ns>1?.75:1);
  const rAt=u=>rbs*(1-.6*u)*(1+(f.roots?.6:.35)*Math.exp(-u*H/2.5));
  const T2=ns>1?Object.assign({},T,{x:T.x+Math.cos(la)*rbs*.8,z:T.z+Math.sin(la)*rbs*.8}):T;
  const hB=H*f.hB*rr(.85,1.15),top=bole(T2,S,hB,rAt,{lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:5,buttress:f.roots?.55:.2,bh:f.roots?1.6:2,nb:5,flutes:f.roots?5:0,fluteA:f.roots?.05:0,moss:moss,seg:lv===2?10:7});
  const nB=lv===2?ri(f.boughs[0],f.boughs[1]):3,a0=rr(0,TAU),cy=T.y0+H*.72;
  for(let k=0;k<Math.max(2,Math.round(nB/ns+.4));k++){const a=a0+k*GOLD+rr(-.3,.3),u=rr(.8,1),L=T.crownR*rr(f.L[0],f.L[1])*(ns>1?.8:1),r0=clamp(rAt(hB/H)*.5,.1,.7);
   const pts=treeGrow({x:top.x,y:top.y-rr(.5,2.5)*u,z:top.z},dirOf(a,rr(f.el[0],f.el[1])),L,r0,.08,5,f.curve,f.wig);if(!limbOk(pts,1))continue;
   const lc=mossy(S,T,k,moss*.6);
   if(lv===2){limb(S,pts,st,{seg:r0>.4?6:5,col:lc});
    // one fork
    if(L>5){const p=pts[3],fk=treeGrow({x:p.x,y:p.y,z:p.z},dirOf(a+rr(-1,1),rr(f.el[0],f.el[1]+.2)),L*.45,p.r*.7,.06,3,f.curve,f.wig);if(limbOk(fk,1)){limb(S,fk,st,{seg:4,col:lc});for(let i=1;i<=3;i++)spots.push(fk[i]);}}
    if(moss>.3)for(let i=1;i<4;i++)if(rng()<moss)mossOn(pts[i],st,pts[i].r*rr(2.5,4));
    if(f.drape&&moss>.3)for(let i=1;i<5;i++)if(rng()<f.drape*moss*.85){const p=pts[i];drape(p.x+rr(-.4,.4),p.y-p.r,p.z+rr(-.4,.4),rr(1.5,5.5)*(f.drape>.8?1.2:.8),false);st.drapes++;}
    if(f.bulbs&&rng()<f.bulbs){const p=pts[ri(2,4)];glowCluster(p.x,p.y-p.r,p.z,ri(3,8),st);}}
   else BIO.beam('rod',P3(pts[0]),P3(pts[5]),r0,.08,rodCol(S,k));
   for(let i=2;i<=5;i++)spots.push(pts[i]);}
  spots.push({x:top.x,y:T.y0+H*.95,z:top.z});}
 const cnt=lv===2?2:1,cx=T.x,cy=T.y0+H*.72;
 spots.forEach(p=>{for(let c=0;c<cnt;c++){const sz=rr(f.clump[0],f.clump[1]);clumpAt(S.item,p.x+rr(-1.2,1.2),p.y+rr(-.3,1.2),p.z+rr(-1.2,1.2),sz,.58,hc,cx,cy,T.z,T.crownR,H*.28);st.clumps++;
  if(f.berries&&lv>=1&&rng()<.6)for(let b=0,m=lv===2?ri(5,10):3;b<m;b++)BIO.put('berry',[p.x+rr(-1,1),p.y+rr(-.6,.4),p.z+rr(-1,1)],null,rr(.06,.09),bright(C(pick(PAL.berry)),1.1));}});
 T.spread=T.crownR;reg(S,T);};

// GNARL: the gnarled oak (one or two contorted stems, low twisting limbs, mossed to the tips) and the fog
// laurel (many twisting stems from one foot). Wistman's Wood and the laurisilva in the fog.
B.gnarl=function(T,st,lv){const S=SP[T.sp],f=S.form,H=T.H,rb=T.rb,ns=ri(f.stems[0],f.stems[1]),hc=vary(pick(S.leaf),.02,.06,.05),moss=(f.moss||0)*mix(.6,1,T.wet),spots=[];
 const laurel=ns>2;
 for(let s=0;s<ns;s++){const la=rr(0,TAU)+s*TAU/ns,lean=laurel?rr(.15,.45):rr(.05,.3),hT=laurel?H*rr(.55,.85):H*rr(.28,.42),n=6,pts=[];const wig=f.wig*hT;
  for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(t*Math.PI*rr(1,2)+s)*wig*.35;pts.push({x:T.x+Math.cos(la)*(lean*hT*t+(laurel?.3:0))+Math.cos(la+1.6)*w,y:T.y0-.3+hT*t,z:T.z+Math.sin(la)*(lean*hT*t+(laurel?.3:0))+Math.sin(la+1.6)*w,r:(laurel?rb:rb*(ns>1?.75:1))*(1-.45*t)*(1+.5*Math.exp(-t*7))});}
  const sc=mossy(S,T,s,moss*.75);limb(S,pts,st,{seg:lv===2?8:5,flutes:4,fluteA:.14,twist:.9,col:sc});
  if(lv===2)for(let i=1;i<n;i++)if(rng()<moss*.8)mossOn(pts[i],st,pts[i].r*rr(2.5,4));
  const top=pts[n],nl=laurel?ri(f.limbs[0],f.limbs[1]):ri(f.limbs[0],f.limbs[1]);
  for(let k=0;k<nl;k++){const a=la+rr(-1.6,1.6)+k*GOLD,L=T.crownR*rr(.55,1.05)*(laurel?.6:1),o=pts[Math.max(2,n-ri(0,2))];
   const lp=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(f.el[0],f.el[1])),L,o.r*.65,.07,5,laurel?-.05:-.12,f.wig);if(!limbOk(lp,.8))continue;
   if(lv===2){limb(S,lp,st,{seg:5,flutes:3,fluteA:.12,twist:1.1,col:mossy(S,T,k,moss*.7)});
    for(let i=1;i<5;i++){if(rng()<moss*.9)mossOn(lp[i],st,lp[i].r*rr(2.5,4.5));if(rng()<moss*f.drape*.45)drape(lp[i].x,lp[i].y-lp[i].r,lp[i].z,rr(1,3.4),T.cold>.5);}
    if(rng()<f.bulbs){const p=lp[ri(2,4)];glowCluster(p.x,p.y-p.r,p.z,ri(3,7),st);}}
   else BIO.beam('rod',P3(lp[0]),P3(lp[5]),lp[0].r,.07,rodCol(S,k));
   for(let i=2;i<=5;i++)spots.push(lp[i]);}
  spots.push(top);}
 const cnt=lv===2?2:1,cy=T.y0+H*.7;
 spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt(S.item,p.x+rr(-1,1),p.y+rr(-.2,1),p.z+rr(-1,1),rr(2,3.4),.55,hc,T.x,cy,T.z,T.crownR,H*.3);st.clumps++;}});
 T.spread=T.crownR;reg(S,T);};

// YEW: a short, enormous, fluted and hollowed bole (purple-red), a low wide dome of near-black needles,
// red arils here and there. The darkest thing under the canopy.
B.yew=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.5*u)*(1+.35*Math.exp(-u*H/1.5));
 const hB=H*rr(.28,.38),top=bole(T,S,hB,rAt,{flutes:6,fluteA:.24,twist:rr(.3,.7),buttress:.6,bh:1.2,nb:5,vs:1.5,seg:lv===2?18:10,urep:1.5,moss:.5});
 const hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.6,nL=lv===2?ri(5,8):3,a0=rr(0,TAU),spots=[];
 for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,1),z:top.z},dirOf(a,rr(.2,.8)),T.crownR*rr(.6,.95),rAt(hB/H)*.4,.08,4,-.06,.2);
  if(lv===2)limb(S,pts,st,{seg:6,flutes:3,fluteA:.15,twist:.8});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),pts[0].r,.08,rodCol(S,k));for(let i=1;i<=4;i++)spots.push(pts[i]);}
 spots.push({x:T.x,y:T.y0+H*.92,z:T.z});
 spots.forEach(p=>{for(let c=0,m=lv===2?3:1;c<m;c++){clumpAt('needle',p.x+rr(-1.4,1.4),p.y+rr(-.6,1.2),p.z+rr(-1.4,1.4),rr(2.6,3.8),.6,hc,T.x,cy,T.z,T.crownR,H*.35);st.clumps++;}
  if(lv===2&&rng()<.35)for(let b=0;b<4;b++)BIO.put('berry',[p.x+rr(-1.5,1.5),p.y+rr(-.8,.4),p.z+rr(-1.5,1.5)],null,rr(.05,.07),bright(C(0xd0202a),1.1));});
 T.spread=T.crownR;reg(S,T);};

// BIRCH: two to five white stems leaning out of one foot, fine drooping twigs, a light high crown
B.birch=function(T,st,lv){const S=SP[T.sp],H=T.H,ns=lv===2?ri(2,5):2,hc=vary(pick(S.leaf),.02,.06,.05),lichen=smooth(.55,.8,T.cold)*.5;
 for(let s=0;s<ns;s++){const la=rr(0,TAU)+s*TAU/ns,lk=rr(.02,.09),Hs=H*rr(.8,1.05),rb=T.rb*rr(.75,1.1);
  const T2=Object.assign({},T,{x:T.x+Math.cos(la)*.25,z:T.z+Math.sin(la)*.25,H:Hs});
  const rAt=u=>rb*(1-.75*u)*(1+.3*Math.exp(-u*Hs/1.2));
  const top=bole(T2,S,Hs*.92,rAt,{lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:3,seg:lv===2?8:6,col:yy=>{const c=barkCol(S,0);if(yy<1.2)c.lerp(C(0x2a2622),.55*(1-yy/1.2));return c;}});
  const n=lv===2?ri(5,8):3;for(let k=0;k<n;k++){const u=rr(.45,.95),a=rr(0,TAU),y=T2.y0+Hs*u,bx=T2.x+Math.cos(la)*lk*Hs*u,bz=T2.z+Math.sin(la)*lk*Hs*u,L=T.crownR*rr(.5,1)*(1.1-u*.4);
   const e=[bx+Math.cos(a)*L,y+rr(-.5,1.2),bz+Math.sin(a)*L];if(lv===2)BIO.beam('rod',[bx,y,bz],e,.06,.025,C(0x4a3e3a));
   for(let c=0,m=lv===2?2:1;c<m;c++){const fr=rr(.45,1);clumpAt('birch',bx+(e[0]-bx)*fr,e[1]-rr(0,.6),bz+(e[2]-bz)*fr,rr(1.8,2.8),.6,hc,T.x,T.y0+H*.75,T.z,T.crownR,H*.3);st.clumps++;}
   if(lichen>.2&&lv===2&&rng()<lichen)drape(e[0],e[1],e[2],rr(.4,1.1),true);}
  clumpAt('birch',top.x,top.y+.5,top.z,2.2,.8,hc,top.x,top.y,top.z,2,2);}
 T.spread=T.crownR;reg(S,T);};

// PINE (the crag pine): a leaning, curving trunk, grey plates low and orange flakes above, a few heavy
// limbs at the top ending in flat umbrella pads of needles (the pines on the rock pillar)
B.pine=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=T.lean!=null?T.lean:rr(0,TAU),bend=rr(.04,.14)*H,n=7,pts=[];
 for(let i=0;i<=n;i++){const t=i/n,s=Math.sin(t*Math.PI*.8)*bend;pts.push({x:T.x+Math.cos(la)*s,y:T.y0-.3+H*.82*t,z:T.z+Math.sin(la)*s,r:rb*(1-.65*t)*(1+.4*Math.exp(-t*8))});}
 for(let i=0;i<n;i++){const a=pts[i],b=pts[i+1],col=(i/n<.35)?barkCol(S,2).lerp(C(0x6a625a),.6):barkCol(S,i%2);st.limb+=BIO.tube(fam(S),[a,b],col,{seg:lv===2?8:6,cap:i===n-1});}
 const hc=vary(pick(S.leaf),.02,.06,.05),top=pts[n],nL=lv===2?ri(3,6):3,a0=rr(0,TAU);let spread=T.crownR*.5;
 const pad=(x,y,z,R)=>{const m=lv===2?ri(3,6):2;for(let c=0;c<m;c++){const a=rr(0,TAU),d=R*.5*Math.sqrt(rng());clumpAt('needle',x+Math.cos(a)*d,y+rr(-.1,.3)*R*.3,z+Math.sin(a)*d,R*rr(.8,1.05),.42,hc,x,y-R*.4,z,R,R*.5);st.clumps++;}
  if(T.cold>.86&&rng()<.7)BIO.put('needle',[x,y+R*.25,z],qEuler(0,rr(0,TAU),0),[R*.9,R*.2,R*.9],bright(C(pick(PAL.snow)),1),{n:[0,1,0]});};
 for(let k=0;k<nL;k++){const i=n-ri(1,3),p=pts[i],a=a0+k/nL*TAU+rr(-.4,.4),L=T.crownR*rr(.5,1),e=[p.x+Math.cos(a)*L,p.y+rr(.5,2.5),p.z+Math.sin(a)*L];
  if(!clear3(e[0],e[1],e[2],1.5,1))continue;
  const lp=arc([p.x,p.y,p.z],[(p.x+e[0])/2,p.y+rr(.5,1.5),(p.z+e[2])/2],e,p.r*.55,.08,3);
  if(lv===2)st.limb+=BIO.tube(fam(S),lp,barkCol(S,0),{seg:5,cap:true});else BIO.beam('rod',[p.x,p.y,p.z],e,p.r*.5,.08,barkCol(S,0));
  pad(e[0],e[1]+.2,e[2],rr(1.6,2.8)*Math.min(1.3,H/18));spread=Math.max(spread,L+2);}
 pad(top.x,top.y+.3,top.z,rr(1.8,2.8)*Math.min(1.3,H/18));
 T.spread=spread;reg(S,T,spread);};

// SNAG: a standing dead bole from the old burn -- black and checked low, silver-grey where weathered,
// a broken top and a few stubs
B.snag=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.04);
 bole(T,S,H*rr(.85,1),u=>rb*(1-.6*u),{lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:4,seg:lv===2?8:6,col:yy=>C(0x1e1c1a).lerp(C(0xb8b4aa),smooth(H*.15,H*.6,yy+rr(-2,2))*.8)});
 if(lv===2)for(let k=0,m=ri(2,6);k<m;k++){const u=rr(.3,.85),a=rr(0,TAU),y=T.y0+H*u,L=rr(.6,2.4);BIO.beam('rod',[T.x+Math.cos(la)*lk*H*u,y,T.z+Math.sin(la)*lk*H*u],[T.x+Math.cos(a)*L,y+rr(-.3,.8),T.z+Math.sin(a)*L],.08,.03,C(0x8a8680));}
 T.spread=1.5;reg(S,T,2);};

// KRUMM (the wind spruce): a squat, flagged spruce: branches only on the lee side (the wind is from the
// north-west), a skirt of layered branches at the ground, snow on everything
B.krumm=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,lee=Math.atan2(1,1)+rr(-.4,.4),hc=vary(pick(S.leaf),.02,.05,.04),snow=smooth(.85,.97,T.cold);
 bole(T,S,H,u=>rb*(1-.7*u),{lean:[Math.cos(lee)*.12,Math.sin(lee)*.12],vs:1,seg:6});
 const n=lv===2?ri(5,9):3;for(let k=0;k<n;k++){const u=rr(0,.95),a=lee+rr(-1,1)*(u<.3?2.2:.9),L=(u<.3?T.crownR*1.3:T.crownR)*(1-u*.6)*rr(.6,1),x=T.x+Math.cos(a)*L*.55+Math.cos(lee)*.12*H*u,y=T.y0+H*u+.3,z=T.z+Math.sin(a)*L*.55+Math.sin(lee)*.12*H*u;
  clumpAt('needle',x,y,z,Math.max(.9,L*.8),.5,hc,T.x,T.y0+H*.4,T.z,T.crownR,H*.5);st.clumps++;
  if(rng()<snow)BIO.put('needle',[x,y+.25,z],qEuler(0,rr(0,TAU),0),[L*.7,L*.25,L*.7],bright(C(pick(PAL.snow)),1),{n:[0,1,0]});}
 T.spread=T.crownR;};

// WILLOW (the brook willow): many thin stems arching out of one stool, leaning over the water, lance leaves
B.willow=function(T,st,lv){const S=SP[T.sp],H=T.H,ns=lv===2?ri(5,9):3,hc=vary(pick(S.leaf),.02,.06,.05),la=rr(0,TAU);
 for(let s=0;s<ns;s++){const a=la+rr(-1.4,1.4),reach=T.crownR*rr(.5,1.1),hh=H*rr(.6,1),o=[T.x+rr(-.3,.3),T.y0-.2,T.z+rr(-.3,.3)],e=[T.x+Math.cos(a)*reach,T.y0+hh*.8,T.z+Math.sin(a)*reach],c=[mix(o[0],e[0],.2),T.y0+hh*1.05,mix(o[2],e[2],.2)];
  const pts=arc(o,c,e,T.rb*rr(.5,.9),.04,4);if(lv===2)st.limb+=BIO.tube(fam(S),pts,mossy(S,T,s,.25),{seg:4,cap:true});else BIO.beam('rod',o,e,T.rb*.6,.05,rodCol(S,s));
  for(let i=2;i<=4;i++){const p=pts[i];clumpAt('lance',p.x+rr(-.6,.6),p.y+rr(-.4,.4),p.z+rr(-.6,.6),rr(1.4,2.2),.55,hc,T.x,T.y0+H*.6,T.z,T.crownR,H*.35);st.clumps++;}}
 T.spread=T.crownR;reg(S,T);};

// THE TRUMPETS
// a funnel at p (a point on the arm's tip): a ribbed lathe flaring from the arm's radius r0 to R, the rim
// turned out, a fringe of fins round it, the floor closed in violet. dead: a broken, rimless ring.
function funnel(p,r0,R,depth,S,st,lv,dead,o){o=o||{};const nR=lv===2?(S.ribs||12):Math.min(7,S.ribs||12),seg=nR*3,ph=rr(0,TAU),n=lv===2?5:3;   // three segments a rib (the Rift's lesson); fewer ribs at mid range
 const leaf=vary(pick(o.leaf||S.leaf),.015,.05,.04),rim=C(pick(o.rim||PAL.trumpetRim)),throat=C(pick(PAL.throat)),stalk=barkCol(S,1);
 const rings=[];
 for(let i=0;i<=n;i++){const u=i/n,fl=Math.pow(u,1.9),r=lerp(r0,R,fl),yy=depth*u;let c=stalk.clone().lerp(leaf,smooth(.15,.7,u));if(u>.8)c.lerp(rim,smooth(.8,1,u)*.8);if(dead)c.lerp(C(0x6a5a40),.55);
  rings.push({x:p.x,y:p.y+yy,z:p.z,r:r,yy:yy*3,col:c});}
 if(!dead)rings.push({x:p.x,y:p.y+depth+R*.04,z:p.z,r:R*1.05,yy:depth*3+1,col:bright(rim,1.2)},{x:p.x,y:p.y+depth-R*.10,z:p.z,r:R*.82,yy:depth*3+2,col:leaf.clone().lerp(throat,.4)},
  {x:p.x,y:p.y+depth*.35,z:p.z,r:R*.28,yy:depth*3+3,col:throat},{x:p.x,y:p.y+depth*.3,z:p.z,r:.04,yy:depth*3+4,col:shade(throat,-.3)});
 else rings.push({x:p.x,y:p.y+depth*.9,z:p.z,r:R*.9,yy:depth*3+1,col:C(0x4a3e2e)},{x:p.x,y:p.y+depth*.3,z:p.z,r:.04,yy:depth*3+2,col:C(0x2e2620)});
 st.trunk+=BIO.lathe('nfunnel',rings,seg,Math.max(1,Math.round(TAU*R/3)),3,(Rg,ang)=>Rg.r*(1+.07*Math.cos(nR*ang+ph)*(dead?1+.6*Math.sin(ang*3+ph):1)),(Rg,ang)=>.8+.2*Math.cos(nR*ang+ph));
 if(!dead&&lv>=1){const nf=lv===2?Math.round(TAU*R/(o.finStep||.75)):Math.round(TAU*R/2.2),ph2=rr(0,TAU),fc=bright(rim,1.15),c2=C(pick(PAL.irid.TV));
  for(let k=0;k<nf;k++){const a=ph2+k/nf*TAU,x=p.x+Math.cos(a)*R*1.04,z=p.z+Math.sin(a)*R*1.04,y=p.y+depth+R*.03,L=R*rr(.18,.3)*(o.finK||1);
   BIO.put('fin',[x,y,z],qEuler(rr(-.1,.1),-a,rr(.15,.55)),[L,L,L*rr(.7,1)],fc,{n:[Math.cos(a),.5,Math.sin(a)],c2});st.fins++;}}
 return{x:p.x,y:p.y+depth,z:p.z};}
// GREAT TRUMPET: a short, massive, buttressed bole that twists as it climbs, three to seven writhing arms,
// a funnel four to nine metres across on each (the tallest crowns the bole), moss on the arms, bell-bulbs and
// lantern pods hung under the rims
B.greattrumpet=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,sw=rr(.6,1.4),ph=rr(0,TAU),swA=rr(.6,1.6);
 const rAt=u=>rb*(1-.5*u)*(1+.8*Math.exp(-u*H/2.4));
 const hB=H*rr(.24,.34),wob=yy=>[Math.cos(yy*.09*sw+ph)*swA*(yy/hB),Math.sin(yy*.07*sw+ph)*swA*(yy/hB)];
 const top=bole(T,S,hB,rAt,{flutes:7,fluteA:.16,twist:rr(.08,.16)*(rng()<.5?-1:1),buttress:1.2,bh:2.2,nb:6,vs:2.5,seg:lv===2?20:10,urep:2,moss:.9,wob});
 const nA=lv===2?ri(S.arms[0],S.arms[1]):ri(3,4),a0=rr(0,TAU);let spread=T.crownR*.5;
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),reach=rr(.35,1)*T.crownR*.85,rise=H*rr(.45,1)-hB,R=rr(4,9)*Math.min(1.25,H/40),r0=rAt(hB/H)*rr(.32,.45);
  const o=[top.x+Math.cos(a)*rAt(hB/H)*.5,top.y-rr(.5,2.5),top.z+Math.sin(a)*rAt(hB/H)*.5],e=[T.x+Math.cos(a)*reach,T.y0+hB+rise,T.z+Math.sin(a)*reach];
  const pts=treeGrow({x:o[0],y:o[1],z:o[2]},[(e[0]-o[0]),(e[1]-o[1]),(e[2]-o[2])].map((v,i,A)=>v/Math.hypot(A[0],A[1],A[2])),Math.hypot(e[0]-o[0],e[1]-o[1],e[2]-o[2]),r0,r0*.55,6,-.08,.22);
  if(!limbOk(pts,R*.5))continue;
  limb(S,pts,st,{fam:'nbark5',seg:lv===2?9:6,flutes:5,fluteA:.12,twist:.6,col:mossy(S,T,k,.35)});
  if(lv===2)for(let i=1;i<6;i++){if(rng()<.75)mossOn(pts[i],st,pts[i].r*rr(2.5,4));if(rng()<.25)drape(pts[i].x,pts[i].y-pts[i].r,pts[i].z,rr(1,3),false);}
  const tip=pts[6],dead=rng()<.12;funnel(tip,tip.r,R,R*rr(.55,.75),S,st,lv,dead);
  if(lv>=1&&!dead){const nc=lv===2?ri(2,5):1;for(let c=0;c<nc;c++){const aa=rr(0,TAU),d=R*rr(.6,1.0);glowCluster(tip.x+Math.cos(aa)*d,tip.y+R*rr(.15,.4),tip.z+Math.sin(aa)*d,lv===2?ri(4,9):3,st,.3);}}
  spread=Math.max(spread,reach+R);}
 // the crowning funnel
 const R0=rr(4.5,7)*Math.min(1.25,H/40),cTop={x:top.x,y:top.y,z:top.z,r:rAt(hB/H)*.5};
 const neck=arc([top.x,top.y-1,top.z],[top.x+rr(-2,2),top.y+H*.2,top.z+rr(-2,2)],[top.x+rr(-3,3),T.y0+H*.92-R0*.6,top.z+rr(-3,3)],cTop.r,cTop.r*.6,4);
 limb(S,neck,st,{fam:'nbark5',seg:lv===2?9:6,flutes:5,fluteA:.1,twist:.5,col:mossy(S,T,9,.3)});
 const nt=neck[4];funnel(nt,nt.r,R0,R0*.65,S,st,lv,false);
 if(lv===2)glowCluster(nt.x+R0*.8,nt.y+R0*.3,nt.z,ri(4,8),st,.3);
 T.spread=spread;reg(S,T,spread);};
// UNDERSTOREY TRUMPET: the Rift's form made gnarled: a leaning, kinked stalk (two or three from one foot
// now and then), one funnel each. BOREAL TRUMPET: squat and thick-walled, a narrow deep funnel, a blue-grey
// bloom on the rim.
B.trumpet=function(T,st,lv){const S=SP[T.sp],H=T.H,frost=!!S.frost,ns=frost?1:(rng()<.3?ri(2,3):1);let spread=T.crownR;
 for(let s=0;s<ns;s++){const la=rr(0,TAU),lean=frost?rr(0,.08):rr(.05,.3),Hs=H*(s?rr(.55,.85):1),n=frost?3:4,pts=[];const kink=rr(-1,1);
  for(let i=0;i<=n;i++){const t=i/n,kk=Math.sin(t*Math.PI*1.5)*kink*.12*Hs;pts.push({x:T.x+Math.cos(la)*(lean*Hs*t)+Math.cos(la+1.6)*kk,y:T.y0-.2+Hs*t*(frost?.62:.8),z:T.z+Math.sin(la)*(lean*Hs*t)+Math.sin(la+1.6)*kk,r:T.rb*(s?.7:1)*(1-.35*t)*(1+(frost?.5:.35)*Math.exp(-t*5))});}
  st.limb+=BIO.tube('nbark5',pts,mossy(S,T,s,frost?.05:.3),{seg:lv===2?(frost?9:7):5,cap:false,rfn:(i,ang)=>1+.08*Math.cos((S.ribs||12)*ang)});
  const tip=pts[n],R=T.crownR*(s?rr(.5,.8):rr(.75,1.05)),dead=!frost&&rng()<.06;
  funnel(tip,tip.r,R,R*(frost?rr(.9,1.2):rr(.5,.7)),S,st,lv,dead,frost?{leaf:S.leaf,rim:[0x8aa4b0,0x9ab2bc,0x7a94a0],finK:.6,finStep:1.1}:null);
  if(lv===2&&!frost&&!dead&&rng()<.22)glowCluster(tip.x+R*.8,tip.y+R*.4,tip.z,ri(2,5),st,.35);
  if(lv===2&&!frost&&rng()<.4)mossOn(pts[1],st,pts[1].r*3);}
 T.spread=spread;if(lv===2||T.H>8)reg(S,T,spread);};

// ---------------------------------------------------------------- impostors (the far canopy)
// Each tree past the spine: a trunk of a few quads and one to three blobs by its habit
const HABIT=S=>S.habit==='conifer'?(S.form.crown==='spire'?'spire':S.form.crown==='dome'?'tall':'cone'):S.habit==='greattrumpet'?'cups':S.habit==='trumpet'?'cup':S.habit==='snag'?'snag':S.habit==='krumm'?'lump':S.habit==='pine'?'umbrella':S.habit==='gnarl'||S.habit==='yew'?'low':'dome';
let ICO=null,ICO0=null;
function buildFar(T,fi,st,lite){const K=BIO.bucket('nfar');if(!ICO){ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;}const ip=(lite||BIO.lodD(T.x,T.z)>1000)?ICO0:ICO;
 const S=SP[T.sp],hb=HABIT(S);let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.48+.52*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=shade(C(S.bark[fi%S.bark.length]),-.1).convertSRGBToLinear(),seg=3,top=T.y0+T.H*(hb==='cone'||hb==='spire'||hb==='tall'||hb==='snag'?.95:.55),rings=[];
 [0,.5,1].forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.3,T.rb*(1-.6*u)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<2;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.7+.3*r2/2;
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 if(hb!=='snag'){const L=S.leaf.length?S.leaf:[0x445544],A=bright(L[fi%L.length],.85),Bc=bright(L[(fi+1)%L.length],.7),R=T.crownR*(lite?1:1/Math.sqrt(Math.max(.3,BIO.lod(T.x,T.z))));
  if(hb==='cone')blob(T.x,T.y0+T.H*.62,T.z,R*.75,T.H*.36,A,Bc,fi);
  else if(hb==='spire')blob(T.x,T.y0+T.H*.55,T.z,R*.8,T.H*.45,A,Bc,fi);
  else if(hb==='tall')blob(T.x,T.y0+T.H*.68,T.z,R*.85,T.H*.3,A,Bc,fi);
  else if(hb==='umbrella')blob(T.x,T.y0+T.H*.85,T.z,R,T.H*.14,A,Bc,fi);
  else if(hb==='low')blob(T.x,T.y0+T.H*.6,T.z,R,T.H*.32,A,Bc,fi);
  else if(hb==='lump')blob(T.x,T.y0+T.H*.4,T.z,R,T.H*.45,A,Bc,fi);
  else if(hb==='cups'){for(let k=0;k<3;k++){const a=(T.seed%628)/100+k/3*TAU;blob(T.x+Math.cos(a)*R*.5,T.y0+T.H*(.7+.12*(k%2)),T.z+Math.sin(a)*R*.5,R*.36,T.H*.07,A,0x7a5aa8,fi+k);}}
  else if(hb==='cup')blob(T.x,T.y0+T.H*.85,T.z,R,T.H*.12,A,0x6a5a98,fi);
  else blob(T.x,T.y0+T.H*.72,T.z,R*.9,T.H*.26,A,Bc,fi);}
 {const kk=BIO._lodKey(T.x,T.z);for(let i=0;i<tris;i++)K.k.push(kk);}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
NHL.buildTrees=function(R,q){
 reseed(550031);q=q==null?1:q;R=R||3300;means();
 const st={trunk:0,limb:0,far:0,clumps:0,sprays:0,snow:0,moss:0,drapes:0,glow:0,fins:0,heroes:0,fars:0,colonies:0,byS:SP.map(()=>0)};
 const TREES=NHL.TREES;TREES.length=0;NHL.COLONIES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x,z,y0:y-.4,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z),cold:BIO.field('cold',x,z)};};
 const lvOf=(x,z,hero,mid)=>{const ld=BIO.lodD(x,z);return ld<hero?2:(ld<mid?1:0);};
 function pass(key,cell,accept,opt){opt=opt||{};const sp=KEY[key];let n=0;
  BIO.grid(cell,0,R,(x,z)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;return a*(opt.lodK?lerp(1,BIO.lod(x,z),opt.lodK):1)*q;},
   (x,y,z)=>{if(blocked(x,z,opt.pad==null?4:opt.pad))return;if(!BIO.clearOf(x,z,(opt.pad==null?4:opt.pad)+2))return;
    const T=mk(x,y,z,sp);if(opt.mod)opt.mod(T,zones(x,z));
    T.lv=lvOf(x,z,opt.hero,opt.mid);if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x,z,r:T.rb*1.4+(opt.own||1)});n++;},{patch:opt.patch==null?.55:opt.patch,patchScale:opt.patchScale||.01,pad:1});
  return n;}
 // THE TRUMPET COLONIES: five to thirty understorey trumpets round one spot, suckering; the boreal trumpet in small knots
 BIO.grid(110,0,R,(x,z)=>{if(BIO.lodD(x,z)>520)return 0;const Z=zones(x,z);return ((Z.temperate*.8+Z.montane*.5)*(.15+.85*Z.colony)+Z.rip*.35*Z.temperate)*q;},(x,y,z)=>{
  const Z=zones(x,z),boreal=Z.boreal>.5&&Z.alpine<.4,sp=boreal?KEY.frosttrumpet:KEY.trumpet;if(Z.alpine>.4)return;
  const lvC=lvOf(x,z,300,520),nT=boreal?ri(3,8):(lvC===2?ri(8,28):ri(4,10)),rad=boreal?rr(6,12):rr(10,26),col={x,z,r:rad,n:0,sp,lv:lvC};if(lvC===0)return;
  for(let k=0;k<nT*2&&col.n<nT;k++){const a=rr(0,TAU),d=rad*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
   if(BIO.mask(px,pz)<.3||blocked(px,pz,.8)||!BIO.clearOf(px,pz,2))continue;
   const T=mk(px,Y(px,pz),pz,sp);T.H*=lerp(1.1,.6,d/rad)*rr(.85,1.1);T.lv=lvC;TREES.push(T);hadd({x:px,z:pz,r:T.rb*1.5+.8});col.n++;}
  if(col.n){NHL.COLONIES.push(col);st.colonies++;}},{patch:0,pad:2});
 // the temperate old growth: the giants first (they claim their ground), then the rest of the canopy. Density falls
 // off with distance from the spine (lodK) and the far trees' impostors are drawn larger to close the canopy.
 const BIG={hero:280,mid:560,far:true,lodK:1},SMALL={hero:240,mid:460,far:false,lodK:.6};
 const o=(base,more)=>Object.assign({},base,more);
 pass('greatspruce',54,Z=>Z.temperate*.6*(1-.5*Z.rip)*(1-Z.oldwood),o(BIG,{pad:5,own:5,patch:.3}));
 pass('cathedralcedar',56,Z=>Z.temperate*(.42+.3*Z.rip)*(1-Z.oldwood)+Z.montane*.06,o(BIG,{pad:5,own:5,patch:.3}));
 pass('greattrumpet',92,Z=>(Z.temperate*.66+Z.montane*.34)*(1-Z.rip*.5)*(1-Z.alpine),o(BIG,{hero:420,mid:820,pad:9,own:6,patch:.25}));
 pass('silverfir',50,Z=>Z.montane*.55+Z.temperate*.14,o(BIG,{pad:3.5,patch:.4}));
 pass('mossmaple',54,Z=>Z.temperate*(.26+.5*Z.rip+.2*Z.mist)*(1-Z.oldwood*.6),o(BIG,{pad:4,own:3,patch:.35}));
 pass('bluebeech',50,Z=>(Z.temperate*.34+Z.montane*.26)*(1-Z.oldwood),o(BIG,{pad:3.5,patch:.6,patchScale:.006}));
 pass('shadowhemlock',40,Z=>Z.temperate*.4+Z.montane*.16,o(BIG,{pad:2.5,patch:.4}));
 // the old wood on the boulder fields
 pass('gnarloak',24,Z=>Z.oldwood*.62,o(BIG,{pad:2.5,own:2,patch:.25}));
 pass('foglaurel',26,Z=>Z.oldwood*.3+Z.temperate*Z.mist*.08,o(SMALL,{pad:2,patch:.4}));
 pass('elderyew',70,Z=>Z.temperate*.08+Z.oldwood*.14,o(SMALL,{far:true,pad:3,patch:.5}));
 // the montane mix
 pass('normanspruce',38,Z=>Z.montane*.6+Z.boreal*.16*(1-Z.alpine),o(BIG,{pad:2.5,patch:.4}));
 pass('mountainmaple',52,Z=>Z.montane*.24+Z.temperate*Z.glade*.08,o(BIG,{pad:3,patch:.5}));
 // the boreal band
 pass('spirespruce',32,Z=>Z.boreal*(.62-.25*Z.alpine)*(1-Z.burn*.85),o(BIG,{pad:1.8,patch:.4}));
 pass('frostfir',36,Z=>Z.boreal*.4*smooth(.7,.9,Z.cold)*(1-Z.burn*.85),o(BIG,{pad:1.8,patch:.45}));
 pass('larch',48,Z=>(Z.boreal*.22+Z.montane*.05)*(1-Z.alpine)*(1-Z.burn*.5),o(BIG,{pad:2.5,patch:.6,patchScale:.006}));
 pass('birch',28,Z=>(Z.boreal*Z.grove*.6+Z.burn*.45+Z.montane*Z.grove*.12)*(1-Z.alpine),o(BIG,{pad:1.5,patch:.25}));
 pass('burnsnag',30,Z=>Z.burn*.6,o(BIG,{pad:1.5,patch:.2}));
 pass('cragpine',34,Z=>Z.crag*.6+Z.boreal*Z.rock*.2,o(BIG,{pad:2,patch:.4,mod:(T,Z)=>{T.lean=rr(0,TAU);}}));
 pass('windspruce',22,Z=>Z.alpine*.75,o(SMALL,{pad:1.2,patch:.4}));
 // the stream's banks
 pass('greyalder',26,Z=>Z.rip*.55*(1-Z.alpine),o(BIG,{pad:2.5,patch:.35}));
 pass('brookwillow',18,Z=>Z.rip*.45*(1-Z.alpine*.5),o(SMALL,{pad:1.6,patch:.4}));
 pass('rowan',48,Z=>(Z.temperate+Z.montane)*(.04+.25*Z.glade)+Z.boreal*Z.grove*.06,o(SMALL,{pad:2,patch:.5}));
 // build
 // runtime LOD: a hero tree is drawn in full while the camera is within NHL.LOD.tree metres of its chunk
 // and as a stand-in impostor past that; a far tree is only ever its impostor
 TREES.forEach((T,i)=>{BIO.owner=[T.x,T.z];const S=SP[T.sp];
  if(T.lv===0){BIO.range=null;BIO.minRange=0;buildFar(T,i,st,false);st.fars++;}
  else{BIO.range=NHL.LOD.tree;BIO.minRange=0;B[S.habit](T,st,T.lv);st.heroes++;
   if(T.H>7){BIO.range=1e9;BIO.minRange=NHL.LOD.tree;buildFar(T,i,st,true);}}
  st.byS[T.sp]++;});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,colonies:st.colonies,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),
  clumps:st.clumps,sprays:st.sprays,snow:st.snow,moss:st.moss,drapes:st.drapes,glow:st.glow,fins:st.fins,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
// approximate canopy top: the tallest crown over the point
NHL._canopyH=function(x,z){let h=0;for(const T of NHL.TREES){if(Math.abs(x-T.x)<30&&Math.abs(z-T.z)<30&&Math.hypot(x-T.x,z-T.z)<Math.max(4,T.crownR))h=Math.max(h,T.y0+T.H);}return h||(BIO.terrainH(x,z)+2);};
// one tree at a point (additive, for a world's own placement)
NHL.treeAt=function(x,y,z,key,opt){opt=opt||{};const sp=KEY[key];const S=SP[sp];if(!S)return null;means();
 const st=NHL._st||(NHL._st={trunk:0,limb:0,far:0,clumps:0,sprays:0,snow:0,moss:0,drapes:0,glow:0,fins:0,byS:SP.map(()=>0)});
 const T={x,z,y0:y-.4,sp,H:opt.H||rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:opt.wet==null?.85:opt.wet,cold:opt.cold==null?BIO.field('cold',x,z):opt.cold,lv:opt.lv==null?2:opt.lv,lean:opt.lean};
 if(opt.scale){T.H*=opt.scale;T.rb*=Math.pow(opt.scale,.8);T.crownR*=opt.scale;}
 const o0=BIO.owner;BIO.owner=[x,z];B[S.habit](T,st,T.lv);BIO.owner=o0;NHL.TREES.push(T);hadd({x,z,r:T.rb*1.4+1});return T;};
NHL._glowCluster=glowCluster;NHL._drape=drape;NHL._mossOn=mossOn;
})();
