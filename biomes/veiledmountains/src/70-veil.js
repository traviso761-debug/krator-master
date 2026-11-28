// ================================================================= VEILED MOUNTAINS — BIOME-API build entry, canopy query & kit seal ([G data])
VEIL.ID='veiledmountains';
VEIL.POLYGON='rmwzq1pa88m7q';
VEIL.HOMELAND='Timpar-Kuran';
VEIL.build=function(opt){
 opt=opt||{};
 BIO.cur='veiledmountains/life';
 const out=VEIL.placeAll(opt);
 BIO.cur=null;
 return out;
};
VEIL.canopyH=function(x,z){
 const sk=typeof SKEY!=='undefined'?SKEY:'hall';
 const st=VEIL_SITES[sk]||VEIL_SITES.hall;
 if(sk==='veilpass')return 11.0;
 if(sk==='southvale')return 13.5;
 return st.baseElevM<2600?46.0:28.0;
};
BIO.kitEnd(VEIL);
