// ================================================================= SW OUTER WALL — BIOME-API build entry, canopy query & kit seal ([G data])
SWOW.ID='swouterwall';
SWOW.POLYGON='rmwvsqhhqyk3f';
SWOW.PASS_POLYGON='rmwvsmgi8xrro';
SWOW.ANNEALED_FROM='rmwzq42zszc94';
SWOW.build=function(opt){
 opt=opt||{};
 BIO.cur='swouterwall/life';
 const out=SWOW.placeAll(opt);
 BIO.cur=null;
 return out;
};
SWOW.canopyH=function(x,z){
 const sk=typeof SKEY!=='undefined'?SKEY:'boreallakes';
 if(sk==='boreallakes')return 20.5;
 if(sk==='morainetarn')return 3.2;
 return 0.9;
};
BIO.kitEnd(SWOW);
