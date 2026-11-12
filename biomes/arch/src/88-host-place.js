// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 7 and 11)
// On the chemistry (45: PH_AT, SOIL_AT) and the heat (48: HEAT_AT): the life on the ground (ARCHB.buildArch: the maquis where ARCH.earthOk, the native
// life where ARCH.lifeAt is 'native'), the curtains along the meeting's dividing line (ARCHB.curtains, on ARCH.meeting's samples), the seep combs at the
// flame cleft (ARCHB.combs, on the flames 89b lights).
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='arch/life';Object.assign(st,ARCHB.buildArch(TERR.R-150,Q,{heat:HEAT_AT,ph:PH_AT,soil:SOIL_AT,keep:DRY,lava:LAVA_AT,mud:L.MUD||null,strand:L.STRAND||null,sand:L.SAND||null}));
 if(L.MEET){BIO.cur='arch/curtains';const O=L.OUT;st.curtains=ARCHB.curtains(L.MEET,(s,a)=>O.p(s,a),L.outLv,Q);}
 if(FLAMES.list.length){BIO.cur='arch/combs';st.combs=ARCHB.combs(FLAMES.list,Q).combs;}
 BIO.cur=null;return st;};
