// ================================================================= HYPERTREE — imported from Mav's Refuge
// An Ironbark hypertree, for scale, and (round 3) a grove of the other three
// species behind it. The numbers are that project's own SPECIES table: the
// Ironbark is 410-470 m, base radius 25-29 m, crown starting at half height
// and reaching 170-215 m across. The trunk profile and the buttress model
// below are ports of its trunkR()/butF()/lobeSum(); the branching keeps its
// shape rules (golden-angle boughs, alternating secondaries, twigs off those)
// but is re-expressed with this kit's instanced primitives, because the
// original is written against its own merged-bucket tube builder.
//
// Nothing else from that project is imported -- no platforms, bridges, lifts
// or buildings. Just the trees.
kdef('bough',new THREE.CylinderGeometry(.5,.5,1,7),MAT.timber);
kdef('frond',new THREE.IcosahedronGeometry(1,0),MAT.turf);
const LEAFC=[0x1f3d24,0x254a2a,0x1a3520,0x2c5230];     // Ironbark needle greens
// ---- THE OTHER THREE SPECIES (round 3) ---------------------------------------
// KNOWN_ISSUES: "the imported hypertree is one species". Mav's Refuge grows
// four, and biomes/hyperjungle carries all four as data (HYPERJUNGLE.SPECIES:
// habit, bark and leaf palettes, hangings) plus their bark and leaf textures.
// The sizes are Mav's Refuge's own SPECIES table (the biome's are half scale);
// the habits are the biome's LOWER tiers and hab{} numbers. The grove's bark and
// leaf CARDS are the biome's textures on this kit's instancing (kdefs made at
// build time, because the biome fragments load after this one); without the
// biome (a host that vendors this file alone) it falls back to timber and the
// old icosahedron fronds. Nothing is charged to biome/0: these are kit items,
// counted against this type.
// tiers: [n, u0,u1, len0,len1 (x crown radius), el0,el1, curve, radius scale, bearing offset]
const HYSP=[
 {name:'Ironbark',H:[410,470],rb:[25,29],crown0:.50,crownR:[170,215],secUp:.18,secCurve:-.10,twigUp:.14,butA:1,lobes:7,flat:.50,
  tiers:[[8,.855,.955,.62,.92,.22,.52,-.12,.62,0],[7,.72,.86,.62,.90,.18,.42,-.16,.46,1.2],[7,.52,.70,.50,.78,.02,.26,-.20,.40,2.4]]},
 {name:'Ghostwood',H:[390,445],rb:[19,23],crown0:.46,crownR:[150,190],secUp:.55,secCurve:.16,twigUp:.40,butA:.45,lobes:5,flat:.80,hang:'raceme',
  tiers:[[5,.88,.97,.28,.42,.80,1.20,.16,.55,0],[5,.70,.86,.48,.78,.60,.95,.10,.45,1.2],[7,.48,.72,.58,.92,.55,.95,.06,.45,.7]]},
 {name:'Prism gum',H:[365,425],rb:[22,26],crown0:.52,crownR:[185,230],secUp:.22,secCurve:-.16,twigUp:.18,butA:.80,lobes:6,flat:.55,
  tiers:[[5,.86,.96,.40,.70,.35,.70,-.10,.55,0],[5,.70,.85,.60,.95,.25,.55,-.14,.50,1.2],[7,.52,.70,.70,1.05,.18,.48,-.16,.50,.7]]},
 {name:'Gate baobab',H:[285,312],rb:[36,40],crown0:.80,crownR:[120,150],secUp:.35,secCurve:.08,twigUp:.30,butA:.22,lobes:9,flat:.70,hang:'pod',
  tiers:[[8,.80,.93,.60,1.00,.12,.55,.06,.50,0],[4,.90,.97,.30,.50,.60,1.00,0,.40,1.2]]}];
// the kit items the grove is drawn with: per-species bark and leaf cards
function hyKit(){if(KIT.defs.hyBark0)return true;
 if(typeof HYPERJUNGLE==='undefined'||!HYPERJUNGLE.BARKTEX||!HYPERJUNGLE.LEAFTEX)return false;
 for(let sp=0;sp<4;sp++){
  MAT['hyBark'+sp]=new THREE.MeshStandardMaterial({map:HYPERJUNGLE.BARKTEX[sp],roughness:.95,metalness:0,side:DS});
  kdef('hyBark'+sp,new THREE.CylinderGeometry(.5,.5,1,7,1,true),MAT['hyBark'+sp]);
  // LAMBERT, never Standard, on a leaf card: the biome core's first lesson
  kdef('hyLeaf'+sp,BIO.geo.clump(),new THREE.MeshLambertMaterial({map:HYPERJUNGLE.LEAFTEX[sp],alphaTest:.42,side:DS}));}
 kdef('hyRaceme',BIO.geo.hang(),new THREE.MeshLambertMaterial({map:HYPERJUNGLE.FLOWERTEX,alphaTest:.4,side:DS}));
 kdef('hyPod',BIO.geo.pod(),new THREE.MeshLambertMaterial({vertexColors:true}));
 return true;}
function buildHypertree(scene,gx,gz,d){reseed(9450+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const BIOK=hyKit();
 // the Ironbark first, with the exact draws it always took, so it does not move
 hyTree(G,gx,gz,{sp:0,x:0,z:0,H:452,RB:27.5,CR:196,full:true,
  label:'Ironbark hypertree — 452 m (Mav’s Refuge, for scale)'},BIOK);
 // NO APRON. apron() lays a graded disc of pale rock (d=0) or mud, and under
 // a tree either read as a paper disc laid on the plain in every preset. The
 // buttress flare and the surface roots are the ground contact.
 scatterMoss(0,0,0,27.5*1.2,196*.7,90,3.2);
 figures(27.5*2.2,0,6,40);
 // THE GROVE, after every draw above. Mav's Refuge stands its trees with
 // crowns touching; these stand behind the Ironbark (west and north, away
 // from the arcology and the presets' side), so it stays the one in front.
 [[1,-390,-150],[2,-150,-430],[3,-500,250]].forEach(c=>{const S=HYSP[c[0]];
  hyTree(G,gx,gz,{sp:c[0],x:c[1],z:c[2],H:rr(S.H[0],S.H[1]),RB:rr(S.rb[0],S.rb[1]),CR:rr(S.crownR[0],S.crownR[1]),full:false},BIOK);});
 KOFF=[0,0,0];return G;}
// One hypertree of species T.sp at builder-local (T.x,T.z). `full` is the
// Ironbark's original detail and draw order; the grove's companions take
// fewer segments, secondaries and satellites.
function hyTree(G,gx,gz,T,BIOK){
 const S=HYSP[T.sp],H=T.H,RB=T.RB,CR=T.CR,CROWN0=S.crown0,OX=T.x,OZ=T.z,FULL=T.full;
 const BARK=BIOK?'hyBark'+T.sp:'bough',LEAF=BIOK?'hyLeaf'+T.sp:'frond';
 REGISTER({name:T.label||(S.name+' hypertree — '+Math.round(H)+' m (Mav’s Refuge)'),x:OX,z:OZ,r:CR,h:H});
 REGISTER({name:S.name+' hypertree — the bole',x:OX,z:OZ,r:RB*2.2,h:H*CROWN0});
 const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 // trunk radius, verbatim from the source's trunkR(): species 0-2 taper to a
 // whip, the baobab is a bottle
 const trunkR=yy=>{const u=clamp(yy/H,0,1);
  if(T.sp===3){const b=u<.15?1:u<.35?lerp(1,1.08,(u-.15)/.2):u<.60?lerp(1.08,.92,(u-.35)/.25)
    :u<.78?lerp(.92,.64,(u-.60)/.18):lerp(.64,.10,sm(.78,1,u));return RB*b*(1+.38*Math.exp(-yy/9));}
  const t=u<.62?1-.42*u:lerp(.74,.07,sm(.62,1,u));
  return RB*t*(1+.80*Math.exp(-yy/15));};
 // buttresses: a handful of lobes that only exist in the bottom 45 m
 const NL=S.lobes,LOB=[];
 for(let k=0;k<NL;k++)LOB.push({a:k/NL*TAU+rr(-.22,.22),amp:rr(.55,1.2)*S.butA,p:rr(1.6,2.6)});
 const lobeSum=ang=>{let s=0;for(const L of LOB){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,L.p);}return s;};
 const butF=yy=>yy<45?.55*Math.exp(-yy/16)*clamp((45-yy)/18,0,1):0;

 // ---- the bole ------------------------------------------------------------
 // v is raised to a power so the rings crowd near the ground, where the
 // buttress flare is: spaced evenly they read as a smooth cone instead.
 const BOLE=[gridSurface((u,v)=>{const th=u*TAU,yy=Math.pow(v,.82)*H*.99;
  const r=trunkR(yy)*(1+butF(yy)*lobeSum(th)
   +.010*Math.sin(3*th+yy*.045)+.007*Math.sin(7*th-yy*.10));
  return[OX+r*Math.cos(th),yy,OZ+r*Math.sin(th)];},FULL?52:40,FULL?64:44,{uS:16,vS:38*H/452})];
 meshMerged(BOLE,BIOK?MAT['hyBark'+T.sp]:MAT.timber,G);

 // ---- surface roots, one off each buttress ---------------------------------
 LOB.forEach(L=>{const len=rr(45,120)*(.6+.4*L.amp),R0=trunkR(7)*(1+.19*L.amp);
  const r0=clamp(RB*.17*L.amp,1.6,5.2),wob=rr(0,TAU);
  let px=OX+Math.cos(L.a)*R0*.72,pz=OZ+Math.sin(L.a)*R0*.72,py=r0*1.6+5;
  for(let k=1;k<=7;k++){const t=k/7,a=L.a+.32*Math.sin(wob+t*5.2)*t+.10*Math.sin(wob*2+t*11);
   const dist=R0*.72+len*t,r=lerp(r0,.4,Math.pow(t,.75));
   const nx=OX+Math.cos(a)*dist,nz=OZ+Math.sin(a)*dist,ny=terrainH(gx+nx,gz+nz)+r*.22;
   beam(BARK,[px,py,pz],[nx,ny,nz],r*2,r*2);
   px=nx;py=ny;pz=nz;}});

 // ---- boughs ---------------------------------------------------------------
 const FOL=[],HANG=[];
 // one bough: a gravity/phototropic curve with a sideways wiggle, as the source
 const grow=(o,dir,len,rA,rB,n,curve,wig)=>{
  const sx=-dir[2],sz=dir[0],sl=Math.hypot(sx,sz)||1;
  const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,P=[];
  for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
   P.push([o[0]+dir[0]*len*t+sx/sl*w,o[1]+dir[1]*len*t+curve*len*t*t,
           o[2]+dir[2]*len*t+sz/sl*w,lerp(rA,rB,Math.pow(t,.8))]);}
  return P;};
 const skin=P=>{for(let i=0;i<P.length-1;i++){
  const r=(P[i][3]+P[i+1][3])*.5;
  beam(BARK,[P[i][0],P[i][1],P[i][2]],[P[i+1][0],P[i+1][1],P[i+1][2]],r*2,r*2);}};
 const side=(tx,ty,tz,s,a,b,c)=>{const sx=-tz*s,sz=tx*s,sl=Math.hypot(sx,sz)||1;
  const x=tx*a+sx/sl*b,y=ty*a+c,z=tz*a+sz/sl*b,l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];};
 const clump=(p,s)=>{FOL.push([p[0],p[1],p[2],s]);};

 const GOLD=2.399963,a0=rr(0,TAU);
 const limbs=[];
 const addBough=(u,ang,len,el,curve,rScale)=>{
  const y=H*u,r0=trunkR(y)*(u>.93?.6:1);
  const o=[OX+Math.cos(ang)*Math.max(0,r0-1),y,OZ+Math.sin(ang)*Math.max(0,r0-1)];
  const dir=[Math.cos(ang)*Math.cos(el),Math.sin(el),Math.sin(ang)*Math.cos(el)];
  limbs.push(grow(o,dir,len,clamp(r0*rScale,.9,5.5),.5,FULL?8:6,curve,.06));};
 // SPECIES[0].crown0 is 0.50, i.e. the crown starts at half height. In the
 // source most of the lower crown hangs off the city's own structural
 // branches, which are not imported, so without a third tier here the trunk
 // stands bare to 72% and the tree reads as a palm. Every species grows its
 // own lower tier for the same reason (the biome's LOWER table).
 for(const t of S.tiers)for(let k=0;k<t[0];k++)
  addBough(rr(t[1],t[2]),a0+t[9]+k*GOLD+rr(-.3,.3),CR*rr(t[3],t[4]),rr(t[5],t[6]),t[7],t[8]);
 // the crown lower bound, so no foliage hangs below where the source starts it
 const yMinFol=H*CROWN0-28,NS=4;

 limbs.forEach(P=>{
  skin(P);
  const n=P.length;let s=-1;
  for(let i=2;i<n;i++){                      // secondaries, alternating sides
   const t=i/(n-1);
   const tx=P[i][0]-P[i-1][0],ty=P[i][1]-P[i-1][1],tz=P[i][2]-P[i-1][2];
   const tl=Math.hypot(tx,ty,tz)||1;s=-s;
   const len1=Math.max(14,CR*rr(.16,.26)*(1-.5*t));
   const d1=side(tx/tl,ty/tl,tz/tl,s,rr(.45,.8),rr(.7,1.1),S.secUp+rr(-.12,.18));
   const rS=clamp(Math.min(P[i][3]*.62,len1*.032),.4,2.6);
   const sec=grow([P[i][0],P[i][1],P[i][2]],d1,len1,rS,.22,NS,S.secCurve,.07);
   skin(sec);
   const spr=clamp(len1*.26,8,20);
   for(let q=2;q<=NS;q++)if(sec[q][1]>yMinFol)clump(sec[q],spr*(q===NS?.9:1));
   let s2=-1;
   for(let j=1;j<=NS;j++){                    // twigs off the secondary
    const ax=sec[j][0]-sec[j-1][0],ay=sec[j][1]-sec[j-1][1],az=sec[j][2]-sec[j-1][2];
    const al=Math.hypot(ax,ay,az)||1;s2=-s2;
    const len2=Math.max(8,len1*rr(.3,.5));
    const d2=side(ax/al,ay/al,az/al,s2,rr(.5,.9),rr(.6,1.0),S.twigUp+rr(-.15,.25));
    const tw=grow([sec[j][0],sec[j][1],sec[j][2]],d2,len2,Math.max(.25,sec[j][3]*.6),.12,2,-.10,.05);
    skin(tw);
    if(S.hang&&tw[2][1]>yMinFol)HANG.push(tw[2]);
    for(let q=1;q<=2;q++)if(tw[q][1]>yMinFol)clump(tw[q],clamp(len2*.42,6,13));}}});

 // ---- foliage --------------------------------------------------------------
 // One clump per spot plus a couple of satellites, coloured from the species'
 // leaf set. With the biome loaded they are its leaf CARDS (6 triangles, its
 // texture, Lambert); without it, the old 20-triangle icosahedron fronds. The
 // Ironbark takes the same draws either way, so nothing after it moves.
 const LC=BIOK?HYPERJUNGLE.SPECIES[T.sp].leaf:LEAFC,LK=BIOK?1.35:1;
 FOL.forEach(f=>{const n=2+Math.floor(rng()*3);
  for(let i=0;i<n;i++){const s=f[3]*rr(.55,1.05);
   const p=[f[0]+rr(-.6,.6)*f[3],f[1]+rr(-.35,.35)*f[3],f[2]+rr(-.6,.6)*f[3]];
   const qq=qEuler(rng()*3,rng()*3,rng()*3),col=new THREE.Color(LC[Math.floor(rng()*LC.length)]).multiplyScalar(LK);
   // a card is a tripod of quads about one unit across; a frond was a unit
   // icosahedron, two across. Turned about y only, so the tripod stays upright.
   if(BIOK){const c=s*2.3,ry=Math.atan2(qq.y,qq.w)*2;kput(LEAF,p,qEuler(0,ry,0),[c,c*(.45+.6*S.flat),c],col);}
   else kput(LEAF,p,qq,[s,s*.62,s],col);}});
 // ---- hangings: ghostwood racemes, baobab pods (the biome's own items) -----
 if(BIOK&&S.hang)HANG.forEach(h=>{if(rng()<.45)return;
  if(S.hang==='raceme'){const L=rr(9,16);
   kput('hyRaceme',[h[0],h[1],h[2]],qEuler(0,rr(0,TAU),0),[L*.42,L,L*.42],
    new THREE.Color(HYPERJUNGLE.SPECIES[1].flower[Math.floor(rng()*3)]).multiplyScalar(1.3));}
  else{const L=rr(12,18);
   kput('hyPod',[h[0],h[1],h[2]],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),L,
    new THREE.Color(HYPERJUNGLE.SPECIES[3].pod).multiplyScalar(rr(.85,1.15)));}});
}
