// ================================================================= ARCFLOW — BIOME-API build entry, canopy query & kit seal ([G data])
ARCFLOW.ID='arcflow';
ARCFLOW.POLYGON='rmwetn7jqgm9g';
ARCFLOW.ENDONYM='Kulaneva';
ARCFLOW.build=function(opt){
 opt=opt||{};
 BIO.cur='arcflow/life';
 const out=ARCFLOW.placeAll(opt);
 BIO.cur=null;
 return out;
};
ARCFLOW.canopyH=function(x,z){
 const fq=ARCFLOW_PHYS.frontierQuiltAt(x,z,ARCFLOW_SITES[typeof SKEY!=='undefined'?SKEY:'klint']);
 if(fq.biosphere==='bleach')return 0.5;
 if(fq.biosphere==='carnelian')return 7.5;
 return 18.5;
};
BIO.kitEnd(ARCFLOW);
