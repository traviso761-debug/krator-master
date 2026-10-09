// ================================================================= THE THRONE — trees
// The twelve tree-scale species, each with its own builder, placed by zone from the host's fields and the age of the
// ground's last flow (46). The plume field turns the mix: the shoulder's ash pines, ruff trees, trumpet trees and star
// aloes on the clear side; gill-parasols and the wild Ranj trees on the seam; pagoda caps, drizzle trumpets,
// rope-trees and lamp caps under the plume; bone bells in the vents' steam. Beyond the LOD spine a tree becomes an
// impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=THRONE.SPECIES,PAL=THRONE.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=THRONE.C;
THRONE.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (wet, flow, rock, slope) and the Throne's own (plume, vent, acid, cinder, skylight, ash: BIOME-API),
// and the flow age (46). Each 0..1:
//   vent      steaming ground round a fumarole; halo its edge (where the Ranj trees stand)
//   marsh     the acid lake's and the hot pools' shores
//   sky       a skylight into the tube: its floor and walls
//   cinder    a cinder cone's loose flanks
//   gully     a barranco's floor
//   cliff     a sheer rock face (a flow's front, a crater wall): nothing roots there (the owner's rule: every zone x 1-cliff)
//   fresh / young / mature / old   the open ground by the age of its last flow (THRONE.stages)
//   alien     how far the life has turned to Krator's own (the plume, a little ragged); seam its middle (peaks at .5)
//   wetW/dryW the windward's wet climate against the shoulder's dry: the host's 'humid' field (the climate, not a damp
//             hollow: a gully on the dry shoulder is wet ground in a dry climate), or the 'wet' field where it has none
//   owned     ground another kit plants (the windward station's kipuka: the hyperjungle's); every open zone x 1-owned
//   kedge     the rim just inside a kipuka (the great ruffs, the frill trees); knear the young lava just outside one (its seedlings,
//             the lava casts of the trees the flow swallowed)
//   grove     the geyser isle's warm ground round its basin (stations/isle): where Ranj's fungus takes (NOTES.md:
//             "the isles' geyser ground"), so wild Ranj bears there, with tree ferns and arch palms
//   iwood     the isle's own forest (an island's: smaller trees, lehua, tree ferns, a few palms)
//   beach     the strip behind the isle's beaches (coconut palms, palm frill trees, leaning out to the sea)
//   cforest   the cloud forest's (stations/cloudforest): the elfin woods in the cloud belt
//   ashdeep   the ash desert's (stations/ashdesert): deep ash; the rope-trees and drizzle trumpets thin out on it
//   dz        the summit's death zone (stations/caldera): no trees; the cold pass plants only lichen, moss and the mat
//   rivbank   the glacier's river banks (the gill-corals crowd them)
//   cbelt / tundra / warm / snow   the glacier's (stations/glacier): the cold belt's woods, the bare moraine ground, the warm
//             ground round the fumaroles, how much snow lies (the trees are dusted by it; 0 elsewhere)
//   sulph     vent country's (stations/vents): sulphurous ground (the marsh, the vents' crusts, the cracks' lips, the steam
//             valley): the brimstone candelabras, reeds, acid pads and gas bladders
//   savanna / capwood / braid / burn   the south-flank savanna's (stations/savanna): the tall grass, the gill-parasol
//             woodland, the braided lahar channels' margins, a fresh burn. Where they are, the open stages stand down
const nz=(x,z)=>.22*(fbm(x*.004+11,z*.004-7,4741,2)-.5);
// the frontier station's fields (0 on every other page): field a plantation's ground, clear a fresh clearing (cut and
// burnt), coast the shore's strip, edge the forest's margin where it meets the clearings (the natives' poison gardens)
function zones(x,z){const F=n=>BIO.field(n,x,z);const owned=F('owned'),kedge=F('kedge'),knear=F('knear'),field=F('field'),clear=F('clear'),coast=F('coast'),edge=F('edge'),grove=F('grove'),iwood=F('iwood'),beach=F('beach'),cforest=F('cforest');
 // the savanna station's (stations/savanna): it zones all its ground itself, so the open stages stand down there
 const ashdeep=F('ashdeep'),sulph=F('sulph'),rivbank=F('rivbank'),dz=F('deathzone'),cbelt=F('cbelt'),tundra=F('tundra'),warm=F('warm'),snow=F('snow'),sav=F('savanna'),capw=F('capwood'),braid=F('braid'),burn=F('burn'),savAll=Math.min(1,sav+capw+braid);
 const plume=F('plume'),vent=F('vent'),acid=F('acid'),cin=F('cinder'),skl=F('skylight'),gully=F('flow'),rock=F('rock'),slope=F('slope'),wet=F('wet'),ash=F('ash');
 const age=THRONE.ageAt(x,z),S=THRONE.stages(age);
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),barren=F('barren'),live=(1-cliff)*(1-barren);
 const alien=smooth(.25,.78,plume+nz(x,z));
 const v=smooth(.25,.6,vent)*live,halo=smooth(.06,.22,vent)*(1-smooth(.25,.5,vent))*live,marsh=smooth(.35,.7,acid)*(1-v*.5)*live,sky=smooth(.35,.7,skl)*live;
 const cinder=smooth(.35,.7,cin)*(1-v)*live,gul=smooth(.35,.7,gully)*(1-sky)*live;
 const open=(1-v)*(1-marsh)*(1-cinder)*(1-gul*.8)*(1-sky)*live*(1-smooth(.2,.55,owned))*(1-field)*(1-clear)*(1-savAll),wetW=BIO.hasField('humid')?F('humid'):smooth(.45,.7,wet);
 return{plume,alien,seam:4*alien*(1-alien),age,cliff,vent:v,halo,marsh,sky,cinder,gully:gul,open,wet,ash,rock,slope,wetW,dryW:1-wetW,owned,kedge:kedge*live,knear:knear*live,field:field*live,clear:clear*live,coast:coast*live,edge:edge*live,grove:grove*live,iwood:iwood*live*(1-smooth(.2,.55,owned)),beach:beach*live,cforest:cforest*live*(1-smooth(.2,.55,owned)),ashdeep,sulph:sulph*live,cbelt:cbelt*live,rivbank:rivbank*live,dz,tundra:tundra*live,warm:warm*live,snow,savanna:sav*live,capwood:capw*live,braid:braid*live,burn:burn,
  fresh:open*S.fresh,young:open*S.young,mature:open*S.mature,old:open*S.old};}
THRONE.zones=zones;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:THRONE.BARKTEX.map(t=>texMean(t)),wood:texMean(THRONE.WOODTEX),rock:texMean(THRONE.ROCKTEX)};
 // a library map's mean is the pack's (an sRGB grey: its linear value per channel)
 const lm=THRONE.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);
 if(lm.wood!=null)MEAN.wood=lin(lm.wood);if(lm.rock!=null)MEAN.rock=lin(lm.rock);if(lm.flesh!=null)MEAN.bark[9]=lin(lm.flesh);
 return MEAN;}
Object.assign(THRONE,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const fleshCol=(hex,k)=>tint(hex,means().bark[9],k==null?1:k);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
THRONE.leafCol=leafCol;

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
const tip=p=>p[p.length-1];

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
THRONE.blocked=blocked;
// within a clump (the lamp caps', the drizzle trumpets'): a cap of radius s spanning y0..y1 at (x,z) touches none placed so
// far, unless they stand at clearly different heights
const capClear=(P,x,z,y0,y1,s)=>P.every(q=>Math.hypot(q.x-x,q.z-z)>=(q.s+s)*.95||y1<q.y0||y0>q.y1);

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// DRIPPING FUNGI hung under a cap or a tier (the library's cards; nothing without the pack): n cards round radius r below y
function drips(x,y,z,r,n,st){const L=THRONE.LIB.cardsOf('drip');if(!L.length)return;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*rr(.15,.8),s=rr(.6,1.4)*Math.min(1.6,r*.35+.4);BIO.put(pick(L),[x+Math.cos(a)*d,y,z+Math.sin(a)*d],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[s,s*rr(1,1.6),s],null);st.drips++;}}
// THE RUFF: with the library's fronds, a collar of them radiating from a small dark throat and opening upward, like a
// frilled lizard's; without, the vertex-coloured pod. s is the collar's radius
function ruffAt(x,y,z,s,st,lv,petals){const PL=petals?THRONE.LIB.cardsOf('petal'):[];
 if(PL.length){BIO.put('frill',[x,y,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),s*.22,shade(C(0xd8a040),-.1));
  for(let w=0;w<2;w++){const n=lv===2?(w?ri(7,9):ri(10,13)):(w?4:6),a0=rr(0,TAU),tilt=w?rr(.9,1.15):rr(.35,.6),k0=w?.7:1;
   for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),Ls=s*k0*rr(.85,1.1);BIO.put(pick(PL),[x+Math.cos(a)*s*.08,y+w*s*.05,z+Math.sin(a)*s*.08],qEuler(rr(-.12,.12),-a,tilt+rr(-.12,.12)),[Ls,Ls*.8,Ls*rr(.75,.95)],null,{n:[Math.cos(a)*.4,1,Math.sin(a)*.4]});}}
  st.pods++;return;}
 const L=THRONE.LIB.cardsOf('frillfrond');
 if(!L.length){BIO.put('frill',[x,y+s*.2,z],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),s,bright(C(0xffffff),rr(.9,1.1)));st.pods++;return;}
 BIO.put('frill',[x,y,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),s*.32,shade(C(0x6a1a14),-.2));
 const n=lv===2?ri(10,14):6,a0=rr(0,TAU),tilt=rr(.45,.85);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.12,.12),Ls=s*rr(.85,1.15);
  BIO.put(pick(L),[x+Math.cos(a)*s*.12,y,z+Math.sin(a)*s*.12],qEuler(rr(-.15,.15),-a,tilt+rr(-.15,.15)),[Ls,Ls*.8,Ls*rr(.8,1.05)],null,{n:[Math.cos(a)*.4,1,Math.sin(a)*.4]});}
 st.pods++;}
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h,age:T.age});
// a bole as a tube from the ground (crooked, tapering), coloured ring by ring
function bole(T,S,fam,x,z,h,r0,r1,lean,la,wig,n,st,seg,colFn){const pts=[];const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,ph=rr(0,TAU);
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*h,ox=Math.cos(la)*lean*h*t*t+Math.cos(ph)*w,oz=Math.sin(la)*lean*h*t*t+Math.sin(ph)*w,y=T.y0-.3+(h+.3)*t;
  pts.push({x:x+ox,y,z:z+oz,r:mix(r0,r1,Math.pow(t,.8))*(t<.08?1.25:1),col:colFn?colFn(t,k):barkCol(S,k)});}
 // the trunk's top is not sawn off: it swells a little where the limbs leave it and closes in a rounded knot (two more rings
 // along its last direction, narrowing), so a limb grows out of wood, not off a flat disc. The returned points stay the
 // trunk's own (the builders place limbs along them)
 const L=pts[n],P=pts[n-1],dx=L.x-P.x,dy=L.y-P.y,dz=L.z-P.z,dl=Math.hypot(dx,dy,dz)||1,r=L.r;
 const knot=pts.concat([{x:L.x+dx/dl*r*.9,y:L.y+dy/dl*r*.9,z:L.z+dz/dl*r*.9,r:r*.85,col:L.col},{x:L.x+dx/dl*r*1.6,y:L.y+dy/dl*r*1.6,z:L.z+dz/dl*r*1.6,r:r*.35,col:L.col}]);
 st.trunk+=BIO.tube(fam,knot,pts[0].col,{seg:seg,cap:true});return pts;}
// a limb in its trunk's own bark bucket and colour, at every level (a mid tree's limb is a coarse three-sided tube: an
// untextured rod there read as a different wood from its trunk)
function limb(fam,S,pts,k,lv,st){st.limb+=BIO.tube(fam,lv===2?pts:[pts[0],pts[Math.floor(pts.length/2)],tip(pts)],barkCol(S,k),{seg:lv===2?4:3});}
// a parasol cap (disc on top, gills under it), its stalk's top at p, radius s; tilt a little toward the light
function cap(p,s,flat,col,st){const q=qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12));
 // with the library's cap skin the colour is mostly the texture's own: the cap's colour only warms it a little
 BIO.put('disc',[p.x,p.y,p.z],q,[s,s*flat,s],THRONE.LIB.disc?C(0xffffff).lerp(col,.25):col);BIO.put('gills',[p.x,p.y,p.z],q,[s,s*flat,s],shade(col,-.25));st.caps++;
 // snare moss hung from the cap's rim (the library's cards; nothing without the pack)
 const MS=THRONE.LIB.cardsOf('moss');if(MS.length&&rng()<.55)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),d=s*rr(.4,.85),h=rr(1,2.2);BIO.put(pick(MS),[p.x+Math.cos(a)*d,p.y-s*.04,p.z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[h*.9,h,h*.9],null);st.drips++;}}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,age} and lv 2 near / 1 mid
const B=[];

// 0 the RANJ TREE (its spice is Ranj): a short stout trunk, a few rising limbs, a dense round crown of glossy dark leaves (clove-like).
// Its wounds, where the native vent fungus got in, weep red resin -- Ranj, the spice -- and the fungus's small brackets
// crowd round them (and glow at night). Wild here, on the seam and at the edge of the steaming ground.
// T.planted (the frontier's plantations, NOTES.md): set out in rows where its fungus has not taken (its conditions are
// narrow and not understood), it grows thin and yellowing and never bleeds: no fungus, so no resin, so no Ranj
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR*(T.planted?.8:1),sick=!!T.planted;
 const pts=bole(T,S,'bark10',T.x,T.z,H*.42,T.rb,T.rb*.7,rr(.02,.08),rr(0,TAU),.05,lv===2?4:2,st,lv===2?7:5);
 const e=tip(pts),hc=sick?C(pick(S.leaf)).lerp(C(pick([0xa8a040,0x988a3a,0xb0a050])),rr(.35,.6)):C(pick(S.leaf)),cy=T.y0+H*.66;let top=e.y;
 for(let k=0,nL=lv===2?ri(3,5):3;k<nL;k++){const la=k/nL*TAU+rr(-.4,.4),L=H*rr(.3,.42),lp=treeGrow(e,dirOf(la,rr(.7,1.1)),L,e.r*.8,.05,3,-.04,.12);
  limb('bark10',S,lp,k,lv,st);top=Math.max(top,tip(lp).y);}
 for(let c=0,n=Math.round((lv===2?ri(14,20):6)*(sick?.5:1));c<n;c++){const q=rr(0,TAU),u=rng(),d=R*Math.sqrt(u)*.85,y=cy+(rng()-.4)*H*.32*(1-u*.4);
  clumpAt('glossy',T.x+Math.cos(q)*d,y,T.z+Math.sin(q)*d,R*rr(.4,.55)*(lv===2?1:1.5),.75,hc,T.x,cy,T.z,R,H*.3);st.clumps++;}
 if(lv===2&&!sick){for(let w=0,nw=ri(1,3);w<nw;w++){const p=along(pts,rr(.25,.85)),a=rr(0,TAU),ox=Math.cos(a)*p.r,oz=Math.sin(a)*p.r;
   for(let k=0,m=ri(3,6);k<m;k++){const s=rr(.05,.1);BIO.put('resin',[p.x+ox*1.08+rr(-.05,.05),p.y-rr(0,.5),p.z+oz*1.08+rr(-.05,.05)],qEuler(0,rr(0,TAU),0),[s,s*rr(1.6,3),s],C(pick(PAL.resin)));st.resin++;}
   const SH=THRONE.LIB.cardsOf('shelf');
   for(let k=0,m=ri(2,4);k<m;k++){const s=rr(.12,.22),y=p.y+rr(-.4,.5),q=qEuler(0,Math.PI/2-a+rr(-.4,.4),0);
    if(SH.length)BIO.put(pick(SH),[p.x+ox,y-s,p.z+oz],q,s*3,null);else BIO.put('bracket',[p.x+ox,y,p.z+oz],q,[s,s*.6,s],C(pick(PAL.spiceFungus)));}}}
 BIO.register({name:sick?'Ranj tree (planted: no resin)':S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:R+1,h:top-T.y0+R*.6,age:T.age,planted:sick});};

// 1 the TRUMPET TREE (the Rift's, here on the shoulder): a twisted trunk, crooked rising limbs each ending in a
// ribbed funnel with a frilled rim, held up to the rain; small funnels sprouting from the trunk itself
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H;let reach=T.crownR;const pts=bole(T,S,'bark0',T.x,T.z,H*.55,T.rb,T.rb*.55,rr(.05,.15),rr(0,TAU),.14,lv===2?5:3,st,lv===2?7:5);
 const e=tip(pts),fc=C(pick(S.leaf));let top=e.y;
 for(let k=0,nb=lv===2?ri(3,6):3;k<nb;k++){const la=k/nb*TAU+rr(-.5,.5),L=H*rr(.3,.5),s=T.crownR*rr(.35,.55),
   // the limb leans out at least far enough that its funnel's rim (radius s) clears the trunk (it clipped it on a steep limb)
   el=Math.min(rr(.6,1.2),Math.acos(clamp((s*1.15+e.r*1.5)/L,0,.999))),bp=treeGrow(along(pts,rr(.65,1)),dirOf(la,el),L,e.r*.7,.06,3,.08,.15);
  limb('bark0',S,bp,k,lv,st);const t=tip(bp);
  BIO.put('tfunnel',[t.x,t.y-s*.1,t.z],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*rr(1.1,1.5),s],THRONE.LIB.funnelT?C(0xffffff).lerp(vary(fc,.03,.08,.06),.15):vary(fc,.03,.08,.06));st.funnels++;top=Math.max(top,t.y+s*1.3);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);}
 if(lv===2)for(let k=0,m=ri(1,3);k<m;k++){const p=along(pts,rr(.35,.8)),a=rr(0,TAU),s=T.crownR*rr(.15,.25);
  // out from the bark on a short stalk, tilted away from it, so the rim (radius s) stands clear of the trunk
  const d=p.r+s*1.15,ca=Math.cos(a),sa=Math.sin(a),bx=p.x+ca*d,bz=p.z+sa*d,by=p.y+s*.35,bc=barkCol(S,k);
  st.limb+=BIO.tube('bark0',[{x:p.x+ca*p.r*.6,y:p.y-s*.1,z:p.z+sa*p.r*.6,r:Math.max(.04,s*.1),col:bc},{x:bx,y:by,z:bz,r:Math.max(.03,s*.07),col:bc}],bc,{seg:4,cap:true});
  BIO.put('tfunnel',[bx,by,bz],qUp([ca*.55,1,sa*.55]).multiply(qEuler(0,rr(0,TAU),0)),s,THRONE.LIB.funnelT?C(0xffffff).lerp(vary(fc,.03,.1,.08),.15):vary(fc,.03,.1,.08));st.funnels++;}
 regTree(T,S,reach+1,top-T.y0+1);};

// 2 the RUFF TREE (the frond collar the owner kept, 2026-10-06): a short trunk, a leafy crown, a ruff of spiked fronds at
// its tips that bursts in a flow's heat and throws its seed over the fresh lava
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR;const pts=bole(T,S,'bark0',T.x,T.z,H*.5,T.rb,T.rb*.6,rr(.04,.12),rr(0,TAU),.1,lv===2?4:2,st,6);
 const e=tip(pts),hc=C(pick(S.leaf)),cy=T.y0+H*.72;let top=e.y;
 for(let k=0,nb=lv===2?ri(3,5):3;k<nb;k++){const bp=treeGrow(e,dirOf(k/nb*TAU+rr(-.4,.4),rr(.5,.9)),H*rr(.25,.4),e.r*.7,.05,3,-.03,.1);limb('bark0',S,bp,k,lv,st);
  const t=tip(bp);top=Math.max(top,t.y);
  clumpAt('small',t.x,t.y,t.z,R*rr(.45,.6)*(lv===2?1:1.4),.65,hc,T.x,cy,T.z,R,H*.3);st.clumps++;
  // the ruff on the branch's own tip (it floated a metre above it): a short stalk of the branch's bark up to its throat
  if(lv===2&&rng()<.7){const ry=t.y+.35,bc=barkCol(S,k);st.limb+=BIO.tube('bark0',[{x:t.x,y:t.y-.15,z:t.z,r:.07,col:bc},{x:t.x,y:ry,z:t.z,r:.05,col:bc}],bc,{seg:4,cap:true});ruffAt(t.x,ry,t.z,rr(.6,1.0),st,lv);}}
 if(lv===2)for(let c=0;c<ri(3,6);c++){const q=rr(0,TAU),d=R*rr(0,.6);clumpAt('small',T.x+Math.cos(q)*d,cy+rr(-.5,1),T.z+Math.sin(q)*d,R*.5,.6,hc,T.x,cy,T.z,R,H*.3);st.clumps++;}
 regTree(T,S,R+1,top-T.y0+R*.5);};

// 3 the GILL-PARASOL (ref 10): a pale smooth trunk that forks into a few rising limbs, each ending in a flat orange cap
// with its gills underneath; the leader carries the largest. Krator's own, but at home on the seam.
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR;const pts=bole(T,S,'bark2',T.x,T.z,H*.55,T.rb,T.rb*.65,rr(.03,.1),rr(0,TAU),.12,lv===2?5:3,st,lv===2?7:5);
 const e=tip(pts),cc=C(pick(S.leaf));let top=e.y;
 const lead=treeGrow(e,dirOf(rr(0,TAU),rr(1.3,1.5)),H*.45,e.r*.85,e.r*.45,3,0,.06);limb('bark2',S,lead,0,lv,st);
 cap(tip(lead),R*rr(.6,.75),rr(.8,1.1),bright(vary(cc,.02,.08,.05),1.1),st);top=tip(lead).y;
 for(let k=0,nb=lv===2?ri(2,4):2;k<nb;k++){const la=k/nb*TAU+rr(-.5,.5),bp=treeGrow(along(pts,rr(.55,.95)),dirOf(la,rr(.5,1.0)),H*rr(.25,.42),e.r*.6,e.r*.3,3,.12,.1);
  limb('bark2',S,bp,k+1,lv,st);cap(tip(bp),R*rr(.35,.55),rr(.8,1.1),bright(vary(cc,.03,.1,.07),1.05),st);top=Math.max(top,tip(bp).y);}
 regTree(T,S,R+1,top-T.y0+R*.3);};

// 4 the STILT PARASOL (ref 11): a cluster of very slender tall stalks from one base, each with a wide flat dish
B[4]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,cc=C(pick(S.leaf));let top=T.y0;
 for(let k=0,n=lv===2?ri(2,5):2;k<n;k++){const a=k*GOLD+rr(-.3,.3),d=k?rr(.6,2.2):0,h=T.H*(k?rr(.55,.95):1),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
  const pts=bole(T,S,'bark2',x,z,h,T.rb*(k?.75:1),T.rb*.4,rr(.03,.12),a,.04,lv===2?5:3,st,5);
  cap(tip(pts),R*(k?rr(.55,.8):1)*rr(.85,1.05),rr(.45,.6),bright(vary(cc,.03,.1,.07),1.05),st);top=Math.max(top,tip(pts).y);}
 regTree(T,S,R+1,top-T.y0+R*.2);};

// 5 the STAR ALOE (ref 13): grey branching trunks leaning out from a low base, each tipped with a star of long red
// pointed leaves dark at the tips. The pioneer of the shoulder's young flows and cinder.
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,sc=C(pick(S.leaf)),AF=THRONE.LIB.cardsOf('aloeflower');let top=T.y0,reach=R;
 const base=bole(T,S,'bark3',T.x,T.z,H*.22,T.rb*1.2,T.rb,0,0,.04,2,st,6),e=tip(base);
 for(let k=0,n=lv===2?ri(3,7):3;k<n;k++){const a=k*GOLD+rr(-.3,.3),bp=treeGrow(e,dirOf(a,rr(.75,1.3)),H*rr(.5,.85),T.rb*.75,T.rb*.4,lv===2?4:2,-.04,.12);
  limb('bark3',S,bp,k,lv,st);const t=tip(bp),s=R*rr(.35,.5);
  BIO.put('star',[t.x,t.y,t.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*rr(.9,1.2),s],bright(vary(sc,.02,.08,.06),1.15));st.stars++;top=Math.max(top,t.y+s*.6);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);
  // a blossom out of some of the stars (the library's cards; nothing without the pack). Chosen by a hash of the tree's seed, not
  // the stream, so the other trees' shapes do not move
  if(lv===2&&AF.length){const h=n=>{const v=Math.sin(T.seed*12.9898+k*78.233+n*37.719)*43758.5453;return v-Math.floor(v);};
   if(h(1)<.45){const bh=s*(2.6+1.4*h(2));BIO.put(AF[Math.floor(h(3)*AF.length)],[t.x,t.y-s*.15,t.z],qEuler(0,h(4)*TAU,0),[bh*.75,bh,bh*.75],null);st.stars++;top=Math.max(top,t.y+bh);}}}
 // the leaning limbs carry the stars well out past the crown radius: register the reach they actually have
 regTree(T,S,reach+1,top-T.y0+1);};

// 6 the PAGODA CAP (ref 12): a thick trunk of twisted fibres, flared at the foot and again under its tiers, two to four
// flat lumpy red-orange tiers stacked one over the next, each smaller. The plume's commonest tree.
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,cc=C(pick(S.leaf)),nt=lv===2?ri(2,4):2,y1=H*.55;
 const pts=[],ph=rr(0,TAU);for(let k=0;k<=8;k++){const t=k/8,y=T.y0-.4+(y1+.4)*t,fl=1+1.1*smooth(.3,0,t)+.9*smooth(.7,1,t);
  pts.push({x:T.x+Math.cos(ph)*.25*Math.sin(t*3),y,z:T.z+Math.sin(ph)*.25*Math.sin(t*3),r:T.rb*fl*(1-.25*t),col:barkCol(S,k)});}
 const fam=THRONE.MOLTEN?'molten':'bark8';if(THRONE.MOLTEN)pts.forEach(p=>p.col=C(0xc8c0bc));
 st.trunk+=BIO.tube(fam,pts,pts[0].col,{seg:lv===2?10:6,cap:true,rfn:(i,a)=>1+.12*Math.sin(a*7+i*.8)});
 let y=T.y0+y1,top=y;
 for(let i=0;i<nt;i++){const s=R*(1-.24*i)*rr(.92,1.05),col=bright(vary(cc,.02,.06,.05),1.05);
  BIO.put('tier',[T.x,y+s*.08,T.z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[s,s*rr(.8,1.1),s],col);st.tiers++;top=y+s*.3;
  if(lv===2)drips(T.x,y-s*.04,T.z,s*.85,ri(3,7),st);
  if(i<nt-1){const neck=H*rr(.1,.16),n0={x:T.x,y:y+s*.2,z:T.z,r:T.rb*.55,col:barkCol(S,i)},n1={x:T.x+rr(-.2,.2),y:y+neck,z:T.z+rr(-.2,.2),r:T.rb*.45*(1+.8),col:barkCol(S,i+1)};
   st.trunk+=BIO.tube(fam,[n0,{x:mix(n0.x,n1.x,.5),y:mix(n0.y,n1.y,.5),z:mix(n0.z,n1.z,.5),r:T.rb*.4,col:n0.col},n1],n0.col,{seg:6});y+=neck;}}
 regTree(T,S,R+1,top-T.y0+1);};

// 7 the DRIZZLE TRUMPET (ref 19): a clump of tall green stalks, each holding up a translucent veined pitcher that
// catches the plume's acid drizzle (and digests what falls in). The pitchers glow faintly, as if lit from behind.
B[7]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,pc=C(pick(S.leaf));let top=T.y0,reach=R;const P=[];
 for(let k=0,n=lv===2?ri(3,7):2;k<n;k++){const a=k*GOLD+rr(-.3,.3),d0=k?rr(.4,1.6):0,h=T.H*(k?rr(.45,.95):1),lean=rr(.02,.1),s=R*(k?rr(.55,.85):1);
  // out from the clump's middle until its pitcher touches none of its siblings' (they clipped)
  let d=d0,x=T.x,z=T.z,ok=false;for(let i=0;i<14;i++){x=T.x+Math.cos(a)*d;z=T.z+Math.sin(a)*d;const tx=x+Math.cos(a)*lean*h,tz=z+Math.sin(a)*lean*h,yt=T.y0+h;
   if(capClear(P,tx,tz,yt-s*.25,yt+s*1.8,s)){ok=true;break;}d+=s*.35;}
  if(!ok)continue;
  const pts=bole(T,S,'bark2',x,z,h,T.rb*(k?.8:1),T.rb*.6,lean,a,.05,lv===2?4:2,st,5);
  const t=tip(pts);P.push({x:t.x,z:t.z,s,y0:t.y-s*.25,y1:t.y+s*1.8});BIO.put('pitcher',[t.x,t.y-s*.15,t.z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[s,s*rr(1.4,1.9),s],vary(pc,.03,.08,.06));st.pitchers++;
  top=Math.max(top,t.y+s*1.6);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);}
 regTree(T,S,reach+1,top-T.y0+1);};

// 8 the BONE BELL (ref 1): a tall ivory bell held up on a braided stem that splays at the foot into a curtain of roots
// over the ground, streaked ochre by the sulphur; small round bells on thin stalks round it. Only in the vents' steam.
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,yb=T.y0+H*.58,ic=C(pick(PAL.bell));
 const nS=lv===2?ri(12,22):6;
 for(let k=0;k<nS;k++){const a=k/nS*TAU+rr(-.15,.15),r0=R*rr(.15,.3),r2=R*rr(.55,1.35),tw=rr(-.6,.6),col=k%3?fleshCol(pick(PAL.bell)):fleshCol(pick(PAL.bellStreak));
  const P=[];for(let i=0;i<=5;i++){const t=i/5,aa=a+tw*t,rad=mix(r0,r2,Math.pow(t,2.2))*(1+.15*Math.sin(t*Math.PI)),y=mix(yb+R*.08,T.y0-.3,Math.pow(t,1.15));
   P.push({x:T.x+Math.cos(aa)*rad,y,z:T.z+Math.sin(aa)*rad,r:mix(T.rb*.42,T.rb*.16,t),col});}
  st.trunk+=BIO.tube('flesh',P,col,{seg:lv===2?5:4});}
 const s=R*rr(.85,1),hb=R*rr(.75,1.05);
 BIO.put('bell',[T.x,yb,T.z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,hb,s],bright(ic,.78));st.bells++;   // set a little dark: the sun lifts ivory to white
 if(lv===2)drips(T.x,yb+hb*.05,T.z,s*.9,ri(2,5),st);
 if(lv===2)for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),d=R*rr(1,1.8),h=H*rr(.25,.6),bx=T.x+Math.cos(a)*d,bz=T.z+Math.sin(a)*d,by=BIO.terrainH(bx,bz);
  BIO.beam('rod',[bx,by-.2,bz],[bx,by+h,bz],.08,.05,fleshCol(pick(PAL.bell),.9));const r=rr(.35,.8);BIO.put('bell',[bx,by+h-r*.1,bz],qEuler(0,rr(0,TAU),0),[r,r*rr(.9,1.3),r],ic);st.bells++;}
 regTree(T,S,R*1.4+1,yb+hb-T.y0+1);};

// 9 the PUFFBALL ROPE-TREE (ref 9): a trunk of many grey and orange strands twisted together, flared at its foot,
// splaying at the top into stalks that hold up grey spore balls in a haze of fine hairs: a few big ones low in the crown,
// many small ones on long thin stalks, fine orange threads strung between them
function puffAt(x,y,z,s,st,lv){const q=qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),c=bright(vary(C(pick(PAL.puff)),.02,.04,.05),.62);   // the sun and the tone map lift a grey ball to white: it is set dark
 BIO.put('puff',[x,y,z],q,[s,s*rr(.9,1.08),s],c);// near: real hairs all round it; farther: the crossed fuzz cards
 if(lv===2)BIO.put('hair',[x,y,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),s*rr(.95,1.05),bright(c,1.25));
 else BIO.put('fuzz',[x,y,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),s*rr(1.3,1.45),bright(c,1.1));st.puffs++;}
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,ns=lv===2?ri(15,22):7,y1=H*.55,tw=rr(1.2,2.4)*(rng()<.5?-1:1);let top=T.y0+y1;const tips=[];
 for(let k=0;k<ns;k++){const a0=k/ns*TAU,col=tint(k%3?pick(PAL.ropeA):pick(PAL.ropeB),means().bark[8]),P=[];
  // the strands lie close (they merge into one braided trunk), flaring at the foot into roots and at the top into the crown
  const ring=rr(.32,.5);for(let i=0;i<=7;i++){const t=i/7,rad=T.rb*(ring+1.5*smooth(.22,0,t)+.5*smooth(.8,1,t)),a=a0+tw*t;P.push({x:T.x+Math.cos(a)*rad,y:T.y0-.3+(y1+.3)*t,z:T.z+Math.sin(a)*rad,r:T.rb*rr(.24,.36)*(1+.4*smooth(.2,0,t)),col});}
  st.trunk+=BIO.tube('bark8',P,col,{seg:5});
  if(k%2===0||lv<2){const e=tip(P),big=k%5===0,bp=treeGrow(e,dirOf(a0+tw,big?rr(.5,.9):rr(.8,1.35)),H*(big?rr(.15,.28):rr(.3,.5)),T.rb*.18,.04,3,.05,.12);
   st.limb+=BIO.tube('bark8',lv===2?bp:[bp[0],tip(bp)],col,{seg:3});
   const t=tip(bp),s=R*(big?rr(.26,.38):rr(.1,.18));puffAt(t.x,t.y+s*.85,t.z,s,st,lv);tips.push({x:t.x,y:t.y+s*.85,z:t.z,s});top=Math.max(top,t.y+s*2);
   // small puffs on thin stalks off the stalk's end
   if(lv===2)for(let m=0,n=ri(1,3);m<n;m++){const a=rr(0,TAU),L=R*rr(.25,.6),ex=t.x+Math.cos(a)*L*.6,ez=t.z+Math.sin(a)*L*.6,ey=t.y+L*rr(.5,.9),ss=R*rr(.05,.1);
    BIO.beam('rod',[t.x,t.y,t.z],[ex,ey,ez],.03,.015,col);puffAt(ex,ey+ss*.8,ez,ss,st,lv);top=Math.max(top,ey+ss*2);}}}
 // fine orange threads between neighbouring puffs, sagging
 if(lv===2)for(let i=0;i+1<tips.length;i++)if(rng()<.6){const a=tips[i],b=tips[i+1],m=[(a.x+b.x)/2,(a.y+b.y)/2-Math.hypot(a.x-b.x,a.z-b.z)*.25,(a.z+b.z)/2],c=C(pick(PAL.ropeB));
  BIO.beam('rod',[a.x,a.y-a.s*.5,a.z],m,.012,.012,c);BIO.beam('rod',m,[b.x,b.y-b.s*.5,b.z],.012,.012,c);}
 regTree(T,S,R+1,top-T.y0+1);};

// 10 the LAMP CAP (ref 20): one to four thin stems, each holding up a wide shallow dish that glows blue to violet
B[10]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,lc=C(pick(S.leaf));let top=T.y0,reach=R;const P=[];
 for(let k=0,n=lv===2?ri(1,4):1;k<n;k++){const a=k*GOLD,d0=k?rr(.3,1):0,h=T.H*(k?rr(.5,.9):1),lean=rr(-.15,.15),s=R*(k?rr(.5,.8):1);
  // out from the clump's middle until its cap touches none of its siblings' (they clipped)
  let d=d0,x=T.x,z=T.z,y=T.y0,tx=x,tz=z,ok=false;for(let i=0;i<14;i++){x=T.x+Math.cos(a)*d;z=T.z+Math.sin(a)*d;y=BIO.terrainH(x,z);tx=x+Math.cos(a)*lean*h;tz=z+Math.sin(a)*lean*h;
   if(capClear(P,tx,tz,y+h-s*.45,y+h+s*.8,s)){ok=true;break;}d+=s*.4;}
  if(!ok)continue;
  BIO.beam('rod',[x,y-.1,z],[tx,y+h,tz],.06,.04,C(pick(PAL.lampStem)));
  BIO.put('lamp',[tx,y+h,tz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*rr(.8,1.2),s],vary(lc,.04,.1,.05));st.lamps++;P.push({x:tx,z:tz,s,y0:y+h-s*.45,y1:y+h+s*.8});
  top=Math.max(top,y+h);reach=Math.max(reach,Math.hypot(tx-T.x,tz-T.z)+s);}
 regTree(T,S,reach+.5,top-T.y0+.5);};

// 11 the ASH PINE (a Canary pine: Earth's descendant): a straight trunk in red-brown plates, whorls of short branches,
// long tufted needles, and green tufts sprouting from the trunk itself (it resprouts after an ash fall or a flow's heat)
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR;const pts=bole(T,S,'bark1',T.x,T.z,H*.95,T.rb,T.rb*.12,rr(0,.04),rr(0,TAU),.03,lv===2?6:3,st,lv===2?7:5);
 const hc=C(pick(S.leaf)).lerp(C(0xe6ecf2),Math.min(.6,BIO.field('snow',T.x,T.z)*.9)),cy=T.y0+H*.68;   // dusted where snow lies (the glacier's field; 0 elsewhere)
 const nw=lv===2?ri(8,12):4;for(let w=0;w<nw;w++){const u=lerp(.32,.94,w/(nw-1||1)),p=along(pts,u),Lw=R*(1-.65*(u-.32)/.62)*rr(.85,1.1);
  for(let k=0,n=lv===2?ri(4,6):3;k<n;k++){const a=k/n*TAU+w*1.3+rr(-.3,.3),bp=treeGrow(p,dirOf(a,rr(-.1,.25)),Lw,p.r*.5+.04,.04,2,.04,.08);
   if(lv===2){bp[0].r=p.r*.35+.03;bp[1].r=(p.r*.35+.03)*.55;bp[2].r=.03;st.limb+=BIO.tube('bark1',bp,barkCol(S,k),{seg:3});}
   const t=tip(bp);clumpAt('needle',t.x,t.y+.2,t.z,Lw*rr(.7,.95)*(lv===2?1:1.4),.75,hc,T.x,cy,T.z,R,H*.3);st.clumps++;
   if(lv===2&&rng()<.85){const m=along(bp,.55);clumpAt('needle',m.x,m.y+.2,m.z,Lw*.45,.7,hc,T.x,cy,T.z,R,H*.3);st.clumps++;}}}
 clumpAt('needle',tip(pts).x,tip(pts).y,tip(pts).z,R*.45,.9,hc,T.x,cy,T.z,R,H*.3);
 if(lv===2)for(let k=0,m=ri(2,5);k<m;k++){const p=along(pts,rr(.08,.4)),a=rr(0,TAU);clumpAt('needle',p.x+Math.cos(a)*p.r*1.5,p.y,p.z+Math.sin(a)*p.r*1.5,rr(.5,.9),.8,bright(hc,1.1),T.x,cy,T.z,R,H*.3);st.clumps++;}
 regTree(T,S,R+1,H+1);};

// 12 the GREAT RUFF: the ruff tree at hypertree size on the windward kipuka's rims. A buttressed bole, great limbs that
// fork, small-leaved foliage along them, and at their tips ruffs of spiked fronds metres across round a dark throat.
// A flow's heat bursts them and throws their seed over the fresh lava (the ruff trees round a kipuka are its seedlings).
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf)),cy=T.y0+H*.72;
 const pts=[],la=rr(0,TAU),lean=rr(.01,.04),n=lv===2?9:5;
 for(let k=0;k<=n;k++){const t=k/n;pts.push({x:T.x+Math.cos(la)*lean*H*.62*t*t,y:T.y0-1+(H*.62+1)*t,z:T.z+Math.sin(la)*lean*H*.62*t*t,r:mix(T.rb,T.rb*.42,Math.pow(t,.7)),col:barkCol(S,k)});}
 // the buttresses: fins at the foot, five or so, sharp-edged, dying out a fifth of the way up
 const fins=ri(4,6),ph=rr(0,TAU);
 st.trunk+=BIO.tube('bark0',pts,pts[0].col,{seg:lv===2?18:10,cap:true,rfn:(i,a)=>{const t=i/n;return 1+1.6*smooth(.22,0,t)*Math.pow(Math.abs(Math.sin((a+ph)*fins/2)),4);}});
 const e=tip(pts);let top=e.y,reach=R;
 // THE CROWN, on the scale of the hyperjungle's: limbs from half way up, rising then arching out (curve), wandering, forking
 // twice; a canopy of big leaf clumps over the outer two thirds of every limb and fork (a layered dome, not leaves only at
 // the tips); the ruffs set into the canopy's top at the forks' ends. A mid tree keeps the shape with fewer, coarser pieces
 const near=lv===2,ends=[];
 const fol=(tw,n)=>{for(let c=0;c<n;c++){const p=along(tw,rr(.3,1)),q=rr(0,TAU),d=R*rr(.04,.16);
   clumpAt('small',p.x+Math.cos(q)*d,p.y+rr(-1,4),p.z+Math.sin(q)*d,R*rr(.16,.26)*(near?1:1.45),.5,hc,T.x,cy,T.z,R,H*.25);st.clumps++;}};
 for(let k=0,nL=near?ri(9,13):ri(7,9);k<nL;k++){const a=k/nL*TAU+rr(-.3,.3),start=along(pts,rr(.5,1)),L=R*rr(.75,1.05),
   lp=treeGrow(start,dirOf(a,rr(.45,.85)),L,start.r*.5,.25,near?7:4,-.32,.22);
  st.limb+=BIO.tube('bark0',lp,barkCol(S,k),{seg:near?7:4});fol(lp,near?ri(6,9):3);
  for(let j=0,m=near?ri(3,5):2;j<m;j++){const b=along(lp,rr(.3,.85)),sp=treeGrow(b,dirOf(a+rr(-1.1,1.1),rr(.35,.9)),L*rr(.35,.55),b.r*.6,.15,near?4:3,-.12,.2);
   st.limb+=BIO.tube('bark0',sp,barkCol(S,k+j),{seg:near?5:3});fol(sp,near?ri(5,8):3);ends.push(tip(sp));
   if(near&&rng()<.6){const b2=along(sp,rr(.4,.8)),s2=treeGrow(b2,dirOf(a+rr(-1.4,1.4),rr(.3,.9)),L*rr(.2,.3),b2.r*.6,.1,3,-.08,.2);st.limb+=BIO.tube('bark0',s2,barkCol(S,k),{seg:4});fol(s2,ri(3,5));ends.push(tip(s2));}}
  ends.push(tip(lp));}
 // THE LEADER: the bole does not stop at the crown's foot (it read as a sawn-off stump): it goes on up through the crown,
 // tapering to a point, leafed along its upper half, a ruff at its tip
 {const ld=treeGrow({x:e.x,y:e.y-1,z:e.z},dirOf(la,1.45),H*.36,e.r*.95,.25,near?6:3,0,.05);ld[0].r=e.r*1.02;
  st.limb+=BIO.tube('bark0',ld,barkCol(S,2),{seg:near?10:6,cap:true});fol(ld.slice(Math.floor(ld.length/3)),near?ri(8,12):4);ends.push(tip(ld));}
 for(const t of ends){const s=rr(5,8);ruffAt(t.x,t.y+3,t.z,s,st,lv,true);
  top=Math.max(top,t.y+s*.6);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);}
 regTree(T,S,reach,top-T.y0+2);};

// 13 the SIPHON TREE: roots in a lava tube's skylight. Its trunk is a hollow chimney, ribbed and flaring at the foot and
// again at the lip; the tube's warm wet air breathes out of the top (the host draws the mist, THRONE.siphons), and its
// crown is a ring of fronds hanging from the lip in that mist.
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,ribs=ri(5,8),pts=[];
 for(let k=0;k<=8;k++){const t=k/8;pts.push({x:T.x+Math.sin(t*2.2)*.3,y:T.y0-1+(H+1)*t,z:T.z,r:T.rb*(1+.9*smooth(.18,0,t)+.5*smooth(.82,1,t)),col:fleshCol(pick(S.bark),1)});}
 st.trunk+=BIO.tube('bark9',pts,pts[0].col,{seg:lv===2?16:8,cap:false,rfn:(i,a)=>1+.12*Math.cos(a*ribs)});
 const t=tip(pts),fc=C(pick(S.leaf));
 // the lip, its mouth dark (a funnel turned up, its inside in shadow), the fronds hanging from it
 BIO.put('funnel',[t.x,t.y-T.rb*.4,t.z],qEuler(0,rr(0,TAU),0),[T.rb*1.55,T.rb*.8,T.rb*1.55],shade(C(pick(PAL.siphonLip)),-.3));
 for(let k=0,n=lv===2?ri(10,16):6;k<n;k++){const a=k/n*TAU+rr(-.15,.15),L=R*rr(.8,1.15);
  BIO.put('treefrond',[t.x+Math.cos(a)*T.rb*1.3,t.y,t.z+Math.sin(a)*T.rb*1.3],qEuler(rr(-.1,.1),-a,-rr(.5,1.2)),[L,L*.8,L*rr(.5,.7)],bright(vary(fc,.03,.08,.06),1.2),{n:[Math.cos(a)*.4,1,Math.sin(a)*.4]});st.clumps++;}
 regTree(T,S,R+T.rb*1.5,H+R*.3+1);};

// 14 the LEHUA (Earth's ohia lehua's descendant): the first tree on new lava. Two to four crooked grey stems from one
// base, a rounded crown of small grey-green leaves, red pompom flowers on its top
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf)),cy=T.y0+H*.7,a0=rr(0,TAU);let top=T.y0,reach=R;
 for(let k=0,n=lv===2?ri(2,4):2;k<n;k++){const sa=a0+k*TAU/n+rr(-.4,.4),h=H*rr(.65,1),pts=bole(T,S,'bark3',T.x+Math.cos(sa)*T.rb,T.z+Math.sin(sa)*T.rb,h*.6,T.rb*.8,T.rb*.4,rr(.15,.35),sa,.12,lv===2?4:2,st,6);
  const e=tip(pts);
  for(let j=0,m=lv===2?ri(2,4):2;j<m;j++){const bp=treeGrow(e,dirOf(sa+rr(-1,1),rr(.4,1)),h*rr(.25,.4),e.r*.7,.04,3,-.04,.15);limb('bark3',S,bp,j,lv,st);
   const t2=tip(bp);reach=Math.max(reach,Math.hypot(t2.x-T.x,t2.z-T.z)+R*.3);top=Math.max(top,t2.y);
   for(let c=0,nc=lv===2?ri(2,4):1;c<nc;c++){const q=rr(0,TAU),d=R*rr(0,.3);clumpAt('small',t2.x+Math.cos(q)*d,t2.y+rr(-.4,.8),t2.z+Math.sin(q)*d,R*rr(.35,.5)*(lv===2?1:1.4),.65,hc,T.x,cy,T.z,R,H*.3);st.clumps++;}
   if(lv===2)for(let f=0,nf=ri(2,6);f<nf;f++){const q=rr(0,TAU),d=R*rr(0,.35);BIO.put('pompom',[t2.x+Math.cos(q)*d,t2.y+rr(.3,1.1),t2.z+Math.sin(q)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.25,.45),leafCol(PAL.pompom,1.2,.02,.06,.05),{n:[0,1,0]});st.pods++;}}}
 regTree(T,S,reach,top-T.y0+R*.4+1);};

// 15 the TREE FERN: a shaggy trunk, a crown of great fronds arching out from its top, a skirt of dead ones beneath
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR;const pts=bole(T,S,'bark8',T.x,T.z,H,T.rb,T.rb*.85,rr(.03,.12),rr(0,TAU),.05,lv===2?4:2,st,6);
 const t=tip(pts),fc=C(pick(S.leaf));
 for(let k=0,n=lv===2?ri(10,16):6;k<n;k++){const a=k*GOLD+rr(-.1,.1),L=R*rr(.85,1.15);
  BIO.put('treefrond',[t.x,t.y,t.z],qEuler(rr(-.1,.1),-a,rr(.15,.6)),[L,L*.8,L*rr(.45,.6)],bright(vary(fc,.03,.08,.06),1.25),{n:[Math.cos(a)*.3,1,Math.sin(a)*.3]});st.clumps++;}
 if(lv===2)for(let k=0,n=ri(3,6);k<n;k++){const a=rr(0,TAU),L=R*rr(.5,.8);BIO.put('treefrond',[t.x,t.y-.3,t.z],qEuler(rr(-.1,.1),-a,-rr(1,1.4)),[L,L*.8,L*.4],leafCol([0x7a5a3a,0x6a4e30],1.0,.02,.05,.05),{n:[0,1,0]});}
 regTree(T,S,R+.5,H+R*.4);};

// 16 the ARCH PALM (ref 8): one to three trunks that rise and arch out over the slope, each crowned with stiff strap
// leaves (screwpine-like); red bromeliads perched in the crowns
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,a0=rr(0,TAU);let top=T.y0,reach=R;
 for(let k=0,n=lv===2?ri(1,3):1;k<n;k++){const a=a0+k*2.1+rr(-.3,.3),base={x:T.x+Math.cos(a)*T.rb,y:T.y0-.3,z:T.z+Math.sin(a)*T.rb,r:T.rb},bp=treeGrow(base,dirOf(a,rr(.95,1.25)),H*rr(.85,1.1),T.rb,T.rb*.75,lv===2?6:3,-.35,.05);
  limb('bark3',S,bp,k,lv,st);const t=tip(bp);top=Math.max(top,t.y);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+R);
  for(let c=0,nc=lv===2?ri(2,3):1;c<nc;c++){const q=rr(0,TAU),d=R*rr(0,.25);BIO.put('screwpine',[t.x+Math.cos(q)*d,t.y+rr(.2,.8),t.z+Math.sin(q)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R*rr(.9,1.2),R*rr(.6,.8),R*rr(.9,1.2)],THRONE.LIB.screwpine?null:leafCol(PAL.palm,1.2),{n:[0,1,0]});st.clumps++;}
  if(lv===2&&rng()<.6){const s=rr(.4,.7);BIO.put('bromeliad',[t.x,t.y+.3,t.z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.6,s],THRONE.LIB.bromeliad?null:leafCol(PAL.bromeliad,1.2),{n:[0,1,0]});}}
 regTree(T,S,reach,top-T.y0+R*.6);};

// 17 the FRILL TREE (the Rift's, biomes/rift B[0]; the owner: "frill trees are something different... bring one in and use
// the fractal frond"): a tapering ribbed column, a fin on every rib on every row pointing out and up, a splay of long fins
// and a pale bud at the summit. The fins are the owner's fractal fronds (iridescent: teal to violet at grazing angles); the
// column the blue-grey wave bark.
B[17]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3,nR=S.ribs;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/7));
 const rings=[],vs=8;for(let yy=0;yy<H*.9;yy+=vs*.6)rings.push({x:T.x,y:T.y0-.5+yy,z:T.z,r:rAt(yy/H),yy:yy,col:barkCol(S,(Math.floor(yy/24)+ti)%3)});
 rings.push({x:T.x,y:T.y0+H*.9,z:T.z,r:rAt(.9),yy:H*.9,col:barkCol(S,1)},{x:T.x,y:T.y0+H*.9+rAt(.9)*1.6,z:T.z,r:.05,yy:H*.9+2,col:barkCol(S,1)});
 const ph=rr(0,TAU);
 st.trunk+=BIO.lathe('bark11',rings,lv===2?30:16,Math.max(1,Math.round(TAU*rb/5)),vs,(R,ang)=>R.r*(1+.10*Math.cos(nR*ang+ph)),(R,ang)=>.78+.22*Math.cos(nR*ang+ph));
 const FN=THRONE.LIB.cardsOf('fin'),fin=FN.length?()=>pick(FN):()=>'treefrond',hc=C(pick(S.leaf)),fk=Math.min(1,H/100);
 const finCol=()=>FN.length?null:bright(vary(hc,.02,.06,.05),1.3),c2=()=>bright(C(pick(PAL.frillIrid)),1.1);
 // twice the Rift's rows (the owner: "about 2x as many frills, cover the gaps on the way up"), each row staggered half a
 // rib from the last and jittered up and down a little, so no ring of bare column shows between them
 const rows=lv===2?Math.max(6,Math.round(H/3)):Math.max(4,Math.round(H/6)),nf=lv===2?nR:nR/2;
 for(let r=0;r<rows;r++){const u=lerp(.08,.86,r/(rows-1)),yy=T.y0+H*u,R=rAt(u)*1.05;
  // longer and wider toward the top (the owner): short narrow fins low on the column, long broad plumes high up
  for(let k=0;k<nf;k++){const a=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=lerp(3.2,13,Math.pow(u,1.3))*fk*(.85+.3*fbm(u*9,k*.7,T.seed%97,1))*rr(.9,1.1),W=lerp(.28,.85,u);
   BIO.put(fin(),[T.x+Math.cos(a)*R,yy+rr(-.3,.3)*H/rows,T.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,lerp(1.05,.75,u)+rr(-.1,.1)),[L,L*.9,L*W],finCol(),{c2:c2(),n:[Math.cos(a)*.85,.5,Math.sin(a)*.85]});st.clumps++;}}
 const top=T.y0+H*.9,n=lv===2?14:8,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),L=H*rr(.12,.16)*mix(1.6,1,fk);
  BIO.put(fin(),[T.x+Math.cos(a)*rAt(.9)*.7,top+rr(-1,1),T.z+Math.sin(a)*rAt(.9)*.7],qEuler(rr(-.1,.1),-a,rr(.55,.95)),[L,L,L*.9],finCol(),{c2:c2(),n:[Math.cos(a)*.7,.7,Math.sin(a)*.7]});st.clumps++;}
 // the bud: a pale scaled cone at the summit
 BIO.put('scalecone',[T.x,top-.5,T.z],qEuler(0,rr(0,TAU),0),[rAt(.9)*1.8,rAt(.9)*3,rAt(.9)*1.8],C(pick(PAL.frillBud)));   // a dark scaled bud (once pale: it read as an egg)
 regTree(T,S,Math.max(T.crownR,H*.13+rAt(.9)),H+2);};

// ---------------------------------------------------------------- the geyser isle's shore (stations/isle)
// a trunk grown along a path (treeGrow), closed in a rounded knot like bole()'s, in its species' bark
function capTube(fam,S,pts,lv,st,seg){pts.forEach((p,k)=>{if(!p.col)p.col=barkCol(S,k);});const L=pts[pts.length-1],P=pts[pts.length-2],dx=L.x-P.x,dy=L.y-P.y,dz=L.z-P.z,dl=Math.hypot(dx,dy,dz)||1,r=L.r;
 st.trunk+=BIO.tube(fam,pts.concat([{x:L.x+dx/dl*r*.9,y:L.y+dy/dl*r*.9,z:L.z+dz/dl*r*.9,r:r*.85,col:L.col},{x:L.x+dx/dl*r*1.6,y:L.y+dy/dl*r*1.6,z:L.z+dz/dl*r*1.6,r:r*.3,col:L.col}]),pts[0].col,{seg:seg||(lv===2?7:4),cap:true});}
// the crown's lean: the host may give T.leanA (the isle leans its shore trees out over the sand, toward the sea)
// and on a beach (the host's 'beach' field) a palm leans downhill, out over the sand toward the water
const leanOf=T=>{if(T.leanA==null&&BIO.field('beach',T.x,T.z)>.25){const e=3,gx=BIO.terrainH(T.x+e,T.z)-BIO.terrainH(T.x-e,T.z),gz=BIO.terrainH(T.x,T.z+e)-BIO.terrainH(T.x,T.z-e);if(gx||gz)T.leanA=Math.atan2(-gz,-gx);}
 return T.leanA==null?rr(0,TAU):T.leanA+rr(-.5,.5);};

// 18 the PALM FRILL TREE (the owner, 2026-10-06: "a palm frill tree with super wide upper frills"): a palm's slender ringed
// trunk, leaning and curving up, a few short fractal fins up its top third, and at the top a palm's crown of very wide fins
// spread out and drooping at their tips; a dark bud in the middle
B[18]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,la=leanOf(T);
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,rr(1.2,1.42)),H,T.rb*1.25,T.rb*.8,lv===2?7:3,rr(.08,.2),.03);capTube('bark6',S,pts,lv,st);
 const t=tip(pts),FN=THRONE.LIB.cardsOf('fin'),fin=FN.length?()=>pick(FN):()=>'treefrond',finCol=()=>FN.length?null:bright(vary(C(pick(S.leaf)),.02,.06,.05),1.3),c2=()=>bright(C(pick(PAL.frillIrid)),1.1);
 // the fins all the way up (the owner: "gradually larger fronds all the way up"): short and narrow at the foot, each row a
 // little longer and wider than the last, staggered half a fin, into the crown's very wide ones
 {const rows=lv===2?Math.max(6,Math.round(H/1.5)):Math.max(3,Math.round(H/4)),nf=lv===2?5:3,at=u=>{const fi=u*(pts.length-1),i0=Math.floor(fi),f=fi-i0,A=pts[i0],B2=pts[Math.min(pts.length-1,i0+1)];return{x:mix(A.x,B2.x,f),y:mix(A.y,B2.y,f),z:mix(A.z,B2.z,f),r:mix(A.r,B2.r,f)};};
  for(let r=0;r<rows;r++){const u=lerp(.08,.9,r/(rows-1)),q=at(u),L0=lerp(.7,R*.55,Math.pow(u,1.35)),W=lerp(.35,1.15,u);
   for(let k=0;k<nf;k++){const a=k/nf*TAU+(r%2?Math.PI/nf:0)+rr(-.12,.12),L=L0*rr(.88,1.12);
    BIO.put(fin(),[q.x+Math.cos(a)*q.r,q.y+rr(-.2,.2),q.z+Math.sin(a)*q.r],qEuler(rr(-.08,.08),-a,lerp(1.0,.55,u)+rr(-.1,.1)),[L,L*.9,L*W],finCol(),{c2:c2(),n:[Math.cos(a)*.8,.5,Math.sin(a)*.8]});st.clumps++;}}}
 // the crown: a palm's spread of very wide fins (W 1.3-1.8 of their length): seven to ten round the top, out and angled
 // down like old fronds, and three young ones standing up in the middle
 for(let k=0,n=lv===2?ri(10,13):6;k<n;k++){const a=k*GOLD+rr(-.1,.1),outer=k>=3,L=R*rr(.9,1.2)*(outer?1:.65),W=outer?rr(1.3,1.8):rr(.8,1.1);
  BIO.put(fin(),[t.x+Math.cos(a)*.3,t.y-.2,t.z+Math.sin(a)*.3],qEuler(rr(-.12,.12),-a,outer?rr(-.5,-.12):rr(.75,1.05)),[L,L*.9,L*W],finCol(),{c2:c2(),n:[Math.cos(a)*.5,.85,Math.sin(a)*.5]});st.clumps++;}
 BIO.put('scalecone',[t.x,t.y-.2,t.z],qEuler(0,rr(0,TAU),0),[T.rb*2.2,T.rb*4,T.rb*2.2],C(pick(PAL.frillBud)));
 regTree(T,S,Math.hypot(t.x-T.x,t.z-T.z)+R,t.y-T.y0+R*.5);};

// 19 the HYPER-MANGROVE (the owner: "some sort of hyper-mangrove"): a hypertree's mangrove in the isle's warm lagoon. Its
// trunk begins a man's height up, held on a skirt of arching prop roots taller than a man; limbs spread wide and low under
// a broad, flat crown of glossy leaves; roots drop from the limbs straight down into the mud
B[19]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,rb=T.rb,h0=rr(2.6,4.4),gy=(x,z)=>BIO.terrainH(x,z);
 const trunk=treeGrow({x:T.x,y:T.y0+h0*.55,z:T.z},dirOf(rr(0,TAU),rr(1.32,1.5)),H*.42,rb,rb*.72,lv===2?5:3,0,.05);capTube('bark7',S,trunk,lv,st);
 // the prop roots: from the trunk's foot, out and over in an arch, down into the mud well clear of the trunk
 for(let k=0,n=lv===2?ri(12,18):7;k<n;k++){const a=k/n*TAU+rr(-.2,.2),hs=T.y0+h0*rr(.55,1.35),d=rb*rr(3.5,7)+rr(1,3),ex=T.x+Math.cos(a)*d,ez=T.z+Math.sin(a)*d,ey=gy(ex,ez)-.5,P=[],m=lv===2?6:3;
  for(let i=0;i<=m;i++){const t=i/m,rr0=rb*.8*(1-t)+d*t;P.push({x:T.x+Math.cos(a)*rr0,y:mix(hs,ey,t*t)+h0*.45*Math.sin(Math.PI*t)*(1-t*.5),z:T.z+Math.sin(a)*rr0,r:Math.max(.07,rb*mix(.24,.1,t))});}
  st.limb+=BIO.tube('bark7',P,barkCol(S,k),{seg:lv===2?5:3});}
 // the limbs: four to seven from the trunk's top half, out wide and only a little up
 const tops=[];for(let k=0,n=lv===2?ri(4,7):4;k<n;k++){const a=k*GOLD+rr(-.3,.3),q=trunk[Math.min(trunk.length-1,Math.floor(trunk.length*rr(.45,.95)))];
  const L=treeGrow(q,dirOf(a,rr(.2,.55)),R*rr(.7,1.0),rb*.45,rb*.15,lv===2?5:3,-.08,.08);limb('bark7',S,L,k,lv,st);tops.push(L);
  // roots dropped from the limb to the mud (thin, straight, a few metres apart)
  if(lv===2)for(let j=0,m=ri(1,3);j<m;j++){const p=L[ri(2,L.length-1)],y1=gy(p.x,p.z)-.4;if(p.y-y1<2)continue;st.limb+=BIO.tube('bark7',[{x:p.x,y:p.y,z:p.z,r:.06},{x:p.x+rr(-.2,.2),y:mix(p.y,y1,.6),z:p.z+rr(-.2,.2),r:.05},{x:p.x+rr(-.3,.3),y:y1,z:p.z+rr(-.3,.3),r:.08}],barkCol(S,j),{seg:3});}}
 // the crown: a broad flat dome of glossy clumps over the limbs' ends and between them
 const ct=tip(trunk),cy=ct.y+R*.15,hc=C(pick(S.leaf));
 for(let k=0,n=lv===2?ri(34,48):12;k<n;k++){const L=pick(tops),p=L[ri(1,L.length-1)],q=rr(0,TAU),d=rr(0,R*.35),x=p.x+Math.cos(q)*d,z=p.z+Math.sin(q)*d,y=Math.max(p.y,cy-R*.2)+rr(.2,2.2);
  clumpAt('glossy',x,y,z,R*rr(.22,.32)*(lv===2?1:1.5),.6,hc,ct.x,cy,ct.z,R,R*.35);st.clumps++;}
 regTree(T,S,R+2,H+R*.3);};

// 20 the COCONUT PALM (the owner: "an actual coconut palm... hooked into the fruit system"): Earth's coconut, the one tree
// every shore of the Ring Sea has. A slender grey ringed trunk swollen at its foot, leaning out (over the sand on the isle)
// and curving upright; a crown of long pinnate fronds, the young ones up, the old drooping, a dead brown one hanging; the
// nuts in a bunch under the crown, and fallen ones at its foot. Its fruit is the catalog's generic_fruit_coconut
B[20]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,la=leanOf(T);
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,rr(1.05,1.35)),H,T.rb*1.1,T.rb*.75,lv===2?8:3,rr(.15,.3),.025);
 pts[0].r*=1.45;if(pts[1])pts[1].r*=1.12;
 // the owner's coir in its own colour (white vertices, a little varied ring to ring); without it the palm bark under the species' greys
 if(THRONE.LIB.coir)pts.forEach(p=>{p.col=C(0xffffff).multiplyScalar(rr(.82,1));});capTube(THRONE.LIB.coir?'coir':'bark6',S,pts,lv,st);
 const t=tip(pts),fc=C(pick(S.leaf)),PF=THRONE.LIB.cardsOf('palmfrond'),frond=()=>PF.length?pick(PF):'palmfrond';
 for(let k=0,n=lv===2?ri(18,24):10;k<n;k++){const a=k*GOLD+rr(-.08,.08),age=k/n,L=R*rr(.95,1.2)*(age<.2?.75:1);
  BIO.put(frond(),[t.x,t.y,t.z],qEuler(rr(-.1,.1),-a,lerp(.85,-.55,age)+rr(-.12,.12)),[L,L*.85,L*rr(1.25,1.5)],PF.length?C(0xffffff).multiplyScalar(rr(.85,1.05)):bright(vary(fc,.03,.08,.06),1.15),{n:[Math.cos(a)*.35,1,Math.sin(a)*.35]});st.clumps++;}
 if(lv===2){for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),L=R*rr(.6,.8);BIO.put(frond(),[t.x,t.y-.4,t.z],qEuler(rr(-.1,.1),-a,-rr(1.2,1.45)),[L,L*.8,L*.5],PF.length?C(0xb08a52):leafCol([0x8a6a3a,0x7a5a30,0x9a7a48],1.0,.02,.05,.05),{n:[0,1,0]});}
  // the nuts: a bunch or two hung under the crown, green, yellow and brown
  for(let b=0,nb=ri(1,3);b<nb;b++){const a=rr(0,TAU),bx=t.x+Math.cos(a)*.45,bz=t.z+Math.sin(a)*.45,by=t.y-.55;
   for(let k=0,n=ri(4,9);k<n;k++){const s=rr(.13,.17),q=rr(0,TAU),d=rr(.05,.32);BIO.put('coconut',[bx+Math.cos(q)*d,by-rr(0,.45),bz+Math.sin(q)*d],qEuler(rr(-.6,.6),rr(0,TAU),rr(-.6,.6)),[s*1.15,s,s],C(pick(PAL.coconut)));st.fruit=(st.fruit||0)+1;}}
  // and a few fallen at its foot, browned
  for(let k=0,n=ri(0,4);k<n;k++){const q=rr(0,TAU),d=rr(.8,R*.6),x=T.x+Math.cos(q)*d,z=T.z+Math.sin(q)*d,s=rr(.13,.16);BIO.put('coconut',[x,BIO.terrainH(x,z)+s*.7,z],qEuler(rr(-.3,.3),rr(0,TAU),Math.PI/2+rr(-.3,.3)),[s*1.15,s,s],C(pick(PAL.coconutFallen)));st.fruit=(st.fruit||0)+1;}}
 regTree(T,S,Math.hypot(t.x-T.x,t.z-T.z)+R,t.y-T.y0+R*.4);};

// ---------------------------------------------------------------- the cloud forest (stations/cloudforest)
// 21 the ELFIN TREE (the owner: "elfin forest in the mist"): the cloud belt's gnarled dwarf. Two to four crooked stems from
// one foot, each forking twice into twisting limbs; every limb cushioned with moss and hung with moss curtains, bromeliads
// in the forks, a flat crown of small hard leaves shorn by the wind
B[21]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,MH=THRONE.LIB.cardsOf('mosshang'),tips=[],mossC=()=>leafCol(PAL.elfinMoss,1.1,.03,.08,.06);
 const grow=(o,d,len,r0,depth,k)=>{const P=treeGrow(o,d,len,r0,r0*.6,lv===2?5:3,-.08,.22);P.forEach((p,i)=>p.col=THRONE.LIB.elfin?C(0xffffff).multiplyScalar(rr(.8,1)):barkCol(S,k+i));
  if(depth===0)capTube('elfin',S,P,lv,st,lv===2?5:3);else limb('elfin',S,P,k,lv,st);
  // moss: cushions along the limb (the upper side), curtains hung under it
  if(lv===2)for(let i=1+(depth%2);i<P.length;i+=3){const p=P[i],s=p.r*rr(2.4,3.8);BIO.put('mossclump',[p.x,p.y+p.r*.6,p.z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.6,s],THRONE.LIB.mossclump?null:mossC(),{n:[0,1,0]});
   if(MH.length&&rng()<.55){const h=rr(.7,1.6);BIO.put(pick(MH),[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[h*.8,h,h*.8],null);st.drips++;}}
  const t=tip(P);if(depth<(lv===2?2:1)&&len>1.2){const n=lv===2&&depth===0?ri(2,3):2;for(let j=0;j<n;j++){const a=rr(0,TAU),el=rr(.15,.7);grow(t,dirOf(a,el),len*rr(.55,.75),t.r*.85,depth+1,k+j+1);}}
  else tips.push(t);};
 for(let k=0,n=lv===2?ri(2,4):1;k<n;k++){const a=rr(0,TAU),base={x:T.x+Math.cos(a)*T.rb*.6,y:T.y0-.3,z:T.z+Math.sin(a)*T.rb*.6};grow(base,dirOf(a,rr(.95,1.3)),H*rr(.4,.55),T.rb*(k?.75:1),0,k*7);}
 // the crown: flat, dense, over the limbs' tips
 const hc=C(pick(S.leaf));let top=T.y0;tips.forEach(t=>top=Math.max(top,t.y));
 tips.forEach(t=>{for(let k=0,n=lv===2?2:1;k<n;k++){const q=rr(0,TAU),d=rr(0,R*.25);clumpAt('small',t.x+Math.cos(q)*d,t.y+rr(-.2,.4),t.z+Math.sin(q)*d,R*rr(.32,.45)*(lv===2?1:1.4),.5,hc,T.x,top,T.z,R,H*.3);st.clumps++;}});
 if(lv===2&&rng()<.5){const t=pick(tips),s=rr(.3,.55);BIO.put('bromeliad',[t.x,t.y-.3,t.z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.6,s],THRONE.LIB.bromeliad?null:leafCol(PAL.bromeliad,1.2),{n:[0,1,0]});}
 // registered by its real reach (its crooked limbs can carry the crown past crownR)
 let reach=R;tips.forEach(t=>reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+R*.5));regTree(T,S,reach+1,top-T.y0+R*.4);};

// 22 the VEIL TREE (Krator's own, the cloud forest's little alien flavour): a slender pale trunk, its limbs arching out and
// down, each hung along its length with veils of fine pink filaments that comb the water from the cloud; they glow faintly
// at night (the weeper cards on the glow material; without the pack, feather tufts)
B[22]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,W=THRONE.LIB.cardsOf('weeper');
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.35,1.52)),H,T.rb,T.rb*.55,lv===2?6:3,0,.06);pts.forEach((p,i)=>p.col=barkCol(S,i));capTube('bark7',S,pts,lv,st);
 for(let k=0,n=lv===2?ri(4,7):3;k<n;k++){const a=k*GOLD+rr(-.2,.2),o=pts[Math.min(pts.length-1,Math.floor(pts.length*rr(.55,.95)))];
  const L=treeGrow(o,dirOf(a,rr(.25,.6)),R*rr(.8,1.1),T.rb*.4,.04,lv===2?5:3,-.45,.05);limb('bark7',S,L,k,lv,st);
  for(let i=1;i<L.length;i++){const p=L[i],h=rr(2,4.5)*(1+.3*i/L.length);
   if(W.length)BIO.put(pick(W),[p.x,p.y,p.z],qEuler(0,rr(0,TAU),0),[h*.55,h,h*.55],null);else BIO.put('feather',[p.x,p.y-h*.5,p.z],qEuler(Math.PI,rr(0,TAU),0),[h*.3,h,h*.3],leafCol(S.leaf,1.2));st.clumps++;}}
 regTree(T,S,R+1,H+1);};

// ---------------------------------------------------------------- the lava casts
// Where a flow ran into the forest it swallowed the trees and cooled round them; the wood burned out and left stone shells
// standing in the young lava: hollow pillars of rock, a bark pattern pressed into their outsides (bark1, the charcoal lava
// bark), dark inside. They stand just outside a kipuka (knear), on young and mature flows.
THRONE.buildCasts=function(R,q){reseed(560047);q=q==null?1:q;let n=0;
 // landmarks, not a forest of them: a few tens on a map, only where the flow touched the trees
 BIO.grid(90,0,R,(x,z)=>{const Z=zones(x,z);return smooth(.15,.4,Z.knear)*(Z.young+Z.mature+Z.fresh*.6)*Z.wetW*.22*q;},(x,y,z)=>{if(blocked(x,z,2))return;
  const h=rr(2.5,11),r0=rr(.9,2.6),lean=rr(-.08,.08),la=rr(0,TAU),seg=12,P=[];
  for(let k=0;k<=5;k++){const t=k/5,rk=r0*(1+.35*smooth(.3,0,t))*(1-.12*t);P.push({x:x+Math.cos(la)*lean*h*t,y:y-.6+(h+.6)*t,z:z+Math.sin(la)*lean*h*t,r:rk,col:shade(C(pick([0x4a4644,0x3e3a38,0x56504c])),rr(-.1,.05))});}
  BIO.tube('bark1',P,P[0].col,{seg,cap:false,rfn:(i,a)=>1+.07*Math.sin(a*5+i)+(i===5?.18*Math.sin(a*3+x):0)});
  // the hollow: an inner wall, dark, a little narrower (the burnt-out heart)
  const I=P.map(p=>({x:p.x,y:p.y,z:p.z,r:p.r*.72,col:C(0x161412)}));I[0].y+=1.2;BIO.tube('bark1',I,I[0].col,{seg:10,cap:false});
  // moss or lichen on its broken rim, rubble of its fallen crust at its foot (and the inspector's volume holds them)
  const top=P[5];BIO.put(THRONE.LIB.mossclump?'mossclump':'lichen',[top.x,top.y+.1,top.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[top.r*1.3,top.r*.5,top.r*1.3],THRONE.LIB.mossclump?null:leafCol(PAL.lichen,1.05,.02));
  for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),d=r0*rr(1.1,1.8),sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,sr=rr(.2,.6);BIO.put('stone',[sx,BIO.terrainH(sx,sz)+sr*.2,sz],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[sr*1.2,sr*.6,sr],shade(C(pick([0x4a4644,0x3e3a38])),rr(-.1,.05)));}
  BIO.register({name:'A lava cast of a swallowed tree',key:'cast',x,z,y:y-1,r:r0*2,h:h+2});hadd({x,z,r:r0*1.4});n++;},{patch:.4,patchScale:.01,pad:2});
 THRONE.CASTS=n;return n;};

// ---------------------------------------------------------------- impostors (the far canopy)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far,bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=4,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.25,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 const Lc=S.leaf.map(h=>bright(h,.9)),R=T.crownR;
 const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?Lc[fi%Lc.length]:Lc[+c[1]%Lc.length];
 F.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,R*b[1],Math.max(.4,T.H*b[2]),colOf(b[3]),colOf(b[4]),fi+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- vent country (stations/vents)
// 23 the BRIMSTONE CANDELABRA (the owner: "sulfur extremophile macroflora" for the marsh and the sulphurous ground): Krator's
// own, living on the vents' gas. Four to six stilt roots arching down into the acid shallows or the crust; a short trunk
// banded with yellow sulphur crust; three to six arms that leave it near level and turn up like a candelabrum's, each
// ending in a fluted orange cup (faintly glowing at night: the glow material, its own colour)
B[23]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,lib=THRONE.LIB.brimstone,fam=lib?'brimstone':fam,crust=k=>lib?C(0xffffff).multiplyScalar(.9):C(pick(PAL.brimCrust)).lerp(barkCol(S,k),.3),band=(k,i)=>lib?C(0xffffff).multiplyScalar(.86+.04*((i*7+k*3)%4)):(i%3===1)?crust(k):barkCol(S,k);   // with the owner's bark its own bands show (white under it)
 const rootTop=T.y0+H*rr(.12,.2),seg=lv===2?5:3;
 for(let k=0,n=lv===2?ri(4,6):3;k<n;k++){const a=k/n*TAU+rr(-.3,.3),d=T.rb*rr(2.6,4),c=barkCol(S,k+3);
  st.limb+=BIO.tube(fam,[{x:T.x+Math.cos(a)*d,y:T.y0-.4,z:T.z+Math.sin(a)*d,r:T.rb*.26,col:crust(k)},{x:T.x+Math.cos(a)*d*.6,y:mix(T.y0,rootTop,.75),z:T.z+Math.sin(a)*d*.6,r:T.rb*.3,col:c},
   {x:T.x+Math.cos(a)*T.rb*.3,y:rootTop+.2,z:T.z+Math.sin(a)*T.rb*.3,r:T.rb*.4,col:c}],c,{seg});}
 const pts=treeGrow({x:T.x,y:rootTop,z:T.z},dirOf(rr(0,TAU),rr(1.45,1.56)),H*rr(.3,.4),T.rb,T.rb*.75,lv===2?5:3,0,.04);pts.forEach((p,i)=>p.col=band(i,i));capTube(fam,S,pts,lv,st);
 const fork=tip(pts);let top=fork.y,reach=R*.5;
 for(let k=0,n=lv===2?ri(3,6):3,a0=rr(0,TAU);k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),out=R*rr(.45,.8),up=Math.max(1,(T.y0+H)-fork.y)*rr(.7,1.05),r0=T.rb*.5;
  // out near level, then up: one polyline (the elbow rounded by its points), banded like the trunk
  const A=treeGrow(fork,dirOf(a,rr(.08,.3)),out,r0,r0*.8,lv===2?3:2,.1,.03),e=tip(A),U=treeGrow(e,dirOf(a+rr(-.15,.15),rr(1.3,1.5)),up,r0*.8,r0*.55,lv===2?3:2,0,.03);
  const P=A.concat(U.slice(1));P.forEach((p,i)=>p.col=band(k,i));st.limb+=BIO.tube(fam,lv===2?P:[P[0],e,tip(P)],P[0].col,{seg:lv===2?5:3,cap:true});
  const t=tip(P),s=R*rr(.2,.3);BIO.put('brimcup',[t.x,t.y-s*.15,t.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*rr(.9,1.2),s],vary(C(pick(PAL.brimCup)),.03,.08,.06));st.caps++;
  top=Math.max(top,t.y+s);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);}
 regTree(T,S,reach+1,top-T.y0+1);};

// ---------------------------------------------------------------- the glacier's cold belt (stations/glacier)
// 24 the GILL-CORAL TREE (the owner's reference, refs/02): two to four twisted stems from one foot, streaked teal and dark
// red, leaning apart; each ends in a broad salmon cap ridged like a plate coral on top; on a big tree a smaller cap part-way
// up its main stem. Snow on the caps where it lies (the 'snow' field)
B[24]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,sn=BIO.field('snow',T.x,T.z),seg=lv===2?6:4;let top=T.y0,reach=R;const P=[];
 const stripe=i=>C(i%2?pick([PAL.gcBark[0],PAL.gcBark[2],PAL.gcBark[4]]):pick([PAL.gcBark[1],PAL.gcBark[3]]));
 for(let k=0,n=lv===2?ri(2,4):2;k<n;k++){const a=k/n*TAU+rr(-.4,.4),h=H*(k?rr(.6,.92):1),lean=k?rr(.12,.3):rr(0,.08),s=R*(k?rr(.55,.8):1);
  // its stem out from the clump until its cap clears its siblings' (the lamp caps' rule)
  let d=k?rr(.3,.8):0,x=T.x,z=T.z,tx=x,tz=z,ok=false;for(let i=0;i<12;i++){x=T.x+Math.cos(a)*d;z=T.z+Math.sin(a)*d;tx=x+Math.cos(a)*lean*h;tz=z+Math.sin(a)*lean*h;
   if(capClear(P,tx,tz,T.y0+h-s*.6,T.y0+h+s*.5,s)){ok=true;break;}d+=s*.3;if(d>R*.9)break;}   // not pushed past its own room: a stem with no room is left out
  if(!ok)continue;
  const pts=bole(T,S,'bark7',x,z,h,T.rb*(k?.75:1),T.rb*.55,lean,a,.07,lv===2?6:3,st,seg,(t,i)=>stripe(i));
  const t=tip(pts),cc=(THRONE.LIB.gcoralT?C(0xffffff).lerp(C(pick(S.leaf)),.2).multiplyScalar(rr(.9,1.05)):vary(C(pick(S.leaf)),.02,.06,.05)).lerp(C(0xf2f4f6),sn*.35);
  BIO.put('gcoral',[t.x,t.y-s*.5,t.z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[s,s*rr(.5,.65),s],cc);st.caps++;P.push({x:t.x,z:t.z,s,y0:t.y-s*.6,y1:t.y+s*.5});
  if(lv===2&&k===0&&H>11){const m=along(pts,rr(.45,.65)),s2=s*rr(.35,.5),ba=a+rr(2,4),bx=m.x+Math.cos(ba)*s2*.8,bz=m.z+Math.sin(ba)*s2*.8;if(capClear(P,bx,bz,m.y,m.y+s2*1.2,s2)){P.push({x:bx,z:bz,s:s2,y0:m.y,y1:m.y+s2*1.2});   // only where it clears the caps
   st.limb+=BIO.tube('bark7',[{x:m.x,y:m.y,z:m.z,r:m.r*.6,col:stripe(0)},{x:bx,y:m.y+s2*.8,z:bz,r:m.r*.35,col:stripe(1)}],stripe(0),{seg:4,cap:true});
   BIO.put('gcoral',[bx,m.y+s2*.6,bz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s2,s2*.55,s2],cc);st.caps++;}}
  top=Math.max(top,t.y+s*.5);reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+s);}
 regTree(T,S,reach+1,top-T.y0+1);};

// 25 the GLASS WILLOW (Krator's own, at the treeline): a dark slender trunk, limbs arching out and down, each hung along its
// length with long translucent ice-blue strands (feather tufts, hung) and a few short icicles
B[25]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR;
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.38,1.52)),H,T.rb,T.rb*.45,lv===2?6:3,0,.07);pts.forEach((p,i)=>p.col=barkCol(S,i));capTube('bark7',S,pts,lv,st);
 for(let k=0,n=lv===2?ri(5,8):3;k<n;k++){const a=k*GOLD+rr(-.25,.25),o=pts[Math.min(pts.length-1,Math.floor(pts.length*rr(.5,.92)))];
  const L=treeGrow(o,dirOf(a,rr(.3,.65)),R*rr(.85,1.15),T.rb*.38,.035,lv===2?5:3,-.55,.05);limb('bark7',S,L,k,lv,st);
  for(let i=1;i<L.length;i++){const p=L[i],h=rr(1.8,4)*(1-.35*i/L.length);
   BIO.put('feather',[p.x,p.y+p.r*.5,p.z],qEuler(Math.PI,rr(0,TAU),0),[h*.28,h,h*.28],vary(C(pick(S.leaf)),.02,.05,.05));st.clumps++;   // turned to hang: its base (now its top) on the limb
   if(lv===2&&rng()<.5){const l=rr(.3,1.1);BIO.beam('rod',[p.x,p.y,p.z],[p.x+rr(-.05,.05),p.y-l,p.z+rr(-.05,.05)],.03,.006,C(0xe0f0fa));}}}
 regTree(T,S,R+1.5,H+1);};

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('throne: no builder for species '+i+' '+S.key);});
const newStats=()=>({fruit:0,drips:0,trunk:0,limb:0,far:0,clumps:0,caps:0,funnels:0,pods:0,stars:0,tiers:0,pitchers:0,bells:0,puffs:0,lamps:0,resin:0,heroes:0,fars:0,byS:SP.map(()=>0)});
THRONE.buildTrees=function(R,q){
 reseed(550047);q=q==null?1:q;R=R||2500;means();
 const st=newStats();
 const TREES=THRONE.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=THRONE.make(sp,x,y,z);
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!S.far)return;
    TREES.push(T);hadd({x:x,z:z,r:opt.reach?opt.reach(T):T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2,depth:opt.depth,noMask:!!opt.depth});
  return n;}
 THRONE.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 THRONE.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),caps:st.caps,funnels:st.funnels,pods:st.pods,stars:st.stars,
  tiers:st.tiers,pitchers:st.pitchers,bells:st.bells,puffs:st.puffs,lamps:st.lamps,resin:st.resin,fruit:st.fruit,clumps:st.clumps,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
THRONE._canopyH=function(x,z){let h=0;for(const T of THRONE.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
THRONE.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of THRONE.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The shoulder's (1-alien) and the plume's (alien) share each stage of the mosaic between them; the seam, the vents, the
// gullies and the skylights have their own. The tall first (they claim their ground).
const shoulder=Z=>(1-Z.alien)*Z.dryW,woods=Z=>Z.mature+Z.old;
THRONE.PASSES=[
 // the windward (wetW): the great ruffs and the frill trees on the kipuka's rim, the siphon trees in the skylights, the pioneers on
 // the young lava (lehua, tree ferns), the arch palms; the shoulder's dry species below are gated by dryW
 {sp:12,cell:150,accept:Z=>Z.kedge*Z.wetW*.6,opt:{pad:20,patch:.2,patchScale:.004}},
 {sp:17,cell:80,accept:Z=>(Z.kedge*.5+Z.mature*.12+Z.gully*.2)*Z.wetW,opt:{pad:8,patch:.4,patchScale:.006}},
 {sp:13,cell:10,accept:Z=>Z.sky*Z.wetW*.85,opt:{pad:6,patch:0}},
 {sp:14,cell:24,accept:Z=>(Z.young*.32+Z.mature*.36+Z.fresh*.015)*Z.wetW,opt:{pad:2,patch:.55,patchScale:.01}},
 {sp:16,cell:30,accept:Z=>(Z.mature*.12+Z.gully*.25+Z.coast*.55*(1-Z.beach)+Z.grove*.14+Z.iwood*.06)*Z.wetW,opt:{pad:2.5,patch:.5,patchScale:.008}},
 {sp:15,cell:14,accept:Z=>(Z.mature*.38+Z.young*.06+Z.gully*.5+Z.grove*.22)*Z.wetW,opt:{pad:1.4,patch:.55,patchScale:.012,small:true}},
 {sp:11,cell:50,accept:Z=>woods(Z)*shoulder(Z)*.32+Z.cinder*shoulder(Z)*.18+Z.young*shoulder(Z)*.04,opt:{pad:4,patch:.5,patchScale:.006}},
 {sp:3,cell:40,accept:Z=>woods(Z)*smooth(.08,.4,Z.alien)*(1-smooth(.6,.92,Z.alien))*.4+Z.young*Z.seam*.05,opt:{pad:3,patch:.5,patchScale:.008}},
 {sp:6,cell:38,accept:Z=>(Z.mature*.3+Z.old*.38+Z.young*.07)*Z.alien+Z.cinder*Z.alien*.06,opt:{pad:3,patch:.55,patchScale:.008}},
 {sp:8,cell:30,accept:Z=>Z.vent*.6+Z.halo*Z.alien*.18,opt:{pad:3,patch:.3,patchScale:.012}},
 {sp:4,cell:28,accept:Z=>Z.gully*(.25+.45*Z.alien)+Z.old*Z.alien*.035+Z.marsh*.12,opt:{pad:1.5,patch:.5,patchScale:.012}},
 {sp:0,cell:28,accept:Z=>(woods(Z)*Z.seam*.22+Z.halo*(1-Z.alien*.4)*.55)*Z.dryW+Z.grove*.62,opt:{pad:2.5,patch:.45,patchScale:.01}},
 {sp:1,cell:28,accept:Z=>Z.gully*(1-Z.alien*.55)*.5+woods(Z)*shoulder(Z)*.05+Z.sky*.18,opt:{pad:2.5,patch:.5,patchScale:.01}},
 {sp:2,cell:32,accept:Z=>woods(Z)*shoulder(Z)*.2+Z.young*shoulder(Z)*.1+Z.knear*(Z.young+Z.fresh*.5)*Z.wetW*.4,opt:{pad:2,patch:.55,patchScale:.01}},
 {sp:9,cell:30,accept:Z=>((Z.old*.18+Z.mature*.1)*Z.alien+Z.cinder*Z.alien*.3)*(1-.85*Z.ashdeep),opt:{pad:2,patch:.55,patchScale:.01}},
 {sp:7,cell:24,accept:Z=>(woods(Z)*Z.alien*.09+Z.marsh*.4*Z.alien+Z.gully*Z.alien*.3+Z.sky*.2*Z.alien)*(1-.5*Z.ashdeep),opt:{pad:5.5,reach:T=>T.crownR*2.3,patch:.55,patchScale:.012}},   // a clump: its own reach reserved (they clipped)
 {sp:5,cell:24,accept:Z=>(Z.young*.32+Z.mature*.1+Z.old*.04)*shoulder(Z)+Z.cinder*shoulder(Z)*.24,opt:{pad:1.5,patch:.55,patchScale:.012}},
 {sp:10,cell:11,accept:Z=>Z.sky*.55+Z.gully*Z.alien*.3+woods(Z)*Z.alien*.035+Z.vent*.08+Z.marsh*.15*Z.alien,opt:{pad:2.8,reach:T=>T.crownR*2.2,patch:.6,patchScale:.016,lodK:.5,small:true}},
 // THE GEYSER ISLE's (stations/isle), last: a pass draws from the PRNG in every cell, so passes added before the others
 // would reshuffle every other station's trees. Coconut palms along the beaches' backs, palm frill trees on the beaches and
 // in the woods, and the woods themselves: a closed forest of lehua over tree ferns, smaller than the flank's (an island's)
 {sp:14,cell:13,accept:Z=>Z.iwood*Z.wetW*.8,opt:{pad:2.2,patch:.35,patchScale:.008}},
 {sp:15,cell:9,accept:Z=>Z.iwood*Z.wetW*.3,opt:{pad:1.2,patch:.5,patchScale:.012,small:true}},
 {sp:20,cell:16,accept:Z=>(Z.beach*.6+Z.iwood*.03+Z.grove*.05)*Z.wetW,opt:{pad:2.5,patch:.45,patchScale:.012}},
 {sp:18,cell:30,accept:Z=>(Z.beach*.22+Z.iwood*.07+Z.grove*.08)*Z.wetW,opt:{pad:3,patch:.5,patchScale:.008}},
 // THE CLOUD FOREST's (stations/cloudforest), after the isle's: the elfin woods, their tree ferns, a few gnarled lehua over
 // them, the veil trees scattered through and along the ravines
 {sp:14,cell:26,accept:Z=>Z.cforest*Z.wetW*.14,opt:{pad:3,patch:.5,patchScale:.008}},
 {sp:22,cell:38,accept:Z=>(Z.cforest*.07+Z.gully*Z.cforest*.25)*Z.wetW,opt:{pad:4,patch:.5,patchScale:.01}},
 {sp:21,cell:16,accept:Z=>Z.cforest*Z.wetW*.8,opt:{pad:1.6,patch:.4,patchScale:.012}},
 // and close round the cameras a second, denser stand (in the cloud nothing farther is seen)
 {sp:21,cell:9,accept:(Z,x,z)=>BIO.lodD(x,z)<90?Z.cforest*Z.wetW*.75:0,opt:{pad:1.4,patch:.3,patchScale:.012}},
 {sp:15,cell:18,accept:Z=>(Z.cforest*.2+Z.gully*Z.cforest*.45)*Z.wetW,opt:{pad:1.4,patch:.5,patchScale:.012,small:true}},
 // THE SAVANNA's (stations/savanna), after the cloud forest's: stilt parasols along the braided channels, the gill-parasol
 // woodland, star aloes over the grass, Krator's familiar crossers scattered (frill-trees, trumpet trees); fewer on the burn
 {sp:4,cell:25,accept:Z=>Z.braid*.55,opt:{pad:3,patch:.5,patchScale:.01}},
 {sp:3,cell:21,accept:Z=>Z.capwood*.62*(1-Z.burn*.7),opt:{pad:3,patch:.45,patchScale:.01}},
 {sp:1,cell:46,accept:Z=>(Z.savanna*.07+Z.capwood*.05)*(1-Z.burn*.6),opt:{pad:4,patch:.5,patchScale:.008}},
 {sp:2,cell:32,accept:Z=>(Z.savanna*.08+Z.braid*.04)*(1-Z.burn*.6),opt:{pad:3,patch:.5,patchScale:.01}},
 {sp:5,cell:15,accept:Z=>Z.savanna*.11*(1-Z.burn*.5),opt:{pad:2,patch:.6,patchScale:.012}},
 // VENT COUNTRY's (stations/vents), after the savanna's: the brimstone candelabras on the sulphurous ground, standing in
 // the marsh's shallows too (up to ~0.6 m of water)
 {sp:23,cell:16,accept:Z=>Z.sulph*.45,opt:{pad:2.5,reach:T=>T.crownR*.9+1,patch:.45,patchScale:.012,depth:[-1e12,.6]}},
 // THE GLACIER's (stations/glacier), after vent country's: the cold belt's woods, conifers (ash pines, dusted with snow) and
 // gill-coral trees among them
 {sp:11,cell:16,accept:Z=>Z.cbelt*.3*(1-.85*Z.rivbank),opt:{pad:3,reach:T=>T.crownR*.95,patch:.5,patchScale:.008}},
 {sp:24,cell:15,accept:Z=>Z.rivbank*.95+Z.cbelt*.07,opt:{pad:8,reach:T=>T.crownR*2.4,patch:.5,patchScale:.01}},
 // the glass willows (after the gill-corals: a pass added last moves nothing before it): scattered at the treeline above the
 // woods and among them
 {sp:25,cell:24,accept:Z=>(Z.tundra*.16+Z.cbelt*.05)*(1-.6*Z.rivbank)*(1-Z.dz),opt:{pad:3,reach:T=>T.crownR*1.1,patch:.5,patchScale:.01}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
THRONE.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),age:THRONE.ageAt(x,z)};};
THRONE.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
