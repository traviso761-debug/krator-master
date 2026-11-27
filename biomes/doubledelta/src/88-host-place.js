// ================================================================= HOST — station placement & warm sponge-bioherm mist plumes (PLAN.md §5.1, §8)
// Runs DOUBLEDELTA.buildDelta on DD_SPACE (KSPACE) and attaches warm monsoon/metabolic mist puffs rising from the oscular chimneys.
const STATION_BUILD=function(Q){
 Q=Q==null?1:Q;
 BIO.cur='doubledelta/life';
 const st=DOUBLEDELTA.buildDelta(TERR.R-140,Q,{
  space:DD_SPACE,
  psu:PSU_AT,
  silica:SILICA_AT,
  ecotone:ECOTONE_AT,
  minWoodyY:MIN_WOODY_Y,
  lag:L.LAG,
  peat:L.PEAT,
  wrack:L.WRACK,
  amber:L.AMBER,
  bitumen:L.BITUMEN,
  blueClay:L.BLUECLAY,
  mire:L.MIRE,
  reserve:SITE.settlementReserve||null
 });
 BIO.cur=null;
 if(DOUBLEDELTA.OSCULA.length&&typeof ATMOS!=='undefined'&&ATMOS.smokeGroups){
  try{
   const E=DOUBLEDELTA.OSCULA.slice(0,24).map(p=>[p[0],p[1]+0.15,p[2],'steam']);
   window._osculaMist=ATMOS.smokeGroups({oscula:{emitters:E,n:14,k:0.32}});
  }catch(e){reportErr('oscula mist: '+e.stack);}
 }
 return st;
};
