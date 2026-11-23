/* ================================================================= HOST — station placement entry ([G data]) */
function STATION_BUILD(q){
 const own=THEDOME.build({quality:q});
 const kin=typeof growDomeKin==='function'?growDomeKin(q):{};
 window._kin=kin;
 return Object.assign({},own,kin);
}
