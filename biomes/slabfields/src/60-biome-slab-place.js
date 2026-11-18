// ================================================================= THE SLABFIELDS — placement (PLAN.md sections 6 and 9)
// SLAB.buildApron(R, q, o): the apron's life on a station's ground, every cell seeded from KRAND.cell(seed, ix, iz) (never from how many draws came
// before it). o.keep(x, z) 0 where the host keeps the ground bare; o.blocks the host's block surfaces [{x, z, y, r}] for the lichen (each a disc on
// a block's top, from KSTACKS' records). Reads the fields wet, rock, slope, cold, shade, apron (BIO.field). Returns the counts.
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=SLAB.C,PAL=SLAB.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
SLAB.buildApron=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;
 const st={ferns:0,reeds:0,grass:0,lichen:0},seed=KRAND.child(1000513,'slabfields/apron'),keep=o.keep||(()=>1);
 const F=n=>(x,z)=>BIO.field(n,x,z),wet=F('wet'),rock=F('rock'),slope=F('slope'),cold=F('cold'),shade=F('shade'),apron=F('apron');
 const Lv=BIO.LOD(),c0=BIO.center();
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 // VOID FERN: the blocks' shade and the apron's damp hollows, never on the steeps
 cellPass(2.5,1,Lv.floor[1]*1.2,(x,y,z,lv)=>{const a=smooth(.2,.6,shade(x,z))*smooth(.15,.4,wet(x,z))*(1-smooth(.55,.8,slope(x,z)))*.9*q;if(rng()>a)return;
  const n=lv===2?ri(2,4):1;for(let k=0;k<n;k++){const an=rr(0,TAU),d=k?rr(.3,.9):0,px=x+Math.cos(an)*d,pz=z+Math.sin(an)*d;if(BIO.mask(px,pz)<=0)continue;const s=rr(.35,.75);
   BIO.put('slfern',[px,Y(px,pz)-.03,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(.8,1.1),s],pickC(PAL.fern,.03));st.ferns++;}});
 // SEEP REED: the spring line's wet ground, off the water itself (the host's mask) and off the rubble
 cellPass(1.8,2,Lv.mid,(x,y,z,lv)=>{const a=smooth(.55,.8,wet(x,z))*(1-smooth(.3,.7,apron(x,z)))*(1-smooth(.4,.7,slope(x,z)))*q;if(rng()>a)return;
  const n=lv===2?ri(3,7):lv===1?2:1;for(let k=0;k<n;k++){const an=rr(0,TAU),d=k?rr(.2,.8):0,px=x+Math.cos(an)*d,pz=z+Math.sin(an)*d;if(BIO.mask(px,pz)<=0)continue;const s=rr(.5,.9);
   BIO.put('slreed',[px,Y(px,pz)-.05,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*rr(1.4,2),s],pickC(PAL.reed,.03));st.reeds++;}});
 // BENCH BUNCHGRASS: the dry ground; thin on the rubble, gone on the steeps and in the cold
 cellPass(3,3,Lv.floor[1],(x,y,z,lv)=>{const a=.55*(1-.75*smooth(.2,.7,apron(x,z)))*(1-smooth(.35,.65,rock(x,z)))*(1-.7*smooth(.7,1,cold(x,z)))*(1-smooth(.6,.85,wet(x,z)))*q;if(rng()>a)return;
  const s=rr(.25,.55);BIO.put('slgrass',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.3),s],pickC(PAL.grass,.03));st.grass++;});
 // BLOCK LICHEN: rosettes on the blocks' tops (the host's discs) and on the apron's rubble
 const blocks=o.blocks||[];blocks.forEach((b,bi)=>{reseed(KRAND.hash(seed,bi,9));const n=Math.round(clamp(b.r*b.r*.06,6,140)*q);
  for(let k=0;k<n;k++){const an=rr(0,TAU),d=Math.sqrt(rng())*b.r*.85,px=b.x+Math.cos(an)*d,pz=b.z+Math.sin(an)*d,py=Y(px,pz);if(py<b.y-1)continue;const s=rr(.12,.5);
   BIO.put('sllichen',[px,py+.01,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s,s],pickC(PAL.lichen,.04));st.lichen++;}});
 cellPass(4,4,Lv.floor[0]*1.5,(x,y,z,lv)=>{const a=.6*smooth(.3,.7,apron(x,z))*(1-smooth(.6,.85,slope(x,z)))*q;if(rng()>a)return;const s=rr(.1,.35);
  BIO.put('sllichen',[x,y+.02,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s,s,s],pickC(PAL.lichen,.04));st.lichen++;});
 return st;};
})();
