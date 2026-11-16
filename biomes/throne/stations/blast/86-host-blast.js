// ================================================================= HOST — the blast's dead forest (station 13, the blast zone)
// The zones the blast field sets (47), each drawn from records the host lays first, in the kit's registry and its bark buckets (bark0 charred,
// bark1 charcoal: the library's bark.lava.charred and bark.lava.charcoal):
//   (the silver ones in the silver bucket: the library's wood.silver)
//   THE BLOWDOWN   every log laid along the blast (BLAST.dir, its tip away from the scar, a little scatter), on the ground at both ends:
//                  BLAST.logs, placed records {x, z, y, yaw, len, r, zone}; a root plate torn up at the butt of the bigger ones
//   REMOVAL        stumps snapped off a metre or two up, their tops splintered
//   SEARED         trees still standing, dead: bare trunks with a few stubs of limb, the bark scorched on the side facing the scar
//   DIRECT         nothing standing: bare ash and pumice blocks
// The living forest past the seared edge is the kit's own (the cold belt's conifers and gill-corals, cbelt: 89z).
const DEAD={logs:0,stumps:0,snags:0,blocks:0,scrub:0};
(function(){reseed(13801);const C3=c=>new THREE.Color(c),prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/trees';
 const greys=[0x4a4440,0x3c3734,0x58524c,0x6a625a],silver=[0x8a8680,0x9a958c,0x7a766e];
 // the blowdown: logs every ~9 m where the field says so, laid along the blast
 BIO.grid(9,0,TERR.R-150,(x,z)=>FIELD.blowdown(x,z)*.75+FIELD.removal(x,z)*.2,(x,y,z)=>{if(FIELD.blowdown(x,z)+FIELD.removal(x,z)<.08)return;   /* a log only inside its zones */
   const d=BLAST.dir(x,z),yaw=Math.atan2(d[1],d[0])+rr(-.18,.18),len=rr(12,28),r=rr(.18,.38),sv=rng()<.6;
   const ux=Math.cos(yaw),uz=Math.sin(yaw),bx=x-ux*len*.3,bz=z-uz*len*.3,tx=x+ux*len*.7,tz=z+uz*len*.7,by=terrainH(bx,bz)+r*.85,ty=terrainH(tx,tz)+r*.4,col=C3(pick(sv?silver:greys));
   BLAST.logs.push({x,z,y,yaw,len,r,zone:FIELD.blowdown(x,z)>.5?'blowdown':'removal'});
   DEAD.logs+=BIO.tube(sv&&THRONE.LIB.silver?'silver':'bark1',[{x:bx,y:by,z:bz,r},{x:(bx+tx)/2,y:(by+ty)/2+r*.1,z:(bz+tz)/2,r:r*.8},{x:tx,y:ty,z:tz,r:r*.45}],col,{seg:6,cap:true})?1:0;
   if(r>.3&&rng()<.35){const s=r*rr(5,7);BIO.put('boulder',[bx-ux*r*1.2,terrainH(bx,bz)+s*.25,bz-uz*r*1.2],qEuler(rr(-.3,.3),yaw,Math.PI/2+rr(-.2,.2)),[s,s*.35,s],C3(0x4a3e32));}},   /* the torn root plate, its soil */
  {patch:.4,patchScale:.008,pad:1.5});
 // the removal zone's stumps
 BIO.grid(12,0,TERR.R-150,(x,z)=>FIELD.removal(x,z)*.5,(x,y,z)=>{const r=rr(.2,.4),h=rr(.6,2.2),col=C3(pick(greys));
   BIO.tube('bark0',[{x,y:y-.3,z,r:r*1.15},{x,y:y+h*.7,z,r},{x:x+rr(-.1,.1),y:y+h,z:z+rr(-.1,.1),r:r*.4}],col,{seg:6,cap:true});DEAD.stumps++;},{patch:.4,patchScale:.01,pad:1});
 // the seared edge: dead trees standing, scorched on the scar's side
 BIO.grid(10,0,TERR.R-150,(x,z)=>FIELD.seared(x,z)*.55,(x,y,z)=>{const r=rr(.22,.45),h=rr(12,26),lean=rr(0,.04),d=BLAST.dir(x,z),sv=rng()<.5,col=C3(pick(sv?silver:greys));
   const P=[];for(let k=0;k<=4;k++){const t=k/4;P.push({x:x+d[0]*lean*h*t*t,y:y-.4+(h+.4)*t,z:z+d[1]*lean*h*t*t,r:r*(1-.85*t)+.03});}
   BIO.tube(sv&&THRONE.LIB.silver?'silver':'bark0',P,col,{seg:6,cap:true});
   for(let k=0,n=ri(2,5);k<n;k++){const t=rr(.45,.9),a=rr(0,TAU),p0=[x+d[0]*lean*h*t*t,y+h*t,z+d[1]*lean*h*t*t],L=rr(.6,1.8);
    BIO.beam('rod',p0,[p0[0]+Math.cos(a)*L,p0[1]-L*.25,p0[2]+Math.sin(a)*L],r*.25,.02,col);}
   BIO.register({name:'A dead tree (seared by the blast, standing)',key:'snag',x,z,y:y-1,r:2,h:h+2,tags:{hazard:{kind:'crush',danger:.3,shape:{type:'cyl',r:h*.6,h:h+2},tell:{sign:'a dead tree, rotting at its foot: it falls in the wind'}}}});DEAD.snags++;},{patch:.45,patchScale:.008,pad:3});
 // the direct zone and the plain: pumice blocks; the burnt scrub (card.charred) in the removal and seared zones
 BIO.cur='throne/floor';
 BIO.grid(5,0,TERR.R-150,(x,z)=>FIELD.removal(x,z)*.35+FIELD.seared(x,z)*.45,(x,y,z)=>{const L=THRONE.LIB.cardsOf('charred');if(!L.length)return;const h=rr(.7,1.6);   /* the floor's cardPlant (60), which is local to it */
   BIO.put(pick(L),[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h,h,h],null);DEAD.scrub++;},{patch:.5,patchScale:.015,pad:.8});
 BIO.grid(16,0,TERR.R-150,(x,z)=>FIELD.direct(x,z)*.35+FIELD.floor(x,z)*.25,(x,y,z)=>{const s=rr(.4,2.6);
   BIO.put('boulder',[x,y+s*.2,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s,s*rr(.5,.85),s],C3(pick([0xb8b0a4,0xa8a094,0x8a847a])));DEAD.blocks++;},{patch:.5,patchScale:.02,pad:.5});
 BIO.cur=cur;BIO.kit(prev);_mark('layout');})();
