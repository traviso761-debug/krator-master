// ================================================================= HOST — the wreck: the heaps, the prow's shards, the viaduct's stumps; every ruin watched
// [draw] The debris of what fell is core/terrain's KRUBBLE heaps (the layout's heap records: the prow on the apron and in the
// shallows, the sheared decks on the apron's west), each seated on the ground under it (a heap in the sloping shallows on the lowest
// of its bed, its upper side buried); the prow's biggest pieces lie on its heap as shards, seated on their lowest points (core/ruins'
// rule: the centre's height is the surface plus |R10| sx/2 + |R11| sy/2 + |R12| sz/2, less the sink). The viaduct's piers stand in the
// lake to their stumps. Then every ruined structure is watched (KRUINS.watch): the shell, the wreck, the stumps.
const LRUIN=(function(){const L=LEDGE_LAYOUT,G=L.ground,W=L.world,dr=(id,i,salt)=>LEDGE.draw(W,id,i,salt),box=LB.box;
 const WG=new THREE.Group();WG.name='the wreck';scene.add(WG);
 const heaps=L.heaps.map(h=>{let y0=h.y0;
  if(y0==null){y0=Infinity;for(let a=0;a<24;a++){const t=a/24*Math.PI*2;y0=Math.min(y0,LEDGE_H(h.x+Math.cos(t)*h.rx,h.z+Math.sin(t)*h.rz));}y0=Math.min(y0,LEDGE_H(h.x,h.z));}
  return KRUBBLE.heap({id:h.id,x:h.x,z:h.z,y0,rx:h.rx,rz:h.rz,ry:h.ry,h:h.h,lumps:h.lumps,blocks:h.blocks,cover:h.cover,seed:LEDGE.seed(W,h.id)});});
 heaps.forEach(H=>{const M=KRUBBLE.mesh(H),n=M.pos.length/3,col=new Float32Array(n*3);
  for(let k=0;k<n;k++){const part=M.part?M.part[k]:0,o=M.occ?M.occ[k]:0,base=part===1?[.84,.81,.76]:part===2?[.74,.71,.66]:[.55,.52,.48],s=.55+.45*(1-o);
   col[k*3]=Math.pow(base[0]*s,2.2);col[k*3+1]=Math.pow(base[1]*s,2.2);col[k*3+2]=Math.pow(base[2]*s,2.2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(M.pos,3));if(M.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(M.uv,2));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(Uint32Array.from(M.idx),1));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true}));m.name='rubble: '+H.id;m.userData.inspectLabel='the wreck ('+H.id+')';WG.add(m);});
 // the prow's shards: big slab pieces on its heap, seated on their lowest points on the drawn heap (KRUBBLE.at) or the ground
 const prow=heaps.find(H=>H.id==='heap.prow'),surf=(x,z)=>Math.max(LEDGE_H(x,z),KRUBBLE.at(heaps,x,z));
 for(let i=0;i<5;i++){const a=dr('heap.prow',i,1)*Math.PI*2,q0=.35*Math.sqrt(dr('heap.prow',i,2)),x=prow.x+Math.cos(a)*prow.rx*q0,z=prow.z+Math.sin(a)*prow.rz*q0;
  const sx=18+16*dr('heap.prow',i,3),sy=5,sz=10+12*dr('heap.prow',i,4);
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler((dr('heap.prow',i,5)-.5)*.9,dr('heap.prow',i,6)*Math.PI,(dr('heap.prow',i,7)-.5)*.9));
  const M4=new THREE.Matrix4().makeRotationFromQuaternion(q).elements,lift=Math.abs(M4[1])*sx/2+Math.abs(M4[5])*sy/2+Math.abs(M4[9])*sz/2;
  box('panel',x,surf(x,z)+lift-.6,z,sx,sy,sz,{q,fm:{ny:'soffit'}});}
 // the viaduct's stumps: each pier from its bed to its broken top over the water
 const PG=new THREE.Group();PG.name='the viaduct\'s stumps';scene.add(PG);
 const shardMeshes=LB.flush(WG,LMAT,'the prow\'s shards');
 L.piers.forEach((p,i)=>{let bed=Infinity;[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].forEach(c=>{bed=Math.min(bed,LEDGE_H(p.x+c[0]*p.w/2,p.z+c[1]*p.d/2));});
  const top=G.lake+2+14*dr(p.id,0,1)*(i<6?1:.5);box('panel',p.x,(bed-.4+top)/2,p.z,p.w,top-bed+.4,p.d);});
 const pierMeshes=LB.flush(PG,LMAT,'the viaduct\'s stumps');
 if(typeof KRUINS!=='undefined'){
  KRUINS.watch(LSHELL.root,{name:'the shell (Ledge\'s decks)',ground:LEDGE_H});
  KRUINS.watch(WG,{name:'the prow\'s and the shear\'s wreck',ground:LEDGE_H});
  KRUINS.watch(PG,{name:'the viaduct\'s stumps',ground:LEDGE_H});}
 return {heaps,wreck:WG,piers:PG,shards:shardMeshes,pierMeshes};})();
