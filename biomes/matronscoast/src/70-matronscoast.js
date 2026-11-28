// ================================================================= MATRONSCOAST — BIOME-API build entry, canopy query & kit seal ([G data])
MATRON.ID='matronscoast';
MATRON.POLYGON='rmwvqchv37nh0';
MATRON.ENDONYM='Kande-Sakhil';
MATRON.build=function(opt){
 opt=opt||{};
 BIO.cur='matronscoast/life';
 const out=MATRON.placeAll(opt);
 BIO.cur=null;
 return out;
};
MATRON.canopyH=function(x,z){
 const S=SNAIL_SITES[typeof SKEY!=='undefined'?SKEY:'skerry'];
 const mh=SNAIL_PHYS.mucusHighwayAt(x,z,S,0.1);
 if(mh.trail01>0.55)return 2.4;
 if(S.id==='cloudslope')return 26.5;
 if(S.id==='browsewood')return 24.0;
 return 16.5;
};
BIO.kitEnd(MATRON);
