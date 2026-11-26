// ================================================================= HOST — station placement order (89z runs STATION_BUILD)
// Places the four subsurface rheolith guilds and eight surface byproducts first, then Throne's wild/sterile Ranj and bone-bells.
const STATION_BUILD=function(Q){
 Q=Q==null?1:Q;
 const st={};
 BIO.cur='rheolith/throat';
 Object.assign(st,RHEO.build({
  R:TERR.R-120,
  quality:Q,
  ground:DRAWN_H,
  normal:DRAWN_N,
  temp3:TEMP3_AT,
  aw:AW_AT,
  ph:PH_AT,
  pit:PIT,
  vents:VENTS,
  bench:BENCH,
  wind:SITE.wind
 }));
 try{st.kin=growKin();}catch(e){reportErr('kin: '+e.stack);}
 BIO.cur=null;
 return st;
};
