// ================================================================= YUNI VARIANTS (1 of 5): the Cloisters
// The Yuni settlement (settlements/yuni) runs a patched fork of this kit
// (its tools/gen_ancients.py + tools/anc_kit_tail.js) and grew variants the
// kit never had. They are ported here as kit builders of their own, so the
// kit's originals are untouched and the fork's patches have a home upstream:
//
//   yvQuad   buildYvQuad        academic quadrangle, "the Cloisters"   (8am-yv-a)
//   yvComb   buildYvCombShort   honeycomb apartments, short block      (8am-yv-b)
//   yvTerr   buildYvTerrace     terrace-stack apartments, roofed       (8am-yv-c)
//   yvDish   buildYvDish        the Ear with its dish intact           (8am-yv-d)
//   yvHosp   buildYvHospital4   the Cloister hospital, four towers     (8am-yv-e)
//
// Decay is the kit's: 0 intact, 1 ruined, 3 repaired (HOLES .55 and
// repairPass from the scene loop), 5 worn (wornPass from the scene loop).
// Yuni's worn skin, rust and weather passes already live in 69w-worn.js, so
// nothing of the worn decay is repeated here. Seeds: 9955+d, 9965+d, 9975+d,
// and d>0?9986:9985 / d>0?9988:9987 (9950-9989 less the blocks Apartments,
// Amphitheater, Fuel and Radar already claim). targets/yuni-variants/NOTES.md
// says what each one was in Yuni and what changed.

// ---------------------------------------------------------------- the Cloisters
// Written for Yuni (not in the source kit): a closed court ringed by terraced
// ranges, a deep parabolic cloister walk on all four sides, a lecture drum and
// two stair towers breaking the skyline, a monumental arch on the +z side.
// Metres, 120 x 100 m overall, court 84 x 64.
// Upgrades over Yuni's: dead windows keep teeth of glass (civWin); the ruin
// loses the middle of the terraced back range down to the ground storey (its
// floors stand in section over a talus) and the cloister arcade in front of it;
// the ruined lecture drum shows rooms behind its holes (civRooms); one draw
// call per material (civFlatten).
function buildYvQuad(scene,gx,gz,d){reseed(9955+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Quadrangle — the Cloisters ('+STATE(d)+')',x:0,z:0,r:66,h:40});
 civDef('qArchW',()=>arcShape(5.0,6.2,.85,3.4),MAT.white);civDef('qArchR',()=>arcShape(5.0,6.2,.85,3.4),MAT.rust);
 civDef('qRibW',()=>arcShape(17,5.6,.7,.9),MAT.white);civDef('qRibR',()=>arcShape(17,5.6,.7,.9),MAT.rust);
 civDef('qGateW',()=>arcShape(12,11.5,1.7,4.6),MAT.white);civDef('qGateR',()=>arcShape(12,11.5,1.7,4.6),MAT.rust);
 const skin=SHELL(d),CB=BOXC(d),QA=d>0?'qArchR':'qArchW',QR=d>0?'qRibR':'qRibW',PL=PLATE(d),CO=d>0?'colR':'colW';
 const HX=60,HZ=50,CX=42,CZ=32,SH=4.0,WALK=3.4;      // outer half-extents, court half-extents, storey, cloister depth
 // THE BREACH (ruin): the terraced back range (-z) has lost its middle down to
 // the ground storey. gap(f) is the x span missing at storey f: it widens
 // upward, ragged by storey, so the cut reads as a collapse and not a slot.
 const gap=f=>d>0&&f>=1?[-13-f*2.6+3*(h3(f,1,9956)-.5),5+f*1.8+3*(h3(f,2,9956)-.5)]:null;
 const GC=[-6.2,6.2];
 const inGap=(x,f)=>{const g=gap(f);return g&&x>g[0]-1&&x<g[1]+1;};
 const W=(nm,p,q,s)=>d>0?civWin(nm,p,q,s,.5):kput(nm,p,q,s,null);
 // court floor, with a shallow lobed basin at its centre
 kput(CB,[0,.15,0],null,[CX*2,.3,CZ*2],null);
 kput(SLABC(d),[0,.5,-2],null,[9,.8,9],null);kput(SLABC(d),[0,.95,-2],null,[6.6,.5,6.6],new THREE.Color(d>0?0x4a4a44:0x9fb0b4));
 // --- the four ranges. [nx,nz] outward normal; L half length; nf storeys; c centre line; back = terraced
 [[0,1,HX,2,41,false],[0,-1,HX,4,-41,true],[-1,0,HZ-18,3,-51,false],[1,0,HZ-18,3,51,false]].forEach(function(R,ri){
  const nx=R[0],nz=R[1],L=R[2],nf=R[3],c=R[4],back=R[5];
  const q=qEuler(0,nz?0:Math.PI/2,0);                           // box yaw for this range
  const gate=(nz>0);                                            // the +z range carries the monumental arch
  // a box along the range from a0 to a1 (along-range coordinate), centred on line cc
  const seg=(a0,a1,y,h,cc,dd,item)=>{const m=(a0+a1)/2,l=a1-a0;if(l<.3)return;kput(item,[nz?m:cc,y,nz?cc:m],q,[l,h,dd],null);};
  for(let f=0;f<nf;f++){const y=f*SH,st=back?f*2.2:0;          // st = setback away from the court on the back range
   const dep=18-st,cc=c-nx*st/2-nz*st/2;
   const inset=(f===0)?WALK:0,dd=dep-inset,ccf=cc+(nx?nx:nz)*inset/2;
   const g=back?gap(f):gate?GC:null;
   // the storey mass, hollowed on the court side at ground level to make the cloister walk
   if(!g){seg(-L,L,y+SH/2,SH-.35,ccf,dd,CB);seg(-L-.3,L+.3,y+SH-.1,.45,ccf,dd+.6,PL);}
   else{const m=gate?0:4,b0=gate?0:1.4,b1=gate?0:1.1;seg(-L,g[0]-m,y+SH/2,SH-.35,ccf,dd,CB);seg(g[1]+m,L,y+SH/2,SH-.35,ccf,dd,CB);
    seg(-L-.3,g[0]+b0,y+SH-.1,.45,ccf,dd+.6,PL);seg(g[1]-b1,L+.3,y+SH-.1,.45,ccf,dd+.6,PL);
    // the section: at each cut the last bay stands open, a room between the
    // floor band below and the ceiling band above, its two facade walls torn
    // off short, furnished (domRoom) and dark at the back, and the floor
    // plate torn and sagging into the gap
    if(!gate)for(const e of [[g[0],1],[g[1],-1]]){const x=e[0],sg=e[1];
     kput('boxD',[x-sg*3.8,y+SH/2-.1,ccf],null,[.3,SH-.7,dd-1.4],null);
     for(const s2 of [-1,1]){const fl=2.2+1.4*h3(f,s2,9957+sg);seg(sg>0?x-4:x+4-fl,sg>0?x-4+fl:x+4,y+SH/2,SH-.35,ccf+s2*(dd/2-.3),.6,CB);}
     domRoom([x-sg*.5,y+.2,ccf],[sg,0,0],3.4,SH-.6,d,9957+f);
     kput('plateR',[x+sg*1.6,y+.1-.6,ccf+dd*.15],qEuler(.08*sg,0,-.32*sg),[3.4,.35,dd*.7],null);
     kput('rubble',[x+sg*2.2,y+.2,ccf-dd*.2],qEuler(.4,f,.2),[2.2,1.2,1.8],null);}}
   // arched windows along the court face and the outer face (civWin leaves glass teeth in the dead ones)
   const nw=Math.round(L/4.2);
   for(let k=0;k<nw;k++){if(d>0&&rng()<.22)continue;
    const t=(k+.5)/nw*2-1,a=t*L;
    const cfx=nz?a:(cc-nx*dd/2-.1),cfz=nz?(cc-nz*dd/2-.1):a;
    const skip=back?inGap(a,f):gate&&Math.abs(a)<7.5;
    if(!(gate&&f===0&&Math.abs(a)<8)&&!skip)W(d>0?'winD':'winI',[cfx,y+1.9,cfz],qFacing([-nx,0,-nz]),[.95,.95,1]);
    if(f>0||!gate){const ofx=nz?a:(cc+nx*dep/2+.1),ofz=nz?(cc+nz*dep/2+.1):a;
     if(!(d>0&&rng()<.25)&&!skip)W(d>0?'winSmD':'winSmI',[ofx,y+2.2,ofz],qFacing([nx,0,nz]),[1.5,1.5,1]);}}
   // glass gallery behind the court face on the first floor (while the structure is whole)
   if(f===1&&d===0){const gx2=nz?0:(cc-nx*dep/2-.05),gz2=nz?(cc-nz*dep/2-.05):0;kput('pane',[gx2,y+2.6,gz2],q,[L*1.9,2.6,1],null);}
   // terrace planting on the back range's setbacks
   if(back&&f>0)for(let k=0;k<Math.round(L/7);k++){const t=(k+.5)/Math.round(L/7)*2-1;if(inGap(t*L,f))continue;
    kput('hedge',[t*L,y+.55,cc+nz*(dep/2-1.2)],q,[5,.9,1.8],new THREE.Color().setHSL(.29,.5,d>0?.14:.22));}}
  // roof: slab, parapets on the long sides, and a pergola of parabolic ribs on the side ranges
  const ry=nf*SH,st=back?(nf-1)*2.2:0,dep=18-st,cc=c-(nx+nz)*st/2,rg=back?gap(nf-1):gate?GC:null;
  const roofSeg=(a0,a1)=>{seg(a0,a1,ry+.25,.5,cc,dep+1,CB);
   for(const s2 of [-1,1]){const m=(a0+a1)/2,l=a1-a0;if(l<.3)continue;
    if(nz)kput(PL,[m,ry+1.1,cc+s2*dep/2],q,[l,1.2,.5],null);else kput(PL,[cc+s2*dep/2,ry+1.1,m],null,[.5,1.2,l],null);}};
  if(!rg)roofSeg(-L-.5,L+.5);else{roofSeg(-L-.5,rg[0]);roofSeg(rg[1],L+.5);}
  if(!nz)for(let k=0;k<Math.round(L/6);k++){const t=(k+.5)/Math.round(L/6)*2-1;if(d>0&&rng()<.3)continue;
   kput(QR,[cc,ry+.5,t*L],qFacing([nx,0,nz]),[1,1,1],null);}
  // the cloister walk: a parabolic arcade in front of the ground storey, with its own roof slab
  const wc=c-(nx+nz)*(18/2)+(nx+nz)*(WALK/2),wcx=nz?0:wc,wcz=nz?wc:0;
  const na=Math.round(L/2.6),g1=back?gap(1):null;
  for(let k=0;k<na;k++){const t=(k+.5)/na*2-1,a=t*L;if(gate&&Math.abs(a)<8.5)continue;
   if(d>0&&rng()<.16)continue;
   if(g1&&a>g1[0]+3&&a<g1[1]-3){// brought down with the range above it: the arch lies on its face in the court
    kput(QA,[a+(h3(k,3,9958)-.5)*2,.45,wc-(nx+nz)*4.2],qEuler(-Math.PI/2+.12,(h3(k,4,9958)-.5)*.5,0),[1,1,1],null);continue;}
   kput(QA,[nz?a:wc,0,nz?wc:a],qFacing([nz?0:1,0,nz?1:0]),[1,1,1],null);}
  if(gate){seg(-L,-8.5,6.3,.55,wc,WALK+1.2,CB);seg(8.5,L,6.3,.55,wc,WALK+1.2,CB);}
  else if(!g1)kput(CB,[wcx,6.3,wcz],q,[L*2,.55,WALK+1.2],null);
  else{seg(-L,g1[0]+3,6.3,.55,wc,WALK+1.2,CB);seg(g1[1]-3,L,6.3,.55,wc,WALK+1.2,CB);}
  if(d>0&&ri<2)rubbleRing(nz?L*.7:c,.3,nz?c:L*.7,2,9,14,1.1);
  // the monumental gate: the +z range bridges over a 12 m parabolic arch
  // (the range is cut through at |x| < 6.2, storeys, roof and walk; three
  // arches make a vaulted passage of the cut, and two pylons stand out front)
  if(gate){for(const z of [c-6.7,c,c+6.7])kput(d>0?'qGateR':'qGateW',[0,0,z],qFacing([0,0,1]),[1,1,1],null);
   for(let s2=-1;s2<=1;s2+=2)kput(CO,[s2*9.5,0,c+11],null,[1.3,14,1.3],null);}});
 // --- the lecture drum: a fluted paraboloid in the back-left of the court, capped by a shallow dome
 {const dx=-26,dz=-20,R=10.5,H=23,hole=holeFn(d*.7,4401,null,1.4);
  mesh(lathe({rFn:y=>R*(1-.10*Math.pow(y/H,2)),H:H,flutes:8,amp:.09,sharp:2,nu:56,nv:16,hole,seed:4401}),skin,G,dx,0,dz);
  if(d>0){mesh(lathe({rFn:y=>R*.6,H:H,nu:24,nv:2}),MAT.dark,G,dx,0,dz);    // the lecture hall's own wall, rooms in the band outside it
   civRooms({cx:dx,cy:0,cz:dz,rFn:y=>R*(1-.10*Math.pow(y/H,2)),y0:4.6,y1:H-1,step:4.6,d,seed:4402,rIn:.62,dens:7});}
  else mesh(lathe({rFn:y=>R*.9,H:H,nu:24,nv:2}),MAT.dark,G,dx,0,dz);
  mesh(lathe({rFn:y=>(R+.8)*Math.sqrt(clamp(1-Math.pow(y/6.4,2),0,1)),H:6.4,nu:48,nv:10}),skin,G,dx,H,dz);
  kput(SLABC(d),[dx,H-.3,dz],null,[R+1.1,.6,R+1.1],null);
  for(let k=0;k<12;k++){const th=(k+.4)/12*TAU;if(d>0&&rng()<.25)continue;
   W(d>0?'winD':'winI',[dx+R*Math.cos(th)*1.01,4.4,dz+R*Math.sin(th)*1.01],qFacing([Math.cos(th),0,Math.sin(th)]),[1.1,1.3,1]);
   if(d===0)kput('pane',[dx+R*Math.cos(th)*1.02,11.5,dz+R*Math.sin(th)*1.02],qFacing([Math.cos(th),0,Math.sin(th)]),[4.6,5,1],null);}
  kput('archOpen',[dx,0,dz+R-.2],qFacing([0,0,1]),[.75,.62,1],null);
  stripRing(dx,H+.4,dz,R*.8,d,20);if(d>0){mossOnRing(dx,H+.2,dz,R,14,1.4);vinesOnRing(dx,H,dz,R,8,9);}}
 // --- two stair towers at the court's +z corners
 [[-36,25],[36,25]].forEach(function(p,i){const R=4.6,brk=d>0&&i===1,H=brk?19:31;
  mesh(lathe({rFn:y=>R*(1-.22*Math.pow(y/H,1.6)),H:H,cut:brk?H:null,jag:brk?1.6:0,flutes:6,amp:.12,sharp:2,nu:36,nv:20,hole:holeFn(d*.6,4410+i,null,1.2),seed:4410+i}),skin,G,p[0],0,p[1]);
  mesh(lathe({rFn:y=>R*.86*(1-.22*Math.pow(y/H,1.6)),H:H,nu:18,nv:4}),MAT.dark,G,p[0],0,p[1]);   // follows the taper (Yuni's liner poked through the top)
  for(let y=3;y<H-3;y+=3.4){const th=Math.PI*(i?.25:.75);
   W(d>0?'winSmD':'winSmI',[p[0]+R*Math.cos(th),y,p[1]+R*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.6,1]);}
  if(!brk){kput(SLABC(d),[p[0],H,p[1]],null,[R+1,.5,R+1],null);
   mesh(lathe({rFn:y=>(R*.8)*Math.sqrt(clamp(1-Math.pow(y/3.4,2),0,1)),H:3.4,nu:28,nv:6}),skin,G,p[0],H+.3,p[1]);
   if(d===0)kput('finial',[p[0],H+4.6,p[1]],null,[1.1,1.8,1.1],null);}
  else rubbleRing(p[0],0,p[1],3,11,16,1.2);});
 // --- weathering / ruin dressing
 if(d>0){scatterMoss(0,.3,0,10,CX,60,1.1);rubbleRing(0,.3,0,CX-6,CX+14,40,1.4);
  // the talus of the breach, both faces of the back range, and slabs of its roof among it
  const g=gap(3);adRubbleLine([g[0]+2,-30],[g[1]-2,-30],0,1,9,70,2.6);adRubbleLine([g[0]+2,-51],[g[1]-2,-51],0,-1,10,60,2.6);
  for(let k=0;k<5;k++){const x=lerp(g[0]+3,g[1]-3,(k+.5)/5),hh=h3(k,5,9959);
   kput('boxCR',[x,k%2?4.5+hh:1.1+hh,k%2?-41+(hh-.5)*8:(hh<.5?-30:-52)],qEuler((hh-.5)*.9,hh*2,(h3(k,6,9959)-.5)*.8),[6+hh*4,.6,4+hh*3],null);}}
 figures(0,0,5,26);civFlatten(G);KOFF=[0,0,0];return G;}
