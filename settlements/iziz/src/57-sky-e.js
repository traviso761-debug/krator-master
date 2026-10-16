// ================================================================= SKYSCRAPER E — "the Sail" (shaped glass lens, diagrid, twisting)
// NON-GROUND PLACEMENT. gy lifts the whole tower, noPlinth drops the ground
// plinth and apron, and hcut (decay 1) cuts the body at that fraction of H
// instead of 0.8. kput adds all three components of KOFF and bodyGroup already
// routes the instanced pieces through useGroupXF, so lifting both KOFF and the
// group moves merged meshes and instances together. See buildPerch for a
// worked example -- a tower standing on a podium 90 m up.
function buildSkyE(scene,gx,gz,d,gy,noPlinth,hcut){reseed(9140+d);gy=gy||0;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=360,Y0=10;REGISTER({name:'Skyscraper E — the Sail ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:60,h:H+40});
 // PLINTH. The lens is 68 m across its long axis (aF(0)=34) and 26 deep; its
 // concrete edge fins add 3. Nothing else reaches the podium. 105 was a circle
 // three times the width of the building it carried; 48 puts the column ring at
 // 44.6, just outboard of the fins.
 // RESTAND (A-H): 44, ring at 40.9, 3 m clear of the fins' outer faces at the
 // foot (the lens only narrows and turns as it rises). Registered 120 -> 60.
 const PR=44;
 if(!noPlinth)skyPlinth(G,dd,PR);
 const aF=y=>34*(1-.45*Math.pow(clamp(y/H,0,1),1.3)),bF=y=>13*(1-.3*clamp(y/H,0,1)),rot=y=>.8*clamp(y/H,0,1);
 const PT=(u,y,s)=>{const a=aF(y),b=bF(y),r=rot(y);const x=(u-.5)*2*a,z=s*b*(1-Math.pow(u*2-1,2));return[x*Math.cos(r)-z*Math.sin(r),y,x*Math.sin(r)+z*Math.cos(r)];};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.82:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.8,57+(upper?1:0),cut!=null?L:null,1.5);
  for(const s of [-1,1]){if(dx===0)mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0],v*L,p[2]];},40,Math.round(L/6),{}),MAT.glass,P);
   else mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0]*.93,v*L,p[2]*.93];},40,Math.round(L/6),{hole:(u,v)=>hole&&hole(u+s,v*L)}),MAT.guts,P);
   // diagrid mullions
   const step=12;for(let y=0;y<L-1;y+=step){const y2=Math.min(y+step,L);for(let j=0;j<8;j++){const u1=j/8,u2=(j+1)/8;if(dx>0&&hole&&hole((u1+u2)/2+s,y))continue;
    const A=PT(u1,y+y0,s),B=PT(u2,y2+y0,s),C=PT(u2,y+y0,s),D=PT(u1,y2+y0,s);
    beam(dx>0?'strutR':'strutW',[A[0],y,A[2]],[B[0],y2,B[2]],1.1,.9);beam(dx>0?'strutR':'strutW',[C[0],y,C[2]],[D[0],y2,D[2]],1.1,.9);}}}
  // concrete edge fins and floor slabs
  for(let y=0;y<L;y+=8){const y2=Math.min(y+8,L);const A=PT(0,y+y0,1),B=PT(0,y2+y0,1),C=PT(1,y+y0,1),D=PT(1,y2+y0,1);
   beam(BOXC(dx),[A[0],y,A[2]],[B[0],y2,B[2]],3.5,6);beam(BOXC(dx),[C[0],y,C[2]],[D[0],y2,D[2]],3.5,6);}
  for(let y=4;y<L-1;y+=4){const yy=y+y0;if(hole&&rng()<.15*dx)continue;kput('slab',[0,y,0],qEuler(0,-rot(yy),0),[aF(yy)*.95,.35,bF(yy)*.92],new THREE.Color(dx>0?0x2a2c30:0x8a8f98));if(y%24===4)stripRing(0,y+1.5,0,bF(yy)*.6,dx,12);}
  if(cut==null){for(const uu of [0,1]){const A=PT(uu,H,1);beam(BOXC(dx),[A[0],L,A[2]],[A[0]*1.1,L+34,A[2]*1.1],3,5);}
   if(dx===0){mesh(gridSurface((u,v)=>{const p=PT(u,H,1);const q=PT(u,H,-1);const z=lerp(q[2],p[2],v),x=lerp(q[0],p[0],v);return[x,L+.5,z];},20,6,{}),MAT.glass,P);kput('finial',[0,L+36,0],null,[3,6,3],null);}}};
 bodyGroup(G,Y0,d,dd,build,Y0+70,aF(Y0+70));
 if(!noPlinth)figures(-PR,PR*1.28,6,6);
 KOFF=[0,0,0];return G;}

