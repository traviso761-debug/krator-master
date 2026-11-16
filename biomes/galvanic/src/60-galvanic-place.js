// ================================================================= GALVANIC — placement (PLAN.md sections 7 and 12)
// GALV.place(R, q, o): the battery's life on a host's ground, every cell seeded from KRAND.cell(seed, ix, iz) or KRAND.hash(seed, i, k, salt) (never from
// how many draws came before it). The host gives:
//   o.ph(x, z)       the pH of the ground's water (GALV_PHYS.stream on the streams, the mounds' springs, the strand's own pores)
//   o.flood(x, z)    the days a year the ground lies under the sea (GALV_PHYS.floodDays); life keeps above the store's 60 days
//   o.store(x, z)    the store jar's state there on the page's day ({alive, charge}: GALV_PHYS.store)
//   o.streams        [{F (polyFrame: at, point, L), w, tread(s) -> {y, w} | null, bed0(s), name}]: masts in the water, reefs on the terraces
//   o.mounds         [{x, z, r, h}]: the runners radiate from their feet
//   o.deep           {x, z, r}: reefs round the rim
//   o.keep(x, z)     0 where the host keeps the ground bare (the hills past the acid)
// Reads the fields rock and slope (BIO.field). Writes GALV.PLACED: [kind, x, y, z, live] for every mast, reef and jar (the probe's invariants).
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=GALV.C,PAL=GALV.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
const LIVE_DAYS=60;   /* the store's capacity (GALV_PHYS.store): no living skin below the line a 60-day flood reaches */
GALV.PLACED=[];
GALV.place=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;
 const st={crusts:0,crustsDead:0,runners:0,runnerSegs:0,masts:0,mastsDead:0,reefs:0,reefsDead:0,jars:0,jarsSpent:0},P=GALV.PLACED;P.length=0;
 const seed=KRAND.child(1000043,'galvanic/strand'),keep=o.keep||(()=>1),ph=o.ph||(()=>6.5),flood=o.flood||(()=>0),store=o.store||(()=>({alive:true,charge:1}));
 const rock=(x,z)=>BIO.field('rock',x,z),Lv=BIO.LOD(),c0=BIO.center();
 const acidK=(x,z)=>smooth(4.6,3.4,ph(x,z));   /* 0 where the water is past pH 4.6 (the minerals passivate: GALV_PHYS.cell), 1 under 3.4 */
 const live=(x,z)=>flood(x,z)<=LIVE_DAYS;
 const SPACE=KSPACE.create({cell:8});
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const inBand=(x,z)=>{const d=flood(x,z);return d>0&&d<=LIVE_DAYS;};
 // a runner: a sulfur cord laid over the mud from (x, z) on heading a, `n` segments of ~1.6 m, wandering; jars along it where the flood line asks
 const lay=(x,z,a,n,r,bud)=>{let segs=0;const alive=live(x,z),col=pickC(alive?PAL.sulfur:PAL.sulfurDead,.03);
  for(let k=0;k<n;k++){const L=rr(1.2,2),x1=x+Math.cos(a)*L,z1=z+Math.sin(a)*L;if(BIO.mask(x1,z1)<=0||keep(x1,z1)<=0||rock(x1,z1)>.6)break;
   const y0=Y(x,z),y1=Y(x1,z1),dy=y1-y0,len=Math.hypot(L,dy),pitch=Math.atan2(dy,L);
   /* the stalk grows along +y: tip it over onto the heading (yaw -a about +y, then -pi/2 + pitch about z) */
   BIO.put('gvrunner',[x,y0+r*.6,z],qEuler(0,-a,-Math.PI/2+pitch),[r,len,r],col);segs++;
   if(bud&&inBand(x1,z1)&&rng()<.22){const S=store(x1,z1),s=rr(.12,.3)*(S.alive?1:.8),taut=S.alive?.55+.45*S.charge:.4;
    BIO.put('gvjar',[x1,Y(x1,z1)-.01,z1],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*taut,s],pickC(S.alive&&S.charge>.3?PAL.jar:PAL.jarSpent,.02));
    P.push(['jar',x1,Y(x1,z1),z1,S.alive?1:0]);st.jars++;if(!S.alive||S.charge<.3)st.jarsSpent++;}
   x=x1;z=z1;a+=rr(-.35,.35);}
  st.runners++;st.runnerSegs+=segs;};
 // RUNNERS from the mounds' feet out over the mud; and short ones on the acid mud between (the contact lines' bundles)
 (o.mounds||[]).forEach((M,mi)=>{reseed(KRAND.hash(seed,mi,1,0x51));const n=Math.round(ri(10,22)*q);
  for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.2,.2),x=M.x+Math.cos(a)*M.r*rr(.95,1.15),z=M.z+Math.sin(a)*M.r*rr(.95,1.15);if(BIO.lodD(x,z)>Lv.floor[1])continue;
   lay(x,z,a+rr(-.3,.3),ri(5,30),rr(.012,.03),inBand(x,z));}});
 cellPass(14,3,Lv.floor[1],(x,y,z,lv)=>{const a=acidK(x,z)*(1-smooth(.3,.6,rock(x,z)))*.25*q;if(rng()>a||BIO.waterH(x,z)>y-.05)return;
  const n=lv===2?ri(2,4):1;for(let k=0;k<n;k++)lay(x+rr(-3,3),z+rr(-3,3),rr(0,TAU),ri(2,8),rr(.01,.022),inBand(x,z));});
 // THE FLOOD LINE: bundles of runners and their jars wherever the sea lies 1-60 days a year (the store's job), on the acid mud
 cellPass(6,4,Lv.floor[1]*1.2,(x,y,z,lv)=>{if(!inBand(x,z)||BIO.waterH(x,z)>y-.03)return;const a=acidK(x,z)*.6*q;if(rng()>a)return;
  lay(x,z,rr(0,TAU),ri(2,6),rr(.012,.026),true);});
 // WIRE CRUST: on the acid mud, densest near the mounds and the streams; grey and dead under the flood line
 cellPass(6,5,Lv.floor[1],(x,y,z,lv)=>{const a=acidK(x,z)*(1-smooth(.35,.65,rock(x,z)))*.45*q;if(rng()>a)return;const w=BIO.waterH(x,z);if(w>y+.05)return;
  const L=live(x,z),n=lv===2?ri(1,3):1;if(lv===0&&rng()<.5)return;
  for(let k=0;k<n;k++){const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2),s=rr(.25,1.1);if(BIO.mask(px,pz)<=0)continue;
   const c=L?(rng()<.25?pickC(PAL.crustLive,.03):pickC(PAL.crust,.02)):pickC(PAL.crustDead,.02);
   BIO.put('gvcrust',[px,Y(px,pz)+.004,pz],qEuler(0,rr(0,TAU),0),[s,1,s*rr(.6,1)],c);if(L)st.crusts++;else st.crustsDead++;}});
 // MASTS: standing in the streams' water (pH under 4), tallest where the water is deepest over the bed; stumps under the flood line
 (o.streams||[]).forEach((S,si)=>{for(let s=4,k=0;s<S.F.L;s+=1.1,k++){reseed(KRAND.hash(seed,si,k,0x6a));const p=S.F.point(s);if(BIO.lodD(p[0],p[1])>Lv.floor[1]*1.2)continue;
   const t=S.tread(s),hw=t?t.w/2-.6:S.w/2-.6;if(ph(p[0],p[1])>=4)continue;
   const dead=!live(p[0],p[1]),n=t?(rng()<.25?1:0):dead?(rng()<.25?1:0):(rng()<.8*q?ri(1,3):0);
   const g=S.F.seg.find(g=>s>=g.s0&&s<=g.s0+g.L)||S.F.seg[0];
   for(let j=0;j<n;j++){const off=rr(-hw,hw),xx=p[0]+g.uz*off+rr(-.3,.3),zz=p[1]-g.ux*off+rr(-.3,.3);
    const L=live(xx,zz),w=BIO.waterH(xx,zz),y=Y(xx,zz);if(!(w>y))continue;const h=L?rr(.25,1.4):rr(.08,.3),r=rr(.8,1.4);
    BIO.put('gvmast',[xx,y-.02,zz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[r,h,r],pickC(L?PAL.mast:PAL.reefDead,.03));
    if(L)BIO.put('gvfrill',[xx,y+h*.98,zz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[.16*r,.16*r,.16*r],pickC(PAL.frill,.02));
    P.push(['mast',xx,y,zz,L?1:0]);if(L)st.masts++;else st.mastsDead++;}}});
 // REEFS: on the terraces (the stream's treads and their rims), at the mounds' acid moats, round the Deep's rim; spaced (core/space)
 const reef=(x,z,smax,why)=>{const s=rr(.5,smax);if(SPACE.some(x,z,s*1.1,()=>true))return;const y=Y(x,z),L=live(x,z),w=BIO.waterH(x,z);
  BIO.put('gvreef',[x,Math.min(y,w>-1e8?w:y)-.15*s,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*rr(.6,1.2),s*rr(.8,1.1)],pickC(L?PAL.reef:PAL.reefDead,.03));
  SPACE.insert({x,z,s},x,z,s);P.push(['reef',x,y,z,L?1:0,why]);if(L)st.reefs++;else st.reefsDead++;};
 (o.streams||[]).forEach((S,si)=>{S.T.forEach((t,ti)=>{reseed(KRAND.hash(seed,si,ti,0x7e));const n=Math.round(ri(1,4)*q);
  for(let k=0;k<n;k++){const s=rr(t.s0,t.s1),p=S.F.point(s);if(BIO.lodD(p[0],p[1])>Lv.mid)continue;const off=(rng()<.5?-1:1)*rr(0,t.w/2+1.5);
   const g=S.F.seg.find(g=>s>=g.s0&&s<=g.s0+g.L)||S.F.seg[0];reef(p[0]+g.uz*off,p[1]-g.ux*off,rr(.8,2.6),'terrace');}});});
 (o.mounds||[]).forEach((M,mi)=>{reseed(KRAND.hash(seed,mi,2,0x7f));const n=Math.round(ri(3,9)*q);for(let k=0;k<n;k++){const a=rr(0,TAU),d=M.r*rr(1.02,1.2);reef(M.x+Math.cos(a)*d,M.z+Math.sin(a)*d,1.8,'moat');}});
 if(o.deep){const D=o.deep;reseed(KRAND.hash(seed,0,3,0x80));const n=Math.round(60*q);for(let k=0;k<n;k++){const a=rr(0,TAU),d=D.r*rr(.97,1.08),x=D.x+Math.cos(a)*d,z=D.z+Math.sin(a)*d;if(BIO.lodD(x,z)<Lv.mid)reef(x,z,3,'deep');}}
 return st;};
})();
