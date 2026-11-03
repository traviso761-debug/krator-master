// ================================================================= HOST — the high passes' placement (station 2): the kit's high country (OIDONG.buildHigh) with this
// stage's cairns and prayer-stone walls; 89z runs it in place of the valley's passes (STATION_SKIP_KIT)
const STATION_BUILD=function(){const q=new URLSearchParams(location.search),Q=q.has('q')?+q.get('q'):1;BIO.cur='oidong/high';
 const st=OIDONG.buildHigh(TERR.R-150,Q,{cairns:CAIRNS,walls:WALLS});BIO.cur=null;OIDONG.COUNTS=OIDONG.SPECIES.map(()=>0);OIDONG.TREES.length=0;OIDONG.STONES.length=0;return st;};
