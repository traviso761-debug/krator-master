// ================================================================= DATA CENTER — "the Vault" (cyclopean, windowless)
function buildDataCenter(scene,gx,gz,d){reseed(9220+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Data center — the Vault ('+STATE(d)+')',x:0,z:0,r:220,h:80});
 const W=260,Dp=140,H=62;
 // berm and the mass: battered box, 4 faces + roof
 mesh(lathe({rFn:y=>(190-3*y),H:8,nu:8,nv:2}),MAT.mud,G);
 const bat=.06;
 // RUIN: the south-east corner of the Vault has CAVED - a quarter-ellipse bitten
 // down out of both faces and the roof, the server floors behind it open to the
 // sky. (The ruin used to be the intact box with fins missing.) bx/bz: 0 at the
 // corner, 1 at the bite's edge; the bite is deepest at the corner.
 const X0=58,Z0=-12,bx=x=>(W/2-x)/(W/2-X0),bz=z=>(Dp/2-z)/(Dp/2-Z0),jg=(a,b)=>.07*(fbm(a*.08,b*.08,1702,2)-.5);
 // an ellipsoid octant: its sections are the two face bites and the roof bite
 const bite=(x,y,z)=>d>0&&x>X0-8&&z>Z0-8&&Math.pow(bx(x),2)+Math.pow(bz(z),2)+Math.pow(Math.max(0,H-y)/(H*.86),2)+jg(x+z,y)<1;
 const face=(fx,fz)=>gridSurface((u,v)=>{const y=v*H;const sh=1-bat*v;let x,z;if(fx){x=fx*W/2*sh;z=(u-.5)*Dp*sh;}else{x=(u-.5)*W*sh;z=fz*Dp/2*sh;}return[x,8+y,z];},fx?40:80,16,
  {uS:fx?14:26,vS:6,hole:(u,v)=>{const y=v*H;if(d>0&&((fx===1&&bite(W/2,y,(u-.5)*Dp))||(fz===1&&bite((u-.5)*W,y,Dp/2))))return true;const h=holeFn(d*.5,1700+fx+fz*2,null,1.4);return h?h(u,v):false;}});
 [[1,0],[-1,0],[0,1],[0,-1]].forEach(f=>mesh(face(f[0],f[1]),CONC(d),G));
 {const rh=holeFn(d*.7,1701,null,2);mesh(gridSurface((u,v)=>{const sh=1-bat;return[(u-.5)*W*sh,8+H,(v-.5)*Dp*sh];},40,20,{uS:26,vS:14,hole:(u,v)=>(d>0&&Math.pow(bx((u-.5)*W),2)+Math.pow(bz((v-.5)*Dp),2)+jg(u*W,v*Dp)<1&&(u-.5)*W>X0-8&&(v-.5)*Dp>Z0-8)||(rh?rh(u,v):false)}),CONC(d),G);}
 if(d===0)kput('boxD',[0,8+H/2,0],null,[W*.94,H,Dp*.94],null);
 else{// the dark mass keeps clear of the bite; three server floors inside it
  const xi=X0-6,zi=Z0-6,xe=W*.47,ze=Dp*.47;
  kput('boxD',[(-xe+xi)/2,8+H/2,0],null,[xe+xi,H,Dp*.94],null);kput('boxD',[(xi+xe)/2,8+H/2,(-ze+zi)/2],null,[xe-xi,H,ze+zi],null);
  for(let j=0;j<4;j++){const fy=8+j*15.5;const lim=j===0?1:.93-.18*j;
   kput(BOXC(d),[xi+(W/2*.97-xi)*lim/2,fy+.4,zi+(Dp/2*.97-zi)*lim/2],null,[(W/2*.97-xi)*lim,.8,(Dp/2*.97-zi)*lim],null);
   if(j===3)break;
   for(let z=zi+5;z<Dp/2-6;z+=8.5)for(let x=xi+5;x<W/2-7;x+=6){if((x-xi)/(W/2*.97-xi)>lim||(z-zi)/(Dp/2*.97-zi)>lim)continue;const hh=h3(x,z,1703+j);if(hh<.12)continue;
    const fall=hh>.9;kput('boxD',[x,fy+.8+(fall?.7:1.4),z],fall?qEuler(0,hh*6,Math.PI/2):null,[4.4,2.6,1.1],null);
    if(!fall&&hh<.5)kput('strip',[x,fy+2.2,z+.6],null,[3.6,1,1],hh<.2?new THREE.Color(0x8fd0ff):DEAD);}}
  // cable trays hanging off the torn floor edges, and the roof that came down
  for(let k=0;k<10;k++){const t=h3(k,1,1704);const x=lerp(X0,W/2-4,t),z=Z0+h3(k,2,1704)*(Dp/2-Z0-4);kput('tube',[x,8+15.5*(1+(k%3))-4,z],qEuler(rr(-.2,.2),0,rr(-.2,.2)),[.3,8,.3],null);}
  for(let k=0;k<14;k++){const x=rr(X0,W/2),z=rr(Z0,Dp/2);kput('boxCR',[x,8+rr(1.5,4),z],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(8,18),1.2,rr(6,14)],null);}
  rubbleRing(W/2*.8,8,Dp/2*.6,4,40,90,3.5);}
 // cooling fins: deep concrete ribs on the long faces, a few fallen in ruin
 for(let k=-9;k<=9;k++){const x=k*13;for(const s of [-1,1]){const gone=d>0&&rng()<.18;const z=s*(Dp/2*(1-bat/2)+2);let fh=H+2;if(s>0&&d>0&&x>X0-8){const t=bx(x);fh=t<1?Math.max(2,H*(1-.86*Math.sqrt(1-t*t))):fh;}
   if(!gone)kput(BOXC(d),[x,8+fh/2,z],qEuler(-bat*s*.5,0,0),[4,fh,7],null);else kput('boxCR',[x+rr(-6,6),9.5,z+s*rr(20,50)],qEuler(Math.PI/2*.9,rr(-.3,.3),0),[4,H*.8,7],null);
   const lit=d>0?rng()<.08:true;if(!bite(x+6.5,H*.6,s*Dp/2))kput('strip',[x+6.5,8+H*.6,z-s*2.5],qEuler(Math.PI/2,0,0),[H*.5,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}}
 // HATCHES AND DUCTS. The fin row was a blank concrete wall between the ribs at
 // every distance the presets use. Each bay now carries a service hatch or two,
 // two duct runs threaded through the fins with collars, and every third fin a
 // downpipe; the short ends get louvre banks. Placed off the battered face.
 {const zf=(s,yy)=>s*(Dp/2*(1-bat*yy/H)+.25),tq=s=>qEuler(-s*.068,0,0);
  for(let k=-9;k<9;k++){const x=k*13+6.5;for(const s of [-1,1]){const hh=h3(k,s,1706);
   for(const yy of [H*.3,H*.82]){if(!bite(x,yy,s*Dp/2)){kput(d>0?'pipeR':'pipe',[x,8+yy,zf(s,yy)+s*1.4],qEuler(0,0,Math.PI/2),[1.3,9,1.3],null);kput('boxD',[x-3.6,8+yy,zf(s,yy)+s*1.1],qEuler(0,0,Math.PI/2),[2.2,1.2,2.2],null);}}
   for(const yy of hh<.4?[6,H*.55]:hh<.8?[H*.55]:[6,H*.18,H*.66]){if(bite(x,yy,s*Dp/2))continue;const big=yy<8;
    kput('boxD',[x+(big?0:(hh-.5)*4),8+yy,zf(s,yy)],tq(s),big?[5,7,.5]:[3,3,.4],null);kput(BOXC(d),[x+(big?0:(hh-.5)*4),8+yy+(big?4:2),zf(s,yy)+s*.3],tq(s),[big?6.4:4,.5,.8],null);}
   if(k%3===0&&!(s>0&&d>0&&x>X0-8))kput(d>0?'pipeR':'pipe',[x-6.5+s*0+3.2,8+H*.5,zf(s,H*.5)+s*4],tq(s),[.8,H,.8],null);}}
  for(const sx of [-1,1])for(let j=-1;j<=1;j++){const z=j*38;if(sx>0&&bite(W/2,H*.4,z))continue;const xf=sx*(W/2*(1-bat*.4)+.3);
   kput('boxD',[xf,8+H*.4,z],qEuler(0,0,sx*.068),[.5,16,20],null);for(let r=0;r<6;r++)kput(BOXC(d),[xf+sx*.4,8+H*.4-6.5+r*2.6,z],qEuler(0,0,sx*.068),[1,.5,21],null);}}
 // roof chillers: 8 drums with dark grilles; exhaust stacks
 for(let i=0;i<8;i++){const x=-105+i*30,z=(i%2?1:-1)*22;const gone=d>0&&(i===2||i===5);if(bite(x,H,z)){rubbleRing(x,8,z,3,16,24,2);continue;}mesh(lathe({rFn:y=>11*(1-.02*y),H:12,flutes:16,amp:.05,nu:40,nv:4,hole:holeFn(d*.7,1710+i,null,2.5)}),CONC(d),G,x,8+H,z);
  if(!gone)kput('slab',[x,8+H+12.2,z],null,[10.5,.4,10.5],new THREE.Color(0x1a1d22));else{rubbleRing(x,8+H,z,3,14,20,1.5);}
  kput(d>0?'pipeR':'pipe',[x,8+H+6,z+(i%2?-1:1)*14],qEuler(Math.PI/2,0,0),[1.2,14,1.2],null);}
 for(let i=0;i<3;i++){const x=-30+i*30;mesh(lathe({rFn:y=>4.5*(1-.2*y/40)+1.5*clamp((y-34)/6,0,1),H:40,cut:d>0&&i===1?22:null,jag:2,flutes:8,amp:.1,nu:24,nv:12}),CONC(d),G,x,8+H,-50);}
 // the slit entrance: a deep cut ramping down into the mass; substation yard
 kput('boxD',[0,8+9,Dp/2*.97-2],null,[9,18,16],null);kput(BOXC(d),[0,4,Dp/2+30],qEuler(.12,0,0),[12,1.5,50],null);for(const s of [-1,1])kput(BOXC(d),[s*7,6,Dp/2+30],qEuler(.12,0,0),[1.5,4,50],null);
 for(let i=0;i<6;i++){const x=W/2+30+(i%3)*18,z=-30+Math.floor(i/3)*30;kput('boxD',[x,4,z],null,[10,8,8],null);for(let k=0;k<3;k++)kput('tube',[x-3+k*3,10,z],null,[.6,4,.6],null);kput(d>0?'pipeR':'pipe',[x,9,z+10],qEuler(Math.PI/2,0,0),[.5,14,.5],null);}
 for(let k=0;k<4;k++)kput(d>0?'colR':'colW',[W/2+10+k*22,0,60],null,[1,12,1],null);kput(d>0?'pipeR':'pipe',[W/2+43,11,60],qEuler(0,0,Math.PI/2),[.8,70,.8],null);
 for(let k=-10;k<=10;k++)for(const sz of [-1,1]){const lit=d>0?rng()<.1:true;if(bite(k*12,H,sz*Dp*.42))continue;kput('strip',[k*12,8+H+.6,sz*Dp*.42],null,[8,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}
 if(d>0){scatterMoss(0,8,0,0,180,120,3);mossOnRing(0,8+H+.3,0,50,30,3);for(let i=0;i<30;i++){const a=rng()*TAU,L=rr(4,30),q=qEuler(rr(-.12,.12),0,rr(-.12,.12)),sx=rr(.8,1.6),sz=rr(.8,1.6);const x=Dp/2*.9*Math.cos(a),z=Dp/2*.9*Math.sin(a);if(!bite(x,H,z))kput('vine',[x,8+H,z],q,[sx,L,sz],null);}rubbleRing(0,8,0,100,200,70,3);trees(0,0,200,290,20);}
 figures(0,120,4,8);civFlatten(G);KOFF=[0,0,0];return G;}

