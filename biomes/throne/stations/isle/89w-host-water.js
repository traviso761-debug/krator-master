// ================================================================= HOST - the Ring Sea, the fall and the streams on core/water (the geyser isle)
// 2026-10-26 (the water migration, the last stations; the frontier's 89w-host-sea.js is the template). Before: the sea was two grids of the
// page's own ShaderMaterial (SEA_MAT: a 320 x 320 grid over the map with a depth attribute and its own foam, and an 80 x 80 ring out to
// 13.5 km), the fall a curtain of its own streaked shader, the streams MeshLambert ribbons. Now:
//   THE SEA      one WATER.open at SEA, unbounded (out to the horizon), the shared wave field at full strength as before, with a SHORE
//                GRID over the isle and its shelf (8 m cells, flooded from the box's deep rim): the swell shoals toward the black
//                beaches and the cliffs, a breaker train runs in along the coast and calms at the waterline, the lagoon is the same
//                water, still in its shallows; the ground takes WATER.wetGround where the swash reaches. Outside the grid it is open sea.
//   THE FALL     the cliff stream over the edge: a WATER.fall from its lip (FALL, 84), thrown out fast enough that the arc clears the
//                face (the old curtain was pushed out row by row where the wall leans out; the speed here is the least that clears
//                every row of it), widening at its foot; no plunge disc (it falls into the sea; the spray is the page's steam, 85)
//   THE STREAMS  each gully's stream and the warm creek a WATER.flow per run of open water (the old ribbon's runs: not where it meets
//                the sea, not past the fall's lip, not in a dry gully's first 60 m), its line on the bed + .3 m every 10 m, its width
//                the old ribbon's (2 (.38 w + 1.2 sin), breathing along it)
// The sky in the water is core/atmos's skylight (a capture of this dome and the giant, given to the water only). waterH (47), the CPU
// twin the checks read, and terrainH are unchanged.
const SEA_ENV=new THREE.Scene(),SEA_HOLD={environment:null};
SEA_ENV.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);SEA_ENV.add(g);}
ATMOS.skylight({renderer,sky:SEA_ENV,scene:SEA_HOLD,ground:()=>new THREE.Color(0x2e4a46),key:()=>LIGHT_MODE});
_mark('sea0');
// the isle (the dome's r 1700 about (-120, -60)) and its shelf; the rim of the box lies 30-42 m deep, where the flood starts
const SEA_BOX=[-2400,-2400,2400,2400];
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,field:1,bed:terrainH,bedBox:SEA_BOX,shore:{cell:8,band:100,seeds:'edge'}});
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.05,envMapIntensity:.35,pick:true,
 shallow:new THREE.Color(0x4a9a8a).convertSRGBToLinear(),deep:new THREE.Color(0x1a4050).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';SEA_DRAW.mesh.userData.probeSkip=true;
WATER.wetGround(GROUND_MATS[0],{surface:SEA_WATER});
_mark('sea');
// ---- the fall
let FALL_DRAW=null;
if(FALL){const px=-FALL.dz,pz=FALL.dx,hw=FALL.w/2,G=9.8;let v=2.4;
 for(let r=1;r<=40;r++){const t=r/40,drop=FALL.drop*t*t,y=FALL.y-drop,s=Math.sqrt(2*drop/G);if(drop<1.5)continue;
  for(let d=0;d<60;d+=.5){if(terrainH0(FALL.x+FALL.dx*d,FALL.z+FALL.dz*d)<y-.2){v=Math.max(v,(d+.3)/s);break;}}}
 v=Math.min(v,12);
 const F=WATER.fall({name:FALL.name,lip:[[FALL.x-px*hw,FALL.z-pz*hw,FALL.y],[FALL.x+px*hw,FALL.z+pz*hw,FALL.y]],dir:[FALL.dx,FALL.dz],speed:v,drop:FALL.drop,spread:FALL.w*.25});
 FALL.speed=v;FALL_DRAW=WATER.drawFall(F,{plunge:false,rowStep:1.5,renderOrder:2,pick:true});FALL_DRAW.mesh.userData.inspectLabel=FALL.name;}
// ---- the streams
const STREAM_FLOWS=[];
GULLIES.forEach(G=>{const P=G.pts;let run=[],wid=[];
 const flush=()=>{if(run.length>=3)STREAM_FLOWS.push({G,F:WATER.flow({name:G.name,pts:run,width:wid,speed:G.warm?.6:1.2})});run=[];wid=[];};
 for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,n=Math.max(1,Math.round(L/10));
  for(let k=0;k<n;k++){const u=k/n,x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,y=terrainH0(x,z)+.3;
   if(y<=SEA+.15||(G.cliff&&FALL&&(x-FALL.x)*FALL.dx+(z-FALL.z)*FALL.dz>0)||(!G.warm&&Math.hypot(x-P[0][0],z-P[0][1])<60)){flush();continue;}
   run.push([x,z,y]);wid.push(2*(G.w*.38+1.2*Math.sin((i+u)*.7)));}}
 flush();});
const STREAM_DRAWS=STREAM_FLOWS.map(({G,F})=>{const d=WATER.drawFlow(F,{rapids:[.1,.3],shallow:new THREE.Color(G.warm?0x5a7a6a:0x4a6a62).convertSRGBToLinear(),deep:new THREE.Color(0x2a4a46).convertSRGBToLinear(),
  color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.4,step:10,across:2,margin:1,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=G.name;return d;});
_mark('streams');
