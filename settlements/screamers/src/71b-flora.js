// ================================================================= FLORA
// The one vegetation module. Every builder in the kit that plants anything --
// the hyperjungle, the Hexahedron's terraces and soffits, the orchards, the
// ground scatter, VEG.tree -- goes through FLORA, so there is one place where
// a plant's quality is decided and nothing can drift into being a blob on a
// stick again.
//
// It is the Girder vocabulary, ported to this kit's instancing:
//
//   CARDS, NOT BLOBS. A leaf mass is alpha-mapped quads carrying a painted
//   leaf cluster -- six triangles for a crown clump -- not a faceted solid.
//   A solid low-poly lump reads as a boulder however it is coloured, which is
//   what every tree in this project looked like before.
//   HANGING THINGS HANG. Curtains, strands, beards and aerial roots are
//   ribbons whose origin is at the TOP and which run down to y=-1, so the wind
//   hook's `-position.y` weight holds them still where they are attached and
//   swings them free at the tip.
//   THINGS GROW WHERE LIGHT IS. Growth on a structure is biased to its rim and
//   its openings; the deep middle of a soffit gets moss and roots, not trees.
//
// CONVENTION: every FLORA call takes WORLD-ish coordinates in the current
// builder's frame, exactly like kput -- KOFF is added for you. y is the
// surface the plant sits on; ask terrainH or the builder, never assume 0.
// A 20-triangle leaf blob. The kit's 'moss' is an Icosahedron(1,1) at 80, and
// at a hundred-odd balcony orchards plus the plaza planting that was the
// difference between fitting the mega budget and not.
// FOLIAGE, the way Girder does it. A clump is THREE CROSSED QUADS carrying an
// alpha-mapped leaf cluster -- six triangles -- instead of a solid low-poly
// blob at twenty. It is cheaper AND it reads as leaves: a faceted icosahedron
// on a stick reads as a boulder on a pole, which is exactly what this jungle
// looked like.
// FOUR LEAF TEXTURES, one per species. This is what makes a forest read as a
// forest rather than as one tree stamped a thousand times: bark colour is
// nearly invisible at any distance, and hue alone does not do it -- the four
// have to differ in LEAF SHAPE and in how densely the canopy is packed.
//
// Each texture is ONE ROSETTE, centred, with transparent corners. The earlier
// version scattered nine clusters across the whole canvas, which filled it
// corner to corner, and since alphaTest cuts a hard edge every card then read
// as a green SQUARE -- three crossed squares per clump, which is precisely the
// blockiness the cards were brought in to cure. A rosette with a ragged
// outline and empty corners reads as a leaf mass from the first frame.
function flLeafTex(o){const S=256,c=document.createElement('canvas');c.width=c.height=S;
 const g=c.getContext('2d'),cx=S*.5,cy=S*.5;
 const col=(l)=>{const h=new THREE.Color().setHSL(o.hue+rr(-.025,.025),o.sat*rr(.85,1.15),l);
  return 'rgb('+(h.r*255|0)+','+(h.g*255|0)+','+(h.b*255|0)+')';};
 // one leaf: a pointed ellipse with a midrib, or a rounded blade
 const leaf=(x,y,len,wid,ang,l)=>{g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle=col(l);g.beginPath();g.moveTo(0,0);
  if(o.round){g.bezierCurveTo(len*.35,wid*1.5,len*.85,wid*1.1,len,0);
              g.bezierCurveTo(len*.85,-wid*1.1,len*.35,-wid*1.5,0,0);}
  else{g.quadraticCurveTo(len*.45,wid,len,0);g.quadraticCurveTo(len*.45,-wid,0,0);}
  g.fill();
  g.strokeStyle='rgba(18,34,14,.26)';g.lineWidth=1.1;
  g.beginPath();g.moveTo(0,0);g.lineTo(len*.9,0);g.stroke();g.restore();};
 // THE ROSETTE, in whorls. Coverage is the number that matters: a single ring
 // of leaves radiating from a point leaves a card that is 70% holes, and a
 // crown built from those reads as sky with specks in it -- the tree looks
 // dead. Three whorls at falling radius, over an irregular filled core, gets
 // the card to about two thirds opaque while keeping the outline ragged, which
 // is the whole point of a card over a solid blob.
 {const core=S*o.core*1.6;                      // the solid middle
  g.fillStyle=col((o.lum[0]+o.lum[1])*.5);g.beginPath();
  for(let k=0;k<=13;k++){const a=k/13*TAU,r=core*(.72+.28*Math.sin(a*3+1.1));
   const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
   if(k===0)g.moveTo(px,py);else g.lineTo(px,py);}
  g.fill();}
 for(let w=0;w<3;w++){const ph=w*1.1+rr(0,.4),f=1-w*.26,nn=Math.round(o.n*(w?.85:1));
  for(let i=0;i<nn;i++){
   const a=i/nn*TAU+ph+rr(-.22,.22),r0=S*o.core*(w?rr(.2,1.1):rr(0,.7));
   const L=S*rr(o.len[0],o.len[1])*f,W=S*rr(o.wid[0],o.wid[1])*(1+w*.12);
   leaf(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0,L,W,a+rr(-.30,.30),rr(o.lum[0],o.lum[1]));}}
 if(o.flecks)for(let i=0;i<o.flecks;i++){const a=rng()*TAU,r=S*rr(.10,.34);
  g.fillStyle=o.fleckC;g.beginPath();
  g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,S*rr(.012,.028),0,TAU);g.fill();}
 // RGB is filled in where alpha is low, or mipmapping bleeds a dark fringe
 // round every leaf at distance. The fill is this species' own mid colour.
 const mid=new THREE.Color().setHSL(o.hue,o.sat,(o.lum[0]+o.lum[1])*.5);
 const id=g.getImageData(0,0,S,S),d2=id.data;
 for(let k=0;k<d2.length;k+=4)if(d2[k+3]<48){
  d2[k]=mid.r*255|0;d2[k+1]=mid.g*255|0;d2[k+2]=mid.b*255|0;}
 g.putImageData(id,0,0);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
 return t;}
// 0 Ironbark  dense, small, narrow, dark blue-green needle sprays
// 1 Ghostwood airy and pale: few small round leaves, wide gaps, violet flecks
// 2 Prism gum broad lanceolate blades, teal shading to violet -- the canon XA canopy
// 3 Baobab    sparse olive fans with ochre pods showing through
// COVERAGE is the number to watch. The rosette has to fill roughly two thirds
// of the card: a sparser one leaves a crown that is mostly sky with specks in
// it, which reads as a dying tree. Ragged OUTLINE, solid MIDDLE.
const LEAFTEX=[
 flLeafTex({n:118,core:.19,len:[.26,.48],wid:[.026,.046],hue:.36,sat:.44,lum:[.12,.24]}),
 flLeafTex({n:48,core:.19,len:[.22,.44],wid:[.056,.090],hue:.22,sat:.54,lum:[.30,.48],round:true,flecks:8,fleckC:'#9a6ad8'}),
 flLeafTex({n:56,core:.19,len:[.26,.48],wid:[.060,.100],hue:.39,sat:.50,lum:[.26,.42],round:true,flecks:6,fleckC:'#7a5ea8'}),
 flLeafTex({n:58,core:.20,len:[.22,.42],wid:[.046,.078],hue:.16,sat:.46,lum:[.21,.36],flecks:7,fleckC:'#e0862a'})];
// alphaTest, not transparent: it renders in the opaque pass with correct depth,
// so tens of thousands of clumps need no sorting. .34 rather than .42 keeps the
// thin tips of the outer leaves, which is where the ragged outline lives.
// LAMBERT, not Standard. A Standard card keeps its 4% dielectric specular
// however rough it is, and at a grazing view -- which is every card you see
// from under the canopy -- Fresnel pushes that toward 1: the underside of the
// forest went white. Girder's foliage is Lambert for exactly this reason, and
// its two-sided light mix (see FOLIAGE_HOOK in 72a-wind.js) is what makes a
// leaf seen from below read as a lit, translucent leaf rather than a shadow.
const LEAFMAT=LEAFTEX.map(t=>new THREE.MeshLambertMaterial({map:t,alphaTest:.34,
 side:THREE.DoubleSide}));
MAT.leaf=LEAFMAT[0];MAT.leaf1=LEAFMAT[1];MAT.leaf2=LEAFMAT[2];MAT.leaf3=LEAFMAT[3];
TEX.leaf=LEAFTEX[2];                       // the ribbons and fronds use this one
const CLUMPG=(function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const az=k/3*TAU+.3,tilt=.92,ca=Math.cos(az),sa=Math.sin(az);
  const n=[Math.sin(tilt)*ca,Math.cos(tilt),Math.sin(tilt)*sa];
  const u=[-sa,0,ca],v=[-Math.cos(tilt)*ca,Math.sin(tilt),-Math.cos(tilt)*sa];
  const c2=[n[0]*.10,n[1]*.10-.04,n[2]*.10];
  const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>
   [c2[0]+u[0]*q[0]+v[0]*q[1],c2[1]+u[1]*q[0]+v[1]*q[1],c2[2]+u[2]*q[0]+v[2]*q[1],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);
   uv.push(P[i][3],P[i][4]);nor.push(n[0],n[1],n[2]);});}
 const g2=new THREE.BufferGeometry();
 g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g2.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g2.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g2;})();
const CLUMPN=['clumpA','clumpB','clumpC','clumpD'];
CLUMPN.forEach((nm,i)=>kdef(nm,CLUMPG,LEAFMAT[i]));
kdef('leafy',new THREE.IcosahedronGeometry(1,0),MAT.turf);
// understorey vocabulary, in the Girder idiom: fern rosettes, palm crowns and
// shelf fungus, so the forest floor is not one blob repeated
kdef('fern',new THREE.ConeGeometry(1,1,7,1,true),MAT.turf);
kdef('frondL',new THREE.BoxGeometry(1,.06,.34),MAT.turf);
kdef('fungus',new THREE.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),MAT.rubble);
// --- materials ----------------------------------------------------------------
// Three materials share the leaf texture because the WIND hook needs three
// different weights, and a weight is compiled into the shader: a crown clump
// sways as a whole, a hanging ribbon is pinned at the top (-position.y), and an
// arching frond is pinned at its base (position.x). One material could only
// ever be right for one of them.
MAT.hang =new THREE.MeshLambertMaterial({map:TEX.leaf,alphaTest:.42,side:THREE.DoubleSide});
MAT.frond=new THREE.MeshLambertMaterial({map:TEX.leaf,alphaTest:.42,side:THREE.DoubleSide});
MAT.bloom=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});

// --- geometry -----------------------------------------------------------------
// A hanging ribbon: origin at the top, running down to y=-1, one quad per
// segment, tapering, drifting a little in z so a curtain is not a flat plank.
// The leaf texture repeats once per segment, so a long curtain reads as a chain
// of leaf clusters rather than one leaf stretched ten metres.
function flRibbonGeo(nseg,taper,drift){
 const pos=[],uv=[],nor=[];
 let w0=.5,y0=0,z0=0;
 for(let i=0;i<nseg;i++){
  const t1=(i+1)/nseg,w1=.5*lerp(1,taper,t1),y1=-t1,z1=drift*Math.sin(t1*2.2)*.5;
  const P=[[-w0,y0,z0,0,1],[w0,y0,z0,1,1],[w1,y1,z1,1,0],[-w1,y1,z1,0,0]];
  [0,2,1,0,3,2].forEach(q=>{pos.push(P[q][0],P[q][1],P[q][2]);uv.push(P[q][3],P[q][4]);nor.push(0,0,1);});
  w0=w1;y0=y1;z0=z1;}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}
// An arching frond: base at the origin, reaching out along +x and rising then
// falling, tapering to a point. Six triangles.
function flFrondGeo(nseg){
 const pos=[],uv=[],nor=[];
 const at=t=>[t,Math.sin(t*2.1)*.30-t*t*.16,0],wd=t=>.16*(1-t*t*.85);
 for(let i=0;i<nseg;i++){
  const t0=i/nseg,t1=(i+1)/nseg,a=at(t0),b=at(t1),w0=wd(t0),w1=wd(t1);
  const P=[[a[0],a[1],-w0,t0,0],[b[0],b[1],-w1,t1,0],[b[0],b[1],w1,t1,1],[a[0],a[1],w0,t0,1]];
  [0,1,2,0,2,3].forEach(q=>{pos.push(P[q][0],P[q][1],P[q][2]);uv.push(P[q][3],P[q][4]);nor.push(0,1,0);});}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}
// A moss mat: an irregular fan of unit radius lying in the xz plane, face up.
// Seven triangles, and the lobed outline is what stops a carpet of them reading
// as a scatter of discs.
function flMossGeo(){
 const pos=[],nor=[],uv=[],N=9;
 for(let s=0;s<N;s++){
  const a0=s/N*TAU,a1=(s+1)/N*TAU;
  const r0=.5*(.72+.28*Math.sin(a0*3+.7)+((s&1)?.10:0)),r1=.5*(.72+.28*Math.sin(a1*3+.7)+(((s+1)&1)?.10:0));
  const P=[[0,0,0],[Math.cos(a0)*r0,0,Math.sin(a0)*r0],[Math.cos(a1)*r1,0,Math.sin(a1)*r1]];
  // WINDING, checked by cross product rather than by eye: going round by
  // INCREASING angle in the xz plane gives u x v = -y, so [0,1,2] would make a
  // fan whose front face points at the floor. Laid on a tread it would be
  // invisible from above; rolled over onto a soffit, invisible from below --
  // which is exactly how eighteen thousand moss mats managed to render nothing
  // at all. The declared normal is +y, so the order has to be [0,2,1].
  [0,2,1].forEach(q=>{pos.push(P[q][0],P[q][1],P[q][2]);nor.push(0,1,0);uv.push(P[q][0]+.5,P[q][2]+.5);});}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}
// A moss lip: growth that has crept over an edge. A tongue lying on the deck
// running back to z=-1, folding over the lip at z=0 and dribbling down to
// y=-1. Local +x runs ALONG the edge, +z points out over it.
function flLipGeo(){
 const pos=[],nor=[],uv=[];
 const quad=(a,b,c,d,n)=>{const P=[a,b,c,d];[0,1,2,0,2,3].forEach(q=>{
  pos.push(P[q][0],P[q][1],P[q][2]);nor.push(n[0],n[1],n[2]);uv.push(q===1||q===2?1:0,q>=2?1:0);});};
 quad([-.5,.02,-1],[.5,.02,-1],[.42,.02,.06],[-.42,.02,.06],[0,1,0]);
 quad([-.42,.02,.06],[.42,.02,.06],[.30,-1,.10],[-.30,-1,.10],[0,.2,1]);
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}
// A bush lobe: a skirt frustum under a cone, five-sided. Fifteen triangles, and
// unlike a sphere it has a silhouette that reads as foliage at 50 m.
function flBushGeo(){
 const a=new THREE.CylinderGeometry(.5,.35,.42,5,1,true).translate(0,.21,0);
 const b=new THREE.ConeGeometry(.5,.62,5,1,true).translate(0,.73,0);
 const out=[];[a,b].forEach(g0=>{const g1=g0.toNonIndexed(),p=g1.attributes.position.array,n=g1.attributes.normal.array,u=g1.attributes.uv.array;
  out.push([p,n,u]);});
 const pos=[],nor=[],uv=[];out.forEach(o=>{for(let i=0;i<o[0].length;i++)pos.push(o[0][i]);
  for(let i=0;i<o[1].length;i++)nor.push(o[1][i]);for(let i=0;i<o[2].length;i++)uv.push(o[2][i]);});
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}
// A flower: two crossed diamonds on a short stalk, four triangles.
function flBloomGeo(){
 const pos=[],nor=[],uv=[];
 for(let k=0;k<2;k++){const c=Math.cos(k*Math.PI/2+.5),s=Math.sin(k*Math.PI/2+.5);
  const P=[[-c*.5,0,-s*.5,0,0],[0,.35,0,.5,1],[c*.5,0,s*.5,1,0],[0,-.3,0,.5,0]];
  [0,1,2,0,2,3].forEach(q=>{pos.push(P[q][0],P[q][1],P[q][2]);nor.push(-s,0,c);uv.push(P[q][3],P[q][4]);});}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g;}

kdef('curtain',flRibbonGeo(3,.34,1),MAT.hang);   // a broad hanging mat
kdef('strand', flRibbonGeo(3,.75,1.6),MAT.hang); // a thin trailing runner / aerial root
kdef('frondA', flFrondGeo(3),MAT.frond);         // an arching fern or palm frond
kdef('mossMat',flMossGeo(),MAT.moss);
kdef('mossLip',flLipGeo(),MAT.moss);
kdef('bushL',  flBushGeo(),MAT.turf);
kdef('bloom',  flBloomGeo(),MAT.bloom);

// --- the species ---------------------------------------------------------------
// Girder's own set. They differ in bark, in crown shape and in what hangs in
// them, which is what stops a forest reading as one tree stamped a thousand
// times. The same four grow on the Hexahedron, so the mass reads as the jungle
// climbing it rather than as landscaping.
//   0 Ironbark   fibrous red-brown bole, dark needle tiers, tall and narrow
//   1 Ghostwood  near-white bark with dark flecks, airy yellow-green, and
//                violet flower racemes hanging under the crown
//   2 Prism gum  streaked multicoloured bark, broad iridescent violet-green
//                canopy -- the canon XA canopy of this hemisphere
//   3 Baobab     swollen grey-brown bottle trunk, sparse flat crown, orange pods
// The leaf hues are pulled deliberately far apart. The four started within 0.17
// of a hue of each other, which is a difference you can measure and cannot see:
// a mixed forest came out as one green. They now run blue-green, yellow-green,
// teal and olive, and each carries its own leaf card (LEAFTEX above).
const FSPEC=[
 {bark:[.055,.34,.20],leaf:[.36,.42,.20],crown:.30,spread:.85,boughs:6,el:[.10,.42],hang:null},
 {bark:[.11,.10,.74],leaf:[.22,.54,.46],crown:.26,spread:1.05,boughs:5,el:[.28,.72],hang:0x9a6ad8},
 {bark:[.08,.30,.34],leaf:[.39,.50,.34],crown:.34,spread:1.25,boughs:7,el:[.05,.38],hang:null,irid:true},
 {bark:[.09,.20,.44],leaf:[.16,.44,.34],crown:.22,spread:1.35,boughs:5,el:[-.05,.18],hang:0xe0862a}];
const FERNC=[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e,0x24503c,0x6a8a3a];
// No near-white in the set. A 2 m cream diamond lying in grass reads as litter,
// not as a flower, and at this density it was most of what the floor showed.
const BLOOMC=[0xc4566a,0xc98d2e,0xa85ab8,0xbe4632,0xd0a848,0x8e5ea0];
// HYPERTREE PROFILES, one per species. rb: base radius as a fraction of H;
// prof(u): bole radius over height (u=0 ground, 1 tip), before the buttress
// flare `but` and the fluting `flute` over `lobes` lobes; nb boughs leaving
// the bole between u0[0] and u0[1], each L long at elevation el, bw thick;
// cr the leaf mass radius per bough as a fraction of L, dens its card density;
// top a tuft radius at the tip (fraction of H) or 0; curt how often a bough
// trails a curtain; roots the buttress count. Heights the caller passes are
// scaled by hScale so a baobab drawn from the same range stays a squat tree.
const HYPERP=[
 {rb:.060,prof:u=>u<.62?1-.42*u:lerp(.74,.07,(u-.62)/.38),but:.80,flute:.16,lobes:7,
  nb:9,u0:[.60,.95],L:[.20,.38],el:[.02,.38],bw:.013,cr:.50,dens:1,top:0,curt:.6,roots:6,hScale:1,curve:-.09},
 {rb:.046,prof:u=>u<.70?1-.30*u:lerp(.79,.05,(u-.70)/.30),but:.30,flute:.06,lobes:5,
  nb:8,u0:[.46,.92],L:[.22,.40],el:[.42,.95],bw:.010,cr:.42,dens:.62,top:.06,curt:.25,roots:4,hScale:.9,curve:.14},
 {rb:.058,prof:u=>u<.60?1-.36*u:lerp(.78,.06,(u-.60)/.40),but:.55,flute:.10,lobes:6,
  nb:10,u0:[.52,.94],L:[.30,.50],el:[.12,.50],bw:.012,cr:.55,dens:.95,top:.05,curt:.5,roots:5,hScale:.95,curve:-.13},
 {rb:.135,prof:u=>u<.30?lerp(.88,1,u/.30):u<.72?lerp(1,.34,Math.pow((u-.30)/.42,1.3)):lerp(.34,.12,(u-.72)/.28),but:.10,flute:.05,lobes:10,
  nb:7,u0:[.84,.98],L:[.22,.34],el:[.02,.30],bw:.016,cr:.42,dens:.40,top:0,curt:.15,roots:0,hScale:.58,curve:.06}];
const FLORA={
 SPEC:FSPEC,
 // The prism gum is IRIDESCENT: Girder mixes its emerald with a violet on the
 // clumps that face away from the sun. Without per-card sun facing here, a
 // third of its clumps are violet outright, which reads the same from any
 // distance a card is seen at.
 leafCol(S,v){v=v||1;
  if(S.irid&&rng()<.32)return new THREE.Color().setHSL(rr(.71,.76),rr(.40,.52),rr(.34,.44)*v);
  return new THREE.Color().setHSL(S.leaf[0]+rr(-.03,.03),S.leaf[1]*rr(.85,1.15),S.leaf[2]*rr(.8,1.25)*v);},
 barkCol(S){return new THREE.Color().setHSL(S.bark[0],S.bark[1],S.bark[2]*rr(.82,1.18));},
 vineCol(){return new THREE.Color().setHSL(rr(.22,.33),rr(.30,.52),rr(.10,.22));},
 // Moss reads as grime below about 0.10 lightness. Most of it here grows on
 // shadowed undersides, where the only light is bounce, so it is mixed a shade
 // lighter and yellower than moss in the open would be.
 mossCol(){return new THREE.Color().setHSL(rr(.20,.31),rr(.28,.50),rr(.11,.23));},
 bloomCol(){return new THREE.Color(BLOOMC[Math.floor(rng()*BLOOMC.length)]);},

 // A LIMB from a to b: n tapering beam segments along a curve, not one straight
 // rod. Girder's grow() -- a gravity/phototropic curve plus a sideways wiggle --
 // is what stops a crown reading as an umbrella frame; `curve` is the belly
 // below (negative) or the arch above (positive) the chord, as a fraction of
 // the limb's length. Returns the polyline so a caller can hang things on it.
 limb(a,b,r0,r1,col,n,curve,wig,item){n=n||4;curve=curve||0;wig=wig===undefined?.05:wig;item=item||'bough';
  const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])||1;
  const sx=-(b[2]-a[2])/L,sz=(b[0]-a[0])/L;                  // sideways unit
  const w1=rr(-1,1)*wig*L,w2=rr(-1,1)*wig*L,P=[];
  for(let k=0;k<=n;k++){const t=k/n,w=w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU);
   P.push([lerp(a[0],b[0],t)+sx*w,lerp(a[1],b[1],t)+curve*L*Math.sin(t*Math.PI),lerp(a[2],b[2],t)+sz*w]);}
  for(let k=0;k<n;k++){const r=lerp(r0,r1,(k+.5)/n);
   beam(item,P[k],P[k+1],r,r,col);}
  return P;},

 // A LEAF MASS at (x,y,z) of radius r: n crossed-quad clumps, jittered. This is
 // the one call that makes something read as foliage; everything with a crown
 // ends up here.
 // `col` may be a colour or a function returning one, so every clump in a
 // crown can be its own shade of the species' green.
 // `spread` is how far the clumps scatter from (x,y,z) and defaults to the
 // clump size. It is a separate number because a crown and a clump are not the
 // same scale: a 300 m hypertree carries 20 m clumps over a 70 m bough, and
 // scattering them by their own size instead leaves the boughs bare, which is
 // exactly what an umbrella frame looks like.
 // `kind` picks the species' own leaf card; leave it out for undergrowth and
 // anything that is not one of the four trees.
 mass(x,y,z,r,n,col,spread,kind){const sp=spread===undefined?r*.55:spread;
  const item=CLUMPN[(kind===undefined?2:kind)&3];
  for(let i=0;i<n;i++){const s=r*rr(.72,1.12);
  kput(item,[x+rr(-1,1)*sp,y+rr(-.5,.8)*sp*.6,z+rr(-1,1)*sp],
   qEuler(rr(-.45,.45),rng()*TAU,rr(-.45,.45)),[s,s,s],
   typeof col==='function'?col():(col?new THREE.Color(col):null));}},

 // A CANOPY of radius R. mass() takes a CARD size; this takes the size of the
 // leaf mass you want and works out how many cards of a sensible size fill it.
 // A card has to stay roughly leaf-scale: the painted texture carries a cluster
 // of leaves, so a 40 m card is a picture of a 40 m leaf, and a hypertree crown
 // built from four of them reads as flat sheets with hard black gaps -- which
 // is exactly what the emergents were doing.
 // A CANOPY of radius R, for the few trees big enough that one card cannot be
 // the whole crown. mass() takes a CARD size; this takes the size of the leaf
 // mass you want and works out how many cards fill it. Two limits matter and
 // they pull against each other: a card carries a painted cluster of leaves,
 // so a 40 m card is a picture of a 40 m leaf and reads as a flat sheet with
 // hard black gaps -- which is what the emergents were doing -- but covering a
 // 50 m crown in 8 m cards takes fifty of them. 14 m is the biggest a card can
 // be before the leaves on it look wrong at 100 m, and the count follows the
 // crown's projected area from there. Only worth spending on the hypertrees:
 // at 1500 forest trees the same treatment is a million triangles.
 canopy(x,y,z,R,col,dens,kind){const card=clamp(R*.45,1.1,16);
  const n=clamp(Math.round(Math.PI*R*R/(card*card)*2.6*(dens===undefined?1:dens)),3,90);
  FLORA.mass(x,y,z,card,n,col,R*.80,kind);},

 // A HANGING CURTAIN of growth off an edge or a ceiling. (nx,nz) is the
 // direction it faces -- the outward normal of the edge it roots on; pass 0,0
 // for something hanging in open air off a soffit, which gets a random bearing.
 // Ribbons are laid side by side across `w`, with a trailing strand or two
 // below them, which is what gives a curtain a ragged bottom instead of a hem.
 curtain(x,y,z,nx,nz,len,w,opt){opt=opt||{};
  const m=Math.hypot(nx,nz);let dx,dz;
  if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx=nx/m;dz=nz/m;}
  const q=qFacing([dx,0,dz]),tx=-dz,tz=dx;
  const nrb=2+Math.floor(rng()*3),c=opt.col||FLORA.vineCol();
  for(let i=0;i<nrb;i++){const o=(i-(nrb-1)/2)*w/nrb+rr(-.1,.1)*w;
   const L=len*rr(.5,1);
   kput('curtain',[x+tx*o+dx*rr(.05,.35),y+rr(-.15,.05),z+tz*o+dx*0+dz*rr(.05,.35)],q,
    [w/nrb*rr(1.0,1.8),L,1],c.clone().multiplyScalar(rr(.82,1.12)));}
  if(rng()<.75){const o=rr(-w/2,w/2);
   kput('strand',[x+tx*o+dx*.4,y-rr(0,.2),z+tz*o+dz*.4],q,
    [rr(.14,.34),len*rr(.9,1.5),1],c.clone().multiplyScalar(.85));}
  if(opt.flowers&&rng()<.55){const fc=FLORA.bloomCol();
   for(let b=0,nb=2+Math.floor(rng()*5);b<nb;b++){const s=rr(.3,.62);
    kput('bloom',[x+tx*rr(-.5,.5)*w+dx*.45,y-rr(.2,len*.75),z+tz*rr(-.5,.5)*w+dz*.45],
     qEuler(0,rng()*TAU,0),[s,s,s],fc);}}},

 // AERIAL ROOTS off a ceiling: thin, long, hanging straight down.
 roots(x,y,z,len,w){const q=qEuler(0,rng()*TAU,0),c=FLORA.vineCol();
  kput('strand',[x,y,z],q,[w,len,1],c.clone().multiplyScalar(rr(.6,.85)));
  if(rng()<.5)kput('strand',[x+rr(-.6,.6),y,z+rr(-.6,.6)],qEuler(0,rng()*TAU,0),
   [w*rr(.5,.9),len*rr(.5,.9),1],c.clone().multiplyScalar(rr(.55,.8)));},

 // A MOSS MAT lying on a surface, or clinging under one when `down` is set.
 // Under a soffit the mat is rolled over so its face and its normal both point
 // at the ground; laid flat it would be lit from inside the concrete.
 moss(x,y,z,r,down){const s=r*rr(.7,1.3);
  kput('mossMat',[x,y+(down?-.08:.04),z],
   down?qEuler(Math.PI,rng()*TAU,0):qEuler(0,rng()*TAU,0),[s,1,s],FLORA.mossCol());},
 // Moss that has crept over an edge and dribbled down the face below it.
 lip(x,y,z,nx,nz,w,drop){const m=Math.hypot(nx,nz)||1;
  kput('mossLip',[x,y,z],qFacing([nx/m,0,nz/m]),[w,drop,w*rr(.6,1.1)],FLORA.mossCol());},

 // A FERN ROSETTE: fronds arching out of a low boss.
 fern(x,y,z,r){const n=5+Math.floor(rng()*3),c=FERNC[Math.floor(rng()*FERNC.length)];
  for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.25,.25),L=r*rr(.85,1.4);
   kput('frondA',[x,y+r*.12,z],qEuler(rr(.05,.30),-a,0),[L,L*rr(.7,1),L*rr(.7,1)],
    new THREE.Color(c).multiplyScalar(rr(.82,1.2)));}},
 // A PALM: a slim bole with a crown of fronds falling away from the top.
 palm(x,y,z,h){kput('trunk',[x,y,z],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[h*.085,h,h*.085],
   new THREE.Color(0x6a5238));
  // The crown has to be a real fraction of the bole or the palm is a bare pole
  // with a smudge on top, which is how they read at any distance at all.
  const n=8+Math.floor(rng()*3);
  for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.2,.2),L=h*rr(.46,.70);
   kput('frondA',[x,y+h*.94,z],qEuler(rr(.06,.40),-a,0),[L,L*rr(.8,1.1),L*rr(.8,1.1)],
    new THREE.Color(FERNC[i%FERNC.length]).multiplyScalar(rr(.9,1.2)));}},
 // A BUSH. Leaf cards over one squat lobe, not a bare cone: a five-sided cone
 // on grass reads as a traffic cone at any distance, which is what the
 // understorey looked like when it was cones alone. The lobe is still there to
 // give the clump a solid core so it does not go transparent at the silhouette.
 // The hue range is wide on purpose. Undergrowth mixed within a tenth of a hue
 // reads as one plant repeated, the same failure the four tree species had.
 bush(x,y,z,r,h,col){const c=col||new THREE.Color().setHSL(rr(.17,.42),rr(.26,.56),rr(.10,.30));
  kput('bushL',[x,y,z],qEuler(0,rng()*TAU,0),[r*1.5,h*.72,r*1.5],c.clone().multiplyScalar(.82));
  FLORA.mass(x,y+h*.52,z,r*1.35,2+Math.floor(rng()*2),()=>c.clone().multiplyScalar(rr(.85,1.2)),r*.7,2);
  if(rng()<.28){const fc=FLORA.bloomCol();for(let b=0;b<4;b++){const a=b*1.7+rng();
   const s=r*rr(.20,.34);
   kput('bloom',[x+Math.cos(a)*r*.8,y+h*rr(.35,.75),z+Math.sin(a)*r*.8],qEuler(0,rng()*TAU,0),[s,s,s],fc);}}},
 // A TUFT: one squashed leaf card, six triangles. The far floor cannot afford
 // a bush every 20 m out to 3.4 km, and does not need one -- past a kilometre
 // a dark tuft with a ragged edge IS a bush -- but it does need SOMETHING, or
 // the floor stops at a line and turns into lawn, which is what it did.
 tuft(x,y,z,s){kput(CLUMPN[2],[x,y+s*.28,z],qEuler(0,rng()*TAU,0),[s,s*.62,s],
   new THREE.Color().setHSL(rr(.20,.36),rr(.30,.52),rr(.09,.20)));},
 // Shelf fungus up the side of something.
 bracket(x,y,z,s){for(let b=0,n=2+Math.floor(rng()*3);b<n;b++){const sb=s*rr(.4,1);
  kput('fungus',[x+rr(-.6,.6)*s,y+rr(0,2.2)*s,z+rr(-.6,.6)*s],
   qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.4,sb],
   new THREE.Color(rng()<.5?0xa08464:0x8d6a5e));}},

 // A FULL TREE of one of the four species. `h` is its height; `opt.lod` is the
 // distance at which it will be seen, which sheds boughs and clumps -- at 3 km
 // the far trees are a canopy line, not individuals.
 tree(x,y,z,h,opt){opt=opt||{};
  const sp=opt.sp===undefined?Math.floor(rng()*4):opt.sp,S=FSPEC[sp],emerg=!!opt.emerg;
  const dd=opt.lod===undefined?Math.hypot(x,z):opt.lod,bc=FLORA.barkCol(S);
  const TK='trunk'+sp;                               // the species' own bark
  if(sp===3){                                        // the bottle trunk
   kput(TK,[x,y,z],null,[h*.30,h*.62,h*.30],bc);
   kput(TK,[x,y+h*.58,z],null,[h*.13,h*.44,h*.13],bc);
  }else kput(TK,[x,y,z],null,[h*(emerg?.09:.13),h,h*(emerg?.09:.13)],bc);
  // LOD is a CURVE, not two steps. Nearly all of a forest this size is far
  // away, so grading the canopy continuously is what buys a lush near field
  // inside the same budget: full density under 700 m, a quarter by 3 km.
  const lod=clamp(1.18-dd/2600,.22,1);
  const nb=Math.max(2,S.boughs+(emerg?1:0)-(dd>2100?1:0)-(dd>2900?1:0));
  const y0=y+h*(sp===3?.90:emerg?.80:.60);
  for(let b=0;b<nb;b++){
   const a2=b*2.3999+rr(-.3,.3),el=rr(S.el[0],S.el[1]);
   const L=h*S.crown*S.spread*rr(.78,1.18);
   const ex=x+Math.cos(a2)*Math.cos(el)*L,ez=z+Math.sin(a2)*Math.cos(el)*L,ey=y0+Math.sin(el)*L;
   const PL=dd<1400?FLORA.limb([x,y0,z],[ex,ey,ez],h*.024,h*.012,null,3,HYPERP[sp].curve,.06,'bough'+sp)
                   :[null,null,null,(beam('bough'+sp,[x,y0,z],[ex,ey,ez],h*.024,h*.024,null),[ex,ey,ez])];
   const C=PL[3];
   FLORA.mass(C[0],C[1]+L*.06,C[2],h*S.crown,Math.max(2,Math.round(4*lod)),()=>FLORA.leafCol(S),L*.30,sp);
   if(S.hang&&dd<2400){                              // racemes / pods under the crown
    const hc=new THREE.Color(S.hang);
    for(let q=0;q<3;q++)kput('strand',[ex+rr(-.3,.3)*L,ey-L*.06,ez+rr(-.3,.3)*L],
     qEuler(0,rng()*TAU,0),[h*.045,L*rr(.20,.40),1],hc);}}
  if(sp!==3)for(let q=0;q<(dd>2400?1:2);q++){        // a skirt over the shoulder
   FLORA.mass(x+rr(-.12,.12)*h,y0-h*.09,z+rr(-.12,.12)*h,h*S.crown*.74,Math.max(1,Math.round(2*lod)),()=>FLORA.leafCol(S,.88),h*S.crown*.5,sp);}},

 // A SMALL TREE, 4-60 m: what grows on a terrace, in an orchard or in a yard.
 // Same crown vocabulary as the forest -- clumps on real boughs -- so the
 // Hexahedron's growth and the jungle behind it are the same plant.
 small(x,y,z,h,sp){
  const k=sp===undefined?Math.floor(rng()*4):(sp&3),S=FSPEC[k],bc=FLORA.barkCol(S);
  // The silhouette has to differ too, or four leaf colours on one shape still
  // read as one tree: the baobab is a bottle with a flat sparse crown, the
  // ghostwood is tall and thin, the prism gum spreads wide.
  const th=[.115,.085,.125,.20][k];
  if(k===3){kput('trunk3',[x,y,z],null,[h*.22,h*.60,h*.22],bc);
            kput('trunk3',[x,y+h*.56,z],null,[h*.10,h*.46,h*.10],bc);}
  else kput('trunk'+k,[x,y,z],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[h*th,h,h*th],bc);
  const lc=FLORA.leafCol(S),wide=S.spread;
  if(h<14){                                   // too small for boughs to read
   FLORA.canopy(x,y+h*(k===3?.92:.80),z,h*.40*wide,lc,.38,k);
   FLORA.canopy(x,y+h*.60,z,h*.30*wide,lc.clone().multiplyScalar(.88),k===3?.10:.22,k);
  }else{
   const nb=(k===1?4:3)+Math.floor(rng()*2),y0=y+h*(k===3?.88:.62);
   for(let b=0;b<nb;b++){const a=b*2.3999+rr(-.3,.3),el=rr(S.el[0]+.10,S.el[1]+.20),L=h*.36*wide*rr(.8,1.2);
    const ex=x+Math.cos(a)*Math.cos(el)*L,ez=z+Math.sin(a)*Math.cos(el)*L,ey=y0+Math.sin(el)*L;
    const PL=FLORA.limb([x,y0,z],[ex,ey,ez],h*.022,h*.011,null,2,HYPERP[k].curve,.06,'bough'+k),C=PL[2];
    FLORA.canopy(C[0],C[1]+L*.08,C[2],h*.26*wide,lc,.38,k);}
   FLORA.canopy(x,y+h*.78,z,h*.28*wide,lc.clone().multiplyScalar(.9),k===3?.10:.24,k);}
  if(S&&S.hang&&rng()<.5){const hc=new THREE.Color(S.hang);
   for(let q=0;q<3;q++)kput('strand',[x+rr(-.3,.3)*h,y+h*rr(.6,.85),z+rr(-.3,.3)*h],
    qEuler(0,rng()*TAU,0),[h*.05,h*rr(.10,.20),1],hc);}},

 // THE UNDERSTOREY MIX: one plant of whatever grows in the gaps. `s` is its
 // rough size in metres. Used on the forest floor and on the terraces alike.
 // `far` drops the expensive members of the mix (palms, bracket fungus) and
 // leaves the two that still read as ground cover at 1 km, which is what makes
 // a floor pass affordable over a square kilometre and a half.
 under(x,y,z,s,kind,far){const k=kind===undefined?rng():kind;
  if(far){if(k<.55)FLORA.bush(x,y,z,s*.5,s*rr(.6,1.0));
          else FLORA.fern(x,y,z,s*rr(.45,.8));return;}
  if(k<.34)FLORA.bush(x,y,z,s*.5,s*rr(.6,1.0));
  else if(k<.64)FLORA.fern(x,y,z,s*rr(.5,.9));
  else if(k<.80)FLORA.palm(x,y,z,s*rr(1.4,2.6));
  else if(k<.90){const fc=FLORA.bloomCol();          // a flowering clump
   FLORA.bush(x,y,z,s*.34,s*rr(.4,.7));
   for(let b=0,n=2+Math.floor(rng()*3);b<n;b++){const bs=s*rr(.08,.16);
    kput('bloom',[x+rr(-.5,.5)*s,y+s*rr(.25,.55),z+rr(-.5,.5)*s],qEuler(0,rng()*TAU,0),[bs,bs,bs],fc);}}
  // No bracket fungus on open ground: a flattened hemisphere lying in grass
  // reads as a dropped white plate, and at ten thousand plants that was most
  // of what the floor showed. Brackets belong on boles and deadfall, which is
  // where the log and hypertree passes put them.
  else{FLORA.fern(x,y,z,s*rr(.35,.7));
       if(rng()<.4)FLORA.bush(x+rr(-1,1)*s,y,z+rr(-1,1)*s,s*.3,s*rr(.3,.6));}},

 // --- dressing a structure's own surfaces -------------------------------------
 // faceSamples() in 36-decor.js tests |ny|, because these shells are DoubleSide
 // and their winding is not reliably outward. That is fine for finding
 // HORIZONTAL faces and useless for telling a floor from a ceiling, so the two
 // calls below do not ask the geometry which way it faces: the CALLER passes
 // the ledges or the soffits, because the builder that made them knows. Getting
 // this wrong is what put moss on top of the underside of the lower city --
 // mats sunk into the slab, lit from inside the concrete.

 // LEDGES: what lies on a surface open to the sky. Moss mats everywhere, and
 // plants biased to the outer band where the rain and light actually reach.
 dressLedge(geos,gx,gy,gz,opt){opt=opt||{};
  const S=upFaces(geos,(opt.moss||0)+(opt.plants||0),.55);if(!S.length)return;
  let rMin=1e9,rMax=0;S.forEach(f=>{if(f.r<rMin)rMin=f.r;if(f.r>rMax)rMax=f.r;});
  const outer=f=>rMax>rMin?(f.r-rMin)/(rMax-rMin):1;
  for(let i=0;i<(opt.moss||0)&&i<S.length;i++){const f=S[i];
   FLORA.moss(gx+f.p[0],gy+f.p[1],gz+f.p[2],rr(1.2,opt.mossR||4),false);}
  for(let i=(opt.moss||0);i<S.length;i++){const f=S[i];
   if(rng()>.35+.65*outer(f))continue;               // the deep inside stays bare
   FLORA.under(gx+f.p[0],gy+f.p[1],gz+f.p[2],rr(1.0,opt.size||3),undefined);}},

 // SOFFITS: what clings to a ceiling. Moss rolled over to face the ground,
 // aerial roots and beards hanging out of it, bracket fungus, and the odd
 // curtain where the edge is. Density rises toward the rim: the middle of a
 // 300 m soffit is in permanent dark and grows almost nothing, which is the
 // rule that makes an underside read as depth rather than as texture.
 dressSoffit(geos,gx,gy,gz,opt){opt=opt||{};
  const n=opt.n||300,S=upFaces(geos,n,.55);if(!S.length)return;
  let rMin=1e9,rMax=0;S.forEach(f=>{if(f.r<rMin)rMin=f.r;if(f.r>rMax)rMax=f.r;});
  const span=Math.max(1e-6,rMax-rMin);
  S.forEach(f=>{
   const u=(f.r-rMin)/span,lit=.15+.85*Math.pow(u,1.4);  // light falls off inward
   const x=gx+f.p[0],y=gy+f.p[1],z=gz+f.p[2];
   // A FILM, not a polka dot. Two or three overlapping mats of different size
   // at every sample: one mat per point, however big, reads as a sticker.
   const R=(opt.mossR||7)*(.35+.65*lit);
   FLORA.moss(x,y,z,rr(R*.6,R),true);
   for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)
    FLORA.moss(x+rr(-1,1)*R,y-rr(0,.25),z+rr(-1,1)*R,rr(R*.25,R*.8),true);
   if(rng()<lit*.85)FLORA.roots(x,y-.15,z,rr(4,opt.hang||18)*(.35+.65*lit),rr(.5,2.2));
   if(rng()<lit*.40){const a=Math.atan2(f.p[2],f.p[0]);
    FLORA.curtain(x,y-.2,z,Math.cos(a),Math.sin(a),rr(6,opt.hang||18),rr(2,6),{flowers:rng()<.5});}
   if(rng()<.14)FLORA.bracket(x,y-rr(.5,2),z,rr(1.2,3.2));});},

 // A HYPERTREE, 120-450 m, cheap: about 1.7k triangles against the hero
 // builder's 174k. `into` is either a geometry array (the bole is merged by
 // the caller) or an object of four arrays keyed by species, so each species'
 // bole can go to its own bark material. `opt.sp` picks the species; the four
 // differ in BOLE, HABIT and CROWN, after Girder's SPECIES/TREESPEC tables:
 //   0 Ironbark   fluted buttressed bole, boughs level, dense dark tiers
 //   1 Ghostwood  slim pale bole with dark flecks, boughs rising steeply,
 //                airy yellow-green crown, violet racemes hanging under it
 //   2 Prism gum  streaked bole, the widest crown -- long near-level boughs,
 //                teal canopy shot with violet on the shaded clumps
 //   3 Baobab     swollen bottle bole, short, a flat sparse crown right at the
 //                top, orange pods
 hyper(x,z,H,into,opt){opt=opt||{};const y=terrainH(KOFF[0]+x,KOFF[2]+z);
  const sp=opt.sp===undefined?0:(opt.sp&3),S=FSPEC[sp];
  const P=HYPERP[sp];H*=P.hScale;const RB=H*P.rb;
  const rad=yy=>{const u=clamp(yy/H,0,1);return RB*P.prof(u)*(1+P.but*Math.exp(-yy/(H*.034)));};
  const dest=Array.isArray(into)?into:(into[sp]||(into[sp]=[]));
  dest.push(gridSurface((u,v)=>{const th=u*TAU,yy=Math.pow(v,.85)*H*.99;
   const r=rad(yy)*(1+P.flute*Math.pow(.5+.5*Math.cos(th*P.lobes),2)*Math.exp(-yy/(H*.09)));
   return[x+r*Math.cos(th),yy+y,z+r*Math.sin(th)];},22,16,{uS:9,vS:22}));
  const dd=opt.lod===undefined?Math.hypot(x,z):opt.lod;
  // (the flecks and streaks are in the bark textures now; the instanced
  // boxes that used to carry them were concrete blocks stuck to the bole)
  const crownCol=()=>FLORA.leafCol(S);
  for(let k=0;k<P.nb;k++){const a=k*2.3999+rr(-.3,.3),u0=rr(P.u0[0],P.u0[1]);
   const y0=y+H*u0,r0=rad(H*u0),L=H*rr(P.L[0],P.L[1]),el=rr(P.el[0],P.el[1]);
   const ex=x+Math.cos(a)*(r0+Math.cos(el)*L),ez=z+Math.sin(a)*(r0+Math.cos(el)*L);
   const ey=y0+Math.sin(el)*L;
   const PL=FLORA.limb([x+Math.cos(a)*r0,y0,z+Math.sin(a)*r0],[ex,ey,ez],H*P.bw,H*P.bw*.45,null,5,P.curve,.05,'bough'+sp);
   // The clumps are spread over the OUTER HALF of the bough, not bunched at its
   // tip: a hypertree's crown is a mass hanging along the limb, and a tip-only
   // crown reads as a bare umbrella frame from any distance. The mass is
   // centred on the curve, so a drooping bough carries its crown low.
   const C=PL[Math.round(5*.7)];
   FLORA.canopy(C[0],C[1]-L*.02,C[2],L*P.cr,crownCol,(dd>2200?.45:1)*P.dens,sp);
   if(S.hang&&dd<2400){const hc=new THREE.Color(S.hang);   // racemes / pods
    for(let q=0,n=sp===1?6:3;q<n;q++)kput('strand',[lerp(x,ex,rr(.45,1))+rr(-.2,.2)*L,ey-L*.05,lerp(z,ez,rr(.45,1))+rr(-.2,.2)*L],
     qEuler(0,rng()*TAU,0),[H*.02,L*rr(sp===1?.18:.08,sp===1?.34:.16),1],hc);}
   if(dd<1800&&rng()<P.curt)FLORA.curtain(ex,ey-H*.02,ez,Math.cos(a),Math.sin(a),H*rr(.03,.09),H*.02,{});}
  // the ghostwood and the prism gum carry a top tuft; the baobab's crown IS the top
  if(P.top)FLORA.canopy(x,y+H*.98,z,H*P.top,crownCol,P.dens*.8,sp);
  for(let k=0;k<P.roots;k++){const a=k/P.roots*TAU+rr(-.2,.2);   // buttress roots
   beam('bough',[x+Math.cos(a)*RB*.8,y+H*.05,z+Math.sin(a)*RB*.8],
    [x+Math.cos(a)*RB*(sp===3?2.2:3.4),y+.6,z+Math.sin(a)*RB*(sp===3?2.2:3.4)],RB*.22,RB*.22,FLORA.barkCol(S));}
  // moss beards and bracket fungus up the bole, where the jungle damp sits
  if(dd<1600)for(let k=0,n=Math.round(rr(4,9));k<n;k++){const a=rng()*TAU,yy=rr(.08,.5)*H;
   const r=rad(yy)*1.02;
   FLORA.roots(x+Math.cos(a)*r,y+yy,z+Math.sin(a)*r,rr(3,12),rr(.4,1.4));}
  if(dd<1200)for(let k=0;k<3;k++){const a=rng()*TAU,yy=rr(.03,.22)*H,r=rad(yy);
   FLORA.bracket(x+Math.cos(a)*r,y+yy,z+Math.sin(a)*r,rr(1.2,3));}},
};
