// ---------------------------------------------------------------- kit definitions (shared geometry)
// DARK OPENINGS (shared-code round). MAT.dark is what every opening, recess,
// liner and void behind a hole is made of, and at 0x1a1d22 it read MID-GREY:
// three.js r128 takes the hex as linear, so the albedo is ~.11, and a sunlit
// reveal under the full sun plus the hemisphere came back at ~115/255. Openings
// now take a near-black albedo (~.03 linear): ~50/255 facing the sun, ~20 away
// from it, and with nothing emissive they follow setNight() to black.
// The kit's few true SURFACES that were drawn in MAT.dark (conduit tubes, the
// bunker fins, radar wings, dish backs) keep the old value as MAT.darkSurf, so
// they stay a painted dark grey rather than going black. Kit-local: the
// core/materials copy is untouched, other builds keep their MAT.dark.
MAT.darkSurf=MAT.dark.clone();
MAT.dark.color.setHex(0x0a0b0d);
kdef('winI',arcWindowGeo(2.2,4.2,.7),MAT.winIntact); kdef('winD',arcWindowGeo(2.2,4.2,.7),MAT.winDead);
kdef('winBigI',arcWindowGeo(3,3.6,.7),MAT.winIntact); kdef('winBigD',arcWindowGeo(3,3.6,.7),MAT.winDead);
kdef('ovalI',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winIntact); kdef('ovalD',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winDead);
kdef('archOpen',arcWindowGeo(6,9,1.2),MAT.dark);
kdef('mullW',new THREE.BoxGeometry(.5,1,.5),MAT.white); kdef('mullR',new THREE.BoxGeometry(.5,1,.5),MAT.rust);
kdef('finW',new THREE.BoxGeometry(1,1,1),MAT.darkSurf);kdef('pierW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('pierR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('dot',new THREE.BoxGeometry(1.4,.7,.4),MAT.dot);
kdef('strip',new THREE.BoxGeometry(1,.18,.18),MAT.strip);
kdef('colW',hyperGeo(1,1,1.6),MAT.white); kdef('colR',hyperGeo(1,1,1.6),MAT.rust);
// A PLAIN POST. `colW`/`colR` are 480-triangle fluted lathes, which is right
// for a monumental column and ruinous for a stanchion, a railing upright or a
// specimen tank. The Forest Tower already carried a private 32-triangle post
// for exactly this reason, and Dalab's lab fit-out was spending 1.4M triangles
// on three colW per room. Eight sides, 32 triangles, same materials.
kdef('postW',new THREE.CylinderGeometry(1,1,1,8),MAT.white); kdef('postR',new THREE.CylinderGeometry(1,1,1,8),MAT.rust);
kdef('arch',arcShape(16,27,2.2,4),MAT.white); kdef('archR',arcShape(16,27,2.2,4),MAT.rust);
kdef('vaultRib',arcShape(92,56,2.6,3),MAT.white); kdef('vaultRibR',arcShape(92,56,2.6,3),MAT.rust);
kdef('pipe',new THREE.CylinderGeometry(1,1,1,10),MAT.pipe); kdef('pipeR',new THREE.CylinderGeometry(1,1,1,10),MAT.pipeRust);
kdef('slab',new THREE.CylinderGeometry(1,1,1,48),MAT.slab);
// The decorative bands read as a copper/bronze alloy, so their ruined form is
// the one part of the kit that goes verdigris. Everything else rusts. Keeping
// patina off the steel is the whole reason verdigris became its own material.
kdef('ringW',new THREE.TorusGeometry(1,.09,6,40),MAT.white); kdef('ringR',new THREE.TorusGeometry(1,.09,6,40),MAT.verdigris);
kdef('stain',new THREE.PlaneGeometry(1,1),MAT.stain);
// detail 0, not 1: 20 triangles instead of 80. A moss blob is ground cover a
// metre or two across, it is always squashed flat by its instance scale, and
// nothing in the kit ever gets close enough to count its facets. At detail 1
// it was the single heaviest line item in two types.
kdef('moss',new THREE.IcosahedronGeometry(1,0),MAT.moss);

// ---------------------------------------------------------------- THE LEAF CARD
// One shared tree, because four types independently failed to make one.
//
// The kit's canopy has always been a displaced icosahedron — `moss` at detail 1,
// which is EIGHTY triangles for one blob, and `VEG.tree` hangs three or four of
// them off a trunk. That is 240-320 triangles a tree, it is the top budget line
// in two types, and at ten metres it still reads as a bag of marbles, because a
// faceted ball is a faceted ball however you texture it. The Forest Tower and
// the Forest Ring each wrote their own displaced icosahedron and each logged the
// same complaint against it; Arcbeam duplicated the kit default rather than
// reach into a neighbour's fragment. Raising the displacement amplitude was
// tried twice and is not the answer.
//
// The answer is to stop making the silhouette out of geometry. Three quads
// crossed about the vertical axis, plus one laid near-flat for the view from
// above, carry an alpha-mapped leaf mass: EIGHT triangles
// instead of eighty, and the outline comes from the texture's alpha, which can
// be as ragged as a real canopy for free. `alphaTest`, never `transparent` —
// transparent would put every clump into the sorted pass and cost more in draw
// order than it ever saved in triangles.
//
// Normals point OUT FROM THE CENTRE, not along each quad's own face. Face
// normals light the three cards independently and the clump reads as three flat
// sheets; radial normals light it as one soft volume, which is the whole trick.
TEX.leafCard=canvasTex(128,128,(g,w,h)=>{
 g.clearRect(0,0,w,h);                       // alpha 0 outside the leaf mass
 const cx=w/2,cy=h/2;
 for(let i=0;i<150;i++){
  // biased toward the middle so the card has a dense heart and a ragged edge
  const a=Math.random()*TAU,rad=Math.pow(Math.random(),.62)*w*.47;
  const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
  const L=w*(.10-.045*rad/(w*.47));          // leaves shrink toward the fringe
  g.save();g.translate(x,y);g.rotate(Math.random()*TAU);
  const lit=.55+.45*(1-rad/(w*.5));          // a crude self-shading gradient
  g.fillStyle='rgb('+Math.round(48*lit+26)+','+Math.round(104*lit+30)+','+Math.round(38*lit+18)+')';
  g.beginPath();g.ellipse(0,0,L,L*.52,0,0,TAU);g.fill();g.restore();}});
MAT.leafCard=new THREE.MeshStandardMaterial({map:TEX.leafCard,alphaTest:.45,
 roughness:1,metalness:0,side:DS});
function leafCardGeo(){
 const P=[],N=[],U=[],v=new THREE.Vector3();
 // unit RADIUS, matching IcosahedronGeometry(1,n), so this is a drop-in
 // replacement anywhere the kit used to place a `moss` blob
 for(let q=0;q<3;q++){const a=q*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
  const V=[[-c,-1,-s],[c,-1,s],[c,1,s],[-c,-1,-s],[c,1,s],[-c,1,-s]];
  const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);
   v.set(V[i][0],V[i][1]*.55,V[i][2]).normalize();N.push(v.x,v.y,v.z);
   U.push(T[i][0],T[i][1]);}}
 // A fourth quad, laid near-flat. Three vertical cards are fine in elevation
 // but from above — off a terrace, or anywhere the camera looks down into a
 // canopy — they present edge-on and the clump reads as a three-pointed star.
 // This one is what the viewer sees from overhead. Two more triangles.
 {const V=[[-1,.34,-1],[1,.34,-1],[1,.1,1],[-1,.34,-1],[1,.1,1],[-1,.1,1]];
  const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);
   v.set(V[i][0]*.25,1,V[i][2]*.25).normalize();N.push(v.x,v.y,v.z);
   U.push(T[i][0],T[i][1]);}}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 return g;}
kdef('leafCard',leafCardGeo(),MAT.leafCard);
kdef('vine',new THREE.CylinderGeometry(.05,.16,1,5).translate(0,-.5,0),MAT.vine);
// RUBBLE (shared-code round, QA arcB). Was a regular dodecahedron on untextured
// white: twelve identical pentagons have no edge to read, and at any size over
// ~10 m every talus in the kit was a heap of pale eggs. Now Arcoindian's block
// (89b `aiBlock`): a hexahedron with its eight corners knocked about, hashed on
// the corner so the faces stay welded, flat shaded, 12 triangles to the
// dodecahedron's 36 and the same volume at scale 1. It takes a mottled stone
// map (fine, non-directional: a bedded or boarded map made crates of it) under
// the same per-instance tints, which now multiply stone rather than white.
TEX.rubbleStone=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const v=168+(fbm(x/22,y/22,6.3,3)-.5)*70+(fbm(x/3,y/3,2.9,1)-.5)*34;
  d[i]=v;d[i+1]=v-4;d[i+2]=v-11;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.rubbleK=new THREE.MeshStandardMaterial({map:TEX.rubbleStone,color:0xd6ccbe,roughness:1,metalness:0});
function stoneBlockGeo(){const g=new THREE.BoxGeometry(1.45,1.45,1.45),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),
   k=h3(Math.sign(x)*3.1,Math.sign(y)*5.3,Math.sign(z)*7.7);
  p.setXYZ(i,x*(1+(k-.5)*.5),y*(1+(h3(k,2.2,1)-.5)*.45),z*(1+(h3(k,4.4,3)-.5)*.5));}
 const n=g.toNonIndexed();n.computeVertexNormals();return n;}
kdef('rubble',stoneBlockGeo(),MAT.rubbleK);
kdef('trunk',new THREE.CylinderGeometry(.18,.4,1,6).translate(0,.5,0),MAT.vine);
kdef('figB',new THREE.CylinderGeometry(.24,.2,1.5,6).translate(0,.75,0),MAT.fig);
kdef('figH',new THREE.SphereGeometry(.13,6,5).translate(0,1.62,0),MAT.fig);
kdef('finial',new THREE.IcosahedronGeometry(1,0),MAT.glass);

