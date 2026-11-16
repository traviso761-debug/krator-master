// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the fields the kits read
// [G data] The fields this region's kits read that the world does not make (as openworld/xanadu-oidong-highrift's 43 adds them):
//   flat   the Oidong kit's pale flats (biomes/oidong/src/55: its `flats` zone and the cloud pines, peyote and stone-blooms
//          on it). The kit's own page paints them; the world has no map of them yet, so the field is 0 everywhere and the
//          valley's other zones (meadow, moss, terrace, mist, stream, shore) take the ground. An unknown field reads as
//          undefined in a kit's zones, which made every zone NaN and grew nothing (KNOWN_ISSUES.md).
//   hrheat, hracid, hrgrass   the High Rift kit's ground temperature (degC), acid ground (0..1) and tussock share: 0 on
//          the world's ground (the kit grows only on the floor's patches), set by its floor profiles (49-world-highrift.js)
// It extends WORLD.FIELDS (so the flora's tile grids carry it) and wraps WORLD.fieldsFrom, so every sample has it.
(function(){'use strict';
const EXTRA={flat:0,hrheat:0,hracid:0,hrgrass:0};
for(const k in EXTRA)if(WORLD.FIELDS.indexOf(k)<0)WORLD.FIELDS.push(k);
const ff=WORLD.fieldsFrom;
WORLD.fieldsFrom=function(x,z,h,tanS,P,out){const A=ff.call(WORLD,x,z,h,tanS,P,out);for(const k in EXTRA)if(A[k]==null)A[k]=EXTRA[k];return A;};
const at=WORLD.at;
WORLD.at=function(x,z){const A=at.call(WORLD,x,z);for(const k in EXTRA)if(A[k]==null)A[k]=EXTRA[k];return A;};
WORLD.OHR_FIELDS=Object.keys(EXTRA);})();
// The High Rift's ground (as openworld/xanadu-oidong-highrift's 43 greens the Xanadu overlay). core/world 41 has no style
// for the 'high rift' overlay, so it took the desert's red sandstone palette, where the rift is tawny tussock over grey
// welded tuff and basalt (biomes/highrift/PLAN.md section 3; its kit's PAL.tussock). This tints it by the sample's
// wetness: the tussock's tawny gold where it is dry, the steam heath's grey-green where it is wet, the alpine grey-tan
// where it is cold. Rock, river silt, roads, salt and snow keep the colour 41 gives. Until 41 takes a 'high rift' style.
(function(){'use strict';
let KX=null;   /* the kit's index, looked up at the first call: WORLD_KITS (47) is defined after this fragment */
const lin=h=>{const f=c=>c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);return[f((h>>16&255)/255),f((h>>8&255)/255),f((h&255)/255)];};
const DRY=lin(0xa89a6a),MEAD=lin(0x8a8a62),LUSH=lin(0x667a5a),ALP=lin(0x8c8a7c),REF=lin(0xa85a42);
const REFS=REF[0]+REF[1]+REF[2],sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const mix=(o,c,t)=>{o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;},T=[0,0,0];
const g=WORLD.ground;
WORLD.ground=function(x,z,S,out){g.call(WORLD,x,z,S,out);if(KX===null)KX=WORLD_KITS.findIndex(k=>k.name==='highrift');if(KX<0)return out;const xw=WORLD.kitW(KX,x,z);if(!(xw>0))return out;
 const snow=S.temp<2?sm(2,-6,S.temp)*sm(.75,.45,S.slope):0;
 const k=xw*(1-S.rock*.85)*(1-S.flow*.45)*(1-(S.road||0))*(1-S.salt)*(1-snow)*.88;if(!(k>0))return out;
 const moist=sm(.1,.48,S.wet);   /* 41's wet: ~.5 at 800 mm in a humid climate (green), ~.25 in a dry one */
 T[0]=DRY[0];T[1]=DRY[1];T[2]=DRY[2];mix(T,MEAD,moist);mix(T,LUSH,sm(.6,1,moist)*.7);mix(T,ALP,sm(9,0,S.temp)*.6);
 const f=Math.min(1.3,Math.max(.7,(out[0]+out[1]+out[2])/REFS));
 out[0]+=(T[0]*f-out[0])*k;out[1]+=(T[1]*f-out[1])*k;out[2]+=(T[2]*f-out[2])*k;
 return out;};})();
