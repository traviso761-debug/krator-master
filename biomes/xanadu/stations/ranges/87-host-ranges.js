// ================================================================= HOST — the high ranges' own life (station 3; the final rebuild, 2026-11-03)
// The kit's lowland TREES pass stays off here (LAND.mask: the Vale's gardens do not climb to 3 km); its FLOOR planters stay on and read the fields
// (45b): moss, ferns and baneberry under the boreal side, gold grass and flowers in the Vale side's open woodland, silver tufts, stars, thyme and
// boulders on the fell-field, giant ferns and moss in the amphitheatre's spray; the strata's ledges and talus (src/87-host-ledges.js). This adds:
//   THE AGATE PINE (agatepine): the Xanadu conifer the plan asks for, "the agate tree's banding carried into a pine's bark": a tall clean bole on the
//        agate tree's own banded bark (family xbarkA: rust, ochre, violet, slate), two to four upswept main limbs (BIO.tube, their joints flared:
//        BIO.flareJoin) and level whorls of short boughs carrying tufted blue-green needle pads; open woodland over gold grass on the Vale side (Dsc)
//   THE MIST SPRUCE (mistspruce): the wetter south-east's boreal tree (Dfc): a dark slate bole, a narrow spire of drooping tiered boughs, needles near
//        black-teal with the kit's iridescent sheen at the tips; close stands in the cloud belt
//   KRUMMHOLZ: the agate pine at the treeline as its own cousin (BIO.kin('xanadu.agatepine', {scale, habit:{krumm}})): wind-trained, knee-high, flagged
//   THE DWARF FROST WILLOW (dwarfwillow): EXCHANGES.md xanadu->godthrone, "a prostrate dwarf willow, ankle-high, with the iridescent leaf kept", in the
//        ET band (4.8-5.7 km) by the stream, the tarn and the snowbeds. Its record is the frost willow's (key frostwillow) by BIO.kinRecord, so its tags
//        say tags.kin = 'xanadu.frostwillow'; its builder is its own (the frost willow's weeps its strands 1.5-9 m, into the ground at this size).
//        The Godthrone reads it with BIO.kin('xanadu.dwarfwillow', ...) through XANADU.builders (core/biome 20, kitBuilder's own builders)
//   CUSHIONS: the fell-field's cushion plants on the kit's cushion item, moss-green and flowering pink, white and yellow
//   SNOW THAT LIES (core/atmos fx/snowcover): the glacier's accumulation zone always white above 5.5-6.0 km (base 1, frozen air); the weather's snow
//        builds on the rest of the ground
// Every placement is a KRAND cell (hash of the station's seed, the species, the cell), never the draws before it. Heroes within 420 m of the LOD
// spine, octahedral impostors past that (the two conifers; ?diet=0 none); the small plants within their own ranges only.
const RANGES=(function(){
 const SEED=0x2A45E3,TAU2=Math.PI*2,C=h=>new THREE.Color(h),PAL=XANADU.PAL,FW=XANADU.SPECIES.find(S=>S.key==='frostwillow');
 const LOD={tree:420,krumm:380,small:320};   /* the heroes and the small plants near the LOD spine only: the page held 62.5 M tris at 900/650/520 (the kit's budget is 30 M) */
 const rnd=s=>({u:()=>s.next(),r:(a,b)=>a+(b-a)*s.next(),i:(a,b)=>a+Math.floor(s.next()*(b-a+1)),pick:A=>A[Math.floor(s.next()*A.length)%A.length]});
 const vary=(c,dl,R)=>{const x=c.clone?c.clone():C(c);x.offsetHSL(R.r(-.015,.015),R.r(-.04,.04),R.r(-dl,dl));return x;};
 const qE=(x,y,z)=>{const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));return[q.x,q.y,q.z,q.w];};
 /* a needle pad on a bough's end: the card's centre on the wood, so the attach audit finds it held */
 function pad(p,size,flat,col,R,c2){BIO.put('needle',p,qE(R.r(-.3,.3),R.r(0,TAU2),R.r(-.3,.3)),[size,size*flat,size],col,{n:[R.r(-.3,.3),1,R.r(-.3,.3)],c2:c2||null});}
 // ---- the records (core/tags: a tree's tags as the kit's, harvest as biomes/FRUIT.md)
 const HV=(wood,edible,med,note)=>({wood,edible,medicinal:!!med,fruit:null,note});
 const REC={
  agatepine:{key:'agatepine',name:'Agate pine',H:[14,26],rb:[.4,.75],crownR:[4,7],bark:[0xffffff,0xf4ece4,0xfff2ea],leaf:[0x2e5a52,0x3a6a60,0x24504a],habit:'pine',
   tags:{zone:'cold',moisture:'semiarid',seasonal:'no',koppen:['Dsc','Dsb'],harvest:HV('timber, resin',['pine nuts'],true,'The banded heartwood is the Vale\'s finest carving wood; the resin is a salve.')}},
  mistspruce:{key:'mistspruce',name:'Mist spruce',H:[16,30],rb:[.35,.6],crownR:[2.4,3.8],bark:[0x6a6470,0x5a5662,0x787080],leaf:[0x163a3a,0x1c4440,0x123234],habit:'spire',
   tags:{zone:'cold',moisture:'humid',seasonal:'no',koppen:['Dfc'],harvest:HV('timber',[],false,'Straight, light and resinous: the ranges\' building timber.')}},
  dwarfwillow:FW?BIO.kinRecord(FW,{key:'dwarfwillow',name:'Dwarf frost willow',scale:{H:.04,rb:.05,crownR:.12},
   tags:{zone:'polar',moisture:'humid',koppen:['ET'],harvest:HV('none',[],true,'The bark is chewed for pain, as the frost willow\'s.')}},'xanadu.frostwillow'):null};
 // ---- THE CONIFER BUILDER (agatepine, mistspruce and their cousins: T.rec is the record, its habit 'pine' | 'spire', habit.krumm a treeline form)
 function conifer(T,lv){const S=T.rec||REC.agatepine,R=rnd(KRAND.stream(KRAND.hash(SEED,T.seed>>>0,7))),H=T.H,rb=T.rb,spire=S.habit==='spire',krumm=!!S.krumm;
  const famB=spire?'xbark3':'xbarkA',bc=i=>C(S.bark[i%S.bark.length]),lc=()=>vary(C(R.pick(S.leaf)),.05,R),irid=PAL&&PAL.irid&&PAL.irid.TL?C(R.pick(PAL.irid.TL)):null;
  const la=R.r(0,TAU2),wind=krumm?[Math.cos(SEED%7),Math.sin(SEED%7)]:[0,0];   /* krummholz: every tree trained the same way, by the north-west wind */
  /* the bole: a tube up the tree, a little bent, flared at the foot */
  const n=lv===2?8:4,pts=[];for(let i=0;i<=n;i++){const t=i/n,s=Math.sin(t*Math.PI*1.2)*H*.03+(krumm?t*t*H*1.6:0),w=krumm?1:0;
   pts.push({x:T.x+Math.cos(la)*s*(1-w)+wind[0]*s*w,y:T.y0+t*H*(krumm?.55:1),z:T.z+Math.sin(la)*s*(1-w)+wind[1]*s*w,r:rb*(1-.82*t)*(1+.7*Math.exp(-t*10))+.02});}
  BIO.tube(famB,pts,bc(1),{seg:lv===2?10:6,cap:true});const top=pts[n];
  const pAt=u=>{const f=u*n,i=Math.min(n-1,Math.floor(f)),k=f-i,a=pts[i],b=pts[i+1];return{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,z:a.z+(b.z-a.z)*k,r:a.r+(b.r-a.r)*k};};
  /* the agate pine's upswept main limbs (hero only): tubes with flared joints */
  if(!spire&&!krumm&&lv===2){for(let k=0,m=R.i(2,4);k<m;k++){const u=R.r(.42,.62),o=pAt(u),a=la+k/m*TAU2+R.r(-.4,.4),L=S.crownR[1]*R.r(.55,.8),el=R.r(.55,.9),lp=[];
    for(let i=0;i<=4;i++){const t=i/4;lp.push({x:o.x+Math.cos(a)*Math.cos(el)*L*t,y:o.y+Math.sin(el)*L*t+t*t*1.2,z:o.z+Math.sin(a)*Math.cos(el)*L*t,r:o.r*.45*(1-.7*t)+.04});}
    BIO.tube(famB,BIO.flareJoin?BIO.flareJoin(lp,{parentR:o.r}):lp,bc(k),{seg:6,cap:true});const e=lp[4];
    for(let c=0;c<3;c++)pad([e.x+R.r(-.4,.4),e.y+R.r(0,.5),e.z+R.r(-.4,.4)],R.r(1.4,2.1),.42,lc(),R,irid);}}
  /* the whorls of boughs: level (the pine, the crown's upper half, tufted at the ends), or drooping tiers (the spire, from near the foot) */
  const u0=spire?.14:krumm?.1:.5,dh=spire?1.1:1.5,nW=Math.max(2,Math.round((1-u0)*H/dh)),rodC=bc(2).multiplyScalar(.8);
  for(let w=0;w<nW;w++){const u=u0+(1-u0)*(w+.5)/nW,o=pAt(Math.min(.98,u)),nb=lv===2?R.i(3,5):2,a0=R.r(0,TAU2);
   const Lw=spire?S.crownR[1]*Math.pow(1-u,.85)*R.r(.85,1.1)+.4:krumm?S.crownR[1]*R.r(.6,1):S.crownR[1]*R.r(.5,.9)*(1-.45*(u-u0)/(1-u0));
   for(let b=0;b<nb;b++){const a=a0+b/nb*TAU2+R.r(-.25,.25),dx=Math.cos(a)+wind[0]*(krumm?1.3:0),dz=Math.sin(a)+wind[1]*(krumm?1.3:0),dl=Math.hypot(dx,dz)||1;
    const droop=spire?-.35:krumm?-.05:.12,e=[o.x+dx/dl*Lw,o.y+droop*Lw,o.z+dz/dl*Lw];
    if(lv===2||spire)BIO.beam('rod',[o.x,o.y,o.z],e,Math.max(.03,o.r*.35),.02,rodC);
    const np=spire?(lv===2?3:2):(lv===2?2:1);for(let c=0;c<np;c++){const t=spire?(c+1)/np:1-.3*c,p=[o.x+(e[0]-o.x)*t,o.y+(e[1]-o.y)*t,o.z+(e[2]-o.z)*t];
     pad(p,spire?R.r(.9,1.4)*(1-.4*u)+.4:krumm?R.r(.7,1.1):R.r(1.3,2),spire?.38:.45,lc(),R,c===np-1&&R.u()<.4?irid:null);}}}
  pad([top.x,top.y+.2,top.z],spire?.8:1.4,.5,lc(),R,null);
  if(lv===2&&!krumm&&typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:S.crownR[1],h:H});}
 // ---- THE DWARF FROST WILLOW: three to six creeping stems a hand over the ground, each hung with short strands of the frost willow's leaf
 function dwarf(T,lv){const S=T.rec||REC.dwarfwillow,R=rnd(KRAND.stream(KRAND.hash(SEED,T.seed>>>0,11))),bc=C(S.bark[0]).multiplyScalar(.75),lc=C(S.leaf?S.leaf[0]:0x9fb8a0);
  const c2=PAL&&PAL.irid&&PAL.irid.SL?C(R.pick(PAL.irid.SL)):null;
  for(let k=0,m=lv===2?R.i(3,6):2;k<m;k++){const a=R.r(0,TAU2),L=R.r(.5,1.2)*(T.crownR/1),o=[T.x,T.y0+.06,T.z];
   const e=[o[0]+Math.cos(a)*L,BIO.terrainH(o[0]+Math.cos(a)*L,o[2]+Math.sin(a)*L)+.12,o[2]+Math.sin(a)*L];
   BIO.beam('rod',o,e,.035,.015,bc);
   for(let i=1,ni=lv===2?R.i(3,5):2;i<=ni;i++){const t=i/(ni+.3),p=[o[0]+(e[0]-o[0])*t,o[1]+(e[1]-o[1])*t+.03,o[2]+(e[2]-o[2])*t];
    BIO.put('willow',p,qE(0,R.r(0,TAU2),0),[R.r(.22,.36),Math.max(.06,p[1]-BIO.terrainH(p[0],p[2])-.01),1],vary(lc,.06,R).multiplyScalar(1.15),{c2});}}}
 // ---- the builders other kits read (BIO.kitBuilder's own builders: BIO.kin('xanadu.agatepine'|'xanadu.mistspruce'|'xanadu.dwarfwillow', delta)).
 // make(x, y, z, rec): a record at a point, sized by rec (a kin's record) or the species' own; grow(T, lv) in xanadu's registry
 const mk=(key,builder)=>({species:REC[key],make:(x,y,z,rec)=>{const S=rec||REC[key],s=KRAND.stream(KRAND.hash(SEED,Math.round(x*7),Math.round(z*7),key.length));
   return{x,z,y0:y-.3,H:s.range(S.H[0],S.H[1]),rb:s.range(S.rb[0],S.rb[1]),crownR:s.range(S.crownR[0],S.crownR[1]),seed:s.u32(),rec:S};},
  grow:(T,lv)=>{const k0=BIO.kit('xanadu');try{builder(T,lv);}finally{BIO.kit(k0);}return T;}});
 XANADU.builders=Object.assign(XANADU.builders||{},{agatepine:mk('agatepine',conifer),mistspruce:mk('mistspruce',conifer)});
 if(REC.dwarfwillow)XANADU.builders.dwarfwillow=mk('dwarfwillow',dwarf);
 const KRUMM=BIO.kin('xanadu.agatepine',{key:'krummholz',name:'Agate pine krummholz',scale:{H:.11,rb:.55,crownR:.45},habit:{krumm:true}});
 XANADU.RANGES_SPECIES=[REC.agatepine,REC.mistspruce,KRUMM&&KRUMM.record,REC.dwarfwillow].filter(Boolean);
 // ---- the pass
 function build(){const out={agatepine:0,mistspruce:0,krummholz:0,dwarfwillow:0,cushions:0,heroes:0,far:0},o=BIO.center(),Rr=LAND.R,TL=TREELINE;
  const k0=BIO.kit('xanadu'),c0=BIO.cur;BIO.cur='xanadu/trees';RAN.planting=true;
  const IMPON=XANADU.IMPOSTORS!==false&&typeof BIO.impostor==='function',IMPS={};
  const hero=(x,z,r)=>BIO.lodD(x,z)<r;
  /* the impostors: one quad of each conifer, baked from a full hero at the station's middle */
  if(IMPON){const set=BIO.impostorSet('xanadu.ranges',{label:'Far conifers'});
   ['agatepine','mistspruce'].forEach(key=>{const B=XANADU.builders[key],y=terrainH(0,-2000),T0=B.make(0,y,-2000);T0.H=REC[key].H[1]*.85;
    const rec=BIO.impostor('xanadu.'+key,()=>{const R0=window.REGISTER;window.REGISTER=null;const ow=BIO.owner;try{BIO.owner=null;B.grow(Object.assign({},T0),2);}finally{BIO.owner=ow;window.REGISTER=R0;}},{set,at:[T0.x,T0.y0,T0.z],label:REC[key].name+' (far)'});
    if(rec)IMPS[key]={rec,H:T0.H};});
   if(set.recs.length)BIO.impostorItem('impTreesR',set,{label:'Far conifers'});}
  function lattice(sp,cell,accept,place){const N=Math.ceil(Rr*2/cell);let n=0;
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const s=KRAND.stream(KRAND.hash(SEED,sp,i,j)),x=o[0]-Rr+(i+s.next())*cell,z=o[1]-Rr+(j+s.next())*cell,u=s.next();
    if(x<TERR.X0||x>TERR.X1||z<TERR.Z0||z>TERR.Z1)continue;const h=terrainH(x,z),a=accept(x,z,h);if(a<=0||u>=a)continue;
    if(BIO.mask(x,z)<=.2||!BIO.clearOf(x,z,1.5))continue;if(place(x,BIO.terrainH(x,z),z,h,s)!==false)n++;}
   return n;}
  const growTree=(key,x,y,z)=>{const B=XANADU.builders[key],T=B.make(x,y,z);BIO.owner=[x,z];
   if(hero(x,z,LOD.tree)){BIO.range=LOD.tree;BIO.minRange=0;B.grow(T,2);out.heroes++;
    if(IMPS[key]){BIO.range=1e9;BIO.minRange=LOD.tree;BIO.impostorPut('impTreesR',IMPS[key].rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/IMPS[key].H,null);}}
   else if(IMPS[key]){BIO.range=null;BIO.minRange=0;BIO.impostorPut('impTreesR',IMPS[key].rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/IMPS[key].H,null);out.far++;}
   else{BIO.range=LOD.tree*1.6;BIO.minRange=0;B.grow(T,1);}
   OBSTACLES.push({x,z,r:T.rb*1.6+.6});};
  const belt=h=>smooth(TL+60,TL-120,h),boreal=(x,z)=>smooth(-1300,1500,x+.25*z);
  /* the agate pine: open woodland, the Vale side and the drier ridges, thinning to the treeline */
  out.agatepine=lattice(1,36,(x,z,h)=>belt(h)*(.5*(1-boreal(x,z))+.12)*smooth(.9,.5,slopeAt(x,z)),(x,y,z)=>{growTree('agatepine',x,y,z);});
  /* the mist spruce: close stands on the wet south-east, into the cloud belt */
  out.mistspruce=lattice(2,24,(x,z,h)=>belt(h)*.62*boreal(x,z)*smooth(1,.6,slopeAt(x,z)),(x,y,z)=>{growTree('mistspruce',x,y,z);});
  /* krummholz: the treeline's band, every tree a cousin of the agate pine */
  if(KRUMM)out.krummholz=lattice(3,15,(x,z,h)=>smooth(TL-80,TL+40,h)*smooth(TL+330,TL+160,h)*.55,(x,y,z)=>{if(!hero(x,z,LOD.krumm))return false;BIO.owner=[x,z];BIO.range=LOD.krumm;BIO.minRange=0;
   const T=KRUMM.make(x,y,z,KRUMM.record);KRUMM.grow(T,2);});
  /* the dwarf frost willow: ET 4.8-5.7 km, on wet ground (the stream, the tarn, the snowbeds' melt) */
  if(REC.dwarfwillow)out.dwarfwillow=lattice(4,10,(x,z,h)=>smooth(4750,4900,h)*smooth(5750,5600,h)*(.08+.6*smooth(.6,.85,FIELD.wet(x,z))),(x,y,z)=>{if(!hero(x,z,LOD.small))return false;BIO.owner=[x,z];BIO.range=LOD.small;BIO.minRange=0;
   const B=XANADU.builders.dwarfwillow;B.grow(B.make(x,y,z),2);});
  /* cushions: the fell-field above the krummholz, thinning to the ice */
  const CUSH=[0x5a7a3e,0x6a8a44,0x4e6e3a,0x8a9a5a],FLOWER=[0xd890b0,0xf0eadc,0xe8d070];
  out.cushions=lattice(5,8,(x,z,h)=>smooth(TL+120,TL+300,h)*smooth(5800,5500,h)*.4*smooth(.7,.35,slopeAt(x,z)),(x,y,z,h,s)=>{if(!hero(x,z,LOD.small))return false;BIO.owner=[x,z];BIO.range=LOD.small;BIO.minRange=0;
   const R=.22+s.next()*.45,fl=s.next()<.35,c=C(fl?FLOWER[Math.floor(s.next()*3)]:CUSH[Math.floor(s.next()*4)]);if(fl)c.lerp(C(CUSH[0]),.35);
   BIO.put('cushion',[x,y-.06,z],qE((s.next()-.5)*.2,s.next()*TAU2,(s.next()-.5)*.2),[R,R*(.45+.15*s.next()),R],c);});
  BIO.owner=null;BIO.range=null;BIO.minRange=0;BIO.cur=c0;RAN.planting=false;BIO.kit(k0);
  return out;}
 return{REC,KRUMM,build,LOD};})();
// SNOW THAT LIES (core/atmos fx/snowcover): the glacier's accumulation zone white above the line (base 1, frozen air: no melt by day); the weather's snow builds on the rest
function laySnow(){if(ATMOS.snowCover&&XQ_ON('snow')){window._snow=ATMOS.snowCover({base:1,line:[5500,6000],frozen:true,depth:.15});ATMOS.snowOn(MAT_GROUND,{line:[5500,6000]});}}
// THE GLACIER (materials.json ice.glacier, the kit's pack): the ice between the summits as its own skin over the ground above ~5.55 km, a metre and a half
// up, its edge feathered where the ground drops under the line; the library's glacier ice, world-tiled (two scales, one turned); without the pack the snow
// paint and the snow cover carry it. ?glacier=0 none
function layGlacier(){if(!XQ_ON('glacier'))return null;const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('xanadu','ice.glacier'):null;if(!L)return null;
 const tx=KMAT.textures(L,{aniso:8}),k=1/(L.scale&&L.scale[0]||8),Y0=5520,cell=12,x0=TERR.X0,x1=TERR.X1,z0=1200,z1=TERR.Z1,nx=Math.round((x1-x0)/cell),nzz=Math.round((z1-z0)/cell);
 const pos=[],uv=[],idx=[],keep=[];for(let j=0;j<=nzz;j++)for(let i=0;i<=nx;i++){const x=x0+i*cell,z=z0+j*cell,h=terrainH(x,z);pos.push(x,h+1.5*smooth(Y0,Y0+80,h),z);uv.push(x*k,z*k);keep.push(h>Y0);}
 for(let j=0;j<nzz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;if(keep[a]&&keep[b]&&keep[c]&&keep[d])idx.push(a,c,b,b,c,d);}
 if(!idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tx.map,normalMap:tx.normalMap||null,roughnessMap:tx.roughnessMap||null,roughness:.55,metalness:0,color:0xffffff}));
 m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel='The glacier between the summits';m.receiveShadow=true;scene.add(m);return{mesh:m,tris:idx.length/3};}
// 89z calls it after the atmosphere is bound (core/atmos sorts after this fragment): the conifers, the small plants, the glacier, the snow
function stationBuild(){const o=RANGES.build();laySnow();const g=layGlacier();o.glacier=g?g.tris:0;return o;}
// the station's checks (99-host-take.js runs them; each with a negative): no conifer stands over the treeline but the krummholz, and the dwarf willow
// grows where EXCHANGES.md puts it (ET 4.8-5.7 km); the chasm head's fall is the tall one
function rangesCheck(shift){const rs=[];scene.traverse(o=>{if(o.isInstancedMesh&&/^biome:(needle)$/.test(o.name))rs.push(o);});
 const bad=[];let n=0;for(const R of REG){if(R.kind!=='tree'||!/Agate pine|Mist spruce/.test(R.name))continue;n++;const y=(R.y||0)+(shift||0);if(y>TREELINE+200)bad.push(R.name+'@'+Math.round(y));}
 const W=window._water||{},tall=(W.tallFall||[]).length?W.tallFall[0]:0,st=window._station||{};
 return{ok:n>100&&!bad.length&&(st.dwarfwillow||0)>50&&tall>150,detail:n+' conifer heroes, '+bad.length+' over the treeline ('+bad.slice(0,4).join(', ')+'); dwarf willows '+(st.dwarfwillow||0)+', krummholz '+(st.krummholz||0)+', cushions '+(st.cushions||0)+'; the chasm head fall '+tall+' m, the conduit '+(W.conduit||0)+' m'};}
function stationChecks(add){add('the ranges: conifers under the treeline, the dwarf willow in the ET band, the chasm head\'s tall fall',rangesCheck(0));}
function stationNegatives(add){add('every conifer lifted 1.5 km (over the treeline)',rangesCheck(1500));}
