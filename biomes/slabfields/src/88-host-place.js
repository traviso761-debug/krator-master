// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 9 and 13)
// The apron's own life (SLAB.buildApron: void fern in the blocks' shade, seep reed at the spring line, bunch grass on the dry bench, lichen on every
// block) and the high country's cushions, snow lotus and poppies on the bench and the slab's ramp (biomes/oidong, read in place: OIDONG.buildHigh, off
// the rubble and the water). The cliff's face is bare: nothing roots on a 70-degree wall (the rock field).
const HIGH_ON=typeof OIDONG!=='undefined'&&!!OIDONG.buildHigh&&new URLSearchParams(location.search).get('high')!=='0';
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='slabfields/apron';Object.assign(st,SLAB.buildApron(TERR.R-150,Q,{keep:DRY,blocks:BLOCKS.filter(S=>!S.talus).map(S=>({x:S.x,z:S.z,y:S.top-2,r:S.r*.8}))}));
 if(HIGH_ON){BIO.cur='oidong/high';
  st.high=OIDONG.buildHigh(TERR.R-150,Q*.55,{cairns:[],walls:[],keep:(x,z)=>DRY(x,z)&&FIELD.apron(x,z)<.35&&FIELD.rock(x,z)<.5?1:0});
  if(OIDONG.COUNTS)OIDONG.COUNTS=OIDONG.SPECIES.map(()=>0);if(OIDONG.TREES)OIDONG.TREES.length=0;if(OIDONG.STONES)OIDONG.STONES.length=0;}
 BIO.cur=null;return st;};
