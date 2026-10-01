// ================================================================= DALAB — the ancient lab domes
// The genetic-engineering compound at the centre of Dalab: one great dome with
// a ring of smaller ones round it, joined by part-buried passageways, inside a
// low ruined wall. Heavily rusted and overgrown — this complex is never shown
// intact, because nobody alive built it.
//
// SCOPE: the ancient domes ONLY. No settlement, no mounds, no streets, no life
// layer. Those are laid out around this later.
//
// The domes are OPAQUE. Everywhere else in the kit an ancient shell reaches for
// blue glass; here it does not, and that is what makes the complex read as a
// facility rather than a temple. Gaudi ribs and a lantern at the apex, with the
// hard deliberate geometry of a 1999 arcology rather than a cathedral.
//
// OPEN: the great dome must be "wider and taller than the Voth palace" and that
// project's dimensions are not to hand. Built at DR=110 / DH=95, larger than
// anything in this kit but the megastructures. Rescale by DR/DH alone.
function dalabDome(C,R,H,d,sd,broken){
 const {SH,DK,G}=C;
 const prof=y=>R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.58);   // a dome, slightly shouldered
 // Where a dome is broken the hole predicate is not noise: it is one great bite
 // taken out of a quadrant, so the opening has an edge you can read a section
 // against instead of dissolving into lace.
 const bite=broken?(u,v)=>{const du=Math.abs(((u-broken.u+1.5)%1)-.5);
  return du<broken.w*(.35+.65*v)&&v>broken.y0;}:null;
 const hole=(u,y)=>{const v=y/H;
  return(bite&&bite(u,v))||(holeFn(d*.75,sd,null,1.25)||(()=>false))(u,y);};
 SH.push(lathe({rFn:prof,H,flutes:R>70?28:16,amp:.055,sharp:2,nu:R>70?128:72,nv:R>70?40:24,hole}).translate(C.x,0,C.z));
 // the inner skin: what you see across the void when a dome is opened up
 DK.push(lathe({rFn:y=>prof(y)*.93,H:H*.985,nu:48,nv:18,hole:(u,y)=>bite?bite(u,y/H):false}).translate(C.x,0,C.z));
 // ribs picked out along the meridians, and hoops round it
 for(let k=0;k<(R>70?28:16);k++){const th=k/(R>70?28:16)*TAU;
  if(broken&&bite(th/TAU,.6)&&rng()<.7)continue;
  const pts=[];for(let i=0;i<=9;i++){const y=H*i/9*.985;pts.push([prof(y)*1.02,y]);}
  for(let i=0;i<9;i++)beam(PLATE(d),[C.x+Math.cos(th)*pts[i][0],pts[i][1],C.z+Math.sin(th)*pts[i][0]],
   [C.x+Math.cos(th)*pts[i+1][0],pts[i+1][1],C.z+Math.sin(th)*pts[i+1][0]],R*.022,R*.030);}
 for(const t of [.22,.52,.80]){const r=prof(H*t)*1.03;
  kput(d>0?'ringR':'ringW',[C.x,H*t,C.z],qEuler(Math.PI/2,0,0),[r,r,R*.03],null);}
 // apex lantern — the one place light was meant to get in
 kput(SLABC(d),[C.x,H*.995,C.z],null,[R*.17,R*.03,R*.17],null);
 for(let k=0;k<10;k++){const th=k/10*TAU;
  kput(d>0?'colR':'colW',[C.x+Math.cos(th)*R*.14,H*.99,C.z+Math.sin(th)*R*.14],null,[R*.012,R*.09,R*.012],null);}
 kput(SLABC(d),[C.x,H*.99+R*.09,C.z],null,[R*.19,R*.025,R*.19],null);
 // overgrowth: this complex has stood open for a very long time
 mossOnRing(C.x,H*.06,C.z,R*.97,Math.round(R*.7),R*.035);
 vinesOnRing(C.x,H*.45,C.z,prof(H*.45)*1.02,Math.round(R*.35),R*.5);
 rubbleRing(C.x,0,C.z,R*1.0,R*1.5,Math.round(R*.7),R*.035);
 return prof;}

// A cross-section of what was inside: floor plates cut off at the break, a
// double-loaded corridor, ward rooms and lab rooms, and service cores running
// the full height. This is the kit's first real interior — the original brief
// has wanted one behind every opening since the start, and this is the same
// machinery, so it is written to be reusable rather than fitted to one dome.
function sectionInterior(C,R,H,d,sd){
 const {DK,G}=C;const FH=4.6;
 for(let f=1;f*FH<H*.86;f++){const y=f*FH,rr0=R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.58)*.9;
  if(rr0<R*.16)break;
  // floor plate
  DK.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0*v;return[C.x+r*Math.cos(th),y,C.z+r*Math.sin(th)];},40,5,{uS:R/6,vS:3}));
  // a double-loaded corridor: rooms, gangway, rooms
  for(const ring of [.42,.80]){
   DK.push(lathe({rFn:()=>rr0*ring,H:FH*.82,nu:36,nv:2,
    hole:(u,y2)=>((u*22)%1)<.34}).translate(C.x,y,C.z));}
  // room fit-out, alternating wards and labs by floor
  const ward=(f%2)===0,n=Math.max(6,Math.round(rr0*.26));
  for(let k=0;k<n;k++){const th=(k+.5)/n*TAU,r=rr0*.61;
   const px=C.x+r*Math.cos(th),pz=C.z+r*Math.sin(th),q=qEuler(0,-th,0);
   if(ward){ // beds in rows, a curtain rail over each
    for(const sg of [-1,1])kput('boxD',[px+Math.cos(th+1.57)*sg*rr0*.09,y+.5,pz+Math.sin(th+1.57)*sg*rr0*.09],q,[2.0,.9,.9],null);
    kput(d>0?'pipeR':'pipe',[px,y+2.4,pz],qEuler(0,-th,Math.PI/2),[.09,rr0*.26,.09],null);}
   else{     // benches, and a bank of specimen tanks against the corridor wall
    kput('boxD',[px,y+.9,pz],q,[rr0*.20,.22,1.1],null);
    for(let j=-1;j<=1;j++)kput(d>0?'colR':'colW',[px+Math.cos(th+1.57)*j*1.5,y+1.5,pz+Math.sin(th+1.57)*j*1.5],null,[.42,2.2,.42],null);}
   const lit=rng()<(d>0?.05:.5);
   kput('strip',[px,y+FH-.7,pz],q,[rr0*.18,1,1],lit?CYAN:DEAD);}
  // conduit bundles dropping through every floor
  for(let k=0;k<5;k++){const th=rng()*TAU,r=rr0*rr(.2,.9);
   kput(d>0?'pipeR':'pipe',[C.x+r*Math.cos(th),y+FH*.5,C.z+r*Math.sin(th)],null,[.28,FH,.28],null);}}
 // service cores: lift shafts and stairs, full height, the spine of the section
 for(let k=0;k<3;k++){const th=k/3*TAU+.7,r=R*.30;
  kput(BOXC(d),[C.x+r*Math.cos(th),H*.42,C.z+r*Math.sin(th)],qEuler(0,-th,0),[R*.12,H*.84,R*.12],null);
  kput('boxD',[C.x+r*Math.cos(th),H*.42,C.z+r*Math.sin(th)],qEuler(0,-th,0),[R*.10,H*.83,R*.10],null);}}

function buildDalab(scene,gx,gz,d){reseed(9330+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const DR=110,DH=95;                       // the great dome — see the note above
 REGISTER({name:'Dalab — the ancient lab ('+STATE(d)+')',x:0,z:0,r:300,h:DH+30});
 REGISTER({name:'Dalab — the great dome',x:0,z:0,r:DR+8,h:DH+22});
 const C={SH:[],DK:[],G,x:0,z:0};
 // the great dome, broken open on its south-east quarter
 dalabDome(C,DR,DH,d,9331,{u:.16,w:.115,y0:.10});
 sectionInterior(C,DR,DH,d,9332);
 // the sunken chamber on the axis: cabinet banks and cable trunking converging
 // on a circle of floor. A plant room to a stranger, a shrine to a priest.
 kput(SLABC(d),[0,1.2,0],null,[DR*.30,2.4,DR*.30],null);
 for(let k=0;k<16;k++){const th=k/16*TAU;
  kput(BOXC(d),[Math.cos(th)*DR*.235,4.4,Math.sin(th)*DR*.235],qEuler(0,-th,0),[5.5,6.4,3.2],null);
  kput(d>0?'pipeR':'pipe',[Math.cos(th)*DR*.30,8.6,Math.sin(th)*DR*.30],qEuler(0,-th,Math.PI/2),[.5,DR*.14,.5],null);
  const lit=d>0?rng()<.06:true;
  kput('strip',[Math.cos(th)*DR*.218,7.4,Math.sin(th)*DR*.218],qEuler(0,-th,0),[4,1,1],lit?CYAN:DEAD);}
 kput(d>0?'ringR':'ringW',[0,2.6,0],qEuler(Math.PI/2,0,0),[DR*.19,DR*.19,1.6],null);
 // the satellite domes, no two the same, two of them also broken open
 const SAT=[[178,-52,46,42,1],[126,152,34,31,0],[-86,176,40,36,1],
            [-192,26,29,27,0],[-138,-148,37,33,0],[54,-186,24,23,0],[205,88,31,28,0]];
 SAT.forEach((s,i)=>{const [sx,sz,sr,sh,brk]=s;
  const SC={SH:C.SH,DK:C.DK,G,x:sx,z:sz};
  REGISTER({name:'Dalab — dome '+(i+2),x:sx,z:sz,r:sr+6,h:sh+14});
  dalabDome(SC,sr,sh,d,9340+i*7,brk?{u:rr(0,1),w:.10,y0:.12}:null);
  if(brk)sectionInterior(SC,sr,sh,d,9350+i*5);
  // the passageway in: part buried, ribbed, with a clerestory along the top
  const a=Math.atan2(sz,sx),L=Math.hypot(sx,sz)-sr*.9-DR*.9;
  if(L>10){const mx=Math.cos(a)*(DR*.9+L/2),mz=Math.sin(a)*(DR*.9+L/2);
   C.SH.push(lathe({rFn:()=>7.5,H:L,nu:14,nv:Math.round(L/6),hole:holeFn(d*.8,9360+i,null,1.6)})
    .rotateZ(Math.PI/2).rotateY(-a).translate(mx,5.5,mz));
   for(let k=0;k<Math.round(L/9);k++){const t=(k+.5)/Math.round(L/9);
    const px=Math.cos(a)*(DR*.9+L*t),pz=Math.sin(a)*(DR*.9+L*t);
    kput(d>0?'ringR':'ringW',[px,5.5,pz],qEuler(0,-a,Math.PI/2),[8.2,8.2,1.1],null);
    if(rng()<.5)kput(d>0?'winSmD':'winSmI',[px,12.4,pz],qFacing([0,1,0]),[2.4,2.4,1],null);}
   mossOnRing(mx,11.5,mz,L*.38,Math.round(L*.22),1.5);}});
 // the low ruined wall round the compound, breached in places
 for(let k=0;k<96;k++){const th=k/96*TAU,r=292+12*fbm(k*.14,2.2,9370,2);
  if(fbm(k*.09,1.1,9371,2)<.30)continue;                     // breaches
  kput(BOXC(d),[Math.cos(th)*r,rr(1.4,3.4),Math.sin(th)*r],qEuler(0,-th,0),[rr(6,13),rr(2.8,6.8),rr(2.6,4.4)],null);}
 apron(G,0,0,300,352,d,1.6);
 scatterMoss(0,0,0,0,330,300,3.2);trees(0,0,150,420,46);
 rubbleRing(0,0,0,150,330,150,2.8);
 figures(0,260,10,60);figures(-210,-80,6,40);
 meshMerged(C.SH,skin,G);meshMerged(C.DK,MAT.guts,G);
 KOFF=[0,0,0];return G;}
