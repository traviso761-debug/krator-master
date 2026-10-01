// ================================================================= NORTHERN HIGHLANDS — growth on structures
// What the flank does to a structure left in it: the host hands over its shells
// as BufferGeometry[] in world space; this pass samples their faces
// (BIO.upFaces / downFaces / sideFaces / ledgePoints) and grows on them. It never
// touches the geometry -- a plant is never part of a building.
//
// THE HANGING FLORA is the point of this pass (the Girder tower is its demo):
// every soffit and girder carries curtains of hanging moss graded by length,
// trailing vines, strings of BELL-BULBS and LANTERN PODS (they light the tower at
// night); the ledges carry moss, sword and lace ferns, trumpet saplings and, up
// high, spruce seedlings; the walls take moss streaks and ferns. The structure
// shows the COLD GRADIENT on one object: going up it, beard lichen replaces moss
// and the seedlings turn boreal (opt.coldTop: the height fraction where the
// change is complete).
//
// opt.kind 'crag' dresses a rock instead (the host's pillars): crag pines and
// heath on the tops, lichen and moss down the faces, ferns in the cracks.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NHL.PAL,C=hex=>new BIO.host.THREE.Color(hex),{bright,vary}=NHL;
function moss(p,n,r,set){const s=r*rr(.7,1.3);BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],qUp(n),[s,1,s],bright(vary(pick(set||PAL.moss),.03,.08,.06),.95));}
// a CURTAIN off an edge: hanging moss (or beard lichen, high up), a strand or two of trailing vine
function curtain(p,dx,dz,len,w,cold,st){const m=Math.hypot(dx,dz);if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const tx=-dz,tz=dx,lichen=rng()<cold,n=lichen?ri(3,6):ri(3,7);
 for(let i=0;i<n;i++){const o=(i-(n-1)/2)*w/n+rr(-.1,.1)*w,L=len*rr(.45,1)*(lichen?.45:1),pos=[p[0]+tx*o+dx*rr(.05,.3),p[1]+rr(-.1,.05),p[2]+tz*o+dz*rr(.05,.3)];
  NHL._drape(pos[0],pos[1],pos[2],L,lichen);st.drapes++;}
 if(!lichen&&rng()<.4)BIO.put('drape',[p[0]+tx*rr(-.5,.5)*w,p[1],p[2]+tz*rr(-.5,.5)*w],qEuler(0,rr(0,TAU),0),[rr(.3,.5),len*rr(1,1.6),1],bright(vary(C(0x3e5a2a),.02,.05,.05),1));}
function fernClump(p,lv,lace){const set=lace?PAL.lace:PAL.fern,item=lace?'lace':'frond',hc=vary(pick(set),.03,.08,.05),n=ri(4,7),a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU,L=rr(.7,1.3);BIO.put(item,[p[0],p[1]-.05,p[2]],qEuler(rr(-.15,.15),-a,rr(.15,.7)),[L,L,L*1.3],bright(hc,lace?1.3:1.55),lace?{c2:bright(C(pick(PAL.irid.LG)),1.2)}:null);}}
function heathTuft(p){const h=rr(.25,.5);BIO.put('heath',[p[0],p[1]-.05,p[2]],qEuler(0,rr(0,TAU),0),[h*2,h,h*2],bright(vary(pick([0x3a5a2e,0x44602e,0x4a4a3a]),.02,.06,.05),1.2));}
NHL.dressLedges=function(geos,opt,st){opt=opt||{};const y0=opt.y0||0,yH=opt.h||100,coldTop=opt.coldTop||.85;
 const cf=y=>smooth(.35,coldTop,(y-y0)/yH);
 BIO.upFaces(geos,opt.moss||600,.6).forEach(f=>{moss(f.p,f.n,rr(1,opt.mossR||2.6),cf(f.p[1])>.5?PAL.mossDark:PAL.moss);st.moss++;});
 BIO.upFaces(geos,opt.plants||300,.6).forEach(f=>{const c=cf(f.p[1]),k=rng();
  if(k<.38){fernClump(f.p,2,rng()<.3);st.ferns++;}
  else if(k<.55&&c<.6){const T=NHL.treeAt(f.p[0],f.p[1]+.4,f.p[2],'trumpet',{H:rr(1.8,4.5),lv:2});if(T)st.saplings++;}
  else if(k<.68){const T=NHL.treeAt(f.p[0],f.p[1]+.4,f.p[2],c>.5?'spirespruce':'shadowhemlock',{H:rr(2.5,6),lv:2,cold:c});if(T)st.saplings++;}
  else if(k<.82){heathTuft(f.p);st.heath++;}
  else{BIO.put('cushion',[f.p[0],f.p[1]+.1,f.p[2]],qEuler(0,rr(0,TAU),0),[rr(.4,.9),rr(.25,.5),rr(.4,.9)],bright(vary(pick(PAL.moss),.03,.08,.06),1.05));st.moss++;}});
 BIO.ledgePoints(geos,opt.edges||220,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];moss(l.p,[0,1,0],rr(.8,1.8));
  if(rng()<.8)curtain(p,l.n[0],l.n[2],rr(2,opt.hang||9),rr(1.5,4),cf(l.p[1]),st);
  if(rng()<.18)NHL._glowCluster(p[0],p[1],p[2],ri(3,7),st,.3);});};
NHL.dressSoffits=function(geos,opt,st){opt=opt||{};const S=BIO.downFaces(geos,opt.n||600,.6);if(!S.length)return;const y0=opt.y0||0,yH=opt.h||100,coldTop=opt.coldTop||.85;
 const cf=y=>smooth(.35,coldTop,(y-y0)/yH);
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 // the lit edge of a slab grows most; the dark heart of the building least
 S.forEach(f=>{const u=f.r/rMax,lit=.2+.8*Math.pow(u,1.2),c=cf(f.p[1]),dn=[0,-1,0];moss(f.p,dn,rr(1,2.6)*(.4+.6*lit),c>.5?PAL.mossDark:PAL.moss);st.moss++;
  if(rng()<lit*.9){const len=rr(2.5,opt.hang||8)*(.45+.55*lit);NHL._drape(f.p[0]+rr(-.3,.3),f.p[1]-.1,f.p[2]+rr(-.3,.3),c>.5&&rng()<c?len*.45:len,rng()<c);st.drapes++;}
  if(rng()<lit*.22)NHL._glowCluster(f.p[0],f.p[1]-.1,f.p[2],ri(3,8),st,.3);
  if(rng()<lit*.25)curtain([f.p[0],f.p[1]-.15,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(2,opt.hang||8),rr(1.5,3.5),c,st);});};
NHL.dressWalls=function(geos,opt,st){opt=opt||{};const y0=opt.y0||0,yH=opt.h||100,coldTop=opt.coldTop||.85;
 BIO.sideFaces(geos,opt.n||260).forEach(f=>{const k=rng(),c=smooth(.35,coldTop,(f.p[1]-y0)/yH);
  if(k<.45){moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.6,1.6),c>.5?PAL.lichen:PAL.moss);st.moss++;}
  else if(k<.65){fernClump([f.p[0]+f.n[0]*.4,f.p[1],f.p[2]+f.n[2]*.4],2,rng()<.25);st.ferns++;}
  else if(k<.9){curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(1.5,opt.hang||6),rr(1,2.5),c,st);}});};
// a ROCK: crag pines and heath on top, lichen and moss down the faces, ferns in the cracks
NHL.dressCrag=function(geos,opt,st){opt=opt||{};
 BIO.upFaces(geos,opt.tops||160,.7).forEach(f=>{const k=rng();
  if(k<(opt.pineK||.12)){const T=NHL.treeAt(f.p[0],f.p[1]+.3,f.p[2],'cragpine',{H:rr(8,18),lv:2});if(T)st.saplings++;}
  else if(k<.55){heathTuft(f.p);st.heath++;}else if(k<.8){moss(f.p,f.n,rr(.8,2),PAL.mossDark);st.moss++;}else{fernClump(f.p,2,false);st.ferns++;}});
 BIO.sideFaces(geos,opt.faces||220).forEach(f=>{const k=rng();
  if(k<.5){moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.8,2),rng()<.5?PAL.lichen:PAL.mossDark);st.moss++;}
  else if(k<.62){fernClump([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],2,false);st.ferns++;}
  else if(k<.7){NHL._drape(f.p[0]+f.n[0]*.4,f.p[1],f.p[2]+f.n[2]*.4,rr(.6,1.6),true);st.drapes++;}});};
NHL.dressGeos=function(geos,opt){opt=opt||{};reseed(650031+(opt.seed||0));BIO.range=NHL.LOD.dress;
 const st={moss:0,ferns:0,saplings:0,heath:0,drapes:0,glow:0};
 if(opt.kind==='crag')NHL.dressCrag(geos,opt,st);
 else{const o={y0:opt.y0,h:opt.h,coldTop:opt.coldTop};NHL.dressLedges(geos,Object.assign({},o,opt.ledges||{}),st);NHL.dressSoffits(geos,Object.assign({},o,opt.soffits||{}),st);NHL.dressWalls(geos,Object.assign({},o,opt.walls||{}),st);}
 BIO.range=null;return st;};
})();
