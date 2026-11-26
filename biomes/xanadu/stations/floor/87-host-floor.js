// ================================================================= HOST — the Rift floor's two floras and their front (station 5; the owner, 2026-11-03)
// "Here we would have native rift flora and tall versions of xanadu flora competing for dominance." The kit's own tree pass stays off (45b's mask); its floor
// planters run on the hypertropic fields (litter, ferns, moss, cobra lilies). This plants the canopy and the understorey from two kits, read in place:
//   THE VALE'S, TALL (BIO.kin cousins on XANADU.make/grow, scaled up: the dense air at 1.9 atm and ~2,260 mm of rain): the species that follow Alph down
//        from the Vale and over the cataract: dawn redwood, Caucasian wingnut, haze blossom, lotus trumpet, wisteria, agate tree, chestnut-leaved oak, and
//        under them the cloud tree-fern, cacao and violet plantain, each half again to twice the Vale's size. Keys 'tall<key>', tags.kin the source
//   THE RIFT'S OWN (biomes/rift, read in place by BIO.kin on RIFT.make/grow; its station 2, the rift jungle, PLAN-STATIONS.md section 3): bell palm, lobe tree,
//        trumpet tree, pagoda tree, violet dome tree, parasol tree, the odd frill tree's column; under them the Rift croton, curl succulent, prism bush, carrot
//        frill, anemone stalk; the feral maw trumpet on the shore and the thornwhip in the wet understorey (the Rift's own ferals, themselves from Xanadu)
//   THE FRONT (FLOORLAND.front, 45b): + toward the north-west (Alph's side, where the Vale's seed arrives), - toward the Rift's south-east; each cell's flora is
//        drawn by a weight that crosses over ~900 m, so the middle is mixed, stand against stand, and each end is its own flora's
// Every tree is a KRAND cell (hash of the station's seed, the layer, the cell) and its builder's stream is reseeded from the same hash: nothing else moves.
// Heroes within 260 m of the LOD spine (the understorey 160 m), octahedral impostors past that (the canopy; ?diet=0 none: the canopy's far trees are skipped).
const FLOOR=(function(){
 const SEED=0x5F100A,TAU2=Math.PI*2,LOD={tree:230,under:160},planting=false;
 /* NO IMPOSTOR (heroes only, by key): none at present */
 const NO_IMP={};
 const KX=(key,s,name)=>BIO.kin('xanadu.'+key,{key:'tall'+key,name:'Tall '+name,scale:{H:s,rb:Math.min(1.6,.6+s*.5),crownR:Math.min(1.7,.5+s*.55)},tags:{koppen:['XA'],abyssal:true}});
 const KR=key=>typeof RIFT==='undefined'?null:BIO.kin('rift.'+key,{key:key,tags:{koppen:['XA']}});
 const sp=(K,w,habit)=>K?{K,w,habit}:null;
 /* the two floras, each a canopy and an understorey; habit 'shore' doubles near the water, 'creek' near the creek beds */
 const VALE={canopy:[sp(KX('dawnredwood',1.35,'dawn redwood'),3,'shore'),sp(KX('wingnut',1.8,'Caucasian wingnut'),2,'creek'),sp(KX('hazeblossom',2,'haze blossom'),2),
   sp(KX('lotustrumpet',2,'lotus trumpet'),2,'shore'),sp(KX('wisteria',2.2,'wisteria tree'),1.5),sp(KX('agatetree',1.4,'agate tree'),1.5),sp(KX('hyrcanoak',1.5,'chestnut-leaved oak'),1.5)].filter(Boolean),
  under:[sp(KX('cloudfern',1.8,'cloud tree-fern'),2,'creek'),sp(KX('cacao',1.6,'cacao'),1.2),sp(KX('violetplantain',1.8,'violet plantain'),1.2)].filter(Boolean)};
 /* OWED, not grown now: the Rift's parasol tree and violet dome tree (B[17], B[22] in biomes/rift/src/55: their crown clumps sit up to a crown's width off
    their limbs; 112 of their 578 'broad' cards floated here, 19%, against the 1% limit): grown here once the Rift's turn holds them (BIO.holdTo) */
 const RIFTF={canopy:[sp(KR('bellpalm'),2.5),sp(KR('lobetree'),2.5),sp(KR('trumpet'),2.5),sp(KR('pagoda'),2.5),sp(KR('frilltree'),.25),sp(KR('mawtrumpet'),1,'shore')].filter(Boolean),
  under:[sp(KR('croton'),1.5),sp(KR('curly'),1),sp(KR('prismbush'),1),sp(KR('carrotfrill'),1),sp(KR('anemonestalk'),1),sp(KR('thornwhip'),1.2,'creek')].filter(Boolean)};
 const valeK=(x,z)=>smooth(-450,450,FLOORLAND.front(x,z));   /* 1: the Vale's side, 0: the Rift's */
 function choose(list,u,x,z){const s=FLOORLAND.sd(x,z),c=FLOORLAND.creekD(x,z);let tot=0;const w=list.map(e=>{const k=e.w*(e.habit==='shore'?1+2*smooth(250,30,s):e.habit==='creek'?1+2*smooth(80,10,c):1);tot+=k;return k;});
  let a=u*tot;for(let i=0;i<list.length;i++){a-=w[i];if(a<=0)return list[i];}return list[list.length-1];}
 function build(){const out={vale:0,rift:0,valeHeroes:0,riftHeroes:0,far:0,under:0,byKey:{}},o=[0,0],Rr=TERR.R+150;
  if(typeof RIFT==='undefined'||!RIFTF.canopy.length){out.missing='RIFT not on the page';}
  const k0=BIO.kit('xanadu'),c0=BIO.cur;BIO.cur='xanadu/trees';FLOOR.planting=true;
  const S=KSPACE.create({cell:30}),clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r);
  /* the impostors: one quad of each canopy species, baked from a hero of its own at the page's middle (sets A: the Vale's, B: the Rift's) */
  const IMPON=XANADU.IMPOSTORS!==false&&typeof BIO.impostor==='function',IMPS=new Map();
  if(IMPON)[['A',VALE.canopy],['B',RIFTF.canopy]].forEach(([k,list])=>{const set=BIO.impostorSet('xanadu.floor'+k,{label:'Far trees'});
   list.forEach(e=>{if(NO_IMP[e.K.key])return;const y=terrainH(-200,1500);BIO.fn.reseed(KRAND.hash(SEED,99,e.K.record?e.K.record.key.length:1));const T0=e.K.make(-200,y,1500);
    /* registered in its source kit's registry (BIO.impostor captures the registry current at the call: a Rift cousin builds into the Rift's) */
    const kp=BIO.kit(e.K.kit);const rec=BIO.impostor('xanadu.floor.'+(e.K.record?e.K.record.key:e.K.key),()=>{const R0=window.REGISTER;window.REGISTER=null;const ow=BIO.owner;try{BIO.owner=null;BIO.fn.reseed(T0.seed);e.K.grow(Object.assign({},T0),2);}finally{BIO.owner=ow;window.REGISTER=R0;}},{set,at:[T0.x,T0.y0,T0.z],label:(e.K.name||'')+' (far)'});BIO.kit(kp);
    if(rec)IMPS.set(e,{rec,H:T0.H,item:'impFloor'+k});});
   if(set.recs.length)BIO.impostorItem('impFloor'+k,set,{label:'Far trees'});});
  function lattice(layer,cell,density,lists,lod,far){const N=Math.ceil(Rr*2/cell);
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const h=KRAND.hash(SEED,layer,i,j),s=KRAND.stream(h),x=o[0]-Rr+(i+s.next())*cell,z=o[1]-Rr+(j+s.next())*cell,u=s.next(),uf=s.next(),us=s.next();
    if(x<TERR.X0||x>TERR.X1||z<TERR.Z0||z>TERR.Z1)continue;const g=terrainH(x,z);if(g<.8)continue;
    const a=density*smooth(.8,4,g)*smooth(.9,.45,FC.at(FC.a.slope,x,z));if(u>=a||BIO.mask(x,z)<=.2)continue;
    const vk=valeK(x,z),side=uf<vk?'vale':'rift',list=(side==='vale'?VALE:RIFTF)[lists];if(!list.length)continue;
    const e=choose(list,us,x,z),r=lists==='canopy'?5:2.2;if(!clear(x,z,r))continue;
    const d=BIO.lodD(x,z),hero=d<lod;if(!hero&&!far)continue;
    BIO.owner=[x,z];BIO.fn.reseed(h);const T=e.K.make(x,BIO.terrainH(x,z),z);
    if(hero){BIO.range=lod;BIO.minRange=0;BIO.fn.reseed(T.seed);e.K.grow(T,2);out[side+'Heroes']++;
     const I=IMPS.get(e);if(I){BIO.range=1e9;BIO.minRange=lod;BIO.impostorPut(I.item,I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);}
     if(lists==='canopy'&&typeof REGISTER==='function')REGISTER({name:e.K.name||e.K.key,kind:'tree',label:e.K.name||e.K.key,x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});}
    else{const I=IMPS.get(e);if(!I)continue;BIO.range=null;BIO.minRange=0;BIO.impostorPut(I.item,I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);out.far++;}
    S.insert(T,x,z,(T.rb==null?.5:T.rb)*1.4+1);out[side]++;if(lists==='under')out.under++;const k=e.K.name||'?';out.byKey[k]=(out.byKey[k]||0)+1;
    FLOOR.trees.push({x,z,side,layer:lists});}}
  lattice(1,34,.62,'canopy',LOD.tree,true);
  lattice(2,16,.35,'under',LOD.under,false);
  BIO.owner=null;BIO.range=null;BIO.minRange=0;BIO.cur=c0;FLOOR.planting=false;BIO.kit(k0);
  return out;}
 return{VALE,RIFTF,valeK,build,LOD,planting,trees:[]};})();
function stationBuild(){return FLOOR.build();}
/* NO LOTUS ON THE SALT LAKE: the kit's floor pass grows lotus pads on still water by 1 - flow (src/60); over this saline lake the flow field reads 1 while
   the kit builds (89z sets FIELD.flow from the water's fields just before; BIO.field reads FIELD at the call), and only then */
{const B0=XANADU.build;XANADU.build=function(o){const f=FIELD.flow;FIELD.flow=(x,z)=>FLOORLAND.sd(x,z)<0?1:f(x,z);try{return B0.call(XANADU,o);}finally{FIELD.flow=f;}};}
// the station's checks (99-host-take.js runs them; each with a negative): both floras hold ground, each its own end, and the middle is mixed
function frontCheck(flip){const z={vale:{vale:0,rift:0},mid:{vale:0,rift:0},rift:{vale:0,rift:0}};
 FLOOR.trees.forEach(t=>{if(t.layer!=='canopy')return;let k=FLOOR.valeK(t.x,t.z);if(flip)k=1-k;const zone=k>.85?'vale':k<.15?'rift':'mid';z[zone][t.side]++;});
 const sh=(a)=>{const n=a.vale+a.rift;return n?a.vale/n:0;},sv=sh(z.vale),sm=sh(z.mid),sr=sh(z.rift);
 const ok=z.vale.vale+z.vale.rift>200&&z.rift.vale+z.rift.rift>200&&z.mid.vale+z.mid.rift>200&&sv>.8&&sr<.2&&sm>.25&&sm<.75;
 return{ok,detail:'the Vale\'s share of the canopy: on its own side '+(sv*100).toFixed(0)+'% of '+(z.vale.vale+z.vale.rift)+', in the middle '+(sm*100).toFixed(0)+'% of '+(z.mid.vale+z.mid.rift)+
  ', on the Rift\'s side '+(sr*100).toFixed(0)+'% of '+(z.rift.vale+z.rift.rift)+(window._station&&window._station.missing?'; '+window._station.missing:'')};}
function stationChecks(add){add('the Rift floor: the tall Vale flora and the Rift\'s own each hold their end, mixed across the front',frontCheck(false));}
function stationNegatives(add){add('the front read backwards (each flora on the other\'s side)',frontCheck(true));}
