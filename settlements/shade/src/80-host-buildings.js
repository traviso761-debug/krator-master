// ================================================================= HOST — the buildings
// Builds every plan in SHADE_PLAN (44) with the kit's builders (77), sets each on
// the ground (the lowest corner of its footprint, plus its lift), and then:
//   REGISTERs it (the inspector names it, class 'building', with its tags);
//   pushes an OBSTACLE (runs before the biome in 88, so nothing grows in it);
//   records its world footprint, the cells the walkable grid must block and the
//   door it is entered by (84 builds the grid from these: NAV_BLOCK);
//   merges its meshes into one mesh per material for the whole settlement
//   (one draw call per material, not per building).
// It runs before 84, so the grid blocks what the builders actually built.
const BUILDINGS=(function(){
 const BUILD={treasury:buildTreasury,tomb:buildCrowTomb,stair:buildRockStair,ledge:buildLedge,pueblo:buildPuebloCompound,
  khan:buildCaravanserai,tent:buildBlackTent,stall:buildMarketStall,fairy:buildFairyChimney};
 const records=[],byFamily={},merged=new Map(),t0=performance.now();
 const W=(g,p)=>{const v=new THREE.Vector3(p[0],0,p[1]).applyMatrix4(g.matrixWorld);return[+v.x.toFixed(3),+v.z.toFixed(3)];};
 const rectL=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 const circL=(x,z,r)=>{const p=[];for(let k=0;k<12;k++){const a=k/12*Math.PI*2;p.push([x+Math.sin(a)*r,z+Math.cos(a)*r]);}return p;};
 for(const P of SHADE_PLAN.plans){
  const place=PLACES.find(p=>p.id===P.placeId),make=BUILD[P.family];
  if(!place||!make){reportErr('building plan '+P.id+': no '+(place?'builder '+P.family:'place '+P.placeId));continue;}
  let g;try{g=make(P.params);}catch(e){reportErr('building '+P.id+': '+e.stack);continue;}
  g.position.set(P.x,0,P.z);g.rotation.y=P.yaw;g.updateMatrixWorld(true);
  const U=g.userData,foot=U.footprint.map(p=>W(g,p));
  const base=Math.min(...foot.map(p=>terrainH(p[0],p[1]))),y0=base+P.lift;g.position.y=y0;g.updateMatrixWorld(true);
  // what the walkable grid blocks (in the builder's frame), and where the building is entered
  let nav=[U.footprint],door=null;const q=P.params;
  if(P.lift>0){nav=[];}
  else if(P.family==='treasury'||P.family==='tomb'){door=[0,U.footprint[2][1]+.9];}
  else if(P.family==='stair'){const s=q.dir<0?-1:1;door=[-s*(q.run/2-.6),q.width+.9];}
  else if(P.family==='pueblo'){nav=U.cells.map(c=>rectL(c[0],c[1],c[2],c[3]));door=U.plaza;}
  else if(P.family==='khan'){const hx=q.w/2,hz=q.d/2,R=U.ring,G=U.gate/2;
   nav=[rectL(-hx,-hz,hx,-hz+R),rectL(-hx,-hz+R,-hx+R,hz-R),rectL(hx-R,-hz+R,hx,hz-R),rectL(-hx,hz-R,-G,hz),rectL(G,hz-R,hx,hz),rectL(-G-2.5,hz,-G,hz+U.portalDepth-.6),rectL(G,hz,G+2.5,hz+U.portalDepth-.6)];
   door=[0,hz+U.portalDepth+1.2];}
  else if(P.family==='tent'){nav=[rectL(-q.w/2,-q.d/2,q.w/2,q.d/2)];door=[-q.w*.28,q.d/2+1.1];}
  else if(P.family==='stall'){nav=[rectL(-q.w/2,-q.d/2,q.w/2,q.d/2)];door=[0,q.d/2+1];}
  else if(P.family==='fairy'){const R=q.radius;nav=[circL(0,0,R*1.32)];if(q.twin)nav.push(circL(R*1.25,-R*.55,R*.82));door=[0,R*1.32+.8];}
  const cx=foot.reduce((a,p)=>a+p[0],0)/foot.length,cz=foot.reduce((a,p)=>a+p[1],0)/foot.length,r=Math.max(...foot.map(p=>Math.hypot(p[0]-cx,p[1]-cz)));
  const types=(place.tags&&place.tags.types&&!/stair|ledge/.test(P.family)?place.tags.types:U.types).slice();
  const yTop=y0+(P.family==='ledge'?0:U.height),yBot=y0+(P.family==='ledge'?-.6:0);
  const back=place.kind==='wall'&&P.lift>=0&&/treasury|tomb/.test(P.family)?[W(g,U.footprint[0]),W(g,U.footprint[1])]:null;
  const R={id:P.id,name:U.name+(P.family==='stair'||P.family==='ledge'?' ('+place.name+')':' — '+place.name),family:P.family,placeId:place.id,placePoly:place.poly,placeKind:place.kind,
   types,footprint:foot,poly:foot,navPolys:nav.map(p=>p.map(v=>W(g,v))),door:door?W(g,door):null,access:P.access||null,group:P.group||null,
   backLine:back,face:place.facade?place.facade.face.slice():null,baseY:base,lift:P.lift,y0:yBot,y1:yTop,height:U.height,center:[cx,cz],radius:r};
  records.push(R);byFamily[P.family]=(byFamily[P.family]||0)+1;
  OBSTACLES.push({x:cx,z:cz,r:r+.8,y0:yBot,y1:yTop});
  REGISTER({id:P.id,name:R.name,cls:'building',x:cx,z:cz,y:yBot,r:Math.max(1.5,r*.92),h:yTop-yBot+.5,tags:{culture:U.culture,types:types.join(', '),family:P.family,place:place.id}});
  // merge: this building's meshes, in world space, onto the settlement's one mesh per material
  for(const m of g.children){const k=m.userData.nomadMat,G=m.geometry.clone().applyMatrix4(g.matrixWorld);let M=merged.get(k);if(!M){M={pos:[],nrm:[],uv:[],col:[]};merged.set(k,M);}
   const a=G.attributes;for(const [src,dst] of [['position','pos'],['normal','nrm'],['uv','uv'],['color','col']]){const arr=a[src].array;for(let i=0;i<arr.length;i++)M[dst].push(arr[i]);}
   G.dispose();m.geometry.dispose();}}
 // walk the doors of the upper row from their stairs
 for(const R of records)if(R.access){const S=records.find(s=>s.id===R.access);R.door=S?S.door:null;}
 const meshes=[];const prior=BIO.cur;BIO.cur='buildings';
 for(const [k,M] of merged){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(M.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(M.nrm,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(M.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(M.col,3));g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,NOMAD.MAT[k].m);mesh.name='buildings:'+k;mesh.userData.inspectLabel='Eastern Nomad buildings ('+k+')';scene.add(mesh);meshes.push(mesh);
  BIO.tally(M.pos.length/9,0,1);}
 BIO.cur=prior;
 const out={count:records.length,byFamily,records,meshes,ms:Math.round(performance.now()-t0),rejected:SHADE_PLAN.rejected};
 window._buildings={count:out.count,byFamily,ms:out.ms,rejected:out.rejected,drawCalls:meshes.length,records:records.map(r=>Object.assign({},r))};
 return out;})();
// the life layer's grid (84) blocks these and reopens nothing else: every door lies outside its building
const NAV_BLOCK=BUILDINGS.records;
