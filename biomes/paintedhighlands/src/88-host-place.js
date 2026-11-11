// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 4 and 7)
// The kit's floor (PAINTED.buildFloor: the steppe and the bloom's drifts, each drift's flower read from the bed under it: BED_AT, 84), the rims' and
// ledges' trees (PAINTED.buildTrees: the eastern badlands' juniper and pinyon, BIO.kin), the stone circles on the playa's rim (the bloom flats), the
// seeps' hanging gardens (the cliff town's wall: PAINTED.dress), the fallen blocks at the cliffs' feet (TALUS_AT).
const GRASS={stripes:.7,bloom:.8,canyon:.55,cliff:.6}[SKEY],BLOOM_K={stripes:1,bloom:1,canyon:.75,cliff:.35}[SKEY];
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
/* the foot of a cliff: gentle here, a steep face within 30 m uphill (the danxia's spall lands on the clay below) */
const TALUS_AT=(x,z)=>{if(FIELD.rock(x,z)>.45)return 0;let m=0;for(let k=0;k<6;k++){const a=k/6*TAU;m=Math.max(m,FIELD.rock(x+Math.cos(a)*22,z+Math.sin(a)*22));}return smooth(.5,.85,m);};
/* where a juniper or a pinyon takes: the rims, the benches and ledges, a few on the dip slopes; never on the bare clay or a face */
const TREE_AT=(x,z)=>{const rk=FIELD.rock(x,z),br=FIELD.bare(x,z),sl=FIELD.slope(x,z),rim=FIELD.rim(x,z),open=(1-rk)*(1-smooth(.2,.5,br))*(1-smooth(.22,.4,sl));
 if(SKEY==='stripes')return open*(rim*.35+.02*smooth(0,-600,across(x,z)-SITE.scarp.u)+.08*TALUS_AT(x,z));
 if(SKEY==='bloom')return open*(rim*.06+.03*smooth(-1200,-1700,across(x,z)))*(1-FIELD.flat(x,z));
 if(SKEY==='canyon'){const a=Math.abs(z-L.cz(x)),bench=Math.abs(terrainH(x,z)-contactAt(x,z))<14?1:0;return open*(bench*.45+rim*.3+.06*FIELD.canyon(x,z));}
 return open*(.08+.12*FIELD.wet(x,z));};
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='paintedhighlands/floor';Object.assign(st,PAINTED.buildFloor(TERR.R-150,Q,{bed:BED_AT,talus:TALUS_AT,keep:DRY,grass:GRASS,bloom:BLOOM_K,bloomAt:SKEY==='stripes'?(x,z)=>{const a=KRELIEF.at(L.WADI,x,z,L.floor0(x,z));return a&&(a.part==='floor'||a.part==='bar')?.9:0;}:null}));
 BIO.cur='paintedhighlands/trees';st.trees=PAINTED.buildTrees(TERR.R-150,Q,{accept:TREE_AT,keep:DRY,ecotone:SKEY==='cliff',wetAt:(x,z)=>FIELD.wet(x,z)});
 if(SKEY==='bloom'){BIO.cur='paintedhighlands/sites';st.stones=PAINTED.circles(SITE.circles);}
 if(SKEY==='cliff'&&SEEPS.length){BIO.cur='paintedhighlands/floor';st.gardens=PAINTED.dress(SEEPS,{anywhere:true,reach:9,n:18});}
 BIO.cur=null;return st;};
