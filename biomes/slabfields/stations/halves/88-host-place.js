// ================================================================= HOST — station 3's placement: the Halves (89z runs STATION_BUILD; PLAN.md sections 9 and 13)
// The kit's own life (SLAB.buildApron: void fern in the blocks' shade, seep reed on the pool's shore, at the springs and the pits' seeps, bunch grass on
// the dry bench, lichen on every block) and, on the bench and the halves off the apron's rubble, the Siphon Pits' cold ground's small life read in place
// (SIPHON.buildCold: cushion moss, orange rock lichen, scree sedge; the bench at 3.3 km is Dsc, as the Siphon Pits' Scarp Pass at the same height).
const SIPHON_ON=typeof SIPHON!=='undefined'&&!!SIPHON.buildCold&&new URLSearchParams(location.search).get('siphon')!=='0';
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
/* the cold ground: off the apron's rubble and off the patera's floor (the old crust is bare) */
const ON_SLAB=(x,z)=>FIELD.apron(x,z)<.3&&!(L.pr(x,z)<SITE.patera.r-150&&terrainH(x,z)<SITE.patera.floor+8)?1:0;
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='slabfields/apron';Object.assign(st,SLAB.buildApron(TERR.R-150,Q,{keep:DRY,blocks:BLOCKS.filter(S=>!S.talus).map(S=>({x:S.x,z:S.z,y:S.top-2,r:S.r*.8}))}));
 if(SIPHON_ON){BIO.cur='siphon/cold';
  st.ramp=SIPHON.buildCold(TERR.R-150,Q*.7,{keep:(x,z)=>DRY(x,z)&&ON_SLAB(x,z)?1:0});}
 BIO.cur=null;return st;};
