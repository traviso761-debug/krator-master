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
kdef('rubble',new THREE.DodecahedronGeometry(1,0),MAT.rubble);
kdef('trunk',new THREE.CylinderGeometry(.18,.4,1,6).translate(0,.5,0),MAT.vine);
kdef('figB',new THREE.CylinderGeometry(.24,.2,1.5,6).translate(0,.75,0),MAT.fig);
kdef('figH',new THREE.SphereGeometry(.13,6,5).translate(0,1.62,0),MAT.fig);
kdef('finial',new THREE.IcosahedronGeometry(1,0),MAT.glass);

// ---------------------------------------------------------------- decoration helpers
function windowsOnLathe(o,d,yFrom,yTo,step,n,gx,gy,gz,big){ // arched windows in flute troughs
 const name=(big?'winBig':'win')+(d>0?'D':'I');
 for(let y=yFrom;y<yTo;y+=step)for(let k=0;k<n;k++){const u=(k+.5)/n;if(o.hole&&o.hole(u,y))continue;if(o.cut!=null&&y>o.cut-4)continue;
  const th=u*TAU,r=o.rFn(y)+.05;kput(name,[gx+r*Math.cos(th),gy+y,gz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);}}
// Ring of light-strip segments (all lit intact; few lit in ruin).
//
// TANGENT, not radial. `strip` is a BoxGeometry(1,.18,.18) scaled to [L,1,1],
// so its long axis is local +X — and qEuler(0,-th,0), which every other ring
// helper in this kit uses, points local +X straight OUT along the radius. Each
// segment is `L = arc length per bay` long, so a ring of them laid radially
// renders as a comb of spokes pointing at the camera rather than a line
// following the ring. The tangent is -th-PI/2.
//
// This was found independently by two builders, each of which wrote its own
// private tangential copy rather than touch the shared function (the Forest
// Tower's `TAN`/`lring`, Plymouth's `lring`). Fixing it here changes all 47
// call sites across 32 fragments, which is the point: they were all wrong.
function stripRing(gx,gy,gz,r,d,n){
 n=n||28;const L=TAU*r/n*.92;for(let k=0;k<n;k++){const th=(k+.5)/n*TAU;const lit=d>0?(rng()<.10):true;
  kput('strip',[gx+r*Math.cos(th),gy,gz+r*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[L,1,1],lit?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}}
function mullions(gx,gy,gz,r,h,n,d){for(let k=0;k<n;k++){const th=k/n*TAU;kput(d>0?'mullR':'mullW',[gx+r*Math.cos(th),gy+h/2,gz+r*Math.sin(th)],qEuler(0,-th,0),[1,h,1],null);}}
// `noStrip` suppresses the light-strip ring. The strips are an UNLIT material,
// so a dead segment renders at a fixed pale grey rather than going dark with
// the scene; on a building meant to have no power at all (The Project) that
// shows up at night as a row of glowing dashes. Every existing caller omits it.
function glassBand(parent,rFn,y0,h,d,gx,gy,gz,n,noStrip){ // gallery ring: glass drum (intact) or bare mullions round a dark drum (ruin)
 const o={rFn:y=>rFn(y0+y)*(1.09+.05*Math.sin(Math.PI*y/h)),H:h,nu:48,nv:6};
 if(d===0){mesh(lathe(o),MAT.glass,parent,0,y0,0);}
 mesh(lathe({rFn:y=>rFn(y0+y)*.97,H:h,nu:32,nv:2}),MAT.dark,parent,0,y0,0);
 mullions(gx,gy+y0,gz,rFn(y0+h/2)*1.1,h,n||36,d);
 if(!noStrip)stripRing(gx,gy+y0+h*.55,gz,rFn(y0+h/2)*.95,d,n||28);
 // ledge slab under the band
 kput('slab',[gx,gy+y0-.4,gz],null,[rFn(y0)*1.16,.8,rFn(y0)*1.16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));}
function floorSlabs(gx,gy,gz,rFn,y0,y1,step,d,cut){for(let y=y0;y<y1;y+=step){if(cut!=null&&y>cut+3)break;kput('slab',[gx,gy+y,gz],null,[rFn(y)*.93,.5,rFn(y)*.93],new THREE.Color(0x2a2c30));}}
function scatterMoss(gx,gy,gz,rMin,rMax,n,sMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax);const s=rr(.5,sMax);
 kput('moss',[gx+r*Math.cos(a),gy+s*.25,gz+r*Math.sin(a)],qEuler(0,rng()*TAU,0),[s*rr(.8,1.4),s*.38,s*rr(.8,1.4)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function mossOnRing(gx,gy,gz,r,n,sMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,s=rr(.6,sMax);kput('moss',[gx+r*Math.cos(a)*rr(.85,1.02),gy+s*.2,gz+r*Math.sin(a)*rr(.85,1.02)],null,[s*1.3,s*.4,s*1.3],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.05,.12)));}}
function vinesOnRing(gx,gy,gz,r,n,lMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,L=rr(4,lMax);kput('vine',[gx+r*Math.cos(a),gy,gz+r*Math.sin(a)],qEuler(rr(-.12,.12),0,rr(-.12,.12)),[rr(.8,1.6),L,rr(.8,1.6)],null);}}
// Rubble piles AGAINST the wall it fell from. The radius is biased hard toward
// rMin, blocks are largest there, and they bank up into a talus slope that
// thins to a scatter at the outer edge. A uniform annulus reads as a decorative
// ring laid round the building, which is exactly what this used to be.
function rubbleRing(gx,gy,gz,rMin,rMax,n,sMax){for(let i=0;i<n;i++){const a=rng()*TAU;
 const q=Math.pow(rng(),2.4);                       // 0 at the wall, 1 at the outer edge
 const r=rMin+(rMax-rMin)*q, s=rr(.6,sMax)*(1.25-.55*q);
 const bank=(1-q)*(1-q)*sMax*.55;
 kput('rubble',[gx+r*Math.cos(a),gy+bank+s*.4,gz+r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.35),rr(.3,.55)));}}

// --- sampling a structure's own surfaces -------------------------------------
// Moss belongs on what faces the sky and vines hang off real ledges, so both
// need to know where a structure's horizontal surfaces actually are. This walks
// the triangles of geometries the builder has already made, keeps the ones
// lying flat, and samples points on them weighted by area.
//
// It tests |ny| rather than ny: these shells are DoubleSide and their winding is
// not reliably outward, so a balcony floor can come back with a downward normal
// while being visibly a floor. The cost is that a true soffit can be sampled
// too, which is rare in these shapes and cheaper than missing every ledge.
// `src` may be a geometry, an array of them, or a whole Object3D — in which
// case it is traversed and each mesh's transform is baked relative to the root,
// so a finished structure can be sampled without the builder handing anything
// over. That is what lets the repaired pass dress all 33 types from one place.
// Keeps faces whose |normal.y| lands in [lo,hi]; returns points and normals.
function faceSamples(src,count,lo,hi){
 const tri=[],cum=[],v=new THREE.Vector3();let tot=0;
 const add=(g,M)=>{const A=g&&g.attributes&&g.attributes.position;if(!A)return;
  const P=A.array,I=g.index?g.index.array:null,nT=I?I.length/3:A.count/3;
  for(let f=0;f<nT;f++){
   const a=(I?I[f*3]:f*3)*3,b=(I?I[f*3+1]:f*3+1)*3,c=(I?I[f*3+2]:f*3+2)*3;
   let ax=P[a],ay=P[a+1],az=P[a+2],bx=P[b],by=P[b+1],bz=P[b+2],cx=P[c],cy=P[c+1],cz=P[c+2];
   if(M){v.set(ax,ay,az).applyMatrix4(M);ax=v.x;ay=v.y;az=v.z;
         v.set(bx,by,bz).applyMatrix4(M);bx=v.x;by=v.y;bz=v.z;
         v.set(cx,cy,cz).applyMatrix4(M);cx=v.x;cy=v.y;cz=v.z;}
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,L=Math.hypot(nx,ny,nz);
   if(!(L>1e-9))continue;const up=Math.abs(ny/L);
   if(up<lo||up>hi)continue;
   tot+=L*.5;tri.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx/L,ny/L,nz/L]);cum.push(tot);}};
 if(src&&src.isObject3D){src.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(src.matrixWorld).invert();
  src.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)add(o.geometry,new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));});}
 else for(const g of (Array.isArray(src)?src:[src]))add(g,null);
 const out=[];if(!(tot>0))return out;
 for(let i=0;i<count;i++){const t=rng()*tot;let a=0,b=cum.length-1;
  while(a<b){const m=(a+b)>>1;if(cum[m]<t)a=m+1;else b=m;}
  const T=tri[a];let u=rng(),w=rng();if(u+w>1){u=1-u;w=1-w;}
  const x=T[0]+u*(T[3]-T[0])+w*(T[6]-T[0]),y=T[1]+u*(T[4]-T[1])+w*(T[7]-T[1]),z=T[2]+u*(T[5]-T[2])+w*(T[8]-T[2]);
  out.push({p:[x,y,z],n:[T[9],T[10],T[11]],r:Math.hypot(x,z)});}
 return out;}
function upFaces(src,count,minNY){return faceSamples(src,count,minNY,1.01);}
// The near-vertical faces: walls. Where patches get riveted on.
function sideFaces(src,count){return faceSamples(src,count,0,.34);}
// The outer band of the flat surfaces is where a ledge is: water leaves the
// building there, so that is where vines root and where stains start.
// `cx,cz` is the centre the radius is measured from, and it is NOT always the
// builder's origin. A crescent is drawn about a centre of curvature well off
// that origin (the Hotel's is 63 m away), so measuring from 0,0 ranks the two
// HORNS of the crescent as its outermost points and hangs every vine and every
// water stain off the two ends of the building instead of off its long face.
function ledgePoints(geos,n,frac,cx,cz){const s=upFaces(geos,n*4,.5);if(!s.length)return[];
 if(cx!==undefined)for(const f of s)f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);
 s.sort((a,b)=>b.r-a.r);return s.slice(0,Math.max(1,Math.round(s.length*(frac||.3))));}
function mossOnSurface(geos,gx,gy,gz,n,sMax){for(const f of upFaces(geos,biomeN(n),.55)){const s=rr(.5,sMax);
 kput('moss',[gx+f.p[0],gy+f.p[1]+s*.15,gz+f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.8,1.5),s*rr(.22,.42),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function vinesFromLedge(geos,gx,gy,gz,n,lMax,cx,cz){for(const f of ledgePoints(geos,biomeN(n),.3,cx,cz)){const L=rr(4,lMax);
 kput('vine',[gx+f.p[0],gy+f.p[1],gz+f.p[2]],qEuler(rr(-.14,.14),rng()*TAU,rr(-.14,.14)),[rr(.8,1.7),L,rr(.8,1.7)],null);}}
// Water-staining below each ledge: a multiply-blended streak, so it darkens
// whatever wall it lands on instead of painting a grey rectangle over it.
//
// Still radial, which is the standing complaint against it on a rectilinear
// plan — but it is now radial about `cx,cz` rather than always about the
// builder's origin. On the Hotel, whose crescent is struck from a centre 63 m
// behind the origin, the two are 43 degrees apart at the horns, so every
// streak at the ends of the building was laid across the facade instead of
// down it. Callers on a circular plan centred on their own origin pass nothing
// and are unchanged.
function stainsFromLedge(geos,gx,gy,gz,n,lMax,cx,cz){const ox=cx||0,oz=cz||0;
 for(const f of ledgePoints(geos,n,.45,cx,cz)){
 const L=rr(5,lMax),a=Math.atan2(f.p[2]-oz,f.p[0]-ox),o=1.004;
 kput('stain',[gx+ox+(f.p[0]-ox)*o,gy+f.p[1]-L*.5,gz+oz+(f.p[2]-oz)*o],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.5),L,1],null);}}

// VEGETATION HAND-OFF. The Krator flora pass is a separate project and will
// replace VEG.tree wholesale; everything in this kit that plants anything goes
// through it, so that swap is one assignment and touches no builder.
// y is the ground height at (x,z) — ask terrainH, do not assume 0.
// ---------------------------------------------------------------- THE BIOME
// One dial the whole kit's planting hangs off, so "overgrown" is a setting
// rather than 33 separate edits. `lush` multiplies every scattered population:
// 1 is the kit as designed, 3 is a site the plain has taken back.
//
// A builder is CROSS-COMPATIBLE with this when its own planting loops route
// their counts through BIOME.lush too — the shared helpers below already do,
// so a type that plants only via trees()/scatterMoss()/VEG.tree gets it free,
// and a type with a bespoke scatter (both forest types, Arcbeam, Arcoindian)
// has to opt in. That difference is exactly what the biome pass is testing.
//
// It is a GLOBAL and the builders run in sequence, so anything that sets it
// must put it back — see `withBiome`, which is the only sanctioned way in.
const BIOME={lush:1};
function withBiome(lush,fn){const was=BIOME.lush;BIOME.lush=lush;
 try{fn();}finally{BIOME.lush=was;}}
const biomeN=n=>Math.round(n*BIOME.lush);

// The hand-off point for flora. Every planting call in the kit goes through
// this, so changing it changes the forest everywhere at once — which is the
// point: see the LEAF CARD note in 34-kitdefs.js for why the four-icosahedra
// version had to go. Trunk + two or three crossed leaf cards is 36-42 triangles
// against the old 240-320, and it reads as foliage at eye level instead of as a
// bag of marbles. `species` picks the habit: odd is a narrow spire, even a
// broad dome, so a scatter of `i%3` gives a mixed stand rather than one tree
// repeated.
const VEG={
 tree(x,y,z,species,h){KSKIP=true;try{this.tree0(x,y,z,species,h);}finally{KSKIP=false;}},
 tree0(x,y,z,species,h){
  const spire=!!(species%2);
  kput('trunk',[x,y,z],null,[h*.20,h*(spire?.74:.62),h*.20],null);
  const n=spire?2:3;
  for(let k=0;k<n;k++){
   const s=h*(spire?rr(.22,.32):rr(.30,.44))*(1-k*.13);
   kput('leafCard',[x+rr(-.13,.13)*h,y+h*((spire?.66:.58)+k*.15),z+rr(-.13,.13)*h],
    qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),
    [s,s*(spire?rr(1.0,1.35):rr(.70,.95)),s],
    // The instance colour MULTIPLIES an already mid-green sRGB map, so the two
   // compound: .15-.30 lightness — the value the old icosahedra used against
   // no texture at all — came back as near-black shrubs.
   new THREE.Color().setHSL(rr(.22,.34),rr(.30,.52),rr(.40,.68)));}},
};
function trees(gx,gz,rMin,rMax,n){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax),h=rr(6,14);
 const x=gx+r*Math.cos(a),z=gz+r*Math.sin(a);VEG.tree(x,terrainH(x,z),z,i%3,h);}}
// APRON. Every structure meets the ground on a hard line without one. This lays
// a graded skirt from the foot of the mass out to the ground, so the two blend.
// cx,cz are local to the builder's group, like everything else a builder does.
function apron(parent,cx,cz,rIn,rOut,d,hIn){
 const wx=KOFF[0]+cx,wz=KOFF[2]+cz;
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rIn,rIn+(rOut-rIn)*APRK,v)*(1+.04*fbm(u*7,1.3,17,2));
  const x=r*Math.cos(th),z=r*Math.sin(th);
  return[x,lerp(hIn,0,Math.pow(v,.6))+terrainH(wx+x,wz+z),z];},64,6,{uS:rIn/6,vS:3}),
  d>0?MAT.mud:MAT.rock,parent,cx,0,cz);}
function figures(gx,gz,n,spread){for(let i=0;i<n;i++){const x=gx+rr(-spread,spread),z=gz+rr(-spread,spread);const c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
 kput('figB',[x,0,z],qEuler(0,rng()*TAU,0),1,c);kput('figH',[x,0,z],null,1,new THREE.Color(0xc9a17e));}}
function stats(){}

// ---------------------------------------------------------------- v2 helpers
kdef('strutW',new THREE.BoxGeometry(1,1,1),MAT.white); kdef('strutR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('cell',new THREE.BoxGeometry(1,1,.5),MAT.dot);
// The same cell on a LIT material. `cell` is MeshBasicMaterial, which is right
// for a window that is on and wrong for one that is off: a DEAD instance colour
// is 0x0a0c0e and an unlit material ignores the scene, so it renders at a fixed
// ~60/255 grey. In daylight that reads as a dark opening and nobody noticed.
// Put the scene into night for The Project and every dead window on the tower
// became a pale panel, brighter than the wall around it. This one goes black
// when the light does.
kdef('cellD',new THREE.BoxGeometry(1,1,.5),MAT.winDead);
kdef('winSmI',arcWindowGeo(1.1,2,.4),MAT.winIntact); kdef('winSmD',arcWindowGeo(1.1,2,.4),MAT.winDead);
function beam(name,a,b,w,dp,color){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.sqrt(dx*dx+dy*dy+dz*dz);
 const q=new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx,dy,dz).normalize());kput(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q,[w,L,dp],color||null);}
function hexR(R,th){const a=R*Math.cos(Math.PI/6);const f=((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3);return a/Math.cos(f-Math.PI/6);}
// petal shell: base on +x at radius Rb, rises Hp, tip leans outward by `lean`, cupped by `curl`
function petalGeo(Rb,Hp,W,lean,curl,hole){return gridSurface((u,v)=>{const s=u*2-1;const w=W*(.3+.7*Math.sin(Math.PI*Math.pow(v,.9)))*.5;
 const x=Rb+lean*v-curl*s*s*w;return[x,Hp*v,s*w];},14,22,{uS:2,vS:4,hole});}
function petalRing(parent,n,Rb,Hp,W,lean,curl,y,d,seed,mat,skipFn){for(let i=0;i<n;i++){if(skipFn&&skipFn(i))continue;const g=petalGeo(Rb,Hp,W,lean,curl,d>0?(u,v)=>fbm(u*3+i,v*5,seed+i,2)<.3*d:null);
 const m=mesh(g,mat,parent,0,y,0);m.rotation.y=-i/n*TAU;}}
// Luce-style hypar shell pair: two warped sheets leaning together over a glass gable
function luceShells(parent,xc,zc,Wb,Hs,Dd,d,seed,skin){[-1,1].forEach(side=>{const g=gridSurface((u,v)=>{const x=xc+(u-.5)*Wb*(1-.55*v);const z=zc+side*(Dd*(1-v)*(1-.35*Math.pow(u-.5,2)*4)+.6*(1-v)+.5*v);return[x,Hs*v*(1-.15*Math.pow((u-.5)*2,2)),z];},20,16,{uS:4,vS:3,hole:holeFn(d*.7,seed+side,null,2)});
 mesh(g,skin,parent);});
 if(d===0){const s=new THREE.Shape();s.moveTo(-Wb/2,0);s.lineTo(Wb/2,0);s.lineTo(0,Hs*.98);s.lineTo(-Wb/2,0);const gl=mesh(new THREE.ShapeGeometry(s),MAT.glass,parent,xc,0,zc+.2);}
 kput('archOpen',[xc,3,zc-Dd*.05],qFacing([0,0,1]),[.45,.45,1],null);}
function ribCurveGeo(pts,r){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],0))),28,r,8,false);}

