// ================================================================= LĀIṬWĀL — the wall's screes (KNOWN_ISSUES.md: "screes and ledges that wander")
// The scarp sheds: talus cones at each band's two ends, banked against its end buttress (on the bench under band 1, on the ledge of
// the band below above it), heaps of fallen rock in the gaps between the fronts along every ledge and the wall's foot, so the
// ledges' line is broken where nobody lives. Each a core/terrain KRUBBLE heap (the repo's one rubble: a mound with its lumps and
// loose blocks), its seed from a hash of the band, the gap and a salt (core/rand); its surface drawn in the scarp's rock (the beds'
// tint, the occlusion in its hollows), the heaps on the ledges walked (KRUBBLE.walkTris into core/walk), so a walker along a ledge
// climbs over them. Records first (LW_SCREE), then drawn. [web]: three.js.
const LW_SCREE=[];
if(typeof KRUBBLE!=='undefined'){
 const lwSeedOf=(k,i,salt)=>KRAND.hash(LW.SEED,k,i,salt),lwU2=(k,i,salt)=>KRAND.unit(lwSeedOf(k,i,salt));
 const heap=(o,walk)=>{const H=KRUBBLE.heap(o);H.walk=walk;LW_SCREE.push(H);return H;};
 for(const B of LW_BANDS){
  /* the ground in front of band k's face: the bench (band 0) or the ledge of band k-1 (its top), out to that band's lip */
  const below=B.k===0?null:LW_BANDS[B.k-1],yAt=(x,z)=>below?below.y+LW.BAND_H:terrainH(x,z),lip=below?below.z-.9:B.z+40,room=lip-B.z;
  /* the talus cones at the band's two ends, against the buttress (90m lwRockWedge), larger on the bench */
  for(const dir of [-1,1]){const big=!below,x=dir*(B.half+LW.BAND_H*(.6+.4*lwU2(B.k,dir,61))),z=B.z+(big?7:Math.min(3.4,room*.45)),y0=yAt(x,z);
   if(below&&Math.abs(x)>below.half-4)continue;   /* past the band below's end: no ledge under it */
   heap({id:'scree.'+B.k+'.end'+(dir>0?'E':'W'),x,z,y0,rx:big?14+6*lwU2(B.k,dir,62):6+3*lwU2(B.k,dir,62),rz:big?8:Math.min(3.6,room*.42),ry:0,
    h:big?6+3*lwU2(B.k,dir,63):2.6+1.2*lwU2(B.k,dir,63),lumps:big?6:4,blocks:big?16:8,size:big?[1.2,3.4]:[.7,2.2],cover:big?1.6:1.1,seed:lwSeedOf(B.k,dir,64)},!!below);}
  /* the gaps between the fronts: a heap against the face in two gaps in three, wide enough (6 m) and away from the main stair */
  const taken=LW_WALL.filter(s=>s.band===B.k).map(s=>{const W=TG.gz.BOX[s.key].w/2+.8;return [s.x-W,s.x+W];}).sort((a,b)=>a[0]-b[0]);
  let x=-B.half+LW.BAND_H*.8,i=0;for(const t of taken.concat([[B.half-LW.BAND_H*.8,B.half]])){const a=x,b=t[0];x=Math.max(x,t[1]);i++;
   if(b-a<6||Math.abs((a+b)/2)<14||lwU2(B.k,i,65)<.34)continue;
   const cx=(a+b)/2,rx=Math.min(b-a-2,9)/2+.8,rz=below?Math.min(2.2,room*.3):3,z=B.z+rz*.85;
   heap({id:'scree.'+B.k+'.gap'+i,x:cx,z,y0:yAt(cx,z),rx,rz,ry:0,h:(below?1.4:2.2)+1.2*lwU2(B.k,i,66),lumps:3,blocks:6,size:[.5,1.8],cover:1,seed:lwSeedOf(B.k,i,67)},!!below);}}
 /* drawn: one mesh in the scarp's rock, the beds' tint times the heap's occlusion (its hollows dark, its loose blocks a shade
    lighter); the ledges' heaps into core/walk */
 const pos=[],col=[],idx=[],cs=[0,0,0];let base=0;
 for(const H of LW_SCREE){const o=KRUBBLE.mesh(H,{cell:1.2}),P=o.pos;
  for(let v=0;v<P.length/3;v++){const x=P[v*3],y=P[v*3+1],z=P[v*3+2];pos.push(x,y,z);lwStrata(x,y,cs);const k=(o.part[v]?1.06:.92)*(1-.45*o.occ[v]);col.push(cs[0]*k,cs[1]*k,cs[2]*k);}
  for(const q of o.idx)idx.push(base+q);base+=P.length/3;
  if(H.walk&&typeof KWALK!=='undefined')for(const T of KRUBBLE.walkTris(H,1.5))KWALK.poly({pts:T,name:H.id,tag:'lightwall:scree'});}
 if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,lwBandMat);m.name='the wall: its screes';m.castShadow=m.receiveShadow=true;m.userData.probeSkip=true;
  m.userData.inspectLabel='The Light Wall: its screes (core/terrain KRUBBLE)';scene.add(m);}
 /* registered as features before they are drawn would be the rule (core/tags); the screes are ground, as the bands' rock is */
}
window._lightwallScree={heaps:LW_SCREE.length,ends:LW_SCREE.filter(H=>/end/.test(H.id)).length,walked:LW_SCREE.filter(H=>H.walk).length};
