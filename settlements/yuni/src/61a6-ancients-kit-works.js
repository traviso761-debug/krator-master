// ================================================================= SKYSCRAPER H — "the Warden" (Elinhir: blank tapering keep with slits)
// DECAY 4 IS "PROJECT H": rehabilitated and still standing, the same idea as
// Projects A and D. The Warden's whole character is that it has far too few
// openings for its size, so its fire grid is only 20 bays (four flat faces of
// five slits) — and the reoccupation keeps every slit rather than the random
// half the ruin drops, because people living in a building unblock its windows.
// The mask is the shared one (fireMask). Its setback ledges are the best
// "exposed decks" in the kit: four real terraces up the height of the keep.
function buildSkyH(scene,gx,gz,d){reseed(9170+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark();
 const H=330,Y0=8;REGISTER({name:(PROJ?'Project H — the Warden reoccupied whole (rehabilitated)':'Skyscraper H — the Warden ('+(d===2?'toppled':STATE(d))+')'),x:0,z:0,r:120,h:H+30});
 // PLINTH. The keep is half(0)*se(th,7) = 43.5 at its corners and the lowest
 // setback ledge reaches 45. Nothing else stands on the podium. 56 puts
 // skyPlinth's column ring at 52 — outboard of the ledge, half the old 110.
 const PR=56;
 skyPlinth(G,dd,PR);
 const half=y=>{const t=clamp(y/H,0,1);const step=Math.floor(t*5)/5;return 34*(1-.45*step)-2*(t*5-step*5)*.3;};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.7:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx*.9,87+(upper?1:0),cut!=null?L:null,1.1);if(d===1&&!upper)hole=skyScarHole(hole,.3,.12,L*.4,L,87);   // the collapse scar (52-sky-abc.js)
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const groove=Math.abs(Math.sin(2*th))>.995?.9:1;const r=half(y+y0)*se(th,7)*groove;return[r*Math.cos(th),y,r*Math.sin(th)];},128,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){
   // the cut section, as fixed on Skyscraper A: the lining takes the SAME hole
   // predicate as the outer skin (it had none) at a grid fine enough to line up
   // with it, and the plates are pale with a dark soffit under each
   mesh(gridSurface((u,v)=>{const th=u*TAU,y=v*L;const r=half(y+y0)*.86*se(th,7);return[r*Math.cos(th),y,r*Math.sin(th)];},64,Math.max(8,Math.round(L/6)),{hole:hole?(u,v)=>hole(u,v*L):null}),MAT.guts,P);
   for(let y=6;y<L-2;y+=6){const hp=half(y+y0);
    kput('slab',[0,y,0],null,[hp*.9,.6,hp*.9],new THREE.Color(0xbdb7ad));
    kput('slab',[0,y-1.3,0],null,[hp*.87,.7,hp*.87],new THREE.Color(0x191b1f));}
   skyRooms({rFn:y=>half(y+y0)*.84,y0:6,y1:L-2,step:6,soff:1.3,hole,d,seed:87});}   // interiors behind the openings (52-sky-abc.js)
  // setback ledges + corner turrets, slit windows sparse
  for(let s=1;s<5;s++){const ys=H*s/5-y0;if(ys<2||ys>L-2)continue;const h1=half(H*s/5-.1),h2=half(H*s/5+.1);kput(BOXC(dx),[0,ys,0],null,[h1*2+2,1.6,h1*2+2],null);
   for(const cx of [-1,1])for(const cz of [-1,1])kput(BOXC(dx),[cx*(h1-3),ys+4,cz*(h1-3)],null,[6,8,6],null);
   // THE EXPOSED DECKS. These four setbacks are the only floors on the Warden
   // open to the sky, and on Project H they are where the camps are. Kept off
   // the corners, which the turrets already occupy.
   if(PROJ)for(let q=0;q<3;q++){const e=h1-1.4,t=rr(-.6,.6)*e*1.5;
    const P4=[[e,t],[t,e],[-e,t],[t,-e]][(s*3+q)%4];
    firePit('H',P4[0],ys+1.1,P4[1],rr(1.4,2.6));}}
  const NB=20,burns=PROJ?fireMask('H',NB,Math.ceil((L-10)/9),9174,9):null;
  for(let y=5,sy=0;y<L-5;y+=9,sy++)for(let f=0;f<4;f++){const th=f*Math.PI/2;for(let k=-2;k<=2;k++){if(k===0)continue;if(!PROJ&&rng()<.5)continue;const r=half(y+y0)+.15;const u=((th+k*.12)/TAU+1)%1;if(hole&&hole(u,y))continue;
   const px=Math.cos(th)*r+(-Math.sin(th))*k*r*.32,pz=Math.sin(th)*r+Math.cos(th)*k*r*.32;
   const nrm=[Math.cos(th),0,Math.sin(th)];
   kput(dx>0?'winSmD':'winSmI',[px,y,pz],qFacing(nrm),[.8,3.2,1],null);
   if(PROJ&&burns(f*5+k+2,sy))fireWindow([px,y,pz],nrm,qFacing(nrm),1.0,3.0);}}
  if(!PROJ)for(let yy=20;yy<(d===1&&!upper?L*.4:L-10);yy+=40)stripRing(0,yy,0,half(yy+y0)*.9,dx,8);
  if(cut==null){const ht=half(H);kput(BOXC(dx),[0,L+1,0],null,[ht*2+3,2,ht*2+3],null);for(let k=0;k<12;k++){const a=k/12*TAU;const r=ht*se(a,7)+.5;kput(BOXC(dx),[r*Math.cos(a),L+4,r*Math.sin(a)],qEuler(0,-a,0),[2.5,5,3],null);}
   mesh(lathe({rFn:y=>ht*.55*(1-.3*y/30)+1.5*clamp((y-24)/6,0,1),H:30,flutes:4,amp:.15,sharp:2,nu:24,nv:10}),CONC(dx),P,0,L+2,0);kput('finial',[0,L+38,0],null,[3,5,3],null);stripRing(0,L+26,0,ht*.45,dx,12);}};
 bodyGroup(G,Y0,d,dd,build,Y0+80,half(Y0+80),PROJ);
 if(dd>0)vinesOnRing(0,Y0+H/5,0,half(H/5)*1.05,20,30);
 if(PROJ){const ht=half(H);
  for(let k=0;k<4;k++)firePit('H',rr(-ht,ht),Y0+(H-Y0)+2.4,rr(-ht,ht),rr(1.6,2.8));   // the crown slab
  for(let k=0;k<8;k++){const a=rng()*TAU,r=rr(40,PR*.9);firePit('H',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.6,3));}}
 if(d===3)skyHoist((y,a)=>half(y)*se(a,7),H-2,5,9170);
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,6,6);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}

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
  // the dark mass's two cut faces read as flat grey walls; give them a building
  // section: floor edges at every server level and a column at every bay (round 2)
  for(let j=1;j<4;j++){const fy=8+j*15.5;kput(BOXC(d),[xi+.7,fy+.4,(zi+ze)/2],null,[1.4,.9,ze-zi],null);kput(BOXC(d),[(xi+xe)/2,fy+.4,zi+.7],null,[xe-xi,.9,1.4],null);
   for(let z=zi+4;z<ze;z+=8.5)if(h3(z,j,1707)<.5)kput('strip',[xi+.3,fy+3.4,z],qEuler(0,Math.PI/2,0),[4,1,1],h3(j,z,1708)<.2?new THREE.Color(0x8fd0ff):DEAD);}
  for(let z=zi+8.5;z<ze;z+=8.5)kput(BOXC(d),[xi+.6,8+H/2,z],null,[1.2,H,1.2],null);for(let x=xi+6;x<xe;x+=6)kput(BOXC(d),[x,8+H/2,zi+.6],null,[1.2,H,1.2],null);
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

// ================================================================= HOSPITAL — "the Cloister" (Prentice quatrefoil over a podium)
function buildHospital(scene,gx,gz,d){reseed(9240+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hospital — the Cloister ('+STATE(d)+')',x:0,z:0,r:120,h:90});
 // podium: 3 storeys, glass ribbons between concrete slabs
 const PW=150,PD=104,SH=5;for(let f=0;f<=3;f++){kput(BOXC(d),[0,f*SH,0],null,[PW,.8,PD],null);if(f<3){if(d===0){kput('pane',[0,f*SH+2.8,PD/2],null,[PW-2,3.6,1],null);kput('pane',[0,f*SH+2.8,-PD/2],null,[PW-2,3.6,1],null);kput('pane',[PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);kput('pane',[-PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);}
  // WARDS (round 2): the dark core is pulled back 7.5 m from the ribbon, and the
  // band in front of it is cut into bays at the facade posts, a bed in each,
  // so the ribbon (glass or empty frame) shows rooms instead of a grey box face
  // 1.5 m behind it. Hash-placed: no rng draw moves.
  kput('boxD',[0,f*SH+2.8,0],null,[PW-15,3.6,PD-15],null);
  if(f<3){for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1]){const hh=h3(x,f,1911+s);kput(BOXC(d),[x,f*SH+2.8,s*(PD/2-4)],null,[.25,4.2,7],null);
    if(x+5<PW/2){const tip=d>0&&hh>.72;kput(d>0?'boxR':'boxW',[x+5+(hh-.5)*3,f*SH+.4+(tip?.55:.45),s*(PD/2-6.2)],tip?qEuler(.2,hh*4,1.3):null,[2.2,tip?1:.6,1.1],null);
     if(hh<.4)kput('boxD',[x+1,f*SH+1.4,s*(PD/2-6.9)],null,[1.2,2,.6],null);}}
   for(let z=-PD/2+10;z<PD/2-5;z+=10)for(const sx of [-1,1])kput(BOXC(d),[sx*(PW/2-4),f*SH+2.8,z],null,[7,4.2,.25],null);}
  // ruin: the ribbon glazing is gone but for teeth of it left in the frames
  if(d>0)for(let x=-PW/2+10;x<PW/2;x+=10)for(const sd of [-1,1]){const hh=h3(x,f,1905+sd);if(hh<.5)civShardAt([x,f*SH+2.8,sd*PD/2],qFacing([0,0,sd]),8.6,3.6,.1,hh*2);}for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1])kput(BOXC(d),[x,f*SH+2.8,s*PD/2],null,[.8,4,.8],null);
  for(let k=0;k<8;k++){const lit=d>0?rng()<.15:true;kput('strip',[-70+k*20,f*SH+4.4,PD/2-1],null,[12,1,1],lit?CYAN:DEAD);}}}
 kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+5],null,[30,.8,12],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+9],null,[1,5.5,1],null);
 // bed tower: four lobes cantilevered from a square core, oval windows in rows
 const CY=3*SH,TH=42;kput(BOXC(d),[0,CY+TH/2-4,0],null,[22,TH-8,22],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[24,TH+8,8],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[8,TH+8,24],null);
 const LR=23.5;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*20,cz=Math.sin(a)*20;const gone=false;const hole=holeFn(d*.8,1900+l,null,2);
  // RUIN: the lobe facing the row camera has fallen to a ragged stump (it was
  // the one at the back, where no preset saw it, and its rubble lay buried
  // inside the podium); the back-right lobe is torn off at two thirds.
  const lcut=d>0&&l===3?TH*.62:null;
  if(gone){// what stays is the torn inner shell, still keyed to the core
   mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2)),H:TH,cut:TH*.8,jag:5,nu:48,nv:20,seed:1907,hole:(u,y)=>civDA(u*TAU,a+Math.PI)>.75+.6*(fbm(u*9,y*.09,1906,2)-.5)-.25*y/TH}),CONC(d),G,cx,CY+8,cz);
   rubbleRing(cx,CY+.4,cz,LR*.7,LR*1.7,70,3.2);for(let k=0;k<6;k++){const q=h3(k,1,1908);kput('boxCR',[cx+Math.cos(a+q*2-1)*(LR+8+q*10),CY+1.5,cz+Math.sin(a+q*2-1)*(LR+8+q*10)],qEuler(q-.5,q*6,.4-q*.8),[8+q*6,1,5+q*5],null);}continue;}
  mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2))*(1-.03*Math.pow(clamp((y-TH+6)/6,0,1),2)),H:TH,cut:lcut,jag:lcut?3:0,seed:1909,nu:48,nv:20,hole}),CONC(d),G,cx,CY+8,cz);
  if(d>0){mesh(lathe({rFn:()=>LR*.62,H:lcut?lcut-4:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);   // wards behind the holes
   civRooms({cx,cy:CY+8,cz,rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2)),y0:9.2,y1:TH-2,step:6.5,d,seed:1910+l,rIn:.62,dens:9,cut:lcut});}
  else mesh(lathe({rFn:()=>LR*.9,H:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);if(!lcut)kput('slab',[cx,CY+8+TH,cz],null,[LR*.98,.8,LR*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  for(let r=0;r<5;r++)for(let k=0;k<14;k++){const th=a-Math.PI*.55+k/13*Math.PI*1.1;const u=((th%TAU)+TAU)%TAU/TAU;const yy=12+r*6.5;if(hole&&hole(u,yy))continue;if(lcut&&yy>lcut-4)continue;civWin(d>0?'ovalD':'ovalI',[cx+LR*1.0*Math.cos(th),CY+8+yy,cz+LR*1.0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.5,1.9,1],null);}
  const top=lcut?lcut-3:TH;if(!lcut)stripRing(cx,CY+8+TH-2,cz,LR*.85,d,24);if(d>0){vinesOnRing(cx,CY+8+top,cz,LR,12,16);if(!lcut)mossOnRing(cx,CY+8+TH+.4,cz,LR*.7,8,2);else rubbleRing(cx*1.9,CY+.4,cz*1.9,2,14,24,2.4);}}
 // helipad + plant on the core
 const RF=CY+8+TH;kput(SLABC(d),[0,RF+.9,0],null,[16,1,16],null);kput('boxD',[0,RF+1.45,0],null,[6,.12,1],null);kput('boxD',[0,RF+1.45,0],null,[1,.12,6],null);for(let k=0;k<12;k++){const a=k/12*TAU;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*14,RF+1.5,Math.sin(a)*14],qEuler(0,-a,0),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}
 for(let k=0;k<3;k++)kput(d>0?'pipeR':'pipe',[-16-k*2.5,RF+3,19],null,[.8,6,.8],null);
 // ambulance apron
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);for(let k=0;k<5;k++)kput('boxD',[-34+k*17,.7,PD/2+8],null,[6,.1,8],null);
 if(d>0){scatterMoss(0,3*SH+.4,0,0,80,60,2.5);rubbleRing(0,.6,0,60,120,50,2.5);trees(0,0,100,150,10);}
 figures(0,90,5,10);civFlatten(G);KOFF=[0,0,0];return G;}

// ================================================================= factory: great silo replaces the ring block
function factorySilo(G,d,skin,M){const ax=110,az=-60;REGISTER({name:'Factory — great silo',x:ax,z:az,r:45,h:150});
 const stem=y=>y<12?8+.03*Math.pow(12-y,2):(y<20?8+27*Math.pow((y-12)/8,1.6):35);
 M.add(lathe({rFn:stem,H:30,nu:64,nv:30,hole:holeFn(d*.6,80,null,1.5)}),skin,ax,6,az);if(d>0)M.add(lathe({rFn:y=>stem(y)*.92,H:30,nu:32,nv:6}),MAT.dark,ax,6,az);
 for(let k=0;k<28;k++){const th=k/28*TAU;if(d>0&&rng()<.4)continue;beam(d>0?'strutR':'strutW',[ax+Math.cos(th)*17,20,az+Math.sin(th)*17],[ax+Math.cos(th)*37,38,az+Math.sin(th)*37],2.2,1.8);
  const r=35.6;civWin(d>0?'winSmD':'winSmI',[ax+Math.cos(th+.11)*r,31,az+Math.sin(th+.11)*r],qFacing([Math.cos(th+.11),0,Math.sin(th+.11)]),[5,1.6,1],null);}
 kput('slab',[ax,36.4,az],null,[36,1,36],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(ax,33,az,33,d,40);
 for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===3||k===9))continue;kput(d>0?'colR':'colW',[ax+Math.cos(th)*30,6,az+Math.sin(th)*30],null,[1.2,14,1.2],null);}
 // the silo proper: 8-lobed drum rising 110 m from the ring, domed cap, service ring
 const SH=110,cut=d>0?SH*.7:null;const sr=y=>26*(1-.12*y/SH);
 M.add(lathe({rFn:sr,H:SH,cut,jag:cut?5:0,flutes:8,amp:.22,sharp:1.2,nu:96,nv:50,hole:holeFn(d,85,cut,1.4),seed:85}),skin,ax,37,az);
 if(d>0)M.add(lathe({rFn:y=>sr(y)*.88,H:SH,cut,jag:5,nu:32,nv:8,seed:85}),MAT.guts,ax,37,az);
 for(let yy=12;yy<(cut||SH)-8;yy+=22)kput(d>0?'ringR':'ringW',[ax,37+yy,az],qEuler(Math.PI/2,0,0),[sr(yy)*1.05,sr(yy)*1.05,4],null);
 if(!cut){M.add(lathe({rFn:y=>sr(SH)*Math.sqrt(clamp(1-Math.pow(y/14,2),0,1)),H:14,nu:48,nv:8}),skin,ax,37+SH-.5,az);stripRing(ax,37+SH-3,az,sr(SH)*.95,d,32);}
 else rubbleRing(ax,6,az,38,52,60,3);
 for(let k=0;k<3;k++){const th=k/3*TAU+.5;kput(d>0?'pipeR':'pipe',[ax+Math.cos(th)*24,37,az+Math.sin(th)*24],null,[1.1,(cut||SH)*.9,1.1],null);}
 kput(d>0?'pipeR':'pipe',[ax-30,26,az+20],qEuler(0,.6,Math.PI/2),[1.6,60,1.6],null);}

// ================================================================= APARTMENTS — three variants
function buildApartments(scene,gx,gz,d){reseed(9950+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);let talus=null;
 // A — midrise terrace stack: eight stacked lobed trays, each shifted and shrunk, on a hyperboloid stem
 {REGISTER({name:'Apartments A — terrace stack, midrise ('+STATE(d)+')',x:0,z:0,r:40,h:60});mesh(lathe({rFn:y=>7*Math.sqrt(1+1.5*Math.pow((y-20)/20,2)),H:40,nu:32,nv:12}),skin,G);
  const aSkin=[],aDark=[];   // one mesh per stack, not two or three per terrace
  for(let s=0;s<8;s++){const y=6+s*5.4;const ox=Math.sin(s*1.3)*5,oz=Math.cos(s*.9)*5;const R=24-s*1.6;const gone=d>0&&s===6;const hole=holeFn(d*.7,700+s,null,2.5);
   if(gone){rubbleRing(ox*3,0,oz*3,10,32,30,2);continue;}
   // floor and ceiling: each tray was an open-ended tube, so from above you
   // looked straight down through all eight of them to the ground.
   kput('slab',[ox,y,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   kput('slab',[ox,y+4.6,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   aSkin.push(lathe({rFn:()=>R,H:4.6,flutes:6,amp:.28,sharp:1,nu:72,nv:3,hole}).translate(ox,y,oz));
   if(d>0)aDark.push(lathe({rFn:()=>R*.9,H:4.6,nu:24,nv:1}).translate(ox,y,oz));
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))*(1+v*.1);return[ox+r*Math.cos(th),y+4.6+.4*v,oz+r*Math.sin(th)];},72,1,{}));
   for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))+.1;if(hole&&hole(k/18,2.3))continue;civWin(d>0?'winSmD':'winSmI',[ox+r*Math.cos(th),y+2.3,oz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2,1.7,1],null);}
   // rooms behind the holes in the tray wall (round 2), between the skin and
   // the dark liner at .9R; the tray's floor and ceiling slabs bound them
   if(hole)for(let k=0;k<36;k++){const th=(k+.5)/36*TAU;if(!hole((k+.5)/36,2.3))continue;const r=R*(1+.28*(.5+.5*Math.cos(6*th)));
    domRoom([ox+r*.97*Math.cos(th),y+.2,oz+r*.97*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],r*.97-R*.9,4.2,d,700+s);}
   const lobe=th=>R*(1+.28*(.5+.5*Math.cos(6*th)));
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)+.1;return[ox+r*Math.cos(th),y+5.0+v*1.15,oz+r*Math.sin(th)];},72,2,{uS:14,vS:.4}));     // terrace parapet
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)+.1;return[ox+r*Math.cos(th),y+6.15,oz+r*Math.sin(th)*1];},72,1,{}));                    // parapet coping
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.98,lobe(th)+.1,v);return[ox+r*Math.cos(th),y+4.5-.25*v,oz+r*Math.sin(th)];},72,1,{}));   // soffit under the deck
   if(s<7)aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.99,(24-(s+1)*1.6)*.99,v);const ox2=lerp(ox,Math.sin((s+1)*1.3)*5,v),oz2=lerp(oz,Math.cos((s+1)*.9)*5,v);
    return[ox2+r*Math.cos(th),y+4.95+v*.45,oz2+r*Math.sin(th)];},72,1,{}));                                                                         // closes the gap up to the next tray
   if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);}
  {const ty=6+7*5.4,tR=24-7*1.6,tox=Math.sin(7*1.3)*5,toz=Math.cos(7*.9)*5;      // the top stage gets a real roof
   aSkin.push(lathe({rFn:yy=>tR*1.03*Math.pow(clamp(1-Math.pow(yy/7.4,2),0,1),.55),H:7.4,flutes:6,amp:.13,sharp:1.4,nu:56,nv:12,hole:holeFn(d*.5,760,null,2)}).translate(tox,ty+4.95,toz));
   kput('slab',[tox,ty+4.9,toz],null,[tR*1.02,.4,tR*1.02],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   if(d===0)kput('finial',[tox,ty+12.6,toz],null,[1.2,2,1.2],null);}
  meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);
  if(d>0){mossOnSurface(aSkin,0,0,0,90,1.8);vinesFromLedge(aSkin,0,0,0,40,12);stainsFromLedge(aSkin,0,0,0,30,9);}
  kput('archOpen',[7,3.5,0],qFacing([1,0,0]),[.5,.5,1],null);}
 // B — honeycomb wall: a long curved slab of hexagonal cells (Beksinski lattice), 12 storeys
 {const bx=150;REGISTER({name:'Apartments B — honeycomb wall, large ('+STATE(d)+')',x:bx,z:0,r:70,h:62});const R=110,a0=-.55,a1=.55,HW=60;
  const hexHole=(u,v)=>{const cx=u*30,cy=v*13;const rowOff=(Math.floor(cy)%2)*.5;const fx=((cx+rowOff)%1)-.5,fy=(cy%1)-.5;return Math.abs(fx)<.32&&Math.abs(fy)<.34&&Math.abs(fx)+Math.abs(fy)*1.2<.52;};
  // THE BITE. In the ruin the upper storeys over the east third of the arc have
  // come down (top line falling to ~45% of HW, jagged), exposing the floor
  // plates in section. The ruin used to be the intact slab with more holes,
  // which is the same silhouette. `bite(u)` is the surviving height at u.
  const bite=u=>{const t=clamp(1-Math.abs(u-.72)/.24,0,1);return HW-(t>0?HW*.55*Math.pow(t,.7)+6*(fbm(u*14,3.1,725,2)-.5)*Math.min(1,t*4):0);};
  const bit=(u,y)=>d>0&&y>bite(u);
  const wall=(off)=>gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R+off;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},240,80,{uS:30,vS:13,hole:(u,v)=>hexHole(u,v)||bit(u,v*HW)||(holeFn(d,710,null,1.5)||(()=>false))(u*3,v*HW)});
  mesh(wall(0),skin,G);mesh(wall(-12),skin,G);
  // cell floors between the skins, dark inner
  mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-6;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},60,12,{hole:(u,v)=>bit(u,(v+.5/12)*HW)}),MAT.dark,G);
  const bFloors=[];
  for(let f=0;f<13;f++){const y=f*HW/13;bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,y,Math.cos(a)*r-R*.8];},60,1,{hole:d>0?(u,v)=>fbm(u*12,f,720+f,2)<.2||bit(u,y+.5):null}));}
  // END WALLS AND ROOF. The block is a 12 m sandwich of two perforated skins;
  // without these it was open along both end elevations and across the whole
  // top, so you looked straight into thirteen storeys of floor slab from the
  // side. The skins are the long elevations, not the whole envelope.
  for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
   bFloors.push(gridSurface((u,v)=>{const r=lerp(R-12,R,u);return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},10,44,{uS:6,vS:13,hole:d>0?(u,v)=>fbm(u*4+s*3,v*7,714+s,2)<.28:null}));}
  bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,HW,Math.cos(a)*r-R*.8];},60,4,{uS:20,vS:4,hole:d>0?(u,v)=>fbm(u*9,v*4,716,2)<.24||bit(u,HW-.5):null}));
  meshMerged(bFloors,skin,G);
  for(let k=0;k<30;k++)for(let f=0;f<13;f++){if(rng()>.35)continue;const a=lerp(a0,a1,(k+.5)/30),y=f*HW/13+2.3;const lit=d>0?rng()<.06:true;if(bit((k+.5)/30,y+1))continue;
   kput('cell',[bx+Math.sin(a)*(R-5),y,Math.cos(a)*(R-5)-R*.8],qFacing([Math.sin(a),0,Math.cos(a)]),[2,1.6,1],lit?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}
  for(let k=0;k<7;k++){const a=lerp(a0,a1,(k+.5)/7);const bk=bite((k+.5)/7),h=d>0&&bk<HW-.01?bk-1.5:HW+3;kput(d>0?'colR':'colW',[bx+Math.sin(a)*(R-6),0,Math.cos(a)*(R-6)-R*.8],null,[3,h,3],null);}
  // the fallen storeys: a talus against the foot of the bite, both faces. Run
  // after figures() (see the end) so the PRNG stream above it is unchanged.
  if(d>0)talus=()=>{for(let i=0;i<130;i++){const u=.5+.44*rng(),g=HW-bite(u);if(g<4){rng();rng();continue;}const a=lerp(a0,a1,u),side=rng()<.5?1:-1,q=Math.pow(rng(),1.8);
   const r=side>0?R+2+q*22:R-14-q*18,s=rr(1,3.4)*(1.2-.5*q)*Math.min(1,g/20);
   kput('rubble',[bx+Math.sin(a)*r,s*.4+(1-q)*2.2,Math.cos(a)*r-R*.8],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.8,1.6),s*rr(.5,1),s*rr(.8,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.35,.55)));}};
  if(d>0){rubbleRing(bx,0,R*.2,10,60,50,2.5);}}
 // C — column cluster: five slim lobed towers (30–48 m) linked by sky bridges
 {const cx=340;REGISTER({name:'Apartments C — column cluster, large ('+STATE(d)+')',x:cx,z:0,r:60,h:52});const cols=[[0,0,48],[26,10,40],[-22,14,36],[8,-26,44],[-18,-18,30]];
  const cBands=[];   // the balcony rings of all five towers in one mesh
  cols.forEach((c,i)=>{const R=7.5,H=c[2];const cut=d>0&&i===1?H*.5:null;const hole=holeFn(d,730+i,cut,2);
   kput(d>0?'colR':'colW',[cx+c[0],0,c[1]],null,[4,10,4],null);
   mesh(lathe({rFn:()=>R,H:H-10,cut:cut?cut-10:null,jag:cut?2:0,flutes:6,amp:.3,sharp:1,nu:60,nv:24,hole,seed:730+i}),skin,G,cx+c[0],10,c[1]);
   if(d>0)mesh(lathe({rFn:()=>R*.85,H:H-10,cut:cut?cut-10:null,jag:2,nu:24,nv:4,seed:730+i}),MAT.guts,G,cx+c[0],10,c[1]);
   for(let s=0;s*4<(cut||H)-14;s++){const y=10+s*4;cBands.push(lathe({rFn:()=>R*1.08,H:.6,flutes:6,amp:.3,sharp:1,nu:60,nv:1,hole:d>0?(u,v)=>fbm(u*8+s,i,740+s,2)<.22:null}).translate(cx+c[0],y+3.4,c[1]));
    for(let k=0;k<6;k++){const th=k/6*TAU;const u=k/6;if(hole&&hole(u,y-10))continue;const r=R*1.3+.1;civWin(d>0?'winSmD':'winSmI',[cx+c[0]+r*Math.cos(th),y+1.8,c[1]+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,1.6,1],null);}
    if(s%3===0)stripRing(cx+c[0],y+2.3,c[1],R*.85,d,12);}
   if(!cut){kput('slab',[cx+c[0],H+.2,c[1]],null,[R*1.1,.5,R*1.1],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>R*.6*Math.sqrt(clamp(1-Math.pow(y/3,2),0,1)),H:3,nu:20,nv:5}),skin,G,cx+c[0],H+.4,c[1]);}
   else rubbleRing(cx+c[0],0,c[1],9,24,40,2);});
  meshMerged(cBands,skin,G);
  [[0,1,22],[0,2,18],[0,3,26],[2,4,16],[1,3,24]].forEach(b=>{const A=cols[b[0]],B=cols[b[1]];if(b[2]>Math.min(A[2],B[2])-4)return;if(d>0&&b[0]===0&&b[1]===1)return;
   beam(d>0?'strutR':'strutW',[cx+A[0],b[2],A[1]],[cx+B[0],b[2],B[1]],2.4,3);beam('tube',[cx+A[0],b[2]+2,A[1]],[cx+B[0],b[2]+2,B[1]],2,2);});
  kput('slab',[cx,.3,0],null,[44,.6,44],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));if(d>0)scatterMoss(cx,.6,0,0,42,40,1.8);}
 figures(60,40,5,6);figures(300,60,4,5);if(talus)talus();KOFF=[0,0,0];return G;}

