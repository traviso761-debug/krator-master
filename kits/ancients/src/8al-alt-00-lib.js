// ================================================================= ALTERNATES — civic group (arco1 / arco2), shared helpers
// From-scratch ALTERNATE versions of the civic building types, drawn from the
// user's arco1 and arco2 reference sets (refs/arco1-*, refs/arco2-*). Each
// builder lives in its own src/8al-alt-*.js fragment and is shown by the
// `alt-civic` dev target; targets/alt-civic/NOTES.md lists the references.
//
// DECAY, as the kit uses it, with level 2 given its own meaning here:
//   0 intact          whole, white metal / clean concrete, lit glass
//   1 ruined          holes, a collapse that changes the silhouette, rubble, moss
//   2 reclaimed       the SAME ruin, re-inhabited: huts on the flat roofs, gardens,
//                     fires behind the openings at night, stalls round the foot
//   3 rehabilitated   ruined materials but no collapse (it was cleared and
//                     patched); the scene loop halves the holes (HOLES) and
//                     runs repairPass() over the group, as for every type
// So a builder asks `fall` (1 or 2) for the collapse and `dd` for materials.
//
// SEEDS. Each builder opens with ONE literal reseed (9905..9917), so intact and
// ruin share their layout draws; every decay-only draw happens after the
// layout, or is a position hash (h3), so a ruin never moves what it ruins.
// 9900..9904 belong to buildGovernment (its seed is 9900 plus the decay).
//
// Everything here is a function declaration prefixed `alt`; kit items are
// defined once, at top level, prefixed `alt`.

// A box whose UVs run in world metres / 8 (the kit's texture tile), so a 60 m
// slab of board-formed concrete is not one stretched board.
function altBoxGeo(sx,sy,sz){const g=new THREE.BoxGeometry(sx,sy,sz),uv=g.attributes.uv;
 const D=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
 for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*D[f][0]/8,uv.getY(k)*D[f][1]/8);}
 return g;}
// Push a box into an accumulator (merged by the caller). Rotations apply z, x, then y.
function altBox(acc,cx,cy,cz,sx,sy,sz,ry,rx,rz){const g=altBoxGeo(sx,sy,sz);
 if(rz)g.rotateZ(rz);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);g.translate(cx,cy,cz);acc.push(g);return g;}
// A vertical prism on a plan polygon pts=[[x,z],...] from y0 to y1, world-metre UVs.
function altPrism(acc,pts,y0,y1){const s=new THREE.Shape();s.moveTo(pts[0][0],-pts[0][1]);
 for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],-pts[i][1]);s.lineTo(pts[0][0],-pts[0][1]);
 const g=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:4});
 g.rotateX(-Math.PI/2);g.translate(0,y0,0);
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);
 acc.push(g);return g;}
// An extruded side profile pts=[[a,y],...] in the plane of `ry` (a runs along x
// before the turn), thickness t centred on the plane. Fins, buttresses, gables.
function altFin(acc,pts,t,cx,cy,cz,ry){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.lineTo(pts[0][0],pts[0][1]);
 const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:6});g.translate(0,0,-t/2);
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);
 if(ry)g.rotateY(ry);g.translate(cx,cy,cz);acc.push(g);return g;}
// A cylinder (open or capped) with metre UVs.
function altCyl(acc,cx,cy,cz,r0,r1,h,n,open){const g=new THREE.CylinderGeometry(r1,r0,h,n||24,1,!!open);
 const uv=g.attributes.uv,L=Math.max(r0,r1)*TAU/8;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L,uv.getY(i)*h/8);
 g.translate(cx,cy+h/2,cz);acc.push(g);return g;}
// A sphere zone (th0..th1 polar from the top), optionally holed: hole(u,v).
function altDome(acc,cx,cy,cz,R,ph0,ph1,sy,hole,nu,nv){const g=gridSurface((u,v)=>{const th=u*TAU,ph=lerp(ph0,ph1,v);
 return[cx+R*Math.sin(ph)*Math.cos(th),cy+R*Math.cos(ph)*(sy||1),cz+R*Math.sin(ph)*Math.sin(th)];},nu||32,nv||10,
 {uS:R*TAU/8,vS:R*(ph1-ph0)/8,hole});acc.push(g);return g;}
// A surface of revolution between two (r,y) points, swept over the azimuth
// range [a0,a1] (radians, default full circle); hole(u,v) drops quads. Annuli
// (y0===y1), cones, drum walls (r0===r1). x = r cos a, z = r sin a.
function altRev(acc,cx,cz,r0,y0,r1,y1,a0,a1,nu,hole){a0=a0||0;a1=a1==null?TAU:a1;
 const g=gridSurface((u,v)=>{const a=lerp(a0,a1,u),r=lerp(r0,r1,v);return[cx+r*Math.cos(a),lerp(y0,y1,v),cz+r*Math.sin(a)];},
  nu||48,1,{uS:Math.max(r0,r1)*(a1-a0)/8,vS:Math.hypot(r1-r0,y1-y0)/8,hole});acc.push(g);return g;}
// Merge an accumulator into one mesh on G (opaque materials only).
function altMerge(acc,mat,G){const m=meshMerged(acc,mat,G);acc.length=0;return m;}
// Run fn on its own PRNG stream and give the builder's stream back untouched,
// so an optional pass (the reclaimed dressing) moves nothing drawn after it.
function altStream(seed,fn){const s0=_seed;reseed(seed);try{fn();}finally{_seed=s0;}}
// A deterministic 0..1 hash of a position: decay choices that must not draw rng().
function altH(x,y,z,s){return h3(x*.137+(s||0)*.71,y*.211+.3,z*.173+.9);}
// A noisy ellipsoid "bite": true where a collapse has taken the fabric away.
function altBite(cx,cy,cz,rx,ry,rz,seed){return(x,y,z)=>{const dx=(x-cx)/rx,dy=(y-cy)/ry,dz=(z-cz)/rz;
 return dx*dx+dy*dy+dz*dz<.75+.5*fbm(x*.05+seed,y*.05,z*.05,2);};}
// A heap of rubble on the ground round (x,z), banked toward its centre.
function altHeap(x,z,r,n,sMax){for(let i=0;i<n;i++){const a=rng()*TAU,q=Math.pow(rng(),1.6),rr0=r*q,s=rr(.5,sMax)*(1.2-.6*q);
 kput('rubble',[x+rr0*Math.cos(a),(1-q)*sMax*.8+s*.3,z+rr0*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),
  [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.08,.3),rr(.32,.55)));}}
// A glazed band on one face of a block: glass by day (lit cells at intervals),
// a dark opening with a few teeth of glass in a ruin. n = outward normal (axis).
function altBand(cx,cy,cz,len,h,n,d,lit){const q=qFacing(n);
 if(d===0){kput('darkPane',[cx+n[0]*.1,cy,cz+n[2]*.1],q,[len,h,1],null);
  if(lit){const k=Math.max(1,Math.round(len/7));for(let i=0;i<k;i++){if(altH(cx+i,cy,cz)>.55)continue;
   const t=(i+.5)/k-.5,tx=-n[2],tz=n[0];kput('cell',[cx+tx*t*len+n[0]*.3,cy,cz+tz*t*len+n[2]*.3],q,[len/k*.8,h*.7,1],(altH(cz,cy,cx+i)<.5?WARM:CYAN));}}}
 else{kput('boxD',[cx-n[0]*.4,cy,cz-n[2]*.4],q,[len,h,1],null);
  const k=Math.max(1,Math.round(len/9));for(let i=0;i<k;i++){const t=(i+.5)/k-.5,tx=-n[2],tz=n[0],p=[cx+tx*t*len+n[0]*.2,cy,cz+tz*t*len+n[2]*.2];
   if(altH(p[0],p[1],p[2])<.35)civShardAt(p,q,Math.min(4,len/k*.6),h*.9,.1,altH(p[2],p[1],p[0]));}}}
// Trees round a site, kept out of a rectangle (the building's footprint).
function altTrees(n,r0,r1,hx,hz){for(let i=0;i<biomeN(n);i++){const a=rng()*TAU,r=rr(r0,r1),x=r*Math.cos(a),z=r*Math.sin(a);
 if(Math.abs(x)<hx&&Math.abs(z)<hz)continue;VEG.tree(x,terrainH(x+KOFF[0],z+KOFF[2]),z,i%3,rr(7,15));}}

// THE RECLAIMED DRESSING (decay 2). A later people living IN the ruin, not
// camping beside it: huts and lean-tos built up on the flat roofs and terraces,
// gardens in planters and on the trays, water butts, washing, fires in the
// openings and on the decks (unlit firelight, shown at night by setNight), a
// ring of market stalls and plots round the foot, and people. Every piece is a
// kit instance. o: {up, side, r (stall ring radius), stalls, plots, people, key}
function altReclaim(G,o){
 const key=o.key||'alt';
 for(const f of upFaces(G,o.up||60,.86)){const p=f.p,r=rng();if(p[1]<1.2)continue;
  if(r<.38){const w=rr(2.6,5.5),hh=rr(2.2,3.4),dp=rr(2.4,4.6),yaw=rng()*TAU;
   kput('shantyBox',[p[0],p[1]+hh/2,p[2]],qEuler(0,yaw,0),[w,hh,dp],null);
   kput('shantyRoof',[p[0],p[1]+hh+.15,p[2]],qEuler(rr(.1,.24),yaw,0),[w*1.25,1,dp*1.3],null);
   if(rng()<.35)kput('dot',[p[0]+Math.cos(yaw)*w*.5,p[1]+hh*.6,p[2]-Math.sin(yaw)*w*.5],qEuler(0,yaw+Math.PI/2,0),[.8,.8,1],WARM);}
  else if(r<.62){const yaw=rng()*TAU;kput('planter',[p[0],p[1]+.3,p[2]],qEuler(0,yaw,0),[rr(2,4.5),.6,rr(1.2,2)],null);
   for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.4,1.4),p[1]+.8,p[2]+rr(-.8,.8)],null,[.8,.55,.8],new THREE.Color().setHSL(rr(.22,.33),.55,rr(.24,.34)));}
  else if(r<.72)kput('waterButt',[p[0],p[1]+1,p[2]],null,[1,2,1],null);
  else if(r<.84){const yaw=rng()*TAU,L=rr(4,8),c=Math.cos(yaw),s=Math.sin(yaw);
   for(const e of[-1,1])kput('postR',[p[0]+c*L/2*e,p[1]+1.2,p[2]-s*L/2*e],null,[.08,2.4,.08],null);
   for(let k=0;k<3;k++)kput('patchTarp',[p[0]+c*(k-1)*L*.28,p[1]+1.6,p[2]-s*(k-1)*L*.28],qEuler(0,yaw,0),[rr(.9,1.6),rr(.9,1.3),1],
    new THREE.Color().setHSL(rng(),rr(.3,.6),rr(.45,.7)));}
  else firePit(key,p[0],p[1],p[2],rr(.6,1.1));}
 for(const f of sideFaces(G,o.side||40)){const n=f.n,p=f.p;if(p[1]<2)continue;const h=Math.hypot(n[0],n[2]);if(h<.5)continue;
  const nn=[n[0]/h,0,n[2]/h],q=qFacing(nn);
  if(rng()<.55)fireWindow([p[0],p[1],p[2]],nn,q,rr(1.4,2.6),rr(1.4,2.2));
  else kput(['patchBoard','patchTarp','patchSheet'][(rng()*3)|0],[p[0]+nn[0]*.3,p[1],p[2]+nn[2]*.3],q.clone().multiply(qEuler(0,0,rr(-.2,.2))),[rr(2,5),rr(1.5,3.5),1],null);}
 // the foot: a ring of stalls, garden plots, people
 const R=o.r||60;
 for(let i=0;i<(o.stalls||10);i++){const a=i/(o.stalls||10)*TAU+rr(-.15,.15),x=R*Math.cos(a)*rr(.95,1.08),z=R*Math.sin(a)*rr(.95,1.08),yaw=-a;
  for(const[ex,ez]of[[-1,-1],[1,-1],[-1,1],[1,1]])kput('postR',[x+Math.cos(yaw)*ex*1.6-Math.sin(yaw)*ez*1.2,1.3,z-Math.sin(yaw)*ex*1.6-Math.cos(yaw)*ez*1.2],null,[.09,2.6,.09],null);
  kput('patchTarp',[x,2.75,z],qEuler(-Math.PI/2+.12,0,0).premultiply(qEuler(0,yaw,0)),[4,3.2,1],new THREE.Color().setHSL(rr(0,.12),rr(.4,.7),rr(.45,.62)));
  kput('planter',[x,.45,z],qEuler(0,yaw,0),[2.6,.9,1],null);
  if(rng()<.5)firePit(key,x+rr(-3,3),.1,z+rr(-3,3),.5);}
 for(let i=0;i<(o.plots||8);i++){const a=rng()*TAU,r=R*rr(1.15,1.5),x=r*Math.cos(a),z=r*Math.sin(a),yaw=rng()*TAU;
  for(let k=0;k<4;k++)kput('hedge',[x+Math.cos(yaw)*(k-1.5)*1.6,.25,z-Math.sin(yaw)*(k-1.5)*1.6],qEuler(0,yaw,0),[.8,.5,rr(5,9)],new THREE.Color().setHSL(rr(.2,.32),.5,rr(.3,.45)));}
 const np=o.people||14;for(let i=0;i<np;i++){const a=rng()*TAU,r=R*rr(.7,1.3);figures(r*Math.cos(a),r*Math.sin(a),1,2);}}
