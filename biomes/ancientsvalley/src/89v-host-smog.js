// ================================================================= HOST - the smog (core/atmos height fog, the page's fog tinted)
// [web] The owner, 2026-11-08: "a frequent atmos effect of dark, unnaturally turbulent, coloured or softly glowing cloudiness and medium-distance
// smog, thick fog and haze; near cities this becomes universal; it should enhance the atmosphere and help sell the LOD". This page is all
// city1, so here it is universal: the sky's clouds low, heavy and fast and the air turbid and dust-coloured (STAGE.clouds, STAGE.airLook, 89s),
// the page's fog thick (STAGE.fogDensity: 2 km half veiled, 4 km gone, the far tiers with it), and on top of that the height fog's two layers:
// THE MIST, the smog itself, pooled on the valley floor and thinning over the shelf (full under lakeY + above, gone `depth` m higher, in
// drifting patches), and THE BAND, a broken layer of dark cloud over the city at the tallest towers' height (their tops go into it). The
// fog's colour is drawn each frame toward the smog's (a brown-purple grey: the taint's hue in the air); the weather host follows a page
// that recolours its own fog. A later station varies the smog by F.density (thinner on the terraces, universal in the cores).
(function(){const S=STAGE.smog;if(!S||typeof ATMOS.heightFog!=='function')return;const LY=STAGE.lakeY;
 ATMOS.heightFog({falloff:1/760,sun:.3,sky:.45,
  mist:Object.assign({density:S.mist.density,y:LY+S.mist.above,depth:S.mist.depth,noise:S.mist.noise,day:S.mist.day==null?0:S.mist.day},
   S.mist.field?{field:{at:(x,z)=>STAGE.F.density(x,z),centre:[0,0],radius:7000,res:128},samples:6}:{}),   /* the field: core/atmos 2026-11-09; an older core ignores the keys */
  band:{density:S.band.density,y:[LY+S.band.y[0],LY+S.band.y[1]],cover:S.band.cover,noise:S.band.noise}});
 ATMOS.heightFogScene(scene);
 const C=new THREE.Color().setRGB(S.colour[0],S.colour[1],S.colour[2]),k=S.mix==null?.6:S.mix;
 tick(function(){if(scene.fog)scene.fog.color.lerp(C,k);});
 window.AV_SMOG={mist:S.mist,band:S.band,colour:S.colour};})();
