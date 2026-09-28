// ================================================================= THE RIFT — growth on structures
// What the Rift jungle does to a building left in it (the hyperjungle kit's
// pass, in this biome's palette: the mosses carry the lake's yellow tinge, the
// flowers are anemones and urchins in its complement, the ledge trees are
// tree-ferns and curl succulents). The host hands over its shells as
// BufferGeometry[] in world space; this pass samples their faces
// (BIO.upFaces / downFaces / sideFaces / ledgePoints) and grows on them. It
// never touches the geometry -- a plant is never part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=RIFT.PAL;PAL.vine=PAL.vine||[0x3d5a2a,0x2f4a24,0x4a6a30,0x3a5a4a];
const C=hex=>new BIO.host.THREE.Color(hex);
const vcol=()=>C(pick(PAL.vine)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.05,.05));
const mcol=()=>C(pick(PAL.moss)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.06,.04));
const bloomCol=()=>C(pick(PAL.comp));
const iridC2=()=>C(pick(PAL.irid.GP)).lerp(C(pick(PAL.jungleGreen)),.4);

// a MOSS PATCH lying on a surface with normal n (up for a ledge, down for a soffit)
function moss(p,n,r){const q=qUp(n);const s=r*rr(.7,1.3);
 BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],q,[s,1,s],mcol());}
// a HANGING CURTAIN off a point: 2-4 ribbons side by side across w, facing (dx,dz), a trailing strand, and the odd flower
function curtain(p,dx,dz,len,w,opt){opt=opt||{};const m=Math.hypot(dx,dz);
 if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,nrb=2+Math.floor(rng()*3),c=opt.col||vcol();
 for(let i=0;i<nrb;i++){const o=(i-(nrb-1)/2)*w/nrb+rr(-.1,.1)*w,L=len*rr(.5,1);
  BIO.put('ribbon',[p[0]+tx*o+dx*rr(.05,.35),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.05,.35)],q,[w/nrb*rr(1,1.8),L,1],c.clone().multiplyScalar(rr(.82,1.12)));}
 if(rng()<.75){const o=rr(-w/2,w/2);BIO.put('strand',[p[0]+tx*o+dx*.4,p[1]-rr(0,.2),p[2]+tz*o+dz*.4],q,[rr(.14,.34),len*rr(.9,1.5),1],c.clone().multiplyScalar(.85));}
 if(opt.flowers&&rng()<.55){const fc=bloomCol(),item=rng()<.5?'anemone':'urchin';for(let b=0,nb=2+Math.floor(rng()*5);b<nb;b++){const s=rr(.35,.7);
  BIO.put(item,[p[0]+tx*rr(-.5,.5)*w+dx*.45,p[1]-rr(.2,len*.75),p[2]+tz*rr(-.5,.5)*w+dz*.45],qEuler(0,rng()*TAU,0),[s,s,s],fc);}}}
// AERIAL ROOTS off a ceiling: thin, long, hanging straight down
function roots(p,len,w){const q=qEuler(0,rng()*TAU,0),c=vcol();
 for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)BIO.put('strand',[p[0]+rr(-w,w),p[1],p[2]+rr(-w,w)],q,[rr(.1,.3),len*rr(.6,1.2),1],c.clone().multiplyScalar(rr(.8,1.1)));}
// BRACKET FUNGUS on the side of something
function bracket(p,n,s){for(let b=0,nb=2+Math.floor(rng()*3);b<nb;b++){const sb=s*rr(.4,1);
 BIO.put('fungus',[p[0]+n[0]*.2+rr(-.6,.6)*s*(1-Math.abs(n[0])),p[1]+rr(0,2.2)*s,p[2]+n[2]*.2+rr(-.6,.6)*s*(1-Math.abs(n[2]))],
  qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}}
// a PLANT on a ledge: an iridescent rosette, a curl, a tuft of scale-moss or a small bush
function plant(p,s){const k=rng();const y=p[1];
 if(k<.35){BIO.put('irosette',[p[0],y,p[2]],qEuler(rr(-.08,.08),rng()*TAU,rr(-.08,.08)),[s*.8,s*.7,s*.8],C(pick(PAL.jungleGreen)),{c2:iridC2()});}
 else if(k<.6){for(let i=0,n=1+Math.floor(rng()*3);i<n;i++){const a=rng()*TAU,d=i?rr(.2,.6):0,h=s*rr(.8,1.4);BIO.put('curl',[p[0]+Math.cos(a)*d,y,p[2]+Math.sin(a)*d],qEuler(rr(-.15,.15),rng()*TAU,rr(-.15,.15)),[h,h,h],C(pick(PAL.tealGreen)),{c2:C(pick(PAL.irid.GB))});}}
 else if(k<.7){BIO.put('zebra',[p[0],y,p[2]],qEuler(rr(-.08,.08),rng()*TAU,rr(-.08,.08)),[s*.6,s*.45,s*.6],C(0xffffff).lerp(C(0xe0a0c0),.5));}
 else if(k<.8){BIO.put('clubmoss',[p[0],y-.05,p[2]],qEuler(0,rng()*TAU,0),[s*1.6,s*.6,s*1.6],C(pick(PAL.yellowGreen)),{c2:iridC2()});}
 else{const c=C(pick(PAL.jungleGreen)).offsetHSL(rr(-.1,.1),.05,.02);
  BIO.put('lobe',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s,s*.7,s],c.clone().multiplyScalar(.82));
  for(let i=0;i<2;i++)BIO.put('ucard',[p[0]+rr(-.4,.4)*s,y+s*.5,p[2]+rr(-.4,.4)*s],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s*1.3,s,s*1.3],c.clone().multiplyScalar(rr(.9,1.2)));}}
// a SMALL TREE on a ledge: a tree-fern, 4-10 m
function smallTree(p,h){const S=RIFT.SPECIES[28],rb=h*.04+.25;
 BIO.put('trunk',[p[0],p[1],p[2]],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[rb/.4,h,rb/.4],C(pick(S.bark)));
 const n=8+Math.floor(rng()*5),R=h*.45,a0=rng()*TAU,c=C(pick(S.leaf));
 for(let i=0;i<n;i++){const a=a0+i/n*TAU+rr(-.2,.2),L=R*rr(.85,1.1);BIO.put('bigfrond',[p[0],p[1]+h,p[2]],qEuler(rr(-.1,.1),-a,rr(-.1,.3)),[L,L,L*1.25],c.clone().multiplyScalar(rr(1.2,1.5)));}}
// LEDGES: moss on the flat, plants toward the outer edge, lips and curtains off the edge
RIFT.dressLedges=function(geos,opt){opt=opt||{};
 const nM=opt.moss||400,nP=opt.plants||300,nE=opt.edges||140;
 BIO.upFaces(geos,nM,.6).forEach(f=>moss(f.p,f.n,rr(1.2,opt.mossR||3.5)));
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<.12)smallTree(f.p,rr(4,opt.treeH||10));else plant(f.p,rr(1,opt.size||3));});
 BIO.ledgePoints(geos,nE,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];
  moss([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(1,2.2));
  if(rng()<.7)curtain(p,l.n[0],l.n[2],rr(4,opt.hang||16),rr(2,5),{flowers:rng()<.4});});};
// SOFFITS: moss rolled over to face the ground, roots and beards hanging out of it, brackets, curtains where the rim is
RIFT.dressSoffits=function(geos,opt){opt=opt||{};
 const S=BIO.downFaces(geos,opt.n||400,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax,lit=.15+.85*Math.pow(u,1.4);const R=(opt.mossR||5)*(.35+.65*lit);
  const dn=[0,-1,0];moss(f.p,dn,rr(R*.6,R));
  for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)moss([f.p[0]+rr(-1,1)*R,f.p[1]-rr(0,.2),f.p[2]+rr(-1,1)*R],dn,rr(R*.25,R*.8));
  if(rng()<lit*.85)roots([f.p[0],f.p[1]-.15,f.p[2]],rr(4,opt.hang||16)*(.35+.65*lit),rr(.5,2.2));
  if(rng()<lit*.40)curtain([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(5,opt.hang||16),rr(2,6),{flowers:rng()<.5});
  if(rng()<.14)bracket([f.p[0],f.p[1]-rr(.5,2),f.p[2]],[0,0,0],rr(1,2.6));});};
// WALLS: vines climbing, brackets, moss streaks under the drips
RIFT.dressWalls=function(geos,opt){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(k<.45)curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(3,opt.hang||12),rr(1.5,4),{});
  else if(k<.7)bracket([f.p[0],f.p[1],f.p[2]],f.n,rr(.8,2.2));
  else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.8,2));});};
RIFT.dressGeos=function(geos,opt){opt=opt||{};reseed(650001+(opt.seed||0));
 RIFT.dressLedges(geos,opt.ledges||{});RIFT.dressSoffits(geos,opt.soffits||{});RIFT.dressWalls(geos,opt.walls||{});};
})();
