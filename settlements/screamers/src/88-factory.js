// ================================================================= 2. FACTORY — "the Foundry"
function buildFactory(scene,gx,gz,d){reseed(d>0?9201:9200);KOFF=[gx,0,gz];REGISTER({name:'Factory — the Foundry ('+STATE(d)+')',x:0,z:0,r:260,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // plinth
 const pl=new THREE.CylinderGeometry(190*Math.SQRT2,196*Math.SQRT2,6,4,1);pl.rotateY(Math.PI/4);pl.translate(0,3,0);pl.scale(1,1,.62);mesh(pl,skin,G,-10,0,0);
 // --- great catenary vault hall (ribs + skin) -------------------------------------------------
 const W=90,Hh=55,L=160,hx=-40,z0=-L/2;const yb=6;
 for(let i=0;i<=16;i++){if(d>0&&(i===5||i===6||i===11))continue;kput(d>0?'vaultRibR':'vaultRib',[hx,yb,z0+i*10],null,1,null);}
 const skinFn=(u,v)=>{const x=(u-.5)*(W-2);return[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2)),z0+v*L];};
 const ridge=(u)=>Math.abs(u-.5)<.045;
 const skH=holeFn(d,21,null,1.3);
 mesh(gridSurface(skinFn,60,64,{uS:12,vS:20,hole:(u,v)=>ridge(u)||(skH&&skH(u*4,v*L))}),skin,G);
 if(d===0)mesh(gridSurface((u,v)=>skinFn(.455+u*.09,v),8,32,{}),MAT.glass,G);
 if(d>0){mesh(gridSurface((u,v)=>{const p=skinFn(u,v);return[p[0]*.97+hx*.03,yb+(p[1]-yb)*.93,p[2]];},40,32,{uS:12,vS:20}),MAT.guts,G);
  for(let k=0;k<30;k++){const x=rr(-38,38),z=rr(z0+5,z0+L-5);kput('pipeR',[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2))*.9,z],qEuler(Math.PI/2,0,0),[.6,rr(10,40),.6],null);}}
 // end walls with big arched glass openings
 [z0,z0+L].forEach((zz,i)=>{const g=paraFill(W,Hh,34,40);const m=mesh(g,skin,G,hx,yb,zz);
  if(d===0){const gl=mesh(paraFill(34,40,0,0),MAT.glass,G,hx,yb,zz+(i?-.3:.3));}
  mullions(hx,yb,zz,0,0,0,d);for(let k=-3;k<=3;k++)kput(d>0?'mullR':'mullW',[hx+k*4.8,yb+19,zz],null,[1,36*(1-Math.pow(k/3.6,2)),1],null);});
 // interior strips along the hall
 for(let k=0;k<12;k++){const z=z0+8+k*13;const lit=d>0?rng()<.12:true;kput('strip',[hx,yb+Hh-4,z],null,[60,1,1],lit?CYAN:DEAD);}
 // --- Goldberg clover silos on hyperboloid legs -----------------------------------------------
 function silo(cx,cz,tilt,seed){const S=new THREE.Group();S.position.set(cx,0,cz);if(tilt)S.rotation.x=tilt;G.add(S);
  const legH=15,lobeH=46,Rl=9.5;
  mesh(lathe({rFn:()=>6.5,H:legH+lobeH+2,nu:24,nv:4}),skin,S);
  for(let l=0;l<4;l++){const a=(l+.5)*Math.PI/2,ox=Math.cos(a)*10.5,oz=Math.sin(a)*10.5;
   kput(d>0?'colR':'colW',[cx+ox,0,cz+oz],null,[3.2,legH,3.2],null);
   const hole=holeFn(d,seed+l,null,1.6);const o={rFn:y=>Rl*(1-.04*Math.pow(clamp(y/lobeH,0,1),6)),H:lobeH,nu:36,nv:24,hole,seed};
   const lm=mesh(lathe(o),skin,S,ox,legH,oz);
   if(d>0)mesh(lathe({rFn:()=>Rl*.9,H:lobeH,nu:20,nv:2}),MAT.guts,S,ox,legH,oz);
   // rim + oval windows facing outward from the core
   kput(d>0?'ringR':'ringW',[cx+ox,legH+lobeH,cz+oz],qEuler(Math.PI/2,0,0),[Rl+.2,Rl+.2,3],null);
   for(let yy=4;yy<lobeH-3;yy+=5.5)for(let k=-2;k<=2;k++){const th=a+k*.42;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,yy))continue;
    kput(d>0?'ovalD':'ovalI',[cx+ox+Rl*Math.cos(th),legH+yy,cz+oz+Rl*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,1.4,1],null);}
   if(d>0)vinesOnRing(cx+ox,legH+lobeH,cz+oz,Rl,10,30);}
  kput('slab',[cx,legH+lobeH+2,cz],null,[7,1,7],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  if(d>0)mossOnRing(cx,legH+lobeH+2.3,cz,6,10,2);}
 silo(72,-58,0,31);silo(72,0,0,32);silo(72,58,0,33);
 // pipes silos → hall
 for(let i=0;i<3;i++){const z=-58+i*58;kput(d>0?'pipeR':'pipe',[30,34+i*3,z],qEuler(0,0,Math.PI/2),[1.6,70,1.6],null);
  if(d>0&&i===1)continue;kput(d>0?'pipeR':'pipe',[30,34+i*3,z+6],qEuler(0,0,Math.PI/2),[1.1,70,1.1],null);}
 // --- organic stacks (Parc Güell chimneys, industrial scale) ------------------------------------
 for(let i=0;i<4;i++){const cx=22,cz=-75+i*50,H=95+i*6;const cutF=d>0?[.55,null,.7,null][i]:null;const cut=cutF!=null?H*cutF:null;
  const rFn=y=>6.5*(1-.45*y/H)+2.2*clamp((y-H+14)/14,0,1);const hole=holeFn(d,41+i,cut,1.2);
  const o={rFn,H,cut,jag:cut?4:0,flutes:9,amp:.28,sharp:2.5,nu:54,nv:40,hole,seed:41+i};
  mesh(lathe(o),skin,G,cx,6,cz);if(d>0)mesh(lathe({rFn:y=>rFn(y)*.85,H,cut,jag:o.jag,nu:20,nv:8}),MAT.guts,G,cx,6,cz);
  if(cut==null){const rc=rFn(H)+1.2;mesh(lathe({rFn:y=>rc*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:8}),skin,G,cx,6+H-.5,cz);}
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
 factoryExtras(G,d,skin);
 if(d>0){scatterMoss(-10,6,0,0,200,200,3);rubbleRing(0,6,0,20,190,90,2.5);trees(0,0,210,290,24);scatterMoss(0,0,0,205,300,120,3);}
 figures(-120,120,6,8);figures(40,-130,4,5);KOFF=[0,0,0];
 return G;}

