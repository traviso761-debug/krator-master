// ================================================================= HOST — the Hall of Heroes and its stacks (kits/ancients targets/gatearc, read in place)
// The Kimrs' ancestral arcology at the Labyrinth's mouth, as the Kimr keep it (decay 1, the owner, 2026-11-11: a ruin, their necropolis), and its
// five carved stacks, bridged to it: the target's builders (buildGatearc, buildGatestacks) run once into a holder at the page's middle, as
// biomes/ancientsvalley runs the Ancients kit's engines (70-host-city.js, AVC.engines). The page hands the builders its ground and its water:
//   GATEARC.host     {y: the pond's level, pond: false (89w draws it on core/water), stacks: the stacks' plan (the bridges' portals), sheet: false}
//   GATESTACKS.host  {water: false (89w draws the fall and the pools on core/water), ground: the page's ground in the Hall's frame}
// The kit's own volumes (ANC_REG, in the Hall's frame) become the page's records; its core/tags records are the page's already (KTAGS.gatearc).
const GATE_LIFT=(function(){const q=new URLSearchParams(location.search);return q.has('lift')?+q.get('lift'):1.7;})();
const GATE=(function(){const t0=performance.now(),Q=new URLSearchParams(location.search),D=Q.has('decay')?+Q.get('decay'):1;
 const SPLAN=GATESTACKS.plan({hall:HALL,ground:(x,z)=>groundAt0(x,z)-LEVEL});
 GATEARC.host={y:LEVEL,pond:false,stacks:SPLAN,sheet:false};
 GATESTACKS.host={water:false,ground:(x,z)=>groundAt0(x,z)-LEVEL};
 KIT.order.forEach(n=>{KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;const holder=new THREE.Group(),r0=ANC_REG.length;holder.name='host:gatearc';
 try{buildGatearc(holder,0,0,D);}catch(e){reportErr('the Hall: '+e.stack);}
 try{buildGatestacks(holder,0,0,D);}catch(e){reportErr('the stacks: '+e.stack);}
 KOFF=[0,0,0];KXF=null;kbake(holder);KIT.order.forEach(n=>{KIT.items[n].length=0;});
 ANC_REG.splice(r0).forEach(v=>REGISTER({name:v.name,kind:'arcology',x:v.x||0,z:v.z||0,y:LEVEL+(v.y||0),r:v.r,h:v.h,tags:{kind:'arcology',site:'gatearc'}}));
 /* THE KIT'S PALETTE ON THIS PAGE (measured 2026-11-11 by readPixels on an 800x600 frame of the hero view): the kit's ruin palette (MAT.ac*R, the
    darkened instance colours) is toned for its sheet's bright lights (90-scene); under this page's sky (hemisphere .62, sun 2.25 from the colour
    script) the Hall's face averages 53,57,59 against the floor's 124,117,75, and reads as a black block at range. Every lit surface is lifted
    1.7x (2.2x gave 74,78,80 but blew the sunlit cells white; ?lift=1 for the kit's own); the voids, near-black on purpose, stay. The materials are cloned first: MAT.* is the kit's, shared.
    (The kit's materials are not at fault: an earlier "near-black" reading was a probe on a 1x1 drawing buffer, the pane hidden.) */
 {const fresh=new Map(),F=M=>{if(!M||!M.isMeshStandardMaterial||M.transparent)return M;if(fresh.has(M))return fresh.get(M);
   const N=M.clone();if(M.onBeforeCompile)N.onBeforeCompile=M.onBeforeCompile;N.name=M.name;
   /* the stacks' rock (vertex colours: KSTACKS' occlusion) is toned already and stays: lifted it reads chalk-white */
   if(!M.vertexColors&&N.color.getHSL({h:0,s:0,l:0}).l>.08)N.color.multiplyScalar(GATE_LIFT);fresh.set(M,N);return N;};
  holder.traverse(m=>{if(m.isMesh)m.material=Array.isArray(m.material)?m.material.map(F):F(m.material);});}
 let tris=0;holder.traverse(m=>{if(m.isMesh){m.userData.host=true;if(!m.userData.inspectLabel)m.userData.inspectLabel='The Hall of Heroes';
  if(m.geometry){const g=m.geometry,n=g.index?g.index.count/3:g.attributes.position.count/3;tris+=n*(m.isInstancedMesh?m.count:1);}}});
 scene.add(holder);
 return{holder,plan:SPLAN,decay:D,tris:Math.round(tris),ms:Math.round(performance.now()-t0)};})();
window._gate={decay:GATE.decay,tris:GATE.tris,ms:GATE.ms};
