// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the kits that grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name; 43-world-ohr.js extends oidong's weight into Strongbow's Xanadu canyon floor and tapers
// it to 0 above the 3,300 m alpine treeline):
//   oidong     on the 'oidong valley' overlay (and Strongbow's canyon floor): its own pass table (OIDONG.PASSES) and its
//              floor profiles (moss, meadow, bamboo, terrace, mist, stream, flats)
//   highrift   on the 'high rift' overlay (21,261 px: the three houses): no trees; its floor (HRIFT_WORLD,
//              49-world-highrift.js): the rift's tussock, steam heath, opal cane, bead caps and Verdigris wort
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/* Oidong's floor profiles (biomes/oidong/src/60-biome-oidong-floor.js): moss mats & ferns, poppy & mist-tea meadows,
   bamboo shoots, upland terraces, cataract mist ferns & mooncaps, stream iris, and pale gravel flats */
const OID_PROFILES={
 moss:{wet:.82,upland:.12,slope:.06,rock:0,cold:.1,mist:.1,flat:0,flow:0},
 meadow:{wet:.52,upland:.10,slope:.05,rock:0,cold:.1,mist:0,flat:0,flow:0},
 bamboo:{wet:.80,upland:.06,slope:.12,rock:0,cold:.08,mist:0,flat:0,flow:0},
 terrace:{wet:.54,upland:.68,slope:.24,rock:.12,cold:.28,mist:0,flat:0,flow:0},
 mist:{wet:.88,upland:.18,slope:.14,rock:.08,cold:.12,mist:.82,flat:0,flow:.2},
 stream:{wet:.85,upland:.12,slope:.08,rock:.06,cold:.1,mist:.15,flat:0,flow:.85},
 flats:{wet:.34,upland:.10,slope:.04,rock:.08,cold:.15,mist:0,flat:.88,flow:0}};
function oidPick(x,z){
 const A=WORLD.at(x,z),live=(1-sm(.58,.88,A.rock))*(1-sm(.72,.92,A.slope));
 if(!(live>.02))return{moss:0};
 const mist=sm(.28,.65,A.mist==null?0:A.mist)*live,str=sm(.38,.75,A.flow)*live*(1-mist*.5);
 const fl=sm(.35,.72,A.flat==null?0:A.flat)*live*(1-mist)*(1-str);
 const hi=sm(.34,.68,A.upland),wet=sm(.56,.76,A.wet);
 const rest=live*(1-mist*.7)*(1-str*.6)*(1-fl*.8);
 return{moss:rest*wet*(1-hi*.5)*.9,meadow:rest*(1-wet*.6)*(1-hi)*.85,bamboo:rest*wet*(1-hi)*.45,
  terrace:rest*hi*.9,mist:mist*1.2,stream:str*1.1,flats:fl*.7};}
/* the High Rift floor's four grounds, as field profiles (the nursery grows each patch under one; HRIFT.buildRift reads
   hrheat, hracid and hrgrass): cold tussock, the mild grabens, the vents' warm margins, their hot discs and run-off */
const HR_PROFILES={cold:{hrheat:2,hracid:0,hrgrass:.8,cold:.6,wet:.3},graben:{hrheat:6,hracid:0,hrgrass:1.2,cold:.25,wet:.5},
 warm:{hrheat:18,hracid:.15,hrgrass:.6,cold:.2,wet:.55,mist:.45},hot:{hrheat:42,hracid:.6,hrgrass:.2,cold:0,wet:.65,mist:.3}};
return[{name:'oidong',global:'OIDONG',overlay:'oidong valley',lod:LOD,
  floor:{profiles:OID_PROFILES,pick:oidPick}},
 {name:'highrift',global:'HRIFT_WORLD.highrift',overlay:'high rift',lod:LOD,
  floor:{profiles:HR_PROFILES,pick:(x,z)=>HRIFT_WORLD.pick(x,z)}}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
