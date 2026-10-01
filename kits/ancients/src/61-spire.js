// ================================================================= MEGASTRUCTURE 3 — "Vashtir" (recursive spire)
// A pale pyramid-mountain grown, not stacked. One broad, shallow, many-sided
// tier is the seed form: a star-faceted cone with sharp vertical arrises, deep
// re-entrant valleys between them and a stepped, flaring shelf every third of
// its height. Out of the ridge crests on its shoulders grow smaller copies of
// the same form, tilted outward and up, and out of those smaller ones again,
// three levels deep. The trunk is a chain of six such tiers, each rooted low
// enough to emerge through the flank of the one below, so the whole reads as a
// single triangular mass that frays into spines and blade-fins at its edges.
//
// The plan radius and the profile are both PIECEWISE LINEAR, and the grid is
// sampled at 4-8 columns per facet (see NUF), so the facets stay flat and the
// arrises read as edges instead of averaging back into a smooth cone. That one
// change is the difference between a crystalline mass and a heap of witch hats.
//
// Every recursion node bakes its own transform into its geometry and is pushed
// into one array: the whole ~380-node hierarchy is ONE merged mesh per material,
// not one mesh per node. Blade fins, twig spikes, cable stays, the plinth and
// the buttress piers all go through the instancing kit.
kdef('spFinW',new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,-.5),new THREE.Vector2(1,-.05),new THREE.Vector2(1,.05),new THREE.Vector2(0,.5)])),MAT.white);
kdef('spFinR',new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,-.5),new THREE.Vector2(1,-.05),new THREE.Vector2(1,.05),new THREE.Vector2(0,.5)])),MAT.rust);
kdef('spSpikeW',new THREE.ConeGeometry(1,1,5).translate(0,.5,0),MAT.white);
kdef('spSpikeR',new THREE.ConeGeometry(1,1,5).translate(0,.5,0),MAT.rust);

function buildSpire(scene,gx,gz,d){reseed(9310+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const skin=SHELL(d);
 const BASE=330,TOP=512;                                   // ~660 m across, ~512 m tall
 REGISTER({name:'Vashtir — the Recursive Spire ('+STATE(d)+')',x:0,z:0,r:BASE+150,h:TOP+16});
 REGISTER({name:'Vashtir — plinth and buttressed feet ('+STATE(d)+')',x:0,z:0,r:BASE+100,h:24});
 REGISTER({name:'Vashtir — the crown ('+STATE(d)+')',x:0,z:0,r:130,y:258,h:262});

 // ---------------------------------------------------------------- the seed form
 // Plan: triangle wave between a crest radius R and a valley radius R*inner, so
 // every face is planar. Profile: a straight-ish taper with `shelf` flaring
 // bands, each cut back sharply at its top into a downward-facing ledge.
 const rOf=(R,sides,inner,pw,shelf,tw,th,t)=>{
  const f=(th+tw*t)*sides/TAU;
  const w=Math.abs(2*(f-Math.floor(f))-1);
  return R*Math.pow(1-t,pw)*(inner+(1-inner)*w)*(1+.16*((t*shelf)%1));};
 const tierGeo=(R,H,sides,inner,pw,shelf,tw,nu,nv,hole)=>gridSurface((u,v)=>{
  const th=u*TAU,t=v*.997,r=rOf(R,sides,inner,pw,shelf,tw,th,t);
  return[r*Math.cos(th),H*v,r*Math.sin(th)];},nu,nv,{uS:R*TAU/24,vS:H/24,hole});

 const shells=[],cores=[],tips=[];
 const INNER=[.60,.63,.67,.72],PW=[1.05,1.12,1.18,1.22],SHELF=[3,2,2,2];
 const NUF=[8,8,6,4],NV=[18,12,8,4];                       // grid columns per facet; rows
 const NK=[0,3,3,0];                                       // children a node at that depth spawns
 const FIN=d>0?'spFinR':'spFinW',SPK=d>0?'spSpikeR':'spSpikeW';
 const SNAP=[.05,.20,.42];                                 // ruined: chance a child is missing
 const T0=[.24,.30,.34],T1=[.72,.68,.64];                  // where on the parent children sprout
 const SLEN=[1.20,1.05,1.05];                              // how much more slender each child is

 const node=(M,R,H,sides,dep,nk,sd)=>{
  const inner=INNER[dep],shelf=SHELF[dep],tw=rr(-.05,.05);
  // jittering the profile exponent per node is what stops the recursion looking
  // like a screensaver: some tiers come out needle-sharp, some blunt and domed
  const pw=PW[dep]*rr(.78,1.30);
  const hf=holeFn(d*[.95,1.2,1.35,1.45][dep],9310+sd*3.7+dep*11,dep<=1?H:null,.7+dep*.5);
  const g=tierGeo(R,H,sides,inner,pw,shelf,tw,sides*NUF[dep],NV[dep],hf?(u,v)=>hf(u,v*H):null);
  g.applyMatrix4(M);shells.push(g);
  // CAP THE BASE. A tier is a surface, not a solid: where a tilted child's base
  // rim clears its parent's flank you were looking up inside the cone at its
  // DoubleSide backface, which the hemisphere light paints brown. Seating the
  // child deeper only hid most of it. The rim is a star, not a circle, so the
  // cap has to be swept from the same rOf() the shell uses.
  if(dep>0){const cap=gridSurface((u,v)=>{const th=u*TAU;
    const r=rOf(R,sides,inner,pw,shelf,tw,th,0)*v;
    return[r*Math.cos(th),H*.004,r*Math.sin(th)];},sides*NUF[dep],2,{uS:R/8,vS:1});
   cap.applyMatrix4(M);shells.push(cap);}
  // a dark core just inside the valley radius: it only shows through the holes
  if(dep===0){const gi=tierGeo(R*inner*.92,H*.9,sides,.9,pw,1,tw,sides*3,6,null);
   gi.applyMatrix4(M);cores.push(gi);}
  const MQ=new THREE.Quaternion().setFromRotationMatrix(M);
  const wp=(x,y,z)=>{const p=new THREE.Vector3(x,y,z).applyMatrix4(M);return[p.x,p.y,p.z];};
  const surf=(th,t,o)=>{const r=rOf(R,sides,inner,pw,shelf,tw,th,t)*(o||1);
   return wp(r*Math.cos(th),H*t,r*Math.sin(th));};
  // structural ribs picked out along every arris, one per shelf band: without
  // them the facets read as folded paper rather than as a panelled metal mass
  if(dep<=1)for(let a=0;a<sides;a++)for(let b=0;b<shelf;b++){
   if(d>0&&rng()<.30)continue;
   const tA=b/shelf+.015,tB=(b+1)/shelf-.025,th=a*TAU/sides-tw*(tA+tB)*.5;
   beam(PLATE(d),surf(th,tA,1.006),surf(th,tB,1.006),R*.030,R*.052);}
  // thin radiating blade-fins, hanging out of the flanks and under the shelves
  if(dep<=1){const nf=sides*(dep===0?3:2);
   for(let k=0;k<nf;k++){if(d>0&&rng()<.38)continue;
    const th=(k+.5)/nf*TAU+rr(-.06,.06),t=rr(.14,.80);
    const r=rOf(R,sides,inner,pw,shelf,tw,th,t)*.99;
    kput(FIN,wp(r*Math.cos(th),H*t,r*Math.sin(th)),
     MQ.clone().multiply(qEuler(0,-th,0)).multiply(qEuler(0,0,-rr(.12,.9))),
     [R*rr(.16,.38)*(1-.5*t),R*rr(.06,.17)*(1-.4*t),1],null);}}
  // twigs: a spike or two off the finest tiers
  if(dep===3)for(let k=0;k<2;k++){if(rng()<.38)continue;
   const th=rng()*TAU,t=rr(.4,.9),r=rOf(R,sides,inner,pw,shelf,tw,th,t);
   kput(SPK,wp(r*Math.cos(th),H*t,r*Math.sin(th)),
    MQ.clone().multiply(qEuler(0,-th,0)).multiply(qEuler(0,0,-rr(.45,1.15))),
    [R*rr(.10,.20),R*rr(.6,1.5),R*rr(.10,.20)],null);}
  if(dep>=3||nk<=0)return;
  // ---- children: smaller copies of the same form off the ridge crests ----
  for(let k=0;k<nk;k++){
   if(d>0&&rng()<SNAP[dep])continue;                       // snapped off and gone
   const big=dep===0&&k===0;                               // one companion spire per trunk tier
   const t=big?rr(.20,.38):rr(T0[dep],T1[dep]);
   const th=Math.round((k+rr(-.25,.25))/nk*sides)*TAU/sides-tw*t+rr(-.05,.05);
   const r=rOf(R,sides,inner,pw,shelf,tw,th,t);
   let s=(big?rr(.52,.68):rr(.32,.50))*(1-.22*t);   // fewer children, each larger:
   // the reference reads as pyramids nested inside pyramids, not as fuzz
   if(!big&&rng()<.16)s*=rr(.52,.78);                      // some are stunted
   const cR=R*s,cH=H*s*rr(.95,1.35)*SLEN[dep];
   const cM=M.clone().multiply(new THREE.Matrix4().compose(
    // seated well inside the parent: a child rooted on the surface leaves its
    // open base rim clear of the flank, and you see up into the shell's brown
    // backface through the gap
    new THREE.Vector3(r*Math.cos(th)*.72,H*t-cR*.30,r*Math.sin(th)*.72),
    qEuler(0,-th,0).multiply(qEuler(0,0,(big?-rr(.05,.20):-rr(.18,.50))-dep*.11)).multiply(qEuler(0,rng()*TAU,0)),
    new THREE.Vector3(1,1,1)));
   node(cM,cR,cH,Math.max(4,sides-1+(rng()<.3?1:0)),dep+1,NK[dep+1],sd*3+k+1);
   if(dep<=1){const tp=new THREE.Vector3(0,cH*.92,0).applyMatrix4(cM);
    tips.push({p:[tp.x,tp.y,tp.z],dep});}}
 };

 // ---------------------------------------------------------------- the trunk
 const CH=[[6,330,205,6,0,5],[48,258,265,6,.29,5],[148,168,235,6,.55,4],
           [262,96,180,5,.18,4],[358,46,120,5,.63,3],[440,18,72,4,.30,0]];
 let lx=0,lz=0;
 CH.forEach((c,i)=>{
  node(new THREE.Matrix4().compose(new THREE.Vector3(lx,c[0],lz),
   qEuler(rr(-.012,.012),c[4],rr(-.012,.012)),new THREE.Vector3(1,1,1)),
   c[1],c[2],c[3],0,c[5],i*17+3);
  lx+=rr(-4,4);lz+=rr(-4,4);});
 meshMerged(shells,skin,G);
 meshMerged(cores,d>0?MAT.guts:MAT.dark,G);

 // ---------------------------------------------------------------- infill webs
 // A membrane slung from each shoulder: it hangs taut off the arrises and sags
 // between them, so it scallops. Blue glass while it stands; a torn dark skin
 // once the glass is gone.
 CH.forEach((c,i)=>{if(i>3)return;
  const R=c[1],H=c[2],sides=c[3],inner=INNER[0],pw=PW[0];
  const tA=rr(.30,.44),drop=R*rr(.34,.52);
  const wg=gridSurface((u,v)=>{
   const th=u*TAU,f=th*sides/TAU,w=Math.abs(2*(f-Math.floor(f))-1);
   const rin=rOf(R,sides,inner,pw,SHELF[0],0,th,tA);
   const rv=rin*(1+.34*v);
   return[rv*Math.cos(th),c[0]+H*tA-drop*(1-w*.86)*Math.pow(v,1.25)-v*drop*.10,rv*Math.sin(th)];},
   sides*10,5,{uS:R/6,vS:2,hole:d>0?(u,v)=>fbm(u*11,v*4,9340+i,3)<.74:null});
  mesh(wg,d>0?MAT.guts:MAT.glass,G);});

 // ---------------------------------------------------------------- parasol fans
 // What makes the reference read the way it does is not its outline — it is that
 // it is TRANSLUCENT, so you see pyramids through pyramids, layer behind layer.
 // A solid white mass in the same silhouette reads as a mountain instead. These
 // are broad, shallow, scalloped glass fans thrown out horizontally from each
 // tier's shoulder: the structure now has something to be seen *through*.
 //
 // Left as separate meshes rather than merged: transparent geometry is sorted
 // per mesh, and eight fans at eight different heights want eight sort keys.
 // Eight extra draw calls on a structure that sits at 27 is a fair trade.
 CH.forEach((c,i)=>{if(i>4)return;
  const R=c[1],H=c[2],sides=c[3];
  for(let b=0;b<2;b++){
   const t=b?rr(.52,.66):rr(.16,.30);
   const rin=rOf(R,sides,INNER[0],PW[0],SHELF[0],0,0,t);
   const out=rin*(b?rr(1.35,1.75):rr(1.7,2.3));
   const fan=gridSurface((u,v)=>{
    const th=u*TAU,f=th*sides/TAU,w=Math.abs(2*(f-Math.floor(f))-1);
    // scalloped edge: reaches furthest on the arrises, cut back in the valleys
    const rr0=lerp(rOf(R,sides,INNER[0],PW[0],SHELF[0],0,th,t)*.96,out*(.62+.38*w),v);
    // and it droops as it goes out, so it is a parasol and not a dinner plate
    return[rr0*Math.cos(th),c[0]+H*t-Math.pow(v,1.7)*out*(.16+.10*(1-w)),rr0*Math.sin(th)];},
    sides*9,4,{uS:R/7,vS:2,hole:d>0?(u,v)=>fbm(u*13,v*5,9360+i*3+b,3)<.66:null});
   mesh(fan,d>0?MAT.guts:MAT.glass,G);}});
 // ---------------------------------------------------------------- cable stays
 tips.forEach(tp=>{if(rng()<(d>0?.74:.52))return;
  const p=tp.p,ay=Math.max(10,p[1]-rr(70,190));
  beam('boxD',p,[p[0]*.42,ay,p[2]*.42],.55,.55);});
 tips.filter(t=>t.dep===0&&t.p[1]<220).forEach(tp=>{if(rng()<(d>0?.7:.45))return;
  const s=1.12+rng()*.32;beam('boxD',tp.p,[tp.p[0]*s,3,tp.p[2]*s],.9,.9);});

 // ---------------------------------------------------------------- ground works
 kput(SLABC(d),[0,2,0],null,[BASE+72,4,BASE+72],null);       // outer terrace
 kput(SLABC(d),[0,6,0],null,[BASE+42,4,BASE+42],null);
 kput(SLABC(d),[0,10,0],null,[BASE+16,4,BASE+16],null);      // plinth the mass stands on
 for(let k=0;k<44;k++){const th=k/44*TAU;                             // massive kerb blocks round the rim
  kput(BOXC(d),[Math.cos(th)*(BASE+70),rr(2,5),Math.sin(th)*(BASE+70)],qEuler(0,-th,0),
   [rr(8,15),rr(4,9),rr(40,58)],null);}
 for(let k=0;k<6;k++){const th=k/6*TAU+.3,L=rr(130,270);              // a causeway out from each portal stair
  kput(BOXC(d),[Math.cos(th)*(BASE+66+L/2),2,Math.sin(th)*(BASE+66+L/2)],qEuler(0,-th,0),[L,4,rr(30,44)],null);
  for(const sg of[-1,1])kput(BOXC(d),[Math.cos(th)*(BASE+66+L/2)-Math.sin(th)*sg*20,4,Math.sin(th)*(BASE+66+L/2)+Math.cos(th)*sg*20],
   qEuler(0,-th,0),[L*.94,8,5],null);}                                // its parapet walls
 for(let k=0;k<16;k++){const th=(k+.5)/16*TAU+rr(-.04,.04);           // raking buttress piers
  const yT=rr(54,118),rO=BASE+rr(22,62);
  const rI=rOf(BASE,6,INNER[0],PW[0],SHELF[0],0,th,yT/205)*.94;
  beam(BOXC(d),[Math.cos(th)*rO,2,Math.sin(th)*rO],[Math.cos(th)*rI,yT,Math.sin(th)*rI],rr(11,21),rr(16,34));
  kput(BOXC(d),[Math.cos(th)*rO,rr(8,17),Math.sin(th)*rO],qEuler(0,-th,0),[rr(22,38),rr(16,34),rr(20,36)],null);}
 // The only human-scale thing anywhere on it: six portals at the foot, each with
 // a threshold slab and a flight of 0.5 m steps running down across the terraces.
 for(let k=0;k<6;k++){const th=k/6*TAU+.3,r=rOf(BASE,6,INNER[0],PW[0],SHELF[0],0,th,.05)*.985;
  kput('archOpen',[Math.cos(th)*r,16.5,Math.sin(th)*r],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);
  kput(BOXC(d),[Math.cos(th)*(r+13),13.2,Math.sin(th)*(r+13)],qEuler(0,-th,0),[24,2.4,32],null);
  for(let j=0;j<23;j++){const rs=BASE+17+j*3.3,ys=12-j*.52;if(ys<.4)break;
   kput(BOXC(d),[Math.cos(th)*rs,ys,Math.sin(th)*rs],qEuler(0,-th,0),[3.3,1.1,15],null);}}
 for(let i=0;i<3;i++)stripRing(0,CH[i][0]+CH[i][2]*.40,0,
  rOf(CH[i][1],CH[i][3],INNER[0],PW[0],SHELF[0],0,0,.40)*.86,d,Math.max(10,Math.round(CH[i][1]*.06)));

 // ---------------------------------------------------------------- ruin
 if(d>0){
  // snapped-off branches lying where they fell
  for(let k=0;k<3;k++){const F=new THREE.Group();
   const th=rng()*TAU,rad=rr(BASE*.80,BASE*1.34);
   F.position.set(Math.cos(th)*rad,0,Math.sin(th)*rad);
   F.rotation.set(rr(-.45,.45),rng()*TAU,rr(1.05,2.05));
   const R0=rr(48,86),H0=R0*rr(1.3,2.1),fg=[],hh=holeFn(1,9330+k,null,1.4);
   fg.push(tierGeo(R0,H0,5,.62,1.12,2,0,40,12,(u,v)=>hh(u,v*H0)));
   for(let c=0;c<2;c++){const g2=tierGeo(R0*rr(.30,.44),H0*rr(.34,.48),4,.66,1.18,1,0,24,7,null);
    g2.applyMatrix4(new THREE.Matrix4().compose(
     new THREE.Vector3(R0*rr(.35,.55)*Math.cos(c*2.4),H0*rr(.3,.55),R0*rr(.35,.55)*Math.sin(c*2.4)),
     qEuler(rr(-.5,.5),rng()*TAU,rr(.5,1.1)),new THREE.Vector3(1,1,1)));
    fg.push(g2);}
   meshMerged(fg,MAT.rust,F);G.add(F);dropFragment(F,0,rr(2,7));}
  rubbleRing(0,0,0,BASE*.88,BASE+165,210,4.5);
  scatterMoss(0,0,0,BASE*.45,BASE+250,200,4);
  mossOnRing(0,12,0,BASE+22,54,3);
  trees(0,0,BASE+110,BASE+340,28);
  vinesOnRing(0,20,0,BASE*.92,64,55);
  vinesOnRing(0,160,0,150,34,44);
 }
 // human scale: on the plain at the foot of three of the six stairs
 figures(Math.cos(.45)*(BASE+104),Math.sin(.45)*(BASE+104),8,22);
 figures(Math.cos(2.234)*(BASE+112),Math.sin(2.234)*(BASE+112),6,20);
 figures(Math.cos(4.629)*(BASE+98),Math.sin(4.629)*(BASE+98),5,18);
 KOFF=[0,0,0];return G;}
