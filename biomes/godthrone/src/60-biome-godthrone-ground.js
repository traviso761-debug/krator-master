// ================================================================= GODTHRONE — the ground's loose stuff (the passes)
// Each pass walks a lattice of cells over the box; a cell's draws are KRAND.hash(world, cell i, cell j, index, salt), so a
// tile built alone draws what it draws in a full build (biomes/WORLD.md). Where things lie comes from the host's fields
// (BIO.host.fields): the talus at the scarps' feet, the rampart round the vent, the hollows, the halo. Every pass sets its
// LOD range (BIO.range): the big blocks read across the caldera, the stones and the hair only near.
//   talus    blocks under every scarp, big ones rare (a power law), thickest at the foot, none on a face
//   bombs    spatter bombs round the vent's cones (thinning outward, the biggest nearest) and spatter on the rampart
//   stones   the floor's and the benches' stones, sparse
//   hair     Pele's hair in mats in the hollows near the vent, where the thin wind dropped it
GODT.buildGround=function(R,q,box){const K=KRAND,F=BIO.host.fields,H=BIO.host.terrainH,{clamp,smooth,mix,qEuler,TAU}=BIO.fn,P=GODT.PAL,W=BIO.host.seed>>>0;
 q=q==null?1:q;box=box||[-R,-R,R,R];const st={talus:0,bigBlocks:0,bombs:0,splats:0,stones:0,hair:0};
 const u=(h,k)=>K.unit(K.hash(h,k));
 const pick=(a,h)=>a[Math.floor(u(h,99)*a.length)%a.length];
 // walk the cells of size c over the box: fn(i, j, x0, z0, hash of the cell)
 const cells=(c,salt,fn)=>{for(let j=Math.floor(box[1]/c);j<Math.ceil(box[3]/c);j++)for(let i=Math.floor(box[0]/c);i<Math.ceil(box[2]/c);i++)fn(i,j,i*c,j*c,K.hash(W,i,j,salt));};
 const inBox=(x,z)=>x>box[0]+3&&x<box[2]-3&&z>box[1]+3&&z<box[3]-3&&BIO.mask(x,z)>0;
 // ---- talus: up to 3 candidates a 24 m cell, kept by the apron's weight; size by a power law (blocks to 9 m)
 cells(24,0x7A15,(i,j,x0,z0,h)=>{for(let k=0;k<3;k++){const hk=K.hash(h,k),x=x0+24*u(hk,1),z=z0+24*u(hk,2);if(!inBox(x,z))continue;
   const fc=F.face(x,z),w=F.talus(x,z)*(1-fc),r=u(hk,3);if(fc>.45||r>w*.9*q)continue;
   const s=.5*Math.pow(1-u(hk,4)*.985,-.62),big=s>2.2;BIO.range=big?3200:1100;
   const y=H(x,z),c=F.breccia&&F.breccia(x,z)>.3?pick(P.breccia,hk):u(hk,6)<.12?pick(P.oxid,hk):u(hk,7)<.3?pick(P.rubble,hk):pick(P.basalt,hk);
   BIO.put('boulder',[x,y+s*.22,z],qEuler((u(hk,8)-.5)*.6,u(hk,9)*TAU,(u(hk,10)-.5)*.6),[s*mix(.8,1.3,u(hk,11)),s*mix(.6,1,u(hk,12)),s*mix(.8,1.3,u(hk,13))],c);
   st.talus++;if(big)st.bigBlocks++;}});
 // ---- bombs round the cones (within ~650 m of each), the biggest nearest; spatter clots on the rampart and the cones
 cells(8,0xB0B5,(i,j,x0,z0,h)=>{const x=x0+8*u(h,1),z=z0+8*u(h,2);if(!inBox(x,z))return;
  const v=F.vent(x,z),ra=F.rampart(x,z),sl=F.slope(x,z);
  if(u(h,3)<v*v*.55*q&&sl<1.1){const s=mix(.25,.7,u(h,4))*(1+2.2*v*v*u(h,5));BIO.range=s>1.2?1500:650;
   BIO.put('bomb',[x,H(x,z)+s*.18,z],qEuler((u(h,6)-.5)*.5,u(h,7)*TAU,(u(h,8)-.5)*.5),[s,s*.75,s*.8],pick(P.bomb,h));st.bombs++;}
  if(u(h,9)<ra*.5*q&&sl<1.3){const s=mix(.4,1.4,u(h,10));BIO.range=600;
   BIO.put('splat',[x,H(x,z)+s*.05,z],qEuler((u(h,11)-.5)*.3,u(h,12)*TAU,(u(h,13)-.5)*.3),[s*1.3,s,s*1.1],u(h,14)<.4?pick(P.oxid,h):pick(P.bomb,h));st.splats++;}});
 // ---- stones: sparse on the floor and the benches, none on the faces
 cells(14,0x5704,(i,j,x0,z0,h)=>{const x=x0+14*u(h,1),z=z0+14*u(h,2);if(!inBox(x,z))return;
  const sl=F.slope(x,z);if(F.face(x,z)>.3||u(h,3)>.32*q*smooth(.7,.25,sl))return;if(F.ice(x,z)>.3||F.snow(x,z)>.6)return;   /* none on the ice or under the snow */const s=mix(.12,.55,Math.pow(u(h,4),2));BIO.range=320;
  BIO.put('stone',[x,H(x,z)+s*.2,z],qEuler((u(h,5)-.5)*.4,u(h,6)*TAU,(u(h,7)-.5)*.4),[s,s,s],u(h,8)<.25?pick(P.rubble,h):pick(P.basalt,h));st.stones++;});
 // ---- Pele's hair: mats in the hollows within ~3 km of the vent, more the nearer; tufts on the cones' lee
 const V=GODT.VENT_AT||[0,0];
 cells(5,0x4A1E,(i,j,x0,z0,h)=>{const x=x0+5*u(h,1),z=z0+5*u(h,2);if(!inBox(x,z))return;
  const dV=Math.hypot(x-V[0],z-V[1]),w=F.hollow(x,z)*smooth(3200,250,dV)*smooth(.6,.2,F.slope(x,z))*(F.face(x,z)>.3?0:1);if(u(h,3)>w*.5*q)return;
  const s=mix(.35,1.3,u(h,4));BIO.range=360;
  BIO.put('hair',[x,H(x,z)+.03,z],qEuler((u(h,5)-.5)*.12,u(h,6)*TAU,(u(h,7)-.5)*.12),[s,s*.6,s],pick(P.hair,h));st.hair++;});
 // ---- split stones and their endolith band: below ~9 km (the endoliths' reach), on the stony ground near the palagonite and the
 // talus, where frost splits the glassy stones; the band a plate on the break, turned with the stone (PLAN.md section 5)
 if(F.palag||F.crust)cells(16,0x5E1D,(i,j,x0,z0,h)=>{const x=x0+16*u(h,1),z=z0+16*u(h,2);if(!inBox(x,z))return;
  const y=H(x,z);if(y>9000||F.face(x,z)>.3||F.slope(x,z)>.9)return;
  const w=Math.max(F.crust?F.crust(x,z):0,F.palag?F.palag(x,z)*.6:0,F.talus(x,z)*.5)*smooth(9000,8600,y);if(u(h,3)>w*.4*q)return;
  const s=mix(.35,1.1,u(h,4)),yaw=u(h,5)*TAU,c=Math.cos(yaw),sn=Math.sin(yaw);BIO.range=260;
  const r=qEuler(0,yaw,0);BIO.put('splitstone',[x,y+s*.25,z],r,[s,s,s],pick(P.basalt,h));
  BIO.put('endolith',[x+c*s*.05,y+s*.25,z-sn*s*.05],r,[s,s*.5,s*.55],pick(P.endo,h));st.split=(st.split||0)+1;});
 // ---- ventifacts on the pavement (the airless rim): sparse, each keeled across the wind, the regolith's stones between them
 if(F.pave)cells(12,0x7E17,(i,j,x0,z0,h)=>{const x=x0+12*u(h,1),z=z0+12*u(h,2);if(!inBox(x,z))return;const w=F.pave(x,z)*smooth(.6,.25,F.slope(x,z));if(u(h,3)>w*.12*q)return;
  const s=mix(.25,.9,Math.pow(u(h,4),1.5));BIO.range=300;BIO.put('ventifact',[x,H(x,z)+s*.12,z],qEuler(0,.6+(u(h,5)-.5)*.5,0),[s*1.2,s,s*.9],pick(F.breccia&&F.breccia(x,z)>.3?P.breccia:P.basalt,h));st.ventifacts=(st.ventifacts||0)+1;});
 BIO.range=null;return st;};
