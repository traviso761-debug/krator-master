// ================================================================= HOST — STATION 2: the canyon's light (the horizon shade's sky term)
// The horizon shade (core/terrain 45, KHORIZON) cuts the sun where the terrain's horizon stands over it and the ambient where little sky is seen (by
// .85 of the hidden share, its default). On an open page that is the right look; in a box canyon 440 m wide under walls of 300-600 m it leaves the
// floor and the head's bowl near black, because what lights a real canyon's floor in its shade is the light bounced off its sunlit walls, which the
// map does not hold. This station halves the sky term's strength (.85 to .45: the floor of the head's bowl, which sees a fifth of the sky, keeps about
// two thirds of its ambient instead of a third), through the map's own uniforms (KHORIZON.uniforms(Hz, {sky})): every material the bake shades reads
// the same set. ?hzsky= sets it for a look (0..1). The station also opens at 11:00 (LAND.hour), when the sun runs nearly down the canyon's axis.
(function(){if(typeof GROUND_HZ==='undefined'||!GROUND_HZ||!KHORIZON.uniforms)return;
 const q=new URLSearchParams(location.search).get('hzsky'),k=q==null?.45:+q;
 KHORIZON.uniforms(GROUND_HZ,{sky:k>=0&&k<=1?k:.45});})();
