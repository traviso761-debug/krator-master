// ================================================================= EASTERN HIGH DESERT — growth on structures
// What the high desert does to a building left in it: not much, and slowly.
// Lichen crusts on every sunlit ledge and down the wall under each drip,
// dust and grass in the corners, an agave or a barrel cactus in a crack, a
// desert rose or a young dragon tree where a ledge holds a little soil, and a
// climbing succulent hanging off the odd edge. The soffits stay almost bare.
// The host hands over its shells as BufferGeometry[] in world space; this pass
// samples their faces (BIO.upFaces / downFaces / sideFaces / ledgePoints) and
// grows on them. It never touches the geometry -- a plant is never part of a
// building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SEDESERT.PAL,C=SEDESERT.C,SPK=SEDESERT.byKey;
const {bright,vary,leafCol}=SEDESERT,{tuft,card,agaveR,barrel}=SEDESERT.small;
const licCol=()=>leafCol(PAL.lichen,1.1,.03,.1,.06);
const vineCol=()=>leafCol(PAL.saltbush,1.2,.03,.08,.05);

// a LICHEN CRUST lying on a surface with normal n
function lichen(p,n,r){const q=qUp(n);const s=r*rr(.7,1.3);
 BIO.put('lichen',[p[0]+n[0]*.05,p[1]+n[1]*.05,p[2]+n[2]*.05],q,[s,1,s],licCol());}
// a CLIMBING SUCCULENT hanging off a point: a few strands facing (dx,dz)
function hangs(p,dx,dz,len,w){const m=Math.hypot(dx,dz);
 if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,n=1+Math.floor(rng()*3),c=vineCol();
 for(let i=0;i<n;i++){const o=(i-(n-1)/2)*w/n+rr(-.1,.1)*w,L=len*rr(.5,1);
  BIO.put('strand',[p[0]+tx*o+dx*rr(.05,.3),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.05,.3)],q,[w/n*rr(.6,1.2),L,1],c.clone().multiplyScalar(rr(.85,1.1)));}}
// a PLANT on a ledge: the floor's own grass, agave, barrel and creosote, at the ledge's scale
function plant(p,s){const k=rng();const y=p[1];
 if(k<.4){for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)tuft('grass',p[0]+rr(-.5,.5)*s,y,p[2]+rr(-.5,.5)*s,s*.8,s*.7,leafCol(PAL.drygrass,1.3,.03,.1,.06));}
 else if(k<.65)agaveR(p[0],y,p[2],PAL.agave,s*.55);
 else if(k<.82)barrel(p[0],y,p[2],1,s*.45);
 else card('small',p[0],y+s*.4,p[2],s*1.2,s*.8,leafCol(PAL.creosote,1.4,.04,.1,.06),.2);}
// a SMALL TREE on a ledge: a desert rose (a swollen little trunk with pink blooms) or a young dragon tree
function smallTree(p,h){
 if(rng()<.5){const S=SPK.rose;BIO.put('trunk2',[p[0],p[1],p[2]],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[h*.45/.4,h*.6,h*.45/.4],C(pick(S.bark)));
  const c=bright(vary(pick(PAL.comp),.03,.1,.06),1.15);for(let i=0,n=6+Math.floor(rng()*8);i<n;i++){const a=rng()*TAU,d=h*.35*Math.sqrt(rng());BIO.put('bloom',[p[0]+Math.cos(a)*d,p[1]+h*.6+rr(0,.3)*h,p[2]+Math.sin(a)*d],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),rr(.3,.5),c);}}
 else{const S=SPK.dragon;BIO.put('trunk2',[p[0],p[1],p[2]],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[h*.06/.4+.3,h*.7,h*.06/.4+.3],C(pick(S.bark)));
  const c=C(pick(S.leaf)),n=3+Math.floor(rng()*4);for(let i=0;i<n;i++){const a=i/n*TAU,d=h*.25;BIO.put('strap',[p[0]+Math.cos(a)*d,p[1]+h*.75,p[2]+Math.sin(a)*d],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),[h*.35,h*.2,h*.35],c.clone().multiplyScalar(rr(1.1,1.4)),{n:[Math.cos(a)*.5,.8,Math.sin(a)*.5]});}}}
// LEDGES: lichen on the flat, plants toward the outer edge, a succulent hanging off the odd edge
SEDESERT.dressLedges=function(geos,opt){opt=opt||{};
 const nL=opt.lichen||300,nP=opt.plants||120,nE=opt.edges||60;
 BIO.upFaces(geos,nL,.6).forEach(f=>lichen(f.p,f.n,rr(.6,opt.lichenR||2)));
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<.08)smallTree(f.p,rr(3,opt.treeH||7));else plant(f.p,rr(.8,opt.size||2));});
 BIO.ledgePoints(geos,nE,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];
  lichen([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(.6,1.4));
  if(rng()<.35)hangs(p,l.n[0],l.n[2],rr(2,opt.hang||8),rr(1,3));});};
// SOFFITS: a little lichen near the rim, a strand or two; the middle stays bare
SEDESERT.dressSoffits=function(geos,opt){opt=opt||{};
 const S=BIO.downFaces(geos,opt.n||120,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax,lit=Math.pow(u,1.6);if(rng()>lit*.6)return;
  lichen(f.p,[0,-1,0],rr(.5,opt.lichenR||1.5));
  if(rng()<lit*.25)hangs([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(2,opt.hang||6),rr(1,2));});};
// WALLS: lichen streaks under the drips, a cactus in a crack
SEDESERT.dressWalls=function(geos,opt){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(k<.7)lichen([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.5,1.6));
  else if(k<.85)BIO.put('barrel',[f.p[0]+f.n[0]*.25,f.p[1],f.p[2]+f.n[2]*.25],qUp(f.n),[.45,.5,.45],leafCol(PAL.barrel,1.15,.03,.08,.05));
  else hangs([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(1.5,opt.hang||5),rr(.8,2));});};
SEDESERT.dressGeos=function(geos,opt){opt=opt||{};reseed(650021+(opt.seed||0));
 SEDESERT.dressLedges(geos,opt.ledges||{});SEDESERT.dressSoffits(geos,opt.soffits||{});SEDESERT.dressWalls(geos,opt.walls||{});};
})();
