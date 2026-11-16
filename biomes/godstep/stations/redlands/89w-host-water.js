// ================================================================= HOST — the water on core/water: THE STORM'S SHEET ON THE PAN (station 4)
// PLAN.md sections 1 ("Water": the closed lower valley ends in a dry terminal salt playa that holds sheet water for days after a storm) and
// 4: a WATER.still in the pan's lowest part (its south-east: the hollow 45b leaves there, ~0.45 m deep), its outline where the ground stands
// over its level, a milky brine over the salt. The rest of the pan is dry crust. Its reflections of the land are the mirror switch's
// (core/water/ext/58, 98-host-redlands.js): OFF at page load. BIO.waterH stays the stage's (nothing grows on the pan).
const SHEET_W=(function(){const L=SHEET.level,n=48,poly=[];
 for(let k=0;k<n;k++){const a=k/n*TAU;let r=SHEET.r*.98;for(let t=8;t<SHEET.r;t+=3){if(terrainH(SHEET.x+Math.cos(a)*t,SHEET.z+Math.sin(a)*t)>L-.01){r=t;break;}}
  poly.push([SHEET.x+Math.cos(a)*r,SHEET.z+Math.sin(a)*r]);}
 const S=WATER.still({name:'Sheet water on the pan (a storm\'s, a few days a year)',level:L,poly});
 const D=WATER.drawStill(S,{color:new THREE.Color(0xc4d0cc).convertSRGBToLinear(),roughness:.07,metalness:.04,envMapIntensity:.55,opacity:.8,surf:false,breakers:false,renderOrder:1});
 D.mesh.userData.inspectLabel=S.name;
 return{S,D,level:L,poly,area:poly.reduce((s,p,i)=>{const q=poly[(i+1)%n];return s+(p[0]*q[1]-q[0]*p[1])/2;},0)};})();
window._water={sheet:{level:+SHEET_W.level.toFixed(2),pts:SHEET_W.poly.length,area:Math.round(SHEET_W.area)}};
