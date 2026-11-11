// ================================================================= OUTLANDS — the other five colony types placed, and the decay layer
// PLAN.md section 4, "Placement", for the types 55-outl-forms-more.js defines: each form inside its own colony's territory by its ROLE
// (60-outl-colonies.js's pass: KRAND by cell and salt, never draw order). A station lists its types (OUTL.STATION_TYPES) and hands each
// a zone field z_<type> (60's allow); the fields the roles read are the host's (BIO.field): nest (the hexapods' nests), shore (a water's
// edge, 0..1), stone (stony ground), salt (the pan), carrion, deadwood, dark. A field the host does not give reads 0.
//   nursery  rosette spread; gallstack over the nests; podtower toward the centre; broodpad (NURSE) by the nests
//   steppe   needlefur spread (near the eye: the host's `near` field, where it gives one); greycush spread; sacbrush toward the centre; ember (WARDEN) on the seams, in hedges
//   salt     brinefilm on the brine's rim; glasstube on the pan; saltfan (BREEDER and PUMP) at the brine's lip
//   river    mirepad floating on the water (.3-2.5 m deep); pipereed in the shallows; glowbell on the edge
//   rim      icecrust on the stones; frostpuff spread; pebblemat (RUNNER) on the colony's reach
// The decay layer (OUTL.buildDecay) is solitary: no colony, placed where the host's deadwood, carrion and dark fields say.
(function(){const {TAU,clamp,lerp,smooth,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const PAL=OUTL.PAL,C=OUTL.C,FG=BIO.fung;
const HF=()=>BIO.host.fields||{},fd=(n,x,z)=>typeof HF()[n]==='function'?BIO.field(n,x,z):0;
const Y=(x,z)=>BIO.terrainH(x,z),W=(x,z)=>BIO.waterH(x,z);
const col=(set,k)=>{const c=C(pick(set));if(k!=null)c.multiplyScalar(k);c.offsetHSL((rng()-.5)*.03,(rng()-.5)*.06,(rng()-.5)*.05);return c;};
const hh=(s,x,z)=>KRAND.hash(s,Math.floor(x*4),Math.floor(z*4));
OUTL.placeMore=function(has,pass,M,A,lab,note,Q,opt){const F=OUTL.byKey,sq=Math.sqrt(Q);

 // ======================================================== THE NURSERY COLONY (the Nursery Bench's pavement; the plains' dry ground)
 if(has('nursery')){
  BIO.range=520;
  pass(F.rosette,8/sq,(x,z,A)=>.7,(x,y,z,c)=>{const s=rr(.2,.6),S=F.rosette;
   BIO.put('crust',[x,y+.03,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[s,1,s*rr(.85,1)],col(PAL.rosette),{label:lab(S,c)});note(S,c,x,z,y);},{r:.4,patch:.6});
  BIO.range=null;
  // the gall stack: drinker, sealed galls grown over a buried nest (the host's nest field)
  pass(F.gallstack,14/sq,(x,z,A)=>smooth(.15,.6,fd('nest',x,z))*.9,(x,y,z,c)=>{const S=F.gallstack,lb=lab(S,c),n=ri(2,4);let yy=y-.15,r=rr(.5,.8);
   for(let k=0;k<n;k++){const h=r*rr(.8,1.1);BIO.put('gall',[x+rr(-.08,.08),yy,z+rr(-.08,.08)],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[r,h,r],col(k%2?PAL.gall.slice(2):PAL.gall.slice(0,2)),{label:lb});
    yy+=h*.85;r*=rr(.7,.82);}
   note(S,c,x,z,y,{H:yy-y});},{r:1.2});
  // the pod tower: breeder, toward the colony's centre; its egg chambers dark pods set into its flanks
  pass(F.podtower,26/sq,(x,z,A)=>Math.pow(1-A.u,1.2)*.85,(x,y,z,c)=>{const S=F.podtower,lb=lab(S,c),H=rr(3,6)*(.75+.25*c.age),r=rr(.55,.9),ry=rr(0,TAU);
   BIO.put('tower',[x,y-.25,z],qEuler(rr(-.04,.04),ry,rr(-.04,.04)),[r,H/3,r],col(PAL.tower),{label:lb});
   const n=ri(5,9);for(let k=0;k<n;k++){const t=.15+.7*KRAND.unit(KRAND.hash(hh(5601,x,z),k,1)),a=ry+k*2.4,rr0=r*(1-.6*t)*.92,s=rr(.12,.2);
    BIO.put('pod2',[x+Math.cos(a)*rr0,y-.25+H*t,z+Math.sin(a)*rr0],qUp([Math.cos(a),.2,Math.sin(a)]),[s,s*1.2,s],col(PAL.chamber),{label:lb+' (an egg chamber)'});}
   note(S,c,x,z,y,{H});},{r:1.6});
  // the brood pad: NURSE, by the nests, flat on the ground, its eggs on top
  pass(F.broodpad,12/sq,(x,z,A)=>smooth(.05,.45,fd('nest',x,z))*.9,(x,y,z,c)=>{const S=F.broodpad,lb=lab(S,c),r=rr(.5,1.5),ry=rr(0,TAU);
   BIO.put('pad',[x,y+.02,z],qEuler(0,ry,0),[r,r*.6,r*rr(.7,1)],col(PAL.pad),{label:lb});
   const n=ri(4,9);for(let k=0;k<n;k++){const a=ry+k*2.4+rr(-.3,.3),d=r*.6*Math.sqrt(KRAND.unit(KRAND.hash(hh(5603,x,z),k,1))),s=rr(.06,.1);
    BIO.put('egg',[x+Math.cos(a)*d,y+.02+.05*r*.6,z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*1.3,s],col(PAL.egg),{label:lb+' (its eggs)'});}
   note(S,c,x,z,y,{nest:fd('nest',x,z)});},{r:1.6});
 }

 // ======================================================== THE STEPPE COLONY (the plains: the cracked mosaic from a height)
 if(has('steppe')){
  BIO.range=180;
  pass(F.needlefur,7/sq,(x,z,A)=>.75*(typeof HF().near==='function'?fd('near',x,z):1),(x,y,z,c)=>{const S=F.needlefur,s=rr(.25,.5);
   BIO.put('fur',[x,y-.03,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*1.4,s,s*1.4],col(PAL.fur),{label:lab(S,c)});note(S,c,x,z,y);},{r:.3,patch:.55});
  BIO.range=650;
  pass(F.greycush,16/sq,(x,z,A)=>.6*(1-.5*fd('slope',x,z)),(x,y,z,c)=>{const S=F.greycush,r=rr(.3,1)*(.8+.2*c.age);
   BIO.put('cushion',[x,y-.08*r,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[r,r*rr(.55,.8),r*rr(.85,1)],col(PAL.cush),{label:lab(S,c)});note(S,c,x,z,y,{r});},{r:1.1});
  BIO.range=null;
  // the sac brush: breeder, toward the centre: wiry stems, a sac at each tip
  BIO.range=550;
  pass(F.sacbrush,24/sq,(x,z,A)=>Math.pow(1-A.u,1.1)*.8,(x,y,z,c)=>{const S=F.sacbrush,lb=lab(S,c),n=ri(3,5),H=rr(.6,1.2);
   for(let k=0;k<n;k++){const a=k*2.4+rr(-.3,.3),lean=rr(.15,.45),h=H*rr(.7,1),tip=[Math.sin(lean)*Math.cos(a)*h,Math.cos(lean)*h,Math.sin(lean)*Math.sin(a)*h],s=rr(.07,.12);
    BIO.put('twig',[x,y-.05,z],qUp(tip),[.18,h,.18],col(PAL.fur,.8),{label:lb});
    BIO.put('sac',[x+tip[0],y-.05+tip[1]-.02,z+tip[2]],qUp(tip),[s,s*1.3,s],col(PAL.sac),{label:lb});}
   note(S,c,x,z,y,{H});},{r:1});
  BIO.range=null;
  // the ember scrub: WARDEN, on the seams in hedges (every few metres along the seam, its own colony's side)
  pass(F.ember,8/Math.sqrt(Math.min(1,Q)),(x,z,A)=>.65,(x,y,z,c,A)=>{const S=F.ember,lb=lab(S,c),H=rr(.8,1.5),w=rr(.7,1.2);
   BIO.put('tubeS',[x,y-.05,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[w,H,w],col(PAL.ember),{label:lb});
   note(S,c,x,z,y,{H,seam:true,c2:A.c2?A.c2.id:null,c2type:A.c2?A.c2.type:null});});
 }

 // ======================================================== THE SALT COLONY (the salt lake's pans)
 if(has('salt')){
  BIO.range=700;
  pass(F.brinefilm,5/sq,(x,z,A)=>smooth(.3,.8,fd('shore',x,z))*.85,(x,y,z,c)=>{const S=F.brinefilm,s=rr(.6,1.6);
   BIO.put('crust',[x,y+.03,z],qEuler(0,rr(0,TAU),0),[s,1,s*rr(.5,.9)],col(PAL.brine),{label:lab(S,c)});note(S,c,x,z,y);},{r:.4,patch:.5});
  BIO.range=null;
  pass(F.glasstube,10/sq,(x,z,A)=>smooth(.2,.6,fd('salt',x,z))*.7,(x,y,z,c)=>{const S=F.glasstube,H=rr(.5,1.4),w=rr(.35,.7);
   BIO.put('tube',[x,y-.05,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[w,H,w],col(PAL.glass),{label:lab(S,c)});note(S,c,x,z,y,{H});},{r:.8});
  // the salt fan: the breeder and the pump in one, at the brine's lip, crusted white
  pass(F.saltfan,7/sq,(x,z,A)=>smooth(.45,.85,fd('shore',x,z))*.85,(x,y,z,c)=>{const S=F.saltfan,lb=lab(S,c),n=ri(2,4);
   for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,.8):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.4,.8);
    BIO.put('bracket',[px,Y(px,pz)-.04,pz],qEuler(-Math.PI/2+rr(-.2,.2),rr(0,TAU),rr(-.15,.15)),[s,s,s*.8],col(PAL.saltfan),{label:lb});}
   note(S,c,x,z,y,{pump:true});},{r:1});
 }

 // ======================================================== THE LAKE COLONY: the river type (the lake's shallows; the mires' pools)
 if(has('river')){
  // the mire pad: collector, FLOATING on water .3-2.5 m deep (no root mask: it does not root; its level is the water's)
  const nr=(x,z)=>typeof HF().near==='function'?fd('near',x,z):1;   /* the pool forms near the eye where the host gives a `near` field: a mire's every pool would be millions */
  pass(F.mirepad,6/sq,(x,z,A)=>.75*nr(x,z),(x,y,z,c)=>{const S=F.mirepad,lb=lab(S,c),n=ri(1,4),wl=W(x,z);
   for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.2):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,r=rr(.5,1.3);
    if(W(px,pz)-Y(px,pz)<.2)continue;
    BIO.put('mpad',[px,wl+.02,pz],qEuler(0,rr(0,TAU),0),[r,r*.4,r*rr(.8,1)],col(PAL.mire),{label:lb});}
   note(S,c,x,z,wl,{float:true});},{r:1,grid:{noMask:true,depth:[.3,2.5]},patch:.5});
  // the pipe reed: drinker, in the shallows (its intakes under water, the tubes standing out of it)
  pass(F.pipereed,5/sq,(x,z,A)=>.7*(.25+.75*nr(x,z)),(x,y,z,c)=>{const S=F.pipereed,H=rr(2,4),w=rr(.35,.6);
   BIO.put('tubeS',[x,y-.1,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[w,H,w],col(PAL.pipe),{label:lab(S,c)});note(S,c,x,z,y,{H,wet:true});},{r:.6,grid:{noMask:true,depth:[.02,.9]},patch:.6});
  // the glow bell: breeder, on the water's edge
  pass(F.glowbell,9/sq,(x,z,A)=>smooth(.35,.8,fd('shore',x,z))*.8,(x,y,z,c)=>{const S=F.glowbell,H=rr(.6,1.2),w=rr(.35,.55);
   BIO.put('tubeglow',[x,y-.06,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[w,H,w],col(PAL.glowb),{label:lab(S,c)});note(S,c,x,z,y,{H});},{r:.7});
 }

 // ======================================================== THE RIM COLONY (the cold tops: the mires' palsas)
 if(has('rim')){
  BIO.range=450;
  pass(F.icecrust,5/sq,(x,z,A)=>.25+.6*fd('stone',x,z),(x,y,z,c)=>{const S=F.icecrust,s=rr(.3,.8),e=1.5,
    gx=(Y(x+e,z)-Y(x-e,z))/(2*e),gz=(Y(x,z+e)-Y(x,z-e))/(2*e),n=[-gx,1,-gz];
   BIO.put('crust',[x,y+.04,z],qUp(n),[s,1,s*rr(.6,1)],col(PAL.icec),{label:lab(S,c),n});note(S,c,x,z,y);},{r:.4,cliff:true,patch:.5});
  pass(F.frostpuff,6/sq,(x,z,A)=>.65,(x,y,z,c)=>{const S=F.frostpuff,lb=lab(S,c);
   for(const p of FG.troop({n:ri(3,8),r:.7,size:[.1,.22],flat:[.85,1],tilt:.05,seed:hh(5605,x,z)}))
    BIO.put('puff',[x+p.p[0],Y(x+p.p[0],z+p.p[2])-.03,z+p.p[2]],FG.Q(p.q),[p.s[0],p.s[1]/1.7*2,p.s[2]],col(PAL.puff),{label:lb});
   note(S,c,x,z,y);},{r:.8,patch:.6});
  // the pebble mat: RUNNER, on the colony's reach (level 1): living plates among the real stones
  pass(F.pebblemat,7/sq,(x,z,A)=>.7,(x,y,z,c)=>{const S=F.pebblemat,lb=lab(S,c),n=ri(3,7);
   for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(0,.9),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.12,.3);
    BIO.put('crust',[px,Y(px,pz)+.04,pz],qEuler(0,rr(0,TAU),0),[s,1,s*rr(.7,1)],col(PAL.pebble),{label:lb});}
   note(S,c,x,z,y);},{r:.6});
  BIO.range=null;
 }
};

// ======================================================== THE DECAY LAYER (solitary: no colony)
// opt: {R, quality}. Placed on BIO.grid's cell form where the host's deadwood, carrion or dark field says; each instance noted with no colony.
OUTL.buildDecay=function(R,q){const F=OUTL.byKey,sq=Math.sqrt(q==null?1:q),count=OUTL.PLACED,forms=OUTL.INST,out={logcrust:0,bonebloom:0,glowtubes:0};
 const note=(S,x,z,y,ex)=>{count[S.key]=(count[S.key]==null?0:count[S.key])+1;forms.push(Object.assign({key:S.key,role:S.role,type:null,colony:null,x,z,y},ex||{}));out[S.key]++;};
 const box={box:[-R,-R,R,R],patch:.3};
 // log crust: a fallen mast lying on the ground, smothered in plates and fans
 if(typeof HF().deadwood==='function')BIO.grid('outl:logcrust',30/sq,(x,z)=>smooth(.2,.7,fd('deadwood',x,z))*.8*(1-smooth(.3,.5,fd('slope',x,z))),(x,y,z)=>{
  const S=F.logcrust,L=rr(5,11),r=rr(.18,.3),a=rr(0,TAU),dx=Math.cos(a),dz=Math.sin(a),x1=x+dx*L,z1=z+dz*L,y1=Y(x1,z1),dir=[x1-x,y1-y,z1-z],lb=S.name+' (a fallen mast)';
  BIO.put('stalk',[x,y+r*.7,z],qUp(dir),[r/.08,Math.hypot(dir[0],dir[1],dir[2]),r/.08],col(PAL.mast,.75),{label:lb});
  const n=ri(4,8);for(let k=0;k<n;k++){const t=(k+.5)/n,px=x+dir[0]*t,pz=z+dir[2]*t,py=y+dir[1]*t+r*1.3,s=rr(.25,.5);
   BIO.put('bracket',[px,py,pz],qEuler(-Math.PI/2+rr(-.3,.3),rr(0,TAU),rr(-.2,.2)),[s,s,s*.6],col(PAL.logc),{label:lb});}
  note(S,x,z,y,{L});},Object.assign({},box,{pad:2}));
 // bone bloom: pale caps on a kill
 if(typeof HF().carrion==='function')BIO.grid('outl:bonebloom',40/sq,(x,z)=>smooth(.2,.7,fd('carrion',x,z))*.7,(x,y,z)=>{const S=F.bonebloom,lb=S.name+' (on carrion)';
  for(const p of FG.troop({n:ri(5,11),r:.8,size:[.08,.18],flat:[.8,1.1],tilt:.2,seed:hh(5607,x,z)}))
   BIO.put('capsm',[x+p.p[0],Y(x+p.p[0],z+p.p[2])-.03,z+p.p[2]],FG.Q(p.q),p.s,col(PAL.bone),{label:lb});
  note(S,x,z,y);},box);
 // glow tubes: in nests and dark rooms
 if(typeof HF().dark==='function')BIO.grid('outl:glowtubes',8/sq,(x,z)=>smooth(.2,.7,fd('dark',x,z))*.7,(x,y,z)=>{const S=F.glowtubes,H=rr(.3,.8),w=rr(.25,.45);
  BIO.put('tubeglow',[x,y-.04,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w,H,w],col(PAL.tubeg),{label:S.name});note(S,x,z,y,{H});},Object.assign({},box,{cliff:true}));
 return out;};
})();
