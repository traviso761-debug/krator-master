// ================================================================= HOST — the helpers every station's views use (96-host-views.js), after the build
// the presets are FOUND on the map rather than typed: a plant preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EHIGH.SPECIES.indexOf(EHIGH.byKey[k]);
function nearTree(key,x,z,minH,o){return EHIGH.nearestTree(SPI(key),x,z,minH,o)||EHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:3,crownR:2};}
// a camera d metres from a plant on bearing az (radians, x east z south), looking at it
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.6),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const GAZ=Math.atan2(GZ,GX),SAZ=Math.atan2(SUNP[2],SUNP[0]);   // the bearings (x east z south) of the giant and the sun
