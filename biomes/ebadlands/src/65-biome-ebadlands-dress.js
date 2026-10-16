// ================================================================= EASTERN BADLANDS — growth on structures
// What the green canyons do to a building left in them: Zion's HANGING GARDENS. Where water seeps out under a ledge,
// curtains of maidenhair fern hang down the face, dotted with scarlet monkeyflower and golden columbine; canyon grape
// drapes the edges in leafy curtains with dark clusters; a rose weeper's pink strands spill off the odd high ledge;
// moss streaks the walls under every drip and lichen crusts the dry tops; grass, phlox, ferns and the odd maple or oak
// sapling root on the ledges. The host hands over its shells as BufferGeometry[] in world space; this pass samples their
// faces (BIO.upFaces / downFaces / sideFaces / ledgePoints) and grows on them. It never touches the geometry: a plant is
// never part of a building (README.md), and every plant here is a tagged one (EBADLANDS.PLANTS, SPECIES).
//
//   EBADLANDS.dress(geos, {seed, ledges:{n, plants, edges, hang}, soffits:{n, hang}, walls:{n, hang}})
//   returns {curtains, vines, drapes, plants, lichen}: what it grew (the host's probe checks the counts)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=EBADLANDS.PAL,C=EBADLANDS.C,SPK=EBADLANDS.byKey;
const {bright,shade,vary,leafCol}=EBADLANDS,{tuft,card,grass,phlox}=EBADLANDS.small;
let st=null;
// how far a thing hung from p may fall before it reaches the ground (a curtain never runs into the earth); a sample
// at or under the ground (a pier's footing, a wall's buried course) grows nothing
const drop=p=>p[1]-BIO.terrainH(p[0],p[2])-.25,above=p=>drop(p)>.3;

// a crust or a moss pad lying on a surface with normal n
function crust(p,n,r,set){const s=r*rr(.7,1.3);BIO.put('lichen',[p[0]+n[0]*.04,p[1]+n[1]*.04,p[2]+n[2]*.04],qUp(n),[s,1,s],leafCol(set,1.05,.03,.1,.06));st.lichen++;}
// a HANGING-GARDEN CURTAIN hung from p, facing out along (dx,dz): maidenhair ribbons side by side, blooms dotted on them
function curtain(p,dx,dz,len,w){len=Math.min(len,drop(p));if(len<.6)return;const m=Math.hypot(dx,dz)||1;dx/=m;dz/=m;const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,n=ri(2,4),c=vary(pick(PAL.maiden),.03,.08,.05);
 for(let i=0;i<n;i++){const o=(i-(n-1)/2)*w/n+rr(-.1,.1)*w,L=len*rr(.55,1),x=p[0]+tx*o+dx*rr(.05,.2),y=p[1]+rr(-.1,.05),z=p[2]+tz*o+dz*rr(.05,.2);
  BIO.put('maiden',[x,y,z],q,[w/n*rr(.9,1.4),L,1],bright(c,rr(.95,1.2)));
  for(let k=0,b=ri(1,4);k<b;k++){const t=rr(.15,.85),set=rng()<.65?PAL.monkey:PAL.columbine;   // monkeyflower, columbine
   BIO.put('bloom',[x+tx*rr(-.3,.3)+dx*.08,y-L*t,z+tz*rr(-.3,.3)+dz*.08],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.09,.16),bright(vary(pick(set),.02,.08,.05),1.15));}}
 st.curtains++;}
// a rose weeper's pink strands spilling off a high ledge
function drape(p,dx,dz,len){len=Math.min(len,drop(p));if(len<.8)return;const m=Math.hypot(dx,dz)||1;dx/=m;dz/=m;const c=pick(SPK.weeper.leaf);
 for(let i=0,n=ri(2,4);i<n;i++){const o=rr(-.6,.6);BIO.put('weep',[p[0]-dz*o+dx*.15,p[1],p[2]+dx*o+dz*.15],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[rr(.9,1.4),len*rr(.6,1),1],bright(vary(c,.03,.08,.06),1.2));}
 st.drapes++;}
// a plant on a ledge of size s: grass, a phlox cushion, a fern, or (rarely) a maple or gambel-oak sapling
function plant(p,s){const k=rng(),y=p[1];
 if(k<.35)grass(p[0],y,p[2],2,s*.8);
 else if(k<.55)phlox(p[0],y,p[2],2);
 else if(k<.8){const L=rr(.4,.9)*s;for(let i=0,n=ri(4,7);i<n;i++)BIO.put('fern',[p[0],y+.04,p[2]],qEuler(rr(-.1,.1),-i/n*TAU,rr(.2,.6)),[L,L*.8,L],leafCol(PAL.fern,1.3,.03,.08,.05));}
 else{const S=rng()<.5?SPK.maple:SPK.oak,h=rr(1.4,3)*s,c=pick(S.leaf);
  BIO.beam('rod',[p[0],y-.05,p[2]],[p[0]+rr(-.2,.2),y+h,p[2]+rr(-.2,.2)],.07,.03,shade(C(pick(S.bark)),-.15));
  for(let i=0,n=ri(3,6);i<n;i++){const a=rr(0,TAU),d=rr(.1,.5)*h*.4;BIO.put(S.key==='maple'?'lobed':'lobed',[p[0]+Math.cos(a)*d,y+h*rr(.55,1),p[2]+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),h*rr(.28,.4),bright(vary(c,.03,.08,.06),1.25),{n:[Math.cos(a)*.4,.9,Math.sin(a)*.4]});}}
 st.plants++;}
// LEDGES: lichen on the dry flats, plants toward the edge; off the edges, the hanging garden, grape and the weeper's strands
EBADLANDS.dressLedges=function(geos,o){o=o||{};
 BIO.upFaces(geos,o.n||300,.6).forEach(f=>{const r=rr(.5,1.6),c=rng()<.6?PAL.lichen:PAL.moss;if(above(f.p))crust(f.p,f.n,r,c);});
 BIO.upFaces(geos,o.plants||160,.6).forEach(f=>{const s2=rr(.7,1.3);if(above(f.p))plant(f.p,s2);});
 BIO.ledgePoints(geos,o.edges||120,1.6).forEach(l=>{const p=[l.p[0]+l.n[0]*.25,l.p[1]-.05,l.p[2]+l.n[2]*.25],k=rng(),len=rr(1.5,o.hang||5);
  if(k<.5)curtain(p,l.n[0],l.n[2],len,rr(1.2,2.6));
  else if(k<.8){const L=Math.min(len*rr(.7,1.1),drop(p));if(L>.8)EBADLANDS.hangVine(p[0],p[1],p[2],L,rr(.9,1.6),st);}
  else if(k<.9)drape(p,l.n[0],l.n[2],len*1.2);});};
// SOFFITS: the seep line: dense curtains toward the rim, moss pads inside
EBADLANDS.dressSoffits=function(geos,o){o=o||{};
 const S=BIO.downFaces(geos,o.n||160,.6).filter(f=>above(f.p));if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax;if(!above(f.p))return;
  if(rng()<.5)crust(f.p,[0,-1,0],rr(.4,1.2),PAL.moss);
  if(rng()<.15+.5*u)curtain([f.p[0],f.p[1]-.1,f.p[2]],f.p[0]-cx||1,f.p[2]-cz,rr(1.2,o.hang||4),rr(1,2));});};
// WALLS: moss streaks and lichen, a fern or a short curtain from a crack
EBADLANDS.dressWalls=function(geos,o){o=o||{};
 BIO.sideFaces(geos,o.n||200).forEach(f=>{const k=rng(),p=[f.p[0]+f.n[0]*.06,f.p[1],f.p[2]+f.n[2]*.06];if(!above(p))return;
  if(k<.55)crust(p,f.n,rr(.4,1.3),rng()<.5?PAL.moss:PAL.lichen);
  else if(k<.8){const L=rr(.4,.8);for(let i=0,n=ri(3,5);i<n;i++)BIO.put('fern',p,qEuler(rr(-.2,.2),Math.atan2(-f.n[2],f.n[0])+rr(-.9,.9),rr(-.6,-.1)),[L,L*.8,L],leafCol(PAL.maiden,1.25,.03,.08,.05));st.plants++;}
  else curtain([p[0]+f.n[0]*.2,p[1],p[2]+f.n[2]*.2],f.n[0],f.n[2],rr(.8,o.hang||3),rr(.6,1.4));});};
EBADLANDS.dressGeos=function(geos,opt){opt=opt||{};reseed(650031+(opt.seed||0));st={curtains:0,vines:0,drapes:0,plants:0,lichen:0,fruit:0};
 EBADLANDS.dressLedges(geos,opt.ledges);EBADLANDS.dressSoffits(geos,opt.soffits);EBADLANDS.dressWalls(geos,opt.walls);return st;};
})();
