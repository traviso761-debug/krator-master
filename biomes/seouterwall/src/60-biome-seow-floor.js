// ================================================================= SEOW — the floor: the cordillera's own plants, placed (BIO.grid, the cell form)
// Each pass is core/biome's cell-form grid (BIO.grid('salt', cell, accept, fn, opt): a cell seeded from a hash of the world, the kit, the
// salt and the cell, never from the draws before it), its acceptance by the zone (46: SEOW.zoneAt, the host's raster) and the fields,
// gated off the crags' faces (BIO.cliffW). The puya over the whole near box (a few to a hillside, seen from afar); the small plants dense
// round each point of the LOD spine, a third as dense to the floor's far band, as the NW outer wall's floor does.
(function(){const {TAU,rr,ri,rng,pick}=BIO.fn;const qEuler=BIO.qEuler||BIO.fn.qEuler;const C=SEOW.C,S=SEOW.season;
const col=(slot,hex)=>SEOW.libCol(slot,C(hex));
const up=(item,x,y,z,h,w,c,tilt)=>BIO.put(item,[x,y-.04,z],qEuler(rr(-tilt,tilt),rr(0,TAU),rr(-tilt,tilt)),[w,h,w],c);
const D={
 // the puya: most a rosette; one in five has flowered (a spike 4-9 m over its rosette), the spike's dead straw in autumn and winter
 puya:(x,y,z)=>{if(rng()<.2){const H=rr(4,9);up('puyaspike',x,y,z,H,H*rr(.28,.36),col('puyaspike',S==='autumn'||S==='winter'?0xc8b890:0xd8dcc0),.03);}
  else{const h=rr(1,2.2);up('puya',x,y,z,h,h*rr(1.3,1.7),col('puya',0xb8c8c8),.05);}},
 guyedstalk:(x,y,z)=>{const h=rr(1.4,3);up('guyedstalk',x,y,z,h,h*rr(.55,.75),col('guyedstalk',0xd06040),.06);},
 skypoppy:(x,y,z)=>{const h=rr(.3,.55);up('skypoppy',x,y,z,h,h*rr(.9,1.2),col('skypoppy',0x8090e0),.1);},
 goldpoppy:(x,y,z)=>{const h=rr(.25,.45);up('goldpoppy',x,y,z,h,h*rr(.9,1.2),col('goldpoppy',0xf0c040),.1);},
 goldroot:(x,y,z)=>{const h=rr(.14,.26);up('goldroot',x,y,z,h/(1-.45),h*1.2,col('goldroot',0xa0b070),.04);}};
// passes: [kind, cell (m), accept(zone, F), band ('box': the whole near box | 'floor': the spine's floor band), pad]. F() gives the full
// fields, worked out only when the zone has not already said no (the passes visit millions of cells)
const PASSES=[
 ['puya',22,(Z,F)=>Z==='puna'?.22*(F().sunny>.2?1:.35):Z==='scree'?.12:Z==='col'?.03:Z==='moraine'?.04:0,'box',2],
 ['guyedstalk',3,(Z,F)=>Z==='shore'?.03:Z==='fan'?(F().fan>.3?.25:.01):Z==='floor'?(F().streamD<8?.35:.02):0,'box',.6],
 ['skypoppy',2.2,(Z)=>(Z==='moraine'?.3:Z==='col'?.08:Z==='krummholz'?.12:Z==='larch'?.05:0)*SEOW.BLOOM,'floor',0],
 ['goldpoppy',2.4,(Z)=>(Z==='puna'?.12:Z==='moraine'?.1:Z==='col'?.05:Z==='scree'?.04:0)*SEOW.BLOOM,'floor',0],
 ['goldroot',2.8,(Z,F)=>Z==='scree'?.16:Z==='fellfield'?.05:Z==='puna'||Z==='krummholz'?(F().crag>12||F().wall==='talus'?.06:0):0,'floor',0]];
SEOW.buildFloor=function(R,q){q=q==null?1:q;R=R==null?2000:R;const st={plants:0,byKind:{}},LOD=BIO.radii(),near=LOD.floor[0],far=LOD.floor[1];
 const BOX=[-R,-R,R,R],BOXES=BIO.host.origin.map(o=>[o[0]-far,o[1]-far,o[0]+far,o[1]+far]);
 PASSES.forEach(P=>{const kind=P[0],floor=P[3]==='floor';let n=0;
  const accept=(x,z)=>{const Z=SEOW.zoneAt(x,z);if(Z==='water'||Z==='road'||Z==='heap'||Z==='crag')return 0;
   let a=P[2](Z,()=>SEOW.FIELDS(x,z));if(!(a>0))return 0;
   if(floor){const d=BIO.lodD(x,z);a*=d<near?1:d<far?.33:0;}return a*q;};
  (floor?BOXES:[BOX]).forEach((B,bi)=>{n+=BIO.grid('seow.'+kind+(floor?'.'+bi:''),P[1],accept,(x,y,z)=>{
   /* a floor pass visits each spine point's box; a cell two boxes share takes only the first (its nearest spine point's) */
   if(floor&&bi>0&&BOXES.slice(0,bi).some(Q=>x>=Q[0]&&x<=Q[2]&&z>=Q[1]&&z<=Q[3]))return;
   D[kind](x,y,z);},{box:B,pad:P[4]==null?0:P[4]});});
  st.byKind[kind]=n;st.plants+=n;});
 return st;};
// the kit's exports run in its registry (core/biome kits: BIO.kitEnd wraps them); the default kit is current again. The layout's own
// functions (46: SEOW.zoneOf, SEOW.at, ...) stay unwrapped: they place nothing, and the passes call them by the million
{const API=BIO.kitEnd({TAGS:SEOW.TAGS,PLANTS:SEOW.PLANTS,SPECIES:[],buildFloor:SEOW.buildFloor});SEOW.buildFloor=API.buildFloor;}
})();
