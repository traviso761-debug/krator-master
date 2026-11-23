// ================================================================= HOST — station 2's placement: the Leaner (89z runs STATION_BUILD; PLAN.md sections 9 and 13)
// The kit's own life on the apron, the shelf and the plain (SLAB.buildApron: void fern in the blocks' shade, seep reed on the lake's shore, at the warm
// springs and the ponds' wet ends, bunch grass on the dry corridor, lichen on every block), and on the slab itself the Siphon Pits' cold ground's small
// life, read in place (SIPHON.buildCold: cushion moss in the ramp's joints, orange rock lichen on its steps and the cliff's ledges, scree sedge; PLAN.md
// section 9, "the ramps"). The high country's cushions (OIDONG.buildHigh, station 1's) are not drawn: the corridor at 2.1 km is BSk, +17 degC.
const SIPHON_ON=typeof SIPHON!=='undefined'&&!!SIPHON.buildCold&&new URLSearchParams(location.search).get('siphon')!=='0';
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
/* the slab: its ramp, its cliff and the talus under it (the Siphon Pits' small life keeps to it) */
const ON_SLAB=(x,z)=>L.toV(x,z)>L.footV(L.toS(x,z))-SITE.slab.talus.reach*.6?1:0;
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='slabfields/apron';Object.assign(st,SLAB.buildApron(TERR.R-150,Q,{keep:(x,z)=>DRY(x,z)&&!ON_SLAB(x,z)?1:0,blocks:BLOCKS.filter(S=>!S.talus).map(S=>({x:S.x,z:S.z,y:S.top-2,r:S.r*.8}))}));
 if(SIPHON_ON){BIO.cur='siphon/cold';
  st.ramp=SIPHON.buildCold(TERR.R-150,Q*.8,{keep:(x,z)=>DRY(x,z)&&ON_SLAB(x,z)?1:0});}
 BIO.cur=null;return st;};
