// ================================================================= GODSTEP — the ground's loose stuff and the pioneers (the passes)
// Each pass walks a lattice of cells over the box; a cell's draws are KRAND.hash(world, cell i, cell j, salt), so a tile built
// alone draws what it draws in a full build (biomes/WORLD.md). Where things lie comes from the host's fields (BIO.host.fields):
// the talus under the risers, the faces, the sand, the cones, the snow, the path. Every pass sets its LOD range (BIO.range).
//   talus     blocks and whole fallen columns on the bench under every riser, big ones rare (a power law), none on a face
//   stones    the plains' stones, sparse, none on the sand or the pan
//   cushions  the lava pioneers' cushions in the joints of the old plains, the lee of blocks; fewer on the younger lobes
//   crusts    crusts and lichens on the old rock and the stable benches
//   moss      moss skins on the cones' north faces (refs/08)
//   cairns    the procession's cairns along its way, every ~110 m (BIO.host.path: the path's points, the host's)
GSTEP.buildGround=function(R,q,box){const K=KRAND,F=BIO.host.fields,H=BIO.host.terrainH,{clamp,smooth,mix,qEuler,TAU}=BIO.fn,P=GSTEP.PAL,W=BIO.host.seed>>>0;
 q=q==null?1:q;box=box||[-R,-R,R,R];const st={talus:0,columns:0,bigBlocks:0,stones:0,cushions:0,crusts:0,moss:0,cairns:0};
 const u=(h,k)=>K.unit(K.hash(h,k));
 const pick=(a,h)=>a[Math.floor(u(h,99)*a.length)%a.length];
 const cells=(c,salt,fn)=>{for(let j=Math.floor(box[1]/c);j<Math.ceil(box[3]/c);j++)for(let i=Math.floor(box[0]/c);i<Math.ceil(box[2]/c);i++)fn(i,j,i*c,j*c,K.hash(W,i,j,salt));};
 const inBox=(x,z)=>x>box[0]+3&&x<box[2]-3&&z>box[1]+3&&z<box[3]-3&&BIO.mask(x,z)>0;
 const bare=(x,z)=>F.snow(x,z)<.6&&F.playa(x,z)<.3&&F.path(x,z)<.5;
 // ---- talus: up to 3 candidates a 20 m cell, kept by the bench's weight; a third of them whole columns lying across the slope
 cells(20,0x7A15,(i,j,x0,z0,h)=>{for(let k=0;k<3;k++){const hk=K.hash(h,k),x=x0+20*u(hk,1),z=z0+20*u(hk,2);if(!inBox(x,z))continue;
   const fc=F.face(x,z),w=F.talus(x,z)*(1-fc)*(1-F.sand(x,z)*.7),r=u(hk,3);if(fc>.4||r>w*.9*q||F.playa(x,z)>.3)continue;
   const y=H(x,z);
   if(u(hk,14)<.33){const L=mix(2.5,9,Math.pow(u(hk,4),1.5)),s=L*.95;BIO.range=L>6?2200:900;
    BIO.put('column',[x,y+s*.12,z],qEuler((u(hk,8)-.5)*.25,u(hk,9)*TAU,(u(hk,10)-.5)*.25),[L,s,s],pick(P.column,hk));st.columns++;st.talus++;continue;}
   const s=.45*Math.pow(1-u(hk,4)*.985,-.6),big=s>2.2;BIO.range=big?2600:900;
   BIO.put('boulder',[x,y+s*.22,z],qEuler((u(hk,8)-.5)*.6,u(hk,9)*TAU,(u(hk,10)-.5)*.6),[s*mix(.8,1.3,u(hk,11)),s*mix(.6,1,u(hk,12)),s*mix(.8,1.3,u(hk,13))],u(hk,6)<.14?pick(P.rind,hk):pick(P.basalt,hk));
   st.talus++;if(big)st.bigBlocks++;}});
 // ---- stones: sparse on the plains and the benches, none on a face, the sand or the pan
 cells(12,0x5704,(i,j,x0,z0,h)=>{const x=x0+12*u(h,1),z=z0+12*u(h,2);if(!inBox(x,z))return;
  const sl=F.slope(x,z);if(F.face(x,z)>.3||!bare(x,z)||u(h,3)>.14*q*smooth(.7,.25,sl)*(1-F.sand(x,z)))return;const s=mix(.12,.5,Math.pow(u(h,4),2));BIO.range=300;
  BIO.put('stone',[x,H(x,z)+s*.2,z],qEuler((u(h,5)-.5)*.4,u(h,6)*TAU,(u(h,7)-.5)*.4),[s,s,s],u(h,8)<.15?pick(P.rind,h):pick(P.basalt,h));st.stones++;});
 if(BIO.items.cushion){
  // ---- cushions: the joints and hollows of the old plains (soil), thinner on the younger lobes, none on sand, snow, faces or the pan
  cells(6,0xC054,(i,j,x0,z0,h)=>{const x=x0+6*u(h,1),z=z0+6*u(h,2);if(!inBox(x,z))return;
   const sl=F.slope(x,z),w=(.35*F.soil(x,z)+.25*F.talus(x,z)+.08)*smooth(.6,.2,sl)*(1-F.sand(x,z))*(1-.6*F.skin(x,z))*(1-F.cone(x,z)*.7);
   if(F.face(x,z)>.25||F.sand(x,z)>.4||!bare(x,z)||u(h,3)>w*.14*q)return;const s=mix(.18,.7,Math.pow(u(h,4),1.6));BIO.range=220;
   BIO.put('cushion',[x,H(x,z)-.02,z],qEuler((u(h,5)-.5)*.2,u(h,6)*TAU,(u(h,7)-.5)*.2),[s,s*mix(.6,1,u(h,8)),s*mix(.8,1.2,u(h,9))],pick(P.cushion,h));st.cushions++;});
  // ---- crusts: on the old rock and the benches (the lichen field), a few on the blocks' benches
  cells(5,0xC2A5,(i,j,x0,z0,h)=>{const x=x0+5*u(h,1),z=z0+5*u(h,2);if(!inBox(x,z))return;
   const sl=F.slope(x,z),w=(.45*F.lichen(x,z)+.12)*smooth(.75,.3,sl)*(1-F.sand(x,z))*(1-F.cone(x,z)*.8);
   if(F.face(x,z)>.35||F.sand(x,z)>.4||!bare(x,z)||u(h,3)>w*.06*q)return;const s=mix(.25,1.1,u(h,4));BIO.range=160;
   BIO.put('crust',[x,H(x,z)+.01,z],qEuler(0,u(h,6)*TAU,0),[s,1,s*mix(.7,1.2,u(h,7))],pick(P.crust,h));st.crusts++;});
  // ---- moss skins on the cones' north faces, bright and close (they read as the ground's paint further off)
  cells(4,0x3055,(i,j,x0,z0,h)=>{const x=x0+4*u(h,1),z=z0+4*u(h,2);if(!inBox(x,z))return;const w=F.moss(x,z);if(u(h,3)>w*.8*q)return;
   const s=mix(.6,2.2,u(h,4));BIO.range=420;BIO.put('mossmat',[x,H(x,z)+.02,z],qEuler(0,u(h,6)*TAU,0),[s,1,s*mix(.7,1.2,u(h,7))],pick(P.moss,h));st.moss++;});}
 // ---- cairns along the procession's way: one every ~110 m of its line, a pace off it (opt.path: the host's points)
 const PP=GSTEP.PATH_PTS||[];let run=0,next=60;
 for(let k=0;k<PP.length-1;k++){const a=PP[k],b=PP[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!(L>0))continue;
  while(next<=run+L){const f=(next-run)/L,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f,h=K.hash(W,k,Math.round(next),0xCA1);const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L,o=2.2*(u(h,1)<.5?-1:1);
   next+=110;const cx=x+nx*o,cz=z+nz*o;if(!inBox(cx,cz)||F.face(cx,cz)>.5)continue;const s=mix(.9,1.4,u(h,2));BIO.range=700;
   BIO.put('cairn',[cx,H(cx,cz)-.05,cz],qEuler(0,u(h,3)*TAU,0),[s,s,s],pick(P.cairn,h));st.cairns++;}
  run+=L;}
 BIO.range=null;return st;};
