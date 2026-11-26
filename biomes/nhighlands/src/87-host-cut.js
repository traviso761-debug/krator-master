// ================================================================= HOST — the Cut's two natives, read in place
// biomes/cut/PLAN.md section 12, exchanges 7 and 8 (the owner, 2026-10-26): the circle lichen and the ring reed stay in the Cut's
// kit (its 41, 50, 55, 57 and 70, read by path in build.py, with its pack's reed and lichen sheets) and grow here with the warp off:
// this map is outside the field (s is 0), so the lichen is an ordinary map lichen (round-ish, irregular, its thalli touching and
// merging: CUT.planLichenPlain) and the reeds an ordinary bed (heights continuous, no bands: CUT.planReedBed), Phragmites in the cold.
//   the lichen  on the crag pillars (a lattice of rays at the drawn rock, so a thallus lies on the face the eye sees) and on the
//               terrain's crag faces (slope past 1.35, the faces the floor leaves bare)
//   the reeds   in the tarn's shallows and wet margin, and along the stream's slack pools (below a cascade, drop under 6%)
// Every record is seeded by its lattice cell (KRAND through the Cut's own hash): nothing here draws from the page's stream.
// Without the Cut's fragments (a page that reads this kit in place) it does nothing.
function buildCutNatives(rocks){if(typeof CUT==='undefined'||!CUT.planLichenPlain)return null;const st={};
 // ---- the lichen on the pillars: rays from outside toward the axis, one per (bearing, height) cell, kept by a hash
 const pts=[],ray=new THREE.Raycaster(),M=(rocks||[]).map(g=>new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));
 const keep=(i,j,k,p)=>KRAND.unit(KRAND.hash(8701,i,j,k))<p;
 PILLARS.forEach((P,pi)=>{const m=M[pi]||null;if(!m)return;m.updateMatrixWorld();
  for(let j=0,nh=Math.floor(P.H/1.6);j<nh;j++)for(let i=0;i<48;i++){if(!keep(pi,i,j,.42))continue;
   const a=i/48*TAU,y=P.y0+2+j*1.6,o=new THREE.Vector3(P.x+Math.cos(a)*(P.R*2+4),y,P.z+Math.sin(a)*(P.R*2+4));
   ray.set(o,new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)));const h=ray.intersectObject(m,false)[0];if(!h||!h.face)continue;
   const n=h.face.normal.clone().transformDirection(m.matrixWorld);if(Math.abs(n.y)>.6)continue;   /* a ledge's top is the heath's */
   pts.push({p:[h.point.x,h.point.y,h.point.z],n:[n.x,n.y,n.z],id:(pi+1)*100000+j*48+i});}});
 M.forEach(m=>m.material.dispose());
 // ---- and on the terrain's crag faces: a 9 m lattice where the slope passes 1.35 (the BIO.init mask's bare rock)
 const cell=9;for(let j=Math.ceil(TERR.Z0/cell);j*cell<TERR.Z1;j++)for(let i=Math.ceil(TERR.X0/cell);i*cell<TERR.X1;i++){
  const x=(i+.5)*cell,z=(j+.5)*cell,sl=FC.at(FC.a.slope,x,z);if(sl<1.35||!keep(i,j,7,.28*Math.min(1,(sl-1.35)/.5+.4)))continue;
  const e=1.5,dx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),dz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),l=Math.hypot(dx,1,dz);
  pts.push({p:[x,terrainH(x,z),z],n:[-dx/l,1/l,-dz/l],id:2000000+((j+1024)*2048+(i+1024))});}
 const LICHEN=CUT.planLichenPlain({points:pts,spread:.7,lift:.1});
 Object.assign(st,CUT.drawLichen(LICHEN,st));st.lichenPoints=pts.length;
 // ---- the reeds: the tarn's margin (the ground from 0.7 m under its level to 0.35 m over it) and the stream's slack pools
 const wetTarn=(x,z)=>{const d=Math.hypot(x-TARN.x,z-TARN.z)-TARN.r;if(d<-14||d>12)return 0;const y=terrainH(x,z)-TARN.level;return y<-.7||y>.35?0:1-Math.abs(y+.15)/.6;};
 let REEDS=CUT.planReedBed({box:[TARN.x-TARN.r-14,TARN.z-TARN.r-14,TARN.x+TARN.r+14,TARN.z+TARN.r+14],wet:wetTarn,ground:terrainH,q:.75});
 const seen=new Set(REEDS.map(r=>Math.round(r.x*4)+','+Math.round(r.z*4)));
 for(let i=1;i<STREAM.P.length-1;i++){if(STREAM.drop[i]>.06||!(STREAM.dep[i]>.9))continue;const p=STREAM.P[i],w=STREAM.halfW(i),lv=STREAM.level[i],R=w+5;
  const wet=(x,z)=>{const r=streamNear(x,z);if(!r||r.d<w-1.5||r.d>w+3.5)return 0;const y=terrainH(x,z)-lv;return y<-.6||y>.4?0:.85-Math.abs(y+.1)/.7;};
  for(const r of CUT.planReedBed({box:[p[0]-R,p[1]-R,p[0]+R,p[1]+R],wet,ground:terrainH,q:.6})){const k=Math.round(r.x*4)+','+Math.round(r.z*4);if(!seen.has(k)){seen.add(k);REEDS.push(r);}}}
 Object.assign(st,CUT.drawReeds(REEDS,{range:700}));
 NHL.CUT_LICHEN=LICHEN;NHL.CUT_REEDS=REEDS;return st;}
