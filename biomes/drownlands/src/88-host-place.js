/* ==================== HOST — station placement & alkaline chimney / seamount steam plumes (PLAN.md sections 3, 7) ==================== */

const STATION_BUILD=function(Q){
 Q=Q==null?1:Q;
 BIO.cur='drownlands/life';
 const st=DROWN.buildDrown(TERR.R-45,Q,{
  space:DROWN_SPACE,
  site:SITE,
  trimElevM:TRIM_ELEV
 });
 BIO.cur=null;

 if(typeof ATMOS!=='undefined'&&ATMOS.smokeGroups){
  try{
   const groups={};
   if(DROWN.VAPOUR.length){
    groups.brucite={emitters:DROWN.VAPOUR.slice(0,22).map(p=>[p[0],p[1]+0.12,p[2],'steam']),n:12,k:0.28};
   }
   if(SKEY==='bar'){
    /* Faint phreatomagmatic steam column rising above Steaming Seamounts (166, 338) on the NNW horizon */
    groups.seamount={emitters:[[-2600,440,-9800,'steam'],[1900,320,-11200,'steam']],n:18,k:1.8};
   }
   if(Object.keys(groups).length){
    window._drownSteam=ATMOS.smokeGroups(groups);
   }
  }catch(e){reportErr('steam plumes: '+e.stack);}
 }
 return st;
};
