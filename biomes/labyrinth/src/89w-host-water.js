// ================================================================= HOST - the water on core/water (every station; copperglacier's, its bodies replaced)
//   THE POND   the Hall of Heroes' reflecting pond: a WATER.open at its level over every ground under it inside the ellipse (45), a shore grid (4 m)
//              flooded from a seed between the causeways. Still water: no surf, no breakers (the owner's rule). The Hall's columns stand in it.
//   THE RIVER  the Gowd Warra in two WATER.flow lines (45: graded), into the pond's west inlet and out below the weir
//   THE FALL   the Garden Stack's cistern overflow (GATESTACKS' falls: 300 m), a WATER.fall into its plunge pool (WATER.still), and the Quarry's lake
// The reflections switch (99) serves the pond; off at page load.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8e82)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const STILLS=[];
// ---- the lakes: the Hall's pond (station 1) or the station's own (SITE.lakes); each a WATER.open over the ground under its level inside its
// ellipse, a shore grid flooded from a seed inside it. The largest is the reflections switch's
const LAKE_DRAWS=LAKES.map(L=>{const R=TERR.R*1.1,c=Math.cos(L.ry||0),sn=Math.sin(L.ry||0),ex=Math.hypot(L.a*c,L.b*sn)+40,ez=Math.hypot(L.a*sn,L.b*c)+40;
 const box=[Math.max(-R,L.cx-ex),Math.max(-R,L.cz-ez),Math.min(R,L.cx+ex),Math.min(R,L.cz+ez)];if(box[2]<=box[0]||box[3]<=box[1])return null;
 const sx=clamp(L.pond?0:L.cx,box[0]+20,box[2]-20),sz=clamp(L.pond?L.b*.75:L.cz,box[1]+20,box[3]-20),seed=[sx,sz];
 const W=WATER.open({name:L.name,level:L.level,field:.06,bounds:box,bed:terrainH,bedBox:box,shore:{cell:4,band:30,seeds:[seed],land:(x,z)=>lakeE(L,x,z)>1.04}});
 const D=WATER.draw(W,{renderOrder:1,roughness:.06,metalness:.05,envMapIntensity:.55,surf:false,breakers:false,pick:true,shallow:lin(L.shallow==null?0x5a7a6a:L.shallow),deep:lin(L.deep==null?0x2a4a46:L.deep)});
 D.mesh.userData.inspectLabel=L.name;D.mesh.userData.probeSkip=true;STILLS.push({mat:D.mesh.material,level:L.level,center:seed,radius:Math.max(L.a,L.b),far:2000});return D;}).filter(Boolean);
const POND_DRAW=HALL?LAKE_DRAWS[0]:null;
// ---- the river
const RIVER_DRAWS=RIVER.lines.filter(P=>P.length>=3).map((P,i)=>{const F=WATER.flow({name:RIVER.names[i]||RIVER.name,pts:P,width:P.map(()=>2*RIVER.hw),speed:1.1});
 const d=WATER.drawFlow(F,{rapids:[.12,.3],shallow:lin(0x6a8a7a),deep:lin(0x3a5a54),color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.35,step:8,across:3,margin:2.4,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=RIVER.names[i]||RIVER.name;return d;});
// ---- the Garden Stack's fall and the pools (GATESTACKS' records, in the Hall's frame: y over LEVEL)
const FALL_DRAWS=(function(){const out=[];if(!GATE)return out;const P=GATE.plan;
 for(const p of P.pools){const poly=[];for(let k=0;k<20;k++){const a=k/20*TAU;poly.push([p.x+Math.cos(a)*p.r,p.z+Math.sin(a)*p.r]);}
  try{const S=WATER.still({name:p.quarry?'The quarry lake':'The fall\'s plunge pool',level:LEVEL+p.level,poly});out.push(WATER.drawStill?WATER.drawStill(S,{shallow:lin(0x6a8a7a),deep:lin(0x2e4c48)}):S);}catch(e){reportErr('pool: '+e.stack);}}
 for(const f of P.falls){const px=-f.nz,pz=f.nx,ly=LEVEL+f.y0,pool=P.pools.find(q=>!q.quarry);
  try{const F=WATER.fall({name:'The fall of the Garden Stack (its cistern\'s overflow)',lip:[[f.x-px*f.w/2,f.z-pz*f.w/2,ly],[f.x+px*f.w/2,f.z+pz*f.w/2,ly]],
    dir:[f.nx,f.nz],speed:1.2,drop:ly-(LEVEL+(pool?pool.level:f.y1)),foot:pool?[pool.x,pool.z,LEVEL+pool.level]:[f.x+f.nx*20,f.z+f.nz*20,LEVEL+f.y1],fit:true,
    face:(x,z)=>{const t=KSTACKS.topAt(STACKS,x,z);return t>-1e8?LEVEL+t:terrainH(x,z);}});
   out.push(WATER.drawFall(F,{color:lin(0xd8e2de),opacity:.85,rows:64,cols:4,margin:1,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3,plungeR:pool?pool.r*.7:12,footK:.8}));}catch(e){reportErr('fall: '+e.stack);}}
 return out;})();
window._water={lakes:LAKE_DRAWS.length,pond:!!POND_DRAW,river:RIVER_DRAWS.length,falls:FALL_DRAWS.length};
