// ================================================================= HOST — the atmosphere: the cloud sea and its day, the weather, the air
// core/atmos bound for this stage. The cloud sea is ATMOS.cloudDeck (a field written from PRESETS.clouddeck, so an engine draws the same cloud), and
// its level follows the day: ATMOS.deckDay (fx/deckday, PLAN.md section 14 item 5) laps it up the foot after dawn and burns it back by afternoon,
// on LUNG.DECK's hours, the same curve LUNG.breath's condensation engine reads (LUNG.deckK), so the deck and the breath cannot disagree.
ATMOS.init({THREE,scene,camera,hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:STN.hour,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:0x1A6,err:reportErr});
const DECK=STN.deck!==false&&CLOUD_Y>-1e4?ATMOS.cloudDeck({y:CLOUD_Y,sun:[-1000,900,-700],bounds:[-13000,-12600,13000,rimZ(0)-SCARP.run*.6],name:'The cloud sea'}):null;
const DECK_DAY=DECK&&ATMOS.deckDay?ATMOS.deckDay(DECK,Object.assign({y:CLOUD_Y},LUNG.DECK)):null;
if(DECK)REGISTER({name:'The cloud sea (the hyperjungle\'s air, pooled under the Wall)',x:0,z:rimZ(0)-SCARP.run-150,y:CLOUD_Y-80,r:900,h:160});
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/700,sun:.3,sky:.35});/* THE FOG BELT on the face: the hyperjungle's wet air forced up the Wall condenses from the deck's top to ~1.4 km above it (shighlands' belt) */
  if(Q.get('belt')!=='0'&&STN.fog!==false&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt({y0:STN.belt?STN.belt[0]:CLOUD_Y-20,y1:STN.belt?STN.belt[1]:CLOUD_Y+1400,windward:[0,-1],density:.0008,depth:50,lee:.25,rise:.5,
   extent:[-TERR.R*1.6,-TERR.R*2.4,TERR.R*1.6,TERR.R*1.2],res:128,steps:8});out.belt=true;}
  ATMOS.heightFogScene(scene);out.hfog=true;}
 return out;})();
