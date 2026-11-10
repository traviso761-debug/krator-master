// ================================================================= HOST — the water on core/water (station 3)
// THE SPRING'S STREAM (WATER.flow along STREAM, 45b: the bed never climbs): from the warm spring across the pit's floor, ENE, into tube_god_07's
// mouth, where it goes down the tube; never frozen (the spring is warm). THE SPRING'S EYE: a small still pool, iron-red. THE OLDER CRATER'S LAKE:
// a WATER.still at its level over its outline (rays from the crater's centre to the shore), its margins iced on a winter night (a pale, rougher
// rim by gradient). BIO.waterH stays the stage's: nothing is planted in the water (the hearth field's mask keeps off the stream).
const linC=c=>new THREE.Color(c).convertSRGBToLinear();
const STREAM_FLOW=WATER.flow({name:STREAM.name,pts:STREAM.pts.map(p=>[p[0],p[1],p[2]]),width:STREAM.pts.map((p,i)=>2.2+1.6*smooth(0,STREAM.pts.length,i)),speed:.7,rapids:[.04,.16]});
const STREAM_DRAW=WATER.drawFlow(STREAM_FLOW,{shallow:linC(0x6a5a40),deep:linC(0x3a3428),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.4,step:6,across:4,margin:.8,renderOrder:2});
STREAM_DRAW.mesh.userData.inspectLabel=STREAM.name;
const ring=(x,z,r,n)=>{const o=[];for(let k=0;k<n;k++){const a=k/n*TAU;o.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return o;};
const SPRING_S=WATER.still({name:SPRING.name,level:terrainH(SPRING.x,SPRING.z)+.15,poly:ring(SPRING.x,SPRING.z,SPRING.r*.8,14),gradient:{centre:0x5a2a1c,rim:0x8a5a3a,power:1.3}});
{const D=WATER.drawStill(SPRING_S,{roughness:.12,metalness:.05,envMapIntensity:.4,renderOrder:1});D.mesh.userData.inspectLabel=SPRING.name;}
const LAKE=(function(){const L=OLD.level,n=48,poly=[];
 for(let k=0;k<n;k++){const a=k/n*TAU;let r=OLD.r*.9;for(let t=10;t<OLD.r*1.2;t+=3){if(terrainH(OLD.x+Math.cos(a)*t,OLD.z+Math.sin(a)*t)>L-.05){r=t;break;}}poly.push([OLD.x+Math.cos(a)*r,OLD.z+Math.sin(a)*r]);}
 const S=WATER.still({name:'The older crater\'s lake (its margins iced)',level:L,poly,gradient:{centre:0x2e3a40,rim:0xa8b8c0,power:2.2}});
 const D=WATER.drawStill(S,{roughness:.2,metalness:.04,envMapIntensity:.35,renderOrder:1});D.mesh.userData.inspectLabel=S.name;return{S,D,level:L,poly};})();
window._water={stream:STREAM.pts.length,lake:{level:+LAKE.level.toFixed(2),pts:LAKE.poly.length},spring:+SPRING_S.level.toFixed(2)};
