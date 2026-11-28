// ================================================================= RICOCHET PEAKS — BIOME-API build entry, BIO.kin cousins & kit seal ([G data])
RICOCHET.ID='ricochetpeaks';
RICOCHET.POLYGON='rmwvsvyf1iqzg';
RICOCHET.ENDONYM='Ricochet Peaks';
RICOCHET.build=function(opt){
 opt=opt||{};
 BIO.cur='ricochetpeaks/life';
 const out=RICOCHET.placeAll(opt);
 BIO.cur=null;
 return out;
};
RICOCHET.canopyH=function(x,z){
 const sk=typeof SKEY!=='undefined'?SKEY:'ringlake';
 const st=RICOCHET_SITES[sk]||RICOCHET_SITES.ringlake;
 if(st.koppen==='ET')return 0.4;
 if(sk==='glasssheet')return 8.5;
 return 22.0;
};
BIO.kitEnd(RICOCHET);

// Lazily instantiated BIO.kin (core/biome 32) cousins after BIO.kitEnd registers RICOCHET in BIO.kits
RICOCHET.kinCousins=function(){
 if(RICOCHET._kin)return RICOCHET._kin;
 if(typeof BIO.kin!=='function')return null;
 RICOCHET._kin={
  rimLarch:BIO.kin('ricochetpeaks.shatter_larch',{
   key:'rim_larch_krummholz',
   name:'Rim Krummholz Larch (nwouterwall kin)',
   scale:0.44,
   tags:{kin:'nwouterwall.furlarch',zone:'rim_krummholz'}
  }),
  notchPine:BIO.kin('ricochetpeaks.glass_pine',{
   key:'notch_flag_pine',
   name:'Wind-Flagged Notch Melt-Pine (nwouterwall kin)',
   scale:0.78,
   tags:{kin:'nwouterwall.stonepine',zone:'breach_notch'}
  })
 };
 return RICOCHET._kin;
};
