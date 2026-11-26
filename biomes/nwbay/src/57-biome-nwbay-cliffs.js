// ================================================================= NWBAY — the stacks' cliffs dressed (guilin's way, the bay's plants)
// What makes a karst stack green to its feet (since 2026-10-25, when the stacks became KSTACKS towers: guilin's look): points
// on the towers' walls, in rows ~3.2 m apart up each bed and ~3.4 m round it, kept by a hash against the cover there (thin low
// on the cliff, thick up the dome, and patchy: a noise in the angle and the height, so a stack has bare grey blotches and
// green ones, not stripes), each taking a CUSHION of glossy shrub pressed against the face (two to four clumps near, one far),
// a curtain of LIANA or HANGING EPIPHYTES from a crack, or a ROCK FIG (a small crown on a root that grips the face, its roots
// laced down it). The host hands the rock (KSTACKS records) through NWBAY.buildCliffs(bodies, {floor}); every point is
// drawn from its own stream (a hash of the body, the bed, the row and the column), so the dressing does not depend on what
// came before it. Guilin's cliff points (biomes/guilin/src/46-biome-guilin-layout.js, cliffPoints) are the model.
(function(){const {TAU,clamp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing}=BIO.fn;
const KS=KSTACKS,KR=KRAND,PAL=NWBAY.PAL,C=h=>new (BIO.host.THREE.Color)(h);const {bright,vary}=BIO.col;
function cover(B,a,y){return KR.fbm(Math.cos(a)*1.7+20,Math.sin(a)*1.7+20+(y||0)*.012,2,2,B.seed+53);}
// the points: {id, x, y, z, nx, nz, up (0..1 how high on its stack), kind 'scrub' | 'vine' | 'fig', s (size)}
NWBAY.cliffPoints=function(bodies,floor){const out=[];
 bodies.forEach(B=>{const span=Math.max(1,B.top-B.y0);
  B.beds.forEach((b,k)=>{const per=TAU*Math.max(b.rx,b.rz)*(1+(b.tp==null?1:b.tp))/2,rows=Math.max(1,Math.round(b.h/3.2)),n=Math.max(12,Math.round(per/3.4));
   for(let r=0;r<rows;r++)for(let i=0;i<n;i++){const h=KR.hash(B.seed,k,r*1024+i,0xC1F),p=KR.unit(h),a=(i+.5*KR.unit(KR.hash(h,1)))/n*TAU,uu=(r+.15+.7*KR.unit(KR.hash(h,2)))/rows;
    const y=b.y+uu*b.h,up=clamp((y-B.y0)/span,0,1),cv=cover(B,a,y);
    const keep=(.22+.6*Math.pow(up,1.1))*(.2+1.0*smooth(.36,.6,cv));if(p>=keep)continue;
    const q=KR.unit(KR.hash(h,3)),kind=q<.04?'fig':q<.16&&up>.15?'vine':'scrub';
    const w=KS.wall(B,b,a,uu);if(w.y<Math.max(.6,floor(w.x,w.z)+1.2))continue;   // not under the sea nor in the ground at the foot
    out.push({id:B.id+'/c'+k+'.'+r+'.'+i,x:w.x,y:w.y,z:w.z,nx:w.nx,nz:w.nz,up,kind,s:.6+.9*KR.unit(KR.hash(h,4))});}});});
 return out;};
NWBAY.buildCliffs=function(bodies,o){o=o||{};const R=o.R==null?2400:o.R,q=o.q==null?1:o.q,floor=o.floor||((x,z)=>BIO.terrainH(x,z));
 const L=BIO.radii(),st={points:0,scrub:0,vines:0,figs:0},lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.hero?2:d<L.mid?1:0;};
 const clumpAt=NWBAY.clumpAt,SC=PAL.mangrove,FIG=NWBAY.byKey.clifffig;
 const P=NWBAY.cliffPoints(bodies,floor);st.points=P.length;NWBAY.CLIFF=P;
 P.forEach(p=>{if(Math.hypot(p.x,p.z)>R+200)return;reseed(KR.hash(0xC11F,KR.hash(p.x*8|0,p.z*8|0,p.y*8|0)));if(q<1&&rng()>q)return;
  const lv=lvOf(p.x,p.z),nx=p.nx,nz=p.nz,ux=-nz,uz=nx;
  if(p.kind==='scrub'){if(o.skin!==0&&BIO.field('karst',p.x-nx*1.5,p.z-nz*1.5)>=.97){st.skinned=(st.skinned||0)+1;return;}   /* on a dome's bed the skin (below) covers it */
   const n=lv===2?ri(2,4):lv===1?2:1,sz=(lv===0?4.2:3.1)*p.s*(.75+.6*p.up);
   for(let k=0;k<n;k++){const t=rr(-1,1),x=p.x+nx*sz*.35+ux*t*sz*.6,z=p.z+nz*sz*.35+uz*t*sz*.6,y=p.y+rr(-.6,.6)*sz;
    clumpAt('glossy',x,y,z,sz*rr(.8,1.2),.62,C(pick(rng()<.7?SC:PAL.moss)),p.x-nx*sz,p.y,p.z-nz*sz,sz*1.4,sz);st.scrub++;}
   if(lv===2&&rng()<.5){BIO.put('mossmat',[p.x+nx*.1,p.y-.3,p.z+nz*.1],qFacing([nx,.3,nz]),rr(1,2.2),bright(vary(pick(PAL.moss),.03,.1,.06),.95));}}
  else if(p.kind==='vine'){if(lv===0&&rng()<.5)return;const len=rr(5,14)*p.s,gy=floor(p.x+nx*2,p.z+nz*2),L2=Math.min(len,p.y-Math.max(gy,0)-.5);if(L2<1)return;
   const item=rng()<.6?'liana':'epihang';
   BIO.put(item,[p.x+nx*.3,p.y+.3,p.z+nz*.3],qFacing([nx,0,nz]),[rr(1.4,2.6)*p.s,L2,1],bright(vary(pick(PAL.vine),.03,.1,.06),1.1));st.vines++;}
  else{const sz=2.2+2*p.s,cx=p.x+nx*sz*.6,cz=p.z+nz*sz*.6;
   if(lv>0){const roots=lv===2?ri(3,6):2;for(let r=0;r<roots;r++){const off=rr(-1.2,1.2),drop=rr(5,16),pts=[];
     for(let i=0;i<=4;i++){const t=i/4,x0=p.x+nx*.25+ux*(off+rr(-.3,.3)*t),z0=p.z+nz*.25+uz*(off+rr(-.3,.3)*t),y0=p.y-drop*t,w=i&&NWBAY._onRock?NWBAY._onRock(x0,z0,y0,mix(.12,.04,t)+.08):null;pts.push({x:w?w[0]:x0,y:y0,z:w?w[1]:z0,r:mix(.12,.04,t)});}   /* laced down the face, on the rock (55 onRock) */
     BIO.tube('root',pts,NWBAY.tint(0x6a5a48,NWBAY.means().bark[2],.25),{seg:3});   /* rendered as before the root canvas was lifted (its old linear mean ~.25) */}}
   for(let k=0,n=lv===2?ri(5,9):lv===1?3:1;k<n;k++){const a=rr(0,TAU),r=sz*rr(.1,.6);
    clumpAt('glossy',cx+Math.cos(a)*r,p.y+rr(-.4,1.2),cz+Math.sin(a)*r,sz*rr(.45,.6),.65,C(pick(FIG?FIG.leaf:SC)),cx,p.y,cz,sz,sz*.6);}
   st.figs++;}});
 // THE DOME'S SKIN (guilin's 57, the bay's plants): a cushion every few metres over each tower's dome and cap (the karst
 // field's 1: a bed whose wall leans in under steep 2.75, or a cap in from its rim), under the fan-crowns and the figs, so no
 // bare rock shows between the trees: from afar a stack is a green dome on a grey cliff. Glossy shrub (the mangrove's
 // blue-green and the fig's green), pressed to the slope; one stream per stack (a hash of its seed), drawn after every
 // tree pass, so nothing else moved. o.skin scales the count (1).
 const sk=o.skin==null?1:o.skin,GL=PAL.glossy||SC;st.skin=0;
 if(sk>0)bodies.forEach(B=>{if(Math.hypot(B.x,B.z)>R+200)return;reseed(KR.hash(0x5C1D,B.seed));
  BIO.grid(3.4,0,R,(x,z)=>BIO.field('karst',x,z)<.97?0:.92*q*sk,(x,y,z)=>{const lv=lvOf(x,z);if(lv===0&&rng()<.5)return;
   const sz=rr(3.2,4.6)*(lv===0?1.45:lv===1?1.15:1),n=lv===2?2:1;
   for(let k=0;k<n;k++){const xx=x+rr(-.9,.9),zz=z+rr(-.9,.9),y2=k?BIO.terrainH(xx,zz):y;
    clumpAt('glossy',xx,y2+sz*.12,zz,sz*rr(.85,1.15),.5,C(pick(rng()<.55?SC:GL)),xx,y2-sz,zz,sz*1.6,sz);st.skin++;}},
   {box:[B.x-B.R,B.z-B.R,B.x+B.R,B.z+B.R],patch:.35,patchScale:.03});});
 return {cliffs:st};};
})();
