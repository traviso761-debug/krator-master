/* ================================================================= THE DOME — BIOME-API build entry & canopy query ([G data]) */
THEDOME.build=function(opt){
 opt=opt||{};
 BIO.cur='thedome/life';
 const out=THEDOME.placeAll(opt);
 BIO.cur=null;
 return out;
};
THEDOME.canopyH=function(x,z){
 const skey=typeof SKEY!=='undefined'?SKEY:'apron';
 if(skey==='crown')return 6.8;
 if(skey==='moat'&&z<40)return 10.5;
 const sh=DOME_PHYS.shellAt(x,z,typeof SITE!=='undefined'?SITE:null);
 return sh.shellStep01>=0.70?8.5:1.5;
};
BIO.kitEnd(THEDOME);
