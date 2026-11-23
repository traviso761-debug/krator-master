// ================================================================= RHEOLITH — kit entry and close (PLAN.md section 7; [G data])
// No THREE, no geometry, no DOM: closes BIO.kit('rheolith') and exposes RHEO.build(opts).
RHEO.build=function(o){
 o=o||{};
 const R=o.R==null?750:o.R,q=o.quality==null?1:o.quality;
 return RHEO.place(R,q,o);
};
BIO.kitEnd(RHEO);
