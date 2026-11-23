// ================================================================= SPRINGHOLLOWS — BIOME-API build entry, canopy query & kit seal ([G data])
SPRINGHOLLOWS.ID='springhollows';
SPRINGHOLLOWS.POLYGON='rmvyiyw8ucd1y';
SPRINGHOLLOWS.ENDONYM='Sikwingi-Khaloyi';
SPRINGHOLLOWS.build=function(opt){
 opt=opt||{};
 BIO.cur='springhollows/life';
 const out=SPRINGHOLLOWS.placeAll(opt);
 BIO.cur=null;
 return out;
};
SPRINGHOLLOWS.canopyH=function(x,z){
 const y=BIO.host.terrainH(x,z);
 const w=BIO.host.waterH(x,z);
 if(w>-1e5&&y-w<=1.5)return 28.0;
 return 16.5;
};
BIO.kitEnd(SPRINGHOLLOWS);
