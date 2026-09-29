// ================================================================= XANADU — growth on structures
// What the Vale does to a building left in it: the host hands over its shells
// as BufferGeometry[] in world space; this pass samples their faces
// (BIO.upFaces / downFaces / sideFaces / ledgePoints) and grows on them. It
// never touches the geometry -- a plant is never part of a building. Here the
// curtains are wisteria and silver willow, the ledges carry box domes, little
// cloud pines and flowers, the soffits hang moss and aerial roots, and the
// walls take moss streaks and orchids.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=XANADU.PAL,C=hex=>new BIO.host.THREE.Color(hex),{bright,vary}=XANADU;
const mcol=()=>C(pick(PAL.moss)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.06,.04));
const psyPair=()=>{const p=pick(PAL.psyPair);return[bright(C(p[0]),1.1),bright(C(p[1]),1.1)];};
function moss(p,n,r){const s=r*rr(.7,1.3);BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],qUp(n),[s,1,s],mcol());}
// a CURTAIN off a point: wisteria racemes or silver willow strands, facing out along (dx,dz)
function curtain(p,dx,dz,len,w){const m=Math.hypot(dx,dz);if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const tx=-dz,tz=dx,wis=rng()<.6,n=wis?ri(4,9):ri(3,6);
 const col=wis?(rng()<.2?C(0xf4f0ff):vary(pick(XANADU.SPECIES[9].leaf),.03,.08,.06)):vary(pick(XANADU.SPECIES[19].leaf),.02,.04,.05);
 for(let i=0;i<n;i++){const o=(i-(n-1)/2)*w/n+rr(-.1,.1)*w,q=qEuler(0,rr(0,TAU),0),pos=[p[0]+tx*o+dx*rr(.1,.4),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.1,.4)];
  if(wis)BIO.put('raceme',pos,q,[rr(.5,.8),Math.min(len,rr(1.2,2.8)),1],bright(col,1.2),{c2:bright(C(pick(PAL.irid.WV)),1.1)});
  else BIO.put('willow',pos,q,[rr(1,1.8),len*rr(.5,1),1],bright(col,1.3),{c2:bright(C(pick(PAL.irid.SL)),1.1)});}
 if(wis)for(let i=0;i<3;i++)BIO.put('broad',[p[0]+tx*rr(-.5,.5)*w+dx*.4,p[1]+.3,p[2]+tz*rr(-.5,.5)*w+dz*.4],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[rr(1,1.6),rr(.5,.8),rr(1,1.6)],bright(C(0x8ac060),1.2),{n:[dx,.6,dz]});}
function roots(p,len,w){const q=qEuler(0,rng()*TAU,0);
 for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)BIO.put('strand',[p[0]+rr(-w,w),p[1],p[2]+rr(-w,w)],q,[rr(.1,.3),len*rr(.6,1.2),1],bright(vary(C(0x7a6a50),.02,.06,.05),1.05));}
function orchids(p,n){const pr=psyPair();for(let b=0,m=ri(2,5);b<m;b++)BIO.put(rng()<.6?'orchid':'swirl',[p[0]+n[0]*.3+rr(-.5,.5),p[1]+rr(-.4,.6),p[2]+n[2]*.3+rr(-.5,.5)],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.3,.5),pr[0],{c2:pr[1]});}
// a PLANT on a ledge: a box dome, a flower drift, a silver tuft, a cobra lily clump, or a little cloud pine
function plant(p,s){const k=rng(),y=p[1];
 if(k<.3){const R=s*rr(.35,.6);BIO.put('cushion',[p[0],y+R*.3,p[2]],qEuler(0,rng()*TAU,0),[R,R*.75,R],bright(vary(C(pick([0x5a8a34,0x6a9a3a,0x4a7a30])),.02,.06,.05),1.2));}
 else if(k<.55){const pr=psyPair(),it=pick(['orchid','swirl','ruffle','bloom']);for(let i=0,n=ri(3,7);i<n;i++)BIO.put(it,[p[0]+rr(-.8,.8),y+rr(.2,.5),p[2]+rr(-.8,.8)],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),rr(.25,.4),pr[0],{c2:pr[1]});}
 else if(k<.75){BIO.put('clubmoss',[p[0],y-.05,p[2]],qEuler(0,rng()*TAU,0),[s*1.4,s*.5,s*1.4],bright(vary(C(pick(PAL.silver)),.02,.06,.05),1.2));}
 else if(k<.87){for(let i=0,n=ri(3,6);i<n;i++){const h=rr(.4,.8);BIO.put('cobra',[p[0]+rr(-.6,.6),y-.03,p[2]+rr(-.6,.6)],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[h,h,h],bright(C(pick([0x8ab040,0x9ac050])),1.1));}}
 else{const h=s*rr(1.2,2.2),hc=vary(C(pick(XANADU.SPECIES[3].leaf)),.02,.06,.05);BIO.put('trunkw',[p[0],y-.2,p[2]],qEuler(rr(-.2,.2),0,rr(-.2,.2)),[h*.05+.1,h*.7,h*.05+.1],C(0xb07050));
  for(let i=0;i<3;i++){const a=rng()*TAU,d=h*rr(.1,.35);BIO.put('needle',[p[0]+Math.cos(a)*d,y+h*rr(.45,.8),p[2]+Math.sin(a)*d],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[h*.35,h*.1,h*.35],bright(hc,1.2),{n:[0,1,0]});}}}
XANADU.dressLedges=function(geos,opt){opt=opt||{};
 BIO.upFaces(geos,opt.moss||400,.6).forEach(f=>moss(f.p,f.n,rr(1,opt.mossR||3)));
 BIO.upFaces(geos,opt.plants||300,.6).forEach(f=>plant(f.p,rr(1,opt.size||2.5)));
 BIO.ledgePoints(geos,opt.edges||140,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];moss([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(.8,1.8));
  if(rng()<.75)curtain(p,l.n[0],l.n[2],rr(3,opt.hang||12),rr(1.5,4));});};
XANADU.dressSoffits=function(geos,opt){opt=opt||{};const S=BIO.downFaces(geos,opt.n||400,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax,lit=.15+.85*Math.pow(u,1.4),R=(opt.mossR||3)*(.35+.65*lit),dn=[0,-1,0];moss(f.p,dn,rr(R*.6,R));
  if(rng()<lit*.7)roots([f.p[0],f.p[1]-.15,f.p[2]],rr(3,opt.hang||10)*(.35+.65*lit),rr(.4,1.6));
  if(rng()<lit*.35)curtain([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(3,opt.hang||10),rr(1.5,4));});};
XANADU.dressWalls=function(geos,opt){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(k<.35)curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(2,opt.hang||8),rr(1,3));
  else if(k<.55)orchids(f.p,f.n);
  else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.6,1.6));});};
XANADU.dressGeos=function(geos,opt){opt=opt||{};reseed(650023+(opt.seed||0));
 XANADU.dressLedges(geos,opt.ledges||{});XANADU.dressSoffits(geos,opt.soffits||{});XANADU.dressWalls(geos,opt.walls||{});};
})();
