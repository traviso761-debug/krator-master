// ================================================================= NORTH-WEST BAY — growth on structures
// What the bay jungle does to a building left in it, and what it does to the
// KARST: the hyperjungle kit's pass in this biome's palette (the mosses carry
// the bay's tinge, the flowers and rosettes on every ledge are the red and
// purple of the epiphytes, the ledge trees are tree ferns), plus, with
// opt.karst, the cliff treatment: CURTAIN FIGS on the ledges (a glossy crown
// on a stub with its roots dropped over the edge), root curtains and lianas
// off the rim and the ledges, ferns and moss streaks on the faces, beards
// under the notch. The host hands over its shells as BufferGeometry[] in world
// space; this pass samples their faces (BIO.upFaces / downFaces / sideFaces /
// ledgePoints) and grows on them. It never touches the geometry -- a plant is
// never part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NWBAY.PAL;PAL.vine=PAL.vine||[0x3d5a2a,0x2f4a24,0x4a6a30];
const C=hex=>new BIO.host.THREE.Color(hex);
const vcol=()=>C(pick(PAL.vine)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.05,.05));
const mcol=()=>C(pick(PAL.moss)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.06,.04));
const rcol=()=>C(pick(PAL.root)).offsetHSL(rr(-.02,.02),rr(-.06,.06),rr(-.05,.05));
const bloomCol=()=>C(pick(PAL.bloom));
const epiCol=()=>C(pick(PAL.epi)).offsetHSL(rr(-.02,.02),rr(-.08,.08),rr(-.05,.05));
const gcol=()=>C(pick(PAL.glossy)).offsetHSL(rr(-.02,.02),rr(-.06,.06),rr(-.04,.04)).multiplyScalar(1.3);

// a MOSS PATCH lying on a surface with normal n (up for a ledge, down for a soffit)
function moss(p,n,r){const q=qUp(n);const s=r*rr(.7,1.3);
 BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],q,[s,1,s],mcol());}
// a HANGING CURTAIN off a point: 2-4 ribbons side by side across w, facing (dx,dz),
// a trailing strand, and the odd flower. On the karst a curtain is roots and lianas.
function curtain(p,dx,dz,len,w,opt){opt=opt||{};const m=Math.hypot(dx,dz);
 if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,nrb=2+Math.floor(rng()*3),k=rng(),karst=opt.karst;
 const item=karst?(k<.45?'liana':k<.8?'strand':'epihang'):(k<.4?'epihang':'ribbon');
 const c=opt.col||(item==='epihang'?epiCol():item==='strand'?rcol():vcol());
 for(let i=0;i<nrb;i++){const o=(i-(nrb-1)/2)*w/nrb+rr(-.1,.1)*w,L=len*rr(.5,1);
  BIO.put(item,[p[0]+tx*o+dx*rr(.05,.35),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.05,.35)],q,[w/nrb*rr(1,1.8)*(item==='strand'?.4:1),L,1],c.clone().multiplyScalar(rr(.82,1.12)));}
 if(rng()<.75){const o=rr(-w/2,w/2);BIO.put('strand',[p[0]+tx*o+dx*.4,p[1]-rr(0,.2),p[2]+tz*o+dz*.4],q,[rr(.14,.34),len*rr(.9,1.5),1],(karst?rcol():c).clone().multiplyScalar(.85));}
 if(opt.flowers&&rng()<.55){const fc=bloomCol();for(let b=0,nb=2+Math.floor(rng()*5);b<nb;b++){const s=rr(.3,.62);
  BIO.put('bloom',[p[0]+tx*rr(-.5,.5)*w+dx*.45,p[1]-rr(.2,len*.75),p[2]+tz*rr(-.5,.5)*w+dz*.45],qEuler(0,rng()*TAU,0),[s,s,s],fc);}}}
// AERIAL ROOTS off a ceiling: thin, long, hanging straight down
function roots(p,len,w){const q=qEuler(0,rng()*TAU,0),c=rcol();
 for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)BIO.put('strand',[p[0]+rr(-w,w),p[1],p[2]+rr(-w,w)],q,[rr(.1,.3),len*rr(.6,1.2),1],c.clone().multiplyScalar(rr(.8,1.1)));}
// BRACKET FUNGUS on the side of something
function bracket(p,n,s){for(let b=0,nb=2+Math.floor(rng()*3);b<nb;b++){const sb=s*rr(.4,1);
 BIO.put('fungus',[p[0]+n[0]*.2+rr(-.6,.6)*s*(1-Math.abs(n[0])),p[1]+rr(0,2.2)*s,p[2]+n[2]*.2+rr(-.6,.6)*s*(1-Math.abs(n[2]))],
  qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}}
// a PLANT on a ledge: fern rosette, tuft or small bush
function plant(p,s){const k=rng();const y=p[1];
 if(k<.30){const n=1+Math.floor(rng()*3);for(let i=0;i<n;i++){const r=s*rr(.35,.7);BIO.put('epi',[p[0]+rr(-.5,.5)*s,y,p[2]+rr(-.5,.5)*s],qUp([rr(-.2,.2),1,rr(-.2,.2)]),[r,r*.8,r],epiCol());}
  if(rng()<.5){const fc=bloomCol();for(let b=0;b<3;b++)BIO.put('bloom',[p[0]+rr(-.5,.5)*s,y+s*.3,p[2]+rr(-.5,.5)*s],qEuler(0,rng()*TAU,0),[.35,.35,.35],fc);}}
 else if(k<.6){const n=5+Math.floor(rng()*3),c=C(pick(PAL.fern));for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.25,.25),L=s*rr(.85,1.4);
  BIO.put('frond',[p[0],y+s*.12,p[2]],qEuler(rr(.05,.30),-a,0),[L,L*rr(.7,1),L*rr(.7,1)],c.clone().multiplyScalar(rr(.82,1.2)));}}
 else if(k<.8){const c=C(pick(PAL.fern)).offsetHSL(rr(-.08,.08),0,rr(-.05,.08));
  BIO.put('ucard',[p[0],y+s*.35,p[2]],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),[s*1.2,s*.9,s*1.2],c);}
 else{const c=C(pick(PAL.fern)).offsetHSL(rr(-.1,.1),.05,.02);
  BIO.put('lobe',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s,s*.7,s],c.clone().multiplyScalar(.82));
  for(let i=0;i<2;i++)BIO.put('ucard',[p[0]+rr(-.4,.4)*s,y+s*.5,p[2]+rr(-.4,.4)*s],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s*1.3,s,s*1.3],c.clone().multiplyScalar(rr(.9,1.2)));}}
// a SMALL TREE on a ledge: a tree fern, 4-12 m; on the karst as often a CURTAIN FIG --
// a glossy crown on a stub, roots dropped over the edge in the direction given
function smallTree(p,h,karst,out){const S=NWBAY.SPECIES[4],rb=h*.04+.25;
 if(karst&&rng()<.55){const F=NWBAY.SPECIES[8],hh=h*.8,r2=hh*.05+.3,c=gcol();
  BIO.put('trunk2',[p[0],p[1],p[2]],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[r2/.4,hh*.6,r2/.4],C(pick(F.bark)));
  for(let i=0,n=4+Math.floor(rng()*4);i<n;i++){const a=rng()*TAU,d=rr(0,hh*.45);BIO.put('glossy',[p[0]+Math.cos(a)*d,p[1]+hh*rr(.55,.85),p[2]+Math.sin(a)*d],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[hh*.4,hh*.25,hh*.4],c.clone().multiplyScalar(rr(.85,1.1)),{n:[Math.cos(a)*.5,.8,Math.sin(a)*.5]});}
  const q=qEuler(0,rng()*TAU,0),rc=rcol();for(let i=0,n=2+Math.floor(rng()*4);i<n;i++)BIO.put('strand',[p[0]+out[0]*rr(.4,1.6)+rr(-1,1),p[1]+hh*.3,p[2]+out[2]*rr(.4,1.6)+rr(-1,1)],q,[rr(.25,.6),rr(8,30),1],rc.clone().multiplyScalar(rr(.8,1.1)));
  return;}
 BIO.put('trunk',[p[0],p[1],p[2]],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[rb/.4,h,rb/.4],C(pick(S.bark)));
 const n=8+Math.floor(rng()*5),R=h*.45,a0=rng()*TAU,c=C(pick(S.leaf));
 for(let i=0;i<n;i++){const a=a0+i/n*TAU+rr(-.2,.2),L=R*rr(.85,1.1);BIO.put('bigfrond',[p[0],p[1]+h,p[2]],qEuler(rr(-.1,.1),-a,rr(-.1,.3)),[L,L,L*1.25],c.clone().multiplyScalar(rr(1.2,1.5)));}}
// LEDGES: moss on the flat, plants toward the outer edge, lips and curtains off the edge
NWBAY.dressLedges=function(geos,opt,karst){opt=opt||{};
 const nM=opt.moss||400,nP=opt.plants||300,nE=opt.edges||140;
 BIO.upFaces(geos,nM,.6).forEach(f=>moss(f.p,f.n,rr(1.2,opt.mossR||3.5)));
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<.12)smallTree(f.p,rr(4,opt.treeH||12),karst,[rr(-1,1),0,rr(-1,1)]);else plant(f.p,rr(1,opt.size||3));});
 BIO.ledgePoints(geos,nE,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];
  moss([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(1,2.2));
  if(karst&&rng()<.18)smallTree([l.p[0]-l.n[0]*1.5,l.p[1],l.p[2]-l.n[2]*1.5],rr(5,opt.treeH||9),true,[l.n[0],0,l.n[2]]);
  else if(rng()<.7)curtain(p,l.n[0],l.n[2],rr(4,opt.hang||16),rr(2,5),{flowers:rng()<.4,karst:karst});});};
// SOFFITS: moss rolled over to face the ground, roots and beards hanging out of
// it, brackets, curtains where the rim is. Density rises toward the rim: the
// middle of a big underside is in permanent dark and grows almost nothing.
NWBAY.dressSoffits=function(geos,opt,karst){opt=opt||{};
 const S=BIO.downFaces(geos,opt.n||400,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=karst?1:f.r/rMax,lit=.15+.85*Math.pow(u,1.4);const R=(opt.mossR||5)*(.35+.65*lit);
  const dn=[0,-1,0];moss(f.p,dn,rr(R*.6,R));
  for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)moss([f.p[0]+rr(-1,1)*R,f.p[1]-rr(0,.2),f.p[2]+rr(-1,1)*R],dn,rr(R*.25,R*.8));
  if(rng()<lit*.85)roots([f.p[0],f.p[1]-.15,f.p[2]],rr(4,opt.hang||16)*(.35+.65*lit),rr(.5,2.2));
  if(rng()<lit*.40)curtain([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(5,opt.hang||16),rr(2,6),{flowers:rng()<.5,karst:karst});
  if(!karst&&rng()<.14)bracket([f.p[0],f.p[1]-rr(.5,2),f.p[2]],[0,0,0],rr(1,2.6));
  if(karst&&rng()<.3)BIO.put('beard',[f.p[0],f.p[1]-.1,f.p[2]],qEuler(0,rng()*TAU,0),[rr(1,2),rr(1.5,4),1.2],C(pick(PAL.mossPale)).multiplyScalar(1.2));});};
// WALLS: vines climbing, brackets, moss streaks under the drips; on the karst
// the hanging gardens -- root curtains and lianas, ferns rooted in the cracks,
// epiphyte rosettes, moss streaks, no brackets
NWBAY.dressWalls=function(geos,opt,karst){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(karst){const p=[f.p[0]+f.n[0]*.35,f.p[1],f.p[2]+f.n[2]*.35];
   if(k<.4)curtain(p,f.n[0],f.n[2],rr(4,opt.hang||24),rr(1.5,4),{karst:true});
   else if(k<.6){const n=4+Math.floor(rng()*4),c=C(pick(PAL.fern));for(let i=0;i<n;i++){const a=i/n*TAU,L=rr(.8,2.2);BIO.put('frond',p,qEuler(rr(-.3,.3),-a,rr(.1,.6)),[L,L*rr(.7,1),L*rr(.7,1)],c.clone().multiplyScalar(rr(1,1.4)));}}
   else if(k<.75){const r=rr(.5,1.2);BIO.put('epi',p,qUp([f.n[0],.6,f.n[2]]),[r,r*.8,r],epiCol());}
   else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(1,3));
   return;}
  if(k<.45)curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(3,opt.hang||12),rr(1.5,4),{});
  else if(k<.7)bracket([f.p[0],f.p[1],f.p[2]],f.n,rr(.8,2.2));
  else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.8,2));});};
NWBAY.dressGeos=function(geos,opt){opt=opt||{};reseed(650001+(opt.seed||0));const karst=!!opt.karst;
 NWBAY.dressLedges(geos,opt.ledges||{},karst);NWBAY.dressSoffits(geos,opt.soffits||{},karst);NWBAY.dressWalls(geos,opt.walls||{},karst);};
})();
