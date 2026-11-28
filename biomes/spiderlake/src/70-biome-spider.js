// ================================================================= SPIDER LAKE — BIOME-API build entry & canopy query ([G data])
SPIDERLAKE.build=function(opt){
 opt=opt||{};
 BIO.cur='spiderlake/life';
 const out=SPIDERLAKE.placeAll(opt);
 BIO.cur=null;
 return out;
};
SPIDERLAKE.canopyH=function(x,z){
 const skey=typeof SKEY!=='undefined'?SKEY:'spillway';
 if(skey==='rampart')return 8.5;
 const y=BIO.host.terrainH(x,z);
 return y<4.0?24.0:14.5;
};
BIO.kitEnd(SPIDERLAKE);
