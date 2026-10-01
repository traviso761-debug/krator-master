// ================================================================= HYPERTREE — imported from Mav's Refuge
// A single Ironbark hypertree, for scale. The numbers are that project's own
// SPECIES[0]: height 410-470 m, base radius 25-29 m, crown starting at half
// height and reaching 170-215 m across. The trunk profile and the buttress
// model below are ports of its trunkR()/butF()/lobeSum(); the branching keeps
// its shape rules (golden-angle boughs, alternating secondaries, twigs off
// those) but is re-expressed with this kit's instanced primitives, because
// the original is written against its own merged-bucket tube builder.
//
// Nothing else from that project is imported -- no platforms, bridges, lifts
// or buildings. Just the tree.
kdef('bough',new THREE.CylinderGeometry(.5,.5,1,7),MAT.timber);
kdef('frond',new THREE.IcosahedronGeometry(1,0),MAT.turf);
const LEAFC=[0x1f3d24,0x254a2a,0x1a3520,0x2c5230];     // Ironbark needle greens
function buildHypertree(scene,gx,gz,d){reseed(9450+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const H=452,RB=27.5,CROWN0=.50,CR=196;
 REGISTER({name:'Ironbark hypertree — '+H+' m (Mav’s Refuge, for scale)',x:0,z:0,r:CR,h:H});
 REGISTER({name:'Ironbark hypertree — the bole',x:0,z:0,r:RB*2.2,h:H*CROWN0});
 const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 // trunk radius, verbatim from the source's trunkR() for species 0-2
 const trunkR=yy=>{const u=clamp(yy/H,0,1);
  const t=u<.62?1-.42*u:lerp(.74,.07,sm(.62,1,u));
  return RB*t*(1+.80*Math.exp(-yy/15));};
 // buttresses: a handful of lobes that only exist in the bottom 45 m
 const NL=7,LOB=[];
 for(let k=0;k<NL;k++)LOB.push({a:k/NL*TAU+rr(-.22,.22),amp:rr(.55,1.2),p:rr(1.6,2.6)});
 const lobeSum=ang=>{let s=0;for(const L of LOB){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,L.p);}return s;};
 const butF=yy=>yy<45?.55*Math.exp(-yy/16)*clamp((45-yy)/18,0,1):0;

 // ---- the bole ------------------------------------------------------------
 // v is raised to a power so the rings crowd near the ground, where the
 // buttress flare is: spaced evenly they read as a smooth cone instead.
 const BOLE=[gridSurface((u,v)=>{const th=u*TAU,yy=Math.pow(v,.82)*H*.99;
  const r=trunkR(yy)*(1+butF(yy)*lobeSum(th)
   +.010*Math.sin(3*th+yy*.045)+.007*Math.sin(7*th-yy*.10));
  return[r*Math.cos(th),yy,r*Math.sin(th)];},52,64,{uS:16,vS:38})];
 meshMerged(BOLE,MAT.timber,G);

 // ---- surface roots, one off each buttress ---------------------------------
 LOB.forEach(L=>{const len=rr(45,120)*(.6+.4*L.amp),R0=trunkR(7)*(1+.19*L.amp);
  const r0=clamp(RB*.17*L.amp,1.6,5.2),wob=rr(0,TAU);
  let px=Math.cos(L.a)*R0*.72,pz=Math.sin(L.a)*R0*.72,py=r0*1.6+5;
  for(let k=1;k<=7;k++){const t=k/7,a=L.a+.32*Math.sin(wob+t*5.2)*t+.10*Math.sin(wob*2+t*11);
   const dist=R0*.72+len*t,r=lerp(r0,.4,Math.pow(t,.75));
   const nx=Math.cos(a)*dist,nz=Math.sin(a)*dist,ny=terrainH(gx+nx,gz+nz)+r*.22;
   beam('bough',[px,py,pz],[nx,ny,nz],r*2,r*2);
   px=nx;py=ny;pz=nz;}});

 // ---- boughs ---------------------------------------------------------------
 const FOL=[];
 // one bough: a gravity/phototropic curve with a sideways wiggle, as the source
 const grow=(o,dir,len,rA,rB,n,curve,wig)=>{
  const sx=-dir[2],sz=dir[0],sl=Math.hypot(sx,sz)||1;
  const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,P=[];
  for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
   P.push([o[0]+dir[0]*len*t+sx/sl*w,o[1]+dir[1]*len*t+curve*len*t*t,
           o[2]+dir[2]*len*t+sz/sl*w,lerp(rA,rB,Math.pow(t,.8))]);}
  return P;};
 const skin=(P,seg)=>{for(let i=0;i<P.length-1;i++){
  const r=(P[i][3]+P[i+1][3])*.5;
  beam('bough',[P[i][0],P[i][1],P[i][2]],[P[i+1][0],P[i+1][1],P[i+1][2]],r*2,r*2);}};
 const side=(tx,ty,tz,s,a,b,c)=>{const sx=-tz*s,sz=tx*s,sl=Math.hypot(sx,sz)||1;
  const x=tx*a+sx/sl*b,y=ty*a+c,z=tz*a+sz/sl*b,l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];};
 const clump=(p,s)=>{FOL.push([p[0],p[1],p[2],s]);};

 const GOLD=2.399963,a0=rr(0,TAU);
 const limbs=[];
 const addBough=(u,ang,len,el,curve,rScale)=>{
  const y=H*u,r0=trunkR(y)*(u>.93?.6:1);
  const o=[Math.cos(ang)*Math.max(0,r0-1),y,Math.sin(ang)*Math.max(0,r0-1)];
  const dir=[Math.cos(ang)*Math.cos(el),Math.sin(el),Math.sin(ang)*Math.cos(el)];
  limbs.push(grow(o,dir,len,clamp(r0*rScale,.9,5.5),.5,8,curve,.06));};
 // SPECIES[0].crown0 is 0.50, i.e. the crown starts at half height. In the
 // source most of the lower crown hangs off the city's own structural
 // branches, which are not imported, so without a third tier here the trunk
 // stands bare to 72% and the tree reads as a palm.
 for(let k=0;k<8;k++) addBough(rr(.855,.955),a0+k*GOLD+rr(-.3,.3),CR*rr(.62,.92),rr(.22,.52),-.12,.62);
 for(let k=0;k<7;k++) addBough(rr(.72,.86),a0+1.2+k*GOLD+rr(-.3,.3),CR*rr(.62,.90),rr(.18,.42),-.16,.46);
 for(let k=0;k<7;k++) addBough(rr(.52,.70),a0+2.4+k*GOLD+rr(-.3,.3),CR*rr(.50,.78),rr(.02,.26),-.20,.40);
 // the crown lower bound, so no foliage hangs below where the source starts it
 const yMinFol=H*CROWN0-28;

 limbs.forEach(P=>{
  skin(P,8);
  const n=P.length;let s=-1;
  for(let i=2;i<n;i++){                      // secondaries, alternating sides
   const t=i/(n-1);
   const tx=P[i][0]-P[i-1][0],ty=P[i][1]-P[i-1][1],tz=P[i][2]-P[i-1][2];
   const tl=Math.hypot(tx,ty,tz)||1;s=-s;
   const len1=Math.max(14,CR*rr(.16,.26)*(1-.5*t));
   const d1=side(tx/tl,ty/tl,tz/tl,s,rr(.45,.8),rr(.7,1.1),.18+rr(-.12,.18));
   const rS=clamp(Math.min(P[i][3]*.62,len1*.032),.4,2.6);
   const sec=grow([P[i][0],P[i][1],P[i][2]],d1,len1,rS,.22,4,-.10,.07);
   skin(sec,5);
   const spr=clamp(len1*.26,8,20);
   for(let q=2;q<=4;q++)if(sec[q][1]>yMinFol)clump(sec[q],spr*(q===4?.9:1));
   let s2=-1;
   for(let j=1;j<=4;j++){                       // twigs off the secondary
    const ax=sec[j][0]-sec[j-1][0],ay=sec[j][1]-sec[j-1][1],az=sec[j][2]-sec[j-1][2];
    const al=Math.hypot(ax,ay,az)||1;s2=-s2;
    const len2=Math.max(8,len1*rr(.3,.5));
    const d2=side(ax/al,ay/al,az/al,s2,rr(.5,.9),rr(.6,1.0),.14+rr(-.15,.25));
    const tw=grow([sec[j][0],sec[j][1],sec[j][2]],d2,len2,Math.max(.25,sec[j][3]*.6),.12,2,-.10,.05);
    skin(tw,3);
    for(let q=1;q<=2;q++)if(tw[q][1]>yMinFol)clump(tw[q],clamp(len2*.42,6,13));}}});

 // ---- foliage --------------------------------------------------------------
 // Dark needle tiers. One blob per spot plus a couple of satellites, coloured
 // from the source's Ironbark leaf set.
 FOL.forEach(f=>{const n=2+Math.floor(rng()*3);
  for(let i=0;i<n;i++){const s=f[3]*rr(.55,1.05);
   kput('frond',[f[0]+rr(-.6,.6)*f[3],f[1]+rr(-.35,.35)*f[3],f[2]+rr(-.6,.6)*f[3]],
    qEuler(rng()*3,rng()*3,rng()*3),[s,s*.62,s],
    new THREE.Color(LEAFC[Math.floor(rng()*LEAFC.length)]));}});

 // NO APRON. apron() lays a graded disc of pale rock (d=0) or mud, and under
 // a tree either read as a paper disc laid on the plain in every preset. The
 // buttress flare and the surface roots are the ground contact.
 scatterMoss(0,0,0,RB*1.2,CR*.7,90,3.2);
 figures(RB*2.2,0,6,40);
 KOFF=[0,0,0];return G;}
