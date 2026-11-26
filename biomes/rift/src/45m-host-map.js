// ================================================================= HOST — the map (the old ideal-type page's ground and fields)
// Split out of 45-host-stage.js (2026-10-27, the stations: PLAN-STATIONS.md) so a station supplies its own map: TERR, terrainH,
// slopeAt, lakeIn, streamD, southK, FIELD_RAW and MAP_ORIGIN (the LOD origins). stations/<name>/45m-host-map.js replaces this file.
// ---------------------------------------------------------------- the lake, the ridge, the streams
const TERR={R:3200};
// the ridge's crest line (z of the crest at x): the massif wanders a little
function zr(x){return -60+170*Math.sin(x*.00071+1.3)+55*Math.sin(x*.0021-.6);}
// the lake's north shore: z of the shore at x; bays and points from fbm
function shoreZ(x){return 1900+120*Math.sin(x*.0009)+60*Math.sin(x*.0027)+160*(fbm(x*.0019+3,5,53,2)-.5);}
// signed distance-ish to the shore in metres: negative inside the lake
function lakeIn(x,z){return shoreZ(x)-z;}
// two streams down the jungle to the lake (x of the stream at z), one dry wash on the savannah
function xsE(z){return 780+90*Math.sin(z*.0041)+40*Math.sin(z*.011+2);}
function xsW(z){return -1150+110*Math.sin(z*.0037+1)+40*Math.sin(z*.013);}
function xwN(z){return -300+140*Math.sin(z*.0029)+50*Math.sin(z*.009);}
function streamD(x,z){const d=z-zr(x);if(d<420)return 1e9;return Math.min(Math.abs(x-xsE(z)),Math.abs(x-xsW(z)));}
function washD(x,z){const d=z-zr(x);if(d>-700)return 1e9;return Math.abs(x-xwN(z));}
// the ridge: a crest 210..370 m, steep and BENCHED to the south (the cloud
// forest sits on the benches), a long gentle pediment to the north; narrow
// flat-topped mesas and saddles along the crest
function ridgeH(x,z){const d=z-zr(x);
 const crest=290+80*(fbm(x*.0008+2,1,61,2)-.5)*2;
 // the south face: a 300 m climb over 640 m of run, cut into a stair of three
 // treads (a sinusoid subtracted from the ramp; at amplitude 1/(2pi*3) the
 // treads come out level and the risers about twice the mean slope)
 let fS=smooth(700,60,d);fS=fS-.053*Math.sin(fS*TAU*3);
 const core=fS*smooth(-820,-180,d);
 // narrow mesas and saddles along the crest, and notches cut across it
 const mesa=smooth(.52,.57,fbm(x*.0024+5,z*.0024-3,62,2)),gap=smooth(.40,.34,fbm(x*.0028-1,z*.0028+4,63,2)),notch=smooth(.56,.61,fbm(x*.005+2,z*.005+7,67,2));
 const rough=(24*(fbm(x*.0025,z*.0025,64,3)-.5)+8*(fbm(x*.008,z*.008,65,2)-.5))*smooth(.05,.3,core);
 const pediment=26*fbm(x*.0015+9,z*.0015-2,66,2)*smooth(-1300,-750,d)*smooth(-250,-750,d);   // dissected hills at the north foot
 return crest*core+110*mesa*core*core-60*gap*core*core-50*notch*core*core+rough+pediment;}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 const lk=lakeIn(x,z),sd=streamD(x,z),wd=washD(x,z);
 const sw=fbm(x*.0008+3,z*.0008-1,17,3)-.5,ro=fbm(x*.0045-2,z*.0045+5,29,2)-.5;
 let h=2.2+sw*2.6+ro*1.0;                       // the valley floor: two metres above the plane, never under it
 h+=ridgeH(x,z);
 // the streams: a shallow channel; water only in the last reach before the lake
 const reach=smooth(520,140,lk);
 h=mix(h,mix(.55,-.9,reach)+ro*.3,smooth(26,8,sd));
 h=mix(h,h-1.2,smooth(30,10,wd));               // the dry wash: a shallow gravel bed
 const inL=smooth(25,-15,lk),bed=-.5-1.4*smooth(0,-260,lk)-7*smooth(-260,-900,lk)+1.5*(fbm(x*.0018+5,z*.0018+9,77,2)-.5)*smooth(-40,-200,lk);
 return mix(h,Math.min(bed,-.3),inL);}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// the climate fields the biome asks for
function southK(x,z){return smooth(-120,120,z-zr(x));}   // 1 on the lake side of the crest
function mistK(x,z){const up=clamp(ridgeH(x,z)/400,0,1);
 return clamp(smooth(-40,140,z-zr(x))*smooth(.06,.18,up)*smooth(.95,.76,up)*(.65+.45*fbm(x*.002,z*.002,88,2)),0,1);}
const FIELD_RAW={
 wet:(x,z)=>{const s=southK(x,z),m=mistK(x,z),up=clamp(ridgeH(x,z)/400,0,1),lk=lakeIn(x,z);
  let w=mix(.30,.90,s);w=mix(w,.88,m);
  w=mix(w,.22,smooth(.55,.75,up)*(1-m));                         // the peak is dry
  w=Math.max(w,.95*smooth(90,15,streamD(x,z)),.45*smooth(90,15,washD(x,z)),.80*smooth(140,10,lk));
  return clamp(w,0,1);},
 salt:(x,z)=>{const lk=lakeIn(x,z);return clamp(.9*smooth(90,4,lk)*smooth(-10,40,lk)+.35*smooth(220,80,lk),0,1);},
 upland:(x,z)=>clamp(ridgeH(x,z)/400,0,1),
 flow:(x,z)=>clamp(Math.max(smooth(130,25,streamD(x,z)),.6*smooth(110,25,washD(x,z))),0,1),
 mist:mistK};
// the LOD origins: a row along x=0 from the savannah over the ridge to the shore
const MAP_ORIGIN=[[0,-2900],[0,-2200],[0,-1500],[0,-800],[0,-200],[0,400],[0,1000],[0,1600],[0,2100]];
