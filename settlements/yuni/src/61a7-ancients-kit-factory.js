// ================================================================= FUEL STATION — "the Well"
function buildFuelStation(scene,gx,gz,d){reseed(9970+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Fuel station — the Well ('+STATE(d)+')',x:0,z:0,r:60,h:30});
 // forecourt 52 -> 48 m (round 2, "shrink podiums for density"): it only has to carry
 // the canopy, pumps, kiosk and the fallen lobe; the storage lobes stand behind it
 kput('slab',[0,.3,0],null,[48,.6,48],new THREE.Color(d>0?0x4a4038:0x8a8078));
 // canopy: one hyperboloid mast, a lobed hovering disc with a hole, six pump bays under it
 mesh(lathe({rFn:y=>4*Math.sqrt(1+2*Math.pow((y-9)/9,2)),H:18,nu:32,nv:10}),skin,G);
 // THE CANOPY lives in its own group, pivoted on the mast head (y=16.5). In the
 // ruin it has slipped on the mast and hangs tilted, with one lobe broken off
 // and lying on the forecourt: the ruin used to keep the intact disc, only
 // rusted, which is the same silhouette.
 const CY=16.5,Cg=new THREE.Group();Cg.position.set(0,CY,0);if(d>0)Cg.rotation.set(.11,0,.075);G.add(Cg);
 const brk=d>0?u=>u>.07&&u<.2:()=>false;
 mesh(lathe({rFn:y=>lerp(30,34,Math.sin(Math.PI*y/3)),H:3,flutes:6,amp:.22,sharp:1,nu:96,nv:4,hole:(u,y)=>brk(u)}),skin,Cg,0,15-CY,0);
 mesh(lathe({rFn:()=>6,H:4,nu:24,nv:1}),MAT.dark,Cg,0,14.9-CY,0);
 if(d>0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(6,30*(1+.22*(.5+.5*Math.cos(6*th))),v);return[r*Math.cos(th),15-CY,r*Math.sin(th)];},96,4,{hole:(u,v)=>fbm(u*5,v*3,900,2)>.55||(brk(u)&&v>.3)}),MAT.rust,Cg);
 // THE DISC'S FACES. The canopy was only its 3 m rim band (and, in the ruin, a
 // holed soffit), so intact it was an open ring: from the preset, 26 m up, you
 // looked through it to the forecourt. A soffit and a gently crowned roof now
 // close it; in the ruin the roof is eaten through like the soffit.
 const rO=th=>30*(1+.22*(.5+.5*Math.cos(6*th)));
 const roofF=(u,v)=>{const th=u*TAU,r=lerp(6,rO(th),v);return[r*Math.cos(th),18+.8*(1-v*v)-CY,r*Math.sin(th)];};
 if(d===0)mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(6,rO(th),v);return[r*Math.cos(th),15-CY,r*Math.sin(th)];},96,4,{uS:24,vS:4}),skin,Cg);
 mesh(gridSurface(roofF,96,4,{uS:24,vS:4,hole:d>0?(u,v)=>fbm(u*5,v*3,901,2)<(d===3?.3:.48)||(brk(u)&&v>.3):null}),skin,Cg);
 if(d>0){const fm=mesh(gridSurface((u,v)=>roofF(.07+u*.13,.3+v*.7),14,4,{uS:4,vS:3}),MAT.rust,G);fm.position.set(Math.cos(.85)*38,0,Math.sin(.85)*38);fm.rotation.set(.1,.4,-.14);dropFragment(fm,.6,.3);}
 for(let k=0;k<6;k++){const th=k/6*TAU;const r=20;const x=r*Math.cos(th),z=r*Math.sin(th);const lit=d>0?rng()<.2:true;
  useGroupXF(Cg);kput('strip',[x,14.6-CY,z],qEuler(0,-th,0),[9,1,1],lit?CYAN:DEAD);endGroupXF();
  kput(d>0?'boxR':'boxW',[x,1.6,z],qEuler(0,-th,0),[1.2,2.6,3],null);kput('boxD',[x,2.5,z],qEuler(0,-th,0),[1.3,.8,1.6],null);
  kput('tube',[x,1.6,z+1.8],qEuler(.6,0,0),[.15,3,.15],null);}
 // three storage lobes behind, pipes to the mast
 for(let i=0;i<3;i++){const x=-42+i*16,z=-44;const R=7;const gone=d>0&&i===1;
  if(!gone)mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(d*.7,910+i,null,2)}),skin,G,x,1,z);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(1,911,null,1.5)}),MAT.rust,G,x+3,1,z+4);fm.rotation.set(.5,0,.9);dropFragment(fm,0,1.2);}
  for(let k=0;k<3;k++){const th=k/3*TAU;kput(d>0?'colR':'colW',[x+4*Math.cos(th),0,z+4*Math.sin(th)],null,[.9,1.5,.9],null);}
  kput(d>0?'pipeR':'pipe',[x,1.2,z+22],qEuler(Math.PI/2,0,0),[.5,44,.5],null);}
 kput(d>0?'pipeR':'pipe',[-26,1.2,-44],qEuler(0,0,Math.PI/2),[.6,34,.6],null);
 // kiosk
 mesh(lathe({rFn:y=>5*Math.pow(clamp(1-Math.pow(y/7,2),0,1),.5),H:7,flutes:8,amp:.1,nu:32,nv:8,hole:holeFn(d*.6,920,null,2.5)}),skin,G,34,0,-20);
 kput('archOpen',[29.5,2,-20],qFacing([-1,0,0]),[.3,.35,1],null);stripRing(34,4,-20,3.5,d,10);
 if(d>0){scatterMoss(0,.6,0,0,46,50,1.6);rubbleRing(-42,0,-44,4,20,20,1.5);trees(0,0,60,100,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

// ================================================================= RADAR TOWER — "the Listener"
function buildRadarTower(scene,gx,gz,d){reseed(9980+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Radar tower — the Listener ('+STATE(d)+')',x:0,z:0,r:40,h:100});
 const H=80;const cut=d>0?H*.78:null;const rFn=y=>7*Math.sqrt(1+3*Math.pow((y-H*.6)/(H*.6),2));
 const lat=(u,y)=>{const a=u*TAU*8,b=y*.35;return Math.abs(Math.sin(a+b))>.3&&Math.abs(Math.sin(a-b))>.3;};
 const top=cut||H;for(let k=0;k<8;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=top;y+=4){const th=k/8*TAU+dir*y*.045;const r=rFn(y);const p=[r*Math.cos(th),2+y,r*Math.sin(th)];if(prev&&!(d>0&&fbm(k+dir,y*.05,1000,2)<.2))beam(d>0?'strutR':'strutW',prev,p,.9,.9);prev=p;}}
 mesh(lathe({rFn:()=>2.2,H:cut||H,nu:12,nv:2}),MAT.dark,G,0,2,0);
 for(let yy=10;yy<(cut||H)-4;yy+=14)kput(d>0?'ringR':'ringW',[0,2+yy,yy===10?0:0],qEuler(Math.PI/2,0,0),[rFn(yy),rFn(yy),3],null);
 kput('slab',[0,1,0],null,[16,2,16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 // ground contact: a graded skirt off the 2 m pad instead of a hard edge
 apron(G,0,0,15.6,24,d,2);
 for(let k=0;k<3;k++){const th=k/3*TAU;beam(d>0?'strutR':'strutW',[Math.cos(th)*30,0,Math.sin(th)*30],[Math.cos(th)*rFn(20)*.9,22,Math.sin(th)*rFn(20)*.9],2.2,1.8);}
 if(!cut){kput('slab',[0,H+2,0],null,[12,1.2,12],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>9*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,nu:32,nv:6}),skin,G,0,H+2.6,0);
  // rotating bar antenna: two curved wings on a pedestal
  kput('tube',[0,H+9,0],null,[1.4,3,1.4],null);const ay=H+11;const yaw=rr(0,TAU);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,ay+v*4+.15*Math.pow(x/15,2)*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.dark,G);wm.rotation.y=yaw;
  kput('boxW',[0,ay+2,0],qEuler(0,-yaw,0),[30,.4,.6],null);stripRing(0,H+1,0,10,d,16);
  // small dish on the side
  const dish=gridSurface((u,v)=>{const a=u*TAU,r=v*5;return[r*Math.cos(a),r*r*.06,r*Math.sin(a)];},24,6,{});const dm=mesh(dish,skin,G,14,H-4,0);dm.rotation.set(-.4,0,-.9);kput('tube',[12,H-8,0],qEuler(0,0,.4),[.5,8,.5],null);}
 else{for(let k=0;k<8;k++){beam('strutR',[14+rr(-4,4),1,10+rr(-4,4)],[30+rr(-6,6),3,22+rr(-6,6)],.9,.9);}rubbleRing(22,0,16,3,20,40,1.8);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,v*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.dark,G,-10,.5,24);wm.rotation.set(Math.PI/2*.9,0,.4);dropFragment(wm,0,.2);}
 // service hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1010,null,2.5)}),skin,G,-22,0,8);kput('archOpen',[-16.5,1.8,8],qFacing([1,0,0]),[.3,.35,1],null);
 if(d>0){scatterMoss(0,0,0,10,60,50,1.8);vinesOnRing(0,2+cut,0,rFn(cut),8,20);trees(0,0,40,80,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

// ================================================================= SATELLITE DISH — "the Ear"
function buildDish(scene,gx,gz,d){reseed(9990+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);const dw=DISHOK;
 REGISTER({name:'Satellite dish — the Ear ('+STATE(d)+')',x:0,z:0,r:70,h:80});
 const R=44;kput('slab',[0,1,0],null,[40,2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 // ground contact: a graded skirt off the 2 m pad instead of a hard edge
 apron(G,0,0,39.6,50,d,2);
 // pedestal: three leaning hyperboloid legs meeting at a yoke
 for(let k=0;k<3;k++){const th=k/3*TAU;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*26,2,Math.sin(th)*26);Lg.rotation.set(0,-th,0);Lg.rotateZ(Math.atan2(24,30));G.add(Lg);
  mesh(lathe({rFn:y=>3.2*Math.sqrt(1+1.5*Math.pow((y-19)/19,2)),H:38,nu:20,nv:8}),skin,Lg);}
 kput('tube',[0,32,0],null,[5,6,5],null);
 const D=new THREE.Group();D.position.set(0,36,0);const tilt=(d===1&&!dw)?1.1:.55;D.rotation.set(tilt,0,0);G.add(D);useGroupXF(D);
 const dishF=(u,v)=>{const a=u*TAU,r=v*R;return[r*Math.cos(a),r*r/(R*2.2),r*Math.sin(a)];};
 // THE BROKEN BOWL (round 2). The ruin's holes were fbm bands across the
 // paraboloid, which left concentric rings of skin hanging in the air, joined
 // to nothing ("dish floating wreckage"). Panels now tear away from the rim
 // inward along a ragged line, so every surviving piece still runs back to the
 // hub; a few punctures stay as holes. The rehabilitated dish (d=3) keeps the
 // intact tilt and only loses the outer ring of panels.
 const tear=u=>.42+.75*fbm(u*5,.5,1100,2)+(d===3?.3:0);
 const dHole=d>0&&!dw?(u,v)=>v>tear(u)||(u>.64&&u<.78&&v>.6)||(v>.25&&fbm(u*16,v*9,1101,2)<.18):null;
 mesh(gridSurface(dishF,72,18,{uS:12,vS:6,hole:dHole}),skin,D);
 mesh(gridSurface((u,v)=>{const p=dishF(u,v);return[p[0],p[1]-.6,p[2]];},72,18,{uS:12,vS:6,hole:dHole}),MAT.dark,D);
 for(let k=0;k<12;k++){const a=k/12*TAU;if(d>0&&!dw&&k===7)continue;beam(d>0?'strutR':'strutW',[Math.cos(a)*4,0,Math.sin(a)*4],[Math.cos(a)*R*.95,R*R*.95*.95/(R*2.2),Math.sin(a)*R*.95],.9,1.2);}
 // feed on a tripod of thin struts
 const fy=R*.55;for(let k=0;k<3;k++){const a=k/3*TAU+.5;beam('tube',[Math.cos(a)*R*.7,R*R*.49/(R*2.2),Math.sin(a)*R*.7],[0,fy,0],.5,.5);}
 kput('finial',[0,fy,0],null,[2.5,3.5,2.5],null);
 // the rim went with the outer panels in the ruin; the ribs end bare
 if(d!==1||dw)kput(d>0?'ringR':'ringW',[0,R*R/(R*2.2)+.3,0],qEuler(Math.PI/2,0,0),[R,R,3],null);endGroupXF();
 // the fallen panel lies on the ground: it used to stand on edge like a fence
 // (x .73 rad cancels the paraboloid's 42 degree slope at the rim)
 if(d>0&&!dw){const fm=mesh(gridSurface((u,v)=>{const p=dishF(u*.12+.65,v*.4+.6);return p;},10,8,{uS:12,vS:6}),MAT.rust,G,56,1,54);fm.rotation.set(-.73,.3,.05);dropFragment(fm,0,.6);rubbleRing(0,0,20,10,40,40,2);scatterMoss(0,0,0,12,70,50,2);trees(0,0,50,90,8);}
 // control hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1110,null,2.5)}),skin,G,40,0,-10);kput('archOpen',[34.5,1.8,-10],qFacing([-1,0,0]),[.3,.35,1],null);
 kput(d>0?'pipeR':'pipe',[20,.6,-4],qEuler(0,-.3,Math.PI/2),[.4,36,.4],null);
 figures(0,40,3,4);KOFF=[0,0,0];return G;}

// ================================================================= 2. FACTORY — "the Foundry"
function buildFactory(scene,gx,gz,d){reseed(d>0?9201:9200);KOFF=[gx,0,gz];REGISTER({name:'Factory — the Foundry ('+STATE(d)+')',x:0,z:0,r:260,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // Every opaque surface goes through M and is merged per material at the end:
 // this type used to be 109 meshes (one per lobe, stack, cap and lining), the
 // heaviest draw-call type in the kit. Glass and the fallen fragments stay apart.
 const M=facSink();
 // plinth. It was 380 m wide (x -200..180) on a row whose sites are 330 apart,
 // so the rehabilitated Foundry's plinth lay 50 m into both neighbours' and the
 // two coplanar tops z-fought; the intact tank farm also stood inside the
 // rehabilitated cooling towers. Now 324 m wide and centred, with the tank farm
 // moved 16 m west and the cooling towers 18 m east (factoryExtras), so each
 // site keeps to its own ground. Deeper in z (.76) to carry the towers.
 const pl=new THREE.CylinderGeometry(162*Math.SQRT2,165*Math.SQRT2,6,4,1);pl.rotateY(Math.PI/4);pl.translate(0,3,0);pl.scale(1,1,.76);M.add(pl,skin);
 // --- great catenary vault hall (ribs + skin) -------------------------------------------------
 const W=90,Hh=55,L=160,hx=-40,z0=-L/2;const yb=6;
 for(let i=0;i<=16;i++){if(d>0&&(i===5||i===6||i===11))continue;kput(d>0?'vaultRibR':'vaultRib',[hx,yb,z0+i*10],null,1,null);}
 const skinFn=(u,v)=>{const x=(u-.5)*(W-2);return[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2)),z0+v*L];};
 const ridge=(u)=>Math.abs(u-.5)<.045;
 const skH=holeFn(d,21,null,1.3);
 M.add(gridSurface(skinFn,60,64,{uS:12,vS:20,hole:(u,v)=>ridge(u)||(skH&&skH(u*4,v*L))}),skin);
 if(d===0)mesh(gridSurface((u,v)=>skinFn(.455+u*.09,v),8,32,{}),MAT.glass,G);
 if(d>0){M.add(gridSurface((u,v)=>{const p=skinFn(u,v);return[p[0]*.97+hx*.03,yb+(p[1]-yb)*.93,p[2]];},40,32,{uS:12,vS:20}),MAT.guts);
  for(let k=0;k<30;k++){const x=rr(-38,38),z=rr(z0+5,z0+L-5);kput('pipeR',[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2))*.9,z],qEuler(Math.PI/2,0,0),[.6,rr(10,40),.6],null);}}
 // end walls with big arched glass openings
 [z0,z0+L].forEach((zz,i)=>{M.add(paraFill(W,Hh,34,40),skin,hx,yb,zz);
  // round 2: a bone archivolt round the great opening, swelling at its joints
  M.add(domMould(t=>{const x=-17+34*t;return[hx+x,yb+40*(1-Math.pow(2*x/34,2)),zz];},[0,0,1],1.1,6,72),skin);
  if(d===0){const gl=mesh(paraFill(34,40,0,0),MAT.glass,G,hx,yb,zz+(i?-.3:.3));}
  // ruin: the great arched glazing is gone but for teeth left in the panes
  else domShards([hx,yb,zz],qFacing([0,0,i?1:-1]),[[-15.7,2.6],[-12,4.8],[-7.2,4.8],[-2.4,4.8],[2.4,4.8],[7.2,4.8],[12,4.8],[15.7,2.6]],
   x=>40*(1-Math.pow(clamp(2*(Math.abs(x)+1.3)/34,0,1),2)),5,.35);
  if(d>0)for(let j=1;j<8;j++){const y=j*5;kput('mullR',[hx,yb+y,zz],qEuler(0,0,Math.PI/2),[.8,34*Math.sqrt(1-y/40),.8],null);}
  mullions(hx,yb,zz,0,0,0,d);for(let k=-3;k<=3;k++)kput(d>0?'mullR':'mullW',[hx+k*4.8,yb+19,zz],null,[1,36*(1-Math.pow(k/3.6,2)),1],null);});
 // interior strips along the hall
 for(let k=0;k<12;k++){const z=z0+8+k*13;const lit=d>0?rng()<.12:true;kput('strip',[hx,yb+Hh-4,z],null,[60,1,1],lit?CYAN:DEAD);}
 // --- Goldberg clover silos on hyperboloid legs -----------------------------------------------
 function silo(cx,cz,seed){
  const legH=15,lobeH=46,Rl=9.5;
  M.add(lathe({rFn:()=>6.5,H:legH+lobeH+2,nu:24,nv:4}),skin,cx,0,cz);
  for(let l=0;l<4;l++){const a=(l+.5)*Math.PI/2,ox=Math.cos(a)*10.5,oz=Math.sin(a)*10.5;
   kput(d>0?'colR':'colW',[cx+ox,0,cz+oz],null,[3.2,legH,3.2],null);
   const hole=holeFn(d,seed+l,null,1.6);const o={rFn:y=>Rl*(1-.04*Math.pow(clamp(y/lobeH,0,1),6)),H:lobeH,nu:36,nv:24,hole,seed};
   M.add(lathe(o),skin,cx+ox,legH,cz+oz);
   if(d>0)M.add(lathe({rFn:()=>Rl*.9,H:lobeH,nu:20,nv:2}),MAT.guts,cx+ox,legH,cz+oz);
   // rim + oval windows facing outward from the core
   kput(d>0?'ringR':'ringW',[cx+ox,legH+lobeH,cz+oz],qEuler(Math.PI/2,0,0),[Rl+.2,Rl+.2,3],null);
   for(let yy=4;yy<lobeH-3;yy+=5.5)for(let k=-2;k<=2;k++){const th=a+k*.42;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,yy))continue;
    civWin(d>0?'ovalD':'ovalI',[cx+ox+Rl*Math.cos(th),legH+yy,cz+oz+Rl*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,1.4,1],null);}
   if(d>0)vinesOnRing(cx+ox,legH+lobeH,cz+oz,Rl,10,30);}
  kput('slab',[cx,legH+lobeH+2,cz],null,[7,1,7],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  if(d>0)mossOnRing(cx,legH+lobeH+2.3,cz,6,10,2);}
 silo(72,-58,31);silo(72,0,32);silo(72,58,33);
 // pipes silos → hall
 for(let i=0;i<3;i++){const z=-58+i*58;kput(d>0?'pipeR':'pipe',[30,34+i*3,z],qEuler(0,0,Math.PI/2),[1.6,70,1.6],null);
  if(d>0&&i===1)continue;kput(d>0?'pipeR':'pipe',[30,34+i*3,z+6],qEuler(0,0,Math.PI/2),[1.1,70,1.1],null);}
 // --- organic stacks (Parc Güell chimneys, industrial scale) ------------------------------------
 for(let i=0;i<4;i++){const cx=22,cz=-75+i*50,H=95+i*6;const cutF=d>0?[.55,null,.7,null][i]:null;const cut=cutF!=null?H*cutF:null;
  const rFn=y=>6.5*(1-.45*y/H)+2.2*clamp((y-H+14)/14,0,1);const hole=holeFn(d,41+i,cut,1.2);
  const o={rFn,H,cut,jag:cut?4:0,flutes:9,amp:.28,sharp:2.5,nu:54,nv:40,hole,seed:41+i};
  M.add(lathe(o),skin,cx,6,cz);if(d>0)M.add(lathe({rFn:y=>rFn(y)*.85,H,cut,jag:o.jag,nu:20,nv:8}),MAT.guts,cx,6,cz);
  if(cut==null){const rc=rFn(H)+1.2;M.add(lathe({rFn:y=>rc*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:8}),skin,cx,6+H-.5,cz);}
  else rubbleRing(cx,6,cz,8,22,50,2.5);
  for(let yy=15;yy<H*.9;yy+=22){if(cut&&yy>cut-6)break;kput(d>0?'ringR':'ringW',[cx,6+yy,cz],qEuler(Math.PI/2,0,0),[rFn(yy)*1.07,rFn(yy)*1.07,4],null);}}
 // --- viaduct (parabolic arcade) carrying the conveyor tube --------------------------------------
 const vz=-100;for(let i=0;i<19;i++){const x=-180+i*16;const gone=d>0&&(i===7||i===8||i===9);
  if(!gone)kput(d>0?'archR':'arch',[x,0,vz],null,1,null);else rubbleRing(x,0,vz,1,10,35,2.2);
  if(!gone||d===0)kput(d>0?'pipeR':'pipe',[x,29.5,vz],qEuler(0,0,Math.PI/2),[2.7,16.2,2.7],null);}
 kput(d>0?'pipeR':'pipe',[-180+18*16+8,29.5,vz],qEuler(0,0,Math.PI/2),[3.2,16,3.2],null);
 // conveyor bends into the hall's west wall
 kput(d>0?'pipeR':'pipe',[-172,29.5,vz+8],qEuler(Math.PI/2,0,0),[3.2,16,3.2],null);
 kput(d>0?'pipeR':'pipe',[-172,29.5,z0+40],qEuler(Math.PI/2,0,0),[3.2,84,3.2],null);
 kput(d>0?'pipeR':'pipe',[hx-38,29.5,z0+80],qEuler(0,0,Math.PI/2),[3.2,180,3.2],null);
 for(let x=-160;x<=-100;x+=20)kput(d>0?'colR':'colW',[x,6,z0+80],null,[1.5,22,1.5],null);
 if(d>0){const fx=-180+8*16;const fm=mesh(new THREE.CylinderGeometry(3.2,3.2,40,10),MAT.pipeRust,G,fx+4,2.6,vz+6);fm.rotation.set(.1,0,Math.PI/2+.08);dropFragment(fm,0,.8);}
 factoryExtras(G,d,skin,M);
 // Ruin dressing stays ON the plinth (it used to reach r=190-200 at y=6, i.e.
 // hanging in the air past the plinth's z edge at 118) and the ground planting
 // runs in bands north and south of it: a ring at r=210-290 ran under both
 // neighbouring sites' plinths, with trees poking up through them.
 if(d>0){scatterMoss(0,6,0,0,118,200,3);rubbleRing(0,6,0,20,112,90,2.5);
  for(let i=0;i<biomeN(24);i++){const x=rr(-160,160),z=(i%2?1:-1)*rr(132,200);VEG.tree(x,terrainH(x,z),z,i%3,rr(6,14));}
  for(let i=0;i<biomeN(120);i++){const x=rr(-165,165),z=(i%2?1:-1)*rr(126,210),s=rr(.5,3);
   kput('moss',[x,s*.25,z],qEuler(0,rng()*TAU,0),[s*rr(.8,1.4),s*.38,s*rr(.8,1.4)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
 M.flush(G);
 figures(-120,136,6,8);figures(40,-130,4,5);
 // REHABILITATED: A SCRAP YARD. The shared repairPass dresses every type with
 // the same lean-tos and water butts; a foundry's later people strip it for
 // metal (KNOWN_ISSUES: "a factory wants scrap yards"). Sorted heaps of plate,
 // a pyramid of salvaged pipe, a tarp-roofed sorting shed and a sheerleg hoist,
 // on the empty south apron where the Factory row shot looks. Kit items only,
 // so it costs no draw calls; drawn after figures() so nothing above moves.
 if(d===3){const Y=6,sx=42,sz=104;
  for(let h=0;h<5;h++){const px=sx-30+h*14+rr(-3,3),pz=sz+rr(-8,8);let y=Y;const n=6+Math.floor(rng()*7);
   for(let k=0;k<n;k++){const t=rr(.3,.7),w=rr(3,8)*(1-k/n*.5),dp=rr(2.5,5)*(1-k/n*.5);
    kput('plateR',[px+rr(-1.4,1.4),y+t/2,pz+rr(-1.4,1.4)],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[w,t,dp],null);y+=t*.85;}}
  for(let j=0;j<4;j++)for(let k=0;k<5-j;k++)
   kput('pipeR',[sx-14+(k-(4-j)/2)*2.1,Y+1+j*1.8,sz-12+rr(-.4,.4)],qEuler(0,0,Math.PI/2),[1,rr(14,22),1],null);
  kput('shantyBox',[sx+28,Y+2.4,sz-2],qEuler(0,.08,0),[14,4.8,9],null);
  kput('shantyRoof',[sx+28,Y+5.3,sz-2],qEuler(.12,.08,0),[18,1,12],null);
  for(let k=0;k<4;k++)kput('waterButt',[sx+20+k*2.6,Y+1.15,sz+5],null,[1.1,2.3,1.1],null);
  // sheerleg hoist over the biggest heap: two raking legs, a backstay, a fall
  const hx2=sx-2,hz2=sz;beam('strutR',[hx2-7,Y,hz2-3],[hx2,Y+19,hz2],1,1);beam('strutR',[hx2+7,Y,hz2-3],[hx2,Y+19,hz2],1,1);
  beam('strutR',[hx2,Y,hz2+12],[hx2,Y+19,hz2],.8,.8);kput('spipe',[hx2,Y+13,hz2],null,[.12,12,.12],null);
  kput('plateR',[hx2,Y+6.6,hz2],qEuler(.3,.4,0),[4,.4,3],null);
  for(let k=0;k<8;k++)kput('plank',[sx+rr(-30,34),Y+.12,sz+rr(-12,12)],qEuler(0,rng()*TAU,0),[rr(2,6),.22,rr(.5,1.3)],null);
  figures(sx+10,sz,6,14);}
 KOFF=[0,0,0];
 return G;}

// ================================================================= 3. LABORATORY — "the Reliquary"
function buildLab(scene,gx,gz,d){reseed(d>0?9301:9300);KOFF=[gx,0,gz];REGISTER({name:'Laboratory — the Reliquary ('+STATE(d)+')',x:0,z:0,r:40,h:125});REGISTER({name:'Laboratory — reactor hut',x:104,z:0,r:12,h:17});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const SH=4.4,NS=6;const phase=s=>s*.55;
 const rW=(th,s)=>30+2.6*Math.sin(7*th+phase(s))+1.1*Math.sin(3*th-phase(s)*.7);
 const lSkin=[],lGuts=[];   // the six storeys become one mesh, not three or four each
 for(let s=0;s<NS;s++){const y0=s*SH;const hole=holeFn(d*(s>=4?1:.35),61+s,null,2);
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s);return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},112,6,{uS:28,vS:.6,hole:hole?(u,v)=>hole(u,y0+v*SH+s*40):null}));
  if(d>0)lGuts.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s)*.9;return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},64,2,{}));
  // undulating balcony: floor annulus + fascia band
  const rB=th=>rW(th,s)+2.4+.9*Math.sin(7*th+phase(s)+1.2);
  const bHole=d>0?(u,v)=>fbm(u*9+s,3,61+s)<.22*d:null;
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rW(th,s)-.3,rB(th),v);return[r*Math.cos(th),y0+.3,r*Math.sin(th)];},112,3,{hole:bHole}));
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rB(th);return[r*Math.cos(th),y0+.3-.5+v*1.6,r*Math.sin(th)];},112,2,{uS:28,hole:bHole}));
  // windows / ground-floor arcade
  const n=s===0?14:21;for(let k=0;k<n;k++){const th=(k+.3)/n*TAU;const u=th/TAU;if(hole&&hole(u,y0+2+s*40))continue;const r=rW(th,s)+.1;
   if(s===0)kput('archOpen',[r*Math.cos(th),4.6,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.7,1],null);
   else civWin(d>0?'winBigD':'winBigI',[r*Math.cos(th),y0+2.3,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);}
  if(s>0)stripRing(0,y0+3.9,0,rW(0,s)*.88,d,28);
  // ROOMS behind the holes (round 2): a floor plate in the band between the
  // skin and the dark liner, and furnishing wherever the skin is eaten through,
  // so a hole shows a room rather than a flat dark wall 3 m back.
  if(d>0&&hole){lGuts.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s)*lerp(.9,.985,v);return[r*Math.cos(th),y0+.32,r*Math.sin(th)];},112,1,{}));
   for(let k=0;k<56;k++){const th=(k+.5)/56*TAU,u=th/TAU;if(!hole(u,y0+SH*.5+s*40))continue;const r=rW(th,s)*.975;
    domRoom([r*Math.cos(th),y0+.35,r*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],rW(th,s)*.07,SH-.4,d,61+s);}}
  }
 meshMerged(lSkin,skin,G);meshMerged(lGuts,MAT.guts,G);
 apron(G,0,0,32,50,d,1.1);
 // Decay read off the building's own geometry rather than sprayed in rings:
 // moss only where a surface faces the sky, vines and staining only off the
 // outer edge of those surfaces, which is where the balcony ledges are.
 if(d>0){mossOnSurface(lSkin,0,0,0,150,2.0);vinesFromLedge(lSkin,0,0,0,54,16);stainsFromLedge(lSkin,0,0,0,44,13);}
 // roof slab + parapet
 const RY=NS*SH;const roofPts=[];for(let i=0;i<112;i++){const th=i/112*TAU,r=rW(th,NS-1);roofPts.push(new THREE.Vector2(r*Math.cos(th),-r*Math.sin(th)));}
 // Everything opaque in the white skin from here down is collected in `lX` and
 // merged once at the end (was ~10 meshes: roof, parapet, chimneys, caps, dome,
 // needle, porch roof, hut drum and hut dome).
 const lX=[];
 const roof=new THREE.ShapeGeometry(new THREE.Shape(roofPts));roof.rotateX(-Math.PI/2);lX.push(roof.translate(0,RY+.3,0));
 lX.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,NS-1)+.4;return[r*Math.cos(th),RY+.3+v*(1.3+.6*Math.sin(5*th)),r*Math.sin(th)];},112,2,{uS:28}));
 if(d>0)mossOnRing(0,RY+.5,0,18,40,2.4);
 // twisted chimney sculptures with helmet caps
 for(let i=0;i<6;i++){const a=i/6*TAU+.4,r=22,cx=r*Math.cos(a),cz=r*Math.sin(a);const fallen=d>0&&(i===2||i===4);
  const ch=lathe({rFn:y=>1.4*(1-.25*y/7)+.6*clamp((y-5)/2,0,1),H:7,flutes:4,amp:.35,sharp:1.5,twist:.5,nu:24,nv:14});
  if(!fallen){lX.push(ch.translate(cx,RY+.3,cz),lathe({rFn:y=>2.2*Math.sqrt(clamp(1-Math.pow(y/2.4,2),0,1)),H:2.4,nu:16,nv:6}).translate(cx,RY+7.2,cz));}
  else{const m=mesh(ch,skin,G);m.position.set(cx*1.1,RY+1.2,cz*1.1);m.rotation.set(0,-a,Math.PI/2*.95);dropFragment(m,RY+.3,.1);}}
 // lattice dome: ribbed outer shell with open panels, blue glass inner (intact)
 const R=17,Hd=22;const dR=y=>R*Math.pow(clamp(1-Math.pow(y/Hd,2),0,1),.62);
 const collapse=d>0?(u,y)=>fbm(u*3+.7,y*.06,77,2)>.62:null;
 const domeHole=(u,y)=>{const panel=Math.cos(u*TAU*24)<.35&&y<Hd*.82&&y>1.5;return panel||(collapse&&collapse(u,y));};
 lX.push(lathe({rFn:dR,H:Hd,flutes:24,amp:.07,sharp:2,nu:120,nv:36,hole:domeHole}).translate(0,RY+.3,0));
 if(d===0)mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24}),MAT.glass,G,0,RY+.3,0);
 else{mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24,hole:(u,y)=>collapse(u,y)||fbm(u*5,y*.1,78,2)<.55}),MAT.dark,G,0,RY+.3,0);}
 kput('slab',[0,RY+.6,0],null,[R*.95,.4,R*.95],new THREE.Color(0x24262a));
 stripRing(0,RY+2,0,R*.85,d,32);stripRing(0,RY+9,0,dR(9)*.85,d,32);
 // antenna spire (Moebius needle) with rings
 const AH=72;const aR=y=>2.4*Math.pow(clamp(1-y/AH,0,1),.75)+.3;const acut=d>0?AH*.55:null;
 lX.push(lathe({rFn:aR,H:AH,cut:acut,jag:acut?2:0,flutes:6,amp:.25,sharp:1.5,nu:24,nv:30,hole:holeFn(d*.6,81,acut,1)}).translate(0,RY+Hd-2,0));
 for(let yy=12;yy<AH-8;yy+=12){if(acut&&yy>acut-3)break;kput(d>0?'ringR':'ringW',[0,RY+Hd-2+yy,0],qEuler(Math.PI/2,0,0),[aR(yy)*2.2,aR(yy)*2.2,6],null);}
 if(d===0)kput('finial',[0,RY+Hd-2+AH+2,0],null,[1.8,2.8,1.8],null);
 else{const fm=mesh(lathe({rFn:y=>aR(acut+y),H:AH-acut,flutes:6,amp:.25,sharp:1.5,nu:20,nv:12}),MAT.rust,G,44,1.2,-38);fm.rotation.set(0,.8,Math.PI/2*.9);dropFragment(fm,0,.3);rubbleRing(46,0,-40,2,12,26,1.6);}
 // colonnaded porch → reactor hut
 let hut=null;if(!LABTIGHT){
 for(let i=0;i<7;i++)for(let sgn=-1;sgn<=1;sgn+=2){const x=36+i*8.5,z=sgn*5.5;const gone=d>0&&i===3&&sgn>0;
  if(!gone)kput(d>0?'colR':'colW',[x,0,z],null,[.9,6.5,.9],null);else kput('colR',[x+2,.5,z+3],qEuler(Math.PI/2,.4,0),[.9,6.5,.9],null);}
 lX.push(gridSurface((u,v)=>[34+u*56,6.6+.7*Math.sin(u*14)+.3*Math.sin(v*6),(v-.5)*14],40,8,{uS:6,vS:2,hole:d>0?(u,v)=>fbm(u*6,v*3,88,2)<.3:null}));
 hut=new THREE.Group();hut.position.set(104,0,0);G.add(hut);
 lX.push(lathe({rFn:()=>10,H:5,nu:40,nv:2,hole:holeFn(d*.5,90,null,2)}).translate(104,0,0));
 lX.push(lathe({rFn:y=>10*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,flutes:12,amp:.08,nu:48,nv:16,hole:d>0?(u,y)=>fbm(u*3,y*.1,91,2)>.6:null}).translate(104,5,0));
 }
 meshMerged(lX,skin,G);
 if(!LABTIGHT){
 if(d>0)mesh(lathe({rFn:y=>9.2*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,nu:32,nv:8}),MAT.dark,hut,0,5,0);
 kput('archOpen',[104-10,4.5,0],qFacing([-1,0,0]),[.6,.6,1],null);
 stripRing(104,7,0,7,d,20);}
 if(d>0){scatterMoss(0,0,0,34,120,160,2.4);rubbleRing(0,0,0,34,70,50,1.6);trees(0,0,70,150,18);}
 figures(-50,55,5,5);figures(60,22,3,3);KOFF=[0,0,0];
 return G;}

