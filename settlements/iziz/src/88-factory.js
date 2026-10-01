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
  if(d===0){const gl=mesh(paraFill(34,40,0,0),MAT.glass,G,hx,yb,zz+(i?-.3:.3));}
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
    kput(d>0?'ovalD':'ovalI',[cx+ox+Rl*Math.cos(th),legH+yy,cz+oz+Rl*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,1.4,1],null);}
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

