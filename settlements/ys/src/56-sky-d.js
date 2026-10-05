// ================================================================= SKYSCRAPER D — "the Monolith" (bare concrete, Torre Velasca head)
// DECAY 4 IS "PROJECT D": rehabilitated and still standing, the same idea as
// Project A in src/52-sky-abc.js. The Monolith has no window cells at all — its
// openings are a glazed ribbon in the recess of every twelfth metre — so its
// fire grid is 28 bays x one storey per ribbon, and it burns the RIBBON rather
// than individual panes. The mask itself is the shared one (fireMask).
function buildSkyD(scene,gx,gz,d){reseed(9130+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark();
 const H=340,Y0=14;REGISTER({name:(PROJ?'Project D — the Monolith reoccupied whole (rehabilitated)':'Skyscraper D — the Monolith ('+(d===2?'toppled':STATE(d))+')'),x:0,z:0,r:60,h:H+20});
 // PLINTH. Nothing at all stands on this podium except the tower: the shell at
 // its foot is rFn(14)*se(th,3.2) = 34 m at the corners of the superellipse and
 // the lift-core spine reaches 32. 110 was more than three times the building.
 // 48 puts skyPlinth's column ring at 44.6, clear of both.
 // RESTAND (A-H): 44, ring at 40.9 — 6 m outboard of the corners, which is
 // as close as the 1.8 m columns should stand to a 340 m wall. The Velasca
 // head reaches 41.7 at its corners 300 m up, so the podium now matches the
 // widest thing above it. Registered radius 120 -> 60 (the head, plus margin).
 const PR=44;
 skyPlinth(G,dd,PR);
 const rFn=y=>{const t=clamp(y/H,0,1);return 30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.76:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx,47+(upper?1:0),cut!=null?L:null,1.2);if(d===1&&!upper)hole=skyScarHole(hole,.3,.13,L*.38,L,47);hole=ysWallHole(hole,y0);   // YS: a way-in pod's hole (52-sky-abc)   // the collapse scar (52-sky-abc.js)
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const fy=((y+y0)%12)/12;const rec=fy>.62&&fy<.92?.94:1;const r=rFn(y+y0)*se(th,3.2)*rec;return[r*Math.cos(th),y,r*Math.sin(th)];},96,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){
   // the cut section, as fixed on Skyscraper A: the lining takes the SAME hole
   // predicate as the outer skin (it had none, so it stood behind every tear
   // and hid the floors) at a grid fine enough to line up with it, and the
   // plates are pale with a dark soffit instead of dark on dark
   mesh(lathe({rFn:y=>rFn(y+y0)*.86,H:H-y0,cut:cut!=null?L:null,jag:6,nu:64,nv:Math.max(8,Math.round(L/6)),hole,seed:47}),MAT.guts,P);
   for(let y=6;y<L-2;y+=6){const rp=rFn(y+y0);
    kput('slab',[0,y,0],null,[rp*.9,.6,rp*.9],new THREE.Color(0xbdb7ad));
    kput('slab',[0,y-1.3,0],null,[rp*.87,.7,rp*.87],new THREE.Color(0x191b1f));}
   skyRooms({rFn:y=>rFn(y+y0)*.84,y0:6,y1:L-2,step:6,soff:1.3,hole,d,seed:47});}   // interiors behind the openings (52-sky-abc.js)
  const NB=28,burns=PROJ?fireMask('D',NB,Math.ceil(L/12),9134,9):null;
  const dRib=[];   // the ruined ribbons merge; the intact ones are glass, which does not
  for(let y=12-((y0)%12);y<L-4;y+=12){const yy=y+y0;const r0=rFn(yy)*.95; // glass ribbon in each recess
   if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2);return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{}),MAT.glass,P);
   else dRib.push(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2)*.98;return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{hole:(u,v)=>hole&&hole(u,y)}));
   if(PROJ){const sy=Math.round(y/12);
    for(let k=0;k<NB;k++){const u=(k+.5)/NB,th=u*TAU;if(hole&&hole(u,y))continue;
     if(!burns(k,sy))continue;
     const r=r0*se(th,3.2)+.15,nrm=[Math.cos(th),0,Math.sin(th)];
     fireWindow([r*Math.cos(th),y+9.2,r*Math.sin(th)],nrm,qFacing(nrm),TAU*r/NB*.8,3.2);}}
   else if(((yy/12)|0)%3===0&&!(d===1&&!upper&&y>L*.38))stripRing(0,y+9,0,r0*.9,dx,28);}
  meshMerged(dRib,MAT.dark,P);
  // the floors behind the ribbon burn too, so the fire shows through the tears
  if(PROJ)for(let y=12,sy=1;y<L-8;y+=12,sy++){if(!burns.raw((sy*5)%NB,sy))continue;if(rng()<.45)continue;
   const th=((sy*5)+.5)/NB*TAU+rr(-.1,.1),r=rFn(y+y0)*se(th,3.2)*rr(.35,.7);
   firePit('D',r*Math.cos(th),Math.floor((y+6)/6)*6+.6,r*Math.sin(th),rr(1.6,3));}
  // lift-core spine on +x, Velasca props under the head
  kput(BOXC(dx),[rFn(y0+L*.5)*.9+2.5,L/2,0],null,[5,L,9],null);
  if(cut==null){const yh=H*.84-y0;for(let k=0;k<16;k++){const th=(k+.5)/16*TAU;const r1=rFn(H*.8)*se(th,3.2),r2=rFn(H*.9)*se(th,3.2)*1.02;
    beam(dx>0?'strutR':'strutW',[Math.cos(th)*r1*.98,yh-14,Math.sin(th)*r1*.98],[Math.cos(th)*r2,yh+8,Math.sin(th)*r2],2.4,2);}
   mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(rFn(H)+1.2)*se(th,3.2)*(1-v*.02);return[r*Math.cos(th),L+v*4,r*Math.sin(th)];},96,1,{uS:16}),CONC(dx),P);
   kput(BOXC(dx),[0,L+2,0],null,[rFn(H)*1.9,.8,rFn(H)*1.9],null);
   for(let k=0;k<6;k++){const a=k/6*TAU;kput(BOXC(dx),[Math.cos(a)*14,L+7,Math.sin(a)*14],qEuler(0,-a,0),[3,10,8],null);}
   if(dx===0)mesh(lathe({rFn:y=>9*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:6}),MAT.glass,P,0,L+4,0);}};
 bodyGroup(G,Y0,d,dd,build,Y0+60,rFn(Y0+60),PROJ);
 if(dd>0)vinesOnRing(0,Y0+12,0,rFn(Y0)*1.0,30,20);
 // Project D's exposed decks: the Velasca head's cap slab at the top, which is
 // the one floor on this building open to the sky, and the podium.
 if(PROJ){const hy=Y0+(H-Y0)+2.6;
  for(let k=0;k<6;k++){const a=rng()*TAU,r=rFn(H)*rr(.25,1.5);firePit('D',r*Math.cos(a),hy,r*Math.sin(a),rr(1.8,3.4));}
  for(let k=0;k<8;k++){const a=rng()*TAU,r=rr(36.5,PR*.92);firePit('D',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.6,3));}}
 if(d===3)skyHoist((y,a)=>rFn(y)*se(a,3.2),H-4,5,9130);
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,6,6);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}

