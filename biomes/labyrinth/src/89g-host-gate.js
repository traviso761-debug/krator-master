// ================================================================= HOST — the Hall of Heroes and its stacks (kits/ancients targets/gatearc, read in place)
// The Kimrs' ancestral arcology at the Labyrinth's mouth, as the Kimr keep it (decay 1, the owner, 2026-11-11: a ruin, their necropolis), and its
// five carved stacks, bridged to it: the target's builders (buildGatearc, buildGatestacks) run once into a holder at the page's middle, as
// biomes/ancientsvalley runs the Ancients kit's engines (70-host-city.js, AVC.engines). The page hands the builders its ground and its water:
//   GATEARC.host     {y: the pond's level, pond: false (89w draws it on core/water), stacks: the stacks' plan (the bridges' portals), sheet: false}
//   GATESTACKS.host  {water: false (89w draws the fall and the pools on core/water), ground: the page's ground in the Hall's frame}
// The kit's own volumes (ANC_REG, in the Hall's frame) become the page's records; its core/tags records are the page's already (KTAGS.gatearc).
const GATE_LIFT=(function(){const q=new URLSearchParams(location.search);return q.has('lift')?+q.get('lift'):2.2;})();
const GATE=(function(){const t0=performance.now(),Q=new URLSearchParams(location.search),D=Q.has('decay')?+Q.get('decay'):1;
 const SPLAN=GATESTACKS.plan({hall:HALL,ground:(x,z)=>groundAt0(x,z)-LEVEL});
 GATEARC.host={y:LEVEL,pond:false,stacks:SPLAN,sheet:false};
 GATESTACKS.host={water:false,ground:(x,z)=>groundAt0(x,z)-LEVEL};
 KIT.order.forEach(n=>{KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;const holder=new THREE.Group(),r0=ANC_REG.length;holder.name='host:gatearc';
 try{buildGatearc(holder,0,0,D);}catch(e){reportErr('the Hall: '+e.stack);}
 try{buildGatestacks(holder,0,0,D);}catch(e){reportErr('the stacks: '+e.stack);}
 KOFF=[0,0,0];KXF=null;kbake(holder);KIT.order.forEach(n=>{KIT.items[n].length=0;});
 ANC_REG.splice(r0).forEach(v=>REGISTER({name:v.name,kind:'arcology',x:v.x||0,z:v.z||0,y:LEVEL+(v.y||0),r:v.r,h:v.h,tags:{kind:'arcology',site:'gatearc'}}));
 /* THE KIT'S MATERIALS ON THIS PAGE (2026-11-11, measured in the browser pane): the Ancients kit's Standard materials (map + its packed roughness
    canvas, TEX.concreteRM) draw near-black here, while the same map on a fresh MeshStandardMaterial draws as on the kit's sheet; the cause is not
    found (KNOWN_ISSUES.md). Each is re-made once, fresh, with its colour, map, emissive and side and a scalar roughness (the RM canvas's green is
    225/255: .88), the clones shared by every mesh that shared the original */
 {const fresh=new Map(),F=M=>{if(!M||!M.isMeshStandardMaterial||M.transparent)return M;if(fresh.has(M))return fresh.get(M);
   const N=new THREE.MeshStandardMaterial({color:M.color.clone(),map:M.map||null,emissive:M.emissive.clone(),emissiveMap:M.emissiveMap||null,emissiveIntensity:M.emissiveIntensity,
    side:M.side,vertexColors:M.vertexColors,roughness:M.roughnessMap?.88:M.roughness,metalness:M.metalness,normalMap:M.normalMap||null});N.name=M.name;
   /* the kit's ruin palette is toned for its sheet's bright lights (90-scene); under this page's sky (hemisphere .6, the sun's colour script) its
      concrete reads near-black, so every lit surface is lifted 2.2x (the voids, near-black on purpose, stay) */
   if(N.color.getHSL({h:0,s:0,l:0}).l>.08)N.color.multiplyScalar(GATE_LIFT);fresh.set(M,N);return N;};
  holder.traverse(m=>{if(m.isMesh)m.material=Array.isArray(m.material)?m.material.map(F):F(m.material);});}
 let tris=0;holder.traverse(m=>{if(m.isMesh){m.userData.host=true;if(!m.userData.inspectLabel)m.userData.inspectLabel='The Hall of Heroes';
  if(m.geometry){const g=m.geometry,n=g.index?g.index.count/3:g.attributes.position.count/3;tris+=n*(m.isInstancedMesh?m.count:1);}}});
 scene.add(holder);
 return{holder,plan:SPLAN,decay:D,tris:Math.round(tris),ms:Math.round(performance.now()-t0)};})();
window._gate={decay:GATE.decay,tris:GATE.tris,ms:GATE.ms};
