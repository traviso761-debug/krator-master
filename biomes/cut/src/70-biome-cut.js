// ================================================================= THE CUT — build / plants
// The kit's public surface (BIOME-API.md): CUT.build(o) plans the natives (55) and the camp (60) and draws them;
// CUT.warpKit (46) is what a host calls on a kit it reads in place before that kit builds. CUT.PLANTS is the plan's
// records (the groves and every culm in them, the reeds, the rankgrass, the melons, the lichen), kept after the draw.
(function(){
 const ITEM={hculm:'hyperbamboo',hculmm:'hyperbamboo',hculmf:'hyperbamboo',hculmb:'hyperbamboo',hecho:'hyperbamboo',hleaf:'hyperbamboo',hshoot:'hyperbamboo',reed:'ringreed',rank:'rankgrass',melon:'measuremelon',mfruit:'measuremelon',lichen:'circlelichen'};
 CUT.speciesOfItem=name=>{const k=ITEM[String(name).replace(/\d+$/,'')];return k?CUT.byKey[k]:null;};
 CUT.build=function(o){o=o||{};const out={};BIO.cur='cut/plan';const P=CUT.PLANTS=CUT.plan(o);
  BIO.cur='cut/natives';Object.assign(out,CUT.draw(P,o));out.groves=P.groves.length;
  if(o.camp){BIO.cur='cut/camp';CUT.CAMP=CUT.planCamp(Object.assign({ground:o.ground},o.camp));out.camp=CUT.drawCamp(CUT.CAMP);}
  BIO.cur=null;return out;};
 BIO.kitEnd(CUT);
})();
