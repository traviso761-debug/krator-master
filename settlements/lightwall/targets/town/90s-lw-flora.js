// ================================================================= LĀIṬWĀL — Opal Valley's flora on the bench (KNOWN_ISSUES.md: "the flora is the Vale of Xanadu's")
// The middle terrace's own plants (biomes/opalvalley, its station 3 'middlebed': Cfb, ~1,000 mm) in place of the page's Vale of
// Xanadu: the kit sealed with today's core/biome and the Vale of Xanadu kit (the source of its kin) in gen/69r-lw-flora-bundle.js
// (LW_FLORA, as Qiblai's QC_FLORA), bound here to the town's ground. OPAL.buildKin grows its seven kin (Xanadu's species in Opal
// Valley's colours, by Xanadu's own builders), OPAL.buildOwn its own plants (the opal cushions, the prism ferns, the chalices, the
// tussock; the opal lotus pads on the lake's edge). The mask is the bench's (89zl lwBioMask: the orchards and yards, the shore, no
// street, no building, no field); the fields the kit reads come from the town's ground. Baked on a group of its own, its LOD on the
// frame hooks with the chunks'. The builders' own plants (xaPlant) stay the page's Vale. [web]: three.js.
const LW_FL={on:false,stats:null,ms:0};
if(typeof LW_FLORA!=='undefined'&&LW_FLORA.kits&&LW_FLORA.kits.opalvalley){const F=LW_FLORA,B=F.BIO,O=F.kits.opalvalley,t0=performance.now();
 const grp=new THREE.Group();grp.name='lightwall-opal-flora';scene.add(grp);
 const lwFlWater=(x,z)=>z>LW.SHORE-20&&terrainH(x,z)<LW.LAKE+.05?LW.LAKE:-1e9;
 const lwFlSlope=(x,z)=>{const e=3,hx=terrainH(x+e,z)-terrainH(x-e,z),hz=terrainH(x,z+e)-terrainH(x,z-e);return Math.min(1,Math.hypot(hx,hz)/(2*e)*1.6);};
 const lwFlSm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const Z=()=>0,FIELDS={wet:(x,z)=>Math.min(1,.4+.45*lwFlSm(LW.SHORE-90,LW.SHORE,z)),flow:Z,upland:(x,z)=>Math.max(0,Math.min(1,(terrainH(x,z)-LW.LAKE)/150)),
  rock:(x,z)=>lwFlSm(.5,.82,lwFlSlope(x,z)),slope:lwFlSlope,cold:()=>.15,mist:Z,ice:Z,flat:Z,canyon:Z,geo:Z,rim:Z,dune:Z,oasis:Z,abyss:Z,salt:Z,barren:Z,fog:Z};
 const SPINE=[[0,150],[-600,150],[600,150],[0,LW.SHORE-40],[-900,300],[900,300],[0,-150],[-300,-60],[300,-60]];
 try{
  B.init({tags:'opalvalley',THREE,scene:grp,terrainH:(x,z)=>terrainH(x,z),waterH:lwFlWater,mask:(x,z)=>lwBioMask(x,z),obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:LW.SEED+80,origin:SPINE,center:[0,150],fields:FIELDS,err:m=>console.warn('lightwall flora: '+m),
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],lod:{hero:240,mid:600,far:2400,floor:[180,440]}});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  const keep=(x,z)=>lwBioMask(x,z)>.02?1:0,st={};F.reseed(LW.SEED+81);
  try{B.cur='opalvalley/kin';st.kin=O.buildKin(1300,1,{station:'middlebed',keep,cell:18});   /* 18 m cells (the kit's default 36): the orchards' trees */}catch(e){reportErr('lightwall flora kin: '+(e&&e.stack||e));}
  try{B.cur='opalvalley/own';Object.assign(st,O.buildOwn(1300,.8,{station:'middlebed',keep,water:lwFlWater,heat:()=>10,grass:.55,lake:(x,z)=>z>LW.SHORE+8?1:0,bare:()=>0}));}
  catch(e){reportErr('lightwall flora own: '+(e&&e.stack||e));}
  /* the orchards and yards planted (89zl lwPlot): a kin tree of the middle terrace in each 12 m orchard plot and one yard plot in
     three, near the plot's middle, its species, jitter and size from a hash of the plot (core/rand), 5 to 8 m (kept small, as
     fruit trees), grown by the kit's own make and grow in its registry (as Qiblai's gardens grow theirs: 90p-qc-flora.js) */
  try{const KL=O.KIN.filter(k=>k.zone&&k.zone.middlebed),prev=B.kit('opalvalley');st.orchard=0;
   try{for(const b of LW_BLOCKS){if(b.kind==='field')continue;const xs=b.poly.map(p=>p[0]),zs=b.poly.map(p=>p[1]);
    for(let i=Math.floor(Math.min(...xs)/LW_PLOT);i<=Math.floor(Math.max(...xs)/LW_PLOT);i++)for(let j=Math.floor(Math.min(...zs)/LW_PLOT);j<=Math.floor(Math.max(...zs)/LW_PLOT);j++){
     const h=KRAND.hash(LW.SEED,i,j,0x5a),u=k=>KRAND.unit(KRAND.hash(h,k)),x=(i+.5+(u(1)-.5)*.5)*LW_PLOT,z=(j+.5+(u(2)-.5)*.5)*LW_PLOT,pl=lwPlot(x,z);
     if(pl!=='orchard'&&!(pl==='yard'&&u(3)<.34))continue;if(lwBlockAt(x,z)!==b||lwNearBuilding(x,z,7))continue;   /* a crown clear of the walls */
     const k=KL[Math.floor(u(4)*KL.length)];if(!k)continue;let K=O.KINS[k.key];
     if(!K){K=B.kin(k.from,Object.assign({key:k.key,name:k.name,tags:k.tags||{}},k.delta||{}));if(!K)continue;O.KINS[k.key]=K;}
     F.reseed(h);const T=K.make(x,terrainH(x,z),z),H=5+3*u(5),sc=H/T.H;T.H=H;T.rb*=sc;T.crownR*=sc;K.grow(T,2);st.orchard++;}}}
   finally{B.kit(prev);}}catch(e){reportErr('lightwall flora orchards: '+(e&&e.stack||e));}
  B.cur=null;st.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('lightwall flora impostors: '+(e&&e.message||e));}}
  LW_FL.on=true;LW_FL.stats=st;
 }catch(e){reportErr('lightwall flora: '+(e&&e.stack||e));}
 LW_FL.ms=Math.round(performance.now()-t0);
}
window._lightwallFlora={on:LW_FL.on,ms:LW_FL.ms,orchard:LW_FL.stats&&LW_FL.stats.orchard,kin:LW_FL.stats&&LW_FL.stats.kin&&LW_FL.stats.kin.trees,own:LW_FL.stats?Object.keys(LW_FL.stats).filter(k=>k!=='kin'&&k!=='bake'&&k!=='orchard').reduce((a,k)=>a+(typeof LW_FL.stats[k]==='number'?LW_FL.stats[k]:0),0):0};
