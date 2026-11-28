// ================================================================= HOST — the hot door's works: the door walls, the pipes, the plant, the cleft shrine, the spalls
// PLAN.md section 5, station 4. The two door walls (a bulkhead of the lining's section, 1.2 m thick, with its openings, their leaves, bronze frames,
// the warning band over the leaves); the two heat exchanger pipes from the plant's hall through its doorway, south along the east wall and through
// both door walls (flanges every 12 m, brackets to the wall); the plant's hall (a floor deck, three generators on their rare-earth magnet rings,
// the cooling banks and their fans, the power cells on charge in racks, red cloth bound on the generators: the rite); the cleft shrine (its rail,
// candles, the quartz points lining the pocket); the spalled slabs on the floor past the inner door.
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,PROF=LK.profileOf(SEC,36),T=LINE.T;
 const C={wall:rg(0x9a968c),wallD:rg(0x7a766e),leaf:rg(0x6a6e70),leafD:rg(0x4e5254),bronze:rg(0x8a6a3c),band:rg(0xd9a12c),bandD:rg(0x2a2826),pipe:rg(0x8a8478),flange:rg(0x5e5850),
  deck:rg(0x7e7a72),gen:rg(0x5a6266),mag:rg(0x8a5a3c),plinth:rg(0x8e8a82),fin:rg(0x8c9094),fan:rg(0x3a3e40),cell:rg(0x4a5a52),amber:rg(0xffb060),green:rg(0x7dffa8),cloth:rg(0x9a2e24),
  post:rg(0x3a3e3c),candle:rg(0xffd8a0),wax:rg(0xe8dcc0),qSmoke:rg(0x6e665c),qClear:rg(0xd8d6cc),slab:rg(0x8e8a80)};
 const u=(a,b,c)=>KRAND.unit(KRAND.hash(SITE.world,a,b,c));
 /* a prism along z (a pipe, a generator) or along x, n sides, its ends capped when asked */
 const ring=(cx,cy,r,n)=>{const P=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return P;};
 const prismZ=(f,cx,cy,r,z0,z1,col,n,caps)=>{const P=ring(cx,cy,r,n||10);for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];B.quad(f,[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1],col);}
  if(caps){B.polyZ(f,z0,P,[],col);B.polyZ(f,z1,P,[],col);}};
 const prismX=(f,cy,cz,r,x0,x1,col,n)=>{const P=ring(cz,cy,r,n||10);for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];B.quad(f,[x0,a[1],a[0]],[x0,b[1],b[0]],[x1,b[1],b[0]],[x1,a[1],a[0]],col);}};
 /* THE DOOR WALLS: both faces (the section with its holes), the jambs through the thickness, the leaves, the frames, the warning band */
 const outer=PROF.map(p=>[p[0],p[1]]);
 LINE.doors.forEach(D=>{const holes=D.leaves.map(L=>[[L.x0,L.y0],[L.x1,L.y0],[L.x1,L.y1],[L.x0,L.y1]]).concat(LINE.pipes.map(p=>ring(p.x,p.y,p.r+.04,10)));
  for(const z of [D.z,D.z+T]){try{B.polyZ('lining',z,outer,holes,C.wall);}catch(e){reportErr('door wall '+D.id+': '+e.message);}}
  D.leaves.forEach(L=>{B.quad('lining',[L.x0,L.y0,D.z],[L.x0,L.y0,D.z+T],[L.x0,L.y1,D.z+T],[L.x0,L.y1,D.z],C.wallD);B.quad('lining',[L.x1,L.y0,D.z+T],[L.x1,L.y0,D.z],[L.x1,L.y1,D.z],[L.x1,L.y1,D.z+T],C.wallD);
   B.quad('lining',[L.x0,L.y1,D.z],[L.x0,L.y1,D.z+T],[L.x1,L.y1,D.z+T],[L.x1,L.y1,D.z],C.wallD);
   for(const z of [D.z-.05,D.z+T]){B.box('bronze',L.x0-.18,L.x0,L.y0,L.y1+.18,z,z+.05,C.bronze);B.box('bronze',L.x1,L.x1+.18,L.y0,L.y1+.18,z,z+.05,C.bronze);B.box('bronze',L.x0-.18,L.x1+.18,L.y1,L.y1+.18,z,z+.05,C.bronze);}
   if(L.state!=='shut')return;const zc=D.z+T/2;
   if(L.kind==='train'){const xm=(L.x0+L.x1)/2;B.box('metal',L.x0+.02,xm-.01,L.y0,L.y1-.02,zc-.14,zc+.14,C.leaf);B.box('metal',xm+.01,L.x1-.02,L.y0,L.y1-.02,zc-.14,zc+.14,C.leaf);
    for(let y=L.y0+.8;y<L.y1;y+=1.2)B.box('metal',L.x0+.1,L.x1-.1,y,y+.08,zc-.18,zc+.18,C.leafD);}
   else if(L.kind==='walk'){B.box('metal',L.x0+.02,L.x1-.02,L.y0,L.y1-.02,zc-.1,zc+.1,C.leaf);for(const z of [zc-.16,zc+.12])B.box('metal',(L.x0+L.x1)/2-.22,(L.x0+L.x1)/2+.22,(L.y0+L.y1)/2-.22,(L.y0+L.y1)/2+.22,z,z+.04,C.bronze);}
   else{B.box('metal',L.x0+.02,L.x1-.02,L.y0,L.y1-.02,zc-.12,zc+.12,C.leaf);for(let x=L.x0+.3;x<L.x1-.2;x+=.9)B.box('paint',x,x+.45,L.y0+.2,L.y0+.6,zc-.16,zc+.16,C.band);}});
  /* the warning band over the leaves, on the face toward the kept side (north) */
  for(let x=SEC.x0+.3,k=0;x<SEC.x1-.6;x+=.6,k++)B.box('paint',x,x+.6,6.0,6.5,D.z-.03,D.z,k%2?C.band:C.bandD);});
 /* THE PIPES: from the plant's hall across its doorway, then south along the east wall through both door walls into the hot rock */
 LINE.pipes.forEach(p=>{prismX('metal',p.y,p.z0,p.r,p.x-p.r,p.from,C.pipe);B.box('metal',p.x-p.r-.08,p.x+p.r+.08,p.y-p.r-.08,p.y+p.r+.08,p.z0-p.r-.08,p.z0+p.r+.08,C.flange);
  for(let z=p.z0;z<p.z1-1e-6;z+=50)prismZ('metal',p.x,p.y,p.r,z,Math.min(p.z1,z+50),C.pipe,10);
  for(let z=p.z0+12;z<p.z1;z+=12){if(LINE.doors.some(D=>z>D.z-1&&z<D.z+T+1))continue;B.box('metal',p.x-p.r-.07,p.x+p.r+.07,p.y-p.r-.07,p.y+p.r+.07,z-.1,z+.1,C.flange);
   if(z%24<12)B.box('metal',p.x,SEC.x1,p.y-.06,p.y+.06,z-.06,z+.06,C.post);}});
 /* THE PLANT'S HALL: its deck, the generators, the cooling banks and fans, the cells on charge, the rite's red cloth, its amber lamps */
 {const Pl=LINE.plant,y=Pl.y;B.box('conc',Pl.x0+2,Pl.x1,y-.4,y,Pl.z0,Pl.z1,C.deck);
  Pl.gens.forEach((g,k)=>{B.box('conc',g.x-3,g.x+3,y,y+.6,g.z-8,g.z+8,C.plinth);prismZ('metal',g.x,y+3.1,2.4,g.z-7,g.z+7,C.gen,14,true);
   for(let z=g.z-6;z<=g.z+6;z+=2)prismZ('bronze',g.x,y+3.1,2.56,z-.2,z+.2,C.mag,14,false);
   prismZ('metal',g.x,y+3.1,.6,g.z+7,g.z+9,C.leafD,8,true);
   for(const dz of [-2.9,2.9])prismZ('paint',g.x,y+3.1,2.64,g.z+dz-.3,g.z+dz+.3,C.cloth,14,false);});
  Pl.banks.forEach(bk=>{for(let x=bk.x0;x<bk.x1;x+=.35)B.box('metal',x,x+.06,y,y+5,bk.z0,bk.z1,C.fin);B.box('metal',bk.x0-.2,bk.x1+.2,y+5,y+5.3,bk.z0-.2,bk.z1+.2,C.leafD);
   for(let z=bk.z0+3;z<bk.z1;z+=6){const P=ring((bk.x0+bk.x1)/2,z,1.4,12);for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];B.quad('metal',[a[0],y+5.3,a[1]],[b[0],y+5.3,b[1]],[b[0],y+6.1,b[1]],[a[0],y+6.1,a[1]],C.fan);}}});
  {const c=Pl.cells;let k=0;for(let z=c.z0;z<c.z1-.5;z+=1.0)for(let lv=0;lv<3;lv++,k++){const yy=y+.2+lv*1.5;B.box('metal',c.x0,c.x1,yy,yy+1.1,z,z+.8,C.cell);B.box('glow',c.x0+.2,c.x0+.5,yy+1.1,yy+1.14,z+.3,z+.5,k%3?C.amber:C.green);}
   B.box('metal',c.x0-.1,c.x1+.1,y,y+4.8,c.z0-.3,c.z0-.2,C.post);B.box('metal',c.x0-.1,c.x1+.1,y,y+4.8,c.z1-.2,c.z1-.1,C.post);}
  for(const [x,z] of [[Pl.x0+2.6,140],[Pl.x0+2.6,215],[Pl.x1-.6,160],[Pl.x1-.6,230]])B.box('glow',x-.15,x+.15,y+5.6,y+5.9,z-.25,z+.25,C.amber);}
 /* THE CLEFT SHRINE: the rail across its slot, candles on the slot's floor, the quartz points lining the pocket (each pointing inward) */
 {const Cl=LINE.cleft,y=Cl.c[1];B.box('metal',-21.35,-21.05,y,y+1.05,79.2,79.36,C.post);B.box('metal',-21.35,-21.05,y,y+1.05,80.64,80.8,C.post);B.box('metal',-21.32,-21.08,y+.95,y+1.03,79.2,80.8,C.bronze);
  for(let i=0;i<9;i++){const x=-22.2-u(i,71,1)*3.4,z=79.5+u(i,71,2)*1.0,h=.12+.2*u(i,71,3);B.box('white',x-.04,x+.04,y,y+h,z-.04,z+.04,C.wax);B.box('glow',x-.02,x+.02,y+h,y+h+.05,z-.02,z+.02,C.candle);}
  const cx=Cl.c[0],cy=y+Cl.h*.42,cz=Cl.z;
  for(let i=0;i<120;i++){const th=u(i,72,1)*Math.PI*2,ph=Math.acos(1-1.8*u(i,72,2)),dx=Math.sin(ph)*Math.cos(th),dy=Math.cos(ph),dz=Math.sin(ph)*Math.sin(th);
   const px=cx+dx*Cl.rx*.9,py=cy+dy*Cl.h*.5,pz=cz+dz*Cl.rz*.9;if(py<y+.15||px>-21.6)continue;
   const len=.18+.55*u(i,72,3)*u(i,72,3),r=.04+.08*u(i,72,4),n=[-dx,-dy,-dz],a=Math.abs(n[1])<.9?[0,1,0]:[1,0,0];
   let e1=[n[1]*a[2]-n[2]*a[1],n[2]*a[0]-n[0]*a[2],n[0]*a[1]-n[1]*a[0]];const l1=Math.hypot(...e1);e1=e1.map(v=>v/l1);const e2=[n[1]*e1[2]-n[2]*e1[1],n[2]*e1[0]-n[0]*e1[2],n[0]*e1[1]-n[1]*e1[0]];
   const col=u(i,72,5)<.7?C.qSmoke:C.qClear,tip=[px+n[0]*len,py+n[1]*len,pz+n[2]*len],sh=len*.65,base=[];
   for(let k=0;k<6;k++){const t=k/6*Math.PI*2,cc=Math.cos(t)*r,ss=Math.sin(t)*r;base.push([px+e1[0]*cc+e2[0]*ss,py+e1[1]*cc+e2[1]*ss,pz+e1[2]*cc+e2[2]*ss]);}
   const top=base.map(b=>[b[0]+n[0]*sh,b[1]+n[1]*sh,b[2]+n[2]*sh]);
   for(let k=0;k<6;k++){const k2=(k+1)%6;B.quad('glass',base[k],base[k2],top[k2],top[k],col);B.tri('glass',top[k],top[k2],tip,col,[0,0],[1,0],[.5,1]);}}}
 /* THE CROSSING: plates between the beams at their tops, the ramp off the walkway, the stile over the barrier */
 {const X=LINE.crossing,xs=SEC.tracks.map(t=>t.x).sort((a,b)=>a-b),gw=SEC.guide.w/2,plate=rg(0x5e5446),edges=[-12.2].concat(...xs.map(x=>[x-gw,x+gw]),[12.0]);
  for(let i=0;i+1<edges.length;i+=2)B.box('paint',edges[i],edges[i+1],X.y-.06,X.y,X.z0,X.z1,plate);
  const zm=(X.z0+X.z1)/2,hw=(X.z1-X.z0)/2;B.quad('paint',[SEC.walk.x0+.3,SEC.walk.y,zm-hw],[SEC.walk.x0+.3,SEC.walk.y,zm+hw],[12.0,X.y,zm+hw],[12.0,X.y,zm-hw],plate);
  B.box('paint',-12.75,-12.2,0,.85,X.z0,X.z1,plate);B.box('paint',-13.3,-12.65,SEC.road.y+SEC.road.barrierH-.04,SEC.road.y+SEC.road.barrierH+.02,X.z0,X.z1,plate);B.box('paint',-13.8,-13.25,0,.75,X.z0,X.z1,plate);B.box('paint',-14.35,-13.8,0,.45,X.z0,X.z1,plate);}
 /* THE SPALLS: each fallen vault segment's slab on the floor below it, off the guideways */
 LINE.spallPts.forEach((p,k)=>{let x=p[0];SEC.tracks.forEach(t=>{if(Math.abs(x-t.x)<2.4)x=t.x+(x<t.x?-2.6:2.6);});const fy=LINE.floorAt(x,p[2]),a=u(k,73,1)*3;
  const w=.7+.8*u(k,73,2),l=.9+.8*u(k,73,3),ca=Math.cos(a),sa=Math.sin(a),P=(dx,dz,dy)=>[x+dx*ca-dz*sa,fy+.05+dy,p[2]+dx*sa+dz*ca];
  B.quad('rubble',P(-w/2,-l/2,0),P(-w/2,l/2,.25),P(w/2,l/2,.25),P(w/2,-l/2,0),C.slab);B.box('rubble',x-.25,x+.2,fy,fy+.2,p[2]+l*.6,p[2]+l*.6+.4,C.slab);});
 const g=B.finish('the hot door\'s works',{label:{lining:'The door walls (bulkheads of the lining\'s section)',metal:'Steel: the leaves, the pipes, the generators, the cooling banks, the cells',bronze:'Bronze: the frames, the magnet rings, the shrine\'s rail',
  paint:'Paint: the warning bands, the rite\'s red cloth',conc:'The plant\'s deck and plinths',glow:'Lamps: the cells on charge, the plant\'s amber, the shrine\'s candles',white:'Candles',glass:'Quartz points lining the cleft',rubble:'Spalled slabs of the lining'}});
 scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=LINE.doors.flatMap(D=>[0,3,D.z+T/2]).concat([30,LINE.plant.y+3,175,LINE.cleft.c[0],LINE.cleft.c[1]+1,LINE.cleft.z],...LINE.pipes.map(p=>[p.x,p.y,(p.z0+p.z1)/2]));
 return {group:g,tris:B.tris};})();
