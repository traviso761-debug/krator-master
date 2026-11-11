// ================================================================= HOST - the atmosphere (core/atmos), bound: the deck, the snow, the blizzard (highrift's 89a, PLAN.md section 6)
//   height fog (?hfog=0)   the air thinning with height (R1); on station 3 its MIST is the amber deck: pooled under the lid (+2,580 m), thinning over 20 m
//                          above it, all day (its dawn window opened to the whole day: an inversion, not a morning mist), ~200 m visibility on the floor
//                          (mist density 0.02 per m, Koschmieder's 3.912 / sigma). On the Arete the same mist fills the two pits to 150 m over their floors
//   snow (?snow=0)         snow that lies (fx/snowcover) on the station's own line, kept off the hot ground (89b: KTHERM's snow mask)
//   the weather            core/atmos's selector; the cold stations offer snowfall and the blizzard (climate cold). The Arete OPENS IN THE BLIZZARD
//                          (?weather=clear for a clear day): the weather's blizzard (W.snow 1, wind x2.7, the white-out fog); the scarp and the terraces clear
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:9870+SITE.zone,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const DECK=SKEY==='pitfloor'?{y:SITE.fog.top,density:SITE.fog.density,depth:20,noise:.25}:SKEY==='arete'?{y:SITE.floor+150,density:.012,depth:40,noise:.5}:null;
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,snow:false,deck:null};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog(Object.assign({falloff:1/700,sun:.3,sky:.3},DECK?{mist:{density:DECK.density,y:DECK.y,depth:DECK.depth,noise:DECK.noise,night:1,dawn:[-2,-1,25,26]}}:{}));
  ATMOS.heightFogScene(scene);out.hfog=true;out.deck=DECK;}
 if(ATMOS.rainCover&&RAIN_FITS){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 else if(ATMOS.rainCover)out.raincover='skipped: the ground reads '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 if(q.get('snow')!=='0'&&ATMOS.snowCover){ATMOS.snowCover({line:SNOW_LINE,lee:.45,base:0});out.snow=true;}
 return out;})();
const WEATHER0=new URLSearchParams(location.search).get('weather')||(SKEY==='arete'?'blizzard':'clear');
ATMOS.bindWeather({climate:{cold:SKEY!=='pitfloor'},mode:WEATHER0,sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
window._air=Object.assign({weather:WEATHER0},AIR);
