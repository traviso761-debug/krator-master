// ================================================================= HOST — a deep cut's light (the horizon shade's sky term; LAND.hzSky)
// The horizon shade (core/terrain 45, KHORIZON) cuts the sun where the terrain's horizon stands over it and the ambient where little sky is seen (by
// .85 of the hidden share, its default). On an open page that is the right look; in a box canyon or a gorge under walls of tens to hundreds of metres
// it leaves the floor near black, because what lights a real canyon's floor in its shade is the light bounced off its sunlit walls, which the map
// does not hold. A station with such a cut sets LAND.hzSky (0..1: .45 lets a floor that sees a fifth of the sky keep about two thirds of its ambient
// instead of a third), through the map's own uniforms (KHORIZON.uniforms(Hz, {sky})): every material the bake shades reads the same set. Coyote
// Canyon (station 2: its head's bowl) and the Great Tread (station 4: the dry gorge) set .45; the others keep the default. ?hzsky= sets it for a look.
(function(){if(typeof GROUND_HZ==='undefined'||!GROUND_HZ||!KHORIZON.uniforms)return;
 const q=new URLSearchParams(location.search).get('hzsky'),d=LAND.hzSky,k=q==null?d:+q;
 if(k==null||!(k>=0&&k<=1))return;KHORIZON.uniforms(GROUND_HZ,{sky:k});})();
