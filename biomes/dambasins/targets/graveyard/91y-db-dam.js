// TARGET: graveyard - the west dam's broken ends (79-db-site.js: the ridge, the gap). The dam stood across the valley at
// z -60..300, a concrete gravity wall 250 m high (dams.json: crest 950, foot 700) on its ridge. The breach tore out its middle
// down to the cut; what is left are its two ends on the abutments, their broken faces stepped where the blocks came away,
// and the blocks themselves tumbled down the channel's floor and through the gap. Drawn as one merged mesh of boxes in the
// kit's board-formed concrete (MAT.concrete), weathered (MAT.concreteR) where the lake stood on it; each end and each block a
// probe volume and a core/tags record. Placement draws KRAND hashes (no stream).
const GY_DAM=(()=>{const u=KRAND.unit,H=KRAND.hash,G=new THREE.Group();G.name='the broken dam';
 const box=(x,y,z,w,h,d,ry,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry||0;m.castShadow=m.receiveShadow=true;G.add(m);return m;};
 const recs=[];
 // the two ends: the upstream face (z GY.damZ0, the old crest at GY.crest) in blocks 18 m wide, stepping down toward the gap
 for(const s of [-1,1]){const ax=gyAxis(0),e0=ax+s*GY.gap*1.15;let n=0;
  for(let k=0;k<16;k++){const x=e0+s*(k*18+9),gy=DB_NAT(x,GY.damZ0+20),top=GY.crest-(k<4?(4-k)*22*(.6+.5*u(H(4411,s+2,k))):0);
   /* a gravity dam's section, stepped: the upstream face near vertical at the ridge's foot, the crest 12 m thick, the
      downstream face falling to its toe on the ridge's far side (five slices, each lower), every slice down into the ground */
   const zf=GY.damZ0-115,SL=[[0,14,1],[14,40,.86],[40,80,.66],[80,130,.42],[130,190,.2]];
   for(const [a,b,f] of SL){const za=zf+a,zb=zf+b,gl=Math.min(DB_NAT(x,za),DB_NAT(x,zb),gy)-5,t=gl+(top-gl)*f;if(t-gl<3)continue;
    box(x,(t+gl)/2,(za+zb)/2,17.6,t-gl,zb-za,0,f>.9&&top>-30?MAT.concrete:MAT.concreteR);}
   n++;}
  const xm=e0+s*140;recs.push({name:'The west dam: its '+(s<0?'west':'east')+' end',x:xm,z:GY.damZ0-70,y:-210,r:150,h:270});}
 // the blocks: torn from the breach's sides, rolled down through the gap and up the channel's floor a little way (the flood
 // carried the small ones furthest), half sunk in the scoured gravel
 for(let i=0;i<46;i++){const s=H(4412,i),t=Math.pow(u(H(s,1)),1.6),z=GY.damZ0+200-t*900,ax=gyAxis(z),C=gyChan(Math.min(z,0)),w=z>0?GY.gap:C.w;
  const x=ax+(u(H(s,2))*2-1)*w*.8,sz=4+14*(1-t)*u(H(s,3)),g=DB_NAT(x,z);if(GY_PILE.hulls.some(P=>Math.hypot(x-P.x,z-P.z)<P.L*.55))continue;
  const m=box(x,g+sz*.25,z,sz*(.8+.5*u(H(s,4))),sz*(.5+.4*u(H(s,5))),sz*(.7+.5*u(H(s,6))),u(H(s,7))*TAU,MAT.concreteR);
  m.rotation.x=(u(H(s,8))-.5)*.5;m.rotation.z=(u(H(s,9))-.5)*.5;}
 G.updateMatrixWorld(true);
 // one mesh a material (the kit's lineage: few draw calls), the boxes baked into world space
 const byMat=new Map();G.children.forEach(m=>{const g=m.geometry.clone().applyMatrix4(m.matrixWorld);if(!byMat.has(m.material))byMat.set(m.material,[]);byMat.get(m.material).push(g.toNonIndexed());});
 const out=new THREE.Group();out.name='the broken dam';
 for(const [mat,gs] of byMat){let n=0;gs.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
  for(const g of gs){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.setAttribute('uv',new THREE.BufferAttribute(U,2));
  const m=new THREE.Mesh(bg,mat);m.castShadow=m.receiveShadow=true;m.userData.inspectLabel='The west dam (broken)';m.userData.own='dam';out.add(m);}
 scene.add(out);
 for(const r of recs){REGISTER(r);DB_TAGS.add({'class':'infrastructure',kind:'ruin',key:'dam',name:r.name,at:[r.x,r.y,r.z],r:r.r,h:r.h,tags:{culture:'ancient',state:'ruined'},frag:'91y-db-dam.js'});}
 return {group:out,ends:recs};})();
