// ================================================================= THE LABYRINTH — growth on structures (the rock and the ruin)
// What the steppe does to the knobs, the stacks and the Hall's broken decks: lichen plates on the walls, moss and the steppe's grasses on the
// ledges, cushions on the cold ones, juniper and dwarf birch in the joints, and on the wider ledges a few young birches (a stem and limbs,
// the leaves on them). The host hands over its shells as BufferGeometry[] in world space (89z); this pass samples their faces and grows on
// them. It never touches the geometry. No hanging curtains or flowered drapes: the steppe has none, and they floated (KNOWN_ISSUES.md).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const PAL=LABY.PAL,C=LABY.C;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>LABY.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1:k));
// a MOSS PATCH lying on a surface with normal n
function moss(p,n,r){BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],qUp(n),[r,1,r],col('moss',PAL.moss,1));}
// a LICHEN PLATE on a face (normal n), a hand's breadth off it
function lichen(p,n,s){BIO.put('lichen',[p[0]+n[0]*.03,p[1]+n[1]*.03,p[2]+n[2]*.03],qUp(n),[s,1,s],col('lichen',PAL.lichen,1));}
// a YOUNG BIRCH in a joint: a stem, three or four short limbs, the leaves on their tips (held by the wood: the core attach audit)
function youngBirch(p,h,st){const S=LABY.byKey.silverbirch,bc=C(pick(S.barkC)),lean=[rr(-.06,.06),rr(-.06,.06)],top={x:p[0]+lean[0]*h,y:p[1]+h,z:p[2]+lean[1]*h};
 st.limb=(st.limb==null?0:st.limb)+BIO.tube('bark.birch',[{x:p[0],y:p[1]-.1,z:p[2],r:.06+h*.012},{x:mix(p[0],top.x,.5),y:p[1]+h*.5,z:mix(p[2],top.z,.5),r:.04+h*.008},{x:top.x,y:top.y,z:top.z,r:.025}],bc,{seg:4,cap:true});
 const n=ri(3,4),a0=rr(0,TAU),tips=[top];
 for(let k=0;k<n;k++){const u=rr(.45,.85),a=a0+k/n*TAU+rr(-.3,.3),o={x:mix(p[0],top.x,u),y:p[1]+h*u,z:mix(p[2],top.z,u)},L=h*rr(.2,.35),tip={x:o.x+Math.cos(a)*L*.8,y:o.y+L*.55,z:o.z+Math.sin(a)*L*.8};
  BIO.tube('bark.birch',[{x:o.x,y:o.y,z:o.z,r:.03},{x:tip.x,y:tip.y,z:tip.z,r:.015}],bc,{seg:3});tips.push(tip);}
 for(const t of tips){const s=rr(1,1.4);BIO.put('birchleaf',[t.x+rr(-.15,.15),t.y+s*.1,t.z+rr(-.15,.15)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.7,s],LABY.libCol('birchleaf',bright(vary(pick(S.leaf),.03,.08,.06),1.15)),{n:[0,1,0]});}
 st.birches++;}
// a PLANT on a ledge, by the station's profile: a grass tuft, wormwood on the dry, a cushion on the cold, juniper or dwarf birch
function plant(p,s,P,st){const k=rng(),y=p[1];
 if(k<.42){const h=mix(P.grassH[0],P.grassH[1],rr(.2,.8));BIO.put('grass',[p[0],y-.03,p[2]],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*1.6,h,h*1.6],col('grass',P.tall>.5?PAL.grassTall:PAL.grassShort,1));}
 else if(k<.55&&P.wormwood>.3){const h=rr(.3,.6);BIO.put('wormwood',[p[0],y-.03,p[2]],qEuler(0,rr(0,TAU),0),[h*1.4,h,h*1.4],col('wormwood',PAL.sage,1));}
 else if(k<.68&&P.cushion>.1){const r=rr(.25,.6);BIO.put('cushion',[p[0],y-.04,p[2]],qEuler(0,rr(0,TAU),0),[r,r,r],bright(C(pick(PAL.cushion)),rr(.9,1.1)));}
 else if(k<.84){const s2=s*rr(.4,.7),low=rng()<.6;BIO.put('juniper',[p[0],y+s2*(low?.18:.45),p[2]],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),low?[s2*1.9,s2*.5,s2*1.9]:[s2,s2*1.4,s2],col('juniper',PAL.juniper,1),{n:[0,1,0]});}
 else{const s2=s*rr(.4,.7);BIO.put('dwarfbirch',[p[0],y+s2*.3,p[2]],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s2*1.5,s2*.75,s2*1.5],col('dwarfbirch',PAL.dwarfbirch,1.05),{n:[0,1,0]});}
 st.plants++;}
// LEDGES: moss on the flat, the plants, a young birch now and then
LABY.dressLedges=function(geos,opt,P,st){const nM=(opt.moss==null?400:opt.moss),nP=(opt.plants==null?300:opt.plants);
 BIO.upFaces(geos,nM,.6).forEach(f=>{moss(f.p,f.n,rr(1,opt.mossR==null?3:opt.mossR));st.moss++;});
 const tk=(opt.trees==null?.04:opt.trees)*clamp(P.tree[1]*2,0,1);   /* young birches only where the station grows birch (not the dry Mesas) */
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<tk)youngBirch(f.p,rr(2.5,opt.treeH==null?6:opt.treeH),st);else plant(f.p,rr(.8,opt.size==null?1.6:opt.size),P,st);});};
// WALLS: lichen plates, a few moss streaks low down
LABY.dressWalls=function(geos,opt,P,st){BIO.sideFaces(geos,opt.n==null?400:opt.n).forEach(f=>{if(rng()<.8){lichen(f.p,f.n,rr(.6,opt.lichenS==null?1.8:opt.lichenS));st.lichen++;}else{moss(f.p,f.n,rr(.6,1.4));st.moss++;}});};
// the dressing is drawn within LABY.LOD.dress of the camera (runtime LOD, by chunk; opt.range overrides it)
LABY.dressGeos=function(geos,opt){opt=opt||{};const P=LABY.profile||LABY.PROFILES.parkland,st={moss:0,lichen:0,plants:0,birches:0};
 reseed(KRAND.hash(0x1AB8,opt.seed==null?0:opt.seed));const r0=BIO.range;BIO.range=opt.range||LABY.LOD.dress;
 try{LABY.dressLedges(geos,opt.ledges||{},P,st);LABY.dressWalls(geos,opt.walls||{},P,st);}finally{BIO.range=r0;}
 return st;};
})();
