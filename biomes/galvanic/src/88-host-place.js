// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 7 and 12)
// The battery's life on the strand (GALV.place: runners, crusts, masts, reefs, jars), handed the host's water, acid, flood and season; then the Rift's
// trees on the hills (87-host-kin.js). The store jars' charge is the page's day (DAY: ?day=), so the dry season's taut jars and the flood's slack ones
// are one URL apart.
const STORE_AT=(function(){const memo=new Map();return(x,z)=>{const y=Math.round((terrainH(x,z)-SITE.sea)*100);if(!memo.has(y))memo.set(y,GALV_PHYS.store(y/100,{day:DAY}));return memo.get(y);};})();
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 BIO.cur='galvanic/strand';
 Object.assign(st,GALV.build({R:TERR.R-120,quality:Q,ph:PH_AT,flood:FLOOD_AT,store:STORE_AT,streams:STREAMS,mounds:MOUNDS,deep:{x:DP.x,z:DP.z,r:DP.r},
  keep:(x,z)=>PH_AT(x,z)<5.4?1:0}));
 try{st.kin=growKin();}catch(e){reportErr('kin: '+e.stack);}
 BIO.cur=null;return st;};
