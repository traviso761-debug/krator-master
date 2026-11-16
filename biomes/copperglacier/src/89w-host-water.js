// ================================================================= HOST - the water on core/water (every station)
//   THE TARN   (station 1) a WATER.open at the tarn's level over every ground under it west of the snout, with a shore grid (4 m) flooded from the
//              middle; the ice is land (the cliff stands in it). Still water: no surf, no breakers (the owner's rule). Turquoise with glacial flour:
//              the draw's shallows and deep. The meltwater stream's silt enters as a moving plume (core/water ext/61: a tint field on a current out from
//              its mouth; ?plume=0 without it)
//   THE POND   (station 2) KGROUND's basin behind the terminal moraine, the same way, its shore stopping at the moraine (lakeAt < .12 is land)
//   THE STREAMS  each a WATER.flow along its graded line (45: it never climbs), grey-green meltwater, white where the bed steepens
// The reflections switch (99) serves the largest still; off at page load.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8e92)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const boxOf=(u0,u1,p0,p1)=>{const c=[upAt(u0,p0),upAt(u1,p0),upAt(u0,p1),upAt(u1,p1)],R=TERR.R*1.1;
 return[Math.max(-R,Math.min(...c.map(p=>p[0]))),Math.max(-R,Math.min(...c.map(p=>p[1]))),Math.min(R,Math.max(...c.map(p=>p[0]))),Math.min(R,Math.max(...c.map(p=>p[1])))];};
const STILLS=[];
// ---- the tarn
const TARN_DRAW=TARN?(function(){const box=boxOf(-TERR.R*1.6,GS.snout+400,-TERR.R*1.6,TERR.R*1.6),seed=upAt(GS.snout-700,GS.centre(GS.snout-700));
 const S0=STREAMS.find(S=>S.plume&&S.pts.length>2),mouth=S0?S0.pts[S0.pts.length-1]:null,q=new URLSearchParams(location.search);
 const plume=mouth&&q.get('plume')!=='0'?{tint:{box,cell:8,at:(x,z)=>{const d=Math.hypot(x-mouth[0],z-mouth[1]);return d>420?null:{c:lin(0xb8c8c0),a:.55*smooth(420,20,d)};}},
  tintFlow:{v:(x,z)=>{const dx=x-mouth[0],dz=z-mouth[1],d=Math.hypot(dx,dz)||1;return[dx/d*.07*smooth(500,0,d),dz/d*.07*smooth(500,0,d)];},cell:8,period:60,swirl:.06,scale:90}}:{};
 const W=WATER.open(Object.assign({name:TARN.name,level:TARN.level,field:.12,bounds:box,bed:terrainH,bedBox:box,shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>iceAt(x,z)>.3||uOf(x,z)>GS.snout+400}},plume));
 const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,   /* still water (HANDOFF-REBUILD.md, 'Still water takes no breakers') */
  shallow:lin(0x4aa8a6),deep:lin(0x1a6a78)});
 D.mesh.userData.inspectLabel=TARN.name;D.mesh.userData.probeSkip=true;STILLS.push({mat:D.mesh.material,level:TARN.level,center:seed,radius:1600,far:3500});return D;})():null;
// ---- the pond
const POND_DRAW=POND?(function(){const box=boxOf(TERM.u0-60,GS.snout+300,TERM.p0-TERM.W0*1.4,TERM.p0+TERM.W0*1.4),seed=upAt((G.termU(TERM.p0)+GS.snout)/2,TERM.p0);
 const W=WATER.open({name:POND.name,level:POND.level,field:.08,bounds:box,bed:terrainH,bedBox:box,shore:{cell:4,band:30,seeds:[seed],land:(x,z)=>G.lakeAt(x,z)<.12||iceAt(x,z)>.3}});
 const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:lin(0x6ab8b4),deep:lin(0x2a7a80)});
 D.mesh.userData.inspectLabel=POND.name;D.mesh.userData.probeSkip=true;STILLS.push({mat:D.mesh.material,level:POND.level,center:seed,radius:TERM.W0,far:1500});return D;})():null;
// ---- the streams
const STREAM_DRAWS=STREAMS.filter(S=>S.pts.length>=3).map(S=>{const F=WATER.flow({name:S.name,pts:S.pts,width:S.pts.map(()=>2*S.hw),speed:1.4});
 const d=WATER.drawFlow(F,{rapids:[.12,.3],shallow:lin(0x8aa8a4),deep:lin(0x5a7c7c),color:0xffffff,roughness:.3,metalness:.05,envMapIntensity:.35,step:8,across:2,margin:2.4,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=S.name;return d;});
window._water={tarn:!!TARN_DRAW,pond:!!POND_DRAW,streams:STREAM_DRAWS.length};
