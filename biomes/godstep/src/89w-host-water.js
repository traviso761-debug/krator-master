// ================================================================= HOST — the water on core/water
// Station 1 is a cold steppe in late winter (94-157 mm): no stream runs. The one water is the playa's: the meltwater pond in the pan's
// lowest part behind its lobe (PLAN.md section 4, "small kit-scale ponds behind lobes on steps 1-2"), a WATER.still at its level over
// its outline, skinned with winter ice (a pale, rough surface: the night lows are -11 to -15 C). BIO.waterH stays the stage's
// (nothing grows there: the pan is bare silt).
const POND=(function(){if(typeof PLAYA==='undefined'||PLAYA.floor==null)return null;const L=PLAYA.floor+.55,n=40,poly=[];
 for(let k=0;k<n;k++){const a=k/n*TAU;let r=PLAYA.r*.75;for(let t=PLAYA.r*.05;t<PLAYA.r*.95;t+=4){if(terrainH(PLAYA.x+Math.cos(a)*t,PLAYA.z+Math.sin(a)*t)>L-.05){r=t;break;}}
  poly.push([PLAYA.x+Math.cos(a)*r,PLAYA.z+Math.sin(a)*r]);}
 const S=WATER.still({name:'The playa\'s meltwater pond (iced over)',level:L,poly});
 const D=WATER.drawStill(S,{color:new THREE.Color(0x9fb4c0).convertSRGBToLinear(),roughness:.32,metalness:0,envMapIntensity:.2,surf:false,breakers:false,renderOrder:1});
 D.mesh.userData.inspectLabel=S.name;   /* the probe samples it: its record holds the pond */
 return{S,D,level:L,poly};})();   /* its record is the playa's (98: the pan and its pond, one volume) */
window._water={pond:POND?{level:+POND.level.toFixed(2),pts:POND.poly.length}:null};
