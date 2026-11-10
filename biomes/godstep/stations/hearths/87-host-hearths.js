// ================================================================= HOST — THE HEARTH FIELD AND THE TUBE MOUTHS (station 3): HEARTH on KTHERM, the mouths on KCAVERN
// stationBuild() (88-host-build.js calls it after the kit's passes, before the bake):
//   THE FIELD    biomes/hearths read in place (HEARTH.layout on the vent's KTHERM bake, 45b): one disc of broad-fanned hearth trees round the
//                warm spring (the rim's dress: few broad fans high on long stalks, biomes/hearths/PLAN.md section 7a), the ember mat on the
//                hottest ground, coal moss, stokers at the edge, tallow beads, and the rings of dead stalks (Dedoharđoi) where the heat was
//   THE MOUTHS   KCAVERN (core/terrain 39): tube_god_07 (48 m wide, 28 m high) leaving ENE and the cross-conduit (26 x 18 m) from the SW, each a
//                C.tube from the pit's floor in under the wall to its first bend and a little past it, closed there (the deep way is not this
//                kit's: PLAN.md section 5); where each meets the wall's face, a 'well' opening: the cavern meshes the face there with the
//                tube's arch cut in it, and the host's ground leaves those cells out (GROUND_HOLE)
const CAV={C:null,meshes:[],counts:{},tubes:[]};
// the cells the cavern draws: inside each mouth's opening, 2 m in from its edge (the inset's 2.5 m cells; the cavern's own ground runs 3 m past it)
function GROUND_HOLE(x,z){const C=CAV.C;if(!C)return false;for(const Q of C.openings){if(Q.kind==='well'&&Math.hypot(x-Q.c[0],z-Q.c[1])<Q.r+Q.rim-2)return true;}return false;}
function stationBuild(){const t0=performance.now(),q=new URLSearchParams(location.search),Q=q.has('q')?+q.get('q'):1;
 // ---- the field (in its own registry: HEARTH's functions are kit-wrapped)
 HEARTH.parts('rim');
 BIO.cur='hearths/field';
 const F=HEARTH.layout({therm:THERM_F,at:[VENT.x,VENT.z],R:280,dress:'rim',seed:KRAND.hash(WORLD,893,1145),toward:{az:200,alt:35},ground:terrainH,
  mask:(x,z)=>BIO.mask(x,z)>0&&FIELD.face(x,z)<.3&&FIELD.stream(x,z)<.2&&Math.hypot(x-SPRING.x,z-SPRING.z)>SPRING.r+4?1:0,deadRings:[200,265],q:Q});
 BIO.cur=null;window._field=F;
 // ---- the mouths
 const C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:2,chunk:24,seed:KRAND.hash(WORLD,92,0,0xCA7E),minRock:.8});CAV.C=C;
 MOUTHS.forEach(M=>{const out=-30,first=240,turn=140,a=Math.atan2(M.dir[1],M.dir[0])+M.bend,d2=[Math.cos(a),Math.sin(a)],pts=[];
  for(let s=M.s+out;s<=M.s+first;s+=20)pts.push([M.dir[0]*s,M.floorY+M.grade*Math.max(0,s-M.s),M.dir[1]*s]);
  const e=pts[pts.length-1];for(let s=20;s<=turn;s+=20)pts.push([e[0]+d2[0]*s,e[1]+M.grade*s,e[2]+d2[1]*s]);
  C.tube({id:'mouth-'+M.key,owner:'godstep',pts,w:M.w,h:M.h,spring:.45,ledge:{v:M.h*.3,d:1.4},blend:8,rock:'basalt',finish:'raw'});
  const r=Math.max(42,M.w*.85);C.opening({id:'face-'+M.key,c:[M.wx,M.wz],r,rim:3,kind:'well'});
  /* the cavern meshes a chunk only where a primitive's box reaches: two empty monoliths (rock kept where there is no void: no effect on the field)
     reach the rest of the opening's column, so the face above the bore and the cut's sides beside it are meshed too: one over the bore's crown,
     two beside it (half-discs clear of the bore's box) */
  const Rd=r+3+6,ux=M.dir[0],uz=M.dir[1],P=(s1,c1)=>[M.wx+ux*s1-uz*c1,M.wz+uz*s1+ux*c1],c0=M.w/2+12,top=M.floorY+M.h+10;
  let ymax=top;for(let k=0;k<64;k++){const q=P(Math.cos(k/64*TAU)*Rd,Math.sin(k/64*TAU)*Rd);ymax=Math.max(ymax,terrainH(q[0],q[1]));}ymax=Math.max(ymax,terrainH(M.wx,M.wz))+6;
  const disc=[],half=sg=>{const o=[];for(let k=0;k<=24;k++){const a=Math.asin(Math.min(1,c0/Rd)),t=a+(Math.PI-2*a)*k/24;o.push(P(Math.cos(t)*Rd,sg*Math.sin(t)*Rd));}return o;};
  for(let k=0;k<32;k++)disc.push(P(Math.cos(k/32*TAU)*Rd,Math.sin(k/32*TAU)*Rd));
  C.monolith({id:'reach-'+M.key+'-over',owner:'godstep',poly:disc,y0:top,y1:ymax,block:false});
  [1,-1].forEach(sg=>C.monolith({id:'reach-'+M.key+(sg>0?'-r':'-l'),owner:'godstep',poly:half(sg),y0:M.floorY-6,y1:top+1,block:false}));
  CAV.tubes.push({key:M.key,pts,name:M.name,M});});
 C.build();
 const rockM=new THREE.MeshStandardMaterial({color:0x161412,roughness:.92,metalness:.05,vertexColors:true});rockM.userData.noHorizon=true;
 let tris=0;C.meshAll().forEach(ch=>{if(!ch.idx.length)return;const g=new THREE.BufferGeometry(),n=ch.pos.length/3,col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const o=.25+.75*ch.occ[i],red=ch.ground[i]?1:0;col[i*3]=o*(1+.25*red);col[i*3+1]=o;col[i*3+2]=o*(1-.1*red);}
  g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.setIndex(new THREE.BufferAttribute(ch.idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rockM);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel='A tube mouth in the pit\'s wall: titanium basalt, the tube\'s glazed lining (KCAVERN)';scene.add(m);CAV.meshes.push(m);tris+=ch.idx.length/3;});
 CAV.counts={tubes:CAV.tubes.length,openings:C.openings.length,cavernTris:tris,chunks:C.chunks.length,ms:Math.round(performance.now()-t0)};
 window._cavern=CAV.counts;
 return Object.assign({field:F.counts},CAV.counts);}
// the eye stands on a tube's floor inside it (the host's camera guard reads the ground; under the wall the floor is the tube's)
function STATION_FLOOR(x,z){for(const T of CAV.tubes){const M=T.M,s=x*M.dir[0]+z*M.dir[1],c=Math.abs(-x*M.dir[1]+z*M.dir[0]);if(s>M.s&&s<M.s+240&&c<M.w*.4)return M.floorY+M.grade*(s-M.s);}return terrainH(x,z);}
