// ================================================================= GUILIN — the cliffs' dressing (scrub, rock figs, stone orchids, creepers)
// What makes a karst tower green to its feet: the layout's cliff points (46: GUILIN.CLIFF, records on the towers' walls)
// each take a cushion of CLIFF SCRUB pressed against the face (two to four clumps near, one far), a ROCK FIG (a small
// crown on a root that grips the face, its roots laced down it), a STONE ORCHID (the medicinal plant: a fan of canes,
// white and pink sprays) or a curtain of CREEPER; the stone forest's blades carry orchids only. DRAPES (46) hang creepers
// off the fengcong base's lip. THE DOME'S SKIN: shrubs packed over the towers' domes and caps (46's slope and crown
// zones) under the oaks and pines, so no soil shows between the trees: from afar a tower is a green dome on a grey cliff.
// Every point is drawn from its own stream (a hash of its id), so the dressing does not depend on what came before it.
(function(){const {TAU,clamp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;const qEuler=GUILIN.qEuler;
const PAL=GUILIN.PAL,C=GUILIN.C;const {bright,vary}=BIO.col;
const lc=(slot,set,k)=>GUILIN.libCol(slot,GUILIN.leafCol(set,k));
const idHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
GUILIN.buildCliffs=function(R,q){q=q==null?1:q;R=R==null?1500:R;const L=BIO.radii(),st={scrub:0,figs:0,orchids:0,blooms:0,vines:0,skin:0};
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.hero?2:d<L.mid?1:0;};
 GUILIN.CLIFF.forEach(P=>{if(Math.hypot(P.x,P.z)>R+200)return;reseed(KRAND.hash(0xC11F,idHash(P.id)));if(q<1&&rng()>q)return;const lv=lvOf(P.x,P.z),nx=P.nx,nz=P.nz;
  if(P.kind==='scrub'){const n=lv===2?ri(2,4):lv===1?2:1,sz=(lv===0?4.2:3.1)*P.s*(.75+.6*P.up);
   for(let k=0;k<n;k++){const t=rr(-1,1),ux=-nz,uz=nx,x=P.x+nx*sz*.35+ux*t*sz*.6,z=P.z+nz*sz*.35+uz*t*sz*.6,y=P.y+rr(-.6,.6)*sz;
    BIO.put('scrub',[x,y,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[sz*rr(.8,1.2),sz*rr(.55,.8),sz*rr(.8,1.2)],lc('scrub',P.up>.5||rng()<.7?PAL.scrub:PAL.scrubDry,1.3),{n:[nx*.45,.85,nz*.45]});st.scrub++;}}
  else if(P.kind==='fig'){const sz=2.2+2*P.s,cx=P.x+nx*sz*.6,cz=P.z+nz*sz*.6,bc=bright(pick(PAL.banyanBark),1);
   if(lv>0){const roots=lv===2?ri(3,6):2;for(let r=0;r<roots;r++){const off=rr(-1.2,1.2),ux=-nz,uz=nx,drop=rr(5,16),pts=[];
     for(let i=0;i<=4;i++){const t=i/4;pts.push({x:P.x+nx*.25+ux*(off+rr(-.3,.3)*t),y:P.y-drop*t,z:P.z+nz*.25+uz*(off+rr(-.3,.3)*t),r:mix(.12,.04,t)});}
     BIO.tube('bark.fig',pts,bc,{seg:3});}}
   for(let k=0,n=lv===2?ri(5,9):lv===1?3:1;k<n;k++){const a=rr(0,TAU),r=sz*rr(.1,.6);
    GUILIN.clumpAt('figleaf',cx+Math.cos(a)*r,P.y+rr(-.4,1.2),cz+Math.sin(a)*r,sz*rr(.45,.6),.65,lc('figleaf',PAL.banyan,1.15),cx,P.y,cz,sz,sz*.6);}
   st.figs++;}
  else if(P.kind==='vine'){if(lv===0&&rng()<.5)return;const w=rr(2,3.6)*P.s,len=rr(5,14)*P.s,gy=BIO.terrainH(P.x+nx*2,P.z+nz*2),L2=Math.min(len,P.y-gy-.5);if(L2<1)return;
   BIO.put('vine',[P.x+nx*.3,P.y+.3,P.z+nz*.3],qEuler(0,Math.atan2(nx,nz),0),[w,L2,1],lc('vine',PAL.vine,1.15));st.vines++;}
  else{const sz=.55+.5*P.s;BIO.put('orchid',[P.x+nx*.12,P.y-.1,P.z+nz*.12],qEuler(.35+rr(-.15,.15),Math.atan2(nx,nz),rr(-.2,.2)),[sz,sz,sz],lc('orchid',PAL.orchid,1.15));st.orchids++;
   if(lv===2&&rng()<.6)for(let f=0,nf=ri(3,7);f<nf;f++){BIO.put('orchidbloom',[P.x+nx*(.2+rr(0,.3))+rr(-.2,.2),P.y+sz*rr(.4,.9),P.z+nz*(.2+rr(0,.3))+rr(-.2,.2)],qEuler(rr(-.5,.5),rr(0,TAU),0),rr(.05,.08),GUILIN.libCol('bloom',pick(PAL.orchidFlower)));st.blooms++;}}});
 GUILIN.DRAPES.forEach(P=>{if(Math.hypot(P.x,P.z)>R+200)return;reseed(KRAND.hash(0xD4A9,idHash(P.id)));if(q<1&&rng()>q)return;const lv=lvOf(P.x,P.z);if(lv===0&&rng()<.5)return;
  const n=lv===2?ri(2,4):1;for(let k=0;k<n;k++){const ux=-P.nz,uz=P.nx,t=rr(-2,2),w=rr(1.6,3.2),len=P.len*rr(.6,1.1),gy=BIO.terrainH(P.x+P.nx*2,P.z+P.nz*2);
   const L2=Math.min(len,P.y-gy-.5);if(L2<1)continue;
   BIO.put('vine',[P.x+P.nx*.35+ux*t,P.y+.3,P.z+P.nz*.35+uz*t],qEuler(0,Math.atan2(P.nx,P.nz),0),[w,L2,1],lc('vine',PAL.vine,1.1));st.vines++;}});
 // THE DOME'S SKIN: a cushion every few metres over the domes' slopes and the caps (not the rims), bigger far off
 GUILIN.place(3.2,401,(x,z,Z)=>(Z.zone==='slope'?.9:Z.zone==='crown'?.75*smooth(-2.5,-4,Z.d):Z.zone==='ledge'?.5:0)*q,(x,y,z,Z)=>{const lv=lvOf(x,z);if(lv===0&&rng()<.45)return;
  const sz=rr(3.2,4.8)*(lv===0?1.5:1);BIO.put('scrub',[x,y+sz*.15,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[sz,sz*rr(.5,.7),sz],lc('scrub',PAL.scrub,1.3),{n:[0,1,0]});st.skin++;},{R});
 return{cliffs:st};};
})();
