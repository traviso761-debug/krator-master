// ================================================================= SKYSCRAPER H — "the Warden" (Elinhir: blank tapering keep with slits)
// DECAY 4 IS "PROJECT H": rehabilitated and still standing, the same idea as
// Projects A and D. The Warden's whole character is that it has far too few
// openings for its size, so its fire grid is only 20 bays (four flat faces of
// five slits) — and the reoccupation keeps every slit rather than the random
// half the ruin drops, because people living in a building unblock its windows.
// The mask is the shared one (fireMask). Its setback ledges are the best
// "exposed decks" in the kit: four real terraces up the height of the keep.
function buildSkyH(scene,gx,gz,d){reseed(9170+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4;
 const H=330,Y0=8;REGISTER({name:(PROJ?'Project H — the Warden reoccupied whole (rehabilitated)':'Skyscraper H — the Warden ('+(d===2?'toppled':STATE(d))+')'),x:0,z:0,r:120,h:H+30});
 // PLINTH. The keep is half(0)*se(th,7) = 43.5 at its corners and the lowest
 // setback ledge reaches 45. Nothing else stands on the podium. 56 puts
 // skyPlinth's column ring at 52 — outboard of the ledge, half the old 110.
 const PR=56;
 skyPlinth(G,dd,PR);
 const half=y=>{const t=clamp(y/H,0,1);const step=Math.floor(t*5)/5;return 34*(1-.45*step)-2*(t*5-step*5)*.3;};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.7:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.9,87+(upper?1:0),cut!=null?L:null,1.1);
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const groove=Math.abs(Math.sin(2*th))>.995?.9:1;const r=half(y+y0)*se(th,7)*groove;return[r*Math.cos(th),y,r*Math.sin(th)];},128,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){
   // the cut section, as fixed on Skyscraper A: the lining takes the SAME hole
   // predicate as the outer skin (it had none) at a grid fine enough to line up
   // with it, and the plates are pale with a dark soffit under each
   mesh(gridSurface((u,v)=>{const th=u*TAU,y=v*L;const r=half(y+y0)*.86*se(th,7);return[r*Math.cos(th),y,r*Math.sin(th)];},64,Math.max(8,Math.round(L/6)),{hole:hole?(u,v)=>hole(u,v*L):null}),MAT.guts,P);
   for(let y=6;y<L-2;y+=6){const hp=half(y+y0);
    kput('slab',[0,y,0],null,[hp*.9,.6,hp*.9],new THREE.Color(0xbdb7ad));
    kput('slab',[0,y-1.3,0],null,[hp*.87,.7,hp*.87],new THREE.Color(0x191b1f));}}
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
  if(!PROJ)for(let yy=20;yy<L-10;yy+=40)stripRing(0,yy,0,half(yy+y0)*.9,dx,8);
  if(cut==null){const ht=half(H);kput(BOXC(dx),[0,L+1,0],null,[ht*2+3,2,ht*2+3],null);for(let k=0;k<12;k++){const a=k/12*TAU;const r=ht*se(a,7)+.5;kput(BOXC(dx),[r*Math.cos(a),L+4,r*Math.sin(a)],qEuler(0,-a,0),[2.5,5,3],null);}
   mesh(lathe({rFn:y=>ht*.55*(1-.3*y/30)+1.5*clamp((y-24)/6,0,1),H:30,flutes:4,amp:.15,sharp:2,nu:24,nv:10}),CONC(dx),P,0,L+2,0);kput('finial',[0,L+38,0],null,[3,5,3],null);stripRing(0,L+26,0,ht*.45,dx,12);}};
 bodyGroup(G,Y0,d,dd,build,Y0+80,half(Y0+80),PROJ);
 if(dd>0)vinesOnRing(0,Y0+H/5,0,half(H/5)*1.05,20,30);
 if(PROJ){const ht=half(H);
  for(let k=0;k<4;k++)firePit('H',rr(-ht,ht),Y0+(H-Y0)+2.4,rr(-ht,ht),rr(1.6,2.8));   // the crown slab
  for(let k=0;k<8;k++){const a=rng()*TAU,r=rr(40,PR*.9);firePit('H',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.6,3));}}
 figures(-PR,PR*1.28,6,6);KOFF=[0,0,0];return G;}

