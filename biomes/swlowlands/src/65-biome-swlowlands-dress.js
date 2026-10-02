// ================================================================= SOUTHWESTERN LOWLANDS — growth on structures
// What the lowlands do to a building left in them (the hyperjungle kit's pass,
// in this biome's palette): moss on the ledges, Spanish moss hanging off every
// edge and soffit, strangler figs rooting in the joints and sending their
// roots down the walls, staghorn ferns and bromeliads perched on the ledges,
// azalea and heliconia colour. The host hands over its shells as
// BufferGeometry[] in world space; this pass samples their faces (BIO.upFaces
// / downFaces / sideFaces / ledgePoints) and grows on them. It never touches
// the geometry -- a plant is never part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SWLOW.PAL;
const C=hex=>new BIO.host.THREE.Color(hex);
const vcol=()=>C(pick(PAL.vine)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.05,.05));
const mcol=()=>C(pick(PAL.moss)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.06,.04));
const bloomCol=()=>C(pick(rng()<.5?PAL.azalea:PAL.heliconia));
const beardCol=()=>C(pick(PAL.mossPale)).multiplyScalar(rr(1.1,1.35));

// a MOSS PATCH lying on a surface with normal n (up for a ledge, down for a soffit)
function moss(p,n,r){const q=qUp(n);const s=r*rr(.7,1.3);
 BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],q,[s,1,s],mcol());}
// a HANGING CURTAIN off a point: 2-4 ribbons side by side across w, facing (dx,dz),
// a trailing strand, and the odd flower
function curtain(p,dx,dz,len,w,opt){opt=opt||{};const m=Math.hypot(dx,dz);
 if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,nrb=2+Math.floor(rng()*3),c=opt.col||vcol();
 for(let i=0;i<nrb;i++){const o=(i-(nrb-1)/2)*w/nrb+rr(-.1,.1)*w,L=len*rr(.5,1);
  BIO.put('ribbon',[p[0]+tx*o+dx*rr(.05,.35),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.05,.35)],q,[w/nrb*rr(1,1.8),L,1],c.clone().multiplyScalar(rr(.82,1.12)));}
 if(rng()<.75){const o=rr(-w/2,w/2);BIO.put('strand',[p[0]+tx*o+dx*.4,p[1]-rr(0,.2),p[2]+tz*o+dz*.4],q,[rr(.14,.34),len*rr(.9,1.5),1],c.clone().multiplyScalar(.85));}
 if(opt.flowers&&rng()<.55){const fc=bloomCol();for(let b=0,nb=2+Math.floor(rng()*5);b<nb;b++){const s=rr(.3,.62);
  BIO.put('bloom',[p[0]+tx*rr(-.5,.5)*w+dx*.45,p[1]-rr(.2,len*.75),p[2]+tz*rr(-.5,.5)*w+dz*.45],qEuler(0,rng()*TAU,0),[s,s,s],fc);}}}
// AERIAL ROOTS off a ceiling: thin, long, hanging straight down
function roots(p,len,w){const q=qEuler(0,rng()*TAU,0),c=vcol();
 for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)BIO.put('strand',[p[0]+rr(-w,w),p[1],p[2]+rr(-w,w)],q,[rr(.1,.3),len*rr(.6,1.2),1],c.clone().multiplyScalar(rr(.8,1.1)));}
// BRACKET FUNGUS on the side of something
function bracket(p,n,s){for(let b=0,nb=2+Math.floor(rng()*3);b<nb;b++){const sb=s*rr(.4,1);
 BIO.put('fungus',[p[0]+n[0]*.2+rr(-.6,.6)*s*(1-Math.abs(n[0])),p[1]+rr(0,2.2)*s,p[2]+n[2]*.2+rr(-.6,.6)*s*(1-Math.abs(n[2]))],
  qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}}
// a PLANT on a ledge: fern rosette, tuft or small bush
function plant(p,s){const k=rng();const y=p[1];
 if(k<.12){const c=C(pick(PAL.aroid));BIO.put('brom',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s*.4,s*.45,s*.4],c.clone().multiplyScalar(rr(.8,1)));}
 else if(k<.45){const n=5+Math.floor(rng()*3),c=C(pick(PAL.fern));for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.25,.25),L=s*rr(.85,1.4);
  BIO.put('frond',[p[0],y+s*.12,p[2]],qEuler(rr(.05,.30),-a,0),[L,L*rr(.7,1),L*rr(.7,1)],c.clone().multiplyScalar(rr(.82,1.2)));}}
 else if(k<.8){const c=C(pick(PAL.fern)).offsetHSL(rr(-.08,.08),0,rr(-.05,.08));
  BIO.put('ucard',[p[0],y+s*.35,p[2]],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),[s*1.2,s*.9,s*1.2],c);}
 else{const c=C(pick(PAL.fern)).offsetHSL(rr(-.1,.1),.05,.02);
  BIO.put('lobe',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s,s*.7,s],c.clone().multiplyScalar(.82));
  for(let i=0;i<2;i++)BIO.put('ucard',[p[0]+rr(-.4,.4)*s,y+s*.5,p[2]+rr(-.4,.4)*s],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s*1.3,s,s*1.3],c.clone().multiplyScalar(rr(.9,1.2)));}}
// a SMALL TREE on a ledge: a tree fern, 4-12 m
function smallTree(p,h){const S=SWLOW.SPECIES[6],rb=h*.035+.2,rc=C(pick(S.bark)).multiplyScalar(.7);
 BIO.put('trunk2',[p[0],p[1],p[2]],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rb/.4,h,rb/.4],rc);
 for(let i=0,n=2+Math.floor(rng()*4);i<n;i++){const a=rng()*TAU,d=rr(.5,2.5);BIO.beam('rod',[p[0]+Math.cos(a)*d*.3,p[1]+h*rr(.4,.9),p[2]+Math.sin(a)*d*.3],[p[0]+Math.cos(a)*d,p[1]-.1,p[2]+Math.sin(a)*d],rr(.04,.1),null,rc);}
 const n=4+Math.floor(rng()*4),R=h*.35;
 for(let i=0;i<n;i++){const a=rng()*TAU,d=R*Math.sqrt(rng()),s=R*rr(.8,1.2);BIO.put('glossy',[p[0]+Math.cos(a)*d,p[1]+h*rr(.75,1.05),p[2]+Math.sin(a)*d],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s,s*.6,s],C(pick(S.leaf)).multiplyScalar(rr(1.1,1.4)),{n:[0,1,0]});}}
// LEDGES: moss on the flat, plants toward the outer edge, lips and curtains off the edge
SWLOW.dressLedges=function(geos,opt){opt=opt||{};
 const nM=opt.moss||400,nP=opt.plants||300,nE=opt.edges||140;
 BIO.upFaces(geos,nM,.6).forEach(f=>moss(f.p,f.n,rr(1.2,opt.mossR||3.5)));
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<.12)smallTree(f.p,rr(4,opt.treeH||12));else plant(f.p,rr(1,opt.size||3));});
 BIO.ledgePoints(geos,nE,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];
  moss([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(1,2.2));
  if(rng()<.7)curtain(p,l.n[0],l.n[2],rr(4,opt.hang||16),rr(2,5),{flowers:rng()<.4});
  if(rng()<.6)for(let b=0,nb=1+Math.floor(rng()*3);b<nb;b++)BIO.put('beard',[p[0]+rr(-1,1),p[1],p[2]+rr(-1,1)],qEuler(0,rng()*TAU,0),[rr(1,2.2),rr(2,6),1],beardCol());});};
// SOFFITS: moss rolled over to face the ground, roots and beards hanging out of
// it, brackets, curtains where the rim is. Density rises toward the rim: the
// middle of a big underside is in permanent dark and grows almost nothing.
SWLOW.dressSoffits=function(geos,opt){opt=opt||{};
 const S=BIO.downFaces(geos,opt.n||400,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax,lit=.15+.85*Math.pow(u,1.4);const R=(opt.mossR||5)*(.35+.65*lit);
  const dn=[0,-1,0];moss(f.p,dn,rr(R*.6,R));
  for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)moss([f.p[0]+rr(-1,1)*R,f.p[1]-rr(0,.2),f.p[2]+rr(-1,1)*R],dn,rr(R*.25,R*.8));
  if(rng()<lit*.85)roots([f.p[0],f.p[1]-.15,f.p[2]],rr(4,opt.hang||16)*(.35+.65*lit),rr(.5,2.2));
  if(rng()<lit*.6)BIO.put('beard',[f.p[0]+rr(-1,1),f.p[1]-.1,f.p[2]+rr(-1,1)],qEuler(0,rng()*TAU,0),[rr(1.2,2.4),rr(2,7)*(.4+.6*lit),1],beardCol());
  if(rng()<lit*.40)curtain([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(5,opt.hang||16),rr(2,6),{flowers:rng()<.5});
  if(rng()<.14)bracket([f.p[0],f.p[1]-rr(.5,2),f.p[2]],[0,0,0],rr(1,2.6));});};
// WALLS: vines climbing, brackets, moss streaks under the drips
SWLOW.dressWalls=function(geos,opt){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(k<.2){const q=qFacing([f.n[0],0,f.n[2]]);for(let r=0,nr=2+Math.floor(rng()*3);r<nr;r++)BIO.put('strand',[f.p[0]+f.n[0]*.2+rr(-1,1)*(1-Math.abs(f.n[0])),f.p[1]+rr(0,3),f.p[2]+f.n[2]*.2+rr(-1,1)*(1-Math.abs(f.n[2]))],q,[rr(.15,.35),rr(4,opt.hang||12),1],C(0x8a8a78).multiplyScalar(rr(.6,.85)));}
  else if(k<.45)curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(3,opt.hang||12),rr(1.5,4),{});
  else if(k<.7)bracket([f.p[0],f.p[1],f.p[2]],f.n,rr(.8,2.2));
  else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.8,2));});};
// the dressing is drawn within SWLOW.LOD.dress of the camera (runtime LOD, by chunk; opt.range overrides it)
SWLOW.dressGeos=function(geos,opt){opt=opt||{};reseed(650001+(opt.seed||0));const r0=BIO.range;BIO.range=opt.range||SWLOW.LOD.dress;
 SWLOW.dressLedges(geos,opt.ledges||{});SWLOW.dressSoffits(geos,opt.soffits||{});SWLOW.dressWalls(geos,opt.walls||{});BIO.range=r0;};
})();
